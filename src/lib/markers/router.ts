import type { Filter } from 'mongodb';
import { Router } from 'express';
import { mapFilters } from '../../app/components/MapFilter/mapFilters';
import { getMarkersCollection } from './collection';
import { Double, ObjectId } from 'mongodb';
import type { MarkerDTO } from './types';
import fs from 'fs/promises';
import { postToDiscord } from '../discord';
import { getCommentsCollection } from '../comments/collection';
import type { CommentDTO } from '../comments/types';
import { SCREENSHOTS_PATH } from '../env';
import { getScreenshotsCollection } from '../screenshots/collection';
import { ensureAuthenticated } from '../auth/middlewares';
import type { AccountDTO } from '../auth/types';

const markersRouter = Router();

const MAX_NAME_LENGTH = 50;
const MAX_DESCRIPTION_LENGTH = 200;

markersRouter.get('/', async (req, res, next) => {
  try {
    const account = req.account;
    const query: Filter<MarkerDTO> = account
      ? {
          $or: [{ isPrivate: { $ne: true } }, { userId: account.steamId }],
        }
      : {
          isPrivate: { $ne: true },
        };

    const markers = await getMarkersCollection()
      .find(query, {
        projection: {
          description: 0,
          userId: 0,
          username: 0,
          screenshotFilename: 0,
          createdAt: 0,
          isPrivate: 0,
        },
      })
      .toArray();
    res.status(200).json(markers);
  } catch (error) {
    next(error);
  }
});

markersRouter.get('/:markerId', async (req, res, next) => {
  try {
    const account = req.account;
    const { markerId } = req.params;
    if (!ObjectId.isValid(markerId)) {
      res.status(400).send('Invalid payload');
      return;
    }
    const query: Filter<MarkerDTO> = account
      ? {
          $or: [{ isPrivate: { $ne: true } }, { userId: account.steamId }],
        }
      : {
          isPrivate: { $ne: true },
        };
    query._id = new ObjectId(markerId);
    const marker = await getMarkersCollection().findOne(query);
    const comments = await getCommentsCollection()
      .find({ markerId: new ObjectId(markerId) })
      .sort({ createdAt: -1 })
      .toArray();
    res.status(200).json({ marker, comments });
  } catch (error) {
    next(error);
  }
});

markersRouter.delete(
  '/:markerId',
  ensureAuthenticated,
  async (req, res, next) => {
    try {
      const account = req.account!;
      const { markerId } = req.params;

      if (!ObjectId.isValid(markerId)) {
        res.status(400).send('Invalid payload');
        return;
      }
      const query: Filter<MarkerDTO> = {
        _id: new ObjectId(markerId),
      };
      if (!account.isModerator) {
        query.userId = account.steamId;
      }
      const markerCollection = getMarkersCollection();
      const marker = await markerCollection.findOne(query);
      if (!marker) {
        res.status(404).end(`No marker found for id ${markerId}`);
        return;
      }

      const result = await markerCollection.deleteOne(query);
      if (!result.deletedCount) {
        res.status(404).end(`No marker found for id ${markerId}`);
        return;
      }
      await getCommentsCollection().deleteMany({
        markerId: new ObjectId(markerId),
      });

      if (marker.screenshotFilename) {
        await fs
          .rm(`${SCREENSHOTS_PATH}/${marker.screenshotFilename}`)
          .catch(() =>
            console.warn(
              `Could not remove screenshot ${marker.screenshotFilename}`
            )
          );
        await getScreenshotsCollection().deleteOne({
          filename: marker.screenshotFilename,
        });
      }

      res.status(200).json({});
      postToDiscord(
        `📌💀 Marker from ${marker.username} deleted by ${account.name}`,
        marker.isPrivate
      );
    } catch (error) {
      next(error);
    }
  }
);

markersRouter.patch(
  '/:markerId',
  ensureAuthenticated,
  async (req, res, next) => {
    try {
      const account = req.account!;
      const { markerId } = req.params;

      const marker = await bodyToMarker(req.body, account);
      if (!marker) {
        res.status(400).send('Invalid payload');
        return;
      }

      const query: Filter<MarkerDTO> = {
        _id: new ObjectId(markerId),
      };
      if (!account.isModerator) {
        query.$or = [
          { userId: account.steamId },
          { screenshotFilename: { $exists: false } },
        ];
      }

      const mapFilter = mapFilters.find(
        (filter) => filter.type === marker.type
      );
      if (!mapFilter) {
        res.status(400).send('Invalid filter type');
        return;
      }

      const unset: {
        [K in keyof MarkerDTO]?: 1;
      } = {};
      if (mapFilter.category !== 'chests') {
        unset.chestType = 1;
      }
      if (!mapFilter.hasLevel) {
        unset.level = 1;
      }
      if (!mapFilter.hasName) {
        unset.name = 1;
      }

      marker.isPrivate = mapFilter.category === 'private';
      const result = await getMarkersCollection().findOneAndUpdate(
        query,
        {
          $set: marker,
          $unset: unset,
        },
        { returnDocument: 'after' }
      );
      if (!result.ok) {
        res.status(404).end(`No marker updated for id ${markerId}`);
        return;
      }
      res.status(200).json(result.value);
      const nameType = marker.name
        ? `${marker.type} ${marker.name}`
        : marker.type;
      await postToDiscord(
        `📌 ${nameType} was updated by ${account.name} at [${marker.position}]`,
        !marker.isPrivate
      );
    } catch (error) {
      next(error);
    }
  }
);

markersRouter.post('/', ensureAuthenticated, async (req, res, next) => {
  try {
    const account = req.account!;

    const marker = await bodyToMarker(req.body, account);
    if (!marker) {
      res.status(400).send('Invalid payload');
      return;
    }

    const existingMarker = await getMarkersCollection().findOne({
      type: marker.type,
      position: marker.position,
    });
    if (existingMarker) {
      res.status(409).send('Marker already exists');
      return;
    }
    if (marker.position) {
      const nearByMarker = await getMarkersCollection().findOne({
        type: marker.type,
        position: { $near: marker.position, $maxDistance: 1 },
      });
      if (nearByMarker) {
        res.status(409).send('A similar marker is too close');
        return;
      }
    }

    const mapFilter = mapFilters.find((filter) => filter.type === marker.type);
    if (!mapFilter) {
      res.status(400).send('Invalid filter type');
      return;
    }
    marker.isPrivate = mapFilter.category === 'private';
    const inserted = await getMarkersCollection().insertOne(marker);
    if (!inserted.acknowledged) {
      res.status(500).send('Error inserting marker');
      return;
    }
    res.status(200).json(marker);
    const nameType = marker.name
      ? `${mapFilter.title} ${marker.name}`
      : mapFilter.title;
    await postToDiscord(
      `📌 ${nameType} was added by ${account.name} at [${marker.position}]`,
      !marker.isPrivate
    );
  } catch (error) {
    console.error(`Error creating marker ${JSON.stringify(req.body)}`);
    next(error);
  }
});

markersRouter.post(
  '/:markerId/comments',
  ensureAuthenticated,
  async (req, res, next) => {
    try {
      const account = req.account!;
      const { markerId } = req.params;
      const { message } = req.body;

      if (typeof message !== 'string' || !ObjectId.isValid(markerId)) {
        res.status(400).send('Invalid payload');
        return;
      }

      const comment: CommentDTO = {
        markerId: new ObjectId(markerId),
        userId: account.steamId,
        username: account.name,
        message,
        createdAt: new Date(),
      };

      const marker = await getMarkersCollection().findOne({
        _id: comment.markerId,
      });
      if (!marker) {
        res.status(404).send("Marker doesn't exists");
        return;
      }
      const inserted = await getCommentsCollection().insertOne(comment);
      if (!inserted.acknowledged) {
        res.status(500).send('Error inserting comment');
        return;
      }

      await getMarkersCollection().updateOne(
        { _id: new ObjectId(markerId) },
        {
          $set: {
            comments: await getCommentsCollection()
              .find({ markerId: new ObjectId(markerId) })
              .count(),
          },
        }
      );

      res.status(200).json(comment);
      const position = marker.position ? marker.position.join(', ') : 'unknown';
      await postToDiscord(
        `✍ ${account.name} added a comment for ${marker.type} at [${position}]:\n${comment.message}`,
        !marker.isPrivate
      );
    } catch (error) {
      next(error);
    }
  }
);

async function bodyToMarker(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body: any,
  account: AccountDTO
): Promise<MarkerDTO | false> {
  const {
    type,
    position,
    name,
    level,
    chestType,
    tier,
    description,
    screenshotId,
  } = body;

  if (typeof type !== 'string' || !Array.isArray(position)) {
    return false;
  }
  const marker: MarkerDTO = {
    type,
    userId: account.steamId,
    username: account.name,
    createdAt: new Date(),
    position: position.map((part: number) => new Double(+part.toFixed(2))) as [
      Double,
      Double,
      Double
    ],
  };
  if (!mapFilters.some((filter) => filter.type === marker.type)) {
    return false;
  }
  if (name) {
    marker.name = name.substring(0, MAX_NAME_LENGTH);
  }
  if (level) {
    marker.level = level;
  }
  if (chestType) {
    marker.chestType = chestType;
  }
  if (tier) {
    marker.tier = tier;
  }
  if (description) {
    marker.description = description.substring(0, MAX_DESCRIPTION_LENGTH);
  }
  if (ObjectId.isValid(screenshotId)) {
    const screenshot = await getScreenshotsCollection().findOne({
      _id: new ObjectId(screenshotId),
    });
    if (screenshot) {
      marker.screenshotFilename = screenshot.filename;
    }
  }
  return marker;
}

export default markersRouter;

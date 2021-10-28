import type { Filter } from 'mongodb';
import { Router } from 'express';
import { mapFilters } from '../../app/components/MapFilter/mapFilters';
import { getMarkersCollection } from './collection';
import { Double, ObjectId } from 'mongodb';
import { getUsersCollection } from '../users/collection';
import type { MarkerDTO } from './types';
import fs from 'fs/promises';
import { postToDiscord } from '../discord';
import { getCommentsCollection } from '../comments/collection';
import type { CommentDTO } from '../comments/types';
import { SCREENSHOTS_PATH } from '../env';
import { getScreenshotsCollection } from '../screenshots/collection';
import { isModerator } from '../security';

const markersRouter = Router();

const MAX_NAME_LENGTH = 50;
const MAX_DESCRIPTION_LENGTH = 200;
markersRouter.get('/', async (_req, res, next) => {
  try {
    const markers = await getMarkersCollection()
      .find(
        {},
        {
          projection: {
            description: 0,
            username: 0,
            screenshotFilename: 0,
            createdAt: 0,
          },
        }
      )
      .toArray();
    res.status(200).json(markers);
  } catch (error) {
    next(error);
  }
});

markersRouter.get('/:markerId', async (req, res, next) => {
  try {
    const { markerId } = req.params;
    if (!ObjectId.isValid(markerId)) {
      res.status(400).send('Invalid payload');
      return;
    }
    const marker = await getMarkersCollection().findOne({
      _id: new ObjectId(markerId),
    });
    const comments = await getCommentsCollection()
      .find({ markerId: new ObjectId(markerId) })
      .sort({ createdAt: -1 })
      .toArray();
    res.status(200).json({ marker, comments });
  } catch (error) {
    next(error);
  }
});

markersRouter.delete('/:markerId', async (req, res, next) => {
  try {
    const { secret } = req.query;
    if (!isModerator(secret)) {
      res.status(403).send('💀 no access');
      return;
    }
    const { markerId } = req.params;
    const { userId } = req.body;

    if (!ObjectId.isValid(markerId) || !ObjectId.isValid(userId)) {
      res.status(400).send('Invalid payload');
      return;
    }
    const user = await getUsersCollection().findOne({
      _id: new ObjectId(userId),
    });
    if (!user) {
      res.status(401).send('No access');
      return;
    }
    const query: Filter<MarkerDTO> = {
      _id: new ObjectId(markerId),
    };
    if (!user.isModerator) {
      query.username = user.username;
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
      `📌💀 Marker from ${marker.username} deleted by ${user.username}`
    );
  } catch (error) {
    next(error);
  }
});

markersRouter.patch('/:markerId', async (req, res, next) => {
  try {
    const { markerId } = req.params;
    const { screenshotFilename, screenshotId, userId } = req.body; // screenshotFilename is deprecated and will be removed soon

    if (
      (typeof screenshotFilename !== 'string' &&
        !ObjectId.isValid(screenshotId)) ||
      !ObjectId.isValid(markerId)
    ) {
      res.status(400).send('Invalid payload');
      return;
    }
    let newScreenshotFilename = screenshotFilename;
    if (screenshotId) {
      const screenshot = await getScreenshotsCollection().findOne({
        _id: new ObjectId(screenshotId),
      });
      if (!screenshot) {
        res.status(404).send('Screenshot not found');
        return;
      }
      newScreenshotFilename = screenshot.filename;
    }

    const user = await getUsersCollection().findOne({
      _id: new ObjectId(userId),
    });
    if (!user) {
      res.status(401).send('No access');
      return;
    }
    const query: Filter<MarkerDTO> = {
      _id: new ObjectId(markerId),
    };
    if (!user.isModerator) {
      query.$or = [
        { username: user.username },
        { screenshotFilename: { $exists: false } },
      ];
    }

    const result = await getMarkersCollection().updateOne(query, {
      $set: {
        screenshotFilename: newScreenshotFilename,
      },
    });
    if (!result.modifiedCount) {
      res.status(404).end(`No marker found for id ${markerId}`);
      return;
    }
    res.status(200).json(newScreenshotFilename);
  } catch (error) {
    next(error);
  }
});

markersRouter.post('/', async (req, res, next) => {
  try {
    const { secret } = req.query;
    if (!isModerator(secret)) {
      res.status(403).send('💀 no access');
      return;
    }

    const {
      type,
      position,
      name,
      username,
      level,
      levelRange,
      description,
      screenshotFilename,
      screenshotId,
    } = req.body;

    if (
      typeof type !== 'string' ||
      typeof username !== 'string' ||
      !Array.isArray(position)
    ) {
      res.status(400).send('Invalid payload');
      return;
    }
    const existingUser = await getUsersCollection().findOne({ username });
    if (!existingUser) {
      res.status(400).send('User does not exist');
      return;
    }
    const marker: MarkerDTO = {
      type,
      username,
      createdAt: new Date(),
      position: position.map(
        (part: number) => new Double(+part.toFixed(2))
      ) as [Double, Double, Double],
    };

    if (name) {
      marker.name = name.substring(0, MAX_NAME_LENGTH);
    }
    if (level) {
      marker.level = level;
    }
    if (description) {
      marker.description = description.substring(0, MAX_DESCRIPTION_LENGTH);
    }
    if (screenshotFilename) {
      // Deprecated -> will be removed soon
      marker.screenshotFilename = screenshotFilename;
    } else if (screenshotId) {
      const screenshot = await getScreenshotsCollection().findOne({
        _id: new ObjectId(screenshotId),
      });
      if (!screenshot) {
        res.status(404).send('Screenshot not found');
        return;
      }
      marker.screenshotFilename = screenshot.filename;
    }
    if (levelRange) {
      marker.levelRange = levelRange;
    }

    if (!mapFilters.some((filter) => filter.type === marker.type)) {
      res.status(400).send(`Unknown type ${marker.type}`);
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
        position: { $near: marker.position, $maxDistance: 2 },
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

    const inserted = await getMarkersCollection().insertOne(marker);
    if (!inserted.acknowledged) {
      res.status(500).send('Error inserting marker');
      return;
    }
    res.status(200).json(marker);

    await postToDiscord(
      `📌 ${mapFilter.title} was added by ${marker.username} at [${position}]`
    );
  } catch (error) {
    next(error);
  }
});

markersRouter.post('/:markerId/comments', async (req, res, next) => {
  try {
    const { markerId } = req.params;
    const { username, message } = req.body;

    if (
      typeof username !== 'string' ||
      typeof message !== 'string' ||
      !ObjectId.isValid(markerId)
    ) {
      res.status(400).send('Invalid payload');
      return;
    }

    const comment: CommentDTO = {
      markerId: new ObjectId(markerId),
      username,
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
    const existingUser = await getUsersCollection().findOne({ username });
    if (!existingUser) {
      res.status(400).send('User does not exist');
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
      `✍ ${comment.username} added a comment for ${marker.type} at [${position}]:\n${comment.message}`
    );
  } catch (error) {
    next(error);
  }
});

export default markersRouter;

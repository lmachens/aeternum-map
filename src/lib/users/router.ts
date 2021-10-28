import { Router } from 'express';
import { postToDiscord } from '../discord';
import { getUsersCollection } from './collection';
import { ObjectId } from 'mongodb';

const usersRouter = Router();

const MAX_USERNAME_LENGTH = 50;
usersRouter.post('/', async (req, res, next) => {
  try {
    const { username } = req.body;

    if (typeof username !== 'string' || username.length > MAX_USERNAME_LENGTH) {
      res.status(400).send('Invalid payload');
      return;
    }

    const existingUser = await getUsersCollection().findOne({ username });
    if (existingUser) {
      res.status(200).json(existingUser);
      return;
    }
    const result = await getUsersCollection().findOneAndUpdate(
      { username },
      {
        $setOnInsert: {
          username,
          hiddenMarkerIds: [],
          createdAt: new Date(),
        },
      },
      { upsert: true, returnDocument: 'after' }
    );
    if (result.value) {
      res.status(200).json(result.value);
      postToDiscord(`🤘 ${result.value.username} is using Aeternum Map`, false);
    } else {
      throw new Error('Could not create user');
    }
  } catch (error) {
    next(error);
  }
});

usersRouter.patch('/:username', async (req, res, next) => {
  try {
    const { username } = req.params;
    const { hiddenMarkerIds } = req.body;
    if (!Array.isArray(hiddenMarkerIds)) {
      res.status(400).send('Invalid payload');
      return;
    }
    const hiddenMarkerObjectIds = hiddenMarkerIds.map(
      (markerId: string) => new ObjectId(markerId)
    );

    const result = await getUsersCollection().updateOne(
      { username },
      {
        $set: {
          hiddenMarkerIds: hiddenMarkerObjectIds,
        },
      }
    );
    if (!result.modifiedCount) {
      res.status(400).end(`No change`);
      return;
    }
    res.status(200).json(hiddenMarkerIds);
  } catch (error) {
    next(error);
  }
});

export default usersRouter;

import { Router } from 'express';
import type { Filter } from 'mongodb';
import { ObjectId } from 'mongodb';
import { postToDiscord } from '../discord';
import { getMarkersCollection } from '../markers/collection';
import { isModerator } from '../security';
import { getUsersCollection } from '../users/collection';
import { getCommentsCollection } from './collection';
import type { CommentDTO } from './types';

const commentsRouter = Router();

commentsRouter.delete('/:commentId', async (req, res) => {
  const { secret } = req.query;
  if (!isModerator(secret)) {
    res.status(403).send('💀 no access');
    return;
  }

  const { commentId } = req.params;
  const { userId } = req.body;

  if (!ObjectId.isValid(commentId) || !ObjectId.isValid(userId)) {
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
  const query: Filter<CommentDTO> = {
    _id: new ObjectId(commentId),
  };
  if (!user.isModerator) {
    query.username = user.username;
  }
  const comment = await getCommentsCollection().findOne(query);
  if (!comment) {
    res.status(404).end(`No comment found ${commentId}`);
    return;
  }

  const result = await getCommentsCollection().deleteOne(query);
  if (!result.deletedCount) {
    res.status(404).end(`No comment found ${commentId}`);
    return;
  }

  await getMarkersCollection().updateOne(
    { _id: new ObjectId(comment.markerId) },
    {
      $set: {
        comments: await getCommentsCollection()
          .find({ markerId: new ObjectId(comment.markerId) })
          .count(),
      },
    }
  );

  res.status(200).json({});
  postToDiscord(
    `✍💀 Comment from ${comment.username} deleted by ${user.username}`
  );
});

export default commentsRouter;

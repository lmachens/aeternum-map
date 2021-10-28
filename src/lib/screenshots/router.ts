import { Router } from 'express';
import sharp from 'sharp';
import fs from 'fs/promises';
import multer from 'multer';
import { SCREENSHOTS_PATH } from '../env';
import { getScreenshotsCollection } from './collection';

const screenshotsUpload = multer({ dest: SCREENSHOTS_PATH });

const screenshotsRouter = Router();

screenshotsRouter.post(
  '/',
  screenshotsUpload.single('screenshot'),
  async (req, res, next) => {
    try {
      if (!req.file) {
        res.status(400).send('Invalid payload');
        return;
      }
      const filePath = `${req.file.path}.webp`;
      await sharp(req.file.path).webp().toFile(filePath);
      await fs.rm(req.file.path);

      const screenshot = await getScreenshotsCollection().insertOne({
        filename: `${req.file.filename}.webp`,
        createdAt: new Date(),
      });

      res.json({
        screenshotId: screenshot.insertedId,
        filename: `${req.file.filename}.webp`, // Deprecated -> will be be removed soon
      });
    } catch (error) {
      next(error);
    }
  }
);

export default screenshotsRouter;

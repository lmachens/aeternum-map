import type { Collection, Document } from 'mongodb';
import { getCollection, getDb } from '../db';
import type { ScreenshotDTO } from './types';

export function getScreenshotsCollection(): Collection<ScreenshotDTO> {
  return getCollection<ScreenshotDTO>('screenshots');
}

function ensureScreenshotsIndexes(): Promise<string[]> {
  return getScreenshotsCollection().createIndexes([
    { key: { filename: 1 }, unique: true },
  ]);
}

function ensureScreenshotsSchema(): Promise<Document> {
  return getDb().command({
    collMod: 'screenshots',
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        title: 'Screenshot',
        properties: {
          _id: {
            bsonType: 'objectId',
          },
          filename: {
            bsonType: 'string',
          },
          createdAt: {
            bsonType: 'date',
          },
        },
        additionalProperties: false,
        required: ['filename', 'createdAt'],
      },
    },
  });
}

export function initScreenshotsCollection(): Promise<[string[], Document]> {
  return Promise.all([ensureScreenshotsIndexes(), ensureScreenshotsSchema()]);
}

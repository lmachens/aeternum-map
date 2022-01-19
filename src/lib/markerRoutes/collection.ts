import type { Collection, Document } from 'mongodb';
import { getCollection, getDb } from '../db';
import type { MarkerRouteDTO } from './types';

export function getMarkerRoutesCollection(): Collection<MarkerRouteDTO> {
  return getCollection<MarkerRouteDTO>('marker-routes');
}

function ensureMarkerRoutesIndexes(): Promise<string[]> {
  return getMarkerRoutesCollection().createIndexes([
    { key: { username: 1, name: 1 }, unique: true },
    { key: { isPublic: 1 } },
    { key: { username: 1 } },
    { key: { userId: 1 } },
  ]);
}

function ensureMarkerRoutesSchema(): Promise<Document> {
  return getDb().command({
    collMod: 'marker-routes',
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        title: 'Marker Route',
        properties: {
          _id: {
            bsonType: 'objectId',
          },
          name: {
            bsonType: 'string',
          },
          map: {
            bsonType: 'string',
          },
          userId: {
            bsonType: 'string',
          },
          username: {
            bsonType: 'string',
          },
          isPublic: {
            bsonType: 'bool',
          },
          favorites: {
            bsonType: 'int',
          },
          forks: {
            bsonType: 'int',
          },
          origin: {
            bsonType: 'objectId',
          },
          positions: {
            bsonType: 'array',
            items: {
              bsonType: 'array',
              items: {
                bsonType: 'double',
              },
            },
          },
          regions: {
            bsonType: 'array',
            items: {
              bsonType: 'string',
            },
          },
          markersByType: {
            bsonType: 'object',
          },
          createdAt: {
            bsonType: 'date',
          },
          updatedAt: {
            bsonType: 'date',
          },
        },
        additionalProperties: false,
        required: [
          'name',
          'userId',
          'username',
          'positions',
          'isPublic',
          'markersByType',
          'createdAt',
        ],
      },
    },
  });
}

export function initMarkerRoutesCollection(): Promise<[string[], Document]> {
  return Promise.all([ensureMarkerRoutesIndexes(), ensureMarkerRoutesSchema()]);
}

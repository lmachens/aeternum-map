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
          username: {
            bsonType: 'string',
          },
          isPublic: {
            bsonType: 'bool',
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
          markersByType: {
            bsonType: 'object',
          },
          createdAt: {
            bsonType: 'date',
          },
        },
        additionalProperties: false,
        required: [
          'name',
          'username',
          'positions',
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

import type { Double, ObjectId } from 'mongodb';

export type MarkerRouteDTO = {
  name: string;
  map?: string;
  userId: string;
  username: string;
  isPublic: boolean;
  positions: [Double, Double][];
  regions: string[];
  markersByType: {
    [type: string]: number;
  };
  favorites?: number;
  forks?: number;
  origin?: ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

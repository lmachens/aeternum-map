import type { LatLngExpression } from 'leaflet';

export type Map = {
  name: string;
  title: string;
  folder: string;
  maxZoom: number;
  minZoom: number;
  maxBounds: LatLngExpression[];
};

export const DEFAULT_MAP_NAME = 'NewWorld_VitaeEterna';

export const mapDetails: Map[] = [
  {
    name: 'NewWorld_VitaeEterna',
    title: 'Aeternum',
    folder: 'map',
    maxZoom: 6,
    minZoom: 0,
    maxBounds: [
      [-10000, -7000],
      [20000, 25000],
    ],
  },
  {
    name: 'NW_Dungeon_Edengrove_00',
    title: 'Garden of Genesis',
    folder: 'nw_dungeon_edengrove_00',
    maxZoom: 6,
    minZoom: 3,
    maxBounds: [
      [800, 100],
      [2000, 1200],
    ],
  },
  {
    name: 'NW_Dungeon_Everfall_00',
    title: 'Starstone Barrows',
    folder: 'nw_dungeon_everfall_00',
    maxZoom: 6,
    minZoom: 3,
    maxBounds: [
      [200, 100],
      [900, 1200],
    ],
  },
  {
    name: 'NW_Dungeon_Reekwater_00',
    title: 'Lazarus Instrumentality',
    folder: 'nw_dungeon_reekwater_00',
    maxZoom: 6,
    minZoom: 3,
    maxBounds: [
      [300, 200],
      [1100, 1100],
    ],
  },
  {
    name: 'nw_Dungeon_Restlessshores_01',
    title: 'The Depths',
    folder: 'nw_dungeon_restlessshores_01',
    maxZoom: 6,
    minZoom: 3,
    maxBounds: [
      [300, 200],
      [1100, 1100],
    ],
  },
];

export const findMapDetails = (map: string) => {
  return mapDetails.find(
    (mapDetail) => mapDetail.name.toLowerCase() === map.toLowerCase()
  );
};

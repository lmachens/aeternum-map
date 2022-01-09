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
    name: 'NW_Dungeon_Windsward_00',
    title: 'Amrine Excavation',
    folder: 'nw_dungeon_windsward_00',
    maxZoom: 6,
    minZoom: 3,
    maxBounds: [
      [500, 600],
      [1000, 1050],
    ],
  },
  {
    name: 'NW_Dungeon_Edengrove_00',
    title: 'Garden of Genesis',
    folder: 'nw_dungeon_edengrove_00',
    maxZoom: 6,
    minZoom: 3,
    maxBounds: [
      [950, 300],
      [1600, 1000],
    ],
  },
  {
    name: 'NW_Dungeon_Reekwater_00',
    title: 'Lazarus Instrumentality',
    folder: 'nw_dungeon_reekwater_00',
    maxZoom: 6,
    minZoom: 3,
    maxBounds: [
      [530, 600],
      [1000, 1000],
    ],
  },
  {
    name: 'NW_Dungeon_Everfall_00',
    title: 'Starstone Barrows',
    folder: 'nw_dungeon_everfall_00',
    maxZoom: 6,
    minZoom: 3,
    maxBounds: [
      [350, 280],
      [740, 1000],
    ],
  },
  {
    name: 'NW_Dungeon_Restlessshores_01',
    title: 'The Depths',
    folder: 'nw_dungeon_restlessshores_01',
    maxZoom: 6,
    minZoom: 3,
    maxBounds: [
      [750, 650],
      [1400, 1250],
    ],
  },
];

export const findMapDetails = (map: string) => {
  return mapDetails.find(
    (mapDetail) => mapDetail.name.toLowerCase() === map.toLowerCase()
  );
};

import leaflet from 'leaflet';

export const worlds = [
  {
    name: 'NewWorld_VitaeEterna',
    folder: 'map',
    maxZoom: 6,
    minZoom: 0,
    defaultZoom: 4,
    maxBounds: leaflet.latLngBounds([-10000, -7000], [20000, 25000]),
  },
  {
    name: 'NW_Dungeon_Edengrove_00',
    folder: 'nw_dungeon_edengrove_00',
    maxZoom: 6,
    minZoom: 3,
    defaultZoom: 5,
    maxBounds: leaflet.latLngBounds([800, 100], [2000, 1200]),
  },
];

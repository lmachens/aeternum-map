import leaflet from 'leaflet';
import type geojson from 'geojson';
import regions from './regions.json';

const COLOR = 'rgb(200 200 200)';

export function getRegions(): leaflet.GeoJSON {
  return leaflet.geoJSON(regions as geojson.GeoJSON, {
    style: {
      color: COLOR,
      fill: false,
      weight: 1.2,
    },
    interactive: false,
    pmIgnore: true,
  });
}

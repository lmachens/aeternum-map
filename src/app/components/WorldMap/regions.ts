import leaflet from 'leaflet';
import type geojson from 'geojson';
import regions from './regions.json';

const COLOR = 'rgb(200 200 200)';

export function drawRegions(map: leaflet.Map) {
  const geoJSON = leaflet.geoJSON(regions as geojson.GeoJSON, {
    style: {
      color: COLOR,
      fill: false,
      weight: 1.2,
    },
    interactive: false,
    pmIgnore: true,
  });
  geoJSON.addTo(map);
}

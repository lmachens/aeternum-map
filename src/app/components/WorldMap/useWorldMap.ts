import { useEffect, useRef, useState } from 'react';
import leaflet from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'tilelayer-canvas';
import { coordinates as playerCoordinates } from './usePlayerPosition';
import { getJSONItem, setJSONItem } from '../../utils/storage';
import { getRegions } from './regions';
import { useSettings } from '../../contexts/SettingsContext';
const { VITE_API_ENDPOINT } = import.meta.env;

function toThreeDigits(number: number): string {
  if (number < 10) {
    return `00${number}`;
  }
  if (number < 100) {
    return `0${number}`;
  }
  return `${number}`;
}

const worldCRS = leaflet.extend({}, leaflet.CRS.Simple, {
  transformation: new leaflet.Transformation(1 / 16, 0, -1 / 16, 0),
});

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const WorldTiles = leaflet.TileLayer.Canvas.extend({
  getTileUrl(coords: { x: number; y: number; z: number }) {
    const zoom = 8 - coords.z - 1;
    const multiplicators = [1, 2, 4, 8, 16, 32, 64];
    const x = coords.x * multiplicators[zoom - 1];
    const y = (-coords.y - 1) * multiplicators[zoom - 1];

    if (x < 0 || y < 0 || y >= 64 || x >= 64) {
      return `${VITE_API_ENDPOINT}/assets/map/empty.webp`;
    }
    // return `/map/map_l1_y000_x024.webp`;
    return `${VITE_API_ENDPOINT}/assets/map/map_l${zoom}_y${toThreeDigits(
      y
    )}_x${toThreeDigits(x)}.webp`;
  },
  getTileSize() {
    return { x: 1024, y: 1024 };
  },
});

type UseWorldMapProps = {
  selectMode: boolean;
  hideControls?: boolean;
  initialZoom?: number;
};
export let latestLeafletMap: leaflet.Map | null = null;
function useWorldMap({
  hideControls,
  selectMode,
  initialZoom,
}: UseWorldMapProps): {
  elementRef: React.MutableRefObject<HTMLDivElement | null>;
  leafletMap: leaflet.Map | null;
} {
  const elementRef = useRef<HTMLDivElement | null>(null);
  const [leafletMap, setLeafletMap] = useState<leaflet.Map | null>(null);
  const { showRegionBorders } = useSettings();

  useEffect(() => {
    if (leafletMap && initialZoom) {
      leafletMap.setZoom(initialZoom);
    }
  }, [leafletMap, initialZoom]);

  useEffect(() => {
    if (!leafletMap || !showRegionBorders) {
      return;
    }
    const regions = getRegions();
    regions.addTo(leafletMap);
    return () => {
      regions.removeFrom(leafletMap);
    };
  }, [leafletMap, showRegionBorders]);

  useEffect(() => {
    const mapElement = elementRef.current;
    if (!mapElement) {
      return;
    }

    const southWest = leaflet.latLng(0, 4000);
    const northEast = leaflet.latLng(10000, 14336);
    const bounds = leaflet.latLngBounds(southWest, northEast);
    const map = leaflet.map(mapElement, {
      preferCanvas: true,
      crs: worldCRS,
      maxZoom: 6,
      minZoom: 0,
      zoom: initialZoom,
      attributionControl: false,
      zoomControl: false,
      maxBounds: leaflet.latLngBounds([-10000, -7000], [20000, 25000]),
    });
    if (!selectMode) {
      latestLeafletMap = map;
    }
    setLeafletMap(map);

    const mapPosition = getJSONItem<
      | {
          y: number;
          x: number;
          zoom: number;
        }
      | undefined
    >('mapPosition', undefined);

    if (mapPosition) {
      map.setView(
        [mapPosition.y, mapPosition.x],
        initialZoom || mapPosition.zoom
      );
    } else {
      map.fitBounds(bounds);
      if (initialZoom) {
        map.setZoom(initialZoom);
      }
      const center = map.getCenter();
      setJSONItem('mapPosition', {
        x: center.lng,
        y: center.lat,
        zoom: map.getZoom(),
      });
    }
    if (!hideControls) {
      leaflet.control.zoom({ position: 'topright' }).addTo(map);

      const divElement = leaflet.DomUtil.create('div', 'leaflet-position');
      const handleMouseMove = (event: leaflet.LeafletMouseEvent) => {
        divElement.innerHTML = `<span>[${event.latlng.lng.toFixed(
          2
        )}, ${event.latlng.lat.toFixed(2)}]</span>`;
      };
      const handleMouseOut = () => {
        divElement.innerHTML = ``;
      };

      const CoordinatesControl = leaflet.Control.extend({
        onAdd(map: leaflet.Map) {
          map.on('mousemove', handleMouseMove);
          map.on('mouseout', handleMouseOut);
          return divElement;
        },
        onRemove(map: leaflet.Map) {
          map.off('mousemove', handleMouseMove);
          map.off('mouseout', handleMouseOut);
        },
      });

      const coordinates = new CoordinatesControl({ position: 'bottomright' });
      playerCoordinates.addTo(map);

      coordinates.addTo(map);
    }
    const worldTiles = new WorldTiles();
    worldTiles.addTo(map);

    return () => {
      setLeafletMap(null);
      map.remove();
    };
  }, [elementRef]);

  if (!selectMode) {
    useEffect(() => {
      if (!leafletMap) {
        return;
      }
      let timeoutId: NodeJS.Timeout;
      const handleMoveEnd = () => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          const center = leafletMap.getCenter();
          setJSONItem('mapPosition', {
            x: center.lng,
            y: center.lat,
            zoom: leafletMap.getZoom(),
          });
        }, 1000);
      };
      leafletMap.on('moveend', handleMoveEnd);

      return () => {
        leafletMap.off('moveend', handleMoveEnd);
      };
    }, [leafletMap]);
  }

  return { elementRef, leafletMap };
}

export default useWorldMap;

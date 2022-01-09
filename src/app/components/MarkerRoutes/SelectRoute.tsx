import { useCallback, useEffect, useState } from 'react';
import styles from './SelectRoute.module.css';
import 'leaflet';
import '@geoman-io/leaflet-geoman-free';
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';
import leaflet from 'leaflet';
import MarkerTypes from './MarkerTypes';
import { notify } from '../../utils/notifications';
import { patchMarkerRoute, postMarkerRoute } from './api';
import { useMarkers } from '../../contexts/MarkersContext';
import type { MarkerRouteItem } from './MarkerRoutes';
import Button from '../Button/Button';
import { latestLeafletMap } from '../WorldMap/useWorldMap';
import { findRegions } from '../WorldMap/areas';
import { useFilters } from '../../contexts/FiltersContext';

type SelectRouteProps = {
  markerRoute?: MarkerRouteItem;
  onClose: () => void;
};
function SelectRoute({ markerRoute, onClose }: SelectRouteProps): JSX.Element {
  const [positions, setPositions] = useState<[number, number][]>(
    markerRoute?.positions || []
  );
  const [markersByType, setMarkersByType] = useState<{
    [type: string]: number;
  }>({});
  const [name, setName] = useState(markerRoute?.name || '');
  const [regions, setRegions] = useState<string[]>([]);
  const [isPublic, setIsPublic] = useState(markerRoute?.isPublic || false);
  const { markers, toggleMarkerRoute, refreshMarkerRoutes } = useMarkers();
  const { map } = useFilters();

  const refreshMarkers = useCallback(
    (workingLayer: leaflet.Polyline | leaflet.Layer) => {
      // @ts-ignore
      const latLngs = workingLayer.getLatLngs() as leaflet.LatLng[];
      const snappedMarkers = markers.filter((marker) =>
        latLngs.some((latLng: leaflet.LatLng) =>
          latLng.equals([marker.position[1], marker.position[0]])
        )
      );

      const markersByType = snappedMarkers.reduce<{
        [type: string]: number;
      }>(
        (prev, acc) => ({
          ...prev,
          [acc.type]: (prev[acc.type] || 0) + 1,
        }),
        {}
      );

      setMarkersByType(markersByType);

      const positions = latLngs.map((latLng) => [latLng.lat, latLng.lng]) as [
        number,
        number
      ][];
      setPositions(positions);
      setRegions(findRegions(positions, map));
    },
    [markers, map]
  );

  useEffect(() => {
    const toggleControls = (editMode: boolean) => {
      latestLeafletMap!.pm.addControls({
        position: 'topleft',
        drawCircle: false,
        drawCircleMarker: false,
        drawMarker: false,
        drawRectangle: false,
        drawPolygon: false,
        rotateMode: false,
        dragMode: false,
        cutPolygon: false,
        removalMode: false,
        drawPolyline: true,
        editMode: editMode,
      });
    };
    toggleControls(false);

    let existingPolyline: leaflet.Polyline | null = null;
    latestLeafletMap!.on('pm:create', (event) => {
      existingPolyline = event.layer as leaflet.Polyline;
      refreshMarkers(event.layer);

      latestLeafletMap!.pm.enableGlobalEditMode();
      toggleControls(true);

      event.layer.on('pm:edit', (event) => {
        refreshMarkers(event.layer as leaflet.Polyline);
      });
    });

    // listen to vertexes being added to currently drawn layer (called workingLayer)
    latestLeafletMap!.on('pm:drawstart', ({ workingLayer }) => {
      if (!existingPolyline) {
        existingPolyline = workingLayer as leaflet.Polyline;
      } else {
        existingPolyline
          .getLatLngs()
          .flat(999)
          .forEach((latlng) => {
            // @ts-ignore
            latestLeafletMap.pm.Draw.Line._createVertex({ latlng });
          });
        existingPolyline.remove();
        // @ts-ignore
        existingPolyline = latestLeafletMap.pm.Draw.Line._layer;
      }

      existingPolyline!.on('pm:vertexadded', () => {
        refreshMarkers(existingPolyline!);
      });
    });

    if (markerRoute) {
      latestLeafletMap!.pm.enableGlobalEditMode();
      existingPolyline = leaflet.polyline(markerRoute.positions, {
        pmIgnore: false,
      });
      existingPolyline.pm.toggleEdit();
      existingPolyline.addTo(latestLeafletMap!);
      refreshMarkers(existingPolyline);
      existingPolyline.on('pm:edit', (event) => {
        refreshMarkers(event.layer);
      });
      toggleControls(true);
      setTimeout(() => {
        if (existingPolyline) {
          refreshMarkers(existingPolyline);
        }
      }, 100);
    } else {
      latestLeafletMap!.pm.enableDraw('Line');
    }

    return () => {
      latestLeafletMap!.pm.removeControls();
      latestLeafletMap!.pm.disableGlobalEditMode();
      latestLeafletMap!.off('pm:create');
      latestLeafletMap!.off('pm:drawstart');

      if (existingPolyline) {
        existingPolyline.remove();
      }
    };
  }, []);

  async function handleSave() {
    const partialMarkerRoute = {
      name,
      isPublic,
      positions,
      map,
      markersByType,
    };

    const action = markerRoute
      ? patchMarkerRoute(markerRoute._id, partialMarkerRoute)
      : postMarkerRoute(partialMarkerRoute);
    const updatedMarkerRoute = await notify(action, {
      success: markerRoute ? 'Route updated 👌' : 'Route added 👌',
    });

    toggleMarkerRoute(updatedMarkerRoute);
    await refreshMarkerRoutes();
    onClose();
  }

  return (
    <div className={styles.container}>
      <label className={styles.label}>
        Name
        <input
          onChange={(event) => setName(event.target.value)}
          value={name || ''}
          placeholder="Give this route an explanatory name"
          required
        />
      </label>
      <label className={styles.label}>
        Make it available for everyone'
        <input
          type="checkbox"
          onChange={(event) => setIsPublic(event.target.checked)}
          checked={isPublic}
        />
      </label>
      <MarkerTypes markersByType={markersByType} />
      <div className={styles.regions}>{regions.join(', ')}</div>
      <Button onClick={handleSave} disabled={!name || positions.length === 0}>
        Save Route {!name && '(Name missing)'}
      </Button>
      <Button onClick={onClose}>Cancel</Button>
      <small>Right click in edit mode to remove a vertex</small>
    </div>
  );
}

export default SelectRoute;

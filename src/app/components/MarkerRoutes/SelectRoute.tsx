import { useCallback, useEffect, useState } from 'react';
import styles from './SelectRoute.module.css';
import 'leaflet';
import './polyColor';
import '@geoman-io/leaflet-geoman-free';
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';
import leaflet from 'leaflet';
import MarkerTypes from './MarkerTypes';
import { notify } from '../../utils/notifications';
import { deleteMarkerRoute, patchMarkerRoute, postMarkerRoute } from './api';
import { useMarkers } from '../../contexts/MarkersContext';
import type { MarkerRouteItem, PositionNote } from './MarkerRoutes';
import Button from '../Button/Button';
import { latestLeafletMap } from '../WorldMap/useWorldMap';
import { findRegions } from '../WorldMap/areas';
import { useFilters } from '../../contexts/FiltersContext';
import { writeError } from '../../utils/logs';
import DeleteButton from '../DeleteButton/DeleteButton';
import ColorHash from 'color-hash';

const colorHash = new ColorHash();

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
    // @ts-ignore
    latestLeafletMap!.pm.setGlobalOptions({ snappable: true });

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
    const notes: PositionNote[] = [];

    latestLeafletMap!.on('pm:create', (event) => {
      existingPolyline = event.layer as leaflet.Polyline;
      refreshMarkers(event.layer);

      if (!latestLeafletMap!.pm.globalEditModeEnabled) {
        latestLeafletMap!.pm.enableGlobalEditMode();
      }
      toggleControls(true);

      event.layer.on('pm:edit', (event) => {
        refreshMarkers(event.layer as leaflet.Polyline);
      });

      event.layer.on('pm:vertexclick', (event) => {
        const index = event.indexPath?.[0];
        if (index !== undefined) {
          const select = document.createElement('select');
          select.innerHTML = `<option value="">Select action</option><option value="floorUp">Floor up</option><option value="floorDown">Floor down</option><option value="safeArea">Safe area</option><option value="jumpUp">Jump up</option><option value="jumpDown">Jump down</option><option value="crawl">Crawl</option>`;

          const popup = leaflet
            .popup()
            .setLatLng(event.markerEvent.target.getLatLng())
            .setContent(select)
            .openOn(latestLeafletMap);

          select.onchange = () => {
            popup.closePopup();
            if (!select.value) {
              return;
            }
            notes.push({
              index: index,
              type: select.value,
            });
            event.markerEvent.target.bindTooltip(select.value).openTooltip();

            switch (select.value) {
              case 'floorDown':
              case 'floorUp':
              case 'jumpUp':
              case 'jumpDown':
                {
                  const colorParts = event.layer._parts[0].map((_, partIndex) =>
                    notes.some(
                      (note) =>
                        note.index === partIndex &&
                        ['floorUp', 'floorDown', 'jumpUp', 'jumpDown'].includes(
                          note.type
                        )
                    )
                      ? colorHash.hex(partIndex.toString())
                      : null
                  );

                  event.layer._colorParts = colorParts;
                  event.layer.redraw();
                }
                break;
            }
          };
        }
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
      if (!latestLeafletMap!.pm.globalEditModeEnabled) {
        latestLeafletMap!.pm.enableGlobalEditMode();
      }
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
        existingPolyline.off();
        existingPolyline.remove();
      }
    };
  }, []);

  async function handleSave() {
    try {
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

      toggleMarkerRoute(updatedMarkerRoute, true);
      await refreshMarkerRoutes();
      onClose();
    } catch (error) {
      writeError(error);
    }
  }

  async function handleRemove(): Promise<void> {
    try {
      if (!markerRoute) {
        return;
      }
      await notify(deleteMarkerRoute(markerRoute._id), {
        success: 'Route deleted 👌',
      });

      toggleMarkerRoute(markerRoute, true);

      await refreshMarkerRoutes();
      onClose();
    } catch (error) {
      writeError(error);
    }
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
      {markerRoute && (
        <DeleteButton
          variant="text"
          onClick={handleRemove}
          title={`Do you really want to delete ${markerRoute.name}?`}
        />
      )}
      <small>Right click in edit mode to remove a vertex</small>
    </div>
  );
}

export default SelectRoute;

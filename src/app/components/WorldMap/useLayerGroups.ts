import { useEffect, useRef } from 'react';
import leaflet from 'leaflet';
import { mapFilters, mapFiltersCategories } from '../MapFilter/mapFilters';
import type { MarkerBasic } from '../../contexts/MarkersContext';
import { getTooltipContent } from './tooltips';
import { useMarkers } from '../../contexts/MarkersContext';
import CanvasMarker from './CanvasMarker';
import { useSettings } from '../../contexts/SettingsContext';
import { writeError } from '../../utils/logs';

export const LeafIcon: new ({ iconUrl }: { iconUrl: string }) => leaflet.Icon =
  leaflet.Icon.extend({
    options: {
      iconSize: [32, 32],
      tooltipAnchor: [0, -20],
    },
  });

function useLayerGroups({
  leafletMap,
  pmIgnore,
  onMarkerClick,
}: {
  leafletMap: leaflet.Map | null;
  pmIgnore: boolean;
  onMarkerClick?: (marker: MarkerBasic) => void;
}): void {
  const { visibleMarkers, markerRoutes } = useMarkers();
  const { markerSize, markerShowBackground } = useSettings();
  const isFirstRender = useRef(true);
  const markersLayerGroupRef = useRef(leaflet.layerGroup());
  const allLayersRef = useRef<{
    [id: string]: {
      layer: CanvasMarker;
      hasComments: boolean;
    };
  }>({});

  useEffect(() => {
    if (!leafletMap) {
      return;
    }
    markersLayerGroupRef.current.addTo(leafletMap);
  }, [leafletMap]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const handle = setTimeout(() => {
      const markersLayerGroup = markersLayerGroupRef.current;
      const allLayers = allLayersRef.current;
      const allMarkers = Object.values(allLayers);
      if (allMarkers.length === 0 || !leafletMap) {
        return;
      }
      allMarkers.forEach(({ layer }) => {
        if (
          layer.options.image.size[0] === markerSize &&
          layer.options.image.size[1] === markerSize &&
          layer.options.image.showBackground === markerShowBackground
        ) {
          return;
        }

        layer.options.image.size = [markerSize, markerSize];
        layer.options.image.showBackground = markerShowBackground;
        const isVisible = markersLayerGroup.hasLayer(layer);
        markersLayerGroup.removeLayer(layer);
        if (isVisible) {
          markersLayerGroup.addLayer(layer);
        }
      });
    }, 200);

    return () => {
      clearTimeout(handle);
    };
  }, [markerSize, markerShowBackground]);

  useEffect(() => {
    if (!leafletMap) {
      return;
    }
    const markersLayerGroup = markersLayerGroupRef.current;
    const allLayers = allLayersRef.current;
    const removableMarkers = Object.keys(allLayers);
    const mapBounds = leafletMap.getBounds();

    for (let i = 0; i < visibleMarkers.length; i++) {
      try {
        const marker = visibleMarkers[i];
        const latLng: [number, number] = [
          marker.position[1],
          marker.position[0],
        ];
        const shouldBeVisible = mapBounds.contains([
          marker.position[1],
          marker.position[0],
        ]);

        if (allLayers[marker._id]) {
          const index = removableMarkers.indexOf(marker._id);
          if (index > -1) {
            removableMarkers.splice(index, 1);
          }
          const isVisible = markersLayerGroup.hasLayer(
            allLayers[marker._id].layer
          );

          if (allLayers[marker._id].hasComments !== Boolean(marker.comments)) {
            markersLayerGroup.removeLayer(allLayers[marker._id].layer);
            delete allLayers[marker._id];
          } else {
            if (shouldBeVisible && !isVisible) {
              markersLayerGroup.addLayer(allLayers[marker._id].layer);
            }
            continue;
          }
        }

        const mapFilter = mapFilters.find(
          (mapFilter) => mapFilter.type === marker.type
        );
        if (!mapFilter) {
          continue;
        }

        const filterCategory = mapFiltersCategories.find(
          (filterCategory) => filterCategory.value === mapFilter.category
        );
        if (!filterCategory) {
          continue;
        }
        const mapMarker = new CanvasMarker(latLng, {
          radius: 16,
          image: {
            markerId: marker._id,
            type: marker.type,
            src: mapFilter.iconUrl,
            showBackground: markerShowBackground,
            borderColor: filterCategory.borderColor,
            size: [markerSize, markerSize],
            comments: marker.comments,
          },
          pmIgnore,
        }).bindTooltip(getTooltipContent(marker, mapFilter), {
          direction: 'top',
        });
        if (onMarkerClick) {
          mapMarker.on('click', () => {
            onMarkerClick(marker);
          });
        }
        allLayers[marker._id] = {
          layer: mapMarker,
          hasComments: Boolean(marker.comments),
        };
        if (shouldBeVisible) {
          markersLayerGroup.addLayer(allLayers[marker._id].layer);
        }
      } catch (error) {
        writeError(error);
      }
    }
    removableMarkers.forEach((markerId) => {
      const layerCache = allLayers[markerId];
      if (layerCache) {
        markersLayerGroup.removeLayer(layerCache.layer);
        delete allLayers[markerId];
      }
    });

    const allMarkers = Object.values(allLayers);
    let currentMapBounds = leafletMap.getBounds();
    function showHideLayers() {
      const mapBounds = leafletMap!.getBounds();
      currentMapBounds = mapBounds;
      allMarkers.forEach((marker) => {
        if (currentMapBounds !== mapBounds) {
          return;
        }
        const layer = marker.layer;
        const shouldBeVisible = mapBounds.contains(layer.getLatLng());

        const isVisible = markersLayerGroup.hasLayer(layer);

        if (isVisible && !shouldBeVisible) {
          markersLayerGroup.removeLayer(layer);
        } else if (!isVisible && shouldBeVisible) {
          markersLayerGroup.addLayer(layer);
        }
      });
    }

    let isThrottled = false;
    let trailingTimeoutId: NodeJS.Timeout;
    function placeMarkersInBounds() {
      clearTimeout(trailingTimeoutId);
      if (isThrottled) {
        trailingTimeoutId = setTimeout(showHideLayers, 500);
        return;
      }
      isThrottled = true;

      setTimeout(() => {
        showHideLayers();
        isThrottled = false;
      }, 500);
    }

    leafletMap.on('moveend', placeMarkersInBounds);
    return () => {
      leafletMap.off('moveend', placeMarkersInBounds);
    };
  }, [leafletMap, visibleMarkers]);

  useEffect(() => {
    if (!leafletMap) {
      return;
    }

    const layerGroup = new leaflet.LayerGroup();

    for (let i = 0; i < markerRoutes.length; i++) {
      const markerRoute = markerRoutes[i];
      const startHereCircle = leaflet.circle(markerRoute.positions[0]);
      const line = leaflet.polyline(markerRoute.positions);
      startHereCircle.addTo(layerGroup);
      line.addTo(layerGroup);
    }
    layerGroup.addTo(leafletMap);

    return () => {
      layerGroup.remove();
    };
  }, [leafletMap, markerRoutes]);

  useEffect(() => {
    return () => {
      Object.values(allLayersRef.current).forEach(({ layer }) => {
        layer.remove();
      });
      allLayersRef.current = {};
    };
  }, []);
}

export default useLayerGroups;

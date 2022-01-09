import leaflet from 'leaflet';
import { useEffect, useMemo, useState } from 'react';
import { useFilters } from '../../contexts/FiltersContext';
import { usePlayer } from '../../contexts/PlayerContext';
import { usePosition } from '../../contexts/PositionContext';
import { useSettings } from '../../contexts/SettingsContext';
import { isOverwolfApp } from '../../utils/overwolf';
import type { Position } from '../../utils/useReadLivePosition';
import type CanvasMarker from './CanvasMarker';
import PositionMarker from './PositionMarker';
import { updateRotation } from './rotation';
import useAdaptiveZoom from './useAdaptiveZoom';
import useDirectionLine from './useDirectionLine';
import { LeafIcon } from './useLayerGroups';

const divElement = leaflet.DomUtil.create('div', 'leaflet-player-position');
const CoordinatesControl = leaflet.Control.extend({
  onAdd() {
    return divElement;
  },
});
export const coordinates = new CoordinatesControl({ position: 'bottomright' });

function createTraceDot(latLng: [number, number], color: string) {
  return leaflet.circle(latLng, {
    radius: 0,
    interactive: false,
    pmIgnore: true,
    color,
  });
}

function usePlayerPosition({
  isMinimap,
  leafletMap,
  rotate,
}: {
  isMinimap?: boolean;
  leafletMap: leaflet.Map | null;
  rotate?: boolean;
}): void {
  const [marker, setMarker] = useState<PositionMarker | null>(null);

  const traceDotsGroup = useMemo(() => new leaflet.LayerGroup(), []);
  const traceDots = useMemo<leaflet.Circle[]>(() => [], []);

  const { showTraceLines, maxTraceLines, traceLineColor } = useSettings();
  const { map, setMap } = useFilters();

  let isFollowing: boolean | null = null;
  let playerPosition: Position | null = null;
  let playerMap: string | null = null;
  if (!isOverwolfApp) {
    const { player, following } = usePlayer();
    useDirectionLine(player?.position);
    if (!isMinimap) {
      useAdaptiveZoom(player);
    }
    playerPosition = player?.position || null;
    playerMap = player?.map || null;
    isFollowing = following;
  } else {
    const { position, map: positionMap } = usePosition();
    playerPosition = position;
    playerMap = positionMap;
    isFollowing = true;
  }

  const isOnSameWorld = playerMap === map;

  useEffect(() => {
    if (playerMap) {
      traceDotsGroup.clearLayers();
      setMap(playerMap);
    }
  }, [playerMap]);

  useEffect(() => {
    if (!leafletMap || !playerPosition || !isOnSameWorld) {
      return;
    }
    const icon = new LeafIcon({ iconUrl: '/player.webp' });
    const newMarker = new PositionMarker(playerPosition.location, {
      icon,
      zIndexOffset: 9000,
      pmIgnore: true,
    });
    newMarker.addTo(leafletMap);
    newMarker.getElement()!.classList.add('leaflet-own-player-marker');
    setMarker(newMarker);

    return () => {
      newMarker.remove();
    };
  }, [leafletMap, Boolean(playerPosition), isOnSameWorld]);

  useEffect(() => {
    // @ts-ignore
    if (!leafletMap?.markersLayerGroup) {
      return;
    }
    if (!rotate) {
      const visibleMarkers = Object.values(
        // @ts-ignore
        leafletMap.markersLayerGroup._layers
      ) as CanvasMarker[];
      updateRotation(visibleMarkers, 0);
    }
  }, [leafletMap, rotate]);

  useEffect(() => {
    if (!marker || !leafletMap || !playerPosition || !isOnSameWorld) {
      return;
    }
    const playerImage = marker.getElement();

    const leaftletMapContainer = leafletMap.getContainer();

    let animationFrameId: number | null = null;
    if (playerImage) {
      let rotation = playerPosition.rotation - 180;
      const oldRotation =
        +(playerImage.getAttribute('data-rotation') || '0') || rotation;
      let spins = 0;
      if (oldRotation >= 180) {
        spins += Math.floor(Math.abs(oldRotation + 180) / 360);
      } else if (oldRotation <= -180) {
        spins -= Math.floor(Math.abs(oldRotation - 180) / 360);
      }
      rotation += 360 * spins;
      if (oldRotation - rotation >= 180) {
        rotation += 360;
      } else if (rotation - oldRotation >= 180) {
        rotation -= 360;
      }
      playerImage.setAttribute('data-rotation', rotation.toString());
      const newRotation = -rotation - 90;
      marker.rotation = newRotation;
      marker.setLatLng(playerPosition.location);

      // @ts-ignore
      if (rotate && leafletMap.markersLayerGroup) {
        leaftletMapContainer.style.transform = `rotate(${newRotation * -1}deg)`;
        const start = Date.now();
        const visibleMarkers = Object.values(
          // @ts-ignore
          leafletMap.markersLayerGroup._layers
        ) as CanvasMarker[];
        const oldMarkerRotation = visibleMarkers[0]?.options.image.rotate || 0;

        const draw = () => {
          if (!animationFrameId) {
            return;
          }
          const timeLeft = 1000 - (Date.now() - start);
          const diff = newRotation - oldMarkerRotation;
          const markerRotation =
            oldMarkerRotation + (1 - Math.max(timeLeft, 0) / 1000) * diff;
          updateRotation(visibleMarkers, markerRotation);
          if (timeLeft >= 0) {
            animationFrameId = requestAnimationFrame(draw);
          }
        };
        animationFrameId = requestAnimationFrame(draw);
      } else {
        leaftletMapContainer.style.transform = '';
      }

      divElement.innerHTML = `<span>[${playerPosition.location[1]}, ${playerPosition.location[0]}]</span>`;
    }

    if (isFollowing) {
      leafletMap.panTo(
        [playerPosition.location[0], playerPosition.location[1]],
        {
          animate: true,
          easeLinearity: 1,
          duration: 1,
          noMoveStart: true,
        }
      );
    }

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [marker, leafletMap, playerPosition, isFollowing, rotate, isOnSameWorld]);

  useEffect(() => {
    if (!leafletMap || isOverwolfApp || !playerPosition) {
      return;
    }
    const traceDot = createTraceDot(playerPosition.location, traceLineColor);
    traceDots.push(traceDot);
    traceDot.addTo(traceDotsGroup);

    if (traceDots.length > maxTraceLines) {
      traceDots[traceDots.length - 1 - maxTraceLines]?.remove();
    }
  }, [playerPosition]);

  useEffect(() => {
    if (!leafletMap) {
      return;
    }
    if (showTraceLines && !leafletMap.hasLayer(traceDotsGroup)) {
      traceDotsGroup.addTo(leafletMap);
    } else if (leafletMap.hasLayer(traceDotsGroup)) {
      traceDotsGroup.remove();
    }
  }, [leafletMap, showTraceLines]);

  useEffect(() => {
    for (let i = 0; i < traceDots.length; i++) {
      const traceDot = traceDots[i];
      if (i < traceDots.length - maxTraceLines) {
        if (traceDotsGroup.hasLayer(traceDot)) {
          traceDotsGroup.removeLayer(traceDot);
        }
      } else if (!traceDotsGroup.hasLayer(traceDot)) {
        traceDot.addTo(traceDotsGroup);
      }
    }
  }, [maxTraceLines]);
}

export default usePlayerPosition;

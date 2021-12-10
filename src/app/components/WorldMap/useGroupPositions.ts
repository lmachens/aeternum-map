import leaflet from 'leaflet';
import { useEffect, useState } from 'react';
import type { Group } from '../../utils/useReadLivePosition';
import { LeafIcon } from './useLayerGroups';
import { latestLeafletMap } from './useWorldMap';
import { useSettings } from '../../contexts/SettingsContext';

const icon = new LeafIcon({ iconUrl: '/player.webp' });
function useGroupPositions(group: Group): void {
  const [playerMarkers, setPlayerMarkers] = useState<{
    [username: string]: leaflet.Marker;
  }>({});

  const { showPlayerNames } = useSettings();

  useEffect(() => {
    const groupValues = Object.values(group);
    Object.values(playerMarkers).forEach((marker, index) => {
      marker.unbindTooltip();
      marker.bindTooltip(groupValues[index].username!, {
        direction: 'top',
        permanent: showPlayerNames,
      });
    });
  }, [showPlayerNames]);

  useEffect(() => {
    if (!latestLeafletMap) {
      return;
    }
    const removeablePlayerMarkers = { ...playerMarkers };

    const newPlayerMarkers = Object.values(group)
      .filter((player) => player.position && player.username)
      .reduce(
        (acc, player) => {
          const username = player.username!;
          const position = player.position!;
          delete removeablePlayerMarkers[username];
          const existingMarker = playerMarkers[username];
          let marker: leaflet.Marker = playerMarkers[username];

          if (!existingMarker) {
            marker = leaflet.marker(player.position!.location, {
              icon,
              zIndexOffset: 8999,
              pmIgnore: true,
            });

            marker.bindTooltip(username, {
              direction: 'top',
              permanent: showPlayerNames,
            });
            marker.addTo(latestLeafletMap!);
            marker.getElement()!.classList.add('leaflet-player-marker');
          }

          marker.setLatLng(position.location);

          const playerImage = marker.getElement()!;
          let rotation = position.rotation - 180;
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
          playerImage.style.transformOrigin = 'center';
          playerImage.style.transform = `${playerImage.style.transform.replace(
            /\srotate.+/g,
            ''
          )} rotate(${newRotation}deg)`;

          return {
            ...acc,
            [username]: marker,
          };
        },
        {} as {
          [username: string]: leaflet.Marker;
        }
      );
    Object.values(removeablePlayerMarkers).forEach((marker) => marker.remove());
    setPlayerMarkers(newPlayerMarkers);
  }, [latestLeafletMap, group]);
}

export default useGroupPositions;

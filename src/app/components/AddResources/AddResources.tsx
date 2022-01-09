import { useEffect, useState } from 'react';
import { useMarkers } from '../../contexts/MarkersContext';
import type { FilterItem } from '../MapFilter/mapFilters';
import { mapFilters } from '../MapFilter/mapFilters';
import styles from './AddResources.module.css';
import SelectType from './SelectType';
import SelectPosition from './SelectPosition';
import DetailsInput from './DetailsInput';
import { writeError } from '../../utils/logs';
import type { MarkerDTO } from './api';
import { patchMarker } from './api';
import { postMarker } from './api';
import { notify } from '../../utils/notifications';
import Button from '../Button/Button';
import { latestLeafletMap } from '../WorldMap/useWorldMap';
import { usePlayer } from '../../contexts/PlayerContext';
import { useFilters } from '../../contexts/FiltersContext';
import { DEFAULT_MAP_NAME } from '../WorldMap/maps';

export type Details = {
  description?: string;
  name?: string;
  level?: number;
  chestType?: string;
  tier?: number;
};

type AddResourcesProps = {
  marker?: MarkerDTO;
  onClose: () => void;
};
function AddResources({ marker, onClose }: AddResourcesProps): JSX.Element {
  const { setMarkers, setTemporaryHiddenMarkerIDs } = useMarkers();
  const { map } = useFilters();
  const [filter, setFilter] = useState<FilterItem | null>(
    () =>
      (marker && mapFilters.find((filter) => filter.type === marker.type)) ||
      null
  );

  const [details, setDetails] = useState<Details>({});
  const { player, following } = usePlayer();

  const [location, setLocation] = useState<[number, number, number]>(() => {
    if (marker) {
      return marker.position;
    }
    if (following && player?.position) {
      const location = player.position.location;
      return [location[1], location[0], 0];
    }
    const center = latestLeafletMap!.getCenter();
    return [center.lng, center.lat, 0];
  });

  useEffect(() => {
    if (!marker) {
      return;
    }
    setTemporaryHiddenMarkerIDs((markerIDs) => [marker._id!, ...markerIDs]);

    return () => {
      setTemporaryHiddenMarkerIDs((markerIDs) =>
        markerIDs.filter((markerID) => markerID !== marker._id!)
      );
    };
  }, [marker]);

  useEffect(() => {
    if (!filter) {
      return;
    }
    const details: Details = {};
    if (filter.category === 'chests') {
      details.chestType = marker?.chestType || 'Supply';
      details.tier = marker?.tier || 1;
    }
    if (filter.hasLevel) {
      details.level = marker?.level || 1;
    }
    if (filter.hasName) {
      details.name = marker?.name || '';
    }
    setDetails(details);
  }, [filter]);

  const isValid =
    filter &&
    (filter.hasName ? details.name && details.name.length > 0 : true) &&
    (filter.hasLevel ? details.level && details.level > 0 : true) &&
    (filter.category === 'chests' ? details.tier && details.chestType : true);

  async function handleSave() {
    if (!isValid) {
      return;
    }
    try {
      const newMarker: MarkerDTO = {
        type: filter.type,
        position: location || undefined,
        ...details,
      };
      if (map !== DEFAULT_MAP_NAME) {
        newMarker.map = map;
      }

      if (marker) {
        const updatedMarker = await notify(
          patchMarker(marker._id!, newMarker),
          {
            success: 'Marker edited 👌',
          }
        );
        setMarkers((markers) => {
          const markersClone = [...markers];
          const index = markersClone.findIndex(
            (marker) => marker._id === updatedMarker._id
          );
          if (index === -1) {
            return markers;
          }
          markersClone[index] = updatedMarker;
          return markersClone;
        });
      } else {
        const createdMarker = await notify(postMarker(newMarker), {
          success: 'Marker added 👌',
        });
        setMarkers((markers) => [createdMarker, ...markers]);
      }

      onClose();
    } catch (error) {
      writeError(error);
    }
  }

  return (
    <section className={styles.container}>
      <SelectPosition
        details={details}
        filter={filter}
        onSelectLocation={setLocation}
        location={location}
      />
      <SelectType onSelect={setFilter} filter={filter} />
      <DetailsInput filter={filter} onChange={setDetails} details={details} />
      <Button onClick={handleSave} disabled={!isValid}>
        Save Marker
      </Button>
      <Button onClick={onClose}>Cancel</Button>
      <small>Move marker by dragging it</small>
    </section>
  );
}

export default AddResources;

import { useEffect, useMemo, useState } from 'react';
import { useFilters } from '../../contexts/FiltersContext';
import { useMarkers } from '../../contexts/MarkersContext';
import { useModal } from '../../contexts/ModalContext';
import { usePosition } from '../../contexts/PositionContext';
import { useUser } from '../../contexts/UserContext';
import { fetchJSON } from '../../utils/api';
import { writeError } from '../../utils/logs';
import { calcDistance } from '../../utils/positions';
import { usePersistentState } from '../../utils/storage';
import ActionButton from '../ActionControl/ActionButton';
import MarkerRoute from './MarkerRoute';
import styles from './MarkerRoutes.module.css';
import SelectRoute from './SelectRoute';

export type MarkerRouteItem = {
  _id: string;
  name: string;
  username: string;
  positions: [number, number][];
  markersByType: {
    [type: string]: number;
  };
  createdAt: string;
};

type SortBy = 'match' | 'distance' | 'date' | 'name' | 'username';

function handleSort(
  sortBy: SortBy,
  filters: string[],
  position: [number, number] | null
) {
  if (sortBy === 'date') {
    return (a: MarkerRouteItem, b: MarkerRouteItem) =>
      b.createdAt.localeCompare(a.createdAt);
  }
  if (sortBy === 'distance' && position) {
    return (a: MarkerRouteItem, b: MarkerRouteItem) =>
      calcDistance(position, b.positions[0]) -
      calcDistance(position, a.positions[0]);
  }
  if (sortBy === 'name') {
    return (a: MarkerRouteItem, b: MarkerRouteItem) =>
      a.name.localeCompare(b.name);
  }
  if (sortBy === 'username') {
    return (a: MarkerRouteItem, b: MarkerRouteItem) =>
      a.username.localeCompare(b.username);
  }
  return (a: MarkerRouteItem, b: MarkerRouteItem) => {
    const typesA = Object.keys(a.markersByType);
    const typesB = Object.keys(b.markersByType);
    const matchA =
      typesA.length / typesA.filter((type) => filters.includes(type)).length;
    const matchB =
      typesB.length / typesB.filter((type) => filters.includes(type)).length;
    return matchA - matchB;
  };
}

function MarkerRoutes(): JSX.Element {
  const { addModal } = useModal();
  const { markerRoutes, clearMarkerRoutes, toggleMarkerRoute } = useMarkers();
  const [allMarkerRoutes, setAllMarkerRoutes] = useState<MarkerRouteItem[]>([]);
  const user = useUser();
  const [sortBy, setSortBy] = usePersistentState<SortBy>(
    'markerRoutesSort',
    'match'
  );
  const [filters] = useFilters();
  const { position } = usePosition();

  const reload = async () => {
    try {
      const newMarkerRoutes = await fetchJSON<MarkerRouteItem[]>(
        '/api/marker-routes'
      );
      setAllMarkerRoutes(newMarkerRoutes);
    } catch (error) {
      writeError(error);
    }
  };

  useEffect(() => {
    reload();
  }, []);

  async function handleRemove(markerRouteId: string): Promise<void> {
    try {
      await fetchJSON(`/api/marker-routes/${markerRouteId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?._id,
        }),
      });
      reload();
    } catch (error) {
      writeError(error);
    }
  }

  function isRemoveable(markerRoute: MarkerRouteItem): boolean {
    return Boolean(
      user && (user.isModerator || user.username === markerRoute.username)
    );
  }

  async function handleAdd(markerRoute: MarkerRouteItem) {
    await reload();
    toggleMarkerRoute(markerRoute);
  }

  const sortedMarkerRoutes = useMemo(
    () => allMarkerRoutes.sort(handleSort(sortBy, filters, position)),
    [sortBy, allMarkerRoutes, filters, position]
  );

  return (
    <section className={styles.container}>
      <div className={styles.actions}>
        <ActionButton
          disabled={!user}
          onClick={() => {
            addModal({
              title: 'New Route',
              children: <SelectRoute onAdd={handleAdd} />,
            });
          }}
        >
          {user ? 'Add route' : 'Login to add route'}
        </ActionButton>
        <ActionButton onClick={clearMarkerRoutes}>Hide all</ActionButton>
        <select
          value={sortBy}
          onChange={(event) => setSortBy(event.target.value as SortBy)}
        >
          <option value="match">By match</option>
          <option value="distance">By distance</option>
          <option value="date">By date</option>
          <option value="name">By name</option>
          <option value="username">By username</option>
        </select>
      </div>
      <div className={styles.items}>
        {sortedMarkerRoutes.map((markerRoute) => (
          <MarkerRoute
            key={markerRoute.name}
            markerRoute={markerRoute}
            selected={markerRoutes.some(
              (selectedMarkerRoute) =>
                selectedMarkerRoute.name == markerRoute.name
            )}
            onClick={() => toggleMarkerRoute(markerRoute)}
            onRemove={
              isRemoveable(markerRoute) && (() => handleRemove(markerRoute._id))
            }
          />
        ))}
      </div>
    </section>
  );
}

export default MarkerRoutes;
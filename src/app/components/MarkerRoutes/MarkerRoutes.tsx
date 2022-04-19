import { useEffect, useMemo, useState } from 'react';
import { useFilters } from '../../contexts/FiltersContext';
import { useMarkers } from '../../contexts/MarkersContext';
import type { AccountDTO } from '../../contexts/UserContext';
import { useAccount } from '../../contexts/UserContext';
import { writeError } from '../../utils/logs';
import { notify } from '../../utils/notifications';
import { escapeRegExp } from '../../utils/regExp';
import { usePersistentState } from '../../utils/storage';
import ActionButton from '../ActionControl/ActionButton';
import Button from '../Button/Button';
import { mapFilters } from '../MapFilter/mapFilters';
import SelectMap from '../MapFilter/SelectMap';
import SearchInput from '../SearchInput/SearchInput';
import { regionNames } from '../WorldMap/areas';
import { patchFavoriteMarkerRoute, postMarkerRoute } from './api';
import MarkerRoute from './MarkerRoute';
import styles from './MarkerRoutes.module.css';

export type PositionNote = {
  index: number;
  type: 'floorUp' | 'floorDown' | 'safeArea' | 'jumpUp' | 'jumpDown' | 'crawl';
};
export type MarkerRouteItem = {
  _id: string;
  name: string;
  userId: string;
  username: string;
  isPublic: boolean;
  map?: string;
  positions: [number, number][];
  notes?: PositionNote[];
  regions: string[];
  markersByType: {
    [type: string]: number;
  };
  favorites?: number;
  forks?: number;
  createdAt: string;
};

type SortBy = 'match' | 'favorites' | 'date' | 'name' | 'username';
type Filter = 'all' | 'myRoutes' | 'favorites' | string;

function handleFilter(
  filter: Filter,
  search: string,
  account: AccountDTO | null
) {
  const regExp = new RegExp(escapeRegExp(search), 'i');
  const filterBySearch = (item: MarkerRouteItem) => {
    if (search === '') {
      return true;
    }
    const matchedMarkersType = Object.keys(item.markersByType).some((type) => {
      const mapFilter = mapFilters.find((filter) => filter.type === type);
      if (!mapFilter) {
        return false;
      }
      return mapFilter.title.match(regExp);
    });
    return matchedMarkersType || item.name.match(regExp);
  };
  if (filter === 'favorites') {
    return (item: MarkerRouteItem) =>
      account?.favoriteRouteIds?.includes(item._id) && filterBySearch(item);
  }
  if (filter === 'myRoutes') {
    return (item: MarkerRouteItem) =>
      item.userId === account?.steamId && filterBySearch(item);
  }
  if (regionNames.includes(filter)) {
    return (item: MarkerRouteItem) =>
      item.regions?.includes(filter) && filterBySearch(item);
  }
  return (item: MarkerRouteItem) => filterBySearch(item);
}

function handleSort(sortBy: SortBy, filters: string[]) {
  if (sortBy === 'favorites') {
    return (a: MarkerRouteItem, b: MarkerRouteItem) =>
      (b.favorites || 0) - (a.favorites || 0);
  }
  if (sortBy === 'date') {
    return (a: MarkerRouteItem, b: MarkerRouteItem) =>
      b.createdAt.localeCompare(a.createdAt);
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

type MarkerRoutesProps = {
  onEdit: (target: MarkerRouteItem | true) => void;
};
function MarkerRoutes({ onEdit }: MarkerRoutesProps): JSX.Element {
  const {
    markerRoutes,
    clearMarkerRoutes,
    toggleMarkerRoute,
    refreshMarkerRoutes,
    visibleMarkerRoutes,
  } = useMarkers();
  const { account, refreshAccount } = useAccount();
  const [sortBy, setSortBy] = usePersistentState<SortBy>(
    'markerRoutesSort',
    'match'
  );
  const [filter, setFilter] = usePersistentState<Filter>(
    'markerRoutesFilter',
    'all'
  );
  const [search, setSearch] = usePersistentState('searchRoutes', '');
  const { filters, setFilters } = useFilters();
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    refreshMarkerRoutes();
  }, []);

  useEffect(() => {
    setLimit(10);
  }, [sortBy, filter, search]);

  async function handleFavorite(markerRouteId: string): Promise<void> {
    if (!account) {
      return;
    }
    const isFavorite = account.favoriteRouteIds?.some(
      (routeId) => markerRouteId === routeId
    );
    try {
      await notify(patchFavoriteMarkerRoute(markerRouteId, !isFavorite), {
        success: 'Favored route changed 👌',
      });
      refreshAccount();
      refreshMarkerRoutes();
    } catch (error) {
      writeError(error);
    }
  }

  function isEditable(markerRoute: MarkerRouteItem): boolean {
    return Boolean(
      account && (account.isModerator || account.steamId === markerRoute.userId)
    );
  }

  const sortedMarkerRoutes = useMemo(
    () =>
      visibleMarkerRoutes
        .filter(handleFilter(filter, search, account))
        .sort(handleSort(sortBy, filters)),
    [sortBy, visibleMarkerRoutes, filters, filter, search]
  );
  function handleEdit(markerRoute: MarkerRouteItem) {
    toggleMarkerRoute(markerRoute, false);
    const types = Object.keys(markerRoute.markersByType);
    setFilters((filters) => [
      ...filters,
      ...types.filter((type) => !filters.includes(type)),
    ]);
    onEdit(markerRoute);
  }

  async function handleFork(markerRoute: MarkerRouteItem, name: string) {
    try {
      const newMarkerRoute = {
        name: name,
        isPublic: false,
        positions: markerRoute.positions,
        markersByType: markerRoute.markersByType,
        map: markerRoute.map,
        origin: markerRoute._id,
      };

      toggleMarkerRoute(markerRoute, false);
      const forkedMarkerRoute = await notify(postMarkerRoute(newMarkerRoute), {
        success: 'Fork added 👌',
      });

      await refreshMarkerRoutes();
      onEdit(forkedMarkerRoute);
    } catch (error) {
      writeError(error);
    }
  }

  return (
    <section className={styles.container}>
      <SelectMap />
      <div className={styles.actions}>
        <ActionButton
          disabled={!account}
          onClick={() => {
            onEdit(true);
          }}
        >
          {account ? 'Add route' : 'Login to add route'}
        </ActionButton>
        <ActionButton onClick={clearMarkerRoutes}>Hide all</ActionButton>
      </div>
      <div className={styles.actions}>
        <SearchInput
          placeholder="Marker or title..."
          value={search}
          onChange={setSearch}
        />
        <select
          value={sortBy}
          onChange={(event) => setSortBy(event.target.value as SortBy)}
        >
          <option value="match">By match</option>
          <option value="favorites">By favorites</option>
          <option value="date">By date</option>
          <option value="name">By name</option>
          <option value="username">By username</option>
        </select>
        <select
          value={filter}
          onChange={(event) => setFilter(event.target.value as Filter)}
        >
          <option value="all">All</option>
          <option value="favorites">Favorites</option>
          <option value="myRoutes">My routes</option>
          <option value="" disabled></option>
          {regionNames.map((regionName) => (
            <option key={regionName} value={regionName}>
              {regionName}
            </option>
          ))}
        </select>
      </div>
      <div className={styles.items}>
        {sortedMarkerRoutes.length === 0 && 'No routes available'}
        {sortedMarkerRoutes.slice(0, limit).map((markerRoute) => (
          <MarkerRoute
            key={markerRoute._id}
            isOwner={markerRoute.userId === account?.steamId}
            markerRoute={markerRoute}
            isPublic={markerRoute.isPublic}
            selected={markerRoutes.some(
              (selectedMarkerRoute) =>
                selectedMarkerRoute._id == markerRoute._id
            )}
            editable={isEditable(markerRoute)}
            onClick={() => toggleMarkerRoute(markerRoute)}
            isFavorite={Boolean(
              account?.favoriteRouteIds?.some(
                (routeId) => markerRoute._id === routeId
              )
            )}
            onFavorite={() => handleFavorite(markerRoute._id)}
            onEdit={() => handleEdit(markerRoute)}
            onFork={(name) => handleFork(markerRoute, name)}
          />
        ))}
        {sortedMarkerRoutes.length > limit && (
          <Button
            className={styles.loadMore}
            onClick={() => setLimit((limit) => limit + 10)}
          >
            Load more
          </Button>
        )}
      </div>
    </section>
  );
}

export default MarkerRoutes;

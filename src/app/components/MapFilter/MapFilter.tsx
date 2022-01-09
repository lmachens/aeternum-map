import { useModal } from '../../contexts/ModalContext';
import { classNames } from '../../utils/styles';
import styles from './MapFilter.module.css';
import MarkerIcon from '../icons/MarkerIcon';
import MarkersView from './MarkersView';
import MenuOpenIcon from '../icons/MenuOpenIcon';
import type { MarkerRouteItem } from '../MarkerRoutes/MarkerRoutes';
import MarkerRoutes from '../MarkerRoutes/MarkerRoutes';
import User from '../User/User';
import RoutesIcon from '../icons/RoutesIcon';
import PlayerIcon from '../icons/PlayerIcon';
import CompassIcon from '../icons/CompassIcon';
import MinimapSetup from '../Minimap/MinimapSetup';
import usePersistentState from '../../utils/usePersistentState';
import SettingsIcon from '../icons/SettingsIcon';
import Settings from '../Settings/Settings';
import { latestLeafletMap } from '../WorldMap/useWorldMap';
import MapSearch from '../MapSearch/MapSearch';
import useDebounce from '../../utils/useDebounce';
import BroadcastIcon from '../icons/BroadcastIcon';
import ShareLiveStatus from '../ShareLiveStatus/ShareLiveStatus';
import Footer from '../Footer/Footer';
import { usePlayer } from '../../contexts/PlayerContext';

type View = 'markers' | 'settings' | 'markerRoutes';

type MarkerFilterProps = {
  onMarkerCreate: () => void;
  onMarkerRouteUpsert: (target: MarkerRouteItem | true) => void;
};
function MapFilter({
  onMarkerCreate,
  onMarkerRouteUpsert,
}: MarkerFilterProps): JSX.Element {
  const { addModal, closeLatestModal } = useModal();
  const [isOpen, setIsOpen] = usePersistentState(
    'aeternum-map-client.sidebar-state',
    true
  );
  const [view, setView] = usePersistentState<View>('sidebar-view', 'markers');
  const { following, toggleFollowing, isSyncing, setIsSyncing } = usePlayer();

  useDebounce(
    isOpen,
    () => latestLeafletMap?.invalidateSize({ pan: true, animate: true }),
    400
  );

  function handleViewClick(view: View) {
    setIsOpen(true);
    setView(view);
  }
  return (
    <aside className={classNames(styles.container, isOpen && styles.open)}>
      <div className={styles.content}>
        <User />
        {view === 'markers' && <MarkersView onAdd={() => onMarkerCreate()} />}
        {view === 'settings' && <Settings />}
        {view === 'markerRoutes' && (
          <MarkerRoutes onEdit={onMarkerRouteUpsert} />
        )}
        <Footer />
      </div>
      <nav className={styles.nav}>
        <MapSearch className={styles.nav__button} />
        <button
          data-tooltip="Markers"
          data-tooltip-position="right"
          className={classNames(
            styles.nav__button,
            styles.nav__border,
            view === 'markers' && styles.nav__active
          )}
          onClick={() => handleViewClick('markers')}
        >
          <MarkerIcon />
        </button>
        <button
          data-tooltip="Routes"
          data-tooltip-position="right"
          className={classNames(
            styles.nav__button,
            view === 'markerRoutes' && styles.nav__active
          )}
          onClick={() => handleViewClick('markerRoutes')}
        >
          <RoutesIcon />
        </button>
        <button
          data-tooltip="Settings"
          data-tooltip-position="right"
          className={classNames(
            styles.nav__button,
            view === 'settings' && styles.nav__active
          )}
          onClick={() => handleViewClick('settings')}
        >
          <SettingsIcon />
        </button>
        <button
          data-tooltip="Share live status"
          data-tooltip-position="right"
          onClick={() => {
            if (!isSyncing) {
              addModal({
                title: 'Share Live Status',
                children: (
                  <ShareLiveStatus
                    onActivate={() => {
                      setIsSyncing(true);
                      closeLatestModal();
                    }}
                  />
                ),
              });
            } else {
              setIsSyncing(false);
            }
          }}
          className={classNames(
            styles.nav__button,
            styles.nav__border,
            isSyncing && styles.nav__active
          )}
        >
          <BroadcastIcon />
        </button>
        <button
          data-tooltip="Follow position"
          data-tooltip-position="right"
          disabled={!isSyncing}
          onClick={() => {
            toggleFollowing();
          }}
          className={classNames(
            styles.nav__button,
            following && styles.nav__active
          )}
        >
          <PlayerIcon />
        </button>
        <button
          data-tooltip="Show minimap"
          data-tooltip-position="right"
          onClick={() => {
            addModal({
              title: 'Setup minimap',
              children: <MinimapSetup />,
            });
          }}
          className={classNames(styles.nav__button, styles.nav__border)}
        >
          <CompassIcon />
        </button>
        <button
          data-tooltip="Show/Hide menu"
          data-tooltip-position="right"
          className={classNames(styles.nav__button, styles.nav__border)}
          onClick={() => setIsOpen(!isOpen)}
        >
          <MenuOpenIcon />
        </button>
      </nav>
    </aside>
  );
}

export default MapFilter;

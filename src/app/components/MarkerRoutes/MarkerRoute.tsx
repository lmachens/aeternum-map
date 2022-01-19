import type { MarkerRouteItem } from './MarkerRoutes';
import MarkerTypes from './MarkerTypes';
import styles from './MarkerRoute.module.css';
import { classNames } from '../../utils/styles';
import { toTimeAgo } from '../../utils/dates';
import EditButton from '../EditButton/EditButton';
import FavoriteButton from '../FavoriteButton/FavoriteButton';
import ForkButton from '../ForkButton/ForkButton';

type MarkerRouteProps = {
  markerRoute: MarkerRouteItem;
  selected: boolean;
  isPublic: boolean;
  editable: boolean;
  onClick: () => void;
  isFavorite: boolean;
  onFavorite: () => void;
  onFork: (name: string) => void;
  onEdit: () => void;
  isOwner: boolean;
};
function MarkerRoute({
  markerRoute,
  selected,
  isPublic,
  editable,
  onClick,
  onFavorite,
  isFavorite,
  onFork,
  onEdit,
  isOwner,
}: MarkerRouteProps): JSX.Element {
  return (
    <article
      className={classNames(styles.container, selected && styles.selected)}
      onClick={onClick}
    >
      <h4 className={styles.title} title={markerRoute.name}>
        {markerRoute.name}
      </h4>
      <div className={styles.regions}>{markerRoute.regions?.join(', ')}</div>
      <small className={styles.info}>
        {toTimeAgo(new Date(markerRoute.createdAt))} by{' '}
        <span className={classNames(isOwner ? styles.owner : styles.notOwner)}>
          {markerRoute.username}
        </span>
        <span
          className={classNames(isPublic ? styles.public : styles.private)}
          title={isPublic ? 'Visible for everyone' : 'Only visible for you'}
        >
          {isPublic ? ' (Public)' : ' (Private)'}
        </span>
      </small>
      <MarkerTypes markersByType={markerRoute.markersByType} />
      <div className={styles.actions}>
        <FavoriteButton
          onClick={onFavorite}
          isFavorite={isFavorite}
          favorites={markerRoute.favorites || 0}
        />
        <ForkButton
          onFork={onFork}
          originalName={markerRoute.name}
          forked={markerRoute.forks || 0}
        />
        {editable && <EditButton onClick={onEdit} />}
      </div>
    </article>
  );
}

export default MarkerRoute;

import { classNames } from '../../utils/styles';
import styles from './FavoriteButton.module.css';

type FavoriteButtonProps = {
  favorites: number;
  isFavorite: boolean;
  onClick: () => void;
};
function FavoriteButton({
  onClick,
  isFavorite,
  favorites,
}: FavoriteButtonProps): JSX.Element {
  return (
    <button
      className={classNames(styles.button, isFavorite && styles.favorite)}
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      title={`${favorites} times favored`}
    >
      <span>🤘</span>
      {favorites}
    </button>
  );
}

export default FavoriteButton;

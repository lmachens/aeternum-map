import { Marker } from '../../useMarkers';
import AddComment from '../AddComment/AddComment';
import Comment from '../Comment/Comment';
import useComments from '../Comment/useComments';
import Loading from '../Loading/Loading';
import { FilterItem } from '../MapFilter/mapFilters';
import Modal from '../Modal/Modal';
import styles from './MarkerModal.module.css';

type MarkerModalProps = {
  marker: Marker;
  filterItem: FilterItem;
  onClose: () => void;
};

function MarkerModal({
  marker,
  filterItem,
  onClose,
}: MarkerModalProps): JSX.Element {
  const { comments, loading, refresh } = useComments(marker._id);

  return (
    <Modal onClose={onClose} fullHeight className={styles.modal}>
      <header className={styles.header}>
        <img src={filterItem.iconUrl} alt="" />
        <h2>{filterItem.title}</h2>
        <p>[{marker.position.join(', ')}]</p>
      </header>
      <h3 className={styles.headline}>Comments</h3>
      <main className={styles.main}>
        {comments?.map((comment) => (
          <Comment
            key={comment._id}
            username={comment.username}
            message={comment.message}
            createdAt={comment.createdAt}
          />
        ))}
        {!loading && comments?.length === 0 && (
          <div className={styles.empty}>Be the first to write a comment</div>
        )}
        {loading && <Loading />}
      </main>
      <AddComment markerId={marker._id} onAdd={refresh} />
    </Modal>
  );
}

export default MarkerModal;

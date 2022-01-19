import { useModal } from '../../contexts/ModalContext';
import Button from '../Button/Button';
import Confirm from '../Confirm/Confirm';
import DeleteIcon from '../icons/DeleteIcon';
import styles from './DeleteButton.module.css';

type DeleteButtonProps = {
  title: string;
  variant: 'text' | 'icon';
  onClick: () => void;
};
function DeleteButton({
  title,
  variant,
  onClick,
}: DeleteButtonProps): JSX.Element {
  const { addModal } = useModal();

  if (variant === 'text') {
    return (
      <Button
        className={styles.button}
        onClick={(event) => {
          event.stopPropagation();
          addModal({
            title,
            children: <Confirm onConfirm={onClick} />,
            fitContent: true,
          });
        }}
        title="Delete"
      >
        Delete
      </Button>
    );
  }
  return (
    <button
      className={styles.delete}
      onClick={(event) => {
        event.stopPropagation();
        addModal({
          title,
          children: <Confirm onConfirm={onClick} />,
          fitContent: true,
        });
      }}
      title="Delete"
    >
      <DeleteIcon />
    </button>
  );
}

export default DeleteButton;

import { useModal } from '../../contexts/ModalContext';
import { classNames } from '../../utils/styles';
import styles from './ForkButton.module.css';
import SelectName from './SelectName';

type ForkButtonProps = {
  forked: number;
  originalName: string;
  onFork: (name: string) => void;
};
function ForkButton({
  onFork,
  originalName,
  forked,
}: ForkButtonProps): JSX.Element {
  const { addModal } = useModal();

  return (
    <button
      className={classNames(styles.button)}
      onClick={(event) => {
        event.stopPropagation();
        addModal({
          title: 'Please select a name',
          children: (
            <SelectName originalName={originalName} onSelect={onFork} />
          ),
          fitContent: true,
        });
      }}
      title={`${forked} times forked`}
    >
      <svg width="1em" height="1em" viewBox="0 0 24 24">
        <path
          fill-rule="evenodd"
          d="M12 21a1.75 1.75 0 1 1 0-3.5a1.75 1.75 0 0 1 0 3.5zm-3.25-1.75a3.25 3.25 0 1 0 6.5 0a3.25 3.25 0 0 0-6.5 0zm-3-12.75a1.75 1.75 0 1 1 0-3.5a1.75 1.75 0 0 1 0 3.5zM2.5 4.75a3.25 3.25 0 1 0 6.5 0a3.25 3.25 0 0 0-6.5 0zM18.25 6.5a1.75 1.75 0 1 1 0-3.5a1.75 1.75 0 0 1 0 3.5zM15 4.75a3.25 3.25 0 1 0 6.5 0a3.25 3.25 0 0 0-6.5 0z"
          fill="currentColor"
        />
        <path
          fill-rule="evenodd"
          d="M6.5 7.75v1A2.25 2.25 0 0 0 8.75 11h6.5a2.25 2.25 0 0 0 2.25-2.25v-1H19v1a3.75 3.75 0 0 1-3.75 3.75h-6.5A3.75 3.75 0 0 1 5 8.75v-1h1.5z"
          fill="currentColor"
        />
        <path
          fill-rule="evenodd"
          d="M11.25 16.25v-5h1.5v5h-1.5z"
          fill="currentColor"
        />
      </svg>{' '}
      {forked}
    </button>
  );
}

export default ForkButton;

import { useState } from 'react';
import { useModal } from '../../contexts/ModalContext';
import styles from './SelectName.module.css';

type SelectNameProps = {
  originalName: string;
  onSelect: (name: string) => void;
};
const SelectName = ({ originalName, onSelect }: SelectNameProps) => {
  const [name, setName] = useState(originalName);
  const { closeLatestModal } = useModal();

  return (
    <div className={styles.container}>
      <input
        className={styles.input}
        value={name}
        onChange={(event) => setName(event.target.value)}
        autoFocus
      />
      <button
        onClick={() => {
          closeLatestModal();
          onSelect(name);
        }}
      >
        Create
      </button>
      <button onClick={closeLatestModal}>Cancel</button>
    </div>
  );
};

export default SelectName;

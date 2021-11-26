import { classNames } from '../../utils/styles';
import styles from './TierInput.module.css';

type TierInputProps = {
  value: number;
  onChange: (value: number) => void;
  max: number;
};

function TierInput({ value, onChange, max }: TierInputProps): JSX.Element {
  return (
    <div className={styles.container}>
      {Array(max)
        .fill(null)
        .map((_, index) => (
          <label
            key={index + 1}
            className={classNames(styles.label, value === max && styles.active)}
          >
            {index + 1}
            <input
              type="radio"
              name={'tier' + max}
              checked={value === index}
              onChange={() => onChange(index)}
            />
          </label>
        ))}
    </div>
  );
}

export default TierInput;

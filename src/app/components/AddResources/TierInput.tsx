import { classNames } from '../../utils/styles';
import styles from './TierInput.module.css';

type TierInputProps = {
  value: number;
  onChange: (value: number) => void;
  max: number;
};

function TierInput({ value, onChange, max }: TierInputProps): JSX.Element {
  const tiers = Array(max)
    .fill(null)
    .map((_, index) => index + 1);
  return (
    <div className={styles.container}>
      {tiers.map((tier) => (
        <label
          key={tier}
          className={classNames(styles.label, value === tier && styles.active)}
        >
          {tier}
          <input
            type="radio"
            name={'tier' + max}
            checked={value === tier}
            onChange={() => onChange(tier)}
          />
        </label>
      ))}
    </div>
  );
}

export default TierInput;

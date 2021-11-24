import { classNames } from '../../utils/styles';
import styles from './TierInput.module.css';

type TierInputProps = {
  value: number;
  onChange: (value: number) => void;
  max: number;
};

function TierInput({ value, onChange ,max}: TierInputProps): JSX.Element {
  let tiers = []
  switch(max) {
    case 3:
      tiers = [1,2,3]
      break;
    case 5:
      tiers = [1,2,3,4,5]
      break;
    case 8:
      tiers = [1,2,3,4,5,6,7,8]
      break;
    default:
      tiers = [5]
  }
  return (
    <div className={styles.container}>
      {tiers.map((tier) => (
        <label
          key={tier}
          className={classNames(styles.label, value === max && styles.active)}
        >
          {tier}
          <input
            type="radio"
            name={"tier" + max }
            checked={value === tier}
            onChange={() => onChange(tier)}
          />
        </label>
      ))}
    </div>
  );
}

export default TierInput;

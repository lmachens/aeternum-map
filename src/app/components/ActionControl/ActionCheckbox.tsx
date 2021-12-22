import { classNames } from '../../utils/styles';
import type { CheckboxProps } from '../MapFilter/Checkbox';
import Checkbox from '../MapFilter/Checkbox';
import styles from './ActionControl.module.css';

function ActionCheckbox({ className, ...props }: CheckboxProps): JSX.Element {
  return (
    <Checkbox
      className={classNames(
        styles.action,
        props.checked && styles.active,
        className
      )}
      {...props}
    />
  );
}

export default ActionCheckbox;

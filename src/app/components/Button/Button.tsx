import type { ButtonHTMLAttributes } from 'react';
import { classNames } from '../../utils/styles';
import styles from './Button.module.css';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;
function Button({ className, ...props }: ButtonProps): JSX.Element {
  return <button className={classNames(styles.button, className)} {...props} />;
}

export default Button;

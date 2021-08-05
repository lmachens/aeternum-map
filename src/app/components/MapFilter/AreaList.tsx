import { classNames } from '../../utils/styles';
import styles from './AreaList.module.css';
import { Area } from './areas';

type AreaListProps = {
  area: Area;
  root?: boolean;
};

function AreaList({ area, root }: AreaListProps): JSX.Element {
  const listItem = (
    <li className={styles.item}>
      <a className={styles.link}>{area.title}</a>
      {area.items && (
        <ul className={styles.list}>
          {area.items.map((item) => (
            <AreaList key={item.title} area={item} />
          ))}
        </ul>
      )}
    </li>
  );
  if (root) {
    return <ul className={classNames(styles.list, styles.root)}>{listItem}</ul>;
  }
  return listItem;
}

export default AreaList;
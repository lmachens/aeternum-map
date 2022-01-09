import { useFilters } from '../../contexts/FiltersContext';
import { mapDetails } from '../WorldMap/maps';
import styles from './MarkersView.module.css';

const SelectMap = () => {
  const { map, setMap } = useFilters();

  return (
    <div className={styles.actions}>
      <select value={map} onChange={(event) => setMap(event.target.value)}>
        {mapDetails.map((mapDetail) => (
          <option key={mapDetail.name} value={mapDetail.name}>
            {mapDetail.title}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SelectMap;

import styles from './MarkerTypes.module.css';
import type { FilterItem } from '../MapFilter/mapFilters';
import { mapFilters } from '../MapFilter/mapFilters';
import { useFilters } from '../../contexts/FiltersContext';
import { classNames } from '../../utils/styles';

type MarkerTypesProps = {
  markersByType: {
    [type: string]: number;
  };
};

function MarkerTypes({ markersByType }: MarkerTypesProps): JSX.Element {
  const { filters } = useFilters();

  const markerMapFilters: FilterItem[] = [];
  Object.keys(markersByType).forEach((markerType) => {
    const mapFilter = mapFilters.find(
      (mapFilter) => mapFilter.type === markerType
    );
    if (mapFilter) {
      markerMapFilters.push(mapFilter);
    }
  });

  return (
    <section className={styles.container}>
      {markerMapFilters.length === 0 && 'No markers'}
      {markerMapFilters.map((markerMapFilter) => {
        return (
          <div
            key={markerMapFilter.type}
            className={classNames(
              styles.marker,
              !filters.includes(markerMapFilter.type) && styles.unchecked
            )}
            title={markerMapFilter.title}
          >
            <img src={markerMapFilter.iconUrl} alt={markerMapFilter.type} />
            <span>{markersByType[markerMapFilter.type]}x</span>
          </div>
        );
      })}
    </section>
  );
}

export default MarkerTypes;

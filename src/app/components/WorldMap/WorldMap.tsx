import styles from './WorldMap.module.css';
import useWorldMap from './useWorldMap';
import useLayerGroups from './useLayerGroups';
import { useModal } from '../../contexts/ModalContext';
import MarkerDetails from '../MarkerDetails/MarkerDetails';
import usePlayerPosition from './usePlayerPosition';
import { classNames } from '../../utils/styles';
import type { CSSProperties } from 'react';
import type { MarkerBasic } from '../../contexts/MarkersContext';
import { isOverwolfApp } from '../../utils/overwolf';
import useReadLivePosition from '../../utils/useReadLivePosition';

type WorldMapProps = {
  isMinimap?: boolean;
  hideControls?: boolean;
  initialZoom?: number;
  className?: string;
  style?: CSSProperties;
  rotate?: boolean;
  onMarkerEdit?: (marker: MarkerBasic) => void;
};

function WorldMap({
  isMinimap,
  className,
  hideControls,
  initialZoom,
  style,
  rotate,
  onMarkerEdit,
}: WorldMapProps): JSX.Element {
  const { addModal, closeLatestModal } = useModal();

  const { leafletMap, elementRef } = useWorldMap({
    hideControls,
    initialZoom,
  });
  if (!isOverwolfApp) {
    useReadLivePosition();

    useLayerGroups({
      leafletMap,
      onMarkerClick: (marker) => {
        if (onMarkerEdit) {
          addModal({
            children: (
              <MarkerDetails
                marker={marker}
                onEdit={() => {
                  onMarkerEdit(marker);
                  closeLatestModal();
                }}
              />
            ),
          });
        }
      },
    });
  }
  usePlayerPosition({ isMinimap, leafletMap, rotate });

  return (
    <div
      className={classNames(styles.map, className)}
      ref={elementRef}
      style={style}
    />
  );
}

export default WorldMap;

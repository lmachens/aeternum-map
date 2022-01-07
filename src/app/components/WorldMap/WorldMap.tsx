import styles from './WorldMap.module.css';
import useWorldMap from './useWorldMap';
import useLayerGroups from './useLayerGroups';
import { useModal } from '../../contexts/ModalContext';
import MarkerDetails from '../MarkerDetails/MarkerDetails';
import usePlayerPosition from './usePlayerPosition';
import { classNames } from '../../utils/styles';
import type { CSSProperties } from 'react';
import { useEffect, useState } from 'react';
import type { MarkerBasic } from '../../contexts/MarkersContext';
import { isOverwolfApp } from '../../utils/overwolf';

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
  const [worldName, setWorldName] = useState('NewWorld_VitaeEterna');

  const { leafletMap, elementRef } = useWorldMap({
    worldName,
    hideControls,
    initialZoom,
  });
  if (!isOverwolfApp) {
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

  useEffect(() => {
    setTimeout(() => {
      setWorldName('NW_Dungeon_Edengrove_00');
    }, 5000);
  }, []);

  return (
    <div
      className={classNames(styles.map, className)}
      ref={elementRef}
      style={style}
    />
  );
}

export default WorldMap;

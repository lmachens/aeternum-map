import { useSettings } from '../../contexts/SettingsContext';
import {
  SETUP_MINIMAP,
  SHOW_HIDE_APP,
  SHOW_HIDE_MINIMAP,
  useHotkeyBinding,
  ZOOM_IN_MINIMAP,
  ZOOM_OUT_MINIMAP,
} from '../../utils/hotkeys';
import styles from './Settings.module.css';

function Settings(): JSX.Element {
  const {
    markerSize,
    setMarkerSize,
    markerShowBackground,
    setMarkerShowBackground,
    showRegionBorders,
    setShowRegionBorders,
  } = useSettings();
  const showHideAppBinding = useHotkeyBinding(SHOW_HIDE_APP);
  const setupMinimapBinding = useHotkeyBinding(SETUP_MINIMAP);
  const showHideMinimapBinding = useHotkeyBinding(SHOW_HIDE_MINIMAP);
  const zoomInMinimapBinding = useHotkeyBinding(ZOOM_IN_MINIMAP);
  const zoomOutMinimapBinding = useHotkeyBinding(ZOOM_OUT_MINIMAP);

  return (
    <div className={styles.container}>
      <h2>Settings</h2>
      <h3>Map</h3>
      <label className={styles.label}>
        Marker size
        <input
          type="range"
          value={markerSize}
          onChange={(event) => setMarkerSize(+event.target.value)}
          min={10}
          max={80}
        />
      </label>
      <label className={styles.label}>
        Marker background
        <input
          type="checkbox"
          checked={markerShowBackground}
          onChange={(event) => setMarkerShowBackground(event.target.checked)}
        />
      </label>
      <label className={styles.label}>
        Region borders
        <input
          type="checkbox"
          checked={showRegionBorders}
          onChange={(event) => setShowRegionBorders(event.target.checked)}
        />
      </label>
      <h3>Hotkeys</h3>
      <label className={styles.label}>
        Show/Hide App
        <a href="overwolf://settings/games-overlay?hotkey=show_hide_app&gameId=21816">
          {showHideAppBinding}
        </a>
      </label>
      <label className={styles.label}>
        Setup minimap
        <a href="overwolf://settings/games-overlay?hotkey=setup_minimap&gameId=21816">
          {setupMinimapBinding}
        </a>
      </label>
      <label className={styles.label}>
        Show/Hide minimap
        <a href="overwolf://settings/games-overlay?hotkey=show_hide_minimap&gameId=21816">
          {showHideMinimapBinding}
        </a>
      </label>
      <label className={styles.label}>
        Zoom in minimap
        <a href="overwolf://settings/games-overlay?hotkey=zoom_in_minimap&gameId=21816">
          {zoomInMinimapBinding}
        </a>
      </label>
      <label className={styles.label}>
        Zoom out minimap
        <a href="overwolf://settings/games-overlay?hotkey=zoom_out_minimap&gameId=21816">
          {zoomOutMinimapBinding}
        </a>
      </label>
    </div>
  );
}

export default Settings;

import { useSettings } from '../../contexts/SettingsContext';
import styles from './Settings.module.css';

function Settings(): JSX.Element {
  const {
    markerSize,
    setMarkerSize,
    markerShowBackground,
    setMarkerShowBackground,
    showRegionBorders,
    setShowRegionBorders,
    maxTraceLines,
    setMaxTraceLines,
    showTraceLines,
    setShowTraceLines,
    showPlayerNames,
    setShowPlayerNames,
    alwaysShowDirection,
    setAlwaysShowDirection,
  } = useSettings();

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

      <label className={styles.label}>
        Show trace line
        <input
          type="checkbox"
          checked={showTraceLines}
          onChange={(event) => setShowTraceLines(event.target.checked)}
        />
      </label>
      <label className={styles.label}>
        Trace line length
        <input
          type="number"
          value={maxTraceLines}
          onChange={(event) => setMaxTraceLines(+event.target.value)}
        />
      </label>
      <label className={styles.label}>
        Show Player Names
        <input
          type="checkbox"
          checked={showPlayerNames}
          onChange={(event) => setShowPlayerNames(event.target.checked)}
        />
      </label>
      <label className={styles.label}>
        Always show direction
        <input
          type="checkbox"
          checked={alwaysShowDirection}
          onChange={(event) => setAlwaysShowDirection(event.target.checked)}
        />
      </label>
      <h3>Hotkeys</h3>
      <em>Hotkeys are configured in the Overwolf app</em>
    </div>
  );
}

export default Settings;

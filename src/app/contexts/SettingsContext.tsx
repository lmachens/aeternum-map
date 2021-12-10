import type { ReactNode } from 'react';
import { useContext } from 'react';
import { createContext } from 'react';
import { usePersistentState } from '../utils/storage';

type SettingsContextValue = {
  markerSize: number;
  setMarkerSize: (markerSize: number) => void;
  markerShowBackground: boolean;
  setMarkerShowBackground: (markerShowBackground: boolean) => void;
  showRegionBorders: boolean;
  setShowRegionBorders: (markerShowBackground: boolean) => void;
  maxTraceLines: number;
  setMaxTraceLines: (maxTraceLines: number) => void;
  showTraceLines: boolean;
  setShowTraceLines: (showTraceLines: boolean) => void;
  showPlayerNames: boolean;
  setShowPlayerNames: (showPlayerName: boolean) => void;
  alwaysShowDirection: boolean;
  setAlwaysShowDirection: (alwaysShowDirection: boolean) => void;
};
const SettingsContext = createContext<SettingsContextValue>({
  markerSize: 30,
  setMarkerSize: () => undefined,
  markerShowBackground: true,
  setMarkerShowBackground: () => undefined,
  showRegionBorders: true,
  setShowRegionBorders: () => undefined,
  maxTraceLines: 10,
  setMaxTraceLines: () => undefined,
  showTraceLines: false,
  setShowTraceLines: () => undefined,
  showPlayerNames: false,
  setShowPlayerNames: () => undefined,
  alwaysShowDirection: false,
  setAlwaysShowDirection: () => undefined,
});

type SettingsProviderProps = {
  children: ReactNode;
};
export function SettingsProvider({
  children,
}: SettingsProviderProps): JSX.Element {
  const [markerSize, setMarkerSize] = usePersistentState('markerSize', 30);
  const [markerShowBackground, setMarkerShowBackground] = usePersistentState(
    'markerShowBackground',
    true
  );
  const [showRegionBorders, setShowRegionBorders] = usePersistentState(
    'showRegionBorders',
    true
  );
  const [showTraceLines, setShowTraceLines] = usePersistentState(
    'show-trace-lines',
    true
  );
  const [maxTraceLines, setMaxTraceLines] = usePersistentState(
    'max-trace-lines',
    250
  );
  const [showPlayerNames, setShowPlayerNames] = usePersistentState(
    'show-player-names',
    false
  );
  const [alwaysShowDirection, setAlwaysShowDirection] = usePersistentState(
    'always-show-direction',
    false
  );

  return (
    <SettingsContext.Provider
      value={{
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
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextValue {
  return useContext(SettingsContext);
}

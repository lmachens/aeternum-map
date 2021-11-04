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
};
const SettingsContext = createContext<SettingsContextValue>({
  markerSize: 30,
  setMarkerSize: () => undefined,
  markerShowBackground: true,
  setMarkerShowBackground: () => undefined,
  showRegionBorders: true,
  setShowRegionBorders: () => undefined,
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

  return (
    <SettingsContext.Provider
      value={{
        markerSize,
        setMarkerSize,
        markerShowBackground,
        setMarkerShowBackground,
        showRegionBorders,
        setShowRegionBorders,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextValue {
  return useContext(SettingsContext);
}

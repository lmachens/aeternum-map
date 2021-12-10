import { useState, useEffect } from 'react';
import { NEW_WORLD_CLASS_ID } from './games';

export const SHOW_HIDE_APP = 'show_hide_app';
export const SETUP_MINIMAP = 'setup_minimap';
export const SHOW_HIDE_MINIMAP = 'show_hide_minimap';
export const ZOOM_IN_MINIMAP = 'zoom_in_minimap';
export const ZOOM_OUT_MINIMAP = 'zoom_out_minimap';
export const ZOOM_IN_MAP = 'zoom_in_map';
export const ZOOM_OUT_MAP = 'zoom_out_map';
export const SHOW_HIDE_DIRECTION = 'show_hide_direction';

export function useHotkeyBinding(name: string): string {
  const [hotkeyBinding, setHotkeyBinding] = useState<string>('');

  useEffect(() => {
    overwolf.settings.hotkeys.get((result) => {
      if (result.games) {
        const hotkey = result.games[NEW_WORLD_CLASS_ID].find(
          (hotkey) => hotkey.name === name
        );
        if (hotkey) {
          setHotkeyBinding(hotkey.binding);
        }
      }
    });

    const handleChange = (event: overwolf.settings.hotkeys.OnChangedEvent) => {
      if (event.name === name) {
        setHotkeyBinding(event.binding);
      }
    };
    overwolf.settings.hotkeys.onChanged.addListener(handleChange);

    return () => {
      overwolf.settings.hotkeys.onChanged.removeListener(handleChange);
    };
  }, []);

  return hotkeyBinding;
}

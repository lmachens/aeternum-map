import { useEffect } from 'react';
import type { Socket } from 'socket.io-client';
import type { DefaultEventsMap } from 'socket.io/dist/typed-events';

function useShareHotkeys(
  socket: Socket<DefaultEventsMap, DefaultEventsMap> | null
) {
  useEffect(() => {
    if (!socket) {
      return;
    }
    async function handleHotkeyPressed(
      event: overwolf.settings.hotkeys.OnPressedEvent
    ) {
      socket!.emit('hotkey', event.name);
    }
    overwolf.settings.hotkeys.onPressed.addListener(handleHotkeyPressed);
    return () => {
      overwolf.settings.hotkeys.onPressed.removeListener(handleHotkeyPressed);
    };
  }, [socket]);
}

export default useShareHotkeys;

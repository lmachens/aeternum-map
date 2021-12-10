import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { useAccount, useSetUser } from '../contexts/UserContext';
import { usePosition } from '../contexts/PositionContext';
import { getJSONItem, usePersistentState } from './storage';
import { toast } from 'react-toastify';
import useGroupPositions from '../components/WorldMap/useGroupPositions';

type Position = { location: [number, number]; rotation: number };
type Player = {
  steamId: string;
  steamName: string;
  username: string | null;
  position: Position | null;
};
export type Group = {
  [playerToken: string]: Player;
};

const { VITE_SOCKET_ENDPOINT } = import.meta.env;

function useReadLivePosition(): [
  boolean,
  (value: boolean | ((value: boolean) => boolean)) => void
] {
  const [isReading, setIsReading] = usePersistentState(
    'read-live-position',
    false
  );

  const { setPosition } = usePosition();
  const setUsername = useSetUser();
  const [group, setGroup] = usePersistentState<Group>('group', {});
  const { account } = useAccount();

  useGroupPositions(group);

  useEffect(() => {
    const token = getJSONItem('live-share-token', null);
    if (!token || !isReading) {
      return;
    }
    const socket = io(
      typeof VITE_SOCKET_ENDPOINT === 'string' ? VITE_SOCKET_ENDPOINT : '',
      {
        query: {
          token,
        },
        upgrade: false,
        transports: ['websocket'],
      }
    );

    const updateStatus = (group: Group) => {
      const sessionIds = Object.keys(group);
      const playerSessionId =
        sessionIds.find((sessionId) => {
          if (account) {
            const player = group[sessionId];
            return player.steamId === account.steamId;
          }
          return true;
        }) || sessionIds[0];

      const player = group[playerSessionId];
      if (player) {
        if (player.username) {
          setUsername(player.username);
        }
        if (player.position) {
          setPosition(player.position);
        }
        delete group[playerSessionId];
      }
      setGroup(group);
    };

    socket.emit('status', updateStatus);
    socket.on('update', updateStatus);

    const handleHotkey = (steamId: string, hotkey: string) => {
      if (steamId !== account?.steamId) {
        return;
      }
      const event = new CustomEvent(`hotkey-${hotkey}`);
      window.dispatchEvent(event);
    };
    socket.on('hotkey', handleHotkey);

    socket.on('connect', () => {
      if (socket.connected) {
        toast.success('Sharing live status 👌');
      }
    });

    return () => {
      socket.off('connect');
      socket.off('update');
      socket.off('hotkey');

      socket.close();
      setGroup({});
      toast.info('Stop sharing live status 🛑');
    };
  }, [isReading, account]);

  return [isReading, setIsReading];
}

export default useReadLivePosition;

import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAccount } from '../contexts/UserContext';
import { getJSONItem } from './storage';
import { toast } from 'react-toastify';
import useGroupPositions from '../components/WorldMap/useGroupPositions';
import { usePlayer } from '../contexts/PlayerContext';
import Peer from 'peerjs';

export type Position = { location: [number, number]; rotation: number };
export type Player = {
  steamId: string;
  steamName: string;
  username: string | null;
  position: Position | null;
  location: string | null;
  region: string | null;
  worldName: string | null;
  map: string | null;
};
export type Group = {
  [playerToken: string]: Player;
};

let latestPlayer: Player | null = null;
let latestGroup: Group | null = null;

function useReadLivePosition() {
  const { setPlayer, isSyncing, setIsSyncing } = usePlayer();
  const [group, setGroup] = useState<Group>({});
  const { account } = useAccount();

  useGroupPositions(group);

  useEffect(() => {
    if (!isSyncing) {
      return;
    }

    const token =
      account?.liveShareToken ||
      getJSONItem<string | null>('live-share-token', null);
    const serverUrl =
      account?.liveShareServerUrl ||
      getJSONItem<string | null>('live-share-server-url', null);

    if (!token || !serverUrl) {
      setIsSyncing(false);
      return;
    }

    const socket = io(serverUrl, {
      query: {
        token,
      },
      upgrade: false,
      transports: ['websocket'],
    });

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

      latestPlayer = group[playerSessionId];
      setPlayer(latestPlayer);
      delete group[playerSessionId];
      latestGroup = group;
      setGroup(group);
    };

    socket.emit('status', updateStatus);
    socket.on('status', updateStatus);

    const peerConnectedSteamIds: string[] = [];

    const updateData = (data: Partial<Player>) => {
      const { steamId, ...partialPlayer } = data;
      if (!steamId) {
        return;
      }
      if (latestPlayer && latestPlayer.steamId === steamId) {
        Object.assign(latestPlayer, partialPlayer);
        setPlayer({ ...latestPlayer });
      } else if (latestGroup) {
        const player = Object.values(latestGroup).find(
          (player) => player.steamId === steamId
        );
        if (player) {
          Object.assign(player, partialPlayer);
          setGroup({ ...latestGroup });
        }
      }
    };

    socket.on('data', (data: Partial<Player>) => {
      if (!data.steamId || peerConnectedSteamIds.includes(data.steamId)) {
        return;
      }
      updateData(data);
    });

    const handleHotkey = (steamId: string, hotkey: string) => {
      if (steamId !== account?.steamId) {
        return;
      }
      const event = new CustomEvent(`hotkey-${hotkey}`);
      window.dispatchEvent(event);
    };
    socket.on('hotkey', handleHotkey);

    let peer: Peer | null = null;
    socket.on('connect', () => {
      toast.success('Sharing live status 👌');

      peer = new Peer(socket.id.replace(/[^a-zA-Z ]/g, ''), {
        debug: 2,
      });
      peer.on('error', (error) => {
        console.error('Peer error', error);
      });
      peer.on('open', (id) => {
        console.log('My peer ID is: ' + id);
      });
      peer.on('connection', (conn) => {
        let connSteamId: string | null = null;
        conn.on('open', () => {
          console.log('Peer opened');
          socket.emit('status', updateStatus);
        });

        conn.on('error', (error) => {
          console.log('Peer error', error);
        });

        conn.on('close', () => {
          console.log('Peer closed');
          if (connSteamId) {
            const index = peerConnectedSteamIds.indexOf(connSteamId);
            if (index !== -1) {
              peerConnectedSteamIds.splice(index, 1);
            }
          }
        });

        conn.on('data', (data) => {
          if (data.group) {
            updateStatus(data.group);
            return;
          }
          if (data.steamId && !peerConnectedSteamIds.includes(data.steamId)) {
            peerConnectedSteamIds.push(data.steamId);
            connSteamId = data.steamId;
          }

          updateData(data);
        });
      });
    });

    return () => {
      socket.off('connect');
      socket.off('update');
      socket.off('hotkey');
      peer?.destroy();

      socket.close();
      setGroup({});
      toast.info('Stop sharing live status 🛑');
    };
  }, [
    account?.liveShareToken,
    account?.liveShareServerUrl,
    isSyncing,
    account?.steamId,
  ]);
}

export default useReadLivePosition;

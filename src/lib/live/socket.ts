import type http from 'http';
import { Server } from 'socket.io';

type Player = {
  steamId?: string;
  steamName?: string;
  username: string | null;
  position: { location: [number, number]; rotation: number } | null;
};

export const activePlayers: {
  [groupToken: string]: {
    [playerToken: string]: Player;
  };
} = {};

let io: Server | null = null;
export function initSocket(server: http.Server) {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (client) => {
    const { query } = client.handshake;
    if (typeof query.token !== 'string') {
      client.disconnect();
      return;
    }
    const token = query.token;
    const isOverwolfApp = query.isOverwolfApp === 'true';
    const steamId =
      typeof query.steamId === 'string' && query.steamId !== 'undefined'
        ? query.steamId
        : undefined;
    const steamName =
      typeof query.steamName === 'string' && query.steamName !== 'undefined'
        ? query.steamName
        : undefined;
    client.join(token);

    if (!activePlayers[token]) {
      activePlayers[token] = {};
    }

    if (isOverwolfApp && !activePlayers[token][client.id]) {
      activePlayers[token][client.id] = {
        steamId,
        steamName,
        username: null,
        position: null,
      };
    }

    client.to(token).emit('connected', isOverwolfApp, steamName);

    client.on('status', async (callback) => {
      const roomSockets = await io!.in(token).allSockets();
      const connections = [...roomSockets.values()].filter(
        (id) => !activePlayers[token][id]
      );
      callback(activePlayers[token], connections);
    });

    client.on('position', (position) => {
      if (!isOverwolfApp || !activePlayers[token][client.id]) {
        return;
      }
      activePlayers[token][client.id].position = position;
      io!.to(token).emit('update', activePlayers[token]);
    });

    client.on('username', (username) => {
      if (!isOverwolfApp || !activePlayers[token][client.id]) {
        return;
      }
      activePlayers[token][client.id].username = username;
      io!.to(token).emit('update', activePlayers[token]);
    });

    client.on('hotkey', (hotkey) => {
      io!.to(token).emit('hotkey', steamId, hotkey);
    });

    client.on('disconnect', () => {
      if (!isOverwolfApp) {
        client.to(token).emit('disconnected', isOverwolfApp, steamName);
      }
      if (activePlayers[token]?.[client.id]) {
        delete activePlayers[token][client.id];
      }
    });
  });

  io.of('/').adapter.on('delete-room', (room) => {
    delete activePlayers[room];
  });
}

export function getSocketServer(): Server {
  if (!io) {
    throw new Error('Socket not initialized');
  }
  return io;
}

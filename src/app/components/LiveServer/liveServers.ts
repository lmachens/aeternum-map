import { writeError } from '../../utils/logs';

export type LiveServer = {
  name: string;
  url: string;
  delay: number;
};

export const liveServers: LiveServer[] = [
  {
    name: 'Europe',
    url: 'wss://live1.aeternum-map.gg',
    delay: Infinity,
  },
  {
    name: 'US',
    url: 'wss://live2.aeternum-map.gg',
    delay: Infinity,
  },
];

const { VITE_API_ENDPOINT } = import.meta.env;

if (
  typeof VITE_API_ENDPOINT === 'string' &&
  VITE_API_ENDPOINT.includes('localhost')
) {
  liveServers.push({
    name: 'dev',
    url: VITE_API_ENDPOINT.replace('http', 'ws'),
    delay: Infinity,
  });
}

export const ping = async (liveServer: LiveServer) => {
  const now = Date.now();
  try {
    const url = liveServer.url.replace('ws', 'http');
    await fetch(`${url}/api/live/ping`);
    return Date.now() - now;
  } catch (error) {
    writeError(error);
    return Infinity;
  }
};

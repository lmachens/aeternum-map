import { Strategy as SteamStrategy } from 'passport-steam';
import authWithService from './authWithService';
import { ROOT_URL, STEAM_API_KEY } from '../env';

const steamStrategy = () =>
  new SteamStrategy(
    {
      // returnURL: 'http://localhost:3000/auth/steam/return',
      realm: ROOT_URL,
      apiKey: STEAM_API_KEY,
      returnURL: `${ROOT_URL}/oauth2/steam`,
      passReqToCallback: true,
    },
    authWithService('steam')
  );

export default steamStrategy;

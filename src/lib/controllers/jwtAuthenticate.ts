import { changeStream as OAuthContextChangeStream } from '../models/OAuthContext';
import userController from './userController';
import { FIFTEEN_MINUTES } from '../constants';

const jwtAuthenticate = (token, socket) => {
  const eventListener = async (next) => {
    const document = next?.fullDocument;

    if (document?.key === token) {
      if (document?.credential?.serviceData?.accessToken) {
        socket.emit('loginComplete', await userController.getJwt(token));
        cleanup();
      }
    }
  };

  const cleanup = () =>
    OAuthContextChangeStream.removeListener('change', eventListener);

  OAuthContextChangeStream.on('change', eventListener);

  setTimeout(cleanup, FIFTEEN_MINUTES);
};

export default jwtAuthenticate;

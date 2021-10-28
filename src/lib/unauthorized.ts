import jwtAuthenticate from './controllers/jwtAuthenticate';
import socketLogs from './middlewares/socketLogs';

const init = (ioNamespace) => {
  ioNamespace.on('connection', (socket) => {
    socket.use(socketLogs('unauthorized'));

    const unsubscribe = () => {};

    socket.on('checkToken', (token) => jwtAuthenticate(token, socket));

    socket.on('disconnect', unsubscribe);
  });
};

export default init;

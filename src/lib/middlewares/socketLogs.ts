// import { logger } from '../utils/logger'

const socketLogs = (namespace) => (socket, next) => {
  const [event, args] = socket;
  console.log('info', 'Socket on [%s]', namespace, { event, args });
  // logger.log('info', 'Socket on [%s]', namespace, { event, args })
  next();
};

export default socketLogs;

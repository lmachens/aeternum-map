import {
  PORT,
  MONGODB_URI,
  SCREENSHOTS_PATH,
  SESSION_SECRET,
  ROOT_URL,
} from './lib/env';
import express from 'express';
import cors from 'cors';
import { connectToMongoDb } from './lib/db';
import path from 'path';
import socketIo from 'socket.io';
import { initCommentsCollection } from './lib/comments/collection';
import { initMarkersCollection } from './lib/markers/collection';
import { initMarkerRoutesCollection } from './lib/markerRoutes/collection';
import { initUsersCollection } from './lib/users/collection';
import commentsRouter from './lib/comments/router';
import markersRouter from './lib/markers/router';
import markerRoutesRouter from './lib/markerRoutes/router';
import usersRouter from './lib/users/router';
import screenshotsRouter from './lib/screenshots/router';
import compression from 'compression';
import helmet from 'helmet';
import loginRouter from './lib/routes/login';
import oauth2Router from './lib/routes/oauth2';
import steamStrategy from './lib/auth/steamStrategy';
import session from 'express-session';
import passport from 'passport';
import { FIFTEEN_MINUTES } from './lib/constants';
import http from 'http';
import initUnauthorized from './lib/unauthorized';
import { initScreenshotsCollection } from './lib/screenshots/collection';

if (typeof PORT !== 'string') {
  throw new Error('PORT is not set');
}
if (typeof MONGODB_URI !== 'string') {
  throw new Error('MONGODB_URI is not set');
}
if (typeof SCREENSHOTS_PATH !== 'string') {
  throw new Error('SCREENSHOTS_PATH environment variable is not set');
}

const app = express();

// Middleware to set CORS headers
app.use(cors());

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
// Add secure middleware
app.use(helmet());

// Disable X-Powered-By header
app.disable('x-powered-by');

// Middleware for gzip compression
app.use(compression());

// Middleware that parses json and looks at requests where the Content-Type header matches the type option.
app.use(express.json());

app.use(
  session({
    secret: SESSION_SECRET,
    name: 'sessionId',
    saveUninitialized: false,
    resave: true,
    cookie: { maxAge: FIFTEEN_MINUTES },
  })
);

app.use(steamStrategy());

passport.serializeUser((user, cb) => cb(null, user));
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
passport.deserializeUser((obj, cb) => cb(null, obj));

app.use(passport.initialize());
app.use(passport.session());
// Serve API requests from the router
app.use('/api/oauth2', oauth2Router);
app.use('/api/login', loginRouter);

app.use('/api/comments', commentsRouter);
app.use('/api/markers', markersRouter);
app.use('/api/marker-routes', markerRoutesRouter);
app.use('/api/users', usersRouter);
app.use('/api/screenshots', screenshotsRouter);

// Static screenshots folder
app.use('/screenshots', express.static(SCREENSHOTS_PATH));

// Static assets folder
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// All other requests are answered with a 404
app.get('*', (_req, res) => {
  res.status(404).send('Not found');
});

const createSocket = (server) => {
  const ioRoot = socketIo(server);

  return (name, init) => {
    const ioNamespace = ioRoot.of(name);
    init(ioNamespace);

    return ioNamespace;
  };
};
function initSocket(server) {
  const ioSocket = createSocket(server);

  // ioSocket('/auth', initAuthorized)
  ioSocket('/unauth', initUnauthorized);
}

connectToMongoDb(MONGODB_URI).then(async () => {
  console.log('Connected to MongoDB');
  await Promise.all([
    initCommentsCollection(),
    initMarkersCollection(),
    initMarkerRoutesCollection(),
    initUsersCollection(),
    initScreenshotsCollection(),
  ]);

  const server = http.createServer(app);
  initSocket(server);
  server.listen(PORT, () => {
    console.log(`  App is running at ${ROOT_URL} in ${app.get('env')} mode`);
    console.log(`  Server port is ${PORT}`);
    console.log('  Press CTRL-C to stop\n');
  });
});

import express from 'express';
import passport from 'passport';
import oauth2login from '../controllers/oauth2Login';

// eslint-disable-next-line new-cap
const loginRouter = express.Router();

loginRouter.get(
  '/steam',
  oauth2login,
  passport.authenticate('steam', {
    scope: ['email'],
    session: true,
  })
);

export default loginRouter;

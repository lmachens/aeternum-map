import express from 'express';
import passport from 'passport';
import oauth2Callback from '../controllers/oauth2Callback';

// eslint-disable-next-line new-cap
const oauth2Router = express.Router();

oauth2Router.get('/steam', passport.authenticate('steam'), oauth2Callback);

export default oauth2Router;

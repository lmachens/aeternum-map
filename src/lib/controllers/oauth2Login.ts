import OAuthContext from '../models/OAuthContext';
import Boom from '@hapi/boom';

const oauth2login = (req, res, next) => {
  const { token } = req.query;
  try {
    const oAuthContext = new OAuthContext({
      key: token,
    });
    oAuthContext.save();
    req.session.token = token;
    req.session.save();
    return next();
  } catch (e) {
    return next(Boom.badRequest(e));
  }
};

export default oauth2login;

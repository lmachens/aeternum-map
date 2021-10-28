import asyncHandler from '../middlewares/asyncHandler';
import Boom from '@hapi/boom';

const oauth2Callback = asyncHandler(async (req, res, next) => {
  try {
    return res.render('OAuthSuccessPage');
  } catch (err) {
    return next(Boom.badRequest(err));
  }
});

export default oauth2Callback;

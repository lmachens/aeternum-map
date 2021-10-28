import Boom from '@hapi/boom';
import userController from '../controllers/userController';

const authWithService =
  (service: 'steam') =>
  async (
    req: Request,
    identifier: string,
    profile: any,
    done: (args: any) => void
  ) => {
    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const token = req.session.token;
      if (!token) {
        throw new Error('not found token');
      }
      const user = await userController.findOrCreateCredentials(
        identifier,
        profile,
        token,
        service
      );
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      return done(null, user);
    } catch (err) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      return done(Boom.badRequest(err));
    }
  };

export default authWithService;

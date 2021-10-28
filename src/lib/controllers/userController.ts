import User from '../models/User';
import OAuthContext from '../models/OAuthContext';

/**
 * find or create credentials
 * @param {string} accessToken
 * @param {Object} profile
 * @param {string} token
 * @param {string} service
 * @return {Promise<{accessToken: *}|{emails: [{value: String | StringConstructor}], provider: String | StringConstructor, displayName: String | StringConstructor, name: {familyName: String | StringConstructor, givenName: String | StringConstructor, middleName: String | StringConstructor}, id: String | StringConstructor, accessToken: String | StringConstructor, photos: [{value: String | StringConstructor}]}>}
 */
const findOrCreateCredentials = async function (
  accessToken,
  profile,
  token,
  service
) {
  try {
    const update = {
      credential: {
        serviceName: service,
        serviceData: { ...profile, accessToken },
      },
    };
    const oAuthProxy = await OAuthContext.findOneAndUpdate(
      { key: token },
      update,
      {
        new: true,
      }
    );
    if (!oAuthProxy) {
      throw new Error('not found context proxy');
    }
    return oAuthProxy.credential.serviceData;
  } catch (err) {
    throw new Error(err);
  }
};

const findOrCreateUserAfterCredentials = async function (token) {
  try {
    const oAuthProxy = await OAuthContext.findOne({ key: token });
    if (!oAuthProxy) {
      throw new Error('authorization not complete');
    }
    const profile = oAuthProxy.credential.serviceData;
    const emails =
      profile?.emails?.reduce((acc, email) => [...acc, email?.value], []) || [];

    const user = await User.findOne({
      $or: [
        {
          emails: {
            $in: emails,
          },
        },
        {
          $or: [
            {
              'services.steam.id': profile.id,
            },
          ],
        },
      ],
    });

    if (!user) {
      const newUserObject = {
        emails: emails,
        photo: profile.photos.length ? profile.photos[0].value : null,
        username: profile.displayName,
        services: {
          [oAuthProxy.credential.serviceName]: profile,
        },
      };

      const newUser = new User(newUserObject);
      await newUser.save();
      await OAuthContext.deleteOne({ key: token });
      return newUser;
    }

    user.services[oAuthProxy.credential.serviceName] = profile;

    user.emails = [...new Set([...user.emails, ...emails])];

    user.save();
    await OAuthContext.deleteOne({ key: token });
    return user;
  } catch (err) {
    throw new Error(err);
  }
};

const getJwt = async function (token) {
  const user = await findOrCreateUserAfterCredentials(token);
  const userColl = await User.findOne({
    _id: user._id,
  });
  return await userColl.generateAuthToken();
};

export const userController = {
  getJwt,
  findOrCreateCredentials,
  findOrCreateUserAfterCredentials,
};

export default userController;

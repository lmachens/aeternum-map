export const oauth2 = {
  accessToken: String,
  provider: String,
  id: String,
  displayName: String,
  name: {
    familyName: String,
    givenName: String,
    middleName: String,
  },
  emails: {
    type: [
      {
        value: String,
      },
    ],
    default: undefined,
  },
  photos: {
    type: [
      {
        value: String,
      },
    ],
    default: undefined,
  },
};

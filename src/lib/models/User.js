import mongoose from 'mongoose';
import validator from 'validator';
import jwt from 'jsonwebtoken';
import { oauth2 } from './social/oauth2';
import createSubscription from '../utils/createSubscription';

const { Schema } = mongoose;

// eslint-disable-next-line new-cap
const userSchema = Schema({
  createdAt: { type: Date, default: Date.now },
  emails: [
    {
      type: String,
      required: false,
      unique: true,
      lowercase: true,
      validate: (value) => {
        if (!validator.isEmail(value)) {
          throw new Error({ error: 'Invalid Email address' });
        }
      },
    },
  ],
  tokens: [
    {
      token: {
        type: String,
        required: true,
      },
    },
  ],
  settings: {
    hideAvatar: { type: Boolean, default: false },
    anonymousMode: { type: Boolean, default: false },
  },
  username: { type: String, required: true },
  photo: { type: String },
  comments: [{ type: Schema.Types.ObjectId, ref: 'Comments' }],
  likes: [{ type: Schema.Types.ObjectId, ref: 'Comments' }],
  // profile: {},
  services: {
    steam: oauth2,
  },
});

userSchema.methods.generateAuthToken = async function () {
  try {
    // Generate an auth token for the user
    const user = this;
    const token = jwt.sign({ _id: user._id }, process.env.JWT_KEY);
    user.tokens = user.tokens.concat({ token });
    await user.save();
    return { token, id: user._id };
  } catch (err) {
    throw new Error(err);
  }
};

const User = mongoose.model('User', userSchema);

export const subscription = createSubscription(User);

export default User;

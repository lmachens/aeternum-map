import mongoose from 'mongoose';
import { oauth2 } from './social/oauth2';

const { Schema } = mongoose;

const servicesPendingSchema = new Schema({
  key: String,
  credential: {
    serviceName: String,
    serviceData: oauth2,
  },
  credentialSecret: String,
  createdAt: { type: Date, default: Date.now },
});

const OAuthContext = mongoose.model('OAuthContext', servicesPendingSchema);

export const changeStream = OAuthContext.watch([], {
  fullDocument: 'updateLookup',
});

export default OAuthContext;

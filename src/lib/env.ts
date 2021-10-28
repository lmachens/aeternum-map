import dotenv from 'dotenv';
dotenv.config();

if (typeof process.env.PORT !== 'string') {
  throw new Error('PORT is not set');
}
if (typeof process.env.MONGODB_URI !== 'string') {
  throw new Error('MONGODB_URI is not set');
}
if (typeof process.env.SCREENSHOTS_PATH !== 'string') {
  throw new Error('SCREENSHOTS_PATH environment variable is not set');
}
if (typeof process.env.DISCORD_PUBLIC_WEBHOOK_URL !== 'string') {
  throw new Error('DISCORD_PUBLIC_WEBHOOK_URL is not set');
}
if (typeof process.env.DISCORD_PRIVATE_WEBHOOK_URL !== 'string') {
  throw new Error('DISCORD_PRIVATE_WEBHOOK_URL is not set');
}
if (typeof process.env.SESSION_SECRET !== 'string') {
  throw new Error('SESSION_SECRET is not set');
}
if (typeof process.env.ROOT_URL !== 'string') {
  throw new Error('ROOT_URL is not set');
}
if (typeof process.env.STEAM_API_KEY !== 'string') {
  throw new Error('STEAM_API_KEY is not set');
}

export const {
  PORT,
  MONGODB_URI,
  SCREENSHOTS_PATH,
  DISCORD_PUBLIC_WEBHOOK_URL,
  DISCORD_PRIVATE_WEBHOOK_URL,
  SESSION_SECRET,
  ROOT_URL,
  STEAM_API_KEY,
} = process.env;

import fetch from 'isomorphic-fetch';
import { DISCORD_PUBLIC_WEBHOOK_URL, DISCORD_PRIVATE_WEBHOOK_URL } from './env';

const MAX_DISCORD_MESSAGE_LENGTH = 2000;
export function postToDiscord(
  content: string,
  isPublic = true
): Promise<Response> {
  const webhookURL = isPublic
    ? DISCORD_PUBLIC_WEBHOOK_URL
    : DISCORD_PRIVATE_WEBHOOK_URL;
  return fetch(webhookURL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username: 'BottyMcBotface',
      constent: content.substring(0, MAX_DISCORD_MESSAGE_LENGTH),
    }),
  });
}

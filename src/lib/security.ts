import { MODERATOR_SECRET } from './env';

export function isModerator(secret: unknown) {
  return secret === MODERATOR_SECRET;
}

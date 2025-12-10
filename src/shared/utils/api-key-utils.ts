import { nanoid } from 'nanoid';

export function genApiKeyNano(size = 32) {
  return nanoid(size);
}

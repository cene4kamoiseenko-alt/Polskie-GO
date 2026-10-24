import { pbkdf2 as pbkdf2Cb, randomBytes, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const pbkdf2 = promisify(pbkdf2Cb);
// Помірна кількість ітерацій: вхід в адмінку має вкладатися в ліміт CPU безкоштовного Worker.
const ITERATIONS = 20_000;

/** Хеш пароля адміністратора (PBKDF2-SHA256). */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const hash = await pbkdf2(password, salt, ITERATIONS, 32, 'sha256');
  return `pbkdf2$${ITERATIONS}$${salt.toString('base64')}$${hash.toString('base64')}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [algo, iter, saltB64, hashB64] = stored.split('$');
  if (algo !== 'pbkdf2' || !iter || !saltB64 || !hashB64) return false;
  const expected = Buffer.from(hashB64, 'base64');
  const actual = await pbkdf2(password, Buffer.from(saltB64, 'base64'), Number(iter), expected.length, 'sha256');
  return timingSafeEqual(expected, actual);
}

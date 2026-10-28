/**
 * Хто може запускати платну генерацію озвучки (AUDIO_GENERATION_MODE, docs/AUDIO_LIBRARY_RU.md).
 *  - admin_only (типово й за будь-якого іншого значення) — лише адмінка: аудіобібліотека й порівняння голосів;
 *  - off — ніхто, навіть адмінка (аварійний вимикач витрат).
 * Гравець не генерує ніколи: кнопка динаміка грає лише готовий MP3 з R2 (GET /api/audio/…).
 */
import { getBindings, type Bindings } from '../env';
import { HttpError } from '../lib/errors';

export type AudioGenerationMode = 'admin_only' | 'off';

export const audioGenerationMode = (env: Partial<Bindings> = getBindings()): AudioGenerationMode =>
  (env.AUDIO_GENERATION_MODE ?? '').trim().toLowerCase() === 'off' ? 'off' : 'admin_only';

/** Перевірка перед кожним платним запитом до провайдера озвучки: платник — лише адмін, і генерацію не вимкнено. */
export function assertGenerationAllowed(payer: 'user' | 'admin' | undefined, env: Partial<Bindings> = getBindings()) {
  if (payer !== 'admin') throw new HttpError(403, 'generation_admin_only', 'Озвучка генерируется только из админки (AUDIO_GENERATION_MODE=admin_only)');
  if (audioGenerationMode(env) === 'off') throw new HttpError(403, 'generation_off', 'Генерация озвучки выключена (AUDIO_GENERATION_MODE=off)');
}

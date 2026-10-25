/**
 * Підтверджена спроба вимови. Текст для зарахування бере лише сервер: запис розпізнає серверний STT,
 * результат підписується (HMAC) і прив'язується до користувача, сесії та завдання, живе 5 хвилин
 * і приймається один раз (nonce зберігається в стані сесії). Транскрипт, надісланий клієнтом
 * (браузерне розпізнавання), не підтверджений — це тренування без XP і без помилки.
 * Збіг транскрипту — це збіг тексту розпізнавання, а не фонетична оцінка вимови.
 */
import { randomUUID } from 'node:crypto';
import { signToken, verifyToken } from '../lib/token';

export const SPEECH_ATTEMPT_TTL_SEC = 300;

type Binding = { userId: string; sessionId: string; key: string };
type Payload = { k: 'speech'; u: string; s: string; i: string; t: string; n: string };

export function issueSpeechAttempt(b: Binding & { transcript: string }): string {
  const p: Payload = { k: 'speech', u: b.userId, s: b.sessionId, i: b.key, t: b.transcript, n: randomUUID() };
  return signToken(p, SPEECH_ATTEMPT_TTL_SEC);
}

/** Розпізнаний сервером текст і nonce — або null (підробка, чужа сесія/завдання, прострочено). */
export function readSpeechAttempt(token: string, b: Binding): { transcript: string; nonce: string } | null {
  const p = verifyToken<Payload>(token);
  if (!p || p.k !== 'speech' || p.u !== b.userId || p.s !== b.sessionId || p.i !== b.key) return null;
  if (typeof p.t !== 'string' || typeof p.n !== 'string') return null;
  return { transcript: p.t, nonce: p.n };
}

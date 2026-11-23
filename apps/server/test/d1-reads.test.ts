/**
 * Лимит чтения D1 (2026-11-23): Cloudflare предупредил, что к утру потрачено 75 % суточного бесплатного лимита (5 млн прочитанных
 * строк), — после него база отвечает ошибками до полуночи UTC. Причины: очистки в cron перебирали целые таблицы (telegram_updates,
 * раунды викторины, журнал действий) на каждом запуске; напоминания и приглашения перебирали настройки всех игроков каждые 15 минут;
 * очередь озвучки на каждом шаге пересчитывала все фразы задания. Тест — страж: на реалистичных объёмах запуск cron и шаг озвучки
 * читают ограниченное число строк (meta.rows_read самого D1).
 */
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { audioNorm } from '@polski-go/shared';
import { bindDb } from '../src/db';
import { runScheduled } from '../src/jobs';
import { audioId } from '../src/services/audio-catalog';
import { createAudioJob, tickAudioJob } from '../src/services/audio-jobs';
import { disposeEnv, getEnv } from './helpers';

afterAll(disposeEnv);

let d1: D1Database;
const log: { sql: string; read: number }[] = [];
/** Обёртка D1: каждый запрос — SQL и meta.rows_read. */
function wrap(db: D1Database): D1Database {
  const rec = (q: string, r: { meta?: { rows_read?: number } } | null) => log.push({ sql: q.replace(/\s+/g, ' ').slice(0, 200), read: r?.meta?.rows_read ?? 0 });
  const stmt = (s: D1PreparedStatement, q: string): D1PreparedStatement =>
    new Proxy(s, {
      get(t, p) {
        const v = Reflect.get(t, p) as (...a: unknown[]) => unknown;
        if (p === 'bind') return (...a: unknown[]) => stmt(v.apply(t, a) as D1PreparedStatement, q);
        if (p === 'all' || p === 'run' || p === 'first') return async (...a: unknown[]) => { const r = await v.apply(t, a); rec(q, r as never); return r; };
        if (p === 'raw') return async (...a: unknown[]) => { rec(q, (await t.all()) as never); return v.apply(t, a); };
        return typeof v === 'function' ? v.bind(t) : v;
      },
    });
  return new Proxy(db, {
    get(t, p) {
      const v = Reflect.get(t, p) as (...a: unknown[]) => unknown;
      if (p === 'prepare') return (q: string) => { const s = v.call(t, q) as D1PreparedStatement & { __sql?: string }; s.__sql = q; return stmt(s, q); };
      if (p === 'batch') return async (list: (D1PreparedStatement & { __sql?: string })[]) => { const rs = (await v.call(t, list)) as never[]; rs.forEach((r, i) => rec(`[batch] ${list[i]?.__sql ?? '?'}`, r)); return rs; };
      return typeof v === 'function' ? v.bind(t) : v;
    },
  });
}
const measure = async (fn: () => Promise<unknown>) => {
  log.length = 0;
  bindDb(wrap(d1));
  try {
    await fn();
  } finally {
    bindDb(d1);
  }
  return { total: log.reduce((s, x) => s + x.read, 0), top: [...log].sort((a, b) => b.read - a.read).slice(0, 5) };
};

const N = 1500;
beforeAll(async () => {
  d1 = (await getEnv()).env.DB as unknown as D1Database;
  const now = Date.now();
  const q = (v: unknown) => (v === null ? 'NULL' : typeof v === 'number' ? String(v) : `'${String(v)}'`);
  const bulk = async (head: string, rows: unknown[][]) => {
    for (let i = 0; i < rows.length; i += 400) await d1.prepare(`${head} VALUES ${rows.slice(i, i + 400).map((r) => `(${r.map(q).join(',')})`).join(',')}`).run();
  };
  const R = (n: number, f: (i: number) => unknown[]) => Array.from({ length: n }, (_, i) => f(i));
  await bulk('INSERT INTO users (id, telegram_id, first_name, referral_code, created_at, last_seen_at)', R(N, (i) => [`d1u${i}`, 6_000_000 + i, 'U', `d1rc${i}`, now - 86_400_000, now]));
  await bulk('INSERT INTO user_settings (user_id, ui_language, reminder_hour, notifications_enabled, updated_at)', R(N, (i) => [`d1u${i}`, 'ru', 8 + (i % 14), i % 5 ? 1 : 0, now - 86_400_000]));
  await bulk('INSERT INTO player_progress (user_id, last_active_day)', R(N, (i) => [`d1u${i}`, null]));
  await bulk('INSERT INTO bot_quiz_players (telegram_id, push_enabled, answered)', R(N, (i) => [6_000_000 + i, 1, 1]));
  // Большие журналы: обновления Telegram за 3 дня, раунды викторины, старые записи журнала действий.
  await bulk('INSERT INTO telegram_updates (update_id, created_at)', R(6000, (i) => [800_000 + i, now - (i % 60) * 3_600_000]));
  await bulk('INSERT INTO admin_audit_logs (id, action, entity, created_at)', R(3000, (i) => [`d1a${i}`, 'update', 'lesson', now - 30 * 86_400_000]));
  vi.spyOn(globalThis, 'fetch').mockImplementation(async () => new Response(JSON.stringify({ ok: true, result: { message_id: 1 } }), { headers: { 'content-type': 'application/json' } }));
});

describe('сколько строк читает cron (лимит D1 — 5 млн в сутки)', () => {
  it('очистки идут по индексам; второй запуск в том же часу не перебирает игроков заново', async () => {
    const t = new Date();
    t.setUTCHours(3, 0, 30, 0); // ночь: ни напоминаний, ни приглашений по часам игроков
    const first = await measure(() => runScheduled(t));
    // Первый запуск часа: перебор поясов и кандидатов допустим, но не на каждом запуске.
    expect(first.total, JSON.stringify(first.top)).toBeLessThan(N * 6);
    const second = await measure(() => runScheduled(new Date(t.getTime() + 15 * 60_000)));
    // Раньше: ~6 тыс. (telegram_updates) + 3 тыс. (журнал) + ~5 N (настройки и игроки викторины) на каждом запуске.
    expect(second.total, JSON.stringify(second.top)).toBeLessThan(300);
  });

  it('новый игрок (настройки изменились) — следующий запуск снова ищет кандидатов', async () => {
    const t = new Date();
    t.setUTCHours(4, 0, 30, 0);
    await runScheduled(t);
    await d1.prepare(`INSERT INTO users (id, telegram_id, first_name, referral_code) VALUES ('d1new', 6999999, 'N', 'd1new')`).run();
    await d1.prepare(`INSERT INTO user_settings (user_id, reminder_hour, notifications_enabled) VALUES ('d1new', 9, 1)`).run();
    const again = await measure(() => runScheduled(new Date(t.getTime() + 15 * 60_000)));
    expect(again.top.some((x) => x.sql.includes('reminder_hour')), JSON.stringify(again.top)).toBe(true);
  });
});

describe('очередь озвучки читает только свою порцию', () => {
  it('шаг задания на 600 фраз читает десятки строк, а не все фразы', async () => {
    const items = Array.from({ length: 600 }, (_, i) => {
      const text = `Fraza kontrolna ${i}.`;
      return { id: audioId(audioNorm(text)), text, model: 'eleven_flash_v2_5' as const };
    });
    const { id } = await createAudioJob({ title: 'D1', items, maxCredits: 0 });
    // Без ключа ElevenLabs шаг останавливает задание с причиной — но сначала берёт порцию; важно, сколько он прочитал.
    const r = await measure(() => tickAudioJob(id, 10));
    expect(r.total, JSON.stringify(r.top)).toBeLessThan(120);
  });
});

import { afterAll, describe, expect, it } from 'vitest';
import { eq } from 'drizzle-orm';
import { addDays, dayKey } from '@polski-go/shared';
import { db } from '../src/db';
import { playerProgress, userSettings } from '../src/db/schema';
import { disposeEnv, login } from './helpers';

afterAll(disposeEnv);

describe('Налаштування: підказка вимови', () => {
  it('типово «просто», змінюється на IPA чи «сховати», інше значення відхиляється', async () => {
    const { call } = await login();
    expect((await call('GET', '/api/me')).body.settings.pronHint).toBe('simple');
    expect((await call('PATCH', '/api/me/settings', { pronHint: 'ipa' })).body.settings.pronHint).toBe('ipa');
    expect((await call('PATCH', '/api/me/settings', { pronHint: 'off' })).body.settings.pronHint).toBe('off');
    expect((await call('PATCH', '/api/me/settings', { pronHint: 'cyrillic' })).status).toBe(400);
    expect((await call('GET', '/api/me')).body.settings.pronHint).toBe('off');
  });
});

describe('зміна часового пояса не спалює серію', () => {
  it('переліт Варшава → Токіо після заняття «вчора»: серія жива, урок у Токіо її продовжує', async () => {
    const { call, user } = await login();
    const now = new Date();
    const warsawToday = dayKey(now, 'Europe/Warsaw');
    const tokyoToday = dayKey(now, 'Asia/Tokyo');
    await db.update(userSettings).set({ timezone: 'Europe/Warsaw' }).where(eq(userSettings.userId, user.id));
    await db.update(playerProgress).set({ streakCurrent: 9, streakBest: 9, lastActiveDay: addDays(warsawToday, -1) }).where(eq(playerProgress.userId, user.id));
    expect((await call('PATCH', '/api/me/settings', { timezone: 'Asia/Tokyo' })).status).toBe(200);
    const p = (await db.select().from(playerProgress).where(eq(playerProgress.userId, user.id)))[0];
    // «Вчора» в старому поясі лишається «вчора» в новому.
    expect(p.lastActiveDay).toBe(addDays(tokyoToday, -1));
    expect((await call('GET', '/api/me')).body.progress.streak).toBe(9);
  });

  it('той самий пояс або без заняття — нічого не змінюється', async () => {
    const { call, user } = await login();
    await db.update(playerProgress).set({ streakCurrent: 0, lastActiveDay: null }).where(eq(playerProgress.userId, user.id));
    expect((await call('PATCH', '/api/me/settings', { timezone: 'America/New_York' })).status).toBe(200);
    expect((await db.select().from(playerProgress).where(eq(playerProgress.userId, user.id)))[0].lastActiveDay).toBeNull();
  });
});

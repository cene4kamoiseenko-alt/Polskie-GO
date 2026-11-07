/**
 * Жалобы игроков (2026-11-07, требование Google Play к приложениям, где игроки видят чужие имена): отправка, повтор, пределы, разбор в админке, каскад при удалении.
 * Устройство — services/reports.ts, routes/game.ts (POST /api/players/:id/report), routes/admin.ts (GET /api/admin/reports, POST …/resolve).
 */
import { afterAll, describe, expect, it } from 'vitest';
import { and, eq } from 'drizzle-orm';
import { db } from '../src/db';
import { playerReports, userProfiles, users } from '../src/db/schema';
import { MAX_REPORTS_PER_DAY, NEUTRAL_NAME } from '../src/services/reports';
import { disposeEnv, login, request } from './helpers';

afterAll(disposeEnv);

async function admin() {
  const res = await request('POST', '/api/admin/login', { email: 'admin@test.dev', password: 'admin-password-123' });
  const token = res.body.token as string;
  const h = { authorization: `Bearer ${token}` };
  return {
    get: (url: string) => request('GET', `/api/admin${url}`, undefined, h),
    post: (url: string, payload: unknown) => request('POST', `/api/admin${url}`, payload, h),
  };
}
const rowsFor = (reportedId: string) => db.select().from(playerReports).where(eq(playerReports.reportedId, reportedId));

describe('жалоба на игрока', () => {
  it('игрок жалуется на другого: одна открытая жалоба; повтор не создаёт вторую и не падает', async () => {
    const a = await login();
    const b = await login();
    const first = await a.call('POST', `/api/players/${b.user.id}/report`, { reason: 'name' });
    expect(first.status).toBe(200);
    expect(first.body.ok).toBe(true);
    expect((await a.call('POST', `/api/players/${b.user.id}/report`, { reason: 'photo' })).status).toBe(200);
    const rows = await rowsFor(b.user.id);
    expect(rows).toHaveLength(1);
    expect(rows[0].status).toBe('OPEN');
    expect(rows[0].reporterId).toBe(a.user.id);
    expect(rows[0].reason).toBe('photo');
  });

  it('на себя пожаловаться нельзя (400), на несуществующего — 404, неизвестная причина — 400, без входа — 401', async () => {
    const a = await login();
    const b = await login();
    expect((await a.call('POST', `/api/players/${a.user.id}/report`, { reason: 'name' })).status).toBe(400);
    expect((await a.call('POST', '/api/players/no-such-player/report', { reason: 'name' })).status).toBe(404);
    expect((await a.call('POST', `/api/players/${b.user.id}/report`, { reason: 'spam' })).status).toBe(400);
    expect((await a.call('POST', `/api/players/${b.user.id}/report`, {})).status).toBe(400);
    expect((await request('POST', `/api/players/${b.user.id}/report`, { reason: 'name' })).status).toBe(401);
    expect(await rowsFor(b.user.id)).toHaveLength(0);
  });

  it(`не больше ${MAX_REPORTS_PER_DAY} новых жалоб в сутки от одного игрока`, async () => {
    const a = await login();
    const targets = [];
    for (let i = 0; i < MAX_REPORTS_PER_DAY + 1; i++) targets.push(await login());
    // Первые жалобы пишем напрямую: ограничитель частоты запросов (10 в минуту) здесь не проверяется, только суточный предел.
    for (const t of targets.slice(0, MAX_REPORTS_PER_DAY)) await db.insert(playerReports).values({ reporterId: a.user.id, reportedId: t.user.id, reason: 'name' });
    const over = await a.call('POST', `/api/players/${targets[MAX_REPORTS_PER_DAY].user.id}/report`, { reason: 'name' });
    expect(over.status).toBe(429);
    expect(JSON.stringify(over.body)).toContain('too_many_reports');
    // Повторная жалоба на того, на кого уже жаловались, предел не обходит и новой строки не создаёт.
    expect((await a.call('POST', `/api/players/${targets[0].user.id}/report`, { reason: 'other' })).status).toBe(429);
  });

  it('удаление аккаунта убирает его жалобы и жалобы на него', async () => {
    const a = await login();
    const b = await login();
    const c = await login();
    await a.call('POST', `/api/players/${b.user.id}/report`, { reason: 'name' });
    await b.call('POST', `/api/players/${c.user.id}/report`, { reason: 'name' });
    expect((await b.call('DELETE', '/api/me', { confirm: 'DELETE' })).status).toBe(200);
    expect(await rowsFor(b.user.id)).toHaveLength(0);
    expect(await rowsFor(c.user.id)).toHaveLength(0);
  });
});

describe('разбор жалоб в админке', () => {
  it('список группирует жалобы по игроку: сколько, причины, имя; больше жалоб — выше', async () => {
    const adm = await admin();
    const target = await login();
    const other = await login();
    const r1 = await login();
    const r2 = await login();
    await r1.call('POST', `/api/players/${target.user.id}/report`, { reason: 'name' });
    await r2.call('POST', `/api/players/${target.user.id}/report`, { reason: 'photo' });
    await r1.call('POST', `/api/players/${other.user.id}/report`, { reason: 'other' });
    const list = (await adm.get('/reports')).body.items as { userId: string; count: number; reasons: string[]; name: string; banned: boolean }[];
    const mine = list.filter((x) => x.userId === target.user.id || x.userId === other.user.id);
    expect(mine[0].userId).toBe(target.user.id);
    expect(mine[0].count).toBe(2);
    expect(mine[0].reasons.sort()).toEqual(['name', 'photo']);
    expect(mine[0].name).toBe(`User${target.telegramId}`);
    expect(mine[0].banned).toBe(false);
    expect(mine[1].count).toBe(1);
  });

  it('«сбросить имя»: имя меняется на нейтральное, жалобы закрыты; повторный разбор — 404; новая жалоба открывает снова', async () => {
    const adm = await admin();
    const target = await login();
    const r1 = await login();
    await target.call('PATCH', '/api/me/profile', { displayName: 'Плохое имя' });
    await r1.call('POST', `/api/players/${target.user.id}/report`, { reason: 'name' });
    const res = await adm.post(`/reports/${target.user.id}/resolve`, { action: 'reset_name' });
    expect(res.status).toBe(200);
    expect(res.body.closed).toBe(1);
    const profile = (await db.select().from(userProfiles).where(eq(userProfiles.userId, target.user.id)))[0];
    expect(profile.displayName).toBe(NEUTRAL_NAME);
    expect((await rowsFor(target.user.id))[0].status).toBe('DONE');
    expect((await rowsFor(target.user.id))[0].resolvedAt).not.toBeNull();
    expect((await adm.post(`/reports/${target.user.id}/resolve`, { action: 'dismiss' })).status).toBe(404);
    expect(((await adm.get('/reports')).body.items as { userId: string }[]).some((x) => x.userId === target.user.id)).toBe(false);
    expect(((await adm.get('/reports?status=DONE')).body.items as { userId: string }[]).some((x) => x.userId === target.user.id)).toBe(true);
    // Игрок снова меняет имя, на него снова жалуются — жалоба открывается заново.
    await r1.call('POST', `/api/players/${target.user.id}/report`, { reason: 'name' });
    expect((await rowsFor(target.user.id))[0].status).toBe('OPEN');
  });

  it('«заблокировать»: игрок блокируется и больше не входит; «закрыть» ничего не меняет', async () => {
    const adm = await admin();
    const bad = await login();
    const fine = await login();
    const r1 = await login();
    await r1.call('POST', `/api/players/${bad.user.id}/report`, { reason: 'name' });
    await r1.call('POST', `/api/players/${fine.user.id}/report`, { reason: 'other' });
    expect((await adm.post(`/reports/${bad.user.id}/resolve`, { action: 'ban' })).status).toBe(200);
    expect((await db.select().from(users).where(eq(users.id, bad.user.id)))[0].isBanned).toBe(true);
    expect((await bad.call('GET', '/api/me')).status).toBe(403);
    expect((await adm.post(`/reports/${fine.user.id}/resolve`, { action: 'dismiss' })).status).toBe(200);
    expect((await db.select().from(users).where(eq(users.id, fine.user.id)))[0].isBanned).toBe(false);
    expect((await db.select().from(userProfiles).where(and(eq(userProfiles.userId, fine.user.id))))[0].displayName).not.toBe(NEUTRAL_NAME);
    expect((await fine.call('GET', '/api/me')).status).toBe(200);
  });

  it('разбор жалоб требует входа в админку и не принимает неизвестное действие', async () => {
    const adm = await admin();
    const t = await login();
    expect((await request('GET', '/api/admin/reports')).status).toBe(401);
    expect((await request('POST', `/api/admin/reports/${t.user.id}/resolve`, { action: 'dismiss' })).status).toBe(401);
    expect((await adm.post(`/reports/${t.user.id}/resolve`, { action: 'delete_everything' })).status).toBe(400);
  });
});

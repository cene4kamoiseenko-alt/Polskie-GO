import { createMiddleware } from 'hono/factory';
import { eq } from 'drizzle-orm';
import { db } from './db';
import { adminUsers, users } from './db/schema';
import type { AppEnv } from './hono';
import { HttpError } from './lib/errors';
import { verifyToken } from './lib/token';

function bearer(h: string | undefined): string | null {
  return h?.startsWith('Bearer ') ? h.slice(7) : null;
}

/** Користувач Mini App (токен видається після перевірки initData). */
export const requireUser = createMiddleware<AppEnv>(async (c, next) => {
  const token = bearer(c.req.header('authorization'));
  const payload = token ? verifyToken<{ uid: string; typ: string }>(token) : null;
  if (!payload || payload.typ !== 'user') throw new HttpError(401, 'unauthorized');
  const user = await db.query.users.findFirst({ where: eq(users.id, payload.uid), columns: { id: true, isBanned: true } });
  if (!user) throw new HttpError(401, 'unauthorized');
  if (user.isBanned) throw new HttpError(403, 'banned');
  c.set('userId', user.id);
  await next();
});

/** Адміністратор з потрібною роллю. SUPERADMIN має доступ до всього. */
export function requireAdmin(...roles: ('SUPERADMIN' | 'EDITOR' | 'SUPPORT')[]) {
  return createMiddleware<AppEnv>(async (c, next) => {
    const token = bearer(c.req.header('authorization'));
    const payload = token ? verifyToken<{ aid: string; typ: string }>(token) : null;
    if (!payload || payload.typ !== 'admin') throw new HttpError(401, 'unauthorized');
    const admin = await db.query.adminUsers.findFirst({ where: eq(adminUsers.id, payload.aid) });
    if (!admin || !admin.isActive) throw new HttpError(401, 'unauthorized');
    if (roles.length && admin.role !== 'SUPERADMIN' && !roles.includes(admin.role)) throw new HttpError(403, 'forbidden');
    c.set('admin', { id: admin.id, role: admin.role });
    await next();
  });
}

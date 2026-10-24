import type { FastifyReply, FastifyRequest } from 'fastify';
import { prisma } from './db';
import { HttpError } from './lib/errors';
import { verifyToken } from './lib/token';

declare module 'fastify' {
  interface FastifyRequest {
    userId: string;
    admin?: { id: string; role: 'SUPERADMIN' | 'EDITOR' | 'SUPPORT' };
  }
}

function bearer(req: FastifyRequest): string | null {
  const h = req.headers.authorization;
  return h?.startsWith('Bearer ') ? h.slice(7) : null;
}

/** Користувач Mini App (токен видається після перевірки initData). */
export async function requireUser(req: FastifyRequest, _reply: FastifyReply) {
  const token = bearer(req);
  const payload = token ? verifyToken<{ uid: string; typ: string }>(token) : null;
  if (!payload || payload.typ !== 'user') throw new HttpError(401, 'unauthorized');
  const user = await prisma.user.findUnique({ where: { id: payload.uid }, select: { id: true, isBanned: true } });
  if (!user) throw new HttpError(401, 'unauthorized');
  if (user.isBanned) throw new HttpError(403, 'banned');
  req.userId = user.id;
}

/** Адміністратор з потрібною роллю. SUPERADMIN має доступ до всього. */
export function requireAdmin(...roles: ('SUPERADMIN' | 'EDITOR' | 'SUPPORT')[]) {
  return async (req: FastifyRequest) => {
    const token = bearer(req);
    const payload = token ? verifyToken<{ aid: string; typ: string }>(token) : null;
    if (!payload || payload.typ !== 'admin') throw new HttpError(401, 'unauthorized');
    const admin = await prisma.adminUser.findUnique({ where: { id: payload.aid } });
    if (!admin || !admin.isActive) throw new HttpError(401, 'unauthorized');
    if (roles.length && admin.role !== 'SUPERADMIN' && !roles.includes(admin.role)) throw new HttpError(403, 'forbidden');
    req.admin = { id: admin.id, role: admin.role };
  };
}

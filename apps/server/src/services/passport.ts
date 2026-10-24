/** Паспорт мандрівника: штамп за кожне місто зі складеним іспитом. */
import { and, asc, eq, isNotNull } from 'drizzle-orm';
import { db } from '../db';
import { cities, userCities } from '../db/schema';
import { PASSPORT } from '../content/passport';

export async function passport(userId: string) {
  const [route, visits] = await Promise.all([
    db.select({ id: cities.id, slug: cities.slug, name: cities.name, namePl: cities.namePl, order: cities.order }).from(cities).where(eq(cities.status, 'PUBLISHED')).orderBy(asc(cities.order)),
    db.select({ cityId: userCities.cityId, at: userCities.bossPassedAt }).from(userCities).where(and(eq(userCities.userId, userId), isNotNull(userCities.bossPassedAt))),
  ]);
  const stamped = new Map(visits.map((v) => [v.cityId, v.at]));
  const list = route.map((c, i) => {
    const at = stamped.get(c.id) ?? null;
    const content = PASSPORT[c.slug];
    // Листівку й нотатку видно лише після штампа — нагорода пов'язана з пройденим матеріалом.
    return { slug: c.slug, name: c.name, namePl: c.namePl, stop: i + 1, stampedAt: at, postcard: at ? (content?.postcard ?? null) : null, note: at ? (content?.note ?? null) : null };
  });
  return { stamps: list.filter((c) => c.stampedAt).length, total: list.length, cities: list };
}

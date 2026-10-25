/**
 * Емодзі в інтерфейсі не показуються: картинки варіантів і співрозмовники в контенті —
 * це ключі, які клієнт перетворює на піктограми (apps/web/src/components/pictograms).
 * Тест гарантує, що кожен ключ з контенту має піктограму (інакше завдання з картинкою стало б нерозв'язним),
 * а іконки локацій — ключі іконок, не емодзі.
 */
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { CITY_CONTENT } from '../src/content/seed';
import { EXAM_A1, PLACEMENT } from '../src/content/exams';
import { ROUTE_ICON_FIXES } from '../src/content/fixes';

const web = (f: string) => readFileSync(new URL(`../../web/src/components/pictograms/${f}`, import.meta.url), 'utf8');
const picto = web('Pictogram.tsx');
const npc = web('NpcAvatar.tsx');
const keys = new Set([...picto.matchAll(/'([^'\x00-\x7F][^']*)': \[/g)].map((m) => m[1]));
const bases = [...npc.matchAll(/0x([0-9a-f]+): '(?:woman|man|person|oldWoman|oldMan|girl|boy|baby)'/g)].map((m) => parseInt(m[1], 16));
const known = (e: string) => keys.has(e) || bases.includes(e.codePointAt(0)!) || /^\d️?⃣$/.test(e);
const lessons = [...CITY_CONTENT.flatMap((c) => c.routes.flatMap((r) => r.lessons)), PLACEMENT, EXAM_A1];

describe('Візуальні ключі контенту', () => {
  it('кожна картинка варіанта й кожен співрозмовник мають піктограму на клієнті', () => {
    const missing: string[] = [];
    for (const l of lessons) l.exercises.forEach((ex, i) => {
      const d = ex.data as { image?: string; options?: { image?: string }[]; npc?: { emoji: string } };
      for (const img of [d.image, ...(d.options ?? []).map((o) => o.image), d.npc?.emoji]) {
        if (img && !img.startsWith('/') && !img.startsWith('http') && !known(img)) missing.push(`${l.slug}#${i} ${img}`);
      }
    });
    expect(missing).toEqual([]);
  });

  it('іконки локацій — ключі іконок (не емодзі), старі значення в БД оновлює exact-match правило', () => {
    for (const c of CITY_CONTENT) for (const r of c.routes) expect(r.icon, r.slug).toMatch(/^[a-z][a-z-]*$/);
    for (const f of ROUTE_ICON_FIXES) {
      expect(f.from).not.toMatch(/^[a-z-]+$/);
      expect(CITY_CONTENT.some((c) => c.routes.some((r) => r.slug === f.slug && r.icon === f.to)), f.slug).toBe(true);
    }
  });
});

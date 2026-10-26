import { afterAll, describe, expect, it } from 'vitest';
import { inArray } from 'drizzle-orm';
import { db } from '../src/db';
import { vocabularyEntries } from '../src/db/schema';
import { t } from '../src/content/builders';
import { vocabFixSql } from '../src/content/seed';
import { LODZ_SEEDED_CEFR, LODZ_VOCAB } from '../src/content/vocab-lodz';
import { disposeEnv, getEnv } from './helpers';

afterAll(disposeEnv);

const word = (pl: string) => LODZ_VOCAB.find((w) => w.pl === pl)!;

/** Як seed (helpers.applySql): пакетом через D1 batch; повертає кількість змінених рядків. */
async function applyVocabFixes(d1: D1Database): Promise<number> {
  const results = await d1.batch(vocabFixSql().map((s) => d1.prepare(s)));
  return results.reduce((n, r) => n + (r.meta.changes ?? 0), 0);
}

const rows = async () =>
  Object.fromEntries(
    (await db.select().from(vocabularyEntries).where(inArray(vocabularyEntries.pl, ['doświadczenie', 'kask', 'biuro']))).map((r) => [r.pl, r]),
  );

describe('Точкові правки словника (VOCAB_FIXES)', () => {
  it('оновлюють лише рядки зі старим значенням з коду, не чіпають правки з адмінки, ідемпотентні, id не змінюються', async () => {
    const { env } = await getEnv();
    const d1 = env.DB;
    // Свіжий seed уже містить нові значення — правки нічого не змінюють.
    expect(word('doświadczenie').cefr).toBe('B1');
    expect(word('kask').cefr).toBe('A2');
    expect(await applyVocabFixes(d1)).toBe(0);
    const before = await rows();
    const count = async () => (await d1.prepare('SELECT count(*) AS n FROM vocabulary_entries').first<{ n: number }>())?.n;
    const totalBefore = await count();

    // Стан БД, засіяної до аудиту: рівень A1 і старий приклад biuro рівно так, як їх серіалізував seed старого коду
    // (lit(examples) = JSON.stringify([{ pl, tr: t(uk, ru, en) }])).
    await d1.prepare('UPDATE vocabulary_entries SET cefr = ? WHERE pl = ? AND pos = ?').bind(LODZ_SEEDED_CEFR, 'doświadczenie', 'noun').run();
    const oldBiuro = JSON.stringify([{ pl: 'Biuro jest na trzecim piętrze.', tr: t('Офіс на четвертому поверсі.', 'Офис на четвёртом этаже.', 'The office is on the third floor.') }]);
    await d1.prepare('UPDATE vocabulary_entries SET examples = ? WHERE pl = ? AND pos = ?').bind(oldBiuro, 'biuro', 'noun').run();
    // Редактор в адмінці поставив третє значення — його не можна перезаписати.
    await d1.prepare('UPDATE vocabulary_entries SET cefr = ? WHERE pl = ? AND pos = ?').bind('B2', 'kask', 'noun').run();

    // (а), (г): змінено рівно два рядки — рівень doświadczenie і приклад biuro; (б) kask лишився B2.
    expect(await applyVocabFixes(d1)).toBe(2);
    const after = await rows();
    expect(after['doświadczenie'].cefr).toBe('B1');
    expect(after['biuro'].examples).toEqual(word('biuro').examples);
    expect(after['biuro'].examples[0].tr.ru).toContain('третьем этаже');
    expect(after['kask'].cefr).toBe('B2');

    // (в): повторний прогон не змінює жодного рядка.
    expect(await applyVocabFixes(d1)).toBe(0);

    // (д): id слів ті самі, нових рядків немає.
    for (const pl of ['doświadczenie', 'kask', 'biuro']) expect(after[pl].id).toBe(before[pl].id);
    expect(await count()).toBe(totalBefore);
  });
});

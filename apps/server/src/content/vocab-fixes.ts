/**
 * Точкові оновлення вже засіяного словника. Seed без force вставляє слова з ON CONFLICT DO NOTHING,
 * тож правка у vocab-*.ts сама не дійде до рядків, які вже є в БД.
 * Рядок оновлюється, лише якщо в ньому досі старе значення з коду: правки з адмінки не зачіпаються,
 * id (v_<hash(pl|pos)>) не змінюється, прогрес слів (user_vocabulary, review_schedule) прив'язаний до id і зберігається.
 * Повторний запуск нічого не змінює.
 */
import type { Cefr, I18n } from '@polski-go/shared';
import { LODZ_SEEDED_CEFR, LODZ_VOCAB } from './vocab-lodz';

type Example = { pl: string; tr: I18n };
export type VocabFix =
  | { pl: string; pos: string; column: 'cefr'; from: Cefr; to: Cefr }
  | { pl: string; pos: string; column: 'examples'; from: Example[]; to: Example[] };

const lodz = (pl: string) => {
  const w = LODZ_VOCAB.find((x) => x.pl === pl);
  if (!w) throw new Error(`vocab-fixes: слова «${pl}» немає у словнику Лодзі`);
  return w;
};

export const VOCAB_FIXES: VocabFix[] = [
  // Łódź (аудит 2026-10-26): рівень за складністю слова замість A1 для всіх 77 слів.
  ...LODZ_VOCAB.filter((w) => w.cefr !== LODZ_SEEDED_CEFR).map((w): VocabFix => ({ pl: w.pl, pos: w.pos, column: 'cefr', from: LODZ_SEEDED_CEFR, to: w.cefr })),
  // Łódź: «trzecie piętro» перекладалося як «четвертий поверх» без пояснення, а англійською — «third floor».
  {
    pl: 'biuro', pos: 'noun', column: 'examples',
    from: [{ pl: 'Biuro jest na trzecim piętrze.', tr: { uk: 'Офіс на четвертому поверсі.', ru: 'Офис на четвёртом этаже.', en: 'The office is on the third floor.' } }],
    to: lodz('biuro').examples ?? [],
  },
];

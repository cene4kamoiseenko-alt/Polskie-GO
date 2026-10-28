/**
 * Помічник словників міст маршруту після Вроцлава (Poznań … Zakopane): та сама форма запису, що у vocab-katowice.ts
 * і vocab-opole.ts. Кожне слово має природний приклад із перекладом; приблизне прочитання будується за правилами (pron.ts).
 */
import { polishCyrillic, type Cefr } from '@polski-go/shared';
import { t } from './builders';
import type { VocabSeed } from './vocab';

export type Ex = [pl: string, uk: string, ru: string, en: string];

export const w = (pl: string, pos: string, cefr: Cefr, uk: string, ru: string, en: string, topics: string[], ex: Ex, forms?: Record<string, string>): VocabSeed => ({
  pl, pos, tr: t(uk, ru, en), pron: polishCyrillic(pl, 'uk').replace(/́/g, ''), cefr, topics, forms,
  examples: [{ pl: ex[0], tr: t(ex[1], ex[2], ex[3]) }],
});

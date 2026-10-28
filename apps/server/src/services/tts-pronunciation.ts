/**
 * Фразы контента, где синтезатор ошибается чаще всего: время, цены, номера линий, аббревиатуры, сокращения, числа,
 * отдельные буквы. Владелец слушает их первыми в сравнении голосов (админка → «Сравнение голосов») — это проверка
 * произношения на настоящем контенте, а не только на наборе бенчмарка. Чистая логика, без сети. Подписи — на русском, как в админке.
 */
import { isLoneLetter } from '@polski-go/shared';

export type RiskCategory = { id: string; label: string; listen: string; test: (s: string) => boolean };

/** Порядок важливий: фраза потрапляє в першу категорію, що підійшла. */
export const RISK_CATEGORIES: RiskCategory[] = [
  { id: 'time', label: 'Время цифрами', listen: '«10:30» — «dziesiąta trzydzieści», а не «dziesięć dwukropek trzydzieści»', test: (s) => /\b\d{1,2}:\d{2}\b/.test(s) },
  { id: 'price', label: 'Цены', listen: '«4,40 zł» — «cztery złote czterdzieści (groszy)», а не «cztery przecinek czterdzieści»', test: (s) => /(?<!\p{L})zł(?!\p{L})/u.test(s) },
  { id: 'code', label: 'Линии и номера с буквой', listen: '«M2» — «em dwa», «75-minutowy» — «siedemdziesięciopięciominutowy»', test: (s) => /(?<![\p{L}\d])\p{Lu}+\d+(?![\p{L}\d])|\d+-\p{L}/u.test(s) },
  { id: 'acronym', label: 'Аббревиатуры', listen: 'PKP, BLIK, PESEL, ZUS — по-польски, по буквам или словом, как говорят в Польше', test: (s) => /(?<!\p{L})\p{Lu}{2,}(?!\p{L})/u.test(s) },
  { id: 'abbr', label: 'Сокращения с точкой', listen: '«ul.» — «ulica», «al.» — «aleja», «nr» — «numer», «godz.» — «godzina»', test: (s) => /(?<!\p{L})(ul|al|pl|os|godz|nr|np|tel|itd|itp|ok|św|dr|prof|min)\.(?=\s|$)|(?<!\p{L})nr(?!\p{L})/iu.test(s) },
  { id: 'number', label: 'Числа цифрами', listen: 'правильное число и падеж: «na 75 minut», «od 1644 roku»', test: (s) => /\d/.test(s) },
  { id: 'letter', label: 'Отдельные буквы', listen: 'название буквы («wu», «zet»), а не «duże wu»', test: (s) => isLoneLetter(s) },
];

export type PronunciationRisk = { id: string; label: string; listen: string; count: number; items: string[] };

/** Ризиковані фрази за категоріями: усього й перші `limit` (короткі — першими: їх швидше прослухати). */
export function pronunciationRisks(phrases: readonly string[], limit = 12): PronunciationRisk[] {
  const groups = new Map<string, string[]>(RISK_CATEGORIES.map((c) => [c.id, []]));
  for (const p of phrases) {
    const cat = RISK_CATEGORIES.find((c) => c.test(p));
    if (cat) groups.get(cat.id)!.push(p);
  }
  return RISK_CATEGORIES.map((c) => {
    const all = groups.get(c.id)!;
    const items = [...all].sort((a, b) => a.length - b.length || a.localeCompare(b, 'pl')).slice(0, limit);
    return { id: c.id, label: c.label, listen: c.listen, count: all.length, items };
  }).filter((g) => g.count > 0);
}

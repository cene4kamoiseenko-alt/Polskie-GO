/**
 * Фрази контенту, де синтезатор найчастіше помиляється: час, ціни, номери ліній, абревіатури, скорочення, числа,
 * окремі літери. Їх власник слухає першими в порівнянні голосів (адмінка → «Порівняння голосів») — це перевірка
 * вимови на справжньому контенті, а не лише на наборі бенчмарку. Чиста логіка, без мережі.
 */
import { isLoneLetter } from '@polski-go/shared';

export type RiskCategory = { id: string; label: string; listen: string; test: (s: string) => boolean };

/** Порядок важливий: фраза потрапляє в першу категорію, що підійшла. */
export const RISK_CATEGORIES: RiskCategory[] = [
  { id: 'time', label: 'Час цифрами', listen: '«10:30» — «dziesiąta trzydzieści», а не «dziesięć dwukropek trzydzieści»', test: (s) => /\b\d{1,2}:\d{2}\b/.test(s) },
  { id: 'price', label: 'Ціни', listen: '«4,40 zł» — «cztery złote czterdzieści (groszy)», а не «cztery przecinek czterdzieści»', test: (s) => /(?<!\p{L})zł(?!\p{L})/u.test(s) },
  { id: 'code', label: 'Лінії та номери з літерою', listen: '«M2» — «em dwa», «75-minutowy» — «siedemdziesięciopięciominutowy»', test: (s) => /(?<![\p{L}\d])\p{Lu}+\d+(?![\p{L}\d])|\d+-\p{L}/u.test(s) },
  { id: 'acronym', label: 'Абревіатури', listen: 'PKP, BLIK, PESEL, ZUS — польською, по літерах або словом, як кажуть у Польщі', test: (s) => /(?<!\p{L})\p{Lu}{2,}(?!\p{L})/u.test(s) },
  { id: 'abbr', label: 'Скорочення з крапкою', listen: '«ul.» — «ulica», «al.» — «aleja», «nr» — «numer», «godz.» — «godzina»', test: (s) => /(?<!\p{L})(ul|al|pl|os|godz|nr|np|tel|itd|itp|ok|św|dr|prof|min)\.(?=\s|$)|(?<!\p{L})nr(?!\p{L})/iu.test(s) },
  { id: 'number', label: 'Числа цифрами', listen: 'правильне число й відмінок: «na 75 minut», «od 1644 roku»', test: (s) => /\d/.test(s) },
  { id: 'letter', label: 'Окремі літери', listen: 'назва літери («wu», «zet»), а не «duże wu»', test: (s) => isLoneLetter(s) },
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

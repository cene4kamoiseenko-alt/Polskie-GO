/**
 * Контраст за WCAG 2.x: відносна яскравість і співвідношення кольорів.
 * inkOn(bg) — колір тексту (білий або темно-синій), що дає більший контраст на заливці з даних
 * (колір міста, рівня CEFR, теми граматики), щоб написи на таких плашках проходили AA.
 */
const INK = '#07182c';

function luminance(hex: string): number {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? [...h].map((c) => c + c).join('') : h.slice(0, 6);
  const ch = [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
}

export function contrast(a: string, b: string): number {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}

/** Білий або темний текст — що контрастніше на цій заливці. Некоректний колір → білий. */
export function inkOn(bg: string | null | undefined): string {
  if (!bg || !/^#([0-9a-f]{3}|[0-9a-f]{6})/i.test(bg)) return '#fff';
  return contrast('#ffffff', bg) >= contrast(INK, bg) ? '#fff' : INK;
}

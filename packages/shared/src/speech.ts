/**
 * Підготовка польського тексту до озвучування та вибір голосу.
 * Чиста логіка без DOM — використовується клієнтом і сервером, покрита тестами.
 */

export type VoiceLike = { lang: string; name: string; localService?: boolean; default?: boolean };

/** Емодзі, прапорці, тони шкіри, VS16, ZWJ, keycap: у тексті вправ вони — підказки для ока, не для вуха. */
const PICTOGRAPHS = /[\p{Extended_Pictographic}\u{1F1E6}-\u{1F1FF}\u{1F3FB}-\u{1F3FF}\uFE0F\u200D\u20E3]/gu;

/**
 * Текст для синтезу: Unicode NFC (діакритика ą ć ę ł ń ó ś ź ż як один символ),
 * без пропусків «___», емодзі та зайвих пробілів. Літери не транслітеруються.
 * Емодзі («(Skręcić w prawo ➡️)») сервер не озвучував би зовсім (400 tts_bad_text), а голос пристрою читав би
 * «strzałka w prawo»; прибираються разом із пробілом, що лишився перед дужкою чи розділовим знаком.
 * Текст без емодзі не змінюється — ключі кешу озвучки наявних фраз ті самі.
 */
export function speechText(text: string): string {
  let s = text.normalize('NFC');
  const plain = s.replace(PICTOGRAPHS, ' ');
  if (plain !== s) s = plain.replace(/\s+(?=[)\].,!?;:…»”])/g, '').replace(/([(\[„«])\s+/g, '$1');
  return s
    .replace(/_{2,}/g, ' … ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 300);
}

/**
 * Окрема літера («w», «z», «i», «W»). Синтезатор читає її як назву літери — «wu», «zet», а велику
 * «W» як «duże wu» («дужеву»), — а не як прийменник чи сполучник. Такий текст окремо не озвучуємо:
 * прийменник звучить разом із сусіднім словом або в цілій фразі.
 */
export function isLoneLetter(text: string): boolean {
  return /^\p{L}$/u.test(text.normalize('NFC').replace(/[.,!?;:…"„”«»()]/g, '').trim());
}

const QUALITY_HINTS = ['neural', 'natural', 'online', 'google', 'microsoft', 'zofia', 'marek', 'agnieszka', 'ewa', 'paulina', 'krzysztof'];

/**
 * Найкращий польський голос пристрою або null.
 * Ніколи не повертає голос іншої мови: без польського голосу браузер читав би
 * польські слова за правилами англійської/російської («moja» → «моджа»).
 */
export function pickPolishVoice<V extends VoiceLike>(voices: readonly V[]): V | null {
  const polish = voices.filter((v) => /^pl([-_]|$)/i.test(v.lang ?? ''));
  if (!polish.length) return null;
  const score = (v: V) => {
    let s = 0;
    if (/^pl[-_]pl$/i.test(v.lang)) s += 4;
    const name = v.name.toLowerCase();
    if (QUALITY_HINTS.some((h) => name.includes(h))) s += 2;
    if (v.default) s += 1;
    return s;
  };
  return [...polish].sort((a, b) => score(b) - score(a))[0];
}

/** Швидкість мовлення: звичайна та сповільнена (розбірлива, без спотворення тону). */
export const SPEECH_RATES = { normal: 1, slow: 0.75 } as const;
export type SpeechRate = keyof typeof SPEECH_RATES;

import { expect, it } from 'vitest';
import { VOCAB } from '../src/content/vocab';
import type { LessonSeed } from '../src/content/types';

/**
 * Общие правила для уроков, добавленных расширением города (Вроцлав 5–16, Катовице 5–13, Ополе 5–10): структура, польский без кириллицы,
 * переводы uk/ru/en, слова из словаря, один пропуск в «Uzupełnij», повторы механики. content-lint проверяет то же по всему контенту;
 * здесь правила держатся отдельно от уроков 1–4. Тест не доказывает грамматику: её проверяет человек.
 */
const knownPl = new Set(VOCAB.map((v) => v.pl));
const CYRILLIC = /[а-яіїєґё]/i;
/** Поля, де лежить польский текст. Переклади (I18n-об'єкти) сюди не потрапляють: їх перевіряє окремо. */
const PL_KEYS = new Set(['pl', 'audioText', 'passage', 'sentence', 'npc', 'accepted', 'tokens', 'answer', 'alternatives', 'options', 'choose', 'pairs', 'words']);

/** Рядки-листки польського тексту: йдемо лише масивами, I18n-об'єкти пропускаємо. */
function plStrings(value: unknown, out: string[] = []): string[] {
  if (typeof value === 'string') out.push(value);
  else if (Array.isArray(value)) for (const v of value) plStrings(v, out);
  return out;
}

/** Збирає польські рядки з усього завдання. */
function collectPl(value: unknown, out: string[] = []): string[] {
  if (Array.isArray(value)) for (const v of value) collectPl(v, out);
  else if (value && typeof value === 'object') {
    for (const [key, v] of Object.entries(value)) {
      if (PL_KEYS.has(key)) plStrings(v, out);
      else collectPl(v, out);
    }
  }
  return out;
}

/** Знаходить усі I18n-об'єкти (вони мають ключі uk/ru/en) і повертає ті, де якась мова порожня. */
function emptyI18n(value: unknown, path = '', out: string[] = []): string[] {
  if (Array.isArray(value)) value.forEach((v, i) => emptyI18n(v, `${path}[${i}]`, out));
  else if (value && typeof value === 'object') {
    const o = value as Record<string, unknown>;
    if ('uk' in o && 'ru' in o && 'en' in o) {
      for (const k of ['uk', 'ru', 'en'] as const) if (typeof o[k] !== 'string' || !(o[k] as string).trim()) out.push(`${path}.${k}`);
    } else for (const [k, v] of Object.entries(o)) emptyI18n(v, `${path}.${k}`, out);
  }
  return out;
}

const runs = (types: string[]) => {
  let max = 0;
  let run = 0;
  types.forEach((t, i) => {
    run = i > 0 && types[i - 1] === t ? run + 1 : 1;
    max = Math.max(max, run);
  });
  return max;
};

export function expansionRules(label: string, lessons: LessonSeed[], levels: string[] = ['A1', 'A2', 'B1']) {
  it(`${label}: CEFR, сложность, пояснение и примеры, слова из словаря`, () => {
    for (const l of lessons) {
      expect(levels, l.slug).toContain(l.cefr);
      expect(l.difficulty, l.slug).toBeGreaterThanOrEqual(1);
      expect(l.difficulty, l.slug).toBeLessThanOrEqual(5);
      // Экзамен города (BOSS) — проверка без новых примеров, как у всех городов.
      if ((l.kind ?? 'LESSON') === 'LESSON') expect(l.examples.length, l.slug).toBeGreaterThan(0);
      for (const ex of l.examples) expect(CYRILLIC.test(ex.pl), `${l.slug}: ${ex.pl}`).toBe(false);
      for (const w of l.words) expect(knownPl.has(w), `${l.slug}: слово «${w}» не в словаре`).toBe(true);
      expect(emptyI18n(l), `${l.slug} пустые переводы`).toEqual([]);
    }
  });

  it(`${label}: 8–15 заданий на урок, не меньше 5 разных механик, серии одной механики не длиннее трёх`, () => {
    for (const l of lessons) {
      expect(l.exercises.length, l.slug).toBeGreaterThanOrEqual(8);
      expect(l.exercises.length, l.slug).toBeLessThanOrEqual(15);
      expect(new Set(l.exercises.map((e) => e.type)).size, `${l.slug}: мало механик`).toBeGreaterThanOrEqual(5);
      expect(runs(l.exercises.map((e) => e.type)), `${l.slug}: серия одной механики`).toBeLessThanOrEqual(3);
    }
  });

  it(`${label}: польский без кириллицы, переводы uk/ru/en, корректные варианты и пропуски`, () => {
    for (const l of lessons) {
      l.exercises.forEach((ex, i) => {
        const where = `${l.slug}#${i} ${ex.type}`;
        expect(/^[a-z]+(\.[a-z-]+)+$/.test(ex.skill), `${where}: ключ навички «${ex.skill}»`).toBe(true);

        for (const s of collectPl(ex.data)) {
          expect(CYRILLIC.test(s), `${where}: кирилиця у польському «${s}»`).toBe(false);
          expect(s.trim(), `${where}: порожній польський текст`).not.toBe('');
        }
        expect(emptyI18n(ex, where), `${where} порожній переклад`).toEqual([]);

        const d = ex.data as Record<string, unknown>;
        if (ex.type === 'FILL_GAP') expect(String(d.pl).match(/___/g)?.length ?? 0, `${where}: пропуск`).toBe(1);

        if (Array.isArray(d.options)) {
          const texts = (d.options as unknown[]).map((o) => (typeof o === 'string' ? o : JSON.stringify((o as { text?: unknown }).text ?? o)));
          expect(new Set(texts.map((x) => x.trim().toLowerCase())).size, `${where}: однакові варіанти`).toBe(texts.length);
          if (ex.type !== 'FIND_ERROR' && ex.type !== 'ODD_ONE_OUT') expect(texts.length, `${where}: мало варіантів`).toBeGreaterThanOrEqual(3);
          const first = (d.options as unknown[])[0] as { id?: string } | undefined;
          // У «Знайди помилку» й «Зайве» відповідь — не перший варіант, а позиція слова: її перевіряє сам билдер.
          const firstIsAnswer = ex.type !== 'FIND_ERROR' && ex.type !== 'ODD_ONE_OUT';
          if (firstIsAnswer && first && typeof first === 'object' && first.id) expect(d.answer, `${where}: правильний варіант має бути першим`).toBe(first.id);
        }

        if (Array.isArray(d.accepted)) {
          expect((d.accepted as string[]).length, `${where}: немає прийнятої відповіді`).toBeGreaterThan(0);
        }
        if (ex.type === 'BUILD_SENTENCE') {
          for (const tok of d.answer as string[]) expect((d.tokens as string[]).includes(tok), `${where}: токен «${tok}» відсутній`).toBe(true);
        }
        if (ex.type === 'FIND_ERROR' || ex.type === 'ODD_ONE_OUT') expect(ex.explanation, `${where}: немає пояснення`).toBeDefined();
      });
    }
  });
}

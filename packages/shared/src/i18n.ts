import type { I18n, UiLang } from './types';

/** Повертає текст потрібною мовою з запасними варіантами. */
export function tr(text: I18n | string | undefined | null, lang: UiLang): string {
  if (text == null) return '';
  if (typeof text === 'string') return text;
  return text[lang] ?? text.uk;
}

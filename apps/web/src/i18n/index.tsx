import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { tr as trShared, type I18n, type UiLang } from '@polski-go/shared';
import { uk, type Dict } from './uk';
import { ru } from './ru';
import { en } from './en';
import { pl } from './pl';

const DICTS: Record<UiLang, Dict> = { uk, ru, en, pl };
const LOCALES: Record<UiLang, string> = { uk: 'uk-UA', ru: 'ru-RU', en: 'en-GB', pl: 'pl-PL' };

export type TKey = keyof Dict;
type Ctx = { lang: UiLang; t: (k: TKey, vars?: Record<string, string | number>) => string; tr: (v: I18n | string | null | undefined) => string; date: (d: string | Date) => string };

const I18nCtx = createContext<Ctx | null>(null);

export function I18nProvider({ lang, children }: { lang: UiLang; children: ReactNode }) {
  const value = useMemo<Ctx>(() => {
    const dict = DICTS[lang] ?? uk;
    return {
      lang,
      t: (k, vars) => {
        let s = dict[k] ?? uk[k] ?? k;
        if (vars) for (const [name, val] of Object.entries(vars)) s = s.replaceAll(`{${name}}`, String(val));
        return s;
      },
      tr: (v) => trShared(v ?? '', lang),
      date: (d) => new Date(d).toLocaleDateString(LOCALES[lang], { day: 'numeric', month: 'long', year: 'numeric' }),
    };
  }, [lang]);
  return <I18nCtx.Provider value={value}>{children}</I18nCtx.Provider>;
}

export function useT() {
  const c = useContext(I18nCtx);
  if (!c) throw new Error('I18nProvider missing');
  return c;
}

/** Мова за замовчуванням до завантаження профілю — з Telegram або браузера. */
export function guessLang(code?: string): UiLang {
  const c = (code ?? navigator.language ?? 'uk').slice(0, 2);
  return (['uk', 'ru', 'en', 'pl'] as const).includes(c as UiLang) ? (c as UiLang) : 'uk';
}

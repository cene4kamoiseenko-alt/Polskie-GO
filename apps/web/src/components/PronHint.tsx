/**
 * Підказка вимови польського тексту за налаштуванням людини: приблизно кирилицею (лише для ru/uk, позначено «≈»),
 * транскрипція IPA або нічого. Обидві будуються за правилами написання (@polski-go/shared pron).
 * Це лише текст на екрані: озвучує завжди польський голос польську фразу, а не цю підказку.
 */
import { polishCyrillic, polishIpa } from '@polski-go/shared';
import { useMemo } from 'react';
import { useT } from '../i18n';
import { useMe } from '../lib/queries';
import { cx } from './ui';

export function usePronMode(): 'simple' | 'ipa' | 'off' {
  const { lang } = useT();
  const mode = useMe().data?.settings.pronHint ?? 'simple';
  // «Просто» має сенс лише для кирилиці; для en/pl замість неї — IPA.
  return mode === 'simple' && lang !== 'ru' && lang !== 'uk' ? 'ipa' : mode;
}

export function PronHint({ text, className, inline }: { text: string; className?: string; inline?: boolean }) {
  const { t, lang } = useT();
  const mode = usePronMode();
  const value = useMemo(() => (mode === 'off' ? '' : mode === 'simple' ? polishCyrillic(text, lang as 'ru' | 'uk') : polishIpa(text)), [mode, text, lang]);
  if (!value) return null;
  const Tag = inline ? 'span' : 'div';
  return mode === 'simple' ? (
    <Tag lang={lang} className={cx('pron-hint', className)} title={t('pron_simple_title')} aria-label={`${t('pron_simple_title')}: ${value}`} data-pron="simple">
      ≈ {value}
    </Tag>
  ) : (
    <Tag lang="und-fonipa" className={cx('pron-hint', className)} title={t('pron_ipa_title')} aria-label={`${t('pron_ipa_title')}: ${value}`} data-pron="ipa">
      [{value}]
    </Tag>
  );
}

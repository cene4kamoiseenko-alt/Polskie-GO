/**
 * Вкладка «Учёба» — один раздел с двумя видами одного пути: список уроков города и карта Польши.
 * Раньше это были две вкладки нижней панели («Карта» и «Уроки»), которые вели к одним и тем же урокам,
 * и было непонятно, чем они отличаются. Переключатель стоит вверху обоих экранов; вкладка помнит последний вид.
 */
import { useNavigate } from 'react-router-dom';
import { motion } from '../lib/motion';
import { useT } from '../i18n';
import { haptic } from '../lib/telegram';
import { rememberStudyView, type StudyView } from '../lib/studyView';
import { Icon } from './Icon';
import { cx } from './ui';

export function StudySwitch({ view, overlay, className }: { view: StudyView; /** Поверх карты: стеклянный фон. */ overlay?: boolean; className?: string }) {
  const { t } = useT();
  const nav = useNavigate();
  const items: { key: StudyView; to: string; label: string; icon: 'book' | 'map' }[] = [
    { key: 'lessons', to: '/learn', label: t('study_lessons'), icon: 'book' },
    { key: 'map', to: '/map', label: t('study_map'), icon: 'map' },
  ];
  return (
    <div role="tablist" aria-label={t('study_switch_aria')} className={cx('study-switch', overlay && 'is-overlay', className)} data-study-switch>
      {items.map((it) => {
        const on = it.key === view;
        return (
          <button
            key={it.key}
            type="button"
            role="tab"
            aria-selected={on}
            data-study-view={it.key}
            className={cx('study-switch-item', on && 'is-on')}
            onClick={() => {
              if (on) return;
              haptic.select();
              rememberStudyView(it.key);
              nav(it.to, { replace: true });
            }}
          >
            {on && <motion.span layoutId="study-switch-pill" className="study-switch-pill" transition={{ type: 'spring', stiffness: 520, damping: 38 }} aria-hidden />}
            <span className="relative inline-flex items-center gap-1.5">
              <Icon name={it.icon} size={17} strokeWidth={on ? 2.5 : 2.1} /> {it.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

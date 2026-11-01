/**
 * Карточки миссий сезонного пропуска по референсу владельца (2026-11-01, docs/design/v19/pass): «Продолжить» сверху и карточки с артом, значками времени и XP
 * и красной кнопкой запуска. Только внешний вид: данные, доступ (бесплатная миссия, Premium, архив), прогресс, XP и маршруты — те же, что у MissionCard.
 * Тексты, время, XP и прогресс — живые поля миссии, не картинка: нет времени или XP — значок не рисуется.
 */
import { motion } from '../lib/motion';
import { useT } from '../i18n';
import { passArt, passCutout } from '../lib/screenArt';
import { haptic } from '../lib/telegram';
import type { PassMission } from '../lib/types';
import { Icon } from './Icon';
import { MissionScene } from './MissionScene';

/** Картинка карточки: арт пропуска (если нарисован), иначе сцена миссии (растровая или SVG). */
function PassArt({ m, lazy }: { m: PassMission; lazy: boolean }) {
  const art = passArt(m.slug);
  if (!art) return <MissionScene slug={m.slug} scene={m.scene} className="pg-art-img" lazy={lazy} />;
  return (
    <img
      src={art.src}
      srcSet={art.srcSet}
      // Экран не шире max-w-xl (576 px): на узких экранах хватает 640.
      sizes="(min-width: 576px) 540px, 92vw"
      alt=""
      className="pg-art-img"
      loading={lazy ? 'lazy' : 'eager'}
      decoding="async"
      draggable={false}
      data-pass-art={m.slug}
    />
  );
}

/** Миссия, которую начали и не закончили: заметная карточка «Продолжить · шаг N из M». Показывается только при настоящем незавершённом прохождении. */
export function PassFeatured({ m, onOpen }: { m: PassMission; onOpen: () => void }) {
  const { t, tr } = useT();
  const cutout = passCutout(m.slug);
  // Неразрывные пробелы перед цифрами: на узком экране «шаг 1 из 5» не оставляет «5» одну на второй строке.
  const resume = t('life_continue', { n: (m.inProgress ?? 0) + 1, total: m.steps }).replace(/ (?=\d)/g, '\u00a0');
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.985 }}
      onClick={() => { haptic.tap(); onOpen(); }}
      className={`pg-feature${cutout && cutout.h > cutout.w ? ' pg-feature--portrait' : ''}`}
      data-pass-featured={m.slug}
      aria-label={`${resume}: ${tr(m.title)}`}
    >
      <span className="pg-feature-body">
        <span className="pg-feature-title">{tr(m.title)}</span>
        <span className="pg-feature-goal">{tr(m.goal)}</span>
        <span className="pg-resume">{resume}</span>
      </span>
      {cutout ? (
        <img className="pg-feature-art" src={cutout.src} alt="" width={cutout.w} height={cutout.h} loading="eager" decoding="async" draggable={false} />
      ) : (
        <span className="pg-feature-thumb" aria-hidden>
          <MissionScene slug={m.slug} scene={m.scene} className="pg-art-img" lazy={false} />
        </span>
      )}
      <span className="pg-play pg-play--blue" aria-hidden>
        <Icon name="play" size={22} />
      </span>
    </motion.button>
  );
}

/** Карточка миссии сезона: арт со значками, название, описание, кнопка запуска; замок — когда нужен Premium (ведёт на экран Premium). */
export function PassMissionCard({ m, compact, free, lazy, onOpen }: { m: PassMission; compact?: boolean; /** Показать пометку «Бесплатно» (первая миссия сезона без Premium). */ free?: boolean; /** Картинка ниже первого экрана: ленивая загрузка. */ lazy?: boolean; onOpen: () => void }) {
  const { t, tr } = useT();
  const done = m.completions > 0;
  const resuming = m.inProgress !== null;
  const locked = !m.open;
  const state = locked ? t('pass_locked_state') : resuming ? t('life_continue', { n: m.inProgress! + 1, total: m.steps }) : done ? t('life_done') : '';
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.985 }}
      onClick={() => { haptic.tap(); onOpen(); }}
      className={`pg-mission${locked ? ' pg-mission--locked' : ''}${compact ? ' pg-mission--compact' : ''}`}
      aria-label={`${tr(m.title)}${state ? `: ${state}` : ''}`}
    >
      <span className="pg-art">
        <PassArt m={m} lazy={!!lazy} />
        <span className="pg-art-shade" aria-hidden />
        {free && <span className="pg-tag pg-tag--free">{t('pass_free')}</span>}
        {resuming && !locked && (
          <span className="pg-tag pg-tag--resume"><Icon name="play" size={12} /> {m.inProgress! + 1}/{m.steps}</span>
        )}
        {!resuming && done && !locked && (
          <span className={`pg-tag ${m.flawless ? 'pg-tag--gold' : 'pg-tag--done'}`}><Icon name={m.flawless ? 'star' : 'check'} size={13} /> {t(m.flawless ? 'life_flawless' : 'life_done')}</span>
        )}
        {locked && <span className="pg-tag pg-tag--gold"><Icon name="crown" size={13} filled /> Premium</span>}
        <span className="pg-badges">
          {m.minutes != null && <span className="pg-badge"><Icon name="clock" size={14} /> {t('life_minutes', { n: m.minutes })}</span>}
          {m.xp != null && <span className="pg-badge pg-badge--xp"><Icon name="star" size={14} /> +{m.xp} XP</span>}
        </span>
      </span>
      <span className="pg-details">
        <span className="pg-details-text">
          <span className="pg-title">{tr(m.title)}</span>
          <span className="pg-goal">{tr(m.goal)}</span>
          {resuming && !locked && <span className="pg-resume pg-resume--inline">{t('life_continue', { n: m.inProgress! + 1, total: m.steps })}</span>}
        </span>
        <span className={`pg-play${locked ? ' pg-play--locked' : resuming ? ' pg-play--blue' : done ? ' pg-play--done' : ''}`} aria-hidden>
          <Icon name={locked ? 'lock' : done && !resuming ? 'refresh' : 'play'} size={locked ? 20 : 22} />
        </span>
      </span>
    </motion.button>
  );
}

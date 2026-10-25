/**
 * Заставка POLSKI GO за новим дизайном: панорама Варшави з листа міст, логотип із листа бренду,
 * бобер-мандрівник (растр «привітання») і скляна картка з реальним прогресом запуску.
 * Анімації дешеві: лише transform і opacity; панорама робить один повільний наїзд, безкінечних рухів
 * два (бобер легко погойдується, по смузі пробігає відблиск), обидва вимикаються при reduced motion.
 * Без deviceorientation і без стеження за курсором.
 * Використовується під час завантаження і на першому кроці онбордингу.
 */
import { AnimatePresence, motion, useReducedMotion } from '../lib/motion';
import { useEffect, useState, type ReactNode } from 'react';
import { useT, type TKey } from '../i18n';
import { beaverAsset, brandAsset, cityAsset, iconAsset } from '../lib/assets';
import { useBootProgress } from '../lib/boot';

/** Іконка з листа до кожної фрази завантаження (15 — фінальна «бобер уже чекає»). */
const MSG_ICONS = ['lessons', 'streak', 'shopping', 'zlotki', 'food', 'cafe', 'map', 'profile', 'dictionary', 'transport', 'pronunciation', 'quests', 'dragon', 'passport', 'gift'];
const ROTATING = 14;

// Стан між перемонтуваннями (заставка показується і до, і після завантаження профілю).
let introPlayed = false;
let msgIndex = Math.floor(Math.random() * ROTATING);

function LoadingUi() {
  const { t } = useT();
  const progress = useBootProgress();
  const [msg, setMsg] = useState(msgIndex);
  useEffect(() => {
    const id = setInterval(() => {
      msgIndex = (msgIndex + 1) % ROTATING;
      setMsg(msgIndex);
    }, 1900);
    return () => clearInterval(id);
  }, []);
  // Профіль завантажено — бобер уже чекає (фінальна фраза).
  const n = progress >= 0.82 ? ROTATING : msg;
  const pct = Math.round(progress * 100);
  return (
    <div className="splash-card" role="status" aria-live="polite" aria-label={`${t('splash_loading')} ${pct}%`}>
      <div className="flex min-h-[48px] items-center gap-3">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={n} className="flex min-w-0 flex-1 items-center gap-3" initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -8, opacity: 0 }} transition={{ duration: 0.22, ease: 'easeOut' }}>
            <span className="splash-icon" aria-hidden>
              <img src={iconAsset(MSG_ICONS[n]) ?? undefined} alt="" width={40} height={40} decoding="async" />
            </span>
            <span className="line-clamp-2 text-[15px] font-extrabold leading-tight">{t(`splash_msg_${n + 1}` as TKey)}</span>
          </motion.div>
        </AnimatePresence>
        <span className="splash-pct" aria-hidden>{pct}%</span>
      </div>
      <div className="splash-bar mt-3" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={t('splash_loading')}>
        <div className="splash-bar-fill" style={{ transform: `translateX(${Math.max(6, pct) - 100}%)` }} />
      </div>
    </div>
  );
}

function ErrorUi({ onRetry }: { onRetry?: () => void }) {
  const { t } = useT();
  const offline = typeof navigator !== 'undefined' && !navigator.onLine;
  return (
    <div className="splash-card text-center" role="alert">
      <div className="text-lg font-black">{t('splash_error_title')}</div>
      <div className="splash-muted mt-1 text-sm font-bold">{offline ? t('error_offline') : t('splash_error_text')}</div>
      {onRetry && (
        <button className="btn btn-primary mt-3 w-full" onClick={onRetry}>
          {t('error_retry')}
        </button>
      )}
    </div>
  );
}

export function SplashScene({ slogan, loading, error, onRetry, children }: { slogan?: string; loading?: boolean; error?: boolean; onRetry?: () => void; children?: ReactNode }) {
  const reduce = useReducedMotion();
  const [intro] = useState(() => !introPlayed && !reduce);
  useEffect(() => {
    introPlayed = true;
  }, []);
  const hasUi = loading || error;
  // Бобер стоїть на площі над карткою (помилка вища за прогрес) або над реплікою онбордингу.
  const feet = error ? 'calc(var(--safe-b) + 3.2vh + 182px)' : loading ? 'calc(var(--safe-b) + 3.2vh + 118px)' : 'calc(var(--safe-b) + 196px)';

  return (
    <div className={`splash relative min-h-[100dvh] overflow-hidden ${intro ? 'is-intro' : ''}`}>
      <img className="splash-pano" src={cityAsset('warszawa') ?? undefined} alt="" decoding="async" draggable={false} />
      <div className="splash-shade" aria-hidden />
      <header className="splash-head absolute inset-x-0 top-0 z-30 flex flex-col items-center px-6">
        {/* Той самий логотип, що й у миттєвій заставці index.html, на тому ж місці: без стрибка. */}
        <img className="splash-logo" src={brandAsset('logo') ?? undefined} alt="POLSKI GO" width={640} height={126} />
        {slogan && <div className="splash-slogan">{slogan}</div>}
      </header>
      <div className="absolute left-1/2 z-20 -translate-x-1/2" style={{ bottom: feet }} aria-hidden>
        <div className="splash-hero">
          <span className="splash-shadow" />
          <img className="splash-beaver" src={beaverAsset('wave') ?? brandAsset('avatar') ?? undefined} alt="" draggable={false} />
        </div>
      </div>
      {hasUi && (
        <div className="splash-ui absolute inset-x-0 bottom-0 z-30 px-5">
          {error ? <ErrorUi onRetry={onRetry} /> : <LoadingUi />}
        </div>
      )}
      {children}
    </div>
  );
}

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
import { bootState, useBootProgress, type BootStage } from '../lib/boot';

/** Іконка з листа до кожної фрази завантаження (15 — фінальна «бобер уже чекає»). */
const MSG_ICONS = ['lessons', 'streak', 'shopping', 'zlotki', 'food', 'cafe', 'map', 'profile', 'dictionary', 'transport', 'pronunciation', 'quests', 'dragon', 'passport', 'gift'];
const ROTATING = 14;

// Стан між перемонтуваннями (заставка показується і до, і після завантаження профілю).
let introPlayed = false;
let msgIndex = Math.floor(Math.random() * ROTATING);

/** Підпис реального етапу запуску (те, що зараз виконується). */
const DOING_KEY: Record<Exclude<BootStage, 'start'>, TKey> = { auth: 'boot_doing_auth', profile: 'boot_doing_profile', screen: 'boot_doing_screen' };

function useOnline() {
  const [online, setOnline] = useState(() => typeof navigator === 'undefined' || navigator.onLine !== false);
  useEffect(() => {
    const update = () => setOnline(navigator.onLine !== false);
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, []);
  return online;
}

function LoadingUi({ onRetry }: { onRetry?: () => void }) {
  const { t } = useT();
  const progress = useBootProgress();
  const online = useOnline();
  const boot = bootState();
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
      {/* Чесний етап: що саме зараз робиться; якщо затягнулося — так і кажемо й даємо повторити. */}
      <div className="mt-2 flex min-h-[22px] items-center gap-2 text-[12px] font-bold">
        <span className="splash-muted min-w-0 flex-1 truncate" data-boot={!online ? 'offline' : boot.slow ? 'slow' : boot.doing ?? 'done'}>
          {!online ? t('boot_offline') : boot.slow ? t('boot_slow') : `${t('boot_step', { n: boot.step, total: boot.total })} · ${t(DOING_KEY[boot.doing === 'start' || !boot.doing ? 'screen' : boot.doing])}`}
        </span>
        {(boot.slow || !online) && onRetry && (
          <button type="button" className="shrink-0 underline" onClick={onRetry}>
            {t('error_retry')}
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Нет связи (экран B). Продолжить офлайн не предлагаем: сохранённых для офлайна уроков нет — проверка ответов,
 * награды и прогресс идут через сервер. Когда сеть возвращается, App повторяет загрузку сам.
 */
function ErrorUi({ onRetry }: { onRetry?: () => void }) {
  const { t } = useT();
  const offline = !useOnline();
  return (
    <div className="splash-card text-center" role="alert" data-boot-error={offline ? 'offline' : 'server'}>
      <div className="text-lg font-black">{t(offline ? 'splash_offline_title' : 'splash_error_title')}</div>
      <div className="splash-muted mt-1 text-sm font-bold">{t(offline ? 'splash_offline_text' : 'splash_error_text')}</div>
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
  const feet = error ? 'calc(var(--safe-b) + 3.2vh + 206px)' : loading ? 'calc(var(--safe-b) + 3.2vh + 146px)' : 'calc(var(--safe-b) + 196px)';

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
          {error ? <ErrorUi onRetry={onRetry} /> : <LoadingUi onRetry={onRetry} />}
        </div>
      )}
      {children}
    </div>
  );
}

/**
 * Заставка POLSKI GO по слоям владельца (2026-11-01, docs/design/v19/loading): фон «Замковая площадь, Варшава», логотип и Бобек — отдельные
 * картинки на сцене 941×1672 (сцена накрывает экран как `cover`, слои лежат по процентам кадра, поэтому не расходятся на любых экранах),
 * поверх — стеклянная карточка с РЕАЛЬНЫМ прогрессом запуска (lib/boot.ts: вход → профиль → первый экран). Карточка — живой HTML,
 * не картинка: проценты, этап, ошибка и «повторить» всегда настоящие.
 * Движение дешёвое (только transform/opacity): логотип появляется один раз (в index.html, до JS), Бобек покачивается, по полосе пробегает
 * блик — это всё бесконечное; при «Меньше анимации» и prefers-reduced-motion не движется ничего.
 * Используется при загрузке, при ошибке сети и на первом шаге знакомства.
 */
import { AnimatePresence, motion, useReducedMotion } from '../lib/motion';
import { useEffect, useState, type ReactNode } from 'react';
import { useT, type TKey } from '../i18n';
import { iconAsset } from '../lib/assets';
import { SPLASH_ART, splashGeometry } from '../lib/splashArt';
import { Icon } from './Icon';
import { bootState, useBootProgress, type BootStage } from '../lib/boot';

/** Иконка с листа к каждой фразе загрузки (15 — финальная «бобёр уже ждёт»). */
const MSG_ICONS = ['lessons', 'streak', 'shopping', 'zlotki', 'food', 'cafe', 'map', 'profile', 'dictionary', 'transport', 'pronunciation', 'map', 'dragon', 'passport', 'gift'];
const ROTATING = 14;

// Состояние между перемонтированиями (заставка показывается и до, и после загрузки профиля).
let introPlayed = false;
let msgIndex = Math.floor(Math.random() * ROTATING);

/** Подпись реального этапа запуска (то, что сейчас выполняется). */
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
  // Профиль загружен — бобёр уже ждёт (финальная фраза).
  const n = progress >= 0.82 ? ROTATING : msg;
  const pct = Math.round(progress * 100);
  const trouble = boot.slow || !online;
  return (
    <div className="splash-card" role="status" aria-live="polite" aria-label={`${t('splash_loading')} ${pct}%`}>
      <div className="splash-row">
        <span className="splash-icon" aria-hidden>
          <AnimatePresence mode="wait" initial={false}>
            <motion.img key={n} src={iconAsset(MSG_ICONS[n]) ?? undefined} alt="" width={40} height={40} decoding="async" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} transition={{ duration: 0.18, ease: 'easeOut' }} />
          </AnimatePresence>
        </span>
        <AnimatePresence mode="wait" initial={false}>
          <motion.span key={n} className="splash-title line-clamp-2 min-w-0 flex-1" initial={{ y: 6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -6, opacity: 0 }} transition={{ duration: 0.2, ease: 'easeOut' }}>
            {t(`splash_msg_${n + 1}` as TKey)}
          </motion.span>
        </AnimatePresence>
        <span className="splash-pct" aria-hidden>{pct}%</span>
      </div>
      <div className="splash-bar mt-3" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={t('splash_loading')}>
        <div className="splash-bar-fill" style={{ transform: `translateX(${Math.max(6, pct) - 100}%)` }} />
      </div>
      {/* Честный этап: что именно сейчас делается; если затянулось — так и говорим и даём повторить. */}
      <div className={`splash-foot ${trouble ? 'is-trouble' : ''}`}>
        <span className="splash-muted" data-boot={!online ? 'offline' : boot.slow ? 'slow' : boot.doing ?? 'done'}>
          {!online ? t('boot_offline') : boot.slow ? t('boot_slow') : `${t('boot_step', { n: boot.step, total: boot.total })} · ${t(DOING_KEY[boot.doing === 'start' || !boot.doing ? 'screen' : boot.doing])}`}
        </span>
        {trouble && onRetry ? (
          <button type="button" className="splash-retry" onClick={onRetry}>
            {t('error_retry')}
          </button>
        ) : (
          <span className="splash-brand" aria-hidden>Polski GO</span>
        )}
      </div>
    </div>
  );
}

/**
 * Нет связи (экран B). Продолжить офлайн не предлагаем: сохранённых для офлайна уроков нет — проверка ответов,
 * награды и прогресс идут через сервер. Когда сеть возвращается, App повторяет загрузку сам.
 */
function ErrorUi({ onRetry, offline }: { onRetry?: () => void; offline: boolean }) {
  const { t } = useT();
  return (
    <div className="splash-card text-center" role="alert" data-boot-error={offline ? 'offline' : 'server'}>
      <div className="text-lg font-black">{t(offline ? 'splash_offline_title' : 'splash_error_title')}</div>
      <div className="splash-muted mt-1 text-sm font-bold">{t(offline ? 'splash_offline_text' : 'splash_error_text')}</div>
      {onRetry && (
        <button className="btn btn-red mt-3 flex w-full items-center justify-center gap-2" onClick={onRetry}>
          <Icon name="refresh" size={20} strokeWidth={2.6} />
          {t('error_retry')}
        </button>
      )}
    </div>
  );
}

/**
 * @param lift сцена приподнята (знакомство): внизу место под реплику и кнопки.
 */
export function SplashScene({ slogan, steps, loading, error, onRetry, lift, children }: { slogan?: string; steps?: ReactNode; loading?: boolean; error?: boolean; onRetry?: () => void; lift?: boolean; children?: ReactNode }) {
  const reduce = useReducedMotion();
  const online = useOnline();
  const [intro] = useState(() => !introPlayed && !reduce);
  useEffect(() => {
    introPlayed = true;
  }, []);
  const hasUi = loading || error;
  const art = SPLASH_ART;

  return (
    <div className={`splash relative min-h-[100dvh] overflow-hidden ${intro ? 'is-intro' : ''} ${lift ? 'is-lifted' : ''}`} style={splashGeometry()}>
      <div className="splash-stage">
        {/* Сцена 941×1672: `srcset` отдаёт узкий файл только малым экранам, а на телефонах с DPR 3 — полный кадр. */}
        <img
          className="splash-bg"
          src={art.bg}
          srcSet={`${art.bg640} 640w, ${art.bg} 941w`}
          sizes="(max-aspect-ratio: 941/1672) calc(100vh * 0.5628), 100vw"
          width={941}
          height={1672}
          alt=""
          decoding="async"
          draggable={false}
        />
        <div className="splash-hero" aria-hidden>
          <img className="splash-beaver" src={art.bobek} alt="" width={528} height={606} draggable={false} />
          {error && !online && (
            <span className="splash-badge">
              <Icon name="wifi-off" size={26} strokeWidth={2.6} />
            </span>
          )}
        </div>
      </div>
      <div className="splash-shade" aria-hidden />
      {/* Логотип с украшением — группа под шапкой Telegram, масштаб по ширине экрана; те же размеры и места, что в мгновенной заставке index.html. */}
      <div className="splash-brandbar">
        <div className="splash-lockup">
          <img className="splash-orn" src={art.orn} alt="" width={424} height={134} draggable={false} />
          <img className="splash-logo" src={art.logo} alt="POLSKI GO" width={696} height={179} draggable={false} />
        </div>
        {(slogan || steps) && (
          <header className="splash-head">
            {slogan && <div className="splash-slogan">{slogan}</div>}
            {steps}
          </header>
        )}
      </div>
      {hasUi && <div className="splash-ui absolute inset-x-0 bottom-0 z-30">{error ? <ErrorUi onRetry={onRetry} offline={!online} /> : <LoadingUi onRetry={onRetry} />}</div>}
      {children}
    </div>
  );
}

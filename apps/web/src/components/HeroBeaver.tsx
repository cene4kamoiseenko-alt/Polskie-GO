/**
 * Бобек на банере главной — живой: по тапу подпрыгивает (подготовка → прыжок → приземление со сжатием),
 * на мгновение меняет позу и говорит короткую польскую фразу с переводом. Если фраза есть в библиотеке
 * озвучки, в облачке появляется кнопка «Послушать». Пять тапов подряд — «Łaskocze!» и праздничная поза.
 *
 * Рисунок Бобека — тот же растровый образ игрока (Beaver), анимируется только обёртка (transform),
 * поэтому скины и позы владельца не подменяются. «Меньше анимаций» / prefers-reduced-motion — без прыжка.
 */
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useAnimationControls, useReducedMotion } from '../lib/motion';
import { useT, type TKey } from '../i18n';
import { haptic } from '../lib/telegram';
import { audioIdOf, speak } from '../lib/audio';
import { Beaver, type BeaverMood } from './Beaver';
import { Icon } from './Icon';

const PHRASES: { pl: string; key: TKey; mood: BeaverMood }[] = [
  { pl: 'Cześć!', key: 'bobek_say_hi', mood: 'wave' },
  { pl: 'Dzień dobry!', key: 'bobek_say_morning', mood: 'wave' },
  { pl: 'Do dzieła!', key: 'bobek_say_go', mood: 'cheer' },
  { pl: 'Dasz radę!', key: 'bobek_say_can', mood: 'cheer' },
  { pl: 'Powodzenia!', key: 'bobek_say_luck', mood: 'happy' },
  { pl: 'Miłego dnia!', key: 'bobek_say_day', mood: 'wave' },
  { pl: 'Brawo!', key: 'bobek_say_bravo', mood: 'celebrate' },
];
const TICKLE = { pl: 'Łaskocze!', key: 'bobek_say_tickle' as TKey, mood: 'celebrate' as BeaverMood };
/** Сколько тапов подряд (с паузой меньше TAP_GAP_MS) нужно для «щекотки». */
const TICKLE_TAPS = 5;
const TAP_GAP_MS = 900;
const BUBBLE_MS = 2800;

export function HeroBeaver({ size, mood = 'happy' }: { size: number; mood?: BeaverMood }) {
  const { t } = useT();
  const reduce = useReducedMotion();
  const body = useAnimationControls();
  const [say, setSay] = useState<{ pl: string; key: TKey; n: number } | null>(null);
  const [pose, setPose] = useState<BeaverMood>(mood);
  const [audio, setAudio] = useState(false);
  const order = useRef(Math.floor(Math.random() * PHRASES.length));
  const taps = useRef<{ n: number; at: number }>({ n: 0, at: 0 });
  const timer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => setPose(mood), [mood]);

  // Есть ли запись фразы в библиотеке: без неё кнопку «Послушать» не показываем (и не шлём «нет файла» в админку).
  useEffect(() => {
    if (!say) return;
    let alive = true;
    setAudio(false);
    void audioIdOf(say.pl).then((id) => alive && setAudio(!!id), () => {});
    return () => { alive = false; };
  }, [say?.pl]); // eslint-disable-line react-hooks/exhaustive-deps

  const tap = () => {
    const now = Date.now();
    taps.current = now - taps.current.at < TAP_GAP_MS ? { n: taps.current.n + 1, at: now } : { n: 1, at: now };
    const tickle = taps.current.n >= TICKLE_TAPS;
    if (tickle) taps.current = { n: 0, at: 0 };
    const p = tickle ? TICKLE : PHRASES[order.current++ % PHRASES.length];
    if (tickle) haptic.success();
    else haptic.tap();
    setPose(p.mood);
    setSay((s) => ({ pl: p.pl, key: p.key, n: (s?.n ?? 0) + 1 }));
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setSay(null);
      setPose(mood);
    }, BUBBLE_MS);
    if (!reduce) {
      // Подготовка (присел) → прыжок (вытянулся) → приземление (сплющился) → покой. Точка опоры — у лап.
      void body.start({
        y: tickle ? [0, 2, -14, 0, -8, 0] : [0, 3, -20, 0, 0],
        scaleX: tickle ? [1, 1.07, 0.96, 1.06, 0.98, 1] : [1, 1.08, 0.95, 1.07, 1],
        scaleY: tickle ? [1, 0.91, 1.05, 0.94, 1.02, 1] : [1, 0.9, 1.06, 0.93, 1],
        rotate: tickle ? [0, -4, 5, -4, 3, 0] : 0,
        transition: { duration: tickle ? 0.8 : 0.62, ease: 'easeOut', times: tickle ? [0, 0.12, 0.35, 0.6, 0.8, 1] : [0, 0.16, 0.45, 0.74, 1] },
      });
    }
  };

  return (
    <div className="hero-beaver-wrap" style={{ width: size }}>
      <AnimatePresence>
        {say && (
          <motion.div
            key={say.n}
            className="beaver-bubble"
            role="status"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 520, damping: 30 }}
          >
            <span className="block text-[17px] font-black leading-tight" lang="pl">{say.pl}</span>
            <span className="block text-[11.5px] font-bold leading-tight text-[var(--text-muted)]">{t(say.key)}</span>
            {audio && (
              <button
                type="button"
                className="beaver-bubble-listen"
                onClick={(e) => { e.stopPropagation(); haptic.select(); void speak(say.pl); }}
                aria-label={`${t('bobek_listen')}: ${say.pl}`}
              >
                <Icon name="headphones" size={14} strokeWidth={2.4} /> {t('bobek_listen')}
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      <button type="button" className="hero-beaver-hit" onClick={tap} aria-label={t('bobek_tap_aria')}>
        <span className="hero-beaver-shadow" aria-hidden />
        <motion.span className="block" style={{ transformOrigin: '50% 100%' }} animate={body}>
          <Beaver mood={pose} size={size} />
        </motion.span>
      </button>
    </div>
  );
}

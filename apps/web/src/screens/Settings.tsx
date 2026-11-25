/**
 * Настройки — вариант В с выбором из Б (владелец 2026-11-24: «современнее, красивее и удобнее»).
 *  · Шапка: Бобек игрока в его образе, имя игрока, имя Бобека; карандаш — шторка профиля (имена).
 *  · 4 плитки: Язык, Тема, Цель дня, Уровень — на плитке текущее значение; тап открывает шторку выбора:
 *    тема — тремя картинками экрана, цель — четыре варианта с подписями и шкалой, уровень — четыре варианта и тест.
 *  · Группы: «Уведомления и звук» (напоминания и время, вопрос дня, звуки, произношение, проверка звука, меньше анимаций),
 *    «Приватность», вход на другом устройстве, «Аккаунт» (Premium, выгрузка, удаление).
 * Движение (design-motion-principles, «production polish»): плитки слегка сжимаются при нажатии, новое значение на плитке
 * проявляется из размытия, отметка выбора перетекает между вариантами (layoutId), тема меняется круговым раскрытием
 * от места нажатия (View Transitions). Выбор применяется сразу (оптимистично), сервер догоняет. «Меньше анимаций» — без движения.
 */
import { useId, useState, type ReactNode } from 'react';
import { Icon, type LineIconName } from '../components/Icon';
import type { StudyLevel, UiLang } from '@polski-go/shared';
import { useNavigate } from 'react-router-dom';
import { useT, type TKey } from '../i18n';
import { api, downloadExport, forgetDevice, ApiError } from '../lib/api';
import { isStandalone } from '../lib/platform';
import { haptic, requestBotWriteAccess, tg } from '../lib/telegram';
import { useStandaloneCopy } from '../lib/standaloneCopy';
import { useMe, useUpdateSettings } from '../lib/queries';
import { useQueryClient } from '@tanstack/react-query';
import type { Me } from '../lib/types';
import { levelTestPath } from '../lib/levelTest';
import { Modal, ScreenHeader, Sheet, cx, useToast } from '../components/ui';
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from '../lib/motion';
import { speak, type SpeechOutcome } from '../lib/audio';
import { PronHint } from '../components/PronHint';
import { CopyCode } from '../components/CopyCode';
import { Beaver } from '../components/Beaver';
import { Art } from '../components/GameArt';

/**
 * Значки только этого экрана — здесь, а не в общем Icon: экран грузится отдельным чанком, общий набор — в JS холодного старта
 * (бюджет scripts/perf.ts). Рисуются так же, как Icon: контур 24×24, currentColor.
 */
const GLYPHS = {
  globe: <><circle cx="12" cy="12" r="8.5" /><path d="M3.5 12h17M12 3.5c2.5 2.6 3.6 5.4 3.6 8.5s-1.1 5.9-3.6 8.5c-2.5-2.6-3.6-5.4-3.6-8.5S9.5 6.1 12 3.5z" /></>,
  palette: <><path d="M12 3.5a8.5 8.5 0 100 17c1.2 0 1.8-.8 1.8-1.7 0-1.3-1.1-1.6-1.1-2.7 0-1 .8-1.6 1.8-1.6h2.1a3.9 3.9 0 003.9-3.9c0-4-3.8-7.1-8.5-7.1z" /><circle cx="7.8" cy="11" r="1.1" /><circle cx="10.5" cy="7.6" r="1.1" /><circle cx="15" cy="8.2" r="1.1" /></>,
  pencil: <><path d="M4.5 19.5l1-4L16 5a2.1 2.1 0 013 3L8.5 18.5z" /><path d="M14 7l3 3" /></>,
  download: <><path d="M12 4v11" /><path d="M7.5 10.5L12 15l4.5-4.5" /><path d="M5 19.5h14" /></>,
  trash: <><path d="M4.5 7h15" /><path d="M9.5 7V5h5v2" /><path d="M6.5 7l1 12.5h9l1-12.5" /></>,
  bell: <><path d="M6 16.5V11a6 6 0 0112 0v5.5l1.5 1.5h-15z" /><path d="M10 20.5a2 2 0 004 0" /></>,
  volume: <><path d="M4.5 9.5h3.5L12.5 6v12L8 14.5H4.5z" /><path d="M16 9a4 4 0 010 6M18.5 6.5a7.5 7.5 0 010 11" /></>,
  eye: <><path d="M2.5 12s3.5-6.5 9.5-6.5 9.5 6.5 9.5 6.5-3.5 6.5-9.5 6.5S2.5 12 2.5 12z" /><circle cx="12" cy="12" r="2.8" /></>,
  sparkles: <><path d="M12 4l1.8 4.7 4.7 1.8-4.7 1.8L12 17l-1.8-4.7-4.7-1.8 4.7-1.8z" /><path d="M18.5 15.5l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z" /></>,
} satisfies Record<string, ReactNode>;
type Glyph = LineIconName | keyof typeof GLYPHS;

function SetIcon({ name, size, strokeWidth = 2 }: { name: Glyph; size: number; strokeWidth?: number }) {
  if (!(name in GLYPHS)) return <Icon name={name as LineIconName} size={size} strokeWidth={strokeWidth} />;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {GLYPHS[name as keyof typeof GLYPHS]}
    </svg>
  );
}

type Tone = 'sky' | 'violet' | 'orange' | 'green' | 'red' | 'pink' | 'teal' | 'amber' | 'slate' | 'blue';
type Patch = Partial<Me['settings']> & { dailyQuiz?: boolean };

// Польської серед мов інтерфейсу немає: застосунок учить польську, пояснення — рідною мовою учня.
const LANGS: [UiLang, string, string][] = [['uk', 'Українська', 'Ukrainian'], ['ru', 'Русский', 'Russian'], ['en', 'English', 'English']];
const GOALS: [number, TKey][] = [[5, 'set_goal_easy'], [10, 'set_goal_normal'], [15, 'set_goal_serious'], [20, 'set_goal_intense']];
const LEVELS: ['base' | StudyLevel, string][] = [['base', ''], ['A2', 'A2'], ['B1', 'B1'], ['B2', 'B2']];
const SPRING = { type: 'spring', duration: 0.42, bounce: 0.12 } as const;

function IconChip({ icon, tone, size = 34 }: { icon: Glyph; tone: Tone; size?: number }) {
  return (
    <span className={cx('set-chip grid shrink-0 place-items-center rounded-[11px] text-white', `tone-${tone}`)} style={{ width: size, height: size }} aria-hidden>
      <SetIcon name={icon} size={Math.round(size * 0.56)} strokeWidth={2.3} />
    </span>
  );
}

/** Значение на плитке: новое проявляется из размытия, старое уходит. */
function SwapText({ value, className }: { value: string; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <span className={cx('relative block', className)}>
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          key={value}
          className="block"
          initial={reduce ? false : { opacity: 0, y: 6, filter: 'blur(4px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={reduce ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, y: -4, filter: 'blur(3px)', transition: { duration: 0.15 } }}
          transition={{ type: 'spring', duration: 0.4, bounce: 0 }}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/** Показатель в шапке: значок игры (растр), число, подпись. */
function HeroStat({ k, art, value, label }: { k: string; art: 'flame' | 'coin' | 'star'; value: string; label: string }) {
  return (
    <div className="set-hero-stat" data-hero-stat={k}>
      <Art name={art} size={24} />
      <span className="min-w-0">
        <span className="block truncate text-[15px] font-black leading-tight tabular-nums">{value}</span>
        <span className="block truncate text-[11px] font-bold leading-tight opacity-80">{label}</span>
      </span>
    </div>
  );
}

function Tile({ k, icon, tone, label, value, sub, onOpen, extra }: { k: string; icon: Glyph; tone: Tone; label: string; value: string; sub?: string; onOpen: () => void; extra?: Record<string, string> }) {
  return (
    <button type="button" className="set-tile text-left" data-setting-tile={k} onClick={() => { haptic.tap(); onOpen(); }} aria-haspopup="dialog" {...extra}>
      <span className="flex items-start justify-between">
        <IconChip icon={icon} tone={tone} />
        <Icon name="chevron-right" size={18} className="mt-1 text-[var(--text-muted)]" />
      </span>
      <span className="mt-3 block text-[12.5px] font-extrabold text-[var(--text-muted)]">{label}</span>
      <SwapText value={value} className="mt-0.5 text-[16.5px] font-black leading-tight" />
      {sub !== undefined && <SwapText value={sub} className="mt-0.5 text-[12.5px] font-bold text-[var(--text-muted)]" />}
    </button>
  );
}

function Group({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section data-settings-group={id} aria-label={title}>
      <h2 className="mb-2 px-1 text-[13px] font-extrabold text-[var(--text-muted)]">{title}</h2>
      <div className="set-group">{children}</div>
    </section>
  );
}

/** Переключатель: бегунок едет пружиной (transform, не left). */
function Switch({ checked }: { checked: boolean }) {
  return (
    <span className={cx('set-switch', checked && 'is-on')} aria-hidden>
      <motion.span className="set-switch-knob" initial={false} animate={{ x: checked ? 20 : 0 }} transition={{ type: 'spring', stiffness: 700, damping: 34 }} />
    </span>
  );
}

function SwitchRow({ id, icon, tone, label, desc, checked, onChange }: { id: string; icon: Glyph; tone: Tone; label: string; desc?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" role="switch" aria-checked={checked} data-switch={id} className="set-row" onClick={() => { haptic.select(); onChange(!checked); }}>
      <IconChip icon={icon} tone={tone} size={30} />
      <span className="min-w-0 flex-1">
        <span className="block font-extrabold">{label}</span>
        {desc && <span className="mt-0.5 block text-[12.5px] font-semibold leading-snug text-[var(--text-muted)]">{desc}</span>}
      </span>
      <Switch checked={checked} />
    </button>
  );
}

function LinkRow({ icon, tone, label, onClick, danger, data }: { icon: Glyph; tone: Tone; label: string; onClick: () => void; danger?: boolean; data?: Record<string, string> }) {
  return (
    <button type="button" className={cx('set-row', danger && 'text-coral')} onClick={onClick} {...data}>
      <IconChip icon={icon} tone={tone} size={30} />
      <span className="min-w-0 flex-1 font-extrabold">{label}</span>
      {!danger && <Icon name="chevron-right" size={18} className="text-[var(--text-muted)]" />}
    </button>
  );
}

/** Ряд выбора внутри шторки: отметка перетекает между вариантами (layoutId). */
function Seg<T extends string | number>({ value, options, onChange, name }: { value: T; options: [T, string][]; onChange: (v: T) => void; name: string }) {
  return (
    <div className="set-seg" role="radiogroup">
      <LayoutGroup id={name}>
        {options.map(([v, label]) => (
          <button key={String(v)} type="button" role="radio" aria-checked={value === v} className={cx('set-seg-item', value === v && 'is-on')} onClick={() => { haptic.select(); onChange(v); }}>
            {value === v && <motion.span layoutId="pick" className="set-seg-pill" transition={SPRING} />}
            <span className="relative">{label}</span>
          </button>
        ))}
      </LayoutGroup>
    </div>
  );
}

/** Польська озвучка — готові записи голосу Kamil; перевірка справжнім відтворенням фрази з бібліотеки. */
function AudioDiagnostics({ server }: { server: boolean }) {
  const { t } = useT();
  const [check, setCheck] = useState<SpeechOutcome | 'running' | null>(null);
  const run = async () => {
    setCheck('running');
    setCheck(await speak('Dzień dobry! Dziękuję, do widzenia.'));
  };
  const result = check && check !== 'running' ? check : null;
  return (
    <div className="set-row is-static">
      <IconChip icon="headphones" tone="blue" size={30} />
      <div className="min-w-0 flex-1">
        <div className="font-extrabold">{t('audio_source')}</div>
        <div className={cx('text-[12.5px] font-semibold', server ? 'text-[var(--text-muted)]' : 'text-coral-dark')}>{server ? t('audio_source_library') : t('audio_soon')}</div>
        {result && (
          <p role="status" className={cx('mt-1 text-xs font-bold', result.played ? 'text-[var(--text-muted)]' : 'text-coral-dark')}>
            {result.played
              ? t('audio_check_ok', { source: t(`audio_src_${result.source}` as TKey) })
              : t(result.issue === 'missing' ? 'audio_soon' : result.issue === 'blocked' ? 'audio_blocked' : 'audio_error')}
          </p>
        )}
      </div>
      <button className="chip shrink-0 px-3 py-2" disabled={check === 'running' || !server} aria-busy={check === 'running'} onClick={() => void run()}>
        {t('audio_check')}
      </button>
    </div>
  );
}

/** Підказка вимови: приблизно кирилицею (лише ru/uk), IPA або без підказки; приклад — на живій фразі. */
function PronSetting({ value, onChange }: { value: 'simple' | 'ipa' | 'off'; onChange: (v: 'simple' | 'ipa' | 'off') => void }) {
  const { t, lang } = useT();
  const cyr = lang === 'ru' || lang === 'uk';
  const options: ['simple' | 'ipa' | 'off', string][] = [...(cyr ? [['simple', t('pron_simple')] as ['simple', string]] : []), ['ipa', 'IPA'], ['off', t('pron_off')]];
  return (
    <div className="set-row is-static !items-start" data-setting="pron">
      <IconChip icon="mic" tone="teal" size={30} />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="font-extrabold">{t('set_pron')}</div>
        <Seg name="pron" value={!cyr && value === 'simple' ? 'ipa' : value} options={options} onChange={onChange} />
        <div className="text-sm font-bold">
          <span lang="pl">Dzień dobry</span> <PronHint text="Dzień dobry" inline className="text-sky-dark" />
        </div>
        <p className="text-[12px] font-semibold leading-snug text-[var(--text-muted)]">{t('set_pron_note')}</p>
      </div>
    </div>
  );
}

/** Код для входа на другом устройстве (Android-приложение, браузер): одноразовый, 10 минут. Гостю напоминает, что без него аккаунт живёт только на этом устройстве. */
function LinkCodeCard({ guest }: { guest: boolean }) {
  const c = useStandaloneCopy();
  const toast = useToast();
  const [code, setCode] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const get = async () => {
    setBusy(true);
    try {
      setCode((await api<{ code: string }>('/me/link-code', { method: 'POST', body: {} })).code);
    } catch (e) {
      const status = e instanceof ApiError ? e.status : 0;
      toast(c(status === 429 ? 'set_link_many' : status === 404 ? 'set_link_off' : 'set_link_fail'), '⚠️');
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="set-group space-y-2 p-4">
      <div className="flex items-center gap-3">
        <IconChip icon="send" tone="sky" size={30} />
        <div className="font-black">{c('set_link_title')}</div>
      </div>
      <p className="text-sm font-semibold leading-snug text-[var(--text-muted)]">{guest ? c('set_link_guest') : c('set_link_text')}</p>
      {code ? (
        <div className="space-y-1 text-center">
          <CopyCode value={code} hint={c('copy_tap')} done={c('copy_done')} fail={c('copy_fail')} data-copy-code="link" />
          <p className="text-xs font-bold text-[var(--text-muted)]">{c('set_link_valid')}</p>
        </div>
      ) : null}
      <button className="btn btn-ghost w-full" disabled={busy} onClick={get} data-link-get>{c('set_link_get')}</button>
    </div>
  );
}

/** Картинка экрана в шторке темы: светлый, тёмный и «как в Telegram» (половина на половину). */
function ThemePreview({ kind }: { kind: 'auto' | 'light' | 'dark' }) {
  return (
    <span className={cx('theme-preview', `is-${kind}`)} aria-hidden>
      <span className="tp-bar" />
      <span className="tp-card"><span className="tp-dot" /><span className="tp-line" /></span>
      <span className="tp-card"><span className="tp-dot is-green" /><span className="tp-line" /></span>
      <span className="tp-nav" />
    </span>
  );
}

/** Тема применяется сразу: круговое раскрытие от места нажатия (View Transitions), где браузер умеет; иначе — мгновенно. */
function applyTheme(next: Me['settings']['theme'], at: { x: number; y: number }, reduce: boolean, commit: () => void) {
  const systemDark = tg ? tg.colorScheme === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  const dark = next === 'dark' || (next === 'auto' && systemDark);
  const root = document.documentElement;
  const paint = () => {
    root.classList.toggle('dark', dark);
    root.classList.toggle('light', !dark);
    commit();
  };
  const doc = document as Document & { startViewTransition?: (cb: () => void) => { ready: Promise<void>; finished: Promise<void> } };
  if (reduce || !doc.startViewTransition || root.classList.contains('dark') === dark) return paint();
  root.classList.add('theme-vt');
  const vt = doc.startViewTransition(paint);
  void vt.ready
    .then(() => {
      const r = Math.hypot(Math.max(at.x, window.innerWidth - at.x), Math.max(at.y, window.innerHeight - at.y));
      root.animate({ clipPath: [`circle(0px at ${at.x}px ${at.y}px)`, `circle(${r}px at ${at.x}px ${at.y}px)`] }, { duration: 560, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', pseudoElement: '::view-transition-new(root)' });
    })
    .catch(() => {});
  void vt.finished.finally(() => root.classList.remove('theme-vt'));
}

export default function SettingsScreen() {
  const { t, lang } = useT();
  const c = useStandaloneCopy();
  const nav = useNavigate();
  const qc = useQueryClient();
  const toast = useToast();
  const reduce = useReducedMotion();
  const me = useMe().data!;
  const upd = useUpdateSettings();
  const s = me.settings;
  const formId = useId();
  const [sheet, setSheet] = useState<null | 'lang' | 'theme' | 'goal' | 'level' | 'profile'>(null);
  const [del, setDel] = useState(false);
  const [beaverName, setBeaverName] = useState(me.profile.beaverName);
  const [displayName, setDisplayName] = useState(me.profile.displayName ?? '');

  // Выбор виден сразу (кэш профиля), сервер догоняет; ответ сервера заменяет кэш.
  const set = (patch: Patch) => {
    qc.setQueryData<Me>(['me'], (m) => {
      if (!m) return m;
      const { dailyQuiz, ...rest } = patch;
      return { ...m, settings: { ...m.settings, ...rest }, ...(dailyQuiz === undefined ? {} : { dailyQuiz }) };
    });
    upd.mutate(patch);
  };

  const studyLevel = me.progress.studyLevel ?? 'base';
  const setStudyLevel = async (level: StudyLevel | null) => {
    const r = await api<Me>('/me/study-level', { method: 'PATCH', body: { level } });
    qc.setQueryData(['me'], r);
    toast(t('toast_saved'), '✅');
  };

  const saveProfile = async () => {
    const r = await api<Me>('/me/profile', { method: 'PATCH', body: { beaverName: beaverName || 'Bobek', displayName: displayName || null } });
    qc.setQueryData(['me'], r);
    setSheet(null);
    toast(t('toast_saved'), '✅');
  };

  const themeName = (v: Me['settings']['theme']) => (v === 'auto' ? (isStandalone ? c('theme_system') : t('theme_auto')) : t(v === 'light' ? 'theme_light' : 'theme_dark'));
  const goalKey = GOALS.find(([n]) => n === s.dailyGoalMinutes)?.[1];
  const levelName = (v: 'base' | StudyLevel) => (v === 'base' ? t('set_study_base') : v);

  return (
    <div className="space-y-5 px-4 pb-10">
      <ScreenHeader title={t('set_title')} />

      {/* Шапка: Бобек игрока, имена; карандаш — шторка профиля. Внизу — серия, злотки и опыт во всю ширину (владелец 2026-11-25:
          справа было много пустого места). Бобек «стоит» на полосе показателей. */}
      <section className="set-hero" data-settings-hero aria-label={t('set_profile_title')}>
        <div className="relative flex items-end gap-1 pr-14">
          <div className="set-hero-beaver">
            <Beaver mood="happy" size={96} />
          </div>
          <div className="min-w-0 flex-1 pb-3 pt-5">
            <div className="truncate text-[23px] font-black leading-tight">{me.profile.displayName || t('set_player')}</div>
            <div className="set-hero-chip mt-1.5">{t('set_hero_bobek', { name: me.profile.beaverName })}</div>
          </div>
        </div>
        <div className="set-hero-stats">
          <HeroStat k="streak" art="flame" value={t('set_stat_days', { n: me.progress.streak })} label={t('set_stat_streak')} />
          <HeroStat k="zlotki" art="coin" value={me.zlotki.toLocaleString(lang)} label={t('set_stat_zlotki')} />
          <HeroStat k="xp" art="star" value={me.progress.xpTotal.toLocaleString(lang)} label={t('set_stat_xp')} />
        </div>
        <button type="button" className="set-hero-edit" data-edit-profile aria-label={t('set_profile_edit')} onClick={() => { haptic.tap(); setSheet('profile'); }}>
          <SetIcon name="pencil" size={19} strokeWidth={2.4} />
        </button>
      </section>

      {/* Плитки: текущее значение, тап — шторка выбора. */}
      <div className="grid grid-cols-2 gap-3">
        <Tile k="lang" icon="globe" tone="sky" label={t('set_tile_lang')} value={LANGS.find(([v]) => v === s.uiLanguage)?.[1] ?? ''} onOpen={() => setSheet('lang')} />
        <Tile k="theme" icon="palette" tone="violet" label={t('set_theme')} value={themeName(s.theme)} onOpen={() => setSheet('theme')} />
        <Tile k="goal" icon="target" tone="orange" label={t('set_tile_goal')} value={t('set_min', { n: s.dailyGoalMinutes })} sub={goalKey ? t(goalKey) : ''} onOpen={() => setSheet('goal')} />
        <Tile k="level" icon="layers" tone="green" label={t('set_tile_level')} value={levelName(studyLevel)} onOpen={() => setSheet('level')} extra={{ 'data-study-level': studyLevel }} />
      </div>

      <Group id="notify" title={t('set_group_notify')}>
        {me.guest ? (
          <p className="set-row is-static text-sm font-semibold leading-snug text-[var(--text-muted)]" data-guest-no-reminders>{c('set_notif_guest')}</p>
        ) : (
          <SwitchRow
            id="notifications"
            icon="bell"
            tone="red"
            label={t('set_notifications')}
            checked={s.notificationsEnabled}
            onChange={(v) => {
              const patch = { notificationsEnabled: v, reminderHour: s.reminderHour ?? 19 };
              // Включая напоминания, игрок один раз видит окно Telegram «разрешить боту писать вам»; настройки сохраняются после него:
              // сохранение позже прошлого отказа Telegram (403) снимает «тишину» (bot/mute.ts) — бот пробует снова.
              if (v) void requestBotWriteAccess().then(() => set(patch));
              else set(patch);
            }}
          />
        )}
        <AnimatePresence initial={false}>
          {!me.guest && s.notificationsEnabled && (
            <motion.div
              key="hour"
              className="set-row is-static !block"
              initial={reduce ? false : { opacity: 0, y: -6, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={reduce ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, filter: 'blur(3px)', transition: { duration: 0.12 } }}
              transition={{ type: 'spring', duration: 0.4, bounce: 0 }}
            >
              <div className="mb-2 text-sm font-extrabold">{t('set_reminder_hour')}</div>
              <Seg name="hour" value={s.reminderHour ?? 19} options={[8, 12, 18, 19, 20, 21].map((h) => [h, `${h}:00`] as [number, string])} onChange={(v) => set({ reminderHour: v })} />
            </motion.div>
          )}
        </AnimatePresence>
        {!me.guest && typeof me.dailyQuiz === 'boolean' && (
          <div data-daily-quiz-toggle>
            <SwitchRow id="daily-quiz" icon="chat" tone="sky" label={t('set_daily_quiz')} desc={t('set_daily_quiz_d')} checked={me.dailyQuiz} onChange={(v) => set({ dailyQuiz: v })} />
          </div>
        )}
        <SwitchRow id="sound" icon="volume" tone="pink" label={t('set_sound')} checked={s.soundEnabled} onChange={(v) => set({ soundEnabled: v })} />
        <PronSetting value={s.pronHint ?? 'simple'} onChange={(v) => set({ pronHint: v })} />
        <AudioDiagnostics server={!!me.audio?.server} />
        <SwitchRow id="motion" icon="sparkles" tone="violet" label={t('set_motion')} checked={s.reducedMotion} onChange={(v) => set({ reducedMotion: v })} />
      </Group>

      <Group id="privacy" title={t('set_privacy')}>
        <SwitchRow id="public" icon="eye" tone="green" label={t('set_public_profile')} desc={t('set_public_profile_d')} checked={s.publicProfile} onChange={(v) => set({ publicProfile: v })} />
        <SwitchRow id="leaderboard" icon="trophy" tone="amber" label={t('set_leaderboard')} checked={s.showInLeaderboard} onChange={(v) => set({ showInLeaderboard: v })} />
      </Group>

      {me.standaloneAuth && <LinkCodeCard guest={!!me.guest} />}

      <Group id="account" title={t('set_group_account')}>
        <LinkRow icon="crown" tone="amber" label={t('set_premium')} onClick={() => nav('/premium')} />
        <LinkRow icon="download" tone="slate" label={t('set_export')} onClick={() => downloadExport()} />
        <LinkRow icon="trash" tone="red" label={t('set_delete')} danger onClick={() => setDel(true)} />
      </Group>

      <p className="text-center text-xs font-bold text-[var(--text-muted)]">
        <a className="underline" href={`/privacy?lang=${lang}`} target="_blank" rel="noopener" data-privacy-link>{c('set_privacy_link')}</a>
        {' · '}
        <a className="underline" href={`/terms?lang=${lang}`} target="_blank" rel="noopener" data-terms-link>{c('set_terms_link')}</a>
        {' · '}
        <a className="underline" href={`/delete-account?lang=${lang}`} target="_blank" rel="noopener">{c('set_delete_page')}</a>
      </p>
      <p className="text-center text-xs font-bold text-[var(--text-muted)]">POLSKI GO · {t('set_version', { v: '0.1.0' })}</p>

      {/* ── Шторки выбора ── */}
      <Sheet open={sheet === 'lang'} onClose={() => setSheet(null)} label={t('set_language')}>
        <h2 className="mb-3 text-xl font-black">{t('set_language')}</h2>
        <div className="space-y-2" role="radiogroup" aria-label={t('set_language')}>
          <LayoutGroup id="lang">
            {LANGS.map(([v, name, en]) => (
              <button key={v} type="button" role="radio" aria-checked={s.uiLanguage === v} data-lang-option={v} className={cx('set-option', s.uiLanguage === v && 'is-on')} onClick={() => { haptic.select(); set({ uiLanguage: v }); }}>
                {s.uiLanguage === v && <motion.span layoutId="ring" className="set-option-ring" transition={SPRING} />}
                <span className="relative flex-1">
                  <span className="block text-[17px] font-black">{name}</span>
                  {name !== en && <span className="block text-[12.5px] font-bold text-[var(--text-muted)]">{en}</span>}
                </span>
                <span className={cx('set-radio relative', s.uiLanguage === v && 'is-on')}>{s.uiLanguage === v && <Icon name="check" size={15} strokeWidth={3} />}</span>
              </button>
            ))}
          </LayoutGroup>
        </div>
      </Sheet>

      <Sheet open={sheet === 'theme'} onClose={() => setSheet(null)} label={t('set_theme')}>
        <h2 className="text-xl font-black">{t('set_theme')}</h2>
        <p className="mb-3 mt-1 text-sm font-semibold text-[var(--text-muted)]">{t('set_theme_hint')}</p>
        <div className="grid grid-cols-3 gap-2.5" role="radiogroup" aria-label={t('set_theme')}>
          <LayoutGroup id="theme">
            {(['auto', 'light', 'dark'] as const).map((v) => (
              <button
                key={v}
                type="button"
                role="radio"
                aria-checked={s.theme === v}
                data-theme-option={v}
                className="set-theme-card"
                onClick={(e) => {
                  haptic.select();
                  const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
                  applyTheme(v, { x: r.left + r.width / 2, y: r.top + r.height / 2 }, reduce, () => set({ theme: v }));
                }}
              >
                <span className="relative block">
                  <ThemePreview kind={v} />
                  {s.theme === v && <motion.span layoutId="ring" className="set-theme-ring" transition={SPRING} />}
                </span>
                <span className="mt-2 block text-center text-[13px] font-extrabold leading-tight">{themeName(v)}</span>
              </button>
            ))}
          </LayoutGroup>
        </div>
      </Sheet>

      <Sheet open={sheet === 'goal'} onClose={() => setSheet(null)} label={t('set_goal')}>
        <h2 className="text-xl font-black">{t('set_goal')}</h2>
        <p className="mb-3 mt-1 text-sm font-semibold text-[var(--text-muted)]">{t('set_goal_hint')}</p>
        <div className="grid grid-cols-2 gap-2.5" role="radiogroup" aria-label={t('set_goal')}>
          <LayoutGroup id="goal">
            {GOALS.map(([n, key], idx) => (
              <button key={n} type="button" role="radio" aria-checked={s.dailyGoalMinutes === n} data-goal-option={n} className="set-option !block text-left" onClick={() => { haptic.select(); set({ dailyGoalMinutes: n }); }}>
                {s.dailyGoalMinutes === n && <motion.span layoutId="ring" className="set-option-ring" transition={SPRING} />}
                <span className="relative block text-[12.5px] font-extrabold text-[var(--text-muted)]">{t(key)}</span>
                <span className="relative mt-0.5 block text-[20px] font-black">{t('set_min', { n })}</span>
                <span className="relative mt-2 flex gap-1" aria-hidden>
                  {[0, 1, 2, 3].map((b) => (
                    <span key={b} className={cx('set-meter', b <= idx && 'is-on')} />
                  ))}
                </span>
              </button>
            ))}
          </LayoutGroup>
        </div>
      </Sheet>

      <Sheet open={sheet === 'level'} onClose={() => setSheet(null)} label={t('set_study_level')}>
        <h2 className="text-xl font-black">{t('set_study_level')}</h2>
        <div className="mt-3 grid grid-cols-4 gap-2" role="radiogroup" aria-label={t('set_study_level')}>
          <LayoutGroup id="level">
            {LEVELS.map(([v]) => (
              <button key={v} type="button" role="radio" aria-checked={studyLevel === v} data-level-option={v} className="set-option !min-h-[64px] !justify-center !px-1 text-center" onClick={() => { haptic.select(); void setStudyLevel(v === 'base' ? null : v); }}>
                {studyLevel === v && <motion.span layoutId="ring" className="set-option-ring" transition={SPRING} />}
                <span className={cx('relative font-black', v === 'base' ? 'text-[13px] leading-tight' : 'text-[19px]')}>{levelName(v)}</span>
              </button>
            ))}
          </LayoutGroup>
        </div>
        <p className="mt-3 text-[13px] font-semibold leading-snug text-[var(--text-muted)]">{t('set_study_level_hint')}</p>
        <button className="btn btn-ghost mt-3 w-full" data-open-level-test onClick={() => void levelTestPath().then((path) => path && nav(path))}>
          <Icon name="target" size={20} /> {t('set_study_test')}
        </button>
      </Sheet>

      <Sheet
        open={sheet === 'profile'}
        onClose={() => setSheet(null)}
        label={t('set_profile_title')}
        footer={<button className="btn btn-primary mb-2 w-full" data-profile-save onClick={() => void saveProfile()}>{t('save')}</button>}
      >
        <h2 className="mb-3 text-xl font-black">{t('set_profile_title')}</h2>
        <label htmlFor={`${formId}-name`} className="mb-1 block text-sm font-black">{t('set_display_name')}</label>
        <input id={`${formId}-name`} value={displayName} maxLength={32} onChange={(e) => setDisplayName(e.target.value)} className="set-input" autoComplete="nickname" />
        <label htmlFor={`${formId}-beaver`} className="mb-1 mt-3 block text-sm font-black">{t('set_beaver_name')}</label>
        <input id={`${formId}-beaver`} value={beaverName} maxLength={20} onChange={(e) => setBeaverName(e.target.value)} className="set-input" data-beaver-name-input />
      </Sheet>

      <Modal open={del} onClose={() => setDel(false)}>
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-coral/15 text-coral"><Icon name="alert" size={36} /></div>
        <p className="mt-2 font-bold">{t('set_delete_confirm')}</p>
        <div className="mt-4 space-y-2">
          <button className="btn btn-ghost w-full" onClick={() => setDel(false)}>{t('cancel')}</button>
          <button
            className="btn btn-red w-full"
            onClick={async () => {
              await api('/me', { method: 'DELETE', body: { confirm: 'DELETE' } });
              toast(t('set_deleted'), '👋');
              forgetDevice();
              setTimeout(() => (tg ? tg.close() : window.location.reload()), 800);
            }}
          >
            {t('set_delete')}
          </button>
        </div>
      </Modal>
    </div>
  );
}

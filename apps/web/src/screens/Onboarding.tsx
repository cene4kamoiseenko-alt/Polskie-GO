import { AnimatePresence, motion } from '../lib/motion';
import { SplashScene } from '../components/Splash';
import { Icon, type LineIconName } from '../components/Icon';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import type { Cefr, UiLang } from '@polski-go/shared';
import { useT, type TKey } from '../i18n';
import { api } from '../lib/api';
import { haptic } from '../lib/telegram';
import { takeLaunchRoute } from '../lib/launch';
import { speak, stopSpeech } from '../lib/audio';
import { useJourney, useUpdateSettings } from '../lib/queries';
import type { Me } from '../lib/types';
import { Beaver } from '../components/Beaver';
import { Progress, cx } from '../components/ui';
import { PolandMap } from '../components/PolandMap';
import { Logo, Skyline } from '../components/Scenery';
import { LangFlag } from '../components/pictograms/Flag';
import { PictoTile } from '../components/pictograms/Pictogram';
import { inkOn } from '../lib/color';

/** Перша польська фраза знайомства (після «Cześć!»): звучить польським голосом за кнопкою «Послухати». */
const HELLO_PL = 'Jestem Bobek. Razem nauczymy się polskiego!';

const LANGS: { code: UiLang; name: string }[] = [
  { code: 'uk', name: 'Українська' },
  { code: 'ru', name: 'Русский' },
  { code: 'en', name: 'English' },
];
const LEVELS: Cefr[] = ['A0', 'A1', 'A2', 'B1', 'B2'];
/** Кольори бейджів рівнів CEFR. */
export const LEVEL_COLORS: Record<string, string> = { A0: '#45C486', A1: '#3A7BD5', A2: '#9B6BFF', B1: '#F2994A', B2: '#E5484D' };
const GOALS = ['life', 'work', 'study', 'exam', 'travel', 'fun'] as const;
const GOAL_ICONS: Record<(typeof GOALS)[number], [LineIconName, string]> = {
  life: ['home', '#35C88A'], work: ['layers', '#55BDF4'], study: ['book', '#9568F5'], exam: ['trophy', '#F45159'], travel: ['map', '#FFBD42'], fun: ['star', '#FF8A3D'],
};
const TIMES = [5, 10, 15, 20] as const;
const HOURS = [8, 12, 18, 20];

function Option({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <motion.button whileTap={{ scale: 0.97 }} data-state={selected ? 'selected' : undefined} className="option flex items-center gap-3" onClick={() => { haptic.select(); onClick(); }}>
      {children}
    </motion.button>
  );
}

export default function Onboarding() {
  const { t, lang } = useT();
  const nav = useNavigate();
  const qc = useQueryClient();
  const updateSettings = useUpdateSettings();
  const journey = useJourney();
  const [step, setStep] = useState(0);
  const [level, setLevel] = useState<Cefr>('A0');
  const [placement, setPlacement] = useState(false);
  const [goal, setGoal] = useState<(typeof GOALS)[number]>('life');
  const [time, setTime] = useState<(typeof TIMES)[number]>(10);
  const [hour, setHour] = useState<number | null>(19);
  const [busy, setBusy] = useState(false);
  const [heard, setHeard] = useState(false);

  const steps = ['hello', 'lang', 'level', ...(level !== 'A0' ? ['placement'] : []), 'goal', 'time', 'reminder', 'map'];
  const id = steps[step];
  const nextStep = () => setStep((s) => Math.min(s + 1, steps.length - 1));

  const finish = async () => {
    setBusy(true);
    try {
      const me = await api<Me>('/me/onboarding', {
        method: 'POST',
        body: { uiLanguage: lang, selfLevel: level, learningGoal: goal, dailyGoalMinutes: time, reminderHour: hour, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone },
      });
      // Бот просив відкрити конкретний екран: після знайомства — він (вступний тест не перебиваємо).
      const launch = takeLaunchRoute();
      qc.setQueryData(['me'], me);
      if (placement) {
        const exams = await api<{ exams: { id: string; kind: string }[] }>('/exams');
        const p = exams.exams.find((e) => e.kind === 'PLACEMENT');
        if (p) return nav(`/lesson/${p.id}`, { replace: true });
      }
      const first = journey.data?.nextLesson;
      nav(launch ?? (first ? `/lesson/${first.id}` : '/'), { replace: true });
    } finally {
      setBusy(false);
    }
  };

  if (id === 'hello') {
    return (
      <SplashScene
        slogan={t('slogan')}
        // Бобер стоїть над реплікою: репліка (≈150 px) над двома кнопками.
        heroBottom="calc(var(--safe-b) + 286px)"
        steps={
          <div className="splash-steps" aria-label={t('boot_step', { n: 1, total: steps.length })}>
            {steps.map((x, i) => <i key={x} className={i === 0 ? 'on' : undefined} />)}
            <span className="ml-1">1/{steps.length}</span>
          </div>
        }
      >
        <motion.div initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.45, type: 'spring' }} className="absolute inset-x-5 z-30 rounded-3xl border-2 border-sky/60 bg-white px-5 py-3.5 text-left text-ink shadow-[0_8px_0_rgb(7_24_44/0.35)]" style={{ bottom: 'calc(var(--safe-b) + 150px)' }}>
          <div className="absolute -top-2.5 left-1/2 h-5 w-5 -translate-x-1/2 rotate-45 border-l-2 border-t-2 border-sky/60 bg-white" />
          {/* Репліка завжди на білому тлі — фіксований темно-синій, а не токен теми (у темній темі він світлий). */}
          <div className="mb-0.5 text-[12px] font-black uppercase tracking-wide text-[#0b6aa0]">Bobek</div>
          <div lang="pl" className="text-[26px] font-black leading-tight">Cześć!</div>
          <div lang="pl" className="text-[16px] font-extrabold leading-snug">{HELLO_PL}</div>
          {t('ob_bubble') && <div className="mt-0.5 text-[14px] font-bold leading-snug text-[#3d5168]">{t('ob_bubble')}</div>}
        </motion.div>
        <div className="safe-bottom absolute inset-x-5 bottom-4 z-20 space-y-2">
          <motion.button initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }} className="btn btn-red w-full text-lg" onClick={() => { haptic.tap(); stopSpeech(); nextStep(); }}>
            {t('ob_start_journey')}
          </motion.button>
          {/* Польська звучить лише польським голосом (сервер або голос пристрою); без нього — зрозумілий стан, а не чужий голос. */}
          <motion.button initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.7 }} className="btn btn-ghost flex w-full items-center justify-center gap-2 bg-white text-ink" onClick={() => { haptic.tap(); setHeard(true); void speak(`Cześć! ${HELLO_PL}`); }}>
            <Icon name="headphones" size={20} />
            {t(heard ? 'ob_listen_again' : 'ob_listen')}
          </motion.button>
        </div>
      </SplashScene>
    );
  }

  return (
    <div className="min-h-app flex flex-col px-5 pt-4">
      {step > 0 && (
        <div className="mb-4 flex items-center gap-3">
          <button className="text-2xl font-black" onClick={() => setStep((s) => s - 1)} aria-label={t('back')}>
            ←
          </button>
          <Progress value={step} max={steps.length - 1} />
        </div>
      )}
      <AnimatePresence mode="wait">
        <motion.div key={id} initial={{ x: 40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -40, opacity: 0 }} transition={{ duration: 0.22 }} className="flex flex-1 flex-col">
          {id === 'lang' && (
            <div className="space-y-3">
              <Header mood="happy" title={t('ob_lang')} />
              {LANGS.map((l) => (
                <Option key={l.code} selected={lang === l.code} onClick={() => updateSettings.mutate({ uiLanguage: l.code })}>
                  <LangFlag code={l.code} size={30} />
                  {l.name}
                </Option>
              ))}
            </div>
          )}

          {id === 'level' && (
            <div className="space-y-3">
              <Header mood="think" title={t('ob_level')} />
              {LEVELS.map((lv) => (
                <Option key={lv} selected={level === lv} onClick={() => setLevel(lv)}>
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-base font-black" style={{ background: LEVEL_COLORS[lv], color: inkOn(LEVEL_COLORS[lv]) }}>
                    {lv}
                  </span>
                  <span className="flex-1">
                    <span className="block">{t(`ob_level_${lv}` as TKey)}</span>
                    <span className="muted block text-sm font-semibold">{t(`ob_level_${lv}d` as TKey)}</span>
                  </span>
                  {level === lv && <span className="grid h-7 w-7 place-items-center rounded-full bg-brand text-sm text-white">✓</span>}
                </Option>
              ))}
            </div>
          )}

          {id === 'placement' && (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
              <Beaver mood="think" size={150} />
              <h2 className="text-2xl font-black">{t('ob_placement_q')}</h2>
              <p className="muted font-semibold">{t('ob_placement_text')}</p>
              <div className="w-full space-y-3">
                <Option selected={placement} onClick={() => setPlacement(true)}>{t('ob_placement_yes')}</Option>
                <Option selected={!placement} onClick={() => setPlacement(false)}><PictoTile spec={['mermaid', 'symbol']} size={26} className="mr-1.5 align-middle" />{t('ob_placement_no')}</Option>
              </div>
            </div>
          )}

          {id === 'goal' && (
            <div>
              <Header mood="happy" title={t('ob_goal')} />
              <div className="grid grid-cols-2 gap-3">
                {GOALS.map((g) => (
                  <Option key={g} selected={goal === g} onClick={() => setGoal(g)}>
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-white" style={{ background: GOAL_ICONS[g][1] }}><Icon name={GOAL_ICONS[g][0]} size={22} /></span>
                    <span className="text-[15px] leading-tight">{t(`goal_${g}` as TKey)}</span>
                  </Option>
                ))}
              </div>
            </div>
          )}

          {id === 'time' && (
            <div className="space-y-3">
              <Header mood="happy" title={t('ob_time')} />
              {TIMES.map((m) => (
                <Option key={m} selected={time === m} onClick={() => setTime(m)}>
                  <span className="w-16 font-black text-brand-dark">{t('ob_min', { n: m })}</span>
                  <span className="flex-1">{t(`ob_time_${m}` as TKey)}</span>
                </Option>
              ))}
            </div>
          )}

          {id === 'reminder' && (
            <div className="space-y-3">
              <Header mood="sleep" title={t('ob_reminder')} />
              <p className="muted -mt-2 mb-2 text-center font-semibold">{t('ob_reminder_text')}</p>
              <div className="grid grid-cols-2 gap-3">
                {HOURS.map((h) => (
                  <Option key={h} selected={hour === h} onClick={() => setHour(h)}>
                    {String(h).padStart(2, '0')}:00
                  </Option>
                ))}
              </div>
              <Option selected={hour === null} onClick={() => setHour(null)}><PictoTile spec={['bell-off', 'thing']} size={26} className="mr-1.5 align-middle" />{t('ob_reminder_no')}</Option>
            </div>
          )}

          {id === 'map' && (
            <div className="flex flex-1 flex-col items-center text-center">
              <h2 className="text-2xl font-black">{t('ob_map_title')}</h2>
              <p className="muted mt-1 font-semibold">{t('ob_map_text')}</p>
              <div className="mt-4 w-full overflow-hidden rounded-3xl">
                {journey.data && <PolandMap cities={journey.data.cities} currentCityId={journey.data.currentCityId} compact />}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Кнопка завжди на екрані: прилипає до низу видимої області (над нижнім відступом Telegram), навіть коли крок довший за екран. */}
      <div className="safe-bottom sticky bottom-0 z-10 -mx-5 bg-gradient-to-t from-[var(--bg)] via-[var(--bg)] to-transparent px-5 pt-5" data-onboarding-action>
        {id === 'map' ? (
          <button className="btn btn-red w-full text-lg" disabled={busy} onClick={finish}>
            {placement ? t('ob_placement_yes') : t('ob_first_lesson')}
          </button>
        ) : (
          <button className={cx('btn w-full text-lg', step === 0 ? 'btn-red' : 'btn-primary')} onClick={() => { haptic.tap(); nextStep(); }}>
            {step === 0 ? `${t('start')} →` : t('continue')}
          </button>
        )}
      </div>
    </div>
  );
}

function Header({ title, mood }: { title: string; mood: 'happy' | 'think' | 'sleep' }) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <Beaver mood={mood} size={84} />
      <h2 className="flex-1 text-2xl font-black leading-tight">{title}</h2>
    </div>
  );
}

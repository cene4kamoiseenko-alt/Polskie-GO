import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import type { Cefr, UiLang } from '@polski-go/shared';
import { useT, type TKey } from '../i18n';
import { api } from '../lib/api';
import { haptic } from '../lib/telegram';
import { useJourney, useUpdateSettings } from '../lib/queries';
import type { Me } from '../lib/types';
import { Beaver } from '../components/Beaver';
import { Progress, cx } from '../components/ui';
import { PolandMap } from '../components/PolandMap';
import { Logo, Skyline } from '../components/Scenery';

const LANGS: { code: UiLang; flag: string; name: string }[] = [
  { code: 'uk', flag: '🇺🇦', name: 'Українська' },
  { code: 'ru', flag: '🌐', name: 'Русский' },
  { code: 'en', flag: '🇬🇧', name: 'English' },
  { code: 'pl', flag: '🇵🇱', name: 'Polski' },
];
const LEVELS: Cefr[] = ['A0', 'A1', 'A2', 'B1', 'B2'];
/** Кольори бейджів рівнів CEFR. */
export const LEVEL_COLORS: Record<string, string> = { A0: '#45C486', A1: '#3A7BD5', A2: '#9B6BFF', B1: '#F2994A', B2: '#E5484D' };
const GOALS = ['life', 'work', 'study', 'exam', 'travel', 'fun'] as const;
const GOAL_ICONS = { life: '🏠', work: '💼', study: '🎓', exam: '📝', travel: '✈️', fun: '😊' };
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
      qc.setQueryData(['me'], me);
      if (placement) {
        const exams = await api<{ exams: { id: string; kind: string }[] }>('/exams');
        const p = exams.exams.find((e) => e.kind === 'PLACEMENT');
        if (p) return nav(`/lesson/${p.id}`, { replace: true });
      }
      const first = journey.data?.nextLesson;
      nav(first ? `/lesson/${first.id}` : '/', { replace: true });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-[100dvh] flex-col px-5 pb-6 pt-4">
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
          {id === 'hello' && (
            <div className="relative -mx-5 -mt-4 flex flex-1 flex-col items-center overflow-hidden pt-8 text-center" style={{ background: 'linear-gradient(180deg, #7CC8F5 0%, #CDEBFF 55%, #FFF9F0 100%)' }}>
              <Skyline className="absolute inset-x-0 bottom-0 w-full" height={260} sky={false} />
              <div className="absolute inset-x-0 bottom-0 h-24" style={{ background: 'linear-gradient(180deg, transparent, var(--bg))' }} />
              <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="relative">
                <Logo size={50} slogan={t('slogan')} />
              </motion.div>
              <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.25, type: 'spring' }} className="relative mt-4 max-w-[270px] rounded-3xl bg-white px-5 py-3 text-left text-[15px] font-bold text-navy shadow-lg">
                {t('ob_bubble')}
                <div className="absolute -bottom-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 bg-white" />
              </motion.div>
              <div className="relative mt-1">
                <Beaver mood="travel" size={210} outfit={{ JACKET: 'hoodie-red', BACKPACK: 'backpack-travel' }} />
              </div>
            </div>
          )}

          {id === 'lang' && (
            <div className="space-y-3">
              <Header mood="happy" title={t('ob_lang')} />
              {LANGS.map((l) => (
                <Option key={l.code} selected={lang === l.code} onClick={() => updateSettings.mutate({ uiLanguage: l.code })}>
                  <span className="text-2xl">{l.flag}</span>
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
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-base font-black text-white" style={{ background: LEVEL_COLORS[lv] }}>
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
              <Beaver mood="think" size={150} outfit={{ GLASSES: 'glasses-round', JACKET: 'hoodie-red' }} />
              <h2 className="text-2xl font-black">{t('ob_placement_q')}</h2>
              <p className="muted font-semibold">{t('ob_placement_text')}</p>
              <div className="w-full space-y-3">
                <Option selected={placement} onClick={() => setPlacement(true)}>📝 {t('ob_placement_yes')}</Option>
                <Option selected={!placement} onClick={() => setPlacement(false)}>🧜‍♀️ {t('ob_placement_no')}</Option>
              </div>
            </div>
          )}

          {id === 'goal' && (
            <div>
              <Header mood="happy" title={t('ob_goal')} />
              <div className="grid grid-cols-2 gap-3">
                {GOALS.map((g) => (
                  <Option key={g} selected={goal === g} onClick={() => setGoal(g)}>
                    <span className="text-2xl">{GOAL_ICONS[g]}</span>
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
                    ⏰ {String(h).padStart(2, '0')}:00
                  </Option>
                ))}
              </div>
              <Option selected={hour === null} onClick={() => setHour(null)}>🔕 {t('ob_reminder_no')}</Option>
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

      <div className="pt-5">
        {id === 'map' ? (
          <button className="btn btn-red w-full text-lg" disabled={busy} onClick={finish}>
            {placement ? `📝 ${t('ob_placement_yes')}` : `${t('ob_go')} · ${t('ob_first_lesson')}`}
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
      <Beaver mood={mood} size={84} outfit={{ JACKET: 'hoodie-red' }} />
      <h2 className="flex-1 text-2xl font-black leading-tight">{title}</h2>
    </div>
  );
}

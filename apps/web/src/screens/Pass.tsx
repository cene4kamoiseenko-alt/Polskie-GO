/**
 * Пропуск місяця: поточна сезонна локація з власними місіями, нагорода сезону, календар і архів (ADR-011).
 * Дані — GET /missions → pass (той самий запит, що на головній й на екрані місій). Доступ перевіряє сервер:
 * тут лише показуємо замок (потрібен Premium) і ведемо на екран Premium.
 */
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useT } from '../i18n';
import { haptic } from '../lib/telegram';
import { useMe } from '../lib/queries';
import type { PassSeason } from '../lib/types';
import { ErrorState, Progress, ScreenHeader, ScreenSkeleton, cx } from '../components/ui';
import { Icon } from '../components/Icon';
import { Art } from '../components/GameArt';
import { Badge, Scene } from '../components/Illustrations';
import { MissionCard, missionHref, missionsQuery } from '../components/MissionCard';

const BADGE_FOR: Record<string, string> = { 'listopad-poznan': 'season-rogal', swieta: 'season-gift', energylandia: 'season-ticket' };
const LOCALE = { uk: 'uk-UA', ru: 'ru-RU', en: 'en-GB' } as const;
/** «1 листопада» — без року: межі сезону поруч, рік видно з календаря. */
const dayMonth = (day: string, lang: keyof typeof LOCALE) => new Date(`${day}T12:00:00`).toLocaleDateString(LOCALE[lang], { day: 'numeric', month: 'long' });

export default function PassScreen() {
  const { t } = useT();
  const nav = useNavigate();
  const me = useMe().data!;
  const q = useQuery(missionsQuery);
  if (q.isLoading) return <ScreenSkeleton />;
  if (q.error) return <ErrorState error={q.error} onRetry={() => q.refetch()} />;
  const pass = q.data!.pass;
  const premium = pass.premium || me.premium.active;
  return (
    <div className="space-y-5 pb-8">
      <ScreenHeader title={t('pass_title')} subtitle={t('pass_subtitle')} />

      {pass.current ? (
        <SeasonBlock season={pass.current} premium={premium} />
      ) : (
        <p className="muted mx-4 rounded-2xl bg-muted p-3 text-sm font-bold" data-pass="none">{t('pass_none')}</p>
      )}

      {!premium && (
        <button onClick={() => { haptic.tap(); nav('/premium'); }} className="card mx-4 flex w-[calc(100%-2rem)] items-center gap-3 p-3.5 text-left ring-2 ring-xp" data-pass-unlock>
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-xp/25"><Art name="crown" size={28} /></span>
          <span className="min-w-0 flex-1">
            <span className="block font-black">{t('pass_unlock')}</span>
            <span className="muted block text-[13px] font-bold leading-snug">{t('pass_unlock_d')}</span>
          </span>
          <Icon name="chevron-right" size={20} className="shrink-0 opacity-60" />
        </button>
      )}

      {pass.upcoming.length > 0 && (
        <section className="px-4">
          <h2 className="mb-2 text-lg font-black">{t('pass_calendar')}</h2>
          <div className="grid gap-2">
            {pass.upcoming.map((s) => <UpcomingRow key={s.slug} season={s} />)}
          </div>
        </section>
      )}

      {pass.archive.length > 0 && (
        <section className="space-y-3">
          <div className="px-4">
            <h2 className="text-lg font-black">{t('pass_archive')}</h2>
            {!premium && <p className="muted text-[13px] font-bold">{t('pass_archive_d')}</p>}
          </div>
          {pass.archive.map((s) => <SeasonBlock key={s.slug} season={s} premium={premium} compact />)}
        </section>
      )}
    </div>
  );
}

/** Сезон: обкладинка з датами й прогресом, нагорода й місії. */
function SeasonBlock({ season, premium, compact }: { season: PassSeason; premium: boolean; compact?: boolean }) {
  const { t, tr, lang } = useT();
  const nav = useNavigate();
  return (
    <div className="space-y-3 px-4" data-season={season.slug} data-season-state={season.state}>
      <div className="pass-card relative overflow-hidden" style={{ ['--pass' as string]: season.color }}>
        <Scene name={season.scene} className={cx('block w-full opacity-90', compact ? 'h-24' : 'h-36')} evening={season.slug === 'swieta'} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#13234a] via-[#13234a]/40 to-transparent" />
        {season.state === 'active' && <span className="absolute right-3 top-3 rounded-full bg-black/55 px-2.5 py-1 text-[12px] font-black text-white">{t('pass_days_left', { n: season.daysLeft ?? 0 })}</span>}
        <div className="absolute inset-x-3 bottom-3">
          <div className="flex items-center gap-1 text-[12px] font-black text-xp">
            <Art name="crown" size={16} /> {t('pass_dates', { from: dayMonth(season.start, lang), to: dayMonth(season.end, lang) })}
          </div>
          <div className="text-[22px] font-black leading-tight text-white">{tr(season.title)}</div>
          {!compact && <div className="text-[12.5px] font-bold leading-snug text-mist">{tr(season.tagline)}</div>}
        </div>
      </div>

      <div className="card flex items-center gap-3 p-3">
        <Badge icon={BADGE_FOR[season.slug] ?? 'paws'} unlocked={season.reward.done} size={52} tier="legendary" />
        <div className="min-w-0 flex-1">
          <div className="text-sm font-black">{season.reward.done ? t('pass_reward_done') : t('pass_reward', { n: season.reward.zlotki })}</div>
          <div className="mt-1 flex items-center gap-2">
            <Progress value={season.done} max={season.total} height={8} color="linear-gradient(90deg,#FFC857,#FFE08A)" />
            <span className="muted shrink-0 text-xs font-black">{t('pass_progress', { n: season.done, total: season.total })}</span>
          </div>
        </div>
      </div>

      <div className="grid gap-3">
        {season.missions.map((m) => (
          <div key={m.slug} className="relative" data-pass-mission={m.slug} data-open={m.open ? '1' : '0'}>
            <MissionCard m={m} compact={compact} onOpen={() => nav(m.open ? missionHref(m) : '/premium')} />
            {m.free && season.state === 'active' && !premium && (
              <span className="absolute left-3 top-3 rounded-full bg-brand px-2.5 py-0.5 text-xs font-black text-night">{t('pass_free')}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Майбутній сезон у календарі: назва, дати й скільки днів до початку (місії ще не відкриті). */
function UpcomingRow({ season }: { season: PassSeason }) {
  const { t, tr, date } = useT();
  return (
    <div className="card flex items-center gap-3 overflow-hidden p-0" data-season={season.slug} data-season-state="upcoming">
      <Scene name={season.scene} className="h-[76px] w-[96px] shrink-0" dim />
      <div className="min-w-0 flex-1 py-2 pr-3">
        <div className="text-[15px] font-black leading-tight">{tr(season.title)}</div>
        <div className="muted text-[12px] font-bold leading-snug">{tr(season.tagline)}</div>
        <div className="mt-0.5 text-[12px] font-black text-sky">
          {t('pass_starts', { date: date(`${season.start}T12:00:00`) })}
          {season.startsIn !== null && season.startsIn <= 60 && ` · ${season.startsIn === 1 ? t('pass_tomorrow') : t('pass_in_days', { n: season.startsIn })}`}
        </div>
      </div>
      <Icon name="lock" size={18} className="mr-3 shrink-0 opacity-50" />
    </div>
  );
}

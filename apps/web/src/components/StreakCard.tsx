import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useT } from '../i18n';
import { api } from '../lib/api';
import { useMe } from '../lib/queries';
import { Art } from './GameArt';
import { Icon } from './Icon';
import { Progress } from './ui';

type Activity = { days: { day: string; xp: number; lessons: number; exercises: number }[] };
const MILESTONES = [3, 7, 14, 30, 60, 100];

/** Presentation only: streak and daily activity remain authoritative on the server. */
export function StreakCard() {
  const { t, lang } = useT();
  const me = useMe().data;
  const nav = useNavigate();
  const activity = useQuery({
    queryKey: ['stats', 7],
    queryFn: () => api<Activity>('/me/stats?days=7'),
    staleTime: 30_000,
  });
  if (!me) return null;
  const { streak, streakBest, activeToday } = me.progress;
  const next = MILESTONES.find((n) => n > streak) ?? (Math.floor(streak / 100) + 1) * 100;
  const locale = { ru: 'ru-RU', uk: 'uk-UA', en: 'en-GB' }[lang];
  return (
    <section className="streak-card mx-4" data-streak-card data-state={activeToday ? 'active' : streak > 0 ? 'pending' : 'new'} aria-label={t('streak_title')}>
      <div className="streak-card-top">
        <div className="streak-flame" aria-hidden="true"><Art name="flame" size={104} /></div>
        <div className="min-w-0 flex-1">
          <p className="streak-eyebrow">{t('streak_title')}</p>
          <div className="streak-count"><strong>{streak}</strong><span>{t('days_short')}</span></div>
          <p className="streak-caption">{t(activeToday ? 'streak_done' : streak > 0 ? 'streak_keep' : 'streak_start')}</p>
        </div>
        <span className="streak-record"><Art name="trophy" size={22} /><span>{t('streak_record')}<b>{streakBest}</b></span></span>
      </div>

      <div className="streak-week-heading"><span>{t('streak_last_seven')}</span><span className="streak-today-status">{activeToday && <Icon name="check" size={13} />}{t(activeToday ? 'streak_today_done' : 'streak_today_wait')}</span></div>
      {activity.data ? (
        <ol className="streak-week" aria-label={t('streak_last_seven')}>
          {activity.data.days.map((day, index) => {
            const today = index === activity.data.days.length - 1;
            const done = today ? activeToday : day.xp > 0 || day.lessons > 0 || day.exercises > 0;
            // Calendar keys already use the player's timezone. Noon UTC avoids shifting the date in the browser.
            const date = new Date(`${day.day}T12:00:00Z`);
            const weekday = date.toLocaleDateString(locale, { weekday: 'short', timeZone: 'UTC' });
            const fullDate = date.toLocaleDateString(locale, { day: 'numeric', month: 'long', timeZone: 'UTC' });
            return <li key={day.day} data-active={done} data-today={today} aria-current={today ? 'date' : undefined} aria-label={`${fullDate}: ${t(done ? 'streak_day_done' : 'streak_day_empty')}`}>
              <span className="streak-day-icon">{done ? <Art name="flame" size={34} /> : <span className="streak-day-number">{date.getUTCDate()}</span>}</span>
              <span>{weekday}</span>
              {today && <span className="streak-today-dot" aria-hidden="true" />}
            </li>;
          })}
        </ol>
      ) : activity.isError ? (
        <button type="button" className="streak-retry" onClick={() => void activity.refetch()}>{t('streak_retry')}</button>
      ) : <div className="streak-week-loading" role="status" aria-label={t('loading')} />}

      <div className="streak-next"><span>{t('streak_next', { n: next })}</span><b>{streak}/{next}</b></div>
      <Progress value={streak} max={next} height={5} color="linear-gradient(90deg,#ef702d,#ffd27a)" />
      <div className="streak-footer">
        <span>{t('streak_no_rush')}</span>
        {!activeToday && <button type="button" onClick={() => nav('/learn')}>{t('streak_learn')}<Icon name="arrow-right" size={15} /></button>}
      </div>
      {me.premium.active && me.premium.shield && <p className="streak-shield"><Icon name="crown" size={14} />{t(me.premium.shield.ready ? 'prem_shield_ready' : 'prem_shield_used', { date: me.premium.shield.usedOn ? new Date(`${me.premium.shield.usedOn}T12:00:00Z`).toLocaleDateString(locale, { timeZone: 'UTC' }) : '', ready: me.premium.shield.readyOn ? new Date(`${me.premium.shield.readyOn}T12:00:00Z`).toLocaleDateString(locale, { timeZone: 'UTC' }) : '' })}</p>}
    </section>
  );
}

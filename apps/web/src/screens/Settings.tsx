import { useEffect, useState } from 'react';
import { Icon } from '../components/Icon';
import type { UiLang } from '@polski-go/shared';
import { useNavigate } from 'react-router-dom';
import { useT, type TKey } from '../i18n';
import { api, downloadExport } from '../lib/api';
import { tg } from '../lib/telegram';
import { useMe, useUpdateSettings } from '../lib/queries';
import { useQueryClient } from '@tanstack/react-query';
import type { Me } from '../lib/types';
import { Card, Modal, ScreenHeader, Toggle, cx, useToast } from '../components/ui';
import { devicePolishVoice, speak, type SpeechOutcome } from '../lib/audio';
import { PronHint } from '../components/PronHint';

/**
 * Звідки береться польська озвучка на цьому пристрої + перевірка справжнім відтворенням:
 * показуємо джерело, з якого звук реально почав грати, або причину, чому не почав.
 * Чи почула людина звук (гучність, беззвучний режим), застосунок знати не може — про це підказка.
 */
function AudioDiagnostics({ server, provider }: { server: boolean; provider: string | null }) {
  const { t } = useT();
  const [voice, setVoice] = useState<string | null | undefined>(undefined);
  const [check, setCheck] = useState<SpeechOutcome | 'running' | null>(null);
  useEffect(() => {
    void devicePolishVoice().then((v) => setVoice(v ? `${v.name} (${v.lang})` : null));
  }, []);
  const label = server ? `${t('audio_source_server')}: ${provider ?? ''}` : voice ? t('audio_source_device', { name: voice }) : voice === null ? t('audio_source_none') : '…';
  const run = async () => {
    setCheck('running');
    setCheck(await speak('Dzień dobry! Dziękuję, do widzenia.'));
  };
  const result = check && check !== 'running' ? check : null;
  return (
    <div className="py-2">
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <div className="font-bold">{t('audio_source')}</div>
          <div className={cx('text-xs font-semibold', !server && voice === null ? 'text-coral-dark' : 'muted')}>{label}</div>
        </div>
        <button className="chip shrink-0 px-3 py-2" disabled={check === 'running'} aria-busy={check === 'running'} onClick={() => void run()}>
          {t('audio_check')}
        </button>
      </div>
      {result && (
        <p role="status" className={cx('mt-2 text-xs font-bold', result.played ? 'muted' : 'text-coral-dark')}>
          {result.played
            ? t('audio_check_ok', { source: t(`audio_src_${result.source}` as TKey) }) + (result.issue === 'unverified_voice' ? ` ${t('audio_check_unverified')}` : '')
            : t(result.issue === 'no_polish_voice' ? 'ex_audio_missing' : result.issue === 'blocked' ? 'audio_blocked' : 'audio_error')}
        </p>
      )}
    </div>
  );
}

/** Підказка вимови: приблизно кирилицею (лише ru/uk), IPA або без підказки; приклад — на живій фразі. */
function PronSetting({ value, onChange }: { value: 'simple' | 'ipa' | 'off'; onChange: (v: 'simple' | 'ipa' | 'off') => void }) {
  const { t, lang } = useT();
  const cyr = lang === 'ru' || lang === 'uk';
  const options: ['simple' | 'ipa' | 'off', string][] = [...(cyr ? [['simple', t('pron_simple')] as ['simple', string]] : []), ['ipa', 'IPA'], ['off', t('pron_off')]];
  return (
    <div className="space-y-2 py-2" data-setting="pron">
      <div className="font-bold">{t('set_pron')}</div>
      <Seg value={!cyr && value === 'simple' ? 'ipa' : value} options={options} onChange={onChange} />
      <div className="text-sm font-bold">
        <span lang="pl">Dzień dobry</span> <PronHint text="Dzień dobry" inline className="text-sky-dark" />
      </div>
      <p className="muted text-xs font-semibold">{t('set_pron_note')}</p>
    </div>
  );
}

const LANGS: [UiLang, string][] = [['uk', 'Українська'], ['ru', 'Русский'], ['en', 'English'], ['pl', 'Polski']];

function Seg<T extends string | number>({ value, options, onChange }: { value: T; options: [T, string][]; onChange: (v: T) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(([v, label]) => (
        <button key={String(v)} onClick={() => onChange(v)} className={cx('chip px-3 py-2', value === v && 'bg-brand text-white')}>
          {label}
        </button>
      ))}
    </div>
  );
}

export default function SettingsScreen() {
  const { t } = useT();
  const nav = useNavigate();
  const qc = useQueryClient();
  const toast = useToast();
  const me = useMe().data!;
  const upd = useUpdateSettings();
  const s = me.settings;
  const [del, setDel] = useState(false);
  const [beaverName, setBeaverName] = useState(me.profile.beaverName);
  const [displayName, setDisplayName] = useState(me.profile.displayName ?? '');
  const set = (patch: Partial<Me['settings']>) => upd.mutate(patch);

  const saveProfile = async () => {
    const r = await api<Me>('/me/profile', { method: 'PATCH', body: { beaverName: beaverName || 'Bobek', displayName: displayName || null } });
    qc.setQueryData(['me'], r);
    toast(t('toast_saved'), '✅');
  };

  return (
    <div className="space-y-4 px-4 pb-10">
      <ScreenHeader title={t('set_title')} />
      <Card className="space-y-3 p-4">
        <div className="font-black">{t('set_language')}</div>
        <Seg value={s.uiLanguage} options={LANGS} onChange={(v) => set({ uiLanguage: v })} />
        <div className="pt-2 font-black">{t('set_theme')}</div>
        <Seg value={s.theme} options={[['auto', t('theme_auto')], ['light', t('theme_light')], ['dark', t('theme_dark')]]} onChange={(v) => set({ theme: v })} />
        <div className="pt-2 font-black">{t('set_goal')}</div>
        <Seg value={s.dailyGoalMinutes} options={[[5, '5 min'], [10, '10 min'], [15, '15 min'], [20, '20 min']]} onChange={(v) => set({ dailyGoalMinutes: v })} />
      </Card>
      <Card className="space-y-2 p-4">
        <label className="block text-sm font-black">{t('set_display_name')}</label>
        <input value={displayName} maxLength={32} onChange={(e) => setDisplayName(e.target.value)} className="w-full rounded-xl border-2 border-soft bg-[var(--bg)] px-3 py-2 font-bold outline-none" />
        <label className="block text-sm font-black">{t('set_beaver_name')}</label>
        <input value={beaverName} maxLength={20} onChange={(e) => setBeaverName(e.target.value)} className="w-full rounded-xl border-2 border-soft bg-[var(--bg)] px-3 py-2 font-bold outline-none" />
        <button className="btn btn-primary mt-2 w-full" onClick={saveProfile}>{t('save')}</button>
      </Card>
      <Card className="divide-y divide-[var(--border)] px-4">
        <Toggle icon="clock" label={t('set_notifications')} checked={s.notificationsEnabled} onChange={(v) => set({ notificationsEnabled: v, reminderHour: s.reminderHour ?? 19 })} />
        {s.notificationsEnabled && (
          <div className="py-3">
            <div className="mb-2 text-sm font-black">{t('set_reminder_hour')}</div>
            <Seg value={s.reminderHour ?? 19} options={[8, 12, 18, 19, 20, 21].map((h) => [h, `${h}:00`] as [number, string])} onChange={(v) => set({ reminderHour: v })} />
          </div>
        )}
        <Toggle icon="headphones" label={t('set_sound')} checked={s.soundEnabled} onChange={(v) => set({ soundEnabled: v })} />
        <PronSetting value={s.pronHint ?? 'simple'} onChange={(v) => set({ pronHint: v })} />
        <AudioDiagnostics server={!!me.audio?.server} provider={me.audio?.provider ? `${me.audio.provider} · ${me.audio.voice}` : null} />
        <Toggle icon="layers" label={t('set_motion')} checked={s.reducedMotion} onChange={(v) => set({ reducedMotion: v })} />
      </Card>
      <Card className="divide-y divide-[var(--border)] px-4">
        <div className="pt-3 font-black">{t('set_privacy')}</div>
        <Toggle label={t('set_public_profile')} description={t('set_public_profile_d')} checked={s.publicProfile} onChange={(v) => set({ publicProfile: v })} />
        <Toggle label={t('set_leaderboard')} checked={s.showInLeaderboard} onChange={(v) => set({ showInLeaderboard: v })} />
      </Card>
      <Card className="space-y-2 p-4">
        <div className="font-black">{t('set_data')}</div>
        <button className="btn btn-ghost w-full" onClick={() => nav('/premium')}><Icon name="crown" size={20} className="text-xp-dark" /> {t('set_premium')}</button>
        <button className="btn btn-ghost w-full" onClick={() => downloadExport()}><Icon name="arrow-right" size={20} className="rotate-90" /> {t('set_export')}</button>
        <button className="w-full py-2 font-black text-coral" onClick={() => setDel(true)}>{t('set_delete')}</button>
      </Card>
      <p className="muted text-center text-xs font-bold">POLSKI GO · {t('set_version', { v: '0.1.0' })}</p>
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

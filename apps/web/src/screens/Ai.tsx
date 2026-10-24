import { motion } from 'framer-motion';
import { Icon } from '../components/Icon';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useT, type TKey } from '../i18n';
import { api, ApiError } from '../lib/api';
import { useMe } from '../lib/queries';
import { recognizePolish, speak, speechRecognitionAvailable } from '../lib/audio';
import { Beaver } from '../components/Beaver';
import { GameIcon, type IconName } from '../components/GameIcon';
import { SceneAvatar, SCENE_LOOKS, type SceneKey } from '../components/SceneAvatar';
import { RichText, ScreenHeader, Section, cx } from '../components/ui';

type Msg = { role: 'user' | 'assistant'; content: string };
type Conversation = { id: string; mode: string; title: string; updatedAt: string; messages: Msg[] };
type Mode = 'chat' | 'check' | 'explain' | 'roleplay' | 'exam';
const PREMIUM_MODES = new Set<Mode>(['roleplay', 'exam']);
const MODES: { mode: Exclude<Mode, 'roleplay'>; icon: IconName }[] = [
  { mode: 'chat', icon: 'ai' },
  { mode: 'check', icon: 'grammar' },
  { mode: 'explain', icon: 'dictionary' },
  { mode: 'exam', icon: 'exam' },
];
const SCENES: SceneKey[] = ['cafe', 'shop', 'interview', 'doctor', 'airport', 'landlord', 'meeting', 'work', 'urzad', 'train'];

/** Стартові фрази польською для кожної сцени (вставляються в поле вводу). */
const HINTS: Record<SceneKey | 'chat' | 'check' | 'explain' | 'exam', string[]> = {
  chat: ['Cześć! Jak się masz?', 'Opowiedz mi o Polsce.', 'Jak powiedzieć „дякую” po polsku?'],
  check: ['Ja jestem z Ukraina i mieszkam w Polska.', 'Wczoraj ja byłem w sklep.'],
  explain: ['Czym różni się „być” od „mieć”?', 'Kiedy używamy biernika?'],
  exam: ['Chcę przygotować się do egzaminu B1.', 'Daj mi zadanie z czytania.'],
  cafe: ['Poproszę kawę z mlekiem.', 'Ile kosztuje sernik?', 'Czy mogę zapłacić kartą?'],
  shop: ['Gdzie jest chleb?', 'Poproszę kilogram jabłek.', 'Czy jest reklamówka?'],
  interview: ['Dzień dobry, nazywam się…', 'Mam doświadczenie w logistyce.', 'Jakie są godziny pracy?'],
  doctor: ['Boli mnie głowa.', 'Mam gorączkę od wczoraj.', 'Czy potrzebuję recepty?'],
  airport: ['Chciałbym się odprawić.', 'Ile może ważyć bagaż?', 'Gdzie jest wyjście numer 5?'],
  landlord: ['Ile wynosi czynsz?', 'Czy media są wliczone?', 'Kiedy mogę się wprowadzić?'],
  meeting: ['Cześć, jestem Olena. A ty?', 'Skąd jesteś?', 'Czym się zajmujesz?'],
  work: ['Jakie mam zadania na dziś?', 'O której jest spotkanie?', 'Czy mogę wziąć urlop w piątek?'],
  urzad: ['Chcę złożyć wniosek o kartę pobytu.', 'Jakie dokumenty są potrzebne?'],
  train: ['Poproszę bilet do Gdańska.', 'O której odjeżdża pociąg?', 'Z którego peronu?'],
};

export default function AiScreen() {
  const { t, date } = useT();
  const nav = useNavigate();
  const qc = useQueryClient();
  const me = useMe().data!;
  const info = useQuery({ queryKey: ['ai'], queryFn: () => api<{ configured: boolean; conversations: Conversation[] }>('/ai/conversations') });
  const [mode, setMode] = useState<Mode>('chat');
  const [scene, setScene] = useState<SceneKey>('cafe');
  const [chatOpen, setChatOpen] = useState(false);
  const [convId, setConvId] = useState<string | undefined>();
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [listening, setListening] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const voice = speechRecognitionAvailable();
  useEffect(() => {
    if (chatOpen) endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs, busy, chatOpen]);

  const open = (m: Mode, s?: SceneKey) => {
    if (PREMIUM_MODES.has(m) && !me.premium.active) return nav('/premium');
    setMode(m);
    if (s) setScene(s);
    setConvId(undefined);
    setMsgs([]);
    setError(null);
    setChatOpen(true);
  };

  const resume = (c: Conversation) => {
    const [m, s] = c.mode.split(':') as [Mode, SceneKey | undefined];
    if (PREMIUM_MODES.has(m) && !me.premium.active) return nav('/premium');
    setMode(m);
    if (s && SCENES.includes(s)) setScene(s);
    setConvId(c.id);
    setMsgs((c.messages ?? []).map(({ role, content }) => ({ role, content })));
    setError(null);
    setChatOpen(true);
  };

  const close = () => {
    setChatOpen(false);
    qc.invalidateQueries({ queryKey: ['ai'] });
  };

  const send = async () => {
    const body = text.trim();
    if (!body || busy) return;
    setText('');
    setError(null);
    setMsgs((m) => [...m, { role: 'user', content: body }]);
    setBusy(true);
    try {
      const r = await api<{ conversationId: string; reply: string }>('/ai/message', { body: { conversationId: convId, mode, scene: mode === 'roleplay' ? scene : undefined, text: body } });
      setConvId(r.conversationId);
      setMsgs((m) => [...m, { role: 'assistant', content: r.reply }]);
      qc.invalidateQueries({ queryKey: ['me'] });
    } catch (e) {
      setError(e instanceof ApiError && e.code === 'ai_limit_reached' ? t('ai_limit_reached') : (e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const status = info.data && (
    <div className={cx('flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-black', info.data.configured ? 'bg-brand/15 text-brand-dark' : 'bg-xp/25 text-xp-dark')}>
      <span className={cx('h-2 w-2 rounded-full', info.data.configured ? 'bg-brand' : 'bg-xp-dark')} />
      {info.data.configured ? t('ai_status_on') : t('ai_status_off')}
    </div>
  );

  // ── Головний екран AI: режими, сцени, історія ──
  if (!chatOpen) {
    const history = info.data?.conversations ?? [];
    return (
      <div className="space-y-5 pb-8">
        <ScreenHeader title={t('ai_title')} subtitle={t('ai_subtitle')} right={<GameIcon name="ai" size={40} />} />
        <div className="relative mx-4 overflow-hidden rounded-[28px] p-4 shadow-[var(--shadow-card)]" style={{ background: 'linear-gradient(160deg, #DFF3FF 0%, #EDE4FF 100%)' }}>
          <div className="flex items-end gap-3">
            <Beaver mood="learn" size={110} outfit={me.outfit.wear} />
            <div className="min-w-0 flex-1 space-y-2 pb-2">
              <div className="rounded-2xl rounded-bl-md bg-white px-3 py-2 text-sm font-bold shadow-sm">{t('ai_welcome')}</div>
              {status}
              <div className="text-[11px] font-black text-ink/70">{t('ai_limit', { used: me.ai.used, limit: me.ai.limit })}</div>
            </div>
          </div>
        </div>

        <Section title={t('ai_modes')}>
          <div className="grid grid-cols-2 gap-2.5">
            {MODES.map((m) => (
              <motion.button key={m.mode} whileTap={{ scale: 0.96 }} onClick={() => open(m.mode)} className="card relative flex items-center gap-2.5 p-3 text-left">
                <GameIcon name={m.icon} size={42} />
                <span className="text-sm font-black leading-tight">{t(`ai_mode_${m.mode}` as TKey)}</span>
                {PREMIUM_MODES.has(m.mode) && !me.premium.active && <span className="absolute right-1.5 top-1.5"><GameIcon name="premium" size={20} /></span>}
              </motion.button>
            ))}
          </div>
        </Section>

        <Section title={t('ai_scenes')} action={!me.premium.active ? <GameIcon name="premium" size={24} /> : undefined}>
          <div className="grid grid-cols-2 gap-2.5">
            {SCENES.map((s) => (
              <motion.button
                key={s}
                whileTap={{ scale: 0.96 }}
                onClick={() => open('roleplay', s)}
                className="card relative flex flex-col items-center gap-1.5 overflow-hidden px-2 pb-3 pt-4 text-center"
              >
                <span className="absolute inset-x-0 top-0 h-12" style={{ background: `linear-gradient(180deg, ${SCENE_LOOKS[s].bg}33, transparent)` }} />
                <SceneAvatar scene={s} size={64} />
                <span className="relative text-sm font-black leading-tight">{t(`ai_scene_${s}` as TKey)}</span>
                {!me.premium.active && <span className="absolute right-1.5 top-1.5"><GameIcon name="lock" size={22} /></span>}
              </motion.button>
            ))}
          </div>
        </Section>

        <Section title={t('ai_history')}>
          <div className="space-y-2">
            {history.length === 0 && <div className="muted rounded-2xl bg-muted p-3 text-center text-sm font-bold">{t('ai_history_empty')}</div>}
            {history.slice(0, 8).map((c) => {
              const [m, s] = c.mode.split(':') as [Mode, SceneKey | undefined];
              return (
                <button key={c.id} onClick={() => resume(c)} className="card flex w-full items-center gap-3 p-2.5 text-left">
                  {s && SCENES.includes(s) ? <SceneAvatar scene={s} size={42} /> : <GameIcon name={MODES.find((x) => x.mode === m)?.icon ?? 'ai'} size={42} />}
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-black">{c.title}</div>
                    <div className="muted truncate text-xs font-bold">
                      {s ? t(`ai_scene_${s}` as TKey) : t(`ai_mode_${m}` as TKey)} · {date(c.updatedAt)}
                    </div>
                  </div>
                  <span className="muted font-black">›</span>
                </button>
              );
            })}
          </div>
        </Section>
        <p className="muted px-6 text-center text-[11px] font-bold">{voice ? t('ai_voice_on') : t('ai_voice_off')}</p>
      </div>
    );
  }

  // ── Чат ──
  const hints = HINTS[mode === 'roleplay' ? scene : mode];
  const title = mode === 'roleplay' ? t(`ai_scene_${scene}` as TKey) : t(`ai_mode_${mode}` as TKey);
  return (
    <div className="flex h-[100dvh] flex-col">
      <ScreenHeader
        title={title}
        subtitle={t('ai_limit', { used: me.ai.used, limit: me.ai.limit })}
        onBack={close}
        right={
          <button className="chip text-xs" onClick={() => open(mode, scene)}>
            {t('ai_new_chat')}
          </button>
        }
      />
      {info.data && !info.data.configured && <div className="mx-4 mb-2 rounded-xl bg-xp/25 px-3 py-2 text-xs font-bold">{t('ai_offline_note')}</div>}
      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-2">
        <div className="flex items-end gap-2">
          {mode === 'roleplay' ? <SceneAvatar scene={scene} size={48} /> : <Beaver size={56} mood="wave" outfit={me.outfit.wear} animate={false} />}
          <div className="card rounded-bl-md px-4 py-3 font-semibold">{t('ai_welcome')}</div>
        </div>
        {msgs.map((m, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={cx('flex items-end gap-2', m.role === 'user' ? 'justify-end' : 'justify-start')}>
            {m.role === 'assistant' && (mode === 'roleplay' ? <SceneAvatar scene={scene} size={32} /> : <GameIcon name="ai" size={30} />)}
            <div className={cx('max-w-[82%] rounded-2xl px-4 py-3 text-[15px] font-semibold', m.role === 'user' ? 'rounded-br-md bg-brand text-white' : 'card rounded-bl-md')}>
              {m.role === 'assistant' ? <RichText text={m.content} /> : m.content}
              {m.role === 'assistant' && (
                <button className="mt-1 block text-xs font-black text-sky-dark" onClick={() => speak(m.content.split('✏️')[0])} aria-label="listen">
                  <Icon name="headphones" size={16} />
                </button>
              )}
            </div>
          </motion.div>
        ))}
        {busy && (
          <div className="flex items-center gap-2">
            <Beaver size={44} mood="think" animate={false} />
            <motion.span className="font-black" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.2 }}>
              • • •
            </motion.span>
          </div>
        )}
        {error && <div className="rounded-xl bg-coral/15 p-3 text-sm font-bold text-coral-dark">{error} {!me.premium.active && <button className="underline" onClick={() => nav('/premium')}>Premium</button>}</div>}
        <div ref={endRef} />
      </div>
      <div className="safe-bottom border-t border-soft bg-elev px-3 pt-2">
        {msgs.length < 2 && (
          <div className="no-scrollbar mb-2 flex gap-2 overflow-x-auto" aria-label={t('ai_hints')}>
            {hints.map((h) => (
              <button key={h} lang="pl" onClick={() => setText(h)} className="chip shrink-0 text-xs">
                {h}
              </button>
            ))}
          </div>
        )}
        <div className="flex items-end gap-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                void send();
              }
            }}
            rows={1}
            maxLength={1000}
            lang="pl"
            placeholder={t('ai_placeholder')}
            className="max-h-32 flex-1 resize-none rounded-2xl border-2 border-soft bg-[var(--bg)] px-4 py-3 font-semibold outline-none focus:border-sky"
          />
          {voice && (
            <button
              className={cx('shrink-0 rounded-2xl', listening && 'animate-pulse')}
              aria-label={t('ex_mic_start')}
              disabled={listening}
              onClick={async () => {
                setListening(true);
                try {
                  const heard = await recognizePolish().promise;
                  if (heard) setText((x) => (x ? `${x} ${heard}` : heard));
                } catch {
                  /* мікрофон недоступний */
                } finally {
                  setListening(false);
                }
              }}
            >
              <GameIcon name="mic" size={48} color={listening ? '#F45159' : undefined} />
            </button>
          )}
          <button className="btn btn-primary min-h-[48px] px-4" disabled={!text.trim() || busy} onClick={send} aria-label={t('ai_send')}>
            <Icon name="arrow-right" size={22} strokeWidth={2.6} />
          </button>
        </div>
        <p className="muted pt-1 text-center text-[10px] font-bold">{t('ai_disclaimer')}</p>
      </div>
    </div>
  );
}

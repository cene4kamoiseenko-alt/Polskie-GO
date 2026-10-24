import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useT, type TKey } from '../i18n';
import { api, ApiError } from '../lib/api';
import { useMe } from '../lib/queries';
import { speak } from '../lib/audio';
import { Beaver } from '../components/Beaver';
import { RichText, ScreenHeader, cx } from '../components/ui';

type Msg = { role: 'user' | 'assistant'; content: string };
const MODES = ['chat', 'check', 'explain', 'roleplay', 'exam'] as const;
const PREMIUM_MODES = new Set(['roleplay', 'exam']);
const SCENES = ['cafe', 'doctor', 'urzad', 'interview', 'landlord', 'train'] as const;

export default function AiScreen() {
  const { t } = useT();
  const nav = useNavigate();
  const qc = useQueryClient();
  const me = useMe().data!;
  const info = useQuery({ queryKey: ['ai'], queryFn: () => api<{ configured: boolean }>('/ai/conversations') });
  const [mode, setMode] = useState<(typeof MODES)[number]>('chat');
  const [scene, setScene] = useState<(typeof SCENES)[number]>('cafe');
  const [convId, setConvId] = useState<string | undefined>();
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs, busy]);

  const reset = (m: typeof mode) => {
    if (PREMIUM_MODES.has(m) && !me.premium.active) return nav('/premium');
    setMode(m);
    setConvId(undefined);
    setMsgs([]);
    setError(null);
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

  return (
    <div className="flex h-[100dvh] flex-col">
      <ScreenHeader title={t('ai_title')} subtitle={t('ai_limit', { used: me.ai.used, limit: me.ai.limit })} />
      <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-2">
        {MODES.map((m) => (
          <button key={m} onClick={() => reset(m)} className={cx('chip shrink-0', mode === m && 'bg-pl-red text-white')}>
            {PREMIUM_MODES.has(m) && '👑 '}
            {t(`ai_mode_${m}` as TKey)}
          </button>
        ))}
      </div>
      {mode === 'roleplay' && (
        <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-2">
          {SCENES.map((s) => (
            <button key={s} onClick={() => { setScene(s); setConvId(undefined); setMsgs([]); }} className={cx('chip shrink-0 text-xs', scene === s && 'bg-sky text-white')}>
              {t(`ai_scene_${s}` as TKey)}
            </button>
          ))}
        </div>
      )}
      {info.data && !info.data.configured && <div className="mx-4 mb-2 rounded-xl bg-xp/25 px-3 py-2 text-xs font-bold">ℹ️ {t('ai_offline_note')}</div>}
      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-2">
        <div className="flex items-end gap-2">
          <Beaver size={56} mood="wave" outfit={me.outfit.wear} animate={false} />
          <div className="card rounded-bl-md px-4 py-3 font-semibold">{t('ai_welcome')}</div>
        </div>
        {msgs.map((m, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={cx('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}>
            <div className={cx('max-w-[86%] rounded-2xl px-4 py-3 text-[15px] font-semibold', m.role === 'user' ? 'rounded-br-md bg-brand text-white' : 'card rounded-bl-md')}>
              {m.role === 'assistant' ? <RichText text={m.content} /> : m.content}
              {m.role === 'assistant' && (
                <button className="mt-1 text-xs font-black text-sky-dark" onClick={() => speak(m.content.split('✏️')[0])}>🔊</button>
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
        {error && <div className="rounded-xl bg-coral/15 p-3 text-sm font-bold text-coral-dark">{error} {!me.premium.active && <button className="underline" onClick={() => nav('/premium')}>👑 Premium</button>}</div>}
        <div ref={endRef} />
      </div>
      <div className="safe-bottom border-t border-soft bg-elev px-3 pt-2">
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
          <button className="btn btn-primary min-h-[48px] px-4" disabled={!text.trim() || busy} onClick={send} aria-label={t('ai_send')}>
            ➤
          </button>
        </div>
        <p className="muted pt-1 text-center text-[10px] font-bold">{t('ai_disclaimer')}</p>
      </div>
    </div>
  );
}

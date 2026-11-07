/**
 * Первый запуск вне Telegram (Android-приложение, веб): аккаунт ещё не создан. Два пути — начать как гость (аккаунт на этом устройстве) или войти по коду
 * из Telegram (прогресс и покупки общие). Сервер — /api/auth/guest и /api/auth/link (services/standalone-auth.ts).
 */
import { useState } from 'react';
import { useT } from '../i18n';
import { useStandaloneCopy } from '../lib/standaloneCopy';
import { ApiError, signInAsGuest, signInWithCode } from '../lib/api';
import { pick } from '../lib/assets';
import { haptic } from '../lib/telegram';
import { Logo } from '../components/Scenery';

export default function Welcome({ onDone }: { onDone: () => void }) {
  const { lang } = useT();
  const t = useStandaloneCopy();
  const [mode, setMode] = useState<'start' | 'code'>('start');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const avatar = pick('brand', 'avatar');

  const run = async (job: () => Promise<void>) => {
    setBusy(true);
    setError(null);
    try {
      await job();
      haptic.success();
      onDone();
    } catch (e) {
      const badCode = e instanceof ApiError && (e.code === 'invalid_code' || e.status === 400);
      const status = e instanceof ApiError ? e.status : 0;
      setError(badCode ? t('welcome_code_bad') : status === 429 ? t('welcome_slow') : status === 503 ? t('welcome_busy') : status === 404 ? t('welcome_off') : t('welcome_net'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-[100dvh] max-w-md flex-col items-center justify-center gap-5 px-5 py-8 text-center" data-welcome>
      <Logo size={40} />
      {avatar && <img src={avatar} alt="" width={128} height={128} className="h-32 w-32 rounded-full object-cover shadow-lg" draggable={false} />}
      <div>
        <h1 className="text-2xl font-black leading-tight">{t('welcome_title')}</h1>
        <p className="muted mt-2 text-sm font-semibold leading-snug">{t('welcome_text')}</p>
      </div>

      {mode === 'start' ? (
        <div className="w-full space-y-3">
          <button className="btn btn-xp w-full text-lg" disabled={busy} onClick={() => run(() => signInAsGuest(lang))} data-welcome-guest>
            {t('welcome_guest')}
          </button>
          <button className="btn btn-ghost w-full" disabled={busy} onClick={() => { setError(null); setMode('code'); }} data-welcome-have-code>
            {t('welcome_have_code')}
          </button>
        </div>
      ) : (
        <form
          className="w-full space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (code.trim().length >= 6) void run(() => signInWithCode(code.trim()));
          }}
        >
          <p className="muted text-sm font-semibold leading-snug">{t('welcome_code_hint')}</p>
          <label className="block text-left text-sm font-black" htmlFor="welcome-code">{t('welcome_code_label')}</label>
          <input
            id="welcome-code"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            autoCapitalize="characters"
            autoCorrect="off"
            autoComplete="one-time-code"
            spellCheck={false}
            inputMode="text"
            maxLength={12}
            placeholder="ABCD-EFGH"
            className="w-full rounded-2xl border border-[var(--border)] bg-night/60 px-3 py-3 text-center font-black tracking-widest text-white outline-none placeholder:text-[var(--text-muted)] focus:border-sky"
            data-welcome-code
          />
          <button className="btn btn-xp w-full text-lg" type="submit" disabled={busy || code.trim().length < 6} data-welcome-submit>
            {t('welcome_code_go')}
          </button>
          <button type="button" className="w-full py-2 text-sm font-black" disabled={busy} onClick={() => { setError(null); setMode('start'); }}>
            {t('welcome_back')}
          </button>
        </form>
      )}

      {error && <p role="alert" className="text-sm font-black text-coral" data-welcome-error>{error}</p>}
      <p className="muted text-xs font-bold leading-snug">
        {t('welcome_privacy_note')}{' '}
        <a className="underline" href={`/terms?lang=${lang}`} target="_blank" rel="noopener" data-welcome-terms>{t('welcome_terms')}</a>
        {' · '}
        <a className="underline" href={`/privacy?lang=${lang}`} target="_blank" rel="noopener">{t('welcome_privacy')}</a>
      </p>
    </main>
  );
}

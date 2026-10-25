/**
 * Межа помилок екрана. Без неї будь-який збій рендера або недовантажений чанк лінивого екрана
 * (офлайн, старий index.html після деплою) розмонтовує весь застосунок — лишається порожній екран.
 * Тут: недовантажений модуль → «Перезавантажити» (браузер кешує невдалий імпорт до перезавантаження);
 * інша помилка → «Спробувати ще» (скидання межі). Перехід на інший маршрут теж скидає межу.
 */
import { Component, type ReactNode } from 'react';
import { useT } from '../i18n';
import { Beaver } from './Beaver';

export function isChunkError(e: unknown): boolean {
  const msg = e instanceof Error ? `${e.name} ${e.message}` : String(e);
  return /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module|ChunkLoadError|Unable to preload CSS/i.test(msg);
}

function ScreenError({ chunk, onRetry }: { chunk: boolean; onRetry: () => void }) {
  const { t } = useT();
  return (
    <div role="alert" className="flex flex-col items-center gap-3 px-6 py-12 text-center" data-screen-error={chunk ? 'chunk' : 'render'}>
      <Beaver mood="sad" size={120} />
      <h2 className="text-xl font-black">{t('error_title')}</h2>
      <p className="muted text-sm font-semibold">{t(chunk ? 'error_chunk' : 'error_generic')}</p>
      <button className="btn btn-primary mt-2" onClick={chunk ? () => location.reload() : onRetry}>
        {t(chunk ? 'error_reload' : 'error_retry')}
      </button>
    </div>
  );
}

type Props = { resetKey: string; children: ReactNode };
type State = { error: unknown; key: string };

export class ScreenBoundary extends Component<Props, State> {
  state: State = { error: null, key: this.props.resetKey };

  static getDerivedStateFromError(error: unknown) {
    return { error };
  }

  static getDerivedStateFromProps(props: Props, state: State): Partial<State> | null {
    return props.resetKey !== state.key ? { error: null, key: props.resetKey } : null;
  }

  componentDidCatch(error: unknown) {
    console.error('[screen]', error);
  }

  render() {
    if (this.state.error) return <ScreenError chunk={isChunkError(this.state.error)} onRetry={() => this.setState({ error: null })} />;
    return this.props.children;
  }
}

import { resolveLaunchRoute } from '@polski-go/shared';
import { startParam } from './telegram';

let pending: string | null | undefined;

/**
 * Куда бот просил открыть Mini App (`?bot_screen=` или `startapp=screen_<имя>`, только белый список из shared).
 * Читается один раз при первом обращении, до любых переходов роутера.
 */
export function peekLaunchRoute(): string | null {
  if (pending === undefined) pending = typeof window === 'undefined' ? null : resolveLaunchRoute(window.location.search, startParam());
  return pending;
}

/** Забрать маршрут: переход делается ровно один раз (после входа, а у новичка — после знакомства). */
export function takeLaunchRoute(): string | null {
  const route = peekLaunchRoute();
  pending = null;
  return route;
}

/** Только для тестов. */
export function resetLaunchRoute() {
  pending = undefined;
}

let source: string | null | undefined;

/**
 * Метка `?src=` в адресе Mini App (2026-11-24): какая кнопка бота привела игрока (card_newcomer, card_comeback, card_mission,
 * quiz_warmup…). Читается один раз: отметка «открыл карточку» уходит на сервер ровно один раз за запуск.
 */
export function takeLaunchSource(): string | null {
  if (source === undefined) {
    const v = typeof window === 'undefined' ? null : new URLSearchParams(window.location.search).get('src');
    source = v && /^[a-z_]{3,32}$/.test(v) ? v : null;
    return source;
  }
  return null;
}

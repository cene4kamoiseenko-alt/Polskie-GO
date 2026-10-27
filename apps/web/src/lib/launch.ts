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

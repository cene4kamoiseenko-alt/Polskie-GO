/**
 * Реальний прогрес запуску застосунку для заставки.
 * Етапи відмічаються там, де вони справді завершуються: модуль завантажено → авторизація →
 * профіль користувача → перший екран. Між етапами смуга лише плавно «підповзає»
 * до наступного етапу, але не досягає його, доки етап не завершиться. Штучних відсотків і затримок завантаження немає.
 *
 * Єдина свідома пауза — мінімальний час показу заставки (SPLASH_MIN_MS, рішення власника 2026-11-01: на швидкому з'єднанні заставку не встигали
 * побачити): коли все вже завантажено, а мінімум ще не вичерпано, смуга доходить до 100 % за час, що лишився (bootFinish), і запускається перший екран.
 * Якщо завантаження саме тривало довше мінімуму, нічого не додається.
 */
import { useEffect, useState } from 'react';

export type BootStage = 'start' | 'auth' | 'profile' | 'screen';

const TARGET: Record<BootStage, number> = { start: 0.12, auth: 0.45, profile: 0.82, screen: 1 };
const ORDER: BootStage[] = ['start', 'auth', 'profile', 'screen'];

/** Мінімум показу заставки від початку завантаження сторінки, мс (знімається однією константою). 1700 → 2400: власник попросив ще трохи довше (2026-11-01). */
export const SPLASH_MIN_MS = 2400;

let stage: BootStage = 'start';
let stageAt = performance.now();
/** Завершальний відрізок «усе завантажено, чекаємо мінімум»: смуга йде від досягнутого до 100 % лінійно до finish.at. */
let finish: { from: number; start: number; at: number } | null = null;
const listeners = new Set<() => void>();

export function bootMark(next: BootStage) {
  if (ORDER.indexOf(next) <= ORDER.indexOf(stage)) return;
  stage = next;
  stageAt = performance.now();
  for (const l of listeners) l();
}

/** Усе завантажено, але мінімум показу заставки ще не вичерпано: смуга доходить до 100 % рівно до моменту `endAt` (performance.now()). */
export function bootFinish(endAt: number) {
  if (finish) return;
  const start = performance.now();
  finish = { from: bootProgress(start), start, at: Math.max(endAt, start + 1) };
  for (const l of listeners) l();
}

/** Поточна частка 0…1 з плавним наближенням до наступного етапу. */
export function bootProgress(now = performance.now()): number {
  if (finish) {
    const t = Math.min(1, Math.max(0, (now - finish.start) / (finish.at - finish.start)));
    return finish.from + (1 - finish.from) * (1 - (1 - t) * (1 - t));
  }
  const base = TARGET[stage];
  const nextStage = ORDER[ORDER.indexOf(stage) + 1];
  if (!nextStage) return 1;
  const gap = TARGET[nextStage] - base;
  const t = (now - stageAt) / 1000;
  return base + gap * 0.85 * (1 - Math.exp(-t / 1.6));
}

/** Етап довше за цей час — показуємо, що зв'язок повільний, і пропонуємо повторити. */
export const BOOT_SLOW_MS = 8000;

/** Що саме зараз виконується (наступний незавершений етап) і чи він затягнувся. */
export function bootState(now = performance.now()): { doing: BootStage | null; step: number; total: number; slow: boolean } {
  const i = ORDER.indexOf(stage);
  const doing = ORDER[i + 1] ?? null;
  return { doing, step: Math.min(i + 1, ORDER.length - 1), total: ORDER.length - 1, slow: !!doing && now - stageAt > BOOT_SLOW_MS };
}

export function useBootProgress(): number {
  const [value, setValue] = useState(() => bootProgress());
  useEffect(() => {
    let raf = 0;
    let last = 0;
    const tick = (now: number) => {
      // ~15 оновлень на секунду достатньо: ширину плавно доводить CSS-перехід.
      if (now - last > 66) {
        last = now;
        setValue(bootProgress(now));
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    const l = () => setValue(bootProgress());
    listeners.add(l);
    return () => {
      cancelAnimationFrame(raf);
      listeners.delete(l);
    };
  }, []);
  return value;
}

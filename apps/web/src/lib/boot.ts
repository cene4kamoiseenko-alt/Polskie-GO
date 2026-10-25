/**
 * Реальний прогрес запуску застосунку для заставки.
 * Етапи відмічаються там, де вони справді завершуються: модуль завантажено → авторизація →
 * профіль користувача → перший екран. Між етапами смуга лише плавно «підповзає»
 * до наступного етапу, але не досягає його, доки етап не завершиться. Штучних затримок немає.
 */
import { useEffect, useState } from 'react';

export type BootStage = 'start' | 'auth' | 'profile' | 'screen';

const TARGET: Record<BootStage, number> = { start: 0.12, auth: 0.45, profile: 0.82, screen: 1 };
const ORDER: BootStage[] = ['start', 'auth', 'profile', 'screen'];

let stage: BootStage = 'start';
let stageAt = performance.now();
const listeners = new Set<() => void>();

export function bootMark(next: BootStage) {
  if (ORDER.indexOf(next) <= ORDER.indexOf(stage)) return;
  stage = next;
  stageAt = performance.now();
  for (const l of listeners) l();
}

/** Поточна частка 0…1 з плавним наближенням до наступного етапу. */
export function bootProgress(now = performance.now()): number {
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

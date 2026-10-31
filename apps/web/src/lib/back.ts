import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * «Назад» всередині застосунку. Екран, відкритий кнопкою бота (`?bot_screen=`), стоїть першим в історії
 * (перехід із `replace`), і `navigate(-1)` вів «до застосунку»: у Telegram кнопка не робила нічого
 * (скарга 2026-10-31: «Назад» не працює в налаштуваннях). Тоді йдемо на батьківський екран із заміною запису.
 * Позицію в історії зберігає React Router: `history.state.idx` (0 — перший запис застосунку).
 */
export function canGoBack(): boolean {
  const idx = (window.history.state as { idx?: number } | null)?.idx;
  return typeof idx === 'number' && idx > 0;
}

/** Куди вести «Назад», коли історії немає: місія → список місій, історія → завдання, решта → головна. */
export function parentRoute(pathname: string): string {
  const [first, second] = pathname.split('/').filter(Boolean);
  if (first === 'life' && second) return '/life';
  if (first === 'story') return '/quests';
  return '/';
}

/** Стабільний обробник «Назад» (шлях читається в момент натискання, тож обробник не перевішується при переходах). */
export function useGoBack() {
  const nav = useNavigate();
  return useCallback(() => {
    if (canGoBack()) nav(-1);
    else nav(parentRoute(window.location.pathname), { replace: true });
  }, [nav]);
}

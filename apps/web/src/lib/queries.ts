import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ApiError, api, takeEarlyMe } from './api';
import type { Journey, Me, Quest, ShopItem } from './types';

// Нужен вход (первый запуск вне Telegram) повторять бессмысленно: без ключа устройства запрос не пойдёт, пока игрок не выберет, как начать.
const noRetryWhenWelcome = (count: number, error: unknown) => !(error instanceof ApiError && error.code === 'welcome_required') && count < 1;
export const useMe = () => useQuery({ queryKey: ['me'], retry: noRetryWhenWelcome, queryFn: async () => (await takeEarlyMe<Me>()) ?? api<Me>('/me') });
export const useJourney = () => useQuery({ queryKey: ['journey'], queryFn: () => api<Journey>('/journey') });
export const useQuests = () =>
  useQuery({ queryKey: ['quests'], queryFn: () => api<{ daily: Quest[]; weekly: Quest[]; story: Quest[]; resetsAt: string; chest?: { xp: number; zlotki: number; done: number; total: number; ready: boolean; claimed: boolean } }>('/quests') });
export const useShop = () => useQuery({ queryKey: ['shop'], queryFn: () => api<{ balance: number; premium: boolean; items: ShopItem[] }>('/shop') });

/** Після навчальних подій оновлюємо все, що могло змінитися. */
export function useRefreshAll() {
  const qc = useQueryClient();
  return () => Promise.all(['me', 'journey', 'quests', 'shop', 'achievements', 'stats', 'diary', 'exams', 'house'].map((k) => qc.invalidateQueries({ queryKey: [k] })));
}

export function useUpdateSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<Me['settings']> & { dailyQuiz?: boolean }) => api<Me>('/me/settings', { method: 'PATCH', body }),
    onSuccess: (me) => qc.setQueryData(['me'], me),
  });
}

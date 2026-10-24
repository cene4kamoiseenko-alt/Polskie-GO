import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from './api';
import type { Journey, Me, Quest, ShopItem } from './types';

export const useMe = () => useQuery({ queryKey: ['me'], queryFn: () => api<Me>('/me') });
export const useJourney = () => useQuery({ queryKey: ['journey'], queryFn: () => api<Journey>('/journey') });
export const useQuests = () =>
  useQuery({ queryKey: ['quests'], queryFn: () => api<{ daily: Quest[]; weekly: Quest[]; story: Quest[]; resetsAt: string }>('/quests') });
export const useShop = () => useQuery({ queryKey: ['shop'], queryFn: () => api<{ balance: number; premium: boolean; items: ShopItem[] }>('/shop') });

/** Після навчальних подій оновлюємо все, що могло змінитися. */
export function useRefreshAll() {
  const qc = useQueryClient();
  return () => Promise.all(['me', 'journey', 'quests', 'shop', 'achievements', 'stats', 'diary', 'exams'].map((k) => qc.invalidateQueries({ queryKey: [k] })));
}

export function useUpdateSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<Me['settings']>) => api<Me>('/me/settings', { method: 'PATCH', body }),
    onSuccess: (me) => qc.setQueryData(['me'], me),
  });
}

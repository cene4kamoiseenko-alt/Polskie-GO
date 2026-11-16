/**
 * Входной тест уровня (2026-11-16): открыть его из настроек, с главной или из знакомства. Тест — урок вида PLACEMENT в списке экзаменов.
 */
import { api } from './api';

export async function levelTestPath(): Promise<string | null> {
  const r = await api<{ exams: { id: string; kind: string }[] }>('/exams');
  const p = r.exams.find((e) => e.kind === 'PLACEMENT');
  return p ? `/lesson/${p.id}` : null;
}

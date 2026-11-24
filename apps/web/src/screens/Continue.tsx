/**
 * «Продолжить урок» из карточки бота (2026-11-24): начатый урок (`me.activeLesson`), иначе следующий по маршруту, иначе «Учёба».
 * Экран-переход: ничего не рисует, кроме загрузки.
 */
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useJourney, useMe } from '../lib/queries';
import { ScreenSkeleton } from '../components/ui';

export default function ContinueScreen() {
  const nav = useNavigate();
  const me = useMe();
  const journey = useJourney();
  useEffect(() => {
    const active = me.data?.activeLesson;
    if (active) return nav(`/lesson/${active.lessonId}`, { replace: true });
    if (!me.data || journey.isLoading) return;
    const next = journey.data?.nextLesson;
    nav(next ? `/lesson/${next.id}` : '/learn', { replace: true });
  }, [me.data, journey.isLoading, journey.data, nav]);
  return <ScreenSkeleton />;
}

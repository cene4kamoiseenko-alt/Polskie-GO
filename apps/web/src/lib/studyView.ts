import { store } from './storage';

/** Вид вкладки «Учёба»: уроки города или карта Польши. Вкладка нижней панели ведёт в последний открытый вид. */
export type StudyView = 'lessons' | 'map';
const KEY = 'pg:study-view';

export function studyHref(): '/learn' | '/map' {
  return store.get(KEY) === 'map' ? '/map' : '/learn';
}

export function rememberStudyView(view: StudyView) {
  store.set(KEY, view);
}

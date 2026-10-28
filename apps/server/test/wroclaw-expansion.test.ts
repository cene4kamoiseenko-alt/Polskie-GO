import { afterAll } from 'vitest';
import { disposeEnv } from './helpers';
import { expansionSuite } from './expansion-suite';

afterAll(disposeEnv);

expansionSuite({
  label: 'Wrocław за стандартом (одяг, подарунки й порівняння)',
  city: 'wroclaw',
  old: ['wro-1-kawa', 'wro-2-zabka', 'wro-3-ceny', 'wro-4-restauracja'],
  routes: ['wro-kawiarnia', 'wro-sklep', 'wro-restauracja', 'wro-ubrania', 'wro-prezenty', 'wro-egzamin'],
  total: 8,
  boss: 'wro-boss',
  nextNew: ['wro-5-ubrania', 'wro-6-przymierzalnia'],
  rewards: ['costume-krasnal', 'souvenir-krasnal'],
});

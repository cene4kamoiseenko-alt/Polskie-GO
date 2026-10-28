import { afterAll } from 'vitest';
import { disposeEnv } from './helpers';
import { expansionSuite } from './expansion-suite';

afterAll(disposeEnv);

expansionSuite({
  label: 'Ополе за стандартом (плани, запрошення, концерт, конкурс)',
  city: 'opole',
  old: ['opo-1-siema', 'opo-2-reakcje', 'opo-3-ogarniac', 'opo-4-nic-nikt'],
  routes: ['opo-zywy', 'opo-rozmowy', 'opo-festiwal', 'opo-egzamin'],
  total: 8,
  boss: 'opo-boss',
  nextNew: ['opo-5-weekend', 'opo-6-zaproszenie'],
});

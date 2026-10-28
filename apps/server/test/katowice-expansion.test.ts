import { afterAll } from 'vitest';
import { disposeEnv } from './helpers';
import { expansionSuite } from './expansion-suite';

afterAll(disposeEnv);

expansionSuite({
  label: 'Katowice за стандартом (поїздки, таксі, квартира)',
  city: 'katowice',
  old: ['kat-1-transport', 'kat-2-isc-jechac', 'kat-3-wiedziec-znac', 'kat-4-te-ta'],
  routes: ['kat-ruch', 'kat-pary', 'kat-podroze', 'kat-mieszkanie', 'kat-egzamin'],
  total: 8,
  boss: 'kat-boss',
  nextNew: ['kat-5-przyjechac', 'kat-7-taksowka'],
});

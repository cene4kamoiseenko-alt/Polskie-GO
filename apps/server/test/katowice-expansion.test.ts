import { afterAll } from 'vitest';
import { disposeEnv } from './helpers';
import { expansionSuite } from './expansion-suite';

afterAll(disposeEnv);

expansionSuite({
  label: 'Katowice (поїздки, пошта, квартира, дзвінки)',
  city: 'katowice',
  old: ['kat-1-transport', 'kat-2-isc-jechac', 'kat-3-wiedziec-znac', 'kat-4-te-ta'],
  routes: ['kat-ruch', 'kat-pary', 'kat-podroze', 'kat-poczta', 'kat-mieszkanie', 'kat-rozmowa', 'kat-egzamin'],
  total: 13,
  boss: 'kat-boss',
  nextNew: ['kat-5-przyjechac', 'kat-6-hulajnoga'],
});

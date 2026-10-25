import { describe, expect, it } from 'vitest';
import { supportsBeaverArt, beaverAsset, cityAsset } from '../../web/src/lib/assets';
describe('Generated art integration', () => {
 it('supports the actual starter outfit, preserving compatibility with default hoodie', () => {
  expect(supportsBeaverArt({ BACKPACK: 'backpack-travel' })).toBe(true);
  expect(supportsBeaverArt({ BACKPACK: 'backpack-travel', JACKET: 'hoodie-red' })).toBe(true);
 });
 it('never hides custom equipment behind a base raster', () => {
  for(const [slot,value] of Object.entries({HAT:'hat-chef',SCARF:'scarf-pl',GLASSES:'glasses-sun',JACKET:'jacket-rain',BACKPACK:'backpack-map',SHOES:'boots-mountain',ACCESSORY:'map-paper',COSTUME:'costume-dragon'})) {
   expect(supportsBeaverArt({ BACKPACK: 'backpack-travel', [slot]: value }), slot).toBe(false);
  }
  expect(supportsBeaverArt({ BACKPACK: 'backpack-travel', JACKET:'none' })).toBe(false);
 });
 it('resolves real city and character assets, including correct-answer reaction', () => {
  for(const mood of ['wave','think','read','celebrate','cheer'])expect(beaverAsset(mood)).toBeTruthy();
  for(const city of ['warszawa','krakow','wroclaw'])expect(cityAsset(city)).toBeTruthy();
 });
});

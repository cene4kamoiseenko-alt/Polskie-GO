/**
 * Вибір живописних ассетів Бобека у вебі (ADR-005, етап M1). Раніше тут перевірялось правило
 * «за будь-якої іншої речі — векторний бобер» (supportsBeaverArt); векторного тіла більше немає:
 * що малювати, вирішує resolveLook, а веб лише знаходить файл за логічним ключем маніфесту.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { LOOK_MANIFEST, LOOK_MOODS, LOOK_VIEWS, resolveLook } from '@polski-go/shared';
import { assetByKey, beaverAsset, cityAsset, lookAssetUrl, lookDeliveryWidth } from '../../web/src/lib/assets';

const STARTER = { BACKPACK: 'backpack-travel' };
const WEB_SRC = new URL('../../web/src/', import.meta.url).pathname;

function sources(dir) {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? sources(p) : /\.tsx?$/.test(f) ? [p] : [];
  });
}

describe('Живописний Бобек у вебі: ассети за маніфестом образу', () => {
  it('кожна цілісна картинка маніфесту (пози, костюми, сцени карток) має файл у вебі', () => {
    const keys = [
      ...Object.values(LOOK_MANIFEST.legacyBase.poses).map((p) => p.asset),
      ...LOOK_MANIFEST.items.flatMap((i) => (i.legacy ? [i.legacy.asset, i.legacy.scene].filter(Boolean) : [])),
      ...LOOK_MANIFEST.base.layers.map((l) => l.asset),
      ...LOOK_MANIFEST.items.flatMap((i) => i.layers.map((l) => l.asset)),
    ];
    expect(keys.length).toBeGreaterThan(20);
    for (const key of keys) expect(assetByKey(key), key).toBeTruthy();
  });

  it('стартовий образ у кожному стані й ракурсі — живописна картинка з реальним файлом', () => {
    for (const mood of LOOK_MOODS) {
      const look = resolveLook(null, STARTER, { mood });
      expect(look.mode, mood).toBe('legacy-base');
      expect(look.layers, mood).toHaveLength(1);
      expect(lookAssetUrl(look.layers[0].asset, 512), mood).toBeTruthy();
      expect(look.drawn, mood).toEqual(['backpack-travel', 'hoodie-red']);
    }
    for (const view of LOOK_VIEWS) {
      const look = resolveLook(null, STARTER, { view });
      expect(look.view).toBe(view);
      expect(lookAssetUrl(look.layers[0].asset, 256), view).toBeTruthy();
    }
  });

  it('костюм з цілісною картинкою малює саме її; річ без живописного шару не підмінюється іншою картинкою', () => {
    const chef = resolveLook(null, { ...STARTER, COSTUME: 'costume-chef', HAT: 'hat-chef', GLASSES: 'glasses-round' }, { mood: 'wave' });
    expect(chef.mode).toBe('legacy-costume');
    expect(chef.layers.map((l) => l.asset)).toEqual(['costumes/chef']);
    expect(lookAssetUrl('costumes/chef', 256)).toBe(assetByKey('costumes/chef'));
    expect(chef.drawn).toEqual(['costume-chef', 'hat-chef']);
    expect(chef.pending).toEqual(['glasses-round']);
  });

  it('pending-річ ніколи не малюється: картинка та сама, що й без неї, річ — у pending', () => {
    const plain = resolveLook(null, STARTER);
    const pending = LOOK_MANIFEST.items.filter((i) => i.status === 'pending');
    expect(pending.length).toBeGreaterThan(10);
    for (const it of pending) {
      const look = resolveLook(null, { ...STARTER, [it.catalogSlot]: it.id });
      expect(look.drawn, it.id).not.toContain(it.id);
      expect(look.pending, it.id).toEqual([it.id]);
      expect(look.layers.map((l) => l.asset), it.id).toEqual(plain.layers.map((l) => l.asset));
    }
  });

  it('стан без пози в маніфесті — запасна поза (не вигадана), таблиця станів одна', () => {
    expect(beaverAsset('cheer')).toBe(assetByKey('beaver/correct'));
    expect(beaverAsset('happy')).toBe(assetByKey('beaver/greet'));
    for (const mood of ['sleep', 'coffee', 'pay', 'parcel', 'tired', 'laptop', 'surprised']) expect(beaverAsset(mood), mood).not.toBeNull();
    for (const mood of ['royal', 'music']) {
      expect(beaverAsset(mood), mood).toBeNull();
      const look = resolveLook(null, STARTER, { mood });
      expect(look.poseFallback, mood).toBe(true);
      expect(look.pose, mood).toBe(LOOK_MANIFEST.legacyBase.fallbackPose);
    }
    expect(beaverAsset('constructor')).toBeNull();
  });

  it('ширина доставки: найменша з 256/512/1024, не менша за розмір × min(DPR, 3)', () => {
    expect(lookDeliveryWidth(40, 1)).toBe(256);
    expect(lookDeliveryWidth(110, 2)).toBe(256);
    expect(lookDeliveryWidth(176, 2)).toBe(512);
    expect(lookDeliveryWidth(176, 3)).toBe(1024);
    expect(lookDeliveryWidth(300, 5)).toBe(1024);
    expect(lookDeliveryWidth(900, 3)).toBe(1024);
    expect(lookDeliveryWidth(100, 0.5)).toBe(256);
    // Варіантів `@256/@512/@1024` поки немає — береться основний файл.
    expect(lookAssetUrl('beaver/wave', 256)).toBe(assetByKey('beaver/wave'));
    expect(lookAssetUrl('look/front/no-such/part', 256)).toBeNull();
  });

  it('екрани не підміняють одяг: у вебі немає outfit= / vectorOnly на Бобеку', () => {
    const offenders = sources(WEB_SRC).filter((p) => /<Beaver\b[^>]*\b(outfit|vectorOnly)\b/.test(readFileSync(p, 'utf8')));
    expect(offenders).toEqual([]);
  });

  it('панорами міст на місці', () => {
    for (const city of ['warszawa', 'krakow', 'wroclaw']) expect(cityAsset(city)).toBeTruthy();
  });
});

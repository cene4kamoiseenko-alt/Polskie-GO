/**
 * Прототип единого Бобека (apps/web/src/dev/lookPrototypeManifest.ts, слои — scripts/look-prototype.mjs) на ядре образа:
 * те же resolveLook / equip / validateManifest, что и в приложении. Проверяет шаги владельца:
 * худи → синяя куртка (меняется только одежда) → кепка на якоре головы → очки на якоре глаз → змах лапой → тот же
 * комплект во всех позах. Сохранение после перезапуска проверяет браузерный скрипт scripts/look-prototype-screens.ts.
 */
import { existsSync, readFileSync } from 'node:fs';
import sharp from 'sharp';
import { describe, expect, it } from 'vitest';
import { LOOK_MANIFEST, equip, resolveLook, validateManifest } from '@polski-go/shared';
import { LOOK_PROTOTYPE_MANIFEST as M, PROTO_POSES, PROTO_STATES } from '../../web/src/dev/lookPrototypeManifest';

const DIR = new URL('../../web/src/dev/look-proto/', import.meta.url);
const meta = JSON.parse(readFileSync(new URL('meta.json', DIR), 'utf8'));
const file = (key: string) => new URL(`${key.replace(/^proto\//, '')}.webp`, DIR);
const START = ['hoodie-red', 'backpack-travel'];

describe('прототип единого Бобека', () => {
  it('валидатор ядра: вещи прототипа корректны; ошибки только там, где прототип не финальная модель; файлы на диске', () => {
    const errors = validateManifest(M).filter((i) => i.level === 'error');
    // База прототипа — плоская поза, разложенная по цвету: мех, голова и морда одним слоем «body», рюкзак свой на каждую позу.
    // Финальная база по ADR-005 — отдельные shadow, tail, legs, torso, ears, head, tuft, face; рюкзак — один на ракурс.
    // Валидатор так и говорит, а к одежде, кепке и очкам (якоря, полосы, слоты, позы) претензий нет.
    expect(new Set(errors.map((e) => e.code))).toEqual(new Set(['base-part', 'missing-part', 'per-pose-variant']));
    expect(errors.filter((e) => !/^(proto-base:|base:|backpack-travel)/.test(e.ref))).toEqual([]);
    expect(errors.filter((e) => e.code === 'base-part').map((e) => e.ref).sort()).toEqual([...PROTO_POSES.map((p) => `proto-base:${p}:body`), 'proto-base:wave:arm'].sort());
    const keys = new Set([...M.base.layers, ...M.items.flatMap((i) => i.layers)].map((l) => l.asset));
    expect(keys.size).toBe(30); // 5 поз × (тело, веки, худи, куртка, рюкзак) + лапа и 2 рукава wave + кепка + очки
    for (const k of keys) {
      expect(existsSync(file(k)), k).toBe(true);
      if (!/cap-red|glasses-round/.test(k)) expect(existsSync(new URL(`${k.replace(/^proto\//, '')}@512.webp`, DIR)), `${k}@512`).toBe(true);
    }
    // Манифест приложения не тронут: база там по-прежнему не нарисована.
    expect(LOOK_MANIFEST.base.status).toBe('pending');
  });

  it('1 → 2: синяя куртка снимает худи, остальные слои не меняются', () => {
    const hoodie = resolveLook(null, START, { manifest: M });
    expect(hoodie.mode).toBe('layered');
    expect(hoodie.drawn).toEqual(['backpack-travel', 'hoodie-red']);
    const r = equip(START, 'jacket-denim', M);
    expect(r.evicted).toEqual(['hoodie-red']);
    const jacket = resolveLook(null, r.equipment, { manifest: M });
    expect(jacket.drawn).toEqual(['backpack-travel', 'jacket-denim']);
    const notTop = (l: { slot: string }) => l.slot !== 'top';
    expect(jacket.layers.filter(notTop)).toEqual(hoodie.layers.filter(notTop));
    expect(jacket.layers.filter((l) => l.slot === 'top').map((l) => l.asset)).toEqual(['proto/idle/top-jacket-denim']);
  });

  it('куртка — та же форма, что худи: альфа-маски слоёв одежды совпадают во всех позах', async () => {
    for (const pose of PROTO_POSES) {
      const a = await sharp(readFileSync(file(`proto/${pose}/top-hoodie-red`))).extractChannel(3).raw().toBuffer();
      const b = await sharp(readFileSync(file(`proto/${pose}/top-jacket-denim`))).extractChannel(3).raw().toBuffer();
      let diff = 0;
      for (let i = 0; i < a.length; i++) diff += Math.abs(a[i] - b[i]);
      expect(diff / a.length, pose).toBeLessThan(1);
    }
  });

  it('3 → 4: кепка на якоре головы, очки на якоре глаз; оба поворачиваются с наклоном головы позы', () => {
    let e = equip(START, 'jacket-denim', M).equipment;
    e = equip(e, 'cap-red', M).equipment;
    e = equip(e, 'glasses-round', M).equipment;
    for (const state of PROTO_STATES) {
      const look = resolveLook(null, e, { manifest: M, mood: state.mood });
      const pose = M.base.poses.find((p) => p.id === look.pose)!;
      expect(look.drawn).toEqual(['backpack-travel', 'cap-red', 'glasses-round', 'jacket-denim']);
      const cap = look.layers.find((l) => l.owner === 'cap-red')!;
      const glasses = look.layers.find((l) => l.owner === 'glasses-round')!;
      const headTop = pose.anchors!['head-top']!;
      expect({ x: cap.rect!.x + meta.cap.pivot.x, y: cap.rect!.y + meta.cap.pivot.y }).toEqual(headTop);
      expect({ x: glasses.rect!.x + meta.glasses.pivot.x, y: glasses.rect!.y + meta.glasses.pivot.y }).toEqual({ x: 512, y: 330 });
      expect(cap.rotate ?? 0).toBe(pose.rotations!['head-top']);
      expect(glasses.rotate ?? 0).toBe(pose.rotations!.eyes);
      // Порядок: тело → одежда → очки → кепка.
      const z = (owner: string) => look.layers.find((l) => l.owner === owner)!.z;
      expect(z('base')).toBeLessThan(z('jacket-denim'));
      expect(z('glasses-round')).toBeLessThan(z('cap-red'));
    }
  });

  it('5: змах лапой — у позы wave лапа и рукав выбранного верха двигаются вокруг одной точки плеча', () => {
    const look = resolveLook(null, equip(START, 'jacket-denim', M).equipment, { manifest: M, mood: 'wave' });
    expect(look.pose).toBe('wave');
    const moving = look.layers.filter((l) => l.motion === 'wave');
    expect(moving.map((l) => l.owner).sort()).toEqual(['base', 'jacket-denim']);
    expect(new Set(moving.map((l) => JSON.stringify(l.motionOrigin))).size).toBe(1);
    expect(moving[0].motionOrigin).toEqual(meta.poses.wave.arm.pivot);
    expect(look.layers.filter((l) => l.motion === 'blink')).toHaveLength(1);
  });

  it('анимационные состояния idle, wave, happy, thinking, celebrate — разные позы с одним комплектом; моргание в каждой', () => {
    const e = equip(equip(START, 'cap-red', M).equipment, 'glasses-round', M).equipment;
    const looks = PROTO_STATES.map((s) => resolveLook(null, e, { manifest: M, mood: s.mood }));
    expect(looks.map((l) => l.pose)).toEqual(['idle', 'wave', 'happy', 'think', 'celebrate']);
    for (const l of looks) {
      expect(l.poseFallback, l.pose).toBe(false);
      expect(l.drawn).toEqual(['backpack-travel', 'cap-red', 'glasses-round', 'hoodie-red']);
      expect(l.layers.some((x) => x.motion === 'blink'), l.pose).toBe(true);
    }
  });
});

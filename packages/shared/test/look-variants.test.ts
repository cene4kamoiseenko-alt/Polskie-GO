/**
 * Готовые образы Бобека (ADR-008): таблица «набор вещей → картинка», режим `variant` резолвера, файлы на диске.
 * Стартовый набор (худи + рюкзак) остаётся цельным образом с 14 позами — это проверено отдельно.
 */
import { existsSync, readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  LOOK_MANIFEST,
  equip,
  LOOK_VARIANTS,
  LOOK_VARIANT_AXES,
  LOOK_VARIANT_JACKETS,
  canPurchase,
  resolveLook,
  tryOn,
  validateManifest,
  type LookItem,
  type LookManifest,
  type LookVariant,
} from '../src';

const ASSETS = new URL('../../../apps/web/src/assets/', import.meta.url);
const exists = (file: string) => existsSync(new URL(file, ASSETS));

const AXES = [...LOOK_VARIANT_AXES];
const JACKETS: readonly string[] = LOOK_VARIANT_JACKETS;
/** Полная сетка 2⁴ — образы без курток. */
const grid = () => LOOK_VARIANTS.list.filter((v) => !v.items.some((id) => JACKETS.includes(id)));
const STARTER_SET = ['backpack-travel'];
const subsets = <T,>(xs: readonly T[]): T[][] => xs.reduce<T[][]>((acc, x) => [...acc, ...acc.map((s) => [...s, x])], [[]]);
const byId = (id: string): LookVariant => LOOK_VARIANTS.list.find((v) => v.id === id)!;
const errors = (m?: LookManifest) => validateManifest(m).filter((i) => i.level === 'error');
const codes = (m: LookManifest) => errors(m).map((i) => i.code);
const withVariants = (list: readonly LookVariant[]): LookManifest => ({ ...LOOK_MANIFEST, variants: { ...LOOK_VARIANTS, list } });
/** Правила для вещей без картинки. Настоящих курток и костюмов без картинки после пакета владельца 2026-11-04 нет — проверяем на вымышленных. */
const FUTURE: LookManifest = {
  ...LOOK_MANIFEST,
  items: [
    ...LOOK_MANIFEST.items,
    { id: 'vest-future', catalogSlot: 'JACKET', domain: 'beaver', occupies: ['top'], rarity: 'epic', status: 'pending', fallback: 'hide', compatibility: null, layers: [], replaces: ['torso'] },
    { id: 'costume-future', catalogSlot: 'COSTUME', domain: 'beaver', occupies: ['body'], rarity: 'epic', status: 'pending', fallback: 'hide', compatibility: null, layers: [] },
  ] as LookItem[],
};

describe('готовые образы: таблица', () => {
  it('полная сетка: все 16 сочетаний четырёх вещей, у каждого есть поза wave, поза open — у 8; плюс 16 образов с куртками (партии 2–4)', () => {
    expect(LOOK_VARIANTS.list).toHaveLength(32);
    expect(grid()).toHaveLength(16);
    const keys = grid().map((v) => v.items.join('+'));
    expect(new Set(keys).size).toBe(16);
    expect(new Set(keys)).toEqual(new Set(subsets(AXES).map((s) => [...s].sort().join('+'))));
    for (const v of LOOK_VARIANTS.list) expect(v.images.wave, v.id).toBe(`variants/${v.id}_wave`);
    expect(LOOK_VARIANTS.list.filter((v) => v.images.open).map((v) => v.id).sort()).toEqual([
      'hoodie', 'hoodie-cap', 'hoodie-cap-glasses', 'hoodie-cap-glasses-scarf-pack', 'hoodie-glasses', 'hoodie-glasses-scarf', 'hoodie-pack', 'hoodie-scarf',
    ]);
  });

  it('каждая картинка лежит в apps/web/src/assets/variants: главный файл и @256', () => {
    for (const v of LOOK_VARIANTS.list) {
      for (const asset of Object.values(v.images)) {
        expect(exists(`${asset}.webp`), `${asset}.webp`).toBe(true);
        expect(exists(`${asset}@256.webp`), `${asset}@256.webp`).toBe(true);
      }
    }
  });

  it('манифест проходит проверку; все предметы осей — prerendered', () => {
    expect(errors()).toEqual([]);
    for (const id of [...AXES, ...JACKETS, 'hoodie-red']) expect(LOOK_MANIFEST.items.find((i) => i.id === id)?.status, id).toBe('prerendered');
  });

  it('проверка ловит расхождения таблицы с каталогом', () => {
    const cap = byId('hoodie-cap');
    // предмет есть в образах, но он pending
    const pendingCap = { ...LOOK_MANIFEST, items: LOOK_MANIFEST.items.map((i) => (i.id === 'cap-red' ? { ...i, status: 'pending' as const } : i)) };
    expect(codes(pendingCap)).toContain('variant-item');
    // prerendered без образа
    expect(codes(withVariants(LOOK_VARIANTS.list.filter((v) => !v.items.includes('scarf-pl'))))).toContain('variant-missing');
    expect(codes(withVariants(LOOK_VARIANTS.list.filter((v) => !v.items.includes('jacket-rain'))))).toContain('variant-missing');
    // два образа с одним набором
    expect(codes(withVariants([...LOOK_VARIANTS.list, { ...cap, id: 'twin' }]))).toContain('variant-duplicate');
    // нет картинки позы по умолчанию
    expect(codes(withVariants(LOOK_VARIANTS.list.map((v) => (v.id === 'hoodie' ? { ...v, images: { open: 'variants/hoodie_open' } } : v))))).toContain('variant-default-pose');
    // чужой ключ ассета
    expect(codes(withVariants(LOOK_VARIANTS.list.map((v) => (v.id === 'hoodie' ? { ...v, images: { wave: 'beaver/wave' } } : v))))).toContain('variant-asset');
    // неизвестный предмет и неотсортированный набор
    expect(codes(withVariants([...LOOK_VARIANTS.list, { id: 'x', items: ['no-such-item'], images: { wave: 'variants/x_wave' } }]))).toContain('variant-item');
    expect(codes(withVariants(LOOK_VARIANTS.list.map((v) => (v.id === 'hoodie-cap-glasses' ? { ...v, items: [...v.items].reverse() } : v))))).toContain('variant-order');
  });
});

describe('готовые образы: resolveLook', () => {
  it('стартовый набор (худи + рюкзак) — по-прежнему цельный образ с 14 позами, не готовый образ', () => {
    for (const mood of ['happy', 'cheer', 'read', 'celebrate']) {
      const look = resolveLook(null, ['backpack-travel'], { mood });
      expect(look.mode, mood).toBe('legacy-base');
      expect(look.layers[0].asset.startsWith('beaver/'), mood).toBe(true);
    }
  });

  it('кепка поверх стартового набора: готовый образ «худи + кепка + рюкзак», кепка видна', () => {
    const look = resolveLook(null, ['backpack-travel', 'cap-red']);
    expect(look.mode).toBe('variant');
    expect(look.baseRef).toBe('variants');
    expect(look.pose).toBe('wave');
    expect(look.layers).toEqual([{ id: 'variant:hoodie-cap-pack:wave', asset: 'variants/hoodie-cap-pack_wave', owner: 'variants', slot: 'base', z: 0, fit: 'contain', rect: null }]);
    expect(look.drawn).toEqual(['backpack-travel', 'cap-red', 'hoodie-red']);
    expect(look.pending).toEqual([]);
    expect(look.hidden).toEqual([]);
    expect(look.slots.headwear).toEqual({ wanted: 'cap-red', shown: 'cap-red', outcome: 'drawn' });
    expect(look.slots.top).toEqual({ wanted: null, shown: 'hoodie-red', outcome: 'default' });
    expect(look.legacy).toBe(true);
    expect(look.key).toBe('look1|variant|variants|front|wave|backpack-travel+cap-red+hoodie-red');
  });

  it('для каждого из 16 наборов полной сетки рисуется ровно этот набор и именно его картинка', () => {
    for (const set of subsets(AXES)) {
      const look = resolveLook(null, set);
      const label = set.join('+') || 'без вещей';
      expect(look.drawn, label).toEqual(['hoodie-red', ...set].sort());
      expect(look.pending, label).toEqual([]);
      const isStarter = [...set].sort().join('+') === STARTER_SET.join('+');
      if (isStarter) {
        expect(look.mode, label).toBe('legacy-base');
      } else {
        const variant = LOOK_VARIANTS.list.find((v) => v.items.join('+') === [...set].sort().join('+'))!;
        expect(look.mode, label).toBe('variant');
        expect(look.layers.map((l) => l.asset), label).toEqual([variant.images.wave]);
      }
    }
  });

  it('снять рюкзак: образ без рюкзака, рюкзак не нарисован (раньше он был впечатан навсегда)', () => {
    const look = resolveLook(null, []);
    expect(look.mode).toBe('variant');
    expect(look.layers.map((l) => l.asset)).toEqual(['variants/hoodie_wave']);
    expect(look.drawn).toEqual(['hoodie-red']);
    expect(look.slots.backpack).toEqual({ wanted: null, shown: null, outcome: 'empty' });
  });

  it('настроение: своя поза open у набора, где она есть; иначе wave с пометкой «нет своей позы»', () => {
    const open = resolveLook(null, ['cap-red'], { mood: 'cheer' });
    expect(open.layers[0].asset).toBe('variants/hoodie-cap_open');
    expect(open.pose).toBe('open');
    expect(open.poseFallback).toBe(false);

    // у «худи + кепка + рюкзак» картинки open нет
    const noOpen = resolveLook(null, ['cap-red', 'backpack-travel'], { mood: 'cheer' });
    expect(noOpen.layers[0].asset).toBe('variants/hoodie-cap-pack_wave');
    expect(noOpen.pose).toBe('wave');
    expect(noOpen.poseFallback).toBe(true);

    // состояние без записи в таблице — запасная поза wave
    const think = resolveLook(null, ['cap-red'], { mood: 'think' });
    expect(think.layers[0].asset).toBe('variants/hoodie-cap_wave');
    expect(think.poseFallback).toBe(true);
    const happy = resolveLook(null, ['cap-red'], { mood: 'happy' });
    expect(happy.layers[0].asset).toBe('variants/hoodie-cap_wave');
    expect(happy.poseFallback).toBe(false);
  });

  it('других ракурсов у готовых образов нет: показывается стартовая картинка, кепка помечена «ракурс не поддержан»', () => {
    const side = resolveLook(null, ['backpack-travel', 'cap-red'], { view: 'side' });
    expect(side.mode).toBe('legacy-base');
    expect(side.layers[0].asset).toBe('beaver/side');
    expect(side.items.find((o) => o.id === 'cap-red')).toMatchObject({ drawn: false, reason: 'view-unsupported' });
  });

  it('костюм закрывает готовые образы: кепка поверх костюма баристы не рисуется', () => {
    const look = resolveLook(null, ['costume-barista', 'cap-red', 'backpack-travel']);
    expect(look.mode).toBe('legacy-costume');
    // на картинке баристы нарисован зелёный рюкзак — он «виден»; кепку картинка закрывает
    expect(look.drawn).toEqual(['backpack-travel', 'costume-barista']);
    expect(look.hidden).toEqual([{ id: 'cap-red', status: 'prerendered', drawn: false, reason: 'covered-by-whole-look', by: 'costume-barista' }]);
  });

  it('pending-вещь рядом с готовыми не ломает образ и остаётся «скоро»', () => {
    const look = resolveLook(null, ['cap-red', 'glasses-sun', 'backpack-travel']);
    expect(look.mode).toBe('variant');
    expect(look.layers[0].asset).toBe('variants/hoodie-cap-pack_wave');
    expect(look.pending).toEqual(['glasses-sun']);
    expect(look.drawn).toEqual(['backpack-travel', 'cap-red', 'hoodie-red']);
    expect(look.slots.glasses).toEqual({ wanted: 'glasses-sun', shown: null, outcome: 'pending' });
  });

  it('pending-куртка вместо худи: образ рисуется в худи и это честно помечено extraneous', () => {
    const look = resolveLook(null, ['vest-future', 'cap-red'], { manifest: FUTURE });
    expect(look.mode).toBe('variant');
    expect(look.slots.top).toEqual({ wanted: 'vest-future', shown: 'hoodie-red', outcome: 'pending' });
    expect(look.extraneous).toEqual([{ slot: 'top', id: 'hoodie-red' }]);
  });

  it('нет точной картинки — ближайший меньший набор, остальное помечено no-variant (правило на будущее: сетка частичная)', () => {
    const partial = withVariants(LOOK_VARIANTS.list.filter((v) => v.id !== 'hoodie-cap-glasses'));
    const look = resolveLook(null, ['cap-red', 'glasses-round'], { manifest: partial });
    expect(look.mode).toBe('variant');
    expect(look.layers.map((l) => l.asset)).toEqual(['variants/hoodie-cap_wave']);
    expect(look.drawn).toEqual(['cap-red', 'hoodie-red']);
    expect(look.items.find((o) => o.id === 'glasses-round')).toMatchObject({ drawn: false, reason: 'no-variant' });
    expect(look.slots.glasses.outcome).toBe('hidden');
  });

  it('без таблицы образов резолвер работает как раньше (старые синтетические манифесты)', () => {
    const none: LookManifest = { ...LOOK_MANIFEST, variants: undefined };
    expect(resolveLook(null, ['cap-red'], { manifest: none }).mode).toBe('legacy-base');
  });

  it('порядок и формат входа не влияют на результат', () => {
    const a = resolveLook(null, ['scarf-pl', 'cap-red']);
    expect(a.key).toBe(resolveLook(null, ['cap-red', 'i_scarf-pl']).key);
    expect(a.key).toBe(resolveLook(null, { SCARF: 'scarf-pl', HAT: 'cap-red' }).key);
  });

  it('чужой профиль не проверяется по владению, свой — проверяется: не купленная кепка не рисуется', () => {
    const own = resolveLook(['hoodie-red', 'backpack-travel'], ['backpack-travel', 'cap-red']);
    expect(own.mode).toBe('legacy-base');
    expect(own.items.find((o) => o.id === 'cap-red')).toMatchObject({ drawn: false, reason: 'not-owned' });
    expect(resolveLook(['hoodie-red', 'backpack-travel', 'cap-red'], ['backpack-travel', 'cap-red']).mode).toBe('variant');
  });
});

describe('готовые образы: куртки и шапка (партии 2–4, частичная сетка)', () => {
  /** Все 16 сочетаний с куртками: образ без худи (четвёртая партия) и четыре с худи под курткой (`hoodie-…`). */
  const SETS: [string[], string][] = [
    // без худи
    [['jacket-denim'], 'variants/denim_wave'],
    [['jacket-denim', 'glasses-round'], 'variants/denim-glasses_wave'],
    [['jacket-denim', 'beanie-red'], 'variants/denim-beanie_wave'],
    [['jacket-denim', 'cap-red'], 'variants/denim-cap_wave'],
    [['jacket-denim', 'backpack-travel'], 'variants/denim-pack_wave'],
    [['jacket-denim', 'beanie-red', 'glasses-round', 'backpack-travel'], 'variants/denim-beanie-glasses-pack_wave'],
    [['jacket-rain'], 'variants/rain_wave'],
    [['jacket-rain', 'glasses-round'], 'variants/rain-glasses_wave'],
    [['jacket-rain', 'beanie-red'], 'variants/rain-beanie_wave'],
    [['jacket-rain', 'cap-red'], 'variants/rain-cap_wave'],
    [['jacket-rain', 'backpack-travel'], 'variants/rain-pack_wave'],
    [['jacket-rain', 'beanie-red', 'glasses-round', 'backpack-travel'], 'variants/rain-beanie-glasses-pack_wave'],
    // худи под курткой: для этих сочетаний образа без худи пока нет
    [['jacket-denim', 'cap-red', 'glasses-round', 'backpack-travel'], 'variants/hoodie-denim-cap-glasses-pack_wave'],
    [['jacket-denim', 'cap-red', 'glasses-round'], 'variants/hoodie-denim-cap-glasses_wave'],
    [['jacket-rain', 'glasses-round', 'backpack-travel'], 'variants/hoodie-rain-glasses-pack_wave'],
    [['jacket-rain', 'cap-red', 'glasses-round', 'backpack-travel'], 'variants/hoodie-rain-cap-glasses-pack_wave'],
  ];

  it('16 сочетаний есть и совпадают с таблицей: куртка заменяет худи в данных, картинка именно этого набора', () => {
    expect(SETS).toHaveLength(16);
    expect(LOOK_VARIANTS.list.filter((v) => v.items.some((id) => JACKETS.includes(id)))).toHaveLength(16);
    for (const [set, asset] of SETS) {
      const look = resolveLook(null, set);
      expect(look.mode, set.join('+')).toBe('variant');
      expect(look.layers.map((l) => l.asset), set.join('+')).toEqual([asset]);
      expect(look.drawn, set.join('+')).toEqual([...set].sort());
      expect(look.pending, set.join('+')).toEqual([]);
      expect(look.hidden, set.join('+')).toEqual([]);
      const jacket = set.find((id) => id.startsWith('jacket-'))!;
      expect(look.slots.top, set.join('+')).toEqual({ wanted: jacket, shown: jacket, outcome: 'drawn' });
    }
  });

  it('образы без худи не называются hoodie-…; худи под курткой остаётся только у четырёх, где образа без худи нет', () => {
    const jackets = LOOK_VARIANTS.list.filter((v) => v.items.some((id) => JACKETS.includes(id)));
    expect(jackets.filter((v) => v.id.startsWith('hoodie-')).map((v) => v.id).sort()).toEqual([
      'hoodie-denim-cap-glasses', 'hoodie-denim-cap-glasses-pack', 'hoodie-rain-cap-glasses-pack', 'hoodie-rain-glasses-pack',
    ]);
    expect(jackets.filter((v) => !v.id.startsWith('hoodie-'))).toHaveLength(12);
    // куртка и худи делят слот top: набора «худи + куртка» не бывает
    expect(equip(['hoodie-red'], 'jacket-denim').evicted).toEqual(['hoodie-red']);
  });

  it('красная шапка: prerendered, на одном слоте с кепкой (вытесняет её), видна только с куртками', () => {
    const beanie = LOOK_MANIFEST.items.find((i) => i.id === 'beanie-red')!;
    expect(beanie).toMatchObject({ catalogSlot: 'HAT', status: 'prerendered', rarity: 'common', domain: 'beaver' });
    expect(beanie.occupies).toEqual(['headwear']);
    expect(equip(['cap-red', 'backpack-travel'], 'beanie-red')).toMatchObject({ evicted: ['cap-red'], equipment: ['backpack-travel', 'beanie-red'] });
    expect(equip(['beanie-red'], 'cap-red').evicted).toEqual(['beanie-red']);
    // с курткой шапка нарисована
    const withJacket = resolveLook(null, ['jacket-rain', 'beanie-red']);
    expect(withJacket.slots.headwear).toEqual({ wanted: 'beanie-red', shown: 'beanie-red', outcome: 'drawn' });
    // без куртки образа с шапкой нет: рисуется худи, шапка — no-variant, честно «нет картинки»
    const bare = resolveLook(null, ['beanie-red']);
    expect(bare.layers.map((l) => l.asset)).toEqual(['variants/hoodie_wave']);
    expect(bare.items.find((o) => o.id === 'beanie-red')).toMatchObject({ drawn: false, reason: 'no-variant' });
    expect(canPurchase({ id: 'i_beanie-red', slot: 'HAT' })).toEqual({ ok: true, status: 'prerendered' });
  });

  it('сочетания нет: рисуется образ с курткой, остальное — no-variant; из равных побеждает важнее по priority (куртка, кепка, шапка, очки, шарф, рюкзак)', () => {
    // джинсовая + очки + рюкзак (без шапки): «куртка + очки» и «куртка + рюкзак» одного размера — очки важнее рюкзака
    const look = resolveLook(null, ['jacket-denim', 'glasses-round', 'backpack-travel']);
    expect(look.mode).toBe('variant');
    expect(look.layers.map((l) => l.asset)).toEqual(['variants/denim-glasses_wave']);
    expect(look.drawn).toEqual(['glasses-round', 'jacket-denim']);
    expect(look.items.find((o) => o.id === 'backpack-travel')).toMatchObject({ drawn: false, reason: 'no-variant' });
    // джинсовая + кепка + рюкзак: кепка важнее рюкзака
    const cap = resolveLook(null, ['jacket-denim', 'cap-red', 'backpack-travel']);
    expect(cap.layers.map((l) => l.asset)).toEqual(['variants/denim-cap_wave']);
    expect(cap.items.find((o) => o.id === 'backpack-travel')).toMatchObject({ drawn: false, reason: 'no-variant' });
    // дождевик + шапка + очки (без рюкзака): шапка важнее очков
    const rainBeanie = resolveLook(null, ['jacket-rain', 'beanie-red', 'glasses-round']);
    expect(rainBeanie.layers.map((l) => l.asset)).toEqual(['variants/rain-beanie_wave']);
    expect(rainBeanie.items.find((o) => o.id === 'glasses-round')).toMatchObject({ drawn: false, reason: 'no-variant' });
    // шарф поверх дождевика с очками и рюкзаком: образ «дождевик + очки + рюкзак» (с худи под курткой), шарф не нарисован
    const scarf = resolveLook(null, ['jacket-rain', 'glasses-round', 'scarf-pl', 'backpack-travel']);
    expect(scarf.layers.map((l) => l.asset)).toEqual(['variants/hoodie-rain-glasses-pack_wave']);
    expect(scarf.items.find((o) => o.id === 'scarf-pl')).toMatchObject({ drawn: false, reason: 'no-variant' });
    // джинсовая + кепка + очки + шарф: наибольший вмещающийся — «куртка + кепка + очки»
    const three = resolveLook(null, ['jacket-denim', 'cap-red', 'glasses-round', 'scarf-pl']);
    expect(three.layers.map((l) => l.asset)).toEqual(['variants/hoodie-denim-cap-glasses_wave']);
    // куртка и шарф: образ только с курткой, шарфа на картинке нет
    const jacketScarf = resolveLook(null, ['jacket-denim', 'scarf-pl']);
    expect(jacketScarf.layers.map((l) => l.asset)).toEqual(['variants/denim_wave']);
    expect(jacketScarf.items.find((o) => o.id === 'scarf-pl')).toMatchObject({ drawn: false, reason: 'no-variant' });
  });

  it('примерка шарфа поверх джинсовой куртки: честно «не видно», образ остаётся с курткой', () => {
    const p = tryOn(['jacket-denim', 'backpack-travel'], 'scarf-pl', { inventory: ['hoodie-red', 'jacket-denim', 'scarf-pl', 'backpack-travel'] });
    expect(p.candidateVisible).toBe(false);
    expect(p.candidateReason).toBe('no-variant');
    expect(p.after.layers.map((l) => l.asset)).toEqual(['variants/denim-pack_wave']);
  });

  it('примерка куртки поверх кепки: куртка вытесняет худи только в данных, кепка остаётся', () => {
    const p = tryOn(['cap-red', 'glasses-round', 'backpack-travel'], 'jacket-denim', { inventory: ['hoodie-red', 'cap-red', 'glasses-round', 'jacket-denim', 'backpack-travel'] });
    expect(p.candidateVisible).toBe(true);
    expect(p.after.layers.map((l) => l.asset)).toEqual(['variants/hoodie-denim-cap-glasses-pack_wave']);
    expect(p.removed).toEqual([]);
  });

  it('примерка шапки поверх кепки с курткой: кепка снимается, картинка со шапкой', () => {
    const p = tryOn(['jacket-denim', 'cap-red', 'glasses-round', 'backpack-travel'], 'beanie-red', {
      inventory: ['hoodie-red', 'jacket-denim', 'cap-red', 'beanie-red', 'glasses-round', 'backpack-travel'],
    });
    expect(p.removed).toEqual(['cap-red']);
    expect(p.candidateVisible).toBe(true);
    expect(p.after.layers.map((l) => l.asset)).toEqual(['variants/denim-beanie-glasses-pack_wave']);
  });

  it('две куртки не носят вместе, костюм вытесняет куртку', () => {
    const rain = tryOn(['jacket-denim', 'backpack-travel'], 'jacket-rain');
    expect(rain.removed).toEqual(['jacket-denim']);
    const costume = resolveLook(null, ['costume-chef', 'jacket-rain']);
    expect(costume.mode).toBe('legacy-costume');
  });

  it('покупка: куртки продаются как готовые образы', () => {
    expect(canPurchase({ id: 'i_jacket-denim', slot: 'JACKET' })).toEqual({ ok: true, status: 'prerendered' });
    expect(canPurchase({ id: 'i_jacket-rain', slot: 'JACKET' })).toEqual({ ok: true, status: 'prerendered' });
    expect(canPurchase({ id: 'i_vest-future', slot: 'JACKET' }, {}, FUTURE)).toMatchObject({ ok: false, reason: 'visual-pending' });
  });

  it('все картинки курток лежат на диске: главный файл, @512 и @256', () => {
    for (const v of LOOK_VARIANTS.list.filter((x) => x.items.some((id) => JACKETS.includes(id)))) {
      const asset = v.images.wave!;
      for (const file of [`${asset}.webp`, `${asset}@512.webp`, `${asset}@256.webp`]) expect(exists(file), file).toBe(true);
    }
  });

  it('в assets/variants нет лишних файлов: каждый .webp относится к образу таблицы (заменённые мастерами партии 4 удалены)', () => {
    const wanted = new Set(LOOK_VARIANTS.list.flatMap((v) => Object.values(v.images).map((a) => a.replace('variants/', ''))));
    const files = readdirSync(new URL('variants/', ASSETS)).filter((f) => f.endsWith('.webp'));
    const stale = files.filter((f) => !wanted.has(f.replace(/(@\d+)?\.webp$/, '')));
    expect(stale).toEqual([]);
  });
});

describe('готовые образы: примерка и покупка', () => {
  it('примерка кепки показывает картинку «в кепке»: было цельное стартовое, стало готовый образ', () => {
    const p = tryOn(['backpack-travel'], 'cap-red', { inventory: ['hoodie-red', 'backpack-travel', 'cap-red'] });
    expect(p.before.mode).toBe('legacy-base');
    expect(p.after.mode).toBe('variant');
    expect(p.after.layers.map((l) => l.asset)).toEqual(['variants/hoodie-cap-pack_wave']);
    expect(p.candidateVisible).toBe(true);
    expect(p.added).toEqual(['cap-red']);
    expect(p.changedSlots).toContain('headwear');
  });

  it('примерка снимает кепку с другим головным убором-pending: Бобек не рисует чужое', () => {
    const p = tryOn(['backpack-travel', 'cap-red'], 'cap-green');
    expect(p.removed).toEqual(['cap-red']);
    expect(p.candidateVisible).toBe(false);
    expect(p.candidateReason).toBe('visual-pending');
    expect(p.after.mode).toBe('legacy-base');
  });

  it('готовые образы можно покупать, pending — нет', () => {
    for (const [id, slot] of [['i_cap-red', 'HAT'], ['i_glasses-round', 'GLASSES'], ['i_scarf-pl', 'SCARF']] as const) expect(canPurchase({ id, slot })).toEqual({ ok: true, status: 'prerendered' });
    expect(canPurchase({ id: 'i_scarf-ua', slot: 'SCARF' })).toMatchObject({ ok: false, reason: 'visual-pending' });
  });
});

const SKINS = ['costume-street', 'costume-street-red', 'costume-puffer', 'costume-puffer-stripes', 'costume-sherpa', 'costume-duffle'];

describe('скины: цельные дорогие образы (вещи вне прежнего каталога)', () => {
  const by = (id: string) => LOOK_MANIFEST.items.find((i) => i.id === id)!;

  it('шесть скинов: цельная картинка, легендарные, занимают всю одежду кроме рюкзака, рюкзак — на картинке', () => {
    for (const id of SKINS) {
      const it = by(id);
      expect(it, id).toMatchObject({ catalogSlot: 'COSTUME', status: 'legacy-whole-look', rarity: 'legendary', domain: 'beaver' });
      expect([...it.occupies].sort(), id).toEqual(['accessory', 'glasses', 'headwear', 'neck', 'shoes', 'top']);
      expect(it.legacy?.shows, id).toEqual({ backpack: 'backpack-travel' });
      expect(it.legacy?.scene, id).toBeUndefined();
    }
    expect(errors()).toEqual([]);
  });

  it('скин вытесняет кепку, очки, шарф, куртку, кроссовки и флажок, но не рюкзак', () => {
    const r = equip(['cap-red', 'glasses-round', 'scarf-pl', 'jacket-denim', 'sneakers-white', 'flag-pl', 'backpack-travel'], 'costume-street');
    expect(r.evicted).toEqual(['cap-red', 'flag-pl', 'glasses-round', 'jacket-denim', 'scarf-pl', 'sneakers-white']);
    expect(r.equipment).toEqual(['backpack-travel', 'costume-street']);
    // два скина не носят вместе
    expect(equip(['costume-puffer'], 'costume-duffle').evicted).toEqual(['costume-puffer']);
  });

  it('образ со скином — цельная картинка скина, рюкзак на ней виден, готовые образы закрыты', () => {
    for (const id of SKINS) {
      const look = resolveLook(null, [id, 'backpack-travel']);
      expect(look.mode, id).toBe('legacy-costume');
      expect(look.layers.map((l) => l.asset), id).toEqual([`costumes/${id.replace('costume-', '')}`]);
      expect(look.drawn, id).toEqual(['backpack-travel', id]);
      expect(look.pending, id).toEqual([]);
    }
    // при данных со старым конфликтом скин побеждает кепку
    const old = resolveLook(null, ['costume-sherpa', 'cap-red']);
    expect(old.items.find((o) => o.id === 'cap-red')).toMatchObject({ drawn: false, reason: 'slot-conflict', by: 'costume-sherpa' });
  });

  it('картинки скинов лежат на диске: главный файл, @256, @512, @1024', () => {
    for (const id of SKINS) {
      const name = id.replace('costume-', '');
      for (const file of [`costumes/${name}.webp`, `costumes/${name}@256.webp`, `costumes/${name}@512.webp`, `costumes/${name}@1024.webp`]) expect(exists(file), file).toBe(true);
    }
  });

  it('покупка: скины продаются за Złotki, а не только как награда', () => {
    for (const id of SKINS) expect(canPurchase({ id: `i_${id}`, slot: 'COSTUME' }), id).toEqual({ ok: true, status: 'legacy-whole-look' });
  });

  it('примерка скина поверх полного набора показывает, что снимется', () => {
    const p = tryOn(['cap-red', 'glasses-round', 'scarf-pl', 'backpack-travel'], 'costume-puffer');
    expect(p.candidateVisible).toBe(true);
    expect(p.removed).toEqual(['cap-red', 'glasses-round', 'scarf-pl']);
    expect(p.after.mode).toBe('legacy-costume');
  });
});

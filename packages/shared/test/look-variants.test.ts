/**
 * Готовые образы Бобека (ADR-008): таблица «набор вещей → картинка», режим `variant` резолвера, файлы на диске.
 * Стартовый набор (худи + рюкзак) остаётся цельным образом с 14 позами — это проверено отдельно.
 */
import { existsSync } from 'node:fs';
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

describe('готовые образы: таблица', () => {
  it('полная сетка: все 16 сочетаний четырёх вещей, у каждого есть поза wave, поза open — у 8; плюс 5 образов с куртками (вторая и третья партии)', () => {
    expect(LOOK_VARIANTS.list).toHaveLength(21);
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
    const look = resolveLook(null, ['vest-krakowiak', 'cap-red']);
    expect(look.mode).toBe('variant');
    expect(look.slots.top).toEqual({ wanted: 'vest-krakowiak', shown: 'hoodie-red', outcome: 'pending' });
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

describe('готовые образы: куртки (вторая партия, частичная сетка)', () => {
  const SETS: [string[], string][] = [
    [['jacket-denim', 'backpack-travel'], 'variants/hoodie-denim-pack_wave'],
    [['jacket-denim', 'cap-red', 'glasses-round', 'backpack-travel'], 'variants/hoodie-denim-cap-glasses-pack_wave'],
    [['jacket-rain', 'backpack-travel'], 'variants/hoodie-rain-pack_wave'],
    [['jacket-rain', 'glasses-round', 'backpack-travel'], 'variants/hoodie-rain-glasses-pack_wave'],
    [['jacket-rain', 'cap-red', 'glasses-round', 'backpack-travel'], 'variants/hoodie-rain-cap-glasses-pack_wave'],
  ];

  it('пять сочетаний есть: куртка заменяет худи в данных, но худи остаётся «подкладкой» картинки', () => {
    for (const [set, asset] of SETS) {
      const look = resolveLook(null, set);
      expect(look.mode, set.join('+')).toBe('variant');
      expect(look.layers.map((l) => l.asset), set.join('+')).toEqual([asset]);
      expect(look.drawn, set.join('+')).toEqual([...set].sort());
      expect(look.pending, set.join('+')).toEqual([]);
      const jacket = set.find((id) => id.startsWith('jacket-'))!;
      expect(look.slots.top, set.join('+')).toEqual({ wanted: jacket, shown: jacket, outcome: 'drawn' });
    }
  });

  it('сочетания нет: рисуется образ с курткой, остальное — no-variant (куртка важнее рюкзака и очков)', () => {
    // джинсовая + очки + рюкзак (без кепки): точного нет; «куртка + рюкзак» и «очки + рюкзак» одного размера — побеждает куртка
    const look = resolveLook(null, ['jacket-denim', 'glasses-round', 'backpack-travel']);
    expect(look.mode).toBe('variant');
    expect(look.layers.map((l) => l.asset)).toEqual(['variants/hoodie-denim-pack_wave']);
    expect(look.drawn).toEqual(['backpack-travel', 'jacket-denim']);
    expect(look.items.find((o) => o.id === 'glasses-round')).toMatchObject({ drawn: false, reason: 'no-variant' });
    // джинсовая + кепка + рюкзак (без очков): «кепка + рюкзак» по алфавиту стоит раньше, но куртка важнее — рисуется куртка
    const cap = resolveLook(null, ['jacket-denim', 'cap-red', 'backpack-travel']);
    expect(cap.layers.map((l) => l.asset)).toEqual(['variants/hoodie-denim-pack_wave']);
    expect(cap.items.find((o) => o.id === 'cap-red')).toMatchObject({ drawn: false, reason: 'no-variant' });
    // дождевик + кепка + рюкзак (без очков): «кепка + рюкзак» по алфавиту раньше, но куртка важнее
    const rainCap = resolveLook(null, ['jacket-rain', 'cap-red', 'backpack-travel']);
    expect(rainCap.layers.map((l) => l.asset)).toEqual(['variants/hoodie-rain-pack_wave']);
    // шарф поверх дождевика с очками: образ «дождевик + очки + рюкзак», шарф не нарисован
    const scarf = resolveLook(null, ['jacket-rain', 'glasses-round', 'scarf-pl', 'backpack-travel']);
    expect(scarf.layers.map((l) => l.asset)).toEqual(['variants/hoodie-rain-glasses-pack_wave']);
    expect(scarf.items.find((o) => o.id === 'scarf-pl')).toMatchObject({ drawn: false, reason: 'no-variant' });
    // без рюкзака: образ с курткой без рюкзака тоже нет — берётся «худи», куртка не нарисована
    const bare = resolveLook(null, ['jacket-denim']);
    expect(bare.layers.map((l) => l.asset)).toEqual(['variants/hoodie_wave']);
    expect(bare.items.find((o) => o.id === 'jacket-denim')).toMatchObject({ drawn: false, reason: 'no-variant' });
  });

  it('примерка шарфа поверх джинсовой куртки: честно «не видно», образ остаётся с курткой', () => {
    const p = tryOn(['jacket-denim', 'backpack-travel'], 'scarf-pl', { inventory: ['hoodie-red', 'jacket-denim', 'scarf-pl', 'backpack-travel'] });
    expect(p.candidateVisible).toBe(false);
    expect(p.candidateReason).toBe('no-variant');
    expect(p.after.layers.map((l) => l.asset)).toEqual(['variants/hoodie-denim-pack_wave']);
  });

  it('примерка куртки поверх кепки: куртка вытесняет худи только в данных, кепка остаётся', () => {
    const p = tryOn(['cap-red', 'glasses-round', 'backpack-travel'], 'jacket-denim', { inventory: ['hoodie-red', 'cap-red', 'glasses-round', 'jacket-denim', 'backpack-travel'] });
    expect(p.candidateVisible).toBe(true);
    expect(p.after.layers.map((l) => l.asset)).toEqual(['variants/hoodie-denim-cap-glasses-pack_wave']);
    expect(p.removed).toEqual([]);
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
    expect(canPurchase({ id: 'i_vest-krakowiak', slot: 'JACKET' })).toMatchObject({ ok: false, reason: 'visual-pending' });
  });

  it('все картинки курток лежат на диске: главный файл, @512 и @256', () => {
    for (const v of LOOK_VARIANTS.list.filter((x) => x.items.some((id) => JACKETS.includes(id)))) {
      const asset = v.images.wave!;
      for (const file of [`${asset}.webp`, `${asset}@512.webp`, `${asset}@256.webp`]) expect(exists(file), file).toBe(true);
    }
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

/**
 * Готовые образы Бобека (ADR-008): таблица «набор вещей → картинка», режим `variant` резолвера, файлы на диске.
 * Стартовый набор (худи + рюкзак) остаётся цельным образом с 14 позами — это проверено отдельно.
 */
import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  LOOK_MANIFEST,
  LOOK_VARIANTS,
  LOOK_VARIANT_AXES,
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
const STARTER_SET = ['backpack-travel'];
const subsets = <T,>(xs: readonly T[]): T[][] => xs.reduce<T[][]>((acc, x) => [...acc, ...acc.map((s) => [...s, x])], [[]]);
const byId = (id: string): LookVariant => LOOK_VARIANTS.list.find((v) => v.id === id)!;
const errors = (m?: LookManifest) => validateManifest(m).filter((i) => i.level === 'error');
const codes = (m: LookManifest) => errors(m).map((i) => i.code);
const withVariants = (list: readonly LookVariant[]): LookManifest => ({ ...LOOK_MANIFEST, variants: { ...LOOK_VARIANTS, list } });

describe('готовые образы: таблица', () => {
  it('все 16 сочетаний четырёх вещей, у каждого есть поза wave, поза open — у 8', () => {
    expect(LOOK_VARIANTS.list).toHaveLength(16);
    const keys = LOOK_VARIANTS.list.map((v) => v.items.join('+'));
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
    for (const id of [...AXES, 'hoodie-red']) expect(LOOK_MANIFEST.items.find((i) => i.id === id)?.status, id).toBe('prerendered');
  });

  it('проверка ловит расхождения таблицы с каталогом', () => {
    const cap = byId('hoodie-cap');
    // предмет есть в образах, но он pending
    const pendingCap = { ...LOOK_MANIFEST, items: LOOK_MANIFEST.items.map((i) => (i.id === 'cap-red' ? { ...i, status: 'pending' as const } : i)) };
    expect(codes(pendingCap)).toContain('variant-item');
    // prerendered без образа
    expect(codes(withVariants(LOOK_VARIANTS.list.filter((v) => !v.items.includes('scarf-pl'))))).toContain('variant-missing');
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

  it('для каждого из 16 наборов рисуется ровно этот набор и именно его картинка', () => {
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
    const look = resolveLook(null, ['jacket-denim', 'cap-red']);
    expect(look.mode).toBe('variant');
    expect(look.slots.top).toEqual({ wanted: 'jacket-denim', shown: 'hoodie-red', outcome: 'pending' });
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

import { describe, expect, it } from 'vitest';
import {
  LOOK_BASE_VERSION,
  LOOK_MANIFEST,
  LOOK_WEAR_SLOTS,
  canPurchase,
  canShowItem,
  equip,
  layerDataAttributes,
  lookDataAttributes,
  missingForMilestone,
  resolveLook,
  tryOn,
  unequip,
  validateManifest,
  type LookItem,
  type LookLayer,
  type LookManifest,
} from '../src';

const STARTER = ['hoodie-red', 'backpack-travel', 'bed-basic'];
/** Правила для вещей без картинки. Настоящих курток и костюмов без картинки после пакета владельца 2026-11-04 нет — проверяем на вымышленных. */
const FUTURE: LookManifest = {
  ...LOOK_MANIFEST,
  items: [
    ...LOOK_MANIFEST.items,
    { id: 'vest-future', catalogSlot: 'JACKET', domain: 'beaver', occupies: ['top'], rarity: 'epic', status: 'pending', fallback: 'hide', compatibility: null, layers: [], replaces: ['torso'] },
    { id: 'costume-future', catalogSlot: 'COSTUME', domain: 'beaver', occupies: ['body'], rarity: 'epic', status: 'pending', fallback: 'hide', compatibility: null, layers: [] },
  ] as LookItem[],
};
const errors = (m?: LookManifest) => validateManifest(m).filter((i) => i.level === 'error');

describe('образ: маніфест поточного стану', () => {
  it('маніфест без помилок', () => {
    expect(errors()).toEqual([]);
  });

  it('шарової бази ще немає: усе малюється цілісними картинками', () => {
    expect(LOOK_MANIFEST.base.status).toBe('pending');
    expect(LOOK_MANIFEST.base.layers).toHaveLength(0);
    expect(LOOK_MANIFEST.items.filter((i) => i.status === 'ready' && i.domain === 'beaver')).toEqual([]);
  });

  it('худі, рюкзак, кепка, окуляри й шарф — готові образи; костюми й нагороди міст — legacy-whole-look; решта — pending', () => {
    const by = (id: string) => LOOK_MANIFEST.items.find((i) => i.id === id)!;
    for (const id of ['hoodie-red', 'backpack-travel', 'cap-red', 'glasses-round', 'scarf-pl']) expect(by(id).status, id).toBe('prerendered');
    expect(LOOK_MANIFEST.legacyBase.includes).toEqual({ top: 'hoodie-red', backpack: 'backpack-travel' });
    const legacyCostumes = LOOK_MANIFEST.items.filter((i) => i.legacy).map((i) => i.id).sort();
    expect(legacyCostumes).toEqual([
      'costume-artist', 'costume-barista', 'costume-chef', 'costume-conductor', 'costume-dragon', 'costume-duffle', 'costume-krasnal', 'costume-puffer', 'costume-puffer-stripes', 'costume-sherpa',
      'costume-street', 'costume-street-red', 'costume-syrenka', 'costume-winter', 'hat-krasnal', 'obwarzanek', 'vest-krakowiak',
    ]);
    for (const id of ['costume-syrenka', 'hat-krasnal', 'vest-krakowiak', 'obwarzanek']) expect(by(id)).toMatchObject({ status: 'legacy-whole-look', catalogSlot: 'COSTUME' });
    for (const id of ['cap-green', 'glasses-sun', 'scarf-ua', 'sneakers-white']) expect(by(id).status, id).toBe('pending');
    for (const id of ['jacket-denim', 'jacket-rain']) expect(by(id).status, id).toBe('prerendered');
  });

  it('костюм не займає слот рюкзака', () => {
    for (const c of LOOK_MANIFEST.items.filter((i) => i.catalogSlot === 'COSTUME')) expect(c.occupies, c.id).not.toContain('backpack');
  });

  it('список відсутніх ассетів еталона детермінований і непорожній', () => {
    const a = missingForMilestone('etalon-1');
    expect(a).toEqual(missingForMilestone('etalon-1'));
    expect(a.filter((x) => x.owner === 'base').map((x) => `${x.part}@${x.pose}`)).toEqual([
      'shadow@*', 'tail@*', 'legs@front-idle', 'legs@front-wave', 'torso@front-idle', 'torso@front-wave',
      'ears@*', 'head@*', 'tuft@*', 'face@front-idle', 'face@front-wave',
    ]);
    expect(new Set(a.map((x) => x.owner))).toEqual(new Set(['base', 'hoodie-red', 'cap-red', 'backpack-travel', 'sneakers-white']));
    expect(missingForMilestone('nope')).toEqual([]);
  });
});

describe('образ: конфлікти слотів', () => {
  it('один предмет на слот: нова кепка знімає стару', () => {
    const r = equip(['cap-red', 'backpack-travel'], 'cap-green');
    expect(r).toMatchObject({ equipment: ['backpack-travel', 'cap-green'], evicted: ['cap-red'], changed: true, status: 'pending' });
  });

  it('комбінезон займає кілька слотів: знімає верх і головний убір, рюкзак лишає', () => {
    const r = equip(['hoodie-red', 'cap-red', 'backpack-travel', 'glasses-round'], 'costume-dragon');
    expect(r.evicted).toEqual(['cap-red', 'hoodie-red']);
    expect(r.equipment).toEqual(['backpack-travel', 'costume-dragon', 'glasses-round']);
  });

  it('костюм кухаря + поварський ковпак сумісні, куртка знімає костюм', () => {
    expect(equip(['costume-chef'], 'hat-chef').evicted).toEqual([]);
    const r = equip(['costume-chef', 'hat-chef'], 'jacket-denim');
    expect(r.evicted).toEqual(['costume-chef']);
    expect(r.equipment).toEqual(['hat-chef', 'jacket-denim']);
  });

  it('шарф конфліктує з костюмом, у якого є власний шарф', () => {
    expect(equip(['costume-artist'], 'scarf-pl').evicted).toEqual(['costume-artist']);
    expect(equip(['costume-barista'], 'scarf-pl').evicted).toEqual([]);
  });

  it('equip/unequip не мутують вхід; невідомі ключі зберігаються', () => {
    const current = Object.freeze(['cap-red', 'future-item']);
    const r = equip(current, 'beanie-blue');
    expect(current).toEqual(['cap-red', 'future-item']);
    expect(r.equipment).toEqual(['beanie-blue', 'future-item']);
    const u = unequip(current, 'i_cap-red');
    expect(u).toEqual({ equipment: ['future-item'], changed: true, removed: 'cap-red' });
    expect(unequip(current, 'glasses-sun').changed).toBe(false);
  });

  it('невідомий предмет не надягається і не ламає', () => {
    expect(equip(['cap-red'], 'hat-from-future')).toMatchObject({ equipment: ['cap-red'], changed: false, item: null, error: 'unknown-item' });
  });

  it('старий формат wear і id з БД дають той самий результат', () => {
    expect(equip({ HAT: 'cap-red', BACKPACK: 'backpack-travel' }, 'i_cap-green')).toEqual(equip(['i_backpack-travel', 'cap-red'], 'cap-green'));
  });
});

describe('образ: resolveLook на поточних ассетах', () => {
  it('стартовий Бобек: цілісний базовий образ, худі фірмове, рюкзак надітий', () => {
    const look = resolveLook(STARTER, { BACKPACK: 'backpack-travel' });
    expect(look.mode).toBe('legacy-base');
    expect(look.layers).toEqual([{ id: 'legacy-base:greet', asset: 'beaver/greet', owner: 'legacy-base', slot: 'base', z: 0, fit: 'contain', rect: null }]);
    expect(look.drawn).toEqual(['backpack-travel', 'hoodie-red']);
    expect(look.defaults).toEqual(['hoodie-red']);
    expect(look.slots.top).toEqual({ wanted: null, shown: 'hoodie-red', outcome: 'default' });
    expect(look.slots.backpack.outcome).toBe('drawn');
    expect(look.legacy).toBe(true);
    expect(look.poseFallback).toBe(false);
  });

  it('стан → поза; пози без картинки показують запасну з позначкою', () => {
    expect(resolveLook(STARTER, ['backpack-travel'], { mood: 'cheer' }).layers[0].asset).toBe('beaver/correct');
    // Позы владельца 2026-10-31: у сна, удивления, «объясняет» и пяти новых состояний — своя картинка.
    for (const [mood, asset] of [['sleep', 'sleep'], ['surprised', 'surprised'], ['explain', 'idea'], ['coffee', 'coffee'], ['pay', 'pay'], ['parcel', 'parcel'], ['tired', 'tired'], ['laptop', 'laptop']]) {
      const r = resolveLook(STARTER, ['backpack-travel'], { mood });
      expect(r.layers[0].asset, mood).toBe(`beaver/${asset}`);
      expect(r.poseFallback, mood).toBe(false);
    }
    const royal = resolveLook(STARTER, ['backpack-travel'], { mood: 'royal' });
    expect(royal.layers[0].asset).toBe('beaver/greet');
    expect(royal.poseFallback).toBe(true);
    expect(resolveLook(STARTER, ['backpack-travel'], { view: 'back' }).layers[0].asset).toBe('beaver/back');
    for (const mood of ['constructor', '__proto__', 'toString', 'nope']) {
      const r = resolveLook(STARTER, ['backpack-travel'], { mood });
      expect(r.layers[0].asset, mood).toBe('beaver/greet');
      expect(r.poseFallback, mood).toBe(true);
    }
  });

  it('річ без живописного шару — pending: не малюється, слот позначено', () => {
    const look = resolveLook([...STARTER, 'cap-green'], ['backpack-travel', 'cap-green']);
    expect(look.pending).toEqual(['cap-green']);
    expect(look.drawn).not.toContain('cap-green');
    expect(look.slots.headwear).toEqual({ wanted: 'cap-green', shown: null, outcome: 'pending' });
    expect(look.layers.some((l) => l.owner === 'cap-green')).toBe(false);
    expect(look.key).not.toContain('cap-green');
    expect(look.items.find((o) => o.id === 'cap-green')).toEqual({ id: 'cap-green', status: 'pending', drawn: false, reason: 'visual-pending' });
  });

  it('pending-куртка: худі з картинки — не підміна, а явна позначка extraneous', () => {
    const look = resolveLook(null, ['vest-future', 'backpack-travel'], { manifest: FUTURE });
    expect(look.slots.top).toEqual({ wanted: 'vest-future', shown: 'hoodie-red', outcome: 'pending' });
    expect(look.extraneous).toEqual([{ slot: 'top', id: 'hoodie-red' }]);
    expect(look.drawn).toEqual(['backpack-travel']);
  });

  it('legacy-костюм позначений і закриває решту; річ з картинки рахується видимою', () => {
    const look = resolveLook(null, { COSTUME: 'costume-chef', HAT: 'hat-chef', GLASSES: 'glasses-sun', BACKPACK: 'backpack-travel' });
    expect(look.mode).toBe('legacy-costume');
    expect(look.baseRef).toBe('legacy:costume-chef');
    expect(look.layers).toEqual([{ id: 'legacy:costume-chef', asset: 'costumes/chef', owner: 'costume-chef', slot: 'base', z: 0, fit: 'contain', rect: null }]);
    expect(look.legacy).toBe(true);
    expect(look.drawn).toEqual(['costume-chef', 'hat-chef']);
    expect(look.pending).toEqual(['glasses-sun']);
    expect(look.hidden).toEqual([{ id: 'backpack-travel', status: 'prerendered', drawn: false, reason: 'covered-by-whole-look', by: 'costume-chef' }]);
    const noHat = resolveLook(null, ['costume-chef']);
    expect(noHat.extraneous).toEqual([{ slot: 'headwear', id: 'hat-chef' }]);
    expect(noHat.slots.headwear.outcome).toBe('extraneous');
  });

  it('костюм без живописної картинки не малюється, покупка/володіння не губиться', () => {
    const look = resolveLook(['costume-future', ...STARTER], ['costume-future', 'backpack-travel'], { manifest: FUTURE });
    expect(look.mode).toBe('legacy-base');
    expect(look.equipped).toContain('costume-future');
    expect(look.pending).toEqual(['costume-future']);
    expect(look.slots.top.outcome).toBe('pending');
    expect(look.defaults).toEqual([]);
  });

  it('конфлікт у старих даних сервера: костюм перемагає куртку детерміновано', () => {
    const look = resolveLook(null, { COSTUME: 'costume-chef', JACKET: 'jacket-denim' });
    expect(look.items.find((o) => o.id === 'jacket-denim')).toMatchObject({ reason: 'slot-conflict', by: 'costume-chef' });
    expect(look.equipped).toEqual(['costume-chef']);
  });

  it('не у власності — не малюється', () => {
    const look = resolveLook(STARTER, ['backpack-travel', 'costume-dragon']);
    expect(look.mode).toBe('legacy-base');
    expect(look.hidden.map((h) => [h.id, h.reason])).toEqual([['costume-dragon', 'not-owned']]);
  });

  it('невідомі й сміттєві ключі не ламають', () => {
    const look = resolveLook(null, { HAT: 'hat-from-future', SCARF: 'none', GLASSES: '', JACKET: null, SHOES: undefined, BACKPACK: 'i_backpack-travel' });
    expect(look.unknown).toEqual(['hat-from-future']);
    expect(look.equipped).toEqual(['backpack-travel']);
    expect(() => resolveLook(null, [1, null, 'x'] as never)).not.toThrow();
    expect(resolveLook(null, [1, null, 'x'] as never).unknown).toEqual(['x']);
  });

  it('детермінованість: порядок і формат входу не впливають', () => {
    const a = resolveLook(STARTER, ['cap-red', 'backpack-travel', 'glasses-sun'], { mood: 'think' });
    const b = resolveLook([...STARTER].reverse(), { GLASSES: 'glasses-sun', HAT: 'i_cap-red', BACKPACK: 'backpack-travel' }, { mood: 'think' });
    expect(b).toEqual(a);
    expect(resolveLook(STARTER, ['cap-red', 'backpack-travel', 'glasses-sun'], { mood: 'think' })).toEqual(a);
    expect(a.key).toBe('look1|legacy-base|legacy-base|front|think|backpack-travel+hoodie-red');
  });

  it('рамки профілю прибрані з гри: у старих даних вони — невідомі ключі, Бобека не ламають', () => {
    const look = resolveLook(null, ['frame-gold', 'frame-green', 'backpack-travel']);
    expect(look.unknown).toEqual(['frame-gold', 'frame-green']);
    expect(look.equipped).not.toContain('frame-gold');
    expect(look.drawn).not.toContain('frame-gold');
    expect(look.drawn).toContain('backpack-travel');
  });

  it('без фірмового образу худі з картинки позначено extraneous', () => {
    const look = resolveLook(STARTER, ['backpack-travel'], { signatureDefaults: false });
    expect(look.defaults).toEqual([]);
    expect(look.slots.top.outcome).toBe('extraneous');
  });
});

describe('образ: tryOn', () => {
  it('примірка не змінює вихідний образ і нічого не зберігає', () => {
    const current = Object.freeze(['backpack-travel']);
    const before = resolveLook(STARTER, current);
    const p = tryOn(current, 'costume-barista', { inventory: STARTER });
    expect(current).toEqual(['backpack-travel']);
    expect(p.persisted).toBe(false);
    expect(p.before).toEqual(before);
    expect(resolveLook(STARTER, current)).toEqual(before);
    expect(p.after.preview).toBe(true);
    expect(p.before.preview).toBe(false);
  });

  it('показує саме обрану річ: legacy-костюм видно', () => {
    const p = tryOn(['backpack-travel'], 'costume-barista', { inventory: STARTER });
    expect(p.candidateVisible).toBe(true);
    expect(p.after.mode).toBe('legacy-costume');
    expect(p.after.layers.map((l) => l.asset)).toEqual(['costumes/barista']);
    expect(p.added).toEqual(['costume-barista']);
    expect(p.removed).toEqual([]);
    expect(p.changedSlots).toEqual(expect.arrayContaining(['top', 'accessory']));
  });

  it('річ без шару: примірка чесно каже «не видно», а не малює іншу', () => {
    const p = tryOn(['backpack-travel'], 'vest-future', { inventory: [...STARTER, 'vest-future'], manifest: FUTURE });
    expect(p.candidateVisible).toBe(false);
    expect(p.candidateReason).toBe('visual-pending');
    expect(p.after.drawn).not.toContain('vest-future');
    expect(p.after.slots.top).toEqual({ wanted: 'vest-future', shown: 'hoodie-red', outcome: 'pending' });
  });

  it('примірка показує, що зніметься', () => {
    const p = tryOn(['hoodie-red', 'cap-red', 'backpack-travel'], 'costume-dragon');
    expect(p.removed).toEqual(['cap-red', 'hoodie-red']);
    expect(p.equipment).toEqual(['backpack-travel', 'costume-dragon']);
  });

  it('вже надіте й невідоме', () => {
    const same = tryOn(['backpack-travel'], 'backpack-travel', { inventory: STARTER });
    expect(same).toMatchObject({ added: [], removed: [], changedSlots: [], candidateVisible: true });
    const unk = tryOn(['backpack-travel'], 'hat-from-future');
    expect(unk).toMatchObject({ known: false, candidateVisible: false, candidateReason: 'unknown-item', equipment: ['backpack-travel'] });
  });
});

describe('образ: політика покупки й показу', () => {
  it('не продаємо те, що не можна показати', () => {
    expect(canPurchase({ id: 'i_cap-green', slot: 'HAT' })).toEqual({ ok: false, reason: 'visual-pending', status: 'pending' });
    expect(canPurchase({ id: 'i_cap-red', slot: 'HAT' })).toEqual({ ok: true, status: 'prerendered' });
    expect(canPurchase({ id: 'i_costume-artist', slot: 'COSTUME' })).toEqual({ ok: true, status: 'legacy-whole-look' });
  });

  it('домик, вже куплене, невідоме й розбіжність слота', () => {
    expect(canPurchase({ id: 'i_desk', slot: 'FURNITURE' })).toEqual({ ok: true, status: 'not-wearable' });
    expect(canPurchase({ id: 'i_costume-winter', slot: 'COSTUME' }, { inventory: ['i_costume-winter'] })).toMatchObject({ ok: false, reason: 'already-owned' });
    expect(canPurchase({ id: 'i_hat-from-future', slot: 'HAT' })).toMatchObject({ ok: false, reason: 'unknown-wearable' });
    expect(canPurchase({ id: 'i_cap-red', slot: 'SHOES' })).toMatchObject({ ok: false, reason: 'slot-mismatch' });
    expect(canPurchase({ id: 'i_x', slot: 'SPACESHIP' })).toMatchObject({ ok: false, reason: 'unknown-slot' });
  });

  it('canShowItem', () => {
    expect(canShowItem('costume-chef')).toBe(true);
    expect(canShowItem('hoodie-red')).toBe(true);
    expect(canShowItem('cap-red')).toBe(true);
    expect(canShowItem('glasses-sun')).toBe(false);
    expect(canShowItem('nope')).toBe(false);
  });
});

describe('образ: DOM-контракт data-look', () => {
  it('атрибути кореня й шару', () => {
    const look = resolveLook([...STARTER, 'cap-green'], ['backpack-travel', 'cap-green'], { mood: 'wave' });
    expect(lookDataAttributes(look)).toEqual({
      'data-look': 'look1|legacy-base|legacy-base|front|wave|backpack-travel+hoodie-red',
      'data-look-mode': 'legacy-base',
      'data-look-base': 'legacy-base',
      'data-look-view': 'front',
      'data-look-pose': 'wave',
      'data-look-equipped': 'backpack-travel cap-green',
      'data-look-items': 'backpack-travel hoodie-red',
      'data-look-pending': 'cap-green',
      'data-look-hidden': '',
      'data-look-legacy': 'true',
      'data-look-preview': 'false',
    });
    expect(layerDataAttributes(look.layers[0])).toEqual({ 'data-look-layer': 'legacy-base:wave', 'data-look-slot': 'base', 'data-look-owner': 'legacy-base' });
  });
});

// ───────── Шаровий режим на синтетичному маніфесті (база ще не намальована) ─────────

const R = (x: number, y: number, w: number, h: number) => ({ x, y, w, h });
const L = (id: string, part: string, slot: LookLayer['slot'], band: LookLayer['band'], poses: LookLayer['poses'], rect: ReturnType<typeof R>, extra: Partial<LookLayer> = {}): LookLayer => ({
  id, part, slot, view: 'front', poses, band, asset: `look/front/${id}`, rect, ...extra,
});
const BASE_LAYERS: LookLayer[] = [
  L('base:shadow', 'shadow', 'base', 'shadow', '*', R(300, 930, 424, 60)),
  L('base:tail', 'tail', 'base', 'tail', '*', R(180, 700, 260, 260)),
  L('base:legs:idle', 'legs', 'base', 'legs', ['front-idle'], R(380, 760, 264, 220)),
  L('base:legs:wave', 'legs', 'base', 'legs', ['front-wave'], R(380, 760, 264, 220)),
  L('base:torso:idle', 'torso', 'base', 'torso', ['front-idle'], R(300, 520, 424, 330)),
  L('base:torso:wave', 'torso', 'base', 'torso', ['front-wave'], R(300, 330, 520, 520)),
  L('base:ears', 'ears', 'base', 'head', '*', R(280, 100, 470, 140), { z: -1 }),
  L('base:head', 'head', 'base', 'head', '*', R(290, 90, 444, 460)),
  L('base:tuft', 'tuft', 'base', 'head', '*', R(470, 70, 90, 60), { z: 1 }),
  L('base:face:idle', 'face', 'base', 'face', ['front-idle'], R(380, 260, 264, 220)),
  L('base:face:wave', 'face', 'base', 'face', ['front-wave'], R(380, 260, 264, 220)),
];
const compat = { baseVersion: LOOK_BASE_VERSION, views: ['front'] as const };
const READY: Record<string, Partial<LookItem>> = {
  'hoodie-red': {
    status: 'ready', fallback: 'hide', compatibility: compat, replaces: ['torso'],
    layers: [
      L('hoodie-red:torso:idle', 'torso', 'top', 'torso', ['front-idle'], R(290, 510, 444, 350)),
      L('hoodie-red:torso:wave', 'torso', 'top', 'torso', ['front-wave'], R(290, 320, 540, 540)),
    ],
  },
  'cap-red': {
    status: 'ready', fallback: 'hide', compatibility: compat, hides: ['tuft'],
    layers: [L('cap-red:hat', 'hat', 'headwear', 'headwear', '*', R(0, 0, 300, 200), { placement: 'anchored', anchor: 'head-top', pivot: { x: 150, y: 170 } })],
  },
  camera: {
    status: 'ready', fallback: 'hide', compatibility: compat,
    layers: [L('camera:prop', 'prop', 'accessory', 'held-prop', '*', R(0, 0, 120, 90), { placement: 'anchored', anchor: 'paw-r', pivot: { x: 60, y: 45 } })],
  },
};
function layeredManifest(ready = READY): LookManifest {
  // Шарова модель вже не плануємо (ADR-008), але резолвер її підтримує: перевіряємо на синтетичному маніфесті без готових образів.
  // Рюкзак тут — предмет, що існує лише впечатаним у цілісну картинку (legacy-only), як було до готових образів.
  const withoutVariants = (it: LookItem): LookItem =>
    it.id === 'backpack-travel' ? { ...it, status: 'legacy-whole-look', fallback: 'legacy-base' } : it.status === 'prerendered' ? { ...it, status: 'pending' } : it;
  return {
    ...LOOK_MANIFEST,
    variants: undefined,
    base: { ...LOOK_MANIFEST.base, status: 'ready', layers: BASE_LAYERS },
    items: LOOK_MANIFEST.items.map((it) => (ready[it.id] ? ({ ...it, ...ready[it.id] } as LookItem) : withoutVariants(it))),
  };
}

describe('образ: шаровий режим (синтетична база)', () => {
  const M = layeredManifest();

  it('синтетичний маніфест проходить перевірку', () => {
    expect(errors(M)).toEqual([]);
  });

  it('худі замінює тулуб бази, кепка ховає чубчик, морда — завжди з бази', () => {
    const look = resolveLook(null, ['hoodie-red', 'cap-red'], { manifest: M });
    expect(look.mode).toBe('layered');
    expect(look.baseRef).toBe(LOOK_BASE_VERSION);
    const ids = look.layers.map((l) => l.id);
    expect(ids).not.toContain('base:torso:idle');
    expect(ids).not.toContain('base:tuft');
    expect(ids).toContain('hoodie-red:torso:idle');
    expect(ids).toContain('base:face:idle');
    // z-порядок: тінь першою, кепка над головою й мордою.
    expect(ids[0]).toBe('base:shadow');
    expect(ids.indexOf('cap-red:hat')).toBeGreaterThan(ids.indexOf('base:face:idle'));
    expect(look.layers.map((l) => l.z)).toEqual([...look.layers.map((l) => l.z)].sort((a, b) => a - b));
  });

  it('одяг не змінює морду: шари голови й обличчя однакові з одягом і без', () => {
    const face = (eq: string[]) => resolveLook(null, eq, { manifest: M, signatureDefaults: false }).layers.filter((l) => l.owner === 'base' && /head|face|ears/.test(l.id));
    expect(face(['hoodie-red'])).toEqual(face([]));
    expect(face(['hoodie-red', 'camera'])).toEqual(face([]));
  });

  it('один предмет однаковий в усіх позах ракурсу; реквізит іде за лапою', () => {
    const idle = resolveLook(null, ['cap-red', 'camera'], { manifest: M, mood: 'happy' });
    const wave = resolveLook(null, ['cap-red', 'camera'], { manifest: M, mood: 'wave' });
    const cap = (l: typeof idle) => l.layers.find((x) => x.owner === 'cap-red')!;
    expect(cap(idle)).toEqual(cap(wave));
    expect(cap(idle).rect).toEqual({ x: 512 - 150, y: 92 - 170, w: 300, h: 200 });
    const cam = (l: typeof idle) => l.layers.find((x) => x.owner === 'camera')!;
    expect(cam(idle).asset).toBe(cam(wave).asset);
    expect(cam(idle).rect).toEqual({ x: 684 - 60, y: 760 - 45, w: 120, h: 90 });
    expect(cam(wave)).toMatchObject({ rect: { x: 770 - 60, y: 380 - 45, w: 120, h: 90 }, rotate: -20, origin: { x: 60, y: 45 } });
  });

  it('pending у шаровому режимі не малюється', () => {
    const look = resolveLook(null, ['hoodie-red', 'glasses-sun'], { manifest: M });
    expect(look.pending).toEqual(['glasses-sun']);
    expect(look.layers.some((l) => l.owner === 'glasses-sun')).toBe(false);
    expect(look.slots.glasses.outcome).toBe('pending');
  });

  it('стартовий рюкзак ще лише в цілісній картинці → лишаємось у legacy-base, не губимо його', () => {
    expect(resolveLook(null, ['backpack-travel'], { manifest: M }).mode).toBe('legacy-base');
  });

  it('legacy-костюм і в шаровому режимі показується цілісно', () => {
    expect(resolveLook(null, ['costume-winter'], { manifest: M }).mode).toBe('legacy-costume');
  });

  it('перевірка ловить предмет, що малює морду, і варіанти шапки по позах', () => {
    const bad = layeredManifest({
      ...READY,
      'glasses-round': {
        status: 'ready', fallback: 'hide', compatibility: compat,
        layers: [L('glasses-round:glasses', 'glasses', 'glasses', 'face', '*', R(400, 280, 220, 90))],
      },
      'cap-green': {
        status: 'ready', fallback: 'hide', compatibility: compat,
        layers: [
          L('cap-green:hat:idle', 'hat', 'headwear', 'headwear', ['front-idle'], R(360, 0, 300, 200)),
          L('cap-green:hat:wave', 'hat', 'headwear', 'headwear', ['front-wave'], R(360, 0, 300, 200)),
        ],
      },
    });
    const codes = errors(bad).map((i) => `${i.code}:${i.ref}`);
    expect(codes).toContain('touches-face:glasses-round:glasses');
    expect(codes).toContain('per-pose-variant:cap-green');
  });

  it('усі слоти образу присутні в стані слотів', () => {
    const look = resolveLook(null, [], { manifest: M });
    expect(Object.keys(look.slots).sort()).toEqual([...LOOK_WEAR_SLOTS].sort());
  });
});

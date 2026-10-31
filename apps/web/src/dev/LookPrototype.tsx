/**
 * Прототип єдиного Бобека (/__look-prototype): шість кроків власника на справжньому рендерері.
 *   1. стандартне худі → 2. синя куртка → 3. кепка → 4. окуляри → 5. змах лапою → 6. комплект після перезапуску.
 * Образ рахує resolveLook / equip ядра (@polski-go/shared) з маніфестом прототипу, малює BeaverLook — той самий
 * компонент, що й на екранах. Комплект зберігається в localStorage цієї сторінки (у застосунку зберігає сервер:
 * POST /api/inventory/equip, перевірено wardrobe-screens.ts і shop-look.test.ts).
 * Шари прототипу — розкладені існуючі живописні пози, кепка й окуляри намальовані скриптом: це не фінальна модель.
 */
import { useEffect, useMemo, useState } from 'react';
import { equip, resolveLook, unequip, type LookEquipment } from '@polski-go/shared';
import { BeaverLook } from '../components/Beaver';
import { LazyMotion, MotionConfig, loadMotionFeatures } from '../lib/motion';
import { LOOK_PROTOTYPE_MANIFEST as M, PROTO_STATES } from './lookPrototypeManifest';
import { protoAssetUrl } from './protoAssets';
import { hasBobekV2Art, bobekV2AssetUrl } from './lookV2Assets';
import { LOOK_V2_DRAFT_MANIFEST } from './lookV2Manifest';
import { getBobekPreviewSnapshot, notifyBobekPreviewChanged, setBobekPreviewEnabled } from '../lib/bobekPreview';

const STORE = 'pg_look_prototype_v1';
type Saved = { equipment: string[]; state: string; art: 'legacy' | 'v2' };
const DEFAULT: Saved = { equipment: ['hoodie-red', 'backpack-travel'], state: 'idle', art: 'legacy' };

function load(): Saved {
  try {
    const raw = localStorage.getItem(STORE);
    if (!raw) return DEFAULT;
    const v = JSON.parse(raw) as Partial<Saved>;
    return { equipment: Array.isArray(v.equipment) ? v.equipment.filter((x) => typeof x === 'string' && ['hoodie-red', 'jacket-denim', 'backpack-travel', 'cap-red', 'glasses-round'].includes(x)).slice(0, 5) : DEFAULT.equipment, state: PROTO_STATES.some((s) => s.id === v.state) ? v.state! : DEFAULT.state, art: v.art === 'v2' ? 'v2' : 'legacy' };
  } catch {
    return DEFAULT;
  }
}

const STEPS = [
  { n: 1, label: 'Худи', run: (e: LookEquipment) => ({ e: equip(e, 'hoodie-red', M).equipment, state: 'idle' }) },
  { n: 2, label: 'Синяя куртка', run: (e: LookEquipment) => ({ e: equip(e, 'jacket-denim', M).equipment, state: 'idle' }) },
  { n: 3, label: 'Кепка', run: (e: LookEquipment) => ({ e: equip(e, 'cap-red', M).equipment, state: 'idle' }) },
  { n: 4, label: 'Очки', run: (e: LookEquipment) => ({ e: equip(e, 'glasses-round', M).equipment, state: 'idle' }) },
  { n: 5, label: 'Помахать', run: (e: LookEquipment) => ({ e: [...e], state: 'wave' }) },
] as const;

export default function LookPrototype() {
  const [saved, setSaved] = useState<Saved>(load);
  const [appPreview, setAppPreview] = useState(() => getBobekPreviewSnapshot().startsWith('1\n'));

  const [restored] = useState(() => {
    try {
      return localStorage.getItem(STORE) !== null;
    } catch {
      return false;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(STORE, JSON.stringify(saved));
      notifyBobekPreviewChanged();
    } catch {
      /* приватний режим: прототип працює без збереження */
    }
  }, [saved]);

  const mood = PROTO_STATES.find((s) => s.id === saved.state)?.mood ?? 'happy';
  const v2 = saved.art === 'v2' && hasBobekV2Art;
  const activeManifest = v2 ? LOOK_V2_DRAFT_MANIFEST : M;
  const resolveAsset = v2 ? bobekV2AssetUrl : protoAssetUrl;
  const look = useMemo(() => resolveLook(null, saved.equipment, { manifest: activeManifest, mood }), [saved.equipment, activeManifest, mood]);
  const has = (id: string) => look.drawn.includes(id);
  const toggle = (id: string) => setSaved((s) => ({ ...s, equipment: has(id) ? unequip(s.equipment, id, M).equipment : equip(s.equipment, id, M).equipment }));

  return (
    <LazyMotion features={loadMotionFeatures}>
      <MotionConfig reducedMotion="user">
        <main className="mx-auto min-h-screen max-w-xl bg-[var(--bg)] px-4 pb-16 pt-4 text-[var(--text)]" data-look-prototype>
          <h1 className="text-xl font-black leading-tight">Прототип единого Бобека</h1>
          <p className="mt-1 text-[13px] font-semibold text-coral">
            Механика слоёв на временной графике: позы разложены из существующих картинок, синяя «куртка» — перекрашенное худи, кепка и очки
            нарисованы скриптом. Не финальная модель.
          </p>

          <section className="card mt-3 p-3" aria-label="Перевірка образу у застосунку">
            <p className="text-sm font-bold">Перевірити одного Бобека у справжньому POLSKI GO</p>
            <p className="mt-1 text-xs">
              Це окремий QA-режим. Усі Бобеки у фронтальному ракурсі показуватимуть комплект нижче.
              Магазин і серверне вбрання не зміняться. Без QA-режиму користувачі бачать поточний образ.
              Тимчасові графічні шари ще потребують перемалювання.
            </p>
            <button
              className={`btn mt-2 min-h-11 w-full ${appPreview ? 'btn-red' : 'btn-ghost'}`}
              aria-pressed={appPreview}
              data-bobek-preview-toggle
              onClick={() => {
                const next = !appPreview;
                setAppPreview(setBobekPreviewEnabled(next));
              }}
            >
              {appPreview ? 'Вимкнути QA-образ' : 'Увімкнути QA-образ на всіх екранах'}
            </button>
            <a className="btn btn-ghost mt-2 min-h-11 w-full" href="/" data-bobek-preview-open-app>Відкрити застосунок</a>
          </section>

          <section className="card mt-3 p-3" aria-label="Джерело графіки Бобека">
            <p className="font-bold text-sm">Оберіть арт-модель для QA</p>
            <p className="mt-1 text-xs">V2 — авторська SVG/WebP-збірка з окремою основою й двома різними верхами, ще НЕ затверджена за якістю. Не змінює звичайний застосунок без QA-перемикача.</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <button className="btn btn-ghost min-h-11 text-sm" aria-pressed={!v2} data-proto-art="legacy" onClick={() => setSaved((cur) => ({ ...cur, art: 'legacy' }))}>Поточні шари</button>
              <button className="btn btn-ghost min-h-11 text-sm" aria-pressed={v2} data-proto-art="v2" disabled={!hasBobekV2Art} onClick={() => setSaved((cur) => ({ ...cur, art: 'v2' }))}>Новий Бобек V2</button>
            </div>
            {!hasBobekV2Art && <p className="mt-2 text-xs text-coral">V2 поки відсутній у цій збірці. Імпортуйте ZIP з арт-паком та перезберіть застосунок.</p>}
          </section>

          <div className="card mt-3 flex flex-col items-center p-3" data-bobek-demo-card style={{ background: 'linear-gradient(#e9f1fb, #f8f4ec)' }}>
            <BeaverLook look={look} size={240} resolveAsset={resolveAsset} />
            <div className="mt-2 w-full break-words font-mono text-[11px] leading-tight text-[var(--text-muted)]" data-proto-state>
              pose: {look.pose} · drawn: {look.drawn.join(' ')} · layers: {look.layers.length}
              {restored && <span data-proto-restored> · комплект восстановлен после перезапуска</span>}
            </div>
          </div>

          <h2 className="mt-4 text-sm font-black uppercase tracking-wide">Шаги</h2>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {STEPS.map((s) => (
              <button
                key={s.n}
                className="btn btn-ghost min-h-11 justify-start text-left text-sm"
                data-proto-step={s.n}
                onClick={() => setSaved((cur) => {
                  const r = s.run(cur.equipment);
                  return { ...cur, equipment: r.e, state: r.state };
                })}
              >
                {s.n}. {s.label}
              </button>
            ))}
            <button className="btn btn-red min-h-11 text-sm" data-proto-step={6} onClick={() => location.reload()}>
              6. Перезапустить
            </button>
          </div>

          <h2 className="mt-4 text-sm font-black uppercase tracking-wide">Одежда</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {(['hoodie-red', 'jacket-denim', 'cap-red', 'glasses-round'] as const).map((id) => (
              <button key={id} className={`chip min-h-11 ${has(id) ? 'is-selected' : ''}`} aria-pressed={has(id)} data-proto-item={id} onClick={() => toggle(id)}>
                {has(id) ? '✓ ' : ''}
                {id}
              </button>
            ))}
          </div>

          <h2 className="mt-4 text-sm font-black uppercase tracking-wide">Анимация</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {PROTO_STATES.map((s) => (
              <button key={s.id} className={`chip min-h-11 ${saved.state === s.id ? 'is-selected' : ''}`} aria-pressed={saved.state === s.id} data-proto-state-btn={s.id} onClick={() => setSaved((cur) => ({ ...cur, state: s.id }))}>
                {s.label}
              </button>
            ))}
            <span className="chip min-h-11 opacity-70">blink — всегда, раз в ~4,6 с</span>
          </div>

          <h2 className="mt-4 text-sm font-black uppercase tracking-wide">Тот же образ во всех позах</h2>
          <div className="mt-2 grid grid-cols-5 gap-1">
            {PROTO_STATES.map((s) => (
              <div key={s.id} className="flex flex-col items-center">
                <BeaverLook look={resolveLook(null, saved.equipment, { manifest: activeManifest, mood: s.mood })} size={64} animate={false} resolveAsset={resolveAsset} />
                <span className="text-[10px] font-bold">{s.label}</span>
              </div>
            ))}
          </div>

          <button className="btn btn-ghost mt-4 min-h-11 w-full text-sm" onClick={() => setSaved(DEFAULT)}>
            Сбросить к стандартному худи
          </button>
        </main>
      </MotionConfig>
    </LazyMotion>
  );
}

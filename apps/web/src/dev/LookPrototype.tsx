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

const files = import.meta.glob('./look-proto/**/*.webp', { eager: true, import: 'default' }) as Record<string, string>;

/** Ключ шару 'proto/idle/body' → URL: варіант @512, якщо його досить, інакше основний 1024. */
export function protoAssetUrl(key: string, width: number): string | null {
  const path = key.replace(/^proto\//, './look-proto/');
  if (width <= 512 && files[`${path}@512.webp`]) return files[`${path}@512.webp`];
  return files[`${path}.webp`] ?? files[`${path}@512.webp`] ?? null;
}

const STORE = 'pg_look_prototype_v1';
type Saved = { equipment: string[]; state: string };
const DEFAULT: Saved = { equipment: ['hoodie-red', 'backpack-travel'], state: 'idle' };

function load(): Saved {
  try {
    const raw = localStorage.getItem(STORE);
    if (!raw) return DEFAULT;
    const v = JSON.parse(raw) as Partial<Saved>;
    return { equipment: Array.isArray(v.equipment) ? v.equipment.filter((x) => typeof x === 'string') : DEFAULT.equipment, state: typeof v.state === 'string' ? v.state : DEFAULT.state };
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
    } catch {
      /* приватний режим: прототип працює без збереження */
    }
  }, [saved]);

  const mood = PROTO_STATES.find((s) => s.id === saved.state)?.mood ?? 'happy';
  const look = useMemo(() => resolveLook(null, saved.equipment, { manifest: M, mood }), [saved.equipment, mood]);
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

          <div className="card mt-3 flex flex-col items-center p-3" style={{ background: 'linear-gradient(#e9f1fb, #f8f4ec)' }}>
            <BeaverLook look={look} size={240} resolveAsset={protoAssetUrl} />
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
                  return { equipment: r.e, state: r.state };
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
                <BeaverLook look={resolveLook(null, saved.equipment, { manifest: M, mood: s.mood })} size={64} animate={false} resolveAsset={protoAssetUrl} />
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

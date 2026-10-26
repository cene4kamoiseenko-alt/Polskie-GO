/**
 * QA-галерея образу Бобека (лише dev: /__gallery, /__gallery?look; ADR-005 §10, §14.10).
 * Усе малюється тим самим BeaverLook, що й на екранах, з ResolvedLook ядра (@polski-go/shared): кожен стан,
 * ракурс, костюм, речі без живописного шару (pending — «визуал готовится», на Бобеку їх немає), сумісні пари,
 * конфлікти, примірка й масштаби. Атрибути data-look-* — у DOM кожного кореня й продубльовані підписом.
 * ?box — контур блока й полотна (перевірка обрізання), ?dark — темне тло замість шахівниці (перевірка прозорості).
 */
import type { ReactNode } from 'react';
import { LOOK_MANIFEST, LOOK_MOODS, LOOK_VIEWS, resolveLook, tryOn, type LookLegacyWear, type ResolvedLook } from '@polski-go/shared';
import { BeaverLook } from '../components/Beaver';

const STARTER: LookLegacyWear = { BACKPACK: 'backpack-travel' };
const PENDING_NOTE = 'визуал готовится';
const params = new URLSearchParams(location.search);
const BOX = params.has('box');
const CHECKER = params.has('dark')
  ? { background: '#0b1b33' }
  : { background: 'repeating-conic-gradient(#d9dee5 0 25%, #f6f8fa 0 50%) 0 0 / 14px 14px' };

const look = (wear: LookLegacyWear | readonly string[], mood = 'happy', view: 'front' | 'three-quarter' | 'side' | 'back' = 'front') => resolveLook(null, wear, { mood, view });

function Attrs({ l }: { l: ResolvedLook }) {
  return (
    <div className="mt-1 w-full break-words text-left font-mono text-[9px] leading-tight text-[var(--text-muted)]">
      <div>mode: {l.mode} · pose: {l.pose}{l.poseFallback ? ' (запасна)' : ''}</div>
      <div>items: {l.drawn.join(' ') || '—'}</div>
      {l.pending.length > 0 && <div className="font-black text-coral">pending ({PENDING_NOTE}): {l.pending.join(' ')}</div>}
      {l.hidden.length > 0 && <div>hidden: {l.hidden.map((h) => `${h.id}:${h.reason}`).join(' ')}</div>}
      {l.extraneous.length > 0 && <div>на картинці, не надіте: {l.extraneous.map((e) => `${e.slot}=${e.id}`).join(' ')}</div>}
      {l.preview && <div className="font-black text-sky">preview (не збережено)</div>}
    </div>
  );
}

function Tile({ title, l, size = 110, note }: { title: string; l: ResolvedLook; size?: number; note?: string }) {
  return (
    <figure className="card flex flex-col items-center p-2" data-gallery-look={title}>
      <div className="relative" style={{ ...CHECKER, outline: BOX ? '1px dashed #e5484d' : undefined }}>
        <BeaverLook look={l} size={size} animate={false} />
        {BOX && <span className="pointer-events-none absolute inset-x-0 bottom-0" style={{ height: size, outline: '1px dotted #36b9ff' }} />}
      </div>
      <figcaption className="mt-1 w-full text-center text-[11px] font-black leading-tight">{title}</figcaption>
      {note && <div className="text-[10px] font-black text-coral">{note}</div>}
      <Attrs l={l} />
    </figure>
  );
}

function Section({ title, hint, children, cols = 'grid-cols-3' }: { title: string; hint?: string; children: ReactNode; cols?: string }) {
  return (
    <section className="mt-6">
      <h2 className="text-lg font-black">{title}</h2>
      {hint && <p className="muted text-[12px] font-bold">{hint}</p>}
      <div className={`mt-2 grid gap-2 ${cols}`}>{children}</div>
    </section>
  );
}

export function LookGallery() {
  const m = LOOK_MANIFEST;
  const count = (st: string) => m.items.filter((i) => i.status === st).length;
  const costumes = m.items.filter((i) => i.catalogSlot === 'COSTUME');
  const pendingItems = m.items.filter((i) => i.status === 'pending' && i.catalogSlot !== 'COSTUME');
  const swap = tryOn({ COSTUME: 'costume-chef', HAT: 'hat-chef', BACKPACK: 'backpack-travel' }, 'costume-winter');
  const pairs: [string, LookLegacyWear][] = [
    ['Кухар + ковпак (сумісні: ковпак на картинці)', { COSTUME: 'costume-chef', HAT: 'hat-chef', BACKPACK: 'backpack-travel' }],
    ['Кухар + рюкзак (рюкзак закритий картинкою)', { COSTUME: 'costume-chef', BACKPACK: 'backpack-travel' }],
    ['Кухар + окуляри (окуляри pending)', { COSTUME: 'costume-chef', GLASSES: 'glasses-round', BACKPACK: 'backpack-travel' }],
    ['Дракон + кепка (конфлікт: капюшон)', { COSTUME: 'costume-dragon', HAT: 'cap-red', BACKPACK: 'backpack-travel' }],
    ['Зимовий + шарф (конфлікт: шия)', { COSTUME: 'costume-winter', SCARF: 'scarf-pl', BACKPACK: 'backpack-travel' }],
    ['Куртка pending + рюкзак (худі на картинці — не куртка)', { JACKET: 'jacket-denim', BACKPACK: 'backpack-travel' }],
    ['Без рюкзака (рюкзак на картинці)', {}],
    ['Невідомий ключ', { HAT: 'hat-from-future', BACKPACK: 'backpack-travel' }],
  ];
  return (
    <div data-gallery="look">
      <h1 className="text-2xl font-black">Образ Бобека — QA</h1>
      <p className="muted text-[12px] font-bold">
        База {m.base.version}: {m.base.status}. Предмети: ready {count('ready')}, legacy-whole-look {count('legacy-whole-look')}, pending {count('pending')}.
        Режим «layered» вмикається сам, коли база й шари стануть ready (етап M4).
      </p>

      <Section title="Стани (стартовий образ)" hint="Поза — з маніфесту (legacyBase.moods). Стан без пози — запасна поза, підписано.">
        {LOOK_MOODS.map((mood) => <Tile key={mood} title={mood} l={look(STARTER, mood)} />)}
      </Section>

      <Section title="Ракурси" cols="grid-cols-4">
        {LOOK_VIEWS.map((v) => <Tile key={v} title={v} l={look(STARTER, 'happy', v)} size={90} />)}
      </Section>

      <Section title="Костюми" hint="Цілісні картинки — legacy-whole-look (не шари). Костюм без картинки не малюється.">
        {costumes.map((c) => {
          const l = look({ COSTUME: c.id, BACKPACK: 'backpack-travel' });
          return <Tile key={c.id} title={`${c.id} · ${c.status}`} l={l} note={l.pending.includes(c.id) ? PENDING_NOTE : undefined} />;
        })}
      </Section>

      <Section title="Речі без живописного шару" hint="Надіта річ pending: Бобек не змінюється (ні вектора, ні схожої картинки), у гардеробі — «скоро».">
        {pendingItems.map((it) => (
          <Tile key={it.id} title={`${it.id} · ${it.catalogSlot}`} l={look({ BACKPACK: 'backpack-travel', [it.catalogSlot]: it.id })} size={80} note={PENDING_NOTE} />
        ))}
      </Section>

      <Section title="Пари, конфлікти, старі дані" cols="grid-cols-2">
        {pairs.map(([title, wear]) => <Tile key={title} title={title} l={look(wear)} size={120} />)}
      </Section>

      <Section title="Примірка (tryOn)" hint={`Кухар + ковпак → приміряти «Зимовий». Зніметься: ${swap.removed.join(', ') || '—'}. Видно саме вибраний: ${swap.candidateVisible ? 'так' : 'ні'}.`} cols="grid-cols-2">
        <Tile title="до" l={swap.before} size={140} />
        <Tile title="після (preview)" l={swap.after} size={140} />
      </Section>

      <Section title="Масштаби" hint="40 / 64 / 96 / 176 / 300 px: ширина доставки 256/512/1024 за розміром × DPR." cols="grid-cols-1">
        {[40, 64, 96, 176, 300].map((size) => <Tile key={size} title={`${size} px`} l={look(STARTER, 'wave')} size={size} />)}
      </Section>
    </div>
  );
}

/**
 * Ігрова сцена над завданням уроку: ілюстрація локації (вокзал, Żabka, трамвай…),
 * предмети у вітрині змінюються від завдання до завдання, бобер-супутник реагує на відповіді,
 * а в бульбашці — інструкція до завдання. Для діалогів праворуч з'являється співрозмовник.
 */
import { AnimatePresence, motion, useReducedMotion } from '../lib/motion';
import { memo } from 'react';
import { NpcFace } from './pictograms/Pictogram';
import { Beaver, type BeaverMood, type BeaverOutfit } from './Beaver';
import { Icon, type LineIconName } from './Icon';
import { Item, SCENE_ITEM_POOLS, Scene, type ItemName, type SceneName } from './Illustrations';
import { CityBanner } from './Scenery';
import { useT, type TKey } from '../i18n';
import type { PublicItem } from '../lib/types';

/** Локація (маршрут міста) → сцена. Невідомі маршрути показують панораму міста. */
const ROUTE_SCENES: Record<string, SceneName> = {
  'krk-dworzec': 'train-station',
  'krk-zabka': 'shop-corner',
  'krk-rynek': 'market-square',
  'krk-restauracja': 'restaurant',
  'krk-tramwaj': 'tram-stop',
  'krk-hotel': 'hotel',
  'krk-uniwersytet': 'university',
  'krk-rodzina': 'flat',
  'krk-dom': 'flat',
  'krk-dzien': 'bakery',
  'krk-egzamin': 'castle',
  'waw-powitania': 'flat',
  'waw-przedstawianie': 'train-station',
  'waw-stare-miasto': 'market-square',
  'waw-kawiarnia': 'bakery',
  'waw-sasiedzi': 'flat',
  'waw-liczby': 'supermarket',
  'lodz-dzwieki': 'university',
  'lodz-ludzie': 'work',
  'kat-ruch': 'tram-stop',
  'kat-pary': 'university',
  'opo-zywy': 'street-food',
  'wro-kawiarnia': 'bakery',
  'wro-sklep': 'shop-corner',
  'wro-restauracja': 'milk-bar',
};

/** Ширші набори предметів, щоб вітрина не повторювалась у сусідніх завданнях. */
const POOLS: Partial<Record<SceneName, ItemName[]>> = {
  'train-station': ['train', 'ticket', 'coffee', 'backpack', 'map', 'receipt', 'headphones'],
  'shop-corner': ['hotdog', 'water', 'coffee', 'bread', 'basket', 'receipt', 'card'],
  'tram-stop': ['tram', 'ticket', 'map', 'card', 'backpack'],
  'market-square': ['map', 'paczki', 'coffee', 'bread', 'sernik', 'beaver-map'],
  restaurant: ['zurek', 'pierogi', 'dishes', 'bigos', 'placki', 'sernik', 'receipt'],
  hotel: ['card', 'backpack', 'coffee', 'parcel', 'book-clock'],
  university: ['book-clock', 'speech', 'map', 'coffee', 'card'],
  castle: ['map', 'beaver-map', 'ticket', 'paws'],
};

export function sceneForRoute(routeSlug?: string | null): SceneName | null {
  return routeSlug ? (ROUTE_SCENES[routeSlug] ?? null) : null;
}

const TYPE_BADGE: Record<string, [LineIconName, TKey]> = {
  WORD_TRANSLATION: ['target', 'stage_choose'],
  PICTURE_WORD: ['target', 'stage_choose'],
  ODD_ONE_OUT: ['target', 'stage_choose'],
  FIND_ERROR: ['alert', 'stage_grammar'],
  FILL_GAP: ['layers', 'stage_grammar'],
  GRAMMAR: ['layers', 'stage_grammar'],
  LISTENING: ['headphones', 'stage_listen'],
  DICTATION: ['headphones', 'stage_write'],
  READING: ['book', 'stage_read'],
  SENTENCE_TRANSLATION: ['chat', 'stage_write'],
  BUILD_SENTENCE: ['layers', 'stage_build'],
  WORD_ORDER: ['layers', 'stage_build'],
  MATCH_PAIRS: ['layers', 'stage_match'],
  PRONUNCIATION: ['chat', 'stage_speak'],
  DIALOGUE: ['chat', 'stage_dialogue'],
  SITUATION: ['chat', 'stage_dialogue'],
};

/** Реквізит сцени залежно від механіки: гучномовець, табло, мікрофон або предмет локації. */
function StageProp({ type, item }: { type: string; item?: ItemName }) {
  const reduce = useReducedMotion();
  const rings = (color: string) =>
    !reduce && [0, 1].map((i) => (
      <motion.span key={i} className="absolute inset-0 rounded-full border-2" style={{ borderColor: color }} animate={{ scale: [1, 1.75], opacity: [0.7, 0] }} transition={{ repeat: Infinity, duration: 1.6, delay: i * 0.8 }} />
    ));
  if (type === 'LISTENING' || type === 'DICTATION')
    return (
      <div className="relative grid h-14 w-14 place-items-center rounded-full bg-sky text-night shadow-[0_4px_0_#1d8fd6]">
        {rings('#36B9FF')}
        <Icon name="headphones" size={28} />
      </div>
    );
  if (type === 'PRONUNCIATION')
    return (
      <div className="relative grid h-14 w-14 place-items-center rounded-full bg-coral text-white shadow-[0_4px_0_#d23540]">
        {rings('#FF5265')}
        <Icon name="chat" size={28} />
      </div>
    );
  if (type === 'READING')
    return (
      <svg width="86" height="58" viewBox="0 0 86 58" aria-hidden>
        <rect x="2" y="2" width="82" height="48" rx="7" fill="#10233B" stroke="#FFC857" strokeWidth="3" />
        {[0, 1, 2].map((r) => (
          <g key={r}>
            <rect x="10" y={11 + r * 12} width="16" height="6" rx="2" fill="#FFC857" />
            <rect x="30" y={11 + r * 12} width={r === 1 ? 30 : 44} height="6" rx="2" fill="#F8FAFF" opacity="0.85" />
          </g>
        ))}
        <rect x="38" y="50" width="10" height="8" fill="#23466B" />
      </svg>
    );
  if (!item) return null;
  return (
    <motion.div animate={reduce ? undefined : { y: [0, -5, 0], rotate: [-3, 3, -3] }} transition={{ repeat: Infinity, duration: 3 }} className="drop-shadow-[0_6px_6px_rgb(0_0_0/0.35)]">
      <Item name={item} size={60} />
    </motion.div>
  );
}

/** Мітка механіки (іконка й назва) — для шапки уроку. */
export const stageBadge = (type: string) => TYPE_BADGE[type] ?? TYPE_BADGE.WORD_TRANSLATION;

/** Репліка Бобека польською (занурення); пояснення мовою інтерфейсу — заголовок під сценою. */
const PL_CUE: Record<string, string> = {
  WORD_TRANSLATION: 'Wybierz tłumaczenie!', PICTURE_WORD: 'Co widzisz na obrazku?', ODD_ONE_OUT: 'Co tu nie pasuje?',
  FIND_ERROR: 'Znajdź błąd!', FILL_GAP: 'Uzupełnij zdanie!', GRAMMAR: 'Wpisz poprawną formę!', LISTENING: 'Posłuchaj i wybierz!',
  DICTATION: 'Posłuchaj i napisz!', READING: 'Przeczytaj i odpowiedz!', SENTENCE_TRANSLATION: 'Przetłumacz na polski!',
  BUILD_SENTENCE: 'Ułóż zdanie!', WORD_ORDER: 'Ułóż słowa po kolei!', MATCH_PAIRS: 'Połącz w pary!', PRONUNCIATION: 'Powiedz to na głos!',
  DIALOGUE: 'Porozmawiajmy!', SITUATION: 'Co powiesz?',
};
const REVERSE_CUE = 'Jak to jest po polsku?';

export type StageMood = 'idle' | 'think' | 'correct' | 'wrong';

const MOOD: Record<StageMood, BeaverMood> = { idle: 'happy', think: 'think', correct: 'cheer', wrong: 'sad' };

type Props = {
  item: PublicItem;
  index: number;
  routeSlug?: string | null;
  citySlug?: string | null;
  color?: string;
  evening?: boolean;
  mood: StageMood;
  /** Назва міста для мітки сцени; без неї (тренування) показується механіка. */
  place?: string | null;
  outfit?: BeaverOutfit;
};

export const LessonStage = memo(function LessonStage({ item, index, routeSlug, citySlug, color = '#36B9FF', evening, mood, place, outfit }: Props) {
  const { t } = useT();
  const reduce = useReducedMotion();
  const scene = sceneForRoute(routeSlug);
  const pool = scene ? (POOLS[scene] ?? SCENE_ITEM_POOLS[scene]) : [];
  // Кожне завдання зсуває вітрину на один предмет: сусідні завдання виглядають по-різному.
  const items = pool.length ? [0, 1, 2].map((k) => pool[(index + k) % pool.length]) : undefined;
  const badge = stageBadge(item.type);
  const reverse = item.type === 'WORD_TRANSLATION' && !(item.data as { pl?: string }).pl;
  const cue = reverse ? REVERSE_CUE : (PL_CUE[item.type] ?? PL_CUE.WORD_TRANSLATION);
  const npc = (item.type === 'DIALOGUE' || item.type === 'SITUATION') ? (item.data as unknown as { npc?: { emoji: string; name: string } }).npc : undefined;

  return (
    <div className="lesson-stage relative h-[176px] overflow-hidden rounded-[26px]">
      {scene ? (
        <Scene name={scene} items={items} evening={evening} className="absolute inset-0 h-full w-full" />
      ) : citySlug ? (
        <CityBanner slug={citySlug} color={color} height={176} className="absolute inset-0" shade={false} />
      ) : (
        <Scene name="flat" items={items} evening={evening} className="absolute inset-0 h-full w-full" />
      )}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-night via-night/35 to-transparent" />

      {place ? (
        <div className="stage-tag absolute left-3 top-3" lang="pl">
          <Icon name="pin" size={15} filled className="text-coral" /> {place}
        </div>
      ) : (
        <div className="stage-tag absolute left-3 top-3 uppercase tracking-wide text-sky">
          <Icon name={badge[0]} size={14} /> {t(badge[1])}
        </div>
      )}

      {!npc && (
        <div className="absolute right-3 top-3">
          <StageProp type={item.type} item={pool.length ? pool[(index * 3 + 1) % pool.length] : undefined} />
        </div>
      )}

      {npc && (
        <motion.div
          initial={reduce ? false : { scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="absolute right-3 top-3 flex flex-col items-center"
        >
          <span className="grid h-14 w-14 place-items-center rounded-full shadow-lg"><NpcFace emoji={npc.emoji} name={npc.name} size={56} /></span>
          <span className="mt-1 max-w-[110px] truncate rounded-full bg-night/80 px-2 py-0.5 text-[11px] font-black text-white">{npc.name}</span>
        </motion.div>
      )}

      <div className="absolute inset-x-0 bottom-0 flex items-end gap-1 pl-1 pr-3">
        <motion.div
          key={`${mood}-${index}`}
          className="-mb-3 shrink-0"
          initial={false}
          animate={
            reduce
              ? undefined
              : mood === 'correct'
                ? { y: [0, -16, 0, -6, 0] }
                : mood === 'wrong'
                  ? { x: [0, -6, 6, -3, 0] }
                  : { y: 0, x: 0 }
          }
          transition={{ duration: mood === 'correct' ? 0.6 : 0.4 }}
        >
          <Beaver mood={MOOD[mood]} size={112} outfit={outfit} animate={mood === 'idle'} />
        </motion.div>
        <AnimatePresence mode="wait">
          <motion.div
            key={`${item.key}-${cue}`}
            lang="pl"
            initial={reduce ? false : { opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="stage-bubble relative mb-3 min-w-0 flex-1 rounded-2xl rounded-bl-md px-3.5 py-2.5 text-[17px] font-black leading-snug"
          >
            {cue}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
});

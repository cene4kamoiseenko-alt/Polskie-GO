/** Галерея станів маскота (лише для розробки: /__gallery). */
import { LookGallery } from './LookGallery';
import { CityHero } from '../components/CityHero';
import { Pictogram, NpcFace } from '../components/pictograms/Pictogram';
import { LangFlag } from '../components/pictograms/Flag';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { I18nProvider } from '../i18n';
import { ToastProvider } from '../components/ui';
import { ExerciseView } from '../exercises/Exercises';
import { LessonStage } from '../components/LessonStage';
import type { PublicItem } from '../lib/types';

const tr3 = (s: string) => ({ uk: s, ru: s, en: s });
const SAMPLES: PublicItem[] = [
  { key: 'a', type: 'WORD_TRANSLATION', skill: 'x', data: { pl: 'metro', audioText: 'metro', options: [['🚇', 'метро'], ['🚋', 'трамвай'], ['🚌', 'автобус'], ['🚆', 'поезд']].map(([image, text], i) => ({ id: `o${i}`, image, text: tr3(text) })) } },
  { key: 'b', type: 'PICTURE_WORD', skill: 'x', data: { image: '🗺️', options: ['mapa', 'bilet', 'menu'].map((text, i) => ({ id: `o${i}`, text })) } },
  { key: 'c', type: 'DIALOGUE', skill: 'x', data: { npc: { name: 'Pani Ewa', emoji: '👩🏻‍🦰', role: tr3('соседка') }, steps: [{ npc: 'Dzień dobry! Pan jest nowy?', npcTr: tr3('Добрый день! Вы новенький?'), options: [{ id: 'a', text: 'Tak, mieszkam tu od wczoraj.', tr: tr3('Да, живу здесь со вчера.') }, { id: 'b', text: 'Nie ma za co.', tr: tr3('Не за что.') }] }] } },
];
const qc = new QueryClient();

const PICTOS = [...'🌙☀️🌆👋🙏🚇🚋🚌🚆✈️🚕🚲🚗🚉🥒🍅🥔🍎🍌🥐🍞🍩🥨🥧🍰🍪🍫🧁🧀🥚🌭🍕🍔🥪🍲🥗🍦🥟🥫☕🍵🧃💧🥛🍾🏰⛪🌉⛲🗽🏛️🏦🏫🏪🏥🏨📚🏟️🍽️🏠🗺️➡️⬅️⬆️↩️🐉🦅🐻📫🗑️🚪🔑📰🛋️🛏️🛗🪜🪟🐶🐱🧳🎒👜📦🎫💳🧾📱📖📝💻🚻🚶🏊🛒😴👵👴👶👩👧'.matchAll(/\p{Extended_Pictographic}(\uFE0F|\u200D\p{Extended_Pictographic}\uFE0F?)*/gu)].map((m) => m[0]).concat(['🧜‍♀️', '3️⃣', '7️⃣']);
const BIG = ['🥒', '🍅', '🥔', '🍞', '🥨', '🥧', '🍫', '🧁', '🧀', '🍔', '🌭', '🥟', '🍵', '🌉', '⛲', '🗽', '🛗', '🪜', '🪟', '🏟️', '👜', '🙏', '🧜‍♀️', '🐉', '🐻'];
const NPCS = ['👩🏼', '👴🏻', '👩🏻‍💼', '👨🏻‍💼', '👩🏻‍🦳', '🎫', '🧑🏻', '👵🏼', '🧔🏻‍♂️', '👨🏻‍🌾', '👩🏻', '🧔🏻', '🧑🏼', '👩🏽‍🦱', '👨🏻‍🍳', '👵🏻', '👨🏻', '👩🏻‍🦰', '🧑🏽‍🔧', '👩🏼‍💼', '👨🏻‍✈️', '🧑🏻‍💼', '👩🏻‍🦱', '🧑🏼‍🦰', '👩🏻‍🍳', '🤵🏻', '👮🏻‍♂️', '👩🏼‍🎓', '👨🏻‍🦳', '👩🏻‍🏫', '🧑🏻‍💻', '🧑🏻‍🍳', '🧙🏻‍♂️'];

export default function Gallery() {
  if (location.search.includes('ex')) {
    return (
      <QueryClientProvider client={qc}>
        <I18nProvider lang="ru">
          <ToastProvider>
            <div className="min-h-screen space-y-6 bg-[var(--bg)] p-4">
              {SAMPLES.map((item, i) => (
                <div key={item.key} className="space-y-3">
                  <LessonStage item={item} index={i} mood="idle" place="Warszawa" citySlug="warszawa" />
                  <ExerciseView item={item} result={null} onChange={() => {}} onSubmit={() => {}} submitStep={async () => ({ correct: true }) as never} onDialogueDone={() => {}} />
                </div>
              ))}
            </div>
          </ToastProvider>
        </I18nProvider>
      </QueryClientProvider>
    );
  }
  if (location.search.includes('picto')) {
    return (
      <div className="min-h-screen bg-[var(--bg)] p-3">
        <div className={location.search.includes('big') ? 'grid grid-cols-4 gap-2' : 'grid grid-cols-8 gap-1.5'}>
          {(location.search.includes('big') ? BIG : PICTOS).map((e) => <Pictogram key={e} emoji={e} size={location.search.includes('big') ? 88 : 44} />)}
        </div>
        <div className="mt-3 grid grid-cols-8 gap-1.5">
          {NPCS.map((e, i) => <NpcFace key={e} emoji={e} name={`n${i}`} size={44} />)}
        </div>
        <div className="mt-3 flex gap-2">{['uk', 'ru', 'en', 'pl'].map((c) => <LangFlag key={c} code={c} />)}</div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-[var(--bg)] p-4">
      {location.search.includes('cities') && (
        <div className="mb-4 grid grid-cols-2 gap-3">
          {['warszawa', 'krakow', 'wroclaw', 'lodz', 'katowice', 'opole', 'gdansk', 'poznan'].map((c) => (
            <div key={c} className="overflow-hidden rounded-2xl"><CityHero slug={c} color="#36B9FF" name={c} height={200} /></div>
          ))}
        </div>
      )}
      <LookGallery />
    </div>
  );
}

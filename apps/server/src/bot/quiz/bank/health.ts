/** Вопросы бота: здоровье (врач, аптека, лекарства, экстренные службы). */
import { q, type QuizQuestion } from './types';

export const HEALTH: QuizQuestion[] = [
  q({
    id: 'health-glowa', category: 'health', cefr: 'A2', kind: 'listen', image: 'przychodnia',
    prompt: {
      ru: 'Врач в кабинете: «Proszę się rozebrać do pasa.» Что нужно сделать?',
      uk: 'Лікар у кабінеті: «Proszę się rozebrać do pasa.» Що треба зробити?',
      en: 'The doctor says: «Proszę się rozebrać do pasa.» What should you do?',
    },
    options: {
      ru: ['раздеться до пояса', 'лечь на кушетку', 'открыть широко рот', 'глубоко вдохнуть'],
      uk: ['роздягнутися до пояса', 'лягти на кушетку', 'широко відкрити рот', 'глибоко вдихнути'],
      en: ['undress to the waist', 'lie down on the couch', 'open your mouth wide', 'take a deep breath'],
    },
    answer: 0,
    explain: {
      ru: '«Rozebrać się» — раздеться, «do pasa» — до пояса (pas — пояс, талия). Лечь — «położyć się», открыть рот — «otworzyć usta», вдохнуть — «wziąć głęboki oddech».',
      uk: '«Rozebrać się» — роздягнутися, «do pasa» — до пояса (pas — пояс, талія). Лягти — «położyć się», відкрити рот — «otworzyć usta», вдихнути — «wziąć głęboki oddech».',
      en: '«Rozebrać się» means to undress, «do pasa» — to the waist (pas — waist, belt). Lie down is «położyć się», open your mouth — «otworzyć usta», breathe in — «wziąć głęboki oddech».',
    },
  }),
  q({
    id: 'health-recepta', category: 'health', cefr: 'A2', kind: 'meaning', image: 'przychodnia',
    prompt: {
      ru: 'В аптеке: «Ten lek jest tylko na receptę.» Что это значит?',
      uk: 'В аптеці: «Ten lek jest tylko na receptę.» Що це означає?',
      en: 'At the pharmacy: «Ten lek jest tylko na receptę.» What does it mean?',
    },
    options: {
      ru: ['только по рецепту', 'только в больнице', 'только со скидкой', 'только для детей'],
      uk: ['лише за рецептом', 'лише в лікарні', 'лише зі знижкою', 'лише для дітей'],
      en: ['prescription only', 'hospital only', 'discounted only', 'for children only'],
    },
    answer: 0,
    explain: {
      ru: '«Na receptę» — по рецепту врача (e-recepta приходит кодом в SMS). Без рецепта — «bez recepty». Скидка — «zniżka», больница — «szpital».',
      uk: '«Na receptę» — за рецептом лікаря (e-recepta приходить кодом в SMS). Без рецепта — «bez recepty». Знижка — «zniżka», лікарня — «szpital».',
      en: '«Na receptę» means on prescription (an e-recepta arrives as a code by text). Over the counter is «bez recepty». A discount is «zniżka», a hospital — «szpital».',
    },
  }),
  q({
    id: 'health-112', category: 'health', cefr: 'A1', kind: 'meaning', image: 'przychodnia',
    prompt: {
      ru: 'Что такое «pogotowie ratunkowe»?',
      uk: 'Що таке «pogotowie ratunkowe»?',
      en: 'What is «pogotowie ratunkowe»?',
    },
    options: {
      ru: ['скорая помощь', 'пожарная охрана', 'служба газа', 'дорожная полиция'],
      uk: ['швидка допомога', 'пожежна охорона', 'газова служба', 'дорожня поліція'],
      en: ['ambulance service', 'fire brigade', 'gas emergency', 'traffic police'],
    },
    answer: 0,
    explain: {
      ru: '«Pogotowie ratunkowe» — скорая помощь (999 или общий 112), «ratunkowy» — спасательный. Аварийная газовая — «pogotowie gazowe», пожарные — «straż pożarna», полиция — «policja».',
      uk: '«Pogotowie ratunkowe» — швидка допомога (999 або загальний 112), «ratunkowy» — рятувальний. Аварійна газова — «pogotowie gazowe», пожежники — «straż pożarna», поліція — «policja».',
      en: '«Pogotowie ratunkowe» is the ambulance service (999 or the general 112); «ratunkowy» means rescue. Gas emergency is «pogotowie gazowe», firefighters — «straż pożarna», police — «policja».',
    },
  }),
  q({
    id: 'health-dawkowanie', category: 'health', cefr: 'B1', kind: 'listen', image: 'przychodnia',
    prompt: {
      ru: 'Врач: «Proszę brać ten lek co osiem godzin, przed jedzeniem.» Как принимать?',
      uk: 'Лікар: «Proszę brać ten lek co osiem godzin, przed jedzeniem.» Як приймати?',
      en: 'The doctor: «Proszę brać ten lek co osiem godzin, przed jedzeniem.» How do you take it?',
    },
    options: {
      ru: ['каждые 8 часов, до еды', 'каждые 8 часов, после еды', 'восемь раз в день, до еды', 'через 8 часов, один раз'],
      uk: ['кожні 8 годин, до їжі', 'кожні 8 годин, після їжі', 'вісім разів на день, до їжі', 'через 8 годин, один раз'],
      en: ['every 8 hours, before meals', 'every 8 hours, after meals', 'eight times a day, before meals', 'just once, 8 hours from now'],
    },
    answer: 0,
    explain: {
      ru: '«Co osiem godzin» — каждые 8 часов (co — «каждый»), «przed jedzeniem» — до еды («po jedzeniu» — после). «Osiem razy dziennie» — 8 раз в день, «za osiem godzin» — через 8 часов.',
      uk: '«Co osiem godzin» — кожні 8 годин (co — «кожен»), «przed jedzeniem» — до їжі («po jedzeniu» — після). «Osiem razy dziennie» — 8 разів на день, «za osiem godzin» — через 8 годин.',
      en: '«Co osiem godzin» means every 8 hours, «przed jedzeniem» — before meals («po jedzeniu» — after). «Osiem razy dziennie» is 8 times a day, «za osiem godzin» — in 8 hours.',
    },
  }),
  q({
    id: 'health-do-lekarza', category: 'health', cefr: 'A2', kind: 'preposition', image: 'przychodnia',
    prompt: {
      ru: 'Вставь: «Jutro idę ___.» (к стоматологу на приём)',
      uk: 'Встав: «Jutro idę ___.» (до стоматолога на прийом)',
      en: 'Fill in: «Jutro idę ___.» (to the dentist for an appointment)',
    },
    options: ['do dentysty', 'na dentystę', 'u dentysty', 'po dentystę'],
    answer: 0,
    explain: {
      ru: 'К врачу идут с «do» + родительный: do dentysty, do lekarza. «U dentysty» — «у стоматолога» (где? byłem u dentysty), «po dentystę» — «за стоматологом» (сходить за ним), «na dentystę» — «учиться на стоматолога».',
      uk: 'До лікаря йдуть із «do» + родовий: do dentysty, do lekarza. «U dentysty» — «у стоматолога» (де? byłem u dentysty), «po dentystę» — «по стоматолога» (сходити за ним), «na dentystę» — «вчитися на стоматолога».',
      en: 'Going to a doctor uses «do» + genitive: do dentysty, do lekarza. «U dentysty» means at the dentist\'s (where?), «po dentystę» — to fetch the dentist, «na dentystę» — to study to be one.',
    },
  }),
];

/** Вопросы бота: транспорт (поезд, трамвай, автобус, билеты, объявления). */
import { q, type QuizQuestion } from './types';

export const TRANSPORT: QuizQuestion[] = [
  q({
    id: 'tr-peron', category: 'transport', cefr: 'A1', kind: 'listen', image: 'pkp',
    prompt: {
      ru: 'Табло: «Pociąg do Krakowa odjeżdża z peronu 3, tor 5.» Куда идти?',
      uk: 'Табло: «Pociąg do Krakowa odjeżdża z peronu 3, tor 5.» Куди йти?',
      en: 'The board says: «Pociąg do Krakowa odjeżdża z peronu 3, tor 5.» Where do you go?',
    },
    options: {
      ru: ['платформа 3, путь 5', 'платформа 5, путь 3', 'вагон 3, место 5', 'касса 3, окно 5'],
      uk: ['платформа 3, колія 5', 'платформа 5, колія 3', 'вагон 3, місце 5', 'каса 3, віконце 5'],
      en: ['platform 3, track 5', 'platform 5, track 3', 'carriage 3, seat 5', 'window 3, desk 5'],
    },
    answer: 0,
    explain: {
      ru: '«Peron» — платформа, «tor» — путь у этой платформы: на табло сначала peron, потом tor. Вагон — «wagon», место — «miejsce», касса — «kasa».',
      uk: '«Peron» — платформа, «tor» — колія біля цієї платформи: на табло спочатку peron, потім tor. Вагон — «wagon», місце — «miejsce», каса — «kasa».',
      en: '«Peron» is the platform and «tor» the track beside it; boards list peron first, then tor. A carriage is «wagon», a seat — «miejsce», the ticket desk — «kasa».',
    },
  }),
  q({
    id: 'tr-ulgowy', category: 'transport', cefr: 'A1', kind: 'meaning', image: 'tramwaj',
    prompt: { ru: 'Что такое «bilet ulgowy»?', uk: 'Що таке «bilet ulgowy»?', en: 'What is a «bilet ulgowy»?' },
    options: {
      ru: ['льготный билет', 'обратный билет', 'дневной билет', 'групповой билет'],
      uk: ['пільговий квиток', 'зворотний квиток', 'добовий квиток', 'груповий квиток'],
      en: ['a reduced fare', 'a return ticket', 'a day ticket', 'a group ticket'],
    },
    answer: 0,
    explain: {
      ru: '«Ulga» — льгота, «ulgowy» — со скидкой (студентам, детям, пенсионерам). Полный — «normalny», обратный — «powrotny», дневной — «dobowy», групповой — «grupowy».',
      uk: '«Ulga» — пільга, «ulgowy» — зі знижкою (студентам, дітям, пенсіонерам). Повний — «normalny», зворотний — «powrotny», добовий — «dobowy», груповий — «grupowy».',
      en: '«Ulga» is a concession, so «ulgowy» is reduced (students, children, pensioners). Full fare is «normalny», return — «powrotny», day — «dobowy», group — «grupowy».',
    },
  }),
  q({
    id: 'tr-do-warszawy', category: 'transport', cefr: 'A1', kind: 'preposition', image: 'pkp',
    prompt: {
      ru: 'Ты едешь в Варшаву. Как закончить: «Jutro jadę ___.»?',
      uk: 'Ти їдеш до Варшави. Як закінчити: «Jutro jadę ___.»?',
      en: 'You are going to Warsaw. How do you finish: «Jutro jadę ___.»?',
    },
    options: ['do Warszawy', 'w Warszawę', 'na Warszawę', 'w Warszawie'],
    answer: 0,
    explain: {
      ru: 'В город едут с «do» + родительный: do Warszawy, do Krakowa. «W Warszawę» — калька с русского, «na Warszawę» — «на Варшаву» (как в атаку), «w Warszawie» — «в Варшаве» (где?).',
      uk: 'До міста їдуть із «do» + родовий: do Warszawy, do Krakowa. «W Warszawę» — калька з російської, «na Warszawę» — «на Варшаву» (як в атаку), «w Warszawie» — «у Варшаві» (де?).',
      en: 'Travelling to a city uses «do» + genitive: do Warszawy, do Krakowa. «W Warszawę» is a calque, «na Warszawę» sounds like an attack, «w Warszawie» means "in Warsaw" (where?).',
    },
  }),
  q({
    id: 'tr-skasowac', category: 'transport', cefr: 'A2', kind: 'situation', image: 'tramwaj',
    prompt: {
      ru: 'Ты вошёл в трамвай с бумажным билетом. Что нужно сделать сразу?',
      uk: 'Ти зайшов у трамвай із паперовим квитком. Що треба зробити одразу?',
      en: 'You get on a tram with a paper ticket. What must you do straight away?',
    },
    options: ['Skasować bilet w kasowniku.', 'Oddać bilet kierowcy.', 'Pokazać bilet przy wyjściu.', 'Kupić drugi bilet u kierowcy.'],
    answer: 0,
    explain: {
      ru: 'Бумажный билет нужно «skasować» — пробить в компостере (kasownik), иначе он недействителен. Водителю его не отдают, на выходе не показывают — проверяет контролёр в пути.',
      uk: 'Паперовий квиток треба «skasować» — прокомпостувати в компостері (kasownik), інакше він недійсний. Водієві його не віддають, на виході не показують — перевіряє контролер у дорозі.',
      en: 'A paper ticket must be validated («skasować») in the machine (kasownik) or it isn\'t valid. You don\'t hand it to the driver or show it on exit: inspectors check during the ride.',
    },
  }),
  q({
    id: 'tr-przesiadka', category: 'transport', cefr: 'A2', kind: 'meaning', image: 'pkp',
    prompt: {
      ru: 'Друг пишет: «Mam przesiadkę w Poznaniu.» Что это значит?',
      uk: 'Друг пише: «Mam przesiadkę w Poznaniu.» Що це означає?',
      en: 'A friend texts: «Mam przesiadkę w Poznaniu.» What does it mean?',
    },
    options: {
      ru: ['пересадка в Познани', 'посадка в Познани', 'остановка в Познани', 'выход в Познани'],
      uk: ['пересадка в Познані', 'посадка в Познані', 'зупинка в Познані', 'вихід у Познані'],
      en: ['I change in Poznań', 'I board in Poznań', 'I stop over in Poznań', 'I get off in Poznań'],
    },
    answer: 0,
    explain: {
      ru: '«Przesiadka» — пересадка (przesiadać się — пересаживаться): в Познани он сменит поезд. Посадка — «wsiadanie», остановка — «postój», выйти — «wysiąść».',
      uk: '«Przesiadka» — пересадка (przesiadać się — пересідати): у Познані він змінить потяг. Посадка — «wsiadanie», зупинка — «postój», вийти — «wysiąść».',
      en: '«Przesiadka» is a change of trains (przesiadać się — to change): he switches trains in Poznań. Boarding is «wsiadanie», a stopover — «postój», to get off — «wysiąść».',
    },
  }),
  q({
    id: 'tr-next-stop', category: 'transport', cefr: 'A2', kind: 'complete', image: 'tramwaj',
    prompt: {
      ru: 'Вставь: «Wysiadam na ___ przystanku.» (следующей остановке)',
      uk: 'Встав: «Wysiadam na ___ przystanku.» (наступній зупинці)',
      en: 'Fill in: «Wysiadam na ___ przystanku.» (the next stop)',
    },
    options: ['następnym', 'następnej', 'następny', 'następnego'],
    answer: 0,
    explain: {
      ru: '«Przystanek» в польском — мужского рода, поэтому «na następnym przystanku». «Następnej» — женский род (как русское «на следующей остановке»), «następny» — именительный, «następnego» — родительный.',
      uk: '«Przystanek» у польській — чоловічого роду, тому «na następnym przystanku». «Następnej» — жіночий рід (як українське «на наступній зупинці»), «następny» — називний, «następnego» — родовий.',
      en: '«Przystanek» is masculine, so «na następnym przystanku». «Następnej» is feminine (a calque from Russian/Ukrainian, where "stop" is feminine), «następny» the nominative, «następnego» the genitive.',
    },
  }),
  q({
    id: 'tr-na-zadanie', category: 'transport', cefr: 'A2', kind: 'meaning', image: 'tramwaj',
    prompt: {
      ru: 'На остановке табличка «Przystanek na żądanie». Что это?',
      uk: 'На зупинці табличка «Przystanek na żądanie». Що це?',
      en: 'A sign at the stop says «Przystanek na żądanie». What is it?',
    },
    options: {
      ru: ['остановка по требованию', 'конечная остановка', 'временная остановка', 'ночная остановка'],
      uk: ['зупинка на вимогу', 'кінцева зупинка', 'тимчасова зупинка', 'нічна зупинка'],
      en: ['a request stop', 'the final stop', 'a temporary stop', 'a night-bus stop'],
    },
    answer: 0,
    explain: {
      ru: '«Na żądanie» — по требованию: автобус остановится, только если нажать «STOP» или поднять руку. Конечная — «pętla» или «przystanek końcowy», временная — «tymczasowy», ночная — «nocny».',
      uk: '«Na żądanie» — на вимогу: автобус зупиниться, лише якщо натиснути «STOP» або підняти руку. Кінцева — «pętla» чи «przystanek końcowy», тимчасова — «tymczasowy», нічна — «nocny».',
      en: '«Na żądanie» means on request: the bus stops only if you press STOP or wave. The final stop is «pętla» or «przystanek końcowy», temporary — «tymczasowy», night — «nocny».',
    },
  }),
  q({
    id: 'tr-opozniony', category: 'transport', cefr: 'B1', kind: 'listen', image: 'pkp',
    prompt: {
      ru: 'Объявление: «Pociąg do Gdańska jest opóźniony o około 20 minut. Opóźnienie może ulec zmianie.» Что с поездом?',
      uk: 'Оголошення: «Pociąg do Gdańska jest opóźniony o około 20 minut. Opóźnienie może ulec zmianie.» Що з потягом?',
      en: 'Announcement: «Pociąg do Gdańska jest opóźniony o około 20 minut. Opóźnienie może ulec zmianie.» What about the train?',
    },
    options: {
      ru: ['опаздывает примерно на 20 минут', 'отправится примерно через 20 минут', 'отменён — следующий через 20 минут', 'простоит на станции 20 минут'],
      uk: ['запізнюється приблизно на 20 хвилин', 'відправиться приблизно за 20 хвилин', 'скасований — наступний за 20 хвилин', 'простоїть на станції 20 хвилин'],
      en: ['is running about 20 minutes late', 'departs in about 20 minutes', 'is cancelled; next one in 20 minutes', 'will stand here for 20 minutes'],
    },
    answer: 0,
    explain: {
      ru: '«Opóźniony o 20 minut» — опаздывает на 20 минут, а задержка «może ulec zmianie» — может измениться. «Odjedzie za 20 minut» — уйдёт через 20 минут, «odwołany» — отменён, «postój» — стоянка.',
      uk: '«Opóźniony o 20 minut» — запізнюється на 20 хвилин, а затримка «może ulec zmianie» — може змінитися. «Odjedzie za 20 minut» — відійде за 20 хвилин, «odwołany» — скасований, «postój» — стоянка.',
      en: '«Opóźniony o 20 minut» means 20 minutes late, and the delay «może ulec zmianie» — may change. «Odjedzie za 20 minut» is "leaves in 20 minutes", «odwołany» — cancelled, «postój» — a stop.',
    },
  }),
  q({
    id: 'tr-jade-tramwajem', category: 'transport', cefr: 'B1', kind: 'verb', image: 'tramwaj',
    prompt: {
      ru: 'Как сказать: «Каждый день дочь ездит в школу на трамвае»?',
      uk: 'Як сказати: «Щодня донька їздить до школи трамваєм»?',
      en: 'How do you say: "Every day my daughter goes to school by tram"?',
    },
    options: ['Córka codziennie jeździ do szkoły tramwajem.', 'Córka codziennie jedzie do szkoły tramwajem.', 'Córka codziennie chodzi do szkoły tramwajem.', 'Córka codziennie jeździ do szkoły na tramwaju.'],
    answer: 0,
    explain: {
      ru: '«Codziennie» — регулярно, поэтому «jeździ» (ездит), а не «jedzie» (едет сейчас). «Chodzić» — ходить пешком. Транспорт — творительный без предлога: tramwajem, «na tramwaju» — калька.',
      uk: '«Codziennie» — регулярно, тому «jeździ» (їздить), а не «jedzie» (їде зараз). «Chodzić» — ходити пішки. Транспорт — орудний без прийменника: tramwajem, «na tramwaju» — калька.',
      en: '«Codziennie» means regularly, so «jeździ» (habitual), not «jedzie» (going right now). «Chodzić» means to walk. Transport takes the bare instrumental: tramwajem; «na tramwaju» is a calque.',
    },
  }),
];

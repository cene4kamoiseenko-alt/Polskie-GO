/**
 * Белосток — трудные версии уроков (2026-11-28, docs/LEVELS_RU.md, ТЗ 1.0, этап 2). Город повседневных дел и Подляшья: распорядок дня,
 * чувства, врач и аптека, парикмахер, сервис, Беловежская пуща, Заменгоф. Те же герои (подруга Kasia, доктор Nowicka, фармацевт,
 * парикмахер pani Ola, мастер pan Tomasz, проводник pan Jan). Все уроки города — B1, поэтому версия одна — B2:
 *  • возвратные глаголы, меняющие смысл (zdawać się, obejść się bez, wybierać się), управление глаголов (zależeć komuś na, liczyć się z,
 *    domagać się), история болезни (chorować na, przejść zapalenie, objawy ustąpiły), язык аптечного вкладыша (działania niepożądane,
 *    przechowywać w miejscu niedostępnym), претензия к услуге (zgłosić zastrzeżenia, przełożyć wizytę), права покупателя (wada fabryczna,
 *    nie podlega gwarancji, odstąpić od umowy), язык охраны природы (objęty ochroną ścisłą, zagrożony wyginięciem), история Заменгофа
 *    (dążył do porozumienia, pomimo + родительный).
 * Правила качества — docs/EXERCISE_QUALITY.md. Аудирования и диктанта в версиях нет (нужна озвучка). Польский текст написан
 * по нормам языка, но проверка носителем ещё не проводилась (docs/ROADMAP_1_0.md). Тексты вкладыша и диагнозы — учебные, не советы.
 */
import { t, fillGap, reading, dialogue, reverseChoice, build, findError, match } from '../builders';
import type { LessonLevels } from '../types';

const KASIA = { name: 'Kasia', emoji: '👩🏻', role: t('подруга з Білостока', 'подруга из Белостока', 'a friend from Białystok') };
const LEKARKA = { name: 'Pani doktor Nowicka', emoji: '👩🏼‍⚕️', role: t('лікарка', 'врач', 'a doctor') };
const APTEKARKA = { name: 'Pani magister', emoji: '👩🏻‍⚕️', role: t('фармацевтка', 'фармацевт', 'a pharmacist') };
const FRYZJERKA = { name: 'Pani Ola', emoji: '👩🏽', role: t('перукарка', 'парикмахер', 'a hairdresser') };
const SERWISANT = { name: 'Pan Tomasz', emoji: '🧑🏻‍🔧', role: t('майстер сервісу', 'мастер сервиса', 'a service technician') };
const PRZEWODNIK = { name: 'Pan Jan', emoji: '🧔🏼', role: t('провідник по пущі', 'проводник по пуще', 'a forest guide') };

// ───────────────────────────── bia-1-spiesze-sie: Розпорядок дня (урок B1) ─────────────────────────────
const BIA1: LessonLevels = {
  B2: {
    explanation: t(
      '«Się», що змінює значення:\n• **zdawać** egzamin — складати; **zdawać się** — здаватися: **zdaje się, że** pada (здається, іде дощ);\n• **obejść się bez** + родовий — обійтися без: nie obejdę się **bez kawy**;\n• **zdecydować się na** + знахідний — зважитися на: zdecydowałam się **na przeprowadzkę**;\n• **wybierać się do / na** — збиратися кудись: wybieram się **na koncert**;\n• **rozminąć się z** + орудний — розминутися; **dogadać się z** + орудний — домовитися, порозумітися.',
      '«Się», меняющее значение:\n• **zdawać** egzamin — сдавать; **zdawać się** — казаться: **zdaje się, że** pada (кажется, идёт дождь);\n• **obejść się bez** + родительный — обойтись без: nie obejdę się **bez kawy**;\n• **zdecydować się na** + винительный — решиться на: zdecydowałam się **na przeprowadzkę**;\n• **wybierać się do / na** — собираться куда-то: wybieram się **na koncert**;\n• **rozminąć się z** + творительный — разминуться; **dogadać się z** + творительный — договориться, найти общий язык.',
      '«Się» that changes the meaning:\n• **zdawać** egzamin — to take an exam; **zdawać się** — to seem: **zdaje się, że** pada (it seems to be raining);\n• **obejść się bez** + genitive — to do without: nie obejdę się **bez kawy**;\n• **zdecydować się na** + accusative — to opt for: zdecydowałam się **na przeprowadzkę**;\n• **wybierać się do / na** — to be planning to go: wybieram się **na koncert**;\n• **rozminąć się z** + instrumental — to miss each other; **dogadać się z** + instrumental — to get along, agree.',
    ),
    examples: [
      { pl: 'Zdaje się, że autobus już odjechał — rozminęliśmy się z nim o minutę.', tr: t('Здається, автобус уже поїхав — ми розминулися з ним на хвилину.', 'Кажется, автобус уже уехал — мы разминулись с ним на минуту.', 'It looks like the bus has gone — we missed it by a minute.') },
      { pl: 'Rano nie obejdę się bez kawy, a wieczorem wybieram się na basen.', tr: t('Зранку я не обійдуся без кави, а ввечері збираюся в басейн.', 'Утром я не обойдусь без кофе, а вечером собираюсь в бассейн.', 'I can’t do without coffee in the morning, and tonight I’m off to the pool.') },
    ],
    exercises: [
      dialogue('dialogue.routine', KASIA, [
        {
          npc: 'Jakie masz plany na sobotę?',
          tr: t('Які в тебе плани на суботу?', 'Какие у тебя планы на субботу?', 'What are your plans for Saturday?'),
          choose: [
            ['Wybieram się na targ, a potem do Opery i Filharmonii Podlaskiej.', t('Збираюся на ринок, а потім до Підляської опери та філармонії.', 'Собираюсь на рынок, а потом в Подляшскую оперу и филармонию.', 'I’m off to the market, then to the Podlasie Opera and Philharmonic.')],
            ['Wybieram na targ, a potem do Opery i Filharmonii Podlaskiej.', t('(збиратися кудись — **wybierać się**; «wybierać» — вибирати)', '(собираться куда-то — **wybierać się**; «wybierać» — выбирать)', '(to be planning to go — **wybierać się**)')],
            ['Wybieram się w targ, a potem do Opery i Filharmonii Podlaskiej.', t('(на ринок — **na targ**)', '(на рынок — **na targ**)', '(to the market — **na targ**)')],
          ],
          feedback: t('**Wybierać się na / do**.', '**Wybierać się na / do**.', '**Wybierać się na / do**.'),
        },
        {
          npc: 'Super! Spotkamy się przed operą o szóstej?',
          tr: t('Супер! Зустрінемося перед оперою о шостій?', 'Супер! Встретимся у оперы в шесть?', 'Great! Shall we meet outside the opera at six?'),
          choose: [
            ['Dobrze, tylko zadzwoń, żebyśmy się nie rozminęli.', t('Добре, тільки подзвони, щоб ми не розминулися.', 'Хорошо, только позвони, чтобы мы не разминулись.', 'OK, just call so we don’t miss each other.')],
            ['Dobrze, tylko zadzwoń, żebyśmy się nie rozminiemy.', t('(після **żeby** — форма на -ł: **rozminęli**)', '(после **żeby** — форма на -ł: **rozminęli**)', '(after **żeby** — the -ł form)')],
            ['Dobrze, tylko zadzwoń, żebyśmy nie rozminęli.', t('(розминутися — **rozminąć się**)', '(разминуться — **rozminąć się**)', '(the verb is **rozminąć się**)')],
          ],
          feedback: t('**Żebyśmy się nie rozminęli**.', '**Żebyśmy się nie rozminęli**.', '**Żebyśmy się nie rozminęli**.'),
        },
      ]),
      fillGap('grammar.reflexive', 'Nie wyobrażam sobie poranka — nie obejdę się bez ___.', ['kawy', 'kawę', 'kawą', 'kawie'],
        t('Не уявляю ранку — я не обійдуся без кави.', 'Не представляю утра — я не обойдусь без кофе.', 'I can’t imagine a morning — I can’t do without coffee.'),
        t('**Obejść się bez** + родовий: bez **kawy**.', '**Obejść się bez** + родительный: bez **kawy**.', '**Obejść się bez** + genitive.')),
      fillGap('grammar.reflexive', 'Po długim namyśle zdecydowaliśmy się ___ przeprowadzkę do Białegostoku.', ['na', 'do', 'o', 'za'],
        t('Після довгих роздумів ми зважилися на переїзд до Білостока.', 'После долгих раздумий мы решились на переезд в Белосток.', 'After much thought we decided to move to Białystok.'),
        t('**Zdecydować się na** + знахідний.', '**Zdecydować się na** + винительный.', '**Zdecydować się na** + accusative.')),
      fillGap('grammar.reflexive', 'Zdaje ___, że Kasia już wyszła z pracy.', ['się', 'mi', 'sobie', 'siebie'],
        t('Здається, Кася вже пішла з роботи.', 'Кажется, Кася уже ушла с работы.', 'It seems Kasia has already left work.'),
        t('Здається — **zdaje się, że…** (без «się» — «складає»).', 'Кажется — **zdaje się, że…** (без «się» — «сдаёт»).', 'It seems — **zdaje się, że…**')),
      reading('reading.routine', 'Wiadomość od Kasi: „Wybieram się dziś do lekarza, więc spóźnię się do pracy. Zdaje się, że szef się nie obrazi — wczoraj dogadałam się z nim, że odrobię godziny w piątek. Bez kawy się dziś obejdę, bo jestem na czczo przed badaniem”.',
        t('Чому Кася сьогодні обійдеться без кави?', 'Почему Кася сегодня обойдётся без кофе?', 'Why is Kasia skipping coffee today?'),
        [t('бо їй треба бути натщесерце перед аналізом', 'потому что ей нужно быть натощак перед анализом', 'because she must fast before a test'), t('бо запізнюється на роботу', 'потому что опаздывает на работу', 'because she’s late for work'), t('бо начальник образився', 'потому что начальник обиделся', 'because the boss is offended')],
        t('«Bez kawy się dziś obejdę, **bo jestem na czczo przed badaniem**».', '«Bez kawy się dziś obejdę, **bo jestem na czczo przed badaniem**».', '“**bo jestem na czczo przed badaniem**”.')),
      reverseChoice('grammar.reflexive', t('Ми швидко порозумілися з новим сусідом.', 'Мы быстро нашли общий язык с новым соседом.', 'We quickly got on with the new neighbour.'),
        ['Szybko dogadaliśmy się z nowym sąsiadem.', 'Szybko dogadaliśmy z nowym sąsiadem.', 'Szybko dogadaliśmy się z nowy sąsiad.'],
        t('**Dogadać się z** + орудний: z **nowym sąsiadem**.', '**Dogadać się z** + творительный: z **nowym sąsiadem**.', '**Dogadać się z** + instrumental.')),
      findError('grammar.reflexive', ['Zdecydowałam', 'się', 'do', 'zmiany', 'pracy'], 2,
        t('Я зважилася на зміну роботи.', 'Я решилась на смену работы.', 'I decided to change jobs.'),
        t('**Zdecydować się na** + знахідний: **na** zmianę pracy.', '**Zdecydować się na** + винительный: **na** zmianę pracy.', '**Zdecydować się na**.')),
      build('grammar.reflexive', 'Zdaje się, że autobus już odjechał', t('Здається, автобус уже поїхав', 'Кажется, автобус уже уехал', 'It seems the bus has already left'), ['zdaję', 'odjeżdża'], [],
        t('Здається — **zdaje się, że…**', 'Кажется — **zdaje się, że…**', 'It seems — **zdaje się, że…**')),
      match('grammar.reflexive', [
        ['zdawać się', t('здаватися', 'казаться', 'to seem')],
        ['obejść się bez', t('обійтися без', 'обойтись без', 'to do without')],
        ['wybierać się na', t('збиратися на', 'собираться на', 'to be planning to go')],
        ['rozminąć się', t('розминутися', 'разминуться', 'to miss each other')],
      ]),
    ],
  },
};

// ───────────────────────────── bia-2-cieszy-sie: Почуття й керування (урок B1) ─────────────────────────────
const BIA2: LessonLevels = {
  B2: {
    explanation: t(
      'Дієслова з керуванням — книжні й розмовні:\n• **zależy mi na** + місцевий — мені важливо: zależy mi **na tej pracy**; **zależy mi, żeby**…;\n• **liczyć się z** + орудний — зважати на, бути готовим до: musimy liczyć się **z kosztami**;\n• **domagać się** + родовий — вимагати: mieszkańcy domagają się **remontu**;\n• **obawiać się** + родовий — побоюватися (книжне до «bać się»);\n• **przejmować się** + орудний — перейматися: nie przejmuj się **tym**; **żałować** + родовий: żałuję **decyzji**.',
      'Глаголы с управлением — книжные и разговорные:\n• **zależy mi na** + предложный — мне важно: zależy mi **na tej pracy**; **zależy mi, żeby**…;\n• **liczyć się z** + творительный — считаться с, быть готовым к: musimy liczyć się **z kosztami**;\n• **domagać się** + родительный — требовать: mieszkańcy domagają się **remontu**;\n• **obawiać się** + родительный — опасаться (книжное к «bać się»);\n• **przejmować się** + творительный — переживать из-за: nie przejmuj się **tym**; **żałować** + родительный: żałuję **decyzji**.',
      'Verbs and their cases — formal and colloquial:\n• **zależy mi na** + locative — it matters to me: zależy mi **na tej pracy**; **zależy mi, żeby**…;\n• **liczyć się z** + instrumental — to reckon with: musimy liczyć się **z kosztami**;\n• **domagać się** + genitive — to demand: mieszkańcy domagają się **remontu**;\n• **obawiać się** + genitive — to fear (formal for «bać się»);\n• **przejmować się** + instrumental — to worry about: nie przejmuj się **tym**; **żałować** + genitive: żałuję **decyzji**.',
    ),
    examples: [
      { pl: 'Bardzo mi zależy na tej pracy, więc liczę się z dłuższymi dojazdami.', tr: t('Мені дуже важлива ця робота, тож я готовий до довших доїздів.', 'Мне очень важна эта работа, так что я готов к более долгой дороге.', 'This job really matters to me, so I’m prepared for a longer commute.') },
      { pl: 'Mieszkańcy domagają się remontu ulicy Lipowej.', tr: t('Мешканці вимагають ремонту вулиці Ліповій.', 'Жители требуют ремонта улицы Липовой.', 'Residents are demanding that Lipowa Street be repaired.') },
    ],
    exercises: [
      dialogue('dialogue.feelings', KASIA, [
        {
          npc: 'Denerwujesz się przed rozmową o pracę?',
          tr: t('Хвилюєшся перед співбесідою?', 'Нервничаешь перед собеседованием?', 'Nervous about the job interview?'),
          choose: [
            ['Trochę. Bardzo mi zależy na tym stanowisku.', t('Трохи. Мені дуже важлива ця посада.', 'Немного. Мне очень важна эта должность.', 'A bit. I really want this position.')],
            ['Trochę. Bardzo mi zależy o tym stanowisku.', t('(**zależy mi na** + місцевий)', '(**zależy mi na** + предложный)', '(**zależy mi na** + locative)')],
            ['Trochę. Bardzo mnie zależy na tym stanowisku.', t('(кому — давальний: **mi** zależy)', '(кому — дательный: **mi** zależy)', '(dative: **mi** zależy)')],
          ],
          feedback: t('**Zależy mi na** + місцевий.', '**Zależy mi na** + предложный.', '**Zależy mi na** + locative.'),
        },
        {
          npc: 'Nie przejmuj się! A jeśli zaproponują niższą pensję?',
          tr: t('Не переймайся! А якщо запропонують нижчу зарплату?', 'Не переживай! А если предложат более низкую зарплату?', 'Don’t worry! And if they offer a lower salary?'),
          choose: [
            ['Liczę się z tym, ale będę negocjować.', t('Я готовий до цього, але торгуватимуся.', 'Я к этому готов, но буду торговаться.', 'I’m prepared for that, but I’ll negotiate.')],
            ['Liczę się z to, ale będę negocjować.', t('(**liczyć się z** + орудний: z **tym**)', '(**liczyć się z** + творительный: z **tym**)', '(**z** + instrumental: **tym**)')],
            ['Liczę z tym, ale będę negocjować.', t('(зважати на — **liczyć się z**)', '(считаться с — **liczyć się z**)', '(**liczyć się z**)')],
          ],
          feedback: t('**Liczyć się z** + орудний.', '**Liczyć się z** + творительный.', '**Liczyć się z** + instrumental.'),
        },
      ]),
      fillGap('grammar.government', 'Lokatorzy domagają się ___ windy.', ['naprawy', 'naprawę', 'naprawą', 'naprawie'],
        t('Мешканці вимагають ремонту ліфта.', 'Жильцы требуют ремонта лифта.', 'The tenants are demanding the lift be repaired.'),
        t('**Domagać się** + родовий: **naprawy**.', '**Domagać się** + родительный: **naprawy**.', '**Domagać się** + genitive.')),
      fillGap('grammar.government', 'Nie przejmuj się ___ — to nie twoja wina.', ['tym', 'to', 'tego', 'temu'],
        t('Не переймайся цим — це не твоя провина.', 'Не переживай из-за этого — это не твоя вина.', 'Don’t worry about it — it’s not your fault.'),
        t('**Przejmować się** + орудний: **tym**.', '**Przejmować się** + творительный: **tym**.', '**Przejmować się** + instrumental.')),
      fillGap('grammar.government', 'Do dziś żałuję tej ___.', ['decyzji', 'decyzję', 'decyzją', 'decyzja'],
        t('Досі шкодую про це рішення.', 'До сих пор жалею об этом решении.', 'I still regret that decision.'),
        t('**Żałować** + родовий: **decyzji** (без «o»).', '**Żałować** + родительный: **decyzji** (без «o»).', '**Żałować** + genitive.')),
      reading('reading.government', 'List do redakcji: „Mieszkańcy osiedla od dwóch lat domagają się budowy przejścia dla pieszych. Zależy nam przede wszystkim na bezpieczeństwie dzieci. Obawiamy się, że bez przejścia dojdzie do wypadku. Urząd twierdzi, że musimy liczyć się z długim czasem oczekiwania”.',
        t('Що найважливіше для мешканців?', 'Что важнее всего для жителей?', 'What matters most to the residents?'),
        [t('безпека дітей', 'безопасность детей', 'children’s safety'), t('швидка відповідь управи', 'быстрый ответ управы', 'a quick reply from the council'), t('ремонт будинків на житловому масиві', 'ремонт домов в микрорайоне', 'repairs to the estate’s buildings')],
        t('«**Zależy nam przede wszystkim na bezpieczeństwie dzieci**».', '«**Zależy nam przede wszystkim na bezpieczeństwie dzieci**».', '“**Zależy nam przede wszystkim na bezpieczeństwie dzieci**”.')),
      reverseChoice('grammar.government', t('Ми побоюємося зростання цін.', 'Мы опасаемся роста цен.', 'We fear rising prices.'),
        ['Obawiamy się wzrostu cen.', 'Obawiamy się wzrost cen.', 'Obawiamy się o wzrost cen.'],
        t('**Obawiać się** + родовий: **wzrostu**. («Obawiać się o» — боятися за когось.)', '**Obawiać się** + родительный: **wzrostu**. («Obawiać się o» — бояться за кого-то.)', '**Obawiać się** + genitive.')),
      findError('grammar.government', ['Bardzo', 'mi', 'zależy', 'na', 'twoja', 'opinia'], 4,
        t('Мені дуже важлива твоя думка.', 'Мне очень важно твоё мнение.', 'Your opinion matters a lot to me.'),
        t('**Zależy mi na** + місцевий: na **twojej opinii**.', '**Zależy mi na** + предложный: na **twojej opinii**.', '**Na** + locative.')),
      build('grammar.government', 'Musimy liczyć się z wyższymi kosztami', t('Ми мусимо бути готові до вищих витрат', 'Мы должны быть готовы к более высоким расходам', 'We must reckon with higher costs'), ['wyższe', 'koszty'], [],
        t('**Liczyć się z** + орудний множини: z **wyższymi kosztami**.', '**Liczyć się z** + творительный множественного: z **wyższymi kosztami**.', '**Liczyć się z** + instrumental plural.')),
      match('grammar.government', [
        ['zależy mi na', t('мені важливо', 'мне важно', 'it matters to me')],
        ['liczyć się z', t('зважати на', 'считаться с', 'to reckon with')],
        ['domagać się', t('вимагати', 'требовать', 'to demand')],
        ['przejmować się', t('перейматися', 'переживать', 'to worry')],
      ]),
    ],
  },
};

// ───────────────────────────── bia-3-boli: У лікаря (урок B1) ─────────────────────────────
const BIA3: LessonLevels = {
  B2: {
    explanation: t(
      'Історія хвороби (wywiad lekarski):\n• хронічне — **choruję na** + знахідний: na **cukrzycę**, na **astmę**; **cierpię na** + знахідний (книжне);\n• у минулому — **przeszedłem** + знахідний: przeszedłem **zapalenie płuc**, **operację**;\n• схильність — **mam skłonność do** + родовий: do **migren**;\n• симптоми — **objawy ustąpiły** (минули), **ból się nasila** (посилюється), **dolegliwości** (нездужання);\n• **od dawna przyjmuję** + знахідний — давно приймаю (ліки).',
      'История болезни (wywiad lekarski):\n• хроническое — **choruję na** + винительный: na **cukrzycę**, na **astmę**; **cierpię na** + винительный (книжное);\n• в прошлом — **przeszedłem** + винительный: przeszedłem **zapalenie płuc**, **operację**;\n• склонность — **mam skłonność do** + родительный: do **migren**;\n• симптомы — **objawy ustąpiły** (прошли), **ból się nasila** (усиливается), **dolegliwości** (недомогания);\n• **od dawna przyjmuję** + винительный — давно принимаю (лекарства).',
      'Taking a medical history (wywiad lekarski):\n• chronic conditions — **choruję na** + accusative: na **cukrzycę**, na **astmę**; **cierpię na** + accusative (formal);\n• past illness — **przeszedłem** + accusative: przeszedłem **zapalenie płuc**, **operację**;\n• tendencies — **mam skłonność do** + genitive: do **migren**;\n• symptoms — **objawy ustąpiły** (cleared up), **ból się nasila** (is getting worse), **dolegliwości** (complaints);\n• **od dawna przyjmuję** + accusative — I’ve long been taking.',
    ),
    examples: [
      { pl: 'Od pięciu lat choruję na astmę i przyjmuję leki wziewne.', tr: t('П’ять років я хворію на астму й приймаю інгаляційні ліки.', 'Пять лет я болею астмой и принимаю ингаляционные препараты.', 'I’ve had asthma for five years and use inhalers.') },
      { pl: 'Zeszłej zimy przeszłam zapalenie płuc, ale objawy szybko ustąpiły.', tr: t('Минулої зими я перенесла запалення легень, але симптоми швидко минули.', 'Прошлой зимой я перенесла воспаление лёгких, но симптомы быстро прошли.', 'Last winter I had pneumonia, but the symptoms cleared up quickly.') },
    ],
    exercises: [
      dialogue('dialogue.doctor', LEKARKA, [
        {
          npc: 'Czy choruje pan na coś przewlekle?',
          tr: t('Чи хворієте ви на щось хронічно?', 'Болеете ли вы чем-нибудь хронически?', 'Do you have any chronic conditions?'),
          choose: [
            ['Tak, od kilku lat choruję na cukrzycę.', t('Так, уже кілька років хворію на цукровий діабет.', 'Да, уже несколько лет болею диабетом.', 'Yes, I’ve had diabetes for several years.')],
            ['Tak, od kilku lat choruję cukrzycą.', t('(польською — **chorować na** + знахідний; «болею діабетом» — калька)', '(по-польски — **chorować na** + винительный; «болею диабетом» — калька)', '(Polish uses **chorować na** + accusative)')],
            ['Tak, od kilku lat choruję na cukrzyca.', t('(**na** + знахідний: na **cukrzycę**)', '(**na** + винительный: na **cukrzycę**)', '(**na** + accusative: **cukrzycę**)')],
          ],
          feedback: t('**Chorować na** + знахідний.', '**Chorować na** + винительный.', '**Chorować na** + accusative.'),
        },
        {
          npc: 'A jak się pan czuje od ostatniej wizyty?',
          tr: t('А як ви почуваєтеся від останнього візиту?', 'А как вы себя чувствуете после последнего визита?', 'And how have you felt since the last visit?'),
          choose: [
            ['Kaszel ustąpił, ale ból głowy się nasila.', t('Кашель минув, але головний біль посилюється.', 'Кашель прошёл, но головная боль усиливается.', 'The cough has gone, but the headache is getting worse.')],
            ['Kaszel ustąpił się, ale ból głowy się nasila.', t('(**ustąpić** — без «się»)', '(**ustąpić** — без «się»)', '(**ustąpić** takes no «się»)')],
            ['Kaszel ustąpił, ale ból głowy nasila.', t('(посилюватися — **nasilać się**)', '(усиливаться — **nasilać się**)', '(**nasilać się**)')],
          ],
          feedback: t('**Ustąpił** — без «się»; **nasila się** — із «się».', '**Ustąpił** — без «się»; **nasila się** — с «się».', '**Ustąpił** — no «się»; **nasila się** — with «się».'),
        },
      ]),
      fillGap('register.medical-history', 'W dzieciństwie przeszedłem ___ wyrostka.', ['zapalenie', 'zapalenia', 'zapaleniem', 'zapaleniu'],
        t('У дитинстві я переніс запалення апендикса.', 'В детстве я перенёс воспаление аппендикса.', 'As a child I had appendicitis.'),
        t('**Przejść** (хворобу) + знахідний: **zapalenie**.', '**Przejść** (болезнь) + винительный: **zapalenie**.', '**Przejść** + accusative.')),
      fillGap('register.medical-history', 'Mam skłonność do ___, szczególnie przy zmianie pogody.', ['migren', 'migreny', 'migreną', 'migrenach'],
        t('Я схильна до мігреней, особливо при зміні погоди.', 'У меня склонность к мигреням, особенно при смене погоды.', 'I’m prone to migraines, especially when the weather changes.'),
        t('**Skłonność do** + родовий множини: **migren**.', '**Skłonność do** + родительный множественного: **migren**.', '**Skłonność do** + genitive plural.')),
      fillGap('register.medical-history', 'Po trzech dniach objawy ___.', ['ustąpiły', 'ustąpiły się', 'ustępowały się', 'ustąpił'],
        t('Через три дні симптоми минули.', 'Через три дня симптомы прошли.', 'After three days the symptoms cleared up.'),
        t('Objawy — множина, без «się»: **ustąpiły**.', 'Objawy — множественное, без «się»: **ustąpiły**.', 'Plural, no «się»: **ustąpiły**.')),
      reading('reading.medical-history', 'Karta pacjenta: „Pacjent lat 45. Choruje na nadciśnienie, od dawna przyjmuje leki. W 2019 roku przeszedł operację kolana. Zgłasza bóle głowy, które nasilają się wieczorem. Uczulony na penicylinę”.',
        t('Що пацієнт переніс 2019 року?', 'Что пациент перенёс в 2019 году?', 'What did the patient undergo in 2019?'),
        [t('операцію на коліні', 'операцию на колене', 'knee surgery'), t('напад гіпертонії', 'приступ гипертонии', 'a hypertension attack'), t('алергію на пеніцилін', 'аллергию на пенициллин', 'a penicillin allergy')],
        t('«W 2019 roku **przeszedł operację kolana**». Гіпертонія — хронічна, алергія — постійна.', '«W 2019 roku **przeszedł operację kolana**». Гипертония — хроническая, аллергия — постоянная.', '“**przeszedł operację kolana**”; hypertension and the allergy are ongoing.')),
      reverseChoice('register.medical-history', t('Моя мама хворіє на астму.', 'Моя мама болеет астмой.', 'My mum has asthma.'),
        ['Moja mama choruje na astmę.', 'Moja mama choruje astmą.', 'Moja mama choruje z astmą.'],
        t('**Chorować na** + знахідний: na **astmę**.', '**Chorować na** + винительный: na **astmę**.', '**Chorować na** + accusative.')),
      findError('register.medical-history', ['Od', 'roku', 'cierpię', 'na', 'bezsenności'], 4,
        t('Уже рік я страждаю на безсоння.', 'Уже год я страдаю бессонницей.', 'I’ve suffered from insomnia for a year.'),
        t('**Cierpieć na** + знахідний: na **bezsenność**.', '**Cierpieć na** + винительный: na **bezsenność**.', '**Cierpieć na** + accusative.')),
      build('register.medical-history', 'Zeszłej zimy przeszłam zapalenie płuc', t('Минулої зими я перенесла запалення легень', 'Прошлой зимой я перенесла воспаление лёгких', 'Last winter I had pneumonia'), ['zapaleniem', 'przeszłem'], ['Zapalenie płuc przeszłam zeszłej zimy'],
        t('**Przejść** + знахідний; жінка — **przeszłam**.', '**Przejść** + винительный; женщина — **przeszłam**.', '**Przejść** + accusative; feminine **przeszłam**.')),
      match('register.medical-history', [
        ['chorować na cukrzycę', t('хворіти на діабет', 'болеть диабетом', 'to have diabetes')],
        ['objawy ustąpiły', t('симптоми минули', 'симптомы прошли', 'the symptoms cleared up')],
        ['nasilać się', t('посилюватися', 'усиливаться', 'to get worse')],
        ['wywiad lekarski', t('анамнез', 'анамнез', 'medical history')],
      ]),
    ],
  },
};

// ───────────────────────────── bia-4-apteka: В аптеці (урок B1) ─────────────────────────────
const BIA4: LessonLevels = {
  B2: {
    explanation: t(
      'Мова листка-вкладиша (ulotka):\n• **Przed użyciem zapoznaj się z treścią ulotki** — перед застосуванням ознайомтеся з вкладишем;\n• **stosować wyłącznie zgodnie z zaleceniem lekarza** — застосовувати лише за призначенням;\n• **działania niepożądane** — побічні дії; **w przypadku** + родовий: w przypadku **przedawkowania** (передозування);\n• **nie stosować u dzieci poniżej 12 lat** (u + родовий);\n• **przechowywać w miejscu niedostępnym dla dzieci** — зберігати в недоступному для дітей місці.',
      'Язык листка-вкладыша (ulotka):\n• **Przed użyciem zapoznaj się z treścią ulotki** — перед применением ознакомьтесь с инструкцией;\n• **stosować wyłącznie zgodnie z zaleceniem lekarza** — применять только по назначению;\n• **działania niepożądane** — побочные действия; **w przypadku** + родительный: w przypadku **przedawkowania** (передозировки);\n• **nie stosować u dzieci poniżej 12 lat** (u + родительный);\n• **przechowywać w miejscu niedostępnym dla dzieci** — хранить в недоступном для детей месте.',
      'The language of a patient leaflet (ulotka):\n• **Przed użyciem zapoznaj się z treścią ulotki** — read the leaflet before use;\n• **stosować wyłącznie zgodnie z zaleceniem lekarza** — use only as prescribed;\n• **działania niepożądane** — side effects; **w przypadku** + genitive: w przypadku **przedawkowania** (overdose);\n• **nie stosować u dzieci poniżej 12 lat** (u + genitive);\n• **przechowywać w miejscu niedostępnym dla dzieci** — keep out of the reach of children.',
    ),
    examples: [
      { pl: 'Leku nie należy stosować u dzieci poniżej dwunastu lat.', tr: t('Ліки не слід застосовувати дітям до дванадцяти років.', 'Лекарство не следует применять у детей младше двенадцати лет.', 'The medicine should not be given to children under twelve.') },
      { pl: 'W przypadku wystąpienia działań niepożądanych należy skontaktować się z lekarzem.', tr: t('У разі появи побічних дій слід звернутися до лікаря.', 'В случае появления побочных действий следует обратиться к врачу.', 'If side effects occur, contact a doctor.') },
    ],
    exercises: [
      dialogue('dialogue.pharmacy', APTEKARKA, [
        {
          npc: 'Ten syrop jest bez recepty. Czy to dla dorosłego?',
          tr: t('Цей сироп без рецепта. Це для дорослого?', 'Этот сироп без рецепта. Это для взрослого?', 'This syrup is over the counter. Is it for an adult?'),
          choose: [
            ['Nie, dla syna. Czy można go stosować u dzieci poniżej sześciu lat?', t('Ні, для сина. Чи можна давати його дітям до шести років?', 'Нет, для сына. Можно ли его давать детям младше шести лет?', 'No, for my son. Can it be given to children under six?')],
            ['Nie, dla syna. Czy można go stosować dla dzieci poniżej sześciu lat?', t('(у вкладишах — **u** + родовий: **u dzieci**)', '(во вкладышах — **u** + родительный: **u dzieci**)', '(leaflets use **u dzieci**)')],
            ['Nie, dla syna. Czy można go stosować u dzieci poniżej sześć lat?', t('(**poniżej** + родовий: **sześciu lat**)', '(**poniżej** + родительный: **sześciu lat**)', '(**poniżej** + genitive)')],
          ],
          feedback: t('**Stosować u dzieci poniżej sześciu lat**.', '**Stosować u dzieci poniżej sześciu lat**.', '**U dzieci poniżej sześciu lat**.'),
        },
        {
          npc: 'Od trzech lat tak, ale proszę zapoznać się z ulotką.',
          tr: t('Від трьох років так, але, будь ласка, ознайомтеся з вкладишем.', 'С трёх лет да, но, пожалуйста, ознакомьтесь с инструкцией.', 'From age three, yes, but please read the leaflet.'),
          choose: [
            ['Oczywiście. A co robić w przypadku działań niepożądanych?', t('Звісно. А що робити в разі побічних дій?', 'Конечно. А что делать в случае побочных действий?', 'Of course. And what should I do if there are side effects?')],
            ['Oczywiście. A co robić w przypadku działania niepożądane?', t('(**w przypadku** + родовий: **działań niepożądanych**)', '(**w przypadku** + родительный: **działań niepożądanych**)', '(**w przypadku** + genitive)')],
            ['Oczywiście. A co robić w przypadek działań niepożądanych?', t('(стала формула — **w przypadku**)', '(устойчивая формула — **w przypadku**)', '(set phrase: **w przypadku**)')],
          ],
          feedback: t('**W przypadku** + родовий.', '**W przypadku** + родительный.', '**W przypadku** + genitive.'),
        },
      ]),
      fillGap('register.leaflet', 'Lek należy przechowywać w miejscu ___ dla dzieci.', ['niedostępnym', 'niedostępny', 'niedostępnego', 'niedostępnej'],
        t('Ліки слід зберігати в недоступному для дітей місці.', 'Лекарство следует хранить в недоступном для детей месте.', 'Keep the medicine out of the reach of children.'),
        t('**W** + місцевий: w miejscu **niedostępnym**.', '**W** + предложный: w miejscu **niedostępnym**.', '**W** + locative.')),
      fillGap('register.leaflet', 'Przed użyciem należy zapoznać się z ___ ulotki.', ['treścią', 'treść', 'treści', 'treściach'],
        t('Перед застосуванням слід ознайомитися зі змістом вкладиша.', 'Перед применением следует ознакомиться с содержанием инструкции.', 'Read the leaflet before use.'),
        t('**Zapoznać się z** + орудний: z **treścią**.', '**Zapoznać się z** + творительный: z **treścią**.', '**Zapoznać się z** + instrumental.')),
      fillGap('register.leaflet', 'Lek stosować wyłącznie zgodnie z ___ lekarza.', ['zaleceniem', 'zalecenie', 'zalecenia', 'zaleceniu'],
        t('Застосовувати лише за призначенням лікаря.', 'Применять только по назначению врача.', 'Use only as directed by a doctor.'),
        t('**Zgodnie z** + орудний: z **zaleceniem**.', '**Zgodnie z** + творительный: z **zaleceniem**.', '**Zgodnie z** + instrumental.')),
      reading('reading.leaflet', 'Fragment ulotki: „Dorośli: 1 tabletka 3 razy na dobę, po posiłku. Nie stosować u dzieci poniżej 12 lat ani u kobiet w ciąży. W przypadku przedawkowania należy niezwłocznie skontaktować się z lekarzem. Przechowywać w temperaturze poniżej 25°C, w miejscu niedostępnym dla dzieci”.',
        t('Хто не повинен приймати ці таблетки?', 'Кто не должен принимать эти таблетки?', 'Who must not take these tablets?'),
        [t('діти до 12 років і вагітні жінки', 'дети младше 12 лет и беременные женщины', 'children under 12 and pregnant women'), t('дорослі після їжі', 'взрослые после еды', 'adults after meals'), t('люди, які зберігають ліки в теплі', 'люди, которые хранят лекарства в тепле', 'people who store medicine somewhere warm')],
        t('«**Nie stosować u dzieci poniżej 12 lat ani u kobiet w ciąży**».', '«**Nie stosować u dzieci poniżej 12 lat ani u kobiet w ciąży**».', '“**Nie stosować u dzieci poniżej 12 lat ani u kobiet w ciąży**”.')),
      reverseChoice('register.leaflet', t('У разі передозування негайно зверніться до лікаря.', 'В случае передозировки немедленно обратитесь к врачу.', 'In case of overdose, contact a doctor immediately.'),
        ['W przypadku przedawkowania należy niezwłocznie skontaktować się z lekarzem.', 'W przypadku przedawkowanie należy niezwłocznie skontaktować się z lekarzem.', 'W przypadku przedawkowania należy niezwłocznie skontaktować z lekarzem.'],
        t('**W przypadku** + родовий: **przedawkowania**; **skontaktować się z** + орудний.', '**W przypadku** + родительный: **przedawkowania**; **skontaktować się z** + творительный.', '**W przypadku** + genitive; **skontaktować się**.')),
      findError('register.leaflet', ['Nie', 'stosować', 'u', 'dzieci', 'poniżej', 'dwanaście', 'lat'], 5,
        t('Не застосовувати дітям до дванадцяти років.', 'Не применять у детей младше двенадцати лет.', 'Not for children under twelve.'),
        t('**Poniżej** + родовий: poniżej **dwunastu** lat.', '**Poniżej** + родительный: poniżej **dwunastu** lat.', '**Poniżej** + genitive.')),
      build('register.leaflet', 'Przechowywać w miejscu niedostępnym dla dzieci', t('Зберігати в недоступному для дітей місці', 'Хранить в недоступном для детей месте', 'Keep out of the reach of children'), ['niedostępny', 'dzieciom'], [],
        t('Формула вкладиша: **przechowywać w miejscu niedostępnym dla dzieci**.', 'Формула вкладыша: **przechowywać w miejscu niedostępnym dla dzieci**.', 'The standard leaflet formula.')),
      match('register.leaflet', [
        ['działania niepożądane', t('побічні дії', 'побочные действия', 'side effects')],
        ['przedawkowanie', t('передозування', 'передозировка', 'overdose')],
        ['ulotka', t('листок-вкладиш', 'вкладыш (инструкция)', 'patient leaflet')],
        ['na dobę', t('на добу', 'в сутки', 'per day')],
      ]),
    ],
  },
};

// ───────────────────────────── bia-5-fryzjer: Перукар (урок B1) ─────────────────────────────
const BIA5: LessonLevels = {
  B2: {
    explanation: t(
      'Перенести візит і висловити незадоволення ввічливо:\n• перенести — **przełożyć wizytę na** + знахідний (na czwartek); скасувати заздалегідь — **odwołać wizytę z wyprzedzeniem**;\n• **termin mi nie odpowiada** — час мені не підходить;\n• незадоволення — **nie jestem zadowolona z** + родовий; **chciałabym zgłosić zastrzeżenia** (висловити претензії);\n• рішення — **poprawka gratis** (безкоштовне виправлення), **rekompensata**, **w ramach** + родовий: w ramach **reklamacji**.',
      'Перенести визит и вежливо выразить недовольство:\n• перенести — **przełożyć wizytę na** + винительный (na czwartek); отменить заранее — **odwołać wizytę z wyprzedzeniem**;\n• **termin mi nie odpowiada** — время мне не подходит;\n• недовольство — **nie jestem zadowolona z** + родительный; **chciałabym zgłosić zastrzeżenia** (высказать претензии);\n• решение — **poprawka gratis** (бесплатное исправление), **rekompensata**, **w ramach** + родительный: w ramach **reklamacji**.',
      'Rescheduling and complaining politely:\n• to move — **przełożyć wizytę na** + accusative (na czwartek); to cancel in advance — **odwołać wizytę z wyprzedzeniem**;\n• **termin mi nie odpowiada** — that time doesn’t suit me;\n• dissatisfaction — **nie jestem zadowolona z** + genitive; **chciałabym zgłosić zastrzeżenia** (raise concerns);\n• remedies — **poprawka gratis** (a free touch-up), **rekompensata**, **w ramach** + genitive: w ramach **reklamacji**.',
    ),
    examples: [
      { pl: 'Czy mogłabym przełożyć wizytę na czwartek? Piątek mi nie odpowiada.', tr: t('Чи могла б я перенести візит на четвер? П’ятниця мені не підходить.', 'Могла бы я перенести визит на четверг? Пятница мне не подходит.', 'Could I move my appointment to Thursday? Friday doesn’t suit me.') },
      { pl: 'Nie jestem zadowolona z koloru, więc chciałabym zgłosić zastrzeżenia.', tr: t('Я не задоволена кольором, тому хотіла б висловити претензії.', 'Я недовольна цветом, поэтому хотела бы высказать претензии.', 'I’m not happy with the colour, so I’d like to raise a concern.') },
    ],
    exercises: [
      dialogue('dialogue.service', FRYZJERKA, [
        {
          npc: 'Salon „Ola”, dzień dobry. W czym mogę pomóc?',
          tr: t('Салон «Ола», добрий день. Чим можу допомогти?', 'Салон «Ола», добрый день. Чем могу помочь?', '“Ola” salon, good morning. How can I help?'),
          choose: [
            ['Chciałabym przełożyć wizytę z piątku na sobotę.', t('Я хотіла б перенести візит із п’ятниці на суботу.', 'Я хотела бы перенести визит с пятницы на субботу.', 'I’d like to move my appointment from Friday to Saturday.')],
            ['Chciałabym przełożyć wizytę z piątku do soboty.', t('(перенести на інший день — **na** + знахідний: na **sobotę**)', '(перенести на другой день — **na** + винительный: na **sobotę**)', '(to move to another day — **na sobotę**)')],
            ['Chciałabym przełożyć wizytę od piątku na sobotę.', t('(з якого дня — **z** + родовий: z **piątku**)', '(с какого дня — **z** + родительный: z **piątku**)', '(from which day — **z piątku**)')],
          ],
          feedback: t('**Przełożyć z piątku na sobotę**.', '**Przełożyć z piątku na sobotę**.', '**Przełożyć z piątku na sobotę**.'),
        },
        {
          npc: 'Oczywiście. Czy coś jeszcze?',
          tr: t('Звісно. Щось іще?', 'Конечно. Что-нибудь ещё?', 'Of course. Anything else?'),
          choose: [
            ['Tak, nie jestem zadowolona z ostatniego strzyżenia — grzywka jest za krótka.', t('Так, я не задоволена останньою стрижкою — чубчик закороткий.', 'Да, я недовольна последней стрижкой — чёлка слишком короткая.', 'Yes, I’m not happy with my last cut — the fringe is too short.')],
            ['Tak, nie jestem zadowolona z ostatnim strzyżeniem — grzywka jest za krótka.', t('(**zadowolona z** + родовий: z **ostatniego strzyżenia**)', '(**zadowolona z** + родительный: z **ostatniego strzyżenia**)', '(**zadowolona z** + genitive)')],
            ['Tak, nie jestem zadowolona od ostatniego strzyżenia — grzywka jest za krótka.', t('(задоволена чимось — **z**, а не «od»)', '(довольна чем-то — **z**, а не «od»)', '(**zadowolona z**, not «od»)')],
          ],
          feedback: t('**Zadowolona z** + родовий.', '**Zadowolona z** + родительный.', '**Zadowolona z** + genitive.'),
        },
      ]),
      fillGap('register.service', 'Wizytę należy odwołać z ___, najpóźniej dzień wcześniej.', ['wyprzedzeniem', 'wyprzedzenie', 'wyprzedzenia', 'wyprzedzeniu'],
        t('Візит слід скасувати заздалегідь, щонайпізніше за день.', 'Визит следует отменить заранее, не позднее чем за день.', 'Appointments must be cancelled in advance, at least a day before.'),
        t('Заздалегідь — **z wyprzedzeniem** (орудний).', 'Заранее — **z wyprzedzeniem** (творительный).', 'In advance — **z wyprzedzeniem**.')),
      fillGap('register.service', 'Ten termin niestety mi nie ___.', ['odpowiada', 'odpowiadam', 'odpowiedział', 'odpowiedź'],
        t('Цей час, на жаль, мені не підходить.', 'Это время, к сожалению, мне не подходит.', 'Unfortunately that time doesn’t suit me.'),
        t('Підходить (кому?) — **termin mi odpowiada**.', 'Подходит (кому?) — **termin mi odpowiada**.', '**Termin mi odpowiada** — it suits me.')),
      fillGap('register.service', 'W ramach reklamacji zaproponowano mi ___ gratis.', ['poprawkę', 'poprawka', 'poprawki', 'poprawką'],
        t('У межах скарги мені запропонували безкоштовне виправлення.', 'В рамках рекламации мне предложили бесплатное исправление.', 'As part of the complaint I was offered a free touch-up.'),
        t('Запропонували що — знахідний: **poprawkę**.', 'Предложили что — винительный: **poprawkę**.', 'Accusative: **poprawkę**.')),
      reading('reading.service', 'Regulamin salonu: „Wizytę można bezpłatnie przełożyć lub odwołać z co najmniej 24-godzinnym wyprzedzeniem. Klient, który nie jest zadowolony z usługi, może zgłosić zastrzeżenia w ciągu 7 dni. W ramach reklamacji salon oferuje bezpłatną poprawkę”.',
        t('Що салон пропонує в межах скарги?', 'Что салон предлагает в рамках рекламации?', 'What does the salon offer as part of a complaint?'),
        [t('безкоштовне виправлення', 'бесплатное исправление', 'a free touch-up'), t('повернення грошей', 'возврат денег', 'a refund'), t('знижку на наступний візит', 'скидку на следующий визит', 'a discount on the next visit')],
        t('«W ramach reklamacji salon oferuje **bezpłatną poprawkę**».', '«W ramach reklamacji salon oferuje **bezpłatną poprawkę**».', '“**bezpłatną poprawkę**”.')),
      reverseChoice('register.service', t('Я хотів би висловити претензії щодо послуги.', 'Я хотел бы высказать претензии по поводу услуги.', 'I’d like to raise a concern about the service.'),
        ['Chciałbym zgłosić zastrzeżenia do usługi.', 'Chciałbym zgłosić zastrzeżeniami do usługi.', 'Chciałbym zgłosić się zastrzeżenia do usługi.'],
        t('**Zgłosić** + знахідний: **zastrzeżenia**; без «się».', '**Zgłosić** + винительный: **zastrzeżenia**; без «się».', '**Zgłosić** + accusative; no «się».')),
      findError('register.service', ['Czy', 'mogę', 'przełożyć', 'wizytę', 'na', 'czwartku?'], 5,
        t('Чи можу я перенести візит на четвер?', 'Могу ли я перенести визит на четверг?', 'Can I move my appointment to Thursday?'),
        t('**Na** + знахідний: na **czwartek**.', '**Na** + винительный: na **czwartek**.', '**Na** + accusative.')),
      build('register.service', 'Nie jestem zadowolona z koloru włosów', t('Я не задоволена кольором волосся', 'Я недовольна цветом волос', 'I’m not happy with my hair colour'), ['kolorem', 'od'], [],
        t('**Zadowolona z** + родовий: z **koloru**.', '**Zadowolona z** + родительный: z **koloru**.', '**Zadowolona z** + genitive.')),
      match('register.service', [
        ['przełożyć wizytę', t('перенести візит', 'перенести визит', 'to reschedule')],
        ['z wyprzedzeniem', t('заздалегідь', 'заранее', 'in advance')],
        ['zgłosić zastrzeżenia', t('висловити претензії', 'высказать претензии', 'to raise concerns')],
        ['poprawka gratis', t('безкоштовне виправлення', 'бесплатное исправление', 'a free touch-up')],
      ]),
    ],
  },
};

// ───────────────────────────── bia-6-serwis: Ремонт (урок B1) ─────────────────────────────
const BIA6: LessonLevels = {
  B2: {
    explanation: t(
      'Права покупця й гарантія:\n• **wada fabryczna** — заводський брак; **uszkodzenie mechaniczne nie podlega gwarancji** — механічне пошкодження не покривається гарантією;\n• **podlegać** + давальний: podlega **naprawie**, **wymianie**;\n• вимога — **żądać** + родовий: żądam **wymiany na nowy**; **nieodpłatna naprawa** — безкоштовний ремонт;\n• терміни — **rozpatrzyć reklamację w ciągu 14 dni**; **odstąpić od umowy** — відмовитися від договору (повернути покупку).',
      'Права покупателя и гарантия:\n• **wada fabryczna** — заводской брак; **uszkodzenie mechaniczne nie podlega gwarancji** — механическое повреждение не покрывается гарантией;\n• **podlegać** + дательный: podlega **naprawie**, **wymianie**;\n• требование — **żądać** + родительный: żądam **wymiany na nowy**; **nieodpłatna naprawa** — бесплатный ремонт;\n• сроки — **rozpatrzyć reklamację w ciągu 14 dni**; **odstąpić od umowy** — отказаться от договора (вернуть покупку).',
      'Consumer rights and warranties:\n• **wada fabryczna** — a manufacturing defect; **uszkodzenie mechaniczne nie podlega gwarancji** — physical damage isn’t covered;\n• **podlegać** + dative: podlega **naprawie**, **wymianie** (is subject to repair, replacement);\n• demands — **żądać** + genitive: żądam **wymiany na nowy**; **nieodpłatna naprawa** — free repair;\n• deadlines — **rozpatrzyć reklamację w ciągu 14 dni**; **odstąpić od umowy** — to withdraw from the contract (return the purchase).',
    ),
    examples: [
      { pl: 'To wada fabryczna, więc telefon podlega nieodpłatnej naprawie.', tr: t('Це заводський брак, тож телефон підлягає безкоштовному ремонту.', 'Это заводской брак, так что телефон подлежит бесплатному ремонту.', 'It’s a manufacturing defect, so the phone qualifies for free repair.') },
      { pl: 'Ponieważ naprawa się nie udała, żądam wymiany na nowy egzemplarz.', tr: t('Оскільки ремонт не вдався, я вимагаю заміни на новий примірник.', 'Поскольку ремонт не удался, я требую замены на новый экземпляр.', 'Since the repair failed, I demand a replacement.') },
    ],
    exercises: [
      dialogue('dialogue.repair', SERWISANT, [
        {
          npc: 'Ekran jest pęknięty. Uszkodzenie mechaniczne nie podlega gwarancji.',
          tr: t('Екран тріснув. Механічне пошкодження не покривається гарантією.', 'Экран треснул. Механическое повреждение не покрывается гарантией.', 'The screen is cracked. Physical damage isn’t covered by the warranty.'),
          choose: [
            ['Ale ekran pękł sam, bez upadku — to wada fabryczna.', t('Але екран тріснув сам, без падіння, — це заводський брак.', 'Но экран треснул сам, без падения, — это заводской брак.', 'But it cracked on its own, without a drop — it’s a defect.')],
            ['Ale ekran pękł się sam, bez upadku — to wada fabryczna.', t('(тріснути — **pęknąć**, без «się»)', '(треснуть — **pęknąć**, без «się»)', '(**pęknąć** takes no «się»)')],
            ['Ale ekran pękł sam, bez upadku — to wadą fabryczną.', t('(після «to» — називний: **wada fabryczna**)', '(после «to» — именительный: **wada fabryczna**)', '(after «to» — nominative)')],
          ],
          feedback: t('**To wada fabryczna**.', '**To wada fabryczna**.', '**To wada fabryczna**.'),
        },
        {
          npc: 'W takim razie przyjmę reklamację. Czego pan oczekuje?',
          tr: t('У такому разі я прийму скаргу. Чого ви очікуєте?', 'В таком случае я приму рекламацию. Чего вы ожидаете?', 'In that case I’ll accept the claim. What do you expect?'),
          choose: [
            ['Żądam wymiany telefonu na nowy.', t('Я вимагаю заміни телефону на новий.', 'Я требую замены телефона на новый.', 'I want the phone replaced with a new one.')],
            ['Żądam wymianę telefonu na nowy.', t('(**żądać** + родовий: **wymiany**)', '(**żądać** + родительный: **wymiany**)', '(**żądać** + genitive)')],
            ['Żądam wymiany telefonu do nowego.', t('(замінити на — **wymiana na** + знахідний)', '(заменить на — **wymiana na** + винительный)', '(**wymiana na** + accusative)')],
          ],
          feedback: t('**Żądać wymiany na nowy**.', '**Żądać wymiany na nowy**.', '**Żądać wymiany na nowy**.'),
        },
      ]),
      fillGap('register.consumer', 'Sprzedawca ma obowiązek rozpatrzyć reklamację w ___ 14 dni.', ['ciągu', 'czasie', 'trakcie', 'okresie'],
        t('Продавець зобов’язаний розглянути скаргу протягом 14 днів.', 'Продавец обязан рассмотреть рекламацию в течение 14 дней.', 'The seller must deal with the complaint within 14 days.'),
        t('Протягом (терміну) — **w ciągu** + родовий.', 'В течение (срока) — **w ciągu** + родительный.', 'Within — **w ciągu** + genitive.')),
      fillGap('register.consumer', 'Ten rodzaj uszkodzenia nie podlega ___.', ['gwarancji', 'gwarancja', 'gwarancję', 'gwarancją'],
        t('Цей вид пошкодження не покривається гарантією.', 'Этот вид повреждения не покрывается гарантией.', 'This kind of damage isn’t covered by the warranty.'),
        t('**Podlegać** + давальний: **gwarancji**.', '**Podlegać** + дательный: **gwarancji**.', '**Podlegać** + dative.')),
      fillGap('register.consumer', 'Kupując przez internet, można odstąpić ___ umowy w ciągu 14 dni.', ['od', 'z', 'do', 'na'],
        t('Купуючи через інтернет, можна відмовитися від договору протягом 14 днів.', 'Покупая через интернет, можно отказаться от договора в течение 14 дней.', 'When buying online, you can withdraw from the contract within 14 days.'),
        t('**Odstąpić od** + родовий: **od** umowy.', '**Odstąpić od** + родительный: **od** umowy.', '**Odstąpić od** + genitive.')),
      reading('reading.consumer', 'Odpowiedź serwisu: „Po analizie zgłoszenia stwierdzono wadę fabryczną baterii. Urządzenie podlega nieodpłatnej naprawie, która potrwa do 10 dni roboczych. Jeżeli naprawa okaże się niemożliwa, klient może żądać wymiany na nowy egzemplarz lub zwrotu pieniędzy”.',
        t('Що станеться, якщо ремонт виявиться неможливим?', 'Что будет, если ремонт окажется невозможным?', 'What happens if the repair turns out to be impossible?'),
        [t('клієнт може вимагати заміни або повернення грошей', 'клиент может требовать замены или возврата денег', 'the customer can demand a replacement or a refund'), t('клієнт заплатить за ремонт', 'клиент заплатит за ремонт', 'the customer pays for the repair'), t('сервіс розгляне скаргу ще раз', 'сервис рассмотрит рекламацию ещё раз', 'the service will review the claim again')],
        t('«Jeżeli naprawa okaże się niemożliwa, klient **może żądać wymiany na nowy egzemplarz lub zwrotu pieniędzy**».', '«Jeżeli naprawa okaże się niemożliwa, klient **może żądać wymiany na nowy egzemplarz lub zwrotu pieniędzy**».', '“**może żądać wymiany… lub zwrotu pieniędzy**”.')),
      reverseChoice('register.consumer', t('Пральна машина підлягає безкоштовному ремонту.', 'Стиральная машина подлежит бесплатному ремонту.', 'The washing machine qualifies for free repair.'),
        ['Pralka podlega nieodpłatnej naprawie.', 'Pralka podlega nieodpłatną naprawę.', 'Pralka podlega się nieodpłatnej naprawie.'],
        t('**Podlegać** + давальний: **nieodpłatnej naprawie**; без «się».', '**Podlegać** + дательный: **nieodpłatnej naprawie**; без «się».', '**Podlegać** + dative; no «się».')),
      findError('register.consumer', ['Klient', 'żąda', 'zwrot', 'pieniędzy', 'za', 'laptop'], 2,
        t('Клієнт вимагає повернення грошей за ноутбук.', 'Клиент требует возврата денег за ноутбук.', 'The customer is demanding a refund for the laptop.'),
        t('**Żądać** + родовий: **zwrotu**.', '**Żądać** + родительный: **zwrotu**.', '**Żądać** + genitive.')),
      build('register.consumer', 'To wada fabryczna, więc należy mi się wymiana', t('Це заводський брак, тож мені належить заміна', 'Это заводской брак, так что мне положена замена', 'It’s a manufacturing defect, so I’m entitled to a replacement'), ['wadą', 'wymianę'], [],
        t('**Należy mi się** + називний: **wymiana** (розмовно — «мені належить»).', '**Należy mi się** + именительный: **wymiana** (разговорно — «мне положено»).', '**Należy mi się** + nominative.')),
      match('register.consumer', [
        ['wada fabryczna', t('заводський брак', 'заводской брак', 'manufacturing defect')],
        ['nieodpłatna naprawa', t('безкоштовний ремонт', 'бесплатный ремонт', 'free repair')],
        ['odstąpić od umowy', t('відмовитися від договору', 'отказаться от договора', 'to withdraw from a contract')],
        ['podlegać gwarancji', t('покриватися гарантією', 'покрываться гарантией', 'to be covered by warranty')],
      ]),
    ],
  },
};

// ───────────────────────────── bia-7-puszcza: Біловезька пуща (урок B1) ─────────────────────────────
const BIA7: LessonLevels = {
  B2: {
    explanation: t(
      'Мова охорони природи:\n• статус — **objęty ochroną ścisłą** (під суворою охороною), **wpisany na listę UNESCO**, **gatunek zagrożony wyginięciem**;\n• **na wolności** — на волі; **wyginąć** — вимерти; **przywrócić** + знахідний **naturze** — повернути природі;\n• **ingerencja człowieka** — втручання людини; **pozostawić las samemu sobie** — залишити ліс самому собі;\n• **pomimo** + родовий — попри: **pomimo protestów**; **na skutek** + родовий — внаслідок.',
      'Язык охраны природы:\n• статус — **objęty ochroną ścisłą** (под строгой охраной), **wpisany na listę UNESCO**, **gatunek zagrożony wyginięciem**;\n• **na wolności** — на воле; **wyginąć** — вымереть; **przywrócić** + винительный **naturze** — вернуть природе;\n• **ingerencja człowieka** — вмешательство человека; **pozostawić las samemu sobie** — оставить лес в покое;\n• **pomimo** + родительный — несмотря на: **pomimo protestów**; **na skutek** + родительный — вследствие.',
      'The language of nature conservation:\n• status — **objęty ochroną ścisłą** (under strict protection), **wpisany na listę UNESCO**, **gatunek zagrożony wyginięciem** (endangered species);\n• **na wolności** — in the wild; **wyginąć** — to die out; **przywrócić** + accusative **naturze** — to return to the wild;\n• **ingerencja człowieka** — human interference; **pozostawić las samemu sobie** — to leave the forest alone;\n• **pomimo** + genitive — despite: **pomimo protestów**; **na skutek** + genitive — as a result of.',
    ),
    examples: [
      { pl: 'Najcenniejsza część puszczy jest objęta ochroną ścisłą.', tr: t('Найцінніша частина пущі перебуває під суворою охороною.', 'Самая ценная часть пущи находится под строгой охраной.', 'The most valuable part of the forest is under strict protection.') },
      { pl: 'Na początku XX wieku żubry wyginęły na wolności, ale udało się je przywrócić naturze.', tr: t('На початку XX століття зубри вимерли на волі, але їх вдалося повернути природі.', 'В начале XX века зубры вымерли на воле, но их удалось вернуть природе.', 'Early in the 20th century bison died out in the wild, but they were successfully reintroduced.') },
    ],
    exercises: [
      dialogue('dialogue.forest', PRZEWODNIK, [
        {
          npc: 'Do rezerwatu ścisłego wchodzimy tylko z przewodnikiem. Wie pan dlaczego?',
          tr: t('У суворий заповідник заходимо лише з провідником. Знаєте чому?', 'В строгий заповедник входим только с проводником. Знаете почему?', 'We only enter the strict reserve with a guide. Do you know why?'),
          choose: [
            ['Bo ta część puszczy jest objęta ochroną ścisłą.', t('Бо ця частина пущі під суворою охороною.', 'Потому что эта часть пущи под строгой охраной.', 'Because this part of the forest is under strict protection.')],
            ['Bo ta część puszczy jest objęta ochronę ścisłą.', t('(**objęty** + орудний: **ochroną ścisłą**)', '(**objęty** + творительный: **ochroną ścisłą**)', '(**objęty** + instrumental)')],
            ['Bo ta część puszczy jest objęty ochroną ścisłą.', t('(część — жіночий рід: **objęta**)', '(część — женский род: **objęta**)', '(część is feminine: **objęta**)')],
          ],
          feedback: t('**Objęta ochroną ścisłą**.', '**Objęta ochroną ścisłą**.', '**Objęta ochroną ścisłą**.'),
        },
        {
          npc: 'Właśnie. A co pan wie o żubrach?',
          tr: t('Саме так. А що ви знаєте про зубрів?', 'Именно. А что вы знаете о зубрах?', 'Exactly. And what do you know about bison?'),
          choose: [
            ['Że wyginęły na wolności, ale udało się przywrócić je naturze.', t('Що вони вимерли на волі, але їх вдалося повернути природі.', 'Что они вымерли на воле, но их удалось вернуть природе.', 'That they died out in the wild but were successfully reintroduced.')],
            ['Że wyginęły na wolność, ale udało się przywrócić je naturze.', t('(де — місцевий: **na wolności**)', '(где — предложный: **na wolności**)', '(locative: **na wolności**)')],
            ['Że wyginęły na wolności, ale udało się przywrócić je naturę.', t('(кому повернути — давальний: **naturze**)', '(кому вернуть — дательный: **naturze**)', '(dative: **naturze**)')],
          ],
          feedback: t('**Na wolności**; **przywrócić naturze**.', '**Na wolności**; **przywrócić naturze**.', '**Na wolności**; **przywrócić naturze**.'),
        },
      ]),
      fillGap('register.nature', 'Żubr przez lata był gatunkiem zagrożonym ___.', ['wyginięciem', 'wyginięcie', 'wyginięcia', 'wyginąć'],
        t('Зубр роками був видом, що перебував під загрозою вимирання.', 'Зубр долгие годы был видом, находящимся под угрозой вымирания.', 'For years the bison was an endangered species.'),
        t('**Zagrożony** + орудний: **wyginięciem**.', '**Zagrożony** + творительный: **wyginięciem**.', '**Zagrożony** + instrumental.')),
      fillGap('register.nature', '___ protestów ekologów w puszczy prowadzono wycinkę.', ['Pomimo', 'Dzięki', 'Z powodu', 'Według'],
        t('Попри протести екологів, у пущі вели вирубку.', 'Несмотря на протесты экологов, в пуще вели вырубку.', 'Despite environmentalists’ protests, logging went ahead in the forest.'),
        t('Попри — **pomimo** + родовий.', 'Несмотря на — **pomimo** + родительный.', 'Despite — **pomimo** + genitive.')),
      fillGap('register.nature', 'Puszcza została wpisana na ___ światowego dziedzictwa UNESCO.', ['listę', 'liście', 'lista', 'listy'],
        t('Пущу внесли до списку світової спадщини ЮНЕСКО.', 'Пущу внесли в список всемирного наследия ЮНЕСКО.', 'The forest was added to the UNESCO World Heritage List.'),
        t('Куди — **na** + знахідний: na **listę**.', 'Куда — **na** + винительный: na **listę**.', 'Where to — **na listę**.')),
      reading('reading.nature', 'Z przewodnika: „Puszcza Białowieska to jeden z ostatnich lasów naturalnych w Europie. Na obszarze ochrony ścisłej las pozostawia się samemu sobie — martwe drzewa nie są usuwane, bo dają schronienie owadom i grzybom. Każda ingerencja człowieka jest tu ograniczona do minimum”.',
        t('Чому в суворому заповіднику не прибирають мертвих дерев?', 'Почему в строгом заповеднике не убирают мёртвые деревья?', 'Why are dead trees left in the strict reserve?'),
        [t('бо вони дають притулок комахам і грибам', 'потому что они дают убежище насекомым и грибам', 'because they shelter insects and fungi'), t('бо бракує працівників', 'потому что не хватает работников', 'because there aren’t enough workers'), t('бо так вимагають туристи', 'потому что так требуют туристы', 'because tourists want it that way')],
        t('«martwe drzewa nie są usuwane, **bo dają schronienie owadom i grzybom**».', '«martwe drzewa nie są usuwane, **bo dają schronienie owadom i grzybom**».', '“**bo dają schronienie owadom i grzybom**”.')),
      reverseChoice('register.nature', t('Внаслідок вирубки зникли деякі види птахів.', 'Вследствие вырубки исчезли некоторые виды птиц.', 'As a result of logging, some bird species disappeared.'),
        ['Na skutek wycinki zniknęły niektóre gatunki ptaków.', 'Na skutek wycinkę zniknęły niektóre gatunki ptaków.', 'W skutek wycinki zniknęły niektóre gatunki ptaków.'],
        t('**Na skutek** + родовий: **wycinki**.', '**Na skutek** + родительный: **wycinki**.', '**Na skutek** + genitive.')),
      findError('register.nature', ['Pomimo', 'deszcz', 'poszliśmy', 'na', 'wycieczkę', 'do', 'puszczy'], 1,
        t('Попри дощ ми пішли на екскурсію до пущі.', 'Несмотря на дождь, мы пошли на экскурсию в пущу.', 'Despite the rain we went on a trip to the forest.'),
        t('**Pomimo** + родовий: **deszczu**.', '**Pomimo** + родительный: **deszczu**.', '**Pomimo** + genitive.')),
      build('register.nature', 'Ta część lasu jest objęta ochroną ścisłą', t('Ця частина лісу під суворою охороною', 'Эта часть леса под строгой охраной', 'This part of the forest is under strict protection'), ['ochronę', 'objęty'], [],
        t('**Objęta** (część — ж. р.) + орудний **ochroną ścisłą**.', '**Objęta** (część — ж. р.) + творительный **ochroną ścisłą**.', 'Feminine **objęta** + instrumental.')),
      match('register.nature', [
        ['ochrona ścisła', t('сувора охорона', 'строгая охрана', 'strict protection')],
        ['wyginąć', t('вимерти', 'вымереть', 'to die out')],
        ['na wolności', t('на волі', 'на воле', 'in the wild')],
        ['ingerencja człowieka', t('втручання людини', 'вмешательство человека', 'human interference')],
      ]),
    ],
  },
};

// ───────────────────────────── bia-8-zamenhof: Заменгоф і Підляшшя (урок B1) ─────────────────────────────
const BIA8: LessonLevels = {
  B2: {
    explanation: t(
      'Історія ідей і багатокультурне місто:\n• **twórca** + родовий — творець: twórca **esperanta**; **dążyć do porozumienia** między narodami;\n• мета — **miał ułatwić** + знахідний: język **miał ułatwić** porozumienie (мав полегшити);\n• поступка — **mimo że** + речення; **pomimo** + родовий;\n• контраст — **o ile…, o tyle…**; **obok siebie** — пліч-о-пліч: żyli **obok siebie** Polacy, Żydzi, Białorusini;\n• вплив — **wywrzeć wpływ na** + знахідний: wywarł wpływ **na** jego poglądy.',
      'История идей и многокультурный город:\n• **twórca** + родительный — создатель: twórca **esperanta**; **dążyć do porozumienia** между народами;\n• цель — **miał ułatwić** + винительный: język **miał ułatwić** porozumienie (должен был облегчить);\n• уступка — **mimo że** + предложение; **pomimo** + родительный;\n• контраст — **o ile…, o tyle…**; **obok siebie** — бок о бок: żyli **obok siebie** Polacy, Żydzi, Białorusini;\n• влияние — **wywrzeć wpływ na** + винительный: wywarł wpływ **na** jego poglądy.',
      'The history of ideas and a multicultural city:\n• **twórca** + genitive — creator: twórca **esperanta**; **dążyć do porozumienia** between nations;\n• purpose — **miał ułatwić** + accusative: język **miał ułatwić** porozumienie (was meant to make easier);\n• concession — **mimo że** + clause; **pomimo** + genitive;\n• contrast — **o ile…, o tyle…**; **obok siebie** — side by side: żyli **obok siebie** Polacy, Żydzi, Białorusini;\n• influence — **wywrzeć wpływ na** + accusative: wywarł wpływ **na** jego poglądy.',
    ),
    examples: [
      { pl: 'Ludwik Zamenhof, twórca esperanta, urodził się w Białymstoku w 1859 roku.', tr: t('Людвік Заменгоф, творець есперанто, народився в Білостоці 1859 року.', 'Людвик Заменгоф, создатель эсперанто, родился в Белостоке в 1859 году.', 'Ludwik Zamenhof, the creator of Esperanto, was born in Białystok in 1859.') },
      { pl: 'Nowy język miał ułatwić porozumienie między ludźmi różnych narodowości.', tr: t('Нова мова мала полегшити порозуміння між людьми різних національностей.', 'Новый язык должен был облегчить взаимопонимание между людьми разных национальностей.', 'The new language was meant to help people of different nations understand each other.') },
    ],
    exercises: [
      dialogue('dialogue.history', KASIA, [
        {
          npc: 'Wiesz, dlaczego Zamenhof stworzył esperanto?',
          tr: t('Знаєш, чому Заменгоф створив есперанто?', 'Знаешь, почему Заменгоф создал эсперанто?', 'Do you know why Zamenhof created Esperanto?'),
          choose: [
            ['W Białymstoku żyli obok siebie ludzie różnych narodowości, którzy często się nie rozumieli.', t('У Білостоці пліч-о-пліч жили люди різних національностей, які часто не розуміли одне одного.', 'В Белостоке бок о бок жили люди разных национальностей, которые часто не понимали друг друга.', 'In Białystok people of many nations lived side by side and often didn’t understand each other.')],
            ['W Białymstoku żyli obok siebie ludzie różnych narodowości, które często się nie rozumieli.', t('(ludzie — чоловічо-особовий: **którzy**)', '(ludzie — мужско-личный: **którzy**)', '(ludzie is masculine-personal: **którzy**)')],
            ['W Białymstoku żyli obok sobie ludzie różnych narodowości, którzy często się nie rozumieli.', t('(стала фраза — **obok siebie**, родовий)', '(устойчивая фраза — **obok siebie**, родительный)', '(set phrase: **obok siebie**)')],
          ],
          feedback: t('**Obok siebie**; ludzie, **którzy**…', '**Obok siebie**; ludzie, **którzy**…', '**Obok siebie**; ludzie, **którzy**…'),
        },
        {
          npc: 'I esperanto miało to zmienić?',
          tr: t('І есперанто мало це змінити?', 'И эсперанто должно было это изменить?', 'And Esperanto was meant to change that?'),
          choose: [
            ['Tak, miało ułatwić porozumienie między narodami.', t('Так, воно мало полегшити порозуміння між народами.', 'Да, оно должно было облегчить взаимопонимание между народами.', 'Yes, it was meant to make understanding between nations easier.')],
            ['Tak, miało ułatwić porozumieniu między narodami.', t('(**ułatwić** + знахідний: **porozumienie**)', '(**ułatwić** + винительный: **porozumienie**)', '(**ułatwić** + accusative)')],
            ['Tak, miało ułatwić porozumienie między narodów.', t('(**między** + орудний: między **narodami**)', '(**między** + творительный: między **narodami**)', '(**między** + instrumental)')],
          ],
          feedback: t('**Miało ułatwić porozumienie między narodami**.', '**Miało ułatwić porozumienie między narodami**.', '**Miało ułatwić porozumienie między narodami**.'),
        },
      ]),
      fillGap('register.history', 'Wielokulturowe dzieciństwo wywarło ogromny wpływ ___ jego poglądy.', ['na', 'do', 'w', 'o'],
        t('Багатокультурне дитинство дуже вплинуло на його погляди.', 'Многокультурное детство оказало огромное влияние на его взгляды.', 'His multicultural childhood had a huge influence on his views.'),
        t('**Wywrzeć wpływ na** + знахідний.', '**Wywrzeć wpływ na** + винительный.', '**Wywrzeć wpływ na** + accusative.')),
      fillGap('register.history', '___ że esperanto nie stało się językiem światowym, mówią nim ludzie na całym świecie.', ['Mimo', 'Pomimo', 'Chociaż by', 'Dzięki'],
        t('Хоча есперанто не стало світовою мовою, ним розмовляють люди в усьому світі.', 'Хотя эсперанто не стало мировым языком, на нём говорят люди по всему миру.', 'Although Esperanto didn’t become a world language, people all over the world speak it.'),
        t('Перед «że» + речення — **mimo że**. («Pomimo» — з іменником: pomimo trudności.)', 'Перед «że» + предложение — **mimo że**. («Pomimo» — с существительным: pomimo trudności.)', 'Before «że» + clause — **mimo że**.')),
      fillGap('register.history', 'Zamenhof przez całe życie dążył ___ porozumienia między narodami.', ['do', 'na', 'ku', 'za'],
        t('Заменгоф усе життя прагнув порозуміння між народами.', 'Заменгоф всю жизнь стремился к взаимопониманию между народами.', 'Zamenhof strove all his life for understanding between nations.'),
        t('**Dążyć do** + родовий.', '**Dążyć do** + родительный.', '**Dążyć do** + genitive.')),
      reading('reading.history', 'Z przewodnika po Podlasiu: „O ile Białystok kojarzy się dziś głównie z Zamenhofem, o tyle mało kto wie, że w XIX wieku był ważnym ośrodkiem przemysłu włókienniczego. Pomimo zniszczeń wojennych zachował się Pałac Branickich, zwany Wersalem Podlasia. Po zwiedzaniu warto spróbować kartaczy i babki ziemniaczanej”.',
        t('Про що, за путівником, мало хто знає?', 'О чём, по словам путеводителя, мало кто знает?', 'According to the guide, what do few people know?'),
        [t('що в XIX столітті місто було важливим центром текстильної промисловості', 'что в XIX веке город был важным центром текстильной промышленности', 'that in the 19th century it was a major textile centre'), t('що Білосток пов’язаний із Заменгофом', 'что Белосток связан с Заменгофом', 'that Białystok is linked to Zamenhof'), t('що палац Браницьких зруйнували', 'что дворец Браницких разрушили', 'that the Branicki Palace was destroyed')],
        t('«o tyle **mało kto wie**, że w XIX wieku był **ważnym ośrodkiem przemysłu włókienniczego**». Палац, навпаки, «zachował się».', '«o tyle **mało kto wie**, że w XIX wieku był **ważnym ośrodkiem przemysłu włókienniczego**». Дворец, наоборот, «zachował się».', '“**mało kto wie**… ośrodkiem przemysłu włókienniczego”; the palace survived.')),
      reverseChoice('register.history', t('Попри війну палац зберігся.', 'Несмотря на войну, дворец сохранился.', 'Despite the war, the palace survived.'),
        ['Pomimo wojny pałac się zachował.', 'Pomimo wojnę pałac się zachował.', 'Mimo że wojny pałac się zachował.'],
        t('**Pomimo** + родовий: **wojny**; «mimo że» — лише з реченням.', '**Pomimo** + родительный: **wojny**; «mimo że» — только с предложением.', '**Pomimo** + genitive; «mimo że» needs a clause.')),
      findError('register.history', ['Zamenhof', 'był', 'twórcą', 'esperanto', 'i', 'lekarzem', 'okulistą'], 3,
        t('Заменгоф був творцем есперанто й лікарем-окулістом.', 'Заменгоф был создателем эсперанто и врачом-окулистом.', 'Zamenhof created Esperanto and was an eye doctor.'),
        t('**Twórca** + родовий: **esperanta** (esperanto відмінюється).', '**Twórca** + родительный: **esperanta** (esperanto склоняется).', 'Genitive: **esperanta**.')),
      build('register.history', 'Język miał ułatwić porozumienie między narodami', t('Мова мала полегшити порозуміння між народами', 'Язык должен был облегчить взаимопонимание между народами', 'The language was meant to ease understanding between nations'), ['porozumieniu', 'narodów'], [],
        t('**Miał ułatwić** + знахідний; **między** + орудний: **narodami**.', '**Miał ułatwić** + винительный; **między** + творительный: **narodami**.', '**Ułatwić** + accusative; **między** + instrumental.')),
      match('register.history', [
        ['twórca esperanta', t('творець есперанто', 'создатель эсперанто', 'creator of Esperanto')],
        ['obok siebie', t('пліч-о-пліч', 'бок о бок', 'side by side')],
        ['wywrzeć wpływ na', t('вплинути на', 'повлиять на', 'to influence')],
        ['kartacze', t('картачі (підляські картопляні пампухи з м’ясом)', 'картачи (подляшские картофельные клёцки с мясом)', 'kartacze (potato dumplings with meat)')],
      ]),
    ],
  },
};

// ───────────────────────────── bia-boss: Іспит Білостока (бос B1) ─────────────────────────────
const BIABOSS: LessonLevels = {
  B2: {
    explanation: t(
      'Повторення Білостока (B2):\n• «się» змінює значення — **zdawać się**, **obejść się bez**, **wybierać się na**, **zdecydować się na**;\n• керування — **zależy mi na** + місцевий, **liczyć się z** + орудний, **domagać się / żałować** + родовий;\n• лікар і аптека — **chorować na** + знахідний, **objawy ustąpiły**, **w przypadku** + родовий, **u dzieci poniżej**;\n• послуги — **przełożyć wizytę na**, **zadowolony z**, **podlegać gwarancji**, **żądać wymiany**;\n• природа й історія — **objęty ochroną**, **pomimo** + родовий, **mimo że** + речення, **twórca** + родовий.',
      'Повторение Белостока (B2):\n• «się» меняет значение — **zdawać się**, **obejść się bez**, **wybierać się na**, **zdecydować się na**;\n• управление — **zależy mi na** + предложный, **liczyć się z** + творительный, **domagać się / żałować** + родительный;\n• врач и аптека — **chorować na** + винительный, **objawy ustąpiły**, **w przypadku** + родительный, **u dzieci poniżej**;\n• услуги — **przełożyć wizytę na**, **zadowolony z**, **podlegać gwarancji**, **żądać wymiany**;\n• природа и история — **objęty ochroną**, **pomimo** + родительный, **mimo że** + предложение, **twórca** + родительный.',
      'Białystok review (B2):\n• «się» that changes meaning — **zdawać się**, **obejść się bez**, **wybierać się na**, **zdecydować się na**;\n• government — **zależy mi na** + locative, **liczyć się z** + instrumental, **domagać się / żałować** + genitive;\n• doctor and pharmacy — **chorować na** + accusative, **objawy ustąpiły**, **w przypadku** + genitive, **u dzieci poniżej**;\n• services — **przełożyć wizytę na**, **zadowolony z**, **podlegać gwarancji**, **żądać wymiany**;\n• nature and history — **objęty ochroną**, **pomimo** + genitive, **mimo że** + clause, **twórca** + genitive.',
    ),
    examples: [
      { pl: 'Zdaje się, że pomimo deszczu wybierasz się do puszczy.', tr: t('Здається, попри дощ ти збираєшся до пущі.', 'Кажется, несмотря на дождь, ты собираешься в пущу.', 'It seems you’re heading to the forest despite the rain.') },
      { pl: 'Telefon podlega gwarancji, więc żądam wymiany na nowy.', tr: t('Телефон на гарантії, тож я вимагаю заміни на новий.', 'Телефон на гарантии, так что я требую замены на новый.', 'The phone is under warranty, so I’m demanding a new one.') },
    ],
    exercises: [
      fillGap('vocab.boss', 'Rano nie obejdę się bez ___ herbaty.', ['gorącej', 'gorąca', 'gorącą', 'gorącym'],
        t('Зранку я не обійдуся без гарячого чаю.', 'Утром я не обойдусь без горячего чая.', 'I can’t do without a hot cup of tea in the morning.'),
        t('**Bez** + родовий: bez **gorącej** herbaty.', '**Bez** + родительный: bez **gorącej** herbaty.', '**Bez** + genitive.')),
      fillGap('vocab.boss', 'Od lat choruję ___ alergię na pyłki.', ['na', 'z', 'od', 'w'],
        t('Роками я хворію на алергію на пилок.', 'Годами я страдаю аллергией на пыльцу.', 'I’ve had a pollen allergy for years.'),
        t('**Chorować na** + знахідний.', '**Chorować na** + винительный.', '**Chorować na** + accusative.')),
      fillGap('vocab.boss', 'Mieszkańcy domagają się ___ wycinki drzew w parku.', ['wstrzymania', 'wstrzymanie', 'wstrzymaniem', 'wstrzymaniu'],
        t('Мешканці вимагають припинити вирубку дерев у парку.', 'Жители требуют остановить вырубку деревьев в парке.', 'Residents are demanding a halt to tree-felling in the park.'),
        t('**Domagać się** + родовий: **wstrzymania**.', '**Domagać się** + родительный: **wstrzymania**.', '**Domagać się** + genitive.')),
      reverseChoice('vocab.boss', t('Мені дуже важлива твоя допомога.', 'Мне очень важна твоя помощь.', 'Your help means a lot to me.'),
        ['Bardzo mi zależy na twojej pomocy.', 'Bardzo mi zależy na twoja pomoc.', 'Bardzo mnie zależy na twojej pomocy.'],
        t('**Zależy mi na** + місцевий: na **twojej pomocy**.', '**Zależy mi na** + предложный: na **twojej pomocy**.', '**Zależy mi na** + locative.')),
      reading('reading.boss', 'Bobek pisze do Kasi: „W sobotę wybierałem się do puszczy, ale zdaje się, że złapałem grypę. Pani doktor powiedziała, że objawy ustąpią po kilku dniach. W aptece dostałem syrop — w ulotce piszą, żeby nie stosować go u dzieci poniżej sześciu lat. Na szczęście nie jestem dzieckiem! Wizytę u fryzjera przełożyłem na przyszły czwartek”.',
        t('Що Бобек зробив із візитом до перукаря?', 'Что Бобек сделал с визитом к парикмахеру?', 'What did Bobek do about his hairdresser’s appointment?'),
        [t('переніс на наступний четвер', 'перенёс на следующий четверг', 'moved it to next Thursday'), t('скасував назовсім', 'отменил совсем', 'cancelled it for good'), t('пішов у суботу', 'сходил в субботу', 'went on Saturday')],
        t('«Wizytę u fryzjera **przełożyłem na przyszły czwartek**».', '«Wizytę u fryzjera **przełożyłem na przyszły czwartek**».', '“**przełożyłem na przyszły czwartek**”.')),
      dialogue('dialogue.boss', SERWISANT, [
        {
          npc: 'Słucham, w czym problem?',
          tr: t('Слухаю, у чому проблема?', 'Слушаю, в чём проблема?', 'Yes, what’s the problem?'),
          choose: [
            ['Nie jestem zadowolony z naprawy — telefon znowu się wyłącza.', t('Я не задоволений ремонтом — телефон знову вимикається.', 'Я недоволен ремонтом — телефон опять выключается.', 'I’m not happy with the repair — the phone keeps switching off.')],
            ['Nie jestem zadowolony z naprawą — telefon znowu się wyłącza.', t('(**zadowolony z** + родовий: z **naprawy**)', '(**zadowolony z** + родительный: z **naprawy**)', '(**zadowolony z** + genitive)')],
            ['Nie jestem zadowolony z naprawy — telefon znowu wyłącza.', t('(вимикатися — **wyłączać się**)', '(выключаться — **wyłączać się**)', '(**wyłączać się**)')],
          ],
          feedback: t('**Zadowolony z** + родовий; **wyłącza się**.', '**Zadowolony z** + родительный; **wyłącza się**.', '**Zadowolony z**; **wyłącza się**.'),
        },
        {
          npc: 'Rozumiem. Czego pan oczekuje?',
          tr: t('Розумію. Чого ви очікуєте?', 'Понимаю. Чего вы ожидаете?', 'I see. What do you expect?'),
          choose: [
            ['Ponieważ telefon podlega gwarancji, żądam wymiany na nowy.', t('Оскільки телефон на гарантії, я вимагаю заміни на новий.', 'Поскольку телефон на гарантии, я требую замены на новый.', 'Since the phone is under warranty, I want a new one.')],
            ['Ponieważ telefon podlega gwarancję, żądam wymiany na nowy.', t('(**podlegać** + давальний: **gwarancji**)', '(**podlegać** + дательный: **gwarancji**)', '(**podlegać** + dative)')],
            ['Ponieważ telefon podlega gwarancji, żądam wymianę na nowy.', t('(**żądać** + родовий: **wymiany**)', '(**żądać** + родительный: **wymiany**)', '(**żądać** + genitive)')],
          ],
          feedback: t('**Podlega gwarancji**; **żądam wymiany**.', '**Podlega gwarancji**; **żądam wymiany**.', '**Podlega gwarancji**; **żądam wymiany**.'),
        },
      ]),
      findError('vocab.boss', ['Mimo', 'że', 'zmęczenia,', 'poszliśmy', 'na', 'spacer'], 1,
        t('Попри втому ми пішли на прогулянку.', 'Несмотря на усталость, мы пошли на прогулку.', 'Despite being tired, we went for a walk.'),
        t('З іменником — **mimo / pomimo** + родовий, без «że».', 'С существительным — **mimo / pomimo** + родительный, без «że».', 'With a noun — **mimo** + genitive, no «że».')),
      build('vocab.boss', 'Musimy liczyć się z dłuższym czasem naprawy', t('Ми мусимо бути готові до довшого ремонту', 'Мы должны быть готовы к более долгому ремонту', 'We must reckon with a longer repair time'), ['dłuższy', 'czas'], [],
        t('**Liczyć się z** + орудний: z **dłuższym czasem**.', '**Liczyć się z** + творительный: z **dłuższym czasem**.', '**Liczyć się z** + instrumental.')),
      match('vocab.boss', [
        ['obejść się bez', t('обійтися без', 'обойтись без', 'to do without')],
        ['objawy ustąpiły', t('симптоми минули', 'симптомы прошли', 'the symptoms cleared up')],
        ['wada fabryczna', t('заводський брак', 'заводской брак', 'manufacturing defect')],
        ['pomimo', t('попри', 'несмотря на', 'despite')],
      ]),
    ],
  },
};

export const BIALYSTOK_LEVELS: Record<string, LessonLevels> = {
  'bia-1-spiesze-sie': BIA1,
  'bia-2-cieszy-sie': BIA2,
  'bia-3-boli': BIA3,
  'bia-4-apteka': BIA4,
  'bia-5-fryzjer': BIA5,
  'bia-6-serwis': BIA6,
  'bia-7-puszcza': BIA7,
  'bia-8-zamenhof': BIA8,
  'bia-boss': BIABOSS,
};

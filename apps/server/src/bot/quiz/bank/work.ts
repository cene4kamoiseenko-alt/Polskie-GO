/** Вопросы бота: работа (договор, смены, отпуск, больничный, разговор с начальником). */
import { q, type QuizQuestion } from './types';

export const WORK: QuizQuestion[] = [
  q({
    id: 'work-umowa', category: 'work', cefr: 'B1', kind: 'meaning', image: 'biuro',
    prompt: {
      ru: 'Знакомый рад: «W końcu podpisałem umowę na czas nieokreślony!» Что он подписал?',
      uk: 'Знайомий радіє: «W końcu podpisałem umowę na czas nieokreślony!» Що він підписав?',
      en: 'A friend is happy: «W końcu podpisałem umowę na czas nieokreślony!» What did he sign?',
    },
    options: {
      ru: ['бессрочный трудовой договор', 'трудовой договор на 3 месяца', 'бессрочный договор подряда', 'договор на испытательный срок'],
      uk: ['безстроковий трудовий договір', 'трудовий договір на 3 місяці', 'безстроковий договір підряду', 'договір на випробувальний строк'],
      en: ['a permanent employment contract', 'a 3-month employment contract', 'a permanent task contract', 'a probation-period contract'],
    },
    answer: 0,
    explain: {
      ru: '«Na czas nieokreślony» — на неопределённое время, то есть бессрочный (это трудовой договор). На срок — «na czas określony», испытательный — «na okres próbny», подряд — «umowa zlecenie» без срока не бывает.',
      uk: '«Na czas nieokreślony» — на невизначений час, тобто безстроковий (це трудовий договір). На строк — «na czas określony», випробувальний — «na okres próbny», підряд — «umowa zlecenie» безстроковою не буває.',
      en: '«Na czas nieokreślony» means for an indefinite period, i.e. a permanent employment contract. Fixed-term is «na czas określony», probation — «na okres próbny»; a task contract («umowa zlecenie») is never open-ended.',
    },
  }),
  q({
    id: 'work-sick', category: 'work', cefr: 'A2', kind: 'meaning', image: 'biuro',
    prompt: {
      ru: 'Коллега пишет: «Jestem na L4 do piątku.» Где он?',
      uk: 'Колега пише: «Jestem na L4 do piątku.» Де він?',
      en: 'A colleague writes: «Jestem na L4 do piątku.» Where is he?',
    },
    options: {
      ru: ['на больничном до пятницы', 'в отпуске до пятницы', 'на удалёнке до пятницы', 'в командировке до пятницы'],
      uk: ["на лікарняному до п'ятниці", "у відпустці до п'ятниці", "на віддаленці до п'ятниці", "у відрядженні до п'ятниці"],
      en: ['on sick leave until Friday', 'on holiday until Friday', 'working from home until Friday', 'on a business trip until Friday'],
    },
    answer: 0,
    explain: {
      ru: 'L4 — старое название бланка больничного, так в Польше и говорят: «jestem na L4» (официально — «zwolnienie lekarskie»). Отпуск — «urlop», удалёнка — «praca zdalna», командировка — «delegacja».',
      uk: 'L4 — стара назва бланка лікарняного, так у Польщі й кажуть: «jestem na L4» (офіційно — «zwolnienie lekarskie»). Відпустка — «urlop», віддалена робота — «praca zdalna», відрядження — «delegacja».',
      en: 'L4 is the old name of the sick-note form, and everyone still says «jestem na L4» (officially «zwolnienie lekarskie»). Holiday is «urlop», remote work — «praca zdalna», a business trip — «delegacja».',
    },
  }),
  q({
    id: 'work-o-ktorej', category: 'work', cefr: 'A2', kind: 'complete', image: 'biuro',
    prompt: {
      ru: 'Вставь: «___ kończysz dziś pracę?» — «Во сколько сегодня заканчиваешь работу?»',
      uk: 'Встав: «___ kończysz dziś pracę?» — «О котрій сьогодні закінчуєш роботу?»',
      en: 'Fill in: «___ kończysz dziś pracę?» — "What time do you finish work today?"',
    },
    options: ['O której', 'W której', 'Na której', 'Po której'],
    answer: 0,
    explain: {
      ru: 'Время по часам спрашивают с «o»: «O której?» — «Во сколько?», и ответ тоже с «o»: «O siedemnastej». «W której», «na której», «po której» — кальки, так не говорят.',
      uk: 'Час за годинником питають з «o»: «O której?» — «О котрій?», і відповідь теж з «o»: «O siedemnastej». «W której», «na której», «po której» — кальки, так не кажуть.',
      en: 'Clock time is asked with «o»: «O której?» — "At what time?", answered with «o» too: «O siedemnastej». «W której», «na której», «po której» are calques.',
    },
  }),
  q({
    id: 'work-nadgodziny', category: 'work', cefr: 'B1', kind: 'meaning', image: 'biuro',
    prompt: {
      ru: 'В расчётном листе: «nadgodziny: 12». Что это?',
      uk: 'У розрахунковому листі: «nadgodziny: 12». Що це?',
      en: 'Your payslip says «nadgodziny: 12». What is it?',
    },
    options: {
      ru: ['12 часов сверх нормы', '12 часов отгулов', '12 ночных часов', '12 часов на больничном'],
      uk: ['12 годин понад норму', '12 годин відгулів', '12 нічних годин', '12 годин на лікарняному'],
      en: ['12 hours of overtime', '12 hours of time off', '12 night-shift hours', '12 hours of sick leave'],
    },
    answer: 0,
    explain: {
      ru: '«Nadgodziny» — сверхурочные (nad — «сверх», godziny — «часы»): за них положена доплата или отгул. Отгул — «dzień wolny», ночная смена — «nocna zmiana», больничный — «L4».',
      uk: '«Nadgodziny» — понаднормові години (nad — «понад», godziny — «години»): за них належить доплата або відгул. Відгул — «dzień wolny», нічна зміна — «nocna zmiana», лікарняний — «L4».',
      en: '«Nadgodziny» is overtime (nad — "above", godziny — "hours"), paid extra or taken as time off. A day off is «dzień wolny», a night shift — «nocna zmiana», sick leave — «L4».',
    },
  }),
  q({
    id: 'work-wolne', category: 'work', cefr: 'B1', kind: 'situation', image: 'biuro',
    prompt: {
      ru: 'Ты (мужчина) вежливо просишь у начальницы выходной в пятницу. Какая фраза правильная?',
      uk: 'Ти (чоловік) ввічливо просиш у начальниці вихідний у п\'ятницю. Яка фраза правильна?',
      en: 'You (a man) politely ask your boss for Friday off. Which sentence is correct?',
    },
    options: ['Czy mógłbym wziąć wolne w piątek?', 'Czy mógłbym zabrać wolne w piątek?', 'Czy mógłbym wziąć wolny w piątek?', 'Czy mógłbym wziąć wolność w piątek?'],
    answer: 0,
    explain: {
      ru: '«Wziąć wolne» — взять выходной (wolne здесь существительное, «отгул»). «Zabrać» — забрать с собой, «wolny» — прилагательное «свободный», «wolność» — свобода. Женщина скажет «mogłabym».',
      uk: '«Wziąć wolne» — взяти вихідний (wolne тут іменник, «відгул»). «Zabrać» — забрати з собою, «wolny» — прикметник «вільний», «wolność» — свобода. Жінка скаже «mogłabym».',
      en: '«Wziąć wolne» means to take a day off (wolne is a noun here). «Zabrać» is to take away, «wolny» an adjective ("free"), «wolność» — freedom. A woman would say «mogłabym».',
    },
  }),
  q({
    id: 'work-pracujemy', category: 'work', cefr: 'A2', kind: 'verb', image: 'biuro',
    prompt: {
      ru: 'Вставь: «W tym tygodniu ___ na drugą zmianę.» (мы работаем)',
      uk: 'Встав: «W tym tygodniu ___ na drugą zmianę.» (ми працюємо)',
      en: 'Fill in: «W tym tygodniu ___ na drugą zmianę.» (we work)',
    },
    options: ['pracujemy', 'pracujmy', 'pracujący', 'pracować'],
    answer: 0,
    explain: {
      ru: '«My» — 1-е лицо множественного: pracujemy. «Pracujmy» — «давайте работать», «pracujący» — «работающий», «pracować» — неопределённая форма. «Druga zmiana» — вторая смена, после обеда.',
      uk: '«My» — 1-ша особа множини: pracujemy. «Pracujmy» — «працюймо», «pracujący» — «працюючий», «pracować» — неозначена форма. «Druga zmiana» — друга зміна, після обіду.',
      en: '«My» needs the first person plural: pracujemy. «Pracujmy» means "let\'s work", «pracujący» — "working" (participle), «pracować» — the infinitive. «Druga zmiana» is the afternoon shift.',
    },
  }),
];

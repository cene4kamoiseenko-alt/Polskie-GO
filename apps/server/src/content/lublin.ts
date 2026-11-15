/**
 * Lublin — B1: «Документи та установи». Справа в установі (w sprawie + родовий, załatwić sprawę, numerek, okienko, godziny urzędowania),
 * заява й додатки (złożyć wniosek o + знахідний, wypełnić drukowanymi literami, дієприкметники wymagany / wypełniony / podpisany),
 * особисті дані й дати (stan cywilny, PESEL, дата в родовому: urodziłem się piątego maja tysiąc dziewięćset dziewięćdziesiątego roku),
 * карта побуту (ważny do, przedłużyć, w ciągu + родовий), пошта (awizo, nadawca / adresat, za potwierdzeniem odbioru), банк (wpłacić / wypłacić,
 * zablokować kartę), договір (na podstawie, w razie, zobowiązać się do + родовий) і Люблінська унія 1569 року (безособове -no / -to: zawarto, podpisano).
 * Правила якості — docs/EXERCISE_QUALITY.md: у шагах діалогу по три варіанти, неправильні варіанти — різної природи.
 * Словник — vocab-lublin.ts. Тест — new-cities.test.ts. Уроки 5–8 й іспит — lublin-5-8.ts.
 */
import { t, wordChoice, fillGap, listen, findError, oddOne, reading, translate, grammar, build, match, speak, dialogue } from './builders';
import type { CityContent, LessonSeed } from './types';
import { LUB_5_8, LUB_BOSS } from './lublin-5-8';

const URZEDNICZKA = { name: 'Pani Jolanta', emoji: '👩🏼‍💼', role: t('працівниця установи', 'сотрудница учреждения', 'an office clerk') };
const URZEDNIK = { name: 'Pan Marek', emoji: '👨🏻‍💼', role: t('урядовець', 'чиновник', 'a civil servant') };

const LUB_1: LessonSeed = {
  slug: 'lub-1-sprawa',
  title: t('Справа в установі', 'Дело в учреждении', 'A matter at the office'),
  topic: t(
    'W jakiej sprawie? — w sprawie + родовий; załatwić sprawę; pobrać numerek, okienko, godziny urzędowania; podejść do + родовий',
    'W jakiej sprawie? — w sprawie + родительный; załatwić sprawę; pobrać numerek, okienko, godziny urzędowania; podejść do + родительный',
    'W jakiej sprawie? — w sprawie + genitive; załatwić sprawę; pobrać numerek, okienko, godziny urzędowania; podejść do + genitive',
  ),
  cefr: 'B1',
  difficulty: 3,
  explanation: t(
    '**Мета:** прийти в установу, пояснити, у якій ти справі, і зрозуміти, до якого віконця йти.\n**Jestem w sprawie** + родовий: **w sprawie karty pobytu**, **w sprawie zameldowania**. Питання — **W jakiej sprawie?** («у якій справі?»). **Załatwiać** справу — це процес, **załatwić** — результат: **Chcę załatwić sprawę dzisiaj**.\nУ черзі: **pobrać numerek** — узяти талон; **podejść do okienka numer pięć** — підійти до віконця №5 (**do** + родовий). Години роботи: **od poniedziałku do piątku, od ósmej do szesnastej** (**od / do** + родовий).',
    '**Цель:** прийти в учреждение, объяснить, по какому ты делу, и понять, к какому окошку идти.\n**Jestem w sprawie** + родительный: **w sprawie karty pobytu**, **w sprawie zameldowania**. Вопрос — **W jakiej sprawie?** («по какому делу?»). **Załatwiać** дело — это процесс, **załatwić** — результат: **Chcę załatwić sprawę dzisiaj**.\nВ очереди: **pobrać numerek** — взять номерок; **podejść do okienka numer pięć** — подойти к окошку №5 (**do** + родительный). Часы работы: **od poniedziałku do piątku, od ósmej do szesnastej** (**od / do** + родительный).',
    '**Goal:** walk into an office, say what your business is, and find the right window.\n**Jestem w sprawie** + genitive: **w sprawie karty pobytu**, **w sprawie zameldowania**. The question is **W jakiej sprawie?** (“what is it about?”). **Załatwiać** is the process, **załatwić** the result: **Chcę załatwić sprawę dzisiaj**.\nIn the queue: **pobrać numerek** — take a ticket; **podejść do okienka numer pięć** — go to window five (**do** + genitive). Opening hours: **od poniedziałku do piątku, od ósmej do szesnastej** (**od / do** + genitive).',
  ),
  examples: [
    { pl: 'Dzień dobry, jestem w sprawie karty pobytu.', tr: t('Добрий день, я у справі карти побуту.', 'Добрый день, я по делу карты побыта.', 'Hello, I’m here about a residence card.') },
    { pl: 'Proszę pobrać numerek i poczekać na swoją kolej.', tr: t('Будь ласка, візьміть талон і почекайте своєї черги.', 'Возьмите, пожалуйста, номерок и подождите своей очереди.', 'Please take a ticket and wait for your turn.') },
  ],
  words: ['załatwić', 'sprawa', 'urzędnik', 'godziny urzędowania', 'poczekać', 'przyjmować'],
  exercises: [
    dialogue('dialogue.sprawa', URZEDNICZKA, [
      {
        npc: 'Dzień dobry. W jakiej sprawie pan przyszedł?',
        tr: t('Добрий день. У якій справі ви прийшли?', 'Добрый день. По какому делу вы пришли?', 'Good morning. What is your business?'),
        choose: [
          ['Dzień dobry, jestem w sprawie karty pobytu.', t('Добрий день, я у справі карти побуту.', 'Добрый день, я по делу карты побыта.', 'Hello, I’m here about a residence card.')],
          ['Dzień dobry, jestem w sprawę karty pobytu.', t('(**w sprawie** — місцевий відмінок: «у справі»; **w sprawę** — помилка)', '(**w sprawie** — предложный падеж: «по делу»; **w sprawę** — ошибка)', '(**w sprawie** is the locative, “about”; **w sprawę** is wrong)')],
          ['Dzień dobry, jestem w sprawie karta pobytu.', t('(після **w sprawie** — родовий: **karty pobytu**)', '(после **w sprawie** — родительный: **karty pobytu**)', '(after **w sprawie** use the genitive: **karty pobytu**)')],
        ],
        feedback: t('**w sprawie** + родовий.', '**w sprawie** + родительный.', '**w sprawie** + genitive.'),
      },
      {
        npc: 'Proszę pobrać numerek i poczekać na swoją kolej.',
        tr: t('Будь ласка, візьміть талон і почекайте своєї черги.', 'Возьмите, пожалуйста, номерок и подождите своей очереди.', 'Please take a ticket and wait for your turn.'),
        choose: [
          ['Dziękuję. A do którego okienka mam potem podejść?', t('Дякую. А до якого віконця мені потім підійти?', 'Спасибо. А к какому окошку мне потом подойти?', 'Thank you. And which window do I go to afterwards?')],
          ['Dziękuję. A do które okienko mam potem podejść?', t('(**do** + родовий: **do którego okienka**)', '(**do** + родительный: **do którego okienka**)', '(**do** + genitive: **do którego okienka**)')],
          ['Dziękuję. A na którym okienku mam potem podejść?', t('(рух «куди?» — **do** + родовий; **na którym** — це «де?»)', '(движение «куда?» — **do** + родительный; **na którym** — это «где?»)', '(movement “to” takes **do** + genitive; **na którym** means “where”)')],
        ],
        feedback: t('**podejść do** + родовий: do którego okienka.', '**podejść do** + родительный: do którego okienka.', '**podejść do** + genitive: do którego okienka.'),
      },
    ]),
    wordChoice('vocab.sprawa', 'załatwić', [t('владнати (справу)', 'уладить (дело)', 'to sort out (a matter)'), t('відкласти (справу)', 'отложить (дело)', 'to put off (a matter)'), t('програти (справу)', 'проиграть (дело)', 'to lose (a case)')]),
    fillGap('grammar.sprawa', 'Jestem tu ___ zameldowania.', ['w sprawie', 'w sprawę', 'o sprawie'], t('Я тут у справі реєстрації.', 'Я здесь по делу регистрации.', 'I’m here about registration.'),
      t('**w sprawie** + родовий: w sprawie zameldowania.', '**w sprawie** + родительный: w sprawie zameldowania.', '**w sprawie** + genitive: w sprawie zameldowania.')),
    match('vocab.sprawa', [
      ['pobrać numerek', t('взяти талон у черзі', 'взять номерок в очереди', 'to take a queue ticket')],
      ['godziny urzędowania', t('години роботи установи', 'часы работы учреждения', 'office hours')],
      ['przyjmować', t('приймати (відвідувачів)', 'принимать (посетителей)', 'to receive (visitors)')],
      ['urzędnik', t('службовець установи', 'служащий учреждения', 'office clerk')],
    ]),
    grammar('grammar.sprawa', 'Wczoraj w końcu ___ tę sprawę w urzędzie.', 'załatwić', ['załatwiłem', 'załatwiłam'], t('Вчора я нарешті владнав цю справу в установі.', 'Вчера я наконец уладил это дело в учреждении.', 'Yesterday I finally sorted this matter out at the office.'),
      t('**Wczoraj** — минулий час, результат: **załatwiłem** (доконаний вид).', '**Wczoraj** — прошедшее время, результат: **załatwiłem** (совершенный вид).', '**Wczoraj** needs the past tense, and a result takes the perfective: **załatwiłem**.')),
    listen('listening.sprawa', 'Urząd przyjmuje od poniedziałku do piątku od ósmej do szesnastej.', ['Urząd przyjmuje od poniedziałku do piątku od ósmej do szesnastej.', 'Urząd przyjmuje od wtorku do piątku od ósmej do szesnastej.', 'Urząd przyjmuje od poniedziałku do piątku od ósmej do piętnastej.']),
    reading('reading.sprawa', 'Urząd Miasta — Wydział Spraw Obywatelskich. Godziny urzędowania: poniedziałek 8:00–18:00, wtorek i środa 8:00–16:00, czwartek 8:00–16:00, piątek 8:00–15:00. Numerki wydajemy do pół godziny przed zamknięciem. W soboty i niedziele urząd jest nieczynny.',
      t('До котрої години в понеділок можна взяти талон?', 'До какого часа в понедельник можно взять номерок?', 'Until what time can you take a ticket on Monday?'),
      [t('до 17:30', 'до 17:30', 'until 5.30 p.m.'), t('до 18:00', 'до 18:00', 'until 6 p.m.'), t('до 14:30', 'до 14:30', 'until 2.30 p.m.')]),
    findError('grammar.sprawa', ['Proszę', 'podejść', 'na', 'okienka', 'numer', 'pięć'], 2, t('Будь ласка, підійдіть до віконця номер п’ять.', 'Подойдите, пожалуйста, к окошку номер пять.', 'Please go to window number five.'),
      t('Рух «до чого?» — **do** + родовий: **do okienka**.', 'Движение «к чему?» — **do** + родительный: **do okienka**.', 'Movement towards — **do** + genitive: **do okienka**.')),
    build('grammar.sprawa', 'Jestem w sprawie karty pobytu', t('Я у справі карти побуту', 'Я по делу карты побыта', 'I am here about a residence card'), ['kartę', 'sprawę']),
    oddOne('grammar.sprawa', ['w sprawie wniosku', 'w sprawie zameldowania', 'w sprawie karty pobytu', 'w sprawie podatek'], 3,
      t('Після **w sprawie** — родовий: **w sprawie podatku**, а не називний.', 'После **w sprawie** — родительный: **w sprawie podatku**, а не именительный.', 'After **w sprawie** use the genitive: **w sprawie podatku**, not the nominative.'),
      t('Яка фраза містить помилку?', 'Какое выражение содержит ошибку?', 'Which expression contains a mistake?')),
    translate('writing.sprawa', t('Я тут у справі реєстрації. Де можна взяти талон?', 'Я здесь по делу регистрации. Где можно взять номерок?', 'I’m here about registration. Where can I get a ticket?'),
      ['Jestem tu w sprawie zameldowania. Gdzie mogę pobrać numerek?', 'Jestem tutaj w sprawie zameldowania. Gdzie mogę pobrać numerek?', 'Jestem tu w sprawie zameldowania. Gdzie można pobrać numerek?', 'Jestem tutaj w sprawie zameldowania. Gdzie można pobrać numerek?']),
    speak('speaking.sprawa', 'Dzień dobry, jestem w sprawie zameldowania i chcę pobrać numerek.', t('Добрий день, я у справі реєстрації й хочу взяти талон.', 'Добрый день, я по делу регистрации и хочу взять номерок.', 'Hello, I’m here about registration and I’d like a ticket.')),
  ],
};

const LUB_2: LessonSeed = {
  slug: 'lub-2-wniosek',
  title: t('Заява й додатки', 'Заявление и приложения', 'The application and its attachments'),
  topic: t(
    'Złożyć wniosek o + знахідний, załączniki, podpis, pieczątka; дієприкметники як прикметники: wymagany, wypełniony, podpisany; drukowanymi literami',
    'Złożyć wniosek o + винительный, załączniki, podpis, pieczątka; причастия как прилагательные: wymagany, wypełniony, podpisany; drukowanymi literami',
    'Złożyć wniosek o + accusative, załączniki, podpis, pieczątka; participles as adjectives: wymagany, wypełniony, podpisany; drukowanymi literami',
  ),
  cefr: 'B1',
  difficulty: 3,
  explanation: t(
    '**Мета:** подати заяву й зрозуміти, що саме вимагає установа.\n**Złożyć wniosek o** + знахідний: **wniosek o kartę pobytu**. До заяви додають **załączniki** («додатки»): **kopia paszportu**, **zdjęcie**, **zaświadczenie**. Підписують **własnoręcznie** (власноруч), а писати просять **drukowanymi literami** (орудний множини: «друкованими літерами»).\n**Дієприкметники як прикметники** (на **-ny / -ty**): **wymagany** → **wymagane dokumenty**, **wypełniony wniosek**, **podpisana umowa**. Вони узгоджуються з іменником за родом, числом і відмінком: чоловічий **wypełniony wniosek**, жіночий **podpisana umowa**, множина **wymagane dokumenty**.',
    '**Цель:** подать заявление и понять, чего именно требует учреждение.\n**Złożyć wniosek o** + винительный: **wniosek o kartę pobytu**. К заявлению прилагают **załączniki** («приложения»): **kopia paszportu**, **zdjęcie**, **zaświadczenie**. Подписывают **własnoręcznie** (собственноручно), а писать просят **drukowanymi literami** (творительный множественного: «печатными буквами»).\n**Причастия как прилагательные** (на **-ny / -ty**): **wymagany** → **wymagane dokumenty**, **wypełniony wniosek**, **podpisana umowa**. Они согласуются с существительным по роду, числу и падежу: мужской **wypełniony wniosek**, женский **podpisana umowa**, множественное **wymagane dokumenty**.',
    '**Goal:** file an application and understand exactly what the office requires.\n**Złożyć wniosek o** + accusative: **wniosek o kartę pobytu**. An application comes with **załączniki** (“attachments”): **kopia paszportu**, **zdjęcie**, **zaświadczenie**. You sign **własnoręcznie** (by hand) and are asked to write **drukowanymi literami** (instrumental plural: “in block capitals”).\n**Participles as adjectives** (ending in **-ny / -ty**): **wymagany** → **wymagane dokumenty**, **wypełniony wniosek**, **podpisana umowa**. They agree with the noun in gender, number and case: masculine **wypełniony wniosek**, feminine **podpisana umowa**, plural **wymagane dokumenty**.',
  ),
  examples: [
    { pl: 'Proszę wypełnić wniosek drukowanymi literami i podpisać go własnoręcznie.', tr: t('Будь ласка, заповніть заяву друкованими літерами й підпишіть її власноруч.', 'Заполните, пожалуйста, заявление печатными буквами и подпишите его собственноручно.', 'Please fill in the application in block capitals and sign it by hand.') },
    { pl: 'Do wniosku trzeba dołączyć wymagane dokumenty.', tr: t('До заяви треба додати необхідні документи.', 'К заявлению нужно приложить необходимые документы.', 'You have to attach the required documents to the application.') },
  ],
  words: ['złożyć', 'załącznik', 'kopia', 'podpis', 'pieczątka', 'wymagany', 'podpisać'],
  exercises: [
    dialogue('dialogue.wniosek', URZEDNIK, [
      {
        npc: 'Czy ma pan wszystkie wymagane dokumenty?',
        tr: t('Чи є у вас усі необхідні документи?', 'Есть ли у вас все необходимые документы?', 'Do you have all the required documents?'),
        choose: [
          ['Tak, mam wypełniony wniosek i kopię paszportu.', t('Так, у мене є заповнена заява й копія паспорта.', 'Да, у меня есть заполненное заявление и копия паспорта.', 'Yes, I have the completed application and a copy of my passport.')],
          ['Tak, mam wypełnioną wniosek i kopię paszportu.', t('(**wniosek** — чоловічий рід: **wypełniony wniosek**)', '(**wniosek** — мужской род: **wypełniony wniosek**)', '(**wniosek** is masculine: **wypełniony wniosek**)')],
          ['Tak, mam wypełniony wniosek i kopię paszport.', t('(**kopia** + родовий: **kopię paszportu**)', '(**kopia** + родительный: **kopię paszportu**)', '(**kopia** takes the genitive: **kopię paszportu**)')],
        ],
        feedback: t('**wypełniony wniosek** — дієприкметник узгоджується з іменником у роді.', '**wypełniony wniosek** — причастие согласуется с существительным в роде.', '**wypełniony wniosek** — the participle agrees with the noun in gender.'),
      },
      {
        npc: 'Proszę podpisać tutaj, na dole.',
        tr: t('Будь ласка, підпишіть тут, унизу.', 'Подпишите, пожалуйста, здесь, внизу.', 'Please sign here, at the bottom.'),
        choose: [
          ['Czy mogę podpisać długopisem?', t('Чи можна підписати кульковою ручкою?', 'Можно подписать шариковой ручкой?', 'May I sign with a ballpoint pen?')],
          ['Czy mogę podpisać długopis?', t('(чим? — орудний: **długopisem**)', '(чем? — творительный: **długopisem**)', '(with what? — the instrumental: **długopisem**)')],
          ['Czy mogę podpisać z długopisem?', t('(знаряддя дії — орудний без прийменника: **długopisem**)', '(орудие действия — творительный без предлога: **długopisem**)', '(an instrument takes the instrumental without a preposition: **długopisem**)')],
        ],
        feedback: t('Знаряддя дії — орудний без прийменника: **długopisem**.', 'Орудие действия — творительный без предлога: **długopisem**.', 'An instrument takes the instrumental with no preposition: **długopisem**.'),
      },
    ]),
    wordChoice('vocab.wniosek', 'pieczątka', [t('печатка, штамп', 'печать, штамп', 'stamp'), t('підпис', 'подпись', 'signature'), t('додаток', 'приложение', 'attachment')]),
    fillGap('grammar.wniosek', 'Do wniosku dołączam wszystkie ___ dokumenty.', ['wymagane', 'wymagany', 'wymaganych'], t('До заяви я додаю всі необхідні документи.', 'К заявлению я прикладываю все необходимые документы.', 'I attach all the required documents to the application.'),
      t('**dokumenty** — множина не особова: **wymagane dokumenty**.', '**dokumenty** — множественное неличное: **wymagane dokumenty**.', '**dokumenty** is plural (non-personal): **wymagane dokumenty**.')),
    match('vocab.wniosek', [
      ['złożyć wniosek', t('подати заяву', 'подать заявление', 'to file an application')],
      ['załącznik', t('додаток до заяви', 'приложение к заявлению', 'attachment')],
      ['kopia', t('копія документа', 'копия документа', 'copy of a document')],
      ['podpis', t('підпис', 'подпись', 'signature')],
    ]),
    grammar('grammar.wniosek', 'Oddaję urzędnikowi ___ umowę.', 'podpisany', ['podpisaną'], t('Віддаю службовцю підписаний договір.', 'Отдаю служащему подписанный договор.', 'I hand the clerk the signed contract.'),
      t('**umowa** — жіночий рід, знахідний: **podpisaną umowę**.', '**umowa** — женский род, винительный: **podpisaną umowę**.', '**umowa** is feminine, accusative: **podpisaną umowę**.')),
    listen('listening.wniosek', 'Do wniosku trzeba dołączyć kopię paszportu i jedno zdjęcie.', ['Do wniosku trzeba dołączyć kopię paszportu i jedno zdjęcie.', 'Do wniosku trzeba dołączyć kopię paszportu i dwa zdjęcia.', 'Do wniosku trzeba dołączyć kopię umowy i jedno zdjęcie.']),
    reading('reading.wniosek', 'Wniosek o wydanie karty pobytu należy złożyć osobiście. Do wniosku dołącza się: cztery zdjęcia, kopię paszportu oraz zaświadczenie o zameldowaniu. Wniosek należy wypełnić drukowanymi literami i podpisać własnoręcznie. Opłata (przykładowa) wynosi 200 zł i trzeba ją wpłacić przed złożeniem wniosku.',
      t('Що треба зробити перед поданням заяви?', 'Что нужно сделать перед подачей заявления?', 'What must be done before filing the application?'),
      [t('сплатити збір', 'оплатить сбор', 'pay the fee'), t('зробити копію договору', 'сделать копию договора', 'copy the rental contract'), t('отримати печатку в установі', 'получить печать в учреждении', 'get a stamp at the office')]),
    findError('grammar.wniosek', ['Proszę', 'wypełnić', 'wniosek', 'drukowanym', 'literami'], 3, t('Будь ласка, заповніть заяву друкованими літерами.', 'Заполните, пожалуйста, заявление печатными буквами.', 'Please fill in the application in block capitals.'),
      t('Орудний множини: **drukowanymi literami** — прикметник у тому ж відмінку й числі.', 'Творительный множественного: **drukowanymi literami** — прилагательное в том же падеже и числе.', 'Instrumental plural: **drukowanymi literami** — the adjective takes the same case and number.')),
    build('grammar.wniosek', 'Wniosek należy podpisać własnoręcznie', t('Заяву треба підписати власноруч', 'Заявление нужно подписать собственноручно', 'The application must be signed by hand'), ['podpisany', 'własnoręczny']),
    oddOne('grammar.wniosek', ['wypełniony wniosek', 'podpisana umowa', 'wymagane zaświadczenie', 'załączony kopia'], 3,
      t('**Kopia** — жіночий рід: **załączona kopia**.', '**Kopia** — женский род: **załączona kopia**.', '**Kopia** is feminine: **załączona kopia**.'),
      t('Яка фраза містить помилку?', 'Какое выражение содержит ошибку?', 'Which expression contains a mistake?')),
    translate('writing.wniosek', t('Я заповнив заяву й підписав її власноруч.', 'Я заполнил заявление и подписал его собственноручно.', 'I filled in the application and signed it by hand.'),
      ['Wypełniłem wniosek i podpisałem go własnoręcznie', 'Wypełniłem wniosek i własnoręcznie go podpisałem', 'Wypełniłam wniosek i podpisałam go własnoręcznie', 'Wypełniłam wniosek i własnoręcznie go podpisałam']),
    speak('speaking.wniosek', 'Chcę złożyć wniosek o kartę pobytu i dołączyć kopię paszportu.', t('Я хочу подати заяву на карту побуту й додати копію паспорта.', 'Я хочу подать заявление на карту побыта и приложить копию паспорта.', 'I’d like to file an application for a residence card and attach a copy of my passport.')),
  ],
};

const LUB_3: LessonSeed = {
  slug: 'lub-3-dane',
  title: t('Особисті дані й дати', 'Личные данные и даты', 'Personal data and dates'),
  topic: t(
    'Formularz: nazwisko, data i miejsce urodzenia, obywatelstwo, stan cywilny; дата в родовому: urodziłem się piątego maja tysiąc dziewięćset dziewięćdziesiątego roku',
    'Formularz: nazwisko, data i miejsce urodzenia, obywatelstwo, stan cywilny; дата в родительном: urodziłem się piątego maja tysiąc dziewięćset dziewięćdziesiątego roku',
    'Formularz: nazwisko, data i miejsce urodzenia, obywatelstwo, stan cywilny; the date in the genitive: urodziłem się piątego maja tysiąc dziewięćset dziewięćdziesiątego roku',
  ),
  cefr: 'B1',
  difficulty: 3,
  explanation: t(
    '**Мета:** заповнити анкету й правильно назвати дату.\nУ повній даті **все — у родовому**: день (порядковий числівник) + місяць + рік: **piątego maja tysiąc dziewięćset dziewięćdziesiątego roku** (5.05.1990). Місяці в родовому: **stycznia, lutego, marca, kwietnia, maja, czerwca, lipca, sierpnia, września, października, listopada, grudnia**. Дні: **pierwszego, drugiego, trzeciego… dwudziestego, trzydziestego pierwszego**.\nУ анкеті: **imię i nazwisko**, **nazwisko panieńskie**, **data i miejsce urodzenia**, **obywatelstwo** (ukraińskie, polskie — середній рід!), **stan cywilny** (**żonaty / zamężna**), **adres zameldowania**. Номер **PESEL** має 11 цифр, перші шість — дата народження. Попросять **przeliterować** — назвати по літерах.',
    '**Цель:** заполнить анкету и правильно назвать дату.\nВ полной дате **всё — в родительном**: день (порядковое числительное) + месяц + год: **piątego maja tysiąc dziewięćset dziewięćdziesiątego roku** (5.05.1990). Месяцы в родительном: **stycznia, lutego, marca, kwietnia, maja, czerwca, lipca, sierpnia, września, października, listopada, grudnia**. Дни: **pierwszego, drugiego, trzeciego… dwudziestego, trzydziestego pierwszego**.\nВ анкете: **imię i nazwisko**, **nazwisko panieńskie**, **data i miejsce urodzenia**, **obywatelstwo** (ukraińskie, polskie — средний род!), **stan cywilny** (**żonaty / zamężna**), **adres zameldowania**. Номер **PESEL** состоит из 11 цифр, первые шесть — дата рождения. Попросят **przeliterować** — назвать по буквам.',
    '**Goal:** fill in a form and say a date correctly.\nIn a full date **everything is genitive**: day (ordinal) + month + year: **piątego maja tysiąc dziewięćset dziewięćdziesiątego roku** (5 May 1990). Months in the genitive: **stycznia, lutego, marca, kwietnia, maja, czerwca, lipca, sierpnia, września, października, listopada, grudnia**. Days: **pierwszego, drugiego, trzeciego… dwudziestego, trzydziestego pierwszego**.\nOn a form: **imię i nazwisko**, **nazwisko panieńskie**, **data i miejsce urodzenia**, **obywatelstwo** (ukraińskie, polskie — neuter!), **stan cywilny** (**żonaty / zamężna**), **adres zameldowania**. A **PESEL** has 11 digits, the first six are the date of birth. You may be asked to **przeliterować** — spell it out.',
  ),
  examples: [
    { pl: 'Urodziłem się piątego maja tysiąc dziewięćset dziewięćdziesiątego roku.', tr: t('Я народився п’ятого травня тисяча дев’ятсот дев’яностого року.', 'Я родился пятого мая тысяча девятьсот девяностого года.', 'I was born on the fifth of May, nineteen ninety.') },
    { pl: 'Jak się pisze pani nazwisko? Proszę przeliterować.', tr: t('Як пишеться ваше прізвище? Будь ласка, назвіть по літерах.', 'Как пишется ваша фамилия? Назовите, пожалуйста, по буквам.', 'How do you spell your surname? Please spell it out.') },
  ],
  words: ['obywatelstwo', 'stan cywilny', 'miejsce urodzenia', 'adres zameldowania', 'PESEL', 'nazwisko panieńskie'],
  exercises: [
    dialogue('dialogue.dane', URZEDNICZKA, [
      {
        npc: 'Proszę podać datę urodzenia.',
        tr: t('Будь ласка, назвіть дату народження.', 'Назовите, пожалуйста, дату рождения.', 'Please give your date of birth.'),
        choose: [
          ['Urodziłem się dwunastego marca tysiąc dziewięćset dziewięćdziesiątego piątego roku.', t('Я народився дванадцятого березня тисяча дев’ятсот дев’яносто п’ятого року.', 'Я родился двенадцатого марта тысяча девятьсот девяносто пятого года.', 'I was born on the twelfth of March nineteen ninety-five.')],
          ['Urodziłem się dwunasty marca tysiąc dziewięćset dziewięćdziesiątego piątego roku.', t('(день у даті — порядковий числівник у родовому: **dwunastego marca**)', '(день в дате — порядковое числительное в родительном: **dwunastego marca**)', '(the day in a date is an ordinal in the genitive: **dwunastego marca**)')],
          ['Urodziłem się dwunastego marzec tysiąc dziewięćset dziewięćdziesiątego piątego roku.', t('(місяць у даті — родовий: **marca**)', '(месяц в дате — родительный: **marca**)', '(the month in a date is genitive: **marca**)')],
        ],
        feedback: t('У даті день, місяць і рік — у родовому: **dwunastego marca … piątego roku**.', 'В дате день, месяц и год — в родительном: **dwunastego marca … piątego roku**.', 'In a date the day, month and year are all genitive: **dwunastego marca … piątego roku**.'),
      },
      {
        npc: 'Jakie ma pan obywatelstwo i jaki stan cywilny?',
        tr: t('Яке у вас громадянство й сімейний стан?', 'Какое у вас гражданство и семейное положение?', 'What is your citizenship and marital status?'),
        choose: [
          ['Mam obywatelstwo ukraińskie, jestem żonaty.', t('Я маю українське громадянство, я одружений.', 'У меня украинское гражданство, я женат.', 'I have Ukrainian citizenship, I’m married.')],
          ['Mam obywatelstwo ukraiński, jestem żonaty.', t('(**obywatelstwo** — середній рід: **ukraińskie**)', '(**obywatelstwo** — средний род: **ukraińskie**)', '(**obywatelstwo** is neuter: **ukraińskie**)')],
          ['Mam obywatelstwo ukraińskie, jestem żonatym.', t('(після **jestem** з прикметником — називний: **żonaty**)', '(после **jestem** с прилагательным — именительный: **żonaty**)', '(after **jestem** an adjective stays nominative: **żonaty**)')],
        ],
        feedback: t('**obywatelstwo** — середній рід; **jestem żonaty** — називний.', '**obywatelstwo** — средний род; **jestem żonaty** — именительный.', '**obywatelstwo** is neuter; **jestem żonaty** is nominative.'),
      },
    ]),
    wordChoice('vocab.dane', 'obywatelstwo', [t('громадянство', 'гражданство', 'citizenship'), t('національність', 'национальность', 'nationality'), t('місце проживання', 'место проживания', 'place of residence')]),
    fillGap('grammar.dane', 'Urodziłem się piątego ___ tysiąc dziewięćset dziewięćdziesiątego roku.', ['maja', 'maj', 'maju'], t('Я народився п’ятого травня тисяча дев’ятсот дев’яностого року.', 'Я родился пятого мая тысяча девятьсот девяностого года.', 'I was born on the fifth of May, nineteen ninety.'),
      t('Місяць у даті — родовий: **piątego maja**.', 'Месяц в дате — родительный: **piątego maja**.', 'The month in a date is genitive: **piątego maja**.')),
    match('vocab.dane', [
      ['stan cywilny', t('сімейний стан', 'семейное положение', 'marital status')],
      ['miejsce urodzenia', t('місце народження', 'место рождения', 'place of birth')],
      ['adres zameldowania', t('адреса реєстрації', 'адрес регистрации', 'registered address')],
      ['nazwisko panieńskie', t('дівоче прізвище', 'девичья фамилия', 'maiden name')],
    ]),
    grammar('grammar.dane', 'Urodziłem się ___ czerwca.', 'dwudziesty', ['dwudziestego'], t('Я народився двадцятого червня.', 'Я родился двадцатого июня.', 'I was born on the twentieth of June.'),
      t('День у даті — порядковий числівник у родовому: **dwudziestego czerwca**.', 'День в дате — порядковое числительное в родительном: **dwudziestego czerwca**.', 'The day in a date is an ordinal in the genitive: **dwudziestego czerwca**.')),
    listen('listening.dane', 'Urodziłam się trzydziestego listopada tysiąc dziewięćset osiemdziesiątego roku.', ['Urodziłam się trzydziestego listopada tysiąc dziewięćset osiemdziesiątego roku.', 'Urodziłam się trzydziestego października tysiąc dziewięćset osiemdziesiątego roku.', 'Urodziłam się trzynastego listopada tysiąc dziewięćset osiemdziesiątego roku.']),
    reading('reading.dane', 'Imię: Olena. Nazwisko: Kowalenko. Nazwisko panieńskie: Szewczuk. Data urodzenia: 14.02.1988. Miejsce urodzenia: Winnica. Obywatelstwo: ukraińskie. Stan cywilny: zamężna. Adres zameldowania: ul. Lipowa 5/12, 20-001 Lublin.',
      t('Коли народилася Олена?', 'Когда родилась Олена?', 'When was Olena born?'),
      [t('чотирнадцятого лютого 1988 року', 'четырнадцатого февраля 1988 года', 'on 14 February 1988'), t('чотирнадцятого січня 1988 року', 'четырнадцатого января 1988 года', 'on 14 January 1988'), t('другого квітня 1988 року', 'второго апреля 1988 года', 'on 2 April 1988')]),
    findError('grammar.dane', ['Urodziłam', 'się', 'piętnastego', 'maj', 'tysiąc', 'dziewięćset', 'dziewięćdziesiątego', 'roku'], 3, t('Я народилася п’ятнадцятого травня тисяча дев’ятсот дев’яностого року.', 'Я родилась пятнадцатого мая тысяча девятьсот девяностого года.', 'I was born on the fifteenth of May, nineteen ninety.'),
      t('Місяць у даті — родовий: **maja**.', 'Месяц в дате — родительный: **maja**.', 'The month in a date is genitive: **maja**.')),
    build('grammar.dane', 'Moje nazwisko panieńskie to Szewczuk', t('Моє дівоче прізвище — Шевчук', 'Моя девичья фамилия — Шевчук', 'My maiden name is Szewczuk'), ['panieńska', 'nazywam']),
    oddOne('grammar.dane', ['trzeciego maja', 'dwudziestego marca', 'piątego listopada', 'dziesiąty lipca'], 3,
      t('У даті день — у родовому: **dziesiątego lipca**.', 'В дате день — в родительном: **dziesiątego lipca**.', 'In a date the day is genitive: **dziesiątego lipca**.'),
      t('Яка дата записана неправильно?', 'Какая дата записана неправильно?', 'Which date is written incorrectly?')),
    translate('writing.dane', t('Моє дівоче прізвище — Шевчук. Я народилася у Вінниці.', 'Моя девичья фамилия — Шевчук. Я родилась в Виннице.', 'My maiden name is Szewczuk. I was born in Vinnytsia.'),
      ['Moje nazwisko panieńskie to Szewczuk. Urodziłam się w Winnicy.', 'Moje panieńskie nazwisko to Szewczuk. Urodziłam się w Winnicy.', 'Moje nazwisko panieńskie to Szewczuk. Urodziłam się w Winnicy']),
    speak('speaking.dane', 'Mam obywatelstwo ukraińskie, a mój adres zameldowania jest w Lublinie.', t('Я маю українське громадянство, а моя адреса реєстрації — в Любліні.', 'У меня украинское гражданство, а мой адрес регистрации — в Люблине.', 'I have Ukrainian citizenship and my registered address is in Lublin.')),
  ],
};

const LUB_4: LessonSeed = {
  slug: 'lub-4-pobyt',
  title: t('Карта побуту й терміни', 'Карта побыта и сроки', 'Residence card and deadlines'),
  topic: t(
    'Ważny do + родовий; przedłużyć, wygasnąć; w ciągu + родовий (w ciągu trzydziestu dni); zezwolenie na pobyt, odciski palców',
    'Ważny do + родительный; przedłużyć, wygasnąć; w ciągu + родительный (w ciągu trzydziestu dni); zezwolenie na pobyt, odciski palców',
    'Ważny do + genitive; przedłużyć, wygasnąć; w ciągu + genitive (w ciągu trzydziestu dni); zezwolenie na pobyt, odciski palców',
  ),
  cefr: 'B1',
  difficulty: 3,
  explanation: t(
    '**Мета:** сказати, до коли дійсна карта, і зрозуміти строки подання заяви.\n**Ważny do** + родовий: **karta jest ważna do trzydziestego pierwszego marca**, **do końca roku**. Закінчується термін — **wygasnąć**: **zezwolenie wygaśnie pierwszego czerwca**; щоб подовжити — **przedłużyć** (доконаний вид).\n**W ciągu** + родовий — «протягом»: **w ciągu tygodnia**, **w ciągu miesiąca**, **w ciągu trzydziestu dni**. Числівник після **w ciągu** теж у родовому: **dwóch / trzech / czterech dni**, **pięciu / dziesięciu / trzydziestu dni**.\nПри поданні заяви беруть **odciski palców**; видають **zezwolenie na pobyt czasowy**.',
    '**Цель:** сказать, до какого срока действительна карта, и понять сроки подачи заявления.\n**Ważny do** + родительный: **karta jest ważna do trzydziestego pierwszego marca**, **do końca roku**. Срок истекает — **wygasnąć**: **zezwolenie wygaśnie pierwszego czerwca**; чтобы продлить — **przedłużyć** (совершенный вид).\n**W ciągu** + родительный — «в течение»: **w ciągu tygodnia**, **w ciągu miesiąca**, **w ciągu trzydziestu dni**. Числительное после **w ciągu** тоже в родительном: **dwóch / trzech / czterech dni**, **pięciu / dziesięciu / trzydziestu dni**.\nПри подаче заявления снимают **odciski palców**; выдают **zezwolenie na pobyt czasowy**.',
    '**Goal:** say how long your card is valid and understand filing deadlines.\n**Ważny do** + genitive: **karta jest ważna do trzydziestego pierwszego marca**, **do końca roku**. A permit ends — **wygasnąć**: **zezwolenie wygaśnie pierwszego czerwca**; to renew — **przedłużyć** (perfective).\n**W ciągu** + genitive means “within”: **w ciągu tygodnia**, **w ciągu miesiąca**, **w ciągu trzydziestu dni**. The numeral after **w ciągu** is genitive too: **dwóch / trzech / czterech dni**, **pięciu / dziesięciu / trzydziestu dni**.\nWhen you file, they take your **odciski palców**; you receive a **zezwolenie na pobyt czasowy**.',
  ),
  examples: [
    { pl: 'Moja karta pobytu jest ważna do trzydziestego pierwszego marca.', tr: t('Моя карта побуту дійсна до тридцять першого березня.', 'Моя карта побыта действительна до тридцать первого марта.', 'My residence card is valid until the thirty-first of March.') },
    { pl: 'Wniosek trzeba złożyć w ciągu trzydziestu dni.', tr: t('Заяву треба подати протягом тридцяти днів.', 'Заявление нужно подать в течение тридцати дней.', 'The application must be filed within thirty days.') },
  ],
  words: ['ważny', 'przedłużyć', 'wygasnąć', 'zezwolenie', 'pobyt', 'odciski palców', 'w ciągu'],
  exercises: [
    dialogue('dialogue.pobyt', URZEDNIK, [
      {
        npc: 'Do kiedy jest ważna pańska karta pobytu?',
        tr: t('До коли дійсна ваша карта побуту?', 'До какого срока действительна ваша карта побыта?', 'How long is your residence card valid?'),
        choose: [
          ['Jest ważna do trzydziestego pierwszego marca.', t('Вона дійсна до тридцять першого березня.', 'Она действительна до тридцать первого марта.', 'It is valid until the thirty-first of March.')],
          ['Jest ważna do trzydziesty pierwszy marzec.', t('(**do** + родовий: **do trzydziestego pierwszego marca**)', '(**do** + родительный: **do trzydziestego pierwszego marca**)', '(**do** + genitive: **do trzydziestego pierwszego marca**)')],
          ['Jest ważna na trzydziestego pierwszego marca.', t('(термін «до якого дня» — **do** + родовий, а не **na**)', '(срок «до какого дня» — **do** + родительный, а не **na**)', '(“until which day” takes **do** + genitive, not **na**)')],
        ],
        feedback: t('Термін «до» — **do** + родовий.', 'Срок «до» — **do** + родительный.', '“Until” — **do** + genitive.'),
      },
      {
        npc: 'Wniosek o przedłużenie trzeba złożyć w ciągu trzydziestu dni.',
        tr: t('Заяву на продовження треба подати протягом тридцяти днів.', 'Заявление на продление нужно подать в течение тридцати дней.', 'The application for renewal must be filed within thirty days.'),
        choose: [
          ['Rozumiem. Złożę wniosek w ciągu dwóch tygodni.', t('Розумію. Я подам заяву протягом двох тижнів.', 'Понимаю. Я подам заявление в течение двух недель.', 'I understand. I’ll file the application within two weeks.')],
          ['Rozumiem. Złożę wniosek w ciągu dwa tygodnie.', t('(**w ciągu** + родовий: **dwóch tygodni**)', '(**w ciągu** + родительный: **dwóch tygodni**)', '(**w ciągu** + genitive: **dwóch tygodni**)')],
          ['Rozumiem. Złożyłem wniosek w ciągu dwóch tygodni.', t('(мова про майбутнє — **złożę**; **złożyłem** — минулий час)', '(речь о будущем — **złożę**; **złożyłem** — прошедшее время)', '(this is about the future — **złożę**; **złożyłem** is the past)')],
        ],
        feedback: t('**w ciągu** + родовий: **w ciągu dwóch tygodni**; майбутнє — **złożę**.', '**w ciągu** + родительный: **w ciągu dwóch tygodni**; будущее — **złożę**.', '**w ciągu** + genitive: **w ciągu dwóch tygodni**; future — **złożę**.'),
      },
    ]),
    wordChoice('vocab.pobyt', 'wygasnąć', [t('втратити чинність, закінчитися', 'утратить силу, истечь', 'to expire'), t('продовжитися', 'продлиться', 'to be extended'), t('скасувати', 'отменить', 'to cancel')]),
    fillGap('grammar.pobyt', 'Wniosek trzeba złożyć w ciągu ___ dni.', ['trzydziestu', 'trzydzieści', 'trzydziestym'], t('Заяву треба подати протягом тридцяти днів.', 'Заявление нужно подать в течение тридцати дней.', 'The application must be filed within thirty days.'),
      t('**w ciągu** + родовий: **trzydziestu dni**.', '**w ciągu** + родительный: **trzydziestu dni**.', '**w ciągu** + genitive: **trzydziestu dni**.')),
    match('vocab.pobyt', [
      ['przedłużyć', t('продовжити', 'продлить', 'to renew')],
      ['wygasnąć', t('втратити чинність', 'утратить силу', 'to expire')],
      ['zezwolenie', t('дозвіл', 'разрешение', 'permit')],
      ['odciski palców', t('відбитки пальців', 'отпечатки пальцев', 'fingerprints')],
    ]),
    grammar('grammar.pobyt', 'Moja karta jest ___ do końca roku.', 'ważny', ['ważna'], t('Моя картка дійсна до кінця року.', 'Моя карта действительна до конца года.', 'My card is valid until the end of the year.'),
      t('**karta** — жіночий рід: **ważna**.', '**karta** — женский род: **ważna**.', '**karta** is feminine: **ważna**.')),
    listen('listening.pobyt', 'Moja karta pobytu wygaśnie piętnastego czerwca.', ['Moja karta pobytu wygaśnie piętnastego czerwca.', 'Moja karta pobytu wygasła piętnastego czerwca.', 'Moja karta pobytu wygaśnie piątego czerwca.']),
    reading('reading.pobyt', 'Pani Maria ma zezwolenie na pobyt czasowy do 31 października. Wniosek o przedłużenie złożyła 12 września, czyli w ciągu miesiąca przed terminem. W urzędzie pobrano jej odciski palców i dano potwierdzenie złożenia wniosku. Dzięki temu może legalnie mieszkać w Polsce do czasu decyzji urzędu.',
      t('Чому пані Марія може законно жити в Польщі й після 31 жовтня?', 'Почему пани Мария может законно жить в Польше и после 31 октября?', 'Why can Ms Maria legally stay in Poland after 31 October?'),
      [t('бо вчасно подала заяву й має підтвердження', 'потому что вовремя подала заявление и у неё есть подтверждение', 'because she filed on time and has a confirmation'), t('бо установа автоматично продовжила їй дозвіл', 'потому что учреждение автоматически продлило ей разрешение', 'because the office renewed her permit automatically'), t('бо її відбитки пальців вже були в базі', 'потому что её отпечатки пальцев уже были в базе', 'because her fingerprints were already on file')]),
    findError('grammar.pobyt', ['Karta', 'jest', 'ważna', 'na', 'trzydziestego', 'marca'], 3, t('Карта дійсна до тридцятого березня.', 'Карта действительна до тридцатого марта.', 'The card is valid until the thirtieth of March.'),
      t('Термін «до» — **do** + родовий: **do trzydziestego marca**.', 'Срок «до» — **do** + родительный: **do trzydziestego marca**.', '“Until” takes **do** + genitive: **do trzydziestego marca**.')),
    build('grammar.pobyt', 'Muszę przedłużyć kartę pobytu w ciągu miesiąca', t('Мені треба продовжити карту побуту протягом місяця', 'Мне нужно продлить карту побыта в течение месяца', 'I have to renew my residence card within a month'), ['przedłużę', 'miesiącu']),
    oddOne('grammar.pobyt', ['w ciągu tygodnia', 'w ciągu dwóch dni', 'w ciągu miesiąca', 'w ciągu trzy dni'], 3,
      t('Після **w ciągu** — родовий: **w ciągu trzech dni**.', 'После **w ciągu** — родительный: **w ciągu trzech dni**.', 'After **w ciągu** use the genitive: **w ciągu trzech dni**.'),
      t('Яка фраза містить помилку?', 'Какое выражение содержит ошибку?', 'Which expression contains a mistake?')),
    translate('writing.pobyt', t('Моя карта дійсна до п’ятнадцятого червня. Мені треба її продовжити.', 'Моя карта действительна до пятнадцатого июня. Мне нужно её продлить.', 'My card is valid until the fifteenth of June. I have to renew it.'),
      ['Moja karta jest ważna do piętnastego czerwca. Muszę ją przedłużyć.', 'Moja karta pobytu jest ważna do piętnastego czerwca. Muszę ją przedłużyć.', 'Moja karta jest ważna do piętnastego czerwca. Muszę ją przedłużyć']),
    speak('speaking.pobyt', 'Chciałbym przedłużyć zezwolenie na pobyt czasowy w ciągu miesiąca.', t('Я хотів би продовжити дозвіл на тимчасове перебування протягом місяця.', 'Я хотел бы продлить разрешение на временное пребывание в течение месяца.', 'I’d like to renew my temporary residence permit within a month.')),
  ],
};

export const LUBLIN: CityContent = {
  city: 'lublin',
  routes: [
    {
      slug: 'lub-urzad',
      title: t('В установі', 'В учреждении', 'At the office'),
      description: t('W sprawie…, załatwić sprawę, wniosek i załączniki', 'W sprawie…, załatwić sprawę, wniosek i załączniki', 'W sprawie…, załatwić sprawę, wniosek and załączniki'),
      icon: 'office',
      lessons: [LUB_1, LUB_2],
    },
    {
      slug: 'lub-dokumenty',
      title: t('Документи й терміни', 'Документы и сроки', 'Documents and deadlines'),
      description: t('Data w dopełniaczu, karta pobytu, w ciągu + родовий', 'Data w dopełniaczu, karta pobytu, w ciągu + родительный', 'Data w dopełniaczu, karta pobytu, w ciągu + genitive'),
      icon: 'receipt-check',
      lessons: [LUB_3, LUB_4],
    },
    {
      slug: 'lub-poczta-bank',
      title: t('Пошта й банк', 'Почта и банк', 'Post and bank'),
      description: t('Awizo, list polecony, wpłacić i wypłacić, zablokować kartę', 'Awizo, list polecony, wpłacić i wypłacić, zablokować kartę', 'Awizo, list polecony, wpłacić and wypłacić, zablokować kartę'),
      icon: 'shopping',
      lessons: [LUB_5_8[0], LUB_5_8[1]],
    },
    {
      slug: 'lub-umowa-unia',
      title: t('Договір і Люблін', 'Договор и Люблин', 'The contract and Lublin'),
      description: t('Na podstawie, w razie, zawarto unię', 'Na podstawie, w razie, zawarto unię', 'Na podstawie, w razie, zawarto unię'),
      icon: 'explore',
      lessons: [LUB_5_8[2], LUB_5_8[3]],
    },
    {
      slug: 'lub-egzamin',
      title: t('Іспит Любліна', 'Экзамен Люблина', 'Lublin exam'),
      description: t('Справа в установі, заява, дати, карта побуту, пошта, банк, договір, унія', 'Дело в учреждении, заявление, даты, карта побыта, почта, банк, договор, уния', 'A matter at the office, the application, dates, the residence card, post, bank, contract, the union'),
      icon: 'achievements',
      lessons: [LUB_BOSS],
    },
  ],
};

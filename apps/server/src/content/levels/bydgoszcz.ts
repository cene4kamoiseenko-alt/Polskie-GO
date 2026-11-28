/**
 * Бидгощ — трудные версии уроков (2026-11-28, docs/LEVELS_RU.md, ТЗ 1.0, этап 2). Город рассказов в прошедшем времени: выходные,
 * вид глагола, детство, поездки, происшествия, биография, сплетни, легенды. Те же герои (подруга Aga, коллега Marek, пан Henryk,
 * полицейский, рекрутер pani Ola, соседка pani Krysia, экскурсовод pani Beata, Tomek из Торуня). Все уроки города — B1, поэтому
 * версия одна — B2:
 *  • деепричастия (wracając / wróciwszy), тонкости вида (nie czytałem / nie przeczytałem, nie zgub!), книжные воспоминания
 *    (zwykł mawiać, bywało, że), приставки движения (objechać, przejechać, zjechać), рассказ о происшествии (gdy tylko, jak się
 *    okazało, został potrącony), язык резюме (odpowiadałem za, biegła znajomość), косвенная речь (zaprzeczył, jakoby; ma podobno),
 *    язык легенд и путеводителей (głosi legenda, odsłonięto, zwany).
 * Правила качества — docs/EXERCISE_QUALITY.md. Аудирования и диктанта в версиях нет (нужна озвучка). Польский текст написан
 * по нормам языка, но проверка носителем ещё не проводилась (docs/ROADMAP_1_0.md).
 */
import { t, fillGap, reading, dialogue, reverseChoice, build, findError, match } from '../builders';
import type { LessonLevels } from '../types';

const AGA = { name: 'Aga', emoji: '👩🏻', role: t('подруга з курсу польської', 'подруга с курса польского', 'a friend from Polish class') };
const MAREK = { name: 'Marek', emoji: '🧑🏻', role: t('колега з роботи', 'коллега с работы', 'a colleague') };
const HENRYK = { name: 'Pan Henryk', emoji: '👴🏻', role: t('сусід-пенсіонер', 'сосед-пенсионер', 'a retired neighbour') };
const POLICJANT = { name: 'Policjant', emoji: '👮🏻', role: t('поліцейський на перехресті', 'полицейский на перекрёстке', 'a police officer at a crossing') };
const REKRUTERKA = { name: 'Pani Ola', emoji: '👩🏻‍💼', role: t('рекрутерка на співбесіді', 'рекрутер на собеседовании', 'a recruiter at an interview') };
const KRYSIA = { name: 'Pani Krysia', emoji: '👵🏼', role: t('сусідка, яка знає всі новини', 'соседка, которая знает все новости', 'a neighbour who knows all the news') };
const BEATA = { name: 'Pani Beata', emoji: '👩🏼', role: t('екскурсоводка по Бидгощу', 'экскурсовод по Быдгощу', 'a Bydgoszcz tour guide') };

// ───────────────────────────── byd-1-weekend: Як минули вихідні (урок B1) ─────────────────────────────
const BYD1: LessonLevels = {
  B2: {
    explanation: t(
      'Дієприслівники в розповіді:\n• одночасна дія — **-ąc**: **wracając** z koncertu, spotkaliśmy Marka (повертаючись);\n• попередня дія — **-wszy / -łszy** (книжне): **zwiedziwszy** muzeum, poszliśmy na obiad; **zjadłszy** kolację, wróciliśmy;\n• головне правило — підмет обох дій той самий: «Wracając do domu, spotkał nas Marek» означає, що додому повертався Марек;\n• у розмові замість -wszy частіше **po** + віддієслівний іменник: **po zwiedzeniu** muzeum.',
      'Деепричастия в рассказе:\n• одновременное действие — **-ąc**: **wracając** z koncertu, spotkaliśmy Marka (возвращаясь);\n• предшествующее действие — **-wszy / -łszy** (книжное): **zwiedziwszy** muzeum, poszliśmy na obiad; **zjadłszy** kolację, wróciliśmy;\n• главное правило — подлежащее обоих действий одно: «Wracając do domu, spotkał nas Marek» значит, что домой возвращался Марек;\n• в разговоре вместо -wszy чаще **po** + отглагольное существительное: **po zwiedzeniu** muzeum.',
      'Adverbial participles in a story:\n• simultaneous action — **-ąc**: **wracając** z koncertu, spotkaliśmy Marka (while returning);\n• prior action — **-wszy / -łszy** (bookish): **zwiedziwszy** muzeum, poszliśmy na obiad; **zjadłszy** kolację, wróciliśmy;\n• the key rule — both actions share the subject: «Wracając do domu, spotkał nas Marek» means Marek was the one going home;\n• in speech, **po** + verbal noun is more common than -wszy: **po zwiedzeniu** muzeum.',
    ),
    examples: [
      { pl: 'Wracając z Opery Novej, spotkaliśmy Marka.', tr: t('Повертаючись з Opery Nova, ми зустріли Марека.', 'Возвращаясь из Opery Nova, мы встретили Марека.', 'On our way back from Opera Nova we ran into Marek.') },
      { pl: 'Zwiedziwszy Wyspę Młyńską, usiedliśmy w kawiarni nad Brdą.', tr: t('Оглянувши Млиновий острів, ми сіли в кав’ярні над Брдою.', 'Осмотрев Мельничный остров, мы сели в кафе на Брде.', 'Having seen Mill Island, we sat down in a café by the Brda.') },
    ],
    exercises: [
      dialogue('dialogue.past', AGA, [
        {
          npc: 'Słyszałam, że byliście w sobotę na koncercie. I jak?',
          tr: t('Я чула, що ви були в суботу на концерті. Ну як?', 'Я слышала, что вы были в субботу на концерте. Ну как?', 'I heard you went to a concert on Saturday. How was it?'),
          choose: [
            ['Świetnie! Wracając do domu, spotkaliśmy jeszcze Marka.', t('Чудово! Повертаючись додому, ми ще зустріли Марека.', 'Отлично! Возвращаясь домой, мы ещё встретили Марека.', 'Great! On the way home we also bumped into Marek.')],
            ['Świetnie! Wróciwszy do domu, spotkaliśmy jeszcze Marka.', t('(зустріли дорогою — одночасна дія: **wracając**; «wróciwszy» — уже повернувшись)', '(встретили по дороге — одновременное действие: **wracając**; «wróciwszy» — уже вернувшись)', '(met on the way — simultaneous: **wracając**; «wróciwszy» means already back)')],
            ['Świetnie! Wracając do domu, spotkał nas jeszcze Marek.', t('(підмет — Marek: виходить, що додому повертався він)', '(подлежащее — Marek: получается, что домой возвращался он)', '(the subject is Marek, so he was the one going home)')],
          ],
          feedback: t('Дієприслівник і головне дієслово — про ту саму особу.', 'Деепричастие и главный глагол — об одном лице.', 'The participle and the main verb share the subject.'),
        },
        {
          npc: 'A co robiliście w niedzielę?',
          tr: t('А що ви робили в неділю?', 'А что вы делали в воскресенье?', 'And what did you do on Sunday?'),
          choose: [
            ['Zwiedziwszy rano Wyspę Młyńską, poszliśmy na obiad nad Brdę.', t('Оглянувши зранку Млиновий острів, ми пішли обідати над Брду.', 'Осмотрев утром Мельничный остров, мы пошли обедать на Брду.', 'After seeing Mill Island in the morning, we went for lunch by the Brda.')],
            ['Zwiedzając rano Wyspę Młyńską, poszliśmy na obiad nad Brdę.', t('(спершу оглянули, потім пішли — попередня дія: **zwiedziwszy**)', '(сначала осмотрели, потом пошли — предшествующее действие: **zwiedziwszy**)', '(first the visit, then lunch — prior action: **zwiedziwszy**)')],
            ['Zwiedziwszy rano Wyspę Młyńską, poszliśmy na obiad nad Brdą.', t('(куди — **nad** + знахідний: nad **Brdę**; «nad Brdą» — де)', '(куда — **nad** + винительный: nad **Brdę**; «nad Brdą» — где)', '(where to — **nad Brdę**; «nad Brdą» means where)')],
          ],
          feedback: t('Попередня дія — **zwiedziwszy**; куди — **nad Brdę**.', 'Предшествующее действие — **zwiedziwszy**; куда — **nad Brdę**.', 'Prior action — **zwiedziwszy**; direction — **nad Brdę**.'),
        },
      ]),
      fillGap('grammar.participles', '___ z Torunia, zatrzymaliśmy się na kawę w Solcu Kujawskim.', ['Wracając', 'Wróciwszy', 'Wracany', 'Wracając się'],
        t('Повертаючись із Торуня, ми зупинилися на каву в Сольці-Куявському.', 'Возвращаясь из Торуня, мы остановились на кофе в Сольце-Куявском.', 'On the way back from Toruń we stopped for coffee in Solec Kujawski.'),
        t('Дорогою — одночасна дія: **wracając**. «Wróciwszy» — уже повернувшись, тоді дорогою не зупинишся.', 'По дороге — одновременное действие: **wracając**. «Wróciwszy» — уже вернувшись, тогда по дороге не остановишься.', 'On the way — simultaneous **wracając**; «wróciwszy» means already back.')),
      fillGap('grammar.participles', 'Dopiero ___ śniadanie, wyruszyliśmy na rowerach wzdłuż Brdy.', ['zjadłszy', 'zjadając', 'zjedzony', 'zjadłwszy'],
        t('Лише поснідавши, ми вирушили велосипедами вздовж Брди.', 'Только позавтракав, мы отправились на велосипедах вдоль Брды.', 'Only after breakfast did we set off by bike along the Brda.'),
        t('«Dopiero» — спершу одне, потім друге: попередня дія; після приголосного — **-łszy**: zjadłszy.', '«Dopiero» — сначала одно, потом другое: предшествующее действие; после согласного — **-łszy**: zjadłszy.', '«Dopiero» marks a prior action; after a consonant use **-łszy**.')),
      fillGap('grammar.participles', 'Po ___ muzeum poszliśmy na kawę na Starym Rynku.', ['zwiedzeniu', 'zwiedzenie', 'zwiedzeniem', 'zwiedziwszy'],
        t('Після огляду музею ми пішли на каву на Старий Ринок.', 'После осмотра музея мы пошли на кофе на Старый Рынок.', 'After seeing the museum we went for coffee on the Old Market Square.'),
        t('**Po** + місцевий віддієслівного іменника: po **zwiedzeniu**.', '**Po** + предложный отглагольного существительного: po **zwiedzeniu**.', '**Po** + locative verbal noun: **zwiedzeniu**.')),
      reading('reading.past', 'Wpis na blogu: „Spędziwszy sobotę w Toruniu, w niedzielę zostaliśmy w Bydgoszczy. Spacerując po Wyspie Młyńskiej, trafiliśmy na koncert plenerowy. Wracając wieczorem do hotelu, kupiliśmy jeszcze bilety do Opery Novej na poniedziałek”.',
        t('Коли автори купили квитки в оперу?', 'Когда авторы купили билеты в оперу?', 'When did the authors buy the opera tickets?'),
        [t('у неділю ввечері, дорогою до готелю', 'в воскресенье вечером, по дороге в гостиницу', 'on Sunday evening on the way to the hotel'), t('у суботу в Торуні', 'в субботу в Торуни', 'on Saturday in Toruń'), t('у понеділок перед виставою', 'в понедельник перед спектаклем', 'on Monday before the show')],
        t('«**Wracając wieczorem do hotelu**, kupiliśmy… bilety» — у неділю, дорогою.', '«**Wracając wieczorem do hotelu**, kupiliśmy… bilety» — в воскресенье, по дороге.', '“**Wracając wieczorem do hotelu**, kupiliśmy bilety” — on Sunday, on the way.')),
      reverseChoice('grammar.participles', t('Повернувшись додому, ми одразу пішли спати.', 'Вернувшись домой, мы сразу пошли спать.', 'Having got home, we went straight to bed.'),
        ['Wróciwszy do domu, od razu poszliśmy spać.', 'Wracając do domu, od razu poszliśmy spać.', 'Po wrócić do domu, od razu poszliśmy spać.'],
        t('Спершу повернулися — попередня дія: **wróciwszy**. Після **po** — іменник: po powrocie.', 'Сначала вернулись — предшествующее действие: **wróciwszy**. После **po** — существительное: po powrocie.', 'Prior action — **wróciwszy**; after **po** use a noun: po powrocie.')),
      findError('grammar.participles', ['Wróciwszy', 'z', 'wakacji,', 'od', 'razu', 'poszliśmy', 'do', 'praca'], 7,
        t('Повернувшись із відпустки, ми одразу пішли на роботу.', 'Вернувшись из отпуска, мы сразу пошли на работу.', 'Back from holiday, we went straight to work.'),
        t('**Do** + родовий: do **pracy**.', '**Do** + родительный: do **pracy**.', '**Do** + genitive: **pracy**.')),
      build('grammar.participles', 'Wracając z koncertu, spotkaliśmy starego znajomego', t('Повертаючись із концерту, ми зустріли давнього знайомого', 'Возвращаясь с концерта, мы встретили старого знакомого', 'On the way back from the concert we met an old friend'), ['wróciwszy', 'spotkał'], ['Spotkaliśmy starego znajomego, wracając z koncertu'],
        t('Одночасна дія — **wracając**; підмет обох дій — «ми».', 'Одновременное действие — **wracając**; подлежащее обоих действий — «мы».', 'Simultaneous **wracając**; the subject of both is “we”.')),
      match('grammar.participles', [
        ['wracając', t('повертаючись', 'возвращаясь', 'while returning')],
        ['wróciwszy', t('повернувшись', 'вернувшись', 'having returned')],
        ['po zwiedzeniu', t('після огляду', 'после осмотра', 'after visiting')],
        ['zjadłszy', t('поївши', 'поев', 'having eaten')],
      ]),
    ],
  },
};

// ───────────────────────────── byd-2-aspekt: Вид у минулому (урок B1) ─────────────────────────────
const BYD2: LessonLevels = {
  B2: {
    explanation: t(
      'Тонкощі виду:\n• заперечення — **nie czytałem** (не читав зовсім / ніколи) vs **nie przeczytałem** (почав, але не дочитав);\n• досвід — недоконаний: **Czy oglądałeś kiedyś** ten film? Результат — доконаний: **Obejrzałeś** go już?\n• заборона — недоконаний: **nie otwieraj!**; застереження «щоб не сталося» — доконаний: **nie zgub** biletu!\n• **zdążyć / zdołać** + доконаний інфінітив: nie zdążyłem **przeczytać**.',
      'Тонкости вида:\n• отрицание — **nie czytałem** (не читал вовсе / никогда) vs **nie przeczytałem** (начал, но не дочитал);\n• опыт — несовершенный: **Czy oglądałeś kiedyś** ten film? Результат — совершенный: **Obejrzałeś** go już?\n• запрет — несовершенный: **nie otwieraj!**; предостережение «чтобы не случилось» — совершенный: **nie zgub** biletu!\n• **zdążyć / zdołać** + совершенный инфинитив: nie zdążyłem **przeczytać**.',
      'Fine points of aspect:\n• negation — **nie czytałem** (didn’t read it at all / never) vs **nie przeczytałem** (started but didn’t finish);\n• experience — imperfective: **Czy oglądałeś kiedyś** ten film? Result — perfective: **Obejrzałeś** go już?\n• prohibition — imperfective: **nie otwieraj!**; a warning “mind it doesn’t happen” — perfective: **nie zgub** biletu!\n• **zdążyć / zdołać** + perfective infinitive: nie zdążyłem **przeczytać**.',
    ),
    examples: [
      { pl: 'Nie czytałem tej książki, ale widziałem film.', tr: t('Я не читав цієї книжки, але бачив фільм.', 'Я не читал эту книгу, но видел фильм.', 'I haven’t read the book, but I’ve seen the film.') },
      { pl: 'Nie zdążyłem przeczytać raportu przed spotkaniem.', tr: t('Я не встиг прочитати звіт перед зустріччю.', 'Я не успел прочитать отчёт перед встречей.', 'I didn’t manage to read the report before the meeting.') },
    ],
    exercises: [
      dialogue('dialogue.aspect', MAREK, [
        {
          npc: 'Czytałeś raport, który ci wysłałem?',
          tr: t('Ти читав звіт, який я тобі надіслав?', 'Ты читал отчёт, который я тебе прислал?', 'Did you read the report I sent you?'),
          choose: [
            ['Zacząłem, ale nie zdążyłem go przeczytać do końca.', t('Почав, але не встиг дочитати до кінця.', 'Начал, но не успел дочитать до конца.', 'I started, but didn’t manage to finish it.')],
            ['Zacząłem, ale nie zdążyłem go czytać do końca.', t('(**zdążyć** + доконаний: **przeczytać**)', '(**zdążyć** + совершенный: **przeczytać**)', '(**zdążyć** + perfective: **przeczytać**)')],
            ['Zacząłem, ale nie zdążyłem jego przeczytać do końca.', t('(ненаголошений займенник — **go**; «jego» — з наголосом або після прийменника)', '(безударное местоимение — **go**; «jego» — под ударением или после предлога)', '(the unstressed pronoun is **go**)')],
          ],
          feedback: t('**Nie zdążyłem go przeczytać**.', '**Nie zdążyłem go przeczytać**.', '**Nie zdążyłem go przeczytać**.'),
        },
        {
          npc: 'A ten film o Bydgoszczy, o którym mówiłem — widziałeś?',
          tr: t('А той фільм про Бидгощ, про який я казав, — бачив?', 'А тот фильм о Быдгоще, о котором я говорил, — видел?', 'And the Bydgoszcz film I mentioned — have you seen it?'),
          choose: [
            ['Nie, nigdy go nie oglądałem, ale słyszałem, że jest dobry.', t('Ні, ніколи його не дивився, але чув, що він добрий.', 'Нет, никогда его не смотрел, но слышал, что он хороший.', 'No, I’ve never watched it, but I hear it’s good.')],
            ['Nie, nigdy go nie obejrzałem, ale słyszałem, że jest dobry.', t('(досвід «ніколи» — недоконаний: **nie oglądałem**)', '(опыт «никогда» — несовершенный: **nie oglądałem**)', '(experience with “never” — imperfective)')],
            ['Nie, nigdy nie go oglądałem, ale słyszałem, że jest dobry.', t('(порядок: **nigdy go nie oglądałem** — «go» не стоїть після «nie»)', '(порядок: **nigdy go nie oglądałem** — «go» не ставится после «nie»)', '(word order: **nigdy go nie oglądałem**)')],
          ],
          feedback: t('Досвід — **nigdy go nie oglądałem**.', 'Опыт — **nigdy go nie oglądałem**.', 'Experience — **nigdy go nie oglądałem**.'),
        },
      ]),
      fillGap('grammar.aspect', 'Nie ___ tego listu, jest prywatny!', ['otwieraj', 'otwórz', 'otworzysz', 'otwierasz'],
        t('Не відкривай цього листа, він особистий!', 'Не открывай это письмо, оно личное!', 'Don’t open that letter, it’s private!'),
        t('Заборона — недоконаний: **nie otwieraj**.', 'Запрет — несовершенный: **nie otwieraj**.', 'A prohibition — imperfective **nie otwieraj**.')),
      fillGap('grammar.aspect', 'Uważaj, nie ___ biletu — bez niego nie wejdziesz na koncert.', ['zgub', 'gub', 'gubisz', 'zgubił'],
        t('Обережно, не загуби квитка — без нього не пройдеш на концерт.', 'Осторожно, не потеряй билет — без него не попадёшь на концерт.', 'Careful, don’t lose the ticket — you won’t get in without it.'),
        t('Застереження «щоб не сталося» — доконаний: **nie zgub**.', 'Предостережение «чтобы не случилось» — совершенный: **nie zgub**.', 'A warning — perfective **nie zgub**.')),
      fillGap('grammar.aspect', 'Szef chce wniosków na jutro, a ja ___ dopiero połowę raportu.', ['przeczytałem', 'czytałem', 'przeczytałbym', 'czytam'],
        t('Начальник хоче висновків на завтра, а я прочитав лише половину звіту.', 'Начальник хочет выводов к завтра, а я прочитал только половину отчёта.', 'The boss wants conclusions tomorrow and I’ve only read half the report.'),
        t('Результат (половина вже прочитана) — доконаний: **przeczytałem**.', 'Результат (половина уже прочитана) — совершенный: **przeczytałem**.', 'A result — perfective **przeczytałem**.')),
      reading('reading.aspect', 'Mail od szefa: „Panie Marku, czy zdążył Pan przeczytać umowę z Toruniem? Wczoraj ją Pan czytał, ale chyba nie skończył. Proszę jej nie podpisywać, zanim przeczyta ją prawnik. I proszę nie zgubić oryginału!”',
        t('Що начальник забороняє Мареку?', 'Что начальник запрещает Мареку?', 'What does the boss forbid Marek to do?'),
        [t('підписувати договір до перевірки юристом', 'подписывать договор до проверки юристом', 'signing the contract before the lawyer reads it'), t('читати договір без начальника', 'читать договор без начальника', 'reading the contract without the boss'), t('віддавати оригінал юристу', 'отдавать оригинал юристу', 'giving the original to the lawyer')],
        t('«Proszę jej **nie podpisywać, zanim przeczyta ją prawnik**».', '«Proszę jej **nie podpisywać, zanim przeczyta ją prawnik**».', '“**nie podpisywać, zanim przeczyta ją prawnik**”.')),
      reverseChoice('grammar.aspect', t('Не відчиняй вікна — холодно.', 'Не открывай окно — холодно.', 'Don’t open the window — it’s cold.'),
        ['Nie otwieraj okna — jest zimno.', 'Nie otwórz okna — jest zimno.', 'Nie otwieraj okno — jest zimno.'],
        t('Заборона — недоконаний: **nie otwieraj**; після заперечення — родовий: **okna**.', 'Запрет — несовершенный: **nie otwieraj**; после отрицания — родительный: **okna**.', 'Prohibition — imperfective; genitive after negation: **okna**.')),
      findError('grammar.aspect', ['Nie', 'zdążyłem', 'czytać', 'całego', 'raportu'], 2,
        t('Я не встиг прочитати весь звіт.', 'Я не успел прочитать весь отчёт.', 'I didn’t manage to read the whole report.'),
        t('**Zdążyć** + доконаний: **przeczytać**.', '**Zdążyć** + совершенный: **przeczytać**.', '**Zdążyć** + perfective: **przeczytać**.')),
      build('grammar.aspect', 'Nie zdążyłem przeczytać umowy przed spotkaniem', t('Я не встиг прочитати договір перед зустріччю', 'Я не успел прочитать договор перед встречей', 'I didn’t manage to read the contract before the meeting'), ['czytać', 'umowę'], ['Przed spotkaniem nie zdążyłem przeczytać umowy'],
        t('**Zdążyć** + доконаний; після заперечення — родовий: **umowy**.', '**Zdążyć** + совершенный; после отрицания — родительный: **umowy**.', '**Zdążyć** + perfective; genitive **umowy**.')),
      match('grammar.aspect', [
        ['nie czytałem', t('не читав (зовсім)', 'не читал (вовсе)', 'I haven’t read it (at all)')],
        ['nie przeczytałem', t('не дочитав', 'не дочитал', 'I didn’t finish reading')],
        ['nie zdążyłem', t('не встиг', 'не успел', 'I didn’t manage in time')],
        ['nie zgub!', t('не загуби!', 'не потеряй!', 'don’t lose it!')],
      ]),
    ],
  },
};

// ───────────────────────────── byd-3-dziecinstwo: Дитинство (урок B1) ─────────────────────────────
const BYD3: LessonLevels = {
  B2: {
    explanation: t(
      'Спогади книжною мовою:\n• звичка — **miałem w zwyczaju** + інфінітив; книжне **zwykł / zwykła** + інфінітив: dziadek **zwykł mawiać**;\n• **bywało, że…** — бувало, що…; **nieraz** — не раз;\n• **z perspektywy czasu** — з відстані часу;\n• **wspominać** + знахідний (wspominam **dzieciństwo**) або **o** + місцевий (wspominam **o** dzieciństwie);\n• сумувати — **tęsknić za** + орудний: tęsknię **za podwórkiem** («скучаю по» — калька).',
      'Воспоминания книжным языком:\n• привычка — **miałem w zwyczaju** + инфинитив; книжное **zwykł / zwykła** + инфинитив: dziadek **zwykł mawiać**;\n• **bywało, że…** — бывало, что…; **nieraz** — не раз;\n• **z perspektywy czasu** — по прошествии времени;\n• **wspominać** + винительный (wspominam **dzieciństwo**) или **o** + предложный (wspominam **o** dzieciństwie);\n• скучать — **tęsknić za** + творительный: tęsknię **za podwórkiem** («скучаю по» — калька).',
      'Memories in a bookish register:\n• habit — **miałem w zwyczaju** + infinitive; bookish **zwykł / zwykła** + infinitive: dziadek **zwykł mawiać**;\n• **bywało, że…** — there were times when…; **nieraz** — more than once;\n• **z perspektywy czasu** — looking back;\n• **wspominać** + accusative (wspominam **dzieciństwo**) or **o** + locative (wspominam **o** dzieciństwie);\n• to miss — **tęsknić za** + instrumental: tęsknię **za podwórkiem**.',
    ),
    examples: [
      { pl: 'Dziadek zwykł mawiać, że Brda pamięta więcej niż ludzie.', tr: t('Дідусь любив казати, що Брда пам’ятає більше, ніж люди.', 'Дедушка любил говорить, что Брда помнит больше, чем люди.', 'Grandpa used to say the Brda remembers more than people do.') },
      { pl: 'Z perspektywy czasu tęsknię za podwórkiem, na którym bywało, że graliśmy do zmroku.', tr: t('З відстані часу я сумую за подвір’ям, де бувало, що ми гралися до смерку.', 'Спустя годы я скучаю по двору, где бывало, что мы играли до темноты.', 'Looking back, I miss the courtyard where we sometimes played until dark.') },
    ],
    exercises: [
      dialogue('dialogue.memories', HENRYK, [
        {
          npc: 'A ty jak wspominasz swoje dzieciństwo?',
          tr: t('А ти як згадуєш своє дитинство?', 'А ты как вспоминаешь своё детство?', 'And how do you remember your childhood?'),
          choose: [
            ['Z perspektywy czasu bardzo dobrze — tęsknię za wakacjami u babci.', t('З відстані часу дуже добре — сумую за канікулами в бабусі.', 'Спустя годы очень хорошо — скучаю по каникулам у бабушки.', 'Looking back, very fondly — I miss the holidays at my gran’s.')],
            ['Z perspektywy czasu bardzo dobrze — tęsknię do wakacji u babci.', t('(сучасна норма — **tęsknić za** + орудний)', '(современная норма — **tęsknić za** + творительный)', '(standard Polish: **tęsknić za** + instrumental)')],
            ['Z perspektywy czasu bardzo dobrze — tęsknię za wakacje u babci.', t('(**za** + орудний: za **wakacjami**)', '(**za** + творительный: za **wakacjami**)', '(**za** + instrumental: **wakacjami**)')],
          ],
          feedback: t('**Tęsknić za** + орудний.', '**Tęsknić za** + творительный.', '**Tęsknić za** + instrumental.'),
        },
        {
          npc: 'A co najczęściej robiłeś latem?',
          tr: t('А що ти найчастіше робив улітку?', 'А что ты чаще всего делал летом?', 'And what did you usually do in summer?'),
          choose: [
            ['Miałem w zwyczaju jeździć z dziadkiem na ryby nad Brdę.', t('Я мав звичку їздити з дідусем на риболовлю над Брду.', 'У меня была привычка ездить с дедушкой на рыбалку на Брду.', 'I used to go fishing on the Brda with my grandpa.')],
            ['Miałem w zwyczaj jeździć z dziadkiem na ryby nad Brdę.', t('(стала фраза — місцевий: **w zwyczaju**)', '(устойчивая фраза — предложный: **w zwyczaju**)', '(set phrase: **w zwyczaju**)')],
            ['Miałem w zwyczaju pojechać z dziadkiem na ryby nad Brdę.', t('(звичка — недоконаний: **jeździć**)', '(привычка — несовершенный: **jeździć**)', '(a habit — imperfective **jeździć**)')],
          ],
          feedback: t('**Mieć w zwyczaju** + недоконаний інфінітив.', '**Mieć w zwyczaju** + несовершенный инфинитив.', '**Mieć w zwyczaju** + imperfective infinitive.'),
        },
      ]),
      fillGap('register.memories', 'Dziadek ___ mawiać, że praca nie zając — nie ucieknie.', ['zwykł', 'zwykle', 'zwyczaj', 'zwykły'],
        t('Дідусь любив казати, що робота не заєць — не втече.', 'Дедушка любил говорить, что работа не волк — в лес не убежит.', 'Grandpa used to say work isn’t a hare — it won’t run away.'),
        t('Книжне «мав звичку» — **zwykł** + інфінітив.', 'Книжное «имел обыкновение» — **zwykł** + инфинитив.', 'Bookish “used to” — **zwykł** + infinitive.')),
      fillGap('register.memories', '___, że zimą Brda zamarzała i jeździliśmy po niej na łyżwach.', ['Bywało', 'Bywa', 'Bywałoby', 'Byłoby'],
        t('Бувало, що взимку Брда замерзала, і ми каталися по ній на ковзанах.', 'Бывало, что зимой Брда замерзала, и мы катались по ней на коньках.', 'There were winters when the Brda froze and we skated on it.'),
        t('Повторюване в минулому — **bywało, że…**', 'Повторяющееся в прошлом — **bywało, że…**', 'Repeated in the past — **bywało, że…**')),
      fillGap('register.memories', 'Często wspominam ___ dzieciństwo na podwórku przy Gdańskiej.', ['swoje', 'swoim', 'swojego', 'swojemu'],
        t('Я часто згадую своє дитинство на подвір’ї на Гданській.', 'Я часто вспоминаю своё детство во дворе на Гданьской.', 'I often think back to my childhood in a courtyard on Gdańska Street.'),
        t('Без прийменника — **wspominać** + знахідний: **swoje** dzieciństwo (з «o» — o swoim dzieciństwie).', 'Без предлога — **wspominać** + винительный: **swoje** dzieciństwo (с «o» — o swoim dzieciństwie).', 'Without a preposition — accusative **swoje**.')),
      reading('reading.memories', 'Wspomnienie pana Henryka: „Jako chłopiec miałem w zwyczaju chodzić z ojcem na Wyspę Młyńską. Bywało, że siedzieliśmy tam do zmroku, a ojciec opowiadał o młynach. Z perspektywy czasu rozumiem, że to on nauczył mnie kochać to miasto. Nieraz za nim tęsknię”.',
        t('Що пан Генрик розуміє тепер, з відстані часу?', 'Что пан Хенрик понимает теперь, спустя годы?', 'What does Mr Henryk understand now, looking back?'),
        [t('що саме батько навчив його любити місто', 'что именно отец научил его любить город', 'that it was his father who taught him to love the city'), t('що на острові колись працювали млини', 'что на острове когда-то работали мельницы', 'that mills once worked on the island'), t('що він рідко бував на острові', 'что он редко бывал на острове', 'that he rarely went to the island')],
        t('«**Z perspektywy czasu rozumiem, że to on nauczył mnie kochać to miasto**».', '«**Z perspektywy czasu rozumiem, że to on nauczył mnie kochać to miasto**».', '“**Z perspektywy czasu rozumiem, że to on nauczył mnie kochać to miasto**”.')),
      reverseChoice('register.memories', t('Я сумую за старими друзями.', 'Я скучаю по старым друзьям.', 'I miss my old friends.'),
        ['Tęsknię za starymi przyjaciółmi.', 'Tęsknię za starych przyjaciół.', 'Tęsknię po starych przyjaciołach.'],
        t('**Tęsknić za** + орудний; «po» — калька з «скучаю по».', '**Tęsknić za** + творительный; «po» — калька с «скучаю по».', '**Tęsknić za** + instrumental.')),
      findError('register.memories', ['Miałam', 'w', 'zwyczaju', 'czytać', 'książki', 'do', 'późno', 'w', 'nocy'], 6,
        t('Я мала звичку читати книжки до пізньої ночі.', 'У меня была привычка читать книги до поздней ночи.', 'I used to read books until late at night.'),
        t('Стала фраза — **do późna** w nocy.', 'Устойчивая фраза — **do późna** w nocy.', 'Set phrase: **do późna** w nocy.')),
      build('register.memories', 'Bywało, że graliśmy na podwórku do zmroku', t('Бувало, що ми гралися на подвір’ї до смерку', 'Бывало, что мы играли во дворе до темноты', 'Sometimes we played in the courtyard until dark'), ['bywa', 'zmrok'], [],
        t('**Bywało, że** + минулий час; **do** + родовий: do **zmroku**.', '**Bywało, że** + прошедшее время; **do** + родительный: do **zmroku**.', '**Bywało, że** + past; **do zmroku**.')),
      match('register.memories', [
        ['mieć w zwyczaju', t('мати звичку', 'иметь привычку', 'to be in the habit of')],
        ['zwykł mawiać', t('любив казати', 'любил говорить', 'used to say')],
        ['nieraz', t('не раз', 'не раз', 'more than once')],
        ['z perspektywy czasu', t('з відстані часу', 'спустя годы', 'looking back')],
      ]),
    ],
  },
};

// ───────────────────────────── byd-4-pojechalem: Поїздки (урок B1) ─────────────────────────────
const BYD4: LessonLevels = {
  B2: {
    explanation: t(
      'Префікси дієслів руху — точний напрямок:\n• **dojechać do** — доїхати до мети: dojechaliśmy **na czas**;\n• **przejechać przez** — проїхати через (przez most); **przejechać** przystanek / skręt — проїхати повз, пропустити;\n• **objechać** — об’їхати: objechać **korek**, rondo;\n• **zjechać z** + родовий — з’їхати: zjechać **z autostrady**; **wjechać na / do** — в’їхати;\n• **odjechać** — від’їхати (pociąg odjechał **z peronu**); **zajechać do** — заїхати дорогою (do babci).',
      'Приставки глаголов движения — точное направление:\n• **dojechać do** — доехать до цели: dojechaliśmy **na czas**;\n• **przejechać przez** — проехать через (przez most); **przejechać** przystanek / skręt — проехать мимо, пропустить;\n• **objechać** — объехать: objechać **korek**, rondo;\n• **zjechać z** + родительный — съехать: zjechać **z autostrady**; **wjechać na / do** — въехать;\n• **odjechać** — отъехать (pociąg odjechał **z peronu**); **zajechać do** — заехать по дороге (do babci).',
      'Prefixes on verbs of motion give the exact direction:\n• **dojechać do** — to reach: dojechaliśmy **na czas**;\n• **przejechać przez** — to drive through (przez most); **przejechać** przystanek / skręt — to miss a stop / turn;\n• **objechać** — to go round: objechać **korek**, rondo;\n• **zjechać z** + genitive — to come off: zjechać **z autostrady**; **wjechać na / do** — to drive onto / into;\n• **odjechać** — to leave (pociąg odjechał **z peronu**); **zajechać do** — to stop off at (do babci).',
    ),
    examples: [
      { pl: 'Objechaliśmy korek bocznymi ulicami i dojechaliśmy na czas.', tr: t('Ми об’їхали затор бічними вулицями й доїхали вчасно.', 'Мы объехали пробку переулками и доехали вовремя.', 'We went round the jam by side streets and arrived on time.') },
      { pl: 'Zagadałem się i przejechałem swój przystanek.', tr: t('Я заговорився й проїхав свою зупинку.', 'Я заговорился и проехал свою остановку.', 'I got chatting and missed my stop.') },
    ],
    exercises: [
      dialogue('dialogue.travel', POLICJANT, [
        {
          npc: 'Dzień dobry, kontrola drogowa. Skąd pan jedzie?',
          tr: t('Добрий день, перевірка документів. Звідки ви їдете?', 'Добрый день, проверка документов. Откуда вы едете?', 'Good morning, traffic check. Where are you coming from?'),
          choose: [
            ['Z Torunia. Zjechałem z autostrady, bo na moście był korek.', t('З Торуня. Я з’їхав з автостради, бо на мосту був затор.', 'Из Торуня. Я съехал с автострады, потому что на мосту была пробка.', 'From Toruń. I came off the motorway because of a jam on the bridge.')],
            ['Z Torunia. Wyjechałem z autostrady, bo na moście był korek.', t('(залишити трасу — **zjechać z**; «wyjechać» — виїхати з міста, з гаража)', '(покинуть трассу — **zjechać z**; «wyjechać» — выехать из города, из гаража)', '(to leave a motorway — **zjechać z**)')],
            ['Z Torunia. Zjechałem z autostradę, bo na moście był korek.', t('(**z** + родовий: z **autostrady**)', '(**z** + родительный: z **autostrady**)', '(**z** + genitive: **autostrady**)')],
          ],
          feedback: t('**Zjechać z autostrady**.', '**Zjechać z autostrady**.', '**Zjechać z autostrady**.'),
        },
        {
          npc: 'A dokąd pan jedzie? Ta ulica prowadzi poza miasto.',
          tr: t('А куди ви їдете? Ця вулиця веде за місто.', 'А куда вы едете? Эта улица ведёт за город.', 'And where are you heading? This road leads out of town.'),
          choose: [
            ['Do centrum, ale chyba przejechałem skręt w Gdańską.', t('До центру, але, здається, я проїхав поворот на Гданську.', 'В центр, но, кажется, я проехал поворот на Гданьскую.', 'To the centre, but I think I missed the turn into Gdańska.')],
            ['Do centrum, ale chyba objechałem skręt w Gdańską.', t('(пропустити поворот — **przejechać**; «objechać» — об’їхати)', '(пропустить поворот — **przejechać**; «objechać» — объехать)', '(to miss a turn — **przejechać**; «objechać» is to go round)')],
            ['Do centrum, ale chyba przejechałem skrętu w Gdańską.', t('(що — знахідний: **skręt**)', '(что — винительный: **skręt**)', '(accusative: **skręt**)')],
          ],
          feedback: t('**Przejechać skręt / przystanek** — пропустити.', '**Przejechać skręt / przystanek** — пропустить.', '**Przejechać skręt** — to miss a turn.'),
        },
      ]),
      fillGap('grammar.motion', 'Pociąg do Gdańska ___ z peronu trzeciego dokładnie o 8:15.', ['odjechał', 'dojechał', 'objechał', 'zajechał'],
        t('Потяг до Гданська відійшов від третьої платформи рівно о 8:15.', 'Поезд в Гданьск отправился с третьей платформы ровно в 8:15.', 'The Gdańsk train left platform three at 8:15 sharp.'),
        t('Від’їхати від чогось — **odjechać z / od**.', 'Отъехать от чего-то — **odjechać z / od**.', 'To leave — **odjechać z**.')),
      fillGap('grammar.motion', 'Musieliśmy ___ rondo dookoła, bo wjazd na most był zamknięty.', ['objechać', 'przejechać', 'zjechać', 'dojechać'],
        t('Нам довелося об’їхати кільце довкола, бо в’їзд на міст був закритий.', 'Нам пришлось объехать кольцо вокруг, потому что въезд на мост был закрыт.', 'We had to go all the way round the roundabout because the bridge entrance was closed.'),
        t('Довкола — **objechać**.', 'Вокруг — **objechać**.', 'Round something — **objechać**.')),
      fillGap('grammar.motion', 'Po drodze z Torunia ___ jeszcze do babci na obiad.', ['zajechaliśmy', 'przejechaliśmy', 'objechaliśmy', 'zjechaliśmy'],
        t('Дорогою з Торуня ми ще заїхали до бабусі на обід.', 'По дороге из Торуня мы ещё заехали к бабушке на обед.', 'On the way from Toruń we stopped off at gran’s for lunch.'),
        t('Заїхати дорогою — **zajechać do** кого-небудь.', 'Заехать по дороге — **zajechać do** кого-то.', 'To stop off — **zajechać do**.')),
      reading('reading.motion', 'SMS od Tomka: „Wyjechałem z Torunia o siódmej, ale na moście był wypadek. Zjechałem z obwodnicy, objechałem korek przez Fordon i w końcu dojechałem pod operę. Niestety przejechałem wjazd na parking — zaparkuję przy rondzie i podejdę pieszo”.',
        t('Чому Томек паркуватиметься біля кільця?', 'Почему Томек будет парковаться у кольца?', 'Why will Tomek park by the roundabout?'),
        [t('бо проїхав в’їзд на парковку біля опери', 'потому что проехал въезд на парковку у оперы', 'because he missed the opera car-park entrance'), t('бо на мосту була аварія', 'потому что на мосту была авария', 'because of the accident on the bridge'), t('бо парковка біля опери закрита', 'потому что парковка у оперы закрыта', 'because the opera car park is closed')],
        t('«Niestety **przejechałem wjazd na parking**» — проїхав повз в’їзд.', '«Niestety **przejechałem wjazd na parking**» — проехал мимо въезда.', '“**przejechałem wjazd na parking**” — he drove past the entrance.')),
      reverseChoice('grammar.motion', t('Ми проїхали все місто за двадцять хвилин.', 'Мы проехали весь город за двадцать минут.', 'We drove across the whole city in twenty minutes.'),
        ['Przejechaliśmy przez całe miasto w dwadzieścia minut.', 'Objechaliśmy przez całe miasto w dwadzieścia minut.', 'Przejechaliśmy przez całe miasto za dwadzieścia minut.'],
        t('Через — **przejechać przez**; за який час — **w** + знахідний («za» — через скільки).', 'Через — **przejechać przez**; за какое время — **w** + винительный («za» — через сколько).', '**Przejechać przez**; duration — **w** + accusative.')),
      findError('grammar.motion', ['Zjechaliśmy', 'z', 'autostradę', 'tuż', 'przed', 'Toruniem'], 2,
        t('Ми з’їхали з автостради перед самим Торунем.', 'Мы съехали с автострады прямо перед Торунем.', 'We came off the motorway just before Toruń.'),
        t('**Zjechać z** + родовий: z **autostrady**.', '**Zjechać z** + родительный: z **autostrady**.', '**Zjechać z** + genitive.')),
      build('grammar.motion', 'Objechaliśmy korek bocznymi ulicami', t('Ми об’їхали затор бічними вулицями', 'Мы объехали пробку переулками', 'We went round the jam by side streets'), ['przejechaliśmy', 'boczne'], ['Bocznymi ulicami objechaliśmy korek'],
        t('Довкола перешкоди — **objechać**; якою дорогою — орудний: **bocznymi ulicami**.', 'Вокруг препятствия — **objechać**; какой дорогой — творительный: **bocznymi ulicami**.', '**Objechać**; route in the instrumental.')),
      match('grammar.motion', [
        ['objechać korek', t('об’їхати затор', 'объехать пробку', 'to go round a jam')],
        ['przejechać przystanek', t('проїхати свою зупинку', 'проехать свою остановку', 'to miss one’s stop')],
        ['zjechać z autostrady', t('з’їхати з автостради', 'съехать с автострады', 'to come off the motorway')],
        ['zajechać do babci', t('заїхати до бабусі', 'заехать к бабушке', 'to stop off at gran’s')],
      ]),
    ],
  },
};

// ───────────────────────────── byd-5-co-sie-stalo: Що сталося? (урок B1) ─────────────────────────────
const BYD5: LessonLevels = {
  B2: {
    explanation: t(
      'Розповідь про подію — як у новинах:\n• раптовість — **nagle**, **ni stąd, ni zowąd** (нізвідки), **w tym momencie**;\n• послідовність — **gdy tylko** (щойно), **dopiero gdy** (лише коли), **zanim zdążyłem** + доконаний інфінітив;\n• **jak się okazało** — як виявилося; **tymczasem** — тим часом;\n• пасив — rowerzysta **został potrącony przez** samochód (przez + знахідний); kierowca **zbiegł z miejsca zdarzenia**.',
      'Рассказ о событии — как в новостях:\n• внезапность — **nagle**, **ni stąd, ni zowąd** (откуда ни возьмись), **w tym momencie**;\n• последовательность — **gdy tylko** (как только), **dopiero gdy** (только когда), **zanim zdążyłem** + совершенный инфинитив;\n• **jak się okazało** — как оказалось; **tymczasem** — тем временем;\n• пассив — rowerzysta **został potrącony przez** samochód (przez + винительный); kierowca **zbiegł z miejsca zdarzenia**.',
      'Telling an incident like the news does:\n• suddenness — **nagle**, **ni stąd, ni zowąd** (out of nowhere), **w tym momencie**;\n• sequence — **gdy tylko** (as soon as), **dopiero gdy** (only when), **zanim zdążyłem** + perfective infinitive;\n• **jak się okazało** — as it turned out; **tymczasem** — meanwhile;\n• the passive — rowerzysta **został potrącony przez** samochód (przez + accusative); kierowca **zbiegł z miejsca zdarzenia**.',
    ),
    examples: [
      { pl: 'Gdy tylko wysiadłem z tramwaju, ni stąd, ni zowąd zaczęła się ulewa.', tr: t('Щойно я вийшов із трамвая, звідки не візьмись почалася злива.', 'Как только я вышел из трамвая, откуда ни возьмись начался ливень.', 'As soon as I got off the tram, a downpour started out of nowhere.') },
      { pl: 'Zanim zdążyłem zareagować, rowerzysta został potrącony.', tr: t('Перш ніж я встиг зреагувати, велосипедиста збили.', 'Прежде чем я успел среагировать, велосипедиста сбили.', 'Before I could react, the cyclist was hit.') },
    ],
    exercises: [
      dialogue('dialogue.story', KRYSIA, [
        {
          npc: 'Słyszałeś, co się wczoraj stało na Gdańskiej?',
          tr: t('Ти чув, що сталося вчора на Гданській?', 'Ты слышал, что случилось вчера на Гданьской?', 'Did you hear what happened on Gdańska yesterday?'),
          choose: [
            ['Tak! Rowerzysta został potrącony, a kierowca zbiegł z miejsca zdarzenia.', t('Так! Велосипедиста збили, а водій утік з місця події.', 'Да! Велосипедиста сбили, а водитель скрылся с места происшествия.', 'Yes! A cyclist was hit and the driver fled the scene.')],
            ['Tak! Rowerzysta został potrącił, a kierowca zbiegł z miejsca zdarzenia.', t('(пасив — **został** + дієприкметник: **potrącony**)', '(пассив — **został** + причастие: **potrącony**)', '(passive — **został** + participle **potrącony**)')],
            ['Tak! Rowerzysta został potrącony, a kierowca zbiegł z miejsca zdarzeniu.', t('(**z** + родовий: z miejsca **zdarzenia**)', '(**z** + родительный: z miejsca **zdarzenia**)', '(**z** + genitive: **zdarzenia**)')],
          ],
          feedback: t('**Został potrącony**; **zbiegł z miejsca zdarzenia**.', '**Został potrącony**; **zbiegł z miejsca zdarzenia**.', '**Został potrącony**; **zbiegł z miejsca zdarzenia**.'),
        },
        {
          npc: 'Ojej! Widziałeś to na własne oczy?',
          tr: t('Ой! Ти бачив це на власні очі?', 'Ой! Ты видел это своими глазами?', 'Oh no! Did you see it with your own eyes?'),
          choose: [
            ['Tak, ale zanim zdążyłem zareagować, samochód już odjechał.', t('Так, але перш ніж я встиг зреагувати, машина вже поїхала.', 'Да, но прежде чем я успел среагировать, машина уже уехала.', 'Yes, but before I could react, the car was gone.')],
            ['Tak, ale zanim zdążyłem reagować, samochód już odjechał.', t('(**zdążyć** + доконаний: **zareagować**)', '(**zdążyć** + совершенный: **zareagować**)', '(**zdążyć** + perfective: **zareagować**)')],
            ['Tak, ale zanim zdążę zareagować, samochód już odjechał.', t('(розповідь у минулому: zanim **zdążyłem**)', '(рассказ в прошедшем: zanim **zdążyłem**)', '(past narrative: **zdążyłem**)')],
          ],
          feedback: t('**Zanim zdążyłem zareagować…**', '**Zanim zdążyłem zareagować…**', '**Zanim zdążyłem zareagować…**'),
        },
      ]),
      fillGap('grammar.narrative', '___ tylko otworzyłem drzwi, kot wybiegł na klatkę schodową.', ['Gdy', 'Kiedyś', 'Dopóki', 'Zanim'],
        t('Щойно я відчинив двері, кіт вибіг на сходову клітку.', 'Как только я открыл дверь, кот выбежал на лестницу.', 'The moment I opened the door, the cat ran out onto the stairs.'),
        t('Щойно — **gdy tylko**.', 'Как только — **gdy tylko**.', 'As soon as — **gdy tylko**.')),
      fillGap('grammar.narrative', 'Jak się ___, portfel cały czas leżał w samochodzie.', ['okazało', 'okazał', 'okaże', 'okazywało'],
        t('Як виявилося, гаманець увесь час лежав у машині.', 'Как оказалось, кошелёк всё время лежал в машине.', 'As it turned out, the wallet had been in the car all along.'),
        t('Стала фраза, середній рід, доконаний: **jak się okazało**.', 'Устойчивая фраза, средний род, совершенный: **jak się okazało**.', 'Set phrase: **jak się okazało**.')),
      fillGap('grammar.narrative', 'Dopiero ___ przyjechała policja, kierowca przyznał się do winy.', ['gdy', 'że', 'żeby', 'czy'],
        t('Лише коли приїхала поліція, водій визнав свою провину.', 'Только когда приехала полиция, водитель признал вину.', 'Only when the police arrived did the driver admit fault.'),
        t('Лише коли — **dopiero gdy**.', 'Только когда — **dopiero gdy**.', 'Only when — **dopiero gdy**.')),
      reading('reading.narrative', 'Z kroniki policyjnej: „Wczoraj ok. 18:00 na ul. Gdańskiej rowerzysta został potrącony przez samochód osobowy. Kierowca zbiegł z miejsca zdarzenia, jednak, jak się okazało, numer rejestracyjny zapamiętał przechodzień. Dopiero gdy policja pokazała nagranie z monitoringu, sprawca przyznał się do winy”.',
        t('Коли винуватець зізнався?', 'Когда виновник признался?', 'When did the culprit confess?'),
        [t('лише коли поліція показала запис камер', 'только когда полиция показала запись камер', 'only when the police showed the CCTV footage'), t('одразу на місці події', 'сразу на месте происшествия', 'right at the scene'), t('коли перехожий назвав номер', 'когда прохожий назвал номер', 'when the passer-by gave the number')],
        t('«**Dopiero gdy policja pokazała nagranie**… sprawca przyznał się do winy».', '«**Dopiero gdy policja pokazała nagranie**… sprawca przyznał się do winy».', '“**Dopiero gdy policja pokazała nagranie**…”')),
      reverseChoice('grammar.narrative', t('Як виявилося, двері весь час були відчинені.', 'Как оказалось, дверь всё время была открыта.', 'As it turned out, the door had been open the whole time.'),
        ['Jak się okazało, drzwi przez cały czas były otwarte.', 'Jak się okazało, drzwi przez cały czas był otwarty.', 'Jak się okazywało, drzwi przez cały czas były otwarte.'],
        t('**Drzwi** — лише множина: **były otwarte**; один раз виявилося — доконаний: **okazało**.', '**Drzwi** — только множественное: **były otwarte**; оказалось однажды — совершенный: **okazało**.', '**Drzwi** is plural only; perfective **okazało**.')),
      findError('grammar.narrative', ['Rowerzysta', 'został', 'potrącony', 'przez', 'samochodem'], 4,
        t('Велосипедиста збив автомобіль.', 'Велосипедиста сбил автомобиль.', 'The cyclist was hit by a car.'),
        t('Ким — **przez** + знахідний: przez **samochód**.', 'Кем — **przez** + винительный: przez **samochód**.', 'By whom — **przez** + accusative.')),
      build('grammar.narrative', 'Zanim zdążyłem zareagować, kierowca odjechał', t('Перш ніж я встиг зреагувати, водій поїхав', 'Прежде чем я успел среагировать, водитель уехал', 'Before I could react, the driver drove off'), ['reagować', 'zdążę'], ['Kierowca odjechał, zanim zdążyłem zareagować'],
        t('**Zanim zdążyłem** + доконаний інфінітив.', '**Zanim zdążyłem** + совершенный инфинитив.', '**Zanim zdążyłem** + perfective infinitive.')),
      match('grammar.narrative', [
        ['ni stąd, ni zowąd', t('звідки не візьмись', 'откуда ни возьмись', 'out of nowhere')],
        ['jak się okazało', t('як виявилося', 'как оказалось', 'as it turned out')],
        ['zbiec z miejsca zdarzenia', t('утекти з місця події', 'скрыться с места происшествия', 'to flee the scene')],
        ['gdy tylko', t('щойно', 'как только', 'as soon as')],
      ]),
    ],
  },
};

// ───────────────────────────── byd-6-zyciorys: Життєпис (урок B1) ─────────────────────────────
const BYD6: LessonLevels = {
  B2: {
    explanation: t(
      'Резюме й мотиваційний лист:\n• освіта — **ukończyłem studia na kierunku** logistyka **na** Uniwersytecie…;\n• досвід — **w latach 2018–2022 pracowałem jako** + називний (jako **magazynier**); **odpowiadałem za** + знахідний;\n• навички — **biegła znajomość** + родовий (języka angielskiego), знаю **biegle** (прислівник); **zdobyłem doświadczenie w** + місцевий;\n• лист — **Z dużym zainteresowaniem przeczytałem ogłoszenie…**, **Uprzejmie proszę o rozpatrzenie mojej kandydatury**.',
      'Резюме и мотивационное письмо:\n• образование — **ukończyłem studia na kierunku** logistyka **na** Uniwersytecie…;\n• опыт — **w latach 2018–2022 pracowałem jako** + именительный (jako **magazynier**); **odpowiadałem za** + винительный;\n• навыки — **biegła znajomość** + родительный (języka angielskiego), знаю **biegle** (наречие); **zdobyłem doświadczenie w** + предложный;\n• письмо — **Z dużym zainteresowaniem przeczytałem ogłoszenie…**, **Uprzejmie proszę o rozpatrzenie mojej kandydatury**.',
      'CVs and cover letters:\n• education — **ukończyłem studia na kierunku** logistyka **na** Uniwersytecie…;\n• experience — **w latach 2018–2022 pracowałem jako** + nominative (jako **magazynier**); **odpowiadałem za** + accusative;\n• skills — **biegła znajomość** + genitive (języka angielskiego), I speak it **biegle** (adverb); **zdobyłem doświadczenie w** + locative;\n• the letter — **Z dużym zainteresowaniem przeczytałem ogłoszenie…**, **Uprzejmie proszę o rozpatrzenie mojej kandydatury**.',
    ),
    examples: [
      { pl: 'W latach 2018–2022 pracowałam jako księgowa i odpowiadałam za rozliczenia z kontrahentami.', tr: t('У 2018–2022 роках я працювала бухгалтеркою й відповідала за розрахунки з контрагентами.', 'В 2018–2022 годах я работала бухгалтером и отвечала за расчёты с контрагентами.', 'From 2018 to 2022 I worked as an accountant, responsible for settlements with contractors.') },
      { pl: 'Uprzejmie proszę o rozpatrzenie mojej kandydatury na stanowisko kierownika zmiany.', tr: t('Уклінно прошу розглянути мою кандидатуру на посаду керівника зміни.', 'Убедительно прошу рассмотреть мою кандидатуру на должность руководителя смены.', 'I kindly ask you to consider my application for the post of shift manager.') },
    ],
    exercises: [
      dialogue('dialogue.interview', REKRUTERKA, [
        {
          npc: 'Proszę opowiedzieć o swoim doświadczeniu zawodowym.',
          tr: t('Розкажіть, будь ласка, про свій професійний досвід.', 'Расскажите, пожалуйста, о своём профессиональном опыте.', 'Please tell me about your work experience.'),
          choose: [
            ['W latach 2019–2023 pracowałem jako magazynier i odpowiadałem za przyjęcie towaru.', t('У 2019–2023 роках я працював комірником і відповідав за приймання товару.', 'В 2019–2023 годах я работал кладовщиком и отвечал за приёмку товара.', 'From 2019 to 2023 I worked as a warehouseman, responsible for goods intake.')],
            ['W latach 2019–2023 pracowałem jako magazynierem i odpowiadałem za przyjęcie towaru.', t('(після **jako** — називний: jako **magazynier**)', '(после **jako** — именительный: jako **magazynier**)', '(after **jako** — nominative)')],
            ['W latach 2019–2023 pracowałem jako magazynier i odpowiadałem za przyjęciem towaru.', t('(**odpowiadać za** + знахідний: za **przyjęcie**)', '(**odpowiadać za** + винительный: za **przyjęcie**)', '(**odpowiadać za** + accusative)')],
          ],
          feedback: t('**Jako** + називний; **odpowiadać za** + знахідний.', '**Jako** + именительный; **odpowiadać za** + винительный.', '**Jako** + nominative; **odpowiadać za** + accusative.'),
        },
        {
          npc: 'A jakie ma pan kwalifikacje?',
          tr: t('А яку ви маєте кваліфікацію?', 'А какая у вас квалификация?', 'And what qualifications do you have?'),
          choose: [
            ['Ukończyłem studia na kierunku logistyka i biegle znam język angielski.', t('Я закінчив навчання за напрямом «логістика» й вільно знаю англійську.', 'Я окончил вуз по направлению «логистика» и свободно знаю английский.', 'I have a degree in logistics and speak fluent English.')],
            ['Ukończyłem studia na kierunku logistyka i biegły znam język angielski.', t('(як знаю — прислівник: **biegle**)', '(как знаю — наречие: **biegle**)', '(adverb: **biegle**)')],
            ['Ukończyłem studia na kierunku logistyka i biegle znam językiem angielskim.', t('(знати що — знахідний: **język angielski**)', '(знать что — винительный: **język angielski**)', '(accusative: **język angielski**)')],
          ],
          feedback: t('**Biegle znam język angielski** = **biegła znajomość języka angielskiego**.', '**Biegle znam język angielski** = **biegła znajomość języka angielskiego**.', '**Biegle znam** = **biegła znajomość**.'),
        },
      ]),
      fillGap('register.cv', 'Wymagana jest biegła znajomość ___ angielskiego.', ['języka', 'język', 'językiem', 'języku'],
        t('Вимагається вільне знання англійської мови.', 'Требуется свободное знание английского языка.', 'Fluent English is required.'),
        t('**Znajomość** + родовий: **języka**.', '**Znajomość** + родительный: **języka**.', '**Znajomość** + genitive.')),
      fillGap('register.cv', 'Podczas stażu zdobyłam doświadczenie ___ obsłudze klienta.', ['w', 'na', 'z', 'do'],
        t('Під час стажування я здобула досвід в обслуговуванні клієнтів.', 'Во время стажировки я получила опыт в обслуживании клиентов.', 'During my internship I gained experience in customer service.'),
        t('**Doświadczenie w** + місцевий: **w** obsłudze.', '**Doświadczenie w** + предложный: **w** obsłudze.', '**Doświadczenie w** + locative.')),
      fillGap('register.cv', 'Uprzejmie proszę o ___ mojej kandydatury.', ['rozpatrzenie', 'rozpatrzeniu', 'rozpatrzenia', 'rozpatrzeniem'],
        t('Уклінно прошу розглянути мою кандидатуру.', 'Убедительно прошу рассмотреть мою кандидатуру.', 'I kindly ask you to consider my application.'),
        t('**Prosić o** + знахідний: o **rozpatrzenie**.', '**Prosić o** + винительный: o **rozpatrzenie**.', '**Prosić o** + accusative.')),
      reading('reading.cv', 'Fragment CV: „2015–2020 — Uniwersytet Kazimierza Wielkiego w Bydgoszczy, kierunek: logistyka. 2020–2024 — firma transportowa w Toruniu, specjalistka ds. zakupów: odpowiadałam za negocjacje z dostawcami i kontrolę jakości. Języki: angielski — biegle, niemiecki — w stopniu komunikatywnym”.',
        t('Як авторка резюме знає німецьку?', 'Как автор резюме знает немецкий?', 'How well does the author speak German?'),
        [t('на рівні, достатньому для спілкування', 'на уровне, достаточном для общения', 'well enough to communicate'), t('вільно', 'свободно', 'fluently'), t('не знає зовсім', 'не знает вовсе', 'not at all')],
        t('«niemiecki — **w stopniu komunikatywnym**» — може спілкуватися; «biegle» — це про англійську.', '«niemiecki — **w stopniu komunikatywnym**» — может общаться; «biegle» — это об английском.', '“**w stopniu komunikatywnym**” — conversational; «biegle» is her English.')),
      reverseChoice('register.cv', t('Я відповідав за навчання нових працівників.', 'Я отвечал за обучение новых сотрудников.', 'I was responsible for training new staff.'),
        ['Odpowiadałem za szkolenie nowych pracowników.', 'Odpowiadałem za szkoleniem nowych pracowników.', 'Odpowiadałem na szkolenie nowych pracowników.'],
        t('Відповідати за — **odpowiadać za** + знахідний; «odpowiadać na» — відповідати на питання.', 'Отвечать за — **odpowiadać za** + винительный; «odpowiadać na» — отвечать на вопрос.', '**Odpowiadać za** + accusative; «na» is answering a question.')),
      findError('register.cv', ['Pracowałam', 'jako', 'kierowniczką', 'zmiany', 'przez', 'trzy', 'lata'], 2,
        t('Я працювала керівницею зміни три роки.', 'Я работала руководителем смены три года.', 'I worked as a shift manager for three years.'),
        t('Після **jako** — називний: **kierowniczka**.', 'После **jako** — именительный: **kierowniczka**.', 'After **jako** — nominative.')),
      build('register.cv', 'Uprzejmie proszę o rozpatrzenie mojej kandydatury', t('Уклінно прошу розглянути мою кандидатуру', 'Убедительно прошу рассмотреть мою кандидатуру', 'I kindly ask you to consider my application'), ['rozpatrzenia', 'moją'], [],
        t('Офіційна формула: **proszę o rozpatrzenie** (знахідний) **mojej kandydatury** (родовий).', 'Официальная формула: **proszę o rozpatrzenie** (винительный) **mojej kandydatury** (родительный).', 'The standard closing formula.')),
      match('register.cv', [
        ['list motywacyjny', t('мотиваційний лист', 'мотивационное письмо', 'cover letter')],
        ['stanowisko', t('посада', 'должность', 'position')],
        ['staż', t('стажування', 'стажировка', 'internship')],
        ['w stopniu komunikatywnym', t('на розмовному рівні', 'на разговорном уровне', 'at a conversational level')],
      ]),
    ],
  },
};

// ───────────────────────────── byd-7-plotki: Плітки (урок B1) ─────────────────────────────
const BYD7: LessonLevels = {
  B2: {
    explanation: t(
      'Непряма мова, як у пресі:\n• дієслова — **zapewnił, że…** (запевнив), **przyznał, że…** (визнав), **twierdzi, że…** (стверджує);\n• заперечити — **zaprzeczył, jakoby** + форма на -ł: zaprzeczył, jakoby **wiedział** (без «że»);\n• чутки — **podobno, ponoć, rzekomo** (нібито);\n• **mieć** + інфінітив — «кажуть, що»: sąsiad **ma** podobno **się wyprowadzić** (кажуть, переїде); **miał wygrać** w totka (кажуть, виграв);\n• **zaprzeczać** + давальний: zaprzecza **temu**.',
      'Косвенная речь, как в прессе:\n• глаголы — **zapewnił, że…** (заверил), **przyznał, że…** (признал), **twierdzi, że…** (утверждает);\n• опровергнуть — **zaprzeczył, jakoby** + форма на -ł: zaprzeczył, jakoby **wiedział** (без «że»);\n• слухи — **podobno, ponoć, rzekomo** (якобы);\n• **mieć** + инфинитив — «говорят, что»: sąsiad **ma** podobno **się wyprowadzić** (говорят, переедет); **miał wygrać** w totka (говорят, выиграл);\n• **zaprzeczać** + дательный: zaprzecza **temu**.',
      'Reported speech, press style:\n• verbs — **zapewnił, że…** (assured), **przyznał, że…** (admitted), **twierdzi, że…** (claims);\n• to deny — **zaprzeczył, jakoby** + the -ł form: zaprzeczył, jakoby **wiedział** (no «że»);\n• rumours — **podobno, ponoć, rzekomo** (allegedly);\n• **mieć** + infinitive — “is said to”: sąsiad **ma** podobno **się wyprowadzić**; **miał wygrać** w totka (is said to have won);\n• **zaprzeczać** + dative: zaprzecza **temu**.',
    ),
    examples: [
      { pl: 'Burmistrz zaprzeczył, jakoby wiedział o planach budowy.', tr: t('Мер заперечив, що знав про плани будівництва.', 'Мэр опроверг, что знал о планах строительства.', 'The mayor denied knowing about the building plans.') },
      { pl: 'Nowy sąsiad ma podobno otworzyć kawiarnię nad Brdą.', tr: t('Кажуть, новий сусід має відкрити кав’ярню над Брдою.', 'Говорят, новый сосед собирается открыть кафе на Брде.', 'The new neighbour is said to be opening a café by the Brda.') },
    ],
    exercises: [
      dialogue('dialogue.gossip', KRYSIA, [
        {
          npc: 'Wiesz, co mówią o panu z trzeciego piętra?',
          tr: t('Знаєш, що кажуть про пана з третього поверху?', 'Знаешь, что говорят о мужчине с третьего этажа?', 'Do you know what they’re saying about the man on the third floor?'),
          choose: [
            ['Podobno ma się wyprowadzić do Torunia, ale sam temu zaprzecza.', t('Кажуть, він переїде до Торуня, але сам це заперечує.', 'Говорят, он переезжает в Торунь, но сам это отрицает.', 'He’s said to be moving to Toruń, but he denies it.')],
            ['Podobno ma się wyprowadzić do Torunia, ale sam to zaprzecza.', t('(**zaprzeczać** + давальний: **temu**)', '(**zaprzeczać** + дательный: **temu**)', '(**zaprzeczać** + dative: **temu**)')],
            ['Podobno musi się wyprowadzić do Torunia, ale sam temu zaprzecza.', t('(чутка — **ma** + інфінітив; «musi» — мусить)', '(слух — **ma** + инфинитив; «musi» — должен, вынужден)', '(a rumour — **ma** + infinitive; «musi» means must)')],
          ],
          feedback: t('Чутка — **ma podobno** + інфінітив; **zaprzeczać temu**.', 'Слух — **ma podobno** + инфинитив; **zaprzeczać temu**.', 'Rumour — **ma podobno**; **zaprzeczać temu**.'),
        },
        {
          npc: 'A administrator coś mówił?',
          tr: t('А адміністратор щось казав?', 'А управляющий что-нибудь говорил?', 'Did the building manager say anything?'),
          choose: [
            ['Zaprzeczył, jakoby ktoś złożył wypowiedzenie.', t('Він заперечив, що хтось подав заяву про розірвання договору.', 'Он опроверг, что кто-то подал заявление о расторжении договора.', 'He denied that anyone had given notice.')],
            ['Zaprzeczył, jakoby ktoś złoży wypowiedzenie.', t('(після **jakoby** — форма на -ł: **złożył**)', '(после **jakoby** — форма на -ł: **złożył**)', '(after **jakoby** — the -ł form: **złożył**)')],
            ['Zaprzeczył, że jakoby ktoś złożył wypowiedzenie.', t('(без «że»: **zaprzeczył, jakoby**)', '(без «że»: **zaprzeczył, jakoby**)', '(no «że»: **zaprzeczył, jakoby**)')],
          ],
          feedback: t('**Zaprzeczył, jakoby** + форма на -ł.', '**Zaprzeczył, jakoby** + форма на -ł.', '**Zaprzeczył, jakoby** + -ł form.'),
        },
      ]),
      fillGap('register.reported', 'Prezes zapewnił, ___ zwolnień w fabryce nie będzie.', ['że', 'jakoby', 'czy', 'żeby'],
        t('Голова правління запевнив, що звільнень на фабриці не буде.', 'Председатель правления заверил, что увольнений на фабрике не будет.', 'The CEO assured everyone there would be no lay-offs at the factory.'),
        t('Запевнити — **zapewnić, że**; «jakoby» — лише після заперечення сказаного.', 'Заверить — **zapewnić, że**; «jakoby» — только при опровержении.', '**Zapewnić, że**; «jakoby» goes with denial.')),
      fillGap('register.reported', 'Rzecznik zaprzeczył, jakoby firma ___ kłopoty finansowe.', ['miała', 'ma', 'mieć', 'będzie mieć'],
        t('Речник заперечив, що фірма має фінансові труднощі.', 'Пресс-секретарь опроверг, что у фирмы финансовые трудности.', 'The spokesman denied the company had financial problems.'),
        t('Після **jakoby** — форма на -ł: **miała**.', 'После **jakoby** — форма на -ł: **miała**.', 'After **jakoby** — the -ł form.')),
      fillGap('register.reported', 'Podobno sąsiad ___ wygrać milion w totka, ale ja w to nie wierzę.', ['miał', 'miała', 'mieli', 'miało'],
        t('Кажуть, сусід нібито виграв мільйон у лото, але я в це не вірю.', 'Говорят, сосед якобы выиграл миллион в лото, но я в это не верю.', 'The neighbour is said to have won a million in the lottery, but I don’t believe it.'),
        t('«Кажуть, виграв» — **miał** + інфінітив; sąsiad — чоловічий рід.', '«Говорят, выиграл» — **miał** + инфинитив; sąsiad — мужской род.', '“Said to have won” — **miał** + infinitive.')),
      reading('reading.reported', 'Z lokalnego portalu: „Właściciel kamienicy przy Starym Rynku zaprzeczył, jakoby planował sprzedaż budynku. Zapewnił, że lokatorzy mogą spać spokojnie. Tymczasem w mieście mówi się, że inwestor z Warszawy ma podobno otworzyć tam hotel”.',
        t('Що заперечив власник кам’яниці?', 'Что опроверг владелец дома?', 'What did the owner of the townhouse deny?'),
        [t('що планує продати будинок', 'что планирует продать здание', 'that he plans to sell the building'), t('що мешканці можуть спати спокійно', 'что жильцы могут спать спокойно', 'that tenants can sleep easy'), t('що знайомий з інвестором з Варшави', 'что знаком с инвестором из Варшавы', 'that he knows the Warsaw investor')],
        t('«zaprzeczył, **jakoby planował sprzedaż** budynku». Що мешканці можуть спати спокійно, він, навпаки, запевнив.', '«zaprzeczył, **jakoby planował sprzedaż** budynku». Что жильцы могут спать спокойно, он, наоборот, заверил.', '“zaprzeczył, **jakoby planował sprzedaż**”; the “sleep easy” part is what he assured.')),
      reverseChoice('register.reported', t('Кажуть, мер має подати у відставку.', 'Говорят, мэр должен уйти в отставку.', 'The mayor is said to be resigning.'),
        ['Burmistrz ma podobno podać się do dymisji.', 'Burmistrz musi podobno podać się do dymisji.', 'Burmistrz ma podobno podać do dymisji.'],
        t('Чутка — **ma** + інфінітив; піти у відставку — **podać się do dymisji**.', 'Слух — **ma** + инфинитив; уйти в отставку — **podać się do dymisji**.', 'Rumour — **ma**; resign — **podać się do dymisji**.')),
      findError('register.reported', ['Zaprzeczyła,', 'jakoby', 'wie', 'coś', 'o', 'sprawie'], 2,
        t('Вона заперечила, що щось знає про справу.', 'Она опровергла, что что-то знает о деле.', 'She denied knowing anything about it.'),
        t('Після **jakoby** — форма на -ł: **wiedziała**.', 'После **jakoby** — форма на -ł: **wiedziała**.', 'After **jakoby** — **wiedziała**.')),
      build('register.reported', 'Minister zaprzeczył, jakoby wiedział o aferze', t('Міністр заперечив, що знав про аферу', 'Министр опроверг, что знал об афере', 'The minister denied knowing about the scandal'), ['że', 'wie'], [],
        t('**Zaprzeczyć, jakoby** + форма на -ł: **wiedział**.', '**Zaprzeczyć, jakoby** + форма на -ł: **wiedział**.', '**Zaprzeczyć, jakoby** + **wiedział**.')),
      match('register.reported', [
        ['rzekomo', t('нібито', 'якобы', 'allegedly')],
        ['zaprzeczyć', t('заперечити', 'опровергнуть', 'to deny')],
        ['zapewnić', t('запевнити', 'заверить', 'to assure')],
        ['przyznać', t('визнати', 'признать', 'to admit')],
      ]),
    ],
  },
};

// ───────────────────────────── byd-8-legendy: Легенди Бидгоща (урок B1) ─────────────────────────────
const BYD8: LessonLevels = {
  B2: {
    explanation: t(
      'Мова легенд і путівників:\n• початок — **Głosi legenda, że…**, **Według podania…**, **Dawno, dawno temu…**;\n• пасив із датою — kościół **został wzniesiony** w XV wieku; безособово — pomnik **odsłonięto** w 1910 roku (w + місцевий: **roku**);\n• означення — **zwany** + орудний: wyspa **zwana sercem** miasta; **słynący z** + родовий;\n• вид — **opowiadać** (розповідати, часто) vs **opowiedzieć** (розповісти цілком).',
      'Язык легенд и путеводителей:\n• начало — **Głosi legenda, że…**, **Według podania…**, **Dawno, dawno temu…**;\n• пассив с датой — kościół **został wzniesiony** w XV wieku; безлично — pomnik **odsłonięto** w 1910 roku (w + предложный: **roku**);\n• определение — **zwany** + творительный: wyspa **zwana sercem** miasta; **słynący z** + родительный;\n• вид — **opowiadać** (рассказывать, часто) vs **opowiedzieć** (рассказать целиком).',
      'The language of legends and guidebooks:\n• openings — **Głosi legenda, że…**, **Według podania…**, **Dawno, dawno temu…**;\n• passive with a date — kościół **został wzniesiony** w XV wieku; impersonal — pomnik **odsłonięto** w 1910 roku (w + locative: **roku**);\n• descriptions — **zwany** + instrumental: wyspa **zwana sercem** miasta; **słynący z** + genitive;\n• aspect — **opowiadać** (to tell, often) vs **opowiedzieć** (to tell the whole story).',
    ),
    examples: [
      { pl: 'Głosi legenda, że pan Twardowski odwiedził kiedyś Bydgoszcz.', tr: t('Легенда каже, що пан Твардовський колись відвідав Бидгощ.', 'Легенда гласит, что пан Твардовский когда-то побывал в Быдгоще.', 'Legend has it that Mr Twardowski once visited Bydgoszcz.') },
      { pl: 'Pomnik Łuczniczki odsłonięto w parku w 1910 roku.', tr: t('Пам’ятник Лучниці відкрили в парку 1910 року.', 'Памятник Лучнице открыли в парке в 1910 году.', 'The Archer statue was unveiled in the park in 1910.') },
    ],
    exercises: [
      dialogue('dialogue.legends', BEATA, [
        {
          npc: 'Co wiecie o Łuczniczce?',
          tr: t('Що ви знаєте про Лучницю?', 'Что вы знаете о Лучнице?', 'What do you know about the Archer?'),
          choose: [
            ['Wiem, że pomnik odsłonięto w 1910 roku i że stoi w parku.', t('Знаю, що пам’ятник відкрили 1910 року й що він стоїть у парку.', 'Знаю, что памятник открыли в 1910 году и что он стоит в парке.', 'I know the statue was unveiled in 1910 and stands in the park.')],
            ['Wiem, że pomnik odsłonięty w 1910 roku i że stoi w parku.', t('(безособово — **odsłonięto**; «odsłonięty» без «został» — речення неповне)', '(безлично — **odsłonięto**; «odsłonięty» без «został» — предложение неполное)', '(impersonal **odsłonięto**; «odsłonięty» needs «został»)')],
            ['Wiem, że pomnik odsłonięto w 1910 rok i że stoi w parku.', t('(у якому році — місцевий: w 1910 **roku**)', '(в каком году — предложный: w 1910 **roku**)', '(locative: w 1910 **roku**)')],
          ],
          feedback: t('**Odsłonięto** + знахідний; **w 1910 roku**.', '**Odsłonięto** + винительный; **w 1910 roku**.', '**Odsłonięto**; **w 1910 roku**.'),
        },
        {
          npc: 'A Wyspa Młyńska? Słyszałam, że ma swój przydomek.',
          tr: t('А Млиновий острів? Я чула, що в нього є прізвисько.', 'А Мельничный остров? Я слышала, что у него есть прозвище.', 'And Mill Island? I hear it has a nickname.'),
          choose: [
            ['Tak, jest zwana sercem Bydgoszczy.', t('Так, його називають серцем Бидгоща.', 'Да, его называют сердцем Быдгоща.', 'Yes, it’s known as the heart of Bydgoszcz.')],
            ['Tak, jest zwana sercem Bydgoszcz.', t('(чийого — родовий: **Bydgoszczy**)', '(чьего — родительный: **Bydgoszczy**)', '(genitive: **Bydgoszczy**)')],
            ['Tak, jest zwaną sercem Bydgoszczy.', t('(після «jest» — називний: **zwana**)', '(после «jest» — именительный: **zwana**)', '(after «jest» — nominative **zwana**)')],
          ],
          feedback: t('**Zwana sercem** + родовий.', '**Zwana sercem** + родительный.', '**Zwana sercem** + genitive.'),
        },
      ]),
      fillGap('register.legends', '___ legenda, że w podziemiach kamienicy ukryto skarb.', ['Głosi', 'Mówi się', 'Głosiła się', 'Głoszą'],
        t('Легенда каже, що в підземеллях кам’яниці заховали скарб.', 'Легенда гласит, что в подземельях дома спрятали клад.', 'Legend has it that treasure was hidden in the cellars of the townhouse.'),
        t('Стала формула — **głosi legenda, że…** (legenda — підмет, однина).', 'Устойчивая формула — **głosi legenda, że…** (legenda — подлежащее, единственное число).', 'Set formula: **głosi legenda, że…**')),
      fillGap('register.legends', 'Kościół farny został ___ w XV wieku.', ['wzniesiony', 'wzniesiona', 'wznieśli', 'wznosił'],
        t('Фарний костел збудували в XV столітті.', 'Фарный костёл возвели в XV веке.', 'The parish church was built in the 15th century.'),
        t('Kościół — чоловічий рід: **został wzniesiony**.', 'Kościół — мужской род: **został wzniesiony**.', 'Kościół is masculine: **wzniesiony**.')),
      fillGap('register.legends', 'Pan Henryk lubił ___ wnukom legendy o Twardowskim.', ['opowiadać', 'opowiedzieć', 'opowiedział', 'opowiadanie'],
        t('Пан Генрик любив розповідати онукам легенди про Твардовського.', 'Пан Хенрик любил рассказывать внукам легенды о Твардовском.', 'Mr Henryk loved telling his grandchildren legends about Twardowski.'),
        t('Любив — отже, багато разів: недоконаний **opowiadać**.', 'Любил — значит, много раз: несовершенный **opowiadać**.', 'Repeated — imperfective **opowiadać**.')),
      reading('reading.legends', 'Z przewodnika: „Wyspa Młyńska, zwana sercem Bydgoszczy, przez wieki słynęła z młynów. Według podania to tu kupcy zbierali się przed wyprawami z ziarnem do Gdańska. Dziś wyspa słynie z muzeów i koncertów plenerowych”.',
        t('Чим острів славиться сьогодні?', 'Чем остров славится сегодня?', 'What is the island famous for today?'),
        [t('музеями й концертами просто неба', 'музеями и концертами под открытым небом', 'museums and open-air concerts'), t('млинами', 'мельницами', 'its mills'), t('ярмарками зерна', 'зерновыми ярмарками', 'grain fairs')],
        t('«**Dziś** wyspa **słynie z muzeów i koncertów plenerowych**»; млини — «przez wieki», тобто раніше.', '«**Dziś** wyspa **słynie z muzeów i koncertów plenerowych**»; мельницы — «przez wieki», то есть раньше.', '“**Dziś** … **słynie z muzeów i koncertów**”; the mills were in the past.')),
      reverseChoice('register.legends', t('Бабуся розповіла нам усю легенду від початку до кінця.', 'Бабушка рассказала нам всю легенду от начала до конца.', 'Gran told us the whole legend from beginning to end.'),
        ['Babcia opowiedziała nam całą legendę od początku do końca.', 'Babcia opowiedziała nas całą legendę od początku do końca.', 'Babcia opowiedziała nam całą legendę od początku do koniec.'],
        t('Кому — давальний: **nam**; **do** + родовий: do **końca**.', 'Кому — дательный: **nam**; **do** + родительный: do **końca**.', 'Dative **nam**; **do końca**.')),
      findError('register.legends', ['Katedra', 'została', 'wzniesiony', 'w', 'XV', 'wieku'], 2,
        t('Собор збудували в XV столітті.', 'Собор возвели в XV веке.', 'The cathedral was built in the 15th century.'),
        t('Katedra — жіночий рід: **wzniesiona**.', 'Katedra — женский род: **wzniesiona**.', 'Katedra is feminine: **wzniesiona**.')),
      build('register.legends', 'Głosi legenda, że w kamienicy ukryto skarb', t('Легенда каже, що в кам’яниці заховали скарб', 'Легенда гласит, что в доме спрятали клад', 'Legend has it that treasure was hidden in the house'), ['głoszą', 'ukryli'], [],
        t('**Głosi legenda, że…**; безособово — **ukryto**.', '**Głosi legenda, że…**; безлично — **ukryto**.', '**Głosi legenda**; impersonal **ukryto**.')),
      match('register.legends', [
        ['głosi legenda', t('легенда каже', 'легенда гласит', 'legend has it')],
        ['według podania', t('за переказом', 'по преданию', 'according to tradition')],
        ['słynąć z', t('славитися', 'славиться', 'to be famous for')],
        ['odsłonić pomnik', t('відкрити пам’ятник', 'открыть памятник', 'to unveil a monument')],
      ]),
    ],
  },
};

// ───────────────────────────── byd-boss: Іспит Бидгоща (бос B1) ─────────────────────────────
const BYDBOSS: LessonLevels = {
  B2: {
    explanation: t(
      'Повторення Бидгоща (B2):\n• дієприслівники — **wracając** (одночасно), **zwiedziwszy** (спершу); підмет той самий;\n• вид — **nie czytałem / nie przeczytałem**, **nie otwieraj / nie zgub**, **zdążyć** + доконаний;\n• спогади — **miałem w zwyczaju**, **bywało, że**, **tęsknić za**; рух — **objechać, przejechać, zjechać z**;\n• подія — **gdy tylko**, **jak się okazało**, **został potrącony przez**; резюме — **jako** + називний, **odpowiadać za**;\n• чутки й легенди — **zaprzeczył, jakoby** + -ł, **ma podobno**, **głosi legenda**, **odsłonięto**, **zwany**.',
      'Повторение Быдгоща (B2):\n• деепричастия — **wracając** (одновременно), **zwiedziwszy** (сначала); подлежащее одно;\n• вид — **nie czytałem / nie przeczytałem**, **nie otwieraj / nie zgub**, **zdążyć** + совершенный;\n• воспоминания — **miałem w zwyczaju**, **bywało, że**, **tęsknić za**; движение — **objechać, przejechać, zjechać z**;\n• происшествие — **gdy tylko**, **jak się okazało**, **został potrącony przez**; резюме — **jako** + именительный, **odpowiadać za**;\n• слухи и легенды — **zaprzeczył, jakoby** + -ł, **ma podobno**, **głosi legenda**, **odsłonięto**, **zwany**.',
      'Bydgoszcz review (B2):\n• participles — **wracając** (at the same time), **zwiedziwszy** (first); the same subject;\n• aspect — **nie czytałem / nie przeczytałem**, **nie otwieraj / nie zgub**, **zdążyć** + perfective;\n• memories — **miałem w zwyczaju**, **bywało, że**, **tęsknić za**; motion — **objechać, przejechać, zjechać z**;\n• incidents — **gdy tylko**, **jak się okazało**, **został potrącony przez**; CVs — **jako** + nominative, **odpowiadać za**;\n• rumours and legends — **zaprzeczył, jakoby** + -ł, **ma podobno**, **głosi legenda**, **odsłonięto**, **zwany**.',
    ),
    examples: [
      { pl: 'Wracając z pracy, przejechałem swój przystanek i wylądowałem w Fordonie.', tr: t('Повертаючись із роботи, я проїхав свою зупинку й опинився у Фордоні.', 'Возвращаясь с работы, я проехал свою остановку и оказался в Фордоне.', 'On my way home from work I missed my stop and ended up in Fordon.') },
      { pl: 'Właściciel zaprzeczył, jakoby planował sprzedaż kamienicy.', tr: t('Власник заперечив, що планує продати кам’яницю.', 'Владелец опроверг, что планирует продать дом.', 'The owner denied planning to sell the townhouse.') },
    ],
    exercises: [
      fillGap('vocab.boss', 'Wracając z pracy, zagadałem się i ___ swój przystanek.', ['przejechałem', 'objechałem', 'zjechałem', 'dojechałem'],
        t('Повертаючись із роботи, я заговорився й проїхав свою зупинку.', 'Возвращаясь с работы, я заговорился и проехал свою остановку.', 'On my way home from work I got chatting and missed my stop.'),
        t('Пропустити зупинку — **przejechać** przystanek.', 'Пропустить остановку — **przejechać** przystanek.', 'To miss a stop — **przejechać**.')),
      fillGap('vocab.boss', 'Rzecznik zaprzeczył, jakoby miasto ___ sprzedać kamienicę.', ['chciało', 'chce', 'chcieć', 'zechce'],
        t('Речник заперечив, що місто хоче продати кам’яницю.', 'Пресс-секретарь опроверг, что город хочет продать дом.', 'The spokesman denied the city wanted to sell the townhouse.'),
        t('Після **jakoby** — форма на -ł; miasto — середній рід: **chciało**.', 'После **jakoby** — форма на -ł; miasto — средний род: **chciało**.', 'After **jakoby** — **chciało** (neuter).')),
      fillGap('vocab.boss', 'Pomnik Łuczniczki ___ w 1910 roku.', ['odsłonięto', 'odsłonił', 'odsłonięty', 'odsłaniano'],
        t('Пам’ятник Лучниці відкрили 1910 року.', 'Памятник Лучнице открыли в 1910 году.', 'The Archer statue was unveiled in 1910.'),
        t('Одна подія, безособово — доконаний **odsłonięto**.', 'Одно событие, безлично — совершенный **odsłonięto**.', 'A single event, impersonal — **odsłonięto**.')),
      reverseChoice('vocab.boss', t('Як виявилося, сусід нічого не знав.', 'Как оказалось, сосед ничего не знал.', 'As it turned out, the neighbour knew nothing.'),
        ['Jak się okazało, sąsiad o niczym nie wiedział.', 'Jak się okazało, sąsiad o nic nie wiedział.', 'Jak się okazało, sąsiad o niczym wiedział.'],
        t('**O** + місцевий: o **niczym**; польською заперечення подвійне: o niczym **nie** wiedział.', '**O** + предложный: o **niczym**; в польском отрицание двойное: o niczym **nie** wiedział.', '**O niczym** + double negation: **nie** wiedział.')),
      reading('reading.boss', 'Bobek pisze do Agi: „Wracając w sobotę z Torunia, przejechałem swój przystanek i wylądowałem w Fordonie. Zanim zdążyłem wrócić, zaczęła się ulewa. Jak się okazało, pan Henryk czekał na mnie z herbatą i opowiedział mi całą legendę o Twardowskim. Podobno Twardowski ma się jutro pojawić w oknie kamienicy na Rynku o 13:13”.',
        t('Чому Бобек опинився у Фордоні?', 'Почему Бобек оказался в Фордоне?', 'Why did Bobek end up in Fordon?'),
        [t('бо проїхав свою зупинку', 'потому что проехал свою остановку', 'because he missed his stop'), t('бо їхав до пана Генрика', 'потому что ехал к пану Хенрику', 'because he was going to Mr Henryk’s'), t('бо почалася злива', 'потому что начался ливень', 'because a downpour started')],
        t('«**przejechałem swój przystanek** i wylądowałem w Fordonie».', '«**przejechałem swój przystanek** i wylądowałem w Fordonie».', '“**przejechałem swój przystanek**”.')),
      dialogue('dialogue.boss', HENRYK, [
        {
          npc: 'No i jak minął weekend w Toruniu?',
          tr: t('Ну, і як минули вихідні в Торуні?', 'Ну и как прошли выходные в Торуни?', 'So how was the weekend in Toruń?'),
          choose: [
            ['Pięknie! Zwiedziwszy starówkę, wróciliśmy wieczorem do Bydgoszczy.', t('Чудово! Оглянувши старе місто, ми ввечері повернулися до Бидгоща.', 'Прекрасно! Осмотрев старый город, мы вечером вернулись в Быдгощ.', 'Lovely! After seeing the old town, we came back to Bydgoszcz in the evening.')],
            ['Pięknie! Zwiedzając starówkę, wróciliśmy wieczorem do Bydgoszczy.', t('(спершу оглянули, потім повернулися — **zwiedziwszy**)', '(сначала осмотрели, потом вернулись — **zwiedziwszy**)', '(first the visit, then home — **zwiedziwszy**)')],
            ['Pięknie! Zwiedziwszy starówkę, wróciliśmy wieczorem do Bydgoszcz.', t('(**do** + родовий: do **Bydgoszczy**)', '(**do** + родительный: do **Bydgoszczy**)', '(**do** + genitive: **Bydgoszczy**)')],
          ],
          feedback: t('**Zwiedziwszy** — попередня дія; **do Bydgoszczy**.', '**Zwiedziwszy** — предшествующее действие; **do Bydgoszczy**.', '**Zwiedziwszy**; **do Bydgoszczy**.'),
        },
        {
          npc: 'A słyszałeś, że kamienica przy Rynku ma być sprzedana?',
          tr: t('А ти чув, що кам’яницю біля Ринку мають продати?', 'А ты слышал, что дом у Рынка собираются продать?', 'Have you heard the townhouse on the Market Square is to be sold?'),
          choose: [
            ['Słyszałem, ale właściciel zaprzeczył, jakoby planował sprzedaż.', t('Чув, але власник заперечив, що планує продаж.', 'Слышал, но владелец опроверг, что планирует продажу.', 'I did, but the owner denied planning a sale.')],
            ['Słyszałem, ale właściciel zaprzeczył, jakoby planuje sprzedaż.', t('(після **jakoby** — форма на -ł: **planował**)', '(после **jakoby** — форма на -ł: **planował**)', '(after **jakoby** — **planował**)')],
            ['Słyszałem, ale właściciel zaprzeczył, jakoby planował sprzedaży.', t('(**planować** + знахідний: **sprzedaż**)', '(**planować** + винительный: **sprzedaż**)', '(**planować** + accusative)')],
          ],
          feedback: t('**Zaprzeczył, jakoby planował sprzedaż**.', '**Zaprzeczył, jakoby planował sprzedaż**.', '**Zaprzeczył, jakoby planował sprzedaż**.'),
        },
      ]),
      findError('vocab.boss', ['Odpowiadałam', 'za', 'obsługą', 'klientów', 'w', 'hotelu'], 2,
        t('Я відповідала за обслуговування клієнтів у готелі.', 'Я отвечала за обслуживание клиентов в гостинице.', 'I was responsible for customer service at the hotel.'),
        t('**Odpowiadać za** + знахідний: za **obsługę**.', '**Odpowiadać za** + винительный: za **obsługę**.', '**Odpowiadać za** + accusative.')),
      build('vocab.boss', 'W latach 2020–2024 pracowałem jako kierowca', t('У 2020–2024 роках я працював водієм', 'В 2020–2024 годах я работал водителем', 'From 2020 to 2024 I worked as a driver'), ['kierowcą', 'przez'], [],
        t('Після **jako** — називний: **kierowca** («pracowałem kierowcą» — без «jako»).', 'После **jako** — именительный: **kierowca** («pracowałem kierowcą» — без «jako»).', 'After **jako** — nominative **kierowca**.')),
      match('vocab.boss', [
        ['zwiedziwszy', t('оглянувши', 'осмотрев', 'having visited')],
        ['rzekomo', t('нібито', 'якобы', 'allegedly')],
        ['objechać', t('об’їхати', 'объехать', 'to go round')],
        ['zwany', t('що зветься', 'именуемый', 'known as')],
      ]),
    ],
  },
};

export const BYDGOSZCZ_LEVELS: Record<string, LessonLevels> = {
  'byd-1-weekend': BYD1,
  'byd-2-aspekt': BYD2,
  'byd-3-dziecinstwo': BYD3,
  'byd-4-pojechalem': BYD4,
  'byd-5-co-sie-stalo': BYD5,
  'byd-6-zyciorys': BYD6,
  'byd-7-plotki': BYD7,
  'byd-8-legendy': BYD8,
  'byd-boss': BYDBOSS,
};

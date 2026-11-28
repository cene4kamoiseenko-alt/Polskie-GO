/**
 * Торунь — трудные версии уроков (2026-11-28, docs/LEVELS_RU.md, ТЗ 1.0, этап 2). Город планов и будущего: расписание, обещания,
 * намерения, карьера, бюджет поездки, условия и вероятность, Коперник. Те же герои (коллега Kasia, карьерный консультант pani Ewa,
 * руководитель pan Adam, друг Tomek, экскурсовод pan Marek). Все уроки города — B1, поэтому версия одна — B2:
 *  • официальное будущее (z dniem, nie będzie wolno, będę miał skończony), союзы с совершенным будущим (gdy tylko, dopóki nie,
 *    zanim), книжные намерения (noszę się z zamiarem, mam na celu, dążę do), карьера (objąć stanowisko, za porozumieniem stron),
 *    бюджет (zmieścić się w budżecie, opłaca się, w przeliczeniu na osobę), вероятность и сомнение (niewykluczone, że; wątpię, żeby),
 *    обязательства и мягкий совет (zobowiązuję się do, ręczę za, na twoim miejscu), научно-популярный язык о Копернике.
 * Правила качества — docs/EXERCISE_QUALITY.md. Аудирования и диктанта в версиях нет (нужна озвучка). Польский текст написан
 * по нормам языка, но проверка носителем ещё не проводилась (docs/ROADMAP_1_0.md).
 */
import { t, fillGap, reading, dialogue, reverseChoice, build, findError, match } from '../builders';
import type { LessonLevels } from '../types';

const KASIA = { name: 'Kasia', emoji: '👩🏻', role: t('колега з роботи', 'коллега с работы', 'a colleague') };
const EWA = { name: 'Pani Ewa', emoji: '👩🏼‍💼', role: t('кар’єрна консультантка', 'карьерный консультант', 'a career adviser') };
const ADAM = { name: 'Pan Adam', emoji: '👨🏻‍💼', role: t('керівник відділу', 'руководитель отдела', 'a team manager') };
const TOMEK = { name: 'Tomek', emoji: '👨🏻', role: t('друг із Торуня', 'друг из Торуня', 'a friend from Toruń') };
const MAREK = { name: 'Pan Marek', emoji: '🧔🏻', role: t('екскурсовод по Торуню', 'экскурсовод по Торуню', 'a Toruń tour guide') };

// ───────────────────────────── tor-1-bede: Буду робити (урок B1) ─────────────────────────────
const TOR1: LessonLevels = {
  B2: {
    explanation: t(
      'Майбутнє в офіційних планах і оголошеннях:\n• безособово — **będzie można / trzeba będzie / nie będzie wolno** + інфінітив;\n• результат до терміну — **mieć** + дієприкметник: do piątku **będę miał skończony** raport (звіт буде готовий);\n• регулярне в майбутньому — spotkania **będą się odbywać** w poniedziałki;\n• офіційні часові формули — **z dniem 1 marca** (починаючи з), **w najbliższym czasie**, **w nadchodzącym tygodniu**.',
      'Будущее в официальных планах и объявлениях:\n• безлично — **będzie można / trzeba będzie / nie będzie wolno** + инфинитив;\n• результат к сроку — **mieć** + причастие: do piątku **będę miał skończony** raport (отчёт будет готов);\n• регулярное в будущем — spotkania **będą się odbywać** w poniedziałki;\n• официальные формулы времени — **z dniem 1 marca** (начиная с), **w najbliższym czasie**, **w nadchodzącym tygodniu**.',
      'The future in official plans and notices:\n• impersonal — **będzie można / trzeba będzie / nie będzie wolno** + infinitive;\n• a result by a deadline — **mieć** + participle: do piątku **będę miał skończony** raport (the report will be done);\n• regular future events — spotkania **będą się odbywać** w poniedziałki;\n• official time phrases — **z dniem 1 marca** (as of), **w najbliższym czasie**, **w nadchodzącym tygodniu**.',
    ),
    examples: [
      { pl: 'Z dniem 1 marca nie będzie wolno parkować na Rynku Staromiejskim.', tr: t('З 1 березня не можна буде паркуватися на Старому Ринку.', 'С 1 марта нельзя будет парковаться на Старой Рыночной площади.', 'As of 1 March, parking on the Old Town Square will not be allowed.') },
      { pl: 'Do piątku będę miała gotowy raport i będzie można go wysłać klientowi.', tr: t('До п’ятниці в мене буде готовий звіт, і його можна буде надіслати клієнтові.', 'К пятнице у меня будет готов отчёт, и его можно будет отправить клиенту.', 'By Friday I’ll have the report ready and it can go to the client.') },
    ],
    exercises: [
      dialogue('dialogue.plans', ADAM, [
        {
          npc: 'Jak wygląda harmonogram projektu na przyszły tydzień?',
          tr: t('Який графік проєкту на наступний тиждень?', 'Какой график проекта на следующую неделю?', 'What does the project schedule look like for next week?'),
          choose: [
            ['Do środy będę miał skończony raport, a w czwartek będzie można go przedstawić klientowi.', t('До середи в мене буде готовий звіт, а в четвер його можна буде показати клієнтові.', 'К среде у меня будет готов отчёт, а в четверг его можно будет показать клиенту.', 'By Wednesday the report will be done, and on Thursday we can present it to the client.')],
            ['Do środy będę miał skończonym raport, a w czwartek będzie można go przedstawić klientowi.', t('(дієприкметник узгоджується з raport — знахідний: **skończony**)', '(причастие согласуется с raport — винительный: **skończony**)', '(the participle agrees with raport: **skończony**)')],
            ['Do środy będę miał skończony raport, a w czwartek będzie mógł go przedstawić klientowi.', t('(безособово — **będzie można**; «będzie mógł» — зможе хтось конкретний)', '(безлично — **będzie można**; «będzie mógł» — сможет кто-то конкретный)', '(impersonal **będzie można**; «będzie mógł» needs a subject)')],
          ],
          feedback: t('**Będę miał skończony** raport; **będzie można** + інфінітив.', '**Będę miał skończony** raport; **będzie można** + инфинитив.', '**Będę miał skończony**; **będzie można**.'),
        },
        {
          npc: 'A co z parkingiem pod biurem? Słyszałem o jakichś zmianach.',
          tr: t('А що з парковкою біля офісу? Я чув про якісь зміни.', 'А что с парковкой у офиса? Я слышал о каких-то изменениях.', 'And the car park by the office? I heard something’s changing.'),
          choose: [
            ['Z dniem 1 marca nie będzie wolno parkować przed budynkiem.', t('З 1 березня не можна буде паркуватися перед будинком.', 'С 1 марта нельзя будет парковаться перед зданием.', 'As of 1 March, parking in front of the building won’t be allowed.')],
            ['Od dniem 1 marca nie będzie wolno parkować przed budynkiem.', t('(офіційна формула — **z dniem**; «od» — з родовим: od 1 marca)', '(официальная формула — **z dniem**; «od» — с родительным: od 1 marca)', '(the formula is **z dniem**; «od» takes the genitive)')],
            ['Z dniem 1 marca nie będzie wolne parkować przed budynkiem.', t('(заборона — **nie będzie wolno**, прислівник)', '(запрет — **nie będzie wolno**, наречие)', '(prohibition — **nie będzie wolno**)')],
          ],
          feedback: t('**Z dniem…** + **nie będzie wolno**.', '**Z dniem…** + **nie będzie wolno**.', '**Z dniem…** + **nie będzie wolno**.'),
        },
      ]),
      fillGap('grammar.future', 'Od przyszłego roku ___ będzie złożyć wniosek przez internet.', ['można', 'mogło', 'może', 'możność'],
        t('З наступного року можна буде подати заяву через інтернет.', 'Со следующего года можно будет подать заявление через интернет.', 'From next year it will be possible to apply online.'),
        t('Безособово — **można będzie / będzie można** + інфінітив.', 'Безлично — **można będzie / będzie można** + инфинитив.', 'Impersonal — **można będzie** + infinitive.')),
      fillGap('grammar.future', 'W ___ czasie odezwiemy się w sprawie oferty.', ['najbliższym', 'najbliższy', 'najbliższego', 'najbliżej'],
        t('Найближчим часом ми зв’яжемося щодо пропозиції.', 'В ближайшее время мы свяжемся по поводу предложения.', 'We’ll be in touch about the offer shortly.'),
        t('Формула — **w najbliższym czasie** (місцевий).', 'Формула — **w najbliższym czasie** (предложный).', 'Set phrase: **w najbliższym czasie**.')),
      fillGap('grammar.future', 'Spotkania zespołu ___ się odbywać w poniedziałki o dziewiątej.', ['będą', 'będzie', 'będziemy', 'byłyby'],
        t('Зустрічі команди відбуватимуться щопонеділка о дев’ятій.', 'Встречи команды будут проходить по понедельникам в девять.', 'Team meetings will take place on Mondays at nine.'),
        t('Spotkania — множина: **będą się odbywać**.', 'Spotkania — множественное: **będą się odbywać**.', 'Plural subject: **będą**.')),
      reading('reading.future', 'Komunikat urzędu miasta: „Z dniem 1 kwietnia na Starym Mieście będzie obowiązywać strefa płatnego parkowania. Mieszkańcy będą mogli wykupić abonament. Turyści będą musieli korzystać z parkingów nad Wisłą. Nie będzie wolno wjeżdżać na Rynek Staromiejski”.',
        t('Що доведеться робити туристам?', 'Что придётся делать туристам?', 'What will tourists have to do?'),
        [t('користуватися парковками над Віслою', 'пользоваться парковками у Вислы', 'use the car parks by the Vistula'), t('купувати абонемент', 'покупать абонемент', 'buy a permit'), t('в’їжджати на Ринок лише зранку', 'въезжать на Рынок только утром', 'drive into the square only in the morning')],
        t('«Turyści **będą musieli korzystać z parkingów nad Wisłą**»; абонемент — для мешканців.', '«Turyści **będą musieli korzystać z parkingów nad Wisłą**»; абонемент — для жителей.', '“Turyści **będą musieli korzystać z parkingów**”; permits are for residents.')),
      reverseChoice('grammar.future', t('До понеділка в мене буде готова презентація.', 'К понедельнику у меня будет готова презентация.', 'By Monday I’ll have the presentation ready.'),
        ['Do poniedziałku będę miał gotową prezentację.', 'Do poniedziałku będę miał gotowa prezentacja.', 'Do poniedziałku będę mieć gotowy prezentację.'],
        t('**Mieć** + знахідний: **gotową prezentację** (жіночий рід).', '**Mieć** + винительный: **gotową prezentację** (женский род).', '**Mieć** + accusative: **gotową prezentację**.')),
      findError('grammar.future', ['Od', 'przyszłego', 'miesiąca', 'nie', 'będzie', 'wolne', 'palić', 'na', 'dworcu'], 5,
        t('З наступного місяця не можна буде курити на вокзалі.', 'Со следующего месяца нельзя будет курить на вокзале.', 'From next month smoking at the station won’t be allowed.'),
        t('Заборона — **nie będzie wolno**.', 'Запрет — **nie będzie wolno**.', 'Prohibition — **wolno**.')),
      build('grammar.future', 'Trzeba będzie wcześniej zarezerwować bilety', t('Треба буде заздалегідь забронювати квитки', 'Нужно будет заранее забронировать билеты', 'We’ll need to book tickets in advance'), ['będą', 'musi'], ['Będzie trzeba wcześniej zarezerwować bilety', 'Wcześniej trzeba będzie zarezerwować bilety'],
        t('Безособово — **trzeba będzie** (або **będzie trzeba**) + інфінітив.', 'Безлично — **trzeba będzie** (или **będzie trzeba**) + инфинитив.', 'Impersonal **trzeba będzie** + infinitive.')),
      match('grammar.future', [
        ['z dniem 1 marca', t('з 1 березня', 'с 1 марта', 'as of 1 March')],
        ['w najbliższym czasie', t('найближчим часом', 'в ближайшее время', 'shortly')],
        ['nie będzie wolno', t('не можна буде', 'нельзя будет', 'it won’t be allowed')],
        ['trzeba będzie', t('треба буде', 'нужно будет', 'it will be necessary')],
      ]),
    ],
  },
};

// ───────────────────────────── tor-2-zrobie: Зроблю (урок B1) ─────────────────────────────
const TOR2: LessonLevels = {
  B2: {
    explanation: t(
      'Доконаний майбутній у складних реченнях:\n• **gdy tylko / jak tylko** + доконаний майбутній — щойно: **gdy tylko skończę**, zadzwonię;\n• **zanim** + доконаний — перш ніж: **zanim wyjdziesz**, zamknij okno;\n• **dopóki nie** + доконаний — доки не: nie wyjdę, **dopóki nie skończę**;\n• **zdążę / zdołam** + доконаний інфінітив: nie zdążę **napisać**;\n• у підрядному реченні про майбутнє — майбутній час, а не теперішній: «gdy tylko **przyjadę**», а не «przyjeżdżam».',
      'Совершенное будущее в сложных предложениях:\n• **gdy tylko / jak tylko** + совершенное будущее — как только: **gdy tylko skończę**, zadzwonię;\n• **zanim** + совершенный — прежде чем: **zanim wyjdziesz**, zamknij okno;\n• **dopóki nie** + совершенный — пока не: nie wyjdę, **dopóki nie skończę**;\n• **zdążę / zdołam** + совершенный инфинитив: nie zdążę **napisać**;\n• в придаточном о будущем — будущее время, а не настоящее: «gdy tylko **przyjadę**», а не «przyjeżdżam».',
      'The perfective future in complex sentences:\n• **gdy tylko / jak tylko** + perfective future — as soon as: **gdy tylko skończę**, zadzwonię;\n• **zanim** + perfective — before: **zanim wyjdziesz**, zamknij okno;\n• **dopóki nie** + perfective — until: nie wyjdę, **dopóki nie skończę**;\n• **zdążę / zdołam** + perfective infinitive: nie zdążę **napisać**;\n• future clauses use the future, not the present: «gdy tylko **przyjadę**», not «przyjeżdżam».',
    ),
    examples: [
      { pl: 'Gdy tylko dostanę odpowiedź, dam ci znać.', tr: t('Щойно отримаю відповідь, дам тобі знати.', 'Как только получу ответ, дам тебе знать.', 'As soon as I get an answer, I’ll let you know.') },
      { pl: 'Nie wyjdę z biura, dopóki nie wyślę tej oferty.', tr: t('Я не вийду з офісу, доки не надішлю цієї пропозиції.', 'Я не уйду из офиса, пока не отправлю это предложение.', 'I won’t leave the office until I’ve sent this offer.') },
    ],
    exercises: [
      dialogue('dialogue.future', KASIA, [
        {
          npc: 'Kiedy wyślesz mi poprawioną ofertę?',
          tr: t('Коли ти надішлеш мені виправлену пропозицію?', 'Когда ты пришлёшь мне исправленное предложение?', 'When will you send me the revised offer?'),
          choose: [
            ['Gdy tylko skończę rozmowę z klientem, od razu ci ją wyślę.', t('Щойно закінчу розмову з клієнтом, одразу тобі її надішлю.', 'Как только закончу разговор с клиентом, сразу тебе его пришлю.', 'As soon as I finish with the client, I’ll send it straight over.')],
            ['Gdy tylko kończę rozmowę z klientem, od razu ci ją wyślę.', t('(дія в майбутньому — **skończę**, не теперішній час)', '(действие в будущем — **skończę**, не настоящее время)', '(a future action — **skończę**, not the present)')],
            ['Gdy tylko skończę rozmowę z klientem, od razu ci jej wyślę.', t('(надіслати що — знахідний: **ją**)', '(прислать что — винительный: **ją**)', '(accusative: **ją**)')],
          ],
          feedback: t('**Gdy tylko** + доконаний майбутній.', '**Gdy tylko** + совершенное будущее.', '**Gdy tylko** + perfective future.'),
        },
        {
          npc: 'A zdążysz przed piątą?',
          tr: t('А встигнеш до п’ятої?', 'А успеешь до пяти?', 'Will you make it before five?'),
          choose: [
            ['Raczej tak. Nie wyjdę z biura, dopóki jej nie wyślę.', t('Мабуть, так. Я не вийду з офісу, доки її не надішлю.', 'Скорее да. Я не уйду из офиса, пока его не отправлю.', 'Probably. I won’t leave the office until I’ve sent it.')],
            ['Raczej tak. Nie wyjdę z biura, dopóki ją wyślę.', t('(доки не — **dopóki nie**; після «nie» — родовий: **jej**)', '(пока не — **dopóki nie**; после «nie» — родительный: **jej**)', '(**dopóki nie**; genitive **jej** after «nie»)')],
            ['Raczej tak. Nie wyjdę z biura, dopóki jej nie wysyłam.', t('(доконаний майбутній: **nie wyślę**)', '(совершенное будущее: **nie wyślę**)', '(perfective future: **nie wyślę**)')],
          ],
          feedback: t('**Dopóki nie** + доконаний майбутній.', '**Dopóki nie** + совершенное будущее.', '**Dopóki nie** + perfective future.'),
        },
      ]),
      fillGap('grammar.future-perfective', 'Zanim ___, zamknij proszę okno w sali.', ['wyjdziesz', 'wychodzisz', 'wyszedłeś', 'wyjdź'],
        t('Перш ніж вийдеш, зачини, будь ласка, вікно в залі.', 'Прежде чем уйдёшь, закрой, пожалуйста, окно в зале.', 'Before you leave, please close the window in the room.'),
        t('**Zanim** + доконаний майбутній: **wyjdziesz**.', '**Zanim** + совершенное будущее: **wyjdziesz**.', '**Zanim** + perfective future.')),
      fillGap('grammar.future-perfective', 'Nie zdążę ___ raportu do jutra.', ['napisać', 'pisać', 'napiszę', 'pisanie'],
        t('Я не встигну написати звіт до завтра.', 'Я не успею написать отчёт к завтра.', 'I won’t manage to write the report by tomorrow.'),
        t('**Zdążyć** + доконаний інфінітив: **napisać**.', '**Zdążyć** + совершенный инфинитив: **napisać**.', '**Zdążyć** + perfective infinitive.')),
      fillGap('grammar.future-perfective', 'Jak tylko ___ do Torunia, zadzwonię do ciebie z dworca.', ['przyjadę', 'przyjeżdżam', 'przyjechałem', 'przyjedź'],
        t('Щойно приїду до Торуня, подзвоню тобі з вокзалу.', 'Как только приеду в Торунь, позвоню тебе с вокзала.', 'As soon as I get to Toruń, I’ll call you from the station.'),
        t('Майбутня дія — **przyjadę** (доконаний майбутній).', 'Будущее действие — **przyjadę** (совершенное будущее).', 'Future action — **przyjadę**.')),
      reading('reading.future-perfective', 'Mail od Kasi: „Adam, gdy tylko dostanę dane z działu sprzedaży, przygotuję raport. Zanim go wyślę klientowi, przeczytaj go, proszę. Nie wyjdę dziś z biura, dopóki nie skończę prezentacji, więc możesz dzwonić do 19:00”.',
        t('Про що Кася просить Адама?', 'О чём Кася просит Адама?', 'What does Kasia ask Adam to do?'),
        [t('прочитати звіт, перш ніж вона надішле його клієнтові', 'прочитать отчёт, прежде чем она отправит его клиенту', 'read the report before she sends it to the client'), t('надіслати дані з відділу продажу', 'прислать данные из отдела продаж', 'send the sales data'), t('подзвонити клієнтові до 19:00', 'позвонить клиенту до 19:00', 'call the client by 7 p.m.')],
        t('«**Zanim go wyślę klientowi, przeczytaj go**, proszę».', '«**Zanim go wyślę klientowi, przeczytaj go**, proszę».', '“**Zanim go wyślę klientowi, przeczytaj go**”.')),
      reverseChoice('grammar.future-perfective', t('Я не піду, доки ти не повернешся.', 'Я не уйду, пока ты не вернёшься.', 'I won’t go until you get back.'),
        ['Nie pójdę, dopóki nie wrócisz.', 'Nie pójdę, dopóki wrócisz.', 'Nie pójdę, dopóki nie wracasz.'],
        t('**Dopóki nie** + доконаний майбутній: **nie wrócisz**.', '**Dopóki nie** + совершенное будущее: **nie wrócisz**.', '**Dopóki nie** + perfective future.')),
      findError('grammar.future-perfective', ['Gdy', 'tylko', 'dostaję', 'wypłatę,', 'kupię', 'nowy', 'rower'], 2,
        t('Щойно отримаю зарплату, куплю новий велосипед.', 'Как только получу зарплату, куплю новый велосипед.', 'As soon as I get paid, I’ll buy a new bike.'),
        t('Дія в майбутньому — **dostanę**.', 'Действие в будущем — **dostanę**.', 'A future action — **dostanę**.')),
      build('grammar.future-perfective', 'Zadzwonię do ciebie, gdy tylko wyląduję', t('Я подзвоню тобі, щойно приземлюся', 'Я позвоню тебе, как только приземлюсь', 'I’ll call you as soon as I land'), ['ląduję', 'dzwonię'], ['Gdy tylko wyląduję, zadzwonię do ciebie'],
        t('Обидві дії в майбутньому — доконаний: **zadzwonię**, **wyląduję**.', 'Оба действия в будущем — совершенный: **zadzwonię**, **wyląduję**.', 'Both future — perfective.')),
      match('grammar.future-perfective', [
        ['gdy tylko skończę', t('щойно закінчу', 'как только закончу', 'as soon as I finish')],
        ['dopóki nie wrócisz', t('доки не повернешся', 'пока не вернёшься', 'until you get back')],
        ['zanim wyjdziesz', t('перш ніж вийдеш', 'прежде чем уйдёшь', 'before you leave')],
        ['nie zdążę', t('не встигну', 'не успею', 'I won’t make it')],
      ]),
    ],
  },
};

// ───────────────────────────── tor-3-zamiary: Наміри й мрії (урок B1) ─────────────────────────────
const TOR3: LessonLevels = {
  B2: {
    explanation: t(
      'Наміри й цілі книжною мовою:\n• обмірковую — **noszę się z zamiarem** + родовий віддієслівного іменника: z zamiarem **otwarcia** firmy;\n• мета — **mam na celu** + знахідний (przygotowanie); **dążę do** + родовий: do **awansu**, **do tego, żeby**…;\n• мрія — **spełnić marzenie**; **marzenie się spełniło** (здійснилася);\n• обережно про майбутнє — **o ile mi się uda**, **jeśli wszystko pójdzie zgodnie z planem**.',
      'Намерения и цели книжным языком:\n• обдумываю — **noszę się z zamiarem** + родительный отглагольного существительного: z zamiarem **otwarcia** firmy;\n• цель — **mam na celu** + винительный (przygotowanie); **dążę do** + родительный: do **awansu**, **do tego, żeby**…;\n• мечта — **spełnić marzenie**; **marzenie się spełniło** (сбылась);\n• осторожно о будущем — **o ile mi się uda**, **jeśli wszystko pójdzie zgodnie z planem**.',
      'Intentions and goals in a formal register:\n• contemplating — **noszę się z zamiarem** + genitive verbal noun: z zamiarem **otwarcia** firmy;\n• aims — **mam na celu** + accusative (przygotowanie); **dążę do** + genitive: do **awansu**, **do tego, żeby**…;\n• dreams — **spełnić marzenie**; **marzenie się spełniło** (came true);\n• hedging — **o ile mi się uda**, **jeśli wszystko pójdzie zgodnie z planem**.',
    ),
    examples: [
      { pl: 'Od dawna noszę się z zamiarem otwarcia kawiarni na Starówce.', tr: t('Я давно обмірковую відкриття кав’ярні в Старому місті.', 'Я давно подумываю открыть кафе в Старом городе.', 'I’ve long been thinking of opening a café in the Old Town.') },
      { pl: 'Dążę do tego, żeby w ciągu roku zdać egzamin B2.', tr: t('Я прагну протягом року скласти іспит B2.', 'Я стремлюсь в течение года сдать экзамен B2.', 'My aim is to pass the B2 exam within a year.') },
    ],
    exercises: [
      dialogue('dialogue.plans', EWA, [
        {
          npc: 'Jakie ma pani plany zawodowe na najbliższe lata?',
          tr: t('Які у вас професійні плани на найближчі роки?', 'Какие у вас профессиональные планы на ближайшие годы?', 'What are your career plans for the next few years?'),
          choose: [
            ['Noszę się z zamiarem otwarcia własnej firmy.', t('Я обмірковую відкриття власної фірми.', 'Я подумываю об открытии собственной фирмы.', 'I’m thinking of starting my own business.')],
            ['Noszę się z zamiarem otworzyć własną firmę.', t('(після «z zamiarem» — віддієслівний іменник у родовому: **otwarcia**)', '(после «z zamiarem» — отглагольное существительное в родительном: **otwarcia**)', '(after «z zamiarem» — a genitive verbal noun: **otwarcia**)')],
            ['Noszę z zamiarem otwarcia własnej firmy.', t('(стала фраза — **nosić się z zamiarem**)', '(устойчивая фраза — **nosić się z zamiarem**)', '(set phrase: **nosić się z zamiarem**)')],
          ],
          feedback: t('**Noszę się z zamiarem** + родовий.', '**Noszę się z zamiarem** + родительный.', '**Noszę się z zamiarem** + genitive.'),
        },
        {
          npc: 'A co jest dla pani najważniejsze?',
          tr: t('А що для вас найважливіше?', 'А что для вас самое важное?', 'And what matters most to you?'),
          choose: [
            ['Dążę do tego, żeby pracować na własny rachunek.', t('Я прагну працювати на себе.', 'Я стремлюсь работать на себя.', 'I want to be self-employed.')],
            ['Dążę do to, żeby pracować na własny rachunek.', t('(**do** + родовий: do **tego**)', '(**do** + родительный: do **tego**)', '(**do** + genitive: **tego**)')],
            ['Dążę do tego, że pracować na własny rachunek.', t('(мета — **żeby** + інфінітив)', '(цель — **żeby** + инфинитив)', '(purpose — **żeby** + infinitive)')],
          ],
          feedback: t('**Dążę do tego, żeby** + інфінітив.', '**Dążę do tego, żeby** + инфинитив.', '**Dążę do tego, żeby** + infinitive.'),
        },
      ]),
      fillGap('register.goals', 'Kurs ma na ___ przygotowanie do egzaminu państwowego.', ['celu', 'cel', 'celem', 'cele'],
        t('Курс має на меті підготовку до державного іспиту.', 'Курс имеет целью подготовку к государственному экзамену.', 'The course aims to prepare students for the state exam.'),
        t('Стала фраза — **mieć na celu** (місцевий).', 'Устойчивая фраза — **mieć na celu** (предложный).', 'Set phrase: **mieć na celu**.')),
      fillGap('register.goals', 'Od lat dążę ___ awansu, ale ciągle coś stoi na przeszkodzie.', ['do', 'na', 'za', 'ku'],
        t('Я роками прагну підвищення, але весь час щось заважає.', 'Я годами стремлюсь к повышению, но всё время что-то мешает.', 'I’ve been aiming for promotion for years, but something always gets in the way.'),
        t('**Dążyć do** + родовий: do **awansu**.', '**Dążyć do** + родительный: do **awansu**.', '**Dążyć do** + genitive.')),
      fillGap('register.goals', 'W końcu ___ się moje największe marzenie.', ['spełniło', 'spełnił', 'spełniła', 'spełniły'],
        t('Нарешті здійснилася моя найбільша мрія.', 'Наконец сбылась моя самая большая мечта.', 'At last my biggest dream came true.'),
        t('Marzenie — середній рід: **spełniło się**.', 'Marzenie — средний род: **spełniło się**.', 'Marzenie is neuter: **spełniło**.')),
      reading('reading.goals', 'Wywiad z absolwentką: „Od dziecka marzyłam o pracy w planetarium. Na studiach nosiłam się z zamiarem wyjazdu za granicę, ale ostatecznie zostałam w Toruniu. Teraz dążę do tego, żeby zostać kierowniczką działu edukacji. O ile wszystko pójdzie zgodnie z planem, stanie się to za dwa lata”.',
        t('Чого прагне зараз випускниця?', 'К чему сейчас стремится выпускница?', 'What is the graduate aiming for now?'),
        [t('стати керівницею відділу освіти', 'стать руководителем отдела образования', 'to head the education department'), t('виїхати за кордон', 'уехать за границу', 'to move abroad'), t('вступити до університету', 'поступить в университет', 'to get into university')],
        t('«Teraz **dążę do tego, żeby zostać kierowniczką działu edukacji**». Про виїзд вона лише думала на навчанні.', '«Teraz **dążę do tego, żeby zostać kierowniczką działu edukacji**». Об отъезде она лишь думала во время учёбы.', '“Teraz **dążę do tego, żeby zostać kierowniczką**”; going abroad was only a student plan.')),
      reverseChoice('register.goals', t('Мета курсу — підготувати до співбесіди.', 'Цель курса — подготовить к собеседованию.', 'The course aims to prepare you for a job interview.'),
        ['Kurs ma na celu przygotowanie do rozmowy kwalifikacyjnej.', 'Kurs ma na celu przygotowaniem do rozmowy kwalifikacyjnej.', 'Kurs ma na cel przygotowanie do rozmowy kwalifikacyjnej.'],
        t('**Mieć na celu** + знахідний: **przygotowanie**.', '**Mieć na celu** + винительный: **przygotowanie**.', '**Mieć na celu** + accusative.')),
      findError('register.goals', ['Noszę', 'się', 'z', 'zamiarem', 'zmiany', 'praca'], 5,
        t('Я обмірковую зміну роботи.', 'Я подумываю о смене работы.', 'I’m thinking of changing jobs.'),
        t('Зміна чого — родовий: zmiany **pracy**.', 'Смена чего — родительный: zmiany **pracy**.', 'Genitive: zmiany **pracy**.')),
      build('register.goals', 'Dążę do tego, żeby zdać egzamin B2', t('Я прагну скласти іспит B2', 'Я стремлюсь сдать экзамен B2', 'My aim is to pass the B2 exam'), ['że', 'to'], [],
        t('**Dążyć do tego, żeby** + інфінітив.', '**Dążyć do tego, żeby** + инфинитив.', '**Dążyć do tego, żeby** + infinitive.')),
      match('register.goals', [
        ['nosić się z zamiarem', t('обмірковувати намір', 'подумывать о', 'to be thinking of')],
        ['mieć na celu', t('мати на меті', 'иметь целью', 'to aim at')],
        ['dążyć do', t('прагнути до', 'стремиться к', 'to strive for')],
        ['spełnić marzenie', t('здійснити мрію', 'осуществить мечту', 'to make a dream come true')],
      ]),
    ],
  },
};

// ───────────────────────────── tor-4-kariera: Кар’єра (урок B1) ─────────────────────────────
const TOR4: LessonLevels = {
  B2: {
    explanation: t(
      'Кар’єра офіційною мовою:\n• посада — **awansować na stanowisko** + родовий (kierownika); **objąć stanowisko** (обійняти посаду);\n• звільнення — **złożyć wypowiedzenie**; за згодою сторін — **rozwiązać umowę za porozumieniem stron**;\n• розвиток — **podnosić kwalifikacje**, **przekwalifikować się**;\n• **przejść na** + знахідний: **na emeryturę**, **na swoje** (відкрити власну справу);\n• шанс — **szansa na** + знахідний: szansa **na awans**.',
      'Карьера официальным языком:\n• должность — **awansować na stanowisko** + родительный (kierownika); **objąć stanowisko** (занять должность);\n• увольнение — **złożyć wypowiedzenie**; по согласию сторон — **rozwiązać umowę za porozumieniem stron**;\n• развитие — **podnosić kwalifikacje**, **przekwalifikować się**;\n• **przejść na** + винительный: **na emeryturę**, **na swoje** (открыть своё дело);\n• шанс — **szansa na** + винительный: szansa **na awans**.',
      'Careers in formal language:\n• posts — **awansować na stanowisko** + genitive (kierownika); **objąć stanowisko** (to take up a post);\n• leaving — **złożyć wypowiedzenie**; by mutual consent — **rozwiązać umowę za porozumieniem stron**;\n• development — **podnosić kwalifikacje**, **przekwalifikować się**;\n• **przejść na** + accusative: **na emeryturę**, **na swoje** (to go self-employed);\n• chances — **szansa na** + accusative: szansa **na awans**.',
    ),
    examples: [
      { pl: 'W marcu Kasia awansowała na stanowisko kierowniczki działu.', tr: t('У березні Касю підвищили до керівниці відділу.', 'В марте Касю повысили до руководителя отдела.', 'In March Kasia was promoted to head of department.') },
      { pl: 'Rozwiązaliśmy umowę za porozumieniem stron i przeszedłem na swoje.', tr: t('Ми розірвали договір за згодою сторін, і я відкрив власну справу.', 'Мы расторгли договор по соглашению сторон, и я открыл своё дело.', 'We ended the contract by mutual consent and I went self-employed.') },
    ],
    exercises: [
      dialogue('dialogue.career', EWA, [
        {
          npc: 'Dlaczego chce pan zmienić pracę?',
          tr: t('Чому ви хочете змінити роботу?', 'Почему вы хотите сменить работу?', 'Why do you want to change jobs?'),
          choose: [
            ['Od trzech lat podnoszę kwalifikacje, ale nie mam szans na awans.', t('Уже три роки я підвищую кваліфікацію, але не маю шансів на підвищення.', 'Уже три года я повышаю квалификацию, но у меня нет шансов на повышение.', 'I’ve been upskilling for three years, but I have no chance of promotion.')],
            ['Od trzech lat podnoszę kwalifikacji, ale nie mam szans na awans.', t('(підвищувати що — знахідний: **kwalifikacje**)', '(повышать что — винительный: **kwalifikacje**)', '(accusative: **kwalifikacje**)')],
            ['Od trzech lat podnoszę kwalifikacje, ale nie mam szans do awansu.', t('(**szansa na** + знахідний: na **awans**)', '(**szansa na** + винительный: na **awans**)', '(**szansa na** + accusative)')],
          ],
          feedback: t('**Podnosić kwalifikacje**; **szansa na awans**.', '**Podnosić kwalifikacje**; **szansa na awans**.', '**Podnosić kwalifikacje**; **szansa na awans**.'),
        },
        {
          npc: 'Rozumiem. Jak chce pan rozstać się z obecnym pracodawcą?',
          tr: t('Розумію. Як ви хочете розійтися з теперішнім роботодавцем?', 'Понимаю. Как вы хотите расстаться с нынешним работодателем?', 'I see. How would you like to part with your current employer?'),
          choose: [
            ['Najlepiej rozwiązać umowę za porozumieniem stron.', t('Найкраще розірвати договір за згодою сторін.', 'Лучше всего расторгнуть договор по соглашению сторон.', 'Ideally by ending the contract by mutual consent.')],
            ['Najlepiej rozwiązać umowę z porozumieniem stron.', t('(стала формула — **za porozumieniem stron**)', '(устойчивая формула — **za porozumieniem stron**)', '(set formula: **za porozumieniem stron**)')],
            ['Najlepiej rozwiązać umowę za porozumienie stron.', t('(орудний: za **porozumieniem**)', '(творительный: za **porozumieniem**)', '(instrumental: **porozumieniem**)')],
          ],
          feedback: t('**Za porozumieniem stron**.', '**Za porozumieniem stron**.', '**Za porozumieniem stron**.'),
        },
      ]),
      fillGap('register.career', 'Od stycznia obejmę ___ dyrektora oddziału.', ['stanowisko', 'stanowiska', 'stanowiskiem', 'stanowisku'],
        t('Із січня я обійму посаду директора філії.', 'С января я займу должность директора филиала.', 'From January I’ll take up the post of branch director.'),
        t('**Objąć** + знахідний: **stanowisko**.', '**Objąć** + винительный: **stanowisko**.', '**Objąć** + accusative.')),
      fillGap('register.career', 'Po trzydziestu latach pracy tata przeszedł ___ emeryturę.', ['na', 'w', 'do', 'za'],
        t('Після тридцяти років роботи тато вийшов на пенсію.', 'После тридцати лет работы папа вышел на пенсию.', 'After thirty years of work Dad retired.'),
        t('**Przejść na** + знахідний: na **emeryturę**.', '**Przejść na** + винительный: na **emeryturę**.', '**Przejść na emeryturę**.')),
      fillGap('register.career', 'Marek awansował na stanowisko ___ zmiany.', ['kierownika', 'kierownik', 'kierownikiem', 'kierownikowi'],
        t('Марека підвищили до керівника зміни.', 'Марека повысили до руководителя смены.', 'Marek was promoted to shift manager.'),
        t('Посада кого — родовий: **kierownika**.', 'Должность кого — родительный: **kierownika**.', 'Genitive: **kierownika**.')),
      reading('reading.career', 'Ogłoszenie wewnętrzne: „Informujemy, że z dniem 1 czerwca pani Kasia Nowak obejmie stanowisko kierowniczki działu logistyki. Dotychczasowy kierownik, pan Adam Lis, przechodzi na emeryturę. Pracowników, którzy chcą podnieść kwalifikacje, zapraszamy na szkolenie”.',
        t('Хто обійме посаду керівника відділу?', 'Кто займёт должность руководителя отдела?', 'Who will take over as head of department?'),
        [t('Кася Новак', 'Кася Новак', 'Kasia Nowak'), t('Адам Ліс', 'Адам Лис', 'Adam Lis'), t('новий працівник після навчання', 'новый сотрудник после обучения', 'a new employee after training')],
        t('«pani Kasia Nowak **obejmie stanowisko**»; пан Адам **przechodzi na emeryturę**.', '«pani Kasia Nowak **obejmie stanowisko**»; пан Адам **przechodzi na emeryturę**.', '“Kasia Nowak **obejmie stanowisko**”; Adam is retiring.')),
      reverseChoice('register.career', t('Він подав заяву про звільнення в п’ятницю.', 'Он подал заявление об увольнении в пятницу.', 'He handed in his notice on Friday.'),
        ['Złożył wypowiedzenie w piątek.', 'Złożył wypowiedzeniem w piątek.', 'Złożył się wypowiedzenie w piątek.'],
        t('**Złożyć** + знахідний: **wypowiedzenie**, без «się».', '**Złożyć** + винительный: **wypowiedzenie**, без «się».', '**Złożyć wypowiedzenie**, no «się».')),
      findError('register.career', ['Chcę', 'awansować', 'na', 'stanowisko', 'kierownik'], 4,
        t('Я хочу отримати підвищення до керівника.', 'Я хочу получить повышение до руководителя.', 'I want to be promoted to manager.'),
        t('Посада кого — родовий: **kierownika**.', 'Должность кого — родительный: **kierownika**.', 'Genitive: **kierownika**.')),
      build('register.career', 'Rozwiązaliśmy umowę za porozumieniem stron', t('Ми розірвали договір за згодою сторін', 'Мы расторгли договор по соглашению сторон', 'We ended the contract by mutual consent'), ['porozumienie', 'z'], [],
        t('Стала формула — **za porozumieniem stron**.', 'Устойчивая формула — **za porozumieniem stron**.', 'Set formula.')),
      match('register.career', [
        ['objąć stanowisko', t('обійняти посаду', 'занять должность', 'to take up a post')],
        ['złożyć wypowiedzenie', t('подати заяву про звільнення', 'подать заявление об увольнении', 'to hand in one’s notice')],
        ['przejść na swoje', t('відкрити власну справу', 'открыть своё дело', 'to go self-employed')],
        ['podnosić kwalifikacje', t('підвищувати кваліфікацію', 'повышать квалификацию', 'to upskill')],
      ]),
    ],
  },
};

// ───────────────────────────── tor-5-wakacje: Відпустка й заощадження (урок B1) ─────────────────────────────
const TOR5: LessonLevels = {
  B2: {
    explanation: t(
      'Бюджет і гроші:\n• відкладати — **odkładać na** + знахідний: odkładamy **na wakacje**;\n• бюджет — **zmieścić się w budżecie** (вкластися), **przekroczyć budżet o** + знахідний (o 300 zł);\n• вигідність — **opłaca się** + інфінітив; **w przeliczeniu na osobę** — у розрахунку на особу;\n• кредит — **wziąć kredyt / pożyczkę**, spłacać **w ratach** (частинами); **nie stać nas na** + знахідний — ми не можемо собі дозволити.',
      'Бюджет и деньги:\n• откладывать — **odkładać na** + винительный: odkładamy **na wakacje**;\n• бюджет — **zmieścić się w budżecie** (уложиться), **przekroczyć budżet o** + винительный (o 300 zł);\n• выгода — **opłaca się** + инфинитив; **w przeliczeniu na osobę** — в пересчёте на человека;\n• кредит — **wziąć kredyt / pożyczkę**, выплачивать **w ratach** (в рассрочку); **nie stać nas na** + винительный — мы не можем себе позволить.',
      'Budgets and money:\n• saving — **odkładać na** + accusative: odkładamy **na wakacje**;\n• budgets — **zmieścić się w budżecie** (to stay within budget), **przekroczyć budżet o** + accusative (o 300 zł);\n• value — **opłaca się** + infinitive (it pays to); **w przeliczeniu na osobę** — per person;\n• loans — **wziąć kredyt / pożyczkę**, repay **w ratach** (in instalments); **nie stać nas na** + accusative — we can’t afford.',
    ),
    examples: [
      { pl: 'Przekroczyliśmy budżet o trzysta złotych, ale wakacje były tego warte.', tr: t('Ми перевищили бюджет на триста злотих, але відпустка була того варта.', 'Мы превысили бюджет на триста злотых, но отпуск того стоил.', 'We went three hundred złoty over budget, but the holiday was worth it.') },
      { pl: 'Opłaca się kupić bilety wcześniej — w przeliczeniu na osobę wychodzi o połowę taniej.', tr: t('Вигідно купити квитки раніше — у розрахунку на особу виходить удвічі дешевше.', 'Выгодно купить билеты заранее — в пересчёте на человека выходит вдвое дешевле.', 'It pays to book early — per person it works out half the price.') },
    ],
    exercises: [
      dialogue('dialogue.budget', TOMEK, [
        {
          npc: 'Jedziemy w sierpniu do Chorwacji? Ile to będzie kosztować?',
          tr: t('Їдемо в серпні до Хорватії? Скільки це коштуватиме?', 'Едем в августе в Хорватию? Сколько это будет стоить?', 'Are we going to Croatia in August? How much will it cost?'),
          choose: [
            ['Jeśli polecimy tanimi liniami, zmieścimy się w budżecie.', t('Якщо полетимо лоукостом, вкладемося в бюджет.', 'Если полетим лоукостером, уложимся в бюджет.', 'If we fly budget, we’ll stay within budget.')],
            ['Jeśli polecimy tanimi liniami, zmieścimy w budżecie.', t('(вкластися — **zmieścić się**)', '(уложиться — **zmieścić się**)', '(**zmieścić się** needs «się»)')],
            ['Jeśli polecimy tanimi liniami, zmieścimy się do budżetu.', t('(де — **w budżecie**)', '(где — **w budżecie**)', '(**w budżecie**)')],
          ],
          feedback: t('**Zmieścić się w budżecie**.', '**Zmieścić się w budżecie**.', '**Zmieścić się w budżecie**.'),
        },
        {
          npc: 'A nocleg? Hotel czy apartament?',
          tr: t('А нічліг? Готель чи апартаменти?', 'А ночлег? Гостиница или апартаменты?', 'And where do we stay? Hotel or apartment?'),
          choose: [
            ['Opłaca się wynająć apartament — w przeliczeniu na osobę wyjdzie taniej.', t('Вигідніше винайняти апартаменти — у розрахунку на особу вийде дешевше.', 'Выгоднее снять апартаменты — в пересчёте на человека выйдет дешевле.', 'An apartment makes sense — per person it’ll be cheaper.')],
            ['Opłaca się wynająć apartament — w przeliczeniu za osobę wyjdzie taniej.', t('(стала формула — **na osobę**)', '(устойчивая формула — **na osobę**)', '(set phrase: **na osobę**)')],
            ['Opłaca się wynająć apartamentu — w przeliczeniu na osobę wyjdzie taniej.', t('(винайняти що — знахідний: **apartament**)', '(снять что — винительный: **apartament**)', '(accusative: **apartament**)')],
          ],
          feedback: t('**Opłaca się** + інфінітив; **w przeliczeniu na osobę**.', '**Opłaca się** + инфинитив; **w przeliczeniu na osobę**.', '**Opłaca się**; **w przeliczeniu na osobę**.'),
        },
      ]),
      fillGap('register.money', 'Co miesiąc odkładamy pięćset złotych ___ wakacje.', ['na', 'do', 'za', 'dla'],
        t('Щомісяця ми відкладаємо п’ятсот злотих на відпустку.', 'Каждый месяц мы откладываем пятьсот злотых на отпуск.', 'We put aside five hundred złoty a month for our holiday.'),
        t('**Odkładać na** + знахідний.', '**Odkładać na** + винительный.', '**Odkładać na** + accusative.')),
      fillGap('register.money', 'Przekroczyliśmy budżet ___ dwieście złotych.', ['o', 'na', 'w', 'przez'],
        t('Ми перевищили бюджет на двісті злотих.', 'Мы превысили бюджет на двести злотых.', 'We went two hundred złoty over budget.'),
        t('На скільки — **o** + знахідний.', 'На сколько — **o** + винительный.', 'By how much — **o** + accusative.')),
      fillGap('register.money', 'Nie ___ się brać kredytu na wakacje.', ['opłaca', 'opłacam', 'opłacić', 'opłata'],
        t('Не варто брати кредит на відпустку.', 'Не стоит брать кредит на отпуск.', 'It doesn’t pay to take out a loan for a holiday.'),
        t('Безособово — **(nie) opłaca się** + інфінітив.', 'Безлично — **(nie) opłaca się** + инфинитив.', 'Impersonal **(nie) opłaca się**.')),
      reading('reading.money', 'Porównanie ofert: „Wycieczka z biurem podróży: 4200 zł za dwie osoby, w cenie lot i hotel. Wyjazd na własną rękę: lot 1100 zł, apartament 1900 zł, wynajem auta 800 zł. W przeliczeniu na osobę wyjazd na własną rękę wychodzi taniej o 200 zł, ale wszystko trzeba zorganizować samemu”.',
        t('На скільки дешевша самостійна поїздка в розрахунку на особу?', 'На сколько дешевле самостоятельная поездка в пересчёте на человека?', 'How much cheaper per person is the do-it-yourself trip?'),
        [t('на 200 злотих', 'на 200 злотых', 'by 200 złoty'), t('на 400 злотих', 'на 400 злотых', 'by 400 złoty'), t('вона не дешевша, а дорожча', 'она не дешевле, а дороже', 'it isn’t cheaper, it’s dearer')],
        t('«**W przeliczeniu na osobę**… taniej o 200 zł». 400 злотих — різниця на двох.', '«**W przeliczeniu na osobę**… taniej o 200 zł». 400 злотых — разница на двоих.', '“**W przeliczeniu na osobę**… o 200 zł”; 400 is the total for two.')),
      reverseChoice('register.money', t('Ми вклалися в бюджет.', 'Мы уложились в бюджет.', 'We stayed within budget.'),
        ['Zmieściliśmy się w budżecie.', 'Zmieściliśmy w budżecie.', 'Zmieściliśmy się w budżet.'],
        t('**Zmieścić się w** + місцевий: **w budżecie**.', '**Zmieścić się w** + предложный: **w budżecie**.', '**Zmieścić się w** + locative.')),
      findError('register.money', ['Spłacamy', 'kredyt', 'mieszkaniowy', 'w', 'ratami'], 4,
        t('Ми виплачуємо іпотеку частинами.', 'Мы выплачиваем ипотеку в рассрочку.', 'We’re paying off the mortgage in instalments.'),
        t('**W** + місцевий: w **ratach**.', '**W** + предложный: w **ratach**.', '**W** + locative: **ratach**.')),
      build('register.money', 'Opłaca się kupić bilety z wyprzedzeniem', t('Вигідно купити квитки заздалегідь', 'Выгодно купить билеты заранее', 'It pays to buy tickets in advance'), ['opłata', 'biletów'], [],
        t('**Opłaca się** + інфінітив; купити що — знахідний: **bilety**.', '**Opłaca się** + инфинитив; купить что — винительный: **bilety**.', '**Opłaca się** + infinitive; accusative **bilety**.')),
      match('register.money', [
        ['zmieścić się w budżecie', t('вкластися в бюджет', 'уложиться в бюджет', 'to stay within budget')],
        ['opłaca się', t('вигідно', 'выгодно', 'it pays')],
        ['w przeliczeniu na osobę', t('у розрахунку на особу', 'в пересчёте на человека', 'per person')],
        ['rata', t('внесок (частина платежу)', 'взнос (часть платежа)', 'instalment')],
      ]),
    ],
  },
};

// ───────────────────────────── tor-6-jezeli: Якщо… (урок B1) ─────────────────────────────
const TOR6: LessonLevels = {
  B2: {
    explanation: t(
      'Умова й імовірність:\n• реальна умова — **jeśli** + майбутній: jeśli **będzie** padać, zostaniemy; нереальна — **gdyby** + форма на -ł: gdyby **padało**, zostalibyśmy;\n• імовірність — **najprawdopodobniej**, **niewykluczone, że…** (не виключено, що);\n• сумнів — **wątpię, żeby** + форма на -ł: wątpię, żeby **zdążył**; **mało prawdopodobne, żeby**…;\n• надія — **mam nadzieję, że** + майбутній (не «żeby»).',
      'Условие и вероятность:\n• реальное условие — **jeśli** + будущее: jeśli **będzie** padać, zostaniemy; нереальное — **gdyby** + форма на -ł: gdyby **padało**, zostalibyśmy;\n• вероятность — **najprawdopodobniej**, **niewykluczone, że…** (не исключено, что);\n• сомнение — **wątpię, żeby** + форма на -ł: wątpię, żeby **zdążył**; **mało prawdopodobne, żeby**…;\n• надежда — **mam nadzieję, że** + будущее (не «żeby»).',
      'Conditions and probability:\n• a real condition — **jeśli** + future: jeśli **będzie** padać, zostaniemy; unreal — **gdyby** + the -ł form: gdyby **padało**, zostalibyśmy;\n• probability — **najprawdopodobniej**, **niewykluczone, że…** (it may well be that);\n• doubt — **wątpię, żeby** + the -ł form: wątpię, żeby **zdążył**; **mało prawdopodobne, żeby**…;\n• hope — **mam nadzieję, że** + future (not «żeby»).',
    ),
    examples: [
      { pl: 'Niewykluczone, że jutro pociągi do Bydgoszczy będą opóźnione.', tr: t('Не виключено, що завтра потяги до Бидгоща запізнюватимуться.', 'Не исключено, что завтра поезда в Быдгощ будут опаздывать.', 'Trains to Bydgoszcz may well be delayed tomorrow.') },
      { pl: 'Wątpię, żeby Tomek zdążył na koncert.', tr: t('Сумніваюся, що Томек встигне на концерт.', 'Сомневаюсь, что Томек успеет на концерт.', 'I doubt Tomek will make it to the concert.') },
    ],
    exercises: [
      dialogue('dialogue.conditions', TOMEK, [
        {
          npc: 'Myślisz, że szef zgodzi się na urlop w lipcu?',
          tr: t('Думаєш, начальник погодиться на відпустку в липні?', 'Думаешь, начальник согласится на отпуск в июле?', 'Do you think the boss will agree to leave in July?'),
          choose: [
            ['Wątpię, żeby się zgodził — w lipcu jest najwięcej pracy.', t('Сумніваюся, що погодиться — у липні найбільше роботи.', 'Сомневаюсь, что согласится — в июле больше всего работы.', 'I doubt he’ll agree — July is the busiest month.')],
            ['Wątpię, żeby się zgodzi — w lipcu jest najwięcej pracy.', t('(після **żeby** — форма на -ł: **zgodził**)', '(после **żeby** — форма на -ł: **zgodził**)', '(after **żeby** — the -ł form)')],
            ['Wątpię, żeby się zgodził — w lipcu jest najwięcej pracą.', t('(після «najwięcej» — родовий: **pracy**)', '(после «najwięcej» — родительный: **pracy**)', '(genitive after «najwięcej»)')],
          ],
          feedback: t('**Wątpię, żeby** + форма на -ł.', '**Wątpię, żeby** + форма на -ł.', '**Wątpię, żeby** + -ł form.'),
        },
        {
          npc: 'A jeśli poprosisz o sierpień?',
          tr: t('А якщо попросиш серпень?', 'А если попросишь август?', 'And if you ask for August?'),
          choose: [
            ['Niewykluczone, że wtedy się zgodzi.', t('Не виключено, що тоді погодиться.', 'Не исключено, что тогда согласится.', 'He may well agree then.')],
            ['Niewykluczone, żeby wtedy się zgodzi.', t('(після «niewykluczone» — **że** + майбутній)', '(после «niewykluczone» — **że** + будущее)', '(**niewykluczone, że** + future)')],
            ['Niewykluczono, że wtedy się zgodzi.', t('(вираз — **niewykluczone, że**)', '(выражение — **niewykluczone, że**)', '(the phrase is **niewykluczone**)')],
          ],
          feedback: t('**Niewykluczone, że** + майбутній.', '**Niewykluczone, że** + будущее.', '**Niewykluczone, że** + future.'),
        },
      ]),
      fillGap('grammar.conditions', 'Gdyby pociąg ___ na czas, zdążylibyśmy na koncert.', ['przyjechał', 'przyjedzie', 'przyjeżdża', 'przyjechałby'],
        t('Якби потяг приїхав вчасно, ми встигли б на концерт.', 'Если бы поезд пришёл вовремя, мы успели бы на концерт.', 'If the train had been on time, we’d have made the concert.'),
        t('Після **gdyby** — форма на -ł без «by»: **przyjechał**.', 'После **gdyby** — форма на -ł без «by»: **przyjechał**.', 'After **gdyby** — the -ł form, no extra «by».')),
      fillGap('grammar.conditions', 'Mało prawdopodobne, ___ sklep był otwarty w niedzielę.', ['żeby', 'że', 'jeśli', 'czy'],
        t('Малоймовірно, щоб магазин був відкритий у неділю.', 'Маловероятно, чтобы магазин был открыт в воскресенье.', 'It’s unlikely the shop will be open on Sunday.'),
        t('Сумнів + форма на -ł (był) — **żeby**.', 'Сомнение + форма на -ł (był) — **żeby**.', 'Doubt + -ł form — **żeby**.')),
      fillGap('grammar.conditions', 'Mam nadzieję, że jutro nie ___ padać.', ['będzie', 'byłoby', 'było', 'będą'],
        t('Сподіваюся, що завтра не йтиме дощ.', 'Надеюсь, что завтра не будет дождя.', 'I hope it won’t rain tomorrow.'),
        t('**Mam nadzieję, że** + майбутній: **będzie**.', '**Mam nadzieję, że** + будущее: **będzie**.', '**Mam nadzieję, że** + future.')),
      reading('reading.conditions', 'Prognoza: „Jutro w Toruniu najprawdopodobniej będzie słonecznie, ale niewykluczone, że po południu przejdą burze. Jeśli planujecie rejs po Wiśle, wybierzcie godziny poranne. Wątpię, żeby wieczorem dało się bezpiecznie pływać”.',
        t('Коли краще планувати прогулянку Віслою?', 'Когда лучше планировать прогулку по Висле?', 'When is it best to plan a trip on the Vistula?'),
        [t('зранку', 'утром', 'in the morning'), t('по обіді', 'после обеда', 'in the afternoon'), t('увечері', 'вечером', 'in the evening')],
        t('«Jeśli planujecie rejs po Wiśle, **wybierzcie godziny poranne**».', '«Jeśli planujecie rejs po Wiśle, **wybierzcie godziny poranne**».', '“**wybierzcie godziny poranne**”.')),
      reverseChoice('grammar.conditions', t('Якби в мене був час, я поїхав би з вами.', 'Если бы у меня было время, я поехал бы с вами.', 'If I had time, I’d come with you.'),
        ['Gdybym miał czas, pojechałbym z wami.', 'Gdybym mam czas, pojechałbym z wami.', 'Gdybym miał czas, pojadę z wami.'],
        t('Нереальна умова — обидві частини умовні: **gdybym miał… pojechałbym**.', 'Нереальное условие — обе части условные: **gdybym miał… pojechałbym**.', 'Unreal condition — both clauses conditional.')),
      findError('grammar.conditions', ['Wątpię,', 'żeby', 'on', 'zdąży', 'na', 'pociąg'], 3,
        t('Сумніваюся, що він встигне на потяг.', 'Сомневаюсь, что он успеет на поезд.', 'I doubt he’ll catch the train.'),
        t('Після **żeby** — форма на -ł: **zdążył**.', 'После **żeby** — форма на -ł: **zdążył**.', 'After **żeby** — **zdążył**.')),
      build('grammar.conditions', 'Niewykluczone, że jutro spadnie śnieg', t('Не виключено, що завтра випаде сніг', 'Не исключено, что завтра выпадет снег', 'It may well snow tomorrow'), ['żeby', 'spadł'], [],
        t('**Niewykluczone, że** + майбутній: **spadnie**.', '**Niewykluczone, że** + будущее: **spadnie**.', '**Niewykluczone, że** + future.')),
      match('grammar.conditions', [
        ['niewykluczone, że', t('не виключено, що', 'не исключено, что', 'it may well be that')],
        ['najprawdopodobniej', t('найімовірніше', 'скорее всего', 'most likely')],
        ['wątpię, żeby', t('сумніваюся, що', 'сомневаюсь, что', 'I doubt that')],
        ['mało prawdopodobne', t('малоймовірно', 'маловероятно', 'unlikely')],
      ]),
    ],
  },
};

// ───────────────────────────── tor-7-obietnice: Обіцянки й поради (урок B1) ─────────────────────────────
const TOR7: LessonLevels = {
  B2: {
    explanation: t(
      'Зобов’язання й делікатні поради:\n• **zobowiązuję się do** + родовий: do **dotrzymania** terminu, do **zachowania** poufności;\n• **dotrzymać** + родовий (без прийменника): dotrzymać **słowa**, **terminu**, **obietnicy**;\n• **ręczę za** + знахідний — ручаюся за: ręczę **za niego**;\n• м’яка порада — **radziłbym ci** + інфінітив; **na twoim miejscu** + умовний: na twoim miejscu **zadzwoniłbym**;\n• **warto by było** + інфінітив — варто було б.',
      'Обязательства и деликатные советы:\n• **zobowiązuję się do** + родительный: do **dotrzymania** terminu, do **zachowania** poufności;\n• **dotrzymać** + родительный (без предлога): dotrzymać **słowa**, **terminu**, **obietnicy**;\n• **ręczę za** + винительный — ручаюсь за: ręczę **za niego**;\n• мягкий совет — **radziłbym ci** + инфинитив; **na twoim miejscu** + условное: na twoim miejscu **zadzwoniłbym**;\n• **warto by było** + инфинитив — стоило бы.',
      'Commitments and tactful advice:\n• **zobowiązuję się do** + genitive: do **dotrzymania** terminu, do **zachowania** poufności;\n• **dotrzymać** + genitive (no preposition): dotrzymać **słowa**, **terminu**, **obietnicy**;\n• **ręczę za** + accusative — I vouch for: ręczę **za niego**;\n• gentle advice — **radziłbym ci** + infinitive; **na twoim miejscu** + conditional: na twoim miejscu **zadzwoniłbym**;\n• **warto by było** + infinitive — it would be worth.',
    ),
    examples: [
      { pl: 'Zobowiązuję się do dotrzymania terminu.', tr: t('Я зобов’язуюся дотриматися терміну.', 'Обязуюсь соблюсти срок.', 'I undertake to meet the deadline.') },
      { pl: 'Na twoim miejscu porozmawiałbym najpierw z szefem.', tr: t('На твоєму місці я спершу поговорив би з начальником.', 'На твоём месте я сначала поговорил бы с начальником.', 'If I were you, I’d talk to the boss first.') },
    ],
    exercises: [
      dialogue('dialogue.promises', ADAM, [
        {
          npc: 'Czy zdąży pan z projektem do końca miesiąca?',
          tr: t('Чи встигнете ви з проєктом до кінця місяця?', 'Успеете ли вы с проектом до конца месяца?', 'Will you finish the project by the end of the month?'),
          choose: [
            ['Tak, zobowiązuję się do dotrzymania terminu.', t('Так, я зобов’язуюся дотриматися терміну.', 'Да, обязуюсь соблюсти срок.', 'Yes, I undertake to meet the deadline.')],
            ['Tak, zobowiązuję się dotrzymać do terminu.', t('(**dotrzymać** + родовий без прийменника: dotrzymać **terminu**)', '(**dotrzymać** + родительный без предлога: dotrzymać **terminu**)', '(**dotrzymać terminu** — no preposition)')],
            ['Tak, zobowiązuję się do dotrzymania termin.', t('(чого — родовий: **terminu**)', '(чего — родительный: **terminu**)', '(genitive: **terminu**)')],
          ],
          feedback: t('**Zobowiązuję się do dotrzymania terminu**.', '**Zobowiązuję się do dotrzymania terminu**.', '**Zobowiązuję się do dotrzymania terminu**.'),
        },
        {
          npc: 'A czy nowy stażysta da sobie radę?',
          tr: t('А новий стажист упорається?', 'А новый стажёр справится?', 'And will the new intern cope?'),
          choose: [
            ['Ręczę za niego — pracowaliśmy razem w Bydgoszczy.', t('Ручаюся за нього — ми працювали разом у Бидгощі.', 'Ручаюсь за него — мы работали вместе в Быдгоще.', 'I vouch for him — we worked together in Bydgoszcz.')],
            ['Ręczę za nim — pracowaliśmy razem w Bydgoszczy.', t('(**ręczyć za** + знахідний: za **niego**)', '(**ręczyć za** + винительный: za **niego**)', '(**ręczyć za** + accusative: **niego**)')],
            ['Ręczę o niego — pracowaliśmy razem w Bydgoszczy.', t('(ручатися — **ręczyć za**)', '(ручаться — **ręczyć za**)', '(**ręczyć za**)')],
          ],
          feedback: t('**Ręczę za niego**.', '**Ręczę za niego**.', '**Ręczę za niego**.'),
        },
      ]),
      fillGap('register.promises', 'Na twoim miejscu ___ do lekarza jeszcze dziś.', ['poszedłbym', 'pójdę', 'poszedłem', 'idę'],
        t('На твоєму місці я пішов би до лікаря ще сьогодні.', 'На твоём месте я пошёл бы к врачу ещё сегодня.', 'If I were you, I’d see a doctor today.'),
        t('**Na twoim miejscu** + умовний: **poszedłbym**.', '**Na twoim miejscu** + условное: **poszedłbym**.', '**Na twoim miejscu** + conditional.')),
      fillGap('register.promises', 'Zawsze ___ słowa, więc możesz mi zaufać.', ['dotrzymuję', 'dotrzymuję się', 'dotrzymam się', 'dotrzymywać'],
        t('Я завжди дотримую слова, тож можеш мені довіряти.', 'Я всегда держу слово, так что можешь мне доверять.', 'I always keep my word, so you can trust me.'),
        t('**Dotrzymywać** + родовий, без «się»: **dotrzymuję** słowa.', '**Dotrzymywać** + родительный, без «się»: **dotrzymuję** słowa.', '**Dotrzymywać słowa**, no «się».')),
      fillGap('register.promises', 'Warto ___ było zarezerwować stolik wcześniej.', ['by', 'żeby', 'aby', 'było'],
        t('Варто було б забронювати столик раніше.', 'Стоило бы забронировать столик заранее.', 'It would be worth booking a table earlier.'),
        t('Стала форма — **warto by było** + інфінітив.', 'Устойчивая форма — **warto by było** + инфинитив.', 'Set form: **warto by było**.')),
      reading('reading.promises', 'Wiadomość od szefa: „Pani Kasiu, ręczę za nowego stażystę — znam go z poprzedniej firmy. Radziłbym jednak, żeby przez pierwszy tydzień pracowała Pani z nim w parze. Na Pani miejscu nie dawałbym mu jeszcze kontaktu z klientami”.',
        t('Що начальник радить Касі?', 'Что начальник советует Касе?', 'What does the boss advise Kasia?'),
        [t('перший тиждень працювати разом зі стажистом', 'первую неделю работать вместе со стажёром', 'to work alongside the intern for the first week'), t('одразу дати йому клієнтів', 'сразу дать ему клиентов', 'to give him clients straight away'), t('перевірити його попередню фірму', 'проверить его прежнюю фирму', 'to check his previous company')],
        t('«Radziłbym… **żeby przez pierwszy tydzień pracowała Pani z nim w parze**».', '«Radziłbym… **żeby przez pierwszy tydzień pracowała Pani z nim w parze**».', '“**żeby przez pierwszy tydzień pracowała Pani z nim w parze**”.')),
      reverseChoice('register.promises', t('На твоєму місці я б почекав.', 'На твоём месте я бы подождал.', 'If I were you, I’d wait.'),
        ['Na twoim miejscu poczekałbym.', 'W twoim miejscu poczekałbym.', 'Na twoim miejscu poczekam.'],
        t('Стала формула — **na twoim miejscu** + умовний: **poczekałbym**.', 'Устойчивая формула — **na twoim miejscu** + условное: **poczekałbym**.', '**Na twoim miejscu** + conditional.')),
      findError('register.promises', ['Nie', 'dotrzymał', 'obietnica', 'i', 'teraz', 'ma', 'kłopoty'], 2,
        t('Він не дотримав обіцянки, і тепер має проблеми.', 'Он не сдержал обещание, и теперь у него проблемы.', 'He broke his promise and now he’s in trouble.'),
        t('**Dotrzymać** + родовий: **obietnicy**.', '**Dotrzymać** + родительный: **obietnicy**.', '**Dotrzymać** + genitive.')),
      build('register.promises', 'Radziłbym ci porozmawiać najpierw z szefem', t('Я радив би тобі спершу поговорити з начальником', 'Я бы посоветовал тебе сначала поговорить с начальником', 'I’d advise you to talk to the boss first'), ['radził', 'szefa'], ['Radziłbym ci najpierw porozmawiać z szefem'],
        t('М’яка порада — **radziłbym ci** + інфінітив; **z** + орудний: z **szefem**.', 'Мягкий совет — **radziłbym ci** + инфинитив; **z** + творительный: z **szefem**.', 'Gentle advice — **radziłbym ci** + infinitive.')),
      match('register.promises', [
        ['ręczyć za', t('ручатися за', 'ручаться за', 'to vouch for')],
        ['dotrzymać terminu', t('дотриматися терміну', 'соблюсти срок', 'to meet a deadline')],
        ['zobowiązać się', t('зобов’язатися', 'обязаться', 'to undertake')],
        ['na twoim miejscu', t('на твоєму місці', 'на твоём месте', 'if I were you')],
      ]),
    ],
  },
};

// ───────────────────────────── tor-8-kopernik: Торунь Коперника (урок B1) ─────────────────────────────
const TOR8: LessonLevels = {
  B2: {
    explanation: t(
      'Науково-популярна мова про Коперника:\n• життєпис — **urodził się w Toruniu w 1473 roku**; **jest uważany za** + знахідний: za **twórcę** teorii heliocentrycznej;\n• внесок — **przyczynić się do** + родовий; **obalić pogląd, że…** — спростувати думку;\n• пасив — dzieło **zostało wydane** w 1543 roku;\n• **wbrew** + давальний: **wbrew powszechnemu przekonaniu** — всупереч поширеній думці;\n• **zajmować się** + орудний: astronomią, ekonomią, medycyną.',
      'Научно-популярный язык о Копернике:\n• биография — **urodził się w Toruniu w 1473 roku**; **jest uważany za** + винительный: za **twórcę** teorii heliocentrycznej;\n• вклад — **przyczynić się do** + родительный; **obalić pogląd, że…** — опровергнуть взгляд;\n• пассив — dzieło **zostało wydane** w 1543 roku;\n• **wbrew** + дательный: **wbrew powszechnemu przekonaniu** — вопреки распространённому мнению;\n• **zajmować się** + творительный: astronomią, ekonomią, medycyną.',
      'Popular-science language about Copernicus:\n• biography — **urodził się w Toruniu w 1473 roku**; **jest uważany za** + accusative: za **twórcę** teorii heliocentrycznej;\n• contribution — **przyczynić się do** + genitive; **obalić pogląd, że…** — to overturn the view;\n• passive — dzieło **zostało wydane** w 1543 roku;\n• **wbrew** + dative: **wbrew powszechnemu przekonaniu** — contrary to popular belief;\n• **zajmować się** + instrumental: astronomią, ekonomią, medycyną.',
    ),
    examples: [
      { pl: 'Kopernik jest uważany za twórcę teorii heliocentrycznej.', tr: t('Коперника вважають творцем геліоцентричної теорії.', 'Коперника считают создателем гелиоцентрической теории.', 'Copernicus is regarded as the author of the heliocentric theory.') },
      { pl: 'Wbrew powszechnemu przekonaniu Kopernik zajmował się nie tylko astronomią, lecz także ekonomią.', tr: t('Всупереч поширеній думці Коперник займався не лише астрономією, а й економікою.', 'Вопреки распространённому мнению Коперник занимался не только астрономией, но и экономикой.', 'Contrary to popular belief, Copernicus studied not only astronomy but also economics.') },
    ],
    exercises: [
      dialogue('dialogue.tour', MAREK, [
        {
          npc: 'Co pan wie o Koperniku?',
          tr: t('Що ви знаєте про Коперника?', 'Что вы знаете о Копернике?', 'What do you know about Copernicus?'),
          choose: [
            ['Że urodził się w Toruniu i jest uważany za twórcę teorii heliocentrycznej.', t('Що він народився в Торуні й вважається творцем геліоцентричної теорії.', 'Что он родился в Торуни и считается создателем гелиоцентрической теории.', 'That he was born in Toruń and is seen as the author of heliocentric theory.')],
            ['Że urodził się w Toruniu i jest uważany za twórca teorii heliocentrycznej.', t('(**uważany za** + знахідний: za **twórcę**)', '(**uważany za** + винительный: za **twórcę**)', '(**uważany za** + accusative: **twórcę**)')],
            ['Że urodził się w Toruniu i jest uważany jak twórcę teorii heliocentrycznej.', t('(вважатися кимось — **uważany za**, а не «jak»)', '(считаться кем-то — **uważany za**, а не «jak»)', '(**uważany za**, not «jak»)')],
          ],
          feedback: t('**Uważany za twórcę**.', '**Uważany za twórcę**.', '**Uważany za twórcę**.'),
        },
        {
          npc: 'Świetnie. A czym jeszcze się zajmował?',
          tr: t('Чудово. А чим іще він займався?', 'Отлично. А чем ещё он занимался?', 'Excellent. And what else did he work on?'),
          choose: [
            ['Wbrew powszechnemu przekonaniu także ekonomią i medycyną.', t('Всупереч поширеній думці — також економікою й медициною.', 'Вопреки распространённому мнению — также экономикой и медициной.', 'Contrary to popular belief, economics and medicine too.')],
            ['Wbrew powszechnemu przekonaniu także ekonomia i medycyna.', t('(**zajmować się** + орудний: **ekonomią i medycyną**)', '(**zajmować się** + творительный: **ekonomią i medycyną**)', '(**zajmować się** + instrumental)')],
            ['Wbrew powszechnego przekonania także ekonomią i medycyną.', t('(**wbrew** + давальний: **powszechnemu przekonaniu**)', '(**wbrew** + дательный: **powszechnemu przekonaniu**)', '(**wbrew** + dative)')],
          ],
          feedback: t('**Wbrew** + давальний; **zajmować się** + орудний.', '**Wbrew** + дательный; **zajmować się** + творительный.', '**Wbrew** + dative; **zajmować się** + instrumental.'),
        },
      ]),
      fillGap('register.science', 'Dzieło „O obrotach sfer niebieskich” zostało ___ w 1543 roku.', ['wydane', 'wydany', 'wydana', 'wydał'],
        t('Працю «Про обертання небесних сфер» видали 1543 року.', 'Труд «О вращении небесных сфер» был издан в 1543 году.', '“On the Revolutions of the Heavenly Spheres” was published in 1543.'),
        t('Dzieło — середній рід: **zostało wydane**.', 'Dzieło — средний род: **zostało wydane**.', 'Dzieło is neuter: **wydane**.')),
      fillGap('register.science', 'Kopernik przyczynił się do ___ poglądów na budowę wszechświata.', ['zmiany', 'zmianę', 'zmianą', 'zmianie'],
        t('Коперник спричинився до зміни поглядів на будову всесвіту.', 'Коперник способствовал изменению взглядов на строение вселенной.', 'Copernicus helped change our view of the universe.'),
        t('**Przyczynić się do** + родовий: do **zmiany**.', '**Przyczynić się do** + родительный: do **zmiany**.', '**Przyczynić się do** + genitive.')),
      fillGap('register.science', 'Kopernik obalił ___, że Ziemia jest środkiem wszechświata.', ['pogląd', 'poglądu', 'poglądem', 'poglądzie'],
        t('Коперник спростував думку, що Земля — центр всесвіту.', 'Коперник опроверг мнение, что Земля — центр вселенной.', 'Copernicus overturned the view that the Earth is the centre of the universe.'),
        t('**Obalić** + знахідний: **pogląd**.', '**Obalić** + винительный: **pogląd**.', '**Obalić** + accusative.')),
      reading('reading.science', 'Z przewodnika po Toruniu: „W domu przy ulicy Kopernika, gdzie według tradycji urodził się astronom, mieści się dziś muzeum. Wbrew powszechnemu przekonaniu Kopernik większość życia spędził nie w Toruniu, lecz na Warmii. Tam powstało jego najważniejsze dzieło, wydane w 1543 roku w Norymberdze”.',
        t('Де Коперник провів більшу частину життя?', 'Где Коперник провёл большую часть жизни?', 'Where did Copernicus spend most of his life?'),
        [t('на Вармії', 'на Вармии', 'in Warmia'), t('у Торуні', 'в Торуни', 'in Toruń'), t('у Нюрнберзі', 'в Нюрнберге', 'in Nuremberg')],
        t('«większość życia spędził **nie w Toruniu, lecz na Warmii**»; у Нюрнберзі книжку лише видали.', '«większość życia spędził **nie w Toruniu, lecz na Warmii**»; в Нюрнберге книгу только издали.', '“**nie w Toruniu, lecz na Warmii**”; Nuremberg is only where it was printed.')),
      reverseChoice('register.science', t('Торунь славиться пряниками.', 'Торунь славится пряниками.', 'Toruń is famous for gingerbread.'),
        ['Toruń słynie z pierników.', 'Toruń słynie pierników.', 'Toruń słynie z piernikami.'],
        t('**Słynąć z** + родовий: z **pierników**.', '**Słynąć z** + родительный: z **pierników**.', '**Słynąć z** + genitive.')),
      findError('register.science', ['Kopernik', 'zajmował', 'się', 'także', 'medycyna'], 4,
        t('Коперник займався також медициною.', 'Коперник занимался также медициной.', 'Copernicus also practised medicine.'),
        t('**Zajmować się** + орудний: **medycyną**.', '**Zajmować się** + творительный: **medycyną**.', '**Zajmować się** + instrumental.')),
      build('register.science', 'Kopernik jest uważany za wielkiego astronoma', t('Коперника вважають великим астрономом', 'Коперника считают великим астрономом', 'Copernicus is regarded as a great astronomer'), ['wielki', 'jako'], [],
        t('**Uważany za** + знахідний: za **wielkiego astronoma**.', '**Uważany za** + винительный: za **wielkiego astronoma**.', '**Uważany za** + accusative.')),
      match('register.science', [
        ['twórca', t('творець', 'создатель', 'author')],
        ['obalić pogląd', t('спростувати думку', 'опровергнуть мнение', 'to overturn a view')],
        ['przyczynić się do', t('спричинитися до', 'способствовать', 'to contribute to')],
        ['wbrew przekonaniu', t('всупереч переконанню', 'вопреки убеждению', 'contrary to belief')],
      ]),
    ],
  },
};

// ───────────────────────────── tor-boss: Іспит Торуня (бос B1) ─────────────────────────────
const TORBOSS: LessonLevels = {
  B2: {
    explanation: t(
      'Повторення Торуня (B2):\n• офіційне майбутнє — **z dniem**, **nie będzie wolno**, **będę miał skończony**; **gdy tylko / dopóki nie / zanim** + доконаний майбутній;\n• наміри — **noszę się z zamiarem** + родовий, **mam na celu**, **dążę do tego, żeby**;\n• кар’єра — **objąć stanowisko**, **za porozumieniem stron**, **przejść na swoje**; бюджет — **zmieścić się w budżecie**, **w przeliczeniu na osobę**;\n• імовірність — **niewykluczone, że**, **wątpię, żeby** + -ł, **gdyby** + -ł;\n• зобов’язання — **zobowiązuję się do**, **ręczę za**, **na twoim miejscu** + умовний; наука — **uważany za**, **wbrew** + давальний.',
      'Повторение Торуня (B2):\n• официальное будущее — **z dniem**, **nie będzie wolno**, **będę miał skończony**; **gdy tylko / dopóki nie / zanim** + совершенное будущее;\n• намерения — **noszę się z zamiarem** + родительный, **mam na celu**, **dążę do tego, żeby**;\n• карьера — **objąć stanowisko**, **za porozumieniem stron**, **przejść na swoje**; бюджет — **zmieścić się w budżecie**, **w przeliczeniu na osobę**;\n• вероятность — **niewykluczone, że**, **wątpię, żeby** + -ł, **gdyby** + -ł;\n• обязательства — **zobowiązuję się do**, **ręczę za**, **na twoim miejscu** + условное; наука — **uważany za**, **wbrew** + дательный.',
      'Toruń review (B2):\n• the official future — **z dniem**, **nie będzie wolno**, **będę miał skończony**; **gdy tylko / dopóki nie / zanim** + perfective future;\n• intentions — **noszę się z zamiarem** + genitive, **mam na celu**, **dążę do tego, żeby**;\n• careers — **objąć stanowisko**, **za porozumieniem stron**, **przejść na swoje**; budgets — **zmieścić się w budżecie**, **w przeliczeniu na osobę**;\n• probability — **niewykluczone, że**, **wątpię, żeby** + -ł, **gdyby** + -ł;\n• commitments — **zobowiązuję się do**, **ręczę za**, **na twoim miejscu** + conditional; science — **uważany za**, **wbrew** + dative.',
    ),
    examples: [
      { pl: 'Z dniem 1 lipca przechodzę na swoje i otwieram budkę z piernikami.', tr: t('З 1 липня я відкриваю власну справу — кіоск із пряниками.', 'С 1 июля я ухожу в своё дело и открываю киоск с пряниками.', 'As of 1 July I’m going self-employed with a gingerbread stall.') },
      { pl: 'Wątpię, żebym od razu dużo zarabiał, ale gdy tylko przyjdą turyści, będzie lepiej.', tr: t('Сумніваюся, що одразу багато зароблятиму, але щойно прийдуть туристи, буде краще.', 'Сомневаюсь, что сразу буду много зарабатывать, но как только придут туристы, станет лучше.', 'I doubt I’ll earn much at first, but once the tourists arrive it’ll get better.') },
    ],
    exercises: [
      fillGap('vocab.boss', 'Z dniem 1 maja nie ___ wolno wjeżdżać na Rynek Staromiejski.', ['będzie', 'będą', 'byłoby', 'będziesz'],
        t('З 1 травня не можна буде в’їжджати на Старий Ринок.', 'С 1 мая нельзя будет въезжать на Старую Рыночную площадь.', 'As of 1 May, driving into the Old Town Square will be banned.'),
        t('Безособово, майбутній: **nie będzie wolno**.', 'Безлично, будущее: **nie będzie wolno**.', 'Impersonal future: **nie będzie wolno**.')),
      fillGap('vocab.boss', 'Nie wyjdę z biura, dopóki nie ___ raportu.', ['skończę', 'kończę', 'skończyłem', 'kończyć'],
        t('Я не вийду з офісу, доки не закінчу звіту.', 'Я не уйду из офиса, пока не закончу отчёт.', 'I won’t leave the office until I finish the report.'),
        t('**Dopóki nie** + доконаний майбутній: **skończę**.', '**Dopóki nie** + совершенное будущее: **skończę**.', '**Dopóki nie** + perfective future.')),
      fillGap('vocab.boss', 'Szkolenie ma na celu ___ kwalifikacji pracowników.', ['podniesienie', 'podniesienia', 'podniesieniem', 'podnieść'],
        t('Навчання має на меті підвищення кваліфікації працівників.', 'Обучение имеет целью повышение квалификации сотрудников.', 'The training aims to raise staff qualifications.'),
        t('**Mieć na celu** + знахідний: **podniesienie**.', '**Mieć na celu** + винительный: **podniesienie**.', '**Mieć na celu** + accusative.')),
      reverseChoice('vocab.boss', t('Щойно отримаю відповідь, дам тобі знати.', 'Как только получу ответ, дам тебе знать.', 'As soon as I hear back, I’ll let you know.'),
        ['Gdy tylko dostanę odpowiedź, dam ci znać.', 'Gdy tylko dostaję odpowiedź, dam ci znać.', 'Gdy tylko dostanę odpowiedź, dam cię znać.'],
        t('Майбутня дія — **dostanę**; кому — давальний: **ci**.', 'Будущее действие — **dostanę**; кому — дательный: **ci**.', 'Future **dostanę**; dative **ci**.')),
      reading('reading.boss', 'Bobek planuje: „Z dniem 1 lipca przechodzę na swoje — otwieram budkę z piernikami przy Rynku. Kredyt spłacę w ratach i, jeśli wszystko pójdzie zgodnie z planem, zmieszczę się w budżecie. Tomek ręczy za mnie w banku. Wątpię, żebym od razu zarabiał dużo, ale gdy tylko przyjdą turyści, będzie lepiej”.',
        t('Хто ручається за Бобека в банку?', 'Кто ручается за Бобека в банке?', 'Who vouches for Bobek at the bank?'),
        [t('Томек', 'Томек', 'Tomek'), t('пан Адам', 'пан Адам', 'Mr Adam'), t('ніхто — він бере кредит сам', 'никто — он берёт кредит сам', 'nobody — he takes the loan alone')],
        t('«**Tomek ręczy za mnie** w banku».', '«**Tomek ręczy za mnie** w banku».', '“**Tomek ręczy za mnie**”.')),
      dialogue('dialogue.boss', KASIA, [
        {
          npc: 'Słyszałam, że odchodzisz z firmy?',
          tr: t('Я чула, що ти йдеш із фірми?', 'Я слышала, что ты уходишь из фирмы?', 'I heard you’re leaving the company?'),
          choose: [
            ['Tak, rozwiązaliśmy umowę za porozumieniem stron — przechodzę na swoje.', t('Так, ми розірвали договір за згодою сторін — відкриваю власну справу.', 'Да, мы расторгли договор по соглашению сторон — открываю своё дело.', 'Yes, we ended the contract by mutual consent — I’m going self-employed.')],
            ['Tak, rozwiązaliśmy umowę z porozumieniem stron — przechodzę na swoje.', t('(стала формула — **za porozumieniem stron**)', '(устойчивая формула — **za porozumieniem stron**)', '(set formula: **za porozumieniem**)')],
            ['Tak, rozwiązaliśmy umowę za porozumieniem stron — przechodzę na swoich.', t('(стала фраза — **przejść na swoje**)', '(устойчивая фраза — **przejść na swoje**)', '(set phrase: **na swoje**)')],
          ],
          feedback: t('**Za porozumieniem stron**; **przejść na swoje**.', '**Za porozumieniem stron**; **przejść na swoje**.', '**Za porozumieniem stron**; **na swoje**.'),
        },
        {
          npc: 'Odważnie! Dasz sobie radę?',
          tr: t('Сміливо! Упораєшся?', 'Смело! Справишься?', 'Brave! Will you manage?'),
          choose: [
            ['Mam nadzieję. Na twoim miejscu też bym zaryzykował.', t('Сподіваюся. На твоєму місці я теж ризикнув би.', 'Надеюсь. На твоём месте я бы тоже рискнул.', 'I hope so. In your shoes I’d take the risk too.')],
            ['Mam nadzieję. W twoim miejscu też bym zaryzykował.', t('(стала формула — **na twoim miejscu**)', '(устойчивая формула — **na twoim miejscu**)', '(set phrase: **na twoim miejscu**)')],
            ['Mam nadzieję. Na twoim miejscu też zaryzykuję.', t('(після «na twoim miejscu» — умовний: **bym zaryzykował**)', '(после «na twoim miejscu» — условное: **bym zaryzykował**)', '(conditional after «na twoim miejscu»)')],
          ],
          feedback: t('**Na twoim miejscu** + умовний.', '**Na twoim miejscu** + условное.', '**Na twoim miejscu** + conditional.'),
        },
      ]),
      findError('vocab.boss', ['Gdyby', 'pociąg', 'przyjedzie', 'na', 'czas,', 'zdążylibyśmy'], 2,
        t('Якби потяг приїхав вчасно, ми встигли б.', 'Если бы поезд пришёл вовремя, мы успели бы.', 'If the train had been on time, we’d have made it.'),
        t('Після **gdyby** — форма на -ł: **przyjechał**.', 'После **gdyby** — форма на -ł: **przyjechał**.', 'After **gdyby** — **przyjechał**.')),
      build('vocab.boss', 'Zobowiązuję się do dotrzymania terminu', t('Я зобов’язуюся дотриматися терміну', 'Обязуюсь соблюсти срок', 'I undertake to meet the deadline'), ['termin', 'dotrzymanie'], [],
        t('**Zobowiązać się do** + родовий: do **dotrzymania terminu**.', '**Zobowiązać się do** + родительный: do **dotrzymania terminu**.', '**Zobowiązać się do** + genitive.')),
      match('vocab.boss', [
        ['z dniem 1 lipca', t('з 1 липня', 'с 1 июля', 'as of 1 July')],
        ['gdy tylko', t('щойно', 'как только', 'as soon as')],
        ['ręczyć za', t('ручатися за', 'ручаться за', 'to vouch for')],
        ['niewykluczone', t('не виключено', 'не исключено', 'it may well be')],
      ]),
    ],
  },
};

export const TORUN_LEVELS: Record<string, LessonLevels> = {
  'tor-1-bede': TOR1,
  'tor-2-zrobie': TOR2,
  'tor-3-zamiary': TOR3,
  'tor-4-kariera': TOR4,
  'tor-5-wakacje': TOR5,
  'tor-6-jezeli': TOR6,
  'tor-7-obietnice': TOR7,
  'tor-8-kopernik': TOR8,
  'tor-boss': TORBOSS,
};

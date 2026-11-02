/**
 * Продолжение сюжетных квестов (2026-11-02): владелец сказал, что квесты «очень короткие» и нужна сюжетная линия.
 * Первые главы каждого квеста остались в gamification.ts без изменений (на проде они уже засеяны, а сид не перезаписывает существующее),
 * здесь — главы 3–5 Варшавы, 2–5 Кракова и 3–5 Вроцлава: по пять глав на квест, около десяти минут.
 *
 * Сквозная линия: в Варшаве Бобека знакомит с польским Зося; она рассказывает о тёте Галине в Кракове (та сдаёт квартиру, это уже первая глава
 * Кракова), в конце Кракова Галина говорит о сыне Юреке во Вроцлаве, а во Вроцлаве Юрек (тот, кто показал Рынок в первой главе) ведёт Бобека на ужин.
 * Язык — A0–A1 с редкими фразами A2 под переводом; каждая глава учит одной ситуации (билет, кафе, приглашение, договор, соседи, поломка, гости,
 * числа и цвета, потерянная вещь, ужин) и ловит типичные ошибки (ты / вы, «Dobranoc» вместо приветствия, род прилагательного, падеж, płacę / płaczę).
 * Все переходы проверяет apps/server/test/content.test.ts: нет тупиков, каждый узел достижим, у каждого выбора есть верный ответ.
 */
import type { I18n } from '@polski-go/shared';
import { t } from './builders';
import type { StoryNode, StoryStage } from './gamification';

type Choice = NonNullable<StoryNode['choices']>[number];
type Flow = { next?: string; end?: true; choices?: Choice[] };

const BEAVER = { speaker: 'beaver' as const, name: 'Bobek', emoji: '🦫' };
const narrator = (pl: string, tr: I18n, f: Flow = {}): StoryNode => ({ speaker: 'narrator', pl, tr, ...f });
const bobek = (pl: string, tr: I18n, f: Flow = {}): StoryNode => ({ ...BEAVER, pl, tr, ...f });
const person = (name: string, emoji: string) => (pl: string, tr: I18n, f: Flow = {}): StoryNode => ({ speaker: 'npc', name, emoji, pl, tr, ...f });
/** Верный ответ; `next` — куда идёт разговор. */
const ok = (pl: string, tr: I18n, next: string): Choice => ({ pl, tr, ok: true, next });
/** Неверный ответ: разговор стоит, ошибка считается, показывается подсказка (на русском, украинском и английском). */
const bad = (pl: string, tr: I18n, feedback: I18n): Choice => ({ pl, tr, ok: false, feedback });

const zosia = person('Zosia', '👩🏼');
const basia = person('Pani Basia', '👩🏽');
const halina = person('Pani Halina', '👵🏼');
const marek = person('Pan Marek', '👨🏼');
const tomek = person('Pan Tomek', '👨🏻‍🔧');
const papa = person('Krasnal Papa', '🧙🏻‍♂️');
const ewa = person('Pani Ewa', '👩🏻‍💼');
const jurek = person('Pan Jurek', '👨🏻‍🦳');
const adam = person('Pan Adam', '🧑🏽‍🍳');

// ───────────────────────────── Варшава: главы 3–5 ─────────────────────────────

const WARSZAWA: StoryStage[] = [
  {
    title: t('Квиток в автоматі', 'Билет в автомате', 'A ticket from the machine'), start: 'a',
    nodes: {
      a: narrator('Przystanek tramwajowy. Zosia pokazuje automat biletowy.', t('Трамвайна зупинка. Зося показує квитковий автомат.', 'Трамвайная остановка. Зося показывает билетный автомат.', 'A tram stop. Zosia points at the ticket machine.'), { next: 'b' }),
      b: zosia('Bobek, możemy mówić sobie na ty?', t('Бобеку, можемо говорити одне одному «ти»?', 'Бобек, можем говорить друг другу «ты»?', 'Bobek, can we use «ty» with each other?'), {
        choices: [
          ok('Tak, chętnie!', t('Так, залюбки!', 'Да, с удовольствием!', 'Yes, gladly!'), 'c'),
          ok('Oczywiście, Zosiu!', t('Звісно, Зосю!', 'Конечно, Зося!', 'Of course, Zosia!'), 'c'),
        ],
      }),
      c: zosia('Świetnie! To jest automat. Tutaj kupujesz bilet. Jaki bilet chcesz?', t('Чудово! Це автомат. Тут купуєш квиток. Який квиток хочеш?', 'Отлично! Это автомат. Здесь покупаешь билет. Какой билет хочешь?', 'Great! This is the machine. You buy a ticket here. Which ticket do you want?'), {
        choices: [
          ok('Poproszę jeden bilet normalny.', t('Один звичайний квиток, будь ласка.', 'Один обычный билет, пожалуйста.', 'One standard ticket, please.'), 'd'),
          ok('Poproszę bilet na dwadzieścia minut.', t('Квиток на двадцять хвилин, будь ласка.', 'Билет на двадцать минут, пожалуйста.', 'A twenty-minute ticket, please.'), 'd'),
          bad('Daj mi bilet!', t('Дай мені квиток!', 'Дай мне билет!', 'Give me a ticket!'), t('Так звучить грубо. Ввічливо: **Poproszę…** («дайте, будь ласка»).', 'Так звучит грубо. Вежливо: **Poproszę…** («дайте, пожалуйста»).', 'That sounds rude. Politely: **Poproszę…** («could I have…»).')),
        ],
      }),
      d: zosia('Dobrze. Na ekranie jest cena. Płacisz kartą czy gotówką?', t('Добре. На екрані ціна. Платиш карткою чи готівкою?', 'Хорошо. На экране цена. Платишь картой или наличными?', 'OK. The price is on the screen. Are you paying by card or cash?'), {
        choices: [
          ok('Kartą, proszę.', t('Карткою, будь ласка.', 'Картой, пожалуйста.', 'By card, please.'), 'e'),
          ok('Gotówką.', t('Готівкою.', 'Наличными.', 'In cash.'), 'e'),
          bad('Tak, proszę.', t('Так, будь ласка.', 'Да, пожалуйста.', 'Yes, please.'), t('Питання «X чи Y?» — обери одне: **kartą** або **gotówką**, а не «tak».', 'Вопрос «X или Y?» — выбери одно: **kartą** или **gotówką**, а не «tak».', 'A question «X or Y?» — pick one: **kartą** or **gotówką**, not «tak».')),
        ],
      }),
      e: narrator('Bilet wychodzi z automatu. Bobek ma bilet!', t('Квиток виходить з автомата. У Бобека є квиток!', 'Билет выходит из автомата. У Бобека есть билет!', 'The ticket comes out of the machine. Bobek has a ticket!'), { next: 'f' }),
      f: zosia('Teraz musisz skasować bilet w tramwaju. Pamiętaj!', t('Тепер треба закомпостувати квиток у трамваї. Пам\'ятай!', 'Теперь нужно прокомпостировать билет в трамвае. Помни!', 'Now you must validate the ticket on the tram. Remember!'), {
        choices: [
          ok('Gdzie jest kasownik?', t('Де компостер?', 'Где компостер?', 'Where is the validator?'), 'g'),
          bad('Gdzie jest bilet?', t('Де квиток?', 'Где билет?', 'Where is the ticket?'), t('Квиток у тебе в руці! Спитай про компостер: **Gdzie jest kasownik?**', 'Билет у тебя в руке! Спроси про компостер: **Gdzie jest kasownik?**', 'The ticket is in your hand! Ask about the validator: **Gdzie jest kasownik?**')),
        ],
      }),
      g: zosia('Kasownik jest przy drzwiach. Tramwaj jedzie! Wsiadamy!', t('Компостер біля дверей. Трамвай їде! Сідаємо!', 'Компостер у дверей. Трамвай едет! Садимся!', 'The validator is by the door. The tram is coming! Let\'s get on!'), { next: 'h' }),
      h: bobek('Skasowane! Jedziemy!', t('Закомпостовано! Їдемо!', 'Прокомпостировано! Едем!', 'Validated! Off we go!'), { end: true }),
    },
  },
  {
    title: t('Кава на Старому місті', 'Кофе на Старом городе', 'Coffee in the Old Town'), start: 'a',
    nodes: {
      a: narrator('Starówka w Warszawie. Pachnie kawą i pączkami.', t('Старе місто у Варшаві. Пахне кавою і пончиками.', 'Старый город в Варшаве. Пахнет кофе и пончиками.', 'The Old Town in Warsaw. It smells of coffee and doughnuts.'), { next: 'b' }),
      b: zosia('Chcesz kawę? Znam dobrą kawiarnię.', t('Хочеш кави? Я знаю гарну кав\'ярню.', 'Хочешь кофе? Я знаю хорошую кофейню.', 'Want a coffee? I know a good café.'), {
        choices: [
          ok('Tak, chętnie! Dziękuję.', t('Так, залюбки! Дякую.', 'Да, с удовольствием! Спасибо.', 'Yes, gladly! Thank you.'), 'c'),
          bad('Tak, jestem z Warszawy.', t('Так, я з Варшави.', 'Да, я из Варшавы.', 'Yes, I\'m from Warsaw.'), t('Зося питає, чи хочеш кави. Відповідай: **Tak, chętnie!**', 'Зося спрашивает, хочешь ли ты кофе. Отвечай: **Tak, chętnie!**', 'Zosia asks if you want coffee. Answer: **Tak, chętnie!**')),
        ],
      }),
      c: basia('Dzień dobry! Co podać?', t('Добрий день! Що подати?', 'Добрый день! Что подать?', 'Good morning! What can I get you?'), {
        choices: [
          ok('Poproszę kawę z mlekiem.', t('Каву з молоком, будь ласка.', 'Кофе с молоком, пожалуйста.', 'A coffee with milk, please.'), 'd'),
          ok('Poproszę herbatę i sernik.', t('Чай і сирник, будь ласка.', 'Чай и сырник, пожалуйста.', 'Tea and cheesecake, please.'), 'd2'),
          bad('Ja kawa z mleko.', t('Я кава з молоко.', 'Я кофе с молоко.', 'Me coffee with milk.'), t('Потрібні закінчення: **kawę z mlekiem** (знахідний і орудний).', 'Нужны окончания: **kawę z mlekiem** (винительный и творительный).', 'You need the endings: **kawę z mlekiem** (accusative and instrumental).')),
        ],
      }),
      d: basia('Kawa z mlekiem. Coś jeszcze?', t('Кава з молоком. Ще щось?', 'Кофе с молоком. Что-нибудь ещё?', 'Coffee with milk. Anything else?'), {
        choices: [
          ok('To wszystko, dziękuję. Ile płacę?', t('Це все, дякую. Скільки плачу?', 'Это всё, спасибо. Сколько плачу?', 'That\'s all, thank you. How much do I pay?'), 'f'),
          bad('To wszystko. Która jest godzina?', t('Це все. Котра година?', 'Это всё. Который час?', 'That\'s all. What time is it?'), t('Ти питаєш про ціну, а не про час: **Ile płacę?**', 'Ты спрашиваешь о цене, а не о времени: **Ile płacę?**', 'You are asking about the price, not the time: **Ile płacę?**')),
        ],
      }),
      d2: basia('Herbata i sernik. Coś jeszcze?', t('Чай і сирник. Ще щось?', 'Чай и сырник. Что-нибудь ещё?', 'Tea and cheesecake. Anything else?'), {
        choices: [
          ok('To wszystko, dziękuję. Ile płacę?', t('Це все, дякую. Скільки плачу?', 'Это всё, спасибо. Сколько плачу?', 'That\'s all, thank you. How much do I pay?'), 'f'),
          bad('To wszystko. Która jest godzina?', t('Це все. Котра година?', 'Это всё. Который час?', 'That\'s all. What time is it?'), t('Ти питаєш про ціну, а не про час: **Ile płacę?**', 'Ты спрашиваешь о цене, а не о времени: **Ile płacę?**', 'You are asking about the price, not the time: **Ile płacę?**')),
        ],
      }),
      f: basia('Razem osiemnaście złotych.', t('Разом вісімнадцять злотих.', 'Всего восемнадцать злотых.', 'That\'s eighteen złoty in total.'), {
        choices: [
          ok('Płacę kartą.', t('Плачу карткою.', 'Плачу картой.', 'I\'m paying by card.'), 'g'),
          ok('Płacę gotówką.', t('Плачу готівкою.', 'Плачу наличными.', 'I\'m paying in cash.'), 'g'),
          bad('Płaczę kartą.', t('Плачу (сльози) карткою.', 'Плачу (слёзы) картой.', 'I cry by card.'), t('**płaczę** — «плачу» сльозами, **płacę** — «плачу» грошима. Одна літера різниці!', '**płaczę** — «плачу» слезами, **płacę** — «плачу» деньгами. Разница в одной букве!', '**płaczę** = I cry, **płacę** = I pay. One letter apart!')),
        ],
      }),
      g: narrator('Bobek pije kawę. Jest pyszna!', t('Бобек п\'є каву. Вона смачна!', 'Бобек пьёт кофе. Она вкусная!', 'Bobek sips his coffee. It is delicious!'), { next: 'h' }),
      h: bobek('Pyszna! Dziękuję, Zosiu!', t('Смачна! Дякую, Зосю!', 'Вкусно! Спасибо, Зося!', 'Delicious! Thank you, Zosia!'), { end: true }),
    },
  },
  {
    title: t('Запрошення на вечерю', 'Приглашение на ужин', 'An invitation to dinner'), start: 'a',
    nodes: {
      a: narrator('Wieczór. Zosia i Bobek siedzą nad Wisłą.', t('Вечір. Зося і Бобек сидять над Віслою.', 'Вечер. Зося и Бобек сидят на берегу Вислы.', 'Evening. Zosia and Bobek sit by the Vistula.'), { next: 'b' }),
      b: zosia('Bobek, w sobotę robię kolację. Przyjdziesz?', t('Бобеку, у суботу я готую вечерю. Прийдеш?', 'Бобек, в субботу я готовлю ужин. Придёшь?', 'Bobek, on Saturday I\'m cooking dinner. Will you come?'), {
        choices: [
          ok('Z przyjemnością! O której?', t('З приємністю! О котрій?', 'С удовольствием! Во сколько?', 'With pleasure! What time?'), 'c'),
          ok('Tak, przyjdę. O której?', t('Так, прийду. О котрій?', 'Да, приду. Во сколько?', 'Yes, I\'ll come. What time?'), 'c'),
          bad('Tak, w niedzielę.', t('Так, у неділю.', 'Да, в воскресенье.', 'Yes, on Sunday.'), t('Зося сказала **w sobotę** (у суботу), а не w niedzielę (у неділю).', 'Зося сказала **w sobotę** (в субботу), а не w niedzielę (в воскресенье).', 'Zosia said **w sobotę** (on Saturday), not w niedzielę (on Sunday).')),
        ],
      }),
      c: zosia('O siódmej wieczorem. Adres wyślę ci SMS-em.', t('О сьомій вечора. Адресу надішлю тобі есемескою.', 'В семь вечера. Адрес пришлю тебе SMS-кой.', 'At seven in the evening. I\'ll text you the address.'), {
        choices: [
          ok('Dobrze. Do zobaczenia w sobotę!', t('Добре. До зустрічі в суботу!', 'Хорошо. До встречи в субботу!', 'OK. See you on Saturday!'), 'd'),
          ok('Super! Przyniosę ciasto.', t('Супер! Принесу пиріг.', 'Супер! Принесу пирог.', 'Great! I\'ll bring a cake.'), 'd'),
          bad('Dobranoc! Do zobaczenia rano.', t('На добраніч! До зустрічі вранці.', 'Спокойной ночи! До встречи утром.', 'Good night! See you in the morning.'), t('Вечеря о сьомій **wieczorem** (вечора), а не rano (вранці).', 'Ужин в семь **wieczorem** (вечера), а не rano (утром).', 'Dinner is at seven **wieczorem** (in the evening), not rano (in the morning).')),
        ],
      }),
      d: zosia('Świetnie! A teraz coś ważnego. Mam ciocię w Krakowie. Ma mieszkanie do wynajęcia.', t('Чудово! А тепер щось важливе. У мене є тітка в Кракові. У неї є квартира в оренду.', 'Отлично! А теперь кое-что важное. У меня есть тётя в Кракове. У неё есть квартира в аренду.', 'Great! Now something important. I have an aunt in Kraków. She has a flat to rent.'), { next: 'e' }),
      e: zosia('Ciocia Halina jest bardzo miła. Zadzwonię do niej i powiem, że przyjedziesz.', t('Тітка Галина дуже мила. Я їй зателефоную і скажу, що ти приїдеш.', 'Тётя Галина очень милая. Я ей позвоню и скажу, что ты приедешь.', 'Aunt Halina is very kind. I\'ll call her and tell her you\'re coming.'), {
        choices: [
          ok('Dziękuję, Zosiu! Jesteś bardzo miła.', t('Дякую, Зосю! Ти дуже мила.', 'Спасибо, Зося! Ты очень милая.', 'Thank you, Zosia! You are very kind.'), 'f'),
          bad('Dziękuję, ciociu!', t('Дякую, тітонько!', 'Спасибо, тётя!', 'Thank you, auntie!'), t('Зося — твоя подруга, а не тітка 🙂 **ciocia** — тітка. Скажи: **Dziękuję, Zosiu!**', 'Зося — твоя подруга, а не тётя 🙂 **ciocia** — тётя. Скажи: **Dziękuję, Zosiu!**', 'Zosia is your friend, not your aunt 🙂 **ciocia** = aunt. Say: **Dziękuję, Zosiu!**')),
        ],
      }),
      f: narrator('Zosia daje Bobkowi biało-czerwony szalik i bilet na pociąg do Krakowa.', t('Зося дає Бобекові біло-червоний шарф і квиток на потяг до Кракова.', 'Зося дарит Бобеку бело-красный шарф и билет на поезд в Краков.', 'Zosia gives Bobek a white-and-red scarf and a train ticket to Kraków.'), { next: 'g' }),
      g: bobek('Dziękuję za wszystko, Zosiu! Do zobaczenia w sobotę!', t('Дякую за все, Зосю! До зустрічі в суботу!', 'Спасибо за всё, Зося! До встречи в субботу!', 'Thank you for everything, Zosia! See you on Saturday!'), { end: true }),
    },
  },
];

// ───────────────────────────── Краков: главы 2–5 ─────────────────────────────

const KRAKOW: StoryStage[] = [
  {
    title: t('Договір оренди', 'Договор аренды', 'The lease'), start: 'a',
    nodes: {
      a: narrator('Następny dzień. Pani Halina czeka z umową.', t('Наступного дня. Пані Галина чекає з договором.', 'На следующий день. Пани Галина ждёт с договором.', 'The next day. Pani Halina is waiting with the contract.'), { next: 'b' }),
      b: halina('Dzień dobry, panie Bobku! Zosia mówiła, że jest pan bardzo miły. Proszę, to jest umowa.', t('Добрий день, пане Бобеку! Зося казала, що ви дуже милий. Прошу, ось договір.', 'Добрый день, пан Бобек! Зося говорила, что вы очень милый. Пожалуйста, вот договор.', 'Good morning, Mr Bobek! Zosia said you are very nice. Here is the contract.'), {
        choices: [
          ok('Dzień dobry, pani Halino! Dziękuję.', t('Добрий день, пані Галино! Дякую.', 'Добрый день, пани Галина! Спасибо.', 'Good morning, Pani Halina! Thank you.'), 'c'),
          bad('Cześć, Halina!', t('Привіт, Галина!', 'Привет, Галина!', 'Hi, Halina!'), t('До старшої пані ввічливо: **Dzień dobry, pani Halino**. «Cześć» — для друзів.', 'К пожилой пани вежливо: **Dzień dobry, pani Halino**. «Cześć» — для друзей.', 'To an older lady say politely: **Dzień dobry, pani Halino**. «Cześć» is for friends.')),
        ],
      }),
      c: halina('Czynsz to dwa tysiące złotych miesięcznie. Rachunki płaci pan osobno.', t('Орендна плата — дві тисячі злотих на місяць. Рахунки сплачуєте окремо.', 'Арендная плата — две тысячи злотых в месяц. Счета вы платите отдельно.', 'The rent is two thousand złoty a month. You pay the bills separately.'), {
        choices: [
          ok('Rozumiem. A internet jest w cenie?', t('Розумію. А інтернет у ціні?', 'Понимаю. А интернет в цене?', 'I see. Is internet included?'), 'd'),
          ok('Dobrze. Kiedy płacę czynsz?', t('Добре. Коли я плачу за оренду?', 'Хорошо. Когда я плачу аренду?', 'OK. When do I pay the rent?'), 'd2'),
          bad('Rozumiem. Poproszę dwa tysiące złotych.', t('Розумію. Дайте мені, будь ласка, дві тисячі злотих.', 'Понимаю. Дайте мне, пожалуйста, две тысячи злотых.', 'I see. Could I have two thousand złoty, please.'), t('Платиш ти, а не просиш гроші! **Poproszę…** — це коли щось замовляєш чи просиш.', 'Платишь ты, а не просишь деньги! **Poproszę…** — когда что-то заказываешь или просишь.', 'You are the one paying! **Poproszę…** is for ordering or asking for something.')),
        ],
      }),
      d: halina('Tak, internet jest w cenie.', t('Так, інтернет у ціні.', 'Да, интернет в цене.', 'Yes, internet is included.'), { next: 'e' }),
      d2: halina('Do dziesiątego dnia miesiąca.', t('До десятого числа місяця.', 'До десятого числа месяца.', 'By the tenth day of the month.'), { next: 'e' }),
      e: halina('Jeszcze kaucja: dwa tysiące złotych. Oddam ją, gdy pan się wyprowadzi.', t('Ще застава: дві тисячі злотих. Поверну її, коли ви виїдете.', 'Ещё залог: две тысячи злотых. Верну его, когда вы съедете.', 'There is also a deposit: two thousand złoty. I\'ll give it back when you move out.'), {
        choices: [
          ok('Dobrze. Gdzie mam podpisać?', t('Добре. Де мені підписати?', 'Хорошо. Где мне подписать?', 'OK. Where should I sign?'), 'f'),
          bad('Dobrze. Gdzie mam spać?', t('Добре. Де мені спати?', 'Хорошо. Где мне спать?', 'OK. Where should I sleep?'), t('**spać** — спати, а підписати — **podpisać**. Слова схожі!', '**spać** — спать, а подписать — **podpisać**. Слова похожи!', '**spać** = to sleep, to sign = **podpisać**. They sound alike!')),
        ],
      }),
      f: halina('Tutaj, na ostatniej stronie. Proszę napisać imię i nazwisko.', t('Тут, на останній сторінці. Прошу написати ім\'я та прізвище.', 'Здесь, на последней странице. Пожалуйста, напишите имя и фамилию.', 'Here, on the last page. Please write your first and last name.'), {
        choices: [
          ok('Nazywam się Bobek Bóbr.', t('Мене звати Бобек Бобр.', 'Меня зовут Бобек Бобр.', 'My name is Bobek Bóbr.'), 'g'),
          bad('Mam kota i dwa pokoje.', t('У мене кіт і дві кімнати.', 'У меня кот и две комнаты.', 'I have a cat and two rooms.'), t('Потрібні ім\'я та прізвище: **Nazywam się… / Mam na imię…**', 'Нужны имя и фамилия: **Nazywam się… / Mam na imię…**', 'You need your name: **Nazywam się… / Mam na imię…**')),
        ],
      }),
      g: halina('Gratulacje! Oto klucze: do drzwi i do piwnicy.', t('Вітаю! Ось ключі: від дверей і від підвалу.', 'Поздравляю! Вот ключи: от двери и от подвала.', 'Congratulations! Here are the keys: to the door and to the cellar.'), {
        choices: [
          ok('Dziękuję bardzo, pani Halino!', t('Дуже дякую, пані Галино!', 'Большое спасибо, пани Галина!', 'Thank you very much, Pani Halina!'), 'h'),
          bad('Do widzenia, pani Halino!', t('До побачення, пані Галино!', 'До свидания, пани Галина!', 'Goodbye, Pani Halina!'), t('Спочатку подякуй за ключі: **Dziękuję bardzo!** «Do widzenia» — наприкінці.', 'Сначала поблагодари за ключи: **Dziękuję bardzo!** «Do widzenia» — в конце.', 'First thank her for the keys: **Dziękuję bardzo!** «Do widzenia» comes at the end.')),
        ],
      }),
      h: bobek('Mam klucze! Mam mieszkanie!', t('У мене є ключі! У мене є квартира!', 'У меня есть ключи! У меня есть квартира!', 'I have keys! I have a flat!'), { end: true }),
    },
  },
  {
    title: t('Новий сусід', 'Новый сосед', 'A new neighbour'), start: 'a',
    nodes: {
      a: narrator('Bobek wnosi pudła na trzecie piętro. Na schodach spotyka sąsiada.', t('Бобек несе коробки на третій поверх. На сходах зустрічає сусіда.', 'Бобек несёт коробки на третий этаж. На лестнице встречает соседа.', 'Bobek carries boxes up to the third floor. On the stairs he meets a neighbour.'), { next: 'b' }),
      b: marek('Dzień dobry! Pan się wprowadza? Jestem Marek z drugiego piętra.', t('Добрий день! Ви переїжджаєте? Я Марек з другого поверху.', 'Добрый день! Вы переезжаете? Я Марек со второго этажа.', 'Hello! Are you moving in? I\'m Marek from the second floor.'), {
        choices: [
          ok('Dzień dobry! Tak, wprowadzam się. Mam na imię Bobek.', t('Добрий день! Так, переїжджаю. Мене звати Бобек.', 'Добрый день! Да, переезжаю. Меня зовут Бобек.', 'Hello! Yes, I\'m moving in. My name is Bobek.'), 'c'),
          ok('Miło mi! Jestem Bobek, mieszkam na trzecim piętrze.', t('Приємно! Я Бобек, живу на третьому поверсі.', 'Приятно! Я Бобек, живу на третьем этаже.', 'Nice to meet you! I\'m Bobek, I live on the third floor.'), 'c'),
          bad('Do widzenia! Jestem Bobek.', t('До побачення! Я Бобек.', 'До свидания! Я Бобек.', 'Goodbye! I\'m Bobek.'), t('**Do widzenia** — це прощання. Вітаємось: **Dzień dobry!**', '**Do widzenia** — это прощание. Здороваемся: **Dzień dobry!**', '**Do widzenia** is goodbye. Greet with **Dzień dobry!**')),
        ],
      }),
      c: marek('Witamy w kamienicy! Jeśli pan czegoś potrzebuje, proszę pukać.', t('Ласкаво просимо в кам\'яницю! Якщо вам щось потрібно, стукайте.', 'Добро пожаловать в дом! Если вам что-то нужно, стучите.', 'Welcome to the building! If you need anything, just knock.'), {
        choices: [
          ok('Dziękuję. Gdzie jest najbliższy sklep?', t('Дякую. Де найближчий магазин?', 'Спасибо. Где ближайший магазин?', 'Thank you. Where is the nearest shop?'), 'd'),
          bad('Dziękuję. Gdzie jest najbliższa żaba?', t('Дякую. Де найближча жаба?', 'Спасибо. Где ближайшая лягушка?', 'Thank you. Where is the nearest frog?'), t('**Żabka** — магазин, а **żaba** — жаба 🙂 Спитай про **sklep**.', '**Żabka** — магазин, а **żaba** — лягушка 🙂 Спроси про **sklep**.', '**Żabka** is a shop, **żaba** is a frog 🙂 Ask about a **sklep**.')),
        ],
      }),
      d: marek('Żabka jest naprzeciwko, po drugiej stronie ulicy. Jest czynna do jedenastej wieczorem.', t('Żabka навпроти, з іншого боку вулиці. Працює до одинадцятої вечора.', 'Żabka напротив, на другой стороне улицы. Работает до одиннадцати вечера.', 'Żabka is opposite, across the street. It is open until eleven in the evening.'), { next: 'e' }),
      e: marek('I jeszcze jedno: cisza nocna jest od dziesiątej wieczorem.', t('І ще одне: нічна тиша — з десятої вечора.', 'И ещё одно: ночная тишина — с десяти вечера.', 'One more thing: quiet hours start at ten in the evening.'), {
        choices: [
          ok('Rozumiem. Po dziesiątej wieczorem jest cicho.', t('Розумію. Після десятої вечора тихо.', 'Понимаю. После десяти вечера тихо.', 'I see. After ten in the evening it is quiet.'), 'f'),
          bad('Rozumiem. Po dziesiątej rano jest cicho.', t('Розумію. Після десятої ранку тихо.', 'Понимаю. После десяти утра тихо.', 'I see. After ten in the morning it is quiet.'), t('Нічна тиша — **wieczorem** (ввечері), а не rano (вранці).', 'Ночная тишина — **wieczorem** (вечером), а не rano (утром).', 'Quiet hours are **wieczorem** (in the evening), not rano (in the morning).')),
        ],
      }),
      f: marek('Śmieci wyrzuca się na podwórku. Papier, szkło i plastik to osobne pojemniki.', t('Сміття викидають у дворі. Папір, скло й пластик — окремі контейнери.', 'Мусор выбрасывают во дворе. Бумага, стекло и пластик — отдельные контейнеры.', 'Rubbish goes out in the yard. Paper, glass and plastic have separate bins.'), {
        choices: [
          ok('Gdzie jest pojemnik na szkło?', t('Де контейнер для скла?', 'Где контейнер для стекла?', 'Where is the glass bin?'), 'g1'),
          ok('A gdzie jest pojemnik na papier?', t('А де контейнер для паперу?', 'А где контейнер для бумаги?', 'And where is the paper bin?'), 'g2'),
          bad('Gdzie jest śmieci?', t('Де є сміття?', 'Где есть мусор?', 'Where is rubbish (singular)?'), t('**śmieci** — лише множина: **Gdzie są śmieci?**', '**śmieci** — только во множественном числе: **Gdzie są śmieci?**', '**śmieci** is plural only: **Gdzie są śmieci?**')),
        ],
      }),
      g1: marek('Zielony, przy bramie.', t('Зелений, біля брами.', 'Зелёный, у ворот.', 'The green one, by the gate.'), { next: 'h' }),
      g2: marek('Niebieski, też przy bramie.', t('Синій, теж біля брами.', 'Синий, тоже у ворот.', 'The blue one, also by the gate.'), { next: 'h' }),
      h: narrator('Sąsiad się uśmiecha. Bobek ma już pierwszego znajomego w Krakowie.', t('Сусід усміхається. У Бобека вже є перший знайомий у Кракові.', 'Сосед улыбается. У Бобека уже есть первый знакомый в Кракове.', 'The neighbour smiles. Bobek already has his first friend in Kraków.'), { next: 'i' }),
      i: bobek('Dziękuję, panie Marku! Do zobaczenia!', t('Дякую, пане Мареку! До зустрічі!', 'Спасибо, пан Марек! До встречи!', 'Thank you, Mr Marek! See you!'), { end: true }),
    },
  },
  {
    title: t('Немає гарячої води', 'Нет горячей воды', 'No hot water'), start: 'a',
    nodes: {
      a: narrator('Wieczorem Bobek chce wziąć prysznic. Ale ciepłej wody nie ma!', t('Ввечері Бобек хоче прийняти душ. Але гарячої води немає!', 'Вечером Бобек хочет принять душ. Но горячей воды нет!', 'In the evening Bobek wants a shower. But there is no hot water!'), { next: 'b' }),
      b: bobek('Nie ma ciepłej wody! Muszę zadzwonić do pani Haliny.', t('Немає гарячої води! Треба подзвонити пані Галині.', 'Нет горячей воды! Надо позвонить пани Галине.', 'No hot water! I have to call Pani Halina.'), { next: 'c' }),
      c: narrator('Telefon dzwoni. Pani Halina odbiera.', t('Телефон дзвонить. Пані Галина відповідає.', 'Телефон звонит. Пани Галина отвечает.', 'The phone rings. Pani Halina picks up.'), { next: 'd' }),
      d: halina('Halo? Słucham.', t('Алло? Слухаю.', 'Алло? Слушаю.', 'Hello? I\'m listening.'), {
        choices: [
          ok('Dobry wieczór, pani Halino. Tu Bobek. Mam problem.', t('Добрий вечір, пані Галино. Це Бобек. У мене проблема.', 'Добрый вечер, пани Галина. Это Бобек. У меня проблема.', 'Good evening, Pani Halina. It\'s Bobek. I have a problem.'), 'e'),
          bad('Dobranoc, pani Halino. Tu Bobek.', t('На добраніч, пані Галино. Це Бобек.', 'Спокойной ночи, пани Галина. Это Бобек.', 'Good night, Pani Halina. It\'s Bobek.'), t('**Dobranoc** — лише перед сном. Увечері вітаються: **Dobry wieczór**.', '**Dobranoc** — только перед сном. Вечером здороваются: **Dobry wieczór**.', '**Dobranoc** is only for going to bed. In the evening greet with **Dobry wieczór**.')),
        ],
      }),
      e: halina('Dobry wieczór, panie Bobku. Co się stało?', t('Добрий вечір, пане Бобеку. Що сталося?', 'Добрый вечер, пан Бобек. Что случилось?', 'Good evening, Mr Bobek. What happened?'), {
        choices: [
          ok('Nie ma ciepłej wody.', t('Немає гарячої води.', 'Нет горячей воды.', 'There is no hot water.'), 'f'),
          ok('Woda w kranie jest zimna.', t('Вода в крані холодна.', 'Вода в кране холодная.', 'The water in the tap is cold.'), 'f'),
          bad('Mam za dużo ciepłej wody.', t('У мене забагато гарячої води.', 'У меня слишком много горячей воды.', 'I have too much hot water.'), t('Проблема в тому, що води **nie ma** — гарячої води немає.', 'Проблема в том, что воды **nie ma** — горячей воды нет.', 'The problem is that there is **nie ma** — no hot water.')),
        ],
      }),
      f: halina('Przepraszam! Zaraz zadzwonię do hydraulika. Czy będzie pan jutro rano w domu?', t('Перепрошую! Зараз подзвоню сантехніку. Чи будете ви завтра вранці вдома?', 'Извините! Сейчас позвоню сантехнику. Вы будете завтра утром дома?', 'Sorry! I\'ll call a plumber right away. Will you be at home tomorrow morning?'), {
        choices: [
          ok('Tak, będę w domu od ósmej rano.', t('Так, буду вдома з восьмої ранку.', 'Да, буду дома с восьми утра.', 'Yes, I\'ll be at home from eight in the morning.'), 'g'),
          bad('Tak, będę w domu od ósmej wieczorem.', t('Так, буду вдома з восьмої вечора.', 'Да, буду дома с восьми вечера.', 'Yes, I\'ll be at home from eight in the evening.'), t('Сантехнік прийде вранці: **od ósmej rano**.', 'Сантехник придёт утром: **od ósmej rano**.', 'The plumber comes in the morning: **od ósmej rano**.')),
        ],
      }),
      g: halina('Dobrze. Hydraulik przyjdzie między ósmą a dziesiątą.', t('Добре. Сантехнік прийде між восьмою і десятою.', 'Хорошо. Сантехник придёт между восемью и десятью.', 'Good. The plumber will come between eight and ten.'), {
        choices: [
          ok('Dziękuję bardzo. Będę czekać.', t('Дуже дякую. Чекатиму.', 'Большое спасибо. Буду ждать.', 'Thank you very much. I\'ll wait.'), 'h'),
          ok('Świetnie. Dziękuję za pomoc!', t('Чудово. Дякую за допомогу!', 'Отлично. Спасибо за помощь!', 'Great. Thanks for the help!'), 'h'),
          bad('Proszę bardzo!', t('Прошу дуже!', 'Пожалуйста!', 'You\'re welcome!'), t('**Proszę bardzo** відповідають на подяку. Тут дякуєш ти: **Dziękuję**.', '**Proszę bardzo** отвечают на благодарность. Здесь благодаришь ты: **Dziękuję**.', '**Proszę bardzo** answers «thank you». Here you are the one thanking: **Dziękuję**.')),
        ],
      }),
      h: narrator('Następnego dnia. Dzwonek do drzwi. To hydraulik!', t('Наступного дня. Дзвінок у двері. Це сантехнік!', 'На следующий день. Звонок в дверь. Это сантехник!', 'The next day. The doorbell rings. It\'s the plumber!'), { next: 'i' }),
      i: tomek('Dzień dobry! Ciepła woda? Zaraz sprawdzę.', t('Добрий день! Гаряча вода? Зараз перевірю.', 'Добрый день! Горячая вода? Сейчас проверю.', 'Hello! Hot water? I\'ll check right away.'), {
        choices: [
          ok('Proszę wejść. Łazienka jest tam, po prawej.', t('Прошу заходити. Ванна там, праворуч.', 'Проходите. Ванная там, справа.', 'Please come in. The bathroom is there, on the right.'), 'j'),
          bad('Proszę wyjść. Łazienka jest tam.', t('Прошу вийти. Ванна там.', 'Выйдите. Ванная там.', 'Please go out. The bathroom is there.'), t('**wejść** — зайти, **wyjść** — вийти. Запрошуємо всередину: **Proszę wejść**.', '**wejść** — войти, **wyjść** — выйти. Приглашаем внутрь: **Proszę wejść**.', '**wejść** = come in, **wyjść** = go out. To invite someone in: **Proszę wejść**.')),
        ],
      }),
      j: tomek('Gotowe! Teraz jest ciepła woda.', t('Готово! Тепер є гаряча вода.', 'Готово! Теперь есть горячая вода.', 'Done! There is hot water now.'), { next: 'k' }),
      k: bobek('Dziękuję! Teraz mogę wziąć prysznic!', t('Дякую! Тепер я можу прийняти душ!', 'Спасибо! Теперь я могу принять душ!', 'Thank you! Now I can take a shower!'), { end: true }),
    },
  },
  {
    title: t('Новосілля', 'Новоселье', 'Housewarming'), start: 'a',
    nodes: {
      a: narrator('Sobota. Bobek zaprosił gości na herbatę. Pierwszy przychodzi pan Marek.', t('Субота. Бобек запросив гостей на чай. Першим приходить пан Марек.', 'Суббота. Бобек пригласил гостей на чай. Первым приходит пан Марек.', 'Saturday. Bobek has invited guests for tea. Pan Marek arrives first.'), { next: 'b' }),
      b: marek('Dzień dobry, Bobku! Dostałem zaproszenie. Co mam przynieść?', t('Добрий день, Бобеку! Отримав запрошення. Що мені принести?', 'Добрый день, Бобек! Получил приглашение. Что мне принести?', 'Hello, Bobek! I got your invitation. What should I bring?'), {
        choices: [
          ok('Nic nie trzeba. Proszę wejść!', t('Нічого не треба. Прошу заходити!', 'Ничего не нужно. Проходите!', 'Nothing is needed. Please come in!'), 'c'),
          ok('Może ciasto albo owoce?', t('Може, пиріг або фрукти?', 'Может, пирог или фрукты?', 'Maybe a cake or some fruit?'), 'c'),
          bad('Proszę przynieść dwie herbat.', t('Принесіть, будь ласка, дві чай (помилка).', 'Принесите, пожалуйста, две чай (ошибка).', 'Please bring two tea (wrong form).'), t('Множина від **herbata** — **herbaty**: **dwie herbaty**.', 'Множественное число от **herbata** — **herbaty**: **dwie herbaty**.', 'The plural of **herbata** is **herbaty**: **dwie herbaty**.')),
        ],
      }),
      c: narrator('Przychodzi też pani Halina. Przynosi szarlotkę.', t('Приходить і пані Галина. Приносить шарлотку.', 'Приходит и пани Галина. Приносит шарлотку.', 'Pani Halina arrives too. She brings an apple pie.'), { next: 'd' }),
      d: halina('Dzień dobry! Wspaniałe mieszkanie! Zosia do mnie dzwoniła. To moja siostrzenica!', t('Добрий день! Чудова квартира! Зося мені дзвонила. Вона моя племінниця!', 'Добрый день! Чудесная квартира! Зося мне звонила. Она моя племянница!', 'Hello! What a lovely flat! Zosia called me. She is my niece!'), {
        choices: [
          ok('Naprawdę? Świat jest mały!', t('Справді? Світ тісний!', 'Правда? Мир тесен!', 'Really? It\'s a small world!'), 'e'),
          ok('Zosia jest bardzo miła!', t('Зося дуже мила!', 'Зося очень милая!', 'Zosia is very kind!'), 'e'),
          bad('Zosia? Nie znam Zosi.', t('Зося? Я не знаю Зосі.', 'Зося? Я не знаю Зосю.', 'Zosia? I don\'t know Zosia.'), t('Але ж ти знаєш Зосю з Варшави! Згадай: вона давала шарф і квиток.', 'Но ты же знаешь Зосю из Варшавы! Вспомни: она дарила шарф и билет.', 'But you know Zosia from Warsaw! Remember: she gave you a scarf and a ticket.')),
        ],
      }),
      e: halina('Herbata czy kawa? Dla mnie kawa.', t('Чай чи кава? Мені каву.', 'Чай или кофе? Мне кофе.', 'Tea or coffee? For me, coffee.'), {
        choices: [
          ok('Dla mnie herbata, poproszę.', t('Мені чай, будь ласка.', 'Мне чай, пожалуйста.', 'Tea for me, please.'), 'f'),
          ok('Dla mnie kawa z mlekiem.', t('Мені кава з молоком.', 'Мне кофе с молоком.', 'Coffee with milk for me.'), 'f'),
          bad('Tak, poproszę.', t('Так, будь ласка.', 'Да, пожалуйста.', 'Yes, please.'), t('Питання «чи» — це вибір: **herbata** або **kawa**.', 'Вопрос с «czy» — это выбор: **herbata** или **kawa**.', 'A question with «czy» is a choice: **herbata** or **kawa**.')),
        ],
      }),
      f: narrator('Wszyscy siedzą przy stole. Jest miło i wesoło.', t('Усі сидять за столом. Приємно і весело.', 'Все сидят за столом. Приятно и весело.', 'Everyone sits at the table. It is warm and cheerful.'), { next: 'g' }),
      g: halina('Mam dla pana prezent. Piękny czerwony dywan na nowe mieszkanie!', t('У мене для вас подарунок. Гарний червоний килим для нової квартири!', 'У меня для вас подарок. Красивый красный ковёр для новой квартиры!', 'I have a gift for you. A lovely red rug for the new flat!'), {
        choices: [
          ok('Dziękuję, pani Halino! To bardzo miły prezent.', t('Дякую, пані Галино! Це дуже приємний подарунок.', 'Спасибо, пани Галина! Это очень приятный подарок.', 'Thank you, Pani Halina! That is a very kind gift.'), 'h'),
          bad('Dziękuję, nie ma za co.', t('Дякую, нема за що.', 'Спасибо, не за что.', 'Thanks, don\'t mention it.'), t('**Nie ma za co** — відповідь на подяку. Тобі дарують, тож дякуєш ти: **Dziękuję!**', '**Nie ma za co** — ответ на благодарность. Тебе дарят, значит, благодаришь ты: **Dziękuję!**', '**Nie ma za co** answers «thank you». You received the gift, so you thank: **Dziękuję!**')),
        ],
      }),
      h: halina('Mój syn Jurek mieszka we Wrocławiu. Proszę go odwiedzić! Zna każdą uliczkę.', t('Мій син Юрек живе у Вроцлаві. Відвідайте його! Він знає кожну вуличку.', 'Мой сын Юрек живёт во Вроцлаве. Навестите его! Он знает каждую улочку.', 'My son Jurek lives in Wrocław. Please visit him! He knows every little street.'), { next: 'i' }),
      i: bobek('Mam dom w Krakowie i nowych przyjaciół. Dziękuję!', t('У мене є дім у Кракові та нові друзі. Дякую!', 'У меня есть дом в Кракове и новые друзья. Спасибо!', 'I have a home in Kraków and new friends. Thank you!'), { end: true }),
    },
  },
];

// ───────────────────────────── Вроцлав: главы 3–5 ─────────────────────────────

const WROCLAW: StoryStage[] = [
  {
    title: t('Полювання на гномів', 'Охота на гномов', 'The gnome hunt'), start: 'a',
    nodes: {
      a: narrator('Następny ranek. Na Rynku we Wrocławiu mieszka wiele krasnali. Krasnal Papa czeka na Bobka.', t('Наступного ранку. На Ринку у Вроцлаві живе багато гномів. Гном Папа чекає на Бобека.', 'На следующее утро. На Рынке во Вроцлаве живёт много гномов. Гном Папа ждёт Бобека.', 'The next morning. Many gnomes live on the Market Square in Wrocław. Gnome Papa is waiting for Bobek.'), { next: 'b' }),
      b: papa('Dzień dobry! Dzisiaj gra: policz krasnale na Rynku. Gotowy?', t('Добрий день! Сьогодні гра: порахуй гномів на Ринку. Готовий?', 'Добрый день! Сегодня игра: сосчитай гномов на Рынке. Готов?', 'Good morning! Today\'s game: count the gnomes on the Market Square. Ready?'), {
        choices: [
          ok('Tak, jestem gotowy!', t('Так, я готовий!', 'Да, я готов!', 'Yes, I\'m ready!'), 'c'),
          bad('Tak, jestem gotowa!', t('Так, я готова!', 'Да, я готова!', 'Yes, I\'m ready! (feminine form)'), t('Бобек — чоловічого роду: **gotowy** (gotowa — для жінки).', 'Бобек — мужского рода: **gotowy** (gotowa — для женщины).', 'Bobek is male: **gotowy** (gotowa is the feminine form).')),
        ],
      }),
      c: narrator('Bobek rozgląda się. Jeden krasnal stoi przy fontannie, dwa przy kawiarni, a trzy przy ratuszu. Krasnal przy fontannie ma czerwoną czapkę.', t('Бобек роздивляється. Один гном стоїть біля фонтану, двоє біля кав\'ярні, а троє біля ратуші. Гном біля фонтану має червону шапку.', 'Бобек осматривается. Один гном стоит у фонтана, двое у кофейни, а трое у ратуши. У гнома у фонтана красная шапка.', 'Bobek looks around. One gnome stands by the fountain, two by the café and three by the town hall. The gnome by the fountain wears a red cap.'), { next: 'd' }),
      d: papa('Ile krasnali jest przy ratuszu?', t('Скільки гномів біля ратуші?', 'Сколько гномов у ратуши?', 'How many gnomes are by the town hall?'), {
        choices: [
          ok('Trzy krasnale.', t('Три гноми.', 'Три гнома.', 'Three gnomes.'), 'e'),
          bad('Dwa krasnale.', t('Два гноми.', 'Два гнома.', 'Two gnomes.'), t('Біля ратуші — **trzy**; dwa — біля кав\'ярні.', 'У ратуши — **trzy**; dwa — у кофейни.', 'By the town hall there are **trzy**; dwa are by the café.')),
          bad('Trzy krasnal.', t('Три гном.', 'Три гном.', 'Three gnome.'), t('Після 2, 3, 4 — множина: **trzy krasnale**.', 'После 2, 3, 4 — множественное число: **trzy krasnale**.', 'After 2, 3, 4 use the plural: **trzy krasnale**.')),
        ],
      }),
      e: papa('Dobrze! A ile jest wszystkich razem?', t('Добре! А скільки їх усього разом?', 'Хорошо! А сколько их всего вместе?', 'Good! And how many are there altogether?'), {
        choices: [
          ok('Razem jest sześć krasnali.', t('Разом шість гномів.', 'Всего шесть гномов.', 'Six gnomes altogether.'), 'f'),
          bad('Razem jest pięć krasnali.', t('Разом п\'ять гномів.', 'Всего пять гномов.', 'Five gnomes altogether.'), t('1 + 2 + 3 = **sześć** (6).', '1 + 2 + 3 = **sześć** (6).', '1 + 2 + 3 = **sześć** (6).')),
        ],
      }),
      f: papa('Brawo! A teraz kolory. Jakiego koloru jest czapka krasnala przy fontannie?', t('Браво! А тепер кольори. Якого кольору шапка гнома біля фонтану?', 'Браво! А теперь цвета. Какого цвета шапка гнома у фонтана?', 'Bravo! Now colours. What colour is the cap of the gnome by the fountain?'), {
        choices: [
          ok('Czerwona.', t('Червона.', 'Красная.', 'Red.'), 'g'),
          bad('Zielona.', t('Зелена.', 'Зелёная.', 'Green.'), t('Бобек бачив **czerwoną** (червону) шапку.', 'Бобек видел **czerwoną** (красную) шапку.', 'Bobek saw a **czerwoną** (red) cap.')),
          bad('Czerwony.', t('Червоний (чол. рід).', 'Красный (муж. род).', 'Red (masculine form).'), t('**czapka** — жіночого роду: **czerwona** czapka.', '**czapka** — женского рода: **czerwona** czapka.', '**czapka** is feminine: **czerwona** czapka.')),
        ],
      }),
      g: papa('Wspaniale! Jesteś mistrzem krasnali. Dostajesz mapę Wrocławia.', t('Чудово! Ти майстер гномів. Отримуєш мапу Вроцлава.', 'Великолепно! Ты мастер гномов. Получаешь карту Вроцлава.', 'Wonderful! You are a gnome master. You get a map of Wrocław.'), { next: 'h' }),
      h: bobek('Dziękuję, Papa! Teraz znam Wrocław!', t('Дякую, Папо! Тепер я знаю Вроцлав!', 'Спасибо, Папа! Теперь я знаю Вроцлав!', 'Thank you, Papa! Now I know Wrocław!'), { end: true }),
    },
  },
  {
    title: t('Загублений телефон', 'Потерянный телефон', 'The lost phone'), start: 'a',
    nodes: {
      a: narrator('Bobek chce zadzwonić do domu. Szuka telefonu w plecaku. Telefonu nie ma!', t('Бобек хоче зателефонувати додому. Шукає телефон у рюкзаку. Телефона немає!', 'Бобек хочет позвонить домой. Ищет телефон в рюкзаке. Телефона нет!', 'Bobek wants to call home. He looks for his phone in the backpack. It\'s not there!'), { next: 'b' }),
      b: bobek('Zgubiłem telefon! Może w tramwaju?', t('Я загубив телефон! Може, у трамваї?', 'Я потерял телефон! Может, в трамвае?', 'I lost my phone! Maybe on the tram?'), { next: 'c' }),
      c: narrator('Bobek idzie do biura rzeczy znalezionych.', t('Бобек іде до бюро знахідок.', 'Бобек идёт в бюро находок.', 'Bobek goes to the lost-property office.'), { next: 'd' }),
      d: ewa('Dzień dobry. W czym mogę pomóc?', t('Добрий день. Чим можу допомогти?', 'Добрый день. Чем могу помочь?', 'Good morning. How can I help?'), {
        choices: [
          ok('Dzień dobry. Zgubiłem telefon.', t('Добрий день. Я загубив телефон.', 'Добрый день. Я потерял телефон.', 'Good morning. I lost my phone.'), 'e'),
          ok('Dzień dobry. Szukam telefonu.', t('Добрий день. Шукаю телефон.', 'Добрый день. Ищу телефон.', 'Good morning. I\'m looking for a phone.'), 'e'),
          bad('Dzień dobry. Znalazłem telefon.', t('Добрий день. Я знайшов телефон.', 'Добрый день. Я нашёл телефон.', 'Good morning. I found a phone.'), t('**znalazłem** — знайшов. Ти загубив: **zgubiłem**.', '**znalazłem** — нашёл. Ты потерял: **zgubiłem**.', '**znalazłem** = I found. You lost it: **zgubiłem**.')),
        ],
      }),
      e: ewa('Jaki to telefon? Jakiego jest koloru?', t('Який це телефон? Якого він кольору?', 'Какой это телефон? Какого он цвета?', 'What phone is it? What colour is it?'), {
        choices: [
          ok('Mój telefon jest czarny.', t('Мій телефон чорний.', 'Мой телефон чёрный.', 'My phone is black.'), 'f'),
          bad('Mój telefon jest czarna.', t('Мій телефон чорна (помилка).', 'Мой телефон чёрная (ошибка).', 'My phone is black (wrong ending).'), t('**telefon** — чоловічого роду: **czarny**.', '**telefon** — мужского рода: **czarny**.', '**telefon** is masculine: **czarny**.')),
        ],
      }),
      f: ewa('Gdzie pan go zgubił? W tramwaju czy w kawiarni?', t('Де ви його загубили? У трамваї чи в кав\'ярні?', 'Где вы его потеряли? В трамвае или в кофейне?', 'Where did you lose it? On the tram or in a café?'), {
        choices: [
          ok('Myślę, że w tramwaju numer cztery.', t('Думаю, що в трамваї номер чотири.', 'Думаю, что в трамвае номер четыре.', 'I think on tram number four.'), 'g'),
          ok('Chyba w kawiarni na Rynku.', t('Мабуть, у кав\'ярні на Ринку.', 'Наверное, в кофейне на Рынке.', 'Probably in a café on the Market Square.'), 'g2'),
          bad('Pod tramwajem.', t('Під трамваєм.', 'Под трамваем.', 'Under the tram.'), t('**pod** — під. У трамваї — **w tramwaju**.', '**pod** — под. В трамвае — **w tramwaju**.', '**pod** = under. On the tram = **w tramwaju**.')),
        ],
      }),
      g: ewa('Sprawdzę… Tramwaj numer cztery… Mamy telefon! Czarny, z naklejką bobra?', t('Перевірю… Трамвай номер чотири… Є телефон! Чорний, з наліпкою бобра?', 'Проверю… Трамвай номер четыре… Есть телефон! Чёрный, с наклейкой бобра?', 'Let me check… Tram number four… We have a phone! Black, with a beaver sticker?'), { next: 'h' }),
      g2: ewa('Sprawdzę… Kawiarnia na Rynku… Mamy telefon! Czarny, z naklejką bobra?', t('Перевірю… Кав\'ярня на Ринку… Є телефон! Чорний, з наліпкою бобра?', 'Проверю… Кофейня на Рынке… Есть телефон! Чёрный, с наклейкой бобра?', 'Let me check… The café on the Market Square… We have a phone! Black, with a beaver sticker?'), { next: 'h' }),
      h: bobek('(To jest mój telefon!)', t('(Це мій телефон!)', '(Это мой телефон!)', '(That\'s my phone!)'), {
        choices: [
          ok('Tak, to mój telefon! Dziękuję bardzo!', t('Так, це мій телефон! Дуже дякую!', 'Да, это мой телефон! Большое спасибо!', 'Yes, that\'s my phone! Thank you very much!'), 'i'),
          bad('Nie, mój telefon jest różowy.', t('Ні, мій телефон рожевий.', 'Нет, мой телефон розовый.', 'No, my phone is pink.'), t('Ти ж сказав, що твій телефон **czarny** (чорний).', 'Ты же сказал, что твой телефон **czarny** (чёрный).', 'You said your phone is **czarny** (black).')),
        ],
      }),
      i: ewa('Proszę podać imię i podpisać tutaj.', t('Прошу назвати ім\'я та підписати тут.', 'Прошу назвать имя и подписать здесь.', 'Please give your name and sign here.'), {
        choices: [
          ok('Nazywam się Bobek. Proszę bardzo.', t('Мене звати Бобек. Прошу.', 'Меня зовут Бобек. Пожалуйста.', 'My name is Bobek. Here you are.'), 'j'),
          bad('Mam na imię Wrocław.', t('Моє ім\'я — Вроцлав.', 'Моё имя — Вроцлав.', 'My name is Wrocław.'), t('Вроцлав — це місто 🙂 А ти — **Bobek**.', 'Вроцлав — это город 🙂 А ты — **Bobek**.', 'Wrocław is a city 🙂 You are **Bobek**.')),
        ],
      }),
      j: bobek('Dziękuję, pani Ewo! Do widzenia!', t('Дякую, пані Єво! До побачення!', 'Спасибо, пани Эва! До свидания!', 'Thank you, Pani Ewa! Goodbye!'), { end: true }),
    },
  },
  {
    title: t('Вечеря з Юреком', 'Ужин с Юреком', 'Dinner with Jurek'), start: 'a',
    nodes: {
      a: narrator('Wieczór nad Odrą. Na moście stoi pan Jurek — ten sam, który pokazał Bobkowi Rynek.', t('Вечір над Одрою. На мосту стоїть пан Юрек — той самий, що показав Бобекові Ринок.', 'Вечер над Одрой. На мосту стоит пан Юрек — тот самый, который показал Бобеку Рынок.', 'Evening by the Oder. Pan Jurek stands on the bridge — the same man who showed Bobek the Market Square.'), { next: 'b' }),
      b: jurek('Dobry wieczór! Czy pan to Bobek? Mama dzwoniła z Krakowa. Halina to moja mama!', t('Добрий вечір! Ви Бобек? Мама дзвонила з Кракова. Галина — моя мама!', 'Добрый вечер! Вы Бобек? Мама звонила из Кракова. Галина — моя мама!', 'Good evening! Are you Bobek? Mum called from Kraków. Halina is my mother!'), {
        choices: [
          ok('Dobry wieczór, panie Jurku! Miło mi pana poznać.', t('Добрий вечір, пане Юрку! Приємно з вами познайомитися.', 'Добрый вечер, пан Юрек! Приятно с вами познакомиться.', 'Good evening, Mr Jurek! Nice to meet you.'), 'c'),
          bad('Dobry wieczór, Jurek! Miło mi pana poznać.', t('Добрий вечір, Юрек! Приємно з вами познайомитися.', 'Добрый вечер, Юрек! Приятно с вами познакомиться.', 'Good evening, Jurek! Nice to meet you.'), t('Звертання до людини — кличний відмінок: **panie Jurku**.', 'Обращение к человеку — звательный падеж: **panie Jurku**.', 'When addressing someone use the vocative: **panie Jurku**.')),
        ],
      }),
      c: jurek('Zapraszam pana na kolację. Czy lubi pan pierogi?', t('Запрошую вас на вечерю. Чи любите ви вареники?', 'Приглашаю вас на ужин. Вы любите вареники?', 'I invite you to dinner. Do you like pierogi?'), {
        choices: [
          ok('Tak, bardzo lubię pierogi!', t('Так, дуже люблю вареники!', 'Да, очень люблю вареники!', 'Yes, I love pierogi!'), 'd'),
          bad('Tak, lubię pierogów.', t('Так, люблю вареників (помилка).', 'Да, люблю вареников (ошибка).', 'Yes, I like pierogi (wrong case).'), t('Після **lubić** — знахідний: **lubię pierogi**.', 'После **lubić** — винительный: **lubię pierogi**.', 'After **lubić** use the accusative: **lubię pierogi**.')),
        ],
      }),
      d: narrator('W restauracji pachnie smażoną cebulą. Kelner przynosi menu.', t('У ресторані пахне смаженою цибулею. Офіціант приносить меню.', 'В ресторане пахнет жареным луком. Официант приносит меню.', 'The restaurant smells of fried onion. The waiter brings the menu.'), { next: 'e' }),
      e: adam('Dobry wieczór. Co podać?', t('Добрий вечір. Що подати?', 'Добрый вечер. Что подать?', 'Good evening. What can I get you?'), {
        choices: [
          ok('Poproszę pierogi z mięsem i żurek.', t('Вареники з м\'ясом і журек, будь ласка.', 'Вареники с мясом и журек, пожалуйста.', 'Pierogi with meat and żurek, please.'), 'f'),
          ok('Poproszę pierogi ruskie i wodę.', t('Руські вареники й воду, будь ласка.', 'Русские вареники и воду, пожалуйста.', 'Pierogi ruskie and water, please.'), 'f'),
          bad('Dam panu pierogi.', t('Дам вам вареники.', 'Дам вам вареники.', 'I will give you pierogi.'), t('Це ти замовляєш, а не пропонуєш: **Poproszę…**', 'Это ты заказываешь, а не предлагаешь: **Poproszę…**', 'You are ordering, not offering: **Poproszę…**')),
        ],
      }),
      f: jurek('Smacznego!', t('Смачного!', 'Приятного аппетита!', 'Enjoy your meal!'), {
        choices: [
          ok('Dziękuję, nawzajem!', t('Дякую, взаємно!', 'Спасибо, взаимно!', 'Thank you, and you!'), 'g'),
          bad('Dziękuję, do widzenia!', t('Дякую, до побачення!', 'Спасибо, до свидания!', 'Thank you, goodbye!'), t('Після **Smacznego** кажуть **Dziękuję, nawzajem!** (взаємно), а не прощаються.', 'После **Smacznego** говорят **Dziękuję, nawzajem!** (взаимно), а не прощаются.', 'After **Smacznego** say **Dziękuję, nawzajem!** (same to you); do not say goodbye.')),
        ],
      }),
      g: jurek('A teraz opowiedz: jak się panu podoba w Polsce?', t('А тепер розкажіть: як вам подобається в Польщі?', 'А теперь расскажите: как вам нравится в Польше?', 'Now tell me: how do you like Poland?'), {
        choices: [
          ok('Bardzo mi się podoba! Polacy są mili.', t('Мені дуже подобається! Поляки привітні.', 'Мне очень нравится! Поляки приветливые.', 'I like it a lot! Poles are kind.'), 'h'),
          ok('Podoba mi się Wrocław. Lubię krasnale!', t('Мені подобається Вроцлав. Люблю гномів!', 'Мне нравится Вроцлав. Люблю гномов!', 'I like Wrocław. I love the gnomes!'), 'h'),
          bad('Ja nie mam podoba.', t('Я не маю подобається.', 'Я не имею нравится.', 'I don\'t have like.'), t('«Мені подобається» — це **Podoba mi się…** (дослівно: «мені подобається»).', '«Мне нравится» — это **Podoba mi się…** (дословно: «мне нравится»).', '«I like» is **Podoba mi się…** (literally «it pleases me»).')),
        ],
      }),
      h: narrator('Za oknem świecą światła Odry. Bobek ma już przyjaciół w trzech miastach.', t('За вікном світяться вогні Одри. У Бобека вже є друзі у трьох містах.', 'За окном светятся огни Одры. У Бобека уже есть друзья в трёх городах.', 'Outside, the lights of the Oder shine. Bobek now has friends in three cities.'), { next: 'i' }),
      i: jurek('Witamy w Polsce, Bobku! Jesteś już prawie Polakiem!', t('Ласкаво просимо до Польщі, Бобеку! Ти вже майже поляк!', 'Добро пожаловать в Польшу, Бобек! Ты уже почти поляк!', 'Welcome to Poland, Bobek! You are almost a Pole already!'), { end: true }),
    },
  },
];

/**
 * В тексте выше верный ответ записан первым — так проще читать и проверять. Игроку порядок нужен другой, иначе квест проходится «всегда первым вариантом»:
 * варианты каждого выбора детерминированно сдвигаются (сдвиг зависит от текста реплики, поэтому порядок один и тот же на сервере, у всех игроков и в тестах).
 */
const hash = (s: string) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
const shuffled = (stages: StoryStage[]): StoryStage[] =>
  stages.map((st) => ({
    ...st,
    nodes: Object.fromEntries(
      Object.entries(st.nodes).map(([id, n]) => {
        if (!n.choices || n.choices.length < 2) return [id, n];
        const k = hash(`${id}|${n.pl}`) % n.choices.length;
        return [id, { ...n, choices: [...n.choices.slice(k), ...n.choices.slice(0, k)] }];
      }),
    ),
  }));

/** Главы, добавляемые к уже засеянным первым главам квеста (по slug). Порядок важен: он становится `order` этапа в БД. */
export const STORY_EXTRA_STAGES: Record<string, StoryStage[]> = {
  's-warszawa-dworzec': shuffled(WARSZAWA),
  's-krakow-mieszkanie': shuffled(KRAKOW),
  's-wroclaw-zgubiony': shuffled(WROCLAW),
};

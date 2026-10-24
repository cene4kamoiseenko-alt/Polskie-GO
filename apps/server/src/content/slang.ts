/**
 * «Żywy polski» — розмовник живої польської мови.
 * Кожен вираз: значення, переклад, реєстр (формальність і грубість), ситуації,
 * приклад діалогу та нейтральна альтернатива. Сленг не подається без контексту.
 */
import type { I18n } from '@polski-go/shared';
import { t } from './builders';

/** casual — розмовне, але нікого не образить; slang — молодіжний сленг; rude — грубувато/зневажливо. */
export type Register = 'casual' | 'slang' | 'rude';
export type SlangGroup = 'greet' | 'people' | 'react' | 'calm' | 'talk';

export type SlangItem = {
  id: string;
  pl: string;
  group: SlangGroup;
  register: Register;
  meaning: I18n;
  /** Наскільки фамільярно/грубо і з ким можна. */
  tone: I18n;
  when: I18n;
  dialogue: { a: string; b: string; tr: I18n };
  neutral: { pl: string; tr: I18n };
};

const s = (id: string, pl: string, group: SlangGroup, register: Register, meaning: I18n, tone: I18n, when: I18n, dialogue: [string, string, I18n], neutral: [string, I18n]): SlangItem => ({
  id, pl, group, register, meaning, tone, when, dialogue: { a: dialogue[0], b: dialogue[1], tr: dialogue[2] }, neutral: { pl: neutral[0], tr: neutral[1] },
});

const FRIENDS = t('Лише з друзями й ровесниками.', 'Только с друзьями и ровесниками.', 'Only with friends and peers.');

export const SLANG: SlangItem[] = [
  s('siema', 'Siema!', 'greet', 'casual', t('Привіт! / Бувай!', 'Привет! / Пока!', 'Hi! / Bye!'), FRIENDS,
    t('Зустріч із друзями, повідомлення в месенджері.', 'Встреча с друзьями, сообщение в мессенджере.', 'Meeting friends, texting.'),
    ['Siema! Co tam?', 'Siema! Spoko.', t('— Привіт! Як справи? — Привіт! Нормально.', '— Привет! Как дела? — Привет! Нормально.', '— Hi! What\'s up? — Hi! Fine.')],
    ['Cześć! / Dzień dobry!', t('Привіт! / Добрий день!', 'Привет! / Добрый день!', 'Hi! / Hello!')]),
  s('elo', 'Elo!', 'greet', 'slang', t('Привіт! (дуже розмовне)', 'Привет! (очень разговорное)', 'Hi! (very casual)'),
    t('Молодіжне, дуже неформальне. Не з викладачами й незнайомими.', 'Молодёжное, очень неформальное. Не с преподавателями и незнакомыми.', 'Youth slang, very informal.'),
    t('Привітання з близькими друзями.', 'Приветствие с близкими друзьями.', 'Greeting close friends.'),
    ['Elo, ziomek!', 'Elo! Co słychać?', t('— Здоров, друзяко! — Привіт! Що нового?', '— Здорово, кореш! — Привет! Что нового?', '— Yo, buddy! — Hi! What\'s new?')],
    ['Cześć!', t('Привіт!', 'Привет!', 'Hi!')]),
  s('nara', 'Nara!', 'greet', 'slang', t('Бувай!', 'Пока!', 'Bye!'),
    t('Молодіжне, фамільярне.', 'Молодёжное, фамильярное.', 'Youth slang, familiar.'),
    t('Прощання з друзями наприкінці розмови.', 'Прощание с друзьями в конце разговора.', 'Saying bye to friends.'),
    ['Dobra, idę. Nara!', 'Nara, do jutra!', t('— Добре, я пішов. Бувай! — Бувай, до завтра!', '— Ладно, я пошёл. Пока! — Пока, до завтра!', '— OK, I\'m going. Bye! — Bye, see you tomorrow!')],
    ['Na razie! / Do widzenia!', t('Бувай! / До побачення!', 'Пока! / До свидания!', 'Bye! / Goodbye!')]),
  s('co-tam', 'Co tam?', 'greet', 'casual', t('Як справи? Що нового?', 'Как дела? Что нового?', 'What\'s up?'), FRIENDS,
    t('Початок неформальної розмови.', 'Начало неформального разговора.', 'Starting a casual chat.'),
    ['Hej, co tam?', 'Wszystko dobrze, a u ciebie?', t('— Привіт, як справи? — Усе добре, а в тебе?', '— Привет, как дела? — Всё хорошо, а у тебя?', '— Hey, what\'s up? — All good, you?')],
    ['Co słychać? / Jak się masz?', t('Що нового? / Як справи?', 'Что нового? / Как дела?', 'How are you?')]),
  s('trzymaj-sie', 'Trzymaj się!', 'greet', 'casual', t('Тримайся! Бувай!', 'Держись! Пока!', 'Take care!'),
    t('Тепле й досить універсальне на «ти»; з керівником на «пан/пані» — краще «Do widzenia».', 'Тёплое и довольно универсальное на «ты»; с руководителем на «пан/пани» — лучше «Do widzenia».', 'Warm and fairly universal on first-name terms.'),
    t('Прощання з друзями, колегами, родиною.', 'Прощание с друзьями, коллегами, семьёй.', 'Saying bye to friends, colleagues, family.'),
    ['No to pa, trzymaj się!', 'Ty też, na razie!', t('— Ну, бувай, тримайся! — Ти теж, бувай!', '— Ну, пока, держись! — Ты тоже, пока!', '— Bye then, take care! — You too!')],
    ['Do widzenia! Wszystkiego dobrego!', t('До побачення! Усього доброго!', 'До свидания! Всего доброго!', 'Goodbye! All the best!')]),
  s('lece', 'Lecę!', 'greet', 'casual', t('Я побіг! Мені час.', 'Я побежал! Мне пора.', 'I\'m off!'),
    t('Розмовне, нейтральне серед знайомих.', 'Разговорное, нейтральное среди знакомых.', 'Casual, fine among acquaintances.'),
    t('Коли поспішаєш і закінчуєш розмову.', 'Когда спешишь и заканчиваешь разговор.', 'When you\'re rushing off.'),
    ['Dobra, lecę, bo spóźnię się na tramwaj.', 'Jasne, cześć!', t('— Добре, я побіг, бо спізнюся на трамвай. — Звісно, бувай!', '— Ладно, я побежал, а то опоздаю на трамвай. — Конечно, пока!', '— OK, I\'m off or I\'ll miss the tram. — Sure, bye!')],
    ['Muszę już iść.', t('Мені вже треба йти.', 'Мне уже нужно идти.', 'I have to go now.')]),
  s('spoko', 'Spoko', 'talk', 'casual', t('Окей, нормально, без проблем', 'Окей, нормально, без проблем', 'OK, cool, no worries'),
    t('Дуже частотне розмовне слово. З керівником — краще нейтрально.', 'Очень частотное разговорное слово. С руководителем — лучше нейтрально.', 'Very common; use neutral words with your boss.'),
    t('Згода, відповідь на подяку чи вибачення.', 'Согласие, ответ на благодарность или извинение.', 'Agreeing, replying to thanks or apologies.'),
    ['Przepraszam za spóźnienie!', 'Spoko, nic się nie stało.', t('— Вибач за запізнення! — Та нормально, нічого страшного.', '— Извини за опоздание! — Нормально, ничего страшного.', '— Sorry I\'m late! — No worries.')],
    ['W porządku. / Nie ma problemu.', t('Гаразд. / Без проблем.', 'В порядке. / Без проблем.', 'All right. / No problem.')]),
  s('luz', 'Luz', 'talk', 'casual', t('Без проблем, спокійно', 'Без проблем, спокойно', 'No worries, chill'), FRIENDS,
    t('Відповідь на подяку, заспокоєння.', 'Ответ на благодарность, успокоение.', 'Replying to thanks, reassuring.'),
    ['Dzięki za pomoc!', 'Luz, nie ma sprawy.', t('— Дякую за допомогу! — Без проблем.', '— Спасибо за помощь! — Без проблем.', '— Thanks for helping! — No worries.')],
    ['Nie ma sprawy. / Spokojnie.', t('Нема за що. / Спокійно.', 'Не за что. / Спокойно.', 'No problem. / Calm down.')]),
  s('ziomek', 'Ziomek', 'people', 'slang', t('Друзяка, кореш (також земляк)', 'Кореш, братан (также земляк)', 'Buddy, homie (also fellow local)'),
    t('Молодіжне, фамільярне. Не про незнайомих.', 'Молодёжное, фамильярное. Не о незнакомых.', 'Youth slang, familiar.'),
    t('Звертання до близького друга.', 'Обращение к близкому другу.', 'Addressing a close friend.'),
    ['Siema, ziomek! Idziemy na mecz?', 'Jasne, ziomek!', t('— Здоров, друзяко! Ідемо на матч? — Звісно!', '— Здорово, кореш! Идём на матч? — Конечно!', '— Hey buddy! Going to the match? — Sure!')],
    ['Kolega / przyjaciel', t('Приятель / друг', 'Приятель / друг', 'Friend')]),
  s('kumpel', 'Kumpel', 'people', 'casual', t('Приятель, товариш', 'Приятель, товарищ', 'Pal, mate'),
    t('Розмовне, але широко вживане й не грубе.', 'Разговорное, но широко употребляемое и не грубое.', 'Casual but widely used, not rude.'),
    t('Коли розповідаєш про друга.', 'Когда рассказываешь о друге.', 'Talking about a friend.'),
    ['Kto to był?', 'Mój kumpel z pracy.', t('— Хто це був? — Мій приятель з роботи.', '— Кто это был? — Мой приятель с работы.', '— Who was that? — My mate from work.')],
    ['Kolega', t('Колега, приятель', 'Коллега, приятель', 'Friend, colleague')]),
  s('sztos', 'Ale sztos!', 'react', 'slang', t('Оце бомба! Крутяк!', 'Вот это бомба! Круто!', 'Awesome!'),
    t('Молодіжний сленг.', 'Молодёжный сленг.', 'Youth slang.'),
    t('Захват від речі, події, їжі.', 'Восторг от вещи, события, еды.', 'Excitement about something great.'),
    ['Zobacz moje nowe buty!', 'Ale sztos!', t('— Подивись на мої нові кросівки! — Оце бомба!', '— Посмотри на мои новые кроссовки! — Вот это бомба!', '— Look at my new shoes! — Awesome!')],
    ['Świetne! / Super!', t('Чудово! / Супер!', 'Отлично! / Супер!', 'Great!')]),
  s('zarabiscie', 'Zarąbiście!', 'react', 'slang', t('Крутезно! Чудово!', 'Круто! Отлично!', 'Awesome!'),
    t('Пом\'якшений варіант вульгарного слова. Лише серед друзів, ніколи на роботі чи в листах.', 'Смягчённый вариант вульгарного слова. Только среди друзей, никогда на работе или в письмах.', 'A softened form of a vulgar word. Friends only.'),
    t('Емоційна оцінка серед друзів.', 'Эмоциональная оценка среди друзей.', 'Emotional praise among friends.'),
    ['Jak było na koncercie?', 'Zarąbiście!', t('— Як було на концерті? — Крутезно!', '— Как было на концерте? — Круто!', '— How was the concert? — Awesome!')],
    ['Świetnie! / Wspaniale!', t('Чудово! / Прекрасно!', 'Отлично! / Прекрасно!', 'Great! / Wonderful!')]),
  s('masakra', 'Masakra!', 'react', 'casual', t('Жах! Кошмар!', 'Ужас! Кошмар!', 'Nightmare!'),
    t('Розмовне, дуже частотне; зрідка вживається й у значенні «неймовірно».', 'Разговорное, очень частотное; иногда и в значении «невероятно».', 'Casual and very common.'),
    t('Пробки, черги, погана погода, неприємність.', 'Пробки, очереди, плохая погода, неприятность.', 'Traffic, queues, bad luck.'),
    ['Stałem godzinę w korku.', 'Masakra!', t('— Я годину стояв у заторі. — Жах!', '— Я час стоял в пробке. — Ужас!', '— I was stuck in traffic for an hour. — Nightmare!')],
    ['Okropne! / To straszne.', t('Жахливо! / Це страшно.', 'Ужасно! / Это страшно.', 'Awful!')]),
  s('beka', 'Ale beka!', 'react', 'slang', t('Оце ржака! Як смішно!', 'Вот умора! Как смешно!', 'What a laugh!'),
    t('Молодіжне. «Mieć bekę z kogoś» — глузувати з когось (неприємно для людини).', 'Молодёжное. «Mieć bekę z kogoś» — насмехаться над кем-то (неприятно для человека).', 'Youth slang; "mieć bekę z kogoś" means mocking someone.'),
    t('Смішна ситуація, мем, жарт.', 'Смешная ситуация, мем, шутка.', 'A funny situation or meme.'),
    ['Zobacz ten filmik z kotem!', 'Ale beka!', t('— Подивись це відео з котом! — Оце ржака!', '— Посмотри это видео с котом! — Вот умора!', '— Look at this cat video! — Hilarious!')],
    ['Ale śmieszne!', t('Як смішно!', 'Как смешно!', 'So funny!')]),
  s('przypal', 'Ale przypał!', 'react', 'slang', t('Оце сором! От халепа!', 'Вот позор! Вот засада!', 'How embarrassing!'),
    t('Молодіжне, неформальне.', 'Молодёжное, неформальное.', 'Youth slang.'),
    t('Незручна ситуація, коли щось пішло не так.', 'Неловкая ситуация, когда что-то пошло не так.', 'An awkward or bad situation.'),
    ['Pomyliłem salę na egzaminie.', 'Ale przypał!', t('— Я переплутав аудиторію на іспиті. — Оце сором!', '— Я перепутал аудиторию на экзамене. — Вот позор!', '— I went to the wrong exam room. — So embarrassing!')],
    ['Ale wstyd! / Ale niezręcznie.', t('Як соромно! / Як незручно.', 'Как стыдно! / Как неловко.', 'How embarrassing!')]),
  s('serio', 'Serio?', 'react', 'casual', t('Серйозно? Справді?', 'Серьёзно? Правда?', 'Seriously?'),
    t('Розмовне, нейтральне в більшості ситуацій.', 'Разговорное, нейтральное в большинстве ситуаций.', 'Casual, fine in most situations.'),
    t('Здивування, недовіра.', 'Удивление, недоверие.', 'Surprise, disbelief.'),
    ['Dostałem nową pracę!', 'Serio? Gratulacje!', t('— Я отримав нову роботу! — Серйозно? Вітаю!', '— Я получил новую работу! — Серьёзно? Поздравляю!', '— I got a new job! — Seriously? Congrats!')],
    ['Naprawdę?', t('Справді?', 'Правда?', 'Really?')]),
  s('bez-kitu', 'Bez kitu!', 'react', 'slang', t('Без жартів! Чесно!', 'Без шуток! Честно!', 'No kidding!'),
    t('Сленг, неформальне.', 'Сленг, неформальное.', 'Slang, informal.'),
    t('Підтвердити, що кажеш правду.', 'Подтвердить, что говоришь правду.', 'Stressing you\'re telling the truth.'),
    ['Widziałem w Opolu znanego piosenkarza.', 'Bez kitu?', t('— Я бачив в Ополі відомого співака. — Без жартів?', '— Я видел в Ополе известного певца. — Без шуток?', '— I saw a famous singer in Opole. — No kidding?')],
    ['Bez żartów. / Naprawdę.', t('Без жартів. / Справді.', 'Без шуток. / Правда.', 'No joke. / Really.')]),
  s('lipa', 'Nie ma lipy', 'react', 'slang', t('Усе по-справжньому, без дурниць', 'Всё по-настоящему, без фигни', 'It\'s legit'),
    t('Сленг: «lipa» — підробка, лажа.', 'Сленг: «lipa» — подделка, лажа.', 'Slang: "lipa" means fake or lame.'),
    t('Наголосити, що щось серйозно чи якісно.', 'Подчеркнуть, что что-то серьёзно или качественно.', 'Stressing something is genuine.'),
    ['To naprawdę oryginalna koszulka?', 'Tak, nie ma lipy.', t('— Це справді оригінальна футболка? — Так, усе по-справжньому.', '— Это правда оригинальная футболка? — Да, всё по-настоящему.', '— Is that really an original shirt? — Yes, it\'s legit.')],
    ['Na poważnie. / To nie żart.', t('Серйозно. / Це не жарт.', 'Серьёзно. / Это не шутка.', 'Seriously. / It\'s no joke.')]),
  s('nie-ogarniam', 'Nie ogarniam', 'talk', 'casual', t('Не розумію, не встигаю за подіями', 'Не понимаю, не успеваю за событиями', 'I don\'t get it'),
    t('Розмовне, дуже частотне; не для офіційних листів.', 'Разговорное, очень частотное; не для официальных писем.', 'Very common; not for formal writing.'),
    t('Коли заплутався в ситуації, техніці, правилах.', 'Когда запутался в ситуации, технике, правилах.', 'When confused by a situation or tech.'),
    ['Nie ogarniam tej aplikacji.', 'Pokażę ci, to proste.', t('— Не розумію цей застосунок. — Покажу тобі, це просто.', '— Не понимаю это приложение. — Покажу тебе, это просто.', '— I can\'t figure out this app. — I\'ll show you.')],
    ['Nie rozumiem. / Nie nadążam.', t('Не розумію. / Не встигаю.', 'Не понимаю. / Не успеваю.', 'I don\'t understand.')]),
  s('ogarniesz', 'Ogarniesz to?', 'talk', 'casual', t('Впораєшся з цим? Розрулиш?', 'Справишься с этим? Разрулишь?', 'Can you handle it?'),
    t('Нормально між колегами на «ти»; з керівником — нейтральне формулювання.', 'Нормально между коллегами на «ты»; с руководителем — нейтральная формулировка.', 'Fine between colleagues.'),
    t('Прохання щось зробити чи організувати.', 'Просьба что-то сделать или организовать.', 'Asking someone to sort something out.'),
    ['Ogarniesz bilety na sobotę?', 'Jasne, ogarnę.', t('— Розрулиш квитки на суботу? — Звісно.', '— Разрулишь билеты на субботу? — Конечно.', '— Can you sort out tickets for Saturday? — Sure.')],
    ['Czy możesz się tym zająć?', t('Чи можеш цим зайнятися?', 'Можешь этим заняться?', 'Can you take care of it?')]),
  s('ogarnij-sie', 'Ogarnij się!', 'calm', 'rude', t('Візьми себе в руки!', 'Возьми себя в руки!', 'Get a grip!'),
    t('Різко, може образити. Лише з близькими, і то обережно.', 'Резко, может обидеть. Только с близкими, и то осторожно.', 'Harsh, can offend.'),
    t('Коли хтось поводиться безглуздо чи панікує.', 'Когда кто-то ведёт себя глупо или паникует.', 'When someone acts silly or panics.'),
    ['Znowu zapomniałem kluczy!', 'No ogarnij się!', t('— Я знову забув ключі! — Ну візьми себе в руки!', '— Я опять забыл ключи! — Ну возьми себя в руки!', '— I forgot my keys again! — Get a grip!')],
    ['Uspokój się. / Weź się w garść.', t('Заспокойся. / Візьми себе в руки.', 'Успокойся. / Возьми себя в руки.', 'Calm down. / Pull yourself together.')]),
  s('daj-spokoj', 'Daj spokój', 'calm', 'casual', t('Та годі, облиш', 'Да ладно, брось', 'Come on, leave it'),
    t('Нейтрально-розмовне, дуже частотне.', 'Нейтрально-разговорное, очень частотное.', 'Neutral-casual, very common.'),
    t('Заспокоїти, попросити не продовжувати.', 'Успокоить, попросить не продолжать.', 'Reassuring or asking someone to stop.'),
    ['Przepraszam, to moja wina.', 'Daj spokój, nic się nie stało.', t('— Вибач, це моя вина. — Та годі, нічого не сталося.', '— Извини, это моя вина. — Да брось, ничего не случилось.', '— Sorry, my fault. — Come on, it\'s nothing.')],
    ['Proszę przestać. / Nic się nie stało.', t('Будь ласка, припиніть. / Нічого не сталося.', 'Пожалуйста, перестаньте. / Ничего не случилось.', 'Please stop. / It\'s nothing.')]),
  s('nie-spinaj', 'Nie spinaj się', 'calm', 'casual', t('Не напружуйся, не нервуй', 'Не напрягайся, не нервничай', 'Don\'t stress'), FRIENDS,
    t('Коли друг нервує через дрібницю.', 'Когда друг нервничает из-за мелочи.', 'When a friend stresses over nothing.'),
    ['Jutro egzamin, a ja nic nie umiem!', 'Nie spinaj się, dasz radę.', t('— Завтра іспит, а я нічого не знаю! — Не нервуй, впораєшся.', '— Завтра экзамен, а я ничего не знаю! — Не напрягайся, справишься.', '— Exam tomorrow and I know nothing! — Don\'t stress, you\'ll do it.')],
    ['Nie denerwuj się.', t('Не нервуй.', 'Не нервничай.', 'Don\'t worry.')]),
  s('wyluzuj', 'Wyluzuj', 'calm', 'casual', t('Розслабся', 'Расслабься', 'Chill out'), FRIENDS,
    t('Порада заспокоїтися.', 'Совет успокоиться.', 'Telling someone to relax.'),
    ['Wszystko idzie źle!', 'Wyluzuj, zrobimy to razem.', t('— Усе йде погано! — Розслабся, зробимо це разом.', '— Всё идёт плохо! — Расслабься, сделаем это вместе.', '— Everything\'s going wrong! — Chill, we\'ll do it together.')],
    ['Spokojnie. / Odpręż się.', t('Спокійно. / Розслабся.', 'Спокойно. / Расслабься.', 'Calm down. / Relax.')]),
  s('co-ty-gadasz', 'Co ty gadasz?!', 'react', 'rude', t('Що ти таке кажеш?!', 'Что ты несёшь?!', 'What are you on about?!'),
    t('Сильна недовіра, звучить різко. Не з незнайомими й не на роботі.', 'Сильное недоверие, звучит резко. Не с незнакомыми и не на работе.', 'Strong disbelief, sounds sharp.'),
    t('Коли почуте здається абсурдним.', 'Когда услышанное кажется абсурдным.', 'When something sounds absurd.'),
    ['Polska wygrała mundial!', 'Co ty gadasz?!', t('— Польща виграла чемпіонат світу! — Що ти таке кажеш?!', '— Польша выиграла чемпионат мира! — Что ты несёшь?!', '— Poland won the World Cup! — What are you on about?!')],
    ['Naprawdę? / Co masz na myśli?', t('Справді? / Що ти маєш на увазі?', 'Правда? / Что ты имеешь в виду?', 'Really? / What do you mean?')]),
  s('mam-wywalone', 'Mam wywalone', 'calm', 'rude', t('Мені начхати', 'Мне плевать', 'I don\'t care'),
    t('Грубо й зневажливо (походить від вульгарного виразу). Ніколи на роботі, в листах, з незнайомими.', 'Грубо и пренебрежительно (происходит от вульгарного выражения). Никогда на работе, в письмах, с незнакомыми.', 'Rude and dismissive; never at work or in writing.'),
    t('Тільки в дуже неформальній розмові з близькими — і краще уникати.', 'Только в очень неформальном разговоре с близкими — и лучше избегать.', 'Only very informally — better avoided.'),
    ['Wszyscy mówią o tym serialu.', 'Mam wywalone na seriale.', t('— Усі говорять про цей серіал. — Мені начхати на серіали.', '— Все говорят об этом сериале. — Мне плевать на сериалы.', '— Everyone\'s talking about that show. — I don\'t care about shows.')],
    ['Nie obchodzi mnie to. / Jest mi to obojętne.', t('Мене це не обходить. / Мені це байдуже.', 'Меня это не волнует. / Мне это безразлично.', 'It doesn\'t matter to me.')]),
];

export const SLANG_GROUPS: Record<SlangGroup, I18n> = {
  greet: t('Привітання й прощання', 'Приветствия и прощания', 'Greetings & goodbyes'),
  people: t('Люди', 'Люди', 'People'),
  react: t('Реакції', 'Реакции', 'Reactions'),
  calm: t('Заспокоїти / порадити', 'Успокоить / посоветовать', 'Calming & advice'),
  talk: t('У розмові', 'В разговоре', 'In conversation'),
};

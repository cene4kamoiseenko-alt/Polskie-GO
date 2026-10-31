/** Квести, досягнення та косметика. */
import type { I18n } from '@polski-go/shared';
import { t } from './builders';

export type QuestSeed = {
  slug: string;
  kind: 'DAILY' | 'WEEKLY' | 'STORY';
  title: I18n;
  description: I18n;
  metric: string;
  target: number;
  xp: number;
  zlotki: number;
  icon: string;
  city?: string;
  rewardItem?: string;
  order?: number;
  stages?: StoryStage[];
};

/** Вузол сцени сюжетного квесту. */
export type StoryNode = {
  speaker: 'npc' | 'beaver' | 'narrator';
  name?: string;
  emoji?: string;
  pl: string;
  tr: I18n;
  choices?: { pl: string; tr: I18n; ok: boolean; next?: string; feedback?: I18n }[];
  next?: string;
  end?: boolean;
};
export type StoryStage = { title: I18n; start: string; nodes: Record<string, StoryNode> };

export const DAILY_QUESTS: QuestSeed[] = [
  { slug: 'd-lesson-1', kind: 'DAILY', title: t('Пройди урок', 'Пройди урок', 'Complete a lesson'), description: t('Заверши 1 урок', 'Заверши 1 урок', 'Finish 1 lesson'), metric: 'LESSONS', target: 1, xp: 30, zlotki: 10, icon: '📗' },
  { slug: 'd-lessons-3', kind: 'DAILY', title: t('Три уроки', 'Три урока', 'Three lessons'), description: t('Заверши 3 уроки', 'Заверши 3 урока', 'Finish 3 lessons'), metric: 'LESSONS', target: 3, xp: 50, zlotki: 15, icon: '📚' },
  { slug: 'd-xp-100', kind: 'DAILY', title: t('Сотня XP', 'Сотня XP', '100 XP'), description: t('Отримай 100 XP', 'Получи 100 XP', 'Earn 100 XP'), metric: 'XP', target: 100, xp: 30, zlotki: 10, icon: '⭐' },
  { slug: 'd-words-10', kind: 'DAILY', title: t('Нові слова', 'Новые слова', 'New words'), description: t('Вивчи 10 нових слів', 'Выучи 10 новых слов', 'Learn 10 new words'), metric: 'NEW_WORDS', target: 10, xp: 30, zlotki: 10, icon: '📖' },
  { slug: 'd-perfect-5', kind: 'DAILY', title: t('Без помилок', 'Без ошибок', 'Flawless'), description: t('Виконай 5 завдань поспіль без помилки', 'Выполни 5 заданий подряд без ошибки', 'Answer 5 in a row correctly'), metric: 'PERFECT_STREAK', target: 5, xp: 30, zlotki: 10, icon: '🎯' },
  { slug: 'd-reviews-15', kind: 'DAILY', title: t('Повторення', 'Повторение', 'Review'), description: t('Повтори 15 старих слів', 'Повтори 15 старых слов', 'Review 15 words'), metric: 'REVIEWS', target: 15, xp: 30, zlotki: 10, icon: '🔁' },
  { slug: 'd-dialogue-1', kind: 'DAILY', title: t('Поговори', 'Поговори', 'Chat'), description: t('Заверши розмовний діалог', 'Заверши разговорный диалог', 'Complete a dialogue'), metric: 'DIALOGUES', target: 1, xp: 30, zlotki: 10, icon: '💬' },
  { slug: 'd-listening-5', kind: 'DAILY', title: t('Слухай уважно', 'Слушай внимательно', 'Listen up'), description: t('Виконай 5 вправ на аудіювання', 'Выполни 5 упражнений на аудирование', 'Do 5 listening exercises'), metric: 'LISTENING', target: 5, xp: 30, zlotki: 10, icon: '🎧' },
];

export const WEEKLY_QUESTS: QuestSeed[] = [
  { slug: 'w-lessons-20', kind: 'WEEKLY', title: t('Марафонець', 'Марафонец', 'Marathoner'), description: t('Пройди 20 уроків за тиждень', 'Пройди 20 уроков за неделю', 'Finish 20 lessons this week'), metric: 'LESSONS', target: 20, xp: 150, zlotki: 50, icon: '🏃' },
  { slug: 'w-words-50', kind: 'WEEKLY', title: t('Словниковий запас', 'Словарный запас', 'Word hoard'), description: t('Вивчи 50 нових слів', 'Выучи 50 новых слов', 'Learn 50 new words'), metric: 'NEW_WORDS', target: 50, xp: 100, zlotki: 40, icon: '🧠' },
  { slug: 'w-city-1', kind: 'WEEKLY', title: t('Нове місто', 'Новый город', 'New city'), description: t('Пройди іспит міста', 'Пройди экзамен города', 'Pass a city exam'), metric: 'CITY_COMPLETED', target: 1, xp: 100, zlotki: 50, icon: '🗺️' },
  { slug: 'w-listening-20', kind: 'WEEKLY', title: t('Аудіо-тиждень', 'Аудио-неделя', 'Audio week'), description: t('Виконай 20 аудіювань', 'Выполни 20 аудирований', 'Do 20 listening exercises'), metric: 'LISTENING', target: 20, xp: 100, zlotki: 30, icon: '🎧' },
  { slug: 'w-dialogues-3', kind: 'WEEKLY', title: t('Балакун', 'Болтун', 'Chatterbox'), description: t('Проведи 3 розмовні практики', 'Проведи 3 разговорные практики', 'Complete 3 dialogues'), metric: 'DIALOGUES', target: 3, xp: 100, zlotki: 30, icon: '🗣️' },
];

const BEAVER = { speaker: 'beaver' as const, name: 'Bobek', emoji: '🦫' };

export const STORY_QUESTS: QuestSeed[] = [
  {
    slug: 's-warszawa-dworzec', kind: 'STORY', city: 'warszawa', icon: '🚉', order: 1,
    title: t('Бобер прибуває до Варшави', 'Бобр прибывает в Варшаву', 'Bobek arrives in Warsaw'),
    description: t('Бобек вийшов з потяга на Центральному вокзалі. Допоможи йому познайомитися з першою полькою!', 'Бобек вышел из поезда на Центральном вокзале. Помоги ему познакомиться с первой полькой!', 'Bobek has just stepped off the train. Help him meet his first Polish friend!'),
    metric: 'STORY', target: 2, xp: 50, zlotki: 30, rewardItem: 'scarf-pl',
    stages: [
      {
        title: t('Перша зустріч', 'Первая встреча', 'First meeting'), start: 'a',
        nodes: {
          a: { speaker: 'narrator', pl: 'Warszawa Centralna. Godzina 9:00.', tr: t('Варшава-Центральна. 9:00 ранку.', 'Варшава-Центральная. 9:00 утра.', 'Warsaw Central. 9 a.m.'), next: 'b' },
          b: { speaker: 'npc', name: 'Zosia', emoji: '👩🏼', pl: 'Dzień dobry! Pan jest turystą?', tr: t('Добрий день! Ви турист?', 'Добрый день! Вы турист?', 'Good morning! Are you a tourist?'),
            choices: [
              { pl: 'Dzień dobry! Tak, jestem z Ukrainy.', tr: t('Добрий день! Так, я з України.', 'Добрый день! Да, я из Украины.', 'Good morning! Yes, I\'m from Ukraine.'), ok: true, next: 'c' },
              { pl: 'Dobranoc!', tr: t('На добраніч!', 'Спокойной ночи!', 'Good night!'), ok: false, feedback: t('Зараз ранок! Привітайся: **Dzień dobry!**', 'Сейчас утро! Поздоровайся: **Dzień dobry!**', 'It\'s morning! Say **Dzień dobry!**') },
            ] },
          c: { speaker: 'npc', name: 'Zosia', emoji: '👩🏼', pl: 'Super! Mam na imię Zosia. A pan?', tr: t('Супер! Мене звати Зося. А вас?', 'Супер! Меня зовут Зося. А вас?', 'Great! My name is Zosia. And you?'),
            choices: [
              { pl: 'Mam na imię Bobek. Miło mi!', tr: t('Мене звати Бобек. Приємно!', 'Меня зовут Бобек. Приятно!', 'My name is Bobek. Nice to meet you!'), ok: true, next: 'd' },
              { pl: 'Mam dwadzieścia lat.', tr: t('Мені двадцять років.', 'Мне двадцать лет.', 'I\'m twenty.'), ok: false, feedback: t('Зося питає ім\'я, а не вік.', 'Зося спрашивает имя, а не возраст.', 'Zosia asks your name, not your age.') },
            ] },
          d: { speaker: 'npc', name: 'Zosia', emoji: '👩🏼', pl: 'Mnie też miło! Witamy w Warszawie!', tr: t('Мені теж приємно! Ласкаво просимо до Варшави!', 'Мне тоже приятно! Добро пожаловать в Варшаву!', 'Nice to meet you too! Welcome to Warsaw!'), end: true },
        },
      },
      {
        title: t('Де зупинка?', 'Где остановка?', 'Where is the stop?'), start: 'a',
        nodes: {
          a: { ...BEAVER, pl: '(Bobek chce jechać do centrum, ale nie wie, gdzie jest tramwaj.)', tr: t('(Бобек хоче поїхати в центр, але не знає, де трамвай.)', '(Бобек хочет поехать в центр, но не знает, где трамвай.)', '(Bobek wants to go downtown but doesn\'t know where the tram is.)'),
            choices: [
              { pl: 'Przepraszam, gdzie jest tramwaj?', tr: t('Перепрошую, де трамвай?', 'Извините, где трамвай?', 'Excuse me, where is the tram?'), ok: true, next: 'b' },
              { pl: 'Przepraszam, gdzie jest metro?', tr: t('Перепрошую, де метро?', 'Извините, где метро?', 'Excuse me, where is the metro?'), ok: true, next: 'm' },
              { pl: 'Smacznego, gdzie?', tr: t('Смачного, де?', 'Приятного аппетита, где?', 'Enjoy your meal, where?'), ok: false, feedback: t('Щоб звернутися до незнайомця, скажи **Przepraszam**.', 'Чтобы обратиться к незнакомцу, скажи **Przepraszam**.', 'To get a stranger\'s attention say **Przepraszam**.') },
            ] },
          b: { speaker: 'npc', name: 'Zosia', emoji: '👩🏼', pl: 'Przystanek jest tam, prosto.', tr: t('Зупинка там, прямо.', 'Остановка там, прямо.', 'The stop is over there, straight on.'), next: 'z' },
          m: { speaker: 'npc', name: 'Zosia', emoji: '👩🏼', pl: 'Metro jest tam, w lewo.', tr: t('Метро там, ліворуч.', 'Метро там, налево.', 'The metro is there, to the left.'), next: 'z' },
          z: { ...BEAVER, pl: 'Dziękuję bardzo! Do widzenia!', tr: t('Дуже дякую! До побачення!', 'Большое спасибо! До свидания!', 'Thank you very much! Goodbye!'), end: true },
        },
      },
    ],
  },
  {
    slug: 's-krakow-mieszkanie', kind: 'STORY', city: 'krakow', icon: '🔑', order: 2,
    title: t('Бобер шукає квартиру', 'Бобр ищет квартиру', 'Bobek looks for a flat'),
    description: t('У Кракові Бобек оглядає квартиру. Поговори з власницею!', 'В Кракове Бобек смотрит квартиру. Поговори с хозяйкой!', 'In Kraków Bobek views a flat. Talk to the landlady!'),
    metric: 'STORY', target: 1, xp: 50, zlotki: 30, rewardItem: 'rug-red',
    stages: [
      {
        title: t('Огляд квартири', 'Просмотр квартиры', 'Flat viewing'), start: 'a',
        nodes: {
          a: { speaker: 'npc', name: 'Pani Halina', emoji: '👵🏼', pl: 'Dzień dobry! To jest mieszkanie. Ma dwa pokoje, kuchnię i łazienkę.', tr: t('Добрий день! Ось квартира. Тут дві кімнати, кухня і ванна.', 'Добрый день! Вот квартира. Две комнаты, кухня и ванная.', 'Hello! This is the flat. It has two rooms, a kitchen and a bathroom.'),
            choices: [
              { pl: 'Dzień dobry! Ile kosztuje mieszkanie?', tr: t('Добрий день! Скільки коштує квартира?', 'Добрый день! Сколько стоит квартира?', 'Hello! How much is the flat?'), ok: true, next: 'price' },
              { pl: 'Czy kuchnia jest duża?', tr: t('Кухня велика?', 'Кухня большая?', 'Is the kitchen big?'), ok: true, next: 'kitchen' },
              { pl: 'Mam na imię kanapa.', tr: t('Мене звати диван.', 'Меня зовут диван.', 'My name is sofa.'), ok: false, feedback: t('Хм… краще запитай про ціну або кухню.', 'Хм… лучше спроси про цену или кухню.', 'Hmm… better ask about the price or the kitchen.') },
            ] },
          kitchen: { speaker: 'npc', name: 'Pani Halina', emoji: '👵🏼', pl: 'Tak, kuchnia jest duża, a pokoje są małe.', tr: t('Так, кухня велика, а кімнати маленькі.', 'Да, кухня большая, а комнаты маленькие.', 'Yes, the kitchen is big, but the rooms are small.'),
            choices: [
              { pl: 'Dobrze. A ile kosztuje?', tr: t('Добре. А скільки коштує?', 'Хорошо. А сколько стоит?', 'OK. And how much is it?'), ok: true, next: 'price' },
              { pl: 'Dobranoc.', tr: t('На добраніч.', 'Спокойной ночи.', 'Good night.'), ok: false, feedback: t('Розмова ще не закінчилась — запитай ціну.', 'Разговор ещё не закончен — спроси цену.', 'The talk isn\'t over — ask the price.') },
            ] },
          price: { speaker: 'npc', name: 'Pani Halina', emoji: '👵🏼', pl: 'Dwa tysiące złotych miesięcznie. Ma pan kota albo psa?', tr: t('Дві тисячі злотих на місяць. У вас є кіт або пес?', 'Две тысячи злотых в месяц. У вас есть кот или собака?', 'Two thousand zlotys a month. Do you have a cat or a dog?'),
            choices: [
              { pl: 'Nie, nie mam.', tr: t('Ні, немає.', 'Нет, нету.', 'No, I don\'t.'), ok: true, next: 'deal' },
              { pl: 'Tak, mam kota.', tr: t('Так, у мене є кіт.', 'Да, у меня есть кот.', 'Yes, I have a cat.'), ok: true, next: 'cat' },
              { pl: 'Tak, mam kot.', tr: t('(помилка у відмінку)', '(ошибка в падеже)', '(case error)'), ok: false, feedback: t('Після **mam**: kot → **kota**.', 'После **mam**: kot → **kota**.', 'After **mam**: kot → **kota**.') },
            ] },
          cat: { speaker: 'npc', name: 'Pani Halina', emoji: '👵🏼', pl: 'Kot? Dobrze, lubię koty! Ale proszę uważać na dywan.', tr: t('Кіт? Добре, люблю котів! Але бережіть килим.', 'Кот? Хорошо, люблю котов! Но берегите ковёр.', 'A cat? Fine, I like cats! But mind the carpet.'), next: 'deal' },
          deal: { ...BEAVER, pl: 'Biorę to mieszkanie! Dziękuję!', tr: t('Беру цю квартиру! Дякую!', 'Беру эту квартиру! Спасибо!', 'I\'ll take this flat! Thank you!'), end: true },
        },
      },
    ],
  },
  {
    slug: 's-wroclaw-zgubiony', kind: 'STORY', city: 'wroclaw', icon: '🧭', order: 3,
    title: t('Бобер загубився у Вроцлаві', 'Бобр потерялся во Вроцлаве', 'Bobek is lost in Wrocław'),
    description: t('Бобек шукає Ринкову площу. Допоможи йому зрозуміти напрямки польською!', 'Бобек ищет Рыночную площадь. Помоги ему понять направления по-польски!', 'Bobek is looking for the Market Square. Help him understand directions!'),
    metric: 'STORY', target: 2, xp: 50, zlotki: 30, rewardItem: 'hat-krasnal',
    stages: [
      {
        title: t('Запитай дорогу', 'Спроси дорогу', 'Ask the way'), start: 'a',
        nodes: {
          a: { ...BEAVER, pl: '(Bobek stoi na moście. Gdzie jest Rynek?)', tr: t('(Бобек стоїть на мосту. Де Ринок?)', '(Бобек стоит на мосту. Где Рынок?)', '(Bobek is standing on a bridge. Where is the Market Square?)'),
            choices: [
              { pl: 'Przepraszam, gdzie jest Rynek?', tr: t('Перепрошую, де Ринок?', 'Извините, где Рынок?', 'Excuse me, where is the Market Square?'), ok: true, next: 'b' },
              { pl: 'Poproszę Rynek.', tr: t('Ринок, будь ласка.', 'Рынок, пожалуйста.', 'A market square, please.'), ok: false, feedback: t('Ринок не купують 🙂 Запитай: **Gdzie jest Rynek?**', 'Рынок не покупают 🙂 Спроси: **Gdzie jest Rynek?**', 'You can\'t buy a square 🙂 Ask: **Gdzie jest Rynek?**') },
            ] },
          b: { speaker: 'npc', name: 'Pan Jurek', emoji: '👨🏻‍🦳', pl: 'Rynek? Proszę iść prosto, potem w lewo.', tr: t('Ринок? Ідіть прямо, потім ліворуч.', 'Рынок? Идите прямо, потом налево.', 'The Market Square? Go straight, then left.'),
            choices: [
              { pl: '(Iść prosto i skręcić w lewo ⬆️⬅️)', tr: t('(Іти прямо і повернути ліворуч)', '(Идти прямо и повернуть налево)', '(Go straight and turn left)'), ok: true, next: 'c' },
              { pl: '(Skręcić w prawo ➡️)', tr: t('(Повернути праворуч)', '(Повернуть направо)', '(Turn right)'), ok: false, feedback: t('**w lewo** — ліворуч, **w prawo** — праворуч.', '**w lewo** — налево, **w prawo** — направо.', '**w lewo** = left, **w prawo** = right.') },
            ] },
          c: { speaker: 'narrator', pl: 'Bobek idzie prosto i skręca w lewo. Widzi kolorowe kamienice!', tr: t('Бобек іде прямо і повертає ліворуч. Він бачить кольорові кам\'яниці!', 'Бобек идёт прямо и поворачивает налево. Он видит цветные дома!', 'Bobek goes straight and turns left. He sees colourful houses!'), end: true },
        },
      },
      {
        title: t('Гном на Ринку', 'Гном на Рынке', 'The gnome on the square'), start: 'a',
        nodes: {
          a: { speaker: 'npc', name: 'Krasnal Papa', emoji: '🧙🏻‍♂️', pl: 'Cześć, bobrze! Szukasz czegoś?', tr: t('Привіт, бобре! Щось шукаєш?', 'Привет, бобр! Что-то ищешь?', 'Hi, beaver! Looking for something?'),
            choices: [
              { pl: 'Tak, gdzie jest kawiarnia?', tr: t('Так, де кав\'ярня?', 'Да, где кофейня?', 'Yes, where is a café?'), ok: true, next: 'cafe' },
              { pl: 'Tak, gdzie jest dworzec?', tr: t('Так, де вокзал?', 'Да, где вокзал?', 'Yes, where is the station?'), ok: true, next: 'station' },
              { pl: 'Tak, mam brata.', tr: t('Так, у мене є брат.', 'Да, у меня есть брат.', 'Yes, I have a brother.'), ok: false, feedback: t('Гном питає, що ти шукаєш. Запитай: **Gdzie jest…?**', 'Гном спрашивает, что ты ищешь. Спроси: **Gdzie jest…?**', 'The gnome asks what you\'re looking for. Ask **Gdzie jest…?**') },
            ] },
          cafe: { speaker: 'npc', name: 'Krasnal Papa', emoji: '🧙🏻‍♂️', pl: 'Kawiarnia jest tutaj, w prawo. Smacznej kawy!', tr: t('Кав\'ярня тут, праворуч. Смачної кави!', 'Кофейня здесь, направо. Вкусного кофе!', 'The café is right here, on the right. Enjoy your coffee!'), next: 'end' },
          station: { speaker: 'npc', name: 'Krasnal Papa', emoji: '🧙🏻‍♂️', pl: 'Dworzec jest daleko. Proszę jechać tramwajem.', tr: t('Вокзал далеко. Їдьте трамваєм.', 'Вокзал далеко. Поезжайте на трамвае.', 'The station is far. Take a tram.'), next: 'end' },
          end: { ...BEAVER, pl: 'Dziękuję, krasnalu! Na razie!', tr: t('Дякую, гноме! Бувай!', 'Спасибо, гном! Пока!', 'Thanks, gnome! See you!'), end: true },
        },
      },
    ],
  },
];

export type AchievementSeed = { slug: string; title: I18n; description: I18n; icon: string; metric: string; threshold: number; zlotki: number; rewardItem?: string };

export const ACHIEVEMENTS: AchievementSeed[] = [
  { slug: 'first-lesson', title: t('Перші кроки', 'Первые шаги', 'First steps'), description: t('Пройди перший урок', 'Пройди первый урок', 'Finish your first lesson'), icon: '🐾', metric: 'LESSONS', threshold: 1, zlotki: 10 },
  { slug: 'lessons-10', title: t('Учень', 'Ученик', 'Apprentice'), description: t('Пройди 10 уроків', 'Пройди 10 уроков', 'Finish 10 lessons'), icon: '📘', metric: 'LESSONS', threshold: 10, zlotki: 30 },
  { slug: 'lessons-50', title: t('Знавець', 'Знаток', 'Scholar'), description: t('Пройди 50 уроків', 'Пройди 50 уроков', 'Finish 50 lessons'), icon: '🎓', metric: 'LESSONS', threshold: 50, zlotki: 100 },
  { slug: 'streak-3', title: t('Розігрів', 'Разогрев', 'Warming up'), description: t('3 дні поспіль', '3 дня подряд', '3-day streak'), icon: '🔥', metric: 'STREAK', threshold: 3, zlotki: 15 },
  { slug: 'streak-7', title: t('7 днів поспіль', '7 дней подряд', '7-day streak'), description: t('Займайся 7 днів поспіль', 'Занимайся 7 дней подряд', 'Learn 7 days in a row'), icon: '🔥', metric: 'STREAK', threshold: 7, zlotki: 50, rewardItem: 'glasses-sun' },
  { slug: 'streak-30', title: t('Залізна воля', 'Железная воля', 'Iron will'), description: t('30 днів поспіль', '30 дней подряд', '30-day streak'), icon: '💪', metric: 'STREAK', threshold: 30, zlotki: 200 },
  { slug: 'words-25', title: t('Перша сторінка', 'Первая страница', 'First page'), description: t('Вивчи 25 слів', 'Выучи 25 слов', 'Learn 25 words'), icon: '📖', metric: 'WORDS', threshold: 25, zlotki: 20 },
  { slug: 'words-100', title: t('Ходячий словник', 'Ходячий словарь', 'Walking dictionary'), description: t('Вивчи 100 слів', 'Выучи 100 слов', 'Learn 100 words'), icon: '📚', metric: 'WORDS', threshold: 100, zlotki: 80 },
  { slug: 'xp-1000', title: t('Тисячник', 'Тысячник', 'Thousand club'), description: t('Набери 1000 XP', 'Набери 1000 XP', 'Earn 1000 XP'), icon: '⭐', metric: 'XP', threshold: 1000, zlotki: 50 },
  { slug: 'perfect-1', title: t('Ідеально!', 'Идеально!', 'Perfect!'), description: t('Пройди урок без жодної помилки', 'Пройди урок без единой ошибки', 'Finish a lesson without mistakes'), icon: '💯', metric: 'PERFECT_LESSONS', threshold: 1, zlotki: 15 },
  { slug: 'perfect-10', title: t('Майстер квізів', 'Мастер квизов', 'Quiz master'), description: t('10 ідеальних уроків', '10 идеальных уроков', '10 perfect lessons'), icon: '🧠', metric: 'PERFECT_LESSONS', threshold: 10, zlotki: 60, rewardItem: 'glasses-round' },
  { slug: 'city-1', title: t('Мандрівник', 'Путешественник', 'Traveller'), description: t('Пройди іспит першого міста', 'Пройди экзамен первого города', 'Pass your first city exam'), icon: '🎫', metric: 'CITIES', threshold: 1, zlotki: 40 },
  { slug: 'city-3', title: t('Відкривач Польщі', 'Открыватель Польши', 'Explorer of Poland'), description: t('Пройди 3 міста', 'Пройди 3 города', 'Complete 3 cities'), icon: '🗺️', metric: 'CITIES', threshold: 3, zlotki: 100, rewardItem: 'backpack-map' },
  { slug: 'purchase-1', title: t('Модник', 'Модник', 'Fashionista'), description: t('Купи перший предмет для бобра', 'Купи первый предмет для бобра', 'Buy your first item'), icon: '🛍️', metric: 'PURCHASES', threshold: 1, zlotki: 10 },
  { slug: 'friends-1', title: t('Компанія', 'Компания', 'Good company'), description: t('Додай першого друга', 'Добавь первого друга', 'Add your first friend'), icon: '🤝', metric: 'FRIENDS', threshold: 1, zlotki: 20 },
  { slug: 'story-1', title: t('Оповідач', 'Рассказчик', 'Storyteller'), description: t('Заверши сюжетний квест', 'Заверши сюжетный квест', 'Finish a story quest'), icon: '📜', metric: 'STORY_QUESTS', threshold: 1, zlotki: 20 },
  // ── Польська в житті та навчання (умови перевіряються сервером; усе — навчальні сценарії) ──
  { slug: 'pierwsza-zabka', icon: 'snack-bag', metric: 'MISSION:zabka-first-order', threshold: 1, zlotki: 20,
    title: t('Pierwsza Żabka', 'Pierwsza Żabka', 'Pierwsza Żabka'),
    description: t('Вперше завершити навчальний діалог замовлення в Żabce.', 'Впервые завершить учебный диалог заказа в Żabce.', 'Finish the Żabka ordering practice dialogue for the first time.') },
  { slug: 'bez-zaminki', icon: 'receipt-check', metric: 'FLAWLESS_TAG:checkout', threshold: 1, zlotki: 30,
    title: t('Без заминки біля каси', 'Без заминки у кассы', 'Smooth at the checkout'),
    description: t('Пройти навчальну місію з покупкою на касі без підказок і помилок — кожен крок з першої спроби.', 'Пройти учебную миссию с покупкой на кассе без подсказок и ошибок — каждый шаг с первой попытки.', 'Complete a checkout practice mission with no hints or mistakes.') },
  { slug: 'lowca-zakupow', icon: 'basket', metric: 'MISSIONS_TAG:store', threshold: 5, zlotki: 50,
    title: t('Мисливець за покупками', 'Охотник за покупками', 'Shopping hunter'),
    description: t('Правильно пройти 5 різних навчальних місій у магазинах.', 'Правильно пройти 5 разных учебных миссий в магазинах.', 'Complete 5 different shop practice missions.') },
  { slug: 'pierogowy-ekspert', icon: 'pierogi-plate', metric: 'PIEROGI', threshold: 11, zlotki: 40,
    title: t('Pierogowy ekspert', 'Pierogowy ekspert', 'Pierogowy ekspert'),
    description: t('Правильно згадати в повторенні 10 виразів теми pierogi (10 кроків) і пройти місію «Pierogi у Кракові» (ще 1).', 'Правильно вспомнить в повторении 10 выражений темы pierogi (10 шагов) и пройти миссию «Pierogi в Кракове» (ещё 1).', 'Recall 10 pierogi phrases in review and complete the “Pierogi in Kraków” mission.') },
  { slug: 'lowca-smakow', icon: 'dishes', metric: 'DISHES', threshold: 8, zlotki: 60,
    title: t('Łowca smaków', 'Łowca smaków', 'Łowca smaków'),
    description: t('Розв’язати в місіях завдання про 8 польських страв: pierogi, żurek, parówki, bigos, placki, zapiekanka, pączki, sernik.', 'Решить в миссиях задания о 8 польских блюдах: pierogi, żurek, parówki, bigos, placki, zapiekanka, pączki, sernik.', 'Solve mission tasks about 8 Polish dishes.') },
  { slug: 'zurek-poprosze', icon: 'soup-bowl', metric: 'MISSION:krakow-pierogi', threshold: 1, zlotki: 20,
    title: t('Żurek? Poproszę!', 'Żurek? Poproszę!', 'Żurek? Poproszę!'),
    description: t('Успішно замовити żurek у навчальному діалозі «Pierogi у Кракові».', 'Успешно заказать żurek в учебном диалоге «Pierogi в Кракове».', 'Order żurek in the “Pierogi in Kraków” practice dialogue.') },
  { slug: 'kawowy-postoj', icon: 'coffee-cup', metric: 'MISSION:orlen-coffee', threshold: 1, zlotki: 20,
    title: t('Кавова зупинка', 'Кофейная остановка', 'Coffee stop'),
    description: t('Завершити навчальну місію із замовленням кави на заправці.', 'Завершить учебную миссию с заказом кофе на заправке.', 'Finish the petrol-station coffee practice mission.') },
  { slug: 'kolumna-trzy', icon: 'fuel-pump', metric: 'MISSION:orlen-pump', threshold: 1, zlotki: 20,
    title: t('Колонка номер три', 'Колонка номер три', 'Pump number three'),
    description: t('Пройти навчальний діалог оплати пального.', 'Пройти учебный диалог оплаты топлива.', 'Complete the fuel payment practice dialogue.') },
  { slug: 'paczka-odebrana', icon: 'parcel-locker', metric: 'MISSION:paczkomat', threshold: 1, zlotki: 20,
    title: t('Посилку отримано', 'Посылка получена', 'Parcel collected'),
    description: t('Завершити навчальну місію з поштоматом.', 'Завершить учебную миссию с постаматом.', 'Finish the parcel-locker practice mission.') },
  { slug: 'swoj-w-tramwaju', icon: 'tram', metric: 'STEPS_TAG:city-transport', threshold: 5, zlotki: 40,
    title: t('Свій у трамваї', 'Свой в трамвае', 'At home on the tram'),
    description: t('Правильно, з першої спроби, розв’язати 5 різних ситуацій із міським транспортом у місіях.', 'Правильно, с первой попытки, решить 5 разных ситуаций с городским транспортом в миссиях.', 'Solve 5 different city-transport situations on the first try.') },
  { slug: 'pociag-odjezdza', icon: 'train-ticket', metric: 'MISSION:train-wroclaw', threshold: 1, zlotki: 20,
    title: t('Потяг відправляється', 'Поезд отправляется', 'The train is leaving'),
    description: t('Завершити навчальну місію з купівлею залізничного квитка.', 'Завершить учебную миссию с покупкой железнодорожного билета.', 'Finish the train-ticket practice mission.') },
  { slug: 'pierwszy-urzad', icon: 'office', metric: 'MISSION:urzad-pesel', threshold: 1, zlotki: 20,
    title: t('Перший візит до urzędu', 'Первый визит в urząd', 'First visit to the urząd'),
    description: t('Завершити навчальну місію в urzędzie: номерок, віконце, заява на PESEL.', 'Завершить учебную миссию в urzędzie: номерок, окошко, заявление на PESEL.', 'Finish the urząd practice mission: ticket, counter, PESEL application.') },
  { slug: 'bobr-podroznik', icon: 'backpack-patches', metric: 'SECTIONS', threshold: 3, zlotki: 60,
    title: t('Бобер-мандрівник', 'Бобр-путешественник', 'Beaver traveller'),
    description: t('Пройти всі уроки першого розділу у 3 містах.', 'Пройти все уроки первого раздела в 3 городах.', 'Finish the first section in 3 cities.') },
  { slug: 'polska-blizej', icon: 'map-pins', metric: 'SECTIONS', threshold: 10, zlotki: 150,
    title: t('Польща стає ближчою', 'Польша становится ближе', 'Poland is getting closer'),
    description: t('Пройти всі уроки першого розділу в 10 містах.', 'Пройти все уроки первого раздела в 10 городах.', 'Finish the first section in 10 cities.') },
  { slug: 'slysze-po-polsku', icon: 'headphones', metric: 'AUDIO', threshold: 20, zlotki: 40,
    title: t('Чую польською', 'Слышу по-польски', 'I hear Polish'),
    description: t('Правильно виконати 20 різних аудіозавдань.', 'Правильно выполнить 20 разных аудиозаданий.', 'Correctly complete 20 different listening tasks.') },
  { slug: 'bledy-w-doswiadczenie', icon: 'bridge', metric: 'MISTAKES_FIXED', threshold: 20, zlotki: 40,
    title: t('Помилки — у досвід', 'Ошибки — в опыт', 'Mistakes into experience'),
    description: t('Успішно повторити в «Моїх помилках» 20 завдань, де раніше була помилка.', 'Успешно повторить в «Моих ошибках» 20 заданий, где раньше была ошибка.', 'Correctly redo 20 tasks from “My mistakes”.') },
  { slug: 'pamietam-dlugo', icon: 'book-clock', metric: 'LONG_RECALL', threshold: 30, zlotki: 60,
    title: t('Пам’ятаю надовго', 'Помню надолго', 'Long memory'),
    description: t('Правильно згадати 30 слів після призначеного інтервалу повторення.', 'Правильно вспомнить 30 слов после назначенного интервала повторения.', 'Recall 30 words correctly after their review interval.') },
  { slug: 'pierwsza-rozmowa', icon: 'speech', metric: 'DIALOGS', threshold: 1, zlotki: 15,
    title: t('Перша розмова', 'Первый разговор', 'First conversation'),
    description: t('Завершити перший багатокроковий діалог — місію або сюжетний квест.', 'Завершить первый многошаговый диалог — миссию или сюжетный квест.', 'Finish your first multi-step dialogue.') },
  { slug: 'siedem-dni', icon: 'paws', metric: 'GOAL_DAYS', threshold: 7, zlotki: 70,
    title: t('Сім днів із бобром', 'Семь дней с бобром', 'Seven days with the beaver'),
    description: t('Виконувати денну навчальну мету 7 днів поспіль.', 'Выполнять дневную учебную цель 7 дней подряд.', 'Meet your daily goal 7 days in a row.') },
  { slug: 'pierwsze-slowo', icon: 'book-clock', metric: 'WORDS', threshold: 1, zlotki: 5,
    title: t('Pierwsze słowo', 'Pierwsze słowo', 'Pierwsze słowo'),
    description: t('Завершити урок і отримати перше слово у свій словник.', 'Завершить урок и получить первое слово в свой словарь.', 'Finish a lesson and get your first word into your dictionary.') },
  { slug: 'krol-gramatyki', icon: 'receipt-check', metric: 'SKILL_OK:grammar', threshold: 50, zlotki: 60,
    title: t('Król gramatyki', 'Król gramatyki', 'Król gramatyki'),
    description: t('Правильно виконати 50 різних граматичних завдань.', 'Правильно выполнить 50 разных грамматических заданий.', 'Correctly complete 50 different grammar tasks.') },
  { slug: 'poliglota', icon: 'dishes', metric: 'WORDS_LEARNED', threshold: 500, zlotki: 200,
    title: t('Poliglota', 'Poliglota', 'Poliglota'),
    description: t('Вивчити 500 слів (кожне — після трьох успішних повторень).', 'Выучить 500 слов (каждое — после трёх успешных повторений).', 'Learn 500 words.') },
  { slug: 'polski-ziomek', icon: 'speech', metric: 'LESSONS_DONE:opo-1-siema,opo-2-reakcje,opo-3-ogarniac', threshold: 3, zlotki: 40,
    title: t('Polski ziomek', 'Polski ziomek', 'Polski ziomek'),
    description: t('Пройти три уроки «Żywy polski» в Ополі: привітання, реакції та ogarniać.', 'Пройти три урока «Żywy polski» в Ополе: приветствия, реакции и ogarniać.', 'Finish the three Żywy polski lessons in Opole.') },
  { slug: 'mistrz-wymowy', icon: 'headphones', metric: 'TYPE_OK:PRONUNCIATION', threshold: 15, zlotki: 50,
    title: t('Mistrz wymowy', 'Mistrz wymowy', 'Mistrz wymowy'),
    description: t('15 різних фраз, які телефон правильно розпізнав у завданнях на вимову (перевірка розпізнаваності, не фонетична оцінка).', '15 разных фраз, правильно распознанных телефоном в заданиях на произношение (проверка распознаваемости, не фонетическая оценка).', '15 different phrases correctly recognised in speaking tasks.') },
  // ── Пропуск місяця: усі місії сезону (content/seasons.ts; тег місії season-<slug>) ──
  { slug: 'sezon-listopad', icon: 'season-rogal', metric: 'MISSIONS_TAG:season-listopad-poznan', threshold: 3, zlotki: 150,
    title: t('Листопад у Познані', 'Ноябрь в Познани', 'November in Poznań'),
    description: t('Пройти всі місії пропуску «Листопад у Познані»: рогалі, 11 листопада й анджейки.', 'Пройти все миссии пропуска «Ноябрь в Познани»: рогалики, 11 ноября и анджейки.', 'Complete every mission of the “November in Poznań” pass.') },
  { slug: 'sezon-swieta', icon: 'season-gift', metric: 'MISSIONS_TAG:season-swieta', threshold: 3, zlotki: 150,
    title: t('Польське Різдво', 'Польское Рождество', 'Christmas in Poland'),
    description: t('Пройти всі місії пропуску «Польське Різдво»: ярмарок, Вігілія й Сильвестр.', 'Пройти все миссии пропуска «Польское Рождество»: ярмарка, Вигилия и Сильвестр.', 'Complete every mission of the “Christmas in Poland” pass.') },
  { slug: 'sezon-park', icon: 'season-ticket', metric: 'MISSIONS_TAG:season-energylandia', threshold: 3, zlotki: 150,
    title: t('День у парку розваг', 'День в парке развлечений', 'A day at the amusement park'),
    description: t('Пройти всі місії пропуску «Поїздка до Energylandii»: квитки, гірки й загублений телефон.', 'Пройти все миссии пропуска «Поездка в Energylandię»: билеты, горки и потерянный телефон.', 'Complete every mission of the amusement-park pass.') },
  { slug: 'powrot', icon: 'beaver-map', metric: 'RETURN', threshold: 1, zlotki: 30,
    title: t('Повернення в дорогу', 'Возвращение в путь', 'Back on the road'),
    description: t('Завершити урок після перерви від 7 днів. Бобек радий, що ти повернувся!', 'Завершить урок после перерыва от 7 дней. Бобек рад, что ты вернулся!', 'Finish a lesson after a break of 7+ days.') },
];

export type ItemSeed = {
  slug: string;
  slot: 'HAT' | 'GLASSES' | 'SCARF' | 'JACKET' | 'BACKPACK' | 'SHOES' | 'ACCESSORY' | 'COSTUME' | 'FURNITURE' | 'DECOR' | 'SOUVENIR' | 'FRAME';
  name: I18n;
  price: number;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
  premium?: boolean;
  rewardOnly?: boolean;
  city?: string;
  starter?: boolean;
};

const it = (slug: string, slot: ItemSeed['slot'], name: I18n, price: number, extra: Partial<ItemSeed> = {}): ItemSeed => ({ slug, slot, name, price, ...extra });

export const ITEMS: ItemSeed[] = [
  // Стартовий одяг — як на маскоті
  it('hoodie-red', 'JACKET', t('Червоне худі з орлом', 'Красное худи с орлом', 'Red eagle hoodie'), 0, { starter: true }),
  it('backpack-travel', 'BACKPACK', t('Рюкзак мандрівника', 'Рюкзак путешественника', 'Traveller backpack'), 0, { starter: true }),
  it('bed-basic', 'FURNITURE', t('Просте ліжко', 'Простая кровать', 'Simple bed'), 0, { starter: true }),
  // Головні убори
  it('cap-green', 'HAT', t('Зелена кепка', 'Зелёная кепка', 'Green cap'), 40),
  it('cap-red', 'HAT', t('Червона кепка', 'Красная кепка', 'Red cap'), 40),
  it('beanie-blue', 'HAT', t('Синя шапка', 'Синяя шапка', 'Blue beanie'), 60),
  it('hat-chef', 'HAT', t('Ковпак кухаря', 'Колпак повара', 'Chef hat'), 80, { rarity: 'rare' }),
  it('hat-krasnal', 'HAT', t('Ковпачок вроцлавського гнома', 'Колпак вроцлавского гнома', 'Wrocław gnome hat'), 0, { rewardOnly: true, rarity: 'epic', city: 'wroclaw' }),
  it('crown-gold', 'HAT', t('Золота корона', 'Золотая корона', 'Golden crown'), 150, { premium: true, rarity: 'legendary' }),
  // Окуляри
  it('glasses-round', 'GLASSES', t('Круглі окуляри', 'Круглые очки', 'Round glasses'), 50),
  it('glasses-sun', 'GLASSES', t('Сонячні окуляри', 'Солнцезащитные очки', 'Sunglasses'), 70, { rarity: 'rare' }),
  it('glasses-star', 'GLASSES', t('Окуляри-зірки', 'Очки-звёзды', 'Star glasses'), 120, { premium: true, rarity: 'epic' }),
  // Шарфи
  it('scarf-pl', 'SCARF', t('Біло-червоний шарф', 'Бело-красный шарф', 'White-red scarf'), 60, { rarity: 'rare' }),
  it('scarf-ua', 'SCARF', t('Синьо-жовтий шарф', 'Сине-жёлтый шарф', 'Blue-yellow scarf'), 60, { rarity: 'rare' }),
  it('scarf-green', 'SCARF', t('Зелений шарф', 'Зелёный шарф', 'Green scarf'), 40),
  // Куртки
  it('jacket-denim', 'JACKET', t('Джинсова куртка', 'Джинсовая куртка', 'Denim jacket'), 90),
  it('jacket-rain', 'JACKET', t('Жовтий дощовик', 'Жёлтый дождевик', 'Yellow raincoat'), 70),
  it('vest-krakowiak', 'JACKET', t('Краківська камізелька', 'Краковский жилет', 'Kraków folk vest'), 0, { rewardOnly: true, rarity: 'epic', city: 'krakow' }),
  // Рюкзаки
  it('backpack-map', 'BACKPACK', t('Рюкзак з картою', 'Рюкзак с картой', 'Map backpack'), 80, { rarity: 'rare' }),
  // Взуття
  it('sneakers-white', 'SHOES', t('Білі кросівки', 'Белые кроссовки', 'White sneakers'), 40),
  it('boots-mountain', 'SHOES', t('Гірські черевики', 'Горные ботинки', 'Mountain boots'), 60),
  // Аксесуари
  it('flag-pl', 'ACCESSORY', t('Прапорець Польщі', 'Флажок Польши', 'Polish flag'), 30),
  it('camera', 'ACCESSORY', t('Фотоапарат', 'Фотоаппарат', 'Camera'), 70),
  it('map-paper', 'ACCESSORY', t('Паперова карта', 'Бумажная карта', 'Paper map'), 40),
  it('obwarzanek', 'ACCESSORY', t('Краківський обважанек', 'Краковский обважанек', 'Kraków pretzel'), 0, { rewardOnly: true, city: 'krakow' }),
  // Костюми
  it('costume-dragon', 'COSTUME', t('Костюм Вавельського дракона', 'Костюм Вавельского дракона', 'Wawel dragon costume'), 200, { premium: true, rarity: 'legendary' }),
  it('costume-syrenka', 'COSTUME', t('Костюм Варшавської сирени', 'Костюм Варшавской русалки', 'Warsaw mermaid costume'), 0, { rewardOnly: true, rarity: 'epic', city: 'warszawa' }),
  // Домик: меблі
  it('bed-cozy', 'FURNITURE', t('Затишне ліжко', 'Уютная кровать', 'Cozy bed'), 120),
  it('desk', 'FURNITURE', t('Письмовий стіл', 'Письменный стол', 'Desk'), 100),
  it('bookshelf', 'FURNITURE', t('Книжкова полиця', 'Книжная полка', 'Bookshelf'), 90),
  it('sofa', 'FURNITURE', t('Kanapa (диван!)', 'Kanapa (диван!)', 'Kanapa (sofa)'), 150),
  it('lamp', 'FURNITURE', t('Лампа', 'Лампа', 'Lamp'), 60),
  it('plant', 'DECOR', t('Вазон', 'Растение', 'Plant'), 40),
  it('rug-red', 'DECOR', t('Dywan (килим!)', 'Dywan (ковёр!)', 'Dywan (carpet)'), 80),
  it('poster-poland', 'DECOR', t('Постер «Польща»', 'Постер «Польша»', 'Poland poster'), 50),
  it('map-wall', 'DECOR', t('Карта на стіні', 'Карта на стене', 'Wall map'), 70),
  // Сувеніри міст (нагорода за іспит міста)
  it('souvenir-syrenka', 'SOUVENIR', t('Фігурка Сирени', 'Фигурка Русалки', 'Mermaid figurine'), 0, { rewardOnly: true, city: 'warszawa' }),
  it('souvenir-dragon', 'SOUVENIR', t('Фігурка дракона', 'Фигурка дракона', 'Dragon figurine'), 0, { rewardOnly: true, city: 'krakow' }),
  it('souvenir-krasnal', 'SOUVENIR', t('Бронзовий гномик', 'Бронзовый гномик', 'Bronze gnome'), 0, { rewardOnly: true, city: 'wroclaw' }),
  // Рамки профілю
  it('frame-green', 'FRAME', t('Зелена рамка', 'Зелёная рамка', 'Green frame'), 100),
  it('frame-gold', 'FRAME', t('Золота рамка', 'Золотая рамка', 'Gold frame'), 150, { premium: true, rarity: 'legendary' }),
  // Костюми з листа «Костюми й міста» (в кінці списку: порядок наявних предметів не змінюється)
  it('costume-barista', 'COSTUME', t('Костюм баристи', 'Костюм бариста', 'Barista outfit'), 0, { rewardOnly: true, rarity: 'rare' }),
  it('costume-chef', 'COSTUME', t('Костюм кухаря', 'Костюм повара', 'Chef outfit'), 0, { rewardOnly: true, rarity: 'rare' }),
  it('costume-conductor', 'COSTUME', t('Костюм провідника', 'Костюм проводника', 'Train conductor outfit'), 0, { rewardOnly: true, rarity: 'epic' }),
  it('costume-krasnal', 'COSTUME', t('Костюм гнома з Вроцлава', 'Костюм гнома из Вроцлава', 'Wrocław gnome outfit'), 0, { rewardOnly: true, rarity: 'legendary', city: 'wroclaw' }),
  it('costume-artist', 'COSTUME', t('Костюм художника', 'Костюм художника', 'Artist outfit'), 180, { rarity: 'epic' }),
  it('costume-winter', 'COSTUME', t('Зимовий образ', 'Зимний образ', 'Winter look'), 120, { rarity: 'rare' }),
];

/** Нагороди за проходження іспиту міста (сувенір + костюм). */
export const CITY_REWARDS: Record<string, string[]> = {
  warszawa: ['souvenir-syrenka', 'costume-syrenka'],
  krakow: ['souvenir-dragon', 'vest-krakowiak', 'obwarzanek'],
  wroclaw: ['souvenir-krasnal', 'costume-krasnal'],
};

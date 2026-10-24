/**
 * Внутрішні тести: вхідний (placement) і пробний іспит A1.
 * Це тренувальні тести POLSKI GO, а не державна сертифікація.
 */
import { t, fillGap, listen, reading, translate, grammar, dictation, wordChoice, findError, build } from './builders';
import type { LessonSeed } from './types';

export const PLACEMENT: LessonSeed = {
  slug: 'placement-test',
  kind: 'PLACEMENT',
  title: t('Вхідний тест', 'Входной тест', 'Placement test'),
  topic: t('Визначимо, з чого почати', 'Определим, с чего начать', 'Let\'s find your starting point'),
  cefr: 'A1',
  difficulty: 2,
  explanation: t(
    '10 коротких завдань від простих до складніших. Результат — лише рекомендація, з якого міста почати. Підтверджений рівень польської ти отримаєш, склавши іспити.',
    '10 коротких заданий от простых к сложным. Результат — лишь рекомендация, с какого города начать. Подтверждённый уровень польского ты получишь, сдав экзамены.',
    '10 short tasks from easy to harder. The result is only a recommendation of where to start. Your confirmed Polish level comes from passing exams.',
  ),
  examples: [],
  words: [],
  exercises: [
    wordChoice('vocab.greetings', 'Dziękuję', [t('Дякую', 'Спасибо', 'Thank you'), t('Будь ласка', 'Пожалуйста', 'Please'), t('Вибачте', 'Извините', 'Sorry')]),
    wordChoice('vocab.numbers', 'siedem', [t('7', '7', '7'), t('6', '6', '6'), t('17', '17', '17')]),
    fillGap('grammar.intro', 'Mam na ___ Ola.', ['imię', 'nazwisko', 'lat'], t('Мене звати Оля.', 'Меня зовут Оля.', 'My name is Ola.')),
    fillGap('grammar.genitive', 'Jestem z ___.', ['Ukrainy', 'Ukraina', 'Ukrainę'], t('Я з України.', 'Я из Украины.', 'I\'m from Ukraine.')),
    fillGap('grammar.gender', 'To jest ___ siostra.', ['moja', 'mój', 'moje'], t('Це моя сестра.', 'Это моя сестра.', 'This is my sister.')),
    fillGap('grammar.być', 'Oni ___ w domu.', ['są', 'jest', 'jesteśmy'], t('Вони вдома.', 'Они дома.', 'They are at home.')),
    fillGap('grammar.accusative', 'Poproszę ___.', ['kawę', 'kawa', 'kawy'], t('Каву, будь ласка.', 'Кофе, пожалуйста.', 'A coffee, please.')),
    fillGap('grammar.numerals', 'To kosztuje pięć ___.', ['złotych', 'złote', 'złoty'], t('Це коштує п\'ять злотих.', 'Это стоит пять злотых.', 'It costs five zlotys.')),
    fillGap('grammar.past', 'Wczoraj ___ w kinie.', ['byłem', 'jestem', 'będę'], t('Вчора я був у кіно.', 'Вчера я был в кино.', 'Yesterday I was at the cinema.')),
    fillGap('grammar.instrumental', 'Jestem ___.', ['nauczycielem', 'nauczyciel', 'nauczyciela'], t('Я вчитель.', 'Я учитель.', 'I am a teacher.')),
  ],
};

export const EXAM_A1: LessonSeed = {
  slug: 'exam-a1',
  kind: 'EXAM',
  title: t('Пробний іспит A1', 'Пробный экзамен A1', 'Mock exam A1'),
  topic: t('Граматика, лексика, читання, аудіювання, письмо', 'Грамматика, лексика, чтение, аудирование, письмо', 'Grammar, vocabulary, reading, listening, writing'),
  cefr: 'A1',
  difficulty: 4,
  explanation: t(
    'Внутрішній тренувальний іспит POLSKI GO рівня A1. Щоб підтвердити рівень A1 у застосунку, потрібно **70%**.\nЦе не державний сертифікат — але хороша перевірка перед ним.',
    'Внутренний тренировочный экзамен POLSKI GO уровня A1. Чтобы подтвердить уровень A1 в приложении, нужно **70%**.\nЭто не государственный сертификат — но хорошая проверка перед ним.',
    'An internal POLSKI GO practice exam at A1. You need **70%** to confirm A1 in the app.\nThis is not a state certificate — but a good check before one.',
  ),
  examples: [],
  words: [],
  exercises: [
    // Граматика і лексика
    fillGap('grammar.genitive', 'Nie mam ___.', ['brata', 'brat', 'bratem'], t('У мене немає брата.', 'У меня нет брата.', 'I don\'t have a brother.'),
      t('Після заперечення **nie mam** — родовий відмінок: **brata**.', 'После отрицания **nie mam** — родительный падеж: **brata**.', 'After **nie mam** use the genitive: **brata**.')),
    grammar('grammar.być', 'Wy ___ z Polski?', 'być', ['jesteście'], t('Ви з Польщі?', 'Вы из Польши?', 'Are you from Poland?'), t('wy **jesteście**.', 'wy **jesteście**.', 'wy **jesteście**.')),
    grammar('grammar.mieć', 'Oni ___ duże mieszkanie.', 'mieć', ['mają'], t('У них велика квартира.', 'У них большая квартира.', 'They have a big flat.'), t('oni **mają**.', 'oni **mają**.', 'oni **mają**.')),
    grammar('grammar.chcieć', 'Ona ___ kawę.', 'chcieć', ['chce'], t('Вона хоче каву.', 'Она хочет кофе.', 'She wants coffee.'), t('ona **chce**.', 'ona **chce**.', 'ona **chce**.')),
    fillGap('grammar.locative', 'Mieszkam w ___.', ['Krakowie', 'Kraków', 'Krakowa'], t('Я живу в Кракові.', 'Я живу в Кракове.', 'I live in Kraków.')),
    fillGap('grammar.days', 'Pracuję w ___.', ['sobotę', 'sobota', 'soboty'], t('Я працюю в суботу.', 'Я работаю в субботу.', 'I work on Saturday.')),
    findError('grammar.numerals', ['To', 'kosztuje', 'dwa', 'złotych'], 3, t('Це коштує два злотих.', 'Это стоит два злотых.', 'It costs two zlotys.'),
      t('Після 2–4: **złote**.', 'После 2–4: **złote**.', 'After 2–4: **złote**.')),
    // Читання
    reading('reading.exam', 'Ogłoszenie: Wynajmę pokój w Krakowie. Pokój jest duży, kuchnia i łazienka są wspólne. Cena: 1200 zł miesięcznie. Telefon: 600 100 200.',
      t('Що є спільним?', 'Что является общим?', 'What is shared?'),
      [t('Кухня і ванна', 'Кухня и ванная', 'Kitchen and bathroom'), t('Кімната', 'Комната', 'The room'), t('Телефон', 'Телефон', 'The phone')],
      t('**kuchnia i łazienka są wspólne** — кухня і ванна спільні.', '**kuchnia i łazienka są wspólne** — кухня и ванная общие.', '**kuchnia i łazienka są wspólne** — shared kitchen and bathroom.')),
    reading('reading.exam', 'Ogłoszenie: Wynajmę pokój w Krakowie. Pokój jest duży, kuchnia i łazienka są wspólne. Cena: 1200 zł miesięcznie. Telefon: 600 100 200.',
      t('Скільки коштує кімната?', 'Сколько стоит комната?', 'How much is the room?'),
      [t('1200 зл на місяць', '1200 зл в месяц', '1200 zł per month'), t('600 зл на місяць', '600 зл в месяц', '600 zł per month'), t('1200 зл на тиждень', '1200 зл в неделю', '1200 zł per week')]),
    reading('reading.exam', 'Cześć Marta! Jutro jest sobota. Idziemy do kawiarni? Czekam na Ciebie o 10:00 na Rynku. Ola',
      t('Коли зустріч?', 'Когда встреча?', 'When is the meeting?'),
      [t('Завтра о 10:00', 'Завтра в 10:00', 'Tomorrow at 10:00'), t('Сьогодні о 10:00', 'Сегодня в 10:00', 'Today at 10:00'), t('У неділю', 'В воскресенье', 'On Sunday')]),
    // Аудіювання
    listen('listening.exam', 'Pociąg do Gdańska odjeżdża z peronu drugiego.', ['Pociąg do Gdańska odjeżdża z peronu drugiego.', 'Pociąg do Krakowa odjeżdża z peronu drugiego.', 'Autobus do Gdańska odjeżdża z przystanku.']),
    listen('listening.exam', 'Razem dwadzieścia cztery złote', ['24 zł', '42 zł', '20 zł']),
    listen('listening.exam', 'Przepraszam, nie rozumiem. Proszę mówić wolniej.', ['Przepraszam, nie rozumiem. Proszę mówić wolniej.', 'Przepraszam, rozumiem. Proszę mówić szybciej.', 'Dziękuję, rozumiem wszystko.']),
    // Письмо
    translate('writing.exam', t('Я з України і живу в Польщі.', 'Я из Украины и живу в Польше.', 'I am from Ukraine and I live in Poland.'), ['Jestem z Ukrainy i mieszkam w Polsce']),
    translate('writing.exam', t('Рахунок, будь ласка.', 'Счёт, пожалуйста.', 'The bill, please.'), ['Poproszę rachunek', 'Rachunek proszę', 'Proszę rachunek']),
    dictation('writing.exam', 'Mam na imię Anna i mam dwadzieścia lat', t('Мене звати Анна, і мені двадцять років', 'Меня зовут Анна, и мне двадцать лет', 'My name is Anna and I am twenty')),
    build('grammar.sentence', 'W niedzielę jestem u babci', t('У неділю я в бабусі', 'В воскресенье я у бабушки', 'On Sunday I am at grandma\'s'), ['niedziela'], ['Jestem u babci w niedzielę']),
  ],
};

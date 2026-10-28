/** Описание ресурсов для универсального редактора контента. */
import { EXERCISE_TYPES } from '@polski-go/shared';

export type Field =
  | { name: string; label: string; type: 'text' | 'textarea' | 'number' | 'bool' | 'i18n' | 'json' | 'tags' | 'asset' }
  | { name: string; label: string; type: 'select'; options: string[] }
  | { name: string; label: string; type: 'ref'; resource: string; display: string; nullable?: boolean };

export type ResourceDef = {
  name: string;
  title: string;
  idField?: string;
  columns: { key: string; label: string; i18n?: boolean }[];
  fields: Field[];
  filters?: string[];
  defaults: Record<string, unknown>;
};

const CEFR = ['A0', 'A1', 'A2', 'B1', 'B2'];
const STATUS = ['DRAFT', 'REVIEW', 'PUBLISHED', 'ARCHIVED'];
const i18n = { uk: '', ru: '', en: '' };

export const RESOURCES: ResourceDef[] = [
  {
    name: 'cities', title: 'Города',
    columns: [{ key: 'order', label: '#' }, { key: 'emoji', label: '' }, { key: 'namePl', label: 'Город' }, { key: 'theme', label: 'Тема', i18n: true }, { key: 'cefr', label: 'CEFR' }, { key: 'status', label: 'Статус' }],
    fields: [
      { name: 'slug', label: 'Slug', type: 'text' }, { name: 'order', label: 'Порядок', type: 'number' }, { name: 'namePl', label: 'Название по-польски', type: 'text' },
      { name: 'name', label: 'Название', type: 'i18n' }, { name: 'theme', label: 'Тема', type: 'i18n' }, { name: 'description', label: 'Описание', type: 'i18n' },
      { name: 'cefr', label: 'CEFR', type: 'select', options: CEFR }, { name: 'mapX', label: 'Карта X (0–1000)', type: 'number' }, { name: 'mapY', label: 'Карта Y (0–950)', type: 'number' },
      { name: 'emoji', label: 'Эмодзи', type: 'text' }, { name: 'color', label: 'Цвет', type: 'text' }, { name: 'ticketLessons', label: 'Уроков для билета', type: 'number' },
      { name: 'status', label: 'Статус', type: 'select', options: STATUS },
    ],
    defaults: { slug: '', order: 21, namePl: '', name: i18n, theme: i18n, description: i18n, cefr: 'A2', mapX: 500, mapY: 500, emoji: '🏙️', color: '#45C486', ticketLessons: 0, status: 'DRAFT' },
  },
  {
    name: 'routes', title: 'Маршруты', filters: ['cityId'],
    columns: [{ key: 'city.namePl', label: 'Город' }, { key: 'order', label: '#' }, { key: 'icon', label: '' }, { key: 'title', label: 'Название', i18n: true }, { key: '_count.lessons', label: 'Уроков' }, { key: 'status', label: 'Статус' }],
    fields: [
      { name: 'cityId', label: 'Город', type: 'ref', resource: 'cities', display: 'namePl' }, { name: 'slug', label: 'Slug', type: 'text' }, { name: 'order', label: 'Порядок', type: 'number' },
      { name: 'title', label: 'Название', type: 'i18n' }, { name: 'description', label: 'Описание', type: 'i18n' }, { name: 'icon', label: 'Иконка', type: 'text' }, { name: 'status', label: 'Статус', type: 'select', options: STATUS },
    ],
    defaults: { cityId: '', slug: '', order: 1, title: i18n, description: i18n, icon: 'lessons', status: 'DRAFT' },
  },
  {
    name: 'lessons', title: 'Уроки', filters: ['routeId', 'kind', 'status'],
    columns: [{ key: 'route.slug', label: 'Маршрут' }, { key: 'order', label: '#' }, { key: 'slug', label: 'Slug' }, { key: 'title', label: 'Название', i18n: true }, { key: 'kind', label: 'Тип' }, { key: '_count.exercises', label: 'Упражнений' }, { key: 'status', label: 'Статус' }],
    fields: [
      { name: 'routeId', label: 'Маршрут', type: 'ref', resource: 'routes', display: 'slug', nullable: true }, { name: 'slug', label: 'Slug', type: 'text' }, { name: 'order', label: 'Порядок', type: 'number' },
      { name: 'kind', label: 'Тип', type: 'select', options: ['LESSON', 'BOSS', 'EXAM', 'PLACEMENT'] }, { name: 'title', label: 'Название', type: 'i18n' }, { name: 'topic', label: 'Тема', type: 'i18n' },
      { name: 'cefr', label: 'CEFR', type: 'select', options: CEFR }, { name: 'difficulty', label: 'Сложность 1–5', type: 'number' }, { name: 'explanation', label: 'Объяснение (**жирный**)', type: 'i18n' },
      { name: 'examples', label: 'Примеры [{pl, tr:{uk,ru,en}}]', type: 'json' }, { name: 'isPremium', label: 'Premium', type: 'bool' }, { name: 'status', label: 'Статус', type: 'select', options: STATUS },
    ],
    defaults: { routeId: null, slug: '', order: 1, kind: 'LESSON', title: i18n, topic: i18n, cefr: 'A1', difficulty: 1, explanation: i18n, examples: [], isPremium: false, status: 'DRAFT' },
  },
  {
    name: 'exercises', title: 'Упражнения', filters: ['lessonId', 'type'],
    columns: [{ key: 'order', label: '#' }, { key: 'type', label: 'Тип' }, { key: 'skill', label: 'Навык' }, { key: 'data', label: 'Данные' }],
    fields: [
      { name: 'lessonId', label: 'Урок', type: 'ref', resource: 'lessons', display: 'slug' }, { name: 'order', label: 'Порядок', type: 'number' },
      { name: 'type', label: 'Тип', type: 'select', options: [...EXERCISE_TYPES] }, { name: 'skill', label: 'Навык (напр. grammar.być)', type: 'text' },
      { name: 'data', label: 'Данные упражнения (JSON, с ответом)', type: 'json' }, { name: 'explanation', label: 'Объяснение ошибки', type: 'i18n' },
      { name: 'audioUrl', label: 'Аудио', type: 'asset' }, { name: 'imageUrl', label: 'Изображение', type: 'asset' },
    ],
    defaults: { lessonId: '', order: 0, type: 'WORD_TRANSLATION', skill: 'vocab.', data: {}, explanation: null, audioUrl: null, imageUrl: null },
  },
  {
    name: 'vocabulary', title: 'Словарь', filters: ['cefr', 'status'],
    columns: [{ key: 'emoji', label: '' }, { key: 'pl', label: 'По-польски' }, { key: 'translations', label: 'Перевод', i18n: true }, { key: 'pos', label: 'Ч. речи' }, { key: 'cefr', label: 'CEFR' }, { key: 'topics', label: 'Темы' }],
    fields: [
      { name: 'pl', label: 'Слово', type: 'text' }, { name: 'pos', label: 'Часть речи', type: 'select', options: ['noun', 'verb', 'adj', 'adv', 'num', 'pron', 'phrase', 'interj', 'particle'] },
      { name: 'translations', label: 'Перевод', type: 'i18n' }, { name: 'pronunciation', label: 'Произношение (кириллицей)', type: 'text' }, { name: 'forms', label: 'Формы (JSON)', type: 'json' },
      { name: 'examples', label: 'Примеры (JSON)', type: 'json' }, { name: 'cefr', label: 'CEFR', type: 'select', options: CEFR }, { name: 'topics', label: 'Темы (через запятую)', type: 'tags' },
      { name: 'emoji', label: 'Эмодзи', type: 'text' }, { name: 'audioUrl', label: 'Аудио', type: 'asset' }, { name: 'imageUrl', label: 'Изображение', type: 'asset' }, { name: 'status', label: 'Статус', type: 'select', options: STATUS },
    ],
    defaults: { pl: '', pos: 'noun', translations: i18n, pronunciation: '', forms: {}, examples: [], cefr: 'A1', topics: [], emoji: null, audioUrl: null, imageUrl: null, status: 'PUBLISHED' },
  },
  {
    name: 'quests', title: 'Квесты', filters: ['kind'],
    columns: [{ key: 'icon', label: '' }, { key: 'slug', label: 'Slug' }, { key: 'kind', label: 'Тип' }, { key: 'title', label: 'Название', i18n: true }, { key: 'metric', label: 'Метрика' }, { key: 'target', label: 'Цель' }, { key: 'xpReward', label: 'XP' }],
    fields: [
      { name: 'slug', label: 'Slug', type: 'text' }, { name: 'kind', label: 'Тип', type: 'select', options: ['DAILY', 'WEEKLY', 'STORY', 'EVENT'] }, { name: 'title', label: 'Название', type: 'i18n' },
      { name: 'description', label: 'Описание', type: 'i18n' }, { name: 'metric', label: 'Метрика', type: 'select', options: ['LESSONS', 'XP', 'NEW_WORDS', 'REVIEWS', 'PERFECT_STREAK', 'DIALOGUES', 'LISTENING', 'CITY_COMPLETED', 'STORY'] },
      { name: 'target', label: 'Цель', type: 'number' }, { name: 'xpReward', label: 'XP', type: 'number' }, { name: 'zlotkiReward', label: 'Złotki', type: 'number' },
      { name: 'rewardItemId', label: 'Предмет-награда', type: 'ref', resource: 'items', display: 'slug', nullable: true }, { name: 'cityId', label: 'Город', type: 'ref', resource: 'cities', display: 'namePl', nullable: true },
      { name: 'icon', label: 'Иконка', type: 'text' }, { name: 'isPremium', label: 'Premium', type: 'bool' }, { name: 'status', label: 'Статус', type: 'select', options: STATUS }, { name: 'order', label: 'Порядок', type: 'number' },
    ],
    defaults: { slug: '', kind: 'DAILY', title: i18n, description: i18n, metric: 'LESSONS', target: 1, xpReward: 30, zlotkiReward: 10, rewardItemId: null, cityId: null, icon: '⭐', isPremium: false, status: 'PUBLISHED', order: 0 },
  },
  {
    name: 'questSteps', title: 'Этапы сюжетов', filters: ['questId'],
    columns: [{ key: 'questId', label: 'Квест' }, { key: 'order', label: '#' }, { key: 'data.title', label: 'Этап', i18n: true }],
    fields: [{ name: 'questId', label: 'Квест', type: 'ref', resource: 'quests', display: 'slug' }, { name: 'order', label: 'Порядок', type: 'number' }, { name: 'data', label: 'Сцена {title, start, nodes}', type: 'json' }],
    defaults: { questId: '', order: 0, data: { title: i18n, start: 'a', nodes: { a: { speaker: 'npc', name: '', emoji: '🙂', pl: '', tr: i18n, end: true } } } },
  },
  {
    name: 'achievements', title: 'Достижения',
    columns: [{ key: 'icon', label: '' }, { key: 'slug', label: 'Slug' }, { key: 'title', label: 'Название', i18n: true }, { key: 'metric', label: 'Метрика' }, { key: 'threshold', label: 'Порог' }, { key: 'zlotkiReward', label: 'Złotki' }],
    fields: [
      { name: 'slug', label: 'Slug', type: 'text' }, { name: 'title', label: 'Название', type: 'i18n' }, { name: 'description', label: 'Описание', type: 'i18n' }, { name: 'icon', label: 'Иконка', type: 'text' },
      { name: 'metric', label: 'Метрика', type: 'select', options: ['LESSONS', 'STREAK', 'WORDS', 'XP', 'PERFECT_LESSONS', 'CITIES', 'PURCHASES', 'FRIENDS', 'STORY_QUESTS'] },
      { name: 'threshold', label: 'Порог', type: 'number' }, { name: 'zlotkiReward', label: 'Złotki', type: 'number' }, { name: 'rewardItemId', label: 'Предмет', type: 'ref', resource: 'items', display: 'slug', nullable: true },
      { name: 'order', label: 'Порядок', type: 'number' }, { name: 'isActive', label: 'Активно', type: 'bool' },
    ],
    defaults: { slug: '', title: i18n, description: i18n, icon: '🏅', metric: 'LESSONS', threshold: 1, zlotkiReward: 10, rewardItemId: null, order: 0, isActive: true },
  },
  {
    name: 'items', title: 'Косметика', filters: ['slot'],
    columns: [{ key: 'slug', label: 'Slug' }, { key: 'slot', label: 'Слот' }, { key: 'name', label: 'Название', i18n: true }, { key: 'price', label: 'Цена' }, { key: 'rarity', label: 'Редкость' }, { key: 'isPremium', label: 'Premium' }],
    fields: [
      { name: 'slug', label: 'Slug', type: 'text' }, { name: 'slot', label: 'Слот', type: 'select', options: ['HAT', 'GLASSES', 'SCARF', 'JACKET', 'BACKPACK', 'SHOES', 'ACCESSORY', 'COSTUME', 'FURNITURE', 'DECOR', 'SOUVENIR', 'FRAME'] },
      { name: 'name', label: 'Название', type: 'i18n' }, { name: 'assetKey', label: 'Ключ ассета', type: 'text' }, { name: 'price', label: 'Цена (Złotki)', type: 'number' },
      { name: 'rarity', label: 'Редкость', type: 'select', options: ['common', 'rare', 'epic', 'legendary'] }, { name: 'isPremium', label: 'Premium', type: 'bool' }, { name: 'rewardOnly', label: 'Только награда', type: 'bool' },
      { name: 'cityId', label: 'Город', type: 'ref', resource: 'cities', display: 'namePl', nullable: true }, { name: 'isActive', label: 'Активен', type: 'bool' }, { name: 'order', label: 'Порядок', type: 'number' },
    ],
    defaults: { slug: '', slot: 'HAT', name: i18n, assetKey: '', price: 50, rarity: 'common', isPremium: false, rewardOnly: false, cityId: null, isActive: true, order: 0 },
  },
  {
    name: 'plans', title: 'Тарифы Premium', idField: 'code',
    columns: [{ key: 'code', label: 'Код' }, { key: 'title', label: 'Название', i18n: true }, { key: 'months', label: 'Месяцев' }, { key: 'priceStars', label: '⭐ Stars' }, { key: 'recurring', label: 'Автопродление' }, { key: 'isActive', label: 'Активен' }],
    fields: [
      { name: 'code', label: 'Код', type: 'text' }, { name: 'title', label: 'Название', type: 'i18n' }, { name: 'months', label: 'Месяцев', type: 'number' }, { name: 'priceStars', label: 'Цена (Stars)', type: 'number' },
      { name: 'recurring', label: 'Подписка Stars (только 1 мес.)', type: 'bool' }, { name: 'isActive', label: 'Активен', type: 'bool' }, { name: 'order', label: 'Порядок', type: 'number' },
    ],
    defaults: { code: '', title: i18n, months: 1, priceStars: 250, recurring: false, isActive: true, order: 0 },
  },
  {
    name: 'campaigns', title: 'Рассылки',
    columns: [{ key: 'title', label: 'Название' }, { key: 'kind', label: 'Тип' }, { key: 'status', label: 'Статус' }, { key: 'sentCount', label: 'Отправлено' }],
    fields: [{ name: 'title', label: 'Внутреннее название', type: 'text' }, { name: 'kind', label: 'Тип', type: 'select', options: ['reminder', 'new_lessons', 'new_city', 'event', 'challenge'] }, { name: 'message', label: 'Текст сообщения', type: 'i18n' }],
    defaults: { title: '', kind: 'new_lessons', message: i18n },
  },
];

/** Шаблоны данных упражнений — чтобы редактор не писал JSON с нуля. */
export const EXERCISE_TEMPLATES: Record<string, unknown> = {
  WORD_TRANSLATION: { pl: 'kot', audioText: 'kot', options: [{ id: 'o0', text: { uk: 'кіт', ru: 'кот', en: 'cat' } }, { id: 'o1', text: { uk: 'пес', ru: 'собака', en: 'dog' } }], answer: 'o0' },
  FILL_GAP: { pl: 'Mam ___.', translation: { uk: 'У мене є кіт.' }, options: [{ id: 'o0', text: 'kota' }, { id: 'o1', text: 'kot' }], answer: 'o0' },
  LISTENING: { audioText: 'Dzień dobry', options: [{ id: 'o0', text: 'Dzień dobry' }, { id: 'o1', text: 'Dobranoc' }], answer: 'o0' },
  PICTURE_WORD: { image: '🐱', options: [{ id: 'o0', text: 'kot' }, { id: 'o1', text: 'pies' }], answer: 'o0' },
  FIND_ERROR: { pl: 'Mam kot', translation: { uk: 'У мене є кіт' }, options: [{ id: 'w0', text: 'Mam' }, { id: 'w1', text: 'kot' }], answer: 'w1' },
  ODD_ONE_OUT: { options: [{ id: 'w0', text: 'kot' }, { id: 'w1', text: 'pies' }, { id: 'w2', text: 'stół' }], answer: 'w2' },
  READING: { passage: 'Mam na imię Ola.', question: { uk: 'Як звати дівчину?' }, options: [{ id: 'o0', text: { uk: 'Оля' } }, { id: 'o1', text: { uk: 'Аня' } }], answer: 'o0' },
  SENTENCE_TRANSLATION: { source: { uk: 'Дякую', ru: 'Спасибо', en: 'Thank you' }, accepted: ['Dziękuję'] },
  GRAMMAR: { pl: 'Ja ___ w domu.', base: 'być', accepted: ['jestem'], translation: { uk: 'Я вдома.' } },
  DICTATION: { audioText: 'Dzień dobry', translation: { uk: 'Добрий день' }, accepted: ['Dzień dobry'] },
  BUILD_SENTENCE: { translation: { uk: 'У мене є кіт' }, tokens: ['Mam', 'kota', 'pies'], answer: ['Mam', 'kota'], alternatives: [] },
  WORD_ORDER: { translation: { uk: 'Я з України' }, tokens: ['Ukrainy', 'z', 'Jestem'], answer: ['Jestem', 'z', 'Ukrainy'] },
  MATCH_PAIRS: { pairs: [{ l: 'l1', r: 'r7', pl: 'kot', tr: { uk: 'кіт' } }, { l: 'l2', r: 'r3', pl: 'pies', tr: { uk: 'пес' } }] },
  PRONUNCIATION: { text: 'Dziękuję', translation: { uk: 'Дякую' } },
  DIALOGUE: { npc: { name: 'Ania', emoji: '👩', role: { uk: 'подруга' } }, steps: [{ npc: 'Cześć!', npcTr: { uk: 'Привіт!' }, options: [{ id: 'a', text: 'Cześć!', tr: { uk: 'Привіт!' } }, { id: 'b', text: 'Dobranoc!', tr: { uk: 'На добраніч!' } }], answer: 'a', feedback: { uk: 'Відповідай на привітання.' } }] },
  SITUATION: { npc: { name: 'Kasjerka', emoji: '👩‍💼' }, scene: { uk: 'Ти в магазині.' }, steps: [{ npc: 'Dzień dobry!', npcTr: { uk: 'Добрий день!' }, options: [{ id: 'a', text: 'Dzień dobry!', tr: { uk: 'Добрий день!' } }, { id: 'b', text: 'Cześć, ziomek!', tr: { uk: 'Здоров!' } }], answer: 'a' }] },
};

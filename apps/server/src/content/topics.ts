/**
 * Теми словника (фільтр у словнику застосунку). Окремий модуль: маршрут /vocab/topics імпортує лише назви тем,
 * а не весь словник (≈400 КБ записів, потрібних тільки для seed).
 */
import type { I18n } from '@polski-go/shared';
import { t } from './builders';

export const TOPICS: Record<string, I18n> = {
  greetings: t('Привітання', 'Приветствия', 'Greetings'),
  phrases: t('Повсякденні вирази', 'Повседневные выражения', 'Everyday phrases'),
  people: t('Знайомства', 'Знакомства', 'Meeting people'),
  numbers: t('Числа', 'Числа', 'Numbers'),
  family: t('Сім\'я', 'Семья', 'Family'),
  home: t('Дім і житло', 'Дом и жильё', 'Home'),
  rent: t('Оренда житла', 'Аренда жилья', 'Renting'),
  daily: t('Мій день', 'Мой день', 'Daily life'),
  time: t('Час і графік', 'Время и график', 'Time & schedules'),
  food: t('Їжа', 'Еда', 'Food'),
  cafe: t('Кафе', 'Кафе', 'Café'),
  restaurants: t('Ресторани', 'Рестораны', 'Restaurants'),
  shopping: t('Магазини', 'Магазины', 'Shopping'),
  clothes: t('Одяг', 'Одежда', 'Clothes'),
  transport: t('Транспорт', 'Транспорт', 'Transport'),
  travel: t('Подорожі', 'Путешествия', 'Travel'),
  work: t('Робота', 'Работа', 'Work'),
  factory: t('Робота на заводі', 'Работа на заводе', 'Factory work'),
  medicine: t('Медицина', 'Медицина', 'Health'),
  documents: t('Документи', 'Документы', 'Documents'),
  urzad: t('Ужонд (установи)', 'Ужонд (учреждения)', 'Urząd (offices)'),
  bank: t('Банк', 'Банк', 'Bank'),
  slang: t('Польський сленг', 'Польский сленг', 'Polish slang'),
  exam_b1: t('Іспит B1', 'Экзамен B1', 'B1 exam'),
  dishes: t('Польські страви', 'Польские блюда', 'Polish dishes'),
  pierogi: t('Pierogi', 'Pierogi', 'Pierogi'),
  road: t('Дорога і заправка', 'Дорога и заправка', 'Road & petrol station'),
  parcel: t('Посилки', 'Посылки', 'Parcels'),
  city: t('Місто', 'Город', 'City'),
  grammar: t('Граматика', 'Грамматика', 'Grammar'),
  music: t('Музика й концерти', 'Музыка и концерты', 'Music & concerts'),
  calendar: t('Календар і дати', 'Календарь и даты', 'Calendar & dates'),
  nature: t('Природа', 'Природа', 'Nature'),
  sport: t('Спорт', 'Спорт', 'Sport'),
};

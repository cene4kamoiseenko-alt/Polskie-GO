/**
 * Словник квест-кімнати «Тайна Твардовського» (місія для підписників каналу, content/mission-channel.ts) і слів,
 * яких раніше в курсі не було: górny / dolny / środkowy (верхній, нижній, середній) та книжне «oraz».
 * Кожне слово має природний приклад із перекладом; прочитання будується за правилами (pron.ts).
 */
import { polishCyrillic, type Cefr } from '@polski-go/shared';
import { t } from './builders';
import type { VocabSeed } from './vocab';

type Ex = [pl: string, uk: string, ru: string, en: string];

const w = (pl: string, pos: string, cefr: Cefr, uk: string, ru: string, en: string, topics: string[], ex: Ex, forms?: Record<string, string>): VocabSeed => ({
  pl, pos, tr: t(uk, ru, en), pron: polishCyrillic(pl, 'uk').replace(/́/g, ''), cefr, topics, forms,
  examples: [{ pl: ex[0], tr: t(ex[1], ex[2], ex[3]) }],
});

export const ESCAPE_VOCAB: VocabSeed[] = [
  // ── Верх, низ, середина ──
  w('górny', 'adj', 'A2', 'верхній', 'верхний', 'upper, top', ['home', 'grammar'],
    ['Książka leży na górnej półce.', 'Книжка лежить на верхній полиці.', 'Книга лежит на верхней полке.', 'The book is on the top shelf.'], { f: 'górna', n: 'górne' }),
  w('dolny', 'adj', 'A2', 'нижній', 'нижний', 'lower, bottom', ['home', 'grammar'],
    ['Buty są w dolnej szufladzie.', 'Взуття в нижній шухляді.', 'Обувь в нижнем ящике.', 'The shoes are in the bottom drawer.'], { f: 'dolna', n: 'dolne' }),
  w('środkowy', 'adj', 'A2', 'середній', 'средний', 'middle, central', ['home', 'grammar'],
    ['Środkowe okno jest otwarte.', 'Середнє вікно відчинене.', 'Среднее окно открыто.', 'The middle window is open.'], { f: 'środkowa', n: 'środkowe' }),
  w('oraz', 'conj', 'B1', 'і, а також (книжне)', 'и, а также (книжное)', 'and, as well as (formal)', ['grammar'],
    ['Proszę przynieść paszport oraz zdjęcie.', 'Принесіть, будь ласка, паспорт, а також фото.', 'Принесите, пожалуйста, паспорт, а также фото.', 'Please bring your passport as well as a photo.']),

  // ── Кімната ──
  w('półka', 'noun', 'A2', 'полиця', 'полка', 'shelf', ['home'],
    ['Kubki stoją na półce nad zlewem.', 'Чашки стоять на полиці над мийкою.', 'Чашки стоят на полке над раковиной.', 'The mugs are on the shelf above the sink.'], { loc: 'na półce', pl: 'półki' }),
  w('szuflada', 'noun', 'A2', 'шухляда', 'выдвижной ящик', 'drawer', ['home'],
    ['Klucze są w szufladzie biurka.', 'Ключі в шухляді письмового столу.', 'Ключи в ящике письменного стола.', 'The keys are in the desk drawer.'], { loc: 'w szufladzie' }),
  w('biurko', 'noun', 'A1', 'письмовий стіл', 'письменный стол', 'desk', ['home', 'work'],
    ['Laptop leży na biurku.', 'Ноутбук лежить на письмовому столі.', 'Ноутбук лежит на письменном столе.', 'The laptop is on the desk.'], { loc: 'na biurku' }),
  w('okno', 'noun', 'A1', 'вікно', 'окно', 'window', ['home'],
    ['Usiądźmy przy oknie.', 'Сядьмо біля вікна.', 'Давай сядем у окна.', 'Let’s sit by the window.'], { loc: 'przy oknie', pl: 'okna' }),
  w('skrzynia', 'noun', 'B1', 'скриня', 'сундук', 'chest, trunk', ['home'],
    ['Stara skrzynia stoi na strychu.', 'Стара скриня стоїть на горищі.', 'Старый сундук стоит на чердаке.', 'The old chest is in the attic.']),

  // ── Загадки й замки ──
  w('zagadka', 'noun', 'A2', 'загадка', 'загадка', 'riddle, puzzle', ['phrases'],
    ['Ta zagadka jest bardzo trudna.', 'Ця загадка дуже складна.', 'Эта загадка очень трудная.', 'This riddle is very hard.'], { pl: 'zagadki' }),
  w('podpowiedź', 'noun', 'B1', 'підказка', 'подсказка', 'hint, clue', ['phrases'],
    ['Mamy jeszcze jedną podpowiedź.', 'У нас ще є одна підказка.', 'У нас есть ещё одна подсказка.', 'We still have one more hint.'], { pl: 'podpowiedzi' }),
  w('kłódka', 'noun', 'B1', 'навісний замок', 'навесной замок', 'padlock', ['home'],
    ['Rower jest zapięty na kłódkę.', 'Велосипед пристебнутий на замок.', 'Велосипед пристёгнут на замок.', 'The bike is locked with a padlock.']),
  w('kod', 'noun', 'A2', 'код', 'код', 'code', ['home', 'city'],
    ['Jaki jest kod do domofonu?', 'Який код домофона?', 'Какой код домофона?', 'What’s the intercom code?']),
  w('błąd', 'noun', 'A2', 'помилка', 'ошибка', 'mistake, error', ['grammar'],
    ['To był tylko mały błąd.', 'Це була лише маленька помилка.', 'Это была всего лишь маленькая ошибка.', 'It was just a small mistake.'], { gen: 'błędu', pl: 'błędy' }),

  // ── Легенда й після гри ──
  w('karczma', 'noun', 'B1', 'корчма', 'корчма', 'inn, tavern', ['restaurants', 'holidays'],
    ['W karczmie zjedliśmy żurek.', 'У корчмі ми з’їли журек.', 'В корчме мы съели журек.', 'We had żurek at the inn.'], { loc: 'w karczmie' }),
  w('księżyc', 'noun', 'A2', 'місяць (на небі)', 'луна', 'moon', ['nature'],
    ['Dziś w nocy księżyc jest bardzo jasny.', 'Сьогодні вночі місяць дуже яскравий.', 'Сегодня ночью луна очень яркая.', 'The moon is very bright tonight.']),
  w('opinia', 'noun', 'B1', 'відгук; думка', 'отзыв; мнение', 'review; opinion', ['restaurants', 'phrases'],
    ['Zostawiłem opinię o restauracji.', 'Я залишив відгук про ресторан.', 'Я оставил отзыв о ресторане.', 'I left a review of the restaurant.'], { acc: 'opinię' }),

  // ── Регіони: Верхня й Нижня Сілезія (górny / dolny у назвах) ──
  w('Górny Śląsk', 'noun', 'A2', 'Верхня Сілезія', 'Верхняя Силезия', 'Upper Silesia', ['travel', 'city'],
    ['Katowice to stolica Górnego Śląska.', 'Катовіце — столиця Верхньої Сілезії.', 'Катовице — столица Верхней Силезии.', 'Katowice is the capital of Upper Silesia.'], { gen: 'Górnego Śląska', loc: 'na Górnym Śląsku' }),
  w('Dolny Śląsk', 'noun', 'A2', 'Нижня Сілезія', 'Нижняя Силезия', 'Lower Silesia', ['travel', 'city'],
    ['Wrocław to największe miasto Dolnego Śląska.', 'Вроцлав — найбільше місто Нижньої Сілезії.', 'Вроцлав — крупнейший город Нижней Силезии.', 'Wrocław is the largest city in Lower Silesia.'], { gen: 'Dolnego Śląska', loc: 'na Dolnym Śląsku' }),
];

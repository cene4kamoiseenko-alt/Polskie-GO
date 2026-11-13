/** Вопросы бота: покупки (магазин, касса, цены, акции). */
import { q, type QuizQuestion } from './types';

export const SHOPPING: QuizQuestion[] = [
  q({
    id: 'shop-bag', category: 'shopping', cefr: 'A1', kind: 'situation', image: 'lidl',
    prompt: {
      ru: 'На кассе ты хочешь пакет. Какая фраза правильная?',
      uk: 'На касі ти хочеш пакет. Яка фраза правильна?',
      en: 'At the till you want a bag. Which sentence is correct?',
    },
    options: ['Poproszę reklamówkę.', 'Poproszę reklamówka.', 'Poproszę reklamówką.', 'Poproszę reklamówce.'],
    answer: 0,
    explain: {
      ru: 'После «poproszę» — винительный падеж: reklamówka → reklamówkę. «Reklamówka» — именительный, «reklamówką» — творительный (z reklamówką), «reklamówce» — местный (w reklamówce).',
      uk: 'Після «poproszę» — знахідний відмінок: reklamówka → reklamówkę. «Reklamówka» — називний, «reklamówką» — орудний (z reklamówką), «reklamówce» — місцевий (w reklamówce).',
      en: '«Poproszę» takes the accusative: reklamówka → reklamówkę. «Reklamówka» is the nominative, «reklamówką» the instrumental (z reklamówką), «reklamówce» the locative (w reklamówce).',
    },
  }),
  q({
    id: 'shop-paragon', category: 'shopping', cefr: 'A1', kind: 'meaning', image: 'lidl',
    prompt: {
      ru: 'Ты заплатил, и кассир спрашивает: «Paragon?» Что он предлагает?',
      uk: 'Ти заплатив, і касир питає: «Paragon?» Що він пропонує?',
      en: 'You have paid and the cashier asks: «Paragon?» What is he offering?',
    },
    options: {
      ru: ['дать чек', 'дать сдачу', 'дать пакет', 'дать скидку'],
      uk: ['дати чек', 'дати решту', 'дати пакет', 'дати знижку'],
      en: ['the receipt', 'your change', 'a carrier bag', 'a discount'],
    },
    answer: 0,
    explain: {
      ru: 'Paragon — кассовый чек: кассир спрашивает, нужен ли он. Сдача — «reszta», пакет — «reklamówka», скидка — «zniżka» или «rabat».',
      uk: 'Paragon — касовий чек: касир питає, чи він потрібен. Решта — «reszta», пакет — «reklamówka», знижка — «zniżka» або «rabat».',
      en: 'A paragon is the till receipt: the cashier asks whether you want it. Change is «reszta», a bag — «reklamówka», a discount — «zniżka» or «rabat».',
    },
  }),
  q({
    id: 'shop-card', category: 'shopping', cefr: 'A1', kind: 'reply', image: 'stop-cafe',
    prompt: {
      ru: 'Кассир: «Jak będzie pan płacił?» Ты платишь картой. Что ответишь?',
      uk: 'Касир: «Jak będzie pan płacił?» Ти платиш карткою. Що відповіси?',
      en: 'The cashier: «Jak będzie pan płacił?» You are paying by card. What do you say?',
    },
    options: ['Kartą.', 'Karta.', 'Kartę.', 'Karcie.'],
    answer: 0,
    explain: {
      ru: 'Чем платишь? — творительный падеж без предлога: «kartą» (картой), «gotówką» (наличными). «Karta» — именительный, «kartę» — винительный (mam kartę), «karcie» — местный (na karcie).',
      uk: 'Чим платиш? — орудний відмінок без прийменника: «kartą» (карткою), «gotówką» (готівкою). «Karta» — називний, «kartę» — знахідний (mam kartę), «karcie» — місцевий (na karcie).',
      en: 'Paying with what? — the bare instrumental: «kartą» (by card), «gotówką» (in cash). «Karta» is the nominative, «kartę» the accusative (mam kartę), «karcie» the locative (na karcie).',
    },
  }),
  q({
    id: 'shop-kosztuje', category: 'shopping', cefr: 'A2', kind: 'complete', image: 'lidl',
    prompt: {
      ru: 'Вставь слово: «Ile ___ te truskawki?»',
      uk: 'Встав слово: «Ile ___ te truskawki?»',
      en: 'Fill in the gap: «Ile ___ te truskawki?»',
    },
    options: ['kosztują', 'kosztuje', 'kosztujesz', 'kosztować'],
    answer: 0,
    explain: {
      ru: 'Truskawki (клубника) — множественное число, значит «kosztują». «Kosztuje» — для одной вещи (ten chleb), «kosztujesz» — «ты стоишь», «kosztować» — неопределённая форма.',
      uk: 'Truskawki (полуниця) — множина, отже «kosztują». «Kosztuje» — для однієї речі (ten chleb), «kosztujesz» — «ти коштуєш», «kosztować» — неозначена форма.',
      en: 'Truskawki (strawberries) is plural, so «kosztują». «Kosztuje» is for one item (ten chleb), «kosztujesz» means "you cost", «kosztować» is the infinitive.',
    },
  }),
  q({
    id: 'shop-gratis', category: 'shopping', cefr: 'A1', kind: 'meaning', image: 'lidl',
    prompt: {
      ru: 'На ценнике: «Druga sztuka gratis». Что это значит?',
      uk: 'На ціннику: «Druga sztuka gratis». Що це означає?',
      en: 'A price tag says «Druga sztuka gratis». What does it mean?',
    },
    options: {
      ru: ['вторая — бесплатно', 'вторая — за полцены', 'вторая — по карте магазина', 'вторая — только сегодня'],
      uk: ['друга — безкоштовно', 'друга — за півціни', 'друга — за карткою магазину', 'друга — лише сьогодні'],
      en: ['the second is free', 'the second is half price', 'the second with a store card', 'the second only today'],
    },
    answer: 0,
    explain: {
      ru: '«Gratis» — бесплатно: вторую такую же вещь отдают даром. Полцены было бы «50% taniej» или «za pół ceny», по карте — «z kartą», только сегодня — «tylko dziś».',
      uk: '«Gratis» — безкоштовно: другу таку саму річ віддають задарма. Півціни було б «50% taniej» або «za pół ceny», за карткою — «z kartą», лише сьогодні — «tylko dziś».',
      en: '«Gratis» means free: you get a second identical item for nothing. Half price would be «50% taniej» or «za pół ceny», with a card — «z kartą», today only — «tylko dziś».',
    },
  }),
  q({
    id: 'shop-milk', category: 'shopping', cefr: 'A1', kind: 'listen', image: 'lidl',
    prompt: {
      ru: 'Продавец: «Mleko jest w ostatniej alejce, na dole.» Где молоко?',
      uk: 'Продавець: «Mleko jest w ostatniej alejce, na dole.» Де молоко?',
      en: 'The shop assistant: «Mleko jest w ostatniej alejce, na dole.» Where is the milk?',
    },
    options: {
      ru: ['в последнем ряду, внизу', 'в последнем ряду, наверху', 'в первом ряду, внизу', 'возле кассы, внизу'],
      uk: ['в останньому ряду, внизу', 'в останньому ряду, вгорі', 'у першому ряду, внизу', 'біля каси, внизу'],
      en: ['last aisle, bottom shelf', 'last aisle, top shelf', 'first aisle, bottom shelf', 'by the till, bottom shelf'],
    },
    answer: 0,
    explain: {
      ru: '«Ostatnia alejka» — последний ряд между полками, «na dole» — внизу («na górze» — наверху). Первый — «pierwszy», касса — «kasa».',
      uk: '«Ostatnia alejka» — останній ряд між полицями, «na dole» — внизу («na górze» — вгорі). Перший — «pierwszy», каса — «kasa».',
      en: '«Ostatnia alejka» is the last aisle, «na dole» means at the bottom («na górze» — at the top). First is «pierwszy», the till — «kasa».',
    },
  }),
  q({
    id: 'shop-nie-ma', category: 'shopping', cefr: 'A2', kind: 'complete', image: 'cukiernia',
    prompt: {
      ru: 'Продавщица: «Niestety, nie ma już ___.» (свежего хлеба) Какая форма верная?',
      uk: 'Продавчиня: «Niestety, nie ma już ___.» (свіжого хліба) Яка форма правильна?',
      en: 'The shop assistant: «Niestety, nie ma już ___.» (fresh bread) Which form is correct?',
    },
    options: ['świeżego chleba', 'świeży chleb', 'świeżym chlebem', 'świeżym chlebie'],
    answer: 0,
    explain: {
      ru: 'После «nie ma» — родительный падеж, и прилагательное тоже: świeży chleb → świeżego chleba. «Świeży chleb» — именительный, «świeżym chlebem» — творительный, «świeżym chlebie» — местный.',
      uk: 'Після «nie ma» — родовий відмінок, і прикметник теж: świeży chleb → świeżego chleba. «Świeży chleb» — називний, «świeżym chlebem» — орудний, «świeżym chlebie» — місцевий.',
      en: 'After «nie ma» comes the genitive, adjective included: świeży chleb → świeżego chleba. The other forms are the nominative, instrumental and locative.',
    },
  }),
  q({
    id: 'shop-loyalty', category: 'shopping', cefr: 'A2', kind: 'reply', image: 'lidl',
    prompt: {
      ru: 'Кассир: «Ma pan kartę Lidl Plus?» Карты у тебя нет. Что ответишь?',
      uk: 'Касир: «Ma pan kartę Lidl Plus?» Картки в тебе немає. Що відповіси?',
      en: 'The cashier: «Ma pan kartę Lidl Plus?» You don\'t have the card. What do you say?',
    },
    options: ['Nie, niestety nie mam.', 'Nie, niestety nie ma.', 'Nie, niestety nie mamy.', 'Nie, niestety nie masz.'],
    answer: 0,
    explain: {
      ru: 'Отвечаешь о себе — 1-е лицо: «nie mam» (у меня нет). «Nie ma» — «нет» или «у него нет», «nie mamy» — «у нас нет», «nie masz» — «у тебя нет».',
      uk: 'Відповідаєш про себе — 1-ша особа: «nie mam» (у мене немає). «Nie ma» — «немає» або «у нього немає», «nie mamy» — «у нас немає», «nie masz» — «у тебе немає».',
      en: 'You answer about yourself, first person: «nie mam» (I don\'t have). «Nie ma» means "there isn\'t" or "he hasn\'t", «nie mamy» — "we haven\'t", «nie masz» — "you haven\'t".',
    },
  }),
  q({
    id: 'shop-przecena', category: 'shopping', cefr: 'B1', kind: 'meaning', image: 'lidl',
    prompt: {
      ru: 'На куртке бирка: «Przecenione z 300 na 210 zł». Что с ценой?',
      uk: 'На куртці бирка: «Przecenione z 300 na 210 zł». Що з ціною?',
      en: 'A jacket label says «Przecenione z 300 na 210 zł». What happened to the price?',
    },
    options: {
      ru: ['уже подешевела до 210 zł', 'подешевеет до 210 zł завтра', 'подорожала до 300 zł', 'стоит 210 zł по карте'],
      uk: ['вже подешевшала до 210 zł', 'подешевшає до 210 zł завтра', 'подорожчала до 300 zł', 'коштує 210 zł за карткою'],
      en: ['already cut to 210 zł', 'will be cut to 210 zł', 'went up to 300 zł', 'costs 210 zł with a card'],
    },
    answer: 0,
    explain: {
      ru: '«Przecenione» — уже уценённое (цену снизили), «z 300 na 210» — со старой цены на новую. Подорожало — «podrożało», по карте — «z kartą».',
      uk: '«Przecenione» — уже уцінене (ціну знизили), «z 300 na 210» — зі старої ціни на нову. Подорожчало — «podrożało», за карткою — «z kartą».',
      en: '«Przecenione» means already reduced, «z 300 na 210» — from the old price to the new one. Went up is «podrożało», with a card — «z kartą».',
    },
  }),
];

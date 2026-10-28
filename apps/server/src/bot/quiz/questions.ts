/**
 * Быстрые вопросы бота (/quiz): 60 вопросов A1–B1 о реальной жизни в Польше.
 * Темы — магазин, кафе, транспорт, город и urząd, работа, здоровье, быт, грамматика в контексте, общение.
 * Механики — ситуация («что скажешь»), значение слова, вставка формы или предлога, ответ на реплику, понимание объявления.
 *
 * Правила: варианты — польские фразы (или переводы, если вопрос о значении); верный вариант — `answer`, порядок на экране
 * перемешивается при отправке. Пояснение короткое (умещается в подпись к фото вместе с вопросом) и объясняет, почему другие
 * варианты не подходят. Идентификаторы постоянные: на них ссылаются отправленные вопросы в `bot_quiz_rounds`.
 */
import type { UiLang } from '@polski-go/shared';

export type L4 = Record<UiLang, string>;
export type QuizCategory = 'shopping' | 'food' | 'transport' | 'city' | 'work' | 'health' | 'everyday' | 'grammar' | 'talk';
export type QuizKind = 'situation' | 'meaning' | 'complete' | 'preposition' | 'verb' | 'reply' | 'listen' | 'translate';
export type QuizQuestion = {
  id: string;
  category: QuizCategory;
  cefr: 'A1' | 'A2' | 'B1';
  kind: QuizKind;
  prompt: L4;
  /** Польские варианты (одинаковые для всех языков) или переводы по языкам. */
  options: string[] | Record<UiLang, string[]>;
  answer: number;
  explain: L4;
};

export const CATEGORY_NAMES: Record<QuizCategory, L4> = {
  shopping: { ru: 'Покупки', uk: 'Покупки', en: 'Shopping' },
  food: { ru: 'Еда и кафе', uk: 'Їжа і кафе', en: 'Food and cafés' },
  transport: { ru: 'Транспорт', uk: 'Транспорт', en: 'Transport' },
  city: { ru: 'Город и urząd', uk: 'Місто й urząd', en: 'City and offices' },
  work: { ru: 'Работа', uk: 'Робота', en: 'Work' },
  health: { ru: 'Здоровье', uk: "Здоров'я", en: 'Health' },
  everyday: { ru: 'Быт', uk: 'Побут', en: 'Everyday life' },
  grammar: { ru: 'Грамматика', uk: 'Граматика', en: 'Grammar' },
  talk: { ru: 'Общение', uk: 'Спілкування', en: 'Small talk' },
};

const q = (x: QuizQuestion) => x;

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  // ───────────── Покупки ─────────────
  q({
    id: 'shop-bag', category: 'shopping', cefr: 'A1', kind: 'situation',
    prompt: {
      ru: 'Ты в Żabce и хочешь пакет. Что скажешь на кассе?',
      uk: 'Ти в Żabce й хочеш пакет. Що скажеш на касі?',
      en: "You're in Żabka and need a bag. What do you say at the till?",
    },
    options: ['Poproszę reklamówkę.', 'Mam reklamówkę.', 'Gdzie jest kasa?', 'Nie ma torby.'],
    answer: 0,
    explain: {
      ru: '«Poproszę…» — вежливо попросить что-то. Reklamówka — пакет на кассе (говорят и «torba», «siatka»). «Mam» — «у меня есть», «Nie ma» — «нет».',
      uk: '«Poproszę…» — ввічливо щось попросити. Reklamówka — пакет на касі (кажуть і «torba», «siatka»). «Mam» — «у мене є», «Nie ma» — «немає».',
      en: '«Poproszę…» is the polite way to ask for something. A reklamówka is a carrier bag (also «torba», «siatka»). «Mam» means "I have", «Nie ma» — "there isn\'t".',
    },
  }),
  q({
    id: 'shop-paragon', category: 'shopping', cefr: 'A1', kind: 'meaning',
    prompt: { ru: 'Что значит «paragon»?', uk: 'Що означає «paragon»?', en: 'What does «paragon» mean?' },
    options: {
      ru: ['чек', 'скидка', 'очередь', 'сдача'],
      uk: ['чек', 'знижка', 'черга', 'решта'],
      en: ['receipt', 'discount', 'queue', 'change'],
    },
    answer: 0,
    explain: {
      ru: 'Paragon — кассовый чек. Кассир часто спрашивает коротко: «Paragon?» — нужен ли чек. Скидка — «zniżka», очередь — «kolejka», сдача — «reszta».',
      uk: 'Paragon — касовий чек. Касир часто питає коротко: «Paragon?» — чи потрібен чек. Знижка — «zniżka», черга — «kolejka», решта — «reszta».',
      en: 'A paragon is a till receipt; cashiers often just ask «Paragon?». Discount is «zniżka», queue — «kolejka», change — «reszta».',
    },
  }),
  q({
    id: 'shop-card', category: 'shopping', cefr: 'A1', kind: 'reply',
    prompt: {
      ru: 'Кассир: «Kartą czy gotówką?» Ты хочешь заплатить картой. Что ответишь?',
      uk: 'Касир: «Kartą czy gotówką?» Ти хочеш заплатити карткою. Що відповіси?',
      en: 'The cashier asks: «Kartą czy gotówką?» You want to pay by card. What do you say?',
    },
    options: ['Kartą, poproszę.', 'Gotówką, proszę.', 'Karta jest droga.', 'Nie mam czasu.'],
    answer: 0,
    explain: {
      ru: '«Kartą» — картой, «gotówką» — наличными (творительный падеж). Хватит короткого «Kartą, poproszę».',
      uk: '«Kartą» — карткою, «gotówką» — готівкою (орудний відмінок). Досить короткого «Kartą, poproszę».',
      en: '«Kartą» means by card, «gotówką» — in cash (instrumental case). A short «Kartą, poproszę» is enough.',
    },
  }),
  q({
    id: 'shop-kosztuje', category: 'shopping', cefr: 'A2', kind: 'complete',
    prompt: {
      ru: 'Вставь слово: «Ile ___ ten chleb?»',
      uk: 'Встав слово: «Ile ___ ten chleb?»',
      en: 'Fill in the gap: «Ile ___ ten chleb?»',
    },
    options: ['kosztuje', 'kosztują', 'koszt', 'kosztować'],
    answer: 0,
    explain: {
      ru: 'Chleb — один предмет, поэтому «kosztuje». Для нескольких: «Ile kosztują te bułki?». «Koszt» — существительное, «kosztować» — инфинитив.',
      uk: 'Chleb — один предмет, тому «kosztuje». Для кількох: «Ile kosztują te bułki?». «Koszt» — іменник, «kosztować» — інфінітив.',
      en: 'Chleb is one item, so «kosztuje». For several: «Ile kosztują te bułki?». «Koszt» is a noun and «kosztować» the infinitive.',
    },
  }),
  q({
    id: 'shop-gratis', category: 'shopping', cefr: 'A1', kind: 'meaning',
    prompt: {
      ru: 'На ценнике: «Promocja: 2 + 1 gratis». Что это значит?',
      uk: 'На ціннику: «Promocja: 2 + 1 gratis». Що це означає?',
      en: 'A price tag says «Promocja: 2 + 1 gratis». What does it mean?',
    },
    options: {
      ru: ['купи два — третий бесплатно', 'скидка 21 %', 'не больше двух в руки', 'акция на два дня'],
      uk: ['купи два — третій безкоштовно', 'знижка 21 %', 'не більше двох в одні руки', 'акція на два дні'],
      en: 'buy two, get the third free|21% off|max two per customer|a two-day sale'.split('|'),
    },
    answer: 0,
    explain: {
      ru: '«Gratis» — бесплатно. «2 + 1 gratis»: платишь за два товара, третий получаешь даром. Такие ценники часто бывают в Biedronce и Lidlu.',
      uk: '«Gratis» — безкоштовно. «2 + 1 gratis»: платиш за два товари, третій отримуєш задарма. Такі цінники часто бувають у Biedronce й Lidlu.',
      en: '«Gratis» means free: you pay for two items and get the third one free. Biedronka and Lidl run such offers all the time.',
    },
  }),
  q({
    id: 'shop-milk', category: 'shopping', cefr: 'A1', kind: 'situation',
    prompt: {
      ru: 'Ты не можешь найти молоко. Как спросить продавца?',
      uk: 'Ти не можеш знайти молоко. Як запитати продавця?',
      en: "You can't find the milk. How do you ask a shop assistant?",
    },
    options: ['Przepraszam, gdzie jest mleko?', 'Mleko jest tutaj.', 'Czy pan jest mleko?', 'Ile mleka pan ma?'],
    answer: 0,
    explain: {
      ru: '«Przepraszam, gdzie jest…?» — «Извините, где…?». Универсальная фраза для магазина, вокзала и улицы. «Mleko jest tutaj» — «молоко здесь», это ответ, а не вопрос.',
      uk: '«Przepraszam, gdzie jest…?» — «Перепрошую, де…?». Універсальна фраза для магазину, вокзалу й вулиці. «Mleko jest tutaj» — «молоко тут», це відповідь, а не питання.',
      en: '«Przepraszam, gdzie jest…?» — "Excuse me, where is…?" works in shops, stations and streets. «Mleko jest tutaj» is an answer, not a question.',
    },
  }),
  q({
    id: 'shop-nie-ma', category: 'shopping', cefr: 'A2', kind: 'complete',
    prompt: {
      ru: 'Продавец: «Niestety, nie ma już ___.» (хлеба) Какая форма верная?',
      uk: 'Продавець: «Niestety, nie ma już ___.» (хліба) Яка форма правильна?',
      en: 'The assistant says: «Niestety, nie ma już ___.» (bread) Which form is right?',
    },
    options: ['chleba', 'chleb', 'chlebem', 'chlebie'],
    answer: 0,
    explain: {
      ru: 'После «nie ma» — родительный падеж: chleb → chleba. «Nie ma chleba» — хлеба нет. «Chlebem» — творительный, «chlebie» — местный.',
      uk: 'Після «nie ma» — родовий відмінок: chleb → chleba. «Nie ma chleba» — хліба немає. «Chlebem» — орудний, «chlebie» — місцевий.',
      en: 'After «nie ma» ("there is no") Polish uses the genitive: chleb → chleba. «Chlebem» is instrumental, «chlebie» locative.',
    },
  }),
  q({
    id: 'shop-loyalty', category: 'shopping', cefr: 'A2', kind: 'reply',
    prompt: {
      ru: 'Кассир: «Czy ma pani/pan kartę Moja Biedronka?» Карты у тебя нет. Что ответишь?',
      uk: 'Касир: «Czy ma pani/pan kartę Moja Biedronka?» Картки в тебе немає. Що відповіси?',
      en: 'The cashier asks: «Czy ma pani/pan kartę Moja Biedronka?» You don\'t have one. What do you say?',
    },
    options: ['Nie, nie mam.', 'Nie, nie jestem.', 'Tak, nie mam.', 'Nie mam się.'],
    answer: 0,
    explain: {
      ru: 'Отвечают тем же глаголом: «Czy ma…?» → «Nie, nie mam». Двойное «nie» в польском — норма. «Nie jestem» — «я не являюсь», не про наличие.',
      uk: 'Відповідають тим самим дієсловом: «Czy ma…?» → «Nie, nie mam». Подвійне «nie» в польській — норма. «Nie jestem» — «я не є», не про наявність.',
      en: 'Answer with the same verb: «Czy ma…?» → «Nie, nie mam». The double «nie» is normal in Polish. «Nie jestem» means "I am not", not "I don\'t have".',
    },
  }),
  q({
    id: 'shop-przecena', category: 'shopping', cefr: 'B1', kind: 'meaning',
    prompt: {
      ru: 'Продавец: «Ta kurtka jest przeceniona o 30%». Что это значит?',
      uk: 'Продавець: «Ta kurtka jest przeceniona o 30%». Що це означає?',
      en: 'The assistant says: «Ta kurtka jest przeceniona o 30%». What does it mean?',
    },
    options: {
      ru: ['куртка подешевела на 30 %', 'куртка подорожала на 30 %', 'осталось 30 штук', 'вернуть можно за 30 дней'],
      uk: ['куртка подешевшала на 30 %', 'куртка подорожчала на 30 %', 'залишилося 30 штук', 'повернути можна за 30 днів'],
      en: ['the jacket is 30% cheaper', 'the jacket is 30% dearer', '30 pieces are left', 'it can be returned within 30 days'],
    },
    answer: 0,
    explain: {
      ru: '«Przecena» — уценка, «przeceniona» — со сниженной ценой. Ищи таблички «PRZECENA» и «WYPRZEDAŻ» (распродажа). Вернуть товар — «zwrócić».',
      uk: '«Przecena» — уцінка, «przeceniona» — зі зниженою ціною. Шукай таблички «PRZECENA» і «WYPRZEDAŻ» (розпродаж). Повернути товар — «zwrócić».',
      en: '«Przeceniona» means marked down. Look for «PRZECENA» and «WYPRZEDAŻ» (sale) signs. To return an item is «zwrócić».',
    },
  }),

  // ───────────── Еда и кафе ─────────────
  q({
    id: 'food-coffee', category: 'food', cefr: 'A1', kind: 'situation',
    prompt: {
      ru: 'Ты в кафе в Кракове. Что скажешь, чтобы заказать кофе?',
      uk: 'Ти в кав\'ярні в Кракові. Що скажеш, щоб замовити каву?',
      en: "You're in a café in Kraków. What do you say to order a coffee?",
    },
    options: ['Poproszę kawę.', 'Daj mi kawę.', 'Mam kawę.', 'Lubię kawę.'],
    answer: 0,
    explain: {
      ru: '«Poproszę kawę» — вежливая форма заказа, так говорят в кафе и ресторанах. «Daj mi kawę» звучит грубо, «Mam kawę» — «у меня есть кофе», «Lubię kawę» — «я люблю кофе».',
      uk: '«Poproszę kawę» — ввічлива форма замовлення, так кажуть у кафе й ресторанах. «Daj mi kawę» звучить грубо, «Mam kawę» — «у мене є кава», «Lubię kawę» — «я люблю каву».',
      en: '«Poproszę kawę» is the polite way to order. «Daj mi kawę» sounds rude; «Mam kawę» means "I have coffee" and «Lubię kawę» — "I like coffee".',
    },
  }),
  q({
    id: 'food-ruskie', category: 'food', cefr: 'A1', kind: 'meaning',
    prompt: { ru: 'Что такое «pierogi ruskie»?', uk: 'Що таке «pierogi ruskie»?', en: 'What are «pierogi ruskie»?' },
    options: {
      ru: ['вареники с картофелем и творогом', 'вареники с мясом', 'вареники с капустой и грибами', 'сладкие вареники с ягодами'],
      uk: ['вареники з картоплею і сиром', "вареники з м'ясом", 'вареники з капустою і грибами', 'солодкі вареники з ягодами'],
      en: ['dumplings with potato and curd cheese', 'dumplings with meat', 'dumplings with cabbage and mushrooms', 'sweet dumplings with berries'],
    },
    answer: 0,
    explain: {
      ru: 'Pierogi ruskie — с картофелем, творогом (twaróg) и луком. «Ruskie» — от исторической Червонной Руси (Галиция), а не «русские».',
      uk: 'Pierogi ruskie — з картоплею, сиром (twaróg) і цибулею. «Ruskie» — від історичної Червоної Русі (Галичина), а не «російські».',
      en: 'Ruskie are filled with potato, curd cheese (twaróg) and onion. The name comes from historical Red Ruthenia, not from Russia.',
    },
  }),
  q({
    id: 'food-bill', category: 'food', cefr: 'A1', kind: 'situation',
    prompt: {
      ru: 'Обед в ресторане окончен. Как попросить счёт?',
      uk: 'Обід у ресторані закінчено. Як попросити рахунок?',
      en: "You've finished eating in a restaurant. How do you ask for the bill?",
    },
    options: ['Poproszę rachunek.', 'Poproszę menu.', 'Poproszę stolik.', 'Smacznego!'],
    answer: 0,
    explain: {
      ru: 'Rachunek — счёт. Menu — меню, stolik — столик, «Smacznego!» — «Приятного аппетита!». Можно добавить: «Czy mogę zapłacić kartą?»',
      uk: 'Rachunek — рахунок. Menu — меню, stolik — столик, «Smacznego!» — «Смачного!». Можна додати: «Czy mogę zapłacić kartą?»',
      en: 'Rachunek is the bill. Menu, stolik (table) and «Smacznego!» (enjoy your meal) belong to the start of the meal.',
    },
  }),
  q({
    id: 'food-smacznego', category: 'food', cefr: 'A1', kind: 'reply',
    prompt: {
      ru: 'Официант ставит тарелку и говорит: «Smacznego!» Что ответить?',
      uk: 'Офіціант ставить тарілку й каже: «Smacznego!» Що відповісти?',
      en: 'The waiter serves your plate and says «Smacznego!». What do you answer?',
    },
    options: ['Dziękuję!', 'Proszę bardzo!', 'Na zdrowie!', 'Dzień dobry!'],
    answer: 0,
    explain: {
      ru: '«Smacznego!» — «Приятного аппетита!», ответ — «Dziękuję!». «Proszę bardzo» говорит тот, кто подаёт. «Na zdrowie!» — тост или «будь здоров» при чихании.',
      uk: '«Smacznego!» — «Смачного!», відповідь — «Dziękuję!». «Proszę bardzo» каже той, хто подає. «Na zdrowie!» — тост або «будь здоровий», коли хтось чхнув.',
      en: 'Answer «Smacznego!» with «Dziękuję!». «Proszę bardzo» is what the server says; «Na zdrowie!» is a toast or "bless you".',
    },
  }),
  q({
    id: 'food-butelki', category: 'food', cefr: 'A2', kind: 'complete',
    prompt: {
      ru: 'Вставь: «Poproszę dwie ___ wody.» (бутылки)',
      uk: 'Встав: «Poproszę dwie ___ wody.» (пляшки)',
      en: 'Fill in: «Poproszę dwie ___ wody.» (bottles)',
    },
    options: ['butelki', 'butelka', 'butelek', 'butelką'],
    answer: 0,
    explain: {
      ru: 'После 2, 3, 4 — именительный падеж мн. ч.: dwie butelki. После 5 и больше — родительный: pięć butelek. «Butelką» — творительный.',
      uk: 'Після 2, 3, 4 — називний відмінок множини: dwie butelki. Після 5 і більше — родовий: pięć butelek. «Butelką» — орудний.',
      en: 'After 2, 3 and 4 Polish uses the nominative plural: dwie butelki. From five on — the genitive: pięć butelek.',
    },
  }),
  q({
    id: 'food-na-wynos', category: 'food', cefr: 'A2', kind: 'meaning',
    prompt: {
      ru: 'Кассир спрашивает: «Na miejscu czy na wynos?» Что значит «na wynos»?',
      uk: 'Касир питає: «Na miejscu czy na wynos?» Що означає «na wynos»?',
      en: 'The cashier asks «Na miejscu czy na wynos?». What does «na wynos» mean?',
    },
    options: {
      ru: ['с собой', 'здесь, в зале', 'с доставкой', 'без сахара'],
      uk: ['із собою', 'тут, у залі', 'з доставкою', 'без цукру'],
      en: ['to take away', 'to eat in', 'delivered', 'without sugar'],
    },
    answer: 0,
    explain: {
      ru: '«Na wynos» — с собой, «na miejscu» — здесь, в зале. Доставка — «dostawa», сахар — «cukier».',
      uk: '«Na wynos» — із собою, «na miejscu» — тут, у залі. Доставка — «dostawa», цукор — «cukier».',
      en: '«Na wynos» is takeaway, «na miejscu» — eating in. Delivery is «dostawa».',
    },
  }),
  q({
    id: 'food-no-meat', category: 'food', cefr: 'A2', kind: 'translate',
    prompt: {
      ru: 'Ты не ешь мясо. Как сказать официанту?',
      uk: "Ти не їси м'яса. Як сказати офіціантові?",
      en: "You don't eat meat. How do you tell the waiter?",
    },
    options: ['Nie jem mięsa.', 'Nie lubię mięso.', 'Nie mam mięsa.', 'Nie jestem mięso.'],
    answer: 0,
    explain: {
      ru: 'После отрицания — родительный падеж: mięso → mięsa, поэтому «Nie lubię mięso» — ошибка. «Nie jem mięsa» — я не ем мясо. Можно добавить: «Jestem wegetarianinem / wegetarianką».',
      uk: "Після заперечення — родовий відмінок: mięso → mięsa, тому «Nie lubię mięso» — помилка. «Nie jem mięsa» — я не їм м'яса. Можна додати: «Jestem wegetarianinem / wegetarianką».",
      en: 'After a negation Polish uses the genitive: mięso → mięsa, so «Nie lubię mięso» is wrong. You can add «Jestem wegetarianinem / wegetarianką».',
    },
  }),
  q({
    id: 'food-zurek', category: 'food', cefr: 'B1', kind: 'listen',
    prompt: {
      ru: 'Официант: «Niestety, żurku już nie ma, ale polecam rosół.» Что он сказал?',
      uk: 'Офіціант: «Niestety, żurku już nie ma, ale polecam rosół.» Що він сказав?',
      en: 'The waiter says: «Niestety, żurku już nie ma, ale polecam rosół.» What did he say?',
    },
    options: {
      ru: ['журека нет, советует бульон', 'журек будет через минуту', 'закончились и журек, и бульон', 'журек сегодня бесплатно'],
      uk: ['журеку немає, радить бульйон', 'журек буде за хвилину', 'закінчилися і журек, і бульйон', 'журек сьогодні безкоштовно'],
      en: ["there's no żurek, he recommends broth", 'the żurek will be ready soon', "they're out of both soups", 'żurek is free today'],
    },
    answer: 0,
    explain: {
      ru: '«Niestety… już nie ma» — «к сожалению, уже нет». «Polecam» — «рекомендую». Rosół — куриный бульон, классика польского обеда.',
      uk: '«Niestety… już nie ma» — «на жаль, уже немає». «Polecam» — «раджу». Rosół — курячий бульйон, класика польського обіду.',
      en: '«Niestety… już nie ma» — "sorry, there\'s none left". «Polecam» — "I recommend". Rosół is chicken broth, a Polish Sunday classic.',
    },
  }),
  q({
    id: 'food-pay-card', category: 'food', cefr: 'A2', kind: 'verb',
    prompt: {
      ru: 'Вставь: «Czy mogę ___ kartą?» (заплатить)',
      uk: 'Встав: «Czy mogę ___ kartą?» (заплатити)',
      en: 'Fill in: «Czy mogę ___ kartą?» (to pay)',
    },
    options: ['zapłacić', 'płacę', 'płaci', 'zapłacę'],
    answer: 0,
    explain: {
      ru: 'После «mogę» — инфинитив: «Czy mogę zapłacić kartą?» — «Можно оплатить картой?». Ответ: «Oczywiście!» или «Niestety, tylko gotówką».',
      uk: 'Після «mogę» — інфінітив: «Czy mogę zapłacić kartą?» — «Можна оплатити карткою?». Відповідь: «Oczywiście!» або «Niestety, tylko gotówką».',
      en: '«Mogę» is followed by the infinitive: «Czy mogę zapłacić kartą?». Answers: «Oczywiście!» or «Niestety, tylko gotówką».',
    },
  }),

  // ───────────── Транспорт ─────────────
  q({
    id: 'tr-peron', category: 'transport', cefr: 'A1', kind: 'situation',
    prompt: {
      ru: 'Ты на вокзале. Как спросить, с какой платформы уходит поезд в Краков?',
      uk: 'Ти на вокзалі. Як запитати, з якої платформи відходить потяг до Кракова?',
      en: "You're at the station. How do you ask which platform the Kraków train leaves from?",
    },
    options: ['Z którego peronu odjeżdża pociąg do Krakowa?', 'Ile kosztuje pociąg?', 'Gdzie jest Kraków?', 'Czy to jest peron?'],
    answer: 0,
    explain: {
      ru: 'Peron — платформа, tor — путь, «odjeżdża» — отправляется. На табло: «Odjazdy» — отправление, «Przyjazdy» — прибытие.',
      uk: 'Peron — платформа, tor — колія, «odjeżdża» — відправляється. На табло: «Odjazdy» — відправлення, «Przyjazdy» — прибуття.',
      en: 'Peron is the platform, tor — the track, «odjeżdża» — departs. Boards show «Odjazdy» (departures) and «Przyjazdy» (arrivals).',
    },
  }),
  q({
    id: 'tr-ulgowy', category: 'transport', cefr: 'A1', kind: 'meaning',
    prompt: { ru: 'Что значит «bilet ulgowy»?', uk: 'Що означає «bilet ulgowy»?', en: 'What is a «bilet ulgowy»?' },
    options: {
      ru: ['льготный билет', 'билет туда и обратно', 'дневной билет', 'штраф'],
      uk: ['пільговий квиток', 'квиток туди й назад', 'денний квиток', 'штраф'],
      en: ['a reduced-fare ticket', 'a return ticket', 'a day ticket', 'a fine'],
    },
    answer: 0,
    explain: {
      ru: '«Ulgowy» — льготный (студентам, детям, пенсионерам), «normalny» — полный. Без документа о льготе контролёр выпишет штраф — «mandat».',
      uk: '«Ulgowy» — пільговий (студентам, дітям, пенсіонерам), «normalny» — повний. Без документа про пільгу контролер випише штраф — «mandat».',
      en: '«Ulgowy» is reduced (students, children, seniors), «normalny» — full fare. Without proof of the discount you get a fine — «mandat».',
    },
  }),
  q({
    id: 'tr-do-warszawy', category: 'transport', cefr: 'A1', kind: 'preposition',
    prompt: {
      ru: 'Вставь предлог: «Jadę ___ Warszawy.»',
      uk: 'Встав прийменник: «Jadę ___ Warszawy.»',
      en: 'Add the preposition: «Jadę ___ Warszawy.»',
    },
    options: ['do', 'na', 'w', 'z'],
    answer: 0,
    explain: {
      ru: 'В город — «do» + родительный падеж: do Warszawy, do Krakowa. «Na» — на мероприятие или «открытое» место: na dworzec, na koncert. «Z Warszawy» — из Варшавы.',
      uk: 'До міста — «do» + родовий відмінок: do Warszawy, do Krakowa. «Na» — на подію або «відкрите» місце: na dworzec, na koncert. «Z Warszawy» — з Варшави.',
      en: 'To a city is «do» + genitive: do Warszawy, do Krakowa. «Na» is for events and some places: na dworzec, na koncert. «Z» means "from".',
    },
  }),
  q({
    id: 'tr-skasowac', category: 'transport', cefr: 'A2', kind: 'situation',
    prompt: {
      ru: 'Ты заходишь в трамвай с бумажным билетом. Что нужно сделать сразу?',
      uk: 'Ти заходиш у трамвай з паперовим квитком. Що треба зробити одразу?',
      en: 'You get on a tram with a paper ticket. What must you do right away?',
    },
    options: {
      ru: ['пробить его в компостере', 'отдать водителю', 'ничего, просто держать', 'показать на выходе'],
      uk: ['закомпостувати його', 'віддати водієві', 'нічого, просто тримати', 'показати на виході'],
      en: ['validate it in the machine', 'hand it to the driver', 'nothing, just keep it', 'show it when leaving'],
    },
    answer: 0,
    explain: {
      ru: 'Бумажный билет нужно «skasować» в компостере (kasownik) сразу после входа. Непробитый билет — как поездка без билета: штраф.',
      uk: 'Паперовий квиток треба «skasować» у компостері (kasownik) одразу після входу. Незакомпостований квиток — як поїздка без квитка: штраф.',
      en: 'A paper ticket must be «skasowany» in the validator (kasownik) as soon as you board. Unvalidated means no ticket — and a fine.',
    },
  }),
  q({
    id: 'tr-przesiadka', category: 'transport', cefr: 'A2', kind: 'meaning',
    prompt: {
      ru: '«Mam przesiadkę w Poznaniu.» Что такое «przesiadka»?',
      uk: '«Mam przesiadkę w Poznaniu.» Що таке «przesiadka»?',
      en: '«Mam przesiadkę w Poznaniu.» What is a «przesiadka»?',
    },
    options: {
      ru: ['пересадка', 'посадка в самолёт', 'остановка по требованию', 'место для сидения'],
      uk: ['пересадка', 'посадка в літак', 'зупинка на вимогу', 'місце для сидіння'],
      en: ['a change of train or bus', 'boarding a plane', 'a request stop', 'a seat'],
    },
    answer: 0,
    explain: {
      ru: '«Przesiadka» — пересадка: «Mam przesiadkę w Poznaniu» — у меня пересадка в Познани. Остановка — «przystanek», место — «miejsce».',
      uk: '«Przesiadka» — пересадка: «Mam przesiadkę w Poznaniu» — у мене пересадка в Познані. Зупинка — «przystanek», місце — «miejsce».',
      en: 'A przesiadka is a change of train or bus on the way. A stop is «przystanek», a seat — «miejsce».',
    },
  }),
  q({
    id: 'tr-next-stop', category: 'transport', cefr: 'A2', kind: 'situation',
    prompt: {
      ru: 'Ты в автобусе. Как спросить, какая следующая остановка?',
      uk: 'Ти в автобусі. Як запитати, яка наступна зупинка?',
      en: "You're on a bus. How do you ask what the next stop is?",
    },
    options: ['Jaki jest następny przystanek?', 'Gdzie jest autobus?', 'Ile przystanków jest?', 'Kto jest kierowcą?'],
    answer: 0,
    explain: {
      ru: '«Następny» — следующий, «przystanek» — остановка. В салоне объявляют: «Następny przystanek: Rynek».',
      uk: '«Następny» — наступний, «przystanek» — зупинка. У салоні оголошують: «Następny przystanek: Rynek».',
      en: '«Następny» means next, «przystanek» — stop. Buses announce «Następny przystanek: Rynek».',
    },
  }),
  q({
    id: 'tr-na-zadanie', category: 'transport', cefr: 'A2', kind: 'meaning',
    prompt: {
      ru: 'На остановке табличка «Przystanek na żądanie». Что это?',
      uk: 'На зупинці табличка «Przystanek na żądanie». Що це?',
      en: 'A stop has the sign «Przystanek na żądanie». What is it?',
    },
    options: {
      ru: ['остановка по требованию', 'конечная остановка', 'остановка закрыта', 'остановка ночного автобуса'],
      uk: ['зупинка на вимогу', 'кінцева зупинка', 'зупинка закрита', 'зупинка нічного автобуса'],
      en: ['a request stop', 'the last stop', 'a closed stop', 'a night-bus stop'],
    },
    answer: 0,
    explain: {
      ru: '«Na żądanie» — по требованию: в салоне нажми кнопку «STOP», а на остановке подними руку, иначе водитель проедет мимо. Конечная — «pętla».',
      uk: '«Na żądanie» — на вимогу: у салоні натисни кнопку «STOP», а на зупинці підніми руку, інакше водій проїде повз. Кінцева — «pętla».',
      en: 'At a request stop press «STOP» inside or raise your hand at the stop, or the driver won\'t stop. The last stop is «pętla».',
    },
  }),
  q({
    id: 'tr-opozniony', category: 'transport', cefr: 'B1', kind: 'listen',
    prompt: {
      ru: 'Объявление: «Pociąg do Gdańska jest opóźniony o 20 minut.» Что случилось?',
      uk: 'Оголошення: «Pociąg do Gdańska jest opóźniony o 20 minut.» Що сталося?',
      en: 'Announcement: «Pociąg do Gdańska jest opóźniony o 20 minut.» What happened?',
    },
    options: {
      ru: ['поезд опаздывает на 20 минут', 'поезд уйдёт через 20 минут', 'поезд отменён', 'поезд прибыл на 20-й путь'],
      uk: ['потяг запізнюється на 20 хвилин', 'потяг відійде за 20 хвилин', 'потяг скасовано', 'потяг прибув на 20-ту колію'],
      en: ['the train is 20 minutes late', 'the train leaves in 20 minutes', 'the train is cancelled', 'the train is on track 20'],
    },
    answer: 0,
    explain: {
      ru: '«Opóźniony» — задерживается, «opóźnienie» — задержка, «odwołany» — отменён. «Za 20 minut» значило бы «через 20 минут».',
      uk: '«Opóźniony» — затримується, «opóźnienie» — затримка, «odwołany» — скасований. «Za 20 minut» означало б «за 20 хвилин».',
      en: '«Opóźniony» means delayed, «odwołany» — cancelled. «Za 20 minut» would mean "in 20 minutes".',
    },
  }),
  q({
    id: 'tr-jade-tramwajem', category: 'transport', cefr: 'A2', kind: 'verb',
    prompt: {
      ru: 'Ты едешь на работу на трамвае. Как сказать?',
      uk: 'Ти їдеш на роботу трамваєм. Як сказати?',
      en: "You're going to work by tram. How do you say it?",
    },
    options: ['Jadę do pracy tramwajem.', 'Idę do pracy tramwajem.', 'Jadę do pracy tramwaj.', 'Lecę do pracy tramwajem.'],
    answer: 0,
    explain: {
      ru: '«Iść» — идти пешком, «jechać» — ехать на транспорте, «lecieć» — лететь. Транспорт — в творительном падеже: tramwajem, autobusem, pociągiem.',
      uk: '«Iść» — іти пішки, «jechać» — їхати транспортом, «lecieć» — летіти. Транспорт — в орудному відмінку: tramwajem, autobusem, pociągiem.',
      en: '«Iść» is on foot, «jechać» — by vehicle, «lecieć» — by air. The vehicle takes the instrumental: tramwajem, autobusem, pociągiem.',
    },
  }),

  // ───────────── Город и urząd ─────────────
  q({
    id: 'city-urzad', category: 'city', cefr: 'A2', kind: 'meaning',
    prompt: { ru: 'Что такое «urząd»?', uk: 'Що таке «urząd»?', en: 'What is a «urząd»?' },
    options: {
      ru: ['госучреждение, ведомство', 'университет', 'ресторан', 'вокзал'],
      uk: ['державна установа', 'університет', 'ресторан', 'вокзал'],
      en: ['a government office', 'a university', 'a restaurant', 'a station'],
    },
    answer: 0,
    explain: {
      ru: 'Urząd — государственное учреждение: urząd miasta — мэрия, urząd wojewódzki — там оформляют karta pobytu. Университет — «uczelnia» или «uniwersytet».',
      uk: 'Urząd — державна установа: urząd miasta — міська рада, urząd wojewódzki — там оформлюють karta pobytu. Університет — «uczelnia» або «uniwersytet».',
      en: 'A urząd is a public office: urząd miasta (city hall), urząd wojewódzki — where residence cards (karta pobytu) are issued.',
    },
  }),
  q({
    id: 'city-numerek', category: 'city', cefr: 'A2', kind: 'situation',
    prompt: {
      ru: 'В urzędzie ты берёшь в автомате талончик очереди. Как он называется?',
      uk: 'В urzędzie ти береш в автоматі талончик черги. Як він називається?',
      en: 'At the office you take a queue ticket from a machine. What is it called?',
    },
    options: ['numerek', 'bilet', 'paragon', 'karta'],
    answer: 0,
    explain: {
      ru: '«Numerek» — номер в электронной очереди. На табло: «Numer A123 — stanowisko 5», то есть окошко 5. Bilet — проездной, paragon — чек.',
      uk: '«Numerek» — номер в електронній черзі. На табло: «Numer A123 — stanowisko 5», тобто віконце 5. Bilet — проїзний, paragon — чек.',
      en: 'A numerek is your queue number. The screen shows e.g. «A123 — stanowisko 5» (desk 5). A bilet is a travel ticket, a paragon — a receipt.',
    },
  }),
  q({
    id: 'city-dworzec', category: 'city', cefr: 'A1', kind: 'situation',
    prompt: {
      ru: 'Как спросить прохожего дорогу к вокзалу?',
      uk: 'Як запитати перехожого дорогу до вокзалу?',
      en: 'How do you ask a passer-by the way to the station?',
    },
    options: ['Jak dojść na dworzec?', 'Gdzie jest pociąg?', 'Kiedy jest dworzec?', 'Czy dworzec jest drogi?'],
    answer: 0,
    explain: {
      ru: '«Jak dojść do / na…?» — «Как дойти до…?». С вокзалом говорят «na dworzec». Ответ может быть: «Prosto, potem w lewo» — прямо, потом налево.',
      uk: '«Jak dojść do / na…?» — «Як дійти до…?». З вокзалом кажуть «na dworzec». Відповідь може бути: «Prosto, potem w lewo» — прямо, потім ліворуч.',
      en: '«Jak dojść do / na…?» asks the way on foot; with a station it is «na dworzec». A typical reply: «Prosto, potem w lewo».',
    },
  }),
  q({
    id: 'city-w-prawo', category: 'city', cefr: 'A2', kind: 'listen',
    prompt: {
      ru: 'Прохожий: «Proszę iść prosto, a potem skręcić w prawo.» Куда идти?',
      uk: 'Перехожий: «Proszę iść prosto, a potem skręcić w prawo.» Куди йти?',
      en: 'A passer-by says: «Proszę iść prosto, a potem skręcić w prawo.» Which way?',
    },
    options: {
      ru: ['прямо, потом направо', 'прямо, потом налево', 'назад, потом направо', 'направо, потом прямо'],
      uk: ['прямо, потім праворуч', 'прямо, потім ліворуч', 'назад, потім праворуч', 'праворуч, потім прямо'],
      en: ['straight on, then right', 'straight on, then left', 'back, then right', 'right, then straight on'],
    },
    answer: 0,
    explain: {
      ru: '«Prosto» — прямо, «w prawo» — направо, «w lewo» — налево, «skręcić» — повернуть, «z powrotem» — назад.',
      uk: '«Prosto» — прямо, «w prawo» — праворуч, «w lewo» — ліворуч, «skręcić» — повернути, «z powrotem» — назад.',
      en: '«Prosto» is straight on, «w prawo» — right, «w lewo» — left, «skręcić» — to turn, «z powrotem» — back.',
    },
  }),
  q({
    id: 'city-wizyta', category: 'city', cefr: 'A2', kind: 'situation',
    prompt: {
      ru: 'Тебе нужно записаться на приём в urząd. Что скажешь по телефону?',
      uk: 'Тобі треба записатися на прийом в urząd. Що скажеш телефоном?',
      en: 'You need an appointment at the office. What do you say on the phone?',
    },
    options: ['Chcę umówić wizytę.', 'Chcę zamknąć wizytę.', 'Mam wizytę w domu.', 'Wizyta jest tania.'],
    answer: 0,
    explain: {
      ru: '«Umówić wizytę» — записаться на приём. Ещё вежливее: «Chciałbym / Chciałabym umówić wizytę» (форма по роду говорящего).',
      uk: '«Umówić wizytę» — записатися на прийом. Ще ввічливіше: «Chciałbym / Chciałabym umówić wizytę» (форма за родом мовця).',
      en: '«Umówić wizytę» means to book an appointment. Even politer: «Chciałbym / Chciałabym umówić wizytę» (form depends on your gender).',
    },
  }),
  q({
    id: 'city-pesel', category: 'city', cefr: 'A2', kind: 'meaning',
    prompt: { ru: 'Что такое PESEL?', uk: 'Що таке PESEL?', en: 'What is a PESEL?' },
    options: {
      ru: ['личный идентификационный номер', 'налоговая декларация', 'проездной на транспорт', 'банковский счёт'],
      uk: ['особистий ідентифікаційний номер', 'податкова декларація', 'проїзний на транспорт', 'банківський рахунок'],
      en: ['a personal ID number', 'a tax return', 'a transport pass', 'a bank account'],
    },
    answer: 0,
    explain: {
      ru: 'PESEL — 11-значный личный номер. Его спрашивают у врача, в банке и в urzędzie. Иностранцы получают его в urzędzie gminy (в мэрии).',
      uk: 'PESEL — 11-значний особистий номер. Його питають у лікаря, в банку та в urzędzie. Іноземці отримують його в urzędzie gminy (у міській раді).',
      en: 'PESEL is an 11-digit personal number. Doctors, banks and offices ask for it. Foreigners get one at the local urząd gminy.',
    },
  }),

  // ───────────── Работа ─────────────
  q({
    id: 'work-umowa', category: 'work', cefr: 'A2', kind: 'meaning',
    prompt: { ru: 'Что значит «umowa o pracę»?', uk: 'Що означає «umowa o pracę»?', en: 'What is an «umowa o pracę»?' },
    options: {
      ru: ['трудовой договор', 'договор аренды', 'заявление на отпуск', 'резюме'],
      uk: ['трудовий договір', 'договір оренди', 'заява на відпустку', 'резюме'],
      en: ['an employment contract', 'a rental agreement', 'a leave request', 'a CV'],
    },
    answer: 0,
    explain: {
      ru: '«Umowa o pracę» — трудовой договор с отпуском и больничным. Есть ещё «umowa zlecenie» — договор поручения с меньшими гарантиями. Аренда — «umowa najmu».',
      uk: '«Umowa o pracę» — трудовий договір з відпусткою й лікарняним. Є ще «umowa zlecenie» — договір доручення з меншими гарантіями. Оренда — «umowa najmu».',
      en: 'An «umowa o pracę» is a full employment contract with paid leave and sick pay. «Umowa zlecenie» gives fewer rights; «umowa najmu» is a lease.',
    },
  }),
  q({
    id: 'work-sick', category: 'work', cefr: 'A2', kind: 'situation',
    prompt: {
      ru: 'У тебя температура, и на работу ты не придёшь. Что напишешь начальнику?',
      uk: 'У тебе температура, і на роботу ти не прийдеш. Що напишеш керівникові?',
      en: "You're ill and won't come to work. What do you text your boss?",
    },
    options: ['Źle się czuję, nie przyjdę dziś.', 'Dobrze się czuję, przyjdę jutro.', 'Nie lubię dziś pracować.', 'Mam urlop od wczoraj.'],
    answer: 0,
    explain: {
      ru: '«Źle się czuję» — я плохо себя чувствую, «nie przyjdę» — не приду. Больничный от врача называют «zwolnienie lekarskie» или просто «L4».',
      uk: '«Źle się czuję» — я погано почуваюся, «nie przyjdę» — не прийду. Лікарняний від лікаря називають «zwolnienie lekarskie» або просто «L4».',
      en: '«Źle się czuję» — I feel unwell, «nie przyjdę» — I won\'t come. A doctor\'s sick note is «zwolnienie lekarskie», colloquially «L4».',
    },
  }),
  q({
    id: 'work-o-ktorej', category: 'work', cefr: 'A2', kind: 'complete',
    prompt: {
      ru: 'Вставь: «___ zaczynasz pracę?» — «Во сколько начинаешь работу?»',
      uk: 'Встав: «___ zaczynasz pracę?» — «О котрій починаєш роботу?»',
      en: 'Fill in: «___ zaczynasz pracę?» — "What time do you start work?"',
    },
    options: ['O której', 'Która', 'Ile', 'Kiedy jest'],
    answer: 0,
    explain: {
      ru: '«O której?» — во сколько? Ответ: «O ósmej» — в восемь. «Która godzina?» — который час? «Ile?» — сколько (количество).',
      uk: '«O której?» — о котрій? Відповідь: «O ósmej» — о восьмій. «Która godzina?» — котра година? «Ile?» — скільки (кількість).',
      en: '«O której?» asks at what time: «O ósmej» (at eight). «Która godzina?» asks the current time; «Ile?» asks how many.',
    },
  }),
  q({
    id: 'work-nadgodziny', category: 'work', cefr: 'B1', kind: 'meaning',
    prompt: { ru: 'Что такое «nadgodziny»?', uk: 'Що таке «nadgodziny»?', en: 'What are «nadgodziny»?' },
    options: {
      ru: ['сверхурочные часы', 'обеденный перерыв', 'ночная смена', 'отгул'],
      uk: ['понаднормові години', 'обідня перерва', 'нічна зміна', 'відгул'],
      en: ['overtime hours', 'a lunch break', 'a night shift', 'a day off'],
    },
    answer: 0,
    explain: {
      ru: '«Nadgodziny» — сверхурочная работа, за неё положена доплата. «Zmiana nocna» — ночная смена, «przerwa» — перерыв, «dzień wolny» — выходной.',
      uk: '«Nadgodziny» — понаднормова робота, за неї належить доплата. «Zmiana nocna» — нічна зміна, «przerwa» — перерва, «dzień wolny» — вихідний.',
      en: '«Nadgodziny» are hours worked beyond your schedule, paid extra. A shift is «zmiana», a break — «przerwa», a day off — «dzień wolny».',
    },
  }),
  q({
    id: 'work-wolne', category: 'work', cefr: 'B1', kind: 'situation',
    prompt: {
      ru: 'Как вежливо попросить у начальника выходной в пятницу?',
      uk: 'Як ввічливо попросити в керівника вихідний у п\'ятницю?',
      en: 'How do you politely ask your boss for Friday off?',
    },
    options: ['Czy mogę wziąć wolne w piątek?', 'Daj mi wolne w piątek.', 'W piątek nie ma pracy.', 'Piątek jest wolny?'],
    answer: 0,
    explain: {
      ru: '«Czy mogę…?» — «Можно мне…?». «Wziąć wolne» — взять выходной. «Daj mi…» прозвучит грубо, особенно с начальником.',
      uk: '«Czy mogę…?» — «Чи можна мені…?». «Wziąć wolne» — взяти вихідний. «Daj mi…» прозвучить грубо, особливо з керівником.',
      en: '«Czy mogę…?» — "May I…?"; «wziąć wolne» — to take a day off. «Daj mi…» sounds rude, especially to a boss.',
    },
  }),
  q({
    id: 'work-pracujemy', category: 'work', cefr: 'A2', kind: 'verb',
    prompt: {
      ru: 'Вставь: «My ___ w magazynie.» (работать)',
      uk: 'Встав: «My ___ w magazynie.» (працювати)',
      en: 'Fill in: «My ___ w magazynie.» (to work)',
    },
    options: ['pracujemy', 'pracuję', 'pracują', 'pracować'],
    answer: 0,
    explain: {
      ru: 'My — pracujemy; ja pracuję, ty pracujesz, oni pracują. И осторожно: «magazyn» — склад, а магазин — «sklep».',
      uk: 'My — pracujemy; ja pracuję, ty pracujesz, oni pracują. І обережно: «magazyn» — склад, а магазин — «sklep».',
      en: 'My → pracujemy; ja pracuję, oni pracują. Careful: «magazyn» is a warehouse, a shop is «sklep».',
    },
  }),

  // ───────────── Здоровье ─────────────
  q({
    id: 'health-glowa', category: 'health', cefr: 'A1', kind: 'situation',
    prompt: {
      ru: 'В аптеке: у тебя болит голова. Что скажешь?',
      uk: 'В аптеці: у тебе болить голова. Що скажеш?',
      en: 'At the pharmacy: you have a headache. What do you say?',
    },
    options: ['Boli mnie głowa.', 'Mam głowę.', 'Głowa jest zła.', 'Boli głowę mnie.'],
    answer: 0,
    explain: {
      ru: '«Boli mnie…» — «у меня болит…»: boli mnie głowa / gardło / brzuch. Лекарство — «lek», без рецепта — «bez recepty».',
      uk: '«Boli mnie…» — «у мене болить…»: boli mnie głowa / gardło / brzuch. Ліки — «lek», без рецепта — «bez recepty».',
      en: '«Boli mnie…» — "my … hurts": boli mnie głowa / gardło / brzuch. Medicine is «lek», over the counter — «bez recepty».',
    },
  }),
  q({
    id: 'health-recepta', category: 'health', cefr: 'A2', kind: 'meaning',
    prompt: { ru: 'Что такое «recepta»?', uk: 'Що таке «recepta»?', en: 'What is a «recepta»?' },
    options: {
      ru: ['рецепт врача на лекарство', 'кулинарный рецепт', 'чек из аптеки', 'направление к специалисту'],
      uk: ['рецепт лікаря на ліки', 'кулінарний рецепт', 'чек з аптеки', 'направлення до спеціаліста'],
      en: ["a doctor's prescription", 'a cooking recipe', 'a pharmacy receipt', 'a referral to a specialist'],
    },
    answer: 0,
    explain: {
      ru: '«Recepta» — рецепт на лекарство, чаще электронный (e-recepta: код из SMS). Кулинарный рецепт — «przepis», направление — «skierowanie».',
      uk: '«Recepta» — рецепт на ліки, частіше електронний (e-recepta: код із SMS). Кулінарний рецепт — «przepis», направлення — «skierowanie».',
      en: 'A «recepta» is a prescription, usually an e-recepta with a code by SMS. A recipe is «przepis», a referral — «skierowanie».',
    },
  }),
  q({
    id: 'health-112', category: 'health', cefr: 'A1', kind: 'meaning',
    prompt: {
      ru: 'Какой единый номер экстренной помощи в Польше?',
      uk: 'Який єдиний номер екстреної допомоги в Польщі?',
      en: 'What is the emergency number in Poland?',
    },
    options: ['112', '911', '102', '03'],
    answer: 0,
    explain: {
      ru: '112 — единый экстренный номер в Польше и всём ЕС. Работают и старые: 999 — скорая (pogotowie), 998 — пожарные, 997 — полиция.',
      uk: '112 — єдиний екстрений номер у Польщі та всьому ЄС. Працюють і старі: 999 — швидка (pogotowie), 998 — пожежники, 997 — поліція.',
      en: '112 works across the EU. The old numbers still work too: 999 ambulance (pogotowie), 998 fire brigade, 997 police.',
    },
  }),
  q({
    id: 'health-dawkowanie', category: 'health', cefr: 'B1', kind: 'listen',
    prompt: {
      ru: 'Врач: «Proszę brać ten lek dwa razy dziennie po jedzeniu.» Как принимать?',
      uk: 'Лікар: «Proszę brać ten lek dwa razy dziennie po jedzeniu.» Як приймати?',
      en: 'The doctor says: «Proszę brać ten lek dwa razy dziennie po jedzeniu.» How do you take it?',
    },
    options: {
      ru: ['2 раза в день после еды', '2 раза в день до еды', 'раз в 2 дня после еды', '2 таблетки перед сном'],
      uk: ['2 рази на день після їжі', '2 рази на день до їжі', 'раз на 2 дні після їжі', '2 таблетки перед сном'],
      en: ['twice a day after meals', 'twice a day before meals', 'every 2 days after meals', '2 tablets at bedtime'],
    },
    answer: 0,
    explain: {
      ru: '«Dwa razy dziennie» — два раза в день, «po jedzeniu» — после еды, «przed jedzeniem» — до еды, «na noc» — на ночь, «co dwa dni» — раз в два дня.',
      uk: '«Dwa razy dziennie» — двічі на день, «po jedzeniu» — після їжі, «przed jedzeniem» — до їжі, «na noc» — на ніч, «co dwa dni» — раз на два дні.',
      en: '«Dwa razy dziennie» — twice a day, «po jedzeniu» — after meals; «przed jedzeniem» is before, «na noc» — at night, «co dwa dni» — every two days.',
    },
  }),
  q({
    id: 'health-do-lekarza', category: 'health', cefr: 'A2', kind: 'preposition',
    prompt: {
      ru: 'Вставь предлог: «Muszę iść ___ lekarza.»',
      uk: 'Встав прийменник: «Muszę iść ___ lekarza.»',
      en: 'Add the preposition: «Muszę iść ___ lekarza.»',
    },
    options: ['do', 'na', 'u', 'w'],
    answer: 0,
    explain: {
      ru: 'Идти к врачу — «iść do lekarza» (родительный). А быть у врача — «być u lekarza». Так же: do fryzjera, u fryzjera.',
      uk: 'Іти до лікаря — «iść do lekarza» (родовий). А бути в лікаря — «być u lekarza». Так само: do fryzjera, u fryzjera.',
      en: 'You go «do lekarza» (to the doctor) and you are «u lekarza» (at the doctor\'s). Same with do fryzjera / u fryzjera.',
    },
  }),

  // ───────────── Быт ─────────────
  q({
    id: 'home-kaucja', category: 'everyday', cefr: 'B1', kind: 'meaning',
    prompt: {
      ru: 'Арендодатель просит «kaucję». Что это?',
      uk: 'Орендодавець просить «kaucję». Що це?',
      en: 'The landlord asks for a «kaucja». What is it?',
    },
    options: {
      ru: ['залог за квартиру', 'плата за свет', 'запасные ключи', 'договор аренды'],
      uk: ['застава за квартиру', 'плата за світло', 'запасні ключі', 'договір оренди'],
      en: ['a security deposit', 'the electricity bill', 'spare keys', 'the tenancy agreement'],
    },
    answer: 0,
    explain: {
      ru: '«Kaucja» — залог, обычно в размере месячной аренды; его возвращают при выезде. «Czynsz» — плата за жильё, «media» — свет, газ, вода.',
      uk: '«Kaucja» — застава, зазвичай у розмірі місячної оренди; її повертають під час виїзду. «Czynsz» — плата за житло, «media» — світло, газ, вода.',
      en: 'A «kaucja» is a deposit, usually one month\'s rent, returned when you move out. «Czynsz» is rent, «media» — utilities.',
    },
  }),
  q({
    id: 'home-15', category: 'everyday', cefr: 'A1', kind: 'translate',
    prompt: { ru: 'Как по-польски 15?', uk: 'Як польською 15?', en: 'How do you say 15 in Polish?' },
    options: ['piętnaście', 'pięćdziesiąt', 'pięć', 'pięćset'],
    answer: 0,
    explain: {
      ru: '15 — piętnaście, 50 — pięćdziesiąt, 5 — pięć, 500 — pięćset. Обрати внимание на «ę» в piętnaście.',
      uk: '15 — piętnaście, 50 — pięćdziesiąt, 5 — pięć, 500 — pięćset. Зверни увагу на «ę» у piętnaście.',
      en: '15 — piętnaście, 50 — pięćdziesiąt, 5 — pięć, 500 — pięćset. Mind the «ę» in piętnaście.',
    },
  }),
  q({
    id: 'home-wpol-do', category: 'everyday', cefr: 'B1', kind: 'listen',
    prompt: {
      ru: '«Jest wpół do ósmej.» Который час?',
      uk: '«Jest wpół do ósmej.» Котра година?',
      en: '«Jest wpół do ósmej.» What time is it?',
    },
    options: ['7:30', '8:30', '8:00', '7:45'],
    answer: 0,
    explain: {
      ru: '«Wpół do ósmej» — «половина восьмого», то есть 7:30. Можно сказать и проще: «siódma trzydzieści».',
      uk: '«Wpół do ósmej» — «пів на восьму», тобто 7:30. Можна сказати й простіше: «siódma trzydzieści».',
      en: '«Wpół do ósmej» is "half to eight", i.e. 7:30. You can also say «siódma trzydzieści».',
    },
  }),
  q({
    id: 'home-czwartek', category: 'everyday', cefr: 'A1', kind: 'meaning',
    prompt: {
      ru: 'Какой день идёт после «środa»?',
      uk: 'Який день іде після «środa»?',
      en: 'Which day comes after «środa»?',
    },
    options: ['czwartek', 'wtorek', 'piątek', 'sobota'],
    answer: 0,
    explain: {
      ru: 'Poniedziałek, wtorek, środa, czwartek, piątek, sobota, niedziela. Środa — середина недели, как русская «среда».',
      uk: 'Poniedziałek, wtorek, środa, czwartek, piątek, sobota, niedziela. Środa — середина тижня, як українська «середа».',
      en: 'Monday to Sunday: poniedziałek, wtorek, środa, czwartek, piątek, sobota, niedziela. Środa is Wednesday, so next is czwartek.',
    },
  }),
  q({
    id: 'home-paczkomat', category: 'everyday', cefr: 'A2', kind: 'listen',
    prompt: {
      ru: 'SMS: «Twoja paczka czeka w paczkomacie.» Где посылка?',
      uk: 'SMS: «Twoja paczka czeka w paczkomacie.» Де посилка?',
      en: 'A text says: «Twoja paczka czeka w paczkomacie.» Where is the parcel?',
    },
    options: {
      ru: ['в постамате', 'у соседа', 'на почте', 'у двери'],
      uk: ['у поштоматі', 'у сусіда', 'на пошті', 'біля дверей'],
      en: ['in a parcel locker', 'with a neighbour', 'at the post office', 'at the door'],
    },
    answer: 0,
    explain: {
      ru: '«Paczkomat» — постамат (чаще всего InPost). Код для получения приходит в SMS или в приложении. Почта — «poczta», сосед — «sąsiad».',
      uk: '«Paczkomat» — поштомат (найчастіше InPost). Код для отримання приходить у SMS або в застосунку. Пошта — «poczta», сусід — «sąsiad».',
      en: 'A «paczkomat» is a parcel locker, usually InPost; the pickup code comes by SMS or in the app. The post office is «poczta».',
    },
  }),

  // ───────────── Грамматика в контексте ─────────────
  q({
    id: 'gr-w-krakowie', category: 'grammar', cefr: 'A1', kind: 'preposition',
    prompt: {
      ru: 'Вставь предлог: «Mieszkam ___ Krakowie.»',
      uk: 'Встав прийменник: «Mieszkam ___ Krakowie.»',
      en: 'Add the preposition: «Mieszkam ___ Krakowie.»',
    },
    options: ['w', 'na', 'do', 'z'],
    answer: 0,
    explain: {
      ru: 'Где? В городе — «w» + местный падеж: w Krakowie, w Warszawie, а перед «w» — «we»: we Wrocławiu. «Do» отвечает на «куда?».',
      uk: 'Де? У місті — «w» + місцевий відмінок: w Krakowie, w Warszawie, а перед «w» — «we»: we Wrocławiu. «Do» відповідає на «куди?».',
      en: 'Where? In a city: «w» + locative — w Krakowie, w Warszawie, and «we» before w-: we Wrocławiu. «Do» answers "where to?".',
    },
  }),
  q({
    id: 'gr-jestem', category: 'grammar', cefr: 'A1', kind: 'verb',
    prompt: {
      ru: 'Вставь: «Ja ___ w pracy.» (быть)',
      uk: 'Встав: «Ja ___ w pracy.» (бути)',
      en: 'Fill in: «Ja ___ w pracy.» (to be)',
    },
    options: ['jestem', 'jest', 'jesteś', 'są'],
    answer: 0,
    explain: {
      ru: '«Być»: ja jestem, ty jesteś, on / ona jest, my jesteśmy, oni są. «Jestem w pracy» — я на работе.',
      uk: '«Być»: ja jestem, ty jesteś, on / ona jest, my jesteśmy, oni są. «Jestem w pracy» — я на роботі.',
      en: '«Być»: ja jestem, ty jesteś, on / ona jest, my jesteśmy, oni są. «Jestem w pracy» — I\'m at work.',
    },
  }),
  q({
    id: 'gr-na-koncert', category: 'grammar', cefr: 'A2', kind: 'preposition',
    prompt: {
      ru: 'Вставь предлог: «Idę ___ koncert.»',
      uk: 'Встав прийменник: «Idę ___ koncert.»',
      en: 'Add the preposition: «Idę ___ koncert.»',
    },
    options: ['na', 'do', 'w', 'o'],
    answer: 0,
    explain: {
      ru: 'На мероприятие — «na» + винительный: na koncert, na mecz, na urodziny. В здание — «do»: do kina, do teatru.',
      uk: 'На подію — «na» + знахідний: na koncert, na mecz, na urodziny. До будівлі — «do»: do kina, do teatru.',
      en: 'For events use «na» + accusative: na koncert, na mecz, na urodziny. Into a building — «do»: do kina, do teatru.',
    },
  }),
  q({
    id: 'gr-o-osiemnastej', category: 'grammar', cefr: 'A2', kind: 'preposition',
    prompt: {
      ru: 'Вставь предлог: «Spotykamy się ___ 18:00.»',
      uk: 'Встав прийменник: «Spotykamy się ___ 18:00.»',
      en: 'Add the preposition: «Spotykamy się ___ 18:00.»',
    },
    options: ['o', 'w', 'na', 'za'],
    answer: 0,
    explain: {
      ru: 'Время по часам — «o»: o osiemnastej (в 18:00). «Za godzinę» — через час, «w poniedziałek» — в понедельник.',
      uk: 'Час за годинником — «o»: o osiemnastej (о 18:00). «Za godzinę» — за годину, «w poniedziałek» — у понеділок.',
      en: 'Clock time takes «o»: o osiemnastej (at 6 pm). «Za godzinę» — in an hour, «w poniedziałek» — on Monday.',
    },
  }),
  q({
    id: 'gr-siostre', category: 'grammar', cefr: 'A2', kind: 'complete',
    prompt: {
      ru: 'Вставь: «Mam ___.» (сестра)',
      uk: 'Встав: «Mam ___.» (сестра)',
      en: 'Fill in: «Mam ___.» (sister)',
    },
    options: ['siostrę', 'siostra', 'siostry', 'siostrą'],
    answer: 0,
    explain: {
      ru: 'После «mam» — винительный падеж: у женских слов на -a окончание меняется на -ę: siostra → siostrę, kawa → kawę.',
      uk: 'Після «mam» — знахідний відмінок: у жіночих слів на -a закінчення змінюється на -ę: siostra → siostrę, kawa → kawę.',
      en: '«Mam» takes the accusative: feminine nouns in -a change to -ę: siostra → siostrę, kawa → kawę.',
    },
  }),
  q({
    id: 'gr-poszlismy', category: 'grammar', cefr: 'B1', kind: 'verb',
    prompt: {
      ru: 'Вставь: «Wczoraj ___ do kina.» (мы пошли)',
      uk: 'Встав: «Wczoraj ___ do kina.» (ми пішли)',
      en: 'Fill in: «Wczoraj ___ do kina.» (we went)',
    },
    options: ['poszliśmy', 'idziemy', 'pójdziemy', 'poszli'],
    answer: 0,
    explain: {
      ru: 'Прошедшее время, «мы» (мужская или смешанная компания): poszliśmy; если только женщины — poszłyśmy. Idziemy — идём, pójdziemy — пойдём, poszli — они пошли.',
      uk: 'Минулий час, «ми» (чоловіча або змішана компанія): poszliśmy; якщо лише жінки — poszłyśmy. Idziemy — ідемо, pójdziemy — підемо, poszli — вони пішли.',
      en: '«Wczoraj» needs the past: poszliśmy (mixed or male group), poszłyśmy (women only). Idziemy is present, pójdziemy — future, poszli — "they went".',
    },
  }),

  // ───────────── Общение ─────────────
  q({
    id: 'talk-dzien-dobry', category: 'talk', cefr: 'A1', kind: 'situation',
    prompt: {
      ru: 'Утром ты заходишь в магазин. Как поздороваться?',
      uk: 'Уранці ти заходиш у магазин. Як привітатися?',
      en: 'You walk into a shop in the morning. How do you greet people?',
    },
    options: ['Dzień dobry!', 'Dobranoc!', 'Do widzenia!', 'Na zdrowie!'],
    answer: 0,
    explain: {
      ru: '«Dzień dobry» — здравствуйте (утром и днём), вечером — «Dobry wieczór». «Dobranoc» — спокойной ночи, «Do widzenia» — до свидания.',
      uk: '«Dzień dobry» — добрий день (уранці й удень), увечері — «Dobry wieczór». «Dobranoc» — на добраніч, «Do widzenia» — до побачення.',
      en: '«Dzień dobry» is hello in the morning and daytime, «Dobry wieczór» in the evening. «Dobranoc» and «Do widzenia» are goodbyes.',
    },
  }),
  q({
    id: 'talk-jak-sie-masz', category: 'talk', cefr: 'A1', kind: 'reply',
    prompt: {
      ru: 'Друг спрашивает: «Jak się masz?» Что ответить?',
      uk: 'Друг питає: «Jak się masz?» Що відповісти?',
      en: 'A friend asks «Jak się masz?». What do you answer?',
    },
    options: ['Dobrze, dzięki! A ty?', 'Mam dwadzieścia lat.', 'Nazywam się Anna.', 'Jestem w domu.'],
    answer: 0,
    explain: {
      ru: '«Jak się masz?» — «Как дела?». Ответ: «Dobrze, dzięki! A ty?». «Mam … lat» — про возраст, «Nazywam się…» — про имя.',
      uk: '«Jak się masz?» — «Як справи?». Відповідь: «Dobrze, dzięki! A ty?». «Mam … lat» — про вік, «Nazywam się…» — про ім\'я.',
      en: '«Jak się masz?» means "How are you?". «Mam … lat» is about age, «Nazywam się…» — your name.',
    },
  }),
  q({
    id: 'talk-uroda', category: 'talk', cefr: 'A2', kind: 'meaning',
    prompt: { ru: 'Что значит польское «uroda»?', uk: 'Що означає польське «uroda»?', en: 'What does the Polish word «uroda» mean?' },
    options: {
      ru: ['красота', 'уродство', 'урожай', 'родня'],
      uk: ['врода, краса', 'потворність', 'урожай', 'рідня'],
      en: ['beauty', 'ugliness', 'harvest', 'relatives'],
    },
    answer: 0,
    explain: {
      ru: 'Ложный друг! «Uroda» — красота, «urodziny» — день рождения. Некрасивый — «brzydki», родня — «rodzina».',
      uk: 'Схоже на українське «врода» — так, «uroda» — краса. «Urodziny» — день народження, некрасивий — «brzydki».',
      en: '«Uroda» means beauty (a false friend for Russian speakers). «Urodziny» is a birthday, ugly — «brzydki».',
    },
  }),
  q({
    id: 'talk-dywan', category: 'talk', cefr: 'A2', kind: 'meaning',
    prompt: { ru: 'Что значит «dywan»?', uk: 'Що означає «dywan»?', en: 'What is a «dywan»?' },
    options: {
      ru: ['ковёр', 'диван', 'подушка', 'кровать'],
      uk: ['килим', 'диван', 'подушка', 'ліжко'],
      en: ['a rug', 'a sofa', 'a pillow', 'a bed'],
    },
    answer: 0,
    explain: {
      ru: 'Ещё один ложный друг: «dywan» — ковёр, а диван — «kanapa» или «sofa». Подушка — «poduszka», кровать — «łóżko».',
      uk: 'Ще один хибний друг: «dywan» — килим, а диван — «kanapa» або «sofa». Подушка — «poduszka», ліжко — «łóżko».',
      en: 'A false friend: «dywan» is a rug, while a sofa is «kanapa» or «sofa». A pillow is «poduszka», a bed — «łóżko».',
    },
  }),
  q({
    id: 'talk-pani', category: 'talk', cefr: 'B1', kind: 'situation',
    prompt: {
      ru: 'Как вежливо попросить помощи у незнакомой женщины?',
      uk: 'Як ввічливо попросити допомоги в незнайомої жінки?',
      en: 'How do you politely ask a woman you don\'t know for help?',
    },
    options: ['Czy może pani mi pomóc?', 'Czy możesz mi pomóc?', 'Czy może ty mi pomóc?', 'Pomóż mi, pani.'],
    answer: 0,
    explain: {
      ru: 'К незнакомым обращаются «pan» (мужчине) и «pani» (женщине) с глаголом в 3-м лице: «Czy może pani…?». «Możesz» — на «ты», с друзьями.',
      uk: 'До незнайомих звертаються «pan» (до чоловіка) і «pani» (до жінки) з дієсловом у 3-й особі: «Czy może pani…?». «Możesz» — на «ти», з друзями.',
      en: 'Strangers are addressed as «pan» (sir) or «pani» (madam) with a third-person verb: «Czy może pani…?». «Możesz» is informal.',
    },
  }),
];

/** Вопрос по идентификатору (для ответа на отправленный раньше вопрос). */
export const QUESTION_BY_ID = new Map(QUIZ_QUESTIONS.map((x) => [x.id, x]));

export function optionsOf(question: QuizQuestion, lang: UiLang): string[] {
  return Array.isArray(question.options) ? question.options : question.options[lang];
}

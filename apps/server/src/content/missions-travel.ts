/**
 * Premium-місії «Подорожі Польщею» (2026-10-31, кадри власника — docs/design/a16/missions/):
 * реєстрація на рейс LOT у Кракові, зимовий готель у Закопаному, Варшава за один день.
 * Як інші сцени Premium: почати можна лише з активним Premium (сервер, services/missions.ts).
 * Без кроків «послухай»: озвучку генерує лише адмінка, а без аудіо такий крок не пройти.
 * Назви місць і компаній — контекст навчальних ситуацій, без партнерства; ціни, години, номери — навчальні.
 */
import type { I18n } from '@polski-go/shared';
import { t } from './builders';
import type { Mission, MissionLine, MissionOption, MissionStep } from './missions';

const npc = (pl: string, uk: string, ru: string, en: string): MissionLine => ({ who: 'npc', pl, tr: t(uk, ru, en) });
const P = (pl: string, ok = false, why?: I18n): MissionOption => ({ pl, ok, why });
const T = (text: I18n, ok = false, why?: I18n): MissionOption => ({ text, ok, why });
const ph = (pl: string, uk: string, ru: string, en: string) => ({ pl, tr: t(uk, ru, en) });
type Extra = { hint: I18n; explain: I18n; words?: string[]; tags?: string[] };
const choice = (id: string, line: MissionLine | undefined, task: I18n, options: MissionOption[], x: Extra): MissionStep => ({ id, kind: 'choice', line, task, options, ...x });
const build = (id: string, line: MissionLine | undefined, task: I18n, answer: string, extra: string[], x: Extra & { accept?: string[] }): MissionStep => ({
  id, kind: 'build', line, task, answer, extra, ...x,
});

const AMOUNT_TASK = t('Скільки треба заплатити? (навчальна сума)', 'Сколько нужно заплатить? (учебная сумма)', 'How much to pay? (practice amount)');
const base = { premium: true, minutes: 5, xp: 55, zlotki: 30 };

export const TRAVEL_MISSIONS: Mission[] = [
  // ───────────── Premium: рейс LOT із Кракова ─────────────
  {
    ...base, slug: 'lotnisko-lot', category: 'transport', tags: ['travel', 'airport'], city: 'krakow', scene: 'train-station',
    npc: { name: 'Pani Ola', role: t('працівниця реєстрації', 'сотрудница регистрации', 'check-in agent') },
    title: t('Рейс до Гданська', 'Рейс в Гданьск', 'Flight to Gdańsk'),
    goal: t('Пройди реєстрацію: документ, багаж, місце, правила для рідин і вихід на посадку.', 'Пройди регистрацию: документ, багаж, место, правила для жидкостей и выход на посадку.', 'Check in: ID, luggage, seat, liquids rule and the boarding gate.'),
    intro: t('Бобек летить із Кракова до Гданська й підходить до стійки реєстрації.', 'Бобек летит из Кракова в Гданьск и подходит к стойке регистрации.', 'Bobek is flying from Kraków to Gdańsk and walks up to the check-in desk.'),
    note: t(
      'LOT — польська національна авіакомпанія; назва — лише контекст навчальної ситуації, без партнерства. В аеропортах ЄС рідини в ручній поклажі — у ємностях до 100 мл. Номер виходу й час у місії — навчальні.',
      'LOT — польская национальная авиакомпания; название — лишь контекст учебной ситуации, без партнёрства. В аэропортах ЕС жидкости в ручной клади — в ёмкостях до 100 мл. Номер выхода и время в миссии — учебные.',
      'LOT is Poland’s national airline; the name is learning context only, no partnership. At EU airports liquids in hand luggage go in containers up to 100 ml. Gate and time here are for practice.',
    ),
    steps: [
      choice('document', npc('Dzień dobry! Poproszę paszport albo dowód osobisty.', 'Добрий день! Ваш паспорт або посвідчення особи, будь ласка.', 'Добрый день! Ваш паспорт или удостоверение личности, пожалуйста.', 'Hello! Your passport or ID card, please.'),
        t('Дай свій паспорт.', 'Дай свой паспорт.', 'Hand over your passport.'),
        [
          P('Proszę, oto mój paszport.', true),
          P('Poproszę paszport.', false, t('Так просить працівниця. Віддаючи, кажуть: «Proszę, oto…» — ось, будь ласка.', 'Так просит сотрудница. Отдавая, говорят: «Proszę, oto…» — вот, пожалуйста.', 'That’s what the agent says. Handing it over: «Proszę, oto…» = here you are.')),
          P('Nie, dziękuję.', false, t('Без документа реєстрацію не пройти.', 'Без документа регистрацию не пройти.', 'You can’t check in without ID.')),
        ],
        { hint: t('Oto — ось: oto mój paszport.', 'Oto — вот: oto mój paszport.', 'Oto = here is: oto mój paszport.'),
          explain: t('Proszę — і «будь ласка», і «ось, тримайте». Oto + називний: oto mój paszport.', 'Proszę — и «пожалуйста», и «вот, держите». Oto + именительный: oto mój paszport.', 'Proszę means both “please” and “here you are”. Oto + nominative: oto mój paszport.'), words: ['paszport'] }),
      choice('luggage', npc('Ma pan bagaż do nadania?', 'У вас є багаж, який здаєте?', 'У вас есть багаж в сдачу?', 'Do you have a bag to check in?'),
        t('У тебе одна валіза, яку здаєш у багаж.', 'У тебя один чемодан, который сдаёшь в багаж.', 'You have one suitcase to check in.'),
        [
          P('Tak, mam jedną walizkę.', true),
          P('Tak, mam jedna walizka.', false, t('Mieć + знахідний: jedna walizka → mam jedną walizkę.', 'Mieć + винительный: jedna walizka → mam jedną walizkę.', 'Mieć takes the accusative: jedna walizka → mam jedną walizkę.')),
          P('Nie, nie mam bagażu.', false, t('Так кажуть, коли валізи немає. А в тебе одна.', 'Так говорят, когда чемодана нет. А у тебя один.', 'That’s for no bag; you have one.')),
        ],
        { hint: t('Mam + кого? що? — jedną walizkę.', 'Mam + кого? что? — jedną walizkę.', 'Mam + what? — jedną walizkę.'),
          explain: t('Знахідний жіночого роду: -a → -ę: walizka → walizkę, jedna → jedną.', 'Винительный женского рода: -a → -ę: walizka → walizkę, jedna → jedną.', 'Feminine accusative: -a → -ę: walizka → walizkę, jedna → jedną.'), words: ['walizka', 'bagaż'] }),
      build('seat', npc('Gdzie chce pan siedzieć?', 'Де ви хочете сидіти?', 'Где вы хотите сидеть?', 'Where would you like to sit?'),
        t('Попроси місце біля вікна.', 'Попроси место у окна.', 'Ask for a window seat.'),
        'Poproszę miejsce przy oknie.', ['okno', 'na'],
        { hint: t('Przy + місцевий: przy oknie — біля вікна.', 'Przy + предложный: przy oknie — у окна.', 'Przy + locative: przy oknie = by the window.'),
          explain: t('Okno → przy oknie (біля вікна); біля проходу — przy przejściu.', 'Okno → przy oknie (у окна); у прохода — przy przejściu.', 'Okno → przy oknie (window seat); aisle seat — przy przejściu.'), words: ['miejsce'] }),
      choice('liquids', npc('W bagażu podręcznym płyny tylko do stu mililitrów.', 'У ручній поклажі рідини лише до ста мілілітрів.', 'В ручной клади жидкости только до ста миллилитров.', 'Liquids in hand luggage only up to one hundred millilitres.'),
        t('Чи можна взяти в ручну поклажу пляшку води 0,5 л?', 'Можно ли взять в ручную кладь бутылку воды 0,5 л?', 'Can you take a 0.5 l bottle of water in your hand luggage?'),
        [
          T(t('Ні — рідини до 100 мл', 'Нет — жидкости до 100 мл', 'No — liquids up to 100 ml'), true),
          T(t('Так, будь-яку воду', 'Да, любую воду', 'Yes, any water'), false, t('Tylko do stu mililitrów — лише до 100 мл.', 'Tylko do stu mililitrów — только до 100 мл.', 'Tylko do stu mililitrów = only up to 100 ml.')),
          T(t('Так, але лише газовану', 'Да, но только газированную', 'Yes, but only sparkling'), false, t('Płyny — будь-які рідини, і всі до 100 мл.', 'Płyny — любые жидкости, и все до 100 мл.', 'Płyny = any liquids, all up to 100 ml.')),
        ],
        { hint: t('Płyny — рідини; bagaż podręczny — ручна поклажа.', 'Płyny — жидкости; bagaż podręczny — ручная кладь.', 'Płyny = liquids; bagaż podręczny = hand luggage.'),
          explain: t('Do + родовий: sto → do stu mililitrów.', 'Do + родительный: sto → do stu mililitrów.', 'Do + genitive: sto → do stu mililitrów.'), words: ['bagaż'] }),
      choice('gate', npc('Wejście na pokład jest przy bramce numer dwanaście o osiemnastej czterdzieści.', 'Посадка біля виходу номер дванадцять о вісімнадцятій сорок.', 'Посадка у выхода номер двенадцать в восемнадцать сорок.', 'Boarding is at gate twelve at 18:40.'),
        t('Де й коли посадка?', 'Где и когда посадка?', 'Where and when is boarding?'),
        [
          T(t('Вихід 12, о 18:40', 'Выход 12, в 18:40', 'Gate 12 at 18:40'), true),
          T(t('Вихід 20, о 18:40', 'Выход 20, в 18:40', 'Gate 20 at 18:40'), false, t('Dwanaście — 12, dwadzieścia — 20.', 'Dwanaście — 12, dwadzieścia — 20.', 'Dwanaście = 12, dwadzieścia = 20.')),
          T(t('Вихід 12, о 18:14', 'Выход 12, в 18:14', 'Gate 12 at 18:14'), false, t('Czterdzieści — 40, czternaście — 14.', 'Czterdzieści — 40, czternaście — 14.', 'Czterdzieści = 40, czternaście = 14.')),
        ],
        { hint: t('Dwanaście — 12, czterdzieści — 40.', 'Dwanaście — 12, czterdzieści — 40.', 'Dwanaście = 12, czterdzieści = 40.'),
          explain: t('Час — порядковий числівник у місцевому: o osiemnastej czterdzieści — о 18:40.', 'Время — порядковое числительное в предложном: o osiemnastej czterdzieści — в 18:40.', 'Time uses ordinal numbers in the locative: o osiemnastej czterdzieści = at 18:40.'), words: ['bramka'] }),
      choice('thanks', undefined,
        t('Подякуй і побажай гарного дня.', 'Поблагодари и пожелай хорошего дня.', 'Say thank you and wish a nice day.'),
        [
          P('Dziękuję, miłego dnia!', true),
          P('Smacznego!', false, t('«Smacznego» — смачного, так кажуть перед їжею.', '«Smacznego» — приятного аппетита, так говорят перед едой.', '«Smacznego» is “enjoy your meal”.')),
          P('Na zdrowie!', false, t('«Na zdrowie» — будьмо або «будь здоров», коли хтось чхнув.', '«Na zdrowie» — за здоровье или «будь здоров», когда кто-то чихнул.', '«Na zdrowie» is “cheers” or “bless you”.')),
        ],
        { hint: t('Miłego dnia! — гарного дня!', 'Miłego dnia! — хорошего дня!', 'Miłego dnia! = have a nice day!'),
          explain: t('Побажання — у родовому: (życzę) miłego dnia.', 'Пожелание — в родительном: (życzę) miłego dnia.', 'Wishes take the genitive: (życzę) miłego dnia.'), words: ['dziękuję'] }),
    ],
    phrases: [
      ph('Proszę, oto mój paszport.', 'Ось, будь ласка, мій паспорт.', 'Вот, пожалуйста, мой паспорт.', 'Here is my passport.'),
      ph('Mam jedną walizkę.', 'У мене одна валіза.', 'У меня один чемодан.', 'I have one suitcase.'),
      ph('Poproszę miejsce przy oknie.', 'Місце біля вікна, будь ласка.', 'Место у окна, пожалуйста.', 'A window seat, please.'),
      ph('Gdzie jest bramka numer dwanaście?', 'Де вихід номер дванадцять?', 'Где выход номер двенадцать?', 'Where is gate twelve?'),
    ],
  },

  // ───────────── Premium: зимовий готель у Закопаному ─────────────
  {
    ...base, slug: 'zakopane-ferie', category: 'road', tags: ['travel', 'hotel'], city: 'zakopane', scene: 'hotel',
    npc: { name: 'Pani Kasia', role: t('адміністраторка', 'администратор', 'receptionist') },
    title: t('Зимові канікули в Закопаному', 'Зимние каникулы в Закопане', 'Winter break in Zakopane'),
    goal: t('Заселися в готель: бронювання, ночі, номер кімнати, скіпас, погода й сніданок.', 'Заселись в отель: бронь, ночи, номер комнаты, ски-пасс, погода и завтрак.', 'Check into the hotel: booking, nights, room number, ski pass, weather and breakfast.'),
    intro: t('Бобек приїхав у Закопане кататися на лижах і підходить до рецепції готелю.', 'Бобек приехал в Закопане кататься на лыжах и подходит к стойке отеля.', 'Bobek has come to Zakopane to ski and walks up to the hotel reception.'),
    note: t(
      'Закопане — «зимова столиця Польщі» в Татрах: звідси їдуть на Каспровий Верх і Губалівку. Karnet — абонемент на підйомники. У Польщі parter — це перший поверх, тож drugie piętro — третій за українським рахунком. Номер, ціни й погода — навчальні.',
      'Закопане — «зимняя столица Польши» в Татрах: отсюда едут на Каспровы-Верх и Губаловку. Karnet — абонемент на подъёмники. В Польше parter — это первый этаж, поэтому drugie piętro — третий по нашему счёту. Номер, цены и погода — учебные.',
      'Zakopane is Poland’s “winter capital” in the Tatras, the base for Kasprowy Wierch and Gubałówka. A karnet is a lift pass. In Poland the ground floor is «parter», so «drugie piętro» is two floors up. Room, prices and weather here are for practice.',
    ),
    steps: [
      choice('booking', npc('Dzień dobry! W czym mogę pomóc?', 'Добрий день! Чим можу допомогти?', 'Добрый день! Чем могу помочь?', 'Hello! How can I help?'),
        t('Скажи, що маєш бронювання на ім’я Бобек.', 'Скажи, что у тебя бронь на имя Бобек.', 'Say you have a booking under the name Bobek.'),
        [
          P('Dzień dobry, mam rezerwację na nazwisko Bobek.', true),
          P('Dzień dobry, chcę zrobić rezerwację.', false, t('Так кажуть, коли бронювання ще немає. А в тебе є: mam rezerwację.', 'Так говорят, когда брони ещё нет. А у тебя есть: mam rezerwację.', 'That’s for making a new booking; you already have one: mam rezerwację.')),
          P('Dobranoc, mam pokój.', false, t('«Dobranoc» — на добраніч, так прощаються ввечері.', '«Dobranoc» — спокойной ночи, так прощаются вечером.', '«Dobranoc» means good night.')),
        ],
        { hint: t('Mam rezerwację na nazwisko… — маю бронювання на прізвище…', 'Mam rezerwację na nazwisko… — у меня бронь на фамилию…', 'Mam rezerwację na nazwisko… = I have a booking under…'),
          explain: t('Rezerwacja → mam rezerwację (знахідний); na nazwisko + ім’я.', 'Rezerwacja → mam rezerwację (винительный); na nazwisko + имя.', 'Rezerwacja → mam rezerwację (accusative); na nazwisko + name.'), words: ['rezerwacja'] }),
      choice('nights', npc('Na ile nocy?', 'На скільки ночей?', 'На сколько ночей?', 'For how many nights?'),
        t('Відповідай: на три ночі.', 'Ответь: на три ночи.', 'Answer: for three nights.'),
        [
          P('Na trzy noce.', true),
          P('Na trzy nocy.', false, t('Після 2–4 — називний множини: trzy noce. «Nocy» — після 5 і більше: pięć nocy.', 'После 2–4 — именительный множественного: trzy noce. «Nocy» — после 5 и больше: pięć nocy.', 'After 2–4 use the nominative plural: trzy noce. «Nocy» is for 5+: pięć nocy.')),
          P('Na trzecią noc.', false, t('«Trzecią» — третю (порядковий). Скільки — trzy.', '«Trzecią» — третью (порядковое). Сколько — trzy.', '«Trzecią» means “the third”. How many = trzy.')),
        ],
        { hint: t('Dwie, trzy, cztery noce; pięć nocy.', 'Dwie, trzy, cztery noce; pięć nocy.', 'Dwie, trzy, cztery noce; pięć nocy.'),
          explain: t('Noc — жіночого роду: 2–4 → noce, 5+ → nocy.', 'Noc — женского рода: 2–4 → noce, 5+ → nocy.', 'Noc is feminine: 2–4 → noce, 5+ → nocy.'), words: ['noc'] }),
      choice('room', npc('Proszę, to karta do pokoju. Pokój numer dwieście pięć, na drugim piętrze.', 'Ось картка від номера. Кімната двісті п’ять, на другому поверсі.', 'Вот карта от номера. Комната двести пять, на втором этаже.', 'Here is your key card. Room two hundred and five, on the second floor.'),
        t('Який номер кімнати?', 'Какой номер комнаты?', 'What’s the room number?'),
        [
          T(t('205'), true),
          T(t('250'), false, t('Dwieście pięć — 205; dwieście pięćdziesiąt — 250.', 'Dwieście pięć — 205; dwieście pięćdziesiąt — 250.', 'Dwieście pięć = 205; dwieście pięćdziesiąt = 250.')),
          T(t('25'), false, t('Dwadzieścia pięć — 25, а тут dwieście — двісті.', 'Dwadzieścia pięć — 25, а здесь dwieście — двести.', 'Dwadzieścia pięć = 25, but you heard dwieście = 200.')),
        ],
        { hint: t('Dwieście — 200, pięć — 5.', 'Dwieście — 200, pięć — 5.', 'Dwieście = 200, pięć = 5.'),
          explain: t('Na drugim piętrze — на другому поверсі над parterem (у нас — третій).', 'Na drugim piętrze — на втором этаже над parterem (у нас — третий).', 'Na drugim piętrze = two floors above the «parter».'), words: ['pokój', 'piętro'] }),
      build('skipass', undefined,
        t('Запитай, де можна купити скіпас (karnet).', 'Спроси, где можно купить ски-пасс (karnet).', 'Ask where you can buy a lift pass (karnet).'),
        'Gdzie mogę kupić karnet?', ['kupuję', 'narty'],
        { hint: t('Gdzie mogę…? — де я можу…?', 'Gdzie mogę…? — где я могу…?', 'Gdzie mogę…? = where can I…?'),
          explain: t('Mogę + інфінітив: mogę kupić. Kupuję — «я купую», тут не підходить.', 'Mogę + инфинитив: mogę kupić. Kupuję — «я покупаю», здесь не подходит.', 'Mogę + infinitive: mogę kupić. «Kupuję» means “I’m buying”.'), words: ['karnet'] }),
      choice('weather', npc('Jutro będzie słonecznie, ale zimno, minus dziesięć stopni.', 'Завтра буде сонячно, але холодно, мінус десять градусів.', 'Завтра будет солнечно, но холодно, минус десять градусов.', 'Tomorrow will be sunny but cold, minus ten degrees.'),
        t('Яка завтра погода?', 'Какая завтра погода?', 'What’s the weather tomorrow?'),
        [
          T(t('Сонячно, −10 °C', 'Солнечно, −10 °C', 'Sunny, −10 °C'), true),
          T(t('Сніг, −10 °C', 'Снег, −10 °C', 'Snow, −10 °C'), false, t('Słonecznie — сонячно; сніг — śnieg.', 'Słonecznie — солнечно; снег — śnieg.', 'Słonecznie = sunny; snow is «śnieg».')),
          T(t('Сонячно, +10 °C', 'Солнечно, +10 °C', 'Sunny, +10 °C'), false, t('Minus dziesięć — мінус десять.', 'Minus dziesięć — минус десять.', 'Minus dziesięć = minus ten.')),
        ],
        { hint: t('Słonecznie — сонячно, zimno — холодно.', 'Słonecznie — солнечно, zimno — холодно.', 'Słonecznie = sunny, zimno = cold.'),
          explain: t('Про погоду — прислівники: jest słonecznie, jest zimno.', 'О погоде — наречия: jest słonecznie, jest zimno.', 'Weather uses adverbs: jest słonecznie, jest zimno.'), words: ['pogoda', 'słonecznie', 'zimno'] }),
      choice('breakfast', npc('Śniadanie jest od siódmej do dziesiątej.', 'Сніданок із сьомої до десятої.', 'Завтрак с семи до десяти.', 'Breakfast is from seven to ten.'),
        t('До котрої можна поснідати?', 'До которого часа можно позавтракать?', 'Until what time is breakfast?'),
        [
          T(t('До 10:00'), true),
          T(t('До 7:00'), false, t('Od siódmej — від сьомої; do dziesiątej — до десятої.', 'Od siódmej — с семи; do dziesiątej — до десяти.', 'Od siódmej = from seven; do dziesiątej = until ten.')),
          T(t('До 12:00'), false, t('Dwunastej — дванадцятої, а тут dziesiątej — десятої.', 'Dwunastej — двенадцати, а здесь dziesiątej — десяти.', 'Dwunastej = twelve; you heard dziesiątej = ten.')),
        ],
        { hint: t('Od… do… — від… до…', 'Od… do… — с… до…', 'Od… do… = from… to…'),
          explain: t('Od і do + родовий: od siódmej do dziesiątej.', 'Od и do + родительный: od siódmej do dziesiątej.', 'Od and do take the genitive: od siódmej do dziesiątej.'), words: ['śniadanie'] }),
    ],
    phrases: [
      ph('Mam rezerwację na nazwisko…', 'Маю бронювання на прізвище…', 'У меня бронь на фамилию…', 'I have a booking under the name…'),
      ph('Na trzy noce.', 'На три ночі.', 'На три ночи.', 'For three nights.'),
      ph('Gdzie mogę kupić karnet?', 'Де можна купити скіпас?', 'Где можно купить ски-пасс?', 'Where can I buy a lift pass?'),
      ph('O której jest śniadanie?', 'О котрій сніданок?', 'Во сколько завтрак?', 'What time is breakfast?'),
    ],
  },

  // ───────────── Premium: Варшава за один день ─────────────
  {
    ...base, slug: 'warszawa-dzien', category: 'road', tags: ['travel', 'city'], city: 'warszawa', scene: 'castle',
    npc: { name: 'Pan Tomek', role: t('продавець сувенірів', 'продавец сувениров', 'souvenir seller') },
    title: t('Варшава за один день', 'Варшава за один день', 'Warsaw in a day'),
    goal: t('Знайди Королівський замок, купи листівки, дізнайся, коли замок зачинений, і попроси тебе сфотографувати.', 'Найди Королевский замок, купи открытки, узнай, когда замок закрыт, и попроси тебя сфотографировать.', 'Find the Royal Castle, buy postcards, find out when the castle is closed and ask for a photo.'),
    intro: t('У Бобека один день у Варшаві. Він починає зі Старого Міста.', 'У Бобека один день в Варшаве. Он начинает со Старого города.', 'Bobek has one day in Warsaw and starts in the Old Town.'),
    note: t(
      'Старе Місто Варшави після війни відбудували майже з нуля; з 1980 року воно в списку ЮНЕСКО. На Замковій площі стоїть колона Сигізмунда III Вази (1644) — найстаріший світський пам’ятник Варшави. Ціни й дні роботи в місії — навчальні.',
      'Старый город Варшавы после войны отстроили почти с нуля; с 1980 года он в списке ЮНЕСКО. На Замковой площади стоит колонна Сигизмунда III Вазы (1644) — старейший светский памятник Варшавы. Цены и дни работы в миссии — учебные.',
      'Warsaw’s Old Town was rebuilt almost from scratch after the war and has been a UNESCO site since 1980. Castle Square has Sigismund III Vasa’s Column (1644), the city’s oldest secular monument. Prices and opening days here are for practice.',
    ),
    steps: [
      build('ask-castle', undefined,
        t('Запитай перехожого, де Королівський замок.', 'Спроси прохожего, где Королевский замок.', 'Ask a passer-by where the Royal Castle is.'),
        'Przepraszam, gdzie jest Zamek Królewski?', ['zamku', 'idzie'],
        { hint: t('Przepraszam, gdzie jest…? — перепрошую, де…?', 'Przepraszam, gdzie jest…? — извините, где…?', 'Przepraszam, gdzie jest…? = excuse me, where is…?'),
          explain: t('Gdzie jest + називний: gdzie jest Zamek Królewski?', 'Gdzie jest + именительный: gdzie jest Zamek Królewski?', 'Gdzie jest + nominative: gdzie jest Zamek Królewski?'), words: ['zamek'] }),
      choice('way', npc('Prosto, a potem w lewo. Zamek jest na placu Zamkowym, obok kolumny Zygmunta.', 'Прямо, а потім ліворуч. Замок на Замковій площі, біля колони Сигізмунда.', 'Прямо, а потом налево. Замок на Замковой площади, рядом с колонной Сигизмунда.', 'Straight on, then left. The castle is on Castle Square, next to Sigismund’s Column.'),
        t('Куди йти?', 'Куда идти?', 'Which way?'),
        [
          T(t('Прямо, потім ліворуч', 'Прямо, потом налево', 'Straight, then left'), true),
          T(t('Прямо, потім праворуч', 'Прямо, потом направо', 'Straight, then right'), false, t('W lewo — ліворуч, w prawo — праворуч.', 'W lewo — налево, w prawo — направо.', 'W lewo = left, w prawo = right.')),
          T(t('Назад, потім ліворуч', 'Назад, потом налево', 'Back, then left'), false, t('Prosto — прямо; назад — z powrotem.', 'Prosto — прямо; назад — z powrotem.', 'Prosto = straight on; back is «z powrotem».')),
        ],
        { hint: t('Prosto — прямо, w lewo — ліворуч.', 'Prosto — прямо, w lewo — налево.', 'Prosto = straight, w lewo = left.'),
          explain: t('Obok + родовий: obok kolumny — біля колони.', 'Obok + родительный: obok kolumny — рядом с колонной.', 'Obok + genitive: obok kolumny = next to the column.'), words: ['prosto', 'w lewo', 'w prawo'] }),
      choice('postcards', npc('Szuka pan pamiątek? Mamy pocztówki i magnesy.', 'Шукаєте сувеніри? Маємо листівки й магніти.', 'Ищете сувениры? Есть открытки и магниты.', 'Looking for souvenirs? We have postcards and magnets.'),
        t('Попроси дві листівки.', 'Попроси две открытки.', 'Ask for two postcards.'),
        [
          P('Poproszę dwie pocztówki.', true),
          P('Poproszę dwa pocztówki.', false, t('Pocztówka — жіночого роду: dwie pocztówki (dwa — для чоловічого й середнього).', 'Pocztówka — женского рода: dwie pocztówki (dwa — для мужского и среднего).', 'Pocztówka is feminine: dwie pocztówki (dwa is for masculine and neuter).')),
          P('Poproszę dwie pocztówka.', false, t('Після dwie — множина: pocztówki.', 'После dwie — множественное: pocztówki.', 'After dwie use the plural: pocztówki.')),
        ],
        { hint: t('Dwie — для жіночого роду: dwie pocztówki.', 'Dwie — для женского рода: dwie pocztówki.', 'Dwie is for feminine nouns: dwie pocztówki.'),
          explain: t('Dwa domy, dwa okna, але dwie pocztówki.', 'Dwa domy, dwa okna, но dwie pocztówki.', 'Dwa domy, dwa okna, but dwie pocztówki.'), words: ['pocztówka', 'pamiątka'] }),
      choice('price', npc('Jedna pocztówka kosztuje pięć złotych.', 'Одна листівка коштує п’ять злотих.', 'Одна открытка стоит пять злотых.', 'One postcard costs five złoty.'),
        AMOUNT_TASK,
        [
          T(t('10 zł'), true),
          T(t('5 zł'), false, t('П’ять злотих — за одну, а в тебе дві: 2 × 5 = 10.', 'Пять злотых — за одну, а у тебя две: 2 × 5 = 10.', 'Five is for one; you have two: 2 × 5 = 10.')),
          T(t('15 zł'), false, t('Piętnaście — 15. Тут 2 × 5 = 10.', 'Piętnaście — 15. Здесь 2 × 5 = 10.', 'Piętnaście = 15; here it’s 2 × 5 = 10.')),
        ],
        { hint: t('Pięć — 5, dziesięć — 10.', 'Pięć — 5, dziesięć — 10.', 'Pięć = 5, dziesięć = 10.'),
          explain: t('Pięć złotych — після 5 і більше родовий множини: złotych.', 'Pięć złotych — после 5 и больше родительный множественного: złotych.', 'After 5+ use the genitive plural: pięć złotych.') }),
      choice('closed', npc('Zamek jest otwarty od wtorku do niedzieli. W poniedziałek jest zamknięty.', 'Замок відкритий із вівторка до неділі. У понеділок зачинений.', 'Замок открыт со вторника по воскресенье. В понедельник закрыт.', 'The castle is open Tuesday to Sunday. It’s closed on Monday.'),
        t('Коли замок зачинений?', 'Когда замок закрыт?', 'When is the castle closed?'),
        [
          T(t('У понеділок', 'В понедельник', 'On Monday'), true),
          T(t('У неділю', 'В воскресенье', 'On Sunday'), false, t('Niedziela — неділя, poniedziałek — понеділок. Не переплутай!', 'Niedziela — воскресенье, poniedziałek — понедельник. Не перепутай!', 'Niedziela = Sunday, poniedziałek = Monday. Don’t mix them up!')),
          T(t('У вівторок', 'Во вторник', 'On Tuesday'), false, t('Od wtorku — з вівторка замок відкритий.', 'Od wtorku — со вторника замок открыт.', 'Od wtorku = from Tuesday it’s open.')),
        ],
        { hint: t('Poniedziałek — понеділок, niedziela — неділя.', 'Poniedziałek — понедельник, niedziela — воскресенье.', 'Poniedziałek = Monday, niedziela = Sunday.'),
          explain: t('W + знахідний: w poniedziałek — у понеділок; od wtorku do niedzieli — родовий.', 'W + винительный: w poniedziałek — в понедельник; od wtorku do niedzieli — родительный.', 'W + accusative: w poniedziałek; od wtorku do niedzieli takes the genitive.'), words: ['poniedziałek', 'niedziela'] }),
      choice('photo', undefined,
        t('Попроси перехожого сфотографувати тебе.', 'Попроси прохожего сфотографировать тебя.', 'Ask a passer-by to take your photo.'),
        [
          P('Czy może mi pan zrobić zdjęcie?', true),
          P('Czy mogę panu zrobić zdjęcie?', false, t('Так ти пропонуєш сфотографувати його. Тобі — mi: może mi pan…', 'Так ты предлагаешь сфотографировать его. Тебе — mi: może mi pan…', 'That offers to photograph him. For you: może mi pan…')),
          P('Gdzie jest zdjęcie?', false, t('«Де фото?» — не те. Попросити: Czy może mi pan zrobić zdjęcie?', '«Где фото?» — не то. Попросить: Czy może mi pan zrobić zdjęcie?', '«Where is the photo?» — not it. Ask: Czy może mi pan zrobić zdjęcie?')),
        ],
        { hint: t('Czy może mi pan…? — чи можете ви мені…?', 'Czy może mi pan…? — можете ли вы мне…?', 'Czy może mi pan…? = could you… for me?'),
          explain: t('Mi — мені (давальний); zrobić zdjęcie — зробити фото.', 'Mi — мне (дательный); zrobić zdjęcie — сделать фото.', 'Mi = to/for me (dative); zrobić zdjęcie = take a photo.'), words: ['zdjęcie'] }),
    ],
    phrases: [
      ph('Przepraszam, gdzie jest Zamek Królewski?', 'Перепрошую, де Королівський замок?', 'Извините, где Королевский замок?', 'Excuse me, where is the Royal Castle?'),
      ph('Prosto, a potem w lewo.', 'Прямо, а потім ліворуч.', 'Прямо, а потом налево.', 'Straight on, then left.'),
      ph('Poproszę dwie pocztówki.', 'Дві листівки, будь ласка.', 'Две открытки, пожалуйста.', 'Two postcards, please.'),
      ph('Czy może mi pan zrobić zdjęcie?', 'Чи можете ви мене сфотографувати?', 'Вы можете меня сфотографировать?', 'Could you take my photo?'),
    ],
  },
];

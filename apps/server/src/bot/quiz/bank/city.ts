/** Вопросы бота: город, urząd, документы, дорога. */
import { q, type QuizQuestion } from './types';

export const CITY: QuizQuestion[] = [
  q({
    id: 'city-urzad', category: 'city', cefr: 'A2', kind: 'meaning', image: 'warszawa-starowka',
    prompt: {
      ru: 'Знакомый говорит: «Muszę iść do Urzędu Miasta.» Куда он идёт?',
      uk: 'Знайомий каже: «Muszę iść do Urzędu Miasta.» Куди він іде?',
      en: 'A friend says: «Muszę iść do Urzędu Miasta.» Where is he going?',
    },
    options: {
      ru: ['в городскую администрацию', 'в городской музей', 'в городскую больницу', 'на городской рынок'],
      uk: ['до міської адміністрації', 'до міського музею', 'до міської лікарні', 'на міський ринок'],
      en: ['to the town hall', 'to the city museum', 'to the city hospital', 'to the city market'],
    },
    answer: 0,
    explain: {
      ru: '«Urząd» — учреждение, ведомство; «Urząd Miasta» — мэрия: там прописка (meldunek) и документы. Музей — «muzeum», больница — «szpital», рынок — «targ».',
      uk: '«Urząd» — установа, відомство; «Urząd Miasta» — мерія: там реєстрація (meldunek) і документи. Музей — «muzeum», лікарня — «szpital», ринок — «targ».',
      en: '«Urząd» is a public office; «Urząd Miasta» is city hall, where you register your address (meldunek) and sort out documents. Museum — «muzeum», hospital — «szpital», market — «targ».',
    },
  }),
  q({
    id: 'city-numerek', category: 'city', cefr: 'A2', kind: 'listen', image: 'urzad',
    prompt: {
      ru: 'Табло в urzędzie: «Numerek A027 — stanowisko 4.» A027 — твой номер. Что делать?',
      uk: 'Табло в urzędzie: «Numerek A027 — stanowisko 4.» A027 — твій номер. Що робити?',
      en: 'The screen in the office: «Numerek A027 — stanowisko 4.» A027 is your number. What now?',
    },
    options: {
      ru: ['идти к окошку 4', 'ждать 4 минуты', 'взять 4 талона', 'идти на 4-й этаж'],
      uk: ['іти до віконця 4', 'чекати 4 хвилини', 'взяти 4 талони', 'іти на 4-й поверх'],
      en: ['go to desk 4', 'wait 4 minutes', 'take 4 tickets', 'go to floor 4'],
    },
    answer: 0,
    explain: {
      ru: '«Stanowisko» — окошко, рабочее место сотрудника: твой номер вызвали к окошку 4. Этаж — «piętro», минута — «minuta», талон очереди — «numerek».',
      uk: '«Stanowisko» — віконце, робоче місце працівника: твій номер викликали до віконця 4. Поверх — «piętro», хвилина — «minuta», талон черги — «numerek».',
      en: '«Stanowisko» is a service desk: your number is called to desk 4. A floor is «piętro», a minute — «minuta», the queue ticket itself — «numerek».',
    },
  }),
  q({
    id: 'city-dworzec', category: 'city', cefr: 'A1', kind: 'situation', image: 'warszawa-starowka',
    prompt: {
      ru: 'Как правильно спросить прохожего дорогу к главному вокзалу?',
      uk: 'Як правильно запитати перехожого дорогу до головного вокзалу?',
      en: 'How do you correctly ask a passer-by the way to the main station?',
    },
    options: ['Jak dojść na dworzec główny?', 'Jak dojść do dworzec główny?', 'Jak dojść na dworcu głównym?', 'Jak dojść w dworzec główny?'],
    answer: 0,
    explain: {
      ru: 'Куда? — «na dworzec» (na + винительный) или «do dworca» (do + родительный). «Do dworzec» — после do нужен родительный, «na dworcu» — «на вокзале» (где?), «w dworzec» — так не говорят.',
      uk: 'Куди? — «na dworzec» (na + знахідний) або «do dworca» (do + родовий). «Do dworzec» — після do потрібен родовий, «na dworcu» — «на вокзалі» (де?), «w dworzec» — так не кажуть.',
      en: 'Where to? — «na dworzec» (na + accusative) or «do dworca» (do + genitive). «Do dworzec» needs the genitive, «na dworcu» means "at the station", «w dworzec» isn\'t used.',
    },
  }),
  q({
    id: 'city-w-prawo', category: 'city', cefr: 'A2', kind: 'listen', image: 'warszawa-starowka',
    prompt: {
      ru: 'Прохожий: «Proszę iść prosto do świateł, a potem skręcić w lewo.» Куда идти?',
      uk: 'Перехожий: «Proszę iść prosto do świateł, a potem skręcić w lewo.» Куди йти?',
      en: 'A passer-by: «Proszę iść prosto do świateł, a potem skręcić w lewo.» Which way?',
    },
    options: {
      ru: ['до светофора, потом налево', 'до светофора, потом направо', 'до конца улицы, потом налево', 'до площади, потом налево'],
      uk: ['до світлофора, потім ліворуч', 'до світлофора, потім праворуч', 'до кінця вулиці, потім ліворуч', 'до площі, потім ліворуч'],
      en: ['to the lights, then left', 'to the lights, then right', 'to the end, then left', 'to the square, then left'],
    },
    answer: 0,
    explain: {
      ru: '«Światła» — светофор (дословно «огни»), «skręcić w lewo» — повернуть налево («w prawo» — направо). Площадь — «plac», конец улицы — «koniec ulicy».',
      uk: '«Światła» — світлофор (дослівно «вогні»), «skręcić w lewo» — повернути ліворуч («w prawo» — праворуч). Площа — «plac», кінець вулиці — «koniec ulicy».',
      en: '«Światła» are traffic lights (literally "lights"), «skręcić w lewo» — turn left («w prawo» — right). A square is «plac», the end of the street — «koniec ulicy».',
    },
  }),
  q({
    id: 'city-wizyta', category: 'city', cefr: 'A2', kind: 'listen', image: 'urzad',
    prompt: {
      ru: 'Ты записываешься в urząd. Сотрудница: «Najbliższy wolny termin to wtorek, dziewiąta rano.» Когда приём?',
      uk: 'Ти записуєшся до urzędu. Працівниця: «Najbliższy wolny termin to wtorek, dziewiąta rano.» Коли прийом?',
      en: 'You are booking an office visit. The clerk: «Najbliższy wolny termin to wtorek, dziewiąta rano.» When is it?',
    },
    options: {
      ru: ['вторник, 9:00', 'вторник, 10:00', 'четверг, 9:00', 'вторник, 19:00'],
      uk: ['вівторок, 9:00', 'вівторок, 10:00', 'четвер, 9:00', 'вівторок, 19:00'],
      en: ['Tuesday, 9:00', 'Tuesday, 10:00', 'Thursday, 9:00', 'Tuesday, 19:00'],
    },
    answer: 0,
    explain: {
      ru: '«Najbliższy wolny termin» — ближайшее свободное время. «Wtorek» — вторник (четверг — «czwartek»), «dziewiąta rano» — 9 утра (10 — «dziesiąta», 19 — «dziewiętnasta»).',
      uk: '«Najbliższy wolny termin» — найближчий вільний час. «Wtorek» — вівторок (четвер — «czwartek»), «dziewiąta rano» — 9 ранку (10 — «dziesiąta», 19 — «dziewiętnasta»).',
      en: '«Najbliższy wolny termin» is the earliest free slot. «Wtorek» is Tuesday (Thursday — «czwartek»), «dziewiąta rano» — 9 a.m. (10 — «dziesiąta», 19 — «dziewiętnasta»).',
    },
  }),
  q({
    id: 'city-pesel', category: 'city', cefr: 'A2', kind: 'meaning', image: 'urzad',
    prompt: {
      ru: 'В анкете поле «PESEL». Что туда вписать?',
      uk: 'В анкеті поле «PESEL». Що туди вписати?',
      en: 'A form has a «PESEL» field. What goes there?',
    },
    options: {
      ru: ['личный номер жителя', 'налоговый номер фирмы', 'номер медстраховки', 'номер загранпаспорта'],
      uk: ['особистий номер жителя', 'податковий номер фірми', 'номер медстрахування', 'номер закордонного паспорта'],
      en: ['personal ID number', 'company tax number', 'health insurance number', 'passport number'],
    },
    answer: 0,
    explain: {
      ru: 'PESEL — 11-значный личный номер в государственном реестре: нужен у врача, в банке, на работе. Налоговый номер фирмы — NIP, страховка — через ZUS и NFZ, паспорт — «numer paszportu».',
      uk: 'PESEL — 11-значний особистий номер у державному реєстрі: потрібен у лікаря, у банку, на роботі. Податковий номер фірми — NIP, страхування — через ZUS і NFZ, паспорт — «numer paszportu».',
      en: 'PESEL is the 11-digit personal number in the state register, needed at the doctor\'s, the bank and work. A company tax number is NIP, insurance goes via ZUS and NFZ, a passport — «numer paszportu».',
    },
  }),
];

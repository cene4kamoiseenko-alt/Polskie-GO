/** Вопросы бота: быт (квартира, время, числа, посылки, дни недели). */
import { q, type QuizQuestion } from './types';

export const EVERYDAY: QuizQuestion[] = [
  q({
    id: 'home-kaucja', category: 'everyday', cefr: 'B1', kind: 'meaning', image: 'mieszkanie',
    prompt: {
      ru: 'В объявлении о квартире: «Wymagana kaucja w wysokości dwóch czynszów.» Что это значит?',
      uk: 'В оголошенні про квартиру: «Wymagana kaucja w wysokości dwóch czynszów.» Що це означає?',
      en: 'A flat advert says: «Wymagana kaucja w wysokości dwóch czynszów.» What does it mean?',
    },
    options: {
      ru: ['залог равен оплате за 2 месяца', 'снимать нужно минимум 2 месяца', 'платить нужно 2 раза в месяц', 'коммуналка — за 2 месяца вперёд'],
      uk: ['застава дорівнює оплаті за 2 місяці', 'знімати треба щонайменше 2 місяці', 'платити треба 2 рази на місяць', 'комуналка — за 2 місяці наперед'],
      en: ["the deposit is two months' rent", 'the minimum stay is two months', 'rent is paid twice a month', 'bills are paid two months ahead'],
    },
    answer: 0,
    explain: {
      ru: '«Kaucja» — залог (его возвращают при выезде), «czynsz» — ежемесячная плата за квартиру. «W wysokości dwóch czynszów» — в размере двух месячных плат. Коммуналка — «media».',
      uk: '«Kaucja» — застава (її повертають при виїзді), «czynsz» — щомісячна плата за квартиру. «W wysokości dwóch czynszów» — у розмірі двох місячних плат. Комуналка — «media».',
      en: '«Kaucja» is a deposit (returned when you move out), «czynsz» the monthly rent. «W wysokości dwóch czynszów» means equal to two months\' rent. Utility bills are «media».',
    },
  }),
  q({
    id: 'home-15', category: 'everyday', cefr: 'A1', kind: 'listen', image: 'mieszkanie',
    prompt: {
      ru: 'Хозяйка по телефону: «Mieszkanie numer pięćdziesiąt pięć.» Какая квартира?',
      uk: 'Господиня телефоном: «Mieszkanie numer pięćdziesiąt pięć.» Яка квартира?',
      en: 'The landlady on the phone: «Mieszkanie numer pięćdziesiąt pięć.» Which flat?',
    },
    options: {
      ru: ['квартира 55', 'квартира 15', 'квартира 50', 'квартира 5'],
      uk: ['квартира 55', 'квартира 15', 'квартира 50', 'квартира 5'],
      en: ['flat 55', 'flat 15', 'flat 50', 'flat 5'],
    },
    answer: 0,
    explain: {
      ru: '«Pięćdziesiąt» — 50, «pięć» — 5, вместе 55. Пятнадцать — «piętnaście», пятьдесят без «pięć» — просто 50.',
      uk: '«Pięćdziesiąt» — 50, «pięć» — 5, разом 55. П\'ятнадцять — «piętnaście», п\'ятдесят без «pięć» — просто 50.',
      en: '«Pięćdziesiąt» is 50 and «pięć» is 5, so 55. Fifteen is «piętnaście»; without «pięć» it would be just 50.',
    },
  }),
  q({
    id: 'home-wpol-do', category: 'everyday', cefr: 'B1', kind: 'listen', image: 'lidl',
    prompt: {
      ru: 'Продавец: «Zamykamy o wpół do dziesiątej.» Во сколько вечером закрывается магазин?',
      uk: 'Продавець: «Zamykamy o wpół do dziesiątej.» О котрій увечері закривається магазин?',
      en: 'The shop assistant: «Zamykamy o wpół do dziesiątej.» When does the shop close in the evening?',
    },
    options: ['21:30', '22:30', '22:00', '21:45'],
    answer: 0,
    explain: {
      ru: '«Wpół do dziesiątej» — «половина до десятой», то есть 9:30, вечером 21:30 (как русское «полдесятого»). 22:30 — «wpół do jedenastej», 21:45 — «za kwadrans dziesiąta».',
      uk: '«Wpół do dziesiątej» — «половина до десятої», тобто 9:30, увечері 21:30 (як «пів на десяту»). 22:30 — «wpół do jedenastej», 21:45 — «za kwadrans dziesiąta».',
      en: '«Wpół do dziesiątej» means "half to ten", i.e. 9:30, so 21:30 in the evening. 22:30 would be «wpół do jedenastej», 21:45 — «za kwadrans dziesiąta».',
    },
  }),
  q({
    id: 'home-czwartek', category: 'everyday', cefr: 'A1', kind: 'listen', image: 'biuro',
    prompt: {
      ru: 'Сегодня вторник. Коллега: «Spotkamy się pojutrze.» Когда встреча?',
      uk: 'Сьогодні вівторок. Колега: «Spotkamy się pojutrze.» Коли зустріч?',
      en: 'Today is Tuesday. A colleague says: «Spotkamy się pojutrze.» When is the meeting?',
    },
    options: ['w czwartek', 'w środę', 'w piątek', 'w sobotę'],
    answer: 0,
    explain: {
      ru: '«Pojutrze» — послезавтра: вторник → «jutro» (завтра) среда → «pojutrze» четверг. Środa — среда, piątek — пятница, sobota — суббота.',
      uk: '«Pojutrze» — післязавтра: вівторок → «jutro» (завтра) середа → «pojutrze» четвер. Środa — середа, piątek — п\'ятниця, sobota — субота.',
      en: '«Pojutrze» is the day after tomorrow: Tuesday → «jutro» (tomorrow) Wednesday → «pojutrze» Thursday. Środa is Wednesday, piątek Friday, sobota Saturday.',
    },
  }),
  q({
    id: 'home-paczkomat', category: 'everyday', cefr: 'A2', kind: 'listen', image: 'mieszkanie',
    prompt: {
      ru: 'SMS: «Paczka czeka w Paczkomacie do środy. Kod odbioru: 452871.» Что делать?',
      uk: 'SMS: «Paczka czeka w Paczkomacie do środy. Kod odbioru: 452871.» Що робити?',
      en: 'A text: «Paczka czeka w Paczkomacie do środy. Kod odbioru: 452871.» What should you do?',
    },
    options: {
      ru: ['забрать посылку до среды по коду', 'получить посылку в среду у курьера', 'отправить посылку до среды', 'оплатить посылку до среды'],
      uk: ['забрати посилку до середи за кодом', "отримати посилку в середу в кур'єра", 'надіслати посилку до середи', 'оплатити посилку до середи'],
      en: ['collect it by Wednesday with the code', 'the courier brings it on Wednesday', 'send the parcel by Wednesday', 'pay for the parcel by Wednesday'],
    },
    answer: 0,
    explain: {
      ru: '«Czeka w Paczkomacie do środy» — лежит в постамате до среды, «kod odbioru» — код получения. Курьер — «kurier», отправить — «nadać», оплатить — «zapłacić».',
      uk: '«Czeka w Paczkomacie do środy» — лежить у поштоматі до середи, «kod odbioru» — код отримання. Кур\'єр — «kurier», надіслати — «nadać», оплатити — «zapłacić».',
      en: '«Czeka w Paczkomacie do środy» — it waits in the parcel locker until Wednesday; «kod odbioru» is the pick-up code. A courier is «kurier», to send — «nadać», to pay — «zapłacić».',
    },
  }),
];

/** Міста карти Польщі. Координати — реальні (довгота/широта), проєкція в seed. */
import type { Cefr, I18n } from '@polski-go/shared';
import { t } from './builders';

export type CitySeed = {
  slug: string;
  namePl: string;
  name: I18n;
  theme: I18n;
  description: I18n;
  cefr: Cefr;
  lon: number;
  lat: number;
  /** Зсув мітки на мультяшній карті (щоб сусідні міста не накладалися). */
  dx?: number;
  dy?: number;
  emoji: string;
  color: string;
};


/** Міста, прибрані з маршруту (архівуються при seed, дані користувачів зберігаються). */
export const REMOVED_CITIES = ['sopot', 'czestochowa'];

/**
 * Маршрут подорожі (порядок = порядок відкриття міст). Логіка маршруту:
 * столиця → центр (Łódź) → південь (Kraków, Katowice, Opole) → захід (Wrocław, Poznań) — програма A1;
 * далі північний захід і Балтика (A2), схід країни (B1) і фінал у горах (B2).
 * Міста без уроків показуються на карті як «у підготовці».
 */
export const CITIES: CitySeed[] = [
  { slug: 'warszawa', namePl: 'Warszawa', name: t('Варшава', 'Варшава', 'Warsaw'), theme: t('Знайомство, транспорт і перші справи', 'Знакомство, транспорт и первые дела', 'Introductions, transport & first errands'),
    description: t('Столиця Польщі, де живе Варшавська Сирена. Тут починається твоя подорож!', 'Столица Польши, где живёт Варшавская Русалка. Здесь начинается твоё путешествие!', 'The capital, home of the Warsaw Mermaid. Your journey starts here!'),
    cefr: 'A1', lon: 21.01, lat: 52.23, emoji: '🧜‍♀️', color: '#E5484D' },
  { slug: 'lodz', namePl: 'Łódź', name: t('Лодзь', 'Лодзь', 'Łódź'), theme: t('Звуки, люди, робота і час', 'Звуки, люди, работа и время', 'Sounds, people, work & time'),
    description: t('Колишня фабрична столиця з вулицею Пйотрковською.', 'Бывшая фабричная столица с улицей Пётрковской.', 'The former factory capital with Piotrkowska Street.'),
    cefr: 'A1', lon: 19.46, lat: 51.76, emoji: '🏭', color: '#EB5757' },
  { slug: 'krakow', namePl: 'Kraków', name: t('Краків', 'Краков', 'Kraków'), theme: t('Сім\'я, дім і місто', 'Семья, дом и город', 'Family, home & the city'),
    description: t('Королівське місто з Вавельським драконом і найбільшим ринком Європи.', 'Королевский город с Вавельским драконом и крупнейшей площадью Европы.', 'The royal city with the Wawel Dragon and Europe\'s largest market square.'),
    cefr: 'A1', lon: 19.94, lat: 50.06, dx: 26, dy: 4, emoji: '🐉', color: '#F2994A' },
  { slug: 'katowice', namePl: 'Katowice', name: t('Катовіце', 'Катовице', 'Katowice'), theme: t('Транспорт, поїздки й квартира', 'Транспорт, поездки и квартира', 'Transport, trips & renting a flat'),
    description: t('Серце Сілезії: шахти, музика і Сподек.', 'Сердце Силезии: шахты, музыка и Сподек.', 'The heart of Silesia: mines, music and Spodek.'),
    cefr: 'A1', lon: 19.02, lat: 50.26, dx: -62, dy: -6, emoji: '⛏️', color: '#4F4F4F' },
  { slug: 'opole', namePl: 'Opole', name: t('Ополе', 'Ополе', 'Opole'), theme: t('Живий розмовний польський', 'Живой разговорный польский', 'Everyday spoken Polish'),
    description: t('Столиця польської пісні: тут бобер чує, як поляки говорять насправді.', 'Столица польской песни: здесь бобр слышит, как поляки говорят на самом деле.', 'The capital of Polish song, where the beaver hears how Poles really talk.'),
    cefr: 'A1', lon: 17.93, lat: 50.67, dx: -20, dy: 0, emoji: '🎤', color: '#F2994A' },
  { slug: 'wroclaw', namePl: 'Wrocław', name: t('Вроцлав', 'Вроцлав', 'Wrocław'), theme: t('Покупки і кафе', 'Покупки и кафе', 'Shopping & cafés'),
    description: t('Місто мостів і сотень бронзових гномів. Тут бобер вчиться замовляти і платити.', 'Город мостов и сотен бронзовых гномов. Здесь бобр учится заказывать и платить.', 'City of bridges and hundreds of bronze gnomes.'),
    cefr: 'A1', lon: 17.04, lat: 51.11, emoji: '🧙‍♂️', color: '#9B51E0' },
  { slug: 'poznan', namePl: 'Poznań', name: t('Познань', 'Познань', 'Poznań'), theme: t('Міста, дати й робота', 'Города, даты и работа', 'Cities, dates & work'),
    description: t('Місто козликів на ратуші та ярмарків. Тут бобер шукає роботу.', 'Город козликов на ратуше и ярмарок. Здесь бобр ищет работу.', 'City of the town-hall goats and trade fairs.'),
    cefr: 'A1', lon: 16.93, lat: 52.41, emoji: '🐐', color: '#27AE60' },
  { slug: 'zielona-gora', namePl: 'Zielona Góra', name: t('Зелена Гура', 'Зелёна-Гура', 'Zielona Góra'), theme: t('Свята і традиції', 'Праздники и традиции', 'Holidays & traditions'),
    description: t('Місто виноградників і веселих бахусиків.', 'Город виноградников и весёлых бахусиков.', 'A city of vineyards and cheerful little Bacchus statues.'),
    cefr: 'A2', lon: 15.51, lat: 51.94, emoji: '🍇', color: '#9568F5' },
  { slug: 'gorzow', namePl: 'Gorzów Wielkopolski', name: t('Гожув-Великопольський', 'Гожув-Велькопольский', 'Gorzów Wielkopolski'), theme: t('Погода і природа', 'Погода и природа', 'Weather & nature'),
    description: t('Місто над Вартою з довгим бульваром, а навколо — ліси й озера. Тут бобер говорить про погоду й природу.', 'Город над Вартой с длинным бульваром, а вокруг — леса и озёра. Здесь бобр говорит о погоде и природе.', 'A town on the Warta with a long boulevard and forests and lakes all around. Here the beaver talks about weather and nature.'),
    cefr: 'A2', lon: 15.24, lat: 52.73, emoji: '🎓', color: '#F45159' },
  { slug: 'szczecin', namePl: 'Szczecin', name: t('Щецин', 'Щецин', 'Szczecin'), theme: t('Робота і професії', 'Работа и профессии', 'Jobs & professions'),
    description: t('Портове місто з Валами Хроброго.', 'Портовый город с Валами Хробрего.', 'A port city with the Chrobry Embankment.'),
    cefr: 'A2', lon: 14.55, lat: 53.43, dx: 40, dy: 0, emoji: '🚢', color: '#56CCF2' },
  { slug: 'gdansk', namePl: 'Gdańsk', name: t('Гданськ', 'Гданьск', 'Gdańsk'), theme: t('Подорожі і відпочинок', 'Путешествия и отдых', 'Travel & holidays'),
    description: t('Морська перлина на Балтиці з Нептуном і портовим краном.', 'Морская жемчужина Балтики с Нептуном и портовым краном.', 'The Baltic pearl with Neptune and the old port crane.'),
    cefr: 'A2', lon: 18.65, lat: 54.35, dx: 46, dy: 40, emoji: '⚓', color: '#2D9CDB' },
  { slug: 'gdynia', namePl: 'Gdynia', name: t('Гдиня', 'Гдыня', 'Gdynia'), theme: t('Спорт і хобі', 'Спорт и хобби', 'Sport & hobbies'),
    description: t('Сучасний порт і вітрильник «Дар Поморя».', 'Современный порт и парусник «Дар Поморья».', 'A modern port with the Dar Pomorza tall ship.'),
    cefr: 'A2', lon: 18.53, lat: 54.52, dx: -40, dy: -36, emoji: '⛵', color: '#2D9CDB' },
  { slug: 'bydgoszcz', namePl: 'Bydgoszcz', name: t('Бидгощ', 'Быдгощ', 'Bydgoszcz'), theme: t('Минулий час і розповіді', 'Прошедшее время и рассказы', 'Past tense & stories'),
    description: t('Місто над Брдою з Лучницею.', 'Город над Брдой с Лучницей.', 'The city on the Brda with the Archer statue.'),
    cefr: 'B1', lon: 18.0, lat: 53.12, dx: -46, dy: -14, emoji: '🏹', color: '#6FCF97' },
  { slug: 'torun', namePl: 'Toruń', name: t('Торунь', 'Торунь', 'Toruń'), theme: t('Плани і майбутнє', 'Планы и будущее', 'Plans & the future'),
    description: t('Батьківщина Коперника і знаменитих пряників.', 'Родина Коперника и знаменитых пряников.', 'Copernicus\'s hometown, famous for gingerbread.'),
    cefr: 'B1', lon: 18.6, lat: 53.01, dx: 52, dy: 18, emoji: '🍪', color: '#A0522D' },
  { slug: 'olsztyn', namePl: 'Olsztyn', name: t('Ольштин', 'Ольштын', 'Olsztyn'), theme: t('Розуміння мовлення', 'Понимание речи', 'Listening comprehension'),
    description: t('Місто серед озер Вармії.', 'Город среди озёр Вармии.', 'A city among the Warmian lakes.'),
    cefr: 'B1', lon: 20.49, lat: 53.78, emoji: '🏞️', color: '#2F80ED' },
  { slug: 'bialystok', namePl: 'Białystok', name: t('Білосток', 'Белосток', 'Białystok'), theme: t('Повсякденні ситуації', 'Повседневные ситуации', 'Everyday situations'),
    description: t('Брама до Біловезької пущі, де живуть зубри.', 'Ворота в Беловежскую пущу, где живут зубры.', 'Gateway to the Białowieża Forest and its bison.'),
    cefr: 'B1', lon: 23.16, lat: 53.13, emoji: '🦬', color: '#219653' },
  { slug: 'lublin', namePl: 'Lublin', name: t('Люблін', 'Люблин', 'Lublin'), theme: t('Документи та установи', 'Документы и учреждения', 'Documents & offices'),
    description: t('Місто з королівським замком, близьке до України.', 'Город с королевским замком, близкий к Украине.', 'A castle city close to Ukraine.'),
    cefr: 'B1', lon: 22.57, lat: 51.25, emoji: '🏯', color: '#F2C94C' },
  { slug: 'rzeszow', namePl: 'Rzeszów', name: t('Жешув', 'Жешув', 'Rzeszów'), theme: t('Державні послуги', 'Государственные услуги', 'Public services'),
    description: t('Столиця інновацій на південному сході.', 'Столица инноваций на юго-востоке.', 'The innovation capital of the south-east.'),
    cefr: 'B2', lon: 22.0, lat: 50.04, emoji: '🛩️', color: '#BB6BD9' },
  { slug: 'kielce', namePl: 'Kielce', name: t('Кельце', 'Кельце', 'Kielce'), theme: t('Закріплення знань', 'Закрепление знаний', 'Consolidation'),
    description: t('Свентокшиські гори і легенди про відьом.', 'Свентокшиские горы и легенды о ведьмах.', 'Holy Cross Mountains and witch legends.'),
    cefr: 'B2', lon: 20.63, lat: 50.87, emoji: '🧹', color: '#828282' },
  { slug: 'zakopane', namePl: 'Zakopane', name: t('Закопане', 'Закопане', 'Zakopane'), theme: t('Фінал: культура і подорожі', 'Финал: культура и путешествия', 'Finale: culture & travel'),
    description: t('Зимова столиця Польщі біля Татр.', 'Зимняя столица Польши у Татр.', 'Poland\'s winter capital at the foot of the Tatras.'),
    cefr: 'B2', lon: 19.95, lat: 49.3, emoji: '🏔️', color: '#56CCF2' },
];

/** Розмір полотна карти (SVG viewBox). */
export const MAP_W = 1000;
export const MAP_H = 950;

export function project(lon: number, lat: number): { x: number; y: number } {
  return {
    x: Math.round(((lon - 13.9) / (24.4 - 13.9)) * MAP_W),
    y: Math.round(((55.05 - lat) / 6.15) * MAP_H),
  };
}

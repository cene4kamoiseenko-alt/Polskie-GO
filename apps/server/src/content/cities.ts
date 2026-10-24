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

export const CITIES: CitySeed[] = [
  { slug: 'warszawa', namePl: 'Warszawa', name: t('Варшава', 'Варшава', 'Warsaw'), theme: t('Перші слова і знайомство', 'Первые слова и знакомство', 'First words & introductions'),
    description: t('Столиця Польщі, де живе Варшавська Сирена. Тут починається твоя подорож!', 'Столица Польши, где живёт Варшавская Русалка. Здесь начинается твоё путешествие!', 'The capital, home of the Warsaw Mermaid. Your journey starts here!'),
    cefr: 'A0', lon: 21.01, lat: 52.23, emoji: '🧜‍♀️', color: '#E5484D' },
  { slug: 'krakow', namePl: 'Kraków', name: t('Краків', 'Краков', 'Kraków'), theme: t('Сім\'я і повсякденне життя', 'Семья и повседневная жизнь', 'Family & daily life'),
    description: t('Королівське місто з Вавельським драконом і найбільшим ринком Європи.', 'Королевский город с Вавельским драконом и крупнейшей площадью Европы.', 'The royal city with the Wawel Dragon and Europe\'s largest market square.'),
    cefr: 'A0', lon: 19.94, lat: 50.06, emoji: '🐉', color: '#F2994A' },
  { slug: 'wroclaw', namePl: 'Wrocław', name: t('Вроцлав', 'Вроцлав', 'Wrocław'), theme: t('Покупки, кафе, ресторани', 'Покупки, кафе, рестораны', 'Shopping, cafés, restaurants'),
    description: t('Місто мостів і сотень бронзових гномів. Тут бобер вчиться замовляти і платити.', 'Город мостов и сотен бронзовых гномов. Здесь бобр учится заказывать и платить.', 'City of bridges and hundreds of bronze gnomes.'),
    cefr: 'A1', lon: 17.04, lat: 51.11, emoji: '🧙‍♂️', color: '#9B51E0' },
  { slug: 'gdansk', namePl: 'Gdańsk', name: t('Гданськ', 'Гданьск', 'Gdańsk'), theme: t('Транспорт і подорожі', 'Транспорт и путешествия', 'Transport & travel'),
    description: t('Морська перлина на Балтиці з Нептуном і портовим краном.', 'Морская жемчужина Балтики с Нептуном и портовым краном.', 'The Baltic pearl with Neptune and the old port crane.'),
    cefr: 'A1', lon: 18.65, lat: 54.35, dx: 46, dy: 40, emoji: '⚓', color: '#2D9CDB' },
  { slug: 'poznan', namePl: 'Poznań', name: t('Познань', 'Познань', 'Poznań'), theme: t('Робота і професії', 'Работа и профессии', 'Work & professions'),
    description: t('Місто козликів на ратуші та ярмарків. Тут бобер шукає роботу.', 'Город козликов на ратуше и ярмарок. Здесь бобр ищет работу.', 'City of the town-hall goats and trade fairs.'),
    cefr: 'A1', lon: 16.93, lat: 52.41, emoji: '🐐', color: '#27AE60' },
  { slug: 'lodz', namePl: 'Łódź', name: t('Лодзь', 'Лодзь', 'Łódź'), theme: t('Житло та оренда', 'Жильё и аренда', 'Housing & renting'),
    description: t('Колишня фабрична столиця з вулицею Пйотрковською.', 'Бывшая фабричная столица с улицей Пётрковской.', 'The former factory capital with Piotrkowska Street.'),
    cefr: 'A2', lon: 19.46, lat: 51.76, emoji: '🏭', color: '#EB5757' },
  { slug: 'katowice', namePl: 'Katowice', name: t('Катовіце', 'Катовице', 'Katowice'), theme: t('Здоров\'я і медицина', 'Здоровье и медицина', 'Health & medicine'),
    description: t('Серце Сілезії: шахти, музика і Сподек.', 'Сердце Силезии: шахты, музыка и Сподек.', 'The heart of Silesia: mines, music and Spodek.'),
    cefr: 'A2', lon: 19.02, lat: 50.26, dx: -30, dy: 6, emoji: '⛏️', color: '#4F4F4F' },
  { slug: 'lublin', namePl: 'Lublin', name: t('Люблін', 'Люблин', 'Lublin'), theme: t('Документи та установи', 'Документы и учреждения', 'Documents & offices'),
    description: t('Місто з королівським замком, близьке до України.', 'Город с королевским замком, близкий к Украине.', 'A castle city close to Ukraine.'),
    cefr: 'A2', lon: 22.57, lat: 51.25, emoji: '🏯', color: '#F2C94C' },
  { slug: 'szczecin', namePl: 'Szczecin', name: t('Щецин', 'Щецин', 'Szczecin'), theme: t('Розмовна польська', 'Разговорный польский', 'Conversational Polish'),
    description: t('Портове місто з Валами Хроброго.', 'Портовый город с Валами Хробрего.', 'A port city with the Chrobry Embankment.'),
    cefr: 'A2', lon: 14.55, lat: 53.43, emoji: '🚢', color: '#56CCF2' },
  { slug: 'torun', namePl: 'Toruń', name: t('Торунь', 'Торунь', 'Toruń'), theme: t('Часи і граматика', 'Времена и грамматика', 'Tenses & grammar'),
    description: t('Батьківщина Коперника і знаменитих пряників.', 'Родина Коперника и знаменитых пряников.', 'Copernicus\'s hometown, famous for gingerbread.'),
    cefr: 'A2', lon: 18.6, lat: 53.01, dx: 52, dy: 18, emoji: '🍪', color: '#A0522D' },
  { slug: 'bydgoszcz', namePl: 'Bydgoszcz', name: t('Бидгощ', 'Быдгощ', 'Bydgoszcz'), theme: t('Складні діалоги', 'Сложные диалоги', 'Complex dialogues'),
    description: t('Місто над Бродою з Лучницею.', 'Город над Брдой с Лучницей.', 'The city on the Brda with the Archer statue.'),
    cefr: 'B1', lon: 18.0, lat: 53.12, dx: -46, dy: -14, emoji: '🏹', color: '#6FCF97' },
  { slug: 'rzeszow', namePl: 'Rzeszów', name: t('Жешув', 'Жешув', 'Rzeszów'), theme: t('Державні послуги', 'Государственные услуги', 'Public services'),
    description: t('Столиця інновацій на південному сході.', 'Столица инноваций на юго-востоке.', 'The innovation capital of the south-east.'),
    cefr: 'B1', lon: 22.0, lat: 50.04, emoji: '🛩️', color: '#BB6BD9' },
  { slug: 'bialystok', namePl: 'Białystok', name: t('Білосток', 'Белосток', 'Białystok'), theme: t('Повсякденні ситуації', 'Повседневные ситуации', 'Everyday situations'),
    description: t('Брама до Біловезької пущі, де живуть зубри.', 'Ворота в Беловежскую пущу, где живут зубры.', 'Gateway to the Białowieża Forest and its bison.'),
    cefr: 'B1', lon: 23.16, lat: 53.13, emoji: '🦬', color: '#219653' },
  { slug: 'olsztyn', namePl: 'Olsztyn', name: t('Ольштин', 'Ольштын', 'Olsztyn'), theme: t('Розуміння мовлення', 'Понимание речи', 'Listening comprehension'),
    description: t('Місто серед озер Вармії.', 'Город среди озёр Вармии.', 'A city among the Warmian lakes.'),
    cefr: 'B1', lon: 20.49, lat: 53.78, emoji: '🏞️', color: '#2F80ED' },
  { slug: 'opole', namePl: 'Opole', name: t('Ополе', 'Ополе', 'Opole'), theme: t('Практична граматика', 'Практическая грамматика', 'Practical grammar'),
    description: t('Столиця польської пісні.', 'Столица польской песни.', 'The capital of Polish song.'),
    cefr: 'B1', lon: 17.93, lat: 50.67, dx: -20, dy: 0, emoji: '🎤', color: '#F2994A' },
  { slug: 'kielce', namePl: 'Kielce', name: t('Кельце', 'Кельце', 'Kielce'), theme: t('Закріплення знань', 'Закрепление знаний', 'Consolidation'),
    description: t('Свентокшиські гори і легенди про відьом.', 'Свентокшиские горы и легенды о ведьмах.', 'Holy Cross Mountains and witch legends.'),
    cefr: 'B1', lon: 20.63, lat: 50.87, emoji: '🧹', color: '#828282' },
  { slug: 'zakopane', namePl: 'Zakopane', name: t('Закопане', 'Закопане', 'Zakopane'), theme: t('Подорожі та культура', 'Путешествия и культура', 'Travel & culture'),
    description: t('Зимова столиця Польщі біля Татр.', 'Зимняя столица Польши у Татр.', 'Poland\'s winter capital at the foot of the Tatras.'),
    cefr: 'B2', lon: 19.95, lat: 49.3, emoji: '🏔️', color: '#56CCF2' },
  { slug: 'zielona-gora', namePl: 'Zielona Góra', name: t('Зелена Гура', 'Зелёна-Гура', 'Zielona Góra'), theme: t('Розмовні ситуації', 'Разговорные ситуации', 'Conversation situations'),
    description: t('Місто виноградників і веселих бахусиків.', 'Город виноградников и весёлых бахусиков.', 'A city of vineyards and cheerful little Bacchus statues.'),
    cefr: 'B2', lon: 15.51, lat: 51.94, emoji: '🍇', color: '#9568F5' },
  { slug: 'gdynia', namePl: 'Gdynia', name: t('Гдиня', 'Гдыня', 'Gdynia'), theme: t('Робота і ділове листування', 'Работа и деловая переписка', 'Work & business writing'),
    description: t('Сучасний порт і вітрильник «Дар Поморя».', 'Современный порт и парусник «Дар Поморья».', 'A modern port with the Dar Pomorza tall ship.'),
    cefr: 'B2', lon: 18.53, lat: 54.52, dx: -40, dy: -36, emoji: '⛵', color: '#2D9CDB' },
  { slug: 'gorzow', namePl: 'Gorzów Wielkopolski', name: t('Гожув-Великопольський', 'Гожув-Велькопольский', 'Gorzów Wielkopolski'), theme: t('Підготовка до іспитів', 'Подготовка к экзаменам', 'Exam preparation'),
    description: t('Фінальна зупинка над Вартою: генеральна репетиція перед іспитом B2.', 'Финальная остановка над Вартой: генеральная репетиция перед экзаменом B2.', 'The final stop on the Warta: a dress rehearsal for the B2 exam.'),
    cefr: 'B2', lon: 15.24, lat: 52.73, emoji: '🎓', color: '#F45159' },
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

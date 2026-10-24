/**
 * «Паспорт мандрівника»: за складений іспит міста — штамп, листівка від Бобека та коротка
 * культурна нотатка. Нотатки — загальновідомі факти, без дат і цифр, у яких можна помилитися.
 * Листівки пов'язують міста в одну історію подорожі.
 */
import type { I18n } from '@polski-go/shared';
import { t } from './builders';

export type PassportCity = { postcard: { pl: string; tr: I18n }; note: I18n };

const pc = (pl: string, uk: string, ru: string, en: string) => ({ pl, tr: t(uk, ru, en) });

export const PASSPORT: Record<string, PassportCity> = {
  warszawa: {
    postcard: pc('Cześć! Jestem w Warszawie. Znam już pierwsze słowa. Jutro jadę dalej!', 'Привіт! Я у Варшаві. Уже знаю перші слова. Завтра їду далі!', 'Привет! Я в Варшаве. Уже знаю первые слова. Завтра еду дальше!', 'Hi! I’m in Warsaw. I know my first words. Tomorrow I travel on!'),
    note: t('Старе місто Варшави майже повністю зруйнували під час Другої світової війни й відбудували за старими зображеннями; воно внесене до списку Світової спадщини ЮНЕСКО. Символ міста — Сирена (Syrenka).', 'Старый город Варшавы почти полностью разрушили во время Второй мировой войны и восстановили по старым изображениям; он внесён в список Всемирного наследия ЮНЕСКО. Символ города — Сирена (Syrenka).', 'Warsaw’s Old Town was almost entirely destroyed in WWII and rebuilt from old images; it is a UNESCO World Heritage site. The city’s symbol is the Mermaid (Syrenka).'),
  },
  lodz: {
    postcard: pc('Pozdrowienia z Łodzi! Ulica Piotrkowska jest bardzo długa.', 'Вітання з Лодзі! Вулиця Пьотрковська дуже довга.', 'Привет из Лодзи! Улица Пётрковская очень длинная.', 'Greetings from Łódź! Piotrkowska Street is very long.'),
    note: t('Вулиця Piotrkowska — головна вулиця Лодзі й одна з найдовших торгових вулиць Європи. Лодзь виросла як велике місто текстильних фабрик.', 'Улица Piotrkowska — главная улица Лодзи и одна из самых длинных торговых улиц Европы. Лодзь выросла как большой город текстильных фабрик.', 'Piotrkowska is one of Europe’s longest shopping streets. Łódź grew as a textile-industry city.'),
  },
  krakow: {
    postcard: pc('Kraków jest piękny! Jadłem pierogi i słuchałem hejnału.', 'Краків прекрасний! Я їв pierogi і слухав гейнал.', 'Краков прекрасен! Я ел pierogi и слушал хейнал.', 'Kraków is beautiful! I ate pierogi and listened to the bugle call.'),
    note: t('Щогодини з вежі Маріацького костелу трубач грає мелодію «Hejnał mariacki» і обриває її на півноті. Старе місто Кракова — серед перших об’єктів Світової спадщини ЮНЕСКО.', 'Каждый час с башни Мариацкого костёла трубач играет мелодию «Hejnał mariacki» и обрывает её на полуноте. Старый город Кракова — среди первых объектов Всемирного наследия ЮНЕСКО.', 'Every hour a trumpeter plays the Hejnał from St Mary’s tower, breaking off mid-melody. Kraków’s Old Town was among the first UNESCO sites.'),
  },
  katowice: {
    postcard: pc('Jestem w Katowicach. Spodek wygląda jak latający talerz!', 'Я в Катовіце. Сподек схожий на літаючу тарілку!', 'Я в Катовице. Сподек похож на летающую тарелку!', 'I’m in Katowice. The Spodek looks like a flying saucer!'),
    note: t('Spodek — спортивно-концертна арена в Катовіце, що формою нагадує летючу тарілку. Місто — центр Сілезії з довгою шахтарською історією.', 'Spodek — спортивно-концертная арена в Катовице, по форме напоминающая летающую тарелку. Город — центр Силезии с долгой шахтёрской историей.', 'The Spodek arena is shaped like a flying saucer. Katowice is the heart of Silesia’s mining region.'),
  },
  opole: {
    postcard: pc('Pozdrowienia z Opola! Tu wszyscy śpiewają.', 'Вітання з Ополя! Тут усі співають.', 'Привет из Ополе! Здесь все поют.', 'Greetings from Opole! Everyone sings here.'),
    note: t('В Ополі з 1960-х років проходить Національний фестиваль польської пісні — один із найвідоміших музичних фестивалів країни.', 'В Ополе с 1960-х годов проходит Национальный фестиваль польской песни — один из самых известных музыкальных фестивалей страны.', 'Opole has hosted the National Festival of Polish Song since the 1960s.'),
  },
  wroclaw: {
    postcard: pc('We Wrocławiu szukam krasnali. Znalazłem już pięć!', 'У Вроцлаві я шукаю гномів. Уже знайшов п’ятьох!', 'Во Вроцлаве я ищу гномов. Уже нашёл пятерых!', 'In Wrocław I’m hunting for dwarfs. Found five already!'),
    note: t('По всьому Вроцлаву стоять сотні маленьких бронзових гномів — krasnale; туристи шукають їх як гру. Зала Сторіччя (Hala Stulecia) у Вроцлаві — об’єкт Світової спадщини ЮНЕСКО.', 'По всему Вроцлаву стоят сотни маленьких бронзовых гномов — krasnale; туристы ищут их как игру. Зал Столетия (Hala Stulecia) во Вроцлаве — объект Всемирного наследия ЮНЕСКО.', 'Hundreds of small bronze dwarfs (krasnale) hide around Wrocław. Centennial Hall is a UNESCO site.'),
  },
  poznan: {
    postcard: pc('W Poznaniu w południe oglądałem koziołki na ratuszu!', 'У Познані опівдні я дивився на козликів на ратуші!', 'В Познани в полдень я смотрел на козликов на ратуше!', 'In Poznań at noon I watched the goats on the town hall!'),
    note: t('Щодня опівдні на вежі познанської ратуші з’являються два механічні козлики й б’ються рогами — улюблене видовище туристів.', 'Каждый день в полдень на башне познанской ратуши появляются два механических козлика и бодаются — любимое зрелище туристов.', 'Every day at noon two mechanical goats butt heads on Poznań’s town hall tower.'),
  },
  'zielona-gora': {
    postcard: pc('Zielona Góra pachnie winogronami. Liczę małe bachusiki!', 'Зелена Гура пахне виноградом. Рахую маленьких бахусиків!', 'Зелёна-Гура пахнет виноградом. Считаю маленьких бахусиков!', 'Zielona Góra smells of grapes. I’m counting little Bacchus statues!'),
    note: t('Зелена Гура відома виноробними традиціями: щоосені тут проходить свято Winobranie, а містом розставлені маленькі фігурки Бахуса — bachusiki.', 'Зелёна-Гура известна винодельческими традициями: каждую осень здесь проходит праздник Winobranie, а по городу расставлены маленькие фигурки Бахуса — bachusiki.', 'Zielona Góra is known for winemaking, the autumn Winobranie festival and little Bacchus figures.'),
  },
  gorzow: {
    postcard: pc('Gorzów leży nad Wartą. Spacer nad rzeką jest super!', 'Гожув стоїть над Вартою. Прогулянка вздовж річки — супер!', 'Гожув стоит на Варте. Прогулка вдоль реки — супер!', 'Gorzów lies on the Warta. A riverside walk is great!'),
    note: t('Гожув-Великопольський розташований на річці Варта — одній з найбільших річок Польщі.', 'Гожув-Велькопольский расположен на реке Варта — одной из крупнейших рек Польши.', 'Gorzów Wielkopolski stands on the Warta, one of Poland’s major rivers.'),
  },
  szczecin: {
    postcard: pc('Pozdrowienia ze Szczecina! Widzę statki na Odrze.', 'Вітання зі Щецина! Бачу кораблі на Одрі.', 'Привет из Щецина! Вижу корабли на Одре.', 'Greetings from Szczecin! I can see ships on the Oder.'),
    note: t('Щецин — великий порт на річці Одра. Над рікою височіють тераси Wały Chrobrego — одне з найкрасивіших місць міста.', 'Щецин — большой порт на реке Одра. Над рекой возвышаются террасы Wały Chrobrego — одно из самых красивых мест города.', 'Szczecin is a major port on the Oder, with the Chrobry Embankment terraces above the river.'),
  },
  gdansk: {
    postcard: pc('Jestem nad morzem! W Gdańsku widziałem fontannę Neptuna.', 'Я біля моря! У Гданську бачив фонтан Нептуна.', 'Я у моря! В Гданьске видел фонтан Нептуна.', 'I’m by the sea! In Gdańsk I saw Neptune’s Fountain.'),
    note: t('Фонтан Нептуна на вулиці Długi Targ — символ Гданська. На Гданській верфі 1980 року виникла «Солідарність» — рух, що змінив історію Польщі.', 'Фонтан Нептуна на улице Długi Targ — символ Гданьска. На Гданьской верфи в 1980 году возникла «Солидарность» — движение, изменившее историю Польши.', 'Neptune’s Fountain is Gdańsk’s symbol. Solidarity was born at the Gdańsk Shipyard in 1980.'),
  },
  gdynia: {
    postcard: pc('Gdynia jest młoda i nowoczesna. Lubię port!', 'Гдиня молода й сучасна. Мені подобається порт!', 'Гдыня молодая и современная. Мне нравится порт!', 'Gdynia is young and modern. I love the port!'),
    note: t('Гдиня виросла як новий морський порт у 1920–1930-х роках; її центр — приклад архітектури модернізму.', 'Гдыня выросла как новый морской порт в 1920–1930-х годах; её центр — пример архитектуры модернизма.', 'Gdynia grew as a new seaport in the 1920s–30s; its centre is a showcase of modernism.'),
  },
  bydgoszcz: {
    postcard: pc('W Bydgoszczy spacerowałem nad Brdą. Pozdrowienia!', 'У Бидгощі я гуляв над Брдою. Вітання!', 'В Быдгоще я гулял над Брдой. Привет!', 'In Bydgoszcz I walked along the Brda. Greetings!'),
    note: t('Бидгощ стоїть над річкою Брда; одна з візитівок міста — скульптура «Лучниця» (Łuczniczka).', 'Быдгощ стоит на реке Брда; одна из визитных карточек города — скульптура «Лучница» (Łuczniczka).', 'Bydgoszcz lies on the Brda; the Archer statue (Łuczniczka) is a city symbol.'),
  },
  torun: {
    postcard: pc('Toruń pachnie piernikami! Tu urodził się Kopernik.', 'Торунь пахне пряниками! Тут народився Копернік.', 'Торунь пахнет пряниками! Здесь родился Коперник.', 'Toruń smells of gingerbread! Copernicus was born here.'),
    note: t('Торунь — місто народження Миколая Коперника. Торунські пряники (pierniki) відомі ще з середньовіччя, а Старе місто внесене до списку ЮНЕСКО.', 'Торунь — город рождения Николая Коперника. Торуньские пряники (pierniki) известны ещё со Средневековья, а Старый город внесён в список ЮНЕСКО.', 'Toruń is Copernicus’s birthplace, famous for gingerbread since the Middle Ages; its Old Town is a UNESCO site.'),
  },
  olsztyn: {
    postcard: pc('Olsztyn i jeziora! Kopernik też tu mieszkał.', 'Ольштин і озера! Копернік теж тут жив.', 'Ольштын и озёра! Коперник тоже здесь жил.', 'Olsztyn and its lakes! Copernicus lived here too.'),
    note: t('Ольштин — столиця Вармії й Мазурського краю озер. У місцевому замку кілька років жив і працював Миколай Коперник.', 'Ольштын — столица Вармии и Мазурского края озёр. В местном замке несколько лет жил и работал Николай Коперник.', 'Olsztyn is the capital of Warmia; Copernicus lived and worked in its castle.'),
  },
  bialystok: {
    postcard: pc('Pozdrowienia z Białegostoku! Pałac Branickich jest wspaniały.', 'Вітання з Білостока! Палац Браницьких чудовий.', 'Привет из Белостока! Дворец Браницких великолепен.', 'Greetings from Białystok! The Branicki Palace is magnificent.'),
    note: t('Палац Браницьких у Білостоці через пишні сади й архітектуру називають «Підляським Версалем».', 'Дворец Браницких в Белостоке из-за пышных садов и архитектуры называют «Подляшским Версалем».', 'The Branicki Palace is nicknamed the “Versailles of Podlasie”.'),
  },
  lublin: {
    postcard: pc('W Lublinie poznałem historię Unii Lubelskiej.', 'У Любліні я дізнався історію Люблінської унії.', 'В Люблине я узнал историю Люблинской унии.', 'In Lublin I learned about the Union of Lublin.'),
    note: t('У Любліні 1569 року укладено Люблінську унію, що об’єднала Польське королівство й Велике князівство Литовське в Річ Посполиту.', 'В Люблине в 1569 году заключена Люблинская уния, объединившая Польское королевство и Великое княжество Литовское в Речь Посполитую.', 'The Union of Lublin (1569) joined Poland and Lithuania into the Commonwealth.'),
  },
  rzeszow: {
    postcard: pc('W Rzeszowie zszedłem pod ziemię. Ciekawe piwnice!', 'У Жешуві я спустився під землю. Цікаві підвали!', 'В Жешуве я спустился под землю. Интересные подвалы!', 'In Rzeszów I went underground. Fascinating cellars!'),
    note: t('Під Ринковою площею Жешува прокладено туристичний маршрут старими підземними льохами.', 'Под Рыночной площадью Жешува проложен туристический маршрут по старым подземным погребам.', 'A tourist route runs through old cellars beneath Rzeszów’s Market Square.'),
  },
  kielce: {
    postcard: pc('Kielce i Góry Świętokrzyskie. Prawie koniec podróży!', 'Кельце і Свентокшиські гори. Майже кінець подорожі!', 'Кельце и Свентокшиские горы. Почти конец путешествия!', 'Kielce and the Holy Cross Mountains. Almost the end!'),
    note: t('Кельце лежить біля Свентокшиських гір — одних із найстаріших гір Європи. У місті є заповідник Kadzielnia — колишній кар’єр з амфітеатром.', 'Кельце лежит у Свентокшиских гор — одних из старейших гор Европы. В городе есть заповедник Kadzielnia — бывший карьер с амфитеатром.', 'Kielce lies by the ancient Holy Cross Mountains; Kadzielnia is a former quarry with an amphitheatre.'),
  },
  zakopane: {
    postcard: pc('Jestem w górach! Mówię po polsku i patrzę na Giewont. Dziękuję za podróż!', 'Я в горах! Говорю польською і дивлюся на Ґевонт. Дякую за подорож!', 'Я в горах! Говорю по-польски и смотрю на Гевонт. Спасибо за путешествие!', 'I’m in the mountains! Speaking Polish and looking at Giewont. Thanks for the journey!'),
    note: t('Закопане лежить біля підніжжя Татр і має славу «зимової столиці Польщі». Над містом видно вершину Giewont.', 'Закопане лежит у подножия Татр и слывёт «зимней столицей Польши». Над городом видна вершина Giewont.', 'Zakopane, at the foot of the Tatras, is called Poland’s winter capital; Giewont rises above it.'),
  },
};

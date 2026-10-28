/**
 * Словник Щецина (A2): оголошення про роботу (zatrudnimy kierowców), CV (pracowałem jako…, przez dwa lata),
 * співбесіда (pan / pani + 3-тя особа), договір і зарплата (tysiące / tysięcy), порт (w porcie, na statku),
 * прохання до колег (mógłbyś), спізнення й лікарняний (bo, ponieważ), підвищення (chciałbym, wolałbym).
 * Слова praca, pracować, kierowca, magazynier, umowa o pracę, umowa zlecenie, pensja, brutto, netto, nadgodziny,
 * zmiana, CV, rozmowa kwalifikacyjna, doświadczenie, prawo jazdy, kierownik, tysiąc, przelew, spóźnić się,
 * zwolnienie lekarskie, chory, stanowisko, woleć, zamienić się уже є в словнику.
 */
import { w } from './vocab-city';
import type { VocabSeed } from './vocab';

export const SZCZECIN_VOCAB: VocabSeed[] = [
  // ── Оголошення ──
  w('zatrudnić', 'verb', 'A2', 'найняти, взяти на роботу', 'нанять, принять на работу', 'to hire', ['work'],
    ['Firma zatrudni dwóch kierowców.', 'Фірма візьме на роботу двох водіїв.', 'Фирма наймёт двух водителей.', 'The company will hire two drivers.'], { my: 'zatrudnimy' }),
  w('wymagania', 'noun', 'A2', 'вимоги', 'требования', 'requirements', ['work'],
    ['Wymagania: prawo jazdy i doświadczenie.', 'Вимоги: права й досвід.', 'Требования: права и опыт.', 'Requirements: a driving licence and experience.'], { gen: 'wymagań' }),
  w('etat', 'noun', 'A2', 'ставка (обсяг роботи)', 'ставка (объём работы)', 'full-time post (share of hours)', ['work'],
    ['Pracuję na pół etatu.', 'Я працюю на пів ставки.', 'Я работаю на полставки.', 'I work part-time.']),
  w('wynagrodzenie', 'noun', 'B1', 'зарплата, винагорода', 'зарплата, вознаграждение', 'pay, salary', ['work'],
    ['Wynagrodzenie wynosi sześć tysięcy brutto.', 'Зарплата становить шість тисяч брутто.', 'Зарплата составляет шесть тысяч брутто.', 'The salary is six thousand gross.']),
  w('od zaraz', 'phrase', 'A2', 'негайно, з цього ж дня', 'немедленно, с сегодняшнего дня', 'starting immediately', ['work', 'time'],
    ['Szukamy pracownika od zaraz.', 'Шукаємо працівника негайно.', 'Ищем работника срочно.', 'We’re looking for someone to start immediately.']),
  w('mechanik', 'noun', 'A1', 'механік', 'механик', 'mechanic', ['work', 'people'],
    ['Mechanik naprawia samochód.', 'Механік ремонтує машину.', 'Механик ремонтирует машину.', 'The mechanic is repairing the car.'], { pl: 'mechanicy', gen_pl: 'mechaników' }),
  w('elektryk', 'noun', 'A1', 'електрик', 'электрик', 'electrician', ['work', 'people'],
    ['Zadzwoń po elektryka, nie ma prądu.', 'Подзвони електрикові, немає світла.', 'Позвони электрику, нет света.', 'Call an electrician, there’s no power.'], { acc: 'elektryka', pl: 'elektrycy' }),

  // ── CV ──
  w('jako', 'particle', 'A2', 'як, у ролі (кого)', 'как, в качестве', 'as (in the role of)', ['work', 'grammar'],
    ['Pracuję jako kierowca.', 'Я працюю водієм.', 'Я работаю водителем.', 'I work as a driver.']),
  w('przez', 'prep', 'A2', 'протягом; крізь', 'в течение; через, сквозь', 'for (time); through', ['time', 'grammar'],
    ['Przez dwa lata mieszkałem w Gdańsku.', 'Два роки я жив у Гданську.', 'Два года я жил в Гданьске.', 'I lived in Gdańsk for two years.']),
  w('list motywacyjny', 'noun', 'B1', 'мотиваційний лист', 'мотивационное письмо', 'cover letter', ['work', 'documents'],
    ['Do CV dołączam list motywacyjny.', 'До резюме додаю мотиваційний лист.', 'К резюме прикладываю мотивационное письмо.', 'I attach a cover letter to my CV.']),
  w('umiejętność', 'noun', 'A2', 'уміння, навичка', 'умение, навык', 'skill', ['work'],
    ['W CV wpisz swoje umiejętności.', 'У резюме впиши свої навички.', 'В резюме впиши свои навыки.', 'List your skills in your CV.'], { pl: 'umiejętności' }),
  w('znajomość', 'noun', 'A2', 'знання (мови); знайомство', 'знание (языка); знакомство', 'knowledge (of a language)', ['work'],
    ['Wymagana jest znajomość języka niemieckiego.', 'Потрібне знання німецької мови.', 'Требуется знание немецкого языка.', 'Knowledge of German is required.']),
  w('angielski', 'adj', 'A1', 'англійський; англійська мова', 'английский; английский язык', 'English', ['work', 'people'],
    ['Znam angielski na poziomie podstawowym.', 'Я знаю англійську на базовому рівні.', 'Я знаю английский на базовом уровне.', 'I have basic English.']),
  w('niemiecki', 'adj', 'A1', 'німецький; німецька мова', 'немецкий; немецкий язык', 'German', ['work', 'people'],
    ['W Szczecinie przydaje się niemiecki.', 'У Щецині знадобиться німецька.', 'В Щецине пригодится немецкий.', 'German comes in handy in Szczecin.']),

  // ── Співбесіда ──
  w('kandydat', 'noun', 'A2', 'кандидат', 'кандидат', 'candidate', ['work'],
    ['Na to stanowisko jest pięciu kandydatów.', 'На цю посаду п’ятеро кандидатів.', 'На эту должность пять кандидатов.', 'There are five candidates for this job.'], { f: 'kandydatka' }),
  w('punktualny', 'adj', 'A2', 'пунктуальний', 'пунктуальный', 'punctual', ['work', 'people'],
    ['Jestem punktualny, zawsze przychodzę wcześniej.', 'Я пунктуальний, завжди приходжу раніше.', 'Я пунктуальный, всегда прихожу раньше.', 'I’m punctual, I always come early.'], { f: 'punktualna' }),
  w('odpowiedzialny', 'adj', 'A2', 'відповідальний', 'ответственный', 'responsible', ['work', 'people'],
    ['Szukamy osoby odpowiedzialnej i spokojnej.', 'Шукаємо відповідальну й спокійну людину.', 'Ищем ответственного и спокойного человека.', 'We’re looking for a responsible, calm person.'], { f: 'odpowiedzialna' }),
  w('obowiązki', 'noun', 'A2', 'обов’язки', 'обязанности', 'duties', ['work'],
    ['Do moich obowiązków należy przyjmowanie towaru.', 'До моїх обов’язків належить приймання товару.', 'В мои обязанности входит приём товара.', 'My duties include receiving goods.'], { gen: 'obowiązków' }),
  w('odpowiadać za', 'phrase', 'B1', 'відповідати за', 'отвечать за', 'to be responsible for', ['work'],
    ['Odpowiadam za cały magazyn.', 'Я відповідаю за весь склад.', 'Я отвечаю за весь склад.', 'I’m responsible for the whole warehouse.']),

  // ── Договір і зарплата ──
  w('zarabiać', 'verb', 'A2', 'заробляти', 'зарабатывать', 'to earn', ['work', 'bank'],
    ['Ile zarabiasz na tym stanowisku?', 'Скільки ти заробляєш на цій посаді?', 'Сколько ты зарабатываешь на этой должности?', 'How much do you earn in this job?'], { ja: 'zarabiam' }),
  w('okres próbny', 'noun', 'B1', 'випробувальний термін', 'испытательный срок', 'probation period', ['work', 'documents'],
    ['Okres próbny trwa trzy miesiące.', 'Випробувальний термін триває три місяці.', 'Испытательный срок длится три месяца.', 'The probation period lasts three months.']),
  w('umowa na czas określony', 'noun', 'B1', 'строковий договір', 'срочный договор', 'fixed-term contract', ['work', 'documents'],
    ['Mam umowę na czas określony do końca roku.', 'У мене строковий договір до кінця року.', 'У меня срочный договор до конца года.', 'I have a fixed-term contract until the end of the year.']),
  w('wypowiedzenie', 'noun', 'B1', 'повідомлення про звільнення', 'уведомление об увольнении', 'notice (of termination)', ['work', 'documents'],
    ['Złożyłem wypowiedzenie, bo znalazłem lepszą pracę.', 'Я подав заяву про звільнення, бо знайшов кращу роботу.', 'Я подал заявление об уходе, потому что нашёл работу получше.', 'I handed in my notice because I found a better job.']),
  w('podatek', 'noun', 'B1', 'податок', 'налог', 'tax', ['work', 'bank'],
    ['Od pensji brutto płacimy podatek.', 'З зарплати брутто ми сплачуємо податок.', 'С зарплаты брутто мы платим налог.', 'We pay tax on our gross salary.'], { gen: 'podatku' }),

  // ── Порт ──
  w('port', 'noun', 'A1', 'порт', 'порт', 'port, harbour', ['work', 'travel'],
    ['Mój brat pracuje w porcie.', 'Мій брат працює в порту.', 'Мой брат работает в порту.', 'My brother works at the port.'], { loc: 'porcie' }),
  w('statek', 'noun', 'A1', 'корабель, судно', 'корабль, судно', 'ship', ['work', 'travel'],
    ['Na statku pracuje dwudziestu marynarzy.', 'На кораблі працює двадцять моряків.', 'На корабле работает двадцать моряков.', 'Twenty sailors work on the ship.'], { loc: 'statku' }),
  w('stocznia', 'noun', 'B1', 'верф', 'верфь', 'shipyard', ['work'],
    ['W stoczni budują statki.', 'На верфі будують кораблі.', 'На верфи строят корабли.', 'Ships are built at the shipyard.'], { loc: 'stoczni' }),
  w('marynarz', 'noun', 'A2', 'моряк', 'моряк', 'sailor', ['work', 'people'],
    ['Marynarz wraca z rejsu po trzech miesiącach.', 'Моряк повертається з рейсу через три місяці.', 'Моряк возвращается из рейса через три месяца.', 'The sailor comes back from the voyage after three months.'], { pl: 'marynarze' }),
  w('dźwig', 'noun', 'B1', 'кран (підйомний)', 'кран (подъёмный)', 'crane', ['work'],
    ['Operator dźwigu podnosi kontener.', 'Кранівник піднімає контейнер.', 'Крановщик поднимает контейнер.', 'The crane operator lifts the container.'], { gen: 'dźwigu' }),
  w('kontener', 'noun', 'A2', 'контейнер (вантажний)', 'контейнер (грузовой)', 'shipping container', ['work'],
    ['Statek przywiózł sto kontenerów.', 'Корабель привіз сто контейнерів.', 'Корабль привёз сто контейнеров.', 'The ship brought a hundred containers.'], { gen_pl: 'kontenerów' }),
  w('rejs', 'noun', 'A2', 'рейс, плавання', 'рейс, плавание', 'voyage, cruise', ['work', 'travel'],
    ['Rejs po Odrze trwa godzinę.', 'Прогулянка по Одрі триває годину.', 'Прогулка по Одре длится час.', 'The boat trip on the Oder takes an hour.']),

  // ── Колеги ──
  w('szef', 'noun', 'A1', 'шеф, начальник', 'начальник, шеф', 'boss', ['work', 'people'],
    ['Szef dzisiaj jest w dobrym humorze.', 'Начальник сьогодні в доброму гуморі.', 'Начальник сегодня в хорошем настроении.', 'The boss is in a good mood today.'], { gen: 'szefa' }),
  w('szefowa', 'noun', 'A2', 'начальниця', 'начальница', 'boss (woman)', ['work', 'people'],
    ['Szefowa zgodziła się na urlop.', 'Начальниця погодилася на відпустку.', 'Начальница согласилась на отпуск.', 'The boss agreed to my leave.']),
  w('kolega z pracy', 'noun', 'A1', 'колега по роботі', 'коллега по работе', 'co-worker', ['work', 'people'],
    ['Kolega z pracy podwiózł mnie do domu.', 'Колега по роботі підвіз мене додому.', 'Коллега по работе подвёз меня домой.', 'A co-worker gave me a lift home.']),
  w('zastąpić', 'verb', 'B1', 'підмінити, замінити', 'подменить, заменить', 'to cover for, to replace', ['work'],
    ['Mógłbyś mnie jutro zastąpić?', 'Чи міг би ти мене завтра підмінити?', 'Мог бы ты меня завтра подменить?', 'Could you cover for me tomorrow?'], { ty: 'zastąpisz' }),
  // ── Спізнення ──
  w('spóźnienie', 'noun', 'A2', 'спізнення', 'опоздание', 'lateness, delay', ['work', 'time'],
    ['Przepraszam za spóźnienie!', 'Вибачте за спізнення!', 'Извините за опоздание!', 'Sorry I’m late!']),
  w('bo', 'conj', 'A1', 'бо', 'потому что', 'because', ['phrases', 'grammar'],
    ['Nie przyjdę, bo jestem chory.', 'Я не прийду, бо хворію.', 'Я не приду, потому что болею.', 'I won’t come because I’m ill.']),
  w('ponieważ', 'conj', 'A2', 'оскільки, тому що', 'поскольку, так как', 'because, since', ['phrases', 'grammar'],
    ['Spóźnię się, ponieważ tramwaj stoi.', 'Я спізнюся, тому що трамвай стоїть.', 'Я опоздаю, так как трамвай стоит.', 'I’ll be late because the tram is stuck.']),

  // ── Підвищення ──
  w('podwyżka', 'noun', 'A2', 'підвищення зарплати', 'повышение зарплаты', 'pay rise', ['work'],
    ['Od stycznia dostanę podwyżkę.', 'Із січня я отримаю підвищення зарплати.', 'С января мне повысят зарплату.', 'I’ll get a pay rise from January.'], { loc: 'podwyżce' }),
  w('awans', 'noun', 'B1', 'підвищення на посаді', 'повышение в должности', 'promotion', ['work'],
    ['Dostała awans na kierowniczkę zmiany.', 'Її підвищили до керівниці зміни.', 'Её повысили до начальницы смены.', 'She was promoted to shift manager.'], { loc: 'awansie' }),
];

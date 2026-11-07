/**
 * Сборка предложения из слов: допустимые порядки слов и формулировки (владелец 2026-11-07: «Poproszę wodę i hot doga» должно засчитываться
 * так же, как «Poproszę hot doga i wodę»; обратная связь не должна объяснять падеж, если падеж верный).
 *
 * У польского свободный порядок слов, поэтому проверка «строка равна эталону» отклоняла верные ответы. У каждого ответа можно записать допустимые
 * варианты короткой записью (таблица ORDER_SPECS ниже, одна запись на ответ; работает и для уроков, и для миссий, база данных не меняется):
 *
 *   [часть]  {часть}  <часть>   три независимых набора частей: части одного набора меняются местами, каждая остаётся цельной
 *                               «Poproszę [hot doga] i [wodę]» → и «Poproszę wodę i hot doga»: слово «i» стоит между частями и остаётся на месте
 *   (слово)                     слово можно не ставить: «(Czy) grasz na gitarze»
 *   остальное                   стоит там, где записано
 *
 * Проверяется не только строка: все слова ответа обязательны (ни одно не пропущено, лишних нет), состав слов вариантов берётся из ответа, поэтому
 * смысл и формы слов не меняются — переставляются только части. Меняется ли смысл при перестановке («Wczoraj było zimniej niż dzisiaj»), решает
 * автор записи: такие предложения без записи, и тест просматривает таблицу.
 */
import { normalize } from './text';

const PUNCT = /[.,!?;:„”"]/g;

/** Слова фразы без знаков препинания, как плашки: «Poproszę hot doga i wodę.» → Poproszę, hot, doga, i, wodę. */
export const orderTokens = (s: string): string[] => s.replace(PUNCT, ' ').split(/\s+/).filter(Boolean);

type Part = { t: 'text'; v: string } | { t: 'slot'; set: string; v: string } | { t: 'opt'; v: string };
const CLOSE: Record<string, string> = { '[': ']', '{': '}', '<': '>', '(': ')' };

function parse(spec: string): Part[] {
  const parts: Part[] = [];
  let i = 0;
  let text = '';
  const flush = () => {
    if (text) parts.push({ t: 'text', v: text });
    text = '';
  };
  while (i < spec.length) {
    const ch = spec[i];
    const close = CLOSE[ch];
    if (!close) {
      text += ch;
      i++;
      continue;
    }
    const end = spec.indexOf(close, i + 1);
    if (end < 0) throw new Error(`orderVariants: нет «${close}» в записи «${spec}»`);
    flush();
    const v = spec.slice(i + 1, end);
    parts.push(ch === '(' ? { t: 'opt', v } : { t: 'slot', set: ch, v });
    i = end + 1;
  }
  flush();
  return parts;
}

function permutations<T>(xs: T[]): T[][] {
  if (xs.length <= 1) return [xs.slice()];
  return xs.flatMap((x, i) => permutations([...xs.slice(0, i), ...xs.slice(i + 1)]).map((rest) => [x, ...rest]));
}

/** Не больше стольких вариантов у одной записи: больше — это уже не «пара перестановок», а ошибка записи. */
export const MAX_ORDER_VARIANTS = 48;

/**
 * Все фразы, которые описывает запись, без знаков препинания, первой — в порядке записи (со всеми необязательными словами).
 * Повторы (одинаковые части) отбрасываются.
 */
export function expandOrderSpec(spec: string): string[] {
  const parts = parse(spec);
  const sets = new Map<string, number[]>();
  parts.forEach((p, i) => {
    if (p.t === 'slot') sets.set(p.set, [...(sets.get(p.set) ?? []), i]);
  });
  let assignments: Map<number, string>[] = [new Map()];
  for (const slots of sets.values()) {
    const perms = permutations(slots.map((i) => (parts[i] as { v: string }).v));
    assignments = assignments.flatMap((a) =>
      perms.map((perm) => {
        const next = new Map(a);
        slots.forEach((slot, k) => next.set(slot, perm[k]));
        return next;
      }),
    );
    if (assignments.length > MAX_ORDER_VARIANTS) throw new Error(`orderVariants: слишком много порядков в записи «${spec}»`);
  }
  const optionals = parts.flatMap((p, i) => (p.t === 'opt' ? [i] : []));
  if (assignments.length * 2 ** optionals.length > MAX_ORDER_VARIANTS) throw new Error(`orderVariants: слишком много вариантов в записи «${spec}»`);
  const out: string[] = [];
  const seen = new Set<string>();
  for (const a of assignments) {
    // с необязательными словами — первыми: сначала полная фраза
    for (let mask = (1 << optionals.length) - 1; mask >= 0; mask--) {
      const phrase = orderTokens(
        parts.map((p, i) => (p.t === 'text' ? p.v : p.t === 'slot' ? a.get(i)! : (mask >> optionals.indexOf(i)) & 1 ? p.v : '')).join(' '),
      ).join(' ');
      const key = normalize(phrase);
      if (!key || seen.has(key)) continue;
      seen.add(key);
      out.push(phrase);
    }
  }
  return out;
}

/**
 * Допустимые порядки и формулировки (ключ — ответ без знаков препинания и регистра, `normalize`). Только то, что не меняет смысл и грамматику:
 * сочинённые части («X i Y» — любая первой), обстоятельства времени и места в начале, середине или конце, «się» / «mi» / «tu» рядом с глаголом,
 * дополнение перед глаголом. Предложения, где перестановка меняет смысл (порядок действий, «вчера холоднее, чем сегодня»), сюда не попадают.
 */
const specList = (): [answer: string, specs: string[]][] => [
  // ───────── Миссии ─────────
  ['Poproszę hot doga i wodę', ['Poproszę [hot doga] i [wodę]', '[Hot doga] i [wodę] poproszę']],
  ['Czy mogę tu kupić bilet na tramwaj', ['Czy [mogę] [tu] kupić bilet na tramwaj', 'Czy mogę kupić tu bilet na tramwaj']],
  ['I jeszcze żurek, poproszę', ['I jeszcze [żurek] [poproszę]']],
  ['Poproszę herbatę z cytryną', ['[Poproszę] [herbatę z cytryną]']],
  ['Wezmę jeszcze chleb i masło', ['{Wezmę} {jeszcze} [chleb] i [masło]']],
  ['Poproszę dużą kawę z mlekiem', ['[Poproszę] [dużą kawę z mlekiem]']],
  ['Poproszę jeden żeton', ['[Poproszę] [jeden żeton]']],
  ['Dziękuję za pomoc', ['[Dziękuję] [za pomoc]']],
  ['Przepraszam, wysiadam', ['[Przepraszam], [wysiadam]']],
  ['Gdzie mam wysiąść do katedry', ['Gdzie mam {wysiąść} {do katedry}']],
  ['Poproszę bilet do Wrocławia', ['[Poproszę] [bilet do Wrocławia]']],
  ['Spóźnię się o pół godziny', ['[Spóźnię] się [o pół godziny]']],
  ['Poproszę bigos i kompot', ['Poproszę [bigos] i [kompot]']],
  ['Na pewno spróbuję', ['[Na pewno] [spróbuję]']],
  ['Poproszę jeden bilet na warsztaty', ['[Poproszę] [jeden bilet na warsztaty]']],
  ['Grasz na gitarze', ['(Czy) [grasz na gitarze]', '(Czy) [grasz] [na gitarze]']],
  ['Biorę dziesięć jajek', ['[Biorę] [dziesięć jajek]']],
  ['Włożyć butelkę etykietą do góry', ['[Włożyć] [butelkę] [etykietą do góry]']],
  ['Czy mogę zapłacić kartą', ['Czy mogę {zapłacić} {kartą}']],
  ['Czy potrzebna jest recepta', ['Czy [potrzebna] jest [recepta]']],
  ['Dziękuję bardzo, do widzenia', ['{Dziękuję} {bardzo} do widzenia', '[Dziękuję bardzo], [do widzenia]']],
  ['Czy mogę się tu zameldować', ['Czy mogę [się] [tu] zameldować']],
  ['Kiedy mogę się wprowadzić', ['Kiedy mogę {się} {wprowadzić}']],
  ['Gdzie mogę zostawić kurtkę', ['Gdzie mogę {zostawić} {kurtkę}']],
  ['Poproszę miejsce przy oknie', ['[Poproszę] [miejsce przy oknie]']],
  ['Gdzie mogę kupić karnet', ['Gdzie mogę {kupić} {karnet}']],
  ['Potrzebuję instruktora', ['[Potrzebuję] [instruktora]']],
  ['Czy mogę tu naładować telefon', ['Czy mogę [tu] [naładować] telefon', 'Czy mogę tu {naładować} {telefon}']],
  ['Ile kosztuje jeden rogal', ['Ile [kosztuje] [jeden rogal]']],
  ['Jedenastego listopada jest dzień wolny', ['[Jedenastego listopada] jest [dzień wolny]', 'Jest [dzień wolny] [jedenastego listopada]']],
  ['Chciałbym zapisać się na bieg', ['Chciałbym {zapisać} {się} na bieg']],
  ['Leję wosk przez klucz do wody', ['[Leję] [wosk] przez klucz do wody']],
  ['Zatańczysz ze mną', ['(Czy) [zatańczysz] [ze mną]']],
  ['Poproszę też herbatę z sokiem malinowym', ['{Poproszę} {też} herbatę z sokiem malinowym']],
  ['Ile kosztuje ta czerwona bombka', ['Ile [kosztuje] [ta czerwona bombka]']],
  ['Poproszę paragon', ['[Poproszę] [paragon]']],
  ['Gdzie można zobaczyć więcej szopek', ['Gdzie można {zobaczyć} {więcej szopek}']],
  ['Ja stawiam', ['[Ja] [stawiam]']],
  ['Czy możesz mi dać przepis na barszcz', ['Czy możesz [mi] [dać] przepis na barszcz']],
  ['Pokaż mi słowa w telefonie', ['Pokaż mi {słowa} {w telefonie}']],
  ['Dziękuję za gościnę', ['[Dziękuję] [za gościnę]']],
  ['O północy będą fajerwerki', ['[O północy] będą [fajerwerki]']],
  ['Kupuję chipsy i paluszki', ['Kupuję [chipsy] i [paluszki]']],
  ['Albo zamówię taksówkę w aplikacji', ['Albo {zamówię taksówkę} {w aplikacji}', 'Albo zamówię [taksówkę] [w aplikacji]']],
  ['W tym roku nauczę się polskiego', ['{W tym roku} {nauczę się polskiego}']],
  ['Połowa z różą, połowa z budyniem', ['[Połowa z różą], [połowa z budyniem]']],
  ['Też pół kilo faworków', ['[Też] [pół kilo faworków]']],
  ['Wezmę czapkę i szal', ['Wezmę [czapkę] i [szal]']],
  ['Chodźmy potem na gorącą czekoladę', ['{Chodźmy} {potem} na gorącą czekoladę']],
  ['Najlepsze życzenia z okazji Dnia Babci', ['[Najlepsze życzenia] [z okazji Dnia Babci]']],
  ['Dużo zdrowia i radości', ['Dużo [zdrowia] i [radości]']],
  ['Tak, z serduszkiem, poproszę', ['Tak [z serduszkiem] [poproszę]']],
  ['Jesteś dla mnie bardzo ważna', ['Jesteś [dla mnie] [bardzo ważna]', '[Dla mnie] jesteś bardzo ważna']],
  ['Poproszę rachunek', ['[Poproszę] [rachunek]']],
  ['Gdzie można kupić kłódkę', ['Gdzie można {kupić} {kłódkę}']],
  ['Czym można naturalnie farbować jajka', ['Czym można [naturalnie] [farbować jajka]']],
  ['Narysuję kwiatek i słońce', ['Narysuję [kwiatek] i [słońce]']],
  ['Przepraszam, czy mogę tu postawić koszyczek', ['Przepraszam, czy mogę [tu] [postawić] koszyczek', 'Przepraszam, czy mogę tu {postawić} {koszyczek}']],
  ['Zdrowia, szczęścia i wiosennego nastroju', ['[Zdrowia], [szczęścia] i [wiosennego nastroju]']],
  ['Dobrze, teraz ja zażartuję z szefa', ['Dobrze, [teraz] [ja] zażartuję z szefa']],
  ['Wezmę parasol na wszelki wypadek', ['{Wezmę parasol} {na wszelki wypadek}']],
  ['Czy potrzebny jest kask', ['Czy [potrzebny] jest [kask]']],
  ['Oddam rower na stacji przy dworcu', ['[Oddam] [rower] na stacji przy dworcu', '{Oddam rower} {na stacji przy dworcu}']],
  ['Ja poniosę konewkę', ['Ja {poniosę} {konewkę}', '{Ja} {konewkę} poniosę']],
  ['To posadzimy pomidory w maju', ['To {posadzimy pomidory} {w maju}', 'To posadzimy [pomidory] [w maju]']],
  ['Czy w domku jest grill', ['Czy [w domku] jest [grill]', 'Czy jest [grill] [w domku]']],
  ['Proszę wysłać adres SMS-em', ['Proszę wysłać [adres] [SMS-em]']],
  ['Dla Ani kupię wegetariańskie kiełbaski', ['{Dla Ani} {kupię wegetariańskie kiełbaski}', 'Kupię [dla Ani] [wegetariańskie kiełbaski]']],
  ['Czy dzisiaj można wejść do Zamku za darmo', ['Czy [dzisiaj] [można] wejść do Zamku za darmo', 'Czy dzisiaj można wejść {do Zamku} {za darmo}']],
  ['Proszę zrobić mi zdjęcie przy Kolumnie Zygmunta', ['Proszę [zrobić] [mi] zdjęcie przy Kolumnie Zygmunta']],
  ['Podaj mi, proszę, nitkę', ['Podaj mi {proszę} {nitkę}', 'Podaj {mi} {proszę} nitkę', '{Proszę} {podaj mi nitkę}']],
  ['Gra polski zespół rockowy', ['[Gra] [polski zespół rockowy]']],
  ['Zrobię mizerię z ogórków', ['[Zrobię] [mizerię z ogórków]']],
  ['Spóźnię się o czterdzieści minut', ['[Spóźnię] się [o czterdzieści minut]']],
  ['Do której jest otwarty park', ['Do której [jest otwarty] [park]']],
  ['Byłem przy wejściu godzinę temu', ['{Byłem przy wejściu} {godzinę temu}', 'Byłem [przy wejściu] [godzinę temu]']],
  ['Spotkajmy się przy wejściu o szóstej', ['Spotkajmy się [przy wejściu] [o szóstej]', '[O szóstej] spotkajmy się [przy wejściu]']],

  // ───────── Уроки ─────────
  ['Dobrze, dziękuję', ['[Dobrze], [dziękuję]']],
  ['Mam piętnaście lat', ['[Mam] [piętnaście lat]']],
  ['Czy ten bilet jest ważny w metrze', ['Czy ten bilet [jest ważny] [w metrze]']],
  ['Jestem z Ukrainy i mieszkam w Warszawie', ['[Jestem z Ukrainy] i [mieszkam w Warszawie]']],
  ['Gdzie pan pracuje', ['Gdzie [pan] [pracuje]']],
  ['Trzeba nosić kamizelkę', ['Trzeba {nosić} {kamizelkę}', '{Trzeba nosić} {kamizelkę}']],
  ['Spóźnię się o dziesięć minut', ['[Spóźnię] się [o dziesięć minut]']],
  ['Rano ubieram się bardzo szybko', ['{Rano} {ubieram się bardzo szybko}']],
  ['O której budzisz się w sobotę', ['O której {budzisz} {się} w sobotę', 'O której w sobotę {się} {budzisz}']],
  ['Mam brata i siostrę', ['Mam [brata] i [siostrę]']],
  ['W piątek pracuję, a w sobotę odpoczywam', ['[W piątek pracuję], a [w sobotę odpoczywam]']],
  ['Tu jest Kościół Mariacki', ['[Tu] jest [Kościół Mariacki]']],
  ['Pomnik jest przed kościołem', ['[Pomnik] jest [przed kościołem]']],
  ['Jadę samochodem do pracy', ['Jadę [samochodem] [do pracy]', '[Do pracy] jadę [samochodem]']],
  ['Wyjadę z domu o szóstej', ['{Wyjadę z domu} {o szóstej}', 'Wyjadę [z domu] [o szóstej]']],
  ['Proszę się tu zatrzymać', ['Proszę [się] [tu] zatrzymać']],
  ['Hydraulik naprawi kran jutro', ['{Jutro} {hydraulik naprawi kran}', 'Hydraulik [naprawi kran] [jutro]']],
  ['Chcę cię zaprosić na urodziny', ['Chcę [cię] [zaprosić] na urodziny']],
  ['Poproszę kawę z mlekiem', ['[Poproszę] [kawę z mlekiem]']],
  ['Chleb jest tani, a ser jest drogi', ['[Chleb jest tani], a [ser jest drogi]']],
  ['Mam czarne spodnie', ['[Mam] [czarne spodnie]']],
  ['Czy może pani to zapakować', ['Czy [może] [pani] to zapakować']],
  ['W piątek jadę do Poznania', ['{W piątek} {jadę do Poznania}', 'Jadę [w piątek] [do Poznania]']],
  ['Turyści czekają na koziołki', ['[Turyści] czekają [na koziołki]']],
  ['Czym się interesujesz', ['Czym {się} {interesujesz}']],
  ['Zostawię panu nasz katalog', ['Zostawię [panu] [nasz katalog]']],
  ['Możemy się spotkać po pracy', ['Możemy {się} {spotkać} po pracy', '{Możemy się spotkać} {po pracy}']],
  ['Na obiad są pyry z gzikiem', ['[Na obiad] są [pyry z gzikiem]']],
  ['Jutro muszę być w Poznaniu', ['{Jutro} {muszę być w Poznaniu}', 'Muszę [jutro] [być] w Poznaniu']],
  ['Życzę wam zdrowia i szczęścia', ['Życzę wam [zdrowia] i [szczęścia]']],
  ['Co kupimy Kasi na imieniny', ['Co [kupimy] [Kasi] na imieniny']],
  ['Dzieliliśmy się opłatkiem i składaliśmy życzenia', ['[Dzieliliśmy się opłatkiem] i [składaliśmy życzenia]']],
  ['W sobotę niesiemy koszyczek do kościoła', ['{W sobotę} {niesiemy koszyczek do kościoła}', 'Niesiemy [w sobotę] [koszyczek] do kościoła']],
  ['Pierwszego listopada idziemy na cmentarz', ['{Pierwszego listopada} {idziemy na cmentarz}', 'Idziemy [pierwszego listopada] [na cmentarz]']],
  ['Wesołych Świąt życzy cała rodzina', ['[Wesołych Świąt] życzy [cała rodzina]']],
  ['W Sylwestra będziemy tańczyć do rana', ['{W Sylwestra} {będziemy tańczyć do rana}', 'Będziemy [w Sylwestra] [tańczyć do rana]']],
  ['Dzisiaj pada deszcz i wieje wiatr', ['Dzisiaj [pada deszcz] i [wieje wiatr]', '{Dzisiaj} {pada deszcz i wieje wiatr}']],
  ['Po południu będzie burza', ['[Po południu] będzie [burza]', 'Będzie [burza] [po południu]']],
  ['Załóż czapkę i ciepłe rękawiczki', ['Załóż [czapkę] i [ciepłe rękawiczki]']],
  ['Szkło wyrzucamy do zielonego pojemnika', ['[Szkło] wyrzucamy [do zielonego pojemnika]', 'Wyrzucamy [szkło] [do zielonego pojemnika]']],
  ['Zimą często pada śnieg', ['[Zimą] [często] pada śnieg']],
  ['Czy mogę zapytać o wynagrodzenie', ['Czy mogę {zapytać} {o wynagrodzenie}']],
  ['Mógłbyś mnie jutro zastąpić', ['Mógłbyś [mnie] [jutro] zastąpić', 'Mógłbyś zastąpić [mnie] [jutro]']],
  ['Przepraszam za spóźnienie i kłopot', ['Przepraszam za [spóźnienie] i [kłopot]']],
  ['Chciałbym zapytać o awans', ['Chciałbym {zapytać} {o awans}']],
  ['Wolałbym pracować na zmianie dziennej', ['Wolałbym {pracować} {na zmianie dziennej}']],
  ['Warto zobaczyć fontannę Neptuna', ['Warto {zobaczyć} {fontannę Neptuna}']],
  ['Przy czerwonej fladze nie wolno się kąpać', ['[Przy czerwonej fladze] [nie wolno się kąpać]']],
  ['W tysiąc dziewięćset osiemdziesiątym roku był strajk', ['{W tysiąc dziewięćset osiemdziesiątym roku} {był strajk}']],
  ['Do Sopotu jedzie się kolejką', ['[Do Sopotu] jedzie się [kolejką]']],
  ['Zgubiłem czarny plecak w tramwaju', ['{Zgubiłem czarny plecak} {w tramwaju}', 'Zgubiłem [czarny plecak] [w tramwaju]']],
  ['Gram na gitarze od trzech lat', ['{Gram na gitarze} {od trzech lat}', 'Gram [na gitarze] [od trzech lat]']],
  ['Czasem biegam z kolegą nad morzem', ['{Czasem} {biegam} z kolegą nad morzem', 'Czasem biegam [z kolegą] [nad morzem]']],
  ['W niedzielę idziemy na mecz Arki', ['{W niedzielę} {idziemy na mecz Arki}', 'Idziemy [w niedzielę] [na mecz Arki]']],
  ['Dwa lata temu przeprowadziłem się do Bydgoszczy', ['Przeprowadziłem się [dwa lata temu] [do Bydgoszczy]']],
  ['Według prognozy w sobotę będzie padać', ['[Według prognozy] [w sobotę] będzie padać']],
  ['Ludwik Zamenhof urodził się w Białymstoku w 1859 roku', ['Ludwik Zamenhof urodził się [w Białymstoku] [w 1859 roku]']],
  ['Czuję się słabo od trzech dni', ['{Czuję się słabo} {od trzech dni}']],
  ['W niedzielę jestem u babci', ['Jestem [w niedzielę] [u babci]']],
];

/**
 * Записи по ключу `normalize(ответ)`. Таблица строится при первом обращении, а не при загрузке модуля: клиент (мини-приложение) её не использует,
 * и при загрузке модуля она не должна попадать в его бандл (бюджет JS, scripts/perf.ts).
 */
let table: Map<string, readonly string[]> | null = null;
export function orderSpecs(): ReadonlyMap<string, readonly string[]> {
  return (table ??= new Map(specList().map(([answer, specs]) => [normalize(answer), specs])));
}
/** Ключи в порядке таблицы, с повторами, если они есть (повтор — ошибка, её ловит тест). */
export const orderSpecAnswers = (): string[] => specList().map(([answer]) => normalize(answer));

const cache = new Map<string, string[]>();

/**
 * Допустимые порядки и формулировки для ответа (строка или слова плашек), кроме самого ответа. Пусто, если для ответа записи нет.
 * Значения — фразы без знаков препинания; сравнивать их нужно через `normalize`.
 */
export function orderVariants(answer: string | readonly string[]): string[] {
  const key = normalize(typeof answer === 'string' ? answer : answer.join(' '));
  const hit = cache.get(key);
  if (hit) return hit;
  const specs = orderSpecs().get(key);
  const own = new Set([key]);
  const out: string[] = [];
  for (const spec of specs ?? []) {
    for (const phrase of expandOrderSpec(spec)) {
      const k = normalize(phrase);
      if (own.has(k)) continue;
      own.add(k);
      out.push(phrase);
    }
  }
  cache.set(key, out);
  return out;
}

export type OrderDiagnosis =
  /** Выбрана форма-«пастка» (слово, которого нет ни в одном верном варианте): объяснение формы к месту. */
  | 'trap'
  /** Слова верные и все на месте, но порядок не подходит. */
  | 'order'
  /** Слова верные, но не все. */
  | 'missing'
  /** Прочее: слова из разных вариантов вперемешку. */
  | 'mixed';

const multiset = (words: string[]) => {
  const m = new Map<string, number>();
  for (const w of words) m.set(w, (m.get(w) ?? 0) + 1);
  return m;
};
const sameMultiset = (a: Map<string, number>, b: Map<string, number>) => a.size === b.size && [...a].every(([k, n]) => b.get(k) === n);
const subMultiset = (a: Map<string, number>, b: Map<string, number>) => [...a].every(([k, n]) => (b.get(k) ?? 0) >= n);

/**
 * Что не так с неверным ответом: пастка, порядок, нехватка слов или смесь. По слову, а не по строке: «woda» вместо «wodę» — пастка и повод для
 * объяснения падежа; «wodę i hot doga» с верными формами — только порядок, падеж тут ни при чём.
 * `accepted` — все верные фразы (ответ, `accept`/`alternatives`, варианты записи), `given` — слова ответа игрока.
 */
export function diagnoseOrder(accepted: readonly (readonly string[])[], given: readonly string[]): OrderDiagnosis {
  const right = accepted.map((a) => multiset(a.flatMap((x) => orderTokens(x)).map((w) => normalize(w))));
  const used = new Set(right.flatMap((m) => [...m.keys()]));
  const mine = given.flatMap((x) => orderTokens(x)).map((w) => normalize(w));
  if (mine.some((w) => !used.has(w))) return 'trap';
  const have = multiset(mine);
  if (right.some((r) => sameMultiset(r, have))) return 'order';
  if (right.some((r) => subMultiset(have, r))) return 'missing';
  return 'mixed';
}

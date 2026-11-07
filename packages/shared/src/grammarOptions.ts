/**
 * Задание «Поставь слово в правильную форму» (тип GRAMMAR) показывается выбором из четырёх форм, а не вводом с телефонной клавиатуры:
 * клавиатура закрывала польские буквы (владелец 2026-11-07). Правильная форма — первая из `accepted`, три неверные — из таблицы ниже.
 *
 * Ключ — `основа|правильная форма` ровно как в задании (регистр важен: «Załóż», «Gdynia»). Одна запись обслуживает все задания с той же парой.
 * Неверные формы подобраны так, чтобы быть неверными именно в этом предложении: чужое лицо или число, другой падеж или род, не то время, начальная
 * форма. Там, где в предложении нет подлежащего («Nie ___ po polsku»), выбор однозначно решает перевод, который показан под предложением.
 * Новое задание этого типа без записи здесь показывается как раньше — вводом; тест `grammar-options.test.ts` не даст забыть запись.
 */
import { normalize } from './text';
import type { TextData } from './types';

export const GRAMMAR_DISTRACTORS: Readonly<Record<string, readonly [string, string, string]>> = {
  'córka|córkę': ['córka', 'córką', 'córce'],
  'herbata|herbatę': ['herbata', 'herbatą', 'herbacie'],
  'siostra|siostrę': ['siostra', 'siostrą', 'siostrze'],
  'zamknięty|zamknięte': ['zamknięty', 'zamknięta', 'zamkniętych'],
  'odwołany|odwołana': ['odwołany', 'odwołane', 'odwołaną'],
  'peron|peronu': ['peron', 'peronie', 'peronem'],
  'pięć|pięciu': ['pięcioma', 'pięciom', 'piąty'],
  'pisać|pisałem': ['piszę', 'pisz', 'pisano'],
  'opalać|opalaj': ['opalam', 'opala', 'opalali'],
  'urodzić się|urodziła się': ['urodził się', 'urodziłam się', 'urodzę się'],
  'piątek|piątku': ['piątek', 'piątkiem', 'piątki'],
  'budzić|budzę': ['budzisz', 'budzimy', 'budzić'],
  'ciepło|cieplej': ['ciepło', 'cieplejszy', 'najcieplej'],
  'który|które': ['który', 'która', 'którą'],
  'mieszkać|mieszkali': ['mieszkają', 'mieszkaliśmy', 'mieszkać'],
  'musieć|musimy': ['muszę', 'musisz', 'muszą'],
  'muzyka|muzyką': ['muzyka', 'muzykę', 'muzyce'],
  'sport|sportem': ['sport', 'sportu', 'sporcie'],
  'spędzić|spędziliśmy': ['spędzimy', 'spędzić', 'spędzony'],
  'stary|najstarszych': ['najstarszy', 'najstarszym', 'najstarszej'],
  'tysiąc|tysięcy': ['tysiąc', 'tysiące', 'tysiącem'],
  'zostać|zostanie': ['zostanę', 'zostali', 'zostać'],
  'ładny|najładniejsza': ['najładniejszy', 'najładniejszą', 'najładniejsze'],
  'być|jestem': ['jesteś', 'jest', 'są'],
  'być|jesteście': ['jesteś', 'jesteśmy', 'są'],
  'być|jesteśmy': ['jestem', 'jesteście', 'są'],
  'być|są': ['jest', 'jesteśmy', 'jesteście'],
  'zostać|zostanę': ['zostałem', 'zostać', 'zostając'],
  'chcieć|chce': ['chcę', 'chcesz', 'chcą'],
  'chcieć|chcemy': ['chcę', 'chcecie', 'chcą'],
  'chcieć|chcesz': ['chcę', 'chce', 'chcecie'],
  'chcieć|chcę': ['chcesz', 'chce', 'chcemy'],
  'bawić się|bawiłam się': ['bawiłem się', 'bawić się', 'bawię się'],
  'ciepły|cieplejszy': ['ciepły', 'najcieplejszy', 'cieplej'],
  'pójść|pójdziemy': ['pójdę', 'poszliśmy', 'pójść'],
  'móc|mógłby': ['mogłaby', 'mógłbym', 'mogliby'],
  'miesiąc|miesiące': ['miesiąc', 'miesięcy', 'miesiąca'],
  'rok|lata': ['rok', 'lat', 'roku'],
  'pierwszy|pierwszego': ['pierwszy', 'pierwsza', 'pierwszym'],
  'sobota|sobotę': ['sobota', 'soboty', 'sobocie'],
  'czuć|czuję': ['czujesz', 'czujemy', 'czuć'],
  'być|byłaś': ['byłam', 'byłyście', 'bycie'],
  'być|będzie': ['było', 'będą', 'być'],
  'zagrać|Zagrajmy': ['Zagraj', 'Zagrajcie', 'Zagrać'],
  'być|będziemy': ['będę', 'będziecie', 'będą'],
  'być|będą': ['będzie', 'będziemy', 'będziecie'],
  'historia|historią': ['historia', 'historię', 'historii'],
  'założyć|założono': ['założył', 'założyli', 'założyć'],
  'trener|trenerem': ['trener', 'trenera', 'trenerowi'],
  'wydać|wydał': ['wydałem', 'wydali', 'wydać'],
  'pianino|pianinie': ['pianino', 'pianina', 'pianinem'],
  'założyć|Załóż': ['Założył', 'Założyć', 'Zakładasz'],
  'Gdynia|Gdyni': ['Gdynia', 'Gdynię', 'Gdynią'],
  'skręcić|skręciłem': ['skręcę', 'skręcić', 'skręcimy'],
  'informatyka|informatyką': ['informatyka', 'informatykę', 'informatyce'],
  'móc|może': ['mogę', 'możesz', 'mogą'],
  'impreza|imprezę': ['impreza', 'imprezą', 'imprezie'],
  'mechanik|mechaników': ['mechanik', 'mechanikom', 'mechanikami'],
  'kąpiel|kąpieli': ['kąpiel', 'kąpielą', 'kąpielę'],
  'opowiadać|opowiadała': ['opowiadał', 'opowiadam', 'opowiadać'],
  'brązowa|brązową': ['brązowa', 'brązowej', 'brązowy'],
  'Polska|Polsce': ['Polska', 'Polskę', 'Polską'],
  'mieć|ma': ['mam', 'masz', 'mają'],
  'mieć|mają': ['mam', 'ma', 'mamy'],
  'mieć|mam': ['masz', 'ma', 'mamy'],
  'mieć|masz': ['mam', 'ma', 'macie'],
  'musieć|muszą': ['muszę', 'musi', 'musimy'],
  'móc|możesz': ['mogę', 'może', 'możecie'],
  'grudzień|grudniu': ['grudzień', 'grudnia', 'grudniem'],
  'luty|lutym': ['luty', 'lutego', 'lutemu'],
  'iść|idą': ['idę', 'idzie', 'idziemy'],
  'jeździć|jeździsz': ['jeżdżę', 'jeździ', 'jeździć'],
  'pojechać|pojechała': ['pojechał', 'pojechało', 'pojechać'],
  'park|parku': ['park', 'parkiem', 'parkowi'],
  'być|były': ['była', 'byli', 'będą'],
  'jeść|jedliśmy': ['jedliście', 'jadł', 'jeść'],
  'napisać|napiszę': ['napisałem', 'napisać', 'pisać'],
  'penicylina|penicylinę': ['penicylina', 'penicylinie', 'penicyliną'],
  'pan|pana': ['pan', 'panu', 'panem'],
  'podróż|podróży': ['podróż', 'podróżą', 'podróże'],
  'pisanka|pisanki': ['pisanka', 'pisanek', 'pisankami'],
  'port|porcie': ['port', 'portu', 'portem'],
  'zadzwonić|zadzwonię': ['zadzwoniłam', 'zadzwonić', 'dzwoniąc'],
  'awans|awansie': ['awans', 'awansu', 'awansem'],
  'spóźnić|spóźnię': ['spóźnisz', 'spóźnić', 'spóźniony'],
  'wyrzucać|wyrzucaj': ['wyrzucam', 'wyrzuca', 'wyrzucili'],
  'golić|goli': ['golę', 'golisz', 'golić'],
  'kłaść się|kładę się': ['kładziesz się', 'kładzie się', 'kłaść się'],
  'który|którym': ['który', 'którego', 'którymi'],
  'rozładować się|rozładował się': ['rozładowała się', 'rozładowało się', 'rozładować się'],
  'dosłyszeć|dosłyszałem': ['dosłyszę', 'dosłyszeć', 'słyszeć'],
  'przewodnik|przewodnika': ['przewodnik', 'przewodnikowi', 'przewodnikiem'],
  'powiedzieć|powiedział': ['powiedziała', 'powiedzieli', 'powiedzieć'],
  'biegać|bieganie': ['biegać', 'biegam', 'biegaj'],
  'wiosna|wiosnę': ['wiosna', 'wiosną', 'wiośnie'],
  'umówić|umówię': ['umówiłem', 'umówić', 'umówiony'],
  'rolki|rolkach': ['rolki', 'rolek', 'rolkami'],
  'zdarzyć się|zdarzyło się': ['zdarzył się', 'zdarzyła się', 'zdarzy się'],
  'duży|największy': ['największa', 'największe', 'największego'],
  'stary|najstarszy': ['najstarsza', 'najstarsze', 'najstarszego'],
  'trzecia|trzeciej': ['trzecia', 'trzecią', 'trzeci'],
  'upiec|upieczemy': ['upiekę', 'upieczecie', 'upiec'],
  'opóźnienie|opóźnienia': ['opóźnienie', 'opóźnieniu', 'opóźnieniem'],
  'polecieć|polecimy': ['polecę', 'polecicie', 'polecieć'],
  'wziąć|weźmiemy': ['wezmę', 'weźmiecie', 'wziąć'],
  'mówić|mówię': ['mówisz', 'mówi', 'mówić'],
  'pracować|pracują': ['pracuję', 'pracuje', 'pracować'],
  'rozumieć|rozumiem': ['rozumiesz', 'rozumie', 'rozumieć'],
  'Piotr|Piotrze': ['Piotr', 'Piotra', 'Piotrem'],
  'wiedzieć|wiedzą': ['wiem', 'wie', 'wiecie'],
  'osiemdziesiąt|osiemdziesiątym': ['osiemdziesiąty', 'osiemdziesiątego', 'osiemdziesiątemu'],
};

/** Ключ записи таблицы для задания: основа и первая принятая форма. */
export const grammarOptionsKey = (d: Pick<TextData, 'base' | 'accepted'>): string => `${d.base ?? ''}|${d.accepted[0] ?? ''}`;

/**
 * Четыре формы для выбора: правильная первой, затем три неверные (перемешивает вызывающий, `toPublicItem`). `null`, если для задания нет записи
 * в таблице — тогда клиент показывает ввод. Неверная форма никогда не совпадает с принятой (даже без учёта регистра и диакритики).
 */
export function grammarOptions(d: Pick<TextData, 'base' | 'accepted'>): string[] | null {
  const correct = d.accepted[0];
  const wrong = GRAMMAR_DISTRACTORS[grammarOptionsKey(d)];
  if (!correct || !wrong) return null;
  const taken = new Set(d.accepted.map((a) => normalize(a)));
  const seen = new Set<string>([normalize(correct)]);
  const distractors = wrong.filter((w) => {
    const n = normalize(w);
    if (taken.has(n) || seen.has(n)) return false;
    seen.add(n);
    return true;
  });
  return distractors.length >= 2 ? [correct, ...distractors] : null;
}

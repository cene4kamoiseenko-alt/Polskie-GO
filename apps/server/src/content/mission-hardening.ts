/**
 * Шаги миссий с двумя верными ответами (владелец 2026-11-07: «сделай ответы сложнее чуть, а не чтобы прям так легко»).
 *
 * Было: три варианта — два верных, одинаково оформленных, и один заведомо неверный (форма «Z mleko» среди двух гладких ответов бросалась в глаза),
 * а подсказка нередко прямо перечисляла верные ответы («Отвечай тем же словом: krowim / roślinnym»). Стало: к каждому такому шагу добавлен ещё один
 * правдоподобный неверный вариант — слово в соседнем падеже, неверный род или число, противоречивая фраза, — так что их два верных и два неверных,
 * а подсказки, называвшие ответ дословно, говорят о способе («повтори форму из вопроса»), а не о результате.
 *
 * Правка накладывается при загрузке (`hardenTwoAnswerSteps`): исходные шаги остаются как были, неверный ключ — ошибка при старте, а не молчаливый пропуск.
 */
import type { I18n } from '@polski-go/shared';
import { t } from './builders';
import type { Mission, MissionOption } from './missions';

const wrong = (pl: string, uk: string, ru: string, en: string): MissionOption => ({ pl, ok: false, why: t(uk, ru, en) });

type Patch = { add: MissionOption[]; hint?: I18n };

/** Ключ — `<миссия>/<шаг>`. */
export const TWO_ANSWER_PATCHES: Record<string, Patch> = {
  'zabka-first-order/sauce': {
    add: [wrong('Z sosie czosnkowym, poproszę.', 'Після «z» — орудний: z sosem. «Sosie» — місцевий відмінок.', 'После «z» — творительный: z sosem. «Sosie» — предложный падеж.', 'After «z» use the instrumental: z sosem. «Sosie» is the locative.')],
    hint: t('Sos — соус. Згадай, який відмінок потрібен після «z» і після «bez».', 'Sos — соус. Вспомни, какой падеж нужен после «z» и после «bez».', 'Sos means sauce. Which case follows «z» and which follows «bez»?'),
  },
  'zabka-first-order/water': {
    add: [wrong('Gazowany, poproszę.', 'Woda — жіночий рід: gazowana, а не gazowany.', 'Woda — женский род: gazowana, а не gazowany.', 'Woda is feminine: gazowana, not gazowany.')],
  },
  'zabka-first-order/pay': {
    add: [wrong('Gotówka.', 'Платимо чим? — орудний: gotówką, а не gotówka.', 'Платим чем? — творительный: gotówką, а не gotówka.', 'Pay with what? The instrumental: gotówką, not gotówka.')],
    hint: t('Повтори форму слова з питання (орудний відмінок) і вибери будь-який спосіб.', 'Повтори форму слова из вопроса (творительный падеж) и выбери любой способ.', 'Repeat the word form from the question (instrumental) and pick either way.'),
  },
  'zabka-first-order/bye': {
    add: [wrong('Proszę bardzo. Do widzenia!', '«Proszę bardzo» щойно сказала касирка. Тебе пропонують чек: «Tak, poproszę» або «Nie, dziękuję».', '«Proszę bardzo» только что сказала кассирша. Тебе предлагают чек: «Tak, poproszę» или «Nie, dziękuję».', 'The cashier just said «Proszę bardzo». You’re offered a receipt: «Tak, poproszę» or «Nie, dziękuję».')],
  },
  'zabka-first-order/s2-milk': {
    add: [wrong('Z mlekiem, poproszę.', 'Треба вибрати: krowim чи roślinnym. «Z mlekiem» — надто загальна відповідь.', 'Нужно выбрать: krowim или roślinnym. «Z mlekiem» — слишком общий ответ.', 'You have to choose: krowim or roślinnym. «Z mlekiem» doesn’t pick one.')],
    hint: t('Обери один із варіантів питання й постав його в тій самій формі після «z».', 'Выбери один из вариантов вопроса и поставь его в той же форме после «z».', 'Pick one of the options in the question and use the same form after «z».'),
  },
  'krakow-pierogi/cooking': {
    add: [wrong('Smażony, poproszę.', 'Pierogi — множина: smażone / gotowane, а не smażony.', 'Pierogi — множественное число: smażone / gotowane, а не smażony.', 'Pierogi is plural: smażone / gotowane, not smażony.')],
  },
  'krakow-pierogi/allergy': {
    add: [wrong('Jestem uczulony orzechy.', 'Після «uczulony» потрібне «na»: uczulony na orzechy.', 'После «uczulony» нужно «na»: uczulony na orzechy.', 'After «uczulony» you need «na»: uczulony na orzechy.')],
  },
  'krakow-pierogi/s2-icecream': {
    add: [wrong('Z lodach, poproszę.', 'Після «z» — орудний: z lodami, а не «lodach».', 'После «z» — творительный: z lodami, а не «lodach».', 'After «z» use the instrumental: z lodami, not «lodach».')],
  },
  'biedronka-breakfast/bag': {
    add: [wrong('Nie, dziękuję, mam swój.', 'Torba — жіночий рід: swoją, а не swój.', 'Torba — женский род: swoją, а не swój.', 'Torba is feminine: swoją, not swój.')],
  },
  'biedronka-breakfast/s2-slice': {
    add: [wrong('Nie, poproszę.', '«Nie» і «poproszę» разом — суперечність: відмовляємо словами «Nie, dziękuję».', '«Nie» и «poproszę» вместе — противоречие: отказ — «Nie, dziękuję».', '«Nie» with «poproszę» contradicts itself: a refusal is «Nie, dziękuję».')],
  },
  'orlen-coffee/s2-hungry': {
    add: [wrong('I jeszcze hot dogu, poproszę.', 'Poproszę + знахідний: hot doga. «Hot dogu» — родовий чи місцевий.', 'Poproszę + винительный: hot doga. «Hot dogu» — родительный или предложный.', 'Poproszę takes the accusative: hot doga. «Hot dogu» is genitive or locative.')],
  },
  'orlen-coffee/s2-bun': {
    add: [wrong('W francuska, poproszę.', 'Після «w» — місцевий: w francuskiej.', 'После «w» — предложный: w francuskiej.', 'After «w» use the locative: w francuskiej.')],
  },
  'orlen-pump/three': {
    add: [wrong('Trzynaście.', 'trzynaście = 13. Колонка три: «numer trzy» або розмовно «trójka».', 'trzynaście = 13. Колонка три: «numer trzy» или разговорно «trójka».', 'trzynaście = 13. Pump three: «numer trzy» or informally «trójka».')],
  },
  'paczkomat/neighbour': {
    add: [wrong('Tak, już odbiorę. Dziękuję!', '«Już odbiorę» — «вже заберу»: майбутній час. Ти вже забрав: odebrałem / odebrałam.', '«Już odbiorę» — «уже заберу»: будущее время. Ты уже забрал: odebrałem / odebrałam.', '«Już odbiorę» is future (“I’ll pick it up”). You already did: odebrałem / odebrałam.')],
    hint: t('Посилку ти вже забрав — потрібен минулий час; рід — за тобою.', 'Посылку ты уже забрал — нужно прошедшее время; род — по тебе.', 'You already picked it up: use the past tense, with your own gender.'),
  },
  'first-tram/s2-thanks': {
    add: [wrong('Dziękuję bardzo!', 'Тебе подякували. У відповідь кажуть «Nie ma za co» або «Proszę bardzo», а не дякують знову.', 'Тебя поблагодарили. В ответ говорят «Nie ma za co» или «Proszę bardzo», а не благодарят снова.', 'You were thanked. Reply with «Nie ma za co» or «Proszę bardzo», not another thank-you.')],
    hint: t('Тобі подякували. Що прийнято відповідати на «dziękuję»?', 'Тебя поблагодарили. Что принято отвечать на «dziękuję»?', 'You were thanked. What do people say back to «dziękuję»?'),
  },
  'bar-mleczny/s2-yes': {
    add: [wrong('Nie ma za co!', 'Це відповідь на «дякую», а тобі запропонували сісти — подякуй.', 'Это ответ на «спасибо», а тебе предложили сесть — поблагодари.', 'That answers «thank you». You were offered a seat — you thank them.')],
    hint: t('Тобі поступилися місцем: як ввічливо відреагувати?', 'Тебе уступили место: как вежливо отреагировать?', 'Someone offered you a seat: how do you react politely?'),
  },
  'bar-mleczny/s2-flavour': {
    add: [wrong('Truskawkowego, poproszę.', 'Kompot — неживий чоловічий рід: у знахідному форма не змінюється (truskawkowy). «Truskawkowego» — родовий.', 'Kompot — неодушевлённый мужской род: в винительном форма не меняется (truskawkowy). «Truskawkowego» — родительный.', 'Kompot is masculine inanimate: the accusative doesn’t change (truskawkowy). «Truskawkowego» is genitive.')],
  },
  'torun-bakery/choose': {
    add: [wrong('Z różę, poproszę.', 'Після «z» — орудний: z różą, а не «różę».', 'После «z» — творительный: z różą, а не «różę».', 'After «z» use the instrumental: z różą, not «różę».')],
    hint: t('Повтори форму з питання (z + орудний). Начинку вибери будь-яку.', 'Повтори форму из вопроса (z + творительный). Начинку выбери любую.', 'Repeat the form from the question (z + instrumental). Pick either filling.'),
  },
  'torun-bakery/s2-shape': {
    add: [wrong('Sercem!', 'Wybierać + знахідний: serce (у середнього роду форма не змінюється), а не «sercem».', 'Wybierać + винительный: serce (у среднего рода форма не меняется), а не «sercem».', 'Wybierać takes the accusative: serce (neuter doesn’t change), not «sercem».')],
    hint: t('Wybierać (що?) — знахідний. Пам’ятай: у жіночого роду на -a закінчення змінюється, у середнього — ні.', 'Wybierać (что?) — винительный. Помни: у женского рода на -a окончание меняется, у среднего — нет.', 'Wybierać (what?) takes the accusative. Feminine -a nouns change their ending, neuter nouns don’t.'),
  },
  'kazimierz-zapiekanka/ketchup': {
    add: [wrong('Tak, bez keczupem.', 'Після «bez» — родовий: bez keczupu, а не «keczupem».', 'После «bez» — родительный: bez keczupu, а не «keczupem».', 'After «bez» use the genitive: bez keczupu, not «keczupem».')],
  },
  'rossmann-basics/s2-pharmacy': {
    add: [wrong('Boli mnie gardła.', 'Що болить — називний: gardło. Родовий «gardła» тут не потрібен.', 'Что болит — именительный: gardło. Родительный «gardła» здесь не нужен.', 'What hurts is in the nominative: gardło. The genitive «gardła» doesn’t belong here.')],
  },
  'landlord/people': {
    add: [wrong('Tylko dwa osoby.', 'Osoba — жіночий рід: dwie osoby, а не «dwa osoby».', 'Osoba — женский род: dwie osoby, а не «dwa osoby».', 'Osoba is feminine: dwie osoby, not «dwa osoby».')],
  },
  'landlord/price': {
    add: [wrong('Ile kosztuje kaucja miesięcznie?', 'Kaucja — застава (платиться один раз), а не щомісячна оренда.', 'Kaucja — залог (платится один раз), а не ежемесячная аренда.', 'Kaucja is a deposit (paid once), not the monthly rent.')],
  },
  'landlord/contract': {
    add: [wrong('Nie, najpierw podpiszę, potem przeczytam.', 'Договір спершу читають, а потім підписують.', 'Договор сначала читают, потом подписывают.', 'You read a contract first, then sign it.')],
  },
  'first-workday/repeat': {
    add: [wrong('Przepraszam, czy może pani powtórzyłam?', 'Після «czy może pani» потрібен інфінітив: powtórzyć.', 'После «czy może pani» нужен инфинитив: powtórzyć.', 'After «czy może pani» you need the infinitive: powtórzyć.')],
  },
  'first-workday/bye': {
    add: [wrong('Dziękuję, do zobaczenia wczoraj!', '«Wczoraj» — учора; прощаючись до наступної зустрічі, кажемо «jutro» (завтра).', '«Wczoraj» — вчера; прощаясь до следующей встречи, говорим «jutro» (завтра).', '«Wczoraj» means yesterday; to say see you next time we use «jutro» (tomorrow).')],
  },
  'marcin-rogal/pay': {
    add: [wrong('Kartę, poproszę.', 'Płacić чим? — орудний: kartą, а не «kartę».', 'Płacić чем? — творительный: kartą, а не «kartę».', 'Płacić with what? The instrumental: kartą, not «kartę».')],
    hint: t('Чим платиш? Вибери спосіб і постав слово в орудний відмінок.', 'Чем платишь? Выбери способ и поставь слово в творительный падеж.', 'Pay with what? Pick a way and put the word in the instrumental.'),
  },
  'listopad-swieto/s2-shirt': {
    add: [wrong('Średnia, poproszę.', 'Rozmiar — чоловічий рід: średni, а не «średnia».', 'Rozmiar — мужской род: średni, а не «średnia».', 'Rozmiar is masculine: średni, not «średnia».')],
  },
  'jarmark-oscypek/x2-pay': {
    add: [wrong('Zapłacę kartę.', 'Płacić чим? — орудний: kartą, а не «kartę».', 'Płacić чем? — творительный: kartą, а не «kartę».', 'Płacić with what? The instrumental: kartą, not «kartę».')],
  },
  'sylwester-impreza/midnight': {
    add: [wrong('Szczęśliwy Nowy Rok!', 'Побажання — у родовому: Szczęśliwego Nowego Roku!', 'Пожелание — в родительном: Szczęśliwego Nowego Roku!', 'Wishes take the genitive: Szczęśliwego Nowego Roku!')],
  },
  'dzialka/grill': {
    add: [wrong('Poproszę kiełbaska.', 'Poproszę + знахідний: kiełbaskę, а не «kiełbaska».', 'Poproszę + винительный: kiełbaskę, а не «kiełbaska».', 'Poproszę takes the accusative: kiełbaskę, not «kiełbaska».')],
  },
  'dzien-ojca/know': {
    add: [wrong('Pracujemy razem biuro.', 'Місце — «w biurze» (місцевий), а не «biuro».', 'Место — «w biurze» (предложный), а не «biuro».', 'The place is «w biurze» (locative), not «biuro».')],
  },
};

/** Накладывает правки: добавляет неверные варианты и заменяет подсказки. Шаг без ключа в таблице остаётся как есть; ключ без шага — ошибка. */
export function hardenTwoAnswerSteps(list: Mission[]): Mission[] {
  const used = new Set<string>();
  const out = list.map((m) => ({
    ...m,
    steps: m.steps.map((s) => {
      const key = `${m.slug}/${s.id}`;
      const patch = TWO_ANSWER_PATCHES[key];
      if (!patch) return s;
      used.add(key);
      return { ...s, options: [...s.options!, ...patch.add], ...(patch.hint ? { hint: patch.hint } : {}) };
    }),
  }));
  const missing = Object.keys(TWO_ANSWER_PATCHES).filter((k) => !used.has(k));
  if (missing.length) throw new Error(`mission-hardening: нет шагов для правок: ${missing.join(', ')}`);
  return out;
}

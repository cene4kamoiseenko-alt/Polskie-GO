/**
 * Люблин — трудные версии уроков (2026-11-28, docs/LEVELS_RU.md, ТЗ 1.0, этап 2). Город учреждений и документов: дело в ведомстве,
 * заявление, даты, карта побыту, почта, банк, договор, Люблинская уния. Те же герои (pani Jolanta и pan Marek в учреждении, pani Ewa
 * на почте, pan Adam в банке, хозяйка квартиры pani Wanda, экскурсовод pani Agnieszka). Все уроки города — B1, поэтому версия
 * одна — B2: канцелярский язык, на котором пишут письма и решения:
 *  • обжалование (wnieść odwołanie od decyzji, pełnomocnictwo), заявление и недочёты (wnoszę o, uzupełnić braki formalne),
 *    юридические сроки (w terminie do dnia, nie później niż, upływ terminu), условия вида на жительство (przesłanki, decyzja
 *    odmowna), утерянная посылка (przesyłka zaginęła, odszkodowanie), кредит (zdolność kredytowa, oprocentowanie, zlecenie stałe),
 *    приложение к договору (aneks, kaucja, z zastrzeżeniem, niniejszy), историческое повествование об унии 1569 года.
 * Правила качества — docs/EXERCISE_QUALITY.md. Аудирования и диктанта в версиях нет (нужна озвучка). Польский текст написан
 * по нормам языка, но проверка носителем ещё не проводилась (docs/ROADMAP_1_0.md). Образцы писем и решений — учебные, не юридическая помощь.
 */
import { t, fillGap, reading, dialogue, reverseChoice, build, findError, match } from '../builders';
import type { LessonLevels } from '../types';

const URZEDNICZKA = { name: 'Pani Jolanta', emoji: '👩🏼‍💼', role: t('працівниця установи', 'сотрудница учреждения', 'an office clerk') };
const URZEDNIK = { name: 'Pan Marek', emoji: '👨🏻‍💼', role: t('урядовець', 'чиновник', 'a civil servant') };
const POCZTOWA = { name: 'Pani Ewa', emoji: '👩🏽‍💼', role: t('працівниця пошти', 'сотрудница почты', 'a post office clerk') };
const DORADCA = { name: 'Pan Adam', emoji: '🧑🏼‍💼', role: t('консультант банку', 'консультант банка', 'a bank adviser') };
const WYNAJMUJACA = { name: 'Pani Wanda', emoji: '👵🏼', role: t('власниця квартири', 'владелица квартиры', 'a landlady') };
const PRZEWODNICZKA = { name: 'Pani Agnieszka', emoji: '👩🏻‍🏫', role: t('екскурсовод по Любліну', 'экскурсовод по Люблину', 'a Lublin tour guide') };

// ───────────────────────────── lub-1-sprawa: Справа в установі (урок B1) ─────────────────────────────
const LUB1: LessonLevels = {
  B2: {
    explanation: t(
      'Оскарження й довіреність:\n• **wnieść odwołanie od decyzji** (od + родовий) **do** + родовий органу: do wojewody;\n• термін — **w terminie 14 dni od dnia doręczenia** (від дня вручення);\n• **organ** — установа, що вирішує; **rozpatrzyć odwołanie** — розглянути скаргу;\n• довіреність — **pełnomocnictwo**; **upoważnić kogoś do** + родовий: upoważniam żonę **do odbioru** dokumentów;\n• **w moim imieniu** — від мого імені.',
      'Обжалование и доверенность:\n• **wnieść odwołanie od decyzji** (od + родительный) **do** + родительный органа: do wojewody;\n• срок — **w terminie 14 dni od dnia doręczenia** (со дня вручения);\n• **organ** — учреждение, которое решает; **rozpatrzyć odwołanie** — рассмотреть жалобу;\n• доверенность — **pełnomocnictwo**; **upoważnić kogoś do** + родительный: upoważniam żonę **do odbioru** dokumentów;\n• **w moim imieniu** — от моего имени.',
      'Appeals and powers of attorney:\n• **wnieść odwołanie od decyzji** (od + genitive) **do** + genitive of the authority: do wojewody;\n• the deadline — **w terminie 14 dni od dnia doręczenia** (from the day of delivery);\n• **organ** — the deciding authority; **rozpatrzyć odwołanie** — to consider an appeal;\n• power of attorney — **pełnomocnictwo**; **upoważnić kogoś do** + genitive: upoważniam żonę **do odbioru** dokumentów;\n• **w moim imieniu** — on my behalf.',
    ),
    examples: [
      { pl: 'Od decyzji przysługuje odwołanie do wojewody w terminie 14 dni od dnia doręczenia.', tr: t('Рішення можна оскаржити до воєводи протягом 14 днів від дня вручення.', 'Решение можно обжаловать у воеводы в течение 14 дней со дня вручения.', 'The decision can be appealed to the voivode within 14 days of delivery.') },
      { pl: 'Upoważniam męża do odbioru karty w moim imieniu.', tr: t('Уповноважую чоловіка отримати картку від мого імені.', 'Уполномочиваю мужа получить карту от моего имени.', 'I authorise my husband to collect the card on my behalf.') },
    ],
    exercises: [
      dialogue('dialogue.office', URZEDNIK, [
        {
          npc: 'Otrzymał pan decyzję odmowną. Czy chce pan coś wyjaśnić?',
          tr: t('Ви отримали рішення про відмову. Хочете щось уточнити?', 'Вы получили решение об отказе. Хотите что-то уточнить?', 'You’ve received a refusal. Is there anything you want to clarify?'),
          choose: [
            ['Tak, chciałbym wnieść odwołanie od tej decyzji.', t('Так, я хотів би оскаржити це рішення.', 'Да, я хотел бы обжаловать это решение.', 'Yes, I’d like to appeal against this decision.')],
            ['Tak, chciałbym wnieść odwołanie na tę decyzję.', t('(оскаржити — **odwołanie od** + родовий)', '(обжаловать — **odwołanie od** + родительный)', '(to appeal — **odwołanie od** + genitive)')],
            ['Tak, chciałbym wnieść odwołanie od tą decyzją.', t('(**od** + родовий: od **tej decyzji**)', '(**od** + родительный: od **tej decyzji**)', '(**od** + genitive)')],
          ],
          feedback: t('**Odwołanie od decyzji**.', '**Odwołanie od decyzji**.', '**Odwołanie od decyzji**.'),
        },
        {
          npc: 'Ma pan na to czternaście dni. Złoży je pan osobiście?',
          tr: t('У вас на це чотирнадцять днів. Подасте особисто?', 'У вас на это четырнадцать дней. Подадите лично?', 'You have fourteen days. Will you file it in person?'),
          choose: [
            ['Nie, upoważnię do tego żonę — złoży je w moim imieniu.', t('Ні, уповноважу на це дружину — вона подасть від мого імені.', 'Нет, уполномочу на это жену — она подаст от моего имени.', 'No, I’ll authorise my wife — she’ll file it on my behalf.')],
            ['Nie, upoważnię na to żonę — złoży je w moim imieniu.', t('(**upoważnić do** + родовий: **do tego**)', '(**upoważnić do** + родительный: **do tego**)', '(**upoważnić do** + genitive)')],
            ['Nie, upoważnię do tego żonę — złoży je w moje imię.', t('(стала формула — **w moim imieniu**, місцевий)', '(устойчивая формула — **w moim imieniu**, предложный)', '(set phrase: **w moim imieniu**)')],
          ],
          feedback: t('**Upoważnić do**; **w moim imieniu**.', '**Upoważnić do**; **w moim imieniu**.', '**Upoważnić do**; **w moim imieniu**.'),
        },
      ]),
      fillGap('register.appeal', 'Odwołanie należy wnieść w terminie 14 dni od dnia ___ decyzji.', ['doręczenia', 'doręczenie', 'doręczeniu', 'doręczeniem'],
        t('Скаргу слід подати протягом 14 днів від дня вручення рішення.', 'Жалобу следует подать в течение 14 дней со дня вручения решения.', 'The appeal must be filed within 14 days of the decision being delivered.'),
        t('**Od dnia** + родовий: od dnia **doręczenia**.', '**Od dnia** + родительный: od dnia **doręczenia**.', '**Od dnia** + genitive.')),
      fillGap('register.appeal', 'Upoważniam pana Kowalskiego do ___ dokumentów w moim imieniu.', ['odbioru', 'odbiór', 'odbiorem', 'odebrać'],
        t('Уповноважую пана Ковальського отримати документи від мого імені.', 'Уполномочиваю пана Ковальского получить документы от моего имени.', 'I authorise Mr Kowalski to collect the documents on my behalf.'),
        t('**Upoważnić do** + родовий: do **odbioru**.', '**Upoważnić do** + родительный: do **odbioru**.', '**Upoważnić do** + genitive.')),
      fillGap('register.appeal', 'Organ ma obowiązek ___ odwołanie w ciągu miesiąca.', ['rozpatrzyć', 'rozpatrzenie', 'rozpatrzony', 'rozpatruje'],
        t('Орган зобов’язаний розглянути скаргу протягом місяця.', 'Орган обязан рассмотреть жалобу в течение месяца.', 'The authority must consider the appeal within a month.'),
        t('**Mieć obowiązek** + інфінітив: **rozpatrzyć**.', '**Mieć obowiązek** + инфинитив: **rozpatrzyć**.', '**Mieć obowiązek** + infinitive.')),
      reading('reading.appeal', 'Pouczenie: „Od niniejszej decyzji przysługuje stronie odwołanie do Wojewody Lubelskiego za pośrednictwem organu, który wydał decyzję, w terminie 14 dni od dnia jej doręczenia. Strona może działać przez pełnomocnika”.',
        t('Через кого подають скаргу?', 'Через кого подают жалобу?', 'Through whom is the appeal filed?'),
        [t('через орган, який видав рішення', 'через орган, который вынес решение', 'through the authority that issued the decision'), t('безпосередньо до воєводи', 'непосредственно воеводе', 'directly to the voivode'), t('лише особисто, без представника', 'только лично, без представителя', 'only in person, without a representative')],
        t('«odwołanie do Wojewody… **za pośrednictwem organu, który wydał decyzję**»; представник дозволений («może działać przez pełnomocnika»).', '«odwołanie do Wojewody… **za pośrednictwem organu, który wydał decyzję**»; представитель разрешён («może działać przez pełnomocnika»).', '“**za pośrednictwem organu, który wydał decyzję**”; a representative is allowed.')),
      reverseChoice('register.appeal', t('Ви маєте право оскаржити рішення.', 'Вы имеете право обжаловать решение.', 'You have the right to appeal the decision.'),
        ['Przysługuje panu prawo do odwołania się od decyzji.', 'Przysługuje panu prawo do odwołania się na decyzję.', 'Przysługuje pana prawo do odwołania się od decyzji.'],
        t('Кому — давальний: **panu**; оскаржити — **odwołać się od** + родовий.', 'Кому — дательный: **panu**; обжаловать — **odwołać się od** + родительный.', 'Dative **panu**; **odwołać się od**.')),
      findError('register.appeal', ['Wnoszę', 'odwołanie', 'od', 'decyzja', 'z', 'dnia', '3', 'marca'], 3,
        t('Подаю скаргу на рішення від 3 березня.', 'Подаю жалобу на решение от 3 марта.', 'I am appealing against the decision of 3 March.'),
        t('**Od** + родовий: od **decyzji**.', '**Od** + родительный: od **decyzji**.', '**Od** + genitive.')),
      build('register.appeal', 'Upoważniam żonę do odbioru dokumentów', t('Уповноважую дружину отримати документи', 'Уполномочиваю жену получить документы', 'I authorise my wife to collect the documents'), ['odbiór', 'na'], [],
        t('**Upoważnić kogoś do** + родовий: do **odbioru**.', '**Upoważnić kogoś do** + родительный: do **odbioru**.', '**Upoważnić do** + genitive.')),
      match('register.appeal', [
        ['odwołanie od decyzji', t('скарга на рішення', 'жалоба на решение', 'appeal against a decision')],
        ['pełnomocnictwo', t('довіреність', 'доверенность', 'power of attorney')],
        ['doręczenie', t('вручення', 'вручение', 'delivery (of a letter)')],
        ['w moim imieniu', t('від мого імені', 'от моего имени', 'on my behalf')],
      ]),
    ],
  },
};

// ───────────────────────────── lub-2-wniosek: Заява й додатки (урок B1) ─────────────────────────────
const LUB2: LessonLevels = {
  B2: {
    explanation: t(
      'Офіційна заява й формальні недоліки:\n• прохання — **Wnoszę o** + знахідний: wnoszę o **wydanie zaświadczenia**;\n• додатки — **Do wniosku dołączam…**; заява — **Oświadczam, że…**;\n• недоліки — **braki formalne**; **wezwanie do uzupełnienia braków** (виклик до усунення недоліків);\n• наслідок — wniosek **zostanie pozostawiony bez rozpoznania** (залишать без розгляду);\n• **w wyznaczonym terminie** — у призначений термін.',
      'Официальное заявление и формальные недочёты:\n• просьба — **Wnoszę o** + винительный: wnoszę o **wydanie zaświadczenia**;\n• приложения — **Do wniosku dołączam…**; заявление — **Oświadczam, że…**;\n• недочёты — **braki formalne**; **wezwanie do uzupełnienia braków** (требование устранить недочёты);\n• последствие — wniosek **zostanie pozostawiony bez rozpoznania** (оставят без рассмотрения);\n• **w wyznaczonym terminie** — в назначенный срок.',
      'Formal applications and missing items:\n• the request — **Wnoszę o** + accusative: wnoszę o **wydanie zaświadczenia**;\n• enclosures — **Do wniosku dołączam…**; a declaration — **Oświadczam, że…**;\n• deficiencies — **braki formalne**; **wezwanie do uzupełnienia braków** (a request to supply what’s missing);\n• the consequence — wniosek **zostanie pozostawiony bez rozpoznania** (will not be considered);\n• **w wyznaczonym terminie** — by the set deadline.',
    ),
    examples: [
      { pl: 'Wnoszę o wydanie zaświadczenia o zameldowaniu. Do wniosku dołączam kopię paszportu.', tr: t('Прошу видати довідку про реєстрацію. До заяви додаю копію паспорта.', 'Прошу выдать справку о регистрации. К заявлению прилагаю копию паспорта.', 'I request a certificate of registration. I enclose a copy of my passport.') },
      { pl: 'W razie nieuzupełnienia braków wniosek zostanie pozostawiony bez rozpoznania.', tr: t('У разі неусунення недоліків заяву залишать без розгляду.', 'В случае неустранения недочётов заявление оставят без рассмотрения.', 'If the missing items aren’t supplied, the application will not be considered.') },
    ],
    exercises: [
      dialogue('dialogue.application', URZEDNICZKA, [
        {
          npc: 'We wniosku brakuje podpisu i zdjęcia. Dostanie pan wezwanie do uzupełnienia braków.',
          tr: t('У заяві бракує підпису й фото. Ви отримаєте виклик до усунення недоліків.', 'В заявлении не хватает подписи и фото. Вы получите требование устранить недочёты.', 'The application is missing a signature and a photo. You’ll receive a request to supply them.'),
          choose: [
            ['Rozumiem. Ile mam czasu na uzupełnienie braków?', t('Розумію. Скільки в мене часу на усунення недоліків?', 'Понимаю. Сколько у меня времени на устранение недочётов?', 'I see. How long do I have to supply them?')],
            ['Rozumiem. Ile mam czasu na uzupełnienie braki?', t('(чого — родовий: **braków**)', '(чего — родительный: **braków**)', '(genitive: **braków**)')],
            ['Rozumiem. Ile mam czasu do uzupełnienie braków?', t('(час на щось — **czas na** + знахідний)', '(время на что-то — **czas na** + винительный)', '(**czas na** + accusative)')],
          ],
          feedback: t('**Czas na uzupełnienie braków**.', '**Czas na uzupełnienie braków**.', '**Czas na uzupełnienie braków**.'),
        },
        {
          npc: 'Siedem dni. Inaczej wniosek zostanie pozostawiony bez rozpoznania.',
          tr: t('Сім днів. Інакше заяву залишать без розгляду.', 'Семь дней. Иначе заявление оставят без рассмотрения.', 'Seven days. Otherwise the application won’t be considered.'),
          choose: [
            ['W takim razie doniosę wszystko jutro, w wyznaczonym terminie.', t('Тоді я донесу все завтра, у призначений термін.', 'Тогда я донесу всё завтра, в назначенный срок.', 'Then I’ll bring everything tomorrow, within the deadline.')],
            ['W takim razie donieść wszystko jutro, w wyznaczonym terminie.', t('(я донесу — особова форма: **doniosę**, а не інфінітив)', '(я донесу — личная форма: **doniosę**, а не инфинитив)', '(I will bring — **doniosę**, not the infinitive)')],
            ['W takim razie doniosę wszystko jutro, w wyznaczony termin.', t('(де — місцевий: **w wyznaczonym terminie**)', '(где — предложный: **w wyznaczonym terminie**)', '(locative: **w wyznaczonym terminie**)')],
          ],
          feedback: t('**Doniosę**; **w wyznaczonym terminie**.', '**Doniosę**; **w wyznaczonym terminie**.', '**Doniosę**; **w wyznaczonym terminie**.'),
        },
      ]),
      fillGap('register.application', 'Wnoszę o ___ zaświadczenia o niekaralności.', ['wydanie', 'wydania', 'wydaniu', 'wydać'],
        t('Прошу видати довідку про несудимість.', 'Прошу выдать справку о несудимости.', 'I request a certificate of no criminal record.'),
        t('**Wnosić o** + знахідний: o **wydanie**.', '**Wnosić o** + винительный: o **wydanie**.', '**Wnosić o** + accusative.')),
      fillGap('register.application', 'Do wniosku ___ kopię umowy o pracę.', ['dołączam', 'dołączam się', 'załączam się', 'dołączyć'],
        t('До заяви додаю копію трудового договору.', 'К заявлению прилагаю копию трудового договора.', 'I enclose a copy of my employment contract.'),
        t('Формула — **do wniosku dołączam** + знахідний, без «się».', 'Формула — **do wniosku dołączam** + винительный, без «się».', 'Formula: **do wniosku dołączam**, no «się».')),
      fillGap('register.application', '___, że dane podane we wniosku są zgodne z prawdą.', ['Oświadczam', 'Oświadczenie', 'Oświadczyć', 'Oświadczony'],
        t('Заявляю, що дані, подані в заяві, правдиві.', 'Заявляю, что данные, указанные в заявлении, достоверны.', 'I declare that the information given is true.'),
        t('Формула — **Oświadczam, że…** (1-ша особа).', 'Формула — **Oświadczam, że…** (1-е лицо).', 'Formula: **Oświadczam, że…**')),
      reading('reading.application', 'Wezwanie: „Na podstawie art. 64 § 2 KPA wzywa się Pana do uzupełnienia braków formalnych wniosku z dnia 2 marca, tj. dołączenia aktualnej fotografii oraz złożenia podpisu, w terminie 7 dni od dnia doręczenia wezwania. Nieusunięcie braków spowoduje pozostawienie wniosku bez rozpoznania”.',
        t('Що станеться, якщо не усунути недоліки?', 'Что будет, если не устранить недочёты?', 'What happens if the deficiencies aren’t remedied?'),
        [t('заяву залишать без розгляду', 'заявление оставят без рассмотрения', 'the application won’t be considered'), t('заяву розглянуть за 7 днів', 'заявление рассмотрят за 7 дней', 'it will be decided within 7 days'), t('доведеться заплатити штраф', 'придётся заплатить штраф', 'a fine will be charged')],
        t('«Nieusunięcie braków spowoduje **pozostawienie wniosku bez rozpoznania**».', '«Nieusunięcie braków spowoduje **pozostawienie wniosku bez rozpoznania**».', '“**pozostawienie wniosku bez rozpoznania**”.')),
      reverseChoice('register.application', t('Прошу продовжити термін подання документів.', 'Прошу продлить срок подачи документов.', 'I request an extension of the deadline for documents.'),
        ['Wnoszę o przedłużenie terminu złożenia dokumentów.', 'Wnoszę o przedłużenia terminu złożenia dokumentów.', 'Wnoszę na przedłużenie terminu złożenia dokumentów.'],
        t('**Wnosić o** + знахідний: o **przedłużenie**.', '**Wnosić o** + винительный: o **przedłużenie**.', '**Wnosić o** + accusative.')),
      findError('register.application', ['Do', 'wniosek', 'dołączam', 'dwa', 'zdjęcia'], 1,
        t('До заяви додаю дві фотографії.', 'К заявлению прилагаю две фотографии.', 'I enclose two photographs.'),
        t('**Do** + родовий: do **wniosku**.', '**Do** + родительный: do **wniosku**.', '**Do** + genitive.')),
      build('register.application', 'Wnoszę o wydanie zaświadczenia o zameldowaniu', t('Прошу видати довідку про реєстрацію', 'Прошу выдать справку о регистрации', 'I request a certificate of registration'), ['wydania', 'zameldowanie'], [],
        t('**Wnosić o** + знахідний; **o** + місцевий: o **zameldowaniu**.', '**Wnosić o** + винительный; **o** + предложный: o **zameldowaniu**.', '**Wnosić o** + accusative.')),
      match('register.application', [
        ['braki formalne', t('формальні недоліки', 'формальные недочёты', 'missing formal items')],
        ['wezwanie', t('виклик, вимога', 'требование, вызов', 'formal request')],
        ['bez rozpoznania', t('без розгляду', 'без рассмотрения', 'without consideration')],
        ['oświadczam, że', t('заявляю, що', 'заявляю, что', 'I declare that')],
      ]),
    ],
  },
};

// ───────────────────────────── lub-3-dane: Дані й дати (урок B1) ─────────────────────────────
const LUB3: LessonLevels = {
  B2: {
    explanation: t(
      'Дати й терміни в офіційних листах:\n• шапка листа — **Lublin, dnia 3 kwietnia 2027 r.** (dnia + родовий);\n• крайній термін — **w terminie do dnia** 15 marca; **nie później niż** do 15 marca;\n• з певного дня — **począwszy od** + родовий: począwszy **od 1 stycznia**;\n• закінчення — **upływ terminu** (спливання терміну); **po upływie** + родовий — після спливання;\n• поновити — **przywrócić termin** (якщо пропустили з поважної причини).',
      'Даты и сроки в официальных письмах:\n• шапка письма — **Lublin, dnia 3 kwietnia 2027 r.** (dnia + родительный);\n• крайний срок — **w terminie do dnia** 15 marca; **nie później niż** do 15 marca;\n• начиная с — **począwszy od** + родительный: począwszy **od 1 stycznia**;\n• окончание — **upływ terminu** (истечение срока); **po upływie** + родительный — по истечении;\n• восстановить — **przywrócić termin** (если пропустили по уважительной причине).',
      'Dates and deadlines in official letters:\n• the letterhead — **Lublin, dnia 3 kwietnia 2027 r.** (dnia + genitive);\n• the deadline — **w terminie do dnia** 15 marca; **nie później niż** do 15 marca;\n• from a date on — **począwszy od** + genitive: począwszy **od 1 stycznia**;\n• expiry — **upływ terminu**; **po upływie** + genitive — after expiry;\n• to reinstate — **przywrócić termin** (if missed for a good reason).',
    ),
    examples: [
      { pl: 'Lublin, dnia 3 kwietnia 2027 r.', tr: t('Люблін, 3 квітня 2027 р.', 'Люблин, 3 апреля 2027 г.', 'Lublin, 3 April 2027') },
      { pl: 'Dokumenty należy złożyć nie później niż do 15 marca; po upływie terminu wniosek nie zostanie rozpatrzony.', tr: t('Документи слід подати не пізніше 15 березня; після спливання терміну заяву не розглянуть.', 'Документы следует подать не позднее 15 марта; по истечении срока заявление не рассмотрят.', 'Documents must be submitted by 15 March; after that the application won’t be considered.') },
    ],
    exercises: [
      dialogue('dialogue.deadlines', URZEDNICZKA, [
        {
          npc: 'Termin na złożenie wniosku minął tydzień temu.',
          tr: t('Термін подання заяви минув тиждень тому.', 'Срок подачи заявления истёк неделю назад.', 'The deadline for the application passed a week ago.'),
          choose: [
            ['Wiem, byłem w szpitalu. Czy mogę wnieść o przywrócenie terminu?', t('Знаю, я був у лікарні. Чи можу я просити поновити термін?', 'Знаю, я был в больнице. Могу ли я просить восстановить срок?', 'I know, I was in hospital. Can I ask for the deadline to be reinstated?')],
            ['Wiem, byłem w szpitalu. Czy mogę wnieść o przywrócenia terminu?', t('(**wnieść o** + знахідний: **przywrócenie**)', '(**wnieść o** + винительный: **przywrócenie**)', '(**wnieść o** + accusative)')],
            ['Wiem, byłem w szpitalu. Czy mogę wnieść o przywrócenie termin?', t('(чого — родовий: **terminu**)', '(чего — родительный: **terminu**)', '(genitive: **terminu**)')],
          ],
          feedback: t('**Wnieść o przywrócenie terminu**.', '**Wnieść o przywrócenie terminu**.', '**Wnieść o przywrócenie terminu**.'),
        },
        {
          npc: 'Tak, ale trzeba to zrobić w ciągu siedmiu dni od ustania przyczyny.',
          tr: t('Так, але це треба зробити протягом семи днів від зникнення причини.', 'Да, но это нужно сделать в течение семи дней с момента устранения причины.', 'Yes, but it must be done within seven days of the cause ending.'),
          choose: [
            ['Wyszedłem ze szpitala trzy dni temu, więc zmieszczę się w terminie.', t('Я вийшов із лікарні три дні тому, тож вкладуся в термін.', 'Я вышел из больницы три дня назад, так что уложусь в срок.', 'I left hospital three days ago, so I’ll make the deadline.')],
            ['Wyszedłem ze szpitala trzy dni temu, więc zmieszczę się w termin.', t('(вкластися — **zmieścić się w terminie**, місцевий)', '(уложиться — **zmieścić się w terminie**, предложный)', '(locative: **w terminie**)')],
            ['Wyszedłem z szpitala trzy dni temu, więc zmieszczę się w terminie.', t('(перед «sz-» — **ze szpitala**)', '(перед «sz-» — **ze szpitala**)', '(before «sz-» — **ze szpitala**)')],
          ],
          feedback: t('**Ze szpitala**; **zmieścić się w terminie**.', '**Ze szpitala**; **zmieścić się w terminie**.', '**Ze szpitala**; **w terminie**.'),
        },
      ]),
      fillGap('register.dates', 'Lublin, ___ 5 maja 2027 r.', ['dnia', 'dzień', 'dniu', 'dniem'],
        t('Люблін, 5 травня 2027 р.', 'Люблин, 5 мая 2027 г.', 'Lublin, 5 May 2027'),
        t('Шапка листа — **dnia** (родовий) + дата.', 'Шапка письма — **dnia** (родительный) + дата.', 'Letterhead: **dnia** + date.')),
      fillGap('register.dates', 'Nowe opłaty obowiązują, ___ od 1 stycznia.', ['począwszy', 'począwszy się', 'począć', 'początek'],
        t('Нові збори діють, починаючи з 1 січня.', 'Новые сборы действуют начиная с 1 января.', 'The new fees apply from 1 January.'),
        t('Починаючи з — **począwszy od** + родовий.', 'Начиная с — **począwszy od** + родительный.', 'From — **począwszy od**.')),
      fillGap('register.dates', 'Po ___ terminu wniosek nie zostanie rozpatrzony.', ['upływie', 'upływ', 'upływu', 'upłynąć'],
        t('Після спливання терміну заяву не розглянуть.', 'По истечении срока заявление не рассмотрят.', 'After the deadline the application won’t be considered.'),
        t('**Po** + місцевий: po **upływie**.', '**Po** + предложный: po **upływie**.', '**Po** + locative.')),
      reading('reading.dates', 'Ogłoszenie urzędu: „Wnioski o dofinansowanie należy składać w terminie do dnia 30 czerwca 2027 r. Wnioski złożone po upływie terminu nie będą rozpatrywane. Począwszy od 1 lipca, wnioski można składać wyłącznie przez internet”.',
        t('Що зміниться з 1 липня?', 'Что изменится с 1 июля?', 'What changes from 1 July?'),
        [t('заяви можна буде подавати лише через інтернет', 'заявления можно будет подавать только через интернет', 'applications will be online only'), t('заяви взагалі перестануть приймати', 'заявления вообще перестанут принимать', 'applications will stop entirely'), t('термін подання продовжать', 'срок подачи продлят', 'the deadline will be extended')],
        t('«**Począwszy od 1 lipca, wnioski można składać wyłącznie przez internet**».', '«**Począwszy od 1 lipca, wnioski można składać wyłącznie przez internet**».', '“**Począwszy od 1 lipca… wyłącznie przez internet**”.')),
      reverseChoice('register.dates', t('Документи слід подати не пізніше 10 вересня.', 'Документы следует подать не позднее 10 сентября.', 'The documents must be submitted by 10 September.'),
        ['Dokumenty należy złożyć nie później niż do 10 września.', 'Dokumenty należy złożyć nie później jak do 10 września.', 'Dokumenty należy złożyć nie później niż do 10 wrzesień.'],
        t('Формула — **nie później niż** (не «jak»); **do** + родовий: do 10 **września**.', 'Формула — **nie później niż** (не «jak»); **do** + родительный: do 10 **września**.', '**Nie później niż**; **do** + genitive.')),
      findError('register.dates', ['Termin', 'upływa', 'w', 'dniu', 'trzydziesty', 'czerwca'], 4,
        t('Термін спливає тридцятого червня.', 'Срок истекает тридцатого июня.', 'The deadline expires on 30 June.'),
        t('**W dniu** + порядковий у родовому: w dniu **trzydziestego** czerwca.', '**W dniu** + порядковое в родительном: w dniu **trzydziestego** czerwca.', 'Genitive ordinal: **trzydziestego**.')),
      build('register.dates', 'Po upływie terminu wniosek nie zostanie rozpatrzony', t('Після спливання терміну заяву не розглянуть', 'По истечении срока заявление не рассмотрят', 'After the deadline the application won’t be considered'), ['upływ', 'rozpatrzona'], [],
        t('**Po upływie** + родовий; wniosek — чоловічий рід: **rozpatrzony**.', '**Po upływie** + родительный; wniosek — мужской род: **rozpatrzony**.', '**Po upływie**; masculine **rozpatrzony**.')),
      match('register.dates', [
        ['upływ terminu', t('спливання терміну', 'истечение срока', 'expiry of a deadline')],
        ['przywrócić termin', t('поновити термін', 'восстановить срок', 'to reinstate a deadline')],
        ['począwszy od', t('починаючи з', 'начиная с', 'as from')],
        ['nie później niż', t('не пізніше ніж', 'не позднее', 'no later than')],
      ]),
    ],
  },
};

// ───────────────────────────── lub-4-pobyt: Карта побуту (урок B1) ─────────────────────────────
const LUB4: LessonLevels = {
  B2: {
    explanation: t(
      'Умови дозволу на побут:\n• **zezwolenie na pobyt czasowy w celu wykonywania pracy** — дозвіл на тимчасовий побут з метою роботи;\n• умови — **przesłanki**; **spełniać warunki** (знахідний): spełniam **wszystkie warunki**;\n• що треба мати — **tytuł prawny do lokalu** (право на житло), **ubezpieczenie zdrowotne**, **stabilne i regularne źródło dochodu**;\n• рішення — **decyzja pozytywna / odmowna**; **wydanie karty pobytu**;\n• **w toku postępowania** — під час провадження.',
      'Условия разрешения на пребывание:\n• **zezwolenie na pobyt czasowy w celu wykonywania pracy** — разрешение на временное пребывание с целью работы;\n• условия — **przesłanki**; **spełniać warunki** (винительный): spełniam **wszystkie warunki**;\n• что нужно иметь — **tytuł prawny do lokalu** (право на жильё), **ubezpieczenie zdrowotne**, **stabilne i regularne źródło dochodu**;\n• решение — **decyzja pozytywna / odmowna**; **wydanie karty pobytu**;\n• **w toku postępowania** — в ходе производства.',
      'Residence permit requirements:\n• **zezwolenie na pobyt czasowy w celu wykonywania pracy** — a temporary residence permit for work;\n• conditions — **przesłanki**; **spełniać warunki** (accusative): spełniam **wszystkie warunki**;\n• what you need — **tytuł prawny do lokalu** (a right to housing), **ubezpieczenie zdrowotne**, **stabilne i regularne źródło dochodu**;\n• decisions — **decyzja pozytywna / odmowna**; **wydanie karty pobytu**;\n• **w toku postępowania** — while the case is pending.',
    ),
    examples: [
      { pl: 'Złożyłem wniosek o zezwolenie na pobyt czasowy w celu wykonywania pracy.', tr: t('Я подав заяву на дозвіл на тимчасовий побут з метою роботи.', 'Я подал заявление на разрешение на временное пребывание с целью работы.', 'I applied for a temporary residence permit for work.') },
      { pl: 'Cudzoziemiec musi mieć stabilne i regularne źródło dochodu oraz ubezpieczenie zdrowotne.', tr: t('Іноземець повинен мати стабільне й регулярне джерело доходу та медичне страхування.', 'Иностранец должен иметь стабильный и регулярный источник дохода и медицинскую страховку.', 'A foreigner must have a stable, regular income and health insurance.') },
    ],
    exercises: [
      dialogue('dialogue.residence', URZEDNIK, [
        {
          npc: 'Jaki jest cel pobytu?',
          tr: t('Яка мета побуту?', 'Какова цель пребывания?', 'What is the purpose of your stay?'),
          choose: [
            ['Ubiegam się o zezwolenie na pobyt czasowy w celu wykonywania pracy.', t('Я клопочу про дозвіл на тимчасовий побут з метою роботи.', 'Я хлопочу о разрешении на временное пребывание с целью работы.', 'I’m applying for a temporary residence permit for work.')],
            ['Ubiegam się o zezwolenie na pobyt czasowy w celu wykonania pracą.', t('(**w celu** + родовий: **wykonywania pracy**)', '(**w celu** + родительный: **wykonywania pracy**)', '(**w celu** + genitive)')],
            ['Ubiegam się na zezwolenie na pobyt czasowy w celu wykonywania pracy.', t('(**ubiegać się o** + знахідний)', '(**ubiegać się o** + винительный)', '(**ubiegać się o** + accusative)')],
          ],
          feedback: t('**Ubiegać się o** + знахідний; **w celu** + родовий.', '**Ubiegać się o** + винительный; **w celu** + родительный.', '**Ubiegać się o**; **w celu** + genitive.'),
        },
        {
          npc: 'Czy spełnia pan wszystkie warunki?',
          tr: t('Чи виконуєте ви всі умови?', 'Выполняете ли вы все условия?', 'Do you meet all the conditions?'),
          choose: [
            ['Tak, mam umowę najmu, czyli tytuł prawny do lokalu, i ubezpieczenie zdrowotne.', t('Так, у мене є договір оренди, тобто право на житло, і медичне страхування.', 'Да, у меня есть договор аренды, то есть право на жильё, и медицинская страховка.', 'Yes, I have a tenancy agreement — a legal right to housing — and health insurance.')],
            ['Tak, mam umowę najmu, czyli tytuł prawny na lokal, i ubezpieczenie zdrowotne.', t('(стала формула — **tytuł prawny do lokalu**)', '(устойчивая формула — **tytuł prawny do lokalu**)', '(set phrase: **tytuł prawny do lokalu**)')],
            ['Tak, mam umowę najmu, czyli tytuł prawny do lokalu, i ubezpieczeniem zdrowotnym.', t('(маю що — знахідний: **ubezpieczenie zdrowotne**)', '(имею что — винительный: **ubezpieczenie zdrowotne**)', '(accusative: **ubezpieczenie**)')],
          ],
          feedback: t('**Tytuł prawny do lokalu**; mam + знахідний.', '**Tytuł prawny do lokalu**; mam + винительный.', '**Tytuł prawny do lokalu**.'),
        },
      ]),
      fillGap('register.residence', 'Wnioskodawca musi spełniać wszystkie ___.', ['warunki', 'warunków', 'warunkami', 'warunkach'],
        t('Заявник повинен виконувати всі умови.', 'Заявитель должен выполнять все условия.', 'The applicant must meet all the conditions.'),
        t('**Spełniać** + знахідний: **warunki**.', '**Spełniać** + винительный: **warunki**.', '**Spełniać** + accusative.')),
      fillGap('register.residence', 'W toku ___ urząd może wezwać pana do złożenia wyjaśnień.', ['postępowania', 'postępowanie', 'postępowaniem', 'postępować'],
        t('Під час провадження установа може викликати вас для пояснень.', 'В ходе производства учреждение может вызвать вас для дачи объяснений.', 'While the case is pending, the office may ask you for explanations.'),
        t('**W toku** + родовий: **postępowania**.', '**W toku** + родительный: **postępowania**.', '**W toku** + genitive.')),
      fillGap('register.residence', 'Otrzymałem decyzję ___ — teraz czekam na wydanie karty pobytu.', ['pozytywną', 'pozytywna', 'pozytywnej', 'pozytywnie'],
        t('Я отримав позитивне рішення — тепер чекаю на видачу карти побуту.', 'Я получил положительное решение — теперь жду выдачи карты побыту.', 'I got a positive decision — now I’m waiting for the residence card.'),
        t('Отримав що — знахідний: decyzję **pozytywną**.', 'Получил что — винительный: decyzję **pozytywną**.', 'Accusative: **pozytywną**.')),
      reading('reading.residence', 'Z informacji urzędu: „Zezwolenia na pobyt czasowy udziela się cudzoziemcowi, jeżeli posiada ubezpieczenie zdrowotne, stabilne i regularne źródło dochodu oraz tytuł prawny do lokalu. W razie braku którejkolwiek z przesłanek wydaje się decyzję odmowną, od której przysługuje odwołanie”.',
        t('Що буде, якщо бракує однієї з умов?', 'Что будет, если не хватает одного из условий?', 'What happens if one condition is missing?'),
        [t('видадуть рішення про відмову, яке можна оскаржити', 'вынесут решение об отказе, которое можно обжаловать', 'a refusal is issued, which can be appealed'), t('дозвіл видадуть на коротший строк', 'разрешение выдадут на меньший срок', 'the permit is issued for a shorter time'), t('заяву залишать без розгляду', 'заявление оставят без рассмотрения', 'the application is not considered')],
        t('«W razie braku którejkolwiek z przesłanek **wydaje się decyzję odmowną, od której przysługuje odwołanie**».', '«W razie braku którejkolwiek z przesłanek **wydaje się decyzję odmowną, od której przysługuje odwołanie**».', '“**wydaje się decyzję odmowną, od której przysługuje odwołanie**”.')),
      reverseChoice('register.residence', t('Я клопочу про видачу карти побуту.', 'Я хлопочу о выдаче карты побыту.', 'I am applying for a residence card.'),
        ['Ubiegam się o wydanie karty pobytu.', 'Ubiegam się o wydania karty pobytu.', 'Ubiegam o wydanie karty pobytu.'],
        t('**Ubiegać się o** + знахідний: o **wydanie**.', '**Ubiegać się o** + винительный: o **wydanie**.', '**Ubiegać się o** + accusative.')),
      findError('register.residence', ['Spełniam', 'wszystkich', 'warunków', 'do', 'otrzymania', 'zezwolenia'], 1,
        t('Я виконую всі умови для отримання дозволу.', 'Я выполняю все условия для получения разрешения.', 'I meet all the conditions for the permit.'),
        t('**Spełniać** + знахідний: **wszystkie warunki** (без заперечення — не родовий).', '**Spełniać** + винительный: **wszystkie warunki** (без отрицания — не родительный).', 'Accusative: **wszystkie warunki**.')),
      build('register.residence', 'Mam stabilne i regularne źródło dochodu', t('Я маю стабільне й регулярне джерело доходу', 'У меня есть стабильный и регулярный источник дохода', 'I have a stable and regular income'), ['stabilny', 'dochód'], [],
        t('**Źródło** — середній рід: **stabilne i regularne**; чого — родовий: **dochodu**.', '**Źródło** — средний род: **stabilne i regularne**; чего — родительный: **dochodu**.', 'Neuter **źródło**; genitive **dochodu**.')),
      match('register.residence', [
        ['przesłanka', t('умова (юридична)', 'условие (юридическое)', 'legal condition')],
        ['decyzja odmowna', t('рішення про відмову', 'решение об отказе', 'refusal decision')],
        ['tytuł prawny do lokalu', t('право на житло', 'право на жильё', 'legal right to housing')],
        ['ubiegać się o', t('клопотати про', 'хлопотать о', 'to apply for')],
      ]),
    ],
  },
};

// ───────────────────────────── lub-5-poczta: Пошта (урок B1) ─────────────────────────────
const LUB5: LessonLevels = {
  B2: {
    explanation: t(
      'Загублена посилка й скарга на пошті:\n• **przesyłka zaginęła** — посилка загубилася; **złożyć reklamację przesyłki**;\n• доказ — **potwierdzenie nadania** (квитанція про відправлення); **numer nadawczy**;\n• **odszkodowanie za utratę / uszkodzenie** + родовий — відшкодування за втрату;\n• отримання — **upoważnienie do odbioru**; **awizo powtórne**; przesyłka **została zwrócona do nadawcy**;\n• **nie została doręczona** — не була доставлена.',
      'Потерянная посылка и жалоба на почте:\n• **przesyłka zaginęła** — посылка потерялась; **złożyć reklamację przesyłki**;\n• доказательство — **potwierdzenie nadania** (квитанция об отправке); **numer nadawczy**;\n• **odszkodowanie za utratę / uszkodzenie** + родительный — возмещение за утрату;\n• получение — **upoważnienie do odbioru**; **awizo powtórne**; przesyłka **została zwrócona do nadawcy**;\n• **nie została doręczona** — не была доставлена.',
      'A lost parcel and a complaint at the post office:\n• **przesyłka zaginęła** — the parcel has gone missing; **złożyć reklamację przesyłki**;\n• proof — **potwierdzenie nadania** (proof of posting); **numer nadawczy** (tracking number);\n• **odszkodowanie za utratę / uszkodzenie** + genitive — compensation for loss;\n• collection — **upoważnienie do odbioru**; **awizo powtórne** (second notice); przesyłka **została zwrócona do nadawcy**;\n• **nie została doręczona** — was not delivered.',
    ),
    examples: [
      { pl: 'Przesyłka zaginęła, więc złożyłam reklamację i domagam się odszkodowania.', tr: t('Посилка загубилася, тож я подала скаргу й вимагаю відшкодування.', 'Посылка потерялась, так что я подала жалобу и требую возмещения.', 'The parcel went missing, so I filed a complaint and want compensation.') },
      { pl: 'Po drugim awizo przesyłka została zwrócona do nadawcy.', tr: t('Після другого повідомлення посилку повернули відправникові.', 'После второго извещения посылку вернули отправителю.', 'After the second notice the parcel was returned to the sender.') },
    ],
    exercises: [
      dialogue('dialogue.post', POCZTOWA, [
        {
          npc: 'Słucham, w czym problem?',
          tr: t('Слухаю, у чому проблема?', 'Слушаю, в чём проблема?', 'Yes, what’s the problem?'),
          choose: [
            ['Przesyłka z Gdańska zaginęła. Chciałbym złożyć reklamację.', t('Посилка з Гданська загубилася. Я хотів би подати скаргу.', 'Посылка из Гданьска потерялась. Я хотел бы подать жалобу.', 'A parcel from Gdańsk has gone missing. I’d like to make a claim.')],
            ['Przesyłka z Gdańska zaginęła się. Chciałbym złożyć reklamację.', t('(**zaginąć** — без «się»)', '(**zaginąć** — без «się»)', '(**zaginąć** takes no «się»)')],
            ['Przesyłka z Gdańska zaginął. Chciałbym złożyć reklamację.', t('(przesyłka — жіночий рід: **zaginęła**)', '(przesyłka — женский род: **zaginęła**)', '(feminine: **zaginęła**)')],
          ],
          feedback: t('**Przesyłka zaginęła**.', '**Przesyłka zaginęła**.', '**Przesyłka zaginęła**.'),
        },
        {
          npc: 'Czy ma pan potwierdzenie nadania?',
          tr: t('Чи маєте ви квитанцію про відправлення?', 'Есть ли у вас квитанция об отправке?', 'Do you have proof of posting?'),
          choose: [
            ['Tak, i domagam się odszkodowania za utratę przesyłki.', t('Так, і я вимагаю відшкодування за втрату посилки.', 'Да, и я требую возмещения за утрату посылки.', 'Yes, and I’m claiming compensation for the lost parcel.')],
            ['Tak, i domagam się odszkodowanie za utratę przesyłki.', t('(**domagać się** + родовий: **odszkodowania**)', '(**domagać się** + родительный: **odszkodowania**)', '(**domagać się** + genitive)')],
            ['Tak, i domagam się odszkodowania za utratą przesyłki.', t('(**za** + знахідний: za **utratę**)', '(**za** + винительный: za **utratę**)', '(**za** + accusative)')],
          ],
          feedback: t('**Odszkodowanie za utratę** + родовий.', '**Odszkodowanie za utratę** + родительный.', '**Odszkodowanie za utratę**.'),
        },
      ]),
      fillGap('register.post', 'List polecony nie został ___, bo nikogo nie było w domu.', ['doręczony', 'doręczona', 'doręczone', 'doręczył'],
        t('Рекомендований лист не доставили, бо нікого не було вдома.', 'Заказное письмо не доставили, потому что никого не было дома.', 'The registered letter wasn’t delivered because nobody was home.'),
        t('List — чоловічий рід: **został doręczony**.', 'List — мужской род: **został doręczony**.', 'List is masculine: **doręczony**.')),
      fillGap('register.post', 'Przesyłka została zwrócona ___ nadawcy.', ['do', 'dla', 'na', 'od'],
        t('Посилку повернули відправникові.', 'Посылку вернули отправителю.', 'The parcel was returned to the sender.'),
        t('Повернути кому — **zwrócić do nadawcy** (do + родовий).', 'Вернуть кому — **zwrócić do nadawcy** (do + родительный).', '**Zwrócić do nadawcy**.')),
      fillGap('register.post', 'Do odbioru przesyłki przez inną osobę potrzebne jest ___.', ['upoważnienie', 'upoważnienia', 'upoważnić', 'upoważniony'],
        t('Щоб посилку отримала інша особа, потрібна довіреність.', 'Чтобы посылку получил другой человек, нужна доверенность.', 'Someone else collecting the parcel needs written authorisation.'),
        t('Підмет — називний: **upoważnienie** (jest potrzebne).', 'Подлежащее — именительный: **upoważnienie** (jest potrzebne).', 'Subject, nominative: **upoważnienie**.')),
      reading('reading.post', 'Odpowiedź na reklamację: „Uprzejmie informujemy, że przesyłka o numerze nadawczym PL1234 nie została odnaleziona. Zgodnie z regulaminem przysługuje Panu odszkodowanie za utratę przesyłki w wysokości zadeklarowanej wartości, tj. 200 zł. Kwota zostanie przekazana przelewem w ciągu 30 dni”.',
        t('Скільки отримає клієнт і як?', 'Сколько получит клиент и как?', 'How much will the customer get, and how?'),
        [t('200 злотих переказом протягом 30 днів', '200 злотых переводом в течение 30 дней', '200 złoty by bank transfer within 30 days'), t('200 злотих готівкою на пошті', '200 злотых наличными на почте', '200 złoty in cash at the post office'), t('нову посилку замість загубленої', 'новую посылку вместо потерянной', 'a replacement parcel')],
        t('«odszkodowanie… **200 zł**. Kwota zostanie przekazana **przelewem w ciągu 30 dni**».', '«odszkodowanie… **200 zł**. Kwota zostanie przekazana **przelewem w ciągu 30 dni**».', '“**200 zł**… **przelewem w ciągu 30 dni**”.')),
      reverseChoice('register.post', t('Посилку пошкодили під час доставки.', 'Посылку повредили при доставке.', 'The parcel was damaged in transit.'),
        ['Przesyłka została uszkodzona podczas doręczenia.', 'Przesyłka została uszkodzony podczas doręczenia.', 'Przesyłka została uszkodzona podczas doręczeniu.'],
        t('Przesyłka — жіночий рід: **uszkodzona**; **podczas** + родовий: **doręczenia**.', 'Przesyłka — женский род: **uszkodzona**; **podczas** + родительный: **doręczenia**.', 'Feminine **uszkodzona**; **podczas** + genitive.')),
      findError('register.post', ['Mam', 'potwierdzenie', 'nadanie', 'tej', 'paczki'], 2,
        t('У мене є квитанція про відправлення цієї посилки.', 'У меня есть квитанция об отправке этой посылки.', 'I have proof of posting for this parcel.'),
        t('Потвердження чого — родовий: potwierdzenie **nadania**.', 'Подтверждение чего — родительный: potwierdzenie **nadania**.', 'Genitive: **nadania**.')),
      build('register.post', 'Domagam się odszkodowania za utratę przesyłki', t('Я вимагаю відшкодування за втрату посилки', 'Я требую возмещения за утрату посылки', 'I’m claiming compensation for the lost parcel'), ['odszkodowanie', 'utratą'], [],
        t('**Domagać się** + родовий; **za** + знахідний: za **utratę**.', '**Domagać się** + родительный; **za** + винительный: za **utratę**.', '**Domagać się** + genitive; **za utratę**.')),
      match('register.post', [
        ['potwierdzenie nadania', t('квитанція про відправлення', 'квитанция об отправке', 'proof of posting')],
        ['numer nadawczy', t('номер відправлення', 'номер отправления', 'tracking number')],
        ['awizo powtórne', t('повторне повідомлення', 'повторное извещение', 'second notice')],
        ['zwrot do nadawcy', t('повернення відправникові', 'возврат отправителю', 'return to sender')],
      ]),
    ],
  },
};

// ───────────────────────────── lub-6-bank: Банк (урок B1) ─────────────────────────────
const LUB6: LessonLevels = {
  B2: {
    explanation: t(
      'Кредит і регулярні платежі:\n• **zdolność kredytowa** — кредитоспроможність; **oprocentowanie** — відсоткова ставка; **prowizja** — комісія; **RRSO** — реальна річна ставка;\n• рата — **stała / malejąca** (рівна / спадна); **wcześniejsza spłata** — дострокове погашення;\n• автоплатіж — **zlecenie stałe**; рахунок **zostanie obciążony** kwotą… (з рахунку спишуть);\n• **w wysokości** + родовий — у розмірі: prowizja **w wysokości** 2 procent.',
      'Кредит и регулярные платежи:\n• **zdolność kredytowa** — кредитоспособность; **oprocentowanie** — процентная ставка; **prowizja** — комиссия; **RRSO** — реальная годовая ставка;\n• взнос — **stała / malejąca** (равный / убывающий); **wcześniejsza spłata** — досрочное погашение;\n• автоплатёж — **zlecenie stałe**; счёт **zostanie obciążony** kwotą… (со счёта спишут);\n• **w wysokości** + родительный — в размере: prowizja **w wysokości** 2 procent.',
      'Loans and regular payments:\n• **zdolność kredytowa** — creditworthiness; **oprocentowanie** — interest rate; **prowizja** — fee; **RRSO** — APR;\n• instalments — **stała / malejąca** (fixed / decreasing); **wcześniejsza spłata** — early repayment;\n• standing order — **zlecenie stałe**; the account **zostanie obciążony** kwotą… (will be debited);\n• **w wysokości** + genitive — in the amount of: prowizja **w wysokości** 2 procent.',
    ),
    examples: [
      { pl: 'Bank sprawdzi pana zdolność kredytową przed przyznaniem kredytu.', tr: t('Банк перевірить вашу кредитоспроможність перед наданням кредиту.', 'Банк проверит вашу кредитоспособность перед выдачей кредита.', 'The bank will check your creditworthiness before granting the loan.') },
      { pl: 'Ustawiłem zlecenie stałe na czynsz — co miesiąc rachunek zostanie obciążony kwotą 1800 zł.', tr: t('Я налаштував постійне доручення на оренду — щомісяця з рахунку списуватимуть 1800 злотих.', 'Я настроил постоянное поручение на аренду — каждый месяц со счёта будут списывать 1800 злотых.', 'I set up a standing order for rent — 1,800 złoty will be debited each month.') },
    ],
    exercises: [
      dialogue('dialogue.bank', DORADCA, [
        {
          npc: 'Jaki rodzaj raty pana interesuje?',
          tr: t('Який вид внеску вас цікавить?', 'Какой вид платежа вас интересует?', 'What type of instalment are you interested in?'),
          choose: [
            ['Wolałbym ratę stałą — łatwiej mi zaplanować wydatki.', t('Я б волів рівний внесок — мені легше планувати витрати.', 'Я бы предпочёл равный платёж — мне легче планировать расходы.', 'I’d prefer a fixed instalment — it’s easier to budget.')],
            ['Wolałbym raty stałej — łatwiej mi zaplanować wydatki.', t('(**woleć** + знахідний: **ratę stałą**)', '(**woleć** + винительный: **ratę stałą**)', '(**woleć** + accusative)')],
            ['Wolałbym ratę stałą — łatwiej mnie zaplanować wydatki.', t('(кому легше — давальний: **mi**)', '(кому легче — дательный: **mi**)', '(dative: **mi**)')],
          ],
          feedback: t('**Wolałbym ratę stałą**; **łatwiej mi**.', '**Wolałbym ratę stałą**; **łatwiej mi**.', '**Wolałbym ratę stałą**; **łatwiej mi**.'),
        },
        {
          npc: 'Dobrze. A czy planuje pan wcześniejszą spłatę?',
          tr: t('Добре. А чи плануєте ви дострокове погашення?', 'Хорошо. А планируете ли вы досрочное погашение?', 'Fine. And are you planning to repay early?'),
          choose: [
            ['Możliwe. Czy bank pobiera wtedy prowizję?', t('Можливо. Чи бере тоді банк комісію?', 'Возможно. Берёт ли тогда банк комиссию?', 'Possibly. Does the bank charge a fee for that?')],
            ['Możliwe. Czy bank pobiera wtedy prowizji?', t('(**pobierać** + знахідний: **prowizję**)', '(**pobierać** + винительный: **prowizję**)', '(**pobierać** + accusative)')],
            ['Możliwe. Czy bank pobiera się wtedy prowizję?', t('(**pobierać** — без «się»)', '(**pobierać** — без «się»)', '(no «się»)')],
          ],
          feedback: t('**Pobierać prowizję**.', '**Pobierać prowizję**.', '**Pobierać prowizję**.'),
        },
      ]),
      fillGap('register.bank', 'Kredyt zostanie spłacony ___ czterdziestu ośmiu ratach.', ['w', 'na', 'z', 'przez'],
        t('Кредит буде погашено сорока вісьмома внесками.', 'Кредит будет погашен сорока восемью платежами.', 'The loan will be repaid in forty-eight instalments.'),
        t('Частинами — **w ratach** (місцевий); «na raty» — лише «купити на виплат».', 'Частями — **w ratach** (предложный); «na raty» — только «купить в рассрочку».', 'In instalments — **w ratach**; «na raty» is “on credit”.')),
      fillGap('register.bank', 'Rachunek zostanie ___ kwotą 250 zł.', ['obciążony', 'obciążona', 'obciążone', 'obciążył'],
        t('З рахунку спишуть 250 злотих.', 'Со счёта спишут 250 злотых.', 'The account will be debited 250 złoty.'),
        t('Rachunek — чоловічий рід: **zostanie obciążony**.', 'Rachunek — мужской род: **zostanie obciążony**.', 'Masculine: **obciążony**.')),
      fillGap('register.bank', 'Bank przyznał mi kredyt w ___ pięćdziesięciu tysięcy złotych.', ['wysokości', 'wysokość', 'wysokością', 'wysoko'],
        t('Банк надав мені кредит у розмірі п’ятдесяти тисяч злотих.', 'Банк предоставил мне кредит в размере пятидесяти тысяч злотых.', 'The bank granted me a loan of fifty thousand złoty.'),
        t('У розмірі — **w wysokości** + родовий.', 'В размере — **w wysokości** + родительный.', 'In the amount of — **w wysokości**.')),
      reading('reading.bank', 'Oferta kredytu: „Kwota: 30 000 zł, okres: 48 miesięcy, oprocentowanie stałe 8,9%, prowizja 0%. RRSO: 9,3%. Rata stała: 745 zł. Wcześniejsza spłata bez dodatkowych opłat. Warunek: przelew wynagrodzenia na konto w naszym banku”.',
        t('Яка умова кредиту?', 'Какое условие кредита?', 'What is the condition of the loan?'),
        [t('зарплата має надходити на рахунок у цьому банку', 'зарплата должна поступать на счёт в этом банке', 'salary must be paid into an account at this bank'), t('дострокове погашення платне', 'досрочное погашение платное', 'early repayment costs extra'), t('комісія становить 8,9 %', 'комиссия составляет 8,9 %', 'the fee is 8.9%')],
        t('«**Warunek: przelew wynagrodzenia na konto w naszym banku**»; дострокове погашення — «bez dodatkowych opłat».', '«**Warunek: przelew wynagrodzenia na konto w naszym banku**»; досрочное погашение — «bez dodatkowych opłat».', '“**Warunek: przelew wynagrodzenia**…”; early repayment is free.')),
      reverseChoice('register.bank', t('Я хотів би налаштувати постійне доручення на оплату оренди.', 'Я хотел бы настроить постоянное поручение на оплату аренды.', 'I’d like to set up a standing order for the rent.'),
        ['Chciałbym ustawić zlecenie stałe na opłatę czynszu.', 'Chciałbym ustawić zlecenia stałego na opłatę czynszu.', 'Chciałbym ustawić zlecenie stałe na opłatę czynsz.'],
        t('Налаштувати що — знахідний: **zlecenie stałe**; оплата чого — родовий: **czynszu**.', 'Настроить что — винительный: **zlecenie stałe**; оплата чего — родительный: **czynszu**.', 'Accusative **zlecenie**; genitive **czynszu**.')),
      findError('register.bank', ['Bank', 'sprawdzi', 'moją', 'zdolność', 'kredytowej'], 4,
        t('Банк перевірить мою кредитоспроможність.', 'Банк проверит мою кредитоспособность.', 'The bank will check my creditworthiness.'),
        t('Узгодження зі **zdolność** (знахідний): **kredytową**.', 'Согласование со **zdolność** (винительный): **kredytową**.', 'Agreement: **kredytową**.')),
      build('register.bank', 'Bank sprawdzi pana zdolność kredytową', t('Банк перевірить вашу кредитоспроможність', 'Банк проверит вашу кредитоспособность', 'The bank will check your creditworthiness'), ['kredytowa', 'panu'], [],
        t('**Sprawdzić** + знахідний: **zdolność kredytową**; чию — **pana** (родовий).', '**Sprawdzić** + винительный: **zdolność kredytową**; чью — **pana** (родительный).', 'Accusative **zdolność kredytową**.')),
      match('register.bank', [
        ['zdolność kredytowa', t('кредитоспроможність', 'кредитоспособность', 'creditworthiness')],
        ['oprocentowanie', t('відсоткова ставка', 'процентная ставка', 'interest rate')],
        ['zlecenie stałe', t('постійне доручення', 'постоянное поручение', 'standing order')],
        ['wcześniejsza spłata', t('дострокове погашення', 'досрочное погашение', 'early repayment')],
      ]),
    ],
  },
};

// ───────────────────────────── lub-7-umowa: Договір (урок B1) ─────────────────────────────
const LUB7: LessonLevels = {
  B2: {
    explanation: t(
      'Зміни до договору оренди:\n• **aneks do umowy** — додаткова угода; **niniejsza umowa / niniejszy aneks** — ця (дана) угода;\n• **kaucja zwrotna** — заставний депозит, який повертають;\n• **z zastrzeżeniem** + родовий — з урахуванням, за винятком: z zastrzeżeniem **§ 5**;\n• **ponosić koszty** + родовий — нести витрати: ponosi koszty **napraw**;\n• **w przypadku naruszenia postanowień umowy** — у разі порушення умов договору.',
      'Изменения в договор аренды:\n• **aneks do umowy** — дополнительное соглашение; **niniejsza umowa / niniejszy aneks** — настоящий договор;\n• **kaucja zwrotna** — возвратный залог;\n• **z zastrzeżeniem** + родительный — с учётом, за исключением: z zastrzeżeniem **§ 5**;\n• **ponosić koszty** + родительный — нести расходы: ponosi koszty **napraw**;\n• **w przypadku naruszenia postanowień umowy** — в случае нарушения условий договора.',
      'Amending a tenancy agreement:\n• **aneks do umowy** — an addendum; **niniejsza umowa / niniejszy aneks** — this agreement / addendum;\n• **kaucja zwrotna** — a refundable deposit;\n• **z zastrzeżeniem** + genitive — subject to: z zastrzeżeniem **§ 5**;\n• **ponosić koszty** + genitive — to bear the costs: ponosi koszty **napraw**;\n• **w przypadku naruszenia postanowień umowy** — in the event of a breach of the agreement.',
    ),
    examples: [
      { pl: 'Niniejszym aneksem strony zmieniają wysokość czynszu od 1 lipca.', tr: t('Цією додатковою угодою сторони змінюють розмір орендної плати з 1 липня.', 'Настоящим дополнительным соглашением стороны изменяют размер арендной платы с 1 июля.', 'By this addendum the parties change the rent as of 1 July.') },
      { pl: 'Kaucja zwrotna zostanie zwrócona w ciągu 30 dni od wyprowadzki, z zastrzeżeniem potrąceń za szkody.', tr: t('Заставу повернуть протягом 30 днів після виїзду, з урахуванням утримань за шкоду.', 'Залог вернут в течение 30 дней после выезда, с учётом удержаний за ущерб.', 'The deposit will be returned within 30 days of moving out, subject to deductions for damage.') },
    ],
    exercises: [
      dialogue('dialogue.contract', WYNAJMUJACA, [
        {
          npc: 'Od lipca podnoszę czynsz o sto złotych. Podpiszemy aneks?',
          tr: t('З липня я підвищую оренду на сто злотих. Підпишемо додаткову угоду?', 'С июля я повышаю аренду на сто злотых. Подпишем дополнительное соглашение?', 'From July I’m raising the rent by a hundred złoty. Shall we sign an addendum?'),
          choose: [
            ['Dobrze, ale proszę dopisać, kto ponosi koszty napraw.', t('Добре, але, будь ласка, допишіть, хто несе витрати на ремонт.', 'Хорошо, но, пожалуйста, допишите, кто несёт расходы на ремонт.', 'Fine, but please add who bears the cost of repairs.')],
            ['Dobrze, ale proszę dopisać, kto ponosi kosztów napraw.', t('(**ponosić** + знахідний: **koszty**)', '(**ponosić** + винительный: **koszty**)', '(**ponosić** + accusative)')],
            ['Dobrze, ale proszę dopisać, kto ponosi koszty naprawy się.', t('(без «się»: koszty **napraw**)', '(без «się»: koszty **napraw**)', '(no «się»)')],
          ],
          feedback: t('**Ponosić koszty napraw**.', '**Ponosić koszty napraw**.', '**Ponosić koszty napraw**.'),
        },
        {
          npc: 'Naprawy drobne — pan, większe — ja. A kaucja zostaje bez zmian.',
          tr: t('Дрібний ремонт — ви, більший — я. А застава лишається без змін.', 'Мелкий ремонт — вы, крупный — я. А залог остаётся без изменений.', 'Minor repairs are yours, major ones mine. The deposit stays the same.'),
          choose: [
            ['Rozumiem. Kaucja zwrotna, z zastrzeżeniem potrąceń za szkody.', t('Зрозуміло. Застава повертається, з урахуванням утримань за шкоду.', 'Понятно. Залог возвратный, с учётом удержаний за ущерб.', 'Understood. A refundable deposit, subject to deductions for damage.')],
            ['Rozumiem. Kaucja zwrotna, z zastrzeżeniem potrącenia za szkodami.', t('(**za** + знахідний: za **szkody**)', '(**za** + винительный: za **szkody**)', '(**za** + accusative)')],
            ['Rozumiem. Kaucja zwrotna, z zastrzeżenie potrąceń za szkody.', t('(стала формула — **z zastrzeżeniem**, орудний)', '(устойчивая формула — **z zastrzeżeniem**, творительный)', '(set phrase: **z zastrzeżeniem**)')],
          ],
          feedback: t('**Z zastrzeżeniem** + родовий.', '**Z zastrzeżeniem** + родительный.', '**Z zastrzeżeniem** + genitive.'),
        },
      ]),
      fillGap('register.lease', '___ aneksem strony zmieniają wysokość czynszu.', ['Niniejszym', 'Niniejszy', 'Niniejszego', 'Niniejsza'],
        t('Цією додатковою угодою сторони змінюють розмір оренди.', 'Настоящим соглашением стороны изменяют размер арендной платы.', 'By this addendum the parties change the rent.'),
        t('Чим — орудний: **niniejszym** aneksem.', 'Чем — творительный: **niniejszym** aneksem.', 'Instrumental: **niniejszym**.')),
      fillGap('register.lease', 'W przypadku ___ postanowień umowy wynajmujący może ją wypowiedzieć.', ['naruszenia', 'naruszenie', 'naruszeniem', 'naruszyć'],
        t('У разі порушення умов договору орендодавець може його розірвати.', 'В случае нарушения условий договора арендодатель может его расторгнуть.', 'If the terms are breached, the landlord may terminate the agreement.'),
        t('**W przypadku** + родовий: **naruszenia**.', '**W przypadku** + родительный: **naruszenia**.', '**W przypadku** + genitive.')),
      fillGap('register.lease', 'Najemca ponosi koszty ___ napraw.', ['drobnych', 'drobne', 'drobnymi', 'drobnym'],
        t('Орендар несе витрати на дрібний ремонт.', 'Арендатор несёт расходы на мелкий ремонт.', 'The tenant bears the cost of minor repairs.'),
        t('Витрати чого — родовий множини: **drobnych** napraw.', 'Расходы чего — родительный множественного: **drobnych** napraw.', 'Genitive plural: **drobnych**.')),
      reading('reading.lease', 'Aneks nr 1: „§ 1. Z dniem 1 lipca 2027 r. czynsz wynosi 2100 zł miesięcznie. § 2. Najemca ponosi koszty drobnych napraw, z zastrzeżeniem napraw wynikających z normalnego zużycia. § 3. Pozostałe postanowienia umowy pozostają bez zmian”.',
        t('За які ремонти орендар НЕ платить?', 'За какой ремонт арендатор НЕ платит?', 'Which repairs does the tenant NOT pay for?'),
        [t('за ті, що виникли через звичайне зношення', 'за те, что возникли из-за обычного износа', 'those caused by normal wear and tear'), t('за всі дрібні ремонти', 'за весь мелкий ремонт', 'all minor repairs'), t('за ремонти після 1 липня', 'за ремонт после 1 июля', 'repairs after 1 July')],
        t('«koszty drobnych napraw, **z zastrzeżeniem napraw wynikających z normalnego zużycia**» — це виняток.', '«koszty drobnych napraw, **z zastrzeżeniem napraw wynikających z normalnego zużycia**» — это исключение.', '“**z zastrzeżeniem napraw wynikających z normalnego zużycia**” — the exception.')),
      reverseChoice('register.lease', t('Решта умов договору залишаються без змін.', 'Остальные условия договора остаются без изменений.', 'The remaining terms stay unchanged.'),
        ['Pozostałe postanowienia umowy pozostają bez zmian.', 'Pozostałe postanowienia umowy pozostają bez zmiany się.', 'Pozostałe postanowienia umowy pozostaje bez zmian.'],
        t('Postanowienia — множина: **pozostają**; стала формула — **bez zmian**.', 'Postanowienia — множественное: **pozostają**; устойчивая формула — **bez zmian**.', 'Plural **pozostają**; **bez zmian**.')),
      findError('register.lease', ['Kaucja', 'zostanie', 'zwrócony', 'w', 'ciągu', 'miesiąca'], 2,
        t('Заставу повернуть протягом місяця.', 'Залог вернут в течение месяца.', 'The deposit will be returned within a month.'),
        t('Kaucja — жіночий рід: **zwrócona**.', 'Kaucja — женский род: **zwrócona**.', 'Kaucja is feminine: **zwrócona**.')),
      build('register.lease', 'Najemca ponosi koszty drobnych napraw', t('Орендар несе витрати на дрібний ремонт', 'Арендатор несёт расходы на мелкий ремонт', 'The tenant bears the cost of minor repairs'), ['kosztów', 'drobne'], [],
        t('**Ponosić** + знахідний: **koszty**; чого — родовий: **drobnych napraw**.', '**Ponosić** + винительный: **koszty**; чего — родительный: **drobnych napraw**.', 'Accusative **koszty**; genitive **drobnych napraw**.')),
      match('register.lease', [
        ['aneks do umowy', t('додаткова угода', 'дополнительное соглашение', 'addendum')],
        ['kaucja zwrotna', t('заставний депозит', 'возвратный залог', 'refundable deposit')],
        ['z zastrzeżeniem', t('з урахуванням, за винятком', 'с учётом, за исключением', 'subject to')],
        ['niniejsza umowa', t('цей договір', 'настоящий договор', 'this agreement')],
      ]),
    ],
  },
};

// ───────────────────────────── lub-8-unia: Люблінська унія (урок B1) ─────────────────────────────
const LUB8: LessonLevels = {
  B2: {
    explanation: t(
      'Історична розповідь книжною мовою:\n• **zawarta** 1 lipca 1569 roku — укладена (дієприкметник); **przekształcić** + знахідний **w** + знахідний: przekształciła unię personalną **w realną**;\n• **wspólny / odrębny** — спільний / окремий: wspólny król i sejm, **odrębne** wojsko i skarb;\n• **na mocy** + родовий — на підставі: na mocy unii powstała Rzeczpospolita Obojga Narodów;\n• **upamiętniać** + знахідний — увічнювати пам’ять: pomnik **upamiętnia** unię.',
      'Историческое повествование книжным языком:\n• **zawarta** 1 lipca 1569 roku — заключённая (причастие); **przekształcić** + винительный **w** + винительный: przekształciła unię personalną **w realną**;\n• **wspólny / odrębny** — общий / отдельный: wspólny król i sejm, **odrębne** wojsko i skarb;\n• **na mocy** + родительный — на основании: na mocy unii powstała Rzeczpospolita Obojga Narodów;\n• **upamiętniać** + винительный — увековечивать: pomnik **upamiętnia** unię.',
      'Historical narrative in a formal register:\n• **zawarta** 1 lipca 1569 roku — concluded (participle); **przekształcić** + accusative **w** + accusative: przekształciła unię personalną **w realną**;\n• **wspólny / odrębny** — shared / separate: wspólny król i sejm, **odrębne** wojsko i skarb;\n• **na mocy** + genitive — under: na mocy unii powstała Rzeczpospolita Obojga Narodów;\n• **upamiętniać** + accusative — to commemorate: pomnik **upamiętnia** unię.',
    ),
    examples: [
      { pl: 'Unia lubelska, zawarta 1 lipca 1569 roku, przekształciła unię personalną w realną.', tr: t('Люблінська унія, укладена 1 липня 1569 року, перетворила персональну унію на реальну.', 'Люблинская уния, заключённая 1 июля 1569 года, превратила личную унию в реальную.', 'The Union of Lublin, concluded on 1 July 1569, turned a personal union into a real one.') },
      { pl: 'Oba państwa miały wspólnego króla i sejm, ale odrębne wojsko i skarb.', tr: t('Обидві держави мали спільного короля й сейм, але окремі військо й скарбницю.', 'Оба государства имели общего короля и сейм, но отдельные войско и казну.', 'Both states had a shared king and parliament but separate armies and treasuries.') },
    ],
    exercises: [
      dialogue('dialogue.history', PRZEWODNICZKA, [
        {
          npc: 'Stoimy na placu Litewskim. Co upamiętnia ten pomnik?',
          tr: t('Ми стоїмо на Литовській площі. Що увічнює цей пам’ятник?', 'Мы стоим на Литовской площади. Что увековечивает этот памятник?', 'We’re on Lithuanian Square. What does this monument commemorate?'),
          choose: [
            ['Unię lubelską, zawartą w 1569 roku.', t('Люблінську унію, укладену 1569 року.', 'Люблинскую унию, заключённую в 1569 году.', 'The Union of Lublin, concluded in 1569.')],
            ['Unii lubelskiej, zawartej w 1569 roku.', t('(**upamiętniać** + знахідний: **unię**)', '(**upamiętniać** + винительный: **unię**)', '(**upamiętniać** + accusative)')],
            ['Unię lubelską, zawarty w 1569 roku.', t('(дієприкметник узгоджується з unię: **zawartą**)', '(причастие согласуется с unię: **zawartą**)', '(agreement: **zawartą**)')],
          ],
          feedback: t('**Upamiętnia unię lubelską, zawartą…**', '**Upamiętnia unię lubelską, zawartą…**', '**Unię lubelską, zawartą…**'),
        },
        {
          npc: 'Świetnie. A co zmieniła unia?',
          tr: t('Чудово. А що змінила унія?', 'Отлично. А что изменила уния?', 'Excellent. And what did the union change?'),
          choose: [
            ['Na mocy unii powstała Rzeczpospolita Obojga Narodów.', t('На підставі унії постала Річ Посполита Обох Народів.', 'На основании унии возникла Речь Посполитая Обоих Народов.', 'Under the union, the Polish–Lithuanian Commonwealth was created.')],
            ['Na mocy unię powstała Rzeczpospolita Obojga Narodów.', t('(**na mocy** + родовий: **unii**)', '(**na mocy** + родительный: **unii**)', '(**na mocy** + genitive)')],
            ['Na mocy unii powstał Rzeczpospolita Obojga Narodów.', t('(Rzeczpospolita — жіночий рід: **powstała**)', '(Rzeczpospolita — женский род: **powstała**)', '(feminine: **powstała**)')],
          ],
          feedback: t('**Na mocy unii powstała…**', '**Na mocy unii powstała…**', '**Na mocy unii powstała…**'),
        },
      ]),
      fillGap('register.history', 'Unia przekształciła związek obu państw ___ unię realną.', ['w', 'na', 'do', 'z'],
        t('Унія перетворила союз обох держав на реальну унію.', 'Уния превратила союз обоих государств в реальную унию.', 'The union turned the bond between the two states into a real union.'),
        t('**Przekształcić w** + знахідний.', '**Przekształcić w** + винительный.', '**Przekształcić w** + accusative.')),
      fillGap('register.history', 'Polska i Litwa miały wspólnego króla, ale ___ wojsko.', ['odrębne', 'odrębny', 'odrębnego', 'odrębną'],
        t('Польща й Литва мали спільного короля, але окреме військо.', 'Польша и Литва имели общего короля, но отдельное войско.', 'Poland and Lithuania shared a king but had separate armies.'),
        t('Wojsko — середній рід, знахідний: **odrębne**.', 'Wojsko — средний род, винительный: **odrębne**.', 'Neuter accusative: **odrębne**.')),
      fillGap('register.history', 'Pomnik na placu Litewskim ___ zawarcie unii.', ['upamiętnia', 'upamiętnia się', 'pamięta', 'upamiętnieniu'],
        t('Пам’ятник на Литовській площі увічнює укладення унії.', 'Памятник на Литовской площади увековечивает заключение унии.', 'The monument on Lithuanian Square commemorates the union.'),
        t('**Upamiętniać** + знахідний, без «się».', '**Upamiętniać** + винительный, без «się».', '**Upamiętniać** + accusative.')),
      reading('reading.history', 'Z przewodnika: „Unia lubelska, zawarta 1 lipca 1569 roku, połączyła Koronę Polską i Wielkie Księstwo Litewskie. Oba państwa miały odtąd wspólnego monarchę, sejm i politykę zagraniczną, zachowały jednak odrębne wojsko, skarb i urzędy. Po zwiedzaniu Starego Miasta warto spróbować cebularza”.',
        t('Що обидві держави зберегли окремим?', 'Что оба государства сохранили отдельным?', 'What did the two states keep separate?'),
        [t('військо, скарбницю й урядові посади', 'войско, казну и должности', 'army, treasury and offices'), t('монарха й сейм', 'монарха и сейм', 'the monarch and parliament'), t('зовнішню політику', 'внешнюю политику', 'foreign policy')],
        t('«zachowały jednak **odrębne wojsko, skarb i urzędy**»; монарх, сейм і зовнішня політика — спільні.', '«zachowały jednak **odrębne wojsko, skarb i urzędy**»; монарх, сейм и внешняя политика — общие.', '“**odrębne wojsko, skarb i urzędy**”; the rest was shared.')),
      reverseChoice('register.history', t('Унію уклали на сеймі в Любліні.', 'Унию заключили на сейме в Люблине.', 'The union was concluded at the parliament in Lublin.'),
        ['Unię zawarto na sejmie w Lublinie.', 'Unię zawarto w sejmie w Lublinie.', 'Unia zawarto na sejmie w Lublinie.'],
        t('Безособово **zawarto** + знахідний: **unię**; на сеймі — **na sejmie**.', 'Безлично **zawarto** + винительный: **unię**; на сейме — **na sejmie**.', 'Impersonal **zawarto** + accusative; **na sejmie**.')),
      findError('register.history', ['Na', 'mocy', 'unia', 'powstało', 'jedno', 'państwo'], 2,
        t('На підставі унії постала одна держава.', 'На основании унии возникло одно государство.', 'Under the union a single state was formed.'),
        t('**Na mocy** + родовий: **unii**.', '**Na mocy** + родительный: **unii**.', '**Na mocy** + genitive.')),
      build('register.history', 'Oba państwa miały wspólnego króla i sejm', t('Обидві держави мали спільного короля й сейм', 'Оба государства имели общего короля и сейм', 'Both states had a shared king and parliament'), ['wspólny', 'królem'], [],
        t('**Mieć** + знахідний (особова чоловіча — як родовий): **wspólnego króla**.', '**Mieć** + винительный (мужско-личный — как родительный): **wspólnego króla**.', 'Accusative (animate): **wspólnego króla**.')),
      match('register.history', [
        ['zawrzeć unię', t('укласти унію', 'заключить унию', 'to conclude a union')],
        ['odrębny', t('окремий', 'отдельный', 'separate')],
        ['na mocy', t('на підставі', 'на основании', 'under (by virtue of)')],
        ['cebularz', t('цебуляж (люблінський корж із цибулею)', 'цебуляж (люблинская лепёшка с луком)', 'cebularz (Lublin onion flatbread)')],
      ]),
    ],
  },
};

// ───────────────────────────── lub-boss: Іспит Любліна (бос B1) ─────────────────────────────
const LUBBOSS: LessonLevels = {
  B2: {
    explanation: t(
      'Повторення Любліна (B2):\n• установа — **wnieść odwołanie od decyzji**, **upoważnić do** + родовий, **wnoszę o** + знахідний, **braki formalne**;\n• терміни — **w terminie do dnia**, **nie później niż**, **po upływie** + родовий, **przywrócić termin**;\n• побут — **ubiegać się o**, **spełniać warunki**, **tytuł prawny do lokalu**;\n• пошта й банк — **przesyłka zaginęła**, **odszkodowanie za utratę**, **zdolność kredytowa**, **zlecenie stałe**;\n• договір та історія — **aneks**, **z zastrzeżeniem**, **ponosić koszty**, **na mocy** + родовий, **zawarto**.',
      'Повторение Люблина (B2):\n• учреждение — **wnieść odwołanie od decyzji**, **upoważnić do** + родительный, **wnoszę o** + винительный, **braki formalne**;\n• сроки — **w terminie do dnia**, **nie później niż**, **po upływie** + родительный, **przywrócić termin**;\n• пребывание — **ubiegać się o**, **spełniać warunki**, **tytuł prawny do lokalu**;\n• почта и банк — **przesyłka zaginęła**, **odszkodowanie za utratę**, **zdolność kredytowa**, **zlecenie stałe**;\n• договор и история — **aneks**, **z zastrzeżeniem**, **ponosić koszty**, **na mocy** + родительный, **zawarto**.',
      'Lublin review (B2):\n• offices — **wnieść odwołanie od decyzji**, **upoważnić do** + genitive, **wnoszę o** + accusative, **braki formalne**;\n• deadlines — **w terminie do dnia**, **nie później niż**, **po upływie** + genitive, **przywrócić termin**;\n• residence — **ubiegać się o**, **spełniać warunki**, **tytuł prawny do lokalu**;\n• post and bank — **przesyłka zaginęła**, **odszkodowanie za utratę**, **zdolność kredytowa**, **zlecenie stałe**;\n• contracts and history — **aneks**, **z zastrzeżeniem**, **ponosić koszty**, **na mocy** + genitive, **zawarto**.',
    ),
    examples: [
      { pl: 'Wnoszę o przywrócenie terminu, ponieważ przebywałem w szpitalu.', tr: t('Прошу поновити термін, оскільки я перебував у лікарні.', 'Прошу восстановить срок, поскольку я находился в больнице.', 'I request reinstatement of the deadline as I was in hospital.') },
      { pl: 'Po upływie terminu przesyłka została zwrócona do nadawcy.', tr: t('Після спливання терміну посилку повернули відправникові.', 'По истечении срока посылку вернули отправителю.', 'After the deadline the parcel was returned to the sender.') },
    ],
    exercises: [
      fillGap('vocab.boss', 'Od decyzji przysługuje ___ do wojewody.', ['odwołanie', 'odwołania', 'odwołaniem', 'odwołać'],
        t('Рішення можна оскаржити до воєводи.', 'Решение можно обжаловать у воеводы.', 'The decision can be appealed to the voivode.'),
        t('Що належить — називний: **odwołanie** (przysługuje).', 'Что положено — именительный: **odwołanie** (przysługuje).', 'Nominative subject: **odwołanie**.')),
      fillGap('vocab.boss', 'Wniosek należy złożyć nie później ___ do końca miesiąca.', ['niż', 'jak', 'od', 'aż'],
        t('Заяву слід подати не пізніше кінця місяця.', 'Заявление следует подать не позднее конца месяца.', 'The application must be submitted by the end of the month.'),
        t('Формула — **nie później niż**.', 'Формула — **nie później niż**.', 'Formula: **nie później niż**.')),
      fillGap('vocab.boss', 'Każdego miesiąca rachunek zostanie obciążony kwotą ___ czynszu.', ['czynszu', 'czynsz', 'czynszem', 'czynszowi'],
        t('Щомісяця з рахунку списуватимуть суму оренди.', 'Каждый месяц со счёта будут списывать сумму аренды.', 'Each month the account will be debited the rent.'),
        t('Сума чого — родовий: kwotą **czynszu**.', 'Сумма чего — родительный: kwotą **czynszu**.', 'Genitive: **czynszu**.')),
      reverseChoice('vocab.boss', t('Я клопочу про дозвіл на тимчасовий побут.', 'Я хлопочу о разрешении на временное пребывание.', 'I’m applying for a temporary residence permit.'),
        ['Ubiegam się o zezwolenie na pobyt czasowy.', 'Ubiegam się o zezwolenia na pobyt czasowy.', 'Ubiegam się na zezwolenie na pobyt czasowy.'],
        t('**Ubiegać się o** + знахідний: o **zezwolenie**.', '**Ubiegać się o** + винительный: o **zezwolenie**.', '**Ubiegać się o** + accusative.')),
      reading('reading.boss', 'Bobek pisze do pani Jolanty: „Szanowna Pani, w nawiązaniu do wezwania z dnia 2 marca dołączam brakujące zdjęcie i podpisany formularz. Wnoszę jednocześnie o przywrócenie terminu, ponieważ wezwanie zostało doręczone dopiero po upływie siedmiu dni — przesyłka zaginęła na poczcie. Z poważaniem, Bobek”.',
        t('Чому Бобек просить поновити термін?', 'Почему Бобек просит восстановить срок?', 'Why does Bobek ask for the deadline to be reinstated?'),
        [t('бо виклик доставили лише після спливання терміну', 'потому что требование доставили только по истечении срока', 'because the request was delivered only after the deadline'), t('бо він був у лікарні', 'потому что он был в больнице', 'because he was in hospital'), t('бо не мав фотографії', 'потому что у него не было фотографии', 'because he had no photo')],
        t('«wezwanie zostało **doręczone dopiero po upływie siedmiu dni** — przesyłka zaginęła na poczcie».', '«wezwanie zostało **doręczone dopiero po upływie siedmiu dni** — przesyłka zaginęła na poczcie».', '“**doręczone dopiero po upływie siedmiu dni**”.')),
      dialogue('dialogue.boss', URZEDNICZKA, [
        {
          npc: 'W czym mogę pomóc?',
          tr: t('Чим можу допомогти?', 'Чем могу помочь?', 'How can I help?'),
          choose: [
            ['Chciałabym upoważnić męża do odbioru karty pobytu.', t('Я хотіла б уповноважити чоловіка отримати карту побуту.', 'Я хотела бы уполномочить мужа получить карту побыту.', 'I’d like to authorise my husband to collect my residence card.')],
            ['Chciałabym upoważnić męża na odbiór karty pobytu.', t('(**upoważnić do** + родовий: **do odbioru**)', '(**upoważnić do** + родительный: **do odbioru**)', '(**upoważnić do** + genitive)')],
            ['Chciałabym upoważnić mężowi do odbioru karty pobytu.', t('(кого — знахідний: **męża**)', '(кого — винительный: **męża**)', '(accusative: **męża**)')],
          ],
          feedback: t('**Upoważnić kogoś do** + родовий.', '**Upoważnić kogoś do** + родительный.', '**Upoważnić kogoś do** + genitive.'),
        },
        {
          npc: 'Proszę wypełnić pełnomocnictwo. Czy coś jeszcze?',
          tr: t('Будь ласка, заповніть довіреність. Щось іще?', 'Пожалуйста, заполните доверенность. Что-нибудь ещё?', 'Please fill in the power of attorney. Anything else?'),
          choose: [
            ['Tak, wnoszę o wydanie zaświadczenia o zameldowaniu.', t('Так, прошу видати довідку про реєстрацію.', 'Да, прошу выдать справку о регистрации.', 'Yes, I request a certificate of registration.')],
            ['Tak, wnoszę o wydania zaświadczenia o zameldowaniu.', t('(**wnosić o** + знахідний: **wydanie**)', '(**wnosić o** + винительный: **wydanie**)', '(**wnosić o** + accusative)')],
            ['Tak, wnoszę o wydanie zaświadczenia o zameldowanie.', t('(**o** + місцевий: o **zameldowaniu**)', '(**o** + предложный: o **zameldowaniu**)', '(**o** + locative)')],
          ],
          feedback: t('**Wnoszę o wydanie zaświadczenia o zameldowaniu**.', '**Wnoszę o wydanie zaświadczenia o zameldowaniu**.', '**Wnoszę o wydanie…**'),
        },
      ]),
      findError('vocab.boss', ['Najemca', 'ponosi', 'kosztów', 'drobnych', 'napraw'], 2,
        t('Орендар несе витрати на дрібний ремонт.', 'Арендатор несёт расходы на мелкий ремонт.', 'The tenant bears the cost of minor repairs.'),
        t('**Ponosić** + знахідний: **koszty**.', '**Ponosić** + винительный: **koszty**.', '**Ponosić** + accusative.')),
      build('vocab.boss', 'Po upływie terminu przesyłka wróciła do nadawcy', t('Після спливання терміну посилка повернулася до відправника', 'По истечении срока посылка вернулась к отправителю', 'After the deadline the parcel went back to the sender'), ['upływ', 'nadawcą'], [],
        t('**Po upływie** + родовий; **do nadawcy**.', '**Po upływie** + родительный; **do nadawcy**.', '**Po upływie**; **do nadawcy**.')),
      match('vocab.boss', [
        ['wnoszę o', t('прошу (офіційно)', 'прошу (официально)', 'I request')],
        ['braki formalne', t('формальні недоліки', 'формальные недочёты', 'missing formal items')],
        ['zlecenie stałe', t('постійне доручення', 'постоянное поручение', 'standing order')],
        ['na mocy', t('на підставі', 'на основании', 'under')],
      ]),
    ],
  },
};

export const LUBLIN_LEVELS: Record<string, LessonLevels> = {
  'lub-1-sprawa': LUB1,
  'lub-2-wniosek': LUB2,
  'lub-3-dane': LUB3,
  'lub-4-pobyt': LUB4,
  'lub-5-poczta': LUB5,
  'lub-6-bank': LUB6,
  'lub-7-umowa': LUB7,
  'lub-8-unia': LUB8,
  'lub-boss': LUBBOSS,
};

/**
 * Rzeszów — B2: «Державні послуги». Лікар і NFZ (skierowanie do specjalisty, e-recepta, refundacja, mieć prawo do + родовий, za trzy miesiące),
 * ZUS і допомога (przysługiwać + давальний, ubiegać się o + знахідний, пасив zostanie wypłacony vs będzie wypłacany), річна податкова
 * декларація (іменники від дієслів: złożenie zeznania; zostało złożone), школа й дитсадок (непряма мова: powiedział, że…; poprosił, żebym…;
 * zapytał, czy…), штрафи й паркування (zostać ukarany mandatem, przekroczyć o + знахідний), поліція (skradziono mi, nie widziałem żadnego…),
 * рекламація й права споживача (gdyby + минулий, chyba że, o ile), Жешув (Dolina Lotnicza, Podziemna Trasa, miasto, w którym…).
 * Правила якості — docs/EXERCISE_QUALITY.md: у шагах діалогу по три варіанти, неправильні варіанти — різної природи.
 * Словник — vocab-rzeszow.ts. Тест — new-cities.test.ts. Уроки 5–8 й іспит — rzeszow-5-8.ts.
 */
import { t, wordChoice, fillGap, listen, findError, oddOne, reading, translate, grammar, build, match, speak, dialogue } from './builders';
import type { CityContent, LessonSeed } from './types';
import { RZE_5_8, RZE_BOSS } from './rzeszow-5-8';

const REJESTRATORKA = { name: 'Pani Halina', emoji: '👩🏼‍⚕️', role: t('працівниця реєстратури', 'сотрудница регистратуры', 'a receptionist at the clinic') };
const ZUS = { name: 'Pani Barbara', emoji: '👩🏻‍💼', role: t('працівниця ZUS', 'сотрудница ZUS', 'a ZUS clerk') };
const SKARBOWY = { name: 'Pani Krystyna', emoji: '👩🏽‍💼', role: t('працівниця податкової інспекції', 'сотрудница налоговой инспекции', 'a tax office clerk') };
const WYCHOWAWCA = { name: 'Pan Piotr', emoji: '👨🏼‍🏫', role: t('класний керівник', 'классный руководитель', 'a form tutor') };

const RZE_1: LessonSeed = {
  slug: 'rze-1-przychodnia',
  title: t('Лікар і NFZ', 'Врач и NFZ', 'The doctor and the NFZ'),
  topic: t(
    'Skierowanie do specjalisty, e-recepta, refundacja; mieć prawo do + родовий; termin za trzy miesiące, w trybie pilnym',
    'Skierowanie do specjalisty, e-recepta, refundacja; mieć prawo do + родительный; termin za trzy miesiące, w trybie pilnym',
    'Skierowanie do specjalisty, e-recepta, refundacja; mieć prawo do + genitive; termin za trzy miesiące, w trybie pilnym',
  ),
  cefr: 'B2',
  difficulty: 4,
  explanation: t(
    '**Мета:** розібратися в польській системі охорони здоров’я: направлення, рецепт, строки.\nСпершу йдуть до **lekarza rodzinnego** (сімейного лікаря): він видає **skierowanie do specjalisty** (**do** + родовий). Рецепти електронні: **e-recepta** — код приходить в SMS. Візити оплачує **NFZ**, якщо є **ubezpieczenie zdrowotne**; препарат, **objęty refundacją**, коштує дешевше.\n**Mieć prawo do** + родовий: **mam prawo do bezpłatnej opieki**. Строки: **za trzy miesiące** (**za** + знахідний — «через»), **w ciągu tygodnia** («протягом»), **w trybie pilnym** («терміново», **w** + місцевий).',
    '**Цель:** разобраться в польской системе здравоохранения: направление, рецепт, сроки.\nСначала идут к **lekarzowi rodzinnemu** (семейному врачу): он выдаёт **skierowanie do specjalisty** (**do** + родительный). Рецепты электронные: **e-recepta** — код приходит в SMS. Приёмы оплачивает **NFZ**, если есть **ubezpieczenie zdrowotne**; препарат, **objęty refundacją**, стоит дешевле.\n**Mieć prawo do** + родительный: **mam prawo do bezpłatnej opieki**. Сроки: **za trzy miesiące** (**za** + винительный — «через»), **w ciągu tygodnia** («в течение»), **w trybie pilnym** («срочно», **w** + предложный).',
    '**Goal:** find your way around the Polish health system: referral, prescription, waiting times.\nYou start with **lekarz rodzinny** (the family doctor), who issues a **skierowanie do specjalisty** (**do** + genitive). Prescriptions are electronic: an **e-recepta** arrives as a code by text message. The **NFZ** pays for visits if you have **ubezpieczenie zdrowotne**; a medicine **objęty refundacją** is cheaper.\n**Mieć prawo do** + genitive: **mam prawo do bezpłatnej opieki**. Time: **za trzy miesiące** (**za** + accusative, “in three months”), **w ciągu tygodnia** (“within a week”), **w trybie pilnym** (“as an urgent case”, **w** + locative).',
  ),
  examples: [
    { pl: 'Lekarz rodzinny wystawił mi skierowanie do specjalisty.', tr: t('Сімейний лікар виписав мені направлення до спеціаліста.', 'Семейный врач выписал мне направление к специалисту.', 'My family doctor gave me a referral to a specialist.') },
    { pl: 'Mam prawo do bezpłatnej opieki medycznej, bo mam ubezpieczenie zdrowotne.', tr: t('Я маю право на безкоштовну медичну допомогу, бо маю медичне страхування.', 'Я имею право на бесплатную медицинскую помощь, потому что у меня есть медицинская страховка.', 'I am entitled to free medical care because I have health insurance.') },
  ],
  words: ['specjalista', 'ubezpieczenie zdrowotne', 'e-recepta', 'refundacja', 'pilny', 'lekarz rodzinny'],
  exercises: [
    dialogue('dialogue.przychodnia', REJESTRATORKA, [
      {
        npc: 'Dzień dobry. Czy ma pan skierowanie do kardiologa?',
        tr: t('Добрий день. У вас є направлення до кардіолога?', 'Добрый день. У вас есть направление к кардиологу?', 'Good morning. Do you have a referral to a cardiologist?'),
        choose: [
          ['Tak, lekarz rodzinny wystawił mi skierowanie w zeszłym tygodniu.', t('Так, сімейний лікар виписав мені направлення минулого тижня.', 'Да, семейный врач выписал мне направление на прошлой неделе.', 'Yes, my family doctor gave me a referral last week.')],
          ['Tak, lekarz rodzinny wystawiłem mi skierowanie w zeszłym tygodniu.', t('(підмет — **lekarz**, тож **wystawił**, а не **wystawiłem**)', '(подлежащее — **lekarz**, значит **wystawił**, а не **wystawiłem**)', '(the subject is **lekarz**, so **wystawił**, not **wystawiłem**)')],
          ['Tak, lekarz rodzinny wystawił mnie skierowanie w zeszłym tygodniu.', t('(кому? — давальний: **mi**; **mnie** — знахідний/родовий)', '(кому? — дательный: **mi**; **mnie** — винительный/родительный)', '(to whom? — the dative **mi**; **mnie** is accusative/genitive)')],
        ],
        feedback: t('Підмет — **lekarz** → **wystawił**; кому? — давальний **mi**.', 'Подлежащее — **lekarz** → **wystawił**; кому? — дательный **mi**.', 'The subject is **lekarz** → **wystawił**; to whom? — the dative **mi**.'),
      },
      {
        npc: 'Najbliższy wolny termin jest za trzy miesiące. Czy to panu odpowiada?',
        tr: t('Найближчий вільний термін — через три місяці. Це вам підходить?', 'Ближайшее свободное время — через три месяца. Вам это подходит?', 'The next free appointment is in three months. Does that suit you?'),
        choose: [
          ['Trzy miesiące to za długo. Czy może mnie pani przyjąć w trybie pilnym?', t('Три місяці — надто довго. Чи може пані прийняти мене в терміновому порядку?', 'Три месяца — слишком долго. Может ли пани принять меня в срочном порядке?', 'Three months is too long. Could you see me as an urgent case?')],
          ['Trzy miesiące to za długo. Czy może mnie pani przyjąć w tryb pilny?', t('(**w** + місцевий: **w trybie pilnym**)', '(**w** + предложный: **w trybie pilnym**)', '(**w** takes the locative: **w trybie pilnym**)')],
          ['Trzy miesiące to za długo. Czy może mnie pani przyjmować w trybie pilnym?', t('(одноразове прийняття — доконаний вид: **przyjąć**)', '(однократный приём — совершенный вид: **przyjąć**)', '(a single appointment takes the perfective: **przyjąć**)')],
        ],
        feedback: t('**w trybie pilnym** — місцевий; одноразова дія — доконаний вид **przyjąć**.', '**w trybie pilnym** — предложный; однократное действие — совершенный вид **przyjąć**.', '**w trybie pilnym** — locative; a single action takes the perfective **przyjąć**.'),
      },
    ]),
    wordChoice('vocab.przychodnia', 'refundacja', [t('часткове відшкодування вартості ліків державою', 'частичное возмещение стоимости лекарств государством', 'partial state reimbursement of medicine costs'), t('рецепт на ліки', 'рецепт на лекарство', 'a prescription'), t('направлення до лікаря', 'направление к врачу', 'a referral')]),
    fillGap('grammar.przychodnia', 'Mam prawo ___ bezpłatnej opieki medycznej.', ['do', 'na', 'z'], t('Я маю право на безкоштовну медичну допомогу.', 'Я имею право на бесплатную медицинскую помощь.', 'I am entitled to free medical care.'),
      t('**mieć prawo do** + родовий: **do opieki**.', '**mieć prawo do** + родительный: **do opieki**.', '**mieć prawo do** + genitive: **do opieki**.')),
    match('vocab.przychodnia', [
      ['skierowanie', t('направлення', 'направление', 'referral')],
      ['e-recepta', t('електронний рецепт', 'электронный рецепт', 'electronic prescription')],
      ['ubezpieczenie zdrowotne', t('медичне страхування', 'медицинская страховка', 'health insurance')],
      ['w trybie pilnym', t('у терміновому порядку', 'в срочном порядке', 'as an urgent case')],
    ]),
    grammar('grammar.przychodnia', 'Mam skierowanie do ___.', 'specjalista', ['specjalisty'], t('У мене є направлення до спеціаліста.', 'У меня есть направление к специалисту.', 'I have a referral to a specialist.'),
      t('**do** + родовий: **do specjalisty**.', '**do** + родительный: **do specjalisty**.', '**do** + genitive: **do specjalisty**.')),
    listen('listening.przychodnia', 'Najbliższy wolny termin do kardiologa jest za trzy miesiące.', ['Najbliższy wolny termin do kardiologa jest za trzy miesiące.', 'Najbliższy wolny termin do kardiologa jest za trzy tygodnie.', 'Najbliższy wolny termin do kardiologa był trzy miesiące temu.']),
    reading('reading.przychodnia', 'Pacjent, który ma ubezpieczenie zdrowotne, może bezpłatnie skorzystać z opieki lekarza rodzinnego. Do większości specjalistów potrzebne jest skierowanie, ale nie do ginekologa, dentysty i psychiatry. Recepta jest dziś elektroniczna: pacjent dostaje czterocyfrowy kod w SMS-ie i podaje go w aptece razem z numerem PESEL. Wizytę w trybie pilnym można uzyskać, jeśli lekarz uzna, że pacjent wymaga szybkiej pomocy.',
      t('Do якого лікаря направлення не потрібне?', 'К какому врачу направление не нужно?', 'Which doctor can you see without a referral?'),
      [t('до стоматолога', 'к стоматологу', 'a dentist'), t('до кардіолога', 'к кардиологу', 'a cardiologist'), t('до ортопеда', 'к ортопеду', 'an orthopaedist')]),
    findError('grammar.przychodnia', ['Lekarz', 'rodzinny', 'wystawił', 'mnie', 'skierowanie', 'do', 'specjalisty'], 3, t('Сімейний лікар виписав мені направлення до спеціаліста.', 'Семейный врач выписал мне направление к специалисту.', 'My family doctor gave me a referral to a specialist.'),
      t('Кому? — давальний: **mi**.', 'Кому? — дательный: **mi**.', 'To whom? — the dative: **mi**.')),
    build('grammar.przychodnia', 'Mam prawo do bezpłatnej opieki medycznej', t('Я маю право на безкоштовну медичну допомогу', 'Я имею право на бесплатную медицинскую помощь', 'I have the right to free medical care'), ['bezpłatna', 'opiekę']),
    oddOne('grammar.przychodnia', ['za trzy miesiące', 'za dwa tygodnie', 'za godzinę', 'za tygodniu'], 3,
      t('**Za** («через») + знахідний: **za tydzień**.', '**Za** («через») + винительный: **za tydzień**.', '**Za** (“in”) + accusative: **za tydzień**.'),
      t('Яка фраза містить помилку?', 'Какое выражение содержит ошибку?', 'Which expression contains a mistake?')),
    translate('writing.przychodnia', t('Найближчий вільний термін — через три місяці. Мені потрібен візит у терміновому порядку.', 'Ближайшее свободное время — через три месяца. Мне нужен приём в срочном порядке.', 'The next free appointment is in three months. I need an urgent appointment.'),
      ['Najbliższy wolny termin jest za trzy miesiące. Potrzebuję wizyty w trybie pilnym.', 'Najbliższy wolny termin to za trzy miesiące. Potrzebuję wizyty w trybie pilnym.', 'Najbliższy wolny termin jest za trzy miesiące. Potrzebuję pilnej wizyty.']),
    speak('speaking.przychodnia', 'Lekarz rodzinny wystawił mi skierowanie do specjalisty i e-receptę.', t('Сімейний лікар виписав мені направлення до спеціаліста й е-рецепт.', 'Семейный врач выписал мне направление к специалисту и э-рецепт.', 'My family doctor gave me a referral to a specialist and an e-prescription.')),
  ],
};

const RZE_2: LessonSeed = {
  slug: 'rze-2-zus',
  title: t('ZUS і допомога', 'ZUS и пособия', 'ZUS and benefits'),
  topic: t(
    'Przysługiwać + давальний; ubiegać się o + знахідний; zasiłek chorobowy, składka; пасив: zostanie wypłacony (одноразово) i będzie wypłacany (регулярно)',
    'Przysługiwać + дательный; ubiegać się o + винительный; zasiłek chorobowy, składka; пассив: zostanie wypłacony (однократно) и będzie wypłacany (регулярно)',
    'Przysługiwać + dative; ubiegać się o + accusative; zasiłek chorobowy, składka; passive: zostanie wypłacony (once) and będzie wypłacany (regularly)',
  ),
  cefr: 'B2',
  difficulty: 4,
  explanation: t(
    '**Мета:** подати заяву на допомогу й зрозуміти, кому вона належить.\nРоботодавець сплачує **składki** до ZUS, а за них людині **przysługuje** допомога. **Przysługiwać** + **давальний**: **przysługuje mi zasiłek**, **przysługuje osobom, które mają umowę o pracę**. Заяву подають так: **ubiegać się o** + знахідний — **ubiegam się o zasiłek chorobowy**.\n**Пасив** будують із **zostać** + дієприкметник доконаного виду для одноразової дії: **zasiłek zostanie wypłacony** («буде виплачена одноразово»); для регулярної — **być** + дієприкметник недоконаного виду: **zasiłek będzie wypłacany co miesiąc**.',
    '**Цель:** подать заявление на пособие и понять, кому оно полагается.\nРаботодатель платит **składki** в ZUS, а за них человеку **przysługuje** пособие. **Przysługiwać** + **дательный**: **przysługuje mi zasiłek**, **przysługuje osobom, które mają umowę o pracę**. Заявление подают так: **ubiegać się o** + винительный — **ubiegam się o zasiłek chorobowy**.\n**Пассив** строят с **zostać** + причастие совершенного вида для однократного действия: **zasiłek zostanie wypłacony** («будет выплачено разово»); для регулярного — **być** + причастие несовершенного вида: **zasiłek będzie wypłacany co miesiąc**.',
    '**Goal:** apply for a benefit and understand who is entitled to it.\nThe employer pays **składki** to ZUS and in return a person is entitled (**przysługuje**) to benefits. **Przysługiwać** + **dative**: **przysługuje mi zasiłek**, **przysługuje osobom, które mają umowę o pracę**. You apply with **ubiegać się o** + accusative: **ubiegam się o zasiłek chorobowy**.\nThe **passive** uses **zostać** + a perfective participle for a one-off action: **zasiłek zostanie wypłacony** (“will be paid once”); for a regular action **być** + an imperfective participle: **zasiłek będzie wypłacany co miesiąc**.',
  ),
  examples: [
    { pl: 'Ubiegam się o zasiłek chorobowy za czas zwolnienia lekarskiego.', tr: t('Я подаю заяву на допомогу по хворобі за час лікарняного.', 'Я подаю заявление на пособие по болезни за время больничного.', 'I am applying for sick pay for the period of my sick leave.') },
    { pl: 'Zasiłek zostanie wypłacony na konto w ciągu dwóch tygodni.', tr: t('Допомогу виплатять на рахунок протягом двох тижнів.', 'Пособие выплатят на счёт в течение двух недель.', 'The benefit will be paid into your account within two weeks.') },
  ],
  words: ['składka', 'zasiłek', 'zasiłek chorobowy', 'świadczenie', 'ubiegać się', 'przysługiwać'],
  exercises: [
    dialogue('dialogue.zus', ZUS, [
      {
        npc: 'W jakiej sprawie pan przychodzi?',
        tr: t('У якій справі ви прийшли?', 'По какому делу вы пришли?', 'What is your business here?'),
        choose: [
          ['Ubiegam się o zasiłek chorobowy za czas zwolnienia lekarskiego.', t('Я подаю заяву на допомогу по хворобі за час лікарняного.', 'Я подаю заявление на пособие по болезни за время больничного.', 'I am applying for sick pay for the period of my sick leave.')],
          ['Ubiegam się zasiłek chorobowy za czas zwolnienia lekarskiego.', t('(**ubiegać się o** — потрібен прийменник **o**)', '(**ubiegać się o** — нужен предлог **o**)', '(**ubiegać się o** needs the preposition **o**)')],
          ['Ubiegam się o zasiłku chorobowego za czas zwolnienia lekarskiego.', t('(**o** + знахідний: **o zasiłek chorobowy**, не родовий)', '(**o** + винительный: **o zasiłek chorobowy**, не родительный)', '(**o** + accusative: **o zasiłek chorobowy**, not the genitive)')],
        ],
        feedback: t('**ubiegać się o** + знахідний.', '**ubiegać się o** + винительный.', '**ubiegać się o** + accusative.'),
      },
      {
        npc: 'Zasiłek zostanie wypłacony na pana konto w ciągu dwóch tygodni.',
        tr: t('Допомогу виплатять на ваш рахунок протягом двох тижнів.', 'Пособие выплатят на ваш счёт в течение двух недель.', 'The benefit will be paid into your account within two weeks.'),
        choose: [
          ['Rozumiem. Czy zasiłek będzie wypłacany co miesiąc?', t('Розумію. Чи допомогу виплачуватимуть щомісяця?', 'Понимаю. Пособие будут выплачивать каждый месяц?', 'I see. Will the benefit be paid every month?')],
          ['Rozumiem. Czy zasiłek będzie wypłacić co miesiąc?', t('(після **będzie** — дієприкметник **wypłacany**, не інфінітив)', '(после **będzie** — причастие **wypłacany**, не инфинитив)', '(after **będzie** use the participle **wypłacany**, not the infinitive)')],
          ['Rozumiem. Czy zasiłek zostanie wypłacany co miesiąc?', t('(**zostać** + доконаний: **zostanie wypłacony** — разово; «щомісяця» — **będzie wypłacany**)', '(**zostać** + совершенный: **zostanie wypłacony** — разово; «каждый месяц» — **będzie wypłacany**)', '(**zostać** + perfective: **zostanie wypłacony** is a one-off; “every month” — **będzie wypłacany**)')],
        ],
        feedback: t('Регулярно — **będzie wypłacany**; одноразово — **zostanie wypłacony**.', 'Регулярно — **będzie wypłacany**; однократно — **zostanie wypłacony**.', 'Regular — **będzie wypłacany**; one-off — **zostanie wypłacony**.'),
      },
    ]),
    wordChoice('vocab.zus', 'przysługiwać', [t('належати (за правом)', 'полагаться (по праву)', 'to be due, to be entitled to'), t('призначати (виплату)', 'назначать (выплату)', 'to grant (a payment)'), t('відмовляти (у виплаті)', 'отказывать (в выплате)', 'to refuse (a payment)')]),
    fillGap('grammar.zus', 'Zasiłek przysługuje ___, które mają umowę o pracę.', ['osobom', 'osoby', 'osobami'], t('Допомога належить особам, які мають трудовий договір.', 'Пособие полагается лицам, у которых есть трудовой договор.', 'The benefit is due to people who have an employment contract.'),
      t('**przysługiwać** + давальний: **osobom**.', '**przysługiwać** + дательный: **osobom**.', '**przysługiwać** + dative: **osobom**.')),
    match('vocab.zus', [
      ['składka', t('внесок до ZUS', 'взнос в ZUS', 'contribution to ZUS')],
      ['zasiłek chorobowy', t('допомога по хворобі', 'пособие по болезни', 'sick pay')],
      ['świadczenie', t('виплата, соціальна допомога', 'выплата, социальное пособие', 'benefit, payment')],
      ['ubiegać się', t('подавати заяву на (щось)', 'подавать заявление на (что-то)', 'to apply for')],
    ]),
    grammar('grammar.zus', 'Zasiłek zostanie ___ na konto w ciągu dwóch tygodni.', 'wypłacić', ['wypłacony'], t('Допомогу виплатять на рахунок протягом двох тижнів.', 'Пособие выплатят на счёт в течение двух недель.', 'The benefit will be paid into the account within two weeks.'),
      t('**zostanie** + дієприкметник доконаного виду: **wypłacony**.', '**zostanie** + причастие совершенного вида: **wypłacony**.', '**zostanie** + a perfective participle: **wypłacony**.')),
    listen('listening.zus', 'Zasiłek zostanie wypłacony na pana konto w ciągu dwóch tygodni.', ['Zasiłek zostanie wypłacony na pana konto w ciągu dwóch tygodni.', 'Zasiłek zostanie wypłacony na pana konto w ciągu dwóch miesięcy.', 'Zasiłek został wypłacony na pana konto w ciągu dwóch tygodni.']),
    reading('reading.zus', 'Pani Anna, matka dwójki dzieci, ubiega się o świadczenie wychowawcze. Wniosek można złożyć przez internet na stronie ZUS albo w banku. Pani Anna zarabia niewiele, więc przysługuje jej także zasiłek rodzinny, ale tylko na młodsze dziecko, bo starsze jest już dorosłe i pracuje. Świadczenie zostanie wypłacone dopiero po rozpatrzeniu wniosku.',
      t('На яку дитину пані Анна отримає сімейну допомогу?', 'На какого ребёнка пани Анна получит семейное пособие?', 'For which child will Ms Anna receive the family allowance?'),
      [t('лише на молодшу', 'только на младшего', 'only for the younger one'), t('на обох дітей', 'на обоих детей', 'for both children'), t('лише на старшу', 'только на старшего', 'only for the older one')]),
    findError('grammar.zus', ['Ubiegam', 'się', 'do', 'zasiłek', 'rodzinny'], 2, t('Я подаю заяву на сімейну допомогу.', 'Я подаю заявление на семейное пособие.', 'I am applying for a family allowance.'),
      t('**Ubiegać się o** + знахідний: **o zasiłek**.', '**Ubiegać się o** + винительный: **o zasiłek**.', '**Ubiegać się o** + accusative: **o zasiłek**.')),
    build('grammar.zus', 'Zasiłek zostanie wypłacony w ciągu dwóch tygodni', t('Допомогу виплатять протягом двох тижнів', 'Пособие выплатят в течение двух недель', 'The benefit will be paid within two weeks'), ['wypłacić', 'tygodnie']),
    oddOne('grammar.zus', ['ubiegać się o zasiłek', 'ubiegać się o pracę', 'ubiegać się o kredyt', 'ubiegać się z zasiłku'], 3,
      t('**Ubiegać się o** + знахідний; **z zasiłku** — помилка.', '**Ubiegać się o** + винительный; **z zasiłku** — ошибка.', '**Ubiegać się o** + accusative; **z zasiłku** is wrong.'),
      t('Яке словосполучення неправильне?', 'Какое словосочетание неправильное?', 'Which phrase is wrong?')),
    translate('writing.zus', t('Допомога належить особам, які мають трудовий договір.', 'Пособие полагается лицам, у которых есть трудовой договор.', 'The benefit is due to people who have an employment contract.'),
      ['Zasiłek przysługuje osobom, które mają umowę o pracę', 'Świadczenie przysługuje osobom, które mają umowę o pracę', 'Zasiłek przysługuje osobom, które mają umowę o pracę.']),
    speak('speaking.zus', 'Ubiegam się o zasiłek chorobowy za czas zwolnienia lekarskiego.', t('Я подаю заяву на допомогу по хворобі за час лікарняного.', 'Я подаю заявление на пособие по болезни за время больничного.', 'I am applying for sick pay for the period of my sick leave.')),
  ],
};

const RZE_3: LessonSeed = {
  slug: 'rze-3-pit',
  title: t('Податки: річна декларація', 'Налоги: годовая декларация', 'Taxes: the annual return'),
  topic: t(
    'Rozliczenie roczne, zeznanie podatkowe, ulga, zwrot podatku; іменники від дієслів: termin na złożenie zeznania; zeznanie zostało złożone',
    'Rozliczenie roczne, zeznanie podatkowe, ulga, zwrot podatku; существительные от глаголов: termin na złożenie zeznania; zeznanie zostało złożone',
    'Rozliczenie roczne, zeznanie podatkowe, ulga, zwrot podatku; verbal nouns: termin na złożenie zeznania; zeznanie zostało złożone',
  ),
  cefr: 'B2',
  difficulty: 4,
  explanation: t(
    '**Мета:** зрозуміти річне податкове декларування й офіційні формулювання.\nУ Польщі **zeznanie podatkowe** (PIT) за минулий рік подають **do trzydziestego kwietnia** — через інтернет або в **urzędzie skarbowym**. З **ulgą** (наприклад, на дитину) податок менший; якщо протягом року утримали забагато, платник отримує **zwrot podatku**.\nОфіційна мова любить **іменники від дієслів**: **złożyć** → **złożenie zeznania** (**termin na złożenie zeznania** — родовий після такого іменника), **rozliczyć** → **rozliczenie**. І пасив: **zeznanie zostało złożone**, **ulga została przyznana** — дієприкметник узгоджується з підметом у роді й числі.',
    '**Цель:** понять годовое налоговое декларирование и официальные формулировки.\nВ Польше **zeznanie podatkowe** (PIT) за прошлый год подают **do trzydziestego kwietnia** — через интернет или в **urzędzie skarbowym**. С **ulgą** (например, на ребёнка) налог меньше; если в течение года удержали слишком много, плательщик получает **zwrot podatku**.\nОфициальная речь любит **существительные от глаголов**: **złożyć** → **złożenie zeznania** (**termin na złożenie zeznania** — родительный после такого существительного), **rozliczyć** → **rozliczenie**. И пассив: **zeznanie zostało złożone**, **ulga została przyznana** — причастие согласуется с подлежащим в роде и числе.',
    '**Goal:** understand the annual tax return and official wording.\nIn Poland the **zeznanie podatkowe** (PIT) for last year is filed **do trzydziestego kwietnia** — online or at the **urząd skarbowy**. With an **ulga** (for a child, say) the tax is lower; if too much was withheld during the year, the taxpayer gets a **zwrot podatku**.\nOfficial language loves **verbal nouns**: **złożyć** → **złożenie zeznania** (**termin na złożenie zeznania** — genitive after such a noun), **rozliczyć** → **rozliczenie**. And the passive: **zeznanie zostało złożone**, **ulga została przyznana** — the participle agrees with the subject in gender and number.',
  ),
  examples: [
    { pl: 'Zeznanie podatkowe zostało złożone przez internet.', tr: t('Податкову декларацію подано через інтернет.', 'Налоговая декларация подана через интернет.', 'The tax return was filed online.') },
    { pl: 'Termin na złożenie rozliczenia mija trzydziestego kwietnia.', tr: t('Термін подання декларації спливає тридцятого квітня.', 'Срок подачи декларации истекает тридцатого апреля.', 'The deadline for filing the return is the thirtieth of April.') },
  ],
  words: ['rozliczenie', 'zeznanie podatkowe', 'ulga', 'zwrot podatku', 'dochód', 'urząd skarbowy'],
  exercises: [
    dialogue('dialogue.pit', SKARBOWY, [
      {
        npc: 'Dzień dobry. Czy złożył pan już zeznanie podatkowe za zeszły rok?',
        tr: t('Добрий день. Чи подали ви вже податкову декларацію за минулий рік?', 'Добрый день. Вы уже подали налоговую декларацию за прошлый год?', 'Good morning. Have you already filed your tax return for last year?'),
        choose: [
          ['Tak, zeznanie zostało złożone przez internet w marcu.', t('Так, декларацію подано через інтернет у березні.', 'Да, декларация подана через интернет в марте.', 'Yes, the return was filed online in March.')],
          ['Tak, zeznanie zostało złożyć przez internet w marcu.', t('(**zostało** + дієприкметник: **złożone**, а не інфінітив)', '(**zostało** + причастие: **złożone**, а не инфинитив)', '(**zostało** takes a participle: **złożone**, not an infinitive)')],
          ['Tak, zeznanie zostałem złożone przez internet w marcu.', t('(**zeznanie** — середній рід: **zostało**)', '(**zeznanie** — средний род: **zostało**)', '(**zeznanie** is neuter: **zostało**)')],
        ],
        feedback: t('Пасив: **zostać** + дієприкметник, узгоджений із підметом: **zeznanie zostało złożone**.', 'Пассив: **zostać** + причастие, согласованное с подлежащим: **zeznanie zostało złożone**.', 'Passive: **zostać** + a participle agreeing with the subject: **zeznanie zostało złożone**.'),
      },
      {
        npc: 'Przysługuje panu ulga na dziecko, więc będzie zwrot podatku.',
        tr: t('Вам належить пільга на дитину, тож буде повернення податку.', 'Вам положена льгота на ребёнка, так что будет возврат налога.', 'You are entitled to a child tax relief, so there will be a tax refund.'),
        choose: [
          ['Świetnie. Kiedy zwrot podatku wpłynie na moje konto?', t('Чудово. Коли повернення податку надійде на мій рахунок?', 'Отлично. Когда возврат налога поступит на мой счёт?', 'Great. When will the refund arrive in my account?')],
          ['Świetnie. Kiedy zwrotu podatku wpłynie na moje konto?', t('(підмет — **zwrot** у називному: **zwrot podatku wpłynie**)', '(подлежащее — **zwrot** в именительном: **zwrot podatku wpłynie**)', '(the subject is **zwrot** in the nominative: **zwrot podatku wpłynie**)')],
          ['Świetnie. Kiedy zwrot podatku wpłynął na moje konto?', t('(мова про майбутнє — **wpłynie**; **wpłynął** — минулий час)', '(речь о будущем — **wpłynie**; **wpłynął** — прошедшее время)', '(this is about the future — **wpłynie**; **wpłynął** is the past)')],
        ],
        feedback: t('Підмет у називному; майбутнє — **wpłynie**.', 'Подлежащее в именительном; будущее — **wpłynie**.', 'The subject is nominative; future — **wpłynie**.'),
      },
    ]),
    wordChoice('vocab.pit', 'ulga', [t('пільга, зменшення податку', 'льгота, уменьшение налога', 'tax relief'), t('штраф за запізнення', 'штраф за опоздание', 'a late-filing penalty'), t('додатковий податок', 'дополнительный налог', 'a surcharge')]),
    fillGap('grammar.pit', 'Termin na złożenie ___ mija trzydziestego kwietnia.', ['zeznania', 'zeznanie', 'zeznaniu'], t('Термін подання декларації спливає тридцятого квітня.', 'Срок подачи декларации истекает тридцатого апреля.', 'The deadline for filing the return is the thirtieth of April.'),
      t('Після іменника **złożenie** — родовий: **złożenie zeznania**.', 'После существительного **złożenie** — родительный: **złożenie zeznania**.', 'After the noun **złożenie** use the genitive: **złożenie zeznania**.')),
    match('vocab.pit', [
      ['rozliczenie', t('розрахунок, декларування', 'расчёт, декларирование', 'settlement, tax return')],
      ['ulga', t('пільга', 'льгота', 'relief')],
      ['zwrot podatku', t('повернення податку', 'возврат налога', 'tax refund')],
      ['dochód', t('дохід', 'доход', 'income')],
    ]),
    grammar('grammar.pit', 'Zeznanie zostało ___ przez internet.', 'złożyć', ['złożone'], t('Декларацію подано через інтернет.', 'Декларация подана через интернет.', 'The return was filed online.'),
      t('**zeznanie** — середній рід: **złożone**.', '**zeznanie** — средний род: **złożone**.', '**zeznanie** is neuter: **złożone**.')),
    listen('listening.pit', 'Rozliczenie roczne trzeba złożyć do trzydziestego kwietnia.', ['Rozliczenie roczne trzeba złożyć do trzydziestego kwietnia.', 'Rozliczenie roczne trzeba złożyć do trzydziestego marca.', 'Rozliczenie roczne trzeba złożyć do trzynastego kwietnia.']),
    reading('reading.pit', 'Roczne rozliczenie podatkowe, czyli PIT, składa się za poprzedni rok kalendarzowy. W Polsce termin mija 30 kwietnia. Zeznanie można złożyć w urzędzie skarbowym albo przez internet; urząd przygotowuje także wstępnie wypełnione zeznanie, które podatnik może zatwierdzić lub poprawić. Jeśli w ciągu roku pobrano zbyt wysoką zaliczkę na podatek, podatnik otrzymuje zwrot nadpłaty.',
      t('Коли платник отримує повернення?', 'Когда плательщик получает возврат?', 'When does the taxpayer get a refund?'),
      [t('коли протягом року утримали завеликий авансовий внесок', 'когда в течение года удержали слишком большой авансовый платёж', 'when too high an advance was withheld during the year'), t('коли декларацію подали після 30 квітня', 'когда декларацию подали после 30 апреля', 'when the return was filed after 30 April'), t('коли установа сама заповнила декларацію без згоди платника', 'когда учреждение само заполнило декларацию без согласия плательщика', 'when the office filled in the return without the taxpayer’s consent')]),
    findError('grammar.pit', ['Termin', 'na', 'złożenie', 'zeznanie', 'mija', 'trzydziestego', 'kwietnia'], 3, t('Термін подання декларації спливає тридцятого квітня.', 'Срок подачи декларации истекает тридцатого апреля.', 'The deadline for filing the return is the thirtieth of April.'),
      t('Після **złożenie** — родовий: **zeznania**.', 'После **złożenie** — родительный: **zeznania**.', 'After **złożenie** use the genitive: **zeznania**.')),
    build('grammar.pit', 'Zeznanie zostało złożone przez internet', t('Декларацію подано через інтернет', 'Декларация подана через интернет', 'The return was filed online'), ['złożyć', 'złożony']),
    oddOne('grammar.pit', ['zeznanie zostało złożone', 'wniosek został podpisany', 'deklaracja została wysłana', 'ulga została przyznany'], 3,
      t('**Ulga** — жіночий рід: **została przyznana**.', '**Ulga** — женский род: **została przyznana**.', '**Ulga** is feminine: **została przyznana**.'),
      t('Яка фраза містить помилку?', 'Какое выражение содержит ошибку?', 'Which expression contains a mistake?')),
    translate('writing.pit', t('Декларацію подано через інтернет. Повернення податку надійде на рахунок.', 'Декларация подана через интернет. Возврат налога поступит на счёт.', 'The return was filed online. The tax refund will arrive in the account.'),
      ['Zeznanie zostało złożone przez internet. Zwrot podatku wpłynie na konto.', 'Zeznanie zostało złożone przez internet. Zwrot podatku wpłynie na rachunek.', 'Deklaracja została złożona przez internet. Zwrot podatku wpłynie na konto.']),
    speak('speaking.pit', 'Termin na złożenie zeznania podatkowego mija trzydziestego kwietnia.', t('Термін подання податкової декларації спливає тридцятого квітня.', 'Срок подачи налоговой декларации истекает тридцатого апреля.', 'The deadline for filing the tax return is the thirtieth of April.')),
  ],
};

const RZE_4: LessonSeed = {
  slug: 'rze-4-szkola',
  title: t('Школа й дитсадок', 'Школа и детский сад', 'School and kindergarten'),
  topic: t(
    'Непряма мова: powiedział, że…; poprosił, żebym…; zapytał, czy…; zapisać do szkoły, usprawiedliwić nieobecność, dziennik elektroniczny',
    'Косвенная речь: powiedział, że…; poprosił, żebym…; zapytał, czy…; zapisać do szkoły, usprawiedliwić nieobecność, dziennik elektroniczny',
    'Reported speech: powiedział, że…; poprosił, żebym…; zapytał, czy…; zapisać do szkoły, usprawiedliwić nieobecność, dziennik elektroniczny',
  ),
  cefr: 'B2',
  difficulty: 4,
  explanation: t(
    '**Мета:** домовлятися зі школою й переказувати, що сказали вчитель чи класний керівник.\nУ **непрямій мові** польська не зсуває час, як англійська: **Wychowawca powiedział, że mój syn jest zdolny** (було «jest» — лишається **jest**). Три типи: твердження — **że**: **powiedział, że…**; прохання чи наказ — **żeby** + форма минулого часу, що узгоджується з особою: **poprosił, żebym przyszedł** («попросив, щоб я прийшов»); запитання — **czy**: **zapytała, czy syn odrabia lekcje**.\nУ школі: **zapisać dziecko do szkoły**, **usprawiedliwić nieobecność** (протягом тижня), **dziennik elektroniczny** — там видно оцінки й повідомлення, а **zebranie z rodzicami** — збори.',
    '**Цель:** договариваться со школой и пересказывать, что сказали учитель или классный руководитель.\nВ **косвенной речи** польский не сдвигает время, как английский: **Wychowawca powiedział, że mój syn jest zdolny** (было «jest» — остаётся **jest**). Три типа: утверждение — **że**: **powiedział, że…**; просьба или приказ — **żeby** + форма прошедшего времени, согласованная с лицом: **poprosił, żebym przyszedł** («попросил, чтобы я пришёл»); вопрос — **czy**: **zapytała, czy syn odrabia lekcje**.\nВ школе: **zapisać dziecko do szkoły**, **usprawiedliwić nieobecność** (в течение недели), **dziennik elektroniczny** — там видны оценки и сообщения, а **zebranie z rodzicami** — собрание.',
    '**Goal:** deal with the school and report what a teacher or form tutor said.\nIn **reported speech** Polish does not shift tenses as English does: **Wychowawca powiedział, że mój syn jest zdolny** (it was “jest” — it stays **jest**). Three types: a statement — **że**: **powiedział, że…**; a request or order — **żeby** + a past-tense form agreeing with the person: **poprosił, żebym przyszedł** (“asked me to come”); a question — **czy**: **zapytała, czy syn odrabia lekcje**.\nAt school: **zapisać dziecko do szkoły**, **usprawiedliwić nieobecność** (within a week), the **dziennik elektroniczny** shows grades and messages, and a **zebranie z rodzicami** is a parents’ meeting.',
  ),
  examples: [
    { pl: 'Wychowawca powiedział, że mój syn jest bardzo zdolny.', tr: t('Класний керівник сказав, що мій син дуже здібний.', 'Классный руководитель сказал, что мой сын очень способный.', 'The form tutor said that my son is very gifted.') },
    { pl: 'Poprosił, żebym przyszedł na zebranie w czwartek.', tr: t('Він попросив, щоб я прийшов на збори в четвер.', 'Он попросил, чтобы я пришёл на собрание в четверг.', 'He asked me to come to the meeting on Thursday.') },
  ],
  words: ['przedszkole', 'zapisać', 'usprawiedliwić', 'nieobecność', 'zebranie', 'wychowawca', 'dziennik elektroniczny'],
  exercises: [
    dialogue('dialogue.szkola', WYCHOWAWCA, [
      {
        npc: 'Antek był wczoraj nieobecny. Proszę usprawiedliwić jego nieobecność w dzienniku.',
        tr: t('Антек учора був відсутній. Будь ласка, поясніть його відсутність у щоденнику.', 'Антек вчера отсутствовал. Объясните, пожалуйста, его отсутствие в дневнике.', 'Antek was absent yesterday. Please excuse his absence in the register.'),
        choose: [
          ['Oczywiście. Zaraz napiszę usprawiedliwienie w dzienniku elektronicznym.', t('Звісно. Зараз напишу пояснення в електронному щоденнику.', 'Конечно. Сейчас напишу объяснение в электронном дневнике.', 'Of course. I’ll write the excuse in the electronic register right away.')],
          ['Oczywiście. Zaraz napiszę usprawiedliwić w dzienniku elektronicznym.', t('(**napiszę** + іменник: **usprawiedliwienie**, а не інфінітив)', '(**napiszę** + существительное: **usprawiedliwienie**, а не инфинитив)', '(**napiszę** takes a noun: **usprawiedliwienie**, not an infinitive)')],
          ['Oczywiście. Zaraz napisałem usprawiedliwienie w dzienniku elektronicznym.', t('(**zaraz** вказує на майбутнє: **napiszę**)', '(**zaraz** указывает на будущее: **napiszę**)', '(**zaraz** points to the future: **napiszę**)')],
        ],
        feedback: t('**zaraz** — майбутній доконаний: **napiszę**.', '**zaraz** — будущее совершенного вида: **napiszę**.', '**zaraz** — perfective future: **napiszę**.'),
      },
      {
        npc: 'Proszę, żeby pan przyszedł na zebranie w czwartek o siedemnastej.',
        tr: t('Прошу, щоб ви прийшли на збори в четвер о сімнадцятій.', 'Прошу, чтобы вы пришли на собрание в четверг в семнадцать часов.', 'I’d like you to come to the meeting on Thursday at five p.m.'),
        choose: [
          ['Dobrze, przyjdę. Czy mam coś przynieść?', t('Добре, прийду. Чи треба щось принести?', 'Хорошо, приду. Нужно ли что-то принести?', 'All right, I’ll come. Do I need to bring anything?')],
          ['Dobrze, żebym przyszedł. Czy mam coś przynieść?', t('(**żebym** — підрядне речення; у головному — **przyjdę**)', '(**żebym** — придаточное; в главном нужно **przyjdę**)', '(**żebym** begins a subordinate clause; the main clause needs **przyjdę**)')],
          ['Dobrze, przychodziłem. Czy mam coś przynieść?', t('(мова про майбутній візит — **przyjdę**, а не минулий **przychodziłem**)', '(речь о будущем визите — **przyjdę**, а не прошедшее **przychodziłem**)', '(a future visit needs **przyjdę**, not the past **przychodziłem**)')],
        ],
        feedback: t('Згода на майбутнє — **przyjdę** (доконаний вид).', 'Согласие на будущее — **przyjdę** (совершенный вид).', 'Agreeing to a future visit — **przyjdę** (perfective).'),
      },
    ]),
    wordChoice('vocab.szkola', 'usprawiedliwić', [t('вважати відсутність поважною, пояснити її', 'считать отсутствие уважительным, объяснить его', 'to excuse (an absence)'), t('покарати за запізнення', 'наказать за опоздание', 'to punish for lateness'), t('записати відсутнього до списку', 'внести отсутствующего в список', 'to add an absentee to a list')]),
    fillGap('grammar.szkola', 'Nauczycielka zapytała, ___ syn odrabia lekcje.', ['czy', 'jeśli', 'dlatego'], t('Вчителька запитала, чи син робить уроки.', 'Учительница спросила, делает ли сын уроки.', 'The teacher asked whether my son does his homework.'),
      t('Непряме запитання «так / ні» — **czy** (не *jeśli*).', 'Косвенный вопрос «да / нет» — **czy** (не *jeśli*).', 'An indirect yes / no question takes **czy** (not *jeśli*).')),
    match('vocab.szkola', [
      ['zapisać do szkoły', t('записати до школи', 'записать в школу', 'to enrol in a school')],
      ['usprawiedliwić nieobecność', t('пояснити відсутність', 'объяснить отсутствие', 'to excuse an absence')],
      ['zebranie z rodzicami', t('збори з батьками', 'собрание с родителями', 'parents’ meeting')],
      ['wychowawca', t('класний керівник', 'классный руководитель', 'form tutor')],
    ]),
    grammar('grammar.szkola', 'Nauczycielka poprosiła mnie, ___ przyniósł zaświadczenie.', 'żeby', ['żebym'], t('Вчителька попросила мене, щоб я приніс довідку.', 'Учительница попросила меня, чтобы я принёс справку.', 'The teacher asked me to bring a certificate.'),
      t('Прохання до мене — **żebym przyniósł** (особа в закінченні).', 'Просьба ко мне — **żebym przyniósł** (лицо в окончании).', 'A request addressed to me — **żebym przyniósł** (the person is in the ending).')),
    listen('listening.szkola', 'Wychowawca powiedział, że zebranie odbędzie się w czwartek o siedemnastej.', ['Wychowawca powiedział, że zebranie odbędzie się w czwartek o siedemnastej.', 'Wychowawca powiedział, że zebranie odbędzie się w czwartek o siódmej.', 'Wychowawca powiedział, że zebranie odbyło się w środę o siedemnastej.']),
    reading('reading.szkola', 'Szanowni Rodzice, uprzejmie informujemy, że w czwartek, 12 listopada, o godzinie 17:00 odbędzie się zebranie z rodzicami uczniów klasy 2b. Wychowawca przedstawi wyniki pierwszego semestru i poprosi rodziców, aby sprawdzili dziennik elektroniczny. Nieobecność dziecka należy usprawiedliwić w ciągu siedmiu dni. Prosimy o punktualne przybycie.',
      t('Про що класний керівник попросить батьків?', 'О чём классный руководитель попросит родителей?', 'What will the form tutor ask the parents to do?'),
      [t('щоб перевірили електронний щоденник', 'чтобы проверили электронный дневник', 'to check the electronic register'), t('щоб написали заяву до директора', 'чтобы написали заявление директору', 'to write a letter to the head'), t('щоб принесли свідоцтво про народження', 'чтобы принесли свидетельство о рождении', 'to bring a birth certificate')]),
    findError('grammar.szkola', ['Nauczycielka', 'zapytała', 'żeby', 'syn', 'odrabia', 'lekcje'], 2, t('Вчителька запитала, чи син робить уроки.', 'Учительница спросила, делает ли сын уроки.', 'The teacher asked whether my son does his homework.'),
      t('Непряме запитання — **czy**, а не **żeby**.', 'Косвенный вопрос — **czy**, а не **żeby**.', 'An indirect question takes **czy**, not **żeby**.')),
    build('grammar.szkola', 'Wychowawca poprosił żebym przyszedł na zebranie', t('Класний керівник попросив, щоб я прийшов на збори', 'Классный руководитель попросил, чтобы я пришёл на собрание', 'The form tutor asked me to come to the meeting'), ['przyjdę', 'żeby']),
    oddOne('grammar.szkola', ['Zapytał, czy mogę przyjść.', 'Poprosił, żebym przyszedł.', 'Powiedział, że przyjdzie.', 'Zapytał, żeby mogę przyjść.'], 3,
      t('Запитання вводить **czy**; після **żeby** — форма минулого часу: **żebym mógł**.', 'Вопрос вводит **czy**; после **żeby** — форма прошедшего времени: **żebym mógł**.', 'A question takes **czy**; after **żeby** comes a past-tense form: **żebym mógł**.'),
      t('Яке речення містить помилку?', 'Какое предложение содержит ошибку?', 'Which sentence contains a mistake?')),
    translate('writing.szkola', t('Вчителька попросила, щоб я приніс довідку від лікаря.', 'Учительница попросила, чтобы я принёс справку от врача.', 'The teacher asked me to bring a doctor’s note.'),
      ['Nauczycielka poprosiła, żebym przyniósł zwolnienie od lekarza', 'Nauczycielka poprosiła, żebym przyniosła zwolnienie od lekarza', 'Nauczycielka poprosiła, żebym przyniósł zaświadczenie od lekarza', 'Nauczycielka poprosiła, żebym przyniosła zaświadczenie od lekarza']),
    speak('speaking.szkola', 'Wychowawca poprosił, żebym przyszedł na zebranie w czwartek.', t('Класний керівник попросив, щоб я прийшов на збори в четвер.', 'Классный руководитель попросил, чтобы я пришёл на собрание в четверг.', 'The form tutor asked me to come to the meeting on Thursday.')),
  ],
};

export const RZESZOW: CityContent = {
  city: 'rzeszow',
  routes: [
    {
      slug: 'rze-zdrowie',
      title: t('Здоров’я й допомога', 'Здоровье и пособия', 'Health and benefits'),
      description: t('Skierowanie, e-recepta, przysługuje mi, ubiegać się o zasiłek', 'Skierowanie, e-recepta, przysługuje mi, ubiegać się o zasiłek', 'Skierowanie, e-recepta, przysługuje mi, ubiegać się o zasiłek'),
      icon: 'receipt-check',
      lessons: [RZE_1, RZE_2],
    },
    {
      slug: 'rze-podatki-szkola',
      title: t('Податки й школа', 'Налоги и школа', 'Taxes and school'),
      description: t('Zeznanie zostało złożone, powiedział że…, poprosił żebym…', 'Zeznanie zostało złożone, powiedział że…, poprosił żebym…', 'Zeznanie zostało złożone, powiedział że…, poprosił żebym…'),
      icon: 'office',
      lessons: [RZE_3, RZE_4],
    },
    {
      slug: 'rze-porzadek',
      title: t('Порядок і безпека', 'Порядок и безопасность', 'Order and safety'),
      description: t('Zostać ukarany mandatem, skradziono mi, nie widziałem żadnego…', 'Zostać ukarany mandatem, skradziono mi, nie widziałem żadnego…', 'Zostać ukarany mandatem, skradziono mi, nie widziałem żadnego…'),
      icon: 'map-pins',
      lessons: [RZE_5_8[0], RZE_5_8[1]],
    },
    {
      slug: 'rze-konsument-miasto',
      title: t('Споживач і місто', 'Потребитель и город', 'Consumers and the city'),
      description: t('Gdyby miał wadę, mógłbym…; miasto, w którym…; znany z…', 'Gdyby miał wadę, mógłbym…; miasto, w którym…; znany z…', 'Gdyby miał wadę, mógłbym…; miasto, w którym…; znany z…'),
      icon: 'explore',
      lessons: [RZE_5_8[2], RZE_5_8[3]],
    },
    {
      slug: 'rze-egzamin',
      title: t('Іспит Жешува', 'Экзамен Жешува', 'Rzeszów exam'),
      description: t('Лікар, ZUS, податки, школа, штрафи, поліція, рекламація, місто', 'Врач, ZUS, налоги, школа, штрафы, полиция, рекламация, город', 'Doctor, ZUS, taxes, school, fines, police, complaints, the city'),
      icon: 'achievements',
      lessons: [RZE_BOSS],
    },
  ],
};

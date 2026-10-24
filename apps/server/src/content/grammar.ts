/**
 * Граматичні теми. Кожна тема пов'язана з навичками (skill) вправ — прогрес і тренування
 * беруться з реальних вправ і статистики навичок користувача.
 */
import type { Cefr, I18n } from '@polski-go/shared';
import { t } from './builders';

export type GrammarTopic = {
  slug: string;
  title: string;
  subtitle: I18n;
  cefr: Cefr;
  difficulty: 1 | 2 | 3;
  color: string;
  glyph: string;
  skills: string[];
  rule: I18n;
  examples: { pl: string; tr: I18n }[];
};

export const GRAMMAR: GrammarTopic[] = [
  {
    slug: 'byc', title: 'Czasownik „być”', subtitle: t('Дієслово «бути»', 'Глагол «быть»', 'The verb "to be"'), cefr: 'A0', difficulty: 1, color: '#55BDF4', glyph: 'być',
    skills: ['grammar.być'],
    rule: t(
      'У польській «бути» вживається в теперішньому часі завжди:\nja **jestem**, ty **jesteś**, on/ona **jest**, my **jesteśmy**, wy **jesteście**, oni **są**.\nПитання часто починається з **czy**: Czy jesteś w domu?',
      'В польском «быть» в настоящем времени употребляется всегда:\nja **jestem**, ty **jesteś**, on/ona **jest**, my **jesteśmy**, wy **jesteście**, oni **są**.\nВопрос часто начинается с **czy**: Czy jesteś w domu?',
      '"To be" is always used in the present tense:\nja **jestem**, ty **jesteś**, on/ona **jest**, my **jesteśmy**, wy **jesteście**, oni **są**.\nQuestions often start with **czy**: Czy jesteś w domu?',
    ),
    examples: [
      { pl: 'Jestem z Ukrainy.', tr: t('Я з України.', 'Я из Украины.', 'I am from Ukraine.') },
      { pl: 'Oni są w Krakowie.', tr: t('Вони в Кракові.', 'Они в Кракове.', 'They are in Kraków.') },
    ],
  },
  {
    slug: 'miec', title: 'Czasownik „mieć”', subtitle: t('Дієслово «мати»', 'Глагол «иметь»', 'The verb "to have"'), cefr: 'A0', difficulty: 1, color: '#35C88A', glyph: 'mam',
    skills: ['grammar.mieć'],
    rule: t(
      '«У мене є» — **mam**: ja **mam**, ty **masz**, on/ona **ma**, my **mamy**, wy **macie**, oni **mają**.\nВік теж через mieć: **Mam dwadzieścia lat.**',
      '«У меня есть» — **mam**: ja **mam**, ty **masz**, on/ona **ma**, my **mamy**, wy **macie**, oni **mają**.\nВозраст тоже через mieć: **Mam dwadzieścia lat.**',
      '"I have" is **mam**: ja **mam**, ty **masz**, on/ona **ma**, my **mamy**, wy **macie**, oni **mają**.\nAge also uses mieć: **Mam dwadzieścia lat.**',
    ),
    examples: [{ pl: 'Czy masz kota?', tr: t('У тебе є кіт?', 'У тебя есть кот?', 'Do you have a cat?') }],
  },
  {
    slug: 'rodzaj', title: 'Rodzaj: mój, moja, moje', subtitle: t('Рід і узгодження', 'Род и согласование', 'Gender and agreement'), cefr: 'A0', difficulty: 1, color: '#9568F5', glyph: 'ma',
    skills: ['grammar.gender', 'grammar.adjectives'],
    rule: t(
      'Три роди: чоловічий — **mój** brat, **duży** pokój; жіночий — **moja** mama, **duża** kuchnia; середній — **moje** dziecko, **duże** mieszkanie.\nУвага: **tata** закінчується на -a, але це чоловічий рід — **mój tata**.',
      'Три рода: мужской — **mój** brat, **duży** pokój; женский — **moja** mama, **duża** kuchnia; средний — **moje** dziecko, **duże** mieszkanie.\nВнимание: **tata** оканчивается на -a, но это мужской род — **mój tata**.',
      'Three genders: masculine — **mój** brat, **duży** pokój; feminine — **moja** mama, **duża** kuchnia; neuter — **moje** dziecko, **duże** mieszkanie.\nNote: **tata** ends in -a but is masculine — **mój tata**.',
    ),
    examples: [{ pl: 'To jest moja siostra i mój brat.', tr: t('Це моя сестра і мій брат.', 'Это моя сестра и мой брат.', 'This is my sister and my brother.') }],
  },
  {
    slug: 'biernik', title: 'Biernik', subtitle: t('Знахідний відмінок (кого? що?)', 'Винительный падеж (кого? что?)', 'Accusative (whom? what?)'), cefr: 'A1', difficulty: 2, color: '#F45159', glyph: 'kawę',
    skills: ['grammar.accusative'],
    rule: t(
      'Після **mieć**, **chcieć**, **poproszę** та багатьох дієслів:\n• жіночий рід -a → **-ę**: kawa → poproszę **kawę**;\n• чоловічий рід (люди, тварини) + **-a**: brat → mam **brata**, kot → mam **kota**;\n• неживі чоловічого та середнього роду не змінюються: sok, ciasto.',
      'После **mieć**, **chcieć**, **poproszę** и многих глаголов:\n• женский род -a → **-ę**: kawa → poproszę **kawę**;\n• мужской род (люди, животные) + **-a**: brat → mam **brata**, kot → mam **kota**;\n• неодушевлённые мужского и среднего рода не меняются: sok, ciasto.',
      'After **mieć**, **chcieć**, **poproszę** and many verbs:\n• feminine -a → **-ę**: kawa → poproszę **kawę**;\n• masculine people/animals + **-a**: brat → mam **brata**, kot → mam **kota**;\n• inanimate masculine and neuter nouns do not change: sok, ciasto.',
    ),
    examples: [{ pl: 'Poproszę herbatę i ciasto.', tr: t('Чай і тістечко, будь ласка.', 'Чай и пирожное, пожалуйста.', 'Tea and cake, please.') }],
  },
  {
    slug: 'dopelniacz', title: 'Dopełniacz', subtitle: t('Родовий відмінок: z Ukrainy', 'Родительный падеж: z Ukrainy', 'Genitive: z Ukrainy'), cefr: 'A1', difficulty: 2, color: '#FFBD42', glyph: 'z…',
    skills: ['grammar.genitive'],
    rule: t(
      'Після **z** (звідки?), **do**, **bez** та після заперечення **nie mam**:\nUkraina → z **Ukrainy**, Polska → z **Polski**, brat → nie mam **brata**.',
      'После **z** (откуда?), **do**, **bez** и после отрицания **nie mam**:\nUkraina → z **Ukrainy**, Polska → z **Polski**, brat → nie mam **brata**.',
      'After **z** (from), **do**, **bez** and after negation **nie mam**:\nUkraina → z **Ukrainy**, Polska → z **Polski**, brat → nie mam **brata**.',
    ),
    examples: [{ pl: 'Jestem z Ukrainy, a ona jest z Polski.', tr: t('Я з України, а вона з Польщі.', 'Я из Украины, а она из Польши.', 'I am from Ukraine and she is from Poland.') }],
  },
  {
    slug: 'miejscownik', title: 'Miejscownik', subtitle: t('Місцевий відмінок: w Warszawie', 'Предложный падеж: w Warszawie', 'Locative: w Warszawie'), cefr: 'A1', difficulty: 2, color: '#55BDF4', glyph: 'w…',
    skills: ['grammar.locative'],
    rule: t(
      'Відповідає на питання «де?» після **w** і **na**:\nWarszawa → w **Warszawie**, Kraków → w **Krakowie**, mieszkanie → w **mieszkaniu**.',
      'Отвечает на вопрос «где?» после **w** и **na**:\nWarszawa → w **Warszawie**, Kraków → w **Krakowie**, mieszkanie → w **mieszkaniu**.',
      'Answers "where?" after **w** and **na**:\nWarszawa → w **Warszawie**, Kraków → w **Krakowie**, mieszkanie → w **mieszkaniu**.',
    ),
    examples: [{ pl: 'Mieszkam w Krakowie.', tr: t('Я живу в Кракові.', 'Я живу в Кракове.', 'I live in Kraków.') }],
  },
  {
    slug: 'narzednik', title: 'Narzędnik', subtitle: t('Орудний відмінок: kartą', 'Творительный падеж: kartą', 'Instrumental: kartą'), cefr: 'A1', difficulty: 3, color: '#35C88A', glyph: '-ą',
    skills: ['grammar.instrumental'],
    rule: t(
      'Відповідає на «чим? з ким?»: płacę **kartą**, płacę **gotówką**, kawa z **mlekiem**.\nЖіночий рід -a → **-ą**.',
      'Отвечает на «чем? с кем?»: płacę **kartą**, płacę **gotówką**, kawa z **mlekiem**.\nЖенский род -a → **-ą**.',
      'Answers "with what? with whom?": płacę **kartą**, płacę **gotówką**, kawa z **mlekiem**.\nFeminine -a → **-ą**.',
    ),
    examples: [{ pl: 'Płacę kartą.', tr: t('Я плачу карткою.', 'Я плачу картой.', 'I pay by card.') }],
  },
  {
    slug: 'liczebniki', title: 'Liczebniki i wiek', subtitle: t('Числа, вік і ціни', 'Числа, возраст и цены', 'Numbers, age and prices'), cefr: 'A0', difficulty: 2, color: '#F2884B', glyph: '123',
    skills: ['grammar.numerals', 'grammar.age'],
    rule: t(
      'Форма іменника залежить від числа:\n1 — **rok, złoty**; 2–4 (і 22–24…) — **lata, złote**; 5–21 — **lat, złotych**.\nMam **dwa lata**, mam **pięć lat**, to kosztuje **trzy złote**.',
      'Форма существительного зависит от числа:\n1 — **rok, złoty**; 2–4 (и 22–24…) — **lata, złote**; 5–21 — **lat, złotych**.\nMam **dwa lata**, mam **pięć lat**, to kosztuje **trzy złote**.',
      'The noun form depends on the number:\n1 — **rok, złoty**; 2–4 (and 22–24…) — **lata, złote**; 5–21 — **lat, złotych**.\nMam **dwa lata**, mam **pięć lat**, to kosztuje **trzy złote**.',
    ),
    examples: [{ pl: 'Kawa kosztuje dwadzieścia dwa złote.', tr: t('Кава коштує двадцять два злотих.', 'Кофе стоит двадцать два злотых.', 'Coffee costs twenty-two zlotys.') }],
  },
  {
    slug: 'czasowniki', title: 'Czasowniki: mówić, chcieć', subtitle: t('Відмінювання дієслів', 'Спряжение глаголов', 'Verb conjugation'), cefr: 'A1', difficulty: 2, color: '#9568F5', glyph: '-ę',
    skills: ['grammar.verbs', 'grammar.chcieć'],
    rule: t(
      'Форма «я» часто закінчується на **-ę** або **-m**:\nmówić → ja **mówię**, ty mówisz; chcieć → ja **chcę**, oni **chcą**; rozumieć → ja **rozumiem**.',
      'Форма «я» часто оканчивается на **-ę** или **-m**:\nmówić → ja **mówię**, ty mówisz; chcieć → ja **chcę**, oni **chcą**; rozumieć → ja **rozumiem**.',
      'The "I" form often ends in **-ę** or **-m**:\nmówić → ja **mówię**, ty mówisz; chcieć → ja **chcę**, oni **chcą**; rozumieć → ja **rozumiem**.',
    ),
    examples: [{ pl: 'Chcę zamówić pierogi.', tr: t('Я хочу замовити вареники.', 'Я хочу заказать вареники.', 'I want to order pierogi.') }],
  },
  {
    slug: 'dni', title: 'Dni tygodnia', subtitle: t('Коли? w poniedziałek', 'Когда? w poniedziałek', 'When? w poniedziałek'), cefr: 'A0', difficulty: 1, color: '#F45159', glyph: 'pn',
    skills: ['grammar.days'],
    rule: t(
      '«У який день?» — **w** + знахідний відмінок: w poniedziałek, **we** wtorek, w **środę**, w **sobotę**, w **niedzielę** (жіночий рід -a → -ę).',
      '«В какой день?» — **w** + винительный падеж: w poniedziałek, **we** wtorek, w **środę**, w **sobotę**, w **niedzielę** (женский род -a → -ę).',
      '"On which day?" — **w** + accusative: w poniedziałek, **we** wtorek, w **środę**, w **sobotę**, w **niedzielę** (feminine -a → -ę).',
    ),
    examples: [{ pl: 'We wtorek pracuję, a w sobotę odpoczywam.', tr: t('У вівторок я працюю, а в суботу відпочиваю.', 'Во вторник я работаю, а в субботу отдыхаю.', 'I work on Tuesday and rest on Saturday.') }],
  },
  {
    slug: 'szyk', title: 'Szyk zdania', subtitle: t('Порядок слів у реченні', 'Порядок слов в предложении', 'Word order'), cefr: 'A0', difficulty: 1, color: '#55BDF4', glyph: 'ABC',
    skills: ['grammar.sentence', 'grammar.intro'],
    rule: t(
      'Базовий порядок — підмет, присудок, додаток: **Ja mam kota.** Особовий займенник часто пропускають: **Mam kota.**\nЗвороти пам\'ятай цілими: **Mam na imię…**, **Jak się masz?**',
      'Базовый порядок — подлежащее, сказуемое, дополнение: **Ja mam kota.** Личное местоимение часто опускают: **Mam kota.**\nОбороты запоминай целиком: **Mam na imię…**, **Jak się masz?**',
      'Basic order is subject, verb, object: **Ja mam kota.** The pronoun is often dropped: **Mam kota.**\nLearn set phrases whole: **Mam na imię…**, **Jak się masz?**',
    ),
    examples: [{ pl: 'Mówię trochę po polsku.', tr: t('Я трохи говорю польською.', 'Я немного говорю по-польски.', 'I speak a little Polish.') }],
  },
];

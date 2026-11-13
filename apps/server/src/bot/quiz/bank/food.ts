/** Вопросы бота: еда, кафе, бар млечны, заказ. */
import { q, type QuizQuestion } from './types';

export const FOOD: QuizQuestion[] = [
  q({
    id: 'food-coffee', category: 'food', cefr: 'A1', kind: 'complete', image: 'stop-cafe',
    prompt: {
      ru: 'Заказываешь латте на овсяном молоке: «Poproszę latte z ___.»',
      uk: 'Замовляєш лате на вівсяному молоці: «Poproszę latte z ___.»',
      en: 'You order a latte with oat milk: «Poproszę latte z ___.»',
    },
    options: ['owsianym mlekiem', 'owsiane mleko', 'owsianego mleka', 'owsianym mleku'],
    answer: 0,
    explain: {
      ru: '«Z» в значении «с, вместе с» требует творительного: z owsianym mlekiem, z cukrem. «Owsiane mleko» — именительный, «owsianego mleka» — родительный (bez mleka), «owsianym mleku» — местный (o mleku).',
      uk: '«Z» у значенні «з, разом із» вимагає орудного: z owsianym mlekiem, z cukrem. «Owsiane mleko» — називний, «owsianego mleka» — родовий (bez mleka), «owsianym mleku» — місцевий (o mleku).',
      en: '«Z» meaning "with" takes the instrumental: z owsianym mlekiem, z cukrem. The other forms are the nominative, genitive (bez mleka) and locative (o mleku).',
    },
  }),
  q({
    id: 'food-ruskie', category: 'food', cefr: 'A1', kind: 'meaning', image: 'pierogarnia',
    prompt: {
      ru: 'В меню «pierogi ruskie». Что внутри?',
      uk: 'У меню «pierogi ruskie». Що всередині?',
      en: 'The menu says «pierogi ruskie». What is inside?',
    },
    options: {
      ru: ['картошка и творог', 'фарш и жареный лук', 'капуста и грибы', 'клубника и сахар'],
      uk: ['картопля і сир', 'фарш і смажена цибуля', 'капуста й гриби', 'полуниці й цукор'],
      en: ['potato and cheese', 'minced meat and onion', 'cabbage and mushrooms', 'strawberries and sugar'],
    },
    answer: 0,
    explain: {
      ru: '«Ruskie» — от Червонной Руси (Галиции), а не «русские»: картофель с творогом и луком. С мясом — «z mięsem», с капустой и грибами — «z kapustą i grzybami», с клубникой — «z truskawkami».',
      uk: '«Ruskie» — від Червоної Русі (Галичини): картопля з сиром і цибулею. З м\'ясом — «z mięsem», з капустою й грибами — «z kapustą i grzybami», з полуницями — «z truskawkami».',
      en: '«Ruskie» refers to historic Red Ruthenia, not Russia: potato with curd cheese and onion. With meat is «z mięsem», cabbage and mushrooms — «z kapustą i grzybami», strawberries — «z truskawkami».',
    },
  }),
  q({
    id: 'food-bill', category: 'food', cefr: 'A1', kind: 'situation', image: 'pierogarnia',
    prompt: {
      ru: 'Обед в ресторане окончен. Как попросить счёт?',
      uk: 'Обід у ресторані закінчився. Як попросити рахунок?',
      en: 'Lunch at the restaurant is over. How do you ask for the bill?',
    },
    options: ['Poproszę rachunek.', 'Poproszę konto.', 'Poproszę licznik.', 'Poproszę wynik.'],
    answer: 0,
    explain: {
      ru: 'Счёт в кафе — «rachunek». «Konto» — банковский счёт, «licznik» — счётчик (газа, такси), «wynik» — счёт матча или результат. Все три — ловушки слова «счёт».',
      uk: 'Рахунок у кафе — «rachunek». «Konto» — банківський рахунок, «licznik» — лічильник (газу, таксі), «wynik» — рахунок матчу чи результат.',
      en: 'The bill is «rachunek». «Konto» is a bank account, «licznik» a meter (gas, taxi), «wynik» a score or result — all traps for Russian «счёт».',
    },
  }),
  q({
    id: 'food-smacznego', category: 'food', cefr: 'A1', kind: 'reply', image: 'bar-mleczny',
    prompt: {
      ru: 'Официантка ставит тарелку: «Smacznego!» Что ответить?',
      uk: 'Офіціантка ставить тарілку: «Smacznego!» Що відповісти?',
      en: 'The waitress puts down your plate: «Smacznego!» What do you answer?',
    },
    options: ['Dziękuję!', 'Wzajemnie!', 'Na zdrowie!', 'Proszę bardzo!'],
    answer: 0,
    explain: {
      ru: 'Официантка не ест с тобой — просто «Dziękuję!». «Wzajemnie» (взаимно) отвечают тому, кто тоже садится есть. «Na zdrowie» — тост или «будь здоров», «Proszę bardzo» — «пожалуйста» в ответ на спасибо.',
      uk: 'Офіціантка не їсть із тобою — просто «Dziękuję!». «Wzajemnie» (взаємно) відповідають тому, хто теж сідає їсти. «Na zdrowie» — тост або «будь здоров», «Proszę bardzo» — «прошу» у відповідь на дякую.',
      en: 'The waitress isn\'t eating with you, so just «Dziękuję!». «Wzajemnie» (likewise) is for someone who eats too. «Na zdrowie» is a toast or "bless you", «Proszę bardzo» — "you\'re welcome".',
    },
  }),
  q({
    id: 'food-butelki', category: 'food', cefr: 'A2', kind: 'complete', image: 'stop-cafe',
    prompt: {
      ru: 'Вставь: «Poproszę pięć ___ wody.» (бутылка)',
      uk: 'Встав: «Poproszę pięć ___ wody.» (пляшка)',
      en: 'Fill in: «Poproszę pięć ___ wody.» (bottle)',
    },
    options: ['butelek', 'butelki', 'butelka', 'butelkę'],
    answer: 0,
    explain: {
      ru: 'После 5 и больше — родительный множественного: pięć butelek. «Butelki» — после 2, 3, 4 (dwie butelki), «butelka» — одна, «butelkę» — «poproszę butelkę» (одну).',
      uk: 'Після 5 і більше — родовий множини: pięć butelek. «Butelki» — після 2, 3, 4 (dwie butelki), «butelka» — одна, «butelkę» — «poproszę butelkę» (одну).',
      en: 'From 5 up you need the genitive plural: pięć butelek. «Butelki» follows 2, 3, 4 (dwie butelki), «butelka» is one, «butelkę» — «poproszę butelkę» (one).',
    },
  }),
  q({
    id: 'food-na-wynos', category: 'food', cefr: 'A2', kind: 'listen', image: 'zapiekanki',
    prompt: {
      ru: 'Подруга заказывает: «Dla mnie zapiekanka z pieczarkami, ale bez szczypiorku.» Какую ей сделать?',
      uk: 'Подруга замовляє: «Dla mnie zapiekanka z pieczarkami, ale bez szczypiorku.» Яку їй зробити?',
      en: 'Your friend orders: «Dla mnie zapiekanka z pieczarkami, ale bez szczypiorku.» What does she want?',
    },
    options: {
      ru: ['с шампиньонами, без зелёного лука', 'с шампиньонами, без чеснока', 'с печенью, без зелёного лука', 'с перцем, без зелёного лука'],
      uk: ['з печерицями, без зеленої цибулі', 'з печерицями, без часнику', 'з печінкою, без зеленої цибулі', 'з перцем, без зеленої цибулі'],
      en: ['mushrooms, no chives', 'mushrooms, no garlic', 'liver, no chives', 'peppers, no chives'],
    },
    answer: 0,
    explain: {
      ru: '«Pieczarki» — шампиньоны (печень — «wątróbka»), «szczypiorek» — зелёный лук. Чеснок — «czosnek», перец — «papryka».',
      uk: '«Pieczarki» — печериці, шампіньйони (печінка — «wątróbka»), «szczypiorek» — зелена цибуля. Часник — «czosnek», перець — «papryka».',
      en: '«Pieczarki» are button mushrooms (liver is «wątróbka»), «szczypiorek» — chives. Garlic is «czosnek», peppers — «papryka».',
    },
  }),
  q({
    id: 'food-no-meat', category: 'food', cefr: 'A2', kind: 'translate', image: 'bar-mleczny',
    prompt: {
      ru: 'Ты не ешь красное мясо. Как сказать официанту?',
      uk: 'Ти не їси червоного м\'яса. Як сказати офіціантові?',
      en: 'You don\'t eat red meat. How do you tell the waiter?',
    },
    options: ['Nie jem czerwonego mięsa.', 'Nie jem czerwone mięso.', 'Nie jem czerwonym mięsem.', 'Nie jem czerwonym mięsie.'],
    answer: 0,
    explain: {
      ru: 'После отрицания прямое дополнение — в родительном: jem czerwone mięso → nie jem czerwonego mięsa. Остальные — винительный, творительный и местный падежи.',
      uk: 'Після заперечення прямий додаток — у родовому: jem czerwone mięso → nie jem czerwonego mięsa. Решта — знахідний, орудний і місцевий відмінки.',
      en: 'After a negation the object goes into the genitive: jem czerwone mięso → nie jem czerwonego mięsa. The others are the accusative, instrumental and locative.',
    },
  }),
  q({
    id: 'food-zurek', category: 'food', cefr: 'B1', kind: 'listen', image: 'bar-mleczny',
    prompt: {
      ru: 'Официант: «Niestety, żurku już nie ma, ale polecam rosół.» Что он сказал?',
      uk: 'Офіціант: «Niestety, żurku już nie ma, ale polecam rosół.» Що він сказав?',
      en: 'The waiter: «Niestety, żurku już nie ma, ale polecam rosół.» What did he say?',
    },
    options: {
      ru: ['журека нет — советует бульон', 'бульона нет — советует журек', 'журек есть — советует и бульон', 'журека нет — бульона тоже'],
      uk: ['журеку немає — радить бульйон', 'бульйону немає — радить журек', 'журек є — радить і бульйон', 'журеку немає — бульйону теж'],
      en: ['no żurek left; try the broth', 'no broth left; try the żurek', 'żurek is here; try the broth too', 'no żurek left; no broth either'],
    },
    answer: 0,
    explain: {
      ru: '«Już nie ma» — «уже нет» (закончился), «ale» — «но», «polecam» — «советую». Журека нет, а rosół (куриный бульон) есть.',
      uk: '«Już nie ma» — «уже немає» (закінчився), «ale» — «але», «polecam» — «раджу». Журеку немає, а rosół (курячий бульйон) є.',
      en: '«Już nie ma» means it has run out, «ale» — "but", «polecam» — "I recommend". So no żurek, but rosół (chicken broth) is available.',
    },
  }),
  q({
    id: 'food-pay-card', category: 'food', cefr: 'A2', kind: 'verb', image: 'stop-cafe',
    prompt: {
      ru: 'Вставь: «Czy mogę ___ za kawę telefonem?» (заплатить)',
      uk: 'Встав: «Czy mogę ___ za kawę telefonem?» (заплатити)',
      en: 'Fill in: «Czy mogę ___ za kawę telefonem?» (to pay)',
    },
    options: ['zapłacić', 'zapłacę', 'zapłaci', 'zapłacisz'],
    answer: 0,
    explain: {
      ru: 'После «mogę» (могу) — неопределённая форма: zapłacić. «Zapłacę» — «заплачу», «zapłaci» — «он заплатит», «zapłacisz» — «ты заплатишь».',
      uk: 'Після «mogę» (можу) — неозначена форма: zapłacić. «Zapłacę» — «заплачу», «zapłaci» — «він заплатить», «zapłacisz» — «ти заплатиш».',
      en: 'After «mogę» (can I) comes the infinitive: zapłacić. «Zapłacę» means "I will pay", «zapłaci» — "he will pay", «zapłacisz» — "you will pay".',
    },
  }),
];

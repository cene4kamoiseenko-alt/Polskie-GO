/**
 * Словник для уроків «Education 2.0»: звуки й літери, професії, рух, wiedzieć/znać,
 * tę/tą, заперечення та розмовна польська (сленг з поміткою реєстру в темі `slang`).
 */
import { t } from './builders';
import type { VocabSeed } from './vocab';

const w = (pl: string, pos: string, uk: string, ru: string, en: string, pron: string, cefr: VocabSeed['cefr'], topics: string[], forms?: Record<string, string>): VocabSeed => ({
  pl, pos, tr: t(uk, ru, en), pron, cefr, topics, forms,
});

export const EDU_VOCAB: VocabSeed[] = [
  // ── Алфавіт і звуки ──
  w('litera', 'noun', 'літера', 'буква', 'letter', 'літера', 'A0', ['grammar']),
  w('ręka', 'noun', 'рука', 'рука', 'hand', 'ренка', 'A0', ['phrases'], { pl: 'ręce' }),
  w('łóżko', 'noun', 'ліжко', 'кровать', 'bed', 'вужко', 'A0', ['home']),
  w('koń', 'noun', 'кінь', 'лошадь', 'horse', 'конь', 'A0', ['phrases']),
  w('góra', 'noun', 'гора', 'гора', 'mountain', 'ґура', 'A0', ['travel']),
  w('źle', 'adv', 'погано', 'плохо', 'badly', 'жьле', 'A0', ['phrases']),
  w('żaba', 'noun', 'жаба', 'лягушка', 'frog', 'жаба', 'A0', ['phrases']),
  w('szkoła', 'noun', 'школа', 'школа', 'school', 'школа', 'A0', ['daily']),
  w('czas', 'noun', 'час', 'время', 'time', 'час', 'A0', ['daily']),
  w('rzeka', 'noun', 'річка', 'река', 'river', 'жека', 'A0', ['travel']),
  w('dzwonić', 'verb', 'дзвонити', 'звонить', 'to call (phone)', 'дзвонічь', 'A1', ['phrases'], { ja: 'dzwonię', ty: 'dzwonisz', 'on/ona': 'dzwoni' }),
  w('dźwięk', 'noun', 'звук', 'звук', 'sound', 'дзьв\'єнк', 'A1', ['grammar']),
  w('dżem', 'noun', 'джем, варення', 'джем, варенье', 'jam', 'джем', 'A0', ['food']),

  // ── Професії (być + narzędnik) ──
  w('student', 'noun', 'студент', 'студент', 'student', 'студент', 'A0', ['people', 'work'], { ins: 'studentem', f: 'studentka' }),
  w('studentka', 'noun', 'студентка', 'студентка', 'student (f)', 'студентка', 'A0', ['people', 'work'], { ins: 'studentką' }),
  w('nauczyciel', 'noun', 'учитель', 'учитель', 'teacher', 'научичєль', 'A1', ['work'], { ins: 'nauczycielem', f: 'nauczycielka' }),
  w('nauczycielka', 'noun', 'учителька', 'учительница', 'teacher (f)', 'научичєлька', 'A1', ['work'], { ins: 'nauczycielką' }),
  w('kierowca', 'noun', 'водій', 'водитель', 'driver', 'кєровца', 'A1', ['work', 'transport'], { ins: 'kierowcą' }),
  w('programista', 'noun', 'програміст', 'программист', 'programmer', 'проґраміста', 'A1', ['work'], { ins: 'programistą', f: 'programistka' }),
  w('sprzedawca', 'noun', 'продавець', 'продавец', 'shop assistant', 'спшедавца', 'A1', ['work', 'shopping'], { ins: 'sprzedawcą', f: 'sprzedawczyni' }),

  // ── Люди й групи (oni / one) ──
  w('oni', 'pron', 'вони (є хоча б один чоловік)', 'они (есть хотя бы один мужчина)', 'they (masculine-personal)', 'оні', 'A0', ['grammar']),
  w('one', 'pron', 'вони (жінки, діти, тварини, речі)', 'они (женщины, дети, животные, вещи)', 'they (non-masculine-personal)', 'оне', 'A0', ['grammar']),
  w('kolega', 'noun', 'колега, приятель', 'коллега, приятель', 'colleague, friend', 'колеґа', 'A0', ['people'], { f: 'koleżanka' }),
  w('koleżanka', 'noun', 'колега (жін.), подруга', 'коллега (жен.), подруга', 'colleague (f), friend', 'колежанка', 'A0', ['people']),
  w('książka', 'noun', 'книжка', 'книга', 'book', 'кс\'йонжка', 'A0', ['daily'], { acc: 'książkę', ins: 'książką' }),
  w('chłopak', 'noun', 'хлопець', 'парень', 'boy, boyfriend', 'хвопак', 'A0', ['people']),
  w('dziewczyna', 'noun', 'дівчина', 'девушка', 'girl, girlfriend', 'дзєвчина', 'A0', ['people']),

  // ── Транспорт і рух ──
  w('samochód', 'noun', 'автомобіль', 'автомобиль', 'car', 'самохуд', 'A0', ['transport'], { ins: 'samochodem' }),
  w('metro', 'noun', 'метро', 'метро', 'metro', 'метро', 'A0', ['transport'], { ins: 'metrem', gen: 'metra' }),
  w('rower', 'noun', 'велосипед', 'велосипед', 'bicycle', 'ровер', 'A0', ['transport'], { ins: 'rowerem' }),
  w('lotnisko', 'noun', 'аеропорт', 'аэропорт', 'airport', 'лотніско', 'A1', ['transport', 'travel']),
  w('wakacje', 'noun', 'канікули, відпустка', 'каникулы, отпуск', 'holidays', 'вакацьє', 'A1', ['travel']),
  w('jechać', 'verb', 'їхати (зараз, в один бік)', 'ехать (сейчас, в одну сторону)', 'to go (by vehicle, now)', 'єхачь', 'A1', ['transport', 'grammar'], { ja: 'jadę', ty: 'jedziesz', 'on/ona': 'jedzie', my: 'jedziemy', wy: 'jedziecie', oni: 'jadą' }),
  w('iść', 'verb', 'іти (зараз, в один бік)', 'идти (сейчас, в одну сторону)', 'to go (on foot, now)', 'іщьчь', 'A1', ['transport', 'grammar'], { ja: 'idę', ty: 'idziesz', 'on/ona': 'idzie', my: 'idziemy', wy: 'idziecie', oni: 'idą' }),
  w('chodzić', 'verb', 'ходити (регулярно)', 'ходить (регулярно)', 'to go on foot (regularly)', 'ходзічь', 'A1', ['transport', 'grammar'], { ja: 'chodzę', ty: 'chodzisz', 'on/ona': 'chodzi' }),
  w('jeździć', 'verb', 'їздити (регулярно)', 'ездить (регулярно)', 'to go by vehicle (regularly)', 'єжьджічь', 'A1', ['transport', 'grammar'], { ja: 'jeżdżę', ty: 'jeździsz', 'on/ona': 'jeździ' }),
  w('codziennie', 'adv', 'щодня', 'каждый день', 'every day', 'цодзєннє', 'A1', ['daily']),
  w('teraz', 'adv', 'зараз', 'сейчас', 'now', 'тераз', 'A0', ['daily']),
  w('często', 'adv', 'часто', 'часто', 'often', 'чєнсто', 'A1', ['daily']),
  w('basen', 'noun', 'басейн', 'бассейн', 'swimming pool', 'басен', 'A1', ['daily']),

  // ── Знати: wiedzieć / znać ──
  w('wiedzieć', 'verb', 'знати (факт, інформацію)', 'знать (факт, информацию)', 'to know (a fact)', 'в\'єдзєчь', 'A1', ['grammar'], { ja: 'wiem', ty: 'wiesz', 'on/ona': 'wie', my: 'wiemy', wy: 'wiecie', oni: 'wiedzą' }),
  w('znać', 'verb', 'знати (людину, місце, мову)', 'знать (человека, место, язык)', 'to know (a person, place)', 'знач', 'A1', ['grammar'], { ja: 'znam', ty: 'znasz', 'on/ona': 'zna', my: 'znamy', wy: 'znacie', oni: 'znają' }),
  w('język', 'noun', 'мова; язик', 'язык', 'language; tongue', 'єнзик', 'A1', ['people']),
  w('człowiek', 'noun', 'людина', 'человек', 'person', 'чвов\'єк', 'A1', ['people'], { acc: 'człowieka', pl: 'ludzie' }),
  w('mieć rację', 'phrase', 'мати рацію', 'быть правым', 'to be right', 'м\'єчь рацьє', 'A1', ['phrases']),
  w('adres', 'noun', 'адреса', 'адрес', 'address', 'адрес', 'A1', ['documents']),

  // ── Tę / tą ──
  w('kobieta', 'noun', 'жінка', 'женщина', 'woman', 'коб\'єта', 'A0', ['people'], { acc: 'kobietę', ins: 'kobietą' }),
  w('widzieć', 'verb', 'бачити', 'видеть', 'to see', 'відзєчь', 'A1', ['grammar'], { ja: 'widzę', ty: 'widzisz', 'on/ona': 'widzi' }),
  w('kupować', 'verb', 'купувати', 'покупать', 'to buy', 'куповачь', 'A1', ['shopping'], { ja: 'kupuję', ty: 'kupujesz', 'on/ona': 'kupuje' }),
  w('rozmawiać', 'verb', 'розмовляти', 'разговаривать', 'to talk', 'розмав\'ячь', 'A1', ['people'], { ja: 'rozmawiam', ty: 'rozmawiasz', 'on/ona': 'rozmawia' }),
  w('interesować się', 'verb', 'цікавитися', 'интересоваться', 'to be interested in', 'інтересовачь сє', 'A1', ['people'], { ja: 'interesuję się' }),

  // ── Заперечення ──
  w('nic', 'pron', 'нічого', 'ничего', 'nothing', 'ніц', 'A1', ['grammar']),
  w('nikt', 'pron', 'ніхто', 'никто', 'nobody', 'нікт', 'A1', ['grammar'], { acc: 'nikogo' }),
  w('nigdy', 'adv', 'ніколи', 'никогда', 'never', 'ніґди', 'A1', ['grammar']),
  w('nigdzie', 'adv', 'ніде', 'нигде', 'nowhere', 'ніґдзє', 'A1', ['grammar']),

  // ── Розмовна польська (тема slang; реєстр — у розділі «Żywy polski») ──
  w('elo', 'interj', 'привіт (дуже розмовне)', 'привет (очень разговорное)', 'hi (very casual)', 'ело', 'A1', ['slang']),
  w('nara', 'interj', 'бувай (молодіжне)', 'пока (молодёжное)', 'bye (youth slang)', 'нара', 'A1', ['slang']),
  w('co tam', 'phrase', 'як справи? що нового?', 'как дела? что нового?', 'what\'s up?', 'цо там', 'A1', ['slang', 'greetings']),
  w('trzymaj się', 'phrase', 'тримайся, бувай', 'держись, пока', 'take care', 'тшимай сє', 'A1', ['slang', 'greetings']),
  w('lecę', 'phrase', 'я побіг, мені час', 'я побежал, мне пора', 'I\'m off', 'леце', 'A1', ['slang']),
  w('ziomek', 'noun', 'друзяка, кореш', 'кореш, братан', 'buddy, homie', 'жьомек', 'A2', ['slang']),
  w('kumpel', 'noun', 'приятель, друзяка', 'приятель, дружище', 'pal', 'кумпель', 'A1', ['slang', 'people']),
  w('sztos', 'noun', 'бомба, крутяк', 'бомба, круто', 'awesome thing', 'штос', 'A2', ['slang']),
  w('zarąbiście', 'adv', 'чудово, крутезно', 'отлично, круто', 'awesome', 'заромбьіщє', 'A2', ['slang']),
  w('masakra', 'noun', 'жах, кошмар', 'ужас, кошмар', 'disaster, nightmare', 'масакра', 'A2', ['slang']),
  w('ale beka', 'phrase', 'оце сміх! ржака', 'вот умора! ржака', 'what a laugh', 'але бека', 'A2', ['slang']),
  w('ale przypał', 'phrase', 'оце сором! от халепа', 'вот позор! вот засада', 'how embarrassing', 'але пшипав', 'A2', ['slang']),
  w('serio', 'adv', 'серйозно?', 'серьёзно?', 'seriously', 'серьо', 'A1', ['slang']),
  w('bez kitu', 'phrase', 'без жартів, чесно', 'без шуток, честно', 'no kidding', 'без кіту', 'A2', ['slang']),
  w('nie ma lipy', 'phrase', 'все по-справжньому, без дурниць', 'всё по-настоящему, без фигни', 'it\'s legit', 'нє ма ліпи', 'A2', ['slang']),
  w('ogarniać', 'verb', 'розуміти, справлятися, розрулювати', 'понимать, справляться, разруливать', 'to get, to handle', 'оґарняч', 'A2', ['slang'], { ja: 'ogarniam', ty: 'ogarniasz', 'on/ona': 'ogarnia' }),
  w('wyluzuj', 'phrase', 'розслабся', 'расслабься', 'chill out', 'вилузуй', 'A2', ['slang']),
  w('nie spinaj się', 'phrase', 'не напружуйся', 'не напрягайся', 'don\'t stress', 'нє спінай сє', 'A2', ['slang']),
  w('daj spokój', 'phrase', 'та годі, облиш', 'да ладно, брось', 'come on, leave it', 'дай спокуй', 'A1', ['slang', 'phrases']),
  w('mam wywalone', 'phrase', 'мені начхати (грубувато)', 'мне плевать (грубовато)', 'I don\'t care (rude)', 'мам вивалоне', 'B1', ['slang']),
  w('co ty gadasz', 'phrase', 'що ти таке кажеш?!', 'что ты несёшь?!', 'what are you on about?!', 'цо ти ґадаш', 'A2', ['slang']),
];

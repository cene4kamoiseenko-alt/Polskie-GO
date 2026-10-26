/**
 * Довідник для вибору польського голосу: офіційні списки голосів, кандидати сліпого тесту з цінами
 * і набір фраз бенчмарку. Лише дані, без мережі й без ключів.
 * Списки голосів Google і Azure звірено з офіційними сторінками 2026-10-26 (джерела — docs/POLISH_TTS_BENCHMARK.md);
 * ціни — зі сторінок у полях source.
 * Перед підключенням оплати їх треба звірити знову: провайдери змінюють тарифи.
 */
import type { SpeechRate } from '@polski-go/shared';

export const TTS_CATALOG_CHECKED = '2026-10-26';

export type Gender = 'F' | 'M';
export type CatalogVoice = { name: string; gender: Gender; model: string };

/**
 * Голоси pl-PL з офіційного списку Google Cloud TTS (сторінка «Supported voices and languages», оновлена 2026-10-22).
 * У списку немає pl-PL-Wavenet-A..E і pl-PL-Standard-A..E — лише F/G та Chirp 3: HD.
 */
const CHIRP3_HD: [string, Gender][] = [
  ['Achernar', 'F'], ['Achird', 'M'], ['Algenib', 'M'], ['Algieba', 'M'], ['Alnilam', 'M'], ['Aoede', 'F'], ['Autonoe', 'F'],
  ['Callirrhoe', 'F'], ['Charon', 'M'], ['Despina', 'F'], ['Enceladus', 'M'], ['Erinome', 'F'], ['Fenrir', 'M'], ['Gacrux', 'F'],
  ['Iapetus', 'M'], ['Kore', 'F'], ['Laomedeia', 'F'], ['Leda', 'F'], ['Orus', 'M'], ['Pulcherrima', 'F'], ['Puck', 'M'],
  ['Rasalgethi', 'M'], ['Sadachbia', 'M'], ['Sadaltager', 'M'], ['Schedar', 'M'], ['Sulafat', 'F'], ['Umbriel', 'M'],
  ['Vindemiatrix', 'F'], ['Zephyr', 'F'], ['Zubenelgenubi', 'M'],
];
export const GOOGLE_PL_VOICES: CatalogVoice[] = [
  ...CHIRP3_HD.map(([n, gender]) => ({ name: `pl-PL-Chirp3-HD-${n}`, gender, model: 'chirp3-hd' })),
  { name: 'pl-PL-Wavenet-F', gender: 'F', model: 'wavenet' },
  { name: 'pl-PL-Wavenet-G', gender: 'M', model: 'wavenet' },
  { name: 'pl-PL-Standard-F', gender: 'F', model: 'standard' },
  { name: 'pl-PL-Standard-G', gender: 'M', model: 'standard' },
];

/** Голоси pl-PL з офіційної таблиці Azure Speech (Language support → Text to speech, сторінка від 2026-09-09). */
export const AZURE_PL_VOICES: CatalogVoice[] = [
  { name: 'pl-PL-ZofiaNeural', gender: 'F', model: 'neural' },
  { name: 'pl-PL-AgnieszkaNeural', gender: 'F', model: 'neural' },
  { name: 'pl-PL-MarekNeural', gender: 'M', model: 'neural' },
];

/**
 * Моделі ElevenLabs, у яких польська є серед підтримуваних мов. Multilingual v2 і Flash v2.5 звірено зі сторінкою
 * docs «Text to Speech» 2026-10-26 (Polish у списку 29 мов v2; Flash v2.5 — «усі мови v2» плюс три). v3/v4 — за
 * сторінкою Models; перед вибором звірити ще раз.
 */
export const ELEVENLABS_PL_MODELS = ['eleven_multilingual_v2', 'eleven_flash_v2_5', 'eleven_turbo_v2_5', 'eleven_v3', 'eleven_v3_conversational', 'eleven_v4', 'eleven_v4_turbo'] as const;

/**
 * Готові (premade) голоси ElevenLabs, які не можна брати типовими для польської. 21m00Tcm4TlvDq8ikWAM — Rachel,
 * американська англійська, типовий голос у коді до V8.1: multilingual-модель прочитає польський текст, але з
 * англійською вимовою. Польський голос — з Voice Library (мова pl), ID вибирає людина після прослуховування.
 */
export const ELEVENLABS_PREMADE_ENGLISH = ['21m00Tcm4TlvDq8ikWAM'];

/** Тариф: ціна після безкоштовного обсягу, доларів за 1 млн символів. */
export type Price = { usdPerMillion: number; freeCharsPerMonth: number; note: string; source: string };

export const PRICES: Record<string, Price> = {
  'google:chirp3-hd': {
    usdPerMillion: 30, freeCharsPerMonth: 1_000_000,
    note: 'Chirp 3: HD — перші 1 млн символів на місяць безкоштовно, далі $30 за 1 млн. Потрібен увімкнений billing.',
    source: 'https://cloud.google.com/text-to-speech/pricing',
  },
  'google:wavenet': {
    usdPerMillion: 4, freeCharsPerMonth: 4_000_000,
    note: 'WaveNet (у таблиці Legacy) — 4 млн символів на місяць безкоштовно, далі $4 за 1 млн. Потрібен billing.',
    source: 'https://cloud.google.com/text-to-speech/pricing',
  },
  'google:standard': {
    usdPerMillion: 4, freeCharsPerMonth: 4_000_000,
    note: 'Standard — 4 млн символів на місяць безкоштовно, далі $4 за 1 млн. Найпростіша якість.',
    source: 'https://cloud.google.com/text-to-speech/pricing',
  },
  'azure:neural': {
    usdPerMillion: 15, freeCharsPerMonth: 0,
    note: 'S1 Neural: $15 за 1 млн (Azure Retail Prices API, westeurope). 0,5 млн символів на місяць безкоштовно — лише ресурс рівня F0 (окремий безкоштовний рівень з обмеженнями).',
    source: 'https://azure.microsoft.com/pricing/details/cognitive-services/speech-services/',
  },
  'elevenlabs:eleven_multilingual_v2': {
    usdPerMillion: 80, freeCharsPerMonth: 0,
    note: 'API: $0.08 за 1 тис. символів. Підписка Starter $6/міс: на сторінці ElevenAPI ≈75 тис. символів v2, на сторінці ElevenCreative — 30 тис. кредитів. Кредити ≠ символи: звірити в кабінеті.',
    source: 'https://elevenlabs.io/pricing/api',
  },
  'elevenlabs:eleven_flash_v2_5': {
    usdPerMillion: 40, freeCharsPerMonth: 0,
    note: 'API: $0.04 за 1 тис. символів (Flash / Turbo). Starter: ≈150 тис. символів Flash на сторінці ElevenAPI.',
    source: 'https://elevenlabs.io/pricing/api',
  },
};

export function priceFor(provider: string, model: string): Price | null {
  return PRICES[`${provider}:${model}`] ?? null;
}

/** Оцінка вартості в доларах: символи понад безкоштовний місячний обсяг × ціна. Без податків і курсу валют. */
export function estimateUsd(chars: number, price: Price, alreadyUsedThisMonth = 0): number {
  const freeLeft = Math.max(0, price.freeCharsPerMonth - alreadyUsedThisMonth);
  const billable = Math.max(0, chars - freeLeft);
  return Math.round(((billable * price.usdPerMillion) / 1_000_000) * 100) / 100;
}

export type Candidate = {
  id: string;
  provider: 'google' | 'azure' | 'elevenlabs';
  /** Порожньо — ID голосу ще треба вибрати (ElevenLabs Voice Library: список у GET /api/admin/tts/voices, у прогін — --voice). */
  voice: string;
  model: string;
  gender: Gender | null;
  role: 'candidate' | 'current' | 'baseline';
  note: string;
};

/**
 * Кандидати першого раунду сліпого тесту. Це пропозиція до прослуховування, а не вибір:
 * якість польської артикуляції підтверджує лише оцінка людиною (human review — PENDING).
 */
export const CANDIDATES: Candidate[] = [
  { id: 'g-chirp-kore', provider: 'google', voice: 'pl-PL-Chirp3-HD-Kore', model: 'chirp3-hd', gender: 'F', role: 'candidate', note: 'Chirp 3: HD, жіночий' },
  { id: 'g-chirp-aoede', provider: 'google', voice: 'pl-PL-Chirp3-HD-Aoede', model: 'chirp3-hd', gender: 'F', role: 'candidate', note: 'Chirp 3: HD, жіночий' },
  { id: 'g-chirp-charon', provider: 'google', voice: 'pl-PL-Chirp3-HD-Charon', model: 'chirp3-hd', gender: 'M', role: 'candidate', note: 'Chirp 3: HD, чоловічий' },
  { id: 'g-chirp-puck', provider: 'google', voice: 'pl-PL-Chirp3-HD-Puck', model: 'chirp3-hd', gender: 'M', role: 'candidate', note: 'Chirp 3: HD, чоловічий' },
  { id: 'g-wavenet-f', provider: 'google', voice: 'pl-PL-Wavenet-F', model: 'wavenet', gender: 'F', role: 'candidate', note: 'WaveNet, жіночий (дешевий резерв)' },
  { id: 'g-wavenet-g', provider: 'google', voice: 'pl-PL-Wavenet-G', model: 'wavenet', gender: 'M', role: 'candidate', note: 'WaveNet, чоловічий (дешевий резерв)' },
  { id: 'g-wavenet-a', provider: 'google', voice: 'pl-PL-Wavenet-A', model: 'wavenet', gender: null, role: 'current', note: 'Типовий голос у коді; немає в офіційному списку від 2026-10-22 — перевірити, чи синтезується взагалі' },
  { id: 'g-standard-g', provider: 'google', voice: 'pl-PL-Standard-G', model: 'standard', gender: 'M', role: 'baseline', note: 'Нижня планка якості' },
  { id: 'az-zofia', provider: 'azure', voice: 'pl-PL-ZofiaNeural', model: 'neural', gender: 'F', role: 'candidate', note: 'Azure Neural, жіночий (типовий для Azure у коді)' },
  { id: 'az-agnieszka', provider: 'azure', voice: 'pl-PL-AgnieszkaNeural', model: 'neural', gender: 'F', role: 'candidate', note: 'Azure Neural, жіночий' },
  { id: 'az-marek', provider: 'azure', voice: 'pl-PL-MarekNeural', model: 'neural', gender: 'M', role: 'candidate', note: 'Azure Neural, чоловічий' },
  { id: 'el-pl-1', provider: 'elevenlabs', voice: '', model: 'eleven_multilingual_v2', gender: 'M', role: 'candidate', note: 'Польський голос із Voice Library (напр. «Piotr» або «Pawel»): ID — з GET /api/admin/tts/voices?provider=elevenlabs, у прогін — через --voice' },
  { id: 'el-pl-2', provider: 'elevenlabs', voice: '', model: 'eleven_multilingual_v2', gender: 'F', role: 'candidate', note: 'Польський голос із Voice Library (напр. «Magdalena» або «Beata»): ID — з GET /api/admin/tts/voices?provider=elevenlabs, у прогін — через --voice' },
  { id: 'el-pl-1-flash', provider: 'elevenlabs', voice: '', model: 'eleven_flash_v2_5', gender: 'M', role: 'candidate', note: 'Той самий голос, що el-pl-1, на моделі Flash v2.5 (удвічі дешевше)' },
  { id: 'el-rachel', provider: 'elevenlabs', voice: '21m00Tcm4TlvDq8ikWAM', model: 'eleven_multilingual_v2', gender: 'F', role: 'current', note: 'Типовий голос у коді: англійський premade Rachel, не польський' },
];

export type BenchmarkPhrase = {
  id: string;
  text: string;
  /** Що саме слухати. */
  focus: string;
  /** Обов'язкова фраза із завдання власника. */
  required?: boolean;
  /** Які швидкості синтезувати; типово обидві. */
  rates?: SpeechRate[];
};

/**
 * Фрази бенчмарку: обов'язкові із завдання V8.1 і доповнення (наголос, шиплячі, ą/ę, ł, ź/ż, cz/sz,
 * числа, лапки, діалоги, питання). Кожна — на звичайній і сповільненій швидкості, якщо не сказано інакше.
 */
export const BENCHMARK_PHRASES: BenchmarkPhrase[] = [
  { id: 'r01', text: 'W Warszawie', focus: 'прийменник «w» злитно з наступним словом [vvarˈʂavjɛ], не «duże wu»', required: true },
  { id: 'r02', text: 'W Żabce', focus: '«w» дзвінке перед ż: [ˈvʐapt͡sɛ]; не назва літери', required: true },
  { id: 'r03', text: 'woda', focus: 'w = [v], o відкрите', required: true },
  { id: 'r04', text: 'łódź', focus: 'ł = [w], ó = [u], кінцеве dź оглушується до [t͡ɕ]', required: true },
  { id: 'r05', text: 'pączek', focus: 'ą перед cz — [ɔn], cz тверде', required: true },
  { id: 'r06', text: 'książka', focus: 'ks + ią + ż, ż оглушується перед k [ʂ]', required: true },
  { id: 'r07', text: 'szczęście', focus: 'szcz і ść поруч, ę перед ś — носове', required: true },
  { id: 'r08', text: 'źródło', focus: 'ź м\'яке, ó = [u], dł', required: true },
  { id: 'r09', text: 'dziękuję', focus: 'dzi м\'яке, кінцеве ę майже [ɛ] без сильної назалізації', required: true },
  { id: 'r10', text: 'przepraszam', focus: 'prz оглушене [pʂ], наголос на «pra»', required: true },
  { id: 'r11', text: 'żółć', focus: 'ż + ó + ł + ć в одному складі', required: true },
  { id: 'r12', text: 'gęś', focus: 'ę перед ś — носове [ɛ̃], кінцеве ś', required: true },
  { id: 'r13', text: 'sześć', focus: 'sz проти ś/ć: [ʂɛɕt͡ɕ]', required: true },
  { id: 'r14', text: 'proszę panią', focus: 'ввічлива форма, ę в кінці слова, ią', required: true },
  { id: 'r15', text: 'Poproszę hot doga i kawę.', focus: 'запозичення «hot dog» у відмінку, кінцеве ę', required: true },
  { id: 'r16', text: 'Jadę tramwajem.', focus: 'кінцеве ę в «jadę» майже [ɛ], наголос tram-WA-jem', required: true },
  { id: 'r17', text: 'Biuro jest na trzecim piętrze.', focus: 'trz [tʂ], rz після t оглушується, piętrze', required: true },
  { id: 's01', text: 'uniwersytet', focus: 'наголос на передостанньому складі: u-ni-wer-SY-tet' },
  { id: 's02', text: 'matematyka', focus: 'виняток наголосу: ma-TE-ma-ty-ka (допустимо і ma-te-MA-ty-ka в розмовній)' },
  { id: 's03', text: 'Byliśmy wczoraj w muzeum.', focus: 'винятки наголосу: BY-li-śmy (у розмовній by-LI-śmy), MU-ze-um; «w muzeum» злитно' },
  { id: 's04', text: 'W Szczebrzeszynie chrząszcz brzmi w trzcinie.', focus: 'скоромовка: szcz, rz, chrz, trz; «w» перед sz/trz → [f]', rates: ['normal', 'slow'] },
  { id: 's05', text: 'Czy to jest ciasto czy ciastko?', focus: 'cz проти ci, інтонація альтернативного питання' },
  { id: 's06', text: 'Szymon kupił śliwki i szynkę.', focus: 'sz проти ś, i/y' },
  { id: 's07', text: 'Idę do sklepu, bo nie mam mąki.', focus: 'кінцеве ę (idę) і ą перед k (mąki)' },
  { id: 's08', text: 'Łukasz ma małe łóżko.', focus: 'ł = [w] тричі, ó = [u]' },
  { id: 's09', text: 'Może źle zrozumiałem rzekę.', focus: 'ż, ź, rz — три різні «ж/зь»' },
  { id: 'n01', text: 'Mam dwadzieścia pięć lat.', focus: 'числівник словами' },
  { id: 'n02', text: 'Pociąg odjeżdża o 7:45.', focus: 'час цифрами: «o siódmej czterdzieści pięć»' },
  { id: 'n03', text: 'Bilet kosztuje 4,60 zł.', focus: 'ціна цифрами й скорочення «zł»: «cztery złote sześćdziesiąt»' },
  { id: 'n04', text: 'Mieszkam na ul. Piotrkowskiej 104.', focus: 'скорочення «ul.» і номер будинку' },
  { id: 'n05', text: 'Tramwaj numer 4 jedzie na Dworzec Główny.', focus: 'число в називному відмінку, назва вокзалу' },
  { id: 'q01', text: 'Nad drzwiami jest napis „Wyjście”.', focus: 'польські лапки „…”: без вимови символів, нормальна пауза' },
  { id: 'q02', text: '«Dzień dobry» — powiedział sprzedawca.', focus: 'кутові лапки і тире: пауза, без вимови «minus»' },
  { id: 'i01', text: 'Gdzie jest dworzec?', focus: 'інтонація питання зі словом-питанням' },
  { id: 'i02', text: 'Czy mogę zapłacić kartą?', focus: 'загальне питання з «czy», висхідна інтонація' },
  { id: 'p01', text: 'Mieszkam w Łodzi, a pracuję we Wrocławiu.', focus: '«w Łodzi» і «we Wrocławiu»: прийменник не читається як літера' },
  { id: 'd01', text: '— Dzień dobry! Poproszę bilet do Krakowa. — Normalny czy ulgowy? — Normalny, proszę.', focus: 'діалог на вокзалі: зміна реплік, паузи на тире' },
  { id: 'd02', text: '— Płaci pan kartą? — Tak, kartą. — Dziękuję, miłego dnia!', focus: 'діалог у Żabce: коротке питання, подяка' },
  { id: 'd03', text: '— Przepraszam, jak dojść do rynku? — Prosto, a potem w lewo.', focus: 'питання дороги, «w lewo» злитно' },
  { id: 'l01', text: 'W', focus: 'окрема літера в уроці алфавіту: сервер озвучує її назву «wu», а не «duże wu»', rates: ['normal'] },
];

/** Усього символів у фразах бенчмарку з урахуванням швидкостей (для оцінки вартості одного голосу). */
export function benchmarkChars(phrases: BenchmarkPhrase[] = BENCHMARK_PHRASES): { phrases: number; samples: number; chars: number } {
  let samples = 0;
  let chars = 0;
  for (const p of phrases) {
    const rates = p.rates ?? ['normal', 'slow'];
    samples += rates.length;
    chars += [...p.text].length * rates.length;
  }
  return { phrases: phrases.length, samples, chars };
}

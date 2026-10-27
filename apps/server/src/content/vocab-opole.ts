/**
 * Словник Ополя (розширення курсу, уроки 5–10): плани на вихідні, запрошення, висловлення думки, концерт, пісня, конкурс.
 * Лексика нейтральна: сленг із уроків 1–4 тут не поширюється, а слово «wpaść» позначено в прикладі як розмовне.
 * Кожне слово має природний приклад із перекладом. Приблизне прочитання будується за правилами (pron.ts).
 * Слова razem, umówić się, spacer, koncert уже є в словнику Варшави й життя — тут не повторюються.
 */
import { polishCyrillic, type Cefr } from '@polski-go/shared';
import { t } from './builders';
import type { VocabSeed } from './vocab';

type Ex = [pl: string, uk: string, ru: string, en: string];

const w = (pl: string, pos: string, cefr: Cefr, uk: string, ru: string, en: string, topics: string[], ex: Ex, forms?: Record<string, string>): VocabSeed => ({
  pl, pos, tr: t(uk, ru, en), pron: polishCyrillic(pl, 'uk').replace(/́/g, ''), cefr, topics, forms,
  examples: [{ pl: ex[0], tr: t(ex[1], ex[2], ex[3]) }],
});

export const OPOLE_VOCAB: VocabSeed[] = [
  // ── Плани на вихідні ──
  w('weekend', 'noun', 'A1', 'вихідні', 'выходные', 'weekend', ['time', 'phrases'],
    ['W weekend jadę do Krakowa.', 'На вихідних я їду до Кракова.', 'На выходных я еду в Краков.', 'This weekend I\'m going to Kraków.'], { loc: 'w weekend' }),
  w('plan', 'noun', 'A1', 'план', 'план', 'plan', ['time', 'phrases'],
    ['Jakie masz plany na sobotę?', 'Які в тебе плани на суботу?', 'Какие у тебя планы на субботу?', 'What are your plans for Saturday?'], { pl: 'plany' }),
  w('pójść', 'verb', 'A1', 'піти', 'пойти', 'to go (on foot), to go out', ['phrases', 'daily'],
    ['Pójdziemy razem na spacer?', 'Підемо разом на прогулянку?', 'Пойдём вместе на прогулку?', 'Shall we go for a walk together?'], { ja: 'pójdę', my: 'pójdziemy' }),
  w('wpaść', 'verb', 'A2', 'заскочити, зазирнути (в гості; розмовне)', 'заскочить, заглянуть (в гости; разговорное)', 'to drop by (informal)', ['phrases', 'people'],
    ['Wpadnę do ciebie po pracy.', 'Я заскочу до тебе після роботи.', 'Я заскочу к тебе после работы.', 'I\'ll drop by after work.'], { ja: 'wpadnę' }),

  // ── Запрошення ──
  w('zaprosić', 'verb', 'A2', 'запросити', 'пригласить', 'to invite', ['phrases', 'people'],
    ['Chcę cię zaprosić na urodziny.', 'Хочу запросити тебе на день народження.', 'Хочу пригласить тебя на день рождения.', 'I want to invite you to my birthday.'], { ja: 'zaproszę' }),
  w('zaproszenie', 'noun', 'A2', 'запрошення', 'приглашение', 'invitation', ['phrases', 'people'],
    ['Dziękuję za zaproszenie!', 'Дякую за запрошення!', 'Спасибо за приглашение!', 'Thank you for the invitation!'], { gen: 'zaproszenia' }),
  w('dać radę', 'phrase', 'A2', 'встигнути, зуміти (розмовне)', 'успеть, суметь (разговорное)', 'to manage to (informal)', ['phrases'],
    ['Niestety jutro nie dam rady przyjść.', 'На жаль, завтра я не зможу прийти.', 'К сожалению, завтра я не смогу прийти.', 'Unfortunately I won\'t be able to come tomorrow.'], { ja: 'dam radę' }),
  w('innym razem', 'phrase', 'A2', 'іншим разом', 'в другой раз', 'another time', ['phrases', 'time'],
    ['Może innym razem, dzisiaj mam dużo pracy.', 'Може, іншим разом, сьогодні в мене багато роботи.', 'Может, в другой раз, сегодня у меня много работы.', 'Maybe another time, I have a lot of work today.']),
  w('impreza', 'noun', 'A2', 'вечірка', 'вечеринка', 'party', ['people', 'phrases'],
    ['W sobotę jest impreza u Kuby.', 'У суботу в Куби вечірка.', 'В субботу у Кубы вечеринка.', 'There\'s a party at Kuba\'s on Saturday.'], { loc: 'na imprezie' }),
  w('urodziny', 'noun', 'A1', 'день народження', 'день рождения', 'birthday', ['people', 'time'],
    ['Mam urodziny w sobotę.', 'У мене день народження в суботу.', 'У меня день рождения в субботу.', 'My birthday is on Saturday.'], { gen: 'urodzin' }),

  // ── Висловити думку ──
  w('moim zdaniem', 'phrase', 'A2', 'на мою думку', 'по-моему', 'in my opinion', ['phrases'],
    ['Moim zdaniem ten film jest bardzo dobry.', 'На мою думку, цей фільм дуже хороший.', 'По-моему, этот фильм очень хороший.', 'In my opinion this film is very good.']),
  w('zgadzać się', 'verb', 'A2', 'погоджуватися', 'соглашаться', 'to agree', ['phrases'],
    ['Zgadzam się z tobą.', 'Я з тобою погоджуюся.', 'Я с тобой соглашаюсь.', 'I agree with you.'], { ja: 'zgadzam się', ty: 'zgadzasz się' }),
  w('to zależy', 'phrase', 'A2', 'це залежить', 'это зависит', 'it depends', ['phrases'],
    ['Czy lubisz koncerty? — To zależy, jaka muzyka.', 'Чи любиш концерти? — Це залежить, яка музика.', 'Любишь концерты? — Это зависит от того, какая музыка.', 'Do you like concerts? — It depends what music.']),
  w('ciekawy', 'adj', 'A1', 'цікавий', 'интересный', 'interesting', ['phrases'],
    ['To był ciekawy koncert.', 'Це був цікавий концерт.', 'Это был интересный концерт.', 'It was an interesting concert.'], { f: 'ciekawa', n: 'ciekawe' }),
  w('nudny', 'adj', 'A2', 'нудний', 'скучный', 'boring', ['phrases'],
    ['Ten film jest trochę nudny.', 'Цей фільм трохи нудний.', 'Этот фильм немного скучный.', 'This film is a bit boring.'], { f: 'nudna', n: 'nudne' }),
  w('szkoda', 'noun', 'A1', 'шкода', 'жаль', 'what a pity', ['phrases'],
    ['Szkoda, że nie możesz przyjść.', 'Шкода, що ти не можеш прийти.', 'Жаль, что ты не можешь прийти.', 'What a pity you can\'t come.']),

  // ── Концерт ──
  w('scena', 'noun', 'A1', 'сцена', 'сцена', 'stage', ['music'],
    ['Zespół wchodzi na scenę o dwudziestej.', 'Гурт виходить на сцену о двадцятій.', 'Группа выходит на сцену в двадцать часов.', 'The band comes on stage at eight in the evening.'], { acc: 'scenę' }),
  w('publiczność', 'noun', 'A2', 'публіка, глядачі', 'публика, зрители', 'audience', ['music'],
    ['Publiczność śpiewa razem z zespołem.', 'Публіка співає разом із гуртом.', 'Публика поёт вместе с группой.', 'The audience sings along with the band.']),
  w('występ', 'noun', 'A2', 'виступ', 'выступление', 'performance', ['music'],
    ['Jej występ trwa pół godziny.', 'Її виступ триває пів години.', 'Её выступление длится полчаса.', 'Her performance lasts half an hour.'], { gen: 'występu' }),
  w('zespół', 'noun', 'A2', 'гурт, колектив', 'группа, коллектив', 'band, ensemble', ['music'],
    ['Ten zespół gra w sobotę w Opolu.', 'Цей гурт грає в суботу в Ополі.', 'Эта группа играет в субботу в Ополе.', 'This band plays in Opole on Saturday.'], { ins: 'zespołem' }),
  w('na żywo', 'phrase', 'A2', 'наживо', 'вживую', 'live', ['music'],
    ['Lubię słuchać muzyki na żywo.', 'Люблю слухати музику наживо.', 'Люблю слушать музыку вживую.', 'I like listening to live music.']),
  w('festiwal', 'noun', 'A2', 'фестиваль', 'фестиваль', 'festival', ['music'],
    ['Festiwal piosenki w Opolu jest bardzo znany.', 'Фестиваль пісні в Ополі дуже відомий.', 'Фестиваль песни в Ополе очень известен.', 'The song festival in Opole is very well known.'], { loc: 'na festiwalu' }),

  // ── Пісня й музика ──
  w('piosenka', 'noun', 'A1', 'пісня', 'песня', 'song', ['music'],
    ['To moja ulubiona piosenka.', 'Це моя улюблена пісня.', 'Это моя любимая песня.', 'This is my favourite song.'], { gen: 'piosenki', acc: 'piosenkę' }),
  w('śpiewać', 'verb', 'A1', 'співати', 'петь', 'to sing', ['music'],
    ['Ona pięknie śpiewa.', 'Вона гарно співає.', 'Она красиво поёт.', 'She sings beautifully.'], { ja: 'śpiewam', ona: 'śpiewa' }),
  w('słuchać', 'verb', 'A1', 'слухати', 'слушать', 'to listen to', ['music'],
    ['Lubię słuchać muzyki w tramwaju.', 'Люблю слухати музику в трамваї.', 'Люблю слушать музыку в трамвае.', 'I like listening to music on the tram.'], { ja: 'słucham' }),
  w('muzyka', 'noun', 'A1', 'музика', 'музыка', 'music', ['music'],
    ['Jaką muzykę lubisz?', 'Яку музику ти любиш?', 'Какую музыку ты любишь?', 'What music do you like?'], { gen: 'muzyki', acc: 'muzykę' }),
  w('ulubiony', 'adj', 'A1', 'улюблений', 'любимый', 'favourite', ['music', 'phrases'],
    ['Jaki jest twój ulubiony zespół?', 'Який твій улюблений гурт?', 'Какая твоя любимая группа?', 'What is your favourite band?'], { f: 'ulubiona', n: 'ulubione' }),
  w('wokalista', 'noun', 'A2', 'вокаліст', 'вокалист', 'singer (male)', ['music'],
    ['Wokalista tego zespołu ma bardzo mocny głos.', 'У вокаліста цього гурту дуже сильний голос.', 'У вокалиста этой группы очень сильный голос.', 'This band\'s singer has a very strong voice.'], { f: 'wokalistka' }),
  w('tekst', 'noun', 'A2', 'текст (пісні)', 'текст (песни)', 'lyrics, text', ['music'],
    ['Znasz tekst tej piosenki?', 'Ти знаєш текст цієї пісні?', 'Ты знаешь текст этой песни?', 'Do you know the lyrics of this song?'], { gen: 'tekstu' }),

  // ── Конкурс ──
  w('głosować', 'verb', 'A2', 'голосувати', 'голосовать', 'to vote', ['music', 'phrases'],
    ['Głosuję na ten zespół.', 'Я голосую за цей гурт.', 'Я голосую за эту группу.', 'I\'m voting for this band.'], { ja: 'głosuję' }),
  w('wygrać', 'verb', 'A2', 'виграти', 'выиграть', 'to win', ['music', 'phrases'],
    ['Kto wygra konkurs w tym roku?', 'Хто виграє конкурс цього року?', 'Кто выиграет конкурс в этом году?', 'Who will win the contest this year?'], { ja: 'wygram', on: 'wygra' }),
  w('nagroda', 'noun', 'A2', 'нагорода, приз', 'награда, приз', 'prize, award', ['music', 'phrases'],
    ['Główna nagroda to koncert w Warszawie.', 'Головна нагорода — концерт у Варшаві.', 'Главный приз — концерт в Варшаве.', 'The main prize is a concert in Warsaw.'], { gen: 'nagrody' }),
  w('konkurs', 'noun', 'A2', 'конкурс', 'конкурс', 'contest', ['music', 'phrases'],
    ['Konkurs piosenki trwa trzy dni.', 'Конкурс пісні триває три дні.', 'Конкурс песни длится три дня.', 'The song contest lasts three days.'], { gen: 'konkursu' }),
  w('jury', 'noun', 'A2', 'журі', 'жюри', 'jury', ['music'],
    ['Jury wybiera najlepszą piosenkę.', 'Журі обирає найкращу пісню.', 'Жюри выбирает лучшую песню.', 'The jury chooses the best song.']),
  w('finał', 'noun', 'A2', 'фінал', 'финал', 'final', ['music', 'phrases'],
    ['Finał jest w sobotę wieczorem.', 'Фінал у суботу ввечері.', 'Финал в субботу вечером.', 'The final is on Saturday evening.'], { loc: 'w finale' }),
];

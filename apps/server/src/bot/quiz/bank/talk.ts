/** Вопросы бота: общение (приветствия, вежливость, ложные друзья). */
import { q, type QuizQuestion } from './types';

export const TALK: QuizQuestion[] = [
  q({
    id: 'talk-dzien-dobry', category: 'talk', cefr: 'A1', kind: 'situation', image: 'stop-cafe',
    prompt: {
      ru: 'В 20:00 ты заходишь в кафе на заправке. Как поздороваться?',
      uk: 'О 20:00 ти заходиш у кафе на заправці. Як привітатися?',
      en: 'At 8 p.m. you walk into a petrol station café. How do you greet the staff?',
    },
    options: ['Dobry wieczór!', 'Dobranoc!', 'Do widzenia!', 'Na razie!'],
    answer: 0,
    explain: {
      ru: 'Вечером здороваются «Dobry wieczór!» (днём — «Dzień dobry»). «Dobranoc» — только на прощание перед сном, «Do widzenia» и «Na razie» — тоже прощание.',
      uk: 'Увечері вітаються «Dobry wieczór!» (удень — «Dzień dobry»). «Dobranoc» — лише на прощання перед сном, «Do widzenia» і «Na razie» — теж прощання.',
      en: 'In the evening you say «Dobry wieczór!» (in the day — «Dzień dobry»). «Dobranoc» is only for parting at night, and «Do widzenia» and «Na razie» are goodbyes too.',
    },
  }),
  q({
    id: 'talk-jak-sie-masz', category: 'talk', cefr: 'A2', kind: 'reply', image: 'mieszkanie',
    prompt: {
      ru: 'Пожилая соседка спрашивает тебя: «Jak się pan miewa?» Как вежливо ответить?',
      uk: 'Літня сусідка питає тебе: «Jak się pan miewa?» Як увічливо відповісти?',
      en: 'An elderly neighbour asks you: «Jak się pan miewa?» What is the polite reply?',
    },
    options: ['Dziękuję, dobrze. A pani?', 'Dziękuję, dobrze. A ty?', 'Dziękuję, dobrze. A pan?', 'Dziękuję, dobrze. A wy?'],
    answer: 0,
    explain: {
      ru: 'Пожилой соседке отвечают на «pani»: «A pani?». «A ty?» — друзьям и ровесникам, «a pan?» — мужчине, «a wy?» — нескольким людям сразу.',
      uk: 'Літній сусідці відповідають на «pani»: «A pani?». «A ty?» — друзям і ровесникам, «a pan?» — чоловікові, «a wy?» — кільком людям одразу.',
      en: 'An elderly lady is addressed as «pani»: «A pani?». «A ty?» is for friends, «a pan?» for a man, «a wy?» for several people.',
    },
  }),
  q({
    id: 'talk-uroda', category: 'talk', cefr: 'A2', kind: 'meaning', image: 'mieszkanie',
    prompt: {
      ru: 'О подруге говорят: «Ona bardzo dba o urodę.» Что это значит?',
      uk: 'Про подругу кажуть: «Ona bardzo dba o urodę.» Що це означає?',
      en: 'People say about a friend: «Ona bardzo dba o urodę.» What does it mean?',
    },
    options: {
      ru: ['следит за внешностью', 'ухаживает за родными', 'заботится об урожае', 'готовится к родам'],
      uk: ['стежить за зовнішністю', 'доглядає рідних', 'дбає про врожай', 'готується до пологів'],
      en: ['takes care of her looks', 'looks after her family', 'tends to her harvest', 'is preparing to give birth'],
    },
    answer: 0,
    explain: {
      ru: '«Uroda» — красота, внешность («dbać o urodę» — следить за собой). Не путать с «уродством»! Семья — «rodzina», урожай — «plon», роды — «poród».',
      uk: '«Uroda» — врода, краса («dbać o urodę» — стежити за собою). Родина — «rodzina», врожай — «plon», пологи — «poród».',
      en: '«Uroda» means beauty or looks («dbać o urodę» — to look after one\'s appearance). Family is «rodzina», a harvest — «plon», childbirth — «poród».',
    },
  }),
  q({
    id: 'talk-dywan', category: 'talk', cefr: 'A2', kind: 'meaning', image: 'mieszkanie',
    prompt: {
      ru: 'Друзья: «Kupiliśmy nowy dywan do salonu.» Что они купили?',
      uk: 'Друзі: «Kupiliśmy nowy dywan do salonu.» Що вони купили?',
      en: 'Friends say: «Kupiliśmy nowy dywan do salonu.» What did they buy?',
    },
    options: {
      ru: ['ковёр', 'диван', 'стол', 'торшер'],
      uk: ['килим', 'диван', 'стіл', 'торшер'],
      en: ['a rug', 'a sofa', 'a table', 'a lamp'],
    },
    answer: 0,
    explain: {
      ru: 'Ложный друг: «dywan» — ковёр, а диван — «kanapa» или «sofa». Стол — «stół», торшер — «lampa stojąca», «salon» — гостиная.',
      uk: 'Хибний друг: «dywan» — килим, а диван — «kanapa» або «sofa». Стіл — «stół», торшер — «lampa stojąca», «salon» — вітальня.',
      en: 'A false friend: «dywan» is a rug, while a sofa is «kanapa» or «sofa». A table is «stół», a floor lamp — «lampa stojąca», «salon» — the living room.',
    },
  }),
  q({
    id: 'talk-pani', category: 'talk', cefr: 'B1', kind: 'situation', image: 'warszawa-starowka',
    prompt: {
      ru: 'Как вежливо попросить незнакомую женщину на улице помочь тебе?',
      uk: 'Як увічливо попросити незнайому жінку на вулиці допомогти тобі?',
      en: 'How do you politely ask a woman you don\'t know in the street for help?',
    },
    options: ['Czy mogłaby mi pani pomóc?', 'Czy mogłabyś mi pani pomóc?', 'Czy mógłby mi pani pomóc?', 'Czy mogłaby mi pan pomóc?'],
    answer: 0,
    explain: {
      ru: 'С «pani» глагол в 3-м лице женского рода: «Czy mogłaby mi pani pomóc?». «Mogłabyś» — форма на «ты», её нельзя смешивать с «pani»; «mógłby» — мужской род; «pan» — обращение к мужчине.',
      uk: 'З «pani» дієслово в 3-й особі жіночого роду: «Czy mogłaby mi pani pomóc?». «Mogłabyś» — форма на «ти», її не можна змішувати з «pani»; «mógłby» — чоловічий рід; «pan» — звертання до чоловіка.',
      en: 'With «pani» the verb is third person feminine: «Czy mogłaby mi pani pomóc?». «Mogłabyś» is the informal "you" form and can\'t mix with «pani»; «mógłby» is masculine; «pan» addresses a man.',
    },
  }),
];

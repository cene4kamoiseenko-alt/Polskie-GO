/**
 * Точкові правки готових завдань (заміна абсурдних варіантів, уточнення текстів) — генерує `scripts/task-edits.ts diff`.
 * Ключ — сталий id завдання (`e_<урок>_<номер>`); seed (`taskEditSql`) оновлює рядок лише там, де в БД досі `from`.
 * Порядок важливий: друга правка того ж завдання застосовується після першої.
 */
export type TaskCore = { type: string; skill: string; data: unknown; explanation: unknown };
export type TaskEdit = { lesson: string; n: number; from: TaskCore; to: TaskCore };
/** Правка тексту уроку (title, topic, explanation, examples): лише там, де в БД досі `from`. */
export type LessonEdit = { slug: string; column: 'title' | 'topic' | 'explanation' | 'examples'; from: unknown; to: unknown };

export const TASK_EDITS: TaskEdit[] = [
 {
  "lesson": "waw-1-czesc",
  "n": 16,
  "from": {
   "type": "SITUATION",
   "skill": "situation.neighbour-hello",
   "data": {
    "npc": {
     "name": "Pan Zenon",
     "emoji": "👴🏻",
     "role": {
      "uk": "сусід, літній пан",
      "ru": "сосед, пожилой пан",
      "en": "an elderly neighbour"
     }
    },
    "scene": {
     "uk": "Ранок. На сходах зустрічаєш літнього сусіда пана Зенона.",
     "ru": "Утро. На лестнице встречаешь пожилого соседа пана Зенона.",
     "en": "Morning. You meet your elderly neighbour Mr Zenon on the stairs."
    },
    "steps": [
     {
      "npc": "Dzień dobry!",
      "npcTr": {
       "uk": "Добрий день!",
       "ru": "Добрый день!",
       "en": "Good morning!"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Dzień dobry, panie Zenonie!",
        "tr": {
         "uk": "Добрий день, пане Зеноне!",
         "ru": "Добрый день, пан Зенон!",
         "en": "Good morning, Mr Zenon!"
        }
       },
       {
        "id": "s0o1",
        "text": "Cześć, stary!",
        "tr": {
         "uk": "Привіт, старий!",
         "ru": "Привет, старик!",
         "en": "Hey, old man!"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "Зі старшим сусідом — формально: **Dzień dobry** + **pan** (panie Zenonie).",
       "ru": "Со старшим соседом — формально: **Dzień dobry** + **pan** (panie Zenonie).",
       "en": "With an older neighbour be formal: **Dzień dobry** + **pan** (panie Zenonie)."
      }
     },
     {
      "npc": "Do widzenia, miłego dnia!",
      "npcTr": {
       "uk": "До побачення, гарного дня!",
       "ru": "До свидания, хорошего дня!",
       "en": "Goodbye, have a nice day!"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Do widzenia, nawzajem!",
        "tr": {
         "uk": "До побачення, навзаєм!",
         "ru": "До свидания, и вам!",
         "en": "Goodbye, you too!"
        }
       },
       {
        "id": "s1o1",
        "text": "Dobranoc, smacznego!",
        "tr": {
         "uk": "На добраніч, смачного!",
         "ru": "Спокойной ночи, приятного аппетита!",
         "en": "Good night, enjoy your meal!"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "На побажання відповідають **nawzajem** — навзаєм.",
       "ru": "На пожелание отвечают **nawzajem** — и вам того же.",
       "en": "Reply to a wish with **nawzajem** — you too."
      }
     }
    ]
   },
   "explanation": null
  },
  "to": {
   "type": "SITUATION",
   "skill": "situation.neighbour-hello",
   "data": {
    "npc": {
     "name": "Pan Zenon",
     "emoji": "👴🏻",
     "role": {
      "uk": "сусід, літній пан",
      "ru": "сосед, пожилой пан",
      "en": "an elderly neighbour"
     }
    },
    "scene": {
     "uk": "Ранок. На сходах зустрічаєш літнього сусіда пана Зенона.",
     "ru": "Утро. На лестнице встречаешь пожилого соседа пана Зенона.",
     "en": "Morning. You meet your elderly neighbour Mr Zenon on the stairs."
    },
    "steps": [
     {
      "npc": "Dzień dobry!",
      "npcTr": {
       "uk": "Добрий день!",
       "ru": "Добрый день!",
       "en": "Good morning!"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Dzień dobry, panie Zenonie!",
        "tr": {
         "uk": "Добрий день, пане Зеноне!",
         "ru": "Добрый день, пан Зенон!",
         "en": "Good morning, Mr Zenon!"
        }
       },
       {
        "id": "s0o1",
        "text": "Cześć, stary!",
        "tr": {
         "uk": "Привіт, старий!",
         "ru": "Привет, старик!",
         "en": "Hey, old man!"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "Зі старшим сусідом — формально: **Dzień dobry** + **pan** (panie Zenonie).",
       "ru": "Со старшим соседом — формально: **Dzień dobry** + **pan** (panie Zenonie).",
       "en": "With an older neighbour be formal: **Dzień dobry** + **pan** (panie Zenonie)."
      }
     },
     {
      "npc": "Do widzenia, miłego dnia!",
      "npcTr": {
       "uk": "До побачення, гарного дня!",
       "ru": "До свидания, хорошего дня!",
       "en": "Goodbye, have a nice day!"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Do widzenia, nawzajem!",
        "tr": {
         "uk": "До побачення, навзаєм!",
         "ru": "До свидания, и вам!",
         "en": "Goodbye, you too!"
        }
       },
       {
        "id": "s1o1",
        "text": "Na razie, nawzajem!",
        "tr": {
         "uk": "Бувай, навзаєм!",
         "ru": "Пока, и вам!",
         "en": "See you, you too!"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "**Na razie** — неформальне «бувай», зі старшим сусідом так не прощаються. Формально: **Do widzenia**, а на побажання — **nawzajem**.",
       "ru": "**Na razie** — неформальное «пока», со старшим соседом так не прощаются. Формально: **Do widzenia**, а на пожелание — **nawzajem**.",
       "en": "**Na razie** is an informal \"see you\" — not for an older neighbour. Say **Do widzenia** and reply to the wish with **nawzajem**."
      }
     }
    ]
   },
   "explanation": null
  }
 },
 {
  "lesson": "waw-2-uprzejmosc",
  "n": 8,
  "from": {
   "type": "SITUATION",
   "skill": "situation.politeness",
   "data": {
    "npc": {
     "name": "Pan Marek",
     "emoji": "👴🏻",
     "role": {
      "uk": "перехожий на вулиці",
      "ru": "прохожий",
      "en": "a passer-by"
     }
    },
    "scene": {
     "uk": "На вулиці ти випадково наштовхуєшся на пана Марека.",
     "ru": "На улице ты случайно наталкиваешься на пана Марека.",
     "en": "You accidentally bump into Mr Marek on the street."
    },
    "steps": [
     {
      "npc": "Ojej!",
      "npcTr": {
       "uk": "Ой!",
       "ru": "Ой!",
       "en": "Ouch!"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Przepraszam!",
        "tr": {
         "uk": "Вибачте!",
         "ru": "Извините!",
         "en": "Sorry!"
        }
       },
       {
        "id": "s0o1",
        "text": "Smacznego!",
        "tr": {
         "uk": "Смачного!",
         "ru": "Приятного аппетита!",
         "en": "Enjoy your meal!"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "Якщо випадково когось зачепиш, скажи **Przepraszam!**",
       "ru": "Если случайно кого-то заденешь, скажи **Przepraszam!**",
       "en": "When you bump into someone, say **Przepraszam!**"
      }
     },
     {
      "npc": "Nic nie szkodzi.",
      "npcTr": {
       "uk": "Нічого страшного.",
       "ru": "Ничего страшного.",
       "en": "No problem."
      }
     }
    ]
   },
   "explanation": null
  },
  "to": {
   "type": "SITUATION",
   "skill": "situation.politeness",
   "data": {
    "npc": {
     "name": "Pan Marek",
     "emoji": "👴🏻",
     "role": {
      "uk": "перехожий на вулиці",
      "ru": "прохожий",
      "en": "a passer-by"
     }
    },
    "scene": {
     "uk": "На вулиці ти випадково наштовхуєшся на пана Марека.",
     "ru": "На улице ты случайно наталкиваешься на пана Марека.",
     "en": "You accidentally bump into Mr Marek on the street."
    },
    "steps": [
     {
      "npc": "Ojej!",
      "npcTr": {
       "uk": "Ой!",
       "ru": "Ой!",
       "en": "Ouch!"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Przepraszam!",
        "tr": {
         "uk": "Вибачте!",
         "ru": "Извините!",
         "en": "Sorry!"
        }
       },
       {
        "id": "s0o1",
        "text": "Dziękuję!",
        "tr": {
         "uk": "Дякую!",
         "ru": "Спасибо!",
         "en": "Thank you!"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "**Dziękuję** — подяка. Якщо випадково когось зачепиш, вибачаються: **Przepraszam!**",
       "ru": "**Dziękuję** — благодарность. Если случайно кого-то заденешь, извиняются: **Przepraszam!**",
       "en": "**Dziękuję** is \"thank you\". When you bump into someone, apologise: **Przepraszam!**"
      }
     },
     {
      "npc": "Nic nie szkodzi.",
      "npcTr": {
       "uk": "Нічого страшного.",
       "ru": "Ничего страшного.",
       "en": "No problem."
      }
     }
    ]
   },
   "explanation": null
  }
 },
 {
  "lesson": "waw-2-uprzejmosc",
  "n": 11,
  "from": {
   "type": "WORD_TRANSLATION",
   "skill": "vocab.politeness",
   "data": {
    "translation": {
     "uk": "Говоріть, будь ласка, повільніше.",
     "ru": "Говорите, пожалуйста, медленнее.",
     "en": "Please speak more slowly."
    },
    "options": [
     {
      "id": "o0",
      "text": "Proszę mówić wolniej."
     },
     {
      "id": "o1",
      "text": "Proszę mówić głośno."
     },
     {
      "id": "o2",
      "text": "Proszę nie mówić."
     }
    ],
    "answer": "o0"
   },
   "explanation": null
  },
  "to": {
   "type": "WORD_TRANSLATION",
   "skill": "vocab.politeness",
   "data": {
    "translation": {
     "uk": "Говоріть, будь ласка, повільніше.",
     "ru": "Говорите, пожалуйста, медленнее.",
     "en": "Please speak more slowly."
    },
    "options": [
     {
      "id": "o0",
      "text": "Proszę mówić wolniej."
     },
     {
      "id": "o1",
      "text": "Proszę mówić głośniej."
     },
     {
      "id": "o2",
      "text": "Proszę mówić szybciej."
     }
    ],
    "answer": "o0"
   },
   "explanation": null
  }
 },
 {
  "lesson": "waw-2-uprzejmosc",
  "n": 14,
  "from": {
   "type": "ODD_ONE_OUT",
   "skill": "vocab.politeness",
   "data": {
    "question": {
     "uk": "Що НЕ є ввічливим словом для прохання, подяки чи вибачення?",
     "ru": "Что НЕ является словом просьбы, благодарности или извинения?",
     "en": "Which is NOT an expression for a request, thanks or an apology?"
    },
    "options": [
     {
      "id": "w0",
      "text": "proszę"
     },
     {
      "id": "w1",
      "text": "dziękuję"
     },
     {
      "id": "w2",
      "text": "przepraszam"
     },
     {
      "id": "w3",
      "text": "pomidor"
     }
    ],
    "answer": "w3"
   },
   "explanation": {
    "uk": "Три — «чарівні слова», а **pomidor** — помідор.",
    "ru": "Три — «волшебные слова», а **pomidor** — помидор.",
    "en": "Three are \"magic words\"; **pomidor** is a tomato."
   }
  },
  "to": {
   "type": "ODD_ONE_OUT",
   "skill": "vocab.politeness",
   "data": {
    "question": {
     "uk": "Що НЕ є ввічливим словом для прохання, подяки чи вибачення?",
     "ru": "Что НЕ является словом просьбы, благодарности или извинения?",
     "en": "Which is NOT an expression for a request, thanks or an apology?"
    },
    "options": [
     {
      "id": "w0",
      "text": "proszę"
     },
     {
      "id": "w1",
      "text": "dziękuję"
     },
     {
      "id": "w2",
      "text": "przepraszam"
     },
     {
      "id": "w3",
      "text": "smacznego"
     }
    ],
    "answer": "w3"
   },
   "explanation": {
    "uk": "**Proszę** — прохання, **dziękuję** — подяка, **przepraszam** — вибачення, а **smacznego** — побажання смачного перед їжею.",
    "ru": "**Proszę** — просьба, **dziękuję** — благодарность, **przepraszam** — извинение, а **smacznego** — пожелание приятного аппетита.",
    "en": "**Proszę** asks, **dziękuję** thanks, **przepraszam** apologises; **smacznego** wishes someone a good meal."
   }
  }
 },
 {
  "lesson": "waw-3-imie",
  "n": 7,
  "from": {
   "type": "DIALOGUE",
   "skill": "dialogue.intro",
   "data": {
    "npc": {
     "name": "Ania",
     "emoji": "👩🏼",
     "role": {
      "uk": "студентка з Варшави",
      "ru": "студентка из Варшавы",
      "en": "a student from Warsaw"
     }
    },
    "steps": [
     {
      "npc": "Cześć! Jestem Ania. Jak masz na imię?",
      "npcTr": {
       "uk": "Привіт! Я Аня. Як тебе звати?",
       "ru": "Привет! Я Аня. Как тебя зовут?",
       "en": "Hi! I'm Ania. What's your name?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Mam na imię Bobek.",
        "tr": {
         "uk": "Мене звати Бобек.",
         "ru": "Меня зовут Бобек.",
         "en": "My name is Bobek."
        }
       },
       {
        "id": "s0o1",
        "text": "Mam kota.",
        "tr": {
         "uk": "У мене є кіт.",
         "ru": "У меня есть кот.",
         "en": "I have a cat."
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "Ania питає ім'я. Відповідай: **Mam na imię…**",
       "ru": "Аня спрашивает имя. Отвечай: **Mam na imię…**",
       "en": "Ania asks your name. Answer: **Mam na imię…**"
      }
     },
     {
      "npc": "Miło mi! Jak się masz?",
      "npcTr": {
       "uk": "Приємно! Як справи?",
       "ru": "Приятно! Как дела?",
       "en": "Nice to meet you! How are you?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Dobrze, dziękuję. Miło mi!",
        "tr": {
         "uk": "Добре, дякую. Приємно!",
         "ru": "Хорошо, спасибо. Приятно!",
         "en": "Fine, thanks. Nice to meet you!"
        }
       },
       {
        "id": "s1o1",
        "text": "Do widzenia.",
        "tr": {
         "uk": "До побачення.",
         "ru": "До свидания.",
         "en": "Goodbye."
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "На «Jak się masz?» відповідають: **Dobrze, dziękuję.**",
       "ru": "На «Jak się masz?» отвечают: **Dobrze, dziękuję.**",
       "en": "Answer \"Jak się masz?\" with **Dobrze, dziękuję.**"
      }
     }
    ]
   },
   "explanation": null
  },
  "to": {
   "type": "DIALOGUE",
   "skill": "dialogue.intro",
   "data": {
    "npc": {
     "name": "Ania",
     "emoji": "👩🏼",
     "role": {
      "uk": "студентка з Варшави",
      "ru": "студентка из Варшавы",
      "en": "a student from Warsaw"
     }
    },
    "steps": [
     {
      "npc": "Cześć! Jestem Ania. Jak masz na imię?",
      "npcTr": {
       "uk": "Привіт! Я Аня. Як тебе звати?",
       "ru": "Привет! Я Аня. Как тебя зовут?",
       "en": "Hi! I'm Ania. What's your name?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Mam na imię Bobek.",
        "tr": {
         "uk": "Мене звати Бобек.",
         "ru": "Меня зовут Бобек.",
         "en": "My name is Bobek."
        }
       },
       {
        "id": "s0o1",
        "text": "Nazywa się Bobek.",
        "tr": {
         "uk": "Його звуть Бобек.",
         "ru": "Его зовут Бобек.",
         "en": "His name is Bobek."
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "**Nazywa się** — «його звуть» (про іншого). Про себе: **Mam na imię…** або **Nazywam się…**",
       "ru": "**Nazywa się** — «его зовут» (о другом). О себе: **Mam na imię…** или **Nazywam się…**",
       "en": "**Nazywa się** means \"he is called\". About yourself: **Mam na imię…** or **Nazywam się…**"
      }
     },
     {
      "npc": "Miło mi! Jak się masz?",
      "npcTr": {
       "uk": "Приємно! Як справи?",
       "ru": "Приятно! Как дела?",
       "en": "Nice to meet you! How are you?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Dobrze, dziękuję. Miło mi!",
        "tr": {
         "uk": "Добре, дякую. Приємно!",
         "ru": "Хорошо, спасибо. Приятно!",
         "en": "Fine, thanks. Nice to meet you!"
        }
       },
       {
        "id": "s1o1",
        "text": "Dobry, dziękuję. Miło mi!",
        "tr": {
         "uk": "Добрий, дякую. Приємно! (з помилкою)",
         "ru": "Добрый, спасибо. Приятно! (с ошибкой)",
         "en": "Good (adjective), thanks. Nice to meet you! (a mistake)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "На «Jak się masz?» відповідають прислівником: **Dobrze, dziękuję.** «Dobry» — прикметник (dobry dzień).",
       "ru": "На «Jak się masz?» отвечают наречием: **Dobrze, dziękuję.** «Dobry» — прилагательное (dobry dzień).",
       "en": "Answer \"Jak się masz?\" with the adverb: **Dobrze, dziękuję.** \"Dobry\" is an adjective (dobry dzień)."
      }
     }
    ]
   },
   "explanation": null
  }
 },
 {
  "lesson": "waw-4-skad",
  "n": 8,
  "from": {
   "type": "SENTENCE_TRANSLATION",
   "skill": "writing.origin",
   "data": {
    "source": {
     "uk": "Я з України.",
     "ru": "Я из Украины.",
     "en": "I am from Ukraine."
    },
    "accepted": [
     "Jestem z Ukrainy",
     "Pochodzę z Ukrainy"
    ]
   },
   "explanation": null
  },
  "to": {
   "type": "SENTENCE_TRANSLATION",
   "skill": "writing.origin",
   "data": {
    "source": {
     "uk": "Я з Білорусі.",
     "ru": "Я из Беларуси.",
     "en": "I am from Belarus."
    },
    "accepted": [
     "Jestem z Białorusi",
     "Pochodzę z Białorusi"
    ]
   },
   "explanation": null
  }
 },
 {
  "lesson": "waw-4-skad",
  "n": 14,
  "from": {
   "type": "DIALOGUE",
   "skill": "dialogue.origin",
   "data": {
    "npc": {
     "name": "Ania",
     "emoji": "👩🏼",
     "role": {
      "uk": "студентка з Варшави",
      "ru": "студентка из Варшавы",
      "en": "a student from Warsaw"
     }
    },
    "steps": [
     {
      "npc": "Mówisz po polsku?",
      "npcTr": {
       "uk": "Ти говориш польською?",
       "ru": "Ты говоришь по-польски?",
       "en": "Do you speak Polish?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Trochę. Ale dobrze mówię po angielsku.",
        "tr": {
         "uk": "Трохи. Але добре говорю англійською.",
         "ru": "Немного. Но хорошо говорю по-английски.",
         "en": "A little. But I speak English well."
        }
       },
       {
        "id": "s0o1",
        "text": "Mam na imię Taras.",
        "tr": {
         "uk": "Мене звати Тарас.",
         "ru": "Меня зовут Тарас.",
         "en": "My name is Taras."
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "Ania питає про мову. Відповідай: **Trochę…**",
       "ru": "Аня спрашивает о языке. Отвечай: **Trochę…**",
       "en": "Ania asks about languages. Answer: **Trochę…**"
      }
     },
     {
      "npc": "Super! A skąd jesteś?",
      "npcTr": {
       "uk": "Супер! А звідки ти?",
       "ru": "Супер! А откуда ты?",
       "en": "Great! Where are you from?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Jestem z Ukrainy, ze Lwowa.",
        "tr": {
         "uk": "Я з України, зі Львова.",
         "ru": "Я из Украины, из Львова.",
         "en": "I'm from Ukraine, from Lviv."
        }
       },
       {
        "id": "s1o1",
        "text": "Jestem w Warszawie.",
        "tr": {
         "uk": "Я у Варшаві.",
         "ru": "Я в Варшаве.",
         "en": "I'm in Warsaw."
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "**Skąd?** → **z** + родовий: **ze Lwowa**.",
       "ru": "**Skąd?** → **z** + родительный: **ze Lwowa**.",
       "en": "**Skąd?** → **z** + genitive: **ze Lwowa**."
      }
     },
     {
      "npc": "Lwów jest piękny! Witaj w Warszawie!",
      "npcTr": {
       "uk": "Львів гарний! Ласкаво просимо до Варшави!",
       "ru": "Львов красивый! Добро пожаловать в Варшаву!",
       "en": "Lviv is beautiful! Welcome to Warsaw!"
      }
     }
    ]
   },
   "explanation": null
  },
  "to": {
   "type": "DIALOGUE",
   "skill": "dialogue.origin",
   "data": {
    "npc": {
     "name": "Ania",
     "emoji": "👩🏼",
     "role": {
      "uk": "студентка з Варшави",
      "ru": "студентка из Варшавы",
      "en": "a student from Warsaw"
     }
    },
    "steps": [
     {
      "npc": "Mówisz po polsku?",
      "npcTr": {
       "uk": "Ти говориш польською?",
       "ru": "Ты говоришь по-польски?",
       "en": "Do you speak Polish?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Trochę. Ale dobrze mówię po angielsku.",
        "tr": {
         "uk": "Трохи. Але добре говорю англійською.",
         "ru": "Немного. Но хорошо говорю по-английски.",
         "en": "A little. But I speak English well."
        }
       },
       {
        "id": "s0o1",
        "text": "Trochę mówię po polski.",
        "tr": {
         "uk": "Трохи говорю польською (з помилкою).",
         "ru": "Немного говорю по-польски (с ошибкой).",
         "en": "I speak a little Polish (with a mistake)."
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "Мова — **po** + **-sku**: **po polsku**, а не «po polski». **Polski** — це «польський» або «Польща» в родовому (z Polski).",
       "ru": "Язык — **po** + **-sku**: **po polsku**, а не «po polski». **Polski** — это «польский» или «Польша» в родительном (z Polski).",
       "en": "Languages: **po** + **-sku** — **po polsku**, not \"po polski\". **Polski** means \"Polish\" (adjective) or \"of Poland\" (z Polski)."
      }
     },
     {
      "npc": "Super! A skąd jesteś?",
      "npcTr": {
       "uk": "Супер! А звідки ти?",
       "ru": "Супер! А откуда ты?",
       "en": "Great! Where are you from?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Jestem z Ukrainy, ze Lwowa.",
        "tr": {
         "uk": "Я з України, зі Львова.",
         "ru": "Я из Украины, из Львова.",
         "en": "I'm from Ukraine, from Lviv."
        }
       },
       {
        "id": "s1o1",
        "text": "Jestem w Warszawie.",
        "tr": {
         "uk": "Я у Варшаві.",
         "ru": "Я в Варшаве.",
         "en": "I'm in Warsaw."
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "**Skąd?** → **z** + родовий: **ze Lwowa**.",
       "ru": "**Skąd?** → **z** + родительный: **ze Lwowa**.",
       "en": "**Skąd?** → **z** + genitive: **ze Lwowa**."
      }
     },
     {
      "npc": "Lwów jest piękny! Witaj w Warszawie!",
      "npcTr": {
       "uk": "Львів гарний! Ласкаво просимо до Варшави!",
       "ru": "Львов красивый! Добро пожаловать в Варшаву!",
       "en": "Lviv is beautiful! Welcome to Warsaw!"
      }
     }
    ]
   },
   "explanation": null
  }
 },
 {
  "lesson": "waw-4-skad",
  "n": 15,
  "from": {
   "type": "ODD_ONE_OUT",
   "skill": "vocab.origin",
   "data": {
    "question": {
     "uk": "Який вираз означає час, а не мову?",
     "ru": "Какое выражение обозначает время, а не язык?",
     "en": "Which expression refers to time rather than a language?"
    },
    "options": [
     {
      "id": "w0",
      "text": "po polsku"
     },
     {
      "id": "w1",
      "text": "po angielsku"
     },
     {
      "id": "w2",
      "text": "po ukraińsku"
     },
     {
      "id": "w3",
      "text": "po południu"
     }
    ],
    "answer": "w3"
   },
   "explanation": {
    "uk": "Три — мови, а **po południu** — після обіду.",
    "ru": "Три — языки, а **po południu** — после обеда.",
    "en": "Three are languages; **po południu** means in the afternoon."
   }
  },
  "to": {
   "type": "ODD_ONE_OUT",
   "skill": "vocab.origin",
   "data": {
    "question": {
     "uk": "Який вираз означає час, а не мову?",
     "ru": "Какое выражение обозначает время, а не язык?",
     "en": "Which expression refers to time rather than a language?"
    },
    "options": [
     {
      "id": "w0",
      "text": "po polsku"
     },
     {
      "id": "w1",
      "text": "po białorusku"
     },
     {
      "id": "w2",
      "text": "po ukraińsku"
     },
     {
      "id": "w3",
      "text": "po południu"
     }
    ],
    "answer": "w3"
   },
   "explanation": {
    "uk": "Три — мови (польська, білоруська, українська), а **po południu** — після обіду.",
    "ru": "Три — языки (польский, белорусский, украинский), а **po południu** — после обеда.",
    "en": "Three are languages (Polish, Belarusian, Ukrainian); **po południu** means in the afternoon."
   }
  }
 },
 {
  "lesson": "waw-c1-centralna",
  "n": 11,
  "from": {
   "type": "SITUATION",
   "skill": "situation.centralna",
   "data": {
    "npc": {
     "name": "Pan Tomasz",
     "emoji": "👨🏻‍💼",
     "role": {
      "uk": "працівник довідки",
      "ru": "сотрудник справочной",
      "en": "information desk clerk"
     }
    },
    "scene": {
     "uk": "Потяг щойно прибув на підземну платформу. Тобі треба до метро.",
     "ru": "Поезд только что прибыл на подземную платформу. Тебе нужно к метро.",
     "en": "The train has just pulled into an underground platform. You need the metro."
    },
    "steps": [
     {
      "npc": "Dzień dobry, w czym mogę pomóc?",
      "npcTr": {
       "uk": "Добрий день, чим можу допомогти?",
       "ru": "Добрый день, чем могу помочь?",
       "en": "Hello, how can I help?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Dzień dobry, którędy do metra?",
        "tr": {
         "uk": "Добрий день, як пройти до метро?",
         "ru": "Добрый день, как пройти к метро?",
         "en": "Hello, which way to the metro?"
        }
       },
       {
        "id": "s0o1",
        "text": "Dzień dobry, poproszę kawę.",
        "tr": {
         "uk": "Добрий день, каву, будь ласка.",
         "ru": "Добрый день, кофе, пожалуйста.",
         "en": "Hello, a coffee, please."
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "Це довідка, не кав'ярня. Спитай дорогу: **Którędy do metra?**",
       "ru": "Это справочная, не кафе. Спроси дорогу: **Którędy do metra?**",
       "en": "This is information, not a café. Ask the way: **Którędy do metra?**"
      }
     },
     {
      "npc": "Proszę iść przejściem podziemnym w prawo, a potem schodami ruchomymi na dół.",
      "npcTr": {
       "uk": "Ідіть підземним переходом праворуч, а потім ескалатором униз.",
       "ru": "Идите подземным переходом направо, а потом на эскалаторе вниз.",
       "en": "Go through the underpass to the right, then take the escalator down."
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Czy to daleko?",
        "tr": {
         "uk": "Це далеко?",
         "ru": "Это далеко?",
         "en": "Is it far?"
        }
       },
       {
        "id": "s1o1",
        "text": "Mam na imię Ania.",
        "tr": {
         "uk": "Мене звати Аня.",
         "ru": "Меня зовут Аня.",
         "en": "My name is Ania."
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "Можна уточнити відстань: **Czy to daleko?**",
       "ru": "Можно уточнить расстояние: **Czy to daleko?**",
       "en": "Ask about the distance: **Czy to daleko?**"
      }
     },
     {
      "npc": "Nie, to trzy minuty pieszo.",
      "npcTr": {
       "uk": "Ні, це три хвилини пішки.",
       "ru": "Нет, это три минуты пешком.",
       "en": "No, it's three minutes on foot."
      },
      "options": [
       {
        "id": "s2o0",
        "text": "Dziękuję bardzo!",
        "tr": {
         "uk": "Дуже дякую!",
         "ru": "Большое спасибо!",
         "en": "Thank you very much!"
        }
       },
       {
        "id": "s2o1",
        "text": "Dobranoc!",
        "tr": {
         "uk": "На добраніч!",
         "ru": "Спокойной ночи!",
         "en": "Good night!"
        }
       }
      ],
      "answer": "s2o0",
      "feedback": {
       "uk": "Подякуй: **Dziękuję bardzo!**",
       "ru": "Поблагодари: **Dziękuję bardzo!**",
       "en": "Say thanks: **Dziękuję bardzo!**"
      }
     },
     {
      "npc": "Proszę bardzo!",
      "npcTr": {
       "uk": "Прошу!",
       "ru": "Пожалуйста!",
       "en": "You're welcome!"
      }
     }
    ]
   },
   "explanation": null
  },
  "to": {
   "type": "SITUATION",
   "skill": "situation.centralna",
   "data": {
    "npc": {
     "name": "Pan Tomasz",
     "emoji": "👨🏻‍💼",
     "role": {
      "uk": "працівник довідки",
      "ru": "сотрудник справочной",
      "en": "information desk clerk"
     }
    },
    "scene": {
     "uk": "Потяг щойно прибув на підземну платформу. Тобі треба до метро.",
     "ru": "Поезд только что прибыл на подземную платформу. Тебе нужно к метро.",
     "en": "The train has just pulled into an underground platform. You need the metro."
    },
    "steps": [
     {
      "npc": "Dzień dobry, w czym mogę pomóc?",
      "npcTr": {
       "uk": "Добрий день, чим можу допомогти?",
       "ru": "Добрый день, чем могу помочь?",
       "en": "Hello, how can I help?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Dzień dobry, którędy do metra?",
        "tr": {
         "uk": "Добрий день, як пройти до метро?",
         "ru": "Добрый день, как пройти к метро?",
         "en": "Hello, which way to the metro?"
        }
       },
       {
        "id": "s0o1",
        "text": "Dzień dobry, kiedy do metra?",
        "tr": {
         "uk": "Добрий день, коли до метро? (з помилкою)",
         "ru": "Добрый день, когда к метро? (с ошибкой)",
         "en": "Hello, when to the metro? (a mistake)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "**Kiedy** — коли, а дорогу питають **którędy** — якою дорогою: **Którędy do metra?**",
       "ru": "**Kiedy** — когда, а дорогу спрашивают **którędy** — какой дорогой: **Którędy do metra?**",
       "en": "**Kiedy** means \"when\"; to ask the way use **którędy**: **Którędy do metra?**"
      }
     },
     {
      "npc": "Proszę iść przejściem podziemnym w prawo, a potem schodami ruchomymi na dół.",
      "npcTr": {
       "uk": "Ідіть підземним переходом праворуч, а потім ескалатором униз.",
       "ru": "Идите подземным переходом направо, а потом на эскалаторе вниз.",
       "en": "Go through the underpass to the right, then take the escalator down."
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Czy to daleko?",
        "tr": {
         "uk": "Це далеко?",
         "ru": "Это далеко?",
         "en": "Is it far?"
        }
       },
       {
        "id": "s1o1",
        "text": "Czy to daleka?",
        "tr": {
         "uk": "Це далека? (з помилкою)",
         "ru": "Это далёкая? (с ошибкой)",
         "en": "Is it far (wrong form)?"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "Про відстань питають прислівником: **Czy to daleko?** «Daleka» — прикметник жіночого роду (daleka droga).",
       "ru": "О расстоянии спрашивают наречием: **Czy to daleko?** «Daleka» — прилагательное женского рода (daleka droga).",
       "en": "Ask with the adverb: **Czy to daleko?** \"Daleka\" is a feminine adjective (daleka droga)."
      }
     },
     {
      "npc": "Nie, to trzy minuty pieszo.",
      "npcTr": {
       "uk": "Ні, це три хвилини пішки.",
       "ru": "Нет, это три минуты пешком.",
       "en": "No, it's three minutes on foot."
      },
      "options": [
       {
        "id": "s2o0",
        "text": "Dziękuję bardzo!",
        "tr": {
         "uk": "Дуже дякую!",
         "ru": "Большое спасибо!",
         "en": "Thank you very much!"
        }
       },
       {
        "id": "s2o1",
        "text": "Proszę bardzo!",
        "tr": {
         "uk": "Прошу! (не подяка)",
         "ru": "Пожалуйста! (не благодарность)",
         "en": "You're welcome! (not thanks)"
        }
       }
      ],
      "answer": "s2o0",
      "feedback": {
       "uk": "**Proszę bardzo** кажуть у відповідь на подяку. Тобі допомогли — подякуй: **Dziękuję bardzo!**",
       "ru": "**Proszę bardzo** говорят в ответ на благодарность. Тебе помогли — поблагодари: **Dziękuję bardzo!**",
       "en": "**Proszę bardzo** answers a thank-you. You were helped — say **Dziękuję bardzo!**"
      }
     },
     {
      "npc": "Proszę bardzo!",
      "npcTr": {
       "uk": "Прошу!",
       "ru": "Пожалуйста!",
       "en": "You're welcome!"
      }
     }
    ]
   },
   "explanation": null
  }
 },
 {
  "lesson": "waw-c2-bilety",
  "n": 10,
  "from": {
   "type": "SITUATION",
   "skill": "situation.tickets",
   "data": {
    "npc": {
     "name": "Ania",
     "emoji": "👩🏼",
     "role": {
      "uk": "студентка з Варшави",
      "ru": "студентка из Варшавы",
      "en": "a student from Warsaw"
     }
    },
    "scene": {
     "uk": "Ви з Анею біля входу в метро Centrum.",
     "ru": "Вы с Аней у входа в метро Centrum.",
     "en": "You and Ania are at the entrance to Centrum metro."
    },
    "steps": [
     {
      "npc": "Jedziemy metrem na Stare Miasto. Masz bilet?",
      "npcTr": {
       "uk": "Їдемо метро на Старе Місто. Маєш квиток?",
       "ru": "Едем на метро в Старый город. У тебя есть билет?",
       "en": "We're taking the metro to the Old Town. Got a ticket?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Nie mam. Jaki bilet kupić?",
        "tr": {
         "uk": "Не маю. Який квиток купити?",
         "ru": "Нет. Какой билет купить?",
         "en": "No. Which ticket should I buy?"
        }
       },
       {
        "id": "s0o1",
        "text": "Tak, mam rezerwację.",
        "tr": {
         "uk": "Так, маю бронювання.",
         "ru": "Да, у меня бронь.",
         "en": "Yes, I have a booking."
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "Квитка немає — спитай, який купити: **Jaki bilet kupić?**",
       "ru": "Билета нет — спроси, какой купить: **Jaki bilet kupić?**",
       "en": "No ticket — ask which to buy: **Jaki bilet kupić?**"
      }
     },
     {
      "npc": "Weź bilet na 75 minut, będzie przesiadka.",
      "npcTr": {
       "uk": "Бери квиток на 75 хвилин, буде пересадка.",
       "ru": "Бери билет на 75 минут, будет пересадка.",
       "en": "Get a 75-minute ticket, there'll be a transfer."
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Dobrze. Normalny czy ulgowy?",
        "tr": {
         "uk": "Добре. Звичайний чи пільговий?",
         "ru": "Хорошо. Обычный или льготный?",
         "en": "OK. Full fare or reduced?"
        }
       },
       {
        "id": "s1o1",
        "text": "Dobrze, poproszę żurek.",
        "tr": {
         "uk": "Добре, журек, будь ласка.",
         "ru": "Хорошо, журек, пожалуйста.",
         "en": "OK, the żurek, please."
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "Уточни тип квитка: **normalny czy ulgowy?**",
       "ru": "Уточни тип билета: **normalny czy ulgowy?**",
       "en": "Ask about the fare type: **normalny czy ulgowy?**"
      }
     },
     {
      "npc": "Normalny. Ulgowy jest tylko z legitymacją.",
      "npcTr": {
       "uk": "Звичайний. Пільговий — лише з посвідченням.",
       "ru": "Обычный. Льготный — только с удостоверением.",
       "en": "Full fare. Reduced is only with an ID."
      },
      "options": [
       {
        "id": "s2o0",
        "text": "Jasne, kupię normalny w biletomacie.",
        "tr": {
         "uk": "Зрозуміло, куплю звичайний в автоматі.",
         "ru": "Понятно, куплю обычный в автомате.",
         "en": "Sure, I'll buy a full fare at the machine."
        }
       },
       {
        "id": "s2o1",
        "text": "Jasne, mam dwadzieścia lat.",
        "tr": {
         "uk": "Зрозуміло, мені двадцять.",
         "ru": "Понятно, мне двадцать.",
         "en": "Sure, I'm twenty."
        }
       }
      ],
      "answer": "s2o0",
      "feedback": {
       "uk": "Скажи, що купиш: **kupię normalny**.",
       "ru": "Скажи, что купишь: **kupię normalny**.",
       "en": "Say what you'll buy: **kupię normalny**."
      }
     },
     {
      "npc": "Super, to idziemy!",
      "npcTr": {
       "uk": "Супер, тоді ходімо!",
       "ru": "Супер, тогда пошли!",
       "en": "Great, let's go!"
      }
     }
    ]
   },
   "explanation": null
  },
  "to": {
   "type": "SITUATION",
   "skill": "situation.tickets",
   "data": {
    "npc": {
     "name": "Ania",
     "emoji": "👩🏼",
     "role": {
      "uk": "студентка з Варшави",
      "ru": "студентка из Варшавы",
      "en": "a student from Warsaw"
     }
    },
    "scene": {
     "uk": "Ви з Анею біля входу в метро Centrum.",
     "ru": "Вы с Аней у входа в метро Centrum.",
     "en": "You and Ania are at the entrance to Centrum metro."
    },
    "steps": [
     {
      "npc": "Jedziemy metrem na Stare Miasto. Masz bilet?",
      "npcTr": {
       "uk": "Їдемо метро на Старе Місто. Маєш квиток?",
       "ru": "Едем на метро в Старый город. У тебя есть билет?",
       "en": "We're taking the metro to the Old Town. Got a ticket?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Nie mam. Jaki bilet kupić?",
        "tr": {
         "uk": "Не маю. Який квиток купити?",
         "ru": "Нет. Какой билет купить?",
         "en": "No. Which ticket should I buy?"
        }
       },
       {
        "id": "s0o1",
        "text": "Tak, mam rezerwację.",
        "tr": {
         "uk": "Так, маю бронювання.",
         "ru": "Да, у меня бронь.",
         "en": "Yes, I have a booking."
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "Квитка немає — спитай, який купити: **Jaki bilet kupić?**",
       "ru": "Билета нет — спроси, какой купить: **Jaki bilet kupić?**",
       "en": "No ticket — ask which to buy: **Jaki bilet kupić?**"
      }
     },
     {
      "npc": "Weź bilet na 75 minut, będzie przesiadka.",
      "npcTr": {
       "uk": "Бери квиток на 75 хвилин, буде пересадка.",
       "ru": "Бери билет на 75 минут, будет пересадка.",
       "en": "Get a 75-minute ticket, there'll be a transfer."
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Dobrze. Normalny czy ulgowy?",
        "tr": {
         "uk": "Добре. Звичайний чи пільговий?",
         "ru": "Хорошо. Обычный или льготный?",
         "en": "OK. Full fare or reduced?"
        }
       },
       {
        "id": "s1o1",
        "text": "Dobrze, wezmę bilet na 20 minut.",
        "tr": {
         "uk": "Добре, візьму квиток на 20 хвилин.",
         "ru": "Хорошо, возьму билет на 20 минут.",
         "en": "OK, I'll take a 20-minute ticket."
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "З пересадкою 20 хвилин може не вистачити — Аня радить квиток **na 75 minut**. Уточни тип: **normalny czy ulgowy?**",
       "ru": "С пересадкой 20 минут может не хватить — Аня советует билет **na 75 minut**. Уточни тип: **normalny czy ulgowy?**",
       "en": "With a transfer 20 minutes may not be enough — Ania suggests **na 75 minut**. Ask: **normalny czy ulgowy?**"
      }
     },
     {
      "npc": "Normalny. Ulgowy jest tylko z legitymacją.",
      "npcTr": {
       "uk": "Звичайний. Пільговий — лише з посвідченням.",
       "ru": "Обычный. Льготный — только с удостоверением.",
       "en": "Full fare. Reduced is only with an ID."
      },
      "options": [
       {
        "id": "s2o0",
        "text": "Jasne, kupię normalny w biletomacie.",
        "tr": {
         "uk": "Зрозуміло, куплю звичайний в автоматі.",
         "ru": "Понятно, куплю обычный в автомате.",
         "en": "Sure, I'll buy a full fare at the machine."
        }
       },
       {
        "id": "s2o1",
        "text": "Jasne, mam dwadzieścia lat.",
        "tr": {
         "uk": "Зрозуміло, мені двадцять.",
         "ru": "Понятно, мне двадцать.",
         "en": "Sure, I'm twenty."
        }
       }
      ],
      "answer": "s2o0",
      "feedback": {
       "uk": "Скажи, що купиш: **kupię normalny**.",
       "ru": "Скажи, что купишь: **kupię normalny**.",
       "en": "Say what you'll buy: **kupię normalny**."
      }
     },
     {
      "npc": "Super, to idziemy!",
      "npcTr": {
       "uk": "Супер, тоді ходімо!",
       "ru": "Супер, тогда пошли!",
       "en": "Great, let's go!"
      }
     }
    ]
   },
   "explanation": null
  }
 },
 {
  "lesson": "waw-5-liczby",
  "n": 5,
  "from": {
   "type": "ODD_ONE_OUT",
   "skill": "vocab.numbers",
   "data": {
    "question": {
     "uk": "Яке слово НЕ є числівником?",
     "ru": "Какое слово НЕ является числительным?",
     "en": "Which word is NOT a number?"
    },
    "options": [
     {
      "id": "w0",
      "text": "dwa"
     },
     {
      "id": "w1",
      "text": "trzy"
     },
     {
      "id": "w2",
      "text": "kot"
     },
     {
      "id": "w3",
      "text": "pięć"
     }
    ],
    "answer": "w2"
   },
   "explanation": {
    "uk": "**kot** — це кіт, а не число.",
    "ru": "**kot** — это кот, а не число.",
    "en": "**kot** is a cat, not a number."
   }
  },
  "to": {
   "type": "ODD_ONE_OUT",
   "skill": "vocab.numbers",
   "data": {
    "question": {
     "uk": "Яке число непарне?",
     "ru": "Какое число нечётное?",
     "en": "Which number is odd?"
    },
    "options": [
     {
      "id": "w0",
      "text": "dwa"
     },
     {
      "id": "w1",
      "text": "cztery"
     },
     {
      "id": "w2",
      "text": "siedem"
     },
     {
      "id": "w3",
      "text": "osiem"
     }
    ],
    "answer": "w2"
   },
   "explanation": {
    "uk": "**siedem** — 7, непарне число; dwa (2), cztery (4), osiem (8) — парні.",
    "ru": "**siedem** — 7, нечётное число; dwa (2), cztery (4), osiem (8) — чётные.",
    "en": "**siedem** is 7, an odd number; dwa (2), cztery (4), osiem (8) are even."
   }
  }
 },
 {
  "lesson": "waw-boss",
  "n": 10,
  "from": {
   "type": "DIALOGUE",
   "skill": "dialogue.boss",
   "data": {
    "npc": {
     "name": "Pani Ewa",
     "emoji": "👩🏻‍💼",
     "role": {
      "uk": "сусідка",
      "ru": "соседка",
      "en": "a neighbour"
     }
    },
    "steps": [
     {
      "npc": "Dzień dobry! Jestem Ewa, mieszkam obok.",
      "npcTr": {
       "uk": "Добрий день! Я Ева, живу поруч.",
       "ru": "Добрый день! Я Ева, живу рядом.",
       "en": "Good morning! I'm Ewa, I live next door."
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Dzień dobry! Miło mi. Mieszkam pod siódemką.",
        "tr": {
         "uk": "Добрий день! Приємно. Я живу в сьомій квартирі.",
         "ru": "Добрый день! Приятно. Я живу в седьмой квартире.",
         "en": "Good morning! Nice to meet you. I live at number seven."
        }
       },
       {
        "id": "s0o1",
        "text": "Cześć, dobranoc!",
        "tr": {
         "uk": "Привіт, на добраніч!",
         "ru": "Привет, спокойной ночи!",
         "en": "Hi, good night!"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "З незнайомою сусідкою — формально: **Dzień dobry!** і представся.",
       "ru": "С незнакомой соседкой — формально: **Dzień dobry!** и представься.",
       "en": "With a new neighbour be formal: **Dzień dobry!** and introduce yourself."
      }
     },
     {
      "npc": "A skąd jesteś?",
      "npcTr": {
       "uk": "А звідки ти?",
       "ru": "А откуда ты?",
       "en": "And where are you from?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Jestem z Ukrainy.",
        "tr": {
         "uk": "Я з України.",
         "ru": "Я из Украины.",
         "en": "I'm from Ukraine."
        }
       },
       {
        "id": "s1o1",
        "text": "Mam dwadzieścia lat.",
        "tr": {
         "uk": "Мені двадцять років.",
         "ru": "Мне двадцать лет.",
         "en": "I'm twenty."
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "**Skąd** — звідки. Відповідь: **Jestem z…**",
       "ru": "**Skąd** — откуда. Ответ: **Jestem z…**",
       "en": "**Skąd** means \"where from\". Answer: **Jestem z…**"
      }
     },
     {
      "npc": "Witamy w Warszawie!",
      "npcTr": {
       "uk": "Ласкаво просимо до Варшави!",
       "ru": "Добро пожаловать в Варшаву!",
       "en": "Welcome to Warsaw!"
      },
      "options": [
       {
        "id": "s2o0",
        "text": "Dziękuję bardzo!",
        "tr": {
         "uk": "Дуже дякую!",
         "ru": "Большое спасибо!",
         "en": "Thank you very much!"
        }
       },
       {
        "id": "s2o1",
        "text": "Nie rozumiem dziękuję.",
        "tr": {
         "uk": "(безглуздо)",
         "ru": "(бессмысленно)",
         "en": "(nonsense)"
        }
       }
      ],
      "answer": "s2o0",
      "feedback": {
       "uk": "Подякуй: **Dziękuję bardzo!**",
       "ru": "Поблагодари: **Dziękuję bardzo!**",
       "en": "Say thanks: **Dziękuję bardzo!**"
      }
     }
    ]
   },
   "explanation": null
  },
  "to": {
   "type": "DIALOGUE",
   "skill": "dialogue.boss",
   "data": {
    "npc": {
     "name": "Pani Ewa",
     "emoji": "👩🏻‍💼",
     "role": {
      "uk": "сусідка",
      "ru": "соседка",
      "en": "a neighbour"
     }
    },
    "steps": [
     {
      "npc": "Dzień dobry! Jestem Ewa, mieszkam obok.",
      "npcTr": {
       "uk": "Добрий день! Я Ева, живу поруч.",
       "ru": "Добрый день! Я Ева, живу рядом.",
       "en": "Good morning! I'm Ewa, I live next door."
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Dzień dobry! Miło mi. Mieszkam pod siódemką.",
        "tr": {
         "uk": "Добрий день! Приємно. Я живу в сьомій квартирі.",
         "ru": "Добрый день! Приятно. Я живу в седьмой квартире.",
         "en": "Good morning! Nice to meet you. I live at number seven."
        }
       },
       {
        "id": "s0o1",
        "text": "Cześć, Ewa! Jestem Bobek.",
        "tr": {
         "uk": "Привіт, Ево! Я Бобек.",
         "ru": "Привет, Ева! Я Бобек.",
         "en": "Hi, Ewa! I'm Bobek."
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "Сусідка привіталася формально («Dzień dobry»). З незнайомою людиною — так само: **Dzień dobry!** і представся. На «ти» переходять, коли запропонують.",
       "ru": "Соседка поздоровалась формально («Dzień dobry»). С незнакомым человеком — так же: **Dzień dobry!** и представься. На «ты» переходят, когда предложат.",
       "en": "The neighbour greeted you formally. Do the same with someone new: **Dzień dobry!** and introduce yourself."
      }
     },
     {
      "npc": "A skąd jesteś?",
      "npcTr": {
       "uk": "А звідки ти?",
       "ru": "А откуда ты?",
       "en": "And where are you from?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Jestem z Białorusi, z Mińska.",
        "tr": {
         "uk": "Я з Білорусі, з Мінська.",
         "ru": "Я из Беларуси, из Минска.",
         "en": "I'm from Belarus, from Minsk."
        }
       },
       {
        "id": "s1o1",
        "text": "Jestem z Białoruś.",
        "tr": {
         "uk": "Я з Білорусь (з помилкою).",
         "ru": "Я из Беларусь (с ошибкой).",
         "en": "I'm from Belarus (with a mistake)."
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "Після **z** — родовий відмінок: Białoruś → **z Białorusi**, Ukraina → **z Ukrainy**, Mińsk → **z Mińska**.",
       "ru": "После **z** — родительный падеж: Białoruś → **z Białorusi**, Ukraina → **z Ukrainy**, Mińsk → **z Mińska**.",
       "en": "After **z** use the genitive: Białoruś → **z Białorusi**, Ukraina → **z Ukrainy**, Mińsk → **z Mińska**."
      }
     },
     {
      "npc": "Witamy w Warszawie!",
      "npcTr": {
       "uk": "Ласкаво просимо до Варшави!",
       "ru": "Добро пожаловать в Варшаву!",
       "en": "Welcome to Warsaw!"
      },
      "options": [
       {
        "id": "s2o0",
        "text": "Dziękuję bardzo!",
        "tr": {
         "uk": "Дуже дякую!",
         "ru": "Большое спасибо!",
         "en": "Thank you very much!"
        }
       },
       {
        "id": "s2o1",
        "text": "Nie ma za co!",
        "tr": {
         "uk": "Нема за що!",
         "ru": "Не за что!",
         "en": "You're welcome!"
        }
       }
      ],
      "answer": "s2o0",
      "feedback": {
       "uk": "**Nie ma za co** — відповідь на «дякую». На привітання «Witamy!» дякують: **Dziękuję bardzo!**",
       "ru": "**Nie ma za co** — ответ на «спасибо». На «Witamy!» благодарят: **Dziękuję bardzo!**",
       "en": "**Nie ma za co** answers \"thank you\". Reply to \"Witamy!\" with **Dziękuję bardzo!**"
      }
     }
    ]
   },
   "explanation": null
  }
 },
 {
  "lesson": "lodz-2-dwuznaki",
  "n": 0,
  "from": {
   "type": "DIALOGUE",
   "skill": "dialogue.sounds",
   "data": {
    "npc": {
     "name": "Kasia",
     "emoji": "👩🏼",
     "role": {
      "uk": "студентка з Лодзі",
      "ru": "студентка из Лодзи",
      "en": "a student from Łódź"
     }
    },
    "steps": [
     {
      "npc": "Cześć! Masz czas?",
      "npcTr": {
       "uk": "Привіт! Маєш час?",
       "ru": "Привет! Есть время?",
       "en": "Hi! Do you have time?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Nie, idę do szkoły.",
        "tr": {
         "uk": "Ні, іду до школи.",
         "ru": "Нет, иду в школу.",
         "en": "No, I'm going to school."
        }
       },
       {
        "id": "s0o1",
        "text": "Nie, idę do rzeki chleb.",
        "tr": {
         "uk": "(безглуздя)",
         "ru": "(бессмыслица)",
         "en": "(nonsense)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "**do szkoły** — до школи. Відповідь має бути зрозумілою.",
       "ru": "**do szkoły** — в школу.",
       "en": "**do szkoły** — to school."
      }
     },
     {
      "npc": "Szkoda! To zadzwoń wieczorem.",
      "npcTr": {
       "uk": "Шкода! Тоді подзвони ввечері.",
       "ru": "Жаль! Тогда позвони вечером.",
       "en": "Pity! Call in the evening then."
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Dobrze, zadzwonię!",
        "tr": {
         "uk": "Добре, подзвоню!",
         "ru": "Хорошо, позвоню!",
         "en": "OK, I'll call!"
        }
       },
       {
        "id": "s1o1",
        "text": "Dobrze, dżem!",
        "tr": {
         "uk": "Добре, джем!",
         "ru": "Хорошо, джем!",
         "en": "OK, jam!"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "**zadzwonię** — подзвоню (від dzwonić).",
       "ru": "**zadzwonię** — позвоню.",
       "en": "**zadzwonię** — I'll call."
      }
     }
    ]
   },
   "explanation": null
  },
  "to": {
   "type": "DIALOGUE",
   "skill": "dialogue.sounds",
   "data": {
    "npc": {
     "name": "Kasia",
     "emoji": "👩🏼",
     "role": {
      "uk": "студентка з Лодзі",
      "ru": "студентка из Лодзи",
      "en": "a student from Łódź"
     }
    },
    "steps": [
     {
      "npc": "Cześć! Masz czas?",
      "npcTr": {
       "uk": "Привіт! Маєш час?",
       "ru": "Привет! Есть время?",
       "en": "Hi! Do you have time?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Nie, idę do szkoły.",
        "tr": {
         "uk": "Ні, іду до школи.",
         "ru": "Нет, иду в школу.",
         "en": "No, I'm going to school."
        }
       },
       {
        "id": "s0o1",
        "text": "Nie, idę do szkoła.",
        "tr": {
         "uk": "Ні, іду до школи. (з помилкою)",
         "ru": "Нет, иду в школу. (с ошибкой)",
         "en": "No, I'm going to school. (a mistake)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "Після **do** — родовий відмінок: szkoła → **do szkoły**.",
       "ru": "После **do** — родительный падеж: szkoła → **do szkoły**.",
       "en": "After **do** use the genitive: szkoła → **do szkoły**."
      }
     },
     {
      "npc": "Szkoda! To zadzwoń wieczorem.",
      "npcTr": {
       "uk": "Шкода! Тоді подзвони ввечері.",
       "ru": "Жаль! Тогда позвони вечером.",
       "en": "Pity! Call in the evening then."
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Dobrze, zadzwonię!",
        "tr": {
         "uk": "Добре, подзвоню!",
         "ru": "Хорошо, позвоню!",
         "en": "OK, I'll call!"
        }
       },
       {
        "id": "s1o1",
        "text": "Dobrze, dzwonię!",
        "tr": {
         "uk": "Добре, дзвоню! (зараз)",
         "ru": "Хорошо, звоню! (сейчас)",
         "en": "OK, I'm calling! (now)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "Просять подзвонити ввечері — відповідь у майбутньому: **zadzwonię** (подзвоню). **Dzwonię** — дзвоню зараз.",
       "ru": "Просят позвонить вечером — ответ в будущем: **zadzwonię** (позвоню). **Dzwonię** — звоню сейчас.",
       "en": "She asks you to call tonight — answer in the future: **zadzwonię** (I'll call). **Dzwonię** means \"I'm calling now\"."
      }
     }
    ]
   },
   "explanation": null
  }
 },
 {
  "lesson": "lodz-4-oni-one",
  "n": 8,
  "from": {
   "type": "LISTENING",
   "skill": "grammar.oni",
   "data": {
    "audioText": "One są z Ukrainy",
    "options": [
     {
      "id": "o0",
      "text": "One są z Ukrainy"
     },
     {
      "id": "o1",
      "text": "Oni są z Ukrainy"
     },
     {
      "id": "o2",
      "text": "Ona jest z Ukrainy"
     }
    ],
    "answer": "o0"
   },
   "explanation": null
  },
  "to": {
   "type": "LISTENING",
   "skill": "grammar.oni",
   "data": {
    "audioText": "One są z Białorusi",
    "options": [
     {
      "id": "o0",
      "text": "One są z Białorusi"
     },
     {
      "id": "o1",
      "text": "Oni są z Białorusi"
     },
     {
      "id": "o2",
      "text": "Ona jest z Białorusi"
     }
    ],
    "answer": "o0"
   },
   "explanation": null
  }
 },
 {
  "lesson": "lodz-boss",
  "n": 3,
  "from": {
   "type": "FILL_GAP",
   "skill": "grammar.boss",
   "data": {
    "pl": "My ___ z Ukrainy.",
    "translation": {
     "uk": "Ми з України.",
     "ru": "Мы из Украины.",
     "en": "We are from Ukraine."
    },
    "options": [
     {
      "id": "o0",
      "text": "jesteśmy"
     },
     {
      "id": "o1",
      "text": "jesteście"
     },
     {
      "id": "o2",
      "text": "są"
     }
    ],
    "answer": "o0"
   },
   "explanation": {
    "uk": "my **jesteśmy**.",
    "ru": "my **jesteśmy**.",
    "en": "my **jesteśmy**."
   }
  },
  "to": {
   "type": "FILL_GAP",
   "skill": "grammar.boss",
   "data": {
    "pl": "My ___ z Białorusi.",
    "translation": {
     "uk": "Ми з Білорусі.",
     "ru": "Мы из Беларуси.",
     "en": "We are from Belarus."
    },
    "options": [
     {
      "id": "o0",
      "text": "jesteśmy"
     },
     {
      "id": "o1",
      "text": "jesteście"
     },
     {
      "id": "o2",
      "text": "są"
     }
    ],
    "answer": "o0"
   },
   "explanation": {
    "uk": "my **jesteśmy**.",
    "ru": "my **jesteśmy**.",
    "en": "my **jesteśmy**."
   }
  }
 },
 {
  "lesson": "krk-r1-miasto",
  "n": 15,
  "from": {
   "type": "DIALOGUE",
   "skill": "dialogue.city",
   "data": {
    "npc": {
     "name": "Kasia",
     "emoji": "👩🏻‍🦰",
     "role": {
      "uk": "подруга з Кракова",
      "ru": "подруга из Кракова",
      "en": "a friend from Kraków"
     }
    },
    "steps": [
     {
      "npc": "Zobacz! To jest Rynek Główny.",
      "npcTr": {
       "uk": "Дивись! Це Головна ринкова площа.",
       "ru": "Смотри! Это Главная рыночная площадь.",
       "en": "Look! This is the Main Market Square."
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Wow! A co to jest?",
        "tr": {
         "uk": "Ого! А що це?",
         "ru": "Ого! А что это?",
         "en": "Wow! And what is that?"
        }
       },
       {
        "id": "s0o1",
        "text": "Do widzenia, Rynek!",
        "tr": {
         "uk": "До побачення, площе!",
         "ru": "До свидания, площадь!",
         "en": "Goodbye, square!"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "Ви щойно прийшли на площу — розпитуй: **A co to jest?**",
       "ru": "Вы только пришли на площадь — расспрашивай: **A co to jest?**",
       "en": "You've just arrived — ask: **A co to jest?**"
      }
     },
     {
      "npc": "To jest Kościół Mariacki. A tam są Sukiennice.",
      "npcTr": {
       "uk": "Це Маріацький костел. А там Сукенниці.",
       "ru": "Это Мариацкий костёл. А там Суконные ряды.",
       "en": "This is St. Mary's. And over there is the Cloth Hall."
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Super! A gdzie jest pomnik Mickiewicza?",
        "tr": {
         "uk": "Супер! А де пам'ятник Міцкевичу?",
         "ru": "Супер! А где памятник Мицкевичу?",
         "en": "Great! And where is the Mickiewicz monument?"
        }
       },
       {
        "id": "s1o1",
        "text": "Poproszę bilet do Warszawy.",
        "tr": {
         "uk": "Квиток до Варшави, будь ласка.",
         "ru": "Билет до Варшавы, пожалуйста.",
         "en": "A ticket to Warsaw, please."
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "Ви гуляєте площею — спитай про ще одну пам'ятку: **Gdzie jest…?**",
       "ru": "Вы гуляете по площади — спроси о ещё одной достопримечательности: **Gdzie jest…?**",
       "en": "You're walking around the square — ask about another sight: **Gdzie jest…?**"
      }
     },
     {
      "npc": "Tam, przed Sukiennicami. Chodź!",
      "npcTr": {
       "uk": "Там, перед Сукенницями. Ходімо!",
       "ru": "Там, перед Суконными рядами. Пойдём!",
       "en": "Over there, in front of the Cloth Hall. Come on!"
      }
     }
    ]
   },
   "explanation": null
  },
  "to": {
   "type": "DIALOGUE",
   "skill": "dialogue.city",
   "data": {
    "npc": {
     "name": "Kasia",
     "emoji": "👩🏻‍🦰",
     "role": {
      "uk": "подруга з Кракова",
      "ru": "подруга из Кракова",
      "en": "a friend from Kraków"
     }
    },
    "steps": [
     {
      "npc": "Zobacz! To jest Rynek Główny.",
      "npcTr": {
       "uk": "Дивись! Це Головна ринкова площа.",
       "ru": "Смотри! Это Главная рыночная площадь.",
       "en": "Look! This is the Main Market Square."
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Wow! A co to jest?",
        "tr": {
         "uk": "Ого! А що це?",
         "ru": "Ого! А что это?",
         "en": "Wow! And what is that?"
        }
       },
       {
        "id": "s0o1",
        "text": "Wow! A kto to jest?",
        "tr": {
         "uk": "Ого! А хто це?",
         "ru": "Ого! А кто это?",
         "en": "Wow! And who is that?"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "Про будівлі й місця питають **co** — що: **A co to jest?** **Kto** — про людей.",
       "ru": "О зданиях и местах спрашивают **co** — что: **A co to jest?** **Kto** — о людях.",
       "en": "For buildings and places ask **co** (what): **A co to jest?** **Kto** is for people."
      }
     },
     {
      "npc": "To jest Kościół Mariacki. A tam są Sukiennice.",
      "npcTr": {
       "uk": "Це Маріацький костел. А там Сукенниці.",
       "ru": "Это Мариацкий костёл. А там Суконные ряды.",
       "en": "This is St. Mary's. And over there is the Cloth Hall."
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Super! A gdzie jest pomnik Mickiewicza?",
        "tr": {
         "uk": "Супер! А де пам'ятник Міцкевичу?",
         "ru": "Супер! А где памятник Мицкевичу?",
         "en": "Great! And where is the Mickiewicz monument?"
        }
       },
       {
        "id": "s1o1",
        "text": "Super! A gdzie są pomnik Mickiewicza?",
        "tr": {
         "uk": "Супер! А де пам'ятник Міцкевичу? (з помилкою)",
         "ru": "Супер! А где памятник Мицкевичу? (с ошибкой)",
         "en": "Great! And where is the Mickiewicz monument? (a mistake)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "Пам'ятник один — **Gdzie jest pomnik…?** **Gdzie są…?** — коли питаєш про кілька (Gdzie są Sukiennice?).",
       "ru": "Памятник один — **Gdzie jest pomnik…?** **Gdzie są…?** — когда спрашиваешь о нескольких (Gdzie są Sukiennice?).",
       "en": "One monument: **Gdzie jest pomnik…?** Use **Gdzie są…?** for plurals (Gdzie są Sukiennice?)."
      }
     },
     {
      "npc": "Tam, przed Sukiennicami. Chodź!",
      "npcTr": {
       "uk": "Там, перед Сукенницями. Ходімо!",
       "ru": "Там, перед Суконными рядами. Пойдём!",
       "en": "Over there, in front of the Cloth Hall. Come on!"
      }
     }
    ]
   },
   "explanation": null
  }
 },
 {
  "lesson": "krk-r2-orientacja",
  "n": 15,
  "from": {
   "type": "DIALOGUE",
   "skill": "dialogue.meeting",
   "data": {
    "npc": {
     "name": "Kasia",
     "emoji": "👩🏻‍🦰",
     "role": {
      "uk": "подруга з Кракова",
      "ru": "подруга из Кракова",
      "en": "a friend from Kraków"
     }
    },
    "steps": [
     {
      "npc": "Halo? Gdzie jesteś? Czekam przy pomniku.",
      "npcTr": {
       "uk": "Алло? Де ти? Я чекаю біля пам'ятника.",
       "ru": "Алло? Где ты? Я жду у памятника.",
       "en": "Hello? Where are you? I'm waiting by the monument."
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Jestem obok kawiarni, naprzeciwko ratusza.",
        "tr": {
         "uk": "Я поруч із кав'ярнею, навпроти ратуші.",
         "ru": "Я рядом с кафе, напротив ратуши.",
         "en": "I'm next to the café, opposite the town hall."
        }
       },
       {
        "id": "s0o1",
        "text": "Jestem w pociągu do Warszawy.",
        "tr": {
         "uk": "Я в потязі до Варшави.",
         "ru": "Я в поезде до Варшавы.",
         "en": "I'm on the train to Warsaw."
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "Ви домовилися зустрітися на площі — поясни, де ти: **obok…, naprzeciwko…**",
       "ru": "Вы договорились встретиться на площади — объясни, где ты: **obok…, naprzeciwko…**",
       "en": "You agreed to meet on the square — say where you are: **obok…, naprzeciwko…**"
      }
     },
     {
      "npc": "Super, to blisko! Idę do ciebie.",
      "npcTr": {
       "uk": "Супер, це близько! Іду до тебе.",
       "ru": "Супер, это близко! Иду к тебе.",
       "en": "Great, that's close! I'm coming to you."
      }
     }
    ]
   },
   "explanation": null
  },
  "to": {
   "type": "DIALOGUE",
   "skill": "dialogue.meeting",
   "data": {
    "npc": {
     "name": "Kasia",
     "emoji": "👩🏻‍🦰",
     "role": {
      "uk": "подруга з Кракова",
      "ru": "подруга из Кракова",
      "en": "a friend from Kraków"
     }
    },
    "steps": [
     {
      "npc": "Halo? Gdzie jesteś? Czekam przy pomniku.",
      "npcTr": {
       "uk": "Алло? Де ти? Я чекаю біля пам'ятника.",
       "ru": "Алло? Где ты? Я жду у памятника.",
       "en": "Hello? Where are you? I'm waiting by the monument."
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Jestem obok kawiarni, naprzeciwko ratusza.",
        "tr": {
         "uk": "Я поруч із кав'ярнею, навпроти ратуші.",
         "ru": "Я рядом с кафе, напротив ратуши.",
         "en": "I'm next to the café, opposite the town hall."
        }
       },
       {
        "id": "s0o1",
        "text": "Jestem obok kawiarnia, naprzeciwko ratusz.",
        "tr": {
         "uk": "Я поруч із кав'ярнею, навпроти ратуші. (з помилкою)",
         "ru": "Я рядом с кафе, напротив ратуши. (с ошибкой)",
         "en": "I'm next to the café, opposite the town hall. (a mistake)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "Після **obok** і **naprzeciwko** — родовий відмінок: **obok kawiarni, naprzeciwko ratusza**.",
       "ru": "После **obok** и **naprzeciwko** — родительный падеж: **obok kawiarni, naprzeciwko ratusza**.",
       "en": "After **obok** and **naprzeciwko** use the genitive: **obok kawiarni, naprzeciwko ratusza**."
      }
     },
     {
      "npc": "Super, to blisko! Idę do ciebie.",
      "npcTr": {
       "uk": "Супер, це близько! Іду до тебе.",
       "ru": "Супер, это близко! Иду к тебе.",
       "en": "Great, that's close! I'm coming to you."
      }
     }
    ]
   },
   "explanation": null
  }
 },
 {
  "lesson": "krk-r4-droga",
  "n": 8,
  "from": {
   "type": "SITUATION",
   "skill": "situation.directions",
   "data": {
    "npc": {
     "name": "Pani Barbara",
     "emoji": "👩🏻‍🦳",
     "role": {
      "uk": "перехожа",
      "ru": "прохожая",
      "en": "a passer-by"
     }
    },
    "scene": {
     "uk": "Ти на Ринку й хочеш дійти до Вавеля. Звертаєшся до перехожої: «Przepraszam…»",
     "ru": "Ты на Рынке и хочешь дойти до Вавеля. Обращаешься к прохожей: «Przepraszam…»",
     "en": "You're on the square and want to get to Wawel. You approach a passer-by: \"Przepraszam…\""
    },
    "steps": [
     {
      "npc": "Tak, słucham?",
      "npcTr": {
       "uk": "Так, слухаю?",
       "ru": "Да, слушаю?",
       "en": "Yes?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Przepraszam, jak dojść do Wawelu?",
        "tr": {
         "uk": "Вибачте, як дійти до Вавеля?",
         "ru": "Извините, как дойти до Вавеля?",
         "en": "Excuse me, how do I get to Wawel?"
        }
       },
       {
        "id": "s0o1",
        "text": "Poproszę hot doga.",
        "tr": {
         "uk": "Хот-дог, будь ласка.",
         "ru": "Хот-дог, пожалуйста.",
         "en": "A hot dog, please."
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "Це перехожа, а не продавчиня. Спитай дорогу: **Jak dojść do…?**",
       "ru": "Это прохожая, а не продавщица. Спроси дорогу: **Jak dojść do…?**",
       "en": "She's a passer-by, not a seller. Ask the way: **Jak dojść do…?**"
      }
     },
     {
      "npc": "Proszę iść prosto ulicą Grodzką, a potem skręcić w lewo.",
      "npcTr": {
       "uk": "Ідіть прямо вулицею Ґродзькою, а потім поверніть ліворуч.",
       "ru": "Идите прямо по улице Гродской, а потом поверните налево.",
       "en": "Go straight along Grodzka Street, then turn left."
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Prosto Grodzką i w lewo. Czy to daleko?",
        "tr": {
         "uk": "Прямо Ґродзькою і ліворуч. Це далеко?",
         "ru": "Прямо по Гродской и налево. Это далеко?",
         "en": "Straight along Grodzka and left. Is it far?"
        }
       },
       {
        "id": "s1o1",
        "text": "W prawo przez most? Dziękuję.",
        "tr": {
         "uk": "Праворуч через міст? Дякую.",
         "ru": "Направо через мост? Спасибо.",
         "en": "Right over the bridge? Thanks."
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "Пані сказала: **prosto ulicą Grodzką**, потім **w lewo**.",
       "ru": "Пани сказала: **prosto ulicą Grodzką**, потом **w lewo**.",
       "en": "She said: **prosto ulicą Grodzką**, then **w lewo**."
      }
     },
     {
      "npc": "Nie, jakieś dziesięć minut pieszo.",
      "npcTr": {
       "uk": "Ні, хвилин десять пішки.",
       "ru": "Нет, минут десять пешком.",
       "en": "No, about ten minutes on foot."
      },
      "options": [
       {
        "id": "s2o0",
        "text": "Dziękuję bardzo za pomoc!",
        "tr": {
         "uk": "Дуже дякую за допомогу!",
         "ru": "Большое спасибо за помощь!",
         "en": "Thank you very much for your help!"
        }
       },
       {
        "id": "s2o1",
        "text": "Kartą, proszę.",
        "tr": {
         "uk": "Карткою, будь ласка.",
         "ru": "Картой, пожалуйста.",
         "en": "By card, please."
        }
       }
      ],
      "answer": "s2o0",
      "feedback": {
       "uk": "Подякуй за допомогу: **Dziękuję za pomoc!**",
       "ru": "Поблагодари за помощь: **Dziękuję za pomoc!**",
       "en": "Thank her: **Dziękuję za pomoc!**"
      }
     },
     {
      "npc": "Nie ma za co. Miłego zwiedzania!",
      "npcTr": {
       "uk": "Нема за що. Приємних екскурсій!",
       "ru": "Не за что. Приятной экскурсии!",
       "en": "You're welcome. Enjoy sightseeing!"
      }
     }
    ]
   },
   "explanation": null
  },
  "to": {
   "type": "SITUATION",
   "skill": "situation.directions",
   "data": {
    "npc": {
     "name": "Pani Barbara",
     "emoji": "👩🏻‍🦳",
     "role": {
      "uk": "перехожа",
      "ru": "прохожая",
      "en": "a passer-by"
     }
    },
    "scene": {
     "uk": "Ти на Ринку й хочеш дійти до Вавеля. Звертаєшся до перехожої: «Przepraszam…»",
     "ru": "Ты на Рынке и хочешь дойти до Вавеля. Обращаешься к прохожей: «Przepraszam…»",
     "en": "You're on the square and want to get to Wawel. You approach a passer-by: \"Przepraszam…\""
    },
    "steps": [
     {
      "npc": "Tak, słucham?",
      "npcTr": {
       "uk": "Так, слухаю?",
       "ru": "Да, слушаю?",
       "en": "Yes?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Przepraszam, jak dojść do Wawelu?",
        "tr": {
         "uk": "Вибачте, як дійти до Вавеля?",
         "ru": "Извините, как дойти до Вавеля?",
         "en": "Excuse me, how do I get to Wawel?"
        }
       },
       {
        "id": "s0o1",
        "text": "Przepraszam, jak dojść do Wawel?",
        "tr": {
         "uk": "Вибачте, як дійти до Вавеля? (з помилкою)",
         "ru": "Извините, как дойти до Вавеля? (с ошибкой)",
         "en": "Excuse me, how do I get to Wawel? (a mistake)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "Після **do** — родовий відмінок: Wawel → **do Wawelu**. Дорогу питають: **Jak dojść do…?**",
       "ru": "После **do** — родительный падеж: Wawel → **do Wawelu**. Дорогу спрашивают: **Jak dojść do…?**",
       "en": "After **do** use the genitive: Wawel → **do Wawelu**. Ask the way: **Jak dojść do…?**"
      }
     },
     {
      "npc": "Proszę iść prosto ulicą Grodzką, a potem skręcić w lewo.",
      "npcTr": {
       "uk": "Ідіть прямо вулицею Ґродзькою, а потім поверніть ліворуч.",
       "ru": "Идите прямо по улице Гродской, а потом поверните налево.",
       "en": "Go straight along Grodzka Street, then turn left."
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Prosto Grodzką i w lewo. Czy to daleko?",
        "tr": {
         "uk": "Прямо Ґродзькою і ліворуч. Це далеко?",
         "ru": "Прямо по Гродской и налево. Это далеко?",
         "en": "Straight along Grodzka and left. Is it far?"
        }
       },
       {
        "id": "s1o1",
        "text": "W prawo przez most? Dziękuję.",
        "tr": {
         "uk": "Праворуч через міст? Дякую.",
         "ru": "Направо через мост? Спасибо.",
         "en": "Right over the bridge? Thanks."
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "Пані сказала: **prosto ulicą Grodzką**, потім **w lewo**.",
       "ru": "Пани сказала: **prosto ulicą Grodzką**, потом **w lewo**.",
       "en": "She said: **prosto ulicą Grodzką**, then **w lewo**."
      }
     },
     {
      "npc": "Nie, jakieś dziesięć minut pieszo.",
      "npcTr": {
       "uk": "Ні, хвилин десять пішки.",
       "ru": "Нет, минут десять пешком.",
       "en": "No, about ten minutes on foot."
      },
      "options": [
       {
        "id": "s2o0",
        "text": "Dziękuję bardzo za pomoc!",
        "tr": {
         "uk": "Дуже дякую за допомогу!",
         "ru": "Большое спасибо за помощь!",
         "en": "Thank you very much for your help!"
        }
       },
       {
        "id": "s2o1",
        "text": "Nie ma za co!",
        "tr": {
         "uk": "Нема за що!",
         "ru": "Не за что!",
         "en": "You're welcome!"
        }
       }
      ],
      "answer": "s2o0",
      "feedback": {
       "uk": "**Nie ma za co** кажуть у відповідь на подяку. Тобі допомогли — подякуй: **Dziękuję za pomoc!**",
       "ru": "**Nie ma za co** говорят в ответ на благодарность. Тебе помогли — поблагодари: **Dziękuję za pomoc!**",
       "en": "**Nie ma za co** answers a thank-you. You were helped — say **Dziękuję za pomoc!**"
      }
     },
     {
      "npc": "Nie ma za co. Miłego zwiedzania!",
      "npcTr": {
       "uk": "Нема за що. Приємних екскурсій!",
       "ru": "Не за что. Приятной экскурсии!",
       "en": "You're welcome. Enjoy sightseeing!"
      }
     }
    ]
   },
   "explanation": null
  }
 },
 {
  "lesson": "krk-3-dom",
  "n": 7,
  "from": {
   "type": "ODD_ONE_OUT",
   "skill": "vocab.home",
   "data": {
    "question": {
     "uk": "Хто є членом родини, а не кімнатою?",
     "ru": "Что называет члена семьи, а не комнату?",
     "en": "Which names a family member rather than a room?"
    },
    "options": [
     {
      "id": "w0",
      "text": "kuchnia"
     },
     {
      "id": "w1",
      "text": "łazienka"
     },
     {
      "id": "w2",
      "text": "pokój"
     },
     {
      "id": "w3",
      "text": "babcia"
     }
    ],
    "answer": "w3"
   },
   "explanation": {
    "uk": "**babcia** — бабуся, а не кімната.",
    "ru": "**babcia** — бабушка, а не комната.",
    "en": "**babcia** is a grandma, not a room."
   }
  },
  "to": {
   "type": "ODD_ONE_OUT",
   "skill": "vocab.home",
   "data": {
    "question": {
     "uk": "Що НЕ є частиною квартири, а річчю?",
     "ru": "Что НЕ часть квартиры, а вещь?",
     "en": "Which is a thing, not a part of the flat?"
    },
    "options": [
     {
      "id": "w0",
      "text": "kuchnia"
     },
     {
      "id": "w1",
      "text": "łazienka"
     },
     {
      "id": "w2",
      "text": "pokój"
     },
     {
      "id": "w3",
      "text": "lodówka"
     }
    ],
    "answer": "w3"
   },
   "explanation": {
    "uk": "**Kuchnia**, **łazienka**, **pokój** — частини квартири, а **lodówka** — холодильник (річ у кухні).",
    "ru": "**Kuchnia**, **łazienka**, **pokój** — части квартиры, а **lodówka** — холодильник (вещь на кухне).",
    "en": "**Kuchnia**, **łazienka**, **pokój** are parts of a flat; **lodówka** is a fridge (a thing in the kitchen)."
   }
  }
 },
 {
  "lesson": "krk-boss",
  "n": 9,
  "from": {
   "type": "DIALOGUE",
   "skill": "dialogue.boss",
   "data": {
    "npc": {
     "name": "Babcia Zosia",
     "emoji": "👵🏻",
     "role": {
      "uk": "бабуся Касі",
      "ru": "бабушка Каси",
      "en": "Kasia's grandma"
     }
    },
    "steps": [
     {
      "npc": "Dzień dobry, kochanie! Jesteś głodny?",
      "npcTr": {
       "uk": "Добрий день, любий! Ти голодний?",
       "ru": "Добрый день, дорогой! Ты голоден?",
       "en": "Hello, dear! Are you hungry?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Tak, jestem bardzo głodny!",
        "tr": {
         "uk": "Так, я дуже голодний!",
         "ru": "Да, я очень голоден!",
         "en": "Yes, I'm very hungry!"
        }
       },
       {
        "id": "s0o1",
        "text": "Tak, mam bardzo głodny!",
        "tr": {
         "uk": "(помилка: mam замість jestem)",
         "ru": "(ошибка: mam вместо jestem)",
         "en": "(error: mam instead of jestem)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "Стан виражаємо через **być**: Jestem głodny.",
       "ru": "Состояние выражаем через **być**: Jestem głodny.",
       "en": "States use **być**: Jestem głodny."
      }
     },
     {
      "npc": "Masz rodzeństwo?",
      "npcTr": {
       "uk": "У тебе є брати чи сестри?",
       "ru": "У тебя есть братья или сёстры?",
       "en": "Do you have siblings?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Mam siostrę.",
        "tr": {
         "uk": "У мене є сестра.",
         "ru": "У меня есть сестра.",
         "en": "I have a sister."
        }
       },
       {
        "id": "s1o1",
        "text": "Mam siostra.",
        "tr": {
         "uk": "(помилка у відмінку)",
         "ru": "(ошибка в падеже)",
         "en": "(case error)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "Після **mam**: **siostrę**.",
       "ru": "После **mam**: **siostrę**.",
       "en": "After **mam**: **siostrę**."
      }
     },
     {
      "npc": "Smacznego!",
      "npcTr": {
       "uk": "Смачного!",
       "ru": "Приятного аппетита!",
       "en": "Enjoy your meal!"
      },
      "options": [
       {
        "id": "s2o0",
        "text": "Dziękuję, babciu!",
        "tr": {
         "uk": "Дякую, бабусю!",
         "ru": "Спасибо, бабушка!",
         "en": "Thank you, grandma!"
        }
       },
       {
        "id": "s2o1",
        "text": "Dobranoc, babciu!",
        "tr": {
         "uk": "На добраніч, бабусю!",
         "ru": "Спокойной ночи, бабушка!",
         "en": "Good night, grandma!"
        }
       }
      ],
      "answer": "s2o0",
      "feedback": {
       "uk": "На «Smacznego!» кажуть **Dziękuję!**",
       "ru": "На «Smacznego!» отвечают **Dziękuję!**",
       "en": "Reply to \"Smacznego!\" with **Dziękuję!**"
      }
     }
    ]
   },
   "explanation": null
  },
  "to": {
   "type": "DIALOGUE",
   "skill": "dialogue.boss",
   "data": {
    "npc": {
     "name": "Babcia Zosia",
     "emoji": "👵🏻",
     "role": {
      "uk": "бабуся Касі",
      "ru": "бабушка Каси",
      "en": "Kasia's grandma"
     }
    },
    "steps": [
     {
      "npc": "Dzień dobry, kochanie! Jesteś głodny?",
      "npcTr": {
       "uk": "Добрий день, любий! Ти голодний?",
       "ru": "Добрый день, дорогой! Ты голоден?",
       "en": "Hello, dear! Are you hungry?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Tak, jestem bardzo głodny!",
        "tr": {
         "uk": "Так, я дуже голодний!",
         "ru": "Да, я очень голоден!",
         "en": "Yes, I'm very hungry!"
        }
       },
       {
        "id": "s0o1",
        "text": "Tak, mam bardzo głodny!",
        "tr": {
         "uk": "(помилка: mam замість jestem)",
         "ru": "(ошибка: mam вместо jestem)",
         "en": "(error: mam instead of jestem)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "Стан виражаємо через **być**: Jestem głodny.",
       "ru": "Состояние выражаем через **być**: Jestem głodny.",
       "en": "States use **być**: Jestem głodny."
      }
     },
     {
      "npc": "Masz rodzeństwo?",
      "npcTr": {
       "uk": "У тебе є брати чи сестри?",
       "ru": "У тебя есть братья или сёстры?",
       "en": "Do you have siblings?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Mam siostrę.",
        "tr": {
         "uk": "У мене є сестра.",
         "ru": "У меня есть сестра.",
         "en": "I have a sister."
        }
       },
       {
        "id": "s1o1",
        "text": "Mam siostra.",
        "tr": {
         "uk": "(помилка у відмінку)",
         "ru": "(ошибка в падеже)",
         "en": "(case error)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "Після **mam**: **siostrę**.",
       "ru": "После **mam**: **siostrę**.",
       "en": "After **mam**: **siostrę**."
      }
     },
     {
      "npc": "Smacznego!",
      "npcTr": {
       "uk": "Смачного!",
       "ru": "Приятного аппетита!",
       "en": "Enjoy your meal!"
      },
      "options": [
       {
        "id": "s2o0",
        "text": "Dziękuję, babciu!",
        "tr": {
         "uk": "Дякую, бабусю!",
         "ru": "Спасибо, бабушка!",
         "en": "Thank you, grandma!"
        }
       },
       {
        "id": "s2o1",
        "text": "Proszę bardzo, babciu!",
        "tr": {
         "uk": "Прошу, бабусю!",
         "ru": "Пожалуйста, бабушка!",
         "en": "You're welcome, grandma!"
        }
       }
      ],
      "answer": "s2o0",
      "feedback": {
       "uk": "**Proszę bardzo** — відповідь на «дякую». На «Smacznego!» кажуть **Dziękuję!** (а якщо їсте разом — **Nawzajem!**).",
       "ru": "**Proszę bardzo** — ответ на «спасибо». На «Smacznego!» отвечают **Dziękuję!** (а если едите вместе — **Nawzajem!**).",
       "en": "**Proszę bardzo** answers a thank-you. Reply to \"Smacznego!\" with **Dziękuję!** (or **Nawzajem!** if you eat together)."
      }
     }
    ]
   },
   "explanation": null
  }
 },
 {
  "lesson": "opo-1-siema",
  "n": 0,
  "from": {
   "type": "DIALOGUE",
   "skill": "dialogue.slang",
   "data": {
    "npc": {
     "name": "Kuba",
     "emoji": "🧑🏼",
     "role": {
      "uk": "друг-студент",
      "ru": "друг-студент",
      "en": "a student friend"
     }
    },
    "steps": [
     {
      "npc": "Siema! Co tam?",
      "npcTr": {
       "uk": "Привіт! Як справи?",
       "ru": "Привет! Как дела?",
       "en": "Hi! What's up?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Siema! Spoko, a u ciebie?",
        "tr": {
         "uk": "Привіт! Нормально, а в тебе?",
         "ru": "Привет! Нормально, а у тебя?",
         "en": "Hi! Fine, you?"
        }
       },
       {
        "id": "s0o1",
        "text": "Dzień dobry panu, wszystko w porządku.",
        "tr": {
         "uk": "Добрий день, пане, усе гаразд.",
         "ru": "Добрый день, всё в порядке.",
         "en": "Good day, sir, all is well."
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "Другові можна відповісти так само неформально. «Dzień dobry panu» звучить тут дивно офіційно.",
       "ru": "Другу можно ответить так же неформально. «Dzień dobry panu» звучит здесь странно официально.",
       "en": "Answer a friend just as casually."
      }
     },
     {
      "npc": "Też luz. Idziesz na koncert w sobotę?",
      "npcTr": {
       "uk": "Теж спокійно. Ідеш на концерт у суботу?",
       "ru": "Тоже нормально. Идёшь на концерт в субботу?",
       "en": "All chill too. Coming to the concert on Saturday?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Jasne! Dobra, lecę. Trzymaj się!",
        "tr": {
         "uk": "Звісно! Добре, я побіг. Тримайся!",
         "ru": "Конечно! Ладно, я побежал. Держись!",
         "en": "Sure! OK, I'm off. Take care!"
        }
       },
       {
        "id": "s1o1",
        "text": "Jasne! Dobranoc, proszę pana!",
        "tr": {
         "uk": "(дивно й не за часом)",
         "ru": "(странно и не по времени)",
         "en": "(odd and wrong time of day)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "**Lecę** — «мені час», **Trzymaj się** — тепле прощання.",
       "ru": "**Lecę** — «мне пора», **Trzymaj się** — тёплое прощание.",
       "en": "**Lecę** — I'm off; **Trzymaj się** — take care."
      }
     }
    ]
   },
   "explanation": null
  },
  "to": {
   "type": "DIALOGUE",
   "skill": "dialogue.slang",
   "data": {
    "npc": {
     "name": "Kuba",
     "emoji": "🧑🏼",
     "role": {
      "uk": "друг-студент",
      "ru": "друг-студент",
      "en": "a student friend"
     }
    },
    "steps": [
     {
      "npc": "Siema! Co tam?",
      "npcTr": {
       "uk": "Привіт! Як справи?",
       "ru": "Привет! Как дела?",
       "en": "Hi! What's up?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Siema! Spoko, a u ciebie?",
        "tr": {
         "uk": "Привіт! Нормально, а в тебе?",
         "ru": "Привет! Нормально, а у тебя?",
         "en": "Hi! Fine, you?"
        }
       },
       {
        "id": "s0o1",
        "text": "Dzień dobry panu, wszystko w porządku.",
        "tr": {
         "uk": "Добрий день, пане, усе гаразд.",
         "ru": "Добрый день, всё в порядке.",
         "en": "Good day, sir, all is well."
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "Другові можна відповісти так само неформально. «Dzień dobry panu» звучить тут дивно офіційно.",
       "ru": "Другу можно ответить так же неформально. «Dzień dobry panu» звучит здесь странно официально.",
       "en": "Answer a friend just as casually."
      }
     },
     {
      "npc": "Też luz. Idziesz na koncert w sobotę?",
      "npcTr": {
       "uk": "Теж спокійно. Ідеш на концерт у суботу?",
       "ru": "Тоже нормально. Идёшь на концерт в субботу?",
       "en": "All chill too. Coming to the concert on Saturday?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Jasne! Dobra, lecę. Trzymaj się!",
        "tr": {
         "uk": "Звісно! Добре, я побіг. Тримайся!",
         "ru": "Конечно! Ладно, я побежал. Держись!",
         "en": "Sure! OK, I'm off. Take care!"
        }
       },
       {
        "id": "s1o1",
        "text": "Oczywiście, proszę pana. Do widzenia!",
        "tr": {
         "uk": "Звісно, пане. До побачення!",
         "ru": "Конечно, господин. До свидания!",
         "en": "Certainly, sir. Goodbye!"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "Друг говорить на «ти» й по-простому — «proszę pana» і «do widzenia» звучать як до незнайомця. По-дружньому: **Jasne! Lecę. Trzymaj się!**",
       "ru": "Друг говорит на «ты» и по-простому — «proszę pana» и «do widzenia» звучат как к незнакомцу. По-дружески: **Jasne! Lecę. Trzymaj się!**",
       "en": "A friend speaks casually — \"proszę pana\" and \"do widzenia\" sound like talking to a stranger. Say **Jasne! Lecę. Trzymaj się!**"
      }
     }
    ]
   },
   "explanation": null
  }
 },
 {
  "lesson": "wro-1-kawa",
  "n": 9,
  "from": {
   "type": "SITUATION",
   "skill": "situation.cafe",
   "data": {
    "npc": {
     "name": "Bartek",
     "emoji": "🧑🏻‍🍳",
     "role": {
      "uk": "бариста у кав'ярні",
      "ru": "бариста в кофейне",
      "en": "a barista"
     }
    },
    "scene": {
     "uk": "Ранок у кав'ярні на Ринку у Вроцлаві.",
     "ru": "Утро в кофейне на Рынке во Вроцлаве.",
     "en": "Morning in a café on Wrocław's Market Square."
    },
    "steps": [
     {
      "npc": "Dzień dobry! Co podać?",
      "npcTr": {
       "uk": "Добрий день! Що вам подати?",
       "ru": "Добрый день! Что вам подать?",
       "en": "Hello! What can I get you?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Poproszę herbatę.",
        "tr": {
         "uk": "Чай, будь ласка.",
         "ru": "Чай, пожалуйста.",
         "en": "A tea, please."
        }
       },
       {
        "id": "s0o1",
        "text": "Poproszę herbata.",
        "tr": {
         "uk": "(помилка у відмінку)",
         "ru": "(ошибка в падеже)",
         "en": "(case error)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "Після **poproszę**: **herbatę**.",
       "ru": "После **poproszę**: **herbatę**.",
       "en": "After **poproszę**: **herbatę**."
      }
     },
     {
      "npc": "Na miejscu czy na wynos?",
      "npcTr": {
       "uk": "Тут чи з собою?",
       "ru": "Здесь или с собой?",
       "en": "For here or to go?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Na wynos, proszę.",
        "tr": {
         "uk": "З собою, будь ласка.",
         "ru": "С собой, пожалуйста.",
         "en": "To go, please."
        }
       },
       {
        "id": "s1o1",
        "text": "Dobranoc.",
        "tr": {
         "uk": "На добраніч.",
         "ru": "Спокойной ночи.",
         "en": "Good night."
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "Обери **na miejscu** (тут) або **na wynos** (з собою).",
       "ru": "Выбери **na miejscu** (здесь) или **na wynos** (с собой).",
       "en": "Choose **na miejscu** or **na wynos**."
      }
     },
     {
      "npc": "Proszę bardzo. Dwanaście złotych.",
      "npcTr": {
       "uk": "Прошу. Дванадцять злотих.",
       "ru": "Пожалуйста. Двенадцать злотых.",
       "en": "Here you are. Twelve zlotys."
      }
     }
    ]
   },
   "explanation": null
  },
  "to": {
   "type": "SITUATION",
   "skill": "situation.cafe",
   "data": {
    "npc": {
     "name": "Bartek",
     "emoji": "🧑🏻‍🍳",
     "role": {
      "uk": "бариста у кав'ярні",
      "ru": "бариста в кофейне",
      "en": "a barista"
     }
    },
    "scene": {
     "uk": "Ранок у кав'ярні на Ринку у Вроцлаві.",
     "ru": "Утро в кофейне на Рынке во Вроцлаве.",
     "en": "Morning in a café on Wrocław's Market Square."
    },
    "steps": [
     {
      "npc": "Dzień dobry! Co podać?",
      "npcTr": {
       "uk": "Добрий день! Що вам подати?",
       "ru": "Добрый день! Что вам подать?",
       "en": "Hello! What can I get you?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Poproszę herbatę.",
        "tr": {
         "uk": "Чай, будь ласка.",
         "ru": "Чай, пожалуйста.",
         "en": "A tea, please."
        }
       },
       {
        "id": "s0o1",
        "text": "Poproszę herbata.",
        "tr": {
         "uk": "(помилка у відмінку)",
         "ru": "(ошибка в падеже)",
         "en": "(case error)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "Після **poproszę**: **herbatę**.",
       "ru": "После **poproszę**: **herbatę**.",
       "en": "After **poproszę**: **herbatę**."
      }
     },
     {
      "npc": "Na miejscu czy na wynos?",
      "npcTr": {
       "uk": "Тут чи з собою?",
       "ru": "Здесь или с собой?",
       "en": "For here or to go?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Na wynos, proszę.",
        "tr": {
         "uk": "З собою, будь ласка.",
         "ru": "С собой, пожалуйста.",
         "en": "To go, please."
        }
       },
       {
        "id": "s1o1",
        "text": "Na miejsce, proszę.",
        "tr": {
         "uk": "Тут, будь ласка. (з помилкою)",
         "ru": "Здесь, пожалуйста. (с ошибкой)",
         "en": "For here, please. (a mistake)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "Відповідь — як у питанні: **na miejscu** (місцевий відмінок: «де?») або **na wynos** (з собою).",
       "ru": "Ответ — как в вопросе: **na miejscu** (предложный падеж: «где?») или **na wynos** (с собой).",
       "en": "Answer with the same forms: **na miejscu** (locative, \"where?\") or **na wynos** (to go)."
      }
     },
     {
      "npc": "Proszę bardzo. Dwanaście złotych.",
      "npcTr": {
       "uk": "Прошу. Дванадцять злотих.",
       "ru": "Пожалуйста. Двенадцать злотых.",
       "en": "Here you are. Twelve zlotys."
      }
     }
    ]
   },
   "explanation": null
  }
 },
 {
  "lesson": "wro-2-zabka",
  "n": 8,
  "from": {
   "type": "SITUATION",
   "skill": "situation.shopping",
   "data": {
    "npc": {
     "name": "Pani Magda",
     "emoji": "👩🏼‍💼",
     "role": {
      "uk": "касирка в Żabce",
      "ru": "кассирша в Żabka",
      "en": "a cashier at Żabka"
     }
    },
    "scene": {
     "uk": "Ти зайшов у Żabku купити булочку.",
     "ru": "Ты зашёл в Żabka купить булочку.",
     "en": "You popped into Żabka to buy a roll."
    },
    "steps": [
     {
      "npc": "Dzień dobry!",
      "npcTr": {
       "uk": "Добрий день!",
       "ru": "Добрый день!",
       "en": "Hello!"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Dzień dobry! Ile kosztuje ta bułka?",
        "tr": {
         "uk": "Добрий день! Скільки коштує ця булочка?",
         "ru": "Добрый день! Сколько стоит эта булочка?",
         "en": "Hello! How much is this roll?"
        }
       },
       {
        "id": "s0o1",
        "text": "Cześć, ziomek!",
        "tr": {
         "uk": "Здоров, брате!",
         "ru": "Здорово, братан!",
         "en": "Yo, bro!"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "З касиркою — формально: **Dzień dobry!**",
       "ru": "С кассиршей — формально: **Dzień dobry!**",
       "en": "With a cashier be formal: **Dzień dobry!**"
      }
     },
     {
      "npc": "Dwa złote. Coś jeszcze?",
      "npcTr": {
       "uk": "Два злотих. Щось іще?",
       "ru": "Два злотых. Что-нибудь ещё?",
       "en": "Two zlotys. Anything else?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Nie, dziękuję.",
        "tr": {
         "uk": "Ні, дякую.",
         "ru": "Нет, спасибо.",
         "en": "No, thank you."
        }
       },
       {
        "id": "s1o1",
        "text": "Tak, dobranoc.",
        "tr": {
         "uk": "Так, на добраніч.",
         "ru": "Да, спокойной ночи.",
         "en": "Yes, good night."
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "Якщо більше нічого не треба: **Nie, dziękuję.**",
       "ru": "Если больше ничего не нужно: **Nie, dziękuję.**",
       "en": "If you need nothing else: **Nie, dziękuję.**"
      }
     },
     {
      "npc": "Kartą czy gotówką?",
      "npcTr": {
       "uk": "Карткою чи готівкою?",
       "ru": "Картой или наличными?",
       "en": "Card or cash?"
      },
      "options": [
       {
        "id": "s2o0",
        "text": "Kartą, proszę.",
        "tr": {
         "uk": "Карткою, будь ласка.",
         "ru": "Картой, пожалуйста.",
         "en": "By card, please."
        }
       },
       {
        "id": "s2o1",
        "text": "Karta, proszę.",
        "tr": {
         "uk": "(помилка у відмінку)",
         "ru": "(ошибка в падеже)",
         "en": "(case error)"
        }
       }
      ],
      "answer": "s2o0",
      "feedback": {
       "uk": "Чим? — **kartą** (орудний відмінок).",
       "ru": "Чем? — **kartą** (творительный падеж).",
       "en": "With what? — **kartą** (instrumental)."
      }
     },
     {
      "npc": "Paragon?",
      "npcTr": {
       "uk": "Чек?",
       "ru": "Чек?",
       "en": "Receipt?"
      },
      "options": [
       {
        "id": "s3o0",
        "text": "Nie, dziękuję. Do widzenia!",
        "tr": {
         "uk": "Ні, дякую. До побачення!",
         "ru": "Нет, спасибо. До свидания!",
         "en": "No, thanks. Goodbye!"
        }
       },
       {
        "id": "s3o1",
        "text": "Smacznego!",
        "tr": {
         "uk": "Смачного!",
         "ru": "Приятного аппетита!",
         "en": "Enjoy your meal!"
        }
       }
      ],
      "answer": "s3o0",
      "feedback": {
       "uk": "Відповідай на питання про чек і попрощайся.",
       "ru": "Ответь на вопрос про чек и попрощайся.",
       "en": "Answer about the receipt and say goodbye."
      }
     }
    ]
   },
   "explanation": null
  },
  "to": {
   "type": "SITUATION",
   "skill": "situation.shopping",
   "data": {
    "npc": {
     "name": "Pani Magda",
     "emoji": "👩🏼‍💼",
     "role": {
      "uk": "касирка в Żabce",
      "ru": "кассирша в Żabka",
      "en": "a cashier at Żabka"
     }
    },
    "scene": {
     "uk": "Ти зайшов у Żabku купити булочку.",
     "ru": "Ты зашёл в Żabka купить булочку.",
     "en": "You popped into Żabka to buy a roll."
    },
    "steps": [
     {
      "npc": "Dzień dobry!",
      "npcTr": {
       "uk": "Добрий день!",
       "ru": "Добрый день!",
       "en": "Hello!"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Dzień dobry! Ile kosztuje ta bułka?",
        "tr": {
         "uk": "Добрий день! Скільки коштує ця булочка?",
         "ru": "Добрый день! Сколько стоит эта булочка?",
         "en": "Hello! How much is this roll?"
        }
       },
       {
        "id": "s0o1",
        "text": "Cześć, ziomek!",
        "tr": {
         "uk": "Здоров, брате!",
         "ru": "Здорово, братан!",
         "en": "Yo, bro!"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "З касиркою — формально: **Dzień dobry!**",
       "ru": "С кассиршей — формально: **Dzień dobry!**",
       "en": "With a cashier be formal: **Dzień dobry!**"
      }
     },
     {
      "npc": "Dwa złote. Coś jeszcze?",
      "npcTr": {
       "uk": "Два злотих. Щось іще?",
       "ru": "Два злотых. Что-нибудь ещё?",
       "en": "Two zlotys. Anything else?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Nie, dziękuję.",
        "tr": {
         "uk": "Ні, дякую.",
         "ru": "Нет, спасибо.",
         "en": "No, thank you."
        }
       },
       {
        "id": "s1o1",
        "text": "Tak, to wszystko.",
        "tr": {
         "uk": "Так, це все.",
         "ru": "Да, это всё.",
         "en": "Yes, that's all."
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "«Coś jeszcze?» — «Щось іще?». «Tak» означає, що ти хочеш ще щось. Якщо більше нічого не треба: **Nie, dziękuję** або **Nie, to wszystko.**",
       "ru": "«Coś jeszcze?» — «Что-нибудь ещё?». «Tak» значит, что ты хочешь что-то ещё. Если больше ничего не нужно: **Nie, dziękuję** или **Nie, to wszystko.**",
       "en": "\"Coś jeszcze?\" means \"anything else?\". \"Tak\" means you want more. If not: **Nie, dziękuję** or **Nie, to wszystko.**"
      }
     },
     {
      "npc": "Kartą czy gotówką?",
      "npcTr": {
       "uk": "Карткою чи готівкою?",
       "ru": "Картой или наличными?",
       "en": "Card or cash?"
      },
      "options": [
       {
        "id": "s2o0",
        "text": "Kartą, proszę.",
        "tr": {
         "uk": "Карткою, будь ласка.",
         "ru": "Картой, пожалуйста.",
         "en": "By card, please."
        }
       },
       {
        "id": "s2o1",
        "text": "Karta, proszę.",
        "tr": {
         "uk": "(помилка у відмінку)",
         "ru": "(ошибка в падеже)",
         "en": "(case error)"
        }
       }
      ],
      "answer": "s2o0",
      "feedback": {
       "uk": "Чим? — **kartą** (орудний відмінок).",
       "ru": "Чем? — **kartą** (творительный падеж).",
       "en": "With what? — **kartą** (instrumental)."
      }
     },
     {
      "npc": "Paragon?",
      "npcTr": {
       "uk": "Чек?",
       "ru": "Чек?",
       "en": "Receipt?"
      },
      "options": [
       {
        "id": "s3o0",
        "text": "Nie, dziękuję. Do widzenia!",
        "tr": {
         "uk": "Ні, дякую. До побачення!",
         "ru": "Нет, спасибо. До свидания!",
         "en": "No, thanks. Goodbye!"
        }
       },
       {
        "id": "s3o1",
        "text": "Nie, mam swoją torbę.",
        "tr": {
         "uk": "Ні, у мене своя торба.",
         "ru": "Нет, у меня своя сумка.",
         "en": "No, I have my own bag."
        }
       }
      ],
      "answer": "s3o0",
      "feedback": {
       "uk": "Питають про чек (**paragon**), а не про пакет. Відповідай: **Nie, dziękuję** або **Tak, poproszę** — і попрощайся.",
       "ru": "Спрашивают о чеке (**paragon**), а не о пакете. Ответь: **Nie, dziękuję** или **Tak, poproszę** — и попрощайся.",
       "en": "They ask about the receipt (**paragon**), not a bag. Answer **Nie, dziękuję** or **Tak, poproszę** and say goodbye."
      }
     }
    ]
   },
   "explanation": null
  }
 },
 {
  "lesson": "wro-4-restauracja",
  "n": 8,
  "from": {
   "type": "SITUATION",
   "skill": "situation.restaurant",
   "data": {
    "npc": {
     "name": "Pan Tomek",
     "emoji": "🤵🏻",
     "role": {
      "uk": "офіціант",
      "ru": "официант",
      "en": "a waiter"
     }
    },
    "scene": {
     "uk": "Ти обідаєш у ресторані біля Ратуші.",
     "ru": "Ты обедаешь в ресторане у Ратуши.",
     "en": "You are having lunch near the Town Hall."
    },
    "steps": [
     {
      "npc": "Dzień dobry. Co dla pana?",
      "npcTr": {
       "uk": "Добрий день. Що для вас?",
       "ru": "Добрый день. Что для вас?",
       "en": "Hello. What would you like?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Poproszę zupę pomidorową i pierogi.",
        "tr": {
         "uk": "Томатний суп і вареники, будь ласка.",
         "ru": "Томатный суп и вареники, пожалуйста.",
         "en": "Tomato soup and pierogi, please."
        }
       },
       {
        "id": "s0o1",
        "text": "Poproszę rachunek.",
        "tr": {
         "uk": "Рахунок, будь ласка.",
         "ru": "Счёт, пожалуйста.",
         "en": "The bill, please."
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "Спочатку замовлення, рахунок — наприкінці!",
       "ru": "Сначала заказ, счёт — в конце!",
       "en": "Order first, the bill comes at the end!"
      }
     },
     {
      "npc": "A do picia?",
      "npcTr": {
       "uk": "А що пити?",
       "ru": "А что пить?",
       "en": "And to drink?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Dla mnie sok jabłkowy.",
        "tr": {
         "uk": "Мені яблучний сік.",
         "ru": "Мне яблочный сок.",
         "en": "Apple juice for me."
        }
       },
       {
        "id": "s1o1",
        "text": "Dla mnie smacznego.",
        "tr": {
         "uk": "(безглуздо)",
         "ru": "(бессмысленно)",
         "en": "(nonsense)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "**Dla mnie** + напій.",
       "ru": "**Dla mnie** + напиток.",
       "en": "**Dla mnie** + drink."
      }
     },
     {
      "npc": "Proszę bardzo. Smacznego!",
      "npcTr": {
       "uk": "Прошу. Смачного!",
       "ru": "Пожалуйста. Приятного аппетита!",
       "en": "Here you are. Enjoy!"
      },
      "options": [
       {
        "id": "s2o0",
        "text": "Dziękuję!",
        "tr": {
         "uk": "Дякую!",
         "ru": "Спасибо!",
         "en": "Thank you!"
        }
       },
       {
        "id": "s2o1",
        "text": "Nawzajem, dobranoc!",
        "tr": {
         "uk": "Навзаєм, на добраніч!",
         "ru": "Взаимно, спокойной ночи!",
         "en": "Likewise, good night!"
        }
       }
      ],
      "answer": "s2o0",
      "feedback": {
       "uk": "Офіціантові просто кажуть **Dziękuję!**",
       "ru": "Официанту просто говорят **Dziękuję!**",
       "en": "Just say **Dziękuję!** to the waiter."
      }
     },
     {
      "npc": "(Po obiedzie)",
      "npcTr": {
       "uk": "(Після обіду)",
       "ru": "(После обеда)",
       "en": "(After lunch)"
      },
      "options": [
       {
        "id": "s3o0",
        "text": "Poproszę rachunek. Czy mogę zapłacić kartą?",
        "tr": {
         "uk": "Рахунок, будь ласка. Можна карткою?",
         "ru": "Счёт, пожалуйста. Можно картой?",
         "en": "The bill, please. Can I pay by card?"
        }
       },
       {
        "id": "s3o1",
        "text": "Poproszę menu.",
        "tr": {
         "uk": "Меню, будь ласка.",
         "ru": "Меню, пожалуйста.",
         "en": "The menu, please."
        }
       }
      ],
      "answer": "s3o0",
      "feedback": {
       "uk": "Після обіду просять **rachunek**.",
       "ru": "После обеда просят **rachunek**.",
       "en": "After the meal ask for **rachunek**."
      }
     }
    ]
   },
   "explanation": null
  },
  "to": {
   "type": "SITUATION",
   "skill": "situation.restaurant",
   "data": {
    "npc": {
     "name": "Pan Tomek",
     "emoji": "🤵🏻",
     "role": {
      "uk": "офіціант",
      "ru": "официант",
      "en": "a waiter"
     }
    },
    "scene": {
     "uk": "Ти обідаєш у ресторані біля Ратуші.",
     "ru": "Ты обедаешь в ресторане у Ратуши.",
     "en": "You are having lunch near the Town Hall."
    },
    "steps": [
     {
      "npc": "Dzień dobry. Co dla pana?",
      "npcTr": {
       "uk": "Добрий день. Що для вас?",
       "ru": "Добрый день. Что для вас?",
       "en": "Hello. What would you like?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Poproszę zupę pomidorową i pierogi.",
        "tr": {
         "uk": "Томатний суп і вареники, будь ласка.",
         "ru": "Томатный суп и вареники, пожалуйста.",
         "en": "Tomato soup and pierogi, please."
        }
       },
       {
        "id": "s0o1",
        "text": "Poproszę rachunek.",
        "tr": {
         "uk": "Рахунок, будь ласка.",
         "ru": "Счёт, пожалуйста.",
         "en": "The bill, please."
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "Спочатку замовлення, рахунок — наприкінці!",
       "ru": "Сначала заказ, счёт — в конце!",
       "en": "Order first, the bill comes at the end!"
      }
     },
     {
      "npc": "A do picia?",
      "npcTr": {
       "uk": "А що пити?",
       "ru": "А что пить?",
       "en": "And to drink?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Dla mnie sok jabłkowy.",
        "tr": {
         "uk": "Мені яблучний сік.",
         "ru": "Мне яблочный сок.",
         "en": "Apple juice for me."
        }
       },
       {
        "id": "s1o1",
        "text": "Dla mnie sok jabłkowa.",
        "tr": {
         "uk": "Мені яблучний сік. (з помилкою)",
         "ru": "Мне яблочный сок. (с ошибкой)",
         "en": "Apple juice for me. (a mistake)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "**Sok** — чоловічого роду, тож прикметник теж: **sok jabłkowy** (закінчення -a — для жіночого роду: herbata owocowa).",
       "ru": "**Sok** — мужского рода, поэтому и прилагательное: **sok jabłkowy** (окончание -a — для женского рода: herbata owocowa).",
       "en": "**Sok** is masculine, so the adjective is too: **sok jabłkowy** (feminine -a goes with feminine nouns: herbata owocowa)."
      }
     },
     {
      "npc": "Proszę bardzo. Smacznego!",
      "npcTr": {
       "uk": "Прошу. Смачного!",
       "ru": "Пожалуйста. Приятного аппетита!",
       "en": "Here you are. Enjoy!"
      },
      "options": [
       {
        "id": "s2o0",
        "text": "Dziękuję!",
        "tr": {
         "uk": "Дякую!",
         "ru": "Спасибо!",
         "en": "Thank you!"
        }
       },
       {
        "id": "s2o1",
        "text": "Nawzajem!",
        "tr": {
         "uk": "Навзаєм!",
         "ru": "Взаимно!",
         "en": "You too!"
        }
       }
      ],
      "answer": "s2o0",
      "feedback": {
       "uk": "Офіціант не їсть разом із тобою — «nawzajem» тут не підходить. Йому просто кажуть **Dziękuję!**",
       "ru": "Официант не ест вместе с тобой — «nawzajem» здесь не подходит. Ему просто говорят **Dziękuję!**",
       "en": "The waiter isn't eating with you, so \"nawzajem\" doesn't fit. Just say **Dziękuję!**"
      }
     },
     {
      "npc": "(Po obiedzie)",
      "npcTr": {
       "uk": "(Після обіду)",
       "ru": "(После обеда)",
       "en": "(After lunch)"
      },
      "options": [
       {
        "id": "s3o0",
        "text": "Poproszę rachunek. Czy mogę zapłacić kartą?",
        "tr": {
         "uk": "Рахунок, будь ласка. Можна карткою?",
         "ru": "Счёт, пожалуйста. Можно картой?",
         "en": "The bill, please. Can I pay by card?"
        }
       },
       {
        "id": "s3o1",
        "text": "Poproszę menu.",
        "tr": {
         "uk": "Меню, будь ласка.",
         "ru": "Меню, пожалуйста.",
         "en": "The menu, please."
        }
       }
      ],
      "answer": "s3o0",
      "feedback": {
       "uk": "Після обіду просять **rachunek**.",
       "ru": "После обеда просят **rachunek**.",
       "en": "After the meal ask for **rachunek**."
      }
     }
    ]
   },
   "explanation": null
  }
 },
 {
  "lesson": "wro-boss",
  "n": 6,
  "from": {
   "type": "ODD_ONE_OUT",
   "skill": "vocab.cafe",
   "data": {
    "question": {
     "uk": "Що НЕ є напоєм?",
     "ru": "Что НЕ является напитком?",
     "en": "Which is NOT a drink?"
    },
    "options": [
     {
      "id": "w0",
      "text": "kawa"
     },
     {
      "id": "w1",
      "text": "herbata"
     },
     {
      "id": "w2",
      "text": "sok"
     },
     {
      "id": "w3",
      "text": "torba"
     }
    ],
    "answer": "w3"
   },
   "explanation": {
    "uk": "**torba** — пакет, а не напій.",
    "ru": "**torba** — пакет, а не напиток.",
    "en": "**torba** is a bag, not a drink."
   }
  },
  "to": {
   "type": "ODD_ONE_OUT",
   "skill": "vocab.cafe",
   "data": {
    "question": {
     "uk": "Що НЕ є напоєм?",
     "ru": "Что НЕ является напитком?",
     "en": "Which is NOT a drink?"
    },
    "options": [
     {
      "id": "w0",
      "text": "kawa"
     },
     {
      "id": "w1",
      "text": "herbata"
     },
     {
      "id": "w2",
      "text": "sok"
     },
     {
      "id": "w3",
      "text": "ciastko"
     }
    ],
    "answer": "w3"
   },
   "explanation": {
    "uk": "**Ciastko** — тістечко, його їдять; **kawa**, **herbata**, **sok** — напої.",
    "ru": "**Ciastko** — пирожное, его едят; **kawa**, **herbata**, **sok** — напитки.",
    "en": "**Ciastko** is a cake you eat; **kawa**, **herbata**, **sok** are drinks."
   }
  }
 },
 {
  "lesson": "pzn-2-koziolki",
  "n": 6,
  "from": {
   "type": "DIALOGUE",
   "skill": "dialogue.poznan",
   "data": {
    "npc": {
     "name": "Pani Agnieszka",
     "emoji": "👩🏼‍🏫",
     "role": {
      "uk": "екскурсоводка",
      "ru": "экскурсовод",
      "en": "a tour guide"
     }
    },
    "steps": [
     {
      "npc": "Proszę państwa, jest prawie dwunasta. Patrzymy na wieżę ratusza!",
      "npcTr": {
       "uk": "Шановні, майже дванадцята. Дивимося на вежу ратуші!",
       "ru": "Дамы и господа, почти двенадцать. Смотрим на башню ратуши!",
       "en": "Ladies and gentlemen, it's almost twelve. Look at the town hall tower!"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Ile razy trykają się koziołki?",
        "tr": {
         "uk": "Скільки разів б'ються козлики?",
         "ru": "Сколько раз бодаются козлики?",
         "en": "How many times do the goats butt heads?"
        }
       },
       {
        "id": "s0o1",
        "text": "Ile kosztują koziołki?",
        "tr": {
         "uk": "(питання про ціну тут не до місця)",
         "ru": "(вопрос о цене здесь не к месту)",
         "en": "(asking the price makes no sense here)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "Скільки разів — **Ile razy?**",
       "ru": "Сколько раз — **Ile razy?**",
       "en": "How many times — **Ile razy?**"
      }
     },
     {
      "npc": "Dwanaście razy, codziennie w południe.",
      "npcTr": {
       "uk": "Дванадцять разів, щодня опівдні.",
       "ru": "Двенадцать раз, каждый день в полдень.",
       "en": "Twelve times, every day at noon."
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Codziennie? To super!",
        "tr": {
         "uk": "Щодня? Це супер!",
         "ru": "Каждый день? Это супер!",
         "en": "Every day? That's great!"
        }
       },
       {
        "id": "s1o1",
        "text": "Codziennie? Dobranoc!",
        "tr": {
         "uk": "(«на добраніч» тут не до місця)",
         "ru": "(«спокойной ночи» здесь не к месту)",
         "en": "(\"good night\" doesn't fit)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "**Codziennie** — щодня.",
       "ru": "**Codziennie** — каждый день.",
       "en": "**Codziennie** — every day."
      }
     }
    ]
   },
   "explanation": null
  },
  "to": {
   "type": "DIALOGUE",
   "skill": "dialogue.poznan",
   "data": {
    "npc": {
     "name": "Pani Agnieszka",
     "emoji": "👩🏼‍🏫",
     "role": {
      "uk": "екскурсоводка",
      "ru": "экскурсовод",
      "en": "a tour guide"
     }
    },
    "steps": [
     {
      "npc": "Proszę państwa, jest prawie dwunasta. Patrzymy na wieżę ratusza!",
      "npcTr": {
       "uk": "Шановні, майже дванадцята. Дивимося на вежу ратуші!",
       "ru": "Дамы и господа, почти двенадцать. Смотрим на башню ратуши!",
       "en": "Ladies and gentlemen, it's almost twelve. Look at the town hall tower!"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Ile razy trykają się koziołki?",
        "tr": {
         "uk": "Скільки разів б'ються козлики?",
         "ru": "Сколько раз бодаются козлики?",
         "en": "How many times do the goats butt heads?"
        }
       },
       {
        "id": "s0o1",
        "text": "Ile czasu trykają się koziołki?",
        "tr": {
         "uk": "Скільки часу б'ються козлики?",
         "ru": "Сколько времени бодаются козлики?",
         "en": "For how long do the goats butt heads?"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "Про кількість повторів питають **Ile razy?** — скільки разів. **Ile czasu?** — як довго.",
       "ru": "О количестве повторов спрашивают **Ile razy?** — сколько раз. **Ile czasu?** — как долго.",
       "en": "To ask how many times use **Ile razy?**; **Ile czasu?** asks how long."
      }
     },
     {
      "npc": "Dwanaście razy, codziennie w południe.",
      "npcTr": {
       "uk": "Дванадцять разів, щодня опівдні.",
       "ru": "Двенадцать раз, каждый день в полдень.",
       "en": "Twelve times, every day at noon."
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Codziennie? To super!",
        "tr": {
         "uk": "Щодня? Це супер!",
         "ru": "Каждый день? Это супер!",
         "en": "Every day? That's great!"
        }
       },
       {
        "id": "s1o1",
        "text": "Raz w tygodniu? To super!",
        "tr": {
         "uk": "Раз на тиждень? Це супер!",
         "ru": "Раз в неделю? Это супер!",
         "en": "Once a week? That's great!"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "Гідка сказала **codziennie** — щодня, а не «raz w tygodniu» (раз на тиждень).",
       "ru": "Гид сказала **codziennie** — каждый день, а не «raz w tygodniu» (раз в неделю).",
       "en": "The guide said **codziennie** — every day, not \"raz w tygodniu\" (once a week)."
      }
     }
    ]
   },
   "explanation": null
  }
 },
 {
  "lesson": "pzn-2-koziolki",
  "n": 8,
  "from": {
   "type": "ODD_ONE_OUT",
   "skill": "vocab.poznan",
   "data": {
    "question": {
     "uk": "Що не відповідає на питання «як часто?»",
     "ru": "Что не отвечает на вопрос «как часто?»",
     "en": "Which one does not answer \"how often?\""
    },
    "options": [
     {
      "id": "w0",
      "text": "raz"
     },
     {
      "id": "w1",
      "text": "dwa razy"
     },
     {
      "id": "w2",
      "text": "codziennie"
     },
     {
      "id": "w3",
      "text": "zegar"
     }
    ],
    "answer": "w3"
   },
   "explanation": {
    "uk": "**zegar** — предмет (годинник); решта відповідають на питання «як часто?».",
    "ru": "**zegar** — предмет (часы); остальные отвечают на вопрос «как часто?».",
    "en": "**zegar** is an object (a clock); the rest answer \"how often?\"."
   }
  },
  "to": {
   "type": "ODD_ONE_OUT",
   "skill": "vocab.poznan",
   "data": {
    "question": {
     "uk": "Що не відповідає на питання «як часто?»",
     "ru": "Что не отвечает на вопрос «как часто?»",
     "en": "Which one does not answer \"how often?\""
    },
    "options": [
     {
      "id": "w0",
      "text": "raz"
     },
     {
      "id": "w1",
      "text": "dwa razy"
     },
     {
      "id": "w2",
      "text": "codziennie"
     },
     {
      "id": "w3",
      "text": "w południe"
     }
    ],
    "answer": "w3"
   },
   "explanation": {
    "uk": "**W południe** — опівдні, відповідає на «коли?»; решта — на «як часто?».",
    "ru": "**W południe** — в полдень, отвечает на «когда?»; остальные — на «как часто?».",
    "en": "**W południe** (at noon) answers \"when?\"; the rest answer \"how often?\"."
   }
  }
 },
 {
  "lesson": "pzn-8-weekend",
  "n": 8,
  "from": {
   "type": "ODD_ONE_OUT",
   "skill": "review.poznan",
   "data": {
    "question": {
     "uk": "Що не є місцем у місті?",
     "ru": "Что не является местом в городе?",
     "en": "Which one is not a place in the city?"
    },
    "options": [
     {
      "id": "w0",
      "text": "jezioro"
     },
     {
      "id": "w1",
      "text": "stadion"
     },
     {
      "id": "w2",
      "text": "browar"
     },
     {
      "id": "w3",
      "text": "październik"
     }
    ],
    "answer": "w3"
   },
   "explanation": {
    "uk": "**październik** — місяць; решта — місця в місті.",
    "ru": "**październik** — месяц; остальные — места в городе.",
    "en": "**październik** is a month; the rest are places in the city."
   }
  },
  "to": {
   "type": "ODD_ONE_OUT",
   "skill": "review.poznan",
   "data": {
    "question": {
     "uk": "Що не є місцем, куди можна поїхати?",
     "ru": "Что не является местом, куда можно поехать?",
     "en": "Which one is not a place you can go to?"
    },
    "options": [
     {
      "id": "w0",
      "text": "jezioro"
     },
     {
      "id": "w1",
      "text": "stadion"
     },
     {
      "id": "w2",
      "text": "browar"
     },
     {
      "id": "w3",
      "text": "rower"
     }
    ],
    "answer": "w3"
   },
   "explanation": {
    "uk": "**Rower** — велосипед, на ньому їдуть; **jezioro**, **stadion**, **browar** — місця, куди можна поїхати у вихідні.",
    "ru": "**Rower** — велосипед, на нём едут; **jezioro**, **stadion**, **browar** — места, куда можно поехать на выходных.",
    "en": "**Rower** is a bike you ride; **jezioro**, **stadion**, **browar** are places to go at the weekend."
   }
  }
 },
 {
  "lesson": "placement-test",
  "n": 3,
  "from": {
   "type": "FILL_GAP",
   "skill": "grammar.genitive",
   "data": {
    "pl": "Jestem z ___.",
    "translation": {
     "uk": "Я з України.",
     "ru": "Я из Украины.",
     "en": "I'm from Ukraine."
    },
    "options": [
     {
      "id": "o0",
      "text": "Ukrainy"
     },
     {
      "id": "o1",
      "text": "Ukraina"
     },
     {
      "id": "o2",
      "text": "Ukrainę"
     }
    ],
    "answer": "o0"
   },
   "explanation": null
  },
  "to": {
   "type": "FILL_GAP",
   "skill": "grammar.genitive",
   "data": {
    "pl": "Jestem z ___.",
    "translation": {
     "uk": "Я з Білорусі.",
     "ru": "Я из Беларуси.",
     "en": "I'm from Belarus."
    },
    "options": [
     {
      "id": "o0",
      "text": "Białorusi"
     },
     {
      "id": "o1",
      "text": "Białoruś"
     },
     {
      "id": "o2",
      "text": "Białorusią"
     }
    ],
    "answer": "o0"
   },
   "explanation": null
  }
 },
 {
  "lesson": "waw-1-czesc",
  "n": 2,
  "from": {
   "type": "LISTENING",
   "skill": "listening.greetings",
   "data": {
    "audioText": "Dobry wieczór",
    "options": [
     {
      "id": "o0",
      "text": "Dobry wieczór"
     },
     {
      "id": "o1",
      "text": "Dzień dobry"
     },
     {
      "id": "o2",
      "text": "Dobranoc"
     }
    ],
    "answer": "o0"
   },
   "explanation": null
  },
  "to": {
   "type": "LISTENING",
   "skill": "listening.greetings",
   "data": {
    "audioText": "Dobry wieczór",
    "options": [
     {
      "id": "o0",
      "text": "Dobry wieczór"
     },
     {
      "id": "o1",
      "text": "Dzień dobry"
     },
     {
      "id": "o2",
      "text": "Dobrego wieczoru"
     }
    ],
    "answer": "o0"
   },
   "explanation": null
  }
 },
 {
  "lesson": "waw-1-czesc",
  "n": 8,
  "from": {
   "type": "DIALOGUE",
   "skill": "dialogue.greetings",
   "data": {
    "npc": {
     "name": "Ania",
     "emoji": "👩🏼",
     "role": {
      "uk": "студентка з Варшави",
      "ru": "студентка из Варшавы",
      "en": "a student from Warsaw"
     }
    },
    "steps": [
     {
      "npc": "Cześć!",
      "npcTr": {
       "uk": "Привіт!",
       "ru": "Привет!",
       "en": "Hi!"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Cześć!",
        "tr": {
         "uk": "Привіт!",
         "ru": "Привет!",
         "en": "Hi!"
        }
       },
       {
        "id": "s0o1",
        "text": "Dobranoc!",
        "tr": {
         "uk": "На добраніч!",
         "ru": "Спокойной ночи!",
         "en": "Good night!"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "Ania вітається неформально — відповідай так само: **Cześć!**",
       "ru": "Аня здоровается неформально — отвечай так же: **Cześć!**",
       "en": "Ania greets you informally — answer the same: **Cześć!**"
      }
     },
     {
      "npc": "Muszę iść. Na razie!",
      "npcTr": {
       "uk": "Мені треба йти. Бувай!",
       "ru": "Мне надо идти. Пока!",
       "en": "I have to go. See you!"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Na razie!",
        "tr": {
         "uk": "Бувай!",
         "ru": "Пока!",
         "en": "See you!"
        }
       },
       {
        "id": "s1o1",
        "text": "Dzień dobry!",
        "tr": {
         "uk": "Добрий день!",
         "ru": "Добрый день!",
         "en": "Good morning!"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "Ania прощається. **Dzień dobry** — це привітання.",
       "ru": "Аня прощается. **Dzień dobry** — это приветствие.",
       "en": "Ania is saying goodbye. **Dzień dobry** is a greeting."
      }
     }
    ]
   },
   "explanation": null
  },
  "to": {
   "type": "DIALOGUE",
   "skill": "dialogue.greetings",
   "data": {
    "npc": {
     "name": "Ania",
     "emoji": "👩🏼",
     "role": {
      "uk": "студентка з Варшави",
      "ru": "студентка из Варшавы",
      "en": "a student from Warsaw"
     }
    },
    "steps": [
     {
      "npc": "Cześć!",
      "npcTr": {
       "uk": "Привіт!",
       "ru": "Привет!",
       "en": "Hi!"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Cześć!",
        "tr": {
         "uk": "Привіт!",
         "ru": "Привет!",
         "en": "Hi!"
        }
       },
       {
        "id": "s0o1",
        "text": "Dobranoc!",
        "tr": {
         "uk": "На добраніч!",
         "ru": "Спокойной ночи!",
         "en": "Good night!"
        }
       },
       {
        "id": "s0o2",
        "text": "Do widzenia!",
        "tr": {
         "uk": "(**Do widzenia** — прощання; при зустрічі — **Cześć!**)",
         "ru": "(**Do widzenia** — прощание; при встрече — **Cześć!**)",
         "en": "(**Do widzenia** is a farewell; when meeting say **Cześć!**)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "Ania вітається неформально — відповідай так само: **Cześć!**",
       "ru": "Аня здоровается неформально — отвечай так же: **Cześć!**",
       "en": "Ania greets you informally — answer the same: **Cześć!**"
      }
     },
     {
      "npc": "Muszę iść. Na razie!",
      "npcTr": {
       "uk": "Мені треба йти. Бувай!",
       "ru": "Мне надо идти. Пока!",
       "en": "I have to go. See you!"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Na razie!",
        "tr": {
         "uk": "Бувай!",
         "ru": "Пока!",
         "en": "See you!"
        }
       },
       {
        "id": "s1o1",
        "text": "Dzień dobry!",
        "tr": {
         "uk": "Добрий день!",
         "ru": "Добрый день!",
         "en": "Good morning!"
        }
       },
       {
        "id": "s1o2",
        "text": "Dobry wieczór!",
        "tr": {
         "uk": "(**Dobry wieczór** — привітання ввечері; на прощання — **Na razie!**)",
         "ru": "(**Dobry wieczór** — приветствие вечером; на прощание — **Na razie!**)",
         "en": "(**Dobry wieczór** is an evening greeting; to say goodbye use **Na razie!**)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "Ania прощається. **Dzień dobry** — це привітання.",
       "ru": "Аня прощается. **Dzień dobry** — это приветствие.",
       "en": "Ania is saying goodbye. **Dzień dobry** is a greeting."
      }
     }
    ]
   },
   "explanation": null
  }
 },
 {
  "lesson": "waw-1-czesc",
  "n": 16,
  "from": {
   "type": "SITUATION",
   "skill": "situation.neighbour-hello",
   "data": {
    "npc": {
     "name": "Pan Zenon",
     "emoji": "👴🏻",
     "role": {
      "uk": "сусід, літній пан",
      "ru": "сосед, пожилой пан",
      "en": "an elderly neighbour"
     }
    },
    "scene": {
     "uk": "Ранок. На сходах зустрічаєш літнього сусіда пана Зенона.",
     "ru": "Утро. На лестнице встречаешь пожилого соседа пана Зенона.",
     "en": "Morning. You meet your elderly neighbour Mr Zenon on the stairs."
    },
    "steps": [
     {
      "npc": "Dzień dobry!",
      "npcTr": {
       "uk": "Добрий день!",
       "ru": "Добрый день!",
       "en": "Good morning!"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Dzień dobry, panie Zenonie!",
        "tr": {
         "uk": "Добрий день, пане Зеноне!",
         "ru": "Добрый день, пан Зенон!",
         "en": "Good morning, Mr Zenon!"
        }
       },
       {
        "id": "s0o1",
        "text": "Cześć, stary!",
        "tr": {
         "uk": "Привіт, старий!",
         "ru": "Привет, старик!",
         "en": "Hey, old man!"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "Зі старшим сусідом — формально: **Dzień dobry** + **pan** (panie Zenonie).",
       "ru": "Со старшим соседом — формально: **Dzień dobry** + **pan** (panie Zenonie).",
       "en": "With an older neighbour be formal: **Dzień dobry** + **pan** (panie Zenonie)."
      }
     },
     {
      "npc": "Do widzenia, miłego dnia!",
      "npcTr": {
       "uk": "До побачення, гарного дня!",
       "ru": "До свидания, хорошего дня!",
       "en": "Goodbye, have a nice day!"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Do widzenia, nawzajem!",
        "tr": {
         "uk": "До побачення, навзаєм!",
         "ru": "До свидания, и вам!",
         "en": "Goodbye, you too!"
        }
       },
       {
        "id": "s1o1",
        "text": "Na razie, nawzajem!",
        "tr": {
         "uk": "Бувай, навзаєм!",
         "ru": "Пока, и вам!",
         "en": "See you, you too!"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "**Na razie** — неформальне «бувай», зі старшим сусідом так не прощаються. Формально: **Do widzenia**, а на побажання — **nawzajem**.",
       "ru": "**Na razie** — неформальное «пока», со старшим соседом так не прощаются. Формально: **Do widzenia**, а на пожелание — **nawzajem**.",
       "en": "**Na razie** is an informal \"see you\" — not for an older neighbour. Say **Do widzenia** and reply to the wish with **nawzajem**."
      }
     }
    ]
   },
   "explanation": null
  },
  "to": {
   "type": "SITUATION",
   "skill": "situation.neighbour-hello",
   "data": {
    "npc": {
     "name": "Pan Zenon",
     "emoji": "👴🏻",
     "role": {
      "uk": "сусід, літній пан",
      "ru": "сосед, пожилой пан",
      "en": "an elderly neighbour"
     }
    },
    "scene": {
     "uk": "Ранок. На сходах зустрічаєш літнього сусіда пана Зенона.",
     "ru": "Утро. На лестнице встречаешь пожилого соседа пана Зенона.",
     "en": "Morning. You meet your elderly neighbour Mr Zenon on the stairs."
    },
    "steps": [
     {
      "npc": "Dzień dobry!",
      "npcTr": {
       "uk": "Добрий день!",
       "ru": "Добрый день!",
       "en": "Good morning!"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Dzień dobry, panie Zenonie!",
        "tr": {
         "uk": "Добрий день, пане Зеноне!",
         "ru": "Добрый день, пан Зенон!",
         "en": "Good morning, Mr Zenon!"
        }
       },
       {
        "id": "s0o1",
        "text": "Cześć, stary!",
        "tr": {
         "uk": "Привіт, старий!",
         "ru": "Привет, старик!",
         "en": "Hey, old man!"
        }
       },
       {
        "id": "s0o2",
        "text": "Dzień dobry, Zenek!",
        "tr": {
         "uk": "(до літнього сусіда — **panie Zenonie**; «Zenek» — надто фамільярно)",
         "ru": "(к пожилому соседу — **panie Zenonie**; «Zenek» — слишком фамильярно)",
         "en": "(to an elderly neighbour say **panie Zenonie**; “Zenek” is too familiar)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "Зі старшим сусідом — формально: **Dzień dobry** + **pan** (panie Zenonie).",
       "ru": "Со старшим соседом — формально: **Dzień dobry** + **pan** (panie Zenonie).",
       "en": "With an older neighbour be formal: **Dzień dobry** + **pan** (panie Zenonie)."
      }
     },
     {
      "npc": "Do widzenia, miłego dnia!",
      "npcTr": {
       "uk": "До побачення, гарного дня!",
       "ru": "До свидания, хорошего дня!",
       "en": "Goodbye, have a nice day!"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Do widzenia, nawzajem!",
        "tr": {
         "uk": "До побачення, навзаєм!",
         "ru": "До свидания, и вам!",
         "en": "Goodbye, you too!"
        }
       },
       {
        "id": "s1o1",
        "text": "Na razie, nawzajem!",
        "tr": {
         "uk": "Бувай, навзаєм!",
         "ru": "Пока, и вам!",
         "en": "See you, you too!"
        }
       },
       {
        "id": "s1o2",
        "text": "Do widzenia, nie ma za co!",
        "tr": {
         "uk": "(**Nie ma za co** — відповідь на «dziękuję»; на «miłego dnia» — **nawzajem**)",
         "ru": "(**Nie ma za co** — ответ на «dziękuję»; на «miłego dnia» — **nawzajem**)",
         "en": "(**Nie ma za co** answers “thank you”; to “miłego dnia” reply **nawzajem**)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "**Na razie** — неформальне «бувай», зі старшим сусідом так не прощаються. Формально: **Do widzenia**, а на побажання — **nawzajem**.",
       "ru": "**Na razie** — неформальное «пока», со старшим соседом так не прощаются. Формально: **Do widzenia**, а на пожелание — **nawzajem**.",
       "en": "**Na razie** is an informal \"see you\" — not for an older neighbour. Say **Do widzenia** and reply to the wish with **nawzajem**."
      }
     }
    ]
   },
   "explanation": null
  }
 },
 {
  "lesson": "waw-2-uprzejmosc",
  "n": 3,
  "from": {
   "type": "LISTENING",
   "skill": "listening.politeness",
   "data": {
    "audioText": "Nie ma za co",
    "options": [
     {
      "id": "o0",
      "text": "Nie ma za co"
     },
     {
      "id": "o1",
      "text": "Nie, dziękuję"
     },
     {
      "id": "o2",
      "text": "Przepraszam"
     }
    ],
    "answer": "o0"
   },
   "explanation": null
  },
  "to": {
   "type": "LISTENING",
   "skill": "listening.politeness",
   "data": {
    "audioText": "Nie ma za co",
    "options": [
     {
      "id": "o0",
      "text": "Nie ma za co"
     },
     {
      "id": "o1",
      "text": "Nie, dziękuję"
     },
     {
      "id": "o2",
      "text": "Nie ma mowy"
     }
    ],
    "answer": "o0"
   },
   "explanation": null
  }
 },
 {
  "lesson": "waw-2-uprzejmosc",
  "n": 8,
  "from": {
   "type": "SITUATION",
   "skill": "situation.politeness",
   "data": {
    "npc": {
     "name": "Pan Marek",
     "emoji": "👴🏻",
     "role": {
      "uk": "перехожий на вулиці",
      "ru": "прохожий",
      "en": "a passer-by"
     }
    },
    "scene": {
     "uk": "На вулиці ти випадково наштовхуєшся на пана Марека.",
     "ru": "На улице ты случайно наталкиваешься на пана Марека.",
     "en": "You accidentally bump into Mr Marek on the street."
    },
    "steps": [
     {
      "npc": "Ojej!",
      "npcTr": {
       "uk": "Ой!",
       "ru": "Ой!",
       "en": "Ouch!"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Przepraszam!",
        "tr": {
         "uk": "Вибачте!",
         "ru": "Извините!",
         "en": "Sorry!"
        }
       },
       {
        "id": "s0o1",
        "text": "Dziękuję!",
        "tr": {
         "uk": "Дякую!",
         "ru": "Спасибо!",
         "en": "Thank you!"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "**Dziękuję** — подяка. Якщо випадково когось зачепиш, вибачаються: **Przepraszam!**",
       "ru": "**Dziękuję** — благодарность. Если случайно кого-то заденешь, извиняются: **Przepraszam!**",
       "en": "**Dziękuję** is \"thank you\". When you bump into someone, apologise: **Przepraszam!**"
      }
     },
     {
      "npc": "Nic nie szkodzi.",
      "npcTr": {
       "uk": "Нічого страшного.",
       "ru": "Ничего страшного.",
       "en": "No problem."
      }
     }
    ]
   },
   "explanation": null
  },
  "to": {
   "type": "SITUATION",
   "skill": "situation.politeness",
   "data": {
    "npc": {
     "name": "Pan Marek",
     "emoji": "👴🏻",
     "role": {
      "uk": "перехожий на вулиці",
      "ru": "прохожий",
      "en": "a passer-by"
     }
    },
    "scene": {
     "uk": "На вулиці ти випадково наштовхуєшся на пана Марека.",
     "ru": "На улице ты случайно наталкиваешься на пана Марека.",
     "en": "You accidentally bump into Mr Marek on the street."
    },
    "steps": [
     {
      "npc": "Ojej!",
      "npcTr": {
       "uk": "Ой!",
       "ru": "Ой!",
       "en": "Ouch!"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Przepraszam!",
        "tr": {
         "uk": "Вибачте!",
         "ru": "Извините!",
         "en": "Sorry!"
        }
       },
       {
        "id": "s0o1",
        "text": "Dziękuję!",
        "tr": {
         "uk": "Дякую!",
         "ru": "Спасибо!",
         "en": "Thank you!"
        }
       },
       {
        "id": "s0o2",
        "text": "Proszę!",
        "tr": {
         "uk": "(**Przepraszam!** — вибачення; **Proszę** — «будь ласка», коли щось подають)",
         "ru": "(**Przepraszam!** — извинение; **Proszę** — «пожалуйста», когда что-то подают)",
         "en": "(**Przepraszam!** is an apology; **Proszę** means “here you are”)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "**Dziękuję** — подяка. Якщо випадково когось зачепиш, вибачаються: **Przepraszam!**",
       "ru": "**Dziękuję** — благодарность. Если случайно кого-то заденешь, извиняются: **Przepraszam!**",
       "en": "**Dziękuję** is \"thank you\". When you bump into someone, apologise: **Przepraszam!**"
      }
     },
     {
      "npc": "Nic nie szkodzi.",
      "npcTr": {
       "uk": "Нічого страшного.",
       "ru": "Ничего страшного.",
       "en": "No problem."
      }
     }
    ]
   },
   "explanation": null
  }
 },
 {
  "lesson": "waw-3-imie",
  "n": 4,
  "from": {
   "type": "LISTENING",
   "skill": "listening.intro",
   "data": {
    "audioText": "Jak się masz?",
    "options": [
     {
      "id": "o0",
      "text": "Jak się masz?"
     },
     {
      "id": "o1",
      "text": "Jak masz na imię?"
     },
     {
      "id": "o2",
      "text": "Mam na imię Ola."
     }
    ],
    "answer": "o0"
   },
   "explanation": null
  },
  "to": {
   "type": "LISTENING",
   "skill": "listening.intro",
   "data": {
    "audioText": "Jak się masz?",
    "options": [
     {
      "id": "o0",
      "text": "Jak się masz?"
     },
     {
      "id": "o1",
      "text": "Jak masz na imię?"
     },
     {
      "id": "o2",
      "text": "Jak się nazywasz?"
     }
    ],
    "answer": "o0"
   },
   "explanation": null
  }
 },
 {
  "lesson": "waw-3-imie",
  "n": 7,
  "from": {
   "type": "DIALOGUE",
   "skill": "dialogue.intro",
   "data": {
    "npc": {
     "name": "Ania",
     "emoji": "👩🏼",
     "role": {
      "uk": "студентка з Варшави",
      "ru": "студентка из Варшавы",
      "en": "a student from Warsaw"
     }
    },
    "steps": [
     {
      "npc": "Cześć! Jestem Ania. Jak masz na imię?",
      "npcTr": {
       "uk": "Привіт! Я Аня. Як тебе звати?",
       "ru": "Привет! Я Аня. Как тебя зовут?",
       "en": "Hi! I'm Ania. What's your name?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Mam na imię Bobek.",
        "tr": {
         "uk": "Мене звати Бобек.",
         "ru": "Меня зовут Бобек.",
         "en": "My name is Bobek."
        }
       },
       {
        "id": "s0o1",
        "text": "Nazywa się Bobek.",
        "tr": {
         "uk": "Його звуть Бобек.",
         "ru": "Его зовут Бобек.",
         "en": "His name is Bobek."
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "**Nazywa się** — «його звуть» (про іншого). Про себе: **Mam na imię…** або **Nazywam się…**",
       "ru": "**Nazywa się** — «его зовут» (о другом). О себе: **Mam na imię…** или **Nazywam się…**",
       "en": "**Nazywa się** means \"he is called\". About yourself: **Mam na imię…** or **Nazywam się…**"
      }
     },
     {
      "npc": "Miło mi! Jak się masz?",
      "npcTr": {
       "uk": "Приємно! Як справи?",
       "ru": "Приятно! Как дела?",
       "en": "Nice to meet you! How are you?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Dobrze, dziękuję. Miło mi!",
        "tr": {
         "uk": "Добре, дякую. Приємно!",
         "ru": "Хорошо, спасибо. Приятно!",
         "en": "Fine, thanks. Nice to meet you!"
        }
       },
       {
        "id": "s1o1",
        "text": "Dobry, dziękuję. Miło mi!",
        "tr": {
         "uk": "Добрий, дякую. Приємно! (з помилкою)",
         "ru": "Добрый, спасибо. Приятно! (с ошибкой)",
         "en": "Good (adjective), thanks. Nice to meet you! (a mistake)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "На «Jak się masz?» відповідають прислівником: **Dobrze, dziękuję.** «Dobry» — прикметник (dobry dzień).",
       "ru": "На «Jak się masz?» отвечают наречием: **Dobrze, dziękuję.** «Dobry» — прилагательное (dobry dzień).",
       "en": "Answer \"Jak się masz?\" with the adverb: **Dobrze, dziękuję.** \"Dobry\" is an adjective (dobry dzień)."
      }
     }
    ]
   },
   "explanation": null
  },
  "to": {
   "type": "DIALOGUE",
   "skill": "dialogue.intro",
   "data": {
    "npc": {
     "name": "Ania",
     "emoji": "👩🏼",
     "role": {
      "uk": "студентка з Варшави",
      "ru": "студентка из Варшавы",
      "en": "a student from Warsaw"
     }
    },
    "steps": [
     {
      "npc": "Cześć! Jestem Ania. Jak masz na imię?",
      "npcTr": {
       "uk": "Привіт! Я Аня. Як тебе звати?",
       "ru": "Привет! Я Аня. Как тебя зовут?",
       "en": "Hi! I'm Ania. What's your name?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Mam na imię Bobek.",
        "tr": {
         "uk": "Мене звати Бобек.",
         "ru": "Меня зовут Бобек.",
         "en": "My name is Bobek."
        }
       },
       {
        "id": "s0o1",
        "text": "Nazywa się Bobek.",
        "tr": {
         "uk": "Його звуть Бобек.",
         "ru": "Его зовут Бобек.",
         "en": "His name is Bobek."
        }
       },
       {
        "id": "s0o2",
        "text": "Jestem na imię Bobek.",
        "tr": {
         "uk": "(**mam na imię** — стала фраза «мене звати»)",
         "ru": "(**mam na imię** — устойчивая фраза «меня зовут»)",
         "en": "(**mam na imię** is the fixed phrase for “my name is”)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "**Nazywa się** — «його звуть» (про іншого). Про себе: **Mam na imię…** або **Nazywam się…**",
       "ru": "**Nazywa się** — «его зовут» (о другом). О себе: **Mam na imię…** или **Nazywam się…**",
       "en": "**Nazywa się** means \"he is called\". About yourself: **Mam na imię…** or **Nazywam się…**"
      }
     },
     {
      "npc": "Miło mi! Jak się masz?",
      "npcTr": {
       "uk": "Приємно! Як справи?",
       "ru": "Приятно! Как дела?",
       "en": "Nice to meet you! How are you?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Dobrze, dziękuję. Miło mi!",
        "tr": {
         "uk": "Добре, дякую. Приємно!",
         "ru": "Хорошо, спасибо. Приятно!",
         "en": "Fine, thanks. Nice to meet you!"
        }
       },
       {
        "id": "s1o1",
        "text": "Dobry, dziękuję. Miło mi!",
        "tr": {
         "uk": "Добрий, дякую. Приємно! (з помилкою)",
         "ru": "Добрый, спасибо. Приятно! (с ошибкой)",
         "en": "Good (adjective), thanks. Nice to meet you! (a mistake)"
        }
       },
       {
        "id": "s1o2",
        "text": "Dobrze, proszę. Miło mi!",
        "tr": {
         "uk": "(на «jak się masz?» дякують: **dziękuję**; **proszę** — «будь ласка»)",
         "ru": "(на «jak się masz?» благодарят: **dziękuję**; **proszę** — «пожалуйста»)",
         "en": "(to “jak się masz?” you say **dziękuję**; **proszę** means “please / here you are”)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "На «Jak się masz?» відповідають прислівником: **Dobrze, dziękuję.** «Dobry» — прикметник (dobry dzień).",
       "ru": "На «Jak się masz?» отвечают наречием: **Dobrze, dziękuję.** «Dobry» — прилагательное (dobry dzień).",
       "en": "Answer \"Jak się masz?\" with the adverb: **Dobrze, dziękuję.** \"Dobry\" is an adjective (dobry dzień)."
      }
     }
    ]
   },
   "explanation": null
  }
 },
 {
  "lesson": "waw-4-skad",
  "n": 4,
  "from": {
   "type": "LISTENING",
   "skill": "listening.origin",
   "data": {
    "audioText": "Nie rozumiem",
    "options": [
     {
      "id": "o0",
      "text": "Nie rozumiem"
     },
     {
      "id": "o1",
      "text": "Nie ma za co"
     },
     {
      "id": "o2",
      "text": "Nie mieszkam"
     }
    ],
    "answer": "o0"
   },
   "explanation": null
  },
  "to": {
   "type": "LISTENING",
   "skill": "listening.origin",
   "data": {
    "audioText": "Nie rozumiem",
    "options": [
     {
      "id": "o0",
      "text": "Nie rozumiem"
     },
     {
      "id": "o1",
      "text": "Nie rozumiesz"
     },
     {
      "id": "o2",
      "text": "Nie mieszkam"
     }
    ],
    "answer": "o0"
   },
   "explanation": null
  }
 },
 {
  "lesson": "waw-4-skad",
  "n": 14,
  "from": {
   "type": "DIALOGUE",
   "skill": "dialogue.origin",
   "data": {
    "npc": {
     "name": "Ania",
     "emoji": "👩🏼",
     "role": {
      "uk": "студентка з Варшави",
      "ru": "студентка из Варшавы",
      "en": "a student from Warsaw"
     }
    },
    "steps": [
     {
      "npc": "Mówisz po polsku?",
      "npcTr": {
       "uk": "Ти говориш польською?",
       "ru": "Ты говоришь по-польски?",
       "en": "Do you speak Polish?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Trochę. Ale dobrze mówię po angielsku.",
        "tr": {
         "uk": "Трохи. Але добре говорю англійською.",
         "ru": "Немного. Но хорошо говорю по-английски.",
         "en": "A little. But I speak English well."
        }
       },
       {
        "id": "s0o1",
        "text": "Trochę mówię po polski.",
        "tr": {
         "uk": "Трохи говорю польською (з помилкою).",
         "ru": "Немного говорю по-польски (с ошибкой).",
         "en": "I speak a little Polish (with a mistake)."
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "Мова — **po** + **-sku**: **po polsku**, а не «po polski». **Polski** — це «польський» або «Польща» в родовому (z Polski).",
       "ru": "Язык — **po** + **-sku**: **po polsku**, а не «po polski». **Polski** — это «польский» или «Польша» в родительном (z Polski).",
       "en": "Languages: **po** + **-sku** — **po polsku**, not \"po polski\". **Polski** means \"Polish\" (adjective) or \"of Poland\" (z Polski)."
      }
     },
     {
      "npc": "Super! A skąd jesteś?",
      "npcTr": {
       "uk": "Супер! А звідки ти?",
       "ru": "Супер! А откуда ты?",
       "en": "Great! Where are you from?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Jestem z Ukrainy, ze Lwowa.",
        "tr": {
         "uk": "Я з України, зі Львова.",
         "ru": "Я из Украины, из Львова.",
         "en": "I'm from Ukraine, from Lviv."
        }
       },
       {
        "id": "s1o1",
        "text": "Jestem w Warszawie.",
        "tr": {
         "uk": "Я у Варшаві.",
         "ru": "Я в Варшаве.",
         "en": "I'm in Warsaw."
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "**Skąd?** → **z** + родовий: **ze Lwowa**.",
       "ru": "**Skąd?** → **z** + родительный: **ze Lwowa**.",
       "en": "**Skąd?** → **z** + genitive: **ze Lwowa**."
      }
     },
     {
      "npc": "Lwów jest piękny! Witaj w Warszawie!",
      "npcTr": {
       "uk": "Львів гарний! Ласкаво просимо до Варшави!",
       "ru": "Львов красивый! Добро пожаловать в Варшаву!",
       "en": "Lviv is beautiful! Welcome to Warsaw!"
      }
     }
    ]
   },
   "explanation": null
  },
  "to": {
   "type": "DIALOGUE",
   "skill": "dialogue.origin",
   "data": {
    "npc": {
     "name": "Ania",
     "emoji": "👩🏼",
     "role": {
      "uk": "студентка з Варшави",
      "ru": "студентка из Варшавы",
      "en": "a student from Warsaw"
     }
    },
    "steps": [
     {
      "npc": "Mówisz po polsku?",
      "npcTr": {
       "uk": "Ти говориш польською?",
       "ru": "Ты говоришь по-польски?",
       "en": "Do you speak Polish?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Trochę. Ale dobrze mówię po angielsku.",
        "tr": {
         "uk": "Трохи. Але добре говорю англійською.",
         "ru": "Немного. Но хорошо говорю по-английски.",
         "en": "A little. But I speak English well."
        }
       },
       {
        "id": "s0o1",
        "text": "Trochę mówię po polski.",
        "tr": {
         "uk": "Трохи говорю польською (з помилкою).",
         "ru": "Немного говорю по-польски (с ошибкой).",
         "en": "I speak a little Polish (with a mistake)."
        }
       },
       {
        "id": "s0o2",
        "text": "Trochę. Ale dobrze mówię w angielsku.",
        "tr": {
         "uk": "(мова — **po** angielsku)",
         "ru": "(язык — **po** angielsku)",
         "en": "(a language takes **po**: **po angielsku**)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "Мова — **po** + **-sku**: **po polsku**, а не «po polski». **Polski** — це «польський» або «Польща» в родовому (z Polski).",
       "ru": "Язык — **po** + **-sku**: **po polsku**, а не «po polski». **Polski** — это «польский» или «Польша» в родительном (z Polski).",
       "en": "Languages: **po** + **-sku** — **po polsku**, not \"po polski\". **Polski** means \"Polish\" (adjective) or \"of Poland\" (z Polski)."
      }
     },
     {
      "npc": "Super! A skąd jesteś?",
      "npcTr": {
       "uk": "Супер! А звідки ти?",
       "ru": "Супер! А откуда ты?",
       "en": "Great! Where are you from?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Jestem z Ukrainy, ze Lwowa.",
        "tr": {
         "uk": "Я з України, зі Львова.",
         "ru": "Я из Украины, из Львова.",
         "en": "I'm from Ukraine, from Lviv."
        }
       },
       {
        "id": "s1o1",
        "text": "Jestem w Warszawie.",
        "tr": {
         "uk": "Я у Варшаві.",
         "ru": "Я в Варшаве.",
         "en": "I'm in Warsaw."
        }
       },
       {
        "id": "s1o2",
        "text": "Jestem z Ukrainie, ze Lwowa.",
        "tr": {
         "uk": "(**z** («звідки») + родовий: z **Ukrainy**)",
         "ru": "(**z** («откуда») + родительный: z **Ukrainy**)",
         "en": "(**z** (“from”) takes the genitive: z **Ukrainy**)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "**Skąd?** → **z** + родовий: **ze Lwowa**.",
       "ru": "**Skąd?** → **z** + родительный: **ze Lwowa**.",
       "en": "**Skąd?** → **z** + genitive: **ze Lwowa**."
      }
     },
     {
      "npc": "Lwów jest piękny! Witaj w Warszawie!",
      "npcTr": {
       "uk": "Львів гарний! Ласкаво просимо до Варшави!",
       "ru": "Львов красивый! Добро пожаловать в Варшаву!",
       "en": "Lviv is beautiful! Welcome to Warsaw!"
      }
     }
    ]
   },
   "explanation": null
  }
 },
 {
  "lesson": "waw-c1-centralna",
  "n": 11,
  "from": {
   "type": "SITUATION",
   "skill": "situation.centralna",
   "data": {
    "npc": {
     "name": "Pan Tomasz",
     "emoji": "👨🏻‍💼",
     "role": {
      "uk": "працівник довідки",
      "ru": "сотрудник справочной",
      "en": "information desk clerk"
     }
    },
    "scene": {
     "uk": "Потяг щойно прибув на підземну платформу. Тобі треба до метро.",
     "ru": "Поезд только что прибыл на подземную платформу. Тебе нужно к метро.",
     "en": "The train has just pulled into an underground platform. You need the metro."
    },
    "steps": [
     {
      "npc": "Dzień dobry, w czym mogę pomóc?",
      "npcTr": {
       "uk": "Добрий день, чим можу допомогти?",
       "ru": "Добрый день, чем могу помочь?",
       "en": "Hello, how can I help?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Dzień dobry, którędy do metra?",
        "tr": {
         "uk": "Добрий день, як пройти до метро?",
         "ru": "Добрый день, как пройти к метро?",
         "en": "Hello, which way to the metro?"
        }
       },
       {
        "id": "s0o1",
        "text": "Dzień dobry, kiedy do metra?",
        "tr": {
         "uk": "Добрий день, коли до метро? (з помилкою)",
         "ru": "Добрый день, когда к метро? (с ошибкой)",
         "en": "Hello, when to the metro? (a mistake)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "**Kiedy** — коли, а дорогу питають **którędy** — якою дорогою: **Którędy do metra?**",
       "ru": "**Kiedy** — когда, а дорогу спрашивают **którędy** — какой дорогой: **Którędy do metra?**",
       "en": "**Kiedy** means \"when\"; to ask the way use **którędy**: **Którędy do metra?**"
      }
     },
     {
      "npc": "Proszę iść przejściem podziemnym w prawo, a potem schodami ruchomymi na dół.",
      "npcTr": {
       "uk": "Ідіть підземним переходом праворуч, а потім ескалатором униз.",
       "ru": "Идите подземным переходом направо, а потом на эскалаторе вниз.",
       "en": "Go through the underpass to the right, then take the escalator down."
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Czy to daleko?",
        "tr": {
         "uk": "Це далеко?",
         "ru": "Это далеко?",
         "en": "Is it far?"
        }
       },
       {
        "id": "s1o1",
        "text": "Czy to daleka?",
        "tr": {
         "uk": "Це далека? (з помилкою)",
         "ru": "Это далёкая? (с ошибкой)",
         "en": "Is it far (wrong form)?"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "Про відстань питають прислівником: **Czy to daleko?** «Daleka» — прикметник жіночого роду (daleka droga).",
       "ru": "О расстоянии спрашивают наречием: **Czy to daleko?** «Daleka» — прилагательное женского рода (daleka droga).",
       "en": "Ask with the adverb: **Czy to daleko?** \"Daleka\" is a feminine adjective (daleka droga)."
      }
     },
     {
      "npc": "Nie, to trzy minuty pieszo.",
      "npcTr": {
       "uk": "Ні, це три хвилини пішки.",
       "ru": "Нет, это три минуты пешком.",
       "en": "No, it's three minutes on foot."
      },
      "options": [
       {
        "id": "s2o0",
        "text": "Dziękuję bardzo!",
        "tr": {
         "uk": "Дуже дякую!",
         "ru": "Большое спасибо!",
         "en": "Thank you very much!"
        }
       },
       {
        "id": "s2o1",
        "text": "Proszę bardzo!",
        "tr": {
         "uk": "Прошу! (не подяка)",
         "ru": "Пожалуйста! (не благодарность)",
         "en": "You're welcome! (not thanks)"
        }
       }
      ],
      "answer": "s2o0",
      "feedback": {
       "uk": "**Proszę bardzo** кажуть у відповідь на подяку. Тобі допомогли — подякуй: **Dziękuję bardzo!**",
       "ru": "**Proszę bardzo** говорят в ответ на благодарность. Тебе помогли — поблагодари: **Dziękuję bardzo!**",
       "en": "**Proszę bardzo** answers a thank-you. You were helped — say **Dziękuję bardzo!**"
      }
     },
     {
      "npc": "Proszę bardzo!",
      "npcTr": {
       "uk": "Прошу!",
       "ru": "Пожалуйста!",
       "en": "You're welcome!"
      }
     }
    ]
   },
   "explanation": null
  },
  "to": {
   "type": "SITUATION",
   "skill": "situation.centralna",
   "data": {
    "npc": {
     "name": "Pan Tomasz",
     "emoji": "👨🏻‍💼",
     "role": {
      "uk": "працівник довідки",
      "ru": "сотрудник справочной",
      "en": "information desk clerk"
     }
    },
    "scene": {
     "uk": "Потяг щойно прибув на підземну платформу. Тобі треба до метро.",
     "ru": "Поезд только что прибыл на подземную платформу. Тебе нужно к метро.",
     "en": "The train has just pulled into an underground platform. You need the metro."
    },
    "steps": [
     {
      "npc": "Dzień dobry, w czym mogę pomóc?",
      "npcTr": {
       "uk": "Добрий день, чим можу допомогти?",
       "ru": "Добрый день, чем могу помочь?",
       "en": "Hello, how can I help?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Dzień dobry, którędy do metra?",
        "tr": {
         "uk": "Добрий день, як пройти до метро?",
         "ru": "Добрый день, как пройти к метро?",
         "en": "Hello, which way to the metro?"
        }
       },
       {
        "id": "s0o1",
        "text": "Dzień dobry, kiedy do metra?",
        "tr": {
         "uk": "Добрий день, коли до метро? (з помилкою)",
         "ru": "Добрый день, когда к метро? (с ошибкой)",
         "en": "Hello, when to the metro? (a mistake)"
        }
       },
       {
        "id": "s0o2",
        "text": "Dzień dobry, którędy z metra?",
        "tr": {
         "uk": "(**do metra** — «до метро»; **z metra** — «з метро»)",
         "ru": "(**do metra** — «до метро»; **z metra** — «из метро»)",
         "en": "(**do metra** means “to the metro”; **z metra** means “out of the metro”)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "**Kiedy** — коли, а дорогу питають **którędy** — якою дорогою: **Którędy do metra?**",
       "ru": "**Kiedy** — когда, а дорогу спрашивают **którędy** — какой дорогой: **Którędy do metra?**",
       "en": "**Kiedy** means \"when\"; to ask the way use **którędy**: **Którędy do metra?**"
      }
     },
     {
      "npc": "Proszę iść przejściem podziemnym w prawo, a potem schodami ruchomymi na dół.",
      "npcTr": {
       "uk": "Ідіть підземним переходом праворуч, а потім ескалатором униз.",
       "ru": "Идите подземным переходом направо, а потом на эскалаторе вниз.",
       "en": "Go through the underpass to the right, then take the escalator down."
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Czy to daleko?",
        "tr": {
         "uk": "Це далеко?",
         "ru": "Это далеко?",
         "en": "Is it far?"
        }
       },
       {
        "id": "s1o1",
        "text": "Czy to daleka?",
        "tr": {
         "uk": "Це далека? (з помилкою)",
         "ru": "Это далёкая? (с ошибкой)",
         "en": "Is it far (wrong form)?"
        }
       },
       {
        "id": "s1o2",
        "text": "Czy to drogo?",
        "tr": {
         "uk": "(питаємо про відстань: **daleko**; **drogo** — «дорого»)",
         "ru": "(спрашиваем о расстоянии: **daleko**; **drogo** — «дорого»)",
         "en": "(we are asking about distance: **daleko**; **drogo** means “expensive”)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "Про відстань питають прислівником: **Czy to daleko?** «Daleka» — прикметник жіночого роду (daleka droga).",
       "ru": "О расстоянии спрашивают наречием: **Czy to daleko?** «Daleka» — прилагательное женского рода (daleka droga).",
       "en": "Ask with the adverb: **Czy to daleko?** \"Daleka\" is a feminine adjective (daleka droga)."
      }
     },
     {
      "npc": "Nie, to trzy minuty pieszo.",
      "npcTr": {
       "uk": "Ні, це три хвилини пішки.",
       "ru": "Нет, это три минуты пешком.",
       "en": "No, it's three minutes on foot."
      },
      "options": [
       {
        "id": "s2o0",
        "text": "Dziękuję bardzo!",
        "tr": {
         "uk": "Дуже дякую!",
         "ru": "Большое спасибо!",
         "en": "Thank you very much!"
        }
       },
       {
        "id": "s2o1",
        "text": "Proszę bardzo!",
        "tr": {
         "uk": "Прошу! (не подяка)",
         "ru": "Пожалуйста! (не благодарность)",
         "en": "You're welcome! (not thanks)"
        }
       },
       {
        "id": "s2o2",
        "text": "Przepraszam bardzo!",
        "tr": {
         "uk": "(**Przepraszam** — вибач; за допомогу дякують: **Dziękuję bardzo!**)",
         "ru": "(**Przepraszam** — извини; за помощь благодарят: **Dziękuję bardzo!**)",
         "en": "(**Przepraszam** is an apology; for help say **Dziękuję bardzo!**)"
        }
       }
      ],
      "answer": "s2o0",
      "feedback": {
       "uk": "**Proszę bardzo** кажуть у відповідь на подяку. Тобі допомогли — подякуй: **Dziękuję bardzo!**",
       "ru": "**Proszę bardzo** говорят в ответ на благодарность. Тебе помогли — поблагодари: **Dziękuję bardzo!**",
       "en": "**Proszę bardzo** answers a thank-you. You were helped — say **Dziękuję bardzo!**"
      }
     },
     {
      "npc": "Proszę bardzo!",
      "npcTr": {
       "uk": "Прошу!",
       "ru": "Пожалуйста!",
       "en": "You're welcome!"
      }
     }
    ]
   },
   "explanation": null
  }
 },
 {
  "lesson": "waw-c2-bilety",
  "n": 10,
  "from": {
   "type": "SITUATION",
   "skill": "situation.tickets",
   "data": {
    "npc": {
     "name": "Ania",
     "emoji": "👩🏼",
     "role": {
      "uk": "студентка з Варшави",
      "ru": "студентка из Варшавы",
      "en": "a student from Warsaw"
     }
    },
    "scene": {
     "uk": "Ви з Анею біля входу в метро Centrum.",
     "ru": "Вы с Аней у входа в метро Centrum.",
     "en": "You and Ania are at the entrance to Centrum metro."
    },
    "steps": [
     {
      "npc": "Jedziemy metrem na Stare Miasto. Masz bilet?",
      "npcTr": {
       "uk": "Їдемо метро на Старе Місто. Маєш квиток?",
       "ru": "Едем на метро в Старый город. У тебя есть билет?",
       "en": "We're taking the metro to the Old Town. Got a ticket?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Nie mam. Jaki bilet kupić?",
        "tr": {
         "uk": "Не маю. Який квиток купити?",
         "ru": "Нет. Какой билет купить?",
         "en": "No. Which ticket should I buy?"
        }
       },
       {
        "id": "s0o1",
        "text": "Tak, mam rezerwację.",
        "tr": {
         "uk": "Так, маю бронювання.",
         "ru": "Да, у меня бронь.",
         "en": "Yes, I have a booking."
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "Квитка немає — спитай, який купити: **Jaki bilet kupić?**",
       "ru": "Билета нет — спроси, какой купить: **Jaki bilet kupić?**",
       "en": "No ticket — ask which to buy: **Jaki bilet kupić?**"
      }
     },
     {
      "npc": "Weź bilet na 75 minut, będzie przesiadka.",
      "npcTr": {
       "uk": "Бери квиток на 75 хвилин, буде пересадка.",
       "ru": "Бери билет на 75 минут, будет пересадка.",
       "en": "Get a 75-minute ticket, there'll be a transfer."
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Dobrze. Normalny czy ulgowy?",
        "tr": {
         "uk": "Добре. Звичайний чи пільговий?",
         "ru": "Хорошо. Обычный или льготный?",
         "en": "OK. Full fare or reduced?"
        }
       },
       {
        "id": "s1o1",
        "text": "Dobrze, wezmę bilet na 20 minut.",
        "tr": {
         "uk": "Добре, візьму квиток на 20 хвилин.",
         "ru": "Хорошо, возьму билет на 20 минут.",
         "en": "OK, I'll take a 20-minute ticket."
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "З пересадкою 20 хвилин може не вистачити — Аня радить квиток **na 75 minut**. Уточни тип: **normalny czy ulgowy?**",
       "ru": "С пересадкой 20 минут может не хватить — Аня советует билет **na 75 minut**. Уточни тип: **normalny czy ulgowy?**",
       "en": "With a transfer 20 minutes may not be enough — Ania suggests **na 75 minut**. Ask: **normalny czy ulgowy?**"
      }
     },
     {
      "npc": "Normalny. Ulgowy jest tylko z legitymacją.",
      "npcTr": {
       "uk": "Звичайний. Пільговий — лише з посвідченням.",
       "ru": "Обычный. Льготный — только с удостоверением.",
       "en": "Full fare. Reduced is only with an ID."
      },
      "options": [
       {
        "id": "s2o0",
        "text": "Jasne, kupię normalny w biletomacie.",
        "tr": {
         "uk": "Зрозуміло, куплю звичайний в автоматі.",
         "ru": "Понятно, куплю обычный в автомате.",
         "en": "Sure, I'll buy a full fare at the machine."
        }
       },
       {
        "id": "s2o1",
        "text": "Jasne, mam dwadzieścia lat.",
        "tr": {
         "uk": "Зрозуміло, мені двадцять.",
         "ru": "Понятно, мне двадцать.",
         "en": "Sure, I'm twenty."
        }
       }
      ],
      "answer": "s2o0",
      "feedback": {
       "uk": "Скажи, що купиш: **kupię normalny**.",
       "ru": "Скажи, что купишь: **kupię normalny**.",
       "en": "Say what you'll buy: **kupię normalny**."
      }
     },
     {
      "npc": "Super, to idziemy!",
      "npcTr": {
       "uk": "Супер, тоді ходімо!",
       "ru": "Супер, тогда пошли!",
       "en": "Great, let's go!"
      }
     }
    ]
   },
   "explanation": null
  },
  "to": {
   "type": "SITUATION",
   "skill": "situation.tickets",
   "data": {
    "npc": {
     "name": "Ania",
     "emoji": "👩🏼",
     "role": {
      "uk": "студентка з Варшави",
      "ru": "студентка из Варшавы",
      "en": "a student from Warsaw"
     }
    },
    "scene": {
     "uk": "Ви з Анею біля входу в метро Centrum.",
     "ru": "Вы с Аней у входа в метро Centrum.",
     "en": "You and Ania are at the entrance to Centrum metro."
    },
    "steps": [
     {
      "npc": "Jedziemy metrem na Stare Miasto. Masz bilet?",
      "npcTr": {
       "uk": "Їдемо метро на Старе Місто. Маєш квиток?",
       "ru": "Едем на метро в Старый город. У тебя есть билет?",
       "en": "We're taking the metro to the Old Town. Got a ticket?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Nie mam. Jaki bilet kupić?",
        "tr": {
         "uk": "Не маю. Який квиток купити?",
         "ru": "Нет. Какой билет купить?",
         "en": "No. Which ticket should I buy?"
        }
       },
       {
        "id": "s0o1",
        "text": "Tak, mam rezerwację.",
        "tr": {
         "uk": "Так, маю бронювання.",
         "ru": "Да, у меня бронь.",
         "en": "Yes, I have a booking."
        }
       },
       {
        "id": "s0o2",
        "text": "Nie mam. Jaki bilet mam?",
        "tr": {
         "uk": "(**Nie mam** — «немає»; тому питаєш, який **kupić** (купити), а не «який маю»)",
         "ru": "(**Nie mam** — «нет»; поэтому спрашиваешь, какой **kupić** (купить), а не «какой имею»)",
         "en": "(**Nie mam** says you have none, so ask which to **kupić** (buy), not which you “have”)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "Квитка немає — спитай, який купити: **Jaki bilet kupić?**",
       "ru": "Билета нет — спроси, какой купить: **Jaki bilet kupić?**",
       "en": "No ticket — ask which to buy: **Jaki bilet kupić?**"
      }
     },
     {
      "npc": "Weź bilet na 75 minut, będzie przesiadka.",
      "npcTr": {
       "uk": "Бери квиток на 75 хвилин, буде пересадка.",
       "ru": "Бери билет на 75 минут, будет пересадка.",
       "en": "Get a 75-minute ticket, there'll be a transfer."
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Dobrze. Normalny czy ulgowy?",
        "tr": {
         "uk": "Добре. Звичайний чи пільговий?",
         "ru": "Хорошо. Обычный или льготный?",
         "en": "OK. Full fare or reduced?"
        }
       },
       {
        "id": "s1o1",
        "text": "Dobrze, wezmę bilet na 20 minut.",
        "tr": {
         "uk": "Добре, візьму квиток на 20 хвилин.",
         "ru": "Хорошо, возьму билет на 20 минут.",
         "en": "OK, I'll take a 20-minute ticket."
        }
       },
       {
        "id": "s1o2",
        "text": "Dobrze. Normalnego czy ulgowego?",
        "tr": {
         "uk": "(**bilet** — неживий: **normalny czy ulgowy**)",
         "ru": "(**bilet** — неодушевлённый: **normalny czy ulgowy**)",
         "en": "(**bilet** is inanimate: **normalny czy ulgowy**)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "З пересадкою 20 хвилин може не вистачити — Аня радить квиток **na 75 minut**. Уточни тип: **normalny czy ulgowy?**",
       "ru": "С пересадкой 20 минут может не хватить — Аня советует билет **na 75 minut**. Уточни тип: **normalny czy ulgowy?**",
       "en": "With a transfer 20 minutes may not be enough — Ania suggests **na 75 minut**. Ask: **normalny czy ulgowy?**"
      }
     },
     {
      "npc": "Normalny. Ulgowy jest tylko z legitymacją.",
      "npcTr": {
       "uk": "Звичайний. Пільговий — лише з посвідченням.",
       "ru": "Обычный. Льготный — только с удостоверением.",
       "en": "Full fare. Reduced is only with an ID."
      },
      "options": [
       {
        "id": "s2o0",
        "text": "Jasne, kupię normalny w biletomacie.",
        "tr": {
         "uk": "Зрозуміло, куплю звичайний в автоматі.",
         "ru": "Понятно, куплю обычный в автомате.",
         "en": "Sure, I'll buy a full fare at the machine."
        }
       },
       {
        "id": "s2o1",
        "text": "Jasne, mam dwadzieścia lat.",
        "tr": {
         "uk": "Зрозуміло, мені двадцять.",
         "ru": "Понятно, мне двадцать.",
         "en": "Sure, I'm twenty."
        }
       },
       {
        "id": "s2o2",
        "text": "Jasne, kupię normalny w biletomat.",
        "tr": {
         "uk": "(**w** + місцевий: w **biletomacie**)",
         "ru": "(**w** + предложный: w **biletomacie**)",
         "en": "(**w** + locative: w **biletomacie**)"
        }
       }
      ],
      "answer": "s2o0",
      "feedback": {
       "uk": "Скажи, що купиш: **kupię normalny**.",
       "ru": "Скажи, что купишь: **kupię normalny**.",
       "en": "Say what you'll buy: **kupię normalny**."
      }
     },
     {
      "npc": "Super, to idziemy!",
      "npcTr": {
       "uk": "Супер, тоді ходімо!",
       "ru": "Супер, тогда пошли!",
       "en": "Great, let's go!"
      }
     }
    ]
   },
   "explanation": null
  }
 },
 {
  "lesson": "waw-5-liczby",
  "n": 2,
  "from": {
   "type": "LISTENING",
   "skill": "listening.numbers",
   "data": {
    "audioText": "pięć",
    "options": [
     {
      "id": "o0",
      "text": "pięć"
     },
     {
      "id": "o1",
      "text": "sześć"
     },
     {
      "id": "o2",
      "text": "dziewięć"
     }
    ],
    "answer": "o0"
   },
   "explanation": null
  },
  "to": {
   "type": "LISTENING",
   "skill": "listening.numbers",
   "data": {
    "audioText": "pięć",
    "options": [
     {
      "id": "o0",
      "text": "pięć"
     },
     {
      "id": "o1",
      "text": "dziesięć"
     },
     {
      "id": "o2",
      "text": "dziewięć"
     }
    ],
    "answer": "o0"
   },
   "explanation": null
  }
 },
 {
  "lesson": "waw-6-wiek",
  "n": 7,
  "from": {
   "type": "DIALOGUE",
   "skill": "dialogue.age",
   "data": {
    "npc": {
     "name": "Ania",
     "emoji": "👩🏼",
     "role": {
      "uk": "студентка з Варшави",
      "ru": "студентка из Варшавы",
      "en": "a student from Warsaw"
     }
    },
    "steps": [
     {
      "npc": "Ile masz lat?",
      "npcTr": {
       "uk": "Скільки тобі років?",
       "ru": "Сколько тебе лет?",
       "en": "How old are you?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Mam dwadzieścia lat.",
        "tr": {
         "uk": "Мені двадцять років.",
         "ru": "Мне двадцать лет.",
         "en": "I am twenty."
        }
       },
       {
        "id": "s0o1",
        "text": "Jestem dwadzieścia.",
        "tr": {
         "uk": "(неправильно)",
         "ru": "(неправильно)",
         "en": "(incorrect)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "Вік у польській виражається через **mieć**: Mam … lat.",
       "ru": "Возраст в польском выражается через **mieć**: Mam … lat.",
       "en": "Age in Polish uses **mieć**: Mam … lat."
      }
     },
     {
      "npc": "Super! Ja też!",
      "npcTr": {
       "uk": "Супер! Я теж!",
       "ru": "Супер! Я тоже!",
       "en": "Great! Me too!"
      }
     }
    ]
   },
   "explanation": null
  },
  "to": {
   "type": "DIALOGUE",
   "skill": "dialogue.age",
   "data": {
    "npc": {
     "name": "Ania",
     "emoji": "👩🏼",
     "role": {
      "uk": "студентка з Варшави",
      "ru": "студентка из Варшавы",
      "en": "a student from Warsaw"
     }
    },
    "steps": [
     {
      "npc": "Ile masz lat?",
      "npcTr": {
       "uk": "Скільки тобі років?",
       "ru": "Сколько тебе лет?",
       "en": "How old are you?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Mam dwadzieścia lat.",
        "tr": {
         "uk": "Мені двадцять років.",
         "ru": "Мне двадцать лет.",
         "en": "I am twenty."
        }
       },
       {
        "id": "s0o1",
        "text": "Jestem dwadzieścia.",
        "tr": {
         "uk": "(неправильно)",
         "ru": "(неправильно)",
         "en": "(incorrect)"
        }
       },
       {
        "id": "s0o2",
        "text": "Mam dwadzieścia rok.",
        "tr": {
         "uk": "(після 5+ — **lat**: dwadzieścia **lat**)",
         "ru": "(после 5+ — **lat**: dwadzieścia **lat**)",
         "en": "(after 5 and more use **lat**: dwadzieścia **lat**)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "Вік у польській виражається через **mieć**: Mam … lat.",
       "ru": "Возраст в польском выражается через **mieć**: Mam … lat.",
       "en": "Age in Polish uses **mieć**: Mam … lat."
      }
     },
     {
      "npc": "Super! Ja też!",
      "npcTr": {
       "uk": "Супер! Я теж!",
       "ru": "Супер! Я тоже!",
       "en": "Great! Me too!"
      }
     }
    ]
   },
   "explanation": null
  }
 },
 {
  "lesson": "waw-boss",
  "n": 10,
  "from": {
   "type": "DIALOGUE",
   "skill": "dialogue.boss",
   "data": {
    "npc": {
     "name": "Pani Ewa",
     "emoji": "👩🏻‍💼",
     "role": {
      "uk": "сусідка",
      "ru": "соседка",
      "en": "a neighbour"
     }
    },
    "steps": [
     {
      "npc": "Dzień dobry! Jestem Ewa, mieszkam obok.",
      "npcTr": {
       "uk": "Добрий день! Я Ева, живу поруч.",
       "ru": "Добрый день! Я Ева, живу рядом.",
       "en": "Good morning! I'm Ewa, I live next door."
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Dzień dobry! Miło mi. Mieszkam pod siódemką.",
        "tr": {
         "uk": "Добрий день! Приємно. Я живу в сьомій квартирі.",
         "ru": "Добрый день! Приятно. Я живу в седьмой квартире.",
         "en": "Good morning! Nice to meet you. I live at number seven."
        }
       },
       {
        "id": "s0o1",
        "text": "Cześć, Ewa! Jestem Bobek.",
        "tr": {
         "uk": "Привіт, Ево! Я Бобек.",
         "ru": "Привет, Ева! Я Бобек.",
         "en": "Hi, Ewa! I'm Bobek."
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "Сусідка привіталася формально («Dzień dobry»). З незнайомою людиною — так само: **Dzień dobry!** і представся. На «ти» переходять, коли запропонують.",
       "ru": "Соседка поздоровалась формально («Dzień dobry»). С незнакомым человеком — так же: **Dzień dobry!** и представься. На «ты» переходят, когда предложат.",
       "en": "The neighbour greeted you formally. Do the same with someone new: **Dzień dobry!** and introduce yourself."
      }
     },
     {
      "npc": "A skąd jesteś?",
      "npcTr": {
       "uk": "А звідки ти?",
       "ru": "А откуда ты?",
       "en": "And where are you from?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Jestem z Białorusi, z Mińska.",
        "tr": {
         "uk": "Я з Білорусі, з Мінська.",
         "ru": "Я из Беларуси, из Минска.",
         "en": "I'm from Belarus, from Minsk."
        }
       },
       {
        "id": "s1o1",
        "text": "Jestem z Białoruś.",
        "tr": {
         "uk": "Я з Білорусь (з помилкою).",
         "ru": "Я из Беларусь (с ошибкой).",
         "en": "I'm from Belarus (with a mistake)."
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "Після **z** — родовий відмінок: Białoruś → **z Białorusi**, Ukraina → **z Ukrainy**, Mińsk → **z Mińska**.",
       "ru": "После **z** — родительный падеж: Białoruś → **z Białorusi**, Ukraina → **z Ukrainy**, Mińsk → **z Mińska**.",
       "en": "After **z** use the genitive: Białoruś → **z Białorusi**, Ukraina → **z Ukrainy**, Mińsk → **z Mińska**."
      }
     },
     {
      "npc": "Witamy w Warszawie!",
      "npcTr": {
       "uk": "Ласкаво просимо до Варшави!",
       "ru": "Добро пожаловать в Варшаву!",
       "en": "Welcome to Warsaw!"
      },
      "options": [
       {
        "id": "s2o0",
        "text": "Dziękuję bardzo!",
        "tr": {
         "uk": "Дуже дякую!",
         "ru": "Большое спасибо!",
         "en": "Thank you very much!"
        }
       },
       {
        "id": "s2o1",
        "text": "Nie ma za co!",
        "tr": {
         "uk": "Нема за що!",
         "ru": "Не за что!",
         "en": "You're welcome!"
        }
       }
      ],
      "answer": "s2o0",
      "feedback": {
       "uk": "**Nie ma za co** — відповідь на «дякую». На привітання «Witamy!» дякують: **Dziękuję bardzo!**",
       "ru": "**Nie ma za co** — ответ на «спасибо». На «Witamy!» благодарят: **Dziękuję bardzo!**",
       "en": "**Nie ma za co** answers \"thank you\". Reply to \"Witamy!\" with **Dziękuję bardzo!**"
      }
     }
    ]
   },
   "explanation": null
  },
  "to": {
   "type": "DIALOGUE",
   "skill": "dialogue.boss",
   "data": {
    "npc": {
     "name": "Pani Ewa",
     "emoji": "👩🏻‍💼",
     "role": {
      "uk": "сусідка",
      "ru": "соседка",
      "en": "a neighbour"
     }
    },
    "steps": [
     {
      "npc": "Dzień dobry! Jestem Ewa, mieszkam obok.",
      "npcTr": {
       "uk": "Добрий день! Я Ева, живу поруч.",
       "ru": "Добрый день! Я Ева, живу рядом.",
       "en": "Good morning! I'm Ewa, I live next door."
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Dzień dobry! Miło mi. Mieszkam pod siódemką.",
        "tr": {
         "uk": "Добрий день! Приємно. Я живу в сьомій квартирі.",
         "ru": "Добрый день! Приятно. Я живу в седьмой квартире.",
         "en": "Good morning! Nice to meet you. I live at number seven."
        }
       },
       {
        "id": "s0o1",
        "text": "Cześć, Ewa! Jestem Bobek.",
        "tr": {
         "uk": "Привіт, Ево! Я Бобек.",
         "ru": "Привет, Ева! Я Бобек.",
         "en": "Hi, Ewa! I'm Bobek."
        }
       },
       {
        "id": "s0o2",
        "text": "Dzień dobry! Miło mi. Mieszkam pod siódemkę.",
        "tr": {
         "uk": "(**pod** («де») + орудний: pod **siódemką**)",
         "ru": "(**pod** («где») + творительный: pod **siódemką**)",
         "en": "(**pod** (where) takes the instrumental: pod **siódemką**)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "Сусідка привіталася формально («Dzień dobry»). З незнайомою людиною — так само: **Dzień dobry!** і представся. На «ти» переходять, коли запропонують.",
       "ru": "Соседка поздоровалась формально («Dzień dobry»). С незнакомым человеком — так же: **Dzień dobry!** и представься. На «ты» переходят, когда предложат.",
       "en": "The neighbour greeted you formally. Do the same with someone new: **Dzień dobry!** and introduce yourself."
      }
     },
     {
      "npc": "A skąd jesteś?",
      "npcTr": {
       "uk": "А звідки ти?",
       "ru": "А откуда ты?",
       "en": "And where are you from?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Jestem z Białorusi, z Mińska.",
        "tr": {
         "uk": "Я з Білорусі, з Мінська.",
         "ru": "Я из Беларуси, из Минска.",
         "en": "I'm from Belarus, from Minsk."
        }
       },
       {
        "id": "s1o1",
        "text": "Jestem z Białoruś.",
        "tr": {
         "uk": "Я з Білорусь (з помилкою).",
         "ru": "Я из Беларусь (с ошибкой).",
         "en": "I'm from Belarus (with a mistake)."
        }
       },
       {
        "id": "s1o2",
        "text": "Jestem z Białorusią, z Mińska.",
        "tr": {
         "uk": "(**z** («звідки») + родовий: z **Białorusi**)",
         "ru": "(**z** («откуда») + родительный: z **Białorusi**)",
         "en": "(**z** (“from”) takes the genitive: z **Białorusi**)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "Після **z** — родовий відмінок: Białoruś → **z Białorusi**, Ukraina → **z Ukrainy**, Mińsk → **z Mińska**.",
       "ru": "После **z** — родительный падеж: Białoruś → **z Białorusi**, Ukraina → **z Ukrainy**, Mińsk → **z Mińska**.",
       "en": "After **z** use the genitive: Białoruś → **z Białorusi**, Ukraina → **z Ukrainy**, Mińsk → **z Mińska**."
      }
     },
     {
      "npc": "Witamy w Warszawie!",
      "npcTr": {
       "uk": "Ласкаво просимо до Варшави!",
       "ru": "Добро пожаловать в Варшаву!",
       "en": "Welcome to Warsaw!"
      },
      "options": [
       {
        "id": "s2o0",
        "text": "Dziękuję bardzo!",
        "tr": {
         "uk": "Дуже дякую!",
         "ru": "Большое спасибо!",
         "en": "Thank you very much!"
        }
       },
       {
        "id": "s2o1",
        "text": "Nie ma za co!",
        "tr": {
         "uk": "Нема за що!",
         "ru": "Не за что!",
         "en": "You're welcome!"
        }
       },
       {
        "id": "s2o2",
        "text": "Do widzenia!",
        "tr": {
         "uk": "(**Do widzenia** — прощання; на привітання дякують: **Dziękuję bardzo!**)",
         "ru": "(**Do widzenia** — прощание; на приветствие благодарят: **Dziękuję bardzo!**)",
         "en": "(**Do widzenia** is a farewell; to a welcome reply **Dziękuję bardzo!**)"
        }
       }
      ],
      "answer": "s2o0",
      "feedback": {
       "uk": "**Nie ma za co** — відповідь на «дякую». На привітання «Witamy!» дякують: **Dziękuję bardzo!**",
       "ru": "**Nie ma za co** — ответ на «спасибо». На «Witamy!» благодарят: **Dziękuję bardzo!**",
       "en": "**Nie ma za co** answers \"thank you\". Reply to \"Witamy!\" with **Dziękuję bardzo!**"
      }
     }
    ]
   },
   "explanation": null
  }
 },
 {
  "lesson": "lodz-2-dwuznaki",
  "n": 0,
  "from": {
   "type": "DIALOGUE",
   "skill": "dialogue.sounds",
   "data": {
    "npc": {
     "name": "Kasia",
     "emoji": "👩🏼",
     "role": {
      "uk": "студентка з Лодзі",
      "ru": "студентка из Лодзи",
      "en": "a student from Łódź"
     }
    },
    "steps": [
     {
      "npc": "Cześć! Masz czas?",
      "npcTr": {
       "uk": "Привіт! Маєш час?",
       "ru": "Привет! Есть время?",
       "en": "Hi! Do you have time?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Nie, idę do szkoły.",
        "tr": {
         "uk": "Ні, іду до школи.",
         "ru": "Нет, иду в школу.",
         "en": "No, I'm going to school."
        }
       },
       {
        "id": "s0o1",
        "text": "Nie, idę do szkoła.",
        "tr": {
         "uk": "Ні, іду до школи. (з помилкою)",
         "ru": "Нет, иду в школу. (с ошибкой)",
         "en": "No, I'm going to school. (a mistake)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "Після **do** — родовий відмінок: szkoła → **do szkoły**.",
       "ru": "После **do** — родительный падеж: szkoła → **do szkoły**.",
       "en": "After **do** use the genitive: szkoła → **do szkoły**."
      }
     },
     {
      "npc": "Szkoda! To zadzwoń wieczorem.",
      "npcTr": {
       "uk": "Шкода! Тоді подзвони ввечері.",
       "ru": "Жаль! Тогда позвони вечером.",
       "en": "Pity! Call in the evening then."
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Dobrze, zadzwonię!",
        "tr": {
         "uk": "Добре, подзвоню!",
         "ru": "Хорошо, позвоню!",
         "en": "OK, I'll call!"
        }
       },
       {
        "id": "s1o1",
        "text": "Dobrze, dzwonię!",
        "tr": {
         "uk": "Добре, дзвоню! (зараз)",
         "ru": "Хорошо, звоню! (сейчас)",
         "en": "OK, I'm calling! (now)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "Просять подзвонити ввечері — відповідь у майбутньому: **zadzwonię** (подзвоню). **Dzwonię** — дзвоню зараз.",
       "ru": "Просят позвонить вечером — ответ в будущем: **zadzwonię** (позвоню). **Dzwonię** — звоню сейчас.",
       "en": "She asks you to call tonight — answer in the future: **zadzwonię** (I'll call). **Dzwonię** means \"I'm calling now\"."
      }
     }
    ]
   },
   "explanation": null
  },
  "to": {
   "type": "DIALOGUE",
   "skill": "dialogue.sounds",
   "data": {
    "npc": {
     "name": "Kasia",
     "emoji": "👩🏼",
     "role": {
      "uk": "студентка з Лодзі",
      "ru": "студентка из Лодзи",
      "en": "a student from Łódź"
     }
    },
    "steps": [
     {
      "npc": "Cześć! Masz czas?",
      "npcTr": {
       "uk": "Привіт! Маєш час?",
       "ru": "Привет! Есть время?",
       "en": "Hi! Do you have time?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Nie, idę do szkoły.",
        "tr": {
         "uk": "Ні, іду до школи.",
         "ru": "Нет, иду в школу.",
         "en": "No, I'm going to school."
        }
       },
       {
        "id": "s0o1",
        "text": "Nie, idę do szkoła.",
        "tr": {
         "uk": "Ні, іду до школи. (з помилкою)",
         "ru": "Нет, иду в школу. (с ошибкой)",
         "en": "No, I'm going to school. (a mistake)"
        }
       },
       {
        "id": "s0o2",
        "text": "Nie, idę w szkole.",
        "tr": {
         "uk": "(куди? — **do** + родовий: **do szkoły**; **w szkole** — «у школі», де)",
         "ru": "(куда? — **do** + родительный: **do szkoły**; **w szkole** — «в школе», где)",
         "en": "(where to? — **do** + genitive: **do szkoły**; **w szkole** means “at school”)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "Після **do** — родовий відмінок: szkoła → **do szkoły**.",
       "ru": "После **do** — родительный падеж: szkoła → **do szkoły**.",
       "en": "After **do** use the genitive: szkoła → **do szkoły**."
      }
     },
     {
      "npc": "Szkoda! To zadzwoń wieczorem.",
      "npcTr": {
       "uk": "Шкода! Тоді подзвони ввечері.",
       "ru": "Жаль! Тогда позвони вечером.",
       "en": "Pity! Call in the evening then."
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Dobrze, zadzwonię!",
        "tr": {
         "uk": "Добре, подзвоню!",
         "ru": "Хорошо, позвоню!",
         "en": "OK, I'll call!"
        }
       },
       {
        "id": "s1o1",
        "text": "Dobrze, dzwonię!",
        "tr": {
         "uk": "Добре, дзвоню! (зараз)",
         "ru": "Хорошо, звоню! (сейчас)",
         "en": "OK, I'm calling! (now)"
        }
       },
       {
        "id": "s1o2",
        "text": "Dobrze, zadzwoniłem!",
        "tr": {
         "uk": "(подзвонити треба ввечері — майбутнє: **zadzwonię**; **zadzwoniłem** — «подзвонив»)",
         "ru": "(позвонить нужно вечером — будущее: **zadzwonię**; **zadzwoniłem** — «позвонил»)",
         "en": "(the call is for the evening — future: **zadzwonię**; **zadzwoniłem** means “I called”)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "Просять подзвонити ввечері — відповідь у майбутньому: **zadzwonię** (подзвоню). **Dzwonię** — дзвоню зараз.",
       "ru": "Просят позвонить вечером — ответ в будущем: **zadzwonię** (позвоню). **Dzwonię** — звоню сейчас.",
       "en": "She asks you to call tonight — answer in the future: **zadzwonię** (I'll call). **Dzwonię** means \"I'm calling now\"."
      }
     }
    ]
   },
   "explanation": null
  }
 },
 {
  "lesson": "lodz-3-zawody",
  "n": 0,
  "from": {
   "type": "DIALOGUE",
   "skill": "dialogue.zawody",
   "data": {
    "npc": {
     "name": "Pan Marek",
     "emoji": "👨🏻",
     "role": {
      "uk": "сусід",
      "ru": "сосед",
      "en": "a neighbour"
     }
    },
    "steps": [
     {
      "npc": "Dzień dobry! Pan jest nowym sąsiadem?",
      "npcTr": {
       "uk": "Добрий день! Ви новий сусід?",
       "ru": "Добрый день! Вы новый сосед?",
       "en": "Hello! Are you the new neighbour?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Tak, dzień dobry. Jestem Bobek.",
        "tr": {
         "uk": "Так, добрий день. Я Бобек.",
         "ru": "Да, добрый день. Я Бобек.",
         "en": "Yes, hello. I'm Bobek."
        }
       },
       {
        "id": "s0o1",
        "text": "Tak, jest Bobek.",
        "tr": {
         "uk": "(помилка у формі дієслова)",
         "ru": "(ошибка в форме глагола)",
         "en": "(wrong verb form)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "Про себе — **jestem**.",
       "ru": "О себе — **jestem**.",
       "en": "About yourself — **jestem**."
      }
     },
     {
      "npc": "Miło mi. Czym się pan zajmuje?",
      "npcTr": {
       "uk": "Приємно. Чим ви займаєтеся?",
       "ru": "Приятно. Чем вы занимаетесь?",
       "en": "Nice to meet you. What do you do?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Jestem programistą.",
        "tr": {
         "uk": "Я програміст.",
         "ru": "Я программист.",
         "en": "I'm a programmer."
        }
       },
       {
        "id": "s1o1",
        "text": "Jestem programista.",
        "tr": {
         "uk": "(після być потрібен орудний відмінок)",
         "ru": "(после być нужен творительный падеж)",
         "en": "(być needs the instrumental)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "Після **jestem** — narzędnik: programista → **programistą**.",
       "ru": "После **jestem** — narzędnik: programista → **programistą**.",
       "en": "After **jestem** — instrumental: **programistą**."
      }
     },
     {
      "npc": "A ja jestem kierowcą autobusu.",
      "npcTr": {
       "uk": "А я водій автобуса.",
       "ru": "А я водитель автобуса.",
       "en": "And I'm a bus driver."
      }
     }
    ]
   },
   "explanation": null
  },
  "to": {
   "type": "DIALOGUE",
   "skill": "dialogue.zawody",
   "data": {
    "npc": {
     "name": "Pan Marek",
     "emoji": "👨🏻",
     "role": {
      "uk": "сусід",
      "ru": "сосед",
      "en": "a neighbour"
     }
    },
    "steps": [
     {
      "npc": "Dzień dobry! Pan jest nowym sąsiadem?",
      "npcTr": {
       "uk": "Добрий день! Ви новий сусід?",
       "ru": "Добрый день! Вы новый сосед?",
       "en": "Hello! Are you the new neighbour?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Tak, dzień dobry. Jestem Bobek.",
        "tr": {
         "uk": "Так, добрий день. Я Бобек.",
         "ru": "Да, добрый день. Я Бобек.",
         "en": "Yes, hello. I'm Bobek."
        }
       },
       {
        "id": "s0o1",
        "text": "Tak, jest Bobek.",
        "tr": {
         "uk": "(помилка у формі дієслова)",
         "ru": "(ошибка в форме глагола)",
         "en": "(wrong verb form)"
        }
       },
       {
        "id": "s0o2",
        "text": "Tak, dzień dobry. Jesteś Bobek.",
        "tr": {
         "uk": "(про себе — **jestem**; **jesteś** — «ти є»)",
         "ru": "(о себе — **jestem**; **jesteś** — «ты есть»)",
         "en": "(about yourself — **jestem**; **jesteś** means “you are”)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "Про себе — **jestem**.",
       "ru": "О себе — **jestem**.",
       "en": "About yourself — **jestem**."
      }
     },
     {
      "npc": "Miło mi. Czym się pan zajmuje?",
      "npcTr": {
       "uk": "Приємно. Чим ви займаєтеся?",
       "ru": "Приятно. Чем вы занимаетесь?",
       "en": "Nice to meet you. What do you do?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Jestem programistą.",
        "tr": {
         "uk": "Я програміст.",
         "ru": "Я программист.",
         "en": "I'm a programmer."
        }
       },
       {
        "id": "s1o1",
        "text": "Jestem programista.",
        "tr": {
         "uk": "(після być потрібен орудний відмінок)",
         "ru": "(после być нужен творительный падеж)",
         "en": "(być needs the instrumental)"
        }
       },
       {
        "id": "s1o2",
        "text": "Jestem programistką.",
        "tr": {
         "uk": "(Бобек — чоловік: **programistą**; **programistką** — жінка-програмістка)",
         "ru": "(Бобек — мужчина: **programistą**; **programistką** — женщина-программист)",
         "en": "(Bobek is a man: **programistą**; **programistką** is a woman programmer)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "Після **jestem** — narzędnik: programista → **programistą**.",
       "ru": "После **jestem** — narzędnik: programista → **programistą**.",
       "en": "After **jestem** — instrumental: **programistą**."
      }
     },
     {
      "npc": "A ja jestem kierowcą autobusu.",
      "npcTr": {
       "uk": "А я водій автобуса.",
       "ru": "А я водитель автобуса.",
       "en": "And I'm a bus driver."
      }
     }
    ]
   },
   "explanation": null
  }
 },
 {
  "lesson": "lodz-5-gdzie-pracujesz",
  "n": 7,
  "from": {
   "type": "DIALOGUE",
   "skill": "dialogue.work",
   "data": {
    "npc": {
     "name": "Kasia",
     "emoji": "👩🏼",
     "role": {
      "uk": "студентка з Лодзі",
      "ru": "студентка из Лодзи",
      "en": "a student from Łódź"
     }
    },
    "scene": {
     "uk": "Трамвайна зупинка на Piotrkowskiej. Кася чекає на 10-ку.",
     "ru": "Трамвайная остановка на Piotrkowskiej. Кася ждёт десятку.",
     "en": "A tram stop on Piotrkowska. Kasia is waiting for the number 10."
    },
    "steps": [
     {
      "npc": "Cześć! Dawno cię nie widziałam. Gdzie teraz pracujesz?",
      "npcTr": {
       "uk": "Привіт! Давно тебе не бачила. Де ти тепер працюєш?",
       "ru": "Привет! Давно тебя не видела. Где ты теперь работаешь?",
       "en": "Hi! Long time no see. Where do you work now?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Pracuję w magazynie na Teofilowie.",
        "tr": {
         "uk": "Я працюю на складі на Теофілові.",
         "ru": "Я работаю на складе на Теофилове.",
         "en": "I work in a warehouse in Teofilów."
        }
       },
       {
        "id": "s0o1",
        "text": "Mieszkam na Teofilowie od roku.",
        "tr": {
         "uk": "Я живу на Теофілові вже рік.",
         "ru": "Я живу на Теофилове уже год.",
         "en": "I've lived in Teofilów for a year."
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "Кася питає про роботу: **Pracuję w magazynie…**",
       "ru": "Кася спрашивает о работе: **Pracuję w magazynie…**",
       "en": "Kasia is asking about work: **Pracuję w magazynie…**"
      }
     },
     {
      "npc": "O, fajnie! I jak tam jest?",
      "npcTr": {
       "uk": "О, класно! І як там?",
       "ru": "О, классно! И как там?",
       "en": "Oh, cool! And how is it there?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Praca jest ciężka, ale ludzie są mili.",
        "tr": {
         "uk": "Робота важка, але люди приємні.",
         "ru": "Работа тяжёлая, но люди приятные.",
         "en": "The work is hard, but the people are nice."
        }
       },
       {
        "id": "s1o1",
        "text": "Praca jest w poniedziałek o szóstej rano.",
        "tr": {
         "uk": "Робота в понеділок о шостій ранку.",
         "ru": "Работа в понедельник в шесть утра.",
         "en": "Work is on Monday at six in the morning."
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "«Jak tam jest?» — «Як там?»: відповідай, яка робота, а не коли вона.",
       "ru": "«Jak tam jest?» — «Как там?»: отвечай, какая работа, а не когда она.",
       "en": "\"Jak tam jest?\" asks what it's like, not when."
      }
     },
     {
      "npc": "A ja dalej pracuję w kawiarni. Wpadnij kiedyś na kawę!",
      "npcTr": {
       "uk": "А я досі працюю в кав'ярні. Заходь якось на каву!",
       "ru": "А я всё ещё работаю в кафе. Заходи как-нибудь на кофе!",
       "en": "And I still work at the café. Drop by for a coffee sometime!"
      }
     }
    ]
   },
   "explanation": null
  },
  "to": {
   "type": "DIALOGUE",
   "skill": "dialogue.work",
   "data": {
    "npc": {
     "name": "Kasia",
     "emoji": "👩🏼",
     "role": {
      "uk": "студентка з Лодзі",
      "ru": "студентка из Лодзи",
      "en": "a student from Łódź"
     }
    },
    "scene": {
     "uk": "Трамвайна зупинка на Piotrkowskiej. Кася чекає на 10-ку.",
     "ru": "Трамвайная остановка на Piotrkowskiej. Кася ждёт десятку.",
     "en": "A tram stop on Piotrkowska. Kasia is waiting for the number 10."
    },
    "steps": [
     {
      "npc": "Cześć! Dawno cię nie widziałam. Gdzie teraz pracujesz?",
      "npcTr": {
       "uk": "Привіт! Давно тебе не бачила. Де ти тепер працюєш?",
       "ru": "Привет! Давно тебя не видела. Где ты теперь работаешь?",
       "en": "Hi! Long time no see. Where do you work now?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Pracuję w magazynie na Teofilowie.",
        "tr": {
         "uk": "Я працюю на складі на Теофілові.",
         "ru": "Я работаю на складе на Теофилове.",
         "en": "I work in a warehouse in Teofilów."
        }
       },
       {
        "id": "s0o1",
        "text": "Mieszkam na Teofilowie od roku.",
        "tr": {
         "uk": "Я живу на Теофілові вже рік.",
         "ru": "Я живу на Теофилове уже год.",
         "en": "I've lived in Teofilów for a year."
        }
       },
       {
        "id": "s0o2",
        "text": "Pracuję w magazyn na Teofilowie.",
        "tr": {
         "uk": "(**w** + місцевий: w **magazynie**)",
         "ru": "(**w** + предложный: w **magazynie**)",
         "en": "(**w** + locative: w **magazynie**)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "Кася питає про роботу: **Pracuję w magazynie…**",
       "ru": "Кася спрашивает о работе: **Pracuję w magazynie…**",
       "en": "Kasia is asking about work: **Pracuję w magazynie…**"
      }
     },
     {
      "npc": "O, fajnie! I jak tam jest?",
      "npcTr": {
       "uk": "О, класно! І як там?",
       "ru": "О, классно! И как там?",
       "en": "Oh, cool! And how is it there?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Praca jest ciężka, ale ludzie są mili.",
        "tr": {
         "uk": "Робота важка, але люди приємні.",
         "ru": "Работа тяжёлая, но люди приятные.",
         "en": "The work is hard, but the people are nice."
        }
       },
       {
        "id": "s1o1",
        "text": "Praca jest w poniedziałek o szóstej rano.",
        "tr": {
         "uk": "Робота в понеділок о шостій ранку.",
         "ru": "Работа в понедельник в шесть утра.",
         "en": "Work is on Monday at six in the morning."
        }
       },
       {
        "id": "s1o2",
        "text": "Praca jest ciężka, ale ludzie jest mili.",
        "tr": {
         "uk": "(**ludzie** — множина: **są mili**)",
         "ru": "(**ludzie** — множественное число: **są mili**)",
         "en": "(**ludzie** is plural: **są mili**)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "«Jak tam jest?» — «Як там?»: відповідай, яка робота, а не коли вона.",
       "ru": "«Jak tam jest?» — «Как там?»: отвечай, какая работа, а не когда она.",
       "en": "\"Jak tam jest?\" asks what it's like, not when."
      }
     },
     {
      "npc": "A ja dalej pracuję w kawiarni. Wpadnij kiedyś na kawę!",
      "npcTr": {
       "uk": "А я досі працюю в кав'ярні. Заходь якось на каву!",
       "ru": "А я всё ещё работаю в кафе. Заходи как-нибудь на кофе!",
       "en": "And I still work at the café. Drop by for a coffee sometime!"
      }
     }
    ]
   },
   "explanation": null
  }
 },
 {
  "lesson": "lodz-8-pierwszy-dzien",
  "n": 9,
  "from": {
   "type": "SITUATION",
   "skill": "dialogue.safety",
   "data": {
    "npc": {
     "name": "Pan Tomasz",
     "emoji": "🧔🏻",
     "role": {
      "uk": "керівник зміни на складі",
      "ru": "начальник смены на складе",
      "en": "warehouse shift manager"
     }
    },
    "scene": {
     "uk": "Склад на Теофілові, 6:50 ранку. Бобек у перший день.",
     "ru": "Склад на Теофилове, 6:50 утра. Бобек в первый день.",
     "en": "A warehouse in Teofilów, 6:50 a.m. Bobek's first day."
    },
    "steps": [
     {
      "npc": "Dzień dobry! Pierwszy dzień? Najpierw szatnia. Ma pan kask i kamizelkę?",
      "npcTr": {
       "uk": "Добрий день! Перший день? Спершу роздягальня. У вас є каска й жилет?",
       "ru": "Добрый день! Первый день? Сначала раздевалка. У вас есть каска и жилет?",
       "en": "Good morning! First day? Changing room first. Do you have a helmet and a vest?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Kamizelkę mam, ale nie mam kasku.",
        "tr": {
         "uk": "Жилет маю, але каски не маю.",
         "ru": "Жилет есть, но каски нет.",
         "en": "I have a vest, but I don't have a helmet."
        }
       },
       {
        "id": "s0o1",
        "text": "Kamizelkę mam, ale nie mam kask.",
        "tr": {
         "uk": "Жилет маю, але каски не маю (з помилкою).",
         "ru": "Жилет есть, но каски нет (с ошибкой).",
         "en": "I have a vest, but no helmet (with a mistake)."
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "Після **nie mam** — родовий: **nie mam kasku**.",
       "ru": "После **nie mam** — родительный: **nie mam kasku**.",
       "en": "After **nie mam** use the genitive: **nie mam kasku**."
      }
     },
     {
      "npc": "Nie ma problemu, kask dostanie pan w szatni. Na hali nie wolno używać telefonu.",
      "npcTr": {
       "uk": "Без проблем, каску отримаєте в роздягальні. У цеху не можна користуватися телефоном.",
       "ru": "Без проблем, каску получите в раздевалке. В цеху нельзя пользоваться телефоном.",
       "en": "No problem, you'll get a helmet in the changing room. You mustn't use your phone in the hall."
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Rozumiem. A gdzie jest wyjście awaryjne?",
        "tr": {
         "uk": "Зрозуміло. А де аварійний вихід?",
         "ru": "Понятно. А где аварийный выход?",
         "en": "I see. And where is the emergency exit?"
        }
       },
       {
        "id": "s1o1",
        "text": "Rozumiem. To zadzwonię do pana z hali.",
        "tr": {
         "uk": "Зрозуміло. Тоді я подзвоню вам із цеху.",
         "ru": "Понятно. Тогда я позвоню вам из цеха.",
         "en": "I see. Then I'll call you from the hall."
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "Телефон у цеху заборонений; доречне питання — про **wyjście awaryjne**.",
       "ru": "Телефон в цеху запрещён; уместный вопрос — про **wyjście awaryjne**.",
       "en": "Phones are banned in the hall; a sensible question is about the **wyjście awaryjne**."
      }
     },
     {
      "npc": "Na końcu hali, przy zielonej tabliczce. Proszę iść za mną!",
      "npcTr": {
       "uk": "У кінці цеху, біля зеленої таблички. Ідіть за мною!",
       "ru": "В конце цеха, у зелёной таблички. Идите за мной!",
       "en": "At the end of the hall, by the green sign. Follow me!"
      }
     }
    ]
   },
   "explanation": null
  },
  "to": {
   "type": "SITUATION",
   "skill": "dialogue.safety",
   "data": {
    "npc": {
     "name": "Pan Tomasz",
     "emoji": "🧔🏻",
     "role": {
      "uk": "керівник зміни на складі",
      "ru": "начальник смены на складе",
      "en": "warehouse shift manager"
     }
    },
    "scene": {
     "uk": "Склад на Теофілові, 6:50 ранку. Бобек у перший день.",
     "ru": "Склад на Теофилове, 6:50 утра. Бобек в первый день.",
     "en": "A warehouse in Teofilów, 6:50 a.m. Bobek's first day."
    },
    "steps": [
     {
      "npc": "Dzień dobry! Pierwszy dzień? Najpierw szatnia. Ma pan kask i kamizelkę?",
      "npcTr": {
       "uk": "Добрий день! Перший день? Спершу роздягальня. У вас є каска й жилет?",
       "ru": "Добрый день! Первый день? Сначала раздевалка. У вас есть каска и жилет?",
       "en": "Good morning! First day? Changing room first. Do you have a helmet and a vest?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Kamizelkę mam, ale nie mam kasku.",
        "tr": {
         "uk": "Жилет маю, але каски не маю.",
         "ru": "Жилет есть, но каски нет.",
         "en": "I have a vest, but I don't have a helmet."
        }
       },
       {
        "id": "s0o1",
        "text": "Kamizelkę mam, ale nie mam kask.",
        "tr": {
         "uk": "Жилет маю, але каски не маю (з помилкою).",
         "ru": "Жилет есть, но каски нет (с ошибкой).",
         "en": "I have a vest, but no helmet (with a mistake)."
        }
       },
       {
        "id": "s0o2",
        "text": "Kamizelka mam, ale nie mam kasku.",
        "tr": {
         "uk": "(**mam** + знахідний: **kamizelkę**)",
         "ru": "(**mam** + винительный: **kamizelkę**)",
         "en": "(**mam** takes the accusative: **kamizelkę**)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "Після **nie mam** — родовий: **nie mam kasku**.",
       "ru": "После **nie mam** — родительный: **nie mam kasku**.",
       "en": "After **nie mam** use the genitive: **nie mam kasku**."
      }
     },
     {
      "npc": "Nie ma problemu, kask dostanie pan w szatni. Na hali nie wolno używać telefonu.",
      "npcTr": {
       "uk": "Без проблем, каску отримаєте в роздягальні. У цеху не можна користуватися телефоном.",
       "ru": "Без проблем, каску получите в раздевалке. В цеху нельзя пользоваться телефоном.",
       "en": "No problem, you'll get a helmet in the changing room. You mustn't use your phone in the hall."
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Rozumiem. A gdzie jest wyjście awaryjne?",
        "tr": {
         "uk": "Зрозуміло. А де аварійний вихід?",
         "ru": "Понятно. А где аварийный выход?",
         "en": "I see. And where is the emergency exit?"
        }
       },
       {
        "id": "s1o1",
        "text": "Rozumiem. To zadzwonię do pana z hali.",
        "tr": {
         "uk": "Зрозуміло. Тоді я подзвоню вам із цеху.",
         "ru": "Понятно. Тогда я позвоню вам из цеха.",
         "en": "I see. Then I'll call you from the hall."
        }
       },
       {
        "id": "s1o2",
        "text": "Rozumiem. A gdzie jest wyjście awaryjnego?",
        "tr": {
         "uk": "(**wyjście** — середній рід, називний: **awaryjne**)",
         "ru": "(**wyjście** — средний род, именительный: **awaryjne**)",
         "en": "(**wyjście** is neuter nominative: **awaryjne**)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "Телефон у цеху заборонений; доречне питання — про **wyjście awaryjne**.",
       "ru": "Телефон в цеху запрещён; уместный вопрос — про **wyjście awaryjne**.",
       "en": "Phones are banned in the hall; a sensible question is about the **wyjście awaryjne**."
      }
     },
     {
      "npc": "Na końcu hali, przy zielonej tabliczce. Proszę iść za mną!",
      "npcTr": {
       "uk": "У кінці цеху, біля зеленої таблички. Ідіть за мною!",
       "ru": "В конце цеха, у зелёной таблички. Идите за мной!",
       "en": "At the end of the hall, by the green sign. Follow me!"
      }
     }
    ]
   },
   "explanation": null
  }
 },
 {
  "lesson": "lodz-9-ktora-godzina",
  "n": 6,
  "from": {
   "type": "DIALOGUE",
   "skill": "dialogue.time",
   "data": {
    "npc": {
     "name": "Kasia",
     "emoji": "👩🏼",
     "role": {
      "uk": "студентка з Лодзі",
      "ru": "студентка из Лодзи",
      "en": "a student from Łódź"
     }
    },
    "scene": {
     "uk": "Ранок на зупинці Piotrkowska Centrum.",
     "ru": "Утро на остановке Piotrkowska Centrum.",
     "en": "Morning at the Piotrkowska Centrum stop."
    },
    "steps": [
     {
      "npc": "Przepraszam, która jest godzina? Mój telefon nie działa.",
      "npcTr": {
       "uk": "Перепрошую, котра година? Мій телефон не працює.",
       "ru": "Извини, который час? Мой телефон не работает.",
       "en": "Sorry, what time is it? My phone isn't working."
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Jest za kwadrans ósma.",
        "tr": {
         "uk": "Без чверті восьма.",
         "ru": "Без четверти восемь.",
         "en": "It's a quarter to eight."
        }
       },
       {
        "id": "s0o1",
        "text": "Jest ósmy kwadrans.",
        "tr": {
         "uk": "(так про час не кажуть)",
         "ru": "(так о времени не говорят)",
         "en": "(that's not how Polish tells the time)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "7:45 — **za kwadrans ósma**.",
       "ru": "7:45 — **za kwadrans ósma**.",
       "en": "7:45 is **za kwadrans ósma**."
      }
     },
     {
      "npc": "O nie! Zajęcia są o ósmej. Spóźnię się!",
      "npcTr": {
       "uk": "О ні! Заняття о восьмій. Я запізнюся!",
       "ru": "О нет! Занятия в восемь. Я опоздаю!",
       "en": "Oh no! Classes are at eight. I'll be late!"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Tramwaj jest za pięć minut. Zdążysz!",
        "tr": {
         "uk": "Трамвай за п'ять хвилин. Встигнеш!",
         "ru": "Трамвай через пять минут. Успеешь!",
         "en": "The tram is in five minutes. You'll make it!"
        }
       },
       {
        "id": "s1o1",
        "text": "Tramwaj był wczoraj o ósmej.",
        "tr": {
         "uk": "Трамвай був учора о восьмій.",
         "ru": "Трамвай был вчера в восемь.",
         "en": "The tram was at eight yesterday."
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "Кася поспішає — підбадьор її: **Zdążysz!** — встигнеш.",
       "ru": "Кася спешит — подбодри её: **Zdążysz!** — успеешь.",
       "en": "Kasia is in a hurry — reassure her: **Zdążysz!** — you'll make it."
      }
     },
     {
      "npc": "Dzięki! Lecę!",
      "npcTr": {
       "uk": "Дякую! Біжу!",
       "ru": "Спасибо! Бегу!",
       "en": "Thanks! Gotta run!"
      }
     }
    ]
   },
   "explanation": null
  },
  "to": {
   "type": "DIALOGUE",
   "skill": "dialogue.time",
   "data": {
    "npc": {
     "name": "Kasia",
     "emoji": "👩🏼",
     "role": {
      "uk": "студентка з Лодзі",
      "ru": "студентка из Лодзи",
      "en": "a student from Łódź"
     }
    },
    "scene": {
     "uk": "Ранок на зупинці Piotrkowska Centrum.",
     "ru": "Утро на остановке Piotrkowska Centrum.",
     "en": "Morning at the Piotrkowska Centrum stop."
    },
    "steps": [
     {
      "npc": "Przepraszam, która jest godzina? Mój telefon nie działa.",
      "npcTr": {
       "uk": "Перепрошую, котра година? Мій телефон не працює.",
       "ru": "Извини, который час? Мой телефон не работает.",
       "en": "Sorry, what time is it? My phone isn't working."
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Jest za kwadrans ósma.",
        "tr": {
         "uk": "Без чверті восьма.",
         "ru": "Без четверти восемь.",
         "en": "It's a quarter to eight."
        }
       },
       {
        "id": "s0o1",
        "text": "Jest ósmy kwadrans.",
        "tr": {
         "uk": "(так про час не кажуть)",
         "ru": "(так о времени не говорят)",
         "en": "(that's not how Polish tells the time)"
        }
       },
       {
        "id": "s0o2",
        "text": "Jest o kwadrans ósma.",
        "tr": {
         "uk": "(без чверті — **za kwadrans ósma**; **o kwadrans** — не про час доби)",
         "ru": "(без четверти — **za kwadrans ósma**; **o kwadrans** — не про время суток)",
         "en": "(“quarter to” is **za kwadrans ósma**; **o kwadrans** does not tell the time)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "7:45 — **za kwadrans ósma**.",
       "ru": "7:45 — **za kwadrans ósma**.",
       "en": "7:45 is **za kwadrans ósma**."
      }
     },
     {
      "npc": "O nie! Zajęcia są o ósmej. Spóźnię się!",
      "npcTr": {
       "uk": "О ні! Заняття о восьмій. Я запізнюся!",
       "ru": "О нет! Занятия в восемь. Я опоздаю!",
       "en": "Oh no! Classes are at eight. I'll be late!"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Tramwaj jest za pięć minut. Zdążysz!",
        "tr": {
         "uk": "Трамвай за п'ять хвилин. Встигнеш!",
         "ru": "Трамвай через пять минут. Успеешь!",
         "en": "The tram is in five minutes. You'll make it!"
        }
       },
       {
        "id": "s1o1",
        "text": "Tramwaj był wczoraj o ósmej.",
        "tr": {
         "uk": "Трамвай був учора о восьмій.",
         "ru": "Трамвай был вчера в восемь.",
         "en": "The tram was at eight yesterday."
        }
       },
       {
        "id": "s1o2",
        "text": "Tramwaj jest pięć minut temu. Zdążysz!",
        "tr": {
         "uk": "(**za pięć minut** — «через п’ять хвилин»; **temu** — «тому», минуле)",
         "ru": "(**za pięć minut** — «через пять минут»; **temu** — «назад», прошлое)",
         "en": "(**za pięć minut** means “in five minutes”; **temu** means “ago”)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "Кася поспішає — підбадьор її: **Zdążysz!** — встигнеш.",
       "ru": "Кася спешит — подбодри её: **Zdążysz!** — успеешь.",
       "en": "Kasia is in a hurry — reassure her: **Zdążysz!** — you'll make it."
      }
     },
     {
      "npc": "Dzięki! Lecę!",
      "npcTr": {
       "uk": "Дякую! Біжу!",
       "ru": "Спасибо! Бегу!",
       "en": "Thanks! Gotta run!"
      }
     }
    ]
   },
   "explanation": null
  }
 },
 {
  "lesson": "lodz-10-poranek",
  "n": 7,
  "from": {
   "type": "DIALOGUE",
   "skill": "dialogue.daily",
   "data": {
    "npc": {
     "name": "Kasia",
     "emoji": "👩🏼",
     "role": {
      "uk": "студентка з Лодзі",
      "ru": "студентка из Лодзи",
      "en": "a student from Łódź"
     }
    },
    "scene": {
     "uk": "Кава з Касею перед роботою.",
     "ru": "Кофе с Касей перед работой.",
     "en": "Coffee with Kasia before work."
    },
    "steps": [
     {
      "npc": "Co robisz rano przed pracą?",
      "npcTr": {
       "uk": "Що ти робиш зранку перед роботою?",
       "ru": "Что ты делаешь утром перед работой?",
       "en": "What do you do in the morning before work?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Budzę się, biorę prysznic i jem śniadanie.",
        "tr": {
         "uk": "Прокидаюся, приймаю душ і снідаю.",
         "ru": "Просыпаюсь, принимаю душ и завтракаю.",
         "en": "I wake up, shower and have breakfast."
        }
       },
       {
        "id": "s0o1",
        "text": "Budzę się, biorę prysznic i idę spać.",
        "tr": {
         "uk": "Прокидаюся, приймаю душ і йду спати.",
         "ru": "Просыпаюсь, принимаю душ и иду спать.",
         "en": "I wake up, shower and go to bed."
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "Зранку перед роботою не лягають спати — **jem śniadanie** (снідаю).",
       "ru": "Утром перед работой спать не ложатся — **jem śniadanie** (завтракаю).",
       "en": "You don't go to bed before work — **jem śniadanie** (I have breakfast)."
      }
     },
     {
      "npc": "A o której się budzisz?",
      "npcTr": {
       "uk": "А о котрій ти прокидаєшся?",
       "ru": "А во сколько ты просыпаешься?",
       "en": "And what time do you wake up?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "O szóstej. A ty?",
        "tr": {
         "uk": "О шостій. А ти?",
         "ru": "В шесть. А ты?",
         "en": "At six. And you?"
        }
       },
       {
        "id": "s1o1",
        "text": "Szósta się budzę.",
        "tr": {
         "uk": "(без **o** — помилка)",
         "ru": "(без **o** — ошибка)",
         "en": "(missing **o**)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "О котрій? — **o szóstej**.",
       "ru": "Во сколько? — **o szóstej**.",
       "en": "At what time? — **o szóstej**."
      }
     },
     {
      "npc": "Ja o siódmej, ale zajęcia mam dopiero o dziewiątej.",
      "npcTr": {
       "uk": "Я о сьомій, але заняття в мене аж о дев'ятій.",
       "ru": "Я в семь, но занятия у меня только в девять.",
       "en": "Seven for me, but my classes only start at nine."
      }
     }
    ]
   },
   "explanation": null
  },
  "to": {
   "type": "DIALOGUE",
   "skill": "dialogue.daily",
   "data": {
    "npc": {
     "name": "Kasia",
     "emoji": "👩🏼",
     "role": {
      "uk": "студентка з Лодзі",
      "ru": "студентка из Лодзи",
      "en": "a student from Łódź"
     }
    },
    "scene": {
     "uk": "Кава з Касею перед роботою.",
     "ru": "Кофе с Касей перед работой.",
     "en": "Coffee with Kasia before work."
    },
    "steps": [
     {
      "npc": "Co robisz rano przed pracą?",
      "npcTr": {
       "uk": "Що ти робиш зранку перед роботою?",
       "ru": "Что ты делаешь утром перед работой?",
       "en": "What do you do in the morning before work?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Budzę się, biorę prysznic i jem śniadanie.",
        "tr": {
         "uk": "Прокидаюся, приймаю душ і снідаю.",
         "ru": "Просыпаюсь, принимаю душ и завтракаю.",
         "en": "I wake up, shower and have breakfast."
        }
       },
       {
        "id": "s0o1",
        "text": "Budzę się, biorę prysznic i idę spać.",
        "tr": {
         "uk": "Прокидаюся, приймаю душ і йду спати.",
         "ru": "Просыпаюсь, принимаю душ и иду спать.",
         "en": "I wake up, shower and go to bed."
        }
       },
       {
        "id": "s0o2",
        "text": "Budzę, biorę prysznic i jem śniadanie.",
        "tr": {
         "uk": "(**budzić się** — прокидатися: потрібне **się**)",
         "ru": "(**budzić się** — просыпаться: нужно **się**)",
         "en": "(**budzić się** means “to wake up”: it needs **się**)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "Зранку перед роботою не лягають спати — **jem śniadanie** (снідаю).",
       "ru": "Утром перед работой спать не ложатся — **jem śniadanie** (завтракаю).",
       "en": "You don't go to bed before work — **jem śniadanie** (I have breakfast)."
      }
     },
     {
      "npc": "A o której się budzisz?",
      "npcTr": {
       "uk": "А о котрій ти прокидаєшся?",
       "ru": "А во сколько ты просыпаешься?",
       "en": "And what time do you wake up?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "O szóstej. A ty?",
        "tr": {
         "uk": "О шостій. А ти?",
         "ru": "В шесть. А ты?",
         "en": "At six. And you?"
        }
       },
       {
        "id": "s1o1",
        "text": "Szósta się budzę.",
        "tr": {
         "uk": "(без **o** — помилка)",
         "ru": "(без **o** — ошибка)",
         "en": "(missing **o**)"
        }
       },
       {
        "id": "s1o2",
        "text": "O szósta. A ty?",
        "tr": {
         "uk": "(**o** + місцевий: **o szóstej**)",
         "ru": "(**o** + предложный: **o szóstej**)",
         "en": "(**o** + locative: **o szóstej**)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "О котрій? — **o szóstej**.",
       "ru": "Во сколько? — **o szóstej**.",
       "en": "At what time? — **o szóstej**."
      }
     },
     {
      "npc": "Ja o siódmej, ale zajęcia mam dopiero o dziewiątej.",
      "npcTr": {
       "uk": "Я о сьомій, але заняття в мене аж о дев'ятій.",
       "ru": "Я в семь, но занятия у меня только в девять.",
       "en": "Seven for me, but my classes only start at nine."
      }
     }
    ]
   },
   "explanation": null
  }
 },
 {
  "lesson": "lodz-boss",
  "n": 0,
  "from": {
   "type": "SITUATION",
   "skill": "situation.boss",
   "data": {
    "npc": {
     "name": "Kasia",
     "emoji": "👩🏼",
     "role": {
      "uk": "студентка з Лодзі",
      "ru": "студентка из Лодзи",
      "en": "a student from Łódź"
     }
    },
    "scene": {
     "uk": "Вечір на вулиці Пйотрковській",
     "ru": "Вечер на улице Пётрковской",
     "en": "Evening on Piotrkowska Street"
    },
    "steps": [
     {
      "npc": "Hej! To są moi znajomi: Ola i Piotr.",
      "npcTr": {
       "uk": "Гей! Це мої знайомі: Оля і Пйотр.",
       "ru": "Привет! Это мои знакомые: Оля и Пётр.",
       "en": "Hey! These are my friends Ola and Piotr."
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Miło mi! Oni są z Łodzi?",
        "tr": {
         "uk": "Приємно! Вони з Лодзі?",
         "ru": "Приятно! Они из Лодзи?",
         "en": "Nice to meet you! Are they from Łódź?"
        }
       },
       {
        "id": "s0o1",
        "text": "Miło mi! One są z Łodzi?",
        "tr": {
         "uk": "(у групі є чоловік)",
         "ru": "(в группе есть мужчина)",
         "en": "(a man is in the group)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "Ola i Piotr — **oni**.",
       "ru": "Ola i Piotr — **oni**.",
       "en": "Ola and Piotr — **oni**."
      }
     },
     {
      "npc": "Tak! Piotr jest lekarzem, a Ola jest studentką. A ty?",
      "npcTr": {
       "uk": "Так! Пйотр лікар, а Оля студентка. А ти?",
       "ru": "Да! Пётр врач, а Оля студентка. А ты?",
       "en": "Yes! Piotr is a doctor and Ola is a student. And you?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Jestem programistą.",
        "tr": {
         "uk": "Я програміст.",
         "ru": "Я программист.",
         "en": "I'm a programmer."
        }
       },
       {
        "id": "s1o1",
        "text": "Jestem programista.",
        "tr": {
         "uk": "(потрібен орудний відмінок)",
         "ru": "(нужен творительный)",
         "en": "(instrumental needed)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "Після **jestem** — **programistą**.",
       "ru": "После **jestem** — **programistą**.",
       "en": "After **jestem** — **programistą**."
      }
     }
    ]
   },
   "explanation": null
  },
  "to": {
   "type": "SITUATION",
   "skill": "situation.boss",
   "data": {
    "npc": {
     "name": "Kasia",
     "emoji": "👩🏼",
     "role": {
      "uk": "студентка з Лодзі",
      "ru": "студентка из Лодзи",
      "en": "a student from Łódź"
     }
    },
    "scene": {
     "uk": "Вечір на вулиці Пйотрковській",
     "ru": "Вечер на улице Пётрковской",
     "en": "Evening on Piotrkowska Street"
    },
    "steps": [
     {
      "npc": "Hej! To są moi znajomi: Ola i Piotr.",
      "npcTr": {
       "uk": "Гей! Це мої знайомі: Оля і Пйотр.",
       "ru": "Привет! Это мои знакомые: Оля и Пётр.",
       "en": "Hey! These are my friends Ola and Piotr."
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Miło mi! Oni są z Łodzi?",
        "tr": {
         "uk": "Приємно! Вони з Лодзі?",
         "ru": "Приятно! Они из Лодзи?",
         "en": "Nice to meet you! Are they from Łódź?"
        }
       },
       {
        "id": "s0o1",
        "text": "Miło mi! One są z Łodzi?",
        "tr": {
         "uk": "(у групі є чоловік)",
         "ru": "(в группе есть мужчина)",
         "en": "(a man is in the group)"
        }
       },
       {
        "id": "s0o2",
        "text": "Miło mi! On jest z Łodzi?",
        "tr": {
         "uk": "(двоє людей: **oni są**; **on jest** — «він є»)",
         "ru": "(двое людей: **oni są**; **on jest** — «он есть»)",
         "en": "(two people: **oni są**; **on jest** means “he is”)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "Ola i Piotr — **oni**.",
       "ru": "Ola i Piotr — **oni**.",
       "en": "Ola and Piotr — **oni**."
      }
     },
     {
      "npc": "Tak! Piotr jest lekarzem, a Ola jest studentką. A ty?",
      "npcTr": {
       "uk": "Так! Пйотр лікар, а Оля студентка. А ти?",
       "ru": "Да! Пётр врач, а Оля студентка. А ты?",
       "en": "Yes! Piotr is a doctor and Ola is a student. And you?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Jestem programistą.",
        "tr": {
         "uk": "Я програміст.",
         "ru": "Я программист.",
         "en": "I'm a programmer."
        }
       },
       {
        "id": "s1o1",
        "text": "Jestem programista.",
        "tr": {
         "uk": "(потрібен орудний відмінок)",
         "ru": "(нужен творительный)",
         "en": "(instrumental needed)"
        }
       },
       {
        "id": "s1o2",
        "text": "Jesteś programistą.",
        "tr": {
         "uk": "(про себе — **jestem**; **jesteś** — «ти»)",
         "ru": "(о себе — **jestem**; **jesteś** — «ты»)",
         "en": "(about yourself — **jestem**; **jesteś** means “you are”)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "Після **jestem** — **programistą**.",
       "ru": "После **jestem** — **programistą**.",
       "en": "After **jestem** — **programistą**."
      }
     }
    ]
   },
   "explanation": null
  }
 },
 {
  "lesson": "krk-r1-miasto",
  "n": 15,
  "from": {
   "type": "DIALOGUE",
   "skill": "dialogue.city",
   "data": {
    "npc": {
     "name": "Kasia",
     "emoji": "👩🏻‍🦰",
     "role": {
      "uk": "подруга з Кракова",
      "ru": "подруга из Кракова",
      "en": "a friend from Kraków"
     }
    },
    "steps": [
     {
      "npc": "Zobacz! To jest Rynek Główny.",
      "npcTr": {
       "uk": "Дивись! Це Головна ринкова площа.",
       "ru": "Смотри! Это Главная рыночная площадь.",
       "en": "Look! This is the Main Market Square."
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Wow! A co to jest?",
        "tr": {
         "uk": "Ого! А що це?",
         "ru": "Ого! А что это?",
         "en": "Wow! And what is that?"
        }
       },
       {
        "id": "s0o1",
        "text": "Wow! A kto to jest?",
        "tr": {
         "uk": "Ого! А хто це?",
         "ru": "Ого! А кто это?",
         "en": "Wow! And who is that?"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "Про будівлі й місця питають **co** — що: **A co to jest?** **Kto** — про людей.",
       "ru": "О зданиях и местах спрашивают **co** — что: **A co to jest?** **Kto** — о людях.",
       "en": "For buildings and places ask **co** (what): **A co to jest?** **Kto** is for people."
      }
     },
     {
      "npc": "To jest Kościół Mariacki. A tam są Sukiennice.",
      "npcTr": {
       "uk": "Це Маріацький костел. А там Сукенниці.",
       "ru": "Это Мариацкий костёл. А там Суконные ряды.",
       "en": "This is St. Mary's. And over there is the Cloth Hall."
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Super! A gdzie jest pomnik Mickiewicza?",
        "tr": {
         "uk": "Супер! А де пам'ятник Міцкевичу?",
         "ru": "Супер! А где памятник Мицкевичу?",
         "en": "Great! And where is the Mickiewicz monument?"
        }
       },
       {
        "id": "s1o1",
        "text": "Super! A gdzie są pomnik Mickiewicza?",
        "tr": {
         "uk": "Супер! А де пам'ятник Міцкевичу? (з помилкою)",
         "ru": "Супер! А где памятник Мицкевичу? (с ошибкой)",
         "en": "Great! And where is the Mickiewicz monument? (a mistake)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "Пам'ятник один — **Gdzie jest pomnik…?** **Gdzie są…?** — коли питаєш про кілька (Gdzie są Sukiennice?).",
       "ru": "Памятник один — **Gdzie jest pomnik…?** **Gdzie są…?** — когда спрашиваешь о нескольких (Gdzie są Sukiennice?).",
       "en": "One monument: **Gdzie jest pomnik…?** Use **Gdzie są…?** for plurals (Gdzie są Sukiennice?)."
      }
     },
     {
      "npc": "Tam, przed Sukiennicami. Chodź!",
      "npcTr": {
       "uk": "Там, перед Сукенницями. Ходімо!",
       "ru": "Там, перед Суконными рядами. Пойдём!",
       "en": "Over there, in front of the Cloth Hall. Come on!"
      }
     }
    ]
   },
   "explanation": null
  },
  "to": {
   "type": "DIALOGUE",
   "skill": "dialogue.city",
   "data": {
    "npc": {
     "name": "Kasia",
     "emoji": "👩🏻‍🦰",
     "role": {
      "uk": "подруга з Кракова",
      "ru": "подруга из Кракова",
      "en": "a friend from Kraków"
     }
    },
    "steps": [
     {
      "npc": "Zobacz! To jest Rynek Główny.",
      "npcTr": {
       "uk": "Дивись! Це Головна ринкова площа.",
       "ru": "Смотри! Это Главная рыночная площадь.",
       "en": "Look! This is the Main Market Square."
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Wow! A co to jest?",
        "tr": {
         "uk": "Ого! А що це?",
         "ru": "Ого! А что это?",
         "en": "Wow! And what is that?"
        }
       },
       {
        "id": "s0o1",
        "text": "Wow! A kto to jest?",
        "tr": {
         "uk": "Ого! А хто це?",
         "ru": "Ого! А кто это?",
         "en": "Wow! And who is that?"
        }
       },
       {
        "id": "s0o2",
        "text": "Wow! A co to są?",
        "tr": {
         "uk": "(**to jest** — про одну річ: **co to jest?**)",
         "ru": "(**to jest** — об одной вещи: **co to jest?**)",
         "en": "(for one thing say **co to jest?**)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "Про будівлі й місця питають **co** — що: **A co to jest?** **Kto** — про людей.",
       "ru": "О зданиях и местах спрашивают **co** — что: **A co to jest?** **Kto** — о людях.",
       "en": "For buildings and places ask **co** (what): **A co to jest?** **Kto** is for people."
      }
     },
     {
      "npc": "To jest Kościół Mariacki. A tam są Sukiennice.",
      "npcTr": {
       "uk": "Це Маріацький костел. А там Сукенниці.",
       "ru": "Это Мариацкий костёл. А там Суконные ряды.",
       "en": "This is St. Mary's. And over there is the Cloth Hall."
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Super! A gdzie jest pomnik Mickiewicza?",
        "tr": {
         "uk": "Супер! А де пам'ятник Міцкевичу?",
         "ru": "Супер! А где памятник Мицкевичу?",
         "en": "Great! And where is the Mickiewicz monument?"
        }
       },
       {
        "id": "s1o1",
        "text": "Super! A gdzie są pomnik Mickiewicza?",
        "tr": {
         "uk": "Супер! А де пам'ятник Міцкевичу? (з помилкою)",
         "ru": "Супер! А где памятник Мицкевичу? (с ошибкой)",
         "en": "Great! And where is the Mickiewicz monument? (a mistake)"
        }
       },
       {
        "id": "s1o2",
        "text": "Super! A gdzie jest pomnika Mickiewicza?",
        "tr": {
         "uk": "(**jest** + називний: **pomnik**)",
         "ru": "(**jest** + именительный: **pomnik**)",
         "en": "(**jest** takes the nominative: **pomnik**)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "Пам'ятник один — **Gdzie jest pomnik…?** **Gdzie są…?** — коли питаєш про кілька (Gdzie są Sukiennice?).",
       "ru": "Памятник один — **Gdzie jest pomnik…?** **Gdzie są…?** — когда спрашиваешь о нескольких (Gdzie są Sukiennice?).",
       "en": "One monument: **Gdzie jest pomnik…?** Use **Gdzie są…?** for plurals (Gdzie są Sukiennice?)."
      }
     },
     {
      "npc": "Tam, przed Sukiennicami. Chodź!",
      "npcTr": {
       "uk": "Там, перед Сукенницями. Ходімо!",
       "ru": "Там, перед Суконными рядами. Пойдём!",
       "en": "Over there, in front of the Cloth Hall. Come on!"
      }
     }
    ]
   },
   "explanation": null
  }
 },
 {
  "lesson": "krk-r2-orientacja",
  "n": 15,
  "from": {
   "type": "DIALOGUE",
   "skill": "dialogue.meeting",
   "data": {
    "npc": {
     "name": "Kasia",
     "emoji": "👩🏻‍🦰",
     "role": {
      "uk": "подруга з Кракова",
      "ru": "подруга из Кракова",
      "en": "a friend from Kraków"
     }
    },
    "steps": [
     {
      "npc": "Halo? Gdzie jesteś? Czekam przy pomniku.",
      "npcTr": {
       "uk": "Алло? Де ти? Я чекаю біля пам'ятника.",
       "ru": "Алло? Где ты? Я жду у памятника.",
       "en": "Hello? Where are you? I'm waiting by the monument."
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Jestem obok kawiarni, naprzeciwko ratusza.",
        "tr": {
         "uk": "Я поруч із кав'ярнею, навпроти ратуші.",
         "ru": "Я рядом с кафе, напротив ратуши.",
         "en": "I'm next to the café, opposite the town hall."
        }
       },
       {
        "id": "s0o1",
        "text": "Jestem obok kawiarnia, naprzeciwko ratusz.",
        "tr": {
         "uk": "Я поруч із кав'ярнею, навпроти ратуші. (з помилкою)",
         "ru": "Я рядом с кафе, напротив ратуши. (с ошибкой)",
         "en": "I'm next to the café, opposite the town hall. (a mistake)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "Після **obok** і **naprzeciwko** — родовий відмінок: **obok kawiarni, naprzeciwko ratusza**.",
       "ru": "После **obok** и **naprzeciwko** — родительный падеж: **obok kawiarni, naprzeciwko ratusza**.",
       "en": "After **obok** and **naprzeciwko** use the genitive: **obok kawiarni, naprzeciwko ratusza**."
      }
     },
     {
      "npc": "Super, to blisko! Idę do ciebie.",
      "npcTr": {
       "uk": "Супер, це близько! Іду до тебе.",
       "ru": "Супер, это близко! Иду к тебе.",
       "en": "Great, that's close! I'm coming to you."
      }
     }
    ]
   },
   "explanation": null
  },
  "to": {
   "type": "DIALOGUE",
   "skill": "dialogue.meeting",
   "data": {
    "npc": {
     "name": "Kasia",
     "emoji": "👩🏻‍🦰",
     "role": {
      "uk": "подруга з Кракова",
      "ru": "подруга из Кракова",
      "en": "a friend from Kraków"
     }
    },
    "steps": [
     {
      "npc": "Halo? Gdzie jesteś? Czekam przy pomniku.",
      "npcTr": {
       "uk": "Алло? Де ти? Я чекаю біля пам'ятника.",
       "ru": "Алло? Где ты? Я жду у памятника.",
       "en": "Hello? Where are you? I'm waiting by the monument."
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Jestem obok kawiarni, naprzeciwko ratusza.",
        "tr": {
         "uk": "Я поруч із кав'ярнею, навпроти ратуші.",
         "ru": "Я рядом с кафе, напротив ратуши.",
         "en": "I'm next to the café, opposite the town hall."
        }
       },
       {
        "id": "s0o1",
        "text": "Jestem obok kawiarnia, naprzeciwko ratusz.",
        "tr": {
         "uk": "Я поруч із кав'ярнею, навпроти ратуші. (з помилкою)",
         "ru": "Я рядом с кафе, напротив ратуши. (с ошибкой)",
         "en": "I'm next to the café, opposite the town hall. (a mistake)"
        }
       },
       {
        "id": "s0o2",
        "text": "Jestem obok kawiarni, naprzeciwko ratuszu.",
        "tr": {
         "uk": "(**naprzeciwko** + родовий: **ratusza**)",
         "ru": "(**naprzeciwko** + родительный: **ratusza**)",
         "en": "(**naprzeciwko** takes the genitive: **ratusza**)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "Після **obok** і **naprzeciwko** — родовий відмінок: **obok kawiarni, naprzeciwko ratusza**.",
       "ru": "После **obok** и **naprzeciwko** — родительный падеж: **obok kawiarni, naprzeciwko ratusza**.",
       "en": "After **obok** and **naprzeciwko** use the genitive: **obok kawiarni, naprzeciwko ratusza**."
      }
     },
     {
      "npc": "Super, to blisko! Idę do ciebie.",
      "npcTr": {
       "uk": "Супер, це близько! Іду до тебе.",
       "ru": "Супер, это близко! Иду к тебе.",
       "en": "Great, that's close! I'm coming to you."
      }
     }
    ]
   },
   "explanation": null
  }
 },
 {
  "lesson": "krk-r4-droga",
  "n": 8,
  "from": {
   "type": "SITUATION",
   "skill": "situation.directions",
   "data": {
    "npc": {
     "name": "Pani Barbara",
     "emoji": "👩🏻‍🦳",
     "role": {
      "uk": "перехожа",
      "ru": "прохожая",
      "en": "a passer-by"
     }
    },
    "scene": {
     "uk": "Ти на Ринку й хочеш дійти до Вавеля. Звертаєшся до перехожої: «Przepraszam…»",
     "ru": "Ты на Рынке и хочешь дойти до Вавеля. Обращаешься к прохожей: «Przepraszam…»",
     "en": "You're on the square and want to get to Wawel. You approach a passer-by: \"Przepraszam…\""
    },
    "steps": [
     {
      "npc": "Tak, słucham?",
      "npcTr": {
       "uk": "Так, слухаю?",
       "ru": "Да, слушаю?",
       "en": "Yes?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Przepraszam, jak dojść do Wawelu?",
        "tr": {
         "uk": "Вибачте, як дійти до Вавеля?",
         "ru": "Извините, как дойти до Вавеля?",
         "en": "Excuse me, how do I get to Wawel?"
        }
       },
       {
        "id": "s0o1",
        "text": "Przepraszam, jak dojść do Wawel?",
        "tr": {
         "uk": "Вибачте, як дійти до Вавеля? (з помилкою)",
         "ru": "Извините, как дойти до Вавеля? (с ошибкой)",
         "en": "Excuse me, how do I get to Wawel? (a mistake)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "Після **do** — родовий відмінок: Wawel → **do Wawelu**. Дорогу питають: **Jak dojść do…?**",
       "ru": "После **do** — родительный падеж: Wawel → **do Wawelu**. Дорогу спрашивают: **Jak dojść do…?**",
       "en": "After **do** use the genitive: Wawel → **do Wawelu**. Ask the way: **Jak dojść do…?**"
      }
     },
     {
      "npc": "Proszę iść prosto ulicą Grodzką, a potem skręcić w lewo.",
      "npcTr": {
       "uk": "Ідіть прямо вулицею Ґродзькою, а потім поверніть ліворуч.",
       "ru": "Идите прямо по улице Гродской, а потом поверните налево.",
       "en": "Go straight along Grodzka Street, then turn left."
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Prosto Grodzką i w lewo. Czy to daleko?",
        "tr": {
         "uk": "Прямо Ґродзькою і ліворуч. Це далеко?",
         "ru": "Прямо по Гродской и налево. Это далеко?",
         "en": "Straight along Grodzka and left. Is it far?"
        }
       },
       {
        "id": "s1o1",
        "text": "W prawo przez most? Dziękuję.",
        "tr": {
         "uk": "Праворуч через міст? Дякую.",
         "ru": "Направо через мост? Спасибо.",
         "en": "Right over the bridge? Thanks."
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "Пані сказала: **prosto ulicą Grodzką**, потім **w lewo**.",
       "ru": "Пани сказала: **prosto ulicą Grodzką**, потом **w lewo**.",
       "en": "She said: **prosto ulicą Grodzką**, then **w lewo**."
      }
     },
     {
      "npc": "Nie, jakieś dziesięć minut pieszo.",
      "npcTr": {
       "uk": "Ні, хвилин десять пішки.",
       "ru": "Нет, минут десять пешком.",
       "en": "No, about ten minutes on foot."
      },
      "options": [
       {
        "id": "s2o0",
        "text": "Dziękuję bardzo za pomoc!",
        "tr": {
         "uk": "Дуже дякую за допомогу!",
         "ru": "Большое спасибо за помощь!",
         "en": "Thank you very much for your help!"
        }
       },
       {
        "id": "s2o1",
        "text": "Nie ma za co!",
        "tr": {
         "uk": "Нема за що!",
         "ru": "Не за что!",
         "en": "You're welcome!"
        }
       }
      ],
      "answer": "s2o0",
      "feedback": {
       "uk": "**Nie ma za co** кажуть у відповідь на подяку. Тобі допомогли — подякуй: **Dziękuję za pomoc!**",
       "ru": "**Nie ma za co** говорят в ответ на благодарность. Тебе помогли — поблагодари: **Dziękuję za pomoc!**",
       "en": "**Nie ma za co** answers a thank-you. You were helped — say **Dziękuję za pomoc!**"
      }
     },
     {
      "npc": "Nie ma za co. Miłego zwiedzania!",
      "npcTr": {
       "uk": "Нема за що. Приємних екскурсій!",
       "ru": "Не за что. Приятной экскурсии!",
       "en": "You're welcome. Enjoy sightseeing!"
      }
     }
    ]
   },
   "explanation": null
  },
  "to": {
   "type": "SITUATION",
   "skill": "situation.directions",
   "data": {
    "npc": {
     "name": "Pani Barbara",
     "emoji": "👩🏻‍🦳",
     "role": {
      "uk": "перехожа",
      "ru": "прохожая",
      "en": "a passer-by"
     }
    },
    "scene": {
     "uk": "Ти на Ринку й хочеш дійти до Вавеля. Звертаєшся до перехожої: «Przepraszam…»",
     "ru": "Ты на Рынке и хочешь дойти до Вавеля. Обращаешься к прохожей: «Przepraszam…»",
     "en": "You're on the square and want to get to Wawel. You approach a passer-by: \"Przepraszam…\""
    },
    "steps": [
     {
      "npc": "Tak, słucham?",
      "npcTr": {
       "uk": "Так, слухаю?",
       "ru": "Да, слушаю?",
       "en": "Yes?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Przepraszam, jak dojść do Wawelu?",
        "tr": {
         "uk": "Вибачте, як дійти до Вавеля?",
         "ru": "Извините, как дойти до Вавеля?",
         "en": "Excuse me, how do I get to Wawel?"
        }
       },
       {
        "id": "s0o1",
        "text": "Przepraszam, jak dojść do Wawel?",
        "tr": {
         "uk": "Вибачте, як дійти до Вавеля? (з помилкою)",
         "ru": "Извините, как дойти до Вавеля? (с ошибкой)",
         "en": "Excuse me, how do I get to Wawel? (a mistake)"
        }
       },
       {
        "id": "s0o2",
        "text": "Przepraszam, jak dojść w Wawelu?",
        "tr": {
         "uk": "(**dojść do** + родовий: do **Wawelu**)",
         "ru": "(**dojść do** + родительный: do **Wawelu**)",
         "en": "(**dojść do** + genitive: do **Wawelu**)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "Після **do** — родовий відмінок: Wawel → **do Wawelu**. Дорогу питають: **Jak dojść do…?**",
       "ru": "После **do** — родительный падеж: Wawel → **do Wawelu**. Дорогу спрашивают: **Jak dojść do…?**",
       "en": "After **do** use the genitive: Wawel → **do Wawelu**. Ask the way: **Jak dojść do…?**"
      }
     },
     {
      "npc": "Proszę iść prosto ulicą Grodzką, a potem skręcić w lewo.",
      "npcTr": {
       "uk": "Ідіть прямо вулицею Ґродзькою, а потім поверніть ліворуч.",
       "ru": "Идите прямо по улице Гродской, а потом поверните налево.",
       "en": "Go straight along Grodzka Street, then turn left."
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Prosto Grodzką i w lewo. Czy to daleko?",
        "tr": {
         "uk": "Прямо Ґродзькою і ліворуч. Це далеко?",
         "ru": "Прямо по Гродской и налево. Это далеко?",
         "en": "Straight along Grodzka and left. Is it far?"
        }
       },
       {
        "id": "s1o1",
        "text": "W prawo przez most? Dziękuję.",
        "tr": {
         "uk": "Праворуч через міст? Дякую.",
         "ru": "Направо через мост? Спасибо.",
         "en": "Right over the bridge? Thanks."
        }
       },
       {
        "id": "s1o2",
        "text": "Prosto ulica Grodzka i w lewo. Czy to daleko?",
        "tr": {
         "uk": "(**iść** + орудний: **ulicą Grodzką**)",
         "ru": "(**iść** + творительный: **ulicą Grodzką**)",
         "en": "(**iść** along a street takes the instrumental: **ulicą Grodzką**)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "Пані сказала: **prosto ulicą Grodzką**, потім **w lewo**.",
       "ru": "Пани сказала: **prosto ulicą Grodzką**, потом **w lewo**.",
       "en": "She said: **prosto ulicą Grodzką**, then **w lewo**."
      }
     },
     {
      "npc": "Nie, jakieś dziesięć minut pieszo.",
      "npcTr": {
       "uk": "Ні, хвилин десять пішки.",
       "ru": "Нет, минут десять пешком.",
       "en": "No, about ten minutes on foot."
      },
      "options": [
       {
        "id": "s2o0",
        "text": "Dziękuję bardzo za pomoc!",
        "tr": {
         "uk": "Дуже дякую за допомогу!",
         "ru": "Большое спасибо за помощь!",
         "en": "Thank you very much for your help!"
        }
       },
       {
        "id": "s2o1",
        "text": "Nie ma za co!",
        "tr": {
         "uk": "Нема за що!",
         "ru": "Не за что!",
         "en": "You're welcome!"
        }
       },
       {
        "id": "s2o2",
        "text": "Dziękuję bardzo na pomoc!",
        "tr": {
         "uk": "(**dziękować za** + знахідний: za **pomoc**)",
         "ru": "(**dziękować za** + винительный: za **pomoc**)",
         "en": "(**dziękować za** + accusative: za **pomoc**)"
        }
       }
      ],
      "answer": "s2o0",
      "feedback": {
       "uk": "**Nie ma za co** кажуть у відповідь на подяку. Тобі допомогли — подякуй: **Dziękuję za pomoc!**",
       "ru": "**Nie ma za co** говорят в ответ на благодарность. Тебе помогли — поблагодари: **Dziękuję za pomoc!**",
       "en": "**Nie ma za co** answers a thank-you. You were helped — say **Dziękuję za pomoc!**"
      }
     },
     {
      "npc": "Nie ma za co. Miłego zwiedzania!",
      "npcTr": {
       "uk": "Нема за що. Приємних екскурсій!",
       "ru": "Не за что. Приятной экскурсии!",
       "en": "You're welcome. Enjoy sightseeing!"
      }
     }
    ]
   },
   "explanation": null
  }
 },
 {
  "lesson": "krk-2-mam",
  "n": 8,
  "from": {
   "type": "DIALOGUE",
   "skill": "dialogue.family",
   "data": {
    "npc": {
     "name": "Kasia",
     "emoji": "👩🏻‍🦰",
     "role": {
      "uk": "подруга з Кракова",
      "ru": "подруга из Кракова",
      "en": "a friend from Kraków"
     }
    },
    "steps": [
     {
      "npc": "Masz rodzeństwo?",
      "npcTr": {
       "uk": "У тебе є брати чи сестри?",
       "ru": "У тебя есть братья или сёстры?",
       "en": "Do you have siblings?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Tak, mam brata.",
        "tr": {
         "uk": "Так, у мене є брат.",
         "ru": "Да, у меня есть брат.",
         "en": "Yes, I have a brother."
        }
       },
       {
        "id": "s0o1",
        "text": "Tak, mam brat.",
        "tr": {
         "uk": "(помилка у відмінку)",
         "ru": "(ошибка в падеже)",
         "en": "(case error)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "Після **mam** треба знахідний відмінок: **brata**.",
       "ru": "После **mam** нужен винительный падеж: **brata**.",
       "en": "After **mam** use the accusative: **brata**."
      }
     },
     {
      "npc": "A ile on ma lat?",
      "npcTr": {
       "uk": "А скільки йому років?",
       "ru": "А сколько ему лет?",
       "en": "And how old is he?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "On ma piętnaście lat.",
        "tr": {
         "uk": "Йому п'ятнадцять років.",
         "ru": "Ему пятнадцать лет.",
         "en": "He is fifteen."
        }
       },
       {
        "id": "s1o1",
        "text": "On jest piętnaście.",
        "tr": {
         "uk": "(неправильно)",
         "ru": "(неправильно)",
         "en": "(incorrect)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "Вік: **on ma … lat**.",
       "ru": "Возраст: **on ma … lat**.",
       "en": "Age: **on ma … lat**."
      }
     }
    ]
   },
   "explanation": null
  },
  "to": {
   "type": "DIALOGUE",
   "skill": "dialogue.family",
   "data": {
    "npc": {
     "name": "Kasia",
     "emoji": "👩🏻‍🦰",
     "role": {
      "uk": "подруга з Кракова",
      "ru": "подруга из Кракова",
      "en": "a friend from Kraków"
     }
    },
    "steps": [
     {
      "npc": "Masz rodzeństwo?",
      "npcTr": {
       "uk": "У тебе є брати чи сестри?",
       "ru": "У тебя есть братья или сёстры?",
       "en": "Do you have siblings?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Tak, mam brata.",
        "tr": {
         "uk": "Так, у мене є брат.",
         "ru": "Да, у меня есть брат.",
         "en": "Yes, I have a brother."
        }
       },
       {
        "id": "s0o1",
        "text": "Tak, mam brat.",
        "tr": {
         "uk": "(помилка у відмінку)",
         "ru": "(ошибка в падеже)",
         "en": "(case error)"
        }
       },
       {
        "id": "s0o2",
        "text": "Tak, jestem brata.",
        "tr": {
         "uk": "(**mam** + знахідний: **mam brata**; **jestem** — «я є»)",
         "ru": "(**mam** + винительный: **mam brata**; **jestem** — «я есть»)",
         "en": "(**mam** + accusative: **mam brata**; **jestem** means “I am”)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "Після **mam** треба знахідний відмінок: **brata**.",
       "ru": "После **mam** нужен винительный падеж: **brata**.",
       "en": "After **mam** use the accusative: **brata**."
      }
     },
     {
      "npc": "A ile on ma lat?",
      "npcTr": {
       "uk": "А скільки йому років?",
       "ru": "А сколько ему лет?",
       "en": "And how old is he?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "On ma piętnaście lat.",
        "tr": {
         "uk": "Йому п'ятнадцять років.",
         "ru": "Ему пятнадцать лет.",
         "en": "He is fifteen."
        }
       },
       {
        "id": "s1o1",
        "text": "On jest piętnaście.",
        "tr": {
         "uk": "(неправильно)",
         "ru": "(неправильно)",
         "en": "(incorrect)"
        }
       },
       {
        "id": "s1o2",
        "text": "On ma piętnaście rok.",
        "tr": {
         "uk": "(після 5–21 — **lat**: piętnaście **lat**)",
         "ru": "(после 5–21 — **lat**: piętnaście **lat**)",
         "en": "(after 5–21 use **lat**: piętnaście **lat**)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "Вік: **on ma … lat**.",
       "ru": "Возраст: **on ma … lat**.",
       "en": "Age: **on ma … lat**."
      }
     }
    ]
   },
   "explanation": null
  }
 },
 {
  "lesson": "krk-boss",
  "n": 9,
  "from": {
   "type": "DIALOGUE",
   "skill": "dialogue.boss",
   "data": {
    "npc": {
     "name": "Babcia Zosia",
     "emoji": "👵🏻",
     "role": {
      "uk": "бабуся Касі",
      "ru": "бабушка Каси",
      "en": "Kasia's grandma"
     }
    },
    "steps": [
     {
      "npc": "Dzień dobry, kochanie! Jesteś głodny?",
      "npcTr": {
       "uk": "Добрий день, любий! Ти голодний?",
       "ru": "Добрый день, дорогой! Ты голоден?",
       "en": "Hello, dear! Are you hungry?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Tak, jestem bardzo głodny!",
        "tr": {
         "uk": "Так, я дуже голодний!",
         "ru": "Да, я очень голоден!",
         "en": "Yes, I'm very hungry!"
        }
       },
       {
        "id": "s0o1",
        "text": "Tak, mam bardzo głodny!",
        "tr": {
         "uk": "(помилка: mam замість jestem)",
         "ru": "(ошибка: mam вместо jestem)",
         "en": "(error: mam instead of jestem)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "Стан виражаємо через **być**: Jestem głodny.",
       "ru": "Состояние выражаем через **być**: Jestem głodny.",
       "en": "States use **być**: Jestem głodny."
      }
     },
     {
      "npc": "Masz rodzeństwo?",
      "npcTr": {
       "uk": "У тебе є брати чи сестри?",
       "ru": "У тебя есть братья или сёстры?",
       "en": "Do you have siblings?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Mam siostrę.",
        "tr": {
         "uk": "У мене є сестра.",
         "ru": "У меня есть сестра.",
         "en": "I have a sister."
        }
       },
       {
        "id": "s1o1",
        "text": "Mam siostra.",
        "tr": {
         "uk": "(помилка у відмінку)",
         "ru": "(ошибка в падеже)",
         "en": "(case error)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "Після **mam**: **siostrę**.",
       "ru": "После **mam**: **siostrę**.",
       "en": "After **mam**: **siostrę**."
      }
     },
     {
      "npc": "Smacznego!",
      "npcTr": {
       "uk": "Смачного!",
       "ru": "Приятного аппетита!",
       "en": "Enjoy your meal!"
      },
      "options": [
       {
        "id": "s2o0",
        "text": "Dziękuję, babciu!",
        "tr": {
         "uk": "Дякую, бабусю!",
         "ru": "Спасибо, бабушка!",
         "en": "Thank you, grandma!"
        }
       },
       {
        "id": "s2o1",
        "text": "Proszę bardzo, babciu!",
        "tr": {
         "uk": "Прошу, бабусю!",
         "ru": "Пожалуйста, бабушка!",
         "en": "You're welcome, grandma!"
        }
       }
      ],
      "answer": "s2o0",
      "feedback": {
       "uk": "**Proszę bardzo** — відповідь на «дякую». На «Smacznego!» кажуть **Dziękuję!** (а якщо їсте разом — **Nawzajem!**).",
       "ru": "**Proszę bardzo** — ответ на «спасибо». На «Smacznego!» отвечают **Dziękuję!** (а если едите вместе — **Nawzajem!**).",
       "en": "**Proszę bardzo** answers a thank-you. Reply to \"Smacznego!\" with **Dziękuję!** (or **Nawzajem!** if you eat together)."
      }
     }
    ]
   },
   "explanation": null
  },
  "to": {
   "type": "DIALOGUE",
   "skill": "dialogue.boss",
   "data": {
    "npc": {
     "name": "Babcia Zosia",
     "emoji": "👵🏻",
     "role": {
      "uk": "бабуся Касі",
      "ru": "бабушка Каси",
      "en": "Kasia's grandma"
     }
    },
    "steps": [
     {
      "npc": "Dzień dobry, kochanie! Jesteś głodny?",
      "npcTr": {
       "uk": "Добрий день, любий! Ти голодний?",
       "ru": "Добрый день, дорогой! Ты голоден?",
       "en": "Hello, dear! Are you hungry?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Tak, jestem bardzo głodny!",
        "tr": {
         "uk": "Так, я дуже голодний!",
         "ru": "Да, я очень голоден!",
         "en": "Yes, I'm very hungry!"
        }
       },
       {
        "id": "s0o1",
        "text": "Tak, mam bardzo głodny!",
        "tr": {
         "uk": "(помилка: mam замість jestem)",
         "ru": "(ошибка: mam вместо jestem)",
         "en": "(error: mam instead of jestem)"
        }
       },
       {
        "id": "s0o2",
        "text": "Tak, jestem bardzo głodna!",
        "tr": {
         "uk": "(Бобек — чоловік: **głodny**; **głodna** — про жінку)",
         "ru": "(Бобек — мужчина: **głodny**; **głodna** — о женщине)",
         "en": "(Bobek is a man: **głodny**; **głodna** is feminine)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "Стан виражаємо через **być**: Jestem głodny.",
       "ru": "Состояние выражаем через **być**: Jestem głodny.",
       "en": "States use **być**: Jestem głodny."
      }
     },
     {
      "npc": "Masz rodzeństwo?",
      "npcTr": {
       "uk": "У тебе є брати чи сестри?",
       "ru": "У тебя есть братья или сёстры?",
       "en": "Do you have siblings?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Mam siostrę.",
        "tr": {
         "uk": "У мене є сестра.",
         "ru": "У меня есть сестра.",
         "en": "I have a sister."
        }
       },
       {
        "id": "s1o1",
        "text": "Mam siostra.",
        "tr": {
         "uk": "(помилка у відмінку)",
         "ru": "(ошибка в падеже)",
         "en": "(case error)"
        }
       },
       {
        "id": "s1o2",
        "text": "Mam siostrą.",
        "tr": {
         "uk": "(**mam** + знахідний: **siostrę**)",
         "ru": "(**mam** + винительный: **siostrę**)",
         "en": "(**mam** takes the accusative: **siostrę**)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "Після **mam**: **siostrę**.",
       "ru": "После **mam**: **siostrę**.",
       "en": "After **mam**: **siostrę**."
      }
     },
     {
      "npc": "Smacznego!",
      "npcTr": {
       "uk": "Смачного!",
       "ru": "Приятного аппетита!",
       "en": "Enjoy your meal!"
      },
      "options": [
       {
        "id": "s2o0",
        "text": "Dziękuję, babciu!",
        "tr": {
         "uk": "Дякую, бабусю!",
         "ru": "Спасибо, бабушка!",
         "en": "Thank you, grandma!"
        }
       },
       {
        "id": "s2o1",
        "text": "Proszę bardzo, babciu!",
        "tr": {
         "uk": "Прошу, бабусю!",
         "ru": "Пожалуйста, бабушка!",
         "en": "You're welcome, grandma!"
        }
       },
       {
        "id": "s2o2",
        "text": "Dziękuję, babcia!",
        "tr": {
         "uk": "(звертання — кличний: **babciu**)",
         "ru": "(обращение — звательный падеж: **babciu**)",
         "en": "(when addressing someone use the vocative: **babciu**)"
        }
       }
      ],
      "answer": "s2o0",
      "feedback": {
       "uk": "**Proszę bardzo** — відповідь на «дякую». На «Smacznego!» кажуть **Dziękuję!** (а якщо їсте разом — **Nawzajem!**).",
       "ru": "**Proszę bardzo** — ответ на «спасибо». На «Smacznego!» отвечают **Dziękuję!** (а если едите вместе — **Nawzajem!**).",
       "en": "**Proszę bardzo** answers a thank-you. Reply to \"Smacznego!\" with **Dziękuję!** (or **Nawzajem!** if you eat together)."
      }
     }
    ]
   },
   "explanation": null
  }
 },
 {
  "lesson": "kat-1-transport",
  "n": 0,
  "from": {
   "type": "DIALOGUE",
   "skill": "dialogue.transport",
   "data": {
    "npc": {
     "name": "Zosia",
     "emoji": "👩🏻",
     "role": {
      "uk": "колега з роботи",
      "ru": "коллега с работы",
      "en": "a colleague"
     }
    },
    "steps": [
     {
      "npc": "Cześć! Jak jedziesz jutro do pracy?",
      "npcTr": {
       "uk": "Привіт! Як ти завтра їдеш на роботу?",
       "ru": "Привет! Как ты завтра едешь на работу?",
       "en": "Hi! How are you getting to work tomorrow?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Jadę tramwajem.",
        "tr": {
         "uk": "Їду трамваєм.",
         "ru": "Еду на трамвае.",
         "en": "By tram."
        }
       },
       {
        "id": "s0o1",
        "text": "Jadę tramwaj.",
        "tr": {
         "uk": "(потрібен орудний відмінок)",
         "ru": "(нужен творительный падеж)",
         "en": "(instrumental needed)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "Чим? — **tramwajem** (орудний).",
       "ru": "На чём? — **tramwajem** (творительный).",
       "en": "By what? — **tramwajem**."
      }
     },
     {
      "npc": "A w sobotę? Jedziesz na wakacje?",
      "npcTr": {
       "uk": "А в суботу? Їдеш у відпустку?",
       "ru": "А в субботу? Едешь в отпуск?",
       "en": "And on Saturday? Going on holiday?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Tak, jadę samochodem na wakacje.",
        "tr": {
         "uk": "Так, їду машиною у відпустку.",
         "ru": "Да, еду на машине в отпуск.",
         "en": "Yes, I'm driving on holiday."
        }
       },
       {
        "id": "s1o1",
        "text": "Tak, jadę samochodem do wakacji.",
        "tr": {
         "uk": "(з wakacje вживають na)",
         "ru": "(с wakacje употребляют na)",
         "en": "(wakacje takes na)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "Усталене сполучення: **na wakacje**.",
       "ru": "Устойчивое сочетание: **na wakacje**.",
       "en": "Fixed phrase: **na wakacje**."
      }
     }
    ]
   },
   "explanation": null
  },
  "to": {
   "type": "DIALOGUE",
   "skill": "dialogue.transport",
   "data": {
    "npc": {
     "name": "Zosia",
     "emoji": "👩🏻",
     "role": {
      "uk": "колега з роботи",
      "ru": "коллега с работы",
      "en": "a colleague"
     }
    },
    "steps": [
     {
      "npc": "Cześć! Jak jedziesz jutro do pracy?",
      "npcTr": {
       "uk": "Привіт! Як ти завтра їдеш на роботу?",
       "ru": "Привет! Как ты завтра едешь на работу?",
       "en": "Hi! How are you getting to work tomorrow?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Jadę tramwajem.",
        "tr": {
         "uk": "Їду трамваєм.",
         "ru": "Еду на трамвае.",
         "en": "By tram."
        }
       },
       {
        "id": "s0o1",
        "text": "Jadę tramwaj.",
        "tr": {
         "uk": "(потрібен орудний відмінок)",
         "ru": "(нужен творительный падеж)",
         "en": "(instrumental needed)"
        }
       },
       {
        "id": "s0o2",
        "text": "Jadę z tramwajem.",
        "tr": {
         "uk": "(**чим?** — орудний без **z**: **tramwajem**; **z tramwajem** — «з трамваєм»)",
         "ru": "(**чем?** — творительный без **z**: **tramwajem**; **z tramwajem** — «с трамваем»)",
         "en": "(**by what?** — a bare instrumental: **tramwajem**; **z tramwajem** means “with a tram”)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "Чим? — **tramwajem** (орудний).",
       "ru": "На чём? — **tramwajem** (творительный).",
       "en": "By what? — **tramwajem**."
      }
     },
     {
      "npc": "A w sobotę? Jedziesz na wakacje?",
      "npcTr": {
       "uk": "А в суботу? Їдеш у відпустку?",
       "ru": "А в субботу? Едешь в отпуск?",
       "en": "And on Saturday? Going on holiday?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Tak, jadę samochodem na wakacje.",
        "tr": {
         "uk": "Так, їду машиною у відпустку.",
         "ru": "Да, еду на машине в отпуск.",
         "en": "Yes, I'm driving on holiday."
        }
       },
       {
        "id": "s1o1",
        "text": "Tak, jadę samochodem do wakacji.",
        "tr": {
         "uk": "(з wakacje вживають na)",
         "ru": "(с wakacje употребляют na)",
         "en": "(wakacje takes na)"
        }
       },
       {
        "id": "s1o2",
        "text": "Tak, jadę samochód na wakacje.",
        "tr": {
         "uk": "(**чим?** — орудний: **samochodem**)",
         "ru": "(**чем?** — творительный: **samochodem**)",
         "en": "(**by what?** — instrumental: **samochodem**)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "Усталене сполучення: **na wakacje**.",
       "ru": "Устойчивое сочетание: **na wakacje**.",
       "en": "Fixed phrase: **na wakacje**."
      }
     }
    ]
   },
   "explanation": null
  }
 },
 {
  "lesson": "kat-2-isc-jechac",
  "n": 0,
  "from": {
   "type": "DIALOGUE",
   "skill": "dialogue.motion",
   "data": {
    "npc": {
     "name": "Tomek",
     "emoji": "🧑🏻",
     "role": {
      "uk": "сусід по квартирі",
      "ru": "сосед по квартире",
      "en": "a flatmate"
     }
    },
    "steps": [
     {
      "npc": "Gdzie idziesz?",
      "npcTr": {
       "uk": "Куди йдеш?",
       "ru": "Куда идёшь?",
       "en": "Where are you going?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Idę do sklepu. Zaraz wracam!",
        "tr": {
         "uk": "Іду в магазин. Зараз повернуся!",
         "ru": "Иду в магазин. Сейчас вернусь!",
         "en": "To the shop. Back soon!"
        }
       },
       {
        "id": "s0o1",
        "text": "Chodzę do sklepu. Zaraz wracam!",
        "tr": {
         "uk": "(chodzić — про регулярні дії)",
         "ru": "(chodzić — о регулярных действиях)",
         "en": "(chodzić is for regular actions)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "Зараз, в один бік — **idę**.",
       "ru": "Сейчас, в одну сторону — **idę**.",
       "en": "Right now — **idę**."
      }
     },
     {
      "npc": "A jutro? Jedziesz do Krakowa?",
      "npcTr": {
       "uk": "А завтра? Їдеш до Кракова?",
       "ru": "А завтра? Едешь в Краков?",
       "en": "And tomorrow? Going to Kraków?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Tak, jadę pociągiem.",
        "tr": {
         "uk": "Так, їду потягом.",
         "ru": "Да, еду на поезде.",
         "en": "Yes, by train."
        }
       },
       {
        "id": "s1o1",
        "text": "Tak, idę pociągiem.",
        "tr": {
         "uk": "(потягом не ходять пішки 🙂)",
         "ru": "(на поезде не ходят пешком 🙂)",
         "en": "(you don't walk by train 🙂)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "Транспортом — **jechać**: jadę pociągiem.",
       "ru": "На транспорте — **jechać**: jadę pociągiem.",
       "en": "By vehicle — **jechać**."
      }
     }
    ]
   },
   "explanation": null
  },
  "to": {
   "type": "DIALOGUE",
   "skill": "dialogue.motion",
   "data": {
    "npc": {
     "name": "Tomek",
     "emoji": "🧑🏻",
     "role": {
      "uk": "сусід по квартирі",
      "ru": "сосед по квартире",
      "en": "a flatmate"
     }
    },
    "steps": [
     {
      "npc": "Gdzie idziesz?",
      "npcTr": {
       "uk": "Куди йдеш?",
       "ru": "Куда идёшь?",
       "en": "Where are you going?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Idę do sklepu. Zaraz wracam!",
        "tr": {
         "uk": "Іду в магазин. Зараз повернуся!",
         "ru": "Иду в магазин. Сейчас вернусь!",
         "en": "To the shop. Back soon!"
        }
       },
       {
        "id": "s0o1",
        "text": "Chodzę do sklepu. Zaraz wracam!",
        "tr": {
         "uk": "(chodzić — про регулярні дії)",
         "ru": "(chodzić — о регулярных действиях)",
         "en": "(chodzić is for regular actions)"
        }
       },
       {
        "id": "s0o2",
        "text": "Idę w sklepie. Zaraz wracam!",
        "tr": {
         "uk": "(куди? — **do** + родовий: **do sklepu**; **w sklepie** — «у магазині», де)",
         "ru": "(куда? — **do** + родительный: **do sklepu**; **w sklepie** — «в магазине», где)",
         "en": "(where to? — **do** + genitive: **do sklepu**; **w sklepie** means “inside the shop”)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "Зараз, в один бік — **idę**.",
       "ru": "Сейчас, в одну сторону — **idę**.",
       "en": "Right now — **idę**."
      }
     },
     {
      "npc": "A jutro? Jedziesz do Krakowa?",
      "npcTr": {
       "uk": "А завтра? Їдеш до Кракова?",
       "ru": "А завтра? Едешь в Краков?",
       "en": "And tomorrow? Going to Kraków?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Tak, jadę pociągiem.",
        "tr": {
         "uk": "Так, їду потягом.",
         "ru": "Да, еду на поезде.",
         "en": "Yes, by train."
        }
       },
       {
        "id": "s1o1",
        "text": "Tak, idę pociągiem.",
        "tr": {
         "uk": "(потягом не ходять пішки 🙂)",
         "ru": "(на поезде не ходят пешком 🙂)",
         "en": "(you don't walk by train 🙂)"
        }
       },
       {
        "id": "s1o2",
        "text": "Tak, jadę pieszo.",
        "tr": {
         "uk": "(**pieszo** — пішки: з **jadę** (їду) не поєднується; пішки — **idę**)",
         "ru": "(**pieszo** — пешком: с **jadę** (еду) не сочетается; пешком — **idę**)",
         "en": "(**pieszo** means on foot: it does not go with **jadę** (travel by vehicle); on foot — **idę**)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "Транспортом — **jechać**: jadę pociągiem.",
       "ru": "На транспорте — **jechać**: jadę pociągiem.",
       "en": "By vehicle — **jechać**."
      }
     }
    ]
   },
   "explanation": null
  }
 },
 {
  "lesson": "kat-3-wiedziec-znac",
  "n": 0,
  "from": {
   "type": "DIALOGUE",
   "skill": "dialogue.wiedziec",
   "data": {
    "npc": {
     "name": "Zosia",
     "emoji": "👩🏻",
     "role": {
      "uk": "колега з роботи",
      "ru": "коллега с работы",
      "en": "a colleague"
     }
    },
    "steps": [
     {
      "npc": "Znasz nowego kierownika?",
      "npcTr": {
       "uk": "Знаєш нового керівника?",
       "ru": "Знаешь нового руководителя?",
       "en": "Do you know the new manager?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Nie, nie znam go.",
        "tr": {
         "uk": "Ні, я його не знаю.",
         "ru": "Нет, я его не знаю.",
         "en": "No, I don't know him."
        }
       },
       {
        "id": "s0o1",
        "text": "Nie, nie wiem go.",
        "tr": {
         "uk": "(людину — znać)",
         "ru": "(человека — znać)",
         "en": "(a person — znać)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "Людину знаємо через **znać**: nie znam go.",
       "ru": "Человека знаем через **znać**.",
       "en": "A person — **znać**."
      }
     },
     {
      "npc": "A wiesz, gdzie jest jego biuro?",
      "npcTr": {
       "uk": "А знаєш, де його кабінет?",
       "ru": "А знаешь, где его кабинет?",
       "en": "And do you know where his office is?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Wiem, na drugim piętrze.",
        "tr": {
         "uk": "Знаю, на другому поверсі.",
         "ru": "Знаю, на втором этаже.",
         "en": "Yes, on the second floor."
        }
       },
       {
        "id": "s1o1",
        "text": "Znam, na drugim piętrze.",
        "tr": {
         "uk": "(факт «де» — wiedzieć)",
         "ru": "(факт «где» — wiedzieć)",
         "en": "(a fact \"where\" — wiedzieć)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "Питання з **gdzie** — це факт → **wiem**.",
       "ru": "Вопрос с **gdzie** — это факт → **wiem**.",
       "en": "A **gdzie** question is a fact → **wiem**."
      }
     }
    ]
   },
   "explanation": null
  },
  "to": {
   "type": "DIALOGUE",
   "skill": "dialogue.wiedziec",
   "data": {
    "npc": {
     "name": "Zosia",
     "emoji": "👩🏻",
     "role": {
      "uk": "колега з роботи",
      "ru": "коллега с работы",
      "en": "a colleague"
     }
    },
    "steps": [
     {
      "npc": "Znasz nowego kierownika?",
      "npcTr": {
       "uk": "Знаєш нового керівника?",
       "ru": "Знаешь нового руководителя?",
       "en": "Do you know the new manager?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Nie, nie znam go.",
        "tr": {
         "uk": "Ні, я його не знаю.",
         "ru": "Нет, я его не знаю.",
         "en": "No, I don't know him."
        }
       },
       {
        "id": "s0o1",
        "text": "Nie, nie wiem go.",
        "tr": {
         "uk": "(людину — znać)",
         "ru": "(человека — znać)",
         "en": "(a person — znać)"
        }
       },
       {
        "id": "s0o2",
        "text": "Tak, nie znam go.",
        "tr": {
         "uk": "(**Tak** — «так, знаю»; «nie znam go» — «не знаю» — суперечність)",
         "ru": "(**Tak** — «да, знаю»; «nie znam go» — «не знаю» — противоречие)",
         "en": "(**Tak** means “yes, I do”; “nie znam go” means “I don’t” — a contradiction)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "Людину знаємо через **znać**: nie znam go.",
       "ru": "Человека знаем через **znać**.",
       "en": "A person — **znać**."
      }
     },
     {
      "npc": "A wiesz, gdzie jest jego biuro?",
      "npcTr": {
       "uk": "А знаєш, де його кабінет?",
       "ru": "А знаешь, где его кабинет?",
       "en": "And do you know where his office is?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Wiem, na drugim piętrze.",
        "tr": {
         "uk": "Знаю, на другому поверсі.",
         "ru": "Знаю, на втором этаже.",
         "en": "Yes, on the second floor."
        }
       },
       {
        "id": "s1o1",
        "text": "Znam, na drugim piętrze.",
        "tr": {
         "uk": "(факт «де» — wiedzieć)",
         "ru": "(факт «где» — wiedzieć)",
         "en": "(a fact \"where\" — wiedzieć)"
        }
       },
       {
        "id": "s1o2",
        "text": "Wiem, na drugie piętro.",
        "tr": {
         "uk": "(де? — **na** + місцевий: na **drugim piętrze**)",
         "ru": "(где? — **na** + предложный: na **drugim piętrze**)",
         "en": "(where? — **na** + locative: na **drugim piętrze**)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "Питання з **gdzie** — це факт → **wiem**.",
       "ru": "Вопрос с **gdzie** — это факт → **wiem**.",
       "en": "A **gdzie** question is a fact → **wiem**."
      }
     }
    ]
   },
   "explanation": null
  }
 },
 {
  "lesson": "kat-3-wiedziec-znac",
  "n": 2,
  "from": {
   "type": "FILL_GAP",
   "skill": "grammar.wiedziec",
   "data": {
    "pl": "___ dobrze Kraków.",
    "translation": {
     "uk": "Я добре знаю Краків.",
     "ru": "Я хорошо знаю Краков.",
     "en": "I know Kraków well."
    },
    "options": [
     {
      "id": "o0",
      "text": "Znam"
     },
     {
      "id": "o1",
      "text": "Wiem"
     },
     {
      "id": "o2",
      "text": "Wiemy"
     }
    ],
    "answer": "o0"
   },
   "explanation": {
    "uk": "Місто (іменник) → **znam**.",
    "ru": "Город (существительное) → **znam**.",
    "en": "A city (noun) → **znam**."
   }
  },
  "to": {
   "type": "FILL_GAP",
   "skill": "grammar.wiedziec",
   "data": {
    "pl": "___ dobrze Kraków.",
    "translation": {
     "uk": "Я добре знаю Краків.",
     "ru": "Я хорошо знаю Краков.",
     "en": "I know Kraków well."
    },
    "options": [
     {
      "id": "o0",
      "text": "Znam"
     },
     {
      "id": "o1",
      "text": "Znasz"
     },
     {
      "id": "o2",
      "text": "Wiem"
     }
    ],
    "answer": "o0"
   },
   "explanation": {
    "uk": "Місто → **znać**; «я» → **znam** (znasz — «ти»).",
    "ru": "Город → **znać**; «я» → **znam** (znasz — «ты»).",
    "en": "A city → **znać**; “I” → **znam** (znasz = “you”)."
   }
  }
 },
 {
  "lesson": "kat-3-wiedziec-znac",
  "n": 3,
  "from": {
   "type": "FILL_GAP",
   "skill": "grammar.wiedziec",
   "data": {
    "pl": "Czy ty ___ język angielski?",
    "translation": {
     "uk": "Ти знаєш англійську?",
     "ru": "Ты знаешь английский?",
     "en": "Do you know English?"
    },
    "options": [
     {
      "id": "o0",
      "text": "znasz"
     },
     {
      "id": "o1",
      "text": "wiesz"
     },
     {
      "id": "o2",
      "text": "wie"
     }
    ],
    "answer": "o0"
   },
   "explanation": {
    "uk": "Мова → **znać**: znasz język angielski.",
    "ru": "Язык → **znać**: znasz język angielski.",
    "en": "A language → **znać**."
   }
  },
  "to": {
   "type": "FILL_GAP",
   "skill": "grammar.wiedziec",
   "data": {
    "pl": "Czy ty ___ język angielski?",
    "translation": {
     "uk": "Ти знаєш англійську?",
     "ru": "Ты знаешь английский?",
     "en": "Do you know English?"
    },
    "options": [
     {
      "id": "o0",
      "text": "znasz"
     },
     {
      "id": "o1",
      "text": "wiesz"
     },
     {
      "id": "o2",
      "text": "znam"
     }
    ],
    "answer": "o0"
   },
   "explanation": {
    "uk": "Мова → **znać**: znasz język angielski.",
    "ru": "Язык → **znać**: znasz język angielski.",
    "en": "A language → **znać**."
   }
  }
 },
 {
  "lesson": "kat-4-te-ta",
  "n": 1,
  "from": {
   "type": "FILL_GAP",
   "skill": "grammar.te-ta",
   "data": {
    "pl": "Widzę ___ kobietę.",
    "translation": {
     "uk": "Я бачу цю жінку.",
     "ru": "Я вижу эту женщину.",
     "en": "I see this woman."
    },
    "options": [
     {
      "id": "o0",
      "text": "tę"
     },
     {
      "id": "o1",
      "text": "tą"
     },
     {
      "id": "o2",
      "text": "ta"
     }
    ],
    "answer": "o0"
   },
   "explanation": {
    "uk": "Кого? — знахідний → **tę**.",
    "ru": "Кого? — винительный → **tę**.",
    "en": "Whom? — accusative → **tę**."
   }
  },
  "to": {
   "type": "FILL_GAP",
   "skill": "grammar.te-ta",
   "data": {
    "pl": "Widzę ___ kobietę.",
    "translation": {
     "uk": "Я бачу цю жінку.",
     "ru": "Я вижу эту женщину.",
     "en": "I see this woman."
    },
    "options": [
     {
      "id": "o0",
      "text": "tę"
     },
     {
      "id": "o1",
      "text": "ta"
     },
     {
      "id": "o2",
      "text": "tej"
     }
    ],
    "answer": "o0"
   },
   "explanation": {
    "uk": "Кого? — знахідний → **tę**.",
    "ru": "Кого? — винительный → **tę**.",
    "en": "Whom? — accusative → **tę**."
   }
  }
 },
 {
  "lesson": "kat-4-te-ta",
  "n": 4,
  "from": {
   "type": "FILL_GAP",
   "skill": "grammar.te-ta",
   "data": {
    "pl": "Interesuję się ___ książką.",
    "translation": {
     "uk": "Я цікавлюся цією книжкою.",
     "ru": "Я интересуюсь этой книгой.",
     "en": "I'm interested in this book."
    },
    "options": [
     {
      "id": "o0",
      "text": "tą"
     },
     {
      "id": "o1",
      "text": "tę"
     },
     {
      "id": "o2",
      "text": "tej"
     }
    ],
    "answer": "o0"
   },
   "explanation": {
    "uk": "**interesować się** + орудний → **tą**.",
    "ru": "**interesować się** + творительный → **tą**.",
    "en": "**interesować się** + instrumental → **tą**."
   }
  },
  "to": {
   "type": "FILL_GAP",
   "skill": "grammar.te-ta",
   "data": {
    "pl": "Interesuję się ___ książką.",
    "translation": {
     "uk": "Я цікавлюся цією книжкою.",
     "ru": "Я интересуюсь этой книгой.",
     "en": "I'm interested in this book."
    },
    "options": [
     {
      "id": "o0",
      "text": "tą"
     },
     {
      "id": "o1",
      "text": "tę"
     },
     {
      "id": "o2",
      "text": "ta"
     }
    ],
    "answer": "o0"
   },
   "explanation": {
    "uk": "**interesować się** + орудний → **tą**.",
    "ru": "**interesować się** + творительный → **tą**.",
    "en": "**interesować się** + instrumental → **tą**."
   }
  }
 },
 {
  "lesson": "kat-4-te-ta",
  "n": 5,
  "from": {
   "type": "FILL_GAP",
   "skill": "grammar.te-ta",
   "data": {
    "pl": "Lubię ___ piosenkę.",
    "translation": {
     "uk": "Я люблю цю пісню.",
     "ru": "Я люблю эту песню.",
     "en": "I like this song."
    },
    "options": [
     {
      "id": "o0",
      "text": "tę"
     },
     {
      "id": "o1",
      "text": "tą"
     },
     {
      "id": "o2",
      "text": "ta"
     }
    ],
    "answer": "o0"
   },
   "explanation": {
    "uk": "**lubić** + знахідний → **tę** (як: lubię **ten** film).",
    "ru": "**lubić** + винительный → **tę**.",
    "en": "**lubić** + accusative → **tę**."
   }
  },
  "to": {
   "type": "FILL_GAP",
   "skill": "grammar.te-ta",
   "data": {
    "pl": "Lubię ___ piosenkę.",
    "translation": {
     "uk": "Я люблю цю пісню.",
     "ru": "Я люблю эту песню.",
     "en": "I like this song."
    },
    "options": [
     {
      "id": "o0",
      "text": "tę"
     },
     {
      "id": "o1",
      "text": "tej"
     },
     {
      "id": "o2",
      "text": "ta"
     }
    ],
    "answer": "o0"
   },
   "explanation": {
    "uk": "**lubić** + знахідний → **tę** (як: lubię **ten** film).",
    "ru": "**lubić** + винительный → **tę**.",
    "en": "**lubić** + accusative → **tę**."
   }
  }
 },
 {
  "lesson": "kat-5-przyjechac",
  "n": 10,
  "from": {
   "type": "DIALOGUE",
   "skill": "dialogue.travel",
   "data": {
    "npc": {
     "name": "Zosia",
     "emoji": "👩🏻",
     "role": {
      "uk": "колега з роботи",
      "ru": "коллега с работы",
      "en": "a colleague"
     }
    },
    "steps": [
     {
      "npc": "Kiedy przyjedziesz do Katowic?",
      "npcTr": {
       "uk": "Коли ти приїдеш до Катовіце?",
       "ru": "Когда ты приедешь в Катовице?",
       "en": "When will you come to Katowice?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Przyjadę w piątek wieczorem.",
        "tr": {
         "uk": "Приїду в п'ятницю ввечері.",
         "ru": "Приеду в пятницу вечером.",
         "en": "I'll come on Friday evening."
        }
       },
       {
        "id": "s0o1",
        "text": "Wyjadę w piątek wieczorem.",
        "tr": {
         "uk": "(це «виїду», а не «приїду»)",
         "ru": "(это «уеду», а не «приеду»)",
         "en": "(that means \"I'll leave\")"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "**przy-** — прибуття: przyjadę. **wy-** — відправлення.",
       "ru": "**przy-** — прибытие: przyjadę. **wy-** — отправление.",
       "en": "**przy-** is arriving: przyjadę. **wy-** is leaving."
      }
     },
     {
      "npc": "A ile trwa podróż pociągiem?",
      "npcTr": {
       "uk": "А скільки триває поїздка потягом?",
       "ru": "А сколько длится поездка на поезде?",
       "en": "And how long is the trip by train?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Podróż trwa pół godziny.",
        "tr": {
         "uk": "Поїздка триває пів години.",
         "ru": "Поездка длится полчаса.",
         "en": "The trip takes half an hour."
        }
       },
       {
        "id": "s1o1",
        "text": "Podróż idzie pół godziny.",
        "tr": {
         "uk": "(тут потрібне trwa)",
         "ru": "(здесь нужно trwa)",
         "en": "(use trwa here)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "Тривалість — **trwa**: podróż trwa pół godziny.",
       "ru": "Длительность — **trwa**: podróż trwa pół godziny.",
       "en": "For duration use **trwa**."
      }
     }
    ]
   },
   "explanation": null
  },
  "to": {
   "type": "DIALOGUE",
   "skill": "dialogue.travel",
   "data": {
    "npc": {
     "name": "Zosia",
     "emoji": "👩🏻",
     "role": {
      "uk": "колега з роботи",
      "ru": "коллега с работы",
      "en": "a colleague"
     }
    },
    "steps": [
     {
      "npc": "Kiedy przyjedziesz do Katowic?",
      "npcTr": {
       "uk": "Коли ти приїдеш до Катовіце?",
       "ru": "Когда ты приедешь в Катовице?",
       "en": "When will you come to Katowice?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Przyjadę w piątek wieczorem.",
        "tr": {
         "uk": "Приїду в п'ятницю ввечері.",
         "ru": "Приеду в пятницу вечером.",
         "en": "I'll come on Friday evening."
        }
       },
       {
        "id": "s0o1",
        "text": "Wyjadę w piątek wieczorem.",
        "tr": {
         "uk": "(це «виїду», а не «приїду»)",
         "ru": "(это «уеду», а не «приеду»)",
         "en": "(that means \"I'll leave\")"
        }
       },
       {
        "id": "s0o2",
        "text": "Przyjechałem w piątek wieczorem.",
        "tr": {
         "uk": "(питають про майбутнє: **przyjadę**; **przyjechałem** — «приїхав»)",
         "ru": "(спрашивают о будущем: **przyjadę**; **przyjechałem** — «приехал»)",
         "en": "(the question is about the future: **przyjadę**; **przyjechałem** means “I arrived”)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "**przy-** — прибуття: przyjadę. **wy-** — відправлення.",
       "ru": "**przy-** — прибытие: przyjadę. **wy-** — отправление.",
       "en": "**przy-** is arriving: przyjadę. **wy-** is leaving."
      }
     },
     {
      "npc": "A ile trwa podróż pociągiem?",
      "npcTr": {
       "uk": "А скільки триває поїздка потягом?",
       "ru": "А сколько длится поездка на поезде?",
       "en": "And how long is the trip by train?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Podróż trwa pół godziny.",
        "tr": {
         "uk": "Поїздка триває пів години.",
         "ru": "Поездка длится полчаса.",
         "en": "The trip takes half an hour."
        }
       },
       {
        "id": "s1o1",
        "text": "Podróż idzie pół godziny.",
        "tr": {
         "uk": "(тут потрібне trwa)",
         "ru": "(здесь нужно trwa)",
         "en": "(use trwa here)"
        }
       },
       {
        "id": "s1o2",
        "text": "Podróż trwa pół godzinę.",
        "tr": {
         "uk": "(**pół** + родовий: **pół godziny**)",
         "ru": "(**pół** + родительный: **pół godziny**)",
         "en": "(**pół** takes the genitive: **pół godziny**)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "Тривалість — **trwa**: podróż trwa pół godziny.",
       "ru": "Длительность — **trwa**: podróż trwa pół godziny.",
       "en": "For duration use **trwa**."
      }
     }
    ]
   },
   "explanation": null
  }
 },
 {
  "lesson": "kat-7-taksowka",
  "n": 10,
  "from": {
   "type": "SITUATION",
   "skill": "situation.taxi",
   "data": {
    "npc": {
     "name": "Pan Marek",
     "emoji": "🧑🏽",
     "role": {
      "uk": "таксист",
      "ru": "таксист",
      "en": "a taxi driver"
     }
    },
    "scene": {
     "uk": "Ти замовив таксі до аеропорту в Пижовицях.",
     "ru": "Ты заказал такси в аэропорт в Пыжовице.",
     "en": "You booked a taxi to the airport in Pyrzowice."
    },
    "steps": [
     {
      "npc": "Dzień dobry! Dokąd jedziemy?",
      "npcTr": {
       "uk": "Добрий день! Куди їдемо?",
       "ru": "Добрый день! Куда едем?",
       "en": "Hello! Where are we going?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Na lotnisko, proszę.",
        "tr": {
         "uk": "В аеропорт, будь ласка.",
         "ru": "В аэропорт, пожалуйста.",
         "en": "To the airport, please."
        }
       },
       {
        "id": "s0o1",
        "text": "Z lotniska, proszę.",
        "tr": {
         "uk": "(це «з аеропорту»)",
         "ru": "(это «из аэропорта»)",
         "en": "(that means \"from the airport\")"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "Куди? — **na lotnisko**. **Z lotniska** — звідки.",
       "ru": "Куда? — **na lotnisko**. **Z lotniska** — откуда.",
       "en": "Where to? — **na lotnisko**. **Z lotniska** means \"from\"."
      }
     },
     {
      "npc": "Jesteśmy na miejscu. Razem trzydzieści pięć złotych.",
      "npcTr": {
       "uk": "Ми на місці. Разом тридцять п'ять злотих.",
       "ru": "Мы на месте. Итого тридцать пять злотых.",
       "en": "We're here. Thirty-five złoty in total."
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Dziękuję. Reszty nie trzeba.",
        "tr": {
         "uk": "Дякую. Решти не треба.",
         "ru": "Спасибо. Сдачи не надо.",
         "en": "Thank you. Keep the change."
        }
       },
       {
        "id": "s1o1",
        "text": "Dziękuję. Reszta nie trzeba.",
        "tr": {
         "uk": "(після «nie trzeba» — родовий)",
         "ru": "(после «nie trzeba» — родительный)",
         "en": "(use the genitive after \"nie trzeba\")"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "Після заперечення **nie trzeba** — родовий: reszta → **reszty**.",
       "ru": "После отрицания **nie trzeba** — родительный: reszta → **reszty**.",
       "en": "After the negation **nie trzeba** use the genitive: **reszty**."
      }
     }
    ]
   },
   "explanation": null
  },
  "to": {
   "type": "SITUATION",
   "skill": "situation.taxi",
   "data": {
    "npc": {
     "name": "Pan Marek",
     "emoji": "🧑🏽",
     "role": {
      "uk": "таксист",
      "ru": "таксист",
      "en": "a taxi driver"
     }
    },
    "scene": {
     "uk": "Ти замовив таксі до аеропорту в Пижовицях.",
     "ru": "Ты заказал такси в аэропорт в Пыжовице.",
     "en": "You booked a taxi to the airport in Pyrzowice."
    },
    "steps": [
     {
      "npc": "Dzień dobry! Dokąd jedziemy?",
      "npcTr": {
       "uk": "Добрий день! Куди їдемо?",
       "ru": "Добрый день! Куда едем?",
       "en": "Hello! Where are we going?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Na lotnisko, proszę.",
        "tr": {
         "uk": "В аеропорт, будь ласка.",
         "ru": "В аэропорт, пожалуйста.",
         "en": "To the airport, please."
        }
       },
       {
        "id": "s0o1",
        "text": "Z lotniska, proszę.",
        "tr": {
         "uk": "(це «з аеропорту»)",
         "ru": "(это «из аэропорта»)",
         "en": "(that means \"from the airport\")"
        }
       },
       {
        "id": "s0o2",
        "text": "Na lotnisku, proszę.",
        "tr": {
         "uk": "(**dokąd?** — **na** + знахідний: na **lotnisko**; **na lotnisku** — «в аеропорту», де)",
         "ru": "(**dokąd?** — **na** + винительный: na **lotnisko**; **na lotnisku** — «в аэропорту», где)",
         "en": "(**dokąd?** — **na** + accusative: na **lotnisko**; **na lotnisku** means “at the airport”)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "Куди? — **na lotnisko**. **Z lotniska** — звідки.",
       "ru": "Куда? — **na lotnisko**. **Z lotniska** — откуда.",
       "en": "Where to? — **na lotnisko**. **Z lotniska** means \"from\"."
      }
     },
     {
      "npc": "Jesteśmy na miejscu. Razem trzydzieści pięć złotych.",
      "npcTr": {
       "uk": "Ми на місці. Разом тридцять п'ять злотих.",
       "ru": "Мы на месте. Итого тридцать пять злотых.",
       "en": "We're here. Thirty-five złoty in total."
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Dziękuję. Reszty nie trzeba.",
        "tr": {
         "uk": "Дякую. Решти не треба.",
         "ru": "Спасибо. Сдачи не надо.",
         "en": "Thank you. Keep the change."
        }
       },
       {
        "id": "s1o1",
        "text": "Dziękuję. Reszta nie trzeba.",
        "tr": {
         "uk": "(після «nie trzeba» — родовий)",
         "ru": "(после «nie trzeba» — родительный)",
         "en": "(use the genitive after \"nie trzeba\")"
        }
       },
       {
        "id": "s1o2",
        "text": "Dziękuję. Reszty nie ma.",
        "tr": {
         "uk": "(**Reszty nie trzeba** — «решти не треба» (лишити собі); **nie ma** — «немає»)",
         "ru": "(**Reszty nie trzeba** — «сдачи не надо» (оставить себе); **nie ma** — «нет»)",
         "en": "(**Reszty nie trzeba** means “keep the change”; **nie ma** means “there isn’t any”)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "Після заперечення **nie trzeba** — родовий: reszta → **reszty**.",
       "ru": "После отрицания **nie trzeba** — родительный: reszta → **reszty**.",
       "en": "After the negation **nie trzeba** use the genitive: **reszty**."
      }
     }
    ]
   },
   "explanation": null
  }
 },
 {
  "lesson": "kat-9-wynajem",
  "n": 9,
  "from": {
   "type": "SITUATION",
   "skill": "situation.rent",
   "data": {
    "npc": {
     "name": "Pan Andrzej",
     "emoji": "🧑🏻",
     "role": {
      "uk": "власник квартири",
      "ru": "владелец квартиры",
      "en": "a landlord"
     }
    },
    "scene": {
     "uk": "Ти дзвониш власникові з оголошення.",
     "ru": "Ты звонишь владельцу по объявлению.",
     "en": "You are calling the landlord from an ad."
    },
    "steps": [
     {
      "npc": "Mieszkanie jest umeblowane, czynsz to tysiąc osiemset złotych.",
      "npcTr": {
       "uk": "Квартира мебльована, квартплата — тисяча вісімсот злотих.",
       "ru": "Квартира меблирована, квартплата — тысяча восемьсот злотых.",
       "en": "The flat is furnished, the rent is 1800 złoty."
      },
      "options": [
       {
        "id": "s0o0",
        "text": "A czy media są w cenie?",
        "tr": {
         "uk": "А комунальні входять у ціну?",
         "ru": "А коммунальные входят в цену?",
         "en": "And are utilities included?"
        }
       },
       {
        "id": "s0o1",
        "text": "A czy media jest w cenie?",
        "tr": {
         "uk": "(media — множина: są)",
         "ru": "(media — множественное число: są)",
         "en": "(media is plural: są)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "**Media** — множина: media **są**.",
       "ru": "**Media** — множественное число: media **są**.",
       "en": "**Media** is plural: **są**."
      }
     },
     {
      "npc": "Kiedy może pan przyjść obejrzeć mieszkanie?",
      "npcTr": {
       "uk": "Коли ви можете прийти подивитися квартиру?",
       "ru": "Когда вы можете прийти посмотреть квартиру?",
       "en": "When can you come to view the flat?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Mogę przyjść jutro po pracy.",
        "tr": {
         "uk": "Можу прийти завтра після роботи.",
         "ru": "Могу прийти завтра после работы.",
         "en": "I can come tomorrow after work."
        }
       },
       {
        "id": "s1o1",
        "text": "Mogę przyjść wczoraj po pracy.",
        "tr": {
         "uk": "(«wczoraj» — це вчора)",
         "ru": "(«wczoraj» — это вчера)",
         "en": "(\"wczoraj\" means yesterday)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "Про майбутнє — **jutro** (завтра), а не wczoraj.",
       "ru": "О будущем — **jutro** (завтра), а не wczoraj.",
       "en": "For the future say **jutro**, not wczoraj."
      }
     }
    ]
   },
   "explanation": null
  },
  "to": {
   "type": "SITUATION",
   "skill": "situation.rent",
   "data": {
    "npc": {
     "name": "Pan Andrzej",
     "emoji": "🧑🏻",
     "role": {
      "uk": "власник квартири",
      "ru": "владелец квартиры",
      "en": "a landlord"
     }
    },
    "scene": {
     "uk": "Ти дзвониш власникові з оголошення.",
     "ru": "Ты звонишь владельцу по объявлению.",
     "en": "You are calling the landlord from an ad."
    },
    "steps": [
     {
      "npc": "Mieszkanie jest umeblowane, czynsz to tysiąc osiemset złotych.",
      "npcTr": {
       "uk": "Квартира мебльована, квартплата — тисяча вісімсот злотих.",
       "ru": "Квартира меблирована, квартплата — тысяча восемьсот злотых.",
       "en": "The flat is furnished, the rent is 1800 złoty."
      },
      "options": [
       {
        "id": "s0o0",
        "text": "A czy media są w cenie?",
        "tr": {
         "uk": "А комунальні входять у ціну?",
         "ru": "А коммунальные входят в цену?",
         "en": "And are utilities included?"
        }
       },
       {
        "id": "s0o1",
        "text": "A czy media jest w cenie?",
        "tr": {
         "uk": "(media — множина: są)",
         "ru": "(media — множественное число: są)",
         "en": "(media is plural: są)"
        }
       },
       {
        "id": "s0o2",
        "text": "A czy media są na cenie?",
        "tr": {
         "uk": "(у ціні — **w** cenie, а не **na**)",
         "ru": "(в цене — **w** cenie, а не **na**)",
         "en": "(“included in the price” is **w** cenie, not **na**)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "**Media** — множина: media **są**.",
       "ru": "**Media** — множественное число: media **są**.",
       "en": "**Media** is plural: **są**."
      }
     },
     {
      "npc": "Kiedy może pan przyjść obejrzeć mieszkanie?",
      "npcTr": {
       "uk": "Коли ви можете прийти подивитися квартиру?",
       "ru": "Когда вы можете прийти посмотреть квартиру?",
       "en": "When can you come to view the flat?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Mogę przyjść jutro po pracy.",
        "tr": {
         "uk": "Можу прийти завтра після роботи.",
         "ru": "Могу прийти завтра после работы.",
         "en": "I can come tomorrow after work."
        }
       },
       {
        "id": "s1o1",
        "text": "Mogę przyjść wczoraj po pracy.",
        "tr": {
         "uk": "(«wczoraj» — це вчора)",
         "ru": "(«wczoraj» — это вчера)",
         "en": "(\"wczoraj\" means yesterday)"
        }
       },
       {
        "id": "s1o2",
        "text": "Może pan przyjść jutro po pracy.",
        "tr": {
         "uk": "(про себе: **mogę**; **może pan** — «ви можете»)",
         "ru": "(о себе: **mogę**; **może pan** — «вы можете»)",
         "en": "(about yourself: **mogę**; **może pan** means “you can”)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "Про майбутнє — **jutro** (завтра), а не wczoraj.",
       "ru": "О будущем — **jutro** (завтра), а не wczoraj.",
       "en": "For the future say **jutro**, not wczoraj."
      }
     }
    ]
   },
   "explanation": null
  }
 },
 {
  "lesson": "kat-10-awaria",
  "n": 9,
  "from": {
   "type": "DIALOGUE",
   "skill": "dialogue.home",
   "data": {
    "npc": {
     "name": "Pan Andrzej",
     "emoji": "🧑🏻",
     "role": {
      "uk": "власник квартири",
      "ru": "владелец квартиры",
      "en": "a landlord"
     }
    },
    "steps": [
     {
      "npc": "Halo? Dzień dobry, w czym problem?",
      "npcTr": {
       "uk": "Алло? Добрий день, у чому проблема?",
       "ru": "Алло? Добрый день, в чём проблема?",
       "en": "Hello? What's the problem?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Ogrzewanie nie działa. Kiedy ktoś to naprawi?",
        "tr": {
         "uk": "Опалення не працює. Коли хтось це полагодить?",
         "ru": "Отопление не работает. Когда кто-то это починит?",
         "en": "The heating isn't working. When will someone fix it?"
        }
       },
       {
        "id": "s0o1",
        "text": "Ogrzewanie nie działa. Kiedy ktoś to naprawię?",
        "tr": {
         "uk": "(naprawię — це «я полагоджу»)",
         "ru": "(naprawię — это «я починю»)",
         "en": "(naprawię means \"I will fix\")"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "**Ktoś** (хтось) — 3-тя особа: **naprawi**.",
       "ru": "**Ktoś** (кто-то) — 3-е лицо: **naprawi**.",
       "en": "**Ktoś** (someone) is third person: **naprawi**."
      }
     },
     {
      "npc": "Hydraulik przyjdzie jutro rano.",
      "npcTr": {
       "uk": "Сантехнік прийде завтра зранку.",
       "ru": "Сантехник придёт завтра утром.",
       "en": "The plumber will come tomorrow morning."
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Dziękuję. Będę w domu.",
        "tr": {
         "uk": "Дякую. Я буду вдома.",
         "ru": "Спасибо. Я буду дома.",
         "en": "Thank you. I'll be at home."
        }
       },
       {
        "id": "s1o1",
        "text": "Dziękuję. Będę w dom.",
        "tr": {
         "uk": "(де? — місцевий: w domu)",
         "ru": "(где? — предложный: w domu)",
         "en": "(where? use the locative: w domu)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "Де? — місцевий: dom → **w domu**.",
       "ru": "Где? — предложный: dom → **w domu**.",
       "en": "Where? — locative: **w domu**."
      }
     }
    ]
   },
   "explanation": null
  },
  "to": {
   "type": "DIALOGUE",
   "skill": "dialogue.home",
   "data": {
    "npc": {
     "name": "Pan Andrzej",
     "emoji": "🧑🏻",
     "role": {
      "uk": "власник квартири",
      "ru": "владелец квартиры",
      "en": "a landlord"
     }
    },
    "steps": [
     {
      "npc": "Halo? Dzień dobry, w czym problem?",
      "npcTr": {
       "uk": "Алло? Добрий день, у чому проблема?",
       "ru": "Алло? Добрый день, в чём проблема?",
       "en": "Hello? What's the problem?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Ogrzewanie nie działa. Kiedy ktoś to naprawi?",
        "tr": {
         "uk": "Опалення не працює. Коли хтось це полагодить?",
         "ru": "Отопление не работает. Когда кто-то это починит?",
         "en": "The heating isn't working. When will someone fix it?"
        }
       },
       {
        "id": "s0o1",
        "text": "Ogrzewanie nie działa. Kiedy ktoś to naprawię?",
        "tr": {
         "uk": "(naprawię — це «я полагоджу»)",
         "ru": "(naprawię — это «я починю»)",
         "en": "(naprawię means \"I will fix\")"
        }
       },
       {
        "id": "s0o2",
        "text": "Ogrzewanie nie działa. Kiedy ktoś to naprawił?",
        "tr": {
         "uk": "(питання про майбутнє: **naprawi**; **naprawił** — «поремонтував»)",
         "ru": "(вопрос о будущем: **naprawi**; **naprawił** — «починил»)",
         "en": "(the question is about the future: **naprawi**; **naprawił** means “fixed”)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "**Ktoś** (хтось) — 3-тя особа: **naprawi**.",
       "ru": "**Ktoś** (кто-то) — 3-е лицо: **naprawi**.",
       "en": "**Ktoś** (someone) is third person: **naprawi**."
      }
     },
     {
      "npc": "Hydraulik przyjdzie jutro rano.",
      "npcTr": {
       "uk": "Сантехнік прийде завтра зранку.",
       "ru": "Сантехник придёт завтра утром.",
       "en": "The plumber will come tomorrow morning."
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Dziękuję. Będę w domu.",
        "tr": {
         "uk": "Дякую. Я буду вдома.",
         "ru": "Спасибо. Я буду дома.",
         "en": "Thank you. I'll be at home."
        }
       },
       {
        "id": "s1o1",
        "text": "Dziękuję. Będę w dom.",
        "tr": {
         "uk": "(де? — місцевий: w domu)",
         "ru": "(где? — предложный: w domu)",
         "en": "(where? use the locative: w domu)"
        }
       },
       {
        "id": "s1o2",
        "text": "Dziękuję. Będę do domu.",
        "tr": {
         "uk": "(де? — **w** + місцевий: w **domu**; **do domu** — «додому»)",
         "ru": "(где? — **w** + предложный: w **domu**; **do domu** — «домой»)",
         "en": "(where? — **w** + locative: w **domu**; **do domu** means “homeward”)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "Де? — місцевий: dom → **w domu**.",
       "ru": "Где? — предложный: dom → **w domu**.",
       "en": "Where? — locative: **w domu**."
      }
     }
    ]
   },
   "explanation": null
  }
 },
 {
  "lesson": "kat-boss",
  "n": 0,
  "from": {
   "type": "SITUATION",
   "skill": "situation.boss",
   "data": {
    "npc": {
     "name": "Tomek",
     "emoji": "🧑🏻",
     "role": {
      "uk": "сусід по квартирі",
      "ru": "сосед по квартире",
      "en": "a flatmate"
     }
    },
    "scene": {
     "uk": "Вечір перед концертом у Катовіце",
     "ru": "Вечер перед концертом в Катовице",
     "en": "Evening before a concert in Katowice"
    },
    "steps": [
     {
      "npc": "Idziemy dziś na koncert do Spodka! Wiesz, jak tam dojechać?",
      "npcTr": {
       "uk": "Ідемо сьогодні на концерт у Сподек! Знаєш, як туди доїхати?",
       "ru": "Идём сегодня на концерт в Сподек! Знаешь, как туда доехать?",
       "en": "We're going to a concert at the Spodek tonight! Know how to get there?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Wiem, jedziemy tramwajem.",
        "tr": {
         "uk": "Знаю, їдемо трамваєм.",
         "ru": "Знаю, едем на трамвае.",
         "en": "Yes, we take the tram."
        }
       },
       {
        "id": "s0o1",
        "text": "Znam, jedziemy tramwaj.",
        "tr": {
         "uk": "(дві помилки)",
         "ru": "(две ошибки)",
         "en": "(two mistakes)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "Факт → **wiem**; засіб → **tramwajem**.",
       "ru": "Факт → **wiem**; средство → **tramwajem**.",
       "en": "Fact → **wiem**; vehicle → **tramwajem**."
      }
     },
     {
      "npc": "Super. Znasz ten zespół?",
      "npcTr": {
       "uk": "Супер. Знаєш цей гурт?",
       "ru": "Супер. Знаешь эту группу?",
       "en": "Great. Do you know this band?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Znam! Często ich słucham.",
        "tr": {
         "uk": "Знаю! Часто їх слухаю.",
         "ru": "Знаю! Часто их слушаю.",
         "en": "I do! I often listen to them."
        }
       },
       {
        "id": "s1o1",
        "text": "Wiem! Często ich słucham.",
        "tr": {
         "uk": "(гурт — іменник → znać)",
         "ru": "(группа — существительное → znać)",
         "en": "(a band is a noun → znać)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "Іменник → **znam**.",
       "ru": "Существительное → **znam**.",
       "en": "Noun → **znam**."
      }
     }
    ]
   },
   "explanation": null
  },
  "to": {
   "type": "SITUATION",
   "skill": "situation.boss",
   "data": {
    "npc": {
     "name": "Tomek",
     "emoji": "🧑🏻",
     "role": {
      "uk": "сусід по квартирі",
      "ru": "сосед по квартире",
      "en": "a flatmate"
     }
    },
    "scene": {
     "uk": "Вечір перед концертом у Катовіце",
     "ru": "Вечер перед концертом в Катовице",
     "en": "Evening before a concert in Katowice"
    },
    "steps": [
     {
      "npc": "Idziemy dziś na koncert do Spodka! Wiesz, jak tam dojechać?",
      "npcTr": {
       "uk": "Ідемо сьогодні на концерт у Сподек! Знаєш, як туди доїхати?",
       "ru": "Идём сегодня на концерт в Сподек! Знаешь, как туда доехать?",
       "en": "We're going to a concert at the Spodek tonight! Know how to get there?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Wiem, jedziemy tramwajem.",
        "tr": {
         "uk": "Знаю, їдемо трамваєм.",
         "ru": "Знаю, едем на трамвае.",
         "en": "Yes, we take the tram."
        }
       },
       {
        "id": "s0o1",
        "text": "Znam, jedziemy tramwaj.",
        "tr": {
         "uk": "(дві помилки)",
         "ru": "(две ошибки)",
         "en": "(two mistakes)"
        }
       },
       {
        "id": "s0o2",
        "text": "Wiem, idziemy tramwajem.",
        "tr": {
         "uk": "(трамваєм **jedziemy** (їдемо); **idziemy** — пішки)",
         "ru": "(трамваем **jedziemy** (едем); **idziemy** — пешком)",
         "en": "(by tram you **jedziemy** (travel); **idziemy** means on foot)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "Факт → **wiem**; засіб → **tramwajem**.",
       "ru": "Факт → **wiem**; средство → **tramwajem**.",
       "en": "Fact → **wiem**; vehicle → **tramwajem**."
      }
     },
     {
      "npc": "Super. Znasz ten zespół?",
      "npcTr": {
       "uk": "Супер. Знаєш цей гурт?",
       "ru": "Супер. Знаешь эту группу?",
       "en": "Great. Do you know this band?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Znam! Często ich słucham.",
        "tr": {
         "uk": "Знаю! Часто їх слухаю.",
         "ru": "Знаю! Часто их слушаю.",
         "en": "I do! I often listen to them."
        }
       },
       {
        "id": "s1o1",
        "text": "Wiem! Często ich słucham.",
        "tr": {
         "uk": "(гурт — іменник → znać)",
         "ru": "(группа — существительное → znać)",
         "en": "(a band is a noun → znać)"
        }
       },
       {
        "id": "s1o2",
        "text": "Znam! Często im słucham.",
        "tr": {
         "uk": "(**słuchać** + родовий: **ich**; **im** — «їм»)",
         "ru": "(**słuchać** + родительный: **ich**; **im** — «им»)",
         "en": "(**słuchać** takes the genitive: **ich**; **im** means “to them”)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "Іменник → **znam**.",
       "ru": "Существительное → **znam**.",
       "en": "Noun → **znam**."
      }
     }
    ]
   },
   "explanation": null
  }
 },
 {
  "lesson": "kat-boss",
  "n": 3,
  "from": {
   "type": "FILL_GAP",
   "skill": "grammar.boss",
   "data": {
    "pl": "Nie ___, kto to jest.",
    "translation": {
     "uk": "Не знаю, хто це.",
     "ru": "Не знаю, кто это.",
     "en": "I don't know who that is."
    },
    "options": [
     {
      "id": "o0",
      "text": "wiem"
     },
     {
      "id": "o1",
      "text": "znam"
     },
     {
      "id": "o2",
      "text": "znasz"
     }
    ],
    "answer": "o0"
   },
   "explanation": {
    "uk": "Речення з **kto** → **wiem**.",
    "ru": "Предложение с **kto** → **wiem**.",
    "en": "A **kto** clause → **wiem**."
   }
  },
  "to": {
   "type": "FILL_GAP",
   "skill": "grammar.boss",
   "data": {
    "pl": "Nie ___, kto to jest.",
    "translation": {
     "uk": "Не знаю, хто це.",
     "ru": "Не знаю, кто это.",
     "en": "I don't know who that is."
    },
    "options": [
     {
      "id": "o0",
      "text": "wiem"
     },
     {
      "id": "o1",
      "text": "znam"
     },
     {
      "id": "o2",
      "text": "wiesz"
     }
    ],
    "answer": "o0"
   },
   "explanation": {
    "uk": "Речення з **kto** → **wiem**.",
    "ru": "Предложение с **kto** → **wiem**.",
    "en": "A **kto** clause → **wiem**."
   }
  }
 },
 {
  "lesson": "kat-boss",
  "n": 4,
  "from": {
   "type": "FILL_GAP",
   "skill": "grammar.boss",
   "data": {
    "pl": "Widzisz ___ panią?",
    "translation": {
     "uk": "Бачиш цю пані?",
     "ru": "Видишь эту женщину?",
     "en": "Do you see that lady?"
    },
    "options": [
     {
      "id": "o0",
      "text": "tę"
     },
     {
      "id": "o1",
      "text": "tą"
     },
     {
      "id": "o2",
      "text": "ta"
     }
    ],
    "answer": "o0"
   },
   "explanation": {
    "uk": "Знахідний → **tę**.",
    "ru": "Винительный → **tę**.",
    "en": "Accusative → **tę**."
   }
  },
  "to": {
   "type": "FILL_GAP",
   "skill": "grammar.boss",
   "data": {
    "pl": "Widzisz ___ panią?",
    "translation": {
     "uk": "Бачиш цю пані?",
     "ru": "Видишь эту женщину?",
     "en": "Do you see that lady?"
    },
    "options": [
     {
      "id": "o0",
      "text": "tę"
     },
     {
      "id": "o1",
      "text": "tej"
     },
     {
      "id": "o2",
      "text": "tą"
     }
    ],
    "answer": "o0"
   },
   "explanation": {
    "uk": "Знахідний → **tę**.",
    "ru": "Винительный → **tę**.",
    "en": "Accusative → **tę**."
   }
  }
 },
 {
  "lesson": "opo-1-siema",
  "n": 0,
  "from": {
   "type": "DIALOGUE",
   "skill": "dialogue.slang",
   "data": {
    "npc": {
     "name": "Kuba",
     "emoji": "🧑🏼",
     "role": {
      "uk": "друг-студент",
      "ru": "друг-студент",
      "en": "a student friend"
     }
    },
    "steps": [
     {
      "npc": "Siema! Co tam?",
      "npcTr": {
       "uk": "Привіт! Як справи?",
       "ru": "Привет! Как дела?",
       "en": "Hi! What's up?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Siema! Spoko, a u ciebie?",
        "tr": {
         "uk": "Привіт! Нормально, а в тебе?",
         "ru": "Привет! Нормально, а у тебя?",
         "en": "Hi! Fine, you?"
        }
       },
       {
        "id": "s0o1",
        "text": "Dzień dobry panu, wszystko w porządku.",
        "tr": {
         "uk": "Добрий день, пане, усе гаразд.",
         "ru": "Добрый день, всё в порядке.",
         "en": "Good day, sir, all is well."
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "Другові можна відповісти так само неформально. «Dzień dobry panu» звучить тут дивно офіційно.",
       "ru": "Другу можно ответить так же неформально. «Dzień dobry panu» звучит здесь странно официально.",
       "en": "Answer a friend just as casually."
      }
     },
     {
      "npc": "Też luz. Idziesz na koncert w sobotę?",
      "npcTr": {
       "uk": "Теж спокійно. Ідеш на концерт у суботу?",
       "ru": "Тоже нормально. Идёшь на концерт в субботу?",
       "en": "All chill too. Coming to the concert on Saturday?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Jasne! Dobra, lecę. Trzymaj się!",
        "tr": {
         "uk": "Звісно! Добре, я побіг. Тримайся!",
         "ru": "Конечно! Ладно, я побежал. Держись!",
         "en": "Sure! OK, I'm off. Take care!"
        }
       },
       {
        "id": "s1o1",
        "text": "Oczywiście, proszę pana. Do widzenia!",
        "tr": {
         "uk": "Звісно, пане. До побачення!",
         "ru": "Конечно, господин. До свидания!",
         "en": "Certainly, sir. Goodbye!"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "Друг говорить на «ти» й по-простому — «proszę pana» і «do widzenia» звучать як до незнайомця. По-дружньому: **Jasne! Lecę. Trzymaj się!**",
       "ru": "Друг говорит на «ты» и по-простому — «proszę pana» и «do widzenia» звучат как к незнакомцу. По-дружески: **Jasne! Lecę. Trzymaj się!**",
       "en": "A friend speaks casually — \"proszę pana\" and \"do widzenia\" sound like talking to a stranger. Say **Jasne! Lecę. Trzymaj się!**"
      }
     }
    ]
   },
   "explanation": null
  },
  "to": {
   "type": "DIALOGUE",
   "skill": "dialogue.slang",
   "data": {
    "npc": {
     "name": "Kuba",
     "emoji": "🧑🏼",
     "role": {
      "uk": "друг-студент",
      "ru": "друг-студент",
      "en": "a student friend"
     }
    },
    "steps": [
     {
      "npc": "Siema! Co tam?",
      "npcTr": {
       "uk": "Привіт! Як справи?",
       "ru": "Привет! Как дела?",
       "en": "Hi! What's up?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Siema! Spoko, a u ciebie?",
        "tr": {
         "uk": "Привіт! Нормально, а в тебе?",
         "ru": "Привет! Нормально, а у тебя?",
         "en": "Hi! Fine, you?"
        }
       },
       {
        "id": "s0o1",
        "text": "Dzień dobry panu, wszystko w porządku.",
        "tr": {
         "uk": "Добрий день, пане, усе гаразд.",
         "ru": "Добрый день, всё в порядке.",
         "en": "Good day, sir, all is well."
        }
       },
       {
        "id": "s0o2",
        "text": "Siema! Spoko, a u pana?",
        "tr": {
         "uk": "(**siema** — для друзів, тож і **u ciebie**; **u pana** — до малознайомого)",
         "ru": "(**siema** — для друзей, поэтому и **u ciebie**; **u pana** — к малознакомому)",
         "en": "(**siema** is for friends, so also **u ciebie**; **u pana** is for a stranger)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "Другові можна відповісти так само неформально. «Dzień dobry panu» звучить тут дивно офіційно.",
       "ru": "Другу можно ответить так же неформально. «Dzień dobry panu» звучит здесь странно официально.",
       "en": "Answer a friend just as casually."
      }
     },
     {
      "npc": "Też luz. Idziesz na koncert w sobotę?",
      "npcTr": {
       "uk": "Теж спокійно. Ідеш на концерт у суботу?",
       "ru": "Тоже нормально. Идёшь на концерт в субботу?",
       "en": "All chill too. Coming to the concert on Saturday?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Jasne! Dobra, lecę. Trzymaj się!",
        "tr": {
         "uk": "Звісно! Добре, я побіг. Тримайся!",
         "ru": "Конечно! Ладно, я побежал. Держись!",
         "en": "Sure! OK, I'm off. Take care!"
        }
       },
       {
        "id": "s1o1",
        "text": "Oczywiście, proszę pana. Do widzenia!",
        "tr": {
         "uk": "Звісно, пане. До побачення!",
         "ru": "Конечно, господин. До свидания!",
         "en": "Certainly, sir. Goodbye!"
        }
       },
       {
        "id": "s1o2",
        "text": "Jasne! Dobra, lecę. Trzymajcie się!",
        "tr": {
         "uk": "(одному другові — **trzymaj się**; **trzymajcie się** — кільком людям)",
         "ru": "(одному другу — **trzymaj się**; **trzymajcie się** — нескольким людям)",
         "en": "(to one friend — **trzymaj się**; **trzymajcie się** is for several people)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "Друг говорить на «ти» й по-простому — «proszę pana» і «do widzenia» звучать як до незнайомця. По-дружньому: **Jasne! Lecę. Trzymaj się!**",
       "ru": "Друг говорит на «ты» и по-простому — «proszę pana» и «do widzenia» звучат как к незнакомцу. По-дружески: **Jasne! Lecę. Trzymaj się!**",
       "en": "A friend speaks casually — \"proszę pana\" and \"do widzenia\" sound like talking to a stranger. Say **Jasne! Lecę. Trzymaj się!**"
      }
     }
    ]
   },
   "explanation": null
  }
 },
 {
  "lesson": "opo-2-reakcje",
  "n": 0,
  "from": {
   "type": "DIALOGUE",
   "skill": "dialogue.slang",
   "data": {
    "npc": {
     "name": "Kuba",
     "emoji": "🧑🏼",
     "role": {
      "uk": "друг-студент",
      "ru": "друг-студент",
      "en": "a student friend"
     }
    },
    "steps": [
     {
      "npc": "Wiesz co? Wygrałem dwa bilety na festiwal w Opolu!",
      "npcTr": {
       "uk": "Знаєш що? Я виграв два квитки на фестиваль в Ополі!",
       "ru": "Знаешь что? Я выиграл два билета на фестиваль в Ополе!",
       "en": "Guess what? I won two tickets to the Opole festival!"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Serio? Ale sztos!",
        "tr": {
         "uk": "Серйозно? Оце бомба!",
         "ru": "Серьёзно? Вот это бомба!",
         "en": "Seriously? Awesome!"
        }
       },
       {
        "id": "s0o1",
        "text": "Serio? Masakra!",
        "tr": {
         "uk": "(masakra — про щось погане)",
         "ru": "(masakra — о чём-то плохом)",
         "en": "(masakra is for bad things)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "Радісна новина → **Ale sztos!** «Masakra» — коли щось погано.",
       "ru": "Радостная новость → **Ale sztos!** «Masakra» — когда что-то плохо.",
       "en": "Good news → **Ale sztos!**"
      }
     },
     {
      "npc": "Bez kitu! Ale… zgubiłem jeden bilet w tramwaju.",
      "npcTr": {
       "uk": "Без жартів! Але… я загубив один квиток у трамваї.",
       "ru": "Без шуток! Но… я потерял один билет в трамвае.",
       "en": "No kidding! But… I lost one ticket on the tram."
      },
      "options": [
       {
        "id": "s1o0",
        "text": "O nie, masakra!",
        "tr": {
         "uk": "О ні, жах!",
         "ru": "О нет, ужас!",
         "en": "Oh no, nightmare!"
        }
       },
       {
        "id": "s1o1",
        "text": "O nie, ale beka!",
        "tr": {
         "uk": "(сміятися з чужої біди — неввічливо)",
         "ru": "(смеяться над чужой бедой — невежливо)",
         "en": "(laughing at it is rude)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "Біда → **Masakra!**",
       "ru": "Беда → **Masakra!**",
       "en": "Trouble → **Masakra!**"
      }
     }
    ]
   },
   "explanation": null
  },
  "to": {
   "type": "DIALOGUE",
   "skill": "dialogue.slang",
   "data": {
    "npc": {
     "name": "Kuba",
     "emoji": "🧑🏼",
     "role": {
      "uk": "друг-студент",
      "ru": "друг-студент",
      "en": "a student friend"
     }
    },
    "steps": [
     {
      "npc": "Wiesz co? Wygrałem dwa bilety na festiwal w Opolu!",
      "npcTr": {
       "uk": "Знаєш що? Я виграв два квитки на фестиваль в Ополі!",
       "ru": "Знаешь что? Я выиграл два билета на фестиваль в Ополе!",
       "en": "Guess what? I won two tickets to the Opole festival!"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Serio? Ale sztos!",
        "tr": {
         "uk": "Серйозно? Оце бомба!",
         "ru": "Серьёзно? Вот это бомба!",
         "en": "Seriously? Awesome!"
        }
       },
       {
        "id": "s0o1",
        "text": "Serio? Masakra!",
        "tr": {
         "uk": "(masakra — про щось погане)",
         "ru": "(masakra — о чём-то плохом)",
         "en": "(masakra is for bad things)"
        }
       },
       {
        "id": "s0o2",
        "text": "Serio? Ale fatalnie!",
        "tr": {
         "uk": "(**fatalnie** — «жахливо»; на радісну новину — **sztos**, **super**)",
         "ru": "(**fatalnie** — «ужасно»; на радостную новость — **sztos**, **super**)",
         "en": "(**fatalnie** means “awful”; for good news say **sztos** or **super**)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "Радісна новина → **Ale sztos!** «Masakra» — коли щось погано.",
       "ru": "Радостная новость → **Ale sztos!** «Masakra» — когда что-то плохо.",
       "en": "Good news → **Ale sztos!**"
      }
     },
     {
      "npc": "Bez kitu! Ale… zgubiłem jeden bilet w tramwaju.",
      "npcTr": {
       "uk": "Без жартів! Але… я загубив один квиток у трамваї.",
       "ru": "Без шуток! Но… я потерял один билет в трамвае.",
       "en": "No kidding! But… I lost one ticket on the tram."
      },
      "options": [
       {
        "id": "s1o0",
        "text": "O nie, masakra!",
        "tr": {
         "uk": "О ні, жах!",
         "ru": "О нет, ужас!",
         "en": "Oh no, nightmare!"
        }
       },
       {
        "id": "s1o1",
        "text": "O nie, ale beka!",
        "tr": {
         "uk": "(сміятися з чужої біди — неввічливо)",
         "ru": "(смеяться над чужой бедой — невежливо)",
         "en": "(laughing at it is rude)"
        }
       },
       {
        "id": "s1o2",
        "text": "O nie, ale sztos!",
        "tr": {
         "uk": "(**sztos** — «клас» про добре; про втрату — **masakra**)",
         "ru": "(**sztos** — «класс» о хорошем; о потере — **masakra**)",
         "en": "(**sztos** means “awesome”; for a loss say **masakra**)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "Біда → **Masakra!**",
       "ru": "Беда → **Masakra!**",
       "en": "Trouble → **Masakra!**"
      }
     }
    ]
   },
   "explanation": null
  }
 },
 {
  "lesson": "opo-3-ogarniac",
  "n": 0,
  "from": {
   "type": "DIALOGUE",
   "skill": "dialogue.register",
   "data": {
    "npc": {
     "name": "Pani Ewa",
     "emoji": "👩🏼‍💼",
     "role": {
      "uk": "керівниця",
      "ru": "руководитель",
      "en": "the manager"
     }
    },
    "steps": [
     {
      "npc": "Panie Bobku, czy może pan dziś zająć się dostawą?",
      "npcTr": {
       "uk": "Пане Бобку, чи можете ви сьогодні зайнятися доставкою?",
       "ru": "Пан Бобек, вы можете сегодня заняться доставкой?",
       "en": "Mr Bobek, can you handle the delivery today?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Oczywiście, zajmę się tym.",
        "tr": {
         "uk": "Звісно, я цим займуся.",
         "ru": "Конечно, я этим займусь.",
         "en": "Of course, I'll take care of it."
        }
       },
       {
        "id": "s0o1",
        "text": "Spoko, ogarnę, luz.",
        "tr": {
         "uk": "(занадто розмовно для керівниці)",
         "ru": "(слишком разговорно для руководителя)",
         "en": "(too casual for your manager)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "З керівницею — нейтрально: **zajmę się tym**. «Ogarnę» — з колегами-ровесниками.",
       "ru": "С руководителем — нейтрально: **zajmę się tym**.",
       "en": "With a manager — neutral."
      }
     },
     {
      "npc": "Dziękuję. Czy coś jest niejasne?",
      "npcTr": {
       "uk": "Дякую. Щось незрозуміло?",
       "ru": "Спасибо. Что-то непонятно?",
       "en": "Thanks. Anything unclear?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Nie rozumiem jednej rzeczy w zamówieniu.",
        "tr": {
         "uk": "Я не розумію одну річ у замовленні.",
         "ru": "Я не понимаю одну вещь в заказе.",
         "en": "I don't understand one thing in the order."
        }
       },
       {
        "id": "s1o1",
        "text": "Mam wywalone na zamówienie.",
        "tr": {
         "uk": "(грубо — так не можна)",
         "ru": "(грубо — так нельзя)",
         "en": "(rude — never)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "**Mam wywalone** — грубо й зневажливо. Нейтрально: **Nie rozumiem…**",
       "ru": "**Mam wywalone** — грубо и пренебрежительно. Нейтрально: **Nie rozumiem…**",
       "en": "**Mam wywalone** is rude."
      }
     }
    ]
   },
   "explanation": null
  },
  "to": {
   "type": "DIALOGUE",
   "skill": "dialogue.register",
   "data": {
    "npc": {
     "name": "Pani Ewa",
     "emoji": "👩🏼‍💼",
     "role": {
      "uk": "керівниця",
      "ru": "руководитель",
      "en": "the manager"
     }
    },
    "steps": [
     {
      "npc": "Panie Bobku, czy może pan dziś zająć się dostawą?",
      "npcTr": {
       "uk": "Пане Бобку, чи можете ви сьогодні зайнятися доставкою?",
       "ru": "Пан Бобек, вы можете сегодня заняться доставкой?",
       "en": "Mr Bobek, can you handle the delivery today?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Oczywiście, zajmę się tym.",
        "tr": {
         "uk": "Звісно, я цим займуся.",
         "ru": "Конечно, я этим займусь.",
         "en": "Of course, I'll take care of it."
        }
       },
       {
        "id": "s0o1",
        "text": "Spoko, ogarnę, luz.",
        "tr": {
         "uk": "(занадто розмовно для керівниці)",
         "ru": "(слишком разговорно для руководителя)",
         "en": "(too casual for your manager)"
        }
       },
       {
        "id": "s0o2",
        "text": "Oczywiście, zajmiesz się tym.",
        "tr": {
         "uk": "(про себе — **zajmę się**; **zajmiesz się** — «ти займешся»)",
         "ru": "(о себе — **zajmę się**; **zajmiesz się** — «ты займёшься»)",
         "en": "(about yourself — **zajmę się**; **zajmiesz się** means “you will deal with it”)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "З керівницею — нейтрально: **zajmę się tym**. «Ogarnę» — з колегами-ровесниками.",
       "ru": "С руководителем — нейтрально: **zajmę się tym**.",
       "en": "With a manager — neutral."
      }
     },
     {
      "npc": "Dziękuję. Czy coś jest niejasne?",
      "npcTr": {
       "uk": "Дякую. Щось незрозуміло?",
       "ru": "Спасибо. Что-то непонятно?",
       "en": "Thanks. Anything unclear?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Nie rozumiem jednej rzeczy w zamówieniu.",
        "tr": {
         "uk": "Я не розумію одну річ у замовленні.",
         "ru": "Я не понимаю одну вещь в заказе.",
         "en": "I don't understand one thing in the order."
        }
       },
       {
        "id": "s1o1",
        "text": "Mam wywalone na zamówienie.",
        "tr": {
         "uk": "(грубо — так не можна)",
         "ru": "(грубо — так нельзя)",
         "en": "(rude — never)"
        }
       },
       {
        "id": "s1o2",
        "text": "Nie rozumiem jedną rzecz w zamówieniu.",
        "tr": {
         "uk": "(**nie rozumiem** + родовий: **jednej rzeczy**)",
         "ru": "(**nie rozumiem** + родительный: **jednej rzeczy**)",
         "en": "(**nie rozumiem** takes the genitive: **jednej rzeczy**)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "**Mam wywalone** — грубо й зневажливо. Нейтрально: **Nie rozumiem…**",
       "ru": "**Mam wywalone** — грубо и пренебрежительно. Нейтрально: **Nie rozumiem…**",
       "en": "**Mam wywalone** is rude."
      }
     }
    ]
   },
   "explanation": null
  }
 },
 {
  "lesson": "opo-4-nic-nikt",
  "n": 0,
  "from": {
   "type": "DIALOGUE",
   "skill": "dialogue.negation",
   "data": {
    "npc": {
     "name": "Kuba",
     "emoji": "🧑🏼",
     "role": {
      "uk": "друг-студент",
      "ru": "друг-студент",
      "en": "a student friend"
     }
    },
    "steps": [
     {
      "npc": "Co robisz w weekend?",
      "npcTr": {
       "uk": "Що робиш на вихідних?",
       "ru": "Что делаешь на выходных?",
       "en": "What are you doing at the weekend?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Nic nie robię, odpoczywam.",
        "tr": {
         "uk": "Нічого не роблю, відпочиваю.",
         "ru": "Ничего не делаю, отдыхаю.",
         "en": "Nothing, I'm resting."
        }
       },
       {
        "id": "s0o1",
        "text": "Nic robię, odpoczywam.",
        "tr": {
         "uk": "(потрібне «nie»)",
         "ru": "(нужно «nie»)",
         "en": "(needs \"nie\")"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "З **nic** дієслово має **nie**: nic **nie** robię.",
       "ru": "С **nic** глагол имеет **nie**: nic **nie** robię.",
       "en": "With **nic** use **nie**."
      }
     },
     {
      "npc": "Byłeś kiedyś w Opolu na festiwalu?",
      "npcTr": {
       "uk": "Ти колись був в Ополі на фестивалі?",
       "ru": "Ты когда-нибудь был в Ополе на фестивале?",
       "en": "Have you ever been to the Opole festival?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Nie, nigdy nie byłem.",
        "tr": {
         "uk": "Ні, ніколи не був.",
         "ru": "Нет, никогда не был.",
         "en": "No, never."
        }
       },
       {
        "id": "s1o1",
        "text": "Nie, nigdy byłem.",
        "tr": {
         "uk": "(потрібне «nie»)",
         "ru": "(нужно «nie»)",
         "en": "(needs \"nie\")"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "**nigdy nie** byłem.",
       "ru": "**nigdy nie** byłem.",
       "en": "**nigdy nie** byłem."
      }
     }
    ]
   },
   "explanation": null
  },
  "to": {
   "type": "DIALOGUE",
   "skill": "dialogue.negation",
   "data": {
    "npc": {
     "name": "Kuba",
     "emoji": "🧑🏼",
     "role": {
      "uk": "друг-студент",
      "ru": "друг-студент",
      "en": "a student friend"
     }
    },
    "steps": [
     {
      "npc": "Co robisz w weekend?",
      "npcTr": {
       "uk": "Що робиш на вихідних?",
       "ru": "Что делаешь на выходных?",
       "en": "What are you doing at the weekend?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Nic nie robię, odpoczywam.",
        "tr": {
         "uk": "Нічого не роблю, відпочиваю.",
         "ru": "Ничего не делаю, отдыхаю.",
         "en": "Nothing, I'm resting."
        }
       },
       {
        "id": "s0o1",
        "text": "Nic robię, odpoczywam.",
        "tr": {
         "uk": "(потрібне «nie»)",
         "ru": "(нужно «nie»)",
         "en": "(needs \"nie\")"
        }
       },
       {
        "id": "s0o2",
        "text": "Nic nie robię, pracuję.",
        "tr": {
         "uk": "(**Nic nie robię** — «нічого не роблю»; «pracuję» — це вже щось)",
         "ru": "(**Nic nie robię** — «ничего не делаю»; «pracuję» — это уже что-то)",
         "en": "(**Nic nie robię** means “I do nothing”; “pracuję” is already something)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "З **nic** дієслово має **nie**: nic **nie** robię.",
       "ru": "С **nic** глагол имеет **nie**: nic **nie** robię.",
       "en": "With **nic** use **nie**."
      }
     },
     {
      "npc": "Byłeś kiedyś w Opolu na festiwalu?",
      "npcTr": {
       "uk": "Ти колись був в Ополі на фестивалі?",
       "ru": "Ты когда-нибудь был в Ополе на фестивале?",
       "en": "Have you ever been to the Opole festival?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Nie, nigdy nie byłem.",
        "tr": {
         "uk": "Ні, ніколи не був.",
         "ru": "Нет, никогда не был.",
         "en": "No, never."
        }
       },
       {
        "id": "s1o1",
        "text": "Nie, nigdy byłem.",
        "tr": {
         "uk": "(потрібне «nie»)",
         "ru": "(нужно «nie»)",
         "en": "(needs \"nie\")"
        }
       },
       {
        "id": "s1o2",
        "text": "Tak, nigdy nie byłem.",
        "tr": {
         "uk": "(**Tak** — «так, був»; «nigdy nie byłem» — «ніколи не був» — суперечність)",
         "ru": "(**Tak** — «да, был»; «nigdy nie byłem» — «никогда не был» — противоречие)",
         "en": "(**Tak** means “yes, I have”; “nigdy nie byłem” means “never” — a contradiction)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "**nigdy nie** byłem.",
       "ru": "**nigdy nie** byłem.",
       "en": "**nigdy nie** byłem."
      }
     }
    ]
   },
   "explanation": null
  }
 },
 {
  "lesson": "opo-5-weekend",
  "n": 5,
  "from": {
   "type": "DIALOGUE",
   "skill": "dialogue.weekend",
   "data": {
    "npc": {
     "name": "Asia",
     "emoji": "👩🏽",
     "role": {
      "uk": "подруга",
      "ru": "подруга",
      "en": "a friend"
     }
    },
    "steps": [
     {
      "npc": "Jakie masz plany na weekend?",
      "npcTr": {
       "uk": "Які в тебе плани на вихідні?",
       "ru": "Какие у тебя планы на выходные?",
       "en": "What are your plans for the weekend?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "W sobotę pójdę na spacer.",
        "tr": {
         "uk": "У суботу піду на прогулянку.",
         "ru": "В субботу пойду на прогулку.",
         "en": "On Saturday I'll go for a walk."
        }
       },
       {
        "id": "s0o1",
        "text": "W sobotę poszedłem na spacer.",
        "tr": {
         "uk": "(це про минуле, а питання — про плани)",
         "ru": "(это о прошлом, а вопрос — о планах)",
         "en": "(that is the past; the question is about plans)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "Плани — майбутній час: **pójdę**.",
       "ru": "Планы — будущее время: **pójdę**.",
       "en": "Plans use the future: **pójdę**."
      }
     },
     {
      "npc": "Umówimy się na niedzielę?",
      "npcTr": {
       "uk": "Домовимося на неділю?",
       "ru": "Договоримся на воскресенье?",
       "en": "Shall we arrange something for Sunday?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Dobrze, w niedzielę o dwunastej.",
        "tr": {
         "uk": "Добре, у неділю о дванадцятій.",
         "ru": "Хорошо, в воскресенье в двенадцать.",
         "en": "OK, on Sunday at twelve."
        }
       },
       {
        "id": "s1o1",
        "text": "Dobrze, w niedzielę dwunasta.",
        "tr": {
         "uk": "(після o потрібен місцевий: o dwunastej)",
         "ru": "(после o нужен предложный: o dwunastej)",
         "en": "(after o use the locative: o dwunastej)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "Година — **o** + місцевий відмінок: **o dwunastej**.",
       "ru": "Время — **o** + предложный падеж: **o dwunastej**.",
       "en": "A clock time is **o** + locative: **o dwunastej**."
      }
     }
    ]
   },
   "explanation": null
  },
  "to": {
   "type": "DIALOGUE",
   "skill": "dialogue.weekend",
   "data": {
    "npc": {
     "name": "Asia",
     "emoji": "👩🏽",
     "role": {
      "uk": "подруга",
      "ru": "подруга",
      "en": "a friend"
     }
    },
    "steps": [
     {
      "npc": "Jakie masz plany na weekend?",
      "npcTr": {
       "uk": "Які в тебе плани на вихідні?",
       "ru": "Какие у тебя планы на выходные?",
       "en": "What are your plans for the weekend?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "W sobotę pójdę na spacer.",
        "tr": {
         "uk": "У суботу піду на прогулянку.",
         "ru": "В субботу пойду на прогулку.",
         "en": "On Saturday I'll go for a walk."
        }
       },
       {
        "id": "s0o1",
        "text": "W sobotę poszedłem na spacer.",
        "tr": {
         "uk": "(це про минуле, а питання — про плани)",
         "ru": "(это о прошлом, а вопрос — о планах)",
         "en": "(that is the past; the question is about plans)"
        }
       },
       {
        "id": "s0o2",
        "text": "W sobotę pójdę na spacerze.",
        "tr": {
         "uk": "(куди? — **na** + знахідний: na **spacer**)",
         "ru": "(куда? — **na** + винительный: na **spacer**)",
         "en": "(where to? — **na** + accusative: na **spacer**)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "Плани — майбутній час: **pójdę**.",
       "ru": "Планы — будущее время: **pójdę**.",
       "en": "Plans use the future: **pójdę**."
      }
     },
     {
      "npc": "Umówimy się na niedzielę?",
      "npcTr": {
       "uk": "Домовимося на неділю?",
       "ru": "Договоримся на воскресенье?",
       "en": "Shall we arrange something for Sunday?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Dobrze, w niedzielę o dwunastej.",
        "tr": {
         "uk": "Добре, у неділю о дванадцятій.",
         "ru": "Хорошо, в воскресенье в двенадцать.",
         "en": "OK, on Sunday at twelve."
        }
       },
       {
        "id": "s1o1",
        "text": "Dobrze, w niedzielę dwunasta.",
        "tr": {
         "uk": "(після o потрібен місцевий: o dwunastej)",
         "ru": "(после o нужен предложный: o dwunastej)",
         "en": "(after o use the locative: o dwunastej)"
        }
       },
       {
        "id": "s1o2",
        "text": "Dobrze, w niedzielę o dwunastą.",
        "tr": {
         "uk": "(**o** + місцевий: **o dwunastej**)",
         "ru": "(**o** + предложный: **o dwunastej**)",
         "en": "(**o** + locative: **o dwunastej**)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "Година — **o** + місцевий відмінок: **o dwunastej**.",
       "ru": "Время — **o** + предложный падеж: **o dwunastej**.",
       "en": "A clock time is **o** + locative: **o dwunastej**."
      }
     }
    ]
   },
   "explanation": null
  }
 },
 {
  "lesson": "opo-6-zaproszenie",
  "n": 5,
  "from": {
   "type": "DIALOGUE",
   "skill": "dialogue.invite",
   "data": {
    "npc": {
     "name": "Asia",
     "emoji": "👩🏽",
     "role": {
      "uk": "подруга",
      "ru": "подруга",
      "en": "a friend"
     }
    },
    "steps": [
     {
      "npc": "W sobotę robię imprezę. Chcesz wpaść?",
      "npcTr": {
       "uk": "У суботу влаштовую вечірку. Хочеш заскочити?",
       "ru": "В субботу устраиваю вечеринку. Хочешь заскочить?",
       "en": "I'm having a party on Saturday. Want to drop by?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Dziękuję za zaproszenie! Niestety nie dam rady.",
        "tr": {
         "uk": "Дякую за запрошення! На жаль, не зможу.",
         "ru": "Спасибо за приглашение! К сожалению, не смогу.",
         "en": "Thanks for the invitation! Unfortunately I can't make it."
        }
       },
       {
        "id": "s0o1",
        "text": "Dziękuję zaproszenie! Niestety nie dam rady.",
        "tr": {
         "uk": "(бракує za: dziękuję za zaproszenie)",
         "ru": "(не хватает za: dziękuję za zaproszenie)",
         "en": "(za is missing: dziękuję za zaproszenie)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "**Dziękować za** + знахідний: dziękuję za zaproszenie.",
       "ru": "**Dziękować za** + винительный: dziękuję za zaproszenie.",
       "en": "**Dziękować za** + accusative: dziękuję za zaproszenie."
      }
     },
     {
      "npc": "Szkoda… A może w niedzielę?",
      "npcTr": {
       "uk": "Шкода… А може, в неділю?",
       "ru": "Жаль… А может, в воскресенье?",
       "en": "Pity… Maybe on Sunday then?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Może innym razem. Dobrej zabawy!",
        "tr": {
         "uk": "Може, іншим разом. Гарної забави!",
         "ru": "Может, в другой раз. Хорошо повеселиться!",
         "en": "Maybe another time. Have fun!"
        }
       },
       {
        "id": "s1o1",
        "text": "Może inny raz. Dobrej zabawy!",
        "tr": {
         "uk": "(у фразі потрібна форма innym razem)",
         "ru": "(во фразе нужна форма innym razem)",
         "en": "(the phrase needs the form innym razem)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "Застигла фраза: **innym razem** («іншим разом»).",
       "ru": "Застывшая фраза: **innym razem** («в другой раз»).",
       "en": "A fixed phrase: **innym razem** (\"another time\")."
      }
     }
    ]
   },
   "explanation": null
  },
  "to": {
   "type": "DIALOGUE",
   "skill": "dialogue.invite",
   "data": {
    "npc": {
     "name": "Asia",
     "emoji": "👩🏽",
     "role": {
      "uk": "подруга",
      "ru": "подруга",
      "en": "a friend"
     }
    },
    "steps": [
     {
      "npc": "W sobotę robię imprezę. Chcesz wpaść?",
      "npcTr": {
       "uk": "У суботу влаштовую вечірку. Хочеш заскочити?",
       "ru": "В субботу устраиваю вечеринку. Хочешь заскочить?",
       "en": "I'm having a party on Saturday. Want to drop by?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Dziękuję za zaproszenie! Niestety nie dam rady.",
        "tr": {
         "uk": "Дякую за запрошення! На жаль, не зможу.",
         "ru": "Спасибо за приглашение! К сожалению, не смогу.",
         "en": "Thanks for the invitation! Unfortunately I can't make it."
        }
       },
       {
        "id": "s0o1",
        "text": "Dziękuję zaproszenie! Niestety nie dam rady.",
        "tr": {
         "uk": "(бракує za: dziękuję za zaproszenie)",
         "ru": "(не хватает za: dziękuję za zaproszenie)",
         "en": "(za is missing: dziękuję za zaproszenie)"
        }
       },
       {
        "id": "s0o2",
        "text": "Dziękuję na zaproszenie! Niestety nie dam rady.",
        "tr": {
         "uk": "(**dziękować za** + знахідний: za **zaproszenie**)",
         "ru": "(**dziękować za** + винительный: za **zaproszenie**)",
         "en": "(**dziękować za** + accusative: za **zaproszenie**)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "**Dziękować za** + знахідний: dziękuję za zaproszenie.",
       "ru": "**Dziękować za** + винительный: dziękuję za zaproszenie.",
       "en": "**Dziękować za** + accusative: dziękuję za zaproszenie."
      }
     },
     {
      "npc": "Szkoda… A może w niedzielę?",
      "npcTr": {
       "uk": "Шкода… А може, в неділю?",
       "ru": "Жаль… А может, в воскресенье?",
       "en": "Pity… Maybe on Sunday then?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Może innym razem. Dobrej zabawy!",
        "tr": {
         "uk": "Може, іншим разом. Гарної забави!",
         "ru": "Может, в другой раз. Хорошо повеселиться!",
         "en": "Maybe another time. Have fun!"
        }
       },
       {
        "id": "s1o1",
        "text": "Może inny raz. Dobrej zabawy!",
        "tr": {
         "uk": "(у фразі потрібна форма innym razem)",
         "ru": "(во фразе нужна форма innym razem)",
         "en": "(the phrase needs the form innym razem)"
        }
       },
       {
        "id": "s1o2",
        "text": "Może innym razie. Dobrej zabawy!",
        "tr": {
         "uk": "(**razem** — орудний: **innym razem**)",
         "ru": "(**razem** — творительный: **innym razem**)",
         "en": "(**razem** is instrumental: **innym razem**)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "Застигла фраза: **innym razem** («іншим разом»).",
       "ru": "Застывшая фраза: **innym razem** («в другой раз»).",
       "en": "A fixed phrase: **innym razem** (\"another time\")."
      }
     }
    ]
   },
   "explanation": null
  }
 },
 {
  "lesson": "opo-8-koncert",
  "n": 6,
  "from": {
   "type": "DIALOGUE",
   "skill": "dialogue.concert",
   "data": {
    "npc": {
     "name": "Piotr",
     "emoji": "🧑🏻",
     "role": {
      "uk": "волонтер фестивалю",
      "ru": "волонтёр фестиваля",
      "en": "a festival volunteer"
     }
    },
    "steps": [
     {
      "npc": "O której godzinie zaczyna się koncert?",
      "npcTr": {
       "uk": "О котрій годині починається концерт?",
       "ru": "В котором часу начинается концерт?",
       "en": "What time does the concert start?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Zaczyna się o dwudziestej.",
        "tr": {
         "uk": "Починається о двадцятій.",
         "ru": "Начинается в двадцать часов.",
         "en": "It starts at eight in the evening."
        }
       },
       {
        "id": "s0o1",
        "text": "Zaczyna się dwudziesta.",
        "tr": {
         "uk": "(після o потрібен місцевий: o dwudziestej)",
         "ru": "(после o нужен предложный: o dwudziestej)",
         "en": "(use the locative after o: o dwudziestej)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "Година — **o** + місцевий: **o dwudziestej**.",
       "ru": "Время — **o** + предложный: **o dwudziestej**.",
       "en": "A clock time is **o** + locative: **o dwudziestej**."
      }
     },
     {
      "npc": "A gdzie jest zespół?",
      "npcTr": {
       "uk": "А де гурт?",
       "ru": "А где группа?",
       "en": "And where is the band?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Zespół jest już na scenie.",
        "tr": {
         "uk": "Гурт уже на сцені.",
         "ru": "Группа уже на сцене.",
         "en": "The band is already on stage."
        }
       },
       {
        "id": "s1o1",
        "text": "Zespół jest już na scenę.",
        "tr": {
         "uk": "(де? — місцевий: na scenie)",
         "ru": "(где? — предложный: na scenie)",
         "en": "(where? — locative: na scenie)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "Де? — **na scenie**. Куди? — **na scenę**.",
       "ru": "Где? — **na scenie**. Куда? — **na scenę**.",
       "en": "Where? **na scenie**. To where? **na scenę**."
      }
     }
    ]
   },
   "explanation": null
  },
  "to": {
   "type": "DIALOGUE",
   "skill": "dialogue.concert",
   "data": {
    "npc": {
     "name": "Piotr",
     "emoji": "🧑🏻",
     "role": {
      "uk": "волонтер фестивалю",
      "ru": "волонтёр фестиваля",
      "en": "a festival volunteer"
     }
    },
    "steps": [
     {
      "npc": "O której godzinie zaczyna się koncert?",
      "npcTr": {
       "uk": "О котрій годині починається концерт?",
       "ru": "В котором часу начинается концерт?",
       "en": "What time does the concert start?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Zaczyna się o dwudziestej.",
        "tr": {
         "uk": "Починається о двадцятій.",
         "ru": "Начинается в двадцать часов.",
         "en": "It starts at eight in the evening."
        }
       },
       {
        "id": "s0o1",
        "text": "Zaczyna się dwudziesta.",
        "tr": {
         "uk": "(після o потрібен місцевий: o dwudziestej)",
         "ru": "(после o нужен предложный: o dwudziestej)",
         "en": "(use the locative after o: o dwudziestej)"
        }
       },
       {
        "id": "s0o2",
        "text": "Zaczyna się o dwadzieścia.",
        "tr": {
         "uk": "(година — порядковий числівник: **o dwudziestej**, а не **dwadzieścia**)",
         "ru": "(час — порядковое числительное: **o dwudziestej**, а не **dwadzieścia**)",
         "en": "(clock time uses an ordinal: **o dwudziestej**, not **dwadzieścia**)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "Година — **o** + місцевий: **o dwudziestej**.",
       "ru": "Время — **o** + предложный: **o dwudziestej**.",
       "en": "A clock time is **o** + locative: **o dwudziestej**."
      }
     },
     {
      "npc": "A gdzie jest zespół?",
      "npcTr": {
       "uk": "А де гурт?",
       "ru": "А где группа?",
       "en": "And where is the band?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Zespół jest już na scenie.",
        "tr": {
         "uk": "Гурт уже на сцені.",
         "ru": "Группа уже на сцене.",
         "en": "The band is already on stage."
        }
       },
       {
        "id": "s1o1",
        "text": "Zespół jest już na scenę.",
        "tr": {
         "uk": "(де? — місцевий: na scenie)",
         "ru": "(где? — предложный: na scenie)",
         "en": "(where? — locative: na scenie)"
        }
       },
       {
        "id": "s1o2",
        "text": "Zespół jest już w scenie.",
        "tr": {
         "uk": "(сцена — **na** scenie, а не **w**)",
         "ru": "(сцена — **na** scenie, а не **w**)",
         "en": "(a stage takes **na** scenie, not **w**)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "Де? — **na scenie**. Куди? — **na scenę**.",
       "ru": "Где? — **na scenie**. Куда? — **na scenę**.",
       "en": "Where? **na scenie**. To where? **na scenę**."
      }
     }
    ]
   },
   "explanation": null
  }
 },
 {
  "lesson": "opo-10-nagroda",
  "n": 7,
  "from": {
   "type": "DIALOGUE",
   "skill": "dialogue.contest",
   "data": {
    "npc": {
     "name": "Piotr",
     "emoji": "🧑🏻",
     "role": {
      "uk": "волонтер фестивалю",
      "ru": "волонтёр фестиваля",
      "en": "a festival volunteer"
     }
    },
    "steps": [
     {
      "npc": "Na kogo głosujesz w finale?",
      "npcTr": {
       "uk": "За кого голосуєш у фіналі?",
       "ru": "За кого голосуешь в финале?",
       "en": "Who are you voting for in the final?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Głosuję na Anię, ma najlepszy głos.",
        "tr": {
         "uk": "Голосую за Аню, у неї найкращий голос.",
         "ru": "Голосую за Аню, у неё лучший голос.",
         "en": "I'm voting for Ania, she has the best voice."
        }
       },
       {
        "id": "s0o1",
        "text": "Głosuję za Anię, ma najlepszy głos.",
        "tr": {
         "uk": "(za не підходить: głosować na kogoś)",
         "ru": "(za не подходит: głosować na kogoś)",
         "en": "(za is wrong here: głosować na kogoś)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "**Głosować na** + знахідний: **na Anię**.",
       "ru": "**Głosować na** + винительный: **na Anię**.",
       "en": "**Głosować na** + accusative: **na Anię**."
      }
     },
     {
      "npc": "Jak myślisz, kto wygra?",
      "npcTr": {
       "uk": "Як гадаєш, хто виграє?",
       "ru": "Как думаешь, кто выиграет?",
       "en": "Who do you think will win?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Moim zdaniem wygra Ania.",
        "tr": {
         "uk": "На мою думку, виграє Аня.",
         "ru": "По-моему, выиграет Аня.",
         "en": "In my opinion Ania will win."
        }
       },
       {
        "id": "s1o1",
        "text": "Moim zdaniem wygrała Ania.",
        "tr": {
         "uk": "(це минулий час, а фінал ще не відбувся)",
         "ru": "(это прошедшее время, а финал ещё не состоялся)",
         "en": "(that is the past, but the final has not happened yet)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "Про майбутній результат — **wygra**.",
       "ru": "О будущем результате — **wygra**.",
       "en": "For a future result use **wygra**."
      }
     }
    ]
   },
   "explanation": null
  },
  "to": {
   "type": "DIALOGUE",
   "skill": "dialogue.contest",
   "data": {
    "npc": {
     "name": "Piotr",
     "emoji": "🧑🏻",
     "role": {
      "uk": "волонтер фестивалю",
      "ru": "волонтёр фестиваля",
      "en": "a festival volunteer"
     }
    },
    "steps": [
     {
      "npc": "Na kogo głosujesz w finale?",
      "npcTr": {
       "uk": "За кого голосуєш у фіналі?",
       "ru": "За кого голосуешь в финале?",
       "en": "Who are you voting for in the final?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Głosuję na Anię, ma najlepszy głos.",
        "tr": {
         "uk": "Голосую за Аню, у неї найкращий голос.",
         "ru": "Голосую за Аню, у неё лучший голос.",
         "en": "I'm voting for Ania, she has the best voice."
        }
       },
       {
        "id": "s0o1",
        "text": "Głosuję za Anię, ma najlepszy głos.",
        "tr": {
         "uk": "(za не підходить: głosować na kogoś)",
         "ru": "(za не подходит: głosować na kogoś)",
         "en": "(za is wrong here: głosować na kogoś)"
        }
       },
       {
        "id": "s0o2",
        "text": "Głosuję na Ania, ma najlepszy głos.",
        "tr": {
         "uk": "(**głosować na** + знахідний: **Anię**)",
         "ru": "(**głosować na** + винительный: **Anię**)",
         "en": "(**głosować na** + accusative: **Anię**)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "**Głosować na** + знахідний: **na Anię**.",
       "ru": "**Głosować na** + винительный: **na Anię**.",
       "en": "**Głosować na** + accusative: **na Anię**."
      }
     },
     {
      "npc": "Jak myślisz, kto wygra?",
      "npcTr": {
       "uk": "Як гадаєш, хто виграє?",
       "ru": "Как думаешь, кто выиграет?",
       "en": "Who do you think will win?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Moim zdaniem wygra Ania.",
        "tr": {
         "uk": "На мою думку, виграє Аня.",
         "ru": "По-моему, выиграет Аня.",
         "en": "In my opinion Ania will win."
        }
       },
       {
        "id": "s1o1",
        "text": "Moim zdaniem wygrała Ania.",
        "tr": {
         "uk": "(це минулий час, а фінал ще не відбувся)",
         "ru": "(это прошедшее время, а финал ещё не состоялся)",
         "en": "(that is the past, but the final has not happened yet)"
        }
       },
       {
        "id": "s1o2",
        "text": "Moim zdaniem wygrają Ania.",
        "tr": {
         "uk": "(Ania — одна: **wygra**; **wygrają** — «виграють» (кілька))",
         "ru": "(Ania — одна: **wygra**; **wygrają** — «выиграют» (несколько))",
         "en": "(Ania is one person: **wygra**; **wygrają** is plural)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "Про майбутній результат — **wygra**.",
       "ru": "О будущем результате — **wygra**.",
       "en": "For a future result use **wygra**."
      }
     }
    ]
   },
   "explanation": null
  }
 },
 {
  "lesson": "opo-boss",
  "n": 0,
  "from": {
   "type": "SITUATION",
   "skill": "situation.boss",
   "data": {
    "npc": {
     "name": "Kuba",
     "emoji": "🧑🏼",
     "role": {
      "uk": "друг-студент",
      "ru": "друг-студент",
      "en": "a student friend"
     }
    },
    "scene": {
     "uk": "Вечір на фестивалі в Ополі",
     "ru": "Вечер на фестивале в Ополе",
     "en": "An evening at the Opole festival"
    },
    "steps": [
     {
      "npc": "Siema! Jesteś na festiwalu? Ale tłum!",
      "npcTr": {
       "uk": "Привіт! Ти на фестивалі? Оце натовп!",
       "ru": "Привет! Ты на фестивале? Вот толпа!",
       "en": "Hi! Are you at the festival? What a crowd!"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Siema! Tak, ale sztos!",
        "tr": {
         "uk": "Привіт! Так, оце бомба!",
         "ru": "Привет! Да, вот это бомба!",
         "en": "Hi! Yes, it's awesome!"
        }
       },
       {
        "id": "s0o1",
        "text": "Dzień dobry panu! Tak, jest bardzo przyjemnie.",
        "tr": {
         "uk": "(занадто офіційно для друга)",
         "ru": "(слишком официально для друга)",
         "en": "(too formal for a friend)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "Другові — розмовно.",
       "ru": "Другу — разговорно.",
       "en": "Casual with a friend."
      }
     },
     {
      "npc": "Widzisz gdzieś Anię?",
      "npcTr": {
       "uk": "Бачиш десь Аню?",
       "ru": "Видишь где-нибудь Аню?",
       "en": "Can you see Ania anywhere?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Nie, nigdzie jej nie widzę.",
        "tr": {
         "uk": "Ні, ніде її не бачу.",
         "ru": "Нет, нигде её не вижу.",
         "en": "No, I can't see her anywhere."
        }
       },
       {
        "id": "s1o1",
        "text": "Nie, nigdzie jej widzę.",
        "tr": {
         "uk": "(бракує «nie»)",
         "ru": "(не хватает «nie»)",
         "en": "(missing \"nie\")"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "**nigdzie** + **nie**.",
       "ru": "**nigdzie** + **nie**.",
       "en": "**nigdzie** + **nie**."
      }
     }
    ]
   },
   "explanation": null
  },
  "to": {
   "type": "SITUATION",
   "skill": "situation.boss",
   "data": {
    "npc": {
     "name": "Kuba",
     "emoji": "🧑🏼",
     "role": {
      "uk": "друг-студент",
      "ru": "друг-студент",
      "en": "a student friend"
     }
    },
    "scene": {
     "uk": "Вечір на фестивалі в Ополі",
     "ru": "Вечер на фестивале в Ополе",
     "en": "An evening at the Opole festival"
    },
    "steps": [
     {
      "npc": "Siema! Jesteś na festiwalu? Ale tłum!",
      "npcTr": {
       "uk": "Привіт! Ти на фестивалі? Оце натовп!",
       "ru": "Привет! Ты на фестивале? Вот толпа!",
       "en": "Hi! Are you at the festival? What a crowd!"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Siema! Tak, ale sztos!",
        "tr": {
         "uk": "Привіт! Так, оце бомба!",
         "ru": "Привет! Да, вот это бомба!",
         "en": "Hi! Yes, it's awesome!"
        }
       },
       {
        "id": "s0o1",
        "text": "Dzień dobry panu! Tak, jest bardzo przyjemnie.",
        "tr": {
         "uk": "(занадто офіційно для друга)",
         "ru": "(слишком официально для друга)",
         "en": "(too formal for a friend)"
        }
       },
       {
        "id": "s0o2",
        "text": "Siema! Nie, ale sztos!",
        "tr": {
         "uk": "(**Nie** — «ні», але «ale sztos!» показує, що ти там)",
         "ru": "(**Nie** — «нет», но «ale sztos!» показывает, что ты там)",
         "en": "(**Nie** says “no”, yet “ale sztos!” shows you are there)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "Другові — розмовно.",
       "ru": "Другу — разговорно.",
       "en": "Casual with a friend."
      }
     },
     {
      "npc": "Widzisz gdzieś Anię?",
      "npcTr": {
       "uk": "Бачиш десь Аню?",
       "ru": "Видишь где-нибудь Аню?",
       "en": "Can you see Ania anywhere?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Nie, nigdzie jej nie widzę.",
        "tr": {
         "uk": "Ні, ніде її не бачу.",
         "ru": "Нет, нигде её не вижу.",
         "en": "No, I can't see her anywhere."
        }
       },
       {
        "id": "s1o1",
        "text": "Nie, nigdzie jej widzę.",
        "tr": {
         "uk": "(бракує «nie»)",
         "ru": "(не хватает «nie»)",
         "en": "(missing \"nie\")"
        }
       },
       {
        "id": "s1o2",
        "text": "Nie, nigdzie ją nie widzę.",
        "tr": {
         "uk": "(після заперечення — родовий: **nie widzę jej**)",
         "ru": "(после отрицания — родительный: **nie widzę jej**)",
         "en": "(after a negation use the genitive: **nie widzę jej**)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "**nigdzie** + **nie**.",
       "ru": "**nigdzie** + **nie**.",
       "en": "**nigdzie** + **nie**."
      }
     }
    ]
   },
   "explanation": null
  }
 },
 {
  "lesson": "wro-1-kawa",
  "n": 7,
  "from": {
   "type": "LISTENING",
   "skill": "listening.cafe",
   "data": {
    "audioText": "Na miejscu czy na wynos?",
    "options": [
     {
      "id": "o0",
      "text": "Na miejscu czy na wynos?"
     },
     {
      "id": "o1",
      "text": "Poproszę na wynos."
     },
     {
      "id": "o2",
      "text": "Kawa czy herbata?"
     }
    ],
    "answer": "o0"
   },
   "explanation": null
  },
  "to": {
   "type": "LISTENING",
   "skill": "listening.cafe",
   "data": {
    "audioText": "Na miejscu czy na wynos?",
    "options": [
     {
      "id": "o0",
      "text": "Na miejscu czy na wynos?"
     },
     {
      "id": "o1",
      "text": "Poproszę na wynos."
     },
     {
      "id": "o2",
      "text": "Na miejscu czy na tarasie?"
     }
    ],
    "answer": "o0"
   },
   "explanation": null
  }
 },
 {
  "lesson": "wro-1-kawa",
  "n": 9,
  "from": {
   "type": "SITUATION",
   "skill": "situation.cafe",
   "data": {
    "npc": {
     "name": "Bartek",
     "emoji": "🧑🏻‍🍳",
     "role": {
      "uk": "бариста у кав'ярні",
      "ru": "бариста в кофейне",
      "en": "a barista"
     }
    },
    "scene": {
     "uk": "Ранок у кав'ярні на Ринку у Вроцлаві.",
     "ru": "Утро в кофейне на Рынке во Вроцлаве.",
     "en": "Morning in a café on Wrocław's Market Square."
    },
    "steps": [
     {
      "npc": "Dzień dobry! Co podać?",
      "npcTr": {
       "uk": "Добрий день! Що вам подати?",
       "ru": "Добрый день! Что вам подать?",
       "en": "Hello! What can I get you?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Poproszę herbatę.",
        "tr": {
         "uk": "Чай, будь ласка.",
         "ru": "Чай, пожалуйста.",
         "en": "A tea, please."
        }
       },
       {
        "id": "s0o1",
        "text": "Poproszę herbata.",
        "tr": {
         "uk": "(помилка у відмінку)",
         "ru": "(ошибка в падеже)",
         "en": "(case error)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "Після **poproszę**: **herbatę**.",
       "ru": "После **poproszę**: **herbatę**.",
       "en": "After **poproszę**: **herbatę**."
      }
     },
     {
      "npc": "Na miejscu czy na wynos?",
      "npcTr": {
       "uk": "Тут чи з собою?",
       "ru": "Здесь или с собой?",
       "en": "For here or to go?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Na wynos, proszę.",
        "tr": {
         "uk": "З собою, будь ласка.",
         "ru": "С собой, пожалуйста.",
         "en": "To go, please."
        }
       },
       {
        "id": "s1o1",
        "text": "Na miejsce, proszę.",
        "tr": {
         "uk": "Тут, будь ласка. (з помилкою)",
         "ru": "Здесь, пожалуйста. (с ошибкой)",
         "en": "For here, please. (a mistake)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "Відповідь — як у питанні: **na miejscu** (місцевий відмінок: «де?») або **na wynos** (з собою).",
       "ru": "Ответ — как в вопросе: **na miejscu** (предложный падеж: «где?») или **na wynos** (с собой).",
       "en": "Answer with the same forms: **na miejscu** (locative, \"where?\") or **na wynos** (to go)."
      }
     },
     {
      "npc": "Proszę bardzo. Dwanaście złotych.",
      "npcTr": {
       "uk": "Прошу. Дванадцять злотих.",
       "ru": "Пожалуйста. Двенадцать злотых.",
       "en": "Here you are. Twelve zlotys."
      }
     }
    ]
   },
   "explanation": null
  },
  "to": {
   "type": "SITUATION",
   "skill": "situation.cafe",
   "data": {
    "npc": {
     "name": "Bartek",
     "emoji": "🧑🏻‍🍳",
     "role": {
      "uk": "бариста у кав'ярні",
      "ru": "бариста в кофейне",
      "en": "a barista"
     }
    },
    "scene": {
     "uk": "Ранок у кав'ярні на Ринку у Вроцлаві.",
     "ru": "Утро в кофейне на Рынке во Вроцлаве.",
     "en": "Morning in a café on Wrocław's Market Square."
    },
    "steps": [
     {
      "npc": "Dzień dobry! Co podać?",
      "npcTr": {
       "uk": "Добрий день! Що вам подати?",
       "ru": "Добрый день! Что вам подать?",
       "en": "Hello! What can I get you?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Poproszę herbatę.",
        "tr": {
         "uk": "Чай, будь ласка.",
         "ru": "Чай, пожалуйста.",
         "en": "A tea, please."
        }
       },
       {
        "id": "s0o1",
        "text": "Poproszę herbata.",
        "tr": {
         "uk": "(помилка у відмінку)",
         "ru": "(ошибка в падеже)",
         "en": "(case error)"
        }
       },
       {
        "id": "s0o2",
        "text": "Poproszę herbaty.",
        "tr": {
         "uk": "(**poprosić o** + знахідний: **poproszę herbatę**; родовий не підходить)",
         "ru": "(**poprosić** + винительный: **poproszę herbatę**; родительный не подходит)",
         "en": "(**poproszę** takes the accusative: **herbatę**, not the genitive)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "Після **poproszę**: **herbatę**.",
       "ru": "После **poproszę**: **herbatę**.",
       "en": "After **poproszę**: **herbatę**."
      }
     },
     {
      "npc": "Na miejscu czy na wynos?",
      "npcTr": {
       "uk": "Тут чи з собою?",
       "ru": "Здесь или с собой?",
       "en": "For here or to go?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Na wynos, proszę.",
        "tr": {
         "uk": "З собою, будь ласка.",
         "ru": "С собой, пожалуйста.",
         "en": "To go, please."
        }
       },
       {
        "id": "s1o1",
        "text": "Na miejsce, proszę.",
        "tr": {
         "uk": "Тут, будь ласка. (з помилкою)",
         "ru": "Здесь, пожалуйста. (с ошибкой)",
         "en": "For here, please. (a mistake)"
        }
       },
       {
        "id": "s1o2",
        "text": "Na wynosie, proszę.",
        "tr": {
         "uk": "(**na wynos** — незмінний вираз «з собою»)",
         "ru": "(**na wynos** — неизменяемое выражение «с собой»)",
         "en": "(**na wynos** is a fixed phrase meaning “to take away”)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "Відповідь — як у питанні: **na miejscu** (місцевий відмінок: «де?») або **na wynos** (з собою).",
       "ru": "Ответ — как в вопросе: **na miejscu** (предложный падеж: «где?») или **na wynos** (с собой).",
       "en": "Answer with the same forms: **na miejscu** (locative, \"where?\") or **na wynos** (to go)."
      }
     },
     {
      "npc": "Proszę bardzo. Dwanaście złotych.",
      "npcTr": {
       "uk": "Прошу. Дванадцять злотих.",
       "ru": "Пожалуйста. Двенадцать злотых.",
       "en": "Here you are. Twelve zlotys."
      }
     }
    ]
   },
   "explanation": null
  }
 },
 {
  "lesson": "wro-2-zabka",
  "n": 7,
  "from": {
   "type": "LISTENING",
   "skill": "listening.shopping",
   "data": {
    "audioText": "Kartą czy gotówką?",
    "options": [
     {
      "id": "o0",
      "text": "Kartą czy gotówką?"
     },
     {
      "id": "o1",
      "text": "Torba czy paragon?"
     },
     {
      "id": "o2",
      "text": "Kawa czy herbata?"
     }
    ],
    "answer": "o0"
   },
   "explanation": null
  },
  "to": {
   "type": "LISTENING",
   "skill": "listening.shopping",
   "data": {
    "audioText": "Kartą czy gotówką?",
    "options": [
     {
      "id": "o0",
      "text": "Kartą czy gotówką?"
     },
     {
      "id": "o1",
      "text": "Torba czy paragon?"
     },
     {
      "id": "o2",
      "text": "Kartą czy telefonem?"
     }
    ],
    "answer": "o0"
   },
   "explanation": null
  }
 },
 {
  "lesson": "wro-2-zabka",
  "n": 8,
  "from": {
   "type": "SITUATION",
   "skill": "situation.shopping",
   "data": {
    "npc": {
     "name": "Pani Magda",
     "emoji": "👩🏼‍💼",
     "role": {
      "uk": "касирка в Żabce",
      "ru": "кассирша в Żabka",
      "en": "a cashier at Żabka"
     }
    },
    "scene": {
     "uk": "Ти зайшов у Żabku купити булочку.",
     "ru": "Ты зашёл в Żabka купить булочку.",
     "en": "You popped into Żabka to buy a roll."
    },
    "steps": [
     {
      "npc": "Dzień dobry!",
      "npcTr": {
       "uk": "Добрий день!",
       "ru": "Добрый день!",
       "en": "Hello!"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Dzień dobry! Ile kosztuje ta bułka?",
        "tr": {
         "uk": "Добрий день! Скільки коштує ця булочка?",
         "ru": "Добрый день! Сколько стоит эта булочка?",
         "en": "Hello! How much is this roll?"
        }
       },
       {
        "id": "s0o1",
        "text": "Cześć, ziomek!",
        "tr": {
         "uk": "Здоров, брате!",
         "ru": "Здорово, братан!",
         "en": "Yo, bro!"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "З касиркою — формально: **Dzień dobry!**",
       "ru": "С кассиршей — формально: **Dzień dobry!**",
       "en": "With a cashier be formal: **Dzień dobry!**"
      }
     },
     {
      "npc": "Dwa złote. Coś jeszcze?",
      "npcTr": {
       "uk": "Два злотих. Щось іще?",
       "ru": "Два злотых. Что-нибудь ещё?",
       "en": "Two zlotys. Anything else?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Nie, dziękuję.",
        "tr": {
         "uk": "Ні, дякую.",
         "ru": "Нет, спасибо.",
         "en": "No, thank you."
        }
       },
       {
        "id": "s1o1",
        "text": "Tak, to wszystko.",
        "tr": {
         "uk": "Так, це все.",
         "ru": "Да, это всё.",
         "en": "Yes, that's all."
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "«Coś jeszcze?» — «Щось іще?». «Tak» означає, що ти хочеш ще щось. Якщо більше нічого не треба: **Nie, dziękuję** або **Nie, to wszystko.**",
       "ru": "«Coś jeszcze?» — «Что-нибудь ещё?». «Tak» значит, что ты хочешь что-то ещё. Если больше ничего не нужно: **Nie, dziękuję** или **Nie, to wszystko.**",
       "en": "\"Coś jeszcze?\" means \"anything else?\". \"Tak\" means you want more. If not: **Nie, dziękuję** or **Nie, to wszystko.**"
      }
     },
     {
      "npc": "Kartą czy gotówką?",
      "npcTr": {
       "uk": "Карткою чи готівкою?",
       "ru": "Картой или наличными?",
       "en": "Card or cash?"
      },
      "options": [
       {
        "id": "s2o0",
        "text": "Kartą, proszę.",
        "tr": {
         "uk": "Карткою, будь ласка.",
         "ru": "Картой, пожалуйста.",
         "en": "By card, please."
        }
       },
       {
        "id": "s2o1",
        "text": "Karta, proszę.",
        "tr": {
         "uk": "(помилка у відмінку)",
         "ru": "(ошибка в падеже)",
         "en": "(case error)"
        }
       }
      ],
      "answer": "s2o0",
      "feedback": {
       "uk": "Чим? — **kartą** (орудний відмінок).",
       "ru": "Чем? — **kartą** (творительный падеж).",
       "en": "With what? — **kartą** (instrumental)."
      }
     },
     {
      "npc": "Paragon?",
      "npcTr": {
       "uk": "Чек?",
       "ru": "Чек?",
       "en": "Receipt?"
      },
      "options": [
       {
        "id": "s3o0",
        "text": "Nie, dziękuję. Do widzenia!",
        "tr": {
         "uk": "Ні, дякую. До побачення!",
         "ru": "Нет, спасибо. До свидания!",
         "en": "No, thanks. Goodbye!"
        }
       },
       {
        "id": "s3o1",
        "text": "Nie, mam swoją torbę.",
        "tr": {
         "uk": "Ні, у мене своя торба.",
         "ru": "Нет, у меня своя сумка.",
         "en": "No, I have my own bag."
        }
       }
      ],
      "answer": "s3o0",
      "feedback": {
       "uk": "Питають про чек (**paragon**), а не про пакет. Відповідай: **Nie, dziękuję** або **Tak, poproszę** — і попрощайся.",
       "ru": "Спрашивают о чеке (**paragon**), а не о пакете. Ответь: **Nie, dziękuję** или **Tak, poproszę** — и попрощайся.",
       "en": "They ask about the receipt (**paragon**), not a bag. Answer **Nie, dziękuję** or **Tak, poproszę** and say goodbye."
      }
     }
    ]
   },
   "explanation": null
  },
  "to": {
   "type": "SITUATION",
   "skill": "situation.shopping",
   "data": {
    "npc": {
     "name": "Pani Magda",
     "emoji": "👩🏼‍💼",
     "role": {
      "uk": "касирка в Żabce",
      "ru": "кассирша в Żabka",
      "en": "a cashier at Żabka"
     }
    },
    "scene": {
     "uk": "Ти зайшов у Żabku купити булочку.",
     "ru": "Ты зашёл в Żabka купить булочку.",
     "en": "You popped into Żabka to buy a roll."
    },
    "steps": [
     {
      "npc": "Dzień dobry!",
      "npcTr": {
       "uk": "Добрий день!",
       "ru": "Добрый день!",
       "en": "Hello!"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Dzień dobry! Ile kosztuje ta bułka?",
        "tr": {
         "uk": "Добрий день! Скільки коштує ця булочка?",
         "ru": "Добрый день! Сколько стоит эта булочка?",
         "en": "Hello! How much is this roll?"
        }
       },
       {
        "id": "s0o1",
        "text": "Cześć, ziomek!",
        "tr": {
         "uk": "Здоров, брате!",
         "ru": "Здорово, братан!",
         "en": "Yo, bro!"
        }
       },
       {
        "id": "s0o2",
        "text": "Dobranoc! Ile kosztuje ta bułka?",
        "tr": {
         "uk": "(**Dobranoc** — на добраніч; вдень вітаються **dzień dobry**)",
         "ru": "(**Dobranoc** — спокойной ночи; днём здороваются **dzień dobry**)",
         "en": "(**Dobranoc** is “good night”; by day greet with **dzień dobry**)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "З касиркою — формально: **Dzień dobry!**",
       "ru": "С кассиршей — формально: **Dzień dobry!**",
       "en": "With a cashier be formal: **Dzień dobry!**"
      }
     },
     {
      "npc": "Dwa złote. Coś jeszcze?",
      "npcTr": {
       "uk": "Два злотих. Щось іще?",
       "ru": "Два злотых. Что-нибудь ещё?",
       "en": "Two zlotys. Anything else?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Nie, dziękuję.",
        "tr": {
         "uk": "Ні, дякую.",
         "ru": "Нет, спасибо.",
         "en": "No, thank you."
        }
       },
       {
        "id": "s1o1",
        "text": "Tak, to wszystko.",
        "tr": {
         "uk": "Так, це все.",
         "ru": "Да, это всё.",
         "en": "Yes, that's all."
        }
       },
       {
        "id": "s1o2",
        "text": "Nie, proszę bardzo.",
        "tr": {
         "uk": "(**Proszę bardzo** — «будь ласка» (подаючи щось); відмова — **Nie, dziękuję**)",
         "ru": "(**Proszę bardzo** — «пожалуйста» (когда подают); отказ — **Nie, dziękuję**)",
         "en": "(**Proszę bardzo** means “here you are”; to decline say **Nie, dziękuję**)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "«Coś jeszcze?» — «Щось іще?». «Tak» означає, що ти хочеш ще щось. Якщо більше нічого не треба: **Nie, dziękuję** або **Nie, to wszystko.**",
       "ru": "«Coś jeszcze?» — «Что-нибудь ещё?». «Tak» значит, что ты хочешь что-то ещё. Если больше ничего не нужно: **Nie, dziękuję** или **Nie, to wszystko.**",
       "en": "\"Coś jeszcze?\" means \"anything else?\". \"Tak\" means you want more. If not: **Nie, dziękuję** or **Nie, to wszystko.**"
      }
     },
     {
      "npc": "Kartą czy gotówką?",
      "npcTr": {
       "uk": "Карткою чи готівкою?",
       "ru": "Картой или наличными?",
       "en": "Card or cash?"
      },
      "options": [
       {
        "id": "s2o0",
        "text": "Kartą, proszę.",
        "tr": {
         "uk": "Карткою, будь ласка.",
         "ru": "Картой, пожалуйста.",
         "en": "By card, please."
        }
       },
       {
        "id": "s2o1",
        "text": "Karta, proszę.",
        "tr": {
         "uk": "(помилка у відмінку)",
         "ru": "(ошибка в падеже)",
         "en": "(case error)"
        }
       },
       {
        "id": "s2o2",
        "text": "Kartę, proszę.",
        "tr": {
         "uk": "(**czym?** — орудний: **kartą**; «kartę» — знахідний)",
         "ru": "(**чем?** — творительный: **kartą**; «kartę» — винительный)",
         "en": "(**by what?** — instrumental: **kartą**; “kartę” is the accusative)"
        }
       }
      ],
      "answer": "s2o0",
      "feedback": {
       "uk": "Чим? — **kartą** (орудний відмінок).",
       "ru": "Чем? — **kartą** (творительный падеж).",
       "en": "With what? — **kartą** (instrumental)."
      }
     },
     {
      "npc": "Paragon?",
      "npcTr": {
       "uk": "Чек?",
       "ru": "Чек?",
       "en": "Receipt?"
      },
      "options": [
       {
        "id": "s3o0",
        "text": "Nie, dziękuję. Do widzenia!",
        "tr": {
         "uk": "Ні, дякую. До побачення!",
         "ru": "Нет, спасибо. До свидания!",
         "en": "No, thanks. Goodbye!"
        }
       },
       {
        "id": "s3o1",
        "text": "Nie, mam swoją torbę.",
        "tr": {
         "uk": "Ні, у мене своя торба.",
         "ru": "Нет, у меня своя сумка.",
         "en": "No, I have my own bag."
        }
       },
       {
        "id": "s3o2",
        "text": "Nie, dziękuję. Do widzenie!",
        "tr": {
         "uk": "(**do** + родовий: **do widzenia**)",
         "ru": "(**do** + родительный: **do widzenia**)",
         "en": "(**do** takes the genitive: **do widzenia**)"
        }
       }
      ],
      "answer": "s3o0",
      "feedback": {
       "uk": "Питають про чек (**paragon**), а не про пакет. Відповідай: **Nie, dziękuję** або **Tak, poproszę** — і попрощайся.",
       "ru": "Спрашивают о чеке (**paragon**), а не о пакете. Ответь: **Nie, dziękuję** или **Tak, poproszę** — и попрощайся.",
       "en": "They ask about the receipt (**paragon**), not a bag. Answer **Nie, dziękuję** or **Tak, poproszę** and say goodbye."
      }
     }
    ]
   },
   "explanation": null
  }
 },
 {
  "lesson": "wro-4-restauracja",
  "n": 8,
  "from": {
   "type": "SITUATION",
   "skill": "situation.restaurant",
   "data": {
    "npc": {
     "name": "Pan Tomek",
     "emoji": "🤵🏻",
     "role": {
      "uk": "офіціант",
      "ru": "официант",
      "en": "a waiter"
     }
    },
    "scene": {
     "uk": "Ти обідаєш у ресторані біля Ратуші.",
     "ru": "Ты обедаешь в ресторане у Ратуши.",
     "en": "You are having lunch near the Town Hall."
    },
    "steps": [
     {
      "npc": "Dzień dobry. Co dla pana?",
      "npcTr": {
       "uk": "Добрий день. Що для вас?",
       "ru": "Добрый день. Что для вас?",
       "en": "Hello. What would you like?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Poproszę zupę pomidorową i pierogi.",
        "tr": {
         "uk": "Томатний суп і вареники, будь ласка.",
         "ru": "Томатный суп и вареники, пожалуйста.",
         "en": "Tomato soup and pierogi, please."
        }
       },
       {
        "id": "s0o1",
        "text": "Poproszę rachunek.",
        "tr": {
         "uk": "Рахунок, будь ласка.",
         "ru": "Счёт, пожалуйста.",
         "en": "The bill, please."
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "Спочатку замовлення, рахунок — наприкінці!",
       "ru": "Сначала заказ, счёт — в конце!",
       "en": "Order first, the bill comes at the end!"
      }
     },
     {
      "npc": "A do picia?",
      "npcTr": {
       "uk": "А що пити?",
       "ru": "А что пить?",
       "en": "And to drink?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Dla mnie sok jabłkowy.",
        "tr": {
         "uk": "Мені яблучний сік.",
         "ru": "Мне яблочный сок.",
         "en": "Apple juice for me."
        }
       },
       {
        "id": "s1o1",
        "text": "Dla mnie sok jabłkowa.",
        "tr": {
         "uk": "Мені яблучний сік. (з помилкою)",
         "ru": "Мне яблочный сок. (с ошибкой)",
         "en": "Apple juice for me. (a mistake)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "**Sok** — чоловічого роду, тож прикметник теж: **sok jabłkowy** (закінчення -a — для жіночого роду: herbata owocowa).",
       "ru": "**Sok** — мужского рода, поэтому и прилагательное: **sok jabłkowy** (окончание -a — для женского рода: herbata owocowa).",
       "en": "**Sok** is masculine, so the adjective is too: **sok jabłkowy** (feminine -a goes with feminine nouns: herbata owocowa)."
      }
     },
     {
      "npc": "Proszę bardzo. Smacznego!",
      "npcTr": {
       "uk": "Прошу. Смачного!",
       "ru": "Пожалуйста. Приятного аппетита!",
       "en": "Here you are. Enjoy!"
      },
      "options": [
       {
        "id": "s2o0",
        "text": "Dziękuję!",
        "tr": {
         "uk": "Дякую!",
         "ru": "Спасибо!",
         "en": "Thank you!"
        }
       },
       {
        "id": "s2o1",
        "text": "Nawzajem!",
        "tr": {
         "uk": "Навзаєм!",
         "ru": "Взаимно!",
         "en": "You too!"
        }
       }
      ],
      "answer": "s2o0",
      "feedback": {
       "uk": "Офіціант не їсть разом із тобою — «nawzajem» тут не підходить. Йому просто кажуть **Dziękuję!**",
       "ru": "Официант не ест вместе с тобой — «nawzajem» здесь не подходит. Ему просто говорят **Dziękuję!**",
       "en": "The waiter isn't eating with you, so \"nawzajem\" doesn't fit. Just say **Dziękuję!**"
      }
     },
     {
      "npc": "(Po obiedzie)",
      "npcTr": {
       "uk": "(Після обіду)",
       "ru": "(После обеда)",
       "en": "(After lunch)"
      },
      "options": [
       {
        "id": "s3o0",
        "text": "Poproszę rachunek. Czy mogę zapłacić kartą?",
        "tr": {
         "uk": "Рахунок, будь ласка. Можна карткою?",
         "ru": "Счёт, пожалуйста. Можно картой?",
         "en": "The bill, please. Can I pay by card?"
        }
       },
       {
        "id": "s3o1",
        "text": "Poproszę menu.",
        "tr": {
         "uk": "Меню, будь ласка.",
         "ru": "Меню, пожалуйста.",
         "en": "The menu, please."
        }
       }
      ],
      "answer": "s3o0",
      "feedback": {
       "uk": "Після обіду просять **rachunek**.",
       "ru": "После обеда просят **rachunek**.",
       "en": "After the meal ask for **rachunek**."
      }
     }
    ]
   },
   "explanation": null
  },
  "to": {
   "type": "SITUATION",
   "skill": "situation.restaurant",
   "data": {
    "npc": {
     "name": "Pan Tomek",
     "emoji": "🤵🏻",
     "role": {
      "uk": "офіціант",
      "ru": "официант",
      "en": "a waiter"
     }
    },
    "scene": {
     "uk": "Ти обідаєш у ресторані біля Ратуші.",
     "ru": "Ты обедаешь в ресторане у Ратуши.",
     "en": "You are having lunch near the Town Hall."
    },
    "steps": [
     {
      "npc": "Dzień dobry. Co dla pana?",
      "npcTr": {
       "uk": "Добрий день. Що для вас?",
       "ru": "Добрый день. Что для вас?",
       "en": "Hello. What would you like?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Poproszę zupę pomidorową i pierogi.",
        "tr": {
         "uk": "Томатний суп і вареники, будь ласка.",
         "ru": "Томатный суп и вареники, пожалуйста.",
         "en": "Tomato soup and pierogi, please."
        }
       },
       {
        "id": "s0o1",
        "text": "Poproszę rachunek.",
        "tr": {
         "uk": "Рахунок, будь ласка.",
         "ru": "Счёт, пожалуйста.",
         "en": "The bill, please."
        }
       },
       {
        "id": "s0o2",
        "text": "Poproszę zupy pomidorowej i pierogi.",
        "tr": {
         "uk": "(**poprosić** + знахідний: **zupę pomidorową**)",
         "ru": "(**poprosić** + винительный: **zupę pomidorową**)",
         "en": "(**poproszę** takes the accusative: **zupę pomidorową**)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "Спочатку замовлення, рахунок — наприкінці!",
       "ru": "Сначала заказ, счёт — в конце!",
       "en": "Order first, the bill comes at the end!"
      }
     },
     {
      "npc": "A do picia?",
      "npcTr": {
       "uk": "А що пити?",
       "ru": "А что пить?",
       "en": "And to drink?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Dla mnie sok jabłkowy.",
        "tr": {
         "uk": "Мені яблучний сік.",
         "ru": "Мне яблочный сок.",
         "en": "Apple juice for me."
        }
       },
       {
        "id": "s1o1",
        "text": "Dla mnie sok jabłkowa.",
        "tr": {
         "uk": "Мені яблучний сік. (з помилкою)",
         "ru": "Мне яблочный сок. (с ошибкой)",
         "en": "Apple juice for me. (a mistake)"
        }
       },
       {
        "id": "s1o2",
        "text": "Dla mnie soku jabłkowy.",
        "tr": {
         "uk": "(**sok** — називний у цьому реченні: **sok jabłkowy**)",
         "ru": "(**sok** — именительный в этой фразе: **sok jabłkowy**)",
         "en": "(here **sok** stays in the nominative: **sok jabłkowy**)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "**Sok** — чоловічого роду, тож прикметник теж: **sok jabłkowy** (закінчення -a — для жіночого роду: herbata owocowa).",
       "ru": "**Sok** — мужского рода, поэтому и прилагательное: **sok jabłkowy** (окончание -a — для женского рода: herbata owocowa).",
       "en": "**Sok** is masculine, so the adjective is too: **sok jabłkowy** (feminine -a goes with feminine nouns: herbata owocowa)."
      }
     },
     {
      "npc": "Proszę bardzo. Smacznego!",
      "npcTr": {
       "uk": "Прошу. Смачного!",
       "ru": "Пожалуйста. Приятного аппетита!",
       "en": "Here you are. Enjoy!"
      },
      "options": [
       {
        "id": "s2o0",
        "text": "Dziękuję!",
        "tr": {
         "uk": "Дякую!",
         "ru": "Спасибо!",
         "en": "Thank you!"
        }
       },
       {
        "id": "s2o1",
        "text": "Nawzajem!",
        "tr": {
         "uk": "Навзаєм!",
         "ru": "Взаимно!",
         "en": "You too!"
        }
       },
       {
        "id": "s2o2",
        "text": "Proszę bardzo!",
        "tr": {
         "uk": "(**Smacznego!** — побажання; у відповідь **Dziękuję!**; **Proszę bardzo** — «будь ласка» на подяку)",
         "ru": "(**Smacznego!** — пожелание; в ответ **Dziękuję!**; **Proszę bardzo** — «пожалуйста» на благодарность)",
         "en": "(“Smacznego!” is a wish — reply **Dziękuję!**; **Proszę bardzo** answers thanks)"
        }
       }
      ],
      "answer": "s2o0",
      "feedback": {
       "uk": "Офіціант не їсть разом із тобою — «nawzajem» тут не підходить. Йому просто кажуть **Dziękuję!**",
       "ru": "Официант не ест вместе с тобой — «nawzajem» здесь не подходит. Ему просто говорят **Dziękuję!**",
       "en": "The waiter isn't eating with you, so \"nawzajem\" doesn't fit. Just say **Dziękuję!**"
      }
     },
     {
      "npc": "(Po obiedzie)",
      "npcTr": {
       "uk": "(Після обіду)",
       "ru": "(После обеда)",
       "en": "(After lunch)"
      },
      "options": [
       {
        "id": "s3o0",
        "text": "Poproszę rachunek. Czy mogę zapłacić kartą?",
        "tr": {
         "uk": "Рахунок, будь ласка. Можна карткою?",
         "ru": "Счёт, пожалуйста. Можно картой?",
         "en": "The bill, please. Can I pay by card?"
        }
       },
       {
        "id": "s3o1",
        "text": "Poproszę menu.",
        "tr": {
         "uk": "Меню, будь ласка.",
         "ru": "Меню, пожалуйста.",
         "en": "The menu, please."
        }
       },
       {
        "id": "s3o2",
        "text": "Poproszę śniadanie. Czy mogę zapłacić kartą?",
        "tr": {
         "uk": "(після обіду просять **rachunek** (рахунок), а не **śniadanie** (сніданок))",
         "ru": "(после обеда просят **rachunek** (счёт), а не **śniadanie** (завтрак))",
         "en": "(after the meal you ask for the **rachunek** (bill), not **śniadanie** (breakfast))"
        }
       }
      ],
      "answer": "s3o0",
      "feedback": {
       "uk": "Після обіду просять **rachunek**.",
       "ru": "После обеда просят **rachunek**.",
       "en": "After the meal ask for **rachunek**."
      }
     }
    ]
   },
   "explanation": null
  }
 },
 {
  "lesson": "wro-5-ubrania",
  "n": 10,
  "from": {
   "type": "DIALOGUE",
   "skill": "dialogue.clothes",
   "data": {
    "npc": {
     "name": "Pani Ola",
     "emoji": "👩🏼‍💼",
     "role": {
      "uk": "продавчиня",
      "ru": "продавщица",
      "en": "a shop assistant"
     }
    },
    "steps": [
     {
      "npc": "Jaka jest twoja kurtka?",
      "npcTr": {
       "uk": "Яка в тебе куртка?",
       "ru": "Какая у тебя куртка?",
       "en": "What is your jacket like?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Moja kurtka jest czarna.",
        "tr": {
         "uk": "Моя куртка чорна.",
         "ru": "Моя куртка чёрная.",
         "en": "My jacket is black."
        }
       },
       {
        "id": "s0o1",
        "text": "Moja kurtka jest czarny.",
        "tr": {
         "uk": "(куртка — жіночий рід: czarna)",
         "ru": "(куртка — женский род: czarna)",
         "en": "(kurtka is feminine: czarna)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "**Kurtka** — жіночий рід, тому **czarna**.",
       "ru": "**Kurtka** — женский род, поэтому **czarna**.",
       "en": "**Kurtka** is feminine, so **czarna**."
      }
     },
     {
      "npc": "A jakie są twoje buty?",
      "npcTr": {
       "uk": "А які в тебе черевики?",
       "ru": "А какие у тебя ботинки?",
       "en": "And what are your shoes like?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Moje buty są białe.",
        "tr": {
         "uk": "Мої черевики білі.",
         "ru": "Мои ботинки белые.",
         "en": "My shoes are white."
        }
       },
       {
        "id": "s1o1",
        "text": "Moje buty są biały.",
        "tr": {
         "uk": "(buty — множина: białe)",
         "ru": "(buty — множественное число: białe)",
         "en": "(buty is plural: białe)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "**Buty** — множина, тому **białe**.",
       "ru": "**Buty** — множественное число, поэтому **białe**.",
       "en": "**Buty** is plural, so **białe**."
      }
     }
    ]
   },
   "explanation": null
  },
  "to": {
   "type": "DIALOGUE",
   "skill": "dialogue.clothes",
   "data": {
    "npc": {
     "name": "Pani Ola",
     "emoji": "👩🏼‍💼",
     "role": {
      "uk": "продавчиня",
      "ru": "продавщица",
      "en": "a shop assistant"
     }
    },
    "steps": [
     {
      "npc": "Jaka jest twoja kurtka?",
      "npcTr": {
       "uk": "Яка в тебе куртка?",
       "ru": "Какая у тебя куртка?",
       "en": "What is your jacket like?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Moja kurtka jest czarna.",
        "tr": {
         "uk": "Моя куртка чорна.",
         "ru": "Моя куртка чёрная.",
         "en": "My jacket is black."
        }
       },
       {
        "id": "s0o1",
        "text": "Moja kurtka jest czarny.",
        "tr": {
         "uk": "(куртка — жіночий рід: czarna)",
         "ru": "(куртка — женский род: czarna)",
         "en": "(kurtka is feminine: czarna)"
        }
       },
       {
        "id": "s0o2",
        "text": "Moja kurtka jest czarne.",
        "tr": {
         "uk": "(**kurtka** — жіночий рід: **czarna**)",
         "ru": "(**kurtka** — женский род: **czarna**)",
         "en": "(**kurtka** is feminine: **czarna**)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "**Kurtka** — жіночий рід, тому **czarna**.",
       "ru": "**Kurtka** — женский род, поэтому **czarna**.",
       "en": "**Kurtka** is feminine, so **czarna**."
      }
     },
     {
      "npc": "A jakie są twoje buty?",
      "npcTr": {
       "uk": "А які в тебе черевики?",
       "ru": "А какие у тебя ботинки?",
       "en": "And what are your shoes like?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Moje buty są białe.",
        "tr": {
         "uk": "Мої черевики білі.",
         "ru": "Мои ботинки белые.",
         "en": "My shoes are white."
        }
       },
       {
        "id": "s1o1",
        "text": "Moje buty są biały.",
        "tr": {
         "uk": "(buty — множина: białe)",
         "ru": "(buty — множественное число: białe)",
         "en": "(buty is plural: białe)"
        }
       },
       {
        "id": "s1o2",
        "text": "Moje buty są białych.",
        "tr": {
         "uk": "(**są** + називний множини: **białe**)",
         "ru": "(**są** + именительный множественного: **białe**)",
         "en": "(**są** takes the nominative plural: **białe**)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "**Buty** — множина, тому **białe**.",
       "ru": "**Buty** — множественное число, поэтому **białe**.",
       "en": "**Buty** is plural, so **białe**."
      }
     }
    ]
   },
   "explanation": null
  }
 },
 {
  "lesson": "wro-6-przymierzalnia",
  "n": 10,
  "from": {
   "type": "DIALOGUE",
   "skill": "situation.fitting",
   "data": {
    "npc": {
     "name": "Pani Ola",
     "emoji": "👩🏼‍💼",
     "role": {
      "uk": "продавчиня",
      "ru": "продавщица",
      "en": "a shop assistant"
     }
    },
    "steps": [
     {
      "npc": "Jak pasuje ta kurtka?",
      "npcTr": {
       "uk": "Як сидить ця куртка?",
       "ru": "Как сидит эта куртка?",
       "en": "How does this jacket fit?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Jest trochę za duża.",
        "tr": {
         "uk": "Вона трохи завелика.",
         "ru": "Она немного великовата.",
         "en": "It is a bit too big."
        }
       },
       {
        "id": "s0o1",
        "text": "Jest trochę za duży.",
        "tr": {
         "uk": "(куртка — жіночий рід: za duża)",
         "ru": "(куртка — женский род: za duża)",
         "en": "(kurtka is feminine: za duża)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "**Kurtka** — жіночий рід: **za duża**.",
       "ru": "**Kurtka** — женский род: **za duża**.",
       "en": "**Kurtka** is feminine: **za duża**."
      }
     },
     {
      "npc": "Przynieść większy rozmiar?",
      "npcTr": {
       "uk": "Принести більший розмір?",
       "ru": "Принести больший размер?",
       "en": "Shall I bring a bigger size?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Tak, poproszę większy rozmiar.",
        "tr": {
         "uk": "Так, більший розмір, будь ласка.",
         "ru": "Да, больший размер, пожалуйста.",
         "en": "Yes, a bigger size, please."
        }
       },
       {
        "id": "s1o1",
        "text": "Tak, poproszę większego rozmiar.",
        "tr": {
         "uk": "(форма більшого не пасує до rozmiar)",
         "ru": "(форма большего не подходит к rozmiar)",
         "en": "(the form większego does not fit rozmiar)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "**Poproszę** + знахідний; **rozmiar** — неживий чоловічий рід, тож **większy rozmiar**.",
       "ru": "**Poproszę** + винительный; **rozmiar** — неодушевлённый мужской род, значит **większy rozmiar**.",
       "en": "**Poproszę** + accusative; **rozmiar** is a masculine inanimate noun, so **większy rozmiar**."
      }
     }
    ]
   },
   "explanation": null
  },
  "to": {
   "type": "DIALOGUE",
   "skill": "situation.fitting",
   "data": {
    "npc": {
     "name": "Pani Ola",
     "emoji": "👩🏼‍💼",
     "role": {
      "uk": "продавчиня",
      "ru": "продавщица",
      "en": "a shop assistant"
     }
    },
    "steps": [
     {
      "npc": "Jak pasuje ta kurtka?",
      "npcTr": {
       "uk": "Як сидить ця куртка?",
       "ru": "Как сидит эта куртка?",
       "en": "How does this jacket fit?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Jest trochę za duża.",
        "tr": {
         "uk": "Вона трохи завелика.",
         "ru": "Она немного великовата.",
         "en": "It is a bit too big."
        }
       },
       {
        "id": "s0o1",
        "text": "Jest trochę za duży.",
        "tr": {
         "uk": "(куртка — жіночий рід: za duża)",
         "ru": "(куртка — женский род: za duża)",
         "en": "(kurtka is feminine: za duża)"
        }
       },
       {
        "id": "s0o2",
        "text": "Jest trochę za duże.",
        "tr": {
         "uk": "(**kurtka** — жіночий рід: **za duża**)",
         "ru": "(**kurtka** — женский род: **za duża**)",
         "en": "(**kurtka** is feminine: **za duża**)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "**Kurtka** — жіночий рід: **za duża**.",
       "ru": "**Kurtka** — женский род: **za duża**.",
       "en": "**Kurtka** is feminine: **za duża**."
      }
     },
     {
      "npc": "Przynieść większy rozmiar?",
      "npcTr": {
       "uk": "Принести більший розмір?",
       "ru": "Принести больший размер?",
       "en": "Shall I bring a bigger size?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Tak, poproszę większy rozmiar.",
        "tr": {
         "uk": "Так, більший розмір, будь ласка.",
         "ru": "Да, больший размер, пожалуйста.",
         "en": "Yes, a bigger size, please."
        }
       },
       {
        "id": "s1o1",
        "text": "Tak, poproszę większego rozmiar.",
        "tr": {
         "uk": "(форма більшого не пасує до rozmiar)",
         "ru": "(форма большего не подходит к rozmiar)",
         "en": "(the form większego does not fit rozmiar)"
        }
       },
       {
        "id": "s1o2",
        "text": "Tak, poproszę większy rozmiarze.",
        "tr": {
         "uk": "(**poprosić** + знахідний: **większy rozmiar**)",
         "ru": "(**poprosić** + винительный: **większy rozmiar**)",
         "en": "(**poproszę** takes the accusative: **większy rozmiar**)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "**Poproszę** + знахідний; **rozmiar** — неживий чоловічий рід, тож **większy rozmiar**.",
       "ru": "**Poproszę** + винительный; **rozmiar** — неодушевлённый мужской род, значит **większy rozmiar**.",
       "en": "**Poproszę** + accusative; **rozmiar** is a masculine inanimate noun, so **większy rozmiar**."
      }
     }
    ]
   },
   "explanation": null
  }
 },
 {
  "lesson": "wro-14-prezent",
  "n": 8,
  "from": {
   "type": "DIALOGUE",
   "skill": "situation.gift",
   "data": {
    "npc": {
     "name": "Pani Ola",
     "emoji": "👩🏼‍💼",
     "role": {
      "uk": "продавчиня",
      "ru": "продавщица",
      "en": "a shop assistant"
     }
    },
    "steps": [
     {
      "npc": "Dla kogo jest ten prezent?",
      "npcTr": {
       "uk": "Для кого цей подарунок?",
       "ru": "Для кого этот подарок?",
       "en": "Who is this gift for?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Dla mamy. Podoba mi się ten szalik.",
        "tr": {
         "uk": "Для мами. Мені подобається цей шарф.",
         "ru": "Для мамы. Мне нравится этот шарф.",
         "en": "For my mum. I like this scarf."
        }
       },
       {
        "id": "s0o1",
        "text": "Dla mama. Podoba mi się ten szalik.",
        "tr": {
         "uk": "(після dla — родовий: dla mamy)",
         "ru": "(после dla — родительный: dla mamy)",
         "en": "(after dla use the genitive: dla mamy)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "**Dla** + родовий: **dla mamy**.",
       "ru": "**Dla** + родительный: **dla mamy**.",
       "en": "**Dla** + genitive: **dla mamy**."
      }
     }
    ]
   },
   "explanation": null
  },
  "to": {
   "type": "DIALOGUE",
   "skill": "situation.gift",
   "data": {
    "npc": {
     "name": "Pani Ola",
     "emoji": "👩🏼‍💼",
     "role": {
      "uk": "продавчиня",
      "ru": "продавщица",
      "en": "a shop assistant"
     }
    },
    "steps": [
     {
      "npc": "Dla kogo jest ten prezent?",
      "npcTr": {
       "uk": "Для кого цей подарунок?",
       "ru": "Для кого этот подарок?",
       "en": "Who is this gift for?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Dla mamy. Podoba mi się ten szalik.",
        "tr": {
         "uk": "Для мами. Мені подобається цей шарф.",
         "ru": "Для мамы. Мне нравится этот шарф.",
         "en": "For my mum. I like this scarf."
        }
       },
       {
        "id": "s0o1",
        "text": "Dla mama. Podoba mi się ten szalik.",
        "tr": {
         "uk": "(після dla — родовий: dla mamy)",
         "ru": "(после dla — родительный: dla mamy)",
         "en": "(after dla use the genitive: dla mamy)"
        }
       },
       {
        "id": "s0o2",
        "text": "Dla mamie. Podoba mi się ten szalik.",
        "tr": {
         "uk": "(**dla** + родовий: **dla mamy**)",
         "ru": "(**dla** + родительный: **dla mamy**)",
         "en": "(**dla** takes the genitive: **dla mamy**)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "**Dla** + родовий: **dla mamy**.",
       "ru": "**Dla** + родительный: **dla mamy**.",
       "en": "**Dla** + genitive: **dla mamy**."
      }
     }
    ]
   },
   "explanation": null
  }
 },
 {
  "lesson": "wro-15-porownanie",
  "n": 8,
  "from": {
   "type": "DIALOGUE",
   "skill": "dialogue.compare",
   "data": {
    "npc": {
     "name": "Kuba",
     "emoji": "🧑🏼",
     "role": {
      "uk": "друг",
      "ru": "друг",
      "en": "a friend"
     }
    },
    "steps": [
     {
      "npc": "Która kurtka jest tańsza?",
      "npcTr": {
       "uk": "Яка куртка дешевша?",
       "ru": "Какая куртка дешевле?",
       "en": "Which jacket is cheaper?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Ta czerwona jest tańsza niż ta czarna.",
        "tr": {
         "uk": "Червона дешевша, ніж чорна.",
         "ru": "Красная дешевле, чем чёрная.",
         "en": "The red one is cheaper than the black one."
        }
       },
       {
        "id": "s0o1",
        "text": "Ta czerwona jest tańszy niż ta czarna.",
        "tr": {
         "uk": "(куртка — жіночий рід: tańsza)",
         "ru": "(куртка — женский род: tańsza)",
         "en": "(kurtka is feminine: tańsza)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "**Kurtka** — жіночий рід: **tańsza**.",
       "ru": "**Kurtka** — женский род: **tańsza**.",
       "en": "**Kurtka** is feminine: **tańsza**."
      }
     },
     {
      "npc": "To którą kupisz?",
      "npcTr": {
       "uk": "То яку купиш?",
       "ru": "Так какую купишь?",
       "en": "So which one will you buy?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Kupię tę czerwoną, bo jest tańsza.",
        "tr": {
         "uk": "Куплю червону, бо вона дешевша.",
         "ru": "Куплю красную, потому что она дешевле.",
         "en": "I'll buy the red one because it is cheaper."
        }
       },
       {
        "id": "s1o1",
        "text": "Kupię ta czerwona, bo jest tańsza.",
        "tr": {
         "uk": "(після kupić — знахідний: tę czerwoną)",
         "ru": "(после kupić — винительный: tę czerwoną)",
         "en": "(after kupić use the accusative: tę czerwoną)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "**Kupić** + знахідний: **tę czerwoną**.",
       "ru": "**Kupić** + винительный: **tę czerwoną**.",
       "en": "**Kupić** + accusative: **tę czerwoną**."
      }
     }
    ]
   },
   "explanation": null
  },
  "to": {
   "type": "DIALOGUE",
   "skill": "dialogue.compare",
   "data": {
    "npc": {
     "name": "Kuba",
     "emoji": "🧑🏼",
     "role": {
      "uk": "друг",
      "ru": "друг",
      "en": "a friend"
     }
    },
    "steps": [
     {
      "npc": "Która kurtka jest tańsza?",
      "npcTr": {
       "uk": "Яка куртка дешевша?",
       "ru": "Какая куртка дешевле?",
       "en": "Which jacket is cheaper?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Ta czerwona jest tańsza niż ta czarna.",
        "tr": {
         "uk": "Червона дешевша, ніж чорна.",
         "ru": "Красная дешевле, чем чёрная.",
         "en": "The red one is cheaper than the black one."
        }
       },
       {
        "id": "s0o1",
        "text": "Ta czerwona jest tańszy niż ta czarna.",
        "tr": {
         "uk": "(куртка — жіночий рід: tańsza)",
         "ru": "(куртка — женский род: tańsza)",
         "en": "(kurtka is feminine: tańsza)"
        }
       },
       {
        "id": "s0o2",
        "text": "Ta czerwona jest tańsza od ta czarna.",
        "tr": {
         "uk": "(**od** + родовий: **od tej czarnej**; з **niż** — **ta czarna**)",
         "ru": "(**od** + родительный: **od tej czarnej**; с **niż** — **ta czarna**)",
         "en": "(**od** takes the genitive: **od tej czarnej**; with **niż** — **ta czarna**)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "**Kurtka** — жіночий рід: **tańsza**.",
       "ru": "**Kurtka** — женский род: **tańsza**.",
       "en": "**Kurtka** is feminine: **tańsza**."
      }
     },
     {
      "npc": "To którą kupisz?",
      "npcTr": {
       "uk": "То яку купиш?",
       "ru": "Так какую купишь?",
       "en": "So which one will you buy?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Kupię tę czerwoną, bo jest tańsza.",
        "tr": {
         "uk": "Куплю червону, бо вона дешевша.",
         "ru": "Куплю красную, потому что она дешевле.",
         "en": "I'll buy the red one because it is cheaper."
        }
       },
       {
        "id": "s1o1",
        "text": "Kupię ta czerwona, bo jest tańsza.",
        "tr": {
         "uk": "(після kupić — знахідний: tę czerwoną)",
         "ru": "(после kupić — винительный: tę czerwoną)",
         "en": "(after kupić use the accusative: tę czerwoną)"
        }
       },
       {
        "id": "s1o2",
        "text": "Kupię tej czerwonej, bo jest tańsza.",
        "tr": {
         "uk": "(**kupić** + знахідний: **tę czerwoną**)",
         "ru": "(**kupić** + винительный: **tę czerwoną**)",
         "en": "(**kupić** takes the accusative: **tę czerwoną**)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "**Kupić** + знахідний: **tę czerwoną**.",
       "ru": "**Kupić** + винительный: **tę czerwoną**.",
       "en": "**Kupić** + accusative: **tę czerwoną**."
      }
     }
    ]
   },
   "explanation": null
  }
 },
 {
  "lesson": "wro-boss",
  "n": 9,
  "from": {
   "type": "DIALOGUE",
   "skill": "situation.boss",
   "data": {
    "npc": {
     "name": "Krasnal Smakosz",
     "emoji": "🧙🏻‍♂️",
     "role": {
      "uk": "гном-гурман",
      "ru": "гном-гурман",
      "en": "a gourmet gnome"
     }
    },
    "steps": [
     {
      "npc": "Cześć! Jestem krasnal Smakosz. Co zamawiasz?",
      "npcTr": {
       "uk": "Привіт! Я гном Смакош. Що замовляєш?",
       "ru": "Привет! Я гном Смакош. Что заказываешь?",
       "en": "Hi! I'm Smakosz the gnome. What are you ordering?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Poproszę pierogi i herbatę.",
        "tr": {
         "uk": "Вареники і чай, будь ласка.",
         "ru": "Вареники и чай, пожалуйста.",
         "en": "Pierogi and tea, please."
        }
       },
       {
        "id": "s0o1",
        "text": "Poproszę pierogi i herbata.",
        "tr": {
         "uk": "(помилка у відмінку)",
         "ru": "(ошибка в падеже)",
         "en": "(case error)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "**herbatę** — знахідний відмінок.",
       "ru": "**herbatę** — винительный падеж.",
       "en": "**herbatę** — accusative."
      }
     },
     {
      "npc": "Na miejscu czy na wynos?",
      "npcTr": {
       "uk": "Тут чи з собою?",
       "ru": "Здесь или с собой?",
       "en": "For here or to go?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Na miejscu.",
        "tr": {
         "uk": "Тут.",
         "ru": "Здесь.",
         "en": "For here."
        }
       },
       {
        "id": "s1o1",
        "text": "Na razie.",
        "tr": {
         "uk": "Бувай.",
         "ru": "Пока.",
         "en": "See you."
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "**na razie** — «бувай». Тут — **na miejscu**.",
       "ru": "**na razie** — «пока». Здесь — **na miejscu**.",
       "en": "**na razie** means \"see you\". For here — **na miejscu**."
      }
     },
     {
      "npc": "Razem trzydzieści złotych. Kartą czy gotówką?",
      "npcTr": {
       "uk": "Разом тридцять злотих. Карткою чи готівкою?",
       "ru": "Итого тридцать злотых. Картой или наличными?",
       "en": "Thirty zlotys in total. Card or cash?"
      },
      "options": [
       {
        "id": "s2o0",
        "text": "Kartą, proszę.",
        "tr": {
         "uk": "Карткою, будь ласка.",
         "ru": "Картой, пожалуйста.",
         "en": "By card, please."
        }
       },
       {
        "id": "s2o1",
        "text": "Kartę, proszę.",
        "tr": {
         "uk": "(помилка у відмінку)",
         "ru": "(ошибка в падеже)",
         "en": "(case error)"
        }
       }
      ],
      "answer": "s2o0",
      "feedback": {
       "uk": "Чим? — **kartą**.",
       "ru": "Чем? — **kartą**.",
       "en": "With what? — **kartą**."
      }
     }
    ]
   },
   "explanation": null
  },
  "to": {
   "type": "DIALOGUE",
   "skill": "situation.boss",
   "data": {
    "npc": {
     "name": "Krasnal Smakosz",
     "emoji": "🧙🏻‍♂️",
     "role": {
      "uk": "гном-гурман",
      "ru": "гном-гурман",
      "en": "a gourmet gnome"
     }
    },
    "steps": [
     {
      "npc": "Cześć! Jestem krasnal Smakosz. Co zamawiasz?",
      "npcTr": {
       "uk": "Привіт! Я гном Смакош. Що замовляєш?",
       "ru": "Привет! Я гном Смакош. Что заказываешь?",
       "en": "Hi! I'm Smakosz the gnome. What are you ordering?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Poproszę pierogi i herbatę.",
        "tr": {
         "uk": "Вареники і чай, будь ласка.",
         "ru": "Вареники и чай, пожалуйста.",
         "en": "Pierogi and tea, please."
        }
       },
       {
        "id": "s0o1",
        "text": "Poproszę pierogi i herbata.",
        "tr": {
         "uk": "(помилка у відмінку)",
         "ru": "(ошибка в падеже)",
         "en": "(case error)"
        }
       },
       {
        "id": "s0o2",
        "text": "Poproszę pierogów i herbatę.",
        "tr": {
         "uk": "(**poprosić** + знахідний: **pierogi**)",
         "ru": "(**poprosić** + винительный: **pierogi**)",
         "en": "(**poproszę** takes the accusative: **pierogi**)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "**herbatę** — знахідний відмінок.",
       "ru": "**herbatę** — винительный падеж.",
       "en": "**herbatę** — accusative."
      }
     },
     {
      "npc": "Na miejscu czy na wynos?",
      "npcTr": {
       "uk": "Тут чи з собою?",
       "ru": "Здесь или с собой?",
       "en": "For here or to go?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Na miejscu.",
        "tr": {
         "uk": "Тут.",
         "ru": "Здесь.",
         "en": "For here."
        }
       },
       {
        "id": "s1o1",
        "text": "Na razie.",
        "tr": {
         "uk": "Бувай.",
         "ru": "Пока.",
         "en": "See you."
        }
       },
       {
        "id": "s1o2",
        "text": "Na miejscem.",
        "tr": {
         "uk": "(**na miejscu** — місцевий, а не орудний)",
         "ru": "(**na miejscu** — предложный, а не творительный)",
         "en": "(**na miejscu** is the locative, not the instrumental)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "**na razie** — «бувай». Тут — **na miejscu**.",
       "ru": "**na razie** — «пока». Здесь — **na miejscu**.",
       "en": "**na razie** means \"see you\". For here — **na miejscu**."
      }
     },
     {
      "npc": "Razem trzydzieści złotych. Kartą czy gotówką?",
      "npcTr": {
       "uk": "Разом тридцять злотих. Карткою чи готівкою?",
       "ru": "Итого тридцать злотых. Картой или наличными?",
       "en": "Thirty zlotys in total. Card or cash?"
      },
      "options": [
       {
        "id": "s2o0",
        "text": "Kartą, proszę.",
        "tr": {
         "uk": "Карткою, будь ласка.",
         "ru": "Картой, пожалуйста.",
         "en": "By card, please."
        }
       },
       {
        "id": "s2o1",
        "text": "Kartę, proszę.",
        "tr": {
         "uk": "(помилка у відмінку)",
         "ru": "(ошибка в падеже)",
         "en": "(case error)"
        }
       },
       {
        "id": "s2o2",
        "text": "Karta, proszę.",
        "tr": {
         "uk": "(**czym?** — орудний: **kartą**)",
         "ru": "(**чем?** — творительный: **kartą**)",
         "en": "(**by what?** — instrumental: **kartą**)"
        }
       }
      ],
      "answer": "s2o0",
      "feedback": {
       "uk": "Чим? — **kartą**.",
       "ru": "Чем? — **kartą**.",
       "en": "With what? — **kartą**."
      }
     }
    ]
   },
   "explanation": null
  }
 },
 {
  "lesson": "pzn-1-skad-dokad",
  "n": 0,
  "from": {
   "type": "DIALOGUE",
   "skill": "dialogue.cities",
   "data": {
    "npc": {
     "name": "Pani Agnieszka",
     "emoji": "👩🏼‍🏫",
     "role": {
      "uk": "екскурсоводка",
      "ru": "экскурсовод",
      "en": "a tour guide"
     }
    },
    "steps": [
     {
      "npc": "Dzień dobry! Skąd pan jest?",
      "npcTr": {
       "uk": "Добрий день! Звідки ви?",
       "ru": "Добрый день! Откуда вы?",
       "en": "Good morning! Where are you from?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Jestem z Krakowa.",
        "tr": {
         "uk": "Я з Кракова.",
         "ru": "Я из Кракова.",
         "en": "I'm from Kraków."
        }
       },
       {
        "id": "s0o1",
        "text": "Jestem w Krakowie.",
        "tr": {
         "uk": "(«w Krakowie» — «у Кракові», а питали «звідки»)",
         "ru": "(«w Krakowie» — «в Кракове», а спрашивали «откуда»)",
         "en": "(\"w Krakowie\" means \"in Kraków\", but the question was \"from where\")"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "**Skąd?** → **z** + родовий: z Krakowa.",
       "ru": "**Skąd?** → **z** + родительный: z Krakowa.",
       "en": "**Skąd?** → **z** + genitive: z Krakowa."
      }
     },
     {
      "npc": "A gdzie pan teraz mieszka?",
      "npcTr": {
       "uk": "А де ви зараз живете?",
       "ru": "А где вы сейчас живёте?",
       "en": "And where do you live now?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Mieszkam w Poznaniu.",
        "tr": {
         "uk": "Я живу в Познані.",
         "ru": "Я живу в Познани.",
         "en": "I live in Poznań."
        }
       },
       {
        "id": "s1o1",
        "text": "Mieszkam do Poznania.",
        "tr": {
         "uk": "(«do» — це «куди», а не «де»)",
         "ru": "(«do» — это «куда», а не «где»)",
         "en": "(\"do\" means \"to\", not \"in\")"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "**Gdzie?** → **w** + місцевий: w Poznaniu.",
       "ru": "**Gdzie?** → **w** + предложный: w Poznaniu.",
       "en": "**Gdzie?** → **w** + locative: w Poznaniu."
      }
     }
    ]
   },
   "explanation": null
  },
  "to": {
   "type": "DIALOGUE",
   "skill": "dialogue.cities",
   "data": {
    "npc": {
     "name": "Pani Agnieszka",
     "emoji": "👩🏼‍🏫",
     "role": {
      "uk": "екскурсоводка",
      "ru": "экскурсовод",
      "en": "a tour guide"
     }
    },
    "steps": [
     {
      "npc": "Dzień dobry! Skąd pan jest?",
      "npcTr": {
       "uk": "Добрий день! Звідки ви?",
       "ru": "Добрый день! Откуда вы?",
       "en": "Good morning! Where are you from?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Jestem z Krakowa.",
        "tr": {
         "uk": "Я з Кракова.",
         "ru": "Я из Кракова.",
         "en": "I'm from Kraków."
        }
       },
       {
        "id": "s0o1",
        "text": "Jestem w Krakowie.",
        "tr": {
         "uk": "(«w Krakowie» — «у Кракові», а питали «звідки»)",
         "ru": "(«w Krakowie» — «в Кракове», а спрашивали «откуда»)",
         "en": "(\"w Krakowie\" means \"in Kraków\", but the question was \"from where\")"
        }
       },
       {
        "id": "s0o2",
        "text": "Jestem z Krakowem.",
        "tr": {
         "uk": "(**z** («звідки») + родовий: z **Krakowa**; **z Krakowem** — «з Краковом»)",
         "ru": "(**z** («откуда») + родительный: z **Krakowa**; **z Krakowem** — «с Краковом»)",
         "en": "(**z** (“from”) takes the genitive: z **Krakowa**; **z Krakowem** means “with Kraków”)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "**Skąd?** → **z** + родовий: z Krakowa.",
       "ru": "**Skąd?** → **z** + родительный: z Krakowa.",
       "en": "**Skąd?** → **z** + genitive: z Krakowa."
      }
     },
     {
      "npc": "A gdzie pan teraz mieszka?",
      "npcTr": {
       "uk": "А де ви зараз живете?",
       "ru": "А где вы сейчас живёте?",
       "en": "And where do you live now?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Mieszkam w Poznaniu.",
        "tr": {
         "uk": "Я живу в Познані.",
         "ru": "Я живу в Познани.",
         "en": "I live in Poznań."
        }
       },
       {
        "id": "s1o1",
        "text": "Mieszkam do Poznania.",
        "tr": {
         "uk": "(«do» — це «куди», а не «де»)",
         "ru": "(«do» — это «куда», а не «где»)",
         "en": "(\"do\" means \"to\", not \"in\")"
        }
       },
       {
        "id": "s1o2",
        "text": "Mieszkam z Poznania.",
        "tr": {
         "uk": "(**gdzie?** — **w** + місцевий: w **Poznaniu**; **z Poznania** — «з Познані»)",
         "ru": "(**gdzie?** — **w** + предложный: w **Poznaniu**; **z Poznania** — «из Познани»)",
         "en": "(**gdzie?** — **w** + locative: w **Poznaniu**; **z Poznania** means “from Poznań”)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "**Gdzie?** → **w** + місцевий: w Poznaniu.",
       "ru": "**Gdzie?** → **w** + предложный: w Poznaniu.",
       "en": "**Gdzie?** → **w** + locative: w Poznaniu."
      }
     }
    ]
   },
   "explanation": null
  }
 },
 {
  "lesson": "pzn-2-koziolki",
  "n": 6,
  "from": {
   "type": "DIALOGUE",
   "skill": "dialogue.poznan",
   "data": {
    "npc": {
     "name": "Pani Agnieszka",
     "emoji": "👩🏼‍🏫",
     "role": {
      "uk": "екскурсоводка",
      "ru": "экскурсовод",
      "en": "a tour guide"
     }
    },
    "steps": [
     {
      "npc": "Proszę państwa, jest prawie dwunasta. Patrzymy na wieżę ratusza!",
      "npcTr": {
       "uk": "Шановні, майже дванадцята. Дивимося на вежу ратуші!",
       "ru": "Дамы и господа, почти двенадцать. Смотрим на башню ратуши!",
       "en": "Ladies and gentlemen, it's almost twelve. Look at the town hall tower!"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Ile razy trykają się koziołki?",
        "tr": {
         "uk": "Скільки разів б'ються козлики?",
         "ru": "Сколько раз бодаются козлики?",
         "en": "How many times do the goats butt heads?"
        }
       },
       {
        "id": "s0o1",
        "text": "Ile czasu trykają się koziołki?",
        "tr": {
         "uk": "Скільки часу б'ються козлики?",
         "ru": "Сколько времени бодаются козлики?",
         "en": "For how long do the goats butt heads?"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "Про кількість повторів питають **Ile razy?** — скільки разів. **Ile czasu?** — як довго.",
       "ru": "О количестве повторов спрашивают **Ile razy?** — сколько раз. **Ile czasu?** — как долго.",
       "en": "To ask how many times use **Ile razy?**; **Ile czasu?** asks how long."
      }
     },
     {
      "npc": "Dwanaście razy, codziennie w południe.",
      "npcTr": {
       "uk": "Дванадцять разів, щодня опівдні.",
       "ru": "Двенадцать раз, каждый день в полдень.",
       "en": "Twelve times, every day at noon."
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Codziennie? To super!",
        "tr": {
         "uk": "Щодня? Це супер!",
         "ru": "Каждый день? Это супер!",
         "en": "Every day? That's great!"
        }
       },
       {
        "id": "s1o1",
        "text": "Raz w tygodniu? To super!",
        "tr": {
         "uk": "Раз на тиждень? Це супер!",
         "ru": "Раз в неделю? Это супер!",
         "en": "Once a week? That's great!"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "Гідка сказала **codziennie** — щодня, а не «raz w tygodniu» (раз на тиждень).",
       "ru": "Гид сказала **codziennie** — каждый день, а не «raz w tygodniu» (раз в неделю).",
       "en": "The guide said **codziennie** — every day, not \"raz w tygodniu\" (once a week)."
      }
     }
    ]
   },
   "explanation": null
  },
  "to": {
   "type": "DIALOGUE",
   "skill": "dialogue.poznan",
   "data": {
    "npc": {
     "name": "Pani Agnieszka",
     "emoji": "👩🏼‍🏫",
     "role": {
      "uk": "екскурсоводка",
      "ru": "экскурсовод",
      "en": "a tour guide"
     }
    },
    "steps": [
     {
      "npc": "Proszę państwa, jest prawie dwunasta. Patrzymy na wieżę ratusza!",
      "npcTr": {
       "uk": "Шановні, майже дванадцята. Дивимося на вежу ратуші!",
       "ru": "Дамы и господа, почти двенадцать. Смотрим на башню ратуши!",
       "en": "Ladies and gentlemen, it's almost twelve. Look at the town hall tower!"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Ile razy trykają się koziołki?",
        "tr": {
         "uk": "Скільки разів б'ються козлики?",
         "ru": "Сколько раз бодаются козлики?",
         "en": "How many times do the goats butt heads?"
        }
       },
       {
        "id": "s0o1",
        "text": "Ile czasu trykają się koziołki?",
        "tr": {
         "uk": "Скільки часу б'ються козлики?",
         "ru": "Сколько времени бодаются козлики?",
         "en": "For how long do the goats butt heads?"
        }
       },
       {
        "id": "s0o2",
        "text": "Ile raz trykają się koziołki?",
        "tr": {
         "uk": "(**ile** + множина: **ile razy**)",
         "ru": "(**ile** + множественное число: **ile razy**)",
         "en": "(**ile** goes with the plural: **ile razy**)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "Про кількість повторів питають **Ile razy?** — скільки разів. **Ile czasu?** — як довго.",
       "ru": "О количестве повторов спрашивают **Ile razy?** — сколько раз. **Ile czasu?** — как долго.",
       "en": "To ask how many times use **Ile razy?**; **Ile czasu?** asks how long."
      }
     },
     {
      "npc": "Dwanaście razy, codziennie w południe.",
      "npcTr": {
       "uk": "Дванадцять разів, щодня опівдні.",
       "ru": "Двенадцать раз, каждый день в полдень.",
       "en": "Twelve times, every day at noon."
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Codziennie? To super!",
        "tr": {
         "uk": "Щодня? Це супер!",
         "ru": "Каждый день? Это супер!",
         "en": "Every day? That's great!"
        }
       },
       {
        "id": "s1o1",
        "text": "Raz w tygodniu? To super!",
        "tr": {
         "uk": "Раз на тиждень? Це супер!",
         "ru": "Раз в неделю? Это супер!",
         "en": "Once a week? That's great!"
        }
       },
       {
        "id": "s1o2",
        "text": "Co godzinę? To super!",
        "tr": {
         "uk": "(гід сказала **codziennie w południe** — щодня опівдні, а не **co godzinę**)",
         "ru": "(гид сказала **codziennie w południe** — каждый день в полдень, а не **co godzinę**)",
         "en": "(the guide said **codziennie w południe** — daily at noon, not **co godzinę** (every hour))"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "Гідка сказала **codziennie** — щодня, а не «raz w tygodniu» (раз на тиждень).",
       "ru": "Гид сказала **codziennie** — каждый день, а не «raz w tygodniu» (раз в неделю).",
       "en": "The guide said **codziennie** — every day, not \"raz w tygodniu\" (once a week)."
      }
     }
    ]
   },
   "explanation": null
  }
 },
 {
  "lesson": "pzn-4-daty",
  "n": 0,
  "from": {
   "type": "DIALOGUE",
   "skill": "dialogue.dates",
   "data": {
    "npc": {
     "name": "Ola",
     "emoji": "👩🏻",
     "role": {
      "uk": "подруга з Познані",
      "ru": "подруга из Познани",
      "en": "a friend from Poznań"
     }
    },
    "steps": [
     {
      "npc": "Słuchaj, którego jest dzisiaj?",
      "npcTr": {
       "uk": "Слухай, яке сьогодні число?",
       "ru": "Слушай, какое сегодня число?",
       "en": "Listen, what's the date today?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Dziesiątego listopada. A co?",
        "tr": {
         "uk": "Десяте листопада. А що?",
         "ru": "Десятое ноября. А что?",
         "en": "The tenth of November. Why?"
        }
       },
       {
        "id": "s0o1",
        "text": "Jest dziesiąta godzina.",
        "tr": {
         "uk": "(це про годину, а не про дату)",
         "ru": "(это о времени, а не о дате)",
         "en": "(that's the time, not the date)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "Дата — порядковий у родовому: **dziesiątego listopada**.",
       "ru": "Дата — порядковое в родительном: **dziesiątego listopada**.",
       "en": "A date is the ordinal in the genitive: **dziesiątego listopada**."
      }
     },
     {
      "npc": "To jutro jest święto! Jedenastego listopada jemy rogale.",
      "npcTr": {
       "uk": "То завтра свято! Одинадцятого листопада ми їмо рогалики.",
       "ru": "Значит, завтра праздник! Одиннадцатого ноября мы едим рогалики.",
       "en": "So tomorrow is a holiday! On 11 November we eat croissants."
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Rogale świętomarcińskie? Z białym makiem?",
        "tr": {
         "uk": "Святомартинські рогалики? З білим маком?",
         "ru": "Рогалики святого Мартина? С белым маком?",
         "en": "St Martin's croissants? With white poppy seed?"
        }
       },
       {
        "id": "s1o1",
        "text": "Rogale? W lipcu?",
        "tr": {
         "uk": "(свято в листопаді, а не в липні)",
         "ru": "(праздник в ноябре, а не в июле)",
         "en": "(the holiday is in November, not July)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "11 листопада в Познані їдять **rogale świętomarcińskie** з білим маком.",
       "ru": "11 ноября в Познани едят **rogale świętomarcińskie** с белым маком.",
       "en": "On 11 November Poznań eats **rogale świętomarcińskie** with white poppy seed."
      }
     }
    ]
   },
   "explanation": null
  },
  "to": {
   "type": "DIALOGUE",
   "skill": "dialogue.dates",
   "data": {
    "npc": {
     "name": "Ola",
     "emoji": "👩🏻",
     "role": {
      "uk": "подруга з Познані",
      "ru": "подруга из Познани",
      "en": "a friend from Poznań"
     }
    },
    "steps": [
     {
      "npc": "Słuchaj, którego jest dzisiaj?",
      "npcTr": {
       "uk": "Слухай, яке сьогодні число?",
       "ru": "Слушай, какое сегодня число?",
       "en": "Listen, what's the date today?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Dziesiątego listopada. A co?",
        "tr": {
         "uk": "Десяте листопада. А що?",
         "ru": "Десятое ноября. А что?",
         "en": "The tenth of November. Why?"
        }
       },
       {
        "id": "s0o1",
        "text": "Jest dziesiąta godzina.",
        "tr": {
         "uk": "(це про годину, а не про дату)",
         "ru": "(это о времени, а не о дате)",
         "en": "(that's the time, not the date)"
        }
       },
       {
        "id": "s0o2",
        "text": "Dziesiąty listopada. A co?",
        "tr": {
         "uk": "(дата — родовий: **dziesiątego** listopada)",
         "ru": "(дата — родительный: **dziesiątego** listopada)",
         "en": "(a date uses the genitive: **dziesiątego** listopada)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "Дата — порядковий у родовому: **dziesiątego listopada**.",
       "ru": "Дата — порядковое в родительном: **dziesiątego listopada**.",
       "en": "A date is the ordinal in the genitive: **dziesiątego listopada**."
      }
     },
     {
      "npc": "To jutro jest święto! Jedenastego listopada jemy rogale.",
      "npcTr": {
       "uk": "То завтра свято! Одинадцятого листопада ми їмо рогалики.",
       "ru": "Значит, завтра праздник! Одиннадцатого ноября мы едим рогалики.",
       "en": "So tomorrow is a holiday! On 11 November we eat croissants."
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Rogale świętomarcińskie? Z białym makiem?",
        "tr": {
         "uk": "Святомартинські рогалики? З білим маком?",
         "ru": "Рогалики святого Мартина? С белым маком?",
         "en": "St Martin's croissants? With white poppy seed?"
        }
       },
       {
        "id": "s1o1",
        "text": "Rogale? W lipcu?",
        "tr": {
         "uk": "(свято в листопаді, а не в липні)",
         "ru": "(праздник в ноябре, а не в июле)",
         "en": "(the holiday is in November, not July)"
        }
       },
       {
        "id": "s1o2",
        "text": "Rogale świętomarcińskie? Z białym mak?",
        "tr": {
         "uk": "(**z** («з чим») + орудний: z białym **makiem**)",
         "ru": "(**z** («с чем») + творительный: z białym **makiem**)",
         "en": "(**z** (“with”) takes the instrumental: z białym **makiem**)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "11 листопада в Познані їдять **rogale świętomarcińskie** з білим маком.",
       "ru": "11 ноября в Познани едят **rogale świętomarcińskie** с белым маком.",
       "en": "On 11 November Poznań eats **rogale świętomarcińskie** with white poppy seed."
      }
     }
    ]
   },
   "explanation": null
  }
 },
 {
  "lesson": "pzn-5-zajmuje-sie",
  "n": 0,
  "from": {
   "type": "DIALOGUE",
   "skill": "dialogue.work",
   "data": {
    "npc": {
     "name": "Tomek",
     "emoji": "🧑🏻",
     "role": {
      "uk": "колега з роботи",
      "ru": "коллега с работы",
      "en": "a colleague"
     }
    },
    "steps": [
     {
      "npc": "Cześć! Jesteś nowy? Czym się zajmujesz?",
      "npcTr": {
       "uk": "Привіт! Ти новенький? Чим займаєшся?",
       "ru": "Привет! Ты новенький? Чем занимаешься?",
       "en": "Hi! Are you new? What do you do?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Zajmuję się logistyką.",
        "tr": {
         "uk": "Я займаюся логістикою.",
         "ru": "Я занимаюсь логистикой.",
         "en": "I work in logistics."
        }
       },
       {
        "id": "s0o1",
        "text": "Zajmuję się logistyka.",
        "tr": {
         "uk": "(потрібен орудний: logistyką)",
         "ru": "(нужен творительный: logistyką)",
         "en": "(needs the instrumental: logistyką)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "**zajmować się** + орудний: logistyk**ą**.",
       "ru": "**zajmować się** + творительный: logistyk**ą**.",
       "en": "**zajmować się** + instrumental: logistyk**ą**."
      }
     },
     {
      "npc": "A ja pracuję w dziale sprzedaży. A po pracy? Czym się interesujesz?",
      "npcTr": {
       "uk": "А я працюю у відділі продажів. А після роботи? Чим цікавишся?",
       "ru": "А я работаю в отделе продаж. А после работы? Чем интересуешься?",
       "en": "And I work in sales. And after work? What are you into?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Interesuję się fotografią.",
        "tr": {
         "uk": "Я цікавлюся фотографією.",
         "ru": "Я интересуюсь фотографией.",
         "en": "I'm into photography."
        }
       },
       {
        "id": "s1o1",
        "text": "Interesuję fotografię.",
        "tr": {
         "uk": "(потрібні «się» і орудний)",
         "ru": "(нужны «się» и творительный)",
         "en": "(needs \"się\" and the instrumental)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "**interesować się** + орудний: fotografi**ą**.",
       "ru": "**interesować się** + творительный: fotografi**ą**.",
       "en": "**interesować się** + instrumental: fotografi**ą**."
      }
     }
    ]
   },
   "explanation": null
  },
  "to": {
   "type": "DIALOGUE",
   "skill": "dialogue.work",
   "data": {
    "npc": {
     "name": "Tomek",
     "emoji": "🧑🏻",
     "role": {
      "uk": "колега з роботи",
      "ru": "коллега с работы",
      "en": "a colleague"
     }
    },
    "steps": [
     {
      "npc": "Cześć! Jesteś nowy? Czym się zajmujesz?",
      "npcTr": {
       "uk": "Привіт! Ти новенький? Чим займаєшся?",
       "ru": "Привет! Ты новенький? Чем занимаешься?",
       "en": "Hi! Are you new? What do you do?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Zajmuję się logistyką.",
        "tr": {
         "uk": "Я займаюся логістикою.",
         "ru": "Я занимаюсь логистикой.",
         "en": "I work in logistics."
        }
       },
       {
        "id": "s0o1",
        "text": "Zajmuję się logistyka.",
        "tr": {
         "uk": "(потрібен орудний: logistyką)",
         "ru": "(нужен творительный: logistyką)",
         "en": "(needs the instrumental: logistyką)"
        }
       },
       {
        "id": "s0o2",
        "text": "Zajmujesz się logistyką.",
        "tr": {
         "uk": "(про себе: **zajmuję się**; **zajmujesz się** — «ти займаєшся»)",
         "ru": "(о себе: **zajmuję się**; **zajmujesz się** — «ты занимаешься»)",
         "en": "(about yourself: **zajmuję się**; **zajmujesz się** means “you do”)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "**zajmować się** + орудний: logistyk**ą**.",
       "ru": "**zajmować się** + творительный: logistyk**ą**.",
       "en": "**zajmować się** + instrumental: logistyk**ą**."
      }
     },
     {
      "npc": "A ja pracuję w dziale sprzedaży. A po pracy? Czym się interesujesz?",
      "npcTr": {
       "uk": "А я працюю у відділі продажів. А після роботи? Чим цікавишся?",
       "ru": "А я работаю в отделе продаж. А после работы? Чем интересуешься?",
       "en": "And I work in sales. And after work? What are you into?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Interesuję się fotografią.",
        "tr": {
         "uk": "Я цікавлюся фотографією.",
         "ru": "Я интересуюсь фотографией.",
         "en": "I'm into photography."
        }
       },
       {
        "id": "s1o1",
        "text": "Interesuję fotografię.",
        "tr": {
         "uk": "(потрібні «się» і орудний)",
         "ru": "(нужны «się» и творительный)",
         "en": "(needs \"się\" and the instrumental)"
        }
       },
       {
        "id": "s1o2",
        "text": "Interesuje się fotografią.",
        "tr": {
         "uk": "(про себе: **interesuję się**; **interesuje się** — «він цікавиться»)",
         "ru": "(о себе: **interesuję się**; **interesuje się** — «он интересуется»)",
         "en": "(about yourself: **interesuję się**; **interesuje się** means “he is interested”)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "**interesować się** + орудний: fotografi**ą**.",
       "ru": "**interesować się** + творительный: fotografi**ą**.",
       "en": "**interesować się** + instrumental: fotografi**ą**."
      }
     }
    ]
   },
   "explanation": null
  }
 },
 {
  "lesson": "pzn-6-targi",
  "n": 0,
  "from": {
   "type": "SITUATION",
   "skill": "situation.fair",
   "data": {
    "npc": {
     "name": "Pan Wojciech",
     "emoji": "🧑🏼‍💼",
     "role": {
      "uk": "експонент на ярмарку",
      "ru": "экспонент на ярмарке",
      "en": "an exhibitor at the fair"
     }
    },
    "scene": {
     "uk": "Міжнародні Познанські ярмарки",
     "ru": "Международные Познанские ярмарки",
     "en": "Poznań International Fair"
    },
    "steps": [
     {
      "npc": "Dzień dobry! Zapraszam na nasze stoisko. W czym mogę pomóc?",
      "npcTr": {
       "uk": "Добрий день! Запрошую на наш стенд. Чим можу допомогти?",
       "ru": "Добрый день! Приглашаю на наш стенд. Чем могу помочь?",
       "en": "Good morning! Welcome to our stand. How can I help?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Dzień dobry. Czym zajmuje się pana firma?",
        "tr": {
         "uk": "Добрий день. Чим займається ваша фірма?",
         "ru": "Добрый день. Чем занимается ваша фирма?",
         "en": "Good morning. What does your company do?"
        }
       },
       {
        "id": "s0o1",
        "text": "Siema! Co tam?",
        "tr": {
         "uk": "(занадто розмовно для ділової розмови)",
         "ru": "(слишком разговорно для деловой беседы)",
         "en": "(too casual for a business talk)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "На ярмарку — ввічливо: **pan / pani**.",
       "ru": "На ярмарке — вежливо: **pan / pani**.",
       "en": "At a fair, be polite: **pan / pani**."
      }
     },
     {
      "npc": "Zajmujemy się transportem i logistyką. Oto nasz katalog.",
      "npcTr": {
       "uk": "Ми займаємося транспортом і логістикою. Ось наш каталог.",
       "ru": "Мы занимаемся транспортом и логистикой. Вот наш каталог.",
       "en": "We do transport and logistics. Here is our catalogue."
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Dziękuję. Czy mogę prosić o wizytówkę?",
        "tr": {
         "uk": "Дякую. Можна попросити візитівку?",
         "ru": "Спасибо. Можно попросить визитку?",
         "en": "Thank you. May I have your business card?"
        }
       },
       {
        "id": "s1o1",
        "text": "Dziękuję. Czy mogę prosić o wizytówka?",
        "tr": {
         "uk": "(після «prosić o» — знахідний: wizytówkę)",
         "ru": "(после «prosić o» — винительный: wizytówkę)",
         "en": "(after \"prosić o\" use the accusative: wizytówkę)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "**prosić o** + знахідний: wizytówk**ę**.",
       "ru": "**prosić o** + винительный: wizytówk**ę**.",
       "en": "**prosić o** + accusative: wizytówk**ę**."
      }
     }
    ]
   },
   "explanation": null
  },
  "to": {
   "type": "SITUATION",
   "skill": "situation.fair",
   "data": {
    "npc": {
     "name": "Pan Wojciech",
     "emoji": "🧑🏼‍💼",
     "role": {
      "uk": "експонент на ярмарку",
      "ru": "экспонент на ярмарке",
      "en": "an exhibitor at the fair"
     }
    },
    "scene": {
     "uk": "Міжнародні Познанські ярмарки",
     "ru": "Международные Познанские ярмарки",
     "en": "Poznań International Fair"
    },
    "steps": [
     {
      "npc": "Dzień dobry! Zapraszam na nasze stoisko. W czym mogę pomóc?",
      "npcTr": {
       "uk": "Добрий день! Запрошую на наш стенд. Чим можу допомогти?",
       "ru": "Добрый день! Приглашаю на наш стенд. Чем могу помочь?",
       "en": "Good morning! Welcome to our stand. How can I help?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Dzień dobry. Czym zajmuje się pana firma?",
        "tr": {
         "uk": "Добрий день. Чим займається ваша фірма?",
         "ru": "Добрый день. Чем занимается ваша фирма?",
         "en": "Good morning. What does your company do?"
        }
       },
       {
        "id": "s0o1",
        "text": "Siema! Co tam?",
        "tr": {
         "uk": "(занадто розмовно для ділової розмови)",
         "ru": "(слишком разговорно для деловой беседы)",
         "en": "(too casual for a business talk)"
        }
       },
       {
        "id": "s0o2",
        "text": "Dzień dobry. Czym zajmuje się twoja firma?",
        "tr": {
         "uk": "(у діловій розмові — **pana firma**; «twoja» — на «ти»)",
         "ru": "(в деловом разговоре — **pana firma**; «twoja» — на «ты»)",
         "en": "(in a business conversation say **pana firma**; “twoja” is informal)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "На ярмарку — ввічливо: **pan / pani**.",
       "ru": "На ярмарке — вежливо: **pan / pani**.",
       "en": "At a fair, be polite: **pan / pani**."
      }
     },
     {
      "npc": "Zajmujemy się transportem i logistyką. Oto nasz katalog.",
      "npcTr": {
       "uk": "Ми займаємося транспортом і логістикою. Ось наш каталог.",
       "ru": "Мы занимаемся транспортом и логистикой. Вот наш каталог.",
       "en": "We do transport and logistics. Here is our catalogue."
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Dziękuję. Czy mogę prosić o wizytówkę?",
        "tr": {
         "uk": "Дякую. Можна попросити візитівку?",
         "ru": "Спасибо. Можно попросить визитку?",
         "en": "Thank you. May I have your business card?"
        }
       },
       {
        "id": "s1o1",
        "text": "Dziękuję. Czy mogę prosić o wizytówka?",
        "tr": {
         "uk": "(після «prosić o» — знахідний: wizytówkę)",
         "ru": "(после «prosić o» — винительный: wizytówkę)",
         "en": "(after \"prosić o\" use the accusative: wizytówkę)"
        }
       },
       {
        "id": "s1o2",
        "text": "Dziękuję. Czy mogę prosić o rachunek?",
        "tr": {
         "uk": "(на стенді просять **wizytówkę** (візитку); **rachunek** — рахунок у ресторані)",
         "ru": "(на стенде просят **wizytówkę** (визитку); **rachunek** — счёт в ресторане)",
         "en": "(at a stand you ask for a **wizytówka** (business card); **rachunek** is a restaurant bill)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "**prosić o** + знахідний: wizytówk**ę**.",
       "ru": "**prosić o** + винительный: wizytówk**ę**.",
       "en": "**prosić o** + accusative: wizytówk**ę**."
      }
     }
    ]
   },
   "explanation": null
  }
 },
 {
  "lesson": "pzn-7-musze-moge",
  "n": 0,
  "from": {
   "type": "DIALOGUE",
   "skill": "dialogue.plans",
   "data": {
    "npc": {
     "name": "Ola",
     "emoji": "👩🏻",
     "role": {
      "uk": "подруга з Познані",
      "ru": "подруга из Познани",
      "en": "a friend from Poznań"
     }
    },
    "steps": [
     {
      "npc": "Idziemy dziś wieczorem nad Maltę?",
      "npcTr": {
       "uk": "Підемо сьогодні ввечері на Мальту (озеро)?",
       "ru": "Пойдём сегодня вечером на Мальту (озеро)?",
       "en": "Shall we go to Lake Malta tonight?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Dziś nie mogę, bo muszę pracować.",
        "tr": {
         "uk": "Сьогодні не можу, бо мушу працювати.",
         "ru": "Сегодня не могу, потому что должен работать.",
         "en": "I can't today, I have to work."
        }
       },
       {
        "id": "s0o1",
        "text": "Dziś nie muszę, bo mogę pracować.",
        "tr": {
         "uk": "(«не мушу, бо можу працювати» — без сенсу)",
         "ru": "(«не обязан, потому что могу работать» — без смысла)",
         "en": "(\"I don't have to because I can work\" — makes no sense)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "Відмова: **nie mogę, bo muszę…**",
       "ru": "Отказ: **nie mogę, bo muszę…**",
       "en": "Refusing: **nie mogę, bo muszę…**"
      }
     },
     {
      "npc": "Szkoda. A jutro? Możesz po pracy?",
      "npcTr": {
       "uk": "Шкода. А завтра? Можеш після роботи?",
       "ru": "Жаль. А завтра? Можешь после работы?",
       "en": "Pity. And tomorrow? Can you after work?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Jutro mogę. Chcę zobaczyć jezioro!",
        "tr": {
         "uk": "Завтра можу. Хочу побачити озеро!",
         "ru": "Завтра могу. Хочу увидеть озеро!",
         "en": "Tomorrow I can. I want to see the lake!"
        }
       },
       {
        "id": "s1o1",
        "text": "Jutro muszę. Chcę zobaczyć jezioro!",
        "tr": {
         "uk": "(«мушу» — не відповідь на «можеш?»)",
         "ru": "(«должен» — не ответ на «можешь?»)",
         "en": "(\"I must\" doesn't answer \"can you?\")"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "На «Możesz?» відповідають **mogę** або **nie mogę**.",
       "ru": "На «Możesz?» отвечают **mogę** или **nie mogę**.",
       "en": "Answer \"Możesz?\" with **mogę** or **nie mogę**."
      }
     }
    ]
   },
   "explanation": null
  },
  "to": {
   "type": "DIALOGUE",
   "skill": "dialogue.plans",
   "data": {
    "npc": {
     "name": "Ola",
     "emoji": "👩🏻",
     "role": {
      "uk": "подруга з Познані",
      "ru": "подруга из Познани",
      "en": "a friend from Poznań"
     }
    },
    "steps": [
     {
      "npc": "Idziemy dziś wieczorem nad Maltę?",
      "npcTr": {
       "uk": "Підемо сьогодні ввечері на Мальту (озеро)?",
       "ru": "Пойдём сегодня вечером на Мальту (озеро)?",
       "en": "Shall we go to Lake Malta tonight?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Dziś nie mogę, bo muszę pracować.",
        "tr": {
         "uk": "Сьогодні не можу, бо мушу працювати.",
         "ru": "Сегодня не могу, потому что должен работать.",
         "en": "I can't today, I have to work."
        }
       },
       {
        "id": "s0o1",
        "text": "Dziś nie muszę, bo mogę pracować.",
        "tr": {
         "uk": "(«не мушу, бо можу працювати» — без сенсу)",
         "ru": "(«не обязан, потому что могу работать» — без смысла)",
         "en": "(\"I don't have to because I can work\" — makes no sense)"
        }
       },
       {
        "id": "s0o2",
        "text": "Dziś nie mogę, bo chcę pracować.",
        "tr": {
         "uk": "(**nie mogę** — є перешкода: **muszę pracować**; «chcę» — не причина відмови)",
         "ru": "(**nie mogę** — есть помеха: **muszę pracować**; «chcę» — не причина отказа)",
         "en": "(**nie mogę** needs an obstacle: **muszę pracować**; “chcę” is not a reason to refuse)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "Відмова: **nie mogę, bo muszę…**",
       "ru": "Отказ: **nie mogę, bo muszę…**",
       "en": "Refusing: **nie mogę, bo muszę…**"
      }
     },
     {
      "npc": "Szkoda. A jutro? Możesz po pracy?",
      "npcTr": {
       "uk": "Шкода. А завтра? Можеш після роботи?",
       "ru": "Жаль. А завтра? Можешь после работы?",
       "en": "Pity. And tomorrow? Can you after work?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Jutro mogę. Chcę zobaczyć jezioro!",
        "tr": {
         "uk": "Завтра можу. Хочу побачити озеро!",
         "ru": "Завтра могу. Хочу увидеть озеро!",
         "en": "Tomorrow I can. I want to see the lake!"
        }
       },
       {
        "id": "s1o1",
        "text": "Jutro muszę. Chcę zobaczyć jezioro!",
        "tr": {
         "uk": "(«мушу» — не відповідь на «можеш?»)",
         "ru": "(«должен» — не ответ на «можешь?»)",
         "en": "(\"I must\" doesn't answer \"can you?\")"
        }
       },
       {
        "id": "s1o2",
        "text": "Jutro nie mogę. Chcę zobaczyć jezioro!",
        "tr": {
         "uk": "(**nie mogę** — відмова, а далі «chcę zobaczyć jezioro» — згода)",
         "ru": "(**nie mogę** — отказ, а дальше «chcę zobaczyć jezioro» — согласие)",
         "en": "(**nie mogę** is a refusal, yet “chcę zobaczyć jezioro” shows you want to go)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "На «Możesz?» відповідають **mogę** або **nie mogę**.",
       "ru": "На «Możesz?» отвечают **mogę** или **nie mogę**.",
       "en": "Answer \"Możesz?\" with **mogę** or **nie mogę**."
      }
     }
    ]
   },
   "explanation": null
  }
 },
 {
  "lesson": "pzn-8-weekend",
  "n": 0,
  "from": {
   "type": "DIALOGUE",
   "skill": "dialogue.weekend",
   "data": {
    "npc": {
     "name": "Ola",
     "emoji": "👩🏻",
     "role": {
      "uk": "подруга з Познані",
      "ru": "подруга из Познани",
      "en": "a friend from Poznań"
     }
    },
    "steps": [
     {
      "npc": "Co robisz w sobotę? Może pojedziemy nad jezioro Maltańskie?",
      "npcTr": {
       "uk": "Що робиш у суботу? Може, поїдемо на Мальтанське озеро?",
       "ru": "Что делаешь в субботу? Может, поедем на Мальтанское озеро?",
       "en": "What are you doing on Saturday? Shall we go to Lake Malta?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Chętnie! Możemy jeździć na rowerze wokół jeziora.",
        "tr": {
         "uk": "Залюбки! Можемо кататися на велосипеді навколо озера.",
         "ru": "С удовольствием! Можем покататься на велосипеде вокруг озера.",
         "en": "Gladly! We can cycle around the lake."
        }
       },
       {
        "id": "s0o1",
        "text": "Chętnie! Możemy jeździć na rowerze w jezioro.",
        "tr": {
         "uk": "(«w jezioro» — у воду; навколо — **wokół jeziora**)",
         "ru": "(«w jezioro» — в воду; вокруг — **wokół jeziora**)",
         "en": "(\"w jezioro\" means into the water; around is **wokół jeziora**)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "**wokół** + родовий: wokół jezior**a**.",
       "ru": "**wokół** + родительный: wokół jezior**a**.",
       "en": "**wokół** + genitive: wokół jezior**a**."
      }
     },
     {
      "npc": "Super. A potem obiad: pyry z gzikiem!",
      "npcTr": {
       "uk": "Супер. А потім обід: картопля з гзиком!",
       "ru": "Супер. А потом обед: картошка с гзиком!",
       "en": "Great. And then lunch: potatoes with gzik!"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Pyry? To znaczy ziemniaki?",
        "tr": {
         "uk": "«Пири»? Тобто картопля?",
         "ru": "«Пыры»? То есть картошка?",
         "en": "\"Pyry\"? You mean potatoes?"
        }
       },
       {
        "id": "s1o1",
        "text": "Pyry? To znaczy ryby?",
        "tr": {
         "uk": "(pyry — не риба, а картопля)",
         "ru": "(pyry — не рыба, а картошка)",
         "en": "(pyry are potatoes, not fish)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "У Познані **pyry** = ziemniaki.",
       "ru": "В Познани **pyry** = ziemniaki.",
       "en": "In Poznań **pyry** = ziemniaki."
      }
     }
    ]
   },
   "explanation": null
  },
  "to": {
   "type": "DIALOGUE",
   "skill": "dialogue.weekend",
   "data": {
    "npc": {
     "name": "Ola",
     "emoji": "👩🏻",
     "role": {
      "uk": "подруга з Познані",
      "ru": "подруга из Познани",
      "en": "a friend from Poznań"
     }
    },
    "steps": [
     {
      "npc": "Co robisz w sobotę? Może pojedziemy nad jezioro Maltańskie?",
      "npcTr": {
       "uk": "Що робиш у суботу? Може, поїдемо на Мальтанське озеро?",
       "ru": "Что делаешь в субботу? Может, поедем на Мальтанское озеро?",
       "en": "What are you doing on Saturday? Shall we go to Lake Malta?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Chętnie! Możemy jeździć na rowerze wokół jeziora.",
        "tr": {
         "uk": "Залюбки! Можемо кататися на велосипеді навколо озера.",
         "ru": "С удовольствием! Можем покататься на велосипеде вокруг озера.",
         "en": "Gladly! We can cycle around the lake."
        }
       },
       {
        "id": "s0o1",
        "text": "Chętnie! Możemy jeździć na rowerze w jezioro.",
        "tr": {
         "uk": "(«w jezioro» — у воду; навколо — **wokół jeziora**)",
         "ru": "(«w jezioro» — в воду; вокруг — **wokół jeziora**)",
         "en": "(\"w jezioro\" means into the water; around is **wokół jeziora**)"
        }
       },
       {
        "id": "s0o2",
        "text": "Chętnie! Możemy jeździć na rowerze wokół jezioro.",
        "tr": {
         "uk": "(**wokół** + родовий: wokół **jeziora**)",
         "ru": "(**wokół** + родительный: wokół **jeziora**)",
         "en": "(**wokół** takes the genitive: wokół **jeziora**)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "**wokół** + родовий: wokół jezior**a**.",
       "ru": "**wokół** + родительный: wokół jezior**a**.",
       "en": "**wokół** + genitive: wokół jezior**a**."
      }
     },
     {
      "npc": "Super. A potem obiad: pyry z gzikiem!",
      "npcTr": {
       "uk": "Супер. А потім обід: картопля з гзиком!",
       "ru": "Супер. А потом обед: картошка с гзиком!",
       "en": "Great. And then lunch: potatoes with gzik!"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Pyry? To znaczy ziemniaki?",
        "tr": {
         "uk": "«Пири»? Тобто картопля?",
         "ru": "«Пыры»? То есть картошка?",
         "en": "\"Pyry\"? You mean potatoes?"
        }
       },
       {
        "id": "s1o1",
        "text": "Pyry? To znaczy ryby?",
        "tr": {
         "uk": "(pyry — не риба, а картопля)",
         "ru": "(pyry — не рыба, а картошка)",
         "en": "(pyry are potatoes, not fish)"
        }
       },
       {
        "id": "s1o2",
        "text": "Pyry? To znaczy pierogi?",
        "tr": {
         "uk": "(**pyry** — картопля (**ziemniaki**), а не **pierogi** — вареники)",
         "ru": "(**pyry** — картофель (**ziemniaki**), а не **pierogi** — вареники)",
         "en": "(**pyry** means potatoes (**ziemniaki**), not **pierogi** (dumplings))"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "У Познані **pyry** = ziemniaki.",
       "ru": "В Познани **pyry** = ziemniaki.",
       "en": "In Poznań **pyry** = ziemniaki."
      }
     }
    ]
   },
   "explanation": null
  }
 },
 {
  "lesson": "pzn-boss",
  "n": 0,
  "from": {
   "type": "SITUATION",
   "skill": "situation.boss",
   "data": {
    "npc": {
     "name": "Pani Agnieszka",
     "emoji": "👩🏼‍🏫",
     "role": {
      "uk": "екскурсоводка",
      "ru": "экскурсовод",
      "en": "a tour guide"
     }
    },
    "scene": {
     "uk": "Опівдні на Старому ринку в Познані",
     "ru": "В полдень на Старом рынке в Познани",
     "en": "Noon in Poznań's Old Market Square"
    },
    "steps": [
     {
      "npc": "Witam na Starym Rynku! Pierwszy raz w Poznaniu?",
      "npcTr": {
       "uk": "Вітаю на Старому ринку! Уперше в Познані?",
       "ru": "Добро пожаловать на Старый рынок! Впервые в Познани?",
       "en": "Welcome to the Old Market Square! First time in Poznań?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Tak, pierwszy raz. Jestem z Opola.",
        "tr": {
         "uk": "Так, уперше. Я з Ополя.",
         "ru": "Да, впервые. Я из Ополе.",
         "en": "Yes, the first time. I'm from Opole."
        }
       },
       {
        "id": "s0o1",
        "text": "Tak, pierwszy raz. Jestem w Opola.",
        "tr": {
         "uk": "(звідки? — **z** Opola)",
         "ru": "(откуда? — **z** Opola)",
         "en": "(from where? — **z** Opola)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "**Skąd?** → **z** + родовий: z Opola.",
       "ru": "**Skąd?** → **z** + родительный: z Opola.",
       "en": "**Skąd?** → **z** + genitive: z Opola."
      }
     },
     {
      "npc": "Za pięć minut jest dwunasta. Wie pan, co się stanie?",
      "npcTr": {
       "uk": "За п'ять хвилин дванадцята. Знаєте, що станеться?",
       "ru": "Через пять минут двенадцать. Знаете, что произойдёт?",
       "en": "It's twelve in five minutes. Do you know what will happen?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Tak! Koziołki trykają się dwanaście razy.",
        "tr": {
         "uk": "Так! Козлики б'ються рогами дванадцять разів.",
         "ru": "Да! Козлики бодаются двенадцать раз.",
         "en": "Yes! The goats butt heads twelve times."
        }
       },
       {
        "id": "s1o1",
        "text": "Tak! Koziołki trykają się dwanaście raz.",
        "tr": {
         "uk": "(від двох — **razy**)",
         "ru": "(начиная с двух — **razy**)",
         "en": "(from two on — **razy**)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "**dwanaście razy**.",
       "ru": "**dwanaście razy**.",
       "en": "**dwanaście razy**."
      }
     }
    ]
   },
   "explanation": null
  },
  "to": {
   "type": "SITUATION",
   "skill": "situation.boss",
   "data": {
    "npc": {
     "name": "Pani Agnieszka",
     "emoji": "👩🏼‍🏫",
     "role": {
      "uk": "екскурсоводка",
      "ru": "экскурсовод",
      "en": "a tour guide"
     }
    },
    "scene": {
     "uk": "Опівдні на Старому ринку в Познані",
     "ru": "В полдень на Старом рынке в Познани",
     "en": "Noon in Poznań's Old Market Square"
    },
    "steps": [
     {
      "npc": "Witam na Starym Rynku! Pierwszy raz w Poznaniu?",
      "npcTr": {
       "uk": "Вітаю на Старому ринку! Уперше в Познані?",
       "ru": "Добро пожаловать на Старый рынок! Впервые в Познани?",
       "en": "Welcome to the Old Market Square! First time in Poznań?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Tak, pierwszy raz. Jestem z Opola.",
        "tr": {
         "uk": "Так, уперше. Я з Ополя.",
         "ru": "Да, впервые. Я из Ополе.",
         "en": "Yes, the first time. I'm from Opole."
        }
       },
       {
        "id": "s0o1",
        "text": "Tak, pierwszy raz. Jestem w Opola.",
        "tr": {
         "uk": "(звідки? — **z** Opola)",
         "ru": "(откуда? — **z** Opola)",
         "en": "(from where? — **z** Opola)"
        }
       },
       {
        "id": "s0o2",
        "text": "Tak, pierwszy raz. Jestem z Opolu.",
        "tr": {
         "uk": "(**z** + родовий: z **Opola**)",
         "ru": "(**z** + родительный: z **Opola**)",
         "en": "(**z** takes the genitive: z **Opola**)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "**Skąd?** → **z** + родовий: z Opola.",
       "ru": "**Skąd?** → **z** + родительный: z Opola.",
       "en": "**Skąd?** → **z** + genitive: z Opola."
      }
     },
     {
      "npc": "Za pięć minut jest dwunasta. Wie pan, co się stanie?",
      "npcTr": {
       "uk": "За п'ять хвилин дванадцята. Знаєте, що станеться?",
       "ru": "Через пять минут двенадцать. Знаете, что произойдёт?",
       "en": "It's twelve in five minutes. Do you know what will happen?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Tak! Koziołki trykają się dwanaście razy.",
        "tr": {
         "uk": "Так! Козлики б'ються рогами дванадцять разів.",
         "ru": "Да! Козлики бодаются двенадцать раз.",
         "en": "Yes! The goats butt heads twelve times."
        }
       },
       {
        "id": "s1o1",
        "text": "Tak! Koziołki trykają się dwanaście raz.",
        "tr": {
         "uk": "(від двох — **razy**)",
         "ru": "(начиная с двух — **razy**)",
         "en": "(from two on — **razy**)"
        }
       },
       {
        "id": "s1o2",
        "text": "Tak! Koziołki trykają się dwa razy.",
        "tr": {
         "uk": "(козлики бодаються **dwanaście razy** — стільки, скільки годин, а не **dwa razy**)",
         "ru": "(козлики бодаются **dwanaście razy** — сколько часов, а не **dwa razy**)",
         "en": "(the goats butt **dwanaście razy** — once per hour of noon — not **dwa razy**)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "**dwanaście razy**.",
       "ru": "**dwanaście razy**.",
       "en": "**dwanaście razy**."
      }
     }
    ]
   },
   "explanation": null
  }
 },
 {
  "lesson": "zg-1-zyczenia",
  "n": 0,
  "from": {
   "type": "DIALOGUE",
   "skill": "dialogue.wishes",
   "data": {
    "npc": {
     "name": "Magda",
     "emoji": "👩🏼",
     "role": {
      "uk": "подруга із Зеленої Гури",
      "ru": "подруга из Зелёна-Гуры",
      "en": "a friend from Zielona Góra"
     }
    },
    "steps": [
     {
      "npc": "Hej! Wiesz co? Dzisiaj mam urodziny!",
      "npcTr": {
       "uk": "Гей! Знаєш що? Сьогодні в мене день народження!",
       "ru": "Эй! Знаешь что? Сегодня у меня день рождения!",
       "en": "Hey! Guess what? It’s my birthday today!"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Naprawdę? Sto lat!",
        "tr": {
         "uk": "Справді? Сто років!",
         "ru": "Правда? Сто лет!",
         "en": "Really? Happy birthday!"
        }
       },
       {
        "id": "s0o1",
        "text": "Naprawdę? Gratuluję urodzin!",
        "tr": {
         "uk": "(«gratuluję» — за досягнення; на день народження — «Sto lat!», «Wszystkiego najlepszego!»)",
         "ru": "(«gratuluję» — за достижение; на день рождения — «Sto lat!», «Wszystkiego najlepszego!»)",
         "en": "(«gratuluję» is for achievements; on a birthday say «Sto lat!»)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "На день народження: **Sto lat!** або **Wszystkiego najlepszego!**",
       "ru": "На день рождения: **Sto lat!** или **Wszystkiego najlepszego!**",
       "en": "On a birthday: **Sto lat!** or **Wszystkiego najlepszego!**"
      }
     },
     {
      "npc": "Dziękuję! Wieczorem robię małą imprezę. Przyjdziesz?",
      "npcTr": {
       "uk": "Дякую! Увечері я влаштовую невелику вечірку. Прийдеш?",
       "ru": "Спасибо! Вечером я устраиваю небольшую вечеринку. Придёшь?",
       "en": "Thanks! I’m having a little party tonight. Will you come?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Jasne, chętnie przyjdę!",
        "tr": {
         "uk": "Звісно, охоче прийду!",
         "ru": "Конечно, с удовольствием приду!",
         "en": "Sure, I’d love to come!"
        }
       },
       {
        "id": "s1o1",
        "text": "Jasne, chętnie przyjść!",
        "tr": {
         "uk": "(це інфінітив; «я прийду» — **przyjdę**)",
         "ru": "(это инфинитив; «я приду» — **przyjdę**)",
         "en": "(that’s the infinitive; “I’ll come” is **przyjdę**)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "Про себе в майбутньому: **przyjdę** — я прийду.",
       "ru": "О себе в будущем: **przyjdę** — я приду.",
       "en": "About yourself in the future: **przyjdę** — I’ll come."
      }
     }
    ]
   },
   "explanation": null
  },
  "to": {
   "type": "DIALOGUE",
   "skill": "dialogue.wishes",
   "data": {
    "npc": {
     "name": "Magda",
     "emoji": "👩🏼",
     "role": {
      "uk": "подруга із Зеленої Гури",
      "ru": "подруга из Зелёна-Гуры",
      "en": "a friend from Zielona Góra"
     }
    },
    "steps": [
     {
      "npc": "Hej! Wiesz co? Dzisiaj mam urodziny!",
      "npcTr": {
       "uk": "Гей! Знаєш що? Сьогодні в мене день народження!",
       "ru": "Эй! Знаешь что? Сегодня у меня день рождения!",
       "en": "Hey! Guess what? It’s my birthday today!"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Naprawdę? Sto lat!",
        "tr": {
         "uk": "Справді? Сто років!",
         "ru": "Правда? Сто лет!",
         "en": "Really? Happy birthday!"
        }
       },
       {
        "id": "s0o1",
        "text": "Naprawdę? Gratuluję urodzin!",
        "tr": {
         "uk": "(«gratuluję» — за досягнення; на день народження — «Sto lat!», «Wszystkiego najlepszego!»)",
         "ru": "(«gratuluję» — за достижение; на день рождения — «Sto lat!», «Wszystkiego najlepszego!»)",
         "en": "(«gratuluję» is for achievements; on a birthday say «Sto lat!»)"
        }
       },
       {
        "id": "s0o2",
        "text": "Naprawdę? Wszystkiego najlepszego z okazji imienin!",
        "tr": {
         "uk": "(у нього **urodziny**, а не **imieniny**; побажання: **Wszystkiego najlepszego!**)",
         "ru": "(у него **urodziny**, а не **imieniny**; пожелание: **Wszystkiego najlepszego!**)",
         "en": "(it is his **urodziny** (birthday), not **imieniny** (name day))"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "На день народження: **Sto lat!** або **Wszystkiego najlepszego!**",
       "ru": "На день рождения: **Sto lat!** или **Wszystkiego najlepszego!**",
       "en": "On a birthday: **Sto lat!** or **Wszystkiego najlepszego!**"
      }
     },
     {
      "npc": "Dziękuję! Wieczorem robię małą imprezę. Przyjdziesz?",
      "npcTr": {
       "uk": "Дякую! Увечері я влаштовую невелику вечірку. Прийдеш?",
       "ru": "Спасибо! Вечером я устраиваю небольшую вечеринку. Придёшь?",
       "en": "Thanks! I’m having a little party tonight. Will you come?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Jasne, chętnie przyjdę!",
        "tr": {
         "uk": "Звісно, охоче прийду!",
         "ru": "Конечно, с удовольствием приду!",
         "en": "Sure, I’d love to come!"
        }
       },
       {
        "id": "s1o1",
        "text": "Jasne, chętnie przyjść!",
        "tr": {
         "uk": "(це інфінітив; «я прийду» — **przyjdę**)",
         "ru": "(это инфинитив; «я приду» — **przyjdę**)",
         "en": "(that’s the infinitive; “I’ll come” is **przyjdę**)"
        }
       },
       {
        "id": "s1o2",
        "text": "Jasne, chętnie przyszedłem!",
        "tr": {
         "uk": "(вечірка ввечері — майбутнє: **przyjdę**, а не минуле **przyszedłem**)",
         "ru": "(вечеринка вечером — будущее: **przyjdę**, а не прошедшее **przyszedłem**)",
         "en": "(the party is this evening — future: **przyjdę**, not the past **przyszedłem**)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "Про себе в майбутньому: **przyjdę** — я прийду.",
       "ru": "О себе в будущем: **przyjdę** — я приду.",
       "en": "About yourself in the future: **przyjdę** — I’ll come."
      }
     }
    ]
   },
   "explanation": null
  }
 },
 {
  "lesson": "zg-2-imieniny",
  "n": 0,
  "from": {
   "type": "DIALOGUE",
   "skill": "dialogue.gifts",
   "data": {
    "npc": {
     "name": "Kacper",
     "emoji": "🧑🏻‍🎓",
     "role": {
      "uk": "студент, сусід по квартирі",
      "ru": "студент, сосед по квартире",
      "en": "a student, your flatmate"
     }
    },
    "steps": [
     {
      "npc": "Jutro Kasia ma imieniny. Co jej kupimy?",
      "npcTr": {
       "uk": "Завтра в Касі іменини. Що ми їй купимо?",
       "ru": "Завтра у Каси именины. Что мы ей купим?",
       "en": "Tomorrow is Kasia’s name day. What shall we buy her?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Kupmy jej kwiaty i tort.",
        "tr": {
         "uk": "Купімо їй квіти й торт.",
         "ru": "Давай купим ей цветы и торт.",
         "en": "Let’s buy her flowers and a cake."
        }
       },
       {
        "id": "s0o1",
        "text": "Kupmy ją kwiaty i tort.",
        "tr": {
         "uk": "(«ją» — «її», кого?; кому? — **jej**)",
         "ru": "(«ją» — «её», кого?; кому? — **jej**)",
         "en": "(«ją» answers “whom?”; “to whom?” is **jej**)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "Кому? — **jej** (їй).",
       "ru": "Кому? — **jej** (ей).",
       "en": "To whom? — **jej** (to her)."
      }
     },
     {
      "npc": "Dobry pomysł! A kto kupi tort?",
      "npcTr": {
       "uk": "Гарна ідея! А хто купить торт?",
       "ru": "Хорошая идея! А кто купит торт?",
       "en": "Good idea! And who’ll buy the cake?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Ja kupię. Ty kup kwiaty.",
        "tr": {
         "uk": "Я куплю. А ти купи квіти.",
         "ru": "Я куплю. А ты купи цветы.",
         "en": "I will. You get the flowers."
        }
       },
       {
        "id": "s1o1",
        "text": "Ja kupić. Ty kup kwiaty.",
        "tr": {
         "uk": "(це інфінітив; «я куплю» — **kupię**)",
         "ru": "(это инфинитив; «я куплю» — **kupię**)",
         "en": "(that’s the infinitive; “I’ll buy” is **kupię**)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "Я куплю — **kupię**.",
       "ru": "Я куплю — **kupię**.",
       "en": "I’ll buy — **kupię**."
      }
     }
    ]
   },
   "explanation": null
  },
  "to": {
   "type": "DIALOGUE",
   "skill": "dialogue.gifts",
   "data": {
    "npc": {
     "name": "Kacper",
     "emoji": "🧑🏻‍🎓",
     "role": {
      "uk": "студент, сусід по квартирі",
      "ru": "студент, сосед по квартире",
      "en": "a student, your flatmate"
     }
    },
    "steps": [
     {
      "npc": "Jutro Kasia ma imieniny. Co jej kupimy?",
      "npcTr": {
       "uk": "Завтра в Касі іменини. Що ми їй купимо?",
       "ru": "Завтра у Каси именины. Что мы ей купим?",
       "en": "Tomorrow is Kasia’s name day. What shall we buy her?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Kupmy jej kwiaty i tort.",
        "tr": {
         "uk": "Купімо їй квіти й торт.",
         "ru": "Давай купим ей цветы и торт.",
         "en": "Let’s buy her flowers and a cake."
        }
       },
       {
        "id": "s0o1",
        "text": "Kupmy ją kwiaty i tort.",
        "tr": {
         "uk": "(«ją» — «її», кого?; кому? — **jej**)",
         "ru": "(«ją» — «её», кого?; кому? — **jej**)",
         "en": "(«ją» answers “whom?”; “to whom?” is **jej**)"
        }
       },
       {
        "id": "s0o2",
        "text": "Kupmy jemu kwiaty i tort.",
        "tr": {
         "uk": "(Kasia — «вона»: **jej**; «jemu» — «йому»)",
         "ru": "(Kasia — «она»: **jej**; «jemu» — «ему»)",
         "en": "(Kasia is “she”: **jej**; “jemu” means “to him”)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "Кому? — **jej** (їй).",
       "ru": "Кому? — **jej** (ей).",
       "en": "To whom? — **jej** (to her)."
      }
     },
     {
      "npc": "Dobry pomysł! A kto kupi tort?",
      "npcTr": {
       "uk": "Гарна ідея! А хто купить торт?",
       "ru": "Хорошая идея! А кто купит торт?",
       "en": "Good idea! And who’ll buy the cake?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Ja kupię. Ty kup kwiaty.",
        "tr": {
         "uk": "Я куплю. А ти купи квіти.",
         "ru": "Я куплю. А ты купи цветы.",
         "en": "I will. You get the flowers."
        }
       },
       {
        "id": "s1o1",
        "text": "Ja kupić. Ty kup kwiaty.",
        "tr": {
         "uk": "(це інфінітив; «я куплю» — **kupię**)",
         "ru": "(это инфинитив; «я куплю» — **kupię**)",
         "en": "(that’s the infinitive; “I’ll buy” is **kupię**)"
        }
       },
       {
        "id": "s1o2",
        "text": "Ja kupisz. Ty kup kwiaty.",
        "tr": {
         "uk": "(**ja** + **kupię**; **kupisz** — «ти купиш»)",
         "ru": "(**ja** + **kupię**; **kupisz** — «ты купишь»)",
         "en": "(**ja** goes with **kupię**; **kupisz** means “you will buy”)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "Я куплю — **kupię**.",
       "ru": "Я куплю — **kupię**.",
       "en": "I’ll buy — **kupię**."
      }
     }
    ]
   },
   "explanation": null
  }
 },
 {
  "lesson": "zg-3-wigilia",
  "n": 0,
  "from": {
   "type": "DIALOGUE",
   "skill": "dialogue.christmas",
   "data": {
    "npc": {
     "name": "Pani Halina",
     "emoji": "👵🏼",
     "role": {
      "uk": "сусідка, знає всі традиції",
      "ru": "соседка, знает все традиции",
      "en": "a neighbour who knows every tradition"
     }
    },
    "steps": [
     {
      "npc": "Dzień dobry! Jak minęły święta?",
      "npcTr": {
       "uk": "Добрий день! Як минули свята?",
       "ru": "Добрый день! Как прошли праздники?",
       "en": "Good morning! How was Christmas?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Bardzo dobrze! Byłem u rodziny w Krakowie.",
        "tr": {
         "uk": "Дуже добре! Я був у родини в Кракові.",
         "ru": "Очень хорошо! Я был у родных в Кракове.",
         "en": "Very good! I was with family in Kraków."
        }
       },
       {
        "id": "s0o1",
        "text": "Bardzo dobrze! Jestem u rodziny w Krakowie.",
        "tr": {
         "uk": "(це теперішній час, а питають про минулі свята)",
         "ru": "(это настоящее время, а спрашивают о прошедших праздниках)",
         "en": "(that’s the present tense; she asks about the past)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "Про минуле — **byłem / byłam**.",
       "ru": "О прошлом — **byłem / byłam**.",
       "en": "About the past — **byłem / byłam**."
      }
     },
     {
      "npc": "A co jedliście na Wigilię?",
      "npcTr": {
       "uk": "А що ви їли на Святвечір?",
       "ru": "А что вы ели в Сочельник?",
       "en": "And what did you eat on Christmas Eve?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Barszcz z uszkami, karpia i pierogi.",
        "tr": {
         "uk": "Борщ з вушками, коропа й вареники.",
         "ru": "Борщ с ушками, карпа и вареники.",
         "en": "Beetroot soup with dumplings, carp and pierogi."
        }
       },
       {
        "id": "s1o1",
        "text": "Barszcz z uszkami, karp i pierogi.",
        "tr": {
         "uk": "(їли кого? — **karpia**: короп — жива істота)",
         "ru": "(ели кого? — **karpia**: карп — живое существо)",
         "en": "(carp is animate: **karpia**)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "Jeść (kogo? co?) — **karpia**, як «бачу кота».",
       "ru": "Jeść (kogo? co?) — **karpia**, как «вижу кота».",
       "en": "Jeść + accusative; animate karp → **karpia**."
      }
     }
    ]
   },
   "explanation": null
  },
  "to": {
   "type": "DIALOGUE",
   "skill": "dialogue.christmas",
   "data": {
    "npc": {
     "name": "Pani Halina",
     "emoji": "👵🏼",
     "role": {
      "uk": "сусідка, знає всі традиції",
      "ru": "соседка, знает все традиции",
      "en": "a neighbour who knows every tradition"
     }
    },
    "steps": [
     {
      "npc": "Dzień dobry! Jak minęły święta?",
      "npcTr": {
       "uk": "Добрий день! Як минули свята?",
       "ru": "Добрый день! Как прошли праздники?",
       "en": "Good morning! How was Christmas?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Bardzo dobrze! Byłem u rodziny w Krakowie.",
        "tr": {
         "uk": "Дуже добре! Я був у родини в Кракові.",
         "ru": "Очень хорошо! Я был у родных в Кракове.",
         "en": "Very good! I was with family in Kraków."
        }
       },
       {
        "id": "s0o1",
        "text": "Bardzo dobrze! Jestem u rodziny w Krakowie.",
        "tr": {
         "uk": "(це теперішній час, а питають про минулі свята)",
         "ru": "(это настоящее время, а спрашивают о прошедших праздниках)",
         "en": "(that’s the present tense; she asks about the past)"
        }
       },
       {
        "id": "s0o2",
        "text": "Bardzo dobrze! Będę u rodziny w Krakowie.",
        "tr": {
         "uk": "(спитали про свята, що минули: **byłem**, а не майбутнє **będę**)",
         "ru": "(спросили о прошедших праздниках: **byłem**, а не будущее **będę**)",
         "en": "(the question is about the holidays that are over: **byłem**, not the future **będę**)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "Про минуле — **byłem / byłam**.",
       "ru": "О прошлом — **byłem / byłam**.",
       "en": "About the past — **byłem / byłam**."
      }
     },
     {
      "npc": "A co jedliście na Wigilię?",
      "npcTr": {
       "uk": "А що ви їли на Святвечір?",
       "ru": "А что вы ели в Сочельник?",
       "en": "And what did you eat on Christmas Eve?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Barszcz z uszkami, karpia i pierogi.",
        "tr": {
         "uk": "Борщ з вушками, коропа й вареники.",
         "ru": "Борщ с ушками, карпа и вареники.",
         "en": "Beetroot soup with dumplings, carp and pierogi."
        }
       },
       {
        "id": "s1o1",
        "text": "Barszcz z uszkami, karp i pierogi.",
        "tr": {
         "uk": "(їли кого? — **karpia**: короп — жива істота)",
         "ru": "(ели кого? — **karpia**: карп — живое существо)",
         "en": "(carp is animate: **karpia**)"
        }
       },
       {
        "id": "s1o2",
        "text": "Barszcz z uszkami, karpiem i pierogi.",
        "tr": {
         "uk": "(**jeść** + знахідний: **karpia**, а не орудний)",
         "ru": "(**jeść** + винительный: **karpia**, а не творительный)",
         "en": "(**jeść** takes the accusative: **karpia**, not the instrumental)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "Jeść (kogo? co?) — **karpia**, як «бачу кота».",
       "ru": "Jeść (kogo? co?) — **karpia**, как «вижу кота».",
       "en": "Jeść + accusative; animate karp → **karpia**."
      }
     }
    ]
   },
   "explanation": null
  }
 },
 {
  "lesson": "zg-4-sylwester",
  "n": 0,
  "from": {
   "type": "DIALOGUE",
   "skill": "dialogue.newyear",
   "data": {
    "npc": {
     "name": "Magda",
     "emoji": "👩🏼",
     "role": {
      "uk": "подруга із Зеленої Гури",
      "ru": "подруга из Зелёна-Гуры",
      "en": "a friend from Zielona Góra"
     }
    },
    "steps": [
     {
      "npc": "Co robisz w Sylwestra?",
      "npcTr": {
       "uk": "Що робиш на Сильвестра?",
       "ru": "Что делаешь в новогоднюю ночь?",
       "en": "What are you doing on New Year’s Eve?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Będę na imprezie u Kacpra.",
        "tr": {
         "uk": "Буду на вечірці в Кацпера.",
         "ru": "Буду на вечеринке у Кацпера.",
         "en": "I’ll be at Kacper’s party."
        }
       },
       {
        "id": "s0o1",
        "text": "Byłem na imprezie u Kacpra.",
        "tr": {
         "uk": "(це минуле, а питають про плани)",
         "ru": "(это прошлое, а спрашивают о планах)",
         "en": "(that’s the past; she asks about plans)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "Плани — майбутній час: **będę** na imprezie.",
       "ru": "Планы — будущее время: **będę** na imprezie.",
       "en": "Plans — future: **będę**."
      }
     },
     {
      "npc": "Super! A o północy?",
      "npcTr": {
       "uk": "Супер! А опівночі?",
       "ru": "Супер! А в полночь?",
       "en": "Great! And at midnight?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Będziemy oglądać fajerwerki na rynku.",
        "tr": {
         "uk": "Будемо дивитися феєрверки на ринку.",
         "ru": "Будем смотреть фейерверки на площади.",
         "en": "We’ll watch the fireworks in the square."
        }
       },
       {
        "id": "s1o1",
        "text": "Będziemy oglądamy fajerwerki na rynku.",
        "tr": {
         "uk": "(після **będziemy** — інфінітив: oglądać)",
         "ru": "(после **będziemy** — инфинитив: oglądać)",
         "en": "(after **będziemy** use the infinitive)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "**będziemy + інфінітив**: będziemy **oglądać**.",
       "ru": "**będziemy + инфинитив**: będziemy **oglądać**.",
       "en": "**będziemy + infinitive**."
      }
     }
    ]
   },
   "explanation": null
  },
  "to": {
   "type": "DIALOGUE",
   "skill": "dialogue.newyear",
   "data": {
    "npc": {
     "name": "Magda",
     "emoji": "👩🏼",
     "role": {
      "uk": "подруга із Зеленої Гури",
      "ru": "подруга из Зелёна-Гуры",
      "en": "a friend from Zielona Góra"
     }
    },
    "steps": [
     {
      "npc": "Co robisz w Sylwestra?",
      "npcTr": {
       "uk": "Що робиш на Сильвестра?",
       "ru": "Что делаешь в новогоднюю ночь?",
       "en": "What are you doing on New Year’s Eve?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Będę na imprezie u Kacpra.",
        "tr": {
         "uk": "Буду на вечірці в Кацпера.",
         "ru": "Буду на вечеринке у Кацпера.",
         "en": "I’ll be at Kacper’s party."
        }
       },
       {
        "id": "s0o1",
        "text": "Byłem na imprezie u Kacpra.",
        "tr": {
         "uk": "(це минуле, а питають про плани)",
         "ru": "(это прошлое, а спрашивают о планах)",
         "en": "(that’s the past; she asks about plans)"
        }
       },
       {
        "id": "s0o2",
        "text": "Będę na imprezę u Kacpra.",
        "tr": {
         "uk": "(де? — **na** + місцевий: na **imprezie**)",
         "ru": "(где? — **na** + предложный: na **imprezie**)",
         "en": "(where? — **na** + locative: na **imprezie**)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "Плани — майбутній час: **będę** na imprezie.",
       "ru": "Планы — будущее время: **będę** na imprezie.",
       "en": "Plans — future: **będę**."
      }
     },
     {
      "npc": "Super! A o północy?",
      "npcTr": {
       "uk": "Супер! А опівночі?",
       "ru": "Супер! А в полночь?",
       "en": "Great! And at midnight?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Będziemy oglądać fajerwerki na rynku.",
        "tr": {
         "uk": "Будемо дивитися феєрверки на ринку.",
         "ru": "Будем смотреть фейерверки на площади.",
         "en": "We’ll watch the fireworks in the square."
        }
       },
       {
        "id": "s1o1",
        "text": "Będziemy oglądamy fajerwerki na rynku.",
        "tr": {
         "uk": "(після **będziemy** — інфінітив: oglądać)",
         "ru": "(после **będziemy** — инфинитив: oglądać)",
         "en": "(after **będziemy** use the infinitive)"
        }
       },
       {
        "id": "s1o2",
        "text": "Będziemy oglądać fajerwerków na rynku.",
        "tr": {
         "uk": "(**oglądać** + знахідний: **fajerwerki**, а не родовий)",
         "ru": "(**oglądać** + винительный: **fajerwerki**, а не родительный)",
         "en": "(**oglądać** takes the accusative: **fajerwerki**, not the genitive)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "**będziemy + інфінітив**: będziemy **oglądać**.",
       "ru": "**będziemy + инфинитив**: będziemy **oglądać**.",
       "en": "**będziemy + infinitive**."
      }
     }
    ]
   },
   "explanation": null
  }
 },
 {
  "lesson": "zg-5-wielkanoc",
  "n": 0,
  "from": {
   "type": "DIALOGUE",
   "skill": "dialogue.easter",
   "data": {
    "npc": {
     "name": "Pani Halina",
     "emoji": "👵🏼",
     "role": {
      "uk": "сусідка, знає всі традиції",
      "ru": "соседка, знает все традиции",
      "en": "a neighbour who knows every tradition"
     }
    },
    "steps": [
     {
      "npc": "W sobotę idę ze święconką do kościoła. Pójdzie pan ze mną?",
      "npcTr": {
       "uk": "У суботу я йду з кошиком святити до костелу. Підете зі мною?",
       "ru": "В субботу я иду с корзинкой святить в костёл. Пойдёте со мной?",
       "en": "On Saturday I’m taking my Easter basket to church. Will you come with me?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Chętnie! Co trzeba włożyć do koszyczka?",
        "tr": {
         "uk": "Охоче! Що треба покласти в кошик?",
         "ru": "С удовольствием! Что нужно положить в корзинку?",
         "en": "Gladly! What do I need to put in the basket?"
        }
       },
       {
        "id": "s0o1",
        "text": "Chętnie! Co trzeba włożyć do koszyczek?",
        "tr": {
         "uk": "(після **do** — родовий: do **koszyczka**)",
         "ru": "(после **do** — родительный: do **koszyczka**)",
         "en": "(after **do** use the genitive: do **koszyczka**)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "Куди? — **do** + родовий: do **koszyczka**.",
       "ru": "Куда? — **do** + родительный: do **koszyczka**.",
       "en": "**do** + genitive: do **koszyczka**."
      }
     },
     {
      "npc": "Jajka, chleb, sól i kiełbasę. I małego baranka z cukru.",
      "npcTr": {
       "uk": "Яйця, хліб, сіль і ковбасу. І маленьке ягнятко з цукру.",
       "ru": "Яйца, хлеб, соль и колбасу. И маленького барашка из сахара.",
       "en": "Eggs, bread, salt and sausage. And a little sugar lamb."
      }
     },
     {
      "npc": "Ma pan już jajka?",
      "npcTr": {
       "uk": "У вас уже є яйця?",
       "ru": "У вас уже есть яйца?",
       "en": "Do you have eggs already?"
      },
      "options": [
       {
        "id": "s2o0",
        "text": "Tak, mam pięć pisanek.",
        "tr": {
         "uk": "Так, у мене п’ять писанок.",
         "ru": "Да, у меня пять расписных яиц.",
         "en": "Yes, I have five painted eggs."
        }
       },
       {
        "id": "s2o1",
        "text": "Tak, mam pięć pisanki.",
        "tr": {
         "uk": "(після «pięć» — родовий множини: **pięć pisanek**)",
         "ru": "(после «pięć» — родительный множественного: **pięć pisanek**)",
         "en": "(after «pięć» use the genitive plural: **pisanek**)"
        }
       }
      ],
      "answer": "s2o0",
      "feedback": {
       "uk": "Після **pięć** і більше — родовий множини: pisanka → **pięć pisanek**.",
       "ru": "После **pięć** и больше — родительный множественного: pisanka → **pięć pisanek**.",
       "en": "After five and more: genitive plural **pisanek**."
      }
     }
    ]
   },
   "explanation": null
  },
  "to": {
   "type": "DIALOGUE",
   "skill": "dialogue.easter",
   "data": {
    "npc": {
     "name": "Pani Halina",
     "emoji": "👵🏼",
     "role": {
      "uk": "сусідка, знає всі традиції",
      "ru": "соседка, знает все традиции",
      "en": "a neighbour who knows every tradition"
     }
    },
    "steps": [
     {
      "npc": "W sobotę idę ze święconką do kościoła. Pójdzie pan ze mną?",
      "npcTr": {
       "uk": "У суботу я йду з кошиком святити до костелу. Підете зі мною?",
       "ru": "В субботу я иду с корзинкой святить в костёл. Пойдёте со мной?",
       "en": "On Saturday I’m taking my Easter basket to church. Will you come with me?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Chętnie! Co trzeba włożyć do koszyczka?",
        "tr": {
         "uk": "Охоче! Що треба покласти в кошик?",
         "ru": "С удовольствием! Что нужно положить в корзинку?",
         "en": "Gladly! What do I need to put in the basket?"
        }
       },
       {
        "id": "s0o1",
        "text": "Chętnie! Co trzeba włożyć do koszyczek?",
        "tr": {
         "uk": "(після **do** — родовий: do **koszyczka**)",
         "ru": "(после **do** — родительный: do **koszyczka**)",
         "en": "(after **do** use the genitive: do **koszyczka**)"
        }
       },
       {
        "id": "s0o2",
        "text": "Chętnie! Co trzeba włożyć w koszyczku?",
        "tr": {
         "uk": "(куди покласти? — **do** + родовий: do **koszyczka**; **w koszyczku** — «у кошику», де лежить)",
         "ru": "(куда положить? — **do** + родительный: do **koszyczka**; **w koszyczku** — «в корзинке», где лежит)",
         "en": "(put where to? — **do** + genitive: do **koszyczka**; **w koszyczku** means “inside the basket”)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "Куди? — **do** + родовий: do **koszyczka**.",
       "ru": "Куда? — **do** + родительный: do **koszyczka**.",
       "en": "**do** + genitive: do **koszyczka**."
      }
     },
     {
      "npc": "Jajka, chleb, sól i kiełbasę. I małego baranka z cukru.",
      "npcTr": {
       "uk": "Яйця, хліб, сіль і ковбасу. І маленьке ягнятко з цукру.",
       "ru": "Яйца, хлеб, соль и колбасу. И маленького барашка из сахара.",
       "en": "Eggs, bread, salt and sausage. And a little sugar lamb."
      }
     },
     {
      "npc": "Ma pan już jajka?",
      "npcTr": {
       "uk": "У вас уже є яйця?",
       "ru": "У вас уже есть яйца?",
       "en": "Do you have eggs already?"
      },
      "options": [
       {
        "id": "s2o0",
        "text": "Tak, mam pięć pisanek.",
        "tr": {
         "uk": "Так, у мене п’ять писанок.",
         "ru": "Да, у меня пять расписных яиц.",
         "en": "Yes, I have five painted eggs."
        }
       },
       {
        "id": "s2o1",
        "text": "Tak, mam pięć pisanki.",
        "tr": {
         "uk": "(після «pięć» — родовий множини: **pięć pisanek**)",
         "ru": "(после «pięć» — родительный множественного: **pięć pisanek**)",
         "en": "(after «pięć» use the genitive plural: **pisanek**)"
        }
       },
       {
        "id": "s2o2",
        "text": "Tak, mam pięć pisankami.",
        "tr": {
         "uk": "(після «pięć» — родовий множини: **pięć pisanek**)",
         "ru": "(после «pięć» — родительный множественного: **pięć pisanek**)",
         "en": "(after “pięć” use the genitive plural: **pięć pisanek**)"
        }
       }
      ],
      "answer": "s2o0",
      "feedback": {
       "uk": "Після **pięć** і більше — родовий множини: pisanka → **pięć pisanek**.",
       "ru": "После **pięć** и больше — родительный множественного: pisanka → **pięć pisanek**.",
       "en": "After five and more: genitive plural **pisanek**."
      }
     }
    ]
   },
   "explanation": null
  }
 },
 {
  "lesson": "zg-6-dni-wolne",
  "n": 0,
  "from": {
   "type": "DIALOGUE",
   "skill": "dialogue.dayoff",
   "data": {
    "npc": {
     "name": "Kacper",
     "emoji": "🧑🏻‍🎓",
     "role": {
      "uk": "студент, сусід по квартирі",
      "ru": "студент, сосед по квартире",
      "en": "a student, your flatmate"
     }
    },
    "steps": [
     {
      "npc": "Jutro jest jedenasty listopada. Masz wolne?",
      "npcTr": {
       "uk": "Завтра одинадцяте листопада. У тебе вихідний?",
       "ru": "Завтра одиннадцатое ноября. У тебя выходной?",
       "en": "Tomorrow is the eleventh of November. Do you have the day off?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Tak, to święto, nie pracuję.",
        "tr": {
         "uk": "Так, це свято, я не працюю.",
         "ru": "Да, это праздник, я не работаю.",
         "en": "Yes, it’s a holiday, I’m not working."
        }
       },
       {
        "id": "s0o1",
        "text": "Tak, to święto, nie pracuje.",
        "tr": {
         "uk": "(«pracuje» — він працює; я — **pracuję**)",
         "ru": "(«pracuje» — он работает; я — **pracuję**)",
         "en": "(«pracuje» = he works; I = **pracuję**)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "Я — **nie pracuję** (з -ę).",
       "ru": "Я — **nie pracuję** (с -ę).",
       "en": "I — **nie pracuję**."
      }
     },
     {
      "npc": "To zrób dzisiaj zakupy. Jutro sklepy będą zamknięte.",
      "npcTr": {
       "uk": "Тоді зроби покупки сьогодні. Завтра магазини будуть зачинені.",
       "ru": "Тогда сделай покупки сегодня. Завтра магазины будут закрыты.",
       "en": "Then do your shopping today. The shops will be closed tomorrow."
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Dobrze, pójdę do sklepu dziś wieczorem.",
        "tr": {
         "uk": "Добре, піду в магазин сьогодні ввечері.",
         "ru": "Хорошо, пойду в магазин сегодня вечером.",
         "en": "OK, I’ll go to the shop this evening."
        }
       },
       {
        "id": "s1o1",
        "text": "Dobrze, pójdę do sklepu jutro rano.",
        "tr": {
         "uk": "(завтра магазини зачинені — купи сьогодні)",
         "ru": "(завтра магазины закрыты — купи сегодня)",
         "en": "(the shops are closed tomorrow)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "«Jutro sklepy będą zamknięte» — «Завтра магазини будуть зачинені».",
       "ru": "«Jutro sklepy będą zamknięte» — «Завтра магазины будут закрыты».",
       "en": "“The shops will be closed tomorrow.”"
      }
     }
    ]
   },
   "explanation": null
  },
  "to": {
   "type": "DIALOGUE",
   "skill": "dialogue.dayoff",
   "data": {
    "npc": {
     "name": "Kacper",
     "emoji": "🧑🏻‍🎓",
     "role": {
      "uk": "студент, сусід по квартирі",
      "ru": "студент, сосед по квартире",
      "en": "a student, your flatmate"
     }
    },
    "steps": [
     {
      "npc": "Jutro jest jedenasty listopada. Masz wolne?",
      "npcTr": {
       "uk": "Завтра одинадцяте листопада. У тебе вихідний?",
       "ru": "Завтра одиннадцатое ноября. У тебя выходной?",
       "en": "Tomorrow is the eleventh of November. Do you have the day off?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Tak, to święto, nie pracuję.",
        "tr": {
         "uk": "Так, це свято, я не працюю.",
         "ru": "Да, это праздник, я не работаю.",
         "en": "Yes, it’s a holiday, I’m not working."
        }
       },
       {
        "id": "s0o1",
        "text": "Tak, to święto, nie pracuje.",
        "tr": {
         "uk": "(«pracuje» — він працює; я — **pracuję**)",
         "ru": "(«pracuje» — он работает; я — **pracuję**)",
         "en": "(«pracuje» = he works; I = **pracuję**)"
        }
       },
       {
        "id": "s0o2",
        "text": "Nie, to święto, nie pracuję.",
        "tr": {
         "uk": "(**Nie** — «ні, не вихідний», а далі «не працюю» — суперечність; відповідь — **Tak**)",
         "ru": "(**Nie** — «нет, не выходной», а дальше «не работаю» — противоречие; ответ — **Tak**)",
         "en": "(**Nie** says “no day off”, yet you then say you are not working — the answer is **Tak**)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "Я — **nie pracuję** (з -ę).",
       "ru": "Я — **nie pracuję** (с -ę).",
       "en": "I — **nie pracuję**."
      }
     },
     {
      "npc": "To zrób dzisiaj zakupy. Jutro sklepy będą zamknięte.",
      "npcTr": {
       "uk": "Тоді зроби покупки сьогодні. Завтра магазини будуть зачинені.",
       "ru": "Тогда сделай покупки сегодня. Завтра магазины будут закрыты.",
       "en": "Then do your shopping today. The shops will be closed tomorrow."
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Dobrze, pójdę do sklepu dziś wieczorem.",
        "tr": {
         "uk": "Добре, піду в магазин сьогодні ввечері.",
         "ru": "Хорошо, пойду в магазин сегодня вечером.",
         "en": "OK, I’ll go to the shop this evening."
        }
       },
       {
        "id": "s1o1",
        "text": "Dobrze, pójdę do sklepu jutro rano.",
        "tr": {
         "uk": "(завтра магазини зачинені — купи сьогодні)",
         "ru": "(завтра магазины закрыты — купи сегодня)",
         "en": "(the shops are closed tomorrow)"
        }
       },
       {
        "id": "s1o2",
        "text": "Dobrze, pójdę do sklepu wczoraj wieczorem.",
        "tr": {
         "uk": "(**wczoraj** — минуле; «pójdę» — майбутнє: **dziś wieczorem**)",
         "ru": "(**wczoraj** — прошлое; «pójdę» — будущее: **dziś wieczorem**)",
         "en": "(**wczoraj** is yesterday; “pójdę” is future: **dziś wieczorem**)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "«Jutro sklepy będą zamknięte» — «Завтра магазини будуть зачинені».",
       "ru": "«Jutro sklepy będą zamknięte» — «Завтра магазины будут закрыты».",
       "en": "“The shops will be closed tomorrow.”"
      }
     }
    ]
   },
   "explanation": null
  }
 },
 {
  "lesson": "zg-7-winobranie",
  "n": 0,
  "from": {
   "type": "DIALOGUE",
   "skill": "dialogue.experience",
   "data": {
    "npc": {
     "name": "Magda",
     "emoji": "👩🏼",
     "role": {
      "uk": "подруга із Зеленої Гури",
      "ru": "подруга из Зелёна-Гуры",
      "en": "a friend from Zielona Góra"
     }
    },
    "steps": [
     {
      "npc": "Byłeś kiedyś na Winobraniu?",
      "npcTr": {
       "uk": "Ти колись був на Winobraniu?",
       "ru": "Ты когда-нибудь был на Winobraniu?",
       "en": "Have you ever been to Winobranie?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Nie, jeszcze nie byłem.",
        "tr": {
         "uk": "Ні, ще не був.",
         "ru": "Нет, ещё не был.",
         "en": "No, not yet."
        }
       },
       {
        "id": "s0o1",
        "text": "Nie, nigdy byłem.",
        "tr": {
         "uk": "(після **nigdy** потрібне **nie**: nigdy **nie** byłem)",
         "ru": "(после **nigdy** нужно **nie**: nigdy **nie** byłem)",
         "en": "(after **nigdy** you need **nie**)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "**Jeszcze nie byłem** або **nigdy nie byłem** — з «nie».",
       "ru": "**Jeszcze nie byłem** или **nigdy nie byłem** — с «nie».",
       "en": "With «nie»: **jeszcze nie byłem / nigdy nie byłem**."
      }
     },
     {
      "npc": "To chodź z nami w sobotę! Będzie korowód i koncerty.",
      "npcTr": {
       "uk": "Тоді ходімо з нами в суботу! Буде хода й концерти.",
       "ru": "Тогда пошли с нами в субботу! Будет шествие и концерты.",
       "en": "Then come with us on Saturday! There’ll be a parade and concerts."
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Super, chętnie pójdę!",
        "tr": {
         "uk": "Супер, охоче піду!",
         "ru": "Супер, с удовольствием пойду!",
         "en": "Great, I’d love to!"
        }
       },
       {
        "id": "s1o1",
        "text": "Super, chętnie poszedłem!",
        "tr": {
         "uk": "(це минуле; про суботу — **pójdę**)",
         "ru": "(это прошлое; про субботу — **pójdę**)",
         "en": "(that’s the past; for Saturday say **pójdę**)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "Субота попереду: **pójdę** — піду.",
       "ru": "Суббота впереди: **pójdę** — пойду.",
       "en": "Saturday is ahead: **pójdę**."
      }
     }
    ]
   },
   "explanation": null
  },
  "to": {
   "type": "DIALOGUE",
   "skill": "dialogue.experience",
   "data": {
    "npc": {
     "name": "Magda",
     "emoji": "👩🏼",
     "role": {
      "uk": "подруга із Зеленої Гури",
      "ru": "подруга из Зелёна-Гуры",
      "en": "a friend from Zielona Góra"
     }
    },
    "steps": [
     {
      "npc": "Byłeś kiedyś na Winobraniu?",
      "npcTr": {
       "uk": "Ти колись був на Winobraniu?",
       "ru": "Ты когда-нибудь был на Winobraniu?",
       "en": "Have you ever been to Winobranie?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Nie, jeszcze nie byłem.",
        "tr": {
         "uk": "Ні, ще не був.",
         "ru": "Нет, ещё не был.",
         "en": "No, not yet."
        }
       },
       {
        "id": "s0o1",
        "text": "Nie, nigdy byłem.",
        "tr": {
         "uk": "(після **nigdy** потрібне **nie**: nigdy **nie** byłem)",
         "ru": "(после **nigdy** нужно **nie**: nigdy **nie** byłem)",
         "en": "(after **nigdy** you need **nie**)"
        }
       },
       {
        "id": "s0o2",
        "text": "Tak, jeszcze nie byłem.",
        "tr": {
         "uk": "(**Tak** — «так, був», а далі «jeszcze nie byłem» — суперечність; відповідь — **Nie**)",
         "ru": "(**Tak** — «да, был», а дальше «jeszcze nie byłem» — противоречие; ответ — **Nie**)",
         "en": "(**Tak** means “yes, I have”, but “jeszcze nie byłem” means “not yet” — the answer is **Nie**)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "**Jeszcze nie byłem** або **nigdy nie byłem** — з «nie».",
       "ru": "**Jeszcze nie byłem** или **nigdy nie byłem** — с «nie».",
       "en": "With «nie»: **jeszcze nie byłem / nigdy nie byłem**."
      }
     },
     {
      "npc": "To chodź z nami w sobotę! Będzie korowód i koncerty.",
      "npcTr": {
       "uk": "Тоді ходімо з нами в суботу! Буде хода й концерти.",
       "ru": "Тогда пошли с нами в субботу! Будет шествие и концерты.",
       "en": "Then come with us on Saturday! There’ll be a parade and concerts."
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Super, chętnie pójdę!",
        "tr": {
         "uk": "Супер, охоче піду!",
         "ru": "Супер, с удовольствием пойду!",
         "en": "Great, I’d love to!"
        }
       },
       {
        "id": "s1o1",
        "text": "Super, chętnie poszedłem!",
        "tr": {
         "uk": "(це минуле; про суботу — **pójdę**)",
         "ru": "(это прошлое; про субботу — **pójdę**)",
         "en": "(that’s the past; for Saturday say **pójdę**)"
        }
       },
       {
        "id": "s1o2",
        "text": "Super, niestety nie pójdę!",
        "tr": {
         "uk": "(**Super** — радість, а «niestety nie pójdę» — відмова; запрошення приймають: **chętnie pójdę**)",
         "ru": "(**Super** — радость, а «niestety nie pójdę» — отказ; приглашение принимают: **chętnie pójdę**)",
         "en": "(**Super** is enthusiasm, but “niestety nie pójdę” is a refusal; to accept say **chętnie pójdę**)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "Субота попереду: **pójdę** — піду.",
       "ru": "Суббота впереди: **pójdę** — пойду.",
       "en": "Saturday is ahead: **pójdę**."
      }
     }
    ]
   },
   "explanation": null
  }
 },
 {
  "lesson": "zg-8-kartka",
  "n": 0,
  "from": {
   "type": "DIALOGUE",
   "skill": "dialogue.card",
   "data": {
    "npc": {
     "name": "Magda",
     "emoji": "👩🏼",
     "role": {
      "uk": "подруга із Зеленої Гури",
      "ru": "подруга из Зелёна-Гуры",
      "en": "a friend from Zielona Góra"
     }
    },
    "steps": [
     {
      "npc": "Piszesz kartkę do babci? Jak zaczniesz?",
      "npcTr": {
       "uk": "Пишеш листівку бабусі? Як почнеш?",
       "ru": "Пишешь открытку бабушке? Как начнёшь?",
       "en": "Writing a card to your grandma? How will you start?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Kochana Babciu!",
        "tr": {
         "uk": "Люба бабусю!",
         "ru": "Дорогая бабушка!",
         "en": "Dear Grandma!"
        }
       },
       {
        "id": "s0o1",
        "text": "Kochana Babcia!",
        "tr": {
         "uk": "(звертання — кличний відмінок: babcia → **Babciu**)",
         "ru": "(обращение — звательный падеж: babcia → **Babciu**)",
         "en": "(address someone in the vocative: **Babciu**)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "Звертаємось кличним: babcia → **Babciu**.",
       "ru": "Обращаемся звательным: babcia → **Babciu**.",
       "en": "Vocative: **Babciu**."
      }
     },
     {
      "npc": "A jak skończysz?",
      "npcTr": {
       "uk": "А як закінчиш?",
       "ru": "А как закончишь?",
       "en": "And how will you end it?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Całuję mocno, Bobek.",
        "tr": {
         "uk": "Міцно цілую, Бобек.",
         "ru": "Крепко целую, Бобек.",
         "en": "Lots of love, Bobek."
        }
       },
       {
        "id": "s1o1",
        "text": "Z poważaniem, Bobek.",
        "tr": {
         "uk": "(«Z poważaniem» — офіційно, як у листі до установи; бабусі — **Całuję** / **Ściskam**)",
         "ru": "(«Z poważaniem» — официально, как в письме в учреждение; бабушке — **Całuję** / **Ściskam**)",
         "en": "(«Z poważaniem» is formal; for Grandma use **Całuję** / **Ściskam**)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "Близьким — **Całuję / Ściskam**, офіційно — **Z poważaniem**.",
       "ru": "Близким — **Całuję / Ściskam**, официально — **Z poważaniem**.",
       "en": "Family: **Całuję / Ściskam**; formal: **Z poważaniem**."
      }
     }
    ]
   },
   "explanation": null
  },
  "to": {
   "type": "DIALOGUE",
   "skill": "dialogue.card",
   "data": {
    "npc": {
     "name": "Magda",
     "emoji": "👩🏼",
     "role": {
      "uk": "подруга із Зеленої Гури",
      "ru": "подруга из Зелёна-Гуры",
      "en": "a friend from Zielona Góra"
     }
    },
    "steps": [
     {
      "npc": "Piszesz kartkę do babci? Jak zaczniesz?",
      "npcTr": {
       "uk": "Пишеш листівку бабусі? Як почнеш?",
       "ru": "Пишешь открытку бабушке? Как начнёшь?",
       "en": "Writing a card to your grandma? How will you start?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Kochana Babciu!",
        "tr": {
         "uk": "Люба бабусю!",
         "ru": "Дорогая бабушка!",
         "en": "Dear Grandma!"
        }
       },
       {
        "id": "s0o1",
        "text": "Kochana Babcia!",
        "tr": {
         "uk": "(звертання — кличний відмінок: babcia → **Babciu**)",
         "ru": "(обращение — звательный падеж: babcia → **Babciu**)",
         "en": "(address someone in the vocative: **Babciu**)"
        }
       },
       {
        "id": "s0o2",
        "text": "Szanowna Babciu!",
        "tr": {
         "uk": "(**Szanowna** — офіційно, для листа в установу; бабусі — **Kochana**)",
         "ru": "(**Szanowna** — официально, для письма в учреждение; бабушке — **Kochana**)",
         "en": "(**Szanowna** is formal, for an official letter; to a grandmother — **Kochana**)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "Звертаємось кличним: babcia → **Babciu**.",
       "ru": "Обращаемся звательным: babcia → **Babciu**.",
       "en": "Vocative: **Babciu**."
      }
     },
     {
      "npc": "A jak skończysz?",
      "npcTr": {
       "uk": "А як закінчиш?",
       "ru": "А как закончишь?",
       "en": "And how will you end it?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Całuję mocno, Bobek.",
        "tr": {
         "uk": "Міцно цілую, Бобек.",
         "ru": "Крепко целую, Бобек.",
         "en": "Lots of love, Bobek."
        }
       },
       {
        "id": "s1o1",
        "text": "Z poważaniem, Bobek.",
        "tr": {
         "uk": "(«Z poważaniem» — офіційно, як у листі до установи; бабусі — **Całuję** / **Ściskam**)",
         "ru": "(«Z poważaniem» — официально, как в письме в учреждение; бабушке — **Całuję** / **Ściskam**)",
         "en": "(«Z poważaniem» is formal; for Grandma use **Całuję** / **Ściskam**)"
        }
       },
       {
        "id": "s1o2",
        "text": "Do widzenia, Bobek.",
        "tr": {
         "uk": "(**Do widzenia** — усне прощання; у листівці бабусі — **Całuję** / **Ściskam**)",
         "ru": "(**Do widzenia** — устное прощание; в открытке бабушке — **Całuję** / **Ściskam**)",
         "en": "(**Do widzenia** is a spoken farewell; on a card to a grandmother — **Całuję** / **Ściskam**)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "Близьким — **Całuję / Ściskam**, офіційно — **Z poważaniem**.",
       "ru": "Близким — **Całuję / Ściskam**, официально — **Z poważaniem**.",
       "en": "Family: **Całuję / Ściskam**; formal: **Z poważaniem**."
      }
     }
    ]
   },
   "explanation": null
  }
 },
 {
  "lesson": "zg-boss",
  "n": 0,
  "from": {
   "type": "SITUATION",
   "skill": "situation.boss",
   "data": {
    "npc": {
     "name": "Magda",
     "emoji": "👩🏼",
     "role": {
      "uk": "подруга із Зеленої Гури",
      "ru": "подруга из Зелёна-Гуры",
      "en": "a friend from Zielona Góra"
     }
    },
    "scene": {
     "uk": "Вересень, Winobranie на ринку Зеленої Гури",
     "ru": "Сентябрь, Winobranie на площади Зелёна-Гуры",
     "en": "September, Winobranie in Zielona Góra’s market square"
    },
    "steps": [
     {
      "npc": "Cześć! Wszystkiego najlepszego! Dziś są twoje imieniny, prawda?",
      "npcTr": {
       "uk": "Привіт! Усього найкращого! Сьогодні твої іменини, так?",
       "ru": "Привет! Всего наилучшего! Сегодня твои именины, да?",
       "en": "Hi! All the best! It’s your name day today, right?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Tak! Bardzo ci dziękuję!",
        "tr": {
         "uk": "Так! Щиро тобі дякую!",
         "ru": "Да! Большое тебе спасибо!",
         "en": "Yes! Thank you so much!"
        }
       },
       {
        "id": "s0o1",
        "text": "Tak! Nie ma za co!",
        "tr": {
         "uk": "(«Nie ma za co» — відповідь на «дякую»; на побажання кажуть «Dziękuję!»)",
         "ru": "(«Nie ma za co» — ответ на «спасибо»; на пожелание говорят «Dziękuję!»)",
         "en": "(«Nie ma za co» answers “thank you”; to wishes say «Dziękuję!»)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "На побажання відповідають: **Dziękuję!**",
       "ru": "На пожелание отвечают: **Dziękuję!**",
       "en": "Answer wishes with **Dziękuję!**"
      }
     },
     {
      "npc": "Byłeś już na korowodzie?",
      "npcTr": {
       "uk": "Ти вже був на ході?",
       "ru": "Ты уже был на шествии?",
       "en": "Have you been to the parade yet?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Jeszcze nie. Pójdziemy razem?",
        "tr": {
         "uk": "Ще ні. Підемо разом?",
         "ru": "Ещё нет. Пойдём вместе?",
         "en": "Not yet. Shall we go together?"
        }
       },
       {
        "id": "s1o1",
        "text": "Już nie. Pójdziemy razem?",
        "tr": {
         "uk": "(«już nie» — «вже ні, більше ні»; «ще ні» — **jeszcze nie**)",
         "ru": "(«już nie» — «уже нет, больше нет»; «ещё нет» — **jeszcze nie**)",
         "en": "(«już nie» = no longer; “not yet” = **jeszcze nie**)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "«Ще ні» — **jeszcze nie**.",
       "ru": "«Ещё нет» — **jeszcze nie**.",
       "en": "“Not yet” — **jeszcze nie**."
      }
     }
    ]
   },
   "explanation": null
  },
  "to": {
   "type": "SITUATION",
   "skill": "situation.boss",
   "data": {
    "npc": {
     "name": "Magda",
     "emoji": "👩🏼",
     "role": {
      "uk": "подруга із Зеленої Гури",
      "ru": "подруга из Зелёна-Гуры",
      "en": "a friend from Zielona Góra"
     }
    },
    "scene": {
     "uk": "Вересень, Winobranie на ринку Зеленої Гури",
     "ru": "Сентябрь, Winobranie на площади Зелёна-Гуры",
     "en": "September, Winobranie in Zielona Góra’s market square"
    },
    "steps": [
     {
      "npc": "Cześć! Wszystkiego najlepszego! Dziś są twoje imieniny, prawda?",
      "npcTr": {
       "uk": "Привіт! Усього найкращого! Сьогодні твої іменини, так?",
       "ru": "Привет! Всего наилучшего! Сегодня твои именины, да?",
       "en": "Hi! All the best! It’s your name day today, right?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Tak! Bardzo ci dziękuję!",
        "tr": {
         "uk": "Так! Щиро тобі дякую!",
         "ru": "Да! Большое тебе спасибо!",
         "en": "Yes! Thank you so much!"
        }
       },
       {
        "id": "s0o1",
        "text": "Tak! Nie ma za co!",
        "tr": {
         "uk": "(«Nie ma za co» — відповідь на «дякую»; на побажання кажуть «Dziękuję!»)",
         "ru": "(«Nie ma za co» — ответ на «спасибо»; на пожелание говорят «Dziękuję!»)",
         "en": "(«Nie ma za co» answers “thank you”; to wishes say «Dziękuję!»)"
        }
       },
       {
        "id": "s0o2",
        "text": "Tak! Bardzo ci dziękuje!",
        "tr": {
         "uk": "(**dziękuję** — 1-а особа; **dziękuje** — «він дякує»)",
         "ru": "(**dziękuję** — 1-е лицо; **dziękuje** — «он благодарит»)",
         "en": "(**dziękuję** is 1st person; **dziękuje** means “he thanks”)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "На побажання відповідають: **Dziękuję!**",
       "ru": "На пожелание отвечают: **Dziękuję!**",
       "en": "Answer wishes with **Dziękuję!**"
      }
     },
     {
      "npc": "Byłeś już na korowodzie?",
      "npcTr": {
       "uk": "Ти вже був на ході?",
       "ru": "Ты уже был на шествии?",
       "en": "Have you been to the parade yet?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Jeszcze nie. Pójdziemy razem?",
        "tr": {
         "uk": "Ще ні. Підемо разом?",
         "ru": "Ещё нет. Пойдём вместе?",
         "en": "Not yet. Shall we go together?"
        }
       },
       {
        "id": "s1o1",
        "text": "Już nie. Pójdziemy razem?",
        "tr": {
         "uk": "(«już nie» — «вже ні, більше ні»; «ще ні» — **jeszcze nie**)",
         "ru": "(«już nie» — «уже нет, больше нет»; «ещё нет» — **jeszcze nie**)",
         "en": "(«już nie» = no longer; “not yet” = **jeszcze nie**)"
        }
       },
       {
        "id": "s1o2",
        "text": "Jeszcze nie. Poszliśmy razem?",
        "tr": {
         "uk": "(пропонуєш піти — майбутнє: **pójdziemy**; **poszliśmy** — минуле)",
         "ru": "(предлагаешь пойти — будущее: **pójdziemy**; **poszliśmy** — прошедшее)",
         "en": "(you are suggesting going — future: **pójdziemy**; **poszliśmy** is past)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "«Ще ні» — **jeszcze nie**.",
       "ru": "«Ещё нет» — **jeszcze nie**.",
       "en": "“Not yet” — **jeszcze nie**."
      }
     }
    ]
   },
   "explanation": null
  }
 },
 {
  "lesson": "gorz-1-pogoda",
  "n": 0,
  "from": {
   "type": "DIALOGUE",
   "skill": "dialogue.weather",
   "data": {
    "npc": {
     "name": "Pan Roman",
     "emoji": "👨🏻‍🦳",
     "role": {
      "uk": "сусід-пенсіонер, рибалить на Варті",
      "ru": "сосед-пенсионер, рыбачит на Варте",
      "en": "a retired neighbour who fishes on the Warta"
     }
    },
    "steps": [
     {
      "npc": "Dzień dobry! Ale dziś zimno, prawda?",
      "npcTr": {
       "uk": "Добрий день! Ну й холодно сьогодні, правда?",
       "ru": "Добрый день! Ну и холодно сегодня, правда?",
       "en": "Good morning! It’s cold today, isn’t it?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Tak, bardzo zimno i wieje wiatr.",
        "tr": {
         "uk": "Так, дуже холодно й дме вітер.",
         "ru": "Да, очень холодно и дует ветер.",
         "en": "Yes, very cold and windy."
        }
       },
       {
        "id": "s0o1",
        "text": "Tak, bardzo zimny i wieje wiatr.",
        "tr": {
         "uk": "(«zimny» — прикметник про предмет; про погоду — **zimno**)",
         "ru": "(«zimny» — прилагательное о предмете; о погоде — **zimno**)",
         "en": "(«zimny» describes a thing; for weather say **zimno**)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "Про погоду — прислівник: **zimno**.",
       "ru": "О погоде — наречие: **zimno**.",
       "en": "For weather use the adverb: **zimno**."
      }
     },
     {
      "npc": "Podobno po południu będzie padać.",
      "npcTr": {
       "uk": "Кажуть, після обіду буде дощ.",
       "ru": "Говорят, после обеда будет дождь.",
       "en": "They say it’ll rain in the afternoon."
      },
      "options": [
       {
        "id": "s1o0",
        "text": "To wezmę parasol. Dziękuję!",
        "tr": {
         "uk": "Тоді візьму парасолю. Дякую!",
         "ru": "Тогда возьму зонт. Спасибо!",
         "en": "Then I’ll take an umbrella. Thanks!"
        }
       },
       {
        "id": "s1o1",
        "text": "To wezmę okulary przeciwsłoneczne. Dziękuję!",
        "tr": {
         "uk": "(«będzie padać» — буде дощ; сонцезахисні окуляри не допоможуть)",
         "ru": "(«będzie padać» — будет дождь; солнцезащитные очки не помогут)",
         "en": "(«będzie padać» means rain is coming)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "**Będzie padać** — буде дощ: потрібна парасоля.",
       "ru": "**Będzie padać** — будет дождь: нужен зонт.",
       "en": "**Będzie padać** — it will rain."
      }
     }
    ]
   },
   "explanation": null
  },
  "to": {
   "type": "DIALOGUE",
   "skill": "dialogue.weather",
   "data": {
    "npc": {
     "name": "Pan Roman",
     "emoji": "👨🏻‍🦳",
     "role": {
      "uk": "сусід-пенсіонер, рибалить на Варті",
      "ru": "сосед-пенсионер, рыбачит на Варте",
      "en": "a retired neighbour who fishes on the Warta"
     }
    },
    "steps": [
     {
      "npc": "Dzień dobry! Ale dziś zimno, prawda?",
      "npcTr": {
       "uk": "Добрий день! Ну й холодно сьогодні, правда?",
       "ru": "Добрый день! Ну и холодно сегодня, правда?",
       "en": "Good morning! It’s cold today, isn’t it?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Tak, bardzo zimno i wieje wiatr.",
        "tr": {
         "uk": "Так, дуже холодно й дме вітер.",
         "ru": "Да, очень холодно и дует ветер.",
         "en": "Yes, very cold and windy."
        }
       },
       {
        "id": "s0o1",
        "text": "Tak, bardzo zimny i wieje wiatr.",
        "tr": {
         "uk": "(«zimny» — прикметник про предмет; про погоду — **zimno**)",
         "ru": "(«zimny» — прилагательное о предмете; о погоде — **zimno**)",
         "en": "(«zimny» describes a thing; for weather say **zimno**)"
        }
       },
       {
        "id": "s0o2",
        "text": "Tak, bardzo zimno i wieje wiatra.",
        "tr": {
         "uk": "(**wiać** — підмет у називному: wieje **wiatr**)",
         "ru": "(**wiać** — подлежащее в именительном: wieje **wiatr**)",
         "en": "(**wieje** takes a nominative subject: **wiatr**)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "Про погоду — прислівник: **zimno**.",
       "ru": "О погоде — наречие: **zimno**.",
       "en": "For weather use the adverb: **zimno**."
      }
     },
     {
      "npc": "Podobno po południu będzie padać.",
      "npcTr": {
       "uk": "Кажуть, після обіду буде дощ.",
       "ru": "Говорят, после обеда будет дождь.",
       "en": "They say it’ll rain in the afternoon."
      },
      "options": [
       {
        "id": "s1o0",
        "text": "To wezmę parasol. Dziękuję!",
        "tr": {
         "uk": "Тоді візьму парасолю. Дякую!",
         "ru": "Тогда возьму зонт. Спасибо!",
         "en": "Then I’ll take an umbrella. Thanks!"
        }
       },
       {
        "id": "s1o1",
        "text": "To wezmę okulary przeciwsłoneczne. Dziękuję!",
        "tr": {
         "uk": "(«będzie padać» — буде дощ; сонцезахисні окуляри не допоможуть)",
         "ru": "(«będzie padać» — будет дождь; солнцезащитные очки не помогут)",
         "en": "(«będzie padać» means rain is coming)"
        }
       },
       {
        "id": "s1o2",
        "text": "To wezmę parasol. Nie dziękuję!",
        "tr": {
         "uk": "(**Dziękuję!** — згода й подяка; **Nie dziękuję** — «ні, дякую», відмова, яка не пасує до «wezmę parasol»)",
         "ru": "(**Dziękuję!** — согласие и благодарность; **Nie dziękuję** — «нет, спасибо», отказ, который не вяжется с «wezmę parasol»)",
         "en": "(**Dziękuję!** thanks; **Nie dziękuję** means “no, thank you”, which clashes with “wezmę parasol”)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "**Będzie padać** — буде дощ: потрібна парасоля.",
       "ru": "**Będzie padać** — будет дождь: нужен зонт.",
       "en": "**Będzie padać** — it will rain."
      }
     }
    ]
   },
   "explanation": null
  }
 },
 {
  "lesson": "gorz-2-pory-roku",
  "n": 0,
  "from": {
   "type": "DIALOGUE",
   "skill": "dialogue.seasons",
   "data": {
    "npc": {
     "name": "Zosia",
     "emoji": "👩🏻‍🦰",
     "role": {
      "uk": "колега, любить велосипед",
      "ru": "коллега, любит велосипед",
      "en": "a colleague who loves cycling"
     }
    },
    "steps": [
     {
      "npc": "Którą porę roku lubisz najbardziej?",
      "npcTr": {
       "uk": "Яку пору року ти любиш найбільше?",
       "ru": "Какое время года ты любишь больше всего?",
       "en": "Which season do you like best?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Lubię jesień, bo jest kolorowa.",
        "tr": {
         "uk": "Люблю осінь, бо вона барвиста.",
         "ru": "Люблю осень, потому что она красочная.",
         "en": "I like autumn because it’s colourful."
        }
       },
       {
        "id": "s0o1",
        "text": "Lubię jesienią, bo jest kolorowa.",
        "tr": {
         "uk": "(«jesienią» — «восени», коли?; що люблю? — **jesień**)",
         "ru": "(«jesienią» — «осенью», когда?; что люблю? — **jesień**)",
         "en": "(«jesienią» = in autumn; what do I like? — **jesień**)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "Lubić + знахідний: lubię **jesień**.",
       "ru": "Lubić + винительный: lubię **jesień**.",
       "en": "Lubić + accusative: **jesień**."
      }
     },
     {
      "npc": "A ja wolę lato. Latem jeździmy nad jezioro.",
      "npcTr": {
       "uk": "А я більше люблю літо. Влітку ми їздимо на озеро.",
       "ru": "А я больше люблю лето. Летом мы ездим на озеро.",
       "en": "I prefer summer. In summer we go to the lake."
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Ja też! Latem jest gorąco i długo jasno.",
        "tr": {
         "uk": "Я теж! Влітку спекотно й довго світло.",
         "ru": "Я тоже! Летом жарко и долго светло.",
         "en": "Me too! In summer it’s hot and light till late."
        }
       },
       {
        "id": "s1o1",
        "text": "Ja też! W lato jest gorąco i długo jasno.",
        "tr": {
         "uk": "(«w lato» — помилка; кажуть **latem** або «w lecie»)",
         "ru": "(«w lato» — ошибка; говорят **latem** или «w lecie»)",
         "en": "(«w lato» is wrong: **latem** or «w lecie»)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "Коли? — **latem** (орудний) або «w lecie».",
       "ru": "Когда? — **latem** (творительный) или «w lecie».",
       "en": "When? — **latem** or «w lecie»."
      }
     }
    ]
   },
   "explanation": null
  },
  "to": {
   "type": "DIALOGUE",
   "skill": "dialogue.seasons",
   "data": {
    "npc": {
     "name": "Zosia",
     "emoji": "👩🏻‍🦰",
     "role": {
      "uk": "колега, любить велосипед",
      "ru": "коллега, любит велосипед",
      "en": "a colleague who loves cycling"
     }
    },
    "steps": [
     {
      "npc": "Którą porę roku lubisz najbardziej?",
      "npcTr": {
       "uk": "Яку пору року ти любиш найбільше?",
       "ru": "Какое время года ты любишь больше всего?",
       "en": "Which season do you like best?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Lubię jesień, bo jest kolorowa.",
        "tr": {
         "uk": "Люблю осінь, бо вона барвиста.",
         "ru": "Люблю осень, потому что она красочная.",
         "en": "I like autumn because it’s colourful."
        }
       },
       {
        "id": "s0o1",
        "text": "Lubię jesienią, bo jest kolorowa.",
        "tr": {
         "uk": "(«jesienią» — «восени», коли?; що люблю? — **jesień**)",
         "ru": "(«jesienią» — «осенью», когда?; что люблю? — **jesień**)",
         "en": "(«jesienią» = in autumn; what do I like? — **jesień**)"
        }
       },
       {
        "id": "s0o2",
        "text": "Lubię jesieni, bo jest kolorowa.",
        "tr": {
         "uk": "(**lubić** + знахідний: **jesień**, а не родовий)",
         "ru": "(**lubić** + винительный: **jesień**, а не родительный)",
         "en": "(**lubić** takes the accusative: **jesień**, not the genitive)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "Lubić + знахідний: lubię **jesień**.",
       "ru": "Lubić + винительный: lubię **jesień**.",
       "en": "Lubić + accusative: **jesień**."
      }
     },
     {
      "npc": "A ja wolę lato. Latem jeździmy nad jezioro.",
      "npcTr": {
       "uk": "А я більше люблю літо. Влітку ми їздимо на озеро.",
       "ru": "А я больше люблю лето. Летом мы ездим на озеро.",
       "en": "I prefer summer. In summer we go to the lake."
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Ja też! Latem jest gorąco i długo jasno.",
        "tr": {
         "uk": "Я теж! Влітку спекотно й довго світло.",
         "ru": "Я тоже! Летом жарко и долго светло.",
         "en": "Me too! In summer it’s hot and light till late."
        }
       },
       {
        "id": "s1o1",
        "text": "Ja też! W lato jest gorąco i długo jasno.",
        "tr": {
         "uk": "(«w lato» — помилка; кажуть **latem** або «w lecie»)",
         "ru": "(«w lato» — ошибка; говорят **latem** или «w lecie»)",
         "en": "(«w lato» is wrong: **latem** or «w lecie»)"
        }
       },
       {
        "id": "s1o2",
        "text": "Ja też! Latem jest gorąco i długo ciemno.",
        "tr": {
         "uk": "(літом **довго світло**, а не «ciemno» — «темно»)",
         "ru": "(летом **долго светло**, а не «ciemno» — «темно»)",
         "en": "(in summer it stays light long, not “ciemno” (dark))"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "Коли? — **latem** (орудний) або «w lecie».",
       "ru": "Когда? — **latem** (творительный) или «w lecie».",
       "en": "When? — **latem** or «w lecie»."
      }
     }
    ]
   },
   "explanation": null
  }
 },
 {
  "lesson": "gorz-3-prognoza",
  "n": 0,
  "from": {
   "type": "DIALOGUE",
   "skill": "dialogue.forecast",
   "data": {
    "npc": {
     "name": "Kuba",
     "emoji": "🧑🏼",
     "role": {
      "uk": "сусід по квартирі",
      "ru": "сосед по квартире",
      "en": "your flatmate"
     }
    },
    "steps": [
     {
      "npc": "Słyszałeś prognozę na jutro?",
      "npcTr": {
       "uk": "Ти чув прогноз на завтра?",
       "ru": "Ты слышал прогноз на завтра?",
       "en": "Did you hear the forecast for tomorrow?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Tak, jutro będzie padać cały dzień.",
        "tr": {
         "uk": "Так, завтра цілий день буде дощ.",
         "ru": "Да, завтра весь день будет дождь.",
         "en": "Yes, it’ll rain all day tomorrow."
        }
       },
       {
        "id": "s0o1",
        "text": "Tak, jutro będzie pada cały dzień.",
        "tr": {
         "uk": "(після **będzie** — інфінітив: będzie **padać**)",
         "ru": "(после **będzie** — инфинитив: będzie **padać**)",
         "en": "(after **będzie** use the infinitive: **padać**)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "**będzie + інфінітив**: będzie **padać**.",
       "ru": "**będzie + инфинитив**: będzie **padać**.",
       "en": "**będzie + infinitive**."
      }
     },
     {
      "npc": "A ile będzie stopni?",
      "npcTr": {
       "uk": "А скільки буде градусів?",
       "ru": "А сколько будет градусов?",
       "en": "And how many degrees?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Około pięciu stopni.",
        "tr": {
         "uk": "Близько п’яти градусів.",
         "ru": "Около пяти градусов.",
         "en": "About five degrees."
        }
       },
       {
        "id": "s1o1",
        "text": "Około pięć stopni.",
        "tr": {
         "uk": "(після **około** — родовий: około **pięciu**)",
         "ru": "(после **około** — родительный: około **pięciu**)",
         "en": "(**około** + genitive: **pięciu**)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "**około** + родовий: около **pięciu** stopni.",
       "ru": "**około** + родительный: około **pięciu** stopni.",
       "en": "**około** + genitive: **pięciu** stopni."
      }
     }
    ]
   },
   "explanation": null
  },
  "to": {
   "type": "DIALOGUE",
   "skill": "dialogue.forecast",
   "data": {
    "npc": {
     "name": "Kuba",
     "emoji": "🧑🏼",
     "role": {
      "uk": "сусід по квартирі",
      "ru": "сосед по квартире",
      "en": "your flatmate"
     }
    },
    "steps": [
     {
      "npc": "Słyszałeś prognozę na jutro?",
      "npcTr": {
       "uk": "Ти чув прогноз на завтра?",
       "ru": "Ты слышал прогноз на завтра?",
       "en": "Did you hear the forecast for tomorrow?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Tak, jutro będzie padać cały dzień.",
        "tr": {
         "uk": "Так, завтра цілий день буде дощ.",
         "ru": "Да, завтра весь день будет дождь.",
         "en": "Yes, it’ll rain all day tomorrow."
        }
       },
       {
        "id": "s0o1",
        "text": "Tak, jutro będzie pada cały dzień.",
        "tr": {
         "uk": "(після **będzie** — інфінітив: będzie **padać**)",
         "ru": "(после **będzie** — инфинитив: będzie **padać**)",
         "en": "(after **będzie** use the infinitive: **padać**)"
        }
       },
       {
        "id": "s0o2",
        "text": "Tak, jutro padało cały dzień.",
        "tr": {
         "uk": "(**jutro** — майбутнє: **będzie padać**; **padało** — минуле)",
         "ru": "(**jutro** — будущее: **będzie padać**; **padało** — прошедшее)",
         "en": "(**jutro** is future: **będzie padać**; **padało** is past)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "**będzie + інфінітив**: będzie **padać**.",
       "ru": "**będzie + инфинитив**: będzie **padać**.",
       "en": "**będzie + infinitive**."
      }
     },
     {
      "npc": "A ile będzie stopni?",
      "npcTr": {
       "uk": "А скільки буде градусів?",
       "ru": "А сколько будет градусов?",
       "en": "And how many degrees?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Około pięciu stopni.",
        "tr": {
         "uk": "Близько п’яти градусів.",
         "ru": "Около пяти градусов.",
         "en": "About five degrees."
        }
       },
       {
        "id": "s1o1",
        "text": "Około pięć stopni.",
        "tr": {
         "uk": "(після **około** — родовий: około **pięciu**)",
         "ru": "(после **około** — родительный: około **pięciu**)",
         "en": "(**około** + genitive: **pięciu**)"
        }
       },
       {
        "id": "s1o2",
        "text": "Około pięcioma stopni.",
        "tr": {
         "uk": "(після **około** — родовий: **około pięciu**, а не орудний)",
         "ru": "(после **około** — родительный: **około pięciu**, а не творительный)",
         "en": "(after **około** use the genitive: **około pięciu**, not the instrumental)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "**około** + родовий: около **pięciu** stopni.",
       "ru": "**około** + родительный: około **pięciu** stopni.",
       "en": "**około** + genitive: **pięciu** stopni."
      }
     }
    ]
   },
   "explanation": null
  }
 },
 {
  "lesson": "gorz-4-ubierz-sie",
  "n": 0,
  "from": {
   "type": "DIALOGUE",
   "skill": "dialogue.clothes",
   "data": {
    "npc": {
     "name": "Kuba",
     "emoji": "🧑🏼",
     "role": {
      "uk": "сусід по квартирі",
      "ru": "сосед по квартире",
      "en": "your flatmate"
     }
    },
    "steps": [
     {
      "npc": "Wychodzisz? Na zewnątrz jest minus dziesięć stopni!",
      "npcTr": {
       "uk": "Виходиш? Надворі мінус десять градусів!",
       "ru": "Выходишь? На улице минус десять градусов!",
       "en": "Going out? It’s minus ten outside!"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Dzięki! Wezmę czapkę i rękawiczki.",
        "tr": {
         "uk": "Дякую! Візьму шапку й рукавички.",
         "ru": "Спасибо! Возьму шапку и перчатки.",
         "en": "Thanks! I’ll take a hat and gloves."
        }
       },
       {
        "id": "s0o1",
        "text": "Dzięki! Wezmę czapka i rękawiczki.",
        "tr": {
         "uk": "(візьму що? — знахідний: **czapkę**)",
         "ru": "(возьму что? — винительный: **czapkę**)",
         "en": "(accusative: **czapkę**)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "Wezmę (co?) — **czapkę**.",
       "ru": "Wezmę (что?) — **czapkę**.",
       "en": "Wezmę + accusative: **czapkę**."
      }
     },
     {
      "npc": "I weź parasol, po południu ma padać.",
      "npcTr": {
       "uk": "І візьми парасолю, по обіді обіцяють дощ.",
       "ru": "И возьми зонт, после обеда обещают дождь.",
       "en": "And take an umbrella, it’s supposed to rain later."
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Dobrze, wezmę. Dzięki!",
        "tr": {
         "uk": "Добре, візьму. Дякую!",
         "ru": "Хорошо, возьму. Спасибо!",
         "en": "OK, I will. Thanks!"
        }
       },
       {
        "id": "s1o1",
        "text": "Dobrze, weź. Dzięki!",
        "tr": {
         "uk": "(«weź» — наказ іншому; про себе — **wezmę**)",
         "ru": "(«weź» — приказ другому; о себе — **wezmę**)",
         "en": "(«weź» is an order to someone else; about yourself: **wezmę**)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "Про себе — **wezmę** (я візьму).",
       "ru": "О себе — **wezmę** (я возьму).",
       "en": "About yourself — **wezmę**."
      }
     }
    ]
   },
   "explanation": null
  },
  "to": {
   "type": "DIALOGUE",
   "skill": "dialogue.clothes",
   "data": {
    "npc": {
     "name": "Kuba",
     "emoji": "🧑🏼",
     "role": {
      "uk": "сусід по квартирі",
      "ru": "сосед по квартире",
      "en": "your flatmate"
     }
    },
    "steps": [
     {
      "npc": "Wychodzisz? Na zewnątrz jest minus dziesięć stopni!",
      "npcTr": {
       "uk": "Виходиш? Надворі мінус десять градусів!",
       "ru": "Выходишь? На улице минус десять градусов!",
       "en": "Going out? It’s minus ten outside!"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Dzięki! Wezmę czapkę i rękawiczki.",
        "tr": {
         "uk": "Дякую! Візьму шапку й рукавички.",
         "ru": "Спасибо! Возьму шапку и перчатки.",
         "en": "Thanks! I’ll take a hat and gloves."
        }
       },
       {
        "id": "s0o1",
        "text": "Dzięki! Wezmę czapka i rękawiczki.",
        "tr": {
         "uk": "(візьму що? — знахідний: **czapkę**)",
         "ru": "(возьму что? — винительный: **czapkę**)",
         "en": "(accusative: **czapkę**)"
        }
       },
       {
        "id": "s0o2",
        "text": "Dzięki! Wezmę czapkę i rękawiczek.",
        "tr": {
         "uk": "(**wezmę** + знахідний множини: **rękawiczki**, а не родовий)",
         "ru": "(**wezmę** + винительный множественного: **rękawiczki**, а не родительный)",
         "en": "(**wezmę** takes the accusative plural: **rękawiczki**, not the genitive)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "Wezmę (co?) — **czapkę**.",
       "ru": "Wezmę (что?) — **czapkę**.",
       "en": "Wezmę + accusative: **czapkę**."
      }
     },
     {
      "npc": "I weź parasol, po południu ma padać.",
      "npcTr": {
       "uk": "І візьми парасолю, по обіді обіцяють дощ.",
       "ru": "И возьми зонт, после обеда обещают дождь.",
       "en": "And take an umbrella, it’s supposed to rain later."
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Dobrze, wezmę. Dzięki!",
        "tr": {
         "uk": "Добре, візьму. Дякую!",
         "ru": "Хорошо, возьму. Спасибо!",
         "en": "OK, I will. Thanks!"
        }
       },
       {
        "id": "s1o1",
        "text": "Dobrze, weź. Dzięki!",
        "tr": {
         "uk": "(«weź» — наказ іншому; про себе — **wezmę**)",
         "ru": "(«weź» — приказ другому; о себе — **wezmę**)",
         "en": "(«weź» is an order to someone else; about yourself: **wezmę**)"
        }
       },
       {
        "id": "s1o2",
        "text": "Dobrze, wezmę. Nie dzięki!",
        "tr": {
         "uk": "(**Nie dzięki** — «ні, дякую»: відмова не пасує до «wezmę»)",
         "ru": "(**Nie dzięki** — «нет, спасибо»: отказ не вяжется с «wezmę»)",
         "en": "(**Nie dzięki** means “no, thanks”, which clashes with “wezmę”)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "Про себе — **wezmę** (я візьму).",
       "ru": "О себе — **wezmę** (я возьму).",
       "en": "About yourself — **wezmę**."
      }
     }
    ]
   },
   "explanation": null
  }
 },
 {
  "lesson": "gorz-4-ubierz-sie",
  "n": 2,
  "from": {
   "type": "FILL_GAP",
   "skill": "grammar.imperative",
   "data": {
    "pl": "Jeśli będzie padać, ___ parasol.",
    "translation": {
     "uk": "Якщо буде дощ, візьми парасолю.",
     "ru": "Если будет дождь, возьми зонт.",
     "en": "If it rains, take an umbrella."
    },
    "options": [
     {
      "id": "o0",
      "text": "weź"
     },
     {
      "id": "o1",
      "text": "wziąć"
     },
     {
      "id": "o2",
      "text": "wziąłem"
     }
    ],
    "answer": "o0"
   },
   "explanation": {
    "uk": "Порада іншому — наказовий спосіб: **weź**.",
    "ru": "Совет другому — повелительное наклонение: **weź**.",
    "en": "Advice to someone: imperative **weź**."
   }
  },
  "to": {
   "type": "FILL_GAP",
   "skill": "grammar.imperative",
   "data": {
    "pl": "Jeśli będzie padać, ___ parasol.",
    "translation": {
     "uk": "Якщо буде дощ, візьми парасолю.",
     "ru": "Если будет дождь, возьми зонт.",
     "en": "If it rains, take an umbrella."
    },
    "options": [
     {
      "id": "o0",
      "text": "weź"
     },
     {
      "id": "o1",
      "text": "weźmy"
     },
     {
      "id": "o2",
      "text": "wziąć"
     }
    ],
    "answer": "o0"
   },
   "explanation": {
    "uk": "Порада іншому — наказовий спосіб: **weź**.",
    "ru": "Совет другому — повелительное наклонение: **weź**.",
    "en": "Advice to someone: imperative **weź**."
   }
  }
 },
 {
  "lesson": "gorz-5-przyroda",
  "n": 0,
  "from": {
   "type": "DIALOGUE",
   "skill": "dialogue.nature",
   "data": {
    "npc": {
     "name": "Zosia",
     "emoji": "👩🏻‍🦰",
     "role": {
      "uk": "колега, любить велосипед",
      "ru": "коллега, любит велосипед",
      "en": "a colleague who loves cycling"
     }
    },
    "steps": [
     {
      "npc": "Co robisz w weekend?",
      "npcTr": {
       "uk": "Що робиш на вихідних?",
       "ru": "Что делаешь на выходных?",
       "en": "What are you doing at the weekend?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Jadę nad morze!",
        "tr": {
         "uk": "Їду на море!",
         "ru": "Еду на море!",
         "en": "I’m going to the seaside!"
        }
       },
       {
        "id": "s0o1",
        "text": "Jadę na morze!",
        "tr": {
         "uk": "(«na morze» — у відкрите море, на кораблі; до моря — **nad morze**)",
         "ru": "(«na morze» — в открытое море, на корабле; к морю — **nad morze**)",
         "en": "(«na morze» = out to sea; the seaside is **nad morze**)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "До моря, озера, річки — **nad**: jadę **nad morze**.",
       "ru": "К морю, озеру, реке — **nad**: jadę **nad morze**.",
       "en": "To the seaside: **nad morze**."
      }
     },
     {
      "npc": "A ja idę z psem do lasu.",
      "npcTr": {
       "uk": "А я йду із собакою до лісу.",
       "ru": "А я иду с собакой в лес.",
       "en": "And I’m taking the dog to the forest."
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Super, w lesie jest teraz pięknie.",
        "tr": {
         "uk": "Супер, у лісі зараз гарно.",
         "ru": "Супер, в лесу сейчас красиво.",
         "en": "Great, the forest is beautiful now."
        }
       },
       {
        "id": "s1o1",
        "text": "Super, w lasie jest teraz pięknie.",
        "tr": {
         "uk": "(місцевий від «las» — **w lesie**: а → е)",
         "ru": "(предложный от «las» — **w lesie**: а → е)",
         "en": "(locative of «las» is **w lesie**)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "las → **w lesie** (як «у лісі»).",
       "ru": "las → **w lesie** (как «в лесу»).",
       "en": "las → **w lesie**."
      }
     }
    ]
   },
   "explanation": null
  },
  "to": {
   "type": "DIALOGUE",
   "skill": "dialogue.nature",
   "data": {
    "npc": {
     "name": "Zosia",
     "emoji": "👩🏻‍🦰",
     "role": {
      "uk": "колега, любить велосипед",
      "ru": "коллега, любит велосипед",
      "en": "a colleague who loves cycling"
     }
    },
    "steps": [
     {
      "npc": "Co robisz w weekend?",
      "npcTr": {
       "uk": "Що робиш на вихідних?",
       "ru": "Что делаешь на выходных?",
       "en": "What are you doing at the weekend?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Jadę nad morze!",
        "tr": {
         "uk": "Їду на море!",
         "ru": "Еду на море!",
         "en": "I’m going to the seaside!"
        }
       },
       {
        "id": "s0o1",
        "text": "Jadę na morze!",
        "tr": {
         "uk": "(«na morze» — у відкрите море, на кораблі; до моря — **nad morze**)",
         "ru": "(«na morze» — в открытое море, на корабле; к морю — **nad morze**)",
         "en": "(«na morze» = out to sea; the seaside is **nad morze**)"
        }
       },
       {
        "id": "s0o2",
        "text": "Jadę do morze!",
        "tr": {
         "uk": "(**do** + родовий: **do morza**; «nad morze» — до берега моря)",
         "ru": "(**do** + родительный: **do morza**; «nad morze» — к берегу моря)",
         "en": "(**do** takes the genitive: **do morza**; “nad morze” is “to the seaside”)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "До моря, озера, річки — **nad**: jadę **nad morze**.",
       "ru": "К морю, озеру, реке — **nad**: jadę **nad morze**.",
       "en": "To the seaside: **nad morze**."
      }
     },
     {
      "npc": "A ja idę z psem do lasu.",
      "npcTr": {
       "uk": "А я йду із собакою до лісу.",
       "ru": "А я иду с собакой в лес.",
       "en": "And I’m taking the dog to the forest."
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Super, w lesie jest teraz pięknie.",
        "tr": {
         "uk": "Супер, у лісі зараз гарно.",
         "ru": "Супер, в лесу сейчас красиво.",
         "en": "Great, the forest is beautiful now."
        }
       },
       {
        "id": "s1o1",
        "text": "Super, w lasie jest teraz pięknie.",
        "tr": {
         "uk": "(місцевий від «las» — **w lesie**: а → е)",
         "ru": "(предложный от «las» — **w lesie**: а → е)",
         "en": "(locative of «las» is **w lesie**)"
        }
       },
       {
        "id": "s1o2",
        "text": "Super, w lesu jest teraz pięknie.",
        "tr": {
         "uk": "(місцевий від «las» — **w lesie**, а не «lesu»)",
         "ru": "(предложный от «las» — **w lesie**, а не «lesu»)",
         "en": "(the locative of “las” is **w lesie**, not “lesu”)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "las → **w lesie** (як «у лісі»).",
       "ru": "las → **w lesie** (как «в лесу»).",
       "en": "las → **w lesie**."
      }
     }
    ]
   },
   "explanation": null
  }
 },
 {
  "lesson": "gorz-6-cieplej",
  "n": 0,
  "from": {
   "type": "DIALOGUE",
   "skill": "dialogue.compare",
   "data": {
    "npc": {
     "name": "Pan Roman",
     "emoji": "👨🏻‍🦳",
     "role": {
      "uk": "сусід-пенсіонер, рибалить на Варті",
      "ru": "сосед-пенсионер, рыбачит на Варте",
      "en": "a retired neighbour who fishes on the Warta"
     }
    },
    "steps": [
     {
      "npc": "Dziś jest cieplej niż wczoraj, prawda?",
      "npcTr": {
       "uk": "Сьогодні тепліше, ніж учора, правда?",
       "ru": "Сегодня теплее, чем вчера, правда?",
       "en": "It’s warmer today than yesterday, isn’t it?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Tak, dużo cieplej! Wczoraj było zimniej.",
        "tr": {
         "uk": "Так, набагато тепліше! Учора було холодніше.",
         "ru": "Да, намного теплее! Вчера было холоднее.",
         "en": "Yes, much warmer! It was colder yesterday."
        }
       },
       {
        "id": "s0o1",
        "text": "Tak, dużo cieplejszy! Wczoraj było zimniej.",
        "tr": {
         "uk": "(про погоду — прислівник **cieplej**; «cieplejszy» — про предмет)",
         "ru": "(о погоде — наречие **cieplej**; «cieplejszy» — о предмете)",
         "en": "(for weather use **cieplej**; «cieplejszy» describes a thing)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "Погода — **cieplej**, річ — **cieplejszy** sweter.",
       "ru": "Погода — **cieplej**, вещь — **cieplejszy** sweter.",
       "en": "Weather: **cieplej**; a thing: **cieplejszy**."
      }
     },
     {
      "npc": "Gdzie jest ładniej na spacer: nad Wartą czy w parku?",
      "npcTr": {
       "uk": "Де гарніше гуляти: над Вартою чи в парку?",
       "ru": "Где красивее гулять: у Варты или в парке?",
       "en": "Where is nicer for a walk: by the Warta or in the park?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Nad Wartą jest ładniej, bo jest długi bulwar.",
        "tr": {
         "uk": "Над Вартою гарніше, бо там довгий бульвар.",
         "ru": "У Варты красивее, потому что там длинный бульвар.",
         "en": "By the Warta, because there’s a long boulevard."
        }
       },
       {
        "id": "s1o1",
        "text": "Nad Wartą jest bardziej ładnie, bo jest długi bulwar.",
        "tr": {
         "uk": "(від **ładnie** — **ładniej**; «bardziej» — для довгих слів)",
         "ru": "(от **ładnie** — **ładniej**; «bardziej» — для длинных слов)",
         "en": "(**ładnie** → **ładniej**; «bardziej» is for long words)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "ładnie → **ładniej**.",
       "ru": "ładnie → **ładniej**.",
       "en": "ładnie → **ładniej**."
      }
     }
    ]
   },
   "explanation": null
  },
  "to": {
   "type": "DIALOGUE",
   "skill": "dialogue.compare",
   "data": {
    "npc": {
     "name": "Pan Roman",
     "emoji": "👨🏻‍🦳",
     "role": {
      "uk": "сусід-пенсіонер, рибалить на Варті",
      "ru": "сосед-пенсионер, рыбачит на Варте",
      "en": "a retired neighbour who fishes on the Warta"
     }
    },
    "steps": [
     {
      "npc": "Dziś jest cieplej niż wczoraj, prawda?",
      "npcTr": {
       "uk": "Сьогодні тепліше, ніж учора, правда?",
       "ru": "Сегодня теплее, чем вчера, правда?",
       "en": "It’s warmer today than yesterday, isn’t it?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Tak, dużo cieplej! Wczoraj było zimniej.",
        "tr": {
         "uk": "Так, набагато тепліше! Учора було холодніше.",
         "ru": "Да, намного теплее! Вчера было холоднее.",
         "en": "Yes, much warmer! It was colder yesterday."
        }
       },
       {
        "id": "s0o1",
        "text": "Tak, dużo cieplejszy! Wczoraj było zimniej.",
        "tr": {
         "uk": "(про погоду — прислівник **cieplej**; «cieplejszy» — про предмет)",
         "ru": "(о погоде — наречие **cieplej**; «cieplejszy» — о предмете)",
         "en": "(for weather use **cieplej**; «cieplejszy» describes a thing)"
        }
       },
       {
        "id": "s0o2",
        "text": "Tak, dużo ciepło! Wczoraj było zimniej.",
        "tr": {
         "uk": "(порівняння — **cieplej**; «ciepło» — звичайна форма)",
         "ru": "(сравнение — **cieplej**; «ciepło» — обычная форма)",
         "en": "(a comparison needs **cieplej**; “ciepło” is the plain form)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "Погода — **cieplej**, річ — **cieplejszy** sweter.",
       "ru": "Погода — **cieplej**, вещь — **cieplejszy** sweter.",
       "en": "Weather: **cieplej**; a thing: **cieplejszy**."
      }
     },
     {
      "npc": "Gdzie jest ładniej na spacer: nad Wartą czy w parku?",
      "npcTr": {
       "uk": "Де гарніше гуляти: над Вартою чи в парку?",
       "ru": "Где красивее гулять: у Варты или в парке?",
       "en": "Where is nicer for a walk: by the Warta or in the park?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Nad Wartą jest ładniej, bo jest długi bulwar.",
        "tr": {
         "uk": "Над Вартою гарніше, бо там довгий бульвар.",
         "ru": "У Варты красивее, потому что там длинный бульвар.",
         "en": "By the Warta, because there’s a long boulevard."
        }
       },
       {
        "id": "s1o1",
        "text": "Nad Wartą jest bardziej ładnie, bo jest długi bulwar.",
        "tr": {
         "uk": "(від **ładnie** — **ładniej**; «bardziej» — для довгих слів)",
         "ru": "(от **ładnie** — **ładniej**; «bardziej» — для длинных слов)",
         "en": "(**ładnie** → **ładniej**; «bardziej» is for long words)"
        }
       },
       {
        "id": "s1o2",
        "text": "Nad Wartą jest ładniejsza, bo jest długi bulwar.",
        "tr": {
         "uk": "(про «jest» без іменника — прислівник **ładniej**; «ładniejsza» — про жіночий іменник)",
         "ru": "(при «jest» без существительного — наречие **ładniej**; «ładniejsza» — о женском существительном)",
         "en": "(with an impersonal “jest” use the adverb **ładniej**; “ładniejsza” goes with a feminine noun)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "ładnie → **ładniej**.",
       "ru": "ładnie → **ładniej**.",
       "en": "ładnie → **ładniej**."
      }
     }
    ]
   },
   "explanation": null
  }
 },
 {
  "lesson": "gorz-7-wycieczka",
  "n": 0,
  "from": {
   "type": "DIALOGUE",
   "skill": "dialogue.trip",
   "data": {
    "npc": {
     "name": "Zosia",
     "emoji": "👩🏻‍🦰",
     "role": {
      "uk": "колега, любить велосипед",
      "ru": "коллега, любит велосипед",
      "en": "a colleague who loves cycling"
     }
    },
    "steps": [
     {
      "npc": "W sobotę jedziemy na wycieczkę rowerową nad jezioro. Jedziesz z nami?",
      "npcTr": {
       "uk": "У суботу ми їдемо на велопрогулянку до озера. Поїдеш з нами?",
       "ru": "В субботу мы едем на велопрогулку на озеро. Поедешь с нами?",
       "en": "On Saturday we’re cycling to the lake. Will you come with us?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Chętnie! Pojadę z wami.",
        "tr": {
         "uk": "Залюбки! Поїду з вами.",
         "ru": "С удовольствием! Поеду с вами.",
         "en": "Gladly! I’ll come with you."
        }
       },
       {
        "id": "s0o1",
        "text": "Chętnie! Pojadę z wy.",
        "tr": {
         "uk": "(після **z** — орудний: **z wami**)",
         "ru": "(после **z** — творительный: **z wami**)",
         "en": "(after **z** use the instrumental: **z wami**)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "**z wami** — з вами.",
       "ru": "**z wami** — с вами.",
       "en": "**z wami** — with you."
      }
     },
     {
      "npc": "Weźmiemy namiot i wieczorem zrobimy ognisko.",
      "npcTr": {
       "uk": "Візьмемо намет і ввечері розпалимо вогнище.",
       "ru": "Возьмём палатку и вечером разведём костёр.",
       "en": "We’ll take a tent and make a campfire in the evening."
      }
     },
     {
      "npc": "Masz rower?",
      "npcTr": {
       "uk": "У тебе є велосипед?",
       "ru": "У тебя есть велосипед?",
       "en": "Do you have a bike?"
      },
      "options": [
       {
        "id": "s2o0",
        "text": "Nie mam, ale wypożyczę rower miejski.",
        "tr": {
         "uk": "Немає, але візьму міський напрокат.",
         "ru": "Нет, но возьму городской напрокат.",
         "en": "No, but I’ll rent a city bike."
        }
       },
       {
        "id": "s2o1",
        "text": "Nie mam, ale pożyczę rower miejski.",
        "tr": {
         "uk": "(міський велосипед беруть напрокат — **wypożyczyć**; «pożyczyć» — у знайомих)",
         "ru": "(городской велосипед берут напрокат — **wypożyczyć**; «pożyczyć» — у знакомых)",
         "en": "(a city bike is rented: **wypożyczyć**)"
        }
       }
      ],
      "answer": "s2o0",
      "feedback": {
       "uk": "**Wypożyczyć** — напрокат за гроші; **pożyczyć** — позичити в когось.",
       "ru": "**Wypożyczyć** — напрокат за деньги; **pożyczyć** — одолжить у кого-то.",
       "en": "**Wypożyczyć** = rent; **pożyczyć** = borrow."
      }
     }
    ]
   },
   "explanation": null
  },
  "to": {
   "type": "DIALOGUE",
   "skill": "dialogue.trip",
   "data": {
    "npc": {
     "name": "Zosia",
     "emoji": "👩🏻‍🦰",
     "role": {
      "uk": "колега, любить велосипед",
      "ru": "коллега, любит велосипед",
      "en": "a colleague who loves cycling"
     }
    },
    "steps": [
     {
      "npc": "W sobotę jedziemy na wycieczkę rowerową nad jezioro. Jedziesz z nami?",
      "npcTr": {
       "uk": "У суботу ми їдемо на велопрогулянку до озера. Поїдеш з нами?",
       "ru": "В субботу мы едем на велопрогулку на озеро. Поедешь с нами?",
       "en": "On Saturday we’re cycling to the lake. Will you come with us?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Chętnie! Pojadę z wami.",
        "tr": {
         "uk": "Залюбки! Поїду з вами.",
         "ru": "С удовольствием! Поеду с вами.",
         "en": "Gladly! I’ll come with you."
        }
       },
       {
        "id": "s0o1",
        "text": "Chętnie! Pojadę z wy.",
        "tr": {
         "uk": "(після **z** — орудний: **z wami**)",
         "ru": "(после **z** — творительный: **z wami**)",
         "en": "(after **z** use the instrumental: **z wami**)"
        }
       },
       {
        "id": "s0o2",
        "text": "Chętnie! Pojadę z wasze.",
        "tr": {
         "uk": "(після **z** — орудний: **z wami**)",
         "ru": "(после **z** — творительный: **z wami**)",
         "en": "(after **z** use the instrumental: **z wami**)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "**z wami** — з вами.",
       "ru": "**z wami** — с вами.",
       "en": "**z wami** — with you."
      }
     },
     {
      "npc": "Weźmiemy namiot i wieczorem zrobimy ognisko.",
      "npcTr": {
       "uk": "Візьмемо намет і ввечері розпалимо вогнище.",
       "ru": "Возьмём палатку и вечером разведём костёр.",
       "en": "We’ll take a tent and make a campfire in the evening."
      }
     },
     {
      "npc": "Masz rower?",
      "npcTr": {
       "uk": "У тебе є велосипед?",
       "ru": "У тебя есть велосипед?",
       "en": "Do you have a bike?"
      },
      "options": [
       {
        "id": "s2o0",
        "text": "Nie mam, ale wypożyczę rower miejski.",
        "tr": {
         "uk": "Немає, але візьму міський напрокат.",
         "ru": "Нет, но возьму городской напрокат.",
         "en": "No, but I’ll rent a city bike."
        }
       },
       {
        "id": "s2o1",
        "text": "Nie mam, ale pożyczę rower miejski.",
        "tr": {
         "uk": "(міський велосипед беруть напрокат — **wypożyczyć**; «pożyczyć» — у знайомих)",
         "ru": "(городской велосипед берут напрокат — **wypożyczyć**; «pożyczyć» — у знакомых)",
         "en": "(a city bike is rented: **wypożyczyć**)"
        }
       },
       {
        "id": "s2o2",
        "text": "Nie mam, ale wypożyczę rowerem miejskim.",
        "tr": {
         "uk": "(**wypożyczyć** + знахідний: **rower miejski**, а не орудний)",
         "ru": "(**wypożyczyć** + винительный: **rower miejski**, а не творительный)",
         "en": "(**wypożyczyć** takes the accusative: **rower miejski**, not the instrumental)"
        }
       }
      ],
      "answer": "s2o0",
      "feedback": {
       "uk": "**Wypożyczyć** — напрокат за гроші; **pożyczyć** — позичити в когось.",
       "ru": "**Wypożyczyć** — напрокат за деньги; **pożyczyć** — одолжить у кого-то.",
       "en": "**Wypożyczyć** = rent; **pożyczyć** = borrow."
      }
     }
    ]
   },
   "explanation": null
  }
 },
 {
  "lesson": "gorz-8-segregacja",
  "n": 0,
  "from": {
   "type": "DIALOGUE",
   "skill": "dialogue.recycling",
   "data": {
    "npc": {
     "name": "Pan Roman",
     "emoji": "👨🏻‍🦳",
     "role": {
      "uk": "сусід-пенсіонер, рибалить на Варті",
      "ru": "сосед-пенсионер, рыбачит на Варте",
      "en": "a retired neighbour who fishes on the Warta"
     }
    },
    "steps": [
     {
      "npc": "Dzień dobry! Pan tu nowy? Pomogę z segregacją.",
      "npcTr": {
       "uk": "Добрий день! Ви тут новенький? Допоможу із сортуванням.",
       "ru": "Добрый день! Вы здесь новенький? Помогу с сортировкой.",
       "en": "Hello! Are you new here? I’ll help with the sorting."
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Dziękuję! Gdzie wyrzucić butelkę po winie?",
        "tr": {
         "uk": "Дякую! Куди викинути пляшку з-під вина?",
         "ru": "Спасибо! Куда выбросить бутылку из-под вина?",
         "en": "Thank you! Where does a wine bottle go?"
        }
       },
       {
        "id": "s0o1",
        "text": "Dziękuję! Gdzie wyrzucić butelka po winie?",
        "tr": {
         "uk": "(викинути що? — знахідний: **butelkę**)",
         "ru": "(выбросить что? — винительный: **butelkę**)",
         "en": "(accusative: **butelkę**)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "wyrzucić (co?) — **butelkę**.",
       "ru": "wyrzucić (что?) — **butelkę**.",
       "en": "wyrzucić + accusative: **butelkę**."
      }
     },
     {
      "npc": "Szkło — do zielonego pojemnika. A plastik i puszki do żółtego.",
      "npcTr": {
       "uk": "Скло — у зелений контейнер. А пластик і бляшанки — у жовтий.",
       "ru": "Стекло — в зелёный контейнер. А пластик и банки — в жёлтый.",
       "en": "Glass goes in the green bin. Plastic and cans in the yellow one."
      }
     },
     {
      "npc": "A gazety?",
      "npcTr": {
       "uk": "А газети?",
       "ru": "А газеты?",
       "en": "And newspapers?"
      },
      "options": [
       {
        "id": "s2o0",
        "text": "Do niebieskiego, bo to papier.",
        "tr": {
         "uk": "У синій, бо це папір.",
         "ru": "В синий, потому что это бумага.",
         "en": "In the blue one, because it’s paper."
        }
       },
       {
        "id": "s2o1",
        "text": "Do niebieski, bo to papier.",
        "tr": {
         "uk": "(після **do** — родовий: **do niebieskiego**)",
         "ru": "(после **do** — родительный: **do niebieskiego**)",
         "en": "(after **do**: **niebieskiego**)"
        }
       }
      ],
      "answer": "s2o0",
      "feedback": {
       "uk": "**do** + родовий: do **niebieskiego** (pojemnika).",
       "ru": "**do** + родительный: do **niebieskiego** (pojemnika).",
       "en": "**do** + genitive: **niebieskiego**."
      }
     }
    ]
   },
   "explanation": null
  },
  "to": {
   "type": "DIALOGUE",
   "skill": "dialogue.recycling",
   "data": {
    "npc": {
     "name": "Pan Roman",
     "emoji": "👨🏻‍🦳",
     "role": {
      "uk": "сусід-пенсіонер, рибалить на Варті",
      "ru": "сосед-пенсионер, рыбачит на Варте",
      "en": "a retired neighbour who fishes on the Warta"
     }
    },
    "steps": [
     {
      "npc": "Dzień dobry! Pan tu nowy? Pomogę z segregacją.",
      "npcTr": {
       "uk": "Добрий день! Ви тут новенький? Допоможу із сортуванням.",
       "ru": "Добрый день! Вы здесь новенький? Помогу с сортировкой.",
       "en": "Hello! Are you new here? I’ll help with the sorting."
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Dziękuję! Gdzie wyrzucić butelkę po winie?",
        "tr": {
         "uk": "Дякую! Куди викинути пляшку з-під вина?",
         "ru": "Спасибо! Куда выбросить бутылку из-под вина?",
         "en": "Thank you! Where does a wine bottle go?"
        }
       },
       {
        "id": "s0o1",
        "text": "Dziękuję! Gdzie wyrzucić butelka po winie?",
        "tr": {
         "uk": "(викинути що? — знахідний: **butelkę**)",
         "ru": "(выбросить что? — винительный: **butelkę**)",
         "en": "(accusative: **butelkę**)"
        }
       },
       {
        "id": "s0o2",
        "text": "Dziękuję! Gdzie wyrzucić butelkę po wino?",
        "tr": {
         "uk": "(**po** + місцевий: butelka po **winie**)",
         "ru": "(**po** + предложный: butelka po **winie**)",
         "en": "(**po** + locative: butelka po **winie**)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "wyrzucić (co?) — **butelkę**.",
       "ru": "wyrzucić (что?) — **butelkę**.",
       "en": "wyrzucić + accusative: **butelkę**."
      }
     },
     {
      "npc": "Szkło — do zielonego pojemnika. A plastik i puszki do żółtego.",
      "npcTr": {
       "uk": "Скло — у зелений контейнер. А пластик і бляшанки — у жовтий.",
       "ru": "Стекло — в зелёный контейнер. А пластик и банки — в жёлтый.",
       "en": "Glass goes in the green bin. Plastic and cans in the yellow one."
      }
     },
     {
      "npc": "A gazety?",
      "npcTr": {
       "uk": "А газети?",
       "ru": "А газеты?",
       "en": "And newspapers?"
      },
      "options": [
       {
        "id": "s2o0",
        "text": "Do niebieskiego, bo to papier.",
        "tr": {
         "uk": "У синій, бо це папір.",
         "ru": "В синий, потому что это бумага.",
         "en": "In the blue one, because it’s paper."
        }
       },
       {
        "id": "s2o1",
        "text": "Do niebieski, bo to papier.",
        "tr": {
         "uk": "(після **do** — родовий: **do niebieskiego**)",
         "ru": "(после **do** — родительный: **do niebieskiego**)",
         "en": "(after **do**: **niebieskiego**)"
        }
       },
       {
        "id": "s2o2",
        "text": "Do niebieskiego, bo to szkło.",
        "tr": {
         "uk": "(газети — це **папір**, тому в синій: «bo to papier»; «szkło» — скло)",
         "ru": "(газеты — это **бумага**, поэтому в синий: «bo to papier»; «szkło» — стекло)",
         "en": "(newspapers are **paper**, so the blue bin: “bo to papier”; “szkło” means glass)"
        }
       }
      ],
      "answer": "s2o0",
      "feedback": {
       "uk": "**do** + родовий: do **niebieskiego** (pojemnika).",
       "ru": "**do** + родительный: do **niebieskiego** (pojemnika).",
       "en": "**do** + genitive: **niebieskiego**."
      }
     }
    ]
   },
   "explanation": null
  }
 },
 {
  "lesson": "gorz-boss",
  "n": 0,
  "from": {
   "type": "SITUATION",
   "skill": "situation.boss",
   "data": {
    "npc": {
     "name": "Pan Roman",
     "emoji": "👨🏻‍🦳",
     "role": {
      "uk": "сусід-пенсіонер, рибалить на Варті",
      "ru": "сосед-пенсионер, рыбачит на Варте",
      "en": "a retired neighbour who fishes on the Warta"
     }
    },
    "scene": {
     "uk": "Неділя, бульвар над Вартою в Гожуві",
     "ru": "Воскресенье, бульвар у Варты в Гожуве",
     "en": "Sunday on the Warta boulevard in Gorzów"
    },
    "steps": [
     {
      "npc": "Ale dziś piękna pogoda! Cieplej niż wczoraj.",
      "npcTr": {
       "uk": "Яка сьогодні гарна погода! Тепліше, ніж учора.",
       "ru": "Какая сегодня хорошая погода! Теплее, чем вчера.",
       "en": "What lovely weather today! Warmer than yesterday."
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Tak, w końcu świeci słońce!",
        "tr": {
         "uk": "Так, нарешті світить сонце!",
         "ru": "Да, наконец светит солнце!",
         "en": "Yes, the sun is finally shining!"
        }
       },
       {
        "id": "s0o1",
        "text": "Tak, w końcu pada słońce!",
        "tr": {
         "uk": "(сонце не «падає»: **świeci** słońce)",
         "ru": "(солнце не «падает»: **świeci** słońce)",
         "en": "(the sun **świeci**, it doesn’t “fall”)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "**Świeci słońce** — світить сонце.",
       "ru": "**Świeci słońce** — светит солнце.",
       "en": "**Świeci słońce**."
      }
     },
     {
      "npc": "Jedzie pan w weekend za miasto?",
      "npcTr": {
       "uk": "Ви на вихідних їдете за місто?",
       "ru": "Вы на выходных едете за город?",
       "en": "Are you going out of town at the weekend?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Tak, jadę z przyjaciółmi nad jezioro.",
        "tr": {
         "uk": "Так, їду з друзями на озеро.",
         "ru": "Да, еду с друзьями на озеро.",
         "en": "Yes, I’m going to the lake with friends."
        }
       },
       {
        "id": "s1o1",
        "text": "Tak, jadę z przyjaciółmi na jezioro.",
        "tr": {
         "uk": "(«na jezioro» — на саме озеро, на човні чи лід; на берег — **nad jezioro**)",
         "ru": "(«na jezioro» — на само озеро, на лодке или лёд; на берег — **nad jezioro**)",
         "en": "(to the lakeside: **nad jezioro**)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "До озера на берег — **nad jezioro**.",
       "ru": "К озеру на берег — **nad jezioro**.",
       "en": "To the lakeside: **nad jezioro**."
      }
     }
    ]
   },
   "explanation": null
  },
  "to": {
   "type": "SITUATION",
   "skill": "situation.boss",
   "data": {
    "npc": {
     "name": "Pan Roman",
     "emoji": "👨🏻‍🦳",
     "role": {
      "uk": "сусід-пенсіонер, рибалить на Варті",
      "ru": "сосед-пенсионер, рыбачит на Варте",
      "en": "a retired neighbour who fishes on the Warta"
     }
    },
    "scene": {
     "uk": "Неділя, бульвар над Вартою в Гожуві",
     "ru": "Воскресенье, бульвар у Варты в Гожуве",
     "en": "Sunday on the Warta boulevard in Gorzów"
    },
    "steps": [
     {
      "npc": "Ale dziś piękna pogoda! Cieplej niż wczoraj.",
      "npcTr": {
       "uk": "Яка сьогодні гарна погода! Тепліше, ніж учора.",
       "ru": "Какая сегодня хорошая погода! Теплее, чем вчера.",
       "en": "What lovely weather today! Warmer than yesterday."
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Tak, w końcu świeci słońce!",
        "tr": {
         "uk": "Так, нарешті світить сонце!",
         "ru": "Да, наконец светит солнце!",
         "en": "Yes, the sun is finally shining!"
        }
       },
       {
        "id": "s0o1",
        "text": "Tak, w końcu pada słońce!",
        "tr": {
         "uk": "(сонце не «падає»: **świeci** słońce)",
         "ru": "(солнце не «падает»: **świeci** słońce)",
         "en": "(the sun **świeci**, it doesn’t “fall”)"
        }
       },
       {
        "id": "s0o2",
        "text": "Tak, w końcu świeci księżyc!",
        "tr": {
         "uk": "(вдень — **słońce**; **księżyc** світить уночі)",
         "ru": "(днём — **słońce**; **księżyc** светит ночью)",
         "en": "(by day it is **słońce**; **księżyc** (moon) shines at night)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "**Świeci słońce** — світить сонце.",
       "ru": "**Świeci słońce** — светит солнце.",
       "en": "**Świeci słońce**."
      }
     },
     {
      "npc": "Jedzie pan w weekend za miasto?",
      "npcTr": {
       "uk": "Ви на вихідних їдете за місто?",
       "ru": "Вы на выходных едете за город?",
       "en": "Are you going out of town at the weekend?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Tak, jadę z przyjaciółmi nad jezioro.",
        "tr": {
         "uk": "Так, їду з друзями на озеро.",
         "ru": "Да, еду с друзьями на озеро.",
         "en": "Yes, I’m going to the lake with friends."
        }
       },
       {
        "id": "s1o1",
        "text": "Tak, jadę z przyjaciółmi na jezioro.",
        "tr": {
         "uk": "(«na jezioro» — на саме озеро, на човні чи лід; на берег — **nad jezioro**)",
         "ru": "(«na jezioro» — на само озеро, на лодке или лёд; на берег — **nad jezioro**)",
         "en": "(to the lakeside: **nad jezioro**)"
        }
       },
       {
        "id": "s1o2",
        "text": "Tak, jadę z przyjaciółmi nad jeziorem.",
        "tr": {
         "uk": "(їдуть **до** озера — **nad jezioro**; **nad jeziorem** — «біля озера», де вже перебуваєш)",
         "ru": "(едут **к** озеру — **nad jezioro**; **nad jeziorem** — «у озера», где уже находишься)",
         "en": "(you travel **to** the lake — **nad jezioro**; **nad jeziorem** means you are already there)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "До озера на берег — **nad jezioro**.",
       "ru": "К озеру на берег — **nad jezioro**.",
       "en": "To the lakeside: **nad jezioro**."
      }
     }
    ]
   },
   "explanation": null
  }
 },
 {
  "lesson": "szc-1-ogloszenie",
  "n": 0,
  "from": {
   "type": "DIALOGUE",
   "skill": "dialogue.jobad",
   "data": {
    "npc": {
     "name": "Ania",
     "emoji": "👩🏽",
     "role": {
      "uk": "подруга, допомагає з CV",
      "ru": "подруга, помогает с резюме",
      "en": "a friend helping with your CV"
     }
    },
    "steps": [
     {
      "npc": "Zobacz to ogłoszenie: „Zatrudnimy magazynierów”. Rozumiesz?",
      "npcTr": {
       "uk": "Подивись на це оголошення: «Візьмемо на роботу складських працівників». Розумієш?",
       "ru": "Посмотри на это объявление: «Примем на работу кладовщиков». Понимаешь?",
       "en": "Look at this ad: “We will hire warehouse workers.” Do you get it?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Tak, firma szuka ludzi do pracy w magazynie.",
        "tr": {
         "uk": "Так, фірма шукає людей на склад.",
         "ru": "Да, фирма ищет людей на склад.",
         "en": "Yes, the company is looking for warehouse staff."
        }
       },
       {
        "id": "s0o1",
        "text": "Tak, magazynierzy szukają pracy w tej firmie.",
        "tr": {
         "uk": "(навпаки: **zatrudnimy** — «візьмемо на роботу», роботу пропонує фірма)",
         "ru": "(наоборот: **zatrudnimy** — «примем на работу», работу предлагает фирма)",
         "en": "(the other way round: the company is hiring)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "**Zatrudnimy** — фірма бере людей на роботу.",
       "ru": "**Zatrudnimy** — фирма принимает людей на работу.",
       "en": "**Zatrudnimy** — the company is hiring."
      }
     },
     {
      "npc": "A na dole jest napisane „praca od zaraz”.",
      "npcTr": {
       "uk": "А внизу написано «робота від сьогодні».",
       "ru": "А внизу написано «работа сразу».",
       "en": "And at the bottom it says “start immediately”."
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Czyli mogę zacząć od razu.",
        "tr": {
         "uk": "Тобто можу почати одразу.",
         "ru": "То есть могу начать сразу.",
         "en": "So I can start right away."
        }
       },
       {
        "id": "s1o1",
        "text": "Czyli praca jest tylko rano.",
        "tr": {
         "uk": "(«od zaraz» — негайно, а не «з ранку» — od rana)",
         "ru": "(«od zaraz» — сразу, а не «с утра» — od rana)",
         "en": "(«od zaraz» means immediately, not “in the morning”)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "**Od zaraz** — з цього ж дня, негайно.",
       "ru": "**Od zaraz** — сразу, с сегодняшнего дня.",
       "en": "**Od zaraz** — starting immediately."
      }
     }
    ]
   },
   "explanation": null
  },
  "to": {
   "type": "DIALOGUE",
   "skill": "dialogue.jobad",
   "data": {
    "npc": {
     "name": "Ania",
     "emoji": "👩🏽",
     "role": {
      "uk": "подруга, допомагає з CV",
      "ru": "подруга, помогает с резюме",
      "en": "a friend helping with your CV"
     }
    },
    "steps": [
     {
      "npc": "Zobacz to ogłoszenie: „Zatrudnimy magazynierów”. Rozumiesz?",
      "npcTr": {
       "uk": "Подивись на це оголошення: «Візьмемо на роботу складських працівників». Розумієш?",
       "ru": "Посмотри на это объявление: «Примем на работу кладовщиков». Понимаешь?",
       "en": "Look at this ad: “We will hire warehouse workers.” Do you get it?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Tak, firma szuka ludzi do pracy w magazynie.",
        "tr": {
         "uk": "Так, фірма шукає людей на склад.",
         "ru": "Да, фирма ищет людей на склад.",
         "en": "Yes, the company is looking for warehouse staff."
        }
       },
       {
        "id": "s0o1",
        "text": "Tak, magazynierzy szukają pracy w tej firmie.",
        "tr": {
         "uk": "(навпаки: **zatrudnimy** — «візьмемо на роботу», роботу пропонує фірма)",
         "ru": "(наоборот: **zatrudnimy** — «примем на работу», работу предлагает фирма)",
         "en": "(the other way round: the company is hiring)"
        }
       },
       {
        "id": "s0o2",
        "text": "Tak, firma szuka ludzi do pracy w magazyn.",
        "tr": {
         "uk": "(**w** + місцевий: w **magazynie**)",
         "ru": "(**w** + предложный: w **magazynie**)",
         "en": "(**w** + locative: w **magazynie**)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "**Zatrudnimy** — фірма бере людей на роботу.",
       "ru": "**Zatrudnimy** — фирма принимает людей на работу.",
       "en": "**Zatrudnimy** — the company is hiring."
      }
     },
     {
      "npc": "A na dole jest napisane „praca od zaraz”.",
      "npcTr": {
       "uk": "А внизу написано «робота від сьогодні».",
       "ru": "А внизу написано «работа сразу».",
       "en": "And at the bottom it says “start immediately”."
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Czyli mogę zacząć od razu.",
        "tr": {
         "uk": "Тобто можу почати одразу.",
         "ru": "То есть могу начать сразу.",
         "en": "So I can start right away."
        }
       },
       {
        "id": "s1o1",
        "text": "Czyli praca jest tylko rano.",
        "tr": {
         "uk": "(«od zaraz» — негайно, а не «з ранку» — od rana)",
         "ru": "(«od zaraz» — сразу, а не «с утра» — od rana)",
         "en": "(«od zaraz» means immediately, not “in the morning”)"
        }
       },
       {
        "id": "s1o2",
        "text": "Czyli muszę zacząć dopiero za miesiąc.",
        "tr": {
         "uk": "(**od zaraz** — одразу, просто зараз; «dopiero za miesiąc» — «лише через місяць»)",
         "ru": "(**od zaraz** — сразу, прямо сейчас; «dopiero za miesiąc» — «только через месяц»)",
         "en": "(**od zaraz** means “immediately”; “dopiero za miesiąc” means “only in a month”)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "**Od zaraz** — з цього ж дня, негайно.",
       "ru": "**Od zaraz** — сразу, с сегодняшнего дня.",
       "en": "**Od zaraz** — starting immediately."
      }
     }
    ]
   },
   "explanation": null
  }
 },
 {
  "lesson": "szc-2-cv",
  "n": 0,
  "from": {
   "type": "DIALOGUE",
   "skill": "dialogue.cv",
   "data": {
    "npc": {
     "name": "Ania",
     "emoji": "👩🏽",
     "role": {
      "uk": "подруга, допомагає з CV",
      "ru": "подруга, помогает с резюме",
      "en": "a friend helping with your CV"
     }
    },
    "steps": [
     {
      "npc": "Co napiszemy w doświadczeniu?",
      "npcTr": {
       "uk": "Що напишемо в розділі «Досвід»?",
       "ru": "Что напишем в разделе «Опыт»?",
       "en": "What shall we write under “Experience”?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Pracowałem jako kierowca przez dwa lata.",
        "tr": {
         "uk": "Я працював водієм два роки.",
         "ru": "Я работал водителем два года.",
         "en": "I worked as a driver for two years."
        }
       },
       {
        "id": "s0o1",
        "text": "Pracowałem jako kierowcą przez dwa lata.",
        "tr": {
         "uk": "(після **jako** — називний: jako **kierowca**; орудний — після «być»)",
         "ru": "(после **jako** — именительный: jako **kierowca**; творительный — после «być»)",
         "en": "(after **jako** use the nominative)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "**jako kierowca**, але **jestem kierowcą**.",
       "ru": "**jako kierowca**, но **jestem kierowcą**.",
       "en": "**jako kierowca** but **jestem kierowcą**."
      }
     },
     {
      "npc": "A od kiedy jesteś w Polsce?",
      "npcTr": {
       "uk": "А відколи ти в Польщі?",
       "ru": "А с какого времени ты в Польше?",
       "en": "And since when have you been in Poland?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Od dwóch lat.",
        "tr": {
         "uk": "Уже два роки.",
         "ru": "Уже два года.",
         "en": "For two years now."
        }
       },
       {
        "id": "s1o1",
        "text": "Przez dwa lata.",
        "tr": {
         "uk": "(«przez dwa lata» — протягом двох років, і це вже минуло; «відколи» — **od dwóch lat**)",
         "ru": "(«przez dwa lata» — в течение двух лет, и это уже прошло; «с каких пор» — **od dwóch lat**)",
         "en": "(«przez» = for a finished period; “since” = **od**)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "Досі триває — **od** + родовий: od dwóch lat.",
       "ru": "Всё ещё длится — **od** + родительный: od dwóch lat.",
       "en": "Still going on — **od dwóch lat**."
      }
     }
    ]
   },
   "explanation": null
  },
  "to": {
   "type": "DIALOGUE",
   "skill": "dialogue.cv",
   "data": {
    "npc": {
     "name": "Ania",
     "emoji": "👩🏽",
     "role": {
      "uk": "подруга, допомагає з CV",
      "ru": "подруга, помогает с резюме",
      "en": "a friend helping with your CV"
     }
    },
    "steps": [
     {
      "npc": "Co napiszemy w doświadczeniu?",
      "npcTr": {
       "uk": "Що напишемо в розділі «Досвід»?",
       "ru": "Что напишем в разделе «Опыт»?",
       "en": "What shall we write under “Experience”?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Pracowałem jako kierowca przez dwa lata.",
        "tr": {
         "uk": "Я працював водієм два роки.",
         "ru": "Я работал водителем два года.",
         "en": "I worked as a driver for two years."
        }
       },
       {
        "id": "s0o1",
        "text": "Pracowałem jako kierowcą przez dwa lata.",
        "tr": {
         "uk": "(після **jako** — називний: jako **kierowca**; орудний — після «być»)",
         "ru": "(после **jako** — именительный: jako **kierowca**; творительный — после «być»)",
         "en": "(after **jako** use the nominative)"
        }
       },
       {
        "id": "s0o2",
        "text": "Pracowałem jako kierowca przez dwa lat.",
        "tr": {
         "uk": "(2–4 — **lata**: **dwa lata**; **lat** — від 5)",
         "ru": "(2–4 — **lata**: **dwa lata**; **lat** — от 5)",
         "en": "(2–4 take **lata**: **dwa lata**; **lat** is for 5 and more)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "**jako kierowca**, але **jestem kierowcą**.",
       "ru": "**jako kierowca**, но **jestem kierowcą**.",
       "en": "**jako kierowca** but **jestem kierowcą**."
      }
     },
     {
      "npc": "A od kiedy jesteś w Polsce?",
      "npcTr": {
       "uk": "А відколи ти в Польщі?",
       "ru": "А с какого времени ты в Польше?",
       "en": "And since when have you been in Poland?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Od dwóch lat.",
        "tr": {
         "uk": "Уже два роки.",
         "ru": "Уже два года.",
         "en": "For two years now."
        }
       },
       {
        "id": "s1o1",
        "text": "Przez dwa lata.",
        "tr": {
         "uk": "(«przez dwa lata» — протягом двох років, і це вже минуло; «відколи» — **od dwóch lat**)",
         "ru": "(«przez dwa lata» — в течение двух лет, и это уже прошло; «с каких пор» — **od dwóch lat**)",
         "en": "(«przez» = for a finished period; “since” = **od**)"
        }
       },
       {
        "id": "s1o2",
        "text": "Do dwóch lat.",
        "tr": {
         "uk": "(**od** — «з / вже»; **do** — «до»)",
         "ru": "(**od** — «с / уже»; **do** — «до»)",
         "en": "(**od** means “since / for”; **do** means “until”)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "Досі триває — **od** + родовий: od dwóch lat.",
       "ru": "Всё ещё длится — **od** + родительный: od dwóch lat.",
       "en": "Still going on — **od dwóch lat**."
      }
     }
    ]
   },
   "explanation": null
  }
 },
 {
  "lesson": "szc-3-rozmowa",
  "n": 0,
  "from": {
   "type": "SITUATION",
   "skill": "situation.interview",
   "data": {
    "npc": {
     "name": "Pani Beata",
     "emoji": "👩🏻‍💼",
     "role": {
      "uk": "менеджерка з персоналу",
      "ru": "менеджер по персоналу",
      "en": "an HR manager"
     }
    },
    "scene": {
     "uk": "Офіс транспортної фірми в Щецині",
     "ru": "Офис транспортной фирмы в Щецине",
     "en": "A haulage company office in Szczecin"
    },
    "steps": [
     {
      "npc": "Dzień dobry, proszę usiąść. Czy ma pan doświadczenie jako kierowca?",
      "npcTr": {
       "uk": "Добрий день, сідайте, будь ласка. Чи маєте ви досвід водія?",
       "ru": "Добрый день, садитесь, пожалуйста. У вас есть опыт водителя?",
       "en": "Hello, please sit down. Do you have experience as a driver?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Tak, mam trzy lata doświadczenia.",
        "tr": {
         "uk": "Так, маю три роки досвіду.",
         "ru": "Да, у меня три года опыта.",
         "en": "Yes, I have three years’ experience."
        }
       },
       {
        "id": "s0o1",
        "text": "Tak, ma pan trzy lata doświadczenia.",
        "tr": {
         "uk": "(«ma pan» — про співрозмовника; про себе — **mam**)",
         "ru": "(«ma pan» — о собеседнике; о себе — **mam**)",
         "en": "(«ma pan» is about the other person; about yourself — **mam**)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "Про себе — **mam** (я маю).",
       "ru": "О себе — **mam** (у меня есть).",
       "en": "About yourself — **mam**."
      }
     },
     {
      "npc": "Jakie są pana mocne strony?",
      "npcTr": {
       "uk": "Які ваші сильні сторони?",
       "ru": "Какие ваши сильные стороны?",
       "en": "What are your strengths?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Jestem punktualny i odpowiedzialny.",
        "tr": {
         "uk": "Я пунктуальний і відповідальний.",
         "ru": "Я пунктуальный и ответственный.",
         "en": "I’m punctual and responsible."
        }
       },
       {
        "id": "s1o1",
        "text": "Jestem punktualnie i odpowiedzialnie.",
        "tr": {
         "uk": "(після **jestem** — прикметник: punktualny; «punktualnie» — про дію)",
         "ru": "(после **jestem** — прилагательное: punktualny; «punktualnie» — о действии)",
         "en": "(after **jestem** use an adjective)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "**Jestem** + прикметник: punktualny / punktualna.",
       "ru": "**Jestem** + прилагательное: punktualny / punktualna.",
       "en": "**Jestem** + adjective."
      }
     }
    ]
   },
   "explanation": null
  },
  "to": {
   "type": "SITUATION",
   "skill": "situation.interview",
   "data": {
    "npc": {
     "name": "Pani Beata",
     "emoji": "👩🏻‍💼",
     "role": {
      "uk": "менеджерка з персоналу",
      "ru": "менеджер по персоналу",
      "en": "an HR manager"
     }
    },
    "scene": {
     "uk": "Офіс транспортної фірми в Щецині",
     "ru": "Офис транспортной фирмы в Щецине",
     "en": "A haulage company office in Szczecin"
    },
    "steps": [
     {
      "npc": "Dzień dobry, proszę usiąść. Czy ma pan doświadczenie jako kierowca?",
      "npcTr": {
       "uk": "Добрий день, сідайте, будь ласка. Чи маєте ви досвід водія?",
       "ru": "Добрый день, садитесь, пожалуйста. У вас есть опыт водителя?",
       "en": "Hello, please sit down. Do you have experience as a driver?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Tak, mam trzy lata doświadczenia.",
        "tr": {
         "uk": "Так, маю три роки досвіду.",
         "ru": "Да, у меня три года опыта.",
         "en": "Yes, I have three years’ experience."
        }
       },
       {
        "id": "s0o1",
        "text": "Tak, ma pan trzy lata doświadczenia.",
        "tr": {
         "uk": "(«ma pan» — про співрозмовника; про себе — **mam**)",
         "ru": "(«ma pan» — о собеседнике; о себе — **mam**)",
         "en": "(«ma pan» is about the other person; about yourself — **mam**)"
        }
       },
       {
        "id": "s0o2",
        "text": "Tak, mam trzy lata doświadczenie.",
        "tr": {
         "uk": "(**trzy lata** + родовий: **doświadczenia**)",
         "ru": "(**trzy lata** + родительный: **doświadczenia**)",
         "en": "(**trzy lata** takes the genitive: **doświadczenia**)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "Про себе — **mam** (я маю).",
       "ru": "О себе — **mam** (у меня есть).",
       "en": "About yourself — **mam**."
      }
     },
     {
      "npc": "Jakie są pana mocne strony?",
      "npcTr": {
       "uk": "Які ваші сильні сторони?",
       "ru": "Какие ваши сильные стороны?",
       "en": "What are your strengths?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Jestem punktualny i odpowiedzialny.",
        "tr": {
         "uk": "Я пунктуальний і відповідальний.",
         "ru": "Я пунктуальный и ответственный.",
         "en": "I’m punctual and responsible."
        }
       },
       {
        "id": "s1o1",
        "text": "Jestem punktualnie i odpowiedzialnie.",
        "tr": {
         "uk": "(після **jestem** — прикметник: punktualny; «punktualnie» — про дію)",
         "ru": "(после **jestem** — прилагательное: punktualny; «punktualnie» — о действии)",
         "en": "(after **jestem** use an adjective)"
        }
       },
       {
        "id": "s1o2",
        "text": "Jestem punktualna i odpowiedzialna.",
        "tr": {
         "uk": "(Бобек — чоловік: **punktualny**, **odpowiedzialny**; «punktualna» — про жінку)",
         "ru": "(Бобек — мужчина: **punktualny**, **odpowiedzialny**; «punktualna» — о женщине)",
         "en": "(Bobek is a man: **punktualny**, **odpowiedzialny**; “punktualna” is feminine)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "**Jestem** + прикметник: punktualny / punktualna.",
       "ru": "**Jestem** + прилагательное: punktualny / punktualna.",
       "en": "**Jestem** + adjective."
      }
     }
    ]
   },
   "explanation": null
  }
 },
 {
  "lesson": "szc-4-umowa",
  "n": 0,
  "from": {
   "type": "DIALOGUE",
   "skill": "dialogue.contract",
   "data": {
    "npc": {
     "name": "Pani Beata",
     "emoji": "👩🏻‍💼",
     "role": {
      "uk": "менеджерка з персоналу",
      "ru": "менеджер по персоналу",
      "en": "an HR manager"
     }
    },
    "steps": [
     {
      "npc": "Proponujemy umowę na okres próbny, trzy miesiące.",
      "npcTr": {
       "uk": "Пропонуємо договір на випробувальний термін, три місяці.",
       "ru": "Предлагаем договор на испытательный срок, три месяца.",
       "en": "We offer a three-month probation contract."
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Rozumiem. A potem umowa na czas nieokreślony?",
        "tr": {
         "uk": "Зрозуміло. А потім безстроковий договір?",
         "ru": "Понятно. А потом бессрочный договор?",
         "en": "I see. And then a permanent contract?"
        }
       },
       {
        "id": "s0o1",
        "text": "Rozumiem. A potem umowa na czas nieokreślona?",
        "tr": {
         "uk": "(**czas** — чоловічий рід: na czas **nieokreślony**)",
         "ru": "(**czas** — мужской род: na czas **nieokreślony**)",
         "en": "(**czas** is masculine: **nieokreślony**)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "na czas **nieokreślony** — узгоджуємо з «czas».",
       "ru": "na czas **nieokreślony** — согласуем с «czas».",
       "en": "Agree with «czas»: **nieokreślony**."
      }
     },
     {
      "npc": "Wynagrodzenie to pięć tysięcy brutto.",
      "npcTr": {
       "uk": "Зарплата — п’ять тисяч брутто.",
       "ru": "Зарплата — пять тысяч брутто.",
       "en": "The salary is five thousand gross."
      },
      "options": [
       {
        "id": "s1o0",
        "text": "A ile to będzie netto, na rękę?",
        "tr": {
         "uk": "А скільки це буде нетто, на руки?",
         "ru": "А сколько это будет нетто, на руки?",
         "en": "And how much is that net, take-home?"
        }
       },
       {
        "id": "s1o1",
        "text": "A ile to będzie brutto, na rękę?",
        "tr": {
         "uk": "(«na rękę» — після податків, тобто **netto**)",
         "ru": "(«na rękę» — после налогов, то есть **netto**)",
         "en": "(«na rękę» means after tax: **netto**)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "**Netto** — «на руки», після податків.",
       "ru": "**Netto** — «на руки», после налогов.",
       "en": "**Netto** = take-home."
      }
     }
    ]
   },
   "explanation": null
  },
  "to": {
   "type": "DIALOGUE",
   "skill": "dialogue.contract",
   "data": {
    "npc": {
     "name": "Pani Beata",
     "emoji": "👩🏻‍💼",
     "role": {
      "uk": "менеджерка з персоналу",
      "ru": "менеджер по персоналу",
      "en": "an HR manager"
     }
    },
    "steps": [
     {
      "npc": "Proponujemy umowę na okres próbny, trzy miesiące.",
      "npcTr": {
       "uk": "Пропонуємо договір на випробувальний термін, три місяці.",
       "ru": "Предлагаем договор на испытательный срок, три месяца.",
       "en": "We offer a three-month probation contract."
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Rozumiem. A potem umowa na czas nieokreślony?",
        "tr": {
         "uk": "Зрозуміло. А потім безстроковий договір?",
         "ru": "Понятно. А потом бессрочный договор?",
         "en": "I see. And then a permanent contract?"
        }
       },
       {
        "id": "s0o1",
        "text": "Rozumiem. A potem umowa na czas nieokreślona?",
        "tr": {
         "uk": "(**czas** — чоловічий рід: na czas **nieokreślony**)",
         "ru": "(**czas** — мужской род: na czas **nieokreślony**)",
         "en": "(**czas** is masculine: **nieokreślony**)"
        }
       },
       {
        "id": "s0o2",
        "text": "Rozumiem. A potem umowa na czas nieokreślonym?",
        "tr": {
         "uk": "(**na** + знахідний: na czas **nieokreślony**)",
         "ru": "(**na** + винительный: na czas **nieokreślony**)",
         "en": "(**na** + accusative: na czas **nieokreślony**)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "na czas **nieokreślony** — узгоджуємо з «czas».",
       "ru": "na czas **nieokreślony** — согласуем с «czas».",
       "en": "Agree with «czas»: **nieokreślony**."
      }
     },
     {
      "npc": "Wynagrodzenie to pięć tysięcy brutto.",
      "npcTr": {
       "uk": "Зарплата — п’ять тисяч брутто.",
       "ru": "Зарплата — пять тысяч брутто.",
       "en": "The salary is five thousand gross."
      },
      "options": [
       {
        "id": "s1o0",
        "text": "A ile to będzie netto, na rękę?",
        "tr": {
         "uk": "А скільки це буде нетто, на руки?",
         "ru": "А сколько это будет нетто, на руки?",
         "en": "And how much is that net, take-home?"
        }
       },
       {
        "id": "s1o1",
        "text": "A ile to będzie brutto, na rękę?",
        "tr": {
         "uk": "(«na rękę» — після податків, тобто **netto**)",
         "ru": "(«na rękę» — после налогов, то есть **netto**)",
         "en": "(«na rękę» means after tax: **netto**)"
        }
       },
       {
        "id": "s1o2",
        "text": "A ile to będzie netto, przed podatkiem?",
        "tr": {
         "uk": "(**netto** — після податку; **przed podatkiem** — це **brutto**)",
         "ru": "(**netto** — после налога; **przed podatkiem** — это **brutto**)",
         "en": "(**netto** is after tax; “przed podatkiem” would be **brutto**)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "**Netto** — «на руки», після податків.",
       "ru": "**Netto** — «на руки», после налогов.",
       "en": "**Netto** = take-home."
      }
     }
    ]
   },
   "explanation": null
  }
 },
 {
  "lesson": "szc-5-port",
  "n": 0,
  "from": {
   "type": "DIALOGUE",
   "skill": "dialogue.port",
   "data": {
    "npc": {
     "name": "Pan Krzysztof",
     "emoji": "👨🏼‍🔧",
     "role": {
      "uk": "бригадир у порту",
      "ru": "бригадир в порту",
      "en": "a foreman at the port"
     }
    },
    "steps": [
     {
      "npc": "Gdzie pan pracował wcześniej?",
      "npcTr": {
       "uk": "Де ви працювали раніше?",
       "ru": "Где вы работали раньше?",
       "en": "Where did you work before?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "W porcie w Gdyni.",
        "tr": {
         "uk": "У порту в Гдині.",
         "ru": "В порту в Гдыне.",
         "en": "At the port in Gdynia."
        }
       },
       {
        "id": "s0o1",
        "text": "W portu w Gdyni.",
        "tr": {
         "uk": "(де? — місцевий: **w porcie**)",
         "ru": "(где? — предложный: **w porcie**)",
         "en": "(where? — locative **w porcie**)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "port → **w porcie**.",
       "ru": "port → **w porcie**.",
       "en": "port → **w porcie**."
      }
     },
     {
      "npc": "Na jakim stanowisku?",
      "npcTr": {
       "uk": "На якій посаді?",
       "ru": "На какой должности?",
       "en": "In what position?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Byłem operatorem dźwigu.",
        "tr": {
         "uk": "Я був кранівником.",
         "ru": "Я был крановщиком.",
         "en": "I was a crane operator."
        }
       },
       {
        "id": "s1o1",
        "text": "Byłem operator dźwigu.",
        "tr": {
         "uk": "(після **być** — орудний: **operatorem**)",
         "ru": "(после **być** — творительный: **operatorem**)",
         "en": "(after **być** use the instrumental)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "**byłem** + орудний: **operatorem**.",
       "ru": "**byłem** + творительный: **operatorem**.",
       "en": "**byłem** + instrumental."
      }
     }
    ]
   },
   "explanation": null
  },
  "to": {
   "type": "DIALOGUE",
   "skill": "dialogue.port",
   "data": {
    "npc": {
     "name": "Pan Krzysztof",
     "emoji": "👨🏼‍🔧",
     "role": {
      "uk": "бригадир у порту",
      "ru": "бригадир в порту",
      "en": "a foreman at the port"
     }
    },
    "steps": [
     {
      "npc": "Gdzie pan pracował wcześniej?",
      "npcTr": {
       "uk": "Де ви працювали раніше?",
       "ru": "Где вы работали раньше?",
       "en": "Where did you work before?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "W porcie w Gdyni.",
        "tr": {
         "uk": "У порту в Гдині.",
         "ru": "В порту в Гдыне.",
         "en": "At the port in Gdynia."
        }
       },
       {
        "id": "s0o1",
        "text": "W portu w Gdyni.",
        "tr": {
         "uk": "(де? — місцевий: **w porcie**)",
         "ru": "(где? — предложный: **w porcie**)",
         "en": "(where? — locative **w porcie**)"
        }
       },
       {
        "id": "s0o2",
        "text": "Do portu w Gdyni.",
        "tr": {
         "uk": "(**gdzie?** — **w porcie**; **do portu** — «до порту», напрямок)",
         "ru": "(**gdzie?** — **w porcie**; **do portu** — «в порт», направление)",
         "en": "(**gdzie?** — **w porcie**; **do portu** means “to the port”, a direction)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "port → **w porcie**.",
       "ru": "port → **w porcie**.",
       "en": "port → **w porcie**."
      }
     },
     {
      "npc": "Na jakim stanowisku?",
      "npcTr": {
       "uk": "На якій посаді?",
       "ru": "На какой должности?",
       "en": "In what position?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Byłem operatorem dźwigu.",
        "tr": {
         "uk": "Я був кранівником.",
         "ru": "Я был крановщиком.",
         "en": "I was a crane operator."
        }
       },
       {
        "id": "s1o1",
        "text": "Byłem operator dźwigu.",
        "tr": {
         "uk": "(після **być** — орудний: **operatorem**)",
         "ru": "(после **być** — творительный: **operatorem**)",
         "en": "(after **być** use the instrumental)"
        }
       },
       {
        "id": "s1o2",
        "text": "Byłem operatorem dźwig.",
        "tr": {
         "uk": "(**operator** + родовий: **dźwigu**)",
         "ru": "(**operator** + родительный: **dźwigu**)",
         "en": "(**operator** takes the genitive: **dźwigu**)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "**byłem** + орудний: **operatorem**.",
       "ru": "**byłem** + творительный: **operatorem**.",
       "en": "**byłem** + instrumental."
      }
     }
    ]
   },
   "explanation": null
  }
 },
 {
  "lesson": "szc-6-moglbys",
  "n": 0,
  "from": {
   "type": "DIALOGUE",
   "skill": "dialogue.colleague",
   "data": {
    "npc": {
     "name": "Marek",
     "emoji": "🧑🏻",
     "role": {
      "uk": "колега по зміні",
      "ru": "коллега по смене",
      "en": "a shift colleague"
     }
    },
    "steps": [
     {
      "npc": "Hej, co tam?",
      "npcTr": {
       "uk": "Гей, як справи?",
       "ru": "Привет, как дела?",
       "en": "Hey, what’s up?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Słuchaj, mógłbyś zamienić się ze mną zmianą w sobotę?",
        "tr": {
         "uk": "Слухай, чи не міг би ти помінятися зі мною зміною в суботу?",
         "ru": "Слушай, не мог бы ты поменяться со мной сменой в субботу?",
         "en": "Listen, could you swap shifts with me on Saturday?"
        }
       },
       {
        "id": "s0o1",
        "text": "Słuchaj, mogłabyś zamienić się ze mną zmianą w sobotę?",
        "tr": {
         "uk": "(Марек — чоловік: **mógłbyś**; «mogłabyś» — до жінки)",
         "ru": "(Марек — мужчина: **mógłbyś**; «mogłabyś» — к женщине)",
         "en": "(Marek is a man: **mógłbyś**)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "До чоловіка — **mógłbyś**, до жінки — **mogłabyś**.",
       "ru": "К мужчине — **mógłbyś**, к женщине — **mogłabyś**.",
       "en": "To a man **mógłbyś**, to a woman **mogłabyś**."
      }
     },
     {
      "npc": "Jasne. A ty wtedy weźmiesz moją niedzielę?",
      "npcTr": {
       "uk": "Звісно. А ти тоді візьмеш мою неділю?",
       "ru": "Конечно. А ты тогда возьмёшь моё воскресенье?",
       "en": "Sure. Will you take my Sunday then?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Pewnie, dzięki wielkie!",
        "tr": {
         "uk": "Звісно, щиро дякую!",
         "ru": "Конечно, большое спасибо!",
         "en": "Sure, thanks a lot!"
        }
       },
       {
        "id": "s1o1",
        "text": "Pewnie, dziękuję panu bardzo!",
        "tr": {
         "uk": "(з колегою на «ти»: **dzięki / dziękuję ci**; «panu» — офіційно)",
         "ru": "(с коллегой на «ты»: **dzięki / dziękuję ci**; «panu» — официально)",
         "en": "(with a colleague say **dzięki**; «panu» is formal)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "З колегою на «ти» — **dzięki!**",
       "ru": "С коллегой на «ты» — **dzięki!**",
       "en": "With a colleague — **dzięki!**"
      }
     }
    ]
   },
   "explanation": null
  },
  "to": {
   "type": "DIALOGUE",
   "skill": "dialogue.colleague",
   "data": {
    "npc": {
     "name": "Marek",
     "emoji": "🧑🏻",
     "role": {
      "uk": "колега по зміні",
      "ru": "коллега по смене",
      "en": "a shift colleague"
     }
    },
    "steps": [
     {
      "npc": "Hej, co tam?",
      "npcTr": {
       "uk": "Гей, як справи?",
       "ru": "Привет, как дела?",
       "en": "Hey, what’s up?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Słuchaj, mógłbyś zamienić się ze mną zmianą w sobotę?",
        "tr": {
         "uk": "Слухай, чи не міг би ти помінятися зі мною зміною в суботу?",
         "ru": "Слушай, не мог бы ты поменяться со мной сменой в субботу?",
         "en": "Listen, could you swap shifts with me on Saturday?"
        }
       },
       {
        "id": "s0o1",
        "text": "Słuchaj, mogłabyś zamienić się ze mną zmianą w sobotę?",
        "tr": {
         "uk": "(Марек — чоловік: **mógłbyś**; «mogłabyś» — до жінки)",
         "ru": "(Марек — мужчина: **mógłbyś**; «mogłabyś» — к женщине)",
         "en": "(Marek is a man: **mógłbyś**)"
        }
       },
       {
        "id": "s0o2",
        "text": "Słuchaj, mógłby pan zamienić się ze mną zmianą w sobotę?",
        "tr": {
         "uk": "(з колегою на «ти»: **mógłbyś**; «mógłby pan» — офіційно)",
         "ru": "(с коллегой на «ты»: **mógłbyś**; «mógłby pan» — официально)",
         "en": "(to a colleague on first-name terms: **mógłbyś**; “mógłby pan” is formal)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "До чоловіка — **mógłbyś**, до жінки — **mogłabyś**.",
       "ru": "К мужчине — **mógłbyś**, к женщине — **mogłabyś**.",
       "en": "To a man **mógłbyś**, to a woman **mogłabyś**."
      }
     },
     {
      "npc": "Jasne. A ty wtedy weźmiesz moją niedzielę?",
      "npcTr": {
       "uk": "Звісно. А ти тоді візьмеш мою неділю?",
       "ru": "Конечно. А ты тогда возьмёшь моё воскресенье?",
       "en": "Sure. Will you take my Sunday then?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Pewnie, dzięki wielkie!",
        "tr": {
         "uk": "Звісно, щиро дякую!",
         "ru": "Конечно, большое спасибо!",
         "en": "Sure, thanks a lot!"
        }
       },
       {
        "id": "s1o1",
        "text": "Pewnie, dziękuję panu bardzo!",
        "tr": {
         "uk": "(з колегою на «ти»: **dzięki / dziękuję ci**; «panu» — офіційно)",
         "ru": "(с коллегой на «ты»: **dzięki / dziękuję ci**; «panu» — официально)",
         "en": "(with a colleague say **dzięki**; «panu» is formal)"
        }
       },
       {
        "id": "s1o2",
        "text": "Pewnie, dzięki wielki!",
        "tr": {
         "uk": "(**dzięki** — множина: **dzięki wielkie**)",
         "ru": "(**dzięki** — множественное число: **dzięki wielkie**)",
         "en": "(**dzięki** is plural: **dzięki wielkie**)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "З колегою на «ти» — **dzięki!**",
       "ru": "С коллегой на «ты» — **dzięki!**",
       "en": "With a colleague — **dzięki!**"
      }
     }
    ]
   },
   "explanation": null
  }
 },
 {
  "lesson": "szc-7-spoznienie",
  "n": 0,
  "from": {
   "type": "DIALOGUE",
   "skill": "dialogue.late",
   "data": {
    "npc": {
     "name": "Pan Krzysztof",
     "emoji": "👨🏼‍🔧",
     "role": {
      "uk": "бригадир у порту",
      "ru": "бригадир в порту",
      "en": "a foreman at the port"
     }
    },
    "steps": [
     {
      "npc": "Halo, Krzysztof, słucham.",
      "npcTr": {
       "uk": "Алло, Кшиштоф, слухаю.",
       "ru": "Алло, Кшиштоф, слушаю.",
       "en": "Hello, Krzysztof speaking."
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Dzień dobry, tu Bobek. Spóźnię się dwadzieścia minut, bo tramwaj stoi.",
        "tr": {
         "uk": "Добрий день, це Бобек. Я спізнюся на двадцять хвилин, бо трамвай стоїть.",
         "ru": "Добрый день, это Бобек. Я опоздаю на двадцать минут, потому что трамвай стоит.",
         "en": "Hello, it’s Bobek. I’ll be twenty minutes late, the tram is stuck."
        }
       },
       {
        "id": "s0o1",
        "text": "Dzień dobry, tu Bobek. Spóźniłem się dwadzieścia minut, bo tramwaj stoi.",
        "tr": {
         "uk": "(ти ще в дорозі — майбутнє: **spóźnię się**)",
         "ru": "(ты ещё в пути — будущее: **spóźnię się**)",
         "en": "(you’re still on your way: **spóźnię się**)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "Ще не прийшов — **spóźnię się** (майбутнє).",
       "ru": "Ещё не пришёл — **spóźnię się** (будущее).",
       "en": "Not there yet: **spóźnię się**."
      }
     },
     {
      "npc": "Dobrze, dzięki, że dzwonisz.",
      "npcTr": {
       "uk": "Добре, дякую, що дзвониш.",
       "ru": "Хорошо, спасибо, что звонишь.",
       "en": "OK, thanks for calling."
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Przepraszam za spóźnienie!",
        "tr": {
         "uk": "Вибачте за спізнення!",
         "ru": "Извините за опоздание!",
         "en": "Sorry for being late!"
        }
       },
       {
        "id": "s1o1",
        "text": "Przepraszam za spóźnieniem!",
        "tr": {
         "uk": "(**za** + знахідний: za **spóźnienie**)",
         "ru": "(**za** + винительный: za **spóźnienie**)",
         "en": "(**za** + accusative)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "przepraszam **za** + знахідний: za **spóźnienie**.",
       "ru": "przepraszam **za** + винительный: za **spóźnienie**.",
       "en": "przepraszam **za spóźnienie**."
      }
     }
    ]
   },
   "explanation": null
  },
  "to": {
   "type": "DIALOGUE",
   "skill": "dialogue.late",
   "data": {
    "npc": {
     "name": "Pan Krzysztof",
     "emoji": "👨🏼‍🔧",
     "role": {
      "uk": "бригадир у порту",
      "ru": "бригадир в порту",
      "en": "a foreman at the port"
     }
    },
    "steps": [
     {
      "npc": "Halo, Krzysztof, słucham.",
      "npcTr": {
       "uk": "Алло, Кшиштоф, слухаю.",
       "ru": "Алло, Кшиштоф, слушаю.",
       "en": "Hello, Krzysztof speaking."
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Dzień dobry, tu Bobek. Spóźnię się dwadzieścia minut, bo tramwaj stoi.",
        "tr": {
         "uk": "Добрий день, це Бобек. Я спізнюся на двадцять хвилин, бо трамвай стоїть.",
         "ru": "Добрый день, это Бобек. Я опоздаю на двадцать минут, потому что трамвай стоит.",
         "en": "Hello, it’s Bobek. I’ll be twenty minutes late, the tram is stuck."
        }
       },
       {
        "id": "s0o1",
        "text": "Dzień dobry, tu Bobek. Spóźniłem się dwadzieścia minut, bo tramwaj stoi.",
        "tr": {
         "uk": "(ти ще в дорозі — майбутнє: **spóźnię się**)",
         "ru": "(ты ещё в пути — будущее: **spóźnię się**)",
         "en": "(you’re still on your way: **spóźnię się**)"
        }
       },
       {
        "id": "s0o2",
        "text": "Siema, tu Bobek. Spóźnię się dwadzieścia minut, bo tramwaj stoi.",
        "tr": {
         "uk": "(**siema** — для друзів; керівникові — **dzień dobry**)",
         "ru": "(**siema** — для друзей; руководителю — **dzień dobry**)",
         "en": "(**siema** is for friends; to a manager say **dzień dobry**)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "Ще не прийшов — **spóźnię się** (майбутнє).",
       "ru": "Ещё не пришёл — **spóźnię się** (будущее).",
       "en": "Not there yet: **spóźnię się**."
      }
     },
     {
      "npc": "Dobrze, dzięki, że dzwonisz.",
      "npcTr": {
       "uk": "Добре, дякую, що дзвониш.",
       "ru": "Хорошо, спасибо, что звонишь.",
       "en": "OK, thanks for calling."
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Przepraszam za spóźnienie!",
        "tr": {
         "uk": "Вибачте за спізнення!",
         "ru": "Извините за опоздание!",
         "en": "Sorry for being late!"
        }
       },
       {
        "id": "s1o1",
        "text": "Przepraszam za spóźnieniem!",
        "tr": {
         "uk": "(**za** + знахідний: za **spóźnienie**)",
         "ru": "(**za** + винительный: za **spóźnienie**)",
         "en": "(**za** + accusative)"
        }
       },
       {
        "id": "s1o2",
        "text": "Przepraszam na spóźnienie!",
        "tr": {
         "uk": "(**przepraszać za** + знахідний: za **spóźnienie**)",
         "ru": "(**przepraszać za** + винительный: za **spóźnienie**)",
         "en": "(**przepraszać za** + accusative: za **spóźnienie**)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "przepraszam **za** + знахідний: za **spóźnienie**.",
       "ru": "przepraszam **za** + винительный: za **spóźnienie**.",
       "en": "przepraszam **za spóźnienie**."
      }
     }
    ]
   },
   "explanation": null
  }
 },
 {
  "lesson": "szc-8-podwyzka",
  "n": 0,
  "from": {
   "type": "DIALOGUE",
   "skill": "dialogue.raise",
   "data": {
    "npc": {
     "name": "Pani Beata",
     "emoji": "👩🏻‍💼",
     "role": {
      "uk": "менеджерка з персоналу",
      "ru": "менеджер по персоналу",
      "en": "an HR manager"
     }
    },
    "steps": [
     {
      "npc": "Słucham pana, o co chodzi?",
      "npcTr": {
       "uk": "Слухаю вас, у чому справа?",
       "ru": "Слушаю вас, в чём дело?",
       "en": "Yes, what is it about?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Chciałbym porozmawiać o podwyżce.",
        "tr": {
         "uk": "Я хотів би поговорити про підвищення зарплати.",
         "ru": "Я хотел бы поговорить о повышении зарплаты.",
         "en": "I’d like to talk about a pay rise."
        }
       },
       {
        "id": "s0o1",
        "text": "Chciałbym porozmawiać o podwyżka.",
        "tr": {
         "uk": "(**o** + місцевий: **o podwyżce**)",
         "ru": "(**o** + предложный: **o podwyżce**)",
         "en": "(**o** + locative: **o podwyżce**)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "rozmawiać **o** + місцевий: o **podwyżce**.",
       "ru": "rozmawiać **o** + предложный: o **podwyżce**.",
       "en": "rozmawiać o + locative."
      }
     },
     {
      "npc": "Rozumiem. A woli pan zostać na nocnej zmianie?",
      "npcTr": {
       "uk": "Зрозуміло. А ви волієте лишитися на нічній зміні?",
       "ru": "Понятно. А вы предпочитаете остаться в ночную смену?",
       "en": "I see. Do you prefer to stay on nights?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Wolałbym pracować na zmianie dziennej.",
        "tr": {
         "uk": "Я волів би працювати на денній зміні.",
         "ru": "Я предпочёл бы работать в дневную смену.",
         "en": "I’d rather work days."
        }
       },
       {
        "id": "s1o1",
        "text": "Wolałbym pracuję na zmianie dziennej.",
        "tr": {
         "uk": "(після **wolałbym** — інфінітив: pracować)",
         "ru": "(после **wolałbym** — инфинитив: pracować)",
         "en": "(after **wolałbym** use the infinitive)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "**wolałbym** + інфінітив.",
       "ru": "**wolałbym** + инфинитив.",
       "en": "**wolałbym** + infinitive."
      }
     }
    ]
   },
   "explanation": null
  },
  "to": {
   "type": "DIALOGUE",
   "skill": "dialogue.raise",
   "data": {
    "npc": {
     "name": "Pani Beata",
     "emoji": "👩🏻‍💼",
     "role": {
      "uk": "менеджерка з персоналу",
      "ru": "менеджер по персоналу",
      "en": "an HR manager"
     }
    },
    "steps": [
     {
      "npc": "Słucham pana, o co chodzi?",
      "npcTr": {
       "uk": "Слухаю вас, у чому справа?",
       "ru": "Слушаю вас, в чём дело?",
       "en": "Yes, what is it about?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Chciałbym porozmawiać o podwyżce.",
        "tr": {
         "uk": "Я хотів би поговорити про підвищення зарплати.",
         "ru": "Я хотел бы поговорить о повышении зарплаты.",
         "en": "I’d like to talk about a pay rise."
        }
       },
       {
        "id": "s0o1",
        "text": "Chciałbym porozmawiać o podwyżka.",
        "tr": {
         "uk": "(**o** + місцевий: **o podwyżce**)",
         "ru": "(**o** + предложный: **o podwyżce**)",
         "en": "(**o** + locative: **o podwyżce**)"
        }
       },
       {
        "id": "s0o2",
        "text": "Chciałbym porozmawiać z podwyżką.",
        "tr": {
         "uk": "(поговорити **про** що — **o podwyżce**; **z podwyżką** — «з підвищенням»)",
         "ru": "(поговорить **о** чём — **o podwyżce**; **z podwyżką** — «с повышением»)",
         "en": "(to talk **about** something — **o podwyżce**; **z podwyżką** means “with a raise”)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "rozmawiać **o** + місцевий: o **podwyżce**.",
       "ru": "rozmawiać **o** + предложный: o **podwyżce**.",
       "en": "rozmawiać o + locative."
      }
     },
     {
      "npc": "Rozumiem. A woli pan zostać na nocnej zmianie?",
      "npcTr": {
       "uk": "Зрозуміло. А ви волієте лишитися на нічній зміні?",
       "ru": "Понятно. А вы предпочитаете остаться в ночную смену?",
       "en": "I see. Do you prefer to stay on nights?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Wolałbym pracować na zmianie dziennej.",
        "tr": {
         "uk": "Я волів би працювати на денній зміні.",
         "ru": "Я предпочёл бы работать в дневную смену.",
         "en": "I’d rather work days."
        }
       },
       {
        "id": "s1o1",
        "text": "Wolałbym pracuję na zmianie dziennej.",
        "tr": {
         "uk": "(після **wolałbym** — інфінітив: pracować)",
         "ru": "(после **wolałbym** — инфинитив: pracować)",
         "en": "(after **wolałbym** use the infinitive)"
        }
       },
       {
        "id": "s1o2",
        "text": "Wolałbym pracować na zmianie dzienna.",
        "tr": {
         "uk": "(**na** + місцевий: na zmianie **dziennej**)",
         "ru": "(**na** + предложный: na zmianie **dziennej**)",
         "en": "(**na** + locative: na zmianie **dziennej**)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "**wolałbym** + інфінітив.",
       "ru": "**wolałbym** + инфинитив.",
       "en": "**wolałbym** + infinitive."
      }
     }
    ]
   },
   "explanation": null
  }
 },
 {
  "lesson": "szc-boss",
  "n": 0,
  "from": {
   "type": "SITUATION",
   "skill": "situation.boss",
   "data": {
    "npc": {
     "name": "Pani Beata",
     "emoji": "👩🏻‍💼",
     "role": {
      "uk": "менеджерка з персоналу",
      "ru": "менеджер по персоналу",
      "en": "an HR manager"
     }
    },
    "scene": {
     "uk": "Відділ кадрів у щецинському порту",
     "ru": "Отдел кадров в щецинском порту",
     "en": "The HR office at Szczecin port"
    },
    "steps": [
     {
      "npc": "Witam! Pan Bobek, kandydat na operatora dźwigu?",
      "npcTr": {
       "uk": "Вітаю! Пан Бобек, кандидат на кранівника?",
       "ru": "Здравствуйте! Пан Бобек, кандидат в крановщики?",
       "en": "Hello! Mr Bobek, applying for crane operator?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Tak, dzień dobry. Miło mi.",
        "tr": {
         "uk": "Так, добрий день. Приємно познайомитися.",
         "ru": "Да, добрый день. Приятно познакомиться.",
         "en": "Yes, good morning. Nice to meet you."
        }
       },
       {
        "id": "s0o1",
        "text": "Tak, siema! Miło mi.",
        "tr": {
         "uk": "(«siema» — для друзів; на співбесіді — **dzień dobry**)",
         "ru": "(«siema» — для друзей; на собеседовании — **dzień dobry**)",
         "en": "(«siema» is for friends)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "На співбесіді — офіційно: **Dzień dobry**.",
       "ru": "На собеседовании — официально: **Dzień dobry**.",
       "en": "Be formal: **Dzień dobry**."
      }
     },
     {
      "npc": "Gdzie pan pracował wcześniej?",
      "npcTr": {
       "uk": "Де ви працювали раніше?",
       "ru": "Где вы работали раньше?",
       "en": "Where did you work before?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Przez dwa lata w porcie w Gdyni.",
        "tr": {
         "uk": "Два роки в порту в Гдині.",
         "ru": "Два года в порту в Гдыне.",
         "en": "Two years at the port in Gdynia."
        }
       },
       {
        "id": "s1o1",
        "text": "Przez dwa lata w port w Gdyni.",
        "tr": {
         "uk": "(де? — **w porcie**)",
         "ru": "(где? — **w porcie**)",
         "en": "(where? — **w porcie**)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "port → **w porcie**.",
       "ru": "port → **w porcie**.",
       "en": "port → **w porcie**."
      }
     }
    ]
   },
   "explanation": null
  },
  "to": {
   "type": "SITUATION",
   "skill": "situation.boss",
   "data": {
    "npc": {
     "name": "Pani Beata",
     "emoji": "👩🏻‍💼",
     "role": {
      "uk": "менеджерка з персоналу",
      "ru": "менеджер по персоналу",
      "en": "an HR manager"
     }
    },
    "scene": {
     "uk": "Відділ кадрів у щецинському порту",
     "ru": "Отдел кадров в щецинском порту",
     "en": "The HR office at Szczecin port"
    },
    "steps": [
     {
      "npc": "Witam! Pan Bobek, kandydat na operatora dźwigu?",
      "npcTr": {
       "uk": "Вітаю! Пан Бобек, кандидат на кранівника?",
       "ru": "Здравствуйте! Пан Бобек, кандидат в крановщики?",
       "en": "Hello! Mr Bobek, applying for crane operator?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Tak, dzień dobry. Miło mi.",
        "tr": {
         "uk": "Так, добрий день. Приємно познайомитися.",
         "ru": "Да, добрый день. Приятно познакомиться.",
         "en": "Yes, good morning. Nice to meet you."
        }
       },
       {
        "id": "s0o1",
        "text": "Tak, siema! Miło mi.",
        "tr": {
         "uk": "(«siema» — для друзів; на співбесіді — **dzień dobry**)",
         "ru": "(«siema» — для друзей; на собеседовании — **dzień dobry**)",
         "en": "(«siema» is for friends)"
        }
       },
       {
        "id": "s0o2",
        "text": "Tak, dzień dobry. Do widzenia.",
        "tr": {
         "uk": "(**Do widzenia** — прощання; при зустрічі — **dzień dobry**, **miło mi**)",
         "ru": "(**Do widzenia** — прощание; при встрече — **dzień dobry**, **miło mi**)",
         "en": "(**Do widzenia** is a farewell; when meeting say **dzień dobry**, **miło mi**)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "На співбесіді — офіційно: **Dzień dobry**.",
       "ru": "На собеседовании — официально: **Dzień dobry**.",
       "en": "Be formal: **Dzień dobry**."
      }
     },
     {
      "npc": "Gdzie pan pracował wcześniej?",
      "npcTr": {
       "uk": "Де ви працювали раніше?",
       "ru": "Где вы работали раньше?",
       "en": "Where did you work before?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Przez dwa lata w porcie w Gdyni.",
        "tr": {
         "uk": "Два роки в порту в Гдині.",
         "ru": "Два года в порту в Гдыне.",
         "en": "Two years at the port in Gdynia."
        }
       },
       {
        "id": "s1o1",
        "text": "Przez dwa lata w port w Gdyni.",
        "tr": {
         "uk": "(де? — **w porcie**)",
         "ru": "(где? — **w porcie**)",
         "en": "(where? — **w porcie**)"
        }
       },
       {
        "id": "s1o2",
        "text": "Od dwóch lat w porcie w Gdyni.",
        "tr": {
         "uk": "(**od dwóch lat** — «вже два роки й досі»; про минуле місце — **przez dwa lata**)",
         "ru": "(**od dwóch lat** — «уже два года и до сих пор»; о прежнем месте — **przez dwa lata**)",
         "en": "(**od dwóch lat** means “for two years and still”; about a previous job — **przez dwa lata**)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "port → **w porcie**.",
       "ru": "port → **w porcie**.",
       "en": "port → **w porcie**."
      }
     }
    ]
   },
   "explanation": null
  }
 },
 {
  "lesson": "gda-1-pociag",
  "n": 0,
  "from": {
   "type": "DIALOGUE",
   "skill": "dialogue.train",
   "data": {
    "npc": {
     "name": "Kasjerka PKP",
     "emoji": "👩🏻‍💼",
     "role": {
      "uk": "касирка на вокзалі",
      "ru": "кассир на вокзале",
      "en": "a ticket clerk"
     }
    },
    "steps": [
     {
      "npc": "Dzień dobry, dokąd?",
      "npcTr": {
       "uk": "Добрий день, куди?",
       "ru": "Добрый день, куда?",
       "en": "Good morning, where to?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Do Gdańska Głównego, na jutro rano.",
        "tr": {
         "uk": "До Гданська Головного, на завтра вранці.",
         "ru": "До Гданьска Главного, на завтра утром.",
         "en": "To Gdańsk Główny, tomorrow morning."
        }
       },
       {
        "id": "s0o1",
        "text": "Do Gdańsk Główny, na jutro rano.",
        "tr": {
         "uk": "(куди? — **do** + родовий: do **Gdańska Głównego**)",
         "ru": "(куда? — **do** + родительный: do **Gdańska Głównego**)",
         "en": "(**do** + genitive: **Gdańska Głównego**)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "**do** + родовий: do **Gdańska Głównego**.",
       "ru": "**do** + родительный: do **Gdańska Głównego**.",
       "en": "**do** + genitive."
      }
     },
     {
      "npc": "Odjazd o ósmej dziesięć z peronu drugiego.",
      "npcTr": {
       "uk": "Відправлення о восьмій десять з другої платформи.",
       "ru": "Отправление в восемь десять со второй платформы.",
       "en": "Departure at 8:10 from platform two."
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Przepraszam, z którego peronu?",
        "tr": {
         "uk": "Перепрошую, з якої платформи?",
         "ru": "Извините, с какой платформы?",
         "en": "Sorry, which platform?"
        }
       },
       {
        "id": "s1o1",
        "text": "Przepraszam, z który peron?",
        "tr": {
         "uk": "(**z** + родовий: z **którego peronu**?)",
         "ru": "(**z** + родительный: z **którego peronu**?)",
         "en": "(**z** + genitive)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "**z którego peronu?** — з якої платформи?",
       "ru": "**z którego peronu?** — с какой платформы?",
       "en": "**z którego peronu?**"
      }
     }
    ]
   },
   "explanation": null
  },
  "to": {
   "type": "DIALOGUE",
   "skill": "dialogue.train",
   "data": {
    "npc": {
     "name": "Kasjerka PKP",
     "emoji": "👩🏻‍💼",
     "role": {
      "uk": "касирка на вокзалі",
      "ru": "кассир на вокзале",
      "en": "a ticket clerk"
     }
    },
    "steps": [
     {
      "npc": "Dzień dobry, dokąd?",
      "npcTr": {
       "uk": "Добрий день, куди?",
       "ru": "Добрый день, куда?",
       "en": "Good morning, where to?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Do Gdańska Głównego, na jutro rano.",
        "tr": {
         "uk": "До Гданська Головного, на завтра вранці.",
         "ru": "До Гданьска Главного, на завтра утром.",
         "en": "To Gdańsk Główny, tomorrow morning."
        }
       },
       {
        "id": "s0o1",
        "text": "Do Gdańsk Główny, na jutro rano.",
        "tr": {
         "uk": "(куди? — **do** + родовий: do **Gdańska Głównego**)",
         "ru": "(куда? — **do** + родительный: do **Gdańska Głównego**)",
         "en": "(**do** + genitive: **Gdańska Głównego**)"
        }
       },
       {
        "id": "s0o2",
        "text": "Z Gdańska Głównego, na jutro rano.",
        "tr": {
         "uk": "(**z** + родовий — «звідки»; на «dokąd?» — **do** Gdańska)",
         "ru": "(**z** + родительный — «откуда»; на «dokąd?» — **do** Gdańska)",
         "en": "(**z** + genitive means “from”; for “dokąd?” use **do** Gdańska)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "**do** + родовий: do **Gdańska Głównego**.",
       "ru": "**do** + родительный: do **Gdańska Głównego**.",
       "en": "**do** + genitive."
      }
     },
     {
      "npc": "Odjazd o ósmej dziesięć z peronu drugiego.",
      "npcTr": {
       "uk": "Відправлення о восьмій десять з другої платформи.",
       "ru": "Отправление в восемь десять со второй платформы.",
       "en": "Departure at 8:10 from platform two."
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Przepraszam, z którego peronu?",
        "tr": {
         "uk": "Перепрошую, з якої платформи?",
         "ru": "Извините, с какой платформы?",
         "en": "Sorry, which platform?"
        }
       },
       {
        "id": "s1o1",
        "text": "Przepraszam, z który peron?",
        "tr": {
         "uk": "(**z** + родовий: z **którego peronu**?)",
         "ru": "(**z** + родительный: z **którego peronu**?)",
         "en": "(**z** + genitive)"
        }
       },
       {
        "id": "s1o2",
        "text": "Przepraszam, do którego peronu?",
        "tr": {
         "uk": "(**z** peronu — відправлення з платформи; **do** — «до», тобто йти до платформи)",
         "ru": "(**z** peronu — отправление с платформы; **do** — «к», то есть идти к платформе)",
         "en": "(**z** peronu means the train leaves from the platform; **do** means “to”)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "**z którego peronu?** — з якої платформи?",
       "ru": "**z którego peronu?** — с какой платформы?",
       "en": "**z którego peronu?**"
      }
     }
    ]
   },
   "explanation": null
  }
 },
 {
  "lesson": "gda-2-nocleg",
  "n": 0,
  "from": {
   "type": "DIALOGUE",
   "skill": "dialogue.booking",
   "data": {
    "npc": {
     "name": "Pani Ola",
     "emoji": "👩🏼‍💼",
     "role": {
      "uk": "адміністраторка готелю",
      "ru": "администратор гостиницы",
      "en": "a hotel receptionist"
     }
    },
    "steps": [
     {
      "npc": "Hotel „Bursztyn”, dzień dobry. W czym mogę pomóc?",
      "npcTr": {
       "uk": "Готель «Бурштин», добрий день. Чим можу допомогти?",
       "ru": "Отель «Янтарь», добрый день. Чем могу помочь?",
       "en": "Hotel Bursztyn, good morning. How can I help?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Dzień dobry, chciałbym zarezerwować pokój na trzy noce.",
        "tr": {
         "uk": "Добрий день, я хотів би забронювати номер на три ночі.",
         "ru": "Добрый день, я хотел бы забронировать номер на три ночи.",
         "en": "Hello, I’d like to book a room for three nights."
        }
       },
       {
        "id": "s0o1",
        "text": "Dzień dobry, chciałbym zarezerwować pokój na trzy nocy.",
        "tr": {
         "uk": "(2–4 — **noce**; «nocy» — після 5 і більше)",
         "ru": "(2–4 — **noce**; «nocy» — после 5 и больше)",
         "en": "(2–4: **noce**; «nocy» after 5+)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "**na trzy noce**, але **na pięć nocy**.",
       "ru": "**na trzy noce**, но **na pięć nocy**.",
       "en": "**trzy noce**, **pięć nocy**."
      }
     },
     {
      "npc": "Od kiedy do kiedy?",
      "npcTr": {
       "uk": "З якого по який день?",
       "ru": "С какого по какой день?",
       "en": "From when to when?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Od piątku do poniedziałku.",
        "tr": {
         "uk": "З п’ятниці до понеділка.",
         "ru": "С пятницы до понедельника.",
         "en": "From Friday to Monday."
        }
       },
       {
        "id": "s1o1",
        "text": "Od piątek do poniedziałek.",
        "tr": {
         "uk": "(**od / do** + родовий: od **piątku** do **poniedziałku**)",
         "ru": "(**od / do** + родительный: od **piątku** do **poniedziałku**)",
         "en": "(**od / do** + genitive)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "**od** piątku **do** poniedziałku — родовий.",
       "ru": "**od** piątku **do** poniedziałku — родительный.",
       "en": "Genitive after od / do."
      }
     }
    ]
   },
   "explanation": null
  },
  "to": {
   "type": "DIALOGUE",
   "skill": "dialogue.booking",
   "data": {
    "npc": {
     "name": "Pani Ola",
     "emoji": "👩🏼‍💼",
     "role": {
      "uk": "адміністраторка готелю",
      "ru": "администратор гостиницы",
      "en": "a hotel receptionist"
     }
    },
    "steps": [
     {
      "npc": "Hotel „Bursztyn”, dzień dobry. W czym mogę pomóc?",
      "npcTr": {
       "uk": "Готель «Бурштин», добрий день. Чим можу допомогти?",
       "ru": "Отель «Янтарь», добрый день. Чем могу помочь?",
       "en": "Hotel Bursztyn, good morning. How can I help?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Dzień dobry, chciałbym zarezerwować pokój na trzy noce.",
        "tr": {
         "uk": "Добрий день, я хотів би забронювати номер на три ночі.",
         "ru": "Добрый день, я хотел бы забронировать номер на три ночи.",
         "en": "Hello, I’d like to book a room for three nights."
        }
       },
       {
        "id": "s0o1",
        "text": "Dzień dobry, chciałbym zarezerwować pokój na trzy nocy.",
        "tr": {
         "uk": "(2–4 — **noce**; «nocy» — після 5 і більше)",
         "ru": "(2–4 — **noce**; «nocy» — после 5 и больше)",
         "en": "(2–4: **noce**; «nocy» after 5+)"
        }
       },
       {
        "id": "s0o2",
        "text": "Dzień dobry, chciałbym zarezerwować pokoju na trzy noce.",
        "tr": {
         "uk": "(**zarezerwować** + знахідний: **pokój**, а не родовий)",
         "ru": "(**zarezerwować** + винительный: **pokój**, а не родительный)",
         "en": "(**zarezerwować** takes the accusative: **pokój**, not the genitive)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "**na trzy noce**, але **na pięć nocy**.",
       "ru": "**na trzy noce**, но **na pięć nocy**.",
       "en": "**trzy noce**, **pięć nocy**."
      }
     },
     {
      "npc": "Od kiedy do kiedy?",
      "npcTr": {
       "uk": "З якого по який день?",
       "ru": "С какого по какой день?",
       "en": "From when to when?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Od piątku do poniedziałku.",
        "tr": {
         "uk": "З п’ятниці до понеділка.",
         "ru": "С пятницы до понедельника.",
         "en": "From Friday to Monday."
        }
       },
       {
        "id": "s1o1",
        "text": "Od piątek do poniedziałek.",
        "tr": {
         "uk": "(**od / do** + родовий: od **piątku** do **poniedziałku**)",
         "ru": "(**od / do** + родительный: od **piątku** do **poniedziałku**)",
         "en": "(**od / do** + genitive)"
        }
       },
       {
        "id": "s1o2",
        "text": "Dla trzech osób.",
        "tr": {
         "uk": "(це відповідь на «dla ilu osób?»; на «od kiedy do kiedy?» називають дати)",
         "ru": "(это ответ на «dla ilu osób?»; на «od kiedy do kiedy?» называют даты)",
         "en": "(that answers “dla ilu osób?”; “od kiedy do kiedy?” asks for dates)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "**od** piątku **do** poniedziałku — родовий.",
       "ru": "**od** piątku **do** poniedziałku — родительный.",
       "en": "Genitive after od / do."
      }
     }
    ]
   },
   "explanation": null
  }
 },
 {
  "lesson": "gda-3-warto",
  "n": 0,
  "from": {
   "type": "DIALOGUE",
   "skill": "dialogue.sights",
   "data": {
    "npc": {
     "name": "Pan Jacek",
     "emoji": "🧔🏻",
     "role": {
      "uk": "гід по Гданську",
      "ru": "гид по Гданьску",
      "en": "a Gdańsk tour guide"
     }
    },
    "steps": [
     {
      "npc": "Mamy tylko jeden dzień. Co chce pan zobaczyć?",
      "npcTr": {
       "uk": "У нас лише один день. Що ви хочете побачити?",
       "ru": "У нас только один день. Что вы хотите увидеть?",
       "en": "We only have one day. What would you like to see?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "A co pan poleca? Co warto zobaczyć?",
        "tr": {
         "uk": "А що ви порадите? Що варто побачити?",
         "ru": "А что вы посоветуете? Что стоит увидеть?",
         "en": "What do you recommend? What’s worth seeing?"
        }
       },
       {
        "id": "s0o1",
        "text": "A co pan poleca? Co warto zobaczę?",
        "tr": {
         "uk": "(після **warto** — інфінітив: warto **zobaczyć**)",
         "ru": "(после **warto** — инфинитив: warto **zobaczyć**)",
         "en": "(after **warto** use the infinitive)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "**warto** + інфінітив.",
       "ru": "**warto** + инфинитив.",
       "en": "**warto** + infinitive."
      }
     },
     {
      "npc": "Najpierw Długi Targ i fontannę Neptuna. To najpiękniejsza ulica w Gdańsku.",
      "npcTr": {
       "uk": "Спочатку Довгий Торг і фонтан Нептуна. Це найгарніша вулиця в Гданську.",
       "ru": "Сначала Длинный рынок и фонтан Нептуна. Это самая красивая улица в Гданьске.",
       "en": "First Długi Targ and the Neptune Fountain. It’s the most beautiful street in Gdańsk."
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Super! A gdzie jest najlepszy widok na miasto?",
        "tr": {
         "uk": "Супер! А звідки найкращий вид на місто?",
         "ru": "Супер! А откуда лучший вид на город?",
         "en": "Great! And where’s the best view of the town?"
        }
       },
       {
        "id": "s1o1",
        "text": "Super! A gdzie jest najdobry widok na miasto?",
        "tr": {
         "uk": "(dobry → **najlepszy**: неправильна форма)",
         "ru": "(dobry → **najlepszy**: неправильная форма)",
         "en": "(dobry → **najlepszy**)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "dobry → lepszy → **najlepszy**.",
       "ru": "dobry → lepszy → **najlepszy**.",
       "en": "dobry → **najlepszy**."
      }
     }
    ]
   },
   "explanation": null
  },
  "to": {
   "type": "DIALOGUE",
   "skill": "dialogue.sights",
   "data": {
    "npc": {
     "name": "Pan Jacek",
     "emoji": "🧔🏻",
     "role": {
      "uk": "гід по Гданську",
      "ru": "гид по Гданьску",
      "en": "a Gdańsk tour guide"
     }
    },
    "steps": [
     {
      "npc": "Mamy tylko jeden dzień. Co chce pan zobaczyć?",
      "npcTr": {
       "uk": "У нас лише один день. Що ви хочете побачити?",
       "ru": "У нас только один день. Что вы хотите увидеть?",
       "en": "We only have one day. What would you like to see?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "A co pan poleca? Co warto zobaczyć?",
        "tr": {
         "uk": "А що ви порадите? Що варто побачити?",
         "ru": "А что вы посоветуете? Что стоит увидеть?",
         "en": "What do you recommend? What’s worth seeing?"
        }
       },
       {
        "id": "s0o1",
        "text": "A co pan poleca? Co warto zobaczę?",
        "tr": {
         "uk": "(після **warto** — інфінітив: warto **zobaczyć**)",
         "ru": "(после **warto** — инфинитив: warto **zobaczyć**)",
         "en": "(after **warto** use the infinitive)"
        }
       },
       {
        "id": "s0o2",
        "text": "A co pan polecił? Co warto było zobaczyć?",
        "tr": {
         "uk": "(минулий час, а ви плануєте сьогодні: **poleca**, **warto zobaczyć**)",
         "ru": "(прошедшее время, а вы планируете сегодня: **poleca**, **warto zobaczyć**)",
         "en": "(past tense, but you are planning today: **poleca**, **warto zobaczyć**)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "**warto** + інфінітив.",
       "ru": "**warto** + инфинитив.",
       "en": "**warto** + infinitive."
      }
     },
     {
      "npc": "Najpierw Długi Targ i fontannę Neptuna. To najpiękniejsza ulica w Gdańsku.",
      "npcTr": {
       "uk": "Спочатку Довгий Торг і фонтан Нептуна. Це найгарніша вулиця в Гданську.",
       "ru": "Сначала Длинный рынок и фонтан Нептуна. Это самая красивая улица в Гданьске.",
       "en": "First Długi Targ and the Neptune Fountain. It’s the most beautiful street in Gdańsk."
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Super! A gdzie jest najlepszy widok na miasto?",
        "tr": {
         "uk": "Супер! А звідки найкращий вид на місто?",
         "ru": "Супер! А откуда лучший вид на город?",
         "en": "Great! And where’s the best view of the town?"
        }
       },
       {
        "id": "s1o1",
        "text": "Super! A gdzie jest najdobry widok na miasto?",
        "tr": {
         "uk": "(dobry → **najlepszy**: неправильна форма)",
         "ru": "(dobry → **najlepszy**: неправильная форма)",
         "en": "(dobry → **najlepszy**)"
        }
       },
       {
        "id": "s1o2",
        "text": "Super! A gdzie jest najlepsze widok na miasto?",
        "tr": {
         "uk": "(**widok** — чоловічий рід: **najlepszy widok**)",
         "ru": "(**widok** — мужской род: **najlepszy widok**)",
         "en": "(**widok** is masculine: **najlepszy widok**)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "dobry → lepszy → **najlepszy**.",
       "ru": "dobry → lepszy → **najlepszy**.",
       "en": "dobry → **najlepszy**."
      }
     }
    ]
   },
   "explanation": null
  }
 },
 {
  "lesson": "gda-4-plaza",
  "n": 0,
  "from": {
   "type": "DIALOGUE",
   "skill": "dialogue.beach",
   "data": {
    "npc": {
     "name": "Kasia",
     "emoji": "👩🏻",
     "role": {
      "uk": "подруга з Гдині",
      "ru": "подруга из Гдыни",
      "en": "a friend from Gdynia"
     }
    },
    "steps": [
     {
      "npc": "Idziemy się kąpać?",
      "npcTr": {
       "uk": "Ідемо купатися?",
       "ru": "Идём купаться?",
       "en": "Shall we go for a swim?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Nie teraz, wisi czerwona flaga.",
        "tr": {
         "uk": "Не зараз, висить червоний прапор.",
         "ru": "Не сейчас, висит красный флаг.",
         "en": "Not now, the red flag is up."
        }
       },
       {
        "id": "s0o1",
        "text": "Nie teraz, wisi biała flaga.",
        "tr": {
         "uk": "(біла — купатися **можна**; заборона — при **червоній**)",
         "ru": "(белый — купаться **можно**; запрет — при **красном**)",
         "en": "(white means swimming is allowed)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "**Czerwona flaga** — купатися не можна.",
       "ru": "**Czerwona flaga** — купаться нельзя.",
       "en": "**Czerwona flaga** — no swimming."
      }
     },
     {
      "npc": "To może poopalamy się na plaży?",
      "npcTr": {
       "uk": "То, може, позасмагаємо на пляжі?",
       "ru": "Тогда, может, позагораем на пляже?",
       "en": "Then maybe we’ll sunbathe on the beach?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Dobrze, ale najpierw krem z filtrem!",
        "tr": {
         "uk": "Добре, але спершу крем із фільтром!",
         "ru": "Хорошо, но сначала крем с фильтром!",
         "en": "OK, but sunscreen first!"
        }
       },
       {
        "id": "s1o1",
        "text": "Dobrze, ale najpierw krem z filtra!",
        "tr": {
         "uk": "(**z** + орудний: z **filtrem**)",
         "ru": "(**z** + творительный: z **filtrem**)",
         "en": "(**z** + instrumental: **filtrem**)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "krem **z filtrem** — орудний.",
       "ru": "krem **z filtrem** — творительный.",
       "en": "**z filtrem**."
      }
     }
    ]
   },
   "explanation": null
  },
  "to": {
   "type": "DIALOGUE",
   "skill": "dialogue.beach",
   "data": {
    "npc": {
     "name": "Kasia",
     "emoji": "👩🏻",
     "role": {
      "uk": "подруга з Гдині",
      "ru": "подруга из Гдыни",
      "en": "a friend from Gdynia"
     }
    },
    "steps": [
     {
      "npc": "Idziemy się kąpać?",
      "npcTr": {
       "uk": "Ідемо купатися?",
       "ru": "Идём купаться?",
       "en": "Shall we go for a swim?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Nie teraz, wisi czerwona flaga.",
        "tr": {
         "uk": "Не зараз, висить червоний прапор.",
         "ru": "Не сейчас, висит красный флаг.",
         "en": "Not now, the red flag is up."
        }
       },
       {
        "id": "s0o1",
        "text": "Nie teraz, wisi biała flaga.",
        "tr": {
         "uk": "(біла — купатися **можна**; заборона — при **червоній**)",
         "ru": "(белый — купаться **можно**; запрет — при **красном**)",
         "en": "(white means swimming is allowed)"
        }
       },
       {
        "id": "s0o2",
        "text": "Dobrze, wisi czerwona flaga, więc idziemy.",
        "tr": {
         "uk": "(**czerwona flaga** — купатися **не можна**, тож «więc idziemy» суперечить)",
         "ru": "(**czerwona flaga** — купаться **нельзя**, так что «więc idziemy» противоречит)",
         "en": "(**czerwona flaga** means no swimming, so “więc idziemy” contradicts it)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "**Czerwona flaga** — купатися не можна.",
       "ru": "**Czerwona flaga** — купаться нельзя.",
       "en": "**Czerwona flaga** — no swimming."
      }
     },
     {
      "npc": "To może poopalamy się na plaży?",
      "npcTr": {
       "uk": "То, може, позасмагаємо на пляжі?",
       "ru": "Тогда, может, позагораем на пляже?",
       "en": "Then maybe we’ll sunbathe on the beach?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Dobrze, ale najpierw krem z filtrem!",
        "tr": {
         "uk": "Добре, але спершу крем із фільтром!",
         "ru": "Хорошо, но сначала крем с фильтром!",
         "en": "OK, but sunscreen first!"
        }
       },
       {
        "id": "s1o1",
        "text": "Dobrze, ale najpierw krem z filtra!",
        "tr": {
         "uk": "(**z** + орудний: z **filtrem**)",
         "ru": "(**z** + творительный: z **filtrem**)",
         "en": "(**z** + instrumental: **filtrem**)"
        }
       },
       {
        "id": "s1o2",
        "text": "Dobrze, ale najpierw krem bez filtra!",
        "tr": {
         "uk": "(**bez filtra** — «без фільтра»; для засмаги потрібен **z filtrem**)",
         "ru": "(**bez filtra** — «без фильтра»; для загара нужен **z filtrem**)",
         "en": "(**bez filtra** means “without SPF”; for sunbathing you need **z filtrem**)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "krem **z filtrem** — орудний.",
       "ru": "krem **z filtrem** — творительный.",
       "en": "**z filtrem**."
      }
     }
    ]
   },
   "explanation": null
  }
 },
 {
  "lesson": "gda-5-zgubilem",
  "n": 0,
  "from": {
   "type": "SITUATION",
   "skill": "situation.lost",
   "data": {
    "npc": {
     "name": "Pani w biurze",
     "emoji": "👩🏽‍💼",
     "role": {
      "uk": "працівниця бюро знахідок",
      "ru": "сотрудница бюро находок",
      "en": "lost-property clerk"
     }
    },
    "scene": {
     "uk": "Бюро знахідок на вокзалі Gdańsk Główny",
     "ru": "Бюро находок на вокзале Gdańsk Główny",
     "en": "The lost property office at Gdańsk Główny"
    },
    "steps": [
     {
      "npc": "Dzień dobry, co pan zgubił?",
      "npcTr": {
       "uk": "Добрий день, що ви загубили?",
       "ru": "Добрый день, что вы потеряли?",
       "en": "Hello, what have you lost?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Zgubiłem czarny plecak w tramwaju numer osiem.",
        "tr": {
         "uk": "Я загубив чорний рюкзак у трамваї номер вісім.",
         "ru": "Я потерял чёрный рюкзак в трамвае номер восемь.",
         "en": "I lost a black backpack on tram number eight."
        }
       },
       {
        "id": "s0o1",
        "text": "Zgubiłem czarnego plecak w tramwaju numer osiem.",
        "tr": {
         "uk": "(рюкзак — неживий: знахідний = називний: **czarny** plecak)",
         "ru": "(рюкзак — неодушевлённый: винительный = именительный: **czarny** plecak)",
         "en": "(inanimate: **czarny** plecak)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "Річ чоловічого роду — **czarny plecak**.",
       "ru": "Вещь мужского рода — **czarny plecak**.",
       "en": "**czarny plecak**."
      }
     },
     {
      "npc": "Co było w środku?",
      "npcTr": {
       "uk": "Що було всередині?",
       "ru": "Что было внутри?",
       "en": "What was inside?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Laptop, portfel i niebieska kurtka.",
        "tr": {
         "uk": "Ноутбук, гаманець і синя куртка.",
         "ru": "Ноутбук, кошелёк и синяя куртка.",
         "en": "A laptop, a wallet and a blue jacket."
        }
       },
       {
        "id": "s1o1",
        "text": "Laptopa, portfela i niebieską kurtkę.",
        "tr": {
         "uk": "(«що було?» — називний: laptop, portfel, niebieska kurtka)",
         "ru": "(«что было?» — именительный: laptop, portfel, niebieska kurtka)",
         "en": "(“what was there?” — nominative)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "Co było? — **називний**: niebieska kurtka.",
       "ru": "Co było? — **именительный**: niebieska kurtka.",
       "en": "Nominative after «było»."
      }
     }
    ]
   },
   "explanation": null
  },
  "to": {
   "type": "SITUATION",
   "skill": "situation.lost",
   "data": {
    "npc": {
     "name": "Pani w biurze",
     "emoji": "👩🏽‍💼",
     "role": {
      "uk": "працівниця бюро знахідок",
      "ru": "сотрудница бюро находок",
      "en": "lost-property clerk"
     }
    },
    "scene": {
     "uk": "Бюро знахідок на вокзалі Gdańsk Główny",
     "ru": "Бюро находок на вокзале Gdańsk Główny",
     "en": "The lost property office at Gdańsk Główny"
    },
    "steps": [
     {
      "npc": "Dzień dobry, co pan zgubił?",
      "npcTr": {
       "uk": "Добрий день, що ви загубили?",
       "ru": "Добрый день, что вы потеряли?",
       "en": "Hello, what have you lost?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Zgubiłem czarny plecak w tramwaju numer osiem.",
        "tr": {
         "uk": "Я загубив чорний рюкзак у трамваї номер вісім.",
         "ru": "Я потерял чёрный рюкзак в трамвае номер восемь.",
         "en": "I lost a black backpack on tram number eight."
        }
       },
       {
        "id": "s0o1",
        "text": "Zgubiłem czarnego plecak w tramwaju numer osiem.",
        "tr": {
         "uk": "(рюкзак — неживий: знахідний = називний: **czarny** plecak)",
         "ru": "(рюкзак — неодушевлённый: винительный = именительный: **czarny** plecak)",
         "en": "(inanimate: **czarny** plecak)"
        }
       },
       {
        "id": "s0o2",
        "text": "Zgubiłem czarny plecak w tramwaj numer osiem.",
        "tr": {
         "uk": "(**w** + місцевий: w **tramwaju**)",
         "ru": "(**w** + предложный: w **tramwaju**)",
         "en": "(**w** + locative: w **tramwaju**)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "Річ чоловічого роду — **czarny plecak**.",
       "ru": "Вещь мужского рода — **czarny plecak**.",
       "en": "**czarny plecak**."
      }
     },
     {
      "npc": "Co było w środku?",
      "npcTr": {
       "uk": "Що було всередині?",
       "ru": "Что было внутри?",
       "en": "What was inside?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Laptop, portfel i niebieska kurtka.",
        "tr": {
         "uk": "Ноутбук, гаманець і синя куртка.",
         "ru": "Ноутбук, кошелёк и синяя куртка.",
         "en": "A laptop, a wallet and a blue jacket."
        }
       },
       {
        "id": "s1o1",
        "text": "Laptopa, portfela i niebieską kurtkę.",
        "tr": {
         "uk": "(«що було?» — називний: laptop, portfel, niebieska kurtka)",
         "ru": "(«что было?» — именительный: laptop, portfel, niebieska kurtka)",
         "en": "(“what was there?” — nominative)"
        }
       },
       {
        "id": "s1o2",
        "text": "Laptop, portfel i niebieski kurtka.",
        "tr": {
         "uk": "(**kurtka** — жіночий рід: **niebieska** kurtka)",
         "ru": "(**kurtka** — женский род: **niebieska** kurtka)",
         "en": "(**kurtka** is feminine: **niebieska** kurtka)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "Co było? — **називний**: niebieska kurtka.",
       "ru": "Co było? — **именительный**: niebieska kurtka.",
       "en": "Nominative after «było»."
      }
     }
    ]
   },
   "explanation": null
  }
 },
 {
  "lesson": "gda-6-lotnisko",
  "n": 0,
  "from": {
   "type": "DIALOGUE",
   "skill": "dialogue.airport",
   "data": {
    "npc": {
     "name": "Pracownik lotniska",
     "emoji": "🧑🏻‍✈️",
     "role": {
      "uk": "працівник летовища",
      "ru": "сотрудник аэропорта",
      "en": "airport staff"
     }
    },
    "steps": [
     {
      "npc": "Dzień dobry, paszport i karta pokładowa poproszę.",
      "npcTr": {
       "uk": "Добрий день, паспорт і посадковий талон, будь ласка.",
       "ru": "Добрый день, паспорт и посадочный талон, пожалуйста.",
       "en": "Hello, passport and boarding pass, please."
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Proszę bardzo. Czy lot jest na czas?",
        "tr": {
         "uk": "Прошу. Рейс вчасно?",
         "ru": "Пожалуйста. Рейс вовремя?",
         "en": "Here you are. Is the flight on time?"
        }
       },
       {
        "id": "s0o1",
        "text": "Proszę bardzo. Czy lot jest na czasie?",
        "tr": {
         "uk": "(«na czasie» — «модний, актуальний» 🙂; вчасно — **na czas**)",
         "ru": "(«na czasie» — «модный, актуальный» 🙂; вовремя — **na czas**)",
         "en": "(«na czasie» means trendy; on time = **na czas**)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "Вчасно — **na czas**.",
       "ru": "Вовремя — **na czas**.",
       "en": "On time — **na czas**."
      }
     },
     {
      "npc": "Niestety jest opóźniony o godzinę.",
      "npcTr": {
       "uk": "На жаль, він затримується на годину.",
       "ru": "К сожалению, он задерживается на час.",
       "en": "Unfortunately it’s delayed by an hour."
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Rozumiem. Do której bramki mam iść?",
        "tr": {
         "uk": "Зрозуміло. До якого виходу мені йти?",
         "ru": "Понятно. К какому выходу мне идти?",
         "en": "I see. Which gate should I go to?"
        }
       },
       {
        "id": "s1o1",
        "text": "Rozumiem. Do który bramka mam iść?",
        "tr": {
         "uk": "(**do** + родовий: do **której bramki**)",
         "ru": "(**do** + родительный: do **której bramki**)",
         "en": "(**do** + genitive)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "**do której bramki?**",
       "ru": "**do której bramki?**",
       "en": "**do której bramki?**"
      }
     }
    ]
   },
   "explanation": null
  },
  "to": {
   "type": "DIALOGUE",
   "skill": "dialogue.airport",
   "data": {
    "npc": {
     "name": "Pracownik lotniska",
     "emoji": "🧑🏻‍✈️",
     "role": {
      "uk": "працівник летовища",
      "ru": "сотрудник аэропорта",
      "en": "airport staff"
     }
    },
    "steps": [
     {
      "npc": "Dzień dobry, paszport i karta pokładowa poproszę.",
      "npcTr": {
       "uk": "Добрий день, паспорт і посадковий талон, будь ласка.",
       "ru": "Добрый день, паспорт и посадочный талон, пожалуйста.",
       "en": "Hello, passport and boarding pass, please."
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Proszę bardzo. Czy lot jest na czas?",
        "tr": {
         "uk": "Прошу. Рейс вчасно?",
         "ru": "Пожалуйста. Рейс вовремя?",
         "en": "Here you are. Is the flight on time?"
        }
       },
       {
        "id": "s0o1",
        "text": "Proszę bardzo. Czy lot jest na czasie?",
        "tr": {
         "uk": "(«na czasie» — «модний, актуальний» 🙂; вчасно — **na czas**)",
         "ru": "(«na czasie» — «модный, актуальный» 🙂; вовремя — **na czas**)",
         "en": "(«na czasie» means trendy; on time = **na czas**)"
        }
       },
       {
        "id": "s0o2",
        "text": "Proszę bardzo. Czy lot jest w czasie?",
        "tr": {
         "uk": "(**w czasie** — «під час»; вчасно — **na czas**)",
         "ru": "(**w czasie** — «во время»; вовремя — **na czas**)",
         "en": "(**w czasie** means “during”; “on time” is **na czas**)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "Вчасно — **na czas**.",
       "ru": "Вовремя — **na czas**.",
       "en": "On time — **na czas**."
      }
     },
     {
      "npc": "Niestety jest opóźniony o godzinę.",
      "npcTr": {
       "uk": "На жаль, він затримується на годину.",
       "ru": "К сожалению, он задерживается на час.",
       "en": "Unfortunately it’s delayed by an hour."
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Rozumiem. Do której bramki mam iść?",
        "tr": {
         "uk": "Зрозуміло. До якого виходу мені йти?",
         "ru": "Понятно. К какому выходу мне идти?",
         "en": "I see. Which gate should I go to?"
        }
       },
       {
        "id": "s1o1",
        "text": "Rozumiem. Do który bramka mam iść?",
        "tr": {
         "uk": "(**do** + родовий: do **której bramki**)",
         "ru": "(**do** + родительный: do **której bramki**)",
         "en": "(**do** + genitive)"
        }
       },
       {
        "id": "s1o2",
        "text": "Rozumiem. Z której bramki mam iść?",
        "tr": {
         "uk": "(йдуть **до** виходу: do **której bramki**; **z** — «з»)",
         "ru": "(идут **к** выходу: do **której bramki**; **z** — «из»)",
         "en": "(you walk **to** a gate: do **której bramki**; **z** means “from”)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "**do której bramki?**",
       "ru": "**do której bramki?**",
       "en": "**do której bramki?**"
      }
     }
    ]
   },
   "explanation": null
  }
 },
 {
  "lesson": "gda-7-historia",
  "n": 0,
  "from": {
   "type": "DIALOGUE",
   "skill": "dialogue.history",
   "data": {
    "npc": {
     "name": "Pan Jacek",
     "emoji": "🧔🏻",
     "role": {
      "uk": "гід по Гданську",
      "ru": "гид по Гданьску",
      "en": "a Gdańsk tour guide"
     }
    },
    "steps": [
     {
      "npc": "Tutaj, w stoczni, w 1980 roku zaczął się wielki strajk.",
      "npcTr": {
       "uk": "Тут, на верфі, у 1980 році почався великий страйк.",
       "ru": "Здесь, на верфи, в 1980 году началась большая забастовка.",
       "en": "Here at the shipyard a great strike began in 1980."
      }
     },
     {
      "npc": "Wie pan, jak nazywał się ten ruch?",
      "npcTr": {
       "uk": "Знаєте, як називався цей рух?",
       "ru": "Знаете, как назывался это движение?",
       "en": "Do you know what the movement was called?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Tak, Solidarność.",
        "tr": {
         "uk": "Так, «Солідарність».",
         "ru": "Да, «Солидарность».",
         "en": "Yes, Solidarity."
        }
       },
       {
        "id": "s1o1",
        "text": "Tak, Solidarnością.",
        "tr": {
         "uk": "(«nazywać się» + **називний**: Solidarność)",
         "ru": "(«nazywać się» + **именительный**: Solidarność)",
         "en": "(«nazywać się» + nominative)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "nazywać się + називний: **Solidarność**.",
       "ru": "nazywać się + именительный: **Solidarność**.",
       "en": "Nominative: **Solidarność**."
      }
     },
     {
      "npc": "A w którym roku Polska weszła do Unii Europejskiej?",
      "npcTr": {
       "uk": "А в якому році Польща вступила до Євросоюзу?",
       "ru": "А в каком году Польша вступила в Евросоюз?",
       "en": "And in which year did Poland join the EU?"
      },
      "options": [
       {
        "id": "s2o0",
        "text": "W dwa tysiące czwartym roku.",
        "tr": {
         "uk": "У дві тисячі четвертому році.",
         "ru": "В две тысячи четвёртом году.",
         "en": "In 2004."
        }
       },
       {
        "id": "s2o1",
        "text": "W dwa tysiące cztery roku.",
        "tr": {
         "uk": "(рік — порядковий: w dwa tysiące **czwartym** roku)",
         "ru": "(год — порядковое: w dwa tysiące **czwartym** roku)",
         "en": "(years are ordinal: **czwartym**)"
        }
       }
      ],
      "answer": "s2o0",
      "feedback": {
       "uk": "Останнє слово — порядкове в місцевому: **czwartym**.",
       "ru": "Последнее слово — порядковое в предложном: **czwartym**.",
       "en": "Last word ordinal: **czwartym**."
      }
     }
    ]
   },
   "explanation": null
  },
  "to": {
   "type": "DIALOGUE",
   "skill": "dialogue.history",
   "data": {
    "npc": {
     "name": "Pan Jacek",
     "emoji": "🧔🏻",
     "role": {
      "uk": "гід по Гданську",
      "ru": "гид по Гданьску",
      "en": "a Gdańsk tour guide"
     }
    },
    "steps": [
     {
      "npc": "Tutaj, w stoczni, w 1980 roku zaczął się wielki strajk.",
      "npcTr": {
       "uk": "Тут, на верфі, у 1980 році почався великий страйк.",
       "ru": "Здесь, на верфи, в 1980 году началась большая забастовка.",
       "en": "Here at the shipyard a great strike began in 1980."
      }
     },
     {
      "npc": "Wie pan, jak nazywał się ten ruch?",
      "npcTr": {
       "uk": "Знаєте, як називався цей рух?",
       "ru": "Знаете, как назывался это движение?",
       "en": "Do you know what the movement was called?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Tak, Solidarność.",
        "tr": {
         "uk": "Так, «Солідарність».",
         "ru": "Да, «Солидарность».",
         "en": "Yes, Solidarity."
        }
       },
       {
        "id": "s1o1",
        "text": "Tak, Solidarnością.",
        "tr": {
         "uk": "(«nazywać się» + **називний**: Solidarność)",
         "ru": "(«nazywać się» + **именительный**: Solidarność)",
         "en": "(«nazywać się» + nominative)"
        }
       },
       {
        "id": "s1o2",
        "text": "Tak, Solidarności.",
        "tr": {
         "uk": "(**nazywać się** + називний: **Solidarność**, а не родовий)",
         "ru": "(**nazywać się** + именительный: **Solidarność**, а не родительный)",
         "en": "(**nazywać się** takes the nominative: **Solidarność**, not the genitive)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "nazywać się + називний: **Solidarność**.",
       "ru": "nazywać się + именительный: **Solidarność**.",
       "en": "Nominative: **Solidarność**."
      }
     },
     {
      "npc": "A w którym roku Polska weszła do Unii Europejskiej?",
      "npcTr": {
       "uk": "А в якому році Польща вступила до Євросоюзу?",
       "ru": "А в каком году Польша вступила в Евросоюз?",
       "en": "And in which year did Poland join the EU?"
      },
      "options": [
       {
        "id": "s2o0",
        "text": "W dwa tysiące czwartym roku.",
        "tr": {
         "uk": "У дві тисячі четвертому році.",
         "ru": "В две тысячи четвёртом году.",
         "en": "In 2004."
        }
       },
       {
        "id": "s2o1",
        "text": "W dwa tysiące cztery roku.",
        "tr": {
         "uk": "(рік — порядковий: w dwa tysiące **czwartym** roku)",
         "ru": "(год — порядковое: w dwa tysiące **czwartym** roku)",
         "en": "(years are ordinal: **czwartym**)"
        }
       },
       {
        "id": "s2o2",
        "text": "W dwa tysiące czwarty rok.",
        "tr": {
         "uk": "(**w którym roku?** — місцевий: w **czwartym roku**)",
         "ru": "(**w którym roku?** — предложный: w **czwartym roku**)",
         "en": "(**w którym roku?** takes the locative: w **czwartym roku**)"
        }
       }
      ],
      "answer": "s2o0",
      "feedback": {
       "uk": "Останнє слово — порядкове в місцевому: **czwartym**.",
       "ru": "Последнее слово — порядковое в предложном: **czwartym**.",
       "en": "Last word ordinal: **czwartym**."
      }
     }
    ]
   },
   "explanation": null
  }
 },
 {
  "lesson": "gda-8-trojmiasto",
  "n": 0,
  "from": {
   "type": "DIALOGUE",
   "skill": "dialogue.tricity",
   "data": {
    "npc": {
     "name": "Kasia",
     "emoji": "👩🏻",
     "role": {
      "uk": "подруга з Гдині",
      "ru": "подруга из Гдыни",
      "en": "a friend from Gdynia"
     }
    },
    "steps": [
     {
      "npc": "Jutro jedziemy do Sopotu?",
      "npcTr": {
       "uk": "Завтра їдемо до Сопота?",
       "ru": "Завтра едем в Сопот?",
       "en": "Shall we go to Sopot tomorrow?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Jasne! Jak się tam jedzie?",
        "tr": {
         "uk": "Звісно! Як туди доїхати?",
         "ru": "Конечно! Как туда доехать?",
         "en": "Sure! How do you get there?"
        }
       },
       {
        "id": "s0o1",
        "text": "Jasne! Jak się tam jedziesz?",
        "tr": {
         "uk": "(безособово — 3-тя особа: **jak się jedzie**)",
         "ru": "(безлично — 3-е лицо: **jak się jedzie**)",
         "en": "(impersonal: **jak się jedzie**)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "**Jak się jedzie?** — «як їдуть (загалом)».",
       "ru": "**Jak się jedzie?** — «как едут (вообще)».",
       "en": "**Jak się jedzie?**"
      }
     },
     {
      "npc": "Kolejką SKM, jakieś dwadzieścia minut. Bilet kupuje się w automacie.",
      "npcTr": {
       "uk": "Електричкою SKM, хвилин двадцять. Квиток купують в автоматі.",
       "ru": "На электричке SKM, минут двадцать. Билет покупают в автомате.",
       "en": "By SKM train, about twenty minutes. You buy a ticket from the machine."
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Super, to spotkajmy się na stacji o dziesiątej.",
        "tr": {
         "uk": "Супер, тоді зустріньмося на станції о десятій.",
         "ru": "Супер, тогда встретимся на станции в десять.",
         "en": "Great, let’s meet at the station at ten."
        }
       },
       {
        "id": "s1o1",
        "text": "Super, to spotkajmy się na stacja o dziesiątej.",
        "tr": {
         "uk": "(**na** + місцевий: na **stacji**)",
         "ru": "(**na** + предложный: na **stacji**)",
         "en": "(**na stacji** — locative)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "**na stacji** — місцевий.",
       "ru": "**na stacji** — предложный.",
       "en": "**na stacji**."
      }
     }
    ]
   },
   "explanation": null
  },
  "to": {
   "type": "DIALOGUE",
   "skill": "dialogue.tricity",
   "data": {
    "npc": {
     "name": "Kasia",
     "emoji": "👩🏻",
     "role": {
      "uk": "подруга з Гдині",
      "ru": "подруга из Гдыни",
      "en": "a friend from Gdynia"
     }
    },
    "steps": [
     {
      "npc": "Jutro jedziemy do Sopotu?",
      "npcTr": {
       "uk": "Завтра їдемо до Сопота?",
       "ru": "Завтра едем в Сопот?",
       "en": "Shall we go to Sopot tomorrow?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Jasne! Jak się tam jedzie?",
        "tr": {
         "uk": "Звісно! Як туди доїхати?",
         "ru": "Конечно! Как туда доехать?",
         "en": "Sure! How do you get there?"
        }
       },
       {
        "id": "s0o1",
        "text": "Jasne! Jak się tam jedziesz?",
        "tr": {
         "uk": "(безособово — 3-тя особа: **jak się jedzie**)",
         "ru": "(безлично — 3-е лицо: **jak się jedzie**)",
         "en": "(impersonal: **jak się jedzie**)"
        }
       },
       {
        "id": "s0o2",
        "text": "Jasne! Jak się tam jechać?",
        "tr": {
         "uk": "(безособова форма — 3-я особа: **jak się jedzie**)",
         "ru": "(безличная форма — 3-е лицо: **jak się jedzie**)",
         "en": "(the impersonal form uses the 3rd person: **jak się jedzie**)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "**Jak się jedzie?** — «як їдуть (загалом)».",
       "ru": "**Jak się jedzie?** — «как едут (вообще)».",
       "en": "**Jak się jedzie?**"
      }
     },
     {
      "npc": "Kolejką SKM, jakieś dwadzieścia minut. Bilet kupuje się w automacie.",
      "npcTr": {
       "uk": "Електричкою SKM, хвилин двадцять. Квиток купують в автоматі.",
       "ru": "На электричке SKM, минут двадцать. Билет покупают в автомате.",
       "en": "By SKM train, about twenty minutes. You buy a ticket from the machine."
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Super, to spotkajmy się na stacji o dziesiątej.",
        "tr": {
         "uk": "Супер, тоді зустріньмося на станції о десятій.",
         "ru": "Супер, тогда встретимся на станции в десять.",
         "en": "Great, let’s meet at the station at ten."
        }
       },
       {
        "id": "s1o1",
        "text": "Super, to spotkajmy się na stacja o dziesiątej.",
        "tr": {
         "uk": "(**na** + місцевий: na **stacji**)",
         "ru": "(**na** + предложный: na **stacji**)",
         "en": "(**na stacji** — locative)"
        }
       },
       {
        "id": "s1o2",
        "text": "Super, to spotkajmy się o stacji o dziesiątej.",
        "tr": {
         "uk": "(де? — **na** stacji; **o stacji** — «про станцію»)",
         "ru": "(где? — **na** stacji; **o stacji** — «о станции»)",
         "en": "(where? — **na** stacji; **o stacji** means “about the station”)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "**na stacji** — місцевий.",
       "ru": "**na stacji** — предложный.",
       "en": "**na stacji**."
      }
     }
    ]
   },
   "explanation": null
  }
 },
 {
  "lesson": "gda-boss",
  "n": 0,
  "from": {
   "type": "SITUATION",
   "skill": "situation.boss",
   "data": {
    "npc": {
     "name": "Pani Ola",
     "emoji": "👩🏼‍💼",
     "role": {
      "uk": "адміністраторка готелю",
      "ru": "администратор гостиницы",
      "en": "a hotel receptionist"
     }
    },
    "scene": {
     "uk": "Рецепція готелю на Довгому Торгу",
     "ru": "Ресепшн отеля на Длинном рынке",
     "en": "A hotel reception on Długi Targ"
    },
    "steps": [
     {
      "npc": "Dzień dobry! Ma pan rezerwację?",
      "npcTr": {
       "uk": "Добрий день! У вас є бронювання?",
       "ru": "Добрый день! У вас есть бронь?",
       "en": "Hello! Do you have a booking?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Tak, na trzy noce, na nazwisko Bobek.",
        "tr": {
         "uk": "Так, на три ночі, на прізвище Бобек.",
         "ru": "Да, на три ночи, на фамилию Бобек.",
         "en": "Yes, three nights, in the name of Bobek."
        }
       },
       {
        "id": "s0o1",
        "text": "Tak, na trzy nocy, na nazwisko Bobek.",
        "tr": {
         "uk": "(2–4 — **noce**)",
         "ru": "(2–4 — **noce**)",
         "en": "(2–4: **noce**)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "**na trzy noce**.",
       "ru": "**na trzy noce**.",
       "en": "**na trzy noce**."
      }
     },
     {
      "npc": "Pokój 204, śniadanie od siódmej. Coś jeszcze?",
      "npcTr": {
       "uk": "Номер 204, сніданок із сьомої. Щось іще?",
       "ru": "Номер 204, завтрак с семи. Что-нибудь ещё?",
       "en": "Room 204, breakfast from seven. Anything else?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Tak. Co warto zobaczyć w Gdańsku?",
        "tr": {
         "uk": "Так. Що варто побачити в Гданську?",
         "ru": "Да. Что стоит посмотреть в Гданьске?",
         "en": "Yes. What’s worth seeing in Gdańsk?"
        }
       },
       {
        "id": "s1o1",
        "text": "Tak. Co warto zobaczę w Gdańsku?",
        "tr": {
         "uk": "(після **warto** — інфінітив: **zobaczyć**)",
         "ru": "(после **warto** — инфинитив: **zobaczyć**)",
         "en": "(after **warto**: infinitive)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "**warto zobaczyć**.",
       "ru": "**warto zobaczyć**.",
       "en": "**warto zobaczyć**."
      }
     }
    ]
   },
   "explanation": null
  },
  "to": {
   "type": "SITUATION",
   "skill": "situation.boss",
   "data": {
    "npc": {
     "name": "Pani Ola",
     "emoji": "👩🏼‍💼",
     "role": {
      "uk": "адміністраторка готелю",
      "ru": "администратор гостиницы",
      "en": "a hotel receptionist"
     }
    },
    "scene": {
     "uk": "Рецепція готелю на Довгому Торгу",
     "ru": "Ресепшн отеля на Длинном рынке",
     "en": "A hotel reception on Długi Targ"
    },
    "steps": [
     {
      "npc": "Dzień dobry! Ma pan rezerwację?",
      "npcTr": {
       "uk": "Добрий день! У вас є бронювання?",
       "ru": "Добрый день! У вас есть бронь?",
       "en": "Hello! Do you have a booking?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Tak, na trzy noce, na nazwisko Bobek.",
        "tr": {
         "uk": "Так, на три ночі, на прізвище Бобек.",
         "ru": "Да, на три ночи, на фамилию Бобек.",
         "en": "Yes, three nights, in the name of Bobek."
        }
       },
       {
        "id": "s0o1",
        "text": "Tak, na trzy nocy, na nazwisko Bobek.",
        "tr": {
         "uk": "(2–4 — **noce**)",
         "ru": "(2–4 — **noce**)",
         "en": "(2–4: **noce**)"
        }
       },
       {
        "id": "s0o2",
        "text": "Tak, na trzy noce, na nazwiska Bobek.",
        "tr": {
         "uk": "(**na** + знахідний: na **nazwisko** Bobek)",
         "ru": "(**na** + винительный: na **nazwisko** Bobek)",
         "en": "(**na** + accusative: na **nazwisko** Bobek)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "**na trzy noce**.",
       "ru": "**na trzy noce**.",
       "en": "**na trzy noce**."
      }
     },
     {
      "npc": "Pokój 204, śniadanie od siódmej. Coś jeszcze?",
      "npcTr": {
       "uk": "Номер 204, сніданок із сьомої. Щось іще?",
       "ru": "Номер 204, завтрак с семи. Что-нибудь ещё?",
       "en": "Room 204, breakfast from seven. Anything else?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Tak. Co warto zobaczyć w Gdańsku?",
        "tr": {
         "uk": "Так. Що варто побачити в Гданську?",
         "ru": "Да. Что стоит посмотреть в Гданьске?",
         "en": "Yes. What’s worth seeing in Gdańsk?"
        }
       },
       {
        "id": "s1o1",
        "text": "Tak. Co warto zobaczę w Gdańsku?",
        "tr": {
         "uk": "(після **warto** — інфінітив: **zobaczyć**)",
         "ru": "(после **warto** — инфинитив: **zobaczyć**)",
         "en": "(after **warto**: infinitive)"
        }
       },
       {
        "id": "s1o2",
        "text": "Tak. Co warto zobaczyć na Gdańsku?",
        "tr": {
         "uk": "(місто — **w** Gdańsku, а не **na**)",
         "ru": "(город — **w** Gdańsku, а не **na**)",
         "en": "(a city takes **w** Gdańsku, not **na**)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "**warto zobaczyć**.",
       "ru": "**warto zobaczyć**.",
       "en": "**warto zobaczyć**."
      }
     }
    ]
   },
   "explanation": null
  }
 },
 {
  "lesson": "gdy-1-grac",
  "n": 0,
  "from": {
   "type": "DIALOGUE",
   "skill": "dialogue.hobby",
   "data": {
    "npc": {
     "name": "Kuba",
     "emoji": "🧑🏻",
     "role": {
      "uk": "сусід, грає у футбол",
      "ru": "сосед, играет в футбол",
      "en": "a neighbour who plays football"
     }
    },
    "steps": [
     {
      "npc": "Cześć! Grasz w piłkę? Brakuje nam jednej osoby.",
      "npcTr": {
       "uk": "Привіт! Граєш у футбол? Нам бракує однієї людини.",
       "ru": "Привет! Играешь в футбол? Нам не хватает одного человека.",
       "en": "Hi! Do you play football? We’re one player short."
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Tak, gram w piłkę prawie w każdą sobotę.",
        "tr": {
         "uk": "Так, граю у футбол майже щосуботи.",
         "ru": "Да, играю в футбол почти каждую субботу.",
         "en": "Yes, I play football almost every Saturday."
        }
       },
       {
        "id": "s0o1",
        "text": "Tak, gram na piłkę prawie w każdą sobotę.",
        "tr": {
         "uk": "(спорт і ігри — **w** + знахідний: grać **w piłkę**)",
         "ru": "(спорт и игры — **w** + винительный: grać **w piłkę**)",
         "en": "(games: **w** + accusative)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "grać **w piłkę**, **w tenisa**, **w szachy**.",
       "ru": "grać **w piłkę**, **w tenisa**, **w szachy**.",
       "en": "grać **w** + games."
      }
     },
     {
      "npc": "Super! A słyszałem, że też grasz na czymś. Na czym?",
      "npcTr": {
       "uk": "Супер! А я чув, що ти ще на чомусь граєш. На чому?",
       "ru": "Супер! А я слышал, что ты ещё на чём-то играешь. На чём?",
       "en": "Great! I heard you also play an instrument. Which one?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Gram na gitarze, od trzech lat.",
        "tr": {
         "uk": "Я граю на гітарі, вже три роки.",
         "ru": "Я играю на гитаре, уже три года.",
         "en": "I play the guitar — for three years now."
        }
       },
       {
        "id": "s1o1",
        "text": "Gram w gitarę, od trzech lat.",
        "tr": {
         "uk": "(інструмент — **na** + місцевий: **na gitarze**)",
         "ru": "(инструмент — **na** + предложный: **na gitarze**)",
         "en": "(instrument: **na** + locative)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "Інструмент — **na gitarze**, **na pianinie**.",
       "ru": "Инструмент — **na gitarze**, **na pianinie**.",
       "en": "Instruments: **na** + locative."
      }
     }
    ]
   },
   "explanation": null
  },
  "to": {
   "type": "DIALOGUE",
   "skill": "dialogue.hobby",
   "data": {
    "npc": {
     "name": "Kuba",
     "emoji": "🧑🏻",
     "role": {
      "uk": "сусід, грає у футбол",
      "ru": "сосед, играет в футбол",
      "en": "a neighbour who plays football"
     }
    },
    "steps": [
     {
      "npc": "Cześć! Grasz w piłkę? Brakuje nam jednej osoby.",
      "npcTr": {
       "uk": "Привіт! Граєш у футбол? Нам бракує однієї людини.",
       "ru": "Привет! Играешь в футбол? Нам не хватает одного человека.",
       "en": "Hi! Do you play football? We’re one player short."
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Tak, gram w piłkę prawie w każdą sobotę.",
        "tr": {
         "uk": "Так, граю у футбол майже щосуботи.",
         "ru": "Да, играю в футбол почти каждую субботу.",
         "en": "Yes, I play football almost every Saturday."
        }
       },
       {
        "id": "s0o1",
        "text": "Tak, gram na piłkę prawie w każdą sobotę.",
        "tr": {
         "uk": "(спорт і ігри — **w** + знахідний: grać **w piłkę**)",
         "ru": "(спорт и игры — **w** + винительный: grać **w piłkę**)",
         "en": "(games: **w** + accusative)"
        }
       },
       {
        "id": "s0o2",
        "text": "Tak, gram z piłką prawie w każdą sobotę.",
        "tr": {
         "uk": "(гра — **w** + знахідний: **w piłkę**; **z piłką** — «з м’ячем»)",
         "ru": "(игра — **w** + винительный: **w piłkę**; **z piłką** — «с мячом»)",
         "en": "(a game takes **w** + accusative: **w piłkę**; **z piłką** means “with a ball”)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "grać **w piłkę**, **w tenisa**, **w szachy**.",
       "ru": "grać **w piłkę**, **w tenisa**, **w szachy**.",
       "en": "grać **w** + games."
      }
     },
     {
      "npc": "Super! A słyszałem, że też grasz na czymś. Na czym?",
      "npcTr": {
       "uk": "Супер! А я чув, що ти ще на чомусь граєш. На чому?",
       "ru": "Супер! А я слышал, что ты ещё на чём-то играешь. На чём?",
       "en": "Great! I heard you also play an instrument. Which one?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Gram na gitarze, od trzech lat.",
        "tr": {
         "uk": "Я граю на гітарі, вже три роки.",
         "ru": "Я играю на гитаре, уже три года.",
         "en": "I play the guitar — for three years now."
        }
       },
       {
        "id": "s1o1",
        "text": "Gram w gitarę, od trzech lat.",
        "tr": {
         "uk": "(інструмент — **na** + місцевий: **na gitarze**)",
         "ru": "(инструмент — **na** + предложный: **na gitarze**)",
         "en": "(instrument: **na** + locative)"
        }
       },
       {
        "id": "s1o2",
        "text": "Gram na gitarę, od trzech lat.",
        "tr": {
         "uk": "(інструмент — **na** + місцевий: **na gitarze**, а не знахідний)",
         "ru": "(инструмент — **na** + предложный: **na gitarze**, а не винительный)",
         "en": "(an instrument takes **na** + locative: **na gitarze**, not the accusative)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "Інструмент — **na gitarze**, **na pianinie**.",
       "ru": "Инструмент — **na gitarze**, **na pianinie**.",
       "en": "Instruments: **na** + locative."
      }
     }
    ]
   },
   "explanation": null
  }
 },
 {
  "lesson": "gdy-2-uprawiam",
  "n": 0,
  "from": {
   "type": "DIALOGUE",
   "skill": "dialogue.sport",
   "data": {
    "npc": {
     "name": "Zosia",
     "emoji": "👩🏻",
     "role": {
      "uk": "подруга з курсу польської",
      "ru": "подруга с курса польского",
      "en": "a friend from Polish class"
     }
    },
    "steps": [
     {
      "npc": "Uprawiasz jakiś sport?",
      "npcTr": {
       "uk": "Ти займаєшся якимось спортом?",
       "ru": "Ты занимаешься каким-нибудь спортом?",
       "en": "Do you do any sport?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Tak, chodzę na basen i na jogę.",
        "tr": {
         "uk": "Так, ходжу в басейн і на йогу.",
         "ru": "Да, хожу в бассейн и на йогу.",
         "en": "Yes, I go swimming and to yoga."
        }
       },
       {
        "id": "s0o1",
        "text": "Tak, chodzę na basenie i na jodze.",
        "tr": {
         "uk": "(куди? — **na** + знахідний: **na basen**, **na jogę**)",
         "ru": "(куда? — **na** + винительный: **na basen**, **na jogę**)",
         "en": "(where to? — accusative: **na basen**, **na jogę**)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "chodzić **na basen**, **na jogę** — знахідний.",
       "ru": "chodzić **na basen**, **na jogę** — винительный.",
       "en": "chodzić na + accusative."
      }
     },
     {
      "npc": "A zimą? Jeździsz na czymś?",
      "npcTr": {
       "uk": "А взимку? На чомусь катаєшся?",
       "ru": "А зимой? На чём-нибудь катаешься?",
       "en": "And in winter? Do you ski or skate?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Zimą jeżdżę na nartach w górach.",
        "tr": {
         "uk": "Взимку я катаюся на лижах у горах.",
         "ru": "Зимой я катаюсь на лыжах в горах.",
         "en": "In winter I ski in the mountains."
        }
       },
       {
        "id": "s1o1",
        "text": "Zimą jeżdżę na narty w górach.",
        "tr": {
         "uk": "(кататися на чому? — **na** + місцевий: **na nartach**)",
         "ru": "(кататься на чём? — **na** + предложный: **na nartach**)",
         "en": "(**na** + locative: **na nartach**)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "jeździć **na nartach**, **na rowerze** — місцевий.",
       "ru": "jeździć **na nartach**, **na rowerze** — предложный.",
       "en": "jeździć na + locative."
      }
     }
    ]
   },
   "explanation": null
  },
  "to": {
   "type": "DIALOGUE",
   "skill": "dialogue.sport",
   "data": {
    "npc": {
     "name": "Zosia",
     "emoji": "👩🏻",
     "role": {
      "uk": "подруга з курсу польської",
      "ru": "подруга с курса польского",
      "en": "a friend from Polish class"
     }
    },
    "steps": [
     {
      "npc": "Uprawiasz jakiś sport?",
      "npcTr": {
       "uk": "Ти займаєшся якимось спортом?",
       "ru": "Ты занимаешься каким-нибудь спортом?",
       "en": "Do you do any sport?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Tak, chodzę na basen i na jogę.",
        "tr": {
         "uk": "Так, ходжу в басейн і на йогу.",
         "ru": "Да, хожу в бассейн и на йогу.",
         "en": "Yes, I go swimming and to yoga."
        }
       },
       {
        "id": "s0o1",
        "text": "Tak, chodzę na basenie i na jodze.",
        "tr": {
         "uk": "(куди? — **na** + знахідний: **na basen**, **na jogę**)",
         "ru": "(куда? — **na** + винительный: **na basen**, **na jogę**)",
         "en": "(where to? — accusative: **na basen**, **na jogę**)"
        }
       },
       {
        "id": "s0o2",
        "text": "Tak, chodzę na basenu i na jogi.",
        "tr": {
         "uk": "(куди? — **na** + знахідний: **na basen**, **na jogę**)",
         "ru": "(куда? — **na** + винительный: **na basen**, **na jogę**)",
         "en": "(where to? — **na** + accusative: **na basen**, **na jogę**)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "chodzić **na basen**, **na jogę** — знахідний.",
       "ru": "chodzić **na basen**, **na jogę** — винительный.",
       "en": "chodzić na + accusative."
      }
     },
     {
      "npc": "A zimą? Jeździsz na czymś?",
      "npcTr": {
       "uk": "А взимку? На чомусь катаєшся?",
       "ru": "А зимой? На чём-нибудь катаешься?",
       "en": "And in winter? Do you ski or skate?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Zimą jeżdżę na nartach w górach.",
        "tr": {
         "uk": "Взимку я катаюся на лижах у горах.",
         "ru": "Зимой я катаюсь на лыжах в горах.",
         "en": "In winter I ski in the mountains."
        }
       },
       {
        "id": "s1o1",
        "text": "Zimą jeżdżę na narty w górach.",
        "tr": {
         "uk": "(кататися на чому? — **na** + місцевий: **na nartach**)",
         "ru": "(кататься на чём? — **na** + предложный: **na nartach**)",
         "en": "(**na** + locative: **na nartach**)"
        }
       },
       {
        "id": "s1o2",
        "text": "Zimą jeżdżę z nartami w górach.",
        "tr": {
         "uk": "(кататися **на** + місцевий: **na nartach**; **z nartami** — «з лижами»)",
         "ru": "(кататься **на** + предложный: **na nartach**; **z nartami** — «с лыжами»)",
         "en": "(riding or skiing takes **na** + locative: **na nartach**; **z nartami** means “with skis”)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "jeździć **na nartach**, **na rowerze** — місцевий.",
       "ru": "jeździć **na nartach**, **na rowerze** — предложный.",
       "en": "jeździć na + locative."
      }
     }
    ]
   },
   "explanation": null
  }
 },
 {
  "lesson": "gdy-3-jak-czesto",
  "n": 0,
  "from": {
   "type": "DIALOGUE",
   "skill": "dialogue.frequency",
   "data": {
    "npc": {
     "name": "Ankieterka",
     "emoji": "👩🏽",
     "role": {
      "uk": "проводить опитування на бульварі",
      "ru": "проводит опрос на бульваре",
      "en": "doing a street survey"
     }
    },
    "steps": [
     {
      "npc": "Dzień dobry, krótka ankieta. Jak często uprawia pan sport?",
      "npcTr": {
       "uk": "Добрий день, коротке опитування. Як часто ви займаєтеся спортом?",
       "ru": "Добрый день, короткий опрос. Как часто вы занимаетесь спортом?",
       "en": "Hello, a short survey. How often do you do sport?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Dwa razy w tygodniu, we wtorki i w piątki.",
        "tr": {
         "uk": "Двічі на тиждень, у вівторки й п’ятниці.",
         "ru": "Два раза в неделю, по вторникам и пятницам.",
         "en": "Twice a week, on Tuesdays and Fridays."
        }
       },
       {
        "id": "s0o1",
        "text": "Dwa raz w tygodniu, we wtorki i w piątki.",
        "tr": {
         "uk": "(один — **raz**, далі — **razy**: **dwa razy**)",
         "ru": "(один — **raz**, дальше — **razy**: **dwa razy**)",
         "en": "(**raz**, but **dwa razy**)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "**raz**, але **dwa razy**, **pięć razy**.",
       "ru": "**raz**, но **dwa razy**, **pięć razy**.",
       "en": "**raz** → **razy**."
      }
     },
     {
      "npc": "A jak często chodzi pan na basen?",
      "npcTr": {
       "uk": "А як часто ви ходите в басейн?",
       "ru": "А как часто вы ходите в бассейн?",
       "en": "And how often do you go swimming?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Nigdy nie chodzę na basen, nie umiem pływać.",
        "tr": {
         "uk": "Я ніколи не ходжу в басейн, не вмію плавати.",
         "ru": "Я никогда не хожу в бассейн, не умею плавать.",
         "en": "I never go swimming — I can’t swim."
        }
       },
       {
        "id": "s1o1",
        "text": "Nigdy chodzę na basen, nie umiem pływać.",
        "tr": {
         "uk": "(з **nigdy** потрібне **nie**: nigdy **nie** chodzę)",
         "ru": "(с **nigdy** нужно **nie**: nigdy **nie** chodzę)",
         "en": "(**nigdy** needs **nie**)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "nigdy **nie** chodzę — заперечення подвійне.",
       "ru": "nigdy **nie** chodzę — отрицание двойное.",
       "en": "Double negative: nigdy **nie**."
      }
     }
    ]
   },
   "explanation": null
  },
  "to": {
   "type": "DIALOGUE",
   "skill": "dialogue.frequency",
   "data": {
    "npc": {
     "name": "Ankieterka",
     "emoji": "👩🏽",
     "role": {
      "uk": "проводить опитування на бульварі",
      "ru": "проводит опрос на бульваре",
      "en": "doing a street survey"
     }
    },
    "steps": [
     {
      "npc": "Dzień dobry, krótka ankieta. Jak często uprawia pan sport?",
      "npcTr": {
       "uk": "Добрий день, коротке опитування. Як часто ви займаєтеся спортом?",
       "ru": "Добрый день, короткий опрос. Как часто вы занимаетесь спортом?",
       "en": "Hello, a short survey. How often do you do sport?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Dwa razy w tygodniu, we wtorki i w piątki.",
        "tr": {
         "uk": "Двічі на тиждень, у вівторки й п’ятниці.",
         "ru": "Два раза в неделю, по вторникам и пятницам.",
         "en": "Twice a week, on Tuesdays and Fridays."
        }
       },
       {
        "id": "s0o1",
        "text": "Dwa raz w tygodniu, we wtorki i w piątki.",
        "tr": {
         "uk": "(один — **raz**, далі — **razy**: **dwa razy**)",
         "ru": "(один — **raz**, дальше — **razy**: **dwa razy**)",
         "en": "(**raz**, but **dwa razy**)"
        }
       },
       {
        "id": "s0o2",
        "text": "Dwa razy na tydzień, we wtorki i w piątki.",
        "tr": {
         "uk": "(частота — **w tygodniu**: **dwa razy w tygodniu**)",
         "ru": "(частота — **w tygodniu**: **dwa razy w tygodniu**)",
         "en": "(frequency uses **w tygodniu**: **dwa razy w tygodniu**)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "**raz**, але **dwa razy**, **pięć razy**.",
       "ru": "**raz**, но **dwa razy**, **pięć razy**.",
       "en": "**raz** → **razy**."
      }
     },
     {
      "npc": "A jak często chodzi pan na basen?",
      "npcTr": {
       "uk": "А як часто ви ходите в басейн?",
       "ru": "А как часто вы ходите в бассейн?",
       "en": "And how often do you go swimming?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Nigdy nie chodzę na basen, nie umiem pływać.",
        "tr": {
         "uk": "Я ніколи не ходжу в басейн, не вмію плавати.",
         "ru": "Я никогда не хожу в бассейн, не умею плавать.",
         "en": "I never go swimming — I can’t swim."
        }
       },
       {
        "id": "s1o1",
        "text": "Nigdy chodzę na basen, nie umiem pływać.",
        "tr": {
         "uk": "(з **nigdy** потрібне **nie**: nigdy **nie** chodzę)",
         "ru": "(с **nigdy** нужно **nie**: nigdy **nie** chodzę)",
         "en": "(**nigdy** needs **nie**)"
        }
       },
       {
        "id": "s1o2",
        "text": "Nigdy nie chodzę na basen, ponieważ uwielbiam pływać.",
        "tr": {
         "uk": "(**nie umiem pływać** — причина, чому не ходиш; «uwielbiam pływać» суперечить)",
         "ru": "(**nie umiem pływać** — причина, почему не ходишь; «uwielbiam pływać» противоречит)",
         "en": "(**nie umiem pływać** is the reason you don’t go; “uwielbiam pływać” contradicts it)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "nigdy **nie** chodzę — заперечення подвійне.",
       "ru": "nigdy **nie** chodzę — отрицание двойное.",
       "en": "Double negative: nigdy **nie**."
      }
     }
    ]
   },
   "explanation": null
  }
 },
 {
  "lesson": "gdy-4-silownia",
  "n": 0,
  "from": {
   "type": "SITUATION",
   "skill": "dialogue.gym",
   "data": {
    "npc": {
     "name": "Pani w recepcji",
     "emoji": "👩🏼‍💼",
     "role": {
      "uk": "адміністраторка спортклубу",
      "ru": "администратор спортклуба",
      "en": "gym receptionist"
     }
    },
    "scene": {
     "uk": "Рецепція спортклубу біля бульвару",
     "ru": "Ресепшн спортклуба у бульвара",
     "en": "A gym reception near the seafront"
    },
    "steps": [
     {
      "npc": "Dzień dobry! W czym mogę pomóc?",
      "npcTr": {
       "uk": "Добрий день! Чим можу допомогти?",
       "ru": "Добрый день! Чем могу помочь?",
       "en": "Hello! How can I help?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Chciałbym kupić karnet na miesiąc.",
        "tr": {
         "uk": "Я хотів би купити абонемент на місяць.",
         "ru": "Я хотел бы купить абонемент на месяц.",
         "en": "I’d like a one-month pass."
        }
       },
       {
        "id": "s0o1",
        "text": "Chciałbym kupić karnet na miesiącu.",
        "tr": {
         "uk": "(на який термін? — **na** + знахідний: **na miesiąc**)",
         "ru": "(на какой срок? — **na** + винительный: **na miesiąc**)",
         "en": "(for how long? **na miesiąc**)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "karnet **na miesiąc**, **na rok** — знахідний.",
       "ru": "karnet **na miesiąc**, **na rok** — винительный.",
       "en": "**na** + accusative."
      }
     },
     {
      "npc": "Proszę, to klucz do szafki numer dwanaście.",
      "npcTr": {
       "uk": "Прошу, ось ключ від шафки номер дванадцять.",
       "ru": "Пожалуйста, вот ключ от шкафчика номер двенадцать.",
       "en": "Here’s the key to locker twelve."
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Dziękuję. Czy mogę też umówić się z trenerem?",
        "tr": {
         "uk": "Дякую. А можна ще записатися до тренера?",
         "ru": "Спасибо. А можно ещё записаться к тренеру?",
         "en": "Thanks. Can I also book a trainer?"
        }
       },
       {
        "id": "s1o1",
        "text": "Dziękuję. Czy mogę też umówić się z trener?",
        "tr": {
         "uk": "(з ким? — **z** + орудний: **z trenerem**)",
         "ru": "(с кем? — **z** + творительный: **z trenerem**)",
         "en": "(**z** + instrumental: **trenerem**)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "**z trenerem** — орудний.",
       "ru": "**z trenerem** — творительный.",
       "en": "**z trenerem**."
      }
     }
    ]
   },
   "explanation": null
  },
  "to": {
   "type": "SITUATION",
   "skill": "dialogue.gym",
   "data": {
    "npc": {
     "name": "Pani w recepcji",
     "emoji": "👩🏼‍💼",
     "role": {
      "uk": "адміністраторка спортклубу",
      "ru": "администратор спортклуба",
      "en": "gym receptionist"
     }
    },
    "scene": {
     "uk": "Рецепція спортклубу біля бульвару",
     "ru": "Ресепшн спортклуба у бульвара",
     "en": "A gym reception near the seafront"
    },
    "steps": [
     {
      "npc": "Dzień dobry! W czym mogę pomóc?",
      "npcTr": {
       "uk": "Добрий день! Чим можу допомогти?",
       "ru": "Добрый день! Чем могу помочь?",
       "en": "Hello! How can I help?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Chciałbym kupić karnet na miesiąc.",
        "tr": {
         "uk": "Я хотів би купити абонемент на місяць.",
         "ru": "Я хотел бы купить абонемент на месяц.",
         "en": "I’d like a one-month pass."
        }
       },
       {
        "id": "s0o1",
        "text": "Chciałbym kupić karnet na miesiącu.",
        "tr": {
         "uk": "(на який термін? — **na** + знахідний: **na miesiąc**)",
         "ru": "(на какой срок? — **na** + винительный: **na miesiąc**)",
         "en": "(for how long? **na miesiąc**)"
        }
       },
       {
        "id": "s0o2",
        "text": "Chciałbym kupić karnet za miesiąc.",
        "tr": {
         "uk": "(**za miesiąc** — «через місяць»; на який термін — **na miesiąc**)",
         "ru": "(**za miesiąc** — «через месяц»; на какой срок — **na miesiąc**)",
         "en": "(**za miesiąc** means “in a month”; for how long — **na miesiąc**)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "karnet **na miesiąc**, **na rok** — знахідний.",
       "ru": "karnet **na miesiąc**, **na rok** — винительный.",
       "en": "**na** + accusative."
      }
     },
     {
      "npc": "Proszę, to klucz do szafki numer dwanaście.",
      "npcTr": {
       "uk": "Прошу, ось ключ від шафки номер дванадцять.",
       "ru": "Пожалуйста, вот ключ от шкафчика номер двенадцать.",
       "en": "Here’s the key to locker twelve."
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Dziękuję. Czy mogę też umówić się z trenerem?",
        "tr": {
         "uk": "Дякую. А можна ще записатися до тренера?",
         "ru": "Спасибо. А можно ещё записаться к тренеру?",
         "en": "Thanks. Can I also book a trainer?"
        }
       },
       {
        "id": "s1o1",
        "text": "Dziękuję. Czy mogę też umówić się z trener?",
        "tr": {
         "uk": "(з ким? — **z** + орудний: **z trenerem**)",
         "ru": "(с кем? — **z** + творительный: **z trenerem**)",
         "en": "(**z** + instrumental: **trenerem**)"
        }
       },
       {
        "id": "s1o2",
        "text": "Dziękuję. Czy mogę też umówić się z trenera?",
        "tr": {
         "uk": "(**z** у значенні «з ким» + орудний: z **trenerem**)",
         "ru": "(**z** в значении «с кем» + творительный: z **trenerem**)",
         "en": "(**z** meaning “with” takes the instrumental: z **trenerem**)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "**z trenerem** — орудний.",
       "ru": "**z trenerem** — творительный.",
       "en": "**z trenerem**."
      }
     }
    ]
   },
   "explanation": null
  }
 },
 {
  "lesson": "gdy-5-mecz",
  "n": 0,
  "from": {
   "type": "SITUATION",
   "skill": "dialogue.match",
   "data": {
    "npc": {
     "name": "Bartek",
     "emoji": "👨🏻",
     "role": {
      "uk": "уболівальник «Арки»",
      "ru": "болельщик «Арки»",
      "en": "an Arka fan"
     }
    },
    "scene": {
     "uk": "Стадіон у Гдині перед матчем",
     "ru": "Стадион в Гдыне перед матчем",
     "en": "The stadium in Gdynia before kick-off"
    },
    "steps": [
     {
      "npc": "Ty też na mecz? Komu kibicujesz?",
      "npcTr": {
       "uk": "Ти теж на матч? За кого вболіваєш?",
       "ru": "Ты тоже на матч? За кого болеешь?",
       "en": "Going to the match too? Who do you support?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Kibicuję Arce, oczywiście!",
        "tr": {
         "uk": "Я вболіваю за «Арку», звісно!",
         "ru": "Я болею за «Арку», конечно!",
         "en": "Arka, of course!"
        }
       },
       {
        "id": "s0o1",
        "text": "Kibicuję za Arkę, oczywiście!",
        "tr": {
         "uk": "(**kibicować** + давальний без «za»: kibicuję **Arce**)",
         "ru": "(**kibicować** + дательный без «za»: kibicuję **Arce**)",
         "en": "(**kibicować** + dative, no «za»)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "kibicuję **Arce** — давальний, без прийменника.",
       "ru": "kibicuję **Arce** — дательный, без предлога.",
       "en": "Dative, no preposition."
      }
     },
     {
      "npc": "Jaki jest wynik? Nie widziałem pierwszej połowy.",
      "npcTr": {
       "uk": "Який рахунок? Я не бачив першого тайму.",
       "ru": "Какой счёт? Я не видел первый тайм.",
       "en": "What’s the score? I missed the first half."
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Dwa do jednego dla Arki.",
        "tr": {
         "uk": "Два — один на користь «Арки».",
         "ru": "Два — один в пользу «Арки».",
         "en": "Two–one to Arka."
        }
       },
       {
        "id": "s1o1",
        "text": "Dwa na jeden dla Arki.",
        "tr": {
         "uk": "(рахунок — **do**: **dwa do jednego**)",
         "ru": "(счёт — **do**: **dwa do jednego**)",
         "en": "(score: **dwa do jednego**)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "Рахунок: **dwa do jednego**.",
       "ru": "Счёт: **dwa do jednego**.",
       "en": "Score: **dwa do jednego**."
      }
     }
    ]
   },
   "explanation": null
  },
  "to": {
   "type": "SITUATION",
   "skill": "dialogue.match",
   "data": {
    "npc": {
     "name": "Bartek",
     "emoji": "👨🏻",
     "role": {
      "uk": "уболівальник «Арки»",
      "ru": "болельщик «Арки»",
      "en": "an Arka fan"
     }
    },
    "scene": {
     "uk": "Стадіон у Гдині перед матчем",
     "ru": "Стадион в Гдыне перед матчем",
     "en": "The stadium in Gdynia before kick-off"
    },
    "steps": [
     {
      "npc": "Ty też na mecz? Komu kibicujesz?",
      "npcTr": {
       "uk": "Ти теж на матч? За кого вболіваєш?",
       "ru": "Ты тоже на матч? За кого болеешь?",
       "en": "Going to the match too? Who do you support?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Kibicuję Arce, oczywiście!",
        "tr": {
         "uk": "Я вболіваю за «Арку», звісно!",
         "ru": "Я болею за «Арку», конечно!",
         "en": "Arka, of course!"
        }
       },
       {
        "id": "s0o1",
        "text": "Kibicuję za Arkę, oczywiście!",
        "tr": {
         "uk": "(**kibicować** + давальний без «za»: kibicuję **Arce**)",
         "ru": "(**kibicować** + дательный без «za»: kibicuję **Arce**)",
         "en": "(**kibicować** + dative, no «za»)"
        }
       },
       {
        "id": "s0o2",
        "text": "Kibicuję Arkę, oczywiście!",
        "tr": {
         "uk": "(**kibicować** + давальний: kibicuję **Arce**, а не знахідний)",
         "ru": "(**kibicować** + дательный: kibicuję **Arce**, а не винительный)",
         "en": "(**kibicować** takes the dative: kibicuję **Arce**, not the accusative)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "kibicuję **Arce** — давальний, без прийменника.",
       "ru": "kibicuję **Arce** — дательный, без предлога.",
       "en": "Dative, no preposition."
      }
     },
     {
      "npc": "Jaki jest wynik? Nie widziałem pierwszej połowy.",
      "npcTr": {
       "uk": "Який рахунок? Я не бачив першого тайму.",
       "ru": "Какой счёт? Я не видел первый тайм.",
       "en": "What’s the score? I missed the first half."
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Dwa do jednego dla Arki.",
        "tr": {
         "uk": "Два — один на користь «Арки».",
         "ru": "Два — один в пользу «Арки».",
         "en": "Two–one to Arka."
        }
       },
       {
        "id": "s1o1",
        "text": "Dwa na jeden dla Arki.",
        "tr": {
         "uk": "(рахунок — **do**: **dwa do jednego**)",
         "ru": "(счёт — **do**: **dwa do jednego**)",
         "en": "(score: **dwa do jednego**)"
        }
       },
       {
        "id": "s1o2",
        "text": "Dwa do jeden dla Arki.",
        "tr": {
         "uk": "(після **do** — родовий: **dwa do jednego**)",
         "ru": "(после **do** — родительный: **dwa do jednego**)",
         "en": "(after **do** use the genitive: **dwa do jednego**)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "Рахунок: **dwa do jednego**.",
       "ru": "Счёт: **dwa do jednego**.",
       "en": "Score: **dwa do jednego**."
      }
     }
    ]
   },
   "explanation": null
  }
 },
 {
  "lesson": "gdy-6-zeglarstwo",
  "n": 0,
  "from": {
   "type": "DIALOGUE",
   "skill": "dialogue.sailing",
   "data": {
    "npc": {
     "name": "Pani Ewa",
     "emoji": "👩🏼",
     "role": {
      "uk": "інструкторка вітрильного спорту",
      "ru": "инструктор по парусному спорту",
      "en": "a sailing instructor"
     }
    },
    "steps": [
     {
      "npc": "Dzień dobry! Chce pan nauczyć się żeglować?",
      "npcTr": {
       "uk": "Добрий день! Хочете навчитися ходити під вітрилом?",
       "ru": "Добрый день! Хотите научиться ходить под парусом?",
       "en": "Hello! Would you like to learn to sail?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Tak, bardzo chcę się nauczyć żeglować!",
        "tr": {
         "uk": "Так, дуже хочу навчитися ходити під вітрилом!",
         "ru": "Да, очень хочу научиться ходить под парусом!",
         "en": "Yes, I’d love to learn to sail!"
        }
       },
       {
        "id": "s0o1",
        "text": "Tak, bardzo chcę się nauczyć żeglowanie!",
        "tr": {
         "uk": "(навчитися **що робити** — інфінітив: **żeglować**)",
         "ru": "(научиться **что делать** — инфинитив: **żeglować**)",
         "en": "(learn **to do** — infinitive)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "nauczyć się **żeglować** (можна й «żeglowania», але не «żeglowanie»).",
       "ru": "nauczyć się **żeglować** (можно и «żeglowania», но не «żeglowanie»).",
       "en": "nauczyć się **żeglować**."
      }
     },
     {
      "npc": "Ma pan kamizelkę ratunkową?",
      "npcTr": {
       "uk": "У вас є рятувальний жилет?",
       "ru": "У вас есть спасательный жилет?",
       "en": "Do you have a life jacket?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Nie mam. Czy mogę wypożyczyć kamizelkę?",
        "tr": {
         "uk": "Не маю. Можна взяти жилет напрокат?",
         "ru": "Нет. Можно взять жилет напрокат?",
         "en": "No. Can I rent one?"
        }
       },
       {
        "id": "s1o1",
        "text": "Nie mam. Czy mogę wypożyczyć kamizelka?",
        "tr": {
         "uk": "(що? — знахідний: **kamizelkę**)",
         "ru": "(что? — винительный: **kamizelkę**)",
         "en": "(accusative: **kamizelkę**)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "wypożyczyć **kamizelkę** — знахідний.",
       "ru": "wypożyczyć **kamizelkę** — винительный.",
       "en": "Accusative: **kamizelkę**."
      }
     }
    ]
   },
   "explanation": null
  },
  "to": {
   "type": "DIALOGUE",
   "skill": "dialogue.sailing",
   "data": {
    "npc": {
     "name": "Pani Ewa",
     "emoji": "👩🏼",
     "role": {
      "uk": "інструкторка вітрильного спорту",
      "ru": "инструктор по парусному спорту",
      "en": "a sailing instructor"
     }
    },
    "steps": [
     {
      "npc": "Dzień dobry! Chce pan nauczyć się żeglować?",
      "npcTr": {
       "uk": "Добрий день! Хочете навчитися ходити під вітрилом?",
       "ru": "Добрый день! Хотите научиться ходить под парусом?",
       "en": "Hello! Would you like to learn to sail?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Tak, bardzo chcę się nauczyć żeglować!",
        "tr": {
         "uk": "Так, дуже хочу навчитися ходити під вітрилом!",
         "ru": "Да, очень хочу научиться ходить под парусом!",
         "en": "Yes, I’d love to learn to sail!"
        }
       },
       {
        "id": "s0o1",
        "text": "Tak, bardzo chcę się nauczyć żeglowanie!",
        "tr": {
         "uk": "(навчитися **що робити** — інфінітив: **żeglować**)",
         "ru": "(научиться **что делать** — инфинитив: **żeglować**)",
         "en": "(learn **to do** — infinitive)"
        }
       },
       {
        "id": "s0o2",
        "text": "Tak, bardzo chcę się nauczył żeglować!",
        "tr": {
         "uk": "(після **chcę** — інфінітив: **nauczyć się**)",
         "ru": "(после **chcę** — инфинитив: **nauczyć się**)",
         "en": "(after **chcę** use the infinitive: **nauczyć się**)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "nauczyć się **żeglować** (можна й «żeglowania», але не «żeglowanie»).",
       "ru": "nauczyć się **żeglować** (можно и «żeglowania», но не «żeglowanie»).",
       "en": "nauczyć się **żeglować**."
      }
     },
     {
      "npc": "Ma pan kamizelkę ratunkową?",
      "npcTr": {
       "uk": "У вас є рятувальний жилет?",
       "ru": "У вас есть спасательный жилет?",
       "en": "Do you have a life jacket?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Nie mam. Czy mogę wypożyczyć kamizelkę?",
        "tr": {
         "uk": "Не маю. Можна взяти жилет напрокат?",
         "ru": "Нет. Можно взять жилет напрокат?",
         "en": "No. Can I rent one?"
        }
       },
       {
        "id": "s1o1",
        "text": "Nie mam. Czy mogę wypożyczyć kamizelka?",
        "tr": {
         "uk": "(що? — знахідний: **kamizelkę**)",
         "ru": "(что? — винительный: **kamizelkę**)",
         "en": "(accusative: **kamizelkę**)"
        }
       },
       {
        "id": "s1o2",
        "text": "Mam. Czy mogę wypożyczyć kamizelkę?",
        "tr": {
         "uk": "(**Mam** — «є»; але далі просиш на прокат: на «Ma pan…?» без жилета — **Nie mam**)",
         "ru": "(**Mam** — «есть»; но дальше просишь напрокат: на «Ma pan…?» без жилета — **Nie mam**)",
         "en": "(**Mam** means “I have one”, yet you then ask to rent one: without a vest say **Nie mam**)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "wypożyczyć **kamizelkę** — знахідний.",
       "ru": "wypożyczyć **kamizelkę** — винительный.",
       "en": "Accusative: **kamizelkę**."
      }
     }
    ]
   },
   "explanation": null
  }
 },
 {
  "lesson": "gdy-7-kontuzja",
  "n": 0,
  "from": {
   "type": "SITUATION",
   "skill": "dialogue.injury",
   "data": {
    "npc": {
     "name": "Doktor Lis",
     "emoji": "👩🏻‍⚕️",
     "role": {
      "uk": "лікарка в травмпункті",
      "ru": "врач в травмпункте",
      "en": "an A&E doctor"
     }
    },
    "scene": {
     "uk": "Травмпункт після матчу",
     "ru": "Травмпункт после матча",
     "en": "A clinic after the match"
    },
    "steps": [
     {
      "npc": "Dzień dobry. Co pana boli?",
      "npcTr": {
       "uk": "Добрий день. Що у вас болить?",
       "ru": "Добрый день. Что у вас болит?",
       "en": "Hello. What hurts?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Boli mnie kolano, od wczorajszego meczu.",
        "tr": {
         "uk": "Болить коліно, від учорашнього матчу.",
         "ru": "Болит колено, со вчерашнего матча.",
         "en": "My knee — since yesterday’s match."
        }
       },
       {
        "id": "s0o1",
        "text": "Boli mi kolano, od wczorajszego meczu.",
        "tr": {
         "uk": "(кажуть **boli mnie**, не «boli mi»)",
         "ru": "(говорят **boli mnie**, не «boli mi»)",
         "en": "(**boli mnie**, not «mi»)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "**boli mnie** kolano.",
       "ru": "**boli mnie** kolano.",
       "en": "**boli mnie**."
      }
     },
     {
      "npc": "To nic poważnego. Ale przez tydzień nie może pan biegać.",
      "npcTr": {
       "uk": "Нічого серйозного. Але тиждень вам не можна бігати.",
       "ru": "Ничего серьёзного. Но неделю вам нельзя бегать.",
       "en": "Nothing serious. But no running for a week."
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Rozumiem. Muszę odpocząć.",
        "tr": {
         "uk": "Зрозумів. Мені треба відпочити.",
         "ru": "Понял. Мне нужно отдохнуть.",
         "en": "I see. I need to rest."
        }
       },
       {
        "id": "s1o1",
        "text": "Rozumiem. Muszę odpoczywam.",
        "tr": {
         "uk": "(після **muszę** — інфінітив: **odpocząć**)",
         "ru": "(после **muszę** — инфинитив: **odpocząć**)",
         "en": "(**muszę** + infinitive)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "**muszę odpocząć** — інфінітив.",
       "ru": "**muszę odpocząć** — инфинитив.",
       "en": "Infinitive after **muszę**."
      }
     }
    ]
   },
   "explanation": null
  },
  "to": {
   "type": "SITUATION",
   "skill": "dialogue.injury",
   "data": {
    "npc": {
     "name": "Doktor Lis",
     "emoji": "👩🏻‍⚕️",
     "role": {
      "uk": "лікарка в травмпункті",
      "ru": "врач в травмпункте",
      "en": "an A&E doctor"
     }
    },
    "scene": {
     "uk": "Травмпункт після матчу",
     "ru": "Травмпункт после матча",
     "en": "A clinic after the match"
    },
    "steps": [
     {
      "npc": "Dzień dobry. Co pana boli?",
      "npcTr": {
       "uk": "Добрий день. Що у вас болить?",
       "ru": "Добрый день. Что у вас болит?",
       "en": "Hello. What hurts?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Boli mnie kolano, od wczorajszego meczu.",
        "tr": {
         "uk": "Болить коліно, від учорашнього матчу.",
         "ru": "Болит колено, со вчерашнего матча.",
         "en": "My knee — since yesterday’s match."
        }
       },
       {
        "id": "s0o1",
        "text": "Boli mi kolano, od wczorajszego meczu.",
        "tr": {
         "uk": "(кажуть **boli mnie**, не «boli mi»)",
         "ru": "(говорят **boli mnie**, не «boli mi»)",
         "en": "(**boli mnie**, not «mi»)"
        }
       },
       {
        "id": "s0o2",
        "text": "Boli mnie kolana, od wczorajszego meczu.",
        "tr": {
         "uk": "(**kolano** — однина: **boli** mnie kolano; багато — **bolą** mnie kolana)",
         "ru": "(**kolano** — единственное число: **boli** mnie kolano; много — **bolą** mnie kolana)",
         "en": "(**kolano** is singular: **boli** mnie kolano; for many — **bolą** mnie kolana)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "**boli mnie** kolano.",
       "ru": "**boli mnie** kolano.",
       "en": "**boli mnie**."
      }
     },
     {
      "npc": "To nic poważnego. Ale przez tydzień nie może pan biegać.",
      "npcTr": {
       "uk": "Нічого серйозного. Але тиждень вам не можна бігати.",
       "ru": "Ничего серьёзного. Но неделю вам нельзя бегать.",
       "en": "Nothing serious. But no running for a week."
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Rozumiem. Muszę odpocząć.",
        "tr": {
         "uk": "Зрозумів. Мені треба відпочити.",
         "ru": "Понял. Мне нужно отдохнуть.",
         "en": "I see. I need to rest."
        }
       },
       {
        "id": "s1o1",
        "text": "Rozumiem. Muszę odpoczywam.",
        "tr": {
         "uk": "(після **muszę** — інфінітив: **odpocząć**)",
         "ru": "(после **muszę** — инфинитив: **odpocząć**)",
         "en": "(**muszę** + infinitive)"
        }
       },
       {
        "id": "s1o2",
        "text": "Rozumiem. Jutro będę biegać.",
        "tr": {
         "uk": "(лікар сказав: тиждень **не можна** бігати; «jutro będę biegać» суперечить)",
         "ru": "(врач сказал: неделю **нельзя** бегать; «jutro będę biegać» противоречит)",
         "en": "(the doctor said no running for a week; “jutro będę biegać” contradicts that)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "**muszę odpocząć** — інфінітив.",
       "ru": "**muszę odpocząć** — инфинитив.",
       "en": "Infinitive after **muszę**."
      }
     }
    ]
   },
   "explanation": null
  }
 },
 {
  "lesson": "gdy-8-hobby",
  "n": 0,
  "from": {
   "type": "DIALOGUE",
   "skill": "dialogue.free-time",
   "data": {
    "npc": {
     "name": "Michał",
     "emoji": "👨🏻",
     "role": {
      "uk": "новий знайомий із клубу",
      "ru": "новый знакомый из клуба",
      "en": "a new friend from the club"
     }
    },
    "steps": [
     {
      "npc": "Co robisz w wolnym czasie?",
      "npcTr": {
       "uk": "Що ти робиш у вільний час?",
       "ru": "Что ты делаешь в свободное время?",
       "en": "What do you do in your free time?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Gotuję, czytam i fotografuję statki w porcie.",
        "tr": {
         "uk": "Готую, читаю й фотографую кораблі в порту.",
         "ru": "Готовлю, читаю и фотографирую корабли в порту.",
         "en": "I cook, read and photograph ships in the port."
        }
       },
       {
        "id": "s0o1",
        "text": "Gotuję, czytam i fotografować statki w porcie.",
        "tr": {
         "uk": "(усі дієслова в одній особі: **fotografuję**)",
         "ru": "(все глаголы в одном лице: **fotografuję**)",
         "en": "(same person: **fotografuję**)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "ja **gotuję**, **czytam**, **fotografuję**.",
       "ru": "ja **gotuję**, **czytam**, **fotografuję**.",
       "en": "ja: **fotografuję**."
      }
     },
     {
      "npc": "Super! Chodźmy w sobotę na Bulwar Nadmorski robić zdjęcia!",
      "npcTr": {
       "uk": "Супер! Ходімо в суботу на Приморський бульвар фотографувати!",
       "ru": "Супер! Пойдём в субботу на Приморский бульвар фотографировать!",
       "en": "Great! Let’s go to the seafront on Saturday to take photos!"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Chętnie! Spotkajmy się o dziesiątej przy molo.",
        "tr": {
         "uk": "Залюбки! Зустріньмося о десятій біля молу.",
         "ru": "С удовольствием! Встретимся в десять у мола.",
         "en": "Sure! Let’s meet at ten by the pier."
        }
       },
       {
        "id": "s1o1",
        "text": "Chętnie! Spotkajcie się o dziesiątej przy molo.",
        "tr": {
         "uk": "(«давай ми» — **spotkajmy się**; «spotkajcie się» — наказ іншим)",
         "ru": "(«давай мы» — **spotkajmy się**; «spotkajcie się» — приказ другим)",
         "en": "(«let’s» = **spotkajmy się**)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "**-my**: spotkajmy się, chodźmy, zagrajmy.",
       "ru": "**-my**: spotkajmy się, chodźmy, zagrajmy.",
       "en": "**-my** = let’s."
      }
     }
    ]
   },
   "explanation": null
  },
  "to": {
   "type": "DIALOGUE",
   "skill": "dialogue.free-time",
   "data": {
    "npc": {
     "name": "Michał",
     "emoji": "👨🏻",
     "role": {
      "uk": "новий знайомий із клубу",
      "ru": "новый знакомый из клуба",
      "en": "a new friend from the club"
     }
    },
    "steps": [
     {
      "npc": "Co robisz w wolnym czasie?",
      "npcTr": {
       "uk": "Що ти робиш у вільний час?",
       "ru": "Что ты делаешь в свободное время?",
       "en": "What do you do in your free time?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Gotuję, czytam i fotografuję statki w porcie.",
        "tr": {
         "uk": "Готую, читаю й фотографую кораблі в порту.",
         "ru": "Готовлю, читаю и фотографирую корабли в порту.",
         "en": "I cook, read and photograph ships in the port."
        }
       },
       {
        "id": "s0o1",
        "text": "Gotuję, czytam i fotografować statki w porcie.",
        "tr": {
         "uk": "(усі дієслова в одній особі: **fotografuję**)",
         "ru": "(все глаголы в одном лице: **fotografuję**)",
         "en": "(same person: **fotografuję**)"
        }
       },
       {
        "id": "s0o2",
        "text": "Gotuję, czytam i fotografuje statki w porcie.",
        "tr": {
         "uk": "(**fotografuję** — 1-а особа, як **gotuję**, **czytam**)",
         "ru": "(**fotografuję** — 1-е лицо, как **gotuję**, **czytam**)",
         "en": "(**fotografuję** is 1st person, like **gotuję** and **czytam**)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "ja **gotuję**, **czytam**, **fotografuję**.",
       "ru": "ja **gotuję**, **czytam**, **fotografuję**.",
       "en": "ja: **fotografuję**."
      }
     },
     {
      "npc": "Super! Chodźmy w sobotę na Bulwar Nadmorski robić zdjęcia!",
      "npcTr": {
       "uk": "Супер! Ходімо в суботу на Приморський бульвар фотографувати!",
       "ru": "Супер! Пойдём в субботу на Приморский бульвар фотографировать!",
       "en": "Great! Let’s go to the seafront on Saturday to take photos!"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Chętnie! Spotkajmy się o dziesiątej przy molo.",
        "tr": {
         "uk": "Залюбки! Зустріньмося о десятій біля молу.",
         "ru": "С удовольствием! Встретимся в десять у мола.",
         "en": "Sure! Let’s meet at ten by the pier."
        }
       },
       {
        "id": "s1o1",
        "text": "Chętnie! Spotkajcie się o dziesiątej przy molo.",
        "tr": {
         "uk": "(«давай ми» — **spotkajmy się**; «spotkajcie się» — наказ іншим)",
         "ru": "(«давай мы» — **spotkajmy się**; «spotkajcie się» — приказ другим)",
         "en": "(«let’s» = **spotkajmy się**)"
        }
       },
       {
        "id": "s1o2",
        "text": "Chętnie! Spotkajmy się o dziesiątą przy molo.",
        "tr": {
         "uk": "(час — **o** + місцевий: **o dziesiątej**)",
         "ru": "(время — **o** + предложный: **o dziesiątej**)",
         "en": "(time uses **o** + locative: **o dziesiątej**)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "**-my**: spotkajmy się, chodźmy, zagrajmy.",
       "ru": "**-my**: spotkajmy się, chodźmy, zagrajmy.",
       "en": "**-my** = let’s."
      }
     }
    ]
   },
   "explanation": null
  }
 },
 {
  "lesson": "gdy-boss",
  "n": 0,
  "from": {
   "type": "SITUATION",
   "skill": "situation.boss",
   "data": {
    "npc": {
     "name": "Michał",
     "emoji": "👨🏻",
     "role": {
      "uk": "новий знайомий із клубу",
      "ru": "новый знакомый из клуба",
      "en": "a new friend from the club"
     }
    },
    "scene": {
     "uk": "Корти біля Приморського бульвару",
     "ru": "Корты у Приморского бульвара",
     "en": "Tennis courts by the seafront"
    },
    "steps": [
     {
      "npc": "Cześć! Grasz w siatkówkę? Brakuje nam jednej osoby.",
      "npcTr": {
       "uk": "Привіт! Граєш у волейбол? Нам бракує однієї людини.",
       "ru": "Привет! Играешь в волейбол? Нам не хватает одного человека.",
       "en": "Hi! Do you play volleyball? We’re one short."
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Niestety nie, ale gram w tenisa i na gitarze.",
        "tr": {
         "uk": "На жаль, ні, але я граю в теніс і на гітарі.",
         "ru": "К сожалению, нет, но я играю в теннис и на гитаре.",
         "en": "Sadly not, but I play tennis and the guitar."
        }
       },
       {
        "id": "s0o1",
        "text": "Niestety nie, ale gram w tenisa i w gitarę.",
        "tr": {
         "uk": "(інструмент — **na gitarze**)",
         "ru": "(инструмент — **na gitarze**)",
         "en": "(instrument: **na gitarze**)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "**w** tenisa, **na** gitarze.",
       "ru": "**w** tenisa, **na** gitarze.",
       "en": "**w** + games, **na** + instruments."
      }
     },
     {
      "npc": "To zagrajmy jutro w tenisa! Jak często trenujesz?",
      "npcTr": {
       "uk": "Тоді зіграймо завтра в теніс! Як часто ти тренуєшся?",
       "ru": "Тогда давай завтра сыграем в теннис! Как часто ты тренируешься?",
       "en": "Then let’s play tennis tomorrow! How often do you train?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Dwa razy w tygodniu, we wtorki i w czwartki.",
        "tr": {
         "uk": "Двічі на тиждень, у вівторки й четверги.",
         "ru": "Два раза в неделю, по вторникам и четвергам.",
         "en": "Twice a week, on Tuesdays and Thursdays."
        }
       },
       {
        "id": "s1o1",
        "text": "Dwa raz w tygodniu, we wtorki i w czwartki.",
        "tr": {
         "uk": "(**dwa razy**)",
         "ru": "(**dwa razy**)",
         "en": "(**dwa razy**)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "**raz**, але **dwa razy**.",
       "ru": "**raz**, но **dwa razy**.",
       "en": "**raz** → **razy**."
      }
     }
    ]
   },
   "explanation": null
  },
  "to": {
   "type": "SITUATION",
   "skill": "situation.boss",
   "data": {
    "npc": {
     "name": "Michał",
     "emoji": "👨🏻",
     "role": {
      "uk": "новий знайомий із клубу",
      "ru": "новый знакомый из клуба",
      "en": "a new friend from the club"
     }
    },
    "scene": {
     "uk": "Корти біля Приморського бульвару",
     "ru": "Корты у Приморского бульвара",
     "en": "Tennis courts by the seafront"
    },
    "steps": [
     {
      "npc": "Cześć! Grasz w siatkówkę? Brakuje nam jednej osoby.",
      "npcTr": {
       "uk": "Привіт! Граєш у волейбол? Нам бракує однієї людини.",
       "ru": "Привет! Играешь в волейбол? Нам не хватает одного человека.",
       "en": "Hi! Do you play volleyball? We’re one short."
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Niestety nie, ale gram w tenisa i na gitarze.",
        "tr": {
         "uk": "На жаль, ні, але я граю в теніс і на гітарі.",
         "ru": "К сожалению, нет, но я играю в теннис и на гитаре.",
         "en": "Sadly not, but I play tennis and the guitar."
        }
       },
       {
        "id": "s0o1",
        "text": "Niestety nie, ale gram w tenisa i w gitarę.",
        "tr": {
         "uk": "(інструмент — **na gitarze**)",
         "ru": "(инструмент — **na gitarze**)",
         "en": "(instrument: **na gitarze**)"
        }
       },
       {
        "id": "s0o2",
        "text": "Niestety nie, ale gram na tenisa i na gitarze.",
        "tr": {
         "uk": "(гра — **w** + знахідний: **w tenisa**; на інструменті — **na gitarze**)",
         "ru": "(игра — **w** + винительный: **w tenisa**; на инструменте — **na gitarze**)",
         "en": "(a game takes **w** + accusative: **w tenisa**; an instrument — **na gitarze**)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "**w** tenisa, **na** gitarze.",
       "ru": "**w** tenisa, **na** gitarze.",
       "en": "**w** + games, **na** + instruments."
      }
     },
     {
      "npc": "To zagrajmy jutro w tenisa! Jak często trenujesz?",
      "npcTr": {
       "uk": "Тоді зіграймо завтра в теніс! Як часто ти тренуєшся?",
       "ru": "Тогда давай завтра сыграем в теннис! Как часто ты тренируешься?",
       "en": "Then let’s play tennis tomorrow! How often do you train?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Dwa razy w tygodniu, we wtorki i w czwartki.",
        "tr": {
         "uk": "Двічі на тиждень, у вівторки й четверги.",
         "ru": "Два раза в неделю, по вторникам и четвергам.",
         "en": "Twice a week, on Tuesdays and Thursdays."
        }
       },
       {
        "id": "s1o1",
        "text": "Dwa raz w tygodniu, we wtorki i w czwartki.",
        "tr": {
         "uk": "(**dwa razy**)",
         "ru": "(**dwa razy**)",
         "en": "(**dwa razy**)"
        }
       },
       {
        "id": "s1o2",
        "text": "Dwa razy w tygodniu, w wtorki i w czwartki.",
        "tr": {
         "uk": "(перед **w-** / **f-** — **we**: **we wtorki**)",
         "ru": "(перед **w-** / **f-** — **we**: **we wtorki**)",
         "en": "(before **w-** / **f-** use **we**: **we wtorki**)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "**raz**, але **dwa razy**.",
       "ru": "**raz**, но **dwa razy**.",
       "en": "**raz** → **razy**."
      }
     }
    ]
   },
   "explanation": null
  }
 },
 {
  "lesson": "byd-1-weekend",
  "n": 0,
  "from": {
   "type": "DIALOGUE",
   "skill": "dialogue.past",
   "data": {
    "npc": {
     "name": "Aga",
     "emoji": "👩🏻",
     "role": {
      "uk": "подруга з курсу польської",
      "ru": "подруга с курса польского",
      "en": "a friend from Polish class"
     }
    },
    "steps": [
     {
      "npc": "Cześć! Jak spędziliście weekend?",
      "npcTr": {
       "uk": "Привіт! Як ви провели вихідні?",
       "ru": "Привет! Как вы провели выходные?",
       "en": "Hi! How did you spend the weekend?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Super! Byliśmy z mężem nad Brdą.",
        "tr": {
         "uk": "Супер! Ми з чоловіком були над Брдою.",
         "ru": "Супер! Мы с мужем были на Брде.",
         "en": "Great! My husband and I were by the Brda."
        }
       },
       {
        "id": "s0o1",
        "text": "Super! Byłyśmy z mężem nad Brdą.",
        "tr": {
         "uk": "(у групі є чоловік — **-liśmy**: **byliśmy**)",
         "ru": "(в группе есть мужчина — **-liśmy**: **byliśmy**)",
         "en": "(a man in the group: **byliśmy**)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "Є чоловік у групі — **byliśmy**; лише жінки — **byłyśmy**.",
       "ru": "Есть мужчина в группе — **byliśmy**; только женщины — **byłyśmy**.",
       "en": "Mixed group — **byliśmy**; women only — **byłyśmy**."
      }
     },
     {
      "npc": "A kiedy wróciliście do domu?",
      "npcTr": {
       "uk": "А коли ви повернулися додому?",
       "ru": "А когда вы вернулись домой?",
       "en": "And when did you get home?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "W niedzielę wieczorem, bardzo zmęczeni.",
        "tr": {
         "uk": "У неділю ввечері, дуже втомлені.",
         "ru": "В воскресенье вечером, очень уставшие.",
         "en": "On Sunday evening, very tired."
        }
       },
       {
        "id": "s1o1",
        "text": "W niedzielę wieczorem, bardzo zmęczony.",
        "tr": {
         "uk": "(нас двоє — прикметник у множині: **zmęczeni**)",
         "ru": "(нас двое — прилагательное во множественном: **zmęczeni**)",
         "en": "(plural adjective: **zmęczeni**)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "byliśmy **zmęczeni** — прикметник у множині.",
       "ru": "byliśmy **zmęczeni** — прилагательное во множественном.",
       "en": "byliśmy **zmęczeni** — plural."
      }
     }
    ]
   },
   "explanation": null
  },
  "to": {
   "type": "DIALOGUE",
   "skill": "dialogue.past",
   "data": {
    "npc": {
     "name": "Aga",
     "emoji": "👩🏻",
     "role": {
      "uk": "подруга з курсу польської",
      "ru": "подруга с курса польского",
      "en": "a friend from Polish class"
     }
    },
    "steps": [
     {
      "npc": "Cześć! Jak spędziliście weekend?",
      "npcTr": {
       "uk": "Привіт! Як ви провели вихідні?",
       "ru": "Привет! Как вы провели выходные?",
       "en": "Hi! How did you spend the weekend?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Super! Byliśmy z mężem nad Brdą.",
        "tr": {
         "uk": "Супер! Ми з чоловіком були над Брдою.",
         "ru": "Супер! Мы с мужем были на Брде.",
         "en": "Great! My husband and I were by the Brda."
        }
       },
       {
        "id": "s0o1",
        "text": "Super! Byłyśmy z mężem nad Brdą.",
        "tr": {
         "uk": "(у групі є чоловік — **-liśmy**: **byliśmy**)",
         "ru": "(в группе есть мужчина — **-liśmy**: **byliśmy**)",
         "en": "(a man in the group: **byliśmy**)"
        }
       },
       {
        "id": "s0o2",
        "text": "Super! Byli z mężem nad Brdą.",
        "tr": {
         "uk": "(про себе й чоловіка — «ми»: **byliśmy**; **byli** — «вони були»)",
         "ru": "(о себе и муже — «мы»: **byliśmy**; **byli** — «они были»)",
         "en": "(about yourselves — “we”: **byliśmy**; **byli** means “they were”)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "Є чоловік у групі — **byliśmy**; лише жінки — **byłyśmy**.",
       "ru": "Есть мужчина в группе — **byliśmy**; только женщины — **byłyśmy**.",
       "en": "Mixed group — **byliśmy**; women only — **byłyśmy**."
      }
     },
     {
      "npc": "A kiedy wróciliście do domu?",
      "npcTr": {
       "uk": "А коли ви повернулися додому?",
       "ru": "А когда вы вернулись домой?",
       "en": "And when did you get home?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "W niedzielę wieczorem, bardzo zmęczeni.",
        "tr": {
         "uk": "У неділю ввечері, дуже втомлені.",
         "ru": "В воскресенье вечером, очень уставшие.",
         "en": "On Sunday evening, very tired."
        }
       },
       {
        "id": "s1o1",
        "text": "W niedzielę wieczorem, bardzo zmęczony.",
        "tr": {
         "uk": "(нас двоє — прикметник у множині: **zmęczeni**)",
         "ru": "(нас двое — прилагательное во множественном: **zmęczeni**)",
         "en": "(plural adjective: **zmęczeni**)"
        }
       },
       {
        "id": "s1o2",
        "text": "W niedzielę wieczorem, bardzo zmęczone.",
        "tr": {
         "uk": "(у групі є чоловік: **zmęczeni**; «zmęczone» — лише жінки)",
         "ru": "(в группе есть мужчина: **zmęczeni**; «zmęczone» — только женщины)",
         "en": "(the group includes a man: **zmęczeni**; “zmęczone” is for women only)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "byliśmy **zmęczeni** — прикметник у множині.",
       "ru": "byliśmy **zmęczeni** — прилагательное во множественном.",
       "en": "byliśmy **zmęczeni** — plural."
      }
     }
    ]
   },
   "explanation": null
  }
 },
 {
  "lesson": "byd-2-aspekt",
  "n": 0,
  "from": {
   "type": "DIALOGUE",
   "skill": "dialogue.aspect",
   "data": {
    "npc": {
     "name": "Marek",
     "emoji": "🧑🏻",
     "role": {
      "uk": "колега з роботи",
      "ru": "коллега с работы",
      "en": "a colleague"
     }
    },
    "steps": [
     {
      "npc": "Co robiłeś wczoraj wieczorem?",
      "npcTr": {
       "uk": "Що ти робив учора ввечері?",
       "ru": "Что ты делал вчера вечером?",
       "en": "What were you doing last night?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Długo oglądałem serial, a potem czytałem.",
        "tr": {
         "uk": "Довго дивився серіал, а потім читав.",
         "ru": "Долго смотрел сериал, а потом читал.",
         "en": "I watched a series for a long time, then read."
        }
       },
       {
        "id": "s0o1",
        "text": "Długo obejrzałem serial, a potem czytałem.",
        "tr": {
         "uk": "(«długo» — процес: недоконаний **oglądałem**)",
         "ru": "(«długo» — процесс: несовершенный **oglądałem**)",
         "en": "(«długo» = process: **oglądałem**)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "Процес — **oglądałem**, результат — **obejrzałem**.",
       "ru": "Процесс — **oglądałem**, результат — **obejrzałem**.",
       "en": "Process — **oglądałem**; result — **obejrzałem**."
      }
     },
     {
      "npc": "I co, skończyłeś już tę książkę?",
      "npcTr": {
       "uk": "І що, ти вже закінчив ту книжку?",
       "ru": "И что, ты уже закончил ту книгу?",
       "en": "So, have you finished that book?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Tak, przeczytałem ją do końca.",
        "tr": {
         "uk": "Так, я прочитав її до кінця.",
         "ru": "Да, я прочитал её до конца.",
         "en": "Yes, I read it to the end."
        }
       },
       {
        "id": "s1o1",
        "text": "Tak, czytałem ją do końca.",
        "tr": {
         "uk": "(«do końca» — результат: доконаний **przeczytałem**)",
         "ru": "(«do końca» — результат: совершенный **przeczytałem**)",
         "en": "(«do końca» = result: **przeczytałem**)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "Є результат — доконаний: **przeczytałem**.",
       "ru": "Есть результат — совершенный: **przeczytałem**.",
       "en": "Result — perfective: **przeczytałem**."
      }
     }
    ]
   },
   "explanation": null
  },
  "to": {
   "type": "DIALOGUE",
   "skill": "dialogue.aspect",
   "data": {
    "npc": {
     "name": "Marek",
     "emoji": "🧑🏻",
     "role": {
      "uk": "колега з роботи",
      "ru": "коллега с работы",
      "en": "a colleague"
     }
    },
    "steps": [
     {
      "npc": "Co robiłeś wczoraj wieczorem?",
      "npcTr": {
       "uk": "Що ти робив учора ввечері?",
       "ru": "Что ты делал вчера вечером?",
       "en": "What were you doing last night?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Długo oglądałem serial, a potem czytałem.",
        "tr": {
         "uk": "Довго дивився серіал, а потім читав.",
         "ru": "Долго смотрел сериал, а потом читал.",
         "en": "I watched a series for a long time, then read."
        }
       },
       {
        "id": "s0o1",
        "text": "Długo obejrzałem serial, a potem czytałem.",
        "tr": {
         "uk": "(«długo» — процес: недоконаний **oglądałem**)",
         "ru": "(«długo» — процесс: несовершенный **oglądałem**)",
         "en": "(«długo» = process: **oglądałem**)"
        }
       },
       {
        "id": "s0o2",
        "text": "Długo będę oglądał serial, a potem czytałem.",
        "tr": {
         "uk": "(вчора — минуле: **oglądałem**; **będę oglądał** — майбутнє)",
         "ru": "(вчера — прошедшее: **oglądałem**; **będę oglądał** — будущее)",
         "en": "(yesterday is past: **oglądałem**; **będę oglądał** is future)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "Процес — **oglądałem**, результат — **obejrzałem**.",
       "ru": "Процесс — **oglądałem**, результат — **obejrzałem**.",
       "en": "Process — **oglądałem**; result — **obejrzałem**."
      }
     },
     {
      "npc": "I co, skończyłeś już tę książkę?",
      "npcTr": {
       "uk": "І що, ти вже закінчив ту книжку?",
       "ru": "И что, ты уже закончил ту книгу?",
       "en": "So, have you finished that book?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Tak, przeczytałem ją do końca.",
        "tr": {
         "uk": "Так, я прочитав її до кінця.",
         "ru": "Да, я прочитал её до конца.",
         "en": "Yes, I read it to the end."
        }
       },
       {
        "id": "s1o1",
        "text": "Tak, czytałem ją do końca.",
        "tr": {
         "uk": "(«do końca» — результат: доконаний **przeczytałem**)",
         "ru": "(«do końca» — результат: совершенный **przeczytałem**)",
         "en": "(«do końca» = result: **przeczytałem**)"
        }
       },
       {
        "id": "s1o2",
        "text": "Tak, przeczytam ją do końca.",
        "tr": {
         "uk": "(питають про вже зроблене: **przeczytałem**; **przeczytam** — «прочитаю»)",
         "ru": "(спрашивают о уже сделанном: **przeczytałem**; **przeczytam** — «прочитаю»)",
         "en": "(the question is about what is done: **przeczytałem**; **przeczytam** means “I will read”)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "Є результат — доконаний: **przeczytałem**.",
       "ru": "Есть результат — совершенный: **przeczytałem**.",
       "en": "Result — perfective: **przeczytałem**."
      }
     }
    ]
   },
   "explanation": null
  }
 },
 {
  "lesson": "byd-2-aspekt",
  "n": 2,
  "from": {
   "type": "FILL_GAP",
   "skill": "grammar.aspect",
   "data": {
    "pl": "Wczoraj ___ cały film i poszedłem spać.",
    "translation": {
     "uk": "Учора я подивився весь фільм і пішов спати.",
     "ru": "Вчера я посмотрел весь фильм и пошёл спать.",
     "en": "Yesterday I watched the whole film and went to bed."
    },
    "options": [
     {
      "id": "o0",
      "text": "obejrzałem"
     },
     {
      "id": "o1",
      "text": "oglądałem"
     },
     {
      "id": "o2",
      "text": "oglądam"
     }
    ],
    "answer": "o0"
   },
   "explanation": {
    "uk": "Дія завершилася, потім наступна — доконаний: **obejrzałem**.",
    "ru": "Действие закончилось, потом следующее — совершенный: **obejrzałem**.",
    "en": "Finished, then the next action: **obejrzałem**."
   }
  },
  "to": {
   "type": "FILL_GAP",
   "skill": "grammar.aspect",
   "data": {
    "pl": "Wczoraj ___ cały film i poszedłem spać.",
    "translation": {
     "uk": "Учора я подивився весь фільм і пішов спати.",
     "ru": "Вчера я посмотрел весь фильм и пошёл спать.",
     "en": "Yesterday I watched the whole film and went to bed."
    },
    "options": [
     {
      "id": "o0",
      "text": "obejrzałem"
     },
     {
      "id": "o1",
      "text": "oglądałem"
     },
     {
      "id": "o2",
      "text": "obejrzę"
     }
    ],
    "answer": "o0"
   },
   "explanation": {
    "uk": "Дія завершилася, потім наступна — доконаний вид, минулий час: **obejrzałem** (**obejrzę** — майбутнє, а тут «вчора»).",
    "ru": "Действие закончилось, потом следующее — совершенный вид, прошедшее время: **obejrzałem** (**obejrzę** — будущее, а тут «вчера»).",
    "en": "Finished, then the next action — perfective past: **obejrzałem** (**obejrzę** is future, but here it is “yesterday”)."
   }
  }
 },
 {
  "lesson": "byd-3-dziecinstwo",
  "n": 0,
  "from": {
   "type": "DIALOGUE",
   "skill": "dialogue.childhood",
   "data": {
    "npc": {
     "name": "Pan Henryk",
     "emoji": "👴🏻",
     "role": {
      "uk": "сусід-пенсіонер",
      "ru": "сосед-пенсионер",
      "en": "a retired neighbour"
     }
    },
    "steps": [
     {
      "npc": "A gdzie pan mieszkał w dzieciństwie?",
      "npcTr": {
       "uk": "А де ви жили в дитинстві?",
       "ru": "А где вы жили в детстве?",
       "en": "And where did you live as a child?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Na wsi, niedaleko Lublina.",
        "tr": {
         "uk": "У селі, недалеко від Любліна.",
         "ru": "В деревне, недалеко от Люблина.",
         "en": "In a village near Lublin."
        }
       },
       {
        "id": "s0o1",
        "text": "W wsi, niedaleko Lublina.",
        "tr": {
         "uk": "(у селі — **na wsi**)",
         "ru": "(в деревне — **na wsi**)",
         "en": "(**na wsi**)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "Kraj, miasto — **w**, але село — **na wsi**.",
       "ru": "Страна, город — **w**, но деревня — **na wsi**.",
       "en": "Village: **na wsi**."
      }
     },
     {
      "npc": "I co robiliście z kolegami po szkole?",
      "npcTr": {
       "uk": "І що ви робили з друзями після школи?",
       "ru": "И что вы делали с друзьями после школы?",
       "en": "And what did you do with your friends after school?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Całe dnie bawiliśmy się na podwórku.",
        "tr": {
         "uk": "Цілими днями ми гралися у дворі.",
         "ru": "Целыми днями мы играли во дворе.",
         "en": "We played in the yard all day long."
        }
       },
       {
        "id": "s1o1",
        "text": "Całe dnie pobawiliśmy się na podwórku.",
        "tr": {
         "uk": "(повторювана дія — недоконаний: **bawiliśmy się**)",
         "ru": "(повторяющееся действие — несовершенный: **bawiliśmy się**)",
         "en": "(repeated action: **bawiliśmy się**)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "Звичка в минулому — недоконаний вид.",
       "ru": "Привычка в прошлом — несовершенный вид.",
       "en": "Past habit — imperfective."
      }
     }
    ]
   },
   "explanation": null
  },
  "to": {
   "type": "DIALOGUE",
   "skill": "dialogue.childhood",
   "data": {
    "npc": {
     "name": "Pan Henryk",
     "emoji": "👴🏻",
     "role": {
      "uk": "сусід-пенсіонер",
      "ru": "сосед-пенсионер",
      "en": "a retired neighbour"
     }
    },
    "steps": [
     {
      "npc": "A gdzie pan mieszkał w dzieciństwie?",
      "npcTr": {
       "uk": "А де ви жили в дитинстві?",
       "ru": "А где вы жили в детстве?",
       "en": "And where did you live as a child?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Na wsi, niedaleko Lublina.",
        "tr": {
         "uk": "У селі, недалеко від Любліна.",
         "ru": "В деревне, недалеко от Люблина.",
         "en": "In a village near Lublin."
        }
       },
       {
        "id": "s0o1",
        "text": "W wsi, niedaleko Lublina.",
        "tr": {
         "uk": "(у селі — **na wsi**)",
         "ru": "(в деревне — **na wsi**)",
         "en": "(**na wsi**)"
        }
       },
       {
        "id": "s0o2",
        "text": "Na wieś, niedaleko Lublina.",
        "tr": {
         "uk": "(де? — **na wsi** (місцевий); **na wieś** — «у село», напрямок)",
         "ru": "(где? — **na wsi** (предложный); **na wieś** — «в деревню», направление)",
         "en": "(where? — **na wsi** (locative); **na wieś** means “to the village”, a direction)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "Kraj, miasto — **w**, але село — **na wsi**.",
       "ru": "Страна, город — **w**, но деревня — **na wsi**.",
       "en": "Village: **na wsi**."
      }
     },
     {
      "npc": "I co robiliście z kolegami po szkole?",
      "npcTr": {
       "uk": "І що ви робили з друзями після школи?",
       "ru": "И что вы делали с друзьями после школы?",
       "en": "And what did you do with your friends after school?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Całe dnie bawiliśmy się na podwórku.",
        "tr": {
         "uk": "Цілими днями ми гралися у дворі.",
         "ru": "Целыми днями мы играли во дворе.",
         "en": "We played in the yard all day long."
        }
       },
       {
        "id": "s1o1",
        "text": "Całe dnie pobawiliśmy się na podwórku.",
        "tr": {
         "uk": "(повторювана дія — недоконаний: **bawiliśmy się**)",
         "ru": "(повторяющееся действие — несовершенный: **bawiliśmy się**)",
         "en": "(repeated action: **bawiliśmy się**)"
        }
       },
       {
        "id": "s1o2",
        "text": "Całe dnie bawiliście się na podwórku.",
        "tr": {
         "uk": "(про себе — «ми»: **bawiliśmy się**; **bawiliście** — «ви»)",
         "ru": "(о себе — «мы»: **bawiliśmy się**; **bawiliście** — «вы»)",
         "en": "(about yourselves — “we”: **bawiliśmy się**; **bawiliście** means “you (plural)”)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "Звичка в минулому — недоконаний вид.",
       "ru": "Привычка в прошлом — несовершенный вид.",
       "en": "Past habit — imperfective."
      }
     }
    ]
   },
   "explanation": null
  }
 },
 {
  "lesson": "byd-4-pojechalem",
  "n": 0,
  "from": {
   "type": "DIALOGUE",
   "skill": "dialogue.motion",
   "data": {
    "npc": {
     "name": "Aga",
     "emoji": "👩🏻",
     "role": {
      "uk": "подруга з курсу польської",
      "ru": "подруга с курса польского",
      "en": "a friend from Polish class"
     }
    },
    "steps": [
     {
      "npc": "Dawno jesteś w Bydgoszczy?",
      "npcTr": {
       "uk": "Ти давно в Бидгощі?",
       "ru": "Ты давно в Быдгоще?",
       "en": "Have you been in Bydgoszcz long?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Nie, przyjechałem tu dwa lata temu.",
        "tr": {
         "uk": "Ні, я приїхав сюди два роки тому.",
         "ru": "Нет, я приехал сюда два года назад.",
         "en": "No, I came here two years ago."
        }
       },
       {
        "id": "s0o1",
        "text": "Nie, przyjechałem tu przed dwa lata.",
        "tr": {
         "uk": "(«тому» — **temu** після часу: dwa lata **temu**)",
         "ru": "(«назад» — **temu** после срока: dwa lata **temu**)",
         "en": "(“ago” — **temu**)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "dwa lata **temu**, tydzień **temu**.",
       "ru": "dwa lata **temu**, tydzień **temu**.",
       "en": "dwa lata **temu**."
      }
     },
     {
      "npc": "A ostatnio gdzieś byłeś?",
      "npcTr": {
       "uk": "А останнім часом ти десь був?",
       "ru": "А в последнее время ты где-нибудь был?",
       "en": "Have you been anywhere lately?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Tak, w zeszłym miesiącu pojechałem pociągiem do Torunia.",
        "tr": {
         "uk": "Так, минулого місяця я поїхав потягом до Торуня.",
         "ru": "Да, в прошлом месяце я поехал на поезде в Торунь.",
         "en": "Yes, last month I took the train to Toruń."
        }
       },
       {
        "id": "s1o1",
        "text": "Tak, w zeszłym miesiącu poszedłem pociągiem do Torunia.",
        "tr": {
         "uk": "(транспортом — **pojechałem**)",
         "ru": "(на транспорте — **pojechałem**)",
         "en": "(by transport — **pojechałem**)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "Пішки — **poszedłem**, транспортом — **pojechałem**.",
       "ru": "Пешком — **poszedłem**, на транспорте — **pojechałem**.",
       "en": "On foot — **poszedłem**; by transport — **pojechałem**."
      }
     }
    ]
   },
   "explanation": null
  },
  "to": {
   "type": "DIALOGUE",
   "skill": "dialogue.motion",
   "data": {
    "npc": {
     "name": "Aga",
     "emoji": "👩🏻",
     "role": {
      "uk": "подруга з курсу польської",
      "ru": "подруга с курса польского",
      "en": "a friend from Polish class"
     }
    },
    "steps": [
     {
      "npc": "Dawno jesteś w Bydgoszczy?",
      "npcTr": {
       "uk": "Ти давно в Бидгощі?",
       "ru": "Ты давно в Быдгоще?",
       "en": "Have you been in Bydgoszcz long?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Nie, przyjechałem tu dwa lata temu.",
        "tr": {
         "uk": "Ні, я приїхав сюди два роки тому.",
         "ru": "Нет, я приехал сюда два года назад.",
         "en": "No, I came here two years ago."
        }
       },
       {
        "id": "s0o1",
        "text": "Nie, przyjechałem tu przed dwa lata.",
        "tr": {
         "uk": "(«тому» — **temu** після часу: dwa lata **temu**)",
         "ru": "(«назад» — **temu** после срока: dwa lata **temu**)",
         "en": "(“ago” — **temu**)"
        }
       },
       {
        "id": "s0o2",
        "text": "Nie, przyjechałem tu od dwóch lat.",
        "tr": {
         "uk": "(**od dwóch lat** — «вже два роки» (триває); подія в минулому — **dwa lata temu**)",
         "ru": "(**od dwóch lat** — «уже два года» (длится); событие в прошлом — **dwa lata temu**)",
         "en": "(**od dwóch lat** means “for two years” (still going); a past event — **dwa lata temu**)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "dwa lata **temu**, tydzień **temu**.",
       "ru": "dwa lata **temu**, tydzień **temu**.",
       "en": "dwa lata **temu**."
      }
     },
     {
      "npc": "A ostatnio gdzieś byłeś?",
      "npcTr": {
       "uk": "А останнім часом ти десь був?",
       "ru": "А в последнее время ты где-нибудь был?",
       "en": "Have you been anywhere lately?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Tak, w zeszłym miesiącu pojechałem pociągiem do Torunia.",
        "tr": {
         "uk": "Так, минулого місяця я поїхав потягом до Торуня.",
         "ru": "Да, в прошлом месяце я поехал на поезде в Торунь.",
         "en": "Yes, last month I took the train to Toruń."
        }
       },
       {
        "id": "s1o1",
        "text": "Tak, w zeszłym miesiącu poszedłem pociągiem do Torunia.",
        "tr": {
         "uk": "(транспортом — **pojechałem**)",
         "ru": "(на транспорте — **pojechałem**)",
         "en": "(by transport — **pojechałem**)"
        }
       },
       {
        "id": "s1o2",
        "text": "Tak, w zeszłym miesiącu pojechałem pociąg do Torunia.",
        "tr": {
         "uk": "(чим? — орудний: **pociągiem**)",
         "ru": "(чем? — творительный: **pociągiem**)",
         "en": "(by what? — instrumental: **pociągiem**)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "Пішки — **poszedłem**, транспортом — **pojechałem**.",
       "ru": "Пешком — **poszedłem**, на транспорте — **pojechałem**.",
       "en": "On foot — **poszedłem**; by transport — **pojechałem**."
      }
     }
    ]
   },
   "explanation": null
  }
 },
 {
  "lesson": "byd-5-co-sie-stalo",
  "n": 0,
  "from": {
   "type": "DIALOGUE",
   "skill": "dialogue.story",
   "data": {
    "npc": {
     "name": "Policjant",
     "emoji": "👮🏻",
     "role": {
      "uk": "поліцейський на перехресті",
      "ru": "полицейский на перекрёстке",
      "en": "a police officer at a crossing"
     }
    },
    "steps": [
     {
      "npc": "Dzień dobry. Co się stało?",
      "npcTr": {
       "uk": "Добрий день. Що сталося?",
       "ru": "Добрый день. Что случилось?",
       "en": "Good afternoon. What happened?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Był wypadek. Samochód nagle wjechał na chodnik.",
        "tr": {
         "uk": "Сталася аварія. Машина раптом заїхала на тротуар.",
         "ru": "Была авария. Машина вдруг заехала на тротуар.",
         "en": "There was an accident. A car suddenly drove onto the pavement."
        }
       },
       {
        "id": "s0o1",
        "text": "Był wypadek. Samochód nagle wjeżdżał na chodnik.",
        "tr": {
         "uk": "(одна раптова подія — доконаний: **wjechał**)",
         "ru": "(одно внезапное событие — совершенный: **wjechał**)",
         "en": "(a single sudden event: **wjechał**)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "«Nagle» + одна подія — доконаний вид.",
       "ru": "«Nagle» + одно событие — совершенный вид.",
       "en": "«Nagle» + one event — perfective."
      }
     },
     {
      "npc": "Czy ktoś jest ranny?",
      "npcTr": {
       "uk": "Хтось поранений?",
       "ru": "Кто-нибудь ранен?",
       "en": "Is anyone hurt?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Na szczęście nikomu nic się nie stało.",
        "tr": {
         "uk": "На щастя, ніхто не постраждав.",
         "ru": "К счастью, никто не пострадал.",
         "en": "Luckily, nobody was hurt."
        }
       },
       {
        "id": "s1o1",
        "text": "Na szczęście nikt nic się nie stało.",
        "tr": {
         "uk": "(кому? — давальний: **nikomu**)",
         "ru": "(кому? — дательный: **nikomu**)",
         "en": "(to whom? — dative: **nikomu**)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "**Nikomu** nic się nie stało — «нікому нічого не сталося».",
       "ru": "**Nikomu** nic się nie stało — «никому ничего не случилось».",
       "en": "**Nikomu** nic się nie stało."
      }
     }
    ]
   },
   "explanation": null
  },
  "to": {
   "type": "DIALOGUE",
   "skill": "dialogue.story",
   "data": {
    "npc": {
     "name": "Policjant",
     "emoji": "👮🏻",
     "role": {
      "uk": "поліцейський на перехресті",
      "ru": "полицейский на перекрёстке",
      "en": "a police officer at a crossing"
     }
    },
    "steps": [
     {
      "npc": "Dzień dobry. Co się stało?",
      "npcTr": {
       "uk": "Добрий день. Що сталося?",
       "ru": "Добрый день. Что случилось?",
       "en": "Good afternoon. What happened?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Był wypadek. Samochód nagle wjechał na chodnik.",
        "tr": {
         "uk": "Сталася аварія. Машина раптом заїхала на тротуар.",
         "ru": "Была авария. Машина вдруг заехала на тротуар.",
         "en": "There was an accident. A car suddenly drove onto the pavement."
        }
       },
       {
        "id": "s0o1",
        "text": "Był wypadek. Samochód nagle wjeżdżał na chodnik.",
        "tr": {
         "uk": "(одна раптова подія — доконаний: **wjechał**)",
         "ru": "(одно внезапное событие — совершенный: **wjechał**)",
         "en": "(a single sudden event: **wjechał**)"
        }
       },
       {
        "id": "s0o2",
        "text": "Był wypadek. Samochód nagle wjechał na chodnika.",
        "tr": {
         "uk": "(**chodnik** — неживий: знахідний = називний: **na chodnik**)",
         "ru": "(**chodnik** — неодушевлённый: винительный = именительный: **na chodnik**)",
         "en": "(**chodnik** is inanimate: the accusative equals the nominative — **na chodnik**)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "«Nagle» + одна подія — доконаний вид.",
       "ru": "«Nagle» + одно событие — совершенный вид.",
       "en": "«Nagle» + one event — perfective."
      }
     },
     {
      "npc": "Czy ktoś jest ranny?",
      "npcTr": {
       "uk": "Хтось поранений?",
       "ru": "Кто-нибудь ранен?",
       "en": "Is anyone hurt?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Na szczęście nikomu nic się nie stało.",
        "tr": {
         "uk": "На щастя, ніхто не постраждав.",
         "ru": "К счастью, никто не пострадал.",
         "en": "Luckily, nobody was hurt."
        }
       },
       {
        "id": "s1o1",
        "text": "Na szczęście nikt nic się nie stało.",
        "tr": {
         "uk": "(кому? — давальний: **nikomu**)",
         "ru": "(кому? — дательный: **nikomu**)",
         "en": "(to whom? — dative: **nikomu**)"
        }
       },
       {
        "id": "s1o2",
        "text": "Na szczęście nikogo nic się nie stało.",
        "tr": {
         "uk": "(**stać się** + давальний: **nikomu** się nie stało)",
         "ru": "(**stać się** + дательный: **nikomu** się nie stało)",
         "en": "(**stać się** takes the dative: **nikomu** się nie stało)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "**Nikomu** nic się nie stało — «нікому нічого не сталося».",
       "ru": "**Nikomu** nic się nie stało — «никому ничего не случилось».",
       "en": "**Nikomu** nic się nie stało."
      }
     }
    ]
   },
   "explanation": null
  }
 },
 {
  "lesson": "byd-6-zyciorys",
  "n": 0,
  "from": {
   "type": "SITUATION",
   "skill": "dialogue.bio",
   "data": {
    "npc": {
     "name": "Pani Ola",
     "emoji": "👩🏻‍💼",
     "role": {
      "uk": "рекрутерка на співбесіді",
      "ru": "рекрутер на собеседовании",
      "en": "a recruiter at an interview"
     }
    },
    "scene": {
     "uk": "Співбесіда в офісі в Бидгощі",
     "ru": "Собеседование в офисе в Быдгоще",
     "en": "A job interview in Bydgoszcz"
    },
    "steps": [
     {
      "npc": "Proszę opowiedzieć coś o sobie.",
      "npcTr": {
       "uk": "Розкажіть, будь ласка, щось про себе.",
       "ru": "Расскажите, пожалуйста, что-нибудь о себе.",
       "en": "Please tell us a bit about yourself."
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Urodziłem się w Kijowie w 1995 roku.",
        "tr": {
         "uk": "Я народився в Києві в 1995 році.",
         "ru": "Я родился в Киеве в 1995 году.",
         "en": "I was born in Kyiv in 1995."
        }
       },
       {
        "id": "s0o1",
        "text": "Urodziłem się w Kijowie w 1995 rok.",
        "tr": {
         "uk": "(рік — **w … roku**, місцевий)",
         "ru": "(год — **w … roku**, предложный)",
         "en": "(year — **w … roku**)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "**w** 1995 **roku**, **w** zeszłym **roku**.",
       "ru": "**w** 1995 **roku**, **w** zeszłym **roku**.",
       "en": "**w** + year + **roku**."
      }
     },
     {
      "npc": "A kiedy przeprowadził się pan do Polski?",
      "npcTr": {
       "uk": "А коли ви переїхали до Польщі?",
       "ru": "А когда вы переехали в Польшу?",
       "en": "And when did you move to Poland?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Przeprowadziłem się tu po studiach, pięć lat temu.",
        "tr": {
         "uk": "Я переїхав сюди після навчання, п’ять років тому.",
         "ru": "Я переехал сюда после учёбы, пять лет назад.",
         "en": "I moved here after university, five years ago."
        }
       },
       {
        "id": "s1o1",
        "text": "Przeprowadziłem tu po studiach, pięć lat temu.",
        "tr": {
         "uk": "(переїхати — **przeprowadzić się**, з «się»)",
         "ru": "(переехать — **przeprowadzić się**, с «się»)",
         "en": "(**przeprowadzić się** needs «się»)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "**Przeprowadziłem się** — переїхав; без «się» — «перевів (когось)».",
       "ru": "**Przeprowadziłem się** — переехал; без «się» — «перевёл (кого-то)».",
       "en": "**przeprowadzić się** — to move house."
      }
     }
    ]
   },
   "explanation": null
  },
  "to": {
   "type": "SITUATION",
   "skill": "dialogue.bio",
   "data": {
    "npc": {
     "name": "Pani Ola",
     "emoji": "👩🏻‍💼",
     "role": {
      "uk": "рекрутерка на співбесіді",
      "ru": "рекрутер на собеседовании",
      "en": "a recruiter at an interview"
     }
    },
    "scene": {
     "uk": "Співбесіда в офісі в Бидгощі",
     "ru": "Собеседование в офисе в Быдгоще",
     "en": "A job interview in Bydgoszcz"
    },
    "steps": [
     {
      "npc": "Proszę opowiedzieć coś o sobie.",
      "npcTr": {
       "uk": "Розкажіть, будь ласка, щось про себе.",
       "ru": "Расскажите, пожалуйста, что-нибудь о себе.",
       "en": "Please tell us a bit about yourself."
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Urodziłem się w Kijowie w 1995 roku.",
        "tr": {
         "uk": "Я народився в Києві в 1995 році.",
         "ru": "Я родился в Киеве в 1995 году.",
         "en": "I was born in Kyiv in 1995."
        }
       },
       {
        "id": "s0o1",
        "text": "Urodziłem się w Kijowie w 1995 rok.",
        "tr": {
         "uk": "(рік — **w … roku**, місцевий)",
         "ru": "(год — **w … roku**, предложный)",
         "en": "(year — **w … roku**)"
        }
       },
       {
        "id": "s0o2",
        "text": "Urodziłem się w Kijów w 1995 roku.",
        "tr": {
         "uk": "(де? — **w** + місцевий: w **Kijowie**)",
         "ru": "(где? — **w** + предложный: w **Kijowie**)",
         "en": "(where? — **w** + locative: w **Kijowie**)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "**w** 1995 **roku**, **w** zeszłym **roku**.",
       "ru": "**w** 1995 **roku**, **w** zeszłym **roku**.",
       "en": "**w** + year + **roku**."
      }
     },
     {
      "npc": "A kiedy przeprowadził się pan do Polski?",
      "npcTr": {
       "uk": "А коли ви переїхали до Польщі?",
       "ru": "А когда вы переехали в Польшу?",
       "en": "And when did you move to Poland?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Przeprowadziłem się tu po studiach, pięć lat temu.",
        "tr": {
         "uk": "Я переїхав сюди після навчання, п’ять років тому.",
         "ru": "Я переехал сюда после учёбы, пять лет назад.",
         "en": "I moved here after university, five years ago."
        }
       },
       {
        "id": "s1o1",
        "text": "Przeprowadziłem tu po studiach, pięć lat temu.",
        "tr": {
         "uk": "(переїхати — **przeprowadzić się**, з «się»)",
         "ru": "(переехать — **przeprowadzić się**, с «się»)",
         "en": "(**przeprowadzić się** needs «się»)"
        }
       },
       {
        "id": "s1o2",
        "text": "Przeprowadziłem się tu po studiach, za pięć lat.",
        "tr": {
         "uk": "(**za pięć lat** — «через п’ять років» (майбутнє); минуле — **pięć lat temu**)",
         "ru": "(**za pięć lat** — «через пять лет» (будущее); прошлое — **pięć lat temu**)",
         "en": "(**za pięć lat** means “in five years” (future); the past is **pięć lat temu**)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "**Przeprowadziłem się** — переїхав; без «się» — «перевів (когось)».",
       "ru": "**Przeprowadziłem się** — переехал; без «się» — «перевёл (кого-то)».",
       "en": "**przeprowadzić się** — to move house."
      }
     }
    ]
   },
   "explanation": null
  }
 },
 {
  "lesson": "byd-7-plotki",
  "n": 0,
  "from": {
   "type": "DIALOGUE",
   "skill": "dialogue.reported",
   "data": {
    "npc": {
     "name": "Pani Krysia",
     "emoji": "👵🏼",
     "role": {
      "uk": "сусідка, яка знає всі новини",
      "ru": "соседка, которая знает все новости",
      "en": "a neighbour who knows all the news"
     }
    },
    "steps": [
     {
      "npc": "Słyszał pan? Podobno nowy sąsiad jest muzykiem!",
      "npcTr": {
       "uk": "Ви чули? Кажуть, новий сусід — музикант!",
       "ru": "Вы слышали? Говорят, новый сосед — музыкант!",
       "en": "Have you heard? Apparently the new neighbour is a musician!"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Tak, wczoraj powiedział mi, że gra w operze.",
        "tr": {
         "uk": "Так, учора він сказав мені, що грає в опері.",
         "ru": "Да, вчера он сказал мне, что играет в опере.",
         "en": "Yes, yesterday he told me he plays at the opera."
        }
       },
       {
        "id": "s0o1",
        "text": "Tak, wczoraj powiedział mi, czy gra w operze.",
        "tr": {
         "uk": "(твердження — **że**)",
         "ru": "(утверждение — **że**)",
         "en": "(statement — **że**)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "Powiedział, **że**…",
       "ru": "Powiedział, **że**…",
       "en": "Powiedział, **że**…"
      }
     },
     {
      "npc": "A zapytał go pan, czy zostanie tu na dłużej?",
      "npcTr": {
       "uk": "А ви спитали його, чи він залишиться тут надовго?",
       "ru": "А вы спросили его, останется ли он здесь надолго?",
       "en": "And did you ask if he’s staying for long?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Zapytałem, ale odpowiedział, że jeszcze nie wie.",
        "tr": {
         "uk": "Спитав, але він відповів, що ще не знає.",
         "ru": "Спросил, но он ответил, что ещё не знает.",
         "en": "I asked, but he said he doesn’t know yet."
        }
       },
       {
        "id": "s1o1",
        "text": "Zapytałem, ale odpowiedział, czy jeszcze nie wie.",
        "tr": {
         "uk": "(відповідь — твердження: **że**)",
         "ru": "(ответ — утверждение: **że**)",
         "en": "(an answer is a statement: **że**)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "Питання — **czy**, відповідь — **że**.",
       "ru": "Вопрос — **czy**, ответ — **że**.",
       "en": "Question — **czy**; answer — **że**."
      }
     }
    ]
   },
   "explanation": null
  },
  "to": {
   "type": "DIALOGUE",
   "skill": "dialogue.reported",
   "data": {
    "npc": {
     "name": "Pani Krysia",
     "emoji": "👵🏼",
     "role": {
      "uk": "сусідка, яка знає всі новини",
      "ru": "соседка, которая знает все новости",
      "en": "a neighbour who knows all the news"
     }
    },
    "steps": [
     {
      "npc": "Słyszał pan? Podobno nowy sąsiad jest muzykiem!",
      "npcTr": {
       "uk": "Ви чули? Кажуть, новий сусід — музикант!",
       "ru": "Вы слышали? Говорят, новый сосед — музыкант!",
       "en": "Have you heard? Apparently the new neighbour is a musician!"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Tak, wczoraj powiedział mi, że gra w operze.",
        "tr": {
         "uk": "Так, учора він сказав мені, що грає в опері.",
         "ru": "Да, вчера он сказал мне, что играет в опере.",
         "en": "Yes, yesterday he told me he plays at the opera."
        }
       },
       {
        "id": "s0o1",
        "text": "Tak, wczoraj powiedział mi, czy gra w operze.",
        "tr": {
         "uk": "(твердження — **że**)",
         "ru": "(утверждение — **że**)",
         "en": "(statement — **że**)"
        }
       },
       {
        "id": "s0o2",
        "text": "Tak, wczoraj powiedziałem mu, że gra w operze.",
        "tr": {
         "uk": "(це **він сказав мені**: **powiedział mi**; **powiedziałem mu** — «я сказав йому»)",
         "ru": "(это **он сказал мне**: **powiedział mi**; **powiedziałem mu** — «я сказал ему»)",
         "en": "(it was **he who told me**: **powiedział mi**; **powiedziałem mu** means “I told him”)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "Powiedział, **że**…",
       "ru": "Powiedział, **że**…",
       "en": "Powiedział, **że**…"
      }
     },
     {
      "npc": "A zapytał go pan, czy zostanie tu na dłużej?",
      "npcTr": {
       "uk": "А ви спитали його, чи він залишиться тут надовго?",
       "ru": "А вы спросили его, останется ли он здесь надолго?",
       "en": "And did you ask if he’s staying for long?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Zapytałem, ale odpowiedział, że jeszcze nie wie.",
        "tr": {
         "uk": "Спитав, але він відповів, що ще не знає.",
         "ru": "Спросил, но он ответил, что ещё не знает.",
         "en": "I asked, but he said he doesn’t know yet."
        }
       },
       {
        "id": "s1o1",
        "text": "Zapytałem, ale odpowiedział, czy jeszcze nie wie.",
        "tr": {
         "uk": "(відповідь — твердження: **że**)",
         "ru": "(ответ — утверждение: **że**)",
         "en": "(an answer is a statement: **że**)"
        }
       },
       {
        "id": "s1o2",
        "text": "Zapytałem, ale odpowiedziałem, że jeszcze nie wie.",
        "tr": {
         "uk": "(відповів **він**: **odpowiedział**; **odpowiedziałem** — «я відповів»)",
         "ru": "(ответил **он**: **odpowiedział**; **odpowiedziałem** — «я ответил»)",
         "en": "(**he** answered: **odpowiedział**; **odpowiedziałem** means “I answered”)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "Питання — **czy**, відповідь — **że**.",
       "ru": "Вопрос — **czy**, ответ — **że**.",
       "en": "Question — **czy**; answer — **że**."
      }
     }
    ]
   },
   "explanation": null
  }
 },
 {
  "lesson": "byd-8-legendy",
  "n": 0,
  "from": {
   "type": "DIALOGUE",
   "skill": "dialogue.legend",
   "data": {
    "npc": {
     "name": "Pani Beata",
     "emoji": "👩🏼",
     "role": {
      "uk": "екскурсоводка по Бидгощу",
      "ru": "экскурсовод по Быдгощу",
      "en": "a Bydgoszcz tour guide"
     }
    },
    "steps": [
     {
      "npc": "Znają państwo legendę o panu Twardowskim?",
      "npcTr": {
       "uk": "Ви знаєте легенду про пана Твардовського?",
       "ru": "Вы знаете легенду о пане Твардовском?",
       "en": "Do you know the legend of Mr Twardowski?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Nie, proszę nam ją opowiedzieć!",
        "tr": {
         "uk": "Ні, розкажіть її нам, будь ласка!",
         "ru": "Нет, расскажите её нам, пожалуйста!",
         "en": "No, please tell us!"
        }
       },
       {
        "id": "s0o1",
        "text": "Nie, proszę nam ją powiedzieć!",
        "tr": {
         "uk": "(легенду **opowiada się** — розповідають; «powiedzieć» — сказати)",
         "ru": "(легенду **opowiada się** — рассказывают; «powiedzieć» — сказать)",
         "en": "(a story is **opowiedzieć**, not «powiedzieć»)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "Історію, легенду — **opowiedzieć**; фразу — **powiedzieć**.",
       "ru": "Историю, легенду — **opowiedzieć**; фразу — **powiedzieć**.",
       "en": "A story — **opowiedzieć**; a sentence — **powiedzieć**."
      }
     },
     {
      "npc": "Twardowski był czarnoksiężnikiem. Jak myślicie, z kim podpisał pakt?",
      "npcTr": {
       "uk": "Твардовський був чорнокнижником. Як думаєте, з ким він підписав угоду?",
       "ru": "Твардовский был чернокнижником. Как думаете, с кем он подписал договор?",
       "en": "Twardowski was a sorcerer. Who do you think he made a pact with?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Z diabłem! Słyszałem o tym.",
        "tr": {
         "uk": "З дияволом! Я чув про це.",
         "ru": "С дьяволом! Я слышал об этом.",
         "en": "With the devil! I’ve heard about it."
        }
       },
       {
        "id": "s1o1",
        "text": "Z diabeł! Słyszałem o tym.",
        "tr": {
         "uk": "(z + орудний: **z diabłem**)",
         "ru": "(z + творительный: **z diabłem**)",
         "en": "(z + instrumental: **z diabłem**)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "**z** + орудний: z **diabłem**.",
       "ru": "**z** + творительный: z **diabłem**.",
       "en": "**z diabłem**."
      }
     }
    ]
   },
   "explanation": null
  },
  "to": {
   "type": "DIALOGUE",
   "skill": "dialogue.legend",
   "data": {
    "npc": {
     "name": "Pani Beata",
     "emoji": "👩🏼",
     "role": {
      "uk": "екскурсоводка по Бидгощу",
      "ru": "экскурсовод по Быдгощу",
      "en": "a Bydgoszcz tour guide"
     }
    },
    "steps": [
     {
      "npc": "Znają państwo legendę o panu Twardowskim?",
      "npcTr": {
       "uk": "Ви знаєте легенду про пана Твардовського?",
       "ru": "Вы знаете легенду о пане Твардовском?",
       "en": "Do you know the legend of Mr Twardowski?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Nie, proszę nam ją opowiedzieć!",
        "tr": {
         "uk": "Ні, розкажіть її нам, будь ласка!",
         "ru": "Нет, расскажите её нам, пожалуйста!",
         "en": "No, please tell us!"
        }
       },
       {
        "id": "s0o1",
        "text": "Nie, proszę nam ją powiedzieć!",
        "tr": {
         "uk": "(легенду **opowiada się** — розповідають; «powiedzieć» — сказати)",
         "ru": "(легенду **opowiada się** — рассказывают; «powiedzieć» — сказать)",
         "en": "(a story is **opowiedzieć**, not «powiedzieć»)"
        }
       },
       {
        "id": "s0o2",
        "text": "Nie, opowiedz nam ją!",
        "tr": {
         "uk": "(**państwo** — ввічлива форма: **proszę opowiedzieć**; «opowiedz» — на «ти»)",
         "ru": "(**państwo** — вежливая форма: **proszę opowiedzieć**; «opowiedz» — на «ты»)",
         "en": "(**państwo** is the polite form: **proszę opowiedzieć**; “opowiedz” is informal)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "Історію, легенду — **opowiedzieć**; фразу — **powiedzieć**.",
       "ru": "Историю, легенду — **opowiedzieć**; фразу — **powiedzieć**.",
       "en": "A story — **opowiedzieć**; a sentence — **powiedzieć**."
      }
     },
     {
      "npc": "Twardowski był czarnoksiężnikiem. Jak myślicie, z kim podpisał pakt?",
      "npcTr": {
       "uk": "Твардовський був чорнокнижником. Як думаєте, з ким він підписав угоду?",
       "ru": "Твардовский был чернокнижником. Как думаете, с кем он подписал договор?",
       "en": "Twardowski was a sorcerer. Who do you think he made a pact with?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Z diabłem! Słyszałem o tym.",
        "tr": {
         "uk": "З дияволом! Я чув про це.",
         "ru": "С дьяволом! Я слышал об этом.",
         "en": "With the devil! I’ve heard about it."
        }
       },
       {
        "id": "s1o1",
        "text": "Z diabeł! Słyszałem o tym.",
        "tr": {
         "uk": "(z + орудний: **z diabłem**)",
         "ru": "(z + творительный: **z diabłem**)",
         "en": "(z + instrumental: **z diabłem**)"
        }
       },
       {
        "id": "s1o2",
        "text": "Z diabła! Słyszałem o tym.",
        "tr": {
         "uk": "(**z** («з ким») + орудний: z **diabłem**; **z diabła** — «з диявола», звідки)",
         "ru": "(**z** («с кем») + творительный: z **diabłem**; **z diabła** — «из дьявола», откуда)",
         "en": "(**z** (“with”) takes the instrumental: z **diabłem**; **z diabła** means “out of the devil”)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "**z** + орудний: z **diabłem**.",
       "ru": "**z** + творительный: z **diabłem**.",
       "en": "**z diabłem**."
      }
     }
    ]
   },
   "explanation": null
  }
 },
 {
  "lesson": "byd-boss",
  "n": 0,
  "from": {
   "type": "SITUATION",
   "skill": "situation.boss",
   "data": {
    "npc": {
     "name": "Tomek",
     "emoji": "👨🏻",
     "role": {
      "uk": "друг із Торуня",
      "ru": "друг из Торуня",
      "en": "a friend from Toruń"
     }
    },
    "scene": {
     "uk": "Старий Ринок у Бидгощі",
     "ru": "Старый Рынок в Быдгоще",
     "en": "The Old Market Square in Bydgoszcz"
    },
    "steps": [
     {
      "npc": "Cześć, dziewczyny! Jak spędziłyście weekend w Bydgoszczy?",
      "npcTr": {
       "uk": "Привіт, дівчата! Як ви провели вихідні в Бидгощі?",
       "ru": "Привет, девочки! Как вы провели выходные в Быдгоще?",
       "en": "Hi girls! How did you spend the weekend in Bydgoszcz?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Świetnie! Byłyśmy w operze i na Wyspie Młyńskiej.",
        "tr": {
         "uk": "Чудово! Ми були в опері й на Млиновому острові.",
         "ru": "Отлично! Мы были в опере и на Мельничном острове.",
         "en": "Great! We went to the opera and Mill Island."
        }
       },
       {
        "id": "s0o1",
        "text": "Świetnie! Byliśmy w operze i na Wyspie Młyńskiej.",
        "tr": {
         "uk": "(лише дівчата — **byłyśmy**)",
         "ru": "(только девушки — **byłyśmy**)",
         "en": "(women only — **byłyśmy**)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "Лише жінки — **byłyśmy**.",
       "ru": "Только женщины — **byłyśmy**.",
       "en": "Women only — **byłyśmy**."
      }
     },
     {
      "npc": "A widziałyście figurkę Twardowskiego?",
      "npcTr": {
       "uk": "А ви бачили фігурку Твардовського?",
       "ru": "А вы видели фигурку Твардовского?",
       "en": "And did you see Twardowski’s figure?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Tak, pojawiła się w oknie dokładnie o 13:13.",
        "tr": {
         "uk": "Так, вона з’явилася у вікні рівно о 13:13.",
         "ru": "Да, она появилась в окне ровно в 13:13.",
         "en": "Yes, it appeared in the window at exactly 13:13."
        }
       },
       {
        "id": "s1o1",
        "text": "Tak, pojawiała się w oknie dokładnie o 13:13.",
        "tr": {
         "uk": "(одна подія — доконаний: **pojawiła się**)",
         "ru": "(одно событие — совершенный: **pojawiła się**)",
         "en": "(one event — perfective: **pojawiła się**)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "Одна подія в конкретний момент — **pojawiła się**.",
       "ru": "Одно событие в конкретный момент — **pojawiła się**.",
       "en": "One event — **pojawiła się**."
      }
     }
    ]
   },
   "explanation": null
  },
  "to": {
   "type": "SITUATION",
   "skill": "situation.boss",
   "data": {
    "npc": {
     "name": "Tomek",
     "emoji": "👨🏻",
     "role": {
      "uk": "друг із Торуня",
      "ru": "друг из Торуня",
      "en": "a friend from Toruń"
     }
    },
    "scene": {
     "uk": "Старий Ринок у Бидгощі",
     "ru": "Старый Рынок в Быдгоще",
     "en": "The Old Market Square in Bydgoszcz"
    },
    "steps": [
     {
      "npc": "Cześć, dziewczyny! Jak spędziłyście weekend w Bydgoszczy?",
      "npcTr": {
       "uk": "Привіт, дівчата! Як ви провели вихідні в Бидгощі?",
       "ru": "Привет, девочки! Как вы провели выходные в Быдгоще?",
       "en": "Hi girls! How did you spend the weekend in Bydgoszcz?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Świetnie! Byłyśmy w operze i na Wyspie Młyńskiej.",
        "tr": {
         "uk": "Чудово! Ми були в опері й на Млиновому острові.",
         "ru": "Отлично! Мы были в опере и на Мельничном острове.",
         "en": "Great! We went to the opera and Mill Island."
        }
       },
       {
        "id": "s0o1",
        "text": "Świetnie! Byliśmy w operze i na Wyspie Młyńskiej.",
        "tr": {
         "uk": "(лише дівчата — **byłyśmy**)",
         "ru": "(только девушки — **byłyśmy**)",
         "en": "(women only — **byłyśmy**)"
        }
       },
       {
        "id": "s0o2",
        "text": "Świetnie! Były w operze i na Wyspie Młyńskiej.",
        "tr": {
         "uk": "(про себе — «ми»: **byłyśmy**; **były** — «вони були»)",
         "ru": "(о себе — «мы»: **byłyśmy**; **były** — «они были»)",
         "en": "(about yourselves — “we”: **byłyśmy**; **były** means “they were”)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "Лише жінки — **byłyśmy**.",
       "ru": "Только женщины — **byłyśmy**.",
       "en": "Women only — **byłyśmy**."
      }
     },
     {
      "npc": "A widziałyście figurkę Twardowskiego?",
      "npcTr": {
       "uk": "А ви бачили фігурку Твардовського?",
       "ru": "А вы видели фигурку Твардовского?",
       "en": "And did you see Twardowski’s figure?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Tak, pojawiła się w oknie dokładnie o 13:13.",
        "tr": {
         "uk": "Так, вона з’явилася у вікні рівно о 13:13.",
         "ru": "Да, она появилась в окне ровно в 13:13.",
         "en": "Yes, it appeared in the window at exactly 13:13."
        }
       },
       {
        "id": "s1o1",
        "text": "Tak, pojawiała się w oknie dokładnie o 13:13.",
        "tr": {
         "uk": "(одна подія — доконаний: **pojawiła się**)",
         "ru": "(одно событие — совершенный: **pojawiła się**)",
         "en": "(one event — perfective: **pojawiła się**)"
        }
       },
       {
        "id": "s1o2",
        "text": "Tak, pojawi się w oknie dokładnie o 13:13.",
        "tr": {
         "uk": "(питають про побачене: **pojawiła się**; **pojawi się** — «з’явиться»)",
         "ru": "(спрашивают о увиденном: **pojawiła się**; **pojawi się** — «появится»)",
         "en": "(the question is about what you saw: **pojawiła się**; **pojawi się** means “will appear”)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "Одна подія в конкретний момент — **pojawiła się**.",
       "ru": "Одно событие в конкретный момент — **pojawiła się**.",
       "en": "One event — **pojawiła się**."
      }
     }
    ]
   },
   "explanation": null
  }
 },
 {
  "lesson": "byd-boss",
  "n": 1,
  "from": {
   "type": "FILL_GAP",
   "skill": "grammar.boss",
   "data": {
    "pl": "Wczoraj ___ cały film do końca.",
    "translation": {
     "uk": "Учора я подивився весь фільм до кінця.",
     "ru": "Вчера я посмотрел весь фильм до конца.",
     "en": "Yesterday I watched the whole film to the end."
    },
    "options": [
     {
      "id": "o0",
      "text": "obejrzałem"
     },
     {
      "id": "o1",
      "text": "oglądałem"
     },
     {
      "id": "o2",
      "text": "oglądam"
     }
    ],
    "answer": "o0"
   },
   "explanation": {
    "uk": "«Do końca» — результат: **obejrzałem**.",
    "ru": "«Do końca» — результат: **obejrzałem**.",
    "en": "Result — **obejrzałem**."
   }
  },
  "to": {
   "type": "FILL_GAP",
   "skill": "grammar.boss",
   "data": {
    "pl": "Wczoraj ___ cały film do końca.",
    "translation": {
     "uk": "Учора я подивився весь фільм до кінця.",
     "ru": "Вчера я посмотрел весь фильм до конца.",
     "en": "Yesterday I watched the whole film to the end."
    },
    "options": [
     {
      "id": "o0",
      "text": "obejrzałem"
     },
     {
      "id": "o1",
      "text": "oglądałem"
     },
     {
      "id": "o2",
      "text": "obejrzę"
     }
    ],
    "answer": "o0"
   },
   "explanation": {
    "uk": "«Do końca» — результат, «wczoraj» — минулий час: **obejrzałem** (не **obejrzę**).",
    "ru": "«Do końca» — результат, «вчера» — прошедшее время: **obejrzałem** (не **obejrzę**).",
    "en": "Result + “yesterday” = perfective past: **obejrzałem** (not **obejrzę**)."
   }
  }
 },
 {
  "lesson": "tor-1-bede",
  "n": 0,
  "from": {
   "type": "DIALOGUE",
   "skill": "dialogue.future",
   "data": {
    "npc": {
     "name": "Kasia",
     "emoji": "👩🏻",
     "role": {
      "uk": "колега з роботи",
      "ru": "коллега с работы",
      "en": "a colleague"
     }
    },
    "steps": [
     {
      "npc": "Co będziesz robić w weekend?",
      "npcTr": {
       "uk": "Що ти робитимеш на вихідних?",
       "ru": "Что ты будешь делать на выходных?",
       "en": "What will you do at the weekend?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "W sobotę będę sprzątać, a w niedzielę odpocznę.",
        "tr": {
         "uk": "У суботу прибиратиму, а в неділю відпочину.",
         "ru": "В субботу буду убираться, а в воскресенье отдохну.",
         "en": "On Saturday I’ll be cleaning, and on Sunday I’ll rest."
        }
       },
       {
        "id": "s0o1",
        "text": "W sobotę będę sprzątam, a w niedzielę odpocznę.",
        "tr": {
         "uk": "(після **będę** — інфінітив: **sprzątać**)",
         "ru": "(после **będę** — инфинитив: **sprzątać**)",
         "en": "(after **będę** — infinitive: **sprzątać**)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "**będę** + інфінітив: będę sprzątać.",
       "ru": "**będę** + инфинитив: będę sprzątać.",
       "en": "**będę** + infinitive."
      }
     },
     {
      "npc": "A w przyszłym tygodniu?",
      "npcTr": {
       "uk": "А наступного тижня?",
       "ru": "А на следующей неделе?",
       "en": "And next week?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "W przyszłym tygodniu będę pracować z domu.",
        "tr": {
         "uk": "Наступного тижня я працюватиму з дому.",
         "ru": "На следующей неделе я буду работать из дома.",
         "en": "Next week I’ll be working from home."
        }
       },
       {
        "id": "s1o1",
        "text": "W przyszły tydzień będę pracować z domu.",
        "tr": {
         "uk": "(коли? — місцевий: **w przyszłym tygodniu**)",
         "ru": "(когда? — предложный: **w przyszłym tygodniu**)",
         "en": "(when? — locative: **w przyszłym tygodniu**)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "**w przyszłym tygodniu**, **w przyszłym roku**.",
       "ru": "**w przyszłym tygodniu**, **w przyszłym roku**.",
       "en": "**w przyszłym tygodniu** (locative)."
      }
     }
    ]
   },
   "explanation": null
  },
  "to": {
   "type": "DIALOGUE",
   "skill": "dialogue.future",
   "data": {
    "npc": {
     "name": "Kasia",
     "emoji": "👩🏻",
     "role": {
      "uk": "колега з роботи",
      "ru": "коллега с работы",
      "en": "a colleague"
     }
    },
    "steps": [
     {
      "npc": "Co będziesz robić w weekend?",
      "npcTr": {
       "uk": "Що ти робитимеш на вихідних?",
       "ru": "Что ты будешь делать на выходных?",
       "en": "What will you do at the weekend?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "W sobotę będę sprzątać, a w niedzielę odpocznę.",
        "tr": {
         "uk": "У суботу прибиратиму, а в неділю відпочину.",
         "ru": "В субботу буду убираться, а в воскресенье отдохну.",
         "en": "On Saturday I’ll be cleaning, and on Sunday I’ll rest."
        }
       },
       {
        "id": "s0o1",
        "text": "W sobotę będę sprzątam, a w niedzielę odpocznę.",
        "tr": {
         "uk": "(після **będę** — інфінітив: **sprzątać**)",
         "ru": "(после **będę** — инфинитив: **sprzątać**)",
         "en": "(after **będę** — infinitive: **sprzątać**)"
        }
       },
       {
        "id": "s0o2",
        "text": "W sobotę sprzątałem, a w niedzielę odpocząłem.",
        "tr": {
         "uk": "(минулий час, а питання про майбутнє: **będę sprzątać**, **odpocznę**)",
         "ru": "(прошедшее время, а вопрос о будущем: **będę sprzątać**, **odpocznę**)",
         "en": "(past tense, but the question is about the future: **będę sprzątać**, **odpocznę**)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "**będę** + інфінітив: będę sprzątać.",
       "ru": "**będę** + инфинитив: będę sprzątać.",
       "en": "**będę** + infinitive."
      }
     },
     {
      "npc": "A w przyszłym tygodniu?",
      "npcTr": {
       "uk": "А наступного тижня?",
       "ru": "А на следующей неделе?",
       "en": "And next week?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "W przyszłym tygodniu będę pracować z domu.",
        "tr": {
         "uk": "Наступного тижня я працюватиму з дому.",
         "ru": "На следующей неделе я буду работать из дома.",
         "en": "Next week I’ll be working from home."
        }
       },
       {
        "id": "s1o1",
        "text": "W przyszły tydzień będę pracować z domu.",
        "tr": {
         "uk": "(коли? — місцевий: **w przyszłym tygodniu**)",
         "ru": "(когда? — предложный: **w przyszłym tygodniu**)",
         "en": "(when? — locative: **w przyszłym tygodniu**)"
        }
       },
       {
        "id": "s1o2",
        "text": "W przyszłym tygodniu będziecie pracować z domu.",
        "tr": {
         "uk": "(**będziecie** — «ви будете»; про себе: **będę**)",
         "ru": "(**będziecie** — «вы будете»; о себе: **będę**)",
         "en": "(**będziecie** means “you (plural) will”; about yourself: **będę**)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "**w przyszłym tygodniu**, **w przyszłym roku**.",
       "ru": "**w przyszłym tygodniu**, **w przyszłym roku**.",
       "en": "**w przyszłym tygodniu** (locative)."
      }
     }
    ]
   },
   "explanation": null
  }
 },
 {
  "lesson": "tor-2-zrobie",
  "n": 0,
  "from": {
   "type": "DIALOGUE",
   "skill": "dialogue.perfective",
   "data": {
    "npc": {
     "name": "Kasia",
     "emoji": "👩🏻",
     "role": {
      "uk": "колега з роботи",
      "ru": "коллега с работы",
      "en": "a colleague"
     }
    },
    "steps": [
     {
      "npc": "Zrobisz ten raport dzisiaj?",
      "npcTr": {
       "uk": "Ти зробиш цей звіт сьогодні?",
       "ru": "Ты сделаешь этот отчёт сегодня?",
       "en": "Will you do this report today?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Tak, zrobię go po obiedzie.",
        "tr": {
         "uk": "Так, я зроблю його після обіду.",
         "ru": "Да, я сделаю его после обеда.",
         "en": "Yes, I’ll do it after lunch."
        }
       },
       {
        "id": "s0o1",
        "text": "Tak, będę zrobić go po obiedzie.",
        "tr": {
         "uk": "(доконаний — без będę: **zrobię**)",
         "ru": "(совершенный — без będę: **zrobię**)",
         "en": "(perfective — no będę: **zrobię**)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "Результат — **zrobię**; процес — **będę robić**.",
       "ru": "Результат — **zrobię**; процесс — **będę robić**.",
       "en": "Result — **zrobię**; process — **będę robić**."
      }
     },
     {
      "npc": "A kiedy zdecydujesz, czy jedziesz na kurs?",
      "npcTr": {
       "uk": "А коли ти вирішиш, чи їдеш на курс?",
       "ru": "А когда ты решишь, едешь ли на курс?",
       "en": "And when will you decide whether you’re going on the course?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Jutro podejmę decyzję.",
        "tr": {
         "uk": "Завтра я ухвалю рішення.",
         "ru": "Завтра я приму решение.",
         "en": "I’ll make a decision tomorrow."
        }
       },
       {
        "id": "s1o1",
        "text": "Jutro zrobię decyzję.",
        "tr": {
         "uk": "(рішення ухвалюють: **podjąć decyzję**)",
         "ru": "(решение принимают: **podjąć decyzję**)",
         "en": "(you **take** a decision: **podjąć decyzję**)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "**podjąć decyzję** — ухвалити рішення.",
       "ru": "**podjąć decyzję** — принять решение.",
       "en": "**podjąć decyzję** — make a decision."
      }
     }
    ]
   },
   "explanation": null
  },
  "to": {
   "type": "DIALOGUE",
   "skill": "dialogue.perfective",
   "data": {
    "npc": {
     "name": "Kasia",
     "emoji": "👩🏻",
     "role": {
      "uk": "колега з роботи",
      "ru": "коллега с работы",
      "en": "a colleague"
     }
    },
    "steps": [
     {
      "npc": "Zrobisz ten raport dzisiaj?",
      "npcTr": {
       "uk": "Ти зробиш цей звіт сьогодні?",
       "ru": "Ты сделаешь этот отчёт сегодня?",
       "en": "Will you do this report today?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Tak, zrobię go po obiedzie.",
        "tr": {
         "uk": "Так, я зроблю його після обіду.",
         "ru": "Да, я сделаю его после обеда.",
         "en": "Yes, I’ll do it after lunch."
        }
       },
       {
        "id": "s0o1",
        "text": "Tak, będę zrobić go po obiedzie.",
        "tr": {
         "uk": "(доконаний — без będę: **zrobię**)",
         "ru": "(совершенный — без będę: **zrobię**)",
         "en": "(perfective — no będę: **zrobię**)"
        }
       },
       {
        "id": "s0o2",
        "text": "Tak, zrobisz go po obiedzie.",
        "tr": {
         "uk": "(**zrobisz** — «ти зробиш»; про себе: **zrobię**)",
         "ru": "(**zrobisz** — «ты сделаешь»; о себе: **zrobię**)",
         "en": "(**zrobisz** means “you will do”; about yourself: **zrobię**)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "Результат — **zrobię**; процес — **będę robić**.",
       "ru": "Результат — **zrobię**; процесс — **będę robić**.",
       "en": "Result — **zrobię**; process — **będę robić**."
      }
     },
     {
      "npc": "A kiedy zdecydujesz, czy jedziesz na kurs?",
      "npcTr": {
       "uk": "А коли ти вирішиш, чи їдеш на курс?",
       "ru": "А когда ты решишь, едешь ли на курс?",
       "en": "And when will you decide whether you’re going on the course?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Jutro podejmę decyzję.",
        "tr": {
         "uk": "Завтра я ухвалю рішення.",
         "ru": "Завтра я приму решение.",
         "en": "I’ll make a decision tomorrow."
        }
       },
       {
        "id": "s1o1",
        "text": "Jutro zrobię decyzję.",
        "tr": {
         "uk": "(рішення ухвалюють: **podjąć decyzję**)",
         "ru": "(решение принимают: **podjąć decyzję**)",
         "en": "(you **take** a decision: **podjąć decyzję**)"
        }
       },
       {
        "id": "s1o2",
        "text": "Jutro podjąłem decyzję.",
        "tr": {
         "uk": "(**jutro** — майбутнє: **podejmę**, а не минуле **podjąłem**)",
         "ru": "(**jutro** — будущее: **podejmę**, а не прошедшее **podjąłem**)",
         "en": "(**jutro** is future: **podejmę**, not the past **podjąłem**)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "**podjąć decyzję** — ухвалити рішення.",
       "ru": "**podjąć decyzję** — принять решение.",
       "en": "**podjąć decyzję** — make a decision."
      }
     }
    ]
   },
   "explanation": null
  }
 },
 {
  "lesson": "tor-3-zamiary",
  "n": 0,
  "from": {
   "type": "DIALOGUE",
   "skill": "dialogue.plans",
   "data": {
    "npc": {
     "name": "Pani Ewa",
     "emoji": "👩🏼‍💼",
     "role": {
      "uk": "кар’єрна консультантка",
      "ru": "карьерный консультант",
      "en": "a career adviser"
     }
    },
    "steps": [
     {
      "npc": "Jakie ma pan plany na przyszłość?",
      "npcTr": {
       "uk": "Які у вас плани на майбутнє?",
       "ru": "Какие у вас планы на будущее?",
       "en": "What are your plans for the future?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Zamierzam skończyć kurs i znaleźć lepszą pracę.",
        "tr": {
         "uk": "Я маю намір закінчити курс і знайти кращу роботу.",
         "ru": "Я собираюсь окончить курс и найти работу получше.",
         "en": "I intend to finish the course and find a better job."
        }
       },
       {
        "id": "s0o1",
        "text": "Zamierzam skończę kurs i znajdę lepszą pracę.",
        "tr": {
         "uk": "(після **zamierzam** — інфінітив)",
         "ru": "(после **zamierzam** — инфинитив)",
         "en": "(after **zamierzam** — infinitive)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "**zamierzam** + інфінітив: skończyć, znaleźć.",
       "ru": "**zamierzam** + инфинитив: skończyć, znaleźć.",
       "en": "**zamierzam** + infinitive."
      }
     },
     {
      "npc": "A o czym pan marzy?",
      "npcTr": {
       "uk": "А про що ви мрієте?",
       "ru": "А о чём вы мечтаете?",
       "en": "And what do you dream of?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Marzę o własnej firmie.",
        "tr": {
         "uk": "Я мрію про власну фірму.",
         "ru": "Я мечтаю о собственной фирме.",
         "en": "I dream of my own company."
        }
       },
       {
        "id": "s1o1",
        "text": "Marzę o własna firma.",
        "tr": {
         "uk": "(**o** + місцевий: o własnej firmie)",
         "ru": "(**o** + предложный: o własnej firmie)",
         "en": "(**o** + locative)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "**marzyć o** + місцевий.",
       "ru": "**marzyć o** + предложный.",
       "en": "**marzyć o** + locative."
      }
     }
    ]
   },
   "explanation": null
  },
  "to": {
   "type": "DIALOGUE",
   "skill": "dialogue.plans",
   "data": {
    "npc": {
     "name": "Pani Ewa",
     "emoji": "👩🏼‍💼",
     "role": {
      "uk": "кар’єрна консультантка",
      "ru": "карьерный консультант",
      "en": "a career adviser"
     }
    },
    "steps": [
     {
      "npc": "Jakie ma pan plany na przyszłość?",
      "npcTr": {
       "uk": "Які у вас плани на майбутнє?",
       "ru": "Какие у вас планы на будущее?",
       "en": "What are your plans for the future?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Zamierzam skończyć kurs i znaleźć lepszą pracę.",
        "tr": {
         "uk": "Я маю намір закінчити курс і знайти кращу роботу.",
         "ru": "Я собираюсь окончить курс и найти работу получше.",
         "en": "I intend to finish the course and find a better job."
        }
       },
       {
        "id": "s0o1",
        "text": "Zamierzam skończę kurs i znajdę lepszą pracę.",
        "tr": {
         "uk": "(після **zamierzam** — інфінітив)",
         "ru": "(после **zamierzam** — инфинитив)",
         "en": "(after **zamierzam** — infinitive)"
        }
       },
       {
        "id": "s0o2",
        "text": "Skończyłem kurs i znalazłem lepszą pracę.",
        "tr": {
         "uk": "(це вже зроблено; про плани — **zamierzam** + інфінітив)",
         "ru": "(это уже сделано; о планах — **zamierzam** + инфинитив)",
         "en": "(that is already done; for plans use **zamierzam** + infinitive)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "**zamierzam** + інфінітив: skończyć, znaleźć.",
       "ru": "**zamierzam** + инфинитив: skończyć, znaleźć.",
       "en": "**zamierzam** + infinitive."
      }
     },
     {
      "npc": "A o czym pan marzy?",
      "npcTr": {
       "uk": "А про що ви мрієте?",
       "ru": "А о чём вы мечтаете?",
       "en": "And what do you dream of?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Marzę o własnej firmie.",
        "tr": {
         "uk": "Я мрію про власну фірму.",
         "ru": "Я мечтаю о собственной фирме.",
         "en": "I dream of my own company."
        }
       },
       {
        "id": "s1o1",
        "text": "Marzę o własna firma.",
        "tr": {
         "uk": "(**o** + місцевий: o własnej firmie)",
         "ru": "(**o** + предложный: o własnej firmie)",
         "en": "(**o** + locative)"
        }
       },
       {
        "id": "s1o2",
        "text": "Pracuję w dużej firmie.",
        "tr": {
         "uk": "(це про теперішню роботу, а спитали про мрію: **marzyć o** + місцевий)",
         "ru": "(это про нынешнюю работу, а спросили о мечте: **marzyć o** + предложный)",
         "en": "(that is about your current job, but the question is about a dream: **marzyć o** + locative)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "**marzyć o** + місцевий.",
       "ru": "**marzyć o** + предложный.",
       "en": "**marzyć o** + locative."
      }
     }
    ]
   },
   "explanation": null
  }
 },
 {
  "lesson": "tor-4-kariera",
  "n": 0,
  "from": {
   "type": "SITUATION",
   "skill": "dialogue.career",
   "data": {
    "npc": {
     "name": "Pan Adam",
     "emoji": "👨🏻‍💼",
     "role": {
      "uk": "керівник відділу",
      "ru": "руководитель отдела",
      "en": "a team manager"
     }
    },
    "scene": {
     "uk": "Щорічна розмова з керівником",
     "ru": "Ежегодная беседа с руководителем",
     "en": "An annual review with the manager"
    },
    "steps": [
     {
      "npc": "Jak widzi pan swoją przyszłość w firmie?",
      "npcTr": {
       "uk": "Як ви бачите своє майбутнє у фірмі?",
       "ru": "Как вы видите своё будущее в фирме?",
       "en": "How do you see your future in the company?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Chciałbym awansować i zostać kierownikiem.",
        "tr": {
         "uk": "Я хотів би отримати підвищення й стати керівником.",
         "ru": "Я хотел бы получить повышение и стать руководителем.",
         "en": "I’d like to be promoted and become a manager."
        }
       },
       {
        "id": "s0o1",
        "text": "Chciałbym awansować i zostać kierownik.",
        "tr": {
         "uk": "(**zostać** + орудний: kierownikiem)",
         "ru": "(**zostać** + творительный: kierownikiem)",
         "en": "(**zostać** + instrumental)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "**zostać** + орудний: kierownikiem.",
       "ru": "**zostać** + творительный: kierownikiem.",
       "en": "**zostać** + instrumental."
      }
     },
     {
      "npc": "A co z egzaminem z angielskiego?",
      "npcTr": {
       "uk": "А що з іспитом з англійської?",
       "ru": "А что с экзаменом по английскому?",
       "en": "And what about the English exam?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Zdaję go w czerwcu i mam nadzieję, że zdam.",
        "tr": {
         "uk": "Я складаю його в червні й сподіваюся, що складу.",
         "ru": "Я сдаю его в июне и надеюсь, что сдам.",
         "en": "I’m taking it in June and hope I’ll pass."
        }
       },
       {
        "id": "s1o1",
        "text": "Zdam go w czerwcu i mam nadzieję, że zdaję.",
        "tr": {
         "uk": "(процес — **zdaję**, результат — **zdam**)",
         "ru": "(процесс — **zdaję**, результат — **zdam**)",
         "en": "(process — **zdaję**; result — **zdam**)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "**zdawać** — складати, **zdać** — скласти успішно.",
       "ru": "**zdawać** — сдавать, **zdać** — сдать успешно.",
       "en": "**zdawać** — sit; **zdać** — pass."
      }
     }
    ]
   },
   "explanation": null
  },
  "to": {
   "type": "SITUATION",
   "skill": "dialogue.career",
   "data": {
    "npc": {
     "name": "Pan Adam",
     "emoji": "👨🏻‍💼",
     "role": {
      "uk": "керівник відділу",
      "ru": "руководитель отдела",
      "en": "a team manager"
     }
    },
    "scene": {
     "uk": "Щорічна розмова з керівником",
     "ru": "Ежегодная беседа с руководителем",
     "en": "An annual review with the manager"
    },
    "steps": [
     {
      "npc": "Jak widzi pan swoją przyszłość w firmie?",
      "npcTr": {
       "uk": "Як ви бачите своє майбутнє у фірмі?",
       "ru": "Как вы видите своё будущее в фирме?",
       "en": "How do you see your future in the company?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Chciałbym awansować i zostać kierownikiem.",
        "tr": {
         "uk": "Я хотів би отримати підвищення й стати керівником.",
         "ru": "Я хотел бы получить повышение и стать руководителем.",
         "en": "I’d like to be promoted and become a manager."
        }
       },
       {
        "id": "s0o1",
        "text": "Chciałbym awansować i zostać kierownik.",
        "tr": {
         "uk": "(**zostać** + орудний: kierownikiem)",
         "ru": "(**zostać** + творительный: kierownikiem)",
         "en": "(**zostać** + instrumental)"
        }
       },
       {
        "id": "s0o2",
        "text": "Pracuję tu od trzech lat jako asystent.",
        "tr": {
         "uk": "(це про минуле й теперішнє, а спитали про майбутнє: **chciałbym** + інфінітив)",
         "ru": "(это о прошлом и настоящем, а спросили о будущем: **chciałbym** + инфинитив)",
         "en": "(that is about the past and present, but the question is about the future: **chciałbym** + infinitive)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "**zostać** + орудний: kierownikiem.",
       "ru": "**zostać** + творительный: kierownikiem.",
       "en": "**zostać** + instrumental."
      }
     },
     {
      "npc": "A co z egzaminem z angielskiego?",
      "npcTr": {
       "uk": "А що з іспитом з англійської?",
       "ru": "А что с экзаменом по английскому?",
       "en": "And what about the English exam?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Zdaję go w czerwcu i mam nadzieję, że zdam.",
        "tr": {
         "uk": "Я складаю його в червні й сподіваюся, що складу.",
         "ru": "Я сдаю его в июне и надеюсь, что сдам.",
         "en": "I’m taking it in June and hope I’ll pass."
        }
       },
       {
        "id": "s1o1",
        "text": "Zdam go w czerwcu i mam nadzieję, że zdaję.",
        "tr": {
         "uk": "(процес — **zdaję**, результат — **zdam**)",
         "ru": "(процесс — **zdaję**, результат — **zdam**)",
         "en": "(process — **zdaję**; result — **zdam**)"
        }
       },
       {
        "id": "s1o2",
        "text": "Zdałem go w czerwcu i mam nadzieję, że zdam.",
        "tr": {
         "uk": "(**zdałem** — уже склав, тоді «сподіваюся, що складу» не має сенсу; запланований іспит — **zdaję**)",
         "ru": "(**zdałem** — уже сдал, тогда «надеюсь, что сдам» не имеет смысла; запланированный экзамен — **zdaję**)",
         "en": "(**zdałem** — already passed, so “I hope I will pass” makes no sense; a scheduled exam — **zdaję**)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "**zdawać** — складати, **zdać** — скласти успішно.",
       "ru": "**zdawać** — сдавать, **zdać** — сдать успешно.",
       "en": "**zdawać** — sit; **zdać** — pass."
      }
     }
    ]
   },
   "explanation": null
  }
 },
 {
  "lesson": "tor-5-wakacje",
  "n": 0,
  "from": {
   "type": "DIALOGUE",
   "skill": "dialogue.trip",
   "data": {
    "npc": {
     "name": "Tomek",
     "emoji": "👨🏻",
     "role": {
      "uk": "друг із Торуня",
      "ru": "друг из Торуня",
      "en": "a friend from Toruń"
     }
    },
    "steps": [
     {
      "npc": "Gdzie pojedziecie na wakacje?",
      "npcTr": {
       "uk": "Куди ви поїдете у відпустку?",
       "ru": "Куда вы поедете в отпуск?",
       "en": "Where are you going on holiday?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "W lipcu polecimy samolotem do Hiszpanii.",
        "tr": {
         "uk": "У липні ми полетимо літаком до Іспанії.",
         "ru": "В июле мы полетим самолётом в Испанию.",
         "en": "In July we’ll fly to Spain."
        }
       },
       {
        "id": "s0o1",
        "text": "W lipcu polecimy samolot do Hiszpanii.",
        "tr": {
         "uk": "(чим? — орудний: **samolotem**)",
         "ru": "(на чём? — творительный: **samolotem**)",
         "en": "(by what? — instrumental: **samolotem**)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "**samolotem**, **pociągiem**, **autobusem** — орудний.",
       "ru": "**samolotem**, **pociągiem**, **autobusem** — творительный.",
       "en": "Instrumental for transport."
      }
     },
     {
      "npc": "Drogo! Masz na to pieniądze?",
      "npcTr": {
       "uk": "Дорого! У тебе є на це гроші?",
       "ru": "Дорого! У тебя есть на это деньги?",
       "en": "That’s expensive! Have you got the money?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Od stycznia oszczędzam na wakacje.",
        "tr": {
         "uk": "З січня я заощаджую на відпустку.",
         "ru": "С января я коплю на отпуск.",
         "en": "I’ve been saving for the holidays since January."
        }
       },
       {
        "id": "s1o1",
        "text": "Od stycznia oszczędzam na wakacjach.",
        "tr": {
         "uk": "(на що? — знахідний: **na wakacje**)",
         "ru": "(на что? — винительный: **na wakacje**)",
         "en": "(for what? — accusative: **na wakacje**)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "**oszczędzać na** + знахідний.",
       "ru": "**oszczędzać na** + винительный.",
       "en": "**oszczędzać na** + accusative."
      }
     }
    ]
   },
   "explanation": null
  },
  "to": {
   "type": "DIALOGUE",
   "skill": "dialogue.trip",
   "data": {
    "npc": {
     "name": "Tomek",
     "emoji": "👨🏻",
     "role": {
      "uk": "друг із Торуня",
      "ru": "друг из Торуня",
      "en": "a friend from Toruń"
     }
    },
    "steps": [
     {
      "npc": "Gdzie pojedziecie na wakacje?",
      "npcTr": {
       "uk": "Куди ви поїдете у відпустку?",
       "ru": "Куда вы поедете в отпуск?",
       "en": "Where are you going on holiday?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "W lipcu polecimy samolotem do Hiszpanii.",
        "tr": {
         "uk": "У липні ми полетимо літаком до Іспанії.",
         "ru": "В июле мы полетим самолётом в Испанию.",
         "en": "In July we’ll fly to Spain."
        }
       },
       {
        "id": "s0o1",
        "text": "W lipcu polecimy samolot do Hiszpanii.",
        "tr": {
         "uk": "(чим? — орудний: **samolotem**)",
         "ru": "(на чём? — творительный: **samolotem**)",
         "en": "(by what? — instrumental: **samolotem**)"
        }
       },
       {
        "id": "s0o2",
        "text": "W lipcu polecicie samolotem do Hiszpanii.",
        "tr": {
         "uk": "(**polecicie** — «ви полетите»; про себе й родину: **polecimy**)",
         "ru": "(**polecicie** — «вы полетите»; о себе и семье: **polecimy**)",
         "en": "(**polecicie** means “you (plural) will fly”; about your own family: **polecimy**)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "**samolotem**, **pociągiem**, **autobusem** — орудний.",
       "ru": "**samolotem**, **pociągiem**, **autobusem** — творительный.",
       "en": "Instrumental for transport."
      }
     },
     {
      "npc": "Drogo! Masz na to pieniądze?",
      "npcTr": {
       "uk": "Дорого! У тебе є на це гроші?",
       "ru": "Дорого! У тебя есть на это деньги?",
       "en": "That’s expensive! Have you got the money?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Od stycznia oszczędzam na wakacje.",
        "tr": {
         "uk": "З січня я заощаджую на відпустку.",
         "ru": "С января я коплю на отпуск.",
         "en": "I’ve been saving for the holidays since January."
        }
       },
       {
        "id": "s1o1",
        "text": "Od stycznia oszczędzam na wakacjach.",
        "tr": {
         "uk": "(на що? — знахідний: **na wakacje**)",
         "ru": "(на что? — винительный: **na wakacje**)",
         "en": "(for what? — accusative: **na wakacje**)"
        }
       },
       {
        "id": "s1o2",
        "text": "Wakacje są zawsze w lipcu i sierpniu.",
        "tr": {
         "uk": "(це не відповідь про гроші; сказати, що відкладаєш: **oszczędzam na** + знахідний)",
         "ru": "(это не ответ про деньги; сказать, что копишь: **oszczędzam na** + винительный)",
         "en": "(that does not answer the question about money; to say you are saving: **oszczędzam na** + accusative)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "**oszczędzać na** + знахідний.",
       "ru": "**oszczędzać na** + винительный.",
       "en": "**oszczędzać na** + accusative."
      }
     }
    ]
   },
   "explanation": null
  }
 },
 {
  "lesson": "tor-6-jezeli",
  "n": 0,
  "from": {
   "type": "DIALOGUE",
   "skill": "dialogue.condition",
   "data": {
    "npc": {
     "name": "Kasia",
     "emoji": "👩🏻",
     "role": {
      "uk": "колега з роботи",
      "ru": "коллега с работы",
      "en": "a colleague"
     }
    },
    "steps": [
     {
      "npc": "Pójdziemy jutro nad Wisłę?",
      "npcTr": {
       "uk": "Підемо завтра на Віслу?",
       "ru": "Пойдём завтра на Вислу?",
       "en": "Shall we go to the Vistula tomorrow?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Jeżeli będzie ładnie, na pewno pójdziemy.",
        "tr": {
         "uk": "Якщо буде гарна погода, ми точно підемо.",
         "ru": "Если будет хорошая погода, мы точно пойдём.",
         "en": "If the weather’s nice, we’ll definitely go."
        }
       },
       {
        "id": "s0o1",
        "text": "Jeżeli jest ładnie, na pewno pójdziemy.",
        "tr": {
         "uk": "(умова в майбутньому — **będzie**)",
         "ru": "(условие в будущем — **będzie**)",
         "en": "(future condition — **będzie**)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "Майбутнє в обох частинах: **będzie** … **pójdziemy**.",
       "ru": "Будущее в обеих частях: **będzie** … **pójdziemy**.",
       "en": "Future in both clauses."
      }
     },
     {
      "npc": "A jeśli będzie padać?",
      "npcTr": {
       "uk": "А якщо падатиме дощ?",
       "ru": "А если будет дождь?",
       "en": "And if it rains?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "To prawdopodobnie zostaniemy w domu.",
        "tr": {
         "uk": "Тоді, імовірно, ми залишимося вдома.",
         "ru": "Тогда, вероятно, мы останемся дома.",
         "en": "Then we’ll probably stay at home."
        }
       },
       {
        "id": "s1o1",
        "text": "To prawdopodobnie zostajemy w domu.",
        "tr": {
         "uk": "(майбутнє: **zostaniemy**)",
         "ru": "(будущее: **zostaniemy**)",
         "en": "(future: **zostaniemy**)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "**zostaniemy** — залишимося.",
       "ru": "**zostaniemy** — останемся.",
       "en": "**zostaniemy** — we’ll stay."
      }
     }
    ]
   },
   "explanation": null
  },
  "to": {
   "type": "DIALOGUE",
   "skill": "dialogue.condition",
   "data": {
    "npc": {
     "name": "Kasia",
     "emoji": "👩🏻",
     "role": {
      "uk": "колега з роботи",
      "ru": "коллега с работы",
      "en": "a colleague"
     }
    },
    "steps": [
     {
      "npc": "Pójdziemy jutro nad Wisłę?",
      "npcTr": {
       "uk": "Підемо завтра на Віслу?",
       "ru": "Пойдём завтра на Вислу?",
       "en": "Shall we go to the Vistula tomorrow?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Jeżeli będzie ładnie, na pewno pójdziemy.",
        "tr": {
         "uk": "Якщо буде гарна погода, ми точно підемо.",
         "ru": "Если будет хорошая погода, мы точно пойдём.",
         "en": "If the weather’s nice, we’ll definitely go."
        }
       },
       {
        "id": "s0o1",
        "text": "Jeżeli jest ładnie, na pewno pójdziemy.",
        "tr": {
         "uk": "(умова в майбутньому — **będzie**)",
         "ru": "(условие в будущем — **będzie**)",
         "en": "(future condition — **będzie**)"
        }
       },
       {
        "id": "s0o2",
        "text": "Jeżeli będzie ładnie, na pewno nie pójdziemy.",
        "tr": {
         "uk": "(логіка навпаки: за гарної погоди — **pójdziemy**; **nie pójdziemy** — якщо погана)",
         "ru": "(логика наоборот: в хорошую погоду — **pójdziemy**; **nie pójdziemy** — если плохая)",
         "en": "(the logic is reversed: in nice weather — **pójdziemy**; **nie pójdziemy** — if it is bad)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "Майбутнє в обох частинах: **będzie** … **pójdziemy**.",
       "ru": "Будущее в обеих частях: **będzie** … **pójdziemy**.",
       "en": "Future in both clauses."
      }
     },
     {
      "npc": "A jeśli będzie padać?",
      "npcTr": {
       "uk": "А якщо падатиме дощ?",
       "ru": "А если будет дождь?",
       "en": "And if it rains?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "To prawdopodobnie zostaniemy w domu.",
        "tr": {
         "uk": "Тоді, імовірно, ми залишимося вдома.",
         "ru": "Тогда, вероятно, мы останемся дома.",
         "en": "Then we’ll probably stay at home."
        }
       },
       {
        "id": "s1o1",
        "text": "To prawdopodobnie zostajemy w domu.",
        "tr": {
         "uk": "(майбутнє: **zostaniemy**)",
         "ru": "(будущее: **zostaniemy**)",
         "en": "(future: **zostaniemy**)"
        }
       },
       {
        "id": "s1o2",
        "text": "To prawdopodobnie zostaliśmy w domu.",
        "tr": {
         "uk": "(**zostaliśmy** — минулий час; про можливе майбутнє: **zostaniemy**)",
         "ru": "(**zostaliśmy** — прошедшее время; о возможном будущем: **zostaniemy**)",
         "en": "(**zostaliśmy** is past tense; for a possible future: **zostaniemy**)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "**zostaniemy** — залишимося.",
       "ru": "**zostaniemy** — останемся.",
       "en": "**zostaniemy** — we’ll stay."
      }
     }
    ]
   },
   "explanation": null
  }
 },
 {
  "lesson": "tor-7-obietnice",
  "n": 0,
  "from": {
   "type": "DIALOGUE",
   "skill": "dialogue.promise",
   "data": {
    "npc": {
     "name": "Tomek",
     "emoji": "👨🏻",
     "role": {
      "uk": "друг із Торуня",
      "ru": "друг из Торуня",
      "en": "a friend from Toruń"
     }
    },
    "steps": [
     {
      "npc": "Pomożesz mi w sobotę z przeprowadzką?",
      "npcTr": {
       "uk": "Допоможеш мені в суботу з переїздом?",
       "ru": "Поможешь мне в субботу с переездом?",
       "en": "Will you help me with the move on Saturday?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Jasne! Obiecuję, że przyjdę o dziesiątej.",
        "tr": {
         "uk": "Звісно! Обіцяю, що прийду о десятій.",
         "ru": "Конечно! Обещаю, что приду в десять.",
         "en": "Sure! I promise I’ll come at ten."
        }
       },
       {
        "id": "s0o1",
        "text": "Jasne! Obiecuję, czy przyjdę o dziesiątej.",
        "tr": {
         "uk": "(обіцянка — твердження: **że**)",
         "ru": "(обещание — утверждение: **że**)",
         "en": "(a promise is a statement: **że**)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "**Obiecuję, że** + майбутній.",
       "ru": "**Obiecuję, że** + будущее.",
       "en": "**Obiecuję, że** + future."
      }
     },
     {
      "npc": "Super! A może umówimy się też na kawę w czwartek?",
      "npcTr": {
       "uk": "Супер! А може, домовимося ще на каву в четвер?",
       "ru": "Супер! А может, договоримся ещё на кофе в четверг?",
       "en": "Great! And shall we also meet for coffee on Thursday?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Sprawdzę w kalendarzu i dam ci znać.",
        "tr": {
         "uk": "Перевірю в календарі й дам тобі знати.",
         "ru": "Проверю в календаре и дам тебе знать.",
         "en": "I’ll check my calendar and let you know."
        }
       },
       {
        "id": "s1o1",
        "text": "Sprawdzę w kalendarz i dam ci znać.",
        "tr": {
         "uk": "(де? — місцевий: **w kalendarzu**)",
         "ru": "(где? — предложный: **w kalendarzu**)",
         "en": "(where? — locative: **w kalendarzu**)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "**w kalendarzu** — місцевий.",
       "ru": "**w kalendarzu** — предложный.",
       "en": "Locative: **w kalendarzu**."
      }
     }
    ]
   },
   "explanation": null
  },
  "to": {
   "type": "DIALOGUE",
   "skill": "dialogue.promise",
   "data": {
    "npc": {
     "name": "Tomek",
     "emoji": "👨🏻",
     "role": {
      "uk": "друг із Торуня",
      "ru": "друг из Торуня",
      "en": "a friend from Toruń"
     }
    },
    "steps": [
     {
      "npc": "Pomożesz mi w sobotę z przeprowadzką?",
      "npcTr": {
       "uk": "Допоможеш мені в суботу з переїздом?",
       "ru": "Поможешь мне в субботу с переездом?",
       "en": "Will you help me with the move on Saturday?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Jasne! Obiecuję, że przyjdę o dziesiątej.",
        "tr": {
         "uk": "Звісно! Обіцяю, що прийду о десятій.",
         "ru": "Конечно! Обещаю, что приду в десять.",
         "en": "Sure! I promise I’ll come at ten."
        }
       },
       {
        "id": "s0o1",
        "text": "Jasne! Obiecuję, czy przyjdę o dziesiątej.",
        "tr": {
         "uk": "(обіцянка — твердження: **że**)",
         "ru": "(обещание — утверждение: **że**)",
         "en": "(a promise is a statement: **że**)"
        }
       },
       {
        "id": "s0o2",
        "text": "Jasne! Obiecuję, że nie przyjdę o dziesiątej.",
        "tr": {
         "uk": "(**Jasne!** — «звісно», а **nie przyjdę** — «не прийду»: обіцянка суперечить згоді)",
         "ru": "(**Jasne!** — «конечно», а **nie przyjdę** — «не приду»: обещание противоречит согласию)",
         "en": "(**Jasne!** means “sure”, but **nie przyjdę** means “I won’t come”: the promise contradicts the answer)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "**Obiecuję, że** + майбутній.",
       "ru": "**Obiecuję, że** + будущее.",
       "en": "**Obiecuję, że** + future."
      }
     },
     {
      "npc": "Super! A może umówimy się też na kawę w czwartek?",
      "npcTr": {
       "uk": "Супер! А може, домовимося ще на каву в четвер?",
       "ru": "Супер! А может, договоримся ещё на кофе в четверг?",
       "en": "Great! And shall we also meet for coffee on Thursday?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Sprawdzę w kalendarzu i dam ci znać.",
        "tr": {
         "uk": "Перевірю в календарі й дам тобі знати.",
         "ru": "Проверю в календаре и дам тебе знать.",
         "en": "I’ll check my calendar and let you know."
        }
       },
       {
        "id": "s1o1",
        "text": "Sprawdzę w kalendarz i dam ci znać.",
        "tr": {
         "uk": "(де? — місцевий: **w kalendarzu**)",
         "ru": "(где? — предложный: **w kalendarzu**)",
         "en": "(where? — locative: **w kalendarzu**)"
        }
       },
       {
        "id": "s1o2",
        "text": "Sprawdzę w kalendarzu i dam panu znać.",
        "tr": {
         "uk": "(**panu** — ввічливо, для малознайомого; другові — **ci**)",
         "ru": "(**panu** — вежливо, для малознакомого; другу — **ci**)",
         "en": "(**panu** is formal, for a stranger; to a friend say **ci**)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "**w kalendarzu** — місцевий.",
       "ru": "**w kalendarzu** — предложный.",
       "en": "Locative: **w kalendarzu**."
      }
     }
    ]
   },
   "explanation": null
  }
 },
 {
  "lesson": "tor-8-kopernik",
  "n": 0,
  "from": {
   "type": "DIALOGUE",
   "skill": "dialogue.torun",
   "data": {
    "npc": {
     "name": "Pan Marek",
     "emoji": "🧔🏻",
     "role": {
      "uk": "екскурсовод по Торуню",
      "ru": "экскурсовод по Торуню",
      "en": "a Toruń tour guide"
     }
    },
    "steps": [
     {
      "npc": "Wiecie, kto urodził się w Toruniu?",
      "npcTr": {
       "uk": "Знаєте, хто народився в Торуні?",
       "ru": "Знаете, кто родился в Торуни?",
       "en": "Do you know who was born in Toruń?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Mikołaj Kopernik, słynny astronom!",
        "tr": {
         "uk": "Миколай Коперник, славетний астроном!",
         "ru": "Николай Коперник, знаменитый астроном!",
         "en": "Nicolaus Copernicus, the famous astronomer!"
        }
       },
       {
        "id": "s0o1",
        "text": "Mikołaj Kopernik, słynny astronomem!",
        "tr": {
         "uk": "(хто? — називний: **astronom**)",
         "ru": "(кто? — именительный: **astronom**)",
         "en": "(who? — nominative: **astronom**)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "Хто? — **astronom**; був ким? — **astronomem**.",
       "ru": "Кто? — **astronom**; был кем? — **astronomem**.",
       "en": "Who? **astronom**; was what? **astronomem**."
      }
     },
     {
      "npc": "Brawo! A co zrobimy po południu?",
      "npcTr": {
       "uk": "Браво! А що ми робитимемо після обіду?",
       "ru": "Браво! А что мы будем делать после обеда?",
       "en": "Well done! And what shall we do in the afternoon?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Pójdziemy do planetarium i obejrzymy gwiazdy.",
        "tr": {
         "uk": "Підемо в планетарій і подивимося на зірки.",
         "ru": "Пойдём в планетарий и посмотрим на звёзды.",
         "en": "We’ll go to the planetarium and watch the stars."
        }
       },
       {
        "id": "s1o1",
        "text": "Pójdziemy do planetarium i oglądaliśmy gwiazdy.",
        "tr": {
         "uk": "(план — майбутній: **obejrzymy**)",
         "ru": "(план — будущее: **obejrzymy**)",
         "en": "(a plan — future: **obejrzymy**)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "Обидві дії в майбутньому: **pójdziemy**, **obejrzymy**.",
       "ru": "Оба действия в будущем: **pójdziemy**, **obejrzymy**.",
       "en": "Both actions in the future."
      }
     }
    ]
   },
   "explanation": null
  },
  "to": {
   "type": "DIALOGUE",
   "skill": "dialogue.torun",
   "data": {
    "npc": {
     "name": "Pan Marek",
     "emoji": "🧔🏻",
     "role": {
      "uk": "екскурсовод по Торуню",
      "ru": "экскурсовод по Торуню",
      "en": "a Toruń tour guide"
     }
    },
    "steps": [
     {
      "npc": "Wiecie, kto urodził się w Toruniu?",
      "npcTr": {
       "uk": "Знаєте, хто народився в Торуні?",
       "ru": "Знаете, кто родился в Торуни?",
       "en": "Do you know who was born in Toruń?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Mikołaj Kopernik, słynny astronom!",
        "tr": {
         "uk": "Миколай Коперник, славетний астроном!",
         "ru": "Николай Коперник, знаменитый астроном!",
         "en": "Nicolaus Copernicus, the famous astronomer!"
        }
       },
       {
        "id": "s0o1",
        "text": "Mikołaj Kopernik, słynny astronomem!",
        "tr": {
         "uk": "(хто? — називний: **astronom**)",
         "ru": "(кто? — именительный: **astronom**)",
         "en": "(who? — nominative: **astronom**)"
        }
       },
       {
        "id": "s0o2",
        "text": "Fryderyk Chopin, słynny kompozytor!",
        "tr": {
         "uk": "(Шопен народився в Желязовій Волі; у Торуні народився **Mikołaj Kopernik**)",
         "ru": "(Шопен родился в Желязовой Воле; в Торуни родился **Mikołaj Kopernik**)",
         "en": "(Chopin was born in Żelazowa Wola; **Mikołaj Kopernik** was born in Toruń)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "Хто? — **astronom**; був ким? — **astronomem**.",
       "ru": "Кто? — **astronom**; был кем? — **astronomem**.",
       "en": "Who? **astronom**; was what? **astronomem**."
      }
     },
     {
      "npc": "Brawo! A co zrobimy po południu?",
      "npcTr": {
       "uk": "Браво! А що ми робитимемо після обіду?",
       "ru": "Браво! А что мы будем делать после обеда?",
       "en": "Well done! And what shall we do in the afternoon?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Pójdziemy do planetarium i obejrzymy gwiazdy.",
        "tr": {
         "uk": "Підемо в планетарій і подивимося на зірки.",
         "ru": "Пойдём в планетарий и посмотрим на звёзды.",
         "en": "We’ll go to the planetarium and watch the stars."
        }
       },
       {
        "id": "s1o1",
        "text": "Pójdziemy do planetarium i oglądaliśmy gwiazdy.",
        "tr": {
         "uk": "(план — майбутній: **obejrzymy**)",
         "ru": "(план — будущее: **obejrzymy**)",
         "en": "(a plan — future: **obejrzymy**)"
        }
       },
       {
        "id": "s1o2",
        "text": "Poszliśmy do planetarium i obejrzeliśmy gwiazdy.",
        "tr": {
         "uk": "(це минулий час; питання «що зробимо» — майбутнє: **pójdziemy**, **obejrzymy**)",
         "ru": "(это прошедшее время; вопрос «что сделаем» — о будущем: **pójdziemy**, **obejrzymy**)",
         "en": "(that is past tense; the question “what will we do” is about the future: **pójdziemy**, **obejrzymy**)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "Обидві дії в майбутньому: **pójdziemy**, **obejrzymy**.",
       "ru": "Оба действия в будущем: **pójdziemy**, **obejrzymy**.",
       "en": "Both actions in the future."
      }
     }
    ]
   },
   "explanation": null
  }
 },
 {
  "lesson": "tor-boss",
  "n": 0,
  "from": {
   "type": "SITUATION",
   "skill": "situation.boss",
   "data": {
    "npc": {
     "name": "Tomek",
     "emoji": "👨🏻",
     "role": {
      "uk": "друг із Торуня",
      "ru": "друг из Торуня",
      "en": "a friend from Toruń"
     }
    },
    "scene": {
     "uk": "Ринок Старого міста в Торуні",
     "ru": "Рынок Старого города в Торуни",
     "en": "The Old Town Square in Toruń"
    },
    "steps": [
     {
      "npc": "Co będziesz robić po kursie?",
      "npcTr": {
       "uk": "Що ти робитимеш після курсу?",
       "ru": "Что ты будешь делать после курса?",
       "en": "What will you do after the course?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Zamierzam zdać egzamin i zostać tłumaczem.",
        "tr": {
         "uk": "Я маю намір скласти іспит і стати перекладачем.",
         "ru": "Я собираюсь сдать экзамен и стать переводчиком.",
         "en": "I intend to pass the exam and become a translator."
        }
       },
       {
        "id": "s0o1",
        "text": "Zamierzam zdać egzamin i zostać tłumacz.",
        "tr": {
         "uk": "(**zostać** + орудний: tłumaczem)",
         "ru": "(**zostać** + творительный: tłumaczem)",
         "en": "(**zostać** + instrumental)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "**zostać** + орудний.",
       "ru": "**zostać** + творительный.",
       "en": "**zostać** + instrumental."
      }
     },
     {
      "npc": "A jeśli nie zdasz?",
      "npcTr": {
       "uk": "А якщо не складеш?",
       "ru": "А если не сдашь?",
       "en": "And if you don’t pass?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Jeżeli nie zdam, spróbuję jeszcze raz w czerwcu.",
        "tr": {
         "uk": "Якщо не складу, спробую ще раз у червні.",
         "ru": "Если не сдам, попробую ещё раз в июне.",
         "en": "If I don’t pass, I’ll try again in June."
        }
       },
       {
        "id": "s1o1",
        "text": "Jeżeli nie zdaję, spróbuję jeszcze raz w czerwcu.",
        "tr": {
         "uk": "(умова в майбутньому: **nie zdam**)",
         "ru": "(условие в будущем: **nie zdam**)",
         "en": "(future condition: **nie zdam**)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "Майбутнє в обох частинах: **nie zdam** … **spróbuję**.",
       "ru": "Будущее в обеих частях: **nie zdam** … **spróbuję**.",
       "en": "Future in both clauses."
      }
     }
    ]
   },
   "explanation": null
  },
  "to": {
   "type": "SITUATION",
   "skill": "situation.boss",
   "data": {
    "npc": {
     "name": "Tomek",
     "emoji": "👨🏻",
     "role": {
      "uk": "друг із Торуня",
      "ru": "друг из Торуня",
      "en": "a friend from Toruń"
     }
    },
    "scene": {
     "uk": "Ринок Старого міста в Торуні",
     "ru": "Рынок Старого города в Торуни",
     "en": "The Old Town Square in Toruń"
    },
    "steps": [
     {
      "npc": "Co będziesz robić po kursie?",
      "npcTr": {
       "uk": "Що ти робитимеш після курсу?",
       "ru": "Что ты будешь делать после курса?",
       "en": "What will you do after the course?"
      },
      "options": [
       {
        "id": "s0o0",
        "text": "Zamierzam zdać egzamin i zostać tłumaczem.",
        "tr": {
         "uk": "Я маю намір скласти іспит і стати перекладачем.",
         "ru": "Я собираюсь сдать экзамен и стать переводчиком.",
         "en": "I intend to pass the exam and become a translator."
        }
       },
       {
        "id": "s0o1",
        "text": "Zamierzam zdać egzamin i zostać tłumacz.",
        "tr": {
         "uk": "(**zostać** + орудний: tłumaczem)",
         "ru": "(**zostać** + творительный: tłumaczem)",
         "en": "(**zostać** + instrumental)"
        }
       },
       {
        "id": "s0o2",
        "text": "Zamierzasz zdać egzamin i zostać tłumaczem.",
        "tr": {
         "uk": "(**zamierzasz** — «ти збираєшся»; про себе: **zamierzam**)",
         "ru": "(**zamierzasz** — «ты собираешься»; о себе: **zamierzam**)",
         "en": "(**zamierzasz** means “you intend”; about yourself: **zamierzam**)"
        }
       }
      ],
      "answer": "s0o0",
      "feedback": {
       "uk": "**zostać** + орудний.",
       "ru": "**zostać** + творительный.",
       "en": "**zostać** + instrumental."
      }
     },
     {
      "npc": "A jeśli nie zdasz?",
      "npcTr": {
       "uk": "А якщо не складеш?",
       "ru": "А если не сдашь?",
       "en": "And if you don’t pass?"
      },
      "options": [
       {
        "id": "s1o0",
        "text": "Jeżeli nie zdam, spróbuję jeszcze raz w czerwcu.",
        "tr": {
         "uk": "Якщо не складу, спробую ще раз у червні.",
         "ru": "Если не сдам, попробую ещё раз в июне.",
         "en": "If I don’t pass, I’ll try again in June."
        }
       },
       {
        "id": "s1o1",
        "text": "Jeżeli nie zdaję, spróbuję jeszcze raz w czerwcu.",
        "tr": {
         "uk": "(умова в майбутньому: **nie zdam**)",
         "ru": "(условие в будущем: **nie zdam**)",
         "en": "(future condition: **nie zdam**)"
        }
       },
       {
        "id": "s1o2",
        "text": "Jeżeli nie zdasz, spróbujesz jeszcze raz w czerwcu.",
        "tr": {
         "uk": "(**nie zdasz** — «ти не складеш»; про себе: **nie zdam**, **spróbuję**)",
         "ru": "(**nie zdasz** — «ты не сдашь»; о себе: **nie zdam**, **spróbuję**)",
         "en": "(**nie zdasz** means “you won’t pass”; about yourself: **nie zdam**, **spróbuję**)"
        }
       }
      ],
      "answer": "s1o0",
      "feedback": {
       "uk": "Майбутнє в обох частинах: **nie zdam** … **spróbuję**.",
       "ru": "Будущее в обеих частях: **nie zdam** … **spróbuję**.",
       "en": "Future in both clauses."
      }
     }
    ]
   },
   "explanation": null
  }
 },
 {
  "lesson": "exam-a1",
  "n": 7,
  "from": {
   "type": "READING",
   "skill": "reading.exam",
   "data": {
    "passage": "Ogłoszenie: Wynajmę pokój w Krakowie. Pokój jest duży, kuchnia i łazienka są wspólne. Cena: 1200 zł miesięcznie. Telefon: 600 100 200.",
    "question": {
     "uk": "Що є спільним?",
     "ru": "Что является общим?",
     "en": "What is shared?"
    },
    "options": [
     {
      "id": "o0",
      "text": {
       "uk": "Кухня і ванна",
       "ru": "Кухня и ванная",
       "en": "Kitchen and bathroom"
      }
     },
     {
      "id": "o1",
      "text": {
       "uk": "Кімната",
       "ru": "Комната",
       "en": "The room"
      }
     },
     {
      "id": "o2",
      "text": {
       "uk": "Телефон",
       "ru": "Телефон",
       "en": "The phone"
      }
     }
    ],
    "answer": "o0"
   },
   "explanation": {
    "uk": "**kuchnia i łazienka są wspólne** — кухня і ванна спільні.",
    "ru": "**kuchnia i łazienka są wspólne** — кухня и ванная общие.",
    "en": "**kuchnia i łazienka są wspólne** — shared kitchen and bathroom."
   }
  },
  "to": {
   "type": "READING",
   "skill": "reading.exam",
   "data": {
    "passage": "Ogłoszenie: Wynajmę pokój w Krakowie. Pokój jest duży, kuchnia i łazienka są wspólne. Cena: 1200 zł miesięcznie. Telefon: 600 100 200.",
    "question": {
     "uk": "Що є спільним?",
     "ru": "Что является общим?",
     "en": "What is shared?"
    },
    "options": [
     {
      "id": "o0",
      "text": {
       "uk": "Кухня і ванна",
       "ru": "Кухня и ванная",
       "en": "Kitchen and bathroom"
      }
     },
     {
      "id": "o1",
      "text": {
       "uk": "Кімната і кухня",
       "ru": "Комната и кухня",
       "en": "The room and the kitchen"
      }
     },
     {
      "id": "o2",
      "text": {
       "uk": "Ванна і балкон",
       "ru": "Ванная и балкон",
       "en": "The bathroom and a balcony"
      }
     }
    ],
    "answer": "o0"
   },
   "explanation": {
    "uk": "**kuchnia i łazienka są wspólne** — кухня і ванна спільні.",
    "ru": "**kuchnia i łazienka są wspólne** — кухня и ванная общие.",
    "en": "**kuchnia i łazienka są wspólne** — shared kitchen and bathroom."
   }
  }
 }
];

export const LESSON_EDITS: LessonEdit[] = [
 {
  "slug": "waw-4-skad",
  "column": "explanation",
  "from": {
   "uk": "**Skąd jesteś?** — Звідки ти?\n**Jestem z Ukrainy.** — Я з України. Після **z** назва країни змінюється: Ukraina → z **Ukrainy**, Polska → z **Polski**.\n**Mieszkam w Warszawie.** — Я живу у Варшаві (Warszawa → w **Warszawie**).\n**Mówię trochę po polsku.** — Я трохи говорю польською.\n**Nie rozumiem.** — Я не розумію. Дуже корисна фраза!",
   "ru": "**Skąd jesteś?** — Откуда ты?\n**Jestem z Ukrainy.** — Я из Украины. После **z** название страны меняется: Ukraina → z **Ukrainy**, Polska → z **Polski**.\n**Mieszkam w Warszawie.** — Я живу в Варшаве (Warszawa → w **Warszawie**).\n**Mówię trochę po polsku.** — Я немного говорю по-польски.\n**Nie rozumiem.** — Я не понимаю. Очень полезная фраза!",
   "en": "**Skąd jesteś?** — Where are you from?\n**Jestem z Ukrainy.** — I am from Ukraine. After **z** the country name changes: Ukraina → z **Ukrainy**, Polska → z **Polski**.\n**Mieszkam w Warszawie.** — I live in Warsaw (Warszawa → w **Warszawie**).\n**Mówię trochę po polsku.** — I speak a little Polish.\n**Nie rozumiem.** — I don't understand. A very useful phrase!"
  },
  "to": {
   "uk": "**Skąd jesteś?** — Звідки ти?\n**Jestem z Ukrainy.** — Я з України. **Jestem z Białorusi.** — Я з Білорусі. Після **z** назва країни змінюється: Ukraina → z **Ukrainy**, Białoruś → z **Białorusi**, Polska → z **Polski**.\n**Mieszkam w Warszawie.** — Я живу у Варшаві (Warszawa → w **Warszawie**).\n**Mówię trochę po polsku.** — Я трохи говорю польською.\n**Nie rozumiem.** — Я не розумію. Дуже корисна фраза!",
   "ru": "**Skąd jesteś?** — Откуда ты?\n**Jestem z Ukrainy.** — Я из Украины. **Jestem z Białorusi.** — Я из Беларуси. После **z** название страны меняется: Ukraina → z **Ukrainy**, Białoruś → z **Białorusi**, Polska → z **Polski**.\n**Mieszkam w Warszawie.** — Я живу в Варшаве (Warszawa → w **Warszawie**).\n**Mówię trochę po polsku.** — Я немного говорю по-польски.\n**Nie rozumiem.** — Я не понимаю. Очень полезная фраза!",
   "en": "**Skąd jesteś?** — Where are you from?\n**Jestem z Ukrainy.** — I am from Ukraine. **Jestem z Białorusi.** — I am from Belarus. After **z** the country name changes: Ukraina → z **Ukrainy**, Białoruś → z **Białorusi**, Polska → z **Polski**.\n**Mieszkam w Warszawie.** — I live in Warsaw (Warszawa → w **Warszawie**).\n**Mówię trochę po polsku.** — I speak a little Polish.\n**Nie rozumiem.** — I don't understand. A very useful phrase!"
  }
 },
 {
  "slug": "waw-4-skad",
  "column": "examples",
  "from": [
   {
    "pl": "Jestem z Ukrainy, ale mieszkam w Polsce.",
    "tr": {
     "uk": "Я з України, але живу в Польщі.",
     "ru": "Я из Украины, но живу в Польше.",
     "en": "I'm from Ukraine, but I live in Poland."
    }
   }
  ],
  "to": [
   {
    "pl": "Jestem z Ukrainy, ale mieszkam w Polsce.",
    "tr": {
     "uk": "Я з України, але живу в Польщі.",
     "ru": "Я из Украины, но живу в Польше.",
     "en": "I'm from Ukraine, but I live in Poland."
    }
   },
   {
    "pl": "Jestem z Białorusi, z Mińska. Teraz mieszkam w Warszawie.",
    "tr": {
     "uk": "Я з Білорусі, з Мінська. Тепер живу у Варшаві.",
     "ru": "Я из Беларуси, из Минска. Теперь живу в Варшаве.",
     "en": "I'm from Belarus, from Minsk. Now I live in Warsaw."
    }
   }
  ]
 },
 {
  "slug": "krk-3-dom",
  "column": "explanation",
  "from": {
   "uk": "**dom** — дім, **mieszkanie** — квартира, **pokój** — кімната, **kuchnia** — кухня, **łazienka** — ванна.\nУвага, хибні друзі! **dywan** — це килим, а диван — **kanapa**. **sklep** — магазин, а не склеп.\nПрикметник узгоджується з родом: **duży** pokój, **duża** kuchnia, **duże** mieszkanie.",
   "ru": "**dom** — дом, **mieszkanie** — квартира, **pokój** — комната, **kuchnia** — кухня, **łazienka** — ванная.\nВнимание, ложные друзья! **dywan** — это ковёр, а диван — **kanapa**. **sklep** — магазин, а не склеп.\nПрилагательное согласуется с родом: **duży** pokój, **duża** kuchnia, **duże** mieszkanie.",
   "en": "**dom** — house, **mieszkanie** — flat, **pokój** — room, **kuchnia** — kitchen, **łazienka** — bathroom.\nFalse friends for Ukrainians: **dywan** means carpet, a sofa is **kanapa**.\nAdjectives agree with gender: **duży** pokój, **duża** kuchnia, **duże** mieszkanie."
  },
  "to": {
   "uk": "**dom** — дім, **mieszkanie** — квартира, **pokój** — кімната, **kuchnia** — кухня, **łazienka** — ванна.\nУвага, хибні друзі! **dywan** — це килим, а диван — **kanapa**. **sklep** — магазин, а не склеп.\nПрикметник узгоджується з родом: **duży** pokój, **duża** kuchnia, **duże** mieszkanie.",
   "ru": "**dom** — дом, **mieszkanie** — квартира, **pokój** — комната, **kuchnia** — кухня, **łazienka** — ванная.\nВнимание, ложные друзья! **dywan** — это ковёр, а диван — **kanapa**. **sklep** — магазин, а не склеп.\nПрилагательное согласуется с родом: **duży** pokój, **duża** kuchnia, **duże** mieszkanie.",
   "en": "**dom** — house, **mieszkanie** — flat, **pokój** — room, **kuchnia** — kitchen, **łazienka** — bathroom.\nFalse friends for Ukrainian, Belarusian and Russian speakers: **dywan** means carpet, a sofa is **kanapa**.\nAdjectives agree with gender: **duży** pokój, **duża** kuchnia, **duże** mieszkanie."
  }
 }
];

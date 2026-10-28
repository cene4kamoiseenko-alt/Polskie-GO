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

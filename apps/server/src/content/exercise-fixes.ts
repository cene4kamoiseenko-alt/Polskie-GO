/** Exact-match corrections, applied in order; IDs, progress and admin edits are preserved. */
export const EXERCISE_FIXES = [
  {
    "lesson": "waw-1-czesc",
    "order": 3,
    "from": {
      "type": "WORD_TRANSLATION",
      "skill": "vocab.greetings",
      "data": {
        "translation": {
          "uk": "До побачення",
          "ru": "До свидания",
          "en": "Goodbye"
        },
        "options": [
          {
            "id": "o0",
            "text": "Do widzenia"
          },
          {
            "id": "o1",
            "text": "Dzień dobry"
          },
          {
            "id": "o2",
            "text": "Na razie"
          }
        ],
        "answer": "o0"
      },
      "explanation": {
        "uk": "**Do widzenia** — формальне прощання. **Na razie** — неформальне «бувай».",
        "ru": "**Do widzenia** — формальное прощание. **Na razie** — неформальное «пока».",
        "en": "**Do widzenia** is formal. **Na razie** is an informal \"see you\"."
      }
    },
    "to": {
      "type": "WORD_TRANSLATION",
      "skill": "vocab.greetings",
      "data": {
        "translation": {
          "uk": "Формальне «до побачення»",
          "ru": "Формальное «до свидания»",
          "en": "Formal goodbye"
        },
        "options": [
          {
            "id": "o0",
            "text": "Do widzenia"
          },
          {
            "id": "o1",
            "text": "Dzień dobry"
          },
          {
            "id": "o2",
            "text": "Na razie"
          }
        ],
        "answer": "o0"
      },
      "explanation": {
        "uk": "**Do widzenia** — формальне прощання. **Na razie** — неформальне «бувай».",
        "ru": "**Do widzenia** — формальное прощание. **Na razie** — неформальное «пока».",
        "en": "**Do widzenia** is formal. **Na razie** is an informal \"see you\"."
      }
    }
  },
  {
    "lesson": "waw-1-czesc",
    "order": 6,
    "from": {
      "type": "ODD_ONE_OUT",
      "skill": "vocab.greetings",
      "data": {
        "options": [
          {
            "id": "w0",
            "text": "Cześć"
          },
          {
            "id": "w1",
            "text": "Dzień dobry"
          },
          {
            "id": "w2",
            "text": "Dobry wieczór"
          },
          {
            "id": "w3",
            "text": "Dobranoc"
          }
        ],
        "answer": "w3"
      },
      "explanation": {
        "uk": "**Dobranoc** — це не привітання, а побажання перед сном.",
        "ru": "**Dobranoc** — не приветствие, а пожелание перед сном.",
        "en": "**Dobranoc** is not a greeting — it is said before sleep."
      }
    },
    "to": {
      "type": "ODD_ONE_OUT",
      "skill": "vocab.greetings",
      "data": {
        "question": {
          "uk": "Що кажуть перед сном?",
          "ru": "Что говорят перед сном?",
          "en": "What do you say before going to bed?"
        },
        "options": [
          {
            "id": "w0",
            "text": "Cześć"
          },
          {
            "id": "w1",
            "text": "Dzień dobry"
          },
          {
            "id": "w2",
            "text": "Dobry wieczór"
          },
          {
            "id": "w3",
            "text": "Dobranoc"
          }
        ],
        "answer": "w3"
      },
      "explanation": {
        "uk": "**Dobranoc** — це не привітання, а побажання перед сном.",
        "ru": "**Dobranoc** — не приветствие, а пожелание перед сном.",
        "en": "**Dobranoc** is not a greeting — it is said before sleep."
      }
    }
  },
  {
    "lesson": "waw-2-uprzejmosc",
    "order": 14,
    "from": {
      "type": "ODD_ONE_OUT",
      "skill": "vocab.politeness",
      "data": {
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
    }
  },
  {
    "lesson": "waw-4-skad",
    "order": 15,
    "from": {
      "type": "ODD_ONE_OUT",
      "skill": "vocab.origin",
      "data": {
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
    }
  },
  {
    "lesson": "waw-p5-misja",
    "order": 13,
    "from": {
      "type": "ODD_ONE_OUT",
      "skill": "vocab.greetings",
      "data": {
        "options": [
          {
            "id": "w0",
            "text": "Na razie"
          },
          {
            "id": "w1",
            "text": "Do zobaczenia"
          },
          {
            "id": "w2",
            "text": "Do widzenia"
          },
          {
            "id": "w3",
            "text": "Dziękuję"
          }
        ],
        "answer": "w3"
      },
      "explanation": {
        "uk": "Три — прощання, а **Dziękuję** — дякую.",
        "ru": "Три — прощания, а **Dziękuję** — спасибо.",
        "en": "Three are goodbyes; **Dziękuję** means thank you."
      }
    },
    "to": {
      "type": "ODD_ONE_OUT",
      "skill": "vocab.greetings",
      "data": {
        "question": {
          "uk": "Який вираз означає подяку, а не прощання?",
          "ru": "Какое выражение означает благодарность, а не прощание?",
          "en": "Which expression gives thanks rather than says goodbye?"
        },
        "options": [
          {
            "id": "w0",
            "text": "Na razie"
          },
          {
            "id": "w1",
            "text": "Do zobaczenia"
          },
          {
            "id": "w2",
            "text": "Do widzenia"
          },
          {
            "id": "w3",
            "text": "Dziękuję"
          }
        ],
        "answer": "w3"
      },
      "explanation": {
        "uk": "Три — прощання, а **Dziękuję** — дякую.",
        "ru": "Три — прощания, а **Dziękuję** — спасибо.",
        "en": "Three are goodbyes; **Dziękuję** means thank you."
      }
    }
  },
  {
    "lesson": "waw-c1-centralna",
    "order": 10,
    "from": {
      "type": "ODD_ONE_OUT",
      "skill": "vocab.station",
      "data": {
        "options": [
          {
            "id": "w0",
            "text": "peron"
          },
          {
            "id": "w1",
            "text": "tor"
          },
          {
            "id": "w2",
            "text": "kasa"
          },
          {
            "id": "w3",
            "text": "pomidor"
          }
        ],
        "answer": "w3"
      },
      "explanation": {
        "uk": "Три — про вокзал, а **pomidor** — помідор.",
        "ru": "Три — о вокзале, а **pomidor** — помидор.",
        "en": "Three are about the station; **pomidor** is a tomato."
      }
    },
    "to": {
      "type": "ODD_ONE_OUT",
      "skill": "vocab.station",
      "data": {
        "question": {
          "uk": "Яке слово називає овоч?",
          "ru": "Какое слово называет овощ?",
          "en": "Which word names a vegetable?"
        },
        "options": [
          {
            "id": "w0",
            "text": "peron"
          },
          {
            "id": "w1",
            "text": "tor"
          },
          {
            "id": "w2",
            "text": "kasa"
          },
          {
            "id": "w3",
            "text": "pomidor"
          }
        ],
        "answer": "w3"
      },
      "explanation": {
        "uk": "Три — про вокзал, а **pomidor** — помідор.",
        "ru": "Три — о вокзале, а **pomidor** — помидор.",
        "en": "Three are about the station; **pomidor** is a tomato."
      }
    }
  },
  {
    "lesson": "waw-c2-bilety",
    "order": 11,
    "from": {
      "type": "ODD_ONE_OUT",
      "skill": "vocab.tickets",
      "data": {
        "options": [
          {
            "id": "w0",
            "text": "dobowy"
          },
          {
            "id": "w1",
            "text": "weekendowy"
          },
          {
            "id": "w2",
            "text": "dwudziestominutowy"
          },
          {
            "id": "w3",
            "text": "zielony"
          }
        ],
        "answer": "w3"
      },
      "explanation": {
        "uk": "Три — види квитків, а **zielony** — зелений.",
        "ru": "Три — виды билетов, а **zielony** — зелёный.",
        "en": "Three are ticket types; **zielony** means green."
      }
    },
    "to": {
      "type": "ODD_ONE_OUT",
      "skill": "vocab.tickets",
      "data": {
        "question": {
          "uk": "Яке слово означає колір, а не строк дії квитка?",
          "ru": "Какое слово обозначает цвет, а не срок действия билета?",
          "en": "Which word describes a colour rather than ticket validity?"
        },
        "options": [
          {
            "id": "w0",
            "text": "dobowy"
          },
          {
            "id": "w1",
            "text": "weekendowy"
          },
          {
            "id": "w2",
            "text": "dwudziestominutowy"
          },
          {
            "id": "w3",
            "text": "zielony"
          }
        ],
        "answer": "w3"
      },
      "explanation": {
        "uk": "Три — види квитків, а **zielony** — зелений.",
        "ru": "Три — виды билетов, а **zielony** — зелёный.",
        "en": "Three are ticket types; **zielony** means green."
      }
    }
  },
  {
    "lesson": "waw-c3-metro",
    "order": 13,
    "from": {
      "type": "ODD_ONE_OUT",
      "skill": "vocab.metro",
      "data": {
        "options": [
          {
            "id": "w0",
            "text": "wsiąść"
          },
          {
            "id": "w1",
            "text": "wysiąść"
          },
          {
            "id": "w2",
            "text": "przesiąść się"
          },
          {
            "id": "w3",
            "text": "zjeść"
          }
        ],
        "answer": "w3"
      },
      "explanation": {
        "uk": "Три — про поїздку, а **zjeść** — з'їсти.",
        "ru": "Три — о поездке, а **zjeść** — съесть.",
        "en": "Three are about riding; **zjeść** means to eat."
      }
    },
    "to": {
      "type": "ODD_ONE_OUT",
      "skill": "vocab.metro",
      "data": {
        "question": {
          "uk": "Яке дієслово означає дію з їжею?",
          "ru": "Какой глагол обозначает действие с едой?",
          "en": "Which verb refers to eating?"
        },
        "options": [
          {
            "id": "w0",
            "text": "wsiąść"
          },
          {
            "id": "w1",
            "text": "wysiąść"
          },
          {
            "id": "w2",
            "text": "przesiąść się"
          },
          {
            "id": "w3",
            "text": "zjeść"
          }
        ],
        "answer": "w3"
      },
      "explanation": {
        "uk": "Три — про поїздку, а **zjeść** — з'їсти.",
        "ru": "Три — о поездке, а **zjeść** — съесть.",
        "en": "Three are about riding; **zjeść** means to eat."
      }
    }
  },
  {
    "lesson": "waw-c4-misja",
    "order": 12,
    "from": {
      "type": "ODD_ONE_OUT",
      "skill": "vocab.transport",
      "data": {
        "options": [
          {
            "id": "w0",
            "text": "metro"
          },
          {
            "id": "w1",
            "text": "tramwaj"
          },
          {
            "id": "w2",
            "text": "autobus"
          },
          {
            "id": "w3",
            "text": "pierogi"
          }
        ],
        "answer": "w3"
      },
      "explanation": {
        "uk": "Три — транспорт, а **pierogi** — вареники.",
        "ru": "Три — транспорт, а **pierogi** — вареники.",
        "en": "Three are transport; **pierogi** are dumplings."
      }
    },
    "to": {
      "type": "ODD_ONE_OUT",
      "skill": "vocab.transport",
      "data": {
        "question": {
          "uk": "Що є стравою, а не транспортом?",
          "ru": "Что является блюдом, а не транспортом?",
          "en": "Which is a dish rather than transport?"
        },
        "options": [
          {
            "id": "w0",
            "text": "metro"
          },
          {
            "id": "w1",
            "text": "tramwaj"
          },
          {
            "id": "w2",
            "text": "autobus"
          },
          {
            "id": "w3",
            "text": "pierogi"
          }
        ],
        "answer": "w3"
      },
      "explanation": {
        "uk": "Три — транспорт, а **pierogi** — вареники.",
        "ru": "Три — транспорт, а **pierogi** — вареники.",
        "en": "Three are transport; **pierogi** are dumplings."
      }
    }
  },
  {
    "lesson": "waw-5-liczby",
    "order": 5,
    "from": {
      "type": "ODD_ONE_OUT",
      "skill": "vocab.numbers",
      "data": {
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
    }
  },
  {
    "lesson": "waw-5-liczby",
    "order": 14,
    "from": {
      "type": "ODD_ONE_OUT",
      "skill": "vocab.numbers",
      "data": {
        "options": [
          {
            "id": "w0",
            "text": "jeden"
          },
          {
            "id": "w1",
            "text": "dwa"
          },
          {
            "id": "w2",
            "text": "trzy"
          },
          {
            "id": "w3",
            "text": "tak"
          }
        ],
        "answer": "w3"
      },
      "explanation": {
        "uk": "**tak** — так, а не число.",
        "ru": "**tak** — да, а не число.",
        "en": "**tak** means yes, not a number."
      }
    },
    "to": {
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
            "text": "jeden"
          },
          {
            "id": "w1",
            "text": "dwa"
          },
          {
            "id": "w2",
            "text": "trzy"
          },
          {
            "id": "w3",
            "text": "tak"
          }
        ],
        "answer": "w3"
      },
      "explanation": {
        "uk": "**tak** — так, а не число.",
        "ru": "**tak** — да, а не число.",
        "en": "**tak** means yes, not a number."
      }
    }
  },
  {
    "lesson": "waw-k3-zakupy",
    "order": 13,
    "from": {
      "type": "ODD_ONE_OUT",
      "skill": "vocab.food",
      "data": {
        "options": [
          {
            "id": "w0",
            "text": "ziemniak"
          },
          {
            "id": "w1",
            "text": "ogórek"
          },
          {
            "id": "w2",
            "text": "pomidor"
          },
          {
            "id": "w3",
            "text": "kiosk"
          }
        ],
        "answer": "w3"
      },
      "explanation": {
        "uk": "Три — овочі, а **kiosk** — кіоск.",
        "ru": "Три — овощи, а **kiosk** — киоск.",
        "en": "Three are vegetables; **kiosk** is a kiosk."
      }
    },
    "to": {
      "type": "ODD_ONE_OUT",
      "skill": "vocab.food",
      "data": {
        "question": {
          "uk": "Що НЕ є овочем?",
          "ru": "Что НЕ является овощем?",
          "en": "Which is NOT a vegetable?"
        },
        "options": [
          {
            "id": "w0",
            "text": "ziemniak"
          },
          {
            "id": "w1",
            "text": "ogórek"
          },
          {
            "id": "w2",
            "text": "pomidor"
          },
          {
            "id": "w3",
            "text": "kiosk"
          }
        ],
        "answer": "w3"
      },
      "explanation": {
        "uk": "Три — овочі, а **kiosk** — кіоск.",
        "ru": "Три — овощи, а **kiosk** — киоск.",
        "en": "Three are vegetables; **kiosk** is a kiosk."
      }
    }
  },
  {
    "lesson": "waw-k4-misja",
    "order": 12,
    "from": {
      "type": "ODD_ONE_OUT",
      "skill": "vocab.shop",
      "data": {
        "options": [
          {
            "id": "w0",
            "text": "tanio"
          },
          {
            "id": "w1",
            "text": "drogo"
          },
          {
            "id": "w2",
            "text": "w promocji"
          },
          {
            "id": "w3",
            "text": "na peronie"
          }
        ],
        "answer": "w3"
      },
      "explanation": {
        "uk": "Три — про ціну, а **na peronie** — на платформі.",
        "ru": "Три — о цене, а **na peronie** — на платформе.",
        "en": "Three are about prices; **na peronie** means on the platform."
      }
    },
    "to": {
      "type": "ODD_ONE_OUT",
      "skill": "vocab.shop",
      "data": {
        "question": {
          "uk": "Який вираз позначає місце, а не ціну?",
          "ru": "Какое выражение обозначает место, а не цену?",
          "en": "Which expression describes a place rather than a price?"
        },
        "options": [
          {
            "id": "w0",
            "text": "tanio"
          },
          {
            "id": "w1",
            "text": "drogo"
          },
          {
            "id": "w2",
            "text": "w promocji"
          },
          {
            "id": "w3",
            "text": "na peronie"
          }
        ],
        "answer": "w3"
      },
      "explanation": {
        "uk": "Три — про ціну, а **na peronie** — на платформі.",
        "ru": "Три — о цене, а **na peronie** — на платформе.",
        "en": "Three are about prices; **na peronie** means on the platform."
      }
    }
  },
  {
    "lesson": "waw-s1-zabytki",
    "order": 11,
    "from": {
      "type": "ODD_ONE_OUT",
      "skill": "vocab.city",
      "data": {
        "options": [
          {
            "id": "w0",
            "text": "zamek"
          },
          {
            "id": "w1",
            "text": "kamienica"
          },
          {
            "id": "w2",
            "text": "pomnik"
          },
          {
            "id": "w3",
            "text": "pociąg"
          }
        ],
        "answer": "w3"
      },
      "explanation": {
        "uk": "Три — у місті-пам'ятці, а **pociąg** — потяг.",
        "ru": "Три — достопримечательности, а **pociąg** — поезд.",
        "en": "Three are sights; **pociąg** is a train."
      }
    },
    "to": {
      "type": "ODD_ONE_OUT",
      "skill": "vocab.city",
      "data": {
        "question": {
          "uk": "Що є транспортним засобом, а не міським об’єктом?",
          "ru": "Что является транспортным средством, а не городским объектом?",
          "en": "Which is a vehicle rather than a city structure?"
        },
        "options": [
          {
            "id": "w0",
            "text": "zamek"
          },
          {
            "id": "w1",
            "text": "kamienica"
          },
          {
            "id": "w2",
            "text": "pomnik"
          },
          {
            "id": "w3",
            "text": "pociąg"
          }
        ],
        "answer": "w3"
      },
      "explanation": {
        "uk": "Три — у місті-пам'ятці, а **pociąg** — потяг.",
        "ru": "Три — достопримечательности, а **pociąg** — поезд.",
        "en": "Three are sights; **pociąg** is a train."
      }
    }
  },
  {
    "lesson": "waw-s2-kierunki",
    "order": 12,
    "from": {
      "type": "ODD_ONE_OUT",
      "skill": "vocab.directions",
      "data": {
        "options": [
          {
            "id": "w0",
            "text": "prosto"
          },
          {
            "id": "w1",
            "text": "w lewo"
          },
          {
            "id": "w2",
            "text": "w prawo"
          },
          {
            "id": "w3",
            "text": "wczoraj"
          }
        ],
        "answer": "w3"
      },
      "explanation": {
        "uk": "Три — напрямки, а **wczoraj** — учора.",
        "ru": "Три — направления, а **wczoraj** — вчера.",
        "en": "Three are directions; **wczoraj** means yesterday."
      }
    },
    "to": {
      "type": "ODD_ONE_OUT",
      "skill": "vocab.directions",
      "data": {
        "question": {
          "uk": "Яке слово позначає час, а не напрямок?",
          "ru": "Какое слово обозначает время, а не направление?",
          "en": "Which word describes time rather than a direction?"
        },
        "options": [
          {
            "id": "w0",
            "text": "prosto"
          },
          {
            "id": "w1",
            "text": "w lewo"
          },
          {
            "id": "w2",
            "text": "w prawo"
          },
          {
            "id": "w3",
            "text": "wczoraj"
          }
        ],
        "answer": "w3"
      },
      "explanation": {
        "uk": "Три — напрямки, а **wczoraj** — учора.",
        "ru": "Три — направления, а **wczoraj** — вчера.",
        "en": "Three are directions; **wczoraj** means yesterday."
      }
    }
  },
  {
    "lesson": "waw-s3-mapa",
    "order": 12,
    "from": {
      "type": "ODD_ONE_OUT",
      "skill": "vocab.map",
      "data": {
        "options": [
          {
            "id": "w0",
            "text": "tutaj"
          },
          {
            "id": "w1",
            "text": "tam"
          },
          {
            "id": "w2",
            "text": "niedaleko"
          },
          {
            "id": "w3",
            "text": "smacznego"
          }
        ],
        "answer": "w3"
      },
      "explanation": {
        "uk": "Три — про місце, а **smacznego** — «смачного».",
        "ru": "Три — о месте, а **smacznego** — «приятного аппетита».",
        "en": "Three are about place; **smacznego** means \"enjoy your meal\"."
      }
    },
    "to": {
      "type": "ODD_ONE_OUT",
      "skill": "vocab.map",
      "data": {
        "question": {
          "uk": "Яке слово є побажанням за столом?",
          "ru": "Какое слово является пожеланием за столом?",
          "en": "Which expression is a wish before a meal?"
        },
        "options": [
          {
            "id": "w0",
            "text": "tutaj"
          },
          {
            "id": "w1",
            "text": "tam"
          },
          {
            "id": "w2",
            "text": "niedaleko"
          },
          {
            "id": "w3",
            "text": "smacznego"
          }
        ],
        "answer": "w3"
      },
      "explanation": {
        "uk": "Три — про місце, а **smacznego** — «смачного».",
        "ru": "Три — о месте, а **smacznego** — «приятного аппетита».",
        "en": "Three are about place; **smacznego** means \"enjoy your meal\"."
      }
    }
  },
  {
    "lesson": "waw-s4-misja",
    "order": 11,
    "from": {
      "type": "ODD_ONE_OUT",
      "skill": "vocab.city",
      "data": {
        "options": [
          {
            "id": "w0",
            "text": "Barbakan"
          },
          {
            "id": "w1",
            "text": "Zamek Królewski"
          },
          {
            "id": "w2",
            "text": "Kolumna Zygmunta"
          },
          {
            "id": "w3",
            "text": "Wawel"
          }
        ],
        "answer": "w3"
      },
      "explanation": {
        "uk": "Три пам'ятки — у Варшаві, а **Wawel** — у Кракові.",
        "ru": "Три достопримечательности — в Варшаве, а **Wawel** — в Кракове.",
        "en": "Three sights are in Warsaw; **Wawel** is in Kraków."
      }
    },
    "to": {
      "type": "ODD_ONE_OUT",
      "skill": "vocab.city",
      "data": {
        "question": {
          "uk": "Яка пам’ятка розташована у Кракові, а не у Варшаві?",
          "ru": "Какая достопримечательность находится в Кракове, а не в Варшаве?",
          "en": "Which landmark is in Kraków rather than Warsaw?"
        },
        "options": [
          {
            "id": "w0",
            "text": "Barbakan"
          },
          {
            "id": "w1",
            "text": "Zamek Królewski"
          },
          {
            "id": "w2",
            "text": "Kolumna Zygmunta"
          },
          {
            "id": "w3",
            "text": "Wawel"
          }
        ],
        "answer": "w3"
      },
      "explanation": {
        "uk": "Три пам'ятки — у Варшаві, а **Wawel** — у Кракові.",
        "ru": "Три достопримечательности — в Варшаве, а **Wawel** — в Кракове.",
        "en": "Three sights are in Warsaw; **Wawel** is in Kraków."
      }
    }
  },
  {
    "lesson": "waw-f1-kawa",
    "order": 12,
    "from": {
      "type": "ODD_ONE_OUT",
      "skill": "vocab.cafe",
      "data": {
        "options": [
          {
            "id": "w0",
            "text": "espresso"
          },
          {
            "id": "w1",
            "text": "latte"
          },
          {
            "id": "w2",
            "text": "cappuccino"
          },
          {
            "id": "w3",
            "text": "pierogi"
          }
        ],
        "answer": "w3"
      },
      "explanation": {
        "uk": "Три — кавові напої, а **pierogi** — вареники.",
        "ru": "Три — кофейные напитки, а **pierogi** — вареники.",
        "en": "Three are coffees; **pierogi** are dumplings."
      }
    },
    "to": {
      "type": "ODD_ONE_OUT",
      "skill": "vocab.cafe",
      "data": {
        "question": {
          "uk": "Що НЕ є кавовим напоєм?",
          "ru": "Что НЕ является кофейным напитком?",
          "en": "Which is NOT a coffee drink?"
        },
        "options": [
          {
            "id": "w0",
            "text": "espresso"
          },
          {
            "id": "w1",
            "text": "latte"
          },
          {
            "id": "w2",
            "text": "cappuccino"
          },
          {
            "id": "w3",
            "text": "pierogi"
          }
        ],
        "answer": "w3"
      },
      "explanation": {
        "uk": "Три — кавові напої, а **pierogi** — вареники.",
        "ru": "Три — кофейные напитки, а **pierogi** — вареники.",
        "en": "Three are coffees; **pierogi** are dumplings."
      }
    }
  },
  {
    "lesson": "waw-f2-piekarnia",
    "order": 13,
    "from": {
      "type": "ODD_ONE_OUT",
      "skill": "vocab.bakery",
      "data": {
        "options": [
          {
            "id": "w0",
            "text": "chleb"
          },
          {
            "id": "w1",
            "text": "bułka"
          },
          {
            "id": "w2",
            "text": "chałka"
          },
          {
            "id": "w3",
            "text": "masło"
          }
        ],
        "answer": "w3"
      },
      "explanation": {
        "uk": "Три — випічка, а **masło** — масло.",
        "ru": "Три — выпечка, а **masło** — масло.",
        "en": "Three are baked goods; **masło** is butter."
      }
    },
    "to": {
      "type": "ODD_ONE_OUT",
      "skill": "vocab.bakery",
      "data": {
        "question": {
          "uk": "Що є молочним продуктом, а не хлібним виробом?",
          "ru": "Что является молочным продуктом, а не хлебным изделием?",
          "en": "Which is a dairy product rather than bread?"
        },
        "options": [
          {
            "id": "w0",
            "text": "chleb"
          },
          {
            "id": "w1",
            "text": "bułka"
          },
          {
            "id": "w2",
            "text": "chałka"
          },
          {
            "id": "w3",
            "text": "masło"
          }
        ],
        "answer": "w3"
      },
      "explanation": {
        "uk": "Три — випічка, а **masło** — масло.",
        "ru": "Три — выпечка, а **masło** — масло.",
        "en": "Three are baked goods; **masło** is butter."
      }
    }
  },
  {
    "lesson": "waw-f3-gusty",
    "order": 13,
    "from": {
      "type": "ODD_ONE_OUT",
      "skill": "vocab.taste",
      "data": {
        "options": [
          {
            "id": "w0",
            "text": "słodki"
          },
          {
            "id": "w1",
            "text": "gorzki"
          },
          {
            "id": "w2",
            "text": "pyszny"
          },
          {
            "id": "w3",
            "text": "szybki"
          }
        ],
        "answer": "w3"
      },
      "explanation": {
        "uk": "Три — про смак, а **szybki** — швидкий.",
        "ru": "Три — о вкусе, а **szybki** — быстрый.",
        "en": "Three describe taste; **szybki** means fast."
      }
    },
    "to": {
      "type": "ODD_ONE_OUT",
      "skill": "vocab.taste",
      "data": {
        "question": {
          "uk": "Яке слово означає «швидкий»?",
          "ru": "Какое слово означает «быстрый»?",
          "en": "Which word means fast?"
        },
        "options": [
          {
            "id": "w0",
            "text": "słodki"
          },
          {
            "id": "w1",
            "text": "gorzki"
          },
          {
            "id": "w2",
            "text": "pyszny"
          },
          {
            "id": "w3",
            "text": "szybki"
          }
        ],
        "answer": "w3"
      },
      "explanation": {
        "uk": "Три — про смак, а **szybki** — швидкий.",
        "ru": "Три — о вкусе, а **szybki** — быстрый.",
        "en": "Three describe taste; **szybki** means fast."
      }
    }
  },
  {
    "lesson": "waw-f4-misja",
    "order": 12,
    "from": {
      "type": "ODD_ONE_OUT",
      "skill": "vocab.places",
      "data": {
        "options": [
          {
            "id": "w0",
            "text": "piekarnia"
          },
          {
            "id": "w1",
            "text": "cukiernia"
          },
          {
            "id": "w2",
            "text": "kawiarnia"
          },
          {
            "id": "w3",
            "text": "apteka"
          }
        ],
        "answer": "w3"
      },
      "explanation": {
        "uk": "Три — про їжу й напої, а **apteka** — аптека.",
        "ru": "Три — о еде и напитках, а **apteka** — аптека.",
        "en": "Three are about food and drink; **apteka** is a pharmacy."
      }
    },
    "to": {
      "type": "ODD_ONE_OUT",
      "skill": "vocab.places",
      "data": {
        "question": {
          "uk": "Де купують ліки?",
          "ru": "Где покупают лекарства?",
          "en": "Where do you buy medicine?"
        },
        "options": [
          {
            "id": "w0",
            "text": "piekarnia"
          },
          {
            "id": "w1",
            "text": "cukiernia"
          },
          {
            "id": "w2",
            "text": "kawiarnia"
          },
          {
            "id": "w3",
            "text": "apteka"
          }
        ],
        "answer": "w3"
      },
      "explanation": {
        "uk": "Три — про їжу й напої, а **apteka** — аптека.",
        "ru": "Три — о еде и напитках, а **apteka** — аптека.",
        "en": "Three are about food and drink; **apteka** is a pharmacy."
      }
    }
  },
  {
    "lesson": "waw-n1-sasiad",
    "order": 12,
    "from": {
      "type": "ODD_ONE_OUT",
      "skill": "vocab.home",
      "data": {
        "options": [
          {
            "id": "w0",
            "text": "blok"
          },
          {
            "id": "w1",
            "text": "klatka schodowa"
          },
          {
            "id": "w2",
            "text": "winda"
          },
          {
            "id": "w3",
            "text": "peron"
          }
        ],
        "answer": "w3"
      },
      "explanation": {
        "uk": "Три — у будинку, а **peron** — на вокзалі.",
        "ru": "Три — в доме, а **peron** — на вокзале.",
        "en": "Three are in a building; a **peron** is at a station."
      }
    },
    "to": {
      "type": "ODD_ONE_OUT",
      "skill": "vocab.home",
      "data": {
        "question": {
          "uk": "Що позначає платформу на вокзалі?",
          "ru": "Что обозначает платформу на вокзале?",
          "en": "Which word means a station platform?"
        },
        "options": [
          {
            "id": "w0",
            "text": "blok"
          },
          {
            "id": "w1",
            "text": "klatka schodowa"
          },
          {
            "id": "w2",
            "text": "winda"
          },
          {
            "id": "w3",
            "text": "peron"
          }
        ],
        "answer": "w3"
      },
      "explanation": {
        "uk": "Три — у будинку, а **peron** — на вокзалі.",
        "ru": "Три — в доме, а **peron** — на вокзале.",
        "en": "Three are in a building; a **peron** is at a station."
      }
    }
  },
  {
    "lesson": "waw-n2-blok",
    "order": 11,
    "from": {
      "type": "ODD_ONE_OUT",
      "skill": "vocab.colors",
      "data": {
        "options": [
          {
            "id": "w0",
            "text": "niebieski"
          },
          {
            "id": "w1",
            "text": "żółty"
          },
          {
            "id": "w2",
            "text": "zielony"
          },
          {
            "id": "w3",
            "text": "wolny"
          }
        ],
        "answer": "w3"
      },
      "explanation": {
        "uk": "Три — кольори, а **wolny** — вільний.",
        "ru": "Три — цвета, а **wolny** — свободный.",
        "en": "Three are colours; **wolny** means free."
      }
    },
    "to": {
      "type": "ODD_ONE_OUT",
      "skill": "vocab.colors",
      "data": {
        "question": {
          "uk": "Яке слово НЕ позначає колір?",
          "ru": "Какое слово НЕ обозначает цвет?",
          "en": "Which word does NOT name a colour?"
        },
        "options": [
          {
            "id": "w0",
            "text": "niebieski"
          },
          {
            "id": "w1",
            "text": "żółty"
          },
          {
            "id": "w2",
            "text": "zielony"
          },
          {
            "id": "w3",
            "text": "wolny"
          }
        ],
        "answer": "w3"
      },
      "explanation": {
        "uk": "Три — кольори, а **wolny** — вільний.",
        "ru": "Три — цвета, а **wolny** — свободный.",
        "en": "Three are colours; **wolny** means free."
      }
    }
  },
  {
    "lesson": "waw-n3-plany",
    "order": 13,
    "from": {
      "type": "ODD_ONE_OUT",
      "skill": "vocab.time",
      "data": {
        "options": [
          {
            "id": "w0",
            "text": "rano"
          },
          {
            "id": "w1",
            "text": "po południu"
          },
          {
            "id": "w2",
            "text": "wieczorem"
          },
          {
            "id": "w3",
            "text": "na rogu"
          }
        ],
        "answer": "w3"
      },
      "explanation": {
        "uk": "Три — частини дня, а **na rogu** — на розі.",
        "ru": "Три — части дня, а **na rogu** — на углу.",
        "en": "Three are times of day; **na rogu** means on the corner."
      }
    },
    "to": {
      "type": "ODD_ONE_OUT",
      "skill": "vocab.time",
      "data": {
        "question": {
          "uk": "Який вираз позначає місце, а не час доби?",
          "ru": "Какое выражение обозначает место, а не время суток?",
          "en": "Which expression describes a place rather than a time of day?"
        },
        "options": [
          {
            "id": "w0",
            "text": "rano"
          },
          {
            "id": "w1",
            "text": "po południu"
          },
          {
            "id": "w2",
            "text": "wieczorem"
          },
          {
            "id": "w3",
            "text": "na rogu"
          }
        ],
        "answer": "w3"
      },
      "explanation": {
        "uk": "Три — частини дня, а **na rogu** — на розі.",
        "ru": "Три — части дня, а **na rogu** — на углу.",
        "en": "Three are times of day; **na rogu** means on the corner."
      }
    }
  },
  {
    "lesson": "waw-n4-misja",
    "order": 12,
    "from": {
      "type": "ODD_ONE_OUT",
      "skill": "vocab.verbs",
      "data": {
        "options": [
          {
            "id": "w0",
            "text": "pożyczyć"
          },
          {
            "id": "w1",
            "text": "pomóc"
          },
          {
            "id": "w2",
            "text": "sprzątać"
          },
          {
            "id": "w3",
            "text": "smacznego"
          }
        ],
        "answer": "w3"
      },
      "explanation": {
        "uk": "Три — дієслова, а **smacznego** — побажання за столом.",
        "ru": "Три — глаголы, а **smacznego** — пожелание за столом.",
        "en": "Three are verbs; **smacznego** is a mealtime wish."
      }
    },
    "to": {
      "type": "ODD_ONE_OUT",
      "skill": "vocab.verbs",
      "data": {
        "question": {
          "uk": "Що є побажанням, а не інфінітивом?",
          "ru": "Что является пожеланием, а не инфинитивом?",
          "en": "Which is a wish rather than an infinitive?"
        },
        "options": [
          {
            "id": "w0",
            "text": "pożyczyć"
          },
          {
            "id": "w1",
            "text": "pomóc"
          },
          {
            "id": "w2",
            "text": "sprzątać"
          },
          {
            "id": "w3",
            "text": "smacznego"
          }
        ],
        "answer": "w3"
      },
      "explanation": {
        "uk": "Три — дієслова, а **smacznego** — побажання за столом.",
        "ru": "Три — глаголы, а **smacznego** — пожелание за столом.",
        "en": "Three are verbs; **smacznego** is a mealtime wish."
      }
    }
  },
  {
    "lesson": "lodz-1-alfabet",
    "order": 5,
    "from": {
      "type": "ODD_ONE_OUT",
      "skill": "pronunciation.letters",
      "data": {
        "options": [
          {
            "id": "w0",
            "text": "góra"
          },
          {
            "id": "w1",
            "text": "córka"
          },
          {
            "id": "w2",
            "text": "koń"
          },
          {
            "id": "w3",
            "text": "ból"
          }
        ],
        "answer": "w2"
      },
      "explanation": {
        "uk": "У **góra**, **córka**, **ból** є **ó** (= «у»). У **koń** — звичайне **o**.",
        "ru": "В **góra**, **córka**, **ból** есть **ó** (= «у»). В **koń** — обычное **o**.",
        "en": "**góra**, **córka**, **ból** have **ó** (= \"u\"); **koń** has a plain **o**."
      }
    },
    "to": {
      "type": "ODD_ONE_OUT",
      "skill": "pronunciation.letters",
      "data": {
        "question": {
          "uk": "У якому слові є o, а не ó?",
          "ru": "В каком слове есть o, а не ó?",
          "en": "Which word contains o rather than ó?"
        },
        "options": [
          {
            "id": "w0",
            "text": "góra"
          },
          {
            "id": "w1",
            "text": "córka"
          },
          {
            "id": "w2",
            "text": "koń"
          },
          {
            "id": "w3",
            "text": "ból"
          }
        ],
        "answer": "w2"
      },
      "explanation": {
        "uk": "У **góra**, **córka**, **ból** є **ó** (= «у»). У **koń** — звичайне **o**.",
        "ru": "В **góra**, **córka**, **ból** есть **ó** (= «у»). В **koń** — обычное **o**.",
        "en": "**góra**, **córka**, **ból** have **ó** (= \"u\"); **koń** has a plain **o**."
      }
    }
  },
  {
    "lesson": "lodz-4-oni-one",
    "order": 6,
    "from": {
      "type": "ODD_ONE_OUT",
      "skill": "grammar.oni",
      "data": {
        "options": [
          {
            "id": "w0",
            "text": "koleżanki"
          },
          {
            "id": "w1",
            "text": "dziewczyny"
          },
          {
            "id": "w2",
            "text": "koledzy"
          },
          {
            "id": "w3",
            "text": "książki"
          }
        ],
        "answer": "w2"
      },
      "explanation": {
        "uk": "**koledzy** (колеги-чоловіки) — **oni**. Решта — **one**.",
        "ru": "**koledzy** — **oni**. Остальные — **one**.",
        "en": "**koledzy** — **oni**; the rest — **one**."
      }
    },
    "to": {
      "type": "ODD_ONE_OUT",
      "skill": "grammar.oni",
      "data": {
        "question": {
          "uk": "Яке слово поєднується із займенником oni?",
          "ru": "Какое слово сочетается с местоимением oni?",
          "en": "Which word takes the pronoun oni?"
        },
        "options": [
          {
            "id": "w0",
            "text": "koleżanki"
          },
          {
            "id": "w1",
            "text": "dziewczyny"
          },
          {
            "id": "w2",
            "text": "koledzy"
          },
          {
            "id": "w3",
            "text": "książki"
          }
        ],
        "answer": "w2"
      },
      "explanation": {
        "uk": "**koledzy** (колеги-чоловіки) — **oni**. Решта — **one**.",
        "ru": "**koledzy** — **oni**. Остальные — **one**.",
        "en": "**koledzy** — **oni**; the rest — **one**."
      }
    }
  },
  {
    "lesson": "krk-d1-powitanie",
    "order": 12,
    "from": {
      "type": "ODD_ONE_OUT",
      "skill": "vocab.greetings",
      "data": {
        "options": [
          {
            "id": "w0",
            "text": "dzień dobry"
          },
          {
            "id": "w1",
            "text": "dobry wieczór"
          },
          {
            "id": "w2",
            "text": "dziękuję"
          },
          {
            "id": "w3",
            "text": "cześć"
          }
        ],
        "answer": "w2"
      },
      "explanation": {
        "uk": "Три вирази — привітання, а **dziękuję** — «дякую».",
        "ru": "Три выражения — приветствия, а **dziękuję** — «спасибо».",
        "en": "Three are greetings; **dziękuję** means \"thank you\"."
      }
    },
    "to": {
      "type": "ODD_ONE_OUT",
      "skill": "vocab.greetings",
      "data": {
        "question": {
          "uk": "Який вираз означає подяку?",
          "ru": "Какое выражение означает благодарность?",
          "en": "Which expression gives thanks?"
        },
        "options": [
          {
            "id": "w0",
            "text": "dzień dobry"
          },
          {
            "id": "w1",
            "text": "dobry wieczór"
          },
          {
            "id": "w2",
            "text": "dziękuję"
          },
          {
            "id": "w3",
            "text": "cześć"
          }
        ],
        "answer": "w2"
      },
      "explanation": {
        "uk": "Три вирази — привітання, а **dziękuję** — «дякую».",
        "ru": "Три выражения — приветствия, а **dziękuję** — «спасибо».",
        "en": "Three are greetings; **dziękuję** means \"thank you\"."
      }
    }
  },
  {
    "lesson": "krk-d2-gdzie",
    "order": 15,
    "from": {
      "type": "ODD_ONE_OUT",
      "skill": "vocab.directions",
      "data": {
        "options": [
          {
            "id": "w0",
            "text": "prosto"
          },
          {
            "id": "w1",
            "text": "w prawo"
          },
          {
            "id": "w2",
            "text": "w lewo"
          },
          {
            "id": "w3",
            "text": "toaleta"
          }
        ],
        "answer": "w3"
      },
      "explanation": {
        "uk": "**toaleta** — місце, а решта — напрямки.",
        "ru": "**toaleta** — место, а остальное — направления.",
        "en": "**toaleta** is a place; the rest are directions."
      }
    },
    "to": {
      "type": "ODD_ONE_OUT",
      "skill": "vocab.directions",
      "data": {
        "question": {
          "uk": "Яке слово називає місце, а не напрямок?",
          "ru": "Какое слово называет место, а не направление?",
          "en": "Which word names a place rather than a direction?"
        },
        "options": [
          {
            "id": "w0",
            "text": "prosto"
          },
          {
            "id": "w1",
            "text": "w prawo"
          },
          {
            "id": "w2",
            "text": "w lewo"
          },
          {
            "id": "w3",
            "text": "toaleta"
          }
        ],
        "answer": "w3"
      },
      "explanation": {
        "uk": "**toaleta** — місце, а решта — напрямки.",
        "ru": "**toaleta** — место, а остальное — направления.",
        "en": "**toaleta** is a place; the rest are directions."
      }
    }
  },
  {
    "lesson": "krk-z1-produkty",
    "order": 13,
    "from": {
      "type": "ODD_ONE_OUT",
      "skill": "vocab.food",
      "data": {
        "options": [
          {
            "id": "w0",
            "text": "woda"
          },
          {
            "id": "w1",
            "text": "sok"
          },
          {
            "id": "w2",
            "text": "kawa"
          },
          {
            "id": "w3",
            "text": "ser"
          }
        ],
        "answer": "w3"
      },
      "explanation": {
        "uk": "Три слова — напої, а **ser** — сир.",
        "ru": "Три слова — напитки, а **ser** — сыр.",
        "en": "Three are drinks; **ser** is cheese."
      }
    },
    "to": {
      "type": "ODD_ONE_OUT",
      "skill": "vocab.food",
      "data": {
        "question": {
          "uk": "Що НЕ є напоєм?",
          "ru": "Что НЕ является напитком?",
          "en": "Which is NOT a drink?"
        },
        "options": [
          {
            "id": "w0",
            "text": "woda"
          },
          {
            "id": "w1",
            "text": "sok"
          },
          {
            "id": "w2",
            "text": "kawa"
          },
          {
            "id": "w3",
            "text": "ser"
          }
        ],
        "answer": "w3"
      },
      "explanation": {
        "uk": "Три слова — напої, а **ser** — сир.",
        "ru": "Три слова — напитки, а **ser** — сыр.",
        "en": "Three are drinks; **ser** is cheese."
      }
    }
  },
  {
    "lesson": "krk-z2-ceny",
    "order": 14,
    "from": {
      "type": "FIND_ERROR",
      "skill": "grammar.money",
      "data": {
        "pl": "To kosztuje pięć złote",
        "translation": {
          "uk": "Це коштує п'ять злотих.",
          "ru": "Это стоит пять злотых.",
          "en": "It costs five złoty."
        },
        "options": [
          {
            "id": "w0",
            "text": "To"
          },
          {
            "id": "w1",
            "text": "kosztuje"
          },
          {
            "id": "w2",
            "text": "pięć"
          },
          {
            "id": "w3",
            "text": "złote"
          }
        ],
        "answer": "w3"
      },
      "explanation": {
        "uk": "5 і більше → **złotych**.",
        "ru": "5 и больше → **złotych**.",
        "en": "5 and more → **złotych**."
      }
    },
    "to": {
      "type": "FIND_ERROR",
      "skill": "grammar.money",
      "data": {
        "pl": "Ten sok kosztuje siedem złote",
        "translation": {
          "uk": "Цей сік коштує сім злотих.",
          "ru": "Этот сок стоит семь злотых.",
          "en": "This juice costs seven złoty."
        },
        "options": [
          {
            "id": "w0",
            "text": "Ten"
          },
          {
            "id": "w1",
            "text": "sok"
          },
          {
            "id": "w2",
            "text": "kosztuje"
          },
          {
            "id": "w3",
            "text": "siedem"
          },
          {
            "id": "w4",
            "text": "złote"
          }
        ],
        "answer": "w4"
      },
      "explanation": {
        "uk": "5 і більше → **złotych**.",
        "ru": "5 и больше → **złotych**.",
        "en": "5 and more → **złotych**."
      }
    }
  },
  {
    "lesson": "krk-z3-kasa",
    "order": 15,
    "from": {
      "type": "ODD_ONE_OUT",
      "skill": "vocab.shop",
      "data": {
        "options": [
          {
            "id": "w0",
            "text": "kartą"
          },
          {
            "id": "w1",
            "text": "gotówką"
          },
          {
            "id": "w2",
            "text": "BLIKIEM"
          },
          {
            "id": "w3",
            "text": "biletem"
          }
        ],
        "answer": "w3"
      },
      "explanation": {
        "uk": "Три способи оплати, а **biletem** — «квитком».",
        "ru": "Три способа оплаты, а **biletem** — «билетом».",
        "en": "Three ways to pay; **biletem** means \"with a ticket\"."
      }
    },
    "to": {
      "type": "ODD_ONE_OUT",
      "skill": "vocab.shop",
      "data": {
        "question": {
          "uk": "Чим НЕ можна оплатити покупку?",
          "ru": "Чем НЕЛЬЗЯ оплатить покупку?",
          "en": "Which cannot be used to pay for a purchase?"
        },
        "options": [
          {
            "id": "w0",
            "text": "kartą"
          },
          {
            "id": "w1",
            "text": "gotówką"
          },
          {
            "id": "w2",
            "text": "BLIKIEM"
          },
          {
            "id": "w3",
            "text": "biletem"
          }
        ],
        "answer": "w3"
      },
      "explanation": {
        "uk": "Три способи оплати, а **biletem** — «квитком».",
        "ru": "Три способа оплаты, а **biletem** — «билетом».",
        "en": "Three ways to pay; **biletem** means \"with a ticket\"."
      }
    }
  },
  {
    "lesson": "krk-z5-misja",
    "order": 16,
    "from": {
      "type": "ODD_ONE_OUT",
      "skill": "vocab.hotdog",
      "data": {
        "options": [
          {
            "id": "w0",
            "text": "ketchup"
          },
          {
            "id": "w1",
            "text": "musztarda"
          },
          {
            "id": "w2",
            "text": "sos czosnkowy"
          },
          {
            "id": "w3",
            "text": "reszta"
          }
        ],
        "answer": "w3"
      },
      "explanation": {
        "uk": "Три — до хот-дога, а **reszta** — решта (гроші).",
        "ru": "Три — к хот-догу, а **reszta** — сдача.",
        "en": "Three go on a hot dog; **reszta** is change."
      }
    },
    "to": {
      "type": "ODD_ONE_OUT",
      "skill": "vocab.hotdog",
      "data": {
        "question": {
          "uk": "Що означає гроші, які повертають після оплати?",
          "ru": "Что означает деньги, которые возвращают после оплаты?",
          "en": "Which word means the change returned after payment?"
        },
        "options": [
          {
            "id": "w0",
            "text": "ketchup"
          },
          {
            "id": "w1",
            "text": "musztarda"
          },
          {
            "id": "w2",
            "text": "sos czosnkowy"
          },
          {
            "id": "w3",
            "text": "reszta"
          }
        ],
        "answer": "w3"
      },
      "explanation": {
        "uk": "Три — до хот-дога, а **reszta** — решта (гроші).",
        "ru": "Три — к хот-догу, а **reszta** — сдача.",
        "en": "Three go on a hot dog; **reszta** is change."
      }
    }
  },
  {
    "lesson": "krk-r1-miasto",
    "order": 11,
    "from": {
      "type": "ODD_ONE_OUT",
      "skill": "vocab.city",
      "data": {
        "options": [
          {
            "id": "w0",
            "text": "kościół"
          },
          {
            "id": "w1",
            "text": "ratusz"
          },
          {
            "id": "w2",
            "text": "muzeum"
          },
          {
            "id": "w3",
            "text": "kanapka"
          }
        ],
        "answer": "w3"
      },
      "explanation": {
        "uk": "Три — будівлі в місті, а **kanapka** — канапка.",
        "ru": "Три — здания в городе, а **kanapka** — бутерброд.",
        "en": "Three are buildings; **kanapka** is a sandwich."
      }
    },
    "to": {
      "type": "ODD_ONE_OUT",
      "skill": "vocab.city",
      "data": {
        "question": {
          "uk": "Що є їжею, а не будівлею?",
          "ru": "Что является едой, а не зданием?",
          "en": "Which is food rather than a building?"
        },
        "options": [
          {
            "id": "w0",
            "text": "kościół"
          },
          {
            "id": "w1",
            "text": "ratusz"
          },
          {
            "id": "w2",
            "text": "muzeum"
          },
          {
            "id": "w3",
            "text": "kanapka"
          }
        ],
        "answer": "w3"
      },
      "explanation": {
        "uk": "Три — будівлі в місті, а **kanapka** — канапка.",
        "ru": "Три — здания в городе, а **kanapka** — бутерброд.",
        "en": "Three are buildings; **kanapka** is a sandwich."
      }
    }
  },
  {
    "lesson": "krk-r3-opis",
    "order": 9,
    "from": {
      "type": "ODD_ONE_OUT",
      "skill": "grammar.adj",
      "data": {
        "options": [
          {
            "id": "w0",
            "text": "piękna ulica"
          },
          {
            "id": "w1",
            "text": "stara kawiarnia"
          },
          {
            "id": "w2",
            "text": "duża apteka"
          },
          {
            "id": "w3",
            "text": "mały rynek"
          }
        ],
        "answer": "w3"
      },
      "explanation": {
        "uk": "Три пари — жіночого роду, а **mały rynek** — чоловічого.",
        "ru": "Три пары — женского рода, а **mały rynek** — мужского.",
        "en": "Three pairs are feminine; **mały rynek** is masculine."
      }
    },
    "to": {
      "type": "ODD_ONE_OUT",
      "skill": "grammar.adj",
      "data": {
        "question": {
          "uk": "У якому словосполученні іменник чоловічого роду?",
          "ru": "В каком словосочетании существительное мужского рода?",
          "en": "Which phrase contains a masculine noun?"
        },
        "options": [
          {
            "id": "w0",
            "text": "piękna ulica"
          },
          {
            "id": "w1",
            "text": "stara kawiarnia"
          },
          {
            "id": "w2",
            "text": "duża apteka"
          },
          {
            "id": "w3",
            "text": "mały rynek"
          }
        ],
        "answer": "w3"
      },
      "explanation": {
        "uk": "Три пари — жіночого роду, а **mały rynek** — чоловічого.",
        "ru": "Три пары — женского рода, а **mały rynek** — мужского.",
        "en": "Three pairs are feminine; **mały rynek** is masculine."
      }
    }
  },
  {
    "lesson": "krk-r3-opis",
    "order": 16,
    "from": {
      "type": "DICTATION",
      "skill": "writing.adj",
      "data": {
        "audioText": "Stare miasto jest piękne",
        "translation": {
          "uk": "Старе місто гарне",
          "ru": "Старый город красивый",
          "en": "The old town is beautiful"
        },
        "accepted": [
          "Stare miasto jest piękne"
        ]
      },
      "explanation": null
    },
    "to": {
      "type": "DICTATION",
      "skill": "writing.adj",
      "data": {
        "audioText": "To muzeum jest piękne",
        "translation": {
          "uk": "Цей музей гарний",
          "ru": "Этот музей красивый",
          "en": "This museum is beautiful"
        },
        "accepted": [
          "To muzeum jest piękne"
        ]
      },
      "explanation": null
    }
  },
  {
    "lesson": "krk-r5-misja",
    "order": 16,
    "from": {
      "type": "ODD_ONE_OUT",
      "skill": "vocab.directions",
      "data": {
        "options": [
          {
            "id": "w0",
            "text": "obok"
          },
          {
            "id": "w1",
            "text": "przed"
          },
          {
            "id": "w2",
            "text": "za"
          },
          {
            "id": "w3",
            "text": "pieszo"
          }
        ],
        "answer": "w3"
      },
      "explanation": {
        "uk": "Три слова кажуть, де щось стоїть, а **pieszo** — «пішки».",
        "ru": "Три слова говорят, где что-то стоит, а **pieszo** — «пешком».",
        "en": "Three words say where something is; **pieszo** means \"on foot\"."
      }
    },
    "to": {
      "type": "ODD_ONE_OUT",
      "skill": "vocab.directions",
      "data": {
        "question": {
          "uk": "Яке слово означає спосіб пересування, а не розташування?",
          "ru": "Какое слово обозначает способ передвижения, а не расположение?",
          "en": "Which word describes how you travel rather than a position?"
        },
        "options": [
          {
            "id": "w0",
            "text": "obok"
          },
          {
            "id": "w1",
            "text": "przed"
          },
          {
            "id": "w2",
            "text": "za"
          },
          {
            "id": "w3",
            "text": "pieszo"
          }
        ],
        "answer": "w3"
      },
      "explanation": {
        "uk": "Три слова кажуть, де щось стоїть, а **pieszo** — «пішки».",
        "ru": "Три слова говорят, где что-то стоит, а **pieszo** — «пешком».",
        "en": "Three words say where something is; **pieszo** means \"on foot\"."
      }
    }
  },
  {
    "lesson": "krk-re1-dania",
    "order": 10,
    "from": {
      "type": "ODD_ONE_OUT",
      "skill": "vocab.dishes",
      "data": {
        "options": [
          {
            "id": "w0",
            "text": "żurek"
          },
          {
            "id": "w1",
            "text": "rosół"
          },
          {
            "id": "w2",
            "text": "zupa pomidorowa"
          },
          {
            "id": "w3",
            "text": "sernik"
          }
        ],
        "answer": "w3"
      },
      "explanation": {
        "uk": "Три — супи, а **sernik** — десерт.",
        "ru": "Три — супы, а **sernik** — десерт.",
        "en": "Three are soups; **sernik** is a dessert."
      }
    },
    "to": {
      "type": "ODD_ONE_OUT",
      "skill": "vocab.dishes",
      "data": {
        "question": {
          "uk": "Що НЕ є супом?",
          "ru": "Что НЕ является супом?",
          "en": "Which is NOT a soup?"
        },
        "options": [
          {
            "id": "w0",
            "text": "żurek"
          },
          {
            "id": "w1",
            "text": "rosół"
          },
          {
            "id": "w2",
            "text": "zupa pomidorowa"
          },
          {
            "id": "w3",
            "text": "sernik"
          }
        ],
        "answer": "w3"
      },
      "explanation": {
        "uk": "Три — супи, а **sernik** — десерт.",
        "ru": "Три — супы, а **sernik** — десерт.",
        "en": "Three are soups; **sernik** is a dessert."
      }
    }
  },
  {
    "lesson": "krk-re4-rachunek",
    "order": 16,
    "from": {
      "type": "ODD_ONE_OUT",
      "skill": "vocab.bill",
      "data": {
        "options": [
          {
            "id": "w0",
            "text": "rachunek"
          },
          {
            "id": "w1",
            "text": "napiwek"
          },
          {
            "id": "w2",
            "text": "reszta"
          },
          {
            "id": "w3",
            "text": "stolik"
          }
        ],
        "answer": "w3"
      },
      "explanation": {
        "uk": "Три — про гроші, а **stolik** — столик.",
        "ru": "Три — о деньгах, а **stolik** — столик.",
        "en": "Three are about money; **stolik** is a table."
      }
    },
    "to": {
      "type": "ODD_ONE_OUT",
      "skill": "vocab.bill",
      "data": {
        "question": {
          "uk": "Яке слово означає предмет меблів?",
          "ru": "Какое слово обозначает предмет мебели?",
          "en": "Which word names a piece of furniture?"
        },
        "options": [
          {
            "id": "w0",
            "text": "rachunek"
          },
          {
            "id": "w1",
            "text": "napiwek"
          },
          {
            "id": "w2",
            "text": "reszta"
          },
          {
            "id": "w3",
            "text": "stolik"
          }
        ],
        "answer": "w3"
      },
      "explanation": {
        "uk": "Три — про гроші, а **stolik** — столик.",
        "ru": "Три — о деньгах, а **stolik** — столик.",
        "en": "Three are about money; **stolik** is a table."
      }
    }
  },
  {
    "lesson": "krk-re5-misja",
    "order": 16,
    "from": {
      "type": "ODD_ONE_OUT",
      "skill": "vocab.dishes",
      "data": {
        "options": [
          {
            "id": "w0",
            "text": "żurek"
          },
          {
            "id": "w1",
            "text": "rosół"
          },
          {
            "id": "w2",
            "text": "gołąbki"
          },
          {
            "id": "w3",
            "text": "napiwek"
          }
        ],
        "answer": "w3"
      },
      "explanation": {
        "uk": "Три — страви, а **napiwek** — чайові.",
        "ru": "Три — блюда, а **napiwek** — чаевые.",
        "en": "Three are dishes; **napiwek** is a tip."
      }
    },
    "to": {
      "type": "ODD_ONE_OUT",
      "skill": "vocab.dishes",
      "data": {
        "question": {
          "uk": "Що НЕ є стравою?",
          "ru": "Что НЕ является блюдом?",
          "en": "Which is NOT a dish?"
        },
        "options": [
          {
            "id": "w0",
            "text": "żurek"
          },
          {
            "id": "w1",
            "text": "rosół"
          },
          {
            "id": "w2",
            "text": "gołąbki"
          },
          {
            "id": "w3",
            "text": "napiwek"
          }
        ],
        "answer": "w3"
      },
      "explanation": {
        "uk": "Три — страви, а **napiwek** — чайові.",
        "ru": "Три — блюда, а **napiwek** — чаевые.",
        "en": "Three are dishes; **napiwek** is a tip."
      }
    }
  },
  {
    "lesson": "krk-t3-jazda",
    "order": 11,
    "from": {
      "type": "ODD_ONE_OUT",
      "skill": "vocab.ride",
      "data": {
        "options": [
          {
            "id": "w0",
            "text": "wsiadać"
          },
          {
            "id": "w1",
            "text": "wysiadać"
          },
          {
            "id": "w2",
            "text": "przesiąść się"
          },
          {
            "id": "w3",
            "text": "gotować"
          }
        ],
        "answer": "w3"
      },
      "explanation": {
        "uk": "Три — про поїздку, а **gotować** — готувати їжу.",
        "ru": "Три — о поездке, а **gotować** — готовить еду.",
        "en": "Three are about riding; **gotować** means to cook."
      }
    },
    "to": {
      "type": "ODD_ONE_OUT",
      "skill": "vocab.ride",
      "data": {
        "question": {
          "uk": "Яке дієслово означає приготування їжі?",
          "ru": "Какой глагол обозначает приготовление еды?",
          "en": "Which verb refers to cooking?"
        },
        "options": [
          {
            "id": "w0",
            "text": "wsiadać"
          },
          {
            "id": "w1",
            "text": "wysiadać"
          },
          {
            "id": "w2",
            "text": "przesiąść się"
          },
          {
            "id": "w3",
            "text": "gotować"
          }
        ],
        "answer": "w3"
      },
      "explanation": {
        "uk": "Три — про поїздку, а **gotować** — готувати їжу.",
        "ru": "Три — о поездке, а **gotować** — готовить еду.",
        "en": "Three are about riding; **gotować** means to cook."
      }
    }
  },
  {
    "lesson": "krk-t5-misja",
    "order": 20,
    "from": {
      "type": "ODD_ONE_OUT",
      "skill": "vocab.tram",
      "data": {
        "options": [
          {
            "id": "w0",
            "text": "tramwaj"
          },
          {
            "id": "w1",
            "text": "autobus"
          },
          {
            "id": "w2",
            "text": "biletomat"
          },
          {
            "id": "w3",
            "text": "pociąg"
          }
        ],
        "answer": "w2"
      },
      "explanation": {
        "uk": "Три — транспорт, а **biletomat** — автомат для квитків.",
        "ru": "Три — транспорт, а **biletomat** — автомат для билетов.",
        "en": "Three are vehicles; **biletomat** is a ticket machine."
      }
    },
    "to": {
      "type": "ODD_ONE_OUT",
      "skill": "vocab.tram",
      "data": {
        "question": {
          "uk": "Що є автоматом для квитків, а не транспортом?",
          "ru": "Что является автоматом для билетов, а не транспортом?",
          "en": "Which is a ticket machine rather than a vehicle?"
        },
        "options": [
          {
            "id": "w0",
            "text": "tramwaj"
          },
          {
            "id": "w1",
            "text": "autobus"
          },
          {
            "id": "w2",
            "text": "biletomat"
          },
          {
            "id": "w3",
            "text": "pociąg"
          }
        ],
        "answer": "w2"
      },
      "explanation": {
        "uk": "Три — транспорт, а **biletomat** — автомат для квитків.",
        "ru": "Три — транспорт, а **biletomat** — автомат для билетов.",
        "en": "Three are vehicles; **biletomat** is a ticket machine."
      }
    }
  },
  {
    "lesson": "krk-h3-problemy",
    "order": 5,
    "from": {
      "type": "ODD_ONE_OUT",
      "skill": "vocab.problems",
      "data": {
        "options": [
          {
            "id": "w0",
            "text": "głośny"
          },
          {
            "id": "w1",
            "text": "brudny"
          },
          {
            "id": "w2",
            "text": "zimny"
          },
          {
            "id": "w3",
            "text": "czysty"
          }
        ],
        "answer": "w3"
      },
      "explanation": {
        "uk": "Три — скарги, а **czysty** (чистий) — це добре!",
        "ru": "Три — жалобы, а **czysty** (чистый) — это хорошо!",
        "en": "Three are complaints; **czysty** (clean) is good!"
      }
    },
    "to": {
      "type": "ODD_ONE_OUT",
      "skill": "vocab.problems",
      "data": {
        "question": {
          "uk": "Яке слово означає «чистий»?",
          "ru": "Какое слово означает «чистый»?",
          "en": "Which word means clean?"
        },
        "options": [
          {
            "id": "w0",
            "text": "głośny"
          },
          {
            "id": "w1",
            "text": "brudny"
          },
          {
            "id": "w2",
            "text": "zimny"
          },
          {
            "id": "w3",
            "text": "czysty"
          }
        ],
        "answer": "w3"
      },
      "explanation": {
        "uk": "Три — скарги, а **czysty** (чистий) — це добре!",
        "ru": "Три — жалобы, а **czysty** (чистый) — это хорошо!",
        "en": "Three are complaints; **czysty** (clean) is good!"
      }
    }
  },
  {
    "lesson": "krk-h5-misja",
    "order": 20,
    "from": {
      "type": "ODD_ONE_OUT",
      "skill": "vocab.hotel",
      "data": {
        "options": [
          {
            "id": "w0",
            "text": "recepcja"
          },
          {
            "id": "w1",
            "text": "winda"
          },
          {
            "id": "w2",
            "text": "ręcznik"
          },
          {
            "id": "w3",
            "text": "kasownik"
          }
        ],
        "answer": "w3"
      },
      "explanation": {
        "uk": "Три — з готелю, а **kasownik** — компостер у трамваї.",
        "ru": "Три — из отеля, а **kasownik** — компостер в трамвае.",
        "en": "Three belong to a hotel; **kasownik** is a tram validator."
      }
    },
    "to": {
      "type": "ODD_ONE_OUT",
      "skill": "vocab.hotel",
      "data": {
        "question": {
          "uk": "Що означає компостер для транспортного квитка?",
          "ru": "Что означает компостер для транспортного билета?",
          "en": "Which word means a transport ticket validator?"
        },
        "options": [
          {
            "id": "w0",
            "text": "recepcja"
          },
          {
            "id": "w1",
            "text": "winda"
          },
          {
            "id": "w2",
            "text": "ręcznik"
          },
          {
            "id": "w3",
            "text": "kasownik"
          }
        ],
        "answer": "w3"
      },
      "explanation": {
        "uk": "Три — з готелю, а **kasownik** — компостер у трамваї.",
        "ru": "Три — из отеля, а **kasownik** — компостер в трамвае.",
        "en": "Three belong to a hotel; **kasownik** is a tram validator."
      }
    }
  },
  {
    "lesson": "krk-u5-misja",
    "order": 20,
    "from": {
      "type": "ODD_ONE_OUT",
      "skill": "vocab.campus",
      "data": {
        "options": [
          {
            "id": "w0",
            "text": "wykład"
          },
          {
            "id": "w1",
            "text": "ćwiczenia"
          },
          {
            "id": "w2",
            "text": "przerwa"
          },
          {
            "id": "w3",
            "text": "napiwek"
          }
        ],
        "answer": "w3"
      },
      "explanation": {
        "uk": "Три — про навчання, а **napiwek** — чайові.",
        "ru": "Три — про учёбу, а **napiwek** — чаевые.",
        "en": "Three are about studying; **napiwek** is a tip."
      }
    },
    "to": {
      "type": "ODD_ONE_OUT",
      "skill": "vocab.campus",
      "data": {
        "question": {
          "uk": "Що означає чайові, які залишають офіціанту?",
          "ru": "Что означает чаевые, которые оставляют официанту?",
          "en": "Which word means a tip left for a waiter?"
        },
        "options": [
          {
            "id": "w0",
            "text": "wykład"
          },
          {
            "id": "w1",
            "text": "ćwiczenia"
          },
          {
            "id": "w2",
            "text": "przerwa"
          },
          {
            "id": "w3",
            "text": "napiwek"
          }
        ],
        "answer": "w3"
      },
      "explanation": {
        "uk": "Три — про навчання, а **napiwek** — чайові.",
        "ru": "Три — про учёбу, а **napiwek** — чаевые.",
        "en": "Three are about studying; **napiwek** is a tip."
      }
    }
  },
  {
    "lesson": "krk-3-dom",
    "order": 7,
    "from": {
      "type": "ODD_ONE_OUT",
      "skill": "vocab.home",
      "data": {
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
    }
  },
  {
    "lesson": "krk-4-tydzien",
    "order": 7,
    "from": {
      "type": "ODD_ONE_OUT",
      "skill": "vocab.days",
      "data": {
        "options": [
          {
            "id": "w0",
            "text": "wtorek"
          },
          {
            "id": "w1",
            "text": "piątek"
          },
          {
            "id": "w2",
            "text": "jutro"
          },
          {
            "id": "w3",
            "text": "sobota"
          }
        ],
        "answer": "w2"
      },
      "explanation": {
        "uk": "**jutro** — завтра, а не день тижня.",
        "ru": "**jutro** — завтра, а не день недели.",
        "en": "**jutro** means tomorrow, not a day of the week."
      }
    },
    "to": {
      "type": "ODD_ONE_OUT",
      "skill": "vocab.days",
      "data": {
        "question": {
          "uk": "Яке слово НЕ є назвою дня тижня?",
          "ru": "Какое слово НЕ является названием дня недели?",
          "en": "Which word is NOT the name of a day of the week?"
        },
        "options": [
          {
            "id": "w0",
            "text": "wtorek"
          },
          {
            "id": "w1",
            "text": "piątek"
          },
          {
            "id": "w2",
            "text": "jutro"
          },
          {
            "id": "w3",
            "text": "sobota"
          }
        ],
        "answer": "w2"
      },
      "explanation": {
        "uk": "**jutro** — завтра, а не день тижня.",
        "ru": "**jutro** — завтра, а не день недели.",
        "en": "**jutro** means tomorrow, not a day of the week."
      }
    }
  },
  {
    "lesson": "kat-2-isc-jechac",
    "order": 8,
    "from": {
      "type": "FIND_ERROR",
      "skill": "grammar.motion",
      "data": {
        "pl": "W poniedziałki idę na basen",
        "translation": {
          "uk": "По понеділках ходжу в басейн.",
          "ru": "По понедельникам хожу в бассейн.",
          "en": "On Mondays I go to the pool."
        },
        "options": [
          {
            "id": "w0",
            "text": "W"
          },
          {
            "id": "w1",
            "text": "poniedziałki"
          },
          {
            "id": "w2",
            "text": "idę"
          },
          {
            "id": "w3",
            "text": "na"
          },
          {
            "id": "w4",
            "text": "basen"
          }
        ],
        "answer": "w2"
      },
      "explanation": {
        "uk": "Регулярно (w poniedziałki) → **chodzę**.",
        "ru": "Регулярно (w poniedziałki) → **chodzę**.",
        "en": "Regularly → **chodzę**."
      }
    },
    "to": {
      "type": "FIND_ERROR",
      "skill": "grammar.motion",
      "data": {
        "pl": "W poniedziałki ja chodzi na basen",
        "translation": {
          "uk": "По понеділках ходжу в басейн.",
          "ru": "По понедельникам хожу в бассейн.",
          "en": "On Mondays I go to the pool."
        },
        "options": [
          {
            "id": "w0",
            "text": "W"
          },
          {
            "id": "w1",
            "text": "poniedziałki"
          },
          {
            "id": "w2",
            "text": "ja"
          },
          {
            "id": "w3",
            "text": "chodzi"
          },
          {
            "id": "w4",
            "text": "na"
          },
          {
            "id": "w5",
            "text": "basen"
          }
        ],
        "answer": "w3"
      },
      "explanation": {
        "uk": "Із **ja** потрібна форма **chodzę**, а не chodzi.",
        "ru": "С **ja** нужна форма **chodzę**, а не chodzi.",
        "en": "With **ja**, use **chodzę**, not chodzi."
      }
    }
  },
  {
    "lesson": "kat-3-wiedziec-znac",
    "order": 8,
    "from": {
      "type": "ODD_ONE_OUT",
      "skill": "grammar.wiedziec",
      "data": {
        "options": [
          {
            "id": "w0",
            "text": "Znam Ewę"
          },
          {
            "id": "w1",
            "text": "Znam ten film"
          },
          {
            "id": "w2",
            "text": "Znam, gdzie mieszkasz"
          },
          {
            "id": "w3",
            "text": "Znam Gdańsk"
          }
        ],
        "answer": "w2"
      },
      "explanation": {
        "uk": "Перед **gdzie** потрібне **wiem**: Wiem, gdzie mieszkasz.",
        "ru": "Перед **gdzie** нужно **wiem**: Wiem, gdzie mieszkasz.",
        "en": "Before **gdzie** use **wiem**."
      }
    },
    "to": {
      "type": "ODD_ONE_OUT",
      "skill": "grammar.wiedziec",
      "data": {
        "question": {
          "uk": "У якому реченні неправильно вжито znać замість wiedzieć?",
          "ru": "В каком предложении ошибочно употреблено znać вместо wiedzieć?",
          "en": "Which sentence incorrectly uses znać instead of wiedzieć?"
        },
        "options": [
          {
            "id": "w0",
            "text": "Znam Ewę"
          },
          {
            "id": "w1",
            "text": "Znam ten film"
          },
          {
            "id": "w2",
            "text": "Znam, gdzie mieszkasz"
          },
          {
            "id": "w3",
            "text": "Znam Gdańsk"
          }
        ],
        "answer": "w2"
      },
      "explanation": {
        "uk": "Перед **gdzie** потрібне **wiem**: Wiem, gdzie mieszkasz.",
        "ru": "Перед **gdzie** нужно **wiem**: Wiem, gdzie mieszkasz.",
        "en": "Before **gdzie** use **wiem**."
      }
    }
  },
  {
    "lesson": "kat-4-te-ta",
    "order": 7,
    "from": {
      "type": "FIND_ERROR",
      "skill": "grammar.te-ta",
      "data": {
        "pl": "Kupuję tą nową torbę",
        "translation": {
          "uk": "Я купую цю нову сумку.",
          "ru": "Я покупаю эту новую сумку.",
          "en": "I'm buying this new bag."
        },
        "options": [
          {
            "id": "w0",
            "text": "Kupuję"
          },
          {
            "id": "w1",
            "text": "tą"
          },
          {
            "id": "w2",
            "text": "nową"
          },
          {
            "id": "w3",
            "text": "torbę"
          }
        ],
        "answer": "w1"
      },
      "explanation": {
        "uk": "Знахідний: **tę** nową torbę. Прикметник має -ą, а займенник — **tę**.",
        "ru": "Винительный: **tę** nową torbę. Прилагательное с -ą, а местоимение — **tę**.",
        "en": "Accusative: **tę** nową torbę."
      }
    },
    "to": {
      "type": "FIND_ERROR",
      "skill": "grammar.te-ta",
      "data": {
        "pl": "Kupuję tą nową torbę",
        "translation": {
          "uk": "Я купую цю нову сумку.",
          "ru": "Я покупаю эту новую сумку.",
          "en": "I'm buying this new bag."
        },
        "options": [
          {
            "id": "w0",
            "text": "Kupuję"
          },
          {
            "id": "w1",
            "text": "tą"
          },
          {
            "id": "w2",
            "text": "nową"
          },
          {
            "id": "w3",
            "text": "torbę"
          }
        ],
        "answer": "w1",
        "question": {
          "uk": "Знайди відхилення від стандартної письмової норми.",
          "ru": "Найди отклонение от стандартной письменной нормы.",
          "en": "Find the form that does not follow standard written Polish."
        }
      },
      "explanation": {
        "uk": "Знахідний: **tę** nową torbę. Прикметник має -ą, а займенник — **tę**.",
        "ru": "В стандартной письменной речи: **tę** nową torbę. В разговорной речи встречается tą; здесь проверяется письменная норма.",
        "en": "Accusative: **tę** nową torbę."
      }
    }
  },
  {
    "lesson": "kat-boss",
    "order": 6,
    "from": {
      "type": "FIND_ERROR",
      "skill": "grammar.boss",
      "data": {
        "pl": "Teraz chodzę do sklepu",
        "translation": {
          "uk": "Зараз іду в магазин.",
          "ru": "Сейчас иду в магазин.",
          "en": "I'm going to the shop now."
        },
        "options": [
          {
            "id": "w0",
            "text": "Teraz"
          },
          {
            "id": "w1",
            "text": "chodzę"
          },
          {
            "id": "w2",
            "text": "do"
          },
          {
            "id": "w3",
            "text": "sklepu"
          }
        ],
        "answer": "w1"
      },
      "explanation": {
        "uk": "Зараз → **idę**.",
        "ru": "Сейчас → **idę**.",
        "en": "Now → **idę**."
      }
    },
    "to": {
      "type": "FIND_ERROR",
      "skill": "grammar.boss",
      "data": {
        "pl": "Teraz ja idzie do sklepu",
        "translation": {
          "uk": "Зараз іду в магазин.",
          "ru": "Сейчас иду в магазин.",
          "en": "I'm going to the shop now."
        },
        "options": [
          {
            "id": "w0",
            "text": "Teraz"
          },
          {
            "id": "w1",
            "text": "ja"
          },
          {
            "id": "w2",
            "text": "idzie"
          },
          {
            "id": "w3",
            "text": "do"
          },
          {
            "id": "w4",
            "text": "sklepu"
          }
        ],
        "answer": "w2"
      },
      "explanation": {
        "uk": "Із **ja** потрібна форма **idę**, а не idzie.",
        "ru": "С **ja** нужна форма **idę**, а не idzie.",
        "en": "With **ja**, use **idę**, not idzie."
      }
    }
  },
  {
    "lesson": "opo-1-siema",
    "order": 6,
    "from": {
      "type": "ODD_ONE_OUT",
      "skill": "register.slang",
      "data": {
        "options": [
          {
            "id": "w0",
            "text": "Siema!"
          },
          {
            "id": "w1",
            "text": "Elo!"
          },
          {
            "id": "w2",
            "text": "Dzień dobry!"
          },
          {
            "id": "w3",
            "text": "Co tam?"
          }
        ],
        "answer": "w2"
      },
      "explanation": {
        "uk": "**Dzień dobry** — нейтральне/офіційне; решта — розмовні.",
        "ru": "**Dzień dobry** — нейтральное/официальное; остальные — разговорные.",
        "en": "**Dzień dobry** is neutral/formal."
      }
    },
    "to": {
      "type": "ODD_ONE_OUT",
      "skill": "register.slang",
      "data": {
        "question": {
          "uk": "Яке привітання доречне в офіційній розмові?",
          "ru": "Какое приветствие уместно в официальном разговоре?",
          "en": "Which greeting is suitable in a formal conversation?"
        },
        "options": [
          {
            "id": "w0",
            "text": "Siema!"
          },
          {
            "id": "w1",
            "text": "Elo!"
          },
          {
            "id": "w2",
            "text": "Dzień dobry!"
          },
          {
            "id": "w3",
            "text": "Co tam?"
          }
        ],
        "answer": "w2"
      },
      "explanation": {
        "uk": "**Dzień dobry** — нейтральне/офіційне; решта — розмовні.",
        "ru": "**Dzień dobry** — нейтральное/официальное; остальные — разговорные.",
        "en": "**Dzień dobry** is neutral/formal."
      }
    }
  },
  {
    "lesson": "opo-3-ogarniac",
    "order": 6,
    "from": {
      "type": "ODD_ONE_OUT",
      "skill": "register.slang",
      "data": {
        "options": [
          {
            "id": "w0",
            "text": "Wyluzuj"
          },
          {
            "id": "w1",
            "text": "Nie spinaj się"
          },
          {
            "id": "w2",
            "text": "Proszę się nie denerwować"
          },
          {
            "id": "w3",
            "text": "Ogarnij się"
          }
        ],
        "answer": "w2"
      },
      "explanation": {
        "uk": "**Proszę się nie denerwować** — ввічливо-офіційне; решта — розмовні.",
        "ru": "**Proszę się nie denerwować** — вежливо-официальное; остальные — разговорные.",
        "en": "Only **Proszę się nie denerwować** is formal."
      }
    },
    "to": {
      "type": "ODD_ONE_OUT",
      "skill": "register.slang",
      "data": {
        "question": {
          "uk": "Який вираз звернений до людини ввічливо на Ви?",
          "ru": "Какое выражение обращено к человеку вежливо на Вы?",
          "en": "Which expression addresses someone formally?"
        },
        "options": [
          {
            "id": "w0",
            "text": "Wyluzuj"
          },
          {
            "id": "w1",
            "text": "Nie spinaj się"
          },
          {
            "id": "w2",
            "text": "Proszę się nie denerwować"
          },
          {
            "id": "w3",
            "text": "Ogarnij się"
          }
        ],
        "answer": "w2"
      },
      "explanation": {
        "uk": "**Proszę się nie denerwować** — ввічливо-офіційне; решта — розмовні.",
        "ru": "**Proszę się nie denerwować** — вежливо-официальное; остальные — разговорные.",
        "en": "Only **Proszę się nie denerwować** is formal."
      }
    }
  },
  {
    "lesson": "wro-2-zabka",
    "order": 5,
    "from": {
      "type": "FILL_GAP",
      "skill": "grammar.instrumental",
      "data": {
        "pl": "Płacę ___.",
        "translation": {
          "uk": "Я плачу карткою.",
          "ru": "Я плачу картой.",
          "en": "I pay by card."
        },
        "options": [
          {
            "id": "o0",
            "text": "kartą"
          },
          {
            "id": "o1",
            "text": "karta"
          },
          {
            "id": "o2",
            "text": "kartę"
          }
        ],
        "answer": "o0"
      },
      "explanation": {
        "uk": "Чим платиш? Орудний відмінок: karta → **kartą**.",
        "ru": "Чем платишь? Творительный падеж: karta → **kartą**.",
        "en": "Paying with what? Instrumental: karta → **kartą**."
      }
    },
    "to": {
      "type": "FILL_GAP",
      "skill": "grammar.instrumental",
      "data": {
        "pl": "Za zakupy płacę ___.",
        "translation": {
          "uk": "За покупки я плачу готівкою.",
          "ru": "За покупки я плачу наличными.",
          "en": "I pay for the shopping in cash."
        },
        "options": [
          {
            "id": "o0",
            "text": "gotówką"
          },
          {
            "id": "o1",
            "text": "gotówka"
          },
          {
            "id": "o2",
            "text": "gotówkę"
          }
        ],
        "answer": "o0"
      },
      "explanation": {
        "uk": "Чим платиш? Орудний відмінок: gotówka → **gotówką**.",
        "ru": "Чем платишь? Творительный падеж: gotówka → **gotówką**.",
        "en": "Paying with what? Instrumental: gotówka → **gotówką**."
      }
    }
  },
  {
    "lesson": "wro-boss",
    "order": 6,
    "from": {
      "type": "ODD_ONE_OUT",
      "skill": "vocab.cafe",
      "data": {
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
    }
  },
  {
    "lesson": "waw-6-wiek",
    "order": 12,
    "from": {
      "type": "FILL_GAP",
      "skill": "grammar.age",
      "data": {
        "pl": "Syn ma rok, a córka pięć ___.",
        "translation": {
          "uk": "Синові рік, а доньці п'ять років.",
          "ru": "Сыну год, а дочке пять лет.",
          "en": "The son is one and the daughter is five."
        },
        "options": [
          {
            "id": "o0",
            "text": "lat"
          },
          {
            "id": "o1",
            "text": "lata"
          },
          {
            "id": "o2",
            "text": "roku"
          }
        ],
        "answer": "o0"
      },
      "explanation": {
        "uk": "Від 5 → **lat**: pięć lat.",
        "ru": "От 5 → **lat**: pięć lat.",
        "en": "5+ → **lat**: pięć lat."
      }
    },
    "to": {
      "type": "FILL_GAP",
      "skill": "grammar.age",
      "data": {
        "pl": "Syn ma rok, a córka pięć ___.",
        "translation": {
          "uk": "Синові рік, а доньці п'ять років.",
          "ru": "Сыну год, а дочке пять лет.",
          "en": "The son is one and the daughter is five."
        },
        "options": [
          {
            "id": "o0",
            "text": "lat"
          },
          {
            "id": "o1",
            "text": "lata"
          },
          {
            "id": "o2",
            "text": "roku"
          }
        ],
        "answer": "o0"
      },
      "explanation": {
        "uk": "Для 5–21 → **lat**: pięć lat.",
        "ru": "Для 5–21 → **lat**: pięć lat.",
        "en": "5–21 → **lat**: pięć lat."
      }
    }
  },
  {
    "lesson": "waw-k3-zakupy",
    "order": 5,
    "from": {
      "type": "FILL_GAP",
      "skill": "grammar.prices",
      "data": {
        "pl": "Chleb kosztuje sześć ___.",
        "translation": {
          "uk": "Хліб коштує шість злотих.",
          "ru": "Хлеб стоит шесть злотых.",
          "en": "Bread costs six złoty."
        },
        "options": [
          {
            "id": "o0",
            "text": "złotych"
          },
          {
            "id": "o1",
            "text": "złote"
          },
          {
            "id": "o2",
            "text": "złoty"
          }
        ],
        "answer": "o0"
      },
      "explanation": {
        "uk": "Від 5 → **złotych**.",
        "ru": "От 5 → **złotych**.",
        "en": "5+ → **złotych**."
      }
    },
    "to": {
      "type": "FILL_GAP",
      "skill": "grammar.prices",
      "data": {
        "pl": "Chleb kosztuje sześć ___.",
        "translation": {
          "uk": "Хліб коштує шість злотих.",
          "ru": "Хлеб стоит шесть злотых.",
          "en": "Bread costs six złoty."
        },
        "options": [
          {
            "id": "o0",
            "text": "złotych"
          },
          {
            "id": "o1",
            "text": "złote"
          },
          {
            "id": "o2",
            "text": "złoty"
          }
        ],
        "answer": "o0"
      },
      "explanation": {
        "uk": "Для 5–21 → **złotych**.",
        "ru": "Для 5–21 → **złotych**.",
        "en": "5–21 → **złotych**."
      }
    }
  },
  {
    "lesson": "waw-k3-zakupy",
    "order": 12,
    "from": {
      "type": "FIND_ERROR",
      "skill": "grammar.prices",
      "data": {
        "pl": "To kosztuje pięć złote",
        "translation": {
          "uk": "Це коштує п'ять злотих.",
          "ru": "Это стоит пять злотых.",
          "en": "It costs five złoty."
        },
        "options": [
          {
            "id": "w0",
            "text": "To"
          },
          {
            "id": "w1",
            "text": "kosztuje"
          },
          {
            "id": "w2",
            "text": "pięć"
          },
          {
            "id": "w3",
            "text": "złote"
          }
        ],
        "answer": "w3"
      },
      "explanation": {
        "uk": "Від 5 → **złotych**.",
        "ru": "От 5 → **złotych**.",
        "en": "5+ → **złotych**."
      }
    },
    "to": {
      "type": "FIND_ERROR",
      "skill": "grammar.prices",
      "data": {
        "pl": "To kosztuje pięć złote",
        "translation": {
          "uk": "Це коштує п'ять злотих.",
          "ru": "Это стоит пять злотых.",
          "en": "It costs five złoty."
        },
        "options": [
          {
            "id": "w0",
            "text": "To"
          },
          {
            "id": "w1",
            "text": "kosztuje"
          },
          {
            "id": "w2",
            "text": "pięć"
          },
          {
            "id": "w3",
            "text": "złote"
          }
        ],
        "answer": "w3"
      },
      "explanation": {
        "uk": "Для 5–21 → **złotych**.",
        "ru": "Для 5–21 → **złotych**.",
        "en": "5–21 → **złotych**."
      }
    }
  },
  {
    "lesson": "waw-s3-mapa",
    "order": 6,
    "from": {
      "type": "FILL_GAP",
      "skill": "grammar.numbers",
      "data": {
        "pl": "Do Rynku jest pięć ___ pieszo.",
        "translation": {
          "uk": "До Ринку п'ять хвилин пішки.",
          "ru": "До Рынка пять минут пешком.",
          "en": "It's five minutes on foot to the Market Square."
        },
        "options": [
          {
            "id": "o0",
            "text": "minut"
          },
          {
            "id": "o1",
            "text": "minuty"
          },
          {
            "id": "o2",
            "text": "minuta"
          }
        ],
        "answer": "o0"
      },
      "explanation": {
        "uk": "Від 5 → **minut**.",
        "ru": "От 5 → **minut**.",
        "en": "5+ → **minut**."
      }
    },
    "to": {
      "type": "FILL_GAP",
      "skill": "grammar.numbers",
      "data": {
        "pl": "Do Rynku jest pięć ___ pieszo.",
        "translation": {
          "uk": "До Ринку п'ять хвилин пішки.",
          "ru": "До Рынка пять минут пешком.",
          "en": "It's five minutes on foot to the Market Square."
        },
        "options": [
          {
            "id": "o0",
            "text": "minut"
          },
          {
            "id": "o1",
            "text": "minuty"
          },
          {
            "id": "o2",
            "text": "minuta"
          }
        ],
        "answer": "o0"
      },
      "explanation": {
        "uk": "Для 5–21 → **minut**.",
        "ru": "Для 5–21 → **minut**.",
        "en": "5–21 → **minut**."
      }
    }
  },
  {
    "lesson": "waw-f2-piekarnia",
    "order": 5,
    "from": {
      "type": "FILL_GAP",
      "skill": "grammar.plural",
      "data": {
        "pl": "Poproszę sześć ___.",
        "translation": {
          "uk": "Шість булок, будь ласка.",
          "ru": "Шесть булок, пожалуйста.",
          "en": "Six rolls, please."
        },
        "options": [
          {
            "id": "o0",
            "text": "bułek"
          },
          {
            "id": "o1",
            "text": "bułki"
          },
          {
            "id": "o2",
            "text": "bułka"
          }
        ],
        "answer": "o0"
      },
      "explanation": {
        "uk": "Від 5 → родовий множини: **bułek**.",
        "ru": "От 5 → родительный множественного: **bułek**.",
        "en": "5+ → genitive plural: **bułek**."
      }
    },
    "to": {
      "type": "FILL_GAP",
      "skill": "grammar.plural",
      "data": {
        "pl": "Poproszę sześć ___.",
        "translation": {
          "uk": "Шість булок, будь ласка.",
          "ru": "Шесть булок, пожалуйста.",
          "en": "Six rolls, please."
        },
        "options": [
          {
            "id": "o0",
            "text": "bułek"
          },
          {
            "id": "o1",
            "text": "bułki"
          },
          {
            "id": "o2",
            "text": "bułka"
          }
        ],
        "answer": "o0"
      },
      "explanation": {
        "uk": "Для 5–21 → родовий множини: **bułek**.",
        "ru": "Для 5–21 → родительный множественного: **bułek**.",
        "en": "5–21 → genitive plural: **bułek**."
      }
    }
  },
  {
    "lesson": "waw-f2-piekarnia",
    "order": 6,
    "from": {
      "type": "FILL_GAP",
      "skill": "grammar.plural",
      "data": {
        "pl": "Na tłusty czwartek kupuję dziesięć ___.",
        "translation": {
          "uk": "На Жирний четвер я купую десять пончиків.",
          "ru": "На Жирный четверг я покупаю десять пончиков.",
          "en": "On Fat Thursday I buy ten doughnuts."
        },
        "options": [
          {
            "id": "o0",
            "text": "pączków"
          },
          {
            "id": "o1",
            "text": "pączki"
          },
          {
            "id": "o2",
            "text": "pączek"
          }
        ],
        "answer": "o0"
      },
      "explanation": {
        "uk": "Від 5 → **pączków**.",
        "ru": "От 5 → **pączków**.",
        "en": "5+ → **pączków**."
      }
    },
    "to": {
      "type": "FILL_GAP",
      "skill": "grammar.plural",
      "data": {
        "pl": "Na tłusty czwartek kupuję dziesięć ___.",
        "translation": {
          "uk": "На Жирний четвер я купую десять пончиків.",
          "ru": "На Жирный четверг я покупаю десять пончиков.",
          "en": "On Fat Thursday I buy ten doughnuts."
        },
        "options": [
          {
            "id": "o0",
            "text": "pączków"
          },
          {
            "id": "o1",
            "text": "pączki"
          },
          {
            "id": "o2",
            "text": "pączek"
          }
        ],
        "answer": "o0"
      },
      "explanation": {
        "uk": "Для 5–21 → **pączków**.",
        "ru": "Для 5–21 → **pączków**.",
        "en": "5–21 → **pączków**."
      }
    }
  },
  {
    "lesson": "waw-f2-piekarnia",
    "order": 9,
    "from": {
      "type": "SITUATION",
      "skill": "situation.bakery",
      "data": {
        "npc": {
          "name": "Pan Zbyszek",
          "emoji": "👨🏻‍🍳",
          "role": {
            "uk": "пекар",
            "ru": "пекарь",
            "en": "baker"
          }
        },
        "scene": {
          "uk": "Ранкова пекарня біля дому, пахне свіжим хлібом.",
          "ru": "Утренняя пекарня у дома, пахнет свежим хлебом.",
          "en": "A morning bakery near home, smelling of fresh bread."
        },
        "steps": [
          {
            "npc": "Dzień dobry! Pieczywo prosto z pieca. Co podać?",
            "npcTr": {
              "uk": "Добрий день! Хліб просто з печі. Що подати?",
              "ru": "Добрый день! Хлеб прямо из печи. Что подать?",
              "en": "Good morning! Bread straight from the oven. What can I get you?"
            },
            "options": [
              {
                "id": "s0o0",
                "text": "Dzień dobry, poproszę chleb i cztery bułki.",
                "tr": {
                  "uk": "Добрий день, хліб і чотири булки, будь ласка.",
                  "ru": "Добрый день, хлеб и четыре булки, пожалуйста.",
                  "en": "Good morning, a loaf and four rolls, please."
                }
              },
              {
                "id": "s0o1",
                "text": "Dzień dobry, poproszę cztery bułek.",
                "tr": {
                  "uk": "(помилка у формі)",
                  "ru": "(ошибка в форме)",
                  "en": "(wrong form)"
                }
              }
            ],
            "answer": "s0o0",
            "feedback": {
              "uk": "4 → **bułki**; bułek — від 5.",
              "ru": "4 → **bułki**; bułek — от 5.",
              "en": "4 → **bułki**; bułek is for 5+."
            }
          },
          {
            "npc": "Proszę. Może coś słodkiego? Mamy świeże drożdżówki.",
            "npcTr": {
              "uk": "Прошу. Може, щось солодке? Маємо свіжі дріжджові булочки.",
              "ru": "Пожалуйста. Может, что-то сладкое? Есть свежие булочки.",
              "en": "Here you are. Something sweet? We have fresh sweet buns."
            },
            "options": [
              {
                "id": "s1o0",
                "text": "Tak, jedną drożdżówkę z serem.",
                "tr": {
                  "uk": "Так, одну булочку з сиром.",
                  "ru": "Да, одну булочку с творогом.",
                  "en": "Yes, one cheese bun."
                }
              },
              {
                "id": "s1o1",
                "text": "Tak, jedną drożdżówkę z peronem.",
                "tr": {
                  "uk": "(безглуздо)",
                  "ru": "(бессмыслица)",
                  "en": "(nonsense)"
                }
              }
            ],
            "answer": "s1o0",
            "feedback": {
              "uk": "Дріжджова булочка буває **z serem** (з сиром), з ягодами чи з маком.",
              "ru": "Булочка бывает **z serem** (с творогом), с ягодами или с маком.",
              "en": "A sweet bun can be **z serem** (with cheese), with fruit or poppy seeds."
            }
          },
          {
            "npc": "Razem trzynaście złotych.",
            "npcTr": {
              "uk": "Разом тринадцять злотих.",
              "ru": "Вместе тринадцать злотых.",
              "en": "Thirteen złoty altogether."
            },
            "options": [
              {
                "id": "s2o0",
                "text": "Proszę, kartą.",
                "tr": {
                  "uk": "Прошу, карткою.",
                  "ru": "Вот, картой.",
                  "en": "Here, by card."
                }
              },
              {
                "id": "s2o1",
                "text": "Proszę, na wynos w lewo.",
                "tr": {
                  "uk": "(безглуздо)",
                  "ru": "(бессмыслица)",
                  "en": "(nonsense)"
                }
              }
            ],
            "answer": "s2o0",
            "feedback": {
              "uk": "Заплати: **kartą** або **gotówką**.",
              "ru": "Заплати: **kartą** или **gotówką**.",
              "en": "Pay: **kartą** or **gotówką**."
            }
          },
          {
            "npc": "Dziękuję, smacznego!",
            "npcTr": {
              "uk": "Дякую, смачного!",
              "ru": "Спасибо, приятного аппетита!",
              "en": "Thank you, enjoy!"
            }
          }
        ]
      },
      "explanation": null
    },
    "to": {
      "type": "SITUATION",
      "skill": "situation.bakery",
      "data": {
        "npc": {
          "name": "Pan Zbyszek",
          "emoji": "👨🏻‍🍳",
          "role": {
            "uk": "пекар",
            "ru": "пекарь",
            "en": "baker"
          }
        },
        "scene": {
          "uk": "Ранкова пекарня біля дому, пахне свіжим хлібом.",
          "ru": "Утренняя пекарня у дома, пахнет свежим хлебом.",
          "en": "A morning bakery near home, smelling of fresh bread."
        },
        "steps": [
          {
            "npc": "Dzień dobry! Pieczywo prosto z pieca. Co podać?",
            "npcTr": {
              "uk": "Добрий день! Хліб просто з печі. Що подати?",
              "ru": "Добрый день! Хлеб прямо из печи. Что подать?",
              "en": "Good morning! Bread straight from the oven. What can I get you?"
            },
            "options": [
              {
                "id": "s0o0",
                "text": "Dzień dobry, poproszę chleb i cztery bułki.",
                "tr": {
                  "uk": "Добрий день, хліб і чотири булки, будь ласка.",
                  "ru": "Добрый день, хлеб и четыре булки, пожалуйста.",
                  "en": "Good morning, a loaf and four rolls, please."
                }
              },
              {
                "id": "s0o1",
                "text": "Dzień dobry, poproszę cztery bułek.",
                "tr": {
                  "uk": "(помилка у формі)",
                  "ru": "(ошибка в форме)",
                  "en": "(wrong form)"
                }
              }
            ],
            "answer": "s0o0",
            "feedback": {
              "uk": "4 → **bułki**; bułek — для 5–21.",
              "ru": "4 → **bułki**; bułek — для 5–21.",
              "en": "4 → **bułki**; bułek is for 5–21."
            }
          },
          {
            "npc": "Proszę. Może coś słodkiego? Mamy świeże drożdżówki.",
            "npcTr": {
              "uk": "Прошу. Може, щось солодке? Маємо свіжі дріжджові булочки.",
              "ru": "Пожалуйста. Может, что-то сладкое? Есть свежие булочки.",
              "en": "Here you are. Something sweet? We have fresh sweet buns."
            },
            "options": [
              {
                "id": "s1o0",
                "text": "Tak, jedną drożdżówkę z serem.",
                "tr": {
                  "uk": "Так, одну булочку з сиром.",
                  "ru": "Да, одну булочку с творогом.",
                  "en": "Yes, one cheese bun."
                }
              },
              {
                "id": "s1o1",
                "text": "Tak, jedną drożdżówkę z peronem.",
                "tr": {
                  "uk": "(безглуздо)",
                  "ru": "(бессмыслица)",
                  "en": "(nonsense)"
                }
              }
            ],
            "answer": "s1o0",
            "feedback": {
              "uk": "Дріжджова булочка буває **z serem** (з сиром), з ягодами чи з маком.",
              "ru": "Булочка бывает **z serem** (с творогом), с ягодами или с маком.",
              "en": "A sweet bun can be **z serem** (with cheese), with fruit or poppy seeds."
            }
          },
          {
            "npc": "Razem trzynaście złotych.",
            "npcTr": {
              "uk": "Разом тринадцять злотих.",
              "ru": "Вместе тринадцать злотых.",
              "en": "Thirteen złoty altogether."
            },
            "options": [
              {
                "id": "s2o0",
                "text": "Proszę, kartą.",
                "tr": {
                  "uk": "Прошу, карткою.",
                  "ru": "Вот, картой.",
                  "en": "Here, by card."
                }
              },
              {
                "id": "s2o1",
                "text": "Proszę, na wynos w lewo.",
                "tr": {
                  "uk": "(безглуздо)",
                  "ru": "(бессмыслица)",
                  "en": "(nonsense)"
                }
              }
            ],
            "answer": "s2o0",
            "feedback": {
              "uk": "Заплати: **kartą** або **gotówką**.",
              "ru": "Заплати: **kartą** или **gotówką**.",
              "en": "Pay: **kartą** or **gotówką**."
            }
          },
          {
            "npc": "Dziękuję, smacznego!",
            "npcTr": {
              "uk": "Дякую, смачного!",
              "ru": "Спасибо, приятного аппетита!",
              "en": "Thank you, enjoy!"
            }
          }
        ]
      },
      "explanation": null
    }
  },
  {
    "lesson": "waw-f2-piekarnia",
    "order": 12,
    "from": {
      "type": "FIND_ERROR",
      "skill": "grammar.plural",
      "data": {
        "pl": "Poproszę pięć bułki",
        "translation": {
          "uk": "П'ять булок, будь ласка.",
          "ru": "Пять булок, пожалуйста.",
          "en": "Five rolls, please."
        },
        "options": [
          {
            "id": "w0",
            "text": "Poproszę"
          },
          {
            "id": "w1",
            "text": "pięć"
          },
          {
            "id": "w2",
            "text": "bułki"
          }
        ],
        "answer": "w2"
      },
      "explanation": {
        "uk": "Від 5 → **bułek**.",
        "ru": "От 5 → **bułek**.",
        "en": "5+ → **bułek**."
      }
    },
    "to": {
      "type": "FIND_ERROR",
      "skill": "grammar.plural",
      "data": {
        "pl": "Poproszę pięć bułki",
        "translation": {
          "uk": "П'ять булок, будь ласка.",
          "ru": "Пять булок, пожалуйста.",
          "en": "Five rolls, please."
        },
        "options": [
          {
            "id": "w0",
            "text": "Poproszę"
          },
          {
            "id": "w1",
            "text": "pięć"
          },
          {
            "id": "w2",
            "text": "bułki"
          }
        ],
        "answer": "w2"
      },
      "explanation": {
        "uk": "Для 5–21 → **bułek**.",
        "ru": "Для 5–21 → **bułek**.",
        "en": "5–21 → **bułek**."
      }
    }
  },
  {
    "lesson": "waw-boss",
    "order": 17,
    "from": {
      "type": "FILL_GAP",
      "skill": "grammar.prices",
      "data": {
        "pl": "To kosztuje pięć ___.",
        "translation": {
          "uk": "Це коштує п'ять злотих.",
          "ru": "Это стоит пять злотых.",
          "en": "It costs five złoty."
        },
        "options": [
          {
            "id": "o0",
            "text": "złotych"
          },
          {
            "id": "o1",
            "text": "złote"
          },
          {
            "id": "o2",
            "text": "złoty"
          }
        ],
        "answer": "o0"
      },
      "explanation": {
        "uk": "Від 5 → **złotych**.",
        "ru": "От 5 → **złotych**.",
        "en": "5+ → **złotych**."
      }
    },
    "to": {
      "type": "FILL_GAP",
      "skill": "grammar.prices",
      "data": {
        "pl": "To kosztuje pięć ___.",
        "translation": {
          "uk": "Це коштує п'ять злотих.",
          "ru": "Это стоит пять злотых.",
          "en": "It costs five złoty."
        },
        "options": [
          {
            "id": "o0",
            "text": "złotych"
          },
          {
            "id": "o1",
            "text": "złote"
          },
          {
            "id": "o2",
            "text": "złoty"
          }
        ],
        "answer": "o0"
      },
      "explanation": {
        "uk": "Для 5–21 → **złotych**.",
        "ru": "Для 5–21 → **złotych**.",
        "en": "5–21 → **złotych**."
      }
    }
  },
  {
    "lesson": "krk-d3-bilet",
    "order": 6,
    "from": {
      "type": "FILL_GAP",
      "skill": "grammar.money",
      "data": {
        "pl": "Bilet kosztuje czterdzieści ___.",
        "translation": {
          "uk": "Квиток коштує сорок злотих.",
          "ru": "Билет стоит сорок злотых.",
          "en": "The ticket costs forty złoty."
        },
        "options": [
          {
            "id": "o0",
            "text": "złotych"
          },
          {
            "id": "o1",
            "text": "złote"
          },
          {
            "id": "o2",
            "text": "złoty"
          }
        ],
        "answer": "o0"
      },
      "explanation": {
        "uk": "5 і більше → **złotych**.",
        "ru": "5 и больше → **złotych**.",
        "en": "5 and more → **złotych**."
      }
    },
    "to": {
      "type": "FILL_GAP",
      "skill": "grammar.money",
      "data": {
        "pl": "Bilet kosztuje czterdzieści ___.",
        "translation": {
          "uk": "Квиток коштує сорок злотих.",
          "ru": "Билет стоит сорок злотых.",
          "en": "The ticket costs forty złoty."
        },
        "options": [
          {
            "id": "o0",
            "text": "złotych"
          },
          {
            "id": "o1",
            "text": "złote"
          },
          {
            "id": "o2",
            "text": "złoty"
          }
        ],
        "answer": "o0"
      },
      "explanation": {
        "uk": "5–21 → **złotych**.",
        "ru": "5–21 → **złotych**.",
        "en": "5–21 → **złotych**."
      }
    }
  },
  {
    "lesson": "krk-z2-ceny",
    "order": 5,
    "from": {
      "type": "FILL_GAP",
      "skill": "grammar.money",
      "data": {
        "pl": "Woda kosztuje dwa złote dziewięćdziesiąt dziewięć ___.",
        "translation": {
          "uk": "Вода коштує 2,99 зл.",
          "ru": "Вода стоит 2,99 зл.",
          "en": "Water costs 2.99 zł."
        },
        "options": [
          {
            "id": "o0",
            "text": "groszy"
          },
          {
            "id": "o1",
            "text": "grosze"
          },
          {
            "id": "o2",
            "text": "grosz"
          }
        ],
        "answer": "o0"
      },
      "explanation": {
        "uk": "99 → **groszy** (як «złotych»: 5 і більше).",
        "ru": "99 → **groszy** (как «złotych»: 5 и больше).",
        "en": "99 → **groszy** (like \"złotych\": 5 and more)."
      }
    },
    "to": {
      "type": "FILL_GAP",
      "skill": "grammar.money",
      "data": {
        "pl": "Woda kosztuje dwa złote dziewięćdziesiąt dziewięć ___.",
        "translation": {
          "uk": "Вода коштує 2,99 зл.",
          "ru": "Вода стоит 2,99 зл.",
          "en": "Water costs 2.99 zł."
        },
        "options": [
          {
            "id": "o0",
            "text": "groszy"
          },
          {
            "id": "o1",
            "text": "grosze"
          },
          {
            "id": "o2",
            "text": "grosz"
          }
        ],
        "answer": "o0"
      },
      "explanation": {
        "uk": "99 → **groszy** (як «złotych»: 5–21).",
        "ru": "99 → **groszy** (как «złotych»: 5–21).",
        "en": "99 → **groszy** (like \"złotych\": 5–21)."
      }
    }
  },
  {
    "lesson": "krk-z2-ceny",
    "order": 14,
    "from": {
      "type": "FIND_ERROR",
      "skill": "grammar.money",
      "data": {
        "pl": "Ten sok kosztuje siedem złote",
        "translation": {
          "uk": "Цей сік коштує сім злотих.",
          "ru": "Этот сок стоит семь злотых.",
          "en": "This juice costs seven złoty."
        },
        "options": [
          {
            "id": "w0",
            "text": "Ten"
          },
          {
            "id": "w1",
            "text": "sok"
          },
          {
            "id": "w2",
            "text": "kosztuje"
          },
          {
            "id": "w3",
            "text": "siedem"
          },
          {
            "id": "w4",
            "text": "złote"
          }
        ],
        "answer": "w4"
      },
      "explanation": {
        "uk": "5 і більше → **złotych**.",
        "ru": "5 и больше → **złotych**.",
        "en": "5 and more → **złotych**."
      }
    },
    "to": {
      "type": "FIND_ERROR",
      "skill": "grammar.money",
      "data": {
        "pl": "Ten sok kosztuje siedem złote",
        "translation": {
          "uk": "Цей сік коштує сім злотих.",
          "ru": "Этот сок стоит семь злотых.",
          "en": "This juice costs seven złoty."
        },
        "options": [
          {
            "id": "w0",
            "text": "Ten"
          },
          {
            "id": "w1",
            "text": "sok"
          },
          {
            "id": "w2",
            "text": "kosztuje"
          },
          {
            "id": "w3",
            "text": "siedem"
          },
          {
            "id": "w4",
            "text": "złote"
          }
        ],
        "answer": "w4"
      },
      "explanation": {
        "uk": "5–21 → **złotych**.",
        "ru": "5–21 → **złotych**.",
        "en": "5–21 → **złotych**."
      }
    }
  },
  {
    "lesson": "krk-t3-jazda",
    "order": 6,
    "from": {
      "type": "FILL_GAP",
      "skill": "grammar.numerals",
      "data": {
        "pl": "Do Nowej Huty jest jeszcze pięć ___.",
        "translation": {
          "uk": "До Нової Гути ще п'ять зупинок.",
          "ru": "До Новой Гуты ещё пять остановок.",
          "en": "There are five more stops to Nowa Huta."
        },
        "options": [
          {
            "id": "o0",
            "text": "przystanków"
          },
          {
            "id": "o1",
            "text": "przystanki"
          },
          {
            "id": "o2",
            "text": "przystanek"
          }
        ],
        "answer": "o0"
      },
      "explanation": {
        "uk": "Від 5 → родовий множини: **pięć przystanków** (і дієслово в однині: **jest**).",
        "ru": "От 5 → родительный множественного: **pięć przystanków** (и глагол в единственном: **jest**).",
        "en": "5+ → genitive plural: **pięć przystanków** (with a singular verb: **jest**)."
      }
    },
    "to": {
      "type": "FILL_GAP",
      "skill": "grammar.numerals",
      "data": {
        "pl": "Do Nowej Huty jest jeszcze pięć ___.",
        "translation": {
          "uk": "До Нової Гути ще п'ять зупинок.",
          "ru": "До Новой Гуты ещё пять остановок.",
          "en": "There are five more stops to Nowa Huta."
        },
        "options": [
          {
            "id": "o0",
            "text": "przystanków"
          },
          {
            "id": "o1",
            "text": "przystanki"
          },
          {
            "id": "o2",
            "text": "przystanek"
          }
        ],
        "answer": "o0"
      },
      "explanation": {
        "uk": "Для 5–21 → родовий множини: **pięć przystanków** (і дієслово в однині: **jest**).",
        "ru": "Для 5–21 → родительный множественного: **pięć przystanków** (и глагол в единственном: **jest**).",
        "en": "5–21 → genitive plural: **pięć przystanków** (with a singular verb: **jest**)."
      }
    }
  },
  {
    "lesson": "krk-t3-jazda",
    "order": 15,
    "from": {
      "type": "FIND_ERROR",
      "skill": "grammar.numerals",
      "data": {
        "pl": "Jedziemy pięć przystanki",
        "translation": {
          "uk": "Їдемо п'ять зупинок.",
          "ru": "Едем пять остановок.",
          "en": "We ride five stops."
        },
        "options": [
          {
            "id": "w0",
            "text": "Jedziemy"
          },
          {
            "id": "w1",
            "text": "pięć"
          },
          {
            "id": "w2",
            "text": "przystanki"
          }
        ],
        "answer": "w2"
      },
      "explanation": {
        "uk": "Від 5 → **przystanków**.",
        "ru": "От 5 → **przystanków**.",
        "en": "5+ → **przystanków**."
      }
    },
    "to": {
      "type": "FIND_ERROR",
      "skill": "grammar.numerals",
      "data": {
        "pl": "Jedziemy pięć przystanki",
        "translation": {
          "uk": "Їдемо п'ять зупинок.",
          "ru": "Едем пять остановок.",
          "en": "We ride five stops."
        },
        "options": [
          {
            "id": "w0",
            "text": "Jedziemy"
          },
          {
            "id": "w1",
            "text": "pięć"
          },
          {
            "id": "w2",
            "text": "przystanki"
          }
        ],
        "answer": "w2"
      },
      "explanation": {
        "uk": "Для 5–21 → **przystanków**.",
        "ru": "Для 5–21 → **przystanków**.",
        "en": "5–21 → **przystanków**."
      }
    }
  },
  {
    "lesson": "krk-h1-recepcja",
    "order": 7,
    "from": {
      "type": "FILL_GAP",
      "skill": "grammar.numerals",
      "data": {
        "pl": "Zostaję tu pięć ___.",
        "translation": {
          "uk": "Я залишаюся тут на п'ять ночей.",
          "ru": "Я остаюсь здесь на пять ночей.",
          "en": "I'm staying here for five nights."
        },
        "options": [
          {
            "id": "o0",
            "text": "nocy"
          },
          {
            "id": "o1",
            "text": "noce"
          },
          {
            "id": "o2",
            "text": "nocą"
          }
        ],
        "answer": "o0"
      },
      "explanation": {
        "uk": "Від 5 → родовий множини: **pięć nocy**.",
        "ru": "От 5 → родительный множественного: **pięć nocy**.",
        "en": "5+ → genitive plural: **pięć nocy**."
      }
    },
    "to": {
      "type": "FILL_GAP",
      "skill": "grammar.numerals",
      "data": {
        "pl": "Zostaję tu pięć ___.",
        "translation": {
          "uk": "Я залишаюся тут на п'ять ночей.",
          "ru": "Я остаюсь здесь на пять ночей.",
          "en": "I'm staying here for five nights."
        },
        "options": [
          {
            "id": "o0",
            "text": "nocy"
          },
          {
            "id": "o1",
            "text": "noce"
          },
          {
            "id": "o2",
            "text": "nocą"
          }
        ],
        "answer": "o0"
      },
      "explanation": {
        "uk": "Для 5–21 → родовий множини: **pięć nocy**.",
        "ru": "Для 5–21 → родительный множественного: **pięć nocy**.",
        "en": "5–21 → genitive plural: **pięć nocy**."
      }
    }
  },
  {
    "lesson": "krk-u4-biblioteka",
    "order": 8,
    "from": {
      "type": "FILL_GAP",
      "skill": "grammar.numerals",
      "data": {
        "pl": "Książkę trzeba oddać za dwa ___.",
        "translation": {
          "uk": "Книжку треба повернути через два тижні.",
          "ru": "Книгу нужно вернуть через две недели.",
          "en": "The book must be returned in two weeks."
        },
        "options": [
          {
            "id": "o0",
            "text": "tygodnie"
          },
          {
            "id": "o1",
            "text": "tygodni"
          },
          {
            "id": "o2",
            "text": "tydzień"
          }
        ],
        "answer": "o0"
      },
      "explanation": {
        "uk": "2–4 → **tygodnie**, від 5 → tygodni.",
        "ru": "2–4 → **tygodnie**, от 5 → tygodni.",
        "en": "2–4 → **tygodnie**, 5+ → tygodni."
      }
    },
    "to": {
      "type": "FILL_GAP",
      "skill": "grammar.numerals",
      "data": {
        "pl": "Książkę trzeba oddać za dwa ___.",
        "translation": {
          "uk": "Книжку треба повернути через два тижні.",
          "ru": "Книгу нужно вернуть через две недели.",
          "en": "The book must be returned in two weeks."
        },
        "options": [
          {
            "id": "o0",
            "text": "tygodnie"
          },
          {
            "id": "o1",
            "text": "tygodni"
          },
          {
            "id": "o2",
            "text": "tydzień"
          }
        ],
        "answer": "o0"
      },
      "explanation": {
        "uk": "2–4 → **tygodnie**, від 5 → tygodni.",
        "ru": "2–4 → **tygodnie**, от 5 → tygodni.",
        "en": "2–4 → **tygodnie**, 5–21 → tygodni."
      }
    }
  },
  {
    "lesson": "krk-u5-misja",
    "order": 13,
    "from": {
      "type": "FILL_GAP",
      "skill": "grammar.numerals",
      "data": {
        "pl": "Można wypożyczyć pięć ___.",
        "translation": {
          "uk": "Можна взяти п'ять книжок.",
          "ru": "Можно взять пять книг.",
          "en": "You can borrow five books."
        },
        "options": [
          {
            "id": "o0",
            "text": "książek"
          },
          {
            "id": "o1",
            "text": "książki"
          },
          {
            "id": "o2",
            "text": "książka"
          }
        ],
        "answer": "o0"
      },
      "explanation": {
        "uk": "Від 5 → родовий множини: **książek**.",
        "ru": "От 5 → родительный множественного: **książek**.",
        "en": "5+ → genitive plural: **książek**."
      }
    },
    "to": {
      "type": "FILL_GAP",
      "skill": "grammar.numerals",
      "data": {
        "pl": "Można wypożyczyć pięć ___.",
        "translation": {
          "uk": "Можна взяти п'ять книжок.",
          "ru": "Можно взять пять книг.",
          "en": "You can borrow five books."
        },
        "options": [
          {
            "id": "o0",
            "text": "książek"
          },
          {
            "id": "o1",
            "text": "książki"
          },
          {
            "id": "o2",
            "text": "książka"
          }
        ],
        "answer": "o0"
      },
      "explanation": {
        "uk": "Для 5–21 → родовий множини: **książek**.",
        "ru": "Для 5–21 → родительный множественного: **książek**.",
        "en": "5–21 → genitive plural: **książek**."
      }
    }
  },
  {
    "lesson": "placement-test",
    "order": 0,
    "from": {
      "type": "WORD_TRANSLATION",
      "skill": "vocab.greetings",
      "data": {
        "pl": "Dziękuję",
        "audioText": "Dziękuję",
        "options": [
          {
            "id": "o0",
            "text": {
              "uk": "Дякую",
              "ru": "Спасибо",
              "en": "Thank you"
            }
          },
          {
            "id": "o1",
            "text": {
              "uk": "Будь ласка",
              "ru": "Пожалуйста",
              "en": "Please"
            }
          },
          {
            "id": "o2",
            "text": {
              "uk": "Вибачте",
              "ru": "Извините",
              "en": "Sorry"
            }
          }
        ],
        "answer": "o0"
      }
    },
    "to": {
      "type": "WORD_TRANSLATION",
      "skill": "vocab.greetings",
      "data": {
        "pl": "Do widzenia",
        "audioText": "Do widzenia",
        "options": [
          {
            "id": "o0",
            "text": {
              "uk": "До побачення",
              "ru": "До свидания",
              "en": "Goodbye"
            }
          },
          {
            "id": "o1",
            "text": {
              "uk": "Добрий вечір",
              "ru": "Добрый вечер",
              "en": "Good evening"
            }
          },
          {
            "id": "o2",
            "text": {
              "uk": "Дякую",
              "ru": "Спасибо",
              "en": "Thank you"
            }
          }
        ],
        "answer": "o0"
      }
    }
  },
  {
    "lesson": "placement-test",
    "order": 4,
    "from": {
      "type": "FILL_GAP",
      "skill": "grammar.gender",
      "data": {
        "pl": "To jest ___ siostra.",
        "translation": {
          "uk": "Це моя сестра.",
          "ru": "Это моя сестра.",
          "en": "This is my sister."
        },
        "options": [
          {
            "id": "o0",
            "text": "moja"
          },
          {
            "id": "o1",
            "text": "mój"
          },
          {
            "id": "o2",
            "text": "moje"
          }
        ],
        "answer": "o0"
      }
    },
    "to": {
      "type": "FIND_ERROR",
      "skill": "grammar.gender",
      "data": {
        "pl": "To jest moja mieszkanie",
        "translation": {
          "uk": "Це моя квартира.",
          "ru": "Это моя квартира.",
          "en": "This is my flat."
        },
        "options": [
          {
            "id": "w0",
            "text": "To"
          },
          {
            "id": "w1",
            "text": "jest"
          },
          {
            "id": "w2",
            "text": "moja"
          },
          {
            "id": "w3",
            "text": "mieszkanie"
          }
        ],
        "answer": "w2"
      },
      "explanation": {
        "uk": "**mieszkanie** — середній рід (закінчення **-e**), тому **moje mieszkanie**, хоча «квартира» — жіночого роду.",
        "ru": "**mieszkanie** — средний род (окончание **-e**), поэтому **moje mieszkanie**, хотя «квартира» — женского рода.",
        "en": "**mieszkanie** is neuter (ending **-e**), so it is **moje mieszkanie**."
      }
    }
  },
  {
    "lesson": "placement-test",
    "order": 6,
    "from": {
      "type": "FILL_GAP",
      "skill": "grammar.accusative",
      "data": {
        "pl": "Poproszę ___.",
        "translation": {
          "uk": "Каву, будь ласка.",
          "ru": "Кофе, пожалуйста.",
          "en": "A coffee, please."
        },
        "options": [
          {
            "id": "o0",
            "text": "kawę"
          },
          {
            "id": "o1",
            "text": "kawa"
          },
          {
            "id": "o2",
            "text": "kawy"
          }
        ],
        "answer": "o0"
      }
    },
    "to": {
      "type": "WORD_TRANSLATION",
      "skill": "grammar.accusative",
      "data": {
        "translation": {
          "uk": "Я читаю книжку.",
          "ru": "Я читаю книгу.",
          "en": "I'm reading a book."
        },
        "options": [
          {
            "id": "o0",
            "text": "Czytam książkę."
          },
          {
            "id": "o1",
            "text": "Czytam książka."
          },
          {
            "id": "o2",
            "text": "Czytam książką."
          }
        ],
        "answer": "o0"
      },
      "explanation": {
        "uk": "**czytać** + знахідний відмінок: książka → **książkę**.",
        "ru": "**czytać** + винительный падеж: książka → **książkę**.",
        "en": "**czytać** takes the accusative: książka → **książkę**."
      }
    }
  },
  {
    "lesson": "placement-test",
    "order": 7,
    "from": {
      "type": "FILL_GAP",
      "skill": "grammar.numerals",
      "data": {
        "pl": "To kosztuje pięć ___.",
        "translation": {
          "uk": "Це коштує п'ять злотих.",
          "ru": "Это стоит пять злотых.",
          "en": "It costs five zlotys."
        },
        "options": [
          {
            "id": "o0",
            "text": "złotych"
          },
          {
            "id": "o1",
            "text": "złote"
          },
          {
            "id": "o2",
            "text": "złoty"
          }
        ],
        "answer": "o0"
      }
    },
    "to": {
      "type": "WORD_TRANSLATION",
      "skill": "grammar.numerals",
      "data": {
        "translation": {
          "uk": "У мене п'ять квитків.",
          "ru": "У меня пять билетов.",
          "en": "I have five tickets."
        },
        "options": [
          {
            "id": "o0",
            "text": "Mam pięć biletów."
          },
          {
            "id": "o1",
            "text": "Mam pięć bilety."
          },
          {
            "id": "o2",
            "text": "Mam pięć bilet."
          }
        ],
        "answer": "o0"
      },
      "explanation": {
        "uk": "Після 5–21 — родовий відмінок множини: **pięć biletów**.",
        "ru": "После 5–21 — родительный падеж множественного числа: **pięć biletów**.",
        "en": "After 5–21 use the genitive plural: **pięć biletów**."
      }
    }
  },
  {
    "lesson": "exam-a1",
    "order": 14,
    "from": {
      "type": "SENTENCE_TRANSLATION",
      "skill": "writing.exam",
      "data": {
        "source": {
          "uk": "Рахунок, будь ласка.",
          "ru": "Счёт, пожалуйста.",
          "en": "The bill, please."
        },
        "accepted": [
          "Poproszę rachunek",
          "Rachunek proszę",
          "Proszę rachunek"
        ]
      }
    },
    "to": {
      "type": "SENTENCE_TRANSLATION",
      "skill": "writing.exam",
      "data": {
        "source": {
          "uk": "Вибачте, де тут аптека?",
          "ru": "Извините, где здесь аптека?",
          "en": "Excuse me, where is the pharmacy here?"
        },
        "accepted": [
          "Przepraszam, gdzie tu jest apteka",
          "Przepraszam, gdzie jest tu apteka",
          "Przepraszam, gdzie tutaj jest apteka",
          "Przepraszam, gdzie jest apteka"
        ]
      }
    }
  },
  {
    "lesson": "opo-3-ogarniac",
    "order": 4,
    "from": {
      "type": "FILL_GAP",
      "skill": "register.slang",
      "data": {
        "pl": "(Колезі) Spóźnię się 5 minut, ___ to za mnie?",
        "translation": {
          "uk": "Я запізнюся на 5 хвилин, розрулиш це за мене?",
          "ru": "Я опоздаю на 5 минут, разрулишь это за меня?",
          "en": "I'll be 5 minutes late, can you handle it for me?"
        },
        "options": [
          {
            "id": "o0",
            "text": "ogarniesz"
          },
          {
            "id": "o1",
            "text": "ogarnij się"
          },
          {
            "id": "o2",
            "text": "masz wywalone"
          }
        ],
        "answer": "o0"
      },
      "explanation": {
        "uk": "Прохання до колеги: **Ogarniesz to?** «Ogarnij się» — різке «візьми себе в руки».",
        "ru": "Просьба к коллеге: **Ogarniesz to?** «Ogarnij się» — резкое «возьми себя в руки».",
        "en": "A request: **Ogarniesz to?**"
      }
    },
    "to": {
      "type": "FILL_GAP",
      "skill": "register.slang",
      "data": {
        "pl": "Spóźnię się 5 minut, ___ to za mnie?",
        "translation": {
          "uk": "Колезі: «Я запізнюся на 5 хвилин, розрулиш це за мене?»",
          "ru": "Коллеге: «Я опоздаю на 5 минут, разрулишь это за меня?»",
          "en": "To a colleague: \"I'll be 5 minutes late, can you handle it for me?\""
        },
        "options": [
          {
            "id": "o0",
            "text": "ogarniesz"
          },
          {
            "id": "o1",
            "text": "ogarnij się"
          },
          {
            "id": "o2",
            "text": "masz wywalone"
          }
        ],
        "answer": "o0"
      },
      "explanation": {
        "uk": "Прохання до колеги: **Ogarniesz to?** «Ogarnij się» — різке «візьми себе в руки».",
        "ru": "Просьба к коллеге: **Ogarniesz to?** «Ogarnij się» — резкое «возьми себя в руки».",
        "en": "A request: **Ogarniesz to?**"
      }
    }
  },
  {
    "lesson": "opo-boss",
    "order": 2,
    "from": {
      "type": "FILL_GAP",
      "skill": "register.boss",
      "data": {
        "pl": "(Лист до керівниці) Dzień dobry, niestety ___ rozumiem tego zadania.",
        "translation": {
          "uk": "Добрий день, на жаль, я не розумію цього завдання.",
          "ru": "Добрый день, к сожалению, я не понимаю этого задания.",
          "en": "Hello, unfortunately I don't understand this task."
        },
        "options": [
          {
            "id": "o0",
            "text": "nie"
          },
          {
            "id": "o1",
            "text": "nie ogarniam"
          },
          {
            "id": "o2",
            "text": "mam wywalone"
          }
        ],
        "answer": "o0"
      },
      "explanation": {
        "uk": "В офіційному листі — нейтрально: **nie rozumiem**.",
        "ru": "В официальном письме — нейтрально: **nie rozumiem**.",
        "en": "Formal letter — **nie rozumiem**."
      }
    },
    "to": {
      "type": "FILL_GAP",
      "skill": "register.boss",
      "data": {
        "pl": "Dzień dobry, niestety ___ rozumiem tego zadania.",
        "translation": {
          "uk": "Лист до керівниці: «Добрий день, на жаль, я не розумію цього завдання.»",
          "ru": "Письмо руководительнице: «Добрый день, к сожалению, я не понимаю этого задания.»",
          "en": "Email to your manager: \"Hello, unfortunately I don't understand this task.\""
        },
        "options": [
          {
            "id": "o0",
            "text": "nie"
          },
          {
            "id": "o1",
            "text": "nie ogarniam"
          },
          {
            "id": "o2",
            "text": "mam wywalone"
          }
        ],
        "answer": "o0"
      },
      "explanation": {
        "uk": "В офіційному листі — нейтрально: **nie rozumiem**.",
        "ru": "В официальном письме — нейтрально: **nie rozumiem**.",
        "en": "Formal letter — **nie rozumiem**."
      }
    }
  }
];

const GRAMMAR_PHRASES = [
  "I'd like to",
  "I'm not",
  "I'm",
  "I've",
  "I'll",

  "have been",
  "has been",
  "had been",
  "are being",
  "were being",

  "wasn't",
  "weren't",
  "didn't",
  "doesn't",
  "don't",
  "won't",
  "haven't",
  "aren't",

  "going to",
  "will",
  "been",
  "being",
  "had",
  "has",
  "did",
  "does",
  "do",
  "are",
  "was",
  "were",
  "be",
  "am", 
  "am not",
  "is not",
  "is",
  "isn't",
  "are not"
];

const TENSE_MARKERS = [
  "for two hours by 11 o'clock",
  "from 10 to 11 a.m.",
  "for two hours",
  "5 days a week",
  "in the evenings",
  "at weekends",
  "on weekdays",
  "sometimes",
  "always",
  "in general",
  "by 11 o'clock",
  "at 11 o'clock",
  "this weekend",
  "for a while",
  "by the time",
  "at that time",
  "how many",
  "how often",
  "tomorrow",
  "yesterday",
  "already",
  "usually",
  "before",
  "often",
  "still",
  "when",
  "just",
  "yet",
  "right now",
  "now",
  "still"
];

const MULTI_WORD_IRREGULARS = [
  "gets wet"
];

/*
 * Слова из этого списка подсвечиваются целиком.
 */
const IRREGULAR_WORDS = new Set([
 
]);

/*
 * Контролируемая подсветка окончаний.
 *
 * Ключ — полное слово.
 * Значение — окончание, которое нужно подсветить.
 *
 * Примеры:
 * ["likes", "s"]
 * ["misses", "es"]
 * ["studies", "ies"]
 * ["worked", "ed"]
 * ["working", "ing"]
 */
const ENDING_HIGHLIGHTS = new Map([
  ["I'm ", "'m "],

  ["shows", "s"],
  ["takes", "s"],


  ["having", "ing"],
  ["watching", "ing"],
  ["looking", "ing"],
  ["showing", "ing"],
  ["hanging", "ing"],
  ["going", "ing"],
  ["being", "ing"],
  ["working", "ing"],
  ["reading", "ing"]
]);

const SPEAKER_MAP = {
  dima: "speaker-2",
  stas: "speaker-2",
  galya: "speaker-1"
};


/* =========================================================
   REGEX HELPERS
   ========================================================= */

function escapeRegex(value) {
  return String(value).replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );
}

function sortByLength(items) {
  return [...items].sort(
    (a, b) => b.length - a.length
  );
}

function createPhraseRegex(items) {
  const sortedItems = sortByLength(items)
    .filter(Boolean)
    .map(escapeRegex);

  if (sortedItems.length === 0) {
    return null;
  }

  return new RegExp(
    `(?<![A-Za-z])(?:${sortedItems.join("|")})(?![A-Za-z])`,
    "gi"
  );
}

function createWordSetRegex(words) {
  const sortedWords = sortByLength(words)
    .filter(Boolean)
    .map(escapeRegex);

  if (sortedWords.length === 0) {
    return null;
  }

  return new RegExp(
    `\\b(?:${sortedWords.join("|")})\\b`,
    "gi"
  );
}


/* =========================================================
   PRECOMPILED REGEX
   ========================================================= */

const TENSE_MARKERS_REGEX =
  createPhraseRegex(TENSE_MARKERS);

const MULTI_WORD_IRREGULARS_REGEX =
  createPhraseRegex(MULTI_WORD_IRREGULARS);

const GRAMMAR_PHRASES_REGEX =
  createPhraseRegex(GRAMMAR_PHRASES);

const IRREGULAR_WORDS_REGEX =
  createWordSetRegex([...IRREGULAR_WORDS]);

const ENDING_WORDS_REGEX =
  createWordSetRegex(
    [...ENDING_HIGHLIGHTS.keys()]
  );


/* =========================================================
   HTML HELPERS
   ========================================================= */

/*
 * Преобразует HTML-сущности обратно в символы:
 *
 * don&#039;t → don't
 * I&#039;m   → I'm
 * &amp;      → &
 *
 * Используется перед подсветкой.
 */
function decodeHtmlEntities(value) {
  const text = String(value);

  /*
   * В браузере используем textarea:
   * это наиболее надёжный способ декодирования сущностей.
   */
  if (typeof document !== "undefined") {
    const textarea =
      document.createElement("textarea");

    textarea.innerHTML = text;

    return textarea.value;
  }

  /*
   * Запасной вариант, если код выполняется
   * вне браузера.
   */
  return text
    .replace(/&#0*39;/gi, "'")
    .replace(/&#x0*27;/gi, "'")
    .replace(/&apos;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&amp;/gi, "&");
}

/*
 * Приводит типографские апострофы
 * к обычному английскому апострофу.
 *
 * don’t → don't
 * I’m   → I'm
 */
function normalizeApostrophes(value) {
  return String(value)
    .replace(/[’‘‛`´]/g, "'");
}

/*
 * Экранирует символы, которые могут создать HTML-разметку.
 *
 * Обычный апостроф внутри текстового содержимого
 * экранировать не требуется.
 */
function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/*
 * Применяет функцию только к текстовым частям строки,
 * не затрагивая уже созданные HTML-теги.
 */
function transformTextNodes(html, transformer) {
  return html
    .split(/(<[^>]+>)/g)
    .map(part => {
      const isHtmlTag =
        part.startsWith("<") &&
        part.endsWith(">");

      if (isHtmlTag) {
        return part;
      }

      return transformer(part);
    })
    .join("");
}


/* =========================================================
   HIGHLIGHT HELPERS
   ========================================================= */

function wrapGrammar(
  value,
  extraClass = ""
) {
  const className = extraClass
    ? `grammar ${extraClass}`
    : "grammar";

  return (
    `<span class="${className}">` +
    `${value}</span>`
  );
}

function wrapTenseMarker(value) {
  return (
    `<span class="tense-marker">` +
    `${value}</span>`
  );
}

function highlightEnding(word, ending) {
  if (!word || !ending) {
    return word;
  }

  const normalizedWord =
    word.toLowerCase();

  const normalizedEnding =
    ending.toLowerCase();

  if (
    !normalizedWord.endsWith(
      normalizedEnding
    )
  ) {
    return word;
  }

  const rootLength =
    word.length - ending.length;

  const root =
    word.slice(0, rootLength);

  const originalEnding =
    word.slice(rootLength);

  return (
    `${root}` +
    `${wrapGrammar(originalEnding)}`
  );
}

function applyRegexToTextNodes(
  html,
  regex,
  replacer
) {
  if (!regex) {
    return html;
  }

  return transformTextNodes(
    html,
    text => text.replace(regex, replacer)
  );
}


/* =========================================================
   TEXT PREPARATION
   ========================================================= */

function prepareText(text) {
  const decodedText =
    decodeHtmlEntities(text);

  const normalizedText =
    normalizeApostrophes(decodedText);

  return escapeHtml(normalizedText);
}


/* =========================================================
   MAIN HIGHLIGHTER
   ========================================================= */

export function highlight(text) {
  if (
    text === null ||
    text === undefined ||
    text === ""
  ) {
    return "";
  }

  /*
   * Например:
   *
   * I don&#039;t work
   *        ↓
   * I don't work
   */
  let result = prepareText(text);

  /*
   * 1. Маркеры времени
   */
  result = applyRegexToTextNodes(
    result,
    TENSE_MARKERS_REGEX,
    match => wrapTenseMarker(match)
  );

  /*
   * 2. Составные выражения,
   * выделяемые целиком
   */
  result = applyRegexToTextNodes(
    result,
    MULTI_WORD_IRREGULARS_REGEX,
    match => {
      return wrapGrammar(
        match,
        "highlight-grammar"
      );
    }
  );

  /*
   * 3. Грамматические конструкции:
   * don't, doesn't, have been и так далее
   */
  result = applyRegexToTextNodes(
    result,
    GRAMMAR_PHRASES_REGEX,
    match => wrapGrammar(match)
  );

  /*
   * 4. Только разрешённые окончания
   */
  result = applyRegexToTextNodes(
    result,
    ENDING_WORDS_REGEX,
    match => {
      const normalizedWord =
        match.toLowerCase();

      const ending =
        ENDING_HIGHLIGHTS.get(
          normalizedWord
        );

      return highlightEnding(
        match,
        ending
      );
    }
  );

  /*
   * 5. Отдельные слова,
   * подсвечиваемые целиком
   */
  result = applyRegexToTextNodes(
    result,
    IRREGULAR_WORDS_REGEX,
    match => {
      return wrapGrammar(
        match,
        "highlight-grammar"
      );
    }
  );

  return result;
}


/* =========================================================
   SPEAKERS
   ========================================================= */

function extractSpeaker(text) {
  if (!text) {
    return {
      speaker: null,
      cleanText: text ?? ""
    };
  }

  const normalizedText =
    normalizeApostrophes(
      decodeHtmlEntities(text)
    );

  const match =
    normalizedText.match(
      /^([A-Za-z]+):\s*(.*)$/s
    );

  if (!match) {
    return {
      speaker: null,
      cleanText: normalizedText
    };
  }

  return {
    speaker: match[1],
    cleanText: match[2]
  };
}

export function getSpeakerClass(name) {
  if (!name) {
    return "speaker-default";
  }

  const key = String(name)
    .trim()
    .toLowerCase();

  return (
    SPEAKER_MAP[key] ||
    "speaker-default"
  );
}

export function highlightSpeakerNameAndText(
  text
) {
  if (!text) {
    return "";
  }

  const {
    speaker,
    cleanText
  } = extractSpeaker(text);

  if (!speaker) {
    return highlight(cleanText);
  }

  const speakerClass =
    getSpeakerClass(speaker);

  const safeSpeaker =
    escapeHtml(speaker);

  return (
    `<span class="${speakerClass}">` +
    `${safeSpeaker}</span>: ` +
    highlight(cleanText)
  );
}

export function highlightSpeakerName(text) {
  if (!text) {
    return "";
  }

  const {
    speaker,
    cleanText
  } = extractSpeaker(text);

  if (!speaker) {
    return prepareText(text);
  }

  const speakerClass =
    getSpeakerClass(speaker);

  const safeSpeaker =
    escapeHtml(speaker);

  const safeText =
    prepareText(cleanText);

  return (
    `<span class="${speakerClass}">` +
    `${safeSpeaker}</span>: ` +
    safeText
  );
}
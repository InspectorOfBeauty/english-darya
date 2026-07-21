import { highlight, getSpeakerClass, highlightSpeakerName } from "./highlighter.js";

export function tenseToClasses(tense) {
  return tense
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .join(" ");
}

// ---------------- EXAMPLE ----------------

function renderExample(example) {
  return `
    <div class="example">

      <div class="english-text">
        ${highlight(highlightSpeakerName(example.english))}
      </div>

      <div class="translation">
        ${example.russian}
        <span class="comment">
          ${example.comment ? `<br/>${example.comment}` : ""}
        </span>
      </div>

    </div>
  `;
}

// ---------------- VOICE ----------------

function renderVoice(examples, voiceClass) {
  const list = Array.isArray(examples) ? examples : [];

  const content = list.length
    ? list.map(renderExample).join("")
    : `<span class="important">Пассивная форма теоретически возможна, но в реальности почти не используется и избегается.</span>`;

  return `
    <div class="${voiceClass}">
      ${content}
    </div>
  `;
}

// ---------------- CELL ----------------

function renderCell(cellData, type) {
  const data = cellData ?? {
    active: [],
    passive: []
  };

  return `
    <td class="cell ${type}">

      ${renderVoice(data.active, "active-voice")}

      ${renderVoice(data.passive, "passive-voice")}

    </td>
  `;
}

// ---------------- ROW ----------------

export function renderRow(tense) {
  const meta = tense?.meta ?? {};

  const classes = tenseToClasses(meta.tense || "");

  return `
    <tr class="tense-row ${classes}">

      <td class="tense-name">
        ${meta.tense || "—"}
      </td>

      ${renderCell(tense.question, "question")}
      ${renderCell(tense.statement, "statement")}
      ${renderCell(tense.negation, "negation")}

    </tr>
  `;
}

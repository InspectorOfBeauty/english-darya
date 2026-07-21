import { tenseToClasses } from "./table-render.js";

// ---------------- MARKERS ----------------

function renderTenseMarkers(tense) {
    const markers = tense?.meta?.markers ?? [];

    if (!markers.length) return "";

    return `
        <div class="markers">
            ${markers
                .map(marker => `<div class="marker">${marker}</div>`)
                .join("")}
        </div>
    `;
}

// ---------------- META ----------------

export function renderTenseMeta(tense) {
    const meta = tense?.meta ?? {};

    const classes = tenseToClasses(meta.tense || "");

    return `
        <div class="meta ${classes}" data-tense="${meta.tense}">

            <div class="name">
                ${meta.tense || "—"}
            </div>

            <div class="construction">
                ${meta.construction || ""}
            </div>

            <div class="description">
                ${meta.description || ""}
            </div>

            ${renderTenseMarkers(tense)}

        </div>
    `;
}

import { renderRow } from "./table-render.js";
import { renderTenseMeta } from "./description-render.js";

let tenses = [];

// ---------------- INITIAL STATE ----------------
// всё включено, кроме passive + features

const filterState = {
    tense: new Set(["present", "future", "past"]),
    aspect: new Set(["simple", "continuous", "perfect"]),
    column: new Set(["question", "statement", "negation"]),
    voice: new Set(["active-voice"]),
    feature: new Set([])
};

// ---------------- SELECTED TENSE ----------------

let selectedTense = null;
const video = document.getElementById("tense-video"); 

// ---------------- INIT ----------------

document.addEventListener("DOMContentLoaded", async () => {
    const response = await fetch("./data/tenses.json");
    tenses = await response.json();

    initButtons();
    initTableClick(); // 👈 ДОБАВЛЕНО
    resetFeatureStyles();
    render();
});

// ---------------- BUTTONS ----------------

function initButtons() {
    document.querySelectorAll(".toggle-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const type = btn.dataset.type;
            const value = btn.dataset.value;

            toggle(filterState[type], value);
            render();
        });
    });
}

// ---------------- TABLE CLICK ----------------

function initTableClick() {
    document.getElementById("table-body")?.addEventListener("click", (e) => {
        const cell = e.target.closest(".tense-name");
        if (!cell) return;

        const tenseName = cell.textContent.trim().toLowerCase();

        selectedTense = tenseName;

        render();

        if (tenseName === "future perfect continuous" 
            || tenseName === "past perfect continuous" 
            || tenseName === "present perfect continuous" 
        ) {
            playVideo();
        }

    });
}

// ---------------- TOGGLE ----------------

function toggle(set, value) {
    set.has(value) ? set.delete(value) : set.add(value);
}

// ---------------- FILTER CORE ----------------

function getFilteredTenses() {
    return tenses.filter(tense => {
        const name = tense.meta.tense.toLowerCase();

        const matchTense = filterState.tense.has(
            ["present", "future", "past"].find(k => name.includes(k))
        );

        const matchAspect = filterState.aspect.has(
            ["simple", "continuous", "perfect"].find(k => name.includes(k))
        );

        return matchTense && matchAspect;
    });
}

// ---------------- RENDER ----------------

function render() {
    const filtered = getFilteredTenses();

    renderTable(filtered);
    renderMeta(filtered);
    renderStubs(filtered);

    applyColumnFilter();
    applyVoiceFilter();
    applyFeatureFilter();

    syncButtons();

    scrollToSelectedMeta();
}

// ---------------- TABLE ----------------

function renderTable(filtered) {
    const tableBody = document.getElementById("table-body");
    const table = document.querySelector(".tense-table");

    if (!tableBody || !table) return;

    const isEmpty = filtered.length === 0;

    table.classList.toggle("hidden", isEmpty);
    tableBody.innerHTML = filtered.map(renderRow).join("");
}

// ---------------- META ----------------

function renderMeta(filtered) {
    const metaContainer = document.querySelector(".meta-container");

    if (!metaContainer) return;

    const ordered = [...filtered];

    if (selectedTense) {
        const index = ordered.findIndex(t =>
            t.meta.tense.toLowerCase() === selectedTense
        );

        if (index > -1) {
            const [item] = ordered.splice(index, 1);
            ordered.unshift(item);
        }
    }

    metaContainer.innerHTML = ordered
        .map(t => renderTenseMetaWithState(t))
        .join("");
}

// ---------------- META WRAPPER (подсветка) ----------------

function renderTenseMetaWithState(tense) {
    const meta = tense.meta;

    const isSelected =
        selectedTense === meta.tense.toLowerCase();

    const html = renderTenseMeta(tense);

    return isSelected
        ? html.replace('class="meta', 'class="meta selected')
        : html;
}

// ---------------- STUBS ----------------

function renderStubs(filtered) {
    const metaStub = document.querySelector('[data-stub="meta"]');
    const tableStub = document.querySelector('[data-stub="table"]');

    const isEmpty = filtered.length === 0;

    metaStub?.classList.toggle("hidden", !isEmpty);
    tableStub?.classList.toggle("hidden", !isEmpty);
}

// ---------------- COLUMN FILTER ----------------

function applyColumnFilter() {
    const columns = ["question", "statement", "negation"];

    columns.forEach(column => {
        const visible = filterState.column.has(column);

        document.querySelectorAll(`th.${column}`).forEach(el => {
            el.classList.toggle("hidden", !visible);
        });

        document.querySelectorAll(`td.${column}`).forEach(el => {
            el.classList.toggle("hidden", !visible);
        });
    });
}

// ---------------- VOICE FILTER ----------------

function applyVoiceFilter() {
    const voices = ["active-voice", "passive-voice"];

    voices.forEach(voice => {
        const visible = filterState.voice.has(voice);

        document.querySelectorAll(`.${voice}`).forEach(el => {
            el.classList.toggle("hidden", !visible);
        });
    });
}

// ---------------- FEATURE FILTER ----------------

function applyFeatureFilter() {
    const grammarEnabled = filterState.feature.has("grammar");
    const markerEnabled = filterState.feature.has("tense-marker");

    document.querySelectorAll(".grammar").forEach(el => {
        el.classList.toggle("active", grammarEnabled);
    });

    document.querySelectorAll(".tense-marker").forEach(el => {
        el.classList.toggle("active", markerEnabled);
    });
}

// ---------------- BUTTON SYNC ----------------

function syncButtons() {
    document.querySelectorAll(".toggle-btn").forEach(btn => {
        const type = btn.dataset.type;
        const value = btn.dataset.value;

        const isActive = filterState[type].has(value);

        btn.classList.toggle("active-btn", isActive);
    });
}

// ---------------- RESET VISUAL ----------------

function resetFeatureStyles() {
    document.querySelectorAll(".grammar, .tense-marker")
        .forEach(el => el.classList.remove("active"));
}

function playVideo() {
    if (!video) return;

    video.classList.remove("hidden");
    video.style.display = "block";

    video.currentTime = 0;
    video.play().catch(() => {});

    const FADE_TIME = 700;

    setTimeout(() => {
        video.classList.add("hidden");
    }, 1600);

    setTimeout(() => {
        video.pause();
        video.style.display = "none";
    }, 1600 + FADE_TIME);
}

function scrollToSelectedMeta() {
    if (!selectedTense) return;

    // даём браузеру успеть вставить DOM
    requestAnimationFrame(() => {
        const el = document.querySelector(".meta.selected");
        if (!el) return;

        el.scrollIntoView({
            behavior: "smooth",
            block: "start",   // или "center", если хочешь мягче
        });
    });
}
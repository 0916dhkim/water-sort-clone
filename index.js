// @ts-check

/**
 * @typedef {'RED' | 'BLUE'} LiquidColor
 */

/**
 * @typedef {LiquidColor[]} Flask
 */

const FLASK_SIZE = 5;

/**
 * @type {Flask[]}
 */
const gameData = [
  ["RED", "BLUE", "RED", "BLUE", "RED"],
  ["BLUE", "RED", "BLUE", "RED", "BLUE"],
  [],
];

let selectedFromFlask = 0;

/**
 * @param {Flask} from
 * @param {Flask} to
 * @return {void}
 */
function pour(from, to) {
  while (canPour(from, to)) {
    to.push(/** @type {LiquidColor} */ (from.pop()));
  }
}

/**
 * @param {Flask} from
 * @param {Flask} to
 * @return {boolean}
 */
function canPour(from, to) {
  return (
    to.length < FLASK_SIZE && (to.length === 0 || isSameColor(from, to.at(-1)))
  );
}

/**
 * @param {Flask} from
 * @param {LiquidColor} color
 * @return {boolean}
 */
function isSameColor(from, color) {
  return from.at(-1) === color;
}

function print() {
  //  outputEl.innerHTML = JSON.stringify(gameData, null, 2);
}

const outputEl = document.getElementById("output");
const flasksEl = document.getElementById("flasks");

print();

document.querySelector("form")?.addEventListener("submit", (evt) => {
  evt.preventDefault();
  evt.stopPropagation();

  const target = evt.target;
  const formData = new FormData(/** @type {HTMLFormElement} */ (target));

  const from = selectedFromFlask;
  const to = Number.parseInt(/** @type {string} */ (formData.get("to")));

  pour(gameData[from], gameData[to]);
  setFlaskOpen(null);
  print();
  updateFlasks();
});

document.querySelector("form").addEventListener("input", (evt) => {
  const target = /** @type {HTMLInputElement}*/ (evt.target);

  if (target.matches('input[type="radio"]')) {
    if (target.hasAttribute("aria-disabled")) {
      evt.preventDefault();
      evt.stopPropagation();
    }

    const inputSelector = `input[type="radio"][name="to"]`;

    document
      .querySelectorAll(inputSelector)
      .forEach((/** @type {HTMLInputElement}*/ input) => {
        input.toggleAttribute("aria-disabled", false);
      });

    /** @type {HTMLInputElement}*/ (
      document.querySelector(`${inputSelector}[value="${target.value}"]`)
    ).toggleAttribute("aria-disabled", true);
  }
});

/**
 * @param {number} flaskIndex
 * @returns {HTMLDivElement}
 */
function renderFlask(flaskDiv, flask, flaskIndex) {
  flaskDiv.replaceChildren();
  for (let i = FLASK_SIZE - 1; i >= 0; i--) {
    const segment = document.createElement("div");
    segment.classList.add("segment");
    segment.style.backgroundColor = flask[i];
    flaskDiv.appendChild(segment);
  }

  return flaskDiv;
}

function updateFlasks() {
  const flaskElems = Array.from(document.querySelectorAll(".flask"));
  for (let i = 0; i < gameData.length; i++) {
    renderFlask(flaskElems[i], gameData[i], i);
  }
}

/**
 * @param {number|null} flaskIndex
 */
function setFlaskOpen(flaskIndex) {
  selectedFromFlask = flaskIndex;
  document.querySelectorAll(".flask").forEach((flask, idx) => {
    if (idx === flaskIndex) {
      flask.classList.add("pouring");
    } else {
      flask.classList.remove("pouring");
    }
  });
}

function initializeFlasks() {
  for (let i = 0; i < gameData.length; i++) {
    const flaskDiv = document.createElement("div");
    flaskDiv.classList.add("flask");
    flaskDiv.addEventListener("click", () => {
      setFlaskOpen(i);
    });
    renderFlask(flaskDiv, gameData[i], i);

    flasksEl.appendChild(flaskDiv);
  }
}
initializeFlasks();

function isGameOver() {
  for (const flask of gameData) {
    const firstColor = flask[0];
    for (const color of flask) {
      if (color !== firstColor) {
        return false;
      }
    }
  }
  return true;
}

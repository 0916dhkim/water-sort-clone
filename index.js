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

const outputEl = document.getElementById("output");
const flasksEl = document.getElementById("flasks");

/**
 * @param {HTMLDivElement} flaskDiv
 * @param {Flask} flask
 */
function renderFlask(flaskDiv, flask) {
  flaskDiv.replaceChildren();
  for (let i = FLASK_SIZE - 1; i >= 0; i--) {
    const segment = document.createElement("div");
    segment.classList.add("segment");
    segment.style.backgroundColor = flask[i];
    flaskDiv.appendChild(segment);
  }

}

function updateFlasks() {
  const flaskElems = Array.from(document.querySelectorAll(".flask"));
  for (let i = 0; i < gameData.length; i++) {
    renderFlask(flaskElems[i], gameData[i], i);
  }
}

/**
 * Triggered when a flask is clicked
 *
 * @param {number} flaskIndex
 */
function selectFlask(flaskIndex) {

  if (selectedFromFlask === null) {
    // No flask is selected
    setFlaskOpen(flaskIndex);
  } else if (selectedFromFlask === flaskIndex) {
    // Close the flask
    setFlaskOpen(null);
  } else {
    // A different flask is selected, attempt to pour!
    pour(gameData[selectedFromFlask], gameData[flaskIndex]);
    setFlaskOpen(null);
    updateFlasks();
  }

}

/**
 * Marks a specific flask as 'pouring'. This tilts the flask.
 *
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
      selectFlask(i);
    });
    renderFlask(flaskDiv, gameData[i]);

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

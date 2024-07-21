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

const flasksContainer = document.getElementById("flasks");
const statusContainer = document.getElementById('status');

/**
 *
 * @param {'selected' | 'deselected' | 'pour' | 'failedToPour' | 'reset'} status
 * @param {number} [fromIndex]
 * @param {number} [toIndex]
 */
function updateStatus(status, fromIndex, toIndex) {
  switch (status) {
    case "selected":
      statusContainer.innerHTML = `Flask ${fromIndex + 1} selected.`;
      break;
    case "deselected":
      statusContainer.innerHTML = `Flask ${fromIndex + 1} deselected.`;
      break;
    case "pour":
      statusContainer.innerHTML = `Poured from Flask ${fromIndex + 1} to Flask ${toIndex + 1}.`;
      break;
    case "failedToPour":
      statusContainer.innerHTML = `Cannot pour from Flask ${fromIndex + 1} to Flask ${toIndex + 1}, select another flask.`;
      break;
    default:
      statusContainer.innerHTML = 'Select a flask.'
  }
}

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

/**
 * @param {HTMLElement} flaskElement
 * @param {Flask} flask
 */
function renderFlask(flaskElement, flask) {
  let list = flaskElement.querySelector("ol");

  if (!list) {
    list = document.createElement("ol");

    const description = document.createElement("span");

    description.classList.add('visually-hidden');
    description.innerHTML = `Flask ${Number.parseInt(flaskElement.dataset.index) + 1}, ${FLASK_SIZE} parts.`;

    flaskElement.appendChild(description);
  }

  list.replaceChildren();

  for (let i = FLASK_SIZE - 1; i >= 0; i--) {
    const segment = document.createElement("li");

    segment.classList.add("segment");
    segment.dataset.color = flask[i];
    segment.ariaLabel = flask[i] ?? 'No color';

    list.appendChild(segment);
  }

  flaskElement.appendChild(list);
}

function updateFlasks() {
  const flaskElements = /** @type {HTMLElement[]} */ (Array.from(document.querySelectorAll(".flask")));

  for (let i = 0; i < gameData.length; i++) {
    renderFlask(flaskElements[i], gameData[i]);
  }
}

/**
 * @param {HTMLElement} flaskElement
 */
function setFlaskOpen(flaskElement) {
  flaskElement.setAttribute("aria-pressed", "true");
  updateStatus("selected", Number.parseInt(flaskElement.dataset.index));
}

/**
 * @param {HTMLElement} flaskElement
*/
function setFlaskClosed(flaskElement) {
  flaskElement.setAttribute("aria-pressed", "false");
  updateStatus("deselected", Number.parseInt(flaskElement.dataset.index));
}

function setAllFlasksClosed() {
  flasksContainer.querySelectorAll('.flask').forEach((flaskElement) => {
    flaskElement.setAttribute("aria-pressed", "false");
  });
}

/**
 * @param {HTMLElement} flaskElement
 */
function selectFlask(flaskElement) {
  const fromFlaskElement = /** @type {HTMLElement} */(flasksContainer.querySelector('[aria-pressed="true"]'));

  if (!fromFlaskElement) {
    // No flask is selected
    setFlaskOpen(flaskElement);
  } else if (fromFlaskElement === flaskElement) {
    // Close the flask
    setFlaskClosed(flaskElement);
  } else {
    // A different flask is selected, atempt to pour!
    const fromIndex = Number.parseInt(fromFlaskElement.dataset.index);
    const toIndex = Number.parseInt(flaskElement.dataset.index);

    if (canPour(gameData[fromIndex], gameData[toIndex])) {
      updateStatus("pour", fromIndex, toIndex);
    } else {
      updateStatus("failedToPour", fromIndex, toIndex);
    }

    pour(gameData[fromIndex], gameData[toIndex]);
    setAllFlasksClosed();
    updateFlasks();
  }
}

function initializeFlasks() {
  for (let i = 0; i < gameData.length; i++) {
    const flaskElement = document.createElement("button");
    flaskElement.classList.add("flask");
    flaskElement.dataset.index = i.toString();
    setFlaskClosed(flaskElement);

    renderFlask(flaskElement, gameData[i]);

    flasksContainer.appendChild(flaskElement);
  }

  flasksContainer.addEventListener("click", (evt) => {
    const target = /** @type {HTMLElement} */(evt.target);

    if (target.matches(".flask")) {
      selectFlask(target);
    }
  });

  updateStatus("reset");
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

// @ts-check

/**
 * @typedef {'RED' | 'GREEN' | 'YELLOW' | 'BLUE' | 'ORANGE' | 'PURPLE'} LiquidColor
 */

/**
 * @typedef {LiquidColor[]} Flask
 */

/**
 * @typedef {object} Level
 *
 * @prop {Flask[]} state
 * @prop {number} flaskSize
 */
let currentLevel = Number.parseInt(localStorage.getItem("currentLevel") ?? "0");

/**
 * @type {Level[]}
 */
const levels = [
  {
    state: [
      ["RED", "BLUE", "RED", "BLUE", "RED"],
      ["BLUE", "RED", "BLUE", "RED", "BLUE"],
      [],
    ],
    flaskSize: 5,
  },
  {
    state: [
      ["BLUE", "GREEN"],
      ["GREEN", "GREEN", "BLUE"],
      ["BLUE", "GREEN", "BLUE"],
      [],
    ],
    flaskSize: 4,
  },
];

let gameData;
let flaskSize;

function loadLevel(index) {
  gameData = structuredClone(levels[index].state);
  flaskSize = levels[index].flaskSize;
  localStorage.setItem("currentLevel", currentLevel.toString());
}

const levelList = /** @type {HTMLOListElement} */ (
  document.getElementById("level-list")
);
const flasksContainer = /** @type {HTMLDivElement} */ (
  document.getElementById("flasks")
);
const statusContainer = document.getElementById("status");
const gameOverDialog = /** @type {HTMLDialogElement} */ (
  document.getElementById("game-over")
);
const selectLevelDialog = /** @type {HTMLDialogElement} */ (
  document.getElementById("level-select")
);

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
      statusContainer.innerHTML = `Poured from Flask ${
        fromIndex + 1
      } to Flask ${toIndex + 1}.`;
      break;
    case "failedToPour":
      statusContainer.innerHTML = `Cannot pour from Flask ${
        fromIndex + 1
      } to Flask ${toIndex + 1}, select another flask.`;
      break;
    default:
      statusContainer.innerHTML = "Select a flask.";
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
    to.length < flaskSize && (to.length === 0 || isSameColor(from, to.at(-1)))
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

    description.classList.add("visually-hidden");
    description.innerHTML = `Flask ${
      Number.parseInt(flaskElement.dataset.index) + 1
    }, ${flaskSize} parts.`;

    flaskElement.appendChild(description);
  }

  list.replaceChildren();

  for (let i = flaskSize - 1; i >= 0; i--) {
    const segment = document.createElement("li");

    segment.classList.add("segment");
    segment.dataset.color = flask[i];
    segment.ariaLabel = flask[i] ?? "No color";

    list.appendChild(segment);
  }

  flaskElement.appendChild(list);
}

function updateFlasks() {
  const flaskElements = /** @type {HTMLElement[]} */ (
    Array.from(document.querySelectorAll(".flask"))
  );

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
  flasksContainer.querySelectorAll(".flask").forEach((flaskElement) => {
    flaskElement.setAttribute("aria-pressed", "false");
  });
}

/**
 * @param {HTMLElement} flaskElement
 */
function selectFlask(flaskElement) {
  const fromFlaskElement = /** @type {HTMLElement} */ (
    flasksContainer.querySelector('[aria-pressed="true"]')
  );

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

  if (isGameOver()) {
    console.log("GAME IS OVER");

    gameOverDialog.showModal();
  }
}

flasksContainer.addEventListener("click", (evt) => {
  const target = /** @type {HTMLElement} */ (evt.target);

  if (target.matches(".flask")) {
    selectFlask(target);
  }
});

function initializeFlasks() {
  flasksContainer.innerHTML = "";

  for (let i = 0; i < gameData.length; i++) {
    const flaskElement = document.createElement("button");
    flaskElement.classList.add("flask");
    flaskElement.dataset.index = i.toString();
    setFlaskClosed(flaskElement);

    renderFlask(flaskElement, gameData[i]);

    flasksContainer.appendChild(flaskElement);
  }

  updateStatus("reset");
}

populateLevelList();
loadLevel(currentLevel);
initializeFlasks();

function isGameOver() {
  const flaskColors = [];

  for (const [index, flask] of gameData.entries()) {
    const firstColor = flask[0];

    if (flask.length !== 0 && flask.length !== flaskSize) {
      return false;
    }
    for (const color of flask) {
      if (color !== firstColor) {
        return false;
      }

      flaskColors[index] = firstColor;
    }
  }

  for (const [colorIndex, color] of flaskColors.entries()) {
    const testIndex = flaskColors.findIndex((testColor) => testColor === color);

    if (colorIndex !== testIndex) {
      return false;
    }
  }

  return true;
}

levelList.addEventListener("click", (evt) => {
  const target = /** @type {HTMLButtonElement} */ (evt.target);
  const newLevel = Number.parseInt(target.dataset.level);

  loadLevel(newLevel);
  initializeFlasks();
  selectLevelDialog.close();
});

function populateLevelList() {
  for (const [index] of levels.entries()) {
    const li = document.createElement("li");
    const button = document.createElement("button");
    button.innerHTML = `Level ${index}`;
    button.dataset.level = index.toString();
    li.appendChild(button);
    levelList.appendChild(li);
  }
}

document.getElementById("next-level-button")?.addEventListener("click", () => {
  if (levels.length - 1 === currentLevel) {
    // do nothing.
    return;
  }
  currentLevel += 1;
  loadLevel(currentLevel);
  initializeFlasks();
  gameOverDialog.close();
});

document
  .getElementById("select-level-button")
  ?.addEventListener("click", () => {
    gameOverDialog.close();
    selectLevelDialog.showModal();
  });

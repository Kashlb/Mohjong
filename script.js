
const handElement = document.getElementById("hand");
const groupsElement = document.getElementById("groups");
const discardElement = document.getElementById("discards");
const statusElement = document.getElementById("status");
const remainingElement = document.getElementById("remaining");

const suits = [
  { name: "Crack", type: "crack", dragon: "red", symbol: "中" },
  { name: "Bam", type: "bam", dragon: "green", symbol: "發" },
  { name: "Dot", type: "dot", dragon: "soap", symbol: "白" }
];

let deck = [];
let hand = [];
let groups = [];
let discards = [];
let selected = [];

function makeTile(suit, number) {
  return {
    id: Math.random().toString(36).slice(2),
    suit,
    number,
    dragon: false
  };
}

function makeDeck() {
  let tiles = [];

  suits.forEach(suit => {
    for (let number = 1; number <= 9; number++) {
      for (let copy = 0; copy < 4; copy++) {
        tiles.push(makeTile(suit.type, number));
      }
    }

    for (let copy = 0; copy < 4; copy++) {
      tiles.push({
        id: Math.random().toString(36).slice(2),
        suit: suit.dragon,
        number: suit.symbol,
        dragon: true,
        matches: suit.type
      });
    }
  });

  return tiles.sort(() => Math.random() - 0.5);
}

function newGame() {
  deck = makeDeck();
  hand = deck.splice(0, 13);
  groups = [];
  discards = [];
  selected = [];
  statusElement.textContent = "Select tiles to make groups!";
  render();
}

function drawTile() {
  if (!deck.length) {
    statusElement.textContent = "No tiles remaining!";
    return;
  }

  if (hand.length >= 14) {
    statusElement.textContent = "Discard a tile first!";
    return;
  }

  hand.push(deck.pop());
  statusElement.textContent = "Select a tile to discard.";
  render();
}

function selectTile(id) {
  if (selected.includes(id)) {
    selected = selected.filter(x => x !== id);
  } else {
    selected.push(id);
  }
  render();
}

function discardTile() {
  if (selected.length !== 1) {
    statusElement.textContent = "Select exactly one tile!";
    return;
  }

  const index = hand.findIndex(t => t.id === selected[0]);
  if (index === -1) return;

  discards.push(hand.splice(index, 1)[0]);
  selected = [];
  statusElement.textContent = "Tile discarded. Draw again!";
  render();
}

function isValidGroup(tiles) {
  if (tiles.length !== 4) return false;

  const dragons = tiles.filter(t => t.dragon);
  const numbers = tiles.filter(t => !t.dragon);

  if (dragons.length !== 1 || numbers.length !== 3) {
    return false;
  }

  const dragon = dragons[0];
  const suit = numbers[0].suit;

  if (numbers.some(t => t.suit !== suit)) return false;
  if (dragon.matches !== suit) return false;

  const values = numbers.map(t => t.number).sort((a, b) => a - b);

  const set = values.every(n => n === values[0]);

  const run =
    values[0] + 1 === values[1] &&
    values[1] + 1 === values[2];

  return set || run;
}

function checkGroups() {
  if (selected.length !== 4) {
    statusElement.textContent = "Select exactly 4 tiles!";
    return;
  }

  const chosen = hand.filter(t => selected.includes(t.id));

  if (!isValidGroup(chosen)) {
    statusElement.textContent =
      "Invalid group! Check the suit and matching dragon.";
    return;
  }

  groups.push(chosen);
  hand = hand.filter(t => !selected.includes(t.id));
  selected = [];

  statusElement.textContent = "Valid group! Great job!";
  render();
}

function tileHTML(tile, clickable = false) {
  const className = tile.dragon
    ? tile.suit
    : tile.suit;

  const label = tile.dragon
    ? tile.suit === "soap" ? "SOAP" : tile.suit.toUpperCase()
    : tile.suit.toUpperCase();

  return `
    <div class="tile ${className} ${
      selected.includes(tile.id) ? "selected" : ""
    }"
      ${clickable ? `onclick="selectTile('${tile.id}')"` : ""}>
      <span>${tile.number}</span>
      <small>${label}</small>
    </div>
  `;
}

function render() {
  handElement.innerHTML = hand.map(t => tileHTML(t, true)).join("");

  groupsElement.innerHTML = groups.map(group =>
    `<div class="group">${group.map(t => tileHTML(t)).join("")}</div>`
  ).join("");

  discardElement.innerHTML =
    discards.map(t => tileHTML(t)).join("");

  remainingElement.textContent = `Tiles remaining: ${deck.length}`;
}

document.getElementById("draw").onclick = drawTile;
document.getElementById("discard").onclick = discardTile;
document.getElementById("check").onclick = checkGroups;
document.getElementById("restart").onclick = newGame;

newGame();

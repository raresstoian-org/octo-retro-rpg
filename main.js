import confetti from 'canvas-confetti';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const hpEl = document.getElementById('hp');
const goldEl = document.getElementById('gold');
const floorEl = document.getElementById('floor');
const msgEl = document.getElementById('message');
const restartBtn = document.getElementById('restartBtn');

const GRID_SIZE = 10;
const TILE_SIZE = canvas.width / GRID_SIZE;

let state = {};

function randomEmptyCell() {
  while (true) {
    const x = Math.floor(Math.random() * GRID_SIZE);
    const y = Math.floor(Math.random() * GRID_SIZE);
    const occupied =
      (state.player.x === x && state.player.y === y) ||
      state.enemies.some((e) => e.x === x && e.y === y) ||
      state.coins.some((c) => c.x === x && c.y === y) ||
      (state.potion && state.potion.x === x && state.potion.y === y);
    if (!occupied) return { x, y };
  }
}

function spawnFloor() {
  state.enemies = [];
  state.coins = [];

  for (let i = 0; i < 3 + state.floor; i++) {
    const pos = randomEmptyCell();
    state.enemies.push({ x: pos.x, y: pos.y, hp: 2 });
  }

  for (let i = 0; i < 4; i++) {
    state.coins.push(randomEmptyCell());
  }

  state.potion = randomEmptyCell();
}

function initGame() {
  state = {
    player: { x: 0, y: 0, hp: 10 },
    gold: 0,
    floor: 1,
    gameOver: false,
    enemies: [],
    coins: [],
    potion: null
  };
  spawnFloor();
  setMessage('Collect all gold coins! Bump red enemies to fight.');
  draw();
}

function setMessage(text) {
  msgEl.textContent = text;
}

function movePlayer(dx, dy) {
  if (state.gameOver) return;

  const nx = state.player.x + dx;
  const ny = state.player.y + dy;

  if (nx < 0 || nx >= GRID_SIZE || ny < 0 || ny >= GRID_SIZE) return;

  const enemyIdx = state.enemies.findIndex((e) => e.x === nx && e.y === ny);
  if (enemyIdx !== -1) {
    const enemy = state.enemies[enemyIdx];
    enemy.hp -= 1;
    state.player.hp -= 1;

    if (enemy.hp <= 0) {
      state.enemies.splice(enemyIdx, 1);
      state.gold += 2;
      setMessage('Defeated monster! (+2 Gold)');
    } else {
      setMessage(`Hit monster! Monster HP: ${enemy.hp}`);
    }

    if (state.player.hp <= 0) {
      state.player.hp = 0;
      state.gameOver = true;
      setMessage('GAME OVER! Press Restart to play again.');
    }
    draw();
    return;
  }

  state.player.x = nx;
  state.player.y = ny;

  const coinIdx = state.coins.findIndex((c) => c.x === nx && c.y === ny);
  if (coinIdx !== -1) {
    state.coins.splice(coinIdx, 1);
    state.gold += 5;
    setMessage('Picked up a gold coin! (+5 Gold)');
  }

  if (state.potion && state.potion.x === nx && state.potion.y === ny) {
    state.potion = null;
    state.player.hp = Math.min(10, state.player.hp + 3);
    setMessage('Drank potion! (+3 HP)');
  }

  if (state.coins.length === 0) {
    state.floor += 1;
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    spawnFloor();
    setMessage(`Floor cleared! Welcome to Floor ${state.floor}!`);
  }

  draw();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw grid lines
  ctx.strokeStyle = '#2a2a2a';
  for (let i = 0; i <= GRID_SIZE; i++) {
    ctx.beginPath();
    ctx.moveTo(i * TILE_SIZE, 0);
    ctx.lineTo(i * TILE_SIZE, canvas.height);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, i * TILE_SIZE);
    ctx.lineTo(canvas.width, i * TILE_SIZE);
    ctx.stroke();
  }

  // Draw potion (cyan square)
  if (state.potion) {
    ctx.fillStyle = '#0ff';
    ctx.fillRect(
      state.potion.x * TILE_SIZE + 8,
      state.potion.y * TILE_SIZE + 8,
      TILE_SIZE - 16,
      TILE_SIZE - 16
    );
  }

  // Draw coins (yellow circles)
  ctx.fillStyle = '#ff0';
  for (const c of state.coins) {
    ctx.beginPath();
    ctx.arc(
      c.x * TILE_SIZE + TILE_SIZE / 2,
      c.y * TILE_SIZE + TILE_SIZE / 2,
      TILE_SIZE / 4,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  // Draw enemies (red blocks)
  ctx.fillStyle = '#f33';
  for (const e of state.enemies) {
    ctx.fillRect(
      e.x * TILE_SIZE + 4,
      e.y * TILE_SIZE + 4,
      TILE_SIZE - 8,
      TILE_SIZE - 8
    );
  }

  // Draw player (green block)
  ctx.fillStyle = '#0f0';
  ctx.fillRect(
    state.player.x * TILE_SIZE + 4,
    state.player.y * TILE_SIZE + 4,
    TILE_SIZE - 8,
    TILE_SIZE - 8
  );

  hpEl.textContent = state.player.hp;
  goldEl.textContent = state.gold;
  floorEl.textContent = state.floor;
}

window.addEventListener('keydown', (e) => {
  switch (e.key) {
    case 'ArrowUp':
    case 'w':
    case 'W':
      e.preventDefault();
      movePlayer(0, -1);
      break;
    case 'ArrowDown':
    case 's':
    case 'S':
      e.preventDefault();
      movePlayer(0, 1);
      break;
    case 'ArrowLeft':
    case 'a':
    case 'A':
      e.preventDefault();
      movePlayer(-1, 0);
      break;
    case 'ArrowRight':
    case 'd':
    case 'D':
      e.preventDefault();
      movePlayer(1, 0);
      break;
  }
});

restartBtn.addEventListener('click', initGame);

initGame();

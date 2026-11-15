// Entry Point: Aqua Dash - Bioluminescent Odyssey (Phaser 4 + Three.js Dual Engine)
import './style.css';
import { Ocean3DScene } from './engine/three-background.js';
import { PhaserGameEngine } from './engine/phaser-game.js';
import { sound } from './engine/audio.js';

// DOM Elements
const bgCanvas = document.getElementById('bg-canvas');
const gameCanvas = document.getElementById('game-canvas');

const scoreDisplay = document.getElementById('score-display');
const pearlStat = document.getElementById('pearl-stat');
const rockStat = document.getElementById('rock-stat');
const bestScoreDisplay = document.getElementById('best-score');
const staminaBarFill = document.getElementById('stamina-fill');
const fishIcons = document.querySelectorAll('.fish-icon');

const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const btnStart = document.getElementById('btn-start');
const btnRestart = document.getElementById('btn-restart');
const btnMute = document.getElementById('btn-mute');
const mobileDashBtn = document.getElementById('mobile-dash-btn');

const finalScore = document.getElementById('final-score');
const finalPearls = document.getElementById('final-pearls');
const finalRocks = document.getElementById('final-rocks');
const finalBest = document.getElementById('final-best');
const newRecordBadge = document.getElementById('new-record-badge');

// 1. Khởi tạo Three.js và Game Engine
const ocean3D = new Ocean3DScene(bgCanvas);

let prevHighScore = parseInt(localStorage.getItem('aquadash_highscore') || '0', 10);
bestScoreDisplay.textContent = prevHighScore;

const game = new PhaserGameEngine(gameCanvas, (uiState) => {
  // Cập nhật DOM theo trạng thái Game
  scoreDisplay.textContent = uiState.score;
  pearlStat.textContent = uiState.pearlCount;
  rockStat.textContent = uiState.brokenRocksCount;
  bestScoreDisplay.textContent = uiState.highScore;

  // Cập nhật biểu tượng đàn cá AI hộ mệnh
  fishIcons.forEach((icon, idx) => {
    if (idx < uiState.flockCount) {
      icon.classList.remove('lost');
    } else {
      icon.classList.add('lost');
    }
  });

  // Cập nhật thanh Stamina
  staminaBarFill.style.width = `${Math.max(0, Math.min(100, uiState.stamina))}%`;

  // Màn hình Game Over
  if (uiState.state === 'GAMEOVER') {
    gameOverScreen.classList.remove('hidden');
    gameOverScreen.style.display = 'flex';
    finalScore.textContent = uiState.score;
    finalPearls.textContent = uiState.pearlCount;
    finalRocks.textContent = uiState.brokenRocksCount;
    finalBest.textContent = uiState.highScore;

    if (uiState.score > prevHighScore) {
      newRecordBadge.style.display = 'inline-block';
      prevHighScore = uiState.score;
    } else {
      newRecordBadge.style.display = 'none';
    }
  } else if (uiState.state === 'PLAYING') {
    gameOverScreen.classList.add('hidden');
    gameOverScreen.style.display = 'none';
    startScreen.classList.add('hidden');
    startScreen.style.display = 'none';
  }
});

// Hàm khởi động trò chơi an toàn
function triggerStart() {
  try {
    sound.ensureContext();
  } catch (err) {
    console.warn('Lỗi Audio:', err);
  }
  startScreen.classList.add('hidden');
  startScreen.style.display = 'none';
  game.start();
}

function triggerRestart() {
  try {
    sound.ensureContext();
  } catch (err) {
    console.warn('Lỗi Audio:', err);
  }
  gameOverScreen.classList.add('hidden');
  gameOverScreen.style.display = 'none';
  game.start();
}

// 2. Sự kiện tương tác UI
btnStart.addEventListener('click', (e) => {
  e.preventDefault();
  triggerStart();
});

btnRestart.addEventListener('click', (e) => {
  e.preventDefault();
  triggerRestart();
});

// Hỗ trợ phím tắt bàn phím toàn cục
window.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    e.preventDefault();
    if (game.state === 'MENU') {
      triggerStart();
    } else if (game.state === 'GAMEOVER') {
      triggerRestart();
    } else if (game.state === 'PLAYING') {
      game.handleSwimInput();
    }
  } else if (e.code === 'ShiftLeft' || e.code === 'ShiftRight' || e.code === 'KeyD') {
    if (game.state === 'PLAYING') {
      e.preventDefault();
      game.handleDashInput();
    }
  }
});

// Hỗ trợ click chuột trực tiếp
window.addEventListener('mousedown', (e) => {
  if (game.state === 'PLAYING') {
    if (e.button === 0) {
      game.handleSwimInput();
    } else if (e.button === 2) {
      e.preventDefault();
      game.handleDashInput();
    }
  }
});

window.addEventListener('contextmenu', (e) => {
  if (game.state === 'PLAYING') {
    e.preventDefault();
  }
});

btnMute.addEventListener('click', () => {
  const isMuted = sound.toggleMute();
  btnMute.textContent = isMuted ? '🔇' : '🔊';
});

if (mobileDashBtn) {
  mobileDashBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    game.handleDashInput();
  });
}

// 3. Vòng lặp chính (Dual-Engine Main Loop)
let lastTime = performance.now();

function animate(currentTime) {
  const dt = Math.min((currentTime - lastTime) / 1000, 0.05); // Cap delta time
  lastTime = currentTime;

  // Tọa độ chuẩn hóa của cá để đèn Three.js bám theo
  const normX = game.player.x / window.innerWidth;
  const normY = game.player.y / window.innerHeight;

  // Cập nhật Three.js Background
  ocean3D.update(dt, { x: normX, y: normY }, game.player.isDashing);

  // Cập nhật & Vẽ Game 2D
  game.update(dt);
  game.draw();

  requestAnimationFrame(animate);
}

requestAnimationFrame(animate);


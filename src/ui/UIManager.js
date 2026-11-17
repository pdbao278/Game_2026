import { globalEventBus } from '../core/EventBus.js';

/**
 * UIManager - Quản lý toàn bộ giao diện DOM HUD đè lên WebGL Canvas
 * Giữ nguyên 100% phong cách Neo-Arcade Cosmic từ preview_ui.html
 */
export class UIManager {
  constructor() {
    this.initElements();
    this.bindEvents();
  }

  initElements() {
    // Màn hình Start Menu
    this.screenStart = document.getElementById('screen-start');
    this.btnPlay = document.getElementById('btn-play');

    // Màn hình Game Over
    this.screenGameOver = document.getElementById('screen-gameover');
    this.btnRestart = document.getElementById('btn-restart');
    this.goScoreNum = document.getElementById('go-score-num');
    this.goHighNum = document.getElementById('go-high-num');
    this.goCrystalsNum = document.getElementById('go-crystals-num');
    this.goNearMissNum = document.getElementById('go-nearmiss-num');

    // Lớp HUD In-game
    this.hudLayer = document.getElementById('hud-layer');
    this.scoreNum = document.getElementById('hud-score-num');
    this.phaseIndicator = document.getElementById('hud-phase-indicator');
    this.phaseName = document.getElementById('hud-phase-name');
    this.hearts = document.querySelectorAll('.heart-svg');

    // Hyper-Drive bar
    this.hyperFill = document.getElementById('hud-hyper-fill');
    this.hyperStatus = document.getElementById('hud-hyper-status');

    // Near-Miss Toast
    this.nearMissToast = document.getElementById('near-miss-popup');
    this.nearMissTimer = null;
  }

  bindEvents() {
    // 1. Lắng nghe sự kiện từ EventBus
    globalEventBus.on('phase-changed', (data) => {
      this.updatePhase(data.phase);
    });

    globalEventBus.on('player-damage', (data) => {
      this.updateHearts(data.health);
    });

    globalEventBus.on('player-heal', (data) => {
      this.updateHearts(data.health);
    });

    globalEventBus.on('score-updated', (data) => {
      this.updateScore(data.score);
    });

    globalEventBus.on('hyper-updated', (data) => {
      this.updateHyperDrive(data.percent, data.isHyperActive);
    });

    globalEventBus.on('near-miss', (data) => {
      this.showNearMissToast(data.pts || 250);
    });

    globalEventBus.on('game-over', (data) => {
      this.showGameOver(data);
    });

    // 2. Tương tác nút trên giao diện
    if (this.btnPlay) {
      this.btnPlay.addEventListener('click', () => {
        globalEventBus.emit('start-game');
      });
    }

    if (this.btnRestart) {
      this.btnRestart.addEventListener('click', () => {
        globalEventBus.emit('restart-game');
      });
    }

    // Click vào thanh Phase trên HUD để đổi pha tiện lợi
    if (this.phaseIndicator) {
      this.phaseIndicator.addEventListener('click', () => {
        globalEventBus.emit('request-phase-switch');
      });
    }
  }

  /**
   * Cập nhật hiển thị màu và nhãn Pha năng lượng
   * @param {'CYAN'|'ORANGE'} phase 
   */
  updatePhase(phase) {
    if (!this.phaseIndicator) return;

    if (phase === 'CYAN') {
      this.phaseIndicator.classList.remove('orange');
      this.phaseIndicator.classList.add('cyan');
      if (this.phaseName) {
        this.phaseName.textContent = 'PHASE 01 // CRYO-CYAN';
      }
    } else {
      this.phaseIndicator.classList.remove('cyan');
      this.phaseIndicator.classList.add('orange');
      if (this.phaseName) {
        this.phaseName.textContent = 'PHASE 02 // THERMO-ORANGE';
      }
    }
  }

  /**
   * Cập nhật 3 trái tim sinh lực (3 HP)
   * @param {number} health Số HP hiện tại (0..3)
   */
  updateHearts(health) {
    if (!this.hearts) return;
    this.hearts.forEach((heart, idx) => {
      if (idx < health) {
        heart.classList.remove('lost');
      } else {
        heart.classList.add('lost');
      }
    });
  }

  /**
   * Cập nhật điểm số hiển thị
   * @param {number} score Điểm số
   */
  updateScore(score) {
    if (!this.scoreNum) return;
    this.scoreNum.textContent = score.toLocaleString('en-US');
  }

  /**
   * Cập nhật tiến độ thanh nạp Hyper-Drive
   * @param {number} percent Phần trăm nạp (0..100)
   * @param {boolean} isActive Đang kích hoạt hay không
   */
  updateHyperDrive(percent, isActive = false) {
    if (!this.hyperFill) return;
    const clamped = Math.max(0, Math.min(100, percent));
    this.hyperFill.style.width = `${clamped}%`;

    if (clamped >= 100 || isActive) {
      this.hyperFill.classList.add('full');
      if (this.hyperStatus) this.hyperStatus.textContent = 'HYPER-DRIVE SẴN SÀNG!';
    } else {
      this.hyperFill.classList.remove('full');
      if (this.hyperStatus) this.hyperStatus.textContent = `${Math.round(clamped)}%`;
    }
  }

  /**
   * Hiển thị popup toast thông báo Né Sát (Near-Miss)
   */
  showNearMissToast(pts = 250) {
    if (!this.nearMissToast) return;
    clearTimeout(this.nearMissTimer);

    this.nearMissToast.style.display = 'flex';
    this.nearMissToast.style.opacity = '1';
    this.nearMissToast.style.transform = 'translateY(0) scale(1.05)';

    this.nearMissTimer = setTimeout(() => {
      this.nearMissToast.style.opacity = '0';
      this.nearMissToast.style.transform = 'translateY(-12px) scale(0.95)';
      setTimeout(() => {
        this.nearMissToast.style.display = 'none';
      }, 300);
    }, 1500);
  }

  /**
   * Ẩn Start Menu khi bấm BẮT ĐẦU
   */
  hideStartScreen() {
    if (this.screenStart) {
      this.screenStart.classList.add('hidden');
    }
  }

  /**
   * Hiện Game Over
   */
  showGameOver(stats = {}) {
    if (this.screenGameOver) {
      if (this.goScoreNum) this.goScoreNum.textContent = (stats.score || 0).toLocaleString('en-US');
      if (this.goHighNum) this.goHighNum.textContent = (stats.highScore || 0).toLocaleString('en-US');
      if (this.goCrystalsNum) this.goCrystalsNum.textContent = stats.crystals || 0;
      if (this.goNearMissNum) this.goNearMissNum.textContent = stats.nearMisses || 0;

      this.screenGameOver.classList.remove('hidden');
    }
  }

  /**
   * Ẩn Game Over khi bấm CHƠI LẠI
   */
  hideGameOver() {
    if (this.screenGameOver) {
      this.screenGameOver.classList.add('hidden');
    }
  }
}


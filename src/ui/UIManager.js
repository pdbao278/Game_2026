import { globalEventBus } from '../core/EventBus.js';

/**
 * UIManager - Quản lý toàn bộ giao diện DOM HUD đè lên WebGL Canvas
 * Giữ nguyên 100% phong cách Neo-Arcade Cosmic từ preview_ui.html
 */
export class UIManager {
  constructor(audioManager) {
    this.audioManager = audioManager;
    this.toastTimer = null;
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
    this.hearts = [
      document.getElementById('heart1'),
      document.getElementById('heart2'),
      document.getElementById('heart3')
    ];

    // Hyper-Drive bar
    this.hyperFill = document.getElementById('hud-hyper-fill');
    this.hyperStatus = document.getElementById('hud-hyper-status');

    // Near-Miss Toast & Thông báo nổi Toast
    this.nearMissToast = document.getElementById('near-miss-popup');
    this.nearMissTimer = null;
    this.toastEl = document.getElementById('toast');

    // Thanh điều hướng nhanh nổi
    this.navBar = document.getElementById('nav-bar') || document.querySelector('.nav-bar');
    this.btnToggleLane = document.getElementById('btnToggleLane');
    this.laneLabel = document.getElementById('laneLabel');
    this.btnToggleShip = document.getElementById('btnToggleShip');
    this.btnBgm = document.getElementById('btnBgm');
    this.bgmLabel = document.getElementById('bgmLabel');
  }

  bindEvents() {
    // 1. Lắng nghe sự kiện từ EventBus
    globalEventBus.on('phase-changed', (data) => {
      this.updatePhase(data.phase);
    });

    globalEventBus.on('player-damage', (data) => {
      this.updateHearts(data.health);
      this.triggerScreenShake();
      this.triggerDamageFlash();
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

    globalEventBus.on('toast', (data) => {
      this.showToast(data.text, data.type || 'gold');
    });

    globalEventBus.on('game-over', (data) => {
      this.showGameOver(data);
    });

    // 2. Tương tác nút trên giao diện
    if (this.btnPlay) {
      this.btnPlay.addEventListener('click', () => {
        if (this.audioManager) {
          this.audioManager.playSFX('sfxClick');
          this.audioManager.startBGM();
        }
        globalEventBus.emit('start-game');
      });
    }

    if (this.btnRestart) {
      this.btnRestart.addEventListener('click', () => {
        if (this.audioManager) this.audioManager.playSFX('sfxClick');
        globalEventBus.emit('restart-game');
      });
    }

    // Click vào thanh Phase trên HUD để đổi pha tiện lợi
    if (this.phaseIndicator) {
      this.phaseIndicator.addEventListener('click', () => {
        globalEventBus.emit('request-phase-switch');
      });
    }

    // Đổi 5 Làn / 3 Làn
    if (this.btnToggleLane) {
      this.btnToggleLane.addEventListener('click', () => {
        globalEventBus.emit('request-lane-toggle');
      });
    }

    // Đổi Phi thuyền Chibi / Racer
    if (this.btnToggleShip) {
      this.btnToggleShip.addEventListener('click', () => {
        globalEventBus.emit('request-ship-toggle');
      });
    }

    // Bật / Tắt BGM
    if (this.btnBgm && this.audioManager) {
      this.btnBgm.addEventListener('click', () => {
        const isPlaying = this.audioManager.toggleBGM();
        if (isPlaying) {
          this.btnBgm.classList.add('playing');
          if (this.bgmLabel) this.bgmLabel.textContent = 'Dừng Nhạc';
        } else {
          this.btnBgm.classList.remove('playing');
          if (this.bgmLabel) this.bgmLabel.textContent = 'Nhạc Nền';
        }
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
      if (heart) {
        if (idx < health) {
          heart.classList.remove('lost');
        } else {
          heart.classList.add('lost');
        }
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
      if (this.hyperStatus) this.hyperStatus.textContent = 'SẴN SÀNG!';
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
    this.nearMissToast.style.transform = 'translate(-50%, -50%) scale(1.05)';

    this.nearMissTimer = setTimeout(() => {
      this.nearMissToast.style.opacity = '0';
      this.nearMissToast.style.transform = 'translate(-50%, -50%) scale(0.95)';
      setTimeout(() => {
        this.nearMissToast.style.display = 'none';
      }, 300);
    }, 1200);
  }

  /**
   * Hiển thị thông báo nổi Toast
   * @param {string} text Nội dung
   * @param {'gold'|'pink'|'cyan'|'orange'} type Loại màu
   */
  showToast(text, type = 'gold') {
    if (!this.toastEl) return;
    clearTimeout(this.toastTimer);
    this.toastEl.textContent = text;
    this.toastEl.className = `toast ${type} show`;
    this.toastTimer = setTimeout(() => {
      this.toastEl.classList.remove('show');
    }, 900);
  }

  /**
   * Rung màn hình khi bị va chạm
   */
  triggerScreenShake() {
    const viewport = document.getElementById('viewport');
    if (viewport) {
      viewport.style.transform = 'translateX(4px) translateY(-3px)';
      setTimeout(() => { viewport.style.transform = 'translateX(-4px) translateY(3px)'; }, 50);
      setTimeout(() => { viewport.style.transform = 'translateX(2px) translateY(-2px)'; }, 100);
      setTimeout(() => { viewport.style.transform = 'none'; }, 150);
    }
  }

  /**
   * Chớp đỏ toàn màn hình khi bị trừ máu (Damage Vignette Flash)
   */
  triggerDamageFlash() {
    const flashEl = document.getElementById('damageFlash');
    if (flashEl) {
      flashEl.classList.add('active');
      setTimeout(() => {
        flashEl.classList.remove('active');
      }, 250);
    }
  }

  /**
   * Ẩn Start Menu khi bấm BẮT ĐẦU và mở HUD in-game
   */
  hideStartScreen() {
    if (this.screenStart) {
      this.screenStart.classList.add('hidden');
    }
    if (this.hudLayer) {
      this.hudLayer.classList.remove('hidden');
    }
    if (this.navBar) {
      this.navBar.classList.remove('hidden');
    }
  }

  /**
   * Hiện Game Over
   */
  showGameOver(stats = {}) {
    if (this.hudLayer) {
      this.hudLayer.classList.add('hidden');
    }
    if (this.navBar) {
      this.navBar.classList.add('hidden');
    }
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
    if (this.hudLayer) {
      this.hudLayer.classList.remove('hidden');
    }
    if (this.navBar) {
      this.navBar.classList.remove('hidden');
    }
  }
}

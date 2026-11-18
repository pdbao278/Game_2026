import { globalEventBus } from './EventBus.js';

/**
 * GameState - Quản lý máy trạng thái, điểm số, tốc độ và kỷ lục
 */
export class GameState {
  constructor() {
    this.status = 'START'; // 'START' | 'PLAYING' | 'GAMEOVER'
    this.score = 0;
    this.highScore = 0;
    this.survivalScoreAcc = 0;

    // Tốc độ thế giới
    this.baseSpeed = 25.0;
    this.worldSpeed = 25.0;
    this.speedAcceleration = 0.35; // Tăng dần theo giây
    this.playTime = 0;

    // Thống kê vòng chơi
    this.crystalsCollected = 0;
    this.nearMissCount = 0;

    // Hyper-Drive
    this.hyperPercent = 0;
    this.isHyperActive = false;
    this.hyperDuration = 6.0; // 6 giây
    this.hyperTimer = 0;

    // Nhân đôi điểm (Resonance Buff)
    this.scoreMultiplier = 1;
    this.multiplierTimer = 0;

    this.loadHighScore();
  }

  loadHighScore() {
    try {
      if (typeof localStorage !== 'undefined') {
        const saved = localStorage.getItem('void_shift_high_score');
        if (saved) {
          this.highScore = parseInt(saved, 10) || 0;
        }
      }
    } catch (e) {
      this.highScore = 0;
    }
  }

  saveHighScore() {
    if (this.score > this.highScore) {
      this.highScore = this.score;
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('void_shift_high_score', this.highScore.toString());
        }
      } catch (e) {}
    }
  }

  start() {
    this.status = 'PLAYING';
    this.score = 0;
    this.survivalScoreAcc = 0;
    this.playTime = 0;
    this.worldSpeed = this.baseSpeed;
    this.crystalsCollected = 0;
    this.nearMissCount = 0;
    this.hyperPercent = 0;
    this.isHyperActive = false;
    this.hyperTimer = 0;
    this.scoreMultiplier = 1;
    this.multiplierTimer = 0;

    globalEventBus.emit('score-updated', { score: this.score });
    globalEventBus.emit('hyper-updated', { percent: this.hyperPercent, isHyperActive: false });
  }

  pause() {
    if (this.status === 'PLAYING') {
      this.status = 'PAUSED';
      globalEventBus.emit('game-paused');
      return true;
    }
    return false;
  }

  resume() {
    if (this.status === 'PAUSED') {
      this.status = 'PLAYING';
      globalEventBus.emit('game-resumed');
      return true;
    }
    return false;
  }

  togglePause() {
    if (this.status === 'PLAYING') {
      return this.pause();
    } else if (this.status === 'PAUSED') {
      return this.resume();
    }
    return false;
  }

  addCrystalScore() {
    const pts = 100 * this.scoreMultiplier;
    this.score += pts;
    this.crystalsCollected++;
    this.addHyperPercent(8);
    globalEventBus.emit('score-updated', { score: this.score });
  }

  addNearMissScore() {
    const pts = 250 * this.scoreMultiplier;
    this.score += pts;
    this.nearMissCount++;
    this.addHyperPercent(15);
    globalEventBus.emit('score-updated', { score: this.score });
    globalEventBus.emit('near-miss', { pts });
  }

  addHyperPercent(amount) {
    if (this.isHyperActive) return;

    this.hyperPercent = Math.min(100, this.hyperPercent + amount);
    if (this.hyperPercent >= 100) {
      this.activateHyperDrive();
    } else {
      globalEventBus.emit('hyper-updated', { percent: this.hyperPercent, isHyperActive: false });
    }
  }

  activateHyperDrive() {
    this.isHyperActive = true;
    this.hyperTimer = this.hyperDuration;
    this.worldSpeed = (this.baseSpeed + this.playTime * this.speedAcceleration) * 1.8;
    globalEventBus.emit('hyper-updated', { percent: 100, isHyperActive: true });
    globalEventBus.emit('hyper-start');
  }

  deactivateHyperDrive() {
    this.isHyperActive = false;
    this.hyperTimer = 0;
    this.hyperPercent = 0;
    this.worldSpeed = this.baseSpeed + this.playTime * this.speedAcceleration;
    globalEventBus.emit('hyper-updated', { percent: 0, isHyperActive: false });
    globalEventBus.emit('hyper-end');
  }

  activateScoreMultiplier(multiplier = 2, duration = 8.0) {
    this.scoreMultiplier = multiplier;
    this.multiplierTimer = duration;
    globalEventBus.emit('multiplier-updated', { multiplier, duration });
  }

  triggerGameOver() {
    this.status = 'GAMEOVER';
    this.saveHighScore();
    globalEventBus.emit('game-over', {
      score: this.score,
      highScore: this.highScore,
      crystals: this.crystalsCollected,
      nearMisses: this.nearMissCount
    });
  }

  update(deltaTime) {
    if (this.status !== 'PLAYING') return;

    this.playTime += deltaTime;

    // 1. Tăng điểm sinh tồn (10 điểm / giây)
    this.survivalScoreAcc += deltaTime * 10;
    if (this.survivalScoreAcc >= 1) {
      const wholePts = Math.floor(this.survivalScoreAcc);
      this.score += wholePts * this.scoreMultiplier;
      this.survivalScoreAcc -= wholePts;
      globalEventBus.emit('score-updated', { score: this.score });
    }

    // 2. Cập nhật đếm ngược Hyper-Drive
    if (this.isHyperActive) {
      this.hyperTimer -= deltaTime;
      if (this.hyperTimer <= 0) {
        this.deactivateHyperDrive();
      }
    } else {
      // Gia tốc tốc độ thế giới theo thời gian chơi
      this.worldSpeed = this.baseSpeed + this.playTime * this.speedAcceleration;
    }

    // 3. Cập nhật nhân đôi điểm
    if (this.multiplierTimer > 0) {
      this.multiplierTimer -= deltaTime;
      if (this.multiplierTimer <= 0) {
        this.scoreMultiplier = 1;
        globalEventBus.emit('multiplier-updated', { multiplier: 1, duration: 0 });
      }
    }
  }
}


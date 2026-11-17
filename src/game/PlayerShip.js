import { PlayerShipState } from './PlayerShipState.js';
import { globalEventBus } from '../core/EventBus.js';

/**
 * PlayerShip - Đại diện cho phi thuyền của người chơi
 * Quản lý hiển thị Chibi / Racer, vệt lửa phản lực, ánh sáng phát quang theo pha và chuyển động
 */
export class PlayerShip {
  constructor(laneSystem, audioManager) {
    this.laneSystem = laneSystem;
    this.audioManager = audioManager;
    this.state = new PlayerShipState();

    this.container = document.getElementById('playerShipContainer');
    this.shipImg = document.getElementById('playerShipImg');
    this.thruster = document.getElementById('playerThruster');
    this.trace = document.getElementById('playerTrace');

    this.currentModel = 'chibi'; // 'chibi' | 'racer'
    this.tiltTimeout = null;

    this.init();
  }

  init() {
    if (this.container) {
      this.container.style.left = this.laneSystem.getPercentX();
      this.container.className = 'player-ship-container phase-cyan';
    }
  }

  /**
   * Chuyển làn sang trái
   */
  moveLeft() {
    if (this.laneSystem.moveLeft()) {
      this.state.targetX = this.laneSystem.getTargetX();
      this.applyLanePosition(-10);
      if (this.audioManager) this.audioManager.playSFX('sfxClick');
      globalEventBus.emit('player-lane-change', {
        laneIndex: this.laneSystem.currentLaneIndex,
        targetX: this.state.targetX
      });
      return true;
    }
    return false;
  }

  /**
   * Chuyển làn sang phải
   */
  moveRight() {
    if (this.laneSystem.moveRight()) {
      this.state.targetX = this.laneSystem.getTargetX();
      this.applyLanePosition(10);
      if (this.audioManager) this.audioManager.playSFX('sfxClick');
      globalEventBus.emit('player-lane-change', {
        laneIndex: this.laneSystem.currentLaneIndex,
        targetX: this.state.targetX
      });
      return true;
    }
    return false;
  }

  /**
   * Cập nhật vị trí và góc nghiêng thân tàu
   */
  applyLanePosition(tiltAngle) {
    if (!this.container) return;
    this.container.style.left = this.laneSystem.getPercentX();
    this.container.style.transform = `translateX(-50%) rotate(${tiltAngle}deg)`;

    clearTimeout(this.tiltTimeout);
    this.tiltTimeout = setTimeout(() => {
      if (this.container) {
        this.container.style.transform = 'translateX(-50%) rotate(0deg)';
      }
    }, 200);
  }

  /**
   * Đổi trạng thái năng lượng giữa CYAN và ORANGE
   */
  switchPhase() {
    if (this.state.switchPhase()) {
      const isCyan = this.state.phase === 'CYAN';
      if (this.container) {
        this.container.className = `player-ship-container phase-${isCyan ? 'cyan' : 'orange'}`;
      }
      if (this.audioManager) this.audioManager.playSFX('sfxPhase');

      globalEventBus.emit('phase-changed', {
        phase: this.state.phase,
        color: isCyan ? '#00F5FF' : '#FF7700'
      });
      return true;
    }
    return false;
  }

  /**
   * Đổi qua lại giữa mẫu tàu Chibi và mẫu tàu Racer 3D
   */
  toggleModel() {
    if (!this.shipImg) return;
    if (this.currentModel === 'chibi') {
      this.currentModel = 'racer';
      this.shipImg.src = 'assets/models/Isometric/craft_racer_SE.png';
      if (this.audioManager) this.audioManager.playSFX('sfxClick');
      globalEventBus.emit('toast', { text: '🚀 PHI THUYỀN RACER (KENNEY 3D)', type: 'cyan' });
    } else {
      this.currentModel = 'chibi';
      this.shipImg.src = 'asset_new/ship_chibi.png';
      if (this.audioManager) this.audioManager.playSFX('sfxClick');
      globalEventBus.emit('toast', { text: '🧸 PHI THUYỀN CHIBI (NEO-COSMIC)', type: 'gold' });
    }
  }

  /**
   * Xử lý mất máu
   */
  takeDamage(amount = 1) {
    if (this.state.takeDamage(amount)) {
      if (this.audioManager) this.audioManager.playSFX('sfxCrash');
      globalEventBus.emit('player-damage', {
        health: this.state.health,
        maxHealth: this.state.maxHealth
      });
      return true;
    }
    return false;
  }

  /**
   * Hồi máu
   */
  heal(amount = 1) {
    this.state.heal(amount);
    if (this.audioManager) this.audioManager.playSFX('sfxScore');
    globalEventBus.emit('player-heal', {
      health: this.state.health,
      maxHealth: this.state.maxHealth
    });
  }

  /**
   * Cập nhật trạng thái bất tử nhấp nháy mỗi khung hình
   */
  update(deltaTime) {
    this.state.updateState(deltaTime);

    if (this.container) {
      if (this.state.isInvincible) {
        const blink = Math.sin(this.state.invincibleTimer * 30) > 0;
        this.container.style.opacity = blink ? '0.3' : '1.0';
      } else {
        this.container.style.opacity = '1.0';
      }
    }
  }

  reset() {
    this.state.reset();
    this.laneSystem.setLane(this.laneSystem.laneCount === 5 ? 2 : 1);
    if (this.container) {
      this.container.style.left = this.laneSystem.getPercentX();
      this.container.style.transform = 'translateX(-50%) rotate(0deg)';
      this.container.className = 'player-ship-container phase-cyan';
      this.container.style.opacity = '1.0';
    }
  }
}

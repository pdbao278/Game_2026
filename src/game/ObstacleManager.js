import { ObstacleLogic } from './ObstacleLogic.js';
import { globalEventBus } from '../core/EventBus.js';

/**
 * ObstacleManager - Quản lý sinh và di chuyển chướng ngại vật & tinh thể trên 5 làn đường
 */
export class ObstacleManager {
  constructor(containerElement, audioManager) {
    this.container = containerElement || document.getElementById('obstacleContainer');
    this.audioManager = audioManager;
    this.obstacles = [];
    this.spawnTimer = 0;
    this.spawnInterval = 1.35; // Khoảng cách sinh vật thể (giây)
    this.lanePositions = [32, 50, 68];
    this.nextId = 0;
  }

  setLanePositions(positions) {
    this.lanePositions = positions;
  }

  /**
   * Sinh ngẫu nhiên một vật thể mới ở đầu đường bay (chân trời)
   */
  spawn(laneCount = 3) {
    const lane = Math.floor(Math.random() * laneCount);
    const rand = Math.random();

    let type = 'crystal_cyan';
    let imgSrc = 'asset_new/crystal_cyan.png';
    let label = 'PHA 1 // CYAN';
    let borderColor = 'var(--cyan)';
    let glowColor = 'var(--cyan-glow)';

    if (rand < 0.35) {
      type = 'crystal_cyan';
      imgSrc = 'asset_new/crystal_cyan.png';
      label = 'PHA 1 // CYAN';
      borderColor = 'var(--cyan)';
      glowColor = 'var(--cyan-glow)';
    } else if (rand < 0.70) {
      type = 'crystal_orange';
      imgSrc = 'asset_new/crystal_orange.png';
      label = 'PHA 2 // CAM';
      borderColor = 'var(--orange)';
      glowColor = 'var(--orange-glow)';
    } else if (rand < 0.90) {
      type = 'asteroid';
      imgSrc = Math.random() > 0.5 ? 'asset_new/asteroid_cute.png' : 'assets/models/Isometric/meteor_detailed_SE.png';
      label = 'AST // NÉ!';
      borderColor = 'var(--pink)';
      glowColor = 'var(--pink-glow)';
    } else if (rand < 0.95) {
      type = 'repair';
      imgSrc = 'asset_new/repair_core.png';
      label = 'HỒI PHỤC';
      borderColor = 'var(--green)';
      glowColor = 'var(--green-glow)';
    } else {
      type = 'shard';
      imgSrc = 'asset_new/resonance_shard.png';
      label = '×2 ĐIỂM';
      borderColor = 'var(--gold)';
      glowColor = 'var(--gold-glow)';
    }

    // Tạo phần tử DOM
    const el = document.createElement('div');
    el.className = 'dynamic-obstacle';
    el.innerHTML = `
      <div class="target-box" style="border-color:${borderColor}; box-shadow:0 0 16px ${glowColor};">
        <img src="${imgSrc}" alt="${type}">
      </div>
      <div class="target-label" style="color:${borderColor};">${label}</div>
    `;

    if (this.container) {
      this.container.appendChild(el);
    }

    const obstacleObj = {
      id: this.nextId++,
      type: type,
      lane: lane,
      progress: 0.0,
      element: el,
      collided: false,
      nearMissTriggered: false
    };

    this.obstacles.push(obstacleObj);
  }

  /**
   * Cập nhật chuyển động và kiểm tra tương tác mỗi khung hình
   */
  update(deltaTime, worldSpeed, playerShip, gameState) {
    // 1. Quản lý nhịp sinh vật thể
    const effectiveInterval = Math.max(0.7, this.spawnInterval - (gameState ? gameState.playTime * 0.005 : 0));
    this.spawnTimer += deltaTime;
    if (this.spawnTimer >= effectiveInterval) {
      this.spawn(playerShip.laneSystem.laneCount);
      this.spawnTimer = 0;
    }

    // Tốc độ tiến độ
    const speedFactor = (worldSpeed / 25.0) * 0.45;

    // 2. Di chuyển các vật thể dọc theo làn
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obs = this.obstacles[i];
      obs.progress += deltaTime * speedFactor;

      // Tính toán tọa độ phối cảnh
      const pos = ObstacleLogic.calculatePerspectivePosition(obs.lane, obs.progress, this.lanePositions);
      obs.element.style.top = `${pos.top}%`;
      obs.element.style.left = `${pos.left}%`;
      obs.element.style.transform = `translate(-50%, -50%) scale(${pos.scale})`;
      obs.element.style.opacity = Math.min(1.0, obs.progress * 3.0);

      // 3. Kiểm tra va chạm khi đi vào vùng tiếp xúc
      if (!obs.collided && ObstacleLogic.isInHitZone(obs.progress)) {
        const playerLane = playerShip.laneSystem.currentLaneIndex;

        // Nếu trùng làn với tàu
        if (playerLane === obs.lane) {
          obs.collided = true;
          this.handlePlayerCollision(obs, playerShip, gameState);
          this.removeObstacle(i);
          continue;
        }

        // Nếu là thiên thạch và ở làn liền kề -> Né sát (Near-Miss)
        if (!obs.nearMissTriggered && ObstacleLogic.checkNearMiss(obs.type, playerLane, obs.lane)) {
          obs.nearMissTriggered = true;
          if (gameState) gameState.addNearMissScore();
          if (this.audioManager) this.audioManager.playSFX('sfxScore');
        }
      }

      // Xóa khi vật thể vượt qua sau đuôi tàu
      if (obs.progress > 1.05) {
        this.removeObstacle(i);
      }
    }
  }

  /**
   * Xử lý tương tác khi người chơi chạm vật thể
   */
  handlePlayerCollision(obs, playerShip, gameState) {
    const playerPhase = playerShip.state.phase;
    const result = ObstacleLogic.evaluateInteraction(obs.type, playerPhase, playerShip.laneSystem.currentLaneIndex, obs.lane);

    // Khi đang trong chế độ Hyper-Drive: bọc khiên vô địch phá tan thiên thạch và hút tinh thể
    if (gameState && gameState.isHyperActive) {
      if (obs.type === 'asteroid') {
        if (this.audioManager) this.audioManager.playSFX('sfxCrash');
        globalEventBus.emit('toast', { text: '💥 PHÁ HỦY THIÊN THẠCH!', type: 'gold' });
        gameState.addNearMissScore();
        return;
      } else {
        if (this.audioManager) this.audioManager.playSFX('sfxScore');
        gameState.addCrystalScore();
        globalEventBus.emit('toast', { text: '+200 💎 HÚT NĂNG LƯỢNG!', type: 'cyan' });
        return;
      }
    }

    switch (result.type) {
      case 'COLLECT_CRYSTAL':
        if (gameState) gameState.addCrystalScore();
        if (this.audioManager) this.audioManager.playSFX('sfxScore');
        globalEventBus.emit('toast', { text: '+100 💎 ĐÚNG PHA!', type: playerPhase === 'CYAN' ? 'cyan' : 'orange' });
        break;

      case 'DAMAGE':
        playerShip.takeDamage(result.amount);
        globalEventBus.emit('toast', { text: '−1 ❤️ VA CHẠM!', type: 'pink' });
        break;

      case 'HEAL':
        playerShip.heal(result.amount);
        globalEventBus.emit('toast', { text: '+1 ❤️ HỒI MÁU!', type: 'cyan' });
        break;

      case 'SHARD_MULTIPLIER':
        if (gameState) gameState.activateScoreMultiplier(result.multiplier, result.duration);
        if (this.audioManager) this.audioManager.playSFX('sfxScore');
        globalEventBus.emit('toast', { text: '⭐ ×2 ĐIỂM SỐ (8s)!', type: 'gold' });
        break;
    }
  }

  removeObstacle(index) {
    const obs = this.obstacles[index];
    if (obs && obs.element && obs.element.parentElement) {
      obs.element.parentElement.removeChild(obs.element);
    }
    this.obstacles.splice(index, 1);
  }

  clearAll() {
    for (const obs of this.obstacles) {
      if (obs.element && obs.element.parentElement) {
        obs.element.parentElement.removeChild(obs.element);
      }
    }
    this.obstacles = [];
    this.spawnTimer = 0;
  }
}

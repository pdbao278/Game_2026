import { ObstacleLogic } from './ObstacleLogic.js';
import { CollisionSystem } from './CollisionSystem.js';
import { globalEventBus } from '../core/EventBus.js';

/**
 * ObstacleManager - Quản lý sinh và di chuyển chướng ngại vật & tinh thể trên các làn đường
 * Sử dụng Object Pooling để tái chế vật thể và phần tử DOM, hạn chế cấp phát bộ nhớ liên tục
 */
export class ObstacleManager {
  constructor(containerElement, audioManager) {
    this.container = containerElement || (typeof document !== 'undefined' ? document.getElementById('obstacleContainer') : null);
    this.audioManager = audioManager;
    this.obstacles = [];
    this.pool = []; // Object pool để tái sử dụng
    this.spawnTimer = 0;
    this.spawnInterval = 1.35; // Khoảng cách sinh vật thể (giây)
    this.lanePositions = [32, 50, 68];
    this.nextId = 0;
    this.collisionSystem = new CollisionSystem(0.86, 0.98, 0.75);
  }

  setLanePositions(positions) {
    this.lanePositions = positions;
  }

  /**
   * Sinh ngẫu nhiên một vật thể mới ở đầu đường bay (chân trời)
   * Tận dụng pool nếu có sẵn
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

    let obstacleObj = this.pool.pop();

    if (!obstacleObj) {
      let el = null;
      if (typeof document !== 'undefined') {
        el = document.createElement('div');
        el.className = 'dynamic-obstacle';
        if (this.container) {
          this.container.appendChild(el);
        }
      }
      obstacleObj = {
        id: this.nextId++,
        type: type,
        lane: lane,
        progress: 0.0,
        element: el,
        collided: false,
        nearMissTriggered: false,
        active: true
      };
    } else {
      obstacleObj.id = this.nextId++;
      obstacleObj.type = type;
      obstacleObj.lane = lane;
      obstacleObj.progress = 0.0;
      obstacleObj.collided = false;
      obstacleObj.nearMissTriggered = false;
      obstacleObj.active = true;
    }

    if (obstacleObj.element) {
      obstacleObj.element.style.display = 'block';
      obstacleObj.element.innerHTML = `
        <div class="target-box" style="border-color:${borderColor}; box-shadow:0 0 16px ${glowColor};">
          <img src="${imgSrc}" alt="${type}">
        </div>
        <div class="target-label" style="color:${borderColor};">${label}</div>
      `;
    }

    this.obstacles.push(obstacleObj);
    return obstacleObj;
  }

  /**
   * Cập nhật chuyển động và kiểm tra tương tác mỗi khung hình
   */
  update(deltaTime, worldSpeed, playerShip, gameState) {
    // 1. Quản lý nhịp sinh vật thể
    const effectiveInterval = Math.max(0.7, this.spawnInterval - (gameState ? gameState.playTime * 0.005 : 0));
    this.spawnTimer += deltaTime;
    if (this.spawnTimer >= effectiveInterval) {
      const laneCount = playerShip?.laneSystem?.laneCount || 3;
      this.spawn(laneCount);
      this.spawnTimer = 0;
    }

    // Tốc độ tiến độ
    const speedFactor = (worldSpeed / 25.0) * 0.45;

    // 2. Di chuyển các vật thể dọc theo làn
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obs = this.obstacles[i];
      obs.progress += deltaTime * speedFactor;

      // Tính toán tọa độ phối cảnh
      if (obs.element) {
        const pos = ObstacleLogic.calculatePerspectivePosition(obs.lane, obs.progress, this.lanePositions);
        obs.element.style.top = `${pos.top}%`;
        obs.element.style.left = `${pos.left}%`;
        obs.element.style.transform = `translate(-50%, -50%) scale(${pos.scale})`;
        obs.element.style.opacity = Math.min(1.0, obs.progress * 3.0);
      }

      // Trong chế độ Hyper-Drive: Từ trường hút mọi tinh thể về phía làn tàu đang bay
      if (gameState && gameState.isHyperActive && obs.type !== 'asteroid' && obs.progress > 0.35) {
        const playerLane = playerShip?.laneSystem?.currentLaneIndex;
        if (playerLane !== undefined && obs.lane !== playerLane) {
          obs.lane = playerLane;
        }
      }

      // 3. Kiểm tra va chạm khi đi vào vùng tiếp xúc
      if (!obs.collided && this.collisionSystem.isInHitZone(obs.progress)) {
        const check = this.collisionSystem.checkCollision(playerShip, obs);

        // Nếu trùng làn với tàu
        if (check.collided) {
          obs.collided = true;
          this.collisionSystem.resolveCollision(playerShip, obs, gameState, globalEventBus, this.audioManager);
          this.removeObstacle(i);
          continue;
        }

        // Nếu là thiên thạch và ở làn liền kề -> Né sát (Near-Miss)
        if (!obs.nearMissTriggered && check.nearMiss) {
          obs.nearMissTriggered = true;
          this.collisionSystem.resolveNearMiss(obs, gameState, globalEventBus, this.audioManager);
        }
      }

      // Thu hồi khi vật thể vượt qua sau đuôi tàu
      if (obs.progress > 1.05) {
        this.removeObstacle(i);
      }
    }
  }

  /**
   * Thu hồi một vật thể vào Object Pool
   */
  removeObstacle(index) {
    const obs = this.obstacles[index];
    if (obs) {
      obs.active = false;
      if (obs.element) {
        obs.element.style.display = 'none';
      }
      this.pool.push(obs);
    }
    this.obstacles.splice(index, 1);
  }

  /**
   * Dọn sạch toàn bộ vật thể và đưa hết vào Object Pool
   */
  clearAll() {
    for (const obs of this.obstacles) {
      obs.active = false;
      if (obs.element) {
        obs.element.style.display = 'none';
      }
      this.pool.push(obs);
    }
    this.obstacles = [];
    this.spawnTimer = 0;
  }
}

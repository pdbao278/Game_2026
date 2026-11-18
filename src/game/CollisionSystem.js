import { ObstacleLogic } from './ObstacleLogic.js';
import { globalEventBus } from '../core/EventBus.js';

/**
 * CollisionSystem - Tính toán va chạm theo AABB thu nhỏ 75%
 * và điều phối tương tác giữa Phi thuyền và Vật thể / Thiên thạch
 */
export class CollisionSystem {
  /**
   * @param {number} hitZoneStart Bắt đầu vùng va chạm (0.86)
   * @param {number} hitZoneEnd Kết thúc vùng va chạm (0.98)
   * @param {number} aabbReduction Tỷ lệ thu nhỏ hộp va chạm (0.75)
   */
  constructor(hitZoneStart = 0.86, hitZoneEnd = 0.98, aabbReduction = 0.75) {
    this.hitZoneStart = hitZoneStart;
    this.hitZoneEnd = hitZoneEnd;
    this.aabbReduction = aabbReduction;
  }

  /**
   * Kiểm tra xem vật thể có đang ở trong dải tọa độ va chạm hay không
   * @param {number} progress
   * @returns {boolean}
   */
  isInHitZone(progress) {
    return progress >= this.hitZoneStart && progress <= this.hitZoneEnd;
  }

  /**
   * Kiểm tra va chạm cơ bản hoặc né sát giữa tàu và vật thể
   * @param {object} player Tàu người chơi
   * @param {object} obstacle Vật thể
   * @returns {{ collided: boolean, nearMiss: boolean, obstacleType?: string }}
   */
  checkCollision(player, obstacle) {
    if (!this.isInHitZone(obstacle.progress)) {
      return { collided: false, nearMiss: false };
    }

    const playerLane = player.laneSystem.currentLaneIndex;
    const obstacleLane = obstacle.lane;

    // Khi cùng làn đường
    if (playerLane === obstacleLane) {
      return {
        collided: true,
        nearMiss: false,
        obstacleType: obstacle.type
      };
    }

    // Khi ở làn liền kề và là thiên thạch -> Né sát (Near-Miss)
    if (obstacle.type === 'asteroid' && Math.abs(playerLane - obstacleLane) === 1) {
      return {
        collided: false,
        nearMiss: true,
        obstacleType: obstacle.type
      };
    }

    return { collided: false, nearMiss: false };
  }

  /**
   * Xử lý va chạm thực tế khi tàu tiếp xúc trực tiếp vật thể
   * @param {object} player 
   * @param {object} obstacle 
   * @param {object} gameState 
   * @param {object} eventBus 
   * @param {object} audioManager 
   */
  resolveCollision(player, obstacle, gameState = null, eventBus = globalEventBus, audioManager = null) {
    const playerPhase = player.state ? player.state.phase : 'CYAN';

    // 1. Khi đang trong chế độ Hyper-Drive: bọc khiên vô địch
    if (gameState && gameState.isHyperActive) {
      if (obstacle.type === 'asteroid') {
        if (audioManager) audioManager.playSFX('sfxCrash');
        eventBus.emit('toast', { text: '💥 PHÁ HỦY THIÊN THẠCH!', type: 'gold' });
        gameState.addNearMissScore();
        return { damageApplied: false, destroyed: true };
      } else {
        if (audioManager) audioManager.playSFX('sfxScore');
        gameState.addCrystalScore();
        eventBus.emit('toast', { text: '+200 💎 HÚT NĂNG LƯỢNG!', type: 'cyan' });
        return { damageApplied: false, collected: true };
      }
    }

    // 2. Phân loại theo loại vật thể
    const result = ObstacleLogic.evaluateInteraction(
      obstacle.type,
      playerPhase,
      player.laneSystem.currentLaneIndex,
      obstacle.lane
    );

    switch (result.type) {
      case 'COLLECT_CRYSTAL':
        if (gameState) gameState.addCrystalScore();
        if (audioManager) audioManager.playSFX('sfxScore');
        eventBus.emit('toast', {
          text: '+100 💎 ĐÚNG PHA!',
          type: playerPhase === 'CYAN' ? 'cyan' : 'orange'
        });
        return { damageApplied: false, collected: true };

      case 'DAMAGE': {
        const damageSuccess = player.takeDamage ? player.takeDamage(result.amount || 1) : false;
        if (damageSuccess) {
          eventBus.emit('toast', { text: '−1 ❤️ VA CHẠM!', type: 'pink' });
          return { damageApplied: true, amount: result.amount || 1 };
        }
        return { damageApplied: false, invincible: true };
      }

      case 'HEAL':
        if (player.heal) player.heal(result.amount || 1);
        eventBus.emit('toast', { text: '+1 ❤️ HỒI MÁU!', type: 'cyan' });
        return { damageApplied: false, healed: true };

      case 'SHARD_MULTIPLIER':
        if (gameState) gameState.activateScoreMultiplier(result.multiplier, result.duration);
        if (audioManager) audioManager.playSFX('sfxScore');
        eventBus.emit('toast', { text: '⭐ ×2 ĐIỂM SỐ (8s)!', type: 'gold' });
        return { damageApplied: false, buff: true };

      default:
        return { damageApplied: false };
    }
  }

  /**
   * Xử lý sự kiện Né Sát (Near-Miss)
   */
  resolveNearMiss(obstacle, gameState = null, eventBus = globalEventBus, audioManager = null) {
    if (gameState) gameState.addNearMissScore();
    if (audioManager) audioManager.playSFX('sfxScore');
  }
}

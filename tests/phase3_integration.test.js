import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { GameState } from '../src/core/GameState.js';
import { LaneSystem } from '../src/game/LaneSystem.js';
import { PlayerShipState } from '../src/game/PlayerShipState.js';
import { CollisionSystem } from '../src/game/CollisionSystem.js';
import { ObstacleManager } from '../src/game/ObstacleManager.js';
import { AudioManager } from '../src/audio/AudioManager.js';
import { EventBus } from '../src/core/EventBus.js';

describe('Checkpoint 3: Phase 3 Integration - Cơ chế sáng tạo, Kỹ năng đỉnh cao & Âm thanh', () => {
  it('tích hợp liên thông toàn bộ tính năng Phase 3: Near-Miss -> Hyper-Drive -> Vật phẩm phụ -> Âm thanh', () => {
    const eventBus = new EventBus();
    const gameState = new GameState();
    const laneSystem = new LaneSystem(5);
    const shipState = new PlayerShipState();
    const collisionSystem = new CollisionSystem(0.86, 0.98, 0.75);
    const obstacleManager = new ObstacleManager(null, null);
    const audioManager = new AudioManager();

    let sfxTracker = [];
    audioManager.playSFX = (name) => {
      if (!audioManager.muted) sfxTracker.push(name);
    };

    const playerShip = {
      laneSystem,
      state: shipState,
      takeDamage(amount) {
        if (this.state.takeDamage(amount)) {
          audioManager.playSFX('sfxCrash');
          eventBus.emit('player-damage', {
            health: this.state.health,
            maxHealth: this.state.maxHealth
          });
          return true;
        }
        return false;
      },
      heal(amount) {
        this.state.heal(amount);
        audioManager.playSFX('sfxHeal');
        eventBus.emit('player-heal', {
          health: this.state.health,
          maxHealth: this.state.maxHealth
        });
      },
      switchPhase() {
        return this.state.switchPhase();
      },
      reset() {
        this.state.reset();
        this.laneSystem.setLane(2);
      }
    };

    // Bắt đầu game
    gameState.start();
    playerShip.reset();
    obstacleManager.clearAll();

    // 1. Thực hiện 2 cú né sát (Near-Miss) liên tiếp
    const asteroidNearby1 = { id: 201, type: 'asteroid', lane: 1, progress: 0.90, collided: false };
    const check1 = collisionSystem.checkCollision(playerShip, asteroidNearby1);
    assert.equal(check1.nearMiss, true);
    collisionSystem.resolveNearMiss(asteroidNearby1, gameState, eventBus, audioManager);

    assert.equal(gameState.score, 250);
    assert.equal(gameState.hyperPercent, 15);
    assert.equal(sfxTracker.includes('sfxScore'), true);

    // Né sát lần 2
    const asteroidNearby2 = { id: 202, type: 'asteroid', lane: 3, progress: 0.92, collided: false };
    collisionSystem.resolveNearMiss(asteroidNearby2, gameState, eventBus, audioManager);
    assert.equal(gameState.score, 500);
    assert.equal(gameState.hyperPercent, 30);

    // 2. Kích hoạt Hyper-Drive (nạp đầy 100%)
    gameState.addHyperPercent(70);
    assert.equal(gameState.isHyperActive, true);
    assert.equal(gameState.worldSpeed, 25.0 * 1.8);

    // 3. Trong Hyper-Drive: Đâm thẳng thiên thạch -> thiên thạch bị phá hủy, tàu không mất máu
    const asteroidBlock = { id: 203, type: 'asteroid', lane: 2, progress: 0.90, collided: false };
    const resCrash = collisionSystem.resolveCollision(playerShip, asteroidBlock, gameState, eventBus, audioManager);
    assert.equal(resCrash.destroyed, true);
    assert.equal(resCrash.damageApplied, false);
    assert.equal(playerShip.state.health, 3);
    assert.equal(sfxTracker.includes('sfxCrash'), true);

    // 4. Trong Hyper-Drive: Tinh thể ở làn khác tự động bị từ trường hút về làn của tàu
    obstacleManager.spawn(5);
    const distantCrystal = obstacleManager.obstacles[0];
    distantCrystal.type = 'crystal_cyan';
    distantCrystal.lane = 4; // Làn ngoài cùng
    distantCrystal.progress = 0.40;

    obstacleManager.update(0.016, gameState.worldSpeed, playerShip, gameState);
    assert.equal(distantCrystal.lane, playerShip.laneSystem.currentLaneIndex);

    // 5. Kết thúc Hyper-Drive sau 6s
    gameState.update(6.1);
    assert.equal(gameState.isHyperActive, false);
    assert.equal(gameState.hyperPercent, 0);

    // 6. Nhặt Mảnh Cộng Hưởng (Shard) -> x2 điểm số
    const shard = { id: 204, type: 'shard', lane: 2, progress: 0.90, collided: false };
    collisionSystem.resolveCollision(playerShip, shard, gameState, eventBus, audioManager);
    assert.equal(gameState.scoreMultiplier, 2);

    // Ăn tinh thể trong thời gian x2 -> nhận 200 điểm
    gameState.addCrystalScore();
    assert.equal(gameState.crystalsCollected, 1);

    // 7. Bị thương mất 1 HP -> Nhặt Lõi Sửa Chữa (Repair Core) hồi lại 3 HP đầy đủ
    playerShip.takeDamage(1);
    assert.equal(playerShip.state.health, 2);

    const repair = { id: 205, type: 'repair', lane: 2, progress: 0.90, collided: false };
    collisionSystem.resolveCollision(playerShip, repair, gameState, eventBus, audioManager);
    assert.equal(playerShip.state.health, 3);
    assert.equal(sfxTracker.includes('sfxHeal'), true);

    // 8. Kiểm tra bật/tắt Mute toàn hệ thống âm thanh
    audioManager.toggleMute();
    assert.equal(audioManager.muted, true);
    sfxTracker = [];
    audioManager.playSFX('sfxCrash');
    assert.equal(sfxTracker.length, 0); // Không phát âm thanh khi Mute

    audioManager.toggleMute();
    assert.equal(audioManager.muted, false);
    audioManager.playSFX('sfxScore');
    assert.equal(sfxTracker.includes('sfxScore'), true);
  });
});

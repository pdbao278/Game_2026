import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { CollisionSystem } from '../src/game/CollisionSystem.js';
import { GameState } from '../src/core/GameState.js';
import { PlayerShipState } from '../src/game/PlayerShipState.js';
import { ObstacleManager } from '../src/game/ObstacleManager.js';
import { EventBus } from '../src/core/EventBus.js';

describe('Task 5: Né Sát (Near-Miss) & Siêu Tốc (Hyper-Drive)', () => {
  it('bay sát mép thiên thạch ở làn liền kề kích hoạt Near-Miss: +250 điểm, +15% nạp và phát sự kiện near-miss', () => {
    const cs = new CollisionSystem();
    const eventBus = new EventBus();
    const gameState = new GameState();
    gameState.start();

    let nearMissReceived = null;
    eventBus.on('near-miss', (data) => {
      nearMissReceived = data;
    });

    const mockPlayer = {
      laneSystem: { currentLaneIndex: 2 }
    };
    const asteroidAdjacent = {
      id: 50,
      type: 'asteroid',
      lane: 1, // Làn liền kề (|2 - 1| = 1)
      progress: 0.90,
      collided: false
    };

    const check = cs.checkCollision(mockPlayer, asteroidAdjacent);
    assert.equal(check.collided, false);
    assert.equal(check.nearMiss, true);

    cs.resolveNearMiss(asteroidAdjacent, gameState, eventBus);
    assert.equal(gameState.score, 250);
    assert.equal(gameState.nearMissCount, 1);
    assert.equal(gameState.hyperPercent, 15);
    assert.notEqual(nearMissReceived, null);
    assert.equal(nearMissReceived.pts, 250);
  });

  it('đầy 100% nạp tự động kích hoạt Hyper-Drive: tăng tốc 1.8x, bọc khiên phá hủy thiên thạch', () => {
    const cs = new CollisionSystem();
    const eventBus = new EventBus();
    const gameState = new GameState();
    gameState.start();

    let hyperStartReceived = false;
    eventBus.on('hyper-start', () => { hyperStartReceived = true; });

    // Nạp đầy qua điểm
    gameState.addHyperPercent(100);
    assert.equal(gameState.isHyperActive, true);
    assert.equal(gameState.worldSpeed, 25.0 * 1.8);
    assert.equal(gameState.hyperTimer, 6.0);

    // Chạm thiên thạch trong Hyper-Drive: thiên thạch nổ tung, không mất máu
    const shipState = new PlayerShipState();
    const mockPlayer = {
      laneSystem: { currentLaneIndex: 2 },
      state: shipState,
      takeDamage(amount) {
        return this.state.takeDamage(amount);
      }
    };
    const asteroid = { id: 51, type: 'asteroid', lane: 2, progress: 0.92, collided: false };

    const res = cs.resolveCollision(mockPlayer, asteroid, gameState, eventBus);
    assert.equal(res.destroyed, true);
    assert.equal(res.damageApplied, false);
    assert.equal(shipState.health, 3); // Máu nguyên vẹn
  });

  it('trong Hyper-Drive: ObstacleManager tự động hút từ trường tinh thể về phía tàu', () => {
    const obstacleManager = new ObstacleManager(null, null);
    const gameState = new GameState();
    gameState.start();
    gameState.activateHyperDrive();

    const mockPlayer = {
      laneSystem: { currentLaneIndex: 2, laneCount: 3 },
      state: new PlayerShipState()
    };

    // Sinh 1 tinh thể ở làn 0 (khác làn tàu đang ở là làn 2)
    obstacleManager.spawn(3);
    const crystal = obstacleManager.obstacles[0];
    crystal.type = 'crystal_cyan';
    crystal.lane = 0;
    crystal.progress = 0.45; // Đi vào vùng từ trường

    // Cập nhật khung hình
    obstacleManager.update(0.016, gameState.worldSpeed, mockPlayer, gameState);

    // Tinh thể phải bị hút chuyển về làn 2 của tàu
    assert.equal(crystal.lane, 2);
  });

  it('hết 6 giây: tốc độ trở lại bình thường và thanh Hyper-Drive trở về 0%', () => {
    const gameState = new GameState();
    gameState.start();
    gameState.activateHyperDrive();

    assert.equal(gameState.isHyperActive, true);

    // Sau 3 giây: vẫn còn Hyper
    gameState.update(3.0);
    assert.equal(gameState.isHyperActive, true);

    // Sau thêm 3.1 giây (tổng 6.1s): hết hiệu lực
    gameState.update(3.1);
    assert.equal(gameState.isHyperActive, false);
    assert.equal(gameState.hyperPercent, 0);
    assert.equal(gameState.worldSpeed, gameState.baseSpeed + gameState.playTime * gameState.speedAcceleration);
  });
});

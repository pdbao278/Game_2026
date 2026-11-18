import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ObstacleManager } from '../src/game/ObstacleManager.js';
import { PlayerShipState } from '../src/game/PlayerShipState.js';
import { GameState } from '../src/core/GameState.js';

describe('Task 3: ObstacleManager Object Pooling & Lifecycle', () => {
  it('tái sử dụng chướng ngại vật qua Object Pool mà không rò rỉ bộ nhớ', () => {
    // Giả lập mock container không có DOM
    const manager = new ObstacleManager(null, null);

    assert.equal(manager.pool.length, 0);
    assert.equal(manager.obstacles.length, 0);

    // Sinh 3 vật thể
    manager.spawn(3);
    manager.spawn(3);
    manager.spawn(3);

    assert.equal(manager.obstacles.length, 3);
    assert.equal(manager.pool.length, 0);

    // Xóa vật thể đầu tiên (thu hồi vào pool)
    manager.removeObstacle(0);
    assert.equal(manager.obstacles.length, 2);
    assert.equal(manager.pool.length, 1);

    // Sinh vật thể mới -> tái sử dụng từ pool
    const reused = manager.spawn(3);
    assert.equal(manager.obstacles.length, 3);
    assert.equal(manager.pool.length, 0);
    assert.equal(reused.active, true);

    // Xóa tất cả qua clearAll() -> toàn bộ 3 vật thể được trả về pool
    manager.clearAll();
    assert.equal(manager.obstacles.length, 0);
    assert.equal(manager.pool.length, 3);
  });

  it('tự động thu hồi vào pool khi progress vượt quá 1.05', () => {
    const manager = new ObstacleManager(null, null);
    manager.spawn(3);
    const obs = manager.obstacles[0];
    obs.progress = 1.06;

    const mockPlayer = {
      laneSystem: { currentLaneIndex: 1, laneCount: 3 },
      state: new PlayerShipState()
    };
    const gameState = new GameState();

    manager.update(0.016, 25.0, mockPlayer, gameState);
    assert.equal(manager.obstacles.length, 0);
    assert.equal(manager.pool.length, 1);
  });
});

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { CollisionSystem } from '../src/game/CollisionSystem.js';
import { PlayerShipState } from '../src/game/PlayerShipState.js';
import { GameState } from '../src/core/GameState.js';
import { EventBus } from '../src/core/EventBus.js';

describe('Task 4: Tinh Thể Năng Lượng & Hệ Thống Điểm Số (Energy Crystals & Scoring Slice)', () => {
  it('đâm đúng pha Cyan: nhận +100 điểm, nạp +8% Hyper-Drive, phát sự kiện hạt lóe sáng', () => {
    const cs = new CollisionSystem();
    const eventBus = new EventBus();
    const gameState = new GameState();
    gameState.start();

    const shipState = new PlayerShipState();
    shipState.phase = 'CYAN';

    let crystalCollectedEvent = null;
    let toastEvent = null;
    eventBus.on('crystal-collected', (data) => { crystalCollectedEvent = data; });
    eventBus.on('toast', (data) => { toastEvent = data; });

    const mockPlayer = {
      laneSystem: { currentLaneIndex: 1 },
      state: shipState
    };

    const cyanCrystal = {
      id: 10,
      type: 'crystal_cyan',
      lane: 1,
      progress: 0.90,
      collided: false
    };

    const res = cs.resolveCollision(mockPlayer, cyanCrystal, gameState, eventBus);
    assert.equal(res.collected, true);
    assert.equal(res.damageApplied, false);
    assert.equal(gameState.score, 100);
    assert.equal(gameState.hyperPercent, 8);
    assert.equal(gameState.crystalsCollected, 1);
    assert.equal(shipState.health, 3); // Máu không đổi
    assert.notEqual(crystalCollectedEvent, null);
    assert.equal(crystalCollectedEvent.color, '#00F5FF');
    assert.equal(toastEvent.text, '+100 💎 ĐÚNG PHA!');
  });

  it('đâm sai pha Cyan khi tàu đang Orange: bị trừ 1 HP, kích hoạt bất tử 1.5s và không cộng điểm', () => {
    const cs = new CollisionSystem();
    const eventBus = new EventBus();
    const gameState = new GameState();
    gameState.start();

    const shipState = new PlayerShipState();
    shipState.phase = 'ORANGE';

    const mockPlayer = {
      laneSystem: { currentLaneIndex: 2 },
      state: shipState,
      takeDamage(amount) {
        return this.state.takeDamage(amount);
      }
    };

    const cyanCrystal = {
      id: 11,
      type: 'crystal_cyan',
      lane: 2,
      progress: 0.92,
      collided: false
    };

    const res = cs.resolveCollision(mockPlayer, cyanCrystal, gameState, eventBus);
    assert.equal(res.damageApplied, true);
    assert.equal(shipState.health, 2);
    assert.equal(shipState.isInvincible, true);
    assert.equal(gameState.score, 0); // Không cộng điểm
    assert.equal(gameState.hyperPercent, 0); // Không nạp hyper
  });

  it('đâm đúng pha Orange: nhận +100 điểm, nạp +8% Hyper-Drive', () => {
    const cs = new CollisionSystem();
    const eventBus = new EventBus();
    const gameState = new GameState();
    gameState.start();

    const shipState = new PlayerShipState();
    shipState.phase = 'ORANGE';

    let crystalCollectedEvent = null;
    eventBus.on('crystal-collected', (data) => { crystalCollectedEvent = data; });

    const mockPlayer = {
      laneSystem: { currentLaneIndex: 3 },
      state: shipState
    };

    const orangeCrystal = {
      id: 12,
      type: 'crystal_orange',
      lane: 3,
      progress: 0.90,
      collided: false
    };

    const res = cs.resolveCollision(mockPlayer, orangeCrystal, gameState, eventBus);
    assert.equal(res.collected, true);
    assert.equal(res.damageApplied, false);
    assert.equal(gameState.score, 100);
    assert.equal(gameState.hyperPercent, 8);
    assert.equal(crystalCollectedEvent.color, '#FF7700');
  });

  it('đâm sai pha Orange khi tàu đang Cyan: bị trừ 1 HP và không cộng điểm', () => {
    const cs = new CollisionSystem();
    const eventBus = new EventBus();
    const gameState = new GameState();
    gameState.start();

    const shipState = new PlayerShipState();
    shipState.phase = 'CYAN';

    const mockPlayer = {
      laneSystem: { currentLaneIndex: 0 },
      state: shipState,
      takeDamage(amount) {
        return this.state.takeDamage(amount);
      }
    };

    const orangeCrystal = {
      id: 13,
      type: 'crystal_orange',
      lane: 0,
      progress: 0.90,
      collided: false
    };

    const res = cs.resolveCollision(mockPlayer, orangeCrystal, gameState, eventBus);
    assert.equal(res.damageApplied, true);
    assert.equal(shipState.health, 2);
    assert.equal(gameState.score, 0);
  });

  it('điểm số sinh tồn tăng 10 điểm mỗi giây và cập nhật chuẩn HUD', () => {
    const gameState = new GameState();
    gameState.start();

    // 2.5 giây trôi qua -> tăng 25 điểm
    gameState.update(2.5);
    assert.equal(gameState.score, 25);

    // Kích hoạt x2 điểm (Mảnh cộng hưởng 8s)
    gameState.activateScoreMultiplier(2, 8.0);
    gameState.update(2.0); // Thêm 2 giây ở x2 = 40 điểm
    assert.equal(gameState.score, 65);
  });
});

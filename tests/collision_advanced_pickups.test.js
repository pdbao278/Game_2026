import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { CollisionSystem } from '../src/game/CollisionSystem.js';
import { PlayerShipState } from '../src/game/PlayerShipState.js';
import { GameState } from '../src/core/GameState.js';
import { EventBus } from '../src/core/EventBus.js';

describe('CollisionSystem - Hyper-Drive & Vật phẩm phụ (Pickups & Specials)', () => {
  it('trong chế độ Hyper-Drive: phá hủy thiên thạch, không mất máu và cộng điểm né sát', () => {
    const cs = new CollisionSystem();
    const eventBus = new EventBus();
    const gameState = new GameState();
    gameState.start();
    gameState.activateHyperDrive(); // Bật khiên Hyper-Drive

    const shipState = new PlayerShipState();
    const mockPlayer = {
      laneSystem: { currentLaneIndex: 2 },
      state: shipState,
      takeDamage(amount) {
        return this.state.takeDamage(amount);
      }
    };

    let toastReceived = null;
    eventBus.on('toast', (data) => { toastReceived = data; });

    const asteroid = { id: 101, type: 'asteroid', lane: 2, progress: 0.92, collided: false };
    const res = cs.resolveCollision(mockPlayer, asteroid, gameState, eventBus);

    assert.equal(res.damageApplied, false);
    assert.equal(res.destroyed, true);
    assert.equal(shipState.health, 3); // Giữ nguyên 3 HP
    assert.equal(gameState.score, 250); // Điểm né sát/phá hủy
    assert.equal(toastReceived.text, '💥 PHÁ HỦY THIÊN THẠCH!');
  });

  it('trong chế độ Hyper-Drive: tự động hút và hấp thụ tinh thể bất kể pha nào', () => {
    const cs = new CollisionSystem();
    const eventBus = new EventBus();
    const gameState = new GameState();
    gameState.start();
    gameState.activateHyperDrive();

    const shipState = new PlayerShipState();
    shipState.phase = 'CYAN';

    const mockPlayer = {
      laneSystem: { currentLaneIndex: 1 },
      state: shipState
    };

    // Tàu đang Cyan nhưng chạm tinh thể Cam trong Hyper-Drive -> vẫn hấp thụ an toàn
    const orangeCrystal = { id: 102, type: 'crystal_orange', lane: 1, progress: 0.90, collided: false };
    const res = cs.resolveCollision(mockPlayer, orangeCrystal, gameState, eventBus);

    assert.equal(res.damageApplied, false);
    assert.equal(res.collected, true);
    assert.equal(shipState.health, 3);
    assert.equal(gameState.crystalsCollected, 1);
  });

  it('nhặt Lõi Sửa Chữa (repair): hồi 1 HP và không vượt quá 3 HP', () => {
    const cs = new CollisionSystem();
    const eventBus = new EventBus();
    const shipState = new PlayerShipState();
    shipState.health = 1; // Bị thương còn 1 HP

    let healEventFired = false;
    const mockPlayer = {
      laneSystem: { currentLaneIndex: 0 },
      state: shipState,
      heal(amount) {
        this.state.heal(amount);
        healEventFired = true;
      }
    };

    const repairItem = { id: 103, type: 'repair', lane: 0, progress: 0.91, collided: false };

    // Hồi lần 1: từ 1 -> 2 HP
    const res1 = cs.resolveCollision(mockPlayer, repairItem, null, eventBus);
    assert.equal(res1.healed, true);
    assert.equal(shipState.health, 2);
    assert.equal(healEventFired, true);

    // Hồi lần 2: từ 2 -> 3 HP (Max)
    cs.resolveCollision(mockPlayer, repairItem, null, eventBus);
    assert.equal(shipState.health, 3);

    // Hồi lần 3: khi đã 3 HP -> không vượt quá 3
    cs.resolveCollision(mockPlayer, repairItem, null, eventBus);
    assert.equal(shipState.health, 3);
  });

  it('nhặt Mảnh Cộng Hưởng (shard): kích hoạt nhân đôi điểm (x2) trong 8 giây', () => {
    const cs = new CollisionSystem();
    const eventBus = new EventBus();
    const gameState = new GameState();
    gameState.start();

    const mockPlayer = {
      laneSystem: { currentLaneIndex: 2 },
      state: new PlayerShipState()
    };

    const shardItem = { id: 104, type: 'shard', lane: 2, progress: 0.90, collided: false };
    const res = cs.resolveCollision(mockPlayer, shardItem, gameState, eventBus);

    assert.equal(res.buff, true);
    assert.equal(gameState.scoreMultiplier, 2);
    assert.equal(gameState.multiplierTimer, 8.0);

    // Ăn tinh thể trong thời gian x2 -> nhận 200 điểm thay vì 100 điểm
    gameState.addCrystalScore();
    assert.equal(gameState.score, 200);

    // Tua nhanh 8.1s -> hết hiệu lực nhân đôi, trở về x1
    gameState.update(8.1);
    assert.equal(gameState.scoreMultiplier, 1);
  });
});

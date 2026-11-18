import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { CollisionSystem } from '../src/game/CollisionSystem.js';
import { PlayerShipState } from '../src/game/PlayerShipState.js';
import { GameState } from '../src/core/GameState.js';
import { EventBus } from '../src/core/EventBus.js';

describe('Task 3: CollisionSystem & Vòng lặp Sinh tồn (Survival Loop)', () => {
  it('xác định chính xác vùng va chạm (hit zone) với hệ số thu nhỏ 75%', () => {
    const cs = new CollisionSystem(0.86, 0.98, 0.75);
    assert.equal(cs.isInHitZone(0.5), false);
    assert.equal(cs.isInHitZone(0.90), true);
    assert.equal(cs.isInHitZone(1.05), false);
    assert.equal(cs.aabbReduction, 0.75);
  });

  it('phát hiện va chạm khi thiên thạch và tàu cùng làn trong hit zone', () => {
    const cs = new CollisionSystem();
    const mockPlayer = {
      laneSystem: { currentLaneIndex: 2 },
      state: new PlayerShipState()
    };
    const asteroid = {
      id: 1,
      type: 'asteroid',
      lane: 2,
      progress: 0.92,
      collided: false
    };

    const res = cs.checkCollision(mockPlayer, asteroid);
    assert.equal(res.collided, true);
    assert.equal(res.nearMiss, false);
    assert.equal(res.obstacleType, 'asteroid');
  });

  it('đâm trúng thiên thạch trừ đúng 1 HP, kích hoạt bất tử 1.5s', () => {
    const cs = new CollisionSystem();
    const eventBus = new EventBus();
    const shipState = new PlayerShipState();
    let damageEventFired = false;
    let damageData = null;

    eventBus.on('player-damage', (data) => {
      damageEventFired = true;
      damageData = data;
    });

    const mockPlayer = {
      laneSystem: { currentLaneIndex: 2 },
      state: shipState,
      takeDamage(amount) {
        if (this.state.takeDamage(amount)) {
          eventBus.emit('player-damage', {
            health: this.state.health,
            maxHealth: this.state.maxHealth
          });
          return true;
        }
        return false;
      }
    };

    const asteroid = { id: 1, type: 'asteroid', lane: 2, progress: 0.92, collided: false };

    // Lần va chạm 1
    const res1 = cs.resolveCollision(mockPlayer, asteroid, null, eventBus);
    assert.equal(res1.damageApplied, true);
    assert.equal(shipState.health, 2);
    assert.equal(shipState.isInvincible, true);
    assert.equal(damageEventFired, true);
    assert.equal(damageData.health, 2);

    // Lần va chạm 2 ngay lập tức khi đang bất tử -> không bị trừ máu tiếp
    damageEventFired = false;
    const asteroid2 = { id: 2, type: 'asteroid', lane: 2, progress: 0.93, collided: false };
    const res2 = cs.resolveCollision(mockPlayer, asteroid2, null, eventBus);
    assert.equal(res2.damageApplied, false);
    assert.equal(shipState.health, 2);
    assert.equal(damageEventFired, false);
  });

  it('khi mất hết 3 HP sẽ kích hoạt Game Over và có thể Chơi lại phục hồi 3 HP', () => {
    const cs = new CollisionSystem();
    const eventBus = new EventBus();
    const gameState = new GameState();
    gameState.start();
    const shipState = new PlayerShipState();

    let gameOverReceived = null;
    eventBus.on('game-over', (data) => {
      gameOverReceived = data;
    });

    const mockPlayer = {
      laneSystem: {
        currentLaneIndex: 2,
        laneCount: 5,
        setLane(idx) { this.currentLaneIndex = idx; }
      },
      state: shipState,
      takeDamage(amount) {
        if (this.state.takeDamage(amount)) {
          if (this.state.health <= 0) {
            gameState.triggerGameOver();
          }
          return true;
        }
        return false;
      },
      reset() {
        this.state.reset();
        this.laneSystem.setLane(2);
      }
    };

    // Đâm 3 lần (với tua nhanh thời gian bất tử)
    const ast = { type: 'asteroid', lane: 2, progress: 0.90 };
    mockPlayer.takeDamage(1); // Còn 2 HP
    shipState.updateState(1.6);
    mockPlayer.takeDamage(1); // Còn 1 HP
    shipState.updateState(1.6);
    mockPlayer.takeDamage(1); // Còn 0 HP -> Game Over

    assert.equal(shipState.health, 0);
    assert.equal(gameState.status, 'GAMEOVER');

    // Chơi lại (Reset)
    mockPlayer.reset();
    gameState.start();
    assert.equal(shipState.health, 3);
    assert.equal(mockPlayer.laneSystem.currentLaneIndex, 2);
    assert.equal(gameState.status, 'PLAYING');
  });
});

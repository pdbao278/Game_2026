import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { GameState } from '../src/core/GameState.js';
import { LaneSystem } from '../src/game/LaneSystem.js';
import { PlayerShipState } from '../src/game/PlayerShipState.js';
import { CollisionSystem } from '../src/game/CollisionSystem.js';
import { ObstacleManager } from '../src/game/ObstacleManager.js';
import { EventBus } from '../src/core/EventBus.js';

describe('Checkpoint 2: Phase 2 Integration - Vòng lặp Sinh tồn & Năng lượng', () => {
  it('toàn bộ chu trình Phase 2: Ăn tinh thể đúng màu -> Né thiên thạch -> Mất máu -> Game Over -> Chơi lại', () => {
    const eventBus = new EventBus();
    const gameState = new GameState();
    const laneSystem = new LaneSystem(5);
    const shipState = new PlayerShipState();
    const collisionSystem = new CollisionSystem(0.86, 0.98, 0.75);
    const obstacleManager = new ObstacleManager(null, null);

    const playerShip = {
      laneSystem,
      state: shipState,
      takeDamage(amount) {
        if (this.state.takeDamage(amount)) {
          eventBus.emit('player-damage', {
            health: this.state.health,
            maxHealth: this.state.maxHealth
          });
          if (this.state.health <= 0) {
            gameState.triggerGameOver();
          }
          return true;
        }
        return false;
      },
      heal(amount) {
        this.state.heal(amount);
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

    // Bắt đầu ván chơi
    gameState.start();
    playerShip.reset();
    obstacleManager.clearAll();

    assert.equal(gameState.status, 'PLAYING');
    assert.equal(playerShip.state.health, 3);
    assert.equal(playerShip.state.phase, 'CYAN');
    assert.equal(playerShip.laneSystem.currentLaneIndex, 2);

    // 1. Tàu ăn đúng tinh thể Cyan cùng pha
    const crystalCyan = {
      id: 1,
      type: 'crystal_cyan',
      lane: 2,
      progress: 0.90,
      collided: false
    };
    const res1 = collisionSystem.resolveCollision(playerShip, crystalCyan, gameState, eventBus);
    assert.equal(res1.collected, true);
    assert.equal(gameState.score, 100);
    assert.equal(gameState.hyperPercent, 8);
    assert.equal(playerShip.state.health, 3);

    // 2. Chuyển pha sang ORANGE và ăn tinh thể Orange
    playerShip.switchPhase();
    assert.equal(playerShip.state.phase, 'ORANGE');

    const crystalOrange = {
      id: 2,
      type: 'crystal_orange',
      lane: 2,
      progress: 0.90,
      collided: false
    };
    const res2 = collisionSystem.resolveCollision(playerShip, crystalOrange, gameState, eventBus);
    assert.equal(res2.collected, true);
    assert.equal(gameState.score, 200);
    assert.equal(gameState.hyperPercent, 16);

    // 3. Đâm thiên thạch -> mất 1 HP (còn 2 HP) và bất tử 1.5s
    const asteroid1 = { id: 3, type: 'asteroid', lane: 2, progress: 0.90, collided: false };
    const res3 = collisionSystem.resolveCollision(playerShip, asteroid1, gameState, eventBus);
    assert.equal(res3.damageApplied, true);
    assert.equal(playerShip.state.health, 2);
    assert.equal(playerShip.state.isInvincible, true);

    // 4. Cố tình đâm thiên thạch tiếp khi đang bất tử -> không bị trừ máu tiếp
    const asteroidSpam = { id: 4, type: 'asteroid', lane: 2, progress: 0.91, collided: false };
    const resSpam = collisionSystem.resolveCollision(playerShip, asteroidSpam, gameState, eventBus);
    assert.equal(resSpam.damageApplied, false);
    assert.equal(playerShip.state.health, 2);

    // Tua nhanh 1.6s để hết bất tử
    playerShip.state.updateState(1.6);
    assert.equal(playerShip.state.isInvincible, false);

    // 5. Đâm sai pha (tinh thể Cyan trong khi tàu đang Orange) -> mất tiếp 1 HP (còn 1 HP)
    const crystalWrong = { id: 5, type: 'crystal_cyan', lane: 2, progress: 0.90, collided: false };
    const resWrong = collisionSystem.resolveCollision(playerShip, crystalWrong, gameState, eventBus);
    assert.equal(resWrong.damageApplied, true);
    assert.equal(playerShip.state.health, 1);

    // Tua nhanh 1.6s
    playerShip.state.updateState(1.6);

    // 6. Đâm thiên thạch lần thứ 3 -> hết máu (HP = 0) -> kích hoạt Game Over
    let gameOverData = null;
    eventBus.on('game-over', (data) => { gameOverData = data; });

    const asteroidFinal = { id: 6, type: 'asteroid', lane: 2, progress: 0.90, collided: false };
    const resFinal = collisionSystem.resolveCollision(playerShip, asteroidFinal, gameState, eventBus);
    assert.equal(resFinal.damageApplied, true);
    assert.equal(playerShip.state.health, 0);
    assert.equal(gameState.status, 'GAMEOVER');

    // 7. Chơi lại (Restart) -> phục hồi 3 HP, làn giữa, xóa chướng ngại vật
    playerShip.reset();
    gameState.start();
    obstacleManager.clearAll();

    assert.equal(playerShip.state.health, 3);
    assert.equal(playerShip.laneSystem.currentLaneIndex, 2);
    assert.equal(gameState.status, 'PLAYING');
    assert.equal(gameState.score, 0);
    assert.equal(obstacleManager.obstacles.length, 0);
  });
});

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { CollisionSystem } from '../src/game/CollisionSystem.js';
import { PlayerShipState } from '../src/game/PlayerShipState.js';
import { GameState } from '../src/core/GameState.js';
import { AudioManager } from '../src/audio/AudioManager.js';
import { EventBus } from '../src/core/EventBus.js';

describe('Task 6: Vật Phẩm Phụ (Pickups) & Hệ Thống Âm Thanh (Audio)', () => {
  it('nhặt Lõi Sửa Chữa (Repair Core): hồi 1 HP, phát sfxHeal và toast hồi phục', () => {
    const cs = new CollisionSystem();
    const eventBus = new EventBus();
    const shipState = new PlayerShipState();
    shipState.health = 2; // Bị thương

    let toastText = null;
    eventBus.on('toast', (data) => { toastText = data.text; });

    let sfxPlayed = null;
    const mockAudioManager = {
      playSFX(name) { sfxPlayed = name; }
    };

    const mockPlayer = {
      laneSystem: { currentLaneIndex: 1 },
      state: shipState,
      heal(amount) {
        this.state.heal(amount);
      }
    };

    const repairItem = { id: 70, type: 'repair', lane: 1, progress: 0.90, collided: false };
    const res = cs.resolveCollision(mockPlayer, repairItem, null, eventBus, mockAudioManager);

    assert.equal(res.healed, true);
    assert.equal(shipState.health, 3);
    assert.equal(toastText, '+1 ❤️ HỒI MÁU!');
    assert.equal(sfxPlayed, 'sfxHeal');
  });

  it('nhặt Mảnh Cộng Hưởng (Resonance Shard): nhân đôi điểm trong 8s và phát âm thanh', () => {
    const cs = new CollisionSystem();
    const eventBus = new EventBus();
    const gameState = new GameState();
    gameState.start();

    let sfxPlayed = null;
    const mockAudioManager = {
      playSFX(name) { sfxPlayed = name; }
    };

    let multiplierEvent = null;
    eventBus.on('multiplier-updated', (data) => { multiplierEvent = data; });

    const mockPlayer = {
      laneSystem: { currentLaneIndex: 2 },
      state: new PlayerShipState()
    };

    const shardItem = { id: 71, type: 'shard', lane: 2, progress: 0.90, collided: false };
    const res = cs.resolveCollision(mockPlayer, shardItem, gameState, eventBus, mockAudioManager);

    assert.equal(res.buff, true);
    assert.equal(gameState.scoreMultiplier, 2);
    assert.equal(gameState.multiplierTimer, 8.0);
    assert.equal(sfxPlayed, 'sfxScore');
  });

  it('AudioManager hỗ trợ bật/tắt Mute toàn diện và chặn phát SFX khi đang mute', () => {
    const audioManager = new AudioManager();

    assert.equal(audioManager.muted, false);

    // Bật Mute
    audioManager.toggleMute();
    assert.equal(audioManager.muted, true);

    // Giả lập phát SFX khi đang Mute -> không được gọi play()
    let playCalled = false;
    audioManager.sfxClick = {
      currentTime: 0,
      play() {
        playCalled = true;
        return Promise.resolve();
      }
    };

    audioManager.playSFX('sfxClick');
    assert.equal(playCalled, false);

    // Tắt Mute
    audioManager.toggleMute();
    assert.equal(audioManager.muted, false);

    audioManager.playSFX('sfxClick');
    assert.equal(playCalled, true);
  });
});

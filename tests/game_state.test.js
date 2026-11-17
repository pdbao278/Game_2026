import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { GameState } from '../src/core/GameState.js';

describe('GameState', () => {
  it('khởi tạo với trạng thái START, điểm 0 và tốc độ cơ bản 25.0', () => {
    const state = new GameState();
    assert.equal(state.status, 'START');
    assert.equal(state.score, 0);
    assert.equal(state.worldSpeed, 25.0);
    assert.equal(state.hyperPercent, 0);
    assert.equal(state.isHyperActive, false);
  });

  it('chuyển sang trạng thái PLAYING khi bắt đầu ván', () => {
    const state = new GameState();
    state.start();
    assert.equal(state.status, 'PLAYING');
    assert.equal(state.score, 0);
  });

  it('tăng điểm sinh tồn theo thời gian khi ở trạng thái PLAYING', () => {
    const state = new GameState();
    state.start();
    state.update(1.0); // 1 giây
    // Điểm sinh tồn: 10 điểm / giây
    assert.equal(state.score, 10);
  });

  it('cộng điểm và nạp Hyper-Drive khi ăn tinh thể (+100 điểm, +8%)', () => {
    const state = new GameState();
    state.start();
    state.addCrystalScore();

    assert.equal(state.score, 100);
    assert.equal(state.crystalsCollected, 1);
    assert.equal(state.hyperPercent, 8);
  });

  it('cộng điểm và nạp Hyper-Drive khi né sát Near-Miss (+250 điểm, +15%)', () => {
    const state = new GameState();
    state.start();
    state.addNearMissScore();

    assert.equal(state.score, 250);
    assert.equal(state.nearMissCount, 1);
    assert.equal(state.hyperPercent, 15);
  });

  it('tự động kích hoạt Hyper-Drive khi nạp đủ 100% và tăng tốc 1.8x trong 6s', () => {
    const state = new GameState();
    state.start();

    // Nạp đầy 100%
    state.addHyperPercent(100);
    assert.equal(state.isHyperActive, true);
    assert.equal(state.hyperTimer, 6.0);
    assert.equal(state.worldSpeed, 25.0 * 1.8);

    // Cập nhật sau 3 giây: vẫn đang Hyper
    state.update(3.0);
    assert.equal(state.isHyperActive, true);

    // Cập nhật sau thêm 3.1 giây (tổng 6.1s): hết Hyper-Drive
    state.update(3.1);
    assert.equal(state.isHyperActive, false);
    assert.equal(state.hyperPercent, 0);
  });

  it('xử lý kết thúc ván (gameOver) và cập nhật kỷ lục High Score', () => {
    const state = new GameState();
    state.start();
    state.score = 500;
    state.triggerGameOver();

    assert.equal(state.status, 'GAMEOVER');
    assert.equal(state.highScore, 500);
  });
});


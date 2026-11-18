import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { GameState } from '../src/core/GameState.js';
import { LaneSystem } from '../src/game/LaneSystem.js';
import { EventBus } from '../src/core/EventBus.js';

describe('Tính năng Mới: Tạm Dừng / Chơi Lại và Chế độ 5 Làn UI', () => {
  it('GameState hỗ trợ tạm dừng (pause), tiếp tục (resume) và togglePause', () => {
    const state = new GameState();
    state.start();
    assert.equal(state.status, 'PLAYING');

    // Tạm dừng
    const paused = state.togglePause();
    assert.equal(paused, true);
    assert.equal(state.status, 'PAUSED');

    // Khi ở trạng thái PAUSED, update() không tăng điểm và không trừ thời gian
    state.update(1.0);
    assert.equal(state.score, 0);
    assert.equal(state.playTime, 0);

    // Tiếp tục chơi (Resume)
    const resumed = state.togglePause();
    assert.equal(resumed, true);
    assert.equal(state.status, 'PLAYING');

    state.update(1.0);
    assert.equal(state.score, 10);
  });

  it('LaneSystem chuyển đổi giữa 3 làn và 5 làn bảo toàn tính toàn vẹn', () => {
    const laneSystem = new LaneSystem(3);
    assert.equal(laneSystem.laneCount, 3);
    assert.deepEqual(laneSystem.lanePositions, [-2.5, 0, 2.5]);

    // Đổi sang 5 làn
    laneSystem.setMode(5);
    assert.equal(laneSystem.laneCount, 5);
    assert.deepEqual(laneSystem.lanePositions, [-4.0, -2.0, 0, 2.0, 4.0]);

    // Đổi ngược về 3 làn
    laneSystem.setMode(3);
    assert.equal(laneSystem.laneCount, 3);
    assert.deepEqual(laneSystem.lanePositions, [-2.5, 0, 2.5]);
  });

  it('Giao diện HTML có đầy đủ các nút Dừng (btnPause), Chơi Lại (btnQuickRestart), Modal Pause và Lưới 5 làn', () => {
    const htmlPath = path.resolve('index.html');
    assert.ok(fs.existsSync(htmlPath), 'index.html phải tồn tại');
    const html = fs.readFileSync(htmlPath, 'utf8');

    // Nút Dừng & Chơi lại
    assert.ok(html.includes('id="btnPause"'), 'Phải có nút id="btnPause"');
    assert.ok(html.includes('id="btnQuickRestart"'), 'Phải có nút id="btnQuickRestart"');
    assert.ok(html.includes('id="screen-pause"'), 'Phải có overlay id="screen-pause"');
    assert.ok(html.includes('id="btn-resume"'), 'Phải có nút Tiếp tục id="btn-resume"');
    assert.ok(html.includes('id="btn-pause-restart"'), 'Phải có nút Chơi lại id="btn-pause-restart"');

    // Lưới SVG phân tách 3 làn và 5 làn
    assert.ok(html.includes('id="grid3Lanes"'), 'Phải có nhóm SVG id="grid3Lanes"');
    assert.ok(html.includes('id="grid5Lanes"'), 'Phải có nhóm SVG id="grid5Lanes"');

    // Kiểm tra thông báo toast & near-miss popup đã thu gọn kích thước và dời lên cao
    assert.ok(html.includes('top: 76px;'), 'CSS .toast phải đặt ở top cao (76px) không che giữa màn hình');
    assert.ok(html.includes('font-size: 0.92rem;'), 'CSS .toast phải thu gọn font-size không quá to che khuất');
    assert.ok(html.includes('top: 114px;'), 'CSS .near-miss-popup phải đặt ở top cao (114px)');
  });
});

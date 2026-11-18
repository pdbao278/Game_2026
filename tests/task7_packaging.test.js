import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { GameState } from '../src/core/GameState.js';

describe('Task 7 & Ship Checklist: Đóng gói và Sẵn sàng Phát hành (Ready to Ship)', () => {
  it('tài liệu README.md tồn tại và chứa đầy đủ thông tin nộp bài IT Game Jam 2026', () => {
    const readmePath = path.resolve(process.cwd(), 'README.md');
    assert.equal(fs.existsSync(readmePath), true, 'Tệp README.md phải tồn tại');

    const content = fs.readFileSync(readmePath, 'utf8');
    assert.equal(content.includes('VOID SHIFT 3D'), true);
    assert.equal(content.includes('IT Game Jam 2026'), true);
    assert.equal(content.includes('Hướng Dẫn Cài Đặt & Chạy Game'), true);
    assert.equal(content.includes('Phím Tắt Điều Khiển'), true);
    assert.equal(content.includes('Cơ Chế Gameplay'), true);
  });

  it('tệp index.html hoàn chỉnh toàn bộ các thành phần UI và Audio cần thiết', () => {
    const indexPath = path.resolve(process.cwd(), 'index.html');
    const html = fs.readFileSync(indexPath, 'utf8');

    // UI overlays
    assert.equal(html.includes('id="screen-start"'), true);
    assert.equal(html.includes('id="screen-gameover"'), true);
    assert.equal(html.includes('id="btn-play"'), true);
    assert.equal(html.includes('id="btn-restart"'), true);

    // Audio tags
    assert.equal(html.includes('id="sfxClick"'), true);
    assert.equal(html.includes('id="sfxPhase"'), true);
    assert.equal(html.includes('id="sfxScore"'), true);
    assert.equal(html.includes('id="sfxCrash"'), true);
    assert.equal(html.includes('id="sfxHyper"'), true);
    assert.equal(html.includes('id="sfxHeal"'), true);
    assert.equal(html.includes('id="bgm"'), true);

    // FX layers
    assert.equal(html.includes('id="damageFlash"'), true);
    assert.equal(html.includes('id="speedLines"'), true);
    assert.equal(html.includes('id="btnMute"'), true);
  });

  it('hệ thống High Score lưu giữ an toàn và tương thích với màn hình kết quả', () => {
    const state = new GameState();
    state.start();
    state.score = 1500;
    state.saveHighScore();

    assert.equal(state.highScore, 1500);

    // Bắt đầu ván mới: High Score không bị reset
    state.start();
    assert.equal(state.score, 0);
    assert.equal(state.highScore, 1500);
  });
});

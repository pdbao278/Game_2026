import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { EventBus } from '../src/core/EventBus.js';
import { LaneSystem } from '../src/game/LaneSystem.js';
import { PlayerShipState } from '../src/game/PlayerShipState.js';
import { InputManager } from '../src/core/InputManager.js';

describe('Phase 1 Integration - Vòng lặp điều khiển & Chuyển pha', () => {
  it('tích hợp đầy đủ giữa InputManager, LaneSystem và PlayerShipState', () => {
    const eventBus = new EventBus();
    const laneSystem = new LaneSystem(5);
    const shipState = new PlayerShipState();

    // Giả lập đối tượng PlayerShip kết hợp các thành phần
    const playerShip = {
      state: shipState,
      laneSystem: laneSystem,
      moveLeft() {
        if (this.laneSystem.moveLeft()) {
          this.state.targetX = this.laneSystem.getTargetX();
          eventBus.emit('player-lane-change', {
            laneIndex: this.laneSystem.currentLaneIndex,
            targetX: this.state.targetX
          });
          return true;
        }
        return false;
      },
      moveRight() {
        if (this.laneSystem.moveRight()) {
          this.state.targetX = this.laneSystem.getTargetX();
          eventBus.emit('player-lane-change', {
            laneIndex: this.laneSystem.currentLaneIndex,
            targetX: this.state.targetX
          });
          return true;
        }
        return false;
      },
      switchPhase() {
        if (this.state.switchPhase()) {
          eventBus.emit('phase-changed', {
            phase: this.state.phase,
            color: this.state.phase === 'CYAN' ? '#00F5FF' : '#FF7700'
          });
          return true;
        }
        return false;
      }
    };

    const input = new InputManager(playerShip);

    // 1. Kiểm tra trạng thái xuất phát ban đầu
    assert.equal(laneSystem.currentLaneIndex, 2);
    assert.equal(shipState.phase, 'CYAN');
    assert.equal(shipState.health, 3);

    // 2. Kiểm tra bắt sự kiện đổi pha qua phím Space
    let phaseEventReceived = null;
    eventBus.on('phase-changed', (data) => {
      phaseEventReceived = data;
    });

    input.onKeyDown({ code: 'Space', preventDefault: () => {} });
    assert.equal(shipState.phase, 'ORANGE');
    assert.deepEqual(phaseEventReceived, { phase: 'ORANGE', color: '#FF7700' });

    // Spam phím ngay lập tức -> bị cooldown 150ms chặn lại
    input.onKeyDown({ code: 'Space', preventDefault: () => {} });
    assert.equal(shipState.phase, 'ORANGE'); // Vẫn là ORANGE

    // Giả lập thời gian trôi 0.2s (qua cooldown 0.15s)
    shipState.updateState(0.2);

    // Bấm Space lại -> trở về CYAN
    input.onKeyDown({ code: 'Space', preventDefault: () => {} });
    assert.equal(shipState.phase, 'CYAN');
    assert.deepEqual(phaseEventReceived, { phase: 'CYAN', color: '#00F5FF' });

    // 3. Kiểm tra điều khiển lướt làn qua phím A và D
    let laneEventReceived = null;
    eventBus.on('player-lane-change', (data) => {
      laneEventReceived = data;
    });

    // Bấm 'A' chuyển sang làn 1 (targetX = -2.0)
    input.onKeyDown({ code: 'KeyA', preventDefault: () => {} });
    assert.equal(laneSystem.currentLaneIndex, 1);
    assert.equal(shipState.targetX, -2.0);
    assert.deepEqual(laneEventReceived, { laneIndex: 1, targetX: -2.0 });

    // Bấm 'A' tiếp chuyển sang làn 0 (targetX = -4.0, kịch biên trái)
    input.onKeyDown({ code: 'KeyA', preventDefault: () => {} });
    assert.equal(laneSystem.currentLaneIndex, 0);
    assert.equal(shipState.targetX, -4.0);

    // Bấm 'A' lần nữa -> bị chặn biên, không đổi tọa độ
    input.onKeyDown({ code: 'KeyA', preventDefault: () => {} });
    assert.equal(laneSystem.currentLaneIndex, 0);
    assert.equal(shipState.targetX, -4.0);

    // Bấm 'D' liên tiếp 4 lần để lướt từ biên trái (0) sang biên phải (4)
    input.onKeyDown({ code: 'KeyD', preventDefault: () => {} });
    assert.equal(laneSystem.currentLaneIndex, 1);
    input.onKeyDown({ code: 'KeyD', preventDefault: () => {} });
    assert.equal(laneSystem.currentLaneIndex, 2);
    input.onKeyDown({ code: 'KeyD', preventDefault: () => {} });
    assert.equal(laneSystem.currentLaneIndex, 3);
    input.onKeyDown({ code: 'KeyD', preventDefault: () => {} });
    assert.equal(laneSystem.currentLaneIndex, 4);
    assert.equal(shipState.targetX, 4.0);

    // Bấm 'D' lần nữa -> bị chặn biên phải
    input.onKeyDown({ code: 'KeyD', preventDefault: () => {} });
    assert.equal(laneSystem.currentLaneIndex, 4);

    input.dispose();
  });
});

describe('Phase 1 - Kiểm tra Tính Toàn Vẹn Tệp & Tài Nguyên (Asset Integrity)', () => {
  const rootDir = path.resolve('.');

  it('tệp index.html tồn tại và chứa đủ các phần tử UI, Three.js Importmap', () => {
    const htmlPath = path.join(rootDir, 'index.html');
    assert.ok(fs.existsSync(htmlPath), 'index.html phải tồn tại');

    const htmlContent = fs.readFileSync(htmlPath, 'utf8');

    // Kiểm tra Importmap
    assert.ok(htmlContent.includes('"three"'), 'Importmap phải chứa khai báo "three"');
    assert.ok(htmlContent.includes('"three/addons/"'), 'Importmap phải chứa "three/addons/"');

    // Kiểm tra cấu trúc phần tử DOM
    assert.ok(htmlContent.includes('id="canvas-container"'), 'Phải có container chứa canvas 3D');
    assert.ok(htmlContent.includes('id="screen-start"'), 'Phải có Start Screen');
    assert.ok(htmlContent.includes('id="btn-play"'), 'Phải có nút Bắt đầu vận hành');
    assert.ok(htmlContent.includes('id="screen-gameover"'), 'Phải có Game Over Screen');
    assert.ok(htmlContent.includes('id="btn-restart"'), 'Phải có nút Chơi lại');
    assert.ok(htmlContent.includes('id="hud-phase-indicator"'), 'Phải có đèn báo pha');
    assert.ok(htmlContent.includes('id="hud-score-num"'), 'Phải có ô hiển thị điểm');
    assert.ok(htmlContent.includes('id="hud-hyper-fill"'), 'Phải có thanh Hyper-Drive');
  });

  it('mô hình 3D craft_racer.glb tồn tại trên đĩa và có kích thước hợp lệ', () => {
    const modelPath = path.join(rootDir, 'assets/models/Models/GLTF format/craft_racer.glb');
    assert.ok(fs.existsSync(modelPath), 'craft_racer.glb phải tồn tại');
    const stats = fs.statSync(modelPath);
    assert.ok(stats.size > 1000, 'craft_racer.glb phải có kích thước hợp lệ (> 1KB)');
  });

  it('toàn bộ 6 mặt Cubemap Skybox MilkyWay tồn tại trên đĩa', () => {
    const skyboxFiles = [
      'dark-s_px.jpg',
      'dark-s_nx.jpg',
      'dark-s_py.jpg',
      'dark-s_ny.jpg',
      'dark-s_pz.jpg',
      'dark-s_nz.jpg'
    ];

    for (const file of skyboxFiles) {
      const filePath = path.join(rootDir, 'assets/textures/skybox/milkyway', file);
      assert.ok(fs.existsSync(filePath), `Cubemap file ${file} phải tồn tại`);
      assert.ok(fs.statSync(filePath).size > 10000, `${file} phải có dung lượng ảnh hợp lệ`);
    }
  });

  it('kết cấu vệt lửa phản lực flame_01.png tồn tại trên đĩa', () => {
    const flamePath = path.join(rootDir, 'assets/textures/particles/PNG (Transparent)/flame_01.png');
    assert.ok(fs.existsSync(flamePath), 'flame_01.png phải tồn tại');
    assert.ok(fs.statSync(flamePath).size > 500, 'flame_01.png phải có dung lượng ảnh hợp lệ');
  });
});

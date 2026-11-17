import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { EventBus } from '../src/core/EventBus.js';
import { LaneSystem } from '../src/game/LaneSystem.js';

describe('EventBus', () => {
  it('cho phép đăng ký và phát sự kiện chính xác', () => {
    const bus = new EventBus();
    let receivedData = null;

    bus.on('test-event', (data) => {
      receivedData = data;
    });

    bus.emit('test-event', { score: 100 });
    assert.deepEqual(receivedData, { score: 100 });
  });

  it('cho phép hủy đăng ký sự kiện qua hàm trả về hoặc hàm off', () => {
    const bus = new EventBus();
    let count = 0;
    const handler = () => { count++; };

    const unsubscribe = bus.on('count', handler);
    bus.emit('count');
    assert.equal(count, 1);

    unsubscribe();
    bus.emit('count');
    assert.equal(count, 1);
  });
});

describe('LaneSystem', () => {
  it('khởi tạo 5 làn mặc định với tọa độ chính xác và bắt đầu ở làn giữa (index 2)', () => {
    const laneSystem = new LaneSystem();
    assert.equal(laneSystem.laneCount, 5);
    assert.deepEqual(laneSystem.lanePositions, [-4.0, -2.0, 0, 2.0, 4.0]);
    assert.equal(laneSystem.currentLaneIndex, 2);
    assert.equal(laneSystem.getTargetX(), 0);
  });

  it('chuyển làn sang trái (moveLeft) giảm index và chặn không vượt quá biên trái (index 0)', () => {
    const laneSystem = new LaneSystem();
    assert.equal(laneSystem.currentLaneIndex, 2);

    laneSystem.moveLeft();
    assert.equal(laneSystem.currentLaneIndex, 1);
    assert.equal(laneSystem.getTargetX(), -2.0);

    laneSystem.moveLeft();
    assert.equal(laneSystem.currentLaneIndex, 0);
    assert.equal(laneSystem.getTargetX(), -4.0);

    // Chặn biên trái
    const moved = laneSystem.moveLeft();
    assert.equal(moved, false);
    assert.equal(laneSystem.currentLaneIndex, 0);
    assert.equal(laneSystem.getTargetX(), -4.0);
  });

  it('chuyển làn sang phải (moveRight) tăng index và chặn không vượt quá biên phải (index 4)', () => {
    const laneSystem = new LaneSystem();
    assert.equal(laneSystem.currentLaneIndex, 2);

    laneSystem.moveRight();
    assert.equal(laneSystem.currentLaneIndex, 3);
    assert.equal(laneSystem.getTargetX(), 2.0);

    laneSystem.moveRight();
    assert.equal(laneSystem.currentLaneIndex, 4);
    assert.equal(laneSystem.getTargetX(), 4.0);

    // Chặn biên phải
    const moved = laneSystem.moveRight();
    assert.equal(moved, false);
    assert.equal(laneSystem.currentLaneIndex, 4);
    assert.equal(laneSystem.getTargetX(), 4.0);
  });

  it('tính toán nội suy lerp mượt mà theo delta time', () => {
    const laneSystem = new LaneSystem();
    laneSystem.moveRight(); // Target X = 2.0
    const currentX = 0;
    const delta = 0.016; // ~60fps
    const nextX = laneSystem.updatePosition(currentX, delta);
    
    // nextX phải tiến dần từ 0 về 2.0
    assert.ok(nextX > 0 && nextX <= 2.0);
  });

  it('hỗ trợ chuyển đổi giữa chế độ 3 làn và 5 làn', () => {
    const laneSystem = new LaneSystem();
    laneSystem.setMode(3);
    assert.equal(laneSystem.laneCount, 3);
    assert.deepEqual(laneSystem.lanePositions, [-2.5, 0, 2.5]);
    assert.equal(laneSystem.currentLaneIndex, 1); // Làn giữa của 3 làn là 1
    assert.equal(laneSystem.getTargetX(), 0);
  });
});


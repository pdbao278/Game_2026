import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { InputManager } from '../src/core/InputManager.js';

describe('InputManager', () => {
  // Mock playerShip
  let mockShip;
  let moveLeftCalled = 0;
  let moveRightCalled = 0;
  let switchPhaseCalled = 0;

  beforeEach(() => {
    moveLeftCalled = 0;
    moveRightCalled = 0;
    switchPhaseCalled = 0;

    mockShip = {
      moveLeft: () => { moveLeftCalled++; },
      moveRight: () => { moveRightCalled++; },
      switchPhase: () => { switchPhaseCalled++; },
      laneSystem: {
        laneCount: 5,
        setMode: function(m) { this.laneCount = m; },
        getTargetX: () => 0
      },
      state: { targetX: 0 }
    };
  });

  it('phím KeyA và ArrowLeft kích hoạt moveLeft()', () => {
    const input = new InputManager(mockShip);
    // Giả lập sự kiện keydown
    const eventA = { code: 'KeyA', preventDefault: () => {} };
    input.onKeyDown(eventA);
    assert.equal(moveLeftCalled, 1);

    const eventLeft = { code: 'ArrowLeft', preventDefault: () => {} };
    input.onKeyDown(eventLeft);
    assert.equal(moveLeftCalled, 2);

    input.dispose();
  });

  it('phím KeyD và ArrowRight kích hoạt moveRight()', () => {
    const input = new InputManager(mockShip);
    const eventD = { code: 'KeyD', preventDefault: () => {} };
    input.onKeyDown(eventD);
    assert.equal(moveRightCalled, 1);

    const eventRight = { code: 'ArrowRight', preventDefault: () => {} };
    input.onKeyDown(eventRight);
    assert.equal(moveRightCalled, 2);

    input.dispose();
  });

  it('phím Space và Enter kích hoạt switchPhase()', () => {
    const input = new InputManager(mockShip);
    const eventSpace = { code: 'Space', preventDefault: () => {} };
    input.onKeyDown(eventSpace);
    assert.equal(switchPhaseCalled, 1);

    const eventEnter = { code: 'Enter', preventDefault: () => {} };
    input.onKeyDown(eventEnter);
    assert.equal(switchPhaseCalled, 2);

    input.dispose();
  });

  it('phím KeyL đổi qua lại giữa 3 làn và 5 làn', () => {
    const input = new InputManager(mockShip);
    assert.equal(mockShip.laneSystem.laneCount, 5);

    input.onKeyDown({ code: 'KeyL', preventDefault: () => {} });
    assert.equal(mockShip.laneSystem.laneCount, 3);

    input.onKeyDown({ code: 'KeyL', preventDefault: () => {} });
    assert.equal(mockShip.laneSystem.laneCount, 5);

    input.dispose();
  });

  it('không phản hồi phím khi enabled = false', () => {
    const input = new InputManager(mockShip);
    input.setEnabled(false);

    input.onKeyDown({ code: 'KeyA', preventDefault: () => {} });
    input.onKeyDown({ code: 'Space', preventDefault: () => {} });

    assert.equal(moveLeftCalled, 0);
    assert.equal(switchPhaseCalled, 0);

    input.dispose();
  });

  it('click chuột bên trái, bên phải và giữa màn hình', () => {
    const input = new InputManager(mockShip);
    // Mock window.innerWidth = 1000
    globalThis.window = globalThis.window || {};
    globalThis.window.innerWidth = 1000;

    // Click bên trái (x = 200 < 380)
    input.onMouseDown({ clientX: 200, target: { closest: () => null } });
    assert.equal(moveLeftCalled, 1);

    // Click bên phải (x = 800 > 620)
    input.onMouseDown({ clientX: 800, target: { closest: () => null } });
    assert.equal(moveRightCalled, 1);

    // Click ở giữa (x = 500)
    input.onMouseDown({ clientX: 500, target: { closest: () => null } });
    assert.equal(switchPhaseCalled, 1);

    input.dispose();
  });

  it('nhận diện thao tác vuốt cảm ứng (Swipe)', () => {
    const input = new InputManager(mockShip);
    globalThis.window = globalThis.window || {};
    globalThis.window.innerWidth = 1000;

    // 1. Vuốt sang phải (deltaX = +60px > 30px, time = 100ms)
    input.onTouchStart({ touches: [{ clientX: 300, clientY: 400 }] });
    input.onTouchEnd({
      changedTouches: [{ clientX: 360, clientY: 400 }],
      target: { closest: () => null },
      preventDefault: () => {}
    });
    assert.equal(moveRightCalled, 1);

    // 2. Vuốt sang trái (deltaX = -60px, time = 100ms)
    input.onTouchStart({ touches: [{ clientX: 500, clientY: 400 }] });
    input.onTouchEnd({
      changedTouches: [{ clientX: 440, clientY: 400 }],
      target: { closest: () => null },
      preventDefault: () => {}
    });
    assert.equal(moveLeftCalled, 1);

    input.dispose();
  });
});

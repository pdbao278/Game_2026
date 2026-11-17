import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { PlayerShipState } from '../src/game/PlayerShipState.js';

describe('PlayerShipState', () => {
  it('khởi tạo với trạng thái Pha Băng (CYAN), 3 HP và không bất tử', () => {
    const ship = new PlayerShipState();
    assert.equal(ship.phase, 'CYAN');
    assert.equal(ship.health, 3);
    assert.equal(ship.maxHealth, 3);
    assert.equal(ship.isInvincible, false);
    assert.equal(ship.currentX, 0);
  });

  it('đổi pha giữa CYAN và ORANGE chính xác', () => {
    const ship = new PlayerShipState();
    assert.equal(ship.phase, 'CYAN');

    const switched1 = ship.switchPhase();
    assert.equal(switched1, true);
    assert.equal(ship.phase, 'ORANGE');

    // Chờ qua cooldown
    ship.phaseCooldownTimer = 0;
    const switched2 = ship.switchPhase();
    assert.equal(switched2, true);
    assert.equal(ship.phase, 'CYAN');
  });

  it('chặn đổi pha khi đang trong thời gian hồi (cooldown 150ms)', () => {
    const ship = new PlayerShipState();
    ship.switchPhase();
    assert.equal(ship.phase, 'ORANGE');

    // Thử đổi tiếp ngay lập tức
    const spamSwitch = ship.switchPhase();
    assert.equal(spamSwitch, false);
    assert.equal(ship.phase, 'ORANGE'); // Vẫn là ORANGE
  });

  it('xử lý mất máu (takeDamage) và kích hoạt thời gian bất tử 1.5s', () => {
    const ship = new PlayerShipState();
    const damageDealt = ship.takeDamage(1);
    assert.equal(damageDealt, true);
    assert.equal(ship.health, 2);
    assert.equal(ship.isInvincible, true);
    assert.equal(ship.invincibleTimer, 1.5);

    // Khi đang bất tử, không bị trừ thêm máu
    const blockedDamage = ship.takeDamage(1);
    assert.equal(blockedDamage, false);
    assert.equal(ship.health, 2);
  });

  it('xử lý hồi máu (heal) tối đa không vượt quá 3 HP', () => {
    const ship = new PlayerShipState();
    ship.health = 1;

    ship.heal(1);
    assert.equal(ship.health, 2);

    ship.heal(2);
    assert.equal(ship.health, 3); // Giới hạn maxHealth = 3
  });

  it('cập nhật thời gian bất tử và cooldown theo deltaTime', () => {
    const ship = new PlayerShipState();
    ship.takeDamage(1);
    ship.switchPhase();

    assert.ok(ship.invincibleTimer > 0);
    assert.ok(ship.phaseCooldownTimer > 0);

    // Sau 0.2s: cooldown 0.15s phải hết, nhưng invincible 1.5s vẫn còn
    ship.updateState(0.2);
    assert.equal(ship.phaseCooldownTimer, 0);
    assert.ok(ship.invincibleTimer > 0);
    assert.equal(ship.isInvincible, true);

    // Sau thêm 1.4s (tổng 1.6s): hết bất tử
    ship.updateState(1.4);
    assert.equal(ship.invincibleTimer, 0);
    assert.equal(ship.isInvincible, false);
  });
});


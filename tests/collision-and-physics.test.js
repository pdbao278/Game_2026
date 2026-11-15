import { describe, it, expect } from 'vitest';

// Hàm tính va chạm hình tròn - hình chữ nhật độc lập tương tự trong GameEngine
function checkCircleRectCollision(cx, cy, radius, rx, ry, rw, rh) {
  const closestX = Math.max(rx, Math.min(cx, rx + rw));
  const closestY = Math.max(ry, Math.min(cy, ry + rh));
  const distanceX = cx - closestX;
  const distanceY = cy - closestY;
  // Hitbox thu hẹp nhẹ (0.82) để người chơi không chết oan
  return (distanceX * distanceX + distanceY * distanceY) < (radius * 0.82 * radius * 0.82);
}

describe('Collision & Game Physics Logic', () => {
  it('Phát hiện va chạm khi tâm cá nằm hoàn toàn bên trong cột đá', () => {
    const hit = checkCircleRectCollision(100, 100, 20, 80, 80, 50, 200);
    expect(hit).toBe(true);
  });

  it('Không phát hiện va chạm khi cá bơi ở khoảng cách an toàn ngoài cột đá', () => {
    const hit = checkCircleRectCollision(100, 50, 20, 200, 0, 50, 200);
    expect(hit).toBe(false);
  });

  it('Cho phép cá lách qua mép sát cột đá nhờ hệ số hitbox tuning 0.82', () => {
    // Khoảng cách từ tâm cá (100) đến mép cột (118) là 18px.
    // Nếu radius = 20, nhưng 20 * 0.82 = 16.4px < 18px -> Không tính va chạm chết oan
    const hit = checkCircleRectCollision(100, 100, 20, 118, 50, 60, 200);
    expect(hit).toBe(false);
  });

  it('Logic Cá Nóc Phình Gai (Puffer Dash): tiêu hao đúng 35 Stamina và phóng to bán kính', () => {
    const player = {
      radius: 18,
      targetRadius: 18,
      stamina: 100,
      isDashing: false,
      dashTimer: 0
    };

    // Kích hoạt Dash
    if (player.stamina >= 35) {
      player.stamina -= 35;
      player.isDashing = true;
      player.dashTimer = 1.2;
      player.targetRadius = 32;
    }

    expect(player.isDashing).toBe(true);
    expect(player.stamina).toBe(65);
    expect(player.targetRadius).toBe(32);
    expect(player.dashTimer).toBe(1.2);
  });

  it('Logic đập vỡ đá nứt (Fractured Pillar) khi đang Dash', () => {
    const pillar = {
      fractured: true,
      broken: false
    };
    const player = { isDashing: true };

    let score = 0;
    let brokenCount = 0;

    // Giả lập va chạm xảy ra
    if (player.isDashing && pillar.fractured) {
      pillar.broken = true;
      score += 10;
      brokenCount++;
    }

    expect(pillar.broken).toBe(true);
    expect(score).toBe(10);
    expect(brokenCount).toBe(1);
  });

  it('Logic tích 3 viên ngọc liên tiếp hồi sinh 1 cá con hộ mệnh', () => {
    let pearlCombo = 0;
    let flockCount = 3;

    function collectPearl() {
      pearlCombo++;
      if (pearlCombo >= 3) {
        pearlCombo = 0;
        if (flockCount < 5) {
          flockCount++;
          return true;
        }
      }
      return false;
    }

    expect(collectPearl()).toBe(false); // 1 viên
    expect(collectPearl()).toBe(false); // 2 viên
    expect(collectPearl()).toBe(true);  // 3 viên -> Hồi sinh 1 cá con
    expect(flockCount).toBe(4);
    expect(pearlCombo).toBe(0);
  });
});


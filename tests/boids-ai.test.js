import { describe, it, expect } from 'vitest';
import { BoidFish, FishFlockSystem } from '../src/engine/boids-ai.js';

describe('Boids Flocking AI System', () => {
  it('Khởi tạo đàn cá với số lượng mặc định chính xác', () => {
    const flock = new FishFlockSystem(3);
    expect(flock.count()).toBe(3);
  });

  it('Cho phép thêm cá con vào đàn nhưng không vượt quá giới hạn tối đa (max 5)', () => {
    const flock = new FishFlockSystem(3);
    expect(flock.addFish(100, 200)).toBe(true);
    expect(flock.count()).toBe(4);

    expect(flock.addFish(100, 200)).toBe(true);
    expect(flock.count()).toBe(5);

    // Vượt quá 5 cá con sẽ trả về false và không thêm
    expect(flock.addFish(100, 200)).toBe(false);
    expect(flock.count()).toBe(5);
  });

  it('Hy sinh 1 cá con khi kích hoạt khiên chắn hộ mệnh', () => {
    const flock = new FishFlockSystem(3);
    const lostFish = flock.removeOne();
    expect(lostFish).not.toBeNull();
    expect(flock.count()).toBe(2);

    flock.removeOne();
    flock.removeOne();
    expect(flock.count()).toBe(0);

    // Khi không còn cá con nào
    const emptyLoss = flock.removeOne();
    expect(emptyLoss).toBeNull();
  });

  it('Boid tự động hướng tới vật phẩm gần đó (Scavenger AI)', () => {
    const boid = new BoidFish(100, 100, 0);
    const leaderPos = { x: 100, y: 100 };
    const collectibles = [
      { x: 120, y: 100, collected: false }, // Trong tầm quét 140px
    ];

    boid.update(0.1, leaderPos, [boid], collectibles);
    expect(boid.seekingItem).toBe(collectibles[0]);
  });

  it('Boid bơi bám theo vị trí của Cá Mẹ (Target Following)', () => {
    const boid = new BoidFish(0, 0, 0);
    const leaderPos = { x: 300, y: 200 };

    // Cập nhật vị trí qua một vài bước thời gian
    for (let i = 0; i < 20; i++) {
      boid.update(0.05, leaderPos, [boid], []);
    }

    // Tọa độ boid phải dịch chuyển về phía leader (x > 0, y > 0)
    expect(boid.x).toBeGreaterThan(0);
    expect(boid.y).toBeGreaterThan(0);
  });
});


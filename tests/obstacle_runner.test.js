import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ObstacleLogic } from '../src/game/ObstacleLogic.js';

describe('ObstacleLogic', () => {
  it('tính toán tọa độ phối cảnh 3D theo progress p', () => {
    const lanePositions = [24, 37, 50, 63, 76];
    // Làn giữa (index 2, target = 50)
    const posCenter = ObstacleLogic.calculatePerspectivePosition(2, 0.5, lanePositions);
    assert.equal(posCenter.top, 25 + 0.5 * 62);
    assert.equal(posCenter.left, 50); // Điểm giữa giữ nguyên 50%
    assert.equal(posCenter.scale, 0.15 + 0.85 * 0.5);

    // Làn cực trái (index 0, target = 24)
    const posLeft = ObstacleLogic.calculatePerspectivePosition(0, 1.0, lanePositions);
    assert.equal(posLeft.top, 25 + 1.0 * 62);
    assert.equal(posLeft.left, 24);
    assert.equal(posLeft.scale, 1.0);
  });

  it('xác định đúng va chạm khi vật thể đi vào vùng tương tác của tàu', () => {
    // p = 0.90 nằm trong khoảng [0.86, 0.98]
    assert.equal(ObstacleLogic.isInHitZone(0.90), true);
    assert.equal(ObstacleLogic.isInHitZone(0.50), false);
    assert.equal(ObstacleLogic.isInHitZone(1.05), false);
  });

  it('xác định kết quả tương tác khi cùng làn', () => {
    // Ăn đúng pha Cyan
    const resultCyanMatch = ObstacleLogic.evaluateInteraction('crystal_cyan', 'CYAN', 2, 2);
    assert.equal(resultCyanMatch.type, 'COLLECT_CRYSTAL');

    // Ăn sai pha Cyan (tàu đang Orange)
    const resultCyanMismatch = ObstacleLogic.evaluateInteraction('crystal_cyan', 'ORANGE', 2, 2);
    assert.equal(resultCyanMismatch.type, 'DAMAGE');

    // Va vào thiên thạch
    const resultAsteroid = ObstacleLogic.evaluateInteraction('asteroid', 'CYAN', 2, 2);
    assert.equal(resultAsteroid.type, 'DAMAGE');

    // Nhặt lõi hồi phục
    const resultRepair = ObstacleLogic.evaluateInteraction('repair', 'CYAN', 2, 2);
    assert.equal(resultRepair.type, 'HEAL');

    // Nhặt mảnh cộng hưởng x2 điểm
    const resultShard = ObstacleLogic.evaluateInteraction('shard', 'CYAN', 2, 2);
    assert.equal(resultShard.type, 'SHARD_MULTIPLIER');
  });

  it('xác định né sát (Near-Miss) khi đi qua thiên thạch ở làn liền kề', () => {
    // Tàu ở làn 2, thiên thạch ở làn 1 (khoảng cách làn = 1)
    const nearMiss1 = ObstacleLogic.checkNearMiss('asteroid', 2, 1);
    assert.equal(nearMiss1, true);

    // Tàu ở làn 2, thiên thạch ở làn 4 (khoảng cách làn = 2 -> không tính né sát)
    const nearMiss2 = ObstacleLogic.checkNearMiss('asteroid', 2, 4);
    assert.equal(nearMiss2, false);

    // Tinh thể năng lượng ở làn liền kề không tính là né sát
    const nearMissCrystal = ObstacleLogic.checkNearMiss('crystal_cyan', 2, 1);
    assert.equal(nearMissCrystal, false);
  });
});

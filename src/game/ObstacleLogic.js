/**
 * ObstacleLogic - Tính toán tọa độ phối cảnh 3D và logic va chạm / né sát
 */
export class ObstacleLogic {
  /**
   * Tính toán vị trí phần trăm và tỷ lệ co giãn theo phối cảnh chiều sâu
   * @param {number} laneIndex Chỉ số làn (0..4)
   * @param {number} progress Tiến độ trôi từ chân trời (0.0 đến 1.0+)
   * @param {number[]} lanePositions Tọa độ X phần trăm của các làn
   * @returns {{ top: number, left: number, scale: number }}
   */
  static calculatePerspectivePosition(laneIndex, progress, lanePositions = [24, 37, 50, 63, 76]) {
    const horizonTop = 25; // Chân trời ở 25% màn hình
    const runwayHeight = 62; // Chiều dài đường bay tới tàu
    const horizonLeft = 50; // Điểm tụ ở giữa 50%

    const targetLeft = lanePositions[laneIndex];
    const top = horizonTop + progress * runwayHeight;
    const left = horizonLeft + progress * (targetLeft - horizonLeft);
    const scale = 0.15 + 0.85 * progress;

    return { top, left, scale };
  }

  /**
   * Kiểm tra xem vật thể có đang ở cự ly ngang hàng với tàu hay không
   * @param {number} progress 
   * @returns {boolean}
   */
  static isInHitZone(progress) {
    return progress >= 0.86 && progress <= 0.98;
  }

  /**
   * Đánh giá kết quả va chạm khi vật thể chạm vào làn của tàu
   * @param {string} obstacleType Loại vật thể
   * @param {'CYAN'|'ORANGE'} playerPhase Pha hiện tại của tàu
   * @param {number} playerLane Làn của tàu
   * @param {number} obstacleLane Làn của vật thể
   */
  static evaluateInteraction(obstacleType, playerPhase, playerLane, obstacleLane) {
    if (playerLane !== obstacleLane) {
      return { type: 'NONE' };
    }

    if (obstacleType === 'crystal_cyan') {
      return playerPhase === 'CYAN' ? { type: 'COLLECT_CRYSTAL', pts: 100 } : { type: 'DAMAGE', amount: 1 };
    }

    if (obstacleType === 'crystal_orange') {
      return playerPhase === 'ORANGE' ? { type: 'COLLECT_CRYSTAL', pts: 100 } : { type: 'DAMAGE', amount: 1 };
    }

    if (obstacleType === 'asteroid') {
      return { type: 'DAMAGE', amount: 1 };
    }

    if (obstacleType === 'repair') {
      return { type: 'HEAL', amount: 1 };
    }

    if (obstacleType === 'shard') {
      return { type: 'SHARD_MULTIPLIER', multiplier: 2, duration: 8 };
    }

    return { type: 'NONE' };
  }

  /**
   * Kiểm tra điều kiện né sát Near-Miss
   * @param {string} obstacleType 
   * @param {number} playerLane 
   * @param {number} obstacleLane 
   */
  static checkNearMiss(obstacleType, playerLane, obstacleLane) {
    if (obstacleType !== 'asteroid') return false;
    return Math.abs(playerLane - obstacleLane) === 1;
  }
}

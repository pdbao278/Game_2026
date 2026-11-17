/**
 * LaneSystem - Quản lý hệ thống làn đường và chuyển làn mượt mà
 * Hỗ trợ chế độ 5 làn mặc định và 3 làn cơ bản
 */
export class LaneSystem {
  constructor(mode = 5) {
    this.lerpSpeed = 16.0; // Tốc độ nội suy chuyển làn
    this.setMode(mode);
  }

  /**
   * Thiết lập chế độ số làn (5 hoặc 3)
   * @param {number} count Số làn đường
   */
  setMode(count) {
    if (count === 3) {
      this.laneCount = 3;
      this.lanePositions = [-2.5, 0, 2.5];
      this.currentLaneIndex = 1; // Làn giữa (index 1)
    } else {
      // 5 làn mặc định
      this.laneCount = 5;
      this.lanePositions = [-4.0, -2.0, 0, 2.0, 4.0];
      this.currentLaneIndex = 2; // Làn giữa (index 2)
    }
  }

  /**
   * Lấy tọa độ mục tiêu trục X của làn hiện tại
   * @returns {number} Tọa độ X
   */
  getTargetX() {
    return this.lanePositions[this.currentLaneIndex];
  }

  /**
   * Chuyển sang làn bên trái
   * @returns {boolean} true nếu chuyển làn thành công, false nếu đã ở kịch biên trái
   */
  moveLeft() {
    if (this.currentLaneIndex > 0) {
      this.currentLaneIndex--;
      return true;
    }
    return false;
  }

  /**
   * Chuyển sang làn bên phải
   * @returns {boolean} true nếu chuyển làn thành công, false nếu đã ở kịch biên phải
   */
  moveRight() {
    if (this.currentLaneIndex < this.laneCount - 1) {
      this.currentLaneIndex++;
      return true;
    }
    return false;
  }

  /**
   * Nhảy thẳng tới làn cụ thể theo chỉ số index
   * @param {number} index Chỉ số làn
   */
  setLane(index) {
    if (index >= 0 && index < this.laneCount) {
      this.currentLaneIndex = index;
      return true;
    }
    return false;
  }

  /**
   * Tính toán nội suy vị trí X theo Delta Time
   * Công thức: currentX = lerp(currentX, targetX, lerpSpeed * dt)
   * @param {number} currentX Vị trí hiện tại
   * @param {number} deltaTime Thời gian giữa 2 khung hình (giây)
   * @returns {number} Vị trí mới sau nội suy
   */
  updatePosition(currentX, deltaTime) {
    const targetX = this.getTargetX();
    const factor = Math.min(this.lerpSpeed * deltaTime, 1.0);
    return currentX + (targetX - currentX) * factor;
  }
}


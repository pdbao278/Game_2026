/**
 * PlayerShipState - Trạng thái logic thuần túy của phi thuyền
 * Quản lý máu (HP), Pha năng lượng (Cyan/Orange), thời gian bất tử và thời gian hồi
 */
export class PlayerShipState {
  constructor() {
    this.maxHealth = 3;
    this.health = 3;
    this.phase = 'CYAN'; // 'CYAN' | 'ORANGE'
    this.currentX = 0;
    this.targetX = 0;

    // Quản lý bất tử tạm thời sau khi va chạm
    this.isInvincible = false;
    this.invincibleDuration = 1.5; // giây
    this.invincibleTimer = 0;

    // Quản lý thời gian hồi đổi pha (chống spam phím)
    this.phaseCooldown = 0.15; // 150ms
    this.phaseCooldownTimer = 0;
  }

  /**
   * Đổi trạng thái năng lượng giữa CYAN và ORANGE
   * @returns {boolean} true nếu đổi pha thành công, false nếu đang cooldown
   */
  switchPhase() {
    if (this.phaseCooldownTimer > 0) {
      return false;
    }
    this.phase = this.phase === 'CYAN' ? 'ORANGE' : 'CYAN';
    this.phaseCooldownTimer = this.phaseCooldown;
    return true;
  }

  /**
   * Trừ máu người chơi khi va chạm
   * @param {number} amount Số máu trừ (mặc định 1)
   * @returns {boolean} true nếu bị trừ máu, false nếu đang bất tử
   */
  takeDamage(amount = 1) {
    if (this.isInvincible) {
      return false;
    }
    this.health = Math.max(0, this.health - amount);
    this.isInvincible = true;
    this.invincibleTimer = this.invincibleDuration;
    return true;
  }

  /**
   * Hồi máu cho phi thuyền (tối đa maxHealth)
   * @param {number} amount Số máu hồi
   */
  heal(amount = 1) {
    this.health = Math.min(this.maxHealth, this.health + amount);
  }

  /**
   * Đặt lại trạng thái ban đầu khi bắt đầu ván mới
   */
  reset() {
    this.health = this.maxHealth;
    this.phase = 'CYAN';
    this.currentX = 0;
    this.targetX = 0;
    this.isInvincible = false;
    this.invincibleTimer = 0;
    this.phaseCooldownTimer = 0;
  }

  /**
   * Cập nhật bộ đếm thời gian theo deltaTime
   * @param {number} deltaTime Thời gian trôi qua (giây)
   */
  updateState(deltaTime) {
    if (this.phaseCooldownTimer > 0) {
      this.phaseCooldownTimer = Math.max(0, this.phaseCooldownTimer - deltaTime);
    }

    if (this.invincibleTimer > 0) {
      this.invincibleTimer = Math.max(0, this.invincibleTimer - deltaTime);
      if (this.invincibleTimer === 0) {
        this.isInvincible = false;
      }
    }
  }
}


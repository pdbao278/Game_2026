/**
 * EventBus - Hệ thống truyền phát sự kiện nhẹ (Decoupled Event System)
 * Dùng để liên lạc giữa Engine 3D Three.js và Tầng giao diện DOM HUD
 */
export class EventBus {
  constructor() {
    this.listeners = new Map();
  }

  /**
   * Đăng ký lắng nghe sự kiện
   * @param {string} event Tên sự kiện
   * @param {Function} callback Hàm xử lý khi sự kiện kích hoạt
   * @returns {Function} Hàm hủy đăng ký tiện lợi
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);

    // Trả về hàm unsubscribe
    return () => this.off(event, callback);
  }

  /**
   * Hủy đăng ký lắng nghe sự kiện
   * @param {string} event Tên sự kiện
   * @param {Function} callback Hàm xử lý cần gỡ bỏ
   */
  off(event, callback) {
    if (this.listeners.has(event)) {
      const set = this.listeners.get(event);
      set.delete(callback);
      if (set.size === 0) {
        this.listeners.delete(event);
      }
    }
  }

  /**
   * Phát sự kiện tới tất cả người nghe
   * @param {string} event Tên sự kiện
   * @param {any} data Dữ liệu đính kèm
   */
  emit(event, data) {
    if (this.listeners.has(event)) {
      for (const callback of this.listeners.get(event)) {
        try {
          callback(data);
        } catch (err) {
          console.error(`[EventBus] Lỗi khi xử lý sự kiện "${event}":`, err);
        }
      }
    }
  }

  /**
   * Xóa toàn bộ các listener
   */
  clear() {
    this.listeners.clear();
  }
}

// Singleton tiện lợi dùng chung toàn bộ ứng dụng
export const globalEventBus = new EventBus();


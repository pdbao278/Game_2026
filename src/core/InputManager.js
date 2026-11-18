import { globalEventBus } from './EventBus.js';

/**
 * InputManager - Điều khiển đa nền tảng (Bàn phím, Chuột, Cảm ứng Vuốt/Chạm)
 */
export class InputManager {
  constructor(playerShip) {
    this.playerShip = playerShip;
    this.enabled = true;

    // Lưu tọa độ cảm ứng để nhận diện vuốt (Swipe)
    this.touchStartX = 0;
    this.touchStartY = 0;
    this.touchStartTime = 0;
    this.minSwipeDistance = 30; // Pixel tối thiểu để tính là vuốt

    this.onKeyDown = this.onKeyDown.bind(this);
    this.onTouchStart = this.onTouchStart.bind(this);
    this.onTouchEnd = this.onTouchEnd.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);

    this.attachListeners();
  }

  attachListeners() {
    if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
      window.addEventListener('keydown', this.onKeyDown);
      window.addEventListener('touchstart', this.onTouchStart, { passive: false });
      window.addEventListener('touchend', this.onTouchEnd, { passive: false });
      window.addEventListener('mousedown', this.onMouseDown);
    }
  }

  detachListeners() {
    if (typeof window !== 'undefined' && typeof window.removeEventListener === 'function') {
      window.removeEventListener('keydown', this.onKeyDown);
      window.removeEventListener('touchstart', this.onTouchStart);
      window.removeEventListener('touchend', this.onTouchEnd);
      window.removeEventListener('mousedown', this.onMouseDown);
    }
  }

  setEnabled(enabled) {
    this.enabled = enabled;
  }

  /**
   * Xử lý phím bấm
   */
  onKeyDown(e) {
    if (!this.enabled || !this.playerShip) return;

    switch (e.code) {
      case 'KeyA':
      case 'ArrowLeft':
        e.preventDefault();
        this.playerShip.moveLeft();
        break;

      case 'KeyD':
      case 'ArrowRight':
        e.preventDefault();
        this.playerShip.moveRight();
        break;

      case 'Space':
      case 'Enter':
        e.preventDefault();
        this.playerShip.switchPhase();
        break;

      case 'KeyL':
        // Đổi chế độ 3 làn / 5 làn
        const currentCount = this.playerShip.laneSystem.laneCount;
        this.playerShip.laneSystem.setMode(currentCount === 5 ? 3 : 5);
        this.playerShip.state.targetX = this.playerShip.laneSystem.getTargetX();
        break;

      case 'KeyP':
      case 'Escape':
        e.preventDefault();
        globalEventBus.emit('request-pause-toggle');
        break;
    }
  }

  /**
   * Xử lý click chuột
   */
  onMouseDown(e) {
    if (!this.enabled || !this.playerShip) return;
    // Bỏ qua nếu click vào các nút giao diện UI có tương tác riêng
    if (e.target.closest('button') || e.target.closest('.interactive-ui')) {
      return;
    }

    const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1000;
    const clickX = e.clientX;

    // Nửa trái màn hình: Sang trái
    if (clickX < screenWidth * 0.38) {
      this.playerShip.moveLeft();
    }
    // Nửa phải màn hình: Sang phải
    else if (clickX > screenWidth * 0.62) {
      this.playerShip.moveRight();
    }
    // Vùng giữa: Đổi pha
    else {
      this.playerShip.switchPhase();
    }
  }

  /**
   * Bắt đầu chạm cảm ứng
   */
  onTouchStart(e) {
    if (!this.enabled) return;
    if (e.touches.length > 0) {
      this.touchStartX = e.touches[0].clientX;
      this.touchStartY = e.touches[0].clientY;
      this.touchStartTime = Date.now();
    }
  }

  /**
   * Kết thúc chạm cảm ứng (nhận diện vuốt hoặc tap)
   */
  onTouchEnd(e) {
    if (!this.enabled || !this.playerShip) return;
    if (e.target.closest('button') || e.target.closest('.interactive-ui')) {
      return;
    }

    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const deltaX = touchEndX - this.touchStartX;
    const deltaY = touchEndY - this.touchStartY;
    const deltaTime = Date.now() - this.touchStartTime;

    // 1. Nếu là thao tác vuốt nhanh (Swipe)
    if (Math.abs(deltaX) > this.minSwipeDistance && deltaTime < 350) {
      if (deltaX > 0) {
        this.playerShip.moveRight();
      } else {
        this.playerShip.moveLeft();
      }
      e.preventDefault();
      return;
    }

    // 2. Nếu là chạm nhẹ (Tap)
    const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1000;
    if (touchEndX < screenWidth * 0.4) {
      this.playerShip.moveLeft();
    } else if (touchEndX > screenWidth * 0.6) {
      this.playerShip.moveRight();
    } else {
      this.playerShip.switchPhase();
    }
  }

  dispose() {
    this.detachListeners();
  }
}


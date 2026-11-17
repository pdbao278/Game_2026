import { globalEventBus } from './core/EventBus.js';
import { GameState } from './core/GameState.js';
import { InputManager } from './core/InputManager.js';
import { SceneManager } from './game/SceneManager.js';
import { Environment } from './game/Environment.js';
import { LaneSystem } from './game/LaneSystem.js';
import { PlayerShip } from './game/PlayerShip.js';
import { ObstacleManager } from './game/ObstacleManager.js';
import { UIManager } from './ui/UIManager.js';
import { AudioManager } from './audio/AudioManager.js';

/**
 * VoidShiftGame - Bộ điều phối toàn diện cho tựa game Void Shift 3D
 */
export class VoidShiftGame {
  constructor() {
    // 1. Hệ thống âm thanh
    this.audioManager = new AudioManager();

    // 2. Quản lý trạng thái & điểm số
    this.gameState = new GameState();

    // 3. Hệ thống làn đường (Mặc định 3 làn ở giữa gọn gàng)
    this.laneSystem = new LaneSystem(3);

    // 4. Khởi tạo Three.js 3D (Skybox MilkyWay, Hạt sao điểm kim)
    const canvasContainer = document.getElementById('canvas-container');
    if (canvasContainer) {
      canvasContainer.style.display = 'block';
      this.sceneManager = new SceneManager(canvasContainer);
      this.environment = new Environment(this.sceneManager.scene);
    }

    // 5. Phi thuyền người chơi
    this.playerShip = new PlayerShip(this.laneSystem, this.audioManager);

    // 6. Quản lý chướng ngại vật & tinh thể (3 làn: 32%, 50%, 68%)
    this.obstacleManager = new ObstacleManager(
      document.getElementById('obstacleContainer'),
      this.audioManager
    );
    this.obstacleManager.setLanePositions([32, 50, 68]);

    // 7. Giao diện HUD & Bộ nhận tín hiệu điều khiển
    this.uiManager = new UIManager(this.audioManager);
    if (this.uiManager.laneLabel) {
      this.uiManager.laneLabel.textContent = '3 Làn (Phím L)';
    }
    this.inputManager = new InputManager(this.playerShip);

    // 8. Đăng ký các sự kiện trò chơi
    this.setupListeners();

    // 9. Vòng lặp hoạt ảnh 60 FPS
    this.lastTime = performance.now();
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  /**
   * Bắt đầu ván chơi
   */
  startGame() {
    this.uiManager.hideStartScreen();
    this.gameState.start();
    this.playerShip.reset();
    this.obstacleManager.clearAll();
    if (this.audioManager) {
      this.audioManager.playSFX('sfxClick');
      this.audioManager.startBGM();
    }
  }

  setupListeners() {
    // Bắt đầu game khi nhận sự kiện
    globalEventBus.on('start-game', () => {
      this.startGame();
    });

    // Chơi lại khi bấm nút "CHƠI LẠI"
    globalEventBus.on('restart-game', () => {
      this.uiManager.hideGameOver();
      this.gameState.start();
      this.playerShip.reset();
      this.obstacleManager.clearAll();
    });

    // Đổi pha từ click trên HUD
    globalEventBus.on('request-phase-switch', () => {
      this.playerShip.switchPhase();
    });

    // Đổi 5 Làn / 3 Làn
    globalEventBus.on('request-lane-toggle', () => {
      const currentCount = this.laneSystem.laneCount;
      const newCount = currentCount === 5 ? 3 : 5;
      this.laneSystem.setMode(newCount);
      this.playerShip.reset();

      if (newCount === 3) {
        this.obstacleManager.setLanePositions([37, 50, 63]);
        if (this.uiManager.laneLabel) this.uiManager.laneLabel.textContent = '3 Làn (Phím L)';
        this.uiManager.showToast('🛣️ CHẾ ĐỘ 3 LÀN (CƠ BẢN)', 'cyan');
      } else {
        this.obstacleManager.setLanePositions([24, 37, 50, 63, 76]);
        if (this.uiManager.laneLabel) this.uiManager.laneLabel.textContent = '5 Làn (Phím L)';
        this.uiManager.showToast('🛣️ CHẾ ĐỘ 5 LÀN (RỘNG RÃI)', 'gold');
      }
      if (this.audioManager) this.audioManager.playSFX('sfxClick');
    });

    // Đổi mẫu phi thuyền Chibi / Racer
    globalEventBus.on('request-ship-toggle', () => {
      this.playerShip.toggleModel();
    });

    // Khi người chơi mất máu
    globalEventBus.on('player-damage', (data) => {
      if (this.sceneManager) {
        this.sceneManager.triggerShake(0.45);
      }
      if (data.health <= 0) {
        this.gameState.triggerGameOver();
      }
    });

    // Lắng nghe phím tắt bổ sung (L)
    window.addEventListener('keydown', (e) => {
      if (e.code === 'KeyL') {
        globalEventBus.emit('request-lane-toggle');
      }
    });
  }

  /**
   * Vòng lặp khung hình 60 FPS
   */
  animate(currentTime) {
    requestAnimationFrame(this.animate);

    const deltaTime = Math.min((currentTime - this.lastTime) / 1000, 0.1);
    this.lastTime = currentTime;

    // 1. Cập nhật GameState
    this.gameState.update(deltaTime);

    // 2. Cập nhật PlayerShip
    this.playerShip.update(deltaTime);

    // 3. Cập nhật sinh và di chuyển chướng ngại vật khi đang chơi
    if (this.gameState.status === 'PLAYING') {
      this.obstacleManager.update(deltaTime, this.gameState.worldSpeed, this.playerShip, this.gameState);
    }

    // 4. Cập nhật và render Three.js 3D Canvas
    if (this.sceneManager && this.environment) {
      const currentSpeed = this.gameState.status === 'PLAYING' ? this.gameState.worldSpeed : 10.0;
      this.environment.update(deltaTime, currentSpeed);
      this.sceneManager.update(deltaTime, this.playerShip.state.targetX);
      this.sceneManager.render();
    }
  }
}

// Khởi chạy ngay lập tức, không phụ thuộc duy nhất vào DOMContentLoaded
function boot() {
  if (!window.gameInstance) {
    window.gameInstance = new VoidShiftGame();
    window.startGame = () => window.gameInstance.startGame();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}

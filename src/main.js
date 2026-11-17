import * as THREE from 'three';
import { globalEventBus } from './core/EventBus.js';
import { GameState } from './core/GameState.js';
import { InputManager } from './core/InputManager.js';
import { SceneManager } from './game/SceneManager.js';
import { Environment } from './game/Environment.js';
import { LaneSystem } from './game/LaneSystem.js';
import { PlayerShip } from './game/PlayerShip.js';
import { UIManager } from './ui/UIManager.js';

/**
 * VoidShiftGame - Lớp điều phối vòng lặp game chính (Game Orchestrator)
 */
class VoidShiftGame {
  constructor() {
    this.canvasContainer = document.getElementById('canvas-container');
    
    // 1. Khởi tạo State & EventBus
    this.gameState = new GameState();

    // 2. Khởi tạo 3D Three.js
    this.sceneManager = new SceneManager(this.canvasContainer);
    this.environment = new Environment(this.sceneManager.scene);
    this.laneSystem = new LaneSystem(5);
    this.playerShip = new PlayerShip(this.sceneManager.scene, this.laneSystem);

    // 3. Khởi tạo Điều khiển & Giao diện
    this.inputManager = new InputManager(this.playerShip);
    this.uiManager = new UIManager();

    // 4. Lắng nghe các sự kiện hệ thống
    this.setupListeners();

    // 5. Chu kỳ vòng lặp animation
    this.lastTime = performance.now();
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  setupListeners() {
    // Bắt đầu game khi người chơi bấm nút "BẮT ĐẦU VẬN HÀNH"
    globalEventBus.on('start-game', () => {
      this.uiManager.hideStartScreen();
      this.gameState.start();
      this.playerShip.reset();
    });

    // Chơi lại khi bấm nút "CHƠI LẠI"
    globalEventBus.on('restart-game', () => {
      this.uiManager.hideGameOver();
      this.gameState.start();
      this.playerShip.reset();
    });

    // Đổi pha từ click trên HUD
    globalEventBus.on('request-phase-switch', () => {
      this.playerShip.switchPhase();
    });

    // Khi người chơi mất máu
    globalEventBus.on('player-damage', (data) => {
      this.sceneManager.triggerShake(0.45);
      if (data.health <= 0) {
        this.gameState.triggerGameOver();
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

    // 3. Cập nhật sao lướt và đường bay
    const currentSpeed = this.gameState.status === 'PLAYING' ? this.gameState.worldSpeed : 12.0;
    this.environment.update(deltaTime, currentSpeed);

    // 4. Cập nhật Camera bám theo tàu và rung
    this.sceneManager.update(deltaTime, this.playerShip.mesh.position.x);

    // 5. Render Three.js Scene
    this.sceneManager.render();
  }
}

// Khởi chạy khi DOM sẵn sàng
window.addEventListener('DOMContentLoaded', () => {
  window.gameInstance = new VoidShiftGame();
});

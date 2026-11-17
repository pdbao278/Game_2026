import * as THREE from 'three';

/**
 * SceneManager - Khởi tạo và quản lý bối cảnh 3D Three.js
 * Quản lý Scene, Camera, Ánh sáng, Renderer và hiệu ứng Rung Camera
 */
export class SceneManager {
  constructor(containerElement) {
    this.container = containerElement || document.body;

    // 1. Khởi tạo Scene
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x080613, 0.012);

    // 2. Khởi tạo Camera (Góc nhìn thứ 3 bám sau đuôi tàu)
    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(65, aspect, 0.1, 1000);
    this.cameraBasePos = new THREE.Vector3(0, 3.2, 6.5);
    this.cameraTargetPos = new THREE.Vector3(0, 0.8, -12.0);
    this.camera.position.copy(this.cameraBasePos);
    this.camera.lookAt(this.cameraTargetPos);

    // 3. Khởi tạo Renderer WebGL tối ưu hóa hiệu năng
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.container.appendChild(this.renderer.domElement);

    // 4. Ánh sáng môi trường & Ánh sáng chính
    this.setupLights();

    // 5. Hiệu ứng rung camera (Camera Shake)
    this.shakeIntensity = 0;
    this.shakeDecay = 5.0;

    // 6. Xử lý cửa sổ resize
    this.onWindowResize = this.onWindowResize.bind(this);
    window.addEventListener('resize', this.onWindowResize);
  }

  /**
   * Thiết lập hệ thống chiếu sáng không gian
   */
  setupLights() {
    // Ánh sáng môi trường dịu nhẹ màu xanh thẫm vũ trụ
    this.ambientLight = new THREE.AmbientLight(0x221a44, 1.2);
    this.scene.add(this.ambientLight);

    // Nguồn sáng định hướng chính tạo bóng khối sắc nét
    this.dirLight = new THREE.DirectionalLight(0xffffff, 2.2);
    this.dirLight.position.set(8, 20, 15);
    this.scene.add(this.dirLight);

    // Đèn viền xanh cyan từ phía trước tạo đường chân trời viễn tưởng
    this.rimLight = new THREE.DirectionalLight(0x00f5ff, 1.0);
    this.rimLight.position.set(0, -5, -20);
    this.scene.add(this.rimLight);
  }

  /**
   * Kích hoạt hiệu ứng rung camera khi va chạm
   * @param {number} intensity Cường độ rung (mặc định 0.4)
   */
  triggerShake(intensity = 0.4) {
    this.shakeIntensity = intensity;
  }

  /**
   * Cập nhật vị trí camera và hiệu ứng rung theo thời gian thực
   * @param {number} deltaTime Thời gian giữa 2 khung hình
   * @param {number} targetX Tọa độ X mục tiêu của tàu (để camera hơi nghiêng theo)
   */
  update(deltaTime, targetX = 0) {
    // Camera bám theo nhẹ trục X của tàu để tăng cảm giác tốc độ
    const targetCamX = targetX * 0.35;
    this.camera.position.x += (targetCamX - this.camera.position.x) * Math.min(deltaTime * 8.0, 1.0);

    // Tính toán độ rung nếu có
    if (this.shakeIntensity > 0.001) {
      const offsetX = (Math.random() - 0.5) * 2 * this.shakeIntensity;
      const offsetY = (Math.random() - 0.5) * 2 * this.shakeIntensity;
      this.camera.position.x += offsetX;
      this.camera.position.y = this.cameraBasePos.y + offsetY;

      this.shakeIntensity = Math.max(0, this.shakeIntensity - this.shakeDecay * deltaTime);
    } else {
      this.camera.position.y = this.cameraBasePos.y;
    }

    this.camera.lookAt(this.camera.position.x * 0.5, this.cameraTargetPos.y, this.cameraTargetPos.z);
  }

  /**
   * Xử lý thay đổi kích thước cửa sổ
   */
  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  /**
   * Vẽ khung hình Three.js
   */
  render() {
    this.renderer.render(this.scene, this.camera);
  }

  /**
   * Dọn dẹp tài nguyên
   */
  dispose() {
    window.removeEventListener('resize', this.onWindowResize);
    if (this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement.parentElement);
    }
    this.renderer.dispose();
  }
}

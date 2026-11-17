import * as THREE from 'three';

/**
 * Environment - Quản lý không gian vũ trụ: Skybox MilkyWay & Bầu trời sao Starfield tinh tế
 * Đã loại bỏ các trục/lưới 3D thừa để giao diện đường bay gọn gàng, thoáng đãng
 */
export class Environment {
  constructor(scene) {
    this.scene = scene;
    this.starCount = 900;

    // 1. Tải Skybox MilkyWay
    this.setupSkybox();

    // 2. Tạo hệ thống hạt sao Starfield tinh tế (Điểm sáng kim 2px, không bị ô vuông)
    this.setupStarfield();
  }

  /**
   * Nạp Cubemap MilkyWay từ assets
   */
  setupSkybox() {
    const loader = new THREE.CubeTextureLoader();
    const urls = [
      'assets/textures/skybox/milkyway/dark-s_px.jpg',
      'assets/textures/skybox/milkyway/dark-s_nx.jpg',
      'assets/textures/skybox/milkyway/dark-s_py.jpg',
      'assets/textures/skybox/milkyway/dark-s_ny.jpg',
      'assets/textures/skybox/milkyway/dark-s_pz.jpg',
      'assets/textures/skybox/milkyway/dark-s_nz.jpg'
    ];

    try {
      this.skyboxTexture = loader.load(
        urls,
        (texture) => {
          this.scene.background = texture;
        },
        undefined,
        () => {
          this.scene.background = new THREE.Color(0x080613);
        }
      );
    } catch (e) {
      this.scene.background = new THREE.Color(0x080613);
    }
  }

  /**
   * Tạo hệ thống hạt sao dạng điểm kim sắc nét (sizeAttenuation: false)
   */
  setupStarfield() {
    const positions = new Float32Array(this.starCount * 3);
    const colors = new Float32Array(this.starCount * 3);

    const colorCyan = new THREE.Color(0x00f5ff);
    const colorWhite = new THREE.Color(0xffffff);
    const colorPurple = new THREE.Color(0xb24bf3);
    const colorGold = new THREE.Color(0xffd23f);

    for (let i = 0; i < this.starCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 140;
      positions[i * 3 + 1] = (Math.random() - 0.2) * 70;
      positions[i * 3 + 2] = -Math.random() * 200 - 5;

      const randColor = Math.random();
      let c = colorWhite;
      if (randColor > 0.8) c = colorCyan;
      else if (randColor > 0.6) c = colorPurple;
      else if (randColor > 0.5) c = colorGold;

      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }

    this.starGeometry = new THREE.BufferGeometry();
    this.starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.starGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    this.starMaterial = new THREE.PointsMaterial({
      size: 2.0,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: false // Đảm bảo hạt sao luôn là chấm sáng nhỏ li ti, không bị khối vuông
    });

    this.starPoints = new THREE.Points(this.starGeometry, this.starMaterial);
    this.scene.add(this.starPoints);
  }

  /**
   * Cập nhật chuyển động sao cuộn mượt mà
   */
  update(deltaTime, worldSpeed = 25.0) {
    const moveDist = worldSpeed * deltaTime;

    if (this.starGeometry) {
      const positions = this.starGeometry.attributes.position.array;
      for (let i = 0; i < this.starCount; i++) {
        positions[i * 3 + 2] += moveDist * 0.85;
        if (positions[i * 3 + 2] > 5) {
          positions[i * 3 + 2] = -200 - Math.random() * 20;
          positions[i * 3] = (Math.random() - 0.5) * 140;
        }
      }
      this.starGeometry.attributes.position.needsUpdate = true;
    }
  }
}

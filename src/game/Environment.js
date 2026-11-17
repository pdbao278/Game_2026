import * as THREE from 'three';

/**
 * Environment - Quản lý không gian vũ trụ: Skybox MilkyWay, Bầu trời sao Starfield tinh tế & Làn đường 3D
 * Không bao giờ bị lỗi ô vuông to nhờ sizeAttenuation: false
 */
export class Environment {
  constructor(scene) {
    this.scene = scene;
    this.starCount = 1000;

    // 1. Tải Skybox MilkyWay
    this.setupSkybox();

    // 2. Tạo hệ thống hạt sao Starfield sắc nét dạng điểm kim (Không bị ô vuông)
    this.setupStarfield();

    // 3. Tạo đường băng 5 làn 3D phát sáng rực rỡ hội tụ về chân trời
    this.setupRunwayLanes();

    // 4. Tạo cổng không gian phát sáng tại chân trời
    this.setupHorizonPortal();
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
   * Tạo hệ thống hạt sao dạng điểm kim tinh tế (sizeAttenuation: false triệt tiêu lỗi ô vuông)
   */
  setupStarfield() {
    const positions = new Float32Array(this.starCount * 3);
    const colors = new Float32Array(this.starCount * 3);

    const colorCyan = new THREE.Color(0x00f5ff);
    const colorWhite = new THREE.Color(0xffffff);
    const colorPurple = new THREE.Color(0xb24bf3);
    const colorGold = new THREE.Color(0xffd23f);

    for (let i = 0; i < this.starCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 120;
      positions[i * 3 + 1] = (Math.random() - 0.2) * 60;
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

    // Dùng sizeAttenuation: false để hạt sao luôn là điểm sáng sắc nét (2px), không bao giờ phồng to thành ô vuông
    this.starMaterial = new THREE.PointsMaterial({
      size: 2.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: false
    });

    this.starPoints = new THREE.Points(this.starGeometry, this.starMaterial);
    this.scene.add(this.starPoints);
  }

  /**
   * Tạo đường băng 5 làn 3D phát sáng rực rỡ hội tụ về chân trời
   */
  setupRunwayLanes() {
    this.runwayGroup = new THREE.Group();
    const laneX = [-4.0, -2.0, 0, 2.0, 4.0];

    // 1. Ray phát sáng Neon Cyan cho 5 làn
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x00f5ff,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending
    });

    laneX.forEach((x) => {
      const points = [
        new THREE.Vector3(x, -0.05, 8),
        new THREE.Vector3(x * 0.15, 0.4, -130) // Hội tụ chính xác về chân trời
      ];
      const geom = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(geom, lineMat);
      this.runwayGroup.add(line);
    });

    // 2. Hai ray biên ngoài cùng màu cam rực rỡ
    const edgeMat = new THREE.LineBasicMaterial({
      color: 0xff7700,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending
    });

    [-5.4, 5.4].forEach((x) => {
      const points = [
        new THREE.Vector3(x, -0.02, 8),
        new THREE.Vector3(x * 0.15, 0.4, -130)
      ];
      const geom = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(geom, edgeMat);
      this.runwayGroup.add(line);
    });

    // 3. Vạch ngang phát sáng di chuyển dọc trục Z
    this.horizontalBars = [];
    const barMat = new THREE.MeshBasicMaterial({
      color: 0x00f5ff,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending
    });

    for (let i = 0; i < 20; i++) {
      const barGeom = new THREE.PlaneGeometry(11.0, 0.18);
      const bar = new THREE.Mesh(barGeom, barMat);
      bar.rotation.x = -Math.PI / 2;
      bar.position.set(0, -0.03, -i * 7);
      this.runwayGroup.add(bar);
      this.horizontalBars.push(bar);
    }

    this.scene.add(this.runwayGroup);
  }

  /**
   * Tạo cổng năng lượng phát sáng tại điểm tụ chân trời
   */
  setupHorizonPortal() {
    const ringGeom = new THREE.TorusGeometry(3.5, 0.12, 16, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x00f5ff,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });
    this.portalRing = new THREE.Mesh(ringGeom, ringMat);
    this.portalRing.position.set(0, 1.2, -130);
    this.scene.add(this.portalRing);
  }

  /**
   * Cập nhật chuyển động của sao và đường băng
   * @param {number} deltaTime 
   * @param {number} worldSpeed 
   */
  update(deltaTime, worldSpeed = 25.0) {
    const moveDist = worldSpeed * deltaTime;

    // 1. Cuộn sao về phía trước
    if (this.starGeometry) {
      const positions = this.starGeometry.attributes.position.array;
      for (let i = 0; i < this.starCount; i++) {
        positions[i * 3 + 2] += moveDist * 0.9;
        if (positions[i * 3 + 2] > 5) {
          positions[i * 3 + 2] = -200 - Math.random() * 20;
          positions[i * 3] = (Math.random() - 0.5) * 120;
        }
      }
      this.starGeometry.attributes.position.needsUpdate = true;
    }

    // 2. Cuộn các vạch ngang đường băng và co giãn theo phối cảnh
    if (this.horizontalBars) {
      for (const bar of this.horizontalBars) {
        bar.position.z += moveDist;
        if (bar.position.z > 8) {
          bar.position.z -= 140;
        }
        // Chiều rộng vạch thu nhỏ dần về phía chân trời
        const distRatio = Math.max(0.1, (bar.position.z + 130) / 138);
        bar.scale.x = distRatio;
      }
    }

    // 3. Xoay nhẹ cổng chân trời
    if (this.portalRing) {
      this.portalRing.rotation.z += deltaTime * 0.4;
    }
  }
}

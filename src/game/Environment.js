import * as THREE from 'three';

/**
 * Environment - Quản lý không gian vũ trụ: Skybox MilkyWay, Bầu trời sao Starfield tinh tế & Làn đường 3D
 */
export class Environment {
  constructor(scene) {
    this.scene = scene;
    this.starCount = 800;

    // 1. Tải Skybox MilkyWay
    this.setupSkybox();

    // 2. Tạo hệ thống hạt sao Starfield tinh tế (dùng texture tròn mềm, không bị khối vuông)
    this.setupStarfield();

    // 3. Tạo các vạch dẫn đường 5 làn không gian phát sáng
    this.setupRunwayLanes();
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
   * Tạo hệ thống hạt sao tròn mịn, không bị vỡ khối vuông
   */
  setupStarfield() {
    const positions = new Float32Array(this.starCount * 3);
    const colors = new Float32Array(this.starCount * 3);

    const colorCyan = new THREE.Color(0x00f5ff);
    const colorWhite = new THREE.Color(0xffffff);
    const colorPurple = new THREE.Color(0xb24bf3);

    for (let i = 0; i < this.starCount; i++) {
      // Trải rộng hai bên và phía xa
      positions[i * 3] = (Math.random() - 0.5) * 70;
      positions[i * 3 + 1] = (Math.random() - 0.25) * 40;
      // Z: Giữ ở khoảng xa phía trước camera, không bay sát ống kính để không bị phồng to
      positions[i * 3 + 2] = -Math.random() * 150 - 10;

      const randColor = Math.random();
      let c = colorWhite;
      if (randColor > 0.75) c = colorCyan;
      else if (randColor > 0.5) c = colorPurple;

      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }

    this.starGeometry = new THREE.BufferGeometry();
    this.starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.starGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Nạp texture hạt tròn mịn
    const textureLoader = new THREE.TextureLoader();
    let starTexture;
    try {
      starTexture = textureLoader.load('assets/textures/sprites/disc.png');
    } catch (e) {}

    this.starMaterial = new THREE.PointsMaterial({
      size: 0.8,
      map: starTexture || null,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true
    });

    this.starPoints = new THREE.Points(this.starGeometry, this.starMaterial);
    this.scene.add(this.starPoints);
  }

  /**
   * Tạo đường băng 5 làn sắc nét, rực rỡ
   */
  setupRunwayLanes() {
    this.runwayGroup = new THREE.Group();
    const laneX = [-4.0, -2.0, 0, 2.0, 4.0];

    // 1. Ray phát sáng cho từng làn
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x00f5ff,
      transparent: true,
      opacity: 0.45
    });

    laneX.forEach((x) => {
      const points = [
        new THREE.Vector3(x, -0.05, 5),
        new THREE.Vector3(x * 0.2, -0.05, -120) // Hội tụ dần về chân trời
      ];
      const geom = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(geom, lineMat);
      this.runwayGroup.add(line);
    });

    // 2. Hai ray biên bảo vệ màu vàng/cam
    const edgeMat = new THREE.LineBasicMaterial({
      color: 0xff7700,
      transparent: true,
      opacity: 0.75
    });
    [-5.2, 5.2].forEach((x) => {
      const points = [
        new THREE.Vector3(x, -0.02, 5),
        new THREE.Vector3(x * 0.2, -0.02, -120)
      ];
      const geom = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(geom, edgeMat);
      this.runwayGroup.add(line);
    });

    // 3. Vạch ngang cuộn tới tạo cảm giác tốc độ
    this.horizontalBars = [];
    const barMat = new THREE.MeshBasicMaterial({
      color: 0x6bffff,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending
    });

    for (let i = 0; i < 18; i++) {
      const barGeom = new THREE.PlaneGeometry(10.5, 0.2);
      const bar = new THREE.Mesh(barGeom, barMat);
      bar.rotation.x = -Math.PI / 2;
      bar.position.set(0, -0.04, -i * 8);
      this.runwayGroup.add(bar);
      this.horizontalBars.push(bar);
    }

    this.scene.add(this.runwayGroup);
  }

  /**
   * Cập nhật chuyển động của sao và đường băng
   * @param {number} deltaTime 
   * @param {number} worldSpeed 
   */
  update(deltaTime, worldSpeed = 25.0) {
    const moveDist = worldSpeed * deltaTime;

    // Cuộn sao về phía trước nhưng không để bay sát camera
    if (this.starGeometry) {
      const positions = this.starGeometry.attributes.position.array;
      for (let i = 0; i < this.starCount; i++) {
        positions[i * 3 + 2] += moveDist * 0.8;
        if (positions[i * 3 + 2] > -8) { // Chặn ở -8 trước camera
          positions[i * 3 + 2] = -150 - Math.random() * 20;
          positions[i * 3] = (Math.random() - 0.5) * 70;
        }
      }
      this.starGeometry.attributes.position.needsUpdate = true;
    }

    // Cuộn các vạch ngang đường băng
    if (this.horizontalBars) {
      for (const bar of this.horizontalBars) {
        bar.position.z += moveDist;
        if (bar.position.z > 5) {
          bar.position.z -= 144;
        }
      }
    }
  }
}

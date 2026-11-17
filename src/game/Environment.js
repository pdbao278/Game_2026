import * as THREE from 'three';

/**
 * Environment - Quản lý không gian vũ trụ: Skybox MilkyWay, Bầu trời sao Starfield & Đường bay 5 làn
 */
export class Environment {
  constructor(scene) {
    this.scene = scene;
    this.starCount = 1200;
    this.starSpeedMultiplier = 1.0;

    // 1. Tải Skybox MilkyWay
    this.setupSkybox();

    // 2. Tạo hệ thống hạt sao Starfield lướt tạo tốc độ
    this.setupStarfield();

    // 3. Tạo các vạch dẫn đường 5 làn không gian (Runway Guidelines)
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
        (err) => {
          console.warn('[Environment] Không thể nạp Cubemap Skybox, dùng màu nền tối ưu fallback:', err);
          this.scene.background = new THREE.Color(0x080613);
        }
      );
    } catch (e) {
      this.scene.background = new THREE.Color(0x080613);
    }
  }

  /**
   * Tạo hệ thống hạt sao chuyển động tạo chiều sâu không gian
   */
  setupStarfield() {
    const positions = new Float32Array(this.starCount * 3);
    const colors = new Float32Array(this.starCount * 3);
    const sizes = new Float32Array(this.starCount);

    const colorCyan = new THREE.Color(0x00f5ff);
    const colorWhite = new THREE.Color(0xffffff);
    const colorPurple = new THREE.Color(0xb24bf3);

    for (let i = 0; i < this.starCount; i++) {
      // Tọa độ X: trải rộng hai bên đường bay [-40, 40]
      positions[i * 3] = (Math.random() - 0.5) * 80;
      // Tọa độ Y: từ trên cao xuống dưới [-15, 30]
      positions[i * 3 + 1] = (Math.random() - 0.3) * 45;
      // Tọa độ Z: trải dọc từ sau camera tới sâu vào chân trời [-160, 10]
      positions[i * 3 + 2] = -Math.random() * 180 + 10;

      // Màu sao: pha trộn trắng, cyan và tím mộng mơ
      const randColor = Math.random();
      let c = colorWhite;
      if (randColor > 0.8) c = colorCyan;
      else if (randColor > 0.6) c = colorPurple;

      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;

      sizes[i] = Math.random() * 2.5 + 1.0;
    }

    this.starGeometry = new THREE.BufferGeometry();
    this.starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.starGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    this.starGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    // Material điểm hạt với vertexColors
    this.starMaterial = new THREE.PointsMaterial({
      size: 1.8,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.starPoints = new THREE.Points(this.starGeometry, this.starMaterial);
    this.scene.add(this.starPoints);
  }

  /**
   * Tạo lưới sàn và vạch làn mờ ảo Neo-Arcade trên đường bay
   */
  setupRunwayLanes() {
    this.runwayGroup = new THREE.Group();
    const laneX = [-4.0, -2.0, 0, 2.0, 4.0];

    // Vẽ các đường kẻ dọc mờ cho từng làn
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x00f5ff,
      transparent: true,
      opacity: 0.18
    });

    laneX.forEach((x) => {
      const points = [];
      points.push(new THREE.Vector3(x, -0.05, 10));
      points.push(new THREE.Vector3(x, -0.05, -150));
      const geom = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(geom, lineMat);
      this.runwayGroup.add(line);
    });

    // Tạo các vạch ngang cuộn tới (Scroll markers)
    this.horizontalBars = [];
    const barMat = new THREE.MeshBasicMaterial({
      color: 0x6bffff,
      transparent: true,
      opacity: 0.25
    });

    for (let i = 0; i < 15; i++) {
      const barGeom = new THREE.PlaneGeometry(10.0, 0.15);
      const bar = new THREE.Mesh(barGeom, barMat);
      bar.rotation.x = -Math.PI / 2;
      bar.position.set(0, -0.04, -i * 10);
      this.runwayGroup.add(bar);
      this.horizontalBars.push(bar);
    }

    this.scene.add(this.runwayGroup);
  }

  /**
   * Cập nhật chuyển động của sao và đường băng theo tốc độ game
   * @param {number} deltaTime Thời gian mỗi khung hình
   * @param {number} worldSpeed Tốc độ cuộn của thế giới
   */
  update(deltaTime, worldSpeed = 25.0) {
    const moveDist = worldSpeed * deltaTime;

    // 1. Cuộn các hạt sao dọc trục Z về phía camera
    if (this.starGeometry) {
      const positions = this.starGeometry.attributes.position.array;
      for (let i = 0; i < this.starCount; i++) {
        positions[i * 3 + 2] += moveDist * 1.2;
        // Nếu hạt sao vượt quá sau camera (Z > 12), đưa về lại tít chân trời (Z = -160)
        if (positions[i * 3 + 2] > 12) {
          positions[i * 3 + 2] = -160 - Math.random() * 20;
          positions[i * 3] = (Math.random() - 0.5) * 80;
        }
      }
      this.starGeometry.attributes.position.needsUpdate = true;
    }

    // 2. Cuộn các vạch ngang đường băng
    if (this.horizontalBars) {
      for (const bar of this.horizontalBars) {
        bar.position.z += moveDist;
        if (bar.position.z > 8) {
          bar.position.z -= 150;
        }
      }
    }
  }
}

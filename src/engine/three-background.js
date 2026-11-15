// Three.js 3D Bioluminescent Ocean Engine
// Môi trường vực biển sâu thẳm, hạt phù du 3D, sương mù nước và ánh sáng phát quang

import * as THREE from 'three';

export class Ocean3DScene {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Scene & Fog (Vực biển sâu)
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x020b14);
    this.scene.fog = new THREE.FogExp2(0x020b14, 0.015);

    // Camera Perspective
    this.camera = new THREE.PerspectiveCamera(55, this.width / this.height, 0.1, 1000);
    this.camera.position.set(0, 0, 45);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x0d3b66, 1.2);
    this.scene.add(ambientLight);

    this.cyanLight = new THREE.PointLight(0x00f5d4, 2.5, 60);
    this.cyanLight.position.set(-10, 5, 20);
    this.scene.add(this.cyanLight);

    this.purpleLight = new THREE.PointLight(0x7209b7, 2.0, 70);
    this.purpleLight.position.set(15, -10, 15);
    this.scene.add(this.purpleLight);

    // Particle System: Bong bóng & Sinh vật phù du phát quang
    this.initParticles();

    // 3D Background Silhouettes (Vách đá ngầm xa xăm)
    this.initBackdropMesh();

    // Resize listener
    window.addEventListener('resize', () => this.onResize());

    this.time = 0;
    this.scrollSpeed = 1.0;
  }

  initParticles() {
    const particleCount = 400;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const scales = new Float32Array(particleCount);

    const color1 = new THREE.Color(0x00f5d4); // Cyan
    const color2 = new THREE.Color(0xfee440); // Golden
    const color3 = new THREE.Color(0x4cc9f0); // Light blue

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 120;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 70;
      positions[i * 3 + 2] = -Math.random() * 80 + 10;

      const chosenColor = Math.random() > 0.6 ? color1 : (Math.random() > 0.5 ? color2 : color3);
      colors[i * 3] = chosenColor.r;
      colors[i * 3 + 1] = chosenColor.g;
      colors[i * 3 + 2] = chosenColor.b;

      scales[i] = Math.random() * 2.0 + 0.5;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Custom Canvas Texture cho hạt tròn mềm mại
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.4, 'rgba(0, 245, 212, 0.6)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 32, 32);

    const texture = new THREE.CanvasTexture(canvas);

    const material = new THREE.PointsMaterial({
      size: 1.6,
      map: texture,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);
  }

  initBackdropMesh() {
    // Tạo các cột san hô/thạch nhũ xa 3D Low-poly
    const group = new THREE.Group();
    const pillarGeo = new THREE.ConeGeometry(3, 35, 5);
    const pillarMat = new THREE.MeshStandardMaterial({
      color: 0x061e38,
      roughness: 0.9,
      metalness: 0.1,
      flatShading: true
    });

    for (let i = 0; i < 12; i++) {
      const topPillar = new THREE.Mesh(pillarGeo, pillarMat);
      topPillar.position.set((i - 6) * 16, 22 + Math.random() * 4, -40);
      topPillar.rotation.z = Math.PI + (Math.random() - 0.5) * 0.3;
      group.add(topPillar);

      const bottomPillar = new THREE.Mesh(pillarGeo, pillarMat);
      bottomPillar.position.set((i - 6) * 16 + 8, -22 - Math.random() * 4, -40);
      bottomPillar.rotation.z = (Math.random() - 0.5) * 0.3;
      group.add(bottomPillar);
    }

    this.backdropGroup = group;
    this.scene.add(group);
  }

  onResize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height);
  }

  update(dt, playerNormPos = { x: 0.2, y: 0.5 }, isDashing = false) {
    this.time += dt;

    // Tốc độ cuộn parallax
    const speedMult = isDashing ? 2.5 : 1.0;
    const moveX = dt * 14 * this.scrollSpeed * speedMult;

    // Cập nhật vị trí hạt bong bóng/phù du
    const positions = this.particles.geometry.attributes.position.array;
    for (let i = 0; i < positions.length; i += 3) {
      // Trôi từ phải qua trái
      positions[i] -= moveX * (0.4 + (positions[i + 2] + 80) / 100);

      // Dao động uốn lượn hình sin
      positions[i + 1] += Math.sin(this.time * 2 + positions[i]) * dt * 3.5;

      // Khi trôi qua mép trái màn hình, vòng lại mép phải
      if (positions[i] < -60) {
        positions[i] = 60 + Math.random() * 10;
        positions[i + 1] = (Math.random() - 0.5) * 70;
      }
    }
    this.particles.geometry.attributes.position.needsUpdate = true;

    // Cuộn vách đá 3D phía sau (Parallax cực xa)
    this.backdropGroup.position.x -= moveX * 0.15;
    if (this.backdropGroup.position.x < -32) {
      this.backdropGroup.position.x += 32;
    }

    // Đèn cyan di chuyển theo vị trí tương đối của người chơi
    const targetLightX = (playerNormPos.x - 0.5) * 40;
    const targetLightY = -(playerNormPos.y - 0.5) * 25;
    this.cyanLight.position.x += (targetLightX - this.cyanLight.position.x) * 0.1;
    this.cyanLight.position.y += (targetLightY - this.cyanLight.position.y) * 0.1;

    // Ánh sáng bập bùng nhẹ
    this.cyanLight.intensity = (isDashing ? 4.5 : 2.5) + Math.sin(this.time * 5) * 0.4;

    this.renderer.render(this.scene, this.camera);
  }
}


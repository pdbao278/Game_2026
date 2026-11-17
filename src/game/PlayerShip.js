import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { PlayerShipState } from './PlayerShipState.js';
import { globalEventBus } from '../core/EventBus.js';

/**
 * PlayerShip - Đại diện 3D cho phi thuyền của người chơi
 * Quản lý Mesh 3D, vệt lửa động cơ, ánh sáng phát quang theo pha và chuyển động
 */
export class PlayerShip {
  constructor(scene, laneSystem) {
    this.scene = scene;
    this.laneSystem = laneSystem;
    this.state = new PlayerShipState();

    // Group chứa toàn bộ mô hình tàu và các hiệu ứng đi kèm
    this.mesh = new THREE.Group();
    this.mesh.position.set(0, 0.45, 0); // Đặt trên sàn bay một chút
    this.scene.add(this.mesh);

    // Bảng màu nhận diện 2 pha
    this.COLOR_CYAN = new THREE.Color(0x00f5ff);
    this.COLOR_ORANGE = new THREE.Color(0xff7700);

    // Danh sách các vật liệu phát sáng trên thân tàu để đổi màu theo pha
    this.emissiveMaterials = [];

    // Tải mô hình 3D hoặc dựng Fallback
    this.loadShipModel();

    // Tạo vệt lửa phản lực đuôi tàu
    this.setupThrusters();

    // Tạo nguồn sáng phát quang dưới gầm tàu
    this.phaseLight = new THREE.PointLight(this.COLOR_CYAN, 3.5, 6);
    this.phaseLight.position.set(0, 0.2, 0.5);
    this.mesh.add(this.phaseLight);

    // Góc nghiêng thân tàu khi lướt làn (banking tilt)
    this.currentRoll = 0;
  }

  /**
   * Tải mô hình 3D `craft_racer.glb` từ Kenney Space Kit
   */
  loadShipModel() {
    const loader = new GLTFLoader();
    const modelUrl = 'assets/models/Models/GLTF format/craft_racer.glb';

    loader.load(
      modelUrl,
      (gltf) => {
        this.shipModel = gltf.scene;
        // Chuẩn hóa tỷ lệ và xoay đầu tàu hướng về phía trước (-Z)
        this.shipModel.scale.set(1.2, 1.2, 1.2);
        this.shipModel.rotation.y = Math.PI; // Xoay 180 độ vì model hướng ngược lại

        // Duyệt qua các Mesh để gắn vật liệu phát quang
        this.shipModel.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            if (child.material) {
              // Nhân bản material để không ảnh hưởng các vật thể khác
              child.material = child.material.clone();
              child.material.roughness = 0.3;
              child.material.metalness = 0.7;
              
              // Nếu tên mesh hoặc vật liệu liên quan đến kính/đèn -> cho phát sáng
              child.material.emissive = this.COLOR_CYAN.clone();
              child.material.emissiveIntensity = 0.8;
              this.emissiveMaterials.push(child.material);
            }
          }
        });

        this.mesh.add(this.shipModel);
        this.updatePhaseVisuals();
      },
      undefined,
      (err) => {
        console.warn('[PlayerShip] Không thể nạp GLB, kích hoạt Procedural Low-Poly Ship fallback:', err);
        this.createProceduralShip();
      }
    );
  }

  /**
   * Tạo mô hình tàu Low-Poly Procedural đẹp mắt làm phương án dự phòng
   */
  createProceduralShip() {
    const shipGroup = new THREE.Group();

    // Thân chính (Thoi nhọn khí động học)
    const bodyGeom = new THREE.ConeGeometry(0.7, 2.4, 4);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x1f183d,
      roughness: 0.25,
      metalness: 0.8,
      flatShading: true
    });
    const bodyMesh = new THREE.Mesh(bodyGeom, bodyMat);
    bodyMesh.rotation.x = -Math.PI / 2;
    bodyMesh.rotation.y = Math.PI / 4;
    shipGroup.add(bodyMesh);

    // Kính buồng lái phát quang
    const cockpitGeom = new THREE.BoxGeometry(0.35, 0.25, 0.7);
    const cockpitMat = new THREE.MeshStandardMaterial({
      color: 0x080613,
      emissive: this.COLOR_CYAN,
      emissiveIntensity: 1.5,
      roughness: 0.1
    });
    this.emissiveMaterials.push(cockpitMat);
    const cockpitMesh = new THREE.Mesh(cockpitGeom, cockpitMat);
    cockpitMesh.position.set(0, 0.3, -0.1);
    shipGroup.add(cockpitMesh);

    // Cánh trái & phải
    const wingGeom = new THREE.BufferGeometry();
    const wingVertices = new Float32Array([
      0, 0, 0.4,
      1.5, 0, 1.0,
      0, 0, -0.6,
      0, 0, 0.4,
      -1.5, 0, 1.0,
      0, 0, -0.6
    ]);
    wingGeom.setAttribute('position', new THREE.BufferAttribute(wingVertices, 3));
    wingGeom.computeVertexNormals();
    const wingMat = new THREE.MeshStandardMaterial({
      color: 0x2d2358,
      roughness: 0.3,
      metalness: 0.7,
      side: THREE.DoubleSide
    });
    const wingMesh = new THREE.Mesh(wingGeom, wingMat);
    shipGroup.add(wingMesh);

    this.shipModel = shipGroup;
    this.mesh.add(this.shipModel);
    this.updatePhaseVisuals();
  }

  /**
   * Tạo hiệu ứng vệt lửa phản lực đuôi tàu
   */
  setupThrusters() {
    const textureLoader = new THREE.TextureLoader();
    const flameTexture = textureLoader.load('assets/textures/particles/PNG (Transparent)/flame_01.png');

    const flameMat = new THREE.SpriteMaterial({
      map: flameTexture,
      color: this.COLOR_CYAN,
      transparent: true,
      blending: THREE.AdditiveBlending,
      opacity: 0.95
    });

    this.thrusterSprite = new THREE.Sprite(flameMat);
    this.thrusterSprite.scale.set(0.9, 1.6, 1);
    this.thrusterSprite.position.set(0, 0.1, 1.3);
    this.mesh.add(this.thrusterSprite);
  }

  /**
   * Chuyển làn sang trái
   */
  moveLeft() {
    if (this.laneSystem.moveLeft()) {
      this.state.targetX = this.laneSystem.getTargetX();
      globalEventBus.emit('player-lane-change', {
        laneIndex: this.laneSystem.currentLaneIndex,
        targetX: this.state.targetX
      });
      return true;
    }
    return false;
  }

  /**
   * Chuyển làn sang phải
   */
  moveRight() {
    if (this.laneSystem.moveRight()) {
      this.state.targetX = this.laneSystem.getTargetX();
      globalEventBus.emit('player-lane-change', {
        laneIndex: this.laneSystem.currentLaneIndex,
        targetX: this.state.targetX
      });
      return true;
    }
    return false;
  }

  /**
   * Đổi trạng thái năng lượng giữa CYAN và ORANGE
   */
  switchPhase() {
    if (this.state.switchPhase()) {
      this.updatePhaseVisuals();
      globalEventBus.emit('phase-changed', {
        phase: this.state.phase,
        color: this.state.phase === 'CYAN' ? '#00F5FF' : '#FF7700'
      });
      return true;
    }
    return false;
  }

  /**
   * Cập nhật màu sắc thị giác theo pha hiện tại
   */
  updatePhaseVisuals() {
    const isCyan = this.state.phase === 'CYAN';
    const targetColor = isCyan ? this.COLOR_CYAN : this.COLOR_ORANGE;

    // 1. Đổi màu phát quang trên các vật liệu thân tàu
    for (const mat of this.emissiveMaterials) {
      mat.emissive.copy(targetColor);
    }

    // 2. Đổi màu vệt lửa phản lực
    if (this.thrusterSprite && this.thrusterSprite.material) {
      this.thrusterSprite.material.color.copy(targetColor);
    }

    // 3. Đổi màu ánh sáng gầm tàu
    if (this.phaseLight) {
      this.phaseLight.color.copy(targetColor);
    }
  }

  /**
   * Xử lý khi tàu bị va chạm
   */
  takeDamage(amount = 1) {
    if (this.state.takeDamage(amount)) {
      globalEventBus.emit('player-damage', {
        health: this.state.health,
        maxHealth: this.state.maxHealth
      });
      return true;
    }
    return false;
  }

  /**
   * Hồi máu
   */
  heal(amount = 1) {
    this.state.heal(amount);
    globalEventBus.emit('player-heal', {
      health: this.state.health,
      maxHealth: this.state.maxHealth
    });
  }

  /**
   * Cập nhật vị trí, góc nghiêng và hoạt ảnh mỗi khung hình
   * @param {number} deltaTime Thời gian mỗi khung hình
   */
  update(deltaTime) {
    this.state.updateState(deltaTime);

    // 1. Di chuyển ngang mượt mà theo LaneSystem
    const prevX = this.state.currentX;
    this.state.currentX = this.laneSystem.updatePosition(this.state.currentX, deltaTime);
    this.mesh.position.x = this.state.currentX;

    // 2. Độ nghiêng thân tàu khi lướt làn (Roll tilt)
    const velocityX = (this.state.currentX - prevX) / (deltaTime || 0.016);
    const targetRoll = -Math.max(-0.45, Math.min(0.45, velocityX * 0.04));
    this.currentRoll += (targetRoll - this.currentRoll) * Math.min(deltaTime * 12.0, 1.0);
    this.mesh.rotation.z = this.currentRoll;

    // Nhấp nhô nhẹ trục Y tạo cảm giác phi thuyền đang bay lơ lửng
    this.mesh.position.y = 0.45 + Math.sin(Date.now() * 0.004) * 0.06;

    // 3. Hiệu ứng chớp nháy khi bất tử (invincible blink)
    if (this.state.isInvincible) {
      const blink = Math.sin(this.state.invincibleTimer * 30) > 0;
      this.mesh.visible = blink;
    } else {
      this.mesh.visible = true;
    }

    // 4. Nhấp nháy vệt lửa đuôi tàu
    if (this.thrusterSprite) {
      const flicker = 1.4 + Math.sin(Date.now() * 0.05) * 0.3;
      this.thrusterSprite.scale.y = flicker;
    }
  }

  /**
   * Đặt lại tàu về trạng thái ban đầu
   */
  reset() {
    this.state.reset();
    this.laneSystem.setLane(2);
    this.state.currentX = this.laneSystem.getTargetX();
    this.state.targetX = this.state.currentX;
    this.mesh.position.set(0, 0.45, 0);
    this.mesh.rotation.z = 0;
    this.mesh.visible = true;
    this.updatePhaseVisuals();
  }
}


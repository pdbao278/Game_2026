// Game Engine Phaser 4 - Aqua Dash: Bioluminescent Odyssey
// Tích hợp Phaser 4 WebGL/Canvas với Arcade Physics, Boids AI và hiệu ứng hạt bioluminescent

import Phaser from 'phaser';
import { sound } from './audio.js';
import { FishFlockSystem } from './boids-ai.js';

class AquaDashScene extends Phaser.Scene {
  constructor(engineWrapper) {
    super({ key: 'AquaDashScene' });
    this.engineWrapper = engineWrapper;
    this.isReady = false;
  }

  init(data) {
    if (data && data.engineWrapper) {
      this.engineWrapper = data.engineWrapper;
    }
  }

  preload() {
    this.load.on('loaderror', (fileObj) => {
      console.warn('Lỗi tải tài nguyên hình ảnh:', fileObj.key, fileObj.url);
    });

    // Nạp các asset hình ảnh SVG qua bộ nạp Image trực tiếp của trình duyệt
    this.load.image('player-fish', '/assets/player-fish.svg');
    this.load.image('player-dash', '/assets/player-dash.svg');
    this.load.image('boid-escort', '/assets/boid-escort.svg');
    this.load.image('starfish', '/assets/starfish.svg');
    this.load.image('pearl', '/assets/pearl.svg');
    this.load.image('pillar-solid', '/assets/coral-pillar-solid.svg');
    this.load.image('pillar-fractured', '/assets/coral-pillar-fractured.svg');
  }

  create() {
    this.gameWidth = this.scale.width || window.innerWidth || 1200;
    this.gameHeight = this.scale.height || window.innerHeight || 800;

    // 1. Tạo sẵn texture đồ họa dự phòng (Procedural Fallback) đảm bảo luôn thấy cá 100%
    if (!this.textures.exists('fish-procedural')) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0x00f5d4, 1);
      g.fillEllipse(32, 34, 40, 26);
      g.fillStyle(0xffffff, 0.95);
      g.fillCircle(42, 30, 6);
      g.fillStyle(0x03071e, 1);
      g.fillCircle(43, 30, 3.5);
      g.fillStyle(0xffffff, 1);
      g.fillCircle(44, 29, 1.5);
      g.fillStyle(0x0077b6, 0.85);
      g.fillTriangle(14, 34, 2, 22, 2, 46);
      g.lineStyle(2, 0x00f5d4, 1);
      g.strokeLineShape(new Phaser.Geom.Line(38, 22, 50, 14));
      g.fillStyle(0xfee440, 1);
      g.fillCircle(50, 14, 4);
      g.generateTexture('fish-procedural', 64, 64);
    }

    if (!this.textures.exists('dash-procedural')) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0xff0054, 1);
      g.fillCircle(32, 32, 24);
      g.fillStyle(0xfee440, 1);
      for (let i = 0; i < 8; i++) {
        const a = (i * Math.PI * 2) / 8;
        const x1 = 32 + Math.cos(a) * 22;
        const y1 = 32 + Math.sin(a) * 22;
        const x2 = 32 + Math.cos(a) * 31;
        const y2 = 32 + Math.sin(a) * 31;
        g.lineStyle(3, 0xfee440, 1);
        g.strokeLineShape(new Phaser.Geom.Line(x1, y1, x2, y2));
      }
      g.fillStyle(0xffffff, 1);
      g.fillCircle(40, 28, 5);
      g.fillStyle(0x03071e, 1);
      g.fillCircle(41, 28, 3);
      g.generateTexture('dash-procedural', 64, 64);
    }

    // 2. Nhóm đối tượng Arcade Physics
    this.pillarsGroup = this.physics.add.group();
    this.collectiblesGroup = this.physics.add.group();
    this.geysersGroup = this.physics.add.group();

    // 3. Tạo Sprite Người chơi (Player Fish)
    const playerKey = this.textures.exists('player-fish') ? 'player-fish' : 'fish-procedural';
    this.playerSprite = this.physics.add.sprite(180, this.gameHeight / 2, playerKey);
    this.playerSprite.setOrigin(0.5, 0.5);
    this.playerSprite.setScale(1.1);
    this.playerSprite.setDepth(10); // Đảm bảo cá luôn vẽ trên cùng
    this.playerSprite.setCircle(18, 14, 14);
    this.playerSprite.setCollideWorldBounds(true);
    this.playerSprite.body.allowGravity = false; // Tắt gravity khi ở MENU để không bị rơi mất

    // 4. Đàn cá AI Hộ mệnh (Boids System)
    this.flock = new FishFlockSystem(3);
    const boidKey = this.textures.exists('boid-escort') ? 'boid-escort' : 'fish-procedural';
    this.boidSprites = [];
    for (let i = 0; i < 5; i++) {
      const boid = this.add.image(100, this.gameHeight / 2, boidKey);
      boid.setScale(0.7);
      boid.setDepth(9);
      boid.setVisible(i < 3);
      this.boidSprites.push(boid);
    }

    // 5. Hiệu ứng Hạt (Phaser Particle Emitters)
    try {
      if (!this.textures.exists('bubble-particle')) {
        const bubbleGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        bubbleGraphics.fillStyle(0x00f5d4, 0.8);
        bubbleGraphics.fillCircle(4, 4, 4);
        bubbleGraphics.generateTexture('bubble-particle', 8, 8);
      }

      this.bubbleEmitter = this.add.particles(0, 0, 'bubble-particle', {
        speed: { min: 40, max: 100 },
        angle: { min: 160, max: 200 },
        scale: { start: 0.8, end: 0 },
        alpha: { start: 0.8, end: 0 },
        lifespan: 600,
        emitting: false
      });
      this.bubbleEmitter.setDepth(5);
    } catch (e) {
      console.warn('Particle bubble init warning:', e);
      this.bubbleEmitter = null;
    }

    try {
      if (!this.textures.exists('rock-debris')) {
        const debrisGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        debrisGraphics.fillStyle(0xfee440, 1);
        debrisGraphics.fillRect(0, 0, 6, 6);
        debrisGraphics.generateTexture('rock-debris', 6, 6);
      }

      this.debrisEmitter = this.add.particles(0, 0, 'rock-debris', {
        speed: { min: 80, max: 260 },
        scale: { start: 1.2, end: 0.2 },
        alpha: { start: 1, end: 0 },
        lifespan: 800,
        emitting: false
      });
      this.debrisEmitter.setDepth(6);
    } catch (e) {
      console.warn('Particle debris init warning:', e);
      this.debrisEmitter = null;
    }

    // 6. Xử lý va chạm
    this.physics.add.overlap(this.playerSprite, this.collectiblesGroup, (player, item) => {
      this.collectItem(item);
    });

    this.physics.add.overlap(this.playerSprite, this.pillarsGroup, (player, pillar) => {
      this.hitPillar(pillar);
    });

    // Xử lý Resize
    this.scale.on('resize', (gameSize) => {
      this.gameWidth = gameSize.width;
      this.gameHeight = gameSize.height;
    });

    // Bộ đếm màn chơi
    this.spawnTimer = 0;
    this.spawnInterval = 2.1;
    this.baseSpeed = 210;

    // Khởi tạo trạng thái
    this.isDashing = false;
    this.dashTimer = 0;
    this.invulnerableTimer = 0;
    this.stamina = 100;
    this.isReady = true;
  }

  handleSwim() {
    if (!this.isReady || !this.playerSprite || !this.playerSprite.body) return;
    if (this.engineWrapper.state !== 'PLAYING') return;

    this.playerSprite.setVelocityY(-360);
    sound.playSwim();

    // Sinh bọt nước quẫy đuôi
    if (this.bubbleEmitter && this.bubbleEmitter.emitParticleAt) {
      this.bubbleEmitter.emitParticleAt(this.playerSprite.x - 20, this.playerSprite.y, 4);
    }
  }

  handleDash() {
    if (!this.isReady || !this.playerSprite || !this.playerSprite.body) return;
    if (this.engineWrapper.state !== 'PLAYING') return;
    if (this.isDashing || this.stamina < 35) return;

    this.stamina -= 35;
    this.isDashing = true;
    this.dashTimer = 1.2;
    this.invulnerableTimer = 1.4;

    const dashKey = this.textures.exists('player-dash') ? 'player-dash' : 'dash-procedural';
    this.playerSprite.setTexture(dashKey);
    this.playerSprite.setScale(1.35);
    this.playerSprite.setVelocityX(140);

    sound.playDash();
    this.cameras.main.shake(200, 0.015);
  }

  collectItem(item) {
    if (item.collected) return;
    item.collected = true;

    if (item.itemType === 'pearl') {
      this.engineWrapper.score += 1;
      this.engineWrapper.pearlCount += 1;
      this.engineWrapper.pearlComboForSpawn += 1;
      sound.playPearl();

      // Cứ 3 viên ngọc hồi sinh 1 cá con
      if (this.engineWrapper.pearlComboForSpawn >= 3) {
        this.engineWrapper.pearlComboForSpawn = 0;
        this.flock.addFish(this.playerSprite.x - 40, this.playerSprite.y);
      }
    } else {
      // Sao biển
      this.engineWrapper.score += 5;
      this.stamina = Math.min(100, this.stamina + 25);
      sound.playStar();
    }

    item.destroy();
  }

  hitPillar(pillar) {
    if (pillar.broken) return;

    if (this.isDashing && pillar.fractured) {
      // Phình gai húc vỡ cột đá nứt!
      pillar.broken = true;
      this.engineWrapper.score += 10;
      this.engineWrapper.brokenRocksCount += 1;
      sound.playBreak();

      if (this.debrisEmitter && this.debrisEmitter.emitParticleAt) {
        this.debrisEmitter.emitParticleAt(pillar.x, pillar.y + (pillar.displayHeight || 40) / 2, 20);
      }
      this.cameras.main.shake(300, 0.025);
      pillar.destroy();
      return;
    }

    if (this.invulnerableTimer > 0) return;

    // Va chạm gây sát thương
    if (this.flock.boids.length > 0) {
      // 1 cá con hy sinh đỡ đòn
      this.flock.boids.pop();
      this.invulnerableTimer = 1.6;
      sound.playHurt();
      this.cameras.main.shake(250, 0.02);
    } else {
      // Hết mạng -> Game Over
      this.engineWrapper.gameOver();
    }
  }

  spawnObstaclePair() {
    const gap = 200;
    const minH = 80;
    const maxH = this.gameHeight - gap - minH;
    const topH = Phaser.Math.Between(minH, maxH);
    const bottomH = this.gameHeight - topH - gap;
    const isFractured = Math.random() < 0.35;

    const textureKey = isFractured ? 'pillar-fractured' : 'pillar-solid';

    // Cột trên
    const topPillar = this.pillarsGroup.create(this.gameWidth + 40, topH / 2, textureKey);
    topPillar.setDisplaySize(60, topH);
    topPillar.body.allowGravity = false;
    topPillar.body.immovable = true;
    topPillar.fractured = isFractured;
    topPillar.isTop = true;
    topPillar.setDepth(2);

    // Cột dưới
    const bottomPillar = this.pillarsGroup.create(this.gameWidth + 40, this.gameHeight - bottomH / 2, textureKey);
    bottomPillar.setDisplaySize(60, bottomH);
    bottomPillar.body.allowGravity = false;
    bottomPillar.body.immovable = true;
    bottomPillar.fractured = isFractured;
    bottomPillar.isTop = false;
    bottomPillar.setDepth(2);

    // Sinh vật phẩm ở khe hở an toàn
    const itemY = topH + gap / 2 + (Math.random() - 0.5) * 40;
    const isStar = Math.random() < 0.22;
    const itemType = isStar ? 'starfish' : 'pearl';
    const item = this.collectiblesGroup.create(this.gameWidth + 40, itemY, itemType);
    item.setDisplaySize(36, 36);
    item.body.allowGravity = false;
    item.itemType = itemType;
    item.collected = false;
    item.setDepth(4);
  }

  update(time, delta) {
    if (!this.isReady || !this.playerSprite || !this.playerSprite.body) return;
    if (!this.engineWrapper) return;

    const dt = delta / 1000;

    // Ở màn hình MENU: Cá bơi bồng bềnh tại chỗ
    if (this.engineWrapper.state === 'MENU') {
      this.playerSprite.body.allowGravity = false;
      this.playerSprite.body.setVelocity(0, 0);
      this.playerSprite.y = (this.gameHeight / 2) + Math.sin(time / 350) * 12;
      this.playerSprite.rotation = Math.sin(time / 350) * 0.1;

      // Cập nhật tọa độ cho Three.js
      this.engineWrapper.player.x = this.playerSprite.x;
      this.engineWrapper.player.y = this.playerSprite.y;
      this.engineWrapper.player.isDashing = false;
      this.engineWrapper.player.stamina = 100;
      return;
    }

    // Phục hồi vị trí x của cá sau Dash
    if (this.playerSprite.x > 180) {
      this.playerSprite.x -= 30 * dt;
    }

    // Góc nghiêng theo vận tốc bơi
    const vy = this.playerSprite.body.velocity.y;
    this.playerSprite.rotation = Phaser.Math.Clamp(vy * 0.0012, -0.45, 0.6);

    // Trạng thái lướt Dash & Bất tử
    if (this.isDashing) {
      this.dashTimer -= dt;
      if (this.dashTimer <= 0) {
        this.isDashing = false;
        const playerKey = this.textures.exists('player-fish') ? 'player-fish' : 'fish-procedural';
        this.playerSprite.setTexture(playerKey);
        this.playerSprite.setScale(1.1);
        this.playerSprite.setVelocityX(0);
      }
    } else {
      this.stamina = Math.min(100, this.stamina + 22 * dt);
    }

    if (this.invulnerableTimer > 0) {
      this.invulnerableTimer -= dt;
      this.playerSprite.alpha = Math.floor(time / 100) % 2 === 0 ? 0.3 : 1;
    } else {
      this.playerSprite.alpha = 1;
    }

    // Di chuyển chướng ngại vật & vật phẩm sang trái khi đang chơi
    if (this.engineWrapper.state === 'PLAYING') {
      const scrollSpeed = this.baseSpeed + this.engineWrapper.score * 2.5;

      this.pillarsGroup.getChildren().forEach((p) => {
        p.x -= scrollSpeed * dt;
        if (p.x < -80) p.destroy();
      });

      this.collectiblesGroup.getChildren().forEach((c) => {
        c.x -= scrollSpeed * dt;
        if (c.x < -60) c.destroy();
      });

      // Sinh chướng ngại vật định kỳ
      this.spawnTimer += dt;
      if (this.spawnTimer >= this.spawnInterval) {
        this.spawnTimer = 0;
        this.spawnInterval = Math.max(1.4, 2.1 - this.engineWrapper.score * 0.015);
        this.spawnObstaclePair();
      }
    }

    // Cập nhật bầy cá Boids AI
    const leaderPos = { x: this.playerSprite.x, y: this.playerSprite.y };
    const collectibles = this.collectiblesGroup.getChildren().map(c => ({
      x: c.x, y: c.y, collected: c.collected,
      radius: 18,
      itemRef: c
    }));

    this.flock.update(dt, leaderPos, collectibles);

    // Đồng bộ sprite hiển thị của đàn cá con
    this.boidSprites.forEach((sprite, index) => {
      if (index < this.flock.boids.length) {
        const b = this.flock.boids[index];
        sprite.setVisible(true);
        sprite.setPosition(b.x, b.y);
        sprite.setRotation(b.angle);
      } else {
        sprite.setVisible(false);
      }
    });

    // Cập nhật wrapper cho Three.js và UI
    this.engineWrapper.player.x = this.playerSprite.x;
    this.engineWrapper.player.y = this.playerSprite.y;
    this.engineWrapper.player.isDashing = this.isDashing;
    this.engineWrapper.player.stamina = this.stamina;

    this.engineWrapper.notifyUI();
  }

  resetGame() {
    if (!this.isReady || !this.playerSprite || !this.playerSprite.body) return;

    this.playerSprite.setPosition(180, this.gameHeight / 2);
    this.playerSprite.setVelocity(0, 0);
    this.playerSprite.body.allowGravity = true;
    this.playerSprite.body.setGravityY(920);

    const playerKey = this.textures.exists('player-fish') ? 'player-fish' : 'fish-procedural';
    this.playerSprite.setTexture(playerKey);
    this.playerSprite.setScale(1.1);

    this.pillarsGroup.clear(true, true);
    this.collectiblesGroup.clear(true, true);

    this.flock = new FishFlockSystem(3);
    this.isDashing = false;
    this.dashTimer = 0;
    this.invulnerableTimer = 0;
    this.stamina = 100;
    this.spawnTimer = 0;
  }
}

export class PhaserGameEngine {
  constructor(canvas, onStateChange) {
    this.canvas = canvas;
    this.onStateChange = onStateChange;

    this.state = 'MENU';
    this.score = 0;
    this.pearlCount = 0;
    this.brokenRocksCount = 0;
    this.pearlComboForSpawn = 0;
    this.highScore = parseInt(localStorage.getItem('aquadash_highscore') || '0', 10);

    this.player = {
      x: 180,
      y: window.innerHeight / 2,
      isDashing: false,
      stamina: 100
    };

    // Tạo Scene instance với engineWrapper gắn sẵn
    const scene = new AquaDashScene(this);
    this.sceneInstance = scene;

    const config = {
      type: Phaser.AUTO,
      canvas: this.canvas,
      width: window.innerWidth,
      height: window.innerHeight,
      transparent: true,
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 0 },
          debug: false
        }
      },
      scale: {
        mode: Phaser.Scale.RESIZE
      },
      scene: [scene]
    };

    try {
      this.phaserGame = new Phaser.Game(config);
    } catch (e) {
      console.error('Lỗi khởi tạo Phaser.Game:', e);
    }
  }

  getScene() {
    return this.sceneInstance;
  }

  start() {
    this.state = 'PLAYING';
    this.score = 0;
    this.pearlCount = 0;
    this.brokenRocksCount = 0;
    this.pearlComboForSpawn = 0;

    const scene = this.getScene();
    if (scene && scene.resetGame) {
      scene.resetGame();
    }
    this.notifyUI();
  }

  gameOver() {
    this.state = 'GAMEOVER';
    sound.playGameOver();

    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem('aquadash_highscore', this.highScore.toString());
    }

    this.notifyUI();
  }

  handleSwimInput() {
    const scene = this.getScene();
    if (scene && scene.handleSwim) {
      scene.handleSwim();
    }
  }

  handleDashInput() {
    const scene = this.getScene();
    if (scene && scene.handleDash) {
      scene.handleDash();
    }
  }

  notifyUI() {
    if (this.onStateChange) {
      const scene = this.getScene();
      const flockCount = scene && scene.flock ? scene.flock.boids.length : 3;

      this.onStateChange({
        state: this.state,
        score: this.score,
        pearlCount: this.pearlCount,
        brokenRocksCount: this.brokenRocksCount,
        highScore: this.highScore,
        flockCount: flockCount,
        stamina: this.player.stamina,
        isDashing: this.player.isDashing
      });
    }
  }

  update(dt) {
    // Vòng lặp do Phaser tự quản lý
  }

  draw() {
    // Kết xuất do Phaser WebGL/Canvas tự quản lý
  }
}

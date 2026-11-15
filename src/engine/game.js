// Game Engine 2D - Aqua Dash: Bioluminescent Odyssey
// Điều khiển vật lý thủy lực, Cơ chế Boids AI Hộ mệnh & Cá Nóc Phình Gai Phá Đá

import { sound } from './audio.js';
import { FishFlockSystem } from './boids-ai.js';

export class GameEngine {
  constructor(canvas, onStateChange) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.onStateChange = onStateChange;

    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;

    // Trạng thái game
    this.state = 'MENU'; // MENU | PLAYING | GAMEOVER
    this.score = 0;
    this.pearlCount = 0;
    this.brokenRocksCount = 0;
    this.highScore = parseInt(localStorage.getItem('aquadash_highscore') || '0', 10);

    // Camera / Screen shake
    this.shakeDuration = 0;
    this.shakeIntensity = 0;

    // Player Fish
    this.player = {
      x: 180,
      y: this.height / 2,
      baseRadius: 18,
      radius: 18,
      targetRadius: 18,
      vy: 0,
      angle: 0,
      gravity: 920,
      swimImpulse: -360,
      isDashing: false,
      dashTimer: 0,
      invulnerableTimer: 0,
      stamina: 100,
      maxStamina: 100
    };

    // Đàn cá AI hộ mệnh
    this.flock = new FishFlockSystem(3);
    this.pearlComboForSpawn = 0;

    // Tải các tài nguyên đồ họa SVG phát quang sinh học (Bioluminescent Assets)
    this.pearlImgLoaded = false;
    this.starfishImgLoaded = false;
    this.playerFishImgLoaded = false;
    this.playerDashImgLoaded = false;
    this.pillarSolidImgLoaded = false;
    this.pillarFracturedImgLoaded = false;

    if (typeof Image !== 'undefined') {
      this.pearlImg = new Image();
      this.pearlImg.src = '/assets/pearl.svg';
      this.pearlImg.onload = () => { this.pearlImgLoaded = true; };

      this.starfishImg = new Image();
      this.starfishImg.src = '/assets/starfish.svg';
      this.starfishImg.onload = () => { this.starfishImgLoaded = true; };

      this.playerFishImg = new Image();
      this.playerFishImg.src = '/assets/player-fish.svg';
      this.playerFishImg.onload = () => { this.playerFishImgLoaded = true; };

      this.playerDashImg = new Image();
      this.playerDashImg.src = '/assets/player-dash.svg';
      this.playerDashImg.onload = () => { this.playerDashImgLoaded = true; };

      this.pillarSolidImg = new Image();
      this.pillarSolidImg.src = '/assets/coral-pillar-solid.svg';
      this.pillarSolidImg.onload = () => { this.pillarSolidImgLoaded = true; };

      this.pillarFracturedImg = new Image();
      this.pillarFracturedImg.src = '/assets/coral-pillar-fractured.svg';
      this.pillarFracturedImg.onload = () => { this.pillarFracturedImgLoaded = true; };
    }

    // Chướng ngại vật & Vật phẩm
    this.pillars = [];
    this.geysers = [];
    this.collectibles = [];
    this.particles = [];
    this.floatingTexts = [];

    // Bộ đếm sinh màn chơi
    this.spawnTimer = 0;
    this.spawnInterval = 2.1;
    this.speed = 210;

    // Xử lý sự kiện bàn phím & chuột
    this.keys = {};
    this.setupInputs();

    window.addEventListener('resize', () => this.onResize());
  }

  onResize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
  }

  setupInputs() {
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        this.handleSwimInput();
      } else if (e.code === 'ShiftLeft' || e.code === 'ShiftRight' || e.code === 'KeyD') {
        e.preventDefault();
        this.handleDashInput();
      }
    });

    this.canvas.addEventListener('mousedown', (e) => {
      e.preventDefault();
      if (e.button === 0) {
        this.handleSwimInput();
      } else if (e.button === 2) {
        this.handleDashInput();
      }
    });

    this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());

    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.handleSwimInput();
    }, { passive: false });
  }

  handleSwimInput() {
    if (this.state === 'MENU' || this.state === 'GAMEOVER') {
      this.start();
      return;
    }

    if (this.state === 'PLAYING') {
      this.player.vy = this.player.swimImpulse;
      sound.playSwim();

      // Sinh bọt nước quẫy đuôi
      for (let i = 0; i < 4; i++) {
        this.addBubbleParticle(
          this.player.x - 20,
          this.player.y + (Math.random() - 0.5) * 10,
          -60 - Math.random() * 40,
          (Math.random() - 0.5) * 30
        );
      }
    }
  }

  handleDashInput() {
    if (this.state !== 'PLAYING') return;
    if (this.player.isDashing) return;

    // Cần ít nhất 35 stamina
    if (this.player.stamina >= 35) {
      this.player.stamina -= 35;
      this.player.isDashing = true;
      this.player.dashTimer = 1.2;
      this.triggerScreenShake(0.15, 6);
      sound.playDash();

      // Bọt nước nổ xung kích
      for (let i = 0; i < 15; i++) {
        const ang = Math.random() * Math.PI * 2;
        const spd = 60 + Math.random() * 120;
        this.addShockwaveParticle(this.player.x, this.player.y, Math.cos(ang) * spd, Math.sin(ang) * spd);
      }
    }
  }

  start() {
    this.state = 'PLAYING';
    this.score = 0;
    this.pearlCount = 0;
    this.brokenRocksCount = 0;
    this.speed = 210;
    this.spawnInterval = 2.1;
    this.spawnTimer = 0.5;

    this.player.y = this.height / 2;
    this.player.vy = 0;
    this.player.stamina = 100;
    this.player.isDashing = false;
    this.player.dashTimer = 0;
    this.player.invulnerableTimer = 0;

    this.flock.reset(3, this.player.x, this.player.y);
    this.pillars = [];
    this.geysers = [];
    this.collectibles = [];
    this.particles = [];
    this.floatingTexts = [];

    if (this.onStateChange) this.onStateChange(this.getUIState());
  }

  triggerScreenShake(duration, intensity) {
    this.shakeDuration = duration;
    this.shakeIntensity = intensity;
  }

  addBubbleParticle(x, y, vx, vy, color = 'rgba(0, 245, 212, 0.7)') {
    this.particles.push({
      x, y, vx, vy,
      life: 0.8,
      maxLife: 0.8,
      size: 3 + Math.random() * 4,
      color,
      type: 'bubble'
    });
  }

  addShockwaveParticle(x, y, vx, vy) {
    this.particles.push({
      x, y, vx, vy,
      life: 0.5,
      maxLife: 0.5,
      size: 4 + Math.random() * 5,
      color: '#ff0054',
      type: 'shard'
    });
  }

  addRockDebris(x, y) {
    for (let i = 0; i < 18; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 80 + Math.random() * 220;
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        rot: Math.random() * Math.PI,
        vrot: (Math.random() - 0.5) * 8,
        life: 1.0,
        maxLife: 1.0,
        size: 5 + Math.random() * 8,
        color: Math.random() > 0.5 ? '#ff0054' : '#7209b7',
        type: 'shard'
      });
    }
  }

  addFloatingText(text, x, y, color = '#fee440') {
    this.floatingTexts.push({
      text, x, y,
      vy: -55,
      life: 0.9,
      maxLife: 0.9,
      color
    });
  }

  spawnObstaclePair() {
    const gap = Math.max(140, 195 - this.score * 1.5);
    const minCenter = 120 + gap / 2;
    const maxCenter = this.height - 120 - gap / 2;
    const center = minCenter + Math.random() * (maxCenter - minCenter);

    const width = 64;
    const topHeight = center - gap / 2;
    const bottomY = center + gap / 2;
    const bottomHeight = this.height - bottomY;

    // Tỉ lệ xuất hiện cột nứt (Fractured Pillar) có thể húc vỡ
    const isFractured = Math.random() < 0.45;

    // Cột trên
    this.pillars.push({
      x: this.width + 20,
      y: 0,
      w: width,
      h: topHeight,
      isTop: true,
      fractured: isFractured && Math.random() > 0.5,
      broken: false,
      passed: false
    });

    // Cột dưới
    this.pillars.push({
      x: this.width + 20,
      y: bottomY,
      w: width,
      h: bottomHeight,
      isTop: false,
      fractured: isFractured,
      broken: false,
      passed: false
    });

    // Sinh vật phẩm: Ngọc trai hoặc Sao biển giữa khoảng hở
    if (Math.random() < 0.75) {
      const isStar = Math.random() < 0.2;
      this.collectibles.push({
        x: this.width + 20 + width / 2,
        y: center + (Math.random() - 0.5) * 40,
        radius: isStar ? 16 : 11,
        type: isStar ? 'star' : 'pearl',
        collected: false,
        pulse: Math.random() * Math.PI * 2
      });
    }

    // Thi thoảng sinh Cột Phun Thủy Nhiệt (Geyser)
    if (Math.random() < 0.28 && this.pillars.length > 4) {
      this.geysers.push({
        x: this.width + 20 + width + 90,
        y: this.height - 10,
        w: 48,
        h: this.height * 0.7,
        timer: 0
      });
    }
  }

  update(dt) {
    if (this.state !== 'PLAYING') {
      if (this.flock) {
        this.flock.update(dt, { x: 180, y: this.height / 2 }, []);
      }
      return;
    }

    // 1. Cập nhật Player
    // Hồi Stamina
    if (!this.player.isDashing) {
      this.player.stamina = Math.min(this.player.maxStamina, this.player.stamina + dt * 22);
    } else {
      this.player.dashTimer -= dt;
      if (this.player.dashTimer <= 0) {
        this.player.isDashing = false;
      }
    }

    // Timer bất tử
    if (this.player.invulnerableTimer > 0) {
      this.player.invulnerableTimer -= dt;
    }

    // Kích thước mượt mà khi Cá Nóc phình to
    this.player.targetRadius = this.player.isDashing ? 32 : 18;
    this.player.radius += (this.player.targetRadius - this.player.radius) * dt * 12;

    // Trọng lực & Vận tốc
    this.player.vy += this.player.gravity * dt;
    this.player.y += this.player.vy * dt;

    // Góc nghiêng theo vận tốc
    const targetAngle = Math.min(Math.PI / 4, Math.max(-Math.PI / 4, (this.player.vy / 450)));
    this.player.angle += (targetAngle - this.player.angle) * dt * 9;

    // Giới hạn biên màn hình (Trần và Đáy)
    if (this.player.y < this.player.radius) {
      this.player.y = this.player.radius;
      this.player.vy = 0;
    }
    if (this.player.y > this.height - this.player.radius) {
      this.handlePlayerDamage();
    }

    // 2. Cột Phun Thủy Nhiệt (Thermal Geysers)
    for (let i = this.geysers.length - 1; i >= 0; i--) {
      const g = this.geysers[i];
      g.x -= this.speed * dt;
      g.timer += dt * 14;

      // Sinh hạt bọt nước bốc lên từ geyser
      if (Math.random() < 0.6) {
        this.addBubbleParticle(
          g.x + Math.random() * g.w,
          this.height - Math.random() * 20,
          (Math.random() - 0.5) * 20,
          -220 - Math.random() * 180,
          '#fee440'
        );
      }

      // Kiểm tra cá lướt vào luồng geyser -> Đẩy vút lên cao (Updraft)
      if (this.player.x > g.x && this.player.x < g.x + g.w) {
        if (this.player.y > this.height - g.h) {
          this.player.vy = -540; // Đẩy bay vọt lên
          sound.playGeyser();
          this.addFloatingText('UPDRAFT!', this.player.x, this.player.y - 20, '#fee440');
        }
      }

      if (g.x + g.w < -100) {
        this.geysers.splice(i, 1);
      }
    }

    // 3. Cập nhật Boids AI đàn cá
    this.flock.update(dt, { x: this.player.x, y: this.player.y }, this.collectibles);

    // 4. Sinh & Cập nhật Cột chướng ngại vật
    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0) {
      this.spawnObstaclePair();
      this.spawnTimer = Math.max(1.3, this.spawnInterval - (this.score * 0.02));
    }

    for (let i = this.pillars.length - 1; i >= 0; i--) {
      const p = this.pillars[i];
      p.x -= this.speed * dt;

      // Tính điểm thường khi vượt qua cột
      if (!p.passed && p.isTop && p.x + p.w < this.player.x) {
        p.passed = true;
        this.score += 1;
        this.speed = Math.min(360, 210 + this.score * 3.5);
        if (this.score > this.highScore) {
          this.highScore = this.score;
          localStorage.setItem('aquadash_highscore', this.highScore.toString());
        }
      }

      // Xử lý va chạm với cột đá nếu chưa bị phá vỡ
      if (!p.broken) {
        const hit = this.checkCircleRectCollision(this.player.x, this.player.y, this.player.radius, p.x, p.y, p.w, p.h);
        if (hit) {
          if (this.player.isDashing && p.fractured) {
            // Húc vỡ vụn cột đá nứt!
            p.broken = true;
            this.brokenRocksCount++;
            this.score += 10;
            this.triggerScreenShake(0.25, 12);
            sound.playRockBreak();
            this.addRockDebris(p.x + p.w / 2, p.isTop ? p.h - 30 : p.y + 30);
            this.addFloatingText('+10 SHATTER!', this.player.x + 30, this.player.y, '#ff0054');
          } else {
            this.handlePlayerDamage();
          }
        }
      }

      // Tự hủy khi ra khỏi màn hình
      if (p.x + p.w < -100) {
        this.pillars.splice(i, 1);
      }
    }

    // 5. Cập nhật Vật phẩm thu thập (Ngọc trai & Sao biển)
    for (let i = this.collectibles.length - 1; i >= 0; i--) {
      const item = this.collectibles[i];
      item.x -= this.speed * dt;
      item.pulse += dt * 5;

      // Kiểm tra người chơi hoặc bất kỳ cá con nào chạm vào vật phẩm
      let collectedBy = null;
      const dPlayer = Math.hypot(item.x - this.player.x, item.y - this.player.y);
      if (dPlayer < this.player.radius + item.radius) {
        collectedBy = 'player';
      } else {
        // Kiểm tra đàn cá con
        for (const boid of this.flock.boids) {
          const dBoid = Math.hypot(item.x - boid.x, item.y - boid.y);
          if (dBoid < boid.size + item.radius) {
            collectedBy = 'boid';
            break;
          }
        }
      }

      if (collectedBy) {
        item.collected = true;
        if (item.type === 'pearl') {
          this.pearlCount++;
          this.score += 5;
          sound.playPearl();
          this.addFloatingText('+5 PEARL', item.x, item.y, '#fee440');

          // Tích 3 ngọc sinh 1 cá con hộ mệnh
          this.pearlComboForSpawn++;
          if (this.pearlComboForSpawn >= 3) {
            this.pearlComboForSpawn = 0;
            const spawned = this.flock.addFish(this.player.x - 40, this.player.y);
            if (spawned) {
              this.addFloatingText('+1 ESCORT FISH!', this.player.x, this.player.y - 30, '#00f5d4');
            }
          }
        } else if (item.type === 'star') {
          this.score += 15;
          this.player.stamina = this.player.maxStamina; // Hồi đầy Stamina
          sound.playStar();
          this.addFloatingText('+15 MAX STAMINA!', item.x, item.y, '#ff0054');
        }

        // Tạo hiệu ứng hạt sáng khi ăn
        for (let k = 0; k < 12; k++) {
          const ang = Math.random() * Math.PI * 2;
          const spd = 40 + Math.random() * 80;
          this.addBubbleParticle(item.x, item.y, Math.cos(ang) * spd, Math.sin(ang) * spd, item.type === 'pearl' ? '#fee440' : '#ff0054');
        }

        this.collectibles.splice(i, 1);
        continue;
      }

      if (item.x < -60) {
        this.collectibles.splice(i, 1);
      }
    }

    // 6. Cập nhật Particles & Floating Text
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const pt = this.particles[i];
      pt.life -= dt;
      pt.x += pt.vx * dt;
      pt.y += pt.vy * dt;
      if (pt.type === 'shard') {
        pt.rot += pt.vrot * dt;
      }
      if (pt.life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.life -= dt;
      ft.y += ft.vy * dt;
      if (ft.life <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }

    // 7. Cập nhật Screen Shake
    if (this.shakeDuration > 0) {
      this.shakeDuration -= dt;
      if (this.shakeDuration <= 0) {
        this.shakeIntensity = 0;
      }
    }

    // Báo cáo UI state
    if (this.onStateChange) this.onStateChange(this.getUIState());
  }

  handlePlayerDamage() {
    if (this.player.invulnerableTimer > 0) return;

    // Nếu đang phình gai Dash thì miễn nhiễm sát thương
    if (this.player.isDashing) return;

    // Kiểm tra xem đàn cá con còn không
    const lostFish = this.flock.removeOne();
    if (lostFish) {
      // Hy sinh 1 cá con bảo vệ người chơi!
      this.player.invulnerableTimer = 1.4;
      this.triggerScreenShake(0.2, 8);
      sound.playLoseFish();
      this.addFloatingText('SHIELD SAVED YOU!', this.player.x, this.player.y - 25, '#00f5d4');

      // Nổ bọt khí cá con hy sinh
      for (let i = 0; i < 14; i++) {
        const ang = Math.random() * Math.PI * 2;
        const spd = 60 + Math.random() * 90;
        this.addBubbleParticle(lostFish.x, lostFish.y, Math.cos(ang) * spd, Math.sin(ang) * spd, '#00f5d4');
      }
      return;
    }

    // Không còn cá con nào -> Game Over
    this.gameOver();
  }

  gameOver() {
    this.state = 'GAMEOVER';
    this.triggerScreenShake(0.4, 15);
    sound.playGameOver();

    // Nổ tung hạt
    for (let i = 0; i < 25; i++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = 70 + Math.random() * 150;
      this.addBubbleParticle(this.player.x, this.player.y, Math.cos(ang) * spd, Math.sin(ang) * spd, '#ff0054');
    }

    if (this.onStateChange) this.onStateChange(this.getUIState());
  }

  checkCircleRectCollision(cx, cy, radius, rx, ry, rw, rh) {
    const closestX = Math.max(rx, Math.min(cx, rx + rw));
    const closestY = Math.max(ry, Math.min(cy, ry + rh));
    const distanceX = cx - closestX;
    const distanceY = cy - closestY;
    return (distanceX * distanceX + distanceY * distanceY) < (radius * 0.82 * radius * 0.82);
  }

  getUIState() {
    return {
      state: this.state,
      score: this.score,
      highScore: this.highScore,
      pearlCount: this.pearlCount,
      brokenRocksCount: this.brokenRocksCount,
      flockCount: this.flock ? this.flock.count() : 0,
      stamina: this.player.stamina,
      isDashing: this.player.isDashing
    };
  }

  draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    ctx.save();
    // Áp dụng Screen Shake
    if (this.shakeIntensity > 0) {
      const ox = (Math.random() - 0.5) * this.shakeIntensity;
      const oy = (Math.random() - 0.5) * this.shakeIntensity;
      ctx.translate(ox, oy);
    }

    // 1. Vẽ Cột Phun Thủy Nhiệt (Geysers)
    for (const g of this.geysers) {
      const grad = ctx.createLinearGradient(g.x, this.height, g.x, this.height - g.h);
      grad.addColorStop(0, 'rgba(254, 228, 64, 0.4)');
      grad.addColorStop(0.5, 'rgba(0, 245, 212, 0.25)');
      grad.addColorStop(1, 'rgba(0, 245, 212, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(g.x, this.height - g.h, g.w, g.h);

      // Viền bọt khí
      ctx.strokeStyle = 'rgba(254, 228, 64, 0.6)';
      ctx.setLineDash([6, 6]);
      ctx.strokeRect(g.x, this.height - g.h, g.w, g.h);
      ctx.setLineDash([]);
    }

    // 2. Vẽ Cột chướng ngại vật (Pillars)
    for (const p of this.pillars) {
      if (p.broken) continue;

      ctx.save();
      // Màu sắc cột: Cột nứt màu hồng tím phát sáng; Cột thường màu tím thẫm
      if (p.fractured) {
        ctx.fillStyle = '#480ca8';
        ctx.strokeStyle = '#ff0054';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#ff0054';
        ctx.shadowBlur = 12;
      } else {
        ctx.fillStyle = '#0f172a';
        ctx.strokeStyle = '#3a0ca3';
        ctx.lineWidth = 2;
        ctx.shadowBlur = 0;
      }

      // Thân cột
      ctx.fillRect(p.x, p.y, p.w, p.h);
      ctx.strokeRect(p.x, p.y, p.w, p.h);

      // Điểm mút cảnh báo ở đầu cột (Gai san hô)
      const capY = p.isTop ? p.h - 14 : p.y;
      if (p.fractured && this.pillarFracturedImgLoaded) {
        ctx.drawImage(this.pillarFracturedImg, p.x - 4, capY, p.w + 8, 14);
      } else if (!p.fractured && this.pillarSolidImgLoaded) {
        ctx.drawImage(this.pillarSolidImg, p.x - 4, capY, p.w + 8, 14);
      } else {
        ctx.fillStyle = p.fractured ? '#ff0054' : '#7209b7';
        ctx.fillRect(p.x - 4, capY, p.w + 8, 14);
      }

      // Nếu là cột nứt -> Vẽ hoa văn rạn nứt phát sáng
      if (p.fractured) {
        ctx.strokeStyle = '#fee440';
        ctx.lineWidth = 2;
        ctx.beginPath();
        const midY = p.isTop ? p.h - 40 : p.y + 40;
        ctx.moveTo(p.x + 10, midY - 20);
        ctx.lineTo(p.x + p.w / 2, midY);
        ctx.lineTo(p.x + p.w - 12, midY + 18);
        ctx.stroke();

        // Nhãn cảnh báo đập vỡ
        ctx.fillStyle = '#fee440';
        ctx.font = '10px monospace';
        ctx.fillText('BREAKABLE', p.x + 4, midY - 6);
      }

      ctx.restore();
    }

    // 3. Vẽ Vật phẩm (Ngọc trai / Sao biển)
    for (const item of this.collectibles) {
      ctx.save();
      ctx.translate(item.x, item.y);
      const scale = 1 + Math.sin(item.pulse) * 0.12;
      ctx.scale(scale, scale);

      if (item.type === 'pearl') {
        ctx.shadowColor = '#00f5d4';
        ctx.shadowBlur = 16;

        if (this.pearlImgLoaded && this.pearlImg) {
          // Vẽ hình vỏ sò ngọc trai màu trắng SVG
          const drawSize = item.radius * 2.8;
          ctx.drawImage(this.pearlImg, -drawSize / 2, -drawSize / 2, drawSize, drawSize);
        } else {
          // Fallback ngọc trắng phát sáng nếu ảnh chưa tải xong
          const grad = ctx.createRadialGradient(0, 0, 1, 0, 0, item.radius);
          grad.addColorStop(0, '#ffffff');
          grad.addColorStop(0.5, '#e0f2fe');
          grad.addColorStop(1, '#00f5d4');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(0, 0, item.radius, 0, Math.PI * 2);
          ctx.fill();
        }
      } else {
        // Sao biển
        ctx.shadowColor = '#ff0054';
        ctx.shadowBlur = 16;

        if (this.starfishImgLoaded && this.starfishImg) {
          const drawSize = item.radius * 2.8;
          ctx.drawImage(this.starfishImg, -drawSize / 2, -drawSize / 2, drawSize, drawSize);
        } else {
          ctx.fillStyle = '#ff0054';
          ctx.beginPath();
          for (let i = 0; i < 5; i++) {
            const a = (i * Math.PI * 2) / 5 - Math.PI / 2;
            const r1 = item.radius;
            const r2 = item.radius * 0.45;
            ctx.lineTo(Math.cos(a) * r1, Math.sin(a) * r1);
            const a2 = a + Math.PI / 5;
            ctx.lineTo(Math.cos(a2) * r2, Math.sin(a2) * r2);
          }
          ctx.closePath();
          ctx.fill();
        }
      }

      ctx.restore();
    }

    // 4. Vẽ Đàn cá AI con (Boids)
    this.flock.draw(ctx);

    // 5. Vẽ Chú cá người chơi (Player)
    if (this.state === 'PLAYING' || this.state === 'MENU') {
      // Chớp nháy nếu đang bất tử sau va chạm
      const isBlinking = this.player.invulnerableTimer > 0 && Math.floor(this.player.invulnerableTimer * 10) % 2 === 0;

      if (!isBlinking) {
        ctx.save();
        ctx.translate(this.player.x, this.player.y);
        ctx.rotate(this.player.angle);

        if (this.player.isDashing && this.playerDashImgLoaded && this.playerDashImg) {
          ctx.shadowColor = '#ff0054';
          ctx.shadowBlur = 24;
          const drawSize = this.player.radius * 3.4;
          ctx.drawImage(this.playerDashImg, -drawSize / 2, -drawSize / 2, drawSize, drawSize);
        } else if (!this.player.isDashing && this.playerFishImgLoaded && this.playerFishImg) {
          ctx.shadowColor = '#00f5d4';
          ctx.shadowBlur = 18;
          const drawSize = this.player.radius * 3.4;
          ctx.drawImage(this.playerFishImg, -drawSize / 2, -drawSize / 2, drawSize, drawSize);
        } else {
          // Hào quang năng lượng khi Cá Nóc Phình Gai (Puffer Dash)
          if (this.player.isDashing) {
            ctx.shadowColor = '#ff0054';
            ctx.shadowBlur = 24;
            ctx.strokeStyle = '#fee440';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(0, 0, this.player.radius * 1.25, 0, Math.PI * 2);
            ctx.stroke();

            // Các gai nhọn chĩa ra
            ctx.fillStyle = '#ff0054';
            for (let i = 0; i < 8; i++) {
              const ga = (i * Math.PI * 2) / 8;
              const gx = Math.cos(ga) * (this.player.radius * 1.35);
              const gy = Math.sin(ga) * (this.player.radius * 1.35);
              ctx.beginPath();
              ctx.arc(gx, gy, 4, 0, Math.PI * 2);
              ctx.fill();
            }
          } else {
            ctx.shadowColor = '#00f5d4';
            ctx.shadowBlur = 16;
          }

          // Thân cá chính
          const fishGrad = ctx.createRadialGradient(
            0, 0, 2,
            0, 0, this.player.radius
          );
          if (this.player.isDashing) {
            fishGrad.addColorStop(0, '#ffffff');
            fishGrad.addColorStop(0.5, '#ff0054');
            fishGrad.addColorStop(1, '#7209b7');
          } else {
            fishGrad.addColorStop(0, '#ffffff');
            fishGrad.addColorStop(0.4, '#00f5d4');
            fishGrad.addColorStop(1, '#0077b6');
          }

          ctx.fillStyle = fishGrad;
          ctx.beginPath();
          ctx.ellipse(0, 0, this.player.radius * 1.2, this.player.radius * 0.75, 0, 0, Math.PI * 2);
          ctx.fill();

          // Mắt cá to tròn phát sáng
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(this.player.radius * 0.55, -this.player.radius * 0.2, this.player.radius * 0.25, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#030b17';
          ctx.beginPath();
          ctx.arc(this.player.radius * 0.65, -this.player.radius * 0.2, this.player.radius * 0.12, 0, Math.PI * 2);
          ctx.fill();

          // Đèn lồng phát quang (Anglerfish light)
          ctx.strokeStyle = this.player.isDashing ? '#fee440' : '#00f5d4';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(this.player.radius * 0.4, -this.player.radius * 0.5);
          ctx.quadraticCurveTo(this.player.radius * 0.8, -this.player.radius * 1.1, this.player.radius * 0.9, -this.player.radius * 0.85);
          ctx.stroke();

          ctx.fillStyle = '#ffffff';
          ctx.shadowColor = this.player.isDashing ? '#fee440' : '#00f5d4';
          ctx.shadowBlur = 12;
          ctx.beginPath();
          ctx.arc(this.player.radius * 0.9, -this.player.radius * 0.85, 3.5, 0, Math.PI * 2);
          ctx.fill();

          // Đuôi quẫy
          ctx.fillStyle = this.player.isDashing ? 'rgba(255, 0, 84, 0.8)' : 'rgba(0, 245, 212, 0.8)';
          ctx.beginPath();
          ctx.moveTo(-this.player.radius * 0.9, 0);
          ctx.lineTo(-this.player.radius * 1.6, -this.player.radius * 0.6);
          ctx.lineTo(-this.player.radius * 1.3, 0);
          ctx.lineTo(-this.player.radius * 1.6, this.player.radius * 0.6);
          ctx.closePath();
          ctx.fill();
        }

        ctx.restore();
      }
    }

    // 6. Vẽ Particles & Floating Text
    for (const pt of this.particles) {
      ctx.save();
      const alpha = pt.life / pt.maxLife;
      ctx.globalAlpha = Math.max(0, alpha);
      ctx.fillStyle = pt.color;
      ctx.shadowColor = pt.color;
      ctx.shadowBlur = 8;

      if (pt.type === 'bubble') {
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.translate(pt.x, pt.y);
        ctx.rotate(pt.rot || 0);
        ctx.fillRect(-pt.size / 2, -pt.size / 2, pt.size, pt.size);
      }
      ctx.restore();
    }

    for (const ft of this.floatingTexts) {
      ctx.save();
      const alpha = ft.life / ft.maxLife;
      ctx.globalAlpha = Math.max(0, alpha);
      ctx.font = 'bold 15px monospace';
      ctx.fillStyle = ft.color;
      ctx.shadowColor = ft.color;
      ctx.shadowBlur = 8;
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    }

    ctx.restore();
  }
}


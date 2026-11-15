// Thuật toán Boids Flocking AI cho Đàn Cá Hộ Mệnh (Escort School)
// Mô phỏng hành vi bầy đàn sinh học tự nhiên của Craig Reynolds

let boidImg = null;
let boidImgLoaded = false;
if (typeof Image !== 'undefined') {
  boidImg = new Image();
  boidImg.src = '/assets/boid-escort.svg';
  boidImg.onload = () => {
    boidImgLoaded = true;
  };
}

export class BoidFish {
  constructor(x, y, id) {
    this.x = x;
    this.y = y;
    this.vx = (Math.random() - 0.5) * 40;
    this.vy = (Math.random() - 0.5) * 40;
    this.id = id;
    this.size = 9 + Math.random() * 4;
    this.maxSpeed = 220;
    this.maxForce = 280;
    this.angle = 0;
    this.tailPhase = Math.random() * Math.PI * 2;
    this.color = '#00f5d4';
    this.glowColor = 'rgba(0, 245, 212, 0.6)';
    this.seekingItem = null;
  }

  update(dt, leaderPos, flock, collectibles = []) {
    this.tailPhase += dt * 18;

    // 1. Kiểm tra vật phẩm ở gần để lao tới nhặt (Scavenger AI)
    let closestItem = null;
    let minDist = 140; // Tầm nhìn nhặt ngọc
    for (const item of collectibles) {
      if (item.collected) continue;
      const d = Math.hypot(item.x - this.x, item.y - this.y);
      if (d < minDist) {
        minDist = d;
        closestItem = item;
      }
    }
    this.seekingItem = closestItem;

    // Các vector lực hành vi
    let sepX = 0, sepY = 0;
    let aliX = 0, aliY = 0;
    let cohX = 0, cohY = 0;
    let totalNeighbors = 0;

    const desiredSeparation = 24;

    for (const other of flock) {
      if (other === this) continue;
      const d = Math.hypot(this.x - other.x, this.y - other.y);

      // Separation: Tránh va vào nhau
      if (d > 0 && d < desiredSeparation) {
        const diffX = (this.x - other.x) / d;
        const diffY = (this.y - other.y) / d;
        sepX += diffX / d;
        sepY += diffY / d;
      }

      // Alignment & Cohesion: Bơi cùng hướng & tụ họp
      if (d > 0 && d < 70) {
        aliX += other.vx;
        aliY += other.vy;
        cohX += other.x;
        cohY += other.y;
        totalNeighbors++;
      }
    }

    if (totalNeighbors > 0) {
      aliX /= totalNeighbors;
      aliY /= totalNeighbors;
      cohX /= totalNeighbors;
      cohY /= totalNeighbors;

      // Hướng về tâm đàn
      cohX = (cohX - this.x);
      cohY = (cohY - this.y);
    }

    // 2. Lực hút về Cá Dẫn Đầu (Leader Following)
    // Giữ vị trí sau đuôi cá mẹ một khoảng tự nhiên
    const targetOffsetX = -45 - (this.id * 14);
    const targetOffsetY = Math.sin(this.tailPhase * 0.4 + this.id) * 22;
    const targetX = leaderPos.x + targetOffsetX;
    const targetY = leaderPos.y + targetOffsetY;

    let leadForceX = targetX - this.x;
    let leadForceY = targetY - this.y;

    // Nếu đang săn ngọc gần, ưu tiên lao tới ngọc
    if (this.seekingItem) {
      leadForceX = (this.seekingItem.x - this.x) * 2.5;
      leadForceY = (this.seekingItem.y - this.y) * 2.5;
    }

    // Tổng hợp gia tốc theo trọng số
    let ax = (sepX * 180) + (aliX * 0.5) + (cohX * 1.8) + (leadForceX * 4.5);
    let ay = (sepY * 180) + (aliY * 0.5) + (cohY * 1.8) + (leadForceY * 4.5);

    // Giới hạn lực tác động
    const forceMag = Math.hypot(ax, ay);
    if (forceMag > this.maxForce) {
      ax = (ax / forceMag) * this.maxForce;
      ay = (ay / forceMag) * this.maxForce;
    }

    // Cập nhật vận tốc & vị trí
    this.vx += ax * dt;
    this.vy += ay * dt;

    const speed = Math.hypot(this.vx, this.vy);
    if (speed > this.maxSpeed) {
      this.vx = (this.vx / speed) * this.maxSpeed;
      this.vy = (this.vy / speed) * this.maxSpeed;
    }

    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // Góc hướng theo vận tốc
    this.angle = Math.atan2(this.vy, this.vx);
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);

    // Hiệu ứng phát quang neon
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 10;

    if (boidImgLoaded && boidImg) {
      const w = this.size * 2.5;
      const h = this.size * 1.6;
      ctx.drawImage(boidImg, -w / 2, -h / 2, w, h);
    } else {
      // Thân cá con
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.ellipse(0, 0, this.size, this.size * 0.45, 0, 0, Math.PI * 2);
      ctx.fill();

      // Mắt cá
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(this.size * 0.45, -this.size * 0.15, 1.8, 0, Math.PI * 2);
      ctx.fill();

      // Đuôi vẫy uốn lượn
      const tailWiggle = Math.sin(this.tailPhase) * (this.size * 0.35);
      ctx.strokeStyle = this.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-this.size * 0.8, 0);
      ctx.lineTo(-this.size * 1.4, tailWiggle);
      ctx.stroke();

      // Vây đuôi tam giác
      ctx.fillStyle = 'rgba(0, 245, 212, 0.7)';
      ctx.beginPath();
      ctx.moveTo(-this.size * 0.9, 0);
      ctx.lineTo(-this.size * 1.5, tailWiggle - 4);
      ctx.lineTo(-this.size * 1.5, tailWiggle + 4);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  }
}

export class FishFlockSystem {
  constructor(initialCount = 3) {
    this.boids = [];
    this.maxBoids = 5;
    for (let i = 0; i < initialCount; i++) {
      this.addFish(100 - i * 20, 250);
    }
  }

  addFish(x, y) {
    if (this.boids.length >= this.maxBoids) return false;
    const boid = new BoidFish(x, y, this.boids.length);
    this.boids.push(boid);
    return true;
  }

  removeOne() {
    if (this.boids.length > 0) {
      return this.boids.pop();
    }
    return null;
  }

  count() {
    return this.boids.length;
  }

  reset(count = 3, startX = 120, startY = 300) {
    this.boids = [];
    for (let i = 0; i < count; i++) {
      this.addFish(startX - 30 - i * 15, startY + (Math.random() - 0.5) * 20);
    }
  }

  update(dt, playerPos, collectibles) {
    for (const boid of this.boids) {
      boid.update(dt, playerPos, this.boids, collectibles);
    }
  }

  draw(ctx) {
    for (const boid of this.boids) {
      boid.draw(ctx);
    }
  }
}


import { describe, it, expect, beforeEach } from 'vitest';

// Lớp giả lập Game State Machine để kiểm thử toàn diện quy tắc trò chơi
class TestableAquaGameEngine {
  constructor() {
    this.state = 'MENU';
    this.score = 0;
    this.pearlCount = 0;
    this.brokenRocksCount = 0;
    this.pearlComboForSpawn = 0;
    this.highScore = 0;

    this.player = {
      x: 180,
      y: 300,
      vy: 0,
      stamina: 100,
      isDashing: false,
      dashTimer: 0,
      invulnerableTimer: 0
    };

    this.flockCount = 3;
    this.maxFlock = 5;
  }

  start() {
    this.state = 'PLAYING';
    this.score = 0;
    this.pearlCount = 0;
    this.brokenRocksCount = 0;
    this.pearlComboForSpawn = 0;
    this.flockCount = 3;
    this.player.stamina = 100;
    this.player.isDashing = false;
    this.player.dashTimer = 0;
    this.player.invulnerableTimer = 0;
  }

  handleSwim() {
    if (this.state !== 'PLAYING') return;
    this.player.vy = -360;
  }

  handleDash() {
    if (this.state !== 'PLAYING') return false;
    if (this.player.isDashing || this.player.stamina < 35) return false;

    this.player.stamina -= 35;
    this.player.isDashing = true;
    this.player.dashTimer = 1.2;
    this.player.invulnerableTimer = 1.4;
    return true;
  }

  collectItem(type) {
    if (this.state !== 'PLAYING') return;

    if (type === 'pearl') {
      this.score += 1;
      this.pearlCount += 1;
      this.pearlComboForSpawn += 1;

      if (this.pearlComboForSpawn >= 3) {
        this.pearlComboForSpawn = 0;
        if (this.flockCount < this.maxFlock) {
          this.flockCount += 1;
        }
      }
    } else if (type === 'starfish') {
      this.score += 5;
      this.player.stamina = Math.min(100, this.player.stamina + 25);
    }
  }

  hitPillar(isFractured) {
    if (this.state !== 'PLAYING') return;

    if (this.player.isDashing && isFractured) {
      this.score += 10;
      this.brokenRocksCount += 1;
      return 'BROKEN';
    }

    if (this.player.invulnerableTimer > 0) {
      return 'IMMUNE';
    }

    if (this.flockCount > 0) {
      this.flockCount -= 1;
      this.player.invulnerableTimer = 1.6;
      return 'SACRIFICE';
    } else {
      this.state = 'GAMEOVER';
      if (this.score > this.highScore) {
        this.highScore = this.score;
      }
      return 'GAMEOVER';
    }
  }

  update(dt) {
    if (this.state !== 'PLAYING') return;

    if (this.player.isDashing) {
      this.player.dashTimer -= dt;
      if (this.player.dashTimer <= 0) {
        this.player.isDashing = false;
      }
    } else {
      this.player.stamina = Math.min(100, this.player.stamina + 22 * dt);
    }

    if (this.player.invulnerableTimer > 0) {
      this.player.invulnerableTimer = Math.max(0, this.player.invulnerableTimer - dt);
    }
  }
}

describe('Aqua Dash - Kiểm thử Logic Trò Chơi (TDD)', () => {
  let game;

  beforeEach(() => {
    game = new TestableAquaGameEngine();
  });

  it('1. Vòng đời chuyển đổi trạng thái Game: MENU -> PLAYING -> GAMEOVER -> PLAYING', () => {
    expect(game.state).toBe('MENU');
    game.start();
    expect(game.state).toBe('PLAYING');

    // Chạm đá khi không còn cá con nào -> GAMEOVER
    game.flockCount = 0;
    const result = game.hitPillar(false);
    expect(result).toBe('GAMEOVER');
    expect(game.state).toBe('GAMEOVER');

    // Bắt đầu lại màn mới
    game.start();
    expect(game.state).toBe('PLAYING');
    expect(game.score).toBe(0);
    expect(game.flockCount).toBe(3);
  });

  it('2. Quản lý Thể lực (Stamina) và điều kiện kích hoạt Puffer Dash', () => {
    game.start();
    expect(game.player.stamina).toBe(100);

    // Dash lần 1: tiêu tốn 35 -> còn 65
    expect(game.handleDash()).toBe(true);
    expect(game.player.stamina).toBe(65);
    expect(game.player.isDashing).toBe(true);

    // Trong khi đang Dash không thể kích hoạt đè thêm lần nữa
    expect(game.handleDash()).toBe(false);

    // Giả lập thời gian hết thời gian Dash
    game.update(1.3);
    expect(game.player.isDashing).toBe(false);

    // Thử Dash khi stamina < 35 phải bị từ chối
    game.player.stamina = 20;
    expect(game.handleDash()).toBe(false);
  });

  it('3. Hồi phục Thể lực tự nhiên theo thời gian (22/giây) và kẹp giới hạn tối đa 100', () => {
    game.start();
    game.player.stamina = 50;

    // Trôi qua 1 giây -> hồi thêm 22 -> 72
    game.update(1.0);
    expect(Math.round(game.player.stamina)).toBe(72);

    // Trôi qua thêm 3 giây -> hồi vượt 100 nhưng phải được clamp ở 100
    game.update(3.0);
    expect(game.player.stamina).toBe(100);
  });

  it('4. Thu thập Vật phẩm Ngọc trai & Sao biển', () => {
    game.start();
    game.player.stamina = 50;

    // Nhặt sao biển: +5 điểm và +25 thể lực
    game.collectItem('starfish');
    expect(game.score).toBe(5);
    expect(game.player.stamina).toBe(75);

    // Nhặt ngọc trai: +1 điểm, +1 pearlCount
    game.collectItem('pearl');
    expect(game.score).toBe(6);
    expect(game.pearlCount).toBe(1);
  });

  it('5. Cơ chế Tích combo 3 Ngọc trai liên tiếp để hồi sinh 1 cá con hộ mệnh', () => {
    game.start();
    game.flockCount = 2; // Đang mất 1 con

    game.collectItem('pearl'); // 1 con
    expect(game.flockCount).toBe(2);

    game.collectItem('pearl'); // 2 con
    expect(game.flockCount).toBe(2);

    game.collectItem('pearl'); // 3 con -> Hồi sinh 1 con lên 3
    expect(game.flockCount).toBe(3);
    expect(game.pearlComboForSpawn).toBe(0);

    // Không thể vượt quá giới hạn tối đa maxFlock = 5
    game.flockCount = 5;
    game.collectItem('pearl');
    game.collectItem('pearl');
    game.collectItem('pearl');
    expect(game.flockCount).toBe(5);
  });

  it('6. Cơ chế Phình Gai Húc Vỡ Đá Nứt (Fractured Pillar)', () => {
    game.start();
    game.handleDash(); // Đang Dash

    const res = game.hitPillar(true); // Cột nứt
    expect(res).toBe('BROKEN');
    expect(game.score).toBe(10);
    expect(game.brokenRocksCount).toBe(1);
    expect(game.state).toBe('PLAYING');
  });

  it('7. Cơ chế Đàn cá hộ mệnh hy sinh đỡ đòn thay người chơi khi va chạm', () => {
    game.start();
    expect(game.flockCount).toBe(3);

    // Chạm cột đá cứng khi không Dash
    const res1 = game.hitPillar(false);
    expect(res1).toBe('SACRIFICE');
    expect(game.flockCount).toBe(2);
    expect(game.player.invulnerableTimer).toBeGreaterThan(0);

    // Trong thời gian bất tử, chạm tiếp không bị mất thêm mạng
    const res2 = game.hitPillar(false);
    expect(res2).toBe('IMMUNE');
    expect(game.flockCount).toBe(2);
  });

  it('8. Cập nhật và lưu giữ điểm Kỷ Lục (High Score)', () => {
    game.start();
    game.score = 42;
    game.flockCount = 0;
    game.hitPillar(false); // Game Over

    expect(game.highScore).toBe(42);

    // Trận tiếp theo ghi 30 điểm (thấp hơn) -> High score vẫn giữ 42
    game.start();
    game.score = 30;
    game.flockCount = 0;
    game.hitPillar(false);
    expect(game.highScore).toBe(42);
  });
});


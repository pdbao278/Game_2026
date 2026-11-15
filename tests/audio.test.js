import { describe, it, expect } from 'vitest';
import { sound } from '../src/engine/audio.js';

describe('Web Audio Procedural System', () => {
  it('Khởi tạo trạng thái âm thanh không bị mute mặc định', () => {
    expect(sound.muted).toBe(false);
  });

  it('Cho phép chuyển đổi trạng thái Mute / Unmute', () => {
    const isMuted = sound.toggleMute();
    expect(isMuted).toBe(true);
    expect(sound.muted).toBe(true);

    const isUnmuted = sound.toggleMute();
    expect(isUnmuted).toBe(false);
    expect(sound.muted).toBe(false);
  });

  it('Gọi các hàm phát âm thanh an toàn mà không quăng exception', () => {
    expect(() => {
      sound.playSwim();
      sound.playDash();
      sound.playRockBreak();
      sound.playPearl();
      sound.playStar();
      sound.playLoseFish();
      sound.playGeyser();
      sound.playGameOver();
    }).not.toThrow();
  });
});


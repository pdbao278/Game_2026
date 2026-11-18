/**
 * AudioManager - Quản lý phát SFX và Nhạc nền (BGM)
 * Hỗ trợ Web Audio an toàn với chính sách Autoplay và cơ chế Mute toàn diện
 */
export class AudioManager {
  constructor() {
    this.bgmPlaying = false;
    this.muted = false;

    if (typeof document !== 'undefined') {
      this.sfxClick = document.getElementById('sfxClick');
      this.sfxPhase = document.getElementById('sfxPhase');
      this.sfxScore = document.getElementById('sfxScore');
      this.sfxCrash = document.getElementById('sfxCrash');
      this.sfxHyper = document.getElementById('sfxHyper');
      this.sfxHeal = document.getElementById('sfxHeal');
      this.bgm = document.getElementById('bgm');
    } else {
      this.sfxClick = null;
      this.sfxPhase = null;
      this.sfxScore = null;
      this.sfxCrash = null;
      this.sfxHyper = null;
      this.sfxHeal = null;
      this.bgm = null;
    }
  }

  playSFX(name) {
    if (this.muted) return;
    try {
      const audio = this[name];
      if (audio) {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      }
    } catch (e) {}
  }

  /**
   * Bật / Tắt chế độ tắt tiếng (Mute)
   */
  toggleMute() {
    this.muted = !this.muted;
    if (this.bgm) {
      this.bgm.muted = this.muted;
    }
    return this.muted;
  }

  setMuted(muted) {
    this.muted = !!muted;
    if (this.bgm) {
      this.bgm.muted = this.muted;
    }
    return this.muted;
  }

  toggleBGM() {
    if (!this.bgm) return false;
    if (!this.bgmPlaying) {
      this.bgm.play().then(() => {
        this.bgmPlaying = true;
      }).catch(() => {});
    } else {
      this.bgm.pause();
      this.bgmPlaying = false;
    }
    return this.bgmPlaying;
  }

  startBGM() {
    if (this.bgm && !this.bgmPlaying) {
      this.bgm.play().then(() => {
        this.bgmPlaying = true;
      }).catch(() => {});
    }
  }

  stopBGM() {
    if (this.bgm && this.bgmPlaying) {
      this.bgm.pause();
      this.bgmPlaying = false;
    }
  }

  pauseBGM() {
    if (this.bgm && this.bgmPlaying) {
      this.bgm.pause();
    }
  }

  resumeBGM() {
    if (this.bgm && this.bgmPlaying) {
      this.bgm.play().catch(() => {});
    }
  }
}

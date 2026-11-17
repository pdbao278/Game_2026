/**
 * AudioManager - Quản lý phát SFX và Nhạc nền (BGM)
 */
export class AudioManager {
  constructor() {
    this.bgmPlaying = false;
    this.muted = false;

    this.sfxClick = document.getElementById('sfxClick');
    this.sfxPhase = document.getElementById('sfxPhase');
    this.sfxScore = document.getElementById('sfxScore');
    this.sfxCrash = document.getElementById('sfxCrash');
    this.sfxHyper = document.getElementById('sfxHyper');
    this.bgm = document.getElementById('bgm');
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
}

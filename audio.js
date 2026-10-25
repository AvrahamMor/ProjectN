/**
 * Audio Engine - Natural Tactile Feedback & Procedural Paper Physics
 * (Synthetic oscillator drone completely removed - music is handled via YouTube HD Spa Tracks)
 */

class SpaAudioEngine {
  constructor() {
    this.ctx = null;
    this.lastCrackleTime = 0;
  }

  // Ensure AudioContext is initialized and unlocked upon user touch/click
  initContext() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContextClass();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  /**
   * Micro-crackle while finger is actively dragging/tearing along perforation
   */
  playDragCrackle(progressFraction = 0.5) {
    this.initContext();
    const now = performance.now();
    if (now - this.lastCrackleTime < 60) return;
    this.lastCrackleTime = now;

    if (!this.ctx) return;
    const ctx = this.ctx;
    const audioNow = ctx.currentTime;

    const duration = 0.07;
    const bufferSize = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      const t = i / bufferSize;
      const noise = (Math.random() * 2 - 1);
      data[i] = noise * (1 - t) * (Math.random() > 0.35 ? 1 : 0.15);
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1400 + progressFraction * 600, audioNow);
    filter.Q.setValueAtTime(2.8, audioNow);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.22, audioNow);
    gain.gain.exponentialRampToValueAtTime(0.001, audioNow + duration);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    source.start(audioNow);
  }

  /**
   * Synthesize crisp realistic paper tear / coupon rip snap
   */
  playTearSound() {
    this.initContext();
    const ctx = this.ctx;
    const now = ctx.currentTime;

    const duration = 0.38;
    const bufferSize = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      const t = i / ctx.sampleRate;
      const crackle = Math.random() > 0.8 ? (Math.random() * 2 - 1) * 1.5 : 0;
      data[i] = ((Math.random() * 2 - 1) * 0.7 + crackle) * Math.exp(-t * 4);
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1600, now);
    filter.frequency.exponentialRampToValueAtTime(700, now + duration);
    filter.Q.setValueAtTime(2.2, now);

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.01, now);
    gainNode.gain.linearRampToValueAtTime(0.75, now + 0.04);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

    noiseSource.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    noiseSource.start(now);

    // Subtle gentle crystal chime on successful rip
    setTimeout(() => {
      this.playChime(659.25, 0.4, 0.25);
      setTimeout(() => this.playChime(880, 0.5, 0.28), 100);
    }, 120);
  }

  /**
   * Crystal bell note
   */
  playChime(freq = 528, duration = 1.4, volume = 0.25) {
    this.initContext();
    const ctx = this.ctx;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const oscHarmonic = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    oscHarmonic.type = 'sine';
    oscHarmonic.frequency.setValueAtTime(freq * 2.76, now);

    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    oscHarmonic.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    oscHarmonic.start(now);
    osc.stop(now + duration);
    oscHarmonic.stop(now + duration);
  }

  /**
   * Singing bowl note
   */
  playSingingBowl(baseFreq = 216, duration = 5.0, volume = 0.3) {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;

    const harmonics = [1, 2.01, 3.02];
    const gains = [0.6, 0.3, 0.15];

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(volume, now);
    masterGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    masterGain.connect(ctx.destination);

    harmonics.forEach((h, index) => {
      const osc = ctx.createOscillator();
      const hGain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq * h, now);
      hGain.gain.setValueAtTime(gains[index], now);

      osc.connect(hGain);
      hGain.connect(masterGain);

      osc.start(now);
      osc.stop(now + duration);
    });
  }

  /**
   * Gentle celebration chime for timer completion
   */
  playTimerCompleteSound() {
    this.initContext();
    this.playSingingBowl(216, 6.0, 0.35);

    const notes = [432, 540, 648, 864];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playChime(freq, 2.8, 0.3);
      }, idx * 250);
    });
  }
}

window.spaAudio = new SpaAudioEngine();

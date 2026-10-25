/**
 * Web Audio API Engine
 * Interactive Paper Tearing Physics & Continuous 432Hz Meditative Spa Drone
 * 100% Procedural • Mobile/Safari iOS Unlocked • Zero External Audio Assets
 */

class SpaAudioEngine {
  constructor() {
    this.ctx = null;
    this.isMusicPlaying = false;
    this.ambientGain = null;
    this.ambientOscillators = [];
    this.lfo = null;
    this.bowlInterval = null;
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
    // Throttle crackles slightly for organic paper sound
    if (now - this.lastCrackleTime < 65) return;
    this.lastCrackleTime = now;

    if (!this.ctx) return;
    const ctx = this.ctx;
    const audioNow = ctx.currentTime;

    const duration = 0.08;
    const bufferSize = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      const t = i / bufferSize;
      const noise = (Math.random() * 2 - 1);
      data[i] = noise * (1 - t) * (Math.random() > 0.4 ? 1 : 0.2);
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200 + progressFraction * 800, audioNow);
    filter.Q.setValueAtTime(3.0, audioNow);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.25, audioNow);
    gain.gain.exponentialRampToValueAtTime(0.001, audioNow + duration);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    source.start(audioNow);
  }

  /**
   * Synthesize full realistic paper tear / coupon rip snap
   */
  playTearSound() {
    this.initContext();
    const ctx = this.ctx;
    const now = ctx.currentTime;

    // Buffer of shaped white noise with high-frequency crackles for paper ripping
    const duration = 0.42;
    const bufferSize = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      const t = i / ctx.sampleRate;
      const crackle = Math.random() > 0.82 ? (Math.random() * 2 - 1) * 1.6 : 0;
      data[i] = ((Math.random() * 2 - 1) * 0.75 + crackle) * Math.exp(-t * 3.8);
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1600, now);
    filter.frequency.exponentialRampToValueAtTime(600, now + duration);
    filter.Q.setValueAtTime(2.5, now);

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.01, now);
    gainNode.gain.linearRampToValueAtTime(0.8, now + 0.04);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

    noiseSource.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    noiseSource.start(now);

    // Magical crystal chimes on successful tear
    setTimeout(() => {
      this.playChime(659.25, 0.4, 0.3); // E5
      setTimeout(() => this.playChime(880, 0.5, 0.35), 90); // A5
      setTimeout(() => this.playChime(1056, 0.8, 0.25), 180); // C6
    }, 120);
  }

  /**
   * Synthesize a crystal chime note
   */
  playChime(freq = 528, duration = 1.6, volume = 0.3) {
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
   * Synthesize a deep Tibetan singing bowl
   */
  playSingingBowl(baseFreq = 216, duration = 6.0, volume = 0.35) {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;

    const harmonics = [1, 2.01, 3.02, 4.05];
    const gains = [0.6, 0.3, 0.15, 0.08];

    const masterBowlGain = ctx.createGain();
    masterBowlGain.gain.setValueAtTime(volume, now);
    masterBowlGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    masterBowlGain.connect(ctx.destination);

    harmonics.forEach((h, index) => {
      const osc = ctx.createOscillator();
      const hGain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq * h, now);
      osc.frequency.linearRampToValueAtTime(baseFreq * h * 0.998, now + duration);

      hGain.gain.setValueAtTime(gains[index], now);

      osc.connect(hGain);
      hGain.connect(masterBowlGain);

      osc.start(now);
      osc.stop(now + duration);
    });
  }

  /**
   * Continuous 432Hz ambient spa drone music
   */
  startSpaMusic() {
    this.initContext();
    if (this.isMusicPlaying) return;

    const ctx = this.ctx;
    const now = ctx.currentTime;

    this.ambientGain = ctx.createGain();
    this.ambientGain.gain.setValueAtTime(0.001, now);
    this.ambientGain.gain.linearRampToValueAtTime(0.35, now + 3.0);
    this.ambientGain.connect(ctx.destination);

    const chordFrequencies = [108.0, 162.0, 216.0, 270.0, 324.0, 432.0];

    const ambientFilter = ctx.createBiquadFilter();
    ambientFilter.type = 'lowpass';
    ambientFilter.frequency.setValueAtTime(450, now);

    this.lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    this.lfo.type = 'sine';
    this.lfo.frequency.setValueAtTime(0.08, now); // ~12.5s wave
    lfoGain.gain.setValueAtTime(180, now);

    this.lfo.connect(ambientFilter.frequency);
    this.lfo.start(now);

    this.ambientOscillators = [];

    chordFrequencies.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();

      osc.type = i % 2 === 0 ? 'sine' : 'triangle';
      const detune = (Math.random() - 0.5) * 6;
      osc.frequency.setValueAtTime(freq, now);
      osc.detune.setValueAtTime(detune, now);

      const amp = (0.28 / (i + 1)) * (i === 5 ? 0.35 : 1);
      oscGain.gain.setValueAtTime(amp, now);

      osc.connect(oscGain);
      oscGain.connect(ambientFilter);
      osc.start(now);

      this.ambientOscillators.push(osc);
    });

    ambientFilter.connect(this.ambientGain);

    setTimeout(() => {
      if (this.isMusicPlaying) {
        this.playSingingBowl(216, 7.0, 0.28);
      }
    }, 1200);

    this.bowlInterval = setInterval(() => {
      if (this.isMusicPlaying) {
        const bowlNotes = [216, 270, 324, 432];
        const randomNote = bowlNotes[Math.floor(Math.random() * bowlNotes.length)];
        this.playSingingBowl(randomNote, 6.5, 0.22);
      }
    }, 16000);

    this.isMusicPlaying = true;
  }

  stopSpaMusic() {
    if (!this.isMusicPlaying || !this.ctx) return;

    if (this.bowlInterval) {
      clearInterval(this.bowlInterval);
      this.bowlInterval = null;
    }

    const now = this.ctx.currentTime;
    if (this.ambientGain) {
      this.ambientGain.gain.setValueAtTime(this.ambientGain.gain.value, now);
      this.ambientGain.gain.linearRampToValueAtTime(0.0001, now + 1.2);
    }

    setTimeout(() => {
      this.ambientOscillators.forEach(osc => {
        try { osc.stop(); osc.disconnect(); } catch (e) {}
      });
      this.ambientOscillators = [];
      if (this.lfo) {
        try { this.lfo.stop(); this.lfo.disconnect(); } catch (e) {}
        this.lfo = null;
      }
      this.isMusicPlaying = false;
    }, 1300);

    this.isMusicPlaying = false;
  }

  toggleSpaMusic() {
    if (this.isMusicPlaying) {
      this.stopSpaMusic();
      return false;
    } else {
      this.startSpaMusic();
      return true;
    }
  }

  playTimerCompleteSound() {
    this.initContext();
    this.playSingingBowl(216, 8.0, 0.4);

    const chords = [
      { freq: 432, delay: 200 },
      { freq: 540, delay: 500 },
      { freq: 648, delay: 800 },
      { freq: 864, delay: 1100 }
    ];

    chords.forEach(c => {
      setTimeout(() => {
        this.playChime(c.freq, 3.5, 0.35);
      }, c.delay);
    });
  }
}

window.spaAudio = new SpaAudioEngine();

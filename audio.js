/**
 * Web Audio API Engine
 * Procedural Sound Effects & Continuous Spa Ambient Drone Synthesis
 * Zero external audio files needed • 100% reliable on iOS Safari & Mobile
 */

class SpaAudioEngine {
  constructor() {
    this.ctx = null;
    this.isMusicPlaying = false;
    this.ambientGain = null;
    this.ambientOscillators = [];
    this.lfo = null;
    this.bowlInterval = null;
    this.initialized = false;
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
    this.initialized = true;
  }

  /**
   * Synthesize a realistic paper tear / coupon rip sound effect
   */
  playTearSound() {
    this.initContext();
    const ctx = this.ctx;
    const now = ctx.currentTime;

    // Buffer of shaped white noise with high-frequency crackles for paper ripping
    const duration = 0.45;
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      const t = i / ctx.sampleRate;
      // White noise with micro random impulses (fibers ripping)
      const crackle = Math.random() > 0.88 ? (Math.random() * 2 - 1) * 1.5 : 0;
      data[i] = ((Math.random() * 2 - 1) * 0.7 + crackle) * Math.exp(-t * 3.5);
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = buffer;

    // Bandpass filter to isolate crisp paper rustle frequency
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1400, now);
    filter.frequency.exponentialRampToValueAtTime(700, now + duration);
    filter.Q.setValueAtTime(2.2, now);

    // Gain envelope with rapid micro-fluctuations
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.01, now);
    gainNode.gain.linearRampToValueAtTime(0.7, now + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

    noiseSource.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    noiseSource.start(now);

    // Gentle magical harmonic pop/sparkle at the end of tear
    setTimeout(() => {
      this.playChime(659.25, 0.25); // E5
      setTimeout(() => this.playChime(880, 0.3), 80); // A5
    }, 180);
  }

  /**
   * Synthesize a crystal bell / singing chime note
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

    // Subtle overtone (bell harmonic 2.76x)
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
   * Synthesize a deep, calming Tibetan singing bowl tone
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
      // Subtle pitch vibrato for organic bowl resonance
      osc.frequency.linearRampToValueAtTime(baseFreq * h * 0.998, now + duration);

      hGain.gain.setValueAtTime(gains[index], now);

      osc.connect(hGain);
      hGain.connect(masterBowlGain);

      osc.start(now);
      osc.stop(now + duration);
    });
  }

  /**
   * Start procedural continuous relaxing spa ambient music
   * (432Hz harmonic chord drone + breathing LFO + periodic singing bowl)
   */
  startSpaMusic() {
    this.initContext();
    if (this.isMusicPlaying) return;

    const ctx = this.ctx;
    const now = ctx.currentTime;

    // Master ambient gain
    this.ambientGain = ctx.createGain();
    this.ambientGain.gain.setValueAtTime(0.001, now);
    this.ambientGain.gain.linearRampToValueAtTime(0.35, now + 3.0); // Smooth 3-second fade in
    this.ambientGain.connect(ctx.destination);

    // Calm 432Hz & 528Hz Solfeggio soothing pad chord (F, A, C, E, G soothing warm spread)
    const chordFrequencies = [
      108.0,  // Deep root foundation (A2 approx)
      162.0,  // Soft fifth
      216.0,  // 432 / 2 (A3)
      270.0,  // Warm major third
      324.0,  // High harmonic
      432.0   // 432 Hz Golden Healing Tone
    ];

    // Filter to keep sound warm, soft and gentle like a warm bath
    const ambientFilter = ctx.createBiquadFilter();
    ambientFilter.type = 'lowpass';
    ambientFilter.frequency.setValueAtTime(450, now);

    // LFO to slowly modulate filter cutoff (breathing wave sensation: 12 seconds per breath)
    this.lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    this.lfo.type = 'sine';
    this.lfo.frequency.setValueAtTime(0.08, now); // ~12.5 seconds cycle
    lfoGain.gain.setValueAtTime(180, now);

    this.lfo.connect(ambientFilter.frequency);
    this.lfo.start(now);

    this.ambientOscillators = [];

    chordFrequencies.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();

      // Alternate sine and gentle triangle for warmth
      osc.type = i % 2 === 0 ? 'sine' : 'triangle';
      
      // Slight gentle detune for lush rich stereo texture
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

    // Initial peaceful bowl note
    setTimeout(() => {
      if (this.isMusicPlaying) {
        this.playSingingBowl(216, 7.0, 0.28);
      }
    }, 1200);

    // Periodic gentle singing bowl / wind bell note every 16 seconds
    this.bowlInterval = setInterval(() => {
      if (this.isMusicPlaying) {
        const bowlNotes = [216, 270, 324, 432];
        const randomNote = bowlNotes[Math.floor(Math.random() * bowlNotes.length)];
        this.playSingingBowl(randomNote, 6.5, 0.22);
      }
    }, 16000);

    this.isMusicPlaying = true;
  }

  /**
   * Stop spa ambient music with smooth gentle fade-out
   */
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

  /**
   * Toggle music status
   */
  toggleSpaMusic() {
    if (this.isMusicPlaying) {
      this.stopSpaMusic();
      return false;
    } else {
      this.startSpaMusic();
      return true;
    }
  }

  /**
   * Celebration fanfare / chime chord for timer finish
   */
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

// Global audio engine singleton
window.spaAudio = new SpaAudioEngine();

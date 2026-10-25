/**
 * Luxury Anniversary VIP Coupon & Spa App
 * Main Controller & Touch Interactions
 */

(function () {
  'use strict';

  // --- State Variables ---
  const INITIAL_DURATION_SEC = 25 * 60; // 25 Minutes = 1500 seconds
  let totalDurationSec = INITIAL_DURATION_SEC;
  let remainingSec = INITIAL_DURATION_SEC;
  let timerInterval = null;
  let isTimerRunning = false;
  let isRipped = false;

  // --- Dynamic Loving Messages ---
  const ROMANTIC_MESSAGES = [
    "מגיע לך את כל השקט שבעולם... פשוט תנשמי עמוק ותרגישי את הרגע.",
    "אוהב אותך עד אין קץ ❤️ את האישה של חיי והמתנה הכי יקרה שלי.",
    "תני לכל הדאגות והמחשבות להתפוגג עכשיו... הגוף שלך במקום בטוח ורגוע.",
    "תשקעי לתוך הרוגע והחום, כל נשימה מעמיקה את השלווה שלך ✨",
    "תודה על כל יום לצידך, על האור שאת מכניסה לחיים שלי 💍",
    "העיניים שלך, החיוך שלך, הלב שלך – הכל בך פשוט מושלם 🌸",
    "פשוט תעצמי עיניים ותרגישי כמה את אהובה, מוגנת ומוערכת.",
    "יום נישואין שמח למלכה הפרטית שלי 👑"
  ];
  let currentMessageIndex = 0;
  let messageInterval = null;

  // --- DOM Elements ---
  const couponView = document.getElementById('coupon-view');
  const spaView = document.getElementById('spa-view');
  const luxuryCard = document.getElementById('luxury-card');
  const ripCouponBtn = document.getElementById('rip-coupon-btn');
  const revealModal = document.getElementById('reveal-modal');
  const startSpaBtn = document.getElementById('start-spa-btn');
  const finaleModal = document.getElementById('finale-modal');
  const restartSpaBtn = document.getElementById('restart-spa-btn');
  const closeFinaleBtn = document.getElementById('close-finale-btn');

  // Spa Controls & Display
  const timerDisplay = document.getElementById('timer-display');
  const timerProgressRing = document.getElementById('timer-progress-ring');
  const romanticMessageEl = document.getElementById('romantic-message');
  const toggleTimerBtn = document.getElementById('toggle-timer-btn');
  const playPauseIcon = document.getElementById('play-pause-icon');
  const playPauseLabel = document.getElementById('play-pause-label');
  const toggleMusicBtn = document.getElementById('toggle-music-btn');
  const musicToggleLabel = document.getElementById('music-toggle-label');
  const spaStatusText = document.getElementById('spa-status-text');
  const demoFastForwardBtn = document.getElementById('demo-fast-forward-btn');
  const addFiveMinBtn = document.getElementById('add-five-min-btn');

  // SVG Ring Circumference (radius = 132)
  const RING_CIRCUMFERENCE = 2 * Math.PI * 132; // ~829.38
  if (timerProgressRing) {
    timerProgressRing.style.strokeDasharray = `${RING_CIRCUMFERENCE} ${RING_CIRCUMFERENCE}`;
    timerProgressRing.style.strokeDashoffset = '0';
  }

  // ==========================================================================
  // 1. AMBIENT BACKGROUND PARTICLES CANVAS
  // ==========================================================================
  const ambientCanvas = document.getElementById('ambient-canvas');
  let canvasCtx = null;
  let particles = [];
  let animFrameId = null;

  function initAmbientCanvas() {
    if (!ambientCanvas) return;
    canvasCtx = ambientCanvas.getContext('2d');
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas, { passive: true });

    // Generate stars & golden floating dust
    particles = [];
    const count = Math.min(window.innerWidth < 450 ? 45 : 70, 80);
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * ambientCanvas.width,
        y: Math.random() * ambientCanvas.height,
        size: Math.random() * 2.2 + 0.6,
        alpha: Math.random() * 0.7 + 0.2,
        speedY: -(Math.random() * 0.4 + 0.15),
        speedX: (Math.random() - 0.5) * 0.2,
        pulseSpeed: Math.random() * 0.02 + 0.01,
        color: Math.random() > 0.4 ? 'rgba(212, 175, 55, ' : 'rgba(229, 152, 155, '
      });
    }

    renderParticles();
  }

  function resizeCanvas() {
    if (!ambientCanvas) return;
    ambientCanvas.width = window.innerWidth;
    ambientCanvas.height = window.innerHeight;
  }

  function renderParticles() {
    if (!canvasCtx) return;
    canvasCtx.clearRect(0, 0, ambientCanvas.width, ambientCanvas.height);

    particles.forEach(p => {
      p.y += p.speedY;
      p.x += p.speedX;
      p.alpha += Math.sin(Date.now() * p.pulseSpeed) * 0.015;
      const clampedAlpha = Math.max(0.1, Math.min(0.9, p.alpha));

      if (p.y < -10) p.y = ambientCanvas.height + 10;
      if (p.x < -10) p.x = ambientCanvas.width + 10;
      if (p.x > ambientCanvas.width + 10) p.x = -10;

      canvasCtx.beginPath();
      canvasCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      canvasCtx.fillStyle = p.color + clampedAlpha + ')';
      canvasCtx.shadowBlur = p.size * 3;
      canvasCtx.shadowColor = 'rgba(212, 175, 55, 0.4)';
      canvasCtx.fill();
    });

    animFrameId = requestAnimationFrame(renderParticles);
  }

  // ==========================================================================
  // 2. COUPON TEAR & INTERACTION
  // ==========================================================================

  function triggerTearAnimation() {
    if (isRipped) return;
    isRipped = true;

    // Haptic feedback if supported on iOS/Android
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate([40, 60, 90]);
      } catch (e) {}
    }

    // Play procedural tear sound effect via Web Audio API
    if (window.spaAudio) {
      window.spaAudio.playTearSound();
    }

    // Apply tearing class
    luxuryCard.classList.add('is-ripping');

    // Confetti Fireworks explosion (Gold, Rose Gold, Heart Sprinkles)
    fireLuxuryConfetti();

    // Show Reveal Modal after slight delay
    setTimeout(() => {
      revealModal.classList.add('active');
    }, 700);
  }

  // Multi-stage Golden & Rose Confetti
  function fireLuxuryConfetti() {
    if (typeof confetti === 'function') {
      const goldPalette = ['#D4AF37', '#FFF2A3', '#AA771C', '#E5989B', '#FFFFFF'];

      // Burst 1: Center Pop
      confetti({
        particleCount: 70,
        spread: 80,
        origin: { y: 0.55 },
        colors: goldPalette,
        startVelocity: 35,
        disableForReducedMotion: true
      });

      // Burst 2: Left Cannon
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 65,
          origin: { x: 0, y: 0.6 },
          colors: goldPalette
        });
      }, 250);

      // Burst 3: Right Cannon
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 65,
          origin: { x: 1, y: 0.6 },
          colors: goldPalette
        });
      }, 400);

      // Burst 4: Falling stars / hearts shower
      setTimeout(() => {
        confetti({
          particleCount: 40,
          spread: 100,
          origin: { y: 0.3 },
          shapes: ['circle'],
          colors: ['#FFE58F', '#FF758F', '#D4AF37'],
          gravity: 0.8,
          scalar: 1.2
        });
      }, 700);
    }
  }

  // ==========================================================================
  // 3. TRANSITION TO STEP 3 (SPA MODE & TIMER)
  // ==========================================================================

  function transitionToSpaView() {
    // Hide Modal
    revealModal.classList.remove('active');

    // Smooth Screen Transition
    couponView.classList.remove('active');
    setTimeout(() => {
      couponView.style.display = 'none';
      spaView.style.display = 'flex';
      setTimeout(() => {
        spaView.classList.add('active');
      }, 40);

      // Automatically start Spa Music and 25-minute timer
      if (window.spaAudio) {
        window.spaAudio.startSpaMusic();
        updateMusicUI(true);
      }
      startTimer();
      startDynamicMessages();
    }, 400);
  }

  // ==========================================================================
  // 4. TIMER ENGINE & PROGRESS RING
  // ==========================================================================

  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  function updateTimerDisplay() {
    if (timerDisplay) {
      timerDisplay.textContent = formatTime(remainingSec);
    }

    if (timerProgressRing) {
      const progressFraction = (totalDurationSec - remainingSec) / totalDurationSec;
      const offset = RING_CIRCUMFERENCE * (1 - progressFraction);
      timerProgressRing.style.strokeDashoffset = offset.toFixed(2);
    }
  }

  function startTimer() {
    if (isTimerRunning) return;
    isTimerRunning = true;
    updateTimerStatusUI(true);

    timerInterval = setInterval(() => {
      if (remainingSec > 0) {
        remainingSec--;
        updateTimerDisplay();
      } else {
        finishSpaSession();
      }
    }, 1000);
  }

  function pauseTimer() {
    if (!isTimerRunning) return;
    isTimerRunning = false;
    clearInterval(timerInterval);
    timerInterval = null;
    updateTimerStatusUI(false);
  }

  function toggleTimer() {
    if (isTimerRunning) {
      pauseTimer();
    } else {
      startTimer();
    }
  }

  function updateTimerStatusUI(running) {
    if (!playPauseIcon || !playPauseLabel || !spaStatusText) return;
    if (running) {
      playPauseIcon.textContent = '⏸️';
      playPauseLabel.textContent = 'השהה פינוק';
      spaStatusText.textContent = 'זמן הפינוק בעיצומו';
      spaStatusText.parentElement.style.borderColor = 'rgba(34, 197, 94, 0.3)';
    } else {
      playPauseIcon.textContent = '▶️';
      playPauseLabel.textContent = 'המשך פינוק';
      spaStatusText.textContent = 'הפינוק מושהה';
      spaStatusText.parentElement.style.borderColor = 'rgba(212, 175, 55, 0.3)';
    }
  }

  // ==========================================================================
  // 5. AMBIENT MUSIC TOGGLE & CONTROLS
  // ==========================================================================

  function toggleMusic() {
    if (!window.spaAudio) return;
    const isPlaying = window.spaAudio.toggleSpaMusic();
    updateMusicUI(isPlaying);
  }

  function updateMusicUI(isPlaying) {
    if (!toggleMusicBtn || !musicToggleLabel) return;
    if (isPlaying) {
      toggleMusicBtn.classList.add('active');
      musicToggleLabel.textContent = 'מוזיקת ספא פעילה';
    } else {
      toggleMusicBtn.classList.remove('active');
      musicToggleLabel.textContent = 'מוזיקה מושתקת';
    }
  }

  // ==========================================================================
  // 6. DYNAMIC ROMANTIC MESSAGES ROTATION
  // ==========================================================================

  function startDynamicMessages() {
    if (messageInterval) clearInterval(messageInterval);
    updateRomanticMessage();

    // Rotate every 12 seconds with gentle fade
    messageInterval = setInterval(() => {
      currentMessageIndex = (currentMessageIndex + 1) % ROMANTIC_MESSAGES.length;
      updateRomanticMessage();
    }, 12000);
  }

  function updateRomanticMessage() {
    if (!romanticMessageEl) return;
    romanticMessageEl.classList.add('fade-out');
    setTimeout(() => {
      romanticMessageEl.textContent = ROMANTIC_MESSAGES[currentMessageIndex];
      romanticMessageEl.classList.remove('fade-out');
    }, 600);
  }

  // ==========================================================================
  // 7. STEP 4: TIME UP / FINALE CELEBRATION
  // ==========================================================================

  function finishSpaSession() {
    pauseTimer();

    // Play singing bowl & victory chime chord
    if (window.spaAudio) {
      window.spaAudio.playTimerCompleteSound();
    }

    // Mega celebration confetti
    if (typeof confetti === 'function') {
      const duration = 4000;
      const animationEnd = Date.now() + duration;
      const colors = ['#D4AF37', '#FFF2A3', '#FF758F', '#FFFFFF', '#E5989B'];

      (function frame() {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.6 },
          colors: colors
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.6 },
          colors: colors
        });

        if (Date.now() < animationEnd) {
          requestAnimationFrame(frame);
        }
      }());
    }

    // Show Finale Modal
    setTimeout(() => {
      if (finaleModal) {
        finaleModal.classList.add('active');
      }
    }, 800);
  }

  // ==========================================================================
  // 8. EVENT LISTENERS & SETUP
  // ==========================================================================

  function setupEventListeners() {
    // 1. Coupon Rip Button
    if (ripCouponBtn) {
      ripCouponBtn.addEventListener('click', (e) => {
        e.preventDefault();
        triggerTearAnimation();
      });
      ripCouponBtn.addEventListener('touchend', (e) => {
        // Ensure immediate touch response on iOS
        e.preventDefault();
        triggerTearAnimation();
      });
    }

    // Also allow tapping the card itself to tear
    if (luxuryCard) {
      luxuryCard.addEventListener('click', (e) => {
        if (!isRipped && !e.target.closest('#rip-coupon-btn')) {
          triggerTearAnimation();
        }
      });
    }

    // 2. Start Spa button from Reveal Modal
    if (startSpaBtn) {
      startSpaBtn.addEventListener('click', transitionToSpaView);
    }

    // 3. Play / Pause Timer
    if (toggleTimerBtn) {
      toggleTimerBtn.addEventListener('click', toggleTimer);
    }

    // 4. Music Toggle
    if (toggleMusicBtn) {
      toggleMusicBtn.addEventListener('click', toggleMusic);
    }

    // 5. Demo Fast Forward (Sets timer to 10 seconds for instant test)
    if (demoFastForwardBtn) {
      demoFastForwardBtn.addEventListener('click', () => {
        remainingSec = 10;
        updateTimerDisplay();
        if (!isTimerRunning) {
          startTimer();
        }
      });
    }

    // 6. Add 5 Minutes (+300 sec)
    if (addFiveMinBtn) {
      addFiveMinBtn.addEventListener('click', () => {
        remainingSec += 300;
        totalDurationSec = Math.max(totalDurationSec, remainingSec);
        updateTimerDisplay();
      });
    }

    // 7. Restart Spa / Extra 5 minutes from Finale Modal
    if (restartSpaBtn) {
      restartSpaBtn.addEventListener('click', () => {
        if (finaleModal) finaleModal.classList.remove('active');
        remainingSec = 5 * 60; // 5 more minutes
        totalDurationSec = 5 * 60;
        updateTimerDisplay();
        startTimer();
      });
    }

    if (closeFinaleBtn) {
      closeFinaleBtn.addEventListener('click', () => {
        if (finaleModal) finaleModal.classList.remove('active');
      });
    }

    // Gentle 3D Gyro / Touch tilt on coupon card
    if (luxuryCard && window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', (e) => {
        if (isRipped) return;
        const gamma = e.gamma || 0; // Left-to-right tilt [-90,90]
        const beta = e.beta || 0;   // Front-to-back tilt [-180,180]
        const tiltX = Math.max(-12, Math.min(12, beta / 4));
        const tiltY = Math.max(-12, Math.min(12, -gamma / 3));
        luxuryCard.style.transform = `rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
      }, { passive: true });
    }
  }

  // --- Document Ready ---
  document.addEventListener('DOMContentLoaded', () => {
    initAmbientCanvas();
    setupEventListeners();
    updateTimerDisplay();
  });

})();

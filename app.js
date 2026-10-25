/**
 * Luxury Boarding Pass & Spa Experience
 * Touch-First Draggable Tear Gesture • Mystery 1/6 Theme • Auto Spa Launch
 */

(function () {
  'use strict';

  // --- Timer State ---
  const INITIAL_DURATION_SEC = 25 * 60; // 25 Minutes = 1500 seconds
  let totalDurationSec = INITIAL_DURATION_SEC;
  let remainingSec = INITIAL_DURATION_SEC;
  let timerInterval = null;
  let isTimerRunning = false;
  let isTorn = false;

  // --- Dynamic Mystery & Romance Messages ---
  const ROMANTIC_MESSAGES = [
    "תשכבי בנוח, תעצמי עיניים ותרפי את הגוף... פשוט תנשמי עמוק.",
    "בלי לחשוב על כלום, בלי שאלות... כל הרגע הזה הוא רק בשבילך 🌸",
    "מגיע לך את כל השקט שבעולם... תני לי לדאוג לכל השאר.",
    "ניצן, את האישה הכי מיוחדת בעולם... תרגישי כמה את אהובה ומוגנת ❤️",
    "תשקעי לתוך הרוגע והחום, כל נשימה מעמיקה את השלווה שלך ✨",
    "חלק 1 מתוך 6... וזו רק ההתחלה של מה שמחכה לך 🤫",
    "פשוט תהיי כאן ועכשיו, בתוך השקט והמגע המרגיע.",
    "הלב שלי שלך לתמיד... תיהני מכל שנייה של שלווה 👑"
  ];
  let currentMessageIndex = 0;
  let messageInterval = null;

  // --- DOM Elements ---
  const couponView = document.getElementById('coupon-view');
  const spaView = document.getElementById('spa-view');
  const boardingPass = document.getElementById('boarding-pass');
  const tearSliderContainer = document.getElementById('tear-slider-container');
  const tearHandle = document.getElementById('tear-handle');
  const tearRipFill = document.getElementById('tear-rip-fill');
  const tearInstruction = document.getElementById('tear-instruction');

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

  // Finale Elements
  const finaleModal = document.getElementById('finale-modal');
  const restartSpaBtn = document.getElementById('restart-spa-btn');
  const closeFinaleBtn = document.getElementById('close-finale-btn');
  const revealAnniversaryBtn = document.getElementById('reveal-anniversary-btn');
  const secretAnniversaryCard = document.getElementById('secret-anniversary-card');

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

  function initAmbientCanvas() {
    if (!ambientCanvas) return;
    canvasCtx = ambientCanvas.getContext('2d');
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas, { passive: true });

    particles = [];
    const count = window.innerWidth < 450 ? 45 : 70;
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * ambientCanvas.width,
        y: Math.random() * ambientCanvas.height,
        size: Math.random() * 2.2 + 0.6,
        alpha: Math.random() * 0.7 + 0.2,
        speedY: -(Math.random() * 0.35 + 0.1),
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
      const clampedAlpha = Math.max(0.1, Math.min(0.85, p.alpha));

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

    requestAnimationFrame(renderParticles);
  }

  // ==========================================================================
  // 2. INTERACTIVE SWIPE-TO-TEAR GESTURE (NO BUTTON!)
  // ==========================================================================

  let isDragging = false;
  let startX = 0;
  let currentDragX = 0;
  let maxDragDistance = 0;

  function initTearGesture() {
    if (!tearSliderContainer || !tearHandle) return;

    function getPointerX(e) {
      if (e.touches && e.touches.length > 0) {
        return e.touches[0].clientX;
      }
      return e.clientX;
    }

    function onDragStart(e) {
      if (isTorn) return;
      isDragging = true;
      const rect = tearSliderContainer.getBoundingClientRect();
      const handleRect = tearHandle.getBoundingClientRect();
      maxDragDistance = rect.width - handleRect.width - 4;

      // In RTL, starting from the right side of the container
      startX = getPointerX(e);
      tearHandle.style.transition = 'none';
      if (tearRipFill) tearRipFill.style.transition = 'none';

      // Unlock Web Audio on first user touch
      if (window.spaAudio) {
        window.spaAudio.initContext();
      }
    }

    function onDragMove(e) {
      if (!isDragging || isTorn) return;

      const currentX = getPointerX(e);
      // Moving finger towards left increases drag in RTL:
      let dragDelta = startX - currentX;
      if (dragDelta < 0) dragDelta = 0;
      if (dragDelta > maxDragDistance) dragDelta = maxDragDistance;

      currentDragX = dragDelta;
      const progressFraction = currentDragX / maxDragDistance;

      // Move the scissors handle along the track
      tearHandle.style.transform = `translateX(-${currentDragX}px) scale(1.06)`;

      // Expand the rip fill behind scissors
      if (tearRipFill) {
        tearRipFill.style.width = `${(progressFraction * 100).toFixed(1)}%`;
      }

      // Fade out prompt text
      if (tearInstruction) {
        tearInstruction.style.opacity = Math.max(0, 1 - progressFraction * 1.5);
      }

      // Real-time paper tearing crackle sounds
      if (window.spaAudio && progressFraction > 0.05) {
        window.spaAudio.playDragCrackle(progressFraction);
      }

      // Micro haptic pulse on mobile
      if ('vibrate' in navigator && Math.random() > 0.7) {
        try { navigator.vibrate(8); } catch (err) {}
      }
    }

    function onDragEnd() {
      if (!isDragging || isTorn) return;
      isDragging = false;

      const progressFraction = currentDragX / maxDragDistance;

      // Threshold: if dragged > 75%, trigger tear completion!
      if (progressFraction >= 0.75) {
        completeTearAction();
      } else {
        // Reset back smoothly
        tearHandle.style.transition = 'transform 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28)';
        tearHandle.style.transform = 'translateX(0px)';
        if (tearRipFill) {
          tearRipFill.style.transition = 'width 0.3s ease';
          tearRipFill.style.width = '0%';
        }
        if (tearInstruction) {
          tearInstruction.style.opacity = '1';
        }
        currentDragX = 0;
      }
    }

    // Touch events for mobile/iPhone
    tearSliderContainer.addEventListener('touchstart', onDragStart, { passive: false });
    window.addEventListener('touchmove', onDragMove, { passive: true });
    window.addEventListener('touchend', onDragEnd, { passive: true });

    // Pointer/Mouse events for desktop
    tearSliderContainer.addEventListener('mousedown', onDragStart);
    window.addEventListener('mousemove', onDragMove);
    window.addEventListener('mouseup', onDragEnd);
  }

  function completeTearAction() {
    if (isTorn) return;
    isTorn = true;

    // Snap handle to the end
    tearHandle.style.transition = 'transform 0.15s ease';
    tearHandle.style.transform = `translateX(-${maxDragDistance}px)`;
    if (tearRipFill) {
      tearRipFill.style.width = '100%';
    }

    // Haptic feedback
    if ('vibrate' in navigator) {
      try { navigator.vibrate([40, 80, 120]); } catch (e) {}
    }

    // Play procedural snap tear sound effect
    if (window.spaAudio) {
      window.spaAudio.playTearSound();
    }

    // Apply physical tear class: the stub detaches and falls away
    boardingPass.classList.add('is-torn');

    // Confetti fireworks explosion
    fireConfetti();

    // Smoothly and automatically launch the Spa mode after 1.2 seconds!
    setTimeout(() => {
      startSpaExperience();
    }, 1200);
  }

  function fireConfetti() {
    if (typeof confetti === 'function') {
      const goldPalette = ['#D4AF37', '#FFF6C7', '#AA771C', '#E5989B', '#FFFFFF'];

      // Burst 1: Center
      confetti({
        particleCount: 75,
        spread: 85,
        origin: { y: 0.55 },
        colors: goldPalette,
        startVelocity: 38
      });

      // Burst 2: Side Cannons
      setTimeout(() => {
        confetti({
          particleCount: 45,
          angle: 60,
          spread: 60,
          origin: { x: 0, y: 0.65 },
          colors: goldPalette
        });
        confetti({
          particleCount: 45,
          angle: 120,
          spread: 60,
          origin: { x: 1, y: 0.65 },
          colors: goldPalette
        });
      }, 250);
    }
  }

  // ==========================================================================
  // 3. LAUNCH SPA SANCTUARY & START 25-MIN TIMER AUTOMATICALLY
  // ==========================================================================

  function startSpaExperience() {
    couponView.classList.remove('active');
    setTimeout(() => {
      couponView.style.display = 'none';
      spaView.style.display = 'flex';
      setTimeout(() => {
        spaView.classList.add('active');
      }, 40);

      // Start relaxing 432Hz ambient spa music automatically
      if (window.spaAudio) {
        window.spaAudio.startSpaMusic();
        updateMusicUI(true);
      }

      // Start 25:00 countdown timer automatically
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
      spaStatusText.textContent = 'חלק 1/6 בעיצומו • עיסוי מלכותי';
      spaStatusText.parentElement.style.borderColor = 'rgba(34, 197, 94, 0.3)';
    } else {
      playPauseIcon.textContent = '▶️';
      playPauseLabel.textContent = 'המשך פינוק';
      spaStatusText.textContent = 'הפינוק מושהה';
      spaStatusText.parentElement.style.borderColor = 'rgba(212, 175, 55, 0.3)';
    }
  }

  // ==========================================================================
  // 5. AMBIENT MUSIC CONTROLS
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
  // 7. STEP 3: FINALE CELEBRATION (MYSTERY & SECRET REVEAL)
  // ==========================================================================

  function finishSpaSession() {
    pauseTimer();

    if (window.spaAudio) {
      window.spaAudio.playTimerCompleteSound();
    }

    if (typeof confetti === 'function') {
      const duration = 4000;
      const animationEnd = Date.now() + duration;
      const colors = ['#D4AF37', '#FFF6C7', '#FF758F', '#FFFFFF', '#E5989B'];

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

    setTimeout(() => {
      if (finaleModal) {
        finaleModal.classList.add('active');
      }
    }, 700);
  }

  // ==========================================================================
  // 8. EVENT LISTENERS
  // ==========================================================================

  function setupEventListeners() {
    // 1. Interactive Tear Slider Gesture
    initTearGesture();

    // 2. Play / Pause Timer
    if (toggleTimerBtn) {
      toggleTimerBtn.addEventListener('click', toggleTimer);
    }

    // 3. Music Toggle
    if (toggleMusicBtn) {
      toggleMusicBtn.addEventListener('click', toggleMusic);
    }

    // 4. Demo Fast Forward (10 seconds left)
    if (demoFastForwardBtn) {
      demoFastForwardBtn.addEventListener('click', () => {
        remainingSec = 10;
        updateTimerDisplay();
        if (!isTimerRunning) {
          startTimer();
        }
      });
    }

    // 5. Add 5 Minutes
    if (addFiveMinBtn) {
      addFiveMinBtn.addEventListener('click', () => {
        remainingSec += 300;
        totalDurationSec = Math.max(totalDurationSec, remainingSec);
        updateTimerDisplay();
      });
    }

    // 6. Restart Spa / Extra 5 minutes from Finale
    if (restartSpaBtn) {
      restartSpaBtn.addEventListener('click', () => {
        if (finaleModal) finaleModal.classList.remove('active');
        remainingSec = 5 * 60;
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

    // 7. Secret Reveal Button (Optional toggle in Finale modal)
    if (revealAnniversaryBtn && secretAnniversaryCard) {
      revealAnniversaryBtn.addEventListener('click', () => {
        secretAnniversaryCard.classList.toggle('hidden');
        if (!secretAnniversaryCard.classList.contains('hidden')) {
          fireConfetti();
        }
      });
    }
  }

  // Document Ready
  document.addEventListener('DOMContentLoaded', () => {
    initAmbientCanvas();
    setupEventListeners();
    updateTimerDisplay();
  });

})();

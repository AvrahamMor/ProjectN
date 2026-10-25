/**
 * Luxury Boarding Pass & Spa Experience
 * Theme: Delicate Rose & White • For: אשתי המושלמת 👑 • 1 מתוך 6
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

  // --- Dynamic Mystery & Romance Messages for "אשתי המושלמת" ---
  const ROMANTIC_MESSAGES = [
    "תשכבי בנוח, תעצמי עיניים ותרפי את הגוף... פשוט תנשמי עמוק.",
    "אשתי המושלמת, כל הרגע הזה נועד רק כדי לפנק אותך 🌸",
    "בלי לחשוב על כלום, בלי שאלות... כל השקט הזה הוא רק שלך.",
    "אשתי, את הדבר הכי יקר לי בעולם... תרגישי כמה את אהובה ומוגנת ❤️",
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
  const musicBtnIcon = document.getElementById('music-btn-icon');
  const musicToggleLabel = document.getElementById('music-toggle-label');
  const spaStatusText = document.getElementById('spa-status-text');
  const demoFastForwardBtn = document.getElementById('demo-fast-forward-btn');
  const addFiveMinBtn = document.getElementById('add-five-min-btn');

  // Local HTML5 Spa Audio Player
  const spaAudioPlayer = document.getElementById('spa-audio-player');
  let isMusicPlaying = false;

  // Finale Elements
  const finaleModal = document.getElementById('finale-modal');
  const restartSpaBtn = document.getElementById('restart-spa-btn');
  const closeFinaleBtn = document.getElementById('close-finale-btn');

  // SVG Ring Circumference (radius = 132)
  const RING_CIRCUMFERENCE = 2 * Math.PI * 132; // ~829.38
  if (timerProgressRing) {
    timerProgressRing.style.strokeDasharray = `${RING_CIRCUMFERENCE} ${RING_CIRCUMFERENCE}`;
    timerProgressRing.style.strokeDashoffset = '0';
  }

  // ==========================================================================
  // 1. AMBIENT BACKGROUND PARTICLES CANVAS (SOFT ROSE PETALS & SPARKLES)
  // ==========================================================================
  const ambientCanvas = document.getElementById('ambient-canvas');
  let canvasCtx = null;
  let petals = [];

  function initAmbientCanvas() {
    if (!ambientCanvas) return;
    canvasCtx = ambientCanvas.getContext('2d');
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas, { passive: true });

    petals = [];
    const count = window.innerWidth < 450 ? 40 : 65;
    for (let i = 0; i < count; i++) {
      petals.push({
        x: Math.random() * ambientCanvas.width,
        y: Math.random() * ambientCanvas.height,
        size: Math.random() * 3.5 + 1.2,
        alpha: Math.random() * 0.6 + 0.25,
        speedY: -(Math.random() * 0.35 + 0.1),
        speedX: (Math.random() - 0.5) * 0.25,
        rot: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.02,
        color: Math.random() > 0.4 ? 'rgba(235, 128, 155, ' : 'rgba(255, 192, 203, '
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

    petals.forEach(p => {
      p.y += p.speedY;
      p.x += p.speedX;
      p.rot += p.rotSpeed;

      if (p.y < -15) p.y = ambientCanvas.height + 15;
      if (p.x < -15) p.x = ambientCanvas.width + 15;
      if (p.x > ambientCanvas.width + 15) p.x = -15;

      canvasCtx.save();
      canvasCtx.translate(p.x, p.y);
      canvasCtx.rotate(p.rot);
      canvasCtx.beginPath();
      // Draw gentle petal ellipse
      canvasCtx.ellipse(0, 0, p.size, p.size * 0.6, 0, 0, Math.PI * 2);
      canvasCtx.fillStyle = p.color + p.alpha + ')';
      canvasCtx.fill();
      canvasCtx.restore();
    });

    requestAnimationFrame(renderParticles);
  }

  // ==========================================================================
  // 2. LOCAL SPA AUDIO CONTROLLER (GENUINE CALMING ACOUSTIC MUSIC)
  // ==========================================================================

  function playSpaAudio() {
    if (!spaAudioPlayer) return;
    spaAudioPlayer.play().then(() => {
      isMusicPlaying = true;
      updateMusicUI(true);
    }).catch(err => {
      console.log('Audio autoplay awaiting interaction:', err);
    });
  }

  function pauseSpaAudio() {
    if (!spaAudioPlayer) return;
    spaAudioPlayer.pause();
    isMusicPlaying = false;
    updateMusicUI(false);
  }

  function toggleMusic() {
    if (isMusicPlaying) {
      pauseSpaAudio();
    } else {
      playSpaAudio();
    }
  }

  function updateMusicUI(isPlaying) {
    if (!toggleMusicBtn || !musicToggleLabel || !musicBtnIcon) return;
    if (isPlaying) {
      toggleMusicBtn.classList.add('active');
      musicBtnIcon.textContent = '🔊';
      musicToggleLabel.textContent = 'מוזיקה פעילה';
    } else {
      toggleMusicBtn.classList.remove('active');
      musicBtnIcon.textContent = '🔈';
      musicToggleLabel.textContent = 'מוזיקה מושתקת';
    }
  }

  // ==========================================================================
  // 3. PROMINENT SWIPE-TO-TEAR GESTURE
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
      maxDragDistance = rect.width - handleRect.width - 6;

      startX = getPointerX(e);
      tearHandle.style.transition = 'none';
      if (tearRipFill) tearRipFill.style.transition = 'none';

      if (window.spaAudio) {
        window.spaAudio.initContext();
      }
    }

    function onDragMove(e) {
      if (!isDragging || isTorn) return;

      const currentX = getPointerX(e);
      // In RTL, moving left increases drag
      let dragDelta = startX - currentX;
      if (dragDelta < 0) dragDelta = 0;
      if (dragDelta > maxDragDistance) dragDelta = maxDragDistance;

      currentDragX = dragDelta;
      const progressFraction = currentDragX / maxDragDistance;

      tearHandle.style.transform = `translateX(-${currentDragX}px) scale(1.08)`;

      if (tearRipFill) {
        tearRipFill.style.width = `${(progressFraction * 100).toFixed(1)}%`;
      }

      if (tearInstruction) {
        tearInstruction.style.opacity = Math.max(0, 1 - progressFraction * 1.6);
      }

      if (window.spaAudio && progressFraction > 0.05) {
        window.spaAudio.playDragCrackle(progressFraction);
      }

      if ('vibrate' in navigator && Math.random() > 0.7) {
        try { navigator.vibrate(8); } catch (err) {}
      }
    }

    function onDragEnd() {
      if (!isDragging || isTorn) return;
      isDragging = false;

      const progressFraction = currentDragX / maxDragDistance;

      // Threshold: if dragged > 70%, trigger tear completion!
      if (progressFraction >= 0.70) {
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

    // Pointer/Mouse events
    tearSliderContainer.addEventListener('mousedown', onDragStart);
    window.addEventListener('mousemove', onDragMove);
    window.addEventListener('mouseup', onDragEnd);

    // Also support tap on the handle to complete tear smoothly
    tearHandle.addEventListener('click', () => {
      if (!isTorn && currentDragX < 20) {
        completeTearAction();
      }
    });
  }

  function completeTearAction() {
    if (isTorn) return;
    isTorn = true;

    tearHandle.style.transition = 'transform 0.2s ease';
    tearHandle.style.transform = `translateX(-${maxDragDistance}px)`;
    if (tearRipFill) {
      tearRipFill.style.width = '100%';
    }

    if ('vibrate' in navigator) {
      try { navigator.vibrate([40, 80, 120]); } catch (e) {}
    }

    if (window.spaAudio) {
      window.spaAudio.playTearSound();
    }

    boardingPass.classList.add('is-torn');
    fireConfetti();

    // Launch Spa mode automatically
    setTimeout(() => {
      startSpaExperience();
    }, 1100);
  }

  function fireConfetti() {
    if (typeof confetti === 'function') {
      const rosePalette = ['#FFCCD5', '#FFB3C1', '#FF758F', '#C94A75', '#FFFFFF', '#DDA7A5'];

      confetti({
        particleCount: 75,
        spread: 85,
        origin: { y: 0.55 },
        colors: rosePalette,
        startVelocity: 38
      });

      setTimeout(() => {
        confetti({
          particleCount: 45,
          angle: 60,
          spread: 60,
          origin: { x: 0, y: 0.65 },
          colors: rosePalette
        });
        confetti({
          particleCount: 45,
          angle: 120,
          spread: 60,
          origin: { x: 1, y: 0.65 },
          colors: rosePalette
        });
      }, 250);
    }
  }

  // ==========================================================================
  // 4. LAUNCH SPA SANCTUARY & START 25-MIN TIMER AUTOMATICALLY
  // ==========================================================================

  function startSpaExperience() {
    couponView.classList.remove('active');
    setTimeout(() => {
      couponView.style.display = 'none';
      spaView.style.display = 'flex';
      setTimeout(() => {
        spaView.classList.add('active');
      }, 40);

      // Start relaxing local acoustic spa music
      playSpaAudio();

      // Start 25:00 countdown timer automatically
      startTimer();
      startDynamicMessages();
    }, 400);
  }

  // ==========================================================================
  // 5. TIMER ENGINE & PROGRESS RING
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
      pauseSpaAudio();
    } else {
      startTimer();
      playSpaAudio();
    }
  }

  function updateTimerStatusUI(running) {
    if (!playPauseIcon || !playPauseLabel || !spaStatusText) return;
    if (running) {
      playPauseIcon.textContent = '⏸️';
      playPauseLabel.textContent = 'השהה פינוק';
      spaStatusText.textContent = 'חלק 1/6 בעיצומו • עיסוי זוגי';
      spaStatusText.parentElement.style.borderColor = 'var(--rose-gold-mid)';
    } else {
      playPauseIcon.textContent = '▶️';
      playPauseLabel.textContent = 'המשך פינוק';
      spaStatusText.textContent = 'הפינוק מושהה';
      spaStatusText.parentElement.style.borderColor = 'rgba(217, 142, 160, 0.45)';
    }
  }

  // ==========================================================================
  // 6. DYNAMIC ROMANTIC MESSAGES ROTATION
  // ==========================================================================

  function startDynamicMessages() {
    if (messageInterval) clearInterval(messageInterval);
    updateRomanticMessage();

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
  // 7. STEP 3: FINALE CELEBRATION (PURE 1/6 MYSTERY - NO SECRET BUTTON)
  // ==========================================================================

  function finishSpaSession() {
    pauseTimer();
    pauseSpaAudio();

    if (window.spaAudio) {
      window.spaAudio.playTimerCompleteSound();
    }

    if (typeof confetti === 'function') {
      const duration = 4000;
      const animationEnd = Date.now() + duration;
      const colors = ['#FFCCD5', '#FFB3C1', '#FF758F', '#C94A75', '#FFFFFF', '#DDA7A5'];

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
    // 1. Prominent Tear Gesture
    initTearGesture();

    // 2. Play / Pause Timer
    if (toggleTimerBtn) {
      toggleTimerBtn.addEventListener('click', toggleTimer);
    }

    // 3. Local Music Toggle Button
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
          playSpaAudio();
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
        playSpaAudio();
      });
    }

    if (closeFinaleBtn) {
      closeFinaleBtn.addEventListener('click', () => {
        if (finaleModal) finaleModal.classList.remove('active');
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

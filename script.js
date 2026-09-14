/**
 * Smart Waste Tracker - Live GPS, Silent Proximity Alerts & Eco Rewards
 * Standalone Vanilla JavaScript implementation (Compatible with VS Code & WebViews)
 */

document.addEventListener('DOMContentLoaded', () => {
  // ==========================================================================
  // 1. Core State & Data
  // ==========================================================================
  const state = {
    theme: localStorage.getItem('swachh_theme') || 'light',
    soundEnabled: true,
    user: JSON.parse(localStorage.getItem('swachh_user')) || {
      name: 'Rajesh Sharma',
      phone: '+91 98765 43210',
      ward: 'Ward 14 - Green Enclave',
      walletPoints: 450,
      totalWasteKg: 32.5,
      co2SavedKg: 19.2,
      vouchersClaimed: 3,
      isLoggedIn: true
    },
    // Truck GPS Simulation state
    truck: {
      lat: 28.6139,
      lng: 77.2090,
      speed: 24, // km/h
      capacityKg: 3100,
      maxCapacityKg: 5000,
      currentStopIndex: 1,
      targetProgress: 0.35, // progress between stops [0, 1]
      isMoving: true,
      simulationMultiplier: 1.0,
      distanceToUser: 380, // in meters
      etaMinutes: 4,
      notifiedNearby: false,
      notifiedCapacity: false
    },
    // User Home Geolocation (Reference)
    userLocation: {
      name: 'My Residence (House #42)',
      x: 350,
      y: 260
    },
    // Waste Route Stops
    stops: [
      { id: 1, name: 'Sector 1 - Community Center', x: 80, y: 120, time: '07:30 AM', status: 'done', wasteType: 'Commercial' },
      { id: 2, name: 'Sector 4 - Green Market', x: 220, y: 140, time: '08:00 AM', status: 'current', wasteType: 'Organic & Dry' },
      { id: 3, name: 'Sector 7 - Resident Colony (Near Home)', x: 380, y: 250, time: '08:25 AM', status: 'upcoming', wasteType: 'Household', isHomeStop: true },
      { id: 4, name: 'Sector 9 - Central School Road', x: 500, y: 160, time: '08:50 AM', status: 'upcoming', wasteType: 'Paper & Plastic' },
      { id: 5, name: 'Sector 11 - Metro Station Square', x: 620, y: 290, time: '09:15 AM', status: 'upcoming', wasteType: 'Mixed' },
      { id: 6, name: 'Bio-Gas & Recycling Depository', x: 540, y: 360, time: '09:45 AM', status: 'upcoming', wasteType: 'Processing Center' }
    ],
    // Selected waste category for QR disposal
    selectedWaste: {
      type: 'plastic',
      rate: 25,
      weight: 2.5
    },
    // Collaborating Government of India Restaurant & Hotel Partners
    rewards: [
      {
        id: 'rew_1',
        partner: "Haldiram's Sweets & Dining",
        category: 'Indian Sweets & Casual Dining',
        offer: 'Flat 25% Off on Total Bill',
        cost: 150,
        logo: '🍛',
        desc: 'Valid on dining and packaged snacks across all city outlets.'
      },
      {
        id: 'rew_2',
        partner: 'Indian Accent Signature Cuisine',
        category: 'Fine Dining & Hospitality',
        offer: '₹500 Gourmet Dining Credit',
        cost: 300,
        logo: '🍽️',
        desc: 'Redeemable on culinary experiences with zero minimum spend.'
      },
      {
        id: 'rew_3',
        partner: 'Barbeque Nation',
        category: 'Buffet & Grill Restaurant',
        offer: '20% Buffet Discount + Complimentary Mocktail',
        cost: 200,
        logo: '🍢',
        desc: 'Valid on both lunch and dinner buffet reservations.'
      },
      {
        id: 'rew_4',
        partner: 'Saravana Bhavan',
        category: 'Traditional South Indian Dining',
        offer: 'Complimentary Eco-Thali Upgrade',
        cost: 100,
        logo: '🥥',
        desc: 'Applicable with any standard meal order.'
      },
      {
        id: 'rew_5',
        partner: 'Taj Vivanta Hotels',
        category: 'Luxury Hotel & Dining',
        offer: '15% Off Weekend High Tea & Stay',
        cost: 450,
        logo: '🏨',
        desc: 'Government of India Green Citizen Privilege card accepted.'
      },
      {
        id: 'rew_6',
        partner: 'Cafe Coffee Day & Tea Lounge',
        category: 'Beverages & Bakery',
        offer: 'Free Handcrafted Eco-Cup Beverage',
        cost: 80,
        logo: '☕',
        desc: 'Bring your reusable cup to double your credit rewards.'
      }
    ],
    // User transaction history
    transactions: [
      { id: 'tx_1', title: 'Plastic Segregation Deposit (2.4 kg)', time: 'Today, 07:45 AM', points: +60, type: 'earned', icon: '🧴' },
      { id: 'tx_2', title: "Haldiram's 25% Off Dining Coupon", time: 'Yesterday', points: -150, type: 'spent', icon: '🎁' },
      { id: 'tx_3', title: 'Cardboard & Raw Veg Waste (3.1 kg)', time: '2 days ago', points: +55, type: 'earned', icon: '📦' }
    ]
  };

  // ==========================================================================
  // 2. DOM Elements Selection
  // ==========================================================================
  const body = document.body;
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const themeIcon = document.getElementById('themeIcon');
  const toggleAudioAlertBtn = document.getElementById('toggleAudioAlertBtn');
  const audioIcon = document.getElementById('audioIcon');
  const userAuthBtn = document.getElementById('userAuthBtn');
  const headerUserName = document.getElementById('headerUserName');
  const toastContainer = document.getElementById('toastContainer');
  const simulateNearbyBtn = document.getElementById('simulateNearbyBtn');

  // Tabs
  const navTabs = document.querySelectorAll('.nav-tab');
  const tabViews = document.querySelectorAll('.tab-view');

  // GPS Metrics
  const truckSpeedEl = document.getElementById('truckSpeed');
  const truckDistanceToHomeEl = document.getElementById('truckDistanceToHome');
  const truckEtaEl = document.getElementById('truckEta');
  const currentStopTextEl = document.getElementById('currentStopText');
  const capacityPercentTextEl = document.getElementById('capacityPercentText');
  const capacityBarFillEl = document.getElementById('capacityBarFill');
  const capacityWeightTextEl = document.getElementById('capacityWeightText');
  const capacityWarningBannerEl = document.getElementById('capacityWarningBanner');
  const overlayStatusTextEl = document.getElementById('overlayStatusText');

  // Map Canvas & Controls
  const gpsCanvas = document.getElementById('gpsCanvas');
  const ctx = gpsCanvas ? gpsCanvas.getContext('2d', { willReadFrequently: true }) : null;
  const centerTruckBtn = document.getElementById('centerTruckBtn');
  const simSpeedBtn = document.getElementById('simSpeedBtn');
  const simPausePlayBtn = document.getElementById('simPausePlayBtn');
  const simNextStopBtn = document.getElementById('simNextStopBtn');
  const simBringNearBtn = document.getElementById('simBringNearBtn');
  const stopsStepperEl = document.getElementById('stopsStepper');

  // Smart Door & QR
  const truckDoorGraphic = document.getElementById('truckDoorGraphic');
  const doorLed = document.getElementById('doorLed');
  const doorStatusText = document.getElementById('doorStatusText');
  const depositAnimItem = document.getElementById('depositAnimItem');
  const sensorWeightReadout = document.getElementById('sensorWeightReadout');
  const wasteTypeGrid = document.getElementById('wasteTypeGrid');
  const wasteWeightInput = document.getElementById('wasteWeightInput');
  const weightDisplay = document.getElementById('weightDisplay');
  const potentialPoints = document.getElementById('potentialPoints');
  const scanQrSimBtn = document.getElementById('scanQrSimBtn');
  const cameraScanToggleBtn = document.getElementById('cameraScanToggleBtn');
  const cameraViewfinder = document.getElementById('cameraViewfinder');
  const closeCameraBtn = document.getElementById('closeCameraBtn');
  const webcamVideo = document.getElementById('webcamVideo');

  // Wallet & Rewards
  const walletBalanceText = document.getElementById('walletBalanceText');
  const statWasteDisposed = document.getElementById('statWasteDisposed');
  const statCo2Saved = document.getElementById('statCo2Saved');
  const statVouchersClaimed = document.getElementById('statVouchersClaimed');
  const rewardsGrid = document.getElementById('rewardsGrid');
  const historyList = document.getElementById('historyList');
  const stopsTimeline = document.getElementById('stopsTimeline');

  // Modals
  const authModal = document.getElementById('authModal');
  const closeAuthModalBtn = document.getElementById('closeAuthModalBtn');
  const tabSignInBtn = document.getElementById('tabSignInBtn');
  const tabSignUpBtn = document.getElementById('tabSignUpBtn');
  const signInForm = document.getElementById('signInForm');
  const signUpForm = document.getElementById('signUpForm');
  const quickDemoLoginBtn = document.getElementById('quickDemoLoginBtn');

  // Voucher Modal
  const voucherModal = document.getElementById('voucherModal');
  const closeVoucherModalBtn = document.getElementById('closeVoucherModalBtn');
  const dismissVoucherBtn = document.getElementById('dismissVoucherBtn');
  const couponPartnerName = document.getElementById('couponPartnerName');
  const couponOfferText = document.getElementById('couponOfferText');
  const couponCodeValue = document.getElementById('couponCodeValue');
  const copyCodeBtn = document.getElementById('copyCodeBtn');

  // ==========================================================================
  // 3. Audio Chime Synthesizer (Web Audio API)
  // Polite zero-horn proximity bell & coin rewards chime
  // ==========================================================================
  let audioContext = null;
  let userInteracted = false;

  // Track user interaction before engaging audio hardware to prevent AudioTrack buffer underruns
  function enableAudioInteraction() {
    userInteracted = true;
    if (audioContext && audioContext.state === 'suspended') {
      audioContext.resume().catch(() => {});
    }
  }

  ['click', 'touchstart', 'touchend', 'keydown', 'pointerdown'].forEach(evt => {
    window.addEventListener(evt, enableAudioInteraction, { passive: true });
  });

  function getAudioContext() {
    if (!userInteracted) return null;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;

    if (!audioContext) {
      try {
        audioContext = new AudioCtx();
      } catch (err) {
        console.warn('AudioContext creation prevented:', err);
        return null;
      }
    }

    if (audioContext && audioContext.state === 'suspended') {
      audioContext.resume().catch(() => {});
    }

    return audioContext;
  }

  function playChime(type = 'nearby') {
    if (!state.soundEnabled || !userInteracted) return;

    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;

      if (type === 'nearby') {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(587.33, now); // D5
        osc1.frequency.exponentialRampToValueAtTime(880.00, now + 0.22); // A5

        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(440.00, now);
        osc2.frequency.exponentialRampToValueAtTime(659.25, now + 0.22); // E5

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.48);
        osc2.stop(now + 0.48);

        setTimeout(() => {
          try {
            osc1.disconnect();
            osc2.disconnect();
            gain.disconnect();
          } catch (_) {}
        }, 500);
      } else if (type === 'success') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
        osc.frequency.setValueAtTime(783.99, now + 0.16); // G5
        osc.frequency.setValueAtTime(1046.50, now + 0.24); // C6

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.48);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.5);

        setTimeout(() => {
          try {
            osc.disconnect();
            gain.disconnect();
          } catch (_) {}
        }, 520);
      }
    } catch (err) {
      console.warn('Audio chime notice:', err);
    }
  }

  // ==========================================================================
  // 4. Toast Notifications System
  // ==========================================================================
  function showToast(title, desc, type = 'info', icon = '🔔', playSound = false) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <div class="toast-icon">${icon}</div>
      <div class="toast-content">
        <div class="toast-title">${title}</div>
        <div class="toast-desc">${desc}</div>
      </div>
    `;

    toastContainer.appendChild(toast);

    if (playSound || type === 'nearby') {
      playChime(type === 'nearby' ? 'nearby' : 'success');
    }

    if (navigator.vibrate && state.soundEnabled && type === 'nearby') {
      try {
        navigator.vibrate([150, 80, 150]);
      } catch (_) {}
    }

    setTimeout(() => {
      toast.style.animation = 'toastOut 0.3s forwards';
      setTimeout(() => toast.remove(), 320);
    }, 4500);
  }

  // ==========================================================================
  // 5. Theme & Audio Controls
  // ==========================================================================
  function applyTheme(theme) {
    state.theme = theme;
    body.setAttribute('data-theme', theme);
    localStorage.setItem('swachh_theme', theme);
    themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
    drawGpsMap();
  }

  themeToggleBtn.addEventListener('click', () => {
    applyTheme(state.theme === 'dark' ? 'light' : 'dark');
  });

  toggleAudioAlertBtn.addEventListener('click', () => {
    state.soundEnabled = !state.soundEnabled;
    audioIcon.textContent = state.soundEnabled ? '🔔' : '🔕';
    showToast(
      state.soundEnabled ? 'Proximity Chime Enabled' : 'Silent Mode Active',
      state.soundEnabled ? 'You will hear gentle audio chimes when the truck nears your residence.' : 'Audio alerts are muted.',
      'info',
      state.soundEnabled ? '🔔' : '🔕'
    );
  });

  applyTheme(state.theme);

  // ==========================================================================
  // 6. Navigation Tabs
  // ==========================================================================
  navTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetId = tab.dataset.tab;
      navTabs.forEach(t => t.classList.remove('active'));
      tabViews.forEach(v => v.classList.remove('active'));

      tab.classList.add('active');
      const targetView = document.getElementById(targetId);
      if (targetView) targetView.classList.add('active');

      if (targetId === 'tab-tracking') {
        setTimeout(drawGpsMap, 50);
      }
    });
  });

  // ==========================================================================
  // 7. Creative Background Animation: Floating Waste Elements
  // ==========================================================================
  const floatingWasteIcons = ['🧴', '📦', '🥬', '🥫', '🔋', '🌱', '♻️', '📄', '🥤'];
  const ecoFacts = [
    'Every 1kg of recycled plastic saves 1.5kg of CO₂!',
    'Kitchen raw scraps generate nutrient-dense municipal compost.',
    'Segregated glass and metals can be recycled indefinitely without loss of quality.',
    'Zero-Horn quiet notifications preserve acoustic peace in your neighborhood.',
    'Redeem points for discounts at Taj Vivanta, Haldiram’s & partner hotels!'
  ];

  function initFloatingBackground() {
    const container = document.getElementById('floatingWasteItems');
    if (!container) return;

    container.innerHTML = '';
    const count = 12;

    for (let i = 0; i < count; i++) {
      const item = document.createElement('div');
      item.className = 'floating-item';
      const icon = floatingWasteIcons[Math.floor(Math.random() * floatingWasteIcons.length)];
      item.textContent = icon;
      item.title = 'Click to collect eco fact!';

      const left = Math.random() * 92 + 4;
      const duration = Math.random() * 12 + 14;
      const delay = Math.random() * 10;
      const size = Math.random() * 0.7 + 1.1;

      item.style.left = `${left}%`;
      item.style.fontSize = `${size}rem`;
      item.style.animationDuration = `${duration}s`;
      item.style.animationDelay = `-${delay}s`;

      item.addEventListener('click', () => {
        const fact = ecoFacts[Math.floor(Math.random() * ecoFacts.length)];
        state.user.walletPoints += 2;
        updateWalletUI();
        showToast('Eco Fact Discovered (+2 Pts)', fact, 'success', '🌱');

        item.style.transform = 'scale(2.2)';
        item.style.opacity = '0';
        setTimeout(() => {
          item.style.transform = '';
          item.style.opacity = '';
        }, 3000);
      });

      container.appendChild(item);
    }
  }

  initFloatingBackground();

  // ==========================================================================
  // 8. Live GPS Map Canvas & Real-Time Tracking Engine
  // ==========================================================================
  function calculateCurrentTruckPosition() {
    const curStop = state.stops[state.truck.currentStopIndex];
    const nextStopIndex = (state.truck.currentStopIndex + 1) % state.stops.length;
    const nextStop = state.stops[nextStopIndex];

    const currentX = curStop.x + (nextStop.x - curStop.x) * state.truck.targetProgress;
    const currentY = curStop.y + (nextStop.y - curStop.y) * state.truck.targetProgress;

    const dx = currentX - state.userLocation.x;
    const dy = currentY - state.userLocation.y;
    const distMeters = Math.round(Math.sqrt(dx * dx + dy * dy) * 2.5);

    state.truck.distanceToUser = distMeters;
    state.truck.etaMinutes = Math.max(1, Math.round(distMeters / (state.truck.speed * 16.6)));

    return { x: currentX, y: currentY, heading: Math.atan2(nextStop.y - curStop.y, nextStop.x - curStop.x) };
  }

  function drawGpsMap() {
    if (!ctx || !gpsCanvas) return;

    const trackingTab = document.getElementById('tab-tracking');
    if (trackingTab && !trackingTab.classList.contains('active')) return;

    const rect = gpsCanvas.getBoundingClientRect();
    const targetW = Math.floor(rect.width);
    const targetH = Math.floor(rect.height);

    if (targetW <= 0 || targetH <= 0) return;

    if (gpsCanvas.width !== targetW || gpsCanvas.height !== targetH) {
      gpsCanvas.width = targetW;
      gpsCanvas.height = targetH;
    }

    const w = gpsCanvas.width;
    const h = gpsCanvas.height;
    const isDark = state.theme === 'dark';

    ctx.fillStyle = isDark ? '#0a1424' : '#f0f5fa';
    ctx.fillRect(0, 0, w, h);

    // City Grid & Green Parks
    ctx.fillStyle = isDark ? 'rgba(16, 185, 129, 0.08)' : 'rgba(16, 185, 129, 0.15)';
    ctx.beginPath();
    ctx.roundRect(40, 40, 180, 100, 12);
    ctx.roundRect(360, 60, 200, 110, 12);
    ctx.roundRect(140, 240, 160, 90, 12);
    ctx.fill();

    // Secondary Street Grid Lines
    ctx.strokeStyle = isDark ? '#142540' : '#e2e8f0';
    ctx.lineWidth = 1;
    for (let x = 30; x < w; x += 60) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 30; y < h; y += 50) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Main Route Ribbon
    ctx.beginPath();
    state.stops.forEach((s, idx) => {
      if (idx === 0) ctx.moveTo(s.x, s.y);
      else ctx.lineTo(s.x, s.y);
    });
    ctx.strokeStyle = isDark ? 'rgba(37, 99, 235, 0.4)' : 'rgba(37, 99, 235, 0.3)';
    ctx.lineWidth = 12;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    // Road Center Line
    ctx.beginPath();
    state.stops.forEach((s, idx) => {
      if (idx === 0) ctx.moveTo(s.x, s.y);
      else ctx.lineTo(s.x, s.y);
    });
    ctx.strokeStyle = isDark ? '#38bdf8' : '#2563eb';
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 6]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw Stops
    state.stops.forEach((stop, idx) => {
      const isPast = idx < state.truck.currentStopIndex;
      const isCurrent = idx === state.truck.currentStopIndex;

      ctx.beginPath();
      ctx.arc(stop.x, stop.y, isCurrent ? 12 : 8, 0, Math.PI * 2);
      ctx.fillStyle = isCurrent ? '#f59e0b' : isPast ? '#10b981' : isDark ? '#334155' : '#94a3b8';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.font = 'bold 10px Plus Jakarta Sans, sans-serif';
      ctx.fillStyle = isDark ? '#cbd5e1' : '#334155';
      ctx.fillText(`Stop ${idx + 1}`, stop.x - 14, stop.y - 14);
    });

    // Citizen's Residence with Proximity Radar Pulse
    const home = state.userLocation;
    const timeSec = Date.now() / 1000;
    const pulseRadius = 14 + (Math.sin(timeSec * 3) + 1) * 12;

    ctx.beginPath();
    ctx.arc(home.x, home.y, pulseRadius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(home.x, home.y, 11, 0, Math.PI * 2);
    ctx.fillStyle = '#10b981';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.font = '12px sans-serif';
    ctx.fillText('🏠', home.x - 6, home.y + 4);
    ctx.font = 'bold 11px Plus Jakarta Sans, sans-serif';
    ctx.fillStyle = isDark ? '#34d399' : '#059669';
    ctx.fillText('Your Home', home.x + 16, home.y + 4);

    // Compute and Draw Truck
    const truckPos = calculateCurrentTruckPosition();

    ctx.beginPath();
    ctx.moveTo(truckPos.x, truckPos.y);
    ctx.lineTo(home.x, home.y);
    ctx.strokeStyle = state.truck.distanceToUser <= 300 ? '#ef4444' : 'rgba(16, 185, 129, 0.35)';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.beginPath();
    ctx.arc(truckPos.x, truckPos.y, 18, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(245, 158, 11, 0.25)';
    ctx.fill();

    ctx.save();
    ctx.translate(truckPos.x, truckPos.y);
    ctx.rotate(truckPos.heading);
    ctx.font = '22px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🚛', 0, 0);
    ctx.restore();

    ctx.fillStyle = isDark ? '#ffffff' : '#0f172a';
    ctx.font = 'bold 10px Space Grotesk, sans-serif';
    ctx.fillText(`Truck: ${state.truck.distanceToUser}m`, truckPos.x + 12, truckPos.y - 12);
  }

  function updateGpsMetricsUI() {
    truckSpeedEl.textContent = `${state.truck.speed} km/h`;
    truckDistanceToHomeEl.textContent = `${state.truck.distanceToUser} m`;
    truckEtaEl.textContent = `${state.truck.etaMinutes} min${state.truck.etaMinutes > 1 ? 's' : ''}`;

    const curStop = state.stops[state.truck.currentStopIndex];
    currentStopTextEl.textContent = curStop ? curStop.name : 'En Route';
    overlayStatusTextEl.textContent = `Heading to: ${curStop ? curStop.name : 'Next Sector'}`;

    const capPct = Math.min(100, Math.round((state.truck.capacityKg / state.truck.maxCapacityKg) * 100));
    capacityPercentTextEl.textContent = `${capPct}% Full`;
    capacityBarFillEl.style.width = `${capPct}%`;
    capacityWeightTextEl.textContent = `${(state.truck.capacityKg / 1000).toFixed(1)} / ${(state.truck.maxCapacityKg / 1000).toFixed(1)} Tons`;

    if (capPct >= 85) {
      capacityWarningBannerEl.classList.remove('hidden');
      if (!state.truck.notifiedCapacity) {
        state.truck.notifiedCapacity = true;
        showToast(
          'Truck Reaching High Capacity (85%+)',
          'Auxiliary compactor active. Residents are requested to bring sorted recyclables promptly.',
          'capacity',
          '⚠️'
        );
      }
    } else {
      capacityWarningBannerEl.classList.add('hidden');
      state.truck.notifiedCapacity = false;
    }

    if (state.truck.distanceToUser <= 250 && !state.truck.notifiedNearby) {
      state.truck.notifiedNearby = true;
      showToast(
        '🚨 TRUCK IS NEARBY YOUR HOME!',
        `Collection truck is within ${state.truck.distanceToUser}m (ETA ~${state.truck.etaMinutes} mins). No need to wait for horns—please dispose your segregated waste!`,
        'nearby',
        '🚛'
      );
    } else if (state.truck.distanceToUser > 400) {
      state.truck.notifiedNearby = false;
    }

    updateStepperUI();
  }

  let lastRenderedStopIndex = -1;
  function updateStepperUI() {
    if (!stopsStepperEl) return;
    if (lastRenderedStopIndex === state.truck.currentStopIndex && stopsStepperEl.children.length > 0) {
      return;
    }
    lastRenderedStopIndex = state.truck.currentStopIndex;
    stopsStepperEl.innerHTML = '';

    state.stops.forEach((stop, idx) => {
      const item = document.createElement('div');
      const isPast = idx < state.truck.currentStopIndex;
      const isCurrent = idx === state.truck.currentStopIndex;
      const isHome = stop.isHomeStop;

      item.className = `stepper-item ${isPast ? 'completed' : ''} ${isCurrent ? 'current' : ''} ${isHome ? 'home' : ''}`;
      item.innerHTML = `
        <div class="stepper-circle">${isPast ? '✓' : idx + 1}</div>
        <span class="stepper-label">${stop.name.split('-')[0].trim()}</span>
      `;
      stopsStepperEl.appendChild(item);
    });
  }

  let lastTime = performance.now();
  let lastMetricsUpdate = 0;
  function gpsAnimationLoop(now) {
    const dt = (now - lastTime) / 1000;
    lastTime = now;

    if (state.truck.isMoving) {
      const stepSpeed = 0.05 * state.truck.simulationMultiplier;
      state.truck.targetProgress += stepSpeed * dt;

      if (state.truck.targetProgress >= 1.0) {
        state.truck.targetProgress = 0;
        state.truck.currentStopIndex = (state.truck.currentStopIndex + 1) % state.stops.length;
        state.truck.capacityKg = Math.min(state.truck.maxCapacityKg, state.truck.capacityKg + 280);
      }
    }

    drawGpsMap();

    // Throttle DOM metrics updates to prevent compositor and layout thrashing
    if (now - lastMetricsUpdate > 100) {
      lastMetricsUpdate = now;
      updateGpsMetricsUI();
    }
    requestAnimationFrame(gpsAnimationLoop);
  }

  requestAnimationFrame(gpsAnimationLoop);

  simPausePlayBtn.addEventListener('click', () => {
    state.truck.isMoving = !state.truck.isMoving;
    simPausePlayBtn.textContent = state.truck.isMoving ? '⏸️ Pause' : '▶️ Resume';
  });

  simSpeedBtn.addEventListener('click', () => {
    if (state.truck.simulationMultiplier === 1.0) {
      state.truck.simulationMultiplier = 2.5;
      simSpeedBtn.textContent = '⏩ 2.5x Speed';
    } else {
      state.truck.simulationMultiplier = 1.0;
      simSpeedBtn.textContent = '⏩ 1x Speed';
    }
  });

  simNextStopBtn.addEventListener('click', () => {
    state.truck.targetProgress = 0;
    state.truck.currentStopIndex = (state.truck.currentStopIndex + 1) % state.stops.length;
    showToast('Route Advanced', `Truck arrived at Stop ${state.truck.currentStopIndex + 1}: ${state.stops[state.truck.currentStopIndex].name}`, 'info', '⏭️');
  });

  simBringNearBtn.addEventListener('click', () => {
    state.truck.currentStopIndex = 2;
    state.truck.targetProgress = 0.85;
    state.truck.notifiedNearby = false;
    showToast('Simulating Truck Near Residence', 'Positioning collection truck 120m away from your door.', 'nearby', '📍');
  });

  simulateNearbyBtn.addEventListener('click', () => {
    state.truck.notifiedNearby = false;
    showToast(
      '🚨 TRUCK IS NEARBY YOUR HOME!',
      'Collection truck is within 150m (ETA ~2 mins). Noise-free quiet chime triggered!',
      'nearby',
      '🚛'
    );
  });

  centerTruckBtn.addEventListener('click', () => {
    showToast('GPS Lock Active', 'Centering truck telemetry on screen.', 'info', '🎯');
  });

  // ==========================================================================
  // 9. Smart Disposal Door & QR Integration
  // ==========================================================================
  const wasteIcons = {
    plastic: '🧴',
    organic: '🥬',
    paper: '📦',
    metal: '🥫',
    ewaste: '🔋'
  };

  const wasteOptions = document.querySelectorAll('.waste-opt');
  wasteOptions.forEach(opt => {
    opt.addEventListener('click', () => {
      wasteOptions.forEach(o => o.classList.remove('active'));
      opt.classList.add('active');
      state.selectedWaste.type = opt.dataset.type;
      state.selectedWaste.rate = parseInt(opt.dataset.rate, 10);
      depositAnimItem.textContent = wasteIcons[state.selectedWaste.type] || '📦';
      recalcPotentialPoints();
    });
  });

  wasteWeightInput.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    state.selectedWaste.weight = val;
    weightDisplay.textContent = `${val.toFixed(1)} kg`;
    recalcPotentialPoints();
  });

  function recalcPotentialPoints() {
    const points = Math.round(state.selectedWaste.rate * state.selectedWaste.weight);
    potentialPoints.textContent = `+${points} Green Credits`;
    sensorWeightReadout.textContent = `${state.selectedWaste.weight.toFixed(2)} kg`;
  }

  recalcPotentialPoints();

  let isScanning = false;

  scanQrSimBtn.addEventListener('click', () => {
    if (isScanning) return;
    isScanning = true;

    scanQrSimBtn.disabled = true;
    scanQrSimBtn.textContent = '⏳ Verifying QR with Truck Server...';

    setTimeout(() => {
      doorStatusText.textContent = 'DOOR UNLOCKED • DEPOSITING';
      doorLed.className = 'led-light unlocked';
      truckDoorGraphic.classList.add('unlocked');
      sensorWeightReadout.textContent = `${state.selectedWaste.weight.toFixed(2)} kg VERIFIED`;

      depositAnimItem.classList.add('dropping');

      setTimeout(() => {
        truckDoorGraphic.classList.remove('unlocked');
        depositAnimItem.classList.remove('dropping');
        doorStatusText.textContent = 'DOOR LOCKED • WEIGHED';
        doorLed.className = 'led-light locked';

        const earned = Math.round(state.selectedWaste.rate * state.selectedWaste.weight);
        state.user.walletPoints += earned;
        state.user.totalWasteKg += state.selectedWaste.weight;
        state.user.co2SavedKg += Math.round(state.selectedWaste.weight * 0.6 * 10) / 10;

        state.transactions.unshift({
          id: `tx_${Date.now()}`,
          title: `${wasteOptionsText(state.selectedWaste.type)} (${state.selectedWaste.weight} kg)`,
          time: 'Just now',
          points: +earned,
          type: 'earned',
          icon: wasteIcons[state.selectedWaste.type] || '♻️'
        });

        updateWalletUI();
        updateHistoryUI();

        showToast(
          `🎉 +${earned} Green Credits Earned!`,
          `Smart door scanned successfully. Points added to your wallet for Indian restaurant & hotel discounts.`,
          'success',
          '🎁',
          true
        );

        scanQrSimBtn.disabled = false;
        scanQrSimBtn.innerHTML = '<span>📷 Scan Door QR & Deposit</span>';
        isScanning = false;
      }, 1600);
    }, 1200);
  });

  function wasteOptionsText(type) {
    switch (type) {
      case 'plastic': return 'Dry Plastic Bottles';
      case 'organic': return 'Raw Kitchen & Organic Waste';
      case 'paper': return 'Cardboard & Paper Waste';
      case 'metal': return 'Metals & Beverage Cans';
      case 'ewaste': return 'Electronic Waste & Batteries';
      default: return 'Recyclable Materials';
    }
  }

  let cameraStream = null;

  cameraScanToggleBtn.addEventListener('click', async () => {
    if (cameraViewfinder.classList.contains('hidden')) {
      cameraViewfinder.classList.remove('hidden');
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          cameraStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
          webcamVideo.srcObject = cameraStream;
        } else {
          showToast('Camera Notice', 'Running in simulated camera scanner mode.', 'info', '📹');
        }
      } catch (err) {
        showToast('Camera Permission', 'Camera access simulated for web preview.', 'info', '📹');
      }
    } else {
      closeCamera();
    }
  });

  function closeCamera() {
    if (cameraStream) {
      cameraStream.getTracks().forEach(t => t.stop());
      cameraStream = null;
    }
    cameraViewfinder.classList.add('hidden');
  }

  closeCameraBtn.addEventListener('click', closeCamera);

  // ==========================================================================
  // 10. Eco Rewards Wallet & Govt Collaborative Indian Discounts
  // ==========================================================================
  function updateWalletUI() {
    walletBalanceText.innerHTML = `${state.user.walletPoints} <span class="pts-unit">Pts</span>`;
    statWasteDisposed.textContent = `${state.user.totalWasteKg.toFixed(1)} kg`;
    statCo2Saved.textContent = `${state.user.co2SavedKg.toFixed(1)} kg`;
    statVouchersClaimed.textContent = `${state.user.vouchersClaimed}`;
    localStorage.setItem('swachh_user', JSON.stringify(state.user));
  }

  function renderRewardsGrid() {
    if (!rewardsGrid) return;
    rewardsGrid.innerHTML = '';

    state.rewards.forEach(rew => {
      const card = document.createElement('div');
      card.className = 'reward-card';
      const canAfford = state.user.walletPoints >= rew.cost;

      card.innerHTML = `
        <div>
          <div class="reward-card-top">
            <div class="partner-logo">${rew.logo}</div>
            <div class="partner-info">
              <h4>${rew.partner}</h4>
              <span class="partner-category">${rew.category}</span>
            </div>
          </div>
          <div class="reward-offer">${rew.offer}</div>
          <p class="reward-desc">${rew.desc}</p>
        </div>
        <div class="reward-action-row">
          <span class="cost-tag">${rew.cost} Credits</span>
          <button class="redeem-btn" ${!canAfford ? 'style="opacity:0.6;"' : ''} data-id="${rew.id}">
            ${canAfford ? 'Redeem Voucher' : 'Need More Pts'}
          </button>
        </div>
      `;

      const btn = card.querySelector('.redeem-btn');
      btn.addEventListener('click', () => {
        if (state.user.walletPoints < rew.cost) {
          showToast(
            'Insufficient Credits',
            `You need ${rew.cost - state.user.walletPoints} more points to claim this discount. Segregate more waste!`,
            'info',
            '🔒'
          );
          return;
        }

        state.user.walletPoints -= rew.cost;
        state.user.vouchersClaimed += 1;

        state.transactions.unshift({
          id: `tx_${Date.now()}`,
          title: `${rew.partner} Voucher`,
          time: 'Just now',
          points: -rew.cost,
          type: 'spent',
          icon: rew.logo
        });

        updateWalletUI();
        updateHistoryUI();
        renderRewardsGrid();

        openVoucherModal(rew);
      });

      rewardsGrid.appendChild(card);
    });
  }

  function openVoucherModal(reward) {
    couponPartnerName.textContent = reward.partner;
    couponOfferText.textContent = reward.offer.toUpperCase();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const code = `SWACHH-${reward.cost}-${randomSuffix}`;
    couponCodeValue.textContent = code;

    voucherModal.classList.remove('hidden');
    playChime('success');
  }

  copyCodeBtn.addEventListener('click', () => {
    const code = couponCodeValue.textContent;
    navigator.clipboard.writeText(code).then(() => {
      copyCodeBtn.textContent = '✓ Copied!';
      setTimeout(() => copyCodeBtn.textContent = '📋 Copy', 2000);
      showToast('Copied to Clipboard', `Promo code ${code} copied for restaurant checkout.`, 'info', '📋');
    });
  });

  closeVoucherModalBtn.addEventListener('click', () => voucherModal.classList.add('hidden'));
  dismissVoucherBtn.addEventListener('click', () => voucherModal.classList.add('hidden'));

  function updateHistoryUI() {
    if (!historyList) return;
    historyList.innerHTML = '';

    state.transactions.slice(0, 6).forEach(tx => {
      const item = document.createElement('div');
      item.className = 'history-item';
      item.innerHTML = `
        <div class="history-item-left">
          <span class="history-icon">${tx.icon}</span>
          <div>
            <div class="history-title">${tx.title}</div>
            <div class="history-time">${tx.time}</div>
          </div>
        </div>
        <div class="history-points ${tx.type}">${tx.points > 0 ? '+' : ''}${tx.points} Pts</div>
      `;
      historyList.appendChild(item);
    });
  }

  // ==========================================================================
  // 11. Schedule Timeline
  // ==========================================================================
  function renderScheduleTimeline() {
    if (!stopsTimeline) return;
    stopsTimeline.innerHTML = '';

    state.stops.forEach((stop, idx) => {
      const isPast = idx < state.truck.currentStopIndex;
      const isCurrent = idx === state.truck.currentStopIndex;

      const item = document.createElement('div');
      item.className = `timeline-item ${isCurrent ? 'active-stop' : ''} ${stop.isHomeStop ? 'home-stop' : ''}`;

      item.innerHTML = `
        <div class="timeline-left">
          <div class="timeline-badge">${idx + 1}</div>
          <div>
            <div class="timeline-name">${stop.name}</div>
            <div class="timeline-sub">Category: ${stop.wasteType} ${stop.isHomeStop ? '• 📍 Your Sector' : ''}</div>
          </div>
        </div>
        <div class="timeline-right">
          <div class="timeline-time">${stop.time}</div>
          <span class="timeline-status ${isPast ? 'done' : isCurrent ? 'now' : 'upcoming'}">
            ${isPast ? 'Completed' : isCurrent ? 'Active Collection' : 'Scheduled'}
          </span>
        </div>
      `;
      stopsTimeline.appendChild(item);
    });
  }

  // ==========================================================================
  // 12. Authentication (Sign In & Sign Up)
  // ==========================================================================
  userAuthBtn.addEventListener('click', () => {
    authModal.classList.remove('hidden');
  });

  closeAuthModalBtn.addEventListener('click', () => {
    authModal.classList.add('hidden');
  });

  tabSignInBtn.addEventListener('click', () => {
    tabSignInBtn.classList.add('active');
    tabSignUpBtn.classList.remove('active');
    signInForm.classList.remove('hidden');
    signUpForm.classList.add('hidden');
  });

  tabSignUpBtn.addEventListener('click', () => {
    tabSignUpBtn.classList.add('active');
    tabSignInBtn.classList.remove('active');
    signUpForm.classList.remove('hidden');
    signInForm.classList.add('hidden');
  });

  signInForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const contact = document.getElementById('loginContact').value.trim();
    state.user.name = contact.includes('@') ? contact.split('@')[0] : 'Rajesh Sharma';
    state.user.isLoggedIn = true;
    updateUserProfileDisplay();
    authModal.classList.add('hidden');
    showToast('Welcome Back', `Logged in as ${state.user.name}`, 'info', '👤');
  });

  signUpForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('registerName').value.trim();
    const phone = document.getElementById('registerPhone').value.trim();
    const ward = document.getElementById('registerWard').value;

    state.user.name = name;
    state.user.phone = phone;
    state.user.ward = ward;
    state.user.isLoggedIn = true;
    state.user.walletPoints += 50;

    updateUserProfileDisplay();
    updateWalletUI();
    authModal.classList.add('hidden');

    showToast(
      'Citizen Account Registered!',
      `+50 Welcome Green Points credited to your wallet. Welcome to SwachhTrack!`,
      'success',
      '🎉'
    );
  });

  quickDemoLoginBtn.addEventListener('click', () => {
    state.user = {
      name: 'Rajesh Sharma',
      phone: '+91 98765 43210',
      ward: 'Ward 14 - Green Enclave',
      walletPoints: 450,
      totalWasteKg: 32.5,
      co2SavedKg: 19.2,
      vouchersClaimed: 3,
      isLoggedIn: true
    };
    updateUserProfileDisplay();
    updateWalletUI();
    authModal.classList.add('hidden');
    showToast('Demo Citizen Active', 'Signed in as Rajesh Sharma (Ward 14)', 'info', '✅');
  });

  function updateUserProfileDisplay() {
    headerUserName.textContent = state.user.name.split(' ')[0];
    localStorage.setItem('swachh_user', JSON.stringify(state.user));
  }

  // ==========================================================================
  // 13. Initialization
  // ==========================================================================
  updateUserProfileDisplay();
  updateWalletUI();
  renderRewardsGrid();
  updateHistoryUI();
  renderScheduleTimeline();
  drawGpsMap();

  setTimeout(() => {
    showToast(
      'SwachhTrack Live GPS Ready',
      'Truck #DL-04 is collecting in Ward 14. Real-time telemetry and silent notifications active.',
      'info',
      '🚛'
    );
  }, 1000);
});

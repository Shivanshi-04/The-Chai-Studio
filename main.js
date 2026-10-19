/**
 * THE CHAI STUDIO — CHAI ON CLICKS
 * Compact 3D Scroll Architecture with GSAP ScrollTrigger & Progressive Frame Streaming
 */

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Configuration
const TOTAL_FRAMES = 300;
const FRAME_PATH_PREFIX = '/frames/ezgif-frame-';
const FRAME_EXTENSION = '.jpg';

// DOM Elements
const canvas = document.getElementById('chai-canvas');
const ctx = canvas.getContext('2d');
const heroScroller = document.getElementById('hero-scroller');
const progressBar = document.getElementById('scroll-progress');
const navbar = document.getElementById('navbar');

// Loader Elements
const loaderScreen = document.getElementById('loader');
const loaderBar = document.getElementById('loader-bar');
const loaderPercent = document.getElementById('loader-percent');
const loaderStatus = document.getElementById('loader-status');




// Controls & Scrubber Elements
const frameSlider = document.getElementById('frame-slider');
const frameCounter = document.getElementById('frame-counter');
const btnAutoplay = document.getElementById('btn-autoplay');
const playIcon = document.getElementById('play-icon');
const btnReplayPour = document.getElementById('btn-replay-pour');
const phaseJumpBtns = document.querySelectorAll('.phase-jump-btn');
const navButtons = document.querySelectorAll('.nav-btn');

// Full Menu Drawer Elements
const fullMenuDrawer = document.getElementById('full-menu-drawer');
const btnOpenFullMenu = document.getElementById('btn-open-full-menu');
const btnViewAllBlends = document.getElementById('btn-view-all-blends');
const drawerClose = document.getElementById('drawer-close');

// Order Modal Elements
const orderModal = document.getElementById('order-modal');
const modalClose = document.getElementById('modal-close');
const btnQuickOrder = document.getElementById('btn-quick-order');
const btnStageOrder = document.getElementById('btn-stage-order');
const orderForm = document.getElementById('order-form');
const blendSelect = document.getElementById('blend-select');
const sweetnessSelect = document.getElementById('sweetness-level');
const cupQtyInput = document.getElementById('cup-qty');
const qtyMinus = document.getElementById('qty-minus');
const qtyPlus = document.getElementById('qty-plus');
const summaryUnitPrice = document.getElementById('summary-unit-price');
const summaryTotalPrice = document.getElementById('summary-total-price');
const toast = document.getElementById('toast');
const toastTitle = document.getElementById('toast-title');
const toastMsg = document.getElementById('toast-msg');

// Application State
const framesCache = new Array(TOTAL_FRAMES);
const requestedFrames = new Set();
let lastRenderedFrame = -1;
let isAutoplaying = false;
let autoplayTween = null;
let masterScrollTrigger = null;

// Motion Preference
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Format frame URL (1-indexed zero-padded)
 */
function getFrameUrl(index) {
  const paddedIndex = String(index + 1).padStart(3, '0');
  return `${FRAME_PATH_PREFIX}${paddedIndex}${FRAME_EXTENSION}`;
}

/**
 * PROGRESSIVE FRAME LOADER
 * Prioritizes current window and nearby keyframes instead of brute-force fetching 300 files
 */
function requestFrame(index) {
  if (index < 0 || index >= TOTAL_FRAMES) return;
  if (framesCache[index] || requestedFrames.has(index)) return;

  requestedFrames.add(index);
  const img = new Image();
  img.src = getFrameUrl(index);
  
  if ('decode' in img) {
    img.decode().then(() => {
      framesCache[index] = img;
      // If this is the current target frame waiting for render, draw it
      if (Math.round(virtualState.frame) === index) {
        renderFrame(index);
      }
    }).catch(() => {
      // Fallback on decode failure
      framesCache[index] = img;
    });
  } else {
    img.onload = () => {
      framesCache[index] = img;
      if (Math.round(virtualState.frame) === index) {
        renderFrame(index);
      }
    };
  }
}

/**
 * Prefetch a window of nearby frames around current position
 */
function bufferNearbyFrames(centerIndex) {
  const windowRadius = 12;
  const start = Math.max(0, centerIndex - 4);
  const end = Math.min(TOTAL_FRAMES - 1, centerIndex + windowRadius);
  for (let i = start; i <= end; i++) {
    requestFrame(i);
  }
}

/**
 * Sample coarse keyframes in background (every 12th frame) for instant scrubbing
 */
function prefetchCoarseKeyframes() {
  for (let i = 0; i < TOTAL_FRAMES; i += 12) {
    requestFrame(i);
  }
}

/**
 * Safe fallback retriever: never returns null if at least one frame is loaded
 */
function getSafeFrame(targetIndex) {
  if (framesCache[targetIndex] && framesCache[targetIndex].complete) {
    return framesCache[targetIndex];
  }
  // Look backward
  for (let i = targetIndex - 1; i >= 0; i--) {
    if (framesCache[i] && framesCache[i].complete) return framesCache[i];
  }
  // Look forward
  for (let i = targetIndex + 1; i < TOTAL_FRAMES; i++) {
    if (framesCache[i] && framesCache[i].complete) return framesCache[i];
  }
  return framesCache[0] || null;
}

/**
 * Initial Launch: Load Frame 0 immediately for instant first paint
 */
function loadInitialFrame() {
  return new Promise((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      dismissLoader();
      resolve();
    };

    // Failsafe timeout: ensure loader dismisses within 1.2s under any network condition
    const failsafe = setTimeout(() => {
      console.warn('Initial frame loading timeout fallback.');
      finish();
    }, 1200);

    const firstImg = new Image();
    firstImg.src = getFrameUrl(0);
    
    firstImg.onload = () => {
      clearTimeout(failsafe);
      framesCache[0] = firstImg;
      requestedFrames.add(0);
      renderFrame(0);
      updateLoader(100);
      finish();
      
      // Seed initial buffer ahead
      bufferAheadFrames(0, 30);
    };

    firstImg.onerror = () => {
      clearTimeout(failsafe);
      console.warn('Initial frame failed to load. Retrying...');
      finish();
    };
  });
}

function updateLoader(pct) {
  if (loaderBar) loaderBar.style.width = `${pct}%`;
  if (loaderPercent) loaderPercent.textContent = `${pct}%`;
  if (loaderScreen) loaderScreen.setAttribute('aria-valuenow', pct);
}

function dismissLoader() {
  if (loaderScreen) {
    loaderScreen.classList.add('loaded');
  }
}

/**
 * Responsive Canvas Sizing with DPR Clamping
 */
function resizeCanvas() {
  const isMobile = window.innerWidth < 768;
  const dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.25 : 1.75);
  canvas.width = Math.round(window.innerWidth * dpr);
  canvas.height = Math.round(window.innerHeight * dpr);
  renderFrame(lastRenderedFrame >= 0 ? lastRenderedFrame : 0);
}

/**
 * Render Image to Canvas with Cover Scaling
 */
function renderFrame(index) {
  const img = getSafeFrame(index);
  if (!img) return;

  const isMobile = window.innerWidth < 768;
  const dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.25 : 1.75);
  const cw = canvas.width / dpr;
  const ch = canvas.height / dpr;

  const imgWidth = 1920;
  const imgHeight = 1080;
  const imgRatio = imgWidth / imgHeight;
  const canvasRatio = cw / ch;

  let drawW, drawH, drawX, drawY;

  if (canvasRatio > imgRatio) {
    drawW = cw;
    drawH = cw / imgRatio;
    drawX = 0;
    drawY = (ch - drawH) / 2;
  } else {
    drawH = ch;
    drawW = ch * imgRatio;
    drawX = (cw - drawW) / 2;
    drawY = 0;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.scale(dpr, dpr);
  ctx.drawImage(img, drawX, drawY, drawW, drawH);

  // Seamlessly patch the Gemini watermark in source frames (approx x: 1715-1755, y: 878-918 on 1920x1080)
  // by sampling an identical clean wood grain region directly adjacent to it
  const wmSrcX = 1715;
  const wmSrcY = 878;
  const wmSize = 48;
  const cleanSrcX = 1650; // clean adjacent cinnamon/wood table texture
  const cleanSrcY = 878;

  const destX = drawX + (wmSrcX / imgWidth) * drawW;
  const destY = drawY + (wmSrcY / imgHeight) * drawH;
  const destW = (wmSize / imgWidth) * drawW;
  const destH = (wmSize / imgHeight) * drawH;

  ctx.save();
  ctx.beginPath();
  ctx.arc(destX + destW / 2, destY + destH / 2, Math.max(destW, destH) * 0.7, 0, Math.PI * 2);
  ctx.clip();
  ctx.drawImage(img, cleanSrcX, cleanSrcY, wmSize, wmSize, destX, destY, destW, destH);
  ctx.restore();

  ctx.restore();

  lastRenderedFrame = index;

  // Sync scrubber UI
  if (frameSlider && document.activeElement !== frameSlider) {
    frameSlider.value = index + 1;
  }
  if (frameCounter) {
    frameCounter.textContent = `Frame ${String(index + 1).padStart(3, '0')} / ${TOTAL_FRAMES}`;
  }
}

/**
 * CONTINUOUS 3D AUTOPLAY ANIMATION ENGINE (NO SCROLL REQUIRED)
 * Automatically streams and plays the 300-frame chai pouring sequence at cinematic ~25 FPS
 * Loops seamlessly with predictive frame buffering and automatic viewport visibility sensing
 */
const PLAYBACK_FPS = 25; // 25 fps gives a smooth 12-second continuous loop
const FRAME_INTERVAL_MS = 1000 / PLAYBACK_FPS;

let currentPlaybackFrame = 0;
let lastFrameTimestamp = 0;
let animationReqId = null;
let isHeroInView = true;

function initAutoplayAnimation() {
  if (prefersReducedMotion) {
    renderFrame(150);
    return;
  }

  // Preload first 30 frames immediately for instant playback
  bufferAheadFrames(0, 30);
  startSequentialPreload();

  // Pause render loop when scrolled completely past the hero section to conserve GPU
  if ('IntersectionObserver' in window && heroScroller) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isHeroInView = entry.isIntersecting;
          if (isHeroInView && !animationReqId) {
            lastFrameTimestamp = performance.now();
            animationReqId = requestAnimationFrame(animationLoop);
          }
        });
      },
      { threshold: 0.05 }
    );
    observer.observe(heroScroller);
  }

  // Start continuous loop
  lastFrameTimestamp = performance.now();
  animationReqId = requestAnimationFrame(animationLoop);
}

function animationLoop(timestamp) {
  if (!isHeroInView) {
    animationReqId = null;
    return;
  }

  const elapsed = timestamp - lastFrameTimestamp;

  if (elapsed >= FRAME_INTERVAL_MS) {
    const framesToStep = Math.floor(elapsed / FRAME_INTERVAL_MS);
    lastFrameTimestamp = timestamp - (elapsed % FRAME_INTERVAL_MS);

    currentPlaybackFrame = (currentPlaybackFrame + framesToStep) % TOTAL_FRAMES;
    const targetIndex = Math.floor(currentPlaybackFrame);

    // Keep buffering 25 frames ahead of the current playback position
    bufferAheadFrames(targetIndex, 25);

    // Render current frame
    renderFrame(targetIndex);
  }

  animationReqId = requestAnimationFrame(animationLoop);
}

/**
 * Buffer ahead from current playhead
 */
function bufferAheadFrames(currentIndex, count = 25) {
  for (let i = 1; i <= count; i++) {
    const nextIdx = (currentIndex + i) % TOTAL_FRAMES;
    requestFrame(nextIdx);
  }
}

/**
 * Background Sequential Preloader to quietly cache all 300 frames in memory
 */
let sequentialPreloadIndex = 1;
function startSequentialPreload() {
  function loadBatch() {
    if (sequentialPreloadIndex >= TOTAL_FRAMES) return;
    const batchSize = 6;
    const end = Math.min(TOTAL_FRAMES, sequentialPreloadIndex + batchSize);
    for (let i = sequentialPreloadIndex; i < end; i++) {
      requestFrame(i);
    }
    sequentialPreloadIndex = end;
    if (sequentialPreloadIndex < TOTAL_FRAMES) {
      setTimeout(loadBatch, 80);
    }
  }
  setTimeout(loadBatch, 250);
}

/**
 * Reveal Cafe Details & Destination Overlays
 */
let cafeDetailsTimeout = null;
let destinationCardTimeout = null;

function scheduleDestinationCard(delay = 600) {
  if (destinationCardTimeout) clearTimeout(destinationCardTimeout);
  destinationCardTimeout = setTimeout(() => {
    const destCard = document.getElementById('hero-destination-card');
    if (destCard) {
      destCard.classList.add('visible');
    }
  }, delay);
}

function scheduleCafeDetails(delay = 400) {
  if (cafeDetailsTimeout) clearTimeout(cafeDetailsTimeout);
  cafeDetailsTimeout = setTimeout(() => {
    const detailsCard = document.getElementById('hero-cafe-details');
    if (detailsCard) {
      detailsCard.classList.add('visible');
    }
  }, delay);
}

// Hero Explore Menu button smooth scroll to kitchen menu
const heroExploreBtn = document.getElementById('hero-explore-btn');
if (heroExploreBtn) {
  heroExploreBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const menuSection = document.getElementById('signature-menu');
    if (menuSection) {
      menuSection.scrollIntoView({ behavior: 'smooth' });
    }
  });
}

/**
 * Smooth Navigation Anchor Links
 */
navButtons.forEach((btn) => {
  btn.addEventListener('click', (e) => {
    const href = btn.getAttribute('href');
    if (href && href.startsWith('#')) {
      e.preventDefault();
      const targetEl = document.querySelector(href);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth' });
      }
    }
  });
});

/**
 * FULL MENU DRAWER INTERACTIONS
 */
function openFullMenuDrawer() {
  window.location.href = '/menu.html';
}

function closeFullMenuDrawer() {
  if (fullMenuDrawer) {
    fullMenuDrawer.classList.remove('open');
    fullMenuDrawer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
}

if (btnOpenFullMenu) btnOpenFullMenu.addEventListener('click', openFullMenuDrawer);
if (btnViewAllBlends) btnViewAllBlends.addEventListener('click', openFullMenuDrawer);
if (drawerClose) drawerClose.addEventListener('click', closeFullMenuDrawer);
if (fullMenuDrawer) {
  fullMenuDrawer.addEventListener('click', (e) => {
    if (e.target === fullMenuDrawer) closeFullMenuDrawer();
  });
}

/**
 * ORDER MODAL & CUSTOMIZATION
 */
function openOrderModal(blendName, price) {
  if (blendName && blendSelect) {
    let found = false;
    for (let i = 0; i < blendSelect.options.length; i++) {
      const opt = blendSelect.options[i];
      if (opt.value.toLowerCase() === blendName.toLowerCase() || opt.text.toLowerCase().includes(blendName.toLowerCase())) {
        blendSelect.selectedIndex = i;
        found = true;
        break;
      }
    }
    if (!found && blendSelect.options.length > 0) {
      blendSelect.selectedIndex = 0;
    }
  }
  updateModalPricing();
  if (orderModal) {
    orderModal.classList.add('open');
    orderModal.setAttribute('aria-hidden', 'false');
  }
  document.body.style.overflow = 'hidden';
}

function closeOrderModal() {
  if (orderModal) {
    orderModal.classList.remove('open');
    orderModal.setAttribute('aria-hidden', 'true');
  }
  document.body.style.overflow = '';
}

function updateModalPricing() {
  if (!blendSelect || !blendSelect.options || blendSelect.selectedIndex < 0) return;
  const selectedOpt = blendSelect.options[blendSelect.selectedIndex];
  const unitPrice = parseInt(selectedOpt?.dataset?.price || '40', 10);
  const qty = parseInt(cupQtyInput?.value || '1', 10) || 1;
  const sweetness = sweetnessSelect ? sweetnessSelect.value : '';
  const extra = sweetness.includes('Jaggery') ? 10 : 0;
  const total = (unitPrice + extra) * qty;

  if (summaryUnitPrice) summaryUnitPrice.textContent = `₹${unitPrice + extra}`;
  if (summaryTotalPrice) summaryTotalPrice.textContent = `₹${total}`;
}

if (btnQuickOrder) btnQuickOrder.addEventListener('click', () => openOrderModal());
if (btnStageOrder) btnStageOrder.addEventListener('click', () => openOrderModal());
if (modalClose) modalClose.addEventListener('click', closeOrderModal);
if (orderModal) {
  orderModal.addEventListener('click', (e) => {
    if (e.target === orderModal) closeOrderModal();
  });
}

if (qtyMinus) {
  qtyMinus.addEventListener('click', () => {
    const cur = parseInt(cupQtyInput?.value || '1', 10);
    if (cur > 1 && cupQtyInput) {
      cupQtyInput.value = cur - 1;
      updateModalPricing();
    }
  });
}

if (qtyPlus) {
  qtyPlus.addEventListener('click', () => {
    const cur = parseInt(cupQtyInput?.value || '1', 10);
    if (cur < 20 && cupQtyInput) {
      cupQtyInput.value = cur + 1;
      updateModalPricing();
    }
  });
}

if (blendSelect) blendSelect.addEventListener('change', updateModalPricing);
if (sweetnessSelect) sweetnessSelect.addEventListener('change', updateModalPricing);

// Item Order Buttons (from compact tray and full menu drawer)
document.addEventListener('click', (e) => {
  const target = e.target.closest('.btn-item-order, .btn-order-item');
  if (target) {
    const item = target.dataset.item;
    const price = target.dataset.price;
    closeFullMenuDrawer();
    openOrderModal(item, price);
  }
});

// Order Submission (Client-Side Mock)
if (orderForm) {
  orderForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const custNameEl = document.getElementById('cust-name');
    const name = custNameEl ? custNameEl.value : 'Guest';
    const blend = blendSelect ? blendSelect.value : 'Shahi Masala Karak';
    const qty = cupQtyInput ? cupQtyInput.value : '1';

    closeOrderModal();

    if (toast && toastTitle && toastMsg) {
      toastTitle.textContent = `Order Placed with The Samovar!`;
      toastMsg.textContent = `Thank you, ${name}! ${qty}x ${blend} is brewing fresh on charcoal.`;
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 4000);
    }

    orderForm.reset();
    if (cupQtyInput) cupQtyInput.value = 1;
    updateModalPricing();
  });
}

// Stitched Content Navigation and Interactive Handlers
document.addEventListener('click', (e) => {
  const pathEl = e.target.closest('[data-path]');
  if (pathEl) {
    const path = pathEl.getAttribute('data-path');
    if (path === 'menu') {
      e.preventDefault();
      window.location.href = '/menu.html';
      return;
    }
    if (path === 'order-now') {
      e.preventDefault();
      openOrderModal();
      return;
    }
    if (path === 'home') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (path === 'our-story') {
      e.preventDefault();
      const el = document.getElementById('our-story');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    if (path === 'gallery' || path === 'about') {
      e.preventDefault();
      const el = document.getElementById('about') || document.getElementById('studio-gallery');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    if (path === 'contact') {
      e.preventDefault();
      const el = document.getElementById('visit-contact');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    if (path === 'privacy' || path === 'terms') {
      e.preventDefault();
      toastTitle.textContent = path === 'privacy' ? 'Privacy Policy' : 'Terms of Service';
      toastMsg.textContent = 'All guest information and brewing recipes are protected under Studio Heritage Standards.';
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 4000);
      return;
    }
  }

  // Also enable clicking on the menu category cards to explore the full dedicated menu page
  const menuCard = e.target.closest('#signature-menu .group');
  if (menuCard && !e.target.closest('a, button')) {
    window.location.href = '/menu.html';
  }
});

// PHYSICAL MENU CARD LIGHTBOX MODAL HANDLERS
const menuCardModal = document.getElementById('menu-card-modal');
const menuCardClose = document.getElementById('menu-card-close');

function openMenuCardModal() {
  if (!menuCardModal) return;
  menuCardModal.classList.add('open');
  menuCardModal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeMenuCardModal() {
  if (!menuCardModal) return;
  menuCardModal.classList.remove('open');
  menuCardModal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

if (menuCardClose) {
  menuCardClose.addEventListener('click', closeMenuCardModal);
}
if (menuCardModal) {
  menuCardModal.addEventListener('click', (e) => {
    if (e.target === menuCardModal) closeMenuCardModal();
  });
}

// Category Tabs Filtering and Menu Card View Listeners
document.addEventListener('click', (e) => {
  if (e.target.closest('.btn-open-menu-card')) {
    e.preventDefault();
    openMenuCardModal();
    return;
  }

  const tabBtn = e.target.closest('.menu-tab-btn');
  if (tabBtn) {
    const filter = tabBtn.dataset.filter;
    document.querySelectorAll('.menu-tab-btn').forEach(b => b.classList.remove('active'));
    tabBtn.classList.add('active');

    const items = document.querySelectorAll('.full-menu-item');
    items.forEach(item => {
      if (filter === 'all' || item.dataset.category === filter) {
        item.style.display = '';
      } else {
        item.style.display = 'none';
      }
    });
  }
});

// Escape key to close all modals
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeOrderModal();
    closeFullMenuDrawer();
    closeMenuCardModal();
  }
});

/**
 * Resize and Scroll Listeners
 */
let resizeTimeout;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    resizeCanvas();
  }, 100);
}, { passive: true });

window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;
  const heroH = window.innerHeight;



  // Gentle fade of hero cafe details if user scrolls down to next section
  const cafeDetails = document.getElementById('hero-cafe-details');
  if (cafeDetails && scrollY < heroH && cafeDetails.classList.contains('visible')) {
    const ratio = Math.min(scrollY / (heroH * 0.45), 1);
    cafeDetails.style.opacity = String(1 - ratio);
    cafeDetails.style.transform = `translateY(calc(-50% - ${ratio * 25}px))`;
  }

  // Gentle fade of hero destination card if user scrolls down to next section
  const destCard = document.getElementById('hero-destination-card');
  if (destCard && scrollY < heroH && destCard.classList.contains('visible')) {
    const ratio = Math.min(scrollY / (heroH * 0.45), 1);
    destCard.style.opacity = String(1 - ratio);
    destCard.style.transform = `translateY(${ratio * 25}px)`;
  }

  // Top progress bar based on overall page scroll
  const scrollTotal = document.documentElement.scrollHeight - window.innerHeight;
  const pageProgress = scrollTotal > 0 ? scrollY / scrollTotal : 0;
  if (progressBar) {
    progressBar.style.transform = `scaleX(${pageProgress})`;
  }

  if (navbar) {
    if (scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }
}, { passive: true });

// Lifecycle Boot
async function bootApp() {
  try {
    resizeCanvas();
    await loadInitialFrame();
    initAutoplayAnimation();
    // Smoothly reveal cafe mood quote on the left side
    scheduleCafeDetails(400);
    // Smoothly reveal Your Destination card in bottom right
    scheduleDestinationCard(600);
  } catch (err) {
    console.error('Boot error:', err);
    dismissLoader();
  }
}

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', bootApp);
} else {
  bootApp();
}

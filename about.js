/**
 * The Chai Studio — About Page Interactive Logic
 * Features:
 * 1. Interactive Cafe Hotspots Walkthrough
 * 2. Web Audio API Ambient Studio Soundscape (Rain, Samovar, Sigri, Cafe Hum)
 * 3. Table / Reading Nook Reservation Controller
 * 4. Unified Quick Order Modal & Stepper
 * 5. Scroll Progress & Sticky Header
 */

document.addEventListener('DOMContentLoaded', () => {
  initScrollProgress();
  initStickyHeader();
  initHotspots();
  initSoundscape();
  initReservationForm();
  initQuickOrderModal();
});

/* ==========================================================================
   1. SCROLL PROGRESS & HEADER BLUR
   ========================================================================== */
function initScrollProgress() {
  const progressBar = document.getElementById('scroll-progress');
  if (!progressBar) return;

  const updateProgress = () => {
    const scrollPx = document.documentElement.scrollTop || document.body.scrollTop;
    const winHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrollPercent = winHeight > 0 ? (scrollPx / winHeight) * 100 : 0;
    progressBar.style.transform = `scaleX(${scrollPercent / 100})`;
  };

  window.addEventListener('scroll', updateProgress, { passive: true });
}

function initStickyHeader() {
  const header = document.getElementById('navbar');
  if (!header) return;

  window.addEventListener(
    'scroll',
    () => {
      if (window.scrollY > 40) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    },
    { passive: true }
  );
}

/* ==========================================================================
   2. INTERACTIVE CAFE CORNERS WALKTHROUGH
   ========================================================================== */
const SPOT_DATA = {
  samovar: {
    tag: 'Heart of the Studio',
    title: 'The Copper Samovar & Kadak Hearth',
    desc: 'Our custom beaten-copper samovar gently simmers water infused with crushed ginger and green cardamom all day. When your order is placed, full-cream mountain milk and Assam orthodox tea leaves are united in a hand-held pan for a vigorous, aromatic boil.',
    icon: 'skillet',
    cta: 'Try Our Samovar Brew'
  },
  bookshelf: {
    tag: 'Ruskin’s Reading Corner',
    title: 'Curated 250+ Book Library',
    desc: 'Dedicated to the literary soul of Dehradun, our bookshelves feature Ruskin Bond classics, Himalayan folklore, contemporary poetry, and art monographs. Feel free to borrow, read over chai, or exchange a book of your own.',
    icon: 'menu_book',
    cta: 'Reserve Reading Nook'
  },
  kulhads: {
    tag: 'Terracotta Soul',
    title: 'The Unglazed Kulhad Stack',
    desc: 'Kiln-fired by 14 local potter households from Garhwal red river clay. Porous, natural, and free of synthetic ceramic glaze, each kulhad imparts that unmistakable wet-earth aroma ("Mitti Ki Khushboo") before returning to the soil.',
    icon: 'potted_plant',
    cta: 'Learn Our Clay Craft'
  },
  tables: {
    tag: 'Community Living Room',
    title: 'Reclaimed Teakwood Guild Tables',
    desc: 'Constructed from reclaimed colonial timber, our wide shared tables encourage spontaneous poetry readings, chess matches, sketchbook doodles, and hours of uninterrupted conversation without rushing.',
    icon: 'diversity_3',
    cta: 'Book a Table for Friends'
  }
};

function initHotspots() {
  const pins = document.querySelectorAll('.hotspot-pin');
  const tagEl = document.getElementById('spot-tag');
  const titleEl = document.getElementById('spot-title');
  const descEl = document.getElementById('spot-desc');
  const iconEl = document.getElementById('spot-icon');
  const ctaBtn = document.getElementById('btn-tour-order');

  pins.forEach(pin => {
    pin.addEventListener('click', () => {
      pins.forEach(p => p.classList.remove('active'));
      pin.classList.add('active');

      const spotKey = pin.dataset.spot;
      const data = SPOT_DATA[spotKey];
      if (!data) return;

      if (tagEl) tagEl.textContent = data.tag;
      if (titleEl) titleEl.textContent = data.title;
      if (descEl) descEl.textContent = data.desc;
      if (iconEl) iconEl.innerHTML = `<span class="material-symbols-outlined text-[26px]">${data.icon}</span>`;
      if (ctaBtn) {
        ctaBtn.querySelector('span').textContent = data.cta;
        ctaBtn.onclick = () => {
          if (spotKey === 'bookshelf' || spotKey === 'tables') {
            document.getElementById('reservation-form')?.scrollIntoView({ behavior: 'smooth' });
          } else {
            openOrderModal();
          }
        };
      }
    });
  });

  if (ctaBtn) {
    ctaBtn.onclick = () => openOrderModal();
  }
}

/* ==========================================================================
   3. WEB AUDIO API SYNTHESIZED STUDIO SOUNDSCAPE
   ========================================================================== */
class StudioSoundscape {
  constructor() {
    this.ctx = null;
    this.nodes = {};
    this.isPlaying = false;
    this.activeTracks = new Set();
  }

  ensureContext() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Generate pink/white noise buffer
  createNoiseBuffer(seconds = 3) {
    const sampleRate = this.ctx.sampleRate;
    const bufferSize = sampleRate * seconds;
    const buffer = this.ctx.createBuffer(1, bufferSize, sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }
    return buffer;
  }

  startTrack(track) {
    this.ensureContext();
    if (this.nodes[track]) return;

    const noiseBuffer = this.createNoiseBuffer(4);
    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const filter = this.ctx.createBiquadFilter();
    const gainNode = this.ctx.createGain();

    if (track === 'rain') {
      // Soft mountain rainfall on tin roof
      filter.type = 'lowpass';
      filter.frequency.value = 1100;
      gainNode.gain.setValueAtTime(0.01, this.ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.25, this.ctx.currentTime + 1.2);

      noiseSource.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(this.ctx.destination);
    } else if (track === 'kettle') {
      // Simmering kettle / bubbling decoction
      filter.type = 'bandpass';
      filter.frequency.value = 650;
      filter.Q.value = 2.5;

      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.value = 3.5;
      lfoGain.gain.value = 180;
      lfo.connect(filter.frequency);
      lfo.start();

      gainNode.gain.setValueAtTime(0.01, this.ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.18, this.ctx.currentTime + 1.2);

      noiseSource.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(this.ctx.destination);
      noiseSource._lfo = lfo;
    } else if (track === 'sigri') {
      // Crackling warm charcoal embers
      filter.type = 'bandpass';
      filter.frequency.value = 2200;
      filter.Q.value = 1.2;

      gainNode.gain.setValueAtTime(0.01, this.ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.15, this.ctx.currentTime + 1.2);

      noiseSource.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(this.ctx.destination);
    } else if (track === 'hum') {
      // Warm acoustic room drone
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = 116; // Warm sub A#2

      const oscFilter = this.ctx.createBiquadFilter();
      oscFilter.type = 'lowpass';
      oscFilter.frequency.value = 220;

      gainNode.gain.setValueAtTime(0.01, this.ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.12, this.ctx.currentTime + 1.5);

      osc.connect(oscFilter);
      oscFilter.connect(gainNode);
      gainNode.connect(this.ctx.destination);
      osc.start();

      this.nodes[track] = { source: osc, gain: gainNode };
      this.activeTracks.add(track);
      return;
    }

    noiseSource.start();
    this.nodes[track] = { source: noiseSource, gain: gainNode };
    this.activeTracks.add(track);
  }

  stopTrack(track) {
    if (!this.nodes[track]) return;
    const { source, gain } = this.nodes[track];

    if (gain && this.ctx) {
      gain.gain.setValueAtTime(gain.gain.value, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.6);
      setTimeout(() => {
        try {
          if (source._lfo) source._lfo.stop();
          source.stop();
          source.disconnect();
        } catch (_) {}
      }, 700);
    }
    delete this.nodes[track];
    this.activeTracks.delete(track);
  }

  toggleTrack(track) {
    if (this.activeTracks.has(track)) {
      this.stopTrack(track);
      return false;
    } else {
      this.startTrack(track);
      return true;
    }
  }

  stopAll() {
    const tracks = Array.from(this.activeTracks);
    tracks.forEach(t => this.stopTrack(t));
    this.activeTracks.clear();
  }
}

function initSoundscape() {
  const soundscape = new StudioSoundscape();
  const soundBtns = document.querySelectorAll('.sound-toggle-btn');
  const masterBtn = document.getElementById('master-sound-toggle');
  const masterText = document.getElementById('master-sound-text');

  soundBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const soundType = btn.dataset.sound;
      const isNowPlaying = soundscape.toggleTrack(soundType);

      if (isNowPlaying) {
        btn.classList.add('playing');
      } else {
        btn.classList.remove('playing');
      }

      updateMasterState();
    });
  });

  if (masterBtn) {
    masterBtn.addEventListener('click', () => {
      if (soundscape.activeTracks.size > 0) {
        // Stop all
        soundscape.stopAll();
        soundBtns.forEach(b => b.classList.remove('playing'));
        updateMasterState();
      } else {
        // Start atmospheric preset: Rain + Samovar + Sigri
        ['rain', 'kettle', 'sigri'].forEach(type => {
          soundscape.startTrack(type);
          const btn = document.querySelector(`.sound-toggle-btn[data-sound="${type}"]`);
          if (btn) btn.classList.add('playing');
        });
        updateMasterState();
      }
    });
  }

  function updateMasterState() {
    if (!masterBtn || !masterText) return;
    if (soundscape.activeTracks.size > 0) {
      masterText.textContent = `Pause Ambiance (${soundscape.activeTracks.size} Active)`;
      masterBtn.classList.add('bg-secondary-container');
    } else {
      masterText.textContent = 'Play Studio Ambiance';
      masterBtn.classList.remove('bg-secondary-container');
    }
  }
}

/* ==========================================================================
   4. TABLE & READING NOOK RESERVATION
   ========================================================================= */
function initReservationForm() {
  const form = document.getElementById('reservation-form');
  const dateInput = document.getElementById('res-date');
  if (!form) return;

  // Set min date to today
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
    dateInput.value = today;
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('res-name')?.value || 'Guest';
    const date = document.getElementById('res-date')?.value || 'Today';
    const time = document.getElementById('res-time')?.value || 'Evening';
    const nook = document.getElementById('res-nook')?.value || 'Reading Nook';
    const guests = document.getElementById('res-guests')?.value || '1-2 Guests';

    showToast(
      `Table Reserved for ${name}!`,
      `We’ve saved your ${nook} (${guests}) on ${date} at ${time}. Your kulhad will be hot and ready.`
    );

    form.reset();
    if (dateInput) {
      dateInput.value = new Date().toISOString().split('T')[0];
    }
  });
}

/* ==========================================================================
   5. QUICK ORDER KULHAD MODAL
   ========================================================================== */
function initQuickOrderModal() {
  const modal = document.getElementById('order-modal');
  const openBtn = document.getElementById('btn-quick-order');
  const closeBtn = document.getElementById('modal-close');
  const form = document.getElementById('order-form');
  const blendSelect = document.getElementById('blend-select');
  const qtyInput = document.getElementById('cup-qty');
  const qtyMinus = document.getElementById('qty-minus');
  const qtyPlus = document.getElementById('qty-plus');
  const unitPriceEl = document.getElementById('summary-unit-price');
  const totalPriceEl = document.getElementById('summary-total-price');

  if (!modal) return;

  const updateModalPrices = () => {
    if (!blendSelect || !qtyInput || !unitPriceEl || !totalPriceEl) return;
    const selectedOpt = blendSelect.options[blendSelect.selectedIndex];
    const unitPrice = parseInt(selectedOpt.getAttribute('data-price') || '40', 10);
    const qty = parseInt(qtyInput.value || '1', 10);
    unitPriceEl.textContent = `₹${unitPrice}`;
    totalPriceEl.textContent = `₹${unitPrice * qty}`;
  };

  if (blendSelect) blendSelect.addEventListener('change', updateModalPrices);

  if (qtyMinus && qtyInput) {
    qtyMinus.addEventListener('click', () => {
      let q = parseInt(qtyInput.value, 10);
      if (q > 1) {
        qtyInput.value = q - 1;
        updateModalPrices();
      }
    });
  }

  if (qtyPlus && qtyInput) {
    qtyPlus.addEventListener('click', () => {
      let q = parseInt(qtyInput.value, 10);
      if (q < 20) {
        qtyInput.value = q + 1;
        updateModalPrices();
      }
    });
  }

  if (openBtn) openBtn.addEventListener('click', openOrderModal);
  if (closeBtn) closeBtn.addEventListener('click', closeOrderModal);

  modal.addEventListener('click', e => {
    if (e.target === modal) closeOrderModal();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal.classList.contains('open')) {
      closeOrderModal();
    }
  });

  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const blend = blendSelect?.value || 'Masala Chai';
      const qty = qtyInput?.value || '1';
      const name = document.getElementById('cust-name')?.value || 'Guest';

      closeOrderModal();
      showToast(
        'Steaming Order Received!',
        `Brewing ${qty} cup(s) of ${blend} for ${name}. Your hot kulhad is simmering.`
      );
      form.reset();
      if (qtyInput) qtyInput.value = '1';
      updateModalPrices();
    });
  }

  updateModalPrices();
}

function openOrderModal() {
  const modal = document.getElementById('order-modal');
  if (modal) {
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
  }
}

function closeOrderModal() {
  const modal = document.getElementById('order-modal');
  if (modal) {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
  }
}

/* ==========================================================================
   6. TOAST NOTIFICATION UTILITY
   ========================================================================== */
function showToast(title, message) {
  const toast = document.getElementById('toast');
  const titleEl = document.getElementById('toast-title');
  const msgEl = document.getElementById('toast-msg');

  if (!toast) return;
  if (titleEl) titleEl.textContent = title;
  if (msgEl) msgEl.textContent = message;

  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.classList.remove('show');
  }, 4500);
}

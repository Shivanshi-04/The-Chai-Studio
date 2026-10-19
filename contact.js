/**
 * The Chai Studio — Contact Page Interactive Logic
 * Features:
 * 1. Live Studio Hearth Status & Real-time Dehradun Clock
 * 2. Multi-Purpose Interactive Portal (Table Reservations, Events/Catering, Inquiries)
 * 3. Smart Seating Experience & Time Slot Selectors
 * 4. Guest Count Interactive Stepper
 * 5. One-Click Copy Actions (Address, Coordinates, Hotline)
 * 6. Direct WhatsApp Booking Integration
 * 7. Unified Quick Order Kulhad Modal & Stepper
 * 8. Scroll Progress & Sticky Luxury Header
 */

document.addEventListener('DOMContentLoaded', () => {
  initScrollProgress();
  initStickyHeader();
  initLiveStatusClock();
  initContactTabs();
  initReservationInteractions();
  initReservationForm();
  initEventsForm();
  initInquiryForm();
  initCopyHelpers();
  initQuickOrderModal();
});

/* ==========================================================================
   1. SCROLL PROGRESS & HEADER SCROLL
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
   2. LIVE CAFE STATUS & DEHRADUN TIME CLOCK
   ========================================================================== */
function initLiveStatusClock() {
  const timeEl = document.getElementById('live-clock');
  const statusEl = document.getElementById('live-status-badge');
  const statusText = document.getElementById('live-status-text');

  const updateClockAndStatus = () => {
    const now = new Date();
    // Options for Indian Standard Time (IST)
    const timeOptions = {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    };
    
    if (timeEl) {
      timeEl.textContent = new Intl.DateTimeFormat('en-IN', timeOptions).format(now);
    }

    // Determine cafe status
    // Opening hours: Mon-Fri: 07:00 - 23:00, Sat-Sun: 08:00 - 00:00
    const day = now.getDay(); // 0 is Sunday, 6 is Saturday
    const isWeekend = (day === 0 || day === 6);
    const hour = now.getHours();

    let isOpen = false;
    if (isWeekend) {
      isOpen = (hour >= 8 || hour === 0);
    } else {
      isOpen = (hour >= 7 && hour < 23);
    }

    if (statusEl && statusText) {
      if (isOpen) {
        statusEl.className = 'live-status-pill';
        statusText.textContent = 'Hearth is Steaming • Open Now';
      } else {
        statusEl.className = 'live-status-pill border-amber-500/40 bg-amber-500/10 text-amber-300';
        statusText.textContent = 'Resting • Doors Reopen at 7:00 AM';
      }
    }
  };

  updateClockAndStatus();
  setInterval(updateClockAndStatus, 1000);
}

/* ==========================================================================
   3. CONTACT PORTAL TABS
   ========================================================================== */
function initContactTabs() {
  const tabBtns = document.querySelectorAll('.contact-tab-btn');
  const tabPanes = document.querySelectorAll('.contact-tab-pane');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');

      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      tabPanes.forEach(pane => {
        if (pane.id === targetTab) {
          pane.classList.remove('hidden');
        } else {
          pane.classList.add('hidden');
        }
      });
    });
  });
}

/* ==========================================================================
   4. RESERVATION FORM SELECTIONS & STEPPERS
   ========================================================================== */
function initReservationInteractions() {
  // Experience Radio Cards
  const expCards = document.querySelectorAll('.experience-card-radio');
  const expInput = document.getElementById('selected-experience');
  
  expCards.forEach(card => {
    card.addEventListener('click', () => {
      expCards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      if (expInput) {
        expInput.value = card.getAttribute('data-experience') || '';
      }
    });
  });

  // Time Slot Pill Buttons
  const slotBtns = document.querySelectorAll('.slot-pill-btn');
  const slotInput = document.getElementById('selected-slot');

  slotBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      slotBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      if (slotInput) {
        slotInput.value = btn.getAttribute('data-slot') || '';
      }
    });
  });

  // Chai Pairing Tags (Multi-select)
  const pairingBtns = document.querySelectorAll('.pairing-tag-btn');
  pairingBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      btn.classList.toggle('active');
    });
  });

  // Guest Stepper
  const guestCountEl = document.getElementById('guest-count');
  const btnDec = document.getElementById('guest-decrease');
  const btnInc = document.getElementById('guest-increase');

  if (guestCountEl && btnDec && btnInc) {
    btnDec.addEventListener('click', () => {
      let count = parseInt(guestCountEl.textContent, 10) || 2;
      if (count > 1) {
        count--;
        guestCountEl.textContent = count;
      }
    });

    btnInc.addEventListener('click', () => {
      let count = parseInt(guestCountEl.textContent, 10) || 2;
      if (count < 25) {
        count++;
        guestCountEl.textContent = count;
      }
    });
  }

  // Set min date to today
  const dateInput = document.getElementById('res-date');
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
    dateInput.value = today;
  }
}

/* ==========================================================================
   5. RESERVATION FORM SUBMISSION
   ========================================================================== */
function initReservationForm() {
  const form = document.getElementById('form-table-reservation');
  const formContainer = document.getElementById('reservation-form-container');
  const successCard = document.getElementById('reservation-success-card');
  const submitBtn = document.getElementById('btn-submit-res');

  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('res-name')?.value.trim() || 'Valued Guest';
    const phone = document.getElementById('res-phone')?.value.trim() || '';
    const date = document.getElementById('res-date')?.value || 'Today';
    const experience = document.getElementById('selected-experience')?.value || 'Window Nook';
    const slot = document.getElementById('selected-slot')?.value || 'Golden Hour (05:00 - 08:00 PM)';
    const guests = document.getElementById('guest-count')?.textContent || '2';
    
    // Collect active pairings
    const activePairings = Array.from(document.querySelectorAll('.pairing-tag-btn.active'))
      .map(b => b.textContent.trim())
      .join(', ') || 'Fresh Kulhad Chai on arrival';

    // Show loading on button
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <span class="inline-block animate-spin mr-2">◌</span>
        <span>Securing Table by the Hearth...</span>
      `;
    }

    setTimeout(() => {
      const resId = `TCS-${Math.floor(1000 + Math.random() * 9000)}`;

      // Update success card details
      document.getElementById('succ-res-id').textContent = resId;
      document.getElementById('succ-guest-name').textContent = name;
      document.getElementById('succ-exp-title').textContent = experience;
      document.getElementById('succ-datetime').textContent = `${date} • ${slot}`;
      document.getElementById('succ-guests').textContent = `${guests} Guests`;
      document.getElementById('succ-pairing').textContent = activePairings;

      // WhatsApp direct link generator
      const waBtn = document.getElementById('succ-whatsapp-btn');
      if (waBtn) {
        const msg = encodeURIComponent(
          `Namaste The Chai Studio! 🫖\nI have confirmed a table reservation:\n\n` +
          `• ID: ${resId}\n` +
          `• Name: ${name}\n` +
          `• Space: ${experience}\n` +
          `• Date & Slot: ${date} (${slot})\n` +
          `• Guests: ${guests}\n` +
          `• Chai Pairings: ${activePairings}\n\n` +
          `Looking forward to a warm kulhad session!`
        );
        waBtn.href = `https://wa.me/919876543210?text=${msg}`;
      }

      // Toggle views
      if (formContainer) formContainer.style.display = 'none';
      if (successCard) {
        successCard.classList.remove('hidden');
        successCard.classList.add('show');
      }

      showToast(
        'Table Reserved at The Hearth! 🫖',
        `Reservation ${resId} confirmed for ${name}. We look forward to welcoming you.`
      );

      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Confirm Reservation';
      }
    }, 900);
  });

  // Re-book button handler
  const btnBookAnother = document.getElementById('btn-book-another');
  if (btnBookAnother) {
    btnBookAnother.addEventListener('click', () => {
      if (successCard) {
        successCard.classList.remove('show');
        successCard.classList.add('hidden');
      }
      if (formContainer) {
        formContainer.style.display = 'block';
      }
      form.reset();
    });
  }
}

/* ==========================================================================
   6. PRIVATE EVENTS & CATERING FORM
   ========================================================================== */
function initEventsForm() {
  const form = document.getElementById('form-events-catering');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const eventType = document.getElementById('event-type')?.value || 'Gathering';
    const hostName = document.getElementById('event-host')?.value || 'Host';
    const attendees = document.getElementById('event-attendees')?.value || '15+';
    const date = document.getElementById('event-date')?.value || 'Upcoming';

    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span class="inline-block animate-spin mr-2">◌</span> Planning Menu...`;
    }

    setTimeout(() => {
      showToast(
        'Event Inquiry Received! 🎉',
        `Thank you ${hostName}! Our event coordinator will call you within 2 hours with customized chai packages.`
      );
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<span>Inquire About Event</span>`;
      }
      form.reset();
    }, 800);
  });
}

/* ==========================================================================
   7. GENERAL INQUIRY FORM
   ========================================================================== */
function initInquiryForm() {
  const form = document.getElementById('form-general-inquiry');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('inq-name')?.value || 'Friend';
    const submitBtn = form.querySelector('button[type="submit"]');

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span class="inline-block animate-spin mr-2">◌</span> Sending...`;
    }

    setTimeout(() => {
      showToast(
        'Message Delivered to The Hearth! 💌',
        `Thank you ${name}. Our studio team has received your note and will reply shortly.`
      );
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send Message';
      }
      form.reset();
    }, 700);
  });
}

/* ==========================================================================
   8. COPY TO CLIPBOARD HELPERS
   ========================================================================== */
function initCopyHelpers() {
  // Copy Address
  const btnCopyAddress = document.getElementById('btn-copy-address');
  if (btnCopyAddress) {
    btnCopyAddress.addEventListener('click', () => {
      const address = "LD Tower, Mothorwala Road, near Bangali Kothi Chowk, Banjarawala, Dehradun 248121, Uttarakhand";
      navigator.clipboard.writeText(address).then(() => {
        showToast('Address Copied! 📍', 'Studio address copied to clipboard for easy navigation.');
      }).catch(() => {
        fallbackCopy(address, 'Studio address copied!');
      });
    });
  }

  // Copy GPS Coordinates
  const btnCopyCoords = document.getElementById('btn-copy-coords');
  if (btnCopyCoords) {
    btnCopyCoords.addEventListener('click', () => {
      const coords = "30.2798, 78.0322";
      navigator.clipboard.writeText(coords).then(() => {
        showToast('GPS Coordinates Copied! 🧭', '30.2798° N, 78.0322° E copied to clipboard.');
      }).catch(() => {
        fallbackCopy(coords, 'Coordinates copied!');
      });
    });
  }

  // Copy Phone Number
  const btnCopyPhone = document.getElementById('btn-copy-phone');
  if (btnCopyPhone) {
    btnCopyPhone.addEventListener('click', () => {
      const phone = "+91 11 4982 3310";
      navigator.clipboard.writeText(phone).then(() => {
        showToast('Hotline Copied! 📞', '+91 (0) 11 4982 3310 copied to clipboard.');
      }).catch(() => {
        fallbackCopy(phone, 'Phone number copied!');
      });
    });
  }
}

function fallbackCopy(text, title) {
  const tempInput = document.createElement('input');
  tempInput.value = text;
  document.body.appendChild(tempInput);
  tempInput.select();
  document.execCommand('copy');
  document.body.removeChild(tempInput);
  showToast(title, text);
}

/* ==========================================================================
   9. UNIFIED QUICK KULHAD ORDER MODAL
   ========================================================================== */
function initQuickOrderModal() {
  const modal = document.getElementById('quick-order-modal');
  const openBtns = document.querySelectorAll('#btn-quick-order, .btn-order-trigger');
  const closeBtn = document.getElementById('modal-close-btn');
  const orderForm = document.getElementById('quick-order-form');
  const chaiSelect = document.getElementById('quick-chai-select');
  const qtyInput = document.getElementById('quick-chai-qty');
  const btnMinus = document.getElementById('qty-minus');
  const btnPlus = document.getElementById('qty-plus');
  const unitPriceEl = document.getElementById('summary-unit-price');
  const totalPriceEl = document.getElementById('summary-total-price');

  if (!modal) return;

  const calculateTotal = () => {
    if (!chaiSelect || !qtyInput || !totalPriceEl) return;
    const selectedOption = chaiSelect.options[chaiSelect.selectedIndex];
    const unitPrice = parseInt(selectedOption?.getAttribute('data-price') || '40', 10);
    const qty = parseInt(qtyInput.value || '1', 10);
    const total = unitPrice * qty;

    if (unitPriceEl) unitPriceEl.textContent = `₹${unitPrice}`;
    totalPriceEl.textContent = `₹${total}`;
  };

  openBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      modal.classList.add('active');
      modal.setAttribute('aria-hidden', 'false');
      calculateTotal();
    });
  });

  const closeModal = () => {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
  };

  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });

  if (chaiSelect) chaiSelect.addEventListener('change', calculateTotal);

  if (btnMinus && qtyInput) {
    btnMinus.addEventListener('click', () => {
      let val = parseInt(qtyInput.value, 10) || 1;
      if (val > 1) {
        qtyInput.value = val - 1;
        calculateTotal();
      }
    });
  }

  if (btnPlus && qtyInput) {
    btnPlus.addEventListener('click', () => {
      let val = parseInt(qtyInput.value, 10) || 1;
      if (val < 20) {
        qtyInput.value = val + 1;
        calculateTotal();
      }
    });
  }

  if (orderForm) {
    orderForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const chaiName = chaiSelect?.options[chaiSelect.selectedIndex]?.text.split('(')[0].trim() || 'Kulhad Chai';
      const qty = qtyInput?.value || 1;
      const custName = document.getElementById('cust-name')?.value.trim() || 'Tea Lover';

      closeModal();
      showToast(
        'Brewing Order Confirmed! ✨',
        `${qty}x ${chaiName} queued on the sigri for ${custName}. Fresh aroma on its way!`
      );
      orderForm.reset();
      calculateTotal();
    });
  }
}

/* ==========================================================================
   10. TOAST SYSTEM
   ========================================================================== */
function showToast(title, msg) {
  const toast = document.getElementById('toast');
  const toastTitle = document.getElementById('toast-title');
  const toastMsg = document.getElementById('toast-msg');

  if (!toast) return;

  if (toastTitle) toastTitle.textContent = title;
  if (toastMsg) toastMsg.textContent = msg;

  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 4500);
}

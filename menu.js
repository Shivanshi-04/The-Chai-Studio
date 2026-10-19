/**
 * THE CHAI STUDIO — OFFICIAL MENU PAGE CONTROLLER
 * Instant Category Filtering, Live Search & Order Customization Modal
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const tabButtons = document.querySelectorAll('.menu-tab-btn');
  const categorySections = document.querySelectorAll('.category-showcase-section');
  const menuItems = document.querySelectorAll('.full-menu-item');
  const searchInput = document.getElementById('menu-search-input');
  const searchClearBtn = document.getElementById('search-clear-btn');
  const searchStatusBar = document.getElementById('search-status-bar');
  const searchStatusText = document.getElementById('search-status-text');
  const btnResetFilters = document.getElementById('btn-reset-filters');
  const btnEmptyReset = document.getElementById('btn-empty-reset');
  const emptySearchState = document.getElementById('empty-search-state');
  const sectionsWrapper = document.getElementById('menu-sections-wrapper');
  const progressBar = document.getElementById('scroll-progress');

  // Modal Elements
  const orderModal = document.getElementById('order-modal');
  const modalClose = document.getElementById('modal-close');
  const btnQuickOrder = document.getElementById('btn-quick-order');
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

  let currentCategory = 'all';
  let searchQuery = '';

  // Check URL hash on load for deep linking (e.g. #chai, #coffee, #pizza, #burger)
  const hash = window.location.hash.replace('#', '').toLowerCase();
  if (hash) {
    const matchingBtn = document.querySelector(`.menu-tab-btn[data-filter="${hash}"]`);
    if (matchingBtn) {
      currentCategory = hash;
      tabButtons.forEach(b => b.classList.remove('active'));
      matchingBtn.classList.add('active');
    }
  }

  /**
   * Filter and Search Engine
   */
  function applyFilters(shouldScroll = false) {
    let totalVisibleItems = 0;
    const query = searchQuery.trim().toLowerCase();

    categorySections.forEach((section) => {
      const sectionCat = section.dataset.category;
      const isCategoryActive = currentCategory === 'all' || currentCategory === sectionCat;
      const itemsInSection = section.querySelectorAll('.full-menu-item');
      let visibleInSection = 0;

      itemsInSection.forEach((item) => {
        const textContent = (item.dataset.name + ' ' + item.textContent).toLowerCase();
        const searchMatches = !query || textContent.includes(query);

        if (isCategoryActive && searchMatches) {
          item.style.display = '';
          visibleInSection++;
          totalVisibleItems++;
        } else {
          item.style.display = 'none';
        }
      });

      // Show section if category matches and at least one item matches search query
      if (isCategoryActive && visibleInSection > 0) {
        section.style.display = '';
      } else {
        section.style.display = 'none';
      }
    });

    // Update Search Status
    if (query || currentCategory !== 'all') {
      if (searchStatusBar) searchStatusBar.classList.remove('hidden');
      if (searchStatusText) {
        const catLabel = currentCategory === 'all' ? 'All categories' : currentCategory.toUpperCase();
        searchStatusText.textContent = query 
          ? `Showing ${totalVisibleItems} matches for "${query}" in ${catLabel}`
          : `Showing ${totalVisibleItems} items in ${catLabel}`;
      }
    } else {
      if (searchStatusBar) searchStatusBar.classList.add('hidden');
    }

    // Toggle Empty State
    if (totalVisibleItems === 0) {
      if (emptySearchState) emptySearchState.classList.remove('hidden');
      if (sectionsWrapper) sectionsWrapper.classList.add('hidden');
    } else {
      if (emptySearchState) emptySearchState.classList.add('hidden');
      if (sectionsWrapper) sectionsWrapper.classList.remove('hidden');
    }

    // Smooth scroll to category section if user specifically clicked a category tab
    if (shouldScroll && currentCategory !== 'all') {
      const activeSection = document.getElementById(`cat-${currentCategory}`);
      if (activeSection) {
        activeSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }

  // Category Tab Click
  tabButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      currentCategory = btn.dataset.filter;
      tabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      window.location.hash = currentCategory === 'all' ? '' : currentCategory;
      applyFilters(true);
    });
  });

  // Search Input Event
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      if (searchClearBtn) {
        if (searchQuery.length > 0) {
          searchClearBtn.classList.remove('hidden');
        } else {
          searchClearBtn.classList.add('hidden');
        }
      }
      applyFilters(false);
    });
  }

  // Search Clear Button
  if (searchClearBtn) {
    searchClearBtn.addEventListener('click', () => {
      if (searchInput) {
        searchInput.value = '';
        searchQuery = '';
      }
      searchClearBtn.classList.add('hidden');
      applyFilters(false);
    });
  }

  // Reset Filters Buttons
  function resetAllFilters() {
    currentCategory = 'all';
    searchQuery = '';
    if (searchInput) searchInput.value = '';
    if (searchClearBtn) searchClearBtn.classList.add('hidden');
    tabButtons.forEach(b => b.classList.remove('active'));
    const allBtn = document.querySelector('.menu-tab-btn[data-filter="all"]');
    if (allBtn) allBtn.classList.add('active');
    window.location.hash = '';
    applyFilters(false);
  }

  if (btnResetFilters) btnResetFilters.addEventListener('click', resetAllFilters);
  if (btnEmptyReset) btnEmptyReset.addEventListener('click', resetAllFilters);

  // Initial Filter Execution
  applyFilters(false);

  /**
   * Order Modal Logic
   */
  function openOrderModal(itemName = null, itemPrice = null) {
    if (!orderModal) return;

    if (itemName && blendSelect) {
      let found = false;
      for (let i = 0; i < blendSelect.options.length; i++) {
        if (blendSelect.options[i].value.toLowerCase() === itemName.toLowerCase()) {
          blendSelect.selectedIndex = i;
          found = true;
          break;
        }
      }
      if (!found) {
        const newOpt = document.createElement('option');
        newOpt.value = itemName;
        newOpt.textContent = `${itemName} (₹${itemPrice || 40})`;
        newOpt.dataset.price = itemPrice || '40';
        blendSelect.appendChild(newOpt);
        blendSelect.value = itemName;
      }
    }

    if (cupQtyInput) cupQtyInput.value = 1;
    updateModalPricing();

    orderModal.classList.add('open');
    orderModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeOrderModal() {
    if (!orderModal) return;
    orderModal.classList.remove('open');
    orderModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function updateModalPricing() {
    if (!blendSelect || !blendSelect.options || blendSelect.selectedIndex < 0) return;
    const selectedOpt = blendSelect.options[blendSelect.selectedIndex];
    const unitPrice = parseInt(selectedOpt?.dataset?.price || '40', 10);
    const qty = parseInt(cupQtyInput?.value || '1', 10) || 1;
    const special = sweetnessSelect ? sweetnessSelect.value : '';
    const extra = special.includes('Extra Cheese') ? 15 : 0;
    const total = (unitPrice + extra) * qty;

    if (summaryUnitPrice) summaryUnitPrice.textContent = `₹${unitPrice + extra}`;
    if (summaryTotalPrice) summaryTotalPrice.textContent = `₹${total}`;
  }

  // Order item buttons delegation
  document.addEventListener('click', (e) => {
    const orderBtn = e.target.closest('.btn-order-item');
    if (orderBtn) {
      e.preventDefault();
      const item = orderBtn.dataset.item;
      const price = orderBtn.dataset.price;
      openOrderModal(item, price);
    }
  });

  if (btnQuickOrder) btnQuickOrder.addEventListener('click', () => openOrderModal());
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

  // Submit Order Mock Form
  if (orderForm) {
    orderForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const custNameEl = document.getElementById('cust-name');
      const name = custNameEl ? custNameEl.value : 'Guest';
      const blend = blendSelect ? blendSelect.value : 'Masala Kulhad Chai';
      const qty = cupQtyInput ? cupQtyInput.value : '1';

      closeOrderModal();

      if (toast && toastTitle && toastMsg) {
        toastTitle.textContent = 'Order Confirmed!';
        toastMsg.textContent = `Thank you, ${name}! ${qty}x ${blend} is steaming fresh in the kitchen.`;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 4500);
      }

      orderForm.reset();
      if (cupQtyInput) cupQtyInput.value = 1;
      updateModalPricing();
    });
  }

  // Escape key to close modal
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeOrderModal();
  });

  // Top Scroll Progress Bar & Navbar scroll state
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (navbar) {
      if (window.scrollY > 30) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }
    if (!progressBar) return;
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (totalHeight > 0) {
      const progress = (window.scrollY / totalHeight) * 100;
      progressBar.style.width = `${progress}%`;
    }
  }, { passive: true });
});

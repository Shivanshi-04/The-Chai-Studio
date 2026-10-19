/**
 * THE CHAI STUDIO — OUR STORY PAGE CONTROLLER
 * Interactive Craftsmanship Explorer, Spice Vault, Anatomy Visualizer & Soulmate Quiz
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Scroll Progress Bar & Navbar scroll state
  const progressBar = document.getElementById('scroll-progress');
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (navbar) {
      if (window.scrollY > 30) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }
    if (progressBar) {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = totalHeight > 0 ? (window.scrollY / totalHeight) * 100 : 0;
      progressBar.style.transform = `scaleX(${progress / 100})`;
    }
  }, { passive: true });

  // 2. Scrollytelling & Intersection Observer Fallback
  // (Modern Web Guidance compliance for browsers lacking CSS scroll-driven animations)
  const revealElements = document.querySelectorAll('.scroll-reveal');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, {
      threshold: Array.from({ length: 11 }, (_, i) => i / 10),
      rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach(el => observer.observe(el));
  } else {
    // Immediate fallback
    revealElements.forEach(el => el.classList.add('visible'));
  }

  // 3. Interactive Kulhad Anatomy Visualizer
  const anatomyData = {
    1: {
      title: "The Velvety Golden Crown (Malai Froth & Saffron Tint)",
      layer: "Surface Layer (Top 10mm)",
      temp: "78°C Ideal Sipping Temperature",
      notes: "Sweet warm cream, wild floral saffron, delicate cardamom vapor",
      description: "Formed through repeated high-arc aeration from our burnished brass samovars. This dense, velvety micro-foam captures ascending volatile spice oils and insulates the chai, sealing the intense warmth within the kulhad.",
      science: "High-protein aeration creates micro-emulsified bubbles that soften the tea's bold tannins on the palate."
    },
    2: {
      title: "The Malty Spiced Liquor (Slow-Decoction Core)",
      layer: "Heart Layer (Middle 60mm)",
      temp: "85°C Rolling Simmer Core",
      notes: "Roasted malt, toasted biscuits, deep amber richness, full-bodied warmth",
      description: "The soul of the cup. Blended from high-altitude Himalayan orthodox tea leaves and bold Assam second-flush CTC. Simmered for exactly 12 minutes with unadulterated full-cream milk until the liquid turns a deep, radiant chai-caramel.",
      science: "Extended simmer allows orthodox leaf polyphenols to bind with dairy lipids, yielding an unctuous, syrupy mouthfeel."
    },
    3: {
      title: "The 7 Whole Spices Potli (Aromatic Mineral Base)",
      layer: "Infusion Base (Pounded Fresh Daily)",
      temp: "92°C Extraction Thermal Peak",
      notes: "Fiery ginger heat, citrusy cardamom camphor, sweet cinnamon bark, soothing clove",
      description: "Hand-pounded every morning in heavy iron and stone mortars. We combine Idukki green cardamom, Himalayan adrak (ginger), Ceylon cinnamon, black peppercorns, cloves, nutmeg, and Kashmiri royal saffron.",
      science: "Fresh stone-crushing preserves gingerols and cineole essential oils that are destroyed in pre-packaged industrial powders."
    },
    4: {
      title: "The Unglazed Terracotta Vessel (Petrichor & Thermal Memory)",
      layer: "Clay Foundation (Mitti ki Saundhi Khushboo)",
      temp: "65°C Radiant Mineral Wall",
      notes: "First monsoon rain on sun-baked soil, baked terracotta petrichor, mineral sweetness",
      description: "Wheel-thrown from natural riverbed clay by Uttarakhand potters and kiln-fired at 900°C without synthetic glazes. The porous earthenware breathes, subtly drawing out excess moisture and balancing the brew's natural acidity.",
      science: "Porous alkaline clay neutralizes tea acidity and releases microscopic silica particles that create the unmistakable 'saundaapan'."
    }
  };

  const layerButtons = document.querySelectorAll('.anatomy-layer-btn');
  const anatomyDetailTitle = document.getElementById('anatomy-detail-title');
  const anatomyDetailLayer = document.getElementById('anatomy-detail-layer');
  const anatomyDetailTemp = document.getElementById('anatomy-detail-temp');
  const anatomyDetailNotes = document.getElementById('anatomy-detail-notes');
  const anatomyDetailDesc = document.getElementById('anatomy-detail-desc');
  const anatomyDetailScience = document.getElementById('anatomy-detail-science');
  const anatomyVisualLayers = document.querySelectorAll('.kulhad-visual-slice');

  layerButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const layerId = btn.dataset.layer;
      layerButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Update Visual Highlight
      if (anatomyVisualLayers) {
        anatomyVisualLayers.forEach(slice => {
          if (slice.dataset.slice === layerId) {
            slice.classList.add('ring-2', 'ring-[#fdb96e]', 'shadow-[0_0_20px_rgba(253,185,110,0.5)]');
          } else {
            slice.classList.remove('ring-2', 'ring-[#fdb96e]', 'shadow-[0_0_20px_rgba(253,185,110,0.5)]');
          }
        });
      }

      // Update Text Content with subtle fade
      const data = anatomyData[layerId];
      if (data && anatomyDetailTitle) {
        const container = document.getElementById('anatomy-detail-container');
        if (container) container.style.opacity = '0.5';

        setTimeout(() => {
          if (anatomyDetailTitle) anatomyDetailTitle.textContent = data.title;
          if (anatomyDetailLayer) anatomyDetailLayer.textContent = data.layer;
          if (anatomyDetailTemp) anatomyDetailTemp.textContent = data.temp;
          if (anatomyDetailNotes) anatomyDetailNotes.textContent = data.notes;
          if (anatomyDetailDesc) anatomyDetailDesc.textContent = data.description;
          if (anatomyDetailScience) anatomyDetailScience.textContent = data.science;
          if (container) container.style.opacity = '1';
        }, 150);
      }
    });
  });

  // 4. Interactive Master Spice Vault
  const spiceData = {
    elaichi: {
      name: "Idukki Green Cardamom (Elaichi)",
      origin: "Cardamom Hills, Idukki, Kerala",
      botanical: "Elettaria cardamomum",
      potency: "Tridoshic (Balancing) • Cooling Aftertaste",
      profile: "Intensely fragrant, sweet eucalyptus, citrus zest, and cooling camphor.",
      brews: "Karak Kulhad Chai, Shahi Malai Chai, Saffron Kulhad",
      craft: "We crack each pod seconds before decoction to preserve the volatile pinene oils."
    },
    adrak: {
      name: "Sun-Dried Mountain Ginger (Adrak)",
      origin: "Pahadi Valley Terraces, Uttarakhand",
      botanical: "Zingiber officinale",
      potency: "Deep Usna (Heating) • Agni Enhancer",
      profile: "Piquant, fiery warmth with earthy citrus undertones that clear mountain fog.",
      brews: "Adrak Kadak Special, Masala Matka Chai, Monsoon Kulhad",
      craft: "Fresh roots are stone-bruised in cast iron mortars to liberate the fiery gingerols."
    },
    dalchini: {
      name: "True Ceylon Cinnamon (Dalchini)",
      origin: "Organic Coastal Orchards, Southern India",
      botanical: "Cinnamomum verum",
      potency: "Sweet & Warming • Natural Glycemic Balancer",
      profile: "Delicate, sweet woody spice without the harsh woody bite of commercial cassia.",
      brews: "Cinnamon Honey Kulhad, Kashmiri Kahwa, Hot Chocolate Chai",
      craft: "Hand-rolled multi-layer quills ground co-simultaneously with the tea leaf."
    },
    kesar: {
      name: "Royal Mongra Saffron (Kesar)",
      origin: "Pampore Highlands, Kashmir",
      botanical: "Crocus sativus",
      potency: "Sattvic & Royal • Mood Uplifter",
      profile: "Honeyed floral notes, metallic sweetness, and an unmistakable imperial golden amber hue.",
      brews: "Kashmiri Shahi Kahwa, Kesar Badam Kulhad, Emperor's Reserve",
      craft: "Steeped separately in warm milk for 20 minutes before gently kissing the final brew."
    },
    laung: {
      name: "Sun-Dried Cloves & Malabar Pepper",
      origin: "Wayanad & Malabar Coast, Kerala",
      botanical: "Syzygium aromaticum & Piper nigrum",
      potency: "Deeply Pungent • Respiratory Soother",
      profile: "Numbing clove warmth, piercing black pepper bite, and intense balsamic undertones.",
      brews: "Signature 7-Spice Masala, Winter Kadak Chai",
      craft: "Whole cloves roasted lightly to awaken eugenol oils before gentle mortar fracturing."
    },
    tulsi: {
      name: "Holy Mountain Basil (Pahadi Tulsi)",
      origin: "Himalayan Forest Foothills, Dehradun",
      botanical: "Ocimum tenuiflorum",
      potency: "Pranic Purifier • Natural Adaptogen",
      profile: "Clove-like herbal sweetness, crisp peppery finish, and soothing mountain air clarity.",
      brews: "Adrak Tulsi Karak, Herbal Zing Detox, Pahadi Green Tea",
      craft: "Freshly harvested leaves torn by hand immediately before steeping to protect natural prana."
    }
  };

  const spiceCards = document.querySelectorAll('.spice-card');
  const spiceDetailName = document.getElementById('spice-detail-name');
  const spiceDetailOrigin = document.getElementById('spice-detail-origin');
  const spiceDetailBotanical = document.getElementById('spice-detail-botanical');
  const spiceDetailPotency = document.getElementById('spice-detail-potency');
  const spiceDetailProfile = document.getElementById('spice-detail-profile');
  const spiceDetailBrews = document.getElementById('spice-detail-brews');
  const spiceDetailCraft = document.getElementById('spice-detail-craft');

  spiceCards.forEach(card => {
    card.addEventListener('click', () => {
      const spiceKey = card.dataset.spice;
      spiceCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');

      const data = spiceData[spiceKey];
      if (data && spiceDetailName) {
        const detailContainer = document.getElementById('spice-detail-container');
        if (detailContainer) detailContainer.style.opacity = '0.4';

        setTimeout(() => {
          if (spiceDetailName) spiceDetailName.textContent = data.name;
          if (spiceDetailOrigin) spiceDetailOrigin.textContent = data.origin;
          if (spiceDetailBotanical) spiceDetailBotanical.textContent = data.botanical;
          if (spiceDetailPotency) spiceDetailPotency.textContent = data.potency;
          if (spiceDetailProfile) spiceDetailProfile.textContent = data.profile;
          if (spiceDetailBrews) spiceDetailBrews.textContent = data.brews;
          if (spiceDetailCraft) spiceDetailCraft.textContent = data.craft;
          if (detailContainer) detailContainer.style.opacity = '1';
        }, 150);
      }
    });
  });

  // 5. Interactive Chai Soulmate Quiz
  let selectedMood = 'chill';
  let selectedSpice = 'kadak';

  const soulmateCatalog = {
    'chill-kadak': {
      title: "Adrak Masala Kadak Kulhad",
      tagline: "The Ultimate Mountain Rain Remedy",
      price: "₹40",
      description: "Heavy on freshly bruised ginger and sun-dried cloves, slow-simmered in earthen terracotta. Shakes off cold mountain rain and instantly revitalizes weary spirits.",
      pairWith: "Hot Bun Maska or Samosa with Mint Chutney",
      category: "chai"
    },
    'chill-royal': {
      title: "Kashmiri Shahi Kesar Kahwa",
      tagline: "Warmth of the Himalayan Valleys",
      price: "₹60",
      description: "Delicate green tea leaves brewed with Kashmiri saffron, cinnamon sticks, and slivered almonds. No milk—pure, golden aromatic bliss.",
      pairWith: "Almond Cookies or Sweet Bun Maska",
      category: "chai"
    },
    'chill-aromatic': {
      title: "Elaichi Rose Petal Kulhad",
      tagline: "A Fragrant Floral Embrace",
      price: "₹45",
      description: "Sweet Idukki green cardamom married with fragrant sun-dried rose petals and thick dairy cream. Soothing, gentle, and utterly heartwarming.",
      pairWith: "Paneer Grilled Sandwich",
      category: "chai"
    },
    'chill-indulgent': {
      title: "Dark Chocolate Kulhad Chai",
      tagline: "Cozy Decadence in Earthen Clay",
      price: "₹50",
      description: "Rich melted dark cocoa folded into kadak spiced Assam tea, crowned with cocoa dust in a hot kulhad. Comfort food in a cup.",
      pairWith: "Double Masala Cheesy Maggi",
      category: "chai"
    },
    'focus-kadak': {
      title: "Double Kadak Adrak Hit",
      tagline: "Midnight Code Fuel & Brain Ignition",
      price: "₹45",
      description: "Extra-long decoction with double black CTC leaf, fiery mountain ginger, and crushed peppercorns. Guaranteed to keep your eyes sharp and mind clear.",
      pairWith: "Crispy Masala Fries or Peri Peri Maggi",
      category: "chai"
    },
    'focus-royal': {
      title: "Kesar Malai Samovar Brew",
      tagline: "High-Cognition Royal Elixir",
      price: "₹55",
      description: "Infused with saffron strands and rich malai cream. Sustained clean energy without jittery crashes.",
      pairWith: "Veg Cheese Burger",
      category: "chai"
    },
    'focus-aromatic': {
      title: "Tulsi Ginger Clarity Brew",
      tagline: "Stress-Dissolving Natural Clarity",
      price: "₹40",
      description: "Wild holy basil leaves brewed with crisp ginger and raw jaggery. Clears mental fatigue and restores quiet determination.",
      pairWith: "Corn & Cheese Sandwich",
      category: "chai"
    },
    'focus-indulgent': {
      title: "Espresso Infused Dirty Chai",
      tagline: "The Unholy Alliance of Coffee & Spices",
      price: "₹65",
      description: "A robust shot of dark roasted espresso poured directly into simmering masala kulhad chai. Maximum focus for serious grinds.",
      pairWith: "Loaded Paneer Pizza Slice",
      category: "coffee"
    },
    'unwind-kadak': {
      title: "Smoky Matka Tandoori Chai",
      tagline: "Nostalgic Tapri Gathering Brew",
      price: "₹45",
      description: "Clay kulhad fired over glowing charcoal embers, bubbling furiously as boiling spiced tea is poured inside. Smoky, dramatic, and unforgettable.",
      pairWith: "Cheese Garlic Toast or Veg Momos",
      category: "chai"
    },
    'unwind-royal': {
      title: "Peshawari Cardamom Cloud",
      tagline: "Velvety Evening Slow Sip",
      price: "₹50",
      description: "Ultra-aerated kulhad chai with generous cardamom cream foam and crushed pistachios. Made for deep late-night conversations.",
      pairWith: "Butter Croissant or Sweet Maska",
      category: "chai"
    },
    'unwind-aromatic': {
      title: "Chamomile Zing Herbal Cup",
      tagline: "Evening Unwind & Serenity",
      price: "₹50",
      description: "Whole chamomile blossoms infused with lemony lemongrass and a whisper of ginger. Naturally caffeine-free and soothing.",
      pairWith: "Light Veg Puff or Steamed Momos",
      category: "chai"
    },
    'unwind-indulgent': {
      title: "Nutella Hazelnut Kulhad",
      tagline: "Sweet Sips with Soulmates",
      price: "₹55",
      description: "Creamy hazelnut cocoa swirl melted into hot spiced tea leaves, creating a luscious dessert-chai hybrid in earthen clay.",
      pairWith: "Chocolate Frappe or Brownie Shake",
      category: "drinks"
    },
    'celebrate-kadak': {
      title: "The Chai Studio Royal Matka Feast",
      tagline: "Grand Celebration Blend",
      price: "₹50",
      description: "Our signature blend featuring all 7 spices, whole roasted cashew bits, saffron, and double cream in a commemorative jumbo kulhad.",
      pairWith: "Farmhouse Loaded Pizza & Paneer Burger",
      category: "chai"
    },
    'celebrate-royal': {
      title: "Emperor's Kesar Badam Kulhad",
      tagline: "Royal Court Decoction",
      price: "₹65",
      description: "Pure Kashmiri saffron, crushed green pistachios, slivered almonds, and full-fat buffalo milk slow-steeped to perfection.",
      pairWith: "Cheesy Overloaded Nachos",
      category: "chai"
    },
    'celebrate-aromatic': {
      title: "Gulab Cardamom Velvet",
      tagline: "Poetic Floral Indulgence",
      price: "₹50",
      description: "Damascus rose water drizzle, cardamom dust, and rich golden tea foam served piping hot.",
      pairWith: "Exotic Veg Pizza & Mocktail",
      category: "chai"
    },
    'celebrate-indulgent': {
      title: "Artisanal Caramel Crunch Frappe",
      tagline: "Chilled Celebration Masterpiece",
      price: "₹120",
      description: "Thick whipped cold coffee with buttery caramel ribbons, crushed biscuit crumble, and dark mocha drizzle.",
      pairWith: "Crispy Onion Rings & Loaded Fries",
      category: "coffee"
    }
  };

  const moodButtons = document.querySelectorAll('.quiz-mood-btn');
  const spiceButtons = document.querySelectorAll('.quiz-spice-btn');
  const resultTitle = document.getElementById('quiz-result-title');
  const resultTagline = document.getElementById('quiz-result-tagline');
  const resultPrice = document.getElementById('quiz-result-price');
  const resultDesc = document.getElementById('quiz-result-desc');
  const resultPair = document.getElementById('quiz-result-pair');
  const btnOrderSoulmate = document.getElementById('btn-order-soulmate');

  function updateSoulmateResult() {
    const key = `${selectedMood}-${selectedSpice}`;
    const match = soulmateCatalog[key] || soulmateCatalog['chill-kadak'];

    if (resultTitle) resultTitle.textContent = match.title;
    if (resultTagline) resultTagline.textContent = match.tagline;
    if (resultPrice) resultPrice.textContent = match.price;
    if (resultDesc) resultDesc.textContent = match.description;
    if (resultPair) resultPair.textContent = match.pairWith;

    if (btnOrderSoulmate) {
      btnOrderSoulmate.dataset.item = match.title;
      btnOrderSoulmate.dataset.price = match.price.replace('₹', '');
    }
  }

  moodButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      moodButtons.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedMood = btn.dataset.mood;
      updateSoulmateResult();
    });
  });

  spiceButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      spiceButtons.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedSpice = btn.dataset.spice;
      updateSoulmateResult();
    });
  });

  // Initial Quiz result setup
  updateSoulmateResult();

  // 6. Quick Order Modal Controller
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

  function openOrderModal(itemName = null, itemPrice = null) {
    if (!orderModal) return;

    if (itemName && blendSelect) {
      let found = false;
      for (let i = 0; i < blendSelect.options.length; i++) {
        if (blendSelect.options[i].value.toLowerCase().includes(itemName.toLowerCase())) {
          blendSelect.selectedIndex = i;
          found = true;
          break;
        }
      }
      if (!found) {
        // Fallback: set value or select first
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
    const extra = special.includes('Extra Malai') || special.includes('Extra Saffron') ? 15 : 0;
    const total = (unitPrice + extra) * qty;

    if (summaryUnitPrice) summaryUnitPrice.textContent = `₹${unitPrice + extra}`;
    if (summaryTotalPrice) summaryTotalPrice.textContent = `₹${total}`;
  }

  if (btnQuickOrder) {
    btnQuickOrder.addEventListener('click', () => openOrderModal());
  }

  if (btnOrderSoulmate) {
    btnOrderSoulmate.addEventListener('click', () => {
      const item = btnOrderSoulmate.dataset.item;
      const price = btnOrderSoulmate.dataset.price;
      openOrderModal(item, price);
    });
  }

  if (modalClose) {
    modalClose.addEventListener('click', closeOrderModal);
  }

  if (orderModal) {
    orderModal.addEventListener('click', (e) => {
      if (e.target === orderModal) closeOrderModal();
    });
  }

  if (blendSelect) blendSelect.addEventListener('change', updateModalPricing);
  if (sweetnessSelect) sweetnessSelect.addEventListener('change', updateModalPricing);

  if (qtyMinus) {
    qtyMinus.addEventListener('click', () => {
      let val = parseInt(cupQtyInput.value, 10) || 1;
      if (val > 1) {
        cupQtyInput.value = val - 1;
        updateModalPricing();
      }
    });
  }

  if (qtyPlus) {
    qtyPlus.addEventListener('click', () => {
      let val = parseInt(cupQtyInput.value, 10) || 1;
      if (val < 25) {
        cupQtyInput.value = val + 1;
        updateModalPricing();
      }
    });
  }

  if (orderForm) {
    orderForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const blendName = blendSelect.options[blendSelect.selectedIndex].text;
      const cups = cupQtyInput.value;
      const price = summaryTotalPrice ? summaryTotalPrice.textContent : '₹40';

      closeOrderModal();

      if (toast && toastTitle && toastMsg) {
        toastTitle.textContent = "Brew Order Placed!";
        toastMsg.textContent = `${cups}x ${blendName} (${price}) — Brewing in Kulhad!`;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 4200);
      }
    });
  }

  // Keyboard accessibility: Escape closes modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && orderModal && orderModal.classList.contains('open')) {
      closeOrderModal();
    }
  });
});

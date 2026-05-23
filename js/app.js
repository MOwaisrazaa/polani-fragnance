(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const money = (n) => {
    const safe = Number(n) || 0;
    const rounded = Math.round(safe);
    return `Rs ${rounded.toLocaleString("en-PK")}`;
  };
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  const prefersReducedMotion = () =>
    Boolean(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  let revealObserver = null;
  const revealSelectors = [
    ".section-head",
    ".category-card",
    ".feature",
    ".card",
    ".trust__item",
    ".split__content",
    ".split__media",
    ".collection-hero__inner",
    ".collection-head",
    ".filters",
    ".product",
    ".cart__grid",
    ".cart-row",
    ".checkout__grid",
    ".prose",
    ".contact",
    ".newsletter__inner",
    ".footer__grid",
  ].join(",");

  const refreshReveal = () => {
    const reduce = prefersReducedMotion();
    const targets = $$(revealSelectors).filter((el) => !el.hasAttribute("data-reveal-mounted"));
    targets.forEach((el, i) => {
      el.setAttribute("data-reveal-mounted", "1");
      el.classList.add("reveal");
      el.style.setProperty("--reveal-delay", `${Math.min(i * 45, 240)}ms`);
      if (reduce) el.classList.add("is-inview");
      else revealObserver?.observe(el);
    });
  };

  const mountReveal = () => {
    if (prefersReducedMotion()) {
      refreshReveal();
      return;
    }
    if (!("IntersectionObserver" in window)) {
      $$(revealSelectors).forEach((el) => el.classList.add("reveal", "is-inview"));
      return;
    }
    revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const el = entry.target;
          if (!(el instanceof HTMLElement)) return;
          if (!entry.isIntersecting) return;
          el.classList.add("is-inview");
          revealObserver?.unobserve(el);
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -10% 0px" },
    );
    refreshReveal();
  };

  const storage = {
    get(key, fallback) {
      try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
      } catch {
        return fallback;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch {
        // ignore
      }
    },
  };

  const state = {
    cart: storage.get("polani_cart", []),
    wishlist: new Set(storage.get("polani_wishlist", [])),
  };

  const saveCart = () => storage.set("polani_cart", state.cart);
  const saveWishlist = () => storage.set("polani_wishlist", Array.from(state.wishlist));

  const getCartCount = () => state.cart.reduce((sum, line) => sum + (line.qty || 0), 0);
  const setCartBadges = () => {
    const count = getCartCount();
    $$("[data-cart-count]").forEach((el) => (el.textContent = String(count)));
  };

  const getProduct = (id) => (window.POLANI?.products || []).find((p) => p.id === id) || null;

  const addToCart = (productId, qty = 1) => {
    const p = getProduct(productId);
    if (!p) return;
    const safeQty = clamp(Number(qty) || 1, 1, 99);
    const existing = state.cart.find((l) => l.id === productId);
    if (existing) existing.qty = clamp((existing.qty || 1) + safeQty, 1, 99);
    else state.cart.push({ id: productId, qty: safeQty });
    saveCart();
    setCartBadges();
  };

  const setYear = () => {
    $$("[data-year]").forEach((el) => (el.textContent = String(new Date().getFullYear())));
  };

  const mountIcons = () => {
    const icon = (name) => {
      const g = "rgba(198,164,108,.95)";
      const w = "rgba(255,255,255,.82)";
      switch (name) {
        case "search":
          return `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="${w}" stroke-width="1.6"><circle cx="11" cy="11" r="6"/><path d="M20 20l-3.5-3.5"/></svg>`;
        case "user":
          return `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="${w}" stroke-width="1.6"><path d="M20 21a8 8 0 0 0-16 0"/><circle cx="12" cy="8" r="4"/></svg>`;
        case "cart":
          return `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="${w}" stroke-width="1.6"><path d="M6 6h15l-1.5 8H8L6 2H3"/><circle cx="9" cy="20" r="1.6"/><circle cx="18" cy="20" r="1.6"/></svg>`;
        case "x":
          return `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="${w}" stroke-width="1.6"><path d="M6 6l12 12M18 6L6 18"/></svg>`;
        case "mail":
          return `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="${g}" stroke-width="1.6"><path d="M4 6h16v12H4z"/><path d="M4 7l8 6 8-6"/></svg>`;
        case "phone":
          return `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="${g}" stroke-width="1.6"><path d="M6 3l4 3-2 3a14 14 0 0 0 7 7l3-2 3 4-2 2c-1.2 1.2-3.1 1.2-5.4.4-5.5-2-9.7-6.2-11.7-11.7C1.8 6.1 1.8 4.2 3 3l3 0z"/></svg>`;
        case "pin":
          return `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="${g}" stroke-width="1.6"><path d="M12 22s7-6.1 7-12a7 7 0 0 0-14 0c0 5.9 7 12 7 12z"/><circle cx="12" cy="10" r="2"/></svg>`;
        case "clock":
          return `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="${g}" stroke-width="1.6"><circle cx="12" cy="12" r="9"/><path d="M12 7v6l4 2"/></svg>`;
        case "wa":
          return `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="${g}" stroke-width="1.6"><path d="M20 12a8 8 0 0 1-12.8 6.4L4 20l1.8-3.1A8 8 0 1 1 20 12z"/><path d="M8.5 9.5c1.2 3 3.8 5.5 6.9 6.7"/><path d="M16 15.5l-1.6.6c-.6.2-1.4 0-2-.4l-1.8-1.2c-.6-.4-1-.9-1.2-1.6l-.7-2c-.2-.6 0-1.3.5-1.7l.7-.6"/></svg>`;
        case "lock":
          return `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="${g}" stroke-width="1.6"><path d="M7 11V8a5 5 0 0 1 10 0v3"/><path d="M6 11h12v10H6z"/></svg>`;
        case "lock-dark":
          return `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="rgba(23,23,23,.9)" stroke-width="1.6"><path d="M7 11V8a5 5 0 0 1 10 0v3"/><path d="M6 11h12v10H6z"/></svg>`;
        case "box":
          return `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="${g}" stroke-width="1.6"><path d="M4 7l8-4 8 4-8 4-8-4z"/><path d="M4 7v10l8 4 8-4V7"/><path d="M12 11v10"/></svg>`;
        case "badge":
          return `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="${g}" stroke-width="1.6"><path d="M12 2l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1 3-6z"/></svg>`;
        case "headset":
          return `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="${g}" stroke-width="1.6"><path d="M4 12a8 8 0 0 1 16 0v6a2 2 0 0 1-2 2h-2"/><path d="M4 12v6a2 2 0 0 0 2 2h2"/><path d="M8 20v-6"/><path d="M16 20v-6"/></svg>`;
        case "quality":
          return `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="${g}" stroke-width="1.6"><path d="M12 2l7 4v6c0 5-3 9-7 10-4-1-7-5-7-10V6l7-4z"/><path d="M9 12l2 2 4-5"/></svg>`;
        case "hand":
          return `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="${g}" stroke-width="1.6"><path d="M8 11V6a2 2 0 0 1 4 0v5"/><path d="M12 11V5a2 2 0 0 1 4 0v7"/><path d="M16 12V7a2 2 0 0 1 4 0v8c0 4-3 7-7 7h-3c-3 0-6-2-7-5l-1-3c-1-2 2-3 3-1l2 3"/></svg>`;
        case "gift":
          return `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="${g}" stroke-width="1.6"><path d="M20 12v10H4V12"/><path d="M2 7h20v5H2z"/><path d="M12 7v15"/><path d="M12 7h-3a3 3 0 1 1 3-3v3z"/><path d="M12 7h3a3 3 0 1 0-3-3v3z"/></svg>`;
        case "truck":
          return `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="${g}" stroke-width="1.6"><path d="M3 6h12v10H3z"/><path d="M15 10h4l2 3v3h-6z"/><circle cx="7" cy="18" r="1.6"/><circle cx="18" cy="18" r="1.6"/></svg>`;
        case "men":
          return `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="${g}" stroke-width="1.6"><path d="M14 3h7v7"/><path d="M21 3l-7 7"/><circle cx="10" cy="14" r="7"/></svg>`;
        case "women":
          return `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="${g}" stroke-width="1.6"><circle cx="12" cy="9" r="6"/><path d="M12 15v7"/><path d="M9 19h6"/></svg>`;
        case "attar":
          return `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="${g}" stroke-width="1.6"><path d="M10 2h4v4h-4z"/><path d="M8 6h8l-1 16H9L8 6z"/><path d="M10 10h4"/></svg>`;
        case "oud":
          return `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="${g}" stroke-width="1.6"><path d="M7 22c4-7 6-9 5-20"/><path d="M12 22c4-7 6-9 5-20"/><path d="M4 18c6-2 10-2 16 0"/></svg>`;
        case "candle":
          return `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="${g}" stroke-width="1.6"><path d="M9 22h6"/><path d="M8 10h8v12H8z"/><path d="M12 2c2 2 2 4 0 6-2-2-2-4 0-6z"/></svg>`;
        case "star":
          return `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="${g}" stroke-width="1.6"><path d="M12 2l3 7 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1 3-7z"/></svg>`;
        case "ig":
          return `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="${g}" stroke-width="1.6"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.2" fill="${g}" stroke="none"/></svg>`;
        case "fb":
          return `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="${g}" stroke-width="1.6"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>`;
        case "tt":
          return `<svg viewBox="0 0 24 24" width="18" height="18" fill="${g}" stroke="none"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z"/></svg>`;
        case "yt":
          return `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="${g}" stroke-width="1.6"><rect x="2" y="5" width="20" height="14" rx="4"/><polygon points="10,9 16,12 10,15" fill="${g}" stroke="none"/></svg>`;
        case "visa":
          return `<svg viewBox="0 0 84 40" width="64" height="30" role="img" aria-label="Visa"><rect x="1" y="1" width="82" height="38" rx="10" fill="#fff" stroke="rgba(0,0,0,.12)"/><text x="42" y="26" text-anchor="middle" font-family="Montserrat, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif" font-size="16" font-weight="800" fill="#1A1F71" letter-spacing="2">VISA</text></svg>`;
        case "mc":
          return `<svg viewBox="0 0 84 40" width="64" height="30" role="img" aria-label="Mastercard"><rect x="1" y="1" width="82" height="38" rx="10" fill="#fff" stroke="rgba(0,0,0,.12)"/><circle cx="40" cy="20" r="10" fill="#EB001B"/><circle cx="48" cy="20" r="10" fill="#F79E1B"/><circle cx="44" cy="20" r="10" fill="#FF5F00" opacity=".92"/><text x="42" y="34" text-anchor="middle" font-family="Montserrat, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif" font-size="8" font-weight="700" fill="rgba(23,23,23,.0)">MC</text></svg>`;
        case "amex":
          return `<svg viewBox="0 0 84 40" width="64" height="30" role="img" aria-label="American Express"><rect x="1" y="1" width="82" height="38" rx="10" fill="#2E77BC" stroke="rgba(0,0,0,.12)"/><rect x="8" y="9" width="68" height="22" rx="6" fill="rgba(255,255,255,.14)"/><text x="42" y="26" text-anchor="middle" font-family="Montserrat, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif" font-size="14" font-weight="900" fill="#FFFFFF" letter-spacing="1">AMEX</text></svg>`;
        case "paypal":
          return `<svg viewBox="0 0 84 40" width="64" height="30" role="img" aria-label="PayPal"><rect x="1" y="1" width="82" height="38" rx="10" fill="#fff" stroke="rgba(0,0,0,.12)"/><text x="42" y="26" text-anchor="middle" font-family="Montserrat, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif" font-size="12" font-weight="900" fill="#003087">Pay</text><text x="55" y="26" text-anchor="start" font-family="Montserrat, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif" font-size="12" font-weight="900" fill="#009CDE">Pal</text></svg>`;
        case "applepay":
          return `<svg viewBox="0 0 84 40" width="64" height="30" role="img" aria-label="Apple Pay"><rect x="1" y="1" width="82" height="38" rx="10" fill="#fff" stroke="rgba(0,0,0,.12)"/><path d="M26 18c1-.1 2-.7 2.7-1.5.8-.9 1.3-2.2 1.2-3.5-1.2.1-2.5.8-3.3 1.7-.7.8-1.3 2.1-1.1 3.3.2 0 .3 0 .5 0z" fill="#111"/><path d="M29.8 20.2c-1.6-.1-3 .9-3.8.9-.8 0-2-.9-3.3-.9-1.7 0-3.2 1-4 2.5-1.7 2.9-.4 7.2 1.2 9.6.8 1.2 1.8 2.5 3.1 2.4 1.2 0 1.7-.8 3.2-.8 1.5 0 1.9.8 3.2.8 1.3 0 2.2-1.2 3-2.4.9-1.3 1.3-2.6 1.3-2.7-.0 0-2.6-1-2.6-3.9 0-2.4 2-3.5 2.1-3.6-1.2-1.7-3-1.9-3.4-1.9z" fill="#111"/><text x="56" y="26" text-anchor="middle" font-family="Montserrat, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif" font-size="12" font-weight="900" fill="#111">Pay</text></svg>`;
        default:
          return "";
      }
    };

    $$("[data-icon]").forEach((el) => {
      const name = el.getAttribute("data-icon");
      el.innerHTML = icon(name);
    });
  };

  const mountNav = () => {
    const toggle = $("[data-nav-toggle]");
    const nav = $("[data-nav]");
    if (!toggle || !nav) return;
    toggle.addEventListener("click", () => nav.classList.toggle("is-open"));
    document.addEventListener("click", (e) => {
      const t = e.target;
      if (!(t instanceof Element)) return;
      if (nav.classList.contains("is-open") && !nav.contains(t) && !toggle.contains(t)) nav.classList.remove("is-open");
    });
  };

  const mountSearchDrawer = () => {
    const drawer = $("[data-search]");
    if (!drawer) return;
    const openBtn = $("[data-search-open]");
    const closeEls = $$("[data-search-close]");
    const form = $("[data-search-form]");
    const input = drawer.querySelector("input[type='search']");

    let closeTimer = 0;
    const open = () => {
      drawer.hidden = false;
      window.clearTimeout(closeTimer);
      requestAnimationFrame(() => {
        drawer.classList.add("is-open");
        input?.focus();
      });
    };
    const close = () => {
      drawer.classList.remove("is-open");
      window.clearTimeout(closeTimer);
      closeTimer = window.setTimeout(() => {
        drawer.hidden = true;
      }, 340);
    };

    openBtn?.addEventListener("click", open);
    closeEls.forEach((c) => c.addEventListener("click", close));
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") close();
    });
    form?.addEventListener("submit", (e) => {
      e.preventDefault();
      const q = input?.value?.trim() || "";
      if (!q) return;
      window.location.href = `men.html?q=${encodeURIComponent(q)}`;
    });
  };

  const renderStars = (rating) => {
    const r = Number(rating) || 0;
    const full = Math.floor(r);
    const half = r - full >= 0.5 ? 1 : 0;
    const empty = Math.max(0, 5 - full - half);
    return "★".repeat(full) + (half ? "☆" : "") + "✩".repeat(empty);
  };

  const renderProductCard = (p) => {
    return `
      <article class="card" data-product="${p.id}">
        <a class="card__media" href="product.html?id=${encodeURIComponent(p.id)}">
          <img src="${p.images?.[0] || "assets/product-elixir.svg"}" alt="${p.name}" loading="lazy" />
          <button class="wish" type="button" aria-label="Add to wishlist" data-wish="${p.id}">
            <span class="icon" aria-hidden="true" data-icon="star"></span>
          </button>
        </a>
        <div class="card__body">
          <h3 class="card__name">${p.name}</h3>
          <div class="card__type">${p.type}</div>
          <div class="card__row">
            <div class="price">${money(p.price)}</div>
            <div class="rating">
              <span class="stars" aria-hidden="true">${renderStars(p.rating)}</span>
              <span class="muted">(${p.reviews})</span>
            </div>
          </div>
          <div class="card__actions">
            <button class="btn btn--ghost" type="button" data-add="${p.id}">Add to Cart</button>
          </div>
        </div>
      </article>
    `;
  };

  const mountGrids = () => {
    const products = window.POLANI?.products || [];
    $$("[data-product-grid]").forEach((grid) => {
      const mode = grid.getAttribute("data-product-grid");
      let list = products;
      if (mode === "bestsellers") list = products.slice(0, 5);
      grid.innerHTML = list.map(renderProductCard).join("");
    });

    // Wishlist toggle
    $$("[data-wish]").forEach((btn) => {
      const id = btn.getAttribute("data-wish");
      if (!id) return;
      const set = () => btn.classList.toggle("is-on", state.wishlist.has(id));
      set();
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        if (state.wishlist.has(id)) state.wishlist.delete(id);
        else state.wishlist.add(id);
        saveWishlist();
        set();
      });
    });

    // Add to cart buttons
    $$("[data-add]").forEach((btn) => {
      const id = btn.getAttribute("data-add");
      if (!id) return;
      btn.addEventListener("click", () => addToCart(id, 1));
    });

    refreshReveal();
  };

  const mountCollection = () => {
    const grid = $("[data-product-grid='collection']");
    if (!grid) return;
    const products = window.POLANI?.products || [];

    const url = new URL(window.location.href);
    const q = (url.searchParams.get("q") || "").trim().toLowerCase();

    const ui = {
      sort: $("[data-sort]"),
      results: $("[data-results-count]"),
      price: $("[data-filter-price]"),
      priceLabel: $("[data-price-label]"),
      cat: $$("[data-filter-cat]"),
      family: $$("[data-filter-family]"),
      occasion: $$("[data-filter-occasion]"),
      reset: $("[data-reset-filters]"),
    };

    const getFilters = () => {
      const cat = ui.cat.find((r) => r.checked)?.value || "all";
      const priceMax = Number(ui.price?.value || 50000);
      const family = ui.family.filter((c) => c.checked).map((c) => c.value);
      const occasion = ui.occasion.filter((c) => c.checked).map((c) => c.value);
      return { cat, priceMax, family, occasion };
    };

    const apply = () => {
      const { cat, priceMax, family, occasion } = getFilters();
      if (ui.priceLabel) ui.priceLabel.textContent = money(priceMax);

      let list = products.filter((p) => p.price <= priceMax);
      if (cat !== "all") list = list.filter((p) => (p.categories || []).includes(cat));
      if (family.length) list = list.filter((p) => family.some((f) => (p.family || []).includes(f)));
      if (occasion.length) list = list.filter((p) => occasion.some((o) => (p.occasion || []).includes(o)));
      if (q) list = list.filter((p) => `${p.name} ${p.type}`.toLowerCase().includes(q));

      const sort = ui.sort?.value || "best";
      if (sort === "price-asc") list = list.slice().sort((a, b) => a.price - b.price);
      if (sort === "price-desc") list = list.slice().sort((a, b) => b.price - a.price);
      if (sort === "rating-desc") list = list.slice().sort((a, b) => (b.rating || 0) - (a.rating || 0));

      grid.innerHTML = list.map(renderProductCard).join("") || `<div class="muted">No products found.</div>`;
      mountGrids();

      if (ui.results) ui.results.textContent = `Showing 1–${Math.min(12, list.length)} of ${list.length} products`;
    };

    const bind = () => {
      ui.sort?.addEventListener("change", apply);
      ui.price?.addEventListener("input", apply);
      ui.cat.forEach((r) => r.addEventListener("change", apply));
      ui.family.forEach((c) => c.addEventListener("change", apply));
      ui.occasion.forEach((c) => c.addEventListener("change", apply));
      ui.reset?.addEventListener("click", () => {
        ui.cat.forEach((r) => (r.checked = r.value === "all"));
        if (ui.price) ui.price.value = "50000";
        ui.family.forEach((c) => (c.checked = false));
        ui.occasion.forEach((c) => (c.checked = false));
        apply();
      });
    };

    bind();
    apply();
  };

  const mountHero = () => {
    const dots = $$("[data-hero-dot]");
    const heroImg = $(".hero__img");
    if (!dots.length || !heroImg) return;

    const slides = [
      { img: "assets/hero-bottle.svg", title: "More than a fragrance,\nit’s a statement." },
      { img: "assets/product-noir.svg", title: "Luxury bottled.\nTimeless elegance." },
      { img: "assets/product-oud.svg", title: "Scent your presence.\nOud, refined." },
    ];

    const titleEl = $(".hero__title");
    const hero = $(".hero");
    let index = 0;
    let swapTimer = 0;
    const set = (i) => {
      index = ((i % slides.length) + slides.length) % slides.length;
      dots.forEach((d) => d.classList.toggle("is-active", d.getAttribute("data-hero-dot") === String(index)));

      if (hero) hero.classList.add("is-swapping");
      window.clearTimeout(swapTimer);
      swapTimer = window.setTimeout(() => {
        heroImg.src = slides[index].img;
        if (titleEl) titleEl.innerHTML = slides[index].title.replaceAll("\n", "<br />");
        window.setTimeout(() => hero?.classList.remove("is-swapping"), 520);
      }, 220);
    };
    dots.forEach((d) => d.addEventListener("click", () => set(Number(d.getAttribute("data-hero-dot") || 0))));
    set(0);

    let timer = window.setInterval(() => set(index + 1), 6500);
    window.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        window.clearInterval(timer);
      } else {
        timer = window.setInterval(() => set(index + 1), 6500);
      }
    });
  };

  const mountProductPage = () => {
    const root = $("[data-product-page]");
    if (!root) return;
    const url = new URL(window.location.href);
    const id = url.searchParams.get("id") || "elixir";
    const p = getProduct(id) || getProduct("elixir");
    if (!p) return;

    $$("[data-product-name]").forEach((el) => (el.textContent = p.name));
    const type = $("[data-product-type]");
    if (type) type.textContent = p.type;
    const price = $("[data-product-price]");
    if (price) price.textContent = money(p.price);
    const desc = $("[data-product-desc]");
    if (desc) desc.textContent = p.description;
    const rating = $("[data-product-rating]");
    if (rating) rating.innerHTML = `<span class="stars" aria-hidden="true">${renderStars(p.rating)}</span><span class="muted">(${p.reviews})</span>`;

    const img = $("[data-product-image]");
    if (img) img.src = p.images?.[0] || img.src;

    const thumbs = $("[data-thumbs]");
    if (thumbs) {
      const imgs = p.images?.length ? p.images : [img?.src].filter(Boolean);
      thumbs.innerHTML = imgs
        .map(
          (src, i) => `<button class="thumb ${i === 0 ? "is-on" : ""}" type="button" data-thumb="${i}"><img src="${src}" alt="" /></button>`,
        )
        .join("");
      $$("[data-thumb]", thumbs).forEach((b) => {
        b.addEventListener("click", () => {
          const idx = Number(b.getAttribute("data-thumb") || 0);
          img.src = imgs[idx] || imgs[0];
          $$("[data-thumb]", thumbs).forEach((x) => x.classList.toggle("is-on", x === b));
        });
      });
    }

    const notes = $("[data-product-notes]");
    if (notes) {
      const n = p.notes || {};
      const make = (label, arr) =>
        `<div class="notes__col"><div class="notes__label">${label}</div><div class="notes__value">${(arr || []).join(", ")}</div></div>`;
      notes.innerHTML = make("TOP NOTES", n.top) + make("HEART NOTES", n.heart) + make("BASE NOTES", n.base);
    }
    const longevity = $("[data-product-longevity]");
    if (longevity) longevity.textContent = p.longevity || "—";
    const projection = $("[data-product-projection]");
    if (projection) projection.textContent = p.projection || "—";
    const season = $("[data-product-season]");
    if (season) season.textContent = p.season || "—";
    const occ = $("[data-product-occasion]");
    if (occ) occ.textContent = (p.occasion || []).join(", ") || "—";

    $("[data-add-to-cart]")?.addEventListener("click", () => addToCart(p.id, 1));
    $("[data-buy-now]")?.addEventListener("click", () => {
      addToCart(p.id, 1);
      window.location.href = "cart.html";
    });

    const acc = $("[data-accordion]");
    if (acc) {
      const head = $(".accordion__head", acc);
      const body = $(".accordion__body", acc);
      head?.addEventListener("click", () => {
        const open = head.getAttribute("aria-expanded") !== "false";
        head.setAttribute("aria-expanded", open ? "false" : "true");
        if (body) body.hidden = open;
      });
    }
  };

  const mountCartPage = () => {
    const root = $("[data-cart-page]");
    if (!root) return;
    const items = $("[data-cart-items]");
    const subtotalEl = $("[data-subtotal]");
    const subtotalItemsEl = $("[data-subtotal-items]");
    const totalEl = $("[data-total]");
    const updateBtn = $("[data-update-cart]");

    const guessSize = (p) => {
      const t = String(p?.type || "").toLowerCase();
      if (t.includes("candle")) return "200g";
      return "100ml";
    };

    const render = () => {
      const lines = state.cart
        .map((l) => ({ line: l, p: getProduct(l.id) }))
        .filter((x) => x.p);
      const subtotal = lines.reduce((sum, x) => sum + (x.p.price || 0) * (x.line.qty || 1), 0);
      const itemCount = lines.reduce((sum, x) => sum + (x.line.qty || 0), 0);
      if (subtotalEl) subtotalEl.textContent = money(subtotal);
      if (totalEl) totalEl.textContent = money(subtotal);
      if (subtotalItemsEl) subtotalItemsEl.textContent = String(itemCount);

      if (!items) return;
      if (!lines.length) {
        items.innerHTML = `
          <div class="cart-empty">
            <div class="muted">Your cart is empty.</div>
            <a class="btn btn--ghost btn--dark" href="men.html">Continue shopping</a>
          </div>
        `;
        return;
      }
      items.innerHTML = lines
        .map(
          ({ line, p }) => `
            <div class="cart-row" data-line="${p.id}">
              <button class="cart-row__remove" type="button" aria-label="Remove" data-remove="${p.id}">×</button>

              <div class="cart-row__product">
                <img class="cart-row__img" src="${p.images?.[0] || "assets/product-elixir.svg"}" alt="${p.name}" />
                <div class="cart-row__info">
                  <div class="cart-row__name">${p.name}</div>
                  <div class="cart-row__meta">${p.type}</div>
                  <div class="cart-row__meta">Size: ${guessSize(p)}</div>
                </div>
              </div>

              <div class="cart-row__price">${money(p.price)}</div>

              <div class="qty qty--boxed" aria-label="Quantity">
                <button type="button" aria-label="Decrease" data-dec="${p.id}">−</button>
                <input type="number" min="1" max="99" value="${line.qty || 1}" data-qty="${p.id}" />
                <button type="button" aria-label="Increase" data-inc="${p.id}">+</button>
              </div>

              <div class="cart-row__subtotal">${money((p.price || 0) * (line.qty || 1))}</div>
            </div>
          `,
        )
        .join("");

      $$("[data-remove]").forEach((b) =>
        b.addEventListener("click", () => {
          const id = b.getAttribute("data-remove");
          if (!id) return;
          state.cart = state.cart.filter((x) => x.id !== id);
          saveCart();
          setCartBadges();
          render();
        }),
      );

      $$("[data-dec]").forEach((b) =>
        b.addEventListener("click", () => {
          const id = b.getAttribute("data-dec");
          const l = state.cart.find((x) => x.id === id);
          if (!l) return;
          l.qty = clamp((l.qty || 1) - 1, 1, 99);
          saveCart();
          setCartBadges();
          render();
        }),
      );
      $$("[data-inc]").forEach((b) =>
        b.addEventListener("click", () => {
          const id = b.getAttribute("data-inc");
          const l = state.cart.find((x) => x.id === id);
          if (!l) return;
          l.qty = clamp((l.qty || 1) + 1, 1, 99);
          saveCart();
          setCartBadges();
          render();
        }),
      );
      $$("[data-qty]").forEach((inp) =>
        inp.addEventListener("change", () => {
          const id = inp.getAttribute("data-qty");
          const l = state.cart.find((x) => x.id === id);
          if (!l) return;
          l.qty = clamp(Number(inp.value) || 1, 1, 99);
          saveCart();
          setCartBadges();
          render();
        }),
      );
    };

    render();
    updateBtn?.addEventListener("click", render);

    $("[data-coupon]")?.addEventListener("submit", (e) => {
      e.preventDefault();
      alert("Demo only: coupon applied visually in a real checkout.");
    });
  };

  const mountCheckoutPage = () => {
    const root = $("[data-checkout-page]");
    if (!root) return;
    const itemsEl = $("[data-items]");
    const totalEl = $("[data-total]");
    const note = $("[data-order-note]");

    const lines = state.cart.map((l) => ({ line: l, p: getProduct(l.id) })).filter((x) => x.p);
    const count = lines.reduce((s, x) => s + (x.line.qty || 0), 0);
    const total = lines.reduce((s, x) => s + (x.p.price || 0) * (x.line.qty || 1), 0);
    if (itemsEl) itemsEl.textContent = String(count);
    if (totalEl) totalEl.textContent = money(total);

    $("[data-checkout-form]")?.addEventListener("submit", (e) => {
      e.preventDefault();
      state.cart = [];
      saveCart();
      setCartBadges();
      if (note) note.hidden = false;
      window.setTimeout(() => (window.location.href = "index.html"), 1400);
    });
  };

  const mountContact = () => {
    $("[data-contact-form]")?.addEventListener("submit", (e) => {
      e.preventDefault();
      const note = $("[data-form-note]");
      if (note) note.hidden = false;
      const form = e.currentTarget;
      if (form instanceof HTMLFormElement) form.reset();
    });
    $("[data-whatsapp]")?.addEventListener("click", (e) => {
      e.preventDefault();
      alert("Demo: connect this button to your WhatsApp number.");
    });
    $("[data-directions]")?.addEventListener("click", (e) => {
      e.preventDefault();
      alert("Demo: embed Google Maps or link directions.");
    });
  };

  const mountNewsletter = () => {
    $("[data-newsletter]")?.addEventListener("submit", (e) => {
      e.preventDefault();
      alert("Thanks! (Demo subscription)");
      const form = e.currentTarget;
      if (form instanceof HTMLFormElement) form.reset();
    });
  };

  const mountCurrency = () => {
    const btn = $("[data-currency]");
    if (!btn) return;
    btn.textContent = "PKR (Rs) ▾";
    storage.set("polani_currency", "PKR");
    btn.addEventListener("click", () => {
      // PKR only (no toggle)
    });
  };

  // Boot
  setYear();
  mountIcons();
  mountNav();
  mountSearchDrawer();
  mountReveal();
  mountHero();
  mountGrids();
  mountCollection();
  mountProductPage();
  mountCartPage();
  mountCheckoutPage();
  mountContact();
  mountNewsletter();
  mountCurrency();
  setCartBadges();
})();

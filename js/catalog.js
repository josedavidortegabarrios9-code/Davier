/* ================================================================
   DAVIER — js/catalog.js
   Renderizado del catálogo, filtros por género, talla y búsqueda.
   ================================================================ */

const Catalog = (() => {
  const state = {
    gender: "todos",
    sizes: new Set(),
    search: ""
  };

  /* ---- Generación de chips de talla ---- */
  function buildSizeChips() {
    const grid = document.getElementById("size-grid");
    if (!grid) return;
    const sizes = [];
    for (let s = 28; s <= 45; s++) sizes.push(s);
    grid.innerHTML = sizes.map(s => `
      <button class="size-chip" data-size="${s}" aria-pressed="false" aria-label="Talla ${s}">${s}</button>
    `).join("");
    grid.querySelectorAll(".size-chip").forEach(chip => {
      chip.addEventListener("click", () => {
        const size = Number(chip.dataset.size);
        if (state.sizes.has(size)) {
          state.sizes.delete(size);
          chip.classList.remove("active");
          chip.setAttribute("aria-pressed", "false");
        } else {
          state.sizes.add(size);
          chip.classList.add("active");
          chip.setAttribute("aria-pressed", "true");
        }
        render();
      });
    });
  }

  /* ---- Filtrado ---- */
  function filter() {
    const term = state.search.trim().toLowerCase();
    return PRODUCTS.filter(p => {
      const gOk = state.gender === "todos" ||
                  p.gender === state.gender ||
                  (p.gender === "unisex" && state.gender !== "ninos");
      const sOk = state.sizes.size === 0 || p.sizes.some(s => state.sizes.has(s));
      const qOk = !term || p.name.toLowerCase().includes(term);
      return gOk && sOk && qOk;
    });
  }

  /* ---- Tarjeta de producto ---- */
  function productCardHTML(p) {
    const final = getFinalPrice(p);
    const hasDisc = p.discount > 0;
    return `
      <article class="product-card">
        <div class="product-window">
          <svg class="product-icon" aria-label="${p.name}" role="img"><use href="#icon-${p.icon}"/></svg>
          ${p.isNew  ? '<span class="badge badge-new">Nuevo</span>' : ""}
          ${hasDisc  ? `<span class="badge badge-sale">-${p.discount}%</span>` : ""}
          <button class="btn-wish" aria-label="Guardar ${p.name}" data-id="${p.id}">
            <svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
          </button>
        </div>
        <div class="product-info">
          <p class="product-meta">${getGenderLabel(p.gender)} · ${p.category}</p>
          <h3 class="product-name">${p.name}</h3>
          <p class="product-sizes">Tallas: ${p.sizes.join(", ")}</p>
          <div class="product-footer">
            <div class="product-price">
              ${hasDisc ? `<span class="price-old">${formatCOP(p.price)}</span>` : ""}
              <span class="price-now">${formatCOP(final)}</span>
            </div>
            <button class="btn-add-card" aria-label="Agregar ${p.name} al carrito" data-id="${p.id}">
              <svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>
            </button>
          </div>
        </div>
      </article>
    `;
  }

  /* ---- Render principal ---- */
  function render() {
    const grid = document.getElementById("product-grid");
    const countEl = document.getElementById("results-count");
    const emptyEl = document.getElementById("empty-state");
    if (!grid) return;

    const results = filter();
    countEl && (countEl.textContent = `${results.length} de ${PRODUCTS.length} productos`);

    if (results.length === 0) {
      grid.innerHTML = "";
      grid.style.display = "none";
      if (emptyEl) emptyEl.hidden = false;
      return;
    }
    if (emptyEl) emptyEl.hidden = true;
    grid.style.display = "";
    grid.innerHTML = results.map((p, i) => {
      const html = productCardHTML(p);
      // Delay de animación escalonado
      const div = document.createElement("div");
      div.innerHTML = html;
      const card = div.firstElementChild;
      card.style.animationDelay = `${Math.min(i * 0.04, 0.3)}s`;
      return card.outerHTML;
    }).join("");

    /* Eventos de tarjeta */
    grid.querySelectorAll(".btn-add-card").forEach(btn => {
      btn.addEventListener("click", () => {
        const pid = Number(btn.dataset.id);
        const product = PRODUCTS.find(p => p.id === pid);
        if (!product) return;
        /* Agregar talla más pequeña disponible por defecto (se puede mejorar con selector) */
        const size = product.sizes[0];
        Cart.add(product, size);
        /* Feedback visual */
        btn.innerHTML = `<svg viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>`;
        btn.style.background = "var(--accent3)";
        setTimeout(() => {
          btn.innerHTML = `<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>`;
          btn.style.background = "";
        }, 1000);
      });
    });

    grid.querySelectorAll(".btn-wish").forEach(btn => {
      btn.addEventListener("click", () => btn.classList.toggle("liked"));
    });
  }

  /* ---- Init ---- */
  function init() {
    buildSizeChips();
    render();

    /* Tabs de género */
    document.getElementById("gender-tabs")?.querySelectorAll(".gender-tab").forEach(tab => {
      tab.addEventListener("click", () => {
        document.querySelectorAll(".gender-tab").forEach(t => {
          t.classList.remove("active"); t.setAttribute("aria-selected", "false");
        });
        tab.classList.add("active"); tab.setAttribute("aria-selected", "true");
        state.gender = tab.dataset.gender;
        render();
      });
    });

    /* Búsqueda */
    document.getElementById("search-input")?.addEventListener("input", e => {
      state.search = e.target.value;
      render();
    });

    /* Limpiar filtros */
    const clearBtns = ["clear-filters", "empty-clear"];
    clearBtns.forEach(id => {
      document.getElementById(id)?.addEventListener("click", resetFilters);
    });

    /* Links de género del nav */
    document.querySelectorAll("[data-gender-link]").forEach(link => {
      link.addEventListener("click", () => {
        const gender = link.dataset.genderLink;
        document.querySelectorAll(".gender-tab").forEach(t => {
          const match = t.dataset.gender === gender;
          t.classList.toggle("active", match);
          t.setAttribute("aria-selected", String(match));
        });
        state.gender = gender;
        render();
      });
    });
  }

  function resetFilters() {
    state.gender = "todos";
    state.sizes.clear();
    state.search = "";
    const searchEl = document.getElementById("search-input");
    if (searchEl) searchEl.value = "";
    document.querySelectorAll(".gender-tab").forEach(t => {
      const all = t.dataset.gender === "todos";
      t.classList.toggle("active", all);
      t.setAttribute("aria-selected", String(all));
    });
    document.querySelectorAll(".size-chip").forEach(c => {
      c.classList.remove("active");
      c.setAttribute("aria-pressed", "false");
    });
    render();
  }

  return { init, resetFilters, render };
})();

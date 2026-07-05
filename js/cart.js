/* ================================================================
   DAVIER — js/cart.js
   Estado del carrito: agregar, quitar, modificar cantidades.
   Persiste en localStorage.
   ================================================================ */

const Cart = (() => {
  const KEY = "davier_cart";
  let items = [];

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      items = raw ? JSON.parse(raw) : [];
    } catch { items = []; }
  }

  function save() {
    localStorage.setItem(KEY, JSON.stringify(items));
  }

  function add(product, size) {
    const idx = items.findIndex(i => i.id === product.id && i.size === size);
    if (idx > -1) {
      items[idx].qty++;
    } else {
      items.push({
        id: product.id,
        name: product.name,
        icon: product.icon,
        photo: product.photo || null,
        gender: product.gender,
        category: product.category,
        size,
        unitPrice: getFinalPrice(product),
        qty: 1
      });
    }
    save();
    render();
    updateBadge();
    return true;
  }

  function remove(id, size) {
    items = items.filter(i => !(i.id === id && i.size === size));
    save();
    render();
    updateBadge();
  }

  function setQty(id, size, qty) {
    if (qty < 1) { remove(id, size); return; }
    const idx = items.findIndex(i => i.id === id && i.size === size);
    if (idx > -1) { items[idx].qty = qty; save(); render(); updateBadge(); }
  }

  function getItems() { return [...items]; }
  function getCount() { return items.reduce((s, i) => s + i.qty, 0); }
  function getTotal() { return items.reduce((s, i) => s + i.unitPrice * i.qty, 0); }
  function clear() { items = []; save(); render(); updateBadge(); }

  /* ---- Renderizado del drawer ---- */
  function render() {
    const body = document.getElementById("cart-body");
    const footer = document.getElementById("cart-footer");
    const totalEl = document.getElementById("cart-total-price");
    if (!body) return;

    if (items.length === 0) {
      body.innerHTML = `
        <div class="cart-empty">
          <div class="cart-empty-icon">🛒</div>
          <p>Tu carrito está vacío.<br>Explora el catálogo y agrega tus favoritos.</p>
          <button class="btn-primary" onclick="Drawer.closeCart()">Ver catálogo</button>
        </div>`;
      if (footer) footer.hidden = true;
      return;
    }

    body.innerHTML = items.map(item => `
      <div class="cart-item" data-id="${item.id}" data-size="${item.size}">
        <div class="cart-item-icon">
          ${item.photo
            ? `<img src="${item.photo}" alt="${item.name}" style="width:100%;height:100%;object-fit:cover;border-radius:inherit;" onerror="this.style.display='none'"/>`
            : `<svg aria-hidden="true"><use href="#icon-${item.icon}"/></svg>`}
        </div>
        <div class="cart-item-info">
          <p class="cart-item-name">${item.name}</p>
          <p class="cart-item-meta">${getGenderLabel(item.gender)} · ${item.category} · Talla ${item.size}</p>
          <p class="cart-item-price">${formatCOP(item.unitPrice * item.qty)}</p>
        </div>
        <div class="cart-item-controls">
          <div class="qty-control">
            <button class="qty-btn" data-action="dec" data-id="${item.id}" data-size="${item.size}" aria-label="Reducir cantidad">−</button>
            <span class="qty-val">${item.qty}</span>
            <button class="qty-btn" data-action="inc" data-id="${item.id}" data-size="${item.size}" aria-label="Aumentar cantidad">+</button>
          </div>
          <button class="btn-remove" data-id="${item.id}" data-size="${item.size}">Eliminar</button>
        </div>
      </div>
    `).join("");

    if (footer) {
      footer.hidden = false;
      if (totalEl) totalEl.textContent = formatCOP(getTotal());
    }

    /* Delegación de eventos */
    body.querySelectorAll(".qty-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = Number(btn.dataset.id);
        const size = Number(btn.dataset.size);
        const current = items.find(i => i.id === id && i.size === size);
        if (!current) return;
        setQty(id, size, btn.dataset.action === "inc" ? current.qty + 1 : current.qty - 1);
      });
    });
    body.querySelectorAll(".btn-remove").forEach(btn => {
      btn.addEventListener("click", () => remove(Number(btn.dataset.id), Number(btn.dataset.size)));
    });
  }

  /* ---- Badge ---- */
  function updateBadge() {
    const badge = document.getElementById("cart-badge");
    if (!badge) return;
    const count = getCount();
    badge.textContent = count;
    badge.classList.remove("bump");
    requestAnimationFrame(() => badge.classList.add("bump"));
  }

  load();

  return { add, remove, setQty, getItems, getCount, getTotal, clear, render, updateBadge };
})();

/* ---- Drawer abre/cierra ---- */
const Drawer = (() => {
  function openCart() {
    document.getElementById("cart-drawer")?.classList.add("open");
    document.getElementById("cart-overlay")?.classList.add("open");
    document.getElementById("cart-drawer")?.removeAttribute("aria-hidden");
    document.body.style.overflow = "hidden";
    Cart.render();
  }
  function closeCart() {
    document.getElementById("cart-drawer")?.classList.remove("open");
    document.getElementById("cart-overlay")?.classList.remove("open");
    document.getElementById("cart-drawer")?.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }
  return { openCart, closeCart };
})();

/* ================================================================
   DAVIER — js/app.js
   Inicialización general: carrusel hero, header, carrito, checkout.
   ================================================================ */

document.addEventListener("DOMContentLoaded", () => {

  /* -------- Catálogo (se muestra de inmediato; la nube actualiza en segundo plano) -------- */
  Catalog.init();
  Cart.render();
  Cart.updateBadge();

  CloudSync.init().then(() => Catalog.render());

  /* -------- Header: scroll effect -------- */
  const header = document.getElementById("site-header");
  const onScroll = () => header?.classList.toggle("scrolled", window.scrollY > 60);
  window.addEventListener("scroll", onScroll, { passive: true });

  /* -------- Mobile nav toggle -------- */
  const navToggle = document.getElementById("nav-toggle");
  const mainNav   = document.getElementById("main-nav");
  navToggle?.addEventListener("click", () => {
    const open = mainNav?.classList.toggle("open");
    navToggle.classList.toggle("open", open);
    navToggle.setAttribute("aria-expanded", String(open));
  });
  /* Cerrar al hacer clic en un link del nav */
  mainNav?.querySelectorAll("a").forEach(a => a.addEventListener("click", () => {
    mainNav.classList.remove("open");
    navToggle?.classList.remove("open");
    navToggle?.setAttribute("aria-expanded", "false");
  }));

  /* -------- Carrito: botón y overlay -------- */
  document.getElementById("cart-btn")?.addEventListener("click", Drawer.openCart);
  document.getElementById("cart-overlay")?.addEventListener("click", Drawer.closeCart);
  document.getElementById("cart-close")?.addEventListener("click", Drawer.closeCart);

  /* Teclado ESC cierra cart y checkout */
  document.addEventListener("keydown", e => {
    if (e.key !== "Escape") return;
    Drawer.closeCart();
    Checkout.close();
  });

  /* -------- Checkout -------- */
  document.getElementById("btn-checkout")?.addEventListener("click", () => {
    if (Cart.getCount() === 0) return;
    Checkout.open();
  });
  document.getElementById("checkout-overlay")?.addEventListener("click", Checkout.close);

  /* -------- Buscador desde ícono del header -------- */
  document.getElementById("search-toggle")?.addEventListener("click", () => {
    document.getElementById("catalogo")?.scrollIntoView({ behavior: "smooth" });
    setTimeout(() => document.getElementById("search-input")?.focus(), 500);
  });

  /* -------- Newsletter -------- */
  document.getElementById("newsletter-form")?.addEventListener("submit", e => {
    e.preventDefault();
    document.getElementById("nl-success").hidden = false;
    e.target.reset();
  });

  /* -------- Hero carrusel -------- */
  const track  = document.getElementById("hero-track");
  const dots   = document.querySelectorAll(".hero-dot");
  const slides = track?.children.length ?? 3;
  let current  = 0;
  let timer;

  function goTo(index) {
    current = (index + slides) % slides;
    if (track) track.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((d, i) => {
      d.classList.toggle("active", i === current);
      d.setAttribute("aria-selected", String(i === current));
    });
  }

  function startAuto() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    timer = setInterval(() => goTo(current + 1), 5500);
  }
  function resetAuto() { clearInterval(timer); startAuto(); }

  document.getElementById("hero-prev")?.addEventListener("click", () => { goTo(current - 1); resetAuto(); });
  document.getElementById("hero-next")?.addEventListener("click", () => { goTo(current + 1); resetAuto(); });
  dots.forEach((dot, i) => dot.addEventListener("click", () => { goTo(i); resetAuto(); }));

  const hero = document.getElementById("hero");
  hero?.addEventListener("mouseenter", () => clearInterval(timer));
  hero?.addEventListener("mouseleave", startAuto);

  /* Touch swipe en hero */
  let touchX = 0;
  hero?.addEventListener("touchstart", e => { touchX = e.touches[0].clientX; }, { passive: true });
  hero?.addEventListener("touchend", e => {
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 40) { dx < 0 ? goTo(current + 1) : goTo(current - 1); resetAuto(); }
  });

  startAuto();
});

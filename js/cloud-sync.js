/* ================================================================
   DAVIER — js/cloud-sync.js
   Trae productos y banners guardados desde el panel admin (Firestore).
   Si todavía no hay nada guardado en la nube, deja los datos de
   ejemplo tal como están (no rompe nada).
   ================================================================ */

const CloudSync = (() => {

  function syncProducts() {
    return db.collection("davier").doc("products").get()
      .then(doc => {
        if (doc.exists && Array.isArray(doc.data().list) && doc.data().list.length) {
          const cloudList = doc.data().list;
          PRODUCTS.length = 0;
          cloudList.forEach(p => PRODUCTS.push(p));
        }
      })
      .catch(() => { /* sin conexión o sin datos: se queda con los de ejemplo */ });
  }

  function syncBanners() {
    return db.collection("davier").doc("banners").get()
      .then(doc => {
        if (doc.exists && Array.isArray(doc.data().list) && doc.data().list.length) {
          applyBanners(doc.data().list);
        }
      })
      .catch(() => { /* se queda con los banners de ejemplo */ });
  }

  function applyBanners(banners) {
    const slides = document.querySelectorAll(".hero-slide");
    banners.slice(0, slides.length).forEach((banner, i) => {
      const slide = slides[i];
      if (!slide || !banner) return;

      const tagEl = slide.querySelector(".hero-tag");
      const titleEl = slide.querySelector(".hero-title");
      const subEl = slide.querySelector(".hero-sub");
      const btnEl = slide.querySelector(".btn-hero");
      const badgeEl = slide.querySelector(".price-bubble");

      if (tagEl) tagEl.textContent = banner.tag || tagEl.textContent;
      if (titleEl) titleEl.textContent = banner.title || titleEl.textContent;
      if (subEl) subEl.textContent = banner.subtitle || subEl.textContent;
      if (btnEl) {
        // conserva el ícono de flecha, solo cambia el texto
        const svg = btnEl.querySelector("svg");
        btnEl.textContent = (banner.btn || "Ver más") + " ";
        if (svg) btnEl.appendChild(svg);
      }
      if (badgeEl) badgeEl.textContent = banner.badge || badgeEl.textContent;

      slide.style.display = banner.active === false ? "none" : "";
    });
  }

  function init() {
    return Promise.all([syncProducts(), syncBanners()]);
  }

  return { init };
})();

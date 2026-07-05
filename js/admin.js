/* ================================================================
   DAVIER — js/admin.js
   Lógica del panel de administración
   ================================================================ */

/* ---- Auth (Firebase) ---- */
const Auth = (() => {
  function login(email, pass) {
    return auth.signInWithEmailAndPassword(email, pass)
      .then(() => true)
      .catch(() => false);
  }

  function logout() {
    auth.signOut().then(() => location.reload());
  }

  return { login, logout };
})();

/* ---- Storage de datos admin (Firestore) ---- */
const AdminData = (() => {
  let cache = { products: null, banners: null };

  function withTimeout(promise, ms) {
    return Promise.race([
      promise,
      new Promise(resolve => setTimeout(resolve, ms))
    ]);
  }

  function init() {
    const productsRef = db.collection("davier").doc("products");
    const bannersRef = db.collection("davier").doc("banners");

    return Promise.all([
      withTimeout(productsRef.get(), 6000).then(doc => {
        cache.products = (doc && doc.exists && doc.data().list) ? doc.data().list : [...PRODUCTS];
      }).catch(() => { cache.products = [...PRODUCTS]; }),
      withTimeout(bannersRef.get(), 6000).then(doc => {
        cache.banners = (doc && doc.exists && doc.data().list) ? doc.data().list : getDefaultBanners();
      }).catch(() => { cache.banners = getDefaultBanners(); })
    ]);
  }

  function getProducts() {
    return cache.products || [...PRODUCTS];
  }

  function saveProducts(arr) {
    cache.products = arr;
    db.collection("davier").doc("products").set({ list: arr })
      .catch(err => alert("No se pudo guardar en la nube: " + err.message));
  }

  function getBanners() {
    return cache.banners || getDefaultBanners();
  }

  function saveBanners(arr) {
    cache.banners = arr;
    db.collection("davier").doc("banners").set({ list: arr })
      .catch(err => alert("No se pudo guardar en la nube: " + err.message));
  }

  function getDefaultBanners() {
    return [
      { id: 1, tag: "🔥 Oferta Flash", title: "Hasta 40% de descuento", subtitle: "En colección urbana seleccionada. Solo por tiempo limitado.", btn: "Ver ofertas", icon: "sneaker", badge: "-40%", theme: "lime", active: true },
      { id: 2, tag: "✨ Nueva temporada", title: "Primavera 2025 Llegó", subtitle: "Sandalias, mules y mocasines frescos para la nueva temporada.", btn: "Explorar", icon: "sandal", badge: "NUEVO", theme: "pink", active: true },
      { id: 3, tag: "🚚 Beneficio exclusivo", title: "Envío gratis sin mínimo", subtitle: "Esta semana: envío gratis a todo el país. Compra hoy y recibe en 48h.", btn: "Comprar ahora", icon: "boot", badge: "GRATIS", theme: "cyan", active: true }
    ];
  }

  return { init, getProducts, saveProducts, getBanners, saveBanners };
})();

/* ---- Init ---- */
document.addEventListener("DOMContentLoaded", () => {
  auth.onAuthStateChanged(user => {
    if (user) {
      AdminData.init().then(showAdminPanel);
    } else {
      showLoginScreen();
    }
  });
});

function showLoginScreen() {
  document.getElementById("login-screen").classList.remove("hidden");
  document.getElementById("admin-panel").hidden = true;

  document.getElementById("login-form")?.addEventListener("submit", e => {
    e.preventDefault();
    const user = document.getElementById("adm-user").value.trim();
    const pass = document.getElementById("adm-pass").value.trim();
    const error = document.getElementById("login-error");
    const btn = document.getElementById("btn-login-submit");

    btn.disabled = true;
    btn.textContent = "Ingresando...";

    Auth.login(user, pass).then(ok => {
      if (ok) {
        location.reload();
      } else {
        error.hidden = false;
        btn.disabled = false;
        btn.textContent = "Ingresar";
        setTimeout(() => { error.hidden = true; }, 3000);
      }
    });
  });
}

function showAdminPanel() {
  document.getElementById("login-screen").classList.add("hidden");
  document.getElementById("admin-panel").hidden = false;

  // Navigation
  document.querySelectorAll(".adm-nav-item").forEach(btn => {
    btn.addEventListener("click", () => {
      const section = btn.dataset.section;
      showSection(section);
    });
  });

  // Logout
  document.getElementById("btn-logout")?.addEventListener("click", () => {
    if (confirm("¿Cerrar sesión?")) Auth.logout();
  });

  // Mostrar dashboard por defecto
  showSection("dashboard");
}

function showSection(section) {
  // Actualizar nav activo
  document.querySelectorAll(".adm-nav-item").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.section === section);
  });

  // Actualizar secciones visibles
  document.querySelectorAll(".adm-section").forEach(sec => {
    const isActive = sec.id.includes(section);
    sec.hidden = !isActive;
    sec.classList.toggle("active", isActive);
  });

  // Actualizar título
  const titles = {
    dashboard: "Dashboard",
    products: "Gestión de Productos",
    banners: "Banners y Ofertas",
    orders: "Órdenes",
    settings: "Configuración"
  };
  document.getElementById("adm-page-title").textContent = titles[section] || section;

  // Init sección
  if (section === "dashboard") initDashboard();
  if (section === "products") initProducts();
  if (section === "banners") initBanners();
  if (section === "orders") initOrders();
  if (section === "settings") initSettings();
}

/* ================================================================
   DASHBOARD
   ================================================================ */
function initDashboard() {
  const products = AdminData.getProducts();
  document.getElementById("dash-product-count").textContent = products.length;

  const tbody = document.getElementById("recent-orders-tbody");
  const revenueEl = document.getElementById("dash-revenue");
  const ordersCountEl = document.getElementById("dash-orders-count");

  if (typeof db === "undefined" || !db) {
    if (tbody) tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:var(--text-muted)">Sin conexión a la nube.</td></tr>`;
    return;
  }

  db.collection("orders").orderBy("date", "desc").limit(50).get().then(snap => {
    const orders = snap.docs.map(d => d.data());
    const now = new Date();
    const thisMonth = orders.filter(o => {
      const d = new Date(o.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const monthRevenue = thisMonth.reduce((s, o) => s + (o.total || 0), 0);

    if (revenueEl) revenueEl.textContent = formatCOP(monthRevenue);
    if (ordersCountEl) ordersCountEl.textContent = orders.length;

    if (tbody) {
      if (!orders.length) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:var(--text-muted)">Todavía no hay pedidos.</td></tr>`;
      } else {
        tbody.innerHTML = orders.slice(0, 5).map(o => `
          <tr>
            <td><code>${o.orderNumber}</code></td>
            <td>${o.customer?.nombre || ""} ${o.customer?.apellido || ""}</td>
            <td>${o.items?.[0]?.name || "-"}${o.items?.length > 1 ? ` +${o.items.length - 1}` : ""}</td>
            <td><strong>${formatCOP(o.total || 0)}</strong></td>
            <td><span class="status-badge status-${(o.status || "procesando").toLowerCase().replace(" ","-")}">${o.status || "Procesando"}</span></td>
          </tr>
        `).join("");
      }
    }
  }).catch(err => {
    if (tbody) tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:var(--text-muted)">Error al cargar pedidos.</td></tr>`;
    console.warn(err);
  });

  // Top productos (por ahora, catálogo actual — las ventas reales se podrán calcular con más pedidos)
  const topList = document.getElementById("top-products-list");
  if (topList) {
    const top = products.slice(0, 5);
    topList.innerHTML = top.map(p => `
      <div class="product-item">
        <span><strong>${p.name}</strong></span>
        <span>${formatCOP(p.price)}</span>
      </div>
    `).join("");
  }
}

/* ================================================================
   PRODUCTOS
   ================================================================ */
function initProducts() {
  const products = AdminData.getProducts();
  renderProductsTable(products);

  document.getElementById("btn-new-product")?.addEventListener("click", showProductForm);
  document.getElementById("btn-cancel-product")?.addEventListener("click", hideProductForm);
  document.getElementById("btn-save-product")?.addEventListener("click", saveProduct);

  // Preview de foto
  document.getElementById("pf-photo")?.addEventListener("change", (e) => {
    const file = e.target.files[0];
    const preview = document.getElementById("pf-photo-preview");
    const img = document.getElementById("pf-photo-img");

    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        img.src = event.target.result;
        preview.style.display = "block";
      };
      reader.readAsDataURL(file);
    } else {
      preview.style.display = "none";
    }
  });
}

function renderProductsTable(products) {
  const tbody = document.getElementById("products-tbody");
  if (!tbody) return;
  tbody.innerHTML = products.map(p => `
    <tr>
      <td>${p.id}</td>
      <td>${p.name}</td>
      <td>${getGenderLabel(p.gender)}</td>
      <td>${p.category}</td>
      <td>${formatCOP(p.price)}</td>
      <td>${p.discount}%</td>
      <td>${p.sizes.length} tallas</td>
      <td>${p.isNew ? "✓" : "—"}</td>
      <td>
        <button class="btn-adm-sm" onclick="editProduct(${p.id})">Editar</button>
        <button class="btn-adm-sm" onclick="deleteProduct(${p.id})">Eliminar</button>
      </td>
    </tr>
  `).join("");
}

function showProductForm() {
  document.getElementById("product-form-wrap").hidden = false;
  document.getElementById("product-form-title").textContent = "Nuevo producto";
  document.getElementById("pf-id").value = "";
  document.getElementById("product-form").reset();
}

function hideProductForm() {
  document.getElementById("product-form-wrap").hidden = true;
  document.getElementById("product-form").reset();
}

function saveProduct() {
  const id = document.getElementById("pf-id").value;
  const name = document.getElementById("pf-name").value.trim();
  const category = document.getElementById("pf-category").value;
  const gender = document.getElementById("pf-gender").value;
  const icon = document.getElementById("pf-icon").value;
  const price = Number(document.getElementById("pf-price").value);
  const discount = Number(document.getElementById("pf-discount").value);
  const sizesStr = document.getElementById("pf-sizes").value.trim();
  const isNew = document.getElementById("pf-isnew").checked;
  const photoFile = document.getElementById("pf-photo").files[0];

  if (!name || !price || !sizesStr) { alert("Completa los campos requeridos"); return; }

  const sizes = sizesStr.split(",").map(s => Number(s.trim())).filter(s => !isNaN(s));
  if (sizes.length === 0) { alert("Ingresa al menos una talla válida"); return; }

  let products = AdminData.getProducts();

  // Función para guardar el producto
  const saveProductData = (photoUrl) => {
    if (id) {
      // Editar
      const idx = products.findIndex(p => p.id == id);
      if (idx > -1) {
        const updated = { ...products[idx], name, category, gender, icon, price, discount, sizes, isNew };
        if (photoUrl) updated.photo = photoUrl;
        products[idx] = updated;
      }
    } else {
      // Nuevo
      const newId = Math.max(...products.map(p => p.id), 0) + 1;
      const newProduct = { id: newId, name, category, gender, icon, price, discount, sizes, isNew };
      if (photoUrl) newProduct.photo = photoUrl;
      products.push(newProduct);
    }

    AdminData.saveProducts(products);
    renderProductsTable(products);
    hideProductForm();
    alert("✓ Producto guardado");
  };

  // Si hay foto, subirla a Firebase Storage
  if (photoFile) {
    const storage = firebase.storage();
    const fileName = `productos/${Date.now()}_${photoFile.name}`;
    const fileRef = storage.ref(fileName);

    fileRef.put(photoFile)
      .then(snapshot => snapshot.ref.getDownloadURL())
      .then(url => saveProductData(url))
      .catch(err => {
        console.error("Error al subir foto:", err);
        alert("Error al subir la foto. Intenta de nuevo.");
      });
  } else {
    // Sin foto, guardar el producto normalmente
    saveProductData(null);
  }
}

function editProduct(id) {
  const products = AdminData.getProducts();
  const p = products.find(pr => pr.id == id);
  if (!p) return;

  document.getElementById("pf-id").value = p.id;
  document.getElementById("pf-name").value = p.name;
  document.getElementById("pf-category").value = p.category;
  document.getElementById("pf-gender").value = p.gender;
  document.getElementById("pf-icon").value = p.icon;
  document.getElementById("pf-price").value = p.price;
  document.getElementById("pf-discount").value = p.discount;
  document.getElementById("pf-sizes").value = p.sizes.join(", ");
  document.getElementById("pf-isnew").checked = p.isNew;
  document.getElementById("product-form-title").textContent = "Editar producto";
  document.getElementById("product-form-wrap").hidden = false;

  window.scrollTo(0, 0);
}

function deleteProduct(id) {
  if (!confirm("¿Eliminar este producto?")) return;
  let products = AdminData.getProducts();
  products = products.filter(p => p.id != id);
  AdminData.saveProducts(products);
  renderProductsTable(products);
  alert("✓ Producto eliminado");
}

/* ================================================================
   BANNERS
   ================================================================ */
function initBanners() {
  const banners = AdminData.getBanners();
  renderBannersTable(banners);

  document.getElementById("btn-new-banner")?.addEventListener("click", showBannerForm);
  document.getElementById("btn-cancel-banner")?.addEventListener("click", hideBannerForm);
  document.getElementById("btn-save-banner")?.addEventListener("click", saveBanner);
}

function renderBannersTable(banners) {
  const tbody = document.getElementById("banners-tbody");
  if (!tbody) return;
  tbody.innerHTML = banners.map(b => `
    <tr>
      <td>${b.tag}</td>
      <td>${b.title}</td>
      <td>${b.badge}</td>
      <td>${b.theme}</td>
      <td><span class="status-badge ${b.active ? "status-delivered" : "status-pending"}">${b.active ? "Activo" : "Inactivo"}</span></td>
      <td>
        <button class="btn-adm-sm" onclick="editBanner(${b.id})">Editar</button>
        <button class="btn-adm-sm" onclick="deleteBanner(${b.id})">Eliminar</button>
      </td>
    </tr>
  `).join("");
}

function showBannerForm() {
  document.getElementById("banner-form-wrap").hidden = false;
  document.getElementById("banner-form-title").textContent = "Nuevo banner";
  document.getElementById("bf-id").value = "";
  document.getElementById("bf-tag").value = "";
  document.getElementById("bf-title").value = "";
  document.getElementById("bf-subtitle").value = "";
  document.getElementById("bf-btn").value = "";
  document.getElementById("bf-badge").value = "";
  document.getElementById("bf-active").checked = true;
}

function hideBannerForm() {
  document.getElementById("banner-form-wrap").hidden = true;
}

function saveBanner() {
  const id = document.getElementById("bf-id").value;
  const tag = document.getElementById("bf-tag").value.trim();
  const title = document.getElementById("bf-title").value.trim();
  const subtitle = document.getElementById("bf-subtitle").value.trim();
  const btn = document.getElementById("bf-btn").value.trim();
  const icon = document.getElementById("bf-icon").value;
  const badge = document.getElementById("bf-badge").value.trim();
  const theme = document.getElementById("bf-theme").value;
  const active = document.getElementById("bf-active").checked;

  if (!tag || !title) { alert("Completa los campos requeridos"); return; }

  let banners = AdminData.getBanners();

  if (id) {
    const idx = banners.findIndex(b => b.id == id);
    if (idx > -1) {
      banners[idx] = { ...banners[idx], tag, title, subtitle, btn, icon, badge, theme, active };
    }
  } else {
    const newId = Math.max(...banners.map(b => b.id), 0) + 1;
    banners.push({ id: newId, tag, title, subtitle, btn, icon, badge, theme, active });
  }

  AdminData.saveBanners(banners);
  renderBannersTable(banners);
  hideBannerForm();
  alert("✓ Banner guardado");
}

function editBanner(id) {
  const banners = AdminData.getBanners();
  const b = banners.find(bn => bn.id == id);
  if (!b) return;

  document.getElementById("bf-id").value = b.id;
  document.getElementById("bf-tag").value = b.tag;
  document.getElementById("bf-title").value = b.title;
  document.getElementById("bf-subtitle").value = b.subtitle;
  document.getElementById("bf-btn").value = b.btn;
  document.getElementById("bf-icon").value = b.icon;
  document.getElementById("bf-badge").value = b.badge;
  document.getElementById("bf-theme").value = b.theme;
  document.getElementById("bf-active").checked = b.active;
  document.getElementById("banner-form-title").textContent = "Editar banner";
  document.getElementById("banner-form-wrap").hidden = false;

  window.scrollTo(0, 0);
}

function deleteBanner(id) {
  if (!confirm("¿Eliminar este banner?")) return;
  let banners = AdminData.getBanners();
  banners = banners.filter(b => b.id != id);
  AdminData.saveBanners(banners);
  renderBannersTable(banners);
  alert("✓ Banner eliminado");
}

/* ================================================================
   ÓRDENES
   ================================================================ */
function initOrders() {
  const tbody = document.getElementById("orders-tbody");
  if (!tbody) return;
  tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:var(--text-muted)">Cargando pedidos...</td></tr>`;

  if (typeof db === "undefined" || !db) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:var(--text-muted)">No se pudo conectar con la nube.</td></tr>`;
    return;
  }

  db.collection("orders").orderBy("date", "desc").get()
    .then(snap => {
      if (snap.empty) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:var(--text-muted)">Todavía no hay pedidos.</td></tr>`;
        return;
      }
      const statusOptions = ["Procesando", "En tránsito", "Entregado", "Cancelado"];
      tbody.innerHTML = snap.docs.map(doc => {
        const o = doc.data();
        const fecha = o.date ? new Date(o.date).toLocaleDateString("es-CO") : "-";
        const cliente = o.customer ? `${o.customer.nombre} ${o.customer.apellido}` : "-";
        const ciudad = o.customer?.ciudad || "-";
        const statusClass = (o.status || "Procesando").toLowerCase().replace(" ", "-").replace("á","a").replace("í","i");
        return `
          <tr>
            <td><code>${o.orderNumber || doc.id}</code></td>
            <td>${fecha}</td>
            <td>${cliente}</td>
            <td>${ciudad}</td>
            <td>${formatCOP(o.total || 0)}</td>
            <td>
              <select class="order-status-select" data-id="${doc.id}">
                ${statusOptions.map(s => `<option value="${s}" ${o.status === s ? "selected" : ""}>${s}</option>`).join("")}
              </select>
            </td>
            <td><button class="btn-adm-sm btn-view-order" data-id="${doc.id}">Ver detalles</button></td>
          </tr>
        `;
      }).join("");

      tbody.querySelectorAll(".order-status-select").forEach(sel => {
        sel.addEventListener("change", () => {
          db.collection("orders").doc(sel.dataset.id).update({ status: sel.value })
            .catch(err => alert("No se pudo actualizar el estado: " + err.message));
        });
      });

      tbody.querySelectorAll(".btn-view-order").forEach(btn => {
        btn.addEventListener("click", () => {
          const doc = snap.docs.find(d => d.id === btn.dataset.id);
          if (doc) showOrderDetail(doc.data());
        });
      });
    })
    .catch(err => {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:var(--text-muted)">Error al cargar pedidos.</td></tr>`;
      console.warn(err);
    });
}

function showOrderDetail(o) {
  const itemsList = o.items.map(it => `${it.qty}x ${it.name} (Talla ${it.size}) — ${formatCOP(it.unitPrice * it.qty)}`).join("\n");
  alert(
    `Pedido ${o.orderNumber}\n\n` +
    `Cliente: ${o.customer.nombre} ${o.customer.apellido}\n` +
    `Email: ${o.customer.email}\n` +
    `Teléfono: ${o.customer.telefono}\n` +
    `Dirección: ${o.customer.direccion}, ${o.customer.ciudad}, ${o.customer.departamento}\n\n` +
    `Productos:\n${itemsList}\n\n` +
    `Total: ${formatCOP(o.total)}`
  );
}

/* ================================================================
   CONFIGURACIÓN
   ================================================================ */
function initSettings() {
  document.getElementById("btn-save-settings")?.addEventListener("click", () => {
    document.getElementById("settings-saved").classList.add("show");
    setTimeout(() => document.getElementById("settings-saved").classList.remove("show"), 2000);
  });

  document.getElementById("btn-change-pass")?.addEventListener("click", () => {
    const oldPass = document.getElementById("cfg-old-pass").value.trim();
    const newPass = document.getElementById("cfg-new-pass").value.trim();
    const user = auth.currentUser;

    if (newPass.length < 6) { alert("La nueva contraseña debe tener al menos 6 caracteres"); return; }
    if (!user) { alert("Sesión no válida, vuelve a iniciar sesión."); return; }

    const credential = firebase.auth.EmailAuthProvider.credential(user.email, oldPass);
    user.reauthenticateWithCredential(credential)
      .then(() => user.updatePassword(newPass))
      .then(() => {
        document.getElementById("pass-changed").classList.add("show");
        setTimeout(() => {
          document.getElementById("pass-changed").classList.remove("show");
          document.getElementById("cfg-old-pass").value = "";
          document.getElementById("cfg-new-pass").value = "";
        }, 2000);
      })
      .catch(() => alert("Contraseña actual incorrecta"));
  });
}

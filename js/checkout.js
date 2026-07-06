/* ================================================================
   DAVIER — js/checkout.js
   Pasarela de pago en 3 pasos:
     1. Datos personales y envío
     2. Método y datos de pago
     3. Confirmación y éxito
   ================================================================ */

const Checkout = (() => {
  let currentStep = 1;
  const TOTAL_STEPS = 3;
  let payMethod = "card";
  let customerData = {};
  let currentOrder = null;

  /* ---- Abrir / cerrar ---- */
  function open() {
    Drawer.closeCart();
    const modal = document.getElementById("checkout-modal");
    const overlay = document.getElementById("checkout-overlay");
    if (!modal || !overlay) return;
    currentStep = 1;
    renderModal();
    modal.classList.add("open");
    overlay.classList.add("open");
    modal.removeAttribute("aria-hidden");
    overlay.removeAttribute("aria-hidden");
    document.body.style.overflow = "hidden";
  }

  function close() {
    document.getElementById("checkout-modal")?.classList.remove("open");
    document.getElementById("checkout-overlay")?.classList.remove("open");
    document.getElementById("checkout-modal")?.setAttribute("aria-hidden", "true");
    document.getElementById("checkout-overlay")?.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  /* ---- Resumen de productos (sidebar) ---- */
  function summaryHTML() {
    const items = Cart.getItems();
    const subtotal = Cart.getTotal();
    const shipping = 0;
    const total = subtotal + shipping;

    return `
      <div class="co-summary">
        <p class="co-sum-title">Resumen del pedido</p>
        <div class="co-sum-items">
          ${items.map(item => `
            <div class="co-sum-item">
              <div class="co-sum-thumb">
                ${item.photo
                  ? `<img src="${item.photo}" alt="${item.name}" style="width:100%;height:100%;object-fit:cover;border-radius:inherit;" onerror="this.style.display='none'"/>`
                  : `<svg aria-hidden="true"><use href="#icon-${item.icon}"/></svg>`}
              </div>
              <div class="co-sum-info">
                <strong>${item.name}</strong>
                <span>T. ${item.size} × ${item.qty}</span>
              </div>
              <span class="co-sum-price">${formatCOP(item.unitPrice * item.qty)}</span>
            </div>
          `).join("")}
        </div>
        <hr class="co-sum-sep">
        <div class="co-sum-row"><span>Subtotal</span><span>${formatCOP(subtotal)}</span></div>
        <div class="co-sum-row"><span>Envío</span><span style="color:var(--accent3)">Gratis 🎉</span></div>
        <hr class="co-sum-sep">
        <div class="co-sum-total"><span>Total</span><span>${formatCOP(total)}</span></div>
      </div>
    `;
  }

  /* ---- Step 1: Datos de envío ---- */
  function step1HTML() {
    return `
      <div class="co-form-section">
        <p class="co-form-title">Datos de envío</p>
        <div class="form-row">
          <div class="form-group">
            <label for="co-nombre">Nombre</label>
            <input type="text" id="co-nombre" placeholder="Ej. María" autocomplete="given-name">
            <span class="field-error" id="err-nombre">Campo requerido</span>
          </div>
          <div class="form-group">
            <label for="co-apellido">Apellido</label>
            <input type="text" id="co-apellido" placeholder="Ej. García" autocomplete="family-name">
            <span class="field-error" id="err-apellido">Campo requerido</span>
          </div>
        </div>
        <div class="form-row single">
          <div class="form-group">
            <label for="co-email">Correo electrónico</label>
            <input type="email" id="co-email" placeholder="tu@correo.com" autocomplete="email">
            <span class="field-error" id="err-email">Ingresa un correo válido</span>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="co-tel">Teléfono</label>
            <input type="tel" id="co-tel" placeholder="3XX XXX XXXX" autocomplete="tel">
            <span class="field-error" id="err-tel">Campo requerido</span>
          </div>
          <div class="form-group">
            <label for="co-ciudad">Ciudad</label>
            <input type="text" id="co-ciudad" placeholder="Ej. Barranquilla" autocomplete="address-level2">
            <span class="field-error" id="err-ciudad">Campo requerido</span>
          </div>
        </div>
        <div class="form-row single">
          <div class="form-group">
            <label for="co-dir">Dirección</label>
            <input type="text" id="co-dir" placeholder="Ej. Cra 53 # 72-15 Apto 401" autocomplete="street-address">
            <span class="field-error" id="err-dir">Campo requerido</span>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="co-dept">Departamento</label>
            <select id="co-dept">
              <option value="">Seleccionar…</option>
              <option>Atlántico</option><option>Bogotá D.C.</option><option>Antioquia</option>
              <option>Valle del Cauca</option><option>Cundinamarca</option><option>Santander</option>
              <option>Bolívar</option><option>Córdoba</option><option>Nariño</option><option>Otro</option>
            </select>
            <span class="field-error" id="err-dept">Selecciona un departamento</span>
          </div>
          <div class="form-group">
            <label for="co-cp">Código postal</label>
            <input type="text" id="co-cp" placeholder="Ej. 080001" maxlength="7" autocomplete="postal-code">
          </div>
        </div>
      </div>
      ${summaryHTML()}
    `;
  }

  function validateStep1() {
    let ok = true;
    const fields = [
      ["co-nombre","err-nombre", v => v.length >= 2],
      ["co-apellido","err-apellido", v => v.length >= 2],
      ["co-email","err-email", v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)],
      ["co-tel","err-tel", v => v.replace(/\D/g,"").length >= 7],
      ["co-ciudad","err-ciudad", v => v.length >= 2],
      ["co-dir","err-dir", v => v.length >= 5],
      ["co-dept","err-dept", v => v !== ""],
    ];
    fields.forEach(([inputId, errId, validator]) => {
      const input = document.getElementById(inputId);
      const err = document.getElementById(errId);
      if (!input) return;
      const valid = validator(input.value.trim());
      input.classList.toggle("error", !valid);
      if (err) err.classList.toggle("show", !valid);
      if (!valid) ok = false;
    });
    return ok;
  }

  /* ---- Step 2: Pago ---- */
  function step2HTML() {
    return `
      <div class="co-form-section">
        <p class="co-form-title">Método de pago</p>

        <div class="payment-methods">
          <button class="pay-method ${payMethod==="card"?"active":""}" data-pay="card">
            <svg viewBox="0 0 24 24"><rect x="1" y="4" width="22" height="16" rx="2"/><path d="M1 10h22"/></svg>
            Tarjeta
          </button>
          <button class="pay-method ${payMethod==="pse"?"active":""}" data-pay="pse">
            <svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            PSE
          </button>
          <button class="pay-method ${payMethod==="efecty"?"active":""}" data-pay="efecty">
            <svg viewBox="0 0 24 24"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="3"/></svg>
            Efecty
          </button>
        </div>

        <div id="pay-card-section" style="${payMethod!=="card"?"display:none":""}">
          <div class="card-visual-wrap">
            <div class="card-visual">
              <div class="card-chip"></div>
              <div class="card-number" id="card-display-num">•••• •••• •••• ••••</div>
              <div class="card-bottom">
                <div>
                  <div class="card-label">Titular</div>
                  <div class="card-val" id="card-display-name">NOMBRE APELLIDO</div>
                </div>
                <div>
                  <div class="card-label">Vence</div>
                  <div class="card-val" id="card-display-exp">MM/AA</div>
                </div>
                <div class="card-brand" id="card-display-brand">VISA</div>
              </div>
            </div>
          </div>

          <div class="form-row single">
            <div class="form-group">
              <label for="co-cardnum">Número de tarjeta</label>
              <input type="text" id="co-cardnum" placeholder="1234 5678 9012 3456" maxlength="19" inputmode="numeric">
              <span class="field-error" id="err-cardnum">Número inválido (16 dígitos)</span>
            </div>
          </div>
          <div class="form-row single">
            <div class="form-group">
              <label for="co-cardname">Nombre en la tarjeta</label>
              <input type="text" id="co-cardname" placeholder="Ej. MARIA GARCIA" autocomplete="cc-name" style="text-transform:uppercase">
              <span class="field-error" id="err-cardname">Campo requerido</span>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="co-cardexp">Fecha de vencimiento</label>
              <input type="text" id="co-cardexp" placeholder="MM/AA" maxlength="5" inputmode="numeric">
              <span class="field-error" id="err-cardexp">Fecha inválida</span>
            </div>
            <div class="form-group">
              <label for="co-cardcvv">CVV</label>
              <input type="text" id="co-cardcvv" placeholder="•••" maxlength="4" inputmode="numeric">
              <span class="field-error" id="err-cardcvv">CVV inválido</span>
            </div>
          </div>
        </div>

        <div id="pay-pse-section" style="${payMethod!=="pse"?"display:none":""}">
          <div class="form-row single">
            <div class="form-group">
              <label for="co-banco">Banco</label>
              <select id="co-banco">
                <option value="">Seleccionar banco…</option>
                <option>Bancolombia</option><option>Davivienda</option><option>Banco de Bogotá</option>
                <option>BBVA Colombia</option><option>Nequi</option><option>Daviplata</option>
                <option>Banco Popular</option><option>Banco Agrario</option>
              </select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="co-doctype">Tipo de documento</label>
              <select id="co-doctype">
                <option>Cédula de ciudadanía</option>
                <option>NIT</option><option>Pasaporte</option>
              </select>
            </div>
            <div class="form-group">
              <label for="co-docnum">Número de documento</label>
              <input type="text" id="co-docnum" placeholder="Ej. 1234567890" inputmode="numeric">
            </div>
          </div>
          <p style="font-size:.82rem;color:var(--text-muted);margin-top:.75rem;">
            Serás redirigido a tu banco para completar el pago de forma segura.
          </p>
        </div>

        <div id="pay-efecty-section" style="${payMethod!=="efecty"?"display:none":""}">
          <div style="background:var(--bg-3);border:1px solid var(--border);border-radius:var(--r-md);padding:1.25rem;margin-top:.5rem;">
            <p style="font-weight:700;margin-bottom:.5rem;">Instrucciones de pago Efecty</p>
            <ol style="padding-left:1.2rem;display:flex;flex-direction:column;gap:.4rem;font-size:.88rem;color:var(--text-muted);">
              <li>Recibirás un código de pago por correo al confirmar el pedido.</li>
              <li>Dirígete a cualquier punto Efecty en Colombia.</li>
              <li>Informa el código y paga el monto indicado.</li>
              <li>Conserva el comprobante; tu pedido se enviará al confirmar el pago.</li>
            </ol>
          </div>
        </div>
      </div>
      ${summaryHTML()}
    `;
  }

  function validateStep2() {
    if (payMethod !== "card") return true;
    let ok = true;
    const cardNum = document.getElementById("co-cardnum")?.value.replace(/\s/g,"") || "";
    const cardName = document.getElementById("co-cardname")?.value.trim() || "";
    const cardExp = document.getElementById("co-cardexp")?.value.trim() || "";
    const cardCvv = document.getElementById("co-cardcvv")?.value.trim() || "";

    const fields = [
      ["co-cardnum","err-cardnum", cardNum.length >= 13 && cardNum.length <= 16 && /^\d+$/.test(cardNum)],
      ["co-cardname","err-cardname", cardName.length >= 3],
      ["co-cardexp","err-cardexp", /^\d{2}\/\d{2}$/.test(cardExp)],
      ["co-cardcvv","err-cardcvv", /^\d{3,4}$/.test(cardCvv)],
    ];
    fields.forEach(([inputId, errId, valid]) => {
      const input = document.getElementById(inputId);
      const err = document.getElementById(errId);
      if (!input) return;
      input.classList.toggle("error", !valid);
      if (err) err.classList.toggle("show", !valid);
      if (!valid) ok = false;
    });
    return ok;
  }

  /* ---- Step 3: Confirmación ---- */
  function step3HTML() {
    const order = currentOrder?.orderNumber ? "#" + currentOrder.orderNumber : "#DVR-000000";
    return `
      <div class="co-success">
        <div class="co-success-icon">🎉</div>
        <h2>¡Pedido confirmado!</h2>
        <p>Gracias por comprar en DAVIER. Recibirás un correo con los detalles de tu pedido en breve.</p>
        <p class="co-order-num">Número de orden: ${order}</p>
        <p style="font-size:.85rem;color:var(--text-muted);">Entrega estimada: 2 a 5 días hábiles</p>
        <button class="btn-primary" id="btn-download-invoice" style="margin-top:.5rem;">Descargar factura</button>
        <button class="btn-co-back" onclick="Checkout.close()" style="margin-top:.5rem;">Seguir comprando</button>
      </div>
    `;
  }

  /* ---- Render completo del modal ---- */
  function renderModal() {
    const modal = document.getElementById("checkout-modal");
    if (!modal) return;

    const stepLabels = ["Envío", "Pago", "Confirmación"];
    const stepsHTML = stepLabels.map((label, i) => {
      const num = i + 1;
      let cls = "";
      if (num < currentStep) cls = "done";
      else if (num === currentStep) cls = "active";
      const numContent = num < currentStep ? "✓" : num;
      return `<div class="co-step ${cls}"><span class="co-step-num">${numContent}</span>${label}</div>`;
    }).join("");

    const bodyContent = currentStep === 1 ? step1HTML()
                      : currentStep === 2 ? step2HTML()
                      : step3HTML();

    const navHTML = currentStep < TOTAL_STEPS ? `
      <div class="co-nav">
        ${currentStep > 1 ? `<button class="btn-co-back" id="co-back"><svg viewBox="0 0 24 24"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>Atrás</button>` : `<span></span>`}
        <button class="btn-co-next" id="co-next">
          ${currentStep === 1 ? "Continuar al pago →" : "Confirmar pedido →"}
        </button>
      </div>
    ` : "";

    modal.innerHTML = `
      <div class="co-header">
        <h2>${currentStep < TOTAL_STEPS ? "Pagar pedido" : "Listo 🎉"}</h2>
        <div class="co-header-right">
          <span class="co-secure">
            <svg viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
            Pago seguro
          </span>
          <button class="btn-co-close" id="co-close-btn" aria-label="Cerrar">
            <svg viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
      </div>
      <div class="co-steps">${stepsHTML}</div>
      <div class="co-body">${bodyContent}</div>
      ${navHTML}
    `;

    bindModalEvents();
  }

  function bindModalEvents() {
    document.getElementById("co-close-btn")?.addEventListener("click", close);
    document.getElementById("co-next")?.addEventListener("click", nextStep);
    document.getElementById("co-back")?.addEventListener("click", prevStep);
    document.getElementById("btn-download-invoice")?.addEventListener("click", downloadInvoice);

    /* Métodos de pago */
    document.querySelectorAll(".pay-method").forEach(btn => {
      btn.addEventListener("click", () => {
        payMethod = btn.dataset.pay;
        document.querySelectorAll(".pay-method").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        ["card","pse","efecty"].forEach(m => {
          const sec = document.getElementById(`pay-${m}-section`);
          if (sec) sec.style.display = m === payMethod ? "" : "none";
        });
      });
    });

    /* Preview de la tarjeta en tiempo real */
    const numInput = document.getElementById("co-cardnum");
    numInput?.addEventListener("input", e => {
      let v = e.target.value.replace(/\D/g,"").slice(0,16);
      e.target.value = v.replace(/(.{4})/g,"$1 ").trim();
      const display = document.getElementById("card-display-num");
      if (display) display.textContent = e.target.value || "•••• •••• •••• ••••";
      /* Tipo de tarjeta */
      const brand = document.getElementById("card-display-brand");
      if (brand) {
        if (v.startsWith("4")) brand.textContent = "VISA";
        else if (v.startsWith("5")) brand.textContent = "MASTERCARD";
        else if (v.startsWith("3")) brand.textContent = "AMEX";
        else brand.textContent = "CARD";
      }
    });

    const nameInput = document.getElementById("co-cardname");
    nameInput?.addEventListener("input", e => {
      const display = document.getElementById("card-display-name");
      if (display) display.textContent = e.target.value.toUpperCase() || "NOMBRE APELLIDO";
    });

    const expInput = document.getElementById("co-cardexp");
    expInput?.addEventListener("input", e => {
      let v = e.target.value.replace(/\D/g,"");
      if (v.length >= 2) v = v.slice(0,2) + "/" + v.slice(2,4);
      e.target.value = v;
      const display = document.getElementById("card-display-exp");
      if (display) display.textContent = e.target.value || "MM/AA";
    });
  }

  function captureCustomerData() {
    customerData = {
      nombre: document.getElementById("co-nombre")?.value.trim() || "",
      apellido: document.getElementById("co-apellido")?.value.trim() || "",
      email: document.getElementById("co-email")?.value.trim() || "",
      telefono: document.getElementById("co-tel")?.value.trim() || "",
      ciudad: document.getElementById("co-ciudad")?.value.trim() || "",
      direccion: document.getElementById("co-dir")?.value.trim() || "",
      departamento: document.getElementById("co-dept")?.value || "",
      codigoPostal: document.getElementById("co-cp")?.value.trim() || ""
    };
  }

  function withTimeout(promise, ms) {
    return Promise.race([promise, new Promise(resolve => setTimeout(resolve, ms))]);
  }

  function placeOrder() {
    const nextBtn = document.getElementById("co-next");
    if (nextBtn) { nextBtn.disabled = true; nextBtn.textContent = "Procesando pedido..."; }

    const items = Cart.getItems();
    const subtotal = Cart.getTotal();
    const cardNum = document.getElementById("co-cardnum")?.value.replace(/\D/g, "") || "";

    currentOrder = {
      orderNumber: "DVR-" + Math.floor(100000 + Math.random() * 900000),
      date: new Date().toISOString(),
      customer: customerData,
      items,
      subtotal,
      shipping: 0,
      total: subtotal,
      paymentMethod: payMethod,
      cardLast4: payMethod === "card" && cardNum.length >= 4 ? cardNum.slice(-4) : "",
      status: "Procesando"
    };

    const finish = () => {
      Cart.clear();
      currentStep = 3;
      renderModal();
      document.getElementById("checkout-modal")?.scrollTo(0, 0);
    };

    if (typeof db !== "undefined" && db) {
      const savePromise = db.collection("orders").add(currentOrder);

      // Si Firebase tarda mucho, igual dejamos avanzar al cliente (no lo hacemos esperar eternamente),
      // pero seguimos esperando la confirmación real por detrás para saber si de verdad se guardó.
      const uiTimeout = new Promise(resolve => setTimeout(() => resolve("timeout"), 8000));

      Promise.race([savePromise, uiTimeout]).then(result => {
        if (result === "timeout") {
          console.warn("El pedido está tardando más de lo normal en guardarse, pero se sigue intentando en segundo plano...");
        }
        finish();
      });

      // Esto corre siempre, sin importar el timeout de arriba, para saber la verdad real:
      savePromise
        .then(() => console.log("✓ Pedido guardado en Firestore correctamente:", currentOrder.orderNumber))
        .catch(err => {
          console.error("❌ El pedido NO se guardó en la nube. Error real:", err.code, err.message);
          window.__lastOrderError = err;
        });
    } else {
      finish();
    }
  }

  /* ---- Factura imprimible ---- */
  function downloadInvoice() {
    if (!currentOrder) return;
    const o = currentOrder;
    const fecha = new Date(o.date).toLocaleDateString("es-CO", { year: "numeric", month: "long", day: "numeric" });

    const rowsHTML = o.items.map(it => `
      <tr>
        <td>${it.name}</td>
        <td style="text-align:center">${it.size}</td>
        <td style="text-align:center">${it.qty}</td>
        <td style="text-align:right">${formatCOP(it.unitPrice)}</td>
        <td style="text-align:right">${formatCOP(it.unitPrice * it.qty)}</td>
      </tr>
    `).join("");

    const html = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>Factura ${o.orderNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; color: #111; padding: 40px; max-width: 700px; margin: 0 auto; }
          h1 { font-size: 22px; margin-bottom: 0; }
          .sub { color: #666; margin-top: 4px; }
          .grid { display: flex; justify-content: space-between; margin: 24px 0; font-size: 14px; }
          table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 14px; }
          th, td { padding: 8px 6px; border-bottom: 1px solid #ddd; }
          th { text-align: left; background: #f5f5f5; }
          .totals { margin-top: 16px; width: 100%; }
          .totals td { border: none; padding: 4px 6px; }
          .totals tr:last-child td { font-weight: bold; font-size: 16px; border-top: 2px solid #111; }
          .footer { margin-top: 40px; font-size: 12px; color: #888; text-align: center; }
          @media print { body { padding: 10px; } }
        </style>
      </head>
      <body>
        <h1>DAVIER — Boutique de Calzado</h1>
        <p class="sub">Factura de venta</p>
        <div class="grid">
          <div>
            <strong>Facturado a:</strong><br>
            ${o.customer.nombre} ${o.customer.apellido}<br>
            ${o.customer.direccion}<br>
            ${o.customer.ciudad}, ${o.customer.departamento}<br>
            ${o.customer.email}<br>
            ${o.customer.telefono}
          </div>
          <div style="text-align:right">
            <strong>N° de orden:</strong> ${o.orderNumber}<br>
            <strong>Fecha:</strong> ${fecha}<br>
            <strong>Pago:</strong> ${o.paymentMethod === "card" ? "Tarjeta •••• " + o.cardLast4 : o.paymentMethod === "pse" ? "PSE" : "Efecty"}
          </div>
        </div>
        <table>
          <thead><tr><th>Producto</th><th>Talla</th><th>Cant.</th><th>Precio</th><th>Subtotal</th></tr></thead>
          <tbody>${rowsHTML}</tbody>
        </table>
        <table class="totals">
          <tr><td>Subtotal</td><td style="text-align:right">${formatCOP(o.subtotal)}</td></tr>
          <tr><td>Envío</td><td style="text-align:right">Gratis</td></tr>
          <tr><td>Total</td><td style="text-align:right">${formatCOP(o.total)}</td></tr>
        </table>
        <p class="footer">Gracias por comprar en DAVIER · 30 días para cambios y devoluciones</p>
        <script>window.onload = () => window.print();</script>
      </body>
      </html>
    `;

    const win = window.open("", "_blank");
    if (win) {
      win.document.write(html);
      win.document.close();
    } else {
      alert("Permite las ventanas emergentes en tu navegador para poder ver la factura.");
    }
  }

  function nextStep() {
    const valid = currentStep === 1 ? validateStep1() : validateStep2();
    if (!valid) return;

    if (currentStep === 1) {
      captureCustomerData();
      currentStep++;
      renderModal();
      document.getElementById("checkout-modal")?.scrollTo(0, 0);
      return;
    }

    if (currentStep === 2) {
      placeOrder();
      return;
    }
  }

  function prevStep() {
    if (currentStep > 1) { currentStep--; renderModal(); }
  }

  return { open, close, renderModal };
})();

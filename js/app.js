(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const ROOT = window.ROOT || "";
  const P = window.PRODUCTS || [];
  const rub = n => n.toLocaleString("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " ₽";
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const store = {
    get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
  };

  /* menu */
  const burger = $("#burger"), menu = $("#menu");
  if (burger) burger.onclick = () => { const on = menu.classList.toggle("on"); burger.setAttribute("aria-expanded", on); };

  /* counters */
  $$(".stats b[data-n]").forEach(el => {
    const n = +el.dataset.n, s = el.dataset.s || "", t0 = performance.now();
    const tick = t => { const k = Math.min(1, (t - t0) / 1400); el.textContent = Math.round(n * (1 - Math.pow(1 - k, 3))) + s; if (k < 1) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  });

  /* cart */
  let cart = store.get("pb_cart", {});
  const drawer = $("#cart"), overlay = $("#overlay");
  const openCart = () => { drawer.classList.add("on"); overlay.classList.add("on"); };
  const closeCart = () => { drawer.classList.remove("on"); overlay.classList.remove("on"); };
  $("#cartOpen").onclick = openCart; $("#cartClose").onclick = closeCart; overlay.onclick = closeCart;
  addEventListener("keydown", e => { if (e.key === "Escape") closeCart(); });
  function saveCart() { store.set("pb_cart", cart); renderCart(); }
  function renderCart() {
    const items = Object.entries(cart).map(([id, q]) => ({ p: P.find(x => x.id == id), q })).filter(i => i.p);
    $("#cartCount").textContent = items.reduce((s, i) => s + i.q, 0);
    $("#cartTotal").textContent = rub(items.reduce((s, i) => s + i.p.p * i.q, 0));
    $("#cartBody").innerHTML = items.length ? items.map(({ p, q }) => `<div class="ci"><img src="${ROOT}${p.i}" alt=""><div><h5>${esc(p.t)}</h5><small>${rub(p.p)}</small>
      <div class="qty"><button data-d="-1" data-id="${p.id}">−</button><span>${q}</span><button data-d="1" data-id="${p.id}">+</button></div></div>
      <button class="rm" data-rm="${p.id}" aria-label="Удалить">×</button></div>`).join("") : `<p class="empty">Заявка пуста.<br>Добавьте товары из каталога.</p>`;
  }
  $("#cartBody").onclick = e => {
    const d = e.target.closest("[data-d]"), r = e.target.closest("[data-rm]");
    if (d) { const id = d.dataset.id; cart[id] = (cart[id] || 0) + +d.dataset.d; if (cart[id] <= 0) delete cart[id]; saveCart(); }
    if (r) { delete cart[r.dataset.rm]; saveCart(); }
  };
  document.addEventListener("click", e => {
    const a = e.target.closest("[data-add]"); if (!a) return;
    cart[a.dataset.add] = (cart[a.dataset.add] || 0) + 1; saveCart();
    const b = $("#cartOpen"); b.classList.remove("bump"); void b.offsetWidth; b.classList.add("bump");
    const t = a.textContent; a.textContent = "Добавлено ✓"; setTimeout(() => a.textContent = t, 1200);
  });
  $("#checkout").onclick = () => {
    const msg = $("#cartMsg");
    if (!Object.keys(cart).length) { msg.className = "form-msg err"; msg.textContent = "Заявка пуста."; return; }
    cart = {}; saveCart(); msg.className = "form-msg"; msg.textContent = "Заявка отправлена (демо). Мы свяжемся с вами.";
    setTimeout(() => { msg.textContent = ""; closeCart(); }, 2200);
  };
  renderCart();

  /* demo forms */
  $$("form.form[data-demo]").forEach(f => {
    const m = $(".form-msg", f);
    f.addEventListener("submit", e => {
      e.preventDefault(); let bad = false;
      $$("[required]", f).forEach(i => {
        const v = i.type === "checkbox" ? i.checked : i.value.trim();
        const inv = !v || (i.type === "email" && !/^\S+@\S+\.\S+$/.test(i.value)) || (i.type === "tel" && i.value.replace(/\D/g, "").length < 10);
        i.classList.toggle("invalid", inv); if (inv) bad = true;
      });
      m.className = "form-msg" + (bad ? " err" : "");
      if (bad) { m.textContent = "Проверьте выделенные поля."; return; }
      m.textContent = f.dataset.demo; f.reset();
    });
  });
})();


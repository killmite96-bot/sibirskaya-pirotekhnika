/* Единый стиль движения: мягкое появление снизу, тонкая полоса прогресса, плавный переход между страницами */
(function () {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;

  /* ---------- появление при прокрутке ---------- */
  const TARGETS = [
    ".sec-head", ".pagehead", ".slogan p", ".banners a", ".stats>div", ".nw", ".promo", ".card", ".lg", ".cat",
    ".citylist li", ".dl", ".form", ".pp-img", ".pp-info", ".cta-in", ".prose", ".crumbs", ".pn", ".pager", ".ft-in>div, .ft-in>ul"
  ].join(",");

  if (!reduce && "IntersectionObserver" in window) {
    const seen = new Set();
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const el = e.target; io.unobserve(el);
        requestAnimationFrame(() => el.classList.add("in"));
        // после показа убираем служебные классы, чтобы не мешать hover-эффектам
        setTimeout(() => el.classList.remove("rv", "in"), 1300);
      });
    }, { threshold: .08, rootMargin: "0px 0px -6% 0px" });

    $$(TARGETS).forEach(el => {
      if (seen.has(el) || el.closest(".drawer")) return;
      seen.add(el);
      const sibs = el.parentElement ? [...el.parentElement.children].filter(c => c.matches(TARGETS)) : [];
      const i = Math.max(0, sibs.indexOf(el));
      el.style.setProperty("--d", Math.min(i, 5) * 70 + "ms");
      el.classList.add("rv");
      io.observe(el);
    });
  }

  /* ---------- полоса прогресса чтения ---------- */
  const bar = document.createElement("div");
  bar.className = "progress"; bar.setAttribute("aria-hidden", "true");
  document.body.appendChild(bar);

  /* ---------- лёгкий параллакс главного экрана ---------- */
  const heroIn = $(".hero-in");
  let ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(() => {
      const y = scrollY, h = root.scrollHeight - innerHeight;
      bar.style.transform = "scaleX(" + (h > 0 ? Math.min(1, y / h) : 0) + ")";
      if (heroIn && !reduce && y < 700) {
        heroIn.style.transform = "translateY(" + (y * .14).toFixed(1) + "px)";
      }
      ticking = false;
    });
  }
  addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* ---------- плавный переход между страницами ---------- */
  if (!reduce) {
    addEventListener("pageshow", e => { if (e.persisted) document.body.classList.remove("leaving"); });
    document.addEventListener("click", e => {
      const a = e.target.closest("a[href]");
      if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (a.target && a.target !== "_self") return;
      const href = a.getAttribute("href");
      if (!href || href.startsWith("#") || /^(mailto:|tel:|javascript:)/.test(href) || a.hasAttribute("download")) return;
      let u; try { u = new URL(a.href, location.href); } catch { return; }
      if (u.origin !== location.origin && location.protocol !== "file:") return;
      if (u.protocol !== location.protocol || /\.(pdf|docx?|xlsx?|zip|rar|jpe?g|png|gif|webp)$/i.test(u.pathname)) return;
      if (u.pathname === location.pathname && u.search === location.search) return;
      e.preventDefault();
      document.body.classList.add("leaving");
      setTimeout(() => { location.href = a.href; }, 230);
    });
  }
})();


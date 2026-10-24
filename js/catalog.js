(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const grid = $("#grid"); if (!grid) return;
  const cards = $$(".card", grid);
  const st = { q: "", sort: "def", shots: null };
  const orig = cards.slice();
  function render() {
    let l = orig.filter(c => (!st.shots || c.dataset.shots == st.shots) && (!st.q || c.dataset.q.includes(st.q)));
    const key = { pa: c => +c.dataset.price, pd: c => -c.dataset.price, sd: c => -c.dataset.shots, hd: c => -c.dataset.h }[st.sort];
    if (key) l = [...l].sort((a, b) => key(a) - key(b));
    cards.forEach(c => c.hidden = true);
    l.forEach(c => { c.hidden = false; grid.appendChild(c); });
    $("#count").textContent = l.length ? "Найдено: " + l.length : "Ничего не найдено. Измените запрос или фильтры.";
  }
  $("#q").oninput = e => { st.q = e.target.value.trim().toLowerCase(); render(); };
  $("#sort").onchange = e => { st.sort = e.target.value; render(); };
  $("#chips").onclick = e => {
    const b = e.target.closest(".chip"); if (!b) return;
    st.shots = st.shots == b.dataset.s ? null : b.dataset.s;
    $$(".chip").forEach(c => c.classList.toggle("on", c.dataset.s == st.shots)); render();
  };
  render();
})();

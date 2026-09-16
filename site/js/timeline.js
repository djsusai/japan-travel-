/* The expanding day-by-day list under the map.
   Exposes window.Timeline — map.js calls openStage() when a badge is clicked,
   and this file calls back into window.RouteMap.select() to ink that badge. */
(function () {
  "use strict";

  const stages = window.STAGES;
  const list = document.getElementById("timeline");
  const toggle = document.getElementById("toggleAll");

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  list.innerHTML = stages
    .map(
      s => `
  <article class="tl-row" id="${s.id}">
    <button class="tl-head" aria-expanded="false" aria-controls="${s.id}-body" data-id="${s.id}">
      <span class="pin kind-${s.kind}" aria-hidden="true">${s.n}</span>
      <span class="tl-date">${s.date}</span>
      <span class="tl-title">${s.title}<small>${s.en}</small></span>
      <span class="tl-meta">${s.meta
        .map((t, i) => `<span class="tag ${i === 0 ? "tag-accent" : "tag-outline"}">${t}</span>`)
        .join("")}</span>
    </button>
    <div class="tl-body" id="${s.id}-body">
      <p class="leg-note">${s.note}</p>
      <div class="facts">${s.facts
        .map(([k, v]) => `<div class="fact"><h5>${k}</h5><p>${v}</p></div>`)
        .join("")}</div>
    </div>
  </article>`
    )
    .join("");

  function setOpen(row, open) {
    row.classList.toggle("active", open);
    row.querySelector(".tl-head").setAttribute("aria-expanded", String(open));
  }

  /* fromMap: a badge was activated, so collapse everything else and scroll the
     stage into view. From the list itself it is a plain toggle. */
  function openStage(id, fromMap) {
    const row = document.getElementById(id);
    if (!row) return;
    const open = fromMap ? true : !row.classList.contains("active");

    if (fromMap) {
      list.querySelectorAll(".tl-row.active").forEach(other => setOpen(other, false));
    }
    setOpen(row, open);
    window.RouteMap.select(id);

    if (fromMap) {
      window.scrollTo({
        top: row.getBoundingClientRect().top + window.scrollY - 24,
        behavior: reduceMotion.matches ? "auto" : "smooth",
      });
      row.querySelector(".tl-head").focus({ preventScroll: true });
    }
  }

  list.addEventListener("click", e => {
    const head = e.target.closest(".tl-head");
    if (head) openStage(head.dataset.id, false);
  });

  toggle.addEventListener("click", () => {
    const openAll = list.querySelectorAll(".tl-row.active").length < stages.length;
    list.querySelectorAll(".tl-row").forEach(row => setOpen(row, openAll));
    toggle.textContent = openAll ? "סגור את כל הפרטים" : "פתח את כל הפרטים";
    toggle.setAttribute("aria-expanded", String(openAll));
  });

  window.Timeline = { openStage };
})();

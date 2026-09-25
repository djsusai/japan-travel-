/* "שימושי בדרך" — festivals on the trip's dates, rain alternatives by city,
 * and words of Japanese. Rendered from guide.js into collapsible panels, so the
 * page stays short until one is needed. */
(function () {
  "use strict";

  const g = window.GUIDE;
  const mount = document.getElementById("extras");
  if (!g || !mount) return;

  const esc = s =>
    String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

  const festivals = `
    <details class="extra" id="festivals">
      <summary>פסטיבלים בתאריכים שלכם</summary>
      <div class="extra-body">
        ${g.festivals
          .map(
            f => `<article class="fest">
              <div class="fest-head"><span class="tag tag-accent">${esc(f.dates)}</span><span class="fest-city">${esc(f.city)}</span></div>
              <h4>${esc(f.name)}</h4>
              ${f.text.map(p => `<p>${esc(p)}</p>`).join("")}
              <a href="${esc(f.source)}" target="_blank" rel="noopener">מקור ←</a>
            </article>`
          )
          .join("")}
        <p class="extra-note">${esc(g.noFestivals)}</p>
      </div>
    </details>`;

  const rain = `
    <details class="extra">
      <summary>אם יורד גשם</summary>
      <div class="extra-body">
        ${Object.keys(g.rain)
          .map(
            k => `<div class="rain-city"><h4>${esc(g.rainNames[k])}</h4>
              <ul>${g.rain[k].map(r => `<li>${esc(r)}</li>`).join("")}</ul></div>`
          )
          .join("")}
      </div>
    </details>`;

  const words = `
    <details class="extra">
      <summary>מילים ביפנית</summary>
      <div class="extra-body">
        <dl class="words">
          ${g.words
            .map(
              w => `<div class="word">
                <dt><span class="word-he">${esc(w.he)}</span> <span class="word-ja" lang="ja">${esc(w.ja)}</span></dt>
                <dd>${esc(w.means)}</dd>
              </div>`
            )
            .join("")}
        </dl>
      </div>
    </details>`;

  mount.innerHTML = festivals + rain + words;

  /* The per-day "פסטיבל היום" line points here; open the panel when used. */
  window.Extras = {
    openFestivals() {
      const d = document.getElementById("festivals");
      d.open = true;
      d.scrollIntoView({ behavior: "smooth", block: "start" });
    },
  };
})();

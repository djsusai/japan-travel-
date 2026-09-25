/* The day-by-day plan: a strip of day chips and the chosen day's schedule.
 *
 * Reads window.DAYS (days.js). Exposes window.Plan so today.js can open the
 * current day and ask what is happening right now.
 */
(function () {
  "use strict";

  const days = window.DAYS;
  const strip = document.getElementById("planDays");
  const panel = document.getElementById("planDay");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const WEEKDAY = ["א׳", "ב׳", "ג׳", "ד׳", "ה׳", "ו׳", "ש׳"];
  const WEEKDAY_LONG = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];

  const esc = s =>
    String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  /* Latin runs inside a Hebrew sentence — place names, "onegaishimasu" —
     get their own direction, so punctuation and quotes stay where they belong. */
  const text = s =>
    esc(s).replace(/(&quot;[^&]*?[A-Za-z][^&]*?&quot;|[A-Za-z][A-Za-z0-9'’.\-]*(?: [A-Za-z0-9][A-Za-z0-9'’.\-]*)*)/g, "<bdi>$1</bdi>");
  const parts = iso => iso.split("-").map(Number);
  const weekday = iso => {
    const [y, m, d] = parts(iso);
    return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  };
  const short = iso => {
    const [, m, d] = parts(iso);
    return `${d}.${m}`;
  };
  /* "09:15" → 555; words like "בוקר" have no clock time. */
  const minutes = t => {
    const m = /^(\d{1,2}):(\d{2})$/.exec(t || "");
    return m ? Number(m[1]) * 60 + Number(m[2]) : null;
  };

  /* Each timed item runs until its own end, or else until the next timed item
     starts; the last one runs to the end of the day. */
  function spans(day) {
    const timed = day.items.map((it, i) => ({ i, start: minutes(it.t), end: minutes(it.e), alt: it.alt }))
      .filter(x => x.start !== null && !x.alt);
    return timed.map((x, k) => ({
      i: x.i,
      start: x.start,
      end: x.end !== null ? x.end : k + 1 < timed.length ? timed[k + 1].start : 24 * 60,
    }));
  }

  /* What is on now, and what comes next, at a given minute of the day. */
  function nowNext(iso, minute) {
    const day = days.find(d => d.date === iso);
    if (!day) return null;
    const s = spans(day);
    const now = s.find(x => x.start <= minute && minute < x.end);
    const next = s.find(x => x.start > minute);
    return {
      day,
      now: now ? day.items[now.i] : null,
      next: next ? day.items[next.i] : null,
      nowIndex: now ? now.i : -1,
    };
  }

  strip.innerHTML = days
    .map(
      d => `<button type="button" class="plan-chip" role="tab" id="chip-${d.date}"
        aria-selected="false" aria-controls="planDay" data-date="${d.date}">
        <span class="plan-chip-date">${short(d.date)}</span>
        <span class="plan-chip-day">${WEEKDAY[weekday(d.date)]}</span>
      </button>`
    )
    .join("");

  let current = null;
  let highlight = null; // {date, index} of the item happening right now

  function render(iso) {
    const day = days.find(d => d.date === iso) || days[0];
    current = day.date;

    strip.querySelectorAll(".plan-chip").forEach(c => {
      const on = c.dataset.date === day.date;
      c.setAttribute("aria-selected", String(on));
      c.tabIndex = on ? 0 : -1;
    });
    panel.setAttribute("aria-labelledby", `chip-${day.date}`);

    const nowIndex = highlight && highlight.date === day.date ? highlight.index : -1;
    const time = it => {
      const mark = it.est ? "~" : "";
      return `<span>${mark}${esc(it.t)}</span>${it.e ? `<span>${mark}${esc(it.e)}</span>` : ""}`;
    };

    panel.innerHTML = `
      <header class="plan-head">
        <div class="plan-kicker">יום ${day.n} · ${esc(day.city)} · יום ${WEEKDAY_LONG[weekday(day.date)]} ${short(day.date)}</div>
        <h3 class="plan-title">${esc(day.title)}</h3>
        <p class="plan-sub">${esc(day.sub)}</p>
      </header>
      ${day.note ? `<p class="plan-note">${text(day.note)}</p>` : ""}
      <ol class="plan-items">
        ${day.items
          .map(
            (it, i) => `
          <li class="plan-item${i === nowIndex ? " is-now" : ""}">
            <div class="plan-time"${it.est ? ' title="שעה משוערת"' : ""}>${time(it)}</div>
            <div class="plan-body">
              ${i === nowIndex ? '<span class="tag tag-accent plan-now">עכשיו</span>' : ""}
              <h4>${text(it.title)}</h4>
              ${it.tags && it.tags.length ? `<div class="plan-tags">${it.tags.map(t => `<span class="tag tag-accent-2">${esc(t)}</span>`).join("")}</div>` : ""}
              ${it.text.map(p => `<p>${text(p)}</p>`).join("")}
            </div>
          </li>`
          )
          .join("")}
      </ol>
      ${day.after ? `<p class="plan-note">${text(day.after)}</p>` : ""}
      ${extras(day)}`;

    /* Keep the chosen chip in view inside the scrolling strip. */
    const chip = document.getElementById(`chip-${day.date}`);
    if (chip) {
      const left = chip.offsetLeft - (strip.clientWidth - chip.offsetWidth) / 2;
      strip.scrollTo({ left, behavior: "auto" });
    }
  }

  /* Under each day: any festival running that day, and where to go if it
     rains in that city. Both come from guide.js. */
  function extras(day) {
    const g = window.GUIDE;
    if (!g) return "";
    const fests = g.festivals.filter(f => f.on.includes(day.date));
    const rain = day.rain && g.rain[day.rain];
    return `${fests
      .map(f => `<button type="button" class="plan-fest"><b>פסטיבל היום · ${esc(f.dates)}:</b> ${text(f.name)} — לפרטים ›</button>`)
      .join("")}${
      rain
        ? `<details class="plan-rain"><summary>אם יורד גשם ב${esc(g.rainNames[day.rain])}</summary><ul>${rain
            .map(r => `<li>${text(r)}</li>`)
            .join("")}</ul></details>`
        : ""
    }`;
  }

  function show(iso, opts = {}) {
    render(iso);
    if (opts.scroll) {
      const top = document.getElementById("plan").getBoundingClientRect().top + window.scrollY - 16;
      window.scrollTo({ top, behavior: reduceMotion.matches ? "auto" : "smooth" });
    }
  }

  panel.addEventListener("click", e => {
    if (e.target.closest(".plan-fest") && window.Extras) window.Extras.openFestivals();
  });

  strip.addEventListener("click", e => {
    const chip = e.target.closest(".plan-chip");
    if (chip) show(chip.dataset.date);
  });

  /* Arrow keys move between days, as in any tab strip. In RTL the visual
     "next" day is to the left. */
  strip.addEventListener("keydown", e => {
    const i = days.findIndex(d => d.date === current);
    const step = { ArrowLeft: 1, ArrowRight: -1, Home: -Infinity, End: Infinity }[e.key];
    if (step === undefined) return;
    e.preventDefault();
    const j = Math.max(0, Math.min(days.length - 1, step === Infinity ? days.length - 1 : step === -Infinity ? 0 : i + step));
    show(days[j].date);
    document.getElementById(`chip-${days[j].date}`).focus();
  });

  function setNow(iso, index) {
    highlight = index >= 0 ? { date: iso, index } : null;
    if (current) render(current);
  }

  window.Plan = { show, nowNext, setNow, has: iso => days.some(d => d.date === iso), days };
  render(days[0].date);
})();

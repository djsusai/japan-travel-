/* "Today" — what the trip is doing on the device's current date.
 *
 * Runs last, once the timeline and the map exist. It reads the start/end dates
 * in itinerary.js, works out which stage you are in, fills the card above the
 * map, opens that stage in the timeline and rings its badge on the map.
 *
 * The date comes from the device, so it follows you into JST the moment the
 * phone does. Append ?date=2026-10-04 to preview another day.
 */
(function () {
  "use strict";

  const DAY = 86400000;
  const stages = window.STAGES;
  const card = document.getElementById("today");
  const jump = document.getElementById("todayJump");

  const toDay = iso => {
    const [y, m, d] = iso.split("-").map(Number);
    return Date.UTC(y, m - 1, d);
  };
  const tripStart = toDay(stages[0].start);
  const tripEnd = toDay(stages[stages.length - 1].end);

  /* Whole days in the device's own calendar — not an instant — so a stage never
     flips over at 03:00 local just because the clock is stored in UTC. */
  function currentDay() {
    const override = new URLSearchParams(location.search).get("date");
    if (override && /^\d{4}-\d{2}-\d{2}$/.test(override)) return toDay(override);
    const now = new Date();
    return Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  }

  const dateFormat = new Intl.DateTimeFormat("he-IL", {
    day: "numeric", month: "long", year: "numeric", timeZone: "UTC",
  });
  const shortFormat = new Intl.DateTimeFormat("he-IL", {
    day: "numeric", month: "long", timeZone: "UTC",
  });
  const weekdayFormat = new Intl.DateTimeFormat("he-IL", { weekday: "long", timeZone: "UTC" });

  const days = n => (n === 1 ? "יום אחד" : n === 2 ? "יומיים" : `${n} ימים`);

  /* Several stages can share a date — 4.10 is a checkout in Kyoto, two stops on
     the Nakasendo and a check-in at Fuji. The one that counts as "where you are"
     is the last one to have started, which is where you sleep that night. */
  function stageOn(day) {
    let current = null;
    for (const s of stages) if (toDay(s.start) <= day) current = s;
    return current;
  }
  const alsoOn = (day, current) =>
    stages.filter(s => s !== current && (toDay(s.start) === day || toDay(s.end) === day));

  function describe(day) {
    if (day < tripStart) {
      const away = (tripStart - day) / DAY;
      const first = stages[0];
      return {
        stage: null,
        badge: away === 1 ? "מחר יוצאים" : `עוד ${days(away)}`,
        date: dateFormat.format(new Date(tripStart)),
        title: first.title,
        sub: first.en,
        lines: [first.meta.join(" · ")],
      };
    }
    if (day > tripEnd) {
      return {
        stage: null,
        badge: "הטיול הסתיים",
        date: dateFormat.format(new Date(tripEnd)),
        title: "חזרה הביתה",
        sub: null,
        lines: [],
      };
    }

    const stage = stageOn(day);
    const start = toDay(stage.start);
    const end = toDay(stage.end);
    const lines = [];

    const total = (end - start) / DAY;
    if (stage.kind === "city" && total >= 1) {
      const night = Math.min((day - start) / DAY + 1, total);
      lines.push(total === 1 ? `הלילה היחיד ב${stage.short}` : `לילה ${night} מתוך ${total} ב${stage.short}`);
      /* How many nights are left is already in "night X of Y" — all this adds
         is when to be out of the room. */
      const left = (end - day) / DAY;
      if (left === 1) lines.push("צ׳ק-אאוט מחר");
      else if (left > 1) lines.push(`צ׳ק-אאוט ב-${shortFormat.format(new Date(end))}`);
    }

    const also = alsoOn(day, stage);
    if (also.length) lines.push(`היום גם: ${also.map(s => s.title).join(" · ")}`);

    const next = stages[stages.indexOf(stage) + 1];
    if (next) lines.push(`הבא: ${next.title} · ${shortFormat.format(new Date(toDay(next.start)))}`);

    return {
      stage,
      badge: "היום",
      date: `${weekdayFormat.format(new Date(day))}, ${dateFormat.format(new Date(day))}`,
      title: stage.title,
      sub: stage.en,
      lines,
    };
  }

  let shownDay = null;

  function paint() {
    const day = currentDay();
    shownDay = day;
    const info = describe(day);

    /* Only a real stage makes the card worth pressing. */
    const tag = info.stage ? "button" : "div";
    card.innerHTML = `
      <${tag} class="today-card${info.stage ? " is-link" : ""}"${info.stage ? ' type="button"' : ""}>
        <span class="today-head">
          <span class="tag tag-accent">${info.badge}</span>
          <span class="today-date">${info.date}</span>
        </span>
        <span class="today-title">${info.title}${info.sub ? `<small>${info.sub}</small>` : ""}</span>
        ${info.lines.length ? `<span class="today-lines">${info.lines.map(l => `<span>${l}</span>`).join("")}</span>` : ""}
      </${tag}>`;

    const stageId = info.stage ? info.stage.id : null;
    window.Today = { stageId, day };

    if (info.stage) {
      card.querySelector(".today-card").addEventListener("click", () => focus());
      jump.hidden = false;
      window.Timeline.openStage(stageId, {});
    } else {
      jump.hidden = true;
    }
    window.RouteMap.setToday(stageId);
  }

  function focus() {
    if (window.Today && window.Today.stageId) {
      window.Timeline.openStage(window.Today.stageId, { exclusive: true, scroll: true, focus: true });
    }
  }

  jump.addEventListener("click", focus);

  /* The app can sit on a phone's home screen across midnight; repaint when it
     comes back to the foreground on a different date. */
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && currentDay() !== shownDay) paint();
  });

  paint();
})();

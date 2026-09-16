/* The route map.
 *
 * Drawn from real geometry (Natural Earth 1:110m, in data/countries.js) through
 * a Mercator projection rather than from map tiles, so it needs no tile server
 * and renders identically offline. Two views: Japan, and the whole trip with
 * the flight legs.
 *
 * Every colour comes from a CSS class — see the .leg-*, .kind-* and .pinbadge
 * rules in css/app.css — so nothing here needs to know the palette.
 */
(function () {
  "use strict";

  const SVG_NS = "http://www.w3.org/2000/svg";
  const stages = window.STAGES;
  const box = document.getElementById("mapbox");
  const status = document.getElementById("mapStatus");

  const TLV = [32.0004, 34.8706];
  const AUH = [24.4330, 54.6511];
  const KIX = [34.4347, 135.2328];
  const NRT = [35.7719, 140.3929];

  /* Anything east of 120°E is a stop inside Japan. */
  const japanStages = stages.filter(s => s.at && s.at[1] > 120);

  let view = "japan";
  let selectedId = null;
  let todayId = null;
  let lastWidth = 0;

  const el = (name, attrs) => {
    const node = document.createElementNS(SVG_NS, name);
    for (const key in attrs) if (attrs[key] != null) node.setAttribute(key, attrs[key]);
    return node;
  };
  /* Coordinates are authored as [lat, lng]; d3-geo wants [lng, lat]. */
  const ll = p => [p[1], p[0]];
  const same = (a, b) => a[0] === b[0] && a[1] === b[1];

  /* Above this width the map keeps the proportions the design was drawn at. */
  const WIDE = 560;

  const designHeight = width =>
    view === "japan"
      ? Math.round(Math.min(620, Math.max(360, width * 0.58)))
      : Math.round(Math.min(520, Math.max(300, width * 0.44)));

  function render() {
    const w = Math.max(320, box.clientWidth);
    lastWidth = w;
    box.textContent = "";
    if (!window.WORLD_LAND) return;

    /* The badge offsets were tuned against the full-width desktop map; on a
       narrower one they have to shrink with it or the labels collide. */
    const k = Math.min(1, Math.max(0.6, w / 1000));

    const nodes =
      view === "japan"
        ? japanStages.map(s => ({
            id: s.id, coord: s.at, label: s.short, n: s.n, kind: s.kind, off: s.off,
          }))
        : window.WORLD_NODES.map(n => ({ ...n, n: "✈", kind: "flight" }));

    const fitGeo = { type: "MultiPoint", coordinates: nodes.map(n => ll(n.coord)) };
    const pad = Math.round((view === "japan" ? 96 : 66) * k);

    /* Room above and below for the badges, which hang off their points, and for
       the label sitting under each badge. */
    const offsets = nodes.map(n => (n.off || [0, -34])[1] * k);
    const padTop = Math.max(pad + 10 * k, 20 - Math.min(0, ...offsets));
    const padBottom = Math.max(pad + 20 * k, 42 + Math.max(0, ...offsets));

    let h;
    if (w >= WIDE) {
      h = designHeight(w);
    } else {
      /* The route runs west to east, so it always fits the width first and the
         design's height would leave a band of empty map above and below it.
         On a phone, where vertical space is the scarce thing, the box is cut
         down to what the route actually occupies. */
      const trial = d3.geoMercator().fitWidth(w - 2 * pad, fitGeo);
      const [[, top], [, bottom]] = d3.geoPath(trial).bounds(fitGeo);
      h = Math.round(Math.min(designHeight(w), Math.max(200, bottom - top + padTop + padBottom)));
    }

    const proj = d3.geoMercator().fitExtent([[pad, padTop], [w - pad, h - padBottom]], fitGeo);
    const path = d3.geoPath(proj);

    const svg = el("svg", {
      viewBox: `0 0 ${w} ${h}`,
      width: w,
      height: h,
      role: "group",
      "aria-label": "מפת מסלול הטיול — כל תחנה היא כפתור שפותח את פרטיה",
    });

    svg.append(el("rect", { class: "map-bg", width: w, height: h }));

    const landLayer = el("g", { "aria-hidden": "true" });
    for (const feature of window.WORLD_LAND.features) {
      const d = path(feature);
      if (d) landLayer.append(el("path", { class: "map-land", d }));
    }
    svg.append(landLayer);

    const legs = el("g", { "aria-hidden": "true" });
    const drawLeg = (a, b, mode) => {
      if (same(a, b)) return;
      const d = path({ type: "LineString", coordinates: [ll(a), ll(b)] });
      if (d) legs.append(el("path", { class: `leg leg-${mode}`, d }));
    };

    if (view === "japan") {
      for (const s of japanStages) {
        if (s.from && s.from[1] > 120) drawLeg(s.from, s.at, s.mode || "car");
      }
    } else {
      drawLeg(TLV, AUH, "flight");
      drawLeg(AUH, KIX, "flight");
      drawLeg(NRT, AUH, "flight");
      /* The whole overland trip, Kansai to Narita, as one stroke. */
      drawLeg(KIX, NRT, "car");
    }
    svg.append(legs);

    const placed = nodes.map(nd => {
      const [x, y] = proj(ll(nd.coord));
      const [dx, dy] = nd.off || [0, -34];
      return { nd, x, y, bx: x + dx * k, by: y + dy * k };
    });

    /* Leaders and dots go down in their own layer first, so that on a crowded
       phone map no stop's dot can land on top of a neighbour's badge. */
    const leaders = el("g", { class: "map-pins", "aria-hidden": "true" });
    for (const { nd, x, y, bx, by } of placed) {
      const layer = el("g", { class: `kind-${nd.kind}` });
      layer.append(el("line", { class: "leader", x1: x, y1: y, x2: bx, y2: by }));
      layer.append(el("circle", { class: "dot", cx: x, cy: y, r: 3.6 }));
      leaders.append(layer);
    }
    svg.append(leaders);

    const pins = el("g");
    const labels = [];
    for (const { nd, bx, by } of placed) {
      /* The 44px touch target is capped so a badge can never end up buried
         under a neighbour's invisible one where the stops crowd together. */
      const nearest = Math.min(
        ...placed.filter(o => o.nd !== nd).map(o => Math.hypot(o.bx - bx, o.by - by))
      );
      const hitRadius = Math.max(15, Math.min(22, nearest - 15));

      const group = el("g", {
        class: `pinbadge kind-${nd.kind}${nd.id === todayId ? " is-today" : ""}`,
        id: `pin-${nd.id}`,
        tabindex: "0",
        role: "button",
        "aria-label": `${nd.label} — הצג פרטים`,
      });
      /* An invisible target past the 15px badge, so the pin clears the 44px
         minimum for touch — and the focus ring has something to sit on. */
      group.append(el("circle", { class: "hit", cx: bx, cy: by, r: hitRadius }));
      /* Today's stop keeps a ring whether or not it is the selected one. */
      if (nd.id === todayId) group.append(el("circle", { class: "today-ring", cx: bx, cy: by, r: 20 }));
      group.append(el("circle", { class: "badge", cx: bx, cy: by, r: 15 }));

      const number = el("text", {
        class: "badge-text", x: bx, y: by,
        "text-anchor": "middle", "dominant-baseline": "central",
      });
      number.textContent = nd.n;
      group.append(number);

      const label = el("text", {
        class: "pin-label", x: bx, y: by + 28, "text-anchor": "middle",
      });
      label.textContent = nd.label;
      group.append(label);
      labels.push(label);

      const open = () =>
        window.Timeline.openStage(nd.id, { exclusive: true, scroll: true, focus: true });
      group.addEventListener("click", open);
      group.addEventListener("keydown", e => {
        if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
          e.preventDefault();
          open();
        }
      });
      pins.append(group);
    }
    svg.append(pins);

    box.append(svg);

    /* Now that the text is laid out it can be measured: nudge any label that
       runs off an edge back inside. A no-op at desktop width. */
    for (const label of labels) {
      const bounds = label.getBBox();
      const overflowStart = 4 - bounds.x;
      const overflowEnd = bounds.x + bounds.width - (w - 4);
      const shift = overflowStart > 0 ? overflowStart : overflowEnd > 0 ? -overflowEnd : 0;
      if (shift) label.setAttribute("x", Number(label.getAttribute("x")) + shift);
    }

    applySelection();
  }

  function applySelection() {
    box.querySelectorAll(".pinbadge.selected").forEach(g => g.classList.remove("selected"));
    if (!selectedId) return;
    const badge = box.querySelector(`#pin-${selectedId}`);
    if (badge) badge.classList.add("selected");
  }

  function select(id) {
    selectedId = id;
    applySelection();
  }

  /* today.js decides which stage the current date falls in, and hands it here
     so the badge can carry a ring. Null outside the trip's dates. */
  function setToday(id) {
    if (todayId === id) return;
    todayId = id;
    render();
  }

  function setView(next) {
    if (view === next) return;
    view = next;
    for (const [id, name] of [["viewJapan", "japan"], ["viewWorld", "world"]]) {
      const button = document.getElementById(id);
      button.className = `btn ${view === name ? "btn-secondary" : "btn-ghost"}`;
      button.setAttribute("aria-pressed", String(view === name));
    }
    status.textContent = view === "japan" ? "תצוגת יפן" : "תצוגת כל המסלול כולל טיסות";
    render();
  }

  document.getElementById("viewJapan").addEventListener("click", () => setView("japan"));
  document.getElementById("viewWorld").addEventListener("click", () => setView("world"));

  /* Only a width change matters; on phones the address bar sliding away fires
     resize on every scroll, and re-rendering there would be visible. */
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (Math.max(320, box.clientWidth) !== lastWidth) render();
    }, 160);
  });

  window.RouteMap = { select, setToday, render };
  render();
})();

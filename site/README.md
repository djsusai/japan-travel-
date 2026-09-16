# מסלול יפן · route map

The implementation of `project/route-map.html` — the interactive route map and
day-by-day timeline for the 26.9–15.10.2026 Japan trip. Hebrew, RTL, with place
names in English.

## Running it

Open `index.html`. It is a plain static page with no build step, and every asset
it needs is in this folder, so double-clicking the file works and so does any
static host:

```
python3 -m http.server -d site 8000     # → http://localhost:8000
```

Deploying means copying `site/` somewhere. Nothing is fetched at runtime, so the
page works on a plane, on foreign roaming, or with the phone in airplane mode.

## Layout

```
index.html          the page
css/fonts.css       @font-face for the self-hosted Heebo and Caprasimo
css/tokens.css      the Organic design system, copied from project/_ds
css/app.css         page styles — built only from the tokens above
js/itinerary.js     the trip: flights, hotels, car, distances, times
js/timeline.js      the expanding day-by-day list
js/map.js           the SVG map, its two views and its pins
data/countries.js   country outlines (Natural Earth 1:110m)
vendor/             d3-geo and d3-array
fonts/              woff2 subsets
```

To change a date, a hotel or a note, edit `js/itinerary.js` — nothing else reads
the trip. The map and the timeline are both generated from that one array, so a
new stop appears in both.

## How the map works

There are no map tiles. The country outlines are real geometry projected through
`d3.geoMercator()` at draw time, which is why the map needs no tile server and
survives offline. Each stop's badge hangs off its point on a leader line, with
the offsets in `itinerary.js` hand-tuned so the labels clear each other in the
crowded Fuji–Hakone–Odawara–Tokyo stretch; below 1000px those offsets scale down
with the map, and below 560px the map's height is cut to what the route actually
occupies rather than keeping the desktop proportions.

Colours are not in the JavaScript. Every leg, pin and badge carries a class
(`leg-car`, `kind-city`, …) that `css/app.css` resolves against the design
system's ramps, so the palette changes in one place.

## Regenerating the vendored assets

`vendor/`, `fonts/` and `data/countries.js` all come from npm:

```
node tools/vendor-assets.mjs
```

That script also converts the world-atlas TopoJSON to GeoJSON, which is why
there is no TopoJSON decoder in the browser. `data/countries.js` assigns a
global instead of being a `.json` the page fetches, so that `file://` — where
`fetch` and ES modules are blocked — still works.

## Differences from the prototype

Deliberate, and the only three:

1. **Tokyo → Narita is drawn as a train leg, not a car one.** The car goes back
   at Odawara on 7.10, so the 14.10 run out to the airport cannot be by car; the
   prototype's map coloured it terracotta.
2. **Ghost buttons and outlined tags use `--color-accent-700`** instead of
   `--color-accent`. At 11–14px those were about 2.6–2.9:1 against the ground —
   below the 4.5:1 text needs. This is the design system's own documented rule
   for accent-coloured text at body size. Two declarations at the end of the
   contrast block in `app.css` revert it.
3. **Pins are keyboard-operable** (`Tab`, then `Enter` or `Space`) with a focus
   ring and a 44px touch target, the phone layout of a timeline row was fixed —
   the design's `@media` block left the title in a 30px column — and the map
   height adapts as described above.

Everything else is pixel-identical: rendered side by side with the prototype at
1280px, the only pixels that differ are the ones those three changes touch.

# מסלול יפן · the app

The implementation of `project/route-map.html`, turned into an installable
offline app: the interactive route map and day-by-day timeline for the
26.9–15.10.2026 Japan trip, in Hebrew with place names in English.

## Running it

Open `index.html`. It is a plain static page with no build step, and every asset
it needs is in this folder, so double-clicking the file works and so does any
static host:

```
python3 -m http.server -d site 8000     # → http://localhost:8000
```

Nothing is fetched at runtime, so the page works on a plane, with roaming off,
or in airplane mode.

## Installing it on a phone

Open the deployed URL and:

- **iPhone** — Safari → Share → *Add to Home Screen*. Safari is the only browser
  on iOS that can do this.
- **Android** — Chrome offers *Install app*, or Menu → *Add to home screen*.

After the first visit the service worker has the whole app cached, so it opens
from the home screen with the network off. When a new version is deployed the
app downloads it in the background and offers a **רענן** button; until you press
it you keep using the copy you have, including offline.

## Layout

```
index.html              the page
manifest.webmanifest    name, icons and display mode for the installed app
sw.js                   generated — the offline cache (tools/build-sw.mjs)
css/fonts.css           @font-face for the self-hosted Heebo and Caprasimo
css/tokens.css          the Organic design system, copied from project/_ds
css/app.css             page styles — built only from the tokens above
js/itinerary.js         the trip: dates, flights, hotels, car, distances
js/timeline.js          the expanding day-by-day list
js/map.js               the SVG map, its two views and its pins
js/today.js             which stage the current date falls in
js/app.js               service worker registration and the update prompt
data/countries.js       country outlines (Natural Earth 1:110m)
vendor/  fonts/  icons/
```

To change a date, a hotel or a note, edit `js/itinerary.js` — nothing else reads
the trip. The map, the timeline and the today card are all generated from that
one array, so a new stop appears in all three. Then run `node tools/build-sw.mjs`
so the offline copy matches.

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

## How "today" works

`js/today.js` compares the device's calendar date against the `start`/`end`
dates on each stage. Several stages can share a date — 4.10 is a checkout in
Kyoto, two stops on the Nakasendo and a check-in at Fuji — so the stage that
counts as *where you are* is the last one to have started, which is where you
sleep that night. The others become the "היום גם" line.

The date comes from the device, so it follows you into JST the moment the phone
does, and it is recomputed when the app returns to the foreground in case it sat
on the home screen across midnight. Append `?date=2026-10-04` to preview any
other day.

## Differences from the prototype

The map and the timeline are pixel-identical to `project/route-map.html` — a
side-by-side render at 1280px matches exactly, apart from the three changes
below. The today card and the install/offline machinery are additions above and
around them.

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
   height adapts as described above. The two long button labels shorten below
   560px so the controls stay on one row on a phone.

## Regenerating the vendored assets

`vendor/`, `fonts/` and `data/countries.js` all come from npm:

```
node tools/vendor-assets.mjs
```

That script also converts the world-atlas TopoJSON to GeoJSON, which is why
there is no TopoJSON decoder in the browser. `data/countries.js` assigns a
global instead of being a `.json` the page fetches, so that `file://` — where
`fetch` and ES modules are blocked — still works.

The app icons are rasterised from `icons/*.svg`:

```
npm install --no-save playwright && node tools/build-icons.mjs
```

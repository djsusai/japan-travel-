# מסלול יפן · Japan trip app

An offline-first web app for a 26.9–15.10.2026 trip to Japan: an interactive
route map, a day-by-day timeline with the hotels, flights, car rental and
driving times, and a "today" card that knows where the trip is on the current
date. Hebrew, right-to-left, with place names in English.

Installs to a phone's home screen and works with no network at all — on a
plane, or with roaming off in a foreign country, which is the point.

```
site/     the app — plain static files, no build step to serve
tools/    generators: vendored libraries, icons, service worker
project/  the original Claude Design prototype this was built from
```

This repository is public so that GitHub Pages can serve it. Booking references
and the scanned confirmations are deliberately not in it — at any point in its
history — and the page asks search engines not to index it.

## Running it locally

```
python3 -m http.server -d site 8000     # → http://localhost:8000
```

Opening `site/index.html` straight from the filesystem also works — every asset
is local — but installing to a home screen needs a real origin, so use the
server (or the deployed site) for that.

Append `?date=2026-10-04` to any URL to see the app as it will look on that day
of the trip.

## Deploying

Pushing to `main` publishes to GitHub Pages via
[`.github/workflows/pages.yml`](.github/workflows/pages.yml). The workflow turns
Pages on for the repository itself the first time it runs, so there is nothing
to configure by hand.

It also regenerates the service worker from the current contents of `site/`, so
a deploy never ships a stale offline cache.

## Editing the trip

Everything about the trip — dates, hotels, addresses, phone numbers, distances,
driving times, map coordinates — lives in
[`site/js/itinerary.js`](site/js/itinerary.js). The map, the timeline and the
"today" card are all generated from that one array, so a change there shows up
in all three. Nothing else needs touching.

After editing anything under `site/`, regenerate the offline cache:

```
node tools/build-sw.mjs
```

(The deploy workflow does this too, so forgetting it only affects a local copy.)

## More

[`site/README.md`](site/README.md) covers the layout, how the map is drawn, how
"today" is worked out, and where this deliberately differs from the prototype.

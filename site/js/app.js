/* Service worker registration.
 *
 * The worker is what turns the page into something that opens with no network,
 * so it only matters over http(s) — opened straight off the filesystem the app
 * already has every file it needs, and registering would only throw.
 *
 * Updates install themselves: when a new version has finished caching it takes
 * over, and the page reloads onto it once. An earlier version waited for a
 * "רענן" button instead, which was too easy to miss — a new day-by-day plan
 * sat unseen on a phone that kept serving the old copy. */
(function () {
  "use strict";

  if (!("serviceWorker" in navigator)) return;
  if (location.protocol !== "http:" && location.protocol !== "https:") return;

  /* On the very first visit the worker also takes control, but the page is
     already the current version — only reload when replacing an older one. */
  const hadController = !!navigator.serviceWorker.controller;
  let reloading = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (!hadController || reloading) return;
    reloading = true;
    location.reload();
  });

  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(() => {
      /* No worker means no offline copy; the page itself still works. */
    });
  });
})();

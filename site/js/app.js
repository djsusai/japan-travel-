/* Service worker registration and the update prompt.
 *
 * The worker is what turns the page into something that opens with no network,
 * so it only matters over http(s) — opened straight off the filesystem the app
 * already has every file it needs, and registering would only throw. */
(function () {
  "use strict";

  if (!("serviceWorker" in navigator)) return;
  if (location.protocol !== "http:" && location.protocol !== "https:") return;

  const bar = document.getElementById("update");
  const button = document.getElementById("updateNow");

  window.addEventListener("load", async () => {
    let registration;
    try {
      registration = await navigator.serviceWorker.register("sw.js");
    } catch {
      /* No worker means no offline copy; the page itself still works. */
      return;
    }

    /* A worker that reaches "installed" while another one is already in control
       is a new version waiting its turn — the only case worth interrupting for.
       On the very first visit there is no controller and nothing to announce. */
    const offer = worker => {
      if (!worker) return;
      worker.addEventListener("statechange", () => {
        if (worker.state === "installed" && navigator.serviceWorker.controller) bar.hidden = false;
      });
    };
    offer(registration.installing);
    registration.addEventListener("updatefound", () => offer(registration.installing));

    button.addEventListener("click", () => {
      bar.hidden = true;
      if (registration.waiting) registration.waiting.postMessage("SKIP_WAITING");
    });

    let reloading = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (reloading) return;
      reloading = true;
      location.reload();
    });
  });
})();

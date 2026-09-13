// ============================================================
// HUB — Setup Nômade
// Tracking de cliques nos CTAs (afiliados e ferramenta de viagem).
// Depende de tracking.js (track + loadGoatCounter) e config.js.
// ============================================================
(function () {
  "use strict";

  document.addEventListener(
    "click",
    function (event) {
      var target = event.target;
      if (!target || typeof target.closest !== "function") return;
      var tracked = target.closest("[data-track]");
      if (!tracked) return;
      var name = tracked.getAttribute("data-track");
      if (name && typeof track === "function") {
        track(name);
      }
    },
    true
  );

  if (typeof loadGoatCounter === "function") {
    loadGoatCounter();
  }
})();

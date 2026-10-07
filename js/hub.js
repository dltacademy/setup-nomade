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
      // data-track é um nome fixo escrito no HTML que identifica o link clicado.
      var linkId = tracked.getAttribute("data-track");
      if (linkId && typeof track === "function") {
        track(linkId);
      }
    },
    true
  );

  if (typeof loadGoatCounter === "function") {
    loadGoatCounter();
  }
})();


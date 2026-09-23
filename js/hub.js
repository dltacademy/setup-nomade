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

// Filtro "Veio de um vídeo?": esmaece os links fora do assunto escolhido,
// sem esconder nenhum (todo link continua clicável).
(function () {
  "use strict";
  var chips = document.querySelectorAll(".need-chip");
  var rows = document.querySelectorAll(".link-list [data-needs]");
  if (!chips.length) return;
  Array.prototype.forEach.call(chips, function (chip) {
    chip.addEventListener("click", function () {
      var need = chip.getAttribute("data-need");
      Array.prototype.forEach.call(chips, function (c) {
        var on = c === chip;
        c.classList.toggle("is-active", on);
        c.setAttribute("aria-pressed", on ? "true" : "false");
      });
      Array.prototype.forEach.call(rows, function (row) {
        var match = need === "all" || (" " + row.getAttribute("data-needs") + " ").indexOf(" " + need + " ") !== -1;
        row.parentNode.classList.toggle("is-dim", !match);
      });
      if (typeof track === "function") track("filtro_" + need);
    });
  });
})();

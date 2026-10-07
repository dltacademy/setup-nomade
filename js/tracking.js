// ============================================================
// Tracking genérico por canal/variante + resolução de link ref.
// Cada ferramenta define seu próprio objeto CONFIG (ver config.example.js)
// com o formato: { refByChannel: {...}, refDefault, offers,
// community, goatCounterSite, siteUrl, brand }.
// ============================================================

function getChannel() {
  const params = new URLSearchParams(window.location.search);
  const channel = params.get("c");
  return channel && /^[A-Za-z0-9_-]{1,40}$/.test(channel) ? channel : null;
}

// `v` identifica a variante ou o vídeo de origem (ex.: ?c=ig&v=pay01), para saber
// qual peça gerou o clique. Sem valor válido, cai em "a".
function getVariant() {
  const params = new URLSearchParams(window.location.search);
  const v = params.get("v");
  return v && /^[A-Za-z0-9_-]{1,40}$/.test(v) ? v : "a";
}

function getSafeExternalUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.href : "#";
  } catch (_) {
    return "#";
  }
}

function getRefLink() {
  const channel = getChannel();
  const channelMap = CONFIG.refByChannel;
  // Só chave própria do mapa: ?c=constructor não pode cair em Object.prototype.
  if (
    channel &&
    channelMap &&
    Object.prototype.hasOwnProperty.call(channelMap, channel)
  ) {
    return getSafeExternalUrl(channelMap[channel]);
  }
  return getSafeExternalUrl(CONFIG.refDefault);
}

// Canal público da marca — NUNCA contato pessoal. O antigo telegramUsername
// abria conversa direta com uma pessoa; isso saiu do ecossistema em 27/07,
// junto com a promoção que dependia dele. Aqui só entra grupo/canal oficial.
function isCommunityConfigured() {
  return Boolean(CONFIG.community && CONFIG.community.url && getCommunityLink() !== "#");
}

function getCommunityLink() {
  return getSafeExternalUrl(CONFIG.community && CONFIG.community.url);
}

/** `default` mantém a resolução por canal; outras chaves vêm de CONFIG.offers. */
function getOfferLink(offerKey = "default") {
  if (offerKey === "default") return getRefLink();
  const offer = CONFIG.offers && CONFIG.offers[offerKey];
  return offer && offer.url ? getSafeExternalUrl(offer.url) : "#";
}

function track(eventName) {
  if (window.goatcounter && window.goatcounter.count) {
    const channel = getChannel() || "direto";
    const variant = getVariant();
    window.goatcounter.count({
      path: `${eventName}?c=${encodeURIComponent(channel)}&v=${encodeURIComponent(variant)}`,
      event: true,
    });
  }
}

/**
 * Chamar uma vez no final do <body>, depois de CONFIG estar definido.
 *
 * O count.js do GoatCounter é servido pelo próprio site, nunca de gc.zgo.at:
 * script de terceiro sem versão fixa teria acesso ao DOM das calculadoras.
 * js/vendor/goatcounter-count.js foi baixado de https://gc.zgo.at/count.js em
 * 2026-10-07, sha256 792b7abd26c1fb6ae62906833e09a301251e2641816e69e4f95aba518f3fe3f0.
 * Para atualizar: baixar de novo, revisar o diff e trocar data e hash aqui.
 * A CSP precisa do host exato da conta (https://<site>.goatcounter.com) em
 * connect-src e img-src: o count.js cai para pixel quando sendBeacon falha.
 */
function loadGoatCounter() {
  if (!CONFIG.goatCounterSite || !/^[a-z0-9-]{1,63}$/.test(CONFIG.goatCounterSite)) return;
  const gc = document.createElement("script");
  gc.async = true;
  gc.setAttribute("data-goatcounter", "https://" + CONFIG.goatCounterSite + ".goatcounter.com/count");
  gc.src = "js/vendor/goatcounter-count.js";
  document.head.appendChild(gc);
}

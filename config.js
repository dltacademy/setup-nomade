// ============================================================
// CONFIG — O Setup do Nômade (dlt.academy)
// ============================================================

const CONFIG = {
  // Link de afiliado padrão — ether.fi Cash (P1 prioritário da DLT Academy)
  refDefault: "https://www.ether.fi/@e155ee95",

  // Rastreamento por canal de origem (?c=...)
  refByChannel: {
    grupos: "https://www.ether.fi/@e155ee95",
    whats: "https://www.ether.fi/@e155ee95",
    yt: "https://www.ether.fi/@e155ee95",
    bio: "https://www.ether.fi/@e155ee95",
    "tg-ads": "https://www.ether.fi/@e155ee95",
    nomad: "https://www.ether.fi/@e155ee95",
  },

  // Catálogo de destinos do roteador contextual
  offers: {
    default: {
      name: "ether.fi Cash (Cartão Principal sem IOF + até 3% Cashback)",
      url: "https://www.ether.fi/@e155ee95",
      code: "e155ee95",
      type: "card",
      headline: "Cartão Visa Internacional Web3",
      instruction: "Cadastre-se pelo navegador antes de baixar o app para garantir as regras de cashback.",
    },
    arq: {
      name: "Cartão ARQ (Saque sem Taxa de ATM)",
      url: "https://www.arqfinance.com/referrals/general?referralCode=tiagohyd_t7t&pid=referral&c=general&is_retargeting=true",
      code: "tiagohyd_t7t",
      type: "atm",
      headline: "Saques em moeda física sem taxas ocultas",
    },
    bybit: {
      name: "Bybit Pay (QR Code com USDT na Ásia)",
      url: "https://www.bybit.com/en/invite/?ref=O0YDQDM",
      code: "O0YDQDM",
      type: "pay",
      headline: "Pagar VietQR e PromptPay direto com stablecoin",
    },
  },

  // Comunidade oficial da marca
  community: {
    url: "https://t.me/dltacademy",
    label: "Entrar grátis no grupo →",
    tag: "Grátis",
    headline: "Comunidade de Nômades e Viajantes",
    sub: "Tire dúvidas sobre pagamentos, cartões, saques e câmbio direto com quem vive na estrada.",
  },

  goatCounterSite: "dltacademy",
  siteUrl: "https://setup-nomade.dlt.academy/",
  brand: "dltacademy",
};

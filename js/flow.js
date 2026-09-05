// ============================================================
// O Setup do Nômade — Lógica de Fluxo Guiado
// DLT Academy (dlt.academy)
// ============================================================

const DESTINO_LABEL = {
  asia: "Sudeste Asiático (Vietnã, Tailândia, Indonésia)",
  europa: "Europa / Zona do Euro",
  latam: "América Latina (Argentina, Colômbia, México)",
  eua: "Estados Unidos / Américas",
  global: "Nômade Global / Múltiplos países"
};

const FLOW = {
  slug: "setup-nomade",
  reportTitle: "Seu Setup de Pagamentos no Exterior",
  reportLabel: "Montar meu setup personalizado →",

  steps: [
    {
      title: "Seu destino e duração",
      description: "As taxas, aceitação de cartões e métodos locais mudam drasticamente por região.",
      fields: [
        {
          id: "destino",
          label: "Para onde você vai viajar ou passar mais tempo?",
          type: "radio",
          required: true,
          options: [
            { value: "asia", label: "🌏 Sudeste Asiático (Vietnã, Tailândia, Bali...)" },
            { value: "europa", label: "🏛️ Europa (Zona do Euro / Reino Unido)" },
            { value: "latam", label: "🌮 América Latina (Argentina, Colômbia, México...)" },
            { value: "eua", label: "🗽 Estados Unidos / Américas" },
            { value: "global", label: "✈️ Nômade Global (troco de país frequentemente)" },
          ],
        },
        {
          id: "duracao",
          label: "Qual é a duração da sua estadia fora do país?",
          type: "radio",
          required: true,
          options: [
            { value: "ferias", label: "Férias / Viagem curta (até 30 dias)" },
            { value: "temporada", label: "Temporada de trabalho / Nômade (1 a 6 meses)" },
            { value: "estrada", label: "Vida 100% na estrada / Morando no exterior (+6 meses)" },
          ],
        },
      ],
    },
    {
      title: "Rotina de gastos e espécie",
      description: "Como você realmente gasta no seu destino.",
      fields: [
        {
          id: "gastoMensal",
          label: "Gasto médio mensal estimado (ou orçamento da viagem em BRL)",
          type: "range",
          min: 2000,
          max: 40000,
          step: 500,
          value: 8000,
          format: (v) => "R$ " + v.toLocaleString("pt-BR"),
        },
        {
          id: "perfilGasto",
          label: "Qual é o formato dos comércios onde você vai consumir?",
          type: "radio",
          required: true,
          options: [
            { value: "cartao", label: "Quase tudo em maquininha de cartão (hotéis, mercados, shoppings)" },
            { value: "dinheiro", label: "Muitas barracas de rua, feiras e lavanderias que só aceitam cash" },
            { value: "misto", label: "Misto equilibrado (uso cartão onde dá, mas preciso de dinheiro vivo)" },
          ],
        },
      ],
    },
    {
      title: "Como seu dinheiro chega",
      description: "Para desenhar a rota de câmbio de menor custo da sua conta até o gasto final.",
      fields: [
        {
          id: "origemRenda",
          label: "De onde vem o dinheiro que você gasta fora?",
          type: "radio",
          required: true,
          options: [
            { value: "brl", label: "Recebo em Reais (BRL) no Brasil via PIX / CLT / PJ" },
            { value: "cripto", label: "Recebo em Dólar / USDT / USDC direto on-chain" },
            { value: "misto", label: "Recebo em BRL, mas mantenho parte das reservas em stablecoins" },
          ],
        },
        {
          id: "setupAtual",
          label: "O que você costuma usar para pagar fora hoje?",
          type: "radio",
          required: true,
          options: [
            { value: "bancao", label: "Cartão de Crédito Tradicional (Itaú, Nubank, Bradesco)" },
            { value: "fintech", label: "Conta Global Tradicional (Wise, Nomad, C6 Global)" },
            { value: "especie", label: "Compro papel-moeda em casa de câmbio física" },
            { value: "nenhum", label: "Ainda não tenho nenhum cartão internacional" },
          ],
        },
      ],
    },
  ],

  buildReport(a) {
    const findings = [];
    const plan = [];
    const gasto = Number(a.gastoMensal) || 8000;

    // Cálculo do sangramento no método atual
    let taxaAtual = 0.0938; // Default bancão (4.38% IOF + 5% spread)
    if (a.setupAtual === "fintech") {
      taxaAtual = 0.0430;
    } else if (a.setupAtual === "especie") {
      taxaAtual = 0.0700;
    }

    const perdaAtual = Math.round(gasto * taxaAtual);
    const ganhoCashback = Math.round(gasto * 0.025);
    const economiaTotal = perdaAtual + ganhoCashback;

    // 1. Diagnósticos e Alertas de Campo
    if (a.setupAtual === "bancao") {
      findings.push({
        severity: 3,
        title: "Alerta de Sangramento: ~9,4% de pedágio em todas as compras",
        text: `Usar cartão de bancão brasileiro custa 4,38% de IOF + cerca de 5% de spread cambial invisível. Em R$ ${gasto.toLocaleString("pt-BR")} de gasto, você deixa aproximadamente R$ ${perdaAtual.toLocaleString("pt-BR")} de presente para o banco por mês.`,
      });
    } else if (a.setupAtual === "nenhum") {
      findings.push({
        severity: 2,
        title: "Você parte do zero — sem sangramento atual, sem atalho",
        text: `Você ainda não tem cartão internacional, então hoje não perde nada — mas se pagar essa viagem no primeiro cartão de bancão que aparecer, a conta de referência é dura: 4,38% de IOF + cerca de 5% de spread, ou aproximadamente R$ ${perdaAtual.toLocaleString("pt-BR")} por mês em R$ ${gasto.toLocaleString("pt-BR")} de gasto. O setup abaixo evita começar por aí.`,
      });
    } else if (a.setupAtual === "fintech") {
      findings.push({
        severity: 2,
        title: "Fintechs ajudam no IOF, mas cobram tarifas pesadas em saques",
        text: "Embora contas como Wise e Nomad reduzam o IOF para 1,1% na entrada, os saques físicos têm limites rígidos e cobram tarifas salgadas (a Wise cobra R$ 20 por saque após o primeiro). No setup abaixo você elimina essas travas.",
      });
    }

    if (a.destino === "asia") {
      findings.push({
        severity: 2,
        title: "Regra do Sudeste Asiático: O poder do QR Code bancário local",
        text: "No Vietnã (VietQR) e na Tailândia (PromptPay), feiras de rua, mercadinhos e barracas de comida aceitam QR Code direto, mas recusam cartão de crédito. Você pode pagar esses QRs com USDT direto pela Bybit com taxa zero, evitando ir ao caixa eletrônico.",
      });
    }

    if (a.duracao === "ferias") {
      findings.push({
        severity: 1,
        title: "Viagem curta: o melhor setup pode ser o que você já tem",
        text: "Com até 30 dias fora, abrir conta nova, passar por KYC e formar saldo em outro app pode criar mais trabalho e risco do que economia. Compare primeiro o custo do seu método atual e só adicione uma camada nova se ela resolver uma lacuna concreta (QR necessário, saque ou redundância).",
      });
    }

    if (a.perfilGasto === "dinheiro" || a.perfilGasto === "misto") {
      findings.push({
        severity: 2,
        title: "Alerta Anti-Golpe nos Caixas Eletrônicos (ATMs)",
        text: "Ao sacar dinheiro vivo no exterior, a tela do caixa eletrônico perguntará se você quer conversão garantida (DCC). Recuse sempre escolhendo 'Without Conversion' ou 'Debit in Local Currency'. Aceitar o DCC rouba de 8% a 12% a mais na cotação do caixa!",
      });
    }

    // 2. Montagem do Plano / Setup de 4 Camadas de Tiago Hyadhuad
    // CAMADA 1: CARTÃO PRINCIPAL (ether.fi Cash)
    plan.push({
      badge: "🥇 1ª LINHA — COMPRAS DO DIA A DIA",
      badgeClass: "badge-gold",
      title: "ether.fi Cash (Cartão Principal Visa Web3)",
      gain: `0% IOF Bancário + até 3% de Cashback em USDC (Retorno projetado: ~R$ ${ganhoCashback.toLocaleString("pt-BR")}/mês)`,
      text: "Onde aceitar cartão (hotéis, supermercados, cafés, restaurantes, passagens e Uber), pague debitando diretamente de USDC on-chain. Custo líquido negativo pelo cashback e liquidez instantânea.",
      warning: "⚠️ Regra de ouro Browser-First: conclua todo o cadastro pelo navegador antes de abrir o aplicativo móvel para garantir a vinculação correta do cashback de 3%.",
      cta: {
        label: "Solicitar Cartão ether.fi Cash →",
        url: getOfferLink("default"),
        event: "clique_oferta_etherfi_setup"
      },
      article: {
        label: "📖 Ler guia de uso no exterior",
        url: "https://dlt.academy/guias/etherfi-cash-viagem/"
      }
    });

    // CAMADA 2: SAQUE EM DINHEIRO FÍSICO (Cartão ARQ)
    plan.push({
      badge: "🥈 2ª LINHA — SAQUES EM DINHEIRO VIVO",
      badgeClass: "badge-silver",
      title: "Cartão ARQ Global",
      gain: "0% IOF na formação do saldo · 1% por saque no plano Standard · Sem tarifa fixa por saque",
      text: "Para quando o comércio exigir papel-moeda (feiras de rua, mercadinhos tradicionais, gorjetas e lavanderias). Saldo em dólar digital formado sem IOF, com 1% por saque no plano Standard e sem tarifa fixa por operação.",
      warning: "⚠️ Alerta anti-golpe no caixa eletrônico: aperte sempre 'Without Conversion' ou 'Debit in Local Currency' na tela do ATM para não perder até 12% em conversão dinâmica.",
      cta: {
        label: "Pedir Cartão ARQ Global →",
        url: getOfferLink("arq"),
        event: "clique_oferta_arq_setup"
      },
      article: {
        label: "📖 Ler auditoria: ARQ vs Wise vs Revolut",
        url: "https://dlt.academy/blog/arq-saques-exterior/"
      }
    });

    // CAMADA 3: QR CODE OU CARTEIRA DIGITAL
    if (a.destino === "asia" || a.destino === "global") {
      plan.push({
        badge: "🥉 3ª LINHA — QR CODE BANCÁRIO LOCAL",
        badgeClass: "badge-bronze",
        title: "Bybit Pay (VietQR no Vietnã e PromptPay na Tailândia)",
        gain: "Taxa zero de transação · Débito direto em USDT · Sem precisar de dinheiro vivo",
        text: "No Sudeste Asiático, quase todo comércio de rua opera com QR Code bancário direto. Basta abrir o app da Bybit, escanear o QR do estabelecimento e pagar em USDT na hora sem passar pelo banco.",
        cta: {
          label: "Ativar Bybit Pay com Taxa Zero →",
          url: getOfferLink("bybit"),
          event: "clique_oferta_bybit_setup"
        },
        article: {
          label: "📖 Comparativo real: Bybit Pay vs Moreta no VietQR",
          url: "https://dlt.academy/blog/bybit-pay-vs-moreta-vietqr/"
        }
      });
    } else {
      plan.push({
        badge: "🥉 3ª LINHA — CARTEIRA DIGITAL & BACKUP",
        badgeClass: "badge-bronze",
        title: "Apple Pay / Google Pay com ether.fi Cash",
        gain: "Pagamento por aproximação no celular · Segurança máxima · Sem expor cartão físico",
        text: "Adicione o cartão à carteira digital do smartphone para pagar transporte público, metrôs e compras por aproximação (NFC) sem tirar o cartão da carteira.",
        cta: {
          label: "Configurar Cartão ether.fi →",
          url: getOfferLink("default"),
          event: "clique_oferta_etherfi_setup"
        },
        article: {
          label: "📖 Guia: Setup de Pagamentos no Exterior",
          url: "https://dlt.academy/guias/etherfi-cash-viagem/"
        }
      });
    }

    // CAMADA 4: RAMPA DE ENTRADA (FUNDING)
    plan.push({
      badge: "⚡ 4ª LINHA — RAMPA DE ENTRADA (FUNDING)",
      badgeClass: "badge-silver",
      title: a.origemRenda === "brl" || a.origemRenda === "misto" ? "Rampa via PIX sem spread de bancão" : "Gestão de saldo on-chain em stablecoin",
      gain: `Câmbio a preço de mercado · Economia projetada de R$ ${Math.round(gasto * 0.0938 - gasto * 0.005).toLocaleString("pt-BR")}/mês contra o bancão`,
      text: a.origemRenda === "brl" || a.origemRenda === "misto"
        ? "Envie Reais (BRL) via PIX institucional direto para a corretora ou para a conta ARQ, convertendo para USDT/USDC com spread mínimo (0,5% contra 5% dos bancos tradicionais)."
        : "Alimente o saldo de débito do cartão transferindo USDC ou USDT pelas redes de baixo custo (Arbitrum ou Base), com taxas de rede normalmente de centavos — confira no app antes de enviar.",
      article: {
        label: "📖 Artigo: Quanto custa gastar US$100 no exterior",
        url: "https://dlt.academy/blog/custo-100-dolares-exterior/"
      }
    });

    const camada3 = a.destino === "asia" || a.destino === "global" ? "Bybit Pay" : "Carteiras digitais";
    return {
      headline: `${plan.length} Camadas`,
      sublabel: `Setup personalizado para ${DESTINO_LABEL[a.destino] || "sua viagem"}`,
      tone: "good",
      stats: [
        { value: "R$ " + economiaTotal.toLocaleString("pt-BR"), label: "economia estimada/mês" },
        { value: plan.length, label: "camadas no stack" },
        { value: "0% IOF", label: "gastos no cartão" },
      ],
      findings,
      plan,
      shareCard: {
        eyebrow: "MEU SETUP DE PAGAMENTOS NO EXTERIOR",
        headline: `${plan.length} Camadas`,
        lines: [
          `${(DESTINO_LABEL[a.destino] || "Viagem").split("(")[0].trim()} · R$ ${gasto.toLocaleString("pt-BR")}/mês`,
          `ether.fi Cash + Cartão ARQ + ${camada3}`,
          "Economia projetada: R$ " + economiaTotal.toLocaleString("pt-BR") + " · Zero IOF",
        ],
        headlineColor: "#6ee7a8",
        coupon: {
          label: "STACK TESTADO EM CAMPO",
          offerText: "ether.fi Cash (3% Cashback)\nARQ (Saque sem taxa ATM)",
        },
      },
    };
  },

  convert: {
    offerKey: "default",
    tag: "Pronto para ativar o Passo 1?",
    headline: "Ative seu Cartão ether.fi Cash com até 3% de Cashback",
    sub: "O cartão Visa Web3 que elimina o IOF bancário brasileiro e transforma suas compras no exterior em retorno líquido.",
    offers: [
      "Zero IOF bancário brasileiro (4,38%) em gastos internacionais",
      "Até 3% de cashback em compras elegíveis debitando direto de USDC",
      "Aceito em maquininhas Visa no mundo todo",
    ],
    ctaLabel: "Solicitar Cartão ether.fi Cash →",
    note: "Importante: abra o link e conclua o cadastro pelo navegador antes de baixar o app móvel para garantir a elegibilidade de cashback.",
  },
};

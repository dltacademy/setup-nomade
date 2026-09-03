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
      title: "Seu Destino & Duração",
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
            { value: "global", label: "✈️ Nômade Global (mudo de país frequentemente)" },
          ],
        },
        {
          id: "duracao",
          label: "Qual é a duração da sua estadia fora?",
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
      title: "Rotina de Gastos & Espécie",
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
      title: "Como seu Dinheiro Chega",
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
    let nomeMetodo = "Cartão de Bancão";
    if (a.setupAtual === "fintech") {
      taxaAtual = 0.0430;
      nomeMetodo = "Fintechs Tradicionais (Wise/Nomad)";
    } else if (a.setupAtual === "especie") {
      taxaAtual = 0.0700;
      nomeMetodo = "Casa de Câmbio Física";
    }

    const perdaAtual = Math.round(gasto * taxaAtual);
    // Ganho com ether.fi Cash (2.5% cashback líquido médio)
    const ganhoCashback = Math.round(gasto * 0.025);
    const economiaTotal = perdaAtual + ganhoCashback;

    // 1. Diagnósticos e Alertas de Campo
    if (a.setupAtual === "bancao" || a.setupAtual === "nenhum") {
      findings.push({
        severity: 3,
        title: "Alerta de Sangramento: ~9,4% de pedágio em todas as compras",
        text: `Usar cartão de bancão brasileiro custa 4,38% de IOF + cerca de 5% de spread cambial invisível. Em R$ ${gasto.toLocaleString("pt-BR")} de gasto, você deixa aproximadamente R$ ${perdaAtual.toLocaleString("pt-BR")} de presente para o banco por mês.`,
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

    if (a.perfilGasto === "dinheiro" || a.perfilGasto === "misto") {
      findings.push({
        severity: 2,
        title: "Alerta Anti-Golpe nos Caixas Eletrônicos (ATMs)",
        text: "Ao sacar dinheiro vivo no exterior, a tela do caixa eletrônico perguntará se você quer conversão garantida (DCC). SEMPRE recuse escolhendo 'Without Conversion' ou 'Debit in Local Currency'. Aceitar o DCC rouba de 8% a 12% a mais na cotação do caixa!",
      });
    }

    // 2. Montagem do Plano / Setup de 4 Camadas
    // CAMADA 1: CARTÃO PRINCIPAL DE COMPRAS
    plan.push({
      title: "1ª Linha (Compras do Dia a Dia): ether.fi Cash",
      text: `Onde aceitar cartão (hotéis, restaurantes, supermercados, passagens), pague com o cartão Visa do ether.fi Cash debitando diretamente de USDC on-chain. Você tem ZERO IOF bancário brasileiro (4,38%) e recebe até 3% de cashback em compras elegíveis. Projeção de retorno: ~R$ ${ganhoCashback.toLocaleString("pt-BR")} de volta no seu bolso.`,
    });

    // CAMADA 2: SAQUE EM DINHEIRO FÍSICO
    plan.push({
      title: "2ª Linha (Onde só aceitar papel-moeda): Cartão ARQ Global",
      text: "Quando a feira de rua ou comércio tradicional não aceitar cartão, use o Cartão ARQ para sacar moeda física nos caixas eletrônicos. O saldo Global em USDc é adquirido com 0% de IOF e a tarifa de saque no plano Standard é de apenas 1% (contra os R$ 20 cobrados pela Wise). Lembre-se de sempre recusar o DCC no caixa.",
    });

    // CAMADA 3: QR CODE OU BACKUP MÓVEL
    if (a.destino === "asia" || a.destino === "global") {
      plan.push({
        title: "3ª Linha (Fallback de QR Code Asiático): Bybit Pay",
        text: "Se o comércio local recusar cartão internacional e você estiver sem dinheiro vivo sacado, abra o app da Bybit e escaneie o QR Code bancário local (VietQR/PromptPay). O pagamento é debitado diretamente do seu saldo em USDT com taxa zero de transação.",
      });
    } else {
      plan.push({
        title: "3ª Linha (Pagamento por Aproximação & Backup): Apple/Google Pay",
        text: "Cadastre seu cartão ether.fi Cash na carteira digital do celular para pagar por aproximação (NFC) em transportes públicos e lojas sem precisar tirar o cartão físico da carteira.",
      });
    }

    // CAMADA 4: RAMPA DE ENTRADA (FUNDING)
    if (a.origemRenda === "brl" || a.origemRenda === "misto") {
      plan.push({
        title: "4ª Linha (Abastecimento via PIX sem Spread): Rampa Descentralizada",
        text: "Envie Reais (BRL) via PIX com liquidez institucional e taxas mínimas para comprar USDT/USDC na corretora e carregar o saldo do seu cartão ether.fi ou abastecer o ARQ via PIX direto.",
      });
    } else {
      plan.push({
        title: "4ª Linha (Gestão de Stablecoins): Depósito On-Chain Direto",
        text: "Transfira USDC ou USDT diretamente pelas redes de baixo custo (Arbitrum, Base ou Solana) para alimentar o saldo de débito do cartão ether.fi Cash em segundos.",
      });
    }

    // Passo de segurança operacional
    plan.push({
      title: "Regra de Ativação Browser-First",
      text: "Para não perder os benefícios e a vinculação correta do cashback no ether.fi Cash, abra o link oficial e conclua todo o cadastro pelo navegador antes de baixar o aplicativo móvel.",
    });

    return {
      headline: `${plan.length} camadas`,
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
          "ether.fi Cash + Cartão ARQ + Bybit Pay",
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
      "Aceito globalmente em mais de 100 milhões de maquininhas Visa",
    ],
    ctaLabel: "Solicitar Cartão ether.fi Cash →",
    note: "Importante: abra o link e conclua o cadastro pelo navegador antes de baixar o app móvel para garantir a elegibilidade de cashback.",
  },
};

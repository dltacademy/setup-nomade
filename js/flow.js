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
      description: "Aceitação, meios locais e necessidade de redundância mudam por região e pelo tempo de viagem.",
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
      description: "O valor serve apenas para dar escala às comparações; não é enviado nem usado como patrimônio.",
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
            { value: "dinheiro", label: "Muitas barracas de rua, feiras e lavanderias que só aceitam dinheiro" },
            { value: "misto", label: "Misto equilibrado (uso cartão onde dá, mas preciso de dinheiro vivo)" },
          ],
        },
      ],
    },
    {
      title: "Como seu dinheiro chega",
      description: "A rota de funding pode custar mais do que a taxa mostrada no pagamento final.",
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
            { value: "bancao", label: "Cartão de crédito tradicional (Itaú, Nubank, Bradesco...)" },
            { value: "fintech", label: "Conta global / cartão multimoedas (Wise, Nomad, C6 Global...)" },
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
    const viagemCurta = a.duracao === "ferias";
    const precisaDinheiro = a.perfilGasto === "dinheiro" || a.perfilGasto === "misto";
    const usaCripto = a.origemRenda === "cripto" || a.origemRenda === "misto";

    // Regra fiscal vigente no Brasil para operação internacional comum.
    // Custos adicionais do emissor (spread/tarifa) variam e não são inventados aqui.
    const iofCartaoInternacional = 0.035;
    const iofMinimoBancao = Math.round(gasto * iofCartaoInternacional);

    if (a.setupAtual === "bancao") {
      findings.push({
        severity: 3,
        title: "Seu cartão tradicional começa com 3,5% de IOF",
        text: `Em R$ ${gasto.toLocaleString("pt-BR")} de gasto internacional, só o IOF de 3,5% representa cerca de R$ ${iofMinimoBancao.toLocaleString("pt-BR")}, antes do spread, tarifa ou cashback do emissor. Compare o custo total no app/fatura em vez de assumir um spread fixo.`,
      });
    } else if (a.setupAtual === "nenhum") {
      findings.push({
        severity: 2,
        title: "Você parte do zero — então não existe economia atual para projetar",
        text: "Como você informou que ainda não tem cartão internacional, a ferramenta não atribui uma perda fictícia ao seu setup atual. O objetivo abaixo é montar apenas as camadas que resolvem lacunas reais da viagem.",
      });
    } else if (a.setupAtual === "fintech") {
      findings.push({
        severity: 1,
        title: "Sua conta global pode já resolver boa parte da viagem",
        text: "Não trate toda fintech como 1,1% de IOF. Na Wise, por exemplo, a conversão comum de BRL para saldo em moeda estrangeira usa 3,5%; 1,1% aparece no Rende+, que é uma rota de investimento específica. Compare a rota que você realmente usa.",
      });
    } else if (a.setupAtual === "especie") {
      findings.push({
        severity: 1,
        title: "Papel-moeda pode continuar como reserva, não precisa ser a única rota",
        text: "Compare a cotação efetiva da casa de câmbio com cartão/conta global e mantenha dinheiro físico para situações em que cartão ou QR não funcionem.",
      });
    }

    if (viagemCurta) {
      findings.push({
        severity: 1,
        title: "Viagem curta: usar o que você já tem pode ser a melhor decisão",
        text: "Com até 30 dias fora, abrir conta nova, passar por KYC e formar saldo em outro app só vale quando resolve uma lacuna concreta — por exemplo, QR local necessário, saque ou redundância. O plano abaixo evita empilhar conta nova por padrão.",
      });
    }

    if (a.destino === "asia") {
      findings.push({
        severity: 2,
        title: "QR local é útil, mas o suporte muda por país",
        text: "A Bybit documenta VietQR no Vietnã. A lista oficial atual não inclui PromptPay na Tailândia, então não trate 'Sudeste Asiático' como uma única rede compatível. Confirme o método local no país e no app antes de depender dele.",
      });
    }

    if (precisaDinheiro) {
      findings.push({
        severity: 2,
        title: "No ATM, recuse a conversão do próprio caixa quando houver escolha",
        text: "Prefira a cobrança na moeda local e compare a tela final antes de confirmar. DCC pode piorar bastante a cotação, mas o impacto varia por operador e moeda; a ferramenta não usa um percentual universal.",
      });
    }

    // 1. Método existente primeiro quando ele já cobre a necessidade.
    if (a.setupAtual === "fintech" && viagemCurta) {
      plan.push({
        badge: "1ª LINHA — USE O QUE JÁ TEM",
        badgeClass: "badge-gold",
        title: "Sua conta global atual como cartão principal",
        gain: "Evita abrir uma conta nova sem necessidade",
        text: "Use a conta/cartão que você já conhece como principal e compare a conversão exibida no momento do gasto. Só adicione outra conta se faltar QR, saque ou redundância.",
        article: {
          label: "📖 Ver o guia de pagamentos no exterior",
          url: "https://dlt.academy/pagamentos-no-exterior/"
        }
      });
    } else if (a.setupAtual === "bancao" || a.setupAtual === "nenhum" || !viagemCurta) {
      plan.push({
        badge: "1ª LINHA — CARTÃO / COMPRAS",
        badgeClass: "badge-gold",
        title: "ether.fi Cash como candidato de cartão principal",
        gain: "Cashback elegível varia progressivamente de 3% a 0,5% conforme membership e gasto mensal",
        text: "Considere apenas se elegível e se o custo total de funding, FX e uso for competitivo no seu caso. O cashback não é 3% fixo e não transforma automaticamente qualquer compra em custo líquido negativo.",
        warning: "Confira membership, cashback restante e custos exibidos antes da compra. Benefício e elegibilidade podem mudar.",
        cta: {
          label: "Conferir condições do ether.fi Cash →",
          url: getOfferLink("default"),
          event: "clique_oferta_etherfi_setup"
        },
        article: {
          label: "📖 Ler guia de uso no exterior",
          url: "https://dlt.academy/guias/etherfi-cash-viagem/"
        }
      });
    }

    // 2. Saque somente quando a pessoa realmente precisa de dinheiro físico.
    if (precisaDinheiro) {
      plan.push({
        badge: "2ª LINHA — DINHEIRO FÍSICO",
        badgeClass: "badge-silver",
        title: "ARQ Global como rota de saque a comparar",
        gain: "1% por saque no plano Standard, sem tarifa fixa do provedor por operação",
        text: "Use como candidato para obter dinheiro local quando necessário. A tarifa do próprio ATM e a conversão até a moeda local podem continuar existindo, então confira a tela do caixa e o app.",
        warning: "Escolha a moeda local no ATM quando houver opção e evite DCC sem comparar a cotação.",
        cta: {
          label: "Conferir Cartão ARQ Global →",
          url: getOfferLink("arq"),
          event: "clique_oferta_arq_setup"
        },
        article: {
          label: "📖 Ler comparação de saques",
          url: "https://dlt.academy/blog/arq-saques-exterior/"
        }
      });
    }

    // 3. QR local só é recomendado onde há suporte documentado.
    if (a.destino === "asia") {
      plan.push({
        badge: "QR LOCAL — QUANDO HOUVER SUPORTE",
        badgeClass: "badge-bronze",
        title: "Bybit Pay para VietQR no Vietnã",
        gain: "A Bybit não cobra transaction fee no VietQR; conversão/FX ainda pode gerar custo",
        text: "Se a viagem inclui Vietnã e o QR é reconhecido, compare o débito final e use VietQR como alternativa operacional. Para Tailândia, Indonésia e outros países, confirme a rede suportada; não presumimos PromptPay ou outro QR sem documentação atual.",
        cta: {
          label: "Conferir Bybit Pay →",
          url: getOfferLink("bybit"),
          event: "clique_oferta_bybit_setup"
        },
        article: {
          label: "📖 Guia de VietQR e Bybit Pay",
          url: "https://dlt.academy/guias/bybit-pay-vietqr/"
        }
      });
    } else if (a.destino === "global") {
      plan.push({
        badge: "QR LOCAL — OPCIONAL",
        badgeClass: "badge-bronze",
        title: "Confirme a rede QR país por país",
        gain: "Compatibilidade vale mais do que uma promessa genérica de QR global",
        text: "VietQR, PIX e outras redes têm regras próprias. Antes de depender de um app, confirme país, método suportado, moeda e custo de conversão.",
        article: {
          label: "📖 Ver exemplo real de VietQR",
          url: "https://dlt.academy/blog/bybit-pay-vs-moreta-vietqr/"
        }
      });
    }

    // 4. Funding é sempre parte do custo, mas sem economia fixa inventada.
    plan.push({
      badge: "FUNDING — COMO O SALDO CHEGA",
      badgeClass: "badge-silver",
      title: usaCripto ? "Compare rede e custo para mover stablecoin" : "Compare a conversão de BRL antes de formar o saldo",
      gain: "Funding barato pode preservar a vantagem; funding caro pode apagá-la",
      text: usaCripto
        ? "Antes de enviar USDC/USDT, confira rede suportada, taxa de saque e valor final recebido. Não use uma taxa de gás fixa como regra universal."
        : "Compare o valor final recebido em moeda estrangeira ou stablecoin. Em operações comuns da Wise, por exemplo, o IOF é 3,5%; o Rende+ usa 1,1% por ser uma rota de investimento específica.",
      article: {
        label: "📖 Artigo: quanto custa gastar US$100 no exterior",
        url: "https://dlt.academy/blog/custo-100-dolares-exterior/"
      }
    });

    const custoAtual = a.setupAtual === "bancao"
      ? { value: "3,5% + custos", label: "IOF + spread/tarifa do emissor" }
      : a.setupAtual === "nenhum"
        ? { value: "R$ 0", label: "custo atual informado" }
        : a.setupAtual === "fintech"
          ? { value: "ver no app", label: "IOF/tarifa dependem da rota" }
          : { value: "compare", label: "cotação efetiva do papel-moeda" };

    const semNovaConta = viagemCurta && a.setupAtual === "fintech";

    return {
      headline: `${plan.length} ${plan.length === 1 ? "camada" : "camadas"}`,
      sublabel: `Setup para ${DESTINO_LABEL[a.destino] || "sua viagem"}`,
      tone: "good",
      stats: [
        custoAtual,
        { value: plan.length, label: "camadas sugeridas" },
        { value: "0 envio", label: "respostas enviadas à DLT" },
      ],
      findings,
      plan,
      convertOverride: semNovaConta ? null : undefined,
      extraText: "Não existe economia fixa prometida: taxas, cashback, elegibilidade, câmbio e aceitação mudam. Compare o custo real antes de cada decisão.",
      shareCard: {
        eyebrow: "MEU SETUP DE PAGAMENTOS NO EXTERIOR",
        headline: `${plan.length} ${plan.length === 1 ? "camada" : "camadas"}`,
        lines: [
          `${(DESTINO_LABEL[a.destino] || "Viagem").split("(")[0].trim()} · R$ ${gasto.toLocaleString("pt-BR")}/mês`,
          semNovaConta ? "Prioridade: usar a infraestrutura que já tenho" : "Principal + fallback + funding conforme o cenário",
          "Compare custos e elegibilidade antes de ativar novas contas",
        ],
        headlineColor: "#6ee7a8",
        coupon: {
          label: "SETUP GERADO POR CENÁRIO",
          offerText: "Sem vencedor universal\nCustos e suporte mudam por rota",
        },
      },
    };
  },

  convert: {
    offerKey: "default",
    tag: "Uma opção para comparar",
    headline: "Confira se o ether.fi Cash faz sentido no seu cenário",
    sub: "O cartão pode ser útil para compras elegíveis, mas a decisão depende de funding, FX, membership, cashback e alternativas que você já possui.",
    offers: [
      "Cashback progressivo entre 3% e 0,5% em transações elegíveis, conforme membership e gasto",
      "Compare custo total de funding e câmbio antes de decidir",
      "Não abra uma conta nova se o seu método atual já resolve a viagem",
    ],
    ctaLabel: "Conferir condições do ether.fi Cash →",
    note: "Link de indicação. A DLT Academy pode receber uma recompensa se a conta cumprir as condições vigentes, sem custo adicional direto para você. Confirme elegibilidade e benefícios atuais antes de cadastrar.",
  },
};

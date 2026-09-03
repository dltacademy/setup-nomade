// ============================================================
// Motor genérico de cards em <canvas> — usado tanto pra cards de
// resultado (share de usuário) quanto pra criativos de anúncio.
// Zero dependências. Formatos comuns já prontos em CARD_FORMATS.
//
// Regra de design (ver BRAND.md "Erros já cometidos — não repetir"):
// todo resultado baixável/copiável deve virar um PRESENTE, não só
// um card de estatística — por isso `opts.coupon` é o padrão
// recomendado, não um extra opcional esquecível.
// ============================================================

/** Quebra texto em linhas que cabem em maxWidth, no font já setado em ctx. */
function wrapCanvasText(ctx, text, maxWidth) {
  const words = text.split(" ");
  const lines = [];
  let current = "";
  words.forEach((word) => {
    const test = current ? current + " " + word : word;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  });
  if (current) lines.push(current);
  return lines;
}

const CARD_FORMATS = {
  square: { width: 1080, height: 1080 }, // Instagram/Telegram feed
  story: { width: 1080, height: 1920 }, // Stories/Reels/TikTok
  feed: { width: 1200, height: 628 }, // Facebook/LinkedIn/X link preview
  og: { width: 1200, height: 630 }, // og:image
};

/**
 * Desenha um card com fundo gradiente + título + estatística grande +
 * linhas de detalhe + cupom de presente (ou rodapé simples). Retorna o <canvas>.
 *
 * @param {object} opts
 * @param {"square"|"story"|"feed"|"og"|{width,height}} opts.format
 * @param {string} [opts.eyebrow] título pequeno no topo
 * @param {string} opts.headline texto grande de destaque (pode quebrar linha com \n)
 * @param {string} [opts.headlineColor] cor do headline (default verde da marca)
 * @param {string[]} [opts.lines] linhas de texto abaixo do headline
 * @param {object} [opts.coupon] { label, offerText } — desenha o card como PRESENTE
 *   (caixa de cupom tracejada com a oferta + link). Recomendado sempre que o
 *   resultado leva a um CTA de cadastro — ver BRAND.md.
 * @param {boolean} [opts.showFooter=true] mostra rodapé simples quando NÃO há coupon
 * @param {string} [opts.footerLabel] texto acima da URL no rodapé simples (default "Teste em:" —
 *   trocar pra "Leia em:" em og-image de post de blog, por exemplo)
 * @param {(ctx, w, h) => void} [opts.customDraw] hook pra desenho extra (gráficos, ícones)
 */
function generateCard(opts) {
  const format = typeof opts.format === "string" ? CARD_FORMATS[opts.format] : opts.format;
  const { width, height } = format;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  drawCardBackground(ctx, width, height);

  if (opts.customDraw) opts.customDraw(ctx, width, height);

  // Formatos largos sem cupom são cards de COMPARTILHAMENTO (og/feed): eles
  // aparecem pequenos no WhatsApp/Telegram/X, então usam um layout editorial
  // próprio — alinhado à esquerda, texto grande, rodapé de uma linha só.
  // Cards quadrados/story e qualquer card com cupom seguem o layout clássico.
  if (!opts.coupon && opts.shareLayout !== false && width / height >= 1.5) {
    drawShareCard(ctx, width, height, opts);
    return canvas;
  }

  const cx = width / 2;
  ctx.textAlign = "center";
  ctx.textBaseline = "top"; // medimos caixas, não baselines — ver measureTextBlock

  // 1. Reserva o espaço do rodapé ANTES de posicionar o texto, para que
  //    conteúdo e rodapé nunca disputem os mesmos pixels.
  let footerHeight = 0;
  if (opts.coupon) footerHeight = height * 0.32;
  else if (opts.showFooter !== false) footerHeight = measureCardFooter(width);

  const maxLineWidth = width * 0.84;
  const contentTop = height * 0.07;
  const contentBottom = height - footerHeight;
  const available = contentBottom - contentTop;

  // 2. Encolhe a headline até o bloco inteiro caber na área livre.
  const sizes = {
    eyebrow: Math.round(width * 0.033),
    body: Math.round(width * 0.026),
    headline: Math.round(width * (opts.headlineSizeRatio || 0.075)),
  };
  const minHeadline = Math.round(width * 0.038);
  let block = measureTextBlock(ctx, opts, sizes, maxLineWidth);
  while (block.height > available && sizes.headline > minHeadline) {
    sizes.headline = Math.round(sizes.headline * 0.92);
    block = measureTextBlock(ctx, opts, sizes, maxLineWidth);
  }

  // 3. Centraliza o bloco verticalmente no espaço que sobrou.
  let y = contentTop + Math.max(0, (available - block.height) / 2);

  if (block.eyebrow) {
    ctx.fillStyle = "#E8EDF7";
    ctx.font = `600 ${sizes.eyebrow}px system-ui, sans-serif`;
    ctx.fillText(block.eyebrow, cx, y);
    y += sizes.eyebrow * 1.75;
  }

  ctx.fillStyle = opts.headlineColor || "#6EE7A8";
  ctx.font = `900 ${sizes.headline}px system-ui, sans-serif`;
  block.headlineLines.forEach((line) => {
    ctx.fillText(line, cx, y);
    y += sizes.headline * 1.12;
  });

  if (block.bodyLines.length) {
    y += sizes.headline * 0.45;
    ctx.fillStyle = "#9AA7C2";
    ctx.font = `500 ${sizes.body}px system-ui, sans-serif`;
    block.bodyLines.forEach((line) => {
      ctx.fillText(line, cx, y);
      y += sizes.body * 1.5;
    });
  }

  if (opts.coupon) {
    drawCouponBox(ctx, width, height, opts.coupon);
  } else if (opts.showFooter !== false) {
    drawCardFooter(ctx, width, height, opts.footerLabel);
  }

  return canvas;
}

/**
 * Card de compartilhamento (og/feed) — o que aparece quando alguém cola o
 * link no WhatsApp, Telegram ou X.
 *
 * Decisões de projeto, todas motivadas por como esse card é REALMENTE visto
 * (miniatura de ~300px de largura, não em tamanho cheio):
 * - alinhado à esquerda, não centralizado: o olho ancora numa margem só e o
 *   texto ocupa a largura útil em vez de flutuar no meio;
 * - descrição grande (~3% da largura): a 300px ela ainda precisa ser legível;
 * - rodapé de UMA linha (URL à esquerda, marca à direita) em vez de três
 *   linhas empilhadas repetindo a marca;
 * - margem de segurança generosa e uniforme, para nenhum recorte de prévia
 *   comer texto;
 * - eyebrow como pílula de destaque, que categoriza a peça sem competir
 *   com a headline.
 *
 * `opts.footerLabel` é ignorado aqui de propósito (o rodapé é de uma linha).
 * Passe `shareLayout: false` para forçar o layout clássico centralizado.
 */
function drawShareCard(ctx, width, height, opts) {
  const accent = "#4A8DF8";
  const margin = Math.round(width * 0.058);
  const maxWidth = width - margin * 2;
  const showFooter = opts.showFooter !== false;

  const urlSize = Math.round(width * 0.026);
  const brandSize = Math.round(width * 0.023);
  const ruleH = Math.max(3, Math.round(width * 0.0035));

  // 1. Rodapé ancorado na borda inferior; o texto nunca invade essa faixa.
  const urlY = height - margin - urlSize * 1.25;
  const ruleY = urlY - Math.round(margin * 0.5) - ruleH;
  const contentTop = margin;
  const contentBottom = showFooter ? ruleY - Math.round(margin * 0.45) : height - margin;
  const available = contentBottom - contentTop;

  // 2. Encolhe headline (e só depois a descrição) até o bloco caber.
  const eyebrowSize = Math.round(width * 0.023);
  const minHeadline = Math.round(width * 0.040);
  const minDesc = Math.round(width * 0.024);
  let headlineSize = Math.round(width * 0.066);
  let descSize = Math.round(width * 0.03);

  function layoutBlock() {
    const b = { height: 0, pillH: opts.eyebrow ? Math.round(eyebrowSize * 2) : 0 };
    if (b.pillH) b.height += b.pillH + Math.round(headlineSize * 0.42);

    ctx.font = `900 ${headlineSize}px system-ui, sans-serif`;
    b.headlineLines = String(opts.headline)
      .split("\n")
      .flatMap((segment) => wrapCanvasText(ctx, segment, maxWidth));
    b.headlineLH = headlineSize * 1.14;
    b.height += b.headlineLines.length * b.headlineLH;

    ctx.font = `500 ${descSize}px system-ui, sans-serif`;
    b.descLines = (opts.lines || []).flatMap((line) => wrapCanvasText(ctx, line, maxWidth));
    b.descLH = descSize * 1.38;
    if (b.descLines.length) {
      b.height += Math.round(headlineSize * 0.38) + b.descLines.length * b.descLH;
    }
    return b;
  }

  let block = layoutBlock();
  while (block.height > available && (headlineSize > minHeadline || descSize > minDesc)) {
    if (headlineSize > minHeadline) headlineSize = Math.round(headlineSize * 0.94);
    else descSize = Math.round(descSize * 0.94);
    block = layoutBlock();
  }

  // 2b. E cresce, quando sobra espaço. Sem isso, um título curto ("Sobrevive
  // ou Quebra?") fica pequeno no meio de um card vazio — encolher resolve o
  // recorte, mas só crescer resolve a composição.
  const maxHeadline = Math.round(width * 0.092);
  while (headlineSize < maxHeadline) {
    const anterior = headlineSize;
    headlineSize = Math.round(headlineSize * 1.05);
    const maior = layoutBlock();
    if (maior.height > available * 0.94) {
      headlineSize = anterior;
      block = layoutBlock();
      break;
    }
    block = maior;
  }

  // 3. Bloco centralizado na vertical, ancorado na margem esquerda.
  let y = contentTop + Math.max(0, (available - block.height) / 2);
  ctx.textAlign = "left";
  ctx.textBaseline = "top";

  if (opts.eyebrow) {
    const text = String(opts.eyebrow).toUpperCase();
    ctx.font = `700 ${eyebrowSize}px system-ui, sans-serif`;
    const padX = Math.round(eyebrowSize * 0.8);
    const pillW = ctx.measureText(text).width + padX * 2;
    ctx.fillStyle = "rgba(74, 141, 248, 0.16)";
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(margin, y, pillW, block.pillH, block.pillH / 2);
    else ctx.rect(margin, y, pillW, block.pillH);
    ctx.fill();
    ctx.fillStyle = accent;
    ctx.fillText(text, margin + padX, y + Math.round((block.pillH - eyebrowSize) / 2));
    y += block.pillH + Math.round(headlineSize * 0.42);
  }

  ctx.fillStyle = opts.headlineColor || "#6EE7A8";
  ctx.font = `900 ${headlineSize}px system-ui, sans-serif`;
  block.headlineLines.forEach((line) => {
    ctx.fillText(line, margin, y);
    y += block.headlineLH;
  });

  if (block.descLines.length) {
    y += Math.round(headlineSize * 0.38);
    ctx.fillStyle = "#9AA7C2";
    ctx.font = `500 ${descSize}px system-ui, sans-serif`;
    block.descLines.forEach((line) => {
      ctx.fillText(line, margin, y);
      y += block.descLH;
    });
  }

  if (!showFooter) return;

  ctx.fillStyle = accent;
  ctx.fillRect(margin, ruleY, Math.round(width * 0.055), ruleH);

  ctx.font = `500 ${brandSize}px system-ui, sans-serif`;
  const brandWidth = ctx.measureText(CONFIG.brand).width;

  // URL e marca dividem a mesma linha — a URL encolhe se necessário para
  // nunca encostar na marca.
  const url = CONFIG.siteUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const urlRoom = maxWidth - brandWidth - margin * 0.6;
  let fittedUrl = urlSize;
  ctx.font = `700 ${fittedUrl}px system-ui, sans-serif`;
  while (ctx.measureText(url).width > urlRoom && fittedUrl > width * 0.016) {
    fittedUrl = Math.round(fittedUrl * 0.94);
    ctx.font = `700 ${fittedUrl}px system-ui, sans-serif`;
  }
  ctx.fillStyle = "#E8EDF7";
  ctx.fillText(url, margin, urlY + (urlSize - fittedUrl) * 0.5);

  ctx.textAlign = "right";
  ctx.font = `500 ${brandSize}px system-ui, sans-serif`;
  ctx.fillStyle = "#7C8AA6";
  ctx.fillText(CONFIG.brand, width - margin, urlY + (urlSize - brandSize) * 0.5);
  ctx.textAlign = "left";
}

/**
 * Mede o bloco eyebrow + headline + linhas sem desenhar nada, para que
 * `generateCard` possa encolher e centralizar antes de pintar. Devolve as
 * linhas já quebradas, então a medição e o desenho nunca divergem.
 */
function measureTextBlock(ctx, opts, sizes, maxLineWidth) {
  let height = 0;

  const eyebrow = opts.eyebrow || null;
  if (eyebrow) height += sizes.eyebrow * 1.75;

  ctx.font = `900 ${sizes.headline}px system-ui, sans-serif`;
  const headlineLines = String(opts.headline)
    .split("\n")
    .flatMap((segment) => wrapCanvasText(ctx, segment, maxLineWidth));
  height += headlineLines.length * sizes.headline * 1.12;

  ctx.font = `500 ${sizes.body}px system-ui, sans-serif`;
  const bodyLines = (opts.lines || []).flatMap((line) =>
    wrapCanvasText(ctx, line, maxLineWidth)
  );
  if (bodyLines.length) {
    height += sizes.headline * 0.45 + bodyLines.length * sizes.body * 1.5;
  }

  return { height, eyebrow, headlineLines, bodyLines };
}

/**
 * Altura total que o rodapé simples ocupa. Existe para que o texto acima
 * saiba onde parar — a causa da sobreposição antiga era o rodapé usar
 * frações de ALTURA enquanto as fontes usavam frações de LARGURA; num card
 * 1200x630 as duas escalas discordam e as linhas colidem.
 */
function measureCardFooter(width) {
  return (
    Math.round(width * 0.028) * 1.4 +
    Math.round(width * 0.031) * 1.4 +
    Math.round(width * 0.022) * 1.4 +
    width * 0.05
  );
}

function drawCardBackground(ctx, width, height) {
  const grad = ctx.createLinearGradient(0, 0, width, height);
  grad.addColorStop(0, "#06090F");
  grad.addColorStop(1, "#0E2148");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);
}

/**
 * Caixa de cupom de presente: borda tracejada, oferta + link, no
 * terço inferior do card. É o que transforma "card de resultado
 * genérico" em algo que a pessoa quer guardar/usar.
 */
function drawCouponBox(ctx, width, height, coupon) {
  const marginX = width * 0.08;
  const boxH = height * 0.24;
  const boxY = height * 0.72;
  const boxW = width - marginX * 2;
  const radius = width * 0.02;

  ctx.save();
  ctx.strokeStyle = "#4A8DF8";
  ctx.lineWidth = Math.max(2, width * 0.0025);
  ctx.setLineDash([width * 0.012, width * 0.01]);
  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(marginX, boxY, boxW, boxH, radius);
  } else {
    ctx.rect(marginX, boxY, boxW, boxH);
  }
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();

  const cx = width / 2;
  let cy = boxY + boxH * 0.28;

  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic"; // esta caixa posiciona por baseline; generateCard usa "top"
  ctx.font = `700 ${Math.round(width * 0.028)}px system-ui, sans-serif`;
  ctx.fillStyle = "#4A8DF8";
  ctx.fillText("🎁 " + (coupon.label || "PRESENTE POR RESPONDER"), cx, cy);

  cy += boxH * 0.32;
  ctx.font = `800 ${Math.round(width * 0.032)}px system-ui, sans-serif`;
  ctx.fillStyle = "#E8EDF7";
  const offerLines = String(coupon.offerText || "").split("\n");
  offerLines.forEach((line) => {
    ctx.fillText(line, cx, cy);
    cy += width * 0.038;
  });

  cy = boxY + boxH * 0.86;
  ctx.font = `600 ${Math.round(width * 0.024)}px system-ui, sans-serif`;
  ctx.fillStyle = "#9AA7C2";
  ctx.fillText("Resgatar em: " + CONFIG.siteUrl.replace(/^https?:\/\//, "").replace(/\/$/, ""), cx, cy);
}

function drawCardFooter(ctx, width, height, label) {
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  const cx = width / 2;
  const labelSize = Math.round(width * 0.028);
  const urlSize = Math.round(width * 0.031);
  const brandSize = Math.round(width * 0.022);

  // Empilha de baixo para cima a partir da borda, com espaçamento derivado
  // do próprio tamanho da fonte — nunca de frações da altura do card.
  let y = height - width * 0.05 - (labelSize * 1.4 + urlSize * 1.4 + brandSize * 1.4);

  ctx.font = `600 ${labelSize}px system-ui, sans-serif`;
  ctx.fillStyle = "#4A8DF8";
  ctx.fillText(label || "Teste em:", cx, y);
  y += labelSize * 1.4;

  const url = CONFIG.siteUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");
  let fittedUrl = urlSize;
  ctx.font = `700 ${fittedUrl}px system-ui, sans-serif`;
  while (ctx.measureText(url).width > width * 0.88 && fittedUrl > width * 0.018) {
    fittedUrl = Math.round(fittedUrl * 0.94); // URL longa não pode vazar a borda
    ctx.font = `700 ${fittedUrl}px system-ui, sans-serif`;
  }
  ctx.fillStyle = "#E8EDF7";
  ctx.fillText(url, cx, y);
  y += urlSize * 1.4;

  ctx.font = `500 ${brandSize}px system-ui, sans-serif`;
  ctx.fillStyle = "#7C8AA6";
  ctx.fillText(CONFIG.brand, cx, y);
}

function downloadCanvasAsPng(canvas, filename) {
  canvas.toBlob((blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  });
}

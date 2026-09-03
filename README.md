# O Setup do Nômade

Descubra o stack ideal de cartões, saques e pagamentos para viajar sem pagar taxas bancárias abusivas.

Construído com o [ferramenta-kit](https://github.com/dltacademy/ferramenta-kit) — página única, zero backend, zero build.

## Antes de divulgar

1. Preencher `config.js`: links por canal, catálogo `offers` e username do Telegram. GoatCounter é opcional e pode permanecer vazio.
2. Personalizar o `og-image.svg` 1200×630 desta ferramenta; o asset do template é só um ponto de partida e nunca deve chegar ao ar sem título específico.
3. Habilitar GitHub Pages no repo (Settings → Pages → Source: GitHub Actions).
4. Testar local: `python3 -m http.server 8000`.
5. Rodar `python3 security_check.py .` e `node --check` nos arquivos JS; corrigir sem adicionar `unsafe-inline` ou `unsafe-eval`.
6. Seguir `SECURITY_BASELINE.md` e o gate do `CONVERSION_FRAMEWORK.md`: testar recomendações, parâmetros inválidos, console e links deslogado.
7. Se usar a calculadora ATM compartilhada, seguir `ATM_CALCULATOR.md` e repetir fonte, data, mercado, escopo e custos excluídos na própria peça.
8. Somente então trocar a meta `noindex` por `index, follow`; manter `robots.txt` com `Allow: /`, confirmar o sitemap e divulgar com `?c=<canal>&v=<variante>`.

## Domínio

Esta ferramenta pertence ao ecossistema **DLT Academy**: URL canônica em `https://setup-nomade.dlt.academy/`, logo apontando para `https://dlt.academy/` e registro no portal + sitemap antes da indexação.

## Estrutura

Ver o [README do kit](https://github.com/dltacademy/ferramenta-kit) pra entender o padrão completo. `SECURITY_BASELINE.md` e `CONVERSION_FRAMEWORK.md` são normativos.

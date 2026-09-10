# Setup Nômade

Hub/portfólio vivo do stack usado na prática para viver e trabalhar de qualquer lugar: dinheiro, pagamentos, cripto, IA, produtividade, infraestrutura digital e viagem.

A raiz (`index.html`) é editorial/comercial e explica **o que é usado, para quê, quando faz sentido e quais links são de afiliado**. Ela não é uma lista genérica de apps e não deve virar um catálogo orientado por comissão.

## Arquitetura de produto

- `/` — **Setup Nômade**: hub principal do stack real.
- `/setup-viagem.html` — **Setup de viagem**: fluxo guiado que antes ocupava a raiz; monta camadas de pagamento para uma viagem específica.
- `config.js` + `js/flow*.js` — configuração e motor da ferramenta de viagem.

## Regras editoriais

1. Só incluir ferramenta com função clara no setup ou contexto real de uso/teste.
2. Marcar links de indicação/afiliado de forma explícita e usar `rel="sponsored"` quando aplicável.
3. **Não inventar nem pesquisar um referral novo só para preencher a página.** O link afiliado precisa já estar publicado/documentado no ecossistema DLT Academy ou ser fornecido/confirmado diretamente pelo operador.
4. Quando existir divergência entre planejamento e produção, priorizar o link efetivamente publicado e vigente; registrar a inconsistência para revisão em vez de criar uma terceira versão.
5. Afiliado não determina ranking. Alternativas sem comissão devem aparecer quando fizerem mais sentido.
6. Não prometer taxas, cashback, cobertura ou benefícios sem conferir as condições vigentes.
7. Organizar por problema resolvido, não por empresa.
8. A página deve continuar útil mesmo que todos os CTAs afiliados sejam removidos.

## Desenvolvimento

Página estática, zero backend e zero build. Para testar localmente:

```bash
python3 -m http.server 8000
```

Antes de publicar mudanças no fluxo de viagem, executar `python3 security_check.py .` e `node --check` nos arquivos JS. `SECURITY_BASELINE.md` e `CONVERSION_FRAMEWORK.md` continuam normativos para módulos interativos e ofertas.

## Domínio

URL canônica: `https://setup-nomade.dlt.academy/`.

O projeto pertence ao ecossistema DLT Academy, mas o Setup Nômade deve manter identidade de produto própria: um ponto único para descobrir e entender o stack utilizado na prática.

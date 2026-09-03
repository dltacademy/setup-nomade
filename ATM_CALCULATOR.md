# Calculadora de custo conhecido do saque

Este é o padrão pequeno de interação para comparar o custo conhecido de uma retirada repetida. Ele vive em `template/js/dlt-interactions.js` e só é ativado quando a peça declara `data-calc="atm"`.

## Escopo verificado

- Mercado: Brasil.
- Planos comparados: ARQ Standard, Wise para cartão emitido no Brasil e Revolut Standard.
- Data da última verificação: 04/08/2026.
- A entrada é o equivalente em BRL do valor de cada retirada e a quantidade de retiradas no mês.
- A conta soma conversão, IOF e tarifa própria do cartão. Para uma rota BRL → moeda estrangeira, os campos de IOF começam em 3,50% para Wise e Revolut e podem ser ajustados quando o app mostrar outra alíquota ou quando o saldo já estiver pré-convertido.
- A tarifa do operador do ATM é variável e fica fora da fórmula, como disclaimer obrigatório da peça. DCC também fica fora porque a orientação é recusar a conversão do caixa.

| Produto | Custos conhecidos usados na calculadora |
|---|---|
| ARQ Standard | 1% sobre cada retirada + aproximadamente 0,5% na conversão BRL↔USDc/EURc, total informado pela ARQ como IOF, spread e serviço. |
| Wise | 1 retirada gratuita por mês; R$ 20 nas seguintes + tarifa de conversão a partir de 0,78% + IOF de 3,50% quando BRL é convertido para moeda estrangeira. O 0,78% é piso publicado e pode variar por moeda/valor. A página atual não publica uma franquia monetária adicional para cartões emitidos no Brasil; os limites diário/mensal da conta aparecem no app. |
| Revolut Standard | Até R$ 1.600 ou cinco retiradas por mês, o que ocorrer primeiro; depois 2% ou R$ 6, o maior + câmbio BRL sem tarifa até R$ 1.000/mês e 1,4% depois do limite + IOF de 3,50% ajustável da conversão. |

Fontes oficiais consultadas:

- [Wise — preços e tarifas](https://wise.com/br/pricing/);
- [Wise — conta global e IOF](https://wise.com/br);
- [Wise — estrutura de saques](https://wise.com/pt/help/articles/3GuSCwDgRqiYrsUc2eo7MN/estrutura-e-tarifas-de-saque-em-caixas-eletronicos);
- [Wise — IOF nos cartões do Brasil](https://wise.com/help/articles/2oXQxOw2uAtpipyzMHQyaT/wise-cards-in-brazil);
- [Wise — limites e tarifas individuais de saque](https://wise.com/pt/help/articles/2935769/quanto-custa-para-retirar-dinheiro-em-caixas-eletronicos-com-o-meu-cartao-da-wise);
- [Wise — adendo histórico do cartão, atualizado em 19/11/2024](https://wise.com/imaginary-v2/images/73466f57ad8ea0e19ed37a79a4e0f8a7-Adendo%20Carta%CC%83o%20-%20PT%20version.pdf);
- [Revolut — tarifas do plano Standard](https://www.revolut.com/en-BR/legal/standard-fees/);
- [Revolut — tarifas Standard com IOF e spread BRL](https://cdn.revolut.com/terms_and_conditions/pdf/personal_fees_standard_77a71c54_1.4.5_1771879635_en.pdf);
- [ARQ — conversão, IOF, spread e serviço](https://help.arqfinance.com/pt-BR/articles/14627024-o-que-e-a-campanha-taxa-de-conversao-zero);
- [ARQ — tarifas de ATM e DCC](https://help.arqfinance.com/en/articles/13551411-atm-withdrawal-fees-and-how-to-avoid-surprise-fees);
- [Receita Federal — trajetória legal do IOF-câmbio](https://www.gov.br/receitafederal/pt-br/centrais-de-conteudo/publicacoes/estudos/notas-cetad/notas-tecnicas/2022/nota-cetad-coest-no-011-2022).

## Contrato de uso

1. A peça deve repetir a data, mercado, premissas e escopo perto da calculadora.
2. A copy deve dizer “custo conhecido estimado”, indicar que o IOF da Wise acontece na conversão (não como uma segunda tarifa automática do saque) e listar explicitamente a tarifa do ATM e o DCC como custos fora da fórmula.
3. Se qualquer fonte mudar, atualizar este documento, `atmTariffs`, a peça pública que usa o padrão e os testes no mesmo ciclo.
4. O componente não envia valores nem respostas: todo o cálculo ocorre no navegador.

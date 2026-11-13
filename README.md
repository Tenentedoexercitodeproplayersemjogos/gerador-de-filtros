# Gerador de Filtros — FIIs e Ações

Ferramenta estática e independente para montar um roteiro de filtros de FIIs ou ações e copiar o resultado. O site **não aplica filtros automaticamente** e **não é afiliado ao Investidor10**. Ele organiza o que configurar na plataforma e o que conferir manualmente em cada ativo.

**Site:** https://tenentedoexercitodeproplayersemjogos.github.io/gerador-de-filtros/

## O que tem

- Duas classes: **FIIs** e **Ações**.
- Estilos para FIIs: Renda, Valor, Segurança e Constância.
- Métodos para Ações: Benjamin Graham, Warren Buffett, Peter Lynch, Luiz Barsi, Décio Bazin, Philip Fisher e Equilibrado.
- Critérios numéricos editáveis, com opção de ativar/desativar cada um.
- Checklist manual para o que não é capturado por filtro: vacância, contratos, gestão, histórico de proventos, payout, governança e preço-teto.
- Botão **Copiar roteiro** com texto formatado.
- Atalhos para listas e rankings do Investidor10.
- Layout responsivo, fontes locais e nenhuma dependência de CDN.

## Como usar

1. Escolha a classe e um estilo.
2. Ajuste os critérios que fazem sentido para você.
3. Confira as verificações manuais.
4. Copie o roteiro e configure os filtros no Investidor10.
5. Abra cada ativo e confira os pontos que o filtro não vê.

## Observações e limites

- Os estilos são **adaptações educacionais** de princípios públicos. Não são métodos oficiais, completos ou uma representação dos investidores citados.
- O Investidor10 pode mudar nomes, campos e URLs. Alguns indicadores aparecem apenas como coluna, não como filtro; nesse caso, use a coluna de mesmo nome.
- FIIs exigem análise qualitativa: vacância, contratos, inquilinos, gestão e liquidez não cabem inteiramente em um filtro.
- O site não coleta dados, não tem login, não usa telemetria e não armazena informações. Tudo roda no navegador.
- Nada aqui é recomendação de compra ou venda.

## Publicação

- GitHub Pages a partir da branch `main`, na raiz do repositório.
- `.nojekyll` incluído para publicar os arquivos diretamente.
- Fontes e favicons são locais, em `assets/`.

## Estrutura

```text
.
├── index.html
├── .nojekyll
├── README.md
└── assets
    ├── app.js
    ├── style.css
    ├── fonts/
    └── img/
```

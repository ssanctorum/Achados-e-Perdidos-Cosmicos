# Achados e Perdidos Cósmicos (Cosmic Lost & Found)

Explorador interativo do hardware que a NASA deixou na Lua, em Marte e no espaço profundo. Projeto da equipe Cuscuz Cósmico para o NASA Space Apps Challenge.

## Estrutura

- `index.html`: marcação da página
- `css/style.css`: estilos e modos de acessibilidade
- `js/app.js`: hub, globo em canvas, cards, i18n PT/EN e acessibilidade
- `data/items.json`: itens, textos e fontes (única fonte de conteúdo)

## Dados

Cada item tem `fonte` e `data_consulta`. Itens com `pendente` ainda precisam de verificação em fonte oficial (NSSDCA, NASA, JPL).

## Pendências

VLibras, dado vivo da Voyager, arrastar o globo, fontes locais, imagens nos cards, teste com leitor de tela e no celular.

# Achados e Perdidos Cósmicos (Cosmic Lost & Found)

Explorador interativo do hardware que a NASA deixou na Lua, em Marte e no espaço profundo.  
Projeto da equipe **Cuscuz Cósmico** para o [NASA Space Apps Challenge 2026](https://www.spaceappschallenge.org/).

Desafio: *Abandoned but not Forgotten* — contar a história desse equipamento para estudantes, mostrando a ciência que ele tornou possível.

## Demo

- Repositório: https://github.com/ssanctorum/Achados-e-Perdidos-Cosmicos  
- Site (GitHub Pages): https://ssanctorum.github.io/Achados-e-Perdidos-Cosmicos/

## O que faz

- **Hub**: sistema solar visto de cima, com Terra, Marte e Lua nas posições reais do dia.
- **Globos**: zoom até o ponto aproximado de cada item na Lua, em Marte ou na Terra.
- **Espaço profundo**: trajetórias simplificadas de sondas (Voyager, Pioneer).
- Cada card: o que é, o que descobriu, onde está hoje, último sinal e descrição visual (audiodescrição).

## Stack

- HTML, CSS e JavaScript
- **Three.js** (WebGL) para hub, globos e espaço profundo
- Lista, cards e controles em **HTML real** (acessíveis)
- Dados em `data/items.json` (única fonte de conteúdo)
- Fonte Lexend hospedada localmente

## Dados da NASA

Usamos apenas dados abertos e páginas oficiais:

- Coordenadas e fichas de missão: [NSSDCA](https://nssdc.gsfc.nasa.gov/), páginas de missão da NASA e JPL
- Cada item em `items.json` tem o campo `fonte` e `data_consulta`
- Posições de Terra/Marte/Lua no hub: elementos keplerianos aproximados (JPL), só para visualização

Não usamos o nome “NASA” no título do app para não sugerir endosso oficial. Siga as [diretrizes de mídia da NASA](https://www.nasa.gov/nasa-brand-center/images-and-media/) se adicionar imagens.

## Acessibilidade (meta WCAG 2.2 AA)

Explorável de vários jeitos:

| Modo | Como |
|------|------|
| Visual | Globos e hub em WebGL, alto contraste |
| Teclado | Tab, Enter, Esc; foco gerenciado; hash na URL |
| Áudio | Botão “Ouvir” (Web Speech API) lê história + descrição visual |
| Libras | VLibras em PT-BR (cards em HTML real) |
| Modo calmo | Sem movimento automático, menos brilho, cores menos saturadas |

Checklist:

- [x] HTML semântico, botões reais, `aria-label` / `aria-live`
- [x] `prefers-reduced-motion` e `prefers-contrast` + painel manual
- [x] Tamanho de texto e espaçamento ajustáveis
- [ ] Teste formal com NVDA / VoiceOver / TalkBack
- [ ] Validação com usuários reais (se não houver, ser honesto no pitch)

## Como rodar

Com **Live Server** (VS Code/Cursor) ou GitHub Pages — ou qualquer servidor estático na pasta do projeto.

## Estrutura

```
index.html          # marcação + Three.js (CDN)
css/styles.css      # tema e modos de acessibilidade
js/app.js           # cenas Three.js, navegação, i18n
data/items.json     # itens e textos
fonts/              # Lexend local
LICENSE             # MIT
CREDITS.md
AI_USAGE.md
```

## Pendências

- Vídeo de backup (1–2 min)
- Teste em celular / Chromebook e com leitor de tela
- Arrastar o globo (opcional)
- Distância viva da Voyager (opcional; hoje valor estático com data)
- Imagens oficiais nos cards (opcional, com crédito)

## Licença

MIT — ver `LICENSE`. Three.js e Lexend: ver `CREDITS.md`.

# Uso de IA

Usamos IA como assistente de programação, revisão e redação. As decisões do projeto (tema, público, escopo, o que entra e o que sai) foram da equipe. Este arquivo registra o que a IA fez, o que a equipe fez e o que **ainda não foi verificado por uma pessoa**.


## Ferramentas

- Claude (Anthropic), em conversas de chat: planejamento, revisão de código, testes automatizados e documentação.
- Grok (xAI), em itens e migração para WebGL

## Registro

| Data | O que foi feito | Papel da IA | Papel da equipe |
| --- | --- | --- | --- |
| 14/11/2026 | Planejamento do projeto (conceito, telas, acessibilidade, modelo de dados, cronograma) | Redigir o planejamento em Markdown | Definiu o tema, o público (10 a 14 anos) e o escopo; decidiu cortes |
| 14/11/2026 | `data/items.json` com 17 itens, textos em PT e EN, descrições visuais | Grok (xAI) gerou e revisou textos | Definiu as regras (80 palavras, modelo fixo, 30 a 40 palavras na descrição visual). Conferência nas fontes: **em andamento** (ver abaixo) |
| 14/11/2026 | Estrutura em `index.html`, `css/` e `js/` | Separou e organizou o código | Revisou e testou |
| 14/11/2026 | Correções no `app.js`: "por que ficou" e itens relacionados no card, botão Ouvir/Parar, alto contraste no canvas, erro de carregamento visível, `scripts/validate.py` | Claude revisou o código contra o planejamento e escreveu as correções | Aprovou e aplicou cada commit |
| 14/11/2026 | Fonte Lexend local, tamanho do texto e espaçamento ajustáveis | Claude escreveu | Aprovou e aplicou |
| 14/11/2026 | VLibras (só PT-BR), contador de itens explorados, visual do hub | Claude escreveu a integração e o contador; o visual foi evoluído pela equipe | Aprovou e aplicou |
| 15/11/2026 | Hub 3D (sistema solar real do dia), globos, modelos 3D, texturas, fotos da NASA nos cards | [preencher: ferramenta] | Direção do visual, escolha de itens, testes no Chrome (desktop e celular) |
| 15/11/2026 | Modo sem WebGL (hub e cards em HTML), trajetória das sondas no card, `scripts/check_links.py`, `CONTRIBUTING.md`, remoção de código sem uso | Claude revisou, escreveu e testou (jsdom) | Aprovou e aplicou |
| 15/11/2026 | Girar e inclinar o hub (arrastar, setas, "Restaurar vista"); correção do VLibras abrindo sozinho no celular | Claude escreveu e testou a lógica (jsdom, Three.js real com renderizador simulado) | Pediu, aprovou e aplicou; testar no celular |
| 15/11/2026 | README, CREDITS e este arquivo | Claude redigiu | Revisou e confirmou os campos |

## O que foi verificado e como

- **Por máquina:** sintaxe do JavaScript, `scripts/validate.py` (estrutura, limites de palavras, modelo fixo, relacionados, status, coordenadas) e testes automatizados da lógica (navegação, giro do hub, modo sem WebGL, VLibras).
- **Por pessoas da equipe:** desempenho e visualização em desktop e mobile.

## O que ainda NÃO foi verificado por uma pessoa

- A conferência dos fatos, datas e coordenadas de cada item contra a fonte oficial. O campo `data_consulta` foi preenchido em lote em 14/11/2026 e **não prova** que cada item foi conferido; a conferência item a item está em andamento.
- Os links de `fonte` e das fotos da NASA (`scripts/check_links.py` serve para isso).
- A origem das texturas de Marte e Sol (informada pela equipe, não conferida contra os arquivos originais).
- Direção das sondas (`ra_h`, `dec_deg`), que são aproximadas e devem ser conferidas no JPL Horizons.
- Leitor de tela, axe, Lighthouse e desempenho em aparelhos fracos. Nenhuma pessoa com deficiência validou o app.

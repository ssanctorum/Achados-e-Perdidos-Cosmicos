# Achados e Perdidos Cósmicos (Cosmic Lost & Found)

Explorador interativo do hardware que a NASA deixou na Lua, em Marte, na Terra e no espaço profundo.
Projeto da equipe **Cuscuz Cósmico** para o [NASA Space Apps Challenge 2026](https://www.spaceappschallenge.org/), desafio *Abandoned but not Forgotten*.

## Demo

- Site: https://ssanctorum.github.io/Achados-e-Perdidos-Cosmicos/
- Repositório: https://github.com/ssanctorum/Achados-e-Perdidos-Cosmicos
- Link direto para um item (exemplo): `#lua/apollo11_lm`

## O problema e a ideia

Equipamentos de missões da NASA ficaram parados na Lua, em Marte e a caminho das estrelas. Quase ninguém conta a história deles para crianças, e menos ainda de um jeito que todas possam explorar.

Criamos um mapa interativo para estudantes de 10 a 14 anos. Cada item explica **o que é, o que descobriu, onde está hoje e qual foi o último sinal**. O projeto foi pensado desde o início para ser explorável de vários jeitos: visual, teclado, áudio, Libras e modo calmo.

## O que o app faz

- **Hub:** o sistema solar visto de cima, com Sol, órbitas e Terra, Marte e Lua nas posições aproximadas do dia. Dá para girar, inclinar e dar zoom (botão "Restaurar vista" volta ao início).
- **Terra, Lua e Marte:** globos que giram e dão zoom até o ponto aproximado de cada item.
- **Rumo às estrelas:** Voyager 1 e 2 e Pioneer 10 e 11, na direção aproximada em que viajam, com a distância em UA e a data da medição.
- **17 itens** (2 na Terra, 5 na Lua, 6 em Marte, 4 no espaço profundo). Cada card tem história, descrição visual (usada na audiodescrição), último sinal, "por que ficou", itens relacionados e foto da NASA.
- **Contador de itens explorados**, em PT e EN.

## Dados da NASA: quais e onde

| O que | De onde | Onde está no projeto |
| --- | --- | --- |
| Fatos, datas e status dos itens | Páginas oficiais da NASA (NSSDCA, science.nasa.gov, mars.nasa.gov, ILRS, Lunar Sample Curator do JSC) | `data/items.json`, campo `fonte` de cada item |
| Coordenadas (lat/lng) | Fichas das missões (ver `fonte`) | `data/items.json` |
| Posição de Terra, Marte e Lua no hub | Elementos keplerianos aproximados (JPL) | cálculo em `js/app.js`, só para visualização |
| Direção das sondas (`ra_h`, `dec_deg`) e distância (UA) | Valores aproximados, a conferir no JPL Horizons | `data/items.json` |
| Fotos dos cards | NASA Image and Video Library (`images-assets.nasa.gov`), carregadas do site da NASA | campo `imagem` em `data/items.json` |
| Texturas de Terra e Lua | Exemplos do three.js (repositório MIT) | `textures/`, créditos em `CREDITS.md` |
| Texturas de Marte e Sol | Solar System Scope (CC BY 4.0) | `textures/`, créditos em `CREDITS.md` |

Não usamos o nome "NASA" no título do app para não sugerir endosso oficial.

## Acessibilidade (meta WCAG 2.2 AA)

| Modo | Como |
| --- | --- |
| Visual | Alto contraste (também via `prefers-contrast`), tamanho do texto e espaçamento ajustáveis, descrição visual em todo card |
| Teclado | Tab e Enter, Esc volta, setas giram o hub, Home restaura a vista, foco gerenciado, link direto por `#corpo/item` |
| Áudio | Botão "Ouvir" (Web Speech API) lê nome, história, descrição visual e último sinal; botão "Parar" |
| Libras | VLibras só em PT-BR, com os cards em HTML real; não abre sozinho |
| Modo calmo | Sem movimento automático, menos brilho, cores menos saturadas (também via `prefers-reduced-motion`) |
| Sem WebGL | Hub vira botões em HTML; lista, cards e "Ouvir" continuam funcionando |

Lista, cards e controles são HTML real; o 3D é um complemento visual, não o único caminho.

**Status honesto:**

- [x] HTML semântico, botões reais, `aria-live` e idioma da página (`lang`) atualizado ao trocar PT e EN
- [x] `prefers-reduced-motion` e `prefers-contrast`, com painel manual
- [x] Testes da lógica (navegação, giro do hub, modo sem WebGL, VLibras) e validação do `items.json`
- [ ] Teste com leitor de tela (NVDA, VoiceOver ou TalkBack)
- [ ] Medição com axe e Lighthouse
- [ ] Validação com pessoas reais (cegas, surdas, autistas)
- [x] Medição de desempenho testado a olho, sem medição

Seguimos as diretrizes WCAG 2.2 e boas práticas, mas **ainda não afirmamos conformidade**: o app não foi validado por pessoas com deficiência.

## Limites e honestidade

- **Escala fictícia.** Tamanhos e distância Terra-Lua são ampliados; há um aviso fixo na interface. As distâncias reais aparecem em números.
- **Dados em conferência.** Cada item tem `fonte` e `data_consulta`, mas a conferência item a item nas fontes oficiais ainda está em andamento. Posições são aproximadas e não servem para navegação.
- **Uso de IA.** Parte do código e dos textos foi feita com ajuda de IA. Está descrito em [AI_USAGE.md](AI_USAGE.md).
- **VLibras** é uma ferramenta externa: precisa de internet, só existe em PT-BR e o avatar pode errar termos técnicos.
- **Fotos** vêm do site da NASA; se não carregarem, o card mostra o modelo 3D.
- **Voz do "Ouvir"** depende do navegador e do aparelho.

## Como rodar

```
python3 -m http.server
```

Abra `http://localhost:8000`. Os dados são carregados por `fetch`, então não funciona abrindo o arquivo direto (`file://`).

Validação dos dados:

```
python3 scripts/validate.py      # estrutura, limite de palavras, relacionados (0 erros)
```

## Estrutura

```
index.html            # marcação (HTML real)
css/styles.css        # tema e modos de acessibilidade
js/app.js             # navegação, cenas Three.js, i18n, acessibilidade
js/models.js          # modelos 3D dos itens
js/vendor/            # Three.js (r160), local
data/items.json       # itens e textos (única fonte de conteúdo)
textures/             # texturas de Sol, Terra, Lua e Marte
fonts/                # Lexend, local
scripts/              # validate.py
CREDITS.md  AI_USAGE.md  LICENSE
```

## Próximos passos

- Testes com leitor de tela e com pessoas reais; vídeos em Libras com intérprete humano
- Conferir todos os itens, coordenadas e fotos nas fontes
- Distância viva da Voyager (JPL Horizons), hoje valor estático com data
- Modo offline (PWA), terceiro idioma (ES), mais itens
- Sonificação e realidade aumentada

## Licença e créditos

Código sob licença MIT (`LICENSE`). Bibliotecas, fontes, dados e mídia: `CREDITS.md`. Uso de IA: `AI_USAGE.md`.

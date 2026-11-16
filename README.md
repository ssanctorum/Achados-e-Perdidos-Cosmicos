# Achados e Perdidos Cósmicos (Cosmic Lost & Found)

Um explorador interativo do hardware que a NASA deixou na Lua, em Marte, na Terra e no espaço profundo.

Projeto desenvolvido pela equipe **Cuscuz Cósmico** para o [NASA Space Apps Challenge 2026](https://www.spaceappschallenge.org/), no desafio **Abandoned but not Forgotten**.

## Demonstração

- **Site:** https://ssanctorum.github.io/Achados-e-Perdidos-Cosmicos/
- **Repositório:** https://github.com/ssanctorum/Achados-e-Perdidos-Cosmicos
- **Link direto para um item:** `#lua/apollo11_lm`

## O problema e a proposta

Equipamentos utilizados em missões espaciais permanecem na Lua, em Marte, na Terra e em trajetórias pelo espaço profundo. Apesar de fazerem parte da história da exploração espacial, muitos desses objetos ainda são pouco conhecidos pelo público, especialmente pelas crianças.

Pensando nisso, desenvolvemos um mapa interativo voltado para estudantes de 10 a 14 anos, que permite explorar esses equipamentos e conhecer suas histórias. Cada item apresenta informações sobre o que é, o que descobriu, onde está atualmente e qual foi seu último sinal conhecido.

Desde o início, o projeto foi pensado para oferecer diferentes formas de interação, considerando recursos visuais, navegação por teclado, audiodescrição, suporte à Libras e um modo de navegação mais tranquilo.

## Funcionalidades

- **Hub:** representação interativa do sistema solar, com o Sol, as órbitas e as posições aproximadas da Terra, de Marte e da Lua. Permite girar, inclinar e aplicar zoom. O botão "Restaurar vista" retorna à posição inicial.
- **Terra, Lua e Marte:** globos interativos com rotação e zoom, permitindo visualizar a localização aproximada de cada equipamento.
- **Rumo às estrelas:** visualização das sondas Voyager 1 e 2 e Pioneer 10 e 11, com suas direções aproximadas, distâncias em unidades astronômicas (UA) e datas das medições.
- **17 itens exploráveis:** distribuídos entre Terra (2), Lua (5), Marte (6) e espaço profundo (4).
- **Cards informativos:** cada equipamento possui história, descrição visual, último sinal conhecido, motivo de permanência no local, itens relacionados e imagem da NASA.
- **Contador de exploração:** registra a quantidade de itens explorados, com suporte aos idiomas português e inglês.

## Dados da NASA: fontes e utilização

| Informação | Fonte | Localização no projeto |
| --- | --- | --- |
| Fatos, datas e status dos equipamentos | Páginas oficiais da NASA (NSSDCA, science.nasa.gov, mars.nasa.gov, ILRS e Lunar Sample Curator do JSC) | `data/items.json`, campo `fonte` de cada item |
| Coordenadas geográficas (latitude e longitude) | Fichas das missões, indicadas no campo `fonte` | `data/items.json` |
| Posições da Terra, Marte e Lua no hub | Elementos keplerianos aproximados do JPL | Cálculos em `js/app.js`, utilizados apenas para visualização |
| Direção das sondas (`ra_h`, `dec_deg`) e distância (UA) | Valores aproximados, sujeitos à conferência no JPL Horizons | `data/items.json` |
| Imagens dos cards | NASA Image and Video Library (`images-assets.nasa.gov`) | Campo `imagem` em `data/items.json` |
| Texturas da Terra e da Lua | Exemplos do Three.js (licença MIT) | Pasta `textures/`, com créditos em `CREDITS.md` |
| Texturas de Marte e do Sol | Solar System Scope (CC BY 4.0) | Pasta `textures/`, com créditos em `CREDITS.md` |

O nome NASA não foi utilizado no título da aplicação para evitar qualquer interpretação de que o projeto seja oficialmente desenvolvido, patrocinado ou endossado pela agência.

## Acessibilidade

O projeto foi desenvolvido considerando as diretrizes de acessibilidade da **WCAG 2.2 AA**, buscando oferecer diferentes formas de acesso e interação.

| Recurso | Implementação |
| --- | --- |
| **Acessibilidade visual** | Alto contraste, inclusive por meio de `prefers-contrast`, além de ajustes no tamanho do texto e no espaçamento. Todos os cards possuem descrição visual. |
| **Navegação por teclado** | Suporte a Tab e Enter, Esc para retornar, setas para girar o hub, Home para restaurar a visualização, gerenciamento de foco e acesso direto por `#corpo/item`. |
| **Audiodescrição** | Botão "Ouvir", utilizando a Web Speech API para ler o nome, a história, a descrição visual e o último sinal de cada equipamento. Também possui botão "Parar". |
| **Libras** | Integração com o VLibras, disponível apenas em português brasileiro. Os cards permanecem em HTML real e o recurso não é iniciado automaticamente. |
| **Modo calmo** | Redução de movimentos automáticos, brilho e saturação das cores, com suporte a `prefers-reduced-motion`. |
| **Alternativa sem WebGL** | Quando o WebGL não está disponível, o hub é substituído por botões em HTML. A lista, os cards e o recurso de áudio continuam funcionando. |

A lista, os cards e os controles são construídos com HTML real. A visualização em 3D funciona como um complemento visual, não sendo o único meio de acesso ao conteúdo.

### Status da acessibilidade

- [x] HTML semântico, botões funcionais, `aria-live` e atualização do idioma da página (`lang`) ao alternar entre português e inglês.
- [x] Suporte a `prefers-reduced-motion` e `prefers-contrast`, com painel de configurações manual.
- [x] Testes da lógica de navegação, rotação do hub, funcionamento sem WebGL e integração com VLibras.
- [x] Validação da estrutura do arquivo `items.json`.
- [ ] Testes com leitores de tela (NVDA, VoiceOver ou TalkBack).
- [ ] Avaliação com ferramentas como axe e Lighthouse.
- [ ] Validação com pessoas com deficiência visual, auditiva e neurodivergentes.

O projeto segue diretrizes e boas práticas de acessibilidade, mas ainda não declara conformidade com a WCAG 2.2 AA, pois não passou por validação com usuários com deficiência.

## Limitações e transparência

- **Escala ilustrativa:** os tamanhos dos corpos celestes e as distâncias entre a Terra e a Lua foram ampliados para facilitar a visualização. A interface apresenta um aviso sobre essa adaptação, enquanto as distâncias reais são informadas numericamente.
- **Dados em conferência:** cada item possui campos de fonte (`fonte`) e data de consulta (`data_consulta`), mas a verificação individual de todas as informações nas fontes oficiais ainda está em andamento. As posições apresentadas são aproximadas e não devem ser utilizadas para navegação.
- **Uso de inteligência artificial:** parte do código e dos textos foi desenvolvida com auxílio de ferramentas de IA. Os detalhes estão disponíveis em [AI_USAGE.md](AI_USAGE.md).
- **VLibras:** é uma ferramenta externa que depende de conexão com a internet, está disponível apenas em português brasileiro e pode apresentar imprecisões na tradução de termos técnicos.
- **Imagens:** as fotografias são carregadas diretamente do site da NASA. Caso não estejam disponíveis, o card apresenta o modelo 3D correspondente.
- **Recurso de áudio:** a voz utilizada pelo botão "Ouvir" depende dos recursos disponíveis no navegador e no dispositivo.

## Como executar o projeto

É necessário ter o Python 3 instalado.

Na pasta principal do projeto, execute:

```bash
python3 -m http.server
```

Em seguida, acesse:

```text
http://localhost:8000
```

**Importante:** os dados são carregados por meio de `fetch`. Por isso, a aplicação precisa ser executada em um servidor local e não funciona corretamente ao abrir o arquivo diretamente pelo protocolo `file://`.

### Validação dos dados

Para verificar a estrutura dos dados, o limite de palavras e os relacionamentos entre os itens, execute:

```bash
python3 scripts/validate.py
```

A validação atual retorna zero erros.

## Estrutura do projeto

```text
index.html            # Estrutura HTML da aplicação
css/styles.css        # Estilos e modos de acessibilidade
js/app.js             # Navegação, Three.js, idiomas e acessibilidade
js/models.js          # Modelos 3D dos equipamentos
js/vendor/            # Biblioteca Three.js (r160), armazenada localmente
data/items.json       # Dados e textos dos equipamentos
textures/             # Texturas do Sol, Terra, Lua e Marte
fonts/                # Fonte Lexend, armazenada localmente
scripts/              # Scripts de validação
CREDITS.md            # Créditos e atribuições
AI_USAGE.md           # Documentação do uso de IA
LICENSE               # Licença do projeto
```

## Próximos passos

- Realizar testes com leitores de tela e pessoas com deficiência.
- Desenvolver vídeos em Libras com intérprete humano.
- Conferir individualmente os equipamentos, as coordenadas e as imagens nas fontes oficiais.
- Implementar atualização dinâmica das distâncias da Voyager por meio do JPL Horizons.
- Desenvolver um modo offline com PWA.
- Adicionar suporte ao espanhol.
- Expandir a quantidade de equipamentos exploráveis.
- Implementar recursos de sonificação e realidade aumentada.

## Licença e créditos

O código-fonte do projeto está disponível sob a licença **MIT**, conforme especificado no arquivo `LICENSE`.

As bibliotecas, fontes, dados, imagens e demais recursos utilizados possuem seus respectivos créditos e atribuições documentados em `CREDITS.md`.

As informações sobre a utilização de ferramentas de inteligência artificial estão disponíveis em `AI_USAGE.md`.

# Cosmic Lost & Found (Achados e Perdidos Cósmicos)

An interactive explorer of the hardware left behind by NASA missions on the Moon, Mars, Earth, and in deep space.

A project developed by **Team Cuscuz Cósmico** for the [NASA Space Apps Challenge 2026](https://www.spaceappschallenge.org/), addressing the **Abandoned but not Forgotten** challenge.

## Demo

- **Website:** https://ssanctorum.github.io/Achados-e-Perdidos-Cosmicos/
- **Repository:** https://github.com/ssanctorum/Achados-e-Perdidos-Cosmicos
- **Direct link to an item:** `#lua/apollo11_lm`

## The problem and our approach

Equipment used in space missions remains on the Moon, on Mars, on Earth, and along paths through deep space. Although these objects are part of the history of space exploration, many of them remain largely unknown to the public, especially children.

To address this, we developed an interactive map designed for students aged 10 to 14, allowing them to explore this equipment and discover its stories. Each item explains what it is, what it discovered, where it is currently located, and what its last known signal was.

Accessibility was considered from the beginning of development. The project offers different ways to interact with its content, including visual resources, keyboard navigation, audio descriptions, Brazilian Sign Language (Libras) support, and a calm mode.

## Features

- **Hub:** an interactive representation of the solar system, featuring the Sun, orbital paths, and approximate positions of Earth, Mars, and the Moon. Users can rotate, tilt, and zoom the view. The "Restore View" button returns to the initial position.
- **Earth, Moon, and Mars:** interactive globes with rotation and zoom controls, allowing users to explore the approximate locations of each piece of equipment.
- **Into Deep Space:** visualization of the Voyager 1 and 2 and Pioneer 10 and 11 probes, showing their approximate directions, distances in astronomical units (AU), and measurement dates.
- **17 explorable items:** distributed across Earth (2), the Moon (5), Mars (6), and deep space (4).
- **Informational cards:** each item includes its history, visual description, last known signal, reason for remaining in its location, related items, and a NASA image.
- **Exploration counter:** tracks the number of explored items and supports both Portuguese and English.

## NASA data: sources and usage

| Information | Source | Project location |
| --- | --- | --- |
| Equipment facts, dates, and status | Official NASA pages (NSSDCA, science.nasa.gov, mars.nasa.gov, ILRS, and the JSC Lunar Sample Curator) | `data/items.json`, each item's `fonte` field |
| Geographic coordinates (latitude and longitude) | Mission records, referenced in each item's source field | `data/items.json` |
| Earth, Mars, and Moon positions in the hub | Approximate Keplerian elements from JPL | Calculated in `js/app.js`, for visualization only |
| Probe directions (`ra_h`, `dec_deg`) and distances (AU) | Approximate values, pending verification through JPL Horizons | `data/items.json` |
| Card images | NASA Image and Video Library (`images-assets.nasa.gov`) | `imagem` field in `data/items.json` |
| Earth and Moon textures | Three.js examples (MIT License) | `textures/`, with credits in `CREDITS.md` |
| Mars and Sun textures | Solar System Scope (CC BY 4.0) | `textures/`, with credits in `CREDITS.md` |

The NASA name is not used in the application's title to avoid suggesting that the project is officially developed, sponsored, or endorsed by the agency.

## Accessibility

The project was developed with the **WCAG 2.2 AA** accessibility guidelines in mind, aiming to provide different ways of accessing and interacting with its content.

| Feature | Implementation |
| --- | --- |
| **Visual accessibility** | High-contrast mode, including `prefers-contrast` support, adjustable text size and spacing. Every card includes a visual description. |
| **Keyboard navigation** | Tab and Enter support, Esc to go back, arrow keys to rotate the hub, Home to restore the view, focus management, and direct access through `#body/item`. |
| **Audio descriptions** | The "Listen" button uses the Web Speech API to read each item's name, story, visual description, and last known signal. A "Stop" button is also available. |
| **Libras** | Integration with VLibras, available only in Brazilian Portuguese. Cards remain accessible through real HTML, and the feature does not start automatically. |
| **Calm mode** | Reduces automatic movement, brightness, and color saturation, with support for `prefers-reduced-motion`. |
| **WebGL fallback** | When WebGL is unavailable, the hub is replaced with HTML buttons. The item list, cards, and audio features remain functional. |

The item list, cards, and controls are built using real HTML elements. The 3D visualization is an additional visual feature, not the only way to access the content.

### Accessibility status

- [x] Semantic HTML, functional buttons, `aria-live`, and page language (`lang`) updates when switching between Portuguese and English.
- [x] Support for `prefers-reduced-motion` and `prefers-contrast`, with a manual settings panel.
- [x] Logic tests covering navigation, hub rotation, WebGL fallback, and VLibras integration.
- [x] Validation of the `items.json` structure.
- [ ] Screen reader testing (NVDA, VoiceOver, or TalkBack).
- [ ] Evaluation using tools such as axe and Lighthouse.
- [ ] Validation with people with visual, hearing, and neurodivergent disabilities.

The project follows accessibility guidelines and best practices, but does not yet claim WCAG 2.2 AA compliance, as it has not been validated with users with disabilities.

## Limitations and transparency

- **Illustrative scale:** the sizes of celestial bodies and the Earth-Moon distances have been enlarged to make visualization easier. The interface displays a permanent notice about this adjustment, while actual distances are provided numerically.
- **Data under verification:** each item includes source (`fonte`) and consultation date (`data_consulta`) fields. However, individual verification of all information against official sources is still ongoing. Positions are approximate and should not be used for navigation.
- **Use of artificial intelligence:** some of the code and text were developed with the assistance of AI tools. Further details are available in [AI_USAGE.md](AI_USAGE.md).
- **VLibras:** an external tool that requires an internet connection, is available only in Brazilian Portuguese, and may produce inaccuracies when translating technical terms.
- **Images:** photographs are loaded directly from NASA's website. If they are unavailable, the corresponding 3D model is displayed on the card.
- **Audio feature:** the voice used by the "Listen" button depends on the browser and device capabilities.

## How to run the project

Python 3 must be installed.

From the project's root directory, run:

```bash
python3 -m http.server
```

Then open:

```text
http://localhost:8000
```

**Important:** the application loads its data using `fetch`. Therefore, it must run on a local server and will not work correctly when opening the file directly through the `file://` protocol.

### Data validation

To check the data structure, word limits, and relationships between items, run:

```bash
python3 scripts/validate.py
```

The current validation returns zero errors.

## Project structure

```text
index.html            # Application HTML structure
css/styles.css        # Styles and accessibility modes
js/app.js             # Navigation, Three.js scenes, languages, and accessibility
js/models.js          # 3D models of the equipment
js/vendor/            # Three.js library (r160), stored locally
data/items.json       # Equipment data and descriptions
textures/             # Sun, Earth, Moon, and Mars textures
fonts/                # Lexend font, stored locally
scripts/              # Validation scripts
CREDITS.md            # Credits and attributions
AI_USAGE.md           # AI usage documentation
LICENSE               # Project license
```

## Future improvements

- Conduct screen reader testing and accessibility evaluations with people with disabilities.
- Develop Libras videos featuring a human interpreter.
- Verify all equipment, coordinates, and images against official sources.
- Implement dynamic Voyager distance updates through JPL Horizons.
- Develop offline support using PWA technology.
- Add Spanish language support.
- Expand the collection of explorable equipment.
- Implement sonification and augmented reality features.

## License and credits

The project's source code is available under the **MIT License**, as specified in the `LICENSE` file.

Libraries, fonts, data, images, and other resources used in the project are documented in `CREDITS.md`, along with their respective credits and attributions.

Information about the use of artificial intelligence tools is available in `AI_USAGE.md`.

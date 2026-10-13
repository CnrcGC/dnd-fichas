# D&D Fichas — Plano visual: Grimório de aventureiro

**Base atual:** por decisão do proprietário, a biblioteca e as preferências foram integradas diretamente na `main` 1.21, em `Área de Trabalho/Jogo/dnd-fichas`, e registradas no commit `70636e8`. Resultados da integração em [MAIN_INTEGRATION.md](./MAIN_INTEGRATION.md). As matrizes e números anteriores deste documento são históricos da cópia candidata. VIS-G03 e VIS-G04 aplicadas sobre esse commit; evidências específicas em [VIS_G03.md](./VIS_G03.md) e [VIS_G04.md](./VIS_G04.md).

Data: 2026-10-12. Direção escolhida pelo usuário: **papel, tinta, selos e detalhes de fantasia**.

Estado: **BIBLIOTECA APROVADA E FECHADA EM 2026-10-13**. VIS-G01 e VIS-G02 foram aplicadas na cópia local: cabeçalho D&D, tratamentos compartilhados e biblioteca. O usuário aprovou a direção geral e pediu simplificação dos controles, barra de rolagem própria e retorno ao topo. Complementa o MVP de apresentação e mantém seus fluxos e critérios de acessibilidade. Base examinada: `codex/mvp-apresentacao`, commit `5ea5e3b`, com a aplicação publicada da tag `mvp-rc-2026-10-12`.

## Conceito

**Uma biblioteca de aventuras, com cada personagem registrado nas páginas de um grimório.**

A personalidade aparece no cabeçalho, nas capas dos personagens, nos títulos de seção, nas abas e em pequenos detalhes de tinta. A área de leitura e edição continua clara: nomes, números, regras, erros e ações precisam ser compreendidos rapidamente durante a mesa.

O projeto já tem uma base adequada: títulos Spectral, corpo Work Sans, papel claro, tinta escura, dourado, temas, ícones SVG, tokens e controles acessíveis. A primeira entrega vai construir sobre essa base.

## Diagnóstico da interface atual

Evidência: código de Home, Topbar, NovaFicha, Ficha e estilos compartilhados; capturas `output/screenshots/biblioteca-1280.png` e `ficha-1280.png`, feitas com texto ampliado.

| Observação | Efeito percebido | Mudança proposta |
|---|---|---|
| Cabeçalho mostra “Plataforma RPG”; a biblioteca mostra “D&D Fichas”. | Identidade dividida entre ferramenta genérica e produto. | Dar presença ao nome D&D Fichas no contexto D&D. Após feedback, retirar o seletor de sistema dessa interface; preservar dados e rotas dos demais sistemas. |
| Logo central grande, seguido de busca e cards simples. | A marca concentra a fantasia; o restante parece uma página administrativa. | Cabeçalho de biblioteca mais compacto, com título, frase curta e ações próximas dos personagens. |
| Cards se diferenciam principalmente pelo texto. | Pouca personalidade de personagem e aparência de cadastro. | Composição de capa: nome, classe, nível em marcador e pequeno símbolo. |
| Muitas áreas repetem borda, fundo e arredondamento semelhantes. | Identidade visual pouco variada e hierarquia fraca. | Distinguir capa, página de leitura, campo editável e aviso. |
| Barra lateral da ficha reúne identidade, escolhas, progressão, prontidão e atributos. | Em texto ampliado, forma uma coluna muito longa e afasta informações úteis. | Rever agrupamento e posição dos blocos existentes, preservando ordem de leitura e ações. |
| Ornamentos praticamente restritos ao logo. | A ficha não transmite a mesma atmosfera da marca. | Pequenos filetes, marcadores, molduras e símbolos compartilhados entre as telas. |

Essas observações são uma avaliação de design, não uma constatação de novos bugs funcionais. O plano visual anterior na raiz descreve um estado antigo; não assumir ausência de temas, skip link, tabs ou modais acessíveis, pois essas implementações existem na base atual.

## Linguagem visual

| Elemento | Direção |
|---|---|
| Tema claro | Papel marfim, tinta escura, dourado envelhecido. Textura discreta apenas nas áreas decorativas. |
| Tema escuro | Tinta da noite, superfícies de leitura bem diferenciadas e dourado com contraste. Mesma composição do tema claro. |
| Tipografia | Preservar Spectral em títulos e Work Sans em campos, regras e botões; números alinhados quando útil. |
| Formas | Páginas com cantos discretos, capas com borda lateral, abas como marcadores e selos pequenos. |
| Ícones | Reutilizar `Icon.jsx`; manter traço consistente. Acrescentar somente os símbolos necessários. |
| Decoração | Filetes, pequenas marcas de canto e fundos em CSS/SVG. Densidade baixa, especialmente no mobile. |
| Texto | Um toque de aventura na abertura; nomes de ações diretos: “Criar personagem”, “Importar ficha”, “Subir de nível”. |
| Movimento | Resposta breve a hover/foco; mudanças imediatas com movimento reduzido. Sem partículas, parallax ou animação contínua. |

Começar pelas cores existentes: papel `#fffdf7`, fundo `#f6f2e8`, tinta `#242018` e acento `#795b19` no claro; fundo `#14151d`, superfície `#1d1f2b`, texto `#e8e1cf` e acento `#c9a355` no escuro. São a base atual, não uma nova aprovação de todos os pares de contraste. Ajustes futuros exigem medição nos estados reais.

Uma aparência própria virá principalmente da composição e dos detalhes recorrentes. Fotografias, retratos e texturas pesadas não são necessários para a primeira entrega.

## Escopo e ordem de execução

As prioridades abaixo são internas ao trabalho visual. Pendências P0 de validação do MVP continuam tendo precedência no aceite da apresentação. Nenhuma alteração visual é publicada sem verificar os fluxos afetados. A tag atual permanece como referência de comparação e retorno.

### VIS-G01 — Assinatura visual e cabeçalho

**Prioridade: alta. Dependência: nenhuma.**

- Definir quatro tratamentos reutilizáveis: capa, página, campo e aviso.
- Criar detalhes de borda, filete e marcador por tokens, usando as superfícies existentes.
- Dar presença à marca D&D Fichas nas telas D&D; conservar o comportamento multissistema.
- Exibir engrenagem para configurações de acessibilidade e botão de sol/lua para tema; retirar a escolha de sistema do contexto D&D, conforme feedback do usuário.
- Preservar o logo atual como referência; evitar repetir o lockup grande em toda tela.

Arquivos principais: `src/styles/tokens.css`, `src/styles/components/surfaces.css`, `src/components/layout/Topbar.jsx` e `Topbar.css`. Verificar onde o contexto do sistema é aplicado antes de introduzir estilos específicos; não presumir que toda a página está sob `[data-system]`.

**Aceite:** marca consistente entre cabeçalho e biblioteca; quatro superfícies reconhecíveis; tema e configurações continuam acessíveis por teclado e com texto 150%; escolha de sistema ausente nas telas D&D; Pilares de Atlas conserva sua identidade. Revisar alterações globais para não ornamentar automaticamente os outros sistemas.

### VIS-G02 — Biblioteca com aparência de coleção de grimórios

**Prioridade: alta. Dependência: VIS-G01. Primeira entrega visível.**

- Substituir a composição dominada pelo logo por uma abertura compacta: marca, “Seus personagens”, frase curta e ações.
- Proposta de frase: **“Um lugar para suas próximas aventuras.”**
- Organizar busca e ações junto à coleção; manter criação como ação principal e importação como secundária.
- Dar aos cards aparência de capa: pequeno símbolo, nome forte, classe legível e nível em marcador.
- Usar os dados já disponíveis; data de criação permanece secundária. Não adicionar edição de capa ou upload de retrato.
- Nome comprido e personagem sem classe precisam de composição válida; o símbolo nunca substitui o texto da classe.
- Manter exportação, exclusão recuperável e lixeira claramente identificadas.
- Estado vazio com uma composição própria e instrução objetiva: **“Crie seu primeiro personagem ou importe uma ficha.”**

Arquivos principais: `src/pages/Home.jsx`, `Home.css` e `src/components/icons/Icon.jsx`, se necessário.

**Aceite:** uma ficha e várias fichas formam uma coleção coerente; o estado vazio tem personalidade; cards continuam legíveis em 320/390 px e texto 150%; todas as ações atuais permanecem disponíveis. Comparar antes/depois nos dois temas antes de aplicar o estilo às demais telas.

### VIS-G03 — Ficha como páginas de personagem

**Prioridade: alta. Dependências: VIS-G01 e revisão de VIS-G02.**

**Execução em 2026-10-13:** identidade e resumo de combate na abertura, atributos em faixa própria, campos e rolagens diferenciados, abas como marcadores e impressão separada. Biblioteca aprovada pelo proprietário; VIS-G03 disponível para revisão visual. Ver [VIS_G03.md](./VIS_G03.md) para verificações e limites da validação.

- Construir um bloco de identidade com hierarquia entre nome, raça, classe e nível, usando os dados existentes.
- Dar destaque imediato a vida, defesa e ações de uso frequente.
- Revisar o agrupamento da coluna lateral para reduzir o corredor de formulários, especialmente com texto ampliado. Ajustar composição dos blocos existentes, sem introduzir novas etapas de edição.
- Apresentar atributos como quadros de referência e seções como capítulos com títulos e filetes discretos.
- Dar às abas aparência de marcadores; preservar seus nomes, ordem, estado selecionado e navegação por setas/Home/End.
- Manter diferenças claras entre valor de leitura, campo editável e botão de rolagem.
- A decoração acompanha o conteúdo; alturas fixas ou molduras não podem cortar nomes, mensagens ou campos.

Arquivos principais: `src/pages/Ficha.jsx`, `Ficha.css` e os componentes existentes em `src/components/ficha/`. Alterar componentes relacionados ao layout, sem modificar regras, normalização ou persistência.

**Aceite:** os blocos essenciais são encontrados rapidamente; identidade, atributos e conteúdo da aba têm hierarquia; ficha pronta, rascunho e escolhas pendentes continuam compreensíveis; teclado e retorno de foco preservados; impressão mantém a ficha A4 limpa.

### VIS-G04 — Criação como registro de um novo aventureiro

**Prioridade: média. Dependências: VIS-G01 e VIS-G02.**

**Execução em 2026-10-13:** capítulos numerados com estados textuais, abertura de grimório, opções com filetes e descrição, seleção mantida ao voltar e orientação para sub-raça/ancestralidade antes da confirmação. Etapas puladas sem escolha são identificadas como pendentes. Fluxo, foco, validação, dados gerados e alternativas de rascunho/ficha em branco preservados. Resultados e pendências em [VIS_G04.md](./VIS_G04.md).

- Apresentar as cinco etapas atuais como capítulos numerados.
- Distinguir etapa atual, concluída e pendente por texto/forma, além de cor.
- Dar às opções de raça, classe e antecedente aparência de entradas de um livro, com espaço adequado para descrição e ação.
- Preservar títulos diretos e labels atuais; acrescentar personalidade nos elementos de abertura.
- Manter erros e orientações próximos das escolhas; o aspecto de grimório não pode esconder uma seleção obrigatória.
- Conservar criação em branco e rascunho como opções explícitas, secundárias à criação guiada.

Arquivos principais: `src/pages/NovaFicha.jsx` e `NovaFicha.css`.

**Aceite:** percurso atual completo sem etapas extras; seleção e erro fáceis de reconhecer nos dois temas; foco de etapa mantido; finalização continua produzindo a mesma ficha válida.

### VIS-G05 — Detalhes de mesa e consistência dos estados

**Prioridade: média. Dependências: VIS-G03 e VIS-G04.**

- Aplicar a linguagem comum a magias, inventário, recursos e modais: título, ação e conteúdo bem separados.
- Dar ao resultado de rolagem uma composição que destaque resultado, tipo de teste e detalhes; preservar o anúncio textual.
- Refinar o painel flutuante de dados para combinar com a ficha e manter espaço de foco e rolagem.
- Diferenciar salvo, salvando e falha com texto e sinais visuais discretos. Um selo de salvamento só aparece quando a gravação é confirmada; “Ficha pronta” continua sendo outro estado.
- Concentrar ornamentos nos títulos e divisórias, mantendo tabelas, números e inputs claros.

Arquivos principais: componentes afetados em `src/components/ficha/`, `src/components/modal/`, `src/components/rolagem/` e `src/components/layout/AvisoPersistencia.*`.

**Aceite:** mesmos tratamentos visuais nas telas; resultados e avisos compreensíveis sem cor; painel não encobre o controle focado; modais mantêm foco, Escape, rolagem e leitura. Nenhuma mudança no conteúdo persistido.

### VIS-G06 — Revisão visual e validação da candidata

**Prioridade: obrigatória para publicar cada entrega. A revisão global fecha o conjunto.**

- Capturar biblioteca vazia/com fichas, criação, ficha, modal e erro de salvamento nos temas claro e escuro.
- Verificar 320, 390, 768 e 1280 px; texto 100/125/150%; zoom nativo 200%; nomes longos e mensagens extensas.
- Conferir contraste do texto, limites de controles, foco e estados; também revisar os detalhes decorativos sobre fundos reais.
- Conferir teclado, NVDA, redução de movimento e layout impresso.
- Executar lint e os builds local/Pages; conservar budgets de 425 KiB para entrada e 100 KiB para adapter inicial D&D.
- Rodar os E2E das telas alteradas e `test:a11y`; para mudanças de layout global, executar a regressão completa e ensaios de produção/Pages.
- Não substituir capturas esperadas ou mudar assertions automaticamente. Avaliar se a diferença corresponde ao design aprovado e preserva o comportamento.
- Publicar uma candidata visual somente depois da revisão do diff e dos checks; documentar qualquer pendência humana real.

Arquivos relacionados: `tests-e2e/library.spec.js`, `creation.spec.js`, `sheet.spec.js`, `keyboard.spec.js`, `sheet-accessibility.spec.js`, `text-reflow.spec.js`, `tests-release/` e `docs/MVP_VALIDATION.md`.

**Aceite:** identidade recorrente nas três telas centrais, controles legíveis e acessíveis, fluxo completo preservado, orçamento respeitado, impressão sem ornamentos prejudiciais e evidência de antes/depois revisada. Automação não significa conformidade formal WCAG.

## Primeira entrega recomendada

**VIS-G01 + VIS-G02: cabeçalho e biblioteca.** Uma abertura, estado vazio e cards nos dois temas são suficientes para avaliar se o grimório tem a personalidade desejada. Depois dessa revisão, aplicar a mesma linguagem à ficha e à criação.

Essa sequência evita investir na decoração de toda a aplicação antes de verificar se a direção funciona nas telas mais reconhecíveis. Não exige fonte nova, biblioteca de componentes nova, motor de animação ou alteração de dados.

## Limites desta etapa

Backend, autenticação, sincronização, novos sistemas, catálogo, mapas/VTT, retratos editáveis e áudio não fazem parte do plano visual. Não substituir o logo, inventar automação de regras ou alterar nomes funcionais para metáforas difíceis de entender. Não aplicar textura sobre regras/campos, fontes ornamentais em números ou animações de virar páginas.

A personalização também deve funcionar com fallback de fonte, movimento reduzido e impressão. Novos assets decorativos devem ser pequenos e ter origem registrada. Preservar IDs, `systemId`, adapters, migrations, JSONs e testes de dados.

## Referências de acessibilidade

- Texto normal: referência mínima 4,5:1; texto grande: 3:1, observando a definição de texto grande. [W3C — Contrast Minimum](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html).
- Informações visuais necessárias para reconhecer controles/estados devem respeitar o contraste aplicável de 3:1. Ornamentos não substituem foco nem limites de controles. [W3C — Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html).
- Reflow como referência de leitura em 320 CSS px, considerando exceções previstas. [W3C — Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html).

## Estado da entrega deste plano

VIS-G01 e VIS-G02 aplicadas localmente em 2026-10-12. Prévia: `http://127.0.0.1:4175/dnd5e`. O site publicado e a tag do MVP seguem como referência; biblioteca e preferências aprovadas em 2026-10-13; esta iteração ainda não foi publicada.

### Estado encontrado e implementação — registro da primeira rodada

- **IMPLEMENTADO na base:** tokens, temas, tamanho de texto persistido, biblioteca funcional, importação/exportação, lixeira, restauração e ícones SVG.
- **PARCIAL na base:** identidade concentrada no logo e cabeçalho genérico; composição pouco distinta entre superfícies.
- **AUSENTE na base:** capas com lombada/páginas, selo de abertura e tratamentos reutilizáveis de grimório.
- **BUG corrigido durante a iteração:** marca ultrapassava 320 px com texto a 150%; limite de largura e quebra aplicados. A revisão das capturas também levou ao ajuste do título no mobile e à retirada da sobreposição do histórico de dados sobre a abertura.
- **ADIADO nesta entrega:** VIS-G03/04/05 e revisão global de VIS-G06; aguardam avaliação da primeira composição.

O logo existente aparece compacto no cabeçalho. Tema, texto e sistema têm legendas visíveis; Pilares de Atlas e F&M mantêm o cabeçalho anterior. A biblioteca usa uma abertura em papel, título “Seus personagens”, contagem separada, busca identificada, selos por classe e cards com lombada. Controles importantes têm alvo mínimo de 44 px nesta composição. Os estilos novos são aplicados por classes optativas sob `[data-system="dnd5e"]`. Na biblioteca, o histórico de dados participa do fluxo ao final da página, para não cobrir títulos e capas; seu funcionamento e a posição flutuante nas fichas continuam preservados.

Importação, exportação, exclusão, restauração e navegação usam os handlers existentes. Não houve mudança em modelos, IDs, migrações, repositories, envelopes, catálogos ou regras. Os testes que verificavam “Personagens D&D: N” agora verificam o título “Seus personagens” e a contagem separada; a verificação dos números e da cópia importada permanece.

### Arquivos da primeira entrega

**Modificados:**

- `src/pages/Home.jsx` e `Home.css`: composição, headings, busca, capas, estado vazio, avisos e lixeira.
- `src/components/layout/Topbar.jsx` e `Topbar.css`: marca D&D, organização e reflow dos controles.
- `src/components/icons/Icon.jsx`: livro e escudo no sistema SVG existente; símbolos decorativos ignorados por leitores de tela.
- `src/styles/tokens.css` e `src/styles/index.css`: tokens D&D e import dos tratamentos.
- `tests-e2e/helpers/dnd.js`, `library.spec.js`, `persistence.spec.js`, `system-routing.spec.js`, `text-reflow.spec.js`: título/contagem; diretório opcional `DND_SCREENSHOT_DIRECTORY` para preservar capturas anteriores.
- `tests-release/demo.spec.js` e `pages.spec.js`: título da biblioteca atualizado para esta candidata local. O logo agora é decorativo junto ao texto da marca; o teste verifica o link acessível, `alt=""` e a imagem carregada com `naturalWidth > 0`, preservando a verificação de assets.
- `docs/IMPLEMENTATION_STATUS.md`: estado da primeira iteração visual.
- Este plano: registro do que foi efetivamente aplicado.

**Criados:**

- `src/styles/components/grimoire.css`: capa, página, campo e aviso.
- `tests-e2e/grimoire-library.spec.js`: biblioteca vazia, uma/três fichas, nome longo, sem classe, axe, 100/125/150%, 320/390/768/1280 px, preferências após reload, exclusão/restauração por teclado, histórico de dados operável sem sobrepor conteúdo e troca de sistema.
- `output/visual-grimoire/`: capturas da candidata, separadas das evidências do MVP.

**Removidos:** nenhum.

### Validação da primeira entrega — registro anterior ao feedback

Validação final em 2026-10-12:

| Verificação | Resultado |
|---|---|
| `npm test` | 213 passaram; zero falhas, cancelados ou skips na execução final. |
| `npm run lint` | Passou. |
| `npm run build` | Passou; entrada 401,75/425 KiB e adapter D&D 90,57/100 KiB. |
| `npm run build:pages` | Passou; entrada 401,80/425 KiB e adapter D&D 90,57/100 KiB. |
| `npm run test:e2e -- --workers=2` | 154 de 156 passaram na rodada completa; dois casos excederam 30 s enquanto a suíte unitária também executava. |
| Repetição isolada: visual, criação/level up por teclado e sete regiões de Pilares | 8 passaram, incluindo os dois casos que excederam o tempo; nenhum timeout ou assertion existente foi alterado. |
| Nova suíte visual após o ajuste do histórico de dados | 4 passaram, nos dois temas/projetos, incluindo axe a 150%, abertura do histórico por teclado e ausência de sobreposição. |
| `npm run test:pages -- --output=test-results/pages-visual` | 8 passaram no Chrome instalado, sobre o último build: seis fluxos de demo com impressão/round trip e dois casos de assets/rotas. |
| Revisão do diff / `git diff --check` | Escopo revisado; nenhuma falha de whitespace. |
| Prévia local em 4175 | Resposta HTTP 200. O navegador interno não conseguiu anexar a aba; o endereço pode ser aberto diretamente no Chrome. |

A primeira rodada visual encontrou o overflow da marca; a correção preservou a assertion. Na primeira rodada de Pages, dois runners Playwright simultâneos compartilharam a pasta de artefatos e causaram um `ENOENT` ao fechar um caso; a rodada final sequencial passou integralmente. Executar esses runners sequencialmente; qualquer execução paralela precisa de diretórios independentes de artefatos.

As capturas novas ficam em `output/visual-grimoire/`: 16 da biblioteca, cobrindo vazio/uma capa/coleção/texto 150% em claro e escuro, em 1280 e 390 px; seis da regressão de reflow em `reflow/`. As capturas e PDFs da candidata do MVP foram preservados. As imagens usam personagens fictícios de teste.

Para reproduzir a regressão de reflow sem substituir as capturas anteriores, definir `$env:DND_SCREENSHOT_DIRECTORY = 'output/visual-grimoire/reflow'` antes do comando E2E.

As bordas dos controles novos usam um token específico com referência de contraste superior a 3:1 nos fundos de campo claro e escuro da paleta atual. Isso não representa declaração de conformidade WCAG de toda a aplicação.

**Pendências humanas:** avaliação dos ajustes solicitados, NVDA, zoom nativo de 200% e aparelho móvel real. O usuário aprovou a direção geral; próxima issue: **VIS-G03**.

### Critérios de aceite desta entrega

- [x] Marca D&D consistente; seletor retirado das telas D&D após feedback, preservando rotas e dados multissistema.
- [x] Quatro tratamentos optativos implementados; nenhuma ornamentação automática em Pilares/F&M.
- [x] Biblioteca vazia, uma ficha e coleção com aparência de grimório.
- [x] Nome longo e sem classe legíveis; ações acessíveis em 320/390/768/1280 px e texto 100/125/150%.
- [x] Importação/exportação, criação, salvamento/reabertura, exclusão/restauração e fluxos relacionados cobertos.
- [x] Temas, foco/teclado, axe, contraste das bordas novas e budgets verificados dentro dos limites descritos.
- [x] Direção geral aprovada pelo usuário; controles revisados conforme seu feedback.
- [ ] Verificações humanas de NVDA, zoom nativo e aparelho real.

## Revisão VIS-G01/02 — preferências e rolagem (registro anterior à ampliação)

Aplicada diretamente na cópia local após feedback do usuário, em 2026-10-12. Nenhum commit, push ou publicação desta iteração foi realizado.

- Seletor de sistema retirado do cabeçalho D&D em biblioteca, criação e ficha. A marca leva diretamente à biblioteca D&D. Dados, adapters e rotas dos outros sistemas permanecem compatíveis; não há migração nem exclusão de registros.
- Engrenagem abre o diálogo “Acessibilidade e aparência”, com tamanho de texto persistido (100/125/150%) e descrição associada. Reutiliza `useModalA11y`: fundo inerte, Tab/Shift+Tab contidos, Escape e retorno do foco ao acionador. Rolagem do fundo bloqueada enquanto o painel está aberto.
- Botão sol/lua alterna claro/escuro. Primeiro acesso segue o sistema operacional; escolha explícita continua salva usando a chave existente. O painel permite voltar ao padrão do sistema, acompanhando suas mudanças em tempo real.
- Barra nativa recebe trilha de marcador e acento dourado da paleta. Roda do mouse, teclado e toque mantêm comportamento nativo; cores forçadas usam a barra padrão. Navegadores com barras sobrepostas podem ocultá-las até a rolagem.
- “Voltar ao topo” aparece após 400 px de rolagem. Enter/Espaço também funcionam; o foco volta ao título principal, e movimento reduzido usa retorno imediato. O controle fica fora da impressão.
- Nenhuma preferência ilustrada no site de referência foi apresentada como implementada sem comportamento real; este painel reúne os ajustes existentes de texto e tema. Redução de movimento continua seguindo o sistema.

**Arquivos desta revisão:** modificados `src/App.jsx`, `src/components/layout/Topbar.jsx`, `Topbar.css`, `ThemeControl.jsx`, `TextSizeControl.jsx`, `src/components/icons/Icon.jsx` e `src/styles/components/grimoire.css`; criados `src/components/layout/PreferencesControl.jsx`, `PreferencesControl.css`, `BackToTop.jsx`, `tests-e2e/helpers/preferences.js` e `tests-e2e/grimoire-preferences.spec.js`. Testes de biblioteca, tema/teclado, ficha, reflow, roteamento e demo foram atualizados para usar os novos controles, preservando as verificações funcionais. Documentação atualizada neste arquivo e em `IMPLEMENTATION_STATUS.md`; nenhum arquivo removido.

### Validação da revisão anterior

| Verificação | Resultado |
|---|---|
| Suítes relacionadas de axe, biblioteca, preferências, ficha, roteamento e reflow | 76 passaram, nos projetos desktop e mobile. |
| Biblioteca e preferências após os últimos ajustes de layout | 10 passaram; inclui controles do cabeçalho em 320/390/768/1280 px, texto 100/125/150%, fechamento por Escape/fundo, foco, persistência e tema automático. |
| `node --test --test-concurrency=1 tests/theme.test.mjs tests/text-size.test.mjs` | 4 passaram, zero falhas. O otimizador do Vite registrou aviso de varredura interrompida ao encerrar os servidores SSR desses testes; os builds seguintes passaram. |
| `npm run lint` | Passou. |
| `npm run build` | Passou; entrada 406,48/425 KiB e adapter D&D 90,52/100 KiB. |
| `npm run build:pages` | Passou; entrada 406,52/425 KiB e adapter D&D 90,52/100 KiB. |
| `npm run test:pages -- --output=test-results/pages-preferences` | 9 passaram no Chrome instalado, sobre o build final: seis fluxos completos de demo, dois casos de assets/rotas e uma verificação das preferências, barra personalizada, retorno ao topo e cores forçadas. |
| Diff e `git diff --check` | Revisados; nenhuma falha de whitespace. |
| Prévia local em 4175 | Página e módulo de preferências respondem HTTP 200. |

Comando das 76 verificações: `npx playwright test tests-e2e/grimoire-preferences.spec.js tests-e2e/grimoire-library.spec.js tests-e2e/text-reflow.spec.js tests-e2e/accessibility.spec.js tests-e2e/sheet-accessibility.spec.js tests-e2e/system-routing.spec.js --workers=1 --output=test-results/grimoire-feedback`. A repetição final usou as duas primeiras suítes e `--output=test-results/preferences-final`. As assertions anteriores de dados e fluxos foram preservadas; acesso aos novos controles foi atualizado. A primeira execução do novo teste de diálogo verificava `inert` no elemento `main`; corrigida para verificar `#root`, o ancestral bloqueado pelo hook existente, mantendo a exigência de bloqueio do fundo.

Capturas específicas ficam em `output/visual-grimoire/preferences/`, incluindo os dois temas em desktop/mobile, reflow e conferência em Chrome. As capturas do MVP em `output/screenshots/` e PDFs anteriores permanecem preservados. A revisão de impressão restringiu o espaço reservado ao botão à mídia de tela e acrescentou uma verificação de padding zero no layout impresso.

**Aceite:** os ajustes solicitados foram aplicados; NVDA, zoom nativo de 200%, aparelho móvel real e avaliação visual final desses controles permanecem pendentes. Próxima issue: **VIS-G03 — Ficha como páginas de personagem**.

## Preferências ampliadas de leitura — implementação local

Solicitação posterior do usuário: texto por slider, espaçamento de leitura, alto contraste, sublinhado dos links e brilho do tema claro. Implementada diretamente na mesma cópia, sem commit ou publicação.

- **Texto:** slider nativo de 16 a 28 px de base, em passos de 1 px; aplica 100–175% à raiz e preserva a hierarquia dos tokens e o zoom do navegador. Setas, Home e End funcionam. Preferências anteriores normal/grande/muito grande correspondem a 16/20/24 px; consumidores da API anterior continuam válidos. Valores intermediários persistem numa chave adicional; o seletor legado informa tamanho personalizado quando necessário.
- **Espaçamento:** amplia entrelinhas, letras e palavras nos textos e controles, com crescimento do conteúdo e rolagem normal.
- **Alto contraste:** paletas próprias para claro e escuro, incluindo bordas, foco, texto secundário e estados. Também acompanha o tema automático. É um ajuste funcional, sem declaração formal de conformidade WCAG.
- **Links:** todos os links com destino recebem sublinhado, inclusive navegação e links apresentados como ações.
- **Brilho:** ajusta somente as superfícies do tema claro entre 80% e 100%, incluindo alto contraste. Cores de texto, avisos, bordas e placeholders foram ajustadas no modo reduzido para preservar legibilidade; não usa filtro sobre a página que alteraria modais ou impressão. No campo claro a 80%, os tokens novos de texto primário/secundário/acento têm referências calculadas acima de 4,5:1; a borda padrão supera 3:1. Axe verifica os estados reais descritos abaixo; a medição dos tokens não certifica todos os elementos.
- **Padrão:** restaura texto 16 px, opções desligadas, brilho 100% e tema automático. O painel conserva foco contido, Escape, retorno à engrenagem e cabeçalho visível; a área de rolagem considera a altura do cabeçalho ampliado.
- **Persistência:** restauração no HTML inicial, validação de valores, fallback para JSON inválido e uso na sessão quando o armazenamento está bloqueado. Não altera registros de personagens, IDs, migrations ou envelopes.
- **Impressão:** regras de leitura/contraste/brilho restritas à mídia de tela; A4 continua com fonte e cores próprias.

### Arquivos desta ampliação

Modificados: `index.html`, `src/components/layout/PreferencesControl.jsx`, `PreferencesControl.css`, `TextSizeControl.jsx`, `src/platform/preferences/textSize.js`, `src/styles/index.css`, `tokens.css`, `components/forms.css`, `tests/text-size.test.mjs`, `tests-e2e/helpers/preferences.js`, `tests-e2e/grimoire-preferences.spec.js`, `tests-release/pages.spec.js`, `docs/IMPLEMENTATION_STATUS.md` e `../README.md`. Criados: `src/platform/preferences/reading.js`, `src/styles/preferences.css`, `tests/reading-preferences.test.mjs` e `tests-e2e/reading-preferences.spec.js`. Este registro foi atualizado; nenhum arquivo removido.

### Validação da ampliação

| Verificação | Resultado |
|---|---|
| `node --test --test-concurrency=1 tests/text-size.test.mjs tests/reading-preferences.test.mjs` | 6 passaram: persistência, valores intermediários, compatibilidade, dados inválidos e storage bloqueado. Aviso do otimizador do Vite ao encerrar o servidor SSR; zero falhas dos testes. |
| Biblioteca, diálogo, leitura, ficha, criação e reflow | 30 passaram nos dois projetos. Cobrem 320/390/768/1280 px, texto até 28 px com opções combinadas, eixo de brilho, tema escuro inalterado pelo brilho, reset e impressão. |
| `npm run lint` | Passou. |
| `npm run build` | Passou; entrada 411,35/425 KiB; adapter D&D 90,52/100 KiB. |
| `npm run build:pages` | Passou; entrada 411,39/425 KiB; adapter D&D 90,52/100 KiB. |
| `npm run test:pages -- --output=test-results/pages-reading` | Registro histórico incompleto nesta tabela; consulte o relatório da integração atual na main. |
| Revisão do diff e `git diff --check` | Sem falhas de whitespace; fonte e documentação anteriores preservadas. |

Comando dos 30 cenários: definir `$env:DND_SCREENSHOT_DIRECTORY = 'output/visual-grimoire/reading/reflow'` e executar `npx playwright test tests-e2e/reading-preferences.spec.js tests-e2e/grimoire-preferences.spec.js tests-e2e/grimoire-library.spec.js tests-e2e/text-reflow.spec.js --workers=1 --output=test-results/reading-final`.

A primeira rodada encontrou labels dos interruptores sem associação nativa; corrigidos com `label`/`htmlFor`, mantendo as assertions axe. As verificações iniciais da ficha já passavam; a rodada posterior aprovou todos os 30 casos. Capturas específicas em `output/visual-grimoire/reading/`, nos dois temas e tamanhos normal/ampliado; reflow em `reading/reflow/`. Capturas e PDFs da versão publicada preservados.

**Aceite:** funcionalidades solicitadas implementadas e verificadas dentro dessa matriz. **Pendente:** NVDA, zoom nativo de 200%, aparelho real e avaliação visual do usuário. Próxima issue permanece **VIS-G03**.

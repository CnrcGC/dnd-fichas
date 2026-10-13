# VIS-G03 — Ficha como páginas de personagem

Aplicada em 2026-10-13, somente na `main` da cópia `Área de Trabalho/Jogo/dnd-fichas`, sobre `70636e8`. A biblioteca e as preferências foram aprovadas e commitadas antes desta issue. O GitHub Desktop interrompeu a automação por interação/foco da janela; o commit autorizado foi concluído pelo Git, no mesmo checkout. Sem push, tag ou publicação.

## Estado encontrado e entrega

- **IMPLEMENTADO anteriormente:** ficha, edição, cálculos, prontidão, seis abas de ativação manual, rolagens, level up, gravação e impressão A4.
- **PARCIAL anteriormente:** hierarquia visual; vida/defesa e atributos apareciam depois de uma coluna extensa de escolhas.
- **AUSENTE anteriormente:** abertura com resumo de identidade/combate e atalho direto às ações.
- **BUG corrigido nesta entrega visual:** bordas de atributos/abas ficaram em 2,12:1 no tema escuro durante a primeira revisão; foram reforçadas com a tinta secundária existente e receberam assertion específica de mínimo 3:1. Nenhum novo defeito de regras ou persistência identificado.

`Ficha.jsx` passa a apresentar nome, raça/sub-raça, classes e nível total na abertura. Vida atual/máxima, PV temporários, defesa e proficiência são valores de leitura derivados do estado existente. Nome e valores base dos atributos conservam os mesmos campos e handlers. Os seis atributos precedem os formulários, com molduras diferentes para edição e botões de rolagem. Identidade/progressão tem título visível. As abas conservam nomes, ordem, seleção e comportamento de teclado; o link “Ir para ações” leva o foco à aba atual. Prontidão e pendências continuam no bloco existente.

`Ficha.css` restringe os tratamentos de papel, lombada, capítulos e marcadores à ficha. A coluna lateral deixa de ser sticky e recebe largura relativa; a composição empilha abaixo de 900 px. Grades se reorganizam conforme largura e tamanho do texto, sem alturas fixas. A interface decorada inteira fica oculta na impressão; `FichaImpressao` permanece fora dela com seus estilos A4 próprios. Tokens de leitura/contraste, regras, modelos, adapters, IDs, migrações e formatos persistidos não foram alterados.

## Critérios de aceite

- [x] Identidade e valores essenciais aparecem na abertura; atributos antecedem os formulários.
- [x] Campos editáveis, resumo de leitura e botões de rolagem têm tratamentos distintos.
- [x] Nomes, ordem e ativação manual das abas preservados; atalho de ações utiliza foco nativo.
- [x] Prontidão, rascunho e pendências mantêm conteúdo e ações existentes.
- [x] Ornamentos excluídos da impressão, sem alterar o conteúdo do PDF.
- [ ] Revisão visual pelo proprietário e verificações humanas de NVDA/zoom nativo/aparelho móvel.

## Validação

Testes adicionados em `tests-e2e/grimoire-sheet.spec.js`: resumo atualizado após edição/reabertura, foco do atalho, ordem dos atributos, orientação da ficha em branco, contraste de bordas e separação da impressão. Nenhum teste existente foi removido ou enfraquecido.

| Verificação nesta issue | Resultado |
|---|---|
| `npx playwright test tests-e2e/grimoire-sheet.spec.js tests-e2e/sheet.spec.js tests-e2e/sheet-accessibility.spec.js tests-e2e/keyboard.spec.js tests-e2e/text-reflow.spec.js tests-e2e/reading-preferences.spec.js` | 64 passaram, sem falhas/skips. Essa matriz antecedeu o reforço final da cor das bordas. |
| `npx playwright test tests-e2e/grimoire-sheet.spec.js --reporter=list,json` | 6 passaram após o reforço das bordas e a adição da verificação de 3:1, sem falhas/skips. |
| `npm run lint` | Passou após a alteração final de código/teste. |
| `npm run build` | Passou: entrada 267,17/425 KiB; adapter D&D 90,13/100 KiB. |
| `npm run build:pages` | Passou: entrada 267,21/425 KiB; adapter D&D 90,13/100 KiB. |
| `npm run test:pages -- --reporter=list,json` | 10 passaram no Chrome instalado, sem falhas/skips: seis percursos de demonstração sem internet/backend, rotas/404, preferências e impressão acionada/composição em mídia print. |

Os 6 testes reexecutados são parte dos 64 cenários, não 6 cenários adicionais. A correção final alterou somente cores de borda; estrutura, dimensões e regras da matriz original foram mantidas. Axe foi executado nas seis abas, claro/escuro, desktop/mobile; reflow em 320/390/768/1280 px e leitura a 28 px com espaçamento/alto contraste foram cobertos. A suíte unitária de 272 casos pertence à integração anterior e não foi reexecutada nesta issue de layout.

Evidências: [matriz inicial](../output/validation/vis-g03-initial.txt), [teste final da ficha](../output/validation/vis-g03-focused.json) e [Chrome Pages](../output/validation/vis-g03-pages.json). Capturas desta issue ficam em `output/visual-grimoire/sheet/`: temas claro/escuro, abertura desktop/320 px, impressão emulada e reflow com texto ampliado. As capturas da biblioteca/leitura anteriores foram preservadas. A abertura nos dois temas e em 320 px e a composição de impressão emulada foram revisadas visualmente; essa captura não comprova paginação de um PDF físico.

## Diff e revisão

Arquivos modificados: `src/pages/Ficha.jsx`, `src/pages/Ficha.css`, `README.md` da raiz, `docs/IMPLEMENTATION_STATUS.md`, `docs/MAIN_INTEGRATION.md` e `docs/VISUAL_GRIMORIO_PLAN.md`. Arquivos criados: este registro, `tests-e2e/grimoire-sheet.spec.js`, três relatórios em `output/validation/vis-g03-*` e capturas em `output/visual-grimoire/sheet/`. Nenhum arquivo de código removido. `git diff --check` aprovado; imports, APIs de edição, cálculo, carregamento lazy e arquivos de persistência permanecem sem alterações. Implementação disponível para revisão na main, ainda sem novo commit.

Não há declaração formal de conformidade WCAG. Testes automatizados de reflow/axe/teclado não equivalem a validar NVDA, zoom nativo de 200% ou um aparelho real. Revisar claro/escuro, nomes longos, navegação das abas e prévia de impressão; a próxima issue do plano é VIS-G04, criação como registro de um novo aventureiro.

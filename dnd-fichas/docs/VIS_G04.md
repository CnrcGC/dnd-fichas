# VIS-G04 — Criação como registro de um novo aventureiro

Aplicada em 2026-10-13, na `main` da cópia `Área de Trabalho/Jogo/dnd-fichas`, por solicitação de continuar para a próxima issue. Base Git `70636e8`; alterações locais da VIS-G03 foram preservadas. Esta issue não cria novas etapas nem modifica o MVP, regras, catálogos ou persistência. Sem novo commit, push ou publicação.

## Estado encontrado

- **IMPLEMENTADO:** cinco etapas, seleção, distribuição de atributos, escolhas obrigatórias, erros associados, foco de etapa, rascunho explícito, ficha em branco e geração/gravação da ficha.
- **PARCIAL:** aspecto visual ainda genérico na criação, sem composição de capítulos/entradas de livro.
- **AUSENTE:** números e estados textuais no progresso, marcação da opção selecionada ao retornar e descrição acessível do motivo do botão de escolha bloqueado.
- **BUG visual corrigido:** a lista marcava todas as etapas anteriores como concluídas, inclusive quando puladas sem escolha.

## Alterações aplicadas

`NovaFicha.jsx` acrescenta a abertura do grimório e numeração dos capítulos. A lista continua sem controles extras de navegação e conserva `aria-current`, foco e anúncio textual da etapa atual. Estados “Atual”, “Concluído”, “Pendente” e “A seguir” usam as seleções existentes e a posição no fluxo, sem gravar metadados adicionais. A conclusão dos capítulos de raça/classe/antecedente representa seleção, não prontidão: o texto da abertura informa que escolhas obrigatórias são conferidas em Toques Finais.

Cada opção preserva título, descrição, dados e botão “Escolher”; a seleção aparece em texto quando o usuário volta. As escolhas que exigem sub-raça/ancestralidade mantêm o mesmo bloqueio e ganham uma orientação local ligada ao botão por `aria-describedby`. Os títulos acessíveis, handlers de escolha, dados produzidos, validação de finalização e alternativas de rascunho/ficha em branco foram preservados.

`NovaFicha.css` aplica papel, lombada e filetes somente à criação D&D. Remove o limite de 480 px e a rolagem interna da lista de opções; a leitura passa a acompanhar a página inteira. Capítulos se reorganizam por grade, sem rolagem horizontal obrigatória. Controles importantes mantêm 44 px de altura mínima; campos/botões possuem bordas com a tinta secundária existente, acompanhando os temas e preferências. Erros e escolhas obrigatórias recebem molduras distintas, sem ocultar conteúdo ou limitar alturas.

## Critérios de aceite

- [x] Cinco etapas existentes, sem etapas ou regras extras.
- [x] Capítulos com numeração e estados distinguíveis por texto/forma.
- [x] Títulos, labels, seleções, erro e orientação permanecem visíveis.
- [x] Rascunho e criação em branco preservados.
- [x] Foco, finalização válida, reabertura, teclado e reflow verificados nos testes relacionados.
- [ ] Avaliação visual do proprietário e verificações humanas de NVDA/zoom nativo/aparelho real.

## Validação

Testes novos em `tests-e2e/grimoire-creation.spec.js`: progresso após pular/voltar, seleção preservada, descrição do bloqueio, foco de etapas e erros, axe nos temas claro/escuro e reflow de todos os cinco capítulos em 320/390/768/1280 px com texto 28 px, espaçamento, alto contraste e links sublinhados. Suítes existentes de criação, teclado e reflow mantidas sem remoção ou enfraquecimento de assertions.

| Verificação nesta issue | Resultado |
|---|---|
| `npx playwright test tests-e2e/grimoire-creation.spec.js tests-e2e/creation.spec.js tests-e2e/keyboard.spec.js tests-e2e/text-reflow.spec.js --reporter=list,json` | 34 passaram, zero falhas/skips. |
| `npx playwright test tests-e2e/grimoire-creation.spec.js tests-e2e/keyboard.spec.js --reporter=list,json` | 14 passaram após o polimento móvel, zero falhas/skips. São parte dos 34 cenários, não 14 casos adicionais. |
| `npm run lint` | Passou após as últimas alterações. |
| `npm run build` | Passou: entrada 267,17/425 KiB; adapter D&D 90,13/100 KiB. |
| `npm run build:pages` | Passou: entrada 267,21/425 KiB; adapter D&D 90,13/100 KiB. |
| `npm run test:pages -- --reporter=list,json` | 10 passaram no Chrome instalado, zero falhas/skips: seis percursos locais de demonstração, assets/404, rota legada de criação, preferências e composição de impressão. |

A primeira captura em 320 px levou a um ajuste final: abertura com texto mais curto, H1 móvel pelo token `--text-xl` e grade de capítulos que admite duas colunas em texto normal. Texto ampliado continua reorganizando as colunas naturalmente; não há fonte fixa que ignore a preferência. Depois desse ajuste, os testes novos dos cinco capítulos e a suíte de teclado foram repetidos. A finalização de quatro combinações de raça/classe/antecedente, regras de PV da Colina, dados pessoais, idiomas sem repetição, arranjo padrão e gravação/reabertura foram cobertos pela matriz inicial. A suíte unitária não foi reexecutada, pois regras e modelos não foram alterados.

Abertura e mensagem de pendências foram revisadas visualmente no desktop e em 320 px, nos temas claro/escuro. As evidências da VIS-G03/biblioteca não foram substituídas.

Capturas próprias em `output/visual-grimoire/creation/`. Relatórios: [matriz inicial](../output/validation/vis-g04-e2e.json), [polimento final](../output/validation/vis-g04-final.json) e [Chrome Pages](../output/validation/vis-g04-pages.json). Resultados da VIS-G03 e da integração anterior não são apresentados como validação da VIS-G04. Automação não comprova conformidade formal WCAG nem substitui NVDA/zoom nativo de 200%/aparelho móvel real.

## Revisão e próxima issue

Arquivos modificados nesta issue: `src/pages/NovaFicha.jsx`, `src/pages/NovaFicha.css`, `README.md` da raiz, `docs/IMPLEMENTATION_STATUS.md` e `docs/VISUAL_GRIMORIO_PLAN.md`. Arquivos novos: este registro, teste E2E, relatórios e capturas da criação. Nenhum arquivo removido. Imports, APIs de dados, modelos, migrações, IDs e persistência permanecem intactos. `git diff --check` passou. A cópia de trabalho contém também as alterações anteriores da VIS-G03, preservadas; nenhum commit novo foi criado. Prévia local confirmada em `http://127.0.0.1:4175/dnd5e/characters/new`. Próxima issue do plano: VIS-G05 — detalhes de mesa e consistência dos estados.

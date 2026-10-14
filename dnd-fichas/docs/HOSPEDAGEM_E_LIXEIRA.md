# Hospedagem e exclusão permanente da lixeira

Entrega de 2026-10-13 na main, cópia `Área de Trabalho/Jogo/dnd-fichas`, sobre `33fdad4` (1.22). O proprietário aprovou e commitou as entregas visuais anteriores. Novas issues visuais ficam em espera durante estas pendências. Este registro não altera a especificação original do MVP.

## Hospedagem

Recomendação: manter GitHub Pages para este frontend estático/local-first. O projeto já possui build `/dnd-fichas/`, roteamento/404, publicação e testes Chrome de Pages. Vercel também suporta Vite, previews por PR e SPA com rewrite, mas adicionaria uma configuração/conta e outra origem sem necessidade para esta entrega.

Verificação real: o domínio HTTPS `https://cnrcgc.github.io/dnd-fichas/` respondeu HTTP 200. A API de Pages retornou `built`, `legacy` e fonte `gh-pages`/`/`. O script público é `assets/index-D6attC6_.js`; a referência local `origin/gh-pages` aponta para o build de apresentação `37bbf35`, anterior à main atual. Nenhuma configuração remota foi modificada. Credenciais usadas somente em memória para consulta, sem impressão ou gravação.

O workflow `.github/workflows/pages.yml` foi preparado para push na main, limitado aos caminhos do frontend/workflow, e acionamento manual da main. Mantém testes unitários, lint, build normal/Pages, budgets e ensaios Chrome antes do deploy; publica apenas `dist-pages`. Os cinco SHAs de actions fixados foram conferidos contra os commits oficiais do GitHub. O proprietário autorizou explicitamente commit, push e publicação em GitHub Pages; a ativação de **GitHub Actions** e a validação remota estão em execução.

As fichas pertencem à origem/perfil/dispositivo do navegador, não ao servidor de hospedagem. Para passar de `127.0.0.1` ao domínio público, exportar JSON e importar no site. Outros visitantes possuem suas próprias fichas. Não foi implementado backend, conta ou sincronização.

Fontes: [GitHub Pages e GitHub Actions](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site), [Vite na Vercel](https://vercel.com/docs/frameworks/frontend/vite).

## Lixeira

Estado encontrado: exclusão recuperável e restauração implementadas; exclusão permanente ausente. A biblioteca passa a oferecer “Excluir permanentemente” por ficha. Confirmação informa irreversibilidade e preservação dos JSONs exportados. Cancelar conserva o registro. Durante a operação, ações da lixeira são desabilitadas. Sucesso anuncia a exclusão e move foco ao título da lixeira ou biblioteca; falha mantém a ficha e apresenta erro com foco e orientação para tentar novamente.

A fila existente de gravação executa a exclusão. O repositório exige o sistema correto, um registro na lixeira e a revisão esperada, impedindo apagar ficha restaurada/alterada em outra aba. A camada D&D mantém a proteção de versões futuras/incompatíveis. A transação IndexedDB remove `characters` e artefatos de `migrationBackups` relacionados e grava um marcador mínimo em `migrationReceipts`, com ID/sistema/data, sem nome ou conteúdo da ficha. Esse marcador impede um snapshot atrasado de recriar o ID apagado. A interface só remove o item após o commit confirmado. Não houve mudança de versão do banco, schemas, IDs existentes ou formato de exportação.

Escopo de dados: exclusão do registro corrente e recuperação interna vinculada. JSONs exportados e fontes originais legadas preservadas pela migração continuam intactos; recibos de bootstrap impedem reimportação automática desses originais. A função não promete apagamento forense de cópias históricas, nem esvazia a lixeira inteira. Nenhuma ficha real do perfil do proprietário foi usada nos testes.

## Validação

Publicação autorizada em 2026-10-14: commit `5a9fbe0` enviado à main; Pages alterado para `build_type: workflow`, preservando HTTPS. A primeira execução remota falhou antes dos testes no `npm ci`: faltavam peers opcionais `@emnapi/core` e `@emnapi/runtime` no lockfile. O arquivo foi corrigido com npm 11.19.0 (mesma versão do runner), sem alterar versões existentes ou `package.json`; `npm ci --dry-run` com Linux/x64/glibc passou. O workflow completo será executado novamente antes de publicar.

A execução seguinte confirmou a instalação e encontrou diferença de maiúsculas nos nomes de `Blocodescanso.jsx/css`, incompatível com os imports `BlocoDescanso` no Linux. Ambos foram renomeados no Git para `BlocoDescanso.jsx/css`, sem mudança de conteúdo. A inspeção dos imports relativos de `src` encontrou somente essas duas diferenças; os testes e builds remotos continuam obrigatórios.

- `npm test`: 275 passaram, zero falhas/skips. Três testes adicionados cobrem exclusão/recuperação, outros registros, reabertura, snapshot antigo e proteções de sistema/versão/revisão.
- E2E de `trash.spec.js` e `library.spec.js`: 10 passaram em desktop/mobile. Cancelamento, confirmação por teclado, foco, reload, falha depois do request de exclusão com abort da transação, preservação de backup e nova tentativa; outra ficha restaurável; texto 28 px/reflow e axe cobertos. [Relatório](../output/validation/trash-e2e.json).
- `npm run lint`: passou.
- `npm run build`: passou, entrada 268,49/425 KiB, adapter D&D 91,44/100 KiB.
- `npm run build:pages`: passou, entrada 268,52/425 KiB, adapter D&D 91,44/100 KiB.
- `npm run test:pages -- --reporter=list,json`: 11 passaram no Chrome instalado, zero falhas/skips, incluindo exclusão definitiva e reabertura no build de produção. [Relatório](../output/validation/trash-pages.json).
- `git diff --check`: passou; importação/exportação, modelos, catálogos, rotas e proteção de registros incompatíveis foram preservados.

Um teste de exclusão permanente foi acrescentado aos ensaios de Pages, usando Chrome e apenas dados fictícios. A suíte completa foi mantida; nenhum teste removido ou assertion enfraquecida. Testes automatizados não equivalem a conformidade formal WCAG; NVDA/zoom nativo/aparelho real permanecem como validações humanas.

## Arquivos e pendências

Modificados: `.github/workflows/pages.yml`, `src/platform/persistence/characterRepository.js`, `src/systems/dnd5e/characterStore.js`, `src/context/FichasContext.jsx`, `src/pages/Home.jsx`, `Home.css`, `tests/dnd5e-character-store.test.mjs`, `tests-release/pages.spec.js`, README da raiz, `docs/DEPLOY.md` e `docs/IMPLEMENTATION_STATUS.md`. Criados: `tests-e2e/trash.spec.js`, este registro e relatórios da validação. Nenhum arquivo removido; alterações anteriores preservadas.

Pendente: concluir a publicação autorizada da main por GitHub Actions e validar o site público. O site público ainda não contém estas correções. Issues visuais seguintes continuam em espera por solicitação do proprietário.

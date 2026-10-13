# Integração do MVP e das preferências na main

Base: `main` 1.21, commit `a708251`, na cópia `C:/Users/crist/OneDrive - Academico - Secretaria do Estado da Educação de São Paulo/Área de Trabalho/Jogo/dnd-fichas`. Decisão explícita do proprietário: equiparar esta base à candidata `codex/mvp-apresentacao` e executar os próximos trabalhos somente na main. Biblioteca e preferências aprovadas em 2026-10-13, com autorização de commit pelo GitHub Desktop. Sem nova tag, push ou publicação nesta entrega.

A especificação recuperada é idêntica ao documento de Downloads após normalizar quebras de linha. Este registro descreve execução e evidência; não altera o escopo do MVP. Os relatórios e PDFs da candidata anterior são históricos e não comprovam esta integração.

## Estado encontrado

- **IMPLEMENTADO:** entrada D&D, regras e escolhas da versão 1.21, ataques/equipamentos, talentos, rotas e acessibilidade VA-01. Preservados os catálogos mais recentes e os testes associados.
- **PARCIAL:** persistência e acessibilidade sem algumas proteções/validações do MVP; documentação com referências antigas; layout anterior ao grimório.
- **AUSENTE nesta main:** preferências de texto/leitura ampliadas, engrenagem, alternância compacta do tema, scrollbar temática e retorno ao topo; scripts e testes de produção/Pages da candidata.
- **BUGS corrigidos:** concentração com condições de incapacidade, iniciativa duplicando Destreza na criação, PV da Colina e sua troca na ficha, idiomas repetidos entre sub-raça/antecedente, foco inicial da criação sob StrictMode, CA manual sobrescrita, feedback de gravação sem proteção completa contra hidratação/registros incompatíveis e erro de lint em itens mágicos.
- **NA CONCLUSÃO DESTA INTEGRAÇÃO:** VIS-G03 ainda não havia sido iniciada; sua entrega posterior está em [VIS_G03.md](./VIS_G03.md). Áudio próprio e demais funcionalidades fora do MVP continuam adiados.

## Alterações aplicadas

- Persistência: hidratação antes de edição, snapshots capturados antes da fila, proteção de versões futuras/corrompidas e IDs reservados, confirmação do commit IndexedDB, aviso de falha/repetição, proteção contra fechamento com alterações pendentes, exclusão recuperável e restauração.
- Regras: preservadas as nove sub-raças e ancestralidades, regras de classe/subclasse/talento e equipamentos da 1.21. API racial aceita o argumento opcional de sub-raça para os consumidores do MVP; Colina soma PV por nível sem substituir o bônus do talento Robusto. Criação valida escolhas pendentes e permite rascunho explícito. Iniciativa armazena somente o bônus extra. Concentração considera PV, morte e condições explícitas de incapacidade. CA manual pode retornar ao cálculo.
- Interface: biblioteca/cabeçalho de grimório, entrada D&D, engrenagem de configurações, botão sol/lua com tema automático inicial e escolha persistente, scrollbar nativa temática, botão voltar ao topo com foco no título e movimento reduzido.
- Leitura: slider nativo de 16–28 px, entrelinhas/letras/palavras ampliadas, alto contraste, links sublinhados e brilho claro de 80–100%. Reset restaura texto 16 px, opções desligadas, brilho 100% e tema automático. Preferências anteriores de texto continuam válidas; JSON inválido e storage bloqueado possuem fallback. Impressão mantém fonte/cores próprias.
- Acessibilidade: foco na importação inválida, anúncios de gravação/rolagem, labels/estados, tabs de ativação manual da main, modais com fundo inerte, contenção e retorno do foco. O hook combina os cuidados da main com pilha de diálogos e retorno explícito da candidata. Reflow, nomes longos e ações acessíveis por teclado permanecem cobertos.
- Produção: base URL e recuperação de rotas em Pages, scripts de build/demo/preview e testes de produção recuperados. Carregamento das regras do provider e da criação separado em componentes lazy; budgets existentes de 425/100 KiB não foram aumentados.
- Documentação: README, IMPLEMENTATION_STATUS, registro visual e histórico de validação/publicação atualizados. A especificação original permanece integral.

Os testes VA-01 e de regras da main foram mantidos. Os testes herdados foram adaptados à escolha de sub-raça na primeira etapa, validação de escolhas obrigatórias, ativação manual das tabs, identidade D&D, IDs atuais e novos controles de preferência. Assertions de dados, foco, axe, persistência e reflow permanecem; não há exclusão de teste, retries ou aumento dos limites existentes para ocultar falhas.

## Validação nesta cópia

| Verificação | Resultado |
|---|---|
| `npm test` | 272 passaram, zero falhas/skips. |
| `npm run lint` | Passou; verificado em 2026-10-13. |
| `npm run build` | Passou: entrada 267,17/425 KiB e adapter D&D 88,91/100 KiB. |
| E2E completos, desktop/mobile | 198 casos validados: 195 passaram na rodada completa com dois workers; os três casos restantes passaram na correção/reexecução serial. Zero skips/retries. Evidências em main-e2e.json, main-e2e-corrections.json e main-summary.json. |
| Build de Pages | Passou: entrada 267,21/425 KiB e adapter D&D 88,91/100 KiB. |
| Chrome instalado sobre Pages | 10 casos validados: nove na rodada completa e retorno ao topo aprovado após aguardar renderização e usar viewport rolável. Evidências main-pages.json, main-pages-corrections.json e main-pages-summary.json. Inclui seis ensaios das três fichas, rotas/404, assets, persistência, JSON, impressão e preferências. |
| Revisão do diff | Conflitos resolvidos, regras novas preservadas, sem whitespace inválido, remoções ou alteração do HEAD a708251. |

A rodada concorrente revelou um timeout na análise axe de leitura (passou em 23 s quando serializada) e testes antigos que tentavam descansar com 0 PV. O teste de descanso agora verifica o bloqueio, sua explicação e a recuperação de PV antes do descanso, preservando a regra da main. O padrão da configuração Playwright passou a um worker, sem alterar cenários, assertions ou tempos máximos. O teste de Chrome espera a biblioteca renderizada antes de rolar e usa 320×500 px, onde a página vazia possui rolagem suficiente para acionar o botão.

## Verificação humana pendente

No Chrome, abrir a engrenagem e ajustar texto, espaçamento, contraste, links e brilho; recarregar e conferir persistência. Verificar Tab/Shift+Tab, setas/Home/End nos sliders, Escape e retorno à engrenagem. Conferir tema claro/escuro, zoom nativo 200%, NVDA e dispositivo móvel real. Automação e captura visual não certificam conformidade WCAG.

O site publicado anteriormente permanece na release anterior. A integração local não foi publicada. Próxima issue visual: **VIS-G03 — Ficha como páginas de personagem**, autorizada após o fechamento da biblioteca pelo proprietário em 2026-10-13.

## Arquivos aplicados nesta cópia

### Modificados

- `.gitignore`
- `dnd-fichas/docs/IMPLEMENTATION_STATUS.md`
- `dnd-fichas/eslint.config.js`
- `dnd-fichas/index.html`
- `dnd-fichas/package.json`
- `dnd-fichas/playwright.config.js`
- `dnd-fichas/scripts/check-bundle-budget.mjs`
- `dnd-fichas/src/App.jsx`
- `dnd-fichas/src/components/ficha/AtributoCard.css`
- `dnd-fichas/src/components/ficha/AtributoCard.jsx`
- `dnd-fichas/src/components/ficha/BlocoAtaques.jsx`
- `dnd-fichas/src/components/ficha/BlocoAtributos.jsx`
- `dnd-fichas/src/components/ficha/Blocodescanso.jsx`
- `dnd-fichas/src/components/ficha/BlocoHabilidades.css`
- `dnd-fichas/src/components/ficha/BlocoHabilidades.jsx`
- `dnd-fichas/src/components/ficha/BlocoInventario.jsx`
- `dnd-fichas/src/components/ficha/BlocoMagias.jsx`
- `dnd-fichas/src/components/ficha/BlocoMoedas.css`
- `dnd-fichas/src/components/ficha/BlocoMoedas.jsx`
- `dnd-fichas/src/components/ficha/BlocoPericias.css`
- `dnd-fichas/src/components/ficha/BlocoPericias.jsx`
- `dnd-fichas/src/components/ficha/BlocoProficiencias.css`
- `dnd-fichas/src/components/ficha/BlocoProficiencias.jsx`
- `dnd-fichas/src/components/ficha/BlocoProgressao.jsx`
- `dnd-fichas/src/components/ficha/BlocoRacaClasse.jsx`
- `dnd-fichas/src/components/ficha/BlocoRecursos.jsx`
- `dnd-fichas/src/components/ficha/BlocoSalvaguardas.jsx`
- `dnd-fichas/src/components/ficha/BlocoStatus.css`
- `dnd-fichas/src/components/ficha/BlocoStatus.jsx`
- `dnd-fichas/src/components/ficha/BlocoValidacao.css`
- `dnd-fichas/src/components/ficha/FichaImpressao.css`
- `dnd-fichas/src/components/ficha/FichaImpressao.jsx`
- `dnd-fichas/src/components/icons/Icon.jsx`
- `dnd-fichas/src/components/layout/AvisoPersistencia.css`
- `dnd-fichas/src/components/layout/AvisoPersistencia.jsx`
- `dnd-fichas/src/components/layout/RouteAccessibility.jsx`
- `dnd-fichas/src/components/layout/ThemeControl.jsx`
- `dnd-fichas/src/components/layout/Topbar.css`
- `dnd-fichas/src/components/layout/Topbar.jsx`
- `dnd-fichas/src/components/modal/ModalCatalogoItens.css`
- `dnd-fichas/src/components/modal/ModalLevelUp.jsx`
- `dnd-fichas/src/components/rolagem/PainelRolagens.jsx`
- `dnd-fichas/src/context/FichasContext.jsx`
- `dnd-fichas/src/data/racas.js`
- `dnd-fichas/src/hooks/useModalA11y.js`
- `dnd-fichas/src/main.jsx`
- `dnd-fichas/src/pages/CharacterRoute.jsx`
- `dnd-fichas/src/pages/Ficha.css`
- `dnd-fichas/src/pages/Ficha.jsx`
- `dnd-fichas/src/pages/Home.css`
- `dnd-fichas/src/pages/Home.jsx`
- `dnd-fichas/src/pages/NovaFicha.css`
- `dnd-fichas/src/pages/NovaFicha.jsx`
- `dnd-fichas/src/pages/SystemRouteView.jsx`
- `dnd-fichas/src/platform/persistence/characterRepository.js`
- `dnd-fichas/src/platform/persistence/migrationPolicy.js`
- `dnd-fichas/src/platform/preferences/theme.js`
- `dnd-fichas/src/styles/components/forms.css`
- `dnd-fichas/src/styles/index.css`
- `dnd-fichas/src/styles/tokens.css`
- `dnd-fichas/src/systems/dnd5e/adapter.jsx`
- `dnd-fichas/src/systems/dnd5e/characterStore.js`
- `dnd-fichas/src/utils/backup.js`
- `dnd-fichas/src/utils/concentracao.js`
- `dnd-fichas/src/utils/ficha.js`
- `dnd-fichas/src/utils/itensMagicos.js`
- `dnd-fichas/src/utils/proficienciasCriacao.js`
- `dnd-fichas/src/utils/progressao.js`
- `dnd-fichas/src/utils/validacaoFicha.js`
- `dnd-fichas/tests-e2e/accessibility.spec.js`
- `dnd-fichas/tests-e2e/dnd5e-adapter.spec.js`
- `dnd-fichas/tests-e2e/persistence.spec.js`
- `dnd-fichas/tests-e2e/pilares-library.spec.js`
- `dnd-fichas/tests-e2e/system-routing.spec.js`
- `dnd-fichas/tests/backup.test.mjs`
- `dnd-fichas/tests/dnd5e-character-store.test.mjs`
- `dnd-fichas/tests/efeitos.test.mjs`
- `dnd-fichas/tests/theme.test.mjs`
- `README.md`

### Criados ou recuperados da candidata

- `.github/workflows/pages.yml`
- `dnd-fichas/docs/DEMO.md`
- `dnd-fichas/docs/demo/01-guerreiro-nivel-1.json`
- `dnd-fichas/docs/demo/02-guerreiro-nivel-4.json`
- `dnd-fichas/docs/demo/03-mago-nivel-4.json`
- `dnd-fichas/docs/DEPLOY.md`
- `dnd-fichas/docs/MAIN_INTEGRATION.md`
- `dnd-fichas/docs/MVP_VALIDATION.md`
- `dnd-fichas/docs/MVP-9-DIAS-ISSUES-ACESSIBILIDADE.md`
- `dnd-fichas/docs/VISUAL_GRIMORIO_PLAN.md`
- `dnd-fichas/output/pdf/01-guerreiro-nivel-1.pdf`
- `dnd-fichas/output/pdf/02-guerreiro-nivel-4.pdf`
- `dnd-fichas/output/pdf/03-mago-nivel-4.pdf`
- `dnd-fichas/output/screenshots/biblioteca-1280.png`
- `dnd-fichas/output/screenshots/biblioteca-390.png`
- `dnd-fichas/output/screenshots/criacao-1280.png`
- `dnd-fichas/output/screenshots/criacao-390.png`
- `dnd-fichas/output/screenshots/ficha-1280.png`
- `dnd-fichas/output/screenshots/ficha-390.png`
- `dnd-fichas/output/screenshots/release-publicada.jpg`
- `dnd-fichas/output/validation/deployment.json`
- `dnd-fichas/output/validation/e2e-final.json`
- `dnd-fichas/output/validation/hosted-final.json`
- `dnd-fichas/output/validation/main-e2e-corrections.json`
- `dnd-fichas/output/validation/main-e2e.json`
- `dnd-fichas/output/validation/main-pages-corrections.json`
- `dnd-fichas/output/validation/main-pages-summary.json`
- `dnd-fichas/output/validation/main-pages.json`
- `dnd-fichas/output/validation/main-summary.json`
- `dnd-fichas/output/validation/pages-final.json`
- `dnd-fichas/output/validation/production-final.json`
- `dnd-fichas/output/validation/release-02-status.json`
- `dnd-fichas/output/validation/routing-final.json`
- `dnd-fichas/output/visual-grimoire/biblioteca-dark-colecao-1280.png`
- `dnd-fichas/output/visual-grimoire/biblioteca-dark-colecao-390.png`
- `dnd-fichas/output/visual-grimoire/biblioteca-dark-texto-150-1280.png`
- `dnd-fichas/output/visual-grimoire/biblioteca-dark-texto-150-390.png`
- `dnd-fichas/output/visual-grimoire/biblioteca-dark-uma-capa-1280.png`
- `dnd-fichas/output/visual-grimoire/biblioteca-dark-uma-capa-390.png`
- `dnd-fichas/output/visual-grimoire/biblioteca-dark-vazia-1280.png`
- `dnd-fichas/output/visual-grimoire/biblioteca-dark-vazia-390.png`
- `dnd-fichas/output/visual-grimoire/biblioteca-light-colecao-1280.png`
- `dnd-fichas/output/visual-grimoire/biblioteca-light-colecao-390.png`
- `dnd-fichas/output/visual-grimoire/biblioteca-light-texto-150-1280.png`
- `dnd-fichas/output/visual-grimoire/biblioteca-light-texto-150-390.png`
- `dnd-fichas/output/visual-grimoire/biblioteca-light-uma-capa-1280.png`
- `dnd-fichas/output/visual-grimoire/biblioteca-light-uma-capa-390.png`
- `dnd-fichas/output/visual-grimoire/biblioteca-light-vazia-1280.png`
- `dnd-fichas/output/visual-grimoire/biblioteca-light-vazia-390.png`
- `dnd-fichas/output/visual-grimoire/main-reflow/biblioteca-1280.png`
- `dnd-fichas/output/visual-grimoire/main-reflow/biblioteca-390.png`
- `dnd-fichas/output/visual-grimoire/main-reflow/criacao-1280.png`
- `dnd-fichas/output/visual-grimoire/main-reflow/criacao-390.png`
- `dnd-fichas/output/visual-grimoire/main-reflow/ficha-1280.png`
- `dnd-fichas/output/visual-grimoire/main-reflow/ficha-390.png`
- `dnd-fichas/output/visual-grimoire/preferences/biblioteca-dark-1280.png`
- `dnd-fichas/output/visual-grimoire/preferences/biblioteca-dark-390.png`
- `dnd-fichas/output/visual-grimoire/preferences/biblioteca-light-1280.png`
- `dnd-fichas/output/visual-grimoire/preferences/biblioteca-light-390.png`
- `dnd-fichas/output/visual-grimoire/preferences/chrome-painel-dark-normal.png`
- `dnd-fichas/output/visual-grimoire/preferences/chrome-rolagem-dark.png`
- `dnd-fichas/output/visual-grimoire/preferences/painel-dark-1280.png`
- `dnd-fichas/output/visual-grimoire/preferences/painel-dark-390.png`
- `dnd-fichas/output/visual-grimoire/preferences/painel-light-1280.png`
- `dnd-fichas/output/visual-grimoire/preferences/painel-light-390.png`
- `dnd-fichas/output/visual-grimoire/reading/painel-dark-1280.png`
- `dnd-fichas/output/visual-grimoire/reading/painel-dark-390.png`
- `dnd-fichas/output/visual-grimoire/reading/painel-light-1280.png`
- `dnd-fichas/output/visual-grimoire/reading/painel-light-390.png`
- `dnd-fichas/output/visual-grimoire/reading/painel-padrao-dark-1280.png`
- `dnd-fichas/output/visual-grimoire/reading/painel-padrao-dark-390.png`
- `dnd-fichas/output/visual-grimoire/reading/painel-padrao-light-1280.png`
- `dnd-fichas/output/visual-grimoire/reading/painel-padrao-light-390.png`
- `dnd-fichas/playwright.hosted.config.js`
- `dnd-fichas/playwright.pages.config.js`
- `dnd-fichas/playwright.production.config.js`
- `dnd-fichas/scripts/build-pages.mjs`
- `dnd-fichas/scripts/prepare-demo.mjs`
- `dnd-fichas/scripts/serve-pages.mjs`
- `dnd-fichas/src/components/layout/BackToTop.jsx`
- `dnd-fichas/src/components/layout/PreferencesControl.css`
- `dnd-fichas/src/components/layout/PreferencesControl.jsx`
- `dnd-fichas/src/components/layout/TextSizeControl.jsx`
- `dnd-fichas/src/context/LazyFichasProvider.jsx`
- `dnd-fichas/src/pages/LazyNovaFicha.jsx`
- `dnd-fichas/src/platform/preferences/reading.js`
- `dnd-fichas/src/platform/preferences/textSize.js`
- `dnd-fichas/src/platform/routing/pages.js`
- `dnd-fichas/src/styles/components/grimoire.css`
- `dnd-fichas/src/styles/preferences.css`
- `dnd-fichas/tests-e2e/armor.spec.js`
- `dnd-fichas/tests-e2e/creation.spec.js`
- `dnd-fichas/tests-e2e/grimoire-library.spec.js`
- `dnd-fichas/tests-e2e/grimoire-preferences.spec.js`
- `dnd-fichas/tests-e2e/helpers/dnd.js`
- `dnd-fichas/tests-e2e/helpers/preferences.js`
- `dnd-fichas/tests-e2e/keyboard.spec.js`
- `dnd-fichas/tests-e2e/level-up.spec.js`
- `dnd-fichas/tests-e2e/library.spec.js`
- `dnd-fichas/tests-e2e/reading-preferences.spec.js`
- `dnd-fichas/tests-e2e/sheet-accessibility.spec.js`
- `dnd-fichas/tests-e2e/sheet.spec.js`
- `dnd-fichas/tests-e2e/spells.spec.js`
- `dnd-fichas/tests-e2e/text-reflow.spec.js`
- `dnd-fichas/tests-release/demo.spec.js`
- `dnd-fichas/tests-release/pages.spec.js`
- `dnd-fichas/tests/pages-routing.test.mjs`
- `dnd-fichas/tests/reading-preferences.test.mjs`
- `dnd-fichas/tests/subraces.test.mjs`
- `dnd-fichas/tests/text-size.test.mjs`

### Removidos

Nenhum arquivo removido.

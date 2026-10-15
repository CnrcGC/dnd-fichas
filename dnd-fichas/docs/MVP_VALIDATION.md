# Histórico da candidata publicada

As evidências deste documento pertencem à candidata `codex/mvp-apresentacao` validada e publicada anteriormente. A integração posterior na `main` 1.21 e as preferências de leitura possuem registro próprio em [MAIN_INTEGRATION.md](./MAIN_INTEGRATION.md). Os números abaixo não são resultados da nova integração.

# Execução e evidências do MVP — 2026-10-10 a 2026-10-12

Especificação: [MVP-9-DIAS-ISSUES-ACESSIBILIDADE.md](./MVP-9-DIAS-ISSUES-ACESSIBILIDADE.md), copiada integralmente do documento fornecido. Este registro documenta execução/evidência por issue, sem substituir o escopo.

## Baseline e validação

- Cópia local: main, HEAD f0d01c459bed86b89eb11f8487a6d979329dca53 (1.19). Baseline 1.20 citada no documento não está no HEAD local. Nenhum pull/reset substituiu o trabalho existente.
- Não havia alterações rastreadas anteriores. Quatro planos locais não rastreados preservados. Commit/tag/push/publicação realizados somente após autorização explícita do usuário em 2026-10-12. O fetch encontrou 1.20 em `main` remoto; a candidata fica em `codex/mvp-apresentacao` e o build em `gh-pages`, preservando a versão remota.
- Node v24.12.0 e npm 11.6.2. Instalação restaurada com npm ci --no-audit --no-fund; lockfile preservado.
- npm test: **213/213 aprovados** em 2026-10-12; inclui três casos novos de recuperação segura das rotas de Pages.
- npm run lint: **aprovado**.
- npm run build: **aprovado**; entrada 400,53/425 KiB; adapter inicial D&D 88,89/100 KiB. npm run build:pages: **aprovado**; entrada 400,57/425 KiB e adapter 88,90/100 KiB. Lazy loading e budgets preservados.
- npm run test:production: **6/6 aprovados no Chrome instalado**, duas execuções por ficha contra build em preview. Backend e solicitações externas bloqueados nas duas sessões do round trip.
- npm run test:pages: **8/8 aprovados no Chrome instalado** em 2026-10-12; seis ensaios completos e dois cenários específicos de 404/rota direta/query/hash/assets/legado.
- Após integrar Pages, biblioteca e roteamento foram reexecutados no build local: **16/16 aprovados** em desktop/mobile, em `output/validation/routing-final.json`. Nenhuma alteração de código posterior a esses checks.
- PDFs finais: seis páginas renderizadas com Poppler e inspecionadas visualmente; margens brancas, dados legíveis, sem cortes/ações da interface.
- Regressão E2E/a11y completa: **152/152 aprovados** em 2026-10-12, um worker, sem retries/skips/flaky. Inclui 60 cenários de axe, teclado, anúncios e ampliação/reflow. Evidência persistida em `output/validation/e2e-final.json`. A integração posterior de Pages é validada por ensaios de produção e reexecução direcionada das rotas/biblioteca.

Falhas iniciais de automação foram investigadas: dependências ausentes; concorrência no primeiro carregamento; HMR durante uma execução; seletor ambíguo; encerramento de sessões após ensaio longo. Produção permite 60 s para o ensaio completo com PDF e recuperação em duas sessões; assertions continuam em 5 s. Nenhum teste/assertion foi removido para obter aprovação.

No primeiro ensaio de Pages, 7/8 passaram: o teste novo usava “Novo personagem” de forma ambígua entre cabeçalho e biblioteca. O seletor foi corrigido para o link exato “+ Novo personagem” dentro do main, mantendo todas as verificações. Não foi necessário alterar o comportamento da aplicação.

A primeira rodada integral final passou em 151/152 casos. O cenário VA-07 de Pilares de Atlas atingiu o limite total de 30 s na análise final do axe, após nove navegações e verificações de teclado. Seu tempo total foi ajustado para 60 s, preservando assertions de 5 s e todas as verificações. A reexecução direcionada dos oito casos de reflow e dos dois casos VA-07 passou em 10/10. A rodada seguinte ficou sem registro final após interrupção do ambiente. Em 2026-10-12, a regressão foi reiniciada com um worker e relatório JSON persistido, sem retries ou assertions enfraquecidas.

## Issue

MVP-01 — Estabelecer baseline e congelar escopo

### Estado encontrado

- Implementado: Build, engines/adapters e testes existentes.
- Parcial: Documentação descrevia baseline diferente.
- Ausente: Registro desta execução.
- Bugs: Dependências locais incompletas.

### Alterações aplicadas diretamente no repositório

Criados docs/MVP-9-DIAS-ISSUES-ACESSIBILIDADE.md e MVP_VALIDATION.md. npm ci restaurou dependências sem alterar lockfile. HEAD local registrado; quatro planos prévios preservados.

### Critérios de aceite

- [x] Baseline/escopo/defeitos registrados; build disponível.
- [ ] Smoke humano geral em RELEASE-02.

### Testes

npm test; npm run lint; npm run build; E2E existentes.

### Verificação manual

Biblioteca → criação → ficha → reload.

### Pendências

Smoke humano geral em RELEASE-02.

### Próxima issue

MVP-02

## Issue

MVP-02 — Persistência local sem perda de ficha

### Estado encontrado

- Implementado: IndexedDB, legado, envelopes, lixeira/restauração.
- Parcial: Feedback e proteção de incompatíveis.
- Ausente: Regressões de commit/snapshot concorrente.
- Bugs: Sucesso antes do commit, legado exposto antes da hidratação, aviso limpo antes da confirmação e risco de sobrescrita de versões futuras.

### Alterações aplicadas diretamente no repositório

Modificados characterRepository.js, migrationPolicy.js, characterStore.js, FichasContext.jsx, SystemRouteView.jsx, CharacterRoute.jsx, Home.jsx, AvisoPersistencia.jsx/.css e backup.js. Commit aguardado; hidratação precede edição; snapshot clonado antes da fila; retry e falha explícitos; exclusão com rollback; restauração preserva novas edições. IDs/systemId/migrações/formatos conhecidos preservados.

### Critérios de aceite

- [x] Reload mantém edição durável; abort/falha não anunciam sucesso; retry/lixeira/restauração; legado obsoleto/futuro/IDs protegidos não sobrescrevem atuais.
- [x] Persistência no domínio final: 6/6 ensaios Chrome.

### Testes

Alterados tests/dnd5e-character-store.test.mjs, backup.test.mjs e tests-e2e/persistence.spec.js. npm test e E2E de persistência.

### Verificação manual

Aguardar “Alterações salvas neste dispositivo”, recarregar e conferir.

### Pendências

Nenhuma pendência técnica conhecida; aprovação humana segue em RELEASE-02.

### Próxima issue

MVP-03

## Issue

MVP-03 — Biblioteca

### Estado encontrado

- Implementado: Listagem, busca, export/import e lixeira.
- Parcial: Entrada D&D e erros.
- Ausente: Testes do ciclo da biblioteca.
- Bugs: Raiz/links expunham funcionalidades adiadas.

### Alterações aplicadas diretamente no repositório

Modificados RootRoute.jsx, Home.jsx, Topbar.jsx e system-routing.spec.js; criado library.spec.js. D&D é padrão sem preferência explícita anterior; capabilities ocultam links indisponíveis; erros associados ao campo; confirmação descreve recuperação.

### Critérios de aceite

- [x] Criar/abrir/buscar/importar/exportar/excluir/restaurar pela interface; estado vazio e JSON inválido claros.
- [ ] Smoke humano final.

### Testes

library.spec.js, system-routing.spec.js e persistence.spec.js.

### Verificação manual

Buscar, exportar, importar cópia, excluir e restaurar.

### Pendências

Smoke humano final.

### Próxima issue

MVP-04

## Issue

MVP-04 — Criação guiada nível 1

### Estado encontrado

- Implementado: Etapas, arranjo padrão, escolhas e ficha em branco.
- Parcial: Validação, mensagens e sub-raças.
- Ausente: Cobertura completa e caso mínimo com sub-raça.
- Bugs: Iniciativa duplicava Destreza; escolhas incompletas podiam concluir sem orientação suficiente.

### Alterações aplicadas diretamente no repositório

Modificados NovaFicha.jsx, racas.js, BlocoRacaClasse.jsx, Ficha.jsx, FichaImpressao.jsx, contexto e helpers ficha/validacaoFicha/proficienciasCriacao/progressao. Finalizar valida escolhas; rascunho explícito; foco/estado de etapa. Adicionadas apenas duas sub-raças de Anão para o caso mínimo, sem inferir sub-raça em fichas antigas. Criados subraces.test.mjs e creation.spec.js.

### Critérios de aceite

- [x] Humano/Guerreiro, Meio-Elfo/Clérigo, Elfo/Mago e Anão da Colina/Clérigo; bônus/PV/proficiências e dados pessoais; ficha em branco.
- [ ] Smoke com pessoa sem conhecimento da implementação. Outras sub-raças não são automatizadas.

### Testes

Unitários de bônus/PV/compatibilidade; creation.spec.js com axe, dados e reload.

### Verificação manual

Executar os quatro casos mínimos da especificação.

### Pendências

Smoke com pessoa sem conhecimento da implementação. Outras sub-raças não são automatizadas.

### Próxima issue

MVP-05

## Issue

MVP-05 — Ficha principal

### Estado encontrado

- Implementado: Atributos/perícias, combate, recursos, descansos, inventário/moedas/notas.
- Parcial: Nomes e cobertura de uso.
- Ausente: Regressão de CA manual e uso contínuo.
- Bugs: CA digitada era sobrescrita imediatamente pelo cálculo automático.

### Alterações aplicadas diretamente no repositório

Modificados Ficha.jsx e BlocoStatus.jsx: CA manual persistida e ação Usar CA calculada. Controles das seções nomeados. Criados sheet.spec.js e armor.spec.js.

### Critérios de aceite

- [x] PV/temporários/morte/ataques/dano/recursos/descansos/inventário/moedas/notas persistem; CA pode alternar manual/cálculo.
- [ ] Smoke humano final.

### Testes

sheet.spec.js, armor.spec.js, adapter existente e produção.

### Verificação manual

Usar Breno conforme DEMO.md.

### Pendências

Smoke humano final.

### Próxima issue

MVP-06

## Issue

MVP-06 — Magias e concentração

### Estado encontrado

- Implementado: Catálogo selecionado, preparados, slots e concentração manual.
- Parcial: Encerramento automático.
- Ausente: E2E da conjuradora.
- Bugs: Concentração permanecia com zero PV/incapacidade.

### Alterações aplicadas diretamente no repositório

Modificados concentracao.js, Ficha.jsx e efeitos.test.mjs; criado spells.spec.js. Zero PV/condições incapacitantes encerram concentração; dano anuncia pedido de teste; recursos existentes preservados. Catálogo não expandido.

### Critérios de aceite

- [x] Conjuradora demonstra magias/espaços/concentração com reload e descanso.
- [ ] Smoke humano final; aplicativo auxilia decisões da mesa.

### Testes

Unitários de efeitos; spells.spec.js; Celeste em produção.

### Verificação manual

Detectar Magia → dano → aviso → parar/zero PV → descanso.

### Pendências

Smoke humano final; aplicativo auxilia decisões da mesa.

### Próxima issue

MVP-07

## Issue

MVP-07 — Level up e progressão

### Estado encontrado

- Implementado: Marco/XP, subclasses, ASI, multiclasse e limite 20.
- Parcial: Cobertura das fronteiras da apresentação.
- Ausente: E2E guerreiro/mago preservando dano.
- Bugs: Nenhum defeito adicional confirmado no núcleo existente.

### Alterações aplicadas diretamente no repositório

Criado level-up.spec.js; atualizados dnd5e-adapter.spec.js e ModalLevelUp.jsx (nomes de etapa, resumo de PV racial e retorno de foco). Motor reutilizado.

### Critérios de aceite

- [x] XP 4→5, marco 2→3/subclasse, mago 4→5/slots, multiclasse e limite 20; preservação de dano/dados.
- [ ] Smoke humano final; conteúdo integral 11–20 ADIADO.

### Testes

level-up.spec.js, adapter e unitários de progressão; produção.

### Verificação manual

Breno 4→5 e reabrir.

### Pendências

Smoke humano final; conteúdo integral 11–20 ADIADO.

### Próxima issue

A11Y-01

## Issue

A11Y-01 — Leitor de tela — PARCIAL

### Estado encontrado

- Implementado: Landmarks, skip link, tabs e base de dialog.
- Parcial: Nomes, headings, anúncios e foco lazy.
- Ausente: NVDA; axe das tabs preenchidas nos dois temas.
- Bugs: Campos sem nome útil, headings fora de ordem, headers vazios e foco perdido/roubado.

### Alterações aplicadas diretamente no repositório

Modificados RouteAccessibility.jsx, NovaFicha.jsx, blocos da ficha, PainelRolagens.jsx, AvisoPersistencia.jsx e ModalLevelUp.jsx. Nomes/estados/erros associados; feedback textual; títulos/headers coerentes; foco aguarda tela pronta. Criado sheet-accessibility.spec.js.

Rolagens consecutivas com resultado idêntico também alteram o conteúdo do anúncio pelo ID da rolagem. Teste com resultado aleatório fixo observa a mutação do DOM e o texto; a leitura efetiva com NVDA continua pendente.

### Critérios de aceite

- [x] Semântica, nomes, anúncios, foco e axe nos fluxos cobertos.
- [ ] NVDA no Chrome pelo fluxo principal; sem declaração formal WCAG.

### Testes

npm run test:a11y; axe rotas/seis tabs/temas; foco e anúncio.

### Verificação manual

Com NVDA criar/abrir ficha, navegar controles, rolar e ouvir salvamento/erro.

### Pendências

NVDA no Chrome pelo fluxo principal; sem declaração formal WCAG.

### Próxima issue

A11Y-04

## Issue

A11Y-04 — Navegação sem mouse

### Estado encontrado

- Implementado: Controles nativos, tabs setas/Home/End e trap.
- Parcial: Isolamento/retorno de foco.
- Ausente: Criação/level up inteiramente por teclado.
- Bugs: Controles ocultos no trap, fundo interativo e retorno incorreto com lazy.

### Alterações aplicadas diretamente no repositório

Modificados useModalA11y.js, ModalLevelUp.jsx e tamanhos de controles; criado keyboard.spec.js. Fundo inerte, controles visíveis, Escape, pilha de dialogs e retorno ao acionador. Percurso biblioteca/criação/level up usa só Tab/Enter/setas.

### Critérios de aceite

- [x] Tabs/dialogs/retorno e percurso por teclado automatizados; alvos básicos ampliados.
- [ ] Smoke humano incluindo seletor nativo de arquivo.

### Testes

keyboard.spec.js e skip link existente; reducedMotion ativado no percurso.

### Verificação manual

Tab/Shift+Tab/Enter/Espaço/setas/Home/End/Escape; foco visível.

### Pendências

Smoke humano incluindo seletor nativo de arquivo.

### Próxima issue

A11Y-02

## Issue

A11Y-02 — Texto e baixa visão — PARCIAL

### Estado encontrado

- Implementado: Tokens/rem e tema persistido.
- Parcial: Layouts com ampliação.
- Ausente: Controle global persistido.
- Bugs: Cabeçalho/status/tabs excediam largura.

### Alterações aplicadas diretamente no repositório

Criados preferences/textSize.js, TextSizeControl.jsx, text-size.test.mjs e text-reflow.spec.js; atualizados index.html, Topbar/tokens/styles/layouts. Normal/Grande/Muito grande usa 100/125/150% na raiz antes do paint, com fallback de storage.

### Critérios de aceite

- [x] Controle nomeado/global/persistido; maior opção exercitada nas três telas.
- [ ] Zoom nativo 200% do Chrome.

### Testes

Unitários de preferência e reflow 320/390/768/1280.

### Verificação manual

Ampliar texto/reload; Ctrl+“+” até 200%, usar criação/ficha/dialog. Viewport e fonte não equivalem a zoom nativo.

### Pendências

Zoom nativo 200% do Chrome.

### Próxima issue

A11Y-03

## Issue

A11Y-03 — Contraste, temas e estados

### Estado encontrado

- Implementado: Temas, tokens, foco e estados textuais.
- Parcial: Contraste dos estados preenchidos.
- Ausente: Evidência axe nos dois temas.
- Bugs: Destaque/perigo escuros insuficientes e tokens de estado ausentes no tema claro do sistema.

### Alterações aplicadas diretamente no repositório

Modificados tokens.css, botões e feedback. Destaque/perigo e estados semânticos corrigidos. Erro/salvamento/seleção possuem texto/estado, além da cor.

### Critérios de aceite

- [x] Textos exercitados por axe em ambos os temas; informação essencial não depende só de cor.
- [ ] Revisão humana de foco/desabilitado/sucesso/aviso e alto contraste.

### Testes

sheet-accessibility.spec.js e axe das rotas.

### Verificação manual

Conferir dois temas, foco e alto contraste. Axe não prova todos os estados.

### Pendências

Revisão humana de foco/desabilitado/sucesso/aviso e alto contraste.

### Próxima issue

A11Y-05

## Issue

A11Y-05 — Reflow e responsividade — PARCIAL

### Estado encontrado

- Implementado: Breakpoints, modal rolável e seções lazy.
- Parcial: Texto ampliado em largura mínima.
- Ausente: Matriz das larguras solicitadas.
- Bugs: Cabeçalho/status/tabs/título de modal fora da largura.

### Alterações aplicadas diretamente no repositório

Modificados Topbar.css, Ficha.css, Home.css, NovaFicha.css, BlocoStatus.css, BlocoPericias.css, BlocoProficiencias.css, BlocoHabilidades.css, BlocoMoedas.css, AtributoCard.css, BlocoValidacao.css, forms.css, styles/index.css e ModalCatalogoItens.css. Wrap, colunas com min-width zero e modais dentro da viewport; nomes longos quebram. Controles nativos usam os tokens rem; etapas quebram em linhas; cartões reservam uma linha para exportar/excluir. min-height substitui a altura fixa de html/body/#root para evitar recorte de conteúdo. Selo de prontidão e nomes de atributos permanecem nos cartões estreitos.

O teste aguarda a seção lazy estar pronta e verifica a largura da página, controles e rótulos nos cartões, além das ações da biblioteca. A comparação de foco com o painel flutuante usa o elemento efetivamente visível no ponto de interseção, evitando confundir um modal acima do painel com uma obstrução.

### Critérios de aceite

- [x] 320/390/768/1280 sem overflow horizontal da página/controles; seis tabs/dialog e telas centrais.
- [ ] Zoom nativo 200% e mobile real.

### Testes

text-reflow.spec.js; capturas em output/screenshots.

### Verificação manual

Chrome 200% e telefone; controles visíveis e sem corte.

### Pendências

Zoom nativo 200% e mobile real.

### Próxima issue

A11Y-07

## Issue

A11Y-07 — Clareza e redução de movimento

### Estado encontrado

- Implementado: Etapas, confirmação de exclusão e CSS reduced motion.
- Parcial: Mensagens/foco e scroll.
- Ausente: Percurso com movimento reduzido.
- Bugs: Scroll suave ignorava preferência.

### Alterações aplicadas diretamente no repositório

Ficha.jsx usa scroll imediato com reduced motion; criação/level up com nomes de etapas; erros orientam correção; exclusão explica recuperação; estados/rolagens textuais.

### Critérios de aceite

- [x] Fluxo compreensível sem animação; preferência respeitada.
- [ ] Revisão humana de clareza/conforto.

### Testes

keyboard.spec.js com reducedMotion: reduce.

### Verificação manual

Percorrer etapas e usar ficha com redução de movimento.

### Pendências

Revisão humana de clareza/conforto.

### Próxima issue

MVP-08

## Issue

MVP-08 — JSON e PDF

### Estado encontrado

- Implementado: Backup JSON/cópia com novo ID e layout A4.
- Parcial: Importação incompatível e impressão real.
- Ausente: Round trip completo em sessão limpa; três PDFs.
- Bugs: Altura/overflow fixos cortavam impressão; margens escuras; skip link impresso.

### Alterações aplicadas diretamente no repositório

Modificados backup.js e FichaImpressao.jsx/.css; criado tests-release/demo.spec.js. Impressão com altura/overflow livres, esquema claro e controles ocultos. Criados output/pdf/01-guerreiro-nivel-1.pdf, 02-guerreiro-nivel-4.pdf e 03-mago-nivel-4.pdf.

### Critérios de aceite

- [x] Round trip compara todos os dados exceto ID/criadoEm; JSON inválido rejeitado; seis páginas finais renderizadas e inspecionadas sem cortes/sobreposição/ações.
- [ ] Dialog nativo Salvar em PDF/impressora no smoke humano.

### Testes

Backup unitário, biblioteca E2E e 6/6 ensaios Chrome produção; inspeção Poppler.

### Verificação manual

Abrir PDFs e comparar com fichas; imprimir no Chrome.

### Pendências

Dialog nativo Salvar em PDF/impressora no smoke humano.

### Próxima issue

MVP-09

## Issue

MVP-09 — Polish das telas centrais

### Estado encontrado

- Implementado: Identidade/tokens/layout compartilhados.
- Parcial: Responsividade e hierarquia ampliadas.
- Ausente: Capturas de fallback.
- Bugs: Quebras de largura/contraste corrigidas nas issues A11Y.

### Alterações aplicadas diretamente no repositório

Ajustes restritos aos componentes existentes; logo/identidade preservados; seis capturas de biblioteca/criação/ficha em 390/1280 com texto ampliado em 150%. Inspeção visual encontrou e corrigiu selo de prontidão fora do quadro e nomes de atributos sobrepostos; capturas atualizadas e novamente inspecionadas.

### Critérios de aceite

- [x] Consistência das três telas e correções de layout, sem redesign.
- [x] Inspeção visual das capturas finais das três telas centrais.
- [ ] Smoke humano do roteiro da demo.

### Testes

Reflow/axe e capturas output/screenshots.

### Verificação manual

Conferir biblioteca/criação/ficha.

### Pendências

Smoke humano do roteiro da demo, registrado em DEMO-01/RELEASE-02.

### Próxima issue

DOC-01

## Issue

DOC-01 — README real

### Estado encontrado

- Implementado: Instalação e visão geral.
- Parcial: Contagens, persistência e foco dos sistemas.
- Ausente: Comandos/artefatos do MVP.
- Bugs: Informações antigas contradiziam implementação.

### Alterações aplicadas diretamente no repositório

Modificado ../README.md: D&D ativo; IndexedDB/legado/falhas; 9 raças, 2 sub-raças de Anão, 12 classes, 13 antecedentes, 26 subclasses, 117 magias; comandos reais; links MVP/demo; Pilares existente preservado e F&M conforme capabilities.

### Critérios de aceite

- [x] Descrição/contagens/comandos alinhados; backend não obrigatório; sem promessa WCAG.

### Testes

Contagens conferidas no catálogo; revisão de package.json.

### Verificação manual

Ler README e seguir instalação/roteiro.

### Pendências

Nenhuma pendência técnica conhecida.

### Próxima issue

DOC-02

## Issue

DOC-02 — Estado da cópia real

### Estado encontrado

- Implementado: Registro de engines/adapters e backend anterior.
- Parcial: Baseline e classificações.
- Ausente: Referência à especificação.
- Bugs: Estado antigo de Pilares/funções já presentes.

### Alterações aplicadas diretamente no repositório

Modificado docs/IMPLEMENTATION_STATUS.md: HEAD/data reais; ME-01/02 identificados como MECH presentes; estados FE/VA/MVP por evidência; humanos/sub-raças pendentes; exclusões mantidas. Nenhuma incorporação remota 1.20 presumida.

### Critérios de aceite

- [x] Baseline e descrição correspondem ao código; testes só aprovados com evidência.

### Testes

Revisão de documentação e diff.

### Verificação manual

Conferir referências de escopo/status.

### Pendências

Nenhuma pendência técnica conhecida.

### Próxima issue

DEMO-01

## Issue

DEMO-01 — Dados e roteiro

### Estado encontrado

- Implementado: Criação/exportação e regras suficientes.
- Parcial: Preparação repetível.
- Ausente: Backups, PDFs e roteiro completo/curto.
- Bugs: Impressão corrigida em MVP-08.

### Alterações aplicadas diretamente no repositório

Criados scripts/prepare-demo.mjs, docs/demo/ com três JSONs e docs/DEMO.md. Gerador reutiliza normalização/regras/validação; três fichas sem erros/escolhas pendentes. npm run demo:prepare disponível.

### Critérios de aceite

- [x] Três backups/PDFs; cliques e versão curta; dois ensaios automáticos consecutivos por ficha.
- [ ] Dois ensaios humanos consecutivos.

### Testes

npm run test:production: 6/6 no Chrome instalado.

### Verificação manual

Executar DEMO.md duas vezes antes da apresentação.

### Pendências

Dois ensaios humanos consecutivos.

### Próxima issue

RELEASE-01

## Issue

RELEASE-01 — Build publicado — PARCIAL apenas na impressão nativa

### Estado encontrado

- Implementado: Vite/build/preview/lazy/budget.
- Parcial: Evidência de demo em produção.
- Ausente: Hospedagem publicada. O usuário autorizou a escolha do endereço em 2026-10-12.
- Bugs: Impressão corrigida nos ensaios.

### Alterações aplicadas diretamente no repositório

Chrome instalado exercita preview do build, rota inicial/direta/reload, temas, IndexedDB, import/export, level up e PDF, com backend/rede externa bloqueados nas duas sessões do round trip.

- Modificados: `src/main.jsx` (basename e restauração antes de montar React), `src/pages/Home.jsx` (logo relativa à base), `scripts/check-bundle-budget.mjs` (mesmos limites nas duas saídas), `package.json`, `eslint.config.js`, `.gitignore` da raiz, `tests-release/demo.spec.js` e `playwright.production.config.js`.
- Criados: `src/platform/routing/pages.js`, `scripts/build-pages.mjs`, `scripts/serve-pages.mjs`, `playwright.pages.config.js`, `tests/pages-routing.test.mjs`, `tests-release/pages.spec.js`, `.github/workflows/pages.yml` na raiz e `docs/DEPLOY.md`.
- Documentação atualizada: README, DEMO e IMPLEMENTATION_STATUS. Nenhum arquivo removido.
- O build de Pages gera `404.html`/`.nojekyll`. O emulador local usa 404 real; query/hash são restaurados antes do router. URLs externas e caminhos fora da base são rejeitados. Build padrão e dados persistidos continuam compatíveis. Workflow manual entrega somente o build estático depois dos checks; ainda não foi executado no GitHub.

### Critérios de aceite

- [x] Build/budget, 6/6 ensaios Chrome no preview e 8/8 ensaios no emulador de Pages aprovados.
- [x] Endereço escolhido: https://cnrcgc.github.io/dnd-fichas/, Chrome como navegador da apresentação.
- [x] Refresh/IndexedDB/import-export no endereço HTTPS: 6/6 ensaios Chrome aprovados.
- [x] Publicação HTTPS aprovada, 38 arquivos públicos conferidos contra o commit do build.
- [ ] Dialog nativo de impressão no Chrome da apresentação.

### Testes

npm test; npm run lint; npm run build; npm run build:pages; npm run test:production; npm run test:pages; reexecução de system-routing.spec.js e library.spec.js. Relatórios JSON finais em output/validation.

### Verificação manual

URL final → importar → salvar → refresh de rota direta → reabrir/exportar → imprimir.

### Pendências

Somente dialog nativo de impressão no Chrome. Site publicado em 2026-10-12; fonte `3ac1eb9` em `codex/mvp-apresentacao`, build `37bbf35` em `gh-pages`, tag `mvp-rc-2026-10-12`. `main` remoto 1.20 preservado. O build local permanece como fallback.

### Próxima issue

RELEASE-02

## Issue

RELEASE-02 — Regressão e RC — PARCIAL

### Estado encontrado

- Implementado: Testes e orçamento existentes.
- Parcial: Matriz humana, publicação e RC formal.
- Ausente: Aprovação com NVDA, zoom nativo 200%, impressão nativa e dispositivo mobile real.
- Bugs: Regressões corrigidas por issue; resultados finais abaixo.

### Alterações aplicadas diretamente no repositório

Cobertura ampliada; test:a11y inclui rotas/ficha/teclado/reflow. Diff revisto para imports, dados legados, acessibilidade e escopo; nenhum arquivo funcional removido e nenhum limite de bundle aumentado.

Primeira retomada da RELEASE-02 em 2026-10-12: conferidos a especificação, arquivos atuais, comandos e relatórios JSON finais. Não houve mudança de código após os checks aprovados. Atualizados este registro, DEMO.md e IMPLEMENTATION_STATUS.md; criada evidência `output/validation/release-02-status.json`. Nenhum teste removido, nenhuma feature iniciada e nenhum commit/tag/push realizado.

Foi aberto o build estático de Pages em Chrome visível, com perfil temporário separado das fichas do usuário. O carregamento da biblioteca foi confirmado pelo título/H1. Isso é uma preparação por automação, não uma aprovação de smoke manual. A captura da interface via Computer Use foi encerrada pela ferramenta: não conseguiu determinar a URL atual do navegador com confiança suficiente para aplicar sua política e exigiu interromper o controle neste turno. Não foram executados atalhos de zoom ou ações de impressão; nenhum desses itens foi marcado como aprovado. NVDA não foi encontrado nos três locais usuais consultados nem nos registros de instalação consultados; não foi instalado software.

### Critérios de aceite

- [x] Unitários/build/produção aprovados; regressão final consolidada abaixo.
- [x] Relatórios finais conferidos: zero falhas, casos ignorados ou instáveis nas quatro execuções de navegador.
- [x] Escopo congelado; nenhuma funcionalidade nova na RELEASE-02.
- [ ] Smoke manual de biblioteca, criação, ficha, level up, JSON, PDF, teclado e mobile.
- [ ] NVDA, zoom nativo 200%, impressão nativa e dois ensaios humanos no endereço final.
- [x] Publicação e validação no domínio escolhido: workflow aprovado e 6/6 ensaios Chrome.
- [x] Commit/tag/push da candidata autorizados explicitamente e realizados. Tag `mvp-rc-2026-10-12`; aprovação humana final continua pendente.

### Testes

npm test; npm run lint; npm run build; npm run test:a11y; npm run test:e2e -- --workers=1 --reporter=list,json; npm run test:production; npm run build:pages; npm run test:pages. A suíte completa inclui os 60 casos de test:a11y, sem exigir uma execução redundante desses mesmos cenários.

### Verificação manual

Roteiro DEMO.md, duas vezes no Chrome/endereço final. Conferir Tab/Shift+Tab/setas/Home/End/Escape, NVDA, zoom nativo 200%, mobile real e diálogo nativo de impressão. O controle da UI ficou indisponível nesta tentativa; nenhuma validação humana foi presumida a partir dos testes automatizados.

### Pendências

NVDA, zoom nativo 200%, impressão nativa, mobile real e dois ensaios humanos. A conexão de controle do Chrome está indisponível; a tentativa anterior de Computer Use foi interrompida por falta de confiança na URL. Inspeção complementar no navegador interno confirmou criação/salvamento na origem final e importação/level up/ampliação no build local. Publicação e tag concluídas após autorização explícita. RELEASE-02 permanece PARCIAL até a aprovação humana.

### Próxima issue

Fechar impressão nativa e validação humana A11Y-01/02/05; A11Y-06 permanece adiado.

## A11Y-06 — Assistência por áudio — ADIADO

Não implementada: a especificação exige adiamento se P0/P1 estiverem pendentes. Ainda faltam NVDA/zoom nativo e aprovação humana. Nenhum áudio automático nem arquitetura de áudio iniciada. Informação essencial permanece textual. Próxima ação ativa: fechar validação P0/P1.

## Referência do caso mínimo de sub-raça

[Basic Rules 2014 — Races](https://www.dndbeyond.com/sources/dnd/basic-rules-2014/races). Apenas as duas sub-raças de Anão necessárias ao teste mínimo foram adicionadas; não é catálogo completo.

## Publicação e evidência final — 2026-10-12

Usuário autorizou explicitamente commit, tag, push e publicação. Fonte congelada: `3ac1eb943d18dae5ad7fe606edfe7ada1c5feabd`, tag `mvp-rc-2026-10-12`, branch `codex/mvp-apresentacao`. Build publicado: `37bbf357dc939f6b250eb8b37b2c245c493d9a3a`, branch `gh-pages`. A versão 1.20 em `main` não foi alterada. [Publicação aprovada](https://github.com/CnrcGC/dnd-fichas/actions/runs/38309889568). `npm run test:hosted -- --reporter=list,json`: **6/6 aprovados**, sem falhas/skips/flaky, 130,2 s, no Chrome. Os 38 arquivos públicos correspondem aos blobs do commit; somente o favicon difere do arquivo Windows por normalização CRLF/LF. Relatórios: `output/validation/hosted-final.json` e `deployment.json`. Nova configuração `playwright.hosted.config.js`; lint e descoberta dos seis testes aprovados. Código funcional do build permaneceu inalterado.

Inspeção da interface pelo agente, no navegador interno: criação guiada Humano/Guerreiro/Soldado no domínio final, escolhas obrigatórias, abertura da ficha, estado de salvamento e biblioteca com ficha fictícia. Teclado Enter/Home/End conferido na navegação e abas; ficha a 390 px com texto 150% inspecionada sem overflow horizontal da página. No build local: importação de Celeste, tema claro, texto 150%, level up 4→5 e reabertura. Captura: `output/screenshots/release-publicada.jpg`. Essa inspeção não conta como uso humano de NVDA nem ensaio humano do Chrome.

Revisão final: nenhum arquivo rastreado removido, lockfile e formatos persistidos preservados, quatro planos anteriores fora dos commits. A cópia autoritativa do documento mantém os hard breaks Markdown e seu whitespace intencional.

## Resultado final e limites

Validação automatizada aprovada: 213 unitários, 152 E2E (incluindo 60 de acessibilidade), 6 ensaios Chrome no preview, 8 no emulador de Pages, lint e ambos os builds dentro do orçamento. Automação não substitui NVDA, zoom nativo 200%, mobile real, dialog nativo de impressão e dois ensaios humanos. Usuário confirmou Chrome e autorizou a escolha do endereço: https://cnrcgc.github.io/dnd-fichas/. Hospedagem publicada, com workflow aprovado e 6/6 ensaios adicionais no Chrome no domínio final. Candidata versionada pela tag `mvp-rc-2026-10-12`; `main` remoto preservado. RELEASE-01/02 permanecem parciais nas verificações humanas pendentes; não há declaração de conformidade WCAG nem aprovação humana formal.

## Inventário final dos arquivos desta execução

Caminhos relativos à raiz Git. 73 arquivos rastreados modificados e 49 arquivos criados, incluindo dados, PDFs, screenshots e relatórios JSON de validação. Nenhum arquivo rastreado removido. Os quatro planos prévios não rastreados foram preservados e não pertencem a este inventário. PNGs intermediários de inspeção foram removidos; os artefatos finais permanecem.

### Modificados

- `.gitignore`
- `README.md`
- `dnd-fichas/docs/IMPLEMENTATION_STATUS.md`
- `dnd-fichas/eslint.config.js`
- `dnd-fichas/index.html`
- `dnd-fichas/package.json`
- `dnd-fichas/scripts/check-bundle-budget.mjs`
- `dnd-fichas/src/components/ficha/AtributoCard.css`
- `dnd-fichas/src/components/ficha/AtributoCard.jsx`
- `dnd-fichas/src/components/ficha/BlocoAtaques.jsx`
- `dnd-fichas/src/components/ficha/BlocoAtributos.jsx`
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
- `dnd-fichas/src/components/ficha/BlocoValidacao.jsx`
- `dnd-fichas/src/components/ficha/Blocodescanso.jsx`
- `dnd-fichas/src/components/ficha/FichaImpressao.css`
- `dnd-fichas/src/components/ficha/FichaImpressao.jsx`
- `dnd-fichas/src/components/layout/AvisoPersistencia.css`
- `dnd-fichas/src/components/layout/AvisoPersistencia.jsx`
- `dnd-fichas/src/components/layout/RouteAccessibility.jsx`
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
- `dnd-fichas/src/pages/RootRoute.jsx`
- `dnd-fichas/src/pages/SystemRouteView.jsx`
- `dnd-fichas/src/platform/persistence/characterRepository.js`
- `dnd-fichas/src/platform/persistence/migrationPolicy.js`
- `dnd-fichas/src/styles/components/buttons.css`
- `dnd-fichas/src/styles/components/forms.css`
- `dnd-fichas/src/styles/index.css`
- `dnd-fichas/src/styles/tokens.css`
- `dnd-fichas/src/systems/dnd5e/characterStore.js`
- `dnd-fichas/src/utils/backup.js`
- `dnd-fichas/src/utils/concentracao.js`
- `dnd-fichas/src/utils/ficha.js`
- `dnd-fichas/src/utils/proficienciasCriacao.js`
- `dnd-fichas/src/utils/progressao.js`
- `dnd-fichas/src/utils/validacaoFicha.js`
- `dnd-fichas/tests-e2e/dnd5e-adapter.spec.js`
- `dnd-fichas/tests-e2e/persistence.spec.js`
- `dnd-fichas/tests-e2e/pilares-library.spec.js`
- `dnd-fichas/tests-e2e/system-routing.spec.js`
- `dnd-fichas/tests/backup.test.mjs`
- `dnd-fichas/tests/dnd5e-character-store.test.mjs`
- `dnd-fichas/tests/efeitos.test.mjs`

### Criados

- `.github/workflows/pages.yml`
- `dnd-fichas/docs/DEMO.md`
- `dnd-fichas/docs/DEPLOY.md`
- `dnd-fichas/docs/MVP-9-DIAS-ISSUES-ACESSIBILIDADE.md`
- `dnd-fichas/docs/MVP_VALIDATION.md`
- `dnd-fichas/docs/demo/01-guerreiro-nivel-1.json`
- `dnd-fichas/docs/demo/02-guerreiro-nivel-4.json`
- `dnd-fichas/docs/demo/03-mago-nivel-4.json`
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
- `dnd-fichas/output/validation/hosted-final.json`
- `dnd-fichas/output/validation/e2e-final.json`
- `dnd-fichas/output/validation/pages-final.json`
- `dnd-fichas/output/validation/production-final.json`
- `dnd-fichas/output/validation/release-02-status.json`
- `dnd-fichas/output/validation/routing-final.json`
- `dnd-fichas/playwright.hosted.config.js`
- `dnd-fichas/playwright.pages.config.js`
- `dnd-fichas/playwright.production.config.js`
- `dnd-fichas/scripts/build-pages.mjs`
- `dnd-fichas/scripts/prepare-demo.mjs`
- `dnd-fichas/scripts/serve-pages.mjs`
- `dnd-fichas/src/components/layout/TextSizeControl.jsx`
- `dnd-fichas/src/platform/preferences/textSize.js`
- `dnd-fichas/src/platform/routing/pages.js`
- `dnd-fichas/tests-e2e/armor.spec.js`
- `dnd-fichas/tests-e2e/creation.spec.js`
- `dnd-fichas/tests-e2e/helpers/dnd.js`
- `dnd-fichas/tests-e2e/keyboard.spec.js`
- `dnd-fichas/tests-e2e/level-up.spec.js`
- `dnd-fichas/tests-e2e/library.spec.js`
- `dnd-fichas/tests-e2e/sheet-accessibility.spec.js`
- `dnd-fichas/tests-e2e/sheet.spec.js`
- `dnd-fichas/tests-e2e/spells.spec.js`
- `dnd-fichas/tests-e2e/text-reflow.spec.js`
- `dnd-fichas/tests-release/demo.spec.js`
- `dnd-fichas/tests-release/pages.spec.js`
- `dnd-fichas/tests/pages-routing.test.mjs`
- `dnd-fichas/tests/subraces.test.mjs`
- `dnd-fichas/tests/text-size.test.mjs`

## Revisão visual atual — VIS-G06 — 2026-10-14/15

A main local inclui VIS-G05 e a revisão global VIS-G06, posteriores à publicação `b001bd8`. Resultados atuais, correções, evidências e limites humanos ficam em [VIS_G06.md](./VIS_G06.md); os números históricos acima não representam esta rodada. Nenhum novo deploy foi realizado nesta etapa.

Validação automatizada concluída: 275 unitários; 70 casos da suíte de acessibilidade aprovados dentro da regressão; 238 cenários E2E com aprovação entre a rodada ampla e suas reexecuções (236 na rodada integral e dois timeouts aprovados isoladamente). Essa rodada antecede os últimos ajustes de posição/foco: a fonte final teve 66 casos relacionados aprovados contando as reexecuções, incluindo quatro novos casos de foco, e nova execução serial de Pages com 11 aprovações. Seis ensaios de produção; lint/builds/budgets. PDFs de demonstração inspecionados em seis páginas A4 e 116 artefatos anteriores preservados. Os relatórios mantêm as falhas históricas e os timeouts. NVDA, zoom nativo 200%, aparelho real e revisão final do proprietário permanecem pendentes.

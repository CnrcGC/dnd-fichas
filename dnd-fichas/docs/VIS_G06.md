# VIS-G06 — Revisão visual e validação da candidata

Executada em 2026-10-14/15, somente na **main** da cópia `Área de Trabalho/Jogo/dnd-fichas`, sobre `b001bd8`. O trabalho local da VIS-G05 foi preservado. A implementação está aplicada; nenhum commit, tag, push ou deploy foi realizado nesta entrega.

## Estado encontrado

- **IMPLEMENTADO:** biblioteca, criação, ficha, preferências, áreas de mesa, persistência e impressão.
- **PARCIAL:** revisão global após VIS-G05 e verificações humanas de acessibilidade.
- **AUSENTE:** conjunto próprio das seis telas/estados nos dois temas e regressões para os casos encontrados abaixo.
- **BUGS:** categoria horizontal parcialmente cortada ao receber foco; palavra “personagem” dividida no título mobile ampliado; contraste de “Falha crítica” em 3,99:1; voltar ao topo sobre o ícone do painel com texto 28 px; redirecionamento inicial capaz de retirar o foco do skip link.
- **ADIADO:** backend, sincronização, VTT e expansão de conteúdo.

## Alterações aplicadas

| Arquivo | Alteração |
|---|---|
| `src/hooks/useModalA11y.js` | Revela completamente o controle focado dentro de uma região horizontal rolável do diálogo ativo. Preserva ordem, contenção, Escape e retorno do foco. |
| `src/pages/NovaFicha.css` | Título mobile pelo token `--text-lg`; padding horizontal menor até 390 px. Em 320 px/28 px com espaçamento, uma palavra de 206 px passa a dispor de 229 px. |
| `src/styles/components/grimoire.css` | Falha crítica usa o token de perigo já aplicado ao resultado numérico; posicionamento mobile do retorno ao topo considera a altura real do painel. Regras restritas ao D&D e à tela. |
| `src/components/layout/BackToTop.jsx` | Observa o painel e recalcula a distância durante resize/scroll, com RAF e limpeza dos listeners/observer. Evita sobreposição; aguarda espaço quando a viewport não acomoda o controle. Mantém Enter/Espaço, retorno ao título e movimento reduzido. |
| `src/components/layout/RouteAccessibility.jsx` | Preserva o skip link já focado durante o redirecionamento inicial. Navegação comum continua focando o título. |
| `tests-e2e/helpers/preferences.js` | Aguarda transições CSS terminarem antes de medir a paleta final, mantendo as exigências de contraste. |
| `tests-e2e/grimoire-creation.spec.js` | Exige que “personagem” permaneça inteira na matriz de reflow, sem retirar verificações anteriores. |
| `tests-e2e/grimoire-table.spec.js` | Resultados 11/20/1 controlados nos temas automáticos; contraste com brilho 80%, texto 28 px e alto contraste; botão inteiro e separado do painel em alturas 500/720 px. |
| `tests-e2e/accessibility.spec.js`, `grimoire-preferences.spec.js` | Acrescentam espera pelo controle/conteúdo realmente renderizado antes do primeiro Tab ou scroll. Todas as assertions de comportamento foram mantidas. |

**Criados:** `tests-e2e/modal-reflow.spec.js`, `route-focus.spec.js`, `fixtures/route-focus.html`, `fixtures/route-focus.jsx`, `scripts/capture-visual-review.mjs`, este relatório e evidências próprias. A fixture de foco usa o componente real e força um REPLACE após o foco no skip link, sem depender de uma corrida aleatória. Antes da correção, ambos os projetos falhavam nesse caso e passavam na navegação comum; depois, os quatro passaram.

Atualizados README, IMPLEMENTATION_STATUS, MVP_VALIDATION, plano visual e registro histórico VIS-G05. Nenhum arquivo funcional removido. Regras, catálogos, dados, IDs, `systemId`, envelopes, migrações, formato JSON, repositórios e código de impressão permanecem preservados.

## Critérios de aceite

- [x] Biblioteca vazia/preenchida, criação, ficha, catálogo e falha de gravação nos dois temas.
- [x] Matriz 320/390/768/1280 px e texto 16/20/24 px; casos adicionais em 28 px com espaçamento/contraste.
- [x] Foco, controles, estados, reflow e dados dos fluxos relacionados verificados.
- [x] Contraste de falha crítica e sobreposição dos controles corrigidos.
- [x] Regressão ampla, verificações finais das áreas alteradas e ensaios Pages, com limites das execuções documentados.
- [x] Lint, builds e budgets; impressão e preservação das evidências anteriores.
- [ ] NVDA, zoom nativo 200%, aparelho real e avaliação visual final do proprietário.

## Testes e resultados

As rodadas se sobrepõem: seus totais não devem ser somados como cenários distintos. A execução global antecede os últimos ajustes de posicionamento e foco; estes receberam regressão específica posterior. Não houve uma execução única global de 242 testes integralmente aprovada na última revisão.

| Verificação | Resultado/evidência |
|---|---|
| `npm test` | 275 passaram, zero falhas/skips. Modelos/regras não foram alterados depois. |
| Regressão ampla antes da correção de falha crítica | 235/236 passaram; uma violação de contraste, reproduzida no Chrome instalado e corrigida. [Rodada](../output/validation/vis-g06-e2e-before-critical.json), [reprodução](../output/validation/vis-g06-critical-before.json). |
| Regressão ampla após a correção de cor | 236/238 passaram; dois timeouts em Pilares coincidiram com atrasos prolongados do ambiente. Os mesmos casos passaram isoladamente nos quatro cenários, sem alterar código/assertions/limites. [Integral](../output/validation/vis-g06-e2e.json), [reexecução](../output/validation/vis-g06-pilares-final.json). |
| Criação/ficha/catálogos | 18 verificações dirigidas aprovadas. [Relatório](../output/validation/vis-g06-focused-final.json). |
| Resultados controlados e preferências | Quatro casos aprovados após a correção de cor. [Relatório](../output/validation/vis-g06-critical.json), [Chrome corrigido](../output/validation/vis-g06-critical-after.json). |
| Revisão das telas após reposicionar o botão | 126 casos executados; 119 passaram. As falhas envolveram disputa de traces, timeouts e os problemas de foco/preparação corrigidos na etapa seguinte. Todos os casos possuem aprovação nas verificações/reexecuções posteriores. [Rodada original](../output/validation/vis-g06-post-floating.json). |
| Última regressão relacionada | 66 casos: 64 passaram; dois sofreram timeout durante interrupção longa do processamento. A reexecução aprovou três dos quatro cenários; o último passou em 14,9 s com traces fora do OneDrive, mantendo o limite de 90 s e as mesmas assertions. [Rodada](../output/validation/vis-g06-final-related.json), [reexecução](../output/validation/vis-g06-final-recheck.json), [caso restante](../output/validation/vis-g06-reflow-local.json). |
| Foco de rota | Regressão controlada: duas falhas antes da correção; os quatro casos passaram depois, dentro da última rodada relacionada. [Antes](../output/validation/vis-g06-route-focus-before.json). |
| Acessibilidade | Os quatro arquivos configurados em `test:a11y` foram incluídos nas rodadas. Os 70 casos têm resultado aprovado nas etapas relacionadas e reexecuções; não se afirma uma execução separada do comando. [Resumo das etapas](../output/validation/vis-g06-final-summary.json). |
| `npm run lint` | Passou na fonte final. |
| `npm run build` | Passou: entrada 270,77/425 KiB; adapter D&D 91,65/100 KiB. |
| `npm run build:pages` | Passou: entrada 270,80/425 KiB; adapter D&D 91,65/100 KiB. |
| `npm run test:production -- --reporter=list,json` | Seis percursos completos no Chrome, duas execuções de cada ficha de demonstração, sem dependências externas. [Relatório](../output/validation/vis-g06-production.json). |
| Pages no build final | 11 passaram, zero falhas/skips, em execução serial e diretório de traces próprio. Inclui seis percursos completos, lixeira, assets/404, rotas legadas, preferências e impressão. [Relatório final](../output/validation/vis-g06-pages-validated.json). |

Uma execução concorrente de duas suítes usou por engano a mesma pasta de artefatos, causando ENOENT nos traces. A concorrência foi encerrada; as verificações finais usaram diretórios separados e execução serial. Os relatórios originais foram preservados, inclusive `vis-g06-pages-clearance.json` e `vis-g06-post-floating.json`. Nenhuma assertion foi apagada ou enfraquecida; nenhum timeout ou budget foi aumentado para obter aprovação.

Houve atrasos observados de aproximadamente 4,5 min, 24,5 min, 3,2 h e 17,3 min em casos com limites muito menores. Não foi isolada a causa específica do host; o resultado aprovado posterior não apaga esses timeouts. O último caso foi conferido com os arquivos de execução em diretório temporário local, sem mudar a cópia de trabalho.

## Evidências e preservação

- 144 verificações de layout e 48 capturas de referência no Chrome, em perfis descartáveis. Somente fichas fictícias; a falha de quota é simulada exclusivamente nessa sessão. O script recusa URLs remotas e usa o módulo de persistência realmente carregado pelo Vite.
- [Galeria final](../output/visual-grimoire/review/index.html), [matriz](../output/visual-grimoire/review/matrix.json), [capturas de falha crítica](../output/visual-grimoire/review/critical/).
- Três PDFs de demonstração, duas páginas A4 cada, renderizados com Poppler e inspecionados nas seis páginas: sem cortes/sobreposição nas amostras, nomes esperados e controles de tela ausentes. As correções posteriores de navegação não alteraram a composição impressa; o ensaio Pages final repetiu suas verificações. [Verificação](../output/validation/vis-g06-pdf.json), [renderizações](../output/visual-grimoire/review/print/).
- 116 artefatos históricos de capturas/PDFs restaurados e conferidos por SHA-256. Não foram substituídos por novas expectativas. [Preservação](../output/validation/vis-g06-preserved-artifacts.json).
- [Resumo consolidado](../output/validation/vis-g06-final-summary.json), [candidata/fingerprints](../output/validation/vis-g06-candidate.json). Os relatórios parciais anteriores permanecem em `output/validation/vis-g06-*.json`.

## Verificação humana pendente

O controle nativo do Windows não iniciou, inclusive após reset: `failed to write kernel assets: O sistema não pode encontrar o caminho especificado. (os error 3)`. Portanto, o zoom nativo do Chrome não foi validado por esse recurso. NVDA não foi encontrado nos caminhos padrão de instalação; isso não exclui uma cópia portátil. Nenhum programa foi instalado ou configuração do Windows alterada.

Na prévia, conferir Chrome em 200%, Tab/Shift+Tab e Escape nos catálogos e leitura NVDA de títulos/abas, rolagem e gravação. Em aparelho real, conferir leitura e toque. A automação e as capturas não comprovam conformidade formal WCAG.

## Pendências e próxima etapa

Permanecem as verificações humanas acima e a avaliação visual do proprietário. Depois, fechar a candidata e fazer commit/publicação somente quando solicitado. Não há outra issue visual prevista neste plano; esta entrega continua local.

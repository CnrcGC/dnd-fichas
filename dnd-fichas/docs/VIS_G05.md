# VIS-G05 — Detalhes de mesa e consistência dos estados

Aplicada em 2026-10-14 diretamente na main da cópia `Área de Trabalho/Jogo/dnd-fichas`, sobre `b001bd8`, após a conclusão da hospedagem e da lixeira. A entrega permanece local para revisão visual do proprietário; não foi commitada, enviada ou publicada. O site público mantém a revisão anterior.

## Estado encontrado

- **IMPLEMENTADO:** recursos, magias, inventário, catálogos, level up, gravação confirmada/erro/retry, tabs, contenção e retorno de foco dos modais, impressão e preferências.
- **PARCIAL:** a linguagem de grimório já existia na abertura da ficha, mas os detalhes de mesa ainda tinham superfícies, campos e títulos pouco consistentes.
- **AUSENTE:** composição de resultado/tipo/cálculo no histórico, usos disponíveis em texto e marcadores numerados, tratamento visual comum dos estados de gravação.
- **BUG:** dois live regions anunciavam a mesma rolagem; o toggle repetia atributos ARIA. O histórico expandido podia encobrir foco externo e, no mobile, o botão de voltar ao topo podia sobrepor o resultado.
- **BUG:** o catálogo de itens destacava a categoria ativa apenas visualmente, sem estado acessível equivalente.

## Alterações aplicadas diretamente

`src/styles/components/grimoire.css` reutiliza os tokens existentes, com seletores restritos ao D&D e à mídia de tela. Magias, inventário e recursos recebem campos com bordas identificáveis, papel, números alinhados e divisórias comuns. Campos desabilitados conservam uma superfície distinta e borda tracejada. Campos e ações refinados nesta entrega usam 44 px de altura mínima. Os catálogos e level up mantêm a estrutura atual; cabeçalhos, abas selecionadas, busca, ações e corpo são separados por filetes. A altura das entradas acomoda os botões maiores de adicionar, sem sobreposição. O cabeçalho mobile usa menos espaçamento para evitar quebrar títulos no meio de palavras com texto ampliado. Os textos pequenos novos sobre a capa usam a tinta principal, incluindo temas automáticos e ampliados.

`src/components/modal/ModalCatalogoItens.jsx` informa a categoria ativa com `aria-pressed`, seguindo o padrão já usado no catálogo de magias. Nomes e filtros existentes foram preservados.

`src/components/ficha/BlocoRecursos.jsx` acrescenta uma contagem textual de usos disponíveis e números decorativos nos marcadores existentes. Gastos usam preenchimento e número riscado, além de `aria-pressed`. Os handlers, cálculo persistido de usos, recuperação e nomes acessíveis permanecem iguais.

`src/components/rolagem/PainelRolagens.jsx/css` apresenta chamada, resultado, tipo e cálculo separados. O histórico tem título/region e entradas com headings. O anúncio textual continua em um único live region, com chave por rolagem para anunciar resultados iguais consecutivos. Escape recolhe e devolve foco ao toggle. Quando o histórico realmente encobre um controle externo focado, recolhe e reposiciona a leitura nesse controle; um modal acima do painel não dispara essa correção. Altura/largura e rolagem respeitam a viewport, inclusive curta. No mobile, voltar ao topo fica oculto durante a expansão e retorna ao recolher. Não há nova rolagem automática, som ou mudança de regra.

`src/components/layout/AvisoPersistencia.jsx` expõe o estado existente no atributo `data-persistence-status` e combina o texto com ícone decorativo: edição em curso, gravação confirmada e falha. O selo de confirmação acompanha somente o estado `salvo`, já produzido após o commit durável. Mensagens, alerta, retry e decisão de permanecer/exportar backup são preservados; “Ficha pronta” continua um estado separado.

README, IMPLEMENTATION_STATUS e plano visual atualizados. Criados: este registro, `tests-e2e/grimoire-table.spec.js`, relatórios e capturas específicas em `output/visual-grimoire/table/`. Nenhum arquivo funcional removido. Regras, catálogos, IDs, envelopes, migrações, formato JSON, fila/repos/receipts, lazy loading e componente A4 não foram alterados.

## Critérios de aceite

- [x] Tratamentos visuais comuns nas áreas de mesa e modais D&D.
- [x] Resultados e usos disponíveis distinguíveis por texto e forma, além de cor.
- [x] Salvando/salvo/falha separados, sem sucesso antecipado.
- [x] Escape e proteção do foco do painel aplicados.
- [x] Dados, handlers, regras, foco dos modais e impressão preservados na implementação.
- [x] Validação final dos casos afetados, incluindo axe/temas automáticos, e revisão de código/diff.
- [ ] Avaliação visual do proprietário; NVDA, zoom nativo 200% e aparelho real.

## Testes e evidências

Novos testes cobrem operação de recursos por Espaço, gravar/reabrir recursos/inventário/magia, crítico e anúncio único, modo vantagem/desvantagem, Escape do painel, sobreposição real de foco, limites dos botões de catálogo, foco/rolagem dos modais, reflow em 320/390/768/1280 px com texto 28 px e espaçamento, axe e estados reais de gravação. O teste de salvamento segura uma escrita antes do repositório, lê o registro anterior enquanto pendente, libera o commit e verifica a nova versão; depois provoca falha de quota, retry e reload. Somente fichas fictícias e sessões isoladas são usadas.

| Verificação | Resultado |
|---|---|
| Matriz inicial dos novos casos | 8 passaram; 4 falharam porque o teste procurava recursos na aba Combate. Setup corrigido para Habilidades, sem mudar a interface ou enfraquecer assertions. |
| Novos casos + sheet/keyboard/level-up/persistence | 40 passaram, zero falhas/skips. [Relatório](../output/validation/vis-g05-e2e.json). |
| Feedback e anúncios após preservar a posição do live region | 8 passaram, zero falhas/skips, incluindo testes existentes de anúncio e rolagens iguais. [Relatório](../output/validation/vis-g05-feedback.json). |
| `npm run test:a11y -- tests-e2e/grimoire-table.spec.js tests-e2e/grimoire-library.spec.js --reporter=list,json` | 85/86 passaram; uma falha de contraste da legenda nova em tema automático foi corrigida e o caso repetido na validação seguinte. [Registro anterior à correção](../output/validation/vis-g05-a11y-before-contrast.json). Não é apresentado como suíte integral aprovada. |
| `npx playwright test tests-e2e/grimoire-table.spec.js tests-e2e/accessibility.spec.js --grep 'VIS-G05\|/ não possui violações' --reporter=list,json` | 16 passaram na versão final, zero falhas/skips: 14 casos VIS-G05 + abertura desktop/mobile, incluindo a falha anterior de contraste. Também valida a categoria ativa, todos os novos casos e temas automáticos claro/escuro em Habilidades/Magias/Inventário/histórico. [Relatório final](../output/validation/vis-g05-polish.json). |
| `npm run lint` | Passou na versão final. |
| `npm run build` | Passou: entrada 269,69/425 KiB; adapter D&D 91,65/100 KiB. |
| `npm run build:pages` | Passou: entrada 269,72/425 KiB; adapter D&D 91,65/100 KiB. |
| `npm run test:pages -- --reporter=list,json` | 11 passaram no Chrome instalado, zero falhas/skips: seis percursos completos, exclusão permanente, assets/404, rotas legadas, preferências e impressão preservados. [Relatório](../output/validation/vis-g05-pages.json). |

Durante o polimento, uma rodada de acessibilidade identificou a mudança da posição do anúncio que um teste existente verificava; o único live region foi mantido dentro do painel para preservar esse contrato. A rodada foi interrompida para corrigir e validar novamente. O teste novo de voltar ao topo também passou a estabelecer rolagem suficiente antes de verificar a exibição condicional do botão. Nenhuma assertion existente foi alterada, removida ou enfraquecida. As matrizes se sobrepõem; os totais não devem ser somados como cenários distintos.

A matriz ampla seguinte detectou contraste 4,37:1 na legenda sobre a capa em tema automático. Os textos pequenos das áreas refinadas passaram a usar a tinta principal. O teste que havia falhado e os novos testes de temas automáticos passaram depois da correção. A suíte ampla não foi repetida integralmente após esse ajuste de cor; a revisão global VIS-G06 permanece a próxima etapa.

**Revisão posterior em 2026-10-14/15:** a [VIS-G06](./VIS_G06.md) concluiu a validação global, preservando este histórico. Detectou e corrigiu também o contraste de “Falha crítica”, agora verificado com resultados 1/11/20 controlados. Os 70 casos de acessibilidade passaram; a regressão ampla de 238 cenários teve 236 aprovações e dois timeouts que passaram isoladamente sem alterações. Os ajustes posteriores de posição/foco receberam 66 verificações relacionadas aprovadas contando reexecuções e 11 ensaios finais de Pages. Os limites de cada etapa constam na VIS-G06. Esta atualização não apaga as falhas ou substitui as capturas originais da VIS-G05.

As capturas anteriores usam a versão pública `b001bd8` e uma ficha fictícia de demonstração; as posteriores usam os fixtures de teste. Não são comparações de dados/regra nem substituição de baselines de screenshots. A revisão visual identificou e corrigiu quebra do título mobile, altura das ações do catálogo e sobreposição de voltar ao topo. Capturas anteriores e posteriores ficam na pasta própria desta issue; evidências antigas das outras entregas são preservadas.

Diff revisado com `git diff --check`, sem alterações em regras/persistência/modelos/imports de catálogo ou arquivos fora desta issue. Capturas históricas geradas novamente pelas suítes foram restauradas; as capturas desta entrega têm pasta própria. Nenhum commit, push ou deploy novo. Prévia confirmada: **http://127.0.0.1:4175/dnd5e**.

Testes automatizados não comprovam conformidade formal WCAG e não substituem NVDA, zoom nativo 200% ou aparelho móvel real. A suíte unitária não foi reexecutada nesta etapa visual: modelos e regras não mudaram; a validação dos estados reais do navegador e os testes existentes de dados dos fluxos afetados continuam obrigatórios.

## Verificação manual e próxima issue

Na prévia local, abrir uma ficha e revisar Habilidades/Recursos, Magias e Inventário nos dois temas. Rolar atributo, abrir/recolher histórico por Enter/Escape e conferir resultado/cálculo. Abrir os catálogos, navegar por Tab/Shift+Tab e fechar por Escape; o foco deve voltar ao acionador. Conferir texto 28 px, zoom nativo 200% e leitura NVDA de resultados/estados. Abrir impressão para confirmar A4 sem os controles flutuantes.

Próxima issue: **VIS-G06 — Revisão visual e validação da candidata**, após a avaliação desta composição. O plano permanece incremental; backend, sync, catálogo ampliado, áudio e VTT continuam adiados.

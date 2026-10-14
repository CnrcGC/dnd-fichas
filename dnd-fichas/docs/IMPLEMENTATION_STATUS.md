# Estado da implementação — D&D 5e

## Hospedagem e lixeira — 2026-10-13/14

- **IMPLEMENTADO:** exclusão permanente individual na lixeira, com confirmação, retorno de foco, aviso acessível, commit IndexedDB antes de remover da lista, remoção de recuperação interna associada e reserva mínima do ID para impedir ressurreição por snapshot antigo. Fontes legadas/exportações e demais fichas preservadas.
- **IMPLEMENTADO E PUBLICADO:** site em `cnrcgc.github.io/dnd-fichas/`, HTTP 200 e HTTPS obrigatório, publicação automática da main por GitHub Actions. Execução `38504802668` aprovada, 275 unitários/11 ensaios Chrome e lint/build/budgets passando. Seis fluxos completos e quatro verificações adicionais passaram no domínio real. Ver [HOSPEDAGEM_E_LIXEIRA.md](./HOSPEDAGEM_E_LIXEIRA.md).
- **CORRIGIDO:** peers opcionais ausentes no lockfile para `npm ci` do runner e capitalização de `BlocoDescanso.jsx/css` nos nomes registrados no Git; sem mudança de versões existentes ou conteúdo dos componentes.

## Integração local na main 1.21 — 2026-10-12/13

Por decisão explícita do proprietário, o trabalho atual ocorre somente na `main`, na cópia `Área de Trabalho/Jogo/dnd-fichas`, sobre `a708251`. As correções da candidata `5ea5e3b` foram conciliadas com as regras mais recentes; o histórico abaixo não representa os resultados desta nova integração. Em 2026-10-13, o proprietário aprovou a biblioteca e autorizou o commit pelo GitHub Desktop. A integração e as entregas visuais seguintes foram publicadas em 2026-10-14, junto da correção da lixeira.

- **IMPLEMENTADO:** hidratação antes de edição, proteção de registros futuros/corrompidos, fila com snapshots independentes, confirmação do commit IndexedDB, falha explícita e repetição, lixeira e restauração; import/export e impressão do MVP.
- **IMPLEMENTADO:** grimório na biblioteca/cabeçalho, entrada somente D&D, engrenagem, botão de tema automático/claro/escuro, slider de texto 16–28 px, espaçamento, alto contraste, sublinhado de links, brilho claro 80–100%, preferências persistentes, scrollbar própria e voltar ao topo.
- **PRESERVADO:** raças/sub-raças e ancestralidades, classes, subclasses, talentos, ataques/equipamentos e perfis de escolhas mais recentes da 1.21; IDs, dados, adapters e migrações existentes.
- **CORRIGIDO:** iniciativa não soma Destreza duas vezes na criação; PV da Colina acompanham nível/troca de sub-raça; concentração encerra em condições de incapacidade; CA manual permanece após reabrir; foco dos diálogos combina restauração, fundo inerte e suporte a diálogos sobrepostos; foco inicial da criação não é roubado pelo StrictMode; idiomas escolhidos em sub-raça/antecedente não se repetem.
- **PARCIAL:** validação humana de NVDA, zoom nativo 200% e dispositivo móvel real. Não há declaração de conformidade WCAG.
- **IMPLEMENTADO:** VIS-G03 na ficha: resumo de identidade/combate na abertura, atributos antes dos formulários, capítulos e abas como marcadores, atalho por teclado para ações e composição de impressão preservada. Validação e revisão visual em [VIS_G03.md](./VIS_G03.md).
- **IMPLEMENTADO:** VIS-G04 na criação: cinco capítulos numerados, progresso textual, estados de seleção, opções como entradas de livro e orientação próxima das escolhas bloqueadas. Uma etapa pulada sem seleção permanece pendente; nenhuma regra de finalização mudou. Validação e revisão visual em [VIS_G04.md](./VIS_G04.md).
- **ADIADO:** backend/sync, criaturas, encontros, VTT e expansão de catálogo.

Resultados desta cópia e arquivos envolvidos: [MAIN_INTEGRATION.md](./MAIN_INTEGRATION.md). Os registros abaixo conservam a auditoria e as etapas anteriores.

## Histórico da auditoria e evolução anterior

Base: `CnrcGC/dnd-fichas`, branch padrão `main`, commit `f0d01c459bed86b89eb11f8487a6d979329dca53`, de 2026-09-29. Auditoria estática em 2026-10-03 UTC. Caminhos abaixo são relativos à raiz do repositório. Não foram executados testes, lint, build, axe, Playwright ou migrations.

**Implementado** significa código funcionalmente estruturado encontrado; **Parcial** indica cobertura/integração incompleta; **Ausente** indica ausência da capacidade nos caminhos e árvore auditados. **Preservar**, **Adiado** e **Obsoleto pelo novo escopo** são decisões de tratamento, não resultados de execução. Políticas: PD-001 a PD-011.

## Estado atual verificado

| Área | Estado | Evidência / tratamento |
|---|---|---|
| Biblioteca, criação e ficha D&D | Implementado / Preservar | `dnd-fichas/src/pages/{Home,NovaFicha,Ficha}.jsx`; criação guiada/manual, edição e validação de prontidão. FE-01 direciona raiz e aliases genéricos ao D&D, mantém rotas legadas isoladas e remove seletor multissistema/capacidades-placeholder da navegação ativa; `system-routing.spec.js` foi aprovado pelo proprietário em 2026-10-04. |
| Engine/adaptação D&D v8 | Implementado / Preservar | `src/systems/dnd5e/engine.js` e `src/utils/`; adapter delega às regras existentes. `commands` e `diceRequests` do contrato estão vazios: não confundir contrato com automação de comandos concluída. |
| Progressão até 20, XP/marco e multiclasse | Implementado / Preservar | `utils/{niveis,progressao,xp,proficienciasMulticlasse}.js`, `ModalLevelUp.jsx`; aprofundamento de conteúdo segue ME-02. |
| Magias | Parcial / Preservar | `utils/{conjuracao,acessoMagias,regrasMagias}.js`, `data/*Magias*.js`, `BlocoMagias.jsx`; slots regulares/pacto, preparação, origem/troca e exceções existem. Catálogo e execução geral de efeitos não são completos. |
| PV, dados de vida, descansos, condições e recursos | Parcial / Preservar | `utils/{dadosVida,descanso,status,efeitos,recurso}.js`; ME-01 cobre dano/cura em 0 PV, morte, encerramento de concentração, requisito do descanso longo e preferência explícita para recuperar dados de vida. A modelagem completa de condições, tempo e decisões contextuais segue em ME-04. Inspiração tem recurso geral em `data/recursosRastreaveis.js`. |
| Conteúdo de personagem | Parcial | ME-02A amplia as nove raças, nove sub-raças e treze antecedentes do LJ com `sourceRefs`, escolhas raciais, bônus, deslocamento, resistências e concessões por origem. ME-02B registra as doze classes e características dos níveis 1–5. ME-02C representa as 41 subclasses do catálogo anexado e cobre progressões gerais até o nível 10. ME-02D completa a revisão das características de classe/subclasse até o nível 20, amplia progressões e escolhas superiores, corrige ASIs extras de Guerreiro/Ladino e representa os 42 talentos das pp. 167–171 com pré-requisitos, escolhas internas e seleção persistente no level up. Fichas novas validam as escolhas; fichas anteriores preservam dados e recebem aviso para os novos perfis. Listas de subclasse continuam separando IDs ativos de referências `*PendentesCatalogo`, que só serão ativadas quando a magia correspondente entrar no ME-03. Efeitos contextuais permanecem assistidos/descritivos. Equipamento inicial de antecedente ainda não cria itens automaticamente; personalização de antecedente não possui editor dedicado. |
| Inventário, equipamentos e moedas | Parcial / Preservar | `utils/{inventario,equipamento,carga,moedas,ataque}.js`; ME-01 alinhou unidades de carga, multiplicadores por tamanho, escolha de atributo para acuidade e proficiência válida em ataques. A cobertura mais ampla continua nas etapas posteriores. |
| Itens mágicos | Parcial / Preservar | `data/itensMagicos.js`: seis itens nomeados; `utils/itensMagicos.js`: sintonia, cargas e efeitos. ME-01 preserva sintonizações excedentes como inativas e mantém uma versão recuperável quando o catálogo diverge. Não cobre todos os requisitos, maldições e recargas. |
| Tesouro, economia e disponibilidade | Ausente como ferramentas | Moedas/raridades não constituem gerador de tesouro nem política de estoque. Implementar ME-05/08. |
| Criaturas | Ausente no produto / Parcial no backend | `App.jsx` oferece placeholder. SQL contém `creatures`, mas não há catálogo D&D, editor, schema rico ou API de criaturas implementada. |
| Encounter Builder / Runner | Ausente no produto / Parcial no backend | Placeholder em `App.jsx`; SQL tem `encounters`/`encounter_participants`. Não existe preparação/execução real de encontro nem dificuldade/XP. |
| Persistência local D&D | Implementado / Preservar, com riscos a validar | `FichasContext.jsx`, `systems/dnd5e/characterStore.js`: IndexedDB após bootstrap legado, fila local de escrita, exclusão recuperável e restauração; não permanece apenas em localStorage. |
| Envelope, migração e recuperação | Implementado / Preservar | `platform/persistence/{envelope,legacyImport,migrationPolicy,characterRepository}.js`: revisão, recibos, backups e quarentena. Gateway de legado para v8 existe; cadeia histórica detalhada não deve ser inventada. |
| Exportação JSON e impressão/PDF | Implementado / Preservar | `utils/backup.js`, `FichaImpressao.jsx`, `window.print()` em `Ficha.jsx`; PDF é a saída do navegador. Não planejar troca de engine de PDF sem necessidade concreta. |
| Acessibilidade | VA-01 implementado e suíte-alvo aprovada / Preservar | Skip link/main, foco/títulos por rota, tokens/focus/reduced motion e tema claro/escuro/sistema existem. VA-01 cobre modais e abas por teclado, foco/restauração e fundo inerte; nomes/estados de controles; foco na criação e em erros; feedback de importação, gravação e rolagem; explicações para ações indisponíveis; contagens de catálogos; reflow, alvos mínimos e forced colors. O proprietário aprovou em 2026-10-04 os casos finais de rota e de importação/gravação; a matriz manual continua separada e conformidade AA não é alegada. |
| Preferências locais | Implementado | Engrenagem reúne texto, espaçamento, contraste, links e brilho; tema alterna por botão e inicia no padrão do sistema. Persistência local; `/settings` continua placeholder legado. Endpoint de preferências e sync não implementados. |
| Backend de personagens/autenticação | Parcial / Preservar | `server/src/{app,auth,systems}.js`, `modules/characters/`, `migrations/001_platform.sql`; Fastify, Better Auth, cookies, signup desabilitado, CRUD por dono, revisão/idempotência e health checks. Integração real/PostgreSQL/hospedagem não verificadas nesta tarefa. |
| Sincronização frontend-servidor | Ausente | Não há cliente API, outbox durável, pull paginado com tombstones ou UI de conflito. A fila local em `characterStore` não é sync. |
| Backup/restore operacional servidor | Ausente como processo verificado | Backup de migração local existe; não substitui backup PostgreSQL e exercício de restore. |
| Tabletop | Adiado / Ausente | Rota placeholder; implementar somente fase 7 sobre encontro funcional. |
| Redesign geral | Adiado | Fundação visual já existe; auditoria/protótipos/redesign finais seguem fase 8. |

Prefixo abreviado `src/` nas evidências = `dnd-fichas/src/`. Matriz mecânica detalhada e fontes: plano mecânico, seções ME-01 a ME-09.

## Preservação e escopo superado

| Elemento | Tratamento |
|---|---|
| Registro/adapters, `systemId`, envelope, SQL e importadores | Preservar quando úteis, sem novo trabalho dedicado a multissistema. |
| `src/systems/yusong/`, `src/systems/feiticeiros/` e dados respectivos | Fora do produto ativo. Não apagar nem converter registros; manter compatibilidade isolada se barata. |
| Seletor, switcher, entrada pelo último sistema e telas promocionais dos outros sistemas | Removidos da interface ativa por FE-01; componentes/adapters legados permanecem isolados para compatibilidade e recuperação. |
| Bloqueios por fontes Yusong/F&M, identidades por sistema e licensing gates antigos | Obsoleto. Não condicionam as fases D&D. |
| Testes antigos de outros sistemas | Preservar; a mudança de produto não autoriza enfraquecê-los. Atualizar expectativas de navegação somente quando a alteração correspondente for implementada, com PD-010. |

## Primeiro marco: estabilização observável

ME-00 + FE-00 + BE-00: backup e leitura de fichas v8, migração repetida, confirmação de gravação IndexedDB após commit, falhas de storage, hidratação concorrente, exclusão/restauração e importação de versão futura. O recorte ME-01 foi implementado em 2026-10-03 com preservação dos dados divergentes; sua validação executável aguarda o proprietário conforme PD-010. VA-01 e FE-01 foram implementados e tiveram seus comandos finais aprovados pelo proprietário em 2026-10-04; a matriz manual de acessibilidade continua separada e conformidade AA não é alegada. ME-02A (raças, sub-raças e antecedentes), ME-02B (classes e escolhas dos níveis 1–5), ME-02C (subclasses e características dos níveis 6–10) e ME-02D (níveis 11–20 e talentos) foram implementados; ME-02D aguarda as suítes-alvo do proprietário em 2026-10-05. VA-02 acompanha inventário, criaturas e encontros nos respectivos pacotes, pois os dois últimos fluxos ainda não existem.

Não repetir a afirmação antiga “107 testes passam” nem o build histórico como resultado atual. Suites e fixtures existem em `dnd-fichas/tests/`, `tests-e2e/` e `server/tests/`; seus resultados atuais aguardam execução pelo proprietário conforme PD-010.

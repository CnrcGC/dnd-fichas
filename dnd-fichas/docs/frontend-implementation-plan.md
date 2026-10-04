# Plano frontend — D&D 5e

Base atual: `IMPLEMENTATION_STATUS.md`. Regras/modelos/roadmap: `mechanics-dnd5e-implementation-plan.md`. Políticas globais, incluindo execução pelo proprietário: PD-001–011. Caminhos relativos a `dnd-fichas/`. Não implementar redesign nesta etapa.

## Arquitetura mantida

**VERIFIED CODE FACT:** React/Vite/Router, `src/pages/{Home,NovaFicha,Ficha}.jsx`, `FichasContext`, adapter D&D, IndexedDB/envelope, importação/exportação, print e lazy de seções já existem. `/settings`, criaturas, encontros e Tabletop são placeholders; navegação ainda oferece múltiplos sistemas.

**ARCHITECTURAL RECOMMENDATION:** manter a aplicação e seus utilities. Novas telas de catálogo/encounter usam módulos próprios, sem copiar cálculos para componentes. Extrair comandos/repositories conforme cada fluxo precisar, não como refactor geral antecipado. Manter `systemId: dnd5e` nos dados; a interface ativa não exige escolhas entre sistemas.

## Rotas de produto e compatibilidade

| Superfície | Destino planejado | Estratégia |
|---|---|---|
| Entrada / biblioteca | `/` → `/dnd5e` | Biblioteca D&D direta; ignorar última seleção de outro sistema na entrada, sem apagar preferência/dados legados. |
| Criação | `/dnd5e/characters/new` | `/characters/new` e `/nova` encaminham diretamente ao creator D&D; não exibem seletor. |
| Ficha / level up / combate / magias / inventário | `/dnd5e/characters/:id` | Preservar abas existentes e operações; level up continua modal/fluxo atual. Persistir aba quando útil, sem nova árvore de rotas por sistema. |
| Impressão | `/dnd5e/characters/:id/print` | Preservar browser print; `/ficha/:id` continua alias seguro. |
| Itens/tesouros | Catálogo nas telas atuais; ferramenta de Mestre dedicada quando ME-08 existir | Evitar duplicar catálogo entre inventário e Mestre. |
| Criaturas | `/dnd5e/creatures`, `/dnd5e/creatures/:id` | Lista, detalhe e editor custom lazy; `/creatures` encaminha D&D. |
| Encounter Builder | `/dnd5e/encounters`, `/dnd5e/encounters/:id/edit` | Preparação e templates salvos. |
| Encounter Runner | `/dnd5e/encounters/:id/run` | Execução salva; ID identifica instância apropriada, não reutiliza estado de template inadvertidamente. |
| Configurações / conta | `/settings`; login/conta somente no marco hospedado | Tema, preferências e export/backups; acesso local continua sem conta. |
| Tabletop futuro | Rota existente de personagem e destino do encontro ativo | Fase 7; ocultar convite à função até existir capacidade real. |

Manter prefixo técnico `/dnd5e` porque já existe; não criar nova infraestrutura de rotas multissistema. Links genéricos `/characters/:id` devem continuar resolvendo a referência com segurança. Link legado de outro sistema nunca abre o registro como D&D: informar que está fora do produto ativo e oferecer recuperação/exportação preservando os dados. Não desenvolver uma nova interface desse sistema.

## Pacotes

| ID / fase | Trabalho | Critério concreto e dependências |
|---|---|---|
| FE-00 / 0, P0 | Estabilizar hidratação, gravação, importação e recuperação. Esperar confirmação de commit para “salvo”; distinguir edição otimista de durabilidade. | ME-00; fixture legado/v8/futuro, reload durante save, storage indisponível, exclusão/restauração e recuperação de conflito. Não substituir fichas por array vazio em falha. |
| FE-01 / 0–1, P0 | Entrada D&D direta, remover seletor/switcher da navegação ativa, preservar aliases e adapters necessários. Esconder capacidades-placeholder do menu principal. | Criar/abrir/editar/imprimir e links antigos continuam utilizáveis; nenhum dado órfão é apagado; VA-01/02. Atualizar testes de navegação que codificam o escopo antigo conforme PD-010. |
| FE-02 / 1–2, P1 | Biblioteca e creator D&D: busca/ordem, rascunho/pronta, duplicação, import/export, lixeira recuperável. Completar escolhas de conteúdo com origem/requisitos claros. | ME-02; formulário conserva draft, explica pendências, evita Next silenciosamente bloqueado e abre revisão final acessível. |
| FE-03 / 2, P1 | Ficha/level up/combate/magias: preservar ações existentes; breakdown de valores, pré-requisitos, concentração, condições, recursos e efeitos manuais/assistidos. | ME-01–04; nenhuma alteração de interface muda fórmula sem pacote mecânico; tabs/lazy e focus/erro seguem VA-01. |
| FE-04 / 3, P1 | Inventário/catalogação: filtros por tipo/raridade/fonte, itens possuídos com unidades/quantidade/equipado/sintonia/cargas; consumíveis, containers e tesouro básico. | ME-05/08; requisitos e dado desconhecido são explícitos; consumo não repete; item sem ID conhecido permanece recuperável; disponibilidade opcional identificada. |
| FE-05 / 4, P1 | Catálogo de criaturas, detalhe do statblock, duplicar/editar custom, busca/filtros e export/reimport. | ME-06; distinção base/custom e ND/XP, ações/contexto completos; duplicação não modifica original; leitura linear acessível. |
| FE-06 / 5, P1 | Builder: grupo/níveis, criaturas/quantidades, snapshots, dificuldade e resumo para Mestre; salvar/duplicar/iniciar. | ME-07; base/adjusted XP visíveis; dados ausentes não geram estimativa enganosa; quantidade produz cópias independentes. |
| FE-07 / 5, P1 | Runner: ordem/turno/rodada, PV/temp, condições/recursos, surpresa, ações, add/remove, histórico/correção, pause/reopen/finalizar. | ME-04/07; reordenação também por botões/teclado; comandos confirmam save; preview/revisão ao aplicar estado ou recompensas à ficha. |
| FE-08 / 6, P2 | Ferramentas de Mestre: tesouros/recompensas, histórico, notas, orçamento diário e estoques manuais úteis. | ME-08; loot/XP não aplicados duas vezes; desacoplar geração e entrega; não digitalizar todo GM. |
| FE-09 / paralelo ao marco hospedado, P1 condicionado | Cliente API/login, sync/outbox e conflitos; configurações/conta. Preferências locais funcionam antes do endpoint. | BE-01–07; offline preserva edição local; sessão expirada não perde dados; “sincronizado” exige ACK; UI de conflito oferece manter cópias/duplicar/inspecionar. |
| FE-10 / 7, P3 | Tabletop: painel para ficha isolada ou encontro ativo, com PV, condições, ações/rolagens/magias/recursos/notas. | ME-09; reutilizar Runner/repositories/comandos; não criar segundo estado de sessão. |
| FE-11 / 8, P3 | Aplicar redesign somente após auditoria visual e protótipos. | VA-03–05; dados/mecânicas/rotas/print preservados e fluxos funcionais validados. |

## Contratos de interação e estado

Seguir VA-01/02 para teclado, dialog, tabs, erros, zoom, touch e semântica; não repetir a matriz aqui. Usar um só serviço de rolagens e resultados textuais; feedback sonoro/animação não pode ser a única confirmação. Catálogo exibido não implica efeito automatizado: mostrar `descritivo`, `assistido` ou `automatizado` sem bloquear consulta.

Estados de dados: carregando, vazio, rascunho, pronto, salvo localmente, aguardando sync, sincronizando, sincronizado, conflito, falha de gravação, importação com pendências e versão futura somente leitura. Não mostrar “salvo” quando apenas a fila de escrita aceitou a operação. Offline é estado de conexão, não perda de dados.

Salvar rascunhos progressivamente; importação apresenta preview, duplicatas/versões e recibo por resultado. Mudança de catálogo não remove escolhas inválidas silenciosamente: marcar pendência com possibilidade de corrigir ou exportar. Reload/pause no Runner restaura a sessão, sem recalcular iniciativa nem HP do template.

Preferências iniciais: tema claro/escuro/sistema, reduced motion respeitado do OS, formato de números/unidades consistente, e conveniências existentes de rolagem. Configuração de disponibilidade/variante de carga é opção de regra, identificada e persistida no escopo apropriado. Sem painel enorme de opções não implementadas.

## Validação entregue ao proprietário

**PD-010:** agentes entregam teste/fixture e comando adequado ao pacote; aguardam resultado. Scripts atuais, executados pelo proprietário em `dnd-fichas/`:

```bash
npm test
npm run lint
npm run build
npm run test:a11y
npx playwright test tests-e2e/dnd5e-adapter.spec.js tests-e2e/persistence.spec.js
```

Estes são comandos disponíveis, não resultados. Para cada pacote, indicar somente o subconjunto necessário; suite completa ao marco relevante se o proprietário quiser. Testes de criatura/Builder/Runner serão adicionados junto desses fluxos; não alegar que já existem. Manuais mínimos e fixtures de interface pertencem a VA-02. Performance: `frontend-performance-budgets.md`.

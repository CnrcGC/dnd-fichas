# Plano backend — D&D 5e

Decisões: PD-002/003/010/011. Modelos: plano mecânico ME-05–08. Estado auditado: `IMPLEMENTATION_STATUS.md`. Caminhos relativos à raiz do repositório. Recuperado também o plano backend antigo em `dnd-fichas/docs/`, pois ele não veio entre os anexos; suas afirmações “sem backend” foram superadas pelo código.

## Preservar e completar

**VERIFIED CODE FACT:** `server/` já contém Fastify, PostgreSQL via `pg`, Better Auth email/senha/cookies, signup desabilitado, configuração/health/OpenAPI, SQL de personagens/preferences/criaturas/encontros/participantes/mídia/importações/audit e CRUD de personagens por proprietário com revisões/operationId. Somente as rotas de personagens estão implementadas. Testes HTTP existentes usam substituições/injeções; não demonstram execução de migrations, concorrência e backup em PostgreSQL real.

**ARCHITECTURAL RECOMMENDATION:** manter um monólito modular, o banco e a autenticação atuais. Não reabrir escolha de stack, remover `system_id`, reestruturar todos os dados nem criar microservices/Kubernetes/realtime/VTT. A ficha e o catálogo funcionam no cliente; servidor cuida de sessão, propriedade, persistência/sync e backup. Regras continuam no domínio D&D; validação na API precisa de schema robusto, não automação total de combate.

## Fronteiras e fonte de verdade

| Dado | Cliente / servidor |
|---|---|
| Catálogos de livro versionados, regras, rolagens e derivados | Cliente, lazy por lote. Manter manifest/version/sourceRefs. Não precisa de banco para cada regra. |
| Personagens | IndexedDB como fonte local durável; JSONB + metadados/revisão como cópia do proprietário no servidor quando sync existir. |
| Preferências | Local imediatamente; conjunto permitido sincronizável via tabela existente. Nunca credenciais em preferences. |
| Criaturas customizadas | Repository local próprio; JSONB/version/revisão no servidor. Entrada-base do catálogo é referência imutável, não registro custom compartilhado. |
| Templates e execuções de encontros | Locais primeiro; servidor salva snapshots/estado próprios do dono. Não requer conexão permanente para avançar turno. |
| Disponibilidade/estoque e recompensas | Opcionais, escopo campanha/local; dados do usuário, com recibos contra aplicação repetida. |
| Mídia | Adiada; tabela/configuração existente é infraestrutura, não requisito para ficha/criaturas/encontros. |

Não usar servidor como árbitro de todas as rolagens ou multiplayer. Sessão/login para sync não elimina acesso aos dados locais. O caráter privado do GitHub não protege sozinho uma API hospedada; autenticação e isolamento por dono são necessários no marco hospedado.

## Pacotes e entrega

### BE-00 — Consistência atual e banco real (P0, fase 0/paralelo)

Preservar schema e migrations já aplicadas; não editar `001_platform.sql` retroativamente em banco existente. Adicionar migrations para novos campos/constraints. Alinhar resumo D&D: servidor usa `data.nivel` e `estadoFicha`; adapter usa nível total e `estadoProntidao`. Definir projeção única consistente com multiclasse/prontidão derivada, sem duplicar a engine toda no servidor. `systems.js` hoje valida basicamente campos de identidade/versão: ampliar schema/tipos/limites sem rejeitar campos custom legados indevidamente.

Verificar PostgreSQL real, auth migrations primeiro, constraints/FKs e rollback. Não afirmar que tabelas existentes são serviços concluídos. Estruturas de outros sistemas permanecem para compatibilidade, sem funcionalidades novas nem migração destrutiva.

**Fechamento:** proprietário informa resultado de setup em banco de desenvolvimento e testes de proprietário/revisão/transação; backup prévio antes de alterar banco com dados reais. Não bloqueia desenvolvimento local se servidor ainda não for utilizado.

### BE-01 — Acesso privado mínimo (P1, antes de hospedagem com dados)

Concluir provisionamento inicial de conta via mecanismo suportado de autenticação, sem senha em SQL/scripts/logs. Recuperação/admin ou convites conforme OD-01; nenhuma inscrição pública como atalho. Integrar login/logout/sessão na UI; confirmar cookies/origem/TLS/CSRF, expiração/revogação, isolamento e limites usando configuração real da instância.

Verificar transmissão de múltiplos `Set-Cookie` no bridge de `auth.js` com sessão real; mocks não comprovam isso. Conexão de produção preferencialmente mesmo origin: frontend + `/api` por reverse proxy. Proteger dados antes de exibir contas de amigos. Não impor envio de email, SSO ou painel administrativo complexo sem necessidade.

**Fechamento:** entrar/sair, sessão expirada, recuperação acordada e dois usuários isolados; chamadas sem sessão 401, acesso a recurso alheio sem revelar dados. UI acessível segue VA-01.

### BE-02 — CRUD de personagem e sync confiável (P1, marco hospedado)

Preservar rotas existentes `GET/POST /api/v1/characters`, `GET/PATCH/DELETE /:id`, `operationId` e `baseRevision`. Antes de integrar sync, corrigir lacunas:

- `list` atual retorna até 100, `nextCursor: null`, filtra registros apagados e usa apenas `updatedAfter`. Precisa de cursor estável `(updatedAt,id)` ou sequência de alteração, paginação completa e tombstones. Testar timestamps iguais e mais de 100 registros sem perda.
- Tempos de sincronização devem ser atribuídos pelo servidor; não depender de relógio/`updatedAt` enviado pelo cliente. Conservar data original de criação/importação em metadado próprio.
- Idempotência deve vincular dono + operationId a recurso/tipo e fingerprint do comando; mesmo ID com conteúdo diferente é erro. Concorrência da mesma operação deve ter resultado consistente dentro da transação. Código atual tem recibo, mas não comparação de payload nem prova de concorrência real.
- Revisão local e revisão remota são contadores distintos. Outbox persiste `operationId, resourceType/id, baseServerRevision, payload, status, attempts`; replay não atribui uma nova identidade. Persistir mudança local + outbox atomicamente quando sync estiver habilitado.
- ACK confirma resultado remoto; pull avança cursor somente após aplicar o lote local completo. 409 conserva as duas versões, permite inspeção/duplicação e decisão; não aplicar last-write-wins por timestamp.
- Implementar restauração remota compatível com a lixeira local, ainda ausente como endpoint. Login/logout/troca de usuário nunca envia automaticamente fichas de outro dono; reivindicação do conjunto local tem preview e confirmação de escopo.

**Fechamento:** dois clientes, offline/reconexão, edição concorrente, delete/restore, replay, crash antes/depois de ACK, sessão expirada e pull de versões futuras. Nenhuma ficha some e nenhum registro é sincronizado para dono errado. FE-09 faz cliente/UI; PD-010 governa execução.

### BE-03 — Preferências (P1 leve)

Endpoint próprio sobre `preferences`: chaves permitidas, versão/revisão e defaults locais. Inicialmente tema e preferências úteis realmente implementadas. Não sincronizar `activeSystem` como requisito do produto atual nem usar preferência recebida para abrir outro sistema. **Fechamento:** persistir/reabrir, conflito simples sem apagar valores não envolvidos, ausência do servidor mantém tema local.

### BE-04 — Criaturas customizadas (P1, fase 4)

Usar `creatures` existente, evoluindo validação/modelo ME-06 e índices quando necessários. Endpoints propostos `/api/v1/creatures` e `/:id`, CRUD/restauração por dono/revisão/operationId. Guardar origem/version/sourceRefs, resumo para busca e dados custom; não importar o bestiário inteiro como linhas privadas duplicadas. Export/import validado, limites de payload e nenhuma execução de código vindo de efeitos.

**Fechamento:** custom/duplicação, owners distintos, conflito, future-version, delete/restore e catálogo-base intacto. Local não depende desse endpoint.

### BE-05 — Encontros salvos e execução (P1, fase 5)

Schema existente tem `encounters.state jsonb`, `round`, revisão e `encounter_participants` com snapshot/order/resources/conditions. Escolher autoridade de cada campo: participantes em linhas próprias, cabeçalho/turno/fase e histórico em estado versionado; não persistir a mesma informação em dois lugares independentes. Acrescentar versão do schema, tipo template/run, referência de template, participante ativo e sequência de comandos por migration.

Endpoints propostos `/api/v1/encounters`, `/:id` e operações de save/restore; save atômico de sessão inteira é suficiente inicialmente. Builder cria template, iniciar produz nova execução com snapshots/IDs próprios. Salvar cabeçalho, participantes, ordem e evento numa transação. Tratar constraint de posição única durante reorder sem colisões temporárias. Remoção lógica ou snapshot de histórico deve permitir entender eventos anteriores.

**Fechamento:** owner, referência/snapshot, duas cópias independentes, save/reopen no meio do turno, add/remove ativo, reorder, conflito e revisão incompatível. Sem sockets, presença, lock de turno compartilhado ou autoridade multiplayer.

### BE-06 — Recompensas e disponibilidade (P1/P2, fases 3/6)

Primeiro formato local; acrescentar persistência JSONB simples quando houver sync. Registro de estoque por campanha/local é opcional (OD-02), independente da raridade. Aplicação de RewardBundle usa `rewardId`/operationId e transação/recibo para não repetir XP/moedas/itens; se os destinos estiverem apenas locais, usar recibo transacional no repository local e sincronizar depois. Não prometer atomicidade distribuída entre navegador e servidor.

**Fechamento:** replay, distribuição parcial, conflito/retry e correção não duplicam recompensa. Entrega assistida com preview permanece padrão; catálogo/tesouro não implica loja automática.

### BE-07 — Hospedagem simples e backups (P1 condicionado, antes de depender do servidor)

Build frontend estático + um processo Node + PostgreSQL, com TLS/reverse proxy e configurações privadas. Health existente permanece; prontidão deve verificar migrations necessárias. Sem telemetry de conteúdo das fichas; preservar redação dos logs. Mídia e `media_objects` ficam adiadas até imagem privada tornar-se necessária.

**ARCHITECTURAL RECOMMENDATION — OD-03:** backup diário do banco para destino separado, retenção inicial de 30 dias, segredo de recuperação guardado fora do repositório; objetivo inicial RPO 24h e RTO 4h, sujeito à capacidade escolhida. Export JSON local é proteção adicional, não cópia do servidor inteiro. Incluir auth, personagens, custom, encontros e recibos essenciais. Testar restore em banco separado antes do marco hospedado e após mudança estrutural relevante; registrar data/resultado. Não apagar banco original para “testar”.

**Fechamento:** implantação acessível autorizada em tarefa própria, contas funcionais, backup automático e restore demonstrado pelo proprietário. Não alterar visibilidade/publicar o repositório nesta revisão documental.

## Comandos para o proprietário

Após configurar um PostgreSQL **de desenvolvimento**, na raiz do repositório:

```bash
cd server
npm ci
npm run db:setup
npm test
npm run lint
```

`db:setup` escreve no banco configurado: conferir que não é produção e fazer backup quando houver dados. Estes scripts existem no commit auditado; a execução não ocorreu nesta tarefa. Novos testes PostgreSQL e scripts de backup/restore devem ser criados com BE-00/07 e entregues com os comandos exatos; a suite HTTP atual não substitui esses testes. Seguir PD-010 e não reportar “backend concluído” até receber os resultados do marco pertinente.

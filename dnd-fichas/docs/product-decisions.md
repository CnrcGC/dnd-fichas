# Decisões de produto — D&D 5e

Atualizado em 2026-10-03 UTC (2026-10-02 no Brasil). Substitui decisões incompatíveis dos planos anteriores. Auditoria: `CnrcGC/dnd-fichas`, `main`, commit `f0d01c459bed86b89eb11f8487a6d979329dca53`.

## Decisões globais

| ID | Decisão |
|---|---|
| PD-001 | D&D 5e é o único produto ativo. Pilares de Atlas e Feiticeiros & Maldições são **possíveis expansões futuras**, sem prazo, requisito ou bloqueio. O seletor e as ofertas desses produtos saem do planejamento de interface ativa. |
| PD-002 | Preservar engine, `systemId`, adapter, envelope, repositories, migrations e compatibilidade legada úteis. Não remover dados de outros sistemas nem renomear chaves/rotas apenas por estética arquitetural. |
| PD-003 | Uso pessoal/privado, apresentação e eventualmente amigos. Modo local continua utilizável sem servidor. Conta será necessária para sincronizar dados próprios, quando essa integração existir. O repositório consultado ainda estava público; tornar privado é uma mudança operacional separada, não realizada nesta tarefa. |
| PD-004 | Perfil de regras: D&D 5e da geração dos livros anexados, anterior à revisão 2024. Livros fornecidos são fontes primárias desta implementação; não misturar revisões silenciosamente. Registrar edição/arquivo, seção e página impressa. Divergência material de tradução/regra exige decisão explícita. |
| PD-005 | Acessibilidade fundamental é P0; objetivo WCAG 2.2 AA. Corrigir interação, contraste e reflow desde as fases iniciais, sem esperar redesign. Critérios e verificações pertencem ao plano visual/acessibilidade. |
| PD-006 | Ficha, conteúdo D&D, inventário/itens/tesouro, criaturas e encontros integram o produto. Encontros têm Builder e Runner próprios. Automação auxilia a mesa, preserva decisões do Mestre e não promete resolver qualquer regra automaticamente. |
| PD-007 | Tabletop é P3: painel de sessão sobre personagens, criaturas e encontro ativo. Sem mapa tático, fog of war, tokens arrastáveis, chat, vídeo, multiplayer em tempo real ou VTT completo. |
| PD-008 | Redesign geral é a última grande fase funcional. Primeiro corrigir acessibilidade, depois estabilizar fluxos, auditar visual, prototipar e só então implementar. Identidade final depende de protótipos futuros. |
| PD-009 | Raridade, preço sugerido e tabelas de tesouro vêm das fontes. Disponibilidade por campanha/local é **PRODUCT RULE / REGRA OPCIONAL DO APLICATIVO**, independente de raridade. Não há fórmula universal oficial de escassez presumida. |
| PD-010 | **Validação pelo proprietário:** agentes podem criar/alterar testes, regressões e fixtures, mas não executar testes, lint, build, Playwright ou axe automaticamente, salvo pedido explícito. Entregar comandos e aguardar resultados para fechar a etapa. Nunca remover/enfraquecer testes para obter aprovação. Alterar expectativa de regra exige fonte e justificativa. |
| PD-011 | Salvar escolhas e estado; derivar cálculos quando possível. Catálogo versionado não sobrescreve silenciosamente fichas, itens possuídos ou encontros. Migrar com backup, validação e recuperação; dados de versão futura ficam protegidos contra escrita incompatível. |

## Evidência e responsabilidade documental

- **VERIFIED CODE FACT:** leitura do código no commit auditado; não significa teste executado ou produção validada.
- **RULEBOOK FACT:** regra conferida nos anexos, com referência no registro do plano mecânico.
- **PRODUCT DECISION:** decisão deste arquivo/prompt; não é regra do livro.
- **ARCHITECTURAL RECOMMENDATION:** desenho proposto, ainda não implementado.
- **OPEN DECISION:** escolha do proprietário necessária antes do pacote dependente.

`IMPLEMENTATION_STATUS.md` contém evidências atuais; `mechanics-dnd5e-implementation-plan.md` contém a matriz de regras, modelos e roadmap; os planos frontend/backend descrevem integração; o visual define acessibilidade; performance contém somente limites e medições. Não duplicar matrizes entre arquivos.

## Decisões realmente abertas

| ID | Decisão | Quando necessária |
|---|---|---|
| OD-01 | Onde hospedar a instância privada e como provisionar/recuperar contas de amigos: administração manual ou convites. | Antes da disponibilização autenticada; não bloqueia D&D local. |
| OD-02 | Aceitar o perfil inicial de disponibilidade manual por local/campanha ou escolher outro modelo opcional. | Antes de implementar escassez; catálogos, raridade e tesouros oficiais podem avançar. |
| OD-03 | Confirmar destino/retensão de backups e objetivos de recuperação propostos em BE-07. | Antes de armazenar dados que dependam do servidor. |

Não requerem decisão agora: outro sistema, multiplayer, nome de plataforma neutra, artwork comercial, redesign final ou stack alternativa.

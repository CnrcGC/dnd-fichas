# Plano visual e de acessibilidade — D&D 5e

PD-005/008/010 governam prioridade, redesign e validação. Roadmap geral: plano mecânico. Integração de telas: plano frontend. Objetivo: WCAG 2.2 AA; referência normativa consultada: [W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/). AA é meta a demonstrar, não conformidade já atestada por axe.

## Fundação existente e lacunas

**VERIFIED CODE FACT:** `src/styles/tokens.css`/`components/`, preferência claro/escuro/sistema, skip link/main, `RouteAccessibility.jsx`, `useModalA11y.js` e tabs da ficha com roving tabindex/setas/Home/End já existem. Preservar também identidade atual e impressão. Esses arquivos estão no commit auditado; não tratá-los como trabalho “somente não commitado”, conforme planos antigos.

O hook de modal captura/restaura foco e Escape, mas sua lista de elementos não filtra explicitamente os invisíveis, e o código isolado não comprova contenção em todas as combinações. Tabs atuais ativam a seção ao navegar; como algumas são lazy, conferir atraso/foco/carregamento. Testes axe existentes não cobrem todas as fichas, modais, erros, print ou fluxos futuros. A validação manual e contrastes/zoom reais continuam pendentes.

## VA-01 — Fase visual 1: corrigir interação e acesso (P0; roadmap 1)

Aplicar aos fluxos existentes, sem identidade nova ou rearranjo geral do produto. Requisitos normativos resumidos:

| Critérios WCAG | Resultado necessário |
|---|---|
| 1.3.1, 4.1.2 | Semântica e nome/papel/estado acessíveis. |
| 2.1.1/2, 2.4.3/7/11 | Teclado completo, foco visível/ordenado e sem obstrução ou trap. |
| 1.4.1/3/11 | Cor não exclusiva; contraste de texto 4,5:1, texto grande 3:1 e componentes relevantes 3:1. |
| 1.4.4/10/12 | Texto ampliado, reflow a 320 CSS px, espaçamento sem perda. |
| 2.5.7/8 | Alternativa ao arraste; alvo mínimo 24×24 CSS px ou exceção aplicável. |
| 3.3.1/2/3, 4.1.3 | Erros/instruções claros e mudanças de estado perceptíveis. |
| 3.3.8 | Login acessível, sem impedir colar/gerenciador de senhas. |

**ARCHITECTURAL RECOMMENDATION — contratos práticos:**

- **Campos:** `label` associado, descrição de unidade/origem, erro por campo com `aria-describedby`/`aria-invalid`, resumo de pendências navegável. Não substituir label por placeholder. Botão bloqueado explica requisito e forma de resolver.
- **Dialogs:** nome/descrição, foco inicial adequado, Escape, foco contido, background inerte e retorno ao acionador existente. Se ele desapareceu, voltar a destino lógico. Evitar dialogs aninhados; validar focáveis dinâmicos/invisíveis. Reusar hook corrigido ou primitive já testada, sem inventar toda uma biblioteca.
- **Tabs:** manter IDs/controles/selected/roving tabindex. Se painel lazy tiver atraso, usar ativação manual Enter/Space ou carregar previamente apenas a próxima seção pertinente; não mover foco para dentro inesperadamente. Mobile pode rolar a faixa de tabs sem gerar scroll horizontal da página inteira.
- **Navegação e leitura:** um H1 útil por tela, títulos, landmarks e skip link existentes; listas/tabelas com cabeçalhos. Botões de ícone têm nome contextual; ícones decorativos ficam fora da leitura. Elementos clicáveis são controles nativos.
- **Feedback:** anunciar resultado final de rolagem, save concluído, falha e mudança de turno uma vez, com live region moderada. Histórico completo continua visível; não anunciar cada caractere editado nem quadro de animação. Alert só para falha urgente.
- **Movimento/som:** respeitar `prefers-reduced-motion`; retirar animações dispensáveis sem esconder resultado. Não exigir áudio/animação para entender estado. Atalhos ignoram inputs e não capturam teclas imprimíveis globalmente sem configuração.
- **Responsividade/touch:** testar 320/390/768/1280 px, zoom 200%/400% e nomes extensos. Priorizar alvos 44 px como escolha de conforto do produto, sem chamar isso de mínimo AA. Rodapé/sticky/overlays não cobrem foco. Dados densos têm leitura linear/linhas rotuladas sem perder ações.
- **Temas:** completar estados foco/hover/selected/invalid/disabled e high contrast/forced colors úteis, usando tokens existentes. Tema claro não é redesign e não deve continuar “adiado”. Revisar densidade/área de logo apenas quando prejudicar acesso ou fluxo, preservando identidade até protótipos.

**Fechamento:** creator/ficha/import/level up/catalogs/modais atuais completos por teclado; erro e confirmação identificáveis; foco não escapa; zoom/reflow mantém funções; defeitos encontrados registrados e corrigidos. Verificação segue VA-02 e PD-010.

## VA-02 — Fase visual 2: estabilizar os novos fluxos (P1, transversal)

Criaturas: statblock com headings/seções e lista linear de habilidades, atributos e resistências qualificadas; não comunicar tipo/ND somente por badge colorida. Busca informa quantidade sem roubar foco; editor custom explica campos desconhecidos.

Builder: grupo/níveis, quantidades e cálculo em texto legível. Runner: participante atual/rodada indicados por texto + estado; PV e recursos atual/máximo com label por participante; ordem pode ser alterada por posição/botões, além de eventual arraste. Adicionar/remover conserva foco previsível e permite correção; surpresa, derrotado e morto têm nomes distintos. Turnos/recursos não são controles dependentes de hover.

Inventário: quantidade, unidade, equipado/sintonia/cargas têm labels contextualizadas; preço ausente é “não definido”; origem oficial/opção do aplicativo permanece compreensível. Sync/importação/conflito/versão futura expõem status persistente e recuperação, sem spinner eterno nem mensagem falsa de save.

**Programa mínimo de verificação pelo proprietário:**

| Fluxo | Fixture/estado importante | Evidência necessária |
|---|---|---|
| Biblioteca/criação/ficha | Rascunho/pronta, nome longo, multiclass, erro de requisito | Teclado, tema claro/escuro, 320 px, zoom, leitor de tela em fluxo principal |
| Modais/tabs/rolagens | Abre/fecha, lazy, foco removido, erro e resultado | Focus/keys e anúncio sem duplicação |
| Persistência | Commit/falha, import inválido/futuro, delete/restore/conflito | Mensagem compreensível, recuperação e foco |
| Inventário/criaturas | Item unknown/custom, filtros, detalhe extenso, ação contextual | Labels/leitura linear e operações touch/teclado |
| Builder/Runner | Múltiplas cópias, ativo removido, rodada, condições e reload | Identidade por cópia, alternativa a reorder e estado preservado |
| Login/conta, quando entregues | Sessão expirada, password manager e recuperação | Erros acessíveis e dados locais conservados |
| Print/PDF do navegador | Ficha com conteúdo extenso | Completa/legível; ações ocultas, dados não cortados |

Automação futura: atualizar axe e smoke de teclado nas telas/estados entregues, fixtures estáveis e testes de foco dos componentes complexos. Screenshots úteis depois que os fluxos estabilizarem; não mascarar erros de acessibilidade para passar. Teste manual sugerido: NVDA/desktop e amostra mobile com leitor do sistema, zoom/reflow, motion reduzida e touch. Não alegar AA apenas porque axe não reporta violação.

Comandos atuais do proprietário, em `dnd-fichas/`: `npm run test:a11y` e `npm run test:e2e`; escolher arquivos/smokes pertinentes quando o agente os entregar. Agentes não executam esses comandos sem solicitação. Não duplicar lista de browsers em cada documento nem exigir uma matriz infinita para uma correção pequena.

## VA-03 — Fase visual 3: auditoria completa (P3; roadmap 8)

Começar depois de ficha/conteúdo central, inventário, criaturas, Builder/Runner, ferramentas prioritárias e Tabletop previsto estarem funcionais e estáveis. Inventariar telas/componentes, tipografia, espaços, hierarquia, densidade, responsividade, temas e print; medir excesso de logo/espaço livre com screenshots reais. Classificar problemas por impacto de tarefa; defeito de acesso novo continua sendo corrigido imediatamente, não aguarda redesign.

**Entregar:** diagnóstico curto com evidências, prioridades e requisitos de redesign, incluindo desktop/mobile e apresentação/feira. Nenhuma paleta, layout final ou logo nova é determinada agora.

## VA-04 — Fase visual 4: prototipagem (P3; roadmap 8)

Prototipar duas direções D&D sobre fixtures iguais de biblioteca, ficha, criatura e Runner; incluir tema claro/escuro, viewport mobile e pelo menos um erro/modal. Explorar identidade própria, legibilidade, hierarquia e uso de espaço sem retirar funções. Revisar com tarefas reais: encontrar magia, alterar recurso, consultar criatura e avançar turno.

**Fechamento:** proprietário escolhe direção com base nos protótipos; critérios de acessibilidade atendidos; componentes/tokens e comportamento de estados documentados brevemente. Decisão ocorre nessa fase, sem bloquear as fases mecânicas atuais.

## VA-05 — Fase visual 5: implementação do redesign (P3; roadmap 8)

Aplicar por fluxo/componente, preservando IDs, dados, regras, operações e print. Comparar antes/depois com fixtures e repetir verificações apenas nas superfícies afetadas. Entregar melhoria visual e funcional concreta, com comandos/evidências do proprietário; respeitar os limites de performance existentes. Sem redesign de sistemas futuros, identidade multissistema ou trabalho comercial/legal neste plano.

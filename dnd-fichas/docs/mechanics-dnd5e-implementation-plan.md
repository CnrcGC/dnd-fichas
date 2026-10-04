# Plano mecânico — D&D 5e

Contrato de implementação, sem implementação nesta revisão. Decisões globais e política de testes: `product-decisions.md`, especialmente PD-004/009/010/011. Estado atual e commit: `IMPLEMENTATION_STATUS.md`. Caminhos `src/` abaixo pertencem a `dnd-fichas/`.

## 1. Fontes e rastreabilidade

**RULEBOOK FACT:** os anexos seguem a geração anterior à revisão 2024. Usar o perfil `dnd5e-books-2014` como identificador técnico proposto; não confundir `rulesProfile`, versão do catálogo e `schemaVersion` de dados. Não substituir automaticamente as regras fornecidas por outro SRD/edição.

| Sigla | Arquivo fornecido / observação de paginação |
|---|---|
| LJ | `dd-5e-livro-do-jogador-fundo-branco-biblioteca-elfica (1)(1).pdf`. Nos trechos conferidos, página impressa = página do PDF + 1. |
| GM | `D&D5e - Guia do Mestre(1).pdf`. Nos trechos conferidos, impressa = PDF − 1. |
| MM | `D&D5e - Manual dos Monstros(1).pdf`. Nos trechos conferidos, impressa = PDF − 1. |
| VO | `D&D5e - Guia do Volo para Monstros(1).pdf`. Nos trechos conferidos, impressa = PDF − 2; bestiário começa na impressa 127. |
| TI | `D&D5e - Tesouros e Itens Mágicos(1).pdf`: recorte de GM, capítulo 7, páginas impressas 133–178, PDF de 46 páginas. Não é um segundo conjunto independente de regras nem o capítulo completo de itens. |

Offsets ajudam navegação nos trechos auditados; conferir rodapé antes de registrar nova página. As tabelas abaixo indicam seções/faixas efetivamente consultadas; cada entrada de conteúdo futura precisa da sua referência específica, sem copiar extensos textos do livro.

| ruleId / domínio | Referência impressa | Consequência implementável |
|---|---|---|
| R-CHAR | LJ caps. 1–4, pp. 11–143 | Escolhas de personagem, traços/sub-raças, classes/subclasses, antecedentes; IDs estáveis e concessões por origem. |
| R-ADV | LJ p. 15; cap. 6, pp. 163–170 | Nível/XP; multiclasse e talentos são opções de regra, com pré-requisitos e escolhas. |
| R-ABILITY | LJ cap. 7, pp. 173–181 | Modificadores, proficiência, perícias, salvamentos, vantagem/desvantagem e carga. |
| R-CARRY | LJ p. 178, “Erguendo e Carregando” | Nesta tradução, carga base em kg = FOR × 7,5; empurrar/arrastar/erguer = FOR × 15. Tamanho e sobrecarga opcional são regras separadas. |
| R-INSP | LJ p. 127, “Inspiração” | Marcador geral de inspiração não é Inspiração de Bardo; concessão pelo Mestre e gasto conforme regra. |
| R-REST | LJ p. 188, “Descansando” | Curto/longo, dados de vida e elegibilidade. Recuperação depende do recurso; não equivale a renovar qualquer carga ao descansar. |
| R-COMBAT | LJ cap. 9, pp. 189–199 | Iniciativa/surpresa, turno, movimento, ação, bônus/reação, ataques, cobertura, dano e morte. |
| R-COVER | LJ p. 198, “Cobertura” | Meia cobertura: +2 CA/DEX; três quartos: +5; total impede alvo direto quando aplicável. Contexto depende do Mestre, sem mapa. |
| R-SPELL | LJ caps. 10–11, pp. 203–289; classe pertinente no cap. 3 | Slots, componentes, rituais, duração, concentração, listas/conhecidas/preparadas e exceções de classe. |
| R-CONC | LJ p. 205, “Concentração” | Uma concentração por criatura; CD CON = maior entre 10 e metade do dano. Fontes separadas podem exigir testes separados; incapacidade/morte encerram concentração. |
| R-COND | LJ apêndice A, pp. 291–292 | Condições com efeitos próprios, incluindo exaustão em estágios. Condição não é apenas etiqueta com contador genérico. |
| R-EQUIP | LJ cap. 5, pp. 145–161 | Equipamentos, propriedades de armas/armaduras, ferramentas, custo, peso e moeda. |
| R-MAGICITEM | GM pp. 135–141 e entradas do cap. 7; TI pp. 135–141 | Raridade, identificação, sintonia, ativação, cargas e requisitos; até três itens sintonizados e restrições adicionais. |
| R-TREASURE | GM/TI pp. 133–139; tabelas de itens do GM pp. 144–149 | Tesouro individual/pilha, gemas/arte e seleção por tabelas. Não gerar loot automaticamente de toda criatura derrotada. |
| R-CREATURE | MM pp. 6–11, “Estatísticas”; VO cap. 3, pp. 127–212 e apêndices | Statblocks independentes de ficha de jogador; dano médio/dados, conjuração inata/por slots, recharge e ações especiais. |
| R-ENCOUNTER | GM pp. 81–85, “Criando Encontros” | Limiares por nível/grupo, XP base/ajustado, número de monstros/tamanho do grupo e julgamento contextual. |
| R-CUSTOM | GM pp. 273–283, ferramentas do Mestre/criação de monstro | Criaturas customizadas precisam de revisão de ND; cálculo sugerido não garante equilíbrio. |

**ARCHITECTURAL RECOMMENDATION:** registro `RuleReference = {ruleId, bookId, edition, printedPage, pdfPage?, section}`. Conteúdo recebe `id`, `catalogVersion`, `sourceRefs[]`, `rulesProfile`, `verificationStatus` e `automationLevel: descriptive | assisted | automated`. Regra própria acrescenta `ruleOrigin: product-optional` e nunca aparece como oficial. Referências e fixtures acompanham o pacote que muda a regra.

## 2. Matriz única: código versus livros

**VERIFIED CODE FACT:** o adapter D&D v8 envolve a engine existente em `src/utils/`; os comandos comuns do adapter ainda estão vazios. Não reescrever essa engine como pré-condição da expansão. “Implementado” abaixo é presença da capacidade no código auditado, não cobertura integral do livro ou aprovação em testes.

| Área pedida | Estado | Evidência e diferença principal | Pacote |
|---|---|---|---|
| Criação / atributos | Implementado / preservar | `NovaFicha.jsx`, `utils/ficha.js`, `dados.js`, `validacaoFicha.js`; escolhas/manuais e prontidão existentes. Conferir concessões/exceções. | ME-00/02 |
| Raças | Parcial | `data/racas.js`: nove raças, seleção livre do meio-elfo existe; sub-raças/traços não estão completos. Comentário sobre bônus fixo do meio-elfo é antigo e não descreve o objeto atual. | ME-02 |
| Classes | Parcial | `data/classes.js`, `habilidadesClasses.js`: doze classes; presença do nome não comprova todas as escolhas/efeitos de níveis 1–20. | ME-02 |
| Subclasses | Parcial | `subclasses.js`, `habilidadesSubclasses.js`, `subclassesFicha.js`; catálogo limitado e algumas descrições divergem do livro. | ME-01/02 |
| Antecedentes | Parcial | `data/antecedentes.js`, `proficienciasCriacao.js`; concessões existem; equipamento inicial, escolhas e personalização exigem auditoria por entrada. | ME-02 |
| Perícias / proficiências / salvamentos | Implementado em base / parcial nas exceções | `dnd.js`, `proficienciasCriacao.js`, `proficienciasMulticlasse.js`; origem e reconciliação existem. Expertise/meia proficiência e fontes adicionais precisam de casos por regra. | ME-02 |
| Talentos | Parcial | `data/talentos.js`, modal de level up; completar catálogo, pré-requisitos, escolhas e efeitos. | ME-02 |
| Progressão / XP / milestone | Implementado / preservar | `niveis.js`, `progressao.js`, `xp.js`; teto 20 e ASI. Recompensas de encontro ainda ausentes. | ME-02/08 |
| Multiclasse | Implementado em base / parcial nas exceções | `niveis.js`, `proficienciasMulticlasse.js`, `conjuracao.js`; preservar requisitos/pools/nível por classe e revisar opções especiais. | ME-02/03 |
| PV / dados de vida | Implementado em base / parcial | Histórico de PV, pools por classe, PV temporário e marcadores em `dadosVida.js`, `status.js`, `efeitos.js`. Falta resolução completa de dano a 0, morte instantânea e recuperação contextual. | ME-01/04 |
| Descansos | Parcial | `descanso.js`, `dadosVida.js`, `recurso.js`; pools/recuperação existem. Recuperar dados maiores primeiro é política do código, não imposição oficial; elegibilidade deve ser explícita. | ME-01/04 |
| Condições | Parcial | `efeitos.js`: nome/fonte/duração/contador. Falta semântica completa, gatilhos, exaustão e término condicionado. | ME-04 |
| Inspiração | Implementado como recurso / parcial na regra | `recursosRastreaveis.js`: recurso geral máximo 1, recuperação manual. Auditar gasto/concessão sem confundir com recurso de bardo. | ME-04 |
| Inventário / moedas | Implementado em base / parcial | `inventario.js`, `moedas.js`, `BlocoInventario.jsx`; ampliar instâncias, transferências e rastreabilidade de valor. | ME-05 |
| Peso / capacidade | Parcial, divergência confirmada | Dados de armas em kg, `carga.js` usa FOR × 15 como carga base; LJ p.178 usa × 7,5 kg. Tamanho/peso de moedas/variante não completos. | ME-01/05 |
| Armaduras / armas / equipamentos | Parcial | `data/{armaduras,armas,equipamentos}.js`, `equipamento.js`; CA básica e bônus mágicos existem. Métodos alternativos de CA/propriedades/contexto faltam. | ME-01/05 |
| Combate / iniciativa | Parcial | Iniciativa na ficha, rolagens e ataques existem; sem encontro, ordem/rodadas e economia de ações. | ME-04/07 |
| Ações / reações | Parcial descritivo; gestão ausente | Conteúdo/habilidades e rolagens não são um turno estruturado com gasto e recuperação. | ME-04/07 |
| Ataques / dano / cura | Parcial | `ataque.js`, `dados.js`, `efeitos.js`; acerto soma proficiência sem parâmetro de elegibilidade; acuidade escolhe DEX automaticamente. Falta resolução contextual completa. | ME-01/04 |
| Cobertura | Ausente como mecânica estruturada | Não há modelo de cobertura por alvo/ataque. | ME-04 |
| Concentração | Parcial | `concentracao.js`, `Ficha.jsx`: CD e marcador/aviso por dano; integrar término, fontes de dano e efeitos. | ME-03/04 |
| Spellcasting / spell slots / Pact Magic | Implementado em base / parcial na execução | `conjuracao.js`, `regrasMagias.js`, `BlocoMagias.jsx`; tabelas e pools separados existem. Não automatiza universalmente lançamento/alvos/efeitos. | ME-03 |
| Conhecidas / preparadas / troca de magias | Implementado em base / parcial no catálogo | Regras de classe/subclasse, fontes especiais e trocas existem. Completar entradas, componentes/rituais/escalonamento e validar exceções. | ME-03 |
| Recursos de classe | Parcial | `data/recursos*`, `utils/recurso.js`; máximo/uso/restauração são extensíveis, mas cobertura não é completa. | ME-02/04 |
| Itens mágicos / sintonia / cargas / efeitos | Parcial | Seis itens em `itensMagicos.js`; limite 3/cargas/bônus/consumo existentes. Requisitos, tempo, maldições e efeitos contextuais faltam. | ME-05 |
| Criaturas / encontros / tesouro / disponibilidade | Ausente no produto | Placeholders de rota e algumas tabelas SQL; sem modelos e fluxos completos. | ME-05–08 |

## 3. Work packages e critérios de fechamento

Todos os pacotes seguem PD-010: criar/atualizar testes quando úteis, entregar comandos, aguardar o resultado do proprietário. Critérios abaixo descrevem o resultado futuro esperado. Nenhum pacote está declarado aprovado nesta revisão.

### ME-00 — Estabilidade, dados e baseline (P0; fase 0)

Preservar v8, IDs e chaves legadas; inventariar fixture antes/depois de cada alteração. `characterRepository.put` hoje aguarda sucesso da request, sem aguardar explicitamente `transaction.oncomplete`: distinguir confirmação de commit de atualização otimista. Exercitar hidratação enquanto o usuário edita; não substituir por um snapshot antigo nem esconder registros importados.

Conferir metadado de origem em `migrateDnd5eCharacter`: o caminho legado usa `pilares-de-atlas:fichas`, que é a chave histórica do D&D; documentar essa compatibilidade, não inferir conversão de Pilares. Normalização não deve apagar silenciosamente dados desconhecidos, sintonia excedente ou efeitos ao atualizar catálogo. Preservar cópia e reportar escolhas afetadas antes de corrigir.

**Fechamento:** fixtures v8/legado/futuro/corrupto, importação idempotente com recibo, abort/quotas, multiaba/conflito, exclusão/restauração, exportação e round trip mantêm escolhas e notas; gravação só aparece como durável após commit. Integração: FE-00, BE-00, VA-02.

### ME-01 — Correções prioritárias verificadas (P0 integridade; P1 fidelidade, fases 0–2)

1. **Carga:** alinhar unidades ao LJ p.178. Não multiplicar pesos legados convertidos em kg novamente. Separar base, empurrar/arrastar/erguer, tamanho e variante opcional. Atualizar fixture antiga FOR × 15 com justificativa de regra, não silenciar a regressão.
2. **Ataques:** acuidade permite FOR ou DEX; modelo deve escolher valor elegível e conservar override consciente. Somar proficiência somente com proficiência válida na arma/ataque; separar jogada de ataque e teste de habilidade. Referência R-ABILITY/R-COMBAT.
3. **Conteúdo incorreto:** `data/subclasses.js` descreve Assassinar como acerto automático; LJ p.92 dá vantagem antes do primeiro turno do alvo e crítico em acerto contra alvo surpreendido. Auditar também Arquifada, Colégio da Bravura, Mão Aberta e Mestre das Feras: texto genérico não pode inventar benefício/ação bônus. Conferir característica específica no cap.3 antes de corrigir regra ou texto.
4. **Estado contextual:** descanso longo não ressuscita morto; cura não aumenta PV acima do máximo; dano a 0 e concentração devem seguir o livro. Recuperação automática de dados maiores primeiro vira preferência explícita ou escolha do usuário, não regra oficial.
5. **Dados:** `normalizarInventario` retira sintonia após o terceiro e reconcilia efeitos com o catálogo. Não perder estado silenciosamente em uma revisão de conteúdo: manter original, validar, explicar e permitir recuperação.

**Fechamento:** reproduções mínimas com fonte e resultado esperado, migrations somente quando alterarem dados persistidos, regressão dos fluxos já corretos. Não bloquear acessibilidade por toda a expansão de regras.

### ME-02 — Ficha e conteúdo central do LJ (P1; fase 2)

Completar traços/sub-raças; concessões por raça, classe, subclasse, antecedente e talento; opções de atributo, perícias, ferramentas/idiomas e equipamento inicial. Manter origem por concessão para não remover proficiência adquirida por outra fonte. Níveis de classe e nível total permanecem distintos. Pré-requisitos multiclasse e talentos, ASI, PV por nível e recursos devem expor breakdown legível.

**ARCHITECTURAL RECOMMENDATION:** extensões incrementais de `src/data/`/`utils/`, sem mover todos os arquivos. Fazer inventário das entradas do LJ e registrar `representada?`, `escolhas completas?`, `regra conferida?`, `automação?`. Lotes: raças/antecedentes → classes e escolhas 1–5 → subclasses/características 6–10 → 11–20/talentos. Todas as doze classes devem permanecer utilizáveis; lotes não autorizam remover funcionalidades superiores existentes.

**Fechamento:** cada entrada entregue tem sourceRef, requisitos/choices e fixture quando calcula algo; cada classe tem ao menos criação, uma fronteira de progressão e recurso relevante auditados. “Nome no catálogo” e “texto exibido” não encerram automação. Catálogo LJ incompleto continua marcado Parcial.

### ME-03 — Magias e concentração (P1; fase 2)

Preservar slots regulares, pacto, terços de conjurador, origens/subclasses, Segredos Mágicos, Arcanum e regras de troca atuais. Verificar tabelas por nível e combinações, sempre separando acesso a magia por classe dos slots disponíveis. Magias de pacto e regulares podem interagir conforme a regra, sem juntar pools; Arcanum não vira slot de pacto de nível 6–9.

Expandir gradualmente o catálogo completo de magias do LJ, incluindo utilidade/rituais e níveis altos. Modelo: nível/escola, classes/origens, castingTime, alcance/alvos/área, componentes V/S/M e custo/consumo, duração, concentração, ritual, ataque/save, dano/cura e escalonamento. Resumos em português com referência; efeitos complexos podem ficar assistidos/manuais identificados. Parser que extrai apenas o primeiro dado do texto não resolve dano composto ou upcast.

**Fechamento:** fixtures de caster completo/metade/terço/pacto/multiclasse, mago com livro/preparação, troca, sempre-preparada, ritual e upcast; seleção inválida explicada sem apagar registro. Concentração troca explicitamente, quebra por condições relevantes e informa CD por evento. UI: FE-03; fontes R-SPELL/R-CONC.

### ME-04 — Combate, condições, recursos e descansos (P1; fases 2/5)

Introduzir comandos puros nas regras somente quando o novo fluxo precisar: entrada explícita, estado anterior, resultado/eventos, warnings e erro tipado; relógio/aleatoriedade injetados. Usar utilities corretos atuais. Ações, bônus/reação, movimento, vantagem/desvantagem, crítico e ataque de oportunidade têm regras próprias; Extra Attack não concede outra ação inteira.

Resolução assistida: ataque com atributo/proficiência apropriados; dano por tipo/fonte e modificadores condicionais; resistência/vulnerabilidade/imunidade; cura/PV temporário; morte/testes de morte; cobertura; inspiração; concentração. O Mestre escolhe alvo, cobertura/contexto e confirma efeitos não automatizados. Não aplicar resistência lendo uma palavra em texto livre nem empilhar efeitos indevidamente.

Condição ativa proposta: `id, conditionId?, sourceRef, sourceActorId?, appliedAt, duration, endTrigger, saveToEnd?, stacks?, notes`. Duração distingue rounds, início/fim do turno do dono/fonte, tempo de sessão e término manual. Exaustão usa estágio 2014. Um contador único de rodadas não basta; condição sem duração não some automaticamente. Descansos consideram elegibilidade, pools por classe e regras por recurso.

**Fechamento:** fixtures dano a 0/crit/PV temp/concentração, fontes simultâneas, condições com término diferente, pools de vida mistos e pacto; aplicação/correção manual rastreável. Gestão de turnos/rodadas é integrada em ME-07, sem bloquear a ficha isolada.

### ME-05 — Inventário, itens, tesouro e disponibilidade (P1; fase 3, economia avançada P2)

Separar `ItemDefinition` de `OwnedItem`. Definição: `id, version, sourceRefs, name, category, baseItemRef?, weight {value,unit}, value {amount,currency,basis}?, weapon?, armor?, tool?, rarity?, artifact?, attunementRequirements?, activation?, charges?, recharge?, effects[], consumable?, restrictions[]`. Incluir mundanos, ferramentas, consumíveis, moedas, gemas e arte; preço ausente = desconhecido, nunca zero. Artefato não é uma sexta faixa comum de preços por raridade.

Instância: `id, definitionRef/version, snapshot?, quantity, equipped, attuned, identified, chargesCurrent?, containerId?, location?, customOverrides, notes`. Itens singulares/cargas/sintonia não devem compartilhar estado apenas porque têm o mesmo nome. Conteúdo importado/customizado sem ID conhecido precisa permanecer utilizável. Unidade canônica proposta kg/m, consistente com tradução e legado; armazenar unidade explícita em novas estruturas e migrar sem reconverter valores existentes.

Expandir catálogo LJ e GM por lotes: mundanos completos → consumíveis/armas/armaduras mágicas frequentes → itens com sintonia/cargas → itens contextuais/amaldiçoados/artefatos. Sintonia: limite, elegibilidade e tempo/término; recarga: amanhecer ou outro evento e expressão própria; esgotamento pode exigir teste/destruição; consumo reduz quantidade uma vez. Não recuperar toda varinha em descanso longo. Efeitos devem expor condições/prioridade/escopo e distinguir alteração de fórmula, bônus e vantagem; não somar toda CA de toda fonte.

**RULEBOOK FACT:** GM/TI fornece raridade, valores orientativos, tesouro individual/pilha, gemas/arte e tabelas de itens. Compra/venda depende da campanha/Mestre. Não há, nos trechos usados, algoritmo universal “raridade → probabilidade de estoque”. Pesos/preços não explicitados pela entrada não são fatos oficiais; marcar estimativa de produto/override.

**PRODUCT RULE / REGRA OPCIONAL DO APLICATIVO — proposta OD-02:** registro separado `AvailabilityRecord {campaignId, locationId, itemRef, status, stock?, restockNote?, priceOverride?, reason, updatedAt}`. Status pode usar `disponivel | limitado | sob-encomenda | indisponivel | desconhecido`; atribuição inicial manual. Raridade é filtro/sugestão, não decisão automática. Sem economia dinâmica ou probabilidades presumidas na primeira versão. Desabilitar essa camada não remove raridade oficial nem conteúdo.

**Fechamento:** pesos coerentes, compra/transferência/consumo sem duplicação ou quantidades negativas, item não identificado não revela efeito secreto na visão de jogador, IDs customizados sobrevivem export/reimport, seis itens atuais preservados. Testar cargas, pré-requisitos/sintonia, revisão de catálogo, moedas e efeitos condicionais. FE-04 e BE-03/04 fazem a integração.

### ME-06 — Criaturas (P1; fase 4, ampliação VO/GM P2)

**ARCHITECTURAL RECOMMENDATION:** `CreatureDefinition`, versionada, independente do personagem:

| Grupo | Campos/capacidade necessária |
|---|---|
| Identidade | ID, nome, tamanho, tipo/subtipo, alinhamento opcional, sourceRefs, tags, custom/origem e versão |
| Defesa/vitalidade | CA e composição/notas; PV médio e expressão de dados de vida; resistências/imunidades/vulnerabilidades com qualificadores; imunidades a condições |
| Movimento | Caminhada/voo/natação/escalada/escavação; hover e notas; unidade explícita |
| Testes | Seis atributos; salvamentos e perícias com bônus explícitos; não derivar por fórmula de jogador se o statblock informa outro resultado |
| Percepção/comunicação | Sentidos e alcances, percepção passiva, idiomas/telepatia e restrições |
| Desafio | ND canônico como fração/string (`1/8`, `1/4`, `1/2`, inteiros), XP informado, ND condicional quando a entrada exigir |
| Capacidades | Traços; ações, multiattack, reações; ações bônus somente quando a entrada as tiver; ataques com bônus/alcance/alvos e dano médio/dados/efeitos |
| Recursos especiais | Uso por dia/descanso, recharge por d6, resistências lendárias; pool/custo/gatilho de ações lendárias; ações de covil e efeitos regionais quando existentes |
| Magia | Conjuração por slots e/ou inata: atributo/CD/bônus, nível do conjurador, listas, uso à vontade/dia, componentes e restrições por magia |

Cada capacidade aceita resumo fiel e campos estruturados apenas onde a automação é implementada. Preservar texto resumido contextual em vez de forçar toda habilidade a “ataque + dano”. Predicados de resistência/requisitos são dados validados, nunca JavaScript executável de imports.

`CreatureInstance` guarda `instanceId`, `definitionRef/version`, snapshot, nome de mesa, PV atual/temp, condições, recursos, concentração, iniciativa e estado `active | defeated | dead | removed`. Duas cópias têm estados independentes. Alterar o catálogo não altera instâncias/encontros salvos; atualização é explícita.

Catálogo: busca por nome, filtros ND/tamanho/tipo/fonte/ambiente quando informado; lista/detalhe; criação customizada e duplicação para edição preservando origem. Não editar a entrada-base do livro. Lote inicial MM com diversidade técnica: criatura simples, multiattack, condição, resistência qualificada, conjurador por slots, inato, recharge e lendária/covil; depois ampliar MM e VO sistematicamente. Análise ND customizado assistida pode vir depois, claramente não garantia de equilíbrio.

**Fechamento:** cada forma importante de statblock representada por fixture com página específica; ND fracionário e XP válidos; duplicação preserva referência, edição custom não afeta base; export/reimport e cópias independentes funcionam. Catálogo grande é expansão contínua, não bloqueio para lançar Builder funcional.

### ME-07 — Encontros: preparação e execução (P1; fase 5)

**Builder:** título/notas/local; membros do grupo com níveis e snapshots/referências; criaturas com quantidade, variantes e fontes; alertas contextuais; salvar template, duplicar e abrir uma nova execução. Quantidades positivas e cada cópia ganha ID próprio. Templates não guardam PV danificado de uma execução passada.

**RULEBOOK FACT — R-ENCOUNTER:** somar limiares dos níveis dos personagens para fácil/médio/difícil/mortal; somar XP base dos monstros; multiplicar somente para estimativa de dificuldade. Multiplicadores: 1 monstro ×1; 2 ×1,5; 3–6 ×2; 7–10 ×2,5; 11–14 ×3; 15+ ×4. Grupos de menos de três PCs usam um degrau acima (extremo ×5), seis ou mais um degrau abaixo (extremo ×0,5). Monstros muito mais fracos podem ser desconsiderados na contagem conforme sua contribuição; essa escolha é explícita do Mestre. Não desconsiderar seu XP base automaticamente.

Exibir `baseXp`, `adjustedXp`, limiares, multiplicador e motivo. ND não é nível de personagem nem valor a somar para obter dificuldade. Terreno, recursos, surpresa, ondas e capacidades especiais podem mudar a avaliação; grupos sem nível/XP/ND completo exibem “estimativa indisponível”, sem falso zero. XP ajustado **não é** XP de recompensa. GM p.84 trata orçamento diário separadamente, útil em P2, sem prometer 6–8 encontros obrigatórios.

**Runner:** estado `draft | running | paused | completed`, rodada, participante atual, ordem, iniciativas/desempates registrados, PV/temp, condições, recursos e concentração por instância. Comandos: iniciar, avançar turno/rodada, corrigir ordem, dano/cura, condição/recurso, adicionar/remover e finalizar. Confirmação/correção de falha deve preservar estado anterior; mini-histórico append-only de eventos com ID, comando, ator, antes/depois relevantes e sequência. Reversão assistida de evento simples não exige event sourcing completo.

Surpresa é estado individual, não “rodada bônus” nem condição genérica: impedir ações/movimento no primeiro turno e reação até esse turno terminar conforme LJ p.191. Empates seguem R-COMBAT e decisão do Mestre quando aplicável; registrar decisão/ordem, sem sortear novamente a cada reload. Ações lendárias ocorrem no fim do turno de outra criatura e têm pool/recuperação próprios; recharge no gatilho específico, não no avanço genérico de rodada. Derrota/morte/remoção são distintas.

Snapshots de PC no Runner não sobrescrevem a ficha em cada ajuste. Ao finalizar, oferecer aplicação de mudanças selecionadas (PV, condições, recursos, XP) com revisão de origem, preview e conflito; copiar/descartar mantém ficha intacta. Salvamento/reabertura conserva turno, condições, IDs e histórico. Backend existente tem tabelas, não contrato pronto: BE-05 evolui sem duplicar estado em JSON e linhas sem autoridade definida.

**Fechamento:** fixture quatro PCs nível 1 e dois monstros de 50 XP: base 100, ajustado 150; limiares do grupo 100/200/300/400 e dificuldade fácil. Essa fixture diferencia base/ajustado e fronteira de categoria. Adicionar casos de igualdade exata, níveis mistos, grupos 2/6, monstros irrelevantes e XP desconhecido. Runner deve reabrir no meio do turno; duas cópias da criatura não compartilham PV; remover participante ativo não perde a ordem; evento de recompensa repetido não duplica XP.

### ME-08 — Ferramentas do Mestre, tesouro e recompensas (P1 básico; P2 complementos, fases 3/6)

Tesouro: selecionar tipo individual/pilha, faixa de ND e tabela, injetar RNG, mostrar rolagens e resultados com referências. Validar intervalos inclusivos de d100, sem lacunas/sobreposição. Deixar Mestre editar resultado; reroll tem novo evento e não entrega novamente o lote antigo. `RewardBundle` contém moedas, gemas/arte, refs/instâncias de itens, XP base selecionado e destino.

Recompensa: distribuir XP conforme participantes elegíveis e decisão do Mestre; separar milestone; registrar `rewardId` e aplicação idempotente. Transferência entre tesouro/grupo/ficha tem preview, quantidades e recibo; rollback/correção assistida se uma gravação falhar. Derrota não obriga saque automático nem recompensa sem revisão.

P2: orçamento diário/ondas, notas de campanha e encontros, seleção por ambiente/fonte, histórico de recompensas, lojas/estoques manuais e economia avançada. Adiar ferramentas que tentariam digitalizar toda construção de mundos, clima, cidades, planos, organizações, exploração e downtime complexo sem necessidade de sessão concreta.

**Fechamento:** tabela correta por faixa, RNG determinístico em fixture, gemas/arte com valor correto, aplicação única de XP/loot e round trip. Referências R-TREASURE/R-ENCOUNTER; raridade/disponibilidade pertencem a ME-05.

### ME-09 — Integração futura Tabletop (P3; fase 7)

Painel sobre os mesmos comandos/repositories de personagem e Runner: iniciativa/rodada, PV/temp, condições, ataques/rolagens, magias/slots, recursos, notas e ações frequentes. Sem cópia paralela da engine ou da sessão. Pode abrir personagem isolado ou encontro ativo, com visão de Mestre e informação identificada adequada. Fechamento: equivalência de resultados entre painel e ficha/Runner, reabertura e controles acessíveis. Escopo PD-007; UI FE-10.

## 4. Roadmap e dependências

| Fase | Prioridade | Entrega e condição para avançar |
|---|---|---|
| 0 | P0 | ME-00 + correções de integridade ME-01; backup/migration/save/recovery preservados e resultado do proprietário registrado. |
| 1 | P0 | VA-01/02 nos fluxos atuais; teclado, foco, erro e reflow funcionais. |
| 2 | P1 | ME-01–04: ficha/conteúdo central, classes/magia/combate em lotes; preservar o que já existe. |
| 3 | P1 | ME-05 + tesouro básico ME-08: inventário/itens/raridade e disponibilidade opcional sem falsa regra oficial. |
| 4 | P1 | ME-06: modelo de criatura e catálogo representativo; ampliação MM/VO pode continuar paralela. |
| 5 | P1 | ME-07: Builder + Runner persistentes, dificuldade/XP e integração controlada com ficha. |
| 6 | P2 | ME-08 complementar: recompensas/ferramentas/economia e expansão de conteúdo. |
| 7 | P3 | ME-09: Tabletop sobre fluxos maduros e acessíveis. |
| 8 | P3 | VA-03–05: auditoria visual, protótipos, aprovação de direção e redesign/polish. |
| 9 | Futuro | Possíveis expansões futuras; nenhum compromisso nem requisito atual. |

Dependências técnicas: ME-06 precede ME-07; ME-05 precede entrega de loot; ME-04 precede gatilhos do Runner; ME-07 precede Tabletop. Infraestrutura de hosting/auth/sync evolui em paralelo e não bloqueia modo local. Preparar schemas de criatura/encontro pode ocorrer junto aos itens, mas sem antecipar redesign ou reabrir multissistema. Acessibilidade acompanha todas as fases após a correção fundamental inicial.

## 5. Comandos para o proprietário

Na raiz, entrar em `dnd-fichas/` e executar somente os comandos correspondentes à etapa entregue:

```bash
node --test tests/carga.test.mjs tests/inventario-ca.test.mjs tests/itensMagicos.test.mjs
node --test tests/multiclasse.test.mjs tests/regrasMagias.test.mjs tests/status-descanso.test.mjs
node --test tests/platform-migrations.test.mjs tests/migration-policy.test.mjs tests/dnd5e-character-store.test.mjs
```

Nomes futuros de fixtures/testes serão fornecidos quando criados. Esses comandos existem no repositório auditado, mas não foram executados aqui. Suites completas, lint/build e UI estão no plano frontend; PostgreSQL e API, no backend. Uma alteração sem resultado do proprietário fica “implementada, validação pendente”.

# MVP de Apresentação — D&D Fichas
## Plano por Issues e Tarefas — janela de 9 dias

**Repositório:** `CnrcGC/dnd-fichas`  
**Branch base:** `main`  
**Baseline analisada:** commit `be9fef14cbc2c02f71a2fc78a1675cba1ef48f02` — versão 1.20, 04/10/2026  
**Objetivo:** transformar o roadmap amplo em um conjunto pequeno de issues executáveis antes da apresentação.

---

# 1. Regra do MVP

Durante os 9 dias anteriores à apresentação, o objetivo não é completar o roadmap inteiro. O objetivo é entregar uma versão do D&D Fichas que seja:

- estável;
- demonstrável;
- coerente visualmente;
- segura quanto aos dados locais;
- acessível para pessoas com deficiência visual, motora e outras necessidades de acessibilidade;
- compatível com leitores de tela, ampliação de texto e navegação sem mouse;
- capaz de executar o ciclo principal de uma ficha D&D 5e.

## Fluxo que define o MVP

> Biblioteca → Criar personagem → Abrir ficha → Usar recursos da ficha → Subir de nível → Salvar/reabrir → Exportar/importar → Imprimir/PDF.

Se uma tarefa não melhora diretamente esse fluxo ou a confiabilidade da apresentação, ela deve ficar para depois.

---

# 2. Labels sugeridas para o GitHub

| Label | Uso |
|---|---|
| `mvp-apresentacao` | Tudo que pertence ao recorte de 9 dias. |
| `P0` | Bloqueia apresentação ou pode causar perda de dados. |
| `P1` | Necessário para uma apresentação sólida. |
| `P2` | Refinamento somente se P0/P1 estiverem concluídos. |
| `bug` | Comportamento existente incorreto. |
| `frontend` | Interface/fluxo React. |
| `persistence` | IndexedDB, import/export e recuperação. |
| `dnd5e` | Regras e experiência do D&D. |
| `accessibility` | Acessibilidade e tecnologias assistivas. |
| `assistive-tech` | Leitor de tela, síntese de voz e outros recursos assistivos. |
| `responsive` | Mobile/reflow/layout. |
| `visual` | Refinamento visual sem redesign estrutural. |
| `documentation` | README, status e roteiro. |
| `testing` | Validação/testes/regressão. |
| `release` | Build, deploy e versão de apresentação. |

## Board sugerido

`Backlog MVP` → `Ready` → `Em andamento` → `Validação` → `Concluído`

Uma issue só vai para **Concluído** depois do critério de aceite correspondente ser verificado.

---

# 3. Issues obrigatórias do MVP

---

## MVP-01 — Estabelecer baseline e congelar o escopo da apresentação

**Prioridade:** P0  
**Labels:** `mvp-apresentacao`, `P0`, `testing`, `release`

### Objetivo

Ter uma baseline confiável antes de qualquer nova alteração e impedir que novas funcionalidades desviem os nove dias de estabilização.

### Tarefas

- [ ] Confirmar que `main` está na versão que será usada como base do MVP.
- [ ] Criar branch de estabilização/release caso a equipe continue desenvolvendo em paralelo.
- [ ] Executar `npm test`.
- [ ] Executar `npm run lint`.
- [ ] Executar `npm run build`.
- [ ] Executar os E2E principais existentes.
- [ ] Registrar falhas encontradas como issues P0/P1, sem misturar com novas features.
- [ ] Testar manualmente o fluxo biblioteca → criação → ficha → reload.
- [ ] Declarar congelados: backend/sync, criaturas, encontros, Tabletop, redesign geral e novos sistemas.

### Critério de aceite

- Existe uma baseline registrada.
- Build e falhas conhecidas estão documentados.
- A equipe sabe exatamente quais features não podem entrar antes da apresentação.

### Comandos de validação

```bash
cd dnd-fichas
npm test
npm run lint
npm run build
npx playwright test tests-e2e/system-routing.spec.js tests-e2e/dnd5e-adapter.spec.js tests-e2e/persistence.spec.js
```

---

## MVP-02 — Garantir persistência local sem perda de ficha

**Prioridade:** P0  
**Labels:** `mvp-apresentacao`, `P0`, `persistence`, `bug`

### Objetivo

Garantir que nenhuma ficha ou alteração importante seja perdida durante a demonstração.

### Tarefas

- [ ] Criar uma ficha e confirmar persistência após reload.
- [ ] Editar a ficha, recarregar e confirmar a nova versão.
- [ ] Confirmar que o estado salvo vem do IndexedDB após o bootstrap legado.
- [ ] Validar comportamento quando a gravação falha.
- [ ] Garantir que a UI não mostre sucesso falso quando a gravação não foi concluída.
- [ ] Validar exclusão recuperável.
- [ ] Validar restauração da lixeira.
- [ ] Confirmar que importações antigas não apagam silenciosamente registros atuais.
- [ ] Confirmar que uma versão futura/incompatível não é sobrescrita de forma destrutiva.

### Critério de aceite

Após criar e editar uma ficha, fechar/recarregar a aplicação não pode causar perda de dados. Falhas de armazenamento devem ser explicitamente informadas.

### Validação

```bash
npm test
npx playwright test tests-e2e/persistence.spec.js
```

---

## MVP-03 — Fechar o fluxo da biblioteca de personagens

**Prioridade:** P1  
**Labels:** `mvp-apresentacao`, `P1`, `frontend`, `persistence`, `dnd5e`

### Objetivo

Deixar a Home pronta para ser a porta de entrada do produto na apresentação.

### Tarefas

- [ ] Conferir listagem das fichas.
- [ ] Conferir busca por nome.
- [ ] Validar acesso à ficha.
- [ ] Validar botão de novo personagem.
- [ ] Validar exportação JSON a partir do card.
- [ ] Validar exclusão com confirmação.
- [ ] Validar seção de lixeira.
- [ ] Validar restauração de personagem excluído.
- [ ] Validar importação JSON válida.
- [ ] Validar mensagem de erro em JSON inválido.
- [ ] Revisar estado vazio da biblioteca.
- [ ] Garantir que nenhum placeholder de feature futura fique em evidência na jornada principal.

### Critério de aceite

Um usuário consegue encontrar, criar, importar, exportar, excluir e restaurar uma ficha sem sair da interface principal.

---

## MVP-04 — Fechar criação guiada de personagem nível 1

**Prioridade:** P0/P1  
**Labels:** `mvp-apresentacao`, `P1`, `frontend`, `dnd5e`

### Objetivo

Garantir que o fluxo de criação tenha começo, meio e fim sem becos sem saída.

### Tarefas

- [ ] Testar raça sem sub-raça obrigatória.
- [ ] Testar raça com sub-raça.
- [ ] Testar raça com escolha adicional obrigatória.
- [ ] Testar classe marcial.
- [ ] Testar classe conjuradora.
- [ ] Testar antecedente com escolhas.
- [ ] Conferir seleção de perícias/ferramentas/idiomas quando aplicável.
- [ ] Validar arranjo padrão de atributos.
- [ ] Conferir bônus raciais no resultado final.
- [ ] Validar campos de jogador/aparência/personalidade/histórico/objetivo.
- [ ] Validar criação final da ficha.
- [ ] Validar opção "Pular e criar ficha em branco".
- [ ] Corrigir qualquer bloqueio sem mensagem clara.

### Critério de aceite

Uma pessoa que não conhece a implementação consegue criar um personagem nível 1 completo apenas seguindo a interface.

### Casos mínimos de teste manual

1. Humano ou raça simples + Guerreiro.
2. Raça com sub-raça + Ladino/Clérigo.
3. Conjurador nível 1.
4. Ficha em branco.

---

## MVP-05 — Estabilizar a ficha principal para uso em mesa

**Prioridade:** P0/P1  
**Labels:** `mvp-apresentacao`, `P1`, `frontend`, `dnd5e`

### Objetivo

Transformar a ficha em uma demonstração confiável das principais capacidades do produto.

### Tarefas

- [ ] Conferir atributos e modificadores.
- [ ] Conferir perícias e proficiências.
- [ ] Conferir salvaguardas.
- [ ] Conferir CA.
- [ ] Conferir iniciativa.
- [ ] Conferir deslocamento.
- [ ] Validar alteração de PV atual.
- [ ] Validar PV temporário.
- [ ] Validar dano e cura usados na demonstração.
- [ ] Validar testes de morte no caso básico.
- [ ] Validar ataques.
- [ ] Validar recursos rastreáveis.
- [ ] Validar descanso curto.
- [ ] Validar descanso longo.
- [ ] Validar condições usadas no fluxo atual.
- [ ] Validar inventário e moedas.
- [ ] Validar notas.
- [ ] Validar tabs e carregamento lazy das seções.

### Critério de aceite

O personagem preparado para a apresentação pode ser usado por vários minutos sem erro bloqueante, perda de estado ou necessidade de editar dados manualmente fora da interface.

---

## MVP-06 — Validar magias e concentração no caso de demonstração

**Prioridade:** P1  
**Labels:** `mvp-apresentacao`, `P1`, `dnd5e`, `frontend`

### Objetivo

Demonstrar um conjurador funcional sem tentar completar todo o catálogo de magias antes da apresentação.

### Tarefas

- [ ] Preparar ao menos uma ficha conjuradora conhecida.
- [ ] Conferir slots exibidos para a classe/nível da demo.
- [ ] Conferir magias conhecidas/preparadas do caso escolhido.
- [ ] Validar gasto e recuperação de espaços quando suportado pelo fluxo atual.
- [ ] Validar início de concentração.
- [ ] Validar encerramento manual da concentração.
- [ ] Validar aviso de teste de concentração após dano.
- [ ] Validar encerramento da concentração quando o estado do personagem exigir.
- [ ] Não adicionar catálogo completo apenas para ampliar números antes da apresentação.

### Critério de aceite

A ficha conjuradora preparada demonstra magias, espaços e concentração sem inconsistência visível no roteiro escolhido.

---

## MVP-07 — Estabilizar level up e progressão

**Prioridade:** P0/P1  
**Labels:** `mvp-apresentacao`, `P1`, `dnd5e`, `frontend`

### Objetivo

Manter o level up como uma das funcionalidades de destaque da apresentação.

### Tarefas

- [ ] Preparar personagem em uma fronteira de nível adequada à demo.
- [ ] Validar level up em modo marco.
- [ ] Validar condição de XP no caso usado pela apresentação.
- [ ] Conferir PV após level up.
- [ ] Conferir novas habilidades no nível escolhido.
- [ ] Conferir recursos atualizados.
- [ ] Conferir subclassificação/escolhas quando o nível exigir.
- [ ] Conferir magia/espaços quando aplicável.
- [ ] Validar um caso de multiclasse já suportado.
- [ ] Confirmar limite total de nível 20.
- [ ] Não tentar fechar todo o conteúdo 11–20 nesta janela.

### Critério de aceite

O personagem de demonstração sobe de nível sem corromper a ficha e as mudanças relevantes aparecem imediatamente.

---

# 4. Issues específicas de acessibilidade

A acessibilidade deve ser tratada como requisito funcional do MVP, com foco em pessoas com deficiência visual, motora, baixa visão, dificuldades cognitivas e sensibilidade a movimento. O objetivo de referência continua sendo **WCAG 2.2 AA**, mas o documento separa o que é obrigatório para a apresentação do que é diferencial.

> **Importante:** para pessoas cegas, o requisito principal é compatibilidade real com leitores de tela como NVDA, JAWS e VoiceOver. Uma função própria de voz pode ser útil como complemento, mas não substitui um leitor de tela.

---

## A11Y-01 — Garantir compatibilidade com leitor de tela e navegação para pessoas cegas

**Prioridade:** P0/P1  
**Labels:** `mvp-apresentacao`, `P1`, `accessibility`, `assistive-tech`, `frontend`

### Objetivo

Garantir que biblioteca, criação e ficha possam ser compreendidas e operadas por uma pessoa cega utilizando leitor de tela.

### Tarefas

- [ ] Testar o fluxo principal com NVDA no desktop.
- [ ] Garantir um `h1` útil por tela e hierarquia coerente de headings.
- [ ] Conferir landmarks como `header`, `nav`, `main` e `footer`.
- [ ] Garantir texto alternativo útil em imagens informativas.
- [ ] Marcar imagens/ícones puramente decorativos para não poluir a leitura.
- [ ] Garantir nomes acessíveis em botões que usam apenas ícone.
- [ ] Garantir `label` associado a todos os campos de formulário.
- [ ] Usar `aria-describedby` para instruções e erros associados ao campo.
- [ ] Conferir `aria-selected`, `aria-controls` e estados das tabs.
- [ ] Conferir nome, descrição e estado acessível dos modais.
- [ ] Garantir ordem de leitura coerente com a ordem visual.
- [ ] Garantir que resultado de rolagem seja anunciado de forma textual.
- [ ] Garantir que sucesso/falha de salvamento seja anunciado.
- [ ] Garantir que mudança de etapa da criação seja anunciada sem excesso de mensagens.
- [ ] Evitar depender de cor, posição, animação ou ícone para transmitir informação essencial.

### Critério de aceite

Usando NVDA e apenas a interface da aplicação, é possível identificar a tela atual, navegar pelos principais controles, preencher a criação, abrir uma ficha e compreender resultados e mensagens essenciais.

### Validação

```bash
npm run test:a11y
```

Além da automação, executar teste manual com NVDA.

---

## A11Y-02 — Adicionar controle de tamanho do texto e suporte a baixa visão

**Prioridade:** P1  
**Labels:** `mvp-apresentacao`, `P1`, `accessibility`, `frontend`, `visual`

### Objetivo

Facilitar o uso por pessoas com baixa visão, permitindo ampliar a leitura sem perder funcionalidade.

### Tarefas

- [ ] Criar controle simples de tamanho do texto, por exemplo `A− / A / A+` ou `Normal / Grande / Muito grande`.
- [ ] Salvar a preferência localmente.
- [ ] Aplicar o ajuste de forma global usando tokens/rem e sem quebrar componentes isolados.
- [ ] Garantir que o controle tenha nome acessível e estado compreensível.
- [ ] Validar biblioteca, criação e ficha com o maior tamanho oferecido.
- [ ] Validar também zoom do navegador em 200%.
- [ ] Evitar textos essenciais com tamanho fixo em pixels que impeça ampliação.
- [ ] Corrigir elementos que sobreponham, cortem ou escondam texto ampliado.
- [ ] Garantir que botões e inputs cresçam ou refluam adequadamente quando necessário.

### Critério de aceite

A pessoa consegue aumentar o tamanho do texto dentro do site e também utilizar zoom de 200% sem perder conteúdo ou função importante no fluxo principal.

---

## A11Y-03 — Corrigir contraste, temas e comunicação não dependente de cor

**Prioridade:** P1  
**Labels:** `mvp-apresentacao`, `P1`, `accessibility`, `visual`

### Objetivo

Garantir legibilidade para pessoas com baixa visão e diferentes formas de percepção de cores.

### Tarefas

- [ ] Verificar contraste dos textos principais no tema claro.
- [ ] Verificar contraste dos textos principais no tema escuro.
- [ ] Conferir contraste de bordas e componentes importantes.
- [ ] Conferir foco visível.
- [ ] Conferir estados de erro, sucesso, selecionado e desabilitado.
- [ ] Garantir que erro/sucesso/seleção não sejam comunicados apenas por cor.
- [ ] Combinar cor com texto, ícone ou outro indicador de estado.
- [ ] Verificar conteúdo em `forced-colors` quando possível.
- [ ] Manter tema claro/escuro utilizável com o controle de tamanho de texto.

### Critério de aceite

Os estados principais permanecem distinguíveis e legíveis nos dois temas, sem exigir percepção específica de cor.

---

## A11Y-04 — Garantir navegação completa sem mouse e acessibilidade motora

**Prioridade:** P0/P1  
**Labels:** `mvp-apresentacao`, `P1`, `accessibility`, `frontend`

### Objetivo

Permitir o uso das funções principais por teclado e reduzir barreiras para pessoas com limitações motoras.

### Tarefas

- [ ] Confirmar funcionamento do skip link.
- [ ] Validar ordem de `Tab` e `Shift+Tab`.
- [ ] Validar biblioteca inteira sem mouse.
- [ ] Validar criação inteira sem mouse.
- [ ] Validar ficha e ações principais sem mouse.
- [ ] Validar tabs com setas/Home/End conforme o padrão implementado.
- [ ] Validar Enter/Espaço nos controles correspondentes.
- [ ] Validar abertura e fechamento de modal por teclado.
- [ ] Validar fechamento por Escape.
- [ ] Garantir contenção de foco em modal.
- [ ] Garantir retorno do foco ao acionador ou destino lógico.
- [ ] Garantir que conteúdo lazy não roube o foco.
- [ ] Garantir `:focus-visible` perceptível.
- [ ] Revisar alvos de toque/clique importantes, priorizando aproximadamente 44 px quando viável.

### Critério de aceite

Biblioteca → criação → ficha → level up pode ser percorrido sem mouse, sem foco perdido, trap indevido ou ação essencial inacessível.

---

## A11Y-05 — Garantir reflow, zoom e responsividade acessível

**Prioridade:** P1  
**Labels:** `mvp-apresentacao`, `P1`, `accessibility`, `responsive`, `frontend`

### Objetivo

Evitar que ampliação, telas menores ou nomes extensos removam conteúdo ou funções do usuário.

### Tarefas

- [ ] Testar aproximadamente 320–390 px de largura.
- [ ] Testar 768 px.
- [ ] Testar desktop 1280 px ou superior.
- [ ] Validar zoom 200% nos fluxos principais.
- [ ] Fazer smoke com ampliação superior quando possível.
- [ ] Remover overflow horizontal destrutivo.
- [ ] Validar nomes longos de personagem, classe e itens.
- [ ] Conferir faixa de tabs em telas estreitas.
- [ ] Garantir que modais caibam na viewport e possam ser rolados.
- [ ] Garantir que cabeçalho, rodapé e painéis fixos não cubram o foco.
- [ ] Garantir que nenhuma ação essencial dependa de hover.

### Critério de aceite

Nenhuma função necessária à demo desaparece, fica cortada ou exige rolagem bidimensional desnecessária nas larguras e ampliações testadas.

---

## A11Y-06 — Adicionar assistência por áudio como diferencial

**Prioridade:** P2 — somente após os requisitos A11Y-01 a A11Y-05  
**Labels:** `mvp-apresentacao`, `P2`, `accessibility`, `assistive-tech`, `frontend`

### Objetivo

Oferecer um recurso adicional de síntese de voz para situações úteis da ficha, sem substituir a compatibilidade com leitor de tela.

### Escopo recomendado para o MVP

Escolher **apenas um** recurso simples se houver tempo:

- [ ] Botão `Ler resumo da ficha`; **ou**
- [ ] Botão `Ouvir resultado` no painel de rolagens.

### Tarefas

- [ ] Usar síntese de voz disponibilizada pelo navegador quando suportada.
- [ ] Nunca iniciar áudio automaticamente.
- [ ] Permitir iniciar/parar a leitura.
- [ ] Garantir que o mesmo conteúdo exista em texto na tela.
- [ ] Garantir que o botão funcione por teclado.
- [ ] Usar conteúdo curto e objetivo.
- [ ] Tratar ausência de suporte sem quebrar a funcionalidade normal.

### Critério de aceite

O recurso de áudio pode ser ativado e interrompido pelo usuário e nunca é a única forma de acessar uma informação.

### Observação de escopo

Esta issue é **diferencial**, não requisito de conformidade. Se qualquer issue P0/P1 estiver pendente, adiar A11Y-06.

---

## A11Y-07 — Melhorar clareza cognitiva e reduzir movimento

**Prioridade:** P1/P2  
**Labels:** `mvp-apresentacao`, `P1`, `accessibility`, `frontend`, `visual`

### Objetivo

Reduzir confusão, esforço cognitivo e desconforto causado por movimento desnecessário.

### Tarefas

- [ ] Manter linguagem direta em botões e mensagens.
- [ ] Erros devem explicar o problema e, quando possível, como corrigir.
- [ ] Manter a criação dividida em etapas claras.
- [ ] Destacar visualmente a etapa atual também por texto/estado, não só por cor.
- [ ] Pedir confirmação em ações destrutivas relevantes.
- [ ] Evitar excesso de informação simultânea quando houver alternativa simples.
- [ ] Respeitar `prefers-reduced-motion`.
- [ ] Remover ou reduzir animações dispensáveis quando a preferência estiver ativa.
- [ ] Garantir que nenhuma animação seja necessária para entender uma rolagem, salvamento ou mudança de estado.

### Critério de aceite

O fluxo principal apresenta instruções, erros e etapas de forma clara, e continua totalmente compreensível com movimento reduzido ativado.

---

## Prioridade interna da acessibilidade

Para os nove dias, a ordem deve ser:

1. `A11Y-01` — leitor de tela/cegueira.
2. `A11Y-04` — navegação sem mouse.
3. `A11Y-02` — aumento de texto/baixa visão.
4. `A11Y-03` — contraste e temas.
5. `A11Y-05` — reflow/zoom/mobile.
6. `A11Y-07` — clareza/reduced motion.
7. `A11Y-06` — áudio próprio, somente como diferencial.

# 5. Issues de saída, apresentação e documentação

---

## MVP-08 — Validar exportação, importação e PDF como mecanismos de segurança

**Prioridade:** P1  
**Labels:** `mvp-apresentacao`, `P1`, `persistence`, `frontend`

### Objetivo

Demonstrar que o usuário consegue manter uma cópia externa e recuperável da ficha.

### Tarefas

- [ ] Exportar personagem da demo em JSON.
- [ ] Reimportar o JSON em um ambiente limpo.
- [ ] Conferir nome, níveis, atributos e dados essenciais após round trip.
- [ ] Testar JSON inválido.
- [ ] Abrir impressão da ficha principal.
- [ ] Conferir quebra de páginas.
- [ ] Garantir que ações de interface não apareçam indevidamente no PDF.
- [ ] Conferir se os dados essenciais não ficam cortados.
- [ ] Gerar PDF das fichas que serão usadas como fallback da apresentação.

### Critério de aceite

Uma ficha exportada pode ser recuperada e a versão impressa/PDF permanece legível e útil.

---

## MVP-09 — Fazer polish visual somente nas telas da apresentação

**Prioridade:** P1/P2  
**Labels:** `mvp-apresentacao`, `P1`, `visual`, `responsive`

### Objetivo

Melhorar a percepção de acabamento sem iniciar um redesign estrutural.

### Tarefas

- [ ] Revisar Home/biblioteca.
- [ ] Revisar criação.
- [ ] Revisar ficha principal.
- [ ] Corrigir espaçamentos claramente quebrados.
- [ ] Corrigir alinhamentos inconsistentes.
- [ ] Conferir hierarquia de títulos/ações.
- [ ] Conferir estados vazio/erro/carregamento.
- [ ] Rever espaço ocupado pela logo apenas se prejudicar o fluxo demonstrado.
- [ ] Remover affordances visuais de funcionalidades ainda não disponíveis na jornada principal.
- [ ] Não alterar arquitetura visual global ou identidade da aplicação.

### Critério de aceite

As três telas centrais parecem pertencer ao mesmo produto e não apresentam defeito visual óbvio durante a demo.

---

## DOC-01 — Atualizar README para refletir a versão realmente apresentada

**Prioridade:** P1  
**Labels:** `mvp-apresentacao`, `P1`, `documentation`

### Objetivo

Evitar que o GitHub contradiga o site no dia da apresentação.

### Tarefas

- [ ] Atualizar descrição do escopo ativo de D&D.
- [ ] Atualizar números de conteúdo que ficaram antigos.
- [ ] Corrigir descrição de persistência para refletir IndexedDB + compatibilidade legada.
- [ ] Manter instruções de instalação atualizadas.
- [ ] Explicar que backend é opcional/futuro para o fluxo da apresentação.
- [ ] Atualizar seção de estado dos sistemas para não vender Pilares/F&M como foco da entrega atual.
- [ ] Conferir comandos reais do `package.json`.

### Critério de aceite

Uma pessoa que abrir o README entende corretamente o que funciona no produto apresentado.

---

## DOC-02 — Atualizar IMPLEMENTATION_STATUS para a baseline 1.20/MVP

**Prioridade:** P1  
**Labels:** `mvp-apresentacao`, `P1`, `documentation`

### Objetivo

Manter o documento de estado alinhado ao código real e ao escopo congelado da apresentação.

### Tarefas

- [ ] Atualizar commit/data da auditoria.
- [ ] Registrar ME-01/ME-02/VA-01/FE-01 já incorporados no commit 1.20 conforme evidência atual.
- [ ] Distinguir implementado, parcial, ausente e adiado.
- [ ] Manter criaturas/encontros/sync/Tabletop como fora do MVP.
- [ ] Não declarar teste como aprovado sem resultado real.
- [ ] Adicionar referência ao novo plano de MVP de apresentação.

### Critério de aceite

Não existe contradição material entre README, Implementation Status e versão demonstrada.

---

## DEMO-01 — Preparar dados e roteiro de demonstração

**Prioridade:** P1  
**Labels:** `mvp-apresentacao`, `P1`, `documentation`, `release`

### Objetivo

Evitar improvisação e tornar a apresentação repetível.

### Tarefas

- [ ] Preparar personagem nível 1 para criação/resultado inicial.
- [ ] Preparar personagem aproximadamente nível 4/5 para level up e combate.
- [ ] Preparar personagem conjurador ou multiclasse para profundidade mecânica.
- [ ] Exportar JSON das três fichas.
- [ ] Gerar PDF das fichas.
- [ ] Definir ordem exata dos cliques da apresentação.
- [ ] Ensaiar a demo completa usando os dados preparados.
- [ ] Registrar qualquer atrito encontrado como bug P0/P1.
- [ ] Preparar versão curta da demo caso o tempo seja reduzido.

### Critério de aceite

A apresentação completa pode ser repetida duas vezes seguidas sem precisar alterar dados manualmente ou improvisar caminhos.

---

## RELEASE-01 — Gerar e validar build de apresentação

**Prioridade:** P0  
**Labels:** `mvp-apresentacao`, `P0`, `release`, `testing`

### Objetivo

Garantir que a versão apresentada funcione fora do servidor de desenvolvimento.

### Tarefas

- [ ] Executar build de produção.
- [ ] Validar orçamento de bundle já integrado ao build.
- [ ] Abrir build localmente via preview.
- [ ] Validar rota inicial `/`.
- [ ] Validar rota direta de personagem.
- [ ] Validar refresh de rota no ambiente hospedado.
- [ ] Validar IndexedDB no domínio final.
- [ ] Validar import/export no domínio final.
- [ ] Validar impressão/PDF no navegador da apresentação.
- [ ] Validar tema claro/escuro no build.
- [ ] Validar fluxo principal sem backend.

### Critério de aceite

Existe uma build de produção independente do ambiente de desenvolvimento e capaz de executar a demo completa.

---

## RELEASE-02 — Regressão final e Release Candidate

**Prioridade:** P0  
**Labels:** `mvp-apresentacao`, `P0`, `release`, `testing`

### Objetivo

Fechar a versão e impedir regressões de última hora.

### Tarefas

- [ ] Rodar testes unitários.
- [ ] Rodar lint.
- [ ] Rodar build.
- [ ] Rodar acessibilidade automatizada.
- [ ] Rodar E2E de roteamento D&D.
- [ ] Rodar E2E de persistência.
- [ ] Rodar E2E do adapter D&D.
- [ ] Fazer smoke manual de biblioteca.
- [ ] Fazer smoke manual de criação.
- [ ] Fazer smoke manual da ficha.
- [ ] Fazer smoke manual de level up.
- [ ] Fazer smoke manual de import/export.
- [ ] Fazer smoke manual de PDF.
- [ ] Fazer smoke manual de teclado.
- [ ] Fazer smoke manual mobile.
- [ ] Corrigir apenas P0/P1 restantes.
- [ ] Criar tag/commit de Release Candidate.
- [ ] Não aceitar feature nova após o congelamento final.

### Critério de aceite

Nenhum P0 conhecido permanece aberto e a versão candidata executa o roteiro completo de demonstração.

---

# 6. Issues proibidas antes da apresentação

Não criar/iniciar estas issues dentro da sprint de nove dias, salvo se houver um bloqueio crítico diretamente relacionado ao MVP:

- backend hospedado completo;
- login e fluxo de conta;
- sync cliente-servidor;
- PostgreSQL de produção;
- sistema remoto de backup;
- catálogo de criaturas;
- editor de criatura custom;
- Encounter Builder;
- Encounter Runner;
- Tabletop;
- gerador completo de tesouro;
- economia/estoque por campanha;
- catálogo integral de magias;
- catálogo integral de itens mágicos;
- conteúdo detalhado completo dos níveis 11–20;
- redesign estrutural completo;
- nova arquitetura;
- expansão ativa de Pilares de Atlas;
- expansão ativa de Feiticeiros & Maldições.

Esses itens permanecem no roadmap pós-apresentação.

---

# 7. Ordem recomendada das issues nos 9 dias

## Dia 1

- `MVP-01` Baseline e congelamento.
- Abrir bugs P0/P1 descobertos.
- Iniciar `DOC-01` e `DOC-02` somente após confirmar o estado real.

## Dia 2

- `MVP-02` Persistência.
- `MVP-03` Biblioteca.
- Corrigir qualquer P0 encontrado.

## Dia 3

- `MVP-04` Criação de personagem.
- Aplicar `A11Y-01` e `A11Y-04` nos componentes tocados.

## Dia 4

- `MVP-05` Ficha principal.
- `MVP-06` Magias/concentração.
- `MVP-07` Level up.
- Continuar `A11Y-01` nos feedbacks da ficha.

## Dia 5

- `A11Y-01` Leitor de tela/NVDA.
- `A11Y-02` Controle de tamanho do texto.
- `A11Y-03` Contraste e temas.
- `A11Y-04` Navegação sem mouse.
- `A11Y-05` Reflow/zoom/mobile.
- `A11Y-07` Reduced motion/clareza nos fluxos afetados.
- `MVP-09` Polish visual restrito.
- `A11Y-06` somente se P0/P1 estiverem estáveis.

## Dia 6

- `MVP-08` JSON/PDF.
- `DEMO-01` Dados e roteiro.
- Finalizar `DOC-01` e `DOC-02`.

## Dia 7

- `RELEASE-01` Build/deploy.
- Corrigir somente defeitos que apareçam no ambiente final.

## Dia 8

- `RELEASE-02` Regressão completa.
- P0 primeiro, P1 depois.
- Congelamento de conteúdo ao fim do dia.

## Dia 9

- Confirmar Release Candidate.
- Ensaiar apresentação.
- Manter build local de fallback.
- Manter JSONs/PDFs/screenshots de fallback.
- Não adicionar funcionalidades.

---

# 8. Ordem de prioridade se o tempo ficar ainda menor

Se os nove dias diminuírem, seguir exatamente esta ordem:

1. `MVP-02` — persistência.
2. `MVP-04` — criação.
3. `MVP-05` — ficha.
4. `MVP-07` — level up.
5. `RELEASE-01` — build de apresentação.
6. `A11Y-01` — leitor de tela/cegueira.
7. `A11Y-04` — navegação sem mouse.
8. `A11Y-02` — aumento de texto.
9. `A11Y-03` — contraste/temas.
10. `A11Y-05` — mobile/reflow/zoom.
11. `MVP-08` — export/PDF.
12. `MVP-03` — polish da biblioteca.
13. `DOC-01` / `DOC-02`.
14. `A11Y-07` — clareza/reduced motion.
15. `MVP-09` — refinamento visual.
16. `A11Y-06` — áudio próprio, apenas se houver folga.

Nunca sacrificar persistência ou estabilidade para adicionar uma feature nova.

---

# 9. Definition of Done geral

O MVP só está pronto quando:

- [ ] A aplicação abre diretamente na experiência D&D.
- [ ] É possível criar um personagem nível 1.
- [ ] É possível criar uma ficha em branco.
- [ ] A ficha persiste após reload.
- [ ] É possível abrir e editar uma ficha existente.
- [ ] PV, ataques, recursos e descansos usados na demo funcionam.
- [ ] A ficha conjuradora da demo funciona.
- [ ] Level up funciona no personagem preparado.
- [ ] Inventário e moedas continuam utilizáveis.
- [ ] Exportação JSON funciona.
- [ ] Importação JSON funciona.
- [ ] Exclusão/restauração funciona.
- [ ] Impressão/PDF é legível.
- [ ] A jornada principal funciona com leitor de tela no smoke manual definido.
- [ ] A jornada principal funciona por teclado, sem depender de mouse.
- [ ] Existe forma de aumentar o tamanho do texto e a interface suporta zoom de 200%.
- [ ] A jornada principal funciona em viewport mobile/reflow.
- [ ] Tema claro e escuro funcionam com contraste aceitável.
- [ ] Informações essenciais não dependem apenas de cor, animação ou áudio.
- [ ] `prefers-reduced-motion` é respeitado nos fluxos principais.
- [ ] Nenhum placeholder está no caminho central da demo.
- [ ] README reflete o produto atual.
- [ ] IMPLEMENTATION_STATUS reflete a baseline atual.
- [ ] Build de produção foi validado.
- [ ] Nenhum P0 conhecido permanece aberto.
- [ ] Existe uma Release Candidate congelada.

---

# 10. Suite final recomendada

Na pasta `dnd-fichas/`:

```bash
npm test
npm run lint
npm run build
npm run test:a11y
npx playwright test tests-e2e/system-routing.spec.js tests-e2e/dnd5e-adapter.spec.js tests-e2e/persistence.spec.js
```

Os testes não devem ser removidos ou enfraquecidos para produzir um resultado verde. A validação de acessibilidade também exige smoke manual com teclado, NVDA, zoom/reflow e os dois temas; automação sozinha não demonstra conformidade.

---

# 11. Resultado esperado para a apresentação

O projeto não precisa ser apresentado como uma plataforma que já implementa todo o ecossistema de D&D.

A mensagem deve ser:

> O D&D Fichas já possui um ciclo funcional de personagem: criação guiada, ficha utilizável em mesa, progressão, regras assistidas, persistência local, recuperação, backup e PDF. A versão de apresentação também prioriza acessibilidade para pessoas com deficiência, com suporte a leitores de tela, navegação sem mouse, ampliação de texto, contraste, reflow e redução de movimento. Recursos próprios de áudio são tratados como complemento. Criaturas, encontros, sincronização e Tabletop fazem parte da evolução posterior do produto.

Esse recorte demonstra mais maturidade do que abrir várias funcionalidades incompletas.

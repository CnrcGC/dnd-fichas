# Criação e edição da ficha — complementos solicitados em 2026-10-15

Implementação na cópia `Área de Trabalho/Jogo/dnd-fichas`, somente na main, posterior à VIS-G06. Esta solicitação do proprietário acrescenta rolagem e retrato ao escopo anterior. Não modifica o roadmap nem inicia funcionalidades adiadas. Alterações anteriores preservadas; sem commit ou publicação nesta entrega.

## Estado encontrado

- **IMPLEMENTADO:** arranjo padrão, upload/importação JSON, progressão, idiomas com origem, catálogo de habilidades e edição da ficha.
- **PARCIAL:** limites dos campos existiam no HTML, mas não no tratamento da alteração; catálogo informava níveis sem impedir aquisição antecipada.
- **AUSENTE:** geração de atributos com dados, retrato local e seções retráteis de proficiências.
- **BUGS:** desmarcar concessões manuais as recriava como legado; PV máximo editável; texto dos itens bloqueados perdia contraste por opacidade.

## Comportamento entregue

- Criação oferece **Arranjo padrão** e **Rolagem de dados**. São seis grupos de 4d6, descartando um único menor em cada grupo, inclusive nos empates. Mostra dados, descarte e total. A distribuição troca posições e distingue resultados iguais pelo número da rolagem. Alternar o método ou retornar às etapas preserva a rolagem existente. Rolar novamente é uma ação explícita. Não avança sem rolar.
- `rolagensAtributos` guarda os dados e a distribuição na ficha; `metodoAtributos` identifica a geração. Editar atributos posteriormente marca o método como manual, preservando o histórico da rolagem. Compra de pontos não foi acrescentada nesta entrega.
- Edição de atributos aceita inteiros com base mínima 1 e **total máximo 30, incluindo bônus racial**. Valores não finitos não são gravados pela edição. A regra existente do ASI comum continua limitada a 20. Valores legados não são apagados ou reescritos na importação.
- PV máximo permanece consultável e somente leitura; a alteração direta também é recusada no handler. Progressão, descansos e histórico de PV existentes são preservados. PV atual mantém seu limite pelo máximo.
- Idiomas, ferramentas e perícias manuais podem ser desmarcados sem reaparecer após normalização/reabertura. Origens automáticas continuam concedidas. Idiomas automáticos são identificados; escolhas de criação podem ser limpas ou trocadas em Identidade e progressão. Escolhas inválidas permanecem identificáveis no seletor e podem ser corrigidas.
- Aba **Proficiências** com quatro seções nativas retráteis: Perícias (inicialmente aberta), Idiomas, Proficiências de combate e Ferramentas. Funcionam com Enter/Espaço e mantêm as rolagens existentes.
- Catálogo bloqueia habilidades de classe acima do nível **da classe de origem**, inclusive em multiclasse. A ação também confere o requisito antes de adicionar; evita duplicatas. Permite consultar a descrição e explica o requisito. Dados antigos não são silenciosamente removidos.
- Retrato disponível na criação e na identidade da ficha. PNG/JPEG/WebP até 5 MB; redimensionamento proporcional até 512 px, armazenamento em JPEG local limitado a 400.000 caracteres. Permite substituir/remover, informa erros e acompanha persistência, exportação/importação JSON e impressão. Não requer URL, rede ou backend. Imagens SVG e URLs externas não são renderizadas como retrato.

Referências de regras: [geração de atributos — regras básicas de 2014](https://www.dndbeyond.com/sources/dnd/basic-rules-2014/step-by-step-characters) e [progressão das classes — regras de 2014](https://www.dndbeyond.com/sources/dnd/basic-rules-2014/classes). O teto de edição 30 segue o pedido do proprietário; não concede automaticamente características que autorizem ultrapassar 20.

## Arquivos

**Criados:**

- `src/utils/atributos.js`, `src/utils/retrato.js`.
- `src/components/ficha/RetratoPersonagem.jsx` e `.css`.
- `tests/character-editing.test.mjs`, `tests-e2e/character-editing.spec.js`.
- Este registro e evidências em `output/character-editing` e `output/validation/character-editing-*.json`.

**Modificados:**

- `src/pages/NovaFicha.jsx`, `NovaFicha.css`, `Ficha.jsx`.
- `src/components/ficha/AtributoCard.jsx`, `BlocoStatus.jsx`, `BlocoPericias.jsx`, `BlocoProficiencias.jsx` e `.css`, `BlocoRacaClasse.jsx`, `BlocoHabilidades.jsx`, `FichaImpressao.jsx` e `.css`.
- `src/components/modal/ModalCatalogoHabilidades.jsx`, `ModalCatalogoItens.css`.
- `src/utils/ficha.js`, `habilidade.js`, `proficienciasCriacao.js`.
- Testes existentes de adapter, ficha, acessibilidade, preferências e reflow: o nome da aba passa legitimamente de Perícias a Proficiências; assertions anteriores preservadas.
- README e IMPLEMENTATION_STATUS.

Nenhum arquivo funcional removido. IDs, systemId, envelopes, repositórios, migrações, compatibilidade e campos personalizados preservados. Não há alteração de versão do schema: os campos novos são aditivos.

## Validação

- [x] Rolagem/distribuição, limites, retrato, idiomas e requisito de nível implementados.
- [x] Proficiências retráteis e nome da aba atualizados.
- [x] Persistência, JSON, level up e impressão preservados nas amostras.
- [x] Diff revisado; nenhum arquivo funcional removido.
- [ ] Revisão humana com imagem própria e NVDA.

| Validação | Resultado |
|---|---|
| node --test tests/character-editing.test.mjs | Oito testes novos aprovados. |
| npm test | 283 aprovados, zero falhas/skips, incluindo os oito novos. |
| Playwright: character-editing, dnd5e-adapter, sheet-accessibility | 58 aprovados nos projetos desktop/mobile. [Relatório](../output/validation/character-editing-final.json). |
| Playwright: retrato, criação com texto máximo, ficha e leitura ampliada | 16 aprovados; 320/390/768/1280 px, dois temas, texto até 28 px com espaçamento/contraste. Inclui dois casos de retrato já presentes na rodada anterior; os totais não são cenários únicos somáveis. [Relatório](../output/validation/character-editing-reflow.json). |
| npm run lint | Aprovado. |
| npm run build | Aprovado; entrada 270,85/425 KiB, adapter D&D 91,84/100 KiB. |
| npm run build:pages | Aprovado; entrada 270,89/425 KiB, adapter D&D 91,84/100 KiB. |
| PDF com retrato | Duas páginas A4 renderizadas e inspecionadas; imagem incorporada na primeira página e nenhum caractere fora da página nas amostras. [Relatório](../output/validation/character-editing-pdf.json). |
| Evidências anteriores | 116 artefatos históricos restaurados e conferidos por SHA-256. [Preservação](../output/validation/character-editing-preserved-artifacts.json). |

A primeira rodada dos dez casos novos teve oito aprovações e duas falhas de contraste nos itens bloqueados (o nome atingia 3,17:1). A causa era a opacidade de 50% aplicada ao item inteiro. O estado passou a usar borda tracejada, sem reduzir a opacidade do texto; o botão permanece desabilitado e o nível continua explícito. As verificações axe passaram após a correção. O [relatório inicial](../output/validation/character-editing-e2e.json) foi preservado. A primeira passagem de lint também exigiu preservar a causa de erro e importar Buffer explicitamente nos testes; ambos corrigidos. Nenhuma assertion ou orçamento foi enfraquecido.

A automação não equivale a validação com NVDA nem comprova conformidade WCAG. Nenhuma suíte global de todos os E2E foi afirmada nesta entrega.

## Verificação manual

Criar com rolagem e trocar dois resultados; enviar uma imagem própria e reabrir a ficha. Na aba Proficiências, abrir/fechar as seções pelo teclado e marcar/desmarcar um idioma manual. Conferir com NVDA os seletores, as seções retráteis e as mensagens de imagem. Não há declaração formal de conformidade WCAG.

## Pendências

Revisão humana com imagem própria e leitor de tela. Alterações locais, ainda não publicadas.


## Retorno visual — 2026-10-15

Correções solicitadas pelo proprietário após experimentar a entrega:

- **Espaços de magia:** números eram cortados pelo padding de uma regra compartilhada com campos largos. Os campos numéricos agora têm tratamento próprio, largura para três dígitos, padding compacto e algarismos tabulares. O controle continua numérico, com edição, setas do teclado e persistência. Steppers visuais deixam de disputar espaço interno.
- **Catálogos de habilidades/itens:** botão de adicionar e altura das linhas reduzidos; 32 × 32 CSS px no desktop, 44 × 44 px quando o dispositivo informa ponteiro de toque. Conteúdo reserva espaço para a ação, inclusive com texto ampliado.
- **Retrato:** área quadrada “Imagem”, com prévia e ativação por Enter/Espaço. Substitui a aparência nativa de “Escolher arquivo”. O arquivo continua sendo validado pelo mesmo utilitário. Remover a imagem devolve o foco ao seletor.
- **Biblioteca:** retrato salvo exibido no cartão; fichas sem imagem mantêm o símbolo da classe. Reutiliza o campo já persistido, sem migração ou mudança de JSON.

Arquivos de implementação alterados nesta revisão: `src/styles/components/grimoire.css`, `src/pages/Home.jsx`, `Home.css`, `src/components/ficha/RetratoPersonagem.jsx` e `.css`. Novo `tests-e2e/layout-feedback.spec.js`; teste existente de retrato atualizado para distinguir imagens da biblioteca e da ficha, aguardar a rota após importação e verificar retorno de foco.

Os testes novos verificam leitura dos números e espaço útil, setas/edição/reabertura, botões dentro dos cartões sem sobreposição, seletor quadrado por teclado, retratos na biblioteca após recarga, fallback sem imagem e axe nos dois temas. Amostras visuais em `output/layout-feedback/`.

Validação desta revisão:

- **22 cenários relacionados com resultado aprovado entre as etapas:** a primeira rodada passou 18/22; os dez casos da reexecução dirigida final passaram, incluindo as quatro falhas corrigidas e os controles adicionais de foco/formato. Não representa uma execução única global sem falhas. [Resumo](../output/validation/layout-feedback-summary.json), [reexecução](../output/validation/layout-feedback-final.json).
- **Quatro casos adicionais de leitura aprovados:** 28 px, espaçamento, alto contraste, brilho 80%, dois temas e quatro larguras, nos projetos desktop/mobile. [Relatório](../output/validation/layout-feedback-reading.json).
- **Lint e builds normal/Pages aprovados:** entrada 270,85/270,89 KiB de 425 KiB; adapter D&D 92,02 KiB de 100 KiB.
- **116 artefatos históricos inalterados**, conferidos por SHA-256. [Conferência](../output/validation/layout-feedback-preservation.json).
- Capturas de números, catálogos, seletor e biblioteca inspecionadas. Somente fichas fictícias em perfis de teste, sem alteração das fichas pessoais do proprietário.

 A primeira rodada está preservada em `output/validation/layout-feedback.json`. Duas falhas de largura revelaram a precedência da regra CSS compartilhada; duas falhas do teste antigo ocorreram porque o seletor global de imagem passou a encontrar também os retratos dos cartões durante a importação. A correção de CSS e o escopo/espera corretos do teste foram aplicados sem remover assertions nem aumentar limites.

Esta revisão continua somente na main local, sem commit/push/publicação.


### Acabamento do retrato — 2026-10-15

A pedido do proprietário, “Imagem” aparece somente enquanto não há retrato. Após selecionar, a foto ocupa o mesmo enquadramento quadrado anterior, sem legenda sobreposta. Remover passa a ser um X no canto superior direito, com nome acessível/tooltip “Remover imagem”; a área clicável é 28 px no desktop e 36 px no toque. Alterar e remover são botões irmãos, sem controles interativos aninhados. Tab alcança o X e Espaço remove, devolvendo foco ao seletor. Arquivo, compressão, armazenamento, JSON, biblioteca e impressão não mudam.

Alterados apenas o componente RetratoPersonagem e seu CSS nesta implementação. Testes existentes complementados para verificar ausência da legenda, geometria do X, contraste/axe, manutenção do enquadramento, remoção por teclado e retorno de foco. Lint e builds normal/Pages passaram dentro dos budgets. Relatório inicial em `output/validation/portrait-corner-action.json`; rechecagem dirigida do caso desktop em `output/validation/portrait-corner-action-recheck.json`. O caso desktop excedeu 30 s na primeira rodada, sem diagnóstico isolado da causa; seu limite e assertions foram preservados.

Rechecagem desktop aprovada em 23,4 s, com as mesmas assertions e limite de 30 s. Os seis cenários relacionados têm aprovação contando essa reexecução; os quatro cenários de aparência/axe passaram nos dois temas e projetos. Diff conferido; sem commit, staging ou publicação pelo agente.

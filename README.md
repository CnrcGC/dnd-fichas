<p align="center">
  <img src="dnd-fichas/public/logo-dd-fichas.png" alt="D&D Fichas" width="320" />
</p>

# D&D Fichas — MVP de apresentação

Aplicação local-first para criar e usar fichas de **D&D 5e (regras de 2014)**. O foco da apresentação é biblioteca → criação → ficha → combate/recursos → magias → inventário → level up → salvar/reabrir → JSON → impressão/PDF. Os módulos multissistema existentes são preservados, mas sua expansão está adiada.

O frontend fica em [`dnd-fichas/`](./dnd-fichas). O serviço em [`server/`](./server) é opcional e está fora do MVP. A especificação ativa é o [MVP de 9 dias](./dnd-fichas/docs/MVP-9-DIAS-ISSUES-ACESSIBILIDADE.md); os planos anteriores servem como histórico.

## Recursos

- Criação guiada em cinco capítulos numerados, com seleção e pendências explícitas, além de ficha em branco. Entrega visual em [VIS_G04.md](./dnd-fichas/docs/VIS_G04.md).
- Biblioteca e ficha com aparência de grimório; identidade, vida, defesa e atributos destacados, com atalho para as ações. Estado da entrega visual em [VIS_G03.md](./dnd-fichas/docs/VIS_G03.md).
- Catálogo local com 9 raças, 9 sub-raças, 12 classes, 13 antecedentes, 41 subclasses, talentos e magias; automação varia conforme a regra.
- Proficiências iniciais por classe, raça e antecedente, com idiomas, ferramentas e origem de cada concessão.
- Multiclasse com pré-requisitos, nível total máximo 20, proficiências reduzidas, pools de dados de vida e PV por classe de origem.
- Assistente de level up com PV, ASI, subclasse, habilidades e troca opcional de magias.
- Magias por classe, conjuração parcial, espaços combinados, Magia de Pacto e Arcano Místico.
- Segredos Mágicos de Bardo/Colégio do Conhecimento e origens especiais por talento, item ou regra da mesa.
- Validação para a mesa: erros bloqueantes, escolhas pendentes, avisos e estado de rascunho ou ficha pronta.
- Combate, ataques, recursos, concentração, descansos, inventário, moedas e rolagens.
- Persistência automática em IndexedDB, lixeira com restauração e exclusão permanente individual, e importação/exportação JSON; dados legados de `localStorage` são preservados durante o bootstrap.
- Impressão A4 com ficha própria para PDF; arquivos de demonstração em [`docs/demo`](./dnd-fichas/docs/demo) e roteiro em [`DEMO.md`](./dnd-fichas/docs/DEMO.md).
- Tema automático com botão claro/escuro, configurações na engrenagem, texto de 16 a 28 px por slider, espaçamento de leitura, alto contraste, links sublinhados e brilho do tema claro de 80% a 100%. Preferências salvas localmente. Skip link, abas e modais por teclado, feedback textual e redução de movimento seguem disponíveis. NVDA e zoom nativo continuam pendentes; não há declaração formal de conformidade WCAG.

## Executar localmente

```bash
cd dnd-fichas
npm ci
npm run dev
```

O frontend funciona sem backend e sem conexão com a internet para seus fluxos locais. Fontes web possuem fallback do sistema. Autenticação, PostgreSQL e sincronização estão fora da apresentação; documentação histórica em [`server/README.md`](./server/README.md).

## Comandos disponíveis

Execute os comandos dentro de `dnd-fichas/`:

```bash
npm run dev      # desenvolvimento
npm test         # testes automatizados
npm run lint     # análise estática
npm run build    # build de produção
npm run preview  # visualização do build
npm run test:a11y -- --workers=1 # axe, teclado e ampliação/reflow
npm run test:e2e -- --workers=1  # regressões de navegador
npm run test:production         # ensaios no preview; gera PDFs de fallback
npm run build:pages             # build para /dnd-fichas/, com budget e 404
npm run test:pages              # Chrome contra hospedagem estática simulada
npm run test:hosted             # Chrome contra a origem HTTPS real
npm run preview:pages           # http://127.0.0.1:4174/dnd-fichas/
npm run demo:prepare            # recria somente os JSONs de demonstração
```

Endereço escolhido para apresentação: **https://cnrcgc.github.io/dnd-fichas/**. A publicação anterior usa o build da candidata em `gh-pages`. Por decisão do proprietário, o desenvolvimento atual ocorre somente na **`main`**, sobre a versão 1.21, com as correções do MVP e o visual de grimório integrados localmente. Biblioteca e preferências aprovadas pelo proprietário em 2026-10-13; esta revisão ainda não foi publicada. Validação atual em [`MAIN_INTEGRATION.md`](./dnd-fichas/docs/MAIN_INTEGRATION.md); histórico em [`DEPLOY.md`](./dnd-fichas/docs/DEPLOY.md) e [`MVP_VALIDATION.md`](./dnd-fichas/docs/MVP_VALIDATION.md).

## Dados e privacidade

O site público já responde em [GitHub Pages](https://cnrcgc.github.io/dnd-fichas/), com uma versão anterior. A publicação automática da main foi preparada e aguarda ativação por GitHub Actions/commit/push. Estado verificado e entrega da lixeira em [HOSPEDAGEM_E_LIXEIRA.md](./dnd-fichas/docs/HOSPEDAGEM_E_LIXEIRA.md). As fichas continuam locais ao navegador; exporte/import JSON para levar dados de localhost ao domínio público.

IndexedDB é a fonte de verdade das fichas D&D após o bootstrap legado. Os registros originais de `localStorage` não são apagados nem usados para sobrescrever edições mais recentes. A interface aguarda a hidratação antes de editar, confirma o commit antes de anunciar salvamento e informa falhas com opção de tentar novamente. Registros futuros/incompatíveis são preservados e não entram na edição normal. Exporte JSONs como cópias externas; armazenamento do navegador é específico do dispositivo e domínio.

O fluxo da apresentação funciona sem backend, autenticação ou sincronização. Esses recursos estão fora do MVP. Escopo: [`MVP-9-DIAS-ISSUES-ACESSIBILIDADE.md`](./dnd-fichas/docs/MVP-9-DIAS-ISSUES-ACESSIBILIDADE.md). Evidências reais: [`MVP_VALIDATION.md`](./dnd-fichas/docs/MVP_VALIDATION.md).

## Estado da migração multissistema

- D&D 5e: interface e engine ativos no MVP, com rotas legadas preservadas.
- Pilares de Atlas/Yusong: biblioteca, criação, ficha e regras locais existem; impressão não está habilitada. Preservado, com expansão adiada.
- Feiticeiros & Maldições: schema, núcleo de regras, rastreabilidade e metadados de especializações existem; criação/ficha/impressão estão bloqueadas no adapter. Fora do MVP.
- Plataforma: registro lazy de sistemas, envelope versionado, repositório IndexedDB, importação idempotente, temas e fundação acessível.

## Escopo do catálogo

O projeto usa um catálogo local selecionado, não uma cópia completa de todo conteúdo publicado para D&D 5e. As opções automáticas já suportadas — subclasses, limites de magia e regras de criação — possuem os dados necessários no catálogo atual. Conteúdo manual e regras específicas de campanha continuam possíveis e são identificados como tal na ficha.

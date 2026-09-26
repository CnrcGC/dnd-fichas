<p align="center">
  <img src="dnd-fichas/public/logo-dd-fichas.png" alt="D&D Fichas" width="320" />
</p>

# Plataforma de fichas de RPG

Aplicação local-first em evolução para reunir fichas de **D&D 5e**, **Yusong** e **Feiticeiros & Maldições** sem misturar as regras dos sistemas. A experiência D&D existente continua sendo a interface funcional principal enquanto os demais módulos são incorporados com migrações explícitas.

O frontend fica em [`dnd-fichas/`](./dnd-fichas) e o serviço opcional de sincronização em [`server/`](./server). Os quatro planos de implementação na raiz são o contrato de evolução do projeto.

## Recursos

- Criação guiada de personagem e ficha em branco.
- 9 raças, 12 classes, 8 antecedentes e 26 subclasses do catálogo atual.
- Proficiências iniciais por classe, raça e antecedente, com idiomas, ferramentas e origem de cada concessão.
- Multiclasse com pré-requisitos, nível total máximo 20, proficiências reduzidas, pools de dados de vida e PV por classe de origem.
- Assistente de level up com PV, ASI, subclasse, habilidades e troca opcional de magias.
- Magias por classe, conjuração parcial, espaços combinados, Magia de Pacto e Arcano Místico.
- Segredos Mágicos de Bardo/Colégio do Conhecimento e origens especiais por talento, item ou regra da mesa.
- Validação para a mesa: erros bloqueantes, escolhas pendentes, avisos e estado de rascunho ou ficha pronta.
- Combate, ataques, recursos, concentração, descansos, inventário, moedas e rolagens.
- Persistência automática em `localStorage`, além de importação e exportação de fichas em JSON.

## Executar localmente

```bash
cd dnd-fichas
npm install
npm run dev
```

O frontend continua funcionando sem servidor. Para configurar autenticação, PostgreSQL e sincronização, consulte [`server/README.md`](./server/README.md).

## Comandos disponíveis

Execute os comandos dentro de `dnd-fichas/`:

```bash
npm run dev      # desenvolvimento
npm test         # testes automatizados
npm run lint     # análise estática
npm run build    # build de produção
npm run preview  # visualização do build
```

## Dados e privacidade

As fichas D&D legadas continuam no `localStorage`. A camada de plataforma usa envelopes isolados por sistema e IndexedDB; a ponte de importação nunca apaga automaticamente os registros legados. A sincronização é opcional, autenticada e não envia dados locais apenas porque o usuário entrou na conta.

## Estado da migração multissistema

- D&D 5e: engine existente encapsulado sem alteração de regras, rotas legadas preservadas.
- Yusong: contrato, schema v1, migração defensiva e fórmulas auditadas; a interface-fonte não está presente neste repositório.
- Feiticeiros & Maldições: schema/registro de regras e núcleo determinístico explicitado pelos planos; catálogo e regras dependentes do livro permanecem bloqueados sem o PDF 2.5.2.
- Plataforma: registro lazy de sistemas, envelope versionado, repositório IndexedDB, importação idempotente, temas e fundação acessível.

## Escopo do catálogo

O projeto usa um catálogo local selecionado, não uma cópia completa de todo conteúdo publicado para D&D 5e. As opções automáticas já suportadas — subclasses, limites de magia e regras de criação — possuem os dados necessários no catálogo atual. Conteúdo manual e regras específicas de campanha continuam possíveis e são identificados como tal na ficha.

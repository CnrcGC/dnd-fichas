# Decisões de produto

## PD-001 — Navegação orientada primeiro pelo sistema

- **Status:** aprovada pelo proprietário em 2026-09-26.
- **Decisão:** D&D 5e, Yusong e Feiticeiros & Maldições permanecem na mesma plataforma, mas cada sistema possui sua própria seção, biblioteca, criação, fichas, modo de mesa, criaturas, encontros, navegação e identidade visual.
- **Rotas preferenciais:** `/dnd5e/...`, `/yusong/...` e `/feiticeiros-maldicoes/...`; rotas globais como `/settings` e `/account` ficam fora dessas seções.
- **Entrada:** `/` apresenta o seletor no primeiro uso ou redireciona para o último sistema ativo salvo nas preferências.
- **Shell:** o seletor de sistema é persistente, troca a seção sem recarregar a página e continua usando o registro/adapters compartilhados.
- **Compatibilidade:** as rotas genéricas `/characters/...` são transitórias e devem redirecionar com segurança durante a migração.
- **Substituição de requisito:** esta decisão substitui a biblioteca mista descrita originalmente em `FE-01`, `FE-03` e `VA-05`, além de qualquer pacote posterior que dependa dessa premissa.

Esta decisão não autoriza duplicar autenticação, persistência, backend, preferências, primitivas acessíveis ou outra infraestrutura compartilhada.

## PD-002 — Nome público do segundo sistema

- **Status:** aprovada pelo proprietário em 2026-09-27.
- **Decisão:** o nome público e canônico do segundo sistema é **Pilares de Atlas**, não Yusong.
- **Compatibilidade técnica:** o identificador interno `yusong`, a rota transitória `/yusong`, módulos, funções, fixtures e chaves legadas `yusong.*` permanecem temporariamente para evitar quebra de dados e migrações.
- **Aplicação:** novos textos visíveis devem usar Pilares de Atlas. Uma eventual migração de identificadores ou rota exige redirects e migrações versionadas próprios.

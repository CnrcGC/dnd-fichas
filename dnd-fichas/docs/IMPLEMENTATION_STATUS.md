# Estado da implementação multissistema

Atualizado em 2026-09-26. Este arquivo registra o que existe no código; os quatro planos na raiz continuam sendo o contrato completo.

## Concluído nesta etapa

- **FE-00:** instalações reproduzíveis verificadas; `node_modules` e `dist` removidos do índice Git e ignorados.
- **MECH-01:** contrato de engine, identificadores estáveis, issues/comandos comuns e carregamento lazy por sistema.
- **MECH-02:** D&D v8 encapsulado pelo contrato, com migração idempotente e sem reescrever regras.
- **VA-01 (fundação):** tokens semânticos, temas claro/escuro/sistema e preferência antes do primeiro paint.
- **VA-03 (fundação):** idioma `pt-BR`, skip link, foco/título por navegação e headings principais.
- **BE-00:** workspace Fastify, configuração validada, erros/IDs de requisição, health checks, OpenAPI e shutdown.

## Parcial

- **FE-01/02:** registro, rotas, envelope, IndexedDB, recibos, quarentena e ponte legada existem, mas a biblioteca D&D atual ainda não foi trocada para o novo repositório.
- **FE-09:** temas estão funcionais; as demais preferências ainda não foram implementadas.
- **FE-12/VA-12:** testes unitários e axe/teclado desktop/320 px existem; faltam a matriz manual, screenshots estáveis e cobertura de todas as rotas futuras.
- **MECH-00:** D&D e novos contratos possuem cobertura; faltam fixtures reais da aplicação Yusong ausente.
- **MECH-03:** fórmulas explicitadas no plano e migração defensiva existem; a extração completa depende do código-fonte Yusong.
- **MECH-04:** política e casos de legado/corrupto/futuro estão cobertos no cliente; faltam fixtures reais adicionais.
- **MECH-05/06:** schema F&M, registro de rastreabilidade e núcleo inequivocamente especificado pelo plano existem; conteúdo e fórmulas dependentes do livro não foram inferidos.
- **BE-01/02/03:** Better Auth, schema SQL, isolamento por proprietário, CRUD v1, revisão/idempotência e testes HTTP em memória existem; falta validação contra PostgreSQL real.

## Bloqueios de fonte/ambiente

- O repositório não contém a aplicação Yusong auditada pelos planos.
- O PDF `Feiticeiros & Maldições - Livro de Regras v2.5.2.pdf` não foi localizado no repositório nem no OneDrive acessível.
- O ambiente atual não possui PostgreSQL (`psql`) nem Docker; migrations, constraints, backup e restore não foram executados.
- Branding, hospedagem, recuperação, retenção, nomes públicos e direitos visuais continuam decisões do proprietário.

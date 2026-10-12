# Estado da implementação multissistema

Auditado em 2026-10-10 e retomado em 2026-10-12 sobre a cópia local, commit `f0d01c459bed86b89eb11f8487a6d979329dca53` (1.19). O fetch final encontrou 1.20 em `main` remoto (`be9fef1`); esse código não substituiu a cópia local validada. O usuário autorizou commit, tag, push e publicação; a candidata fica em `codex/mvp-apresentacao`, preservando `main` remoto. O escopo ativo é [MVP-9-DIAS-ISSUES-ACESSIBILIDADE.md](./MVP-9-DIAS-ISSUES-ACESSIBILIDADE.md). Resultados e limites de validação: [MVP_VALIDATION.md](./MVP_VALIDATION.md).

## Concluído nesta etapa

- **FE-00:** instalações reproduzíveis verificadas; `node_modules` e `dist` removidos do índice Git e ignorados.
- **MECH-01:** contrato de engine, identificadores estáveis, issues/comandos comuns e carregamento lazy por sistema.
- **MECH-02:** D&D v8 encapsulado pelo contrato, com migração idempotente e sem reescrever regras.
- **VA-01 (fundação):** tokens semânticos, temas claro/escuro/sistema e preferência antes do primeiro paint.
- **VA-03 (fundação):** idioma `pt-BR`, skip link, foco/título por navegação e headings principais.
- **MVP-02/FE-01/02/04 (cliente local):** IndexedDB após hidratação, commit confirmado, retry, lixeira/restauração e proteção de registros incompatíveis implementados. Migrações e formatos antigos preservados.
- **MVP-03/04/05/06/07:** biblioteca D&D como entrada padrão, criação com escolhas e rascunho explícito, Anão com sub-raças do caso mínimo, iniciativa sem duplicação, CA manual persistida, concentração encerrada a zero PV/incapacidade e cobertura de level up.
- **A11Y-01/02/03/04/05/07:** nomes de controles, títulos, anúncios textuais, foco de rotas lazy, modais com fundo inerte, teclado, ampliação persistida, contraste e redução de movimento implementados. Aprovação humana permanece pendente.
- **ME-01/ME-02:** correspondem às fundações `MECH-01/MECH-02` presentes nesta cópia. Nenhuma incorporação do commit 1.20 remoto foi presumida.
- **BE-00:** workspace Fastify, configuração validada, erros/IDs de requisição, health checks, OpenAPI e shutdown.

## Parcial

- **FE-09:** tema e tamanho de texto estão funcionais e persistidos; demais preferências futuras permanecem fora do MVP.
- **FE-12/VA-12:** testes unitários, axe/teclado e reflow 320/390/768/1280 existem; screenshots de biblioteca/criação/ficha e PDFs de fallback foram gerados. Faltam matriz humana e validação no domínio final; rotas futuras estão fora do MVP.
- **MECH-00/03:** Pilares de Atlas possui biblioteca, criação, ficha, editor e regras locais com testes. Compatibilidade com outras versões da aplicação original não foi presumida; impressão continua desabilitada no adapter. Expansão adiada.
- **MECH-04:** política e casos de legado/corrupto/futuro estão cobertos no cliente; faltam fixtures reais adicionais.
- **MECH-05/06:** schema F&M, registro de rastreabilidade e núcleo inequivocamente especificado pelo plano existem; conteúdo e fórmulas dependentes do livro não foram inferidos.
- **BE-01/02/03:** Better Auth, schema SQL, isolamento por proprietário, CRUD v1, revisão/idempotência e testes HTTP em memória existem; falta validação contra PostgreSQL real.

## Bloqueios de fonte/ambiente

- **ADIADO no MVP:** backend/sync, login, criaturas, encontros, Tabletop/VTT, novos sistemas, expansão completa de catálogo e redesign. Implementações já existentes são preservadas, sem expansão ativa.
- **PARCIAL:** validação humana com NVDA, zoom nativo e dialog de impressão, além de publicação/validação no endereço escolhido **https://cnrcgc.github.io/dnd-fichas/**. Chrome confirmado pelo usuário; dois ensaios automáticos por ficha passaram no Chrome/preview. Todas as seis páginas dos PDFs foram renderizadas e inspecionadas. Preparação de Pages em [DEPLOY.md](./DEPLOY.md); ainda sem commit/push/deploy. Não há declaração de conformidade formal WCAG.
- **RELEASE-02 — PARCIAL:** relatórios finais de 213 unitários, 152 E2E, 6 ensaios de produção, 8 de Pages e 16 de biblioteca/roteamento conferidos. A tentativa de smoke no Chrome visível foi interrompida por Computer Use ao não conseguir confirmar a URL da janela. NVDA não foi localizado nos locais e registros consultados; zoom nativo, impressão nativa, mobile real e ensaios humanos continuam pendentes. Nenhuma alteração funcional, commit/tag ou publicação na retomada.
- **ADIADO:** A11Y-06 (áudio próprio), pois a aprovação P0/P1 ainda depende das verificações humanas e do domínio final.
- **PARCIAL:** sub-raças além das duas opções de Anão não são automatizadas. O catálogo é selecionado; fichas antigas sem sub-raça não recebem bônus novos implicitamente.

- O repositório contém a interface Pilares de Atlas; não foi iniciada evolução desse sistema nesta execução.
- A interface de Feiticeiros & Maldições permanece bloqueada conforme as capabilities atuais. Nenhuma fonte de regra ausente foi inferida ou implementada para a apresentação.
- O ambiente atual não possui PostgreSQL (`psql`) nem Docker; migrations, constraints, backup e restore não foram executados.
- Hospedagem escolhida: GitHub Pages; publicação depende do commit/push autorizado e ativação de Pages. Branding, retenção e direitos visuais permanecem fora desta execução.

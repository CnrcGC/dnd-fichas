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
- **FE-12/VA-12:** testes unitários, axe/teclado e reflow 320/390/768/1280 existem; screenshots de biblioteca/criação/ficha e PDFs de fallback foram gerados. Falta matriz humana; o domínio final foi validado; rotas futuras estão fora do MVP.
- **MECH-00/03:** Pilares de Atlas possui biblioteca, criação, ficha, editor e regras locais com testes. Compatibilidade com outras versões da aplicação original não foi presumida; impressão continua desabilitada no adapter. Expansão adiada.
- **MECH-04:** política e casos de legado/corrupto/futuro estão cobertos no cliente; faltam fixtures reais adicionais.
- **MECH-05/06:** schema F&M, registro de rastreabilidade e núcleo inequivocamente especificado pelo plano existem; conteúdo e fórmulas dependentes do livro não foram inferidos.
- **BE-01/02/03:** Better Auth, schema SQL, isolamento por proprietário, CRUD v1, revisão/idempotência e testes HTTP em memória existem; falta validação contra PostgreSQL real.

## Bloqueios de fonte/ambiente

- **ADIADO no MVP:** backend/sync, login, criaturas, encontros, Tabletop/VTT, novos sistemas, expansão completa de catálogo e redesign. Implementações já existentes são preservadas, sem expansão ativa.
- **RELEASE-01:** publicada em **https://cnrcgc.github.io/dnd-fichas/**, HTTPS obrigatório, workflow aprovado e **6/6 ensaios no Chrome no domínio final**. Build corresponde à tag `mvp-rc-2026-10-12`; código em `codex/mvp-apresentacao`, hospedagem em `gh-pages`, `main` remoto preservado. Detalhes em [DEPLOY.md](./DEPLOY.md). Impressão nativa no Chrome permanece pendente; os seis layouts PDF foram renderizados e inspecionados.
- **RELEASE-02 — PARCIAL:** relatórios de 213 unitários, 152 E2E, 6 ensaios de produção, 8 de Pages, 16 de biblioteca/roteamento e 6 no domínio final aprovados. Commit, tag e push autorizados e realizados. Inspeção complementar pelo agente no navegador interno: criação e salvamento no site publicado; importação, ampliação e level up no build local. Chrome não está conectado ao controle de UI; a tentativa anterior de Computer Use foi interrompida por falta de confiança na URL. NVDA não foi localizado nos locais e registros consultados. Faltam NVDA, zoom e impressão nativos, mobile real e dois ensaios humanos; não há declaração formal de conformidade WCAG.
- **ADIADO:** A11Y-06 (áudio próprio), pois a aprovação P0/P1 ainda depende das verificações humanas.
- **PARCIAL:** sub-raças além das duas opções de Anão não são automatizadas. O catálogo é selecionado; fichas antigas sem sub-raça não recebem bônus novos implicitamente.

- O repositório contém a interface Pilares de Atlas; não foi iniciada evolução desse sistema nesta execução.
- A interface de Feiticeiros & Maldições permanece bloqueada conforme as capabilities atuais. Nenhuma fonte de regra ausente foi inferida ou implementada para a apresentação.
- O ambiente atual não possui PostgreSQL (`psql`) nem Docker; migrations, constraints, backup e restore não foram executados.
- Hospedagem: GitHub Pages, publicada e validada em 2026-10-12. Branding, retenção e direitos visuais permanecem fora desta execução.

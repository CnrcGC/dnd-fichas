# RELEASE-01 — Endereço e publicação da apresentação

**Estado atual em 2026-10-14:** [D&D Fichas](https://cnrcgc.github.io/dnd-fichas/) publicado a partir da **main**, com HTTP 200, `build_type: workflow` e HTTPS obrigatório. O proprietário autorizou commit, push e publicação; a [execução aprovada](https://github.com/CnrcGC/dnd-fichas/actions/runs/38504802668) publicou `6373fe8`. Testes remotos: 275 unitários e 11 ensaios Pages, lint e builds/budgets aprovados. No domínio HTTPS real, passaram seis ensaios completos e quatro verificações de exclusão permanente, rotas e preferências. O script público `assets/index-YYBXEh_P.js` corresponde ao build local validado. Evidências e escopo em [HOSPEDAGEM_E_LIXEIRA.md](./HOSPEDAGEM_E_LIXEIRA.md). As issues visuais seguintes continuam em espera por decisão do proprietário.

Endereço escolhido: **https://cnrcgc.github.io/dnd-fichas/**, em GitHub Pages, sem domínio pago nem backend. Navegador: **Google Chrome**. Publicação inicial em 2026-10-12 por `gh-pages`; atualização da main e mudança para GitHub Actions em 2026-10-14. Os resultados de 2026-10-12 abaixo são históricos.

O build de Pages usa `/dnd-fichas/` para assets e router. O `404.html` encaminha rotas diretas à entrada, que restaura caminho, query e hash antes de abrir a ficha. O build local padrão continua na raiz. Não há mudança de IDs, envelopes, migrations ou formatos de JSON.

## Validação local aplicada

Dentro de `dnd-fichas`:

```bash
npm run build:pages
npm run test:pages
npm run preview:pages
```

Abra **http://127.0.0.1:4174/dnd-fichas/** no Chrome para o ensaio local. Esse servidor entrega arquivos estáticos e o 404 real, sem mascarar rotas com o fallback de SPA do Vite preview. É um emulador para validação, não um backend da aplicação. Os ensaios cobrem persistência, refresh, exportação/importação, tema, impressão e o fluxo das três fichas de demonstração. A falha HTTP 404 inicial de rotas sem arquivo é seguida de redirecionamento à entrada estática com status 200.

Resultado de 2026-10-12: **8/8 testes de Pages passaram no Chrome**, incluindo os seis ensaios das fichas e os dois casos de 404/URL/legado. A entrada ficou em 400,57/425 KiB e o adapter D&D em 88,90/100 KiB. Evidências em [MVP_VALIDATION.md](./MVP_VALIDATION.md) e `output/validation/pages-final.json`. Além do ensaio local, **6/6 ensaios passaram no domínio HTTPS final**, em `output/validation/hosted-final.json`. Publicação: [execução aprovada](https://github.com/CnrcGC/dnd-fichas/actions/runs/38309889568). Os 38 arquivos públicos conferidos correspondem ao commit de hospedagem; apenas o favicon sofreu normalização de CRLF para LF pelo Git. Evidência: `output/validation/deployment.json`.

## Publicação autorizada e preservação da cópia local

O workflow `.github/workflows/pages.yml` está ativo na raiz Git. Roda por push de arquivos do frontend/workflow na main ou acionamento manual da main; valida testes/lint, builds e orçamento, executa os ensaios de Pages no Chrome e publica somente `dnd-fichas/dist-pages`. Não publica `server`, JSONs reais do usuário ou arquivos locais de backup. A fonte de Pages é **GitHub Actions**. A ativação remota exigiu completar peers opcionais do lockfile e corrigir os nomes `BlocoDescanso.jsx/css` para Linux, preservando versões e conteúdo. Os parágrafos seguintes descrevem a publicação histórica de 2026-10-12 por branch.

Em 2026-10-12 o usuário autorizou explicitamente commit, tag, push e publicação. O fetch encontrou a versão 1.20 em `main` remoto (`be9fef14cbc2c02f71a2fc78a1675cba1ef48f02`), enquanto o MVP foi implementado e validado sobre a cópia local 1.19. Para preservar ambas as versões, o código da apresentação fica em **`codex/mvp-apresentacao`**, sem reset, merge ou force push de `main`.

A publicação desta candidata usa **`gh-pages` → `/`**, contendo somente o build validado de `dist-pages`, com `.nojekyll` e `404.html`. A configuração de Pages usa publicação por branch. O workflow manual preparado permanece disponível para futura integração à branch padrão; não foi usado para substituir a versão 1.20. O commit do build `37bbf357dc939f6b250eb8b37b2c245c493d9a3a` identifica a origem `3ac1eb943d18dae5ad7fe606edfe7ada1c5feabd`, também identificada pela tag **`mvp-rc-2026-10-12`**. A tag da candidata não significa aprovação formal de WCAG nem conclusão dos testes humanos pendentes.

`npm run test:hosted` repete os seis ensaios no **Chrome**, na origem HTTPS real, em contextos limpos e somente com dados fictícios. Não inicia servidor local e não altera fichas do perfil do usuário. Além da automação, executar o roteiro de `DEMO.md` duas vezes e conferir NVDA, zoom nativo e dialog de impressão.

## Dados da apresentação

O IndexedDB pertence à origem do navegador. As fichas de `127.0.0.1` não aparecem automaticamente em `cnrcgc.github.io`. Exporte JSONs antes de mudar de origem e importe-os no perfil Chrome da apresentação. A importação cria novos IDs; mantenha os arquivos externos. Os caminhos `/dnd-fichas/` e outros projetos no mesmo domínio compartilham a origem; este projeto preserva seus nomes atuais de banco e chaves para compatibilidade.

Mantenha o build local, os três JSONs de demonstração e os PDFs como fallback. O site hospedado precisa de rede para carregar inicialmente; não foi implementado cache offline/PWA. Após carregar, os fluxos locais funcionam sem backend.

Referências: [deploy estático do Vite](https://vite.dev/guide/static-deploy.html) e [workflows de GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

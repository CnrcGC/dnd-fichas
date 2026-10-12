import { build } from "vite";
import { writeFile } from "node:fs/promises";

const base = "/dnd-fichas/";
await build({ base, build: { outDir: "dist-pages" } });
// GitHub Pages não oferece rewrite de SPA: 404 encaminha ao index com a rota
// codificada, que main.jsx restaura antes da montagem do BrowserRouter.
await writeFile("dist-pages/404.html", `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Reabrindo D&D Fichas</title></head>
<body><main><h1>Reabrindo D&D Fichas</h1><p><a href="${base}">Abrir a biblioteca</a></p></main>
<script>
  const base = ${JSON.stringify(base)};
  if (location.pathname.startsWith(base) && location.pathname !== base) {
    const route = location.pathname + location.search + location.hash;
    location.replace(base + "?__dnd_route=" + encodeURIComponent(route));
  }
</script></body></html>\n`);
await writeFile("dist-pages/.nojekyll", "");

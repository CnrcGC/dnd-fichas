// Emulador local de hospedagem estática: sem o fallback de SPA do Vite preview.
// Usado apenas na validação; a publicação entrega dist-pages ao GitHub Pages.
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { resolve, sep, extname } from "node:path";

const base = "/dnd-fichas/";
const root = resolve("dist-pages");
const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".svg": "image/svg+xml", ".png": "image/png", ".json": "application/json" };
const server = createServer(async (request, response) => {
  response.setHeader("Cache-Control", "no-store");
  if (!["GET", "HEAD"].includes(request.method)) {
    response.writeHead(405).end();
    return;
  }
  const pathname = new URL(request.url, "http://127.0.0.1:4174").pathname;
  if (pathname === base.slice(0, -1)) {
    response.writeHead(301, { Location: base }).end();
    return;
  }
  try {
    if (!pathname.startsWith(base)) throw Error("fora da base");
    const relative = decodeURIComponent(pathname.slice(base.length)) || "index.html";
    const path = resolve(root, relative);
    if (!path.startsWith(root + sep) || !(await stat(path)).isFile()) throw Error("arquivo ausente");
    const data = await readFile(path);
    response.writeHead(200, { "Content-Type": types[extname(path)] || "application/octet-stream" });
    response.end(request.method === "HEAD" ? undefined : data);
  } catch {
    const isNavigation = request.headers.accept?.includes("text/html");
    const data = isNavigation ? await readFile(resolve(root, "404.html")) : "Arquivo não encontrado.";
    response.writeHead(404, { "Content-Type": isNavigation ? "text/html; charset=utf-8" : "text/plain; charset=utf-8" });
    response.end(request.method === "HEAD" ? undefined : data);
  }
});
server.listen(4174, "127.0.0.1", () => console.log("Pages local: http://127.0.0.1:4174/dnd-fichas/"));

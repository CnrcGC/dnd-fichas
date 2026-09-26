import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "vite";

let server;
let theme;

before(async () => {
  server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: "custom" });
  theme = await server.ssrLoadModule("/src/platform/preferences/theme.js");
});
after(async () => { await server?.close(); });

function fixtures() {
  const values = new Map();
  return {
    root: { dataset: {} },
    storage: { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: (key) => values.delete(key) },
  };
}

test("FE-09 persiste claro/escuro e devolve sistema sem tema forçado", () => {
  const fixture = fixtures();
  theme.applyTheme("light", fixture);
  assert.equal(fixture.root.dataset.theme, "light");
  assert.equal(theme.readTheme(fixture), "light");
  theme.applyTheme("system", fixture);
  assert.equal(fixture.root.dataset.theme, undefined);
  assert.equal(theme.readTheme(fixture), "system");
});

test("FE-09 rejeita preferência desconhecida", () => {
  assert.throws(() => theme.applyTheme("sepia", fixtures()), /Tema inválido/);
});


import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "vite";
let server, preference;
before(async () => {
  server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: "custom" });
  preference = await server.ssrLoadModule("/src/platform/preferences/textSize.js");
});
after(async () => { await server?.close(); });
test("A11Y-02 persiste ampliação e rejeita preferência inválida", () => {
  const values = new Map();
  const fixture = { root: { dataset: {} }, storage: { getItem: (key) => values.get(key), setItem: (key, value) => values.set(key, value) } };
  preference.applyTextSize("extra-large", fixture);
  assert.equal(fixture.root.dataset.textSize, "extra-large");
  assert.equal(preference.readTextSize(fixture), "extra-large");
  assert.throws(() => preference.applyTextSize("huge", fixture), /inválido/);
});
test("A11Y-02 mantém ampliação quando storage está bloqueado", () => {
  const fixture = { root: { dataset: {} }, storage: { getItem() { throw Error("bloqueado"); }, setItem() { throw Error("bloqueado"); } } };
  assert.equal(preference.readTextSize(fixture), "normal");
  preference.applyTextSize("large", fixture);
  assert.equal(preference.readTextSize(fixture), "large");
});

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
  preference.applyTextScale(19, fixture);
  assert.equal(preference.readTextScale(fixture), 19);
});

test("escala contínua restaura tamanhos antigos e persiste valores intermediários", () => {
  const values = new Map([[preference.TEXT_SIZE_STORAGE_KEY, "large"]]);
  const styles = new Map();
  const fixture = { root: { dataset: {}, style: { setProperty: (key, value) => styles.set(key, value) } },
    storage: { getItem: (key) => values.get(key), setItem: (key, value) => values.set(key, value) } };
  assert.equal(preference.readTextScale(fixture), 20);
  preference.applyTextScale(23, fixture);
  assert.equal(preference.readTextScale(fixture), 23);
  assert.equal(styles.get("--user-text-scale"), "143.75%");
  assert.equal(fixture.root.dataset.textSize, "custom");
  preference.applyTextSize("extra-large", fixture);
  assert.equal(preference.readTextScale(fixture), 24);
  assert.throws(() => preference.applyTextScale(29, fixture), /inválido/);
  assert.throws(() => preference.applyTextScale(16.5, fixture), /inválido/);
});

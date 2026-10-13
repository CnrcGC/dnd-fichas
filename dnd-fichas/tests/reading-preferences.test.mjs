import { test } from "node:test";
import assert from "node:assert/strict";
import { applyReading, readReading, normalizeReading, DEFAULT_READING } from "../src/platform/preferences/reading.js";

function fixture() {
  const values = new Map();
  const styles = new Map();
  return { root: { dataset: {}, style: { setProperty: (key, value) => styles.set(key, value) } },
    storage: { getItem: (key) => values.get(key), setItem: (key, value) => values.set(key, value) }, values, styles };
}
test("preferências de leitura persistem e restauram dados normalizados", () => {
  const options = fixture();
  const settings = { spacing: true, highContrast: true, underlineLinks: true, lightBrightness: 83 };
  applyReading(settings, options);
  assert.deepEqual(readReading({ ...options, root: { dataset: {} } }), settings);
  assert.equal(options.root.dataset.lightDimmed, "true");
  assert.equal(options.styles.get("--light-brightness"), "83%");
  applyReading(DEFAULT_READING, options);
  assert.deepEqual(readReading(options), DEFAULT_READING);
  assert.equal(options.root.dataset.highContrast, "false");
});
test("preferências inválidas e brilho fora do intervalo são tratados", () => {
  assert.deepEqual(normalizeReading(null), DEFAULT_READING);
  assert.equal(normalizeReading({ spacing: "true", lightBrightness: 20 }).spacing, false);
  assert.equal(normalizeReading({ lightBrightness: 20 }).lightBrightness, 80);
  assert.equal(normalizeReading({ lightBrightness: Infinity }).lightBrightness, 100);
  const options = fixture();
  options.storage.getItem = () => "{corrompido";
  assert.deepEqual(readReading(options), DEFAULT_READING);
});
test("leitura continua ajustável com armazenamento bloqueado", () => {
  const options = fixture();
  options.storage = { getItem() { throw Error("bloqueado"); }, setItem() { throw Error("bloqueado"); } };
  applyReading({ ...DEFAULT_READING, spacing: true, lightBrightness: 80 }, options);
  assert.equal(readReading(options).spacing, true);
  assert.equal(readReading(options).lightBrightness, 80);
});

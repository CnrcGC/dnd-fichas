import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "vite";

let server;
let module;

before(async () => {
  server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: "custom" });
  module = await server.ssrLoadModule("/src/systems/dnd5e/engine.js");
});

after(async () => { await server?.close(); });

test("MECH-02 migra ficha legada para v8 de forma idempotente", () => {
  const legacy = { id: "dnd-1", nome: "Lyra", classeId: "mago", nivel: 3, atributos: { inteligencia: 16 } };
  const first = module.migrateDnd5eCharacter(legacy);
  const second = module.migrateDnd5eCharacter(first.data);
  assert.equal(first.ok, true);
  assert.equal(first.data.versaoFicha, 8);
  assert.deepEqual(second.data, first.data);
  assert.equal(module.dnd5eEngine.summarize(first.data).level, 3);
});

test("MECH-04 mantém versão futura em modo de falha sem alterar a entrada", () => {
  const future = { id: "future", nome: "Futuro", versaoFicha: 99 };
  const snapshot = structuredClone(future);
  const result = module.migrateDnd5eCharacter(future);
  assert.equal(result.ok, false);
  assert.equal(result.code, "future-version");
  assert.deepEqual(future, snapshot);
});


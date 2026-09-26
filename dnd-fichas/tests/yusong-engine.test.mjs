import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "vite";

let server;
let rules;
let engine;

before(async () => {
  server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: "custom" });
  rules = await server.ssrLoadModule("/src/systems/yusong/rules.js");
  engine = await server.ssrLoadModule("/src/systems/yusong/engine.js");
});

after(async () => { await server?.close(); });

test("MECH-03 congela vida, estamina, movimento, corrida e custo de talento auditados", () => {
  const derived = rules.deriveYusong({ level: 3, attributes: { health: 4, constitution: 3, agility: 5, strength: 2, size: 2 } });
  assert.equal(derived.life, 44);
  assert.equal(derived.maximumStamina, 275);
  assert.equal(derived.movement, 7);
  assert.equal(derived.run, 18);
  assert.equal(rules.yusongTalentCost(15, derived.maximumStamina), 42);
});

test("MECH-03 migra condições para mapa e preserva campos desconhecidos", () => {
  const result = engine.migrateYusongCharacter({ id: "yu-1", name: "Kai", conditions: ["caido"], houseRule: "preservar" });
  assert.equal(result.ok, true);
  assert.equal(result.data.conditions.caido, "caido");
  assert.equal(result.data.legacyExtensions.houseRule, "preservar");
  assert.deepEqual(engine.migrateYusongCharacter(result.data).data, result.data);
});


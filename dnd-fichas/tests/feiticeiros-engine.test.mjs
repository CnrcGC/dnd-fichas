import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "vite";

let server;
let rules;
let engine;
let traceability;

before(async () => {
  server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: "custom" });
  rules = await server.ssrLoadModule("/src/systems/feiticeiros/rules.js");
  engine = await server.ssrLoadModule("/src/systems/feiticeiros/engine.js");
  traceability = await server.ssrLoadModule("/src/systems/feiticeiros/traceability.js");
});

after(async () => { await server?.close(); });

test("FM-MOD-01 usa piso também abaixo de 10", () => {
  assert.equal(rules.attributeModifier(15), 2);
  assert.equal(rules.attributeModifier(10), 0);
  assert.equal(rules.attributeModifier(9), -1);
  assert.equal(rules.attributeModifier(7), -2);
});

test("FM-CREATE-01 usa RNG injetado para 4d6 descartando o menor", () => {
  const values = [0, 0.2, 0.5, 0.999];
  const result = rules.rollFourDropLowest(() => values.shift());
  assert.deepEqual(result.rolls, [1, 2, 4, 6]);
  assert.equal(result.discarded, 1);
  assert.equal(result.total, 12);
  assert.throws(() => rules.pointBuyCost(12), (error) => error.code === "rule-source-unavailable");
});

test("FM-LEVEL-01 cobre limites de bônus de treino e dado desarmado", () => {
  assert.deepEqual([1, 5, 9, 13, 17, 20].map(rules.trainingBonus), [2, 3, 4, 5, 6, 6]);
  assert.deepEqual([1, 5, 9, 13, 17, 20].map(rules.unarmedDie), ["1d4", "1d6", "1d8", "1d10", "1d12", "1d12"]);
});

test("FM-XP-01 cobre todos os limiares publicados no plano", () => {
  rules.XP_THRESHOLDS.forEach((threshold, index) => assert.equal(rules.levelForExperience(threshold), index + 1));
  assert.equal(rules.levelForExperience(999), 1);
  assert.equal(rules.levelForExperience(999999), 20);
});

test("FM-DERIVED-01 expõe totais com parcelas e IDs de regra", () => {
  const character = engine.createFeiticeirosCharacter({ displayName: "Aya", id: "fm-1" });
  character.progression.level = 5;
  character.attributes.destreza = 14;
  character.skills.percepcao = { bonus: 3 };
  const derived = engine.feiticeirosEngine.deriveCharacter(character);
  assert.equal(derived.attention.total, 13);
  assert.equal(derived.defense.total, 14);
  assert.equal(derived.movement.total, 9);
  assert.equal(derived.trainingBonus.total, 3);
  assert.equal(derived.defense.ruleId, "FM-DERIVED-01");
  assert.ok(derived.defense.parts.length >= 3);
});

test("MECH-05 mantém registro F&M único e editionado", () => {
  assert.equal(traceability.validateRuleRegistry(), true);
  assert.equal(new Set(traceability.FM_RULES.map(({ ruleId }) => ruleId)).size, traceability.FM_RULES.length);
  assert.ok(traceability.FM_RULES.every(({ edition }) => edition === "2.5.2"));
});


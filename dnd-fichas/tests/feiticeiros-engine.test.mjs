import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "vite";

let server;
let rules;
let engine;
let traceability;
let specializations;

before(async () => {
  server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: "custom" });
  rules = await server.ssrLoadModule("/src/systems/feiticeiros/rules.js");
  engine = await server.ssrLoadModule("/src/systems/feiticeiros/engine.js");
  traceability = await server.ssrLoadModule("/src/systems/feiticeiros/traceability.js");
  specializations = await server.ssrLoadModule("/src/systems/feiticeiros/specializations.js");
});

after(async () => { await server?.close(); });

test("FM-MOD-01 usa piso também abaixo de 10", () => {
  assert.equal(rules.attributeModifier(15), 2);
  assert.equal(rules.attributeModifier(10), 0);
  assert.equal(rules.attributeModifier(9), -1);
  assert.equal(rules.attributeModifier(7), -2);
});

test("FM-CREATE-01-roll usa RNG injetado para 4d6 descartando o menor", () => {
  const values = [0, 0.2, 0.5, 0.999];
  const result = rules.rollFourDropLowest(() => values.shift());
  assert.deepEqual(result.rolls, [1, 2, 4, 6]);
  assert.equal(result.discarded, 1);
  assert.equal(result.total, 12);
});

test("FM-CREATE-01-fixed aceita somente uma distribuição exata dos seis valores fixos", () => {
  assert.equal(rules.validateFixedAttributeAssignment({
    forca: 8, destreza: 15, constituicao: 13, inteligencia: 10, sabedoria: 14, presenca: 12,
  }), true);
  assert.equal(rules.validateFixedAttributeAssignment({
    forca: 15, destreza: 15, constituicao: 13, inteligencia: 10, sabedoria: 8, presenca: 8,
  }), false);
});

test("FM-CREATE-01-point-buy reproduz custos, créditos e orçamento da página 18", () => {
  assert.deepEqual([8, 9, 10, 11, 12, 13, 14, 15].map(rules.pointBuyCost), [-2, -1, 0, 2, 3, 4, 5, 7]);
  const ledger = rules.calculatePointBuyLedger({
    forca: 15, destreza: 14, constituicao: 13, inteligencia: 12, sabedoria: 10, presenca: 8,
  });
  assert.equal(ledger.budget, 17);
  assert.equal(ledger.costsPaid, 19);
  assert.equal(ledger.creditsEarned, 2);
  assert.equal(ledger.netSpent, 17);
  assert.equal(ledger.remaining, 0);
  assert.equal(ledger.valid, true);
  assert.equal(ledger.ruleId, "FM-CREATE-01");
  const overspent = rules.calculatePointBuyLedger({
    forca: 15, destreza: 15, constituicao: 15, inteligencia: 15, sabedoria: 15, presenca: 15,
  });
  assert.equal(overspent.netSpent, 42);
  assert.equal(overspent.remaining, -25);
  assert.equal(overspent.valid, false);
  assert.throws(() => rules.pointBuyCost(7), (error) => error.code === "point-buy-score-out-of-range" && error.ruleId === "FM-CREATE-01");
  assert.throws(() => rules.calculatePointBuyLedger({}), (error) => error.code === "point-buy-score-out-of-range");
});

test("FM-CREATE-01-roll gera seis valores rastreáveis na ordem dos atributos", () => {
  const result = rules.rollAttributeSet(() => 0.5);
  assert.deepEqual(result.rolls.map(({ attribute }) => attribute), rules.FM_ATTRIBUTES);
  assert.deepEqual(Object.values(result.values), [12, 12, 12, 12, 12, 12]);
  assert.ok(result.rolls.every(({ rolls, discarded, total, ruleId }) => rolls.length === 4 && discarded === 4 && total === 12 && ruleId === "FM-CREATE-01"));
});

test("FM-ATTR-01-caps valida limites comum e excepcional sem arredondar", () => {
  assert.equal(rules.validateAttributeScore(0), true);
  assert.equal(rules.validateAttributeScore(20), true);
  assert.equal(rules.validateAttributeScore(21), false);
  assert.equal(rules.validateAttributeScore(30, { exceptional: true }), true);
  assert.equal(rules.validateAttributeScore(31, { exceptional: true }), false);
  assert.equal(rules.validateAttributeScore(12.5), false);
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

test("FM-SPEC-01-core-metadata registra as seis Especializações editionadas e revisadas", () => {
  assert.equal(specializations.validateSpecializationCatalog(), true);
  assert.deepEqual(specializations.FM_SPECIALIZATIONS.map(({ id }) => id), [
    "lutador", "especialista-combate", "especialista-tecnica", "controlador", "suporte", "restringido",
  ]);
  assert.deepEqual(specializations.FM_SPECIALIZATIONS.map(({ hitPoints }) => hitPoints.firstLevelBase), [12, 12, 10, 10, 10, 16]);
  assert.deepEqual(specializations.FM_SPECIALIZATIONS.map(({ hitPoints }) => hitPoints.hitDie), ["1d10", "1d10", "1d8", "1d8", "1d8", "1d12"]);
  assert.deepEqual(specializations.FM_SPECIALIZATIONS.map(({ hitPoints }) => hitPoints.subsequentFixed), [6, 6, 5, 5, 5, 7]);
  assert.deepEqual(specializations.FM_SPECIALIZATIONS.map(({ resource }) => [resource.kind, resource.perLevel]), [
    ["pe", 4], ["pe", 4], ["pe", 6], ["pe", 5], ["pe", 5], ["stamina", 4],
  ]);
  assert.ok(specializations.FM_SPECIALIZATIONS.every(({ source, training, baseAbility }) => source.review.reviewer && training.effectClassification === "display-only" && baseAbility.effectClassification === "display-only"));
  assert.ok(Object.isFrozen(specializations.FM_SPECIALIZATIONS[0].source.pages));
  assert.ok(Object.isFrozen(specializations.FM_SPECIALIZATIONS[0].multiclass.requirements[0].anyOf));
});

test("FM-SPEC-01-level-one cria um esqueleto válido para cada Especialização", () => {
  for (const entry of specializations.FM_SPECIALIZATIONS) {
    const skeleton = specializations.createSpecializationLevelOneSkeleton(entry.id, entry.keyAttributes[0]);
    assert.deepEqual(skeleton.baseAbilityIds, [entry.baseAbility.id]);
    assert.equal(skeleton.level, 1);
    assert.equal(skeleton.rulesEdition, "2.5.2");
  }
  assert.throws(
    () => specializations.createSpecializationLevelOneSkeleton("lutador", "inteligencia"),
    (error) => error.code === "specialization.invalid-key-attribute" && error.ruleId === "FM-SPEC-01",
  );
});

test("FM-MULTI-01-entry valida requisitos e proibição do Restringido", () => {
  assert.equal(specializations.checkSpecializationMulticlassEntry("lutador", { forca: 16 }).ok, true);
  assert.equal(specializations.checkSpecializationMulticlassEntry("lutador", { forca: 15, destreza: 15 }).code, "multiclass.attribute-requirement");
  assert.equal(specializations.checkSpecializationMulticlassEntry("especialista-tecnica", { sabedoria: 16 }).ok, true);
  assert.equal(specializations.checkSpecializationMulticlassEntry("controlador", { presenca: 16 }).ok, true);
  assert.equal(specializations.checkSpecializationMulticlassEntry("suporte", { sabedoria: 16 }).ok, true);
  assert.equal(specializations.checkSpecializationMulticlassEntry("restringido", { forca: 30 }).code, "multiclass.restringido-prohibited");
  assert.equal(specializations.checkSpecializationMulticlassEntry("lutador", { forca: 20 }, ["restringido"]).code, "multiclass.restringido-prohibited");
});


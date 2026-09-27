import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";

const fixtureUrl = new URL("./fixtures/yusong/legacy-character-v0.json", import.meta.url);

let server;
let rules;
let engine;
let legacyFixture;

before(async () => {
  server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: "custom" });
  rules = await server.ssrLoadModule("/src/systems/yusong/rules.js");
  engine = await server.ssrLoadModule("/src/systems/yusong/engine.js");
  legacyFixture = JSON.parse(await readFile(fileURLToPath(fixtureUrl), "utf8"));
});

after(async () => { await server?.close(); });

test("MECH-03A congela os nove atributos reais do projeto Yusong", () => {
  assert.deepEqual([...rules.YUSONG_ATTRIBUTES], [
    "strength", "agility", "constitution", "size", "power",
    "intelligence", "charisma", "reaction", "health",
  ]);
});

test("MECH-03A congela vida, estamina, movimento, corrida e custo percentual", () => {
  assert.equal(rules.calculateLife(4, 3), 44);
  assert.equal(rules.calculateStamina(3, 4), 275);
  assert.equal(rules.calculateMovement(5, 2), 7);
  assert.equal(rules.calculateMovement(1, 12), 1);
  assert.equal(rules.calculateRun(7), 18);
  assert.equal(rules.yusongTalentCost(15, 275), 42);
});

test("MECH-03A congela toda a tabela de RD", () => {
  const cases = [[1, 0], [4, 0], [5, 2], [6, 2], [7, 4], [9, 4], [10, 6], [11, 6], [12, 8], [20, 8]];
  for (const [size, expected] of cases) assert.equal(rules.calculateRD(size), expected);
});

test("MECH-03A congela média, dados de reação e as duas reações", () => {
  const expected = ["1d4", "1d6", "1d8", "1d10", "1d12", "2d8", "1d20", "2d20", "2d20+2", "2d20+4", "2d20+6", "2d20+9"];
  expected.forEach((dice, index) => assert.equal(rules.getReactionDice(index + 1), dice));
  assert.equal(rules.getReactionDice(99), "1d4");
  assert.equal(rules.calculateAverage(4, 5), 4);
  assert.equal(rules.calculateDodge(5, 5), "1d12");
  assert.equal(rules.calculateCounterAttack(5, 6), "1d12");
});

test("MECH-03A congela armadura vital, pool e armadura dos membros", () => {
  assert.deepEqual(
    Array.from({ length: 12 }, (_, index) => rules.getVitalArmorByValue(index + 1)),
    [20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75],
  );
  const pools = [
    ["1d4", "1d6", "1d8", "1d10"], ["1d4", "1d6", "1d10", "1d10"],
    ["1d6", "1d10", "1d10", "1d12"], ["1d8", "1d10", "1d10", "1d12"],
    ["1d10", "1d12", "1d12", "1d12"], ["1d12", "1d12", "1d12", "2d8"],
    ["1d12", "1d12", "2d8", "1d20"], ["1d12", "2d8", "2d8", "1d20"],
    ["2d8", "2d8", "2d8", "1d20"], ["2d8", "2d8", "1d20", "1d20"],
    ["2d8", "1d20", "1d20", "1d20+8"], ["1d20", "1d20", "2d20", "2d20"],
  ];
  pools.forEach((pool, index) => assert.deepEqual(rules.calculateMemberDicePool(index + 1, index + 1), pool));
  assert.equal(rules.calculateVitalArmor(3, 4), 30);
  assert.equal(rules.calculateMemberArmor("1d20+8"), 56);
  assert.equal(rules.clampArmor(-1, 20), 0);
  assert.equal(rules.clampArmor(25, 20), 20);
  assert.equal(rules.getBodyPartState(0), "Inutilizado");
  assert.equal(rules.getBodyPartState(1), "Normal");
});

test("MECH-03A deriva recursos, reações e sete partes sem escrever no personagem", () => {
  const migrated = engine.migrateYusongCharacter(legacyFixture).data;
  const snapshot = structuredClone(migrated);
  const derived = rules.deriveYusong(migrated);
  assert.deepEqual(derived.resources, { maximumLife: 44, maximumStamina: 275, rd: 0, movement: 7, run: 18 });
  assert.deepEqual(derived.reactions, { dodge: "1d12", counterAttack: "1d12" });
  assert.equal(derived.body.length, 7);
  assert.deepEqual(derived.body.slice(0, 3).map((part) => part.maximumArmor), [30, 30, 30]);
  assert.deepEqual(derived.body.slice(3).map((part) => part.dice), ["1d6", "1d10", "1d10", "1d12"]);
  assert.deepEqual(derived.body.slice(3).map((part) => part.maximumArmor), [12, 20, 20, 24]);
  assert.equal(derived.body[2].state, "Inutilizado");
  assert.deepEqual(migrated, snapshot);
});

test("MECH-03A preserva a escolha de redistribuição dos dados entre membros", () => {
  const migrated = engine.migrateYusongCharacter(legacyFixture).data;
  const rightArm = migrated.body.find((part) => part.id === "rightArm");
  const leftLeg = migrated.body.find((part) => part.id === "leftLeg");
  [rightArm.dice, leftLeg.dice] = [leftLeg.dice, rightArm.dice];
  assert.deepEqual(
    rules.deriveYusong(migrated).body.slice(3).map((part) => part.dice),
    ["1d12", "1d10", "1d10", "1d6"],
  );
});

test("MECH-03A preserva parser composto, modificadores de condição e piso de dano", () => {
  assert.equal(rules.getConditionRollModifier({ amedrontado: true, motivado: true, caido: true }), 0);
  assert.equal(rules.buildYusongDiceNotation("1d6+1d4", { desesperado: true }), "1d6+1d4-10");
  const sequence = [0, 0.5];
  const result = rules.rollYusongDice({
    notation: "1d6+1d4",
    label: "Teste",
    conditions: { motivado: true },
    random: () => sequence.shift(),
  });
  assert.equal(result.total, 8);
  assert.deepEqual(result.rolls.map(({ sides, value }) => ({ sides, value })), [{ sides: 6, value: 1 }, { sides: 4, value: 3 }]);
  assert.equal(rules.rollYusongDice({ notation: "1d4", label: "Dano físico", conditions: { desesperado: true }, random: () => 0 }).total, 0);
});

test("MECH-03A congela os invariantes do distribuidor aleatório com RNG injetado", () => {
  let index = 0;
  const cycle = (length) => () => ((index++ % length) + 0.1) / length;
  const attributes = rules.distributeYusongPoints(rules.YUSONG_ATTRIBUTES, 18, 1, 7, cycle(rules.YUSONG_ATTRIBUTES.length));
  assert.equal(Object.values(attributes).reduce((sum, value) => sum + value, 0), 27);
  assert.ok(Object.values(attributes).every((value) => value >= 1 && value <= 7));
  index = 0;
  const skills = rules.distributeYusongPoints(rules.YUSONG_SKILL_IDS, 8, 0, 3, cycle(rules.YUSONG_SKILL_IDS.length));
  assert.equal(Object.values(skills).reduce((sum, value) => sum + value, 0), 8);
  assert.ok(Object.values(skills).every((value) => value >= 0 && value <= 3));
});

test("MECH-03A migra fixture realista v0 sem perder texto, seleções ou extensões", () => {
  const result = engine.migrateYusongCharacter(legacyFixture);
  assert.equal(result.ok, true);
  assert.equal(result.data.identity.displayName, "Kang Ji-ho");
  assert.equal(result.data.identity.level, 3);
  assert.deepEqual(result.data.selections, {
    school: "seirin", type: "prodigio", characterClass: "agil",
    origin: "Lutador Profissional", martialArt: "Boxe",
  });
  assert.deepEqual(result.data.resources, { currentLife: 35, currentStamina: 200 });
  assert.deepEqual(result.data.body.slice(0, 3).map((part) => part.currentArmor), [30, 30, 0]);
  assert.deepEqual(result.data.conditions, { amedrontado: true, caido: false });
  assert.equal(result.data.genius.abilities[0].description, "Texto personalizado");
  assert.equal(result.data.inventory[0].customText, "Presente");
  assert.deepEqual(result.data.legacyExtensions.houseRule, { name: "Regra da mesa", enabled: true });
  assert.deepEqual(result.data.legacyExtensions.attributeExtensions, { customAura: 9 });
  assert.equal(result.data.legacyExtensions.derivedSnapshot.resources.maxLife, 44);
  assert.equal(result.data.legacyExtensions.recordMetadata.createdAt, "2026-01-10T10:00:00.000Z");
  assert.equal(engine.validateYusongCharacter(result.data), true);
});

test("MECH-03A mantém a migração idempotente e rejeita versões futuras", () => {
  const first = engine.migrateYusongCharacter(legacyFixture);
  const second = engine.migrateYusongCharacter(first.data);
  assert.equal(second.ok, true);
  assert.deepEqual(second.data, first.data);
  assert.deepEqual(second.provenance.migrations, []);
  assert.deepEqual(engine.migrateYusongCharacter({ schemaVersion: 2 }), {
    ok: false,
    code: "future-version",
    sourceVersion: 2,
    input: { schemaVersion: 2 },
  });
});

test("MECH-03A cria schema v1 completo e reporta problemas estruturais", () => {
  const created = engine.createYusongCharacter({ id: "yu-new", displayName: "Novo" });
  assert.equal(engine.validateYusongCharacter(created), true);
  assert.equal(created.body.length, 7);
  assert.deepEqual(created.genius, { name: "", abilities: [] });
  assert.deepEqual(created.conditions, {});
  assert.deepEqual(engine.yusongEngine.summarize(created), { displayName: "Novo", level: 1, school: null });
  const invalid = structuredClone(created);
  delete invalid.attributes.reaction;
  assert.equal(engine.validateYusongCharacter(invalid), false);
  assert.ok(engine.listYusongValidationIssues(invalid).some((issue) => issue.code === "attribute.invalid"));
});

test("MECH-03B edita recursos com piso inteiro e limite derivado", () => {
  const original = engine.createYusongCharacter({ id: "resource", displayName: "Recurso" });
  assert.deepEqual(original.body.slice(3).map((part) => part.currentArmor), [8, 12, 16, 20]);
  const life = engine.yusongEngine.commands.setResource(original, { resource: "currentLife", value: 99.8 });
  assert.equal(life.character.resources.currentLife, 12);
  assert.equal(original.resources.currentLife, 12);
  const stamina = engine.yusongEngine.commands.setResource(original, { resource: "currentStamina", value: -2 });
  assert.equal(stamina.character.resources.currentStamina, 0);
  assert.equal(stamina.events[0].type, "resource.changed");
  assert.throws(
    () => engine.yusongEngine.commands.setResource(original, { resource: "energia", value: 1 }),
    (error) => error.name === "YusongCommandError" && error.code === "resource.unknown",
  );
});

test("MECH-03B reproduz inicialização e clamp do efeito legado durante a migração", () => {
  const firstEffect = engine.migrateYusongCharacter({
    id: "legacy-zero-max",
    name: "Primeiro efeito",
    attributes: { health: 4, constitution: 3, strength: 2, agility: 5, size: 2, power: 1, intelligence: 1, charisma: 1, reaction: 1 },
    resources: { currentLife: 0, maxLife: 0, currentStamina: 0, maxStamina: 0 },
    body: rules.YUSONG_BODY_PARTS.map((part) => ({ ...part, currentArmor: 0, maxArmor: 0 })),
  });
  assert.deepEqual(firstEffect.data.resources, { currentLife: 36, currentStamina: 275 });
  const derived = rules.deriveYusong(firstEffect.data);
  assert.deepEqual(firstEffect.data.body.map((part) => part.currentArmor), derived.body.map((part) => part.maximumArmor));

  const overMaximum = structuredClone(legacyFixture);
  overMaximum.resources.currentLife = 999;
  overMaximum.resources.currentStamina = 999;
  const clamped = engine.migrateYusongCharacter(overMaximum);
  assert.deepEqual(clamped.data.resources, { currentLife: 44, currentStamina: 275 });
});

test("MECH-03B preserva valores correntes ao aumentar máximos", () => {
  const original = engine.createYusongCharacter({ id: "increase", displayName: "Aumento" });
  original.resources.currentLife = 5;
  original.resources.currentStamina = 80;
  const result = engine.yusongEngine.commands.setAttribute(original, { attribute: "health", value: 4 });
  assert.equal(rules.deriveYusong(result.character).resources.maximumLife, 36);
  assert.equal(rules.deriveYusong(result.character).resources.maximumStamina, 225);
  assert.deepEqual(result.character.resources, { currentLife: 5, currentStamina: 80 });
});

test("MECH-03B limita recursos e armaduras quando um máximo diminui", () => {
  const original = engine.createYusongCharacter({ id: "decrease", displayName: "Redução" });
  original.identity.level = 10;
  original.attributes.health = 8;
  original.attributes.constitution = 8;
  original.attributes.strength = 12;
  original.attributes.agility = 12;
  original.resources = { currentLife: 90, currentStamina: 500 };
  original.body = rules.deriveYusong(original).body.map((part) => ({ id: part.id, currentArmor: part.maximumArmor, ...(part.type === "member" ? { dice: part.dice } : {}) }));

  const healthReduced = engine.yusongEngine.commands.setAttribute(original, { attribute: "health", value: 1 });
  assert.deepEqual(healthReduced.character.resources, { currentLife: 48, currentStamina: 325 });
  assert.deepEqual(healthReduced.character.body.slice(0, 3).map((part) => part.currentArmor), [35, 35, 35]);
  assert.deepEqual(healthReduced.character.body.slice(3).map((part) => part.dice), ["1d20", "1d20", "2d20", "2d20"]);
  assert.deepEqual(original.resources, { currentLife: 90, currentStamina: 500 });

  const levelReduced = engine.yusongEngine.commands.setLevel(healthReduced.character, { level: 1 });
  assert.equal(levelReduced.character.resources.currentLife, 12);
  assert.ok(levelReduced.events.some((event) => event.type === "level.changed"));
});

test("MECH-03B altera armadura dentro dos limites sem mutar a entrada", () => {
  const original = engine.createYusongCharacter({ id: "armor", displayName: "Armadura" });
  const damaged = engine.yusongEngine.commands.changeBodyArmor(original, { partId: "head", amount: -50 });
  assert.equal(damaged.character.body.find((part) => part.id === "head").currentArmor, 0);
  assert.equal(original.body.find((part) => part.id === "head").currentArmor, 20);
  const restored = engine.yusongEngine.commands.setBodyArmor(damaged.character, { partId: "head", value: 999 });
  assert.equal(restored.character.body.find((part) => part.id === "head").currentArmor, 20);
  assert.throws(
    () => engine.yusongEngine.commands.setBodyArmor(original, { partId: "tail", value: 1 }),
    (error) => error.code === "body.part-unknown",
  );
});

test("MECH-03B redistribui dados e recalcula o limite da armadura dos membros", () => {
  const original = engine.createYusongCharacter({ id: "dice-swap", displayName: "Dados" });
  const rightArmBefore = original.body.find((part) => part.id === "rightArm");
  rightArmBefore.currentArmor = 99;
  const result = engine.yusongEngine.commands.swapMemberDice(original, { partId: "rightArm", dice: "1d10" });
  const rightArm = result.character.body.find((part) => part.id === "rightArm");
  const leftLeg = result.character.body.find((part) => part.id === "leftLeg");
  assert.equal(rightArm.dice, "1d10");
  assert.equal(rightArm.currentArmor, 20);
  assert.equal(leftLeg.dice, "1d4");
  assert.equal(result.events[0].type, "body.dice-swapped");
  assert.throws(
    () => engine.yusongEngine.commands.swapMemberDice(original, { partId: "head", dice: "1d10" }),
    (error) => error.code === "body.member-required",
  );
});

test("MECH-03B alterna condições e preserva o registro original", () => {
  const original = engine.createYusongCharacter({ id: "condition", displayName: "Condição" });
  const active = engine.yusongEngine.commands.toggleCondition(original, { conditionId: "motivado" });
  assert.equal(active.character.conditions.motivado, true);
  assert.deepEqual(original.conditions, {});
  const inactive = engine.yusongEngine.commands.toggleCondition(active.character, { conditionId: "motivado" });
  assert.equal(inactive.character.conditions.motivado, false);
});

test("MECH-03B aplica custos de Talento e Genius com falha recuperável", () => {
  const original = engine.createYusongCharacter({ id: "costs", displayName: "Custos" });
  original.talents = [{ id: "talent-10", staminaCostPercent: 10 }];
  original.genius.abilities = [
    { id: "ability-5", staminaCost: 5 },
    { id: "ability-passive", staminaCost: 0 },
  ];
  const talent = engine.yusongEngine.commands.useTalent(original, { talentId: "talent-10" });
  assert.equal(talent.character.resources.currentStamina, 135);
  const genius = engine.yusongEngine.commands.useGenius(talent.character);
  assert.equal(genius.character.resources.currentStamina, 125);
  const ability = engine.yusongEngine.commands.useGeniusAbility(genius.character, { abilityId: "ability-5" });
  assert.equal(ability.character.resources.currentStamina, 120);
  const passive = engine.yusongEngine.commands.useGeniusAbility(ability.character, { abilityId: "ability-passive" });
  assert.equal(passive.character.resources.currentStamina, 120);
  assert.equal(passive.warnings[0].code, "genius.no-stamina-cost");

  const exhausted = structuredClone(original);
  exhausted.resources.currentStamina = 1;
  const insufficient = engine.yusongEngine.commands.useTalent(exhausted, { talentId: "talent-10" });
  assert.equal(insufficient.character.resources.currentStamina, 1);
  assert.equal(insufficient.events.length, 0);
  assert.equal(insufficient.warnings[0].code, "stamina.insufficient");
});

test("MECH-03B valida recursos e partes necessários aos comandos", () => {
  const invalid = engine.createYusongCharacter({ id: "invalid-command-state", displayName: "Inválido" });
  invalid.resources.currentLife = "não numérico";
  invalid.body.push({ id: "head", currentArmor: 20 });
  const codes = engine.listYusongValidationIssues(invalid).map((issue) => issue.code);
  assert.ok(codes.includes("resource.invalid"));
  assert.ok(codes.includes("body.invalid") || codes.includes("body.part-invalid"));
  assert.equal(engine.validateYusongCharacter(invalid), false);
});

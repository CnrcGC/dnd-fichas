import {
  ISSUE_LEVELS,
  SYSTEM_IDS,
  assertSystemEngine,
  validationIssue,
} from "../../shared/rules/engineContract";
import { defineMigration, defineMigrationChain, runMigrationChain } from "../../shared/rules/migrations";
import {
  YUSONG_ATTRIBUTES,
  YUSONG_BODY_PARTS,
  buildYusongDiceNotation,
  calculateMemberArmor,
  deriveYusong,
  distributeYusongPoints,
  rollYusongDice,
} from "./rules";
import { yusongCommands } from "./commands";

export const YUSONG_SCHEMA_VERSION = 1;
export const YUSONG_MIGRATIONS = defineMigrationChain(YUSONG_SCHEMA_VERSION, [
  defineMigration({ id: "yusong:legacy-to-v1", fromVersion: 0, toVersion: 1, migrate: migrateYusongLegacyToV1 }),
]);

const knownLegacyKeys = new Set([
  "id", "schemaVersion", "identity", "name", "nome", "level", "nivel",
  "attributes", "atributos", "resources", "reactions", "body", "talents",
  "genius", "skills", "inventory", "conditions", "notes", "selections",
  "school", "origin", "class", "art", "type", "createdAt", "updatedAt",
  "legacyExtensions",
]);

const clone = (value) => structuredClone(value);
const finiteNumber = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;

function normalizeConditions(conditions) {
  if (!conditions) return {};
  if (!Array.isArray(conditions) && typeof conditions === "object") {
    return Object.fromEntries(Object.entries(conditions).map(([id, active]) => [id, Boolean(active)]));
  }
  if (!Array.isArray(conditions)) return {};
  return Object.fromEntries(conditions.flatMap((condition) => {
    if (typeof condition === "string") return [[condition, true]];
    if (condition && typeof condition === "object" && condition.id) {
      return [[String(condition.id), condition.active === undefined ? true : Boolean(condition.active)]];
    }
    return [];
  }));
}

function defaultCurrentBody() {
  const initialMemberDice = ["1d4", "1d6", "1d8", "1d10"];
  let memberIndex = 0;
  return YUSONG_BODY_PARTS.map((part) => ({
    id: part.id,
    currentArmor: part.type === "member" ? calculateMemberArmor(initialMemberDice[memberIndex]) : part.initialArmor,
    ...(part.type === "member" ? { dice: initialMemberDice[memberIndex++] } : {}),
  }));
}

export function createYusongCharacter({ displayName = "Sem nome", id = crypto.randomUUID() } = {}) {
  return {
    id,
    schemaVersion: YUSONG_SCHEMA_VERSION,
    identity: {
      displayName,
      level: 1,
      age: "",
      height: "",
      concept: "",
      image: "",
    },
    selections: {
      school: "",
      type: "",
      characterClass: "",
      origin: "",
      martialArt: "",
    },
    attributes: Object.fromEntries(YUSONG_ATTRIBUTES.map((key) => [key, 1])),
    resources: { currentLife: 12, currentStamina: 150 },
    reactions: {},
    body: defaultCurrentBody(),
    talents: [],
    genius: { name: "", abilities: [] },
    inventory: [],
    skills: {},
    conditions: {},
    notes: "",
    legacyExtensions: {},
  };
}

function migrateLegacyBody(body) {
  if (!Array.isArray(body)) return defaultCurrentBody();
  return YUSONG_BODY_PARTS.map((part) => {
    const legacy = body.find((candidate) => candidate?.id === part.id);
    return {
      id: part.id,
      currentArmor: finiteNumber(legacy?.currentArmor, finiteNumber(legacy?.armor, part.initialArmor)),
      ...(part.type === "member" && legacy?.dice ? { dice: String(legacy.dice) } : {}),
    };
  });
}

export function migrateYusongCharacter(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { ok: false, code: "invalid-legacy-record", input };
  }
  const sourceVersion = Number(input.schemaVersion) || 0;
  const migration = runMigrationChain(input, sourceVersion, YUSONG_MIGRATIONS, { validate: validateYusongCharacter });
  if (!migration.ok) return migration;
  return {
    ok: true,
    data: migration.data,
    schemaVersion: migration.schemaVersion,
    provenance: {
      source: sourceVersion === 0 ? "yusong.characters" : "platform",
      sourceVersion,
      migrations: migration.migrationIds,
    },
    warnings: [],
  };
}

function migrateYusongLegacyToV1(input) {
  const legacyIdentity = input.identity && typeof input.identity === "object" ? input.identity : {};
  const displayName = legacyIdentity.name ?? legacyIdentity.displayName ?? input.name ?? input.nome ?? "Sem nome";
  const defaults = createYusongCharacter({ displayName, id: input.id });
  const legacyAttributes = input.attributes ?? input.atributos ?? {};
  const attributes = Object.fromEntries(YUSONG_ATTRIBUTES.map((key) => [
    key,
    finiteNumber(legacyAttributes[key], defaults.attributes[key]),
  ]));
  const resources = input.resources && typeof input.resources === "object" ? input.resources : {};
  const unknownTopLevel = Object.fromEntries(Object.entries(input).filter(([key]) => !knownLegacyKeys.has(key)));
  const attributeExtensions = Object.fromEntries(Object.entries(legacyAttributes).filter(([key]) => !YUSONG_ATTRIBUTES.includes(key)));
  const derivedSnapshot = {
    resources: clone(resources),
    reactions: clone(input.reactions ?? {}),
    body: clone(Array.isArray(input.body) ? input.body : []),
  };

  const data = {
    ...defaults,
    identity: {
      displayName: String(displayName),
      level: Math.min(20, Math.max(1, finiteNumber(legacyIdentity.level ?? input.level ?? input.nivel, 1))),
      age: String(legacyIdentity.age ?? ""),
      height: String(legacyIdentity.height ?? ""),
      concept: String(legacyIdentity.concept ?? ""),
      image: String(legacyIdentity.image ?? ""),
    },
    selections: {
      school: legacyIdentity.school ?? input.selections?.school ?? input.school ?? "",
      type: legacyIdentity.type ?? input.selections?.type ?? input.type ?? "",
      characterClass: legacyIdentity.characterClass ?? input.selections?.characterClass ?? input.selections?.class ?? input.class ?? "",
      origin: legacyIdentity.origin ?? input.selections?.origin ?? input.origin ?? "",
      martialArt: legacyIdentity.martialArt ?? input.selections?.martialArt ?? input.selections?.art ?? input.art ?? "",
    },
    attributes,
    resources: {
      currentLife: finiteNumber(resources.currentLife, defaults.resources.currentLife),
      currentStamina: finiteNumber(resources.currentStamina, defaults.resources.currentStamina),
    },
    reactions: {},
    body: migrateLegacyBody(input.body),
    talents: Array.isArray(input.talents) ? clone(input.talents) : [],
    genius: {
      name: String(input.genius?.name ?? ""),
      abilities: Array.isArray(input.genius?.abilities) ? clone(input.genius.abilities) : [],
    },
    skills: input.skills && typeof input.skills === "object" && !Array.isArray(input.skills) ? clone(input.skills) : {},
    inventory: Array.isArray(input.inventory) ? clone(input.inventory) : [],
    conditions: normalizeConditions(input.conditions),
    notes: String(input.notes ?? ""),
    legacyExtensions: {
      ...(input.legacyExtensions && typeof input.legacyExtensions === "object" ? clone(input.legacyExtensions) : {}),
      ...unknownTopLevel,
      ...(Object.keys(attributeExtensions).length ? { attributeExtensions } : {}),
      derivedSnapshot,
      recordMetadata: { createdAt: input.createdAt ?? null, updatedAt: input.updatedAt ?? null },
    },
  };
  reconcileLegacyCurrentValues(data, input, resources);
  return data;
}

function reconcileLegacyCurrentValues(data, input, legacyResources) {
  const derived = deriveYusong(data);
  data.resources.currentLife = legacyResources.maxLife === 0
    ? derived.resources.maximumLife
    : Math.min(data.resources.currentLife, derived.resources.maximumLife);
  data.resources.currentStamina = legacyResources.maxStamina === 0
    ? derived.resources.maximumStamina
    : Math.min(data.resources.currentStamina, derived.resources.maximumStamina);
  data.body = derived.body.map((part) => {
    const legacy = Array.isArray(input.body) ? input.body.find((candidate) => candidate?.id === part.id) : null;
    const currentArmor = legacy?.maxArmor === 0
      ? part.maximumArmor
      : Math.min(part.currentArmor, part.maximumArmor);
    return {
      id: part.id,
      currentArmor,
      ...(part.type === "member" ? { dice: part.dice } : {}),
    };
  });
}

export function listYusongValidationIssues(character) {
  const issues = [];
  if (!character || typeof character !== "object" || Array.isArray(character)) {
    return [validationIssue(ISSUE_LEVELS.STRUCTURAL, "record.invalid", "O registro Yusong deve ser um objeto.")];
  }
  if (!character.id) issues.push(validationIssue(ISSUE_LEVELS.STRUCTURAL, "id.missing", "O personagem não possui identificador.", ["id"]));
  if (character.schemaVersion !== YUSONG_SCHEMA_VERSION) issues.push(validationIssue(ISSUE_LEVELS.STRUCTURAL, "schema.unsupported", "A versão do schema Yusong não é suportada.", ["schemaVersion"]));
  if (!character.identity?.displayName) issues.push(validationIssue(ISSUE_LEVELS.ERROR, "name.missing", "Informe o nome do personagem.", ["identity", "displayName"]));
  for (const key of YUSONG_ATTRIBUTES) {
    if (!Number.isFinite(Number(character.attributes?.[key]))) {
      issues.push(validationIssue(ISSUE_LEVELS.STRUCTURAL, "attribute.invalid", `O atributo ${key} é inválido.`, ["attributes", key]));
    }
  }
  if (!Array.isArray(character.body) || character.body.length !== YUSONG_BODY_PARTS.length) {
    issues.push(validationIssue(ISSUE_LEVELS.STRUCTURAL, "body.invalid", "A ficha deve conter as sete partes do corpo.", ["body"]));
  } else {
    for (const expectedPart of YUSONG_BODY_PARTS) {
      const matches = character.body.filter((part) => part?.id === expectedPart.id);
      if (matches.length !== 1 || !Number.isFinite(Number(matches[0]?.currentArmor))) {
        issues.push(validationIssue(ISSUE_LEVELS.STRUCTURAL, "body.part-invalid", `A parte ${expectedPart.id} é inválida.`, ["body", expectedPart.id]));
      }
    }
  }
  for (const resource of ["currentLife", "currentStamina"]) {
    if (!Number.isFinite(Number(character.resources?.[resource]))) {
      issues.push(validationIssue(ISSUE_LEVELS.STRUCTURAL, "resource.invalid", `O recurso ${resource} é inválido.`, ["resources", resource]));
    }
  }
  if (!character.conditions || typeof character.conditions !== "object" || Array.isArray(character.conditions)) {
    issues.push(validationIssue(ISSUE_LEVELS.STRUCTURAL, "conditions.invalid", "As condições devem usar um mapa por identificador.", ["conditions"]));
  }
  return issues;
}

export function validateYusongCharacter(character) {
  return listYusongValidationIssues(character).every((issue) => issue.level !== ISSUE_LEVELS.STRUCTURAL && issue.level !== ISSUE_LEVELS.ERROR);
}

export const yusongEngine = assertSystemEngine({
  systemId: SYSTEM_IDS.YUSONG,
  currentSchemaVersion: YUSONG_SCHEMA_VERSION,
  migrations: YUSONG_MIGRATIONS.migrations,
  createCharacter: createYusongCharacter,
  migrateCharacter: migrateYusongCharacter,
  validateCharacter: validateYusongCharacter,
  deriveCharacter: deriveYusong,
  listValidationIssues: listYusongValidationIssues,
  commands: yusongCommands,
  diceRequests: Object.freeze({ buildNotation: buildYusongDiceNotation, roll: rollYusongDice }),
  random: Object.freeze({ distributePoints: distributeYusongPoints }),
  summarize: (character) => ({
    displayName: character?.identity?.displayName ?? "Sem nome",
    level: Number(character?.identity?.level) || 1,
    school: character?.selections?.school || null,
  }),
  summarizeReadOnly: (character) => ({
    displayName: String(character?.identity?.displayName ?? character?.identity?.name ?? character?.name ?? "Ficha Yusong de versão futura"),
  }),
});

import { SYSTEM_IDS, assertSystemEngine } from "../../shared/rules/engineContract";
import { deriveYusong, YUSONG_ATTRIBUTES } from "./rules";

export const YUSONG_SCHEMA_VERSION = 1;

const knownLegacyKeys = new Set([
  "id", "name", "nome", "level", "nivel", "attributes", "atributos", "resources",
  "reactions", "body", "talents", "genius", "skills", "inventory", "conditions", "notes",
  "school", "origin", "class", "art", "type",
]);

export function createYusongCharacter({ displayName = "Sem nome", id = crypto.randomUUID() } = {}) {
  return {
    id,
    schemaVersion: YUSONG_SCHEMA_VERSION,
    identity: { displayName },
    level: 1,
    attributes: Object.fromEntries(YUSONG_ATTRIBUTES.map((key) => [key, 0])),
    resources: {}, reactions: {}, body: {}, talents: [], genius: [], skills: {},
    inventory: [], conditions: {}, notes: "", selections: {}, legacyExtensions: {},
  };
}

export function migrateYusongCharacter(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { ok: false, code: "invalid-legacy-record", input };
  }
  const sourceVersion = Number(input.schemaVersion) || 0;
  if (sourceVersion > YUSONG_SCHEMA_VERSION) {
    return { ok: false, code: "future-version", sourceVersion, input };
  }
  if (sourceVersion === YUSONG_SCHEMA_VERSION && input.identity && input.attributes) {
    return { ok: true, data: structuredClone(input), schemaVersion: sourceVersion, provenance: { source: "platform", sourceVersion, migrations: [] }, warnings: [] };
  }

  const defaults = createYusongCharacter({ displayName: input.name ?? input.nome, id: input.id });
  const conditions = input.conditions && typeof input.conditions === "object" && !Array.isArray(input.conditions)
    ? { ...input.conditions }
    : Object.fromEntries((Array.isArray(input.conditions) ? input.conditions : []).map((condition) => [String(condition.id ?? condition), condition]));
  const legacyExtensions = Object.fromEntries(Object.entries(input).filter(([key]) => !knownLegacyKeys.has(key)));
  const data = {
    ...defaults,
    level: Number(input.level ?? input.nivel) || 1,
    attributes: { ...defaults.attributes, ...(input.attributes ?? input.atributos ?? {}) },
    resources: { ...defaults.resources, ...(input.resources ?? {}) },
    reactions: { ...defaults.reactions, ...(input.reactions ?? {}) },
    body: { ...defaults.body, ...(input.body ?? {}) },
    talents: Array.isArray(input.talents) ? structuredClone(input.talents) : [],
    genius: Array.isArray(input.genius) ? structuredClone(input.genius) : [],
    skills: { ...defaults.skills, ...(input.skills ?? {}) },
    inventory: Array.isArray(input.inventory) ? structuredClone(input.inventory) : [],
    conditions,
    notes: String(input.notes ?? ""),
    selections: { school: input.school ?? null, origin: input.origin ?? null, class: input.class ?? null, art: input.art ?? null, type: input.type ?? null },
    legacyExtensions,
  };
  return { ok: true, data, schemaVersion: YUSONG_SCHEMA_VERSION, provenance: { source: "yusong.characters", sourceVersion, migrations: ["yusong:legacy-to-v1"] }, warnings: [] };
}

export const yusongEngine = assertSystemEngine({
  systemId: SYSTEM_IDS.YUSONG,
  currentSchemaVersion: YUSONG_SCHEMA_VERSION,
  createCharacter: createYusongCharacter,
  migrateCharacter: migrateYusongCharacter,
  validateCharacter: (character) => Boolean(character?.id && character?.identity?.displayName && character?.schemaVersion === 1),
  deriveCharacter: deriveYusong,
  listValidationIssues: () => [],
  commands: Object.freeze({}),
  diceRequests: Object.freeze({}),
  summarize: (character) => ({ displayName: character?.identity?.displayName ?? "Sem nome", level: Number(character?.level) || 1 }),
});


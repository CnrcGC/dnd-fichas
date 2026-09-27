import { SYSTEM_IDS, assertSystemEngine, validationIssue, ISSUE_LEVELS } from "../../shared/rules/engineContract";
import { FM_ATTRIBUTES, deriveCoreStatistics, validateAttributeScore } from "./rules";
import { FM_EDITION, validateRuleRegistry } from "./traceability";
import { defineMigrationChain, runMigrationChain } from "../../shared/rules/migrations";

export const FM_SCHEMA_VERSION = 1;
export const FM_MIGRATIONS = defineMigrationChain(FM_SCHEMA_VERSION, []);

export function createFeiticeirosCharacter({ displayName = "Sem nome", id = crypto.randomUUID() } = {}) {
  validateRuleRegistry();
  return {
    id, schemaVersion: FM_SCHEMA_VERSION, rulesEdition: FM_EDITION,
    identity: { displayName, concept: "" },
    narrative: { personalityTraits: "", ideals: "", ligacoes: "", complications: "", innateDomain: "" },
    progression: { level: 1, experience: 0, specializationLevels: {}, events: [] },
    attributes: Object.fromEntries(FM_ATTRIBUTES.map((key) => [key, 10])),
    origin: null, specialization: null, skills: {}, modifiers: {},
    resources: { hp: { current: 0, maximum: 0 }, energy: { kind: "pe", current: 0, maximum: 0 }, soulIntegrity: { current: 0, maximum: 0 }, hitDice: [] },
    talents: [], aptitudes: [], technique: null, martialStyle: null,
    inventory: [], invocations: [],
    combat: { conditions: {}, exhaustion: 0, concentration: null, deathGates: { successes: 0, failures: 0 } },
    rests: [], interludes: [], vows: [], overrides: [],
  };
}

export function validateFeiticeirosCharacter(character) {
  return Boolean(character && character.schemaVersion === FM_SCHEMA_VERSION && character.rulesEdition === FM_EDITION && character.id && character.identity?.displayName && FM_ATTRIBUTES.every((key) => validateAttributeScore(character.attributes?.[key])));
}

export const feiticeirosEngine = assertSystemEngine({
  systemId: SYSTEM_IDS.FEITICEIROS,
  currentSchemaVersion: FM_SCHEMA_VERSION,
  migrations: FM_MIGRATIONS.migrations,
  createCharacter: createFeiticeirosCharacter,
  migrateCharacter(input) {
    if (!input || typeof input !== "object") return { ok: false, code: "invalid-record", input };
    const sourceVersion = Number(input.schemaVersion);
    const migration = runMigrationChain(input, sourceVersion, FM_MIGRATIONS, { validate: validateFeiticeirosCharacter });
    if (!migration.ok) return migration;
    return { ok: true, data: migration.data, schemaVersion: FM_SCHEMA_VERSION, provenance: { source: "platform", sourceVersion, migrations: migration.migrationIds }, warnings: [] };
  },
  validateCharacter: validateFeiticeirosCharacter,
  deriveCharacter: deriveCoreStatistics,
  listValidationIssues(character) {
    const issues = [];
    if (!character?.identity?.displayName?.trim()) issues.push(validationIssue(ISSUE_LEVELS.STRUCTURAL, "display-name-required", "Informe o nome do personagem.", ["identity", "displayName"]));
    if (!character?.origin) issues.push(validationIssue(ISSUE_LEVELS.WARNING, "origin-pending", "A Origem ainda não foi escolhida.", ["origin"]));
    if (!character?.specialization) issues.push(validationIssue(ISSUE_LEVELS.WARNING, "specialization-pending", "A Especialização ainda não foi escolhida.", ["specialization"]));
    return issues;
  },
  commands: Object.freeze({}),
  diceRequests: Object.freeze({}),
  summarize: (character) => ({ displayName: character?.identity?.displayName ?? "Sem nome", level: Number(character?.progression?.level) || 1, origin: character?.origin?.id ?? null, specialization: character?.specialization?.id ?? null }),
  summarizeReadOnly: (character) => ({ displayName: String(character?.identity?.displayName ?? "Ficha F&M de versão futura") }),
});


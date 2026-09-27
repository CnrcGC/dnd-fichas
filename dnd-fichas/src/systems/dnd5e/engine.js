import { criarFichaVazia, normalizarFicha } from "../../utils/ficha";
import { calcularNivelTotal } from "../../utils/niveis";
import { validarFicha } from "../../utils/validacaoFicha";
import { SYSTEM_IDS, assertSystemEngine } from "../../shared/rules/engineContract";
import { defineMigration, defineMigrationChain, runMigrationChain } from "../../shared/rules/migrations";

export const DND5E_SCHEMA_VERSION = 8;

export const DND5E_MIGRATIONS = defineMigrationChain(DND5E_SCHEMA_VERSION, [
  defineMigration({
    id: "dnd5e:legacy-to-v8",
    fromVersion: 0,
    toVersion: DND5E_SCHEMA_VERSION,
    migrate: (input) => normalizarFicha(structuredClone(input)),
  }),
]);

export function migrateDnd5eCharacter(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { ok: false, code: "invalid-legacy-record", input };
  }
  const sourceVersion = Number(input.versaoFicha) || 1;
  if (sourceVersion > DND5E_SCHEMA_VERSION) {
    return { ok: false, code: "future-version", sourceVersion, input };
  }
  if (sourceVersion === DND5E_SCHEMA_VERSION) {
    const data = normalizarFicha(structuredClone(input));
    if (!dnd5eEngine.validateCharacter(data)) return { ok: false, code: "migration-validation-failed", sourceVersion, input, migrated: data };
    return { ok: true, data, schemaVersion: DND5E_SCHEMA_VERSION, provenance: { source: "platform", sourceVersion, migrations: [] }, warnings: [] };
  }
  // Historical D&D revisions predate ordered migrations. They enter one exact
  // compatibility edge (adapter version 0) while retaining their real source version.
  const migration = runMigrationChain(input, 0, DND5E_MIGRATIONS, {
    validate: (data) => Boolean(data?.id && data?.versaoFicha === DND5E_SCHEMA_VERSION),
  });
  if (!migration.ok) return { ...migration, sourceVersion };
  return {
    ok: true,
    data: migration.data,
    schemaVersion: DND5E_SCHEMA_VERSION,
    provenance: { source: "pilares-de-atlas:fichas", sourceVersion, migrations: migration.migrationIds },
    warnings: [],
  };
}

export const dnd5eEngine = assertSystemEngine({
  systemId: SYSTEM_IDS.DND5E,
  currentSchemaVersion: DND5E_SCHEMA_VERSION,
  migrations: DND5E_MIGRATIONS.migrations,
  createCharacter: ({ displayName } = {}) => criarFichaVazia(displayName),
  migrateCharacter: migrateDnd5eCharacter,
  validateCharacter(character) {
    return Boolean(character && typeof character === "object" && character.versaoFicha === DND5E_SCHEMA_VERSION && character.id);
  },
  deriveCharacter: (character) => normalizarFicha(character),
  listValidationIssues(character) {
    const normalized = normalizarFicha(character);
    const validation = validarFicha(normalized, normalized.atributos);
    return [...(validation.erros ?? []), ...(validation.pendencias ?? []), ...(validation.avisos ?? [])];
  },
  commands: Object.freeze({}),
  diceRequests: Object.freeze({}),
  summarize(character) {
    const normalized = normalizarFicha(character);
    return {
      displayName: normalized.nome,
      level: calcularNivelTotal(normalized),
      status: normalized.estadoProntidao ?? "rascunho",
    };
  },
  summarizeReadOnly(character) {
    return { displayName: String(character?.nome ?? "Ficha D&D de versão futura") };
  },
});


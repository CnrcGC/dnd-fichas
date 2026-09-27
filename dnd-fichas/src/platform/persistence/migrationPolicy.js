import { defineMigration, defineMigrationChain, runMigrationChain } from "../../shared/rules/migrations";
import { loadSystemEngine } from "../systems/registry";
import { PLATFORM_SCHEMA_VERSION, createEnvelope } from "./envelope";

export const PLATFORM_MIGRATIONS = defineMigrationChain(PLATFORM_SCHEMA_VERSION, [
  defineMigration({
    id: "platform:legacy-envelope-to-v1",
    fromVersion: 0,
    toVersion: PLATFORM_SCHEMA_VERSION,
    migrate: (input) => ({ ...structuredClone(input), platformVersion: PLATFORM_SCHEMA_VERSION }),
  }),
]);

export function normalizeTimestamp(value) {
  if (typeof value === "string" && /^\d+$/.test(value.trim())) {
    const numeric = Number(value);
    if (Number.isFinite(numeric)) return new Date(numeric).toISOString();
  }
  if (typeof value === "string" && value.trim()) {
    const parsed = Date.parse(value);
    if (!Number.isNaN(parsed)) return new Date(parsed).toISOString();
  }
  const numeric = Number(value);
  if (Number.isFinite(numeric) && value !== null && value !== "") return new Date(numeric).toISOString();
  return null;
}

export function createRecoveryArtifact({ systemId, recordId, sourceKey, sourceVersion, original, migrationIds = [], warnings = [], now = () => new Date().toISOString() }) {
  const snapshot = structuredClone(original);
  return {
    id: `migration:${systemId}:${sourceKey}:${recordId}`,
    systemId,
    recordId,
    sourceKey,
    sourceVersion,
    migrationIds: [...migrationIds],
    warnings: structuredClone(warnings),
    preMigrationSnapshot: snapshot,
    originalExport: JSON.stringify(snapshot, null, 2),
    createdAt: now(),
    confirmedAt: null,
  };
}

export function createReadOnlyMigrationResult({ engine, systemId, sourceVersion, original, summarySource = original, code = "future-version" }) {
  const snapshot = structuredClone(original);
  const summary = engine?.summarizeReadOnly?.(summarySource) ?? { displayName: "Registro de versão futura" };
  return {
    ok: false,
    code,
    mode: "read-only",
    sourceVersion,
    input: snapshot,
    readOnly: {
      systemId,
      sourceVersion,
      displayName: String(summary.displayName ?? "Registro de versão futura"),
      canSave: false,
      canExport: true,
      originalExport: JSON.stringify(snapshot, null, 2),
    },
  };
}

export async function migrateEnvelopeRecord(input, { now = () => new Date().toISOString(), loadEngine = loadSystemEngine } = {}) {
  if (!input || typeof input !== "object" || Array.isArray(input)) return { ok: false, code: "invalid-envelope", input };
  const original = structuredClone(input);
  const platformSourceVersion = input.platformVersion === undefined ? 0 : Number(input.platformVersion);
  let engine;
  try {
    engine = await loadEngine(input.systemId);
  } catch (error) {
    return { ok: false, code: error?.code ?? "unsupported-system", input: original };
  }
  if (platformSourceVersion > PLATFORM_SCHEMA_VERSION) {
    return createReadOnlyMigrationResult({ engine, systemId: input.systemId, sourceVersion: platformSourceVersion, original, summarySource: input.data, code: "future-platform-version" });
  }
  const platform = runMigrationChain(input, platformSourceVersion, PLATFORM_MIGRATIONS, {
    validate: (candidate) => Boolean(candidate?.id && candidate?.systemId && candidate?.data && typeof candidate.data === "object"),
  });
  if (!platform.ok) return platform;

  const system = engine.migrateCharacter(platform.data.data);
  if (!system.ok && system.code === "future-version") {
    return createReadOnlyMigrationResult({ engine, systemId: input.systemId, sourceVersion: system.sourceVersion, original, summarySource: platform.data.data });
  }
  if (!system.ok) return { ...system, input: original };

  const warnings = [...(system.warnings ?? [])];
  const createdAt = normalizeTimestamp(platform.data.createdAt) ?? now();
  const updatedAt = normalizeTimestamp(platform.data.updatedAt) ?? now();
  if (!normalizeTimestamp(platform.data.createdAt)) warnings.push({ code: "missing-created-at", message: "Data original ausente; usada a data de migração." });
  if (!normalizeTimestamp(platform.data.updatedAt)) warnings.push({ code: "missing-updated-at", message: "Data de atualização ausente; usada a data de migração." });
  const envelope = createEnvelope({
    ...platform.data,
    platformVersion: PLATFORM_SCHEMA_VERSION,
    schemaVersion: system.schemaVersion,
    displayName: engine.summarize(system.data).displayName,
    createdAt,
    updatedAt,
    revision: Number.isInteger(platform.data.revision) && platform.data.revision >= 0 ? platform.data.revision : 0,
    mutationId: platform.data.mutationId ?? null,
    data: system.data,
  }, { now });
  const migrationIds = [...platform.migrationIds, ...(system.provenance?.migrations ?? [])];
  return {
    ok: true,
    envelope,
    provenance: {
      platformSourceVersion,
      systemSourceVersion: system.provenance?.sourceVersion ?? input.schemaVersion,
      migrations: migrationIds,
    },
    warnings,
    recovery: createRecoveryArtifact({
      systemId: input.systemId,
      recordId: input.id,
      sourceKey: "platform-envelope",
      sourceVersion: { platform: platformSourceVersion, system: system.provenance?.sourceVersion ?? input.schemaVersion },
      original,
      migrationIds,
      warnings,
      now,
    }),
  };
}

import { createEnvelope } from "./envelope";
import { loadSystemAdapter } from "../systems/registry";
import { SYSTEM_IDS } from "../../shared/rules/engineContract";
import { createReadOnlyMigrationResult, createRecoveryArtifact, normalizeTimestamp } from "./migrationPolicy";
import { assertCharacterRepository } from "./characterRepository";

export const LEGACY_KEYS = Object.freeze({
  [SYSTEM_IDS.DND5E]: "pilares-de-atlas:fichas",
  [SYSTEM_IDS.YUSONG]: "yusong.characters",
  yusongActive: "yusong.activeCharacterId",
});

export function legacyReceiptId(systemId, sourceKey) {
  return `legacy:${systemId}:${sourceKey}:v1`;
}

export async function migrateLegacyRecord(systemId, legacyRecord, { now = () => new Date().toISOString(), sourceKey = LEGACY_KEYS[systemId] } = {}) {
  const adapter = await loadSystemAdapter(systemId);
  const result = adapter.migrate(legacyRecord);
  if (!result.ok && result.code === "future-version") {
    return createReadOnlyMigrationResult({ engine: { summarizeReadOnly: adapter.getSummary }, systemId, sourceVersion: result.sourceVersion, original: legacyRecord });
  }
  if (!result.ok) return { ...result, input: structuredClone(legacyRecord) };
  if (!adapter.validate(result.data)) return { ok: false, code: "migration-validation-failed", input: legacyRecord, migrated: result.data };
  const original = structuredClone(legacyRecord);
  const createdAt = normalizeTimestamp(legacyRecord.criadoEm ?? legacyRecord.createdAt) ?? now();
  const updatedAt = normalizeTimestamp(legacyRecord.atualizadoEm ?? legacyRecord.updatedAt) ?? now();
  const warnings = [
    ...(normalizeTimestamp(legacyRecord.criadoEm ?? legacyRecord.createdAt) ? [] : [{ code: "missing-created-at", message: "Data original ausente; usada a data de importação." }]),
    ...(normalizeTimestamp(legacyRecord.atualizadoEm ?? legacyRecord.updatedAt) ? [] : [{ code: "missing-updated-at", message: "Data de atualização ausente; usada a data de importação." }]),
    ...(result.warnings ?? []),
  ];
  const migrationIds = [...(result.provenance?.migrations ?? [])];
  return {
    ok: true,
    envelope: createEnvelope({
      id: String(result.data.id), systemId, schemaVersion: result.schemaVersion,
      displayName: adapter.getSummary(result.data).displayName,
      createdAt, updatedAt, revision: 0,
      mutationId: `legacy:${systemId}:${sourceKey}:${String(result.data.id)}`,
      data: result.data,
    }, { now }),
    provenance: result.provenance,
    warnings,
    recovery: createRecoveryArtifact({
      systemId,
      recordId: String(result.data.id),
      sourceKey,
      sourceVersion: result.provenance?.sourceVersion ?? 0,
      original,
      migrationIds,
      warnings,
      now,
    }),
  };
}

export function readLegacyCollection(storage, systemId) {
  const sourceKey = LEGACY_KEYS[systemId];
  let raw = null;
  try {
    raw = storage?.getItem(sourceKey);
    if (!raw) return { ok: true, sourceKey, records: [] };
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? { ok: true, sourceKey, records: parsed } : { ok: false, code: "invalid-legacy-collection", sourceKey, raw };
  } catch (error) {
    return { ok: false, code: "legacy-read-failed", sourceKey, error, raw };
  }
}

export function readLegacyActiveCharacterId(storage) {
  try {
    const value = storage?.getItem(LEGACY_KEYS.yusongActive);
    return typeof value === "string" && value.trim() ? value : null;
  } catch {
    return null;
  }
}

export async function importLegacySystem({ storage, repository, systemId, now = () => new Date().toISOString(), createId = () => crypto.randomUUID() }) {
  assertCharacterRepository(repository);
  const collection = readLegacyCollection(storage, systemId);
  if (!collection.ok) {
    const quarantine = {
      id: `legacy-collection:${systemId}:${collection.sourceKey}`,
      systemId,
      sourceKey: collection.sourceKey,
      code: collection.code,
      original: collection.raw,
      readOnly: collection.raw === null ? null : { canSave: false, canExport: true, originalExport: String(collection.raw) },
      retryCount: 0,
      createdAt: now(),
    };
    await repository.quarantine(quarantine);
    return { ...collection, quarantined: 1, quarantineId: quarantine.id };
  }
  const receiptId = legacyReceiptId(systemId, collection.sourceKey);
  const existingReceipt = await repository.getReceipt(receiptId);
  if (existingReceipt) return { ok: true, imported: 0, quarantined: 0, skipped: true, receipt: existingReceipt };

  const migrated = await Promise.all(collection.records.map((record) => migrateLegacyRecord(systemId, record, { now, sourceKey: collection.sourceKey })));
  const valid = migrated.filter((result) => result.ok);
  const invalid = migrated.filter((result) => !result.ok);

  let collisions = 0;
  const backupIds = [];
  const collisionRecords = [];
  const records = [];
  const reservedIds = new Set((await repository.list({ includeDeleted: true })).map((record) => record.id));
  for (const result of valid) {
    let envelope = result.envelope;
    if (reservedIds.has(envelope.id)) {
      const originalId = envelope.id;
      const resolvedId = await createUniqueImportId(repository, createId, reservedIds);
      envelope = {
        ...envelope,
        id: resolvedId,
        mutationId: `legacy:${systemId}:${collection.sourceKey}:${resolvedId}`,
        data: { ...envelope.data, id: resolvedId },
      };
      const idCollision = { originalId, resolvedId };
      result.provenance = { ...result.provenance, idCollision };
      result.recovery = {
        ...result.recovery,
        recordId: resolvedId,
        id: `migration:${systemId}:${collection.sourceKey}:${resolvedId}`,
        idCollision,
      };
      collisionRecords.push(idCollision);
      collisions += 1;
    }
    reservedIds.add(envelope.id);
    backupIds.push(result.recovery.id);
    records.push({ envelope, recovery: result.recovery });
  }
  const quarantined = [];
  for (const [index, result] of invalid.entries()) {
    quarantined.push({
      id: `${receiptId}:${index}`,
      systemId,
      sourceKey: collection.sourceKey,
      code: result.code,
      original: structuredClone(result.input),
      readOnly: result.readOnly ? structuredClone(result.readOnly) : null,
      retryCount: 0,
      createdAt: now(),
    });
  }

  const receipt = {
    id: receiptId,
    systemId,
    sourceKey: collection.sourceKey,
    imported: valid.length,
    quarantined: invalid.length,
    collisions,
    backupIds,
    collisionRecords,
    legacyActiveCharacterId: systemId === SYSTEM_IDS.YUSONG ? readLegacyActiveCharacterId(storage) : null,
    completedAt: now(),
  };
  await repository.commitLegacyImport({ receipt, records, quarantined });
  return { ok: true, imported: valid.length, quarantined: invalid.length, collisions, skipped: false, receipt };
}

export async function importAllLegacySystems(options) {
  const results = [];
  for (const systemId of [SYSTEM_IDS.DND5E, SYSTEM_IDS.YUSONG]) {
    results.push(await importLegacySystem({ ...options, systemId }));
  }
  return {
    ok: results.every((result) => result.ok),
    results,
    legacyKeysRead: [LEGACY_KEYS[SYSTEM_IDS.DND5E], LEGACY_KEYS[SYSTEM_IDS.YUSONG], LEGACY_KEYS.yusongActive],
  };
}

async function createUniqueImportId(repository, createId, reservedIds = new Set()) {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const candidate = String(createId());
    if (candidate && !reservedIds.has(candidate) && !await repository.get(candidate)) return candidate;
  }
  throw Object.assign(new Error("Não foi possível gerar um identificador livre para a importação."), { code: "import-id-collision" });
}

export async function confirmLegacyMigration({ repository, backupId }) {
  const backup = await repository.getMigrationBackup?.(backupId);
  if (!backup) return { ok: false, code: "migration-backup-not-found", backupId };
  await repository.deleteMigrationBackup(backupId);
  return { ok: true, backupId };
}

export async function exportQuarantinedRecord({ repository, quarantineId }) {
  assertCharacterRepository(repository);
  const record = await repository.getQuarantine(quarantineId);
  if (!record) return { ok: false, code: "quarantine-record-not-found", quarantineId };
  return {
    ok: true,
    quarantineId,
    contents: record.readOnly?.originalExport ?? JSON.stringify(record.original, null, 2),
  };
}

export async function retryQuarantinedRecord({ repository, quarantineId, now = () => new Date().toISOString(), createId = () => crypto.randomUUID() }) {
  assertCharacterRepository(repository);
  const quarantined = await repository.getQuarantine(quarantineId);
  if (!quarantined) return { ok: false, code: "quarantine-record-not-found", quarantineId };
  if (!quarantined.original || typeof quarantined.original !== "object") {
    return { ok: false, code: "quarantine-record-not-retryable", quarantineId };
  }
  const result = await migrateLegacyRecord(quarantined.systemId, quarantined.original, { now, sourceKey: quarantined.sourceKey });
  if (!result.ok) {
    await repository.quarantine({ ...quarantined, code: result.code, retryCount: (quarantined.retryCount ?? 0) + 1, lastRetriedAt: now() });
    return { ...result, quarantineId };
  }
  let envelope = result.envelope;
  if (await repository.get(envelope.id)) {
    const resolvedId = await createUniqueImportId(repository, createId);
    envelope = { ...envelope, id: resolvedId, mutationId: `legacy-retry:${quarantineId}:${resolvedId}`, data: { ...envelope.data, id: resolvedId } };
    result.recovery = { ...result.recovery, recordId: resolvedId, id: `migration:${quarantined.systemId}:${quarantined.sourceKey}:${resolvedId}`, idCollision: { originalId: result.envelope.id, resolvedId } };
  }
  await repository.putMigrationBackup(result.recovery);
  const stored = await repository.put(envelope);
  await repository.deleteQuarantine(quarantineId);
  return { ok: true, envelope: stored, recovery: result.recovery, quarantineId };
}


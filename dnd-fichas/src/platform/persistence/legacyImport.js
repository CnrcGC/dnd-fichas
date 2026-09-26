import { createEnvelope } from "./envelope";
import { loadSystemEngine } from "../systems/registry";
import { SYSTEM_IDS } from "../../shared/rules/engineContract";

export const LEGACY_KEYS = Object.freeze({
  [SYSTEM_IDS.DND5E]: "pilares-de-atlas:fichas",
  [SYSTEM_IDS.YUSONG]: "yusong.characters",
  yusongActive: "yusong.activeCharacterId",
});

export function legacyReceiptId(systemId, sourceKey) {
  return `legacy:${systemId}:${sourceKey}:v1`;
}

export async function migrateLegacyRecord(systemId, legacyRecord, { now = () => new Date().toISOString() } = {}) {
  const engine = await loadSystemEngine(systemId);
  const result = engine.migrateCharacter(legacyRecord);
  if (!result.ok) return result;
  if (!engine.validateCharacter(result.data)) return { ok: false, code: "migration-validation-failed", input: legacyRecord, migrated: result.data };
  const created = Number(legacyRecord.criadoEm ?? legacyRecord.createdAt);
  const createdAt = Number.isFinite(created) ? new Date(created).toISOString() : now();
  return {
    ok: true,
    envelope: createEnvelope({
      id: String(result.data.id), systemId, schemaVersion: result.schemaVersion,
      displayName: engine.summarize(result.data).displayName,
      createdAt, updatedAt: now(), revision: 0, data: result.data,
    }, { now }),
    provenance: result.provenance,
    warnings: [
      ...(Number.isFinite(created) ? [] : [{ code: "missing-created-at", message: "Data original ausente; usada a data de importação." }]),
      ...(result.warnings ?? []),
    ],
  };
}

export function readLegacyCollection(storage, systemId) {
  const sourceKey = LEGACY_KEYS[systemId];
  try {
    const raw = storage?.getItem(sourceKey);
    if (!raw) return { ok: true, sourceKey, records: [] };
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? { ok: true, sourceKey, records: parsed } : { ok: false, code: "invalid-legacy-collection", sourceKey, raw };
  } catch (error) {
    return { ok: false, code: "legacy-read-failed", sourceKey, error, raw: null };
  }
}

export async function importLegacySystem({ storage, repository, systemId, now = () => new Date().toISOString() }) {
  const collection = readLegacyCollection(storage, systemId);
  if (!collection.ok) return collection;
  const receiptId = legacyReceiptId(systemId, collection.sourceKey);
  const existingReceipt = await repository.getReceipt(receiptId);
  if (existingReceipt) return { ok: true, imported: 0, quarantined: 0, skipped: true, receipt: existingReceipt };

  const migrated = await Promise.all(collection.records.map((record) => migrateLegacyRecord(systemId, record, { now })));
  const valid = migrated.filter((result) => result.ok);
  const invalid = migrated.filter((result) => !result.ok);

  for (const result of valid) await repository.put(result.envelope);
  for (const [index, result] of invalid.entries()) {
    await repository.quarantine({
      id: `${receiptId}:${index}`,
      systemId,
      sourceKey: collection.sourceKey,
      code: result.code,
      original: structuredClone(result.input),
      createdAt: now(),
    });
  }

  const receipt = {
    id: receiptId,
    systemId,
    sourceKey: collection.sourceKey,
    imported: valid.length,
    quarantined: invalid.length,
    completedAt: now(),
  };
  await repository.putReceipt(receipt);
  return { ok: true, imported: valid.length, quarantined: invalid.length, skipped: false, receipt };
}


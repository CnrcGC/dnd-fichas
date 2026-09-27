import { getSystem } from "../systems/registry";

export const PLATFORM_SCHEMA_VERSION = 1;

export function isIsoTimestamp(value) {
  return typeof value === "string" && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString() === value;
}

export function validateEnvelope(envelope) {
  const issues = [];
  if (!envelope || typeof envelope !== "object" || Array.isArray(envelope)) return { ok: false, issues: [{ code: "invalid-envelope", path: [] }] };
  if (envelope.platformVersion !== PLATFORM_SCHEMA_VERSION) issues.push({ code: "unsupported-platform-version", path: ["platformVersion"] });
  if (!envelope.id || typeof envelope.id !== "string") issues.push({ code: "id-required", path: ["id"] });
  try { getSystem(envelope.systemId); } catch { issues.push({ code: "unsupported-system", path: ["systemId"] }); }
  if (!Number.isInteger(envelope.schemaVersion) || envelope.schemaVersion < 1) issues.push({ code: "invalid-schema-version", path: ["schemaVersion"] });
  if (!envelope.displayName || typeof envelope.displayName !== "string") issues.push({ code: "display-name-required", path: ["displayName"] });
  if (!isIsoTimestamp(envelope.createdAt)) issues.push({ code: "invalid-created-at", path: ["createdAt"] });
  if (!isIsoTimestamp(envelope.updatedAt)) issues.push({ code: "invalid-updated-at", path: ["updatedAt"] });
  if (envelope.deletedAt != null && !isIsoTimestamp(envelope.deletedAt)) issues.push({ code: "invalid-deleted-at", path: ["deletedAt"] });
  if (!Number.isInteger(envelope.revision) || envelope.revision < 0) issues.push({ code: "invalid-revision", path: ["revision"] });
  if (!envelope.data || typeof envelope.data !== "object" || Array.isArray(envelope.data)) issues.push({ code: "invalid-system-data", path: ["data"] });
  return { ok: issues.length === 0, issues };
}

export function createEnvelope({ id, systemId, schemaVersion, displayName, data, createdAt, updatedAt, deletedAt = null, revision = 0, mutationId = null, platformVersion = PLATFORM_SCHEMA_VERSION }, { now = () => new Date().toISOString() } = {}) {
  const timestamp = now();
  const envelope = {
    platformVersion, id, systemId, schemaVersion, displayName: String(displayName ?? "").trim(),
    createdAt: createdAt ?? timestamp, updatedAt: updatedAt ?? timestamp,
    deletedAt, revision, mutationId, data,
  };
  const validation = validateEnvelope(envelope);
  if (!validation.ok) throw Object.assign(new TypeError("Envelope de personagem inválido."), { code: "invalid-envelope", issues: validation.issues });
  return envelope;
}

export function updateEnvelope(current, data, { displayName = current.displayName, mutationId = crypto.randomUUID(), now = () => new Date().toISOString() } = {}) {
  const next = createEnvelope({ ...current, data, displayName, updatedAt: now(), revision: current.revision + 1, mutationId }, { now });
  if (next.revision <= current.revision) throw new Error("A revisão deve avançar.");
  return next;
}

export function setEnvelopeDeleted(current, deleted, { mutationId = crypto.randomUUID(), now = () => new Date().toISOString() } = {}) {
  const timestamp = now();
  return createEnvelope({
    ...current,
    deletedAt: deleted ? timestamp : null,
    updatedAt: timestamp,
    revision: current.revision + 1,
    mutationId,
  }, { now });
}


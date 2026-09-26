import { validateEnvelope } from "./envelope";

export const DATABASE_NAME = "rpg-platform";
export const DATABASE_VERSION = 1;

function requestResult(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export function openPlatformDatabase(indexedDb = globalThis.indexedDB) {
  if (!indexedDb) return Promise.reject(Object.assign(new Error("IndexedDB indisponível."), { code: "indexeddb-unavailable" }));
  return new Promise((resolve, reject) => {
    const request = indexedDb.open(DATABASE_NAME, DATABASE_VERSION);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains("characters")) {
        const characters = database.createObjectStore("characters", { keyPath: "id" });
        characters.createIndex("systemId", "systemId", { unique: false });
        characters.createIndex("updatedAt", "updatedAt", { unique: false });
      }
      if (!database.objectStoreNames.contains("migrationReceipts")) database.createObjectStore("migrationReceipts", { keyPath: "id" });
      if (!database.objectStoreNames.contains("quarantine")) database.createObjectStore("quarantine", { keyPath: "id" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(Object.assign(new Error("Atualização do banco local bloqueada por outra aba."), { code: "indexeddb-blocked" }));
  });
}

export class IndexedDbCharacterRepository {
  constructor(database) { this.database = database; }

  transaction(storeNames, mode = "readonly") { return this.database.transaction(storeNames, mode); }

  async list() {
    return requestResult(this.transaction(["characters"]).objectStore("characters").getAll());
  }

  async get(id) {
    return requestResult(this.transaction(["characters"]).objectStore("characters").get(id));
  }

  async put(envelope, { expectedRevision = null } = {}) {
    const validation = validateEnvelope(envelope);
    if (!validation.ok) throw Object.assign(new TypeError("Envelope inválido."), { code: "invalid-envelope", issues: validation.issues });
    const transaction = this.transaction(["characters"], "readwrite");
    const store = transaction.objectStore("characters");
    const existing = await requestResult(store.get(envelope.id));
    if (expectedRevision !== null && existing && existing.revision !== expectedRevision) {
      transaction.abort();
      throw Object.assign(new Error("Conflito de revisão local."), { code: "revision-conflict", current: existing, attempted: envelope });
    }
    await requestResult(store.put(structuredClone(envelope)));
    return envelope;
  }

  async getReceipt(id) { return requestResult(this.transaction(["migrationReceipts"]).objectStore("migrationReceipts").get(id)); }
  async putReceipt(receipt) { await requestResult(this.transaction(["migrationReceipts"], "readwrite").objectStore("migrationReceipts").put(receipt)); return receipt; }
  async quarantine(record) { await requestResult(this.transaction(["quarantine"], "readwrite").objectStore("quarantine").put(record)); return record; }
}

export class MemoryCharacterRepository {
  constructor() { this.characters = new Map(); this.receipts = new Map(); this.quarantined = new Map(); }
  async list() { return [...this.characters.values()].map((value) => structuredClone(value)); }
  async get(id) { const value = this.characters.get(id); return value ? structuredClone(value) : undefined; }
  async put(envelope, { expectedRevision = null } = {}) {
    const validation = validateEnvelope(envelope);
    if (!validation.ok) throw Object.assign(new TypeError("Envelope inválido."), { code: "invalid-envelope", issues: validation.issues });
    const existing = this.characters.get(envelope.id);
    if (expectedRevision !== null && existing && existing.revision !== expectedRevision) throw Object.assign(new Error("Conflito de revisão local."), { code: "revision-conflict", current: structuredClone(existing), attempted: envelope });
    this.characters.set(envelope.id, structuredClone(envelope)); return structuredClone(envelope);
  }
  async getReceipt(id) { return this.receipts.get(id); }
  async putReceipt(receipt) { this.receipts.set(receipt.id, structuredClone(receipt)); return receipt; }
  async quarantine(record) { this.quarantined.set(record.id, structuredClone(record)); return record; }
}


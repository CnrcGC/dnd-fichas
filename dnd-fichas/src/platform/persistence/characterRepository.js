import { validateEnvelope } from "./envelope";

export const DATABASE_NAME = "rpg-platform";
export const DATABASE_VERSION = 2;

function requestResult(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function transactionResult(transaction) {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onabort = () => reject(transaction.error ?? Object.assign(new Error("Transação local cancelada."), { code: "transaction-aborted" }));
    transaction.onerror = () => reject(transaction.error);
  });
}

async function committedRequest(transaction, request) {
  const [result] = await Promise.all([
    requestResult(request),
    transactionResult(transaction),
  ]);
  return result;
}

function persistenceError(message, code, details = {}) {
  return Object.assign(new Error(message), { code, ...details });
}

function prepareEnvelopeWrite(envelope, existing, { expectedRevision = null, createMutationId = () => crypto.randomUUID() } = {}) {
  const validation = validateEnvelope(envelope);
  if (!validation.ok) throw persistenceError("Envelope inválido.", "invalid-envelope", { issues: validation.issues });
  if (existing) {
    if (expectedRevision === null || existing.revision !== expectedRevision) {
      throw persistenceError("Conflito de revisão local.", "revision-conflict", { current: structuredClone(existing), attempted: structuredClone(envelope) });
    }
    if (envelope.revision !== existing.revision + 1) {
      throw persistenceError("A revisão precisa avançar exatamente uma versão.", "invalid-revision-advance", { current: existing.revision, attempted: envelope.revision });
    }
  } else if (envelope.revision !== 0) {
    throw persistenceError("Um novo registro deve começar na revisão zero.", "invalid-initial-revision", { attempted: envelope.revision });
  }
  const mutationId = typeof envelope.mutationId === "string" && envelope.mutationId.trim()
    ? envelope.mutationId
    : String(createMutationId());
  if (!mutationId) throw persistenceError("A mutação precisa de um identificador.", "mutation-id-required");
  return structuredClone({ ...envelope, mutationId });
}

export function assertCharacterRepository(repository) {
  const methods = ["list", "get", "put", "getReceipt", "commitLegacyImport", "quarantine", "getQuarantine", "listQuarantine", "deleteQuarantine", "getMigrationBackup", "putMigrationBackup", "deleteMigrationBackup"];
  for (const method of methods) {
    if (typeof repository?.[method] !== "function") throw new TypeError(`O repositório de personagens não expõe ${method}().`);
  }
  return repository;
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
      if (!database.objectStoreNames.contains("migrationBackups")) database.createObjectStore("migrationBackups", { keyPath: "id" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(Object.assign(new Error("Atualização do banco local bloqueada por outra aba."), { code: "indexeddb-blocked" }));
  });
}

export class IndexedDbCharacterRepository {
  constructor(database) { this.database = database; }

  transaction(storeNames, mode = "readonly") { return this.database.transaction(storeNames, mode); }

  async list({ systemId = null, includeDeleted = false, onlyDeleted = false } = {}) {
    const records = await requestResult(this.transaction(["characters"]).objectStore("characters").getAll());
    return records.filter((record) =>
      (!systemId || record.systemId === systemId) &&
      (onlyDeleted ? Boolean(record.deletedAt) : includeDeleted || !record.deletedAt)
    );
  }

  async get(id) {
    return requestResult(this.transaction(["characters"]).objectStore("characters").get(id));
  }

  async put(envelope, { expectedRevision = null, createMutationId } = {}) {
    const transaction = this.transaction(["characters"], "readwrite");
    const completed = transactionResult(transaction);
    const store = transaction.objectStore("characters");
    const existing = await requestResult(store.get(envelope.id));
    let prepared;
    try {
      prepared = prepareEnvelopeWrite(envelope, existing, { expectedRevision, createMutationId });
    } catch (error) {
      transaction.abort();
      await completed.catch(() => {});
      throw error;
    }
    await Promise.all([requestResult(store.put(prepared)), completed]);
    return structuredClone(prepared);
  }

  async getReceipt(id) { return requestResult(this.transaction(["migrationReceipts"]).objectStore("migrationReceipts").get(id)); }
  async putReceipt(receipt) {
    const transaction = this.transaction(["migrationReceipts"], "readwrite");
    await committedRequest(transaction, transaction.objectStore("migrationReceipts").put(receipt));
    return receipt;
  }
  async quarantine(record) {
    const transaction = this.transaction(["quarantine"], "readwrite");
    await committedRequest(transaction, transaction.objectStore("quarantine").put(record));
    return record;
  }
  async getQuarantine(id) { return requestResult(this.transaction(["quarantine"]).objectStore("quarantine").get(id)); }
  async listQuarantine() { return requestResult(this.transaction(["quarantine"]).objectStore("quarantine").getAll()); }
  async deleteQuarantine(id) {
    const transaction = this.transaction(["quarantine"], "readwrite");
    await committedRequest(transaction, transaction.objectStore("quarantine").delete(id));
  }
  async getMigrationBackup(id) { return requestResult(this.transaction(["migrationBackups"]).objectStore("migrationBackups").get(id)); }
  async putMigrationBackup(record) {
    const transaction = this.transaction(["migrationBackups"], "readwrite");
    await committedRequest(transaction, transaction.objectStore("migrationBackups").put(structuredClone(record)));
    return record;
  }
  async deleteMigrationBackup(id) {
    const transaction = this.transaction(["migrationBackups"], "readwrite");
    await committedRequest(transaction, transaction.objectStore("migrationBackups").delete(id));
  }

  async commitLegacyImport({ receipt, records, quarantined }) {
    const stores = ["characters", "migrationReceipts", "quarantine", "migrationBackups"];
    const transaction = this.transaction(stores, "readwrite");
    const completed = transactionResult(transaction);
    const characters = transaction.objectStore("characters");
    const backups = transaction.objectStore("migrationBackups");
    const quarantine = transaction.objectStore("quarantine");
    const receipts = transaction.objectStore("migrationReceipts");
    try {
      for (const { envelope, recovery } of records) {
        const prepared = prepareEnvelopeWrite(envelope, null, { createMutationId: () => `legacy:${receipt.id}:${envelope.id}` });
        characters.add(prepared);
        backups.add(structuredClone(recovery));
      }
      for (const record of quarantined) quarantine.put(structuredClone(record));
      receipts.add(structuredClone(receipt));
      await completed;
      return structuredClone(receipt);
    } catch (error) {
      try { transaction.abort(); } catch { /* A própria falha do IndexedDB pode já ter cancelado a transação. */ }
      await completed.catch(() => {});
      throw persistenceError("A importação local foi revertida integralmente.", "import-transaction-failed", { cause: error });
    }
  }
}

export class MemoryCharacterRepository {
  constructor({ importFault = null } = {}) { this.characters = new Map(); this.receipts = new Map(); this.quarantined = new Map(); this.migrationBackups = new Map(); this.importFault = importFault; }
  async list({ systemId = null, includeDeleted = false, onlyDeleted = false } = {}) {
    return [...this.characters.values()]
      .filter((value) => (!systemId || value.systemId === systemId) && (onlyDeleted ? Boolean(value.deletedAt) : includeDeleted || !value.deletedAt))
      .map((value) => structuredClone(value));
  }
  async get(id) { const value = this.characters.get(id); return value ? structuredClone(value) : undefined; }
  async put(envelope, { expectedRevision = null, createMutationId } = {}) {
    const existing = this.characters.get(envelope.id);
    const prepared = prepareEnvelopeWrite(envelope, existing, { expectedRevision, createMutationId });
    this.characters.set(envelope.id, prepared); return structuredClone(prepared);
  }
  async getReceipt(id) { return this.receipts.get(id); }
  async putReceipt(receipt) { this.receipts.set(receipt.id, structuredClone(receipt)); return receipt; }
  async quarantine(record) { this.quarantined.set(record.id, structuredClone(record)); return record; }
  async getQuarantine(id) { const value = this.quarantined.get(id); return value ? structuredClone(value) : undefined; }
  async listQuarantine() { return [...this.quarantined.values()].map((value) => structuredClone(value)); }
  async deleteQuarantine(id) { this.quarantined.delete(id); }
  async getMigrationBackup(id) { const value = this.migrationBackups.get(id); return value ? structuredClone(value) : undefined; }
  async putMigrationBackup(record) { this.migrationBackups.set(record.id, structuredClone(record)); return structuredClone(record); }
  async deleteMigrationBackup(id) { this.migrationBackups.delete(id); }

  async commitLegacyImport({ receipt, records, quarantined }) {
    if (this.receipts.has(receipt.id)) return structuredClone(this.receipts.get(receipt.id));
    const snapshots = {
      characters: new Map(this.characters),
      receipts: new Map(this.receipts),
      quarantined: new Map(this.quarantined),
      migrationBackups: new Map(this.migrationBackups),
    };
    try {
      let step = 0;
      for (const { envelope, recovery } of records) {
        if (this.characters.has(envelope.id)) throw persistenceError("ID ocupado durante a importação.", "import-id-collision", { id: envelope.id });
        const prepared = prepareEnvelopeWrite(envelope, null, { createMutationId: () => `legacy:${receipt.id}:${envelope.id}` });
        this.characters.set(prepared.id, prepared);
        this.migrationBackups.set(recovery.id, structuredClone(recovery));
        this.importFault?.(++step);
      }
      for (const record of quarantined) {
        this.quarantined.set(record.id, structuredClone(record));
        this.importFault?.(++step);
      }
      this.receipts.set(receipt.id, structuredClone(receipt));
      this.importFault?.(++step);
      return structuredClone(receipt);
    } catch (error) {
      this.characters = snapshots.characters;
      this.receipts = snapshots.receipts;
      this.quarantined = snapshots.quarantined;
      this.migrationBackups = snapshots.migrationBackups;
      throw persistenceError("A importação local foi revertida integralmente.", "import-transaction-failed", { cause: error });
    }
  }
}


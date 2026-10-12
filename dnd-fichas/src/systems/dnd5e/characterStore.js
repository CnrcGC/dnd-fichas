import { carregarFichas, salvarFichas } from "../../utils/storage";
import { IndexedDbCharacterRepository, assertCharacterRepository, openPlatformDatabase } from "../../platform/persistence/characterRepository";
import { importLegacySystem, migrateLegacyRecord } from "../../platform/persistence/legacyImport";
import { setEnvelopeDeleted, updateEnvelope } from "../../platform/persistence/envelope";
import { migrateEnvelopeRecord } from "../../platform/persistence/migrationPolicy";

function dataEqual(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function storageDefault() {
  return typeof localStorage === "undefined" ? null : localStorage;
}

async function openDefaultRepository() {
  return new IndexedDbCharacterRepository(await openPlatformDatabase());
}

export function createDnd5eCharacterStore({
  storage = storageDefault(),
  repository = null,
  openRepository = openDefaultRepository,
  now = () => new Date().toISOString(),
  createMutationId = () => crypto.randomUUID(),
} = {}) {
  let repositoryPromise;
  let initializationPromise;
  let writeQueue = Promise.resolve();

  function getRepository() {
    repositoryPromise ??= Promise.resolve().then(() => repository ?? openRepository()).then(assertCharacterRepository)
      .catch((error) => { repositoryPromise = null; throw error; });
    return repositoryPromise;
  }

  async function readSupported(durableRepository) {
    const records = await durableRepository.list({ systemId: "dnd5e" });
    const results = await Promise.all(records.map((record) => migrateEnvelopeRecord(record, { now })));
    return results.filter((result) => result.ok).map((result) => structuredClone(result.envelope.data));
  }

  async function assertWritable(record) {
    const result = await migrateEnvelopeRecord(record, { now });
    if (!result.ok) throw Object.assign(new Error("O registro incompatível foi preservado sem alterações."), { code: result.code });
  }

  function initialize() {
    initializationPromise ??= getRepository()
      .then(async (durableRepository) => {
        await importLegacySystem({ storage, repository: durableRepository, systemId: "dnd5e", now, createId: createMutationId });
        return readSupported(durableRepository);
      })
      .catch((error) => {
        initializationPromise = null;
        throw error;
      });
    return initializationPromise;
  }

  async function mirrorSnapshot(fichas) {
    await initialize();
    const durableRepository = await getRepository();
    const existing = new Map((await durableRepository.list({ includeDeleted: true })).map((record) => [record.id, record]));
    for (const ficha of fichas) {
      const migrated = await migrateLegacyRecord("dnd5e", ficha, { now });
      if (!migrated.ok) throw Object.assign(new Error("A ficha D&D não pôde ser normalizada para persistência."), { code: migrated.code, result: migrated });
      const current = existing.get(migrated.envelope.id);
      if (!current) {
        await durableRepository.put({ ...migrated.envelope, mutationId: String(createMutationId()) });
        continue;
      }
      if (current.systemId !== "dnd5e" || current.deletedAt) {
        throw Object.assign(new Error("O identificador está reservado por outro registro ou pela lixeira."), { code: "reserved-character-id" });
      }
      await assertWritable(current);
      if (current.displayName === migrated.envelope.displayName && dataEqual(current.data, migrated.envelope.data)) continue;
      const updated = updateEnvelope(current, migrated.envelope.data, {
        displayName: migrated.envelope.displayName,
        mutationId: String(createMutationId()),
        now,
      });
      await durableRepository.put(updated, { expectedRevision: current.revision });
    }
    // Ausência em um snapshot nunca implica exclusão; remove() mantém tombstones.
    return { ok: true, count: fichas.length };
  }

  return Object.freeze({
    // Somente bootstrap: após initialize(), o IndexedDB é a fonte de verdade.
    load() {
      return carregarFichas(storage) ?? [];
    },
    saveLegacy(fichas) {
      return salvarFichas(fichas, storage);
    },
    initialize,
    save(fichas) {
      const snapshot = structuredClone(fichas);
      writeQueue = writeQueue.catch(() => {}).then(() => mirrorSnapshot(snapshot));
      return { ok: true, erro: null, durable: writeQueue };
    },
    remove(id) {
      writeQueue = writeQueue.catch(() => {}).then(async () => {
        await initialize();
        const durableRepository = await getRepository();
        const current = await durableRepository.get(id);
        if (!current || current.systemId !== "dnd5e" || current.deletedAt) return current ?? null;
        await assertWritable(current);
        const deleted = setEnvelopeDeleted(current, true, { mutationId: String(createMutationId()), now });
        return durableRepository.put(deleted, { expectedRevision: current.revision });
      });
      return { ok: true, erro: null, durable: writeQueue };
    },
    restore(id) {
      writeQueue = writeQueue.catch(() => {}).then(async () => {
        await initialize();
        const durableRepository = await getRepository();
        const current = await durableRepository.get(id);
        if (!current || current.systemId !== "dnd5e" || !current.deletedAt) return current ?? null;
        await assertWritable(current);
        const restored = setEnvelopeDeleted(current, false, { mutationId: String(createMutationId()), now });
        return durableRepository.put(restored, { expectedRevision: current.revision });
      });
      return { ok: true, erro: null, durable: writeQueue };
    },
    async listDurable() {
      await initialize();
      const durableRepository = await getRepository();
      return readSupported(durableRepository);
    },
    async listProtected() {
      await initialize();
      const durableRepository = await getRepository();
      const records = await durableRepository.list({ systemId: "dnd5e" });
      const results = await Promise.all(records.map(async (record) => ({ record, result: await migrateEnvelopeRecord(record, { now }) })));
      return results.filter(({ result }) => !result.ok).map(({ record, result }) => ({ id: record.id, nome: record.displayName, codigo: result.code }));
    },
    async listDeleted() {
      await initialize();
      const durableRepository = await getRepository();
      return (await durableRepository.list({ systemId: "dnd5e", onlyDeleted: true })).map((record) => ({
        id: record.id,
        nome: record.displayName,
        deletedAt: record.deletedAt,
      }));
    },
  });
}


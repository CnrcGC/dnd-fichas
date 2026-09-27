import { carregarFichas, salvarFichas } from "../../utils/storage";
import { IndexedDbCharacterRepository, assertCharacterRepository, openPlatformDatabase } from "../../platform/persistence/characterRepository";
import { importLegacySystem, migrateLegacyRecord } from "../../platform/persistence/legacyImport";
import { setEnvelopeDeleted, updateEnvelope } from "../../platform/persistence/envelope";

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
    repositoryPromise ??= Promise.resolve(repository ?? openRepository()).then(assertCharacterRepository);
    return repositoryPromise;
  }

  function initialize() {
    initializationPromise ??= getRepository()
      .then(async (durableRepository) => {
        await importLegacySystem({ storage, repository: durableRepository, systemId: "dnd5e", now, createId: createMutationId });
        return (await durableRepository.list({ systemId: "dnd5e" })).map((record) => structuredClone(record.data));
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
    const existing = new Map((await durableRepository.list({ systemId: "dnd5e" })).map((record) => [record.id, record]));
    for (const ficha of fichas) {
      const migrated = await migrateLegacyRecord("dnd5e", ficha, { now });
      if (!migrated.ok) throw Object.assign(new Error("A ficha D&D não pôde ser normalizada para persistência."), { code: migrated.code, result: migrated });
      const current = existing.get(migrated.envelope.id);
      if (!current) {
        await durableRepository.put({ ...migrated.envelope, mutationId: String(createMutationId()) });
        continue;
      }
      if (current.displayName === migrated.envelope.displayName && dataEqual(current.data, migrated.envelope.data)) continue;
      const updated = updateEnvelope(current, migrated.envelope.data, {
        displayName: migrated.envelope.displayName,
        mutationId: String(createMutationId()),
        now,
      });
      await durableRepository.put(updated, { expectedRevision: current.revision });
    }
    // Exclusões não são espelhadas até existir política recuperável de tombstone.
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
      writeQueue = writeQueue.catch(() => {}).then(() => mirrorSnapshot(structuredClone(fichas)));
      return { ok: true, erro: null, durable: writeQueue };
    },
    remove(id) {
      writeQueue = writeQueue.catch(() => {}).then(async () => {
        await initialize();
        const durableRepository = await getRepository();
        const current = await durableRepository.get(id);
        if (!current || current.systemId !== "dnd5e" || current.deletedAt) return current ?? null;
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
        const restored = setEnvelopeDeleted(current, false, { mutationId: String(createMutationId()), now });
        return durableRepository.put(restored, { expectedRevision: current.revision });
      });
      return { ok: true, erro: null, durable: writeQueue };
    },
    async listDurable() {
      await initialize();
      const durableRepository = await getRepository();
      return (await durableRepository.list({ systemId: "dnd5e" })).map((record) => structuredClone(record.data));
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


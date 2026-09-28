import { IndexedDbCharacterRepository, assertCharacterRepository, openPlatformDatabase } from "../../platform/persistence/characterRepository";
import { createEnvelope, setEnvelopeDeleted, updateEnvelope } from "../../platform/persistence/envelope";
import { importLegacySystem } from "../../platform/persistence/legacyImport";
import { yusongEngine } from "./engine";

const SYSTEM_ID = "yusong";

function storageDefault() {
  return typeof localStorage === "undefined" ? null : localStorage;
}

async function openDefaultRepository() {
  return new IndexedDbCharacterRepository(await openPlatformDatabase());
}

function toLibraryItem(record, legacyActiveCharacterId = null) {
  return {
    id: record.id,
    ...yusongEngine.summarize(record.data),
    updatedAt: record.updatedAt,
    deletedAt: record.deletedAt,
    wasLegacyActive: record.id === legacyActiveCharacterId,
  };
}

export function createPilaresCharacterStore({
  storage = storageDefault(),
  repository = null,
  openRepository = openDefaultRepository,
  now = () => new Date().toISOString(),
  createMutationId = () => crypto.randomUUID(),
} = {}) {
  let repositoryPromise;
  let initializationPromise;
  let writeQueue = Promise.resolve();
  let legacyActiveCharacterId = null;

  function getRepository() {
    repositoryPromise ??= Promise.resolve(repository ?? openRepository()).then(assertCharacterRepository);
    return repositoryPromise;
  }

  function initialize() {
    initializationPromise ??= getRepository()
      .then(async (durableRepository) => {
        const imported = await importLegacySystem({
          storage,
          repository: durableRepository,
          systemId: SYSTEM_ID,
          now,
          createId: createMutationId,
        });
        if (!imported.ok) {
          throw Object.assign(new Error("A coleção legada de Pilares de Atlas não pôde ser importada. Uma cópia foi preservada para recuperação."), {
            code: imported.code,
            importResult: imported,
          });
        }
        legacyActiveCharacterId = imported.receipt?.legacyActiveCharacterId ?? null;
        return listActive(durableRepository);
      })
      .catch((error) => {
        initializationPromise = null;
        throw error;
      });
    return initializationPromise;
  }

  async function listActive(durableRepository = null) {
    const currentRepository = durableRepository ?? await getRepository();
    const records = await currentRepository.list({ systemId: SYSTEM_ID });
    return records
      .map((record) => toLibraryItem(record, legacyActiveCharacterId))
      .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
  }

  function setDeleted(id, deleted) {
    writeQueue = writeQueue.catch(() => {}).then(async () => {
      await initialize();
      const durableRepository = await getRepository();
      const current = await durableRepository.get(id);
      if (!current || current.systemId !== SYSTEM_ID || Boolean(current.deletedAt) === deleted) return current ?? null;
      const next = setEnvelopeDeleted(current, deleted, { mutationId: String(createMutationId()), now });
      return durableRepository.put(next, { expectedRevision: current.revision });
    });
    return writeQueue;
  }

  function enqueueWrite(operation) {
    writeQueue = writeQueue.catch(() => {}).then(operation);
    return writeQueue;
  }

  function assertValidCharacter(character) {
    if (!yusongEngine.validateCharacter(character)) {
      throw Object.assign(new TypeError("O personagem de Pilares de Atlas não é válido."), {
        code: "invalid-yusong-character",
        issues: yusongEngine.listValidationIssues(character),
      });
    }
  }

  return Object.freeze({
    initialize,
    async list() {
      await initialize();
      return listActive();
    },
    async listDeleted() {
      await initialize();
      const durableRepository = await getRepository();
      return (await durableRepository.list({ systemId: SYSTEM_ID, onlyDeleted: true }))
        .map((record) => toLibraryItem(record, legacyActiveCharacterId))
        .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
    },
    async get(id) {
      await initialize();
      const durableRepository = await getRepository();
      const record = await durableRepository.get(id);
      if (!record || record.systemId !== SYSTEM_ID || record.deletedAt) return null;
      return structuredClone(record.data);
    },
    create(character) {
      return enqueueWrite(async () => {
        await initialize();
        assertValidCharacter(character);
        const durableRepository = await getRepository();
        const summary = yusongEngine.summarize(character);
        const envelope = createEnvelope({
          id: character.id,
          systemId: SYSTEM_ID,
          schemaVersion: character.schemaVersion,
          displayName: summary.displayName,
          data: structuredClone(character),
          mutationId: String(createMutationId()),
        }, { now });
        const stored = await durableRepository.put(envelope);
        return structuredClone(stored.data);
      });
    },
    save(character) {
      return enqueueWrite(async () => {
        await initialize();
        assertValidCharacter(character);
        const durableRepository = await getRepository();
        const current = await durableRepository.get(character.id);
        if (!current || current.systemId !== SYSTEM_ID || current.deletedAt) {
          throw Object.assign(new Error("O personagem não existe ou está na lixeira."), { code: "character-not-found" });
        }
        const next = updateEnvelope(current, structuredClone(character), {
          displayName: yusongEngine.summarize(character).displayName,
          mutationId: String(createMutationId()),
          now,
        });
        const stored = await durableRepository.put(next, { expectedRevision: current.revision });
        return structuredClone(stored.data);
      });
    },
    remove(id) {
      return setDeleted(id, true);
    },
    restore(id) {
      return setDeleted(id, false);
    },
  });
}

export const pilaresCharacterStore = createPilaresCharacterStore();

import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";

const NOW = "2026-09-27T15:00:00.000Z";
const fixtureUrl = new URL("./fixtures/dnd5e/legacy-character-v8.json", import.meta.url);

let server;
let characterStoreModule;
let repositoryModule;
let legacyModule;
let fixture;

before(async () => {
  server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: "custom" });
  characterStoreModule = await server.ssrLoadModule("/src/systems/dnd5e/characterStore.js");
  repositoryModule = await server.ssrLoadModule("/src/platform/persistence/characterRepository.js");
  legacyModule = await server.ssrLoadModule("/src/platform/persistence/legacyImport.js");
  fixture = JSON.parse(await readFile(fileURLToPath(fixtureUrl), "utf8"));
});

after(async () => { await server?.close(); });

function memoryStorage(records = [fixture]) {
  const values = new Map([["pilares-de-atlas:fichas", JSON.stringify(records)]]);
  return {
    values,
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };
}

test("FE-04A importa v8 pelo adapter e preserva os campos normalizados no envelope", async () => {
  const storage = memoryStorage();
  const repository = new repositoryModule.MemoryCharacterRepository();
  const store = characterStoreModule.createDnd5eCharacterStore({ storage, repository, now: () => NOW, createMutationId: () => "fixture-mutation" });
  await store.initialize();

  const expected = await legacyModule.migrateLegacyRecord("dnd5e", fixture, { now: () => NOW });
  const stored = await repository.get(fixture.id);
  assert.equal(JSON.stringify(stored.data), JSON.stringify(expected.envelope.data));
  assert.equal(stored.schemaVersion, 8);
  assert.equal(storage.getItem("pilares-de-atlas:fichas"), JSON.stringify([fixture]));
});

test("FE-04A serializa updates, incrementa só fichas alteradas e não duplica revisão", async () => {
  const storage = memoryStorage();
  const repository = new repositoryModule.MemoryCharacterRepository();
  let mutation = 0;
  const store = characterStoreModule.createDnd5eCharacterStore({ storage, repository, now: () => NOW, createMutationId: () => `mutation-${++mutation}` });
  await store.initialize();
  const [normalized] = await store.listDurable();

  await store.save([normalized]).durable;
  assert.equal((await repository.get(fixture.id)).revision, 0);

  const first = store.save([{ ...normalized, objetivo: "Primeira alteração" }]).durable;
  const second = store.save([{ ...normalized, objetivo: "Segunda alteração" }]).durable;
  await Promise.all([first, second]);
  const stored = await repository.get(fixture.id);
  assert.equal(stored.revision, 2);
  assert.equal(stored.data.objetivo, "Segunda alteração");
  assert.match(stored.mutationId, /^mutation-/);
});

test("FE-04B usa IndexedDB como fonte de verdade sem regravar o legado", async () => {
  const storage = memoryStorage();
  const repository = new repositoryModule.MemoryCharacterRepository();
  const store = characterStoreModule.createDnd5eCharacterStore({ storage, repository, now: () => NOW, createMutationId: () => "mutation-source" });
  const initialized = await store.initialize();
  assert.equal(initialized[0].nome, fixture.nome);

  const originalLegacy = storage.getItem("pilares-de-atlas:fichas");
  await store.save([{ ...initialized[0], nome: "Nome somente no IndexedDB" }]).durable;
  assert.equal((await store.listDurable())[0].nome, "Nome somente no IndexedDB");
  assert.equal(store.load()[0].nome, fixture.nome);
  assert.equal(storage.getItem("pilares-de-atlas:fichas"), originalLegacy);
});

test("FE-04B exclui por tombstone, oculta da lista ativa e restaura com nova revisão", async () => {
  const storage = memoryStorage();
  const repository = new repositoryModule.MemoryCharacterRepository();
  let mutation = 0;
  const store = characterStoreModule.createDnd5eCharacterStore({ storage, repository, now: () => NOW, createMutationId: () => `delete-${++mutation}` });
  await store.initialize();
  const legacyBefore = storage.getItem("pilares-de-atlas:fichas");

  await store.remove(fixture.id).durable;
  const deleted = await repository.get(fixture.id);
  assert.equal(deleted.deletedAt, NOW);
  assert.equal(deleted.revision, 1);
  assert.deepEqual(await store.listDurable(), []);
  assert.deepEqual(await store.listDeleted(), [{ id: fixture.id, nome: fixture.nome, deletedAt: NOW }]);
  assert.equal(storage.getItem("pilares-de-atlas:fichas"), legacyBefore);

  await store.restore(fixture.id).durable;
  const restored = await repository.get(fixture.id);
  assert.equal(restored.deletedAt, null);
  assert.equal(restored.revision, 2);
  assert.equal((await store.listDurable())[0].id, fixture.id);
  assert.deepEqual(await store.listDeleted(), []);
});

test("FE-04B mantém tombstones reservados contra nova importação", async () => {
  const storage = memoryStorage();
  const repository = new repositoryModule.MemoryCharacterRepository();
  const store = characterStoreModule.createDnd5eCharacterStore({ storage, repository, now: () => NOW, createMutationId: () => "reserved" });
  await store.initialize();
  await store.remove(fixture.id).durable;
  repository.receipts.clear();

  const secondStore = characterStoreModule.createDnd5eCharacterStore({ storage, repository, now: () => NOW, createMutationId: () => "second-import" });
  await secondStore.initialize();
  assert.equal((await repository.list({ includeDeleted: true })).length, 2);
  assert.equal((await repository.get(fixture.id)).deletedAt, NOW);
});


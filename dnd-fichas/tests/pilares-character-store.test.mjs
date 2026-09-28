import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";

const NOW = "2026-09-27T18:00:00.000Z";
const fixtureUrl = new URL("./fixtures/yusong/legacy-character-v0.json", import.meta.url);

let server;
let storeModule;
let repositoryModule;
let engineModule;
let fixture;

before(async () => {
  server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: "custom" });
  storeModule = await server.ssrLoadModule("/src/systems/yusong/characterStore.js");
  repositoryModule = await server.ssrLoadModule("/src/platform/persistence/characterRepository.js");
  engineModule = await server.ssrLoadModule("/src/systems/yusong/engine.js");
  fixture = JSON.parse(await readFile(fileURLToPath(fixtureUrl), "utf8"));
});

after(async () => { await server?.close(); });

function memoryStorage(records = [fixture]) {
  const values = new Map([
    ["yusong.characters", JSON.stringify(records)],
    ["yusong.activeCharacterId", fixture.id],
  ]);
  return {
    values,
    getItem: (key) => values.get(key) ?? null,
  };
}

test("FE-05A importa a coleção legada e expõe somente o resumo da biblioteca", async () => {
  const storage = memoryStorage();
  const repository = new repositoryModule.MemoryCharacterRepository();
  const store = storeModule.createPilaresCharacterStore({ storage, repository, now: () => NOW, createMutationId: () => "pilares-import" });

  const characters = await store.initialize();
  assert.deepEqual(characters, [{
    id: fixture.id,
    displayName: "Kang Ji-ho",
    level: 3,
    school: "seirin",
    updatedAt: fixture.updatedAt,
    deletedAt: null,
    wasLegacyActive: true,
  }]);
  assert.equal((await repository.get(fixture.id)).data.conditions.amedrontado, true);
  assert.equal(storage.getItem("yusong.characters"), JSON.stringify([fixture]));
  assert.equal(storage.getItem("yusong.activeCharacterId"), fixture.id);
});

test("FE-05A usa o repositório durável como fonte de verdade após a importação idempotente", async () => {
  const storage = memoryStorage();
  const repository = new repositoryModule.MemoryCharacterRepository();
  const first = storeModule.createPilaresCharacterStore({ storage, repository, now: () => NOW, createMutationId: () => "first" });
  await first.initialize();
  storage.values.delete("yusong.characters");

  const second = storeModule.createPilaresCharacterStore({ storage, repository, now: () => NOW, createMutationId: () => "second" });
  const characters = await second.initialize();
  assert.equal(characters.length, 1);
  assert.equal(characters[0].displayName, "Kang Ji-ho");
  assert.equal((await repository.list({ systemId: "yusong" })).length, 1);
});

test("FE-05A move para lixeira por tombstone e restaura com revisão monotônica", async () => {
  const storage = memoryStorage();
  const repository = new repositoryModule.MemoryCharacterRepository();
  let mutation = 0;
  const store = storeModule.createPilaresCharacterStore({ storage, repository, now: () => NOW, createMutationId: () => `pilares-${++mutation}` });
  await store.initialize();

  await store.remove(fixture.id);
  assert.deepEqual(await store.list(), []);
  assert.equal((await store.listDeleted())[0].displayName, "Kang Ji-ho");
  assert.equal((await repository.get(fixture.id)).revision, 1);

  await store.restore(fixture.id);
  assert.equal((await store.list())[0].id, fixture.id);
  assert.deepEqual(await store.listDeleted(), []);
  assert.equal((await repository.get(fixture.id)).revision, 2);
  assert.equal(storage.getItem("yusong.characters"), JSON.stringify([fixture]));
});

test("FE-05A torna falha de coleção visível e preserva uma cópia em quarentena", async () => {
  const raw = "{json interrompido";
  const storage = { getItem: (key) => key === "yusong.characters" ? raw : null };
  const repository = new repositoryModule.MemoryCharacterRepository();
  const store = storeModule.createPilaresCharacterStore({ storage, repository, now: () => NOW });

  await assert.rejects(store.initialize(), (error) => error.code === "legacy-read-failed" && error.importResult.quarantined === 1);
  assert.equal((await repository.listQuarantine()).length, 1);
  assert.equal(storage.getItem("yusong.characters"), raw);
});

test("FE-05B cria e reabre um personagem no envelope de Pilares de Atlas", async () => {
  const storage = memoryStorage([]);
  storage.values.delete("yusong.activeCharacterId");
  const repository = new repositoryModule.MemoryCharacterRepository();
  let mutation = 0;
  const store = storeModule.createPilaresCharacterStore({ storage, repository, now: () => NOW, createMutationId: () => `create-${++mutation}` });
  const character = engineModule.yusongEngine.createCharacter({ id: "new-pilares", displayName: "Hana Lee" });

  const created = await store.create(character);
  assert.equal(created.identity.displayName, "Hana Lee");
  assert.deepEqual(await store.get(character.id), character);
  const envelope = await repository.get(character.id);
  assert.equal(envelope.systemId, "yusong");
  assert.equal(envelope.revision, 0);
  assert.equal(envelope.displayName, "Hana Lee");
});

test("FE-05B salva identidade com revisão monotônica e mantém o legado intacto", async () => {
  const storage = memoryStorage();
  const repository = new repositoryModule.MemoryCharacterRepository();
  let mutation = 0;
  const store = storeModule.createPilaresCharacterStore({ storage, repository, now: () => NOW, createMutationId: () => `edit-${++mutation}` });
  const original = await store.get(fixture.id);
  const renamed = engineModule.yusongEngine.commands.setIdentity(original, { field: "displayName", value: "Kang Atualizado" }).character;
  const selected = engineModule.yusongEngine.commands.setSelection(renamed, { field: "school", value: "shinnen" }).character;

  await store.save(selected);
  const stored = await repository.get(fixture.id);
  assert.equal(stored.revision, 1);
  assert.equal(stored.displayName, "Kang Atualizado");
  assert.equal(stored.data.selections.school, "shinnen");
  assert.equal(storage.getItem("yusong.characters"), JSON.stringify([fixture]));
});

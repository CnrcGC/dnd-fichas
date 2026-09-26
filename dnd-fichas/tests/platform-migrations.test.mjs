import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "vite";

let server;
let envelope;
let legacy;
let repository;

before(async () => {
  server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: "custom" });
  envelope = await server.ssrLoadModule("/src/platform/persistence/envelope.js");
  legacy = await server.ssrLoadModule("/src/platform/persistence/legacyImport.js");
  repository = await server.ssrLoadModule("/src/platform/persistence/characterRepository.js");
});

after(async () => { await server?.close(); });

const NOW = "2026-09-26T12:00:00.000Z";

test("FE-02 cria envelope D&D estável sem alterar o payload legado", async () => {
  const input = { id: "legacy-1", nome: "Lyra", criadoEm: 1000, classeId: "mago", nivel: 1 };
  const snapshot = structuredClone(input);
  const result = await legacy.migrateLegacyRecord("dnd5e", input, { now: () => NOW });
  assert.equal(result.ok, true);
  assert.equal(result.envelope.systemId, "dnd5e");
  assert.equal(result.envelope.schemaVersion, 8);
  assert.equal(result.envelope.revision, 0);
  assert.equal(result.envelope.createdAt, "1970-01-01T00:00:01.000Z");
  assert.deepEqual(input, snapshot);
});

test("FE-02 repositório detecta conflito e nunca sobrescreve revisão superior", async () => {
  const repo = new repository.MemoryCharacterRepository();
  const initial = envelope.createEnvelope({ id: "one", systemId: "dnd5e", schemaVersion: 8, displayName: "Um", data: { id: "one" } }, { now: () => NOW });
  await repo.put(initial);
  const updated = envelope.updateEnvelope(initial, { id: "one", notes: "novo" }, { now: () => "2026-09-26T12:01:00.000Z", mutationId: "mutation-1" });
  await repo.put(updated, { expectedRevision: 0 });
  await assert.rejects(repo.put(initial, { expectedRevision: 0 }), (error) => error.code === "revision-conflict");
  assert.deepEqual(await repo.get("one"), updated);
});

test("MECH-04 rejeita envelope corrompido e versão futura sem descarte silencioso", async () => {
  assert.equal(envelope.validateEnvelope({}).ok, false);
  const future = await legacy.migrateLegacyRecord("dnd5e", { id: "future", nome: "Futuro", versaoFicha: 99 }, { now: () => NOW });
  assert.equal(future.ok, false);
  assert.equal(future.code, "future-version");
  assert.equal(future.input.versaoFicha, 99);
});

test("FE-02 importação legada é idempotente e não apaga a origem", async () => {
  const source = JSON.stringify([{ id: "legacy-2", nome: "Brom", versaoFicha: 8, nivel: 2 }]);
  const storage = { getItem: (key) => key === "pilares-de-atlas:fichas" ? source : null };
  const repo = new repository.MemoryCharacterRepository();
  const first = await legacy.importLegacySystem({ storage, repository: repo, systemId: "dnd5e", now: () => NOW });
  const second = await legacy.importLegacySystem({ storage, repository: repo, systemId: "dnd5e", now: () => NOW });
  assert.equal(first.imported, 1);
  assert.equal(second.skipped, true);
  assert.equal((await repo.list()).length, 1);
  assert.equal(storage.getItem("pilares-de-atlas:fichas"), source);
});


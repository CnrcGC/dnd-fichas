import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "vite";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

let server;
let envelope;
let legacy;
let repository;
let dndV8Fixture;

before(async () => {
  server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: "custom" });
  envelope = await server.ssrLoadModule("/src/platform/persistence/envelope.js");
  legacy = await server.ssrLoadModule("/src/platform/persistence/legacyImport.js");
  repository = await server.ssrLoadModule("/src/platform/persistence/characterRepository.js");
  dndV8Fixture = JSON.parse(await readFile(fileURLToPath(new URL("./fixtures/dnd5e/legacy-character-v8.json", import.meta.url)), "utf8"));
});

after(async () => { await server?.close(); });

const NOW = "2026-09-26T12:00:00.000Z";

function controlledIndexedDbWrite() {
  let activeTransaction;
  let written;

  function successfulRequest(result) {
    const request = { result, error: null };
    queueMicrotask(() => request.onsuccess?.());
    return request;
  }

  const database = {
    transaction() {
      activeTransaction = {
        error: null,
        objectStore() {
          return {
            get: () => successfulRequest(undefined),
            put(value) {
              written = structuredClone(value);
              return successfulRequest(value.id);
            },
          };
        },
      };
      return activeTransaction;
    },
  };

  return {
    database,
    get written() { return written; },
    complete() { activeTransaction.oncomplete?.(); },
    abort(error) {
      activeTransaction.error = error;
      activeTransaction.onabort?.();
    },
  };
}

async function waitForIndexedDbRequests() {
  await new Promise((resolve) => setImmediate(resolve));
}

test("FE-02 cria envelope D&D estável sem alterar o payload legado", async () => {
  const input = structuredClone(dndV8Fixture);
  const snapshot = structuredClone(input);
  const result = await legacy.migrateLegacyRecord("dnd5e", input, { now: () => NOW });
  assert.equal(result.ok, true);
  assert.equal(result.envelope.systemId, "dnd5e");
  assert.equal(result.envelope.platformVersion, 1);
  assert.equal(result.envelope.schemaVersion, 8);
  assert.equal(result.envelope.revision, 0);
  assert.equal(result.envelope.createdAt, "2024-09-01T00:00:00.000Z");
  assert.equal(result.envelope.updatedAt, "2024-09-02T00:00:00.000Z");
  assert.match(result.envelope.mutationId, /^legacy:dnd5e:/);
  assert.deepEqual(input, snapshot);
});

test("FE-02 repositório detecta conflito e nunca sobrescreve revisão superior", async () => {
  const repo = new repository.MemoryCharacterRepository();
  const initial = envelope.createEnvelope({ id: "one", systemId: "dnd5e", schemaVersion: 8, displayName: "Um", data: { id: "one" } }, { now: () => NOW });
  const storedInitial = await repo.put(initial, { createMutationId: () => "mutation-create" });
  assert.equal(storedInitial.mutationId, "mutation-create");
  const updated = envelope.updateEnvelope(initial, { id: "one", notes: "novo" }, { now: () => "2026-09-26T12:01:00.000Z", mutationId: "mutation-1" });
  await repo.put(updated, { expectedRevision: 0 });
  await assert.rejects(repo.put(initial, { expectedRevision: 0 }), (error) => error.code === "revision-conflict");
  await assert.rejects(repo.put({ ...updated, revision: 3 }, { expectedRevision: 1 }), (error) => error.code === "invalid-revision-advance");
  assert.deepEqual(await repo.get("one"), updated);
});

test("ME-00 IndexedDB só confirma put depois do commit da transação", async () => {
  const controlled = controlledIndexedDbWrite();
  const repo = new repository.IndexedDbCharacterRepository(controlled.database);
  const initial = envelope.createEnvelope({ id: "commit-one", systemId: "dnd5e", schemaVersion: 8, displayName: "Commit", data: { id: "commit-one" } }, { now: () => NOW });
  let settled = false;

  const pending = repo.put(initial, { createMutationId: () => "mutation-commit" })
    .finally(() => { settled = true; });
  await waitForIndexedDbRequests();

  assert.equal(controlled.written.id, initial.id);
  assert.equal(settled, false, "request.onsuccess não equivale ao commit da transação");

  controlled.complete();
  const stored = await pending;
  assert.equal(settled, true);
  assert.equal(stored.mutationId, "mutation-commit");
});

test("ME-00 IndexedDB rejeita put abortado depois do sucesso da request", async () => {
  const controlled = controlledIndexedDbWrite();
  const repo = new repository.IndexedDbCharacterRepository(controlled.database);
  const initial = envelope.createEnvelope({ id: "abort-one", systemId: "dnd5e", schemaVersion: 8, displayName: "Abort", data: { id: "abort-one" } }, { now: () => NOW });
  const abortError = Object.assign(new Error("Quota excedida após a request."), { name: "QuotaExceededError" });

  const pending = repo.put(initial, { createMutationId: () => "mutation-abort" });
  await waitForIndexedDbRequests();
  controlled.abort(abortError);

  await assert.rejects(pending, (error) => error === abortError);
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

test("FE-02 importa os três registros legados somente por leitura", async () => {
  const yusong = JSON.parse(await readFile(fileURLToPath(new URL("./fixtures/yusong/legacy-character-v0.json", import.meta.url)), "utf8"));
  const values = new Map([
    ["pilares-de-atlas:fichas", JSON.stringify([dndV8Fixture])],
    ["yusong.characters", JSON.stringify([yusong])],
    ["yusong.activeCharacterId", yusong.id],
  ]);
  const storage = {
    getItem: (key) => values.get(key) ?? null,
    removeItem: () => assert.fail("A importação não pode apagar a origem."),
  };
  const repo = new repository.MemoryCharacterRepository();
  const result = await legacy.importAllLegacySystems({ storage, repository: repo, now: () => NOW });
  assert.equal(result.ok, true);
  assert.deepEqual(result.legacyKeysRead, ["pilares-de-atlas:fichas", "yusong.characters", "yusong.activeCharacterId"]);
  assert.equal((await repo.list()).length, 2);
  const yusongReceipt = await repo.getReceipt(legacy.legacyReceiptId("yusong", "yusong.characters"));
  assert.equal(yusongReceipt.legacyActiveCharacterId, yusong.id);
  assert.equal(values.size, 3);
});

test("FE-02 reverte integralmente uma importação interrompida e permite retry", async () => {
  const source = JSON.stringify([dndV8Fixture, { ...dndV8Fixture, id: "dnd-v8-second", nome: "Segunda" }]);
  const storage = { getItem: (key) => key === "pilares-de-atlas:fichas" ? source : null };
  const repo = new repository.MemoryCharacterRepository({ importFault: (step) => { if (step === 1) throw new Error("interrompida"); } });
  await assert.rejects(
    legacy.importLegacySystem({ storage, repository: repo, systemId: "dnd5e", now: () => NOW }),
    (error) => error.code === "import-transaction-failed",
  );
  assert.equal((await repo.list()).length, 0);
  assert.equal(repo.migrationBackups.size, 0);
  assert.equal(repo.receipts.size, 0);
  assert.equal(repo.quarantined.size, 0);

  repo.importFault = null;
  const retried = await legacy.importLegacySystem({ storage, repository: repo, systemId: "dnd5e", now: () => NOW });
  assert.equal(retried.imported, 2);
  assert.equal((await repo.list()).length, 2);
});

test("FE-02 preserva coleção corrompida para exportação", async () => {
  const raw = "{json interrompido";
  const storage = { getItem: () => raw };
  const repo = new repository.MemoryCharacterRepository();
  const result = await legacy.importLegacySystem({ storage, repository: repo, systemId: "dnd5e", now: () => NOW });
  assert.equal(result.ok, false);
  assert.equal(result.quarantined, 1);
  const exported = await legacy.exportQuarantinedRecord({ repository: repo, quarantineId: result.quarantineId });
  assert.equal(exported.ok, true);
  assert.equal(exported.contents, raw);
  assert.equal(storage.getItem(), raw);
});

test("FE-02 permite retry de quarentena sem removê-la antes da persistência", async () => {
  const repo = new repository.MemoryCharacterRepository();
  await repo.quarantine({ id: "retry-one", systemId: "dnd5e", sourceKey: "fixture", code: "temporary", original: dndV8Fixture, retryCount: 0, createdAt: NOW });
  const result = await legacy.retryQuarantinedRecord({ repository: repo, quarantineId: "retry-one", now: () => NOW });
  assert.equal(result.ok, true);
  assert.equal(await repo.getQuarantine("retry-one"), undefined);
  assert.equal((await repo.get(dndV8Fixture.id)).displayName, dndV8Fixture.nome);
  assert.ok(await repo.getMigrationBackup(result.recovery.id));
});


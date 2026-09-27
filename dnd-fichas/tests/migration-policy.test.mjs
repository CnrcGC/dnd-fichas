import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";

const NOW = "2026-09-27T12:00:00.000Z";
const yusongFixtureUrl = new URL("./fixtures/yusong/legacy-character-v0.json", import.meta.url);

let server;
let migrations;
let policy;
let envelope;
let legacy;
let repository;
let registry;
let yusongFixture;

before(async () => {
  server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: "custom" });
  migrations = await server.ssrLoadModule("/src/shared/rules/migrations.js");
  policy = await server.ssrLoadModule("/src/platform/persistence/migrationPolicy.js");
  envelope = await server.ssrLoadModule("/src/platform/persistence/envelope.js");
  legacy = await server.ssrLoadModule("/src/platform/persistence/legacyImport.js");
  repository = await server.ssrLoadModule("/src/platform/persistence/characterRepository.js");
  registry = await server.ssrLoadModule("/src/platform/systems/registry.js");
  yusongFixture = JSON.parse(await readFile(fileURLToPath(yusongFixtureUrl), "utf8"));
});

after(async () => { await server?.close(); });

function legacyDnd(id = "dnd-old") {
  return { id, nome: "Lyra", versaoFicha: 1, criadoEm: 1000, classeId: "mago", nivel: 3, atributos: { inteligencia: 16 } };
}

function oldEnvelope(data = legacyDnd()) {
  return {
    id: data.id,
    systemId: "dnd5e",
    schemaVersion: data.versaoFicha,
    displayName: data.nome,
    createdAt: NOW,
    updatedAt: NOW,
    revision: 0,
    mutationId: null,
    data,
  };
}

test("MECH-04 executa somente arestas ordenadas e imutáveis", () => {
  const chain = migrations.defineMigrationChain(2, [
    migrations.defineMigration({ id: "fixture:0-1", fromVersion: 0, toVersion: 1, migrate: (input) => ({ ...input, first: true }) }),
    migrations.defineMigration({ id: "fixture:1-2", fromVersion: 1, toVersion: 2, migrate: (input) => ({ ...input, second: true }) }),
  ]);
  const input = { id: "ordered" };
  const result = migrations.runMigrationChain(input, 0, chain, { validate: (value) => value.first && value.second });
  assert.equal(result.ok, true);
  assert.deepEqual(result.migrationIds, ["fixture:0-1", "fixture:1-2"]);
  assert.deepEqual(input, { id: "ordered" });
  assert.equal(Object.isFrozen(chain.migrations), true);
  assert.equal(migrations.runMigrationChain(input, 1, migrations.defineMigrationChain(3, []), {}).code, "unsupported-migration-path");
});

test("MECH-04 bloqueia uma etapa mutante e preserva a entrada", () => {
  const chain = migrations.defineMigrationChain(1, [
    migrations.defineMigration({
      id: "fixture:mutating",
      fromVersion: 0,
      toVersion: 1,
      migrate(input) {
        input.nested.value = 2;
        return input;
      },
    }),
  ]);
  const input = { nested: { value: 1 } };
  const result = migrations.runMigrationChain(input, 0, chain);
  assert.equal(result.ok, false);
  assert.equal(result.code, "migration-failed");
  assert.equal(result.failedMigrationId, "fixture:mutating");
  assert.deepEqual(input, { nested: { value: 1 } });
});

test("MECH-04 exige cadeia imutável em todos os engines registrados", async () => {
  for (const system of registry.listSystems()) {
    const engine = await registry.loadSystemEngine(system.id);
    assert.equal(Object.isFrozen(engine.migrations), true);
  }
});

test("MECH-04 versiona e migra o envelope separadamente do payload", async () => {
  const input = oldEnvelope();
  const snapshot = structuredClone(input);
  const result = await policy.migrateEnvelopeRecord(input, { now: () => NOW });
  assert.equal(result.ok, true);
  assert.equal(result.envelope.platformVersion, 1);
  assert.equal(result.envelope.schemaVersion, 8);
  assert.equal(result.envelope.data.versaoFicha, 8);
  assert.deepEqual(result.provenance.migrations, ["platform:legacy-envelope-to-v1", "dnd5e:legacy-to-v8"]);
  assert.deepEqual(input, snapshot);

  const repeated = await policy.migrateEnvelopeRecord(result.envelope, { now: () => NOW });
  assert.equal(repeated.ok, true);
  assert.deepEqual(repeated.envelope, result.envelope);
  assert.deepEqual(repeated.provenance.migrations, []);
});

test("MECH-04 define resultados para envelope vazio, corrompido e parcialmente migrado", async () => {
  assert.equal((await policy.migrateEnvelopeRecord(null)).code, "invalid-envelope");
  assert.equal((await policy.migrateEnvelopeRecord({})).code, "unsupported-system");
  const partial = { ...oldEnvelope(), platformVersion: 1 };
  const result = await policy.migrateEnvelopeRecord(partial, { now: () => NOW });
  assert.equal(result.ok, true);
  assert.equal(result.envelope.schemaVersion, 8);
  assert.deepEqual(result.provenance.migrations, ["dnd5e:legacy-to-v8"]);
});

test("MECH-04 abre versões futuras em modo somente leitura e exportável", async () => {
  const systemFuture = {
    ...oldEnvelope({ id: "future-system", nome: "Futuro", versaoFicha: 99 }),
    platformVersion: 1,
    schemaVersion: 99,
  };
  const systemResult = await policy.migrateEnvelopeRecord(systemFuture, { now: () => NOW });
  assert.equal(systemResult.ok, false);
  assert.equal(systemResult.code, "future-version");
  assert.equal(systemResult.mode, "read-only");
  assert.equal(systemResult.readOnly.displayName, "Futuro");
  assert.equal(systemResult.readOnly.canSave, false);
  assert.deepEqual(JSON.parse(systemResult.readOnly.originalExport), systemFuture);

  const platformFuture = { ...oldEnvelope({ ...legacyDnd("future-platform"), versaoFicha: 8 }), platformVersion: 2, schemaVersion: 8 };
  const platformResult = await policy.migrateEnvelopeRecord(platformFuture, { now: () => NOW });
  assert.equal(platformResult.code, "future-platform-version");
  assert.equal(platformResult.mode, "read-only");
  assert.deepEqual(JSON.parse(platformResult.readOnly.originalExport), platformFuture);
});

test("MECH-04 preserva timestamps ISO Yusong e cria recuperação completa", async () => {
  const result = await legacy.migrateLegacyRecord("yusong", yusongFixture, { now: () => NOW });
  assert.equal(result.ok, true);
  assert.equal(result.envelope.platformVersion, 1);
  assert.equal(result.envelope.createdAt, yusongFixture.createdAt);
  assert.equal(result.envelope.updatedAt, yusongFixture.updatedAt);
  assert.equal(result.envelope.revision, 0);
  assert.deepEqual(result.recovery.preMigrationSnapshot, yusongFixture);
  assert.deepEqual(JSON.parse(result.recovery.originalExport), yusongFixture);
  assert.deepEqual(result.recovery.migrationIds, ["yusong:legacy-to-v1"]);
  assert.equal(result.recovery.confirmedAt, null);
  assert.deepEqual(result.warnings, []);
});

test("MECH-04 gera updatedAt ausente com aviso sem inferir revisão", async () => {
  const result = await legacy.migrateLegacyRecord("dnd5e", legacyDnd("missing-update"), { now: () => NOW });
  assert.equal(result.ok, true);
  assert.equal(result.envelope.createdAt, "1970-01-01T00:00:01.000Z");
  assert.equal(result.envelope.updatedAt, NOW);
  assert.equal(result.envelope.revision, 0);
  assert.ok(result.warnings.some((warning) => warning.code === "missing-updated-at"));
});

test("MECH-04 mantém backup até confirmação explícita", async () => {
  const storage = { getItem: (key) => key === "yusong.characters" ? JSON.stringify([yusongFixture]) : null };
  const repo = new repository.MemoryCharacterRepository();
  const imported = await legacy.importLegacySystem({ storage, repository: repo, systemId: "yusong", now: () => NOW });
  assert.equal(imported.imported, 1);
  const backupId = imported.receipt.backupIds[0];
  assert.ok(await repo.getMigrationBackup(backupId));
  assert.equal((await legacy.confirmLegacyMigration({ repository: repo, backupId })).ok, true);
  assert.equal(await repo.getMigrationBackup(backupId), undefined);
});

test("MECH-04 resolve colisão somente na importação e registra proveniência", async () => {
  const repo = new repository.MemoryCharacterRepository();
  const existing = envelope.createEnvelope({
    id: yusongFixture.id,
    systemId: "yusong",
    schemaVersion: 1,
    displayName: "Existente",
    data: { id: yusongFixture.id },
  }, { now: () => NOW });
  await repo.put(existing);
  const storage = { getItem: (key) => key === "yusong.characters" ? JSON.stringify([yusongFixture]) : null };
  const imported = await legacy.importLegacySystem({
    storage,
    repository: repo,
    systemId: "yusong",
    now: () => NOW,
    createId: () => "resolved-yusong-id",
  });
  assert.equal(imported.collisions, 1);
  assert.equal((await repo.get(yusongFixture.id)).displayName, "Existente");
  const resolved = await repo.get("resolved-yusong-id");
  assert.equal(resolved.data.id, "resolved-yusong-id");
  assert.ok(imported.receipt.backupIds[0].endsWith(":resolved-yusong-id"));
  assert.deepEqual(imported.receipt.collisionRecords, [
    { originalId: yusongFixture.id, resolvedId: "resolved-yusong-id" },
  ]);
  const backup = await repo.getMigrationBackup(imported.receipt.backupIds[0]);
  assert.deepEqual(backup.idCollision, {
    originalId: yusongFixture.id,
    resolvedId: "resolved-yusong-id",
  });
});

test("MECH-04 preserva versão futura em quarentena com exportação somente leitura", async () => {
  const future = { id: "future-import", nome: "Futuro", versaoFicha: 99 };
  const storage = { getItem: (key) => key === "pilares-de-atlas:fichas" ? JSON.stringify([future]) : null };
  const repo = new repository.MemoryCharacterRepository();
  const result = await legacy.importLegacySystem({ storage, repository: repo, systemId: "dnd5e", now: () => NOW });
  assert.equal(result.imported, 0);
  assert.equal(result.quarantined, 1);
  const quarantined = [...repo.quarantined.values()][0];
  assert.equal(quarantined.code, "future-version");
  assert.equal(quarantined.readOnly.canExport, true);
  assert.deepEqual(JSON.parse(quarantined.readOnly.originalExport), future);
});

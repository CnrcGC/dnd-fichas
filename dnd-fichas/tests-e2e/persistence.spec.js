import { test, expect } from "@playwright/test";

test("IndexedDB aplica revisão otimista e rollback atômico de importação", async ({ page }) => {
  await page.goto("/");
  const result = await page.evaluate(async () => {
    const repositoryModule = await import("/src/platform/persistence/characterRepository.js");
    const envelopeModule = await import("/src/platform/persistence/envelope.js");
    const database = await repositoryModule.openPlatformDatabase();
    const repository = new repositoryModule.IndexedDbCharacterRepository(database);
    const now = () => "2026-09-27T12:00:00.000Z";
    const initial = envelopeModule.createEnvelope({ id: "indexed-one", systemId: "dnd5e", schemaVersion: 8, displayName: "Indexed", data: { id: "indexed-one" } }, { now });
    const stored = await repository.put(initial, { createMutationId: () => "indexed-create" });
    const updated = envelopeModule.updateEnvelope(stored, { id: "indexed-one", notes: "alterado" }, { now: () => "2026-09-27T12:01:00.000Z", mutationId: "indexed-update" });
    await repository.put(updated, { expectedRevision: 0 });
    let conflictCode = null;
    try {
      await repository.put(updated, { expectedRevision: 0 });
    } catch (error) {
      conflictCode = error.code;
    }

    const duplicate = envelopeModule.createEnvelope({ id: "batch-duplicate", systemId: "dnd5e", schemaVersion: 8, displayName: "Duplicado", mutationId: "batch-mutation", data: { id: "batch-duplicate" } }, { now });
    let rollbackCode = null;
    try {
      await repository.commitLegacyImport({
        receipt: { id: "receipt:rollback", completedAt: now() },
        records: [
          { envelope: duplicate, recovery: { id: "backup:first" } },
          { envelope: duplicate, recovery: { id: "backup:second" } },
        ],
        quarantined: [],
      });
    } catch (error) {
      rollbackCode = error.code;
    }
    const response = {
      mutationId: stored.mutationId,
      revision: (await repository.get("indexed-one")).revision,
      conflictCode,
      rollbackCode,
      batchRecordPresent: Boolean(await repository.get("batch-duplicate")),
      receiptPresent: Boolean(await repository.getReceipt("receipt:rollback")),
      firstBackupPresent: Boolean(await repository.getMigrationBackup("backup:first")),
    };
    database.close();
    return response;
  });

  expect(result).toEqual({
    mutationId: "indexed-create",
    revision: 1,
    conflictCode: "revision-conflict",
    rollbackCode: "import-transaction-failed",
    batchRecordPresent: false,
    receiptPresent: false,
    firstBackupPresent: false,
  });
});


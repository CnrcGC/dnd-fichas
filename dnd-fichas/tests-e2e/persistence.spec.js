import { test, expect } from "@playwright/test";
import { Buffer } from "node:buffer";

test("MVP-02 reload usa a edição IndexedDB mesmo com bootstrap legado desatualizado", async ({ page }) => {
  await page.goto("/dnd5e/characters/new");
  await page.getByRole("button", { name: "Pular e criar ficha em branco" }).click();
  await page.getByLabel("Editar nome do personagem").fill("Versão durável mais recente");
  await expect(page.getByRole("status").filter({ hasText: "Alterações salvas neste dispositivo." })).toBeVisible();
  await page.evaluate(async () => {
    const { openPlatformDatabase, IndexedDbCharacterRepository } = await import("/src/platform/persistence/characterRepository.js");
    const database = await openPlatformDatabase();
    const [record] = await new IndexedDbCharacterRepository(database).list({ systemId: "dnd5e" });
    localStorage.setItem("pilares-de-atlas:fichas", JSON.stringify([{ ...record.data, nome: "Legado antigo", status: { ...record.data.status, ca: 99 } }]));
    database.close();
  });
  await page.reload();
  await expect(page.getByLabel("Editar nome do personagem")).toHaveValue("Versão durável mais recente");
  await expect(page.getByRole("heading", { name: "Ficha de Legado antigo" })).toHaveCount(0);
});

test("MVP-02 só confirma put após commit e rejeita aborto após sucesso do request", async ({ page }) => {
  await page.goto("/dnd5e");
  await expect(page.getByRole("heading", { name: /Personagens D&D/ })).toBeVisible();
  const result = await page.evaluate(async () => {
    const { openPlatformDatabase, IndexedDbCharacterRepository } = await import("/src/platform/persistence/characterRepository.js");
    const { createEnvelope } = await import("/src/platform/persistence/envelope.js");
    const database = await openPlatformDatabase();
    const repository = new IndexedDbCharacterRepository(database);
    const original = IDBObjectStore.prototype.put;
    IDBObjectStore.prototype.put = function put(...args) {
      const request = original.apply(this, args);
      const transaction = this.transaction;
      request.addEventListener("success", () => transaction.abort());
      return request;
    };
    let rejected = false;
    try {
      await repository.put(createEnvelope({ id: "abort-after-request", systemId: "dnd5e", schemaVersion: 8, displayName: "Aborto", data: { id: "abort-after-request" } }));
    } catch { rejected = true; }
    finally { IDBObjectStore.prototype.put = original; }
    const present = Boolean(await repository.get("abort-after-request"));
    database.close();
    return { rejected, present };
  });
  expect(result).toEqual({ rejected: true, present: false });
});

test("MVP-02 anuncia falha, recupera a gravação e reabre a edição durável", async ({ page }) => {
  await page.addInitScript(() => {
    window.__failCharacterWrites = false;
    const original = IDBObjectStore.prototype.put;
    IDBObjectStore.prototype.put = function put(...args) {
      if (this.name === "characters" && window.__failCharacterWrites) throw new DOMException("Sem espaço", "QuotaExceededError");
      return original.apply(this, args);
    };
  });
  await page.goto("/dnd5e/characters/new");
  await page.getByRole("button", { name: "Pular e criar ficha em branco" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Alterações salvas neste dispositivo." })).toBeVisible();
  await page.evaluate(() => { window.__failCharacterWrites = true; });
  await page.getByLabel("Editar nome do personagem").fill("Nome recuperado");
  await expect(page.getByRole("alert")).toContainText("Suas alterações não foram salvas");
  await expect(page.getByRole("alert")).toContainText("cheio");
  await expect(page.getByRole("status").filter({ hasText: "Alterações salvas neste dispositivo." })).toHaveCount(0);
  await page.evaluate(() => { window.__failCharacterWrites = false; });
  await page.getByRole("button", { name: "Tentar novamente" }).click();
  await expect(page.getByRole("alert")).toHaveCount(0);
  await expect(page.getByRole("status").filter({ hasText: "Alterações salvas neste dispositivo." })).toBeVisible();
  await page.reload();
  await expect(page.getByLabel("Editar nome do personagem")).toHaveValue("Nome recuperado");
});

test("MVP-02 importar versão futura mostra erro e não cria nem altera fichas", async ({ page }) => {
  await page.goto("/dnd5e");
  await expect(page.getByRole("heading", { name: "Personagens D&D: 0" })).toBeVisible();
  await page.locator('input[type="file"]').setInputFiles({ name: "futura.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify({ id: "future-import", nome: "Futura", versaoFicha: 99 })) });
  await expect(page.getByRole("alert")).toContainText("versão mais recente");
  await expect(page.getByRole("heading", { name: "Personagens D&D: 0" })).toBeVisible();
});

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


import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { importCharacter, waitForSave } from "./helpers/dnd.js";
import { setRange } from "./helpers/preferences.js";

async function moveToTrash(page) {
  await importCharacter(page);
  const id = new URL(page.url()).pathname.split("/").at(-1);
  await page.getByRole("link", { name: "Personagens", exact: true }).click();
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Excluir Personagem de teste", exact: true }).click();
  await waitForSave(page);
  await expect(page.getByRole("button", { name: "Restaurar Personagem de teste", exact: true })).toBeVisible();
  return id;
}

async function readDeleted(page, id) {
  return page.evaluate(async (recordId) => {
    const { openPlatformDatabase, IndexedDbCharacterRepository, permanentDeletionReceiptId } = await import("/src/platform/persistence/characterRepository.js");
    const db = await openPlatformDatabase();
    const repo = new IndexedDbCharacterRepository(db);
    const result = { record: await repo.get(recordId), backup: await repo.getMigrationBackup("trash-backup"), receipt: await repo.getReceipt(permanentDeletionReceiptId(recordId)) };
    db.close();
    return result;
  }, id);
}

test("lixeira confirma por teclado, permite cancelar e não reaparece após reload", async ({ page }) => {
  const id = await moveToTrash(page);
  const remove = page.getByRole("button", { name: "Excluir permanentemente Personagem de teste", exact: true });
  page.once("dialog", (dialog) => dialog.dismiss());
  await remove.click();
  expect((await readDeleted(page, id)).record.deletedAt).toBeTruthy();
  await remove.focus();
  page.once("dialog", async (dialog) => {
    expect(dialog.message()).toContain("Esta ação não pode ser desfeita");
    await dialog.accept();
  });
  await remove.press("Enter");
  await expect(page.getByRole("status").filter({ hasText: "foi excluída permanentemente" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Seus personagens", exact: true })).toBeFocused();
  const stored = await readDeleted(page, id);
  expect(stored.record).toBeUndefined();
  expect(stored.receipt.recordId).toBe(id);
  await page.reload();
  await expect(page.getByRole("heading", { name: "Lixeira", exact: true })).toHaveCount(0);
  await expect(page.getByText("0 personagens", { exact: true })).toBeVisible();
});

test("lixeira reverte transação abortada, mantém recuperação e permite nova tentativa", async ({ page }) => {
  const id = await moveToTrash(page);
  await page.evaluate(async (recordId) => {
    const { openPlatformDatabase, IndexedDbCharacterRepository } = await import("/src/platform/persistence/characterRepository.js");
    const db = await openPlatformDatabase();
    await new IndexedDbCharacterRepository(db).putMigrationBackup({ id: "trash-backup", systemId: "dnd5e", recordId, original: { nome: "Recuperação" } });
    db.close();
    const original = IndexedDbCharacterRepository.prototype.transaction;
    window.restoreTrashTransaction = () => { IndexedDbCharacterRepository.prototype.transaction = original; };
    IndexedDbCharacterRepository.prototype.transaction = function (stores, mode) {
      const transaction = original.call(this, stores, mode);
      if (mode === "readwrite" && stores.includes("characters") && stores.includes("migrationBackups")) {
        const characters = transaction.objectStore("characters");
        const remove = characters.delete.bind(characters);
        characters.delete = (key) => {
          const request = remove(key);
          request.addEventListener("success", () => transaction.abort());
          return request;
        };
      }
      return transaction;
    };
  }, id);
  const remove = page.getByRole("button", { name: "Excluir permanentemente Personagem de teste", exact: true });
  page.once("dialog", (dialog) => dialog.accept());
  await remove.click();
  await expect(page.getByRole("alert")).toContainText("Ela permanece na lixeira");
  await expect(page.getByRole("alert")).toBeFocused();
  const failed = await readDeleted(page, id);
  expect(failed.record.deletedAt).toBeTruthy();
  expect(failed.backup.original.nome).toBe("Recuperação");
  expect(failed.receipt).toBeUndefined();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.evaluate(() => window.restoreTrashTransaction());
  page.once("dialog", (dialog) => dialog.accept());
  await remove.click();
  await expect(remove).toHaveCount(0);
  const stored = await readDeleted(page, id);
  expect(stored.record).toBeUndefined();
  expect(stored.backup).toBeUndefined();
});

test("lixeira preserva outra ficha, restauração e foco com texto ampliado", async ({ page }) => {
  const id = await moveToTrash(page);
  await importCharacter(page, { nome: "Segunda ficha" });
  await page.getByRole("link", { name: "Personagens", exact: true }).click();
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Excluir Segunda ficha", exact: true }).click();
  await waitForSave(page);
  await page.getByRole("button", { name: "Configurações de acessibilidade", exact: true }).click();
  await setRange(page, "Tamanho do texto", 28);
  await page.keyboard.press("Escape");
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Excluir permanentemente Personagem de teste", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Lixeira", exact: true })).toBeFocused();
  expect((await readDeleted(page, id)).record).toBeUndefined();
  await expect(page.getByRole("button", { name: "Restaurar Segunda ficha", exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.getByRole("button", { name: "Restaurar Segunda ficha", exact: true }).click();
  await waitForSave(page);
  await expect(page.getByRole("link", { name: "Acessar ficha de Segunda ficha", exact: true })).toBeVisible();
});

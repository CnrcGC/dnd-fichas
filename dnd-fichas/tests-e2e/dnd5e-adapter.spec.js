import { test, expect } from "@playwright/test";
import { fileURLToPath } from "node:url";

const fixturePath = fileURLToPath(new URL("../tests/fixtures/dnd5e/legacy-character-v8.json", import.meta.url));

async function readDurableCharacter(page, id) {
  return page.evaluate(async (characterId) => {
    const database = await new Promise((resolve, reject) => {
      const request = indexedDB.open("rpg-platform", 2);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    const record = await new Promise((resolve, reject) => {
      const request = database.transaction("characters").objectStore("characters").get(characterId);
      request.onsuccess = () => resolve(request.result ?? null);
      request.onerror = () => reject(request.error);
    });
    database.close();
    return record;
  }, id);
}

test("FE-04A cria, edita, espelha e prepara impressão D&D", async ({ page }) => {
  await page.goto("/dnd5e/characters/new");
  await expect(page.getByRole("heading", { name: "Criar personagem D&D 5e" })).toBeVisible();
  await page.getByRole("button", { name: "Pular e criar ficha em branco" }).click();
  await expect(page).toHaveURL(/\/dnd5e\/characters\/[^/]+$/);

  const id = decodeURIComponent(new URL(page.url()).pathname.split("/").at(-1));
  const name = page.getByLabel("Editar nome do personagem");
  await name.fill("Ayla Persistente");
  await expect(page.getByRole("heading", { name: "Ficha de Ayla Persistente" })).toBeVisible();
  await expect.poll(async () => (await readDurableCharacter(page, id))?.data?.nome).toBe("Ayla Persistente");

  await page.evaluate(() => {
    window.__printCalled = false;
    window.print = () => { window.__printCalled = true; };
  });
  await page.getByRole("button", { name: "Imprimir / Salvar em PDF" }).click();
  await expect.poll(() => page.evaluate(() => window.__printCalled)).toBe(true);
  await expect(page.locator(".ficha-impressao")).toContainText("Ayla Persistente");
});

test("FE-04A mantém o leitor de exportação v8 na biblioteca D&D", async ({ page }) => {
  await page.goto("/dnd5e");
  await page.locator('input[type="file"]').setInputFiles(fixturePath);
  await expect(page.getByRole("heading", { name: "Ficha de Lyra Vento-Norte" })).toBeVisible();
  await expect(page.getByLabel("Editar nome do personagem")).toHaveValue("Lyra Vento-Norte");
});

test("FE-04B exclui para a lixeira e restaura após recarregar", async ({ page }) => {
  await page.goto("/dnd5e/characters/new");
  await page.getByRole("button", { name: "Pular e criar ficha em branco" }).click();
  await page.getByLabel("Editar nome do personagem").fill("Ficha Recuperável");
  await page.goto("/dnd5e");

  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Excluir Ficha Recuperável" }).click();
  await expect(page.getByText("Ficha Recuperável")).toBeVisible();
  await expect(page.getByRole("button", { name: "Restaurar" })).toBeVisible();

  await page.reload();
  await expect(page.getByRole("button", { name: "Restaurar" })).toBeVisible();
  await page.getByRole("button", { name: "Restaurar" }).click();
  await expect(page.getByRole("link", { name: "Acessar ficha" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Restaurar" })).toHaveCount(0);
});

test("FE-04B preserva o aviso visível quando a gravação durável falha", async ({ page }) => {
  await page.addInitScript(() => {
    const original = IDBObjectStore.prototype.put;
    IDBObjectStore.prototype.put = function put(value, key) {
      if (this.name === "characters") throw Object.assign(new Error("falha IndexedDB"), { name: "QuotaExceededError" });
      return original.call(this, value, key);
    };
  });
  await page.goto("/dnd5e/characters/new");
  await page.getByRole("button", { name: "Pular e criar ficha em branco" }).click();
  await expect(page.getByRole("alert")).toContainText("Suas alterações não foram salvas");
  await expect(page.getByRole("button", { name: "Tentar novamente" })).toBeVisible();
});


import { test, expect } from "@playwright/test";

async function seedPlatformRecords(page, records) {
  await page.goto("/");
  await page.evaluate(async (seedRecords) => {
    const database = await new Promise((resolve, reject) => {
      const opening = indexedDB.open("rpg-platform", 2);
      opening.onupgradeneeded = () => {
        const db = opening.result;
        const characters = db.createObjectStore("characters", { keyPath: "id" });
        characters.createIndex("systemId", "systemId", { unique: false });
        characters.createIndex("updatedAt", "updatedAt", { unique: false });
        db.createObjectStore("migrationReceipts", { keyPath: "id" });
        db.createObjectStore("quarantine", { keyPath: "id" });
        db.createObjectStore("migrationBackups", { keyPath: "id" });
      };
      opening.onsuccess = () => resolve(opening.result);
      opening.onerror = () => reject(opening.error);
    });
    const transaction = database.transaction("characters", "readwrite");
    for (const record of seedRecords) transaction.objectStore("characters").put(record);
    await new Promise((resolve, reject) => {
      transaction.oncomplete = resolve;
      transaction.onerror = () => reject(transaction.error);
    });
    database.close();
  }, records);
}

test("entrada abre D&D mesmo quando a preferência legada aponta para outro sistema", async ({ page }) => {
  await page.goto("/yusong");
  await expect(page.getByRole("heading", { name: "Personagens de Pilares de Atlas" })).toBeVisible();
  await page.goto("/");
  await expect(page).toHaveURL(/\/dnd5e$/);
  await expect(page.getByRole("heading", { name: /Personagens D&D/ })).toBeVisible();
});

test("navegação ativa oferece somente fluxos D&D disponíveis", async ({ page }) => {
  await page.goto("/dnd5e");
  const navegacao = page.getByRole("navigation", { name: "Navegação D&D 5e" });
  await expect(page.getByLabel("Sistema ativo")).toHaveCount(0);
  await expect(navegacao.getByRole("link", { name: "Personagens" })).toBeVisible();
  await expect(navegacao.getByRole("link", { name: "Novo personagem" })).toBeVisible();
  await expect(navegacao.getByRole("link", { name: "Criaturas" })).toHaveCount(0);
  await expect(navegacao.getByRole("link", { name: "Encontros" })).toHaveCount(0);
});

test("refresh direto mantém seção, título e landmark", async ({ page }) => {
  await page.goto("/feiticeiros-maldicoes/creatures");
  await page.reload();
  await expect(page.getByRole("main")).toBeVisible();
  await expect(page.getByRole("heading", { name: /Criaturas — Feiticeiros & Maldições/ })).toBeVisible();
  await expect(page).toHaveTitle(/Criaturas — Feiticeiros & Maldições · D&D Fichas/);
});

test("rotas D&D legadas redirecionam sem perder o identificador", async ({ page }) => {
  await page.goto("/characters/new");
  await expect(page).toHaveURL(/\/dnd5e\/characters\/new$/);
  await page.goto("/nova");
  await expect(page).toHaveURL(/\/dnd5e\/characters\/new$/);
  await page.goto("/ficha/personagem-legado");
  await expect(page).toHaveURL(/\/dnd5e\/characters\/personagem-legado$/);
  await expect(page.getByText(/Essa ficha não existe ou foi removida/)).toBeVisible();
});

test("aliases genéricos de ferramentas apontam somente para D&D", async ({ page }) => {
  await page.goto("/creatures");
  await expect(page).toHaveURL(/\/dnd5e\/creatures$/);
  await expect(page.getByRole("heading", { name: "Criaturas — D&D 5e" })).toBeVisible();

  await page.goto("/encounters");
  await expect(page).toHaveURL(/\/dnd5e\/encounters$/);
  await expect(page.getByRole("heading", { name: "Encontros — D&D 5e" })).toBeVisible();
});

test("rota genérica ausente mostra estado explícito", async ({ page }) => {
  await page.goto("/characters/personagem-inexistente");
  await expect(page.getByRole("heading", { name: "Personagem não encontrado" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Voltar aos personagens D&D" })).toHaveAttribute("href", "/dnd5e");
});

test("rota genérica diferencia sistema desconhecido, corrupção e versão futura", async ({ page }) => {
  const timestamp = "2026-09-27T12:00:00.000Z";
  await seedPlatformRecords(page, [
    { platformVersion: 1, id: "unknown-system", systemId: "outro", schemaVersion: 1, displayName: "Outro", createdAt: timestamp, updatedAt: timestamp, revision: 0, data: { id: "unknown-system" } },
    { platformVersion: 1, id: "corrupt", systemId: "dnd5e", schemaVersion: 8, displayName: "Corrompido", createdAt: timestamp, updatedAt: timestamp, revision: 0, data: null },
    { platformVersion: 1, id: "future", systemId: "dnd5e", schemaVersion: 99, displayName: "Futuro", createdAt: timestamp, updatedAt: timestamp, revision: 0, data: { id: "future", nome: "Futuro", versaoFicha: 99 } },
  ]);

  await page.goto("/characters/unknown-system");
  await expect(page.getByRole("heading", { name: "Sistema não suportado" })).toBeVisible();
  await page.goto("/characters/corrupt");
  await expect(page.getByRole("heading", { name: "Registro corrompido" })).toBeVisible();
  await page.goto("/characters/future");
  await expect(page.getByRole("heading", { name: "Versão mais recente do que este aplicativo" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Exportar registro original" })).toBeVisible();
});


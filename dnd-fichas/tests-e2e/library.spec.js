import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { Buffer } from "node:buffer";

test("MVP-03 biblioteca busca, exporta e importa uma cópia sem sobrescrever", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Você ainda não tem nenhuma ficha.")).toBeVisible();
  await page.getByRole("link", { name: "+ Novo personagem" }).click();
  await page.getByRole("button", { name: "Pular e criar ficha em branco" }).click();
  await page.getByLabel("Editar nome do personagem").fill("Aurora da Biblioteca");
  await expect(page.getByRole("status").filter({ hasText: "Alterações salvas neste dispositivo." })).toBeVisible();
  await page.getByRole("link", { name: "Personagens", exact: true }).click();
  await page.getByLabel("Buscar ficha").fill("AURORA");
  await expect(page.getByRole("link", { name: "Acessar ficha de Aurora da Biblioteca" })).toBeVisible();
  await page.getByLabel("Buscar ficha").fill("inexistente");
  await expect(page.getByText('Nenhuma ficha encontrada para "inexistente".')).toBeVisible();
  await page.getByLabel("Buscar ficha").clear();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Exportar Aurora da Biblioteca" }).click();
  const download = await downloadPromise;
  const json = await readFile(await download.path(), "utf8");
  expect(JSON.parse(json).nome).toBe("Aurora da Biblioteca");
  await page.getByLabel("Arquivo JSON da ficha").setInputFiles({ name: "backup.json", mimeType: "application/json", buffer: Buffer.from(json) });
  await expect(page.getByRole("heading", { name: "Ficha de Aurora da Biblioteca" })).toBeVisible();
  expect(decodeURIComponent(new URL(page.url()).pathname.split("/").at(-1))).not.toBe(JSON.parse(json).id);
  await expect(page.getByRole("status").filter({ hasText: "Alterações salvas neste dispositivo." })).toBeVisible();
  await page.getByRole("link", { name: "Personagens", exact: true }).click();
  await expect(page.getByText("2 personagens", { exact: true })).toBeVisible();
});

test("MVP-03 JSON inválido informa correção e preserva a biblioteca", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("0 personagens", { exact: true })).toBeVisible();
  await page.getByLabel("Arquivo JSON da ficha").setInputFiles({ name: "invalido.json", mimeType: "application/json", buffer: Buffer.from("{incompleto") });
  await expect(page.getByRole("alert")).toContainText("JSON inválido");
  await expect(page.getByText("0 personagens", { exact: true })).toBeVisible();
});

import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { Buffer } from "node:buffer";

test("RELEASE-01 Pages entrega assets e recupera 404 de ficha com query/hash", async ({ page, baseURL, request }) => {
  const root = new URL(baseURL);
  expect((await request.get(new URL("favicon.svg", root).href)).status()).toBe(200);
  const source = JSON.parse(await readFile("docs/demo/03-mago-nivel-4.json", "utf8"));
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(baseURL);
  await expect(page.getByRole("heading", { name: /Personagens D&D/ })).toBeVisible();
  await expect(page.getByRole("img", { name: "D&D Fichas" })).toBeVisible();
  expect(await page.getByRole("img", { name: "D&D Fichas" }).evaluate((image) => image.naturalWidth)).toBeGreaterThan(0);
  await page.getByLabel("Arquivo JSON da ficha").setInputFiles({ name: "demo.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify(source)) });
  await expect(page.getByRole("heading", { name: `Ficha de ${source.nome}` })).toBeVisible();
  await expect(page.getByRole("status").filter({ hasText: "Alterações salvas neste dispositivo." })).toBeVisible();
  const direct = page.url() + "?demo=a%26b#notas";
  const fallback = await request.get(direct, { headers: { Accept: "text/html" } });
  expect(fallback.status()).toBe(404);
  expect(await fallback.text()).toContain("__dnd_route");
  await page.goto(direct);
  await expect(page.getByRole("heading", { name: `Ficha de ${source.nome}` })).toBeVisible();
  await expect(page).toHaveURL(direct);
  await page.reload();
  await expect(page.getByRole("heading", { name: `Ficha de ${source.nome}` })).toBeVisible();
  await expect(page).toHaveURL(direct);
  await page.getByRole("link", { name: "Personagens", exact: true }).click();
  expect(new URL(page.url()).pathname).toBe(root.pathname + "dnd5e");
  await page.getByRole("main").getByRole("link", { name: "+ Novo personagem", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Criar personagem D&D 5e", exact: true })).toBeVisible();
  expect(errors).toEqual([]);
  const missingAsset = await request.get(new URL("assets/ausente.js", root).href);
  expect(missingAsset.status()).toBe(404);
  expect(missingAsset.headers()["content-type"]).toContain("text/plain");
});

test("RELEASE-01 Pages preserva rotas legadas e página ausente", async ({ page, baseURL }) => {
  await page.goto(new URL("nova", baseURL).href);
  await expect(page.getByRole("heading", { name: "Criar personagem D&D 5e" })).toBeVisible();
  await expect(page).toHaveURL(new URL("dnd5e/characters/new", baseURL).href);
  await page.goto(new URL("ficha/personagem-legado", baseURL).href);
  await expect(page).toHaveURL(new URL("dnd5e/characters/personagem-legado", baseURL).href);
  await expect(page.getByText(/Essa ficha não existe ou foi removida/)).toBeVisible();
  await page.goto(new URL("endereco-ausente", baseURL).href);
  await expect(page.getByRole("heading", { name: "Página não encontrada" })).toBeVisible();
});

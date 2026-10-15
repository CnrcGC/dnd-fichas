import { test, expect } from "@playwright/test";
import { Buffer } from "node:buffer";
import AxeBuilder from "@axe-core/playwright";
import { mkdir, readFile } from "node:fs/promises";
import { importCharacter, readCharacter, waitForSave } from "./helpers/dnd.js";

const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=", "base64");

test("rolagem distribui resultados repetidos e salva a geração ao criar/reabrir", async ({ page }) => {
  await page.goto("/dnd5e/characters/new");
  for (let etapa = 0; etapa < 3; etapa++) await page.getByRole("button", { name: "Pular esta etapa →", exact: true }).click();
  await page.getByLabel("Método dos atributos").selectOption("rolagem");
  await expect(page.getByRole("button", { name: "Próximo", exact: true })).toBeDisabled();
  await page.evaluate(() => {
    const dados = [1, 1, 6, 6, 1, 2, 3, 4, ...Array(16).fill(6)];
    const original = Math.random;
    Math.random = () => dados.length ? (dados.shift() - 0.5) / 6 : original();
  });
  await page.getByRole("button", { name: "Rolar os seis atributos", exact: true }).click();
  await expect(page.getByRole("list", { name: "Resultados das rolagens de atributos" }).getByRole("listitem")).toHaveCount(6);
  await expect(page.getByLabel("Valor base de Força")).toHaveValue("0");
  await page.getByLabel("Valor base de Força").selectOption("5");
  await expect(page.getByLabel("Valor base de Carisma")).toHaveValue("0");
  await page.getByRole("button", { name: "Próximo", exact: true }).click();
  await page.getByLabel("Personagem", { exact: true }).fill("Dados do aventureiro");
  await page.getByLabel("Imagem do personagem", { exact: true }).setInputFiles({ name: "heroi.png", mimeType: "image/png", buffer: png });
  await expect(page.getByText("Imagem adicionada à ficha.", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Finalizar", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Ficha de Dados do aventureiro", exact: true })).toBeVisible();
  await waitForSave(page);
  const criada = await readCharacter(page);
  expect(criada.metodoAtributos).toBe("rolagem");
  expect(criada.atributos.forca).toBe(18); expect(criada.atributos.carisma).toBe(13);
  expect(criada.rolagensAtributos.resultados.map((r) => r.total)).toEqual([13, 9, 18, 18, 18, 18]);
  expect(criada.rolagensAtributos.distribuicao).toEqual([5, 1, 2, 3, 4, 0]);
  expect(criada.retrato).toMatch(/^data:image\/jpeg;base64,/);
  await page.reload();
  await expect(page.getByRole("img", { name: "Retrato de Dados do aventureiro", exact: true })).toBeVisible();
  await expect(page.getByLabel("Valor base de Força")).toHaveValue("18");
});

test("atributos limitados a total 30, PV máximo protegido e idiomas reversíveis", async ({ page }) => {
  await importCharacter(page);
  const forca = page.getByLabel("Valor base de Força", { exact: true });
  await forca.fill("999999999"); await forca.press("Tab");
  await expect(forca).toHaveValue("29"); // Humano: +1 racial, total máximo 30.
  await forca.fill("-8"); await forca.press("Tab"); await expect(forca).toHaveValue("1");
  await expect(page.getByLabel("PV máximo", { exact: true })).toHaveJSProperty("readOnly", true);
  await page.getByLabel("PV atual", { exact: true }).fill("9999999");
  await expect(page.getByLabel("PV atual", { exact: true })).toHaveValue("40");
  await page.getByRole("tab", { name: "Proficiências", exact: true }).click();
  const idiomas = page.locator("details").filter({ has: page.getByRole("heading", { name: "Idiomas", exact: true }) });
  await idiomas.locator("summary").focus(); await page.keyboard.press("Enter");
  const elfico = idiomas.getByRole("checkbox", { name: "Élfico", exact: true });
  await elfico.check(); await expect(elfico).toBeChecked();
  await elfico.uncheck(); await expect(elfico).not.toBeChecked();
  await waitForSave(page);
  expect((await readCharacter(page)).idiomas).not.toContain("elfico");
  await page.reload();
  await page.getByRole("tab", { name: "Proficiências", exact: true }).click();
  await idiomas.locator("summary").click(); await expect(elfico).not.toBeChecked();
  const pericias = page.locator("details").filter({ has: page.getByRole("heading", { name: "Perícias", exact: true }) });
  await expect(pericias).toHaveAttribute("open", "");
  await pericias.locator("summary").focus(); await page.keyboard.press("Space");
  await expect(pericias).not.toHaveAttribute("open");
  await pericias.locator("summary").press("Enter"); await expect(pericias).toHaveAttribute("open", "");
  for (const titulo of ["Proficiências de combate", "Ferramentas"]) {
    const secao = page.locator("details").filter({ has: page.getByRole("heading", { name: titulo, exact: true }) });
    await expect(secao).not.toHaveAttribute("open");
    await secao.locator("summary").press("Enter"); await expect(secao).toHaveAttribute("open", "");
  }
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test("idioma de criação pode ser limpo ou substituído sem ressurgir", async ({ page }) => {
  await importCharacter(page, { escolhasCriacao: { idiomasRaca: ["elfico"] } });
  const escolha = page.getByLabel("Idiomas da raça, escolha 1 de 1", { exact: true });
  await expect(escolha).toHaveValue("elfico");
  await escolha.selectOption(""); await expect(escolha).toHaveValue("");
  await waitForSave(page); expect((await readCharacter(page)).idiomas).not.toContain("elfico");
  await escolha.selectOption("anao"); await waitForSave(page);
  expect((await readCharacter(page)).idiomas).toContain("anao");
  await page.reload(); await expect(escolha).toHaveValue("anao");
});

test("Instinto Selvagem exige sete níveis de Bárbaro", async ({ page }) => {
  for (const nivel of [1, 7]) {
    await importCharacter(page, { classeId: "barbaro", subclasseId: null, nivel });
    await page.getByRole("tab", { name: "Habilidades", exact: true }).click();
    await page.getByRole("button", { name: "Adicionar Habilidade", exact: true }).click();
    const dialog = page.getByRole("dialog", { name: "Adicionar Habilidade", exact: true });
    const adicionar = dialog.getByRole("button", { name: "Adicionar Instinto Selvagem", exact: true });
    if (nivel === 1) {
      await expect(adicionar).toBeDisabled();
      await dialog.getByRole("button", { name: /Instinto Selvagem Nível 7/ }).click();
      await expect(dialog.getByText("Requer nível 7 nesta classe.", { exact: true })).toBeVisible();
      expect((await new AxeBuilder({ page }).include('[role="dialog"]').analyze()).violations).toEqual([]);
    } else await expect(adicionar).toBeEnabled();
    await page.keyboard.press("Escape");
  }
});

test("retrato local valida arquivo, persiste, exporta/importa, imprime e remove", async ({ page }, testInfo) => {
  await importCharacter(page);
  const arquivo = page.getByLabel("Imagem do personagem", { exact: true });
  await arquivo.setInputFiles({ name: "invalido.svg", mimeType: "image/svg+xml", buffer: Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"/>') });
  await expect(page.getByRole("alert")).toContainText("Escolha uma imagem PNG, JPEG ou WebP.");
  await arquivo.setInputFiles({ name: "grande.png", mimeType: "image/png", buffer: Buffer.alloc(5 * 1024 * 1024 + 1) });
  await expect(page.getByRole("alert")).toContainText("até 5 MB");
  await arquivo.setInputFiles({ name: "heroi.png", mimeType: "image/png", buffer: png });
  const imagem = page.locator(".personagem-retrato").getByRole("img", { name: "Retrato de Personagem de teste", exact: true });
  await expect(imagem).toBeVisible(); await waitForSave(page);
  const original = (await readCharacter(page)).retrato;
  expect(original.length).toBeLessThanOrEqual(400000);
  expect(await imagem.evaluate((img) => img.complete && img.naturalWidth > 0 && img.naturalWidth <= 512)).toBe(true);
  await page.reload(); await expect(imagem).toBeVisible();
  await page.emulateMedia({ media: "print" });
  await expect(page.locator(".ficha-impressao-retrato")).toBeVisible();
  await mkdir("output/character-editing", { recursive: true });
  if (testInfo.project.name === "chromium-desktop") {
    const pdf = await page.pdf({ path: "output/character-editing/retrato.pdf", format: "A4", printBackground: true });
    expect(pdf.subarray(0, 5).toString()).toBe("%PDF-");
  }
  await page.emulateMedia({ media: "screen" });
  await mkdir("output/character-editing", { recursive: true });
  await page.screenshot({ path: `output/character-editing/retrato-${testInfo.project.name}.png`, fullPage: true });
  await page.goto("/dnd5e");
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Exportar Personagem de teste", exact: true }).click();
  const exported = JSON.parse(await readFile(await (await download).path(), "utf8"));
  expect(exported.retrato).toBe(original);
  await page.getByLabel("Arquivo JSON da ficha").setInputFiles({ name: "retrato.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify(exported)) });
  await expect(page.getByRole("heading", { name: "Ficha de Personagem de teste", exact: true })).toBeVisible();
  await expect(imagem).toBeVisible(); await waitForSave(page);
  expect((await readCharacter(page)).retrato).toBe(original);
  await page.getByRole("button", { name: "Alterar imagem do personagem", exact: true }).focus();
  await page.keyboard.press("Tab");
  const remover = page.getByRole("button", { name: "Remover imagem", exact: true });
  await expect(remover).toBeFocused();
  await remover.press("Space");
  await expect(page.getByRole("button", { name: "Adicionar imagem do personagem", exact: true })).toBeFocused();
  await expect(imagem).toHaveCount(0); await waitForSave(page);
  await page.reload(); await expect(imagem).toHaveCount(0);
  expect((await readCharacter(page)).retrato).toBe("");
});

import { test, expect } from "@playwright/test";
import { mkdir, readFile } from "node:fs/promises";
import process from "node:process";
import { Buffer } from "node:buffer";
import { setTheme } from "../tests-e2e/helpers/preferences.js";

const files = ["01-guerreiro-nivel-1", "02-guerreiro-nivel-4", "03-mago-nivel-4"];
const saved = (page) => expect(page.getByRole("status").filter({ hasText: "Alterações salvas neste dispositivo." })).toBeVisible();
async function exportCharacter(page, name) {
  await page.getByRole("link", { name: "Personagens", exact: true }).click();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: `Exportar ${name}`, exact: true }).click();
  const download = await downloadPromise;
  return JSON.parse(await readFile(await download.path(), "utf8"));
}
async function importCharacter(page, data, baseURL) {
  await page.goto(baseURL);
  await expect(page.getByRole("heading", { name: "Seus personagens", exact: true })).toBeVisible();
  await page.getByLabel("Arquivo JSON da ficha").setInputFiles({ name: "demo.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify(data)) });
  await expect(page.getByRole("heading", { name: `Ficha de ${data.nome}` })).toBeVisible();
  await saved(page);
}
for (let rehearsal = 1; rehearsal <= 2; rehearsal++) {
  for (const file of files) {
    test(`MVP-08/DEMO-01/RELEASE-01 ensaio ${rehearsal}: ${file}`, async ({ browser, baseURL }) => {
      const context = await browser.newContext();
      // Internet e backend indisponíveis: todos os recursos funcionais vêm do preview.
      const localOnly = (route) => new URL(route.request().url()).origin === new URL(baseURL).origin ? route.continue() : route.abort();
      await context.route(/^https?:\/\//, localOnly);
      const page = await context.newPage();
      const source = JSON.parse(await readFile(`docs/demo/${file}.json`, "utf8"));
      await importCharacter(page, source, baseURL);
      const direct = page.url();
      await page.reload();
      await expect(page.getByRole("heading", { name: `Ficha de ${source.nome}` })).toBeVisible();
      await setTheme(page, "light");
      await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
      await setTheme(page, "dark");
      await page.evaluate(() => { window.print = () => { window.printCalled = true; }; });
      await page.getByRole("button", { name: "Imprimir / Salvar em PDF" }).click();
      expect(await page.evaluate(() => window.printCalled)).toBe(true);
      await page.emulateMedia({ media: "print" });
      await expect(page.locator(".ficha-impressao")).toBeVisible();
      await expect(page.locator(".ficha-shell")).toBeHidden();
      await expect(page.locator("header.topbar")).toBeHidden();
      await expect(page.locator(".skip-link")).toBeHidden();
      expect(await page.locator(".app-main").evaluate((element) => getComputedStyle(element).paddingBottom)).toBe("0px");
      expect(await page.locator("html").evaluate((element) => getComputedStyle(element).overflowY)).toBe("visible");
      expect(await page.locator("html").evaluate((element) => getComputedStyle(element).colorScheme)).toBe("light");
      expect(await page.locator("#root").evaluate((element) => element.scrollHeight <= element.clientHeight + 1)).toBe(true);
      if (rehearsal === 1 && test.info().project.name === "production-chrome") {
        const pdfDirectory = process.env.DND_PDF_DIRECTORY || "output/pdf";
        await mkdir(pdfDirectory, { recursive: true });
        await page.pdf({ path: `${pdfDirectory}/${file}.pdf`, format: "A4", printBackground: true, preferCSSPageSize: true, tagged: true });
      }
      await page.emulateMedia({ media: "screen" });
      await page.getByRole("button", { name: /Rolar teste de Força/ }).click();
      await expect(page.getByRole("status").filter({ hasText: /Teste de Força\. Resultado/ })).toHaveCount(1);
      await page.getByLabel("PV temporário", { exact: true }).fill("3");
      await page.getByRole("tab", { name: "Habilidades", exact: true }).click();
      if (source.classeId === "guerreiro") await page.getByRole("button", { name: "Retomar o Fôlego — uso 1", exact: true }).click();
      await page.getByRole("tab", { name: "Magias", exact: true }).click();
      if (source.classeId === "mago") {
        await page.getByLabel("Espaços usados de nível 1").fill("1");
        await page.getByRole("button", { name: "Concentrar", exact: true }).click();
      }
      await page.getByRole("tab", { name: "Inventário", exact: true }).click();
      await page.getByLabel("PO", { exact: true }).fill("30");
      await page.getByRole("tab", { name: "Notas", exact: true }).click();
      await page.getByLabel("Anotações livres").fill("Encontrar a torre ao amanhecer.");
      if (source.nivel === 4) {
        await page.getByRole("button", { name: "Subir de Nível" }).click();
        const dialog = page.getByRole("dialog", { name: "Subir de nível" });
        await dialog.getByRole("button", { name: /Usar média/ }).click();
        await dialog.getByRole("button", { name: "Próximo", exact: true }).click();
        if (source.classeId === "guerreiro") await dialog.getByRole("button", { name: "Próximo", exact: true }).click();
        await dialog.getByRole("button", { name: "Concluir level up" }).click();
        await expect(dialog).toHaveCount(0);
      }
      await saved(page);
      const exported = await exportCharacter(page, source.nome);
      expect(exported.moedas.ouro).toBe(30);
      expect(exported.notas).toBe("Encontrar a torre ao amanhecer.");
      expect(exported.nivel).toBe(source.nivel === 4 ? 5 : 1);
      await page.goto(direct);
      await expect(page.getByRole("heading", { name: `Ficha de ${source.nome}` })).toBeVisible();
      const cleanContext = await browser.newContext();
      await cleanContext.route(/^https?:\/\//, localOnly);
      const cleanPage = await cleanContext.newPage();
      await importCharacter(cleanPage, exported, baseURL);
      const recovered = await exportCharacter(cleanPage, source.nome);
      expect(recovered.id).not.toBe(exported.id);
      const stable = (data) => Object.fromEntries(Object.entries(data).filter(([key]) => !["id", "criadoEm"].includes(key)));
      expect(stable(recovered)).toEqual(stable(exported));
      await cleanContext.close();
      await context.close();
    });
  }
}

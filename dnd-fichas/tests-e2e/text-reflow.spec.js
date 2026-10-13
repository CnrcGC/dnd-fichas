import { test, expect } from "@playwright/test";
import { importCharacter } from "./helpers/dnd.js";
import { setTextSize } from "./helpers/preferences.js";
import { mkdir } from "node:fs/promises";
import process from "node:process";

async function assertReflow(page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  expect(await page.locator("body").evaluate((element) => element.scrollHeight <= element.clientHeight + 1)).toBe(true);
  const overflow = await page.locator("main").evaluate((main) => [...main.querySelectorAll("button, input, select, textarea")]
    .filter((element) => element.getClientRects().length && !element.closest("[hidden]"))
    .filter((element) => { const rect = element.getBoundingClientRect(); return rect.left < -1 || rect.right > window.innerWidth + 1; })
    .map((element) => element.getAttribute("aria-label") || element.closest("label")?.textContent.trim() || element.textContent || element.outerHTML));
  expect(overflow).toEqual([]);
  const labelsOutsideCards = await page.locator(".atributo-label, .validacao-status").evaluateAll((labels) => labels
    .filter((label) => {
      const rect = label.getBoundingClientRect();
      const card = label.closest(".atributo-card, .validacao-ficha").getBoundingClientRect();
      return rect.left < card.left || rect.right > card.right;
    }).map((label) => label.textContent));
  expect(labelsOutsideCards).toEqual([]);
}

for (const width of [320, 390, 768, 1280]) {
  test(`A11Y-02/05 texto ampliado em ${width}px persiste e mantém ações acessíveis`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    await importCharacter(page);
    const original = await page.locator("html").evaluate((element) => parseFloat(getComputedStyle(element).fontSize));
    await setTextSize(page, "extra-large");
    expect(await page.locator("html").evaluate((element) => parseFloat(getComputedStyle(element).fontSize))).toBe(original * 1.5);
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-text-size", "extra-large");
    await expect(page.getByRole("heading", { name: "Ficha de Personagem de teste" })).toBeVisible();
    const capture = async (name) => {
      if (testInfo.project.name === "chromium-desktop" && [390, 1280].includes(width)) {
        const directory = process.env.DND_SCREENSHOT_DIRECTORY || "output/screenshots";
        await mkdir(directory, { recursive: true });
        await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
        await page.screenshot({ path: `${directory}/${name}-${width}.png`, fullPage: true });
      }
    };
    await capture("ficha");
    for (const tab of ["Combate", "Habilidades", "Perícias", "Magias", "Inventário", "Notas"]) {
      await page.getByRole("tab", { name: tab, exact: true }).click();
      await expect(page.getByRole("tabpanel").locator("h2").first()).toBeVisible();
      await expect(page.getByRole("tabpanel").locator(".ficha-carregando-secao")).toHaveCount(0);
      await assertReflow(page);
    }
    await page.getByRole("button", { name: "Subir de Nível" }).click();
    const dialog = page.getByRole("dialog", { name: "Subir de nível" });
    const rect = await dialog.boundingBox();
    expect(rect.x).toBeGreaterThanOrEqual(0);
    expect(rect.x + rect.width).toBeLessThanOrEqual(width);
    expect(rect.y + rect.height).toBeLessThanOrEqual(900);
    await dialog.getByRole("button", { name: /Usar média/ }).click();
    await dialog.getByRole("button", { name: "Próximo", exact: true }).click();
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    await page.goto("/dnd5e");
    await expect(page.getByRole("heading", { name: "Seus personagens", exact: true })).toBeVisible();
    await assertReflow(page);
    const title = await page.locator(".ficha-card-nome").boundingBox();
    for (const action of ["Exportar", "Excluir"]) {
      const button = await page.getByRole("button", { name: new RegExp(`${action} Personagem de teste`) }).boundingBox();
      expect(button.y + button.height).toBeLessThanOrEqual(title.y);
    }
    await capture("biblioteca");
    await page.getByRole("main").getByRole("link", { name: "+ Novo personagem", exact: true }).click();
    for (const name of ["Meio-Elfo", "Clérigo", "Acólito"]) {
      await page.getByRole("button", { name: `Escolher ${name}`, exact: true }).click();
    }
    await page.getByRole("button", { name: "Próximo", exact: true }).click();
    await expect(page.getByLabel("Personagem", { exact: true })).toBeVisible();
    await assertReflow(page);
    await capture("criacao");
  });
}

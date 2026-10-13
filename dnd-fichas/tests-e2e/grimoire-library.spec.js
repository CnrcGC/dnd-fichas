import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir } from "node:fs/promises";
import { importCharacter, waitForSave } from "./helpers/dnd.js";
import { setTheme, setTextSize } from "./helpers/preferences.js";

for (const theme of ["light", "dark"]) {
  test(`VIS-G01/02 biblioteca ${theme}: capas, reflow e exclusão recuperável`, async ({ page }, testInfo) => {
    test.setTimeout(90_000);
    const width = testInfo.project.name === "chromium-desktop" ? 1280 : 390;
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/dnd5e");
    await setTheme(page, theme);
    await expect(page.getByLabel("Sistema ativo")).toHaveCount(0);
    await expect(page.getByRole("link", { name: /D&D Fichas/ })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Sua próxima aventura começa aqui" })).toBeVisible();
    await expect(page.getByText("0 personagens", { exact: true })).toBeVisible();
    await mkdir("output/visual-grimoire", { recursive: true });
    const capture = async (state) => {
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
      await page.screenshot({ path: `output/visual-grimoire/biblioteca-${theme}-${state}-${width}.png`, fullPage: true });
    };
    await capture("vazia");
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);

    await importCharacter(page, { nome: "Thorin Escudo de Ferro" });
    await page.getByRole("link", { name: "Personagens", exact: true }).click();
    await expect(page.getByText("1 personagem", { exact: true })).toBeVisible();
    await expect(page.getByRole("article")).toHaveCount(1);
    await capture("uma-capa");
    await importCharacter(page, { nome: "Aurora, Guardiã das Estrelas", classeId: "mago", subclasseId: "" });
    await page.getByRole("link", { name: "Personagens", exact: true }).click();
    await page.getByRole("main").getByRole("link", { name: "+ Novo personagem", exact: true }).click();
    await page.getByRole("button", { name: "Pular e criar ficha em branco" }).click();
    const longName = "Elarion das Montanhas do Norte e dos Caminhos Esquecidos";
    await page.getByLabel("Editar nome do personagem").fill(longName);
    await waitForSave(page);
    await page.getByRole("link", { name: "Personagens", exact: true }).click();
    await expect(page.getByText("3 personagens", { exact: true })).toBeVisible();
    await expect(page.getByRole("article")).toHaveCount(3);
    await expect(page.getByText("Sem classe", { exact: true })).toBeVisible();
    await capture("colecao");
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);

    for (const size of ["normal", "large", "extra-large"]) {
      await setTextSize(page, size);
      for (const viewport of [320, 390, 768, 1280]) {
        await page.setViewportSize({ width: viewport, height: 900 });
        const outside = await page.locator("header a, header button, header select, main a, main button, main input, .ficha-card-nome, .painel-rolagens button").evaluateAll((controls) =>
          controls.filter((element) => element.getClientRects().length).filter((element) => {
            const rect = element.getBoundingClientRect();
            return rect.left < -1 || rect.right > window.innerWidth + 1;
          }).map((element) => element.getAttribute("aria-label") || element.textContent));
        expect(outside, `${theme}, ${size}, ${viewport}px`).toEqual([]);
        const main = await page.getByRole("main").boundingBox();
        const dice = await page.locator(".painel-rolagens").boundingBox();
        expect(dice.y).toBeGreaterThanOrEqual(main.y + main.height);
      }
    }
    await page.setViewportSize({ width, height: 900 });
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-text-size", "extra-large");
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
    const diceToggle = page.locator(".painel-rolagens-toggle");
    await diceToggle.press("Enter");
    await expect(diceToggle).toHaveAttribute("aria-expanded", "true");
    await expect(page.locator("#painel-rolagens-historico")).toBeVisible();
    await diceToggle.press("Enter");
    await expect(page.locator("#painel-rolagens-historico")).toHaveCount(0);
    await capture("texto-150");
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);

    const remove = page.getByRole("button", { name: "Excluir Thorin Escudo de Ferro", exact: true });
    page.once("dialog", (dialog) => dialog.accept());
    await remove.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByText("2 personagens", { exact: true })).toBeVisible();
    const restore = page.getByRole("button", { name: "Restaurar Thorin Escudo de Ferro", exact: true });
    await restore.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByText("3 personagens", { exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: "Acessar ficha de Thorin Escudo de Ferro" })).toBeVisible();
    await page.goto("/yusong");
    await expect(page.getByRole("heading", { name: "Personagens de Pilares de Atlas" })).toBeVisible();
    await expect(page.getByRole("link", { name: /D&D Fichas/ })).toBeVisible();
    await expect(page.locator(".home-grimoire")).toHaveCount(0);
  });
}

import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir } from "node:fs/promises";
import { setRange } from "./helpers/preferences.js";

for (const theme of ["light", "dark"]) {
  test(`Preferências do grimório: sistema ${theme}, teclado, reflow e persistência`, async ({ page }, testInfo) => {
    await page.emulateMedia({ colorScheme: theme, reducedMotion: "reduce" });
    await page.goto("/dnd5e");
    await expect(page.getByLabel("Sistema ativo")).toHaveCount(0);
    await expect(page.getByLabel("Tema da interface")).toHaveCount(0);
    await expect(page.locator("html")).not.toHaveAttribute("data-theme");
    const opposite = theme === "dark" ? "claro" : "escuro";
    const toggle = page.getByRole("button", { name: `Ativar tema ${opposite}`, exact: true });
    await toggle.focus();
    await page.keyboard.press("Space");
    const chosen = theme === "dark" ? "light" : "dark";
    await expect(page.locator("html")).toHaveAttribute("data-theme", chosen);
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-theme", chosen);

    const trigger = page.getByRole("button", { name: "Configurações de acessibilidade", exact: true });
    await trigger.focus();
    await page.keyboard.press("Enter");
    const dialog = page.getByRole("dialog", { name: "Acessibilidade e aparência" });
    const close = dialog.getByRole("button", { name: "Fechar configurações" });
    await expect(close).toBeFocused();
    await expect(page.locator("#root")).toHaveAttribute("inert", "");
    await page.keyboard.press("Shift+Tab");
    await expect(dialog.getByRole("button", { name: "Usar tema do sistema" })).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(close).toBeFocused();
    await setRange(page, "Tamanho do texto", 24);
    for (const width of [320, 390, 768, 1280]) {
      await page.setViewportSize({ width, height: 720 });
      const box = await dialog.boundingBox();
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(width);
      expect(box.y + box.height).toBeLessThanOrEqual(720);
      expect(await dialog.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
    }
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    await dialog.getByRole("button", { name: "Usar tema do sistema" }).click();
    await expect(page.locator("html")).not.toHaveAttribute("data-theme");
    await mkdir("output/visual-grimoire/preferences", { recursive: true });
    const width = testInfo.project.name === "chromium-mobile" ? 390 : 1280;
    await page.setViewportSize({ width, height: 900 });
    await page.screenshot({ path: `output/visual-grimoire/preferences/painel-${theme}-${width}.png` });
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    await expect(trigger).toBeFocused();
    await expect(page.locator("#root")).not.toHaveAttribute("inert");
    await expect(page.getByRole("button", { name: `Ativar tema ${opposite}`, exact: true })).toBeVisible();
    await page.emulateMedia({ colorScheme: chosen, reducedMotion: "reduce" });
    await expect(page.getByRole("button", { name: `Ativar tema ${theme === "dark" ? "escuro" : "claro"}`, exact: true })).toBeVisible();
    await page.emulateMedia({ colorScheme: theme, reducedMotion: "reduce" });
    await page.reload();
    await trigger.click();
    await expect(page.getByLabel("Tamanho do texto")).toHaveValue("24");
    const backdrop = page.locator(".preferences-backdrop");
    await backdrop.click({ position: { x: 2, y: 2 } });
    await expect(dialog).toHaveCount(0);
    await expect(trigger).toBeFocused();
    await trigger.click();
    await page.keyboard.press("Escape");
    await expect(trigger).toBeFocused();
    await page.screenshot({ path: `output/visual-grimoire/preferences/biblioteca-${theme}-${width}.png`, fullPage: true });
  });
}

test("Voltar ao topo aparece após rolar e devolve o foco ao título", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 320, height: 500 });
  await page.goto("/dnd5e");
  const back = page.getByRole("button", { name: "Voltar ao topo", exact: true });
  await expect(back).toHaveCount(0);
  await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }));
  await expect(back).toBeVisible();
  await back.focus();
  await page.keyboard.press("Enter");
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  await expect(page.getByRole("heading", { name: "Seus personagens", exact: true })).toBeFocused();
  await expect(back).toHaveCount(0);
});

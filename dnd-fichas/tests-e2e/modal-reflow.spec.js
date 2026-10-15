import { test, expect } from "@playwright/test";
import { importCharacter } from "./helpers/dnd.js";
import { setTheme, setRange } from "./helpers/preferences.js";

for (const theme of ["light", "dark"]) {
  test(`VIS-G06 categorias ficam inteiras ao navegar por teclado / ${theme}`, async ({ page }) => {
    test.setTimeout(90000);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await importCharacter(page, { classeId: "mago", subclasseId: "escola-evocacao" });
    await setTheme(page, theme);
    for (const textSize of [16, 24, 28]) {
      await page.getByRole("button", { name: "Configurações de acessibilidade", exact: true }).click();
      await setRange(page, "Tamanho do texto", textSize);
      await page.keyboard.press("Escape");
      for (const width of [320, 390]) {
        await page.setViewportSize({ width, height: 500 });
        for (const [tab, action] of [["Inventário", "Adicionar itens"], ["Magias", "Adicionar Magias"]]) {
          await page.getByRole("tab", { name: tab, exact: true }).click();
          const opener = page.getByRole("button", { name: action, exact: true });
          await opener.click();
          const dialog = page.getByRole("dialog");
          await expect(dialog.getByRole("button", { name: "Fechar", exact: true })).toBeFocused();
          const categories = dialog.locator(".modal-catalogo-abas button");
          expect(await categories.count()).toBeGreaterThan(1);
          for (const button of await categories.all()) {
            await page.keyboard.press("Tab");
            await expect(button).toBeFocused();
            const visibility = await button.evaluate((element) => {
              const region = element.closest(".modal-catalogo-abas");
              const bounds = region.getBoundingClientRect();
              const rect = element.getBoundingClientRect();
              const left = bounds.left + region.clientLeft;
              return {
                insideRegion: rect.left >= left - 1 && rect.right <= left + region.clientWidth + 1,
                insideViewport: rect.left >= 0 && rect.right <= window.innerWidth && rect.top >= 0 && rect.bottom <= window.innerHeight,
              };
            });
            expect(visibility, `${theme}, ${width}px, texto ${textSize}px, ${await button.textContent()}`).toEqual({ insideRegion: true, insideViewport: true });
          }
          await page.keyboard.press("Escape");
          await expect(opener).toBeFocused();
        }
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      }
    }
  });
}

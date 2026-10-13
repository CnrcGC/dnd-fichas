import { test, expect } from "@playwright/test";
import { importCharacter } from "./helpers/dnd.js";

async function tabTo(page, control) {
  for (let index = 0; index < 100; index++) {
    if (await control.evaluate((element) => element === document.activeElement)) {
      expect(await control.evaluate((element) => {
        const box = element.getBoundingClientRect();
        const overlay = document.querySelector(".painel-rolagens")?.getBoundingClientRect();
        if (!overlay || box.left >= overlay.right || box.right <= overlay.left || box.top >= overlay.bottom || box.bottom <= overlay.top) return false;
        const x = (Math.max(box.left, overlay.left) + Math.min(box.right, overlay.right)) / 2;
        const y = (Math.max(box.top, overlay.top) + Math.min(box.bottom, overlay.bottom)) / 2;
        // Interseção geométrica não é obstrução quando o dialog está acima do painel.
        return Boolean(document.elementFromPoint(x, y)?.closest(".painel-rolagens"));
      })).toBe(false);
      return;
    }
    await page.keyboard.press("Tab");
  }
  throw new Error("O controle não foi alcançado pela sequência de Tab.");
}

test("A11Y-04 biblioteca, criação e level up funcionam somente com teclado e movimento reduzido", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await tabTo(page, page.getByRole("main").getByRole("link", { name: "+ Novo personagem", exact: true }));
  await page.keyboard.press("Enter");
  for (const name of ["Humano", "Guerreiro", "Soldado"]) {
    await tabTo(page, page.getByRole("button", { name: `Escolher ${name}`, exact: true }));
    await page.keyboard.press("Enter");
  }
  await tabTo(page, page.getByRole("button", { name: "Próximo", exact: true }));
  await page.keyboard.press("Enter");
  const choices = page.locator(".criacao-escolhas select");
  for (let index = 0; index < await choices.count(); index++) {
    await tabTo(page, choices.nth(index));
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Tab");
  }
  await tabTo(page, page.getByLabel("Personagem", { exact: true }));
  await page.keyboard.type("Aventura por teclado");
  await tabTo(page, page.getByRole("button", { name: "Finalizar", exact: true }));
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { name: "Ficha de Aventura por teclado" })).toBeVisible();
  await tabTo(page, page.getByRole("button", { name: "Subir de Nível", exact: true }));
  await page.keyboard.press("Enter");
  const dialog = page.getByRole("dialog", { name: "Subir de nível" });
  for (const name of [/Usar média/, "Próximo", "Próximo", "Concluir level up"]) {
    await tabTo(page, dialog.getByRole("button", { name, exact: typeof name === "string" }));
    await page.keyboard.press("Enter");
  }
  await expect(dialog).toHaveCount(0);
  await expect(page.getByLabel("Nível", { exact: true })).toHaveValue("2");
});

test("A11Y-04 abas aceitam setas, Home e End; catálogo prende e devolve foco", async ({ page }) => {
  await importCharacter(page);
  const combate = page.getByRole("tab", { name: "Combate", exact: true });
  await combate.focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("tab", { name: "Habilidades", exact: true })).toBeFocused();
  await page.keyboard.press("End");
  await expect(page.getByRole("tab", { name: "Notas", exact: true })).toBeFocused();
  await expect(combate).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("tab", { name: "Notas", exact: true })).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("Home");
  await expect(combate).toBeFocused();
  await page.getByRole("tab", { name: "Inventário", exact: true }).click();
  const opener = page.getByRole("button", { name: "Adicionar itens", exact: true });
  await opener.click();
  const dialog = page.getByRole("dialog", { name: "Adicionar itens" });
  const close = dialog.getByRole("button", { name: "Fechar", exact: true });
  await expect(close).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  expect(await dialog.evaluate((element) => element.contains(document.activeElement))).toBe(true);
  await page.keyboard.press("Tab");
  await expect(close).toBeFocused();
  await expect(page.locator("header.topbar")).toHaveAttribute("inert", "");
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(opener).toBeFocused();
  await expect(page.locator("header.topbar")).not.toHaveAttribute("inert", "");
});

test("A11Y-04 level up usa somente controles visíveis e fecha por Escape", async ({ page }) => {
  await importCharacter(page);
  const opener = page.getByRole("button", { name: "Subir de Nível" });
  await opener.click();
  const dialog = page.getByRole("dialog", { name: "Subir de nível" });
  await page.keyboard.press("Shift+Tab");
  expect(await dialog.evaluate((element) => element.contains(document.activeElement))).toBe(true);
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(opener).toBeFocused();
});

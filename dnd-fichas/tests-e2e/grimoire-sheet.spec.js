import { test, expect } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import { importCharacter, waitForSave } from "./helpers/dnd.js";
import { setTheme } from "./helpers/preferences.js";

async function assertControlContrast(page) {
  const contrasts = await page.evaluate(() => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 1;
    const context = canvas.getContext("2d");
    const luminance = (color) => {
      context.clearRect(0, 0, 1, 1);
      context.fillStyle = color;
      context.fillRect(0, 0, 1, 1);
      const [red, green, blue] = [...context.getImageData(0, 0, 1, 1).data].slice(0, 3).map((value) => {
        const channel = value / 255;
        return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
    };
    return [".atributo-input", ".atributo-modificador", ".ficha-nome-input", ".ficha-aba", ".ficha-atalho-acoes"].map((selector) => {
      const style = getComputedStyle(document.querySelector(selector));
      const border = luminance(style.borderTopColor);
      const background = luminance(style.backgroundColor);
      return { selector, ratio: (Math.max(border, background) + 0.05) / (Math.min(border, background) + 0.05) };
    });
  });
  for (const { selector, ratio } of contrasts) expect(ratio, `Contraste da borda de ${selector}`).toBeGreaterThanOrEqual(3);
}

for (const theme of ["light", "dark"]) {
  test(`VIS-G03 resumo e atributos precedem a edição / ${theme}`, async ({ page }, testInfo) => {
    await importCharacter(page, { nome: "Alena do Vale" });
    await setTheme(page, theme);
    await assertControlContrast(page);
    const opening = page.locator(".ficha-abertura");
    await expect(opening.getByRole("heading", { level: 1 })).toHaveText("Ficha de Alena do Vale");
    await expect(opening.locator(".ficha-linhagem")).toHaveText("Humano · Guerreiro · Nível 4");
    const summary = opening.locator("dl");
    await expect(summary).toContainText("30/40");
    await expect(summary).toContainText("Defesa12");
    await expect(summary).toContainText("Proficiência+2");
    const attributes = page.getByRole("heading", { name: "Atributos", exact: true });
    const identity = page.getByRole("heading", { name: "Identidade e progressão", exact: true });
    expect((await attributes.boundingBox()).y).toBeLessThan((await identity.boundingBox()).y);
    await expect(page.getByRole("tab")).toHaveText(["Combate", "Habilidades", "Perícias", "Magias", "Inventário", "Notas"]);
    const jump = page.getByRole("link", { name: "Ir para ações", exact: true });
    await jump.focus();
    await jump.press("Enter");
    await expect(page.getByRole("tab", { name: "Combate", exact: true })).toBeFocused();
    await page.getByLabel("PV atual", { exact: true }).fill("23");
    await page.getByLabel("PV temporário", { exact: true }).fill("5");
    await expect(summary).toContainText("23/40");
    await expect(summary).toContainText("+5 temporários");
    await page.getByLabel("Editar nome do personagem", { exact: true }).fill("Alena, guardiã do Vale");
    await waitForSave(page);
    await page.reload();
    await expect(opening.getByRole("heading", { level: 1 })).toHaveText("Ficha de Alena, guardiã do Vale");
    await expect(summary).toContainText("23/40");
    await expect(summary).toContainText("+5 temporários");
    await mkdir("output/visual-grimoire/sheet", { recursive: true });
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await page.screenshot({ path: `output/visual-grimoire/sheet/${theme}-${testInfo.project.name}.png`, fullPage: true });
    await page.screenshot({ path: `output/visual-grimoire/sheet/abertura-${theme}-${testInfo.project.name}.png` });
    await page.emulateMedia({ media: "print" });
    await expect(opening).toBeHidden();
    await expect(page.getByRole("tablist")).toBeHidden();
    await expect(page.locator(".ficha-atributos-pagina")).toBeHidden();
    await expect(page.locator(".ficha-impressao")).toBeVisible();
    await expect(page.locator(".ficha-impressao")).toContainText("Alena, guardiã do Vale");
    if (theme === "light") await page.screenshot({ path: `output/visual-grimoire/sheet/impressao-${testInfo.project.name}.png`, fullPage: true });
  });
}

test("VIS-G03 ficha em branco mantém orientação e edição acessível", async ({ page }) => {
  await page.goto("/dnd5e");
  await page.getByRole("link", { name: "+ Novo personagem", exact: true }).click();
  await page.getByRole("button", { name: "Pular e criar ficha em branco" }).click();
  await expect(page.locator(".ficha-linhagem")).toContainText("Raça a definir · Classe a definir · Nível 1");
  await expect(page.getByLabel("Editar nome do personagem", { exact: true })).toBeVisible();
  for (const name of ["Força", "Destreza", "Constituição", "Inteligência", "Sabedoria", "Carisma"]) {
    await expect(page.getByLabel(`Valor base de ${name}`, { exact: true })).toBeVisible();
  }
  await expect(page.getByRole("button", { name: "Subir de Nível", exact: true })).toBeDisabled();
});

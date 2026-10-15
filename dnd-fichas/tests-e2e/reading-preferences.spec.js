import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir } from "node:fs/promises";
import { setRange, setTheme } from "./helpers/preferences.js";
import { importCharacter } from "./helpers/dnd.js";

for (const theme of ["light", "dark"]) {
  test(`Leitura ${theme}: sliders, switches, persistência e padrão`, async ({ page }, testInfo) => {
    await page.emulateMedia({ colorScheme: theme, reducedMotion: "reduce" });
    await page.goto("/dnd5e");
    await setTheme(page, theme);
    const originalBackground = await page.locator("body").evaluate((element) => getComputedStyle(element).backgroundColor);
    const trigger = page.getByRole("button", { name: "Configurações de acessibilidade", exact: true });
    await trigger.click();
    await setRange(page, "Tamanho do texto", 23);
    expect(await page.locator("html").evaluate((element) => getComputedStyle(element).fontSize)).toBe("23px");
    await setRange(page, "Brilho do tema claro", 80);
    const dimmedBackground = await page.locator("body").evaluate((element) => getComputedStyle(element).backgroundColor);
    if (theme === "dark") expect(dimmedBackground).toBe(originalBackground);
    else expect(dimmedBackground).not.toBe(originalBackground);
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    await page.keyboard.press("Escape");
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    await trigger.click();
    for (const name of ["Espaçamento de leitura", "Alto contraste", "Sublinhar todos os links"]) {
      const toggle = page.getByRole("switch", { name, exact: true });
      await expect(toggle).not.toBeChecked();
      await toggle.focus();
      await toggle.press("Space");
      await expect(toggle).toBeChecked();
    }
    await setRange(page, "Tamanho do texto", 28);
    const dialog = page.getByRole("dialog", { name: "Acessibilidade e aparência" });
    for (const width of [320, 390, 768, 1280]) {
      await page.setViewportSize({ width, height: 720 });
      expect(await dialog.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
      const rect = await dialog.boundingBox();
      expect(rect.x + rect.width).toBeLessThanOrEqual(width);
      expect(rect.y + rect.height).toBeLessThanOrEqual(720);
    }
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    await mkdir("output/visual-grimoire/reading", { recursive: true });
    const width = testInfo.project.name === "chromium-mobile" ? 390 : 1280;
    await page.setViewportSize({ width, height: 900 });
    await page.screenshot({ path: `output/visual-grimoire/reading/painel-${theme}-${width}.png` });
    await page.keyboard.press("Escape");
    await expect(trigger).toBeFocused();
    await expect(page.getByRole("link", { name: /D&D Fichas/ })).toHaveCSS("text-decoration-line", "underline");
    expect(await page.locator(".home-subtitulo").evaluate((element) => {
      const style = getComputedStyle(element);
      return parseFloat(style.letterSpacing) / parseFloat(style.fontSize);
    })).toBeCloseTo(0.04);
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-text-pixels", "28");
    await expect(page.locator("html")).toHaveAttribute("data-high-contrast", "true");
    await trigger.click();
    await expect(page.getByRole("slider", { name: "Brilho do tema claro" })).toHaveValue("80");
    for (const name of ["Espaçamento de leitura", "Alto contraste", "Sublinhar todos os links"]) {
      await expect(page.getByRole("switch", { name, exact: true })).toBeChecked();
    }
    await page.getByRole("button", { name: "Voltar ao padrão", exact: true }).click();
    await expect(page.getByRole("slider", { name: "Tamanho do texto", exact: true })).toHaveValue("16");
    await expect(page.getByRole("slider", { name: "Brilho do tema claro" })).toHaveValue("100");
    await expect(page.locator("html")).not.toHaveAttribute("data-theme");
    for (const name of ["Espaçamento de leitura", "Alto contraste", "Sublinhar todos os links"]) {
      await expect(page.getByRole("switch", { name, exact: true })).not.toBeChecked();
    }
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-text-pixels", "16");
    await expect(page.locator("html")).toHaveAttribute("data-high-contrast", "false");
    await trigger.click();
    await page.screenshot({ path: `output/visual-grimoire/reading/painel-padrao-${theme}-${width}.png` });
    await page.keyboard.press("Escape");
  });

  test(`Ficha ${theme}: leitura ampliada a 28px com espaçamento e contraste`, async ({ page }) => {
    test.setTimeout(90_000);
    await importCharacter(page);
    await setTheme(page, theme);
    await page.getByRole("button", { name: "Configurações de acessibilidade", exact: true }).click();
    await setRange(page, "Tamanho do texto", 28);
    await setRange(page, "Brilho do tema claro", 80);
    for (const name of ["Espaçamento de leitura", "Alto contraste", "Sublinhar todos os links"]) {
      await page.getByRole("switch", { name, exact: true }).check();
    }
    await page.keyboard.press("Escape");
    for (const width of [320, 390, 768, 1280]) {
      await page.setViewportSize({ width, height: 900 });
      for (const tab of ["Combate", "Habilidades", "Proficiências", "Magias", "Inventário", "Notas"]) {
        await page.getByRole("tab", { name: tab, exact: true }).click();
        await expect(page.getByRole("tabpanel").locator("h2").first()).toBeVisible();
        const overflow = await page.locator("header a, header button, main button, main input, main select, main textarea").evaluateAll((elements) =>
          elements.filter((element) => element.getClientRects().length && !element.closest("[hidden]"))
            .filter((element) => { const rect = element.getBoundingClientRect(); return rect.left < -1 || rect.right > window.innerWidth + 1; })
            .map((element) => element.getAttribute("aria-label") || element.textContent));
        expect(overflow, `${tab} / ${width}`).toEqual([]);
      }
    }
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    await page.emulateMedia({ media: "print" });
    await expect(page.locator(".ficha-impressao")).toBeVisible();
    await expect(page.locator("html")).toHaveCSS("font-size", "16px");
    await expect(page.locator("body")).toHaveCSS("background-color", "rgb(255, 255, 255)");
    await expect(page.locator(".app-main")).toHaveCSS("padding-bottom", "0px");
  });
}

test("preferência antiga de texto funciona com JSON de leitura corrompido", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("rpg-platform:text-size", "large");
    localStorage.setItem("rpg-platform:text-scale", "invalido");
    localStorage.setItem("rpg-platform:reading-preferences", "{corrompido");
  });
  await page.goto("/dnd5e");
  await expect(page.locator("html")).toHaveCSS("font-size", "20px");
  await page.getByRole("button", { name: "Configurações de acessibilidade", exact: true }).click();
  await expect(page.getByRole("slider", { name: "Tamanho do texto", exact: true })).toHaveValue("20");
  await expect(page.getByRole("switch", { name: "Alto contraste", exact: true })).not.toBeChecked();
});

test("Criação com texto máximo e opções de leitura mantém escolhas acessíveis", async ({ page }) => {
  await page.goto("/dnd5e");
  await page.getByRole("button", { name: "Configurações de acessibilidade", exact: true }).click();
  await setRange(page, "Tamanho do texto", 28);
  for (const name of ["Espaçamento de leitura", "Alto contraste", "Sublinhar todos os links"]) {
    await page.getByRole("switch", { name, exact: true }).check();
  }
  await page.keyboard.press("Escape");
  await page.getByRole("main").getByRole("link", { name: "+ Novo personagem", exact: true }).click();
  const check = async () => {
    for (const width of [320, 390, 768, 1280]) {
      await page.setViewportSize({ width, height: 900 });
      const outside = await page.locator("main button, main input, main select, main textarea").evaluateAll((elements) => elements
        .filter((element) => element.getClientRects().length)
        .filter((element) => { const box = element.getBoundingClientRect(); return box.left < -1 || box.right > window.innerWidth + 1; })
        .map((element) => element.textContent || element.getAttribute("aria-label")));
      expect(outside, `${width}px`).toEqual([]);
    }
  };
  await check();
  for (const name of ["Meio-Elfo", "Clérigo", "Acólito"]) {
    await page.getByRole("button", { name: `Escolher ${name}`, exact: true }).click();
  }
  await page.getByRole("button", { name: "Próximo", exact: true }).click();
  await expect(page.getByLabel("Personagem", { exact: true })).toBeVisible();
  await check();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});

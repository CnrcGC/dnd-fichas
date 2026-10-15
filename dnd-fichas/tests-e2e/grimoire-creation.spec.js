import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir } from "node:fs/promises";
import { setRange, setTheme } from "./helpers/preferences.js";

async function assertReflow(page, width) {
  await page.setViewportSize({ width, height: 900 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  const outside = await page.locator("main button, main input, main select, main textarea, .criacao-passo").evaluateAll((elements) => elements
    .filter((element) => element.getClientRects().length)
    .filter((element) => { const rect = element.getBoundingClientRect(); return rect.left < -1 || rect.right > window.innerWidth + 1; })
    .map((element) => element.getAttribute("aria-label") || element.textContent));
  expect(outside, `Controles fora da página em ${width}px`).toEqual([]);
  expect(await page.locator(".criacao-abertura h1").evaluate((element) => {
    const text = element.firstChild;
    const start = text.textContent.indexOf("personagem");
    const word = document.createRange();
    word.setStart(text, start);
    word.setEnd(text, start + "personagem".length);
    return word.getClientRects().length;
  }), `Palavra inteira no título em ${width}px`).toBe(1);
}

for (const theme of ["light", "dark"]) {
  test(`VIS-G04 capítulos, retorno e etapa pulada / ${theme}`, async ({ page }, testInfo) => {
    await page.goto("/dnd5e/characters/new");
    await setTheme(page, theme);
    const chapters = page.locator(".criacao-passos li");
    await expect(chapters).toHaveCount(5);
    await expect(chapters.nth(0)).toContainText("Capítulo 1: RaçaAtual");
    await expect(chapters.nth(1)).toContainText("A seguir");
    const elf = page.locator(".criacao-card").filter({ has: page.getByRole("heading", { name: "Elfo", exact: true }) });
    await expect(elf.getByRole("button", { name: "Escolher Elfo", exact: true })).toBeDisabled();
    await expect(elf.getByRole("button")).toHaveAccessibleDescription("Complete a seleção acima para continuar.");
    await expect(page.getByRole("button", { name: "Pular e criar ficha em branco" })).toBeVisible();
    await mkdir("output/visual-grimoire/creation", { recursive: true });
    await page.screenshot({ path: `output/visual-grimoire/creation/raca-${theme}-${testInfo.project.name}.png` });
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    await page.getByRole("button", { name: "Pular esta etapa →", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Escolha sua Classe", exact: true })).toBeFocused();
    await expect(chapters.nth(0)).toContainText("Pendente");
    await expect(chapters.nth(0)).not.toHaveClass(/is-concluido/);
    await page.getByRole("button", { name: "Voltar", exact: true }).click();
    await page.getByRole("button", { name: "Escolher Humano", exact: true }).click();
    await expect(chapters.nth(0)).toContainText("Concluído");
    await page.getByRole("button", { name: "Escolher Guerreiro", exact: true }).click();
    await page.getByRole("button", { name: "Voltar", exact: true }).click();
    const warrior = page.locator(".criacao-card").filter({ has: page.getByRole("heading", { name: "Guerreiro", exact: true }) });
    await expect(warrior).toContainText("Selecionado");
    await expect(page.getByRole("heading", { name: "Escolha sua Classe", exact: true })).toBeFocused();
    await warrior.getByRole("button").click();
    await page.getByRole("button", { name: "Escolher Soldado", exact: true }).click();
    await page.getByRole("button", { name: "Próximo", exact: true }).click();
    await expect(chapters.nth(4)).toHaveAttribute("aria-current", "step");
    await page.getByRole("button", { name: "Finalizar", exact: true }).click();
    await expect(page.getByRole("alert")).toBeFocused();
    await expect(page.getByRole("alert")).toContainText("Complete as escolhas para finalizar");
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    await page.screenshot({ path: `output/visual-grimoire/creation/pendencias-${theme}-${testInfo.project.name}.png` });
  });

  test(`VIS-G04 cinco capítulos com texto máximo / ${theme}`, async ({ page }) => {
    test.setTimeout(90_000);
    await page.goto("/dnd5e/characters/new");
    await setTheme(page, theme);
    await page.getByRole("button", { name: "Configurações de acessibilidade", exact: true }).click();
    await setRange(page, "Tamanho do texto", 28);
    for (const name of ["Espaçamento de leitura", "Alto contraste", "Sublinhar todos os links"]) await page.getByRole("switch", { name, exact: true }).check();
    await page.keyboard.press("Escape");
    const check = async () => { for (const width of [320, 390, 768, 1280]) await assertReflow(page, width); };
    await check();
    for (const name of ["Meio-Elfo", "Clérigo", "Acólito"]) {
      await page.getByRole("button", { name: `Escolher ${name}`, exact: true }).click();
      await expect(page.locator("[data-etapa-titulo]")).toBeFocused();
      await check();
    }
    await page.getByRole("button", { name: "Próximo", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Toques Finais", exact: true })).toBeFocused();
    await check();
    await page.getByRole("button", { name: "Finalizar", exact: true }).click();
    await expect(page.getByRole("alert")).toBeFocused();
    await check();
  });
}

import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

for (const path of ["/", "/characters/new", "/dnd5e", "/yusong", "/feiticeiros-maldicoes", "/settings", "/missing-route"]) {
  test(`${path} não possui violações axe automáticas`, async ({ page }) => {
    await page.goto(path);
    await expect(page.locator("main h1")).toBeVisible();
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
}

test("skip link e seletor de tema funcionam por teclado", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: "Pular para o conteúdo principal" });
  await expect(skip).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("main")).toBeFocused();
  await page.getByLabel("Tema da interface").selectOption("light");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
});

test("seletor informa sistemas bloqueados sem depender apenas de cor", async ({ page }) => {
  await page.goto("/characters/new");
  await expect(page.getByRole("heading", { name: "D&D 5e" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Criar em Pilares de Atlas" })).toBeVisible();
  await expect(page.getByText(/criação F&M será habilitada/i)).toBeVisible();
});


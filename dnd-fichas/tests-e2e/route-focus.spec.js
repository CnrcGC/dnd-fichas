import { test, expect } from "@playwright/test";

test("VIS-G06 redirecionamento preserva o primeiro Tab no skip link", async ({ page }) => {
  await page.goto("/tests-e2e/fixtures/route-focus.html");
  await expect(page.getByRole("heading", { name: "Biblioteca pronta" })).toBeVisible();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("main")).toHaveAttribute("data-path", "/dnd5e");
  // A implementação de foco de rota usa RAF; aguardar seu ciclo real.
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  await expect(page.getByRole("link", { name: "Pular para o conteúdo principal" })).toBeFocused();
});

test("VIS-G06 navegação comum continua focando o título", async ({ page }) => {
  await page.goto("/tests-e2e/fixtures/route-focus.html");
  await page.getByRole("link", { name: "Abrir biblioteca", exact: true }).click();
  await expect(page.getByRole("main")).toHaveAttribute("data-path", "/dnd5e");
  await expect(page.getByRole("heading", { name: "Biblioteca pronta" })).toBeFocused();
});

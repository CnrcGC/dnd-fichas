import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { importCharacter } from "./helpers/dnd.js";
import { setTheme } from "./helpers/preferences.js";

for (const theme of ["dark", "light"]) {
  for (const tab of ["Combate", "Habilidades", "Perícias", "Magias", "Inventário", "Notas"]) {
    test(`A11Y-01 ficha ${tab} / ${theme} não possui violações axe`, async ({ page }) => {
      await importCharacter(page, {
        classeId: "mago", subclasseId: "escola-evocacao",
        recursos: [{ id: "reserve", nome: "Reserva", usosMax: 2, usosGastos: 1, restauraEm: "longo" }],
        magias: [{ id: "detect", nome: "Detectar Magia", nivel: 1, classeId: "mago", preparada: true }],
        ataques: [{ id: "attack", nome: "Cajado", atributo: "forca", dano: "1d6", tipoDano: "concussão" }],
        inventario: [{ id: "rope", nome: "Corda", quantidade: 1, peso: 1, tipoItem: "equipamento" }],
      });
      await setTheme(page, theme);
      await page.getByRole("tab", { name: tab, exact: true }).click();
      await expect(page.getByRole("tabpanel", { name: tab, exact: true })).toBeVisible();
      await expect(page.getByRole("tabpanel").locator("h2").first()).toBeVisible();
      await expect(page.getByRole("tabpanel").locator(".ficha-carregando-secao")).toHaveCount(0);
      await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
      const result = await new AxeBuilder({ page }).analyze();
      expect(result.violations.map(({ id, nodes }) => ({ id, targets: nodes.map((node) => node.target) }))).toEqual([]);
    });
  }
}

test("A11Y-01 rolagem é anunciada em texto e criação lazy recebe foco", async ({ page }) => {
  await page.goto("/dnd5e");
  await page.getByRole("link", { name: "+ Novo personagem" }).click();
  await expect(page.getByRole("heading", { name: "Criar personagem D&D 5e" })).toBeFocused();
  await page.getByRole("button", { name: "Pular e criar ficha em branco" }).click();
  await page.getByRole("button", { name: /Rolar teste de Força/ }).click();
  await expect(page.getByRole("status").filter({ hasText: /Teste de Força\. Resultado \d+/ })).toHaveCount(1);
});

test("A11Y-01 duas rolagens iguais atualizam o anúncio acessível", async ({ page }) => {
  await importCharacter(page);
  await page.evaluate(() => { Math.random = () => 0.5; });
  const roll = page.getByRole("button", { name: /Rolar teste de Força/ });
  await roll.click();
  const announcement = page.getByRole("status").filter({ hasText: /Teste de Força\. Resultado/ });
  const first = await announcement.textContent();
  await announcement.evaluate((element) => {
    window.repeatedRollAnnouncements = [];
    new MutationObserver(() => window.repeatedRollAnnouncements.push(element.textContent)).observe(element, { childList: true, subtree: true, characterData: true });
  });
  await roll.click();
  await expect(announcement).toHaveText(first.trim());
  await expect.poll(() => page.evaluate(() => window.repeatedRollAnnouncements.length)).toBeGreaterThan(0);
});

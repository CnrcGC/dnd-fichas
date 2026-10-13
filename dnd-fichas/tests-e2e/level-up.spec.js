import { test, expect } from "@playwright/test";
import { importCharacter, readCharacter, waitForSave } from "./helpers/dnd.js";

for (const scenario of [
  { nome: "Guerreiro XP 4→5", classeId: "guerreiro", subclasseId: "campeao", nivel: 4, xp: true },
  { nome: "Guerreiro marco 2→3", classeId: "guerreiro", subclasseId: null, nivel: 2 },
  { nome: "Mago marco 4→5", classeId: "mago", subclasseId: "escola-evocacao", nivel: 4 },
]) {
  test(`MVP-07 ${scenario.nome} preserva PV e atualiza progressão`, async ({ page }) => {
    await importCharacter(page, { ...scenario, pvPorNivel: Object.fromEntries(Array.from({ length: scenario.nivel }, (_, index) => [index + 1, [12, 9, 9, 10][index]])) });
    const before = await readCharacter(page);
    if (scenario.xp) {
      await page.getByRole("button", { name: "XP", exact: true }).click();
      await expect(page.getByRole("button", { name: "Subir de Nível" })).toBeDisabled();
      await page.getByLabel("XP atual", { exact: true }).fill("6500");
    }
    await page.getByRole("button", { name: "Subir de Nível" }).click();
    const dialog = page.getByRole("dialog", { name: "Subir de nível" });
    await dialog.getByRole("button", { name: /Usar média/ }).click();
    await dialog.getByRole("button", { name: "Próximo", exact: true }).click();
    if (!scenario.subclasseId) {
      await dialog.getByRole("button", { name: /^Campeão/ }).click();
      await dialog.getByRole("button", { name: "Próximo", exact: true }).click();
    }
    if (scenario.classeId === "guerreiro") {
      await expect(dialog.getByRole("heading", { name: /Novas habilidades/ })).toBeVisible();
      await dialog.getByRole("button", { name: "Próximo", exact: true }).click();
    }
    await expect(dialog.getByRole("heading", { name: "Resumo", exact: true })).toBeVisible();
    await dialog.getByRole("button", { name: "Concluir level up" }).click();
    await expect(dialog).toHaveCount(0);
    await waitForSave(page);
    const stored = await readCharacter(page);
    expect(stored.nivel).toBe(scenario.nivel + 1);
    expect(stored.status.pvMax - stored.status.pvAtual).toBe(before.status.pvMax - before.status.pvAtual);
    expect(stored.pvPorNivel[scenario.nivel + 1]).toBeGreaterThan(0);
    if (scenario.xp) {
      expect(stored.status.pvMax).toBe(48);
      expect(stored.habilidades.some((h) => h.origemId === "guerreiro-ataque-extra")).toBe(true);
    }
    if (!scenario.subclasseId) expect(stored.subclasseId).toBe("campeao");
    if (scenario.classeId === "mago") expect(stored.espacosMagia[3].total).toBe(2);
    await page.reload();
    await expect(page.getByRole("heading", { name: `Ficha de ${scenario.nome}` })).toBeVisible();
    expect((await readCharacter(page)).nivel).toBe(scenario.nivel + 1);
  });
}

test("MVP-07 nível total 20 bloqueia o assistente", async ({ page }) => {
  await importCharacter(page, { nivel: 20 });
  await expect(page.getByRole("button", { name: "Subir de Nível" })).toBeDisabled();
});

import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

async function choose(page, name) {
  await page.getByRole("button", { name: `Escolher ${name}`, exact: true }).click();
}

for (const scenario of [
  { race: "Humano", classe: "Guerreiro", background: "Soldado" },
  { race: "Meio-Elfo", classe: "Clérigo", background: "Acólito" },
  { race: "Elfo", classe: "Mago", background: "Sábio" },
  { race: "Anão", classe: "Clérigo", background: "Acólito", subrace: "anao-colina" },
]) {
  test(`MVP-04 cria ${scenario.race} / ${scenario.classe} com escolhas e dados pessoais`, async ({ page }) => {
    await page.goto("/dnd5e/characters/new");
    await choose(page, scenario.race);
    await expect(page.getByRole("heading", { name: "Escolha sua Classe" })).toBeFocused();
    await choose(page, scenario.classe);
    await choose(page, scenario.background);
    await page.getByRole("button", { name: "Próximo" }).click();
    if (scenario.subrace) await page.getByLabel("Sub-raça", { exact: true }).selectOption(scenario.subrace);
    const selects = page.locator(".criacao-escolhas select");
    for (let index = 0; index < await selects.count(); index++) {
      await selects.nth(index).selectOption({ index: 1 });
    }
    await page.getByLabel("Personagem", { exact: true }).fill(`Demo ${scenario.classe}`);
    await page.getByLabel("Jogador", { exact: true }).fill("Apresentação");
    await page.getByLabel("Aparência").fill("Capa azul");
    await page.getByLabel("Personalidade").fill("Observador");
    await page.getByLabel("Histórico").fill("Guardião da biblioteca");
    await page.getByLabel("Objetivo").fill("Encontrar o grimório");
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    await page.getByRole("button", { name: "Finalizar", exact: true }).click();
    await expect(page.getByRole("heading", { name: `Ficha de Demo ${scenario.classe}` })).toBeVisible();
    await expect(page.getByRole("status").filter({ hasText: "Alterações salvas neste dispositivo." })).toBeVisible();
    const persisted = await page.evaluate(async () => {
      const { openPlatformDatabase, IndexedDbCharacterRepository } = await import("/src/platform/persistence/characterRepository.js");
      const database = await openPlatformDatabase();
      const [record] = await new IndexedDbCharacterRepository(database).list({ systemId: "dnd5e" });
      database.close();
      return record.data;
    });
    expect(persisted.nivel).toBe(1);
    if (scenario.subrace) {
      expect(persisted.subracaId).toBe(scenario.subrace);
      expect(persisted.status.pvMax).toBe(11);
    }
    expect(persisted.status.iniciativa).toBe(0);
    expect(persisted.historico).toBe("Guardião da biblioteca");
    expect(Object.values(persisted.atributos).sort((a, b) => a - b)).toEqual([8, 10, 12, 13, 14, 15]);
    expect(persisted.escolhasCriacao.periciasClasse.length).toBeGreaterThan(0);
    await page.reload();
    await expect(page.getByLabel("Editar nome do personagem")).toHaveValue(`Demo ${scenario.classe}`);
  });
}

test("MVP-04 escolhas incompletas explicam correção e permitem rascunho explícito", async ({ page }) => {
  await page.goto("/dnd5e/characters/new");
  await choose(page, "Meio-Elfo");
  await choose(page, "Guerreiro");
  await choose(page, "Soldado");
  await page.getByRole("button", { name: "Próximo" }).click();
  await page.getByRole("button", { name: "Finalizar", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("Bônus racial");
  await expect(page.getByRole("alert")).toBeFocused();
  await expect(page.getByLabel("Bônus racial +1 — atributo 1")).toHaveAttribute("aria-invalid", "true");
  await page.getByRole("button", { name: "Criar rascunho com escolhas pendentes" }).click();
  await expect(page.getByRole("heading", { name: /Ficha de/ })).toBeVisible();
});

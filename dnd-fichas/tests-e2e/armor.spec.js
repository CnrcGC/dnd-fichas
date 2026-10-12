import { test, expect } from "@playwright/test";
import { importCharacter, waitForSave } from "./helpers/dnd.js";
test("MVP-05 CA manual persiste e pode voltar ao cálculo", async ({ page }) => {
  await importCharacter(page);
  await page.getByLabel("Classe de Armadura", { exact: true }).fill("19");
  await waitForSave(page);
  await page.reload();
  await expect(page.getByLabel("Classe de Armadura", { exact: true })).toHaveValue("19");
  await page.getByRole("button", { name: "Usar CA calculada" }).click();
  await expect(page.getByLabel("Classe de Armadura", { exact: true })).toHaveValue("12");
});

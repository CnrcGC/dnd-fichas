import { expect } from "@playwright/test";
import { Buffer } from "node:buffer";

export async function importCharacter(page, overrides = {}) {
  const data = {
    id: "demo-source", versaoFicha: 8, nome: "Personagem de teste", racaId: "humano", classeId: "guerreiro", subclasseId: "campeao", nivel: 4,
    atributos: { forca: 16, destreza: 14, constituicao: 14, inteligencia: 12, sabedoria: 10, carisma: 8 },
    status: { pvMax: 40, pvAtual: 30, pvTemp: 0, ca: 12, iniciativa: 0, deslocamento: 9, testesMorteSucessos: 0, testesMorteFalhas: 0 },
    pvPorNivel: { 1: 12, 2: 9, 3: 9, 4: 10 },
    progressao: { modo: "marco", xpAtual: 0 },
    ...overrides,
  };
  await page.goto("/dnd5e");
  await expect(page.getByRole("heading", { name: /Personagens D&D/ })).toBeVisible();
  await page.getByLabel("Arquivo JSON da ficha").setInputFiles({ name: "demo.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify(data)) });
  await expect(page.getByRole("heading", { name: `Ficha de ${data.nome}` })).toBeVisible();
  await waitForSave(page);
}

export async function waitForSave(page) {
  await expect(page.getByRole("status").filter({ hasText: "Alterações salvas neste dispositivo." })).toBeVisible();
}

export async function readCharacter(page) {
  const id = decodeURIComponent(new URL(page.url()).pathname.split("/").at(-1));
  return page.evaluate(async (recordId) => {
    const { openPlatformDatabase, IndexedDbCharacterRepository } = await import("/src/platform/persistence/characterRepository.js");
    const database = await openPlatformDatabase();
    const record = await new IndexedDbCharacterRepository(database).get(recordId);
    database.close();
    return record?.data;
  }, id);
}

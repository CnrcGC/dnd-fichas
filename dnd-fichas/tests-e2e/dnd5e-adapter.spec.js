import { test, expect } from "@playwright/test";
import { fileURLToPath } from "node:url";

const fixturePath = fileURLToPath(new URL("../tests/fixtures/dnd5e/legacy-character-v8.json", import.meta.url));

async function readDurableCharacter(page, id) {
  return page.evaluate(async (characterId) => {
    const database = await new Promise((resolve, reject) => {
      const request = indexedDB.open("rpg-platform", 2);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    const record = await new Promise((resolve, reject) => {
      const request = database.transaction("characters").objectStore("characters").get(characterId);
      request.onsuccess = () => resolve(request.result ?? null);
      request.onerror = () => reject(request.error);
    });
    database.close();
    return record;
  }, id);
}

async function chooseCreationCard(page, name) {
  const card = page.getByRole("heading", { name, exact: true }).locator("..").locator("..");
  await card.getByRole("button", { name: "Escolher" }).click();
}

test("FE-04A cria, edita, espelha e prepara impressão D&D", async ({ page }) => {
  await page.goto("/dnd5e/characters/new");
  await expect(page.getByRole("heading", { name: "Criar personagem D&D 5e" })).toBeVisible();
  await page.getByRole("button", { name: "Pular e criar ficha em branco" }).click();
  await expect(page).toHaveURL(/\/dnd5e\/characters\/[^/]+$/);

  const id = decodeURIComponent(new URL(page.url()).pathname.split("/").at(-1));
  const name = page.getByLabel("Editar nome do personagem");
  await name.fill("Ayla Persistente");
  await expect(page.getByRole("heading", { name: "Ficha de Ayla Persistente" })).toBeVisible();
  await expect.poll(async () => (await readDurableCharacter(page, id))?.data?.nome).toBe("Ayla Persistente");

  await page.evaluate(() => {
    window.__printCalled = false;
    window.print = () => { window.__printCalled = true; };
  });
  await page.getByRole("button", { name: "Imprimir / Salvar em PDF" }).click();
  await expect.poll(() => page.evaluate(() => window.__printCalled)).toBe(true);
  await expect(page.locator(".ficha-impressao")).toContainText("Ayla Persistente");
});

test("FE-04A mantém o leitor de exportação v8 na biblioteca D&D", async ({ page }) => {
  await page.goto("/dnd5e");
  await page.locator('input[type="file"]').setInputFiles(fixturePath);
  await expect(page.getByRole("heading", { name: "Ficha de Lyra Vento-Norte" })).toBeVisible();
  await expect(page.getByLabel("Editar nome do personagem")).toHaveValue("Lyra Vento-Norte");
});

test("FE-04C carrega sob demanda as seções pesadas e o level-up D&D", async ({ page }) => {
  await page.goto("/dnd5e");
  await page.locator('input[type="file"]').setInputFiles(fixturePath);

  await page.getByRole("tab", { name: "Habilidades" }).click();
  await expect(page.getByRole("heading", { name: "Habilidades e Talentos" })).toBeVisible();
  await page.getByRole("tab", { name: "Perícias" }).click();
  await expect(page.getByRole("heading", { name: "Perícias" })).toBeVisible();
  await page.getByRole("tab", { name: "Magias" }).click();
  await expect(page.getByRole("heading", { name: "Conjuração" })).toBeVisible();
  await page.getByRole("tab", { name: "Inventário" }).click();
  await expect(page.getByRole("heading", { name: "Inventário" })).toBeVisible();

  await page.getByRole("button", { name: "Subir de Nível" }).click();
  await expect(page.getByRole("dialog", { name: "Subir de nível" })).toBeVisible();
  await page.getByRole("button", { name: "Fechar" }).click();
  await expect(page.getByRole("dialog", { name: "Subir de nível" })).toHaveCount(0);
});

test("FE-04D preserva criação guiada, multiclasse, level-up e PDF", async ({ page }) => {
  await page.goto("/dnd5e/characters/new");
  await chooseCreationCard(page, "Humano");
  await chooseCreationCard(page, "Guerreiro");
  await chooseCreationCard(page, "Soldado");
  await expect(page.getByRole("heading", { name: "Distribua seus Atributos" })).toBeVisible();
  await page.getByRole("button", { name: "Próximo" }).click();
  await page.getByPlaceholder("Nome do personagem").fill("Tália Horizonte");
  await page.getByPlaceholder("Nome do jogador").fill("Teste FE-04D");
  await page.getByRole("button", { name: "Finalizar" }).click();

  await expect(page.getByRole("heading", { name: "Ficha de Tália Horizonte" })).toBeVisible();
  const id = decodeURIComponent(new URL(page.url()).pathname.split("/").at(-1));
  await expect.poll(async () => (await readDurableCharacter(page, id))?.data?.classeId).toBe("guerreiro");

  await page.getByRole("button", { name: "+ Adicionar classe" }).click();
  const multiclassRow = page.locator(".multiclasse-linha");
  await multiclassRow.locator("select").first().selectOption("ladino");
  const skillChoice = multiclassRow.locator("select").last();
  await expect(skillChoice).toBeEnabled();
  await skillChoice.selectOption({ index: 1 });
  await expect.poll(async () => (await readDurableCharacter(page, id))?.data?.classesSecundarias?.[0]?.classeId).toBe("ladino");

  await page.getByRole("button", { name: "Subir de Nível" }).click();
  const dialog = page.getByRole("dialog", { name: "Subir de nível" });
  await expect(dialog.getByRole("heading", { name: "Qual classe está subindo?" })).toBeVisible();
  await dialog.getByRole("button", { name: /Guerreiro.*nível 1.*2/s }).click();
  await dialog.getByRole("button", { name: "Próximo" }).click();
  await dialog.getByRole("button", { name: /Usar média/ }).click();
  await dialog.getByRole("button", { name: "Próximo" }).click();
  await expect(dialog.getByRole("heading", { name: "Novas habilidades de Guerreiro" })).toBeVisible();
  await dialog.getByRole("button", { name: "Próximo" }).click();
  await expect(dialog.getByRole("heading", { name: "Resumo" })).toBeVisible();
  await dialog.getByRole("button", { name: "Concluir level up" }).click();

  await expect(dialog).toHaveCount(0);
  await expect.poll(async () => {
    const data = (await readDurableCharacter(page, id))?.data;
    return { nivel: data?.nivel, secundaria: data?.classesSecundarias?.[0]?.nivel };
  }).toEqual({ nivel: 2, secundaria: 1 });

  await page.emulateMedia({ media: "print" });
  const printSheet = page.locator(".ficha-impressao");
  await expect(printSheet).toBeVisible();
  await expect(page.locator(".ficha-shell")).toBeHidden();
  await expect(printSheet).toContainText("Tália Horizonte");
  await expect(printSheet).toContainText("Guerreiro 2");
  await expect(printSheet).toContainText("Ladino 1");
  const pdf = await page.pdf({ format: "A4", printBackground: true });
  expect(pdf.byteLength).toBeGreaterThan(10_000);
});

test("ME-02A exige sub-raça e persiste seus bônus na criação guiada", async ({ page }) => {
  await page.goto("/dnd5e/characters/new");
  const cardElfo = page.getByRole("heading", { name: "Elfo", exact: true }).locator("..").locator("..");
  const escolherElfo = cardElfo.getByRole("button", { name: "Escolher Elfo" });
  await expect(escolherElfo).toBeDisabled();
  await cardElfo.getByLabel("Sub-raça").selectOption("elfo-floresta");
  await expect(escolherElfo).toBeEnabled();
  await escolherElfo.click();

  await chooseCreationCard(page, "Guerreiro");
  await chooseCreationCard(page, "Soldado");
  await page.getByRole("button", { name: "Próximo" }).click();
  await page.getByPlaceholder("Nome do personagem").fill("Lía da Floresta");
  await page.getByRole("button", { name: "Finalizar" }).click();

  const id = decodeURIComponent(new URL(page.url()).pathname.split("/").at(-1));
  await expect.poll(async () => {
    const data = (await readDurableCharacter(page, id))?.data;
    return {
      racaId: data?.racaId,
      subracaId: data?.subracaId,
      deslocamento: data?.status?.deslocamento,
    };
  }).toEqual({ racaId: "elfo", subracaId: "elfo-floresta", deslocamento: 10.5 });
  await expect(page.getByText(/Traços raciais:.*Máscara da Natureza/)).toBeVisible();
});

test("ME-02B persiste escolha inicial de classe na criação guiada", async ({ page }) => {
  await page.goto("/dnd5e/characters/new");
  await chooseCreationCard(page, "Humano");
  await chooseCreationCard(page, "Guerreiro");
  await chooseCreationCard(page, "Soldado");
  await page.getByRole("button", { name: "Próximo" }).click();
  await page.getByLabel("Estilo de Combate, escolha 1 de 1").selectOption("defesa");
  await page.getByPlaceholder("Nome do personagem").fill("Mara Defensora");
  await page.getByRole("button", { name: "Finalizar" }).click();

  const id = decodeURIComponent(new URL(page.url()).pathname.split("/").at(-1));
  await expect.poll(async () => (
    await readDurableCharacter(page, id)
  )?.data?.escolhasClasse?.guerreiro?.["guerreiro-estilo"]).toEqual(["defesa"]);
  await expect(page.getByLabel("Estilo de Combate, escolha 1 de 1")).toHaveValue("defesa");
});

test("ME-02C persiste escolha de subclasse na fronteira do nível 10", async ({ page }) => {
  await page.goto("/dnd5e/characters/new");
  await page.getByRole("button", { name: "Pular e criar ficha em branco" }).click();
  await page.getByRole("combobox", { name: "Classe", exact: true }).selectOption("guerreiro");
  const nivel = page.getByRole("spinbutton", { name: "Nível", exact: true });
  await nivel.fill("10");
  await nivel.press("Enter");
  await page.getByRole("combobox", { name: "Subclasse", exact: true }).selectOption("campeao");
  await page.getByLabel("Estilo de Combate, escolha 1 de 1").selectOption("defesa");
  await page.getByLabel("Estilo de Combate Adicional, escolha 1 de 1").selectOption("arquearia");

  const id = decodeURIComponent(new URL(page.url()).pathname.split("/").at(-1));
  await expect.poll(async () => (await readDurableCharacter(page, id))?.data?.escolhasSubclasse?.campeao?.["campeao-estilo-adicional"]).toEqual(["arquearia"]);
});

test("FE-04B exclui para a lixeira e restaura após recarregar", async ({ page }) => {
  await page.goto("/dnd5e/characters/new");
  await page.getByRole("button", { name: "Pular e criar ficha em branco" }).click();
  await page.getByLabel("Editar nome do personagem").fill("Ficha Recuperável");
  await page.goto("/dnd5e");

  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Excluir Ficha Recuperável" }).click();
  await expect(page.getByText("Ficha Recuperável")).toBeVisible();
  await expect(page.getByRole("button", { name: "Restaurar" })).toBeVisible();

  await page.reload();
  await expect(page.getByRole("button", { name: "Restaurar" })).toBeVisible();
  await page.getByRole("button", { name: "Restaurar" }).click();
  await expect(page.getByRole("link", { name: "Acessar ficha" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Restaurar" })).toHaveCount(0);
});

test("FE-04B preserva o aviso visível quando a gravação durável falha", async ({ page }) => {
  await page.addInitScript(() => {
    const original = IDBObjectStore.prototype.put;
    IDBObjectStore.prototype.put = function put(value, key) {
      const request = original.call(this, value, key);
      if (this.name === "characters") {
        const transaction = this.transaction;
        request.addEventListener("success", () => {
          transaction.abort();
        }, { once: true });
      }
      return request;
    };
  });
  await page.goto("/dnd5e/characters/new");
  await page.getByRole("button", { name: "Pular e criar ficha em branco" }).click();
  const alert = page.getByRole("alert");
  await expect(alert).toContainText("Suas alterações não foram salvas", { timeout: 15_000 });

  await page.evaluate(() => {
    const currentAlert = document.querySelector('[role="alert"]');
    window.__persistenceAlertRemoved = false;
    const observer = new MutationObserver((records) => {
      if (records.some((record) => [...record.removedNodes].some((node) => node === currentAlert || node.contains?.(currentAlert)))) {
        window.__persistenceAlertRemoved = true;
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    window.__persistenceAlertObserver = observer;
  });

  await page.getByRole("button", { name: "Tentar novamente" }).click();
  await expect(alert).toContainText("Suas alterações não foram salvas", { timeout: 15_000 });
  expect(await page.evaluate(() => {
    window.__persistenceAlertObserver?.disconnect();
    return window.__persistenceAlertRemoved;
  })).toBe(false);
});


import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

async function escolherCardCriacao(page, nome) {
  const card = page.getByRole("heading", { name: nome, exact: true }).locator("..").locator("..");
  await card.getByRole("button", { name: "Escolher" }).click();
}

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

test("FE-01 entrada e criação genéricas encaminham diretamente para D&D", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/dnd5e$/);
  await expect(page.getByRole("heading", { name: /Personagens D&D/ })).toBeVisible();
  await page.goto("/characters/new");
  await expect(page).toHaveURL(/\/dnd5e\/characters\/new$/);
  await expect(page.getByRole("heading", { name: "Criar personagem D&D 5e" })).toBeVisible();
});

test("VA-01 modal mantém foco, torna o fundo inerte e devolve foco ao acionador", async ({ page }) => {
  await page.goto("/dnd5e/characters/new");
  await page.getByRole("button", { name: "Pular e criar ficha em branco" }).click();
  await page.getByRole("tab", { name: "Inventário" }).click();

  const acionador = page.locator(".inventario-abrir-catalogo");
  await expect(acionador).toHaveAccessibleName("Adicionar itens");
  await acionador.click();
  const dialog = page.getByRole("dialog", { name: "Adicionar Itens" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("button", { name: "Fechar" })).toBeFocused();
  await expect(acionador).toHaveAttribute("inert", "");

  await dialog.evaluate((elemento) => {
    const oculto = document.createElement("button");
    oculto.hidden = true;
    oculto.textContent = "Controle oculto de teste";
    elemento.append(oculto);
  });
  const ultimoVisivel = dialog.locator("button:not([hidden]):visible").last();
  await page.keyboard.press("Shift+Tab");
  await expect(ultimoVisivel).toBeFocused();

  const results = await new AxeBuilder({ page }).include(".modal-backdrop").analyze();
  expect(results.violations).toEqual([]);

  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(acionador).toBeFocused();
  await expect(acionador).not.toHaveAttribute("inert", "");
});

test("VA-01 abas lazy usam ativação manual e permanecem visíveis por teclado", async ({ page }) => {
  await page.goto("/dnd5e/characters/new");
  await page.getByRole("button", { name: "Pular e criar ficha em branco" }).click();

  const combate = page.getByRole("tab", { name: "Combate" });
  const habilidades = page.getByRole("tab", { name: "Habilidades" });
  const notas = page.getByRole("tab", { name: "Notas" });
  await combate.focus();
  await page.keyboard.press("ArrowRight");
  await expect(habilidades).toBeFocused();
  await expect(combate).toHaveAttribute("aria-selected", "true");
  await expect(habilidades).toHaveAttribute("aria-selected", "false");

  await page.keyboard.press("Enter");
  await expect(habilidades).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("tabpanel")).toHaveAttribute("aria-labelledby", "ficha-aba-habilidades");

  await page.keyboard.press("End");
  await expect(notas).toBeFocused();
  await expect(habilidades).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("Space");
  await expect(notas).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("tabpanel")).toHaveAttribute("aria-labelledby", "ficha-aba-notas");

  const layout = await page.evaluate(() => {
    const tablist = document.querySelector('[role="tablist"]');
    const tab = document.querySelector('#ficha-aba-notas');
    const lista = tablist?.getBoundingClientRect();
    const selecionada = tab?.getBoundingClientRect();
    return {
      semOverflowDaPagina: document.documentElement.scrollWidth <= window.innerWidth,
      abaVisivel: Boolean(lista && selecionada && selecionada.left >= lista.left && selecionada.right <= lista.right),
    };
  });
  expect(layout).toEqual({ semOverflowDaPagina: true, abaVisivel: true });
});

test("VA-01 criação anuncia etapas, move foco e mantém campos nomeados", async ({ page }) => {
  await page.goto("/dnd5e/characters/new");
  await expect(page.locator(".criacao-passos")).toHaveAttribute("tabindex", "0");
  await expect(page.locator('[aria-current="step"]')).toContainText("Raça");

  await escolherCardCriacao(page, "Humano");
  await expect(page.getByRole("heading", { name: "Escolha sua Classe" })).toBeFocused();
  await expect(page.locator('[aria-current="step"]')).toContainText("Classe");
  await escolherCardCriacao(page, "Guerreiro");
  await expect(page.getByRole("heading", { name: "Escolha seu Antecedente" })).toBeFocused();
  await escolherCardCriacao(page, "Soldado");
  await expect(page.getByRole("heading", { name: "Distribua seus Atributos" })).toBeFocused();
  await page.getByRole("button", { name: "Próximo" }).click();
  await expect(page.getByRole("heading", { name: "Toques Finais" })).toBeFocused();
  await expect(page.locator('[aria-current="step"]')).toContainText("Toques Finais");

  const results = await new AxeBuilder({ page }).include("main").analyze();
  expect(results.violations).toEqual([]);
});

test("VA-01 importação, gravação e rolagem possuem feedback acessível", async ({ page }) => {
  await page.goto("/dnd5e");
  await page.locator('input[type="file"]').setInputFiles({
    name: "invalido.json",
    mimeType: "application/json",
    buffer: Buffer.from("{ arquivo inválido"),
  });
  const erroImportacao = page.getByRole("alert");
  await expect(erroImportacao).toContainText("Não foi possível importar");
  await expect(erroImportacao).toBeFocused();

  await page.goto("/dnd5e/characters/new");
  await page.getByRole("button", { name: "Pular e criar ficha em branco" }).click();
  await page.getByLabel("Editar nome do personagem").fill("Ficha com feedback");
  await expect(page.locator("[data-persistence-status]")).toContainText(
    "Alterações salvas neste dispositivo",
    { timeout: 10_000 }
  );

  await page.getByTitle(/Rolar iniciativa/).click();
  await expect(page.locator(".painel-rolagens > [role='status']")).toContainText(/resultado/i);
  const toggle = page.locator(".painel-rolagens-toggle");
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
});

test("VA-01 ficha mantém reflow em 320 px e passa axe nas seções atuais", async ({ page }) => {
  test.setTimeout(90_000);
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("/dnd5e/characters/new");
  await page.getByRole("button", { name: "Pular e criar ficha em branco" }).click();

  for (const nome of ["Combate", "Habilidades", "Perícias", "Magias", "Inventário", "Notas"]) {
    await page.getByRole("tab", { name: nome }).click();
    await expect(page.getByRole("tabpanel")).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    const results = await new AxeBuilder({ page }).include("main").analyze();
    expect(results.violations, `violações na aba ${nome}`).toEqual([]);
  }

  await expect(page.getByRole("heading", { level: 2, name: "Identidade e progressão" })).toHaveCount(1);
});


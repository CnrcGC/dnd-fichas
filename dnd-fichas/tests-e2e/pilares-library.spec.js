import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFile } from "node:fs/promises";

const legacyCharacter = {
  id: "pilares-e2e",
  createdAt: "2026-01-10T10:00:00.000Z",
  updatedAt: "2026-02-12T12:30:00.000Z",
  identity: { name: "Kang Ji-ho", level: 3, school: "seirin" },
  attributes: {
    strength: 2, agility: 5, constitution: 3, size: 2, power: 4,
    intelligence: 6, charisma: 3, reaction: 5, health: 4,
  },
  resources: { currentLife: 35, maxLife: 44, currentStamina: 200, maxStamina: 275 },
  conditions: ["amedrontado"],
  talents: [{ id: "talento-e2e", name: "Passo Rápido", category: "agil", action: "Padrão", staminaCostPercent: 15, description: "Avanço veloz." }],
  genius: { name: "Olhar Analítico", abilities: [{ id: "genius-e2e", name: "Leitura", level: "Nível 1", action: "Padrão", staminaCost: 5, description: "Texto personalizado" }] },
  inventory: [{ id: "item-e2e", name: "Faixas", quantity: 2, customText: "Presente" }],
  notes: "Notas antigas.",
};

test.beforeEach(async ({ page }) => {
  await page.addInitScript((character) => {
    localStorage.setItem("yusong.characters", JSON.stringify([character]));
    localStorage.setItem("yusong.activeCharacterId", character.id);
  }, legacyCharacter);
});

test("importa e lista Pilares de Atlas sem apagar a origem legada", async ({ page }) => {
  await page.goto("/yusong");
  await expect(page.getByRole("heading", { name: "Personagens de Pilares de Atlas" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Kang Ji-ho" })).toBeVisible();
  await expect(page.getByText("Nível 3", { exact: true })).toBeVisible();
  await expect(page.getByText("Academia Seirin", { exact: true })).toBeVisible();
  await expect(page.getByText("Último ativo")).toBeVisible();
  await expect.poll(() => page.evaluate(() => localStorage.getItem("yusong.characters"))).toBe(JSON.stringify([legacyCharacter]));
});

test("mantém IndexedDB como fonte de verdade e oferece exclusão recuperável", async ({ page }) => {
  await page.goto("/yusong");
  await expect(page.getByRole("heading", { name: "Kang Ji-ho" })).toBeVisible();

  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Mover para lixeira" }).click();
  await expect(page.getByRole("heading", { name: "Nenhum personagem salvo" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Lixeira" })).toBeVisible();
  await page.getByRole("button", { name: "Restaurar" }).click();
  await expect(page.getByRole("heading", { name: "Kang Ji-ho" })).toBeVisible();

  await page.evaluate(() => localStorage.removeItem("yusong.characters"));
  await page.reload();
  await expect(page.getByRole("heading", { name: "Kang Ji-ho" })).toBeVisible();
});

test("cria e edita a identidade de Pilares de Atlas com persistência após reload", async ({ page }) => {
  await page.goto("/yusong/characters/new");
  await expect(page.getByRole("heading", { name: "Novo personagem de Pilares de Atlas" })).toBeVisible();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.getByLabel("Nome").fill("Hana Lee");
  await page.getByLabel("Nível").fill("4");
  await page.getByLabel("Academia").selectOption("shinnen");
  await page.getByLabel("Tipo").selectOption("prodigio");
  await page.getByLabel("Classe").selectOption("tatico");
  await page.getByLabel("Origem").selectOption({ label: "Lutador Profissional" });
  await page.getByLabel("Arte marcial").selectOption({ label: "Judô" });
  await page.getByLabel("Conceito").fill("Estrategista da equipe");
  await page.getByRole("button", { name: "Criar personagem" }).click();

  await expect(page).toHaveURL(/\/yusong\/characters\/.+$/);
  await expect(page.getByRole("heading", { name: "Hana Lee" })).toBeVisible();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.getByLabel("Nome", { exact: true }).fill("Hana Lee Atualizada");
  await page.getByLabel("Nível").fill("5");
  await page.getByRole("button", { name: "Salvar ficha" }).click();
  await expect(page.getByRole("status")).toContainText("Ficha salva");
  await expect(page.getByRole("heading", { name: "Hana Lee Atualizada" })).toBeVisible();

  await page.reload();
  await expect(page.getByRole("heading", { name: "Hana Lee Atualizada" })).toBeVisible();
  await expect(page.getByLabel("Nível")).toHaveValue("5");
  await page.getByRole("link", { name: "Voltar para personagens" }).click();
  await expect(page.getByRole("heading", { name: "Hana Lee Atualizada" })).toBeVisible();
});

test("gera um personagem aleatório acessível e o salva sem buscar avatar externo", async ({ page }) => {
  const externalAvatarRequests = [];
  page.on("request", (request) => {
    if (request.url().includes("dicebear.com")) externalAvatarRequests.push(request.url());
  });
  await page.goto("/yusong/characters/new");
  await page.getByRole("button", { name: "Gerar personagem aleatório" }).click();

  const generatedName = await page.getByLabel("Nome").inputValue();
  expect(generatedName).not.toBe("Sem nome");
  await expect(page.getByRole("status")).toContainText(`Personagem aleatório gerado: ${generatedName}`);
  await expect(page.getByText("Nenhuma imagem externa é carregada automaticamente.")).toBeVisible();
  await expect(page.getByLabel("Academia")).not.toHaveValue("");
  await expect(page.getByLabel("Classe")).not.toHaveValue("");
  expect(externalAvatarRequests).toEqual([]);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);

  await page.getByRole("button", { name: "Criar personagem" }).click();
  await expect(page.getByRole("heading", { name: generatedName })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("heading", { name: generatedName })).toBeVisible();
});

test("edita atributos e recursos enquanto derivados permanecem calculados pelo engine", async ({ page }) => {
  await page.goto("/yusong/characters/pilares-e2e");
  await expect(page.getByRole("heading", { name: "Kang Ji-ho" })).toBeVisible();
  await expect(page.getByLabel("Vida máxima 44")).toBeVisible();
  await expect(page.getByLabel("Stamina máxima 275")).toBeVisible();
  await expect(page.getByText("Esquiva", { exact: true }).locator("..")).toContainText("1d12");

  await page.getByLabel("Saúde (SAU)").fill("5");
  await page.getByLabel("Saúde (SAU)").press("Tab");
  await expect(page.getByLabel("Vida máxima 52")).toBeVisible();
  await expect(page.getByLabel("Stamina máxima 300")).toBeVisible();

  await page.getByLabel("Reação (REA)").fill("1");
  await page.getByLabel("Reação (REA)").press("Tab");
  await expect(page.getByText("Esquiva", { exact: true }).locator("..")).toContainText("1d8");

  await page.getByLabel(/Vida atual/).fill("999");
  await page.getByLabel(/Vida atual/).press("Tab");
  await expect(page.getByLabel(/Vida atual/)).toHaveValue("52");
  await page.getByRole("button", { name: "Salvar ficha" }).click();
  await expect(page.getByRole("status")).toContainText("Ficha salva");

  await page.reload();
  await expect(page.getByLabel("Saúde (SAU)")).toHaveValue("5");
  await expect(page.getByLabel("Reação (REA)")).toHaveValue("1");
  await expect(page.getByLabel(/Vida atual/)).toHaveValue("52");
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});

test("edita as sete regiões, recupera membro inutilizado e redistribui dados", async ({ page }) => {
  await page.goto("/yusong/characters/pilares-e2e");
  await expect(page.getByRole("heading", { name: "Corpo" })).toBeVisible();
  await expect(page.locator(".pilares-body__part")).toHaveCount(7);

  const abdomen = page.locator(".pilares-body__part").filter({ has: page.getByRole("heading", { name: "Abdômen" }) });
  await page.getByLabel("Armadura atual de Abdômen").fill("0");
  await page.getByLabel("Armadura atual de Abdômen").press("Tab");
  await expect(abdomen.getByText("Inutilizado")).toBeVisible();
  await page.getByLabel("Armadura atual de Abdômen").fill("10");
  await page.getByLabel("Armadura atual de Abdômen").press("Tab");
  await expect(abdomen.getByText("Normal", { exact: true })).toBeVisible();

  await page.getByLabel("Dado de Braço Direito").selectOption("1d12");
  await expect(page.getByLabel("Dado de Braço Direito")).toHaveValue("1d12");
  await expect(page.getByLabel("Dado de Perna Esquerda")).toHaveValue("1d6");
  await expect(page.getByLabel("Armadura máxima de Braço Direito: 24")).toBeVisible();
  await expect(page.getByLabel("Armadura máxima de Perna Esquerda: 12")).toBeVisible();

  await page.getByLabel("Armadura atual de Braço Direito").fill("999");
  await page.getByLabel("Armadura atual de Braço Direito").press("Tab");
  await expect(page.getByLabel("Armadura atual de Braço Direito")).toHaveValue("24");
  await page.getByRole("button", { name: "Reduzir armadura de Cabeça" }).click();
  await expect(page.getByLabel("Armadura atual de Cabeça")).toHaveValue("19");

  await page.getByRole("button", { name: "Salvar ficha" }).click();
  await expect(page.getByRole("status")).toContainText("Ficha salva");
  await page.reload();
  await expect(page.getByLabel("Armadura atual de Abdômen")).toHaveValue("10");
  await expect(page.getByLabel("Dado de Braço Direito")).toHaveValue("1d12");
  await expect(page.getByLabel("Dado de Perna Esquerda")).toHaveValue("1d6");
  await expect(page.getByLabel("Armadura atual de Braço Direito")).toHaveValue("24");
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});

test("edita Perícias e aplica Condições às rolagens com persistência", async ({ page }) => {
  await page.goto("/yusong/characters/pilares-e2e");
  await expect(page.getByRole("heading", { name: "Perícias e condições" })).toBeVisible();

  await page.getByLabel("Graduação de Acrobacia").selectOption("2");
  await page.getByRole("button", { name: "Rolar Acrobacia" }).click();
  await expect(page.getByText(/1d20\+8-4/)).toBeVisible();

  const frightened = page.locator('[data-condition-id="amedrontado"]');
  await frightened.locator("summary").click();
  await expect(frightened.getByRole("checkbox", { name: "Amedrontado ativa" })).toBeChecked();
  await frightened.getByRole("checkbox", { name: "Amedrontado ativa" }).uncheck();

  const motivated = page.locator('[data-condition-id="motivado"]');
  await motivated.locator("summary").click();
  await motivated.getByRole("checkbox", { name: "Motivado ativa" }).check();
  await page.getByRole("button", { name: "Rolar Acrobacia" }).click();
  await expect(page.getByText(/1d20\+8\+4/)).toBeVisible();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);

  await page.getByRole("button", { name: "Salvar ficha" }).click();
  await page.reload();
  await expect(page.getByLabel("Graduação de Acrobacia")).toHaveValue("2");
  await frightened.locator("summary").click();
  await motivated.locator("summary").click();
  await expect(frightened.getByRole("checkbox", { name: "Amedrontado ativa" })).not.toBeChecked();
  await expect(motivated.getByRole("checkbox", { name: "Motivado ativa" })).toBeChecked();
});

test("gerencia itens do sistema, itens personalizados e notas com persistência", async ({ page }) => {
  await page.goto("/yusong/characters/pilares-e2e");
  await expect(page.getByRole("heading", { name: "Inventário e notas" })).toBeVisible();

  await page.getByRole("button", { name: "Adicionar item", exact: true }).click();
  const addEditor = page.getByRole("group", { name: "Adicionar item" });
  await addEditor.getByLabel("Item do sistema").selectOption("katana-espada");
  await expect(addEditor.getByLabel("Nome")).toHaveValue("Katana/Espada");
  await expect(addEditor.getByLabel("Nome")).toBeDisabled();
  await addEditor.getByLabel("Quantidade").fill("2");
  await addEditor.getByRole("button", { name: "Salvar item" }).click();

  const katana = page.locator('[data-item-id]').filter({ hasText: "Katana/Espada" });
  await katana.locator("summary").click();
  await expect(katana).toContainText("+3d12+6");
  await expect(katana).toContainText("84");
  await katana.getByRole("button", { name: "Editar item" }).click();
  const editEditor = page.getByRole("group", { name: "Editar Katana/Espada" });
  await editEditor.getByLabel("Quantidade").fill("3");
  await editEditor.getByRole("button", { name: "Salvar item" }).click();

  await page.getByRole("button", { name: "Adicionar item", exact: true }).click();
  const customEditor = page.getByRole("group", { name: "Adicionar item" });
  await customEditor.getByRole("button", { name: "Criar item" }).click();
  await customEditor.getByLabel("Nome").fill("Caderno");
  await customEditor.getByLabel("Categoria").fill("Utilitário");
  await customEditor.getByLabel("Quantidade").fill("2");
  await customEditor.getByLabel("Descrição").fill("Pistas importantes.");
  await customEditor.getByRole("button", { name: "Salvar item" }).click();

  const bands = page.locator('[data-item-id="item-e2e"]');
  await bands.locator("summary").click();
  await bands.getByRole("button", { name: "Remover item" }).click();
  await page.getByLabel("Notas da personagem").fill("Encontro marcado no porto.");
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);

  await page.getByRole("button", { name: "Salvar ficha" }).click();
  await page.reload();
  await expect(page.locator('[data-item-id="item-e2e"]')).toHaveCount(0);
  await expect(page.getByText("Katana/Espada", { exact: true }).locator("..")).toContainText("3×");
  await expect(page.getByText("Caderno", { exact: true })).toBeVisible();
  await expect(page.getByLabel("Notas da personagem")).toHaveValue("Encontro marcado no porto.");
});

test("filtra o catálogo original e adiciona Talento com persistência", async ({ page }) => {
  await page.goto("/yusong/characters/pilares-e2e");
  await page.getByRole("button", { name: "Adicionar Talento", exact: true }).click();

  const catalog = page.getByRole("region", { name: "Catálogo de Talentos" });
  await expect(catalog.getByText("49 Talentos encontrados.")).toBeVisible();
  await catalog.getByLabel("Categoria").selectOption("bruto");
  await expect(catalog.getByText("10 Talentos encontrados.")).toBeVisible();
  await catalog.getByLabel("Buscar Talento").fill("Corpo de Ferro");
  await expect(catalog.getByText("1 Talento encontrado.")).toBeVisible();

  await catalog.getByText("Corpo de Ferro", { exact: true }).click();
  await expect(catalog.getByText("36 Stamina (13%)")).toBeVisible();
  await catalog.getByRole("button", { name: "Adicionar Corpo de Ferro" }).click();
  await expect(page.getByLabel("2 Talentos adicionados")).toBeVisible();
  await expect(catalog.getByRole("button", { name: "Corpo de Ferro já adicionado" })).toBeDisabled();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);

  await page.getByRole("button", { name: "Fechar catálogo" }).click();
  await page.getByRole("button", { name: "Salvar ficha" }).click();
  await page.reload();
  await expect(page.getByText("Corpo de Ferro", { exact: true })).toBeVisible();
  await expect(page.getByLabel("2 Talentos adicionados")).toBeVisible();
});

test("usa Talento e mantém CRUD personalizado de Genius com custo de Stamina", async ({ page }) => {
  await page.goto("/yusong/characters/pilares-e2e");
  await expect(page.getByRole("heading", { name: "Talentos e Genius" })).toBeVisible();

  await page.getByText("Passo Rápido", { exact: true }).click();
  await expect(page.getByText("42 Stamina (15%)")).toBeVisible();
  await page.getByRole("button", { name: "Usar Talento" }).click();
  await expect(page.getByLabel(/Stamina atual/)).toHaveValue("158");
  await page.getByRole("button", { name: "Remover Talento" }).click();
  await expect(page.getByText("Passo Rápido", { exact: true })).toHaveCount(0);

  await expect(page.getByLabel("Nome do Genius")).toHaveValue("Olhar Analítico");
  await page.getByText("Leitura", { exact: true }).click();
  await page.getByRole("button", { name: "Usar habilidade" }).click();
  await expect(page.getByLabel(/Stamina atual/)).toHaveValue("153");
  await page.getByRole("button", { name: "Editar habilidade" }).click();
  const editGroup = page.getByRole("group", { name: "Editar habilidade Genius" });
  await editGroup.getByLabel("Nome").fill("Leitura Avançada");
  await editGroup.getByLabel("Descrição").fill("Texto personalizado atualizado");
  await editGroup.getByRole("button", { name: "Salvar habilidade" }).click();
  await expect(page.getByText("Leitura Avançada", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Nova habilidade" }).click();
  const newGroup = page.getByRole("group", { name: "Nova habilidade Genius" });
  await newGroup.getByLabel("Nome").fill("Análise de Combate");
  await newGroup.getByLabel("Ação").selectOption("Padrão");
  await newGroup.getByLabel("Custo de Stamina").fill("7");
  await newGroup.getByLabel("Descrição").fill("Prevê a próxima ação.");
  await newGroup.getByRole("button", { name: "Salvar habilidade" }).click();
  const newAbility = page.locator(".pilares-talents__card").filter({ hasText: "Análise de Combate" });
  await newAbility.getByText("Análise de Combate", { exact: true }).click();
  await newAbility.getByRole("button", { name: "Usar habilidade" }).click();
  await expect(page.getByLabel(/Stamina atual/)).toHaveValue("146");

  await page.getByRole("button", { name: "Salvar ficha" }).click();
  await page.reload();
  await expect(page.getByLabel(/Stamina atual/)).toHaveValue("146");
  await expect(page.getByText("Passo Rápido", { exact: true })).toHaveCount(0);
  await expect(page.getByText("Leitura Avançada", { exact: true })).toBeVisible();
  await expect(page.getByText("Análise de Combate", { exact: true })).toBeVisible();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});

test("bloqueia edição no modo de apresentação e persiste a preferência de som", async ({ page }) => {
  await page.goto("/yusong/characters/pilares-e2e");
  const presentationToggle = page.getByRole("button", { name: "Entrar no modo de apresentação" });
  const soundToggle = page.getByRole("button", { name: "Desligar som das rolagens" });

  await presentationToggle.click();
  await expect(page.getByRole("status")).toContainText("Modo de apresentação ativo");
  await expect(page.getByLabel("Nome", { exact: true })).toBeDisabled();
  await expect(page.getByLabel("Saúde (SAU)")).toBeDisabled();
  await expect(page.getByLabel("Armadura atual de Cabeça")).toBeDisabled();
  await expect(page.getByLabel("Graduação de Acrobacia")).toBeDisabled();
  await expect(page.getByLabel("Amedrontado ativa")).toBeDisabled();
  await expect(page.getByLabel("Notas da personagem")).toHaveAttribute("readonly", "");
  await expect(page.getByRole("button", { name: "Salvar ficha" })).toBeDisabled();
  await expect(page.getByRole("button", { name: "Rolar Acrobacia" })).toBeEnabled();
  await page.getByRole("button", { name: "Rolar Acrobacia" }).click();
  await expect(page.getByText(/1d20\+0-4/)).toBeVisible();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);

  await page.getByRole("button", { name: "Sair do modo de apresentação" }).click();
  await expect(page.getByLabel("Nome", { exact: true })).toBeEnabled();
  await soundToggle.click();
  await expect(page.getByRole("button", { name: "Ligar som das rolagens" })).toHaveAttribute("aria-pressed", "true");
  await expect.poll(() => page.evaluate(() => localStorage.getItem("pilares-de-atlas:sound-muted"))).toBe("true");
  await page.reload();
  await expect(page.getByRole("button", { name: "Ligar som das rolagens" })).toBeVisible();
});

test("exporta uma carteirinha PNG original, offline e acessível", async ({ page }) => {
  const forbiddenAssetRequests = [];
  page.on("request", (request) => {
    if (/dicebear|emblems?\//i.test(request.url())) forbiddenAssetRequests.push(request.url());
  });
  await page.goto("/yusong/characters/pilares-e2e");

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Exportar carteirinha PNG" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("carteirinha-kang-ji-ho.png");
  const bytes = await readFile(await download.path());
  expect(Array.from(bytes.subarray(0, 8))).toEqual([137, 80, 78, 71, 13, 10, 26, 10]);
  expect(bytes.length).toBeGreaterThan(1_000);
  await expect(page.getByRole("status", { name: "" })).toContainText("Carteirinha PNG exportada");
  await expect(page.getByText("A carteirinha é um resumo visual.")).toBeVisible();
  expect(forbiddenAssetRequests).toEqual([]);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});

test("aplica as seis identidades de academia com rótulo e contraste em claro e escuro", async ({ page }) => {
  await page.goto("/yusong/characters/new");
  const schools = [
    ["seirin", "Academia Seirin"], ["shinnen", "Instituto Shinnen"],
    ["yosuk", "Academia Yosuk"], ["yusong", "Academia Yusong"],
    ["zanfei", "Academia Zanfei"], ["custom", "Outra academia"],
  ];

  for (const theme of ["light", "dark"]) {
    await page.evaluate((value) => { document.documentElement.dataset.theme = value; }, theme);
    const accents = [];
    for (const [schoolId, label] of schools) {
      await page.getByLabel("Academia").selectOption(schoolId);
      const root = page.locator(".pilares-school-theme").first();
      await expect(root).toHaveAttribute("data-school", schoolId);
      await expect(page.getByText(label, { exact: true }).first()).toBeVisible();
      accents.push(await root.evaluate((element) => getComputedStyle(element).getPropertyValue("--pilares-school-accent").trim()));
    }
    expect(new Set(accents).size).toBe(6);
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  }
});

test("VA-07 mantém biblioteca, criação e ficha responsivas, lineares e operáveis sem som", async ({ page }) => {
  const routes = [
    ["/yusong", "Personagens de Pilares de Atlas"],
    ["/yusong/characters/new", "Novo personagem de Pilares de Atlas"],
    ["/yusong/characters/pilares-e2e", "Kang Ji-ho"],
  ];

  for (const viewport of [{ width: 320, height: 720 }, { width: 768, height: 900 }, { width: 1280, height: 900 }]) {
    await page.setViewportSize(viewport);
    for (const [route, heading] of routes) {
      await page.goto(route);
      await expect(page.getByRole("heading", { name: heading, exact: true })).toBeVisible();
      const overflow = await page.evaluate(() => ({
        documentWidth: document.documentElement.scrollWidth,
        viewportWidth: window.innerWidth,
      }));
      expect(overflow.documentWidth, `${route} em ${viewport.width}px`).toBeLessThanOrEqual(overflow.viewportWidth);
    }
  }

  await page.goto("/yusong/characters/new");
  let reachedRandomGenerator = false;
  for (let index = 0; index < 40; index += 1) {
    await page.keyboard.press("Tab");
    reachedRandomGenerator = await page.evaluate(() => document.activeElement?.textContent?.trim() === "Gerar personagem aleatório");
    if (reachedRandomGenerator) break;
  }
  expect(reachedRandomGenerator).toBe(true);
  await page.keyboard.press("Enter");
  await expect(page.getByRole("status")).toContainText("Personagem aleatório gerado");

  await page.evaluate(() => localStorage.setItem("pilares-de-atlas:sound-muted", "true"));
  await page.goto("/yusong/characters/pilares-e2e");
  await expect(page.getByRole("button", { name: "Ligar som das rolagens" })).toBeVisible();
  const rollButton = page.getByRole("button", { name: "Rolar Acrobacia" });
  await rollButton.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByText(/1d20\+0-4/)).toBeVisible();

  const bodyParts = page.locator(".pilares-body__part");
  await expect(bodyParts).toHaveCount(7);
  await expect(bodyParts.locator("h3")).toHaveText([
    "Cabeça", "Torso", "Abdômen", "Braço Direito", "Braço Esquerdo", "Perna Direita", "Perna Esquerda",
  ]);
  for (let index = 0; index < 7; index += 1) {
    const part = bodyParts.nth(index);
    await expect(part).toContainText(index < 3 ? "Região vital" : "Membro");
    await expect(part).toContainText(/Normal|Inutilizado/);
    await expect(part.locator("fieldset")).toBeVisible();
  }
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});

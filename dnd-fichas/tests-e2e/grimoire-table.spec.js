import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir } from "node:fs/promises";
import { importCharacter, waitForSave, readCharacter } from "./helpers/dnd.js";
import { setTheme, setRange } from "./helpers/preferences.js";

const character = {
  nome: "Alena, guardiã das páginas do Vale",
  classeId: "mago", subclasseId: "escola-evocacao",
  recursos: [{ id: "reserve", nome: "Reserva arcana", usosMax: 2, usosGastos: 1, restauraEm: "longo" }],
  inventario: [{ id: "rope", nome: "Corda de exploração", quantidade: 1, peso: 1, tipoItem: "equipamento" }],
  magias: [{ id: "detect", nome: "Detectar Magia", nivel: 1, classeId: "mago", preparada: true }],
};
const capture = async (page, name, testInfo) => {
  await mkdir("output/visual-grimoire/table", { recursive: true });
  await page.screenshot({ path: `output/visual-grimoire/table/${name}-${testInfo.project.name}.png` });
};
async function noOverflow(page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
}
async function axe(page) {
  const result = await new AxeBuilder({ page }).analyze();
  expect(result.violations.map(({ id, nodes }) => ({ id, targets: nodes.map((node) => node.target) }))).toEqual([]);
}

for (const theme of ["light", "dark"]) {
  test(`VIS-G05 ações, resultados e leitura / ${theme}`, async ({ page }, testInfo) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await importCharacter(page, character);
    await setTheme(page, theme);
    await page.getByRole("tab", { name: "Habilidades", exact: true }).click();
    const pip = page.getByRole("button", { name: "Reserva arcana — uso 2", exact: true });
    await pip.focus();
    await pip.press("Space");
    await expect(page.locator(".recurso-usos")).toContainText("0 de 2 usos disponíveis");
    await expect(pip).toHaveAttribute("aria-pressed", "true");
    await waitForSave(page);
    await capture(page, `recursos-${theme}`, testInfo);
    await page.evaluate(() => { Math.random = () => 0.999; });
    await page.getByRole("button", { name: /Rolar teste de Força/ }).click();
    const announcements = page.getByRole("status").filter({ hasText: /Teste de Força.*Resultado/ });
    await expect(announcements).toHaveCount(1);
    await expect(announcements).toContainText("Crítico");
    await page.evaluate(() => window.scrollTo({ top: 900, behavior: "instant" }));
    await expect(page.getByRole("button", { name: "Voltar ao topo" })).toBeVisible();
    const toggle = page.locator(".painel-rolagens-toggle");
    await toggle.press("Enter");
    const history = page.getByRole("region", { name: "Histórico de rolagens" });
    await expect(history.getByRole("heading", { name: "Teste de Força" })).toBeVisible();
    await expect(history.locator(".item-rolagem-resultado")).toContainText("23");
    if (page.viewportSize().width <= 640) await expect(page.getByRole("button", { name: "Voltar ao topo" })).toBeHidden();
    await history.getByLabel("Vantagem", { exact: true }).check();
    await history.getByLabel("Desvantagem", { exact: true }).check();
    await expect(history).toContainText("As duas se cancelam");
    await axe(page);
    await capture(page, `rolagens-${theme}`, testInfo);
    await page.keyboard.press("Escape");
    await expect(toggle).toBeFocused();
    await expect(history).toHaveCount(0);
    await page.evaluate(() => window.scrollTo({ top: 900, behavior: "instant" }));
    await expect(page.getByRole("button", { name: "Voltar ao topo" })).toBeVisible();
    await page.getByRole("tab", { name: "Inventário", exact: true }).click();
    await page.getByLabel("Quantidade de Corda de exploração", { exact: true }).fill("3");
    const opener = page.getByRole("button", { name: "Adicionar itens", exact: true });
    await opener.click();
    const dialog = page.getByRole("dialog", { name: /Adicionar itens/i });
    const close = dialog.getByRole("button", { name: "Fechar", exact: true });
    await expect(close).toBeFocused();
    await expect(dialog.getByRole("button", { name: "Armas", exact: true })).toHaveAttribute("aria-pressed", "true");
    await dialog.getByRole("button", { name: "Armaduras", exact: true }).click();
    await expect(dialog.getByRole("button", { name: "Armaduras", exact: true })).toHaveAttribute("aria-pressed", "true");
    await expect(dialog.getByRole("button", { name: "Armas", exact: true })).toHaveAttribute("aria-pressed", "false");
    await dialog.getByRole("button", { name: "Armas", exact: true }).click();
    await close.focus();
    await page.keyboard.press("Shift+Tab");
    expect(await dialog.evaluate((element) => element.contains(document.activeElement))).toBe(true);
    await axe(page);
    expect(await dialog.locator(".item-catalogo-adicionar").evaluateAll((buttons) => buttons.filter((button) => {
      const card = button.closest(".item-catalogo").getBoundingClientRect();
      const action = button.getBoundingClientRect();
      return action.top < card.top || action.bottom > card.bottom || action.left < card.left || action.right > card.right;
    }).map((button) => button.getAttribute("aria-label")))).toEqual([]);
    await capture(page, `modal-itens-${theme}`, testInfo);
    await page.keyboard.press("Escape");
    await expect(opener).toBeFocused();
    await page.getByRole("tab", { name: "Magias", exact: true }).click();
    await page.getByLabel("Nome da magia", { exact: true }).fill("Anotação arcana do Vale");
    await waitForSave(page);
    const saved = await readCharacter(page);
    expect(saved.recursos.find(({ id }) => id === "reserve").usosGastos).toBe(2);
    expect(saved.inventario.find(({ id }) => id === "rope").quantidade).toBe(3);
    expect(saved.magias.find(({ id }) => id === "detect").nome).toBe("Anotação arcana do Vale");
    await page.reload();
    await page.getByRole("tab", { name: "Magias", exact: true }).click();
    await expect(page.getByLabel("Nome da magia", { exact: true })).toHaveValue("Anotação arcana do Vale");
  });

  test(`VIS-G05 reflow de modais e painel em texto 28 px / ${theme}`, async ({ page }, testInfo) => {
    test.setTimeout(120000);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await importCharacter(page, character);
    await setTheme(page, theme);
    await page.getByRole("button", { name: "Configurações de acessibilidade", exact: true }).click();
    await setRange(page, "Tamanho do texto", 28);
    await page.getByRole("switch", { name: "Espaçamento de leitura", exact: true }).check();
    await page.keyboard.press("Escape");
    await page.getByRole("button", { name: /Rolar teste de Força/ }).click();
    for (const width of [320, 390, 768, 1280]) {
      await page.setViewportSize({ width, height: width === 320 ? 500 : 900 });
      const toggle = page.locator(".painel-rolagens-toggle");
      await toggle.click();
      const panel = page.locator(".painel-rolagens");
      const box = await panel.boundingBox();
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.y).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(width);
      expect(await panel.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
      await page.getByRole("region", { name: "Histórico de rolagens" }).getByLabel("Desvantagem", { exact: true }).focus();
      await page.keyboard.press("Escape");
      await expect(toggle).toBeFocused();
      for (const [tab, button, name] of [["Inventário", "Adicionar itens", /Adicionar itens/i], ["Magias", "Adicionar Magias", "Adicionar Magias"]]) {
        await page.getByRole("tab", { name: tab, exact: true }).click();
        const opener = page.getByRole("button", { name: button, exact: true });
        await opener.click();
        const dialog = page.getByRole("dialog", { name });
        const rect = await dialog.boundingBox();
        expect(rect.x).toBeGreaterThanOrEqual(0);
        expect(rect.y).toBeGreaterThanOrEqual(0);
        expect(rect.x + rect.width).toBeLessThanOrEqual(width);
        expect(rect.y + rect.height).toBeLessThanOrEqual(width === 320 ? 500 : 900);
        expect(await dialog.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
        if (tab === "Magias" && width === 390) await axe(page);
        const last = dialog.locator("button:not([disabled])").last();
        await last.focus();
        expect(await last.evaluate((element) => {
          const rect = element.getBoundingClientRect();
          const hit = document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2);
          return element.contains(hit);
        })).toBe(true);
        await page.keyboard.press("Tab");
        expect(await dialog.evaluate((element) => element.contains(document.activeElement))).toBe(true);
        if (tab === "Magias") await capture(page, `modal-magias-${theme}-${width}-28px`, testInfo);
        await page.keyboard.press("Escape");
        await expect(opener).toBeFocused();
      }
      await noOverflow(page);
    }
    await axe(page);
  });
}

test("VIS-G05 temas automáticos preservam contraste nas áreas de mesa", async ({ page }) => {
  test.setTimeout(90000);
  await importCharacter(page, character);
  await expect(page.locator("html")).not.toHaveAttribute("data-theme");
  for (const colorScheme of ["light", "dark"]) {
    await page.emulateMedia({ colorScheme, reducedMotion: "reduce" });
    for (const name of ["Habilidades", "Magias", "Inventário"]) {
      await page.getByRole("tab", { name, exact: true }).click();
      await expect(page.getByRole("tabpanel", { name, exact: true })).toBeVisible();
      await expect(page.locator(".ficha-carregando-secao")).toHaveCount(0);
      await axe(page);
    }
    for (const [random, label] of [[0.5, ""], [0.999, "Crítico"], [0, "Falha crítica"]]) {
      await page.evaluate((value) => { Math.random = () => value; }, random);
      await page.getByRole("button", { name: /Rolar teste de Força/ }).click();
      const toggle = page.locator(".painel-rolagens-toggle");
      if (label) await expect(toggle.locator(".rolagem-estado")).toHaveText(label);
      else await expect(toggle.locator(".rolagem-estado")).toHaveCount(0);
      await toggle.click();
      await axe(page);
      await page.keyboard.press("Escape");
    }
  }
});

test("VIS-G06 falha crítica mantém contraste com brilho e leitura ampliada", async ({ page }, testInfo) => {
  test.setTimeout(90000);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await importCharacter(page, character);
  await page.getByRole("button", { name: "Configurações de acessibilidade", exact: true }).click();
  await setRange(page, "Tamanho do texto", 28);
  await setRange(page, "Brilho do tema claro", 80);
  await page.getByRole("switch", { name: "Espaçamento de leitura", exact: true }).check();
  await page.keyboard.press("Escape");
  for (const theme of ["light", "dark"]) {
    await setTheme(page, theme);
    for (const highContrast of [false, true]) {
      await page.getByRole("button", { name: "Configurações de acessibilidade", exact: true }).click();
      await page.getByRole("switch", { name: "Alto contraste", exact: true }).setChecked(highContrast);
      await page.keyboard.press("Escape");
      await page.evaluate(() => { Math.random = () => 0; });
      await page.getByRole("button", { name: /Rolar teste de Força/ }).click();
      await expect(page.locator(".painel-rolagens-toggle .rolagem-estado")).toHaveText("Falha crítica");
      await page.evaluate(() => window.scrollTo({ top: 900, behavior: "instant" }));
      for (const height of [500, 720]) {
        await page.setViewportSize({ width: page.viewportSize().width, height });
        const back = page.getByRole("button", { name: "Voltar ao topo", exact: true });
        await expect(back).toBeVisible();
        await expect.poll(async () => {
          const arrow = await back.boundingBox();
          const panel = await page.locator(".painel-rolagens").boundingBox();
          return arrow && arrow.y >= 0 && arrow.y + arrow.height <= height
            && (arrow.x + arrow.width <= panel.x || arrow.x >= panel.x + panel.width
              || arrow.y + arrow.height <= panel.y || arrow.y >= panel.y + panel.height);
        }).toBe(true);
      }
      const result = await new AxeBuilder({ page }).include(".painel-rolagens").analyze();
      expect(result.violations.map(({ id, nodes }) => ({ id, targets: nodes.map((node) => node.target) }))).toEqual([]);
      await mkdir("output/visual-grimoire/review/critical", { recursive: true });
      await page.screenshot({ path: `output/visual-grimoire/review/critical/${theme}-${highContrast ? "alto" : "padrao"}-${testInfo.project.name}.png` });
    }
  }
});

test("VIS-G05 painel recolhe quando encobre o foco e mantém Escape", async ({ page }) => {
  await importCharacter(page, character);
  await page.setViewportSize({ width: 390, height: 720 });
  await page.getByRole("button", { name: /Rolar teste de Força/ }).click();
  const toggle = page.locator(".painel-rolagens-toggle");
  await toggle.click();
  const input = page.getByLabel("Editar nome do personagem", { exact: true });
  // Move um controle real da página para a região coberta sem alterar seu layout.
  await input.evaluate((element) => {
    const panel = document.querySelector(".painel-rolagens").getBoundingClientRect();
    const rect = element.getBoundingClientRect();
    window.scrollBy(0, rect.top - panel.top - 30);
  });
  await input.focus();
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await expect(input).toBeFocused();
  expect(await input.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return element.contains(document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2));
  })).toBe(true);
});

test("VIS-G05 selo só aparece após commit; falha e retry permanecem explícitos", async ({ page }, testInfo) => {
  await importCharacter(page, character);
  await page.evaluate(async () => {
    const { IndexedDbCharacterRepository } = await import("/src/platform/persistence/characterRepository.js");
    const original = IndexedDbCharacterRepository.prototype.put;
    window.holdCharacterWrite = true;
    window.failCharacterWrite = false;
    IndexedDbCharacterRepository.prototype.put = async function (...args) {
      if (window.holdCharacterWrite) await new Promise((resolve) => { window.releaseCharacterWrite = resolve; });
      if (window.failCharacterWrite) throw new DOMException("Sem espaço", "QuotaExceededError");
      return original.apply(this, args);
    };
  });
  await page.getByLabel("Editar nome do personagem", { exact: true }).fill("Nome com gravação pendente");
  const status = page.locator(".persistencia-status");
  await expect(status).toHaveAttribute("data-persistence-status", "salvando");
  await expect(status).toContainText("Salvando alterações");
  await expect(page.getByRole("status").filter({ hasText: "Alterações salvas neste dispositivo." })).toHaveCount(0);
  expect((await readCharacter(page)).nome).toBe(character.nome);
  await status.scrollIntoViewIfNeeded();
  await capture(page, "salvando", testInfo);
  await page.evaluate(() => { window.holdCharacterWrite = false; window.releaseCharacterWrite(); });
  await waitForSave(page);
  await expect(status).toHaveAttribute("data-persistence-status", "salvo");
  expect((await readCharacter(page)).nome).toBe("Nome com gravação pendente");
  await page.evaluate(() => { window.failCharacterWrite = true; });
  await page.getByLabel("Editar nome do personagem", { exact: true }).fill("Nome recuperado após falha");
  await expect(status).toHaveAttribute("data-persistence-status", "falhou");
  await expect(page.getByRole("alert")).toContainText("Suas alterações não foram salvas");
  await page.getByRole("alert").scrollIntoViewIfNeeded();
  await capture(page, "falha", testInfo);
  await axe(page);
  await page.evaluate(() => { window.failCharacterWrite = false; });
  await page.getByRole("button", { name: "Tentar novamente", exact: true }).click();
  await waitForSave(page);
  await page.reload();
  await expect(page.getByLabel("Editar nome do personagem", { exact: true })).toHaveValue("Nome recuperado após falha");
  await page.emulateMedia({ media: "print" });
  await expect(status).toBeHidden();
  await expect(page.locator(".painel-rolagens")).toBeHidden();
  await expect(page.locator(".ficha-impressao")).toBeVisible();
});

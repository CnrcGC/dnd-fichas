import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { Buffer } from "node:buffer";
import { mkdir } from "node:fs/promises";
import { importCharacter, readCharacter, waitForSave } from "./helpers/dnd.js";
import { setTheme, setRange } from "./helpers/preferences.js";

async function textSize(page, size) {
  await page.getByRole("button", { name: "Configurações de acessibilidade", exact: true }).click();
  await setRange(page, "Tamanho do texto", size);
  await page.keyboard.press("Escape");
}

async function reflow(page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
}

for (const theme of ["light", "dark"]) {
  test(`Feedback: espaços de magia mostram números completos / ${theme}`, async ({ page }, testInfo) => {
    await importCharacter(page, { classeId: "mago", subclasseId: "escola-evocacao" });
    await setTheme(page, theme);
    await page.getByRole("tab", { name: "Magias", exact: true }).click();
    await page.getByLabel("Espaços totais de nível 1", { exact: true }).fill("12");
    await page.getByLabel("Espaços usados de nível 1", { exact: true }).fill("10");
    await page.getByLabel("Espaços usados de nível 1", { exact: true }).press("ArrowDown");
    await expect(page.getByLabel("Espaços usados de nível 1", { exact: true })).toHaveValue("9");
    await page.getByLabel("Espaços usados de nível 1", { exact: true }).press("ArrowUp");
    await expect(page.getByLabel("Espaços usados de nível 1", { exact: true })).toHaveValue("10");
    for (const size of [16, 28]) {
      await textSize(page, size);
      for (const width of [1280, 768, 390, 320]) {
        await page.setViewportSize({ width, height: 900 });
        await reflow(page);
        const cortados = await page.locator("input.espaco-magia-input").evaluateAll((inputs) => inputs.filter((input) => {
          const style = getComputedStyle(input);
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          ctx.font = style.font || `${style.fontSize} ${style.fontFamily}`;
          const texto = ctx.measureText("000").width + (parseFloat(style.letterSpacing) || 0) * 3;
          const disponivel = input.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
          return disponivel + 0.5 < texto;
        }).map((input) => input.getAttribute("aria-label")));
        expect(cortados, `${width}px / texto ${size}`).toEqual([]);
      }
    }
    await expect(page.getByLabel("Espaços usados de nível 1", { exact: true })).toHaveValue("10");
    await expect(page.getByLabel("Espaços totais de nível 1", { exact: true })).toHaveValue("12");
    await waitForSave(page); await page.reload();
    await page.getByRole("tab", { name: "Magias", exact: true }).click();
    await expect(page.getByLabel("Espaços usados de nível 1", { exact: true })).toHaveValue("10");
    await expect(page.getByLabel("Espaços totais de nível 1", { exact: true })).toHaveValue("12");
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    await mkdir("output/layout-feedback", { recursive: true });
    await page.locator(".espacos-magia-grid").first().screenshot({ path: `output/layout-feedback/espacos-${theme}-${testInfo.project.name}.png` });
  });

  test(`Feedback: ações de catálogo compactas sem sobreposição / ${theme}`, async ({ page }, testInfo) => {
    await importCharacter(page, { classeId: "barbaro", subclasseId: null, nivel: 1 });
    await setTheme(page, theme);
    for (const size of [16, 28]) {
      await textSize(page, size);
      for (const [tab, action] of [["Habilidades", "Adicionar Habilidade"], ["Inventário", "Adicionar itens"]]) {
        await page.getByRole("tab", { name: tab, exact: true }).click();
        await page.getByRole("button", { name: action, exact: true }).click();
        const dialog = page.getByRole("dialog");
        const buttons = dialog.locator(".item-catalogo-adicionar");
        await expect(buttons.first()).toBeVisible();
        const expectedSize = await page.evaluate(() => matchMedia("(pointer: coarse)").matches ? 44 : 32);
        expect(await buttons.evaluateAll((elements, expected) => elements.filter((button) => {
          const rect = button.getBoundingClientRect();
          const card = button.closest(".item-catalogo").getBoundingClientRect();
          const nome = button.closest(".item-catalogo").querySelector(".item-catalogo-nome").getBoundingClientRect();
          return Math.abs(rect.width - expected) > 0.5 || Math.abs(rect.height - expected) > 0.5 || rect.right > card.right || rect.bottom > card.bottom || nome.right > rect.left;
        }).map((button) => button.getAttribute("aria-label")), expectedSize)).toEqual([]);
        await reflow(page);
        await mkdir("output/layout-feedback", { recursive: true });
        if (size === 16) await dialog.screenshot({ path: `output/layout-feedback/catalogo-${tab}-${theme}-${testInfo.project.name}.png` });
        expect((await new AxeBuilder({ page }).include('[role="dialog"]').analyze()).violations).toEqual([]);
        await page.keyboard.press("Escape");
      }
    }
  });

  test(`Feedback: seletor Imagem por teclado e retrato na biblioteca / ${theme}`, async ({ page }, testInfo) => {
    await importCharacter(page);
    await setTheme(page, theme);
    const adicionar = page.getByRole("button", { name: "Adicionar imagem do personagem", exact: true });
    await expect(adicionar).toHaveText("Imagem");
    const vazio = await adicionar.boundingBox();
    expect(Math.abs(vazio.width - vazio.height)).toBeLessThanOrEqual(1);
    const encoded = await page.evaluate(() => {
      const canvas = document.createElement("canvas"); canvas.width = 256; canvas.height = 320;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#293645"; ctx.fillRect(0, 0, 256, 320);
      ctx.fillStyle = "#bca57d"; ctx.beginPath(); ctx.arc(128, 112, 50, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#7b4b43"; ctx.beginPath(); ctx.arc(128, 290, 100, Math.PI, 0); ctx.fill();
      return canvas.toDataURL("image/png").split(",")[1];
    });
    await adicionar.focus(); await expect(adicionar).toBeFocused();
    const chooser = page.waitForEvent("filechooser");
    await adicionar.press("Enter");
    await (await chooser).setFiles({ name: "retrato.png", mimeType: "image/png", buffer: Buffer.from(encoded, "base64") });
    const alterar = page.getByRole("button", { name: "Alterar imagem do personagem", exact: true });
    await expect(alterar.getByRole("img")).toBeVisible();
    await expect(alterar).toHaveText("");
    const remover = page.getByRole("button", { name: "Remover imagem", exact: true });
    await expect(remover).toHaveText("");
    const posicaoRemover = await remover.boundingBox();
    const quadro = await alterar.boundingBox();
    expect(posicaoRemover.width).toBeGreaterThanOrEqual(24);
    expect(posicaoRemover.x).toBeGreaterThanOrEqual(quadro.x);
    expect(posicaoRemover.x + posicaoRemover.width).toBeLessThanOrEqual(quadro.x + quadro.width);
    expect(posicaoRemover.y).toBeGreaterThanOrEqual(quadro.y);
    expect(posicaoRemover.y + posicaoRemover.height).toBeLessThanOrEqual(quadro.y + quadro.height);
    expect((await new AxeBuilder({ page }).include(".personagem-retrato").analyze()).violations).toEqual([]);
    const preenchido = await alterar.boundingBox();
    expect(Math.abs(preenchido.width - preenchido.height)).toBeLessThanOrEqual(1);
    await waitForSave(page);
    const retrato = (await readCharacter(page)).retrato;
    await mkdir("output/layout-feedback", { recursive: true });
    await page.locator(".personagem-retrato-quadro").screenshot({ path: `output/layout-feedback/seletor-${theme}-${testInfo.project.name}.png` });
    await importCharacter(page, { nome: "Sem retrato" });
    await page.goto("/dnd5e");
    const card = page.getByRole("article").filter({ has: page.getByRole("heading", { name: "Personagem de teste", exact: true }) });
    const imagem = card.getByRole("img", { name: "Retrato de Personagem de teste", exact: true });
    await expect(imagem).toHaveAttribute("src", retrato);
    await expect.poll(() => imagem.evaluate((img) => img.complete && img.naturalWidth > 0)).toBe(true);
    const semImagem = page.getByRole("article").filter({ has: page.getByRole("heading", { name: "Sem retrato", exact: true }) });
    await expect(semImagem.locator(".ficha-card-simbolo")).toBeVisible();
    await page.reload(); await expect(imagem).toBeVisible();
    for (const width of [1280, 320]) {
      await page.setViewportSize({ width, height: 900 }); await reflow(page);
      await page.screenshot({ path: `output/layout-feedback/biblioteca-${width}-${theme}-${testInfo.project.name}.png`, fullPage: true });
    }
    await textSize(page, 28); await reflow(page);
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  });
}

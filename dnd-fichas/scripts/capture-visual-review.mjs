// Evidências VIS-G06 em perfis descartáveis; nunca usa as fichas do navegador pessoal.
import { chromium, expect } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import process from "node:process";
import { importCharacter } from "../tests-e2e/helpers/dnd.js";
import { setTheme, setTextSize } from "../tests-e2e/helpers/preferences.js";

const baseURL = process.env.DND_REVIEW_URL || "http://127.0.0.1:4175";
if (!["127.0.0.1", "localhost"].includes(new URL(baseURL).hostname)) {
  throw new Error("A captura com falha simulada deve usar somente a prévia local.");
}
const directory = "output/visual-grimoire/review";
await mkdir(directory, { recursive: true });
const results = [];
const browser = await chromium.launch({ channel: "chrome" });
try {
  for (const theme of ["light", "dark"]) {
    for (const size of ["normal", "large", "extra-large"]) {
      const context = await browser.newContext({ baseURL, reducedMotion: "reduce" });
      try {
        const page = await context.newPage();
        await page.goto("/dnd5e");
        await setTheme(page, theme);
        await setTextSize(page, size);
        const capture = async (state) => {
          for (const width of [320, 390, 768, 1280]) {
            await page.setViewportSize({ width, height: 900 });
            if (state === "falha") await page.getByRole("alert").scrollIntoViewIfNeeded();
            else await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
            const measurement = await page.evaluate(() => {
              const localScrolling = [];
              const outside = [...document.querySelectorAll("header a, header button, main input, main button, main select, main textarea, [role=dialog] button, [role=dialog] input")]
                .filter((element) => element.getClientRects().length)
                .filter((element) => {
                  const rect = element.getBoundingClientRect();
                  if (rect.left >= -1 && rect.right <= window.innerWidth + 1) return false;
                  // Categorias usam rolagem nativa limitada ao modal, já existente.
                  const categories = element.closest(".modal-catalogo-abas");
                  if (categories && getComputedStyle(categories).overflowX === "auto") {
                    const bounds = categories.getBoundingClientRect();
                    if (bounds.left >= 0 && bounds.right <= window.innerWidth) {
                      localScrolling.push(element.textContent.trim());
                      return false;
                    }
                  }
                  return true;
                }).map((element) => element.getAttribute("aria-label") || element.textContent.trim());
              return { viewport: window.innerWidth, scrollWidth: document.documentElement.scrollWidth, outside, localScrolling };
            });
            expect(measurement.scrollWidth, `${state}/${theme}/${size}/${width}`).toBeLessThanOrEqual(width);
            expect(measurement.outside, `${state}/${theme}/${size}/${width}`).toEqual([]);
            if (state === "modal-itens") {
              const categories = page.locator(".modal-catalogo-abas button");
              for (const button of await categories.all()) {
                await button.focus();
                await expect(button).toBeFocused();
                const box = await button.boundingBox();
                expect(box.x).toBeGreaterThanOrEqual(0);
                expect(box.x + box.width).toBeLessThanOrEqual(width);
              }
              await categories.first().focus();
              await page.getByRole("dialog").getByRole("button", { name: "Fechar", exact: true }).focus();
            }
            const screenshot = (size === "normal" && [320, 1280].includes(width))
              || (size === "extra-large" && [320, 768].includes(width))
              ? `${state}-${theme}-${size}-${width}.png` : null;
            if (screenshot) await page.screenshot({ path: `${directory}/${screenshot}` });
            results.push({ state, theme, size, width, ...measurement, screenshot });
          }
        };
        await capture("biblioteca-vazia");
        const name = "Alena, guardiã das páginas do Vale e dos Caminhos Esquecidos";
        await importCharacter(page, { nome: name, classeId: "mago", subclasseId: "escola-evocacao" });
        const sheetURL = page.url();
        await page.getByRole("link", { name: "Personagens", exact: true }).click();
        await capture("biblioteca-preenchida");
        await page.goto("/dnd5e/characters/new");
        await expect(page.getByRole("heading", { name: "Escolha sua Raça", exact: true })).toBeVisible();
        await capture("criacao");
        await page.goto(sheetURL);
        await expect(page.getByRole("heading", { name: `Ficha de ${name}`, exact: true })).toBeVisible();
        await capture("ficha");
        await page.getByRole("tab", { name: "Inventário", exact: true }).click();
        await page.getByRole("button", { name: "Adicionar itens", exact: true }).click();
        await expect(page.getByRole("dialog", { name: /Adicionar itens/i })).toBeVisible();
        await capture("modal-itens");
        await page.keyboard.press("Escape");
        await page.evaluate(async () => {
          // A prévia aberta pode ter a URL de módulo versionada pelo HMR.
          const resource = performance.getEntriesByType("resource").findLast((entry) =>
            new URL(entry.name).pathname === "/src/platform/persistence/characterRepository.js");
          if (!resource) throw new Error("Módulo de persistência da prévia não encontrado.");
          const { IndexedDbCharacterRepository } = await import(resource.name);
          IndexedDbCharacterRepository.prototype.put = async () => {
            throw new DOMException("Falha simulada para revisão visual", "QuotaExceededError");
          };
        });
        await page.getByLabel("Editar nome do personagem", { exact: true }).fill(`${name} — edição pendente`);
        await expect(page.getByRole("alert")).toContainText("Suas alterações não foram salvas");
        await capture("falha");
        console.log(`Capturas concluídas: ${theme}, ${size}`);
      } finally {
        await context.close();
      }
    }
  }
} finally {
  await browser.close();
  await writeFile(`${directory}/matrix.json`, JSON.stringify({ baseURL, browser: "Chrome", reducedMotion: true, results }, null, 2));
  const captures = results.filter(({ screenshot }) => screenshot);
  await writeFile(`${directory}/index.html`, `<!doctype html>
<html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Revisão visual — VIS-G06</title>
<style>body{margin:2rem;font:1rem/1.5 system-ui;background:#f6f2e8;color:#242018}main{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,280px),1fr));gap:1rem}figure{margin:0;padding:1rem;background:#fffdf7;border:1px solid #625c50}img{width:100%;height:420px;object-fit:contain}a{color:#435688}a:focus-visible{outline:3px solid #245fc2;outline-offset:4px}</style>
<h1>Capturas da revisão visual</h1><p>Fichas fictícias em sessões isoladas. Claro/escuro; texto 16 e 24 px. A matriz JSON também verifica 20 px e as quatro larguras. Estas capturas não comprovam zoom nativo ou leitura com NVDA.</p>
<p><a href="matrix.json">Matriz de 144 verificações</a></p><main>${captures.map(({ state, theme, size, width, screenshot }) => `<figure><a href="${screenshot}"><img loading="lazy" src="${screenshot}" alt="${state}, ${theme}, ${size}, ${width} px"></a><figcaption>${state} · ${theme} · ${size} · ${width} px</figcaption></figure>`).join("\n")}</main></html>`);
}

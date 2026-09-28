import { readFile, stat } from "node:fs/promises";
import { resolve } from "node:path";

const budgets = Object.freeze({
  main: 425 * 1024,
  dnd5eAdapter: 100 * 1024,
});

const outputRoot = resolve("dist");
const manifest = JSON.parse(await readFile(resolve(outputRoot, ".vite/manifest.json"), "utf8"));
const mainEntry = manifest["index.html"];
const dndEntry = Object.entries(manifest).find(([key]) => key.endsWith("src/systems/dnd5e/adapter.jsx"))?.[1];

if (!mainEntry?.file || !dndEntry?.file) {
  throw new Error("O manifest do build não contém as entradas principal e D&D esperadas.");
}

async function check(label, file, limit) {
  const bytes = (await stat(resolve(outputRoot, file))).size;
  const kib = (bytes / 1024).toFixed(2);
  const limitKib = (limit / 1024).toFixed(0);
  if (bytes > limit) throw new Error(`${label} excedeu o orçamento: ${kib} KiB > ${limitKib} KiB.`);
  console.log(`${label}: ${kib} KiB / ${limitKib} KiB`);
}

await check("Entrada principal", mainEntry.file, budgets.main);
await check("Adapter inicial D&D", dndEntry.file, budgets.dnd5eAdapter);

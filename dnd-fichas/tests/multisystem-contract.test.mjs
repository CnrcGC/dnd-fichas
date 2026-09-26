import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "vite";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

let server;
let registry;
let contracts;

before(async () => {
  server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: "custom" });
  registry = await server.ssrLoadModule("/src/platform/systems/registry.js");
  contracts = await server.ssrLoadModule("/src/shared/rules/engineContract.js");
});

after(async () => { await server?.close(); });

test("MECH-01 registra e carrega sob demanda os três engines isolados", async () => {
  const systems = registry.listSystems();
  assert.deepEqual(systems.map(({ id }) => id), ["dnd5e", "yusong", "feiticeiros-maldicoes"]);
  for (const system of systems) {
    const engine = await registry.loadSystemEngine(system.id);
    assert.equal(contracts.assertSystemEngine(engine), engine);
  }
});

test("FE-01 falha visivelmente para identificador desconhecido", () => {
  assert.throws(() => registry.getSystem("desconhecido"), (error) => error.code === "unsupported-system");
});

test("MECH-01 engines não importam React, persistência, HTTP ou outro engine", async () => {
  const files = [
    "src/systems/dnd5e/engine.js",
    "src/systems/yusong/engine.js",
    "src/systems/yusong/rules.js",
    "src/systems/feiticeiros/engine.js",
    "src/systems/feiticeiros/rules.js",
  ];
  for (const file of files) {
    const source = await readFile(resolve(file), "utf8");
    assert.doesNotMatch(source, /from\s+["'](?:react|.*(?:storage|persistence|http|database)|.*systems\/(?:dnd5e|yusong|feiticeiros)\/engine)/i, file);
  }
});


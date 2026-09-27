import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "vite";

let server;
let registry;
let routes;
let preferences;
let adapterContract;

before(async () => {
  server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: "custom" });
  registry = await server.ssrLoadModule("/src/platform/systems/registry.js");
  routes = await server.ssrLoadModule("/src/platform/routing/routes.js");
  preferences = await server.ssrLoadModule("/src/platform/preferences/activeSystem.js");
  adapterContract = await server.ssrLoadModule("/src/platform/systems/adapterContract.js");
});

after(async () => { await server?.close(); });

test("FE-01 registra três seções e adapters completos carregados sob demanda", async () => {
  const systems = registry.listSystems();
  assert.deepEqual(systems.map(({ routeSegment }) => routeSegment), ["dnd5e", "yusong", "feiticeiros-maldicoes"]);
  for (const system of systems) {
    const adapter = await registry.loadSystemAdapter(system.id);
    assert.equal(adapterContract.assertSystemAdapter(adapter), adapter);
    assert.equal(adapter.id, system.id);
    assert.equal(adapter.routes.home, `/${system.routeSegment}`);
  }
});

test("FE-01 cria rotas isoladas e identifica somente o primeiro segmento", () => {
  assert.equal(routes.systemPath("dnd5e", "characters/new"), "/dnd5e/characters/new");
  assert.equal(routes.characterPath("yusong", "id com espaço"), "/yusong/characters/id%20com%20espa%C3%A7o");
  assert.equal(routes.getSystemIdFromPath("/feiticeiros-maldicoes/encounters"), "feiticeiros-maldicoes");
  assert.equal(routes.getSystemIdFromPath("/settings"), null);
  assert.throws(() => routes.systemPath("desconhecido"), (error) => error.code === "unsupported-system");
});

test("FE-01 persiste apenas identificadores registrados como último sistema", () => {
  const values = new Map();
  const storage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };
  assert.equal(preferences.readActiveSystem(storage), null);
  assert.equal(preferences.writeActiveSystem("yusong", storage).ok, true);
  assert.equal(preferences.readActiveSystem(storage), "yusong");
  values.set(preferences.ACTIVE_SYSTEM_STORAGE_KEY, "desconhecido");
  assert.equal(preferences.readActiveSystem(storage), null);
  assert.throws(() => preferences.writeActiveSystem("desconhecido", storage), (error) => error.code === "unsupported-system");
});


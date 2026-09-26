import test from "node:test";
import assert from "node:assert/strict";
import { buildServer } from "../src/app.js";
import { loadConfig } from "../src/config.js";

const config = loadConfig({ NODE_ENV: "test", DATABASE_URL: "postgres://example.invalid/rpg", PUBLIC_ORIGIN: "http://localhost:5173", BETTER_AUTH_SECRET: "01234567890123456789012345678901", LOG_LEVEL: "silent" });

function fakePool({ ready = true, error = null } = {}) {
  return {
    async query() { if (error) throw error; return { rows: [{ migrated: ready }] }; },
    async end() {},
  };
}

test("BE-00 health live e ready possuem estados determinísticos", async () => {
  const server = await buildServer({ config, pool: fakePool(), auth: null, logger: false });
  const live = await server.inject({ method: "GET", url: "/health/live" });
  const ready = await server.inject({ method: "GET", url: "/health/ready" });
  assert.equal(live.statusCode, 200);
  assert.deepEqual(live.json(), { status: "ok" });
  assert.equal(ready.statusCode, 200);
  assert.deepEqual(ready.json(), { status: "ready" });
  await server.close();
});

test("BE-00 readiness falha sem expor detalhes do banco", async () => {
  const server = await buildServer({ config, pool: fakePool({ error: new Error("password secret") }), auth: null, logger: false });
  const response = await server.inject({ method: "GET", url: "/health/ready" });
  assert.equal(response.statusCode, 503);
  assert.deepEqual(response.json(), { status: "not-ready", reason: "database-unavailable" });
  await server.close();
});

test("BE-00 resposta 404 inclui requestId estável", async () => {
  const server = await buildServer({ config, pool: fakePool(), auth: null, logger: false });
  const response = await server.inject({ method: "GET", url: "/missing", headers: { "x-request-id": "request-123" } });
  assert.equal(response.statusCode, 404);
  assert.equal(response.json().requestId, "request-123");
  await server.close();
});

test("BE-01 registra o handler Better Auth sem exigir conexão no startup", async () => {
  const auth = { handler: async () => new Response(null, { status: 204 }) };
  const repository = { list: async () => [], getById: async () => null };
  const server = await buildServer({ config, pool: fakePool(), auth, characterRepository: repository, authenticate: async () => null, logger: false });
  const response = await server.inject({ method: "GET", url: "/api/auth/session" });
  assert.equal(response.statusCode, 204);
  await server.close();
});


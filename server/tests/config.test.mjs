import test from "node:test";
import assert from "node:assert/strict";
import { loadConfig } from "../src/config.js";

const base = {
  NODE_ENV: "test",
  DATABASE_URL: "postgres://example.invalid/rpg",
  PUBLIC_ORIGIN: "http://localhost:5173",
  BETTER_AUTH_SECRET: "01234567890123456789012345678901",
};

test("BE-00 valida e normaliza configuração", () => {
  const config = loadConfig(base);
  assert.equal(config.port, 4000);
  assert.equal(config.inviteMode, "private");
  assert.equal(config.production, false);
});

test("BE-00 recusa segredo curto e configuração inválida", () => {
  assert.throws(() => loadConfig({ ...base, BETTER_AUTH_SECRET: "short" }), (error) => error.code === "invalid-config");
  assert.throws(() => loadConfig({ ...base, PORT: "zero" }), (error) => error.code === "invalid-config");
  assert.throws(() => loadConfig({ ...base, PUBLIC_ORIGIN: "not-url" }), (error) => error.code === "invalid-config");
});


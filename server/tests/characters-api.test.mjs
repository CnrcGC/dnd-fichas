import test from "node:test";
import assert from "node:assert/strict";
import { buildServer } from "../src/app.js";
import { loadConfig } from "../src/config.js";

const config = loadConfig({ NODE_ENV: "test", DATABASE_URL: "postgres://example.invalid/rpg", PUBLIC_ORIGIN: "http://localhost:5173", BETTER_AUTH_SECRET: "01234567890123456789012345678901", LOG_LEVEL: "silent" });
const ownerId = "owner-1";
const characterId = "d9428888-122b-4b77-8668-f65e33ef9342";
const operationId = "a9428888-122b-4b77-8668-f65e33ef9342";

const pool = { async query() { return { rows: [{ migrated: true }] }; }, async end() {} };

class MemoryApiRepository {
  constructor() { this.records = new Map(); }
  async list(requestOwner) { return [...this.records.values()].filter(({ owner }) => owner === requestOwner).map(({ owner: _owner, ...record }) => record); }
  async getById(requestOwner, id) { const record = this.records.get(id); if (!record || record.owner !== requestOwner || record.deletedAt) return null; const { owner: _owner, ...publicRecord } = record; return publicRecord; }
  async create(requestOwner, record) {
    const saved = { ...record, owner: requestOwner, revision: 0, createdAt: record.updatedAt, deletedAt: null };
    this.records.set(record.id, saved);
    const { owner: _owner, ...publicRecord } = saved;
    return { record: publicRecord, replayed: false };
  }
  async update(requestOwner, id, change) {
    const current = this.records.get(id);
    if (current.owner !== requestOwner) throw new Error("leak");
    if (current.revision !== change.baseRevision) { const error = new Error("conflict"); error.code = "revision-conflict"; error.statusCode = 409; throw error; }
    const saved = { ...current, ...change, revision: current.revision + 1 };
    this.records.set(id, saved);
    const { owner: _owner, ...publicRecord } = saved;
    return { record: publicRecord, replayed: false };
  }
  async softDelete() { throw new Error("not used"); }
}

async function serverWith(repository, session = { user: { id: ownerId } }) {
  return buildServer({ config, pool, auth: null, characterRepository: repository, authenticate: async () => session, logger: false });
}

function dndBody() {
  return {
    id: characterId,
    systemId: "dnd5e",
    schemaVersion: 8,
    displayName: "valor do cliente ignorado",
    data: { id: characterId, nome: "Lyra", versaoFicha: 8, nivel: 3 },
    operationId,
    updatedAt: "2026-09-26T12:00:00.000Z",
  };
}

test("BE-03 exige sessão para dados sincronizados", async () => {
  const server = await serverWith(new MemoryApiRepository(), null);
  const response = await server.inject({ method: "GET", url: "/api/v1/characters" });
  assert.equal(response.statusCode, 401);
  assert.equal(response.json().code, "unauthenticated");
  await server.close();
});

test("BE-02/03 valida sistema e recalcula resumo no servidor", async () => {
  const repository = new MemoryApiRepository();
  const server = await serverWith(repository);
  const response = await server.inject({ method: "POST", url: "/api/v1/characters", payload: dndBody() });
  assert.equal(response.statusCode, 201);
  assert.equal(response.json().record.displayName, "Lyra");
  assert.deepEqual(response.json().record.summaryMetadata, { displayName: "Lyra", level: 3, status: "rascunho" });
  await server.close();
});

test("BE-03 recusa payload de versão futura sem mutação", async () => {
  const repository = new MemoryApiRepository();
  const server = await serverWith(repository);
  const body = dndBody();
  body.schemaVersion = 99;
  body.data.versaoFicha = 99;
  const response = await server.inject({ method: "POST", url: "/api/v1/characters", payload: body });
  assert.equal(response.statusCode, 422);
  assert.equal(response.json().code, "unsupported-future-version");
  assert.equal((await repository.list(ownerId)).length, 0);
  await server.close();
});

test("BE-03 não revela personagem de outro proprietário", async () => {
  const repository = new MemoryApiRepository();
  repository.records.set(characterId, { ...dndBody(), owner: "another-owner", revision: 0, deletedAt: null });
  const server = await serverWith(repository);
  const response = await server.inject({ method: "GET", url: `/api/v1/characters/${characterId}` });
  assert.equal(response.statusCode, 404);
  assert.equal(response.json().code, "character-not-found");
  await server.close();
});


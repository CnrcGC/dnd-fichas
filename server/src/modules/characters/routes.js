import { AppError } from "../../errors.js";
import { validateSystemPayload } from "../../systems.js";

const idSchema = { type: "string", format: "uuid" };
const mutationProperties = { operationId: idSchema, baseRevision: { type: "integer", minimum: 0 } };
const recordProperties = {
  id: idSchema,
  systemId: { type: "string", enum: ["dnd5e", "yusong", "feiticeiros-maldicoes"] },
  schemaVersion: { type: "integer", minimum: 1 },
  displayName: { type: "string", minLength: 1, maxLength: 200 },
  data: { type: "object", additionalProperties: true },
};

function validated(body, expectedSystemId = null) {
  if (expectedSystemId && body.systemId && body.systemId !== expectedSystemId) throw new AppError("system-mismatch", "Não é possível alterar o sistema de uma ficha.", 422);
  const result = validateSystemPayload(expectedSystemId ?? body.systemId, body.schemaVersion, body.data);
  if (!result.ok) throw new AppError(result.code, "Os dados da ficha não correspondem ao sistema e à versão informados.", 422);
  return { ...body, displayName: result.summary.displayName, summaryMetadata: result.summary };
}

export function registerCharacterRoutes(server, { repository, authenticate }) {
  server.addHook("preHandler", async (request) => {
    if (!request.url.startsWith("/api/v1/")) return;
    const session = await authenticate(request);
    if (!session?.user?.id) throw new AppError("unauthenticated", "Entre para acessar os dados sincronizados.", 401);
    request.userId = session.user.id;
  });

  server.get("/api/v1/characters", {
    schema: { querystring: { type: "object", properties: { limit: { type: "integer", minimum: 1, maximum: 100, default: 50 }, updatedAfter: { type: "string", format: "date-time" } }, additionalProperties: false } },
  }, async (request) => ({ records: await repository.list(request.userId, request.query), nextCursor: null }));

  server.get("/api/v1/characters/:id", {
    schema: { params: { type: "object", required: ["id"], properties: { id: idSchema }, additionalProperties: false } },
  }, async (request) => {
    const record = await repository.getById(request.userId, request.params.id);
    if (!record) throw new AppError("character-not-found", "Personagem não encontrado.", 404);
    return record;
  });

  server.post("/api/v1/characters", {
    schema: { body: { type: "object", required: [...Object.keys(recordProperties), "operationId", "updatedAt"], properties: { ...recordProperties, operationId: idSchema, updatedAt: { type: "string", format: "date-time" } }, additionalProperties: false } },
  }, async (request, reply) => {
    const record = validated(request.body);
    const result = await repository.create(request.userId, record, request.body.operationId);
    return reply.code(result.replayed ? 200 : 201).send({ record: result.record, replayed: result.replayed });
  });

  server.patch("/api/v1/characters/:id", {
    schema: {
      params: { type: "object", required: ["id"], properties: { id: idSchema }, additionalProperties: false },
      body: { type: "object", required: ["schemaVersion", "displayName", "data", "operationId", "baseRevision"], properties: { schemaVersion: recordProperties.schemaVersion, displayName: recordProperties.displayName, data: recordProperties.data, ...mutationProperties }, additionalProperties: false },
    },
  }, async (request) => {
    const current = await repository.getById(request.userId, request.params.id);
    if (!current) throw new AppError("character-not-found", "Personagem não encontrado.", 404);
    const change = validated(request.body, current.systemId);
    return repository.update(request.userId, request.params.id, change, request.body.operationId);
  });

  server.delete("/api/v1/characters/:id", {
    schema: {
      params: { type: "object", required: ["id"], properties: { id: idSchema }, additionalProperties: false },
      body: { type: "object", required: ["operationId", "baseRevision"], properties: mutationProperties, additionalProperties: false },
    },
  }, async (request) => repository.softDelete(request.userId, request.params.id, request.body.baseRevision, request.body.operationId));
}


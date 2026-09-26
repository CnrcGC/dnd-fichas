import Fastify from "fastify";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import { databaseReady } from "./database.js";
import { errorBody } from "./errors.js";
import { registerAuthRoutes } from "./auth.js";
import { getSession } from "./auth.js";
import { CharacterRepository } from "./modules/characters/repository.js";
import { registerCharacterRoutes } from "./modules/characters/routes.js";

export async function buildServer({ config, pool, auth, logger = false, characterRepository, authenticate }) {
  const server = Fastify({
    logger: logger || { level: config.logLevel, redact: ["req.headers.authorization", "req.headers.cookie", "res.headers.set-cookie", "body"] },
    bodyLimit: config.uploadLimitBytes,
    trustProxy: config.trustedProxyCount,
    requestIdHeader: "x-request-id",
  });

  await server.register(helmet, { contentSecurityPolicy: false });
  await server.register(rateLimit, { global: false });
  await server.register(swagger, { openapi: { info: { title: "RPG Platform API", version: "1.0.0" } } });
  if (!config.production) await server.register(swaggerUi, { routePrefix: "/documentation" });

  server.get("/health/live", {
    schema: { response: { 200: { type: "object", required: ["status"], properties: { status: { const: "ok" } } } } },
  }, async () => ({ status: "ok" }));

  server.get("/health/ready", async (_request, reply) => {
    try {
      if (!await databaseReady(pool)) return reply.code(503).send({ status: "not-ready", reason: "migrations-pending" });
      return { status: "ready" };
    } catch {
      return reply.code(503).send({ status: "not-ready", reason: "database-unavailable" });
    }
  });

  if (auth) registerAuthRoutes(server, auth);
  if (auth || authenticate) {
    registerCharacterRoutes(server, {
      repository: characterRepository ?? new CharacterRepository(pool),
      authenticate: authenticate ?? ((request) => getSession(auth, request)),
    });
  }

  server.setNotFoundHandler((request, reply) => reply.code(404).send({ code: "not-found", message: "Recurso não encontrado.", requestId: request.id }));
  server.setErrorHandler((error, request, reply) => {
    const status = Number(error.statusCode) >= 400 ? Number(error.statusCode) : 500;
    if (status >= 500) request.log.error({ err: error, requestId: request.id }, "request failed");
    reply.code(status).send(errorBody(error, request.id));
  });

  server.addHook("onClose", async () => { await pool.end(); });
  return server;
}


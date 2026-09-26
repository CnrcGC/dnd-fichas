import { betterAuth } from "better-auth";
import { fromNodeHeaders } from "better-auth/node";

export function createAuth(config, pool) {
  return betterAuth({
    database: pool,
    secret: config.authSecret,
    baseURL: config.publicOrigin,
    trustedOrigins: [config.publicOrigin],
    emailAndPassword: {
      enabled: true,
      disableSignUp: true,
      revokeSessionsOnPasswordReset: true,
    },
    advanced: { useSecureCookies: config.production, database: { joins: true } },
  });
}

export async function getSession(auth, request) {
  return auth.api.getSession({ headers: fromNodeHeaders(request.headers) });
}

export function registerAuthRoutes(server, auth) {
  server.route({
    method: ["GET", "POST"],
    url: "/api/auth/*",
    config: { rateLimit: { max: 20, timeWindow: "1 minute" } },
    async handler(request, reply) {
      const origin = `${request.protocol}://${request.host}`;
      const url = new URL(request.url, origin);
      const headers = fromNodeHeaders(request.headers);
      const authRequest = new Request(url, {
        method: request.method,
        headers,
        ...(request.body ? { body: JSON.stringify(request.body) } : {}),
      });
      const response = await auth.handler(authRequest);
      reply.status(response.status);
      response.headers.forEach((value, key) => reply.header(key, value));
      return reply.send(response.body ? await response.text() : null);
    },
  });
}


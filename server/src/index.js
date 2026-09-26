import { loadConfig } from "./config.js";
import { createPool } from "./database.js";
import { createAuth } from "./auth.js";
import { buildServer } from "./app.js";

const config = loadConfig();
const pool = createPool(config);
const auth = createAuth(config, pool);
const server = await buildServer({ config, pool, auth });

const shutdown = async (signal) => {
  server.log.info({ signal }, "shutdown requested");
  await server.close();
  process.exitCode = 0;
};
process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);

try {
  await server.listen({ host: config.host, port: config.port });
} catch (error) {
  server.log.fatal(error);
  await server.close();
  process.exitCode = 1;
}


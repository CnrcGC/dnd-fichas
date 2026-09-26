const allowed = {
  NODE_ENV: ["development", "test", "production"],
  MEDIA_DRIVER: ["filesystem", "s3"],
  INVITE_MODE: ["private", "invite"],
  LOG_LEVEL: ["fatal", "error", "warn", "info", "debug", "trace", "silent"],
};

function required(env, key) {
  const value = env[key]?.trim();
  if (!value) throw Object.assign(new Error(`Variável obrigatória ausente: ${key}.`), { code: "invalid-config", key });
  return value;
}

function integer(env, key, fallback, minimum = 0) {
  const value = Number(env[key] ?? fallback);
  if (!Number.isInteger(value) || value < minimum) throw Object.assign(new Error(`Valor inválido para ${key}.`), { code: "invalid-config", key });
  return value;
}

function choice(env, key, fallback) {
  const value = env[key] ?? fallback;
  if (!allowed[key].includes(value)) throw Object.assign(new Error(`Valor inválido para ${key}.`), { code: "invalid-config", key });
  return value;
}

export function loadConfig(env = process.env) {
  const nodeEnv = choice(env, "NODE_ENV", "development");
  const publicOrigin = required(env, "PUBLIC_ORIGIN");
  try { new URL(publicOrigin); } catch { throw Object.assign(new Error("PUBLIC_ORIGIN deve ser uma URL absoluta."), { code: "invalid-config", key: "PUBLIC_ORIGIN" }); }
  const secret = required(env, "BETTER_AUTH_SECRET");
  if (secret.length < 32) throw Object.assign(new Error("BETTER_AUTH_SECRET deve ter ao menos 32 caracteres."), { code: "invalid-config", key: "BETTER_AUTH_SECRET" });
  return Object.freeze({
    nodeEnv,
    host: env.HOST ?? "127.0.0.1",
    port: integer(env, "PORT", 4000, 1),
    databaseUrl: required(env, "DATABASE_URL"),
    publicOrigin,
    authSecret: secret,
    mediaDriver: choice(env, "MEDIA_DRIVER", "filesystem"),
    mediaPath: env.MEDIA_PATH ?? "./var/media",
    uploadLimitBytes: integer(env, "UPLOAD_LIMIT_BYTES", 5_242_880, 1),
    inviteMode: choice(env, "INVITE_MODE", "private"),
    logLevel: choice(env, "LOG_LEVEL", "info"),
    trustedProxyCount: integer(env, "TRUSTED_PROXY_COUNT", 0),
    production: nodeEnv === "production",
  });
}


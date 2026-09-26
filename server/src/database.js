import pg from "pg";

export function createPool(config) {
  return new pg.Pool({ connectionString: config.databaseUrl, max: 10, application_name: "rpg-platform" });
}

export async function databaseReady(pool) {
  const result = await pool.query("select to_regclass('public.schema_migrations') is not null as migrated");
  return result.rows[0]?.migrated === true;
}


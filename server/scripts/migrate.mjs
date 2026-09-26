import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import pg from "pg";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL é obrigatória.");
const directory = resolve("migrations");
const files = (await readdir(directory)).filter((file) => /^\d+_.+\.sql$/.test(file)).sort();
const pool = new pg.Pool({ connectionString: databaseUrl, application_name: "rpg-platform-migrations" });

try {
  await pool.query(`create table if not exists schema_migrations (
    name text primary key,
    checksum text not null,
    applied_at timestamptz not null default now()
  )`);
  for (const name of files) {
    const sql = await readFile(resolve(directory, name), "utf8");
    const checksum = createHash("sha256").update(sql).digest("hex");
    const applied = await pool.query("select checksum from schema_migrations where name = $1", [name]);
    if (applied.rowCount) {
      if (applied.rows[0].checksum !== checksum) throw new Error(`Migration imutável alterada: ${name}.`);
      continue;
    }
    const client = await pool.connect();
    try {
      await client.query("begin");
      await client.query(sql);
      await client.query("insert into schema_migrations (name, checksum) values ($1, $2)", [name, checksum]);
      await client.query("commit");
      process.stdout.write(`applied ${name}\n`);
    } catch (error) {
      await client.query("rollback");
      throw error;
    } finally {
      client.release();
    }
  }
} finally {
  await pool.end();
}


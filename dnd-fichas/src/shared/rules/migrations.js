function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const child of Object.values(value)) deepFreeze(child);
  return value;
}

export function defineMigration({ id, fromVersion, toVersion, migrate }) {
  if (!id || !Number.isInteger(fromVersion) || !Number.isInteger(toVersion) || toVersion <= fromVersion || typeof migrate !== "function") {
    throw new TypeError("Definição de migração inválida.");
  }
  return Object.freeze({ id, fromVersion, toVersion, migrate });
}

export function defineMigrationChain(currentVersion, migrations = []) {
  if (!Number.isInteger(currentVersion) || currentVersion < 1) throw new TypeError("Versão atual de migração inválida.");
  const ordered = [...migrations].sort((left, right) => left.fromVersion - right.fromVersion);
  const fromVersions = new Set();
  for (const migration of ordered) {
    if (fromVersions.has(migration.fromVersion)) throw new TypeError(`Migração duplicada para a versão ${migration.fromVersion}.`);
    if (migration.toVersion > currentVersion) throw new TypeError(`Migração ${migration.id} ultrapassa a versão atual.`);
    fromVersions.add(migration.fromVersion);
  }
  return Object.freeze({ currentVersion, migrations: Object.freeze(ordered) });
}

export function runMigrationChain(input, sourceVersion, chain, { validate = () => true } = {}) {
  const original = structuredClone(input);
  if (!Number.isInteger(sourceVersion) || sourceVersion < 0) {
    return { ok: false, code: "invalid-source-version", sourceVersion, input: original };
  }
  if (sourceVersion > chain.currentVersion) {
    return { ok: false, code: "future-version", sourceVersion, input: original };
  }

  let version = sourceVersion;
  let current = structuredClone(input);
  const migrationIds = [];
  while (version < chain.currentVersion) {
    const migration = chain.migrations.find((candidate) => candidate.fromVersion === version);
    if (!migration) {
      return { ok: false, code: "unsupported-migration-path", sourceVersion, stoppedAtVersion: version, input: original };
    }
    try {
      const protectedInput = deepFreeze(structuredClone(current));
      const output = migration.migrate(protectedInput);
      if (!output || typeof output !== "object" || Array.isArray(output)) throw new TypeError("A migração não retornou um registro.");
      current = structuredClone(output);
      version = migration.toVersion;
      migrationIds.push(migration.id);
    } catch (error) {
      return {
        ok: false,
        code: "migration-failed",
        sourceVersion,
        stoppedAtVersion: version,
        failedMigrationId: migration.id,
        error: { name: error?.name ?? "Error", message: error?.message ?? "Falha desconhecida." },
        input: original,
      };
    }
  }

  if (!validate(current)) {
    return { ok: false, code: "migration-validation-failed", sourceVersion, migratedVersion: version, input: original, migrated: current };
  }
  return { ok: true, data: current, schemaVersion: version, migrationIds, sourceVersion };
}

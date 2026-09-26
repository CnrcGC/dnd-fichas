import { AppError } from "../../errors.js";

const projection = `id, system_id as "systemId", schema_version as "schemaVersion",
  display_name as "displayName", summary_metadata as "summaryMetadata",
  system_data as data, revision, created_at as "createdAt", updated_at as "updatedAt",
  deleted_at as "deletedAt"`;

export class CharacterRepository {
  constructor(pool) { this.pool = pool; }

  async list(ownerId, { limit = 50, updatedAfter = null } = {}) {
    const result = await this.pool.query(
      `select ${projection} from characters
       where owner_id = $1 and deleted_at is null and ($2::timestamptz is null or updated_at > $2)
       order by updated_at, id limit $3`,
      [ownerId, updatedAfter, limit]
    );
    return result.rows;
  }

  async getById(ownerId, id, { includeDeleted = false } = {}) {
    const result = await this.pool.query(
      `select ${projection} from characters where owner_id = $1 and id = $2 and ($3 or deleted_at is null)`,
      [ownerId, id, includeDeleted]
    );
    return result.rows[0] ?? null;
  }

  async withOperation(ownerId, operationId, callback) {
    const client = await this.pool.connect();
    try {
      await client.query("begin");
      const replay = await client.query("select response_metadata from applied_operations where owner_id = $1 and operation_id = $2", [ownerId, operationId]);
      if (replay.rowCount) {
        await client.query("commit");
        return { replayed: true, metadata: replay.rows[0].response_metadata };
      }
      const result = await callback(client);
      await client.query(
        `insert into applied_operations (owner_id, operation_id, resource_type, resource_id, status_code, response_metadata, expires_at)
         values ($1, $2, 'character', $3, $4, $5, now() + interval '90 days')`,
        [ownerId, operationId, result.record.id, result.statusCode, { revision: result.record.revision }]
      );
      await client.query("commit");
      return { ...result, replayed: false };
    } catch (error) {
      await client.query("rollback");
      throw error;
    } finally {
      client.release();
    }
  }

  async create(ownerId, record, operationId) {
    const result = await this.withOperation(ownerId, operationId, async (client) => {
      try {
        const inserted = await client.query(
          `insert into characters (id, owner_id, system_id, schema_version, display_name, summary_metadata, system_data, revision, created_at, updated_at)
           values ($1,$2,$3,$4,$5,$6,$7,0,$8,$8) returning ${projection}`,
          [record.id, ownerId, record.systemId, record.schemaVersion, record.displayName, record.summaryMetadata, record.data, record.updatedAt]
        );
        return { statusCode: 201, record: inserted.rows[0] };
      } catch (error) {
        if (error.code === "23505") throw new AppError("character-exists", "Já existe um personagem com este ID.", 409);
        throw error;
      }
    });
    if (result.replayed) return { replayed: true, record: await this.getById(ownerId, record.id, { includeDeleted: true }) };
    return result;
  }

  async update(ownerId, id, change, operationId) {
    const result = await this.withOperation(ownerId, operationId, async (client) => {
      const updated = await client.query(
        `update characters set schema_version=$3, display_name=$4, summary_metadata=$5, system_data=$6,
           revision=revision+1, updated_at=now()
         where owner_id=$1 and id=$2 and revision=$7 and deleted_at is null returning ${projection}`,
        [ownerId, id, change.schemaVersion, change.displayName, change.summaryMetadata, change.data, change.baseRevision]
      );
      if (!updated.rowCount) {
        const current = await client.query(`select ${projection} from characters where owner_id=$1 and id=$2`, [ownerId, id]);
        if (!current.rowCount) throw new AppError("character-not-found", "Personagem não encontrado.", 404);
        throw new AppError("revision-conflict", "A ficha foi alterada em outro dispositivo.", 409, { current: current.rows[0] });
      }
      return { statusCode: 200, record: updated.rows[0] };
    });
    if (result.replayed) return { replayed: true, record: await this.getById(ownerId, id, { includeDeleted: true }) };
    return result;
  }

  async softDelete(ownerId, id, baseRevision, operationId) {
    const result = await this.withOperation(ownerId, operationId, async (client) => {
      const deleted = await client.query(
        `update characters set deleted_at=now(), updated_at=now(), revision=revision+1
         where owner_id=$1 and id=$2 and revision=$3 and deleted_at is null returning ${projection}`,
        [ownerId, id, baseRevision]
      );
      if (!deleted.rowCount) {
        const current = await client.query(`select ${projection} from characters where owner_id=$1 and id=$2`, [ownerId, id]);
        if (!current.rowCount) throw new AppError("character-not-found", "Personagem não encontrado.", 404);
        throw new AppError("revision-conflict", "A ficha foi alterada antes da exclusão.", 409, { current: current.rows[0] });
      }
      return { statusCode: 200, record: deleted.rows[0] };
    });
    if (result.replayed) return { replayed: true, record: await this.getById(ownerId, id, { includeDeleted: true }) };
    return result;
  }
}


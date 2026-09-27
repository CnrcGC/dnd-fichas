# Repository / Source Audit Summary

## Scope and evidence

This plan introduces the smallest backend that satisfies private deployment, accounts, authorization, durable backup, and conflict-safe synchronization while preserving offline/local-first use.

- **Verified repository fact:** neither audited application contains a backend, authentication, server database, authorization boundary, migration runner, deployment topology, or server backup process.
- **Verified repository fact:** D&D persists an array under `pilares-de-atlas:fichas`; Yusong persists under `yusong.characters` plus an active-character key. Both generate identifiers client-side. D&D reports storage errors; Yusong silently logs them.
- **Verified repository fact:** D&D export/import is character JSON without a cross-system envelope. Yusong exports a rendered PNG card, not restorable character JSON.
- **Verified repository fact:** D&D schema normalization is mature but is not an ordered migration chain; Yusong has a default merge and no schema version. Neither has a `systemId`, server revision, ownership field, or conflict metadata.
- **Rulebook fact:** F&M data includes sensitive free text, character images, personal aspects, notes, contracts/vows, and potentially licensed source references. Store only user-created data and structured rule identifiers; do not upload book artwork or reproduce rulebook pages.
- **Architectural recommendation:** use a modular monolith: Node.js on a currently supported LTS release, Fastify 5, PostgreSQL, Better Auth with email/password and cookie sessions, and a local-filesystem/object-storage abstraction for media. Keep the codebase in JavaScript/ES modules to match the repositories. Pin exact versions and review them at implementation time.
- **Architectural recommendation:** expose versioned REST endpoints under `/api/v1`; use JSON Schema validation at the HTTP boundary; keep system payload validation in the corresponding mechanics package. Use PostgreSQL `jsonb` for isolated `system_data`, with common searchable/ownership metadata in ordinary columns.
- **Open owner decision:** hosting location, public domain, TLS termination, email delivery/password reset, invite policy, and recovery objectives must be selected before production provisioning.

The recommendation is intentionally concrete rather than a technology menu. Fastify fits the existing JavaScript/Vite ecosystem and provides schema-driven validation without forcing a frontend rewrite; PostgreSQL supplies durable transactions, JSONB, backup/restore tooling, and optional row security; Better Auth supplies maintained account/session flows instead of a custom password implementation. Implementation agents must re-check supported versions against the official [Fastify v5 migration guide](https://fastify.dev/docs/latest/Guides/Migration-Guide-V5/), [Better Auth Fastify integration](https://www.better-auth.com/docs/integrations/fastify), [Better Auth session documentation](https://www.better-auth.com/docs/concepts/session-management), and [PostgreSQL backup documentation](https://www.postgresql.org/docs/current/backup.html) when pinning dependencies.

## Target topology and non-goals

```text
Browser / IndexedDB outbox
          │ HTTPS + HttpOnly cookie
          ▼
Fastify modular monolith
  auth | characters | preferences | media | creatures | encounters
          │
          ├── PostgreSQL (authoritative synchronized state)
          └── private media store (persistent volume or S3-compatible bucket)
```

The first deployment is one application service and one PostgreSQL database behind a TLS reverse proxy. Do not introduce microservices, Kubernetes, a message broker, event sourcing, GraphQL, real-time multiplayer, or a general campaign/VTT backend unless later requirements justify them.

## Shared invariants

- The browser remains usable locally without an account or network if OD-01 approves permanent anonymous mode.
- PostgreSQL is authoritative only for records that have been claimed/synchronized; it never causes automatic deletion of unsynced device data.
- Every owned query is scoped by the authenticated `user_id`; a UUID alone never authorizes access.
- Every mutable record has an integer `revision`, server timestamps, and an idempotency/operation key path.
- System payloads are opaque to generic services but validated by the registered system schema/version.
- Cross-system conversion is prohibited. Import creates a record for the declared system or fails visibly.
- Logs and metrics exclude character payloads, notes, access tokens, passwords, and images.

Priorities are **P0** release blockers, **P1** core product, **P2** follow-up, and **P3** optional. Status reflects audited code.

## BE-00 — Backend workspace and reproducible service foundation

- **Priority / status:** P0 / Missing.
- **Implementation:** add a server workspace only after FE-00 cleanup. Use Fastify 5 on Node 20 or newer supported LTS, ES modules, environment-schema validation, structured logging, JSON Schema route definitions, and graceful shutdown. Separate modules by business capability, not technical layer sprawl. Add health endpoints: `/health/live` checks process health; `/health/ready` checks database and migration readiness without disclosing secrets.
- **Configuration:** typed/validated environment variables for database URL, public origin, cookie secret, media driver/path, upload limit, invite mode, log level, and trusted proxy count. Refuse startup on missing production secrets or an unapplied incompatible schema.
- **API conventions:** JSON; UTC ISO timestamps; UUIDs; stable error body `{ code, message, details?, requestId }`; request-size limits; `/api/v1`; OpenAPI generated from route schemas.
- **Acceptance:** a fresh local environment starts with one documented command; invalid configuration fails fast; shutdown drains connections; health checks have deterministic status codes.
- **Tests:** configuration matrix, readiness failure, request ID propagation, error serializer, graceful shutdown.
- **Dependencies:** FE-00. Blocks all backend packages.

## BE-01 — Private access, authentication, and session security

- **Priority / status:** P0 / Missing.
- **Implementation:** integrate Better Auth using PostgreSQL and email/password. Use server-side/cookie-based sessions with `HttpOnly`, `Secure` in production, and `SameSite=Lax` by default. Prefer same-origin frontend/API deployment. Disable public signup for a private instance or require one-time invites. Add explicit sign-in, sign-out-all-sessions, change-password, and session-list/revoke flows.
- **CSRF/origin defense:** validate trusted origins for state-changing requests, use the authentication framework’s CSRF protections, reject non-JSON mutations, and do not enable broad CORS. Rate-limit sign-in, signup/invite redemption, password reset, and upload endpoints by IP plus account where appropriate.
- **Password recovery:** support email reset only if a private mail provider is configured; otherwise provide a documented administrator CLI recovery procedure with audit logging. Never email temporary plaintext passwords.
- **Bootstrap:** create the first administrator through a one-time CLI/environment bootstrap that disables itself after use. Roles are `user` and `admin`; administrators do not implicitly read user character payloads through ordinary UI/API routes.
- **Acceptance:** unauthenticated access to owned server data is 401; cross-user access is 404 or 403 consistently without revealing existence; revoked/expired sessions stop working; no token is exposed to JavaScript storage.
- **Tests:** signup-mode matrix, session fixation/rotation, CSRF/untrusted-origin, rate limit, password reset/recovery, cross-user authorization.
- **Dependencies:** BE-00; deployment decisions OD-02/03.

## BE-02 — PostgreSQL schema, ownership, and system isolation

- **Priority / status:** P0 / Missing.
- **Core tables:**

| Table | Required fields | Notes |
|---|---|---|
| auth `user`/`account`/`session`/`verification` | framework-required IDs, normalized email, verified state, credential/provider references, session expiry, timestamps | generated/migrated through Better Auth; never add password columns outside its adapter |
| `invites` | token digest, creator, intended email?, role, expiry, used timestamp | optional when private invite mode is selected; never store raw token after issuance |
| `characters` | `id`, `owner_id`, `system_id`, `schema_version`, `display_name`, `summary_metadata jsonb`, `system_data jsonb`, `revision`, `created_at`, `updated_at`, `deleted_at` | unique `(owner_id,id)`; index owner/update/system; payload validation in service |
| `preferences` | `owner_id`, `preferences jsonb`, `revision`, timestamps | one row per user; allowlisted keys only |
| `media_objects` | `id`, `owner_id`, `character_id?`, storage key, MIME, bytes, checksum, timestamps | metadata only in DB; private access |
| `creatures` | ownership, `system_id`, schema/version, name/summary/data, revision/timestamps | system-specific template payload |
| `encounters` | ownership, `system_id`, name, round, state/data, revision/timestamps | lightweight only |
| `encounter_participants` | encounter, source refs, snapshot, order, resources/conditions | snapshots protect history from template edits |
| `applied_operations` | `owner_id`, `operation_id`, resource, response metadata, expiry | idempotent replay protection |
| `audit_events` | actor, action, target type/id, timestamp, request ID, outcome | metadata only; no payload contents |

- **System IDs:** enforce a check/reference table for `dnd5e`, `yusong`, and `feiticeiros-maldicoes`. Validate `schema_version` and `system_data` through the matching server-side adapter before commit.
- **Authorization:** every repository function requires `ownerId`; prohibit unscoped `findById`. Optionally add PostgreSQL row-level security as defense in depth, with integration tests proving the application sets the session owner correctly. RLS never replaces application checks.
- **Deletion:** soft-delete synchronized user records initially, exclude them by default, and define a purge retention job only after policy approval.
- **Acceptance:** database constraints reject invalid owners/system identifiers/revisions; no generic query can return records across owners; summary metadata is regenerated server-side from validated system data rather than trusted from the client.
- **Tests:** constraints, indexes/query plans on representative volume, cross-owner leakage, soft-delete, RLS if enabled, payload/schema mismatch.
- **Dependencies:** BE-00, MECH-01, MECH-04.

## BE-03 — Versioned REST API and validation boundary

- **Priority / status:** P0 / Missing.
- **Endpoints:**

| Capability | Endpoints |
|---|---|
| Character sync | `GET/POST /api/v1/characters`, `GET/PATCH/DELETE /api/v1/characters/:id` |
| Batch bootstrap | `GET /api/v1/sync?updatedAfter=&cursor=` |
| Preferences | `GET/PUT /api/v1/preferences` |
| Media | `POST /api/v1/media`, `GET/DELETE /api/v1/media/:id` |
| Creatures | CRUD under `/api/v1/creatures` |
| Encounters | CRUD under `/api/v1/encounters` plus participant/action mutations |

- **Mutation contract:** client sends `operationId` and `baseRevision`; updates use `If-Match` or an equivalent explicit field. Success returns canonical record and new revision. Stale base returns `409 conflict` with current metadata and, when safe, the canonical payload for user resolution. Replayed operation IDs return the original logical result.
- **Validation:** route schema validates shape/size; system adapter validates current schema and may migrate only according to explicitly supported server migrations. Return 422 for invalid data, never a partly normalized success. Pagination is cursor-based with deterministic `(updated_at,id)` ordering.
- **Error semantics:** distinguish authentication, authorization, validation, unsupported system/version, conflict, payload too large, rate limiting, and service unavailable. Frontend-visible messages are mapped from stable codes, not server stack traces.
- **Acceptance:** OpenAPI matches runtime behavior; all writes are transactional; list pagination neither duplicates nor skips on stable data; unsupported future client schemas fail without mutation.
- **Tests:** contract tests from generated schemas, transaction rollback, pagination, idempotent replay, concurrency races, error-code matrix.
- **Dependencies:** BE-01, BE-02, MECH system validators. Consumed by FE-07.

## BE-04 — Legacy local data claim and import

- **Priority / status:** P1 / Missing.
- **Implementation:** the browser performs legacy parsing/migration locally, shows the user a preview, then submits platform envelopes to `POST /api/v1/characters/import` in bounded batches. The server revalidates every record. Associate imports with the authenticated user only after explicit confirmation; anonymous device data is never uploaded merely because the user signs in.
- **Duplicate detection:** exact record ID plus owner is authoritative. Also calculate a content checksum and return possible duplicates, but do not merge based on name. The user chooses skip, import copy with new ID, or replace through the normal revision flow.
- **Provenance:** store import metadata such as source system, source schema version, imported timestamp, and migration version outside the user payload. Do not store raw legacy blobs indefinitely; allow the browser to export them.
- **Acceptance:** D&D v8 and Yusong legacy fixtures can be previewed, imported, retried, and deduplicated; partial batch failure identifies individual records and leaves successful imports intact.
- **Tests:** real fixtures, duplicate-name records, repeated batch, malformed record, unsupported version, interrupted response.
- **Dependencies:** FE-02, MECH-02/03/04, BE-03.

## BE-05 — Local-first synchronization and conflict protocol

- **Priority / status:** P1 / Missing.
- **Protocol:** use per-record optimistic concurrency, not server push, for the first release. Client outbox operations are ordered per record and can run concurrently across different records. Server uses a transaction to compare `baseRevision`, apply the operation, increment revision, record the idempotency key, and return the canonical record.
- **Bootstrap/pull:** cursor-sync changed and deleted records after a server watermark. A full paginated reconciliation remains available for damaged cursors. Device cursor is local state, not security state.
- **Conflicts:** never auto-merge opaque system payloads. Return both the server record and conflict metadata; frontend preserves the local snapshot and presents keep-local, keep-server, or duplicate. A later system adapter may implement field-aware three-way merge only with exhaustive tests.
- **Failure handling:** treat 4xx validation/auth errors as user action required; retry 429/5xx/network failures with capped backoff and jitter. Expired sessions pause the queue. A deletion conflict does not discard edits.
- **Acceptance:** two tabs/devices cannot silently overwrite; replay after timeout is idempotent; offline work survives reload and server downtime; tombstones propagate without erasing unresolved local work.
- **Tests:** two-client race matrix, create/update/delete reorder, network drop after commit, duplicate operation, expired tombstone, clock skew, cursor reset.
- **Dependencies:** BE-03; FE-07.

## BE-06 — Preferences and private media

- **Priority / status:** P1 / Missing.
- **Preferences:** allow only documented keys: theme (`light|dark|system`), reduced-motion override, density, sound mute, dice animation, and library view. Use revision conflicts but permit a simple whole-object choice because preferences are non-critical.
- **Media:** accept only allowlisted raster formats after signature inspection; define byte and pixel limits; strip metadata; decode and re-encode thumbnails; generate random storage keys; never serve user filenames as paths. Store privately and authorize every read, or issue short-lived signed URLs from private object storage.
- **Image policy:** external image URLs such as DiceBear are never fetched by the server implicitly. The user may upload/download through an explicit flow. SVG upload is excluded initially due to active-content risk.
- **Acceptance:** oversized, mismatched, malformed, or unauthorized images fail safely; deleting/replacing a portrait cleans up unreferenced media after a grace period; theme preferences synchronize without containing character data.
- **Tests:** magic-byte/MIME mismatch, image bomb limits, EXIF removal, cross-owner reads, orphan cleanup, preference schema/conflict.
- **Dependencies:** BE-01/02/03; VA-01 and FE-09 for client contract.

## BE-07 — Creatures and lightweight encounters

- **Priority / status:** P2 / Missing.
- **Implementation:** CRUD for private system-specific creature templates. Encounter creation copies participant display/combat data into snapshots while retaining an optional source reference. Mutations cover initiative/order, current resources, conditions, round advance, and notes. Validate each encounter contains one `system_id` only.
- **F&M nuance:** an Invocation is character-owned system data. When added to an encounter, create a participant snapshot through the F&M adapter; do not migrate ownership into the generic creature library.
- **Concurrency:** reuse revision/idempotency behavior. Do not implement websockets or simultaneous collaborative play in the first release.
- **Acceptance:** template edits do not retroactively alter an active encounter; reset operations are explicit; deleting a source template does not corrupt saved encounters.
- **Tests:** snapshot independence, system mismatch, participant order, reset, source deletion, concurrent update.
- **Dependencies:** BE-02/03/05, MECH-13, FE-11.

## BE-08 — Database migrations, backup, restore, and retention

- **Priority / status:** P0 before production / Missing.
- **Implementation:** use ordered, immutable SQL migrations with a schema-history table and transactional migrations where PostgreSQL permits. Separate database migrations from system-payload migrations. Take automated encrypted `pg_dump` backups plus media backups; store them outside the application host/volume. Define daily backups initially, retention tiers after RPO approval, and quarterly restore drills.
- **Restore:** document full-instance restore, single-user logical recovery, and media reconciliation. Verify backup age and last successful restore in operations health. Never claim backup success from file existence alone; validate archive integrity.
- **Deployment rule:** production startup may apply only explicitly approved backward-compatible migrations or fail readiness; destructive migrations use expand/migrate/contract across releases.
- **Acceptance:** a clean database migrates to current; previous supported version upgrades; downgrade assumptions are documented; a restore drill proves records, revisions, auth sessions policy, and media references.
- **Tests:** migration up path on empty and seeded DB, failure rollback, old-server/new-schema compatibility window, automated restore in disposable environment.
- **Dependencies:** BE-02; owner RPO/RTO decisions.

## BE-09 — Private deployment and environment separation

- **Priority / status:** P0 before production / Missing.
- **Implementation:** provide Docker images and a small Compose deployment for application plus PostgreSQL, with optional S3-compatible media or a backed-up persistent media volume. Put TLS and request limits at a reverse proxy. Use separate development, preview, and production databases, secrets, domains, and media namespaces. Run as non-root, use read-only filesystem where practical, pin images by version/digest, and mount only required writable paths.
- **Network posture:** database and media administrative endpoints are not internet-exposed. Prefer VPN/private network or invite-only HTTPS. Configure trusted proxy count exactly. Set HSTS after HTTPS is verified and secure headers through Fastify/proxy.
- **Secrets:** inject at runtime through the deployment platform; never commit `.env`, cookie secrets, database URLs, SMTP credentials, or backup keys. Document rotation.
- **Acceptance:** a deployment rehearsal starts from empty infrastructure, migrates, bootstraps admin, passes health/smoke tests, takes a backup, and restores it. Preview cannot access production data.
- **Dependencies:** BE-00/01/08; OD-02 through OD-05.

## BE-10 — Server testing, auditability, monitoring, and operations

- **Priority / status:** P1 / Missing.
- **Testing pyramid:** unit tests for validators/services; PostgreSQL integration tests for repositories/transactions; API contract tests; browser sync tests; security tests for authorization, sessions, rate limits, and uploads; restore tests.
- **Logging:** structured request ID, route, status, latency, authenticated actor ID hash or internal ID, operation type, resource type/id, and error code. Redact cookies, authorization headers, email where not needed, and all payload bodies.
- **Metrics/alerts:** request rate/error/latency, DB pool saturation, auth failures, sync conflicts, queue age reported by clients only in aggregate, storage use, backup age, migration status, and media-processing failures. Alert on sustained failure, not isolated user validation errors.
- **Runbooks:** unavailable DB, disk full, expired TLS, leaked secret, failed migration, failed backup, restore, compromised account, orphaned media, and abusive login traffic.
- **Acceptance:** operators can correlate a client request without seeing character content; critical alerts link to runbooks; a privacy review verifies default logs.
- **Dependencies:** all backend packages; FE-12 for end-to-end evidence.

## Dependency Graph / Recommended Implementation Order

```text
FE-00 ─> BE-00
MECH-01/04 ───────────────┐
BE-00 ─> BE-01 ─> BE-02 ─> BE-03
                         ├─> BE-04 ─> FE-07
                         ├─> BE-05 ─> FE-07
                         ├─> BE-06 ─> FE-09
                         └─> BE-07 ─> FE-11
BE-02 ─> BE-08 ─> BE-09
All backend packages ─> BE-10
```

Build the local platform/migration boundary before uploading user data. Implement auth and ownership before any character endpoint. Ship database backups and a tested restore before calling the deployment production-ready. Add sync after CRUD contract tests, then media/preferences, then encounters.

## Open Decisions

- **OD-01:** is no-account local-only use a permanent supported mode, or must every long-term user claim data into an account?
- **OD-02:** choose deployment target, jurisdiction, domain, reverse proxy, and whether access is VPN-only or internet-facing invite-only.
- **OD-03:** choose email provider and sender domain, or approve administrator-only password recovery for the private instance.
- **OD-04:** set maximum users, records per user, image size/pixels, API body size, and storage quota.
- **OD-05:** set RPO, RTO, backup location/encryption owner, retention, and restore-drill frequency. Recommendation: daily encrypted backup and quarterly verified restore until usage justifies tighter objectives.
- **OD-06:** approve soft-delete retention and user/account deletion policy, including backups.
- **OD-07:** decide whether PostgreSQL RLS is required for defense in depth in the first production release.
- **OD-08:** approve operational telemetry and audit retention; default is payload-free and self-hosted.
- **OD-09:** decide when, if ever, multi-user sharing/campaign ownership enters scope. It is excluded from this plan’s first release.

## Regression Checklist

- [ ] Local-only D&D and Yusong remain usable during backend outages.
- [ ] Legacy data is previewed and explicitly claimed; sign-in alone uploads nothing.
- [ ] All owned queries include authenticated ownership and pass cross-user tests.
- [ ] System ID/schema version/payload are validated together on every write.
- [ ] No session token is stored in browser JavaScript storage.
- [ ] Idempotent replay cannot create duplicate characters or repeat destructive actions.
- [ ] Stale updates return conflicts and preserve both versions.
- [ ] Logs, metrics, audit events, and error reports contain no character payloads.
- [ ] Media is private, validated, re-encoded, and access-controlled.
- [ ] Database and media backups live outside the primary host/volume and restore successfully.
- [ ] Development/preview cannot read production data or secrets.
- [ ] Creatures/encounters remain single-system and lightweight.

## Validation Matrix

| Risk | Automated evidence | Operational/manual evidence | Pass condition |
|---|---|---|---|
| Authentication | Session, CSRF, rate-limit tests | Browser sign-in/revoke/recovery | No token leakage; revoked session rejected |
| Authorization | Cross-owner API/DB tests | Two-account review | No existence or payload disclosure |
| Validation | Route and system schema contracts | Invalid/future client exercise | No partial writes; stable error code |
| Concurrency | Two-client revision/idempotency suite | Offline/two-device scenario | No silent overwrite or duplicate |
| Migration/import | Legacy fixture suite | User preview and retry | Idempotent and recoverable |
| Media | Parser/limit/access tests | Malformed/large/private URL review | Private, sanitized, bounded |
| Backup | Automated dump/restore test | Quarterly recovery drill | RPO/RTO achieved with verified records/media |
| Deployment | Container and migration smoke tests | Empty-host rehearsal | TLS, health, isolation, rollback runbook |
| Privacy | Log-redaction assertions | Sample-log audit | No sensitive payload or credentials |
| Performance | API/DB benchmark on agreed volume | Low-resource host observation | Budgets approved and met |

## Final Acceptance Checklist

- [ ] The backend is a documented modular monolith with pinned, supported dependencies.
- [ ] Private/invite access, secure sessions, CSRF/origin checks, and rate limits are active.
- [ ] PostgreSQL ownership and system isolation are enforced and tested.
- [ ] REST/OpenAPI contracts use revisions, idempotency keys, and stable error codes.
- [ ] Local imports are explicit, previewable, idempotent, and provenance-aware.
- [ ] Offline mutations synchronize without silent loss; all conflicts are recoverable.
- [ ] Preferences and media obey strict allowlists and authorization.
- [ ] Creature/encounter storage is lightweight, single-system, and snapshot-safe.
- [ ] Ordered migrations, external encrypted backups, and verified restore procedures work.
- [ ] Production, preview, and development are isolated; secrets are not committed.
- [ ] Monitoring and runbooks reveal operational failures without exposing user content.
- [ ] Hosting, recovery, retention, registration, and privacy owner decisions are documented.

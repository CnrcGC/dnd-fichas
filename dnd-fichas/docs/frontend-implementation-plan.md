# Repository / Source Audit Summary

## Scope and evidence

This plan is the frontend delivery contract for consolidating the existing D&D 5e and Yusong applications and adding Feiticeiros & Maldições (F&M) without turning the product into a full virtual tabletop. It is based on the following audited sources:

- **Verified repository fact — D&D 5e:** `dnd-fichas` is a React 19/Vite 8 single-page application with React Router, a character library, guided and blank character creation, JSON import/export, print output, dice rolling, localStorage persistence, and an extensive rules layer. The current character schema is `versaoFicha: 8`; it has no `systemId` and no ordered migration pipeline.
- **Verified repository fact — D&D quality:** 107 existing tests pass, lint passes, and a clean production build succeeds. The build reports a JavaScript chunk of about 543 kB minified. No UI, end-to-end, accessibility, or visual-regression test suite was found.
- **Verified worktree fact — D&D visual work:** the shared CSS token/component work in `src/styles/tokens.css`, `src/styles/components/`, and `src/styles/index.css` is uncommitted user work. It is a valuable partial implementation, not a stable repository baseline. Preserve and reconcile it; do not overwrite it during platform extraction.
- **Verified repository fact — Yusong:** the application is React 19/Vite 8 without routing. One large `App.jsx` owns persistence, calculations, CRUD, dice, sound, presentation mode, inventory, and rendering. It supports multiple local characters but has no schema version or system discriminator.
- **Verified repository fact — Yusong quality:** the lock file is inconsistent with the package graph (`npm ci` fails), a repaired temporary install builds, lint reports 13 errors and 2 warnings, and no automated tests exist. The repository also contains accidental directory nesting and misleading/default README files.
- **Verified repository fact — persistence:** D&D uses `pilares-de-atlas:fichas`; Yusong uses `yusong.characters` and `yusong.activeCharacterId`. D&D shows persistence failures; Yusong only logs them. Neither application has authenticated server sync.
- **Rulebook fact — F&M:** the audited source is edition 2.5.2, 368 pages. It defines distinct attributes, derived statistics, Origins, Specializations, Talents, Cursed Aptitudes, techniques/spells, invocations, tests, combat, soul damage, rests, interludes, and vows. F&M is not a D&D skin and needs an isolated engine and purpose-built UI.
- **Architectural recommendation:** retain JavaScript/ES modules, React, and Vite. Create a modular platform shell and explicit system adapters inside the existing frontend rather than rewriting the working D&D engine or forcing all systems into a universal sheet component.
- **Open owner decision:** the Yusong source labels itself inconsistently as “Yusong”, “Pilares de Atlas”, and “Circuito de Soyang”. The owner must select the public product/system names before permanent URLs, migration messages, and branding strings are frozen.

## Current capability classification

| Capability | D&D 5e | Yusong | F&M | Platform conclusion |
|---|---|---|---|---|
| Local character library | Implemented — migrate | Implemented — migrate | Missing | Extract a shared library contract; retain system-owned summaries |
| Versioned schema | Partial: version 8 normalizer | Missing | Missing | Add a platform envelope and ordered per-system migrations |
| Guided creation | Implemented — migrate | Partial: random generator/editor | Missing | Shared entry flow; system-specific creators |
| Dice | Implemented — migrate | Implemented — migrate | Missing | Share presentation/history interface, not rule formulas |
| JSON backup | Implemented — preserve/migrate | Missing | Missing | Add platform export envelope and system adapters |
| Print/export | Implemented — preserve (browser print) | Implemented — preserve (PNG card) | Missing | Preserve both; add system-specific print views later |
| Tabletop mode | Missing | Partial: presentation mode is prior art | Missing | Build a platform route with system-specific quick actions |
| Creatures/encounters | Deferred in old plan | Missing; Invocations are not generic creatures | Missing | Add lightweight records and initiative/resource tracking only |
| Server sync | Newly introduced scope | Newly introduced scope | Newly introduced scope | Introduce after local migrations and backend contracts are stable |
| Light theme | Deferred in old visual plan | Missing | Missing | Deferral is superseded; implement semantic themes with system accents |

## Target frontend shape

```text
src/
  app/                 routing, providers, error boundaries, startup
  platform/            library, preferences, sync, dice UI, dialogs, media
  systems/
    dnd5e/             adapter, screens, components, existing rule integration
    yusong/            adapter, screens, components, existing rule integration
    feiticeiros/       adapter, creator, sheet, tabletop views
  shared/              presentational primitives only; no system rules
```

The platform depends on a small `SystemAdapter` contract. Each adapter owns identity/description/branding metadata, schema validation, migrations, default character factory, summary projection, creation and sheet routes, progression hooks, import/export handlers, printable view, dice integration, namespaced preferences, tabletop actions, and optional creature capabilities. Capabilities are detected explicitly; an unsupported feature is not represented by a dummy implementation. No platform component may inspect system-specific fields such as D&D spell slots, Yusong body parts, or F&M Cursed Energy.

## Work package format

Priorities are **P0** release blockers, **P1** core product, **P2** important follow-up, and **P3** optional enhancement. Status is based on audited code: **Implemented**, **Partial**, **Missing**, or **Preserve**.

## FE-00 — Repository hygiene and reproducible frontend baseline

- **Priority / status:** P0 / Partial.
- **Problem:** generated `node_modules` and `dist` content is tracked in D&D, Yusong has an inconsistent lock file and accidental nesting, and documentation does not describe the actual products.
- **Implementation:** make cleanup a standalone change. Add narrowly scoped ignore rules, stop tracking generated outputs without deleting local user data, repair the Yusong lock file with the chosen package manager, move or document the real Yusong app root, and replace misleading READMEs. Capture clean `install`, `lint`, `test`, and `build` commands for each app before restructuring.
- **Do not couple with:** rules changes, schema migrations, or visual redesign.
- **Acceptance:** a fresh clone can install and build deterministically; no dependency directory or build output is versioned; existing uncommitted CSS work is preserved.
- **Validation:** compare `git status` before/after; run clean installs and the current D&D 107-test suite; confirm Yusong build and lint baselines are explicitly recorded.
- **Dependencies:** none. Blocks FE-01 and all CI work.

## FE-01 — Platform shell, system registry, and route ownership

- **Priority / status:** P0 / Missing.
- **Implementation:** introduce an application shell with routes for `/`, `/characters/new`, `/characters/:id`, `/characters/:id/tabletop`, `/creatures`, `/encounters`, and `/settings`. Resolve a character by its platform envelope before delegating to a registered system adapter. Add explicit not-found, unsupported-system, corrupt-record, and migration-failed screens.
- **System registry contract:** `id`, `displayName`, `currentSchemaVersion`, `createDefault`, `migrate`, `validate`, `getSummary`, `routes`, `renderCharacter`, `renderCreator`, `renderPrint`, `getTabletopActions`, and capability flags. Lazy-load each system bundle so F&M/Yusong code does not inflate D&D startup.
- **Boundary rule:** the shell may manage navigation, authentication state, connectivity, preferences, and record metadata. It must never calculate system statistics.
- **Acceptance:** all three system identifiers can be registered; an unknown identifier fails safely; direct URL refresh works; route titles and landmarks update; existing D&D routes redirect without data loss.
- **Tests:** registry unit tests; routing integration tests for every state; bundle analysis proving separate system chunks.
- **Dependencies:** FE-00; MECH-01.

## FE-02 — Platform character envelope and migration gateway

- **Priority / status:** P0 / Missing.
- **Data contract:** every client record uses `{ id, systemId, schemaVersion, displayName, createdAt, updatedAt, revision, data }`. `data` is opaque to platform code. Use stable identifiers: `dnd5e`, `yusong`, and `feiticeiros-maldicoes`.
- **Implementation:** create a repository interface with IndexedDB as the durable local cache for new platform data. Keep read-only import bridges for the three legacy localStorage keys. On first successful import, write a migration receipt; never delete legacy data automatically. Run migrations through the owning adapter, validate output, and quarantine invalid records with export/retry options.
- **Conflict safety:** all writes increment `revision`; keep a mutation identifier for future server replay. Do not silently overwrite a higher revision.
- **Acceptance:** reopening the app is idempotent; duplicate import is prevented; legacy data remains recoverable; corrupt data never crashes the library; timestamps are explicit ISO strings.
- **Tests:** migration fixtures from real D&D v8 and Yusong records; interrupted-write simulation; idempotency and rollback tests.
- **Dependencies:** MECH-02, MECH-03, MECH-04. Coordinates with BE-02, BE-04, BE-05.

## FE-03 — Unified character library and creation entry

- **Priority / status:** P1 / Partial.
- **Implementation:** replace system-specific home screens with a responsive character library supporting search, system/status filters, sort by updated/name/system, cards and compact list view, import/export, duplicate, delete confirmation, offline/sync badges, and an accessible empty state. The “New character” action first selects a system, then delegates to its creator. Preserve D&D blank-sheet creation as an advanced option.
- **Rules:** card summaries come only from `adapter.getSummary`; do not assume level, HP, class, or portrait exists. Destructive actions name the exact character and remain reversible when server soft-delete exists.
- **Acceptance:** mixed-system libraries render without conditional field inspection; keyboard and screen-reader operation is complete; an offline-created record appears immediately.
- **Tests:** component and Playwright flows for empty, populated, corrupt, offline, loading, import, duplicate, and delete states.
- **Dependencies:** FE-01, FE-02, VA-02, VA-03; server badges additionally depend on FE-07.

## FE-04 — D&D 5e adapter and regression-preserving migration

- **Priority / status:** P0 / Partial.
- **Implementation:** move or wrap the current D&D screens behind the adapter without rewriting proven mechanics. Preserve guided creation, blank creation, level-up, multiclass, spells, resources, inventory, conditions, concentration, rests, JSON backup, dice, readiness validation, and print. Replace direct context/localStorage access with injected character repository methods in thin steps.
- **Compatibility:** redirect `/ficha/:id` and `/nova`; import `versaoFicha: 8` records into the new envelope; retain the original export reader indefinitely. Preserve the existing visible save-failure behavior until the shared sync state supersedes it.
- **Performance:** lazy-load high-cost editor sections; measure rather than arbitrarily splitting files. Establish a route-level budget after the first production bundle capture.
- **Acceptance:** the 107 mechanics tests remain green; representative v8 characters are byte-for-byte stable in system-owned fields after round-trip normalization; print layout remains usable.
- **Tests:** existing suite plus creator/editor/print smoke tests and migration golden fixtures.
- **Dependencies:** FE-01, FE-02, MECH-02, VA-06.

## FE-05 — Yusong adapter, decomposition, and migration

- **Priority / status:** P1 / Partial.
- **Implementation:** first freeze current behavior in tests, then decompose the monolithic `App.jsx` into adapter-owned creator, identity, attributes, reactions, body, talents, Genius, skills, inventory, conditions, notes, and presentation panels. Move formulas into the Yusong engine; components consume selectors and commands rather than recalculating in effects.
- **Preserve:** six school themes, nine attributes, seven body parts, reaction dice, talent stamina costs, custom Genius abilities, random generation, card PNG export, sound preference, and the useful presentation-mode interaction pattern.
- **Correctness fixes:** normalize `conditions` to an object map, surface persistence failures, avoid a network-only avatar default, and replace effect-driven derived-state writes with computed selectors.
- **Acceptance:** all migrated characters retain values and custom text; calculated values match captured fixtures; card export remains system-branded; no Yusong term leaks into platform code.
- **Tests:** formula unit tests, migration fixtures, editor flows, image-export smoke test, and lint with zero errors.
- **Dependencies:** FE-01, FE-02, MECH-03, VA-07. Public naming depends on OD-01.

## FE-06 — F&M creator and sheet vertical slice

- **Priority / status:** P1 / Missing.
- **Implementation:** build a staged creator for identity, attribute method, Origin, Specialization, training/skills, talents/aptitudes, technique or restriction path, equipment, personal aspects, and review. Each stage saves a draft locally and exposes rule citations supplied by the mechanics layer. Build a responsive sheet organized around identity; six attributes; PV, PE or Estamina, Defense, Attention, movement and Soul Integrity; progression; skills; combat actions; features; technique/spells; inventory/invocations; conditions/exhaustion; rests; and notes/vows.
- **Progressive disclosure:** show only fields relevant to the selected Origin/Specialization. Preserve free-form fields where the book relies on Narrator judgment. Never present vows as automatically balanced.
- **Acceptance:** a level-1 character can be created through all supported paths; incomplete drafts resume safely; derived fields are read-only unless the rule permits an override; every automated value exposes its source rule.
- **Tests:** Playwright creator paths for fixed array, roll, and point buy; Restringido path; keyboard-only flow; recovery from invalid draft; snapshot/golden summaries.
- **Dependencies:** MECH-05 through MECH-11, FE-01, FE-02, VA-08, VA-09.

## FE-07 — API client, local-first mutation queue, and conflict UI

- **Priority / status:** P1 / Missing.
- **Implementation:** keep the UI usable from IndexedDB while a typed-by-schema API client synchronizes authenticated records. Queue idempotent create/update/delete operations with `operationId`, `recordId`, `baseRevision`, and a patch or replacement payload. Display per-record states: local-only, queued, syncing, synced, conflict, and failed. Retry transient failures with bounded exponential backoff and user-triggered retry.
- **Conflict behavior:** HTTP 409 opens a comparison flow using system adapter summaries and changed-section metadata. Preserve both local and server snapshots; allow keep local, keep server, or duplicate as new. Never use silent last-write-wins.
- **Security:** rely on HttpOnly session cookies; do not store auth tokens in localStorage. Avoid sending dice history or transient UI state unless explicitly modeled.
- **Acceptance:** offline create/edit/reopen works; queued operations replay in order after sign-in/connectivity returns; conflicts cannot lose either version; signing out leaves an explicit choice about device data.
- **Tests:** fake-server integration tests for 401, 403, 409, 413, 422, 429, timeout, reconnect, duplicate replay, and expired session.
- **Dependencies:** BE-03, BE-04, BE-05; FE-02.

## FE-08 — Shared interaction services without shared rules

- **Priority / status:** P1 / Partial.
- **Implementation:** extract dice presentation/history, toast/status announcements, confirmation/dialog infrastructure, media selection, sound preference, and command palette/shortcut registration as platform services. System adapters submit semantic roll requests and formatted results; they retain dice formulas and outcome interpretation.
- **Keyboard:** define discoverable shortcuts only after editable-target guards and conflict analysis. At minimum support opening the dice panel and focusing global search; system-specific roll shortcuts remain adapter-owned.
- **Acceptance:** D&D and Yusong use the same accessible dialog/dice surface while preserving results; F&M can add rolls without importing either engine; all controls have text alternatives.
- **Tests:** service unit tests; focus-return and live-region integration tests; shortcut tests excluding inputs/contenteditable.
- **Dependencies:** VA-03, VA-04; MECH-12.

## FE-09 — Preferences and theme wiring

- **Priority / status:** P1 / Missing.
- **Implementation:** support light, dark, and system preferences; reduced motion; sound; density; dice animation; and last-used library view. Apply preferences before first paint to avoid theme flash. Store locally first, then sync non-sensitive values through BE-06.
- **System identity:** platform theme selects surface semantics; each system supplies constrained accent tokens. A system may not replace focus, error, text, or contrast tokens.
- **Acceptance:** preferences work offline, survive reload, follow OS changes in “system” mode, and merge predictably after sign-in.
- **Dependencies:** VA-01, BE-06.

## FE-10 — Compact Tabletop Mode

- **Priority / status:** P1 / Missing; Yusong presentation mode is prior art only.
- **Implementation:** add a distraction-reduced character route with prominent current/max resources, conditions, common rolls/actions, rest controls, notes, and expandable secondary detail. The adapter declares quick actions and resource cards. Persist only real character mutations, not panel layout or roll history unless the user opts in.
- **Scope guard:** no map, token movement, fog of war, chat, video, automation scripting, or campaign management.
- **Acceptance:** usable at 320 CSS px, 200% zoom, touch, keyboard, and screen reader; actions call the same tested engine commands as the full sheet; returning to the sheet reflects changes.
- **Dependencies:** FE-04/05/06 for each system, MECH-12, VA-10.

## FE-11 — Creatures and lightweight encounters

- **Priority / status:** P2 / Missing.
- **Implementation:** provide a system-filtered creature library and an encounter workspace for participants, initiative/order, current resources, conditions, round counter, and free-form notes. Use adapter capabilities for creature summary and action panels. Treat F&M Invocations as character-owned entities that may be adapted into participants, not as generic creatures in storage.
- **Scope guard:** no encounter builder challenge rating, tactical grid, real-time multiplayer, campaign journal, or automated AI turns in the first release.
- **Acceptance:** mixed-system participants are rejected with a clear explanation; encounters resume locally; combat state can reset without changing source creature templates.
- **Dependencies:** BE-07, MECH-13, VA-10.

## FE-12 — Frontend quality gates and observability

- **Priority / status:** P0 foundation, P1 ongoing / Partial.
- **Implementation:** keep rules tests in their native runners; add React Testing Library for component behavior, Playwright for critical browser flows, and axe integration for automated accessibility checks. Add error boundaries per route/system and privacy-safe client error reporting behind configuration. Establish bundle-size and route-load budgets from measured baselines.
- **Required CI:** clean install, lint, unit tests, component tests, production build, schema fixture migration, Playwright smoke paths, axe checks, and generated-artifact check.
- **Acceptance:** a failing migration, inaccessible critical flow, broken clean install, or rules regression blocks release. Error telemetry contains system/version/operation metadata but no sheet contents by default.
- **Dependencies:** FE-00 onward; VA-12; BE-10.

## Dependency Graph / Recommended Implementation Order

```text
FE-00
  ├─> MECH-01 ─> MECH-02/03/04
  └─> FE-01 ─> FE-02 ─> FE-03
                    ├─> FE-04 (D&D)
                    ├─> FE-05 (Yusong)
                    └─> FE-06 (F&M, after MECH-05..11)
BE-03/04/05 + FE-02 ─> FE-07
VA-01..04 ─> FE-08/09
FE-04/05/06 + MECH-12 + VA-10 ─> FE-10
BE-07 + MECH-13 + VA-10 ─> FE-11
All streams ─> FE-12 release gates
```

Recommended increments: (1) repository baseline, (2) engine/adapter contracts and local migrations, (3) D&D behind the shell, (4) Yusong decomposition behind the shell, (5) auth/API and conflict-safe sync, (6) F&M vertical slice, (7) Tabletop Mode, (8) creatures/encounters, then broader content and polish.

## Open Decisions

- **OD-01:** approve the public Yusong/Pilares de Atlas/Circuito de Soyang name and migration copy.
- **OD-02:** decide whether the platform has a new neutral brand or uses the existing D&D artwork only inside D&D. The existing black-background logo is not suitable as the compact platform mark.
- **OD-03:** confirm whether anonymous local use is a permanent mode or only an import/onboarding bridge before account creation.
- **OD-04:** define the supported browser/device floor and whether installable PWA behavior is required in the first release.
- **OD-05:** decide whether print/PDF and Yusong PNG-card export are release blockers for all systems or preserved only where already present.
- **OD-06:** approve conflict choices and device-data behavior on sign-out/shared computers.
- **OD-07:** confirm the first-release F&M content breadth after the engine vertical slice; data entry volume must not block the architecture.
- **OD-08:** select telemetry policy. Default recommendation: self-hosted/disabled-by-default, content-free operational events only.

## Regression Checklist

- [ ] All 107 audited D&D rules tests still pass.
- [ ] D&D v8 local records and JSON backups import without field loss or duplicate creation.
- [ ] D&D guided/blank creation, leveling, multiclass, spells, rests, inventory, conditions, dice, and print remain functional.
- [ ] Yusong formulas, body parts, schools, talents, Genius abilities, conditions, sound, random generation, presentation, and card export match frozen fixtures.
- [ ] Legacy localStorage data is never deleted automatically.
- [ ] Platform code does not read or write system-specific fields.
- [ ] Direct URLs, browser navigation, refresh, offline reopen, and sign-out behave predictably.
- [ ] Save and sync failures are visible and recoverable.
- [ ] Light/dark/system themes do not change system calculations or persisted records.
- [ ] No rulebook art or unlicensed visual asset is copied into F&M screens.
- [ ] Tabletop and encounter work remains within the explicitly lightweight scope.

## Validation Matrix

| Area | Automated validation | Manual validation | Release evidence |
|---|---|---|---|
| Install/build | Clean locked install; production build | Fresh-clone runbook | CI log and bundle report |
| Routing/adapters | Registry and route integration tests | Direct URL and back/forward | Route matrix |
| Migrations | Golden fixtures; idempotency; corrupt input | Import real local exports | Fixture manifest and migration report |
| D&D | Existing 107 tests plus browser smoke | Representative level 1/10/20 sheets | Test log and print sample |
| Yusong | Formula and migration unit tests | Compare captured legacy characters/cards | Golden fixture report |
| F&M | Creator/engine integration tests | Rule citation and Narrator-field review | Edition 2.5.2 traceability report |
| Offline/sync | Queue/replay/conflict simulations | Airplane-mode and two-tab exercise | Sync scenario log |
| Accessibility | axe component/E2E suite | Keyboard, screen reader, 200%/400% zoom | WCAG audit record |
| Visual/responsive | Screenshot baselines | 320 px through desktop, light/dark | Approved visual matrix |
| Privacy/security | Token/storage assertions | Shared-device sign-out review | Threat-model checklist |

## Final Acceptance Checklist

- [ ] A single shell lists and opens D&D, Yusong, and F&M characters through registered adapters.
- [ ] Each system has an isolated schema, migration chain, engine, and UI boundary.
- [ ] Existing local data imports safely, idempotently, and recoverably.
- [ ] D&D and Yusong behavior is preserved before new behavior is added.
- [ ] F&M creation and sheet values trace to edition 2.5.2 rules.
- [ ] Local-first editing, authenticated sync, and conflict recovery have no silent data-loss path.
- [ ] Light/dark themes, keyboard use, screen readers, touch, text zoom, and reduced motion meet the visual/accessibility plan.
- [ ] Tabletop Mode and encounters are compact utilities, not a full VTT.
- [ ] Clean install, lint, tests, build, migration, accessibility, and critical browser flows pass in CI.
- [ ] All open owner decisions that affect naming, identity, hosting, privacy, or scope are resolved and documented.

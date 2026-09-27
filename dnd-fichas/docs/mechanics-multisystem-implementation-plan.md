# Repository / Source Audit Summary

## Scope and evidence policy

This plan governs rule-engine isolation, schema evolution, legacy preservation, and the implementation of Feiticeiros & Maldições (F&M) edition 2.5.2. It does not authorize copying rulebook prose or artwork into the product.

Every requirement in this document is labeled by evidence type:

- **Verified repository fact:** observed directly in the audited D&D or Yusong repository and, where possible, executed in its test/build tooling.
- **Rulebook fact:** verified in `Feiticeiros & Maldições - Livro de Regras v2.5.2.pdf`, cited by printed page/section in the traceability inventory below.
- **Architectural recommendation:** a proposed implementation boundary, schema, or workflow; it is not presented as an existing fact.
- **Open owner decision:** a product/rules interpretation that must not be guessed by implementers.

## Existing-engine audit

### D&D 5e

- **Verified repository fact:** the engine already supports a level-20 cap, multiclass class levels, subclasses, proficiency selection, class hit-die pools, HP history, XP/milestone progression, ASI, spell swap, combined multiclass slots, Pact Magic, one-third casters, Mystic Arcanum, Magical Secrets, subclass spell rules, concentration, conditions, advantage/disadvantage, rests, resources, inventory, carrying capacity, currency, magic-item attunement/charges/effects, and a readiness validation gate.
- **Verified repository fact:** the content catalog contains 9 races, 12 classes, 13 backgrounds, 26 subclasses, 27 feats, 117 spells, and 6 named magic items.
- **Verified repository fact:** 107 tests pass. Audited regressions include 19→20 advancement, normalization of 20→21 and over-cap multiclass combinations, migration idempotency, carrying capacity at Strength × 15, spell-origin validation, and multiclass spell behavior.
- **Verified repository fact:** `versaoFicha: 8` is normalized by one current function. It is not a sequence of immutable `vN -> vN+1` migrations and has no system discriminator.
- **Status:** preserve the engine. Compact Tabletop Mode and broad magic-item/content expansion remain missing/partial; they must not trigger a rules rewrite.

Relevant previous-plan status after code verification: the level-20 boundary, readiness gate, class-specific spell handling, generalized spell swap, creation proficiency automation, carrying capacity correction, visible persistence failure, print view, and the targeted rules-test expansion are **Implemented — preserve**. Named magic-item/effect coverage, broader automated ability effects, advanced resource/catalog coverage, and content expansion are **Partial**. Compact Tabletop Mode and global roll shortcuts are **Missing**. Replacing browser print with a separate PDF engine is **Superseded** unless a later requirement demonstrates a browser-print failure.

### Yusong

- **Verified repository fact:** implemented calculations include `life = health*8 + level*4`, `stamina = (constitution+health)*25 + 100`, movement `max(1, 4+agility-size)`, run `movement*2+4`, an RD lookup by Size, reaction dice from averaged attributes, vital armor from Constitution/Health, limb dice/armor from Strength/Agility, and talent Stamina cost `ceil(percent/100 * maxStamina)`.
- **Verified repository fact:** the record includes nine attributes, seven body parts, Dodge/Counterattack reactions, schools, class/type/origin/martial art, talents, Genius abilities, skills, inventory, conditions, and notes. Six schools, eight martial arts, nine conditions, eleven system items, sixteen skills, and only one Origin are present in the data catalog.
- **Verified repository fact:** there are no rules tests. Derived values are written through React effects in a monolithic component; `conditions` defaults to an array despite object-map usage; normalization has no schema version.
- **Verified repository fact:** the source contains conflicting identity labels (“Yusong”, “Pilares de Atlas”, and “Circuito de Soyang”).
- **Status:** treat existing behavior as a compatibility baseline, not as proof of an external rulebook. Freeze it with golden tests before correcting or extending formulas. Changes to rule meaning require an owner-supplied authoritative Yusong source.

### F&M

- **Rulebook fact:** edition 2.5.2 is a 368-page A4 book. Its mechanics differ materially from D&D and Yusong. F&M begins with no repository implementation, schema, migrations, or tests.
- **Rulebook fact:** the PDF includes illustrations and designed page layouts. Those assets are not licensed for extraction merely because the source was supplied for rules analysis. Use original product artwork only after an explicit rights decision.

## Rule isolation contract

**Architectural recommendation:** implement a `SystemEngine` contract that contains no React, storage, HTTP, or database code:

```js
{
  systemId,
  currentSchemaVersion,
  createCharacter,
  migrateCharacter,
  validateCharacter,
  deriveCharacter,
  listValidationIssues,
  commands,
  diceRequests,
  summarize,
  createCreature?,
  createEncounterParticipant?
}
```

Rules commands accept an immutable current record and explicit input and return `{ character, events, warnings }` or typed validation errors. Derivations are pure and are not persisted unless the value is a rule-authorized choice or override. Randomness and clocks are injected. No engine imports another system.

Priorities are **P0** blockers, **P1** core, **P2** expansion, and **P3** optional. Status is **Preserve**, **Partial**, or **Missing**.

## F&M 2.5.2 rule traceability inventory

The implementation must store these as structured trace records: `ruleId`, edition `2.5.2`, printed page, section, automation class, implementation symbol, and test IDs. “Assisted” means the software calculates or validates deterministic portions but preserves a Narrator/user decision.

| Rule ID | Printed page/section | Verified rulebook fact | Automation |
|---|---|---|---|
| FM-ATTR-01 | 17, Attributes | Strength, Dexterity, Constitution, Intelligence, Wisdom, Presence; normal natural cap 20, exceptional cap 30 | Deterministic validation |
| FM-CREATE-01 | 18, Attribute values | Fixed array 15/14/13/12/10/8; 4d6 drop lowest; point buy starts 10 with 17 points, range 8–15 and published cost table | Deterministic with injected dice |
| FM-MOD-01 | 19, Modifiers | +1 per two points above 10 and −1 per two below; equivalent to floor((score−10)/2) | Deterministic |
| FM-DERIVED-01 | 19–20 | Attention = 10 + Perception skill bonus + other; Defense = 10 + Dex modifier + half level + other; movement normally 9 m; initiative uses Dex modifier + other | Deterministic, overrides additive |
| FM-SOUL-01 | 20; 311–312 | Soul Integrity begins at maximum HP; thresholds at 100/75/50/25% apply states/penalties; zero means death | Deterministic state plus manual damage trigger |
| FM-HP-01 | 20; 44–46 | First-level HP and later HP/hit die depend on Specialization; Constitution changes recalculate retroactively | Deterministic, level event records roll/fixed choice |
| FM-PE-01 | 21; 44–46 | Initial PE varies by Specialization; some add key-attribute modifier once and retroactively; Restrained uses Stamina and no PE | Deterministic by path |
| FM-ASPECT-01 | 22 | Personality Traits, Ideals, Connections, Complications, Innate Domain are narrative and only optionally mechanical | Manual/free text |
| FM-ORIGIN-01 | 27–39 | Origins include Innate, Inherited, Derived, Restrained, Hybrid Cursed Fetus, Without Technique, Mutant Cursed Body; Mutant Body has nuclei and cannot multiclass | Structured choices plus rule validations |
| FM-SPEC-01 | 43–128 | Six Specializations define HP, training, PE/Stamina, key attributes, multiclass requirements, and abilities | Data-driven, deterministic prerequisites |
| FM-LEVEL-01 | 45–48 | Levels 1–20; Training Bonus +2 and rises at 5/9/13/17 to +6; level-up choices, aptitude, attribute increases, mastery, and hit dice | Deterministic command plus user choices |
| FM-MULTI-01 | 47 | Multiclass prerequisites; later-spec first level uses later-level HP, grants PE but no new training; Restrained and Mutant paths constrain/forbid multiclass; effect level differs from prerequisite level | Deterministic validation/derivation |
| FM-XP-01 | 48 | Thresholds: 0, 1000, 3000, 6000, 10000, 15000, 21000, 28000, 36000, 45000, 55000, 66000, 78000, 91000, 105000, 120000, 136000, 153000, 171000, 190000 | Deterministic lookup |
| FM-TALENT-01 | 163–171 | General and Origin talents have prerequisites/effects | Data-driven; manual fallback for narrative effects |
| FM-APT-01 | 172–195 | Cursed Aptitudes include Aura, Control/Reading, Domain, Barrier, Reverse Energy, and Special categories with requirements | Data-driven prerequisites; mixed effects |
| FM-TECH-01 | 196–246 | Technique construction, basic function, received/assembled spells, spell categories, passive effects and Domain guidance; technique users begin with two spells | Structured builder plus free text |
| FM-STYLE-01 | 247–255 | Martial Style construction and New Shadow Style | Structured/manual hybrid |
| FM-INV-01 | 256–275 | Invocation control, statistics, build, and creation guidance | Assisted builder; owned entity |
| FM-TEST-01 | 276–284 | Tests are d20 + modifiers vs DC; skills, saves, and attacks; skill bonus uses key modifier + half level + Training if trained + other; extra trained/mastered skills at creation from Int or Wis modifier | Deterministic; rounding per appendix |
| FM-ATTACK-01 | 279; 305 | Melee/ranged/cursed attack formulas; hit at least Defense; unarmed die progresses d4/d6/d8/d10/d12 at 1/5/9/13/17 | Deterministic roll request |
| FM-COMBAT-01 | 291–325 | Six action types: common, bonus, reaction, movement, free, full; hierarchy common > bonus > movement; full consumes common+bonus | Deterministic tracker with manual adjudication |
| FM-DEATH-01 | 313 | Death-gate d20 outcomes; three successes stabilize, three failures die; failures persist to long rest; damage adds failure; stabilization DC formula; massive damage can kill instantly | Deterministic tracker with explicit damage events |
| FM-COND-01 | 317–324 | Conditions, concentration, and six exhaustion levels | Data-driven states; manual source/duration |
| FM-REST-01 | 335 | Short rest 2–4 h, hit-die spending and half PE; long rest about 8 h restores HP/hit dice/PE and abilities; optional halved recovery for crafting | Deterministic command plus user choices |
| FM-INTERLUDE-01 | 336 onward | Interlude chooses two focuses, including adaptation and creation activities | Assisted checklist/manual result |
| FM-VOW-01 | 351–358 | Temporary/permanent vows, emergency/contractual vows, weights, congenital restriction; balance depends on Narrator | Manual-first; never auto-balance |
| FM-MATH-01 | 365–366 | Round division down; multiplication/division precede addition/subtraction; same-source effects do not stack; temporary HP/PE keep the greater and are normally capped at half maximum | Deterministic utility and stacking policy |

## MECH-00 — Freeze executable baselines and traceability

- **Priority / status:** P0 / Partial.
- **Implementation:** preserve the passing D&D suite as a release gate. Create serialized golden fixtures representing low/high-level, multiclass, spellcasting, magic-item, condition, and migrated v8 characters. For Yusong, capture representative current records and outputs before refactoring, then add formula and dice-parser tests. Create the F&M traceability registry from the table above before implementing formulas.
- **Rulebook handling:** trace short identifiers/page references, not copied prose. Any ambiguous interpretation becomes an open decision with a failing/pending test, not hidden developer judgment.
- **Acceptance:** every deterministic engine rule has at least one test ID and source link; every preserved behavior has a fixture; test randomness is seeded/injected.
- **Dependencies:** FE-00 cleanup only. Blocks rule refactors.

## MECH-01 — System engine contract and package boundaries

- **Priority / status:** P0 / Missing.
- **Implementation:** create independent `dnd5e`, `yusong`, and `feiticeiros-maldicoes` engine packages/modules implementing the contract above. Put generic utilities only in a rules-neutral package: dice notation parsing/evaluation, seeded RNG interface, immutable command result, validation issue shape, identifiers, and rounding helpers. System-specific dice interpretation and modifiers remain local.
- **Validation levels:** distinguish structural invalidity, rules error that blocks a command, readiness warning, and informational recommendation. The platform may display these but not reinterpret them.
- **Events:** commands emit semantic events such as `resource.changed`, `level.advanced`, `condition.added`; they are for UI/audit descriptions, not event-sourced persistence.
- **Acceptance:** dependency tests prevent cross-system imports and React/storage imports; the same generic character envelope can call any engine solely through the contract.
- **Dependencies:** MECH-00. Enables FE-01/02 and BE-02/03.

## MECH-02 — D&D adapter without rules rewrite

- **Priority / status:** P0 / Preserve/Partial.
- **Implementation:** wrap existing normalization, selectors, validations, and mutations behind the engine contract in small commits. Preserve the existing catalog and all tested behavior. Replace direct random/time calls only where required for deterministic commands. Add an ordered adapter migration that accepts legacy `versaoFicha <= 8`, invokes the existing normalizer once, outputs platform schema v1/system schema v8 or a deliberately renumbered version, and records provenance.
- **Do not change:** level cap, multiclass spell-slot behavior, pact slots, spell origins, carrying capacity, resource rests, magic-item effects, or readiness semantics unless a separate rules correction is approved with source evidence.
- **Known follow-up:** generalized magic effects/content catalog remain partial; expand data only after the adapter is stable. Keep rules data separate from renderer strings.
- **Acceptance:** 107 current tests and new adapter/migration fixtures pass; repeated migration is idempotent; the engine has no browser persistence dependency.
- **Dependencies:** MECH-01. Coordinates with FE-04 and FE-02.

## MECH-03 — Yusong behavior freeze and engine extraction

- **Priority / status:** P0 for preservation, P1 for cleanup / Partial.
- **Implementation sequence:**

1. Add characterization tests for all audited formulas, RD/reaction/body lookup tables, dice expressions, condition modifiers, talent cost, and random-generator invariants.
2. Define schema v1 with explicit objects for identity, attributes, resources, reactions, body, talents, Genius, inventory, skills, conditions, notes, and selected school/origin/class/art.
3. Migrate legacy records; convert array-like `conditions` to an object map; retain unknown custom fields in a documented `legacyExtensions` bag rather than discard them.
4. Move calculations from React effects into pure selectors; persist choices/current resources, not recomputable maximums, unless a legacy compatibility field is needed during transition.
5. Reconnect the UI and compare golden outputs.

- **Authority limit:** the current repository is the compatibility authority only. Do not invent missing Origins, change formulas, or reinterpret Portuguese terminology without an owner-provided source.
- **Acceptance:** all frozen formulas match, migration is idempotent, current resources are clamped only under explicitly tested rules, and derived values cannot form effect loops.
- **Dependencies:** MECH-00/01; OD-01 naming/rules source for expansions. Coordinates with FE-05.

## MECH-04 — Cross-system schema migration policy

- **Priority / status:** P0 / Missing.
- **Implementation:** version the platform envelope independently from `data`. Each engine owns an immutable ordered migration list. A migration is pure, accepts exactly one prior version, validates output, and never fetches network data. Preserve original export, pre-migration snapshot, source key/version, migration IDs, and warnings until the user confirms success.
- **Forward compatibility:** a client encountering a newer system schema opens read-only summary/export mode. It must not normalize down or save.
- **IDs/time:** retain valid legacy IDs; resolve collisions only at import with provenance. Preserve creation timestamps; generate missing `updatedAt` from import time with a warning. Never infer server revision from legacy timestamps.
- **Acceptance:** empty/current/old/corrupt/future/partially migrated fixtures have defined results; running current migrations twice produces the same data; failure never overwrites the input.
- **Dependencies:** MECH-01/02/03/05; consumed by FE-02, BE-02/04.

## MECH-05 — F&M schema, defaults, and rule registry

- **Priority / status:** P0 / Missing.
- **Schema groups:** identity and narrative aspects; level/XP and per-specialization levels; six attributes and permanent/temporary modifiers; Origin and path-specific data; Specializations; training/skills/masteries; HP/PE/Stamina/Soul Integrity/hit dice; Defense/Attention/movement/initiative; Talents; Cursed Aptitudes; technique/spells/Domain; martial style; inventory/equipment; invocations; conditions/concentration/exhaustion/death gates; rests/interludes/vows; user overrides with reasons.
- **Identity/aspects:** require a character display name at the product boundary. Keep concept, Personality Traits, Ideals, Ligações, Complications, and Innate Domain as optional free-form fields unless a chosen rule explicitly references one. Never parse prose to infer a bonus; represent any approved mechanical consequence as a separate, source-labeled modifier.
- **Design rules:** store selections and history needed to reproduce results. Derived totals expose a breakdown of labeled contributions and rule IDs. Use stable content IDs independent of translated labels. Custom/homebrew entries use a namespace and never masquerade as official catalog entries.
- **Override policy:** allow explicit, labeled override/additive modifiers for Narrator rulings. Store reason/source; derived breakdown shows them. Do not provide an unrestricted “final value” field that hides calculations.
- **Acceptance:** JSON Schema/runtime validation, default factory, summary, and round-trip serialization work before UI; rule registry rejects missing/duplicate IDs.
- **Dependencies:** MECH-01/04 and F&M traceability inventory.

## MECH-06 — F&M attributes, derived statistics, advancement, and multiclass

- **Priority / status:** P1 / Missing.
- **Attributes:** implement fixed array, seeded 4d6-drop-lowest, and exact point-buy ledger (17 points; range 8–15; costs/credits for 8–15). Validate standard/exceptional caps. Implement modifier with floor semantics, including scores below 10.
- **Derived values:** calculate Attention, Defense, movement, initiative, maximum HP, PE or Stamina, Soul Integrity, hit-die pools, Training Bonus, skill bonuses, saves, weapon/unarmed/technique/spell attacks, applicable specialization or technique DCs, and unarmed die as traced. Every result returns a component breakdown; a formula not established by the book remains an unresolved rule reference rather than a guessed D&D-style DC.
- **Advancement:** encode levels 1–20 and exact XP thresholds. Model each level event: chosen Specialization, HP roll/fixed value, ability/talent selection, aptitude, attribute increases, mastery, and hit die. Retroactively recalculate Constitution/key-attribute-dependent maxima while preserving current-resource policy.
- **Multiclass:** validate entry requirements, later-class first-level benefits, no extra training, specialization-level prerequisites, effective level for effects, and path prohibitions. Do not reuse D&D multiclass logic.
- **Acceptance:** boundary tests at all Training Bonus and unarmed-die levels; every XP threshold; positive/negative modifiers; all specialization HP/PE branches; legal/illegal multiclass matrices; retroactive changes.
- **Dependencies:** MECH-05, MECH-07 content metadata. Open decision OD-04 covers current-resource adjustment on maximum changes where text is not explicit.

## MECH-07 — F&M Origins and Specializations

- **Priority / status:** P1 / Missing.
- **Implementation:** encode the seven audited Origin categories and six Specializations with stable IDs. For every Origin, transcribe and review prerequisites, attribute changes, features, Origin Talents, training, energy/technique implications, level scaling, choices, and restrictions. For every Specialization, encode starting and subsequent HP, hit die, PE/Stamina behavior, training, key attributes, multiclass requirements, base abilities, specialization abilities, choice levels, and prerequisites. Model Origin path unions so only relevant structures exist—for example Mutant Cursed Body nuclei and Restrained attributes/resources.
- **Content workflow:** data entries require reviewer, rule ID/page, prerequisite expression, effect classification (`automated`, `assisted`, `display-only`), and tests. Unimplemented effects remain visible as manual instructions; never silently omit them from readiness.
- **Acceptance:** every Origin/Specialization can create a valid level-1 skeleton; incompatible paths and multiclass choices are rejected; labels/content are edition-stamped.
- **Dependencies:** MECH-05. Required by MECH-06 and FE-06.

## MECH-08 — F&M Talents and Cursed Aptitudes

- **Priority / status:** P1 framework, P2 catalog completion / Missing.
- **Implementation:** use data-driven entries with category, prerequisites, repeatability, selection parameters, granted modifiers/resources/actions, activation/cost, duration, and manual text reference. Build a prerequisite expression vocabulary for level, attribute, Origin, Specialization, technique, prior entry, and mutual exclusion.
- **Aptitude categories:** Aura, Control/Reading, Domain, Barrier, Reverse Energy, and Special. Track acquisitions by level and distinguish owned capability from currently active effect.
- **Safety:** effects unsupported by the command vocabulary are `display-only` with an explicit manual-resolution badge. Do not embed executable expressions or arbitrary code in content data.
- **Acceptance:** prerequisite tests cover exact threshold, missing dependency, repeatable entry, replacement/removal, and migrated content ID; the UI can explain every failed prerequisite.
- **Dependencies:** MECH-05/06/07. Content breadth decision OD-05.

## MECH-09 — F&M techniques, spells, Domain, and martial styles

- **Priority / status:** P1 minimum vertical slice, P2 full builder / Missing.
- **Implementation:** create structured builders that store technique identity/basic function, spell origin (received/assembled/custom), level/category, costs, target/range/area, duration/concentration, damage/healing/effects, advancement, and free-form exceptions. Technique users start with two spells where the selected path requires it. Domain and martial-style builders share safe primitives but have separate schemas and validators.
- **Dice/effects:** reuse only the generic parser/RNG. F&M owns formula construction, Cursed Energy costs, attack/save resolution, and stacking. Unsupported effects become descriptive/manual; do not build a general scripting language.
- **Acceptance:** one representative damage, auxiliary, healing, special, passive, Domain, and martial-style entry round-trips and produces correct roll/validation requests; custom entries remain edition/source-labeled.
- **Dependencies:** MECH-05/06/07/08, MECH-12.

## MECH-10 — F&M equipment, invocations, and owned entities

- **Priority / status:** P2 / Missing.
- **Equipment:** complete a catalog audit before automation and model inventory, carrying, starting equipment grants/choices, weapons, uniforms, shields, tool kits, special items, cursed items/tools, and weapon/shield/uniform enchantments. Each entry records quantity, carried/equipped state, hands/slot where the book defines it, uses/charges, cost/availability, damage/defense, typed modifiers, prerequisites, and display-only effects. Implement only rules established by the audited equipment chapters; do not import D&D carrying, proficiency, slot, or attunement concepts.
- **Invocations:** store an Invocation as an entity owned by a character with its F&M construction/statistics, control relationship, current resources, and notes. Provide a pure projection to an encounter participant. Independent generic creatures remain a separate adapter capability.
- **Acceptance:** deleting/duplicating a character handles invocation ownership explicitly; participant snapshots do not mutate the source Invocation; no D&D item field is required.
- **Dependencies:** MECH-05/09/13.

## MECH-11 — F&M tests, skills, combat state, conditions, rests, and narrative mechanics

- **Priority / status:** P1 core trackers, P2 interludes/vows / Missing.
- **Tests/skills:** implement d20 request construction for attribute tests, skills, saves, and attacks; trained/mastered contributions; advantage/disadvantage when explicitly granted by F&M; opposed interactions when the audited rule defines them; extra creation training/mastery from Intelligence or Wisdom; and rulebook DC suggestions as reference, never automatic Narrator outcomes.
- **Action economy:** track common, bonus, reaction, movement, free, and full actions with the published hierarchy. Reset by turn/round through explicit commands. Do not reuse D&D action economy.
- **Combat state:** inventory and model initiative/turn order, movement, reach, targets, areas, attacks, damage/healing, damage types/resistances or equivalent terms, positioning annotations, HP, PE/Stamina, temporary resources, concentration, conditions, exhaustion, Soul Integrity thresholds, death-gate successes/failures, damage-while-dying, stabilization DC, and explicit massive-damage checks. Automate only deterministic values found in the combat chapter. Position/range remains numeric/manual—this plan does not add a grid. Commands must log enough semantic events for undo confirmation but persistence is snapshot-based.
- **Rests:** short/long rest commands preview changes before application, include hit-die choices and the crafting half-recovery option, and respect ability reset classifications.
- **Interludes/vows:** store chosen focuses and outcome notes. Model `Votos de Restrição` (Binding Vows) with name, category/type, description, conditions, duration/permanence, benefit, penalty, affected Technique/Spell/Aptitude/resource references, activation state, parties for contractual vows, weight where the book uses it, and Narrator approval. Offer templates/checklists only. Never algorithmically declare a vow “balanced”.
- **Acceptance:** boundary/state-transition tests cover every death die band, third success/failure, Soul threshold, exhaustion level, temporary-resource stacking, action conversion, concentration end, rest option, and non-stacking source.
- **Dependencies:** MECH-05/06/07/08/09. Interpretation decisions OD-02/03/04.

## MECH-12 — Cross-system dice and Tabletop action contract

- **Priority / status:** P1 / Partial.
- **Shared contract:** `{ notation, label, systemId, characterId, modifiers[], advantageMode?, metadata }` in; raw individual dice and total out. Engines create requests and interpret results. The platform handles animation, sound, history, accessibility, and injected cryptographic or seeded randomness according to context.
- **D&D:** preserve advantage/disadvantage and current roll semantics.
- **Yusong:** preserve compound expressions such as `2d8`, `1d6+1d4`, `1d20+8`, and signed constants.
- **F&M:** provide d20 tests and all rule-owned dice expressions without assuming D&D critical/advantage rules.
- **Tabletop actions:** adapter exposes semantic actions backed by the same engine commands as the full sheet; no duplicate formulas in UI.
- **Acceptance:** parser property/boundary tests, deterministic RNG tests, accessible textual results, and system-specific interpretation tests pass.
- **Dependencies:** MECH-01/02/03/06/11; consumed by FE-08/10.

## MECH-13 — Creature and encounter mechanics boundary

- **Priority / status:** P2 / Missing.
- **Implementation:** define system capability contracts for creature validation/summary, initiative request, resource projection, condition catalog, and participant snapshot. Encounters store order/round/current state but do not adjudicate maps, range geometry, AI, challenge balance, or complete combat legality.
- **Isolation:** an encounter has exactly one system. D&D may add a simplified monster/NPC adapter shaped by verified D&D data needs, not the player-character schema. Yusong begins with identity/notes and only mechanics supported by current repository evidence; do not invent opponent rules without an authoritative source. F&M requires a targeted audit of cursed spirits, summons, and other independent entities before its creature schema is frozen, while character-owned Invocations project into participants. No universal stat block exists beyond platform identity/summary fields.
- **Acceptance:** mixed-system rejection, snapshot independence, initiative/action/resource tests, and reset semantics are defined for each enabled adapter.
- **Dependencies:** MECH-01 and system engine readiness; BE-07/FE-11.

## MECH-14 — F&M MVP content and verification gates

- **Priority / status:** P1 / Missing.
- **MVP recommendation:** complete all core calculation/state infrastructure and enough reviewed content to create and advance at least one valid character through every Origin and Specialization path. Catalog completeness is tracked separately by section and may follow as P2 batches.
- **Content QA:** two-person review for transcription and rule interpretation; automated uniqueness/reference checks; edition checksum/date; coverage dashboard by page/category; no content entry accepted without source metadata and automation classification.
- **Release gate:** an independent rules reviewer traces representative level 1, multiclass, level 10, level 20, technique, Restrained, Mutant Body, death/rest, and vow examples from input through derivation breakdown and tests.
- **Acceptance:** no silent placeholders in character readiness; incomplete catalog areas are labeled; all P1 rule IDs have implementations/tests or a documented manual-only decision.
- **Dependencies:** MECH-05 through MECH-13.

## Dependency Graph / Recommended Implementation Order

```text
MECH-00 ─> MECH-01
             ├─> MECH-02 (D&D adapter) ─> FE-04
             ├─> MECH-03 (Yusong engine) ─> FE-05
             └─> MECH-04 (migration policy) ─> FE-02 / BE-02
MECH-01/04 ─> MECH-05 (F&M schema/traceability)
MECH-05 ─> MECH-07 ─> MECH-06
MECH-06/07 ─> MECH-08 ─> MECH-09 ─> MECH-10
MECH-06/08/09 ─> MECH-11
MECH-01 + system engines ─> MECH-12 ─> FE-08/10
MECH-10/11/12 ─> MECH-13 ─> BE-07/FE-11
MECH-05..13 ─> MECH-14 ─> F&M release
```

Recommended implementation sequence: freeze D&D/Yusong, establish isolation/migrations, move D&D unchanged, extract Yusong, create F&M traceability/schema, implement F&M deterministic core, add data-driven content/builder layers, add combat/rest/narrative state, then verify representative end-to-end characters before bulk content entry.

## Open Decisions

- **OD-01:** provide/approve the authoritative Yusong rules source and canonical public name; until then, current executable behavior is compatibility-only.
- **OD-02:** confirm rounding for the Master training increase wherever the text/table does not explicitly override the appendix’s round-down rule.
- **OD-03:** approve exact Soul Integrity penalty application order and whether threshold changes are immediate on maximum-HP recalculation.
- **OD-04:** define current-resource behavior when retroactive Constitution/key-attribute changes alter HP/PE maxima: preserve absolute current, preserve deficit, or adjust by delta. Recommendation: encode the book’s explicit cases and require an owner ruling for the remainder.
- **OD-05:** select first-release F&M catalog breadth by Origin, Specialization abilities, Talents, Aptitudes, spells, styles, and Invocations.
- **OD-06:** decide whether custom/homebrew F&M content may be shared/exported, and how it is visually distinguished from edition 2.5.2 content.
- **OD-07:** identify any errata or later official clarifications that supersede edition 2.5.2; they require a new ruleset/version, not silent edits.
- **OD-08:** decide whether undo is required for tabletop state commands. Recommendation: explicit preview/confirmation for destructive rest/reset actions before building general undo.
- **OD-09:** approve which D&D/Yusong catalog expansions belong to this release; they should not block multisystem foundations.

## Regression Checklist

- [ ] The existing 107 D&D tests pass unchanged before and after adapter extraction.
- [ ] D&D level cap, multiclass, spell slots/Pact Magic, spell origins, rests, resources, inventory, conditions, and item effects retain behavior.
- [ ] Yusong golden outputs cover every audited formula and lookup table before refactor.
- [ ] Yusong conditions migrate from array-like legacy values to an object map without losing active states.
- [ ] No engine imports React, storage, HTTP, database, or another system engine.
- [ ] Every migration is ordered, pure, idempotent at current version, and failure-preserving.
- [ ] F&M never reuses D&D attributes, action economy, multiclass, spell, inventory, or rest assumptions.
- [ ] F&M derived totals show contribution breakdowns and rule IDs.
- [ ] Narrative/Narrator mechanics remain manual or assisted and are never silently automated.
- [ ] Random tests use injected RNG; tests never rely on uncontrolled randomness.
- [ ] Rulebook artwork/prose is not copied into data catalogs or UI.
- [ ] Encounter mechanics remain system-specific and lightweight.

## Validation Matrix

| Domain | Unit/property tests | Golden/integration tests | Human review |
|---|---|---|---|
| Engine isolation | Dependency rules, contract tests | Load all adapters together | Architecture boundary review |
| Migrations | Each version edge, idempotency, corrupt/future input | Real D&D/Yusong exports | Data-loss audit |
| D&D | Existing 107 suite | Adapter commands and UI smoke | Representative sheet comparison |
| Yusong | Every formula/table/dice expression | Legacy record round trips | Authoritative-source comparison when supplied |
| F&M creation | Point-buy properties, dice injection, caps | Each Origin/Specialization path | Pages 17–48 trace review |
| F&M progression | All thresholds and multiclass matrices | Level 1/10/20 records | Specialization reviewer sign-off |
| F&M content | ID/reference/prerequisite checks | Representative automated/manual entries | Two-person transcription review |
| F&M combat | State transitions and boundary values | Multi-round/rest/death scenarios | Pages 276–335 trace review |
| Narrative mechanics | Schema/required approval fields | Interlude/vow save/export | Narrator workflow review |
| Dice/Tabletop | Parser properties, deterministic RNG | Same command in sheet/tabletop | Accessible result review |
| Creatures | System validation/snapshot tests | Invocation participant scenario | Scope/non-VTT review |

## Final Acceptance Checklist

- [ ] D&D, Yusong, and F&M implement one narrow platform contract through isolated engines.
- [ ] Existing D&D behavior and data are preserved by executable regression evidence.
- [ ] Existing Yusong behavior is frozen, tested, and extracted before any rules change.
- [ ] Platform and system schema versions migrate independently and recoverably.
- [ ] The F&M rule registry identifies edition, page, automation class, code, and tests.
- [ ] F&M supports the audited core creation, progression, test, combat, rest, and narrative domains.
- [ ] All derived F&M values expose source-aware calculation breakdowns.
- [ ] Ambiguous or Narrator-governed rules remain explicit open/manual decisions.
- [ ] Data-driven content cannot execute arbitrary code and cannot hide unsupported effects.
- [ ] Dice and tabletop actions reuse engine commands rather than duplicating formulas.
- [ ] Creature/encounter adapters do not become a universal stat block or full VTT engine.
- [ ] F&M content has edition control, transcription review, and representative rules-review approval.

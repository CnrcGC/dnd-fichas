# Repository / Source Audit Summary

## Scope and evidence

This plan defines the shared visual system, system-specific identities, responsive behavior, and WCAG 2.2 AA delivery criteria for the multisystem character platform.

- **Verified repository fact — D&D:** the current interface uses a dark grimoire aesthetic, responsive rules across several stylesheets, custom form/control styling, modal dialogs, status/live regions, and print CSS. The audited worktree also contains uncommitted semantic tokens, shared button/form/surface/state styles, reduced-motion rules, and focus-visible work. Treat this as partial user work to preserve and review, not as a completed baseline.
- **Verified repository fact — D&D gaps:** no light theme, skip link, automated accessibility tests, visual-regression tests, or documented focus-management layer was found. Tabs lack `tablist`/`tab` semantics; dialogs do not demonstrate a focus trap, focus restoration, or consistent Escape behavior. Some controls remove outlines, and recurring controls still use emoji as icons.
- **Verified repository fact — D&D branding:** `logo-dd-fichas.png` is a 1536×1024 full-canvas image with a black rectangular background and large compositional padding. The same detailed lockup is used in the home hero and compressed top bar. It is unsuitable as a small, neutral platform mark without a dedicated crop/redesign and rights confirmation.
- **Verified repository fact — Yusong:** it has six distinctive school themes, body visualization, cards, custom modals, a presentation mode, responsive breakpoints, and some ARIA/live-state work. It also has many `outline: none` declarations, no global focus-visible/reduced-motion strategy, incomplete dialog semantics, emoji icons, and no accessibility/visual test suite.
- **Verified repository fact — language:** both HTML entry points declare `lang="en"` while the primary UI is Portuguese.
- **Rulebook fact — F&M:** edition 2.5.2 has its own highly illustrated manga/grimoire visual language. The supplied PDF is a rules source, not an asset license. No rulebook artwork, textures, logos, page furniture, or character illustrations may be extracted for the app without documented rights.
- **Architectural recommendation:** use shared semantic tokens and accessible primitives for behavior, then system-scoped accent/ornament tokens for identity. Build light, dark, and OS-following modes. Do not flatten the systems into one reskinned generic sheet.
- **Open owner decision:** platform brand, logo rights, F&M artwork rights, and the canonical Yusong product name must be settled before production branding.

Relevant previous visual-plan status after repository verification: semantic tokens, shared buttons/forms/surfaces/states, focus-visible work, reduced-motion rules, and responsive D&D sections are **Partial** because material pieces exist only in the current uncommitted worktree or are not applied consistently. The dark grimoire identity and browser print styling are **Implemented — preserve**. Light theme was **Deferred** and that deferral is now **Superseded** by the product brief. A complete accessible dialog/tab layer, shared icon system, compact neutral header brand, automated accessibility checks, and visual regression suite are **Missing**.

## Accessibility target and test standard

Target **WCAG 2.2 AA** for all core routes and states. Automated checks are necessary but not sufficient. Release evidence must include keyboard-only, screen-reader, reflow, zoom, contrast, touch-target, reduced-motion, and cognitive/error-recovery reviews.

Core viewport/interaction matrix:

| Mode | Required checks |
|---|---|
| Small mobile | 320 CSS px wide; portrait; touch; no horizontal page scroll |
| Large mobile/tablet | 390–768 px; portrait/landscape; on-screen keyboard |
| Desktop | 1280 and 1440 px; keyboard/mouse; dense sheet navigation |
| Reflow | 400% zoom at 1280 CSS px equivalent; controls remain available |
| Text spacing | WCAG text-spacing override; no clipping/loss |
| Themes | light, dark, and OS/system; normal/high-contrast media where feasible |
| Motion | default and `prefers-reduced-motion: reduce` |
| Assistive technology | NVDA + Firefox/Chrome on Windows; one mobile screen reader before release |

Priorities are **P0** blockers, **P1** core, **P2** follow-up, **P3** optional. Status reflects audited implementation.

## Visual system principles

1. **Shared semantics, distinct expression:** spacing, focus, error, disabled, typography scale, dialog behavior, and form anatomy are shared. Color accents, display face, texture, illustration, ornament, and data visualization are system-owned.
2. **Text before decoration:** rules state and actions must remain understandable with images, color, animation, and sound disabled.
3. **Dense but legible:** character sheets may be information-dense; use hierarchy, progressive disclosure, sticky local navigation, and compact modes instead of shrinking type/touch targets.
4. **No color-only meaning:** resources, conditions, schools, validation, sync, and damage states use text/icon/shape in addition to color.
5. **Accessible defaults:** visible focus, labels, status text, reduced motion, sufficient target size, and semantic HTML are component defaults, not caller options.

## VA-00 — Baseline inventory, tooling, and preservation

- **Priority / status:** P0 / Partial.
- **Implementation:** snapshot all primary D&D and Yusong screens at the viewport/theme matrix before restructuring. Inventory component states, colors, typography, focus behavior, dialog/tab patterns, icons, images, breakpoints, and print/card outputs. Record computed contrast and keyboard path defects. Preserve the uncommitted D&D token/component CSS in a separate reviewed change; reconcile duplicate selectors rather than overwriting it.
- **Tooling:** add Storybook only if the team will maintain isolated primitives; otherwise use a dedicated component-fixture route excluded from production navigation. Add Playwright screenshots, `@axe-core/playwright` or equivalent axe integration, and a documented manual audit template. Automated scans cannot waive manual failures.
- **Acceptance:** every existing route/state has an owner and before screenshot; high-risk controls have state inventories; the worktree CSS is accounted for line by line; no visual change is bundled into repository cleanup.
- **Dependencies:** FE-00. Blocks VA-01/02 and visual migrations.

## VA-01 — Semantic tokens, theme architecture, and typography

- **Priority / status:** P0 / Partial.
- **Implementation:** consolidate audited worktree tokens into semantic groups: background/canvas/surface/elevated, text primary/secondary/muted/inverse, border/divider, action/accent/link, focus, success/warning/error/info, disabled, overlay, shadow, spacing, radius, typography, motion, z-index, and control size. Components consume semantic names only; raw palette tokens remain private to themes.
- **Themes:** implement `light`, `dark`, and `system`. Apply the choice before React paint. System accent tokens are nested under `[data-system]` and may change accent/ornament only. Validate every foreground/background pair in every interactive state.
- **Typography:** use a highly readable UI/text family and optional system display faces with safe fallbacks. Minimum normal body target is 16 CSS px; compact metadata may be smaller only with AA contrast and zoom tests. Use tabular numbers for resources where useful. Avoid all-caps paragraphs and excessive letter spacing.
- **Motion:** semantic durations/easings; reduced-motion mode removes nonessential travel, parallax, continuous animation, and celebratory effects while retaining immediate state feedback.
- **Acceptance:** no component hard-codes theme-specific text/background/status colors; no theme flash; all core state pairs pass AA; 200%/400% zoom and text-spacing overrides do not clip content.
- **Dependencies:** VA-00; FE-09.

## VA-02 — Shared accessible primitives

- **Priority / status:** P0 / Partial.
- **Components:** button/link/icon button, text/select/number/textarea/checkbox/radio/switch, field group, segmented control, card/surface, badge/tag, alert/status, tooltip, disclosure, menu, pagination, skeleton/progress, empty state, toast, dialog, tabs, data table/list, resource meter, and visually hidden text.
- **State requirements:** default, hover where relevant, active, focus-visible, disabled, readonly, loading, selected, invalid, warning, success, and high-contrast fallback. Disabled controls remain explainable; loading controls preserve labels and announce state without repeated live-region noise.
- **Icons:** replace emoji used as recurring interface symbols with a consistent SVG icon set or original vector assets. Decorative icons use `aria-hidden`; icon-only controls require accessible names and at least 24×24 CSS px pointer target, with 44×44 preferred for frequent touch actions.
- **Forms:** visible persistent labels; descriptions and errors wired by `aria-describedby`; fieldset/legend for grouped choices; localized input modes/autocomplete where safe; never use placeholder as label. Do not clear valid input after an error.
- **Acceptance:** primitives pass axe, keyboard, 400% zoom, forced-colors/high-contrast spot checks, and light/dark state matrices before feature teams use them.
- **Dependencies:** VA-01. Consumed by every FE work package.

## VA-03 — Global navigation, language, focus, and announcements

- **Priority / status:** P0 / Missing/Partial.
- **Implementation:** set document language to Brazilian Portuguese (`pt-BR`) and update when localized content changes. Add a first-focus skip link to `<main>`. Use one visible page `<h1>` and logical heading order. On route change, set title and move focus to the page heading only when navigation context warrants it; preserve focus for in-place updates.
- **Focus:** global `:focus-visible` ring must survive system themes and overlays. Never remove outline without an equivalent. Ensure DOM order matches visual order. Sticky regions must not obscure focused elements (WCAG 2.4.11/2.4.12 considerations).
- **Announcements:** use restrained `role=status` for save/sync/roll completion and `role=alert` only for urgent failures. Announce concise state changes once; keep complete history visible. Resource bars expose textual current/max and do not announce every animation frame.
- **Shortcuts:** all global shortcuts are documented, avoid single printable characters by default, ignore editable targets, and can be disabled/remapped if expanded. No keyboard trap.
- **Acceptance:** complete keyboard traversal has visible focus; skip link works; screen reader announces page, errors, save/conflict, and dice outcomes without duplicate noise.
- **Dependencies:** VA-02; FE-01/08.

## VA-04 — Dialogs, tabs, disclosures, and complex widgets

- **Priority / status:** P0 / Partial.
- **Dialogs:** use native `<dialog>` where browser support/behavior is verified or a tested accessible dialog primitive. Require accessible name, optional description, initial focus based on task, focus containment, Escape close except when a destructive operation cannot safely be interrupted, backdrop behavior, scroll lock, and focus restoration to the invoking control. Nested dialogs are prohibited.
- **Tabs:** use `tablist`, `tab`, `tabpanel`, `aria-selected`, `aria-controls`, roving tabindex, Home/End, and Arrow keys. Choose automatic activation only when panels are instant. On small screens, a select/disclosure may replace tabs while retaining labels and URL/state continuity.
- **Disclosures/menus/tooltips:** disclose state through `aria-expanded`; menus only for command collections with correct keyboard model; do not misuse menu roles for navigation. Tooltip content must also be reachable by focus and never contain required instructions.
- **Acceptance:** D&D and Yusong existing modals/tabs migrate to the primitive; focus never falls behind an overlay; closing returns to a sensible existing target.
- **Dependencies:** VA-02/03; FE-08.

## VA-05 — Platform Home, system selector, library, header, and branding density

- **Priority / status:** P1 / Missing.
- **Shell:** compact responsive header with neutral platform mark/name, primary navigation, connectivity/sync state, theme control, account menu, and an unobtrusive current-system accent. On mobile, prioritize page title and primary action; move secondary navigation to a tested disclosure/drawer.
- **Home/library:** make the platform Home the mixed-system character library rather than a D&D landing page. Support cards and compact list without encoding one system’s fields. Cards show system label, name, adapter summary, updated time, sync state, and accessible actions. Filters collapse cleanly on mobile and preserve visible active-filter chips.
- **System selector:** the New Character entry presents three clearly named, keyboard-operable system cards/list rows with concise descriptions, status/availability, and system-owned visual accents. Selection is never color-only and does not pre-load a disabled system bundle. Returning preserves draft safety and focus context.
- **Logo task:** commission or construct a platform mark with square, horizontal, monochrome, small-size, and favicon variants. Audit transparency/cropping and verify legibility at 16/24/32/48 px. Keep the existing D&D lockup inside D&D until rights and a compact crop are approved; never compress the full padded 1536×1024 image into the header.
- **Loading/error/empty:** avoid indefinite spinners. Skeletons mirror final structure without excessive motion. Empty states state why and offer one primary next action. Offline/conflict/migration failures remain visible until resolved.
- **Acceptance:** header does not wrap/occlude at 320 px or 400% zoom; every logo variant has accessible naming rules; library actions are keyboard/touch operable; long names and Portuguese strings wrap safely.
- **Dependencies:** VA-01..04, FE-01/03; branding decisions OD-01/02.

## VA-06 — D&D visual migration and print preservation

- **Priority / status:** P1 / Partial.
- **Preserve:** grimoire character, familiar information grouping, dice identity, current responsive inventory/attacks/spells work, semantic state colors, and browser print output.
- **Creation/sheet coverage:** migrate both the D&D New Character flow and full character sheet through shared fields, controls, dialogs, tabs, states, and responsive primitives while retaining their system-specific information architecture and all current choices/actions.
- **Refactor:** map existing CSS variables and uncommitted component styles to platform semantics; remove duplicated button/form/surface definitions only after screenshot comparison. Replace modal/tab behavior through VA-04. Make dense tables reflow into labeled rows/cards rather than horizontal page scrolling. Give sticky navigation sufficient offsets and focus clearance.
- **System identity:** parchment/ink/arcane accents may decorate D&D surfaces but must not alter shared error/focus/text semantics. The full D&D logo belongs on the D&D landing/character context, not every compact shell surface.
- **Print:** keep print rules system-owned; hide navigation/actions, expose URLs only where useful, expand clipped sections, and retain high-contrast monochrome legibility. Do not promise pixel-identical PDF across browsers.
- **Acceptance:** audited before/after screenshot review at all breakpoints; no rules control disappears; print sample retains all selected data; D&D 5e is still visually recognizable in light and dark modes.
- **Dependencies:** VA-00..04, FE-04.

## VA-07 — Yusong visual identity and accessibility migration

- **Priority / status:** P1 / Partial.
- **Preserve:** six school color/emblem identities, body-part visualization, card export, and the strongest presentation-mode hierarchy. Rebuild them on shared accessible primitives without moving calculations into presentation code.
- **Creation/sheet coverage:** give Yusong character creation/random generation and the complete editable sheet explicit small/mobile/desktop layouts; do not treat the random generator or presentation mode as a substitute for an accessible creation flow or Tabletop Mode.
- **Color safety:** every school has a text label and optional pattern/emblem; selected/active/condition states cannot depend on school hue alone. Generate accessible light/dark accent ramps and test contrast for badges, buttons, charts/body regions, and focus rings.
- **Body interface:** each region is reachable by keyboard and exposes name, type, armor current/max, dice, and state as text. Provide a linear list/table equivalent adjacent to or toggleable from the visual body. SVG regions need meaningful labels and sufficiently large hit targets.
- **Card export:** keep the export visually system-specific, but exclude inaccessible UI-only text from being the sole record. JSON/platform export remains the restorable path. Do not fetch a random external avatar without clear network disclosure/fallback.
- **Acceptance:** formula-equivalent migrated screens work without pointer/color/sound; all school themes pass the state matrix; body information is complete in linear reading order.
- **Dependencies:** VA-01..04, FE-05, MECH-03; naming decision OD-03.

## VA-08 — Original F&M visual direction and licensing gate

- **Priority / status:** P0 gate, P1 design / Missing.
- **Direction:** create an original visual identity inspired by abstract concepts—cursed energy, seals, ink, tension, fractured geometry—without tracing or extracting the rulebook’s art, layouts, typography, logos, or character designs. Prefer CSS, original SVG motifs, and commissioned/licensed art with provenance.
- **Deliverables:** moodboard with source/license notes; original platform-compatible wordmark/mark if authorized; light/dark palettes; typography; ornament rules; icon subset; illustration policy; sample creator, sheet, and tabletop screens; contrast and reduced-motion annotations.
- **Licensing ledger:** asset ID, creator/source, license/grant, allowed uses, modifications, attribution, storage location, and approval. No asset enters production without a completed record.
- **Acceptance:** owner approves a direction and rights ledger; legal/rights uncertainty blocks asset use, not mechanics delivery; UI remains complete with decorative imagery removed.
- **Dependencies:** VA-01; OD-04/05.

## VA-09 — F&M creator and character sheet experience

- **Priority / status:** P1 / Missing.
- **Creator:** use a stepper with named stages, current/total progress, save status, optional-section labels, previous/next controls, and a persistent review/issues summary. Do not disable Next without explaining why. Attribute methods present calculations/remaining points as text and announce roll results on demand.
- **Sheet hierarchy:** identity and core resources first; then attributes/derived statistics, skills/tests, advancement, combat actions, abilities, technique/spells, inventory/invocations, conditions/rests, and narrative sections. PE and Stamina variants visibly change labels/controls through the selected rules path, not hidden CSS.
- **Rule help:** concise paraphrase and printed page reference in disclosures; never flood the primary interface with book text. Derived values offer an accessible breakdown dialog/list. Manual/Narrator decisions use a clearly labeled “Manual ruling” treatment, not warning/error colors.
- **Acceptance:** complete creation is possible by keyboard/screen reader; drafts recover after refresh; 320 px and 400% zoom preserve stage navigation and issue summary; all automated values expose readable provenance.
- **Dependencies:** VA-02..04/08; FE-06; MECH-05..11.

## VA-10 — Tabletop Mode, creatures, and encounters

- **Priority / status:** P1 Tabletop, P2 encounters / Missing.
- **Tabletop:** high-salience current/max resources, conditions, common actions/rolls, rest controls, and notes. Use large targets and high-contrast numeric state; allow a compact density but never below accessibility minima. Secondary information expands without moving focus unexpectedly.
- **Creatures/encounters:** list/card switching; clear system filter; participant rows with initiative/order, resource editor, conditions, and action menu; round control remains near participant order. Drag-and-drop may be an enhancement only—provide Move Up/Down and position controls for keyboard/touch/assistive tech.
- **Scope:** no tactical grid/map/fog/token canvas. Visual language should communicate a lightweight tracker, not imply unsupported VTT features.
- **Acceptance:** works at arm’s length on tablet, keyboard-only desktop, and screen reader; color and animation are redundant; critical resource changes require confirmation or easy correction according to engine command policy.
- **Dependencies:** FE-10/11, MECH-12/13, VA-01..04.

## VA-11 — Operational states: local, offline, sync, conflict, and migration

- **Priority / status:** P1 / Missing/Partial.
- **State vocabulary:** `Saved locally`, `Waiting to sync`, `Syncing`, `Synced`, `Conflict`, `Save failed`, `Migration required`, and `Read-only newer version`. Use consistent icons/text and localized explanations. “Offline” is connectivity state; it is not automatically an error.
- **Conflict UI:** identify character/system and changed sections/timestamps, offer inspect local/server, keep local, keep server, and duplicate. Default action must not destroy either copy. Provide a downloadable safety export before replacement where feasible.
- **Migration UI:** preview record count/source/system, warnings, duplicates, invalid records, and success receipt. Never use a progress indicator that conceals per-record failure.
- **Announcements:** announce transitions once; repeated retries do not spam. Persistent visible status remains available outside live regions.
- **Acceptance:** users can understand current durability without technical vocabulary; all failure states have recovery; simulated screen reader output is concise.
- **Dependencies:** FE-02/07, BE-04/05, VA-02/03.

## VA-12 — Visual/accessibility regression program

- **Priority / status:** P0 release gate / Missing.
- **Automated:** axe on core pages/states; Playwright keyboard smoke; screenshot baselines across system/theme/viewport for stable fixture data; color-token contrast tests; lint for invalid ARIA where available. Mask timestamps/random dice in screenshots rather than loosening thresholds.
- **Manual per release:** keyboard path, NVDA, mobile screen reader sample, 200%/400% zoom, 320 px reflow, text spacing, touch targets, light/dark/system, reduced motion, high contrast/forced colors, error recovery, print/card output, and long/localized content.
- **Defect policy:** critical flow keyboard/screen-reader blockers, lost content at reflow, invisible focus, inaccessible authentication, silent save/conflict, or AA contrast failures in meaningful content block release. Decorative screenshot drift does not override functional accessibility.
- **Documentation:** component accessibility contract, known limitations with target dates, test fixture catalog, and evidence links per release.
- **Acceptance:** CI and manual matrix pass for library, sign-in, each system’s creation/sheet, tabletop, import/migration, settings, conflict, creature, and encounter flows included in the release.
- **Dependencies:** all VA and corresponding FE packages.

## Dependency Graph / Recommended Implementation Order

```text
FE-00 ─> VA-00 ─> VA-01 ─> VA-02 ─> VA-03 ─> VA-04
                              │         │         │
                              ├─────────┴─────────┴─> VA-05 (platform shell/library)
                              ├─> VA-06 + FE-04 (D&D)
                              ├─> VA-07 + FE-05 (Yusong)
                              └─> VA-08 ─> VA-09 + FE-06 (F&M)
VA-02..04 + FE-10/11 ─> VA-10
VA-02/03 + FE-02/07 + BE-04/05 ─> VA-11
All shipped routes/states ─> VA-12 release gate
```

Implement tokens and behavior primitives before migrating pages. Migrate one representative D&D screen first to validate semantics, then the D&D application, Yusong, and F&M vertical slice. Treat Tabletop and operational states as first-class responsive/accessibility work, not final polish.

## Open Decisions

- **OD-01:** approve a neutral platform name and identity, or explicitly authorize one system’s brand as the umbrella.
- **OD-02:** establish ownership/license and desired treatment for the existing D&D logo; approve a dedicated compact crop/redesign rather than automatic image manipulation.
- **OD-03:** choose the canonical Yusong/Pilares de Atlas/Circuito de Soyang name and whether all school emblems are original/cleared.
- **OD-04:** confirm F&M brand/logo/art rights. Until then, use only original abstract CSS/SVG work with recorded provenance.
- **OD-05:** approve F&M visual direction, typography licenses, and illustration budget/source.
- **OD-06:** select supported browser and assistive-technology floor; recommendation is current and previous major evergreen versions plus current NVDA.
- **OD-07:** decide whether user-selectable density and theme are first-release requirements; light/dark/system itself is required by the product brief.
- **OD-08:** determine whether an installable PWA/offline manifest needs icons/splash assets in the first release.
- **OD-09:** approve whether print/PDF/card exports must meet the same theme branding or prioritize neutral high-contrast output.

## Regression Checklist

- [ ] Uncommitted D&D token/component CSS is preserved and reviewed before consolidation.
- [ ] Existing D&D responsive inventory, attacks, spells, dialogs, roll panel, and print view retain all actions/content.
- [ ] Yusong school identity, body data, presentation behavior, sound state, and card export remain recognizable and usable.
- [ ] `html[lang]`, page titles, headings, landmarks, and skip link are correct.
- [ ] Every interactive element has visible focus and a keyboard path; no overlay traps or loses focus.
- [ ] Tabs, dialogs, menus, disclosures, and live regions use the correct interaction pattern.
- [ ] Light, dark, hover, active, focus, disabled, invalid, and selected states meet contrast requirements.
- [ ] Meaning is never conveyed only by color, motion, sound, position, or emoji.
- [ ] 320 px, 400% zoom, text spacing, long names, and Portuguese strings do not lose functionality.
- [ ] Reduced motion removes nonessential animation without hiding state changes.
- [ ] Operational save/sync/conflict/migration states are visible, announced, and recoverable.
- [ ] F&M uses no extracted rulebook art or unverified branded asset.
- [ ] Tabletop/encounter UI includes non-drag alternatives and does not imply full-VTT features.

## Validation Matrix

| Surface | Themes/viewports | Automated checks | Manual checks |
|---|---|---|---|
| Sign-in/private access | light/dark; mobile/desktop | axe, keyboard smoke, screenshots | errors, password manager, screen reader |
| Platform library | all themes; 320/390/768/1280/1440 | axe, empty/loading/error/conflict snapshots | filters, long names, touch, 400% |
| D&D creator/sheet/print | light/dark; mobile/desktop/print | axe, key flows, visual baselines | dense sections, dialogs/tabs, print completeness |
| Yusong creator/sheet/card | every school in light/dark | axe, body/list equivalence, screenshots | color independence, body keyboard, PNG output |
| F&M creator/sheet | light/dark; all path variants | axe, step flows, issue summary | rule help, derived breakdown, manual ruling clarity |
| Dice/dialog services | all systems | focus/live-region tests | NVDA announcement, reduced motion, sound-off |
| Tabletop | 320/tablet/desktop; light/dark | axe, keyboard actions, screenshots | arm’s-length touch, screen reader, zoom |
| Creatures/encounters | mobile/desktop | reorder alternative tests, axe | round/initiative clarity, no drag dependency |
| Offline/sync/migration | all state variants | state snapshots, announcements | comprehension and recovery exercise |
| Settings/themes | system/light/dark | preference and contrast tests | OS change, no flash, forced colors |

## Final Acceptance Checklist

- [ ] Shared semantic tokens and accessible primitives are the only foundation for new UI.
- [ ] Light, dark, and system themes work before first paint and retain AA contrast.
- [ ] D&D, Yusong, and F&M have distinct identities without changing shared accessibility semantics.
- [ ] The platform header/library uses a legible, rights-cleared neutral identity at small sizes.
- [ ] All core routes meet keyboard, focus, screen-reader, reflow, zoom, touch, and reduced-motion requirements.
- [ ] Dialogs, tabs, disclosures, errors, and live updates follow tested patterns.
- [ ] D&D and Yusong visual migrations preserve audited functionality and exports.
- [ ] F&M visuals are original/licensed and tracked in an asset-rights ledger.
- [ ] Tabletop and encounter surfaces remain compact, accessible, and explicitly non-VTT.
- [ ] Offline, sync, conflict, migration, corrupt-data, and newer-version states are understandable and recoverable.
- [ ] Automated axe/screenshot/keyboard gates and the manual WCAG matrix pass for every released core flow.
- [ ] Branding, rights, naming, browser support, and export decisions are recorded before production release.

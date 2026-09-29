export const FM_EDITION = "2.5.2";

const trace = (ruleId, page, section, automationClass, implementationSymbol, testIds = []) =>
  Object.freeze({ ruleId, edition: FM_EDITION, page, section, automationClass, implementationSymbol, testIds: Object.freeze(testIds) });

export const FM_RULES = Object.freeze([
  trace("FM-ATTR-01", "17", "Atributos", "deterministic", "validateAttributeScore", ["FM-ATTR-01-caps"]),
  trace("FM-CREATE-01", "18", "Valores de atributo", "deterministic", "validateFixedAttributeAssignment / rollAttributeSet / calculatePointBuyLedger", ["FM-CREATE-01-fixed", "FM-CREATE-01-roll", "FM-CREATE-01-point-buy"]),
  trace("FM-MOD-01", "19", "Modificadores", "deterministic", "attributeModifier", ["FM-MOD-01-floor"]),
  trace("FM-DERIVED-01", "19–20", "Valores derivados", "deterministic", "deriveCoreStatistics", ["FM-DERIVED-01-core"]),
  trace("FM-SOUL-01", "20; 311–312", "Integridade da Alma", "assisted", "soulIntegrityBand", ["FM-SOUL-01-thresholds"]),
  trace("FM-HP-01", "20; 44–46", "Pontos de Vida", "pending-content", null),
  trace("FM-PE-01", "21; 44–46", "Pontos de Energia / Estamina", "pending-content", null),
  trace("FM-ASPECT-01", "22", "Aspectos", "manual", "character.narrative", ["FM-ASPECT-01-roundtrip"]),
  trace("FM-ORIGIN-01", "27–39", "Origens", "pending-content", null),
  trace("FM-SPEC-01", "43–128", "Especializações", "assisted", "FM_SPECIALIZATIONS / createSpecializationLevelOneSkeleton", ["FM-SPEC-01-core-metadata", "FM-SPEC-01-level-one"]),
  trace("FM-LEVEL-01", "45–48", "Níveis", "deterministic", "trainingBonus / unarmedDie", ["FM-LEVEL-01-boundaries"]),
  trace("FM-MULTI-01", "47", "Multiclasse", "deterministic", "checkSpecializationMulticlassEntry", ["FM-MULTI-01-entry"]),
  trace("FM-XP-01", "48", "Experiência", "deterministic", "XP_THRESHOLDS / levelForExperience", ["FM-XP-01-thresholds"]),
  trace("FM-TALENT-01", "163–171", "Talentos", "pending-content", null),
  trace("FM-APT-01", "172–195", "Aptidões Amaldiçoadas", "pending-content", null),
  trace("FM-TECH-01", "196–246", "Técnicas e feitiços", "assisted", "character.technique", ["FM-TECH-01-roundtrip"]),
  trace("FM-STYLE-01", "247–255", "Estilos marciais", "manual", "character.martialStyle", ["FM-STYLE-01-roundtrip"]),
  trace("FM-INV-01", "256–275", "Invocações", "assisted", "character.invocations", ["FM-INV-01-roundtrip"]),
  trace("FM-TEST-01", "276–284", "Testes", "deterministic", "skillBonus / buildD20Request", ["FM-TEST-01-bonus"]),
  trace("FM-ATTACK-01", "279; 305", "Ataques", "assisted", "unarmedDie / buildD20Request", ["FM-ATTACK-01-unarmed"]),
  trace("FM-COMBAT-01", "291–325", "Combate", "pending-content", null),
  trace("FM-DEATH-01", "313", "Portões da morte", "pending-content", null),
  trace("FM-COND-01", "317–324", "Condições e exaustão", "manual", "character.combat.conditions", ["FM-COND-01-roundtrip"]),
  trace("FM-REST-01", "335", "Descansos", "pending-content", null),
  trace("FM-INTERLUDE-01", "336+", "Interlúdios", "manual", "character.interludes", ["FM-INTERLUDE-01-roundtrip"]),
  trace("FM-VOW-01", "351–358", "Votos de Restrição", "manual", "character.vows", ["FM-VOW-01-manual"]),
  trace("FM-MATH-01", "365–366", "Regras matemáticas", "deterministic", "roundDown / greatestTemporaryResource", ["FM-MATH-01-rounding"]),
]);

export function validateRuleRegistry(registry = FM_RULES) {
  const seen = new Set();
  for (const entry of registry) {
    if (!entry.ruleId || !entry.edition || !entry.page || !entry.section || !entry.automationClass) {
      throw new TypeError("Registro de regra F&M incompleto.");
    }
    if (seen.has(entry.ruleId)) throw new TypeError(`ID de regra F&M duplicado: ${entry.ruleId}.`);
    seen.add(entry.ruleId);
  }
  return true;
}


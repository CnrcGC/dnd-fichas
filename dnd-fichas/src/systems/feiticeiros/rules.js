export const FM_ATTRIBUTES = Object.freeze(["forca", "destreza", "constituicao", "inteligencia", "sabedoria", "presenca"]);
export const FIXED_ATTRIBUTE_ARRAY = Object.freeze([15, 14, 13, 12, 10, 8]);
export const XP_THRESHOLDS = Object.freeze([0, 1000, 3000, 6000, 10000, 15000, 21000, 28000, 36000, 45000, 55000, 66000, 78000, 91000, 105000, 120000, 136000, 153000, 171000, 190000]);
export const POINT_BUY_BUDGET = 17;

// O plano confirma o intervalo e orçamento, mas não reproduz a tabela de custos.
// Ela permanece bloqueada até o livro estar disponível; nenhuma tabela de D&D é presumida.
export function pointBuyCost() {
  throw Object.assign(new Error("Tabela de compra de pontos indisponível sem a fonte F&M 2.5.2."), { code: "rule-source-unavailable", ruleId: "FM-CREATE-01" });
}

export const roundDown = (value) => Math.floor(Number(value));
export const attributeModifier = (score) => Math.floor((Number(score) - 10) / 2);

export function validateAttributeScore(score, { exceptional = false } = {}) {
  const value = Number(score);
  const maximum = exceptional ? 30 : 20;
  return Number.isInteger(value) && value >= 0 && value <= maximum;
}

export function rollFourDropLowest(random = Math.random) {
  const rolls = Array.from({ length: 4 }, () => {
    const value = Number(random());
    if (!Number.isFinite(value) || value < 0 || value >= 1) throw new RangeError("RNG inválido.");
    return Math.floor(value * 6) + 1;
  });
  const sorted = [...rolls].sort((left, right) => left - right);
  return { rolls, discarded: sorted[0], total: sorted.slice(1).reduce((sum, value) => sum + value, 0), ruleId: "FM-CREATE-01" };
}

export function trainingBonus(level) {
  const normalized = Math.min(20, Math.max(1, Math.floor(Number(level) || 1)));
  return 2 + Math.floor((normalized - 1) / 4);
}

export function unarmedDie(level) {
  const dice = [4, 6, 8, 10, 12];
  const normalized = Math.min(20, Math.max(1, Math.floor(Number(level) || 1)));
  return `1d${dice[Math.floor((normalized - 1) / 4)]}`;
}

export function levelForExperience(experience) {
  const normalized = Math.max(0, Number(experience) || 0);
  let level = 1;
  XP_THRESHOLDS.forEach((threshold, index) => { if (normalized >= threshold) level = index + 1; });
  return level;
}

export function deriveCoreStatistics(character) {
  const attributes = character?.attributes ?? {};
  const level = Math.min(20, Math.max(1, Math.floor(Number(character?.progression?.level) || 1)));
  const dexterity = attributeModifier(attributes.destreza ?? 10);
  const perceptionBonus = Number(character?.skills?.percepcao?.bonus ?? 0);
  const modifiers = character?.modifiers ?? {};
  return {
    attention: { total: 10 + perceptionBonus + Number(modifiers.attention ?? 0), parts: [{ label: "Base", value: 10 }, { label: "Percepção", value: perceptionBonus }, { label: "Outros", value: Number(modifiers.attention ?? 0) }], ruleId: "FM-DERIVED-01" },
    defense: { total: 10 + dexterity + Math.floor(level / 2) + Number(modifiers.defense ?? 0), parts: [{ label: "Base", value: 10 }, { label: "Destreza", value: dexterity }, { label: "Metade do nível", value: Math.floor(level / 2) }, { label: "Outros", value: Number(modifiers.defense ?? 0) }], ruleId: "FM-DERIVED-01" },
    movement: { total: 9 + Number(modifiers.movement ?? 0), parts: [{ label: "Base", value: 9 }, { label: "Outros", value: Number(modifiers.movement ?? 0) }], unit: "m", ruleId: "FM-DERIVED-01" },
    initiative: { total: dexterity + Number(modifiers.initiative ?? 0), parts: [{ label: "Destreza", value: dexterity }, { label: "Outros", value: Number(modifiers.initiative ?? 0) }], ruleId: "FM-DERIVED-01" },
    trainingBonus: { total: trainingBonus(level), ruleId: "FM-LEVEL-01" },
    unarmedDie: { value: unarmedDie(level), ruleId: "FM-ATTACK-01" },
  };
}

export function soulIntegrityBand(current, maximum) {
  const max = Number(maximum);
  if (!(max > 0)) return { band: "invalid", percent: null, ruleId: "FM-SOUL-01" };
  const percent = (Number(current) / max) * 100;
  const band = percent <= 0 ? "dead" : percent <= 25 ? "quarter" : percent <= 50 ? "half" : percent <= 75 ? "three-quarters" : "full";
  return { band, percent, ruleId: "FM-SOUL-01" };
}

export function skillBonus({ keyModifier = 0, level = 1, trained = false, training = trainingBonus(level), other = 0 } = {}) {
  return Number(keyModifier) + Math.floor(Number(level) / 2) + (trained ? Number(training) : 0) + Number(other);
}


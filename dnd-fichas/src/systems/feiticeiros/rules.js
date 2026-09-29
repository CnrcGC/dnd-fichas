export const FM_ATTRIBUTES = Object.freeze(["forca", "destreza", "constituicao", "inteligencia", "sabedoria", "presenca"]);
export const FIXED_ATTRIBUTE_ARRAY = Object.freeze([15, 14, 13, 12, 10, 8]);
export const XP_THRESHOLDS = Object.freeze([0, 1000, 3000, 6000, 10000, 15000, 21000, 28000, 36000, 45000, 55000, 66000, 78000, 91000, 105000, 120000, 136000, 153000, 171000, 190000]);
export const POINT_BUY_BUDGET = 17;
export const POINT_BUY_COSTS = Object.freeze({ 8: -2, 9: -1, 10: 0, 11: 2, 12: 3, 13: 4, 14: 5, 15: 7 });

export function pointBuyCost(score) {
  const value = Number(score);
  if (!Number.isInteger(value) || !Object.hasOwn(POINT_BUY_COSTS, value)) {
    throw Object.assign(new RangeError("Compra por pontos aceita apenas valores inteiros entre 8 e 15."), {
      code: "point-buy-score-out-of-range",
      ruleId: "FM-CREATE-01",
      score,
    });
  }
  // Valores negativos representam pontos recebidos ao reduzir o atributo abaixo de 10.
  return POINT_BUY_COSTS[value];
}

function requireAttributeMap(attributeScores) {
  if (!attributeScores || typeof attributeScores !== "object" || Array.isArray(attributeScores)) {
    throw Object.assign(new TypeError("Informe os seis atributos de F&M em um objeto."), { code: "attribute-map-required", ruleId: "FM-CREATE-01" });
  }
  return FM_ATTRIBUTES.map((attribute) => ({ attribute, score: Number(attributeScores[attribute]) }));
}

export function validateFixedAttributeAssignment(attributeScores) {
  const values = requireAttributeMap(attributeScores).map(({ score }) => score).sort((left, right) => right - left);
  return values.length === FIXED_ATTRIBUTE_ARRAY.length
    && values.every((score, index) => Number.isInteger(score) && score === FIXED_ATTRIBUTE_ARRAY[index]);
}

export function calculatePointBuyLedger(attributeScores) {
  const entries = requireAttributeMap(attributeScores).map(({ attribute, score }) => {
    const cost = pointBuyCost(score);
    return Object.freeze({ attribute, score, cost, kind: cost < 0 ? "credit" : cost > 0 ? "cost" : "neutral" });
  });
  const costsPaid = entries.reduce((total, entry) => total + Math.max(0, entry.cost), 0);
  const creditsEarned = entries.reduce((total, entry) => total + Math.max(0, -entry.cost), 0);
  const netSpent = costsPaid - creditsEarned;
  const remaining = POINT_BUY_BUDGET - netSpent;
  return Object.freeze({
    entries: Object.freeze(entries),
    budget: POINT_BUY_BUDGET,
    costsPaid,
    creditsEarned,
    netSpent,
    remaining,
    valid: remaining >= 0,
    ruleId: "FM-CREATE-01",
  });
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

export function rollAttributeSet(random = Math.random) {
  const rolls = FM_ATTRIBUTES.map((attribute) => Object.freeze({ attribute, ...rollFourDropLowest(random) }));
  return Object.freeze({ rolls: Object.freeze(rolls), values: Object.freeze(Object.fromEntries(rolls.map(({ attribute, total }) => [attribute, total]))), ruleId: "FM-CREATE-01" });
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


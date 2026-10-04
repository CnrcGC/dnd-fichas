import { parseDiceNotation, rollDice } from "../../shared/rules/dice";
import { YUSONG_CONDITION_ROLL_MODIFIERS } from "./conditions";
import { YUSONG_SKILL_IDS } from "./skills";

export { YUSONG_CONDITION_ROLL_MODIFIERS, YUSONG_SKILL_IDS };

// Compatibility source: Fichas-Yusong-main (2).zip, supplied by the owner.
export const YUSONG_ATTRIBUTES = Object.freeze([
  "strength", "agility", "constitution", "size", "power",
  "intelligence", "charisma", "reaction", "health",
]);

export const YUSONG_BODY_PARTS = Object.freeze([
  Object.freeze({ id: "head", name: "Cabeça", type: "vital", initialDice: "-", initialArmor: 20 }),
  Object.freeze({ id: "torso", name: "Torso", type: "vital", initialDice: "-", initialArmor: 20 }),
  Object.freeze({ id: "abdomen", name: "Abdômen", type: "vital", initialDice: "-", initialArmor: 20 }),
  Object.freeze({ id: "rightArm", name: "Braço Direito", type: "member", initialDice: "1d6", initialArmor: 12 }),
  Object.freeze({ id: "leftArm", name: "Braço Esquerdo", type: "member", initialDice: "1d6", initialArmor: 12 }),
  Object.freeze({ id: "rightLeg", name: "Perna Direita", type: "member", initialDice: "1d6", initialArmor: 12 }),
  Object.freeze({ id: "leftLeg", name: "Perna Esquerda", type: "member", initialDice: "1d6", initialArmor: 12 }),
]);

const number = (value) => Number.isFinite(Number(value)) ? Number(value) : 0;

export function calculateLife(health, level) {
  return number(health) * 8 + number(level) * 4;
}

export function calculateStamina(constitution, health) {
  return (number(constitution) + number(health)) * 25 + 100;
}

export function calculateMovement(agility, size) {
  return Math.max(1, 4 + number(agility) - number(size));
}

export function calculateRun(movement) {
  return number(movement) * 2 + 4;
}

export function calculateRD(size) {
  const numericSize = number(size);
  if (numericSize >= 12) return 8;
  if (numericSize >= 10) return 6;
  if (numericSize >= 7) return 4;
  if (numericSize >= 5) return 2;
  return 0;
}

export function calculateAverage(valueA, valueB) {
  return Math.floor((number(valueA) + number(valueB)) / 2);
}

export function getReactionDice(value) {
  return ({
    1: "1d4", 2: "1d6", 3: "1d8", 4: "1d10", 5: "1d12", 6: "2d8",
    7: "1d20", 8: "2d20", 9: "2d20+2", 10: "2d20+4",
    11: "2d20+6", 12: "2d20+9",
  })[number(value)] ?? "1d4";
}

export function calculateDodge(agility, reaction) {
  return getReactionDice(calculateAverage(agility, reaction));
}

export function calculateCounterAttack(agility, intelligence) {
  return getReactionDice(calculateAverage(agility, intelligence));
}

export function getVitalArmorByValue(value) {
  return ({
    1: 20, 2: 25, 3: 30, 4: 35, 5: 40, 6: 45,
    7: 50, 8: 55, 9: 60, 10: 65, 11: 70, 12: 75,
  })[number(value)] ?? 20;
}

export function calculateVitalArmor(constitution, health) {
  return getVitalArmorByValue(calculateAverage(constitution, health));
}

export function getDiceMaxValue(dice) {
  return ({
    "1d4": 4, "1d6": 6, "1d8": 8, "1d10": 10, "1d12": 12,
    "2d8": 16, "1d20": 20, "1d20+8": 28, "2d20": 40,
  })[String(dice).toLowerCase()] ?? 4;
}

export function calculateMemberArmor(dice) {
  return getDiceMaxValue(dice) * 2;
}

export function calculateMemberDicePool(strength, agility) {
  const value = calculateAverage(strength, agility);
  const table = {
    1: ["1d4", "1d6", "1d8", "1d10"],
    2: ["1d4", "1d6", "1d10", "1d10"],
    3: ["1d6", "1d10", "1d10", "1d12"],
    4: ["1d8", "1d10", "1d10", "1d12"],
    5: ["1d10", "1d12", "1d12", "1d12"],
    6: ["1d12", "1d12", "1d12", "2d8"],
    7: ["1d12", "1d12", "2d8", "1d20"],
    8: ["1d12", "2d8", "2d8", "1d20"],
    9: ["2d8", "2d8", "2d8", "1d20"],
    10: ["2d8", "2d8", "1d20", "1d20"],
    11: ["2d8", "1d20", "1d20", "1d20+8"],
    12: ["1d20", "1d20", "2d20", "2d20"],
  };
  return [...(table[value] ?? table[1])];
}

export function yusongTalentCost(percent, maximumStamina) {
  return Math.ceil((number(percent) / 100) * number(maximumStamina));
}

export function getBodyPartState(currentArmor) {
  return number(currentArmor) <= 0 ? "Inutilizado" : "Normal";
}

export function clampArmor(value, maximum) {
  return Math.min(number(maximum), Math.max(0, number(value)));
}

export function getConditionRollModifier(conditions = {}) {
  return Object.entries(conditions).reduce(
    (total, [id, active]) => total + (active ? (YUSONG_CONDITION_ROLL_MODIFIERS[id] ?? 0) : 0),
    0,
  );
}

export function buildYusongDiceNotation(notation, conditions = {}) {
  parseDiceNotation(notation);
  const modifier = getConditionRollModifier(conditions);
  if (!modifier) return String(notation);
  return modifier > 0 ? `${notation}+${modifier}` : `${notation}${modifier}`;
}

export function rollYusongDice({ notation, label = "", conditions = {}, random = Math.random }) {
  const modifier = getConditionRollModifier(conditions);
  const finalNotation = buildYusongDiceNotation(notation, conditions);
  const result = rollDice(finalNotation, random);
  return {
    ...result,
    total: label.startsWith("Dano") ? Math.max(0, result.total) : result.total,
    label,
    modifier,
  };
}

export function getYusongSkillBonus(rank) {
  return Math.min(5, Math.max(0, number(rank))) * 4;
}

// Compatibility source: AttributeBox.jsx from the owner-supplied Pilares project.
export function buildYusongAttributeNotation(value) {
  return `1d20+${number(value)}`;
}

export function buildYusongSkillNotation(rank) {
  return `1d20+${getYusongSkillBonus(rank)}`;
}

export function rollYusongSkill({ skillName, rank, conditions = {}, random = Math.random }) {
  return rollYusongDice({
    notation: buildYusongSkillNotation(rank),
    label: `Perícia (${skillName})`,
    conditions,
    random,
  });
}

export function distributeYusongPoints(keys, points, base, cap, random = Math.random) {
  const result = Object.fromEntries(keys.map((key) => [key, base]));
  let remaining = points;
  let safety = points * 20;
  while (remaining > 0 && safety > 0) {
    const raw = Number(random());
    if (!Number.isFinite(raw) || raw < 0 || raw >= 1) {
      throw new RangeError("O gerador aleatório deve retornar um valor entre 0 e 1.");
    }
    const key = keys[Math.floor(raw * keys.length)];
    if (result[key] < cap) {
      result[key] += 1;
      remaining -= 1;
    }
    safety -= 1;
  }
  return result;
}

export function deriveYusong(character) {
  const attributes = character?.attributes ?? {};
  const level = Math.max(0, number(character?.identity?.level ?? character?.level));
  const maximumLife = calculateLife(attributes.health, level);
  const maximumStamina = calculateStamina(attributes.constitution, attributes.health);
  const movement = calculateMovement(attributes.agility, attributes.size);
  const run = calculateRun(movement);
  const vitalArmor = calculateVitalArmor(attributes.constitution, attributes.health);
  const memberDice = calculateMemberDicePool(attributes.strength, attributes.agility);
  const storedMemberDice = storedBodyDice(character?.body);
  const effectiveMemberDice = sameDicePool(storedMemberDice, memberDice) ? storedMemberDice : memberDice;
  let memberIndex = 0;
  const storedBody = Array.isArray(character?.body) ? character.body : [];
  const body = YUSONG_BODY_PARTS.map((part) => {
    const stored = storedBody.find((candidate) => candidate?.id === part.id);
    const dice = part.type === "vital" ? "-" : effectiveMemberDice[memberIndex++];
    const maximumArmor = part.type === "vital" ? vitalArmor : calculateMemberArmor(dice);
    const currentArmor = number(stored?.currentArmor ?? maximumArmor);
    return { id: part.id, name: part.name, type: part.type, dice, currentArmor, maximumArmor, state: getBodyPartState(currentArmor) };
  });

  return {
    resources: {
      maximumLife,
      maximumStamina,
      rd: calculateRD(attributes.size),
      movement,
      run,
    },
    reactions: {
      dodge: calculateDodge(attributes.agility, attributes.reaction),
      counterAttack: calculateCounterAttack(attributes.agility, attributes.intelligence),
    },
    body,
    // Temporary aliases keep the already-created adapter consumers stable.
    life: maximumLife,
    maximumStamina,
    movement,
    run,
    vitalArmor,
    limb: { dicePool: effectiveMemberDice, armor: effectiveMemberDice.map(calculateMemberArmor) },
  };
}

function storedBodyDice(body) {
  if (!Array.isArray(body)) return [];
  return YUSONG_BODY_PARTS
    .filter((part) => part.type === "member")
    .map((part) => body.find((candidate) => candidate?.id === part.id)?.dice)
    .filter(Boolean);
}

function sameDicePool(candidate, expected) {
  if (candidate.length !== expected.length) return false;
  return [...candidate].sort().every((dice, index) => dice === [...expected].sort()[index]);
}

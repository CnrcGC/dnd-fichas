export const YUSONG_ATTRIBUTES = Object.freeze([
  "strength", "agility", "constitution", "health", "intelligence",
  "wisdom", "presence", "size", "spirit",
]);

const number = (value) => Number.isFinite(Number(value)) ? Number(value) : 0;

export function deriveYusong(character) {
  const attributes = character?.attributes ?? {};
  const health = number(attributes.health);
  const constitution = number(attributes.constitution);
  const agility = number(attributes.agility);
  const strength = number(attributes.strength);
  const size = number(attributes.size);
  const level = Math.max(0, number(character?.level));
  const movement = Math.max(1, 4 + agility - size);
  const maximumStamina = (constitution + health) * 25 + 100;

  return {
    life: health * 8 + level * 4,
    maximumStamina,
    movement,
    run: movement * 2 + 4,
    vitalArmor: { constitution, health },
    limb: { diceBase: strength, armorBase: agility },
  };
}

export function yusongTalentCost(percent, maximumStamina) {
  return Math.ceil((number(percent) / 100) * number(maximumStamina));
}


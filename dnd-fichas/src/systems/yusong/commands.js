import { SYSTEM_IDS, commandResult } from "../../shared/rules/engineContract";
import {
  YUSONG_ATTRIBUTES,
  calculateMemberArmor,
  deriveYusong,
  yusongTalentCost,
} from "./rules";

const RESOURCE_MAXIMUM = Object.freeze({
  currentLife: "maximumLife",
  currentStamina: "maximumStamina",
});

export class YusongCommandError extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.name = "YusongCommandError";
    this.code = code;
    this.details = details;
  }
}

function clone(character) {
  return structuredClone(character);
}

function finite(value, code, message) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) throw new YusongCommandError(code, message, { value });
  return numeric;
}

function resourceEvent(resource, previous, current, reason) {
  return { type: "resource.changed", systemId: SYSTEM_IDS.YUSONG, resource, previous, current, reason };
}

function bodyEvent(partId, previous, current, reason) {
  return { type: "body.armor-changed", systemId: SYSTEM_IDS.YUSONG, partId, previous, current, reason };
}

function reconcileDerivedMaximums(previous, next, reason) {
  const nextDerived = deriveYusong(next);
  const character = clone(next);
  const events = [];

  for (const [resource, maximumKey] of Object.entries(RESOURCE_MAXIMUM)) {
    const before = finite(previous.resources?.[resource], "resource.invalid", `O recurso ${resource} é inválido.`);
    const after = Math.min(before, nextDerived.resources[maximumKey]);
    character.resources[resource] = after;
    if (after !== before) events.push(resourceEvent(resource, before, after, reason));
  }

  character.body = nextDerived.body.map((derivedPart) => {
    const previousPart = previous.body.find((part) => part.id === derivedPart.id);
    const before = finite(previousPart?.currentArmor, "body.armor-invalid", `A armadura de ${derivedPart.id} é inválida.`);
    const after = Math.min(before, derivedPart.maximumArmor);
    if (after !== before) events.push(bodyEvent(derivedPart.id, before, after, reason));
    return {
      id: derivedPart.id,
      currentArmor: after,
      ...(derivedPart.type === "member" ? { dice: derivedPart.dice } : {}),
    };
  });

  return { character, events };
}

export function setYusongResource(character, { resource, value }) {
  const maximumKey = RESOURCE_MAXIMUM[resource];
  if (!maximumKey) throw new YusongCommandError("resource.unknown", `Recurso Yusong desconhecido: ${resource}.`, { resource });
  const numeric = finite(value, "resource.invalid", `O valor de ${resource} é inválido.`);
  const maximum = deriveYusong(character).resources[maximumKey];
  const previous = finite(character.resources?.[resource], "resource.invalid", `O recurso ${resource} é inválido.`);
  const current = Math.min(maximum, Math.max(0, Math.floor(numeric)));
  const next = clone(character);
  next.resources[resource] = current;
  return commandResult(next, {
    events: current === previous ? [] : [resourceEvent(resource, previous, current, "manual")],
  });
}

export function setYusongAttribute(character, { attribute, value }) {
  if (!YUSONG_ATTRIBUTES.includes(attribute)) {
    throw new YusongCommandError("attribute.unknown", `Atributo Yusong desconhecido: ${attribute}.`, { attribute });
  }
  const numeric = finite(value, "attribute.invalid", `O valor de ${attribute} é inválido.`);
  const previousValue = Number(character.attributes[attribute]);
  const next = clone(character);
  next.attributes[attribute] = Math.min(12, Math.max(1, numeric));

  // The legacy effect rebuilt the canonical member pool after any attribute edit.
  next.body = next.body.map(({ id, currentArmor }) => ({ id, currentArmor }));
  const reconciled = reconcileDerivedMaximums(character, next, "attribute.changed");
  return commandResult(reconciled.character, {
    events: [
      { type: "attribute.changed", systemId: SYSTEM_IDS.YUSONG, attribute, previous: previousValue, current: next.attributes[attribute] },
      ...reconciled.events,
    ],
  });
}

export function setYusongLevel(character, { level }) {
  const numeric = finite(level, "level.invalid", "O nível Yusong é inválido.");
  const previousLevel = Number(character.identity.level);
  const next = clone(character);
  next.identity.level = Math.min(20, Math.max(1, numeric));
  next.body = next.body.map(({ id, currentArmor }) => ({ id, currentArmor }));
  const reconciled = reconcileDerivedMaximums(character, next, "level.changed");
  return commandResult(reconciled.character, {
    events: [
      { type: "level.changed", systemId: SYSTEM_IDS.YUSONG, previous: previousLevel, current: next.identity.level },
      ...reconciled.events,
    ],
  });
}

export function changeYusongBodyArmor(character, { partId, amount }) {
  const numeric = finite(amount, "body.amount-invalid", "A alteração de armadura é inválida.");
  const part = character.body.find((candidate) => candidate.id === partId);
  const derivedPart = deriveYusong(character).body.find((candidate) => candidate.id === partId);
  if (!part || !derivedPart) throw new YusongCommandError("body.part-unknown", `Parte do corpo desconhecida: ${partId}.`, { partId });
  return setBodyArmorValue(character, part, derivedPart, Number(part.currentArmor) + numeric, "increment");
}

export function setYusongBodyArmor(character, { partId, value }) {
  const numeric = finite(value, "body.armor-invalid", "O valor de armadura é inválido.");
  const part = character.body.find((candidate) => candidate.id === partId);
  const derivedPart = deriveYusong(character).body.find((candidate) => candidate.id === partId);
  if (!part || !derivedPart) throw new YusongCommandError("body.part-unknown", `Parte do corpo desconhecida: ${partId}.`, { partId });
  return setBodyArmorValue(character, part, derivedPart, Math.floor(numeric), "manual");
}

function setBodyArmorValue(character, part, derivedPart, requested, reason) {
  const previous = finite(part.currentArmor, "body.armor-invalid", `A armadura de ${part.id} é inválida.`);
  const current = Math.min(derivedPart.maximumArmor, Math.max(0, requested));
  const next = clone(character);
  next.body = next.body.map((candidate) => candidate.id === part.id ? { ...candidate, currentArmor: current } : candidate);
  return commandResult(next, {
    events: current === previous ? [] : [bodyEvent(part.id, previous, current, reason)],
  });
}

export function swapYusongMemberDice(character, { partId, dice }) {
  const derivedBody = deriveYusong(character).body;
  const selected = derivedBody.find((part) => part.id === partId);
  if (!selected || selected.type !== "member") {
    throw new YusongCommandError("body.member-required", "A redistribuição de dados exige um membro válido.", { partId });
  }
  const availableDice = derivedBody.filter((part) => part.type === "member").map((part) => part.dice);
  if (!availableDice.includes(dice)) {
    throw new YusongCommandError("body.dice-unavailable", `O dado ${dice} não pertence ao pool atual.`, { partId, dice });
  }
  if (selected.dice === dice) return commandResult(clone(character));

  const target = derivedBody.find((part) => part.type === "member" && part.id !== partId && part.dice === dice);
  if (!target) throw new YusongCommandError("body.dice-target-missing", `Não existe outro membro com o dado ${dice}.`, { partId, dice });
  const next = clone(character);
  next.body = next.body.map((part) => {
    if (part.id === partId) return { ...part, dice, currentArmor: Math.min(Number(part.currentArmor), calculateMemberArmor(dice)) };
    if (part.id === target.id) return { ...part, dice: selected.dice, currentArmor: Math.min(Number(part.currentArmor), calculateMemberArmor(selected.dice)) };
    return part;
  });
  return commandResult(next, {
    events: [{ type: "body.dice-swapped", systemId: SYSTEM_IDS.YUSONG, partId, targetPartId: target.id, previousDice: selected.dice, currentDice: dice }],
  });
}

export function toggleYusongCondition(character, { conditionId }) {
  if (!conditionId) throw new YusongCommandError("condition.id-missing", "A condição precisa de um identificador.");
  const previous = Boolean(character.conditions?.[conditionId]);
  const next = clone(character);
  next.conditions = { ...next.conditions, [conditionId]: !previous };
  return commandResult(next, {
    events: [{ type: "condition.changed", systemId: SYSTEM_IDS.YUSONG, conditionId, active: !previous }],
  });
}

export function useYusongTalent(character, { talentId }) {
  const talent = character.talents.find((candidate) => candidate.id === talentId);
  if (!talent) throw new YusongCommandError("talent.not-found", `Talento não encontrado: ${talentId}.`, { talentId });
  const maximum = deriveYusong(character).resources.maximumStamina;
  return spendStamina(character, yusongTalentCost(talent.staminaCostPercent, maximum), "talent.used", { talentId });
}

export function useYusongGenius(character) {
  return spendStamina(character, 10, "genius.used");
}

export function useYusongGeniusAbility(character, { abilityId }) {
  const ability = character.genius.abilities.find((candidate) => candidate.id === abilityId);
  if (!ability) throw new YusongCommandError("genius.ability-not-found", `Habilidade Genius não encontrada: ${abilityId}.`, { abilityId });
  const cost = finite(ability.staminaCost, "genius.cost-invalid", "O custo da habilidade Genius é inválido.");
  if (cost <= 0) return commandResult(clone(character), { warnings: [{ code: "genius.no-stamina-cost", abilityId }] });
  return spendStamina(character, cost, "genius.ability-used", { abilityId });
}

function spendStamina(character, requestedCost, eventType, metadata = {}) {
  const cost = Math.max(0, finite(requestedCost, "stamina.cost-invalid", "O custo de Stamina é inválido."));
  const previous = finite(character.resources?.currentStamina, "resource.invalid", "A Stamina corrente é inválida.");
  if (previous < cost) {
    return commandResult(clone(character), { warnings: [{ code: "stamina.insufficient", required: cost, available: previous, ...metadata }] });
  }
  const next = clone(character);
  next.resources.currentStamina = previous - cost;
  return commandResult(next, {
    events: [
      { type: eventType, systemId: SYSTEM_IDS.YUSONG, cost, ...metadata },
      resourceEvent("currentStamina", previous, next.resources.currentStamina, eventType),
    ],
  });
}

export const yusongCommands = Object.freeze({
  setResource: setYusongResource,
  setAttribute: setYusongAttribute,
  setLevel: setYusongLevel,
  changeBodyArmor: changeYusongBodyArmor,
  setBodyArmor: setYusongBodyArmor,
  swapMemberDice: swapYusongMemberDice,
  toggleCondition: toggleYusongCondition,
  useTalent: useYusongTalent,
  useGenius: useYusongGenius,
  useGeniusAbility: useYusongGeniusAbility,
});

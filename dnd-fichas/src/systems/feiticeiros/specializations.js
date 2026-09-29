import { FM_ATTRIBUTES } from "./rules";
import { FM_EDITION } from "./traceability";

const REVIEW = Object.freeze({ status: "implementation-reviewed", reviewer: "Codex implementation agent", reviewedOn: "2026-09-29" });

function specialization({ sourcePages, ...definition }) {
  const requirements = definition.multiclass.requirements ?? [];
  return Object.freeze({
    ...definition,
    edition: FM_EDITION,
    keyAttributes: Object.freeze(definition.keyAttributes),
    hitPoints: Object.freeze(definition.hitPoints),
    resource: Object.freeze(definition.resource),
    training: Object.freeze(definition.training),
    multiclass: Object.freeze({
      ...definition.multiclass,
      requirements: Object.freeze(requirements.map((requirement) => Object.freeze({ ...requirement, anyOf: Object.freeze(requirement.anyOf) }))),
    }),
    baseAbility: Object.freeze(definition.baseAbility),
    source: Object.freeze({ ruleId: "FM-SPEC-01", pages: Object.freeze(sourcePages), review: REVIEW }),
  });
}

export const FM_SPECIALIZATIONS = Object.freeze([
  specialization({
    id: "lutador", name: "Lutador", sourcePages: [44, 49],
    hitPoints: { firstLevelBase: 12, hitDie: "1d10", subsequentFixed: 6 },
    resource: { kind: "pe", perLevel: 4, addKeyModifierOnce: false },
    keyAttributes: ["forca", "destreza"],
    training: { equipment: "Armas Simples, Armas Marciais e Escudo Leve.", saves: "Fortitude ou Reflexos.", skills: "Uma perícia de Ofício, Atletismo ou Acrobacia e outras três perícias quaisquer.", effectClassification: "display-only" },
    multiclass: { prohibited: false, requirements: [{ anyOf: ["forca", "destreza"], minimum: 16 }] },
    baseAbility: { id: "corpo-treinado", name: "Corpo Treinado", effectClassification: "display-only", sourcePage: 49 },
  }),
  specialization({
    id: "especialista-combate", name: "Especialista em Combate", sourcePages: [44, 63],
    hitPoints: { firstLevelBase: 12, hitDie: "1d10", subsequentFixed: 6 },
    resource: { kind: "pe", perLevel: 4, addKeyModifierOnce: false },
    keyAttributes: ["forca", "destreza", "sabedoria"],
    training: { equipment: "Todas as armas e escudos.", saves: "Fortitude ou Reflexos.", skills: "Duas perícias de Ofício, Atletismo ou Acrobacia e outras três perícias quaisquer.", effectClassification: "display-only" },
    multiclass: { prohibited: false, requirements: [{ anyOf: ["forca", "destreza"], minimum: 16 }] },
    baseAbility: { id: "repertorio-especialista", name: "Repertório do Especialista", effectClassification: "display-only", sourcePage: 63 },
  }),
  specialization({
    id: "especialista-tecnica", name: "Especialista em Técnica", sourcePages: [44, 78],
    hitPoints: { firstLevelBase: 10, hitDie: "1d8", subsequentFixed: 5 },
    resource: { kind: "pe", perLevel: 6, addKeyModifierOnce: true },
    keyAttributes: ["inteligencia", "sabedoria"],
    training: { equipment: "Armas Simples e Armas a Distância.", saves: "Astúcia ou Vontade.", skills: "Duas perícias de Ofício, Feitiçaria, Ocultismo e outras duas perícias quaisquer.", effectClassification: "display-only" },
    multiclass: { prohibited: false, requirements: [{ anyOf: ["inteligencia", "sabedoria"], minimum: 16 }] },
    baseAbility: { id: "dominio-fundamentos", name: "Domínio dos Fundamentos", effectClassification: "display-only", sourcePage: 78 },
  }),
  specialization({
    id: "controlador", name: "Controlador", sourcePages: [44, 90],
    hitPoints: { firstLevelBase: 10, hitDie: "1d8", subsequentFixed: 5 },
    resource: { kind: "pe", perLevel: 5, addKeyModifierOnce: true },
    keyAttributes: ["presenca", "sabedoria"],
    training: { equipment: "Armas Simples e Armas a Distância.", saves: "Astúcia ou Vontade.", skills: "Uma perícia de Ofício, Percepção, Persuasão e outras duas perícias quaisquer.", effectClassification: "display-only" },
    multiclass: { prohibited: false, requirements: [{ anyOf: ["presenca", "sabedoria"], minimum: 16 }] },
    baseAbility: { id: "treinamento-controle", name: "Treinamento em Controle", effectClassification: "display-only", sourcePage: 90 },
  }),
  specialization({
    id: "suporte", name: "Suporte", sourcePages: [44, 102],
    hitPoints: { firstLevelBase: 10, hitDie: "1d8", subsequentFixed: 5 },
    resource: { kind: "pe", perLevel: 5, addKeyModifierOnce: true },
    keyAttributes: ["presenca", "sabedoria"],
    training: { equipment: "Armas Simples e Escudos.", saves: "Astúcia ou Vontade.", skills: "Duas perícias de Ofício, Medicina, Prestidigitação e outras três perícias quaisquer.", effectClassification: "display-only" },
    multiclass: { prohibited: false, requirements: [{ anyOf: ["presenca", "sabedoria"], minimum: 16 }] },
    baseAbility: { id: "suporte-combate", name: "Suporte em Combate", effectClassification: "display-only", sourcePage: 102 },
  }),
  specialization({
    id: "restringido", name: "Restringido", sourcePages: [44, 114],
    hitPoints: { firstLevelBase: 16, hitDie: "1d12", subsequentFixed: 7 },
    resource: { kind: "stamina", perLevel: 4, addKeyModifierOnce: false, shortRestRecovery: "half", longRestRecovery: "full" },
    keyAttributes: [...FM_ATTRIBUTES],
    training: { equipment: "Todas as armas e escudos.", saves: "Fortitude e Reflexos.", skills: "Uma perícia de Ofício e outras quatro perícias quaisquer, exceto Feitiçaria.", effectClassification: "display-only" },
    multiclass: { prohibited: true, requirements: [] },
    baseAbility: { id: "restrito-ceus", name: "Restrito pelos Céus", effectClassification: "display-only", sourcePage: 114 },
  }),
]);

export function getFmSpecialization(specializationId) {
  return FM_SPECIALIZATIONS.find(({ id }) => id === specializationId) ?? null;
}

export function createSpecializationLevelOneSkeleton(specializationId, keyAttribute) {
  const selected = getFmSpecialization(specializationId);
  if (!selected) throw Object.assign(new RangeError(`Especialização desconhecida: ${specializationId}.`), { code: "specialization.unknown", ruleId: "FM-SPEC-01" });
  if (!selected.keyAttributes.includes(keyAttribute)) {
    throw Object.assign(new RangeError(`Atributo-chave inválido para ${selected.name}.`), { code: "specialization.invalid-key-attribute", ruleId: "FM-SPEC-01", specializationId, keyAttribute });
  }
  return Object.freeze({
    id: selected.id,
    level: 1,
    keyAttribute,
    baseAbilityIds: Object.freeze([selected.baseAbility.id]),
    rulesEdition: selected.edition,
    ruleId: "FM-SPEC-01",
  });
}

export function checkSpecializationMulticlassEntry(specializationId, attributes, existingSpecializationIds = []) {
  const target = getFmSpecialization(specializationId);
  if (!target) throw Object.assign(new RangeError(`Especialização desconhecida: ${specializationId}.`), { code: "specialization.unknown", ruleId: "FM-MULTI-01" });
  if (target.multiclass.prohibited || existingSpecializationIds.includes("restringido")) {
    return Object.freeze({ ok: false, code: "multiclass.restringido-prohibited", ruleId: "FM-MULTI-01" });
  }
  const eligible = target.multiclass.requirements.every(({ anyOf, minimum }) => anyOf.some((attribute) => Number(attributes?.[attribute]) >= minimum));
  return Object.freeze({ ok: eligible, code: eligible ? null : "multiclass.attribute-requirement", ruleId: "FM-MULTI-01" });
}

export function validateSpecializationCatalog(catalog = FM_SPECIALIZATIONS) {
  const ids = new Set();
  for (const entry of catalog) {
    if (!entry.id || ids.has(entry.id) || entry.edition !== FM_EDITION || entry.source?.ruleId !== "FM-SPEC-01" || !entry.source?.review?.reviewer) return false;
    if (!entry.hitPoints?.hitDie || !Number.isInteger(entry.hitPoints?.firstLevelBase) || !Number.isInteger(entry.resource?.perLevel)) return false;
    if (!entry.keyAttributes?.length || !entry.baseAbility?.id || !entry.baseAbility?.effectClassification) return false;
    ids.add(entry.id);
  }
  return ids.size === 6;
}

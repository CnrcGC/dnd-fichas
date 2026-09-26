import { assertSystemEngine, SYSTEM_IDS } from "../../shared/rules/engineContract";

const definitions = [
  { id: SYSTEM_IDS.DND5E, displayName: "D&D 5e", loadEngine: () => import("../../systems/dnd5e/engine").then(({ dnd5eEngine }) => dnd5eEngine), available: true },
  { id: SYSTEM_IDS.YUSONG, displayName: "Yusong", loadEngine: () => import("../../systems/yusong/engine").then(({ yusongEngine }) => yusongEngine), available: false, unavailableReason: "A interface-fonte Yusong não está presente neste repositório." },
  { id: SYSTEM_IDS.FEITICEIROS, displayName: "Feiticeiros & Maldições", loadEngine: () => import("../../systems/feiticeiros/engine").then(({ feiticeirosEngine }) => feiticeirosEngine), available: false, unavailableReason: "O catálogo e a revisão do livro 2.5.2 ainda são necessários para concluir a criação." },
];

export const systemRegistry = new Map(definitions.map((definition) => {
  return [definition.id, Object.freeze(definition)];
}));

export function listSystems() {
  return [...systemRegistry.values()];
}

export function getSystem(systemId) {
  const system = systemRegistry.get(systemId);
  if (!system) throw Object.assign(new Error(`Sistema não suportado: ${systemId}.`), { code: "unsupported-system", systemId });
  return system;
}

export async function loadSystemEngine(systemId) {
  const definition = getSystem(systemId);
  const engine = assertSystemEngine(await definition.loadEngine());
  if (definition.id !== engine.systemId) throw new TypeError(`Registro inconsistente para ${definition.id}.`);
  return engine;
}


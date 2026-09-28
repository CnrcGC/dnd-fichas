import { assertSystemEngine, SYSTEM_IDS } from "../../shared/rules/engineContract";
import { assertSystemAdapter } from "./adapterContract";
import { SYSTEM_ROUTE_SEGMENTS } from "../routing/routes";

const definitions = [
  { id: SYSTEM_IDS.DND5E, displayName: "D&D 5e", routeSegment: SYSTEM_ROUTE_SEGMENTS[SYSTEM_IDS.DND5E], loadEngine: () => import("../../systems/dnd5e/engine").then(({ dnd5eEngine }) => dnd5eEngine), loadAdapter: () => import("../../systems/dnd5e/adapter.jsx").then(({ dnd5eAdapter }) => dnd5eAdapter), available: true, creatorAvailable: true },
  { id: SYSTEM_IDS.YUSONG, displayName: "Pilares de Atlas", routeSegment: SYSTEM_ROUTE_SEGMENTS[SYSTEM_IDS.YUSONG], loadEngine: () => import("../../systems/yusong/engine").then(({ yusongEngine }) => yusongEngine), loadAdapter: () => import("../../systems/yusong/adapter.jsx").then(({ yusongAdapter }) => yusongAdapter), available: true, creatorAvailable: true },
  { id: SYSTEM_IDS.FEITICEIROS, displayName: "Feiticeiros & Maldições", routeSegment: SYSTEM_ROUTE_SEGMENTS[SYSTEM_IDS.FEITICEIROS], loadEngine: () => import("../../systems/feiticeiros/engine").then(({ feiticeirosEngine }) => feiticeirosEngine), loadAdapter: () => import("../../systems/feiticeiros/adapter.jsx").then(({ feiticeirosAdapter }) => feiticeirosAdapter), available: true, creatorAvailable: false, unavailableReason: "A criação F&M será habilitada pelo pacote FE-06." },
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

export async function loadSystemAdapter(systemId) {
  const definition = getSystem(systemId);
  const adapter = assertSystemAdapter(await definition.loadAdapter());
  if (definition.id !== adapter.id) throw new TypeError(`Adapter inconsistente para ${definition.id}.`);
  return adapter;
}


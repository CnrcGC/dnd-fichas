import { SYSTEM_IDS } from "../../shared/rules/engineContract";

export const SYSTEM_ROUTE_SEGMENTS = Object.freeze({
  [SYSTEM_IDS.DND5E]: "dnd5e",
  [SYSTEM_IDS.YUSONG]: "yusong",
  [SYSTEM_IDS.FEITICEIROS]: "feiticeiros-maldicoes",
});

const SYSTEM_BY_SEGMENT = Object.freeze(Object.fromEntries(
  Object.entries(SYSTEM_ROUTE_SEGMENTS).map(([systemId, segment]) => [segment, systemId]),
));

export function systemPath(systemId, suffix = "") {
  const segment = SYSTEM_ROUTE_SEGMENTS[systemId];
  if (!segment) throw Object.assign(new Error(`Sistema não suportado: ${systemId}.`), { code: "unsupported-system", systemId });
  const normalizedSuffix = String(suffix).replace(/^\/+/, "");
  return normalizedSuffix ? `/${segment}/${normalizedSuffix}` : `/${segment}`;
}

export function getSystemIdFromPath(pathname) {
  const segment = String(pathname).split("/").filter(Boolean)[0];
  return SYSTEM_BY_SEGMENT[segment] ?? null;
}

export function characterPath(systemId, characterId) {
  return systemPath(systemId, `characters/${encodeURIComponent(characterId)}`);
}

export function createSystemRoutes(systemId) {
  return Object.freeze({
    home: systemPath(systemId),
    creator: systemPath(systemId, "characters/new"),
    character: systemPath(systemId, "characters/:id"),
    print: systemPath(systemId, "characters/:id/print"),
    tabletop: systemPath(systemId, "characters/:id/tabletop"),
    creatures: systemPath(systemId, "creatures"),
    encounters: systemPath(systemId, "encounters"),
  });
}


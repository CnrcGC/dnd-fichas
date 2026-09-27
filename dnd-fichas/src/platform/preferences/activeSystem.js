import { getSystem } from "../systems/registry";

export const ACTIVE_SYSTEM_STORAGE_KEY = "rpg-platform:active-system";

export function readActiveSystem(storage = globalThis.localStorage) {
  try {
    const systemId = storage?.getItem(ACTIVE_SYSTEM_STORAGE_KEY);
    if (!systemId) return null;
    getSystem(systemId);
    return systemId;
  } catch {
    return null;
  }
}

export function writeActiveSystem(systemId, storage = globalThis.localStorage) {
  getSystem(systemId);
  try {
    storage?.setItem(ACTIVE_SYSTEM_STORAGE_KEY, systemId);
    return { ok: true, systemId };
  } catch (error) {
    return { ok: false, systemId, error };
  }
}


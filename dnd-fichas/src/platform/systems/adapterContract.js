const REQUIRED_FUNCTIONS = Object.freeze([
  "createDefault",
  "migrate",
  "validate",
  "getSummary",
  "renderLibrary",
  "renderCharacter",
  "renderCreator",
  "renderPrint",
  "getTabletopActions",
]);

export function assertSystemAdapter(adapter) {
  if (!adapter || typeof adapter !== "object") {
    throw new TypeError("O adapter de sistema precisa ser um objeto.");
  }
  if (!adapter.id || !adapter.displayName || !Number.isInteger(adapter.currentSchemaVersion)) {
    throw new TypeError("O adapter não expõe identidade e versão válidas.");
  }
  for (const member of REQUIRED_FUNCTIONS) {
    if (typeof adapter[member] !== "function") {
      throw new TypeError(`O adapter ${adapter.id} não expõe ${member}().`);
    }
  }
  if (!adapter.routes || typeof adapter.routes !== "object" || !Object.isFrozen(adapter.routes)) {
    throw new TypeError(`O adapter ${adapter.id} não expõe rotas imutáveis.`);
  }
  if (!adapter.capabilities || typeof adapter.capabilities !== "object" || !Object.isFrozen(adapter.capabilities)) {
    throw new TypeError(`O adapter ${adapter.id} não expõe capacidades imutáveis.`);
  }
  return adapter;
}


export const SYSTEM_IDS = Object.freeze({
  DND5E: "dnd5e",
  YUSONG: "yusong",
  FEITICEIROS: "feiticeiros-maldicoes",
});

export const ISSUE_LEVELS = Object.freeze({
  STRUCTURAL: "structural",
  ERROR: "error",
  WARNING: "warning",
  INFO: "info",
});

const REQUIRED_METHODS = [
  "createCharacter",
  "migrateCharacter",
  "validateCharacter",
  "deriveCharacter",
  "listValidationIssues",
  "summarize",
];

export function assertSystemEngine(engine) {
  if (!engine || typeof engine !== "object") {
    throw new TypeError("Engine de sistema ausente.");
  }
  if (!Object.values(SYSTEM_IDS).includes(engine.systemId)) {
    throw new TypeError(`Identificador de sistema inválido: ${engine.systemId ?? "ausente"}.`);
  }
  if (!Number.isInteger(engine.currentSchemaVersion) || engine.currentSchemaVersion < 1) {
    throw new TypeError("A versão de schema do engine deve ser um inteiro positivo.");
  }
  for (const method of REQUIRED_METHODS) {
    if (typeof engine[method] !== "function") {
      throw new TypeError(`O engine ${engine.systemId} não implementa ${method}().`);
    }
  }
  if (!engine.commands || typeof engine.commands !== "object") {
    throw new TypeError(`O engine ${engine.systemId} não expõe commands.`);
  }
  return engine;
}

export function commandResult(character, { events = [], warnings = [] } = {}) {
  return Object.freeze({ character, events, warnings });
}

export function validationIssue(level, code, message, path = []) {
  if (!Object.values(ISSUE_LEVELS).includes(level)) {
    throw new TypeError(`Nível de validação inválido: ${level}.`);
  }
  return Object.freeze({ level, code, message, path });
}


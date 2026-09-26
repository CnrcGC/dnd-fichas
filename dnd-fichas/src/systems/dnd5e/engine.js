import { criarFichaVazia, normalizarFicha } from "../../utils/ficha";
import { calcularNivelTotal } from "../../utils/niveis";
import { validarFicha } from "../../utils/validacaoFicha";
import { SYSTEM_IDS, assertSystemEngine } from "../../shared/rules/engineContract";

export const DND5E_SCHEMA_VERSION = 8;

export function migrateDnd5eCharacter(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { ok: false, code: "invalid-legacy-record", input };
  }
  const sourceVersion = Number(input.versaoFicha) || 1;
  if (sourceVersion > DND5E_SCHEMA_VERSION) {
    return { ok: false, code: "future-version", sourceVersion, input };
  }
  const data = normalizarFicha(structuredClone(input));
  return {
    ok: true,
    data,
    schemaVersion: DND5E_SCHEMA_VERSION,
    provenance: { source: "pilares-de-atlas:fichas", sourceVersion, migrations: ["dnd5e:legacy-to-v8"] },
    warnings: [],
  };
}

export const dnd5eEngine = assertSystemEngine({
  systemId: SYSTEM_IDS.DND5E,
  currentSchemaVersion: DND5E_SCHEMA_VERSION,
  createCharacter: ({ displayName } = {}) => criarFichaVazia(displayName),
  migrateCharacter: migrateDnd5eCharacter,
  validateCharacter(character) {
    return Boolean(character && typeof character === "object" && character.versaoFicha === DND5E_SCHEMA_VERSION && character.id);
  },
  deriveCharacter: (character) => normalizarFicha(character),
  listValidationIssues(character) {
    const normalized = normalizarFicha(character);
    const validation = validarFicha(normalized, normalized.atributos);
    return [...(validation.erros ?? []), ...(validation.pendencias ?? []), ...(validation.avisos ?? [])];
  },
  commands: Object.freeze({}),
  diceRequests: Object.freeze({}),
  summarize(character) {
    const normalized = normalizarFicha(character);
    return {
      displayName: normalized.nome,
      level: calcularNivelTotal(normalized),
      status: normalized.estadoProntidao ?? "rascunho",
    };
  },
});


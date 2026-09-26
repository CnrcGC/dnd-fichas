const SYSTEMS = Object.freeze({
  dnd5e: {
    schemaVersion: 8,
    validate: (data) => Boolean(data?.id && data?.nome && data?.versaoFicha === 8),
    summarize: (data) => ({ displayName: data.nome, level: Number(data.nivel) || 1, status: data.estadoFicha ?? "rascunho" }),
  },
  yusong: {
    schemaVersion: 1,
    validate: (data) => Boolean(data?.id && data?.identity?.displayName && data?.schemaVersion === 1),
    summarize: (data) => ({ displayName: data.identity.displayName, level: Number(data.level) || 1 }),
  },
  "feiticeiros-maldicoes": {
    schemaVersion: 1,
    validate: (data) => Boolean(data?.id && data?.identity?.displayName && data?.schemaVersion === 1 && data?.rulesEdition === "2.5.2"),
    summarize: (data) => ({ displayName: data.identity.displayName, level: Number(data.progression?.level) || 1 }),
  },
});

export function validateSystemPayload(systemId, schemaVersion, data) {
  const system = SYSTEMS[systemId];
  if (!system) return { ok: false, code: "unsupported-system" };
  if (schemaVersion > system.schemaVersion) return { ok: false, code: "unsupported-future-version" };
  if (schemaVersion !== system.schemaVersion || !system.validate(data)) return { ok: false, code: "invalid-system-data" };
  return { ok: true, summary: system.summarize(data) };
}


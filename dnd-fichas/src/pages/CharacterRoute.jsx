import { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { useFichas } from "../context/useFichas";
import { IndexedDbCharacterRepository, openPlatformDatabase } from "../platform/persistence/characterRepository";
import { migrateEnvelopeRecord } from "../platform/persistence/migrationPolicy";
import { characterPath } from "../platform/routing/routes";
import PlatformRouteState from "./PlatformRouteState";

function exportReadOnlyRecord(readOnly, id) {
  const url = URL.createObjectURL(new Blob([readOnly.originalExport], { type: "application/json" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `${id}-versao-futura.json`;
  link.click();
  URL.revokeObjectURL(url);
}

export default function CharacterRoute({ destination = "character" }) {
  const { id } = useParams();
  const { obterFicha } = useFichas();
  const legacyDnd = obterFicha(id);
  const [state, setState] = useState({ status: "loading" });

  useEffect(() => {
    if (legacyDnd) return undefined;
    let active = true;
    let database;
    openPlatformDatabase()
      .then((opened) => {
        database = opened;
        return new IndexedDbCharacterRepository(opened).get(id);
      })
      .then(async (record) => {
        if (!active) return;
        if (!record) {
          setState({ status: "not-found" });
          return;
        }
        const result = await migrateEnvelopeRecord(record);
        if (!active) return;
        if (result.ok) setState({ status: "resolved", systemId: result.envelope.systemId });
        else setState({ status: "failed", result });
      })
      .catch((error) => active && setState({ status: "failed", result: { code: error?.code ?? "migration-failed" } }))
      .finally(() => database?.close());
    return () => { active = false; };
  }, [id, legacyDnd]);

  if (legacyDnd) {
    const suffix = destination === "tabletop" ? "/tabletop" : "";
    return <Navigate to={`${characterPath("dnd5e", id)}${suffix}`} replace />;
  }
  if (state.status === "resolved") {
    const suffix = destination === "tabletop" ? "/tabletop" : "";
    return <Navigate to={`${characterPath(state.systemId, id)}${suffix}`} replace />;
  }
  if (state.status === "loading") {
    return <PlatformRouteState title="Localizando personagem" description="Verificando o envelope local antes de abrir o sistema responsável." status="loading" />;
  }
  if (state.status === "not-found") {
    return <PlatformRouteState title="Personagem não encontrado" description="O registro solicitado não existe neste dispositivo ou foi removido." />;
  }
  const { result } = state;
  if (result.mode === "read-only") {
    return (
      <PlatformRouteState title="Versão mais recente do que este aplicativo" description="O personagem não será alterado. Você pode exportar o registro original para preservá-lo.">
        <button type="button" onClick={() => exportReadOnlyRecord(result.readOnly, id)}>Exportar registro original</button>
      </PlatformRouteState>
    );
  }
  if (result.code === "unsupported-system") {
    return <PlatformRouteState title="Sistema não suportado" description="O personagem pertence a um sistema que esta versão da plataforma não reconhece." />;
  }
  if (result.code === "invalid-envelope" || result.code === "migration-validation-failed") {
    return <PlatformRouteState title="Registro corrompido" description="O envelope do personagem é inválido. Nenhum dado foi sobrescrito." />;
  }
  return <PlatformRouteState title="Falha na migração" description="O personagem não pôde ser validado ou migrado. O registro original foi preservado." />;
}


import { useEffect, useState } from "react";
import { loadSystemAdapter } from "../platform/systems/registry";
import PlatformRouteState from "./PlatformRouteState";

const RENDERERS = Object.freeze({
  library: "renderLibrary",
  creator: "renderCreator",
  character: "renderCharacter",
  print: "renderPrint",
});

export default function SystemRouteView({ systemId, view }) {
  const [state, setState] = useState({ systemId, status: "loading" });

  useEffect(() => {
    let active = true;
    loadSystemAdapter(systemId)
      .then((adapter) => active && setState({ systemId, status: "ready", adapter }))
      .catch((error) => active && setState({ systemId, status: "error", error }));
    return () => { active = false; };
  }, [systemId]);

  if (state.systemId !== systemId || state.status === "loading") {
    return <PlatformRouteState title="Carregando seção" description="Preparando somente os recursos deste sistema." status="loading" />;
  }
  if (state.status === "error") {
    const unsupported = state.error?.code === "unsupported-system";
    return <PlatformRouteState title={unsupported ? "Sistema não suportado" : "Não foi possível abrir o sistema"} description={unsupported ? "O identificador informado não pertence a um sistema registrado." : "O módulo deste sistema falhou ao carregar. Seus dados não foram alterados."} />;
  }

  const renderer = state.adapter[RENDERERS[view]];
  if (typeof renderer !== "function") {
    return <PlatformRouteState title="Rota indisponível" description="Este sistema não oferece a tela solicitada." />;
  }
  return renderer();
}


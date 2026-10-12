import { useEffect, useState } from "react";
import { loadSystemAdapter } from "../platform/systems/registry";
import PlatformRouteState from "./PlatformRouteState";
import { useFichas } from "../context/useFichas";
import CharacterRoute from "./CharacterRoute";
import { useParams } from "react-router-dom";

const RENDERERS = Object.freeze({
  library: "renderLibrary",
  creator: "renderCreator",
  character: "renderCharacter",
  print: "renderPrint",
});

export default function SystemRouteView({ systemId, view }) {
  const { hidratacao, fichasProtegidas } = useFichas();
  const { id } = useParams();
  const [state, setState] = useState({ systemId, status: "loading" });

  useEffect(() => {
    let active = true;
    loadSystemAdapter(systemId)
      .then((adapter) => active && setState({ systemId, status: "ready", adapter }))
      .catch((error) => active && setState({ systemId, status: "error", error }));
    return () => { active = false; };
  }, [systemId]);

  if (systemId === "dnd5e" && hidratacao !== "pronto") {
    return <PlatformRouteState title={hidratacao === "falhou" ? "Não foi possível carregar as fichas" : "Carregando fichas"} description={hidratacao === "falhou" ? "Seus registros foram preservados. Use Tentar novamente no aviso de armazenamento." : "Aguarde a leitura do armazenamento local antes de criar ou editar."} status={hidratacao === "falhou" ? undefined : "loading"} />;
  }
  if (systemId === "dnd5e" && id && fichasProtegidas.some((record) => record.id === id)) {
    return <CharacterRoute />;
  }

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


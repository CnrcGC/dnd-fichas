import { Navigate, useParams } from "react-router-dom";
import { readActiveSystem } from "../platform/preferences/activeSystem";
import { characterPath, systemPath } from "../platform/routing/routes";

export function LegacyDndCharacterRedirect() {
  const { id } = useParams();
  return <Navigate to={characterPath("dnd5e", id)} replace />;
}

export function ActiveSystemRedirect({ suffix = "" }) {
  const systemId = readActiveSystem();
  return <Navigate to={systemId ? systemPath(systemId, suffix) : "/"} replace />;
}


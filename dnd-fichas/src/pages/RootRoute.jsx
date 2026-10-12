import { Navigate } from "react-router-dom";
import { readActiveSystem } from "../platform/preferences/activeSystem";
import { systemPath } from "../platform/routing/routes";

export default function RootRoute() {
  const activeSystem = readActiveSystem() ?? "dnd5e";
  return <Navigate to={systemPath(activeSystem)} replace />;
}


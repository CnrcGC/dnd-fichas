import { Navigate } from "react-router-dom";
import { readActiveSystem } from "../platform/preferences/activeSystem";
import { systemPath } from "../platform/routing/routes";
import SystemSelector from "./SystemSelector";

export default function RootRoute() {
  const activeSystem = readActiveSystem();
  return activeSystem
    ? <Navigate to={systemPath(activeSystem)} replace />
    : <SystemSelector purpose="section" />;
}


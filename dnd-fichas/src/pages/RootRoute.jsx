import { Navigate } from "react-router-dom";
import { systemPath } from "../platform/routing/routes";

export default function RootRoute() {
  return <Navigate to={systemPath("dnd5e")} replace />;
}


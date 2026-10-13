import { lazy, Suspense } from "react";
import PlatformRouteState from "./PlatformRouteState";

const NovaFicha = lazy(() => import("./NovaFicha"));

export default function LazyNovaFicha() {
  return <Suspense fallback={<PlatformRouteState title="Carregando criação" description="Preparando as escolhas do personagem." status="loading" />}><NovaFicha /></Suspense>;
}

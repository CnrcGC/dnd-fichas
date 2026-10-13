import { lazy, Suspense } from "react";

const Provider = lazy(() => import("./FichasContext.jsx").then((module) => ({ default: module.FichasProvider })));

export default function LazyFichasProvider({ children }) {
  return <Suspense fallback={<main className="app-main"><h1>Carregando D&amp;D Fichas</h1><p role="status">Preparando suas fichas neste dispositivo.</p></main>}><Provider>{children}</Provider></Suspense>;
}

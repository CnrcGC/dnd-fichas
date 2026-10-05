import { Suspense, lazy } from "react";
import App from "./App.jsx";
import { RolagemProvider } from "./context/RolagemProvider.jsx";

const FichasProvider = lazy(() =>
  import("./context/FichasContext.jsx").then((module) => ({
    default: module.FichasProvider,
  }))
);

export default function AppBootstrap() {
  return (
    <Suspense
      fallback={
        <main className="app-main" id="conteudo-principal">
          <p role="status">Carregando aplicação...</p>
        </main>
      }
    >
      <FichasProvider>
        <RolagemProvider>
          <App />
        </RolagemProvider>
      </FichasProvider>
    </Suspense>
  );
}
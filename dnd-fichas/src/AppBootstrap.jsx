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
    <>
      <a className="skip-link" href="#conteudo-principal">
        Pular para o conteúdo principal
      </a>

      <Suspense
        fallback={
          <main
            className="app-main"
            id="conteudo-principal"
            tabIndex="-1"
          >
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
    </>
  );
}
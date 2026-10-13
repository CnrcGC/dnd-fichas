import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import FichasProvider from "./context/LazyFichasProvider.jsx";
import { RolagemProvider } from "./context/RolagemProvider.jsx";
import { restorePagesRoute } from "./platform/routing/pages.js";
import "./styles/index.css";

restorePagesRoute(window, import.meta.env.BASE_URL);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <FichasProvider>
        <RolagemProvider>
          <App />
        </RolagemProvider>
      </FichasProvider>
    </BrowserRouter>
  </StrictMode>
);

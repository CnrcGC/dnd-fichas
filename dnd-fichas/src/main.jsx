import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import AppBootstrap from "./AppBootstrap.jsx";
import "./styles/index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AppBootstrap />
    </BrowserRouter>
  </StrictMode>
);
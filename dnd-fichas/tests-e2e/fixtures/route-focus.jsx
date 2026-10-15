import { createRoot } from "react-dom/client";
import { MemoryRouter, useLocation, useNavigate } from "react-router-dom";
import RouteAccessibility from "../../src/components/layout/RouteAccessibility.jsx";

export default function Fixture() {
  const navigate = useNavigate();
  const location = useLocation();
  return <>
    <RouteAccessibility />
    <a className="skip-link" href="#conteudo-principal" onFocus={() => navigate("/dnd5e", { replace: true })}>Pular para o conteúdo principal</a>
    <a href="/dnd5e" onClick={(event) => { event.preventDefault(); navigate("/dnd5e", { replace: true }); }}>Abrir biblioteca</a>
    <main id="conteudo-principal" data-path={location.pathname}><h1>Biblioteca pronta</h1></main>
  </>;
}

createRoot(document.getElementById("root")).render(<MemoryRouter><Fixture /></MemoryRouter>);

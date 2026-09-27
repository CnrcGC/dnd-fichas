import { NavLink, useLocation, useMatch } from "react-router-dom";
import { useFichas } from "../../context/useFichas";
import { getSystemIdFromPath, systemPath } from "../../platform/routing/routes";
import { getSystem } from "../../platform/systems/registry";
import "./Topbar.css";
import ThemeControl from "./ThemeControl";
import SystemSwitcher from "./SystemSwitcher";

export default function Topbar() {
  const location = useLocation();
  const activeSystemId = getSystemIdFromPath(location.pathname);
  const activeSystem = activeSystemId ? getSystem(activeSystemId) : null;
  const match = useMatch("/dnd5e/characters/:id");
  const { obterFicha } = useFichas();
  const fichaAtual = match ? obterFicha(match.params.id) : null;

  return (
    <header className="topbar">
      <NavLink to="/" className="topbar-brand">
        <span className="topbar-platform-name">Plataforma RPG</span>
      </NavLink>

      <SystemSwitcher />

      <nav className="topbar-nav" aria-label={activeSystem ? `Navegação de ${activeSystem.displayName}` : "Navegação principal"}>
        <NavLink
          to={activeSystem ? systemPath(activeSystem.id) : "/"}
          end
          className={({ isActive }) =>
            isActive ? "topbar-link is-active" : "topbar-link"
          }
        >
          {activeSystem ? "Personagens" : "Sistemas"}
        </NavLink>
        {activeSystem && <>
          <NavLink to={systemPath(activeSystem.id, "characters/new")} className={({ isActive }) => isActive ? "topbar-link is-active" : "topbar-link"}>Novo personagem</NavLink>
          <NavLink to={systemPath(activeSystem.id, "creatures")} className={({ isActive }) => isActive ? "topbar-link is-active" : "topbar-link"}>Criaturas</NavLink>
          <NavLink to={systemPath(activeSystem.id, "encounters")} className={({ isActive }) => isActive ? "topbar-link is-active" : "topbar-link"}>Encontros</NavLink>
        </>}
        {fichaAtual && (
          <span className="topbar-ficha-atual">{fichaAtual.nome}</span>
        )}
      </nav>
      <ThemeControl />
    </header>
  );
}

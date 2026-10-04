import { NavLink, useMatch } from "react-router-dom";
import { useFichas } from "../../context/useFichas";
import { systemPath } from "../../platform/routing/routes";
import "./Topbar.css";
import ThemeControl from "./ThemeControl";

export default function Topbar() {
  const match = useMatch("/dnd5e/characters/:id");
  const { obterFicha } = useFichas();
  const fichaAtual = match ? obterFicha(match.params.id) : null;

  return (
    <header className="topbar">
      <NavLink to="/" className="topbar-brand">
        <span className="topbar-platform-name">D&amp;D Fichas</span>
      </NavLink>

      <nav className="topbar-nav" aria-label="Navegação D&D 5e">
        <NavLink
          to={systemPath("dnd5e")}
          end
          className={({ isActive }) =>
            isActive ? "topbar-link is-active" : "topbar-link"
          }
        >
          Personagens
        </NavLink>
        <NavLink
          to={systemPath("dnd5e", "characters/new")}
          className={({ isActive }) => isActive ? "topbar-link is-active" : "topbar-link"}
        >
          Novo personagem
        </NavLink>
        {fichaAtual && (
          <span className="topbar-ficha-atual">{fichaAtual.nome}</span>
        )}
      </nav>
      <ThemeControl />
    </header>
  );
}

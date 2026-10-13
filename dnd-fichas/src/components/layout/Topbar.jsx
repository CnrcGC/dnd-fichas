import { NavLink, useMatch } from "react-router-dom";
import { useFichas } from "../../context/useFichas";
import { systemPath } from "../../platform/routing/routes";
import "./Topbar.css";
import ThemeControl from "./ThemeControl";
import PreferencesControl from "./PreferencesControl";

export default function Topbar() {
  const match = useMatch("/dnd5e/characters/:id");
  const { obterFicha } = useFichas();
  const fichaAtual = match ? obterFicha(match.params.id) : null;

  return (
    <header className="topbar">
      <NavLink to="/" className="topbar-brand">
        <img className="topbar-dnd-logo" src={`${import.meta.env.BASE_URL}logo-dd-fichas.png`} alt="" />
        <span className="topbar-brand-text"><span className="topbar-platform-name">D&amp;D Fichas</span><span className="topbar-brand-caption">Grimório de aventureiro</span></span>
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
      <div className="topbar-preferences"><PreferencesControl /><ThemeControl compact /></div>
    </header>
  );
}

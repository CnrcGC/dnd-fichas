import { NavLink, useMatch } from "react-router-dom";
import { useFichas } from "../../context/useFichas";
import "./Topbar.css";
import ThemeControl from "./ThemeControl";

export default function Topbar() {
  const match = useMatch("/ficha/:id");
  const { obterFicha } = useFichas();
  const fichaAtual = match ? obterFicha(match.params.id) : null;

  return (
    <header className="topbar">
      <NavLink to="/" className="topbar-brand">
        <img src="/logo-dd-fichas.png" alt="D&D Fichas" className="topbar-logo" />
      </NavLink>

      <nav className="topbar-nav">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            isActive ? "topbar-link is-active" : "topbar-link"
          }
        >
          Início
        </NavLink>
        <NavLink to="/characters/new" className={({ isActive }) => isActive ? "topbar-link is-active" : "topbar-link"}>
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

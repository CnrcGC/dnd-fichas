import { Link } from "react-router-dom";
import { listSystems } from "../platform/systems/registry";
import { writeActiveSystem } from "../platform/preferences/activeSystem";
import { systemPath } from "../platform/routing/routes";

const descriptions = {
  dnd5e: "Criação guiada e ficha completa para D&D 5e (2014).",
  yusong: "Criação de identidade e biblioteca local disponíveis; os demais painéis da ficha estão em migração.",
  "feiticeiros-maldicoes": "Engine em construção com rastreabilidade para a edição 2.5.2.",
};

export default function SystemSelector({ purpose = "create" }) {
  const selectingSection = purpose === "section";
  return (
    <section className="platform-page" aria-labelledby="system-selector-title">
      <div>
        <h1 id="system-selector-title">{selectingSection ? "Escolha um sistema" : "Novo personagem"}</h1>
        <p className="platform-page-copy">{selectingSection ? "Cada RPG possui sua própria biblioteca, criação, fichas e ferramentas dentro da mesma plataforma." : "Escolha o sistema. Cada ficha mantém regras e dados próprios, sem conversão automática entre jogos."}</p>
      </div>
      <div className="system-selector">
        {listSystems().map((system) => {
          const creationAvailable = system.creatorAvailable;
          const target = selectingSection ? systemPath(system.id) : systemPath(system.id, "characters/new");
          return (
          <article key={system.id} className="system-option" data-system={system.id}>
            <h2>{system.displayName}</h2>
            <p>{descriptions[system.id]}</p>
            {selectingSection || creationAvailable ? (
              <Link className="home-nova-ficha" to={target} onClick={() => writeActiveSystem(system.id)}>
                {selectingSection ? `Abrir ${system.displayName}` : `Criar em ${system.displayName}`}
              </Link>
            ) : (
              <div>
                <p className="system-option-status">Criação indisponível nesta etapa: {system.unavailableReason}</p>
                <Link to={systemPath(system.id)} onClick={() => writeActiveSystem(system.id)}>Abrir seção do sistema</Link>
              </div>
            )}
          </article>
        );})}
      </div>
    </section>
  );
}


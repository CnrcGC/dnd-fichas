import { Link } from "react-router-dom";
import { listSystems } from "../platform/systems/registry";

const descriptions = {
  dnd5e: "Criação guiada e ficha completa para D&D 5e (2014).",
  yusong: "Compatibilidade preparada; a interface de origem ainda precisa ser incorporada.",
  "feiticeiros-maldicoes": "Engine em construção com rastreabilidade para a edição 2.5.2.",
};

export default function SystemSelector() {
  return (
    <section className="platform-page" aria-labelledby="system-selector-title">
      <div>
        <h1 id="system-selector-title">Novo personagem</h1>
        <p className="platform-page-copy">Escolha o sistema. Cada ficha mantém regras e dados próprios, sem conversão automática entre jogos.</p>
      </div>
      <div className="system-selector">
        {listSystems().map((system) => (
          <article key={system.id} className="system-option" data-system={system.id} aria-disabled={!system.available}>
            <h2>{system.displayName}</h2>
            <p>{descriptions[system.id]}</p>
            {system.available ? (
              <Link className="home-nova-ficha" to="/nova">Criar em {system.displayName}</Link>
            ) : (
              <p className="system-option-status" role="status">Indisponível nesta etapa: {system.unavailableReason}</p>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}


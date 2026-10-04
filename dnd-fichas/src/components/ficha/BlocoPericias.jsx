import { useState } from "react";
import { PERICIAS } from "../../data/pericias";
import { ATRIBUTOS, formatarModificador } from "../../utils/dnd";
import { useRolagem } from "../../context/useRolagem";
import "./BlocoPericias.css";
import Icon from "../icons/Icon";

export default function BlocoPericias({
  modificadoresAtributos,
  pericias,
  bonusProficiencia,
  onTogglePericia,
  especializacoes = new Set(),
}) {
  const [expandidas, setExpandidas] = useState(() => new Set());
  const { registrarRolagem, rolarD20 } = useRolagem();

  function alternarExpandida(chave) {
    setExpandidas((atual) => {
      const proxima = new Set(atual);
      if (proxima.has(chave)) {
        proxima.delete(chave);
      } else {
        proxima.add(chave);
      }
      return proxima;
    });
  }

  return (
    <section>
      <h3 className="bloco-titulo">Perícias</h3>
      <ul className="pericias-lista">
        {PERICIAS.map((pericia) => {
          const proficiente = Boolean(pericias[pericia.chave]);
          const especializado = especializacoes.has(pericia.chave);
          const atributo = ATRIBUTOS.find((a) => a.chave === pericia.atributo);
          const modificadorAtributo = modificadoresAtributos[pericia.atributo];
          const modificador =
            modificadorAtributo + (proficiente ? bonusProficiencia * (especializado ? 2 : 1) : 0);
          const aberta = expandidas.has(pericia.chave);

          function handleRolar(evento) {
            evento.stopPropagation();
            const resultado = rolarD20(modificador);
            registrarRolagem(`Perícia: ${pericia.label}`, resultado, "d20");
          }

          return (
            <li key={pericia.chave} className="pericia-item">
              <div className="pericia-linha">
                <label
                  className="pericia-checkbox-label"
                  onClick={(evento) => evento.stopPropagation()}
                >
                  <input
                    type="checkbox"
                    checked={proficiente}
                    aria-label={`Proficiência em ${pericia.label}`}
                    onChange={() => onTogglePericia(pericia.chave)}
                  />
                </label>
                <button
                  type="button"
                  className="pericia-botao-expandir"
                  onClick={() => alternarExpandida(pericia.chave)}
                  aria-expanded={aberta}
                >
                  <span className="pericia-nome">{pericia.label}</span>
                  <span className="pericia-atributo">({atributo?.abreviacao})</span>
                  <span className={aberta ? "pericia-seta is-aberta" : "pericia-seta"}>
                    <Icon name="chevron" className="ui-icon--chevron" />
                  </span>
                </button>
                <button
                  type="button"
                  className="pericia-modificador-botao"
                  onClick={handleRolar}
                  title={`Rolar ${pericia.label} (d20${formatarModificador(modificador)})`}
                >
                  <Icon name="dice" /> {formatarModificador(modificador)}
                </button>
              </div>

              {aberta && (
                <div className="pericia-detalhe">
                  <span>
                    Modificador de {atributo?.label}: {formatarModificador(modificadorAtributo)}
                  </span>
                  <span>
                    Bônus de proficiência: {proficiente
                      ? `${formatarModificador(bonusProficiencia * (especializado ? 2 : 1))}${especializado ? " (Especialização)" : ""}`
                      : "não treinada"}
                  </span>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

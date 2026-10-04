import { ATRIBUTOS, formatarModificador } from "../../utils/dnd";
import { useRolagem } from "../../context/useRolagem";
import "./BlocoSalvaguardas.css";
import Icon from "../icons/Icon";

export default function BlocoSalvaguardas({
  modificadoresAtributos,
  salvaguardasProficientes,
  bonusProficiencia,
  bonusItens = 0,
}) {
  const { registrarRolagem, rolarD20 } = useRolagem();

  return (
    <section>
      <h3 className="bloco-titulo">Salvaguardas</h3>
      {!salvaguardasProficientes && (
        <p className="salvaguardas-aviso">
          Escolha uma classe para ver as salvaguardas proficientes.
        </p>
      )}
      <ul className="salvaguardas-lista">
        {ATRIBUTOS.map((atributo) => {
          const proficiente = salvaguardasProficientes?.includes(
            atributo.chave
          );
          const modificador =
            modificadoresAtributos[atributo.chave] +
            (proficiente ? bonusProficiencia : 0) +
            bonusItens;

          function handleRolar() {
            const resultado = rolarD20(modificador);
            registrarRolagem(`Salvaguarda: ${atributo.label}`, resultado, "d20");
          }

          return (
            <li key={atributo.chave} className="salvaguarda-item">
              <span
                className={
                  proficiente
                    ? "salvaguarda-marcador is-proficiente"
                    : "salvaguarda-marcador"
                }
                aria-hidden="true"
              />
              <span className="salvaguarda-label">
                {atributo.label}
                {proficiente && <span className="visually-hidden"> (proficiente)</span>}
              </span>
              <button
                type="button"
                className="salvaguarda-modificador-botao"
                onClick={handleRolar}
                title={`Rolar salvaguarda de ${atributo.label} (d20${formatarModificador(modificador)})`}
              >
                <Icon name="dice" /> {formatarModificador(modificador)}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

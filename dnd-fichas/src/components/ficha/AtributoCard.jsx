import { calcularModificador, formatarModificador } from "../../utils/dnd";
import { useRolagem } from "../../context/useRolagem";
import { limitarAtributo } from "../../utils/atributos";
import "./AtributoCard.css";

export default function AtributoCard({
  label,
  abreviacao,
  valor,
  bonusRacial = 0,
  onChange,
}) {
  const { registrarRolagem, rolarD20 } = useRolagem();
  const total = valor + bonusRacial;
  const modificador = calcularModificador(total);

  function handleChange(evento) {
    const novoValor = Number(evento.target.value);
    if (evento.target.value !== "") onChange(limitarAtributo(novoValor, bonusRacial, valor));
  }

  function handleRolar() {
    const resultado = rolarD20(modificador);
    registrarRolagem(`Teste de ${label}`, resultado, "d20");
  }

  return (
    <div className="atributo-card">
      <span className="atributo-label">{label}</span>
      <input
        className="atributo-input"
        type="number"
        min="1"
        max={30 - bonusRacial}
        value={valor}
        onChange={handleChange}
        aria-label={`Valor base de ${label}`}
      />
      {bonusRacial !== 0 && (
        <span className="atributo-bonus">
          {formatarModificador(bonusRacial)} racial &rarr; total {total}
        </span>
      )}
            <button
              type="button"
              className="atributo-modificador"
              onClick={handleRolar}
              aria-label={`Rolar teste de ${label} (${formatarModificador(modificador)})`}
              title={`Rolar teste de ${label} (d20${formatarModificador(modificador)})`}
            >
              {formatarModificador(modificador)}
            </button>
      <span className="atributo-abreviacao">{abreviacao}</span>
    </div>
  );
}

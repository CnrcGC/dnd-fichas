import { xpParaProximoNivel, progressoXp } from "../../utils/xp";
import "./BlocoProgressao.css";
import Icon from "../icons/Icon";

export default function BlocoProgressao({ progressao, nivelTotal, onChangeModo, onChangeXp }) {
  const modo = progressao?.modo ?? "marco";
  const xpAtual = progressao?.xpAtual ?? 0;

  function handleChangeXpInput(evento) {
    const valor = Number(evento.target.value);
    onChangeXp(Number.isNaN(valor) ? 0 : Math.max(0, valor));
  }

  const limiarProximo = xpParaProximoNivel(nivelTotal);
  const { faltam, percentual } = progressoXp(xpAtual, nivelTotal);
  const prontoPraSubir = modo === "xp" && limiarProximo != null && xpAtual >= limiarProximo;

  return (
    <section className="bloco-progressao">
      <h4 className="bloco-progressao-titulo">Progressão</h4>

      <div className="progressao-modo-toggle">
        <button
          type="button"
          className={modo === "marco" ? "progressao-modo-botao is-ativo" : "progressao-modo-botao"}
          onClick={() => onChangeModo("marco")}
          aria-pressed={modo === "marco"}
        >
          Marco
        </button>
        <button
          type="button"
          className={modo === "xp" ? "progressao-modo-botao is-ativo" : "progressao-modo-botao"}
          onClick={() => onChangeModo("xp")}
          aria-pressed={modo === "xp"}
        >
          XP
        </button>
      </div>

      {modo === "marco" ? (
        <p className="progressao-texto">
          O mestre decide quando o grupo sobe de nível. Use o botão "Subir de
          Nível" sempre que a mesa combinar.
        </p>
      ) : (
        <div className="progressao-xp">
          <label className="progressao-xp-campo">
            <span>XP atual</span>
            <input
              type="number"
              min="0"
              className="progressao-xp-input"
              value={xpAtual}
              onChange={handleChangeXpInput}
            />
          </label>

          {limiarProximo != null ? (
            <>
              <div
                className="progressao-xp-barra"
                role="progressbar"
                aria-label="Progresso para o próximo nível"
                aria-valuemin="0"
                aria-valuemax="100"
                aria-valuenow={Math.round(percentual)}
              >
                <div className="progressao-xp-barra-preenchida" style={{ width: `${percentual}%` }} />
              </div>
              <p className="progressao-texto">
                Faltam <strong>{faltam}</strong> XP para o próximo nível ({limiarProximo} no total).
              </p>
            </>
          ) : (
            <p className="progressao-texto">Nível máximo (20) já alcançado.</p>
          )}

          {prontoPraSubir && (
            <p className="progressao-pronto">
              <Icon name="levelUp" /> XP suficiente — pode usar "Subir de Nível" quando quiser.
            </p>
          )}
        </div>
      )}
    </section>
  );
}

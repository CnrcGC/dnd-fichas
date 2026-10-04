import { useState } from "react";
import { useRolagem } from "../../context/useRolagem";
import Icon from "../icons/Icon";
import "./PainelRolagens.css";

function ResumoD20({ resultado }) {
  const critico = resultado.d20 === 20;
  const desastre = resultado.d20 === 1;
  return (
    <span className="rolagem-resumo">
      <span
      className={
        critico
          ? "rolagem-total is-critico"
          : desastre
          ? "rolagem-total is-desastre"
          : "rolagem-total"
      }
    >
        {resultado.total}
      </span>
      {(critico || desastre) && (
        <span className={critico ? "rolagem-estado is-critico" : "rolagem-estado is-desastre"}>
          {critico ? "Crítico" : "Falha crítica"}
        </span>
      )}
    </span>
  );
}

function DetalheRolagem({ rolagem }) {
  const { tipo, resultado } = rolagem;

  if (tipo === "d20") {
    const critico = resultado.d20 === 20;
    const desastre = resultado.d20 === 1;
    return (
      <p className="rolagem-detalhe-texto">
        {resultado.rolagens?.length > 1
          ? `d20 [${resultado.rolagens.join(", ")}] → `
          : "d20: "}
        <span
          className={
            critico ? "is-critico" : desastre ? "is-desastre" : ""
          }
        >
          {resultado.d20}
        </span>{" "}
        {(critico || desastre) && (
          <span className={critico ? "rolagem-estado is-critico" : "rolagem-estado is-desastre"}>
            {critico ? "Crítico" : "Falha crítica"}
          </span>
        )}{" "}
        {resultado.modificador >= 0 ? "+" : ""}
        {resultado.modificador} = <strong>{resultado.total}</strong>
      </p>
    );
  }

  return (
    <p className="rolagem-detalhe-texto">
      {resultado.detalhes
        .map((d) =>
          d.rolagens.length > 0
            ? `${d.texto} [${d.rolagens.join(", ")}]`
            : d.texto
        )
        .join(" + ")}{" "}
      = <strong>{resultado.total}</strong>
    </p>
  );
}

export default function PainelRolagens() {
  const {
    rolagens,
    limparHistorico,
    vantagem,
    desvantagem,
    setVantagem,
    setDesvantagem,
  } = useRolagem();
  const [expandido, setExpandido] = useState(false);
  const ultima = rolagens[0];
  const modo = vantagem && desvantagem
    ? "Normal (canceladas)"
    : vantagem
    ? "Vantagem"
    : desvantagem
    ? "Desvantagem"
    : "Normal";
  const anuncioUltima = ultima
    ? `${ultima.titulo}: resultado ${ultima.resultado.total}${
        ultima.tipo === "d20" && ultima.resultado.d20 === 20
          ? ", crítico"
          : ultima.tipo === "d20" && ultima.resultado.d20 === 1
          ? ", falha crítica"
          : ""
      }.`
    : "";

  return (
    <div className={expandido ? "painel-rolagens is-expandido" : "painel-rolagens"}>
      <p className="visually-hidden" role="status" aria-live="polite" aria-atomic="true">
        {anuncioUltima}
      </p>
      <button
        type="button"
        className="painel-rolagens-toggle"
        onClick={() => setExpandido((atual) => !atual)}
        aria-expanded={expandido}
        aria-controls="painel-rolagens-historico"
      >
        <span className="painel-rolagens-icone" aria-hidden="true">
          <Icon name="dice" size={20} />
        </span>
        <span className="painel-rolagens-titulo">{ultima?.titulo ?? `d20: ${modo}`}</span>
        {ultima?.tipo === "d20" ? (
          <ResumoD20 resultado={ultima.resultado} />
        ) : ultima ? (
          <span className="rolagem-total">{ultima.resultado.total}</span>
        ) : <span className="rolagem-modo-resumo">{modo}</span>}
      </button>

      {expandido && (
        <div className="painel-rolagens-lista" id="painel-rolagens-historico">
          <fieldset className="painel-rolagens-modo">
            <legend>Modo das próximas rolagens d20</legend>
            <label>
              <input type="checkbox" checked={vantagem} onChange={(evento) => setVantagem(evento.target.checked)} />
              Vantagem
            </label>
            <label>
              <input type="checkbox" checked={desvantagem} onChange={(evento) => setDesvantagem(evento.target.checked)} />
              Desvantagem
            </label>
            {vantagem && desvantagem && <small>As duas se cancelam: será rolado um único d20.</small>}
          </fieldset>
          {rolagens.map((rolagem) => (
            <div key={rolagem.id} className="item-rolagem">
              <div className="item-rolagem-cabecalho">
                <span className="item-rolagem-titulo">{rolagem.titulo}</span>
              </div>
              <DetalheRolagem rolagem={rolagem} />
            </div>
          ))}
          {rolagens.length > 0 && (
            <button
              type="button"
              className="painel-rolagens-limpar"
              onClick={limparHistorico}
            >
              Limpar histórico
            </button>
          )}
        </div>
      )}
    </div>
  );
}

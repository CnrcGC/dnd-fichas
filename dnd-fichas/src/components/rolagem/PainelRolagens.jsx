import { useEffect, useRef, useState } from "react";
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
  const painelRef = useRef(null);
  const toggleRef = useRef(null);
  useEffect(() => {
    if (!expandido) return;
    function protegerFoco(evento) {
      const painel = painelRef.current;
      const alvo = evento.target;
      if (!painel || !(alvo instanceof HTMLElement) || painel.contains(alvo)) return;
      const foco = alvo.getBoundingClientRect();
      const caixa = painel.getBoundingClientRect();
      const esquerda = Math.max(foco.left, caixa.left);
      const direita = Math.min(foco.right, caixa.right);
      const topo = Math.max(foco.top, caixa.top);
      const base = Math.min(foco.bottom, caixa.bottom);
      if (esquerda >= direita || topo >= base) return;
      if (!painel.contains(document.elementFromPoint((esquerda + direita) / 2, (topo + base) / 2))) return;
      setExpandido(false);
      requestAnimationFrame(() => alvo.isConnected && alvo.scrollIntoView({ block: "center", behavior: "instant" }));
    }
    document.addEventListener("focusin", protegerFoco);
    return () => document.removeEventListener("focusin", protegerFoco);
  }, [expandido]);
  const ultima = rolagens[0];
  const modo = vantagem && desvantagem
    ? "Normal (canceladas)"
    : vantagem
    ? "Vantagem"
    : desvantagem
    ? "Desvantagem"
    : "Normal";
  return (
    <>
    <div ref={painelRef} className={expandido ? "painel-rolagens is-expandido" : "painel-rolagens"} onKeyDown={(evento) => {
      if (evento.key === "Escape" && expandido) {
        evento.stopPropagation();
        setExpandido(false);
        toggleRef.current?.focus();
      }
    }}>
      <p className="visually-hidden" role="status" aria-live="polite" aria-atomic="true">
        {ultima ? <span key={ultima.id}>{`${ultima.titulo}. Resultado ${ultima.resultado.total}.${ultima.tipo === "d20" && ultima.resultado.d20 === 20 ? " Crítico." : ultima.tipo === "d20" && ultima.resultado.d20 === 1 ? " Falha crítica." : ""}`}</span> : ""}
      </p>
      <button
        type="button"
        className="painel-rolagens-toggle"
        ref={toggleRef}
        aria-expanded={expandido}
        aria-controls="painel-rolagens-historico"
        onClick={() => setExpandido((atual) => !atual)}
      >
        <span className="painel-rolagens-icone" aria-hidden="true">
          <Icon name="dice" size={20} />
        </span>
        <span className="painel-rolagens-chamada">
          <span className="painel-rolagens-legenda">{ultima ? "Última rolagem" : "Dados da mesa"}</span>
          <span className="painel-rolagens-titulo">{ultima?.titulo ?? `d20: ${modo}`}</span>
        </span>
        {ultima?.tipo === "d20" ? (
          <ResumoD20 resultado={ultima.resultado} />
        ) : ultima ? (
          <span className="rolagem-total">{ultima.resultado.total}</span>
        ) : null}
      </button>

      {expandido && (
        <div className="painel-rolagens-lista" id="painel-rolagens-historico" role="region" aria-labelledby="painel-rolagens-heading">
          <h2 id="painel-rolagens-heading" className="painel-rolagens-heading">Histórico de rolagens</h2>
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
          {rolagens.length === 0 && <p className="rolagem-detalhe-texto">Suas rolagens aparecerão aqui.</p>}
          {rolagens.map((rolagem) => (
            <article key={rolagem.id} className="item-rolagem">
              <div className="item-rolagem-cabecalho">
                <div>
                  <p className="item-rolagem-tipo">{rolagem.tipo === "d20" ? "Teste d20" : "Rolagem de dados"}</p>
                  <h3 className="item-rolagem-titulo">{rolagem.titulo}</h3>
                </div>
                <span className="item-rolagem-resultado"><span className="item-rolagem-tipo">Resultado</span><strong>{rolagem.resultado.total}</strong></span>
              </div>
              <DetalheRolagem rolagem={rolagem} />
            </article>
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
    </>
  );
}

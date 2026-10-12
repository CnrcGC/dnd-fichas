import { useState } from "react";
import { rolarDado } from "../../utils/dados";
import { useRolagem } from "../../context/useRolagem";
import { dadosVidaDisponiveis } from "../../utils/dadosVida";
import "./BlocoDescanso.css";
import Icon from "../icons/Icon";

export default function BlocoDescanso({
  classe,
  classesSecundarias,
  modConstituicao,
  status,
  dadosVidaPorClasse,
  onGastarDadoDeVida,
  onRestaurarEspacosMagia,
  onDescansoLongo,
  onDescansoCurto,
}) {
  const { registrarRolagem } = useRolagem();
  const [classeSelecionadaId, setClasseSelecionadaId] = useState("");

  if (!classe) return null;

  const pools = Object.values(dadosVidaPorClasse ?? {});
  const poolSelecionado = pools.find((pool) => pool.classeId === classeSelecionadaId) ?? pools[0];
  const dadosDisponiveis = dadosVidaDisponiveis(poolSelecionado);
  const dadosTotais = pools.reduce((total, pool) => total + pool.maximo, 0);
  const ehBruxo =
    classe.id === "bruxo" ||
    (classesSecundarias ?? []).some((c) => c.classeId === "bruxo");

  function handleGastarDado() {
    if (dadosDisponiveis <= 0) return;
    if (!poolSelecionado) return;
    const dado = rolarDado(poolSelecionado.dadoVida);
    const cura = Math.max(0, dado + modConstituicao);
    registrarRolagem(
      `Dado de vida (${poolSelecionado.classeId}, d${poolSelecionado.dadoVida})`,
      {
        formula: `1d${poolSelecionado.dadoVida}+${modConstituicao}`,
        total: cura,
        detalhes: [
          { texto: `1d${poolSelecionado.dadoVida}`, rolagens: [dado], soma: dado },
          { texto: "mod. CON", rolagens: [], soma: modConstituicao },
        ],
      },
      "formula"
    );
    onGastarDadoDeVida(poolSelecionado.classeId, cura);
  }

  return (
    <section>
      <h2 className="bloco-titulo">Descanso</h2>

      <div className="descanso-bloco">
                <h3 className="descanso-subtitulo">Descanso Curto</h3>
        <div className="descanso-pools">
          {pools.map((pool) => (
            <p key={pool.classeId} className="descanso-texto">
              {pool.nome ?? pool.classeId}: d{pool.dadoVida} — {dadosVidaDisponiveis(pool)} de {pool.maximo} disponíveis
            </p>
          ))}
        </div>
        <label className="descanso-seletor">
          Usar dado da classe
          <select
            value={poolSelecionado?.classeId ?? ""}
            onChange={(evento) => setClasseSelecionadaId(evento.target.value)}
          >
            {pools.map((pool) => (
              <option key={pool.classeId} value={pool.classeId}>
                {pool.nome ?? pool.classeId} — d{pool.dadoVida} ({dadosVidaDisponiveis(pool)} disponível)
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className="descanso-botao"
          onClick={handleGastarDado}
          disabled={dadosDisponiveis <= 0}
        >
          <Icon name="dice" /> Gastar 1 dado de vida (1d{poolSelecionado?.dadoVida ?? classe.dadoVida} + CON)
        </button>
        <button
          type="button"
          className="descanso-botao descanso-botao--secundario"
          onClick={onDescansoCurto}
        >
          <Icon name="success" /> Concluir descanso curto (restaura recursos)
        </button>

        {ehBruxo && (
          <button
            type="button"
            className="descanso-botao descanso-botao--secundario"
            onClick={onRestaurarEspacosMagia}
          >
            🔮 Restaurar espaços de magia (Pacto)
          </button>
        )}
      </div>

      <div className="descanso-bloco">
        <h3 className="descanso-subtitulo">Descanso Longo</h3>
        <p className="descanso-texto">
          Restaura todo o PV, todos os espaços de magia, e{" "}
          {Math.max(1, Math.floor(dadosTotais / 2))} dado(s) de vida, priorizando d12, d10, d8 e d6.
        </p>
        <button type="button" className="descanso-botao" onClick={onDescansoLongo}>
          <Icon name="rest" /> Fazer descanso longo
        </button>
      </div>

      <p className="status-nota">
        PV atual: {status.pvAtual} / {status.pvMax}
      </p>
    </section>
  );
}

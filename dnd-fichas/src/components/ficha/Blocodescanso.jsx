import { useState } from "react";
import { rolarDado } from "../../utils/dados";
import { useRolagem } from "../../context/useRolagem";
import { dadosVidaDisponiveis } from "../../utils/dadosVida";
import { podeBeneficiarDescansoLongo } from "../../utils/descanso";
import { estadoTestesMorte } from "../../utils/status";
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
  const [prioridadeDadosVida, setPrioridadeDadosVida] = useState("maiores");

  if (!classe) return null;

  const pools = Object.values(dadosVidaPorClasse ?? {});
  const poolSelecionado = pools.find((pool) => pool.classeId === classeSelecionadaId) ?? pools[0];
  const dadosDisponiveis = dadosVidaDisponiveis(poolSelecionado);
  const dadosTotais = pools.reduce((total, pool) => total + pool.maximo, 0);
  const descansoLongoDisponivel = podeBeneficiarDescansoLongo(status);
  const morto = estadoTestesMorte(status).morto;
  const ehBruxo =
    classe.id === "bruxo" ||
    (classesSecundarias ?? []).some((c) => c.classeId === "bruxo");

  function handleGastarDado() {
    if (morto) return;
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
      <h3 className="bloco-titulo">Descanso</h3>

      <div className="descanso-bloco">
                <h4 className="descanso-subtitulo">Descanso Curto</h4>
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
          disabled={dadosDisponiveis <= 0 || morto}
          aria-describedby={dadosDisponiveis <= 0 || morto ? "descanso-dado-indisponivel" : undefined}
        >
          <Icon name="dice" /> Gastar 1 dado de vida (1d{poolSelecionado?.dadoVida ?? classe.dadoVida} + CON)
        </button>
        {(dadosDisponiveis <= 0 || morto) && (
          <p id="descanso-dado-indisponivel" className="descanso-texto" role="status">
            {morto
              ? "Uma criatura morta não pode gastar dados de vida."
              : "Não há dados de vida disponíveis nesta classe."}
          </p>
        )}
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
        <h4 className="descanso-subtitulo">Descanso Longo</h4>
        <p className="descanso-texto">
          Restaura todo o PV, todos os espaços de magia, e{" "}
          {Math.max(1, Math.floor(dadosTotais / 2))} dado(s) de vida.
        </p>
        <label className="descanso-seletor">
          Preferência para recuperar dados de vida
          <select
            value={prioridadeDadosVida}
            onChange={(evento) => setPrioridadeDadosVida(evento.target.value)}
          >
            <option value="maiores">Dados maiores primeiro</option>
            <option value="menores">Dados menores primeiro</option>
            <option value="ordem-classes">Ordem das classes da ficha</option>
          </select>
        </label>
        {!descansoLongoDisponivel && (
          <p id="descanso-longo-indisponivel" className="descanso-texto" role="status">
            É necessário começar o descanso longo com pelo menos 1 PV.
          </p>
        )}
        <button
          type="button"
          className="descanso-botao"
          onClick={() => onDescansoLongo(prioridadeDadosVida)}
          disabled={!descansoLongoDisponivel}
          aria-describedby={!descansoLongoDisponivel ? "descanso-longo-indisponivel" : undefined}
        >
          <Icon name="rest" /> Fazer descanso longo
        </button>
      </div>

      <p className="status-nota">
        PV atual: {status.pvAtual} / {status.pvMax}
      </p>
    </section>
  );
}

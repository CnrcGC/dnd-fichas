import { useState } from "react";
import { ESCOLAS } from "../../data/magiasSistema";
import { ATRIBUTOS, extrairDadosDoDano } from "../../utils/dnd";
import { rolarFormula } from "../../utils/dados";
import { useRolagem } from "../../context/useRolagem";
import Icon from "../icons/Icon";

function labelResistencia(magia) {
  if (magia.resistencia) {
    const atributo = ATRIBUTOS.find((a) => a.chave === magia.resistencia);
    return `${atributo?.label ?? magia.resistencia} (${atributo?.abreviacao ?? "?"})`;
  }
  if (magia.ataque) return "Ataque mágico (sem resistência)";
  return "Nenhuma";
}

export default function DetalheMagia({
  magia,
  modificadorConjuracao = 0,
  onAplicarEfeitoPv,
  onAplicarCondicao,
}) {
  const { registrarRolagem } = useRolagem();
  const [ultimoEfeitoPv, setUltimoEfeitoPv] = useState(null);
  const [avisoAplicacao, setAvisoAplicacao] = useState("");
  const temEfeitoMecanico = Boolean(magia.dano || magia.cura || magia.condicao);
  const formulaDano = extrairDadosDoDano(magia.dano);

  function handleRolarDano() {
    if (!formulaDano) return;
    const resultado = rolarFormula(formulaDano);
    registrarRolagem(`${magia.nome} (dano)`, resultado, "formula");
    setAvisoAplicacao("");
    setUltimoEfeitoPv({ tipo: "dano", resultado });
  }

  function handleRolarCura() {
    if (!magia.cura?.formula) return;
    const base = rolarFormula(magia.cura.formula);
    const modificador = magia.cura.somaModificadorConjuracao
      ? modificadorConjuracao
      : 0;
    const resultado = modificador !== 0
      ? {
          ...base,
          total: Math.max(0, base.total + modificador),
          detalhes: [...base.detalhes, { texto: "mod. conjuração", rolagens: [], soma: modificador }],
        }
      : base;
    registrarRolagem(`${magia.nome} (cura)`, resultado, "formula");
    setAvisoAplicacao("");
    setUltimoEfeitoPv({ tipo: "cura", resultado });
  }

  function handleAplicarUltimoEfeito() {
    if (!ultimoEfeitoPv || !onAplicarEfeitoPv) return;
    const aplicacao = onAplicarEfeitoPv(
      ultimoEfeitoPv.tipo,
      ultimoEfeitoPv.resultado.total,
      magia.nome
    );
    if (aplicacao?.erro) {
      setAvisoAplicacao(aplicacao.erro);
      return;
    }
    setAvisoAplicacao(`${aplicacao?.valorAplicado ?? ultimoEfeitoPv.resultado.total} PV aplicados à ficha.`);
    setUltimoEfeitoPv(null);
  }

  return (
    <dl className="item-catalogo-detalhes">
      <div>
        <dt>Escola</dt>
        <dd>{ESCOLAS[magia.escola] ?? magia.escola}</dd>
      </div>
      <div>
        <dt>Tempo de conjuração</dt>
        <dd>{magia.tempo}</dd>
      </div>
      <div>
        <dt>Alcance</dt>
        <dd>{magia.alcance}</dd>
      </div>
      <div>
        <dt>Componentes</dt>
        <dd>{magia.componentes}</dd>
      </div>
      <div className="item-catalogo-detalhe-full">
        <dt>Duração</dt>
        <dd>
          {magia.duracao}
          {magia.ritual ? " (pode ser conjurada como ritual)" : ""}
        </dd>
      </div>
      <div>
        <dt>Resistência (ST)</dt>
        <dd>{labelResistencia(magia)}</dd>
      </div>
      {magia.dano && (
        <div>
          <dt>Dano</dt>
          <dd>
            {magia.dano}
            {formulaDano && (
              <button
                type="button"
                className="magia-rolar-dano-botao"
                onClick={handleRolarDano}
                title={`Rolar ${formulaDano}`}
              >
                <Icon name="dice" /> {formulaDano}
              </button>
            )}
          </dd>
        </div>
      )}
      {magia.cura && (
        <div>
          <dt>Cura</dt>
          <dd>
            {magia.cura.formula}
            {magia.cura.somaModificadorConjuracao ? " + modificador de conjuração" : ""}
            <button
              type="button"
              className="magia-rolar-dano-botao"
              onClick={handleRolarCura}
              title={`Rolar cura de ${magia.cura.formula}`}
            >
              <Icon name="dice" /> {magia.cura.formula}
            </button>
          </dd>
        </div>
      )}
      {ultimoEfeitoPv && onAplicarEfeitoPv && (
        <div className="item-catalogo-detalhe-full magia-aplicar-efeito">
          <dt>Resultado rolado</dt>
          <dd>
            {ultimoEfeitoPv.resultado.total} PV de {ultimoEfeitoPv.tipo === "cura" ? "cura" : "dano"}
            <button
              type="button"
              className="magia-aplicar-efeito-botao"
              onClick={handleAplicarUltimoEfeito}
            >
              Aplicar à ficha
            </button>
          </dd>
        </div>
      )}
      {avisoAplicacao && (
        <div className="item-catalogo-detalhe-full">
          <dt>Aplicação</dt>
          <dd role={avisoAplicacao.includes("morta") ? "alert" : "status"}>{avisoAplicacao}</dd>
        </div>
      )}
      {magia.condicao && (
        <div className={magia.dano ? "item-catalogo-detalhe-full" : ""}>
          <dt>Condição</dt>
          <dd>
            {magia.condicao}
            {onAplicarCondicao && (
              <button
                type="button"
                className="magia-aplicar-efeito-botao"
                onClick={() => onAplicarCondicao({
                  nome: magia.condicao,
                  fonte: magia.nome,
                  fonteId: magia.id,
                  duracao: magia.duracao,
                })}
              >
                Adicionar à ficha
              </button>
            )}
          </dd>
        </div>
      )}
      {!temEfeitoMecanico && (
        <div className="item-catalogo-detalhe-full">
          <dt>Dano/Condição</dt>
          <dd>Nenhum — efeito utilitário ou de suporte.</dd>
        </div>
      )}
      <div className="item-catalogo-detalhe-full">
        <dt>Efeito</dt>
        <dd>{magia.descricao}</dd>
      </div>
    </dl>
  );
}

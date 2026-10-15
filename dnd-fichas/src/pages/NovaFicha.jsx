import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFichas } from "../context/useFichas";
import {
  RACAS,
  obterBonusRaciais,
  obterRaca,
  obterDeslocamentoRacial,
  obterSubraca,
  obterSubracasPorRaca,
} from "../data/racas";
import { CLASSES } from "../data/classes";
import { ANTECEDENTES } from "../data/antecedentes";
import { PERICIAS } from "../data/pericias";
import { IDIOMAS } from "../data/idiomas";
import { FERRAMENTAS } from "../data/equipamentos";
import { ATRIBUTOS, calcularModificador, formatarModificador } from "../utils/dnd";
import { criarEspacosMagiaVazios } from "../utils/magia";
import { obterEspacosPorNivel, mesclarEspacosNoAtual } from "../utils/conjuracao";
import {
  opcoesFerramentas,
  quantidadeSubstituicoesFerramentas,
  reconciliarProficienciasCriacao,
  escolhasObrigatoriasCriacao,
} from "../utils/proficienciasCriacao";
import { obterEscolhasPorClasse } from "../data/escolhasClasses";
import {
  escolhaAtiva,
  opcoesDaEscolha,
  quantidadeDaEscolha,
  valoresDaEscolha,
} from "../utils/escolhasClasses";
import "./NovaFicha.css";
import { rolarAtributos, trocarDistribuicao } from "../utils/atributos";
import RetratoPersonagem from "../components/ficha/RetratoPersonagem";

const ETAPAS = [
  { chave: "raca", label: "Raça" },
  { chave: "classe", label: "Classe" },
  { chave: "antecedente", label: "Antecedente" },
  { chave: "atributos", label: "Atributos" },
  { chave: "toques", label: "Toques Finais" },
];

const ARRANJO_PADRAO = [15, 14, 13, 12, 10, 8];

function distribuicaoInicial() {
  const atributos = {};
  ATRIBUTOS.forEach((atributo, indice) => {
    atributos[atributo.chave] = ARRANJO_PADRAO[indice];
  });
  return atributos;
}

export default function NovaFicha() {
  const { criarFicha } = useFichas();
  const navigate = useNavigate();
  const [etapa, setEtapa] = useState(0);
  const conteudoRef = useRef(null);
  const etapaAnteriorRef = useRef(0);
  const erroRef = useRef(null);
  const [errosCriacao, setErrosCriacao] = useState([]);
  const [processandoRetrato, setProcessandoRetrato] = useState(false);
  const [rascunho, setRascunho] = useState(() => ({
    nomePersonagem: "",
    racaId: null,
    subracaId: null,
    escolhasRaciais: {},
    escolhasClasse: {},
    escolhasSubclasse: {},
    classeId: null,
    antecedenteId: null,
    atributos: distribuicaoInicial(),
    metodoAtributos: "arranjo-padrao",
    rolagensAtributos: null,
    retrato: "",
    jogador: "",
    aparencia: "",
    personalidade: "",
    historico: "",
    objetivo: "",
    escolhasCriacao: { periciasClasse: [], ferramentasClasse: [], periciasRaca: [], idiomasRaca: [], ferramentasRaca: [], idiomasSubraca: [], ferramentasSubraca: [], idiomasAntecedente: [], ferramentasAntecedente: [], ferramentasSubstitutas: [] },
    bonusRacialEscolhido: [],
  }));

  const racaEscolhida = RACAS.find((r) => r.id === rascunho.racaId) ?? null;
  const subracaEscolhida = obterSubraca(rascunho.subracaId);
  const classeEscolhida = CLASSES.find((c) => c.id === rascunho.classeId) ?? null;
  const antecedenteEscolhido =
    ANTECEDENTES.find((a) => a.id === rascunho.antecedenteId) ?? null;

  useEffect(() => {
    if (etapaAnteriorRef.current === etapa) return;
    etapaAnteriorRef.current = etapa;
    const frame = requestAnimationFrame(() => conteudoRef.current?.querySelector("[data-etapa-titulo]")?.focus());
    return () => cancelAnimationFrame(frame);
  }, [etapa]);

  function irPara(indice) {
    setErrosCriacao([]);
    setEtapa(Math.min(Math.max(indice, 0), ETAPAS.length - 1));
  }

  useEffect(() => { if (errosCriacao.length) erroRef.current?.focus(); }, [errosCriacao]);

  function handlePular() {
    const novaFicha = criarFicha();
    navigate(`/dnd5e/characters/${encodeURIComponent(novaFicha.id)}`, { replace: true });
  }

  function handleEscolherRaca(id) {
    const raca = RACAS.find((item) => item.id === id);
    if (raca?.requerSubraca && (!rascunho.subracaId || obterSubraca(rascunho.subracaId)?.racaId !== id)) return;
    if (raca?.ancestralidadesDraconicas?.length && !rascunho.escolhasRaciais?.ancestralidadeDraconicaId) return;
    setRascunho((atual) => ({
      ...atual,
      racaId: id,
      subracaId: atual.racaId === id ? atual.subracaId : null,
      bonusRacialEscolhido: [],
      escolhasCriacao: { ...atual.escolhasCriacao, periciasRaca: [], idiomasRaca: [], ferramentasRaca: [], ferramentasSubstitutas: [] },
    }));
    irPara(etapa + 1);
  }

  function podeEscolherRaca(raca) {
    const selecionada = rascunho.racaId === raca.id;
    const subracaValida = !raca.requerSubraca || (
      selecionada && obterSubraca(rascunho.subracaId)?.racaId === raca.id
    );
    const ancestralidadeValida = !raca.ancestralidadesDraconicas?.length || (
      selecionada && Boolean(rascunho.escolhasRaciais?.ancestralidadeDraconicaId)
    );
    return subracaValida && ancestralidadeValida;
  }

  function handleEscolherClasse(id) {
    setRascunho((atual) => ({
      ...atual,
      classeId: id,
      escolhasCriacao: { ...atual.escolhasCriacao, periciasClasse: [], ferramentasClasse: [], ferramentasSubstitutas: [] },
    }));
    irPara(etapa + 1);
  }

  function handleEscolherAntecedente(id) {
    setRascunho((atual) => ({
      ...atual,
      antecedenteId: id,
      escolhasCriacao: { ...atual.escolhasCriacao, idiomasAntecedente: [], ferramentasAntecedente: [], ferramentasSubstitutas: [] },
    }));
    irPara(etapa + 1);
  }

  function handleChangeAtributoValor(chave, novoValor) {
    setRascunho((atual) => {
      const atributos = { ...atual.atributos };
      const chaveAntiga = Object.keys(atributos).find(
        (k) => atributos[k] === novoValor
      );
      const valorAnterior = atributos[chave];
      if (chaveAntiga && chaveAntiga !== chave) {
        atributos[chaveAntiga] = valorAnterior;
      }
      atributos[chave] = novoValor;
      return { ...atual, atributos };
    });
  }

  function handleChangeCampo(campo, valor) {
    setRascunho((atual) => ({ ...atual, [campo]: valor }));
  }

  function handleRolarAtributos() {
    const resultados = rolarAtributos();
    setRascunho((atual) => ({
      ...atual,
      rolagensAtributos: { resultados, distribuicao: [0, 1, 2, 3, 4, 5] },
      atributos: Object.fromEntries(ATRIBUTOS.map((atributo, indice) => [atributo.chave, resultados[indice].total])),
    }));
  }

  function handleDistribuirRolagem(posicao, resultado) {
    setRascunho((atual) => {
      const registro = atual.rolagensAtributos;
      const distribuicao = trocarDistribuicao(registro.distribuicao, posicao, resultado);
      return { ...atual, rolagensAtributos: { ...registro, distribuicao },
        atributos: Object.fromEntries(ATRIBUTOS.map((atributo, indice) => [atributo.chave, registro.resultados[distribuicao[indice]].total])) };
    });
  }

  function handleMetodoAtributos(metodo) {
    setRascunho((atual) => ({
      ...atual, metodoAtributos: metodo,
      atributos: metodo === "rolagem" && atual.rolagensAtributos
        ? Object.fromEntries(ATRIBUTOS.map((atributo, indice) => [atributo.chave, atual.rolagensAtributos.resultados[atual.rolagensAtributos.distribuicao[indice]].total]))
        : distribuicaoInicial(),
    }));
  }

  function handleFinalizar(comoRascunho = false) {
    if (processandoRetrato) return;
    if (rascunho.metodoAtributos === "rolagem" && !rascunho.rolagensAtributos) { setErrosCriacao(["Role os seis atributos antes de criar a ficha."]); return; }
    const pendencias = escolhasObrigatoriasCriacao(rascunho).map((item) => item.mensagem);
    if (racaEscolhida?.atributosEscolhaLivre && new Set(rascunho.bonusRacialEscolhido.filter(Boolean)).size !== racaEscolhida.atributosEscolhaLivre) {
      pendencias.push(`Bônus racial: escolha ${racaEscolhida.atributosEscolhaLivre} atributos diferentes para +1.`);
    }
    if (pendencias.length && !comoRascunho) { setErrosCriacao(pendencias); return; }
    const bonusRacial = obterBonusRaciais(rascunho.racaId, rascunho.subracaId, rascunho.bonusRacialEscolhido);
    const modCon = calcularModificador(
      rascunho.atributos.constituicao + (bonusRacial.constituicao ?? 0)
    );
    const modDes = calcularModificador(
      rascunho.atributos.destreza + (bonusRacial.destreza ?? 0)
    );
    const bonusPvRacial = obterRaca(rascunho.racaId, rascunho.subracaId)?.pvPorNivel ?? 0;
    const pvInicial = (classeEscolhida ? classeEscolhida.dadoVida + modCon : 10) + bonusPvRacial;

    const espacosIniciais = classeEscolhida
      ? mesclarEspacosNoAtual(
          criarEspacosMagiaVazios(),
          obterEspacosPorNivel(classeEscolhida.id, 1) ?? {}
        )
      : criarEspacosMagiaVazios();

    const novaFicha = criarFicha(rascunho.nomePersonagem, {
      racaId: rascunho.racaId,
      subracaId: rascunho.subracaId,
      escolhasRaciais: rascunho.escolhasRaciais,
      escolhasClasse: rascunho.escolhasClasse,
      escolhasSubclasse: rascunho.escolhasSubclasse,
      classeId: rascunho.classeId,
      antecedenteId: rascunho.antecedenteId,
      atributos: rascunho.atributos,
      metodoAtributos: rascunho.metodoAtributos,
      rolagensAtributos: rascunho.metodoAtributos === "rolagem" ? rascunho.rolagensAtributos : null,
      retrato: rascunho.retrato,
      escolhasCriacao: rascunho.escolhasCriacao,
      bonusRacialEscolhido: rascunho.bonusRacialEscolhido,
      jogador: rascunho.jogador,
      aparencia: rascunho.aparencia,
      personalidade: rascunho.personalidade,
      historico: rascunho.historico,
      objetivo: rascunho.objetivo,
      status: {
        pvAtual: pvInicial,
        pvMax: pvInicial,
        ca: 10 + modDes,
        iniciativa: 0,
        deslocamento: obterDeslocamentoRacial(rascunho.racaId, rascunho.subracaId),
      },
      pvPorNivel: { 1: pvInicial - bonusPvRacial },
      espacosMagia: espacosIniciais,
    });

    navigate(`/dnd5e/characters/${encodeURIComponent(novaFicha.id)}`, { replace: true });
  }

  const etapasDefinidas = [
    Boolean(racaEscolhida && podeEscolherRaca(racaEscolhida)),
    Boolean(classeEscolhida),
    Boolean(antecedenteEscolhido),
    etapa > 3,
    false,
  ];

  return (
    <div className="criacao-shell criacao-grimoire">
      <header className="criacao-abertura">
        <p className="criacao-abertura-marca">Grimório de aventureiro</p>
        <h1>Criar personagem D&D 5e</h1>
        <p className="criacao-abertura-texto">Preencha cinco capítulos. As escolhas obrigatórias ficam em Toques Finais.</p>
        <button type="button" className="criacao-pular" onClick={handlePular}>
          Pular e criar ficha em branco
        </button>
      </header>

      <p className="visually-hidden" role="status" aria-live="polite" aria-atomic="true">
        Etapa {etapa + 1} de {ETAPAS.length}: {ETAPAS[etapa].label}
      </p>
      <ol
        className="criacao-passos"
        aria-label="Etapas de criação"
        tabIndex={0}
      >
        {ETAPAS.map((info, indice) => (
          <li
            key={info.chave}
            className={
              indice === etapa
                ? "criacao-passo is-ativo"
                : etapasDefinidas[indice]
                ? "criacao-passo is-concluido"
                : indice < etapa ? "criacao-passo is-pendente" : "criacao-passo"
            }
            aria-current={indice === etapa ? "step" : undefined}
          >
            <span className="criacao-passo-numero" aria-hidden="true">{indice + 1}</span>
            <span className="criacao-passo-corpo">
              <span className="criacao-passo-nome"><span className="visually-hidden">Capítulo {indice + 1}: </span>{info.label}</span>
              <span className="criacao-passo-estado">{indice === etapa ? "Atual" : etapasDefinidas[indice] ? "Concluído" : indice < etapa ? "Pendente" : "A seguir"}</span>
            </span>
          </li>
        ))}
      </ol>

      <div className="criacao-conteudo" ref={conteudoRef}>
        <p className="criacao-capitulo" aria-hidden="true">Capítulo {etapa + 1} de {ETAPAS.length}</p>
        {etapa === 0 && (
          <EtapaEscolha
            titulo="Escolha sua Raça"
            texto="A raça define traços físicos, bônus de atributo e alguns talentos naturais do seu personagem."
            itens={RACAS}
            selecionadoId={rascunho.racaId}
            renderExtra={(raca) => {
              const subracas = obterSubracasPorRaca(raca.id);
              const selecionada = rascunho.racaId === raca.id;
              return <>
              <p className="criacao-card-extra">
                {Object.entries(obterBonusRaciais(raca.id, selecionada ? rascunho.subracaId : null))
                  .map(
                    ([chave, valor]) =>
                      `${ATRIBUTOS.find((a) => a.chave === chave)?.abreviacao} ${formatarModificador(valor)}`
                  )
                  .join(" · ")}
              </p>
              {subracas.length > 0 && <label className="criacao-campo">
                <span>Sub-raça</span>
                <select value={selecionada ? rascunho.subracaId ?? "" : ""} onChange={(evento) => setRascunho((atual) => ({ ...atual, racaId: raca.id, subracaId: evento.target.value || null, escolhasRaciais: {}, bonusRacialEscolhido: [], escolhasCriacao: { ...atual.escolhasCriacao, idiomasRaca: [], ferramentasRaca: [], periciasRaca: [], idiomasSubraca: [], ferramentasSubraca: [], ferramentasSubstitutas: [] } }))}>
                  <option value="">Selecione...</option>
                  {subracas.map((subraca) => <option key={subraca.id} value={subraca.id}>{subraca.nome}</option>)}
                </select>
              </label>}
              {raca.ancestralidadesDraconicas?.length > 0 && <label className="criacao-campo">
                <span>Ancestralidade dracônica</span>
                <select value={selecionada ? rascunho.escolhasRaciais?.ancestralidadeDraconicaId ?? "" : ""} onChange={(evento) => setRascunho((atual) => ({ ...atual, racaId: raca.id, subracaId: null, escolhasRaciais: { ancestralidadeDraconicaId: evento.target.value || null }, bonusRacialEscolhido: [] }))}>
                  <option value="">Selecione...</option>
                  {raca.ancestralidadesDraconicas.map((item) => <option key={item.id} value={item.id}>{item.nome} — {item.dano}, {item.forma}</option>)}
                </select>
              </label>}
              </>;
            }}
            podeEscolher={podeEscolherRaca}
            onEscolher={handleEscolherRaca}
            onVoltar={null}
            onPular={() => irPara(etapa + 1)}
          />
        )}

        {etapa === 1 && (
          <EtapaEscolha
            titulo="Escolha sua Classe"
            texto="Sua classe é o treinamento e papel do seu personagem no grupo — a característica mais importante em termos de jogo."
            itens={CLASSES}
            selecionadoId={rascunho.classeId}
            renderExtra={(classe) => (
              <p className="criacao-card-extra">
                Dado de vida: d{classe.dadoVida} · Atributo principal:{" "}
                {ATRIBUTOS.find((a) => a.chave === classe.atributoPrincipal)?.label}
              </p>
            )}
            onEscolher={handleEscolherClasse}
            onVoltar={() => irPara(etapa - 1)}
            onPular={() => irPara(etapa + 1)}
          />
        )}

        {etapa === 2 && (
          <EtapaEscolha
            titulo="Escolha seu Antecedente"
            texto="O antecedente representa como a vida do seu personagem era antes da aventura. Concede duas perícias treinadas automaticamente."
            itens={ANTECEDENTES}
            selecionadoId={rascunho.antecedenteId}
            renderExtra={(antecedente) => (
              <p className="criacao-card-extra">
                Perícias: {antecedente.periciasConcedidas.join(", ")} · Equipamento:{" "}
                {antecedente.equipamento}
              </p>
            )}
            onEscolher={handleEscolherAntecedente}
            onVoltar={() => irPara(etapa - 1)}
            onPular={() => irPara(etapa + 1)}
          />
        )}

        {etapa === 3 && (
          <section>
            <h2 className="criacao-titulo" data-etapa-titulo tabIndex={-1}>Distribua seus Atributos</h2>
            <label className="criacao-metodo">
              Método dos atributos
              <select value={rascunho.metodoAtributos} onChange={(evento) => handleMetodoAtributos(evento.target.value)}>
                <option value="arranjo-padrao">Arranjo padrão</option>
                <option value="rolagem">Rolagem de dados (4d6, descarta o menor)</option>
              </select>
            </label>
            <p className="criacao-texto">
              {rascunho.metodoAtributos === "arranjo-padrao"
                ? `Distribua os valores ${ARRANJO_PADRAO.join(", ")} entre os seis atributos, usando cada valor uma vez.`
                : "Role quatro dados de seis faces e some os três maiores. Repita seis vezes e distribua os resultados. Ao trocar uma escolha, as posições são permutadas."}
              {" "}Bônus raciais entram à parte, automaticamente.
            </p>
            {rascunho.metodoAtributos === "rolagem" && <>
              <button type="button" className="criacao-botao-avancar" onClick={handleRolarAtributos}>
                {rascunho.rolagensAtributos ? "Rolar novamente os seis atributos" : "Rolar os seis atributos"}
              </button>
              <div role="status" aria-live="polite" className="criacao-rolagens">
                {rascunho.rolagensAtributos && <ol aria-label="Resultados das rolagens de atributos">
                  {rascunho.rolagensAtributos.resultados.map((resultado, indice) => <li key={indice}>
                    Rolagem {indice + 1}: {resultado.dados.join(" + ")}; descarta {resultado.dados[resultado.descartado]}; total <strong>{resultado.total}</strong>.
                  </li>)}
                </ol>}
              </div>
            </>}

            <div className="criacao-atributos-grid">
              {ATRIBUTOS.map((atributo, indice) => {
                const bonusRacial = obterBonusRaciais(rascunho.racaId, rascunho.subracaId, rascunho.bonusRacialEscolhido)[atributo.chave] ?? 0;
                const valorBase = rascunho.atributos[atributo.chave];
                const valorFinal = valorBase + bonusRacial;
                return (
                  <div key={atributo.chave} className="criacao-atributo-card">
                    <span className="criacao-atributo-label">{atributo.label}</span>
                    <select
                      aria-label={`Valor base de ${atributo.label}`}
                      disabled={rascunho.metodoAtributos === "rolagem" && !rascunho.rolagensAtributos}
                      value={rascunho.metodoAtributos === "rolagem" ? rascunho.rolagensAtributos?.distribuicao[indice] ?? "" : valorBase}
                      onChange={(evento) => rascunho.metodoAtributos === "rolagem"
                        ? handleDistribuirRolagem(indice, Number(evento.target.value))
                        : handleChangeAtributoValor(atributo.chave, Number(evento.target.value))}
                    >
                      {rascunho.metodoAtributos === "rolagem"
                        ? rascunho.rolagensAtributos
                          ? rascunho.rolagensAtributos.resultados.map((resultado, posicao) => <option key={posicao} value={posicao}>{resultado.total} — rolagem {posicao + 1}</option>)
                          : <option value="">Role os dados primeiro</option>
                        : ARRANJO_PADRAO.map((valor) => <option key={valor} value={valor}>{valor}</option>)}
                    </select>
                    {bonusRacial !== 0 && (
                      <span className="criacao-atributo-bonus">
                        {formatarModificador(bonusRacial)} racial = {valorFinal}
                      </span>
                    )}
                    <span className="criacao-atributo-modificador">
                      Mod. {formatarModificador(calcularModificador(valorFinal))}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="criacao-navegacao">
              <button type="button" className="criacao-botao-voltar" onClick={() => irPara(etapa - 1)}>
                Voltar
              </button>
              <button type="button" className="criacao-botao-avancar" disabled={rascunho.metodoAtributos === "rolagem" && !rascunho.rolagensAtributos} onClick={() => irPara(etapa + 1)}>
                Próximo
              </button>
            </div>
          </section>
        )}

        {etapa === 4 && (
          <section>
            <h2 className="criacao-titulo" data-etapa-titulo tabIndex={-1}>Toques Finais</h2>
            <p className="criacao-texto">
              Até aqui você definiu as características mecânicas da sua
              ficha — mas um bom personagem é mais do que apenas números.
              Esses campos não têm efeito nas regras, mas deixam o jogo mais
              envolvente.
            </p>

            <RetratoPersonagem valor={rascunho.retrato} nome={rascunho.nomePersonagem} onChange={(valor) => handleChangeCampo("retrato", valor)} onProcessando={setProcessandoRetrato} />
            <EscolhasDeCriacao
              mostrarErros={errosCriacao.length > 0}
              rascunho={rascunho}
              raca={racaEscolhida}
              subraca={subracaEscolhida}
              classe={classeEscolhida}
              antecedente={antecedenteEscolhido}
              onChange={(chave, valores) => setRascunho((atual) => ({
                ...atual,
                escolhasCriacao: { ...atual.escolhasCriacao, [chave]: valores },
              }))}
              onBonusRacial={(valores) => setRascunho((atual) => ({ ...atual, bonusRacialEscolhido: valores }))}
              onEscolhaClasse={(escolhaId, valores) => setRascunho((atual) => ({
                ...atual,
                escolhasClasse: {
                  ...(atual.escolhasClasse ?? {}),
                  [atual.classeId]: {
                    ...(atual.escolhasClasse?.[atual.classeId] ?? {}),
                    [escolhaId]: valores,
                  },
                },
              }))}
            />
            {errosCriacao.length > 0 && (
              <div id="criacao-erros" ref={erroRef} tabIndex="-1" role="alert">
                <h3>Complete as escolhas para finalizar</h3>
                <ul>{errosCriacao.map((mensagem) => <li key={mensagem}>{mensagem}</li>)}</ul>
                <p>Selecione as opções acima ou salve um rascunho para completar na ficha.</p>
                <button type="button" onClick={() => handleFinalizar(true)}>Criar rascunho com escolhas pendentes</button>
              </div>
            )}

            <div className="criacao-toques-grid">
              <label className="criacao-campo">
                <span>Personagem</span>
                <input
                  type="text"
                  placeholder="Nome do personagem"
                  value={rascunho.nomePersonagem}
                  onChange={(evento) =>
                    handleChangeCampo("nomePersonagem", evento.target.value)
                  }
                />
              </label>
              <label className="criacao-campo">
                <span>Jogador</span>
                <input
                  type="text"
                  placeholder="Nome do jogador"
                  value={rascunho.jogador}
                  onChange={(evento) => handleChangeCampo("jogador", evento.target.value)}
                />
              </label>
            </div>

            <label className="criacao-campo">
              <span>Aparência</span>
              <textarea
                placeholder="Idade, altura, jeito de se vestir, marcas..."
                value={rascunho.aparencia}
                onChange={(evento) => handleChangeCampo("aparencia", evento.target.value)}
              />
            </label>

            <label className="criacao-campo">
              <span>Personalidade</span>
              <textarea
                placeholder="Traços marcantes, opiniões, ideais..."
                value={rascunho.personalidade}
                onChange={(evento) =>
                  handleChangeCampo("personalidade", evento.target.value)
                }
              />
            </label>

            <label className="criacao-campo">
              <span>Histórico</span>
              <textarea
                placeholder="Infância, família, como chegou até aqui..."
                value={rascunho.historico}
                onChange={(evento) => handleChangeCampo("historico", evento.target.value)}
              />
            </label>

            <label className="criacao-campo">
              <span>Objetivo</span>
              <textarea
                placeholder="O que motiva esse personagem a se aventurar?"
                value={rascunho.objetivo}
                onChange={(evento) => handleChangeCampo("objetivo", evento.target.value)}
              />
            </label>

            <div className="criacao-navegacao">
              <button type="button" className="criacao-botao-voltar" onClick={() => irPara(etapa - 1)}>
                Voltar
              </button>
              <button type="button" className="criacao-botao-finalizar" disabled={processandoRetrato} onClick={() => handleFinalizar()}>
                Finalizar
              </button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function EscolhasDeCriacao({ rascunho, raca, subraca, classe, antecedente, onChange, onBonusRacial, onEscolhaClasse, mostrarErros }) {
  const escolha = rascunho.escolhasCriacao ?? {};
  const seletor = (titulo, chave, quantidade, opcoes, rotulos, bloqueadas = []) => {
    if (!quantidade) return null;
    const valores = escolha[chave] ?? [];
    return <div className="criacao-campo" key={chave}>
      <span>{titulo} — escolha {quantidade}</span>
      {Array.from({ length: quantidade }).map((_, indice) => (
        <select
          key={indice}
          aria-invalid={mostrarErros && (!valores[indice] || bloqueadas.includes(valores[indice]) || !opcoes.includes(valores[indice])) ? "true" : undefined}
          aria-describedby={mostrarErros ? "criacao-erros" : undefined}
          aria-label={`${titulo}, escolha ${indice + 1} de ${quantidade}`}
          value={valores[indice] ?? ""}
          onChange={(evento) => {
          const proximos = [...valores]; proximos[indice] = evento.target.value || null; onChange(chave, proximos);
          }}
        >
          <option value="">Selecione...</option>
          {valores[indice] && (!opcoes.includes(valores[indice]) || bloqueadas.includes(valores[indice])) && <option value={valores[indice]}>Escolha a corrigir: {rotulos[valores[indice]] ?? valores[indice]}</option>}
          {opcoes.filter((id) => !bloqueadas.includes(id) && (!valores.includes(id) || valores[indice] === id)).map((id) => <option key={id} value={id}>{rotulos[id] ?? id}</option>)}
        </select>
      ))}
    </div>;
  };
  const pericias = Object.fromEntries(PERICIAS.map((item) => [item.chave, item.label]));
  const idiomas = Object.fromEntries(IDIOMAS.map((item) => [item.id, item.nome]));
  const idiomasFixos = [...(raca?.idiomasFixos ?? []), ...(subraca?.idiomasFixos ?? [])];
  const idiomasEscolhiveis = IDIOMAS.filter((item) => item.tipo !== "secreto").map((item) => item.id);
  const ferramentas = Object.fromEntries(FERRAMENTAS.map((item) => [item.id, item.nome]));
  const classeRegra = classe?.proficienciasIniciais?.pericias;
  const periciasClasse = classeRegra?.opcoes === "todas" ? PERICIAS.map((item) => item.chave) : classeRegra?.opcoes ?? [];
  const periciasRaca = raca?.periciasEscolha?.opcoes === "todas" ? PERICIAS.map((item) => item.chave) : raca?.periciasEscolha?.opcoes ?? [];
  const bloqueadasClasse = [...(antecedente?.periciasConcedidas ?? []), ...(raca?.periciasConcedidas ?? []), ...(escolha.periciasRaca ?? [])];
  const ferramentasFixas = [
    ...(classe?.proficienciasIniciais?.ferramentas ?? []),
    ...(raca?.ferramentasFixas ?? []),
    ...(subraca?.ferramentasFixas ?? []),
    ...(antecedente?.ferramentasFixas ?? []),
  ];
  const substituicoes = quantidadeSubstituicoesFerramentas(classe, raca, antecedente, subraca);
  const fichaParaEscolhas = reconciliarProficienciasCriacao({ ...rascunho, nivel: 1, classesSecundarias: [] });
  const escolhasClasse = obterEscolhasPorClasse(classe?.id, 1)
    .filter((item) => escolhaAtiva(item, fichaParaEscolhas, classe?.id));
  return <section className="criacao-escolhas">
    <h3 className="criacao-titulo">Escolhas obrigatórias</h3>
    {raca?.atributosEscolhaLivre && Array.from({ length: raca.atributosEscolhaLivre }).map((_, indice) => <select aria-label={`Bônus racial +1 — atributo ${indice + 1}`} aria-invalid={mostrarErros && !rascunho.bonusRacialEscolhido?.[indice] ? "true" : undefined} aria-describedby={mostrarErros ? "criacao-erros" : undefined} key={`atributo-${indice}`} value={rascunho.bonusRacialEscolhido?.[indice] ?? ""} onChange={(evento) => { const proximos = [...(rascunho.bonusRacialEscolhido ?? [])]; proximos[indice] = evento.target.value || null; onBonusRacial(proximos); }}><option value="">Atributo para +1...</option>{ATRIBUTOS.filter((a) => !raca.bonusAtributos?.[a.chave] && (!(rascunho.bonusRacialEscolhido ?? []).includes(a.chave) || rascunho.bonusRacialEscolhido?.[indice] === a.chave)).map((a) => <option key={a.chave} value={a.chave}>{a.label}</option>)}</select>)}
    {seletor("Perícias da classe", "periciasClasse", classeRegra?.quantidade, periciasClasse, pericias, bloqueadasClasse)}
    {seletor("Ferramentas da classe", "ferramentasClasse", classe?.proficienciasIniciais?.ferramentasEscolha?.quantidade, opcoesFerramentas(classe?.proficienciasIniciais?.ferramentasEscolha), ferramentas, [...ferramentasFixas, ...(escolha.ferramentasRaca ?? []), ...(escolha.ferramentasAntecedente ?? [])])}
    {seletor("Perícias da raça", "periciasRaca", raca?.periciasEscolha?.quantidade, periciasRaca, pericias, antecedente?.periciasConcedidas ?? [])}
    {seletor("Idiomas da raça", "idiomasRaca", raca?.idiomasEscolha, idiomasEscolhiveis, idiomas, [...idiomasFixos, ...(escolha.idiomasSubraca ?? []), ...(escolha.idiomasAntecedente ?? [])])}
    {seletor("Ferramentas da raça", "ferramentasRaca", raca?.ferramentasEscolha?.quantidade, opcoesFerramentas(raca?.ferramentasEscolha), ferramentas, [...ferramentasFixas, ...(escolha.ferramentasClasse ?? []), ...(escolha.ferramentasAntecedente ?? [])])}
    {seletor("Idiomas da sub-raça", "idiomasSubraca", subraca?.idiomasEscolha, idiomasEscolhiveis, idiomas, [...idiomasFixos, ...(escolha.idiomasRaca ?? []), ...(escolha.idiomasAntecedente ?? [])])}
    {seletor("Ferramentas da sub-raça", "ferramentasSubraca", subraca?.ferramentasEscolha?.quantidade, opcoesFerramentas(subraca?.ferramentasEscolha), ferramentas, [...ferramentasFixas, ...(escolha.ferramentasClasse ?? []), ...(escolha.ferramentasRaca ?? []), ...(escolha.ferramentasAntecedente ?? [])])}
    {seletor("Idiomas do antecedente", "idiomasAntecedente", antecedente?.idiomasEscolha, idiomasEscolhiveis, idiomas, [...idiomasFixos, ...(escolha.idiomasRaca ?? []), ...(escolha.idiomasSubraca ?? [])])}
    {seletor("Ferramentas do antecedente", "ferramentasAntecedente", antecedente?.ferramentasEscolha?.quantidade, opcoesFerramentas(antecedente?.ferramentasEscolha), ferramentas, [...ferramentasFixas, ...(escolha.ferramentasClasse ?? []), ...(escolha.ferramentasRaca ?? [])])}
    {seletor("Substituições por proficiências repetidas", "ferramentasSubstitutas", substituicoes, FERRAMENTAS.map((item) => item.id), ferramentas, [...new Set([...ferramentasFixas, ...(escolha.ferramentasClasse ?? []), ...(escolha.ferramentasRaca ?? []), ...(escolha.ferramentasAntecedente ?? [])])])}
    {escolhasClasse.map((escolhaClasse) => {
      const quantidade = quantidadeDaEscolha(escolhaClasse, 1);
      const valores = valoresDaEscolha(fichaParaEscolhas, classe.id, escolhaClasse.id);
      const opcoes = opcoesDaEscolha(escolhaClasse, fichaParaEscolhas, { classeId: classe.id, nivel: 1 });
      return <div className="criacao-campo" key={escolhaClasse.id}>
        <span>{escolhaClasse.nome} — escolha {quantidade}</span>
        {Array.from({ length: quantidade }, (_, indice) => escolhaClasse.tipo === "texto" ? (
          <input key={indice} type="text" value={valores[indice] ?? ""} aria-label={`${escolhaClasse.nome}, escolha ${indice + 1} de ${quantidade}`} onChange={(evento) => { const proximos = [...valores]; proximos[indice] = evento.target.value; onEscolhaClasse(escolhaClasse.id, proximos); }} />
        ) : (
          <select key={indice} value={valores[indice] ?? ""} aria-label={`${escolhaClasse.nome}, escolha ${indice + 1} de ${quantidade}`} onChange={(evento) => { const proximos = [...valores]; proximos[indice] = evento.target.value || null; onEscolhaClasse(escolhaClasse.id, proximos); }}>
            <option value="">Selecione...</option>
            {opcoes.filter((opcao) => !valores.includes(opcao.id) || valores[indice] === opcao.id).map((opcao) => <option key={opcao.id} value={opcao.id}>{opcao.nome}</option>)}
          </select>
        ))}
      </div>;
    })}
  </section>;
}

function EtapaEscolha({ titulo, texto, itens, selecionadoId, renderExtra, podeEscolher = () => true, onEscolher, onVoltar, onPular }) {
  return (
    <section>
      <h2 className="criacao-titulo" data-etapa-titulo tabIndex={-1}>{titulo}</h2>
      <p className="criacao-texto">{texto}</p>

      <div className="criacao-cards-lista">
        {itens.map((item) => (
          <div key={item.id} className={`criacao-card${selecionadoId === item.id ? " is-selecionado" : ""}`}>
            <div className="criacao-card-corpo">
              <h3 className="criacao-card-nome">{item.nome}</h3>
              {selecionadoId === item.id && <p className="criacao-card-selecao">Selecionado</p>}
              <p className="criacao-card-descricao">{item.descricao}</p>
              {renderExtra?.(item)}
              {!podeEscolher(item) && <p id={`criacao-escolha-${item.id}-ajuda`} className="criacao-card-ajuda">Complete a seleção acima para continuar.</p>}
            </div>
            <button
              type="button"
              className="criacao-card-escolher"
              onClick={() => onEscolher(item.id)}
              disabled={!podeEscolher(item)}
              aria-label={`Escolher ${item.nome}`}
              aria-describedby={!podeEscolher(item) ? `criacao-escolha-${item.id}-ajuda` : undefined}
            >
              Escolher
            </button>
          </div>
        ))}
      </div>

      <div className="criacao-navegacao">
        {onVoltar ? (
          <button type="button" className="criacao-botao-voltar" onClick={onVoltar}>
            Voltar
          </button>
        ) : (
          <span />
        )}
        <button type="button" className="criacao-botao-pular" onClick={onPular}>
          Pular esta etapa →
        </button>
      </div>
    </section>
  );
}

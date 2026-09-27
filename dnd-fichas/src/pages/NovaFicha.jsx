import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFichas } from "../context/useFichas";
import { RACAS } from "../data/racas";
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
} from "../utils/proficienciasCriacao";
import "./NovaFicha.css";

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
  const [rascunho, setRascunho] = useState(() => ({
    nomePersonagem: "",
    racaId: null,
    classeId: null,
    antecedenteId: null,
    atributos: distribuicaoInicial(),
    jogador: "",
    aparencia: "",
    personalidade: "",
    historico: "",
    objetivo: "",
    escolhasCriacao: { periciasClasse: [], ferramentasClasse: [], periciasRaca: [], idiomasRaca: [], ferramentasRaca: [], idiomasAntecedente: [], ferramentasAntecedente: [], ferramentasSubstitutas: [] },
    bonusRacialEscolhido: [],
  }));

  const racaEscolhida = RACAS.find((r) => r.id === rascunho.racaId) ?? null;
  const classeEscolhida = CLASSES.find((c) => c.id === rascunho.classeId) ?? null;
  const antecedenteEscolhido =
    ANTECEDENTES.find((a) => a.id === rascunho.antecedenteId) ?? null;

  function irPara(indice) {
    setEtapa(Math.min(Math.max(indice, 0), ETAPAS.length - 1));
  }

  function handlePular() {
    const novaFicha = criarFicha();
    navigate(`/dnd5e/characters/${encodeURIComponent(novaFicha.id)}`, { replace: true });
  }

  function handleEscolherRaca(id) {
    setRascunho((atual) => ({
      ...atual,
      racaId: id,
      bonusRacialEscolhido: [],
      escolhasCriacao: { ...atual.escolhasCriacao, periciasRaca: [], idiomasRaca: [], ferramentasRaca: [], ferramentasSubstitutas: [] },
    }));
    irPara(etapa + 1);
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

  function handleFinalizar() {
    const bonusRacial = { ...(racaEscolhida?.bonusAtributos ?? {}) };
    for (const atributo of rascunho.bonusRacialEscolhido ?? []) {
      if (atributo) bonusRacial[atributo] = (bonusRacial[atributo] ?? 0) + 1;
    }
    const modCon = calcularModificador(
      rascunho.atributos.constituicao + (bonusRacial.constituicao ?? 0)
    );
    const modDes = calcularModificador(
      rascunho.atributos.destreza + (bonusRacial.destreza ?? 0)
    );
    const pvInicial = classeEscolhida ? classeEscolhida.dadoVida + modCon : 10;

    const espacosIniciais = classeEscolhida
      ? mesclarEspacosNoAtual(
          criarEspacosMagiaVazios(),
          obterEspacosPorNivel(classeEscolhida.id, 1) ?? {}
        )
      : criarEspacosMagiaVazios();

    const novaFicha = criarFicha(rascunho.nomePersonagem, {
      racaId: rascunho.racaId,
      classeId: rascunho.classeId,
      antecedenteId: rascunho.antecedenteId,
      atributos: rascunho.atributos,
      metodoAtributos: "arranjo-padrao",
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
        iniciativa: modDes,
        deslocamento: racaEscolhida?.deslocamento ?? 9,
      },
      pvPorNivel: { 1: pvInicial },
      espacosMagia: espacosIniciais,
    });

    navigate(`/dnd5e/characters/${encodeURIComponent(novaFicha.id)}`, { replace: true });
  }

  return (
    <div className="criacao-shell">
      <h1>Criar personagem D&D 5e</h1>
      <button type="button" className="criacao-pular" onClick={handlePular}>
        Pular e criar ficha em branco
      </button>

      <ol className="criacao-passos" tabIndex="0" aria-label="Etapas de criação">
        {ETAPAS.map((info, indice) => (
          <li
            key={info.chave}
            className={
              indice === etapa
                ? "criacao-passo is-ativo"
                : indice < etapa
                ? "criacao-passo is-concluido"
                : "criacao-passo"
            }
          >
            {info.label}
          </li>
        ))}
      </ol>

      <div className="criacao-conteudo">
        {etapa === 0 && (
          <EtapaEscolha
            titulo="Escolha sua Raça"
            texto="A raça define traços físicos, bônus de atributo e alguns talentos naturais do seu personagem."
            itens={RACAS}
            renderExtra={(raca) => (
              <p className="criacao-card-extra">
                {Object.entries(raca.bonusAtributos)
                  .map(
                    ([chave, valor]) =>
                      `${ATRIBUTOS.find((a) => a.chave === chave)?.abreviacao} ${formatarModificador(valor)}`
                  )
                  .join(" · ")}
              </p>
            )}
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
            <h2 className="criacao-titulo">Distribua seus Atributos</h2>
            <p className="criacao-texto">
              Distribua os valores {ARRANJO_PADRAO.join(", ")} entre os seis
              atributos (arranjo padrão — cada valor só pode ser usado uma
              vez). Bônus raciais entram à parte, automaticamente.
            </p>

            <div className="criacao-atributos-grid">
              {ATRIBUTOS.map((atributo) => {
                const bonusRacial = (racaEscolhida?.bonusAtributos?.[atributo.chave] ?? 0) + (rascunho.bonusRacialEscolhido ?? []).filter((chave) => chave === atributo.chave).length;
                const valorBase = rascunho.atributos[atributo.chave];
                const valorFinal = valorBase + bonusRacial;
                return (
                  <div key={atributo.chave} className="criacao-atributo-card">
                    <span className="criacao-atributo-label">{atributo.label}</span>
                    <select
                      aria-label={`Valor base de ${atributo.label}`}
                      value={valorBase}
                      onChange={(evento) =>
                        handleChangeAtributoValor(
                          atributo.chave,
                          Number(evento.target.value)
                        )
                      }
                    >
                      {ARRANJO_PADRAO.map((valor) => (
                        <option key={valor} value={valor}>
                          {valor}
                        </option>
                      ))}
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
              <button type="button" className="criacao-botao-avancar" onClick={() => irPara(etapa + 1)}>
                Próximo
              </button>
            </div>
          </section>
        )}

        {etapa === 4 && (
          <section>
            <h2 className="criacao-titulo">Toques Finais</h2>
            <p className="criacao-texto">
              Até aqui você definiu as características mecânicas da sua
              ficha — mas um bom personagem é mais do que apenas números.
              Esses campos não têm efeito nas regras, mas deixam o jogo mais
              envolvente.
            </p>

            <EscolhasDeCriacao
              rascunho={rascunho}
              raca={racaEscolhida}
              classe={classeEscolhida}
              antecedente={antecedenteEscolhido}
              onChange={(chave, valores) => setRascunho((atual) => ({
                ...atual,
                escolhasCriacao: { ...atual.escolhasCriacao, [chave]: valores },
              }))}
              onBonusRacial={(valores) => setRascunho((atual) => ({ ...atual, bonusRacialEscolhido: valores }))}
            />

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
              <button type="button" className="criacao-botao-finalizar" onClick={handleFinalizar}>
                Finalizar
              </button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function EscolhasDeCriacao({ rascunho, raca, classe, antecedente, onChange, onBonusRacial }) {
  const escolha = rascunho.escolhasCriacao ?? {};
  const seletor = (titulo, chave, quantidade, opcoes, rotulos, bloqueadas = []) => {
    if (!quantidade) return null;
    const valores = escolha[chave] ?? [];
    return <div className="criacao-campo" key={chave}>
      <span>{titulo} — escolha {quantidade}</span>
      {Array.from({ length: quantidade }).map((_, indice) => (
        <select key={indice} value={valores[indice] ?? ""} onChange={(evento) => {
          const proximos = [...valores]; proximos[indice] = evento.target.value || null; onChange(chave, proximos);
        }}>
          <option value="">Selecione...</option>
          {opcoes.filter((id) => !bloqueadas.includes(id) && (!valores.includes(id) || valores[indice] === id)).map((id) => <option key={id} value={id}>{rotulos[id] ?? id}</option>)}
        </select>
      ))}
    </div>;
  };
  const pericias = Object.fromEntries(PERICIAS.map((item) => [item.chave, item.label]));
  const idiomas = Object.fromEntries(IDIOMAS.map((item) => [item.id, item.nome]));
  const ferramentas = Object.fromEntries(FERRAMENTAS.map((item) => [item.id, item.nome]));
  const classeRegra = classe?.proficienciasIniciais?.pericias;
  const periciasClasse = classeRegra?.opcoes === "todas" ? PERICIAS.map((item) => item.chave) : classeRegra?.opcoes ?? [];
  const periciasRaca = raca?.periciasEscolha?.opcoes === "todas" ? PERICIAS.map((item) => item.chave) : raca?.periciasEscolha?.opcoes ?? [];
  const bloqueadasClasse = [...(antecedente?.periciasConcedidas ?? []), ...(raca?.periciasConcedidas ?? []), ...(escolha.periciasRaca ?? [])];
  const ferramentasFixas = [
    ...(classe?.proficienciasIniciais?.ferramentas ?? []),
    ...(raca?.ferramentasFixas ?? []),
    ...(antecedente?.ferramentasFixas ?? []),
  ];
  const substituicoes = quantidadeSubstituicoesFerramentas(classe, raca, antecedente);
  return <section className="criacao-escolhas">
    <h3 className="criacao-titulo">Escolhas obrigatórias</h3>
    {raca?.atributosEscolhaLivre && Array.from({ length: raca.atributosEscolhaLivre }).map((_, indice) => <select key={`atributo-${indice}`} value={rascunho.bonusRacialEscolhido?.[indice] ?? ""} onChange={(evento) => { const proximos = [...(rascunho.bonusRacialEscolhido ?? [])]; proximos[indice] = evento.target.value || null; onBonusRacial(proximos); }}><option value="">Atributo para +1...</option>{ATRIBUTOS.filter((a) => !raca.bonusAtributos?.[a.chave] && (!(rascunho.bonusRacialEscolhido ?? []).includes(a.chave) || rascunho.bonusRacialEscolhido?.[indice] === a.chave)).map((a) => <option key={a.chave} value={a.chave}>{a.label}</option>)}</select>)}
    {seletor("Perícias da classe", "periciasClasse", classeRegra?.quantidade, periciasClasse, pericias, bloqueadasClasse)}
    {seletor("Ferramentas da classe", "ferramentasClasse", classe?.proficienciasIniciais?.ferramentasEscolha?.quantidade, opcoesFerramentas(classe?.proficienciasIniciais?.ferramentasEscolha), ferramentas, [...ferramentasFixas, ...(escolha.ferramentasRaca ?? []), ...(escolha.ferramentasAntecedente ?? [])])}
    {seletor("Perícias da raça", "periciasRaca", raca?.periciasEscolha?.quantidade, periciasRaca, pericias, antecedente?.periciasConcedidas ?? [])}
    {seletor("Idiomas da raça", "idiomasRaca", raca?.idiomasEscolha, IDIOMAS.map((item) => item.id), idiomas, raca?.idiomasFixos ?? [])}
    {seletor("Ferramentas da raça", "ferramentasRaca", raca?.ferramentasEscolha?.quantidade, opcoesFerramentas(raca?.ferramentasEscolha), ferramentas, [...ferramentasFixas, ...(escolha.ferramentasClasse ?? []), ...(escolha.ferramentasAntecedente ?? [])])}
    {seletor("Idiomas do antecedente", "idiomasAntecedente", antecedente?.idiomasEscolha, IDIOMAS.map((item) => item.id), idiomas, [...(raca?.idiomasFixos ?? []), ...(escolha.idiomasRaca ?? [])])}
    {seletor("Ferramentas do antecedente", "ferramentasAntecedente", antecedente?.ferramentasEscolha?.quantidade, opcoesFerramentas(antecedente?.ferramentasEscolha), ferramentas, [...ferramentasFixas, ...(escolha.ferramentasClasse ?? []), ...(escolha.ferramentasRaca ?? [])])}
    {seletor("Substituições por proficiências repetidas", "ferramentasSubstitutas", substituicoes, FERRAMENTAS.map((item) => item.id), ferramentas, [...new Set([...ferramentasFixas, ...(escolha.ferramentasClasse ?? []), ...(escolha.ferramentasRaca ?? []), ...(escolha.ferramentasAntecedente ?? [])])])}
  </section>;
}

function EtapaEscolha({ titulo, texto, itens, renderExtra, onEscolher, onVoltar, onPular }) {
  return (
    <section>
      <h2 className="criacao-titulo">{titulo}</h2>
      <p className="criacao-texto">{texto}</p>

      <div className="criacao-cards-lista">
        {itens.map((item) => (
          <div key={item.id} className="criacao-card">
            <div className="criacao-card-corpo">
              <h3 className="criacao-card-nome">{item.nome}</h3>
              <p className="criacao-card-descricao">{item.descricao}</p>
              {renderExtra?.(item)}
            </div>
            <button
              type="button"
              className="criacao-card-escolher"
              onClick={() => onEscolher(item.id)}
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

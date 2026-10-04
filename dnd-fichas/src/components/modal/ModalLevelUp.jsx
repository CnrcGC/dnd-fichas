import { useState } from "react";
import { ATRIBUTOS, formatarModificador } from "../../utils/dnd";
import { rolarDado } from "../../utils/dados";
import { useRolagem } from "../../context/useRolagem";
import { obterHabilidadesPorClasse } from "../../data/habilidadesClasses";
import { recalcularPv } from "../../utils/progressao";
import { obterClasse } from "../../data/classes";
import { obterSubclassesPorClasse, obterNivelEscolhaSubclasse, obterSubclasse } from "../../data/subclasses";
import { obterHabilidadesPorSubclasse } from "../../data/habilidadesSubclasses";
import { MAGIAS } from "../../data/magiasSistema";
import { classesElegiveisParaMagia } from "../../utils/acessoMagias";
import { pendenciasProficienciasMulticlasse } from "../../utils/proficienciasMulticlasse";
import {
  aplicarTrocasMagias,
  magiasElegiveisParaTroca,
  obterRegraTroca,
  magiaElegivelPorSegredo,
} from "../../utils/regrasMagias";
import { calcularNivelTotal, NIVEL_MAXIMO_PERSONAGEM } from "../../utils/niveis";
import DetalheHabilidade from "./DetalheHabilidade";
import { useModalA11y } from "../../hooks/useModalA11y";
import Icon from "../icons/Icon";
import "./ModalCatalogoItens.css";
import "./ModalLevelUp.css";

const NIVEIS_ASI = [4, 8, 12, 16, 19];

const ROTULOS_ETAPAS = {
  "escolha-classe": "Escolha da classe",
  pv: "Pontos de vida",
  subclasse: "Escolha da subclasse",
  asi: "Melhoria de atributo",
  habilidades: "Novas habilidades",
  "troca-magia": "Troca de magia",
  resumo: "Resumo",
};

export default function ModalLevelUp({
  aberto,
  onFechar,
  ficha,
  classe,
  modificadoresAtributos,
  onConcluir,
}) {
  const { registrarRolagem } = useRolagem();
  const [etapa, setEtapa] = useState(0);

  // Todas as classes que dá pra subir: a principal + cada secundária de
  // multiclasse. Cada uma sabe seu próprio dado de vida e nível atual.
  const opcoesClasse = [
    {
      id: classe?.id,
      nome: classe?.nome,
      dadoVida: classe?.dadoVida,
      nivelAtual: ficha.nivel ?? 1,
      subclasseId: ficha.subclasseId ?? null,
      ehSecundaria: false,
      indiceSecundaria: null,
    },
    ...(ficha.classesSecundarias ?? [])
      .map((c, indice) => {
        const classeObj = obterClasse(c.classeId);
        return classeObj
          ? {
              id: classeObj.id,
              nome: classeObj.nome,
              dadoVida: classeObj.dadoVida,
              nivelAtual: c.nivel ?? 1,
              subclasseId: c.subclasseId ?? null,
              pendenteMulticlasse: pendenciasProficienciasMulticlasse(ficha, c.classeId).length > 0,
              ehSecundaria: true,
              indiceSecundaria: indice,
            }
          : null;
      })
      .filter(Boolean),
  ];

  const [classeEscolhidaId, setClasseEscolhidaId] = useState(classe?.id);

  const classeEscolhida =
    opcoesClasse.find((o) => o.id === classeEscolhidaId) ?? opcoesClasse[0];
  const novoNivelDaEscolhida = classeEscolhida.nivelAtual + 1;

  const nivelTotalAtual = calcularNivelTotal(ficha);
  const novoNivelTotal = nivelTotalAtual + 1;

  // ---- rascunho das escolhas, só vira de verdade ao "Concluir" ----
  const pvBanked = ficha.pvPorNivel?.[novoNivelTotal];
  const [metodoPv, setMetodoPv] = useState(
    pvBanked != null ? "banked" : null
  ); // "media" | "rolado" | "banked"
  const [ganhoPv, setGanhoPv] = useState(pvBanked ?? null);
  const [detalheRolagemPv, setDetalheRolagemPv] = useState(null);

  const [modoAsi, setModoAsi] = useState(null); // "duplo" | "unico" | "pular"
  const [atributoAsiUnico, setAtributoAsiUnico] = useState("forca");
  const [atributosAsiDuplo, setAtributosAsiDuplo] = useState(["forca", "destreza"]);

  const [habilidadesSelecionadas, setHabilidadesSelecionadas] = useState(() => new Set());
  const [subclasseEscolhidaId, setSubclasseEscolhidaId] = useState(null);
  const [trocasMagias, setTrocasMagias] = useState([]);
  const dialogRef = useModalA11y(
    aberto && Boolean(classe) && nivelTotalAtual < NIVEL_MAXIMO_PERSONAGEM,
    fecharEResetar
  );

  if (!aberto || !classe || nivelTotalAtual >= NIVEL_MAXIMO_PERSONAGEM) return null;

  const chaveAsi = `${classeEscolhida.id}-${novoNivelDaEscolhida}`;
  const nivelEscolhaSubclasse = obterNivelEscolhaSubclasse(classeEscolhida.id);
  const precisaEscolherSubclasse =
    !classeEscolhida.subclasseId &&
    novoNivelDaEscolhida >= (nivelEscolhaSubclasse ?? Infinity);
  const subclassesDisponiveis = obterSubclassesPorClasse(classeEscolhida.id);
  const subclasseNoLevelUp =
    obterSubclasse(precisaEscolherSubclasse ? subclasseEscolhidaId : classeEscolhida.subclasseId);
  const habilidadesSubclasseDoNivel = subclasseNoLevelUp
    ? obterHabilidadesPorSubclasse(subclasseNoLevelUp.id).filter(
        (habilidade) => habilidade.nivel === novoNivelDaEscolhida
      )
    : [];
  const subclasseEfetiva = subclasseNoLevelUp?.id ?? classeEscolhida.subclasseId;
  const fichaNoNovoNivel = classeEscolhida.ehSecundaria
    ? {
        ...ficha,
        classesSecundarias: (ficha.classesSecundarias ?? []).map((classeSecundaria, indice) =>
          indice === classeEscolhida.indiceSecundaria
            ? {
                ...classeSecundaria,
                nivel: novoNivelDaEscolhida,
                subclasseId: subclasseEfetiva ?? null,
              }
            : classeSecundaria
        ),
      }
    : {
        ...ficha,
        nivel: novoNivelDaEscolhida,
        subclasseId: subclasseEfetiva ?? null,
      };
  const chaveTroca = `${classeEscolhida.id}-${novoNivelDaEscolhida}`;
  const regraTroca = obterRegraTroca(fichaNoNovoNivel, classeEscolhida.id, novoNivelDaEscolhida);
  const magiasSubstituiveis = magiasElegiveisParaTroca(fichaNoNovoNivel, classeEscolhida.id, novoNivelDaEscolhida);
  const quantidadeTrocas = regraTroca?.quantidade ?? 0;
  const trocasAtivas = Array.from({ length: quantidadeTrocas }, (_, indice) => ({
    removidaId: trocasMagias[indice]?.removidaId ?? "",
    novaMagiaId: trocasMagias[indice]?.novaMagiaId ?? "",
  }));
  const trocaJaResolvida = Boolean((ficha.trocasMagiasAplicadas ?? {})[chaveTroca]);
  const podeTrocarMagia = quantidadeTrocas > 0 && magiasSubstituiveis.length > 0 && !trocaJaResolvida;
  const temAsi = NIVEIS_ASI.includes(novoNivelDaEscolhida);
  const asiJaAplicado = (ficha.niveisAsiAplicados ?? []).includes(chaveAsi);

  const habilidadesDoNivel = obterHabilidadesPorClasse(classeEscolhida.id).filter(
    (h) => h.nivel === novoNivelDaEscolhida
  );
  const origensHabilidadesJaConcedidas = new Set(
    (ficha.habilidades ?? [])
      .filter((h) => h.tipo === "classe")
      .map((h) => h.origemId)
  );
  const habilidadesNovasDoNivel = habilidadesDoNivel.filter(
    (h) => !origensHabilidadesJaConcedidas.has(h.id)
  );
  const temHabilidades = habilidadesNovasDoNivel.length > 0;

  const etapas = [
    ...(opcoesClasse.length > 1 ? ["escolha-classe"] : []),
    "pv",
    ...(precisaEscolherSubclasse ? ["subclasse"] : []),
    ...(temAsi && !asiJaAplicado ? ["asi"] : []),
    ...(temHabilidades ? ["habilidades"] : []),
    ...(podeTrocarMagia ? ["troca-magia"] : []),
    "resumo",
  ];
  const etapaAtual = etapas[etapa];

  function fecharEResetar() {
    setEtapa(0);
    setModoAsi(null);
    setAtributoAsiUnico("forca");
    setAtributosAsiDuplo(["forca", "destreza"]);
    setHabilidadesSelecionadas(new Set());
    setSubclasseEscolhidaId(null);
    setTrocasMagias([]);
    onFechar();
  }

  function irProximaEtapa() {
    setEtapa((atual) => Math.min(atual + 1, etapas.length - 1));
  }

  function irEtapaAnterior() {
    setEtapa((atual) => Math.max(atual - 1, 0));
  }

  // ---- PV ----
  const modCon = modificadoresAtributos.constituicao;
  const valorMedia = Math.max(
    1,
    Math.floor(classeEscolhida.dadoVida / 2) + 1 + modCon
  );

  function handleUsarMedia() {
    setMetodoPv("media");
    setGanhoPv(valorMedia);
    setDetalheRolagemPv(null);
  }

  function handleRolarPv() {
    if (detalheRolagemPv) return; // já rolou — não dá pra rerolar
    const dado = rolarDado(classeEscolhida.dadoVida);
    const total = Math.max(1, dado + modCon);
    setMetodoPv("rolado");
    setGanhoPv(total);
    setDetalheRolagemPv({ dado, modCon, total });
    registrarRolagem(
      `Level up: PV (d${classeEscolhida.dadoVida})`,
      {
        formula: `1d${classeEscolhida.dadoVida}+${modCon}`,
        total,
        detalhes: [
          { texto: `1d${classeEscolhida.dadoVida}`, rolagens: [dado], soma: dado },
          { texto: "mod. CON", rolagens: [], soma: modCon },
        ],
      },
      "formula"
    );
  }

  // ---- Habilidades ----
  function alternarHabilidade(id) {
    setHabilidadesSelecionadas((atual) => {
      const proxima = new Set(atual);
      if (proxima.has(id)) {
        proxima.delete(id);
      } else {
        proxima.add(id);
      }
      return proxima;
    });
  }

  function alterarTrocaMagia(indice, campo, valor) {
    setTrocasMagias((atuais) => {
      const proximas = [...atuais];
      proximas[indice] = {
        removidaId: proximas[indice]?.removidaId ?? "",
        novaMagiaId: proximas[indice]?.novaMagiaId ?? "",
        [campo]: valor,
        ...(campo === "removidaId" ? { novaMagiaId: "" } : {}),
      };
      return proximas;
    });
  }

  function novasMagiasElegiveisParaTroca(indiceTroca) {
    const trocaAtual = trocasAtivas[indiceTroca];
    const magiaRemovida = (ficha.magias ?? []).find(
      (magia) => magia.id === trocaAtual.removidaId
    );
    if (!magiaRemovida) return [];

    const idsRemovidos = new Set(trocasAtivas.map((troca) => troca.removidaId).filter(Boolean));
    const idsNovosEmOutrasTrocas = new Set(
      trocasAtivas
        .filter((_, indice) => indice !== indiceTroca)
        .map((troca) => troca.novaMagiaId)
        .filter(Boolean)
    );
    const magiasMantidas = (fichaNoNovoNivel.magias ?? []).filter(
      (magia) => !idsRemovidos.has(magia.id)
    );
    const magiasProvisorias = trocasAtivas.flatMap((troca, indice) => {
      if (indice === indiceTroca || !troca.removidaId || !troca.novaMagiaId) return [];
      const removida = (ficha.magias ?? []).find((magia) => magia.id === troca.removidaId);
      const nova = MAGIAS.find((magia) => magia.id === troca.novaMagiaId);
      if (!removida || !nova) return [];
      return [{
        ...removida,
        origemId: nova.id,
        nome: nova.nome,
        nivel: nova.nivel,
      }];
    });
    const fichaParaNovaMagia = {
      ...fichaNoNovoNivel,
      magias: [...magiasMantidas, ...magiasProvisorias],
    };

    return MAGIAS.filter((magia) =>
      Number(magia.nivel) > 0 &&
      magia.id !== magiaRemovida.origemId &&
      !idsNovosEmOutrasTrocas.has(magia.id) &&
      !magiasMantidas.some((existente) =>
        existente.origemId === magia.id &&
        (existente.classeId === classeEscolhida.id ||
          existente.origemEspecial?.classeId === classeEscolhida.id)
      ) &&
      (magiaRemovida.origemEspecial?.tipo === "segredos-magicos"
        ? magiaElegivelPorSegredo(fichaNoNovoNivel, classeEscolhida.id, magia)
        : classesElegiveisParaMagia(fichaParaNovaMagia, magia, true).some(
            (classeElegivel) => classeElegivel.classeId === classeEscolhida.id
          ))
    );
  }

  function trocaMagiaValida(troca, indice) {
    if (!troca.removidaId && !troca.novaMagiaId) return true;
    if (!troca.removidaId || !troca.novaMagiaId) return false;
    return novasMagiasElegiveisParaTroca(indice).some(
      (magia) => magia.id === troca.novaMagiaId
    );
  }

  // seleciona todas por padrão na primeira vez que a etapa é vista
  if (
    etapaAtual === "habilidades" &&
    habilidadesSelecionadas.size === 0 &&
    habilidadesNovasDoNivel.length > 0
  ) {
    setHabilidadesSelecionadas(new Set(habilidadesNovasDoNivel.map((h) => h.id)));
  }

  // ---- Concluir ----
  function handleConcluir() {
    if (novoNivelTotal > NIVEL_MAXIMO_PERSONAGEM) return;
    if (classeEscolhida.pendenteMulticlasse) return;
    if (precisaEscolherSubclasse && !subclasseEscolhidaId) return;
    if (trocasAtivas.some((troca, indice) => !trocaMagiaValida(troca, indice))) return;

    const novosAtributos = { ...ficha.atributos };
    if (!asiJaAplicado) {
      if (modoAsi === "unico") {
        novosAtributos[atributoAsiUnico] = Math.min(
          20,
          novosAtributos[atributoAsiUnico] + 2
        );
      } else if (modoAsi === "duplo") {
        for (const chave of atributosAsiDuplo) {
          novosAtributos[chave] = Math.min(20, novosAtributos[chave] + 1);
        }
      }
    }

    const novasHabilidades = habilidadesNovasDoNivel
      .filter((h) => habilidadesSelecionadas.has(h.id))
      .map((h) => ({
        id: crypto.randomUUID(),
        nome: h.nome,
        tipo: "classe",
        nivel: h.nivel,
        origemId: h.id,
      }));

    const { pvPorNivel, origemClassePvPorNivel, status } = recalcularPv(
      ficha,
      obterClasse(classeEscolhida.id),
      modCon,
      novoNivelTotal,
      { [novoNivelTotal]: ganhoPv ?? 0 }
    );

    const niveisAsiAplicados =
      temAsi && !asiJaAplicado
        ? [...(ficha.niveisAsiAplicados ?? []), chaveAsi]
        : ficha.niveisAsiAplicados ?? [];

    const atualizacoes = {
      pvPorNivel,
      origemClassePvPorNivel,
      status,
      atributos: novosAtributos,
      niveisAsiAplicados,
      habilidades: [...(ficha.habilidades ?? []), ...novasHabilidades],
    };
    const trocasConcluidas = trocasAtivas.filter(
      (troca) => troca.removidaId && troca.novaMagiaId
    );
    if (trocasConcluidas.length > 0) {
      atualizacoes.magias = aplicarTrocasMagias(
        ficha.magias,
        trocasConcluidas,
        classeEscolhida.id
      );
    }
    if (regraTroca && !trocaJaResolvida) {
      atualizacoes.trocasMagiasAplicadas = {
        ...(ficha.trocasMagiasAplicadas ?? {}),
        [chaveTroca]: {
          classeId: classeEscolhida.id,
          nivel: novoNivelDaEscolhida,
          quantidadeDisponivel: quantidadeTrocas,
          trocas: trocasConcluidas,
          ignorada: trocasConcluidas.length === 0,
        },
      };
    }
    if (classeEscolhida.ehSecundaria) {
      const novasClassesSecundarias = [...(ficha.classesSecundarias ?? [])];
      novasClassesSecundarias[classeEscolhida.indiceSecundaria] = {
        ...novasClassesSecundarias[classeEscolhida.indiceSecundaria],
        nivel: novoNivelDaEscolhida,
        ...(precisaEscolherSubclasse ? { subclasseId: subclasseEscolhidaId } : {}),
      };
      atualizacoes.classesSecundarias = novasClassesSecundarias;
    } else {
      atualizacoes.nivel = novoNivelDaEscolhida;
      if (precisaEscolherSubclasse) atualizacoes.subclasseId = subclasseEscolhidaId;
    }

    onConcluir(atualizacoes);
    fecharEResetar();
  }

  function handleBackdropClick(evento) {
    if (evento.target === evento.currentTarget) fecharEResetar();
  }

  const podeAvancarPv = ganhoPv !== null;
  const podeAvancarAsi =
    modoAsi === "pular" ||
    (modoAsi === "unico" && atributoAsiUnico) ||
    (modoAsi === "duplo" && atributosAsiDuplo[0] !== atributosAsiDuplo[1]);

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div
        ref={dialogRef}
        tabIndex="-1"
        className="modal-catalogo levelup-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-levelup-titulo"
        aria-describedby="modal-levelup-etapa"
      >
        <div className="modal-catalogo-cabecalho">
          <h2 id="modal-levelup-titulo">
            Subir de Nível — {classeEscolhida.nome} {classeEscolhida.nivelAtual} → {novoNivelDaEscolhida}
          </h2>
          <button type="button" className="modal-catalogo-fechar" onClick={fecharEResetar} aria-label="Fechar">
            <Icon name="remove" />
          </button>
        </div>

        <p id="modal-levelup-etapa" className="visually-hidden" role="status" aria-live="polite">
          Etapa {etapa + 1} de {etapas.length}: {ROTULOS_ETAPAS[etapaAtual] ?? etapaAtual}
        </p>
        <div className="levelup-passos" aria-hidden="true">
          {etapas.map((passo, indice) => (
            <span
              key={passo}
              className={indice === etapa ? "levelup-passo is-ativo" : "levelup-passo"}
            />
          ))}
        </div>

        <div className="levelup-corpo">
          {etapaAtual === "escolha-classe" && (
            <div className="levelup-etapa">
              <h3>Qual classe está subindo?</h3>
              <p className="levelup-texto">
                Nível total do personagem: {nivelTotalAtual} → {novoNivelTotal}
              </p>
              <div className="levelup-opcoes-pv">
                {opcoesClasse.map((opcao) => (
                  <button
                    key={opcao.id}
                    type="button"
                    className={
                      classeEscolhidaId === opcao.id
                        ? "levelup-opcao-botao is-selecionado"
                        : "levelup-opcao-botao"
                    }
                    onClick={() => {
                      setClasseEscolhidaId(opcao.id);
                      setSubclasseEscolhidaId(null);
                      setTrocasMagias([]);
                    }}
                    disabled={opcao.pendenteMulticlasse}
                    aria-pressed={classeEscolhidaId === opcao.id}
                  >
                    {opcao.nome}
                    <span className="levelup-opcao-detalhe">
                      nível {opcao.nivelAtual} → {opcao.nivelAtual + 1}
                      {opcao.pendenteMulticlasse && " · escolha as proficiências pendentes primeiro"}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {etapaAtual === "pv" && (
            <div className="levelup-etapa">
              <h3>Pontos de vida</h3>
              <p className="levelup-texto">
                {classeEscolhida.nome} usa dado de vida d{classeEscolhida.dadoVida}.
                Modificador de Constituição: {formatarModificador(modCon)}.
              </p>

              {metodoPv === "banked" ? (
                <p className="levelup-texto">
                  Você já tinha chegado nesse nível total antes — o PV já foi
                  definido como <strong>+{ganhoPv}</strong> e não muda mais
                  (sem reroll).
                </p>
              ) : (
                <div className="levelup-opcoes-pv">
                  <button
                    type="button"
                    className={
                      metodoPv === "media"
                        ? "levelup-opcao-botao is-selecionado"
                        : "levelup-opcao-botao"
                    }
                    onClick={handleUsarMedia}
                    aria-pressed={metodoPv === "media"}
                  >
                    Usar média
                    <span className="levelup-opcao-detalhe">+{valorMedia} PV</span>
                  </button>
                  <button
                    type="button"
                    className={
                      metodoPv === "rolado"
                        ? "levelup-opcao-botao is-selecionado"
                        : "levelup-opcao-botao"
                    }
                    onClick={handleRolarPv}
                    disabled={detalheRolagemPv !== null}
                    aria-pressed={metodoPv === "rolado"}
                  >
                    <Icon name="dice" /> Rolar o dado
                    <span className="levelup-opcao-detalhe">
                      {detalheRolagemPv
                        ? `${detalheRolagemPv.dado} + ${detalheRolagemPv.modCon} = +${detalheRolagemPv.total} PV (definitivo)`
                        : `1d${classeEscolhida.dadoVida} + CON`}
                    </span>
                  </button>
                </div>
              )}
            </div>
          )}

          {etapaAtual === "subclasse" && (
            <div className="levelup-etapa">
              <h3>Escolha a subclasse</h3>
              <p className="levelup-texto">
                {classeEscolhida.nome} desbloqueia a subclasse no nível {nivelEscolhaSubclasse}.
                A escolha será salva somente ao concluir o level up.
              </p>
              <div className="levelup-opcoes-pv">
                {subclassesDisponiveis.map((subclasse) => (
                  <button
                    key={subclasse.id}
                    type="button"
                    className={
                      subclasseEscolhidaId === subclasse.id
                        ? "levelup-opcao-botao is-selecionado"
                        : "levelup-opcao-botao"
                    }
                    onClick={() => setSubclasseEscolhidaId(subclasse.id)}
                    aria-pressed={subclasseEscolhidaId === subclasse.id}
                  >
                    {subclasse.nome}
                    <span className="levelup-opcao-detalhe">{subclasse.descricao}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {etapaAtual === "asi" && (
            <div className="levelup-etapa">
              <h3>Melhoria de Atributo (ASI)</h3>
              <p className="levelup-texto">
                {classeEscolhida.nome}, nível {novoNivelDaEscolhida}: você pode aumentar
                atributos ou pular pra pegar um talento depois.
              </p>

              <div className="levelup-opcoes-pv">
                <button
                  type="button"
                  className={
                    modoAsi === "duplo"
                      ? "levelup-opcao-botao is-selecionado"
                      : "levelup-opcao-botao"
                  }
                  onClick={() => setModoAsi("duplo")}
                  aria-pressed={modoAsi === "duplo"}
                >
                  +1 em dois atributos
                </button>
                <button
                  type="button"
                  className={
                    modoAsi === "unico"
                      ? "levelup-opcao-botao is-selecionado"
                      : "levelup-opcao-botao"
                  }
                  onClick={() => setModoAsi("unico")}
                  aria-pressed={modoAsi === "unico"}
                >
                  +2 em um atributo
                </button>
                <button
                  type="button"
                  className={
                    modoAsi === "pular"
                      ? "levelup-opcao-botao is-selecionado"
                      : "levelup-opcao-botao"
                  }
                  onClick={() => setModoAsi("pular")}
                  aria-pressed={modoAsi === "pular"}
                >
                  Pular (vou pegar um talento)
                </button>
              </div>

              {modoAsi === "unico" && (
                <select
                  className="levelup-select"
                  aria-label="Atributo para receber mais dois"
                  value={atributoAsiUnico}
                  onChange={(evento) => setAtributoAsiUnico(evento.target.value)}
                >
                  {ATRIBUTOS.map((a) => (
                    <option key={a.chave} value={a.chave}>
                      {a.label} ({ficha.atributos[a.chave]} → {Math.min(20, ficha.atributos[a.chave] + 2)})
                    </option>
                  ))}
                </select>
              )}

              {modoAsi === "duplo" && (
                <div className="levelup-select-dupla">
                  <select
                    className="levelup-select"
                    aria-label="Primeiro atributo para receber mais um"
                    value={atributosAsiDuplo[0]}
                    onChange={(evento) =>
                      setAtributosAsiDuplo([evento.target.value, atributosAsiDuplo[1]])
                    }
                  >
                    {ATRIBUTOS.map((a) => (
                      <option key={a.chave} value={a.chave}>
                        {a.label} ({ficha.atributos[a.chave]} → {Math.min(20, ficha.atributos[a.chave] + 1)})
                      </option>
                    ))}
                  </select>
                  <select
                    className="levelup-select"
                    aria-label="Segundo atributo para receber mais um"
                    value={atributosAsiDuplo[1]}
                    onChange={(evento) =>
                      setAtributosAsiDuplo([atributosAsiDuplo[0], evento.target.value])
                    }
                  >
                    {ATRIBUTOS.map((a) => (
                      <option key={a.chave} value={a.chave}>
                        {a.label} ({ficha.atributos[a.chave]} → {Math.min(20, ficha.atributos[a.chave] + 1)})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          {etapaAtual === "habilidades" && (
            <div className="levelup-etapa">
              <h3>Novas habilidades de {classeEscolhida.nome}</h3>
              <p className="levelup-texto">
                No nível {novoNivelDaEscolhida}, essa classe ganha isso. Desmarque o que não
                quiser adicionar agora.
              </p>
              <div className="levelup-habilidades-lista">
                {habilidadesNovasDoNivel.map((h) => (
                  <div key={h.id} className="levelup-habilidade-item">
                    <label className="levelup-habilidade-cabecalho">
                      <input
                        type="checkbox"
                        checked={habilidadesSelecionadas.has(h.id)}
                        onChange={() => alternarHabilidade(h.id)}
                      />
                      <span>{h.nome}</span>
                    </label>
                    <DetalheHabilidade item={h} tipo="classe" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {etapaAtual === "troca-magia" && (
            <div className="levelup-etapa">
              <h3>{quantidadeTrocas === 1 ? "Trocar magia conhecida" : `Trocar até ${quantidadeTrocas} magias conhecidas`}</h3>
              <p className="levelup-texto">
                {regraTroca?.mensagem ?? "Esta troca é opcional."} A nova magia precisa ser válida para {classeEscolhida.nome}
                no nível {novoNivelDaEscolhida}; a mudança só será aplicada ao concluir.
              </p>
              {trocasAtivas.map((troca, indice) => {
                const removidasEmOutrasTrocas = new Set(
                  trocasAtivas
                    .filter((_, outroIndice) => outroIndice !== indice)
                    .map((item) => item.removidaId)
                    .filter(Boolean)
                );
                const novasElegiveis = novasMagiasElegiveisParaTroca(indice);
                return (
                  <div key={indice} className="levelup-troca-magia">
                    <strong>Troca {indice + 1}</strong>
                    <select
                      className="levelup-select"
                      aria-label={`Magia removida na troca ${indice + 1}`}
                      value={troca.removidaId}
                      onChange={(evento) => alterarTrocaMagia(indice, "removidaId", evento.target.value)}
                    >
                      <option value="">Não usar esta troca</option>
                      {magiasSubstituiveis
                        .filter((magia) => !removidasEmOutrasTrocas.has(magia.id))
                        .map((magia) => (
                          <option key={magia.id} value={magia.id}>
                            {magia.nome} ({magia.nivel}º círculo)
                          </option>
                        ))}
                    </select>
                    {troca.removidaId && (
                      <select
                        className="levelup-select"
                        aria-label={`Nova magia da troca ${indice + 1}`}
                        value={troca.novaMagiaId}
                        onChange={(evento) => alterarTrocaMagia(indice, "novaMagiaId", evento.target.value)}
                      >
                        <option value="">Escolha a nova magia</option>
                        {novasElegiveis.map((magia) => (
                          <option key={magia.id} value={magia.id}>
                            {magia.nome} ({magia.nivel}º círculo)
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {etapaAtual === "resumo" && (
            <div className="levelup-etapa">
              <h3>Resumo</h3>
              <ul className="levelup-resumo-lista">
                <li>
                  {classeEscolhida.nome}: nível {classeEscolhida.nivelAtual} →{" "}
                  <strong>{novoNivelDaEscolhida}</strong>
                </li>
                <li>
                  Nível total do personagem: {nivelTotalAtual} →{" "}
                  <strong>{novoNivelTotal}</strong>
                </li>
                <li>
                  Pontos de vida: <strong>+{ganhoPv ?? 0}</strong> ({ficha.status.pvMax} →{" "}
                  {ficha.status.pvMax + (ganhoPv ?? 0)})
                  {metodoPv === "banked" && " (valor já definido antes, sem reroll)"}
                </li>
                {asiJaAplicado && temAsi && (
                  <li>ASI desse nível já foi escolhido antes — não muda de novo</li>
                )}
                {modoAsi === "unico" && (
                  <li>
                    {ATRIBUTOS.find((a) => a.chave === atributoAsiUnico)?.label}: +2
                  </li>
                )}
                {modoAsi === "duplo" && (
                  <li>
                    {atributosAsiDuplo
                      .map((chave) => ATRIBUTOS.find((a) => a.chave === chave)?.label)
                      .join(" e ")}
                    : +1 cada
                  </li>
                )}
                {modoAsi === "pular" && <li>Sem ASI (lembre de anotar o talento)</li>}
                {temHabilidades && (
                  <li>
                    Habilidades novas: {habilidadesSelecionadas.size} de{" "}
                    {habilidadesNovasDoNivel.length}
                  </li>
                )}
                {subclasseNoLevelUp && (
                  <li>
                    Subclasse: <strong>{subclasseNoLevelUp.nome}</strong>
                  </li>
                )}
                {habilidadesSubclasseDoNivel.length > 0 && (
                  <li>
                    Características de subclasse: {habilidadesSubclasseDoNivel
                      .map((habilidade) => habilidade.nome)
                      .join(", ")}
                  </li>
                )}
                {trocasAtivas.filter((troca) => troca.removidaId && troca.novaMagiaId).map((troca, indice) => (
                  <li key={`${troca.removidaId}-${indice}`}>
                    Magia substituída: {magiasSubstituiveis.find((magia) => magia.id === troca.removidaId)?.nome}
                    {" → "}
                    {MAGIAS.find((magia) => magia.id === troca.novaMagiaId)?.nome}
                  </li>
                ))}
                                <li>Espaços de magia recalculados considerando todas as suas classes</li>
              </ul>
            </div>
          )}
        </div>

        <div className="levelup-navegacao">
          <button
            type="button"
            className="levelup-nav-botao"
            onClick={irEtapaAnterior}
            disabled={etapa === 0}
          >
            Voltar
          </button>
          {etapaAtual === "resumo" ? (
            <button type="button" className="levelup-concluir-botao" onClick={handleConcluir}>
              Concluir level up
            </button>
          ) : (
            <button
              type="button"
              className="levelup-nav-botao is-primario"
              onClick={irProximaEtapa}
              disabled={
                (etapaAtual === "pv" && !podeAvancarPv) ||
                (etapaAtual === "asi" && !podeAvancarAsi) ||
                (etapaAtual === "subclasse" && !subclasseEscolhidaId) ||
                (etapaAtual === "troca-magia" && trocasAtivas.some(
                  (troca, indice) => !trocaMagiaValida(troca, indice)
                ))
              }
            >
              Próximo
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

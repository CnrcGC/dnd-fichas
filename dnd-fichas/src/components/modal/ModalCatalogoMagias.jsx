import { useMemo, useState } from "react";
import { MAGIAS, ESCOLAS } from "../../data/magiasSistema";
import { CLASSES } from "../../data/classes";
import {
  classesElegiveisParaMagia,
  contarMagiasDeQualquerEscola,
  limiteMagiasDeQualquerEscola,
} from "../../utils/acessoMagias";
import DetalheMagia from "./DetalheMagia";
import { limiteSegredosMagicos, contarSegredosMagicos, magiaElegivelPorSegredo } from "../../utils/regrasMagias";
import { useModalA11y } from "../../hooks/useModalA11y";
import Icon from "../icons/Icon";
import "./ModalCatalogoItens.css";

const NIVEIS_ABA = [
  { valor: 0, label: "Truque" },
  ...Array.from({ length: 9 }, (_, indice) => ({
    valor: indice + 1,
    label: `${indice + 1}º`,
  })),
];

export default function ModalCatalogoMagias({
  aberto,
  onFechar,
  onAdicionarMagia,
  ficha,
  modificadoresConjuracao = {},
  onAplicarEfeitoPv,
  onAplicarCondicao,
}) {
  const [classeAtiva, setClasseAtiva] = useState(ficha.classeId ?? "");
  const [nivelAtivo, setNivelAtivo] = useState(0);
  const [busca, setBusca] = useState("");
  const [expandidos, setExpandidos] = useState(() => new Set());
  const dialogRef = useModalA11y(aberto, onFechar);

  const classesDaFicha = useMemo(() => {
    const ids = [
      ficha.classeId,
      ...(ficha.classesSecundarias ?? []).map((item) => item.classeId),
    ];

    const classes = [...new Set(ids.filter(Boolean))].map((id) => ({
      id,
      nome: CLASSES.find((classe) => classe.id === id)?.nome ?? id,
    }));
    const restantes = limiteSegredosMagicos(ficha, "bardo") - contarSegredosMagicos(ficha, "bardo");
    if (restantes > 0) classes.push({ id: "segredos-magicos", nome: `Segredos Mágicos (${restantes})` });
    return classes;
  }, [ficha]);

  // Se a classe ativa foi removida da ficha, volta à primeira disponível.
  const classeSelecionada = classesDaFicha.some(
    (classe) => classe.id === classeAtiva
  )
    ? classeAtiva
    : (classesDaFicha[0]?.id ?? null);
  const dadosClasseSelecionada = [
    { classeId: ficha.classeId, nivel: ficha.nivel, subclasseId: ficha.subclasseId },
    ...(ficha.classesSecundarias ?? []),
  ].find((classe) => classe.classeId === classeSelecionada);
  const conjuracaoParcial = ["cavaleiro-arcano", "trapaceiro-arcano"].includes(
    dadosClasseSelecionada?.subclasseId
  );

  const niveisDisponiveis = useMemo(
    () =>
      NIVEIS_ABA.filter(({ valor }) =>
        MAGIAS.some(
          (magia) => magia.nivel === valor && (classeSelecionada === "segredos-magicos"
            ? magiaElegivelPorSegredo(ficha, "bardo", magia)
            : classesElegiveisParaMagia(ficha, magia, true).some(({ classeId }) => classeId === classeSelecionada))
        )
      ),
    [ficha, classeSelecionada]
  );

  // Ao mudar de classe, evita permanecer num círculo que ela não possui.
  const nivelSelecionado = niveisDisponiveis.some(
    ({ valor }) => valor === nivelAtivo
  )
    ? nivelAtivo
    : (niveisDisponiveis[0]?.valor ?? 0);

  const magiasFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    return MAGIAS.filter(
      (magia) =>
        magia.nivel === nivelSelecionado &&
        (!termo || magia.nome.toLowerCase().includes(termo)) &&
        (classeSelecionada === "segredos-magicos"
          ? magiaElegivelPorSegredo(ficha, "bardo", magia)
          : classesElegiveisParaMagia(ficha, magia, true).some(({ classeId }) => classeId === classeSelecionada))
    );
  }, [ficha, classeSelecionada, nivelSelecionado, busca]);

  if (!aberto) return null;

  function alternarExpandido(id) {
    setExpandidos((atual) => {
      const novo = new Set(atual);
      if (novo.has(id)) novo.delete(id);
      else novo.add(id);
      return novo;
    });
  }

  function handleBackdropClick(evento) {
    if (evento.target === evento.currentTarget) onFechar();
  }

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div
        ref={dialogRef}
        tabIndex="-1"
        className="modal-catalogo"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-catalogo-magias-titulo"
      >
        <div className="modal-catalogo-cabecalho">
          <h2 id="modal-catalogo-magias-titulo">Adicionar Magias</h2>
          <button
            type="button"
            className="modal-catalogo-fechar"
            onClick={onFechar}
            aria-label="Fechar"
          >
            <Icon name="remove" />
          </button>
        </div>

        <p className="modal-catalogo-grupo-label">Classe</p>
        <div className="modal-catalogo-abas" aria-label="Classes da ficha">
          {classesDaFicha.map((classe) => (
            <button
              key={classe.id}
              type="button"
              className={
                classeSelecionada === classe.id
                  ? "modal-catalogo-aba is-ativa"
                  : "modal-catalogo-aba"
              }
              aria-pressed={classeSelecionada === classe.id}
              onClick={() => {
                setClasseAtiva(classe.id);
                setNivelAtivo(0);
              }}
            >
              {classe.nome}
            </button>
          ))}
        </div>

        {conjuracaoParcial && Number(dadosClasseSelecionada.nivel) >= 3 && (
          <p className="modal-catalogo-grupo-label">
            {dadosClasseSelecionada.subclasseId === "cavaleiro-arcano"
              ? "Magias de Abjuração e Evocação"
              : "Magias de Encantamento e Ilusão"}
            {` · escolhas de outras escolas: ${contarMagiasDeQualquerEscola(ficha, classeSelecionada)}/${limiteMagiasDeQualquerEscola(dadosClasseSelecionada.nivel)}`}
          </p>
        )}

        {niveisDisponiveis.length > 0 && (
          <>
            <p className="modal-catalogo-grupo-label">Círculo</p>
            <div className="modal-catalogo-abas" aria-label="Círculos disponíveis">
              {niveisDisponiveis.map((nivel) => (
                <button
                  key={nivel.valor}
                  type="button"
                  className={
                    nivelSelecionado === nivel.valor
                      ? "modal-catalogo-aba is-ativa"
                      : "modal-catalogo-aba"
                  }
                  aria-pressed={nivelSelecionado === nivel.valor}
                  onClick={() => setNivelAtivo(nivel.valor)}
                >
                  {nivel.label}
                </button>
              ))}
            </div>
          </>
        )}

        <input
          type="text"
          className="modal-catalogo-busca"
          aria-label="Buscar magias"
          placeholder="Buscar nesta classe e círculo..."
          value={busca}
          onChange={(evento) => setBusca(evento.target.value)}
        />
        <p className="visually-hidden" role="status" aria-live="polite" aria-atomic="true">
          {magiasFiltradas.length} {magiasFiltradas.length === 1 ? "magia encontrada" : "magias encontradas"}.
        </p>

        <div className="modal-catalogo-lista">
          {niveisDisponiveis.length === 0 ? (
            <p className="modal-catalogo-vazio">
              Esta classe não possui magias disponíveis no catálogo no nível
              atual. Para talento, item ou regra da mesa, use “Magia
              personalizada” na ficha.
            </p>
          ) : magiasFiltradas.length === 0 ? (
            <p className="modal-catalogo-vazio">
              Nenhuma magia corresponde à busca neste círculo.
            </p>
          ) : (
            magiasFiltradas.map((magia) => {
              const expandido = expandidos.has(magia.id);

              return (
                <div key={magia.id} className="item-catalogo">
                  <button
                    type="button"
                    className="item-catalogo-cabecalho"
                    onClick={() => alternarExpandido(magia.id)}
                    aria-expanded={expandido}
                  >
                    <span
                      className={
                        expandido
                          ? "item-catalogo-seta is-aberta"
                          : "item-catalogo-seta"
                      }
                      aria-hidden="true"
                    >
                      <Icon name="chevron" className="ui-icon--chevron" />
                    </span>
                    <span className="item-catalogo-nome">{magia.nome}</span>
                    <span className="item-catalogo-resumo">
                      {ESCOLAS[magia.escola] ?? magia.escola}
                      {magia.concentracao ? " • Conc." : ""}
                      {magia.ritual ? " • Ritual" : ""}
                    </span>
                  </button>

                  <button
                    type="button"
                    className="item-catalogo-adicionar"
                    onClick={() => onAdicionarMagia(
                      magia,
                      classeSelecionada === "segredos-magicos" ? "especial" : classeSelecionada,
                      classeSelecionada === "segredos-magicos" ? { tipo: "segredos-magicos", classeId: "bardo", fonteId: "segredos-magicos" } : null
                    )}
                    aria-label={`Adicionar ${magia.nome} como ${classeSelecionada}`}
                  >
                    <Icon name="add" />
                  </button>

                  {expandido && (
                    <div className="item-catalogo-corpo">
                      <DetalheMagia
                        magia={magia}
                        modificadorConjuracao={
                          modificadoresConjuracao[
                            classeSelecionada === "segredos-magicos"
                              ? "bardo"
                              : classeSelecionada
                          ] ?? 0
                        }
                        onAplicarEfeitoPv={onAplicarEfeitoPv}
                        onAplicarCondicao={onAplicarCondicao}
                      />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

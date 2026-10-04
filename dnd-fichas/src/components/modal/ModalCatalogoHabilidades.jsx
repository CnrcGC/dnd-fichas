import { useMemo, useState } from "react";
import { obterHabilidadesPorClasse } from "../../data/habilidadesClasses";
import { TALENTOS } from "../../data/talentos";
import DetalheHabilidade from "./DetalheHabilidade";
import { useModalA11y } from "../../hooks/useModalA11y";
import Icon from "../icons/Icon";
import "./ModalCatalogoItens.css";

export default function ModalCatalogoHabilidades({
  aberto,
  onFechar,
  onAdicionarHabilidade,
  classeId,
  classeNome,
  atributosTotais,
  ehConjurador,
}) {
  const [abaAtiva, setAbaAtiva] = useState("classe");
  const [busca, setBusca] = useState("");
  const [expandidos, setExpandidos] = useState(() => new Set());
  const dialogRef = useModalA11y(aberto, onFechar);

  const habilidadesClasse = useMemo(
    () => (classeId ? obterHabilidadesPorClasse(classeId) : []),
    [classeId]
  );

  const listaAtual = abaAtiva === "classe" ? habilidadesClasse : TALENTOS;

  const listaFiltrada = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return listaAtual;
    return listaAtual.filter((item) => item.nome.toLowerCase().includes(termo));
  }, [listaAtual, busca]);

  if (!aberto) return null;

  function alternarExpandido(id) {
    setExpandidos((atual) => {
      const novo = new Set(atual);
      if (novo.has(id)) {
        novo.delete(id);
      } else {
        novo.add(id);
      }
      return novo;
    });
  }

  function handleBackdropClick(evento) {
    if (evento.target === evento.currentTarget) onFechar();
  }

  function verificarPreRequisito(item) {
  const preRequisito = item.preRequisito;
  if (!preRequisito) return { atendido: true, texto: null };

  if (preRequisito.conjurador) {
    return {
      atendido: Boolean(ehConjurador),
      texto: "Precisa conseguir conjurar pelo menos uma magia",
    };
  }

  if (preRequisito.atributo) {
    const valorAtual = atributosTotais?.[preRequisito.atributo] ?? 0;
    return {
      atendido: valorAtual >= preRequisito.valorMinimo,
      texto: `Requer ${preRequisito.atributo} ${preRequisito.valorMinimo}+ (você tem ${valorAtual})`,
    };
  }

  return { atendido: true, texto: null };
}

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div
        ref={dialogRef}
        tabIndex="-1"
        className="modal-catalogo"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-catalogo-habilidades-titulo"
      >
        <div className="modal-catalogo-cabecalho">
          <h2 id="modal-catalogo-habilidades-titulo">Adicionar Habilidade</h2>
          <button
            type="button"
            className="modal-catalogo-fechar"
            onClick={onFechar}
            aria-label="Fechar"
          >
            <Icon name="remove" />
          </button>
        </div>

        <div className="modal-catalogo-abas">
          <button
            type="button"
            className={
              abaAtiva === "classe"
                ? "modal-catalogo-aba is-ativa"
                : "modal-catalogo-aba"
            }
            onClick={() => setAbaAtiva("classe")}
            aria-pressed={abaAtiva === "classe"}
          >
            {classeNome ?? "Sua classe"}
          </button>
          <button
            type="button"
            className={
              abaAtiva === "talento"
                ? "modal-catalogo-aba is-ativa"
                : "modal-catalogo-aba"
            }
            onClick={() => setAbaAtiva("talento")}
            aria-pressed={abaAtiva === "talento"}
          >
            Talentos
          </button>
        </div>

        <input
          type="text"
          className="modal-catalogo-busca"
          aria-label="Buscar habilidades ou talentos"
          placeholder="Buscar..."
          value={busca}
          onChange={(evento) => setBusca(evento.target.value)}
        />
        <p className="visually-hidden" role="status" aria-live="polite" aria-atomic="true">
          {listaFiltrada.length} {listaFiltrada.length === 1 ? "resultado encontrado" : "resultados encontrados"}.
        </p>

        <div className="modal-catalogo-lista">
          {abaAtiva === "classe" && !classeId ? (
            <p className="modal-catalogo-vazio">
              Escolha uma classe na ficha primeiro pra ver as habilidades dela
              aqui.
            </p>
          ) : listaFiltrada.length === 0 ? (
            <p className="modal-catalogo-vazio">Nada encontrado.</p>
          ) : (
                        listaFiltrada.map((item) => {
              const expandido = expandidos.has(item.id);
              const { atendido, texto: textoPreRequisito } =
                abaAtiva === "talento"
                  ? verificarPreRequisito(item)
                  : { atendido: true, texto: null };

              return (
                <div
                  key={item.id}
                  className={
                    atendido ? "item-catalogo" : "item-catalogo is-bloqueado"
                  }
                >
                  <button
                    type="button"
                    className="item-catalogo-cabecalho"
                    onClick={() => alternarExpandido(item.id)}
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
                    <span className="item-catalogo-nome">{item.nome}</span>
                    <span className="item-catalogo-resumo">
                      {abaAtiva === "classe"
                        ? `Nível ${item.nivel}`
                        : textoPreRequisito ?? "Talento"}
                    </span>
                  </button>

                  <button
                    type="button"
                    className="item-catalogo-adicionar"
                    onClick={() => onAdicionarHabilidade(item, abaAtiva)}
                    aria-label={`Adicionar ${item.nome}`}
                    disabled={!atendido}
                    title={!atendido ? textoPreRequisito : undefined}
                  >
                    <Icon name="add" />
                  </button>

                  {expandido && (
                    <div className="item-catalogo-corpo">
                      <DetalheHabilidade item={item} tipo={abaAtiva} />
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

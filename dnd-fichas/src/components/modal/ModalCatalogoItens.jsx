import { useMemo, useState } from "react";
import { CATALOGO_ITENS } from "../../data/catalogoItens";
import DetalheItemCatalogo from "./DetalheItemCatalogo";
import { useModalA11y } from "../../hooks/useModalA11y";
import Icon from "../icons/Icon";
import "./ModalCatalogoItens.css";

const GRUPOS = ["Armas", "Armaduras", "Equipamentos", "Itens mágicos"];

export default function ModalCatalogoItens({ aberto, onFechar, onAdicionarItem }) {
  const [abaAtiva, setAbaAtiva] = useState("Armas");
  const [busca, setBusca] = useState("");
  const [expandidos, setExpandidos] = useState(() => new Set());
  const dialogRef = useModalA11y(aberto, onFechar);

  const itensFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return CATALOGO_ITENS.filter((item) => {
      const bateGrupo = item.grupo === abaAtiva;
      const bateBusca = !termo || item.nome.toLowerCase().includes(termo);
      return bateGrupo && bateBusca;
    });
  }, [abaAtiva, busca]);

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

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div
        ref={dialogRef}
        tabIndex="-1"
        className="modal-catalogo"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-catalogo-itens-titulo"
      >
        <div className="modal-catalogo-cabecalho">
          <h2 id="modal-catalogo-itens-titulo">Adicionar Itens</h2>
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
          {GRUPOS.map((grupo) => (
            <button
              key={grupo}
              type="button"
              className={
                abaAtiva === grupo
                  ? "modal-catalogo-aba is-ativa"
                  : "modal-catalogo-aba"
              }
              onClick={() => setAbaAtiva(grupo)}
            >
              {grupo}
            </button>
          ))}
        </div>

        <input
          type="text"
          className="modal-catalogo-busca"
          aria-label="Buscar itens"
          placeholder="Buscar..."
          value={busca}
          onChange={(evento) => setBusca(evento.target.value)}
        />
        <p className="visually-hidden" role="status" aria-live="polite" aria-atomic="true">
          {itensFiltrados.length} {itensFiltrados.length === 1 ? "item encontrado" : "itens encontrados"}.
        </p>

        <div className="modal-catalogo-lista">
          {itensFiltrados.length === 0 ? (
            <p className="modal-catalogo-vazio">Nenhum item encontrado.</p>
          ) : (
            itensFiltrados.map((item) => {
              const expandido = expandidos.has(item.id);
              return (
                <div key={item.id} className="item-catalogo">
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
                    <span className="item-catalogo-resumo">{item.resumo}</span>
                  </button>

                  <button
                    type="button"
                    className="item-catalogo-adicionar"
                    onClick={() => onAdicionarItem(item)}
                    aria-label={`Adicionar ${item.nome}`}
                  >
                    <Icon name="add" />
                  </button>

                  {expandido && (
                    <div className="item-catalogo-corpo">
                      <DetalheItemCatalogo item={item} />
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

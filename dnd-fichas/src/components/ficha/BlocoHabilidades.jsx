import { Fragment, useState } from "react";
import { criarHabilidadeVazia } from "../../utils/habilidade";
import { obterHabilidadeClasse } from "../../data/habilidadesClasses";
import { obterSubclasse } from "../../data/subclasses";
import { obterHabilidadeSubclasse } from "../../data/habilidadesSubclasses";
import { obterTalento } from "../../data/talentos";
import ModalCatalogoHabilidades from "../modal/ModalCatalogoHabilidades";
import DetalheHabilidade from "../modal/DetalheHabilidade";
import "./BlocoHabilidades.css";
import Icon from "../icons/Icon";

const LABEL_TIPO = {
  classe: "Classe",
  subclasse: "Subclasse",
  talento: "Talento",
  personalizada: "Personalizada",
};

export default function BlocoHabilidades({
  classeId,
  classeNome,
  habilidades,
  onChangeHabilidades,
  atributosTotais,
  ehConjurador,
}) {
  const [modalAberto, setModalAberto] = useState(false);
  const [expandidas, setExpandidas] = useState(() => new Set());

    function dadosCatalogoDe(habilidade) {
      if (habilidade.tipo === "classe" && habilidade.origemId) {
        return obterHabilidadeClasse(habilidade.origemId);
      }
      if (habilidade.tipo === "subclasse" && habilidade.origemId) {
        if (habilidade.origemSubclasseId) {
          return obterHabilidadeSubclasse(habilidade.origemId);
        }
        return obterSubclasse(habilidade.origemId);
      }
      if (habilidade.tipo === "talento" && habilidade.origemId) {
        return obterTalento(habilidade.origemId);
      }
      return null;
    }

  function alternarExpandida(id) {
    setExpandidas((atual) => {
      const proxima = new Set(atual);
      if (proxima.has(id)) {
        proxima.delete(id);
      } else {
        proxima.add(id);
      }
      return proxima;
    });
  }

  function handleAdicionarDoCatalogo(item, tipo) {
    onChangeHabilidades([
      ...habilidades,
      {
        id: crypto.randomUUID(),
        nome: item.nome,
        tipo,
        nivel: tipo === "classe" ? item.nivel : null,
        origemId: item.id,
      },
    ]);
  }

  function handleAdicionarPersonalizada() {
    onChangeHabilidades([...habilidades, criarHabilidadeVazia()]);
  }

  function handleRemover(id) {
    onChangeHabilidades(habilidades.filter((habilidade) => habilidade.id !== id));
  }

  function handleAlterar(id, campo, valor) {
    onChangeHabilidades(
      habilidades.map((habilidade) =>
        habilidade.id === id ? { ...habilidade, [campo]: valor } : habilidade
      )
    );
  }

  return (
    <section>
      <h3 className="bloco-titulo">Habilidades e Talentos</h3>

      <button
        type="button"
        className="habilidades-abrir-catalogo"
        onClick={() => setModalAberto(true)}
      >
        Adicionar Habilidade
      </button>

      <ModalCatalogoHabilidades
        aberto={modalAberto}
        onFechar={() => setModalAberto(false)}
        onAdicionarHabilidade={handleAdicionarDoCatalogo}
        classeId={classeId}
        classeNome={classeNome}
        atributosTotais={atributosTotais}
        ehConjurador={ehConjurador}
      />

      {habilidades.length === 0 ? (
        <p className="habilidades-vazio">Nenhuma habilidade cadastrada ainda.</p>
      ) : (
        <table className="habilidades-tabela">
          <thead>
            <tr>
              <th aria-label="Expandir"></th>
              <th>Nome</th>
              <th>Tipo</th>
              <th>Nível</th>
              <th aria-label="Remover"></th>
            </tr>
          </thead>
          <tbody>
            {habilidades.map((habilidade) => {
              const dadosCatalogo = dadosCatalogoDe(habilidade);
              const aberta = expandidas.has(habilidade.id);
              const editavel = habilidade.tipo === "personalizada";

              return (
                <Fragment key={habilidade.id}>
                  <tr>
                    <td className="habilidades-coluna-expandir">
                      <button
                        type="button"
                        className="habilidades-expandir"
                        onClick={() => alternarExpandida(habilidade.id)}
                        aria-expanded={aberta}
                        aria-label={
                          `${aberta ? "Recolher" : "Expandir"} detalhes de ${habilidade.nome}`
                        }
                      >
                        <span
                          className={
                            aberta
                              ? "habilidades-seta is-aberta"
                              : "habilidades-seta"
                          }
                        >
                          <Icon name="chevron" className="ui-icon--chevron" />
                        </span>
                      </button>
                    </td>
                    <td>
                      {editavel ? (
                        <input
                          type="text"
                          value={habilidade.nome}
                          placeholder="Nome da habilidade"
                          aria-label="Nome da habilidade personalizada"
                          onChange={(evento) =>
                            handleAlterar(habilidade.id, "nome", evento.target.value)
                          }
                        />
                      ) : (
                        <span className="habilidades-nome-fixo">
                          {habilidade.nome}
                        </span>
                      )}
                    </td>
                    <td>
                      <span
                        className={`habilidades-etiqueta habilidades-etiqueta--${habilidade.tipo}`}
                      >
                        {LABEL_TIPO[habilidade.tipo] ?? habilidade.tipo}
                      </span>
                    </td>
                    <td className="habilidades-coluna-nivel">
                      {editavel ? (
                        <input
                          type="number"
                          min="1"
                          max="20"
                          className="habilidades-nivel-input"
                          value={habilidade.nivel ?? ""}
                          placeholder="—"
                          aria-label={`Nível de ${habilidade.nome || "habilidade personalizada"}`}
                          onChange={(evento) =>
                            handleAlterar(
                              habilidade.id,
                              "nivel",
                              evento.target.value
                                ? Number(evento.target.value)
                                : null
                            )
                          }
                        />
                      ) : habilidade.nivel ? (
                        `${habilidade.nivel}º`
                      ) : (
                        "—"
                      )}
                    </td>
                    <td>
                      <button
                        type="button"
                        className="habilidades-remover"
                        onClick={() => handleRemover(habilidade.id)}
                        aria-label={`Remover ${habilidade.nome || "habilidade"}`}
                      >
                        <Icon name="remove" />
                      </button>
                    </td>
                  </tr>
                  {aberta && (
                    <tr>
                      <td colSpan={5} className="habilidades-linha-detalhe">
                        {dadosCatalogo ? (
                          <DetalheHabilidade
                            item={dadosCatalogo}
                            tipo={habilidade.tipo}
                          />
                        ) : editavel ? (
                          <textarea
                            className="habilidades-descricao-textarea"
                            placeholder="Descreva o efeito dessa habilidade..."
                            aria-label={`Descrição de ${habilidade.nome || "habilidade personalizada"}`}
                            value={habilidade.descricao ?? ""}
                            onChange={(evento) =>
                              handleAlterar(
                                habilidade.id,
                                "descricao",
                                evento.target.value
                              )
                            }
                          />
                        ) : (
                          <p className="habilidades-sem-catalogo">
                            Sem dados cadastrados pra essa habilidade.
                          </p>
                        )}
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      )}

      <button
        type="button"
        className="habilidades-adicionar"
        onClick={handleAdicionarPersonalizada}
      >
        + Habilidade personalizada
      </button>
    </section>
  );
}

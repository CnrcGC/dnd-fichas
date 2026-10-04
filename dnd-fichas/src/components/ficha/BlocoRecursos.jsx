import { criarRecursoVazio } from "../../utils/recurso";
import "./BlocoRecursos.css";
import Icon from "../icons/Icon";

export default function BlocoRecursos({
  recursos,
  onChangeRecursos,
  sugestoes,
  onAdicionarSugestao,
}) {
  function rotuloOrigem(recurso) {
    if (recurso.origemTipo === "talento" || recurso.origemTalentoId) return "Talento";
    if (recurso.origemTipo === "item" || recurso.origemItemId) return "Item";
    if (recurso.origemTipo === "subclasse" || recurso.origemSubclasseId) return "Subclasse";
    if (recurso.origemTipo === "classe" || recurso.origemClasseId) return "Classe";
    if (recurso.origemTipo === "geral") return "Regra geral";
    return recurso.origemId ? "Catálogo" : "Personalizado";
  }

  function handleAdicionar() {
    onChangeRecursos([...recursos, criarRecursoVazio()]);
  }

  function handleRemover(id) {
    onChangeRecursos(recursos.filter((r) => r.id !== id));
  }

  function handleAlterar(id, campo, valor) {
    onChangeRecursos(
      recursos.map((r) => (r.id === id ? { ...r, [campo]: valor } : r))
    );
  }

  function handleTogglePip(recurso, indice) {
    const novoValor =
      recurso.usosGastos === indice + 1 ? indice : indice + 1;
    handleAlterar(recurso.id, "usosGastos", novoValor);
  }

  return (
    <section>
      <h3 className="bloco-titulo">Recursos rastreáveis</h3>

      {sugestoes && sugestoes.length > 0 && (
        <div className="recursos-sugestoes">
          {sugestoes.map((sugestao) => (
            <button
              key={sugestao.id}
              type="button"
              className="recursos-sugestao-botao"
              onClick={() => onAdicionarSugestao(sugestao)}
            >
              + {sugestao.nome} ({sugestao.usosMaxSugerido})
            </button>
          ))}
        </div>
      )}

      {recursos.length === 0 ? (
        <p className="recursos-vazio">
          Nenhum recurso cadastrado ainda (ex: Fúria, Pontos de Ki, Segundo Fôlego).
        </p>
      ) : (
        <div className="recursos-lista">
          {recursos.map((recurso) => (
            <div key={recurso.id} className="recurso-item">
              <div className="recurso-identidade">
                <input
                  type="text"
                  className="recurso-nome"
                  placeholder="Nome do recurso"
                  aria-label="Nome do recurso"
                  value={recurso.nome}
                  onChange={(evento) =>
                    handleAlterar(recurso.id, "nome", evento.target.value)
                  }
                />
                <small>{rotuloOrigem(recurso)}</small>
              </div>

              <div className="recurso-pips">
                {Array.from({ length: recurso.usosMax }).map((_, indice) => (
                  <button
                    key={indice}
                    type="button"
                    className={
                      indice < recurso.usosGastos
                        ? "recurso-pip is-gasto"
                        : "recurso-pip"
                    }
                    onClick={() => handleTogglePip(recurso, indice)}
                    aria-label={`Uso ${indice + 1}`}
                  />
                ))}
              </div>

              <label className="recurso-campo-pequeno">
                Máx.
                <input
                  type="number"
                  min="1"
                  value={recurso.usosMax}
                  onChange={(evento) =>
                    handleAlterar(
                      recurso.id,
                      "usosMax",
                      Math.max(1, Number(evento.target.value) || 1)
                    )
                  }
                />
              </label>

              <label className="recurso-campo-pequeno">
                Restaura em
                <select
                  value={recurso.restauraEm}
                  onChange={(evento) =>
                    handleAlterar(recurso.id, "restauraEm", evento.target.value)
                  }
                >
                  <option value="curto">Descanso curto</option>
                  <option value="longo">Descanso longo</option>
                  <option value="amanhecer">Ao amanhecer</option>
                  <option value="manual">Manual/evento</option>
                </select>
              </label>

              <button
                type="button"
                className="recurso-remover"
                onClick={() => handleRemover(recurso.id)}
                aria-label={`Remover ${recurso.nome || "recurso"}`}
              >
                <Icon name="remove" />
              </button>
            </div>
          ))}
        </div>
      )}

      <button type="button" className="recursos-adicionar" onClick={handleAdicionar}>
        <Icon name="add" /> Recurso personalizado
      </button>
    </section>
  );
}

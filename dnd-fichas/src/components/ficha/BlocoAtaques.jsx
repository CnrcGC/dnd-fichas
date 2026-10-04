import { ATRIBUTOS, formatarModificador, podeRolarDano } from "../../utils/dnd";
import {
  calcularBonusAcerto,
  criarAtaqueApartirDeItemEquipado,
  criarAtaqueVazio,
  formatarDano,
} from "../../utils/ataque";
import { rolarFormula } from "../../utils/dados";
import { useRolagem } from "../../context/useRolagem";
import "./BlocoAtaques.css";
import Icon from "../icons/Icon";

const OPCOES_ATRIBUTO = [
  { valor: "forca", label: "Força" },
  { valor: "destreza", label: "Destreza" },
  { valor: "manual", label: "Manual" },
];

export default function BlocoAtaques({
  modificadoresAtributos,
  bonusProficiencia,
  proficienciasArmas,
  inventario,
  ataques,
  onChangeAtaques,
}) {
  const { registrarRolagem, rolarD20 } = useRolagem();
  const armasEquipadas = inventario
    .filter((item) => item.tipoItem === "arma" && item.equipado)
    .map((item) => criarAtaqueApartirDeItemEquipado(item, {
      modificadoresAtributos,
      proficienciasArmas,
    }))
    .filter(Boolean);

  function handleAdicionarManual() {
    onChangeAtaques([...ataques, criarAtaqueVazio()]);
  }

  function handleRemover(id) {
    onChangeAtaques(ataques.filter((ataque) => ataque.id !== id));
  }

  function handleAlterar(id, campo, valor) {
    onChangeAtaques(
      ataques.map((ataque) =>
        ataque.id === id ? { ...ataque, [campo]: valor } : ataque
      )
    );
  }

  function handleRolarAcerto(ataque, bonusAcerto) {
    const resultado = rolarD20(bonusAcerto);
    registrarRolagem(`${ataque.nome || "Ataque"} (acerto)`, resultado, "d20");
  }

    function handleRolarDano(ataque) {
    if (!podeRolarDano(ataque.dano)) return;
    const base = rolarFormula(ataque.dano);
    const mod =
      ataque.atributo !== "manual"
        ? (modificadoresAtributos[ataque.atributo] ?? 0) + (ataque.bonusMagico ?? 0)   // era só o mod do atributo
        : 0;
    // ...resto continua igual
    const resultado =
      mod !== 0
        ? {
            ...base,
            total: base.total + mod,
            detalhes: [
              ...base.detalhes,
              { texto: `mod`, rolagens: [], soma: mod },
            ],
          }
        : base;
    registrarRolagem(
      `${ataque.nome || "Ataque"} (dano${ataque.tipoDano ? ` ${ataque.tipoDano}` : ""})`,
      resultado,
      "formula"
    );
  }

  function renderLinhaCalculada(ataque, somenteLeitura) {
    const bonusAcerto = calcularBonusAcerto(
      ataque,
      modificadoresAtributos,
      bonusProficiencia
    );
    const atributo = ATRIBUTOS.find((a) => a.chave === ataque.atributo);

    return (
      <tr key={ataque.id}>
        <td>
          {somenteLeitura ? (
            <span className="ataques-nome-fixo">{ataque.nome}</span>
          ) : (
            <input
              type="text"
              value={ataque.nome}
              placeholder="Nome do ataque"
              aria-label="Nome do ataque manual"
              onChange={(evento) =>
                handleAlterar(ataque.id, "nome", evento.target.value)
              }
            />
          )}
        </td>
        <td>
          {somenteLeitura ? (
            <span className="ataques-nome-fixo">
              {atributo?.abreviacao}{ataque.proficiente ? "" : " (não prof.)"}
            </span>
          ) : (
            <>
              <select
                value={ataque.atributo}
                aria-label={`Atributo do ataque ${ataque.nome || "manual"}`}
                onChange={(evento) =>
                  handleAlterar(ataque.id, "atributo", evento.target.value)
                }
              >
                {OPCOES_ATRIBUTO.map((opcao) => (
                  <option key={opcao.valor} value={opcao.valor}>
                    {opcao.label}
                  </option>
                ))}
              </select>
              {ataque.atributo !== "manual" && (
                <label>
                  <input
                    type="checkbox"
                    checked={ataque.proficiente !== false}
                    aria-label={`Aplicar proficiência em ${ataque.nome || "ataque manual"}`}
                    onChange={(evento) =>
                      handleAlterar(ataque.id, "proficiente", evento.target.checked)
                    }
                  />
                  Proficiente
                </label>
              )}
            </>
          )}
        </td>
        <td className="ataques-coluna-acerto">
          <div className="ataques-acerto-linha">
            {!somenteLeitura && ataque.atributo === "manual" && (
              <input
                type="number"
                className="ataques-bonus-input"
                value={ataque.bonusManual ?? 0}
                aria-label={`Bônus manual de acerto de ${ataque.nome || "ataque"}`}
                onChange={(evento) =>
                  handleAlterar(ataque.id, "bonusManual", Number(evento.target.value))
                }
              />
            )}
            <button
              type="button"
              className="ataques-rolar-botao"
              onClick={() => handleRolarAcerto(ataque, bonusAcerto)}
              title={`Rolar ataque (d20${formatarModificador(bonusAcerto)})`}
            >
              <Icon name="dice" /> {formatarModificador(bonusAcerto)}
            </button>
          </div>
        </td>
        <td>
          {somenteLeitura ? (
            podeRolarDano(ataque.dano) ? (
              <button
                type="button"
                className="ataques-rolar-botao"
                onClick={() => handleRolarDano(ataque)}
                title="Rolar dano"
              >
                <Icon name="dice" /> {formatarDano(ataque, modificadoresAtributos)}
              </button>
            ) : (
              <span className="ataques-nome-fixo">
                {formatarDano(ataque, modificadoresAtributos)}
              </span>
            )
          ) : (
            <>
              <input
                type="text"
                className="ataques-dano-input"
                placeholder="1d8"
                value={ataque.dano}
                aria-label={`Dano de ${ataque.nome || "ataque"}`}
                onChange={(evento) =>
                  handleAlterar(ataque.id, "dano", evento.target.value)
                }
              />
              {podeRolarDano(ataque.dano) && (
                <button
                  type="button"
                  className="ataques-dano-preview"
                  onClick={() => handleRolarDano(ataque)}
                  title="Rolar dano"
                >
                  <Icon name="dice" /> {formatarDano(ataque, modificadoresAtributos)}
                </button>
              )}
            </>
          )}
        </td>
        <td>
          {somenteLeitura ? (
            <span className="ataques-nome-fixo">{ataque.tipoDano}</span>
          ) : (
            <input
              type="text"
              className="ataques-tipo-input"
              placeholder="cortante"
              value={ataque.tipoDano ?? ""}
              aria-label={`Tipo de dano de ${ataque.nome || "ataque"}`}
              onChange={(evento) =>
                handleAlterar(ataque.id, "tipoDano", evento.target.value)
              }
            />
          )}
        </td>
        <td>
          {!somenteLeitura && (
            <button
              type="button"
              className="ataques-remover"
              onClick={() => handleRemover(ataque.id)}
              aria-label={`Remover ${ataque.nome || "ataque"}`}
            >
              <Icon name="remove" />
            </button>
          )}
        </td>
      </tr>
    );
  }

  return (
    <section>
      <h3 className="bloco-titulo">Ataques</h3>

      {armasEquipadas.length > 0 && (
        <div className="ataques-secao">
          <p className="ataques-secao-titulo">
            Armas equipadas <span>(gerencie no Inventário)</span>
          </p>
          <table className="ataques-tabela">
            <thead>
              <tr>
                <th>Ataque</th>
                <th>Atr.</th>
                <th>Acerto</th>
                <th>Dano</th>
                <th>Tipo</th>
                <th aria-label="ações"></th>
              </tr>
            </thead>
            <tbody>
              {armasEquipadas.map((ataque) => renderLinhaCalculada(ataque, true))}
            </tbody>
          </table>
        </div>
      )}

      <div className="ataques-secao">
        {armasEquipadas.length > 0 && (
          <p className="ataques-secao-titulo">Outros ataques</p>
        )}

        <button
          type="button"
          className="ataques-adicionar-manual"
          onClick={handleAdicionarManual}
        >
          <Icon name="add" /> Ataque manual
        </button>

        {ataques.length === 0 ? (
          <p className="ataques-vazio">
            Nenhum ataque manual cadastrado. Pra armas, equipe-as no
            Inventário — elas aparecem automaticamente aqui em cima.
          </p>
        ) : (
          <table className="ataques-tabela">
            <thead>
              <tr>
                <th>Ataque</th>
                <th>Atr.</th>
                <th>Acerto</th>
                <th>Dano</th>
                <th>Tipo</th>
                <th aria-label="Remover"></th>
              </tr>
            </thead>
            <tbody>
              {ataques.map((ataque) => renderLinhaCalculada(ataque, false))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}

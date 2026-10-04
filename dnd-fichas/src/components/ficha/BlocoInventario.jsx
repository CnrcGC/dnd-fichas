import { useState } from "react";
import { criarItemDoCatalogo, criarItemVazio } from "../../utils/inventario";
import {
  calcularCapacidadeCarga,
  calcularPesoInventario,
} from "../../utils/carga";
import {
  LIMITE_SINTONIZACAO,
  alterarSintonizacao,
  contarItensSintonizados,
  gastarCargasItem,
  itemMagicoAtivo,
  itemPossuiCargas,
  recuperarCargasItem,
  restaurarDadosCatalogoAnteriores,
  usarDadosCatalogoAtuais,
} from "../../utils/itensMagicos";
import { rolarFormula } from "../../utils/dados";
import { useRolagem } from "../../context/useRolagem";
import { RARIDADES } from "../../data/raridades";
import ModalCatalogoItens from "../modal/ModalCatalogoItens";
import "./BlocoInventario.css";
import Icon from "../icons/Icon";

export default function BlocoInventario({
  inventario,
  onChangeInventario,
  forcaTotal,
  onAplicarEfeitoPv,
}) {
  const { registrarRolagem } = useRolagem();
  const [modalAberto, setModalAberto] = useState(false);
  const [avisoItem, setAvisoItem] = useState("");
  const pesoTotal = calcularPesoInventario(inventario);
  const capacidadeCarga = calcularCapacidadeCarga(forcaTotal);
  const sobrecarregado = pesoTotal > capacidadeCarga;
  const itensSintonizados = contarItensSintonizados(inventario);

  function handleAdicionarItem() {
    onChangeInventario([...inventario, criarItemVazio()]);
  }

  function handleAdicionarDoCatalogo(item) {
    onChangeInventario([...inventario, criarItemDoCatalogo(item)]);
  }

  function handleRemoverItem(id) {
    onChangeInventario(inventario.filter((item) => item.id !== id));
  }

  function handleAlterarItem(id, campo, valor) {
    onChangeInventario(
      inventario.map((item) =>
        item.id === id ? { ...item, [campo]: valor } : item
      )
    );
  }

  function handleSintonizacao(item, sintonizado) {
    const resultado = alterarSintonizacao(inventario, item.id, sintonizado);
    setAvisoItem(resultado.erro ?? "");
    if (!resultado.erro) onChangeInventario(resultado.inventario);
  }

  function handleGastarCarga(item) {
    const resultado = gastarCargasItem(
      inventario,
      item.id,
      item.custoCargaPadrao ?? 1
    );
    setAvisoItem(resultado.erro ?? "");
    if (!resultado.erro) onChangeInventario(resultado.inventario);
  }

  function handleRecuperarCargas(item) {
    const formula = item.recargaCargas?.formula;
    if (!formula) return;
    const quantidade = rolarFormula(formula).total;
    const resultado = recuperarCargasItem(inventario, item.id, quantidade);
    setAvisoItem(
      resultado.erro ?? `${item.nome}: ${resultado.recuperadas} carga(s) recuperada(s).`
    );
    if (!resultado.erro) onChangeInventario(resultado.inventario);
  }

  function handleUsarEfeitoPv(item, efeito) {
    if (!efeito?.formula || !onAplicarEfeitoPv) return;
    const resultado = rolarFormula(efeito.formula);
    registrarRolagem(`${item.nome} (${efeito.tipo})`, resultado, "formula");
    const aplicacao = onAplicarEfeitoPv(efeito.tipo, resultado.total, item.nome);
    if (aplicacao?.erro) {
      setAvisoItem(aplicacao.erro);
      return;
    }
    setAvisoItem(`${item.nome}: ${aplicacao?.valorAplicado ?? resultado.total} PV de ${efeito.tipo} aplicados.`);
    if (efeito.consumivel) {
      onChangeInventario(
        (item.quantidade ?? 1) <= 1
          ? inventario.filter((registro) => registro.id !== item.id)
          : inventario.map((registro) =>
              registro.id === item.id
                ? { ...registro, quantidade: registro.quantidade - 1 }
                : registro
            )
      );
    }
  }

  function handleVersaoCatalogo(item, usarAnterior) {
    const resultado = usarAnterior
      ? restaurarDadosCatalogoAnteriores(inventario, item.id)
      : usarDadosCatalogoAtuais(inventario, item.id);
    setAvisoItem(resultado.erro ?? (usarAnterior
      ? `${item.nome}: versão anterior restaurada.`
      : `${item.nome}: versão atual do catálogo aplicada.`));
    if (!resultado.erro) onChangeInventario(resultado.inventario);
  }

  return (
    <section>
      <div className="inventario-cabecalho">
        <h3 className="bloco-titulo">Inventário</h3>
        <div className="inventario-resumos">
          <span className={sobrecarregado ? "inventario-peso is-sobrecarregado" : "inventario-peso"}>
            Peso total: {pesoTotal} / {capacidadeCarga} kg
            {sobrecarregado && " (sobrecarregado!)"}
          </span>
          <span className={itensSintonizados >= LIMITE_SINTONIZACAO ? "inventario-sintonizacao is-limite" : "inventario-sintonizacao"}>
            Sintonização: {itensSintonizados}/{LIMITE_SINTONIZACAO}
          </span>
        </div>
      </div>

      {itensSintonizados > LIMITE_SINTONIZACAO && (
        <p className="inventario-aviso" role="alert">
          Há {itensSintonizados} itens marcados como sintonizados. Somente os três primeiros estão
          ativos; desative uma sintonia para regularizar a ficha sem perder os dados importados.
        </p>
      )}
      {itensSintonizados === LIMITE_SINTONIZACAO && (
        <p id="inventario-limite-sintonia" className="inventario-aviso" role="status">
          Limite de três sintonizações atingido. Desative uma para sintonizar outro item.
        </p>
      )}

      <button
        type="button"
        className="inventario-abrir-catalogo"
        onClick={() => setModalAberto(true)}
      >
        Adicionar itens
      </button>

      <ModalCatalogoItens
        aberto={modalAberto}
        onFechar={() => setModalAberto(false)}
        onAdicionarItem={handleAdicionarDoCatalogo}
      />

      {avisoItem && <p className="inventario-aviso" role="status">{avisoItem}</p>}

      {inventario.length === 0 ? (
        <p className="inventario-vazio">Nenhum item ainda.</p>
      ) : (
        <table className="inventario-tabela">
          <thead>
            <tr>
              <th>Item</th>
              <th>Qtd.</th>
              <th>Peso (kg)</th>
              <th>Equipado</th>
              <th>Ataca com</th>
              <th>Mágico</th>
              <th aria-label="Remover"></th>
            </tr>
          </thead>
          <tbody>
            {inventario.map((item) => {
              const podeEquipar =
                item.tipoItem === "arma" ||
                item.tipoItem === "armadura" ||
                item.requerEquipado;
              const possuiCargas = itemPossuiCargas(item);
              const limiteSintonizacaoAtingido =
                itensSintonizados >= LIMITE_SINTONIZACAO && !item.sintonizado;
              const efeitosPv = itemMagicoAtivo(item)
                ? (item.efeitos ?? []).filter(
                    (efeito) => efeito.tipo === "cura" || efeito.tipo === "dano"
                  )
                : [];

              return (
                <tr key={item.id}>
                  <td>
                    <input
                      type="text"
                      value={item.nome}
                      placeholder="Nome do item"
                      aria-label="Nome do item"
                      onChange={(evento) =>
                        handleAlterarItem(item.id, "nome", evento.target.value)
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      className="inventario-input-numero"
                      value={item.quantidade}
                      aria-label={`Quantidade de ${item.nome || "item"}`}
                      onChange={(evento) =>
                        handleAlterarItem(item.id, "quantidade", Number(evento.target.value) || 0)
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      className="inventario-input-numero"
                      value={item.peso}
                      aria-label={`Peso unitário de ${item.nome || "item"} em quilogramas`}
                      onChange={(evento) =>
                        handleAlterarItem(item.id, "peso", Number(evento.target.value) || 0)
                      }
                    />
                  </td>
                  <td className="inventario-coluna-equipado">
                    {podeEquipar ? (
                      <input
                        type="checkbox"
                        checked={Boolean(item.equipado)}
                        onChange={(evento) =>
                          handleAlterarItem(item.id, "equipado", evento.target.checked)
                        }
                        aria-label={`Equipar ${item.nome || "item"}`}
                      />
                    ) : (
                      <span className="inventario-nao-aplica">—</span>
                    )}
                  </td>
                  <td>
                    {item.tipoItem === "arma" ? (
                      <select
                        value={item.atributoAtaque ?? "auto"}
                        aria-label={`Atributo de ataque de ${item.nome || "arma"}`}
                        onChange={(evento) =>
                          handleAlterarItem(item.id, "atributoAtaque", evento.target.value)
                        }
                      >
                        <option value="auto">Automático</option>
                        <option value="forca">Força</option>
                        <option value="destreza">Destreza</option>
                      </select>
                    ) : (
                      <span className="inventario-nao-aplica">—</span>
                    )}
                  </td>
                  <td className="inventario-coluna-magico">
                    <label className="inventario-magico-checkbox">
                      <input
                        type="checkbox"
                        checked={Boolean(item.magico)}
                        disabled={Boolean(item.itemMagicoId)}
                        onChange={(evento) =>
                          handleAlterarItem(item.id, "magico", evento.target.checked)
                        }
                        aria-label={`${item.nome || "Item"} é mágico`}
                      />
                      <Icon name="spell" title="Item mágico" />
                    </label>

                    {item.magico && (
                      <div className="inventario-magico-detalhes">
                        <select
                          value={item.raridade ?? "comum"}
                          disabled={Boolean(item.itemMagicoId)}
                          onChange={(evento) =>
                            handleAlterarItem(item.id, "raridade", evento.target.value)
                          }
                          aria-label={`Raridade de ${item.nome || "item"}`}
                        >
                          {RARIDADES.map((raridade) => (
                            <option key={raridade.id} value={raridade.id}>
                              {raridade.label}
                            </option>
                          ))}
                        </select>
                        <input
                          type="number"
                          className="inventario-input-numero inventario-bonus-magico"
                          value={item.bonusMagico ?? 0}
                          disabled={Boolean(item.itemMagicoId)}
                          onChange={(evento) =>
                            handleAlterarItem(item.id, "bonusMagico", Number(evento.target.value) || 0)
                          }
                          title="Bônus mágico aplicado quando o item estiver ativo"
                          aria-label={`Bônus mágico de ${item.nome || "item"}`}
                        />
                      </div>
                    )}

                    {item.requerSintonizacao && (
                      <label className="inventario-sintonizar">
                        <input
                          type="checkbox"
                          checked={Boolean(item.sintonizado)}
                          disabled={limiteSintonizacaoAtingido}
                          aria-label={`Sintonizar ${item.nome || "item"}`}
                          aria-describedby={limiteSintonizacaoAtingido ? "inventario-limite-sintonia" : undefined}
                          onChange={(evento) => handleSintonizacao(item, evento.target.checked)}
                        />
                        Sintonizado
                        {item.sintonizacaoExcedente && " (excedente e inativo)"}
                      </label>
                    )}

                    {item.dadosCatalogoAnteriores && (
                      <div className="inventario-revisao-catalogo" role="status">
                        <p>{item.avisoCatalogo ?? "Uma versão anterior deste item foi preservada."}</p>
                        <button
                          type="button"
                          onClick={() => handleVersaoCatalogo(item, !item.preferirDadosCatalogoAnteriores)}
                        >
                          {item.preferirDadosCatalogoAnteriores
                            ? "Usar versão atual do catálogo"
                            : "Restaurar versão anterior"}
                        </button>
                      </div>
                    )}

                    {possuiCargas && (
                      <div className="inventario-cargas">
                        <span>Cargas: {item.cargasAtuais}/{item.cargasMaximas}</span>
                        <button
                          type="button"
                          onClick={() => handleGastarCarga(item)}
                          disabled={(item.cargasAtuais ?? 0) < (item.custoCargaPadrao ?? 1)}
                        >
                          Usar {item.custoCargaPadrao ?? 1}
                        </button>
                        {item.recargaCargas?.formula && (
                          <button type="button" onClick={() => handleRecuperarCargas(item)}>
                            Recarga diária
                          </button>
                        )}
                      </div>
                    )}

                    {efeitosPv.map((efeito, indice) => (
                      <button
                        key={`${efeito.tipo}-${indice}`}
                        type="button"
                        className="inventario-usar-efeito"
                        onClick={() => handleUsarEfeitoPv(item, efeito)}
                      >
                        <Icon name="dice" /> Usar: {efeito.formula} de {efeito.tipo}
                      </button>
                    ))}

                    {item.regras?.length > 0 && (
                      <details className="inventario-regras">
                        <summary>Regras</summary>
                        <ul>
                          {item.regras.map((regra, indice) => <li key={indice}>{regra}</li>)}
                        </ul>
                      </details>
                    )}
                  </td>
                  <td>
                    <button
                      type="button"
                      className="inventario-remover"
                      onClick={() => handleRemoverItem(item.id)}
                      aria-label={`Remover ${item.nome || "item"}`}
                    >
                      <Icon name="remove" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      <button
        type="button"
        className="inventario-adicionar"
        onClick={handleAdicionarItem}
      >
        <Icon name="add" /> Item personalizado
      </button>
    </section>
  );
}

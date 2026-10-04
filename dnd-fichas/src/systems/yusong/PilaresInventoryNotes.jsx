import { useState } from "react";
import { createYusongSystemItem, YUSONG_SYSTEM_ITEMS } from "./items";
import "./PilaresInventoryNotes.css";

const EMPTY_ITEM = Object.freeze({
  name: "",
  category: "Geral",
  damage: "-",
  use: "Utilitário",
  quantity: 1,
  description: "",
  source: "custom",
});

function newEditor() {
  return {
    item: { id: crypto.randomUUID(), ...EMPTY_ITEM },
    isNew: true,
    mode: "system",
    selectedSystemItemId: "",
  };
}

export default function PilaresInventoryNotes({ character, onSaveItem, onRemoveItem, onNotesChange, readOnly = false, view = "all" }) {
  const [editor, setEditor] = useState(null);

  function editItem(item) {
    setEditor({
      item: structuredClone(item),
      isNew: false,
      mode: item.source === "system" ? "system" : "custom",
      selectedSystemItemId: item.systemItemId ?? "",
    });
  }

  function setMode(mode) {
    setEditor((current) => ({
      ...current,
      mode,
      selectedSystemItemId: "",
      item: { id: current.item.id, ...EMPTY_ITEM },
    }));
  }

  function selectSystemItem(itemId) {
    setEditor((current) => ({
      ...current,
      selectedSystemItemId: itemId,
      item: createYusongSystemItem(itemId, { id: current.item.id, quantity: current.item.quantity })
        ?? { id: current.item.id, ...EMPTY_ITEM },
    }));
  }

  function updateItem(field, value) {
    setEditor((current) => ({ ...current, item: { ...current.item, [field]: value } }));
  }

  function saveItem() {
    onSaveItem(editor.item);
    setEditor(null);
  }

  const lockedSystemItem = editor?.isNew && editor.mode === "system";

  return (
    <div className="pilares-inventory">
      {view === "all" && <h2>Inventário e notas</h2>}

      {(view === "all" || view === "inventory") && <section className="pilares-inventory__group" aria-labelledby="pilares-inventory-title">
        <div className="pilares-inventory__heading">
          <div>
            <h2 id="pilares-inventory-title">Inventário</h2>
            <p>Itens do catálogo e itens personalizados são preservados na ficha.</p>
          </div>
          <button type="button" disabled={readOnly} onClick={() => setEditor(newEditor())}>Adicionar item</button>
        </div>

        {character.inventory.length === 0 ? (
          <p className="pilares-inventory__empty">Nenhum item adicionado.</p>
        ) : (
          <div className="pilares-inventory__list">
            {character.inventory.map((item) => (
              <details key={item.id} className="pilares-inventory__card" data-item-id={item.id}>
                <summary><span>{item.name || "Item sem nome"}</span><span>{item.quantity ?? 1}×</span></summary>
                <dl>
                  <div><dt>Categoria</dt><dd>{item.category || "Geral"}</dd></div>
                  <div><dt>Dano</dt><dd>{item.damage || "-"}</dd></div>
                  <div><dt>Uso</dt><dd>{item.use || "-"}</dd></div>
                  {item.durability !== undefined && item.durability !== "" && <div><dt>Vida/Durabilidade</dt><dd>{item.durability}</dd></div>}
                </dl>
                <p>{item.description || "Sem descrição definida."}</p>
                <div className="pilares-inventory__actions">
                  <button type="button" disabled={readOnly} onClick={() => editItem(item)}>Editar item</button>
                  <button type="button" disabled={readOnly} className="is-danger" onClick={() => onRemoveItem(item.id)}>Remover item</button>
                </div>
              </details>
            ))}
          </div>
        )}

        {editor && (
          <fieldset className="pilares-inventory__editor" disabled={readOnly}>
            <legend>{editor.isNew ? "Adicionar item" : `Editar ${editor.item.name || "item"}`}</legend>
            {editor.isNew && (
              <div className="pilares-inventory__mode" role="group" aria-label="Origem do item">
                <button type="button" aria-pressed={editor.mode === "system"} onClick={() => setMode("system")}>Item do sistema</button>
                <button type="button" aria-pressed={editor.mode === "custom"} onClick={() => setMode("custom")}>Criar item</button>
              </div>
            )}
            {editor.isNew && editor.mode === "system" && (
              <label className="pilares-inventory__wide">
                Item do sistema
                <select value={editor.selectedSystemItemId} onChange={(event) => selectSystemItem(event.target.value)}>
                  <option value="">Escolha um item</option>
                  {YUSONG_SYSTEM_ITEMS.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                </select>
              </label>
            )}
            <label>Nome<input value={editor.item.name} disabled={lockedSystemItem} onChange={(event) => updateItem("name", event.target.value)} /></label>
            <label>Categoria<input value={editor.item.category} disabled={lockedSystemItem} onChange={(event) => updateItem("category", event.target.value)} /></label>
            <label>Quantidade<input type="number" inputMode="numeric" min="1" value={editor.item.quantity} onChange={(event) => updateItem("quantity", event.target.value)} /></label>
            <label>Dano<input value={editor.item.damage} disabled={lockedSystemItem} onChange={(event) => updateItem("damage", event.target.value)} /></label>
            <label>Uso<input value={editor.item.use} disabled={lockedSystemItem} onChange={(event) => updateItem("use", event.target.value)} /></label>
            <label className="pilares-inventory__wide">Descrição<textarea rows="4" value={editor.item.description} disabled={lockedSystemItem} onChange={(event) => updateItem("description", event.target.value)} /></label>
            <div className="pilares-inventory__actions pilares-inventory__wide">
              <button type="button" onClick={() => setEditor(null)}>Cancelar</button>
              <button type="button" onClick={saveItem}>Salvar item</button>
            </div>
          </fieldset>
        )}
      </section>}

      {(view === "all" || view === "notes") && <section className="pilares-inventory__group" aria-labelledby="pilares-notes-title">
        <div className="pilares-inventory__heading">
          <div>
            <h2 id="pilares-notes-title">Notas</h2>
            <p>Texto livre para informações da personagem e da sessão.</p>
          </div>
        </div>
        <label className="pilares-inventory__notes">
          Notas da personagem
          <textarea rows="8" value={character.notes ?? ""} readOnly={readOnly} onChange={(event) => onNotesChange(event.target.value)} placeholder="Anotações da sessão…" />
        </label>
      </section>}
    </div>
  );
}

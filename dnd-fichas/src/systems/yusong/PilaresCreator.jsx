import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { yusongEngine } from "./engine";
import { applyIdentityForm, characterToIdentityForm } from "./identityForm";
import PilaresIdentityFields from "./PilaresIdentityFields";
import { pilaresCharacterStore } from "./characterStore";
import "./PilaresIdentity.css";

export default function PilaresCreator() {
  const navigate = useNavigate();
  const [draft] = useState(() => yusongEngine.createCharacter({ displayName: "Sem nome" }));
  const [form, setForm] = useState(() => characterToIdentityForm(draft));
  const [state, setState] = useState({ saving: false, error: "" });

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    setState({ saving: true, error: "" });
    try {
      const character = applyIdentityForm(draft, form);
      await pilaresCharacterStore.create(character);
      navigate(`/yusong/characters/${encodeURIComponent(character.id)}`);
    } catch (error) {
      setState({ saving: false, error: error.message });
    }
  }

  return (
    <section className="pilares-identity" aria-labelledby="pilares-creator-title">
      <header>
        <p className="pilares-identity__eyebrow">Pilares de Atlas</p>
        <h1 id="pilares-creator-title">Novo personagem de Pilares de Atlas</h1>
        <p>Comece pela identidade. Os demais painéis serão incorporados em etapas preservando as regras existentes.</p>
      </header>
      <form onSubmit={submit} aria-busy={state.saving}>
        <PilaresIdentityFields form={form} onChange={update} prefix="pilares-create" />
        {state.error && <p className="pilares-identity__error" role="alert">{state.error}</p>}
        <div className="pilares-identity__actions">
          <Link to="/yusong">Cancelar</Link>
          <button type="submit" disabled={state.saving}>{state.saving ? "Salvando…" : "Criar personagem"}</button>
        </div>
      </form>
    </section>
  );
}

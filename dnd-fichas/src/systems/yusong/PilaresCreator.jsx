import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { yusongEngine } from "./engine";
import { applyIdentityForm, characterToIdentityForm } from "./identityForm";
import PilaresIdentityFields from "./PilaresIdentityFields";
import PilaresSchoolIdentity from "./PilaresSchoolIdentity";
import { pilaresCharacterStore } from "./characterStore";
import "./PilaresIdentity.css";

export default function PilaresCreator() {
  const navigate = useNavigate();
  const [draft, setDraft] = useState(() => yusongEngine.createCharacter({ displayName: "Sem nome" }));
  const [form, setForm] = useState(() => characterToIdentityForm(draft));
  const [state, setState] = useState({ saving: false, error: "" });
  const [generationMessage, setGenerationMessage] = useState("");

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function randomize() {
    const generated = yusongEngine.random.createCharacter({ id: draft.id });
    setDraft(generated);
    setForm(characterToIdentityForm(generated));
    const talentName = generated.talents[0]?.name ?? "sem Talento inicial";
    setGenerationMessage(`Personagem aleatório gerado: ${generated.identity.displayName}, com ${talentName}.`);
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
    <section className="pilares-identity pilares-school-theme" data-school={form.school || "custom"} aria-labelledby="pilares-creator-title">
      <header>
        <p className="pilares-identity__eyebrow">Pilares de Atlas</p>
        <h1 id="pilares-creator-title">Novo personagem de Pilares de Atlas</h1>
        <p>Comece pela identidade. Os demais painéis serão incorporados em etapas preservando as regras existentes.</p>
        <PilaresSchoolIdentity schoolId={form.school} />
      </header>
      <form onSubmit={submit} aria-busy={state.saving}>
        <section className="pilares-identity__random" aria-labelledby="pilares-random-title">
          <div>
            <h2 id="pilares-random-title">Geração aleatória</h2>
            <p>Sorteia identidade, academia, classe, atributos, perícias e um Talento inicial. Você pode editar tudo antes de criar.</p>
            <p className="pilares-identity__network-note">Nenhuma imagem externa é carregada automaticamente.</p>
          </div>
          <button type="button" onClick={randomize}>Gerar personagem aleatório</button>
        </section>
        <p className="pilares-identity__message" role="status" aria-live="polite">
          {generationMessage || "A geração aleatória é opcional."}
        </p>
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

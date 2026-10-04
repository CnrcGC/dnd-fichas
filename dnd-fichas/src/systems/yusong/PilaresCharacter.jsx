import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import PlatformRouteState from "../../pages/PlatformRouteState";
import { applyIdentityForm, characterToIdentityForm } from "./identityForm";
import PilaresIdentityFields from "./PilaresIdentityFields";
import PilaresStats from "./PilaresStats";
import PilaresBody from "./PilaresBody";
import PilaresTalents from "./PilaresTalents";
import PilaresSkillsConditions from "./PilaresSkillsConditions";
import PilaresInventoryNotes from "./PilaresInventoryNotes";
import PilaresSchoolIdentity from "./PilaresSchoolIdentity";
import PilaresTabs from "./PilaresTabs";
import { getPilaresSchool } from "./identityOptions";
import { pilaresCharacterStore } from "./characterStore";
import { yusongEngine } from "./engine";
import { readYusongSoundMuted, writeYusongSoundMuted } from "./sound";
import { exportYusongFighterCard } from "./exportCard";
import "./PilaresIdentity.css";
import "./PilaresSheet.css";

export default function PilaresCharacter() {
  const { id } = useParams();
  const [state, setState] = useState({ status: "loading", character: null, form: null, message: "", error: "" });
  const [presentationMode, setPresentationMode] = useState(false);
  const [soundMuted, setSoundMuted] = useState(() => readYusongSoundMuted());
  const [exportState, setExportState] = useState({ status: "idle", message: "" });
  const [leftTab, setLeftTab] = useState("talents");
  const [rightTab, setRightTab] = useState("inventory");
  const [mobileView, setMobileView] = useState("summary");

  useEffect(() => {
    let active = true;
    pilaresCharacterStore.get(id)
      .then((character) => {
        if (!active) return;
        setState(character
          ? { status: "ready", character, form: characterToIdentityForm(character), message: "", error: "" }
          : { status: "not-found", character: null, form: null, message: "", error: "" });
      })
      .catch((error) => active && setState({ status: "error", character: null, form: null, message: "", error: error.message }));
    return () => { active = false; };
  }, [id]);

  if (state.status === "loading") return <PlatformRouteState title="Carregando ficha" description="Abrindo o personagem salvo neste dispositivo." status="loading" />;
  if (state.status === "not-found") return <PlatformRouteState title="Personagem não encontrado" description="A ficha não existe neste dispositivo ou está na lixeira." />;
  if (state.status === "error") return <PlatformRouteState title="Não foi possível abrir a ficha" description={state.error} />;

  function update(field, value) {
    setState((current) => ({ ...current, form: { ...current.form, [field]: value }, message: "", error: "" }));
  }

  function runCommand(command, input, successMessage = "") {
    setState((current) => {
      try {
        const result = command(current.character, input);
        const warning = result.warnings?.[0];
        const error = warning?.code === "stamina.insufficient"
          ? `Stamina insuficiente: são necessários ${warning.required}, mas há ${warning.available}.`
          : "";
        return { ...current, character: result.character, message: error ? "" : successMessage, error };
      } catch (error) {
        return { ...current, error: error.message, message: "" };
      }
    });
  }

  async function submit(event) {
    event.preventDefault();
    if (presentationMode) return;
    setState((current) => ({ ...current, status: "saving", message: "", error: "" }));
    try {
      const next = applyIdentityForm(state.character, state.form);
      const saved = await pilaresCharacterStore.save(next);
      setState({ status: "ready", character: saved, form: characterToIdentityForm(saved), message: "Ficha salva neste dispositivo.", error: "" });
    } catch (error) {
      setState((current) => ({ ...current, status: "ready", error: error.message }));
    }
  }

  function toggleSound() {
    setSoundMuted((current) => {
      const next = !current;
      writeYusongSoundMuted(next);
      return next;
    });
  }

  function exportCard() {
    setExportState({ status: "exporting", message: "" });
    try {
      exportYusongFighterCard(state.character, yusongEngine.deriveCharacter(state.character));
      setExportState({ status: "success", message: "Carteirinha PNG exportada." });
    } catch (error) {
      setExportState({ status: "error", message: error.message });
    }
  }

  const talentProps = {
    character: state.character,
    onAddTalent: (talent) => runCommand(yusongEngine.commands.addTalent, { talent }, "Talento adicionado; salve a ficha para confirmar."),
    onUseTalent: (talentId) => runCommand(yusongEngine.commands.useTalent, { talentId }, "Talento usado; confira a Stamina e salve a ficha."),
    onRemoveTalent: (talentId) => runCommand(yusongEngine.commands.removeTalent, { talentId }, "Talento removido; salve a ficha para confirmar."),
    onSetGeniusName: (name) => runCommand(yusongEngine.commands.setGeniusName, { name }, "Nome do Genius alterado; salve a ficha para confirmar."),
    onUseGenius: () => runCommand(yusongEngine.commands.useGenius, {}, "Genius usado; confira a Stamina e salve a ficha."),
    onSaveAbility: (ability) => runCommand(yusongEngine.commands.upsertGeniusAbility, { ability }, "Habilidade Genius atualizada; salve a ficha para confirmar."),
    onRemoveAbility: (abilityId) => runCommand(yusongEngine.commands.removeGeniusAbility, { abilityId }, "Habilidade Genius removida; salve a ficha para confirmar."),
    onUseAbility: (abilityId) => runCommand(yusongEngine.commands.useGeniusAbility, { abilityId }, "Habilidade Genius usada; confira a Stamina e salve a ficha."),
    readOnly: presentationMode,
  };
  const school = getPilaresSchool(state.form.school);

  return (
    <section className={`pilares-identity pilares-sheet pilares-school-theme ${presentationMode ? "pilares-identity--presentation" : ""}`} data-school={state.form.school || "custom"} data-mobile-view={mobileView} aria-labelledby="pilares-character-title">
      <div className="pilares-sheet__academy-stripe" role="img" aria-label={school.name}><span aria-hidden="true">{school.monogram}</span><strong>{school.name}</strong></div>
      <h1 id="pilares-character-title" className="pilares-visually-hidden">Ficha de {state.form.displayName || "personagem sem nome"}</h1>
      <div className="pilares-identity__toolbar" aria-label="Controles da ficha">
        {!presentationMode && <Link to="/yusong" aria-label="Voltar para personagens">← Biblioteca</Link>}
        <span className="pilares-sheet__toolbar-spacer" />
        <button type="button" aria-pressed={presentationMode} onClick={() => setPresentationMode((current) => !current)}>{presentationMode ? "Sair do modo de apresentação" : "Entrar no modo de apresentação"}</button>
        <button type="button" aria-pressed={soundMuted} onClick={toggleSound}>{soundMuted ? "Ligar som das rolagens" : "Desligar som das rolagens"}</button>
        <button type="button" onClick={exportCard} disabled={exportState.status === "exporting"} aria-describedby="pilares-card-export-help">{exportState.status === "exporting" ? "Exportando…" : "Exportar carteirinha PNG"}</button>
      </div>
      <p id="pilares-card-export-help" className="pilares-sheet__export-help">A carteirinha é um resumo visual. A ficha salva continua sendo a fonte dos dados.</p>
      {exportState.message && <p className={exportState.status === "error" ? "pilares-identity__error" : "pilares-identity__message"} role={exportState.status === "error" ? "alert" : "status"}>{exportState.message}</p>}
      {presentationMode && <p className="pilares-identity__presentation-status" role="status">Modo de apresentação ativo — edição e navegação estão bloqueadas; consultas e rolagens continuam disponíveis.</p>}

      <form onSubmit={submit} aria-busy={state.status === "saving"}>
        <header className="pilares-sheet__fighter-header" data-mobile-section="summary">
          <div className="pilares-sheet__portrait" role="img" aria-label="Retrato do personagem">
            {state.form.image ? <img src={state.form.image} alt="" /> : <span aria-hidden="true">{school.monogram}</span>}
          </div>
          <div className="pilares-sheet__identity">
            <div className="pilares-sheet__title-row"><div><p className="pilares-identity__eyebrow">Ficha de combate</p><h2>{state.form.displayName || "Sem nome"}</h2></div><PilaresSchoolIdentity schoolId={state.form.school} compact /></div>
            <PilaresIdentityFields form={state.form} onChange={update} prefix="pilares-edit" readOnly={presentationMode} />
          </div>
        </header>

        <div data-mobile-section="summary"><PilaresStats character={state.character} onResourceChange={(resource, value) => runCommand(yusongEngine.commands.setResource, { resource, value })} mode="resources" readOnly={presentationMode} soundMuted={soundMuted} /></div>

        <div className="pilares-sheet__main">
          <div className="pilares-sheet__panel pilares-sheet__panel--left" data-mobile-section="talents">
            <PilaresTabs label="painel-esquerdo" tabs={[{ id: "talents", label: "Talentos" }, { id: "genius", label: "Gênio" }]} activeTab={leftTab} onChange={setLeftTab} />
            <div role="tabpanel" id={`painel-esquerdo-${leftTab}-panel`} aria-labelledby={`painel-esquerdo-${leftTab}-tab`}><PilaresTalents {...talentProps} view={leftTab} /></div>
          </div>

          <div className="pilares-sheet__body" data-mobile-section="body">
            <PilaresBody character={state.character} onChangeArmor={(partId, amount) => runCommand(yusongEngine.commands.changeBodyArmor, { partId, amount })} onSetArmor={(partId, value) => runCommand(yusongEngine.commands.setBodyArmor, { partId, value })} onSwapDice={(partId, dice) => runCommand(yusongEngine.commands.swapMemberDice, { partId, dice })} readOnly={presentationMode} soundMuted={soundMuted} />
          </div>

          <div className="pilares-sheet__panel pilares-sheet__panel--right" data-mobile-section="more">
            <PilaresTabs label="painel-direito" tabs={[{ id: "inventory", label: "Inventário" }, { id: "skills", label: "Perícias" }, { id: "conditions", label: "Condições" }, { id: "notes", label: "Notas" }]} activeTab={rightTab} onChange={setRightTab} />
            <div role="tabpanel" id={`painel-direito-${rightTab}-panel`} aria-labelledby={`painel-direito-${rightTab}-tab`}>
              {rightTab === "inventory" || rightTab === "notes" ? <PilaresInventoryNotes character={state.character} onSaveItem={(item) => runCommand(yusongEngine.commands.upsertInventoryItem, { item }, "Inventário atualizado; salve a ficha para confirmar.")} onRemoveItem={(itemId) => runCommand(yusongEngine.commands.removeInventoryItem, { itemId }, "Item removido; salve a ficha para confirmar.")} onNotesChange={(notes) => runCommand(yusongEngine.commands.setNotes, { notes })} readOnly={presentationMode} view={rightTab} /> : <PilaresSkillsConditions character={state.character} onSkillChange={(skillId, value) => runCommand(yusongEngine.commands.setSkill, { skillId, value }, "Perícia atualizada; salve a ficha para confirmar.")} onToggleCondition={(conditionId) => runCommand(yusongEngine.commands.toggleCondition, { conditionId }, "Condição atualizada; salve a ficha para confirmar.")} readOnly={presentationMode} soundMuted={soundMuted} view={rightTab} />}
            </div>
          </div>
        </div>

        <div className="pilares-sheet__footer" data-mobile-section="summary">
          <PilaresStats character={state.character} onAttributeChange={(attribute, value) => runCommand(yusongEngine.commands.setAttribute, { attribute, value })} mode="attributes" readOnly={presentationMode} soundMuted={soundMuted} />
          <PilaresStats character={state.character} mode="reactions" readOnly={presentationMode} soundMuted={soundMuted} />
        </div>
        <nav className="pilares-sheet__mobile-nav" aria-label="Seções da ficha">
          {[{ id: "summary", label: "Resumo" }, { id: "body", label: "Corpo" }, { id: "talents", label: "Talentos" }, { id: "more", label: "Mais" }].map((item) => <button key={item.id} type="button" aria-current={mobileView === item.id ? "page" : undefined} onClick={() => setMobileView(item.id)}>{item.label}</button>)}
        </nav>
        {state.message && <p className="pilares-identity__message" role="status">{state.message}</p>}
        {state.error && <p className="pilares-identity__error" role="alert">{state.error}</p>}
        <div className="pilares-identity__actions">{!presentationMode && <Link to="/yusong">Cancelar</Link>}<button type="submit" disabled={presentationMode || state.status === "saving"}>{state.status === "saving" ? "Salvando…" : "Salvar ficha"}</button></div>
      </form>
    </section>
  );
}

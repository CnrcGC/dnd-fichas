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
import { pilaresCharacterStore } from "./characterStore";
import { yusongEngine } from "./engine";
import { readYusongSoundMuted, writeYusongSoundMuted } from "./sound";
import { exportYusongFighterCard } from "./exportCard";
import "./PilaresIdentity.css";

export default function PilaresCharacter() {
  const { id } = useParams();
  const [state, setState] = useState({ status: "loading", character: null, form: null, message: "", error: "" });
  const [presentationMode, setPresentationMode] = useState(false);
  const [soundMuted, setSoundMuted] = useState(() => readYusongSoundMuted());
  const [exportState, setExportState] = useState({ status: "idle", message: "" });

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

  return (
    <section className={`pilares-identity pilares-school-theme ${presentationMode ? "pilares-identity--presentation" : ""}`} data-school={state.form.school || "custom"} aria-labelledby="pilares-character-title">
      <header>
        <p className="pilares-identity__eyebrow">Ficha de Pilares de Atlas</p>
        <h1 id="pilares-character-title">{state.character.identity.displayName}</h1>
        <PilaresSchoolIdentity schoolId={state.form.school} />
        <p>{presentationMode ? "Navegação bloqueada durante a apresentação." : <Link to="/yusong">Voltar para personagens</Link>}</p>
      </header>
      <div className="pilares-identity__toolbar" aria-label="Controles de apresentação">
        <button type="button" aria-pressed={presentationMode} onClick={() => setPresentationMode((current) => !current)}>
          {presentationMode ? "Sair do modo de apresentação" : "Entrar no modo de apresentação"}
        </button>
        <button type="button" aria-pressed={soundMuted} onClick={toggleSound}>
          {soundMuted ? "Ligar som das rolagens" : "Desligar som das rolagens"}
        </button>
        <button type="button" onClick={exportCard} disabled={exportState.status === "exporting"} aria-describedby="pilares-card-export-help">
          {exportState.status === "exporting" ? "Exportando…" : "Exportar carteirinha PNG"}
        </button>
      </div>
      <p id="pilares-card-export-help" className="pilares-identity__export-help">A carteirinha é um resumo visual. A ficha salva neste dispositivo continua sendo a fonte restaurável dos dados.</p>
      {exportState.message && <p className={exportState.status === "error" ? "pilares-identity__error" : "pilares-identity__message"} role={exportState.status === "error" ? "alert" : "status"}>{exportState.message}</p>}
      {presentationMode && <p className="pilares-identity__presentation-status" role="status">Modo de apresentação ativo — edição e navegação estão bloqueadas; consultas e rolagens continuam disponíveis.</p>}
      <form onSubmit={submit} aria-busy={state.status === "saving"}>
        <PilaresIdentityFields form={state.form} onChange={update} prefix="pilares-edit" readOnly={presentationMode} />
        <PilaresStats
          character={state.character}
          onAttributeChange={(attribute, value) => runCommand(yusongEngine.commands.setAttribute, { attribute, value })}
          onResourceChange={(resource, value) => runCommand(yusongEngine.commands.setResource, { resource, value })}
          readOnly={presentationMode}
        />
        <PilaresBody
          character={state.character}
          onChangeArmor={(partId, amount) => runCommand(yusongEngine.commands.changeBodyArmor, { partId, amount })}
          onSetArmor={(partId, value) => runCommand(yusongEngine.commands.setBodyArmor, { partId, value })}
          onSwapDice={(partId, dice) => runCommand(yusongEngine.commands.swapMemberDice, { partId, dice })}
          readOnly={presentationMode}
        />
        <PilaresTalents
          character={state.character}
          onAddTalent={(talent) => runCommand(yusongEngine.commands.addTalent, { talent }, "Talento adicionado; salve a ficha para confirmar.")}
          onUseTalent={(talentId) => runCommand(yusongEngine.commands.useTalent, { talentId }, "Talento usado; confira a Stamina e salve a ficha.")}
          onRemoveTalent={(talentId) => runCommand(yusongEngine.commands.removeTalent, { talentId }, "Talento removido; salve a ficha para confirmar.")}
          onSetGeniusName={(name) => runCommand(yusongEngine.commands.setGeniusName, { name }, "Nome do Genius alterado; salve a ficha para confirmar.")}
          onUseGenius={() => runCommand(yusongEngine.commands.useGenius, {}, "Genius usado; confira a Stamina e salve a ficha.")}
          onSaveAbility={(ability) => runCommand(yusongEngine.commands.upsertGeniusAbility, { ability }, "Habilidade Genius atualizada; salve a ficha para confirmar.")}
          onRemoveAbility={(abilityId) => runCommand(yusongEngine.commands.removeGeniusAbility, { abilityId }, "Habilidade Genius removida; salve a ficha para confirmar.")}
          onUseAbility={(abilityId) => runCommand(yusongEngine.commands.useGeniusAbility, { abilityId }, "Habilidade Genius usada; confira a Stamina e salve a ficha.")}
          readOnly={presentationMode}
        />
        <PilaresSkillsConditions
          character={state.character}
          onSkillChange={(skillId, value) => runCommand(yusongEngine.commands.setSkill, { skillId, value }, "Perícia atualizada; salve a ficha para confirmar.")}
          onToggleCondition={(conditionId) => runCommand(yusongEngine.commands.toggleCondition, { conditionId }, "Condição atualizada; salve a ficha para confirmar.")}
          readOnly={presentationMode}
          soundMuted={soundMuted}
        />
        <PilaresInventoryNotes
          character={state.character}
          onSaveItem={(item) => runCommand(yusongEngine.commands.upsertInventoryItem, { item }, "Inventário atualizado; salve a ficha para confirmar.")}
          onRemoveItem={(itemId) => runCommand(yusongEngine.commands.removeInventoryItem, { itemId }, "Item removido; salve a ficha para confirmar.")}
          onNotesChange={(notes) => runCommand(yusongEngine.commands.setNotes, { notes })}
          readOnly={presentationMode}
        />
        {state.message && <p className="pilares-identity__message" role="status">{state.message}</p>}
        {state.error && <p className="pilares-identity__error" role="alert">{state.error}</p>}
        <div className="pilares-identity__actions">
          {!presentationMode && <Link to="/yusong">Cancelar</Link>}
          <button type="submit" disabled={presentationMode || state.status === "saving"}>{state.status === "saving" ? "Salvando…" : "Salvar ficha"}</button>
        </div>
      </form>
    </section>
  );
}

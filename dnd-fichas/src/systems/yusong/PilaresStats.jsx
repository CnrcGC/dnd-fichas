import { useState } from "react";
import { yusongEngine } from "./engine";
import { playYusongRollSound } from "./sound";
import "./PilaresStats.css";

const ATTRIBUTES = Object.freeze([
  { key: "strength", short: "FOR", name: "Força" },
  { key: "agility", short: "AGI", name: "Agilidade" },
  { key: "constitution", short: "CON", name: "Constituição" },
  { key: "size", short: "TAM", name: "Tamanho" },
  { key: "power", short: "POD", name: "Poder" },
  { key: "intelligence", short: "INT", name: "Inteligência" },
  { key: "charisma", short: "CAR", name: "Carisma" },
  { key: "reaction", short: "REA", name: "Reação" },
  { key: "health", short: "SAU", name: "Saúde" },
]);

function commitNumber(event, fallback, onCommit) {
  const numeric = Number(event.currentTarget.value);
  if (!event.currentTarget.value || !Number.isFinite(numeric)) {
    event.currentTarget.value = String(fallback);
    return;
  }
  if (numeric === Number(fallback)) return;
  onCommit(numeric);
}

function blurOnEnter(event) {
  if (event.key === "Enter") event.currentTarget.blur();
}

export default function PilaresStats({ character, onAttributeChange, onResourceChange, readOnly = false, mode = "all", soundMuted = false }) {
  const derived = yusongEngine.deriveCharacter(character);
  const [lastRoll, setLastRoll] = useState(null);

  function roll(label, notation) {
    const result = yusongEngine.diceRequests.roll({ notation, label, conditions: character.conditions });
    playYusongRollSound(result, { muted: soundMuted });
    setLastRoll(result);
  }

  const showResources = mode === "all" || mode === "resources";
  const showAttributes = mode === "all" || mode === "attributes";
  const showReactions = mode === "all" || mode === "reactions";
  const sectionLabel = { resources: "Recursos e deslocamento", attributes: "Nove atributos", reactions: "Reações", all: "Atributos e recursos" }[mode] ?? "Atributos e recursos";
  return (
    <section className={`pilares-stats pilares-stats--${mode}`} aria-label={sectionLabel}>
      {showResources && (
        <div className="pilares-stats__resources" role="group" aria-label="Recursos e deslocamento">
          <label className="pilares-stat pilares-stat--life">
            <span>Vida</span>
            <span className="pilares-stats__resource-value">
              <input key={`life-${character.resources.currentLife}`} type="number" inputMode="numeric" min="0" max={derived.resources.maximumLife} disabled={readOnly} defaultValue={character.resources.currentLife} aria-label="Vida atual" onBlur={(event) => commitNumber(event, character.resources.currentLife, (value) => onResourceChange("currentLife", value))} onKeyDown={blurOnEnter} />
              <span aria-label={`Vida máxima ${derived.resources.maximumLife}`}>/ {derived.resources.maximumLife}</span>
            </span>
          </label>
          <label className="pilares-stat pilares-stat--stamina">
            <span>Stamina</span>
            <span className="pilares-stats__resource-value">
              <input key={`stamina-${character.resources.currentStamina}`} type="number" inputMode="numeric" min="0" max={derived.resources.maximumStamina} disabled={readOnly} defaultValue={character.resources.currentStamina} aria-label="Stamina atual" onBlur={(event) => commitNumber(event, character.resources.currentStamina, (value) => onResourceChange("currentStamina", value))} onKeyDown={blurOnEnter} />
              <span aria-label={`Stamina máxima ${derived.resources.maximumStamina}`}>/ {derived.resources.maximumStamina}</span>
            </span>
          </label>
          <dl className="pilares-stats__derived">
            <div><dt>RD</dt><dd>{derived.resources.rd}</dd></div>
            <div><dt>Movimento</dt><dd>{derived.resources.movement} m</dd></div>
            <div><dt>Corrida</dt><dd>{derived.resources.run} m</dd></div>
          </dl>
        </div>
      )}

      {showAttributes && <fieldset className="pilares-stats__attributes">
        <legend>Nove atributos</legend>
        {ATTRIBUTES.map((attribute) => (
          <div className="pilares-stats__attribute" key={`${attribute.key}-${character.attributes[attribute.key]}`}>
            <label>
              <span aria-hidden="true">{attribute.short}</span>
              <input type="number" inputMode="numeric" min="1" max="12" disabled={readOnly} defaultValue={character.attributes[attribute.key]} aria-label={`${attribute.name} (${attribute.short})`} onBlur={(event) => commitNumber(event, character.attributes[attribute.key], (value) => onAttributeChange(attribute.key, value))} onKeyDown={blurOnEnter} />
              <small>{attribute.name}</small>
            </label>
            <button type="button" onClick={() => roll(`Teste (${attribute.name})`, yusongEngine.diceRequests.buildAttributeNotation(character.attributes[attribute.key]))} aria-label={`Rolar ${attribute.name}`}>Rolar</button>
          </div>
        ))}
      </fieldset>}

      {showReactions && <div className="pilares-stats__reactions" role="group" aria-label="Reações">
        <button type="button" onClick={() => roll("Esquiva", derived.reactions.dodge)}><span>Esquiva</span><strong>{derived.reactions.dodge}</strong><small>Rolar</small></button>
        <button type="button" onClick={() => roll("Contra-ataque", derived.reactions.counterAttack)}><span>Contra-ataque</span><strong>{derived.reactions.counterAttack}</strong><small>Rolar</small></button>
      </div>}
      {lastRoll && <output className="pilares-stats__roll" aria-live="polite"><strong>{lastRoll.label}: {lastRoll.total}</strong><span>{lastRoll.notation}</span></output>}
    </section>
  );
}

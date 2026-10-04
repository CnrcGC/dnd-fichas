import { useState } from "react";
import { yusongEngine } from "./engine";
import { playYusongRollSound } from "./sound";
import "./PilaresBody.css";

function commitArmor(event, fallback, onCommit) {
  const numeric = Number(event.currentTarget.value);
  if (!event.currentTarget.value || !Number.isFinite(numeric)) {
    event.currentTarget.value = String(fallback);
    return;
  }
  onCommit(numeric);
}

function blurOnEnter(event) {
  if (event.key === "Enter") event.currentTarget.blur();
}

const POSITIONS = Object.freeze({ head: "head", torso: "torso", abdomen: "abdomen", rightArm: "right-arm", leftArm: "left-arm", rightLeg: "right-leg", leftLeg: "left-leg" });

export default function PilaresBody({ character, onChangeArmor, onSetArmor, onSwapDice, readOnly = false, soundMuted = false }) {
  const body = yusongEngine.deriveCharacter(character).body;
  const memberDice = [...new Set(body.filter((part) => part.type === "member").map((part) => part.dice))];
  const [selectedPart, setSelectedPart] = useState("torso");
  const [lastRoll, setLastRoll] = useState(null);

  function rollPart(part) {
    if (part.type !== "member" || part.currentArmor <= 0) return;
    const result = yusongEngine.diceRequests.roll({ notation: part.dice, label: `Dano (${part.name})`, conditions: character.conditions });
    playYusongRollSound(result, { muted: soundMuted });
    setLastRoll(result);
  }

  return (
    <section className="pilares-body" aria-labelledby="pilares-body-title">
      <div className="pilares-body__heading">
        <h2 id="pilares-body-title">Corpo</h2>
        <p>Scanner corporal · selecione uma região para inspecioná-la</p>
      </div>
      <div className="pilares-body__scanner">
        <div className="pilares-body__grid" aria-hidden="true" />
        <svg className="pilares-body__figure" viewBox="0 0 220 520" role="img" aria-label={`Holograma corporal. Região selecionada: ${body.find((part) => part.id === selectedPart)?.name}`}>
          <g className="pilares-body__figure-lines">
            <circle data-region="head" className={selectedPart === "head" ? "is-selected" : ""} cx="110" cy="55" r="38" />
            <path data-region="torso" className={selectedPart === "torso" ? "is-selected" : ""} d="M72 102 L148 102 L160 235 L60 235 Z" />
            <path data-region="abdomen" className={selectedPart === "abdomen" ? "is-selected" : ""} d="M66 240 L154 240 L145 315 L75 315 Z" />
            <path data-region="leftArm" className={selectedPart === "leftArm" ? "is-selected" : ""} d="M58 108 L28 125 L12 292 L43 296 L78 132 Z" />
            <path data-region="rightArm" className={selectedPart === "rightArm" ? "is-selected" : ""} d="M162 108 L192 125 L208 292 L177 296 L142 132 Z" />
            <path data-region="leftLeg" className={selectedPart === "leftLeg" ? "is-selected" : ""} d="M76 320 L108 320 L98 500 L58 500 Z" />
            <path data-region="rightLeg" className={selectedPart === "rightLeg" ? "is-selected" : ""} d="M112 320 L144 320 L162 500 L122 500 Z" />
          </g>
          <line x1="110" y1="8" x2="110" y2="512" />
          <line x1="8" y1="260" x2="212" y2="260" />
        </svg>
        <ul className="pilares-body__list" aria-label="Controles das sete regiões corporais">
        {body.map((part) => {
          const atMinimum = part.currentArmor <= 0;
          const atMaximum = part.currentArmor >= part.maximumArmor;
          return (
            <li key={part.id} className={`pilares-body__part pilares-body__part--${POSITIONS[part.id]}`} data-state={part.state === "Inutilizado" ? "disabled" : "normal"} data-selected={selectedPart === part.id || undefined} onFocusCapture={() => setSelectedPart(part.id)} onMouseEnter={() => setSelectedPart(part.id)}>
              <header>
                <div><h3><button type="button" className="pilares-body__select" onClick={() => setSelectedPart(part.id)} aria-pressed={selectedPart === part.id}>{part.name}</button></h3><small>{part.type === "vital" ? "Região vital" : "Membro"}</small></div>
                <strong className="pilares-body__state">{part.state}</strong>
              </header>

              {part.type === "member" ? (
                <div className="pilares-body__dice-row">
                  <label><span>Dado de {part.name}</span><select value={part.dice} disabled={readOnly} onChange={(event) => onSwapDice(part.id, event.target.value)}>
                    {memberDice.map((dice) => <option key={dice} value={dice}>{dice}</option>)}
                  </select></label>
                  <button type="button" onClick={() => rollPart(part)} disabled={atMinimum} aria-label={`Rolar dano de ${part.name}`}>Rolar</button>
                </div>
              ) : (
                <p className="pilares-body__dice">Dado: —</p>
              )}

              <fieldset className="pilares-body__armor">
                <legend>Armadura de {part.name}</legend>
                <button type="button" disabled={readOnly || atMinimum} onClick={() => onChangeArmor(part.id, -1)} aria-label={`Reduzir armadura de ${part.name}`}>−</button>
                <span>
                  <input
                    key={`${part.id}-${part.currentArmor}`}
                    type="number"
                    inputMode="numeric"
                    min="0"
                    max={part.maximumArmor}
                    disabled={readOnly}
                    defaultValue={part.currentArmor}
                    aria-label={`Armadura atual de ${part.name}`}
                    onBlur={(event) => commitArmor(event, part.currentArmor, (value) => onSetArmor(part.id, value))}
                    onKeyDown={blurOnEnter}
                  />
                  <span aria-label={`Armadura máxima de ${part.name}: ${part.maximumArmor}`}>/ {part.maximumArmor}</span>
                </span>
                <button type="button" disabled={readOnly || atMaximum} onClick={() => onChangeArmor(part.id, 1)} aria-label={`Aumentar armadura de ${part.name}`}>+</button>
              </fieldset>
            </li>
          );
        })}
        </ul>
        <div className="pilares-body__scan-line" aria-hidden="true" />
      </div>
      {lastRoll && <output className="pilares-body__roll" aria-live="polite"><strong>{lastRoll.label}: {lastRoll.total}</strong><span>{lastRoll.notation}</span></output>}
    </section>
  );
}

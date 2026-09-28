import { yusongEngine } from "./engine";
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

export default function PilaresBody({ character, onChangeArmor, onSetArmor, onSwapDice }) {
  const body = yusongEngine.deriveCharacter(character).body;
  const memberDice = [...new Set(body.filter((part) => part.type === "member").map((part) => part.dice))];

  return (
    <section className="pilares-body" aria-labelledby="pilares-body-title">
      <div>
        <h2 id="pilares-body-title">Corpo</h2>
        <p>As sete regiões estão em ordem linear. Armadura zero identifica uma região inutilizada.</p>
      </div>
      <ul className="pilares-body__list">
        {body.map((part) => {
          const atMinimum = part.currentArmor <= 0;
          const atMaximum = part.currentArmor >= part.maximumArmor;
          return (
            <li key={part.id} className="pilares-body__part" data-state={part.state === "Inutilizado" ? "disabled" : "normal"}>
              <header>
                <div>
                  <h3>{part.name}</h3>
                  <span>{part.type === "vital" ? "Região vital" : "Membro"}</span>
                </div>
                <strong className="pilares-body__state">{part.state}</strong>
              </header>

              {part.type === "member" ? (
                <label>
                  Dado de {part.name}
                  <select value={part.dice} onChange={(event) => onSwapDice(part.id, event.target.value)}>
                    {memberDice.map((dice) => <option key={dice} value={dice}>{dice}</option>)}
                  </select>
                </label>
              ) : (
                <p className="pilares-body__dice">Dado: —</p>
              )}

              <fieldset className="pilares-body__armor">
                <legend>Armadura de {part.name}</legend>
                <button type="button" disabled={atMinimum} onClick={() => onChangeArmor(part.id, -1)} aria-label={`Reduzir armadura de ${part.name}`}>−</button>
                <span>
                  <input
                    key={`${part.id}-${part.currentArmor}`}
                    type="number"
                    inputMode="numeric"
                    min="0"
                    max={part.maximumArmor}
                    defaultValue={part.currentArmor}
                    aria-label={`Armadura atual de ${part.name}`}
                    onBlur={(event) => commitArmor(event, part.currentArmor, (value) => onSetArmor(part.id, value))}
                    onKeyDown={blurOnEnter}
                  />
                  <span aria-label={`Armadura máxima de ${part.name}: ${part.maximumArmor}`}>/ {part.maximumArmor}</span>
                </span>
                <button type="button" disabled={atMaximum} onClick={() => onChangeArmor(part.id, 1)} aria-label={`Aumentar armadura de ${part.name}`}>+</button>
              </fieldset>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

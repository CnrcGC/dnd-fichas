import { yusongEngine } from "./engine";
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

export default function PilaresStats({ character, onAttributeChange, onResourceChange, readOnly = false }) {
  const derived = yusongEngine.deriveCharacter(character);
  return (
    <section className="pilares-stats" aria-labelledby="pilares-stats-title">
      <h2 id="pilares-stats-title">Atributos e recursos</h2>

      <fieldset className="pilares-stats__attributes" disabled={readOnly}>
        <legend>Nove atributos</legend>
        {ATTRIBUTES.map((attribute) => (
          <label key={`${attribute.key}-${character.attributes[attribute.key]}`}>
            <span aria-hidden="true">{attribute.short}</span>
            <input
              type="number"
              inputMode="numeric"
              min="1"
              max="12"
              defaultValue={character.attributes[attribute.key]}
              aria-label={`${attribute.name} (${attribute.short})`}
              onBlur={(event) => commitNumber(event, character.attributes[attribute.key], (value) => onAttributeChange(attribute.key, value))}
              onKeyDown={blurOnEnter}
            />
            <small>{attribute.name}</small>
          </label>
        ))}
      </fieldset>

      <div className="pilares-stats__resources">
        <label>
          Vida atual
          <span className="pilares-stats__resource-value">
            <input
              key={`life-${character.resources.currentLife}`}
              type="number"
              inputMode="numeric"
              min="0"
              max={derived.resources.maximumLife}
              disabled={readOnly}
              defaultValue={character.resources.currentLife}
              onBlur={(event) => commitNumber(event, character.resources.currentLife, (value) => onResourceChange("currentLife", value))}
              onKeyDown={blurOnEnter}
            />
            <span aria-label={`Vida máxima ${derived.resources.maximumLife}`}>/ {derived.resources.maximumLife}</span>
          </span>
        </label>
        <label>
          Stamina atual
          <span className="pilares-stats__resource-value">
            <input
              key={`stamina-${character.resources.currentStamina}`}
              type="number"
              inputMode="numeric"
              min="0"
              max={derived.resources.maximumStamina}
              disabled={readOnly}
              defaultValue={character.resources.currentStamina}
              onBlur={(event) => commitNumber(event, character.resources.currentStamina, (value) => onResourceChange("currentStamina", value))}
              onKeyDown={blurOnEnter}
            />
            <span aria-label={`Stamina máxima ${derived.resources.maximumStamina}`}>/ {derived.resources.maximumStamina}</span>
          </span>
        </label>
      </div>

      <dl className="pilares-stats__derived" aria-label="Valores derivados">
        <div><dt>RD</dt><dd>{derived.resources.rd}</dd></div>
        <div><dt>Movimento</dt><dd>{derived.resources.movement} m</dd></div>
        <div><dt>Corrida</dt><dd>{derived.resources.run} m</dd></div>
        <div><dt>Esquiva</dt><dd>{derived.reactions.dodge}</dd></div>
        <div><dt>Contra-ataque</dt><dd>{derived.reactions.counterAttack}</dd></div>
      </dl>
    </section>
  );
}

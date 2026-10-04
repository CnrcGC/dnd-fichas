import { useState } from "react";
import { YUSONG_CONDITIONS } from "./conditions";
import { yusongEngine } from "./engine";
import { YUSONG_SKILLS } from "./skills";
import { playYusongRollSound } from "./sound";
import "./PilaresSkillsConditions.css";

const SKILL_RANKS = Object.freeze([0, 1, 2, 3, 4, 5]);

export default function PilaresSkillsConditions({ character, onSkillChange, onToggleCondition, readOnly = false, soundMuted = false, view = "all" }) {
  const [openSkillId, setOpenSkillId] = useState(null);
  const [lastRoll, setLastRoll] = useState(null);

  function rollSkill(skill) {
    const result = yusongEngine.diceRequests.rollSkill({
      skillName: skill.name,
      rank: character.skills?.[skill.id] ?? 0,
      conditions: character.conditions,
    });
    playYusongRollSound(result, { muted: soundMuted });
    setLastRoll(result);
  }

  return (
    <div className="pilares-abilities">
      {view === "all" && <h2>Perícias e condições</h2>}

      {(view === "all" || view === "skills") && <section className="pilares-abilities__group" aria-labelledby="pilares-skills-title">
        <div className="pilares-abilities__heading">
          <div>
            <h2 id="pilares-skills-title">Perícias</h2>
            <p>A graduação varia de 0 a 5 e concede +4 por ponto.</p>
          </div>
          <span aria-label="16 Perícias">16</span>
        </div>

        {lastRoll && (
          <output className="pilares-abilities__roll" aria-live="polite">
            <strong>{lastRoll.label}: {lastRoll.total}</strong>
            <span>{lastRoll.notation}{lastRoll.modifier ? ` · condições ${lastRoll.modifier > 0 ? "+" : ""}${lastRoll.modifier}` : ""}</span>
          </output>
        )}

        <div className="pilares-abilities__list">
          {YUSONG_SKILLS.map((skill) => {
            const open = openSkillId === skill.id;
            const rank = character.skills?.[skill.id] ?? 0;
            return (
              <article key={skill.id} className="pilares-abilities__card">
                <header>
                  <button
                    type="button"
                    className="pilares-abilities__disclosure"
                    aria-expanded={open}
                    aria-controls={`pilares-skill-${skill.id}`}
                    onClick={() => setOpenSkillId(open ? null : skill.id)}
                  >
                    {skill.name}
                  </button>
                  <label>
                    <span>Graduação de {skill.name}</span>
                    <select value={rank} disabled={readOnly} onChange={(event) => onSkillChange(skill.id, event.target.value)}>
                      {SKILL_RANKS.map((value) => <option key={value} value={value}>{value}</option>)}
                    </select>
                  </label>
                  <button type="button" onClick={() => rollSkill(skill)} aria-label={`Rolar ${skill.name}`}>
                    Rolar
                  </button>
                </header>
                {open && <p id={`pilares-skill-${skill.id}`}>{skill.description}</p>}
              </article>
            );
          })}
        </div>
      </section>}

      {(view === "all" || view === "conditions") && <section className="pilares-abilities__group" aria-labelledby="pilares-conditions-title">
        <div className="pilares-abilities__heading">
          <div>
            <h2 id="pilares-conditions-title">Condições</h2>
            <p>Estados ativos são aplicados pelo engine às rolagens compatíveis.</p>
          </div>
          <span aria-label="9 Condições">9</span>
        </div>
        <div className="pilares-abilities__condition-list">
          {YUSONG_CONDITIONS.map((condition) => {
            const active = Boolean(character.conditions?.[condition.id]);
            return (
              <details key={condition.id} className="pilares-abilities__condition" data-condition-id={condition.id} data-active={active || undefined}>
                <summary>{condition.name}<span>{active ? "Ativa" : "Inativa"}</span></summary>
                <p>{condition.description}</p>
                <p><strong>Efeito:</strong> {condition.effect}</p>
                <label>
                  <input type="checkbox" checked={active} disabled={readOnly} onChange={() => onToggleCondition(condition.id)} />
                  {condition.name} ativa
                </label>
              </details>
            );
          })}
        </div>
      </section>}
    </div>
  );
}

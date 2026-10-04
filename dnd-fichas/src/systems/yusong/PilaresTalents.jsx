import { useMemo, useState } from "react";
import { yusongEngine } from "./engine";
import { yusongTalentCost } from "./rules";
import { filterYusongTalents, YUSONG_TALENT_CATEGORIES } from "./talents";
import { useModalA11y } from "../../hooks/useModalA11y";
import "./PilaresTalents.css";

const LEVELS = Object.freeze(["Nível 1", "Nível 2", "Nível 3", "Despertar"]);
const ACTIONS = Object.freeze(["Passiva", "Livre", "Movimento", "Padrão", "Completa", "Reação", "Varia"]);

function newAbility() {
  return { id: crypto.randomUUID(), name: "Nova Habilidade", level: "Nível 1", action: "Passiva", staminaCost: 0, description: "" };
}

function TalentCatalogDialog({ open, onClose, search, onSearch, category, onCategory, talents, selectedTalentIds, maximumStamina, onAddTalent, readOnly }) {
  const dialogRef = useModalA11y(open, onClose);
  if (!open) return null;
  return (
    <div className="pilares-talents__backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section ref={dialogRef} tabIndex="-1" className="pilares-talents__dialog" role="dialog" aria-modal="true" aria-labelledby="pilares-talent-catalog-title">
        <header>
          <div><p>Catálogo de combate</p><h2 id="pilares-talent-catalog-title">Adicionar Talento</h2></div>
          <button type="button" onClick={onClose} aria-label="Fechar catálogo de Talentos">×</button>
        </header>
        <div className="pilares-talents__filters">
          <label>Buscar Talento<input autoFocus type="search" value={search} onChange={(event) => onSearch(event.target.value)} placeholder="Nome ou descrição" /></label>
          <label>Categoria<select value={category} onChange={(event) => onCategory(event.target.value)}>{YUSONG_TALENT_CATEGORIES.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
        </div>
        <p className="pilares-talents__catalog-count" aria-live="polite">{talents.length} {talents.length === 1 ? "Talento encontrado." : "Talentos encontrados."}</p>
        <div className="pilares-talents__catalog-list">
          {talents.length === 0 && <p className="pilares-talents__empty">Nenhum Talento corresponde aos filtros.</p>}
          {talents.map((talent) => {
            const added = selectedTalentIds.has(talent.id);
            const cost = yusongTalentCost(talent.staminaCostPercent, maximumStamina);
            return (
              <details key={talent.id} className="pilares-talents__catalog-card">
                <summary><span>{talent.name}</span><span>{added ? "Adicionado" : talent.category}</span></summary>
                <dl><div><dt>Categoria</dt><dd>{talent.category}</dd></div><div><dt>Ação</dt><dd>{talent.action}</dd></div><div><dt>Custo</dt><dd>{talent.specialCost || `${cost} Stamina (${talent.staminaCostPercent}%)`}</dd></div>{talent.prerequisites && <div><dt>Pré-requisitos</dt><dd>{talent.prerequisites}</dd></div>}</dl>
                <p>{talent.description}</p>
                <div className="pilares-talents__actions"><button type="button" disabled={readOnly || added} onClick={() => onAddTalent(talent)} aria-label={added ? `${talent.name} já adicionado` : `Adicionar ${talent.name}`}>{added ? "Já adicionado" : "Adicionar"}</button></div>
              </details>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export default function PilaresTalents({
  character,
  onAddTalent,
  onUseTalent,
  onRemoveTalent,
  onSetGeniusName,
  onUseGenius,
  onSaveAbility,
  onRemoveAbility,
  onUseAbility,
  readOnly = false,
  view = "all",
}) {
  const [editing, setEditing] = useState(null);
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [talentSearch, setTalentSearch] = useState("");
  const [talentCategory, setTalentCategory] = useState("all");
  const derived = yusongEngine.deriveCharacter(character);
  const stamina = character.resources.currentStamina;
  const selectedTalentIds = useMemo(() => new Set(character.talents.map((talent) => talent.id)), [character.talents]);
  const filteredTalents = useMemo(
    () => filterYusongTalents({ search: talentSearch, category: talentCategory }),
    [talentCategory, talentSearch],
  );

  function updateAbility(field, value) {
    setEditing((current) => ({ ...current, [field]: value }));
  }

  function saveAbility() {
    onSaveAbility({ ...editing, staminaCost: Math.max(0, Math.floor(Number(editing.staminaCost) || 0)) });
    setEditing(null);
  }

  return (
    <div className="pilares-talents">
      {view === "all" && <h2>Talentos e Genius</h2>}

      {(view === "all" || view === "talents") && <section className="pilares-talents__group" aria-labelledby="pilares-talent-list-title">
        <div className="pilares-talents__heading">
          <div>
            <h2 id="pilares-talent-list-title">Talentos</h2>
            <p>Escolha no catálogo original ou gerencie os Talentos já salvos.</p>
          </div>
          <div className="pilares-talents__heading-actions">
            <span aria-label={`${character.talents.length} Talentos adicionados`}>{character.talents.length}</span>
            <button type="button" disabled={readOnly} aria-haspopup="dialog" aria-expanded={catalogOpen} onClick={() => setCatalogOpen(true)}>
              Adicionar Talento
            </button>
          </div>
        </div>
        {character.talents.length === 0 ? (
          <p className="pilares-talents__empty">Nenhum Talento adicionado.</p>
        ) : (
          <div className="pilares-talents__cards">
            {character.talents.map((talent) => {
              const cost = yusongTalentCost(talent.staminaCostPercent, derived.resources.maximumStamina);
              const passive = talent.action === "Passiva";
              return (
                <details key={talent.id} className="pilares-talents__card">
                  <summary>{talent.name}</summary>
                  <dl>
                    <div><dt>Categoria</dt><dd>{talent.category || "Não informada"}</dd></div>
                    <div><dt>Ação</dt><dd>{talent.action || "Não informada"}</dd></div>
                    <div><dt>Custo</dt><dd>{talent.specialCost || `${cost} Stamina (${Number(talent.staminaCostPercent) || 0}%)`}</dd></div>
                    {talent.prerequisites && <div><dt>Pré-requisitos</dt><dd>{talent.prerequisites}</dd></div>}
                  </dl>
                  {talent.description && <p>{talent.description}</p>}
                  <div className="pilares-talents__actions">
                    {!passive && !talent.specialCost && cost > 0 && (
                      <button type="button" onClick={() => onUseTalent(talent.id)} disabled={readOnly || stamina < cost}>Usar Talento</button>
                    )}
                    <button type="button" disabled={readOnly} className="is-danger" onClick={() => onRemoveTalent(talent.id)}>Remover Talento</button>
                  </div>
                </details>
              );
            })}
          </div>
        )}

        <TalentCatalogDialog open={catalogOpen} onClose={() => setCatalogOpen(false)} search={talentSearch} onSearch={setTalentSearch} category={talentCategory} onCategory={setTalentCategory} talents={filteredTalents} selectedTalentIds={selectedTalentIds} maximumStamina={derived.resources.maximumStamina} onAddTalent={onAddTalent} readOnly={readOnly} />
      </section>}

      {(view === "all" || view === "genius") && <section className="pilares-talents__group" aria-labelledby="pilares-genius-title">
        <div className="pilares-talents__heading">
          <div>
            <h2 id="pilares-genius-title">Genius</h2>
            <p>Habilidades personalizadas continuam editáveis.</p>
          </div>
          <button type="button" disabled={readOnly} onClick={() => setEditing(newAbility())}>Nova habilidade</button>
        </div>

        <div className="pilares-talents__genius-name">
          <label>
            Nome do Genius
            <input
              key={character.genius.name}
              defaultValue={character.genius.name}
              disabled={readOnly}
              onBlur={(event) => {
                if (event.currentTarget.value !== character.genius.name) onSetGeniusName(event.currentTarget.value);
              }}
            />
          </label>
          <button type="button" onClick={onUseGenius} disabled={readOnly || stamina < 10}>Usar Genius — 10 Stamina</button>
        </div>

        {character.genius.abilities.length === 0 ? (
          <p className="pilares-talents__empty">Nenhuma habilidade Genius criada.</p>
        ) : (
          <div className="pilares-talents__cards">
            {character.genius.abilities.map((ability) => {
              const cost = Math.max(0, Number(ability.staminaCost) || 0);
              const usable = ability.action !== "Passiva" && cost > 0;
              return (
                <details key={ability.id} className="pilares-talents__card">
                  <summary>{ability.name || "Nova Habilidade"}</summary>
                  <dl>
                    <div><dt>Nível</dt><dd>{ability.level || "Nível 1"}</dd></div>
                    <div><dt>Ação</dt><dd>{ability.action || "Passiva"}</dd></div>
                    <div><dt>Custo</dt><dd>{cost > 0 ? `${cost} Stamina` : "Sem custo"}</dd></div>
                  </dl>
                  <p>{ability.description || "Sem descrição definida."}</p>
                  <div className="pilares-talents__actions">
                    {usable && <button type="button" onClick={() => onUseAbility(ability.id)} disabled={readOnly || stamina < cost}>Usar habilidade</button>}
                    <button type="button" disabled={readOnly} onClick={() => setEditing(structuredClone(ability))}>Editar habilidade</button>
                    <button type="button" disabled={readOnly} className="is-danger" onClick={() => onRemoveAbility(ability.id)}>Remover habilidade</button>
                  </div>
                </details>
              );
            })}
          </div>
        )}

        {editing && (
          <fieldset className="pilares-talents__editor" disabled={readOnly}>
            <legend>{character.genius.abilities.some((ability) => ability.id === editing.id) ? "Editar habilidade Genius" : "Nova habilidade Genius"}</legend>
            <label>Nome<input value={editing.name} onChange={(event) => updateAbility("name", event.target.value)} /></label>
            <label>Nível<select value={editing.level} onChange={(event) => updateAbility("level", event.target.value)}>{LEVELS.map((level) => <option key={level}>{level}</option>)}</select></label>
            <label>Ação<select value={editing.action} onChange={(event) => updateAbility("action", event.target.value)}>{ACTIONS.map((action) => <option key={action}>{action}</option>)}</select></label>
            <label>Custo de Stamina<input type="number" inputMode="numeric" min="0" value={editing.staminaCost} onChange={(event) => updateAbility("staminaCost", event.target.value)} /></label>
            <label className="pilares-talents__description">Descrição<textarea rows="4" value={editing.description} onChange={(event) => updateAbility("description", event.target.value)} /></label>
            <div className="pilares-talents__actions">
              <button type="button" onClick={() => setEditing(null)}>Cancelar</button>
              <button type="button" onClick={saveAbility}>Salvar habilidade</button>
            </div>
          </fieldset>
        )}
      </section>}
    </div>
  );
}

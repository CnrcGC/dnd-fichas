import {
  PILARES_CLASSES,
  PILARES_MARTIAL_ARTS,
  PILARES_ORIGINS,
  PILARES_SCHOOLS,
  PILARES_TYPES,
} from "./identityOptions";

function SelectField({ id, label, value, emptyLabel, options, onChange }) {
  const normalizedOptions = options.map((option) => typeof option === "string" ? { id: option, name: option } : option);
  const known = !value || normalizedOptions.some((option) => option.id === value);
  return (
    <label htmlFor={id}>
      {label}
      <select id={id} value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="">{emptyLabel}</option>
        {!known && <option value={value}>{value} (importado)</option>}
        {normalizedOptions.map((option) => <option key={option.id} value={option.id}>{option.name}</option>)}
      </select>
    </label>
  );
}

export default function PilaresIdentityFields({ form, onChange, prefix, readOnly = false }) {
  const fieldId = (field) => `${prefix}-${field}`;
  return (
    <fieldset className="pilares-identity__fields" disabled={readOnly}>
      <legend>Identidade</legend>
      <label htmlFor={fieldId("name")}>
        Nome
        <input id={fieldId("name")} value={form.displayName} onChange={(event) => onChange("displayName", event.target.value)} required />
      </label>
      <label htmlFor={fieldId("level")}>
        Nível
        <input id={fieldId("level")} type="number" inputMode="numeric" min="1" max="20" value={form.level} onChange={(event) => onChange("level", event.target.value)} required />
      </label>
      <label htmlFor={fieldId("age")}>
        Idade
        <input id={fieldId("age")} value={form.age} onChange={(event) => onChange("age", event.target.value)} />
      </label>
      <label htmlFor={fieldId("height")}>
        Altura
        <input id={fieldId("height")} value={form.height} onChange={(event) => onChange("height", event.target.value)} />
      </label>
      <SelectField id={fieldId("school")} label="Academia" value={form.school} emptyLabel="Escolha uma academia" options={PILARES_SCHOOLS} onChange={(value) => onChange("school", value)} />
      <SelectField id={fieldId("type")} label="Tipo" value={form.type} emptyLabel="Escolha um tipo" options={PILARES_TYPES} onChange={(value) => onChange("type", value)} />
      <SelectField id={fieldId("class")} label="Classe" value={form.characterClass} emptyLabel="Escolha uma classe" options={PILARES_CLASSES} onChange={(value) => onChange("characterClass", value)} />
      <SelectField id={fieldId("origin")} label="Origem" value={form.origin} emptyLabel="Escolha uma origem" options={PILARES_ORIGINS} onChange={(value) => onChange("origin", value)} />
      <SelectField id={fieldId("martial-art")} label="Arte marcial" value={form.martialArt} emptyLabel="Escolha uma arte marcial" options={PILARES_MARTIAL_ARTS} onChange={(value) => onChange("martialArt", value)} />
      <label className="pilares-identity__concept" htmlFor={fieldId("concept")}>
        Conceito
        <textarea id={fieldId("concept")} rows="4" value={form.concept} onChange={(event) => onChange("concept", event.target.value)} />
      </label>
    </fieldset>
  );
}

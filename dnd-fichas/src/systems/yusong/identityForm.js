import { yusongCommands } from "./commands";

export function characterToIdentityForm(character) {
  return {
    displayName: character.identity.displayName,
    level: character.identity.level,
    age: character.identity.age,
    height: character.identity.height,
    concept: character.identity.concept,
    school: character.selections.school,
    type: character.selections.type,
    characterClass: character.selections.characterClass,
    origin: character.selections.origin,
    martialArt: character.selections.martialArt,
  };
}

export function applyIdentityForm(character, form) {
  let next = structuredClone(character);
  for (const field of ["displayName", "age", "height", "concept"]) {
    const value = String(form[field] ?? "");
    const normalized = field === "displayName" ? value.trim() : value;
    if (String(next.identity[field] ?? "") !== normalized) {
      next = yusongCommands.setIdentity(next, { field, value }).character;
    }
  }
  if (Number(next.identity.level) !== Number(form.level)) {
    next = yusongCommands.setLevel(next, { level: form.level }).character;
  }
  for (const field of ["school", "type", "characterClass", "origin", "martialArt"]) {
    const value = String(form[field] ?? "");
    if (String(next.selections[field] ?? "") !== value) {
      next = yusongCommands.setSelection(next, { field, value }).character;
    }
  }
  return next;
}

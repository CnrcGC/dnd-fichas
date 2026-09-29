export const PILARES_SCHOOLS = Object.freeze([
  { id: "seirin", name: "Academia Seirin", monogram: "SE", pattern: "diagonal", lightAccent: "#3b2a6d", darkAccent: "#b7a9f1" },
  { id: "shinnen", name: "Instituto Shinnen", monogram: "SH", pattern: "grid", lightAccent: "#17445a", darkAccent: "#70c4e8" },
  { id: "yosuk", name: "Academia Yosuk", monogram: "YO", pattern: "diamond", lightAccent: "#762361", darkAccent: "#ec8bd2" },
  { id: "yusong", name: "Academia Yusong", monogram: "YU", pattern: "bars", lightAccent: "#812632", darkAccent: "#ff8995" },
  { id: "zanfei", name: "Academia Zanfei", monogram: "ZA", pattern: "steps", lightAccent: "#254d3e", darkAccent: "#79c6a6" },
  { id: "custom", name: "Outra academia", monogram: "OU", pattern: "dots", lightAccent: "#4f4f4f", darkAccent: "#b5b5b5" },
]);

export function getPilaresSchool(schoolId) {
  return PILARES_SCHOOLS.find((school) => school.id === schoolId) ?? PILARES_SCHOOLS.at(-1);
}

export const PILARES_TYPES = Object.freeze([
  { id: "prodigio", name: "Prodígio" },
  { id: "diligente-persistente", name: "Diligente Persistente" },
  { id: "diligente-super-humano", name: "Diligente Super Humano" },
]);

export const PILARES_CLASSES = Object.freeze([
  { id: "bruto", name: "Bruto" },
  { id: "agil", name: "Ágil" },
  { id: "tatico", name: "Tático" },
  { id: "comando", name: "Comando" },
]);

export const PILARES_ORIGINS = Object.freeze(["Lutador Profissional"]);

export const PILARES_MARTIAL_ARTS = Object.freeze([
  "Capoeira", "Aikido", "Muay Thai", "Taekwondo", "Kendo", "Judô", "Boxe", "Kickboxing",
]);

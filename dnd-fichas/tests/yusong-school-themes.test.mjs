import { test } from "node:test";
import assert from "node:assert/strict";
import { PILARES_SCHOOLS, getPilaresSchool } from "../src/systems/yusong/identityOptions.js";

function relativeLuminance(hex) {
  const channels = hex.match(/[a-f\d]{2}/gi).map((channel) => Number.parseInt(channel, 16) / 255);
  const linear = channels.map((channel) => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4);
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}

function contrast(colorA, colorB) {
  const [lighter, darker] = [relativeLuminance(colorA), relativeLuminance(colorB)].sort((a, b) => b - a);
  return (lighter + 0.05) / (darker + 0.05);
}

test("FE-05H-A preserva seis academias com rótulos, monogramas e padrões distintos", () => {
  assert.equal(PILARES_SCHOOLS.length, 6);
  for (const field of ["id", "name", "monogram", "pattern", "lightAccent", "darkAccent"]) {
    assert.equal(new Set(PILARES_SCHOOLS.map((school) => school[field])).size, 6, field);
  }
  assert.equal(getPilaresSchool("shinnen").name, "Instituto Shinnen");
  assert.equal(getPilaresSchool("desconhecida").id, "custom");
});

test("FE-05H-A mantém contraste AA das cores de academia nos dois temas", () => {
  for (const school of PILARES_SCHOOLS) {
    assert.ok(contrast(school.lightAccent, "#fffdf7") >= 4.5, `${school.id} no tema claro`);
    assert.ok(contrast(school.darkAccent, "#1d1f2b") >= 4.5, `${school.id} no tema escuro`);
  }
});

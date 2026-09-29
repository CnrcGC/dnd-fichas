import test from "node:test";
import assert from "node:assert/strict";
import { buildYusongCardSummary, sanitizeYusongCardFilename } from "../src/systems/yusong/exportCard.js";

test("cria nome seguro e previsível para a carteirinha PNG", () => {
  assert.equal(sanitizeYusongCardFilename("  Júlia D'Ávila / 01  "), "carteirinha-julia-d-avila-01.png");
  assert.equal(sanitizeYusongCardFilename("---"), "carteirinha-lutador.png");
});

test("resume a ficha atual sem depender do esquema legado", () => {
  const summary = buildYusongCardSummary({
    identity: { displayName: "Kang Ji-ho", level: 3, age: 19 },
    selections: { school: "seirin", type: "prodigio", characterClass: "agil", origin: "Lutador Profissional", martialArt: "Taekwondo" },
    resources: { currentLife: 35, currentStamina: 200 },
    talents: [{ name: "Passo Rápido" }, { name: "Corpo de Ferro" }],
  }, {
    resources: { maximumLife: 44, maximumStamina: 275 },
    reactions: { dodge: "1d8", counterAttack: "1d6" },
  });

  assert.equal(summary.title, "CARTEIRINHA DE LUTADOR · PILARES DE ATLAS");
  assert.equal(summary.school.name, "Academia Seirin");
  assert.equal(summary.school.monogram, "SE");
  assert.equal(summary.typeName, "Prodígio");
  assert.equal(summary.className, "Ágil");
  assert.equal(summary.life, "35 / 44");
  assert.equal(summary.stamina, "200 / 275");
  assert.deepEqual(summary.talents, ["Passo Rápido", "Corpo de Ferro"]);
});

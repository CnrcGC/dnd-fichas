import assert from "node:assert/strict";
import test from "node:test";
import {
  filterYusongTalents,
  getYusongTalent,
  YUSONG_TALENT_CATEGORIES,
  YUSONG_TALENTS,
} from "../src/systems/yusong/talents.js";

test("FE-05E-B preserva os 49 Talentos e categorias do catálogo original", () => {
  assert.equal(YUSONG_TALENTS.length, 49);
  assert.equal(new Set(YUSONG_TALENTS.map((talent) => talent.id)).size, 49);
  assert.deepEqual(
    Object.fromEntries([...new Set(YUSONG_TALENTS.map((talent) => talent.category))].sort().map((category) => [
      category,
      YUSONG_TALENTS.filter((talent) => talent.category === category).length,
    ])),
    { agil: 11, bruto: 10, comando: 8, geral: 11, tatico: 9 },
  );
  assert.deepEqual(YUSONG_TALENT_CATEGORIES.map((category) => category.id), ["all", "geral", "bruto", "agil", "tatico", "comando"]);
  for (const talent of YUSONG_TALENTS) {
    assert.ok(talent.id);
    assert.ok(talent.name);
    assert.ok(talent.action);
    assert.equal(typeof talent.staminaCostPercent, "number");
    assert.equal(typeof talent.description, "string");
  }
});

test("FE-05E-B filtra por nome/categoria e preserva relações especiais", () => {
  assert.deepEqual(filterYusongTalents({ search: "pressão" }).map((talent) => talent.id), ["pressao-espiritual"]);
  assert.equal(filterYusongTalents({ category: "bruto" }).length, 10);
  assert.deepEqual(getYusongTalent("filho-do-vento").grants, ["tornado", "trem-bala", "clack-boom"]);
  assert.equal(getYusongTalent("tornado").derivedFrom, "filho-do-vento");
  assert.equal(getYusongTalent("inexistente"), null);
});

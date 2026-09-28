import assert from "node:assert/strict";
import test from "node:test";
import {
  getYusongCondition,
  YUSONG_CONDITION_ROLL_MODIFIERS,
  YUSONG_CONDITIONS,
} from "../src/systems/yusong/conditions.js";
import { getYusongSkill, YUSONG_SKILLS } from "../src/systems/yusong/skills.js";

test("FE-05F-A preserva as 16 Perícias do catálogo original", () => {
  assert.equal(YUSONG_SKILLS.length, 16);
  assert.equal(new Set(YUSONG_SKILLS.map((skill) => skill.id)).size, 16);
  assert.equal(getYusongSkill("medicina").name, "Medicina");
  assert.match(getYusongSkill("medicina").description, /Exige ao menos 1 ponto/);
  assert.equal(getYusongSkill("inexistente"), null);
});

test("FE-05F-A preserva as 9 Condições e somente seus modificadores explícitos", () => {
  assert.equal(YUSONG_CONDITIONS.length, 9);
  assert.equal(new Set(YUSONG_CONDITIONS.map((condition) => condition.id)).size, 9);
  assert.deepEqual(YUSONG_CONDITION_ROLL_MODIFIERS, { amedrontado: -4, desesperado: -10, motivado: 4 });
  assert.match(getYusongCondition("agarrado").effect, /Deslocamento reduzido a 0/);
  assert.equal(getYusongCondition("inexistente"), null);
});

import assert from "node:assert/strict";
import test from "node:test";
import {
  createYusongSystemItem,
  getYusongSystemItem,
  YUSONG_SYSTEM_ITEMS,
} from "../src/systems/yusong/items.js";

test("FE-05F-B preserva os 11 itens do catálogo original", () => {
  assert.equal(YUSONG_SYSTEM_ITEMS.length, 11);
  assert.equal(new Set(YUSONG_SYSTEM_ITEMS.map((item) => item.id)).size, 11);
  assert.equal(getYusongSystemItem("soqueiras").damage, "+1d6+4");
  assert.equal(getYusongSystemItem("katana-espada").durability, 84);
  assert.equal(getYusongSystemItem("inexistente"), null);
});

test("FE-05F-B cria cópia identificada de item do sistema", () => {
  const item = createYusongSystemItem("faca", { id: "owned-faca", quantity: 0 });
  assert.equal(item.id, "owned-faca");
  assert.equal(item.systemItemId, "faca");
  assert.equal(item.source, "system");
  assert.equal(item.quantity, 1);
  assert.notEqual(item, getYusongSystemItem("faca"));
});

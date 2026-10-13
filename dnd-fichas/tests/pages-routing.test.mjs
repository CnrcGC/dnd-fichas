import { test } from "node:test";
import assert from "node:assert/strict";
import { restorePagesRoute } from "../src/platform/routing/pages.js";

function restore(route, pathname = "/dnd-fichas/") {
  let restored;
  const location = { origin: "https://cnrcgc.github.io", pathname, search: "?__dnd_route=" + encodeURIComponent(route) };
  restorePagesRoute({ location, history: { replaceState: (_, __, url) => { restored = url; } } }, "/dnd-fichas/");
  return restored;
}
test("RELEASE-01 recupera rota direta com query, hash e caracteres codificados", () => {
  const route = "/dnd-fichas/dnd5e/characters/ficha%20teste?q=a%26b&tema=claro#notas";
  assert.equal(restore(route), route);
});
test("RELEASE-01 preserva rotas normais e ignora parâmetro fora da entrada", () => {
  assert.equal(restore("/dnd-fichas/dnd5e", "/dnd-fichas/dnd5e"), undefined);
  let changed = false;
  restorePagesRoute({ location: { pathname: "/dnd-fichas/", search: "?busca=Celeste" }, history: { replaceState() { changed = true; } } }, "/dnd-fichas/");
  assert.equal(changed, false);
  restorePagesRoute({ location: { pathname: "/", search: "?__dnd_route=%2Fdnd5e" }, history: { replaceState() { changed = true; } } }, "/");
  assert.equal(changed, false);
});
test("RELEASE-01 recusa destinos externos e caminhos fora do projeto", () => {
  for (const route of ["https://example.com/dnd-fichas/", "//example.com/dnd-fichas/", "/outro/", "/dnd-fichas/../outro/", "http://[", "/dnd-fichas-externo/"]) {
    assert.equal(restore(route), undefined, route);
  }
});

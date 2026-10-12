import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "vite";
let server, races, progress, proficiency;
before(async () => {
  server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: "custom", optimizeDeps: { noDiscovery: true, include: [] } });
  races = await server.ssrLoadModule("/src/data/racas.js");
  progress = await server.ssrLoadModule("/src/utils/progressao.js");
  proficiency = await server.ssrLoadModule("/src/utils/proficienciasCriacao.js");
});
after(async () => { await server?.close(); });
test("MVP-04 sub-raça soma bônus sem alterar a raça ou inferir escolha antiga", () => {
  assert.deepEqual(races.obterRaca("anao").bonusAtributos, { constituicao: 2 });
  assert.deepEqual(races.obterRaca("anao", "anao-colina").bonusAtributos, { constituicao: 2, sabedoria: 1 });
  const mountain = proficiency.reconciliarProficienciasCriacao({ racaId: "anao", subracaId: "anao-montanha" });
  assert.deepEqual(mountain.proficienciasArmaduras.sort(), ["leves", "medias"]);
});
test("MVP-04 colina soma um PV por nível, mantém dano e não duplica ao reabrir", () => {
  const ficha = { racaId: "anao", subracaId: "anao-colina", classeId: "clerigo", nivel: 1, pvPorNivel: { 1: 10 }, status: { pvMax: 11, pvAtual: 8 } };
  const classe = { id: "clerigo", dadoVida: 8 };
  const up = progress.recalcularPv(ficha, classe, 2, 2);
  assert.equal(up.status.pvMax, 19);
  assert.equal(up.status.pvAtual, 16);
  assert.equal(progress.recalcularPv({ ...ficha, ...up }, classe, 2, 2).status.pvMax, 19);
  assert.equal(progress.recalcularPv({ ...ficha, subracaId: null }, classe, 2, 1).status.pvMax, 10);
  assert.equal(ficha.pvPorNivel[2], undefined);
});

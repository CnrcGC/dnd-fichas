import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "vite";

let server, atributos, proficiencias, fichaUtils, backup, habilidade, retrato, classes;
before(async () => {
  server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: "custom" });
  atributos = await server.ssrLoadModule("/src/utils/atributos.js");
  proficiencias = await server.ssrLoadModule("/src/utils/proficienciasCriacao.js");
  fichaUtils = await server.ssrLoadModule("/src/utils/ficha.js");
  backup = await server.ssrLoadModule("/src/utils/backup.js");
  habilidade = await server.ssrLoadModule("/src/utils/habilidade.js");
  retrato = await server.ssrLoadModule("/src/utils/retrato.js");
  classes = await server.ssrLoadModule("/src/data/habilidadesClasses.js");
});
after(async () => server?.close());

test("4d6 descarta apenas um menor, inclusive em empates e nos extremos", () => {
  const dados = [1, 1, 6, 6, 1, 2, 3, 4, ...Array(16).fill(6)];
  let chamadas = 0;
  const resultados = atributos.rolarAtributos((lados) => { assert.equal(lados, 6); chamadas++; return dados.shift(); });
  assert.equal(chamadas, 24);
  assert.deepEqual(resultados.map((r) => r.total), [13, 9, 18, 18, 18, 18]);
  assert.equal(resultados[0].descartado, 0);
  assert.deepEqual(atributos.rolarAtributos(() => 1).map((r) => r.total), [3, 3, 3, 3, 3, 3]);
});

test("distribuição mantém seis posições únicas mesmo com resultados repetidos", () => {
  const original = [0, 1, 2, 3, 4, 5];
  assert.deepEqual(atributos.trocarDistribuicao(original, 0, 5), [5, 1, 2, 3, 4, 0]);
  assert.deepEqual(original, [0, 1, 2, 3, 4, 5]);
  assert.deepEqual(atributos.trocarDistribuicao(original, 0, 99), original);
});

test("atributos são inteiros finitos, de 1 até o total 30 com bônus racial", () => {
  assert.equal(atributos.limitarAtributo(999999, 2), 28);
  assert.equal(atributos.limitarAtributo(30, 0), 30);
  assert.equal(atributos.limitarAtributo(-10, 0), 1);
  assert.equal(atributos.limitarAtributo(12.8), 12);
  for (const invalido of [Infinity, -Infinity, NaN, "1e999"]) assert.equal(atributos.limitarAtributo(invalido, 0, 14), 14);
});

test("concessões manuais e legadas podem ser desmarcadas sem reaparecer na normalização", () => {
  for (const [tipo, campo, id] of [["idiomas", "idiomas", "elfico"], ["ferramentas", "proficienciasFerramentas", "alaude"], ["pericias", "pericias", "atletismo"]]) {
    let ficha = fichaUtils.criarFichaVazia("Teste");
    ficha = proficiencias.alternarProficienciaManual(ficha, tipo, id);
    assert.ok(tipo === "pericias" ? ficha[campo][id] : ficha[campo].includes(id));
    ficha = proficiencias.alternarProficienciaManual(ficha, tipo, id);
    ficha = fichaUtils.normalizarFicha(fichaUtils.normalizarFicha(ficha));
    assert.ok(tipo === "pericias" ? !ficha[campo][id] : !ficha[campo].includes(id));
  }
  const legada = { ...fichaUtils.criarFichaVazia("Legada"), idiomas: ["elfico"], origensProficiencias: {} };
  assert.ok(!fichaUtils.normalizarFicha(proficiencias.alternarProficienciaManual(legada, "idiomas", "elfico")).idiomas.includes("elfico"));
});

test("trocar ou limpar idioma de criação retira a origem antiga, preservando idiomas fixos", () => {
  let ficha = fichaUtils.normalizarFicha({ ...fichaUtils.criarFichaVazia("Humano"), racaId: "humano", escolhasCriacao: { idiomasRaca: ["elfico"] } });
  ficha = proficiencias.atualizarEscolhaCriacao(ficha, "idiomasRaca", ["anao"]);
  assert.ok(ficha.idiomas.includes("anao")); assert.ok(!ficha.idiomas.includes("elfico"));
  ficha = proficiencias.atualizarEscolhaCriacao(ficha, "idiomasRaca", []);
  assert.ok(!ficha.idiomas.includes("anao")); assert.ok(ficha.idiomas.includes("comum"));
});

test("habilidade exige nível da classe de origem, independentemente do nível total", () => {
  const instinto = classes.obterHabilidadeClasse("barbaro-instinto-selvagem");
  const ficha = { classeId: "guerreiro", nivel: 10, classesSecundarias: [{ classeId: "barbaro", nivel: 1 }] };
  assert.equal(habilidade.habilidadeClasseDisponivel(ficha, instinto).atendido, false);
  ficha.classesSecundarias[0].nivel = 7;
  assert.equal(habilidade.habilidadeClasseDisponivel(ficha, instinto).atendido, true);
  assert.equal(habilidade.habilidadeClasseDisponivel({ classeId: "barbaro", nivel: 1 }, instinto).atendido, false);
  assert.equal(habilidade.habilidadeClasseDisponivel({ classeId: "barbaro", nivel: 7 }, instinto).atendido, true);
});

test("retrato raster e histórico de rolagens sobrevivem à exportação/importação e dados legados", () => {
  const valor = "data:image/png;base64,aGVsbG8=";
  const ficha = { ...fichaUtils.criarFichaVazia("Retrato"), retrato: valor, metodoAtributos: "rolagem", rolagensAtributos: { resultados: atributos.rolarAtributos(() => 4), distribuicao: [5, 4, 3, 2, 1, 0] }, personalizado: { preservar: true } };
  const importada = backup.importarFichaDeJson(backup.serializarFicha(ficha));
  assert.equal(importada.retrato, valor);
  assert.deepEqual(importada.rolagensAtributos, ficha.rolagensAtributos);
  assert.deepEqual(importada.personalizado, ficha.personalizado);
  assert.ok(retrato.retratoLocalValido(valor));
  for (const invalido of ["https://example.com/image.png", "data:image/svg+xml;base64,AAAA", "data:text/html;base64,AAAA", "data:image/png;base64," + "a".repeat(400001)]) assert.equal(retrato.retratoLocalValido(invalido), false);
  assert.equal(fichaUtils.normalizarFicha({ ...ficha, retrato: undefined }).retrato, undefined);
});

test("upload rejeita tipo e tamanho antes de ler o arquivo", async () => {
  await assert.rejects(retrato.prepararRetrato({ type: "image/svg+xml", size: 1 }), /PNG, JPEG ou WebP/);
  await assert.rejects(retrato.prepararRetrato({ type: "image/png", size: 5 * 1024 * 1024 + 1 }), /até 5 MB/);
});

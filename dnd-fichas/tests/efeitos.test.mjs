import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "vite";

let servidor;
let dados;
let efeitos;
let fichaUtils;
let magias;

before(async () => {
  servidor = await createServer({ server: { middlewareMode: true, hmr: false }, appType: "custom" });
  dados = await servidor.ssrLoadModule("/src/utils/dados.js");
  efeitos = await servidor.ssrLoadModule("/src/utils/efeitos.js");
  fichaUtils = await servidor.ssrLoadModule("/src/utils/ficha.js");
  magias = await servidor.ssrLoadModule("/src/data/magiasSistema.js");
});

after(async () => { await servidor?.close(); });

test("MVP-06 encerra concentração por zero PV ou condições de incapacidade", () => {
  const ficha = fichaUtils.criarFichaVazia("Conjurador");
  const concentracao = { magiaId: "detect", nome: "Detectar Magia" };
  const ativa = { ...ficha, status: { ...ficha.status, pvAtual: 10, pvMax: 10 }, concentracao };
  assert.deepEqual(fichaUtils.normalizarFicha(ativa).concentracao, concentracao);
  assert.equal(fichaUtils.normalizarFicha({ ...ativa, status: { ...ativa.status, pvAtual: 0 } }).concentracao, null);
  for (const nome of ["Incapacitado", "Inconsciente", "Paralisado enquanto durar", "Petrificado", "Atordoada"]) {
    assert.equal(fichaUtils.normalizarFicha({ ...ativa, condicoesAtivas: [{ id: nome, nome, rodadasRestantes: null }] }).concentracao, null, nome);
  }
  assert.deepEqual(fichaUtils.normalizarFicha({ ...ativa, condicoesAtivas: [{ id: "blind", nome: "Cego", rodadasRestantes: null }] }).concentracao, concentracao);
  assert.deepEqual(ativa.concentracao, concentracao);
});

function rolagemSequencial(valores) {
  let indice = 0;
  return () => valores[indice++];
}

test("vantagem escolhe o maior d20 e desvantagem escolhe o menor", () => {
  const vantagem = dados.rolarTesteD20(3, { vantagem: true }, rolagemSequencial([4, 17]));
  assert.equal(vantagem.d20, 17);
  assert.equal(vantagem.total, 20);
  assert.deepEqual(vantagem.rolagens, [4, 17]);

  const desvantagem = dados.rolarTesteD20(3, { desvantagem: true }, rolagemSequencial([4, 17]));
  assert.equal(desvantagem.d20, 4);
  assert.equal(desvantagem.total, 7);
});

test("vantagem e desvantagem juntas se cancelam", () => {
  const resultado = dados.rolarTesteD20(
    2,
    { vantagem: true, desvantagem: true },
    rolagemSequencial([11, 20])
  );
  assert.equal(resultado.modo, "normal");
  assert.deepEqual(resultado.rolagens, [11]);
  assert.equal(resultado.total, 13);
});

test("dano consome PV temporário e ainda solicita concentração", () => {
  const resultado = efeitos.aplicarEfeitoPv(
    { pvAtual: 20, pvMax: 20, pvTemp: 5 },
    "dano",
    8
  );
  assert.equal(resultado.status.pvTemp, 0);
  assert.equal(resultado.status.pvAtual, 17);
  assert.deepEqual(
    efeitos.avisoConcentracaoPorDano({ magiaId: "voo" }, resultado.danoRecebido),
    { cd: 10 }
  );
});

test("cura respeita o máximo e reinicia testes de morte", () => {
  const resultado = efeitos.aplicarEfeitoPv(
    { pvAtual: 0, pvMax: 12, pvTemp: 0, testesMorteSucessos: 2, testesMorteFalhas: 1 },
    "cura",
    20
  );
  assert.equal(resultado.status.pvAtual, 12);
  assert.equal(resultado.status.testesMorteSucessos, 0);
  assert.equal(resultado.status.testesMorteFalhas, 0);
});

test("condições convertem duração em rodadas e terminam ao chegar a zero", () => {
  const condicao = efeitos.criarCondicaoAtiva(
    { nome: "Paralisado", fonte: "Imobilizar Pessoa", fonteId: "imobilizar-pessoa", duracao: "Concentração, 1 minuto" },
    () => "condicao-1"
  );
  assert.equal(condicao.rodadasRestantes, 10);
  let ativas = [condicao];
  for (let indice = 0; indice < 10; indice += 1) {
    ativas = efeitos.avancarCondicao(ativas, "condicao-1");
  }
  assert.deepEqual(ativas, []);
});

test("condições e metadados de cura persistem no modelo", () => {
  const curarFerimentos = magias.obterMagia("curar-ferimentos");
  assert.equal(curarFerimentos.cura.formula, "1d8");

  const normalizada = fichaUtils.normalizarFicha({
    id: "ficha",
    nivel: 1,
    classeId: "clerigo",
    atributos: {},
    status: { pvMax: 8, pvAtual: 8 },
    condicoesAtivas: [{
      id: "condicao",
      nome: "Caído",
      fonte: "Graxa",
      duracao: "1 rodada",
      rodadasRestantes: 1,
    }],
  });
  assert.equal(normalizada.condicoesAtivas.length, 1);
  assert.equal(normalizada.versaoFicha, 8);
});

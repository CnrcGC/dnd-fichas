import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "vite";

let servidor;
let dadosVida;
let fichaUtils;
let proficiencias;
let regras;
let validacao;
let progressao;

const atributosValidos = {
  forca: 13, destreza: 13, constituicao: 14,
  inteligencia: 14, sabedoria: 13, carisma: 13,
};

function fichaBase(overrides = {}) {
  return {
    racaId: "humano", antecedenteId: "acolito", classeId: "guerreiro", nivel: 3,
    atributos: atributosValidos, classesSecundarias: [], pericias: {},
    proficienciasFerramentas: [], status: { pvMax: 20, pvAtual: 10, pvTemp: 0 },
    ...overrides,
  };
}

before(async () => {
  servidor = await createServer({ server: { middlewareMode: true, hmr: false }, appType: "custom" });
  dadosVida = await servidor.ssrLoadModule("/src/utils/dadosVida.js");
  fichaUtils = await servidor.ssrLoadModule("/src/utils/ficha.js");
  proficiencias = await servidor.ssrLoadModule("/src/utils/proficienciasMulticlasse.js");
  regras = await servidor.ssrLoadModule("/src/data/proficienciasMulticlasse.js");
  validacao = await servidor.ssrLoadModule("/src/utils/validacaoFicha.js");
  progressao = await servidor.ssrLoadModule("/src/utils/progressao.js");
});

after(async () => { await servidor?.close(); });

test("personagem de uma classe possui um pool compatível", () => {
  const pools = dadosVida.normalizarPoolsDadosVida(fichaBase({ nivel: 3 }));
  assert.deepEqual(pools.guerreiro, {
    classeId: "guerreiro", nome: "Guerreiro", dadoVida: 10, maximo: 3, usados: 0,
  });
});

test("Guerreiro 3 / Mago 2 mantém pools separados", () => {
  const pools = dadosVida.normalizarPoolsDadosVida(fichaBase({
    classesSecundarias: [{ classeId: "mago", nivel: 2 }],
  }));
  assert.equal(pools.guerreiro.maximo, 3);
  assert.equal(pools.guerreiro.dadoVida, 10);
  assert.equal(pools.mago.maximo, 2);
  assert.equal(pools.mago.dadoVida, 6);
});

test("alterar o nível amplia somente o pool da classe correspondente", () => {
  const inicial = fichaUtils.normalizarFicha(fichaBase({
    classesSecundarias: [{ classeId: "mago", nivel: 2 }],
  }));
  const elevado = fichaUtils.normalizarFicha({
    ...inicial,
    classesSecundarias: [{ classeId: "mago", nivel: 3 }],
  });
  assert.equal(elevado.dadosVidaPorClasse.guerreiro.maximo, 3);
  assert.equal(elevado.dadosVidaPorClasse.mago.maximo, 3);
});

test("PV de level up em classe secundária usa e preserva o dado dela", () => {
  const personagem = fichaBase({
    pvPorNivel: { 1: 12, 2: 8, 3: 8 },
    origemClassePvPorNivel: { 1: "guerreiro", 2: "guerreiro", 3: "guerreiro" },
    status: { pvMax: 28, pvAtual: 20, pvTemp: 0 },
    classesSecundarias: [{ classeId: "mago", nivel: 1 }],
  });
  const mago = { id: "mago", dadoVida: 6 };
  const ganho = progressao.recalcularPv(personagem, mago, 2, 4, { 4: 5 });
  const revisitado = progressao.recalcularPv(
    { ...personagem, ...ganho }, mago, 2, 4
  );
  assert.equal(ganho.origemClassePvPorNivel[4], "mago");
  assert.equal(revisitado.pvPorNivel[4], 5);
  assert.equal(revisitado.status.pvMax, 33);
});

test("gasta somente o dado de vida escolhido e não ultrapassa o disponível", () => {
  const inicial = dadosVida.normalizarPoolsDadosVida(fichaBase({
    classeId: "barbaro", nivel: 1,
    classesSecundarias: [{ classeId: "mago", nivel: 1 }],
  }));
  const gastoMago = dadosVida.gastarDadoVida(inicial, "mago");
  const gastoOutraVez = dadosVida.gastarDadoVida(gastoMago, "mago");
  assert.equal(gastoMago.mago.usados, 1);
  assert.equal(gastoMago.barbaro.usados, 0);
  assert.equal(gastoOutraVez.mago.usados, 1);
});

test("descanso longo recupera primeiro o maior dado gasto", () => {
  const recuperados = dadosVida.restaurarDadosVidaLongo({
    mago: { classeId: "mago", dadoVida: 6, maximo: 2, usados: 1 },
    barbaro: { classeId: "barbaro", dadoVida: 12, maximo: 2, usados: 2 },
  }, 4);
  assert.equal(recuperados.barbaro.usados, 0);
  assert.equal(recuperados.mago.usados, 1);
});

test("ME-01 recuperação de dados de vida aceita preferência explícita", () => {
  const pools = {
    mago: { classeId: "mago", dadoVida: 6, maximo: 2, usados: 1 },
    barbaro: { classeId: "barbaro", dadoVida: 12, maximo: 2, usados: 2 },
  };
  const menores = dadosVida.restaurarDadosVidaLongo(pools, 4, "menores");
  const ordemClasses = dadosVida.restaurarDadosVidaLongo(pools, 4, "ordem-classes");

  assert.equal(menores.mago.usados, 0);
  assert.equal(menores.barbaro.usados, 1);
  assert.deepEqual(ordemClasses, menores);
});

test("migração antiga distribui dados gastos pela classe principal e é idempotente", () => {
  const antiga = fichaBase({
    dadosDeVidaUsados: 4,
    pvPorNivel: { 1: 12 },
    classesSecundarias: [{ classeId: "mago", nivel: 2 }],
  });
  const primeira = fichaUtils.normalizarFicha(antiga);
  const segunda = fichaUtils.normalizarFicha(primeira);
  assert.equal(primeira.dadosVidaPorClasse.guerreiro.usados, 3);
  assert.equal(primeira.dadosVidaPorClasse.mago.usados, 1);
  assert.deepEqual(segunda.dadosVidaPorClasse, primeira.dadosVidaPorClasse);
  assert.equal(segunda.origemClassePvPorNivel[1], "guerreiro");
});

test("proficiências de multiclasse só são concedidas na primeira entrada", () => {
  const ficha = fichaBase();
  const primeira = proficiencias.concederProficienciasMulticlasse(ficha, "ladino");
  const segunda = proficiencias.concederProficienciasMulticlasse(
    { ...ficha, ...primeira },
    "ladino"
  );
  assert.deepEqual(primeira.proficienciasArmaduras, ["leves"]);
  assert.ok(primeira.proficienciasFerramentas.includes("ferramentas-ladino"));
  assert.deepEqual(segunda, {});
});

test("escolha obrigatória de perícia é registrada uma vez e não duplica", () => {
  const entrada = proficiencias.concederProficienciasMulticlasse(fichaBase(), "ladino");
  const comPericia = proficiencias.escolherPericiaMulticlasse(
    { ...fichaBase(), ...entrada }, "ladino", "furtividade"
  );
  assert.equal(comPericia.pericias.furtividade, true);
  assert.deepEqual(
    proficiencias.escolherPericiaMulticlasse(
      { ...fichaBase(), ...entrada, ...comPericia }, "ladino", "furtividade"
    ),
    {}
  );
});

test("pré-requisitos e validação de pools continuam protegendo multiclasse", () => {
  assert.equal(regras.atendePreRequisitoMulticlasse("mago", atributosValidos), true);
  assert.equal(regras.atendePreRequisitoMulticlasse("mago", { ...atributosValidos, inteligencia: 10 }), false);
  const resultado = validacao.validarFicha(fichaBase({ dadosVidaPorClasse: {} }), atributosValidos);
  assert.ok(resultado.erros.some((erro) => erro.includes("pool de dados de vida ausente")));
});

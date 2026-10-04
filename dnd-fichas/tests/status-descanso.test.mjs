import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "vite";

let servidor;
let status;
let efeitos;
let descanso;

before(async () => {
  servidor = await createServer({
    server: { middlewareMode: true, hmr: false },
    appType: "custom",
  });
  status = await servidor.ssrLoadModule("/src/utils/status.js");
  efeitos = await servidor.ssrLoadModule("/src/utils/efeitos.js");
  descanso = await servidor.ssrLoadModule("/src/utils/descanso.js");
});

after(async () => { await servidor?.close(); });

test("PV atual, máximo e temporário são limitados a valores válidos", () => {
  const inicial = {
    pvMax: 20,
    pvAtual: 15,
    pvTemp: 4,
    testesMorteSucessos: 2,
    testesMorteFalhas: 1,
  };
  assert.equal(status.atualizarStatus(inicial, "pvAtual", 99).pvAtual, 20);
  assert.equal(status.atualizarStatus(inicial, "pvAtual", -5).pvAtual, 0);
  assert.equal(status.atualizarStatus(inicial, "pvTemp", -2).pvTemp, 0);

  const maximoReduzido = status.atualizarStatus(inicial, "pvMax", 10);
  assert.equal(maximoReduzido.pvMax, 10);
  assert.equal(maximoReduzido.pvAtual, 10);

  const recuperado = status.atualizarStatus(inicial, "pvAtual", 1);
  assert.equal(recuperado.testesMorteSucessos, 0);
  assert.equal(recuperado.testesMorteFalhas, 0);
});

test("dano extremo não deixa PV negativo e absorve PV temporário primeiro", () => {
  const resultado = efeitos.aplicarEfeitoPv(
    { pvMax: 12, pvAtual: 7, pvTemp: 3 },
    "dano",
    50
  );
  assert.equal(resultado.status.pvTemp, 0);
  assert.equal(resultado.status.pvAtual, 0);
  assert.equal(resultado.valorAplicado, 10);
  assert.equal(resultado.danoRecebido, 50);
});

test("três sucessos estabilizam, três falhas matam e morte tem prioridade", () => {
  let atual = { pvAtual: 0, testesMorteSucessos: 0, testesMorteFalhas: 0 };
  atual = status.alternarTesteMorte(atual, "sucesso", 2);
  assert.equal(status.estadoTestesMorte(atual).estabilizado, true);

  const bloqueada = status.alternarTesteMorte(atual, "falha", 0);
  assert.equal(bloqueada.testesMorteFalhas, 0);

  const conflito = { ...atual, testesMorteFalhas: 3 };
  assert.equal(status.estadoTestesMorte(conflito).morto, true);
  assert.equal(status.estadoTestesMorte(conflito).estabilizado, false);
  assert.deepEqual(status.reiniciarTestesMorte(conflito), {
    ...conflito,
    testesMorteSucessos: 0,
    testesMorteFalhas: 0,
  });
});

test("descanso curto restaura recursos curtos e Magia de Pacto", () => {
  const ficha = {
    recursos: [
      { id: "curto", usosMax: 2, usosGastos: 2, restauraEm: "curto" },
      { id: "longo", usosMax: 2, usosGastos: 1, restauraEm: "longo" },
    ],
    espacosMagiaPacto: { quantidade: 2, nivel: 2, usados: 2 },
  };
  const resultado = descanso.aplicarDescansoCurto(ficha);
  assert.equal(resultado.recursos[0].usosGastos, 0);
  assert.equal(resultado.recursos[1].usosGastos, 1);
  assert.equal(resultado.espacosMagiaPacto.usados, 0);
});

test("descanso longo recupera PV, espaços, recursos e aplica a preferência por dados maiores", () => {
  const ficha = {
    classeId: "barbaro",
    nivel: 2,
    classesSecundarias: [{ classeId: "mago", nivel: 2 }],
    status: {
      pvMax: 30,
      pvAtual: 1,
      pvTemp: 2,
      testesMorteSucessos: 1,
      testesMorteFalhas: 2,
    },
    dadosVidaPorClasse: {
      barbaro: { classeId: "barbaro", dadoVida: 12, maximo: 2, usados: 2 },
      mago: { classeId: "mago", dadoVida: 6, maximo: 2, usados: 1 },
    },
    espacosMagia: {
      1: { total: 4, usados: 3 },
      2: { total: 2, usados: 2 },
    },
    espacosMagiaPacto: { quantidade: 2, nivel: 2, usados: 1 },
    recursos: [
      { id: "curto", usosMax: 2, usosGastos: 2, restauraEm: "curto" },
      { id: "longo", usosMax: 3, usosGastos: 2, restauraEm: "longo" },
      { id: "manual", usosMax: 1, usosGastos: 1, restauraEm: "manual" },
    ],
  };
  const resultado = descanso.aplicarDescansoLongo(ficha);
  assert.equal(resultado.status.pvAtual, 30);
  assert.equal(resultado.status.pvTemp, 0);
  assert.equal(resultado.status.testesMorteSucessos, 0);
  assert.equal(resultado.status.testesMorteFalhas, 0);
  assert.equal(resultado.espacosMagia[1].usados, 0);
  assert.equal(resultado.espacosMagiaPacto.usados, 0);
  assert.equal(resultado.recursos[0].usosGastos, 0);
  assert.equal(resultado.recursos[1].usosGastos, 0);
  assert.equal(resultado.recursos[2].usosGastos, 1);
  assert.equal(resultado.concentracao, null);
  assert.equal(resultado.dadosVidaPorClasse.barbaro.usados, 0);
  assert.equal(resultado.dadosVidaPorClasse.mago.usados, 1);
  assert.equal(resultado.dadosDeVidaUsados, 1);
});

test("ME-01 descanso longo exige pelo menos 1 PV e não ressuscita morto", () => {
  const morto = {
    classeId: "guerreiro",
    nivel: 1,
    classesSecundarias: [],
    status: { pvMax: 12, pvAtual: 0, testesMorteSucessos: 0, testesMorteFalhas: 3 },
    recursos: [{ id: "recurso", usosMax: 1, usosGastos: 1, restauraEm: "longo" }],
  };

  assert.equal(descanso.podeBeneficiarDescansoLongo(morto.status), false);
  assert.deepEqual(descanso.aplicarDescansoLongo(morto), {});
});

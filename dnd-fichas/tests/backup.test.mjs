import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "vite";

let servidor;
let backup;
let fichaUtils;

before(async () => {
  servidor = await createServer({
    server: { middlewareMode: true, hmr: false },
    appType: "custom",
  });
  backup = await servidor.ssrLoadModule("/src/utils/backup.js");
  fichaUtils = await servidor.ssrLoadModule("/src/utils/ficha.js");
});

after(async () => { await servidor?.close(); });

test("exportar e importar preserva uma ficha atual normalizada", () => {
  const atual = fichaUtils.normalizarFicha({
    id: "ficha-atual",
    nome: "Lyra",
    criadoEm: 123456,
    racaId: "elfo",
    classeId: "mago",
    antecedenteId: "sabio",
    nivel: 5,
    atributos: {
      forca: 8,
      destreza: 14,
      constituicao: 13,
      inteligencia: 18,
      sabedoria: 12,
      carisma: 10,
    },
    status: {
      pvMax: 27,
      pvAtual: 19,
      pvTemp: 4,
      ca: 12,
      iniciativa: 0,
      deslocamento: 9,
      testesMorteSucessos: 0,
      testesMorteFalhas: 0,
    },
    moedas: { cobre: 4, prata: 3, electro: 2, ouro: 15, platina: 1 },
    inventario: [{
      id: "mochila",
      nome: "Mochila",
      quantidade: 1,
      peso: 2.5,
      origemId: "equipamento-mochila",
      tipoItem: "equipamento",
    }],
    recursos: [{
      id: "recuperacao",
      nome: "Recuperação Arcana",
      usosMax: 1,
      usosGastos: 1,
      restauraEm: "longo",
    }],
    magias: [{ id: "escudo", origemId: "escudo", nome: "Escudo", nivel: 1 }],
    habilidades: [{ id: "nota", nome: "Anotação personalizada", tipo: "personalizada" }],
    notas: "Preservar esta anotação.",
  });
  const texto = backup.serializarFicha(atual);
  const importada = backup.importarFichaDeJson(texto);
  assert.deepEqual(importada, atual);
});

test("importação legada acrescenta campos, limita níveis e preserva dados pessoais", () => {
  const legada = {
    id: "legada",
    nome: "Brom",
    classeId: "guerreiro",
    nivel: 15,
    classesSecundarias: [{ classeId: "mago", nivel: 10 }],
    atributos: { forca: 16, constituicao: 14 },
    status: { pvMax: 80, pvAtual: 120, pvTemp: -3 },
    dadosDeVidaUsados: 4,
    moedas: { ouro: "12", prata: -5 },
    inventario: [{
      id: "espada-antiga",
      nome: "Espada antiga",
      quantidade: 1,
      peso: 1.5,
      tipoItem: "arma",
      origemId: "arma-espada-longa",
      magico: true,
      bonusMagico: 2,
    }],
    habilidades: [{ id: "manual", nome: "Segredo antigo" }],
    notas: "Não apagar.",
  };
  const importada = backup.importarFichaDeJson(JSON.stringify(legada));
  assert.equal(importada.versaoFicha, 8);
  assert.equal(importada.nivel, 15);
  assert.equal(importada.classesSecundarias[0].nivel, 5);
  assert.equal(importada.normalizacaoNiveis.ajustado, true);
  assert.equal(importada.status.pvAtual, 80);
  assert.equal(importada.status.pvTemp, 0);
  assert.deepEqual(importada.moedas, {
    cobre: 0,
    prata: 0,
    electro: 0,
    ouro: 12,
    platina: 0,
  });
  assert.equal(importada.inventario[0].bonusMagico, 2);
  assert.equal(importada.habilidades[0].nome, "Segredo antigo");
  assert.equal(importada.notas, "Não apagar.");
  assert.equal(importada.dadosVidaPorClasse.guerreiro.usados, 4);
});

test("importação rejeita JSON inválido e valores que não são ficha", () => {
  assert.throws(
    () => backup.importarFichaDeJson("{incompleto"),
    SyntaxError
  );

  assert.throws(
    () => backup.importarFichaDeJson("[]"),
    /Arquivo inválido/
  );

  assert.throws(
    () => backup.importarFichaDeJson("null"),
    /Arquivo inválido/
  );

  assert.throws(
    () =>
      backup.importarFichaDeJson(
        JSON.stringify({
          teste: "isto não é uma ficha D&D",
          numero: 123,
        })
      ),
    /Arquivo inválido/
  );

  assert.throws(
    () =>
      backup.importarFichaDeJson(
        JSON.stringify({
          nome: "Objeto qualquer",
        })
      ),
    /Arquivo inválido/
  );
});
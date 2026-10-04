import test from "node:test";
import assert from "node:assert/strict";
import {
  MULTIPLICADOR_CAPACIDADE_CARGA,
  MULTIPLICADOR_EMPURRAR_ARRASTAR_ERGUER,
  MULTIPLICADORES_TAMANHO_CARGA,
  calcularCapacidadeCarga,
  calcularLimiteEmpurrarArrastarErguer,
  multiplicadorCargaPorTamanho,
} from "../src/utils/carga.js";

test("ME-01 calcula carga em kg conforme LJ p. 178, Erguendo e Carregando", () => {
  assert.equal(MULTIPLICADOR_CAPACIDADE_CARGA, 7.5);
  assert.equal(calcularCapacidadeCarga(10), 75);
  assert.equal(calcularCapacidadeCarga(20), 150);
});

test("ME-01 separa o limite de puxar, arrastar e erguer da capacidade de carga", () => {
  assert.equal(MULTIPLICADOR_EMPURRAR_ARRASTAR_ERGUER, 15);
  assert.equal(calcularLimiteEmpurrarArrastarErguer(10), 150);
  assert.equal(calcularLimiteEmpurrarArrastarErguer(20), 300);
});

test("ME-01 aplica tamanho à carga sem tratar Pequeno diferente de Médio", () => {
  assert.deepEqual(MULTIPLICADORES_TAMANHO_CARGA, {
    miudo: 0.5,
    pequeno: 1,
    medio: 1,
    grande: 2,
    enorme: 4,
    colossal: 8,
  });
  assert.equal(calcularCapacidadeCarga(10, "miudo"), 37.5);
  assert.equal(calcularCapacidadeCarga(10, "pequeno"), 75);
  assert.equal(calcularCapacidadeCarga(10, "medio"), 75);
  assert.equal(calcularCapacidadeCarga(10, "grande"), 150);
  assert.equal(calcularCapacidadeCarga(10, "enorme"), 300);
  assert.equal(calcularCapacidadeCarga(10, "colossal"), 600);
  assert.equal(calcularLimiteEmpurrarArrastarErguer(10, "grande"), 300);
});

test("ME-01 usa tamanho Médio como fallback compatível para registros antigos", () => {
  assert.equal(multiplicadorCargaPorTamanho(), 1);
  assert.equal(multiplicadorCargaPorTamanho("desconhecido"), 1);
  assert.equal(calcularCapacidadeCarga(10), calcularCapacidadeCarga(10, "medio"));
});

test("capacidade de carga trata valores ausentes ou inválidos como zero", () => {
  assert.equal(calcularCapacidadeCarga(), 0);
  assert.equal(calcularCapacidadeCarga("inválida"), 0);
  assert.equal(calcularCapacidadeCarga(-1), 0);
  assert.equal(calcularLimiteEmpurrarArrastarErguer(), 0);
  assert.equal(calcularLimiteEmpurrarArrastarErguer("inválida"), 0);
  assert.equal(calcularLimiteEmpurrarArrastarErguer(-1), 0);
});

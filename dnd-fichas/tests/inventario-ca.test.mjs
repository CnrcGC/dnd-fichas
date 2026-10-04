import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "vite";

let servidor;
let equipamento;
let carga;
let moedas;
let inventarioUtils;
let catalogoItens;

const modificadores = { destreza: 3, constituicao: 2, sabedoria: 4 };

function armadura(origemId, overrides = {}) {
  return {
    id: origemId,
    nome: origemId,
    tipoItem: "armadura",
    origemId,
    equipado: true,
    magico: false,
    bonusMagico: 0,
    ...overrides,
  };
}

before(async () => {
  servidor = await createServer({
    server: { middlewareMode: true, hmr: false },
    appType: "custom",
  });
  equipamento = await servidor.ssrLoadModule("/src/utils/equipamento.js");
  carga = await servidor.ssrLoadModule("/src/utils/carga.js");
  moedas = await servidor.ssrLoadModule("/src/utils/moedas.js");
  inventarioUtils = await servidor.ssrLoadModule("/src/utils/inventario.js");
  catalogoItens = await servidor.ssrLoadModule("/src/data/catalogoItens.js");
});

after(async () => { await servidor?.close(); });

test("equipar e desequipar armadura altera a CA", () => {
  const couro = armadura("armadura-couro");
  assert.equal(equipamento.calcularCaEquipada([], modificadores, "guerreiro"), 13);
  assert.equal(equipamento.calcularCaEquipada([couro], modificadores, "guerreiro"), 14);
  assert.equal(
    equipamento.calcularCaEquipada([{ ...couro, equipado: false }], modificadores, "guerreiro"),
    13
  );
});

test("armaduras média e pesada aplicam corretamente o modificador de Destreza", () => {
  assert.equal(
    equipamento.calcularCaEquipada([armadura("armadura-meia-armadura")], modificadores, "guerreiro"),
    17
  );
  assert.equal(
    equipamento.calcularCaEquipada([armadura("armadura-armadura-de-placas")], modificadores, "guerreiro"),
    18
  );
});

test("Defesa sem Armadura de Bárbaro e Monge respeita o escudo", () => {
  assert.equal(equipamento.calcularCaEquipada([], modificadores, "barbaro"), 15);
  assert.equal(equipamento.calcularCaEquipada([], modificadores, "monge"), 17);
  assert.equal(
    equipamento.calcularCaEquipada([armadura("armadura-escudo")], modificadores, "monge"),
    15
  );
});

test("escudo mágico soma bônus somente quando está ativo", () => {
  const escudo = armadura("armadura-escudo", {
    magico: true,
    bonusMagico: 1,
    requerEquipado: true,
  });
  assert.equal(equipamento.calcularCaEquipada([escudo], modificadores, "guerreiro"), 16);
  assert.equal(
    equipamento.calcularCaEquipada([{ ...escudo, equipado: false }], modificadores, "guerreiro"),
    13
  );
});

test("ME-01 peso considera quantidade e capacidade em kg usa Força total", () => {
  const itens = [
    { quantidade: 2, peso: 5 },
    { quantidade: 3, peso: 0.5 },
    { quantidade: -1, peso: 100 },
  ];
  assert.equal(carga.calcularPesoInventario(itens), 11.5);
  assert.equal(carga.calcularCapacidadeCarga(10), 75);
  assert.equal(carga.calcularPesoInventario(itens) > carga.calcularCapacidadeCarga(10), false);
});

test("item do catálogo preserva peso, quantidade e referência", () => {
  const mochila = catalogoItens.obterItemCatalogo("equipamento-mochila");
  const item = inventarioUtils.criarItemDoCatalogo(mochila);
  assert.equal(item.quantidade, 1);
  assert.equal(item.peso, 2.5);
  assert.equal(item.origemId, "equipamento-mochila");
});

test("moedas são inteiras, não negativas e possuem conversão estável", () => {
  const normalizadas = moedas.normalizarMoedas({ ouro: "12", prata: -2, cobre: 5.8 });
  assert.deepEqual(normalizadas, {
    cobre: 5,
    prata: 0,
    electro: 0,
    ouro: 12,
    platina: 0,
  });
  const atualizadas = moedas.atualizarMoeda(normalizadas, "platina", 2);
  assert.equal(moedas.valorTotalEmCobre(atualizadas), 3205);
});

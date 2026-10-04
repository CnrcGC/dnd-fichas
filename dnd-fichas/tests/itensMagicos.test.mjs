import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "vite";

let servidor;
let catalogo;
let itens;
let ataque;
let equipamento;
let fichaUtils;
let validacao;

before(async () => {
  servidor = await createServer({ server: { middlewareMode: true, hmr: false }, appType: "custom" });
  catalogo = await servidor.ssrLoadModule("/src/data/itensMagicos.js");
  itens = await servidor.ssrLoadModule("/src/utils/itensMagicos.js");
  ataque = await servidor.ssrLoadModule("/src/utils/ataque.js");
  equipamento = await servidor.ssrLoadModule("/src/utils/equipamento.js");
  fichaUtils = await servidor.ssrLoadModule("/src/utils/ficha.js");
  validacao = await servidor.ssrLoadModule("/src/utils/validacaoFicha.js");
});

after(async () => { await servidor?.close(); });

test("catálogo mágico inicial possui itens nomeados e regras orientadas por dados", () => {
  for (const id of [
    "espada-longa-mais-1",
    "escudo-mais-1",
    "manto-protecao",
    "varinha-misseis-magicos",
    "botas-elficas",
    "pocao-cura",
  ]) {
    const item = catalogo.obterItemMagico(id);
    assert.ok(item, id);
    assert.ok(item.regras.length > 0, id);
  }
});

test("sintonização respeita o limite de três itens", () => {
  let inventario = [0, 1, 2, 3].map((indice) => ({
    id: `item-${indice}`,
    magico: true,
    requerSintonizacao: true,
    sintonizado: false,
  }));

  for (const id of ["item-0", "item-1", "item-2"]) {
    const resultado = itens.alterarSintonizacao(inventario, id, true);
    assert.equal(resultado.erro, null);
    inventario = resultado.inventario;
  }

  const excedente = itens.alterarSintonizacao(inventario, "item-3", true);
  assert.match(excedente.erro, /limite de 3/i);
  assert.equal(itens.contarItensSintonizados(excedente.inventario), 3);
});

test("ME-01 normalização preserva sintonia excedente e desativa somente seu efeito", () => {
  const inventario = [0, 1, 2, 3].map((indice) => ({
    id: `item-${indice}`,
    magico: true,
    requerSintonizacao: true,
    sintonizado: true,
  }));
  const normalizado = itens.normalizarInventario(inventario);
  assert.equal(itens.contarItensSintonizados(normalizado), 4);
  assert.equal(normalizado[3].sintonizacaoExcedente, true);
  assert.equal(itens.itemMagicoAtivo(normalizado[3]), false);
});

test("ME-01 reconciliação de catálogo preserva e restaura a versão anterior", () => {
  const anterior = {
    id: "manto-antigo",
    nome: "Manto antigo",
    itemMagicoId: "manto-protecao",
    magico: true,
    raridade: "raro",
    bonusMagico: 0,
    requerEquipado: true,
    equipado: true,
    requerSintonizacao: true,
    sintonizado: true,
    efeitos: [{ tipo: "bonus-ca", valor: 2 }],
    regras: ["Regra preservada da versão anterior."],
  };

  const reconciliado = itens.normalizarInventario([anterior]);
  assert.equal(reconciliado[0].raridade, "incomum");
  assert.equal(reconciliado[0].efeitos[0].valor, 1);
  assert.equal(reconciliado[0].dadosCatalogoAnteriores.raridade, "raro");

  const restaurado = itens.restaurarDadosCatalogoAnteriores(reconciliado, "manto-antigo");
  const renormalizado = itens.normalizarInventario(restaurado.inventario);
  assert.equal(renormalizado[0].raridade, "raro");
  assert.equal(renormalizado[0].efeitos[0].valor, 2);
  assert.equal(renormalizado[0].preferirDadosCatalogoAnteriores, true);

  const atual = itens.usarDadosCatalogoAtuais(renormalizado, "manto-antigo");
  assert.equal(atual.inventario[0].raridade, "incomum");
  assert.equal(atual.inventario[0].preferirDadosCatalogoAnteriores, false);
});

test("ME-01 validação explica sintonia excedente sem apagar os itens", () => {
  const ficha = fichaUtils.normalizarFicha({
    id: "sintonias",
    nome: "Sintonias",
    racaId: "humano",
    antecedenteId: "acolito",
    classeId: "mago",
    nivel: 1,
    atributos: {},
    status: { pvMax: 6, pvAtual: 6, pvTemp: 0 },
    inventario: [0, 1, 2, 3].map((indice) => ({
      id: `item-${indice}`,
      magico: true,
      requerSintonizacao: true,
      sintonizado: true,
    })),
  });
  const resultado = validacao.validarFicha(ficha, {
    forca: 10,
    destreza: 10,
    constituicao: 10,
    inteligencia: 10,
    sabedoria: 10,
    carisma: 10,
  });

  assert.equal(ficha.inventario.length, 4);
  assert.ok(resultado.avisos.some((aviso) => aviso.includes("4 itens estão marcados")));
});

test("cargas não podem ficar negativas e a recuperação respeita o máximo", () => {
  const inventario = [{ id: "varinha", cargasAtuais: 1, cargasMaximas: 7 }];
  const gasto = itens.gastarCargasItem(inventario, "varinha", 1);
  assert.equal(gasto.erro, null);
  assert.equal(gasto.inventario[0].cargasAtuais, 0);
  assert.match(itens.gastarCargasItem(gasto.inventario, "varinha", 1).erro, /suficientes/i);

  const recarga = itens.recuperarCargasItem(gasto.inventario, "varinha", 20);
  assert.equal(recarga.inventario[0].cargasAtuais, 7);
  assert.equal(recarga.recuperadas, 7);
});

test("Manto de Proteção só aplica efeitos equipado e sintonizado", () => {
  const manto = {
    magico: true,
    requerEquipado: true,
    equipado: true,
    requerSintonizacao: true,
    sintonizado: false,
    efeitos: [{ tipo: "bonus-ca", valor: 1 }, { tipo: "bonus-salvaguardas", valor: 1 }],
  };
  assert.equal(itens.somarEfeitoItens([manto], "bonus-ca"), 0);
  assert.equal(itens.somarEfeitoItens([{ ...manto, sintonizado: true }], "bonus-ca"), 1);
  assert.equal(itens.somarEfeitoItens([{ ...manto, sintonizado: true }], "bonus-salvaguardas"), 1);
});

test("itens mágicos genéricos legados preservam bônus de arma e armadura", () => {
  const espada = {
    id: "espada-legada",
    nome: "Espada antiga",
    origemId: "arma-espada-longa",
    tipoItem: "arma",
    equipado: true,
    atributoAtaque: "auto",
    magico: true,
    bonusMagico: 2,
  };
  assert.equal(ataque.criarAtaqueApartirDeItemEquipado(espada).bonusMagico, 2);

  const couro = {
    id: "couro-legado",
    origemId: "armadura-couro",
    tipoItem: "armadura",
    equipado: true,
    magico: true,
    bonusMagico: 1,
  };
  assert.equal(
    equipamento.calcularCaEquipada([couro], { destreza: 2, constituicao: 0, sabedoria: 0 }, "guerreiro"),
    14
  );
});

test("estado de sintonização e cargas sobrevive à normalização da ficha", () => {
  const normalizada = fichaUtils.normalizarFicha({
    id: "ficha",
    nivel: 1,
    classeId: "mago",
    atributos: {},
    status: { pvMax: 6, pvAtual: 6 },
    inventario: [{
      id: "varinha",
      magico: true,
      requerSintonizacao: true,
      sintonizado: true,
      cargasMaximas: 7,
      cargasAtuais: 4,
    }],
  });
  assert.equal(normalizada.inventario[0].sintonizado, true);
  assert.equal(normalizada.inventario[0].cargasAtuais, 4);
  assert.equal(normalizada.versaoFicha, 8);
});

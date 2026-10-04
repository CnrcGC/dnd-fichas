import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "vite";

let servidor;
let ataque;
let armas;

before(async () => {
  servidor = await createServer({ server: { middlewareMode: true, hmr: false }, appType: "custom" });
  ataque = await servidor.ssrLoadModule("/src/utils/ataque.js");
  armas = await servidor.ssrLoadModule("/src/data/armas.js");
});

after(async () => { await servidor?.close(); });

const MODIFICADORES = { forca: 3, destreza: 1 };

function itemDeArma(origemId, atributoAtaque = "auto") {
  return {
    id: `item-${origemId}`,
    origemId: `arma-${origemId}`,
    nome: "",
    atributoAtaque,
    magico: false,
  };
}

test("ME-01 acuidade escolhe o melhor atributo e conserva override elegível", () => {
  const automatico = ataque.criarAtaqueApartirDeItemEquipado(itemDeArma("rapieira"), {
    modificadoresAtributos: MODIFICADORES,
    proficienciasArmas: ["marciais"],
  });
  const destreza = ataque.criarAtaqueApartirDeItemEquipado(itemDeArma("rapieira", "destreza"), {
    modificadoresAtributos: MODIFICADORES,
    proficienciasArmas: ["marciais"],
  });

  assert.equal(automatico.atributo, "forca");
  assert.equal(destreza.atributo, "destreza");
});

test("ME-01 rejeita override incompatível com a arma", () => {
  const espadaLonga = ataque.criarAtaqueApartirDeItemEquipado(itemDeArma("espada-longa", "destreza"), {
    modificadoresAtributos: MODIFICADORES,
    proficienciasArmas: ["marciais"],
  });
  assert.equal(espadaLonga.atributo, "forca");
});

test("ME-01 reconhece proficiência por categoria e por arma específica", () => {
  assert.equal(ataque.armaEhProficiente(armas.obterArma("rapieira"), ["marciais"]), true);
  assert.equal(ataque.armaEhProficiente(armas.obterArma("rapieira"), ["rapieiras"]), true);
  assert.equal(ataque.armaEhProficiente(armas.obterArma("espada-longa"), ["espadas-longas"]), true);
  assert.equal(ataque.armaEhProficiente(armas.obterArma("espada-longa"), ["simples"]), false);
});

test("ME-01 soma proficiência somente quando válida para o ataque", () => {
  const proficiente = ataque.criarAtaqueApartirDeItemEquipado(itemDeArma("rapieira"), {
    modificadoresAtributos: MODIFICADORES,
    proficienciasArmas: ["marciais"],
  });
  const naoProficiente = ataque.criarAtaqueApartirDeItemEquipado(itemDeArma("rapieira"), {
    modificadoresAtributos: MODIFICADORES,
    proficienciasArmas: ["simples"],
  });

  assert.equal(ataque.calcularBonusAcerto(proficiente, MODIFICADORES, 2), 5);
  assert.equal(ataque.calcularBonusAcerto(naoProficiente, MODIFICADORES, 2), 3);
});

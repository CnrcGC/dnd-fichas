import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "vite";

let servidor, racas, antecedentes, fichaUtils, criacao, validacao;

const atributos = {
  forca: 10,
  destreza: 10,
  constituicao: 10,
  inteligencia: 10,
  sabedoria: 10,
  carisma: 10,
};

before(async () => {
  servidor = await createServer({ server: { middlewareMode: true, hmr: false }, appType: "custom" });
  racas = await servidor.ssrLoadModule("/src/data/racas.js");
  antecedentes = await servidor.ssrLoadModule("/src/data/antecedentes.js");
  fichaUtils = await servidor.ssrLoadModule("/src/utils/ficha.js");
  criacao = await servidor.ssrLoadModule("/src/utils/proficienciasCriacao.js");
  validacao = await servidor.ssrLoadModule("/src/utils/validacaoFicha.js");
});

after(async () => servidor?.close());

test("ME-02A catálogo racial tem IDs e referências verificáveis", () => {
  assert.equal(racas.RACAS.length, 9);
  assert.equal(new Set(racas.RACAS.map((item) => item.id)).size, racas.RACAS.length);
  assert.equal(new Set(racas.SUBRACAS.map((item) => item.id)).size, racas.SUBRACAS.length);
  for (const entrada of [...racas.RACAS, ...racas.SUBRACAS]) {
    assert.equal(entrada.rulesProfile, "dnd5e-books-2014");
    assert.equal(entrada.sourceRefs?.[0]?.bookId, "LJ");
    assert.equal(Number.isInteger(entrada.sourceRefs?.[0]?.printedPage), true);
  }
  for (const subraca of racas.SUBRACAS) assert.ok(racas.obterRaca(subraca.racaId));
});

test("ME-02A combina bônus e deslocamento da raça e sub-raça", () => {
  assert.deepEqual(racas.obterBonusRaciais("elfo", "elfo-floresta"), {
    destreza: 2,
    sabedoria: 1,
  });
  assert.equal(racas.obterDeslocamentoRacial("elfo", "elfo-floresta"), 10.5);
  assert.deepEqual(racas.obterBonusRaciais("meio-elfo", null, ["forca", "sabedoria"]), {
    carisma: 2,
    forca: 1,
    sabedoria: 1,
  });
});

test("ME-02A ancestralidade dracônica determina resistência sem inventar escolha", () => {
  assert.deepEqual(
    racas.obterResistenciasRaciais("draconato", null, { ancestralidadeDraconicaId: "ouro" }),
    ["fogo"]
  );
  assert.deepEqual(racas.obterResistenciasRaciais("draconato", null, {}), []);
});

test("ME-02A valida ausência, incompatibilidade e escolha racial inválida", () => {
  const base = fichaUtils.normalizarFicha({
    ...fichaUtils.criarFichaVazia("Teste"),
    racaId: "elfo",
    classeId: "guerreiro",
    antecedenteId: "soldado",
  });
  assert.ok(validacao.validarFicha(base, atributos).pendencias.includes("Raça: escolha uma sub-raça."));
  const incompatível = { ...base, subracaId: "anao-colina" };
  assert.ok(validacao.validarFicha(incompatível, atributos).erros.includes("Raça: a sub-raça escolhida pertence a outra raça."));
  const draconato = { ...base, racaId: "draconato", subracaId: null, escolhasRaciais: { ancestralidadeDraconicaId: "inexistente" } };
  assert.ok(validacao.validarFicha(draconato, atributos).erros.includes("Raça: ancestralidade dracônica desconhecida."));
});

test("ME-02A reconcilia proficiências raciais por origem e remove a origem antiga", () => {
  const anao = criacao.reconciliarProficienciasCriacao({
    ...fichaUtils.criarFichaVazia("Borin"),
    racaId: "anao",
    subracaId: "anao-montanha",
    escolhasCriacao: { ferramentasRaca: ["ferramentas-ferreiro"] },
  });
  assert.ok(anao.proficienciasArmas.includes("machado-de-batalha"));
  assert.ok(anao.proficienciasArmaduras.includes("medias"));
  assert.deepEqual(anao.origensProficiencias.armaduras.medias, ["subraca:anao-montanha"]);

  const elfo = criacao.reconciliarProficienciasCriacao({ ...anao, racaId: "elfo", subracaId: "elfo-floresta", escolhasCriacao: {} });
  assert.equal(elfo.proficienciasArmaduras.includes("medias"), false);
  assert.ok(elfo.proficienciasArmas.includes("arco-longo"));
});

test("ME-02A normaliza sem apagar escolhas raciais e permanece idempotente", () => {
  const uma = fichaUtils.normalizarFicha({
    ...fichaUtils.criarFichaVazia("Kava"),
    racaId: "draconato",
    escolhasRaciais: { ancestralidadeDraconicaId: "prata" },
  });
  assert.equal(uma.escolhasRaciais.ancestralidadeDraconicaId, "prata");
  assert.deepEqual(fichaUtils.normalizarFicha(uma), uma);
});

test("ME-02A antecedentes possuem referência, equipamento estruturado e regra de personalização", () => {
  assert.equal(antecedentes.ANTECEDENTES.length, 13);
  for (const entrada of antecedentes.ANTECEDENTES) {
    assert.equal(entrada.sourceRefs?.[0]?.bookId, "LJ");
    assert.equal(Number.isInteger(entrada.sourceRefs?.[0]?.printedPage), true);
    assert.equal(entrada.equipamentoInicial?.descricao, entrada.equipamento);
    assert.equal(entrada.personalizacaoPermitida, true);
  }
  assert.equal(antecedentes.REGRA_PERSONALIZACAO_ANTECEDENTE.pericias, 2);
  assert.equal(antecedentes.REGRA_PERSONALIZACAO_ANTECEDENTE.combinacaoIdiomasFerramentas, 2);
  assert.equal(antecedentes.REGRA_PERSONALIZACAO_ANTECEDENTE.sourceRefs[0].printedPage, 125);
});

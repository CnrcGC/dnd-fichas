import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "vite";

let servidor, talentos, habilidadesClasses, habilidadesSubclasses, escolhasClassesDados;
let escolhasSubclassesDados, escolhasClasses, talentosUtils, subclassesFicha, progressao, classes, fichaUtils;

before(async () => {
  servidor = await createServer({ server: { middlewareMode: true, hmr: false }, appType: "custom" });
  talentos = await servidor.ssrLoadModule("/src/data/talentos.js");
  habilidadesClasses = await servidor.ssrLoadModule("/src/data/habilidadesClasses.js");
  habilidadesSubclasses = await servidor.ssrLoadModule("/src/data/habilidadesSubclasses.js");
  escolhasClassesDados = await servidor.ssrLoadModule("/src/data/escolhasClasses.js");
  escolhasSubclassesDados = await servidor.ssrLoadModule("/src/data/escolhasSubclasses.js");
  escolhasClasses = await servidor.ssrLoadModule("/src/utils/escolhasClasses.js");
  talentosUtils = await servidor.ssrLoadModule("/src/utils/talentos.js");
  subclassesFicha = await servidor.ssrLoadModule("/src/utils/subclassesFicha.js");
  progressao = await servidor.ssrLoadModule("/src/utils/progressao.js");
  classes = await servidor.ssrLoadModule("/src/data/classes.js");
  fichaUtils = await servidor.ssrLoadModule("/src/utils/ficha.js");
});

after(async () => servidor?.close());

function fichaBase(extras = {}) {
  return {
    classeId: "guerreiro",
    subclasseId: "campeao",
    nivel: 20,
    classesSecundarias: [],
    atributos: { forca: 15, destreza: 14, constituicao: 14, inteligencia: 10, sabedoria: 10, carisma: 10 },
    proficienciasArmaduras: ["leves", "medias", "pesadas"],
    habilidades: [],
    magias: [],
    escolhasTalentos: {},
    ...extras,
  };
}

test("ME-02D catálogo representa os 42 talentos com referência impressa", () => {
  assert.equal(talentos.TALENTOS.length, 42);
  assert.equal(new Set(talentos.TALENTOS.map((item) => item.id)).size, talentos.TALENTOS.length);
  for (const talento of talentos.TALENTOS) {
    assert.equal(talento.verificationStatus, "verified", talento.id);
    assert.equal(talento.sourceRefs[0].bookId, "LJ", talento.id);
    assert.ok(talento.sourceRefs[0].printedPage >= 167 && talento.sourceRefs[0].printedPage <= 171, talento.id);
  }
  assert.equal(talentos.obterTalento("resistente-phb").nome, "Resistente");
  assert.equal(talentos.obterTalento("resistente").legacyAliasFor, "resiliente");
});

test("ME-02D ASI respeita as progressões especiais de Guerreiro e Ladino", () => {
  assert.deepEqual(talentos.niveisAsiDaClasse("guerreiro"), [4, 6, 8, 12, 14, 16, 19]);
  assert.deepEqual(talentos.niveisAsiDaClasse("ladino"), [4, 8, 10, 12, 16, 19]);
  assert.deepEqual(talentos.niveisAsiDaClasse("mago"), [4, 8, 12, 16, 19]);
});

test("ME-02D valida pré-requisitos, repetição e escolhas internas de talentos", () => {
  const ritual = talentos.obterTalento("conjurador-ritual");
  assert.equal(talentosUtils.talentoDisponivel(fichaBase({ atributos: { inteligencia: 12, sabedoria: 12 } }), ritual).atendido, false);
  assert.equal(talentosUtils.talentoDisponivel(fichaBase({ atributos: { inteligencia: 13, sabedoria: 8 } }), ritual).atendido, true);

  const atleta = talentos.obterTalento("atleta");
  assert.equal(talentosUtils.escolhasTalentoValidas(atleta, { atributo: ["forca"] }), true);
  assert.equal(talentosUtils.escolhasTalentoValidas(atleta, { atributo: [] }), false);
  assert.equal(talentosUtils.aplicarIncrementoTalento({ forca: 19 }, atleta, { atributo: ["forca"] }).forca, 20);

  const repetido = fichaBase({
    escolhasTalentos: {
      "mago-4": { talentoId: "adepto-elemental", escolhas: { "tipo-dano": ["fogo"] } },
      "mago-8": { talentoId: "adepto-elemental", escolhas: { "tipo-dano": ["fogo"] } },
    },
  });
  assert.ok(talentosUtils.pendenciasTalentos(repetido).some((item) => item.includes("tipo de dano diferente")));
});

test("ME-02D progressões superiores mantêm nível individual de classe", () => {
  let sequencia = 0;
  const ficha = fichaBase({
    nivel: 11,
    classesSecundarias: [{ classeId: "monge", nivel: 9, subclasseId: "sombra" }],
  });
  const habilidades = subclassesFicha.sincronizarHabilidadesAutomaticasClasses(ficha, () => `h-${++sequencia}`);
  assert.ok(habilidades.some((item) => item.origemId === "guerreiro-ataque-extra-2"));
  assert.ok(!habilidades.some((item) => item.origemId === "guerreiro-ataque-extra-3"));
  assert.ok(!habilidades.some((item) => item.origemId === "monge-autopurificacao"));
  assert.ok(habilidades.some((item) => item.origemId === "monge-evasao"));
});

test("ME-02D catálogos de classe e subclasse estão verificados até o nível 20", () => {
  for (const classeId of ["barbaro", "bardo", "bruxo", "clerigo", "druida", "feiticeiro", "guerreiro", "ladino", "mago", "monge", "paladino", "patrulheiro"]) {
    assert.ok(habilidadesClasses.obterHabilidadesPorClasse(classeId).every((item) => item.verificationStatus === "verified"), classeId);
  }
  for (const subclasseId of ["campeao", "mestre-de-batalha", "mao-aberta", "cacador", "juramento-devocao"]) {
    assert.ok(habilidadesSubclasses.obterHabilidadesPorSubclasse(subclasseId).every((item) => item.verificationStatus === "verified"), subclasseId);
  }
});

test("ME-02D escolhas escaláveis alcançam suas fronteiras superiores", () => {
  const invocacoes = escolhasClassesDados.ESCOLHAS_CLASSES.find((item) => item.id === "bruxo-invocacoes");
  const metamagia = escolhasClassesDados.ESCOLHAS_CLASSES.find((item) => item.id === "feiticeiro-metamagia");
  const manobras = escolhasSubclassesDados.ESCOLHAS_SUBCLASSES.find((item) => item.id === "mestre-batalha-manobras");
  const disciplinas = escolhasSubclassesDados.ESCOLHAS_SUBCLASSES.find((item) => item.id === "quatro-elementos-disciplinas");
  assert.equal(escolhasClasses.quantidadeDaEscolha(invocacoes, 18), 8);
  assert.equal(escolhasClasses.quantidadeDaEscolha(metamagia, 17), 4);
  assert.equal(escolhasClasses.quantidadeDaEscolha(manobras, 15), 9);
  assert.equal(escolhasClasses.quantidadeDaEscolha(disciplinas, 17), 4);
});

test("ME-02D Robusto acompanha o nível sem perder dano já sofrido", () => {
  const ficha = fichaBase({
    nivel: 1,
    habilidades: [{ tipo: "talento", origemId: "robusto" }],
    pvPorNivel: { 1: 12 },
    origemClassePvPorNivel: { 1: "guerreiro" },
    status: { pvMax: 14, pvAtual: 9 },
  });
  const resultado = progressao.recalcularPv(ficha, classes.obterClasse("guerreiro"), 2, 2, { 2: 8 });
  assert.equal(resultado.status.pvMax, 24);
  assert.equal(resultado.status.pvAtual, 19);
});

test("ME-02D normalização preserva legado e inicializa o novo perfil", () => {
  const nova = fichaUtils.criarFichaVazia("Nova");
  assert.equal(nova.perfilTalentos, "me-02d");
  assert.equal(nova.perfilProgressaoClasse, "me-02d");
  assert.equal(nova.perfilProgressaoSubclasse, "me-02d");
  const legada = fichaUtils.normalizarFicha({ ...nova, perfilTalentos: undefined, perfilProgressaoClasse: undefined, perfilProgressaoSubclasse: undefined });
  assert.equal(legada.perfilTalentos, null);
  assert.deepEqual(legada.escolhasTalentos, {});
});

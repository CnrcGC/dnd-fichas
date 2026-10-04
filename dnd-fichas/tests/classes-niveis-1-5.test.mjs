import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "vite";

let servidor, classes, habilidades, escolhasDados, escolhas, recursosDados, recursos, fichaUtils, criacao, validacao;

before(async () => {
  servidor = await createServer({ server: { middlewareMode: true, hmr: false }, appType: "custom" });
  classes = await servidor.ssrLoadModule("/src/data/classes.js");
  habilidades = await servidor.ssrLoadModule("/src/data/habilidadesClasses.js");
  escolhasDados = await servidor.ssrLoadModule("/src/data/escolhasClasses.js");
  escolhas = await servidor.ssrLoadModule("/src/utils/escolhasClasses.js");
  recursosDados = await servidor.ssrLoadModule("/src/data/recursosClasses.js");
  recursos = await servidor.ssrLoadModule("/src/utils/recurso.js");
  fichaUtils = await servidor.ssrLoadModule("/src/utils/ficha.js");
  criacao = await servidor.ssrLoadModule("/src/utils/proficienciasCriacao.js");
  validacao = await servidor.ssrLoadModule("/src/utils/validacaoFicha.js");
});

after(async () => servidor?.close());

function fichaClasse(classeId, nivel, extra = {}) {
  return {
    ...fichaUtils.criarFichaVazia("Teste ME-02B"),
    classeId,
    nivel,
    atributos: { forca: 14, destreza: 14, constituicao: 14, inteligencia: 14, sabedoria: 14, carisma: 16 },
    ...extra,
  };
}

test("ME-02B todas as classes e características 1–5 possuem referência", () => {
  assert.equal(classes.CLASSES.length, 12);
  for (const classe of classes.CLASSES) {
    const fonte = classe.sourceRefs?.[0];
    assert.equal(fonte?.bookId, "LJ");
    assert.equal(Number.isInteger(fonte?.printedPage), true);
    assert.equal(fonte.endPrintedPage >= fonte.printedPage, true);
    const iniciais = habilidades.obterHabilidadesPorClasse(classe.id).filter((item) => item.nivel <= 5);
    assert.ok(iniciais.length > 0, classe.id);
    for (const habilidade of iniciais) {
      assert.equal(habilidade.verificationStatus, "verified", habilidade.id);
      assert.equal(habilidade.sourceRefs?.[0]?.bookId, "LJ", habilidade.id);
    }
  }
  assert.ok(habilidades.obterHabilidadeClasse("ladino-especializacao"));
  assert.ok(habilidades.obterHabilidadeClasse("paladino-punicao-divina"));
  assert.ok(habilidades.obterHabilidadeClasse("paladino-saude-divina"));
  assert.ok(habilidades.obterHabilidadeClasse("patrulheiro-consciencia-primitiva"));
});

test("ME-02B escolhas aparecem no nível individual correto", () => {
  assert.deepEqual(escolhasDados.obterEscolhasPorClasse("guerreiro", 1).map((item) => item.id), ["guerreiro-estilo"]);
  assert.equal(escolhasDados.obterEscolhasPorClasse("bardo", 2).some((item) => item.id === "bardo-especializacao"), false);
  assert.equal(escolhasDados.obterEscolhasPorClasse("bardo", 3).some((item) => item.id === "bardo-especializacao"), true);
  const invocacoes = escolhasDados.ESCOLHAS_CLASSES.find((item) => item.id === "bruxo-invocacoes");
  assert.equal(escolhas.quantidadeDaEscolha(invocacoes, 2), 2);
  assert.equal(escolhas.quantidadeDaEscolha(invocacoes, 5), 3);
});

test("ME-02B invocações respeitam nível, dádiva e magia exigida", () => {
  const definicao = escolhasDados.ESCOLHAS_CLASSES.find((item) => item.id === "bruxo-invocacoes");
  const nivel4 = fichaClasse("bruxo", 4, {
    magias: [{ id: "rajada", origemId: "rajada-mistica" }],
    escolhasClasse: { bruxo: { "bruxo-dadiva": ["pacto-tomo"] } },
  });
  const ids4 = escolhas.opcoesDaEscolha(definicao, nivel4, { classeId: "bruxo", nivel: 4 }).map((item) => item.id);
  assert.ok(ids4.includes("explosao-agonizante"));
  assert.ok(ids4.includes("livro-segredos-antigos"));
  assert.equal(ids4.includes("mente-pantanosa"), false);
  const ids5 = escolhas.opcoesDaEscolha(definicao, nivel4, { classeId: "bruxo", nivel: 5 }).map((item) => item.id);
  assert.ok(ids5.includes("mente-pantanosa"));
  assert.equal(ids5.includes("lamina-sedenta"), false);
});

test("ME-02B valida escolhas novas sem bloquear silenciosamente fichas legadas", () => {
  const nova = fichaClasse("guerreiro", 1);
  const resultadoNovo = validacao.validarFicha(nova, nova.atributos);
  assert.ok(resultadoNovo.pendencias.some((item) => item.includes("Estilo de Combate (guerreiro)")));

  const legado = { ...nova, perfilEscolhasClasse: null };
  const resultadoLegado = validacao.validarFicha(legado, legado.atributos);
  assert.equal(resultadoLegado.pendencias.some((item) => item.includes("Estilo de Combate (guerreiro)")), false);
  assert.ok(resultadoLegado.avisos.some((item) => item.includes("anterior ao perfil ME-02B")));
});

test("ME-02B escolhas persistem e a normalização é idempotente", () => {
  const guerreiro = escolhas.atualizarEscolhaClasse(fichaClasse("guerreiro", 1), "guerreiro", "guerreiro-estilo", ["defesa"]);
  const uma = fichaUtils.normalizarFicha(guerreiro);
  assert.deepEqual(uma.escolhasClasse.guerreiro["guerreiro-estilo"], ["defesa"]);
  assert.deepEqual(fichaUtils.normalizarFicha(uma), uma);
  assert.equal(escolhas.pendenciasEscolhasClasses(uma).some((item) => item.includes("Estilo de Combate")), false);
});

test("ME-02B Fúria e Inspiração de Bardo escalam nos limites 3 e 5", () => {
  const furia = recursosDados.RECURSOS_CLASSES.find((item) => item.id === "furia");
  assert.equal(recursos.resolverUsosMax(furia, { nivel: 2 }), 2);
  assert.equal(recursos.resolverUsosMax(furia, { nivel: 3 }), 3);

  const inspiracao = recursosDados.RECURSOS_CLASSES.find((item) => item.id === "inspiracao-bardo");
  const contexto = { modificadores: { carisma: 3 }, nivelTotal: 5 };
  const nivel4 = recursos.criarRecursoDoCatalogo(inspiracao, fichaClasse("bardo", 4), contexto, () => "bardo-4");
  const nivel5 = recursos.criarRecursoDoCatalogo(inspiracao, fichaClasse("bardo", 5), contexto, () => "bardo-5");
  assert.equal(nivel4.nome, "Inspiração de Bardo (d6)");
  assert.equal(nivel4.restauraEm, "longo");
  assert.equal(nivel5.nome, "Inspiração de Bardo (d8)");
  assert.equal(nivel5.restauraEm, "curto");
});

test("ME-02B idiomas secretos e idioma de Inimigo Favorito mantêm origem", () => {
  const druida = criacao.reconciliarProficienciasCriacao(fichaClasse("druida", 1));
  assert.ok(druida.idiomas.includes("druidico"));
  assert.ok(druida.origensProficiencias.idiomas.druidico.includes("classe-feature:druida"));

  const patrulheiro = criacao.reconciliarProficienciasCriacao(fichaClasse("patrulheiro", 1, {
    escolhasClasse: { patrulheiro: { "patrulheiro-idioma-inimigo": ["gigante"] } },
  }));
  assert.ok(patrulheiro.idiomas.includes("gigante"));
  assert.ok(patrulheiro.origensProficiencias.idiomas.gigante.includes("classe-escolha:patrulheiro"));
});

test("ME-02B Especialização combina Bardo e Ladino sem duplicar", () => {
  const ficha = fichaClasse("bardo", 3, {
    classesSecundarias: [{ classeId: "ladino", nivel: 1 }],
    escolhasClasse: {
      bardo: { "bardo-especializacao": ["percepcao", "atuacao"] },
      ladino: { "ladino-especializacao": ["percepcao", "ferramentas-ladino"] },
    },
  });
  assert.deepEqual([...escolhas.especializacoesDaFicha(ficha)].sort(), ["atuacao", "ferramentas-ladino", "percepcao"]);
});

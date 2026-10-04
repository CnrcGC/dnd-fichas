import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "vite";

let servidor, subclasses, habilidades, escolhasDados, escolhas, classesEscolhas, fichaUtils, fichaSubclasses, criacao, validacao, recursos, recursoUtils, magias;

before(async () => {
  servidor = await createServer({ server: { middlewareMode: true, hmr: false }, appType: "custom" });
  subclasses = await servidor.ssrLoadModule("/src/data/subclasses.js");
  habilidades = await servidor.ssrLoadModule("/src/data/habilidadesSubclasses.js");
  escolhasDados = await servidor.ssrLoadModule("/src/data/escolhasSubclasses.js");
  escolhas = await servidor.ssrLoadModule("/src/utils/escolhasSubclasses.js");
  classesEscolhas = await servidor.ssrLoadModule("/src/data/escolhasClasses.js");
  fichaUtils = await servidor.ssrLoadModule("/src/utils/ficha.js");
  fichaSubclasses = await servidor.ssrLoadModule("/src/utils/subclassesFicha.js");
  criacao = await servidor.ssrLoadModule("/src/utils/proficienciasCriacao.js");
  validacao = await servidor.ssrLoadModule("/src/utils/validacaoFicha.js");
  recursos = await servidor.ssrLoadModule("/src/data/recursosRastreaveis.js");
  recursoUtils = await servidor.ssrLoadModule("/src/utils/recurso.js");
  magias = await servidor.ssrLoadModule("/src/data/magiasExcecoesSubclasse.js");
});

after(async () => servidor?.close());

function ficha(classeId, nivel, subclasseId, extra = {}) {
  return { ...fichaUtils.criarFichaVazia("Teste ME-02C"), classeId, nivel, subclasseId, atributos: { forca: 14, destreza: 14, constituicao: 14, inteligencia: 16, sabedoria: 16, carisma: 16 }, ...extra };
}

test("ME-02C catálogo representa as 41 subclasses do livro anexado com fonte", () => {
  assert.equal(subclasses.SUBCLASSES.length, 41);
  for (const subclasse of subclasses.SUBCLASSES) {
    assert.equal(subclasse.sourceRefs?.[0]?.bookId, "LJ", subclasse.id);
    assert.equal(Number.isInteger(subclasse.sourceRefs?.[0]?.printedPage), true, subclasse.id);
    assert.equal(habilidades.subclasseTemHabilidadesDetalhadas(subclasse.id), true, subclasse.id);
    for (const habilidade of habilidades.obterHabilidadesPorSubclasse(subclasse.id).filter((item) => item.nivel <= 10)) {
      assert.equal(habilidade.verificationStatus, "verified", habilidade.id);
      assert.equal(habilidade.sourceRefs?.[0]?.bookId, "LJ", habilidade.id);
    }
  }
  for (const id of ["patrono-grande-antigo", "dominio-conhecimento", "escola-transmutacao", "quatro-elementos", "juramento-ancioes", "rastreador-subterraneo"]) assert.ok(subclasses.obterSubclasse(id), id);
});

test("ME-02C escolhas respeitam fronteiras dos níveis 6, 7 e 10", () => {
  const manobras = escolhasDados.ESCOLHAS_SUBCLASSES.find((item) => item.id === "mestre-batalha-manobras");
  assert.equal(classesEscolhas.ESCOLHAS_CLASSES.find((item) => item.id === "bardo-especializacao").quantidadePorNivel.at(-1)[1], 4);
  assert.equal(classesEscolhas.ESCOLHAS_CLASSES.find((item) => item.id === "bruxo-invocacoes").quantidadePorNivel.at(-1)[1], 5);
  assert.equal(escolhasDados.obterEscolhasPorSubclasse("totem-guerreiro", 5).some((item) => item.id === "totem-aspecto"), false);
  assert.equal(escolhasDados.obterEscolhasPorSubclasse("totem-guerreiro", 6).some((item) => item.id === "totem-aspecto"), true);
  assert.equal(classesEscolhas.ESCOLHAS_CLASSES.find((item) => item.id === "ladino-especializacao").quantidadePorNivel.at(-1)[0], 6);
  assert.equal(manobras.quantidadePorNivel.find(([nivel]) => nivel === 7)[1], 5);
  assert.equal(escolhasDados.obterEscolhasPorSubclasse("campeao", 9).length, 0);
  assert.equal(escolhasDados.obterEscolhasPorSubclasse("campeao", 10).length, 1);
});

test("ME-02C sincroniza somente características alcançadas pelo nível da classe", () => {
  const personagem = ficha("barbaro", 10, null, { classesSecundarias: [{ classeId: "mago", nivel: 6, subclasseId: "escola-transmutacao" }] });
  const sincronizada = fichaSubclasses.sincronizarFichaComSubclasses(personagem, () => crypto.randomUUID());
  assert.ok(sincronizada.habilidades.some((item) => item.nome === "Pedra de Transmutador"));
  assert.equal(sincronizada.habilidades.some((item) => item.nome === "Metamorfo"), false);
});

test("ME-02C valida escolhas novas e apenas avisa fichas legadas", () => {
  const nova = ficha("guerreiro", 10, "campeao");
  assert.ok(validacao.validarFicha(nova, nova.atributos).pendencias.some((item) => item.includes("Estilo de Combate Adicional")));
  const antiga = { ...nova, perfilEscolhasSubclasse: null };
  const resultado = validacao.validarFicha(antiga, antiga.atributos);
  assert.equal(resultado.pendencias.some((item) => item.includes("Estilo de Combate Adicional")), false);
  assert.ok(resultado.avisos.some((item) => item.includes("ME-02C")));
});

test("ME-02C escolhas dependentes só bloqueiam quando a opção correspondente está ativa", () => {
  const comum = ficha("mago", 6, "escola-transmutacao", { escolhasSubclasse: { "escola-transmutacao": { "transmutacao-pedra": ["deslocamento"] } } });
  assert.equal(escolhas.pendenciasEscolhasSubclasses(comum).some((item) => item.includes("Tipo de Resistência")), false);
  const resistente = ficha("mago", 6, "escola-transmutacao", { escolhasSubclasse: { "escola-transmutacao": { "transmutacao-pedra": ["resistencia-elemental"] } } });
  assert.ok(escolhas.pendenciasEscolhasSubclasses(resistente).some((item) => item.includes("Tipo de Resistência")));
});

test("ME-02C concessões de subclasse mantêm origem e especialização", () => {
  const clerigo = ficha("clerigo", 6, "dominio-conhecimento", { escolhasSubclasse: { "dominio-conhecimento": { "conhecimento-pericias": ["arcanismo", "historia"], "conhecimento-idiomas": ["anao", "elfico"] } } });
  const reconciliada = criacao.reconciliarProficienciasCriacao(clerigo);
  assert.ok(reconciliada.pericias.arcanismo);
  assert.ok(reconciliada.origensProficiencias.pericias.arcanismo.includes("subclasse-escolha:dominio-conhecimento"));
  assert.deepEqual([...escolhas.especializacoesSubclasseDaFicha(reconciliada)].sort(), ["arcanismo", "historia"]);
});

test("ME-02C recursos escalam pelo nível individual", () => {
  const canalizar = recursos.RECURSOS_RASTREAVEIS.find((item) => item.id === "canalizar-divindade-clerigo");
  assert.equal(recursoUtils.resolverUsosMax(canalizar, { nivel: 5 }), 1);
  assert.equal(recursoUtils.resolverUsosMax(canalizar, { nivel: 6 }), 2);
  const superioridade = recursos.RECURSOS_RASTREAVEIS.find((item) => item.id === "dados-superioridade");
  assert.equal(recursoUtils.resolverUsosMax(superioridade, { nivel: 6 }), 4);
  assert.equal(recursoUtils.resolverUsosMax(superioridade, { nivel: 7 }), 5);
});

test("ME-02C terreno do Círculo seleciona a lista sempre preparada correta", () => {
  const druida = ficha("druida", 5, "circulo-terra", { escolhasSubclasse: { "circulo-terra": { "circulo-terreno": ["subterraneo"] } } });
  const regra = magias.obterRegraMagiaSubclasse("circulo-terra", druida);
  assert.ok(magias.magiasDaRegraNoNivel(regra, 5).includes("teia"));
  assert.equal(magias.magiasDaRegraNoNivel(regra, 5).includes("passo-nebuloso"), false);
});

test("ME-02C referências de magia ausentes ficam explícitas sem contaminar o catálogo ativo", () => {
  const conhecimento = magias.obterRegraMagiaSubclasse("dominio-conhecimento");
  assert.ok(conhecimento.niveisPendentesCatalogo[3].includes("augurio"));
  assert.equal(magias.magiasDaRegraNoNivel(conhecimento, 10).includes("augurio"), false);
});

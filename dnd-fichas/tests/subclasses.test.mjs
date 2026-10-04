import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "vite";

let servidor;
let subclasses;
let catalogoSubclasses;
let fichaUtils;
let conjuracao;
let acesso;
let validacao;
let regrasMagia;
let recursos;
let descanso;

const atributos = {
  forca: 13, destreza: 13, constituicao: 12,
  inteligencia: 16, sabedoria: 16, carisma: 16,
};

function fichaBase(overrides = {}) {
  return {
    racaId: "humano",
    antecedenteId: "acolito",
    classeId: "guerreiro",
    nivel: 1,
    subclasseId: null,
    classesSecundarias: [],
    habilidades: [],
    magias: [],
    recursos: [],
    status: { pvMax: 10, pvAtual: 10, pvTemp: 0 },
    ...overrides,
  };
}

before(async () => {
  servidor = await createServer({ server: { middlewareMode: true, hmr: false }, appType: "custom" });
  subclasses = await servidor.ssrLoadModule("/src/utils/subclassesFicha.js");
  catalogoSubclasses = await servidor.ssrLoadModule("/src/data/subclasses.js");
  fichaUtils = await servidor.ssrLoadModule("/src/utils/ficha.js");
  conjuracao = await servidor.ssrLoadModule("/src/utils/conjuracao.js");
  acesso = await servidor.ssrLoadModule("/src/utils/acessoMagias.js");
  validacao = await servidor.ssrLoadModule("/src/utils/validacaoFicha.js");
  regrasMagia = await servidor.ssrLoadModule("/src/data/magiasExcecoesSubclasse.js");
  recursos = await servidor.ssrLoadModule("/src/data/recursosSubclasses.js");
  descanso = await servidor.ssrLoadModule("/src/utils/recurso.js");
});

after(async () => { await servidor?.close(); });

test("ME-01 Assassinar não promete acerto automático", () => {
  const descricao = catalogoSubclasses.obterSubclasse("assassino").descricao;

  assert.match(descricao, /vantagem.+ainda não agiram/i);
  assert.match(descricao, /ataques que atinjam.+surpreendidas.+críticos/i);
  assert.doesNotMatch(descricao, /acerto automático/i);
});

test("ME-01 Arquifada descreve lista expandida e Presença Feérica sem conceder teleporte", () => {
  const descricao = catalogoSubclasses.obterSubclasse("patrono-arquifada").descricao;

  assert.match(descricao, /amplia.+lista de magias/i);
  assert.match(descricao, /Presença Feérica.+enfeitiçar ou amedrontar/i);
  assert.doesNotMatch(descricao, /Passo Fey|teleport/i);
});

test("ME-01 Bravura descreve proficiências e Inspiração em Combate sem auto-inspiração", () => {
  const descricao = catalogoSubclasses.obterSubclasse("colegio-bravura").descricao;

  assert.match(descricao, /armaduras médias, escudos e armas marciais/i);
  assert.match(descricao, /outra criatura.+Inspiração.+dano.+CA/i);
  assert.doesNotMatch(descricao, /si mesmo|resistência extra/i);
});

test("ME-01 Mão Aberta impede reações em vez de atribuir atordoamento à subclasse", () => {
  const descricao = catalogoSubclasses.obterSubclasse("mao-aberta").descricao;

  assert.match(descricao, /Rajada de Golpes.+derrubar.+empurrar.+impedir reações/i);
  assert.doesNotMatch(descricao, /atordoar/i);
});

test("ME-01 Mestre das Feras não inventa comando geral como ação bônus", () => {
  const descricao = catalogoSubclasses.obterSubclasse("mestre-das-feras").descricao;

  assert.match(descricao, /companheiro animal.+própria iniciativa.+obedece aos seus comandos/i);
  assert.doesNotMatch(descricao, /comandado como ação bônus/i);
});

test("subclasse só é compatível no nível da própria classe", () => {
  assert.equal(subclasses.subclasseCompativel("guerreiro", "cavaleiro-arcano", 2), false);
  assert.equal(subclasses.subclasseCompativel("guerreiro", "cavaleiro-arcano", 3), true);
  assert.equal(subclasses.subclasseCompativel("mago", "cavaleiro-arcano", 20), false);
});

test("sincroniza habilidades da classe principal e da secundária sem duplicar", () => {
  const personagem = fichaBase({
    nivel: 3,
    subclasseId: "cavaleiro-arcano",
    classesSecundarias: [{ classeId: "ladino", nivel: 3, subclasseId: "trapaceiro-arcano" }],
  });
  let proximoId = 1;
  const id = () => `auto-${proximoId++}`;
  const sincronizada = subclasses.sincronizarFichaComSubclasses(personagem, id);
  const repetida = subclasses.sincronizarFichaComSubclasses(sincronizada, id);

  assert.ok(sincronizada.habilidades.some((item) => item.origemSubclasseId === "cavaleiro-arcano"));
  assert.ok(sincronizada.habilidades.some((item) => item.origemSubclasseId === "trapaceiro-arcano"));
  assert.equal(repetida.habilidades.length, sincronizada.habilidades.length);
  assert.deepEqual(
    repetida.habilidades.map((item) => item.id),
    sincronizada.habilidades.map((item) => item.id)
  );
});

test("subclasses usam nível individual, e não o nível total", () => {
  const personagem = fichaBase({
    nivel: 17,
    classesSecundarias: [{ classeId: "mago", nivel: 2, subclasseId: "escola-evocacao" }],
  });
  const sincronizada = subclasses.sincronizarFichaComSubclasses(personagem, () => "id");
  assert.ok(sincronizada.habilidades.some((item) => item.nome === "Esculpir Magias"));
  assert.equal(sincronizada.habilidades.some((item) => item.nome === "Truque Potente"), false);
});

test("Cavaleiro Arcano e Trapaceiro Arcano funcionam como classes secundárias", () => {
  const guerreiroSecundario = fichaBase({
    classeId: "barbaro",
    nivel: 2,
    classesSecundarias: [{ classeId: "guerreiro", nivel: 3, subclasseId: "cavaleiro-arcano" }],
  });
  const ladinoSecundario = fichaBase({
    classeId: "barbaro",
    nivel: 2,
    classesSecundarias: [{ classeId: "ladino", nivel: 3, subclasseId: "trapaceiro-arcano" }],
  });

  assert.equal(conjuracao.obterAtributoConjuracao("guerreiro", "cavaleiro-arcano", 3), "inteligencia");
  assert.equal(conjuracao.obterAtributoConjuracao("ladino", "trapaceiro-arcano", 3), "inteligencia");
  assert.deepEqual(
    acesso.classesElegiveisParaMagia(guerreiroSecundario, { id: "escudo", nivel: 1, escola: "abjuracao" })
      .map((item) => item.classeId),
    ["guerreiro"]
  );
  assert.deepEqual(
    acesso.classesElegiveisParaMagia(ladinoSecundario, { id: "maos-magicas", nivel: 0, escola: "conjuracao" })
      .map((item) => item.classeId),
    ["ladino"]
  );
});

test("conjuradores de um terço contribuem para espaços combinados", () => {
  const combinado = conjuracao.obterEspacosCombinadosMulticlasse([
    { classeId: "mago", nivel: 2, subclasseId: null },
    { classeId: "guerreiro", nivel: 3, subclasseId: "cavaleiro-arcano" },
  ]);
  assert.equal(combinado.espacosRegulares[1], 4);
  assert.equal(combinado.espacosRegulares[2], 2);
});

test("magias sempre preparadas são automáticas; lista expandida não é", () => {
  const vida = fichaBase({ classeId: "clerigo", nivel: 3, subclasseId: "dominio-vida" });
  const corruptor = fichaBase({ classeId: "bruxo", nivel: 5, subclasseId: "patrono-corruptor" });
  const vidaSincronizada = subclasses.sincronizarFichaComSubclasses(vida, () => "vida-auto");
  const corruptorSincronizado = subclasses.sincronizarFichaComSubclasses(corruptor, () => "corruptor-auto");

  assert.ok(vidaSincronizada.magias.some((magia) => magia.origemId === "bencao" && magia.preparada));
  assert.equal(corruptorSincronizado.magias.length, 0);
  assert.equal(regrasMagia.obterExcecaoMagia(corruptor, "bola-de-fogo", "bruxo")?.tipo, "lista-expandida");
});

test("Mãos Mágicas de Trapaceiro Arcano é concedida automaticamente", () => {
  const personagem = fichaBase({ classeId: "ladino", nivel: 3, subclasseId: "trapaceiro-arcano" });
  const sincronizada = subclasses.sincronizarFichaComSubclasses(personagem, () => "mao-magica");
  const magia = sincronizada.magias.find((item) => item.origemId === "maos-magicas");
  assert.equal(magia?.classeId, "ladino");
  assert.equal(magia?.origemSubclasseTipo, "concedida");
});

test("normalização conserva dados antigos e acrescenta subclasses secundárias", () => {
  const antiga = {
    id: "antiga",
    classeId: "guerreiro",
    nivel: 4,
    classesSecundarias: [{ classeId: "mago", nivel: 2 }],
    habilidades: [{ id: "manual", nome: "Anotação pessoal" }],
    recursos: [{ id: "recurso", nome: "Marcador pessoal" }],
    notas: "não apagar",
  };
  const normalizada = fichaUtils.normalizarFicha(antiga);
  assert.equal(normalizada.subclasseId, null);
  assert.equal(normalizada.classesSecundarias[0].subclasseId, null);
  assert.equal(normalizada.habilidades[0].nome, "Anotação pessoal");
  assert.equal(normalizada.recursos[0].nome, "Marcador pessoal");
  assert.equal(normalizada.notas, "não apagar");
});

test("recursos de subclasse preservam descanso aplicável", () => {
  const dadosSuperioridade = recursos.RECURSOS_SUBCLASSES.find((item) => item.id === "dados-superioridade");
  assert.equal(dadosSuperioridade.restauraEm, "curto");
  assert.equal(descanso.restaurarRecursos([{ ...dadosSuperioridade, usosMax: 4, usosGastos: 4 }], "curto")[0].usosGastos, 0);
});

test("validação detecta subclasse inválida, ausência e habilidade automática ausente", () => {
  const invalida = fichaBase({ classeId: "guerreiro", nivel: 3, subclasseId: "escola-evocacao" });
  const ausente = fichaBase({ classeId: "ladino", nivel: 3 });
  const semHabilidade = fichaBase({ classeId: "guerreiro", nivel: 3, subclasseId: "campeao" });

  assert.ok(validacao.validarFicha(invalida, atributos).erros.some((erro) => erro.includes("pertence a outra classe")));
  assert.ok(validacao.validarFicha(ausente, atributos).pendencias.some((pendencia) => pendencia.includes("escolha uma subclasse")));
  assert.ok(validacao.validarFicha(semHabilidade, atributos).avisos.some((aviso) => aviso.includes("habilidade automática")));
});

test("validação continua protegendo teto total e pré-requisitos de multiclasse", () => {
  const personagem = fichaBase({
    nivel: 20,
    classesSecundarias: [{ classeId: "mago", nivel: 1, subclasseId: null }],
  });
  const atributosSemRequisito = { ...atributos, forca: 10, destreza: 10 };
  const resultado = validacao.validarFicha(personagem, atributosSemRequisito);
  assert.ok(resultado.erros.some((erro) => erro.includes("máximo permitido")));
  assert.ok(resultado.erros.some((erro) => erro.includes("Multiclasse em Guerreiro")));
});

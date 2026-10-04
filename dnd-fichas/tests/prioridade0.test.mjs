import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "vite";

let servidor, fichaUtils, criacao, validacao, regras, regrasDados, catalogo, excecoes;
const atributos = { forca: 13, destreza: 14, constituicao: 14, inteligencia: 14, sabedoria: 14, carisma: 14 };

function fichaBase(extra = {}) {
  return {
    nome: "Aria", racaId: "elfo", subracaId: "elfo-floresta", classeId: "bardo", antecedenteId: "acolito", nivel: 1,
    atributos, status: { pvMax: 10, pvAtual: 10, pvTemp: 0 }, espacosMagia: {},
    pvPorNivel: { 1: 10 }, origemClassePvPorNivel: { 1: "bardo" },
    escolhasCriacao: { periciasClasse: ["acrobacia", "atuacao", "arcanismo"], ferramentasClasse: ["alaude", "flauta", "tambor"], idiomasAntecedente: ["anao", "gnomico"] },
    ...extra,
  };
}

before(async () => {
  servidor = await createServer({ server: { middlewareMode: true, hmr: false }, appType: "custom" });
  fichaUtils = await servidor.ssrLoadModule("/src/utils/ficha.js");
  criacao = await servidor.ssrLoadModule("/src/utils/proficienciasCriacao.js");
  validacao = await servidor.ssrLoadModule("/src/utils/validacaoFicha.js");
  regras = await servidor.ssrLoadModule("/src/utils/regrasMagias.js");
  regrasDados = await servidor.ssrLoadModule("/src/data/regrasMagias.js");
  catalogo = await servidor.ssrLoadModule("/src/data/magiasSistema.js");
  excecoes = await servidor.ssrLoadModule("/src/data/magiasExcecoesSubclasse.js");
});
after(async () => servidor?.close());

test("validação final: rascunho, pronta, aviso e normalização idempotente", () => {
  const pronta = fichaUtils.normalizarFicha(fichaBase());
  assert.equal(validacao.validarFicha(pronta, atributos).pronta, true);
  assert.equal(validacao.validarFicha(fichaBase({ nome: "" }), atributos).pendencias.length > 0, true);
  assert.equal(validacao.validarFicha(fichaBase({ status: { pvMax: 4, pvAtual: 5, pvTemp: 0 } }), atributos).erros.length > 0, true);
  const aviso = validacao.validarFicha(fichaBase({ magias: [{ id: "m", nome: "Ritual da mesa", nivel: 1, classeId: "especial", fonteEspecial: "Regra da mesa" }] }), atributos);
  assert.equal(aviso.avisos.length > 0, true);
  const uma = fichaUtils.normalizarFicha(fichaBase({ status: { pvMax: 5, pvAtual: 99, pvTemp: -1 } }));
  assert.deepEqual(fichaUtils.normalizarFicha(uma), uma);
});

test("gate permite avisos, bloqueia pendências e invalida pronta após alteração", () => {
  const valida = fichaUtils.normalizarFicha(fichaBase());
  const somenteAviso = {
    ...valida,
    estadoFicha: "pronta",
    normalizacaoNiveis: { ajustado: true },
  };
  const resultadoAviso = validacao.validarFicha(somenteAviso, atributos);
  assert.equal(resultadoAviso.avisos.length > 0, true);
  assert.equal(resultadoAviso.pronta, true);
  assert.equal(
    validacao.reconciliarEstadoProntidao(somenteAviso, atributos).estadoFicha,
    "pronta"
  );

  const incompleta = { ...valida, estadoFicha: "pronta", nome: "" };
  assert.equal(validacao.validarFicha(incompleta, atributos).pronta, false);
  assert.equal(
    validacao.reconciliarEstadoProntidao(incompleta, atributos).estadoFicha,
    "rascunho"
  );
});

test("itens da validação identificam a área que deve ser corrigida", () => {
  assert.equal(validacao.secaoDaMensagem("Identidade: escolha uma raça."), "identidade");
  assert.equal(validacao.secaoDaMensagem("PV máximo deve ser pelo menos 1."), "combate");
  assert.equal(validacao.secaoDaMensagem("Magia acima do círculo permitido."), "magias");
  assert.equal(validacao.secaoDaMensagem("Talento sem pré-requisito."), "habilidades");
  assert.equal(validacao.secaoDaMensagem("Item indicado não existe."), "inventario");
});

test("histórico ativo de PV e pools corrompidos são bloqueantes", () => {
  const valida = fichaUtils.normalizarFicha(fichaBase());
  const semOrigem = {
    ...valida,
    origemClassePvPorNivel: {},
  };
  assert.equal(
    validacao.validarFicha(semOrigem, atributos).erros.some((erro) =>
      erro.includes("classe de origem ausente")
    ),
    true
  );

  const poolCorrompido = {
    ...valida,
    dadosVidaPorClasse: {
      ...valida.dadosVidaPorClasse,
      bardo: { ...valida.dadosVidaPorClasse.bardo, dadoVida: 12 },
    },
  };
  assert.equal(
    validacao.validarFicha(poolCorrompido, atributos).erros.some((erro) =>
      erro.includes("pool deve usar d8")
    ),
    true
  );
});

test("migração preserva dados legados e reduz apenas valores inequivocamente inválidos", () => {
  const antiga = fichaUtils.normalizarFicha({ ...fichaBase(), versaoFicha: 1, pericias: { furtividade: true }, idiomas: ["comum", "silvestre"], status: { pvMax: 10, pvAtual: 50, pvTemp: -5 } });
  assert.equal(antiga.pericias.furtividade, true);
  assert.deepEqual(antiga.idiomas.includes("silvestre"), true);
  assert.equal(antiga.status.pvAtual, 10);
  assert.equal(antiga.status.pvTemp, 0);
});

test("proficiências iniciais de cada classe usam regras centralizadas e multiclasse não as replica", () => {
  for (const classeId of ["barbaro", "bardo", "bruxo", "clerigo", "druida", "feiticeiro", "guerreiro", "ladino", "mago", "monge", "paladino", "patrulheiro"]) {
    const ficha = criacao.reconciliarProficienciasCriacao(fichaBase({ classeId, escolhasCriacao: { periciasClasse: [] } }));
    assert.equal(ficha.salvaguardasProficientes.length, 2, classeId);
  }
  const guerreiro = criacao.reconciliarProficienciasCriacao(fichaBase({ classeId: "guerreiro", escolhasCriacao: { periciasClasse: ["atletismo", "historia"] } }));
  assert.equal(guerreiro.proficienciasArmas.includes("marciais"), true);
  assert.equal(guerreiro.proficienciasArmaduras.includes("pesadas"), true);
});

test("escolhas de criação exigem quantidade, lista válida e preservam manual ao trocar origem", () => {
  const pendencias = criacao.escolhasObrigatoriasCriacao(fichaBase({ escolhasCriacao: {} }));
  assert.equal(pendencias.some((item) => item.mensagem.includes("Perícias da classe")), true);
  const comManual = criacao.reconciliarProficienciasCriacao(fichaBase({ pericias: { furtividade: true }, escolhasCriacao: { periciasClasse: ["acrobacia", "atuacao", "arcanismo"], idiomasAntecedente: ["anao", "gnomico"] } }));
  const trocada = criacao.reconciliarProficienciasCriacao({ ...comManual, antecedenteId: "soldado", escolhasCriacao: { ...comManual.escolhasCriacao, idiomasAntecedente: [] } });
  assert.equal(trocada.pericias.furtividade, true);
});

test("raças e antecedentes concedem idiomas/ferramentas por origem", () => {
  const ficha = criacao.reconciliarProficienciasCriacao(fichaBase({ racaId: "meio-elfo", antecedenteId: "eremita", escolhasCriacao: { periciasClasse: ["acrobacia", "atuacao", "arcanismo"], periciasRaca: ["furtividade", "percepcao"], idiomasRaca: ["silvestre"], idiomasAntecedente: ["anao"] } }));
  assert.equal(ficha.idiomas.includes("elfico"), true);
  assert.equal(ficha.proficienciasFerramentas.includes("kit-ervanario"), true);
  assert.equal(ficha.origensProficiencias.pericias.furtividade.some((origem) => origem.startsWith("raca:")), true);
});

test("Anão e Monge exigem e registram suas escolhas de ferramenta", () => {
  const anaoSemEscolha = fichaBase({ racaId: "anao", escolhasCriacao: { periciasClasse: ["acrobacia", "atuacao", "arcanismo"], ferramentasClasse: ["alaude", "flauta", "tambor"], idiomasAntecedente: ["elfico", "gnomico"] } });
  assert.equal(criacao.escolhasObrigatoriasCriacao(anaoSemEscolha).some((item) => item.mensagem.includes("Ferramentas da raça")), true);
  const anao = criacao.reconciliarProficienciasCriacao({ ...anaoSemEscolha, escolhasCriacao: { ...anaoSemEscolha.escolhasCriacao, ferramentasRaca: ["ferramentas-ferreiro"] } });
  assert.equal(anao.proficienciasFerramentas.includes("ferramentas-ferreiro"), true);
  assert.equal(anao.origensProficiencias.ferramentas["ferramentas-ferreiro"].includes("raca:anao"), true);

  const monge = fichaBase({ classeId: "monge", escolhasCriacao: { periciasClasse: ["acrobacia", "furtividade"], ferramentasClasse: ["ferramentas-carpinteiro"], idiomasAntecedente: ["anao", "gnomico"] } });
  assert.equal(criacao.escolhasObrigatoriasCriacao(monge).some((item) => item.mensagem.includes("Ferramentas da classe")), false);
  assert.equal(criacao.reconciliarProficienciasCriacao(monge).proficienciasFerramentas.includes("ferramentas-carpinteiro"), true);
});

test("antecedentes aplicam ferramenta fixa e escolha do grupo correto", () => {
  const criminoso = criacao.reconciliarProficienciasCriacao(fichaBase({ antecedenteId: "criminoso", escolhasCriacao: { periciasClasse: ["acrobacia", "atuacao", "arcanismo"], ferramentasClasse: ["alaude", "flauta", "tambor"], ferramentasAntecedente: ["jogo-de-dados"] } }));
  assert.equal(criminoso.proficienciasFerramentas.includes("ferramentas-ladino"), true);
  assert.equal(criminoso.proficienciasFerramentas.includes("jogo-de-dados"), true);

  for (const antecedenteId of ["heroi-do-povo", "soldado"]) {
    const ficha = criacao.reconciliarProficienciasCriacao(fichaBase({ antecedenteId, escolhasCriacao: { periciasClasse: ["acrobacia", "atuacao", "arcanismo"], ferramentasClasse: ["alaude", "flauta", "tambor"], ferramentasAntecedente: [antecedenteId === "soldado" ? "baralho-cartas" : "ferramentas-pedreiro"] } }));
    assert.equal(ficha.proficienciasFerramentas.includes("veiculos-terrestres"), true, antecedenteId);
  }
});

test("proficiência automática repetida exige substituição sem perder a origem", () => {
  const escolhasCriacao = {
    periciasClasse: ["acrobacia", "intuicao", "intimidacao", "investigacao"],
    ferramentasAntecedente: ["jogo-de-dados"],
  };
  const repetida = fichaBase({ classeId: "ladino", antecedenteId: "criminoso", escolhasCriacao });
  assert.equal(criacao.escolhasObrigatoriasCriacao(repetida).some((item) => item.mensagem.includes("Ferramentas substitutas")), true);
  const resolvida = { ...repetida, escolhasCriacao: { ...escolhasCriacao, ferramentasSubstitutas: ["ferramentas-disfarce"] } };
  assert.equal(criacao.escolhasObrigatoriasCriacao(resolvida).some((item) => item.mensagem.includes("Ferramentas substitutas")), false);
  const reconciliada = criacao.reconciliarProficienciasCriacao(resolvida);
  assert.equal(reconciliada.origensProficiencias.ferramentas["ferramentas-ladino"].length, 2);
  assert.deepEqual(reconciliada.origensProficiencias.ferramentas["ferramentas-disfarce"], ["substituicao-criacao:duplicidade"]);
});

test("migração completa mapas de origem parciais sem apagar proficiências legadas", () => {
  const parcial = criacao.reconciliarProficienciasCriacao(fichaBase({
    pericias: { acrobacia: true, furtividade: true },
    idiomas: ["comum", "silvestre"],
    proficienciasFerramentas: ["ferramentas-disfarce"],
    origensProficiencias: { pericias: { acrobacia: ["classe-inicial:bardo"] } },
  }));
  assert.equal(parcial.pericias.furtividade, true);
  assert.equal(parcial.origensProficiencias.pericias.furtividade.includes("manual:legado"), true);
  assert.equal(parcial.origensProficiencias.idiomas.silvestre.includes("manual:legado"), true);
  assert.equal(parcial.origensProficiencias.ferramentas["ferramentas-disfarce"].includes("manual:legado"), true);
});

test("Segredos Mágicos: nível individual, limite, multiclasse e origem", () => {
  const bola = catalogo.MAGIAS.find((magia) => magia.id === "bola-de-fogo");
  const faisca = catalogo.MAGIAS.find((magia) => magia.id === "faisca");
  const bardo9 = fichaBase({ nivel: 9 });
  const bardo10 = fichaBase({ nivel: 10, classesSecundarias: [{ classeId: "mago", nivel: 10 }] });
  assert.equal(regras.limiteSegredosMagicos(bardo9, "bardo"), 0);
  assert.equal(regras.limiteSegredosMagicos(bardo10, "bardo"), 2);
  assert.equal(regras.magiaElegivelPorSegredo(bardo10, "bardo", bola), true);
  assert.equal(regras.magiaElegivelPorSegredo(bardo10, "bardo", faisca), true);
  const muitos = { ...bardo10, magias: [0, 1, 2].map((id) => ({ id: String(id), origemId: bola.id, nome: bola.nome, nivel: bola.nivel, classeId: "especial", origemEspecial: { tipo: "segredos-magicos", classeId: "bardo" } })) };
  assert.equal(validacao.validarFicha(muitos, atributos).erros.some((texto) => texto.includes("Segredos Mágicos")), true);
});

test("Segredos Mágicos adicionais não consomem o limite normal do Bardo", () => {
  const idsBardo = ["curar-ferimentos", "detectar-magia", "sono", "enfeiticar-pessoa", "identificar", "amizade-animal", "palavra-curativa", "fogo-das-fadas", "invisibilidade"];
  const normais = idsBardo.map((id, indice) => {
    const magia = catalogo.MAGIAS.find((item) => item.id === id);
    return { id: `b-${indice}`, origemId: id, nome: magia.nome, nivel: magia.nivel, classeId: "bardo" };
  });
  const segredos = ["bola-de-fogo", "revivificar"].map((id, indice) => {
    const magia = catalogo.MAGIAS.find((item) => item.id === id);
    return { id: `s-${indice}`, origemId: id, nome: magia.nome, nivel: magia.nivel, classeId: "especial", origemEspecial: { tipo: "segredos-magicos", classeId: "bardo" } };
  });
  const conhecimento6 = fichaBase({ nivel: 6, subclasseId: "colegio-conhecimento", magias: [...normais, ...segredos] });
  assert.equal(regras.limiteSegredosMagicosAdicionais(conhecimento6, "bardo"), 2);
  assert.equal(validacao.validarFicha(conhecimento6, atributos).avisos.some((texto) => texto.includes("magias conhecidas contam para o limite")), false);
});

test("origens de talento, item e regra da mesa são verificadas sem contar como classe", () => {
  const magia = catalogo.MAGIAS.find((item) => item.id === "escudo");
  const talento = fichaBase({ habilidades: [{ tipo: "talento", origemId: "iniciado-magia" }], magias: [{ id: "m", origemId: magia.id, nome: magia.nome, nivel: 1, classeId: "especial", origemEspecial: { tipo: "talento", fonteId: "iniciado-magia", classeLista: "mago" } }] });
  assert.equal(validacao.validarFicha(talento, atributos).pendencias.length, 0);
  const semItem = fichaBase({ magias: [{ id: "m", origemId: magia.id, nome: magia.nome, nivel: 1, classeId: "especial", origemEspecial: { tipo: "item", fonteId: "nao-existe" } }] });
  assert.equal(validacao.validarFicha(semItem, atributos).avisos.some((texto) => texto.includes("não existe mais no inventário")), true);
  assert.equal(validacao.validarFicha(semItem, atributos).pendencias.some((texto) => texto.includes("item que concede")), false);
  const semTalento = fichaBase({ magias: [{ id: "m", origemId: magia.id, nome: magia.nome, nivel: 1, classeId: "especial", origemEspecial: { tipo: "talento", fonteId: "iniciado-magia", classeLista: "mago" } }] });
  assert.equal(validacao.validarFicha(semTalento, atributos).avisos.some((texto) => texto.includes("talento que concede")), true);
  const semFonte = fichaBase({ magias: [{ id: "m", nome: "Efeito especial", nivel: 1, classeId: "especial", origemEspecial: { tipo: "manual" } }] });
  assert.equal(validacao.validarFicha(semFonte, atributos).pendencias.length > 0, true);
});

test("Iniciado em Magia exige uma lista única e respeita dois truques mais uma magia", () => {
  const ids = ["faisca", "maos-magicas", "escudo"];
  const magias = ids.map((id, indice) => {
    const magia = catalogo.MAGIAS.find((item) => item.id === id);
    return { id: `i-${indice}`, origemId: id, nome: magia.nome, nivel: magia.nivel, classeId: "especial", origemEspecial: { tipo: "talento", fonteId: "iniciado-magia", classeLista: "mago" } };
  });
  const ficha = fichaBase({ habilidades: [{ tipo: "talento", origemId: "iniciado-magia" }], magias });
  assert.equal(validacao.validarFicha(ficha, atributos).erros.some((texto) => texto.includes("Iniciado em Magia permite")), false);
  const excesso = { ...ficha, magias: [...magias, { ...magias[0], id: "i-3", origemId: "toque-chocante", nome: "Toque Chocante" }] };
  assert.equal(validacao.validarFicha(excesso, atributos).erros.some((texto) => texto.includes("Iniciado em Magia permite")), true);
});

test("troca de magia: classes elegíveis, especiais protegidas e histórico por nível", () => {
  const escudo = catalogo.MAGIAS.find((magia) => magia.id === "escudo");
  const bardo = fichaBase({ nivel: 2, magias: [{ id: "m", origemId: escudo.id, nome: escudo.nome, nivel: 1, classeId: "bardo" }] });
  assert.equal(regras.obterRegraTroca(bardo, "bardo", 2).quantidade, 1);
  assert.equal(regras.magiasElegiveisParaTroca(bardo, "bardo", 2).length, 1);
  const item = { ...bardo, magias: [{ id: "i", origemId: escudo.id, nome: escudo.nome, nivel: 1, classeId: "especial", origemEspecial: { tipo: "item", fonteId: "x" } }] };
  assert.equal(regras.magiasElegiveisParaTroca(item, "bardo", 2).length, 0);
  assert.equal(regras.obterRegraTroca(fichaBase({ classeId: "clerigo" }), "clerigo", 2), null);
});

test("troca de magia usa quantidade por nível e representa zero ou múltiplas trocas", () => {
  for (const classeId of ["bardo", "bruxo", "feiticeiro", "patrulheiro"]) {
    assert.equal(regrasDados.regraTrocaMagias(classeId, null, 4).quantidade, 1, classeId);
  }
  assert.equal(regrasDados.regraTrocaMagias("guerreiro", "cavaleiro-arcano", 4).quantidade, 1);
  assert.equal(regrasDados.regraTrocaMagias("ladino", "trapaceiro-arcano", 4).quantidade, 1);
  const fixture = {
    "classe-teste": {
      emTodoNivel: true,
      quantidade: 1,
      quantidadePorNivel: { 5: 2, 6: 0 },
      tipos: ["conhecida"],
    },
  };
  assert.equal(regrasDados.regraTrocaMagias("classe-teste", null, 4, fixture).quantidade, 1);
  assert.equal(regrasDados.regraTrocaMagias("classe-teste", null, 5, fixture).quantidade, 2);
  assert.equal(regrasDados.regraTrocaMagias("classe-teste", null, 6, fixture), null);
});

test("aplicação de múltiplas trocas preserva IDs de registro e origem de Segredos Mágicos", () => {
  const magias = [
    { id: "registro-1", origemId: "sono", nome: "Sono", nivel: 1, classeId: "bardo" },
    { id: "registro-2", origemId: "bola-de-fogo", nome: "Bola de Fogo", nivel: 3, classeId: "especial", origemEspecial: { tipo: "segredos-magicos", classeId: "bardo" } },
  ];
  const trocadas = regras.aplicarTrocasMagias(magias, [
    { removidaId: "registro-1", novaMagiaId: "invisibilidade" },
    { removidaId: "registro-2", novaMagiaId: "revivificar" },
  ], "bardo");
  assert.deepEqual(trocadas.map((magia) => magia.id), ["registro-1", "registro-2"]);
  assert.deepEqual(trocadas.map((magia) => magia.origemId), ["invisibilidade", "revivificar"]);
  assert.equal(trocadas[1].classeId, "especial");
  assert.equal(trocadas[1].origemEspecial.tipo, "segredos-magicos");
});

test("Segredos Mágicos aparecem entre as opções de troca do Bardo", () => {
  const bola = catalogo.MAGIAS.find((magia) => magia.id === "bola-de-fogo");
  const bardo = fichaBase({
    nivel: 10,
    magias: [{ id: "segredo", origemId: bola.id, nome: bola.nome, nivel: bola.nivel, classeId: "especial", origemEspecial: { tipo: "segredos-magicos", classeId: "bardo" } }],
  });
  assert.deepEqual(regras.magiasElegiveisParaTroca(bardo, "bardo", 11).map((magia) => magia.id), ["segredo"]);
});

test("catálogo mantém IDs únicos, listas coerentes e magias exigidas por subclasses", () => {
  assert.equal(new Set(catalogo.MAGIAS.map((magia) => magia.id)).size, catalogo.MAGIAS.length);
  const idsSubclasses = Object.values(excecoes.REGRAS_MAGIAS_SUBCLASSES).flatMap((regra) => [
    ...Object.values(regra.niveis ?? {}).flat(),
    ...Object.values(regra.concedidas ?? {}).flat(),
  ]);
  for (const id of idsSubclasses) assert.ok(catalogo.MAGIAS.some((magia) => magia.id === id), id);
});

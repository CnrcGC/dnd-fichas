// Regras de magia por subclasse. Os IDs referem-se exclusivamente a magias
// presentes no catálogo local; uma lista expandida só torna a magia elegível,
// enquanto uma magia sempre preparada é concedida automaticamente.

import { PAGINAS_SUBCLASSES } from "./subclasses";
import { MAGIAS } from "./magiasSistema";

const REGRAS_MAGIAS_SUBCLASSES_BASE = {
  "dominio-conhecimento": {
    classeId: "clerigo", tipo: "sempre-preparada",
    niveis: { 1: ["comando", "identificar"], 3: ["augurio", "sugestao"], 5: ["indetectavel", "falar-com-os-mortos"], 7: ["olho-arcano", "confusao"], 9: ["lendas-e-historias", "videncia"] },
  },
  "dominio-enganacao": {
    classeId: "clerigo", tipo: "sempre-preparada",
    niveis: { 1: ["enfeiticar-pessoa", "disfarcar-se"], 3: ["imagem-espelhada", "passos-sem-pegadas"], 5: ["piscar", "dissipar-magia"], 7: ["porta-dimensional", "metamorfose"], 9: ["dominar-pessoa", "modificar-memoria"] },
  },
  "dominio-guerra": {
    classeId: "clerigo", tipo: "sempre-preparada",
    niveis: { 1: ["favor-divino", "escudo-da-fe"], 3: ["arma-magica", "arma-espiritual"], 5: ["manto-do-cruzado", "espiritos-guardioes"], 7: ["liberdade-de-movimento", "pele-de-pedra"], 9: ["coluna-de-chamas", "imobilizar-monstro"] },
  },
  "dominio-vida": {
    classeId: "clerigo",
    tipo: "sempre-preparada",
    niveis: { 1: ["bencao", "curar-ferimentos"], 3: ["restauracao-menor", "arma-espiritual"], 5: ["sinal-esperanca", "revivificar"], 7: ["protecao-contra-morte", "guardiao-da-fe"], 9: ["cura-em-massa", "reviver-os-mortos"] },
  },
  "dominio-luz": {
    classeId: "clerigo",
    tipo: "sempre-preparada",
    concedidas: { 1: ["luz"] },
    niveis: { 1: ["maos-flamejantes", "fogo-das-fadas"], 3: ["esfera-flamejante", "raio-ardente"], 5: ["luz-do-dia", "bola-de-fogo"], 7: ["guardiao-da-fe", "parede-de-fogo"], 9: ["coluna-de-chamas", "videncia"] },
  },
  "dominio-natureza": {
    classeId: "clerigo", tipo: "sempre-preparada",
    niveis: { 1: ["amizade-animal", "falar-com-animais"], 3: ["pele-de-arvore", "crescer-espinhos"], 5: ["ampliar-plantas", "muralha-de-vento"], 7: ["dominar-besta", "vinha-esmagadora"], 9: ["praga-de-insetos", "caminhar-em-arvores"] },
  },
  "dominio-tempestade": {
    classeId: "clerigo", tipo: "sempre-preparada",
    niveis: { 1: ["nevoa-obscurecente", "onda-trovejante"], 3: ["lufada-de-vento", "despedaçar"], 5: ["convocar-relampagos", "nevasca"], 7: ["controlar-agua", "tempestade-de-gelo"], 9: ["onda-destrutiva", "praga-de-insetos"] },
  },
  "patrono-arquifada": {
    classeId: "bruxo",
    tipo: "lista-expandida",
    niveis: { 1: ["fogo-das-fadas", "sono"], 3: ["acalmar-emocoes", "forca-fantasmagorica"], 5: ["piscar", "ampliar-plantas"], 7: ["dominar-besta", "invisibilidade-maior"], 9: ["dominar-pessoa", "similaridade"] },
  },
  "patrono-corruptor": {
    classeId: "bruxo",
    tipo: "lista-expandida",
    niveis: { 1: ["maos-flamejantes", "comando"], 3: ["cegueira-surdez", "raio-ardente"], 5: ["bola-de-fogo", "nuvem-fetida"], 7: ["escudo-de-fogo", "parede-de-fogo"], 9: ["coluna-de-chamas", "consagrar"] },
  },
  "patrono-grande-antigo": {
    classeId: "bruxo", tipo: "lista-expandida",
    niveis: { 1: ["sussurros-dissonantes", "risada-horrivel-de-tasha"], 3: ["detectar-pensamentos", "forca-fantasmagorica"], 5: ["clarividencia", "enviar-mensagem"], 7: ["dominar-besta", "tentaculos-negros-de-evard"], 9: ["dominar-pessoa", "telecinesia"] },
  },
  "circulo-terra": {
    classeId: "druida", tipo: "sempre-preparada", variantes: {
      artico: { 3: ["imobilizar-pessoa", "crescer-espinhos"], 5: ["nevasca", "lentidao"], 7: ["movimentacao-livre", "tempestade-de-gelo"], 9: ["comunhao-com-a-natureza", "cone-de-frio"] },
      costa: { 3: ["imagem-espelhada", "passo-nebuloso"], 5: ["respirar-na-agua", "caminhar-na-agua"], 7: ["controlar-agua", "movimentacao-livre"], 9: ["conjurar-elemental", "videncia"] },
      deserto: { 3: ["nublar", "silencio"], 5: ["criar-alimentos", "protecao-contra-energia"], 7: ["malogro", "terreno-alucinatorio"], 9: ["praga-de-insetos", "muralha-de-pedra"] },
      floresta: { 3: ["patas-de-aranha", "pele-de-arvore"], 5: ["convocar-relampagos", "ampliar-plantas"], 7: ["adivinhacao", "movimentacao-livre"], 9: ["comunhao-com-a-natureza", "passos-de-arvore"] },
      montanha: { 3: ["patas-de-aranha", "crescer-espinhos"], 5: ["relampago", "mesclar-se-as-rochas"], 7: ["moldar-rochas", "pele-de-pedra"], 9: ["criar-passagem", "muralha-de-pedra"] },
      pantano: { 3: ["escuridao", "flecha-acida-de-melf"], 5: ["caminhar-na-agua", "nuvem-fetida"], 7: ["movimentacao-livre", "localizar-criatura"], 9: ["praga-de-insetos", "videncia"] },
      planicie: { 3: ["invisibilidade", "passos-sem-pegadas"], 5: ["luz-do-dia", "velocidade"], 7: ["adivinhacao", "movimentacao-livre"], 9: ["sonho", "praga-de-insetos"] },
      subterraneo: { 3: ["patas-de-aranha", "teia"], 5: ["forma-gasosa", "nuvem-fetida"], 7: ["invisibilidade-maior", "moldar-rochas"], 9: ["nevoa-mortal", "praga-de-insetos"] },
    },
  },
  "juramento-devocao": {
    classeId: "paladino",
    tipo: "sempre-preparada",
    niveis: { 3: ["protecao-contra-bem-e-mal", "santuario"], 5: ["restauracao-menor", "zona-da-verdade"], 9: ["sinal-esperanca", "dissipar-magia"], 13: ["liberdade-de-movimento", "guardiao-da-fe"], 17: ["comunhao", "coluna-de-chamas"] },
  },
  "juramento-vinganca": {
    classeId: "paladino",
    tipo: "sempre-preparada",
    niveis: { 3: ["perdicao", "marca-do-cacador"], 5: ["imobilizar-pessoa", "passo-nebuloso"], 9: ["velocidade", "protecao-contra-energia"], 13: ["banimento", "porta-dimensional"], 17: ["imobilizar-monstro", "videncia"] },
  },
  "juramento-ancioes": {
    classeId: "paladino", tipo: "sempre-preparada",
    niveis: { 3: ["ataque-constritor", "falar-com-animais"], 5: ["raio-lunar", "passo-nebuloso"], 9: ["ampliar-plantas", "protecao-contra-energia"], 13: ["tempestade-de-gelo", "pele-de-pedra"], 17: ["comunhao-com-a-natureza", "passos-de-arvore"] },
  },
  "rastreador-subterraneo": {
    classeId: "patrulheiro", tipo: "concedida",
    concedidas: { 3: ["disfarcar-se"], 5: ["truque-de-corda"], 9: ["glifo-de-vigilancia"], 13: ["invisibilidade-maior"], 17: ["similaridade"] },
  },
  "trapaceiro-arcano": {
    classeId: "ladino",
    tipo: "concedida",
    concedidas: { 3: ["maos-magicas"] },
  },
};

const IDS_MAGIAS_CATALOGO = new Set(MAGIAS.map((magia) => magia.id));

function separarTabelaPorCatalogo(tabela = {}) {
  const ativas = {};
  const pendentes = {};
  for (const [nivel, ids] of Object.entries(tabela)) {
    const disponiveis = ids.filter((id) => IDS_MAGIAS_CATALOGO.has(id));
    const ausentes = ids.filter((id) => !IDS_MAGIAS_CATALOGO.has(id));
    if (disponiveis.length) ativas[nivel] = disponiveis;
    if (ausentes.length) pendentes[nivel] = ausentes;
  }
  return { ativas, pendentes };
}

export const REGRAS_MAGIAS_SUBCLASSES = Object.fromEntries(
  Object.entries(REGRAS_MAGIAS_SUBCLASSES_BASE).map(([subclasseId, regra]) => {
    const [printedPage, endPrintedPage] = PAGINAS_SUBCLASSES[subclasseId];
    const niveis = separarTabelaPorCatalogo(regra.niveis);
    const concedidas = separarTabelaPorCatalogo(regra.concedidas);
    const variantes = regra.variantes
      ? Object.fromEntries(Object.entries(regra.variantes).map(([id, tabela]) => {
          const separada = separarTabelaPorCatalogo(tabela);
          return [id, separada.ativas];
        }))
      : undefined;
    const variantesPendentesCatalogo = regra.variantes
      ? Object.fromEntries(Object.entries(regra.variantes).map(([id, tabela]) => {
          const separada = separarTabelaPorCatalogo(tabela);
          return [id, separada.pendentes];
        }).filter(([, tabela]) => Object.keys(tabela).length))
      : undefined;
    return [subclasseId, {
      ...regra,
      niveis: niveis.ativas,
      concedidas: concedidas.ativas,
      ...(Object.keys(niveis.pendentes).length ? { niveisPendentesCatalogo: niveis.pendentes } : {}),
      ...(Object.keys(concedidas.pendentes).length ? { concedidasPendentesCatalogo: concedidas.pendentes } : {}),
      ...(variantes ? { variantes } : {}),
      ...(variantesPendentesCatalogo && Object.keys(variantesPendentesCatalogo).length ? { variantesPendentesCatalogo } : {}),
      catalogVersion: 1,
      rulesProfile: "dnd5e-books-2014",
      verificationStatus: "verified",
      automationLevel: "assisted",
      sourceRefs: [{ ruleId: `R-SUBCLASS-SPELLS-${subclasseId.toUpperCase()}`, bookId: "LJ", edition: "dnd5e-books-2014", printedPage, endPrintedPage, section: "Magias de subclasse" }],
    }];
  })
);

export function obterClasseDaFicha(ficha, classeId) {
  if (ficha.classeId === classeId) {
    return { classeId, nivel: ficha.nivel ?? 1, subclasseId: ficha.subclasseId, indice: null };
  }
  const indice = (ficha.classesSecundarias ?? []).findIndex(
    (classe) => classe.classeId === classeId
  );
  if (indice < 0) return null;
  const classe = ficha.classesSecundarias[indice];
  return { ...classe, indice };
}

export function obterRegraMagiaSubclasse(subclasseId, ficha = null) {
  const regra = REGRAS_MAGIAS_SUBCLASSES[subclasseId] ?? null;
  if (!regra?.variantes || !ficha) return regra;
  const variante = ficha.escolhasSubclasse?.[subclasseId]?.["circulo-terreno"]?.[0];
  return { ...regra, niveis: regra.variantes[variante] ?? {} };
}

export function magiasDaRegraNoNivel(regra, nivel) {
  if (!regra) return [];
  return Object.entries(regra.niveis ?? {}).flatMap(([nivelNecessario, ids]) =>
    Number(nivel) >= Number(nivelNecessario) ? ids : []
  );
}

function magiasConcedidasNoNivel(regra, nivel) {
  return Object.entries(regra?.concedidas ?? {}).flatMap(([nivelNecessario, ids]) =>
    Number(nivel) >= Number(nivelNecessario) ? ids : []
  );
}

export function obterExcecaoMagia(ficha, magiaId, classeId) {
  const classe = obterClasseDaFicha(ficha, classeId);
  const regra = obterRegraMagiaSubclasse(classe?.subclasseId, ficha);
  if (!classe || !regra || regra.classeId !== classeId) return null;
  const concedida = magiasConcedidasNoNivel(regra, classe.nivel).includes(magiaId);
  if (concedida) return { tipo: "concedida", subclasseId: classe.subclasseId };
  return magiasDaRegraNoNivel(regra, classe.nivel).includes(magiaId)
    ? { tipo: regra.tipo, subclasseId: classe.subclasseId }
    : null;
}

export function obterMagiasSemprePreparadas(ficha) {
  const classes = [
    { classeId: ficha.classeId, nivel: ficha.nivel, subclasseId: ficha.subclasseId },
    ...(ficha.classesSecundarias ?? []),
  ];
  return classes.flatMap((classe) => {
    const regra = obterRegraMagiaSubclasse(classe.subclasseId, ficha);
    if (!regra || regra.tipo !== "sempre-preparada") return [];
    return magiasDaRegraNoNivel(regra, classe.nivel).map((magiaId) => ({
      magiaId,
      classeId: classe.classeId,
      subclasseId: classe.subclasseId,
      tipo: regra.tipo,
    }));
  });
}

export function obterMagiasConcedidas(ficha) {
  const classes = [
    { classeId: ficha.classeId, nivel: ficha.nivel, subclasseId: ficha.subclasseId },
    ...(ficha.classesSecundarias ?? []),
  ];
  return classes.flatMap((classe) => {
    const regra = obterRegraMagiaSubclasse(classe.subclasseId, ficha);
    if (!regra?.concedidas) return [];
    const ids = magiasConcedidasNoNivel(regra, classe.nivel);
    return ids.map((magiaId) => ({
      magiaId,
      classeId: classe.classeId,
      subclasseId: classe.subclasseId,
      tipo: "concedida",
    }));
  });
}

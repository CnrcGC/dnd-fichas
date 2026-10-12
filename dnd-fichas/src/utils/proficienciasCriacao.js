import { CLASSES, obterClasse } from "../data/classes";
import { obterRaca } from "../data/racas";
import { obterAntecedente } from "../data/antecedentes";
import { PERICIAS } from "../data/pericias";
import { IDIOMAS } from "../data/idiomas";
import {
  FERRAMENTAS,
  FERRAMENTAS_ARTESAO_IDS,
  INSTRUMENTOS_MUSICA_IDS,
  JOGOS_IDS,
} from "../data/equipamentos";

// Esta camada é a única fonte das concessões automáticas da criação. O campo
// `origensProficiencias` é aditivo: fichas antigas continuam legíveis e tudo
// que não pode ser atribuído com segurança permanece manual.
const ORIGENS_AUTOMATICAS = /^(classe-inicial|raca|antecedente|substituicao-criacao):/;

export function opcoesPericias(regra) {
  if (!regra) return [];
  return regra.opcoes === "todas"
    ? PERICIAS.map((pericia) => pericia.chave)
    : regra.opcoes ?? [];
}

export function opcoesFerramentas(regra) {
  if (!regra) return [];
  if (regra.opcoes) return regra.opcoes;
  if (regra.grupo === "artesao") return FERRAMENTAS_ARTESAO_IDS;
  if (regra.grupo === "jogos") return JOGOS_IDS;
  if (regra.grupo === "artesao-ou-instrumento") {
    return [...FERRAMENTAS_ARTESAO_IDS, ...INSTRUMENTOS_MUSICA_IDS];
  }
  return [];
}

export function quantidadeSubstituicoesFerramentas(classe, raca, antecedente) {
  const contagem = new Map();
  const fontes = [
    classe?.proficienciasIniciais?.ferramentas ?? [],
    raca?.ferramentasFixas ?? [],
    antecedente?.ferramentasFixas ?? [],
  ];
  for (const lista of fontes) {
    for (const id of new Set(lista)) contagem.set(id, (contagem.get(id) ?? 0) + 1);
  }
  return [...contagem.values()].reduce((total, quantidade) => total + Math.max(0, quantidade - 1), 0);
}

export function escolhasObrigatoriasCriacao(ficha) {
  const escolhas = ficha.escolhasCriacao ?? {};
  const pendencias = [];
  const classe = obterClasse(ficha.classeId);
  const raca = obterRaca(ficha.racaId, ficha.subracaId);
  const antecedente = obterAntecedente(ficha.antecedenteId);
  if (raca?.subracas && !raca.subracas.some((item) => item.id === ficha.subracaId)) {
    pendencias.push({ secao: "identidade", mensagem: "Sub-raça: escolha uma opção para Anão." });
  }
  const verificar = (titulo, regra, valores) => {
    const quantidade = Number(regra?.quantidade ?? regra ?? 0);
    if (quantidade && [...new Set((valores ?? []).filter(Boolean))].length !== quantidade) {
      pendencias.push({ secao: "pericias", mensagem: `${titulo}: escolha ${quantidade} opção${quantidade === 1 ? "" : "ões"}.` });
    }
  };
  verificar("Perícias da classe", classe?.proficienciasIniciais?.pericias, escolhas.periciasClasse);
  verificar("Ferramentas da classe", classe?.proficienciasIniciais?.ferramentasEscolha, escolhas.ferramentasClasse);
  verificar("Perícias raciais", raca?.periciasEscolha, escolhas.periciasRaca);
  verificar("Idiomas raciais", raca?.idiomasEscolha, escolhas.idiomasRaca);
  verificar("Ferramentas da raça", raca?.ferramentasEscolha, escolhas.ferramentasRaca);
  verificar("Idiomas do antecedente", antecedente?.idiomasEscolha, escolhas.idiomasAntecedente);
  verificar("Ferramentas do antecedente", antecedente?.ferramentasEscolha, escolhas.ferramentasAntecedente);
  const quantidadeSubstituicoes = quantidadeSubstituicoesFerramentas(classe, raca, antecedente);
  verificar("Ferramentas substitutas", quantidadeSubstituicoes, escolhas.ferramentasSubstitutas);
  const validarLista = (titulo, valores, opcoes, bloqueadas = []) => {
    const vistos = new Set();
    for (const valor of valores ?? []) {
      if (!valor) continue;
      if (vistos.has(valor)) pendencias.push({ secao: "pericias", mensagem: `${titulo}: não repita a mesma escolha.` });
      vistos.add(valor);
      if (!opcoes.includes(valor)) pendencias.push({ secao: "pericias", mensagem: `${titulo}: opção não permitida.` });
      if (bloqueadas.includes(valor)) pendencias.push({ secao: "pericias", mensagem: `${titulo}: escolha já concedida por outra origem; escolha uma substituta.` });
    }
  };
  const periciasJaManuais = Object.entries(ficha.origensProficiencias?.pericias ?? {}).filter(([, origens]) => (origens ?? []).some((origem) => origem.startsWith("manual:") || origem.startsWith("multiclasse:"))).map(([id]) => id);
  const ferramentasJaManuais = Object.entries(ficha.origensProficiencias?.ferramentas ?? {}).filter(([, origens]) => (origens ?? []).some((origem) => origem.startsWith("manual:") || origem.startsWith("multiclasse:"))).map(([id]) => id);
  validarLista("Perícias da classe", escolhas.periciasClasse, opcoesPericias(classe?.proficienciasIniciais?.pericias), [...(raca?.periciasConcedidas ?? []), ...(raca?.periciasEscolha ? escolhas.periciasRaca ?? [] : []), ...(antecedente?.periciasConcedidas ?? []), ...periciasJaManuais]);
  validarLista("Perícias raciais", escolhas.periciasRaca, opcoesPericias(raca?.periciasEscolha), antecedente?.periciasConcedidas ?? []);
  const ferramentasClasseFixas = classe?.proficienciasIniciais?.ferramentas ?? [];
  const ferramentasRacaFixas = raca?.ferramentasFixas ?? [];
  const ferramentasAntecedenteFixas = antecedente?.ferramentasFixas ?? [];
  validarLista("Ferramentas da classe", escolhas.ferramentasClasse, opcoesFerramentas(classe?.proficienciasIniciais?.ferramentasEscolha), [...ferramentasClasseFixas, ...ferramentasRacaFixas, ...ferramentasAntecedenteFixas, ...(escolhas.ferramentasRaca ?? []), ...(escolhas.ferramentasAntecedente ?? []), ...ferramentasJaManuais]);
  validarLista("Idiomas raciais", escolhas.idiomasRaca, IDIOMAS.map((item) => item.id), raca?.idiomasFixos ?? []);
  validarLista("Idiomas do antecedente", escolhas.idiomasAntecedente, IDIOMAS.map((item) => item.id), [...(raca?.idiomasFixos ?? []), ...(escolhas.idiomasRaca ?? [])]);
  validarLista("Ferramentas da raça", escolhas.ferramentasRaca, opcoesFerramentas(raca?.ferramentasEscolha), [...ferramentasClasseFixas, ...ferramentasRacaFixas, ...ferramentasAntecedenteFixas, ...(escolhas.ferramentasClasse ?? []), ...(escolhas.ferramentasAntecedente ?? []), ...ferramentasJaManuais]);
  validarLista("Ferramentas do antecedente", escolhas.ferramentasAntecedente, opcoesFerramentas(antecedente?.ferramentasEscolha), [...ferramentasClasseFixas, ...ferramentasRacaFixas, ...ferramentasAntecedenteFixas, ...(escolhas.ferramentasClasse ?? []), ...(escolhas.ferramentasRaca ?? []), ...ferramentasJaManuais]);
  validarLista("Ferramentas substitutas", escolhas.ferramentasSubstitutas, FERRAMENTAS.map((item) => item.id), [...new Set([...ferramentasClasseFixas, ...ferramentasRacaFixas, ...ferramentasAntecedenteFixas, ...(escolhas.ferramentasClasse ?? []), ...(escolhas.ferramentasRaca ?? []), ...(escolhas.ferramentasAntecedente ?? []), ...ferramentasJaManuais])]);
  return pendencias;
}

function adicionarOrigem(mapa, tipo, id, origem) {
  if (!id) return;
  mapa[tipo] ??= {};
  mapa[tipo][id] ??= [];
  if (!mapa[tipo][id].includes(origem)) mapa[tipo][id].push(origem);
}

function removerOrigensAutomaticas(mapa) {
  for (const tipo of Object.keys(mapa)) {
    for (const id of Object.keys(mapa[tipo] ?? {})) {
      mapa[tipo][id] = (mapa[tipo][id] ?? []).filter((origem) => !ORIGENS_AUTOMATICAS.test(origem));
      if (!mapa[tipo][id].length) delete mapa[tipo][id];
    }
  }
}

function criarOrigensLegadas(ficha) {
  const origens = structuredClone(ficha.origensProficiencias ?? {});
  // Uma ficha que ainda não tem origem não perde nada: o que já existia é
  // marcado como manual em vez de ser atribuído retroativamente. O mesmo vale
  // para mapas de origem parciais criados por versões anteriores.
  const semOrigem = (tipo, id) => !(origens[tipo]?.[id]?.length);
  const antecedentesLegados = new Set(ficha.periciasDoAntecedente ?? []);
  for (const pericia of Object.keys(ficha.pericias ?? {})) {
    if (ficha.pericias?.[pericia] && !antecedentesLegados.has(pericia) && semOrigem("pericias", pericia)) adicionarOrigem(origens, "pericias", pericia, "manual:legado");
  }
  for (const idioma of ficha.idiomas ?? []) if (semOrigem("idiomas", idioma)) adicionarOrigem(origens, "idiomas", idioma, "manual:legado");
  for (const ferramenta of ficha.proficienciasFerramentas ?? []) if (semOrigem("ferramentas", ferramenta)) adicionarOrigem(origens, "ferramentas", ferramenta, "manual:legado");
  for (const arma of ficha.proficienciasArmas ?? []) if (semOrigem("armas", arma)) adicionarOrigem(origens, "armas", arma, "manual:legado");
  for (const armadura of ficha.proficienciasArmaduras ?? []) if (semOrigem("armaduras", armadura)) adicionarOrigem(origens, "armaduras", armadura, "manual:legado");
  if (ficha.proficienciasEscudos && semOrigem("escudos", "escudos")) adicionarOrigem(origens, "escudos", "escudos", "manual:legado");
  return origens;
}

function concederLista(origens, tipo, lista, origem) {
  for (const id of lista ?? []) adicionarOrigem(origens, tipo, id, origem);
}

export function reconciliarProficienciasCriacao(ficha) {
  if (!ficha || typeof ficha !== "object") return ficha;
  const origens = criarOrigensLegadas(ficha);
  removerOrigensAutomaticas(origens);
  const escolhas = ficha.escolhasCriacao ?? {};
  const classe = obterClasse(ficha.classeId);
  const raca = obterRaca(ficha.racaId, ficha.subracaId);
  const antecedente = obterAntecedente(ficha.antecedenteId);

  if (classe?.proficienciasIniciais) {
    const regra = classe.proficienciasIniciais;
    concederLista(origens, "salvaguardas", classe.salvaguardasProficientes, `classe-inicial:${classe.id}`);
    concederLista(origens, "armas", regra.armas, `classe-inicial:${classe.id}`);
    concederLista(origens, "armaduras", regra.armaduras, `classe-inicial:${classe.id}`);
    concederLista(origens, "ferramentas", regra.ferramentas, `classe-inicial:${classe.id}`);
    concederLista(origens, "ferramentas", escolhas.ferramentasClasse, `classe-inicial:${classe.id}`);
    if (regra.escudos) adicionarOrigem(origens, "escudos", "escudos", `classe-inicial:${classe.id}`);
    concederLista(origens, "pericias", escolhas.periciasClasse, `classe-inicial:${classe.id}`);
  }
  if (raca) {
    concederLista(origens, "armaduras", raca.armaduras, `raca:${raca.id}`);
    concederLista(origens, "idiomas", raca.idiomasFixos, `raca:${raca.id}`);
    concederLista(origens, "idiomas", escolhas.idiomasRaca, `raca:${raca.id}`);
    concederLista(origens, "pericias", raca.periciasConcedidas, `raca:${raca.id}`);
    concederLista(origens, "pericias", escolhas.periciasRaca, `raca:${raca.id}`);
    concederLista(origens, "ferramentas", raca.ferramentasFixas, `raca:${raca.id}`);
    concederLista(origens, "ferramentas", escolhas.ferramentasRaca, `raca:${raca.id}`);
  }
  concederLista(origens, "ferramentas", escolhas.ferramentasSubstitutas, "substituicao-criacao:duplicidade");
  if (antecedente) {
    concederLista(origens, "pericias", antecedente.periciasConcedidas, `antecedente:${antecedente.id}`);
    concederLista(origens, "idiomas", escolhas.idiomasAntecedente, `antecedente:${antecedente.id}`);
    concederLista(origens, "ferramentas", antecedente.ferramentasFixas, `antecedente:${antecedente.id}`);
    concederLista(origens, "ferramentas", escolhas.ferramentasAntecedente, `antecedente:${antecedente.id}`);
  }

  const ids = (tipo) => Object.keys(origens[tipo] ?? {}).filter((id) => (origens[tipo][id] ?? []).length);
  const pericias = { ...(ficha.pericias ?? {}) };
  for (const pericia of PERICIAS.map((item) => item.chave)) pericias[pericia] = ids("pericias").includes(pericia);
  return {
    ...ficha,
    escolhasCriacao: escolhas,
    origensProficiencias: origens,
    pericias,
    idiomas: ids("idiomas"),
    proficienciasFerramentas: ids("ferramentas"),
    proficienciasArmas: ids("armas"),
    proficienciasArmaduras: ids("armaduras"),
    proficienciasEscudos: ids("escudos").includes("escudos"),
    salvaguardasProficientes: ids("salvaguardas"),
  };
}

export function atualizarEscolhaCriacao(ficha, chave, valores) {
  return reconciliarProficienciasCriacao({
    ...ficha,
    escolhasCriacao: { ...(ficha.escolhasCriacao ?? {}), [chave]: [...new Set(valores.filter(Boolean))] },
  });
}

export function classeInicialValida(classeId) {
  return Boolean(CLASSES.some((classe) => classe.id === classeId));
}

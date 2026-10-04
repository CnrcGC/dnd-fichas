export function criarRecursoVazio() {
  return {
    id: crypto.randomUUID(),
    nome: "",
    usosMax: 1,
    usosGastos: 0,
    restauraEm: "longo", // "curto" | "longo"
  };
}

function numeroSeguro(valor, padrao = 0) {
  return Number.isFinite(Number(valor)) ? Number(valor) : padrao;
}

function arredondar(valor, modo) {
  if (modo === "cima") return Math.ceil(valor);
  if (modo === "baixo") return Math.floor(valor);
  return Math.round(valor);
}

// O formato novo usa uma fórmula composta, mas os campos antigos continuam
// aceitos para que os recursos já salvos e catalogados não mudem de regra.
// formulaMaximo: {
//   base, porNivel, divisorNivel,
//   atributo: { chave, usa: "modificador" | "valor", multiplicador },
//   bonusProficiencia, minimo, maximo, arredondamento,
//   faixas: [[nivel, valor], ...]
// }
export function resolverUsosMax(definicao, contexto = {}) {
  const formula = definicao?.formulaMaximo;
  if (formula) {
    if (Array.isArray(formula.faixas)) {
      const valorFaixa = [...formula.faixas]
        .filter(([nivel]) => numeroSeguro(contexto.nivel) >= numeroSeguro(nivel))
        .at(-1)?.[1];
      if (valorFaixa !== undefined) return Math.max(0, numeroSeguro(valorFaixa));
    }

    const divisorNivel = Math.max(1, numeroSeguro(formula.divisorNivel, 1));
    let total = numeroSeguro(formula.base);
    total += (numeroSeguro(contexto.nivel) / divisorNivel) * numeroSeguro(formula.porNivel);
    total += numeroSeguro(contexto.bonusProficiencia) * numeroSeguro(formula.bonusProficiencia);

    if (formula.atributo?.chave) {
      const conjunto = formula.atributo.usa === "valor"
        ? contexto.atributos
        : contexto.modificadores;
      total += numeroSeguro(conjunto?.[formula.atributo.chave]) * numeroSeguro(
        formula.atributo.multiplicador,
        1
      );
    }

    total = arredondar(total, formula.arredondamento);
    total = Math.max(numeroSeguro(formula.minimo), total);
    if (formula.maximo !== undefined) total = Math.min(numeroSeguro(formula.maximo), total);
    return Math.max(0, total);
  }

  if (definicao?.tipoUsosMax === "fixo") return Math.max(0, numeroSeguro(definicao.valorFixo));
  if (definicao?.tipoUsosMax === "porNivel") return Math.max(1, numeroSeguro(contexto.nivel, 1));
  if (definicao?.tipoUsosMax === "modCarisma") {
    return Math.max(1, numeroSeguro(contexto.modificadores?.carisma ?? contexto.modCarisma));
  }
  if (definicao?.tipoUsosMax === "modSabedoria") {
    return Math.max(1, numeroSeguro(contexto.modificadores?.sabedoria ?? contexto.modSabedoria));
  }
  if (definicao?.tipoUsosMax === "faixasNivel") {
    return Math.max(0, [...(definicao.faixas ?? [])]
      .filter(([nivel]) => numeroSeguro(contexto.nivel) >= numeroSeguro(nivel))
      .at(-1)?.[1] ?? 1);
  }
  return 1;
}

function origemDaDefinicao(definicao) {
  if (definicao.origem) return definicao.origem;
  if (definicao.subclasseId) {
    return {
      tipo: "subclasse",
      classeId: definicao.classeId,
      subclasseId: definicao.subclasseId,
    };
  }
  if (definicao.classeId) return { tipo: "classe", classeId: definicao.classeId };
  return { tipo: "geral" };
}

function valorPorNivel(faixas, nivel, padrao) {
  return [...(faixas ?? [])]
    .filter(([nivelMinimo]) => numeroSeguro(nivel) >= numeroSeguro(nivelMinimo))
    .at(-1)?.[1] ?? padrao;
}

function nomeDoRecurso(definicao, contexto) {
  return valorPorNivel(definicao.nomePorNivel, contexto.nivel, definicao.nome);
}

function restauracaoDoRecurso(definicao, contexto, padrao) {
  return valorPorNivel(definicao.restauraEmPorNivel, contexto.nivel, definicao.restauraEm ?? padrao);
}

function classesDaFicha(ficha) {
  return [
    { classeId: ficha.classeId, subclasseId: ficha.subclasseId, nivel: ficha.nivel ?? 1 },
    ...(ficha.classesSecundarias ?? []),
  ].filter((classe) => classe.classeId);
}

function itemCorrespondente(ficha, origem) {
  return (ficha.inventario ?? []).find((item) => {
    const corresponde = item.itemMagicoId === origem.itemId || item.origemId === origem.itemId;
    if (!corresponde) return false;
    if (origem.requerEquipado && !item.equipado) return false;
    if (origem.requerSintonizado && !item.sintonizado) return false;
    return true;
  });
}

export function contextoDoRecurso(definicao, ficha, contexto = {}) {
  const origem = origemDaDefinicao(definicao);
  const classe = classesDaFicha(ficha).find((item) =>
    item.classeId === origem.classeId &&
    (!origem.subclasseId || item.subclasseId === origem.subclasseId)
  );
  return {
    ...contexto,
    nivel: numeroSeguro(classe?.nivel, contexto.nivelTotal ?? ficha.nivel ?? 1),
    nivelTotal: numeroSeguro(contexto.nivelTotal, ficha.nivel ?? 1),
  };
}

export function recursoDisponivel(definicao, ficha) {
  const origem = origemDaDefinicao(definicao);
  if (origem.tipo === "geral") return true;
  if (origem.tipo === "talento") {
    return (ficha.habilidades ?? []).some(
      (habilidade) => habilidade.tipo === "talento" && habilidade.origemId === origem.talentoId
    );
  }
  if (origem.tipo === "item") return Boolean(itemCorrespondente(ficha, origem));

  const classe = classesDaFicha(ficha).find((item) =>
    item.classeId === origem.classeId &&
    (origem.tipo !== "subclasse" || item.subclasseId === origem.subclasseId)
  );
  return Boolean(classe && numeroSeguro(classe.nivel) >= numeroSeguro(definicao.nivelMinimo, 1));
}

export function listarSugestoesRecursos(definicoes, ficha, contexto = {}) {
  const cadastrados = new Set(
    (ficha.recursos ?? []).map((recurso) => recurso.origemId).filter(Boolean)
  );
  return (definicoes ?? [])
    .filter((definicao) => recursoDisponivel(definicao, ficha))
    .filter((definicao) => !cadastrados.has(definicao.id))
    .map((definicao) => ({
      ...definicao,
      usosMaxSugerido: resolverUsosMax(
        definicao,
        contextoDoRecurso(definicao, ficha, contexto)
      ),
    }));
}

export function criarRecursoDoCatalogo(definicao, ficha, contexto = {}, criarId = () => crypto.randomUUID()) {
  const origem = origemDaDefinicao(definicao);
  const contextoRecurso = contextoDoRecurso(definicao, ficha, contexto);
  return {
    id: criarId(),
    nome: nomeDoRecurso(definicao, contextoRecurso),
    usosMax: resolverUsosMax(definicao, contextoRecurso),
    usosGastos: 0,
    restauraEm: restauracaoDoRecurso(definicao, contextoRecurso, "longo"),
    origemId: definicao.id,
    origemTipo: origem.tipo,
    origemClasseId: origem.classeId ?? null,
    origemSubclasseId: origem.subclasseId ?? null,
    origemTalentoId: origem.talentoId ?? null,
    origemItemId: origem.itemId ?? null,
  };
}

export function sincronizarRecursosCatalogo(recursos, definicoes, ficha, contexto = {}) {
  const catalogo = new Map((definicoes ?? []).map((definicao) => [definicao.id, definicao]));
  return (recursos ?? []).flatMap((recurso) => {
    const definicao = catalogo.get(recurso.origemId);
    if (!definicao) return [recurso];
    if (!recursoDisponivel(definicao, ficha)) return [];
    const contextoRecurso = contextoDoRecurso(definicao, ficha, contexto);
    const usosMax = resolverUsosMax(definicao, contextoRecurso);
    return [{
      ...recurso,
      nome: nomeDoRecurso(definicao, contextoRecurso),
      usosMax,
      usosGastos: Math.min(Math.max(0, numeroSeguro(recurso.usosGastos)), usosMax),
      restauraEm: restauracaoDoRecurso(definicao, contextoRecurso, recurso.restauraEm),
    }];
  });
}

// Um descanso longo também restaura recursos de descanso curto. Outros
// eventos (como "amanhecer") só restauram definições com o mesmo marcador;
// recursos manuais nunca são alterados automaticamente.
export function restaurarRecursos(recursos, tipoDescanso) {
  return recursos.map((recurso) => {
    const restaura =
      recurso.restauraEm === tipoDescanso ||
      (tipoDescanso === "longo" && recurso.restauraEm === "curto");
    return restaura ? { ...recurso, usosGastos: 0 } : recurso;
  });
}

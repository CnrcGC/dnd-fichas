import { obterClasse } from "../data/classes";

export function classesComDadosVida(ficha) {
  return [
    { classeId: ficha.classeId, nivel: ficha.nivel ?? 1, ordem: 0 },
    ...(ficha.classesSecundarias ?? []).map((classe, indice) => ({
      classeId: classe.classeId,
      nivel: classe.nivel ?? 1,
      ordem: indice + 1,
    })),
  ].flatMap((entrada) => {
    const classe = obterClasse(entrada.classeId);
    const maximo = Math.max(0, Number(entrada.nivel) || 0);
    return classe && maximo > 0 ? [{ ...entrada, nome: classe.nome, dadoVida: classe.dadoVida, maximo }] : [];
  });
}

// Em fichas antigas só havia um total de dados gastos. Como não há como saber
// sua origem, a migração os atribui à classe principal e depois às secundárias
// na ordem salva. O processo só ocorre quando os pools ainda não existem.
export function normalizarPoolsDadosVida(ficha) {
  const classes = classesComDadosVida(ficha);
  const existentes = ficha.dadosVidaPorClasse && typeof ficha.dadosVidaPorClasse === "object"
    ? ficha.dadosVidaPorClasse
    : null;
  let restantesLegados = Math.max(0, Number(ficha.dadosDeVidaUsados) || 0);
  const dadosVidaPorClasse = {};

  for (const classe of classes) {
    const anterior = existentes?.[classe.classeId];
    const usadosOriginais = anterior
      ? Number(anterior.usados) || 0
      : Math.min(restantesLegados, classe.maximo);
    if (!anterior) restantesLegados -= usadosOriginais;
    dadosVidaPorClasse[classe.classeId] = {
      classeId: classe.classeId,
      nome: classe.nome,
      dadoVida: classe.dadoVida,
      maximo: classe.maximo,
      usados: Math.min(classe.maximo, Math.max(0, usadosOriginais)),
    };
  }
  return dadosVidaPorClasse;
}

export function dadosVidaDisponiveis(pool) {
  return Math.max(0, Number(pool?.maximo) - Number(pool?.usados));
}

export function gastarDadoVida(dadosVidaPorClasse, classeId) {
  const pool = dadosVidaPorClasse?.[classeId];
  if (!pool || dadosVidaDisponiveis(pool) <= 0) return dadosVidaPorClasse;
  return {
    ...dadosVidaPorClasse,
    [classeId]: { ...pool, usados: pool.usados + 1 },
  };
}

// O livro define quantos dados retornam, mas não uma prioridade entre pools de
// multiclasse. A ordem é, portanto, uma preferência explícita do aplicativo.
export function restaurarDadosVidaLongo(
  dadosVidaPorClasse,
  nivelTotal,
  prioridade = "maiores"
) {
  let restantes = Math.max(1, Math.floor(Number(nivelTotal) / 2));
  const ordenados = Object.values(dadosVidaPorClasse ?? {})
    .map((pool, indice) => ({ pool, indice }))
    .sort((a, b) => {
      if (prioridade === "ordem-classes") return a.indice - b.indice;
      const diferenca = Number(a.pool.dadoVida) - Number(b.pool.dadoVida);
      return prioridade === "menores" ? diferenca : -diferenca;
    })
    .map(({ pool }) => pool);
  const resultado = { ...(dadosVidaPorClasse ?? {}) };
  for (const pool of ordenados) {
    const recuperar = Math.min(restantes, Math.max(0, Number(pool.usados) || 0));
    if (recuperar > 0) {
      resultado[pool.classeId] = { ...pool, usados: pool.usados - recuperar };
      restantes -= recuperar;
    }
    if (restantes === 0) break;
  }
  return resultado;
}

export function totalDadosVidaUsados(dadosVidaPorClasse) {
  return Object.values(dadosVidaPorClasse ?? []).reduce(
    (total, pool) => total + Math.max(0, Number(pool.usados) || 0),
    0
  );
}

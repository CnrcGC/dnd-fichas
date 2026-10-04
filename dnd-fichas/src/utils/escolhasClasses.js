import { obterEscolhasPorClasse } from "../data/escolhasClasses";
import { IDIOMAS } from "../data/idiomas";
import { PERICIAS } from "../data/pericias";

export function classesDaFichaParaEscolhas(ficha) {
  return [
    { classeId: ficha.classeId, nivel: Number(ficha.nivel) || 1 },
    ...(ficha.classesSecundarias ?? []).map((classe) => ({
      classeId: classe.classeId,
      nivel: Number(classe.nivel) || 1,
    })),
  ].filter((classe) => classe.classeId);
}

export function quantidadeDaEscolha(escolha, nivel) {
  if (!escolha?.quantidadePorNivel) return Number(escolha?.quantidade) || 0;
  return Number([...escolha.quantidadePorNivel]
    .filter(([nivelMinimo]) => Number(nivel) >= Number(nivelMinimo))
    .at(-1)?.[1]) || 0;
}

export function valoresDaEscolha(ficha, classeId, escolhaId) {
  const valores = ficha.escolhasClasse?.[classeId]?.[escolhaId];
  return Array.isArray(valores) ? valores : [];
}

export function escolhaAtiva(escolha, ficha, classeId) {
  if (!escolha.dependeDe) return true;
  return valoresDaEscolha(ficha, classeId, escolha.dependeDe.escolhaId)
    .includes(escolha.dependeDe.valor);
}

export function opcoesDaEscolha(escolha, ficha, classe) {
  if (escolha.opcoesDinamicas === "pericias-proficientes") {
    return PERICIAS.filter((pericia) => ficha.pericias?.[pericia.chave])
      .map((pericia) => ({ id: pericia.chave, nome: pericia.label }));
  }
  if (escolha.opcoesDinamicas === "pericias-ou-ferramentas-proficientes") {
    return [
      ...PERICIAS.filter((pericia) => ficha.pericias?.[pericia.chave])
        .map((pericia) => ({ id: pericia.chave, nome: pericia.label })),
      ...(ficha.proficienciasFerramentas ?? []).map((id) => ({ id, nome: id })),
    ];
  }
  if (escolha.opcoesDinamicas === "idiomas") {
    return IDIOMAS.filter((idioma) => idioma.tipo !== "secreto")
      .map((idioma) => ({ id: idioma.id, nome: idioma.nome }));
  }
  if (escolha.id === "bruxo-invocacoes") {
    const dadiva = valoresDaEscolha(ficha, classe.classeId, "bruxo-dadiva")[0];
    const magias = new Set((ficha.magias ?? []).map((magia) => magia.origemId ?? magia.id));
    return (escolha.opcoes ?? []).filter((item) => {
      const requisitos = item.requisitos ?? {};
      if (requisitos.nivelMinimo && Number(classe.nivel) < requisitos.nivelMinimo) return false;
      if (requisitos.dadiva && requisitos.dadiva !== dadiva) return false;
      if (requisitos.magia && !magias.has(requisitos.magia)) return false;
      return true;
    });
  }
  return escolha.opcoes ?? [];
}

export function pendenciasEscolhasClasses(ficha) {
  const pendencias = [];
  for (const classe of classesDaFichaParaEscolhas(ficha)) {
    for (const escolha of obterEscolhasPorClasse(classe.classeId, classe.nivel)) {
      if (!escolhaAtiva(escolha, ficha, classe.classeId)) continue;
      const valores = valoresDaEscolha(ficha, classe.classeId, escolha.id)
        .map((valor) => typeof valor === "string" ? valor.trim() : valor)
        .filter(Boolean);
      const quantidade = quantidadeDaEscolha(escolha, classe.nivel);
      if (!escolha.opcional && new Set(valores).size !== quantidade) {
        pendencias.push(`${escolha.nome} (${classe.classeId}): escolha ${quantidade} opção${quantidade === 1 ? "" : "ões"}.`);
        continue;
      }
      if (new Set(valores).size !== valores.length) {
        pendencias.push(`${escolha.nome} (${classe.classeId}): não repita a mesma opção.`);
      }
      if (escolha.tipo !== "texto") {
        const permitidas = new Set(opcoesDaEscolha(escolha, ficha, classe).map((item) => item.id));
        if (valores.some((valor) => !permitidas.has(valor))) {
          pendencias.push(`${escolha.nome} (${classe.classeId}): há uma opção indisponível para o nível ou requisitos atuais.`);
        }
      }
    }
  }
  return pendencias;
}

export function atualizarEscolhaClasse(ficha, classeId, escolhaId, valores) {
  return {
    ...ficha,
    escolhasClasse: {
      ...(ficha.escolhasClasse ?? {}),
      [classeId]: {
        ...(ficha.escolhasClasse?.[classeId] ?? {}),
        [escolhaId]: [...valores],
      },
    },
  };
}

export function especializacoesDaFicha(ficha) {
  return new Set([
    ...valoresDaEscolha(ficha, "bardo", "bardo-especializacao"),
    ...valoresDaEscolha(ficha, "ladino", "ladino-especializacao"),
  ].filter(Boolean));
}

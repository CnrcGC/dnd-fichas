import { obterSubclasse } from "../data/subclasses";
import {
  obterHabilidadesPorSubclasse,
  subclasseTemHabilidadesDetalhadas,
} from "../data/habilidadesSubclasses";
import {
  obterMagiasConcedidas,
  obterMagiasSemprePreparadas,
} from "../data/magiasExcecoesSubclasse";
import { MAGIAS } from "../data/magiasSistema";

export function classesDaFicha(ficha) {
  return [
    {
      classeId: ficha.classeId,
      nivel: ficha.nivel ?? 1,
      subclasseId: ficha.subclasseId ?? null,
      indice: null,
    },
    ...(ficha.classesSecundarias ?? []).map((classe, indice) => ({
      ...classe,
      subclasseId: classe.subclasseId ?? null,
      indice,
    })),
  ].filter((classe) => classe.classeId);
}

export function subclasseCompativel(classeId, subclasseId, nivel) {
  if (!subclasseId) return true;
  const subclasse = obterSubclasse(subclasseId);
  return Boolean(subclasse && subclasse.classeId === classeId && Number(nivel) >= subclasse.nivel);
}

export function sincronizarHabilidadesAutomaticasSubclasses(ficha, criarId = () => crypto.randomUUID()) {
  const automaticasExistentes = (ficha.habilidades ?? []).filter(
    (habilidade) => habilidade.tipo === "subclasse" && habilidade.origemSubclasseId
  );
  const habilidadesManuais = (ficha.habilidades ?? []).filter((habilidade) => {
    if (habilidade.tipo !== "subclasse") return true;
    return !(
      habilidade.origemSubclasseId ||
      subclasseTemHabilidadesDetalhadas(habilidade.origemId)
    );
  });

  const automaticas = classesDaFicha(ficha).flatMap((classe) =>
    !subclasseCompativel(classe.classeId, classe.subclasseId, classe.nivel)
      ? []
      : obterHabilidadesPorSubclasse(classe.subclasseId)
      .filter((habilidade) => habilidade.nivel <= Number(classe.nivel))
      .map((habilidade) => {
        const existente = automaticasExistentes.find(
          (item) =>
            item.origemId === habilidade.id &&
            item.origemClasseId === classe.classeId &&
            item.origemSubclasseId === classe.subclasseId
        );
        return {
          ...(existente ?? { id: criarId() }),
          nome: habilidade.nome,
          tipo: "subclasse",
          nivel: habilidade.nivel,
          origemId: habilidade.id,
          origemSubclasseId: classe.subclasseId,
          origemClasseId: classe.classeId,
          sourceRefs: habilidade.sourceRefs,
          verificationStatus: habilidade.verificationStatus,
          automationLevel: habilidade.automationLevel,
        };
      })
  );

  return [...habilidadesManuais, ...automaticas];
}

export function sincronizarMagiasAutomaticasSubclasses(ficha, criarId = () => crypto.randomUUID()) {
  const automaticasExistentes = (ficha.magias ?? []).filter(
    (magia) => magia.origemSubclasseAutomatica
  );
  const manuais = (ficha.magias ?? []).filter(
    (magia) => !magia.origemSubclasseAutomatica
  );
  const automaticas = [
    ...obterMagiasSemprePreparadas(ficha),
    ...obterMagiasConcedidas(ficha),
  ].flatMap(({ magiaId, classeId, subclasseId, tipo }) => {
    const magia = MAGIAS.find((item) => item.id === magiaId);
    if (!magia) return [];
    const jaRegistrada = manuais.some(
      (item) => item.origemId === magiaId && item.classeId === classeId
    );
    if (jaRegistrada) return [];
    const existente = automaticasExistentes.find(
      (item) =>
        item.origemId === magiaId &&
        item.classeId === classeId &&
        item.origemSubclasseId === subclasseId
    );
    return [{
      ...(existente ?? { id: criarId() }),
      nome: magia.nome,
      nivel: magia.nivel,
      preparada: tipo === "sempre-preparada",
      origemId: magiaId,
      classeId,
      origemSubclasseId: subclasseId,
      origemSubclasseTipo: tipo,
      origemSubclasseAutomatica: true,
    }];
  });

  return [...manuais, ...automaticas];
}

export function sincronizarFichaComSubclasses(ficha, criarId) {
  const normalizada = {
    ...ficha,
    classesSecundarias: (ficha.classesSecundarias ?? []).map((classe) => ({
      ...classe,
      subclasseId: classe.subclasseId ?? null,
    })),
  };
  const comHabilidades = {
    ...normalizada,
    habilidades: sincronizarHabilidadesAutomaticasSubclasses(normalizada, criarId),
  };
  return {
    ...comHabilidades,
    magias: sincronizarMagiasAutomaticasSubclasses(comHabilidades, criarId),
  };
}

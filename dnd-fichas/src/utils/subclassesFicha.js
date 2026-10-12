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
import { obterHabilidadeClasse, obterHabilidadesPorClasse } from "../data/habilidadesClasses";

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

export function sincronizarHabilidadesAutomaticasClasses(ficha, criarId = () => crypto.randomUUID()) {
  const existentes = (ficha.habilidades ?? []).filter(
    (habilidade) => habilidade.tipo === "classe" && obterHabilidadeClasse(habilidade.origemId)
  );
  const automaticas = classesDaFicha(ficha).flatMap((classe) =>
    obterHabilidadesPorClasse(classe.classeId)
      .filter((habilidade) => habilidade.nivel <= Number(classe.nivel))
      .map((habilidade) => {
        const existente = existentes.find((item) =>
          item.origemId === habilidade.id &&
          (item.origemClasseId ?? habilidade.classeId) === classe.classeId
        );
        return {
          ...(existente ?? { id: criarId() }),
          nome: habilidade.nome,
          tipo: "classe",
          nivel: habilidade.nivel,
          origemId: habilidade.id,
          origemClasseId: classe.classeId,
          sourceRefs: habilidade.sourceRefs,
          verificationStatus: habilidade.verificationStatus,
          automationLevel: habilidade.automationLevel,
        };
      })
  );
  const idsReaproveitados = new Set(automaticas.map((item) => item.id));
  const preservadas = (ficha.habilidades ?? []).filter((habilidade) => {
    if (idsReaproveitados.has(habilidade.id)) return false;
    // Só removemos automaticamente registros que esta sincronização marcou
    // com uma classe de origem. Entradas antigas ou manuais são preservadas.
    return !(habilidade.tipo === "classe" && habilidade.origemClasseId && obterHabilidadeClasse(habilidade.origemId));
  });
  return [...preservadas, ...automaticas];
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
  const comClasses = {
    ...normalizada,
    habilidades: sincronizarHabilidadesAutomaticasClasses(normalizada, criarId),
  };
  const comHabilidades = {
    ...comClasses,
    habilidades: sincronizarHabilidadesAutomaticasSubclasses(comClasses, criarId),
  };
  return {
    ...comHabilidades,
    magias: sincronizarMagiasAutomaticasSubclasses(comHabilidades, criarId),
  };
}

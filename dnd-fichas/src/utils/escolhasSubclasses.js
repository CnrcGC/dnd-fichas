import { obterEscolhasPorSubclasse } from "../data/escolhasSubclasses";
import { FERRAMENTAS, FERRAMENTAS_ARTESAO_IDS } from "../data/equipamentos";
import { IDIOMAS } from "../data/idiomas";
import { PERICIAS } from "../data/pericias";
import { classesDaFicha } from "./subclassesFicha";
import { quantidadeDaEscolha, valoresDaEscolha } from "./escolhasClasses";

export function valoresDaEscolhaSubclasse(ficha, subclasseId, escolhaId) {
  const valores = ficha.escolhasSubclasse?.[subclasseId]?.[escolhaId];
  return Array.isArray(valores) ? valores : [];
}

export function opcoesDaEscolhaSubclasse(escolha, ficha, classe) {
  if (escolha.opcoesDinamicas === "todas-pericias") {
    return PERICIAS.map((item) => ({ id: item.chave, nome: item.label }));
  }
  if (escolha.opcoesDinamicas === "pericias-fixas") {
    const permitidas = new Set(escolha.opcoesFixas ?? []);
    return PERICIAS.filter((item) => permitidas.has(item.chave)).map((item) => ({ id: item.chave, nome: item.label }));
  }
  if (escolha.opcoesDinamicas === "idiomas") {
    return IDIOMAS.filter((item) => item.tipo !== "secreto").map((item) => ({ id: item.id, nome: item.nome }));
  }
  if (escolha.opcoesDinamicas === "ferramentas-artesao") {
    const permitidas = new Set(FERRAMENTAS_ARTESAO_IDS);
    return FERRAMENTAS.filter((item) => permitidas.has(item.id)).map((item) => ({ id: item.id, nome: item.nome }));
  }
  let opcoes = escolha.opcoes ?? [];
  if (escolha.id === "quatro-elementos-disciplinas") {
    opcoes = opcoes.filter((item) => Number(item.requisitos?.nivelMinimo ?? 1) <= Number(classe.nivel));
  }
  if (escolha.excluirEscolhasClasse?.length) {
    const bloqueadas = new Set(escolha.excluirEscolhasClasse.flatMap((id) => valoresDaEscolha(ficha, classe.classeId, id)));
    opcoes = opcoes.filter((item) => !bloqueadas.has(item.id));
  }
  return opcoes;
}

export function escolhaSubclasseAtiva(escolha, ficha, subclasseId) {
  if (!escolha.dependeDe) return true;
  return valoresDaEscolhaSubclasse(ficha, subclasseId, escolha.dependeDe.escolhaId)
    .includes(escolha.dependeDe.valor);
}

export function escolhasAtivasSubclasses(ficha) {
  return classesDaFicha(ficha).flatMap((classe) => obterEscolhasPorSubclasse(classe.subclasseId, classe.nivel)
    .filter((escolha) => escolhaSubclasseAtiva(escolha, ficha, classe.subclasseId))
    .map((escolha) => ({ classe, escolha })));
}

export function pendenciasEscolhasSubclasses(ficha) {
  const pendencias = [];
  for (const { classe, escolha } of escolhasAtivasSubclasses(ficha)) {
    const valores = valoresDaEscolhaSubclasse(ficha, classe.subclasseId, escolha.id)
      .map((valor) => typeof valor === "string" ? valor.trim() : valor).filter(Boolean);
    const quantidade = quantidadeDaEscolha(escolha, classe.nivel);
    if (new Set(valores).size !== quantidade) {
      pendencias.push(`${escolha.nome} (${classe.subclasseId}): escolha ${quantidade} opção${quantidade === 1 ? "" : "ões"}.`);
      continue;
    }
    if (new Set(valores).size !== valores.length) {
      pendencias.push(`${escolha.nome} (${classe.subclasseId}): não repita a mesma opção.`);
    }
    if (escolha.tipo !== "texto") {
      const permitidas = new Set(opcoesDaEscolhaSubclasse(escolha, ficha, classe).map((item) => item.id));
      if (valores.some((valor) => !permitidas.has(valor))) {
        pendencias.push(`${escolha.nome} (${classe.subclasseId}): há uma opção indisponível para o nível ou requisitos atuais.`);
      }
    }
  }
  return pendencias;
}

export function atualizarEscolhaSubclasse(ficha, subclasseId, escolhaId, valores) {
  return {
    ...ficha,
    perfilEscolhasSubclasse: "me-02c",
    escolhasSubclasse: {
      ...(ficha.escolhasSubclasse ?? {}),
      [subclasseId]: {
        ...(ficha.escolhasSubclasse?.[subclasseId] ?? {}),
        [escolhaId]: [...valores],
      },
    },
  };
}

export function especializacoesSubclasseDaFicha(ficha) {
  const ativa = classesDaFicha(ficha).some((classe) => classe.subclasseId === "dominio-conhecimento" && Number(classe.nivel) >= 1);
  return new Set(ativa ? valoresDaEscolhaSubclasse(ficha, "dominio-conhecimento", "conhecimento-pericias") : []);
}

import { ARMAS } from "../data/armas";
import { FERRAMENTAS } from "../data/equipamentos";
import { IDIOMAS } from "../data/idiomas";
import { PERICIAS } from "../data/pericias";
import { obterTalento } from "../data/talentos";
import { tipoConjurador } from "./conjuracao";

export function registrosTalentos(ficha) {
  return Object.entries(ficha?.escolhasTalentos ?? {}).map(([origemAsi, registro]) => ({
    origemAsi,
    talentoId: registro?.talentoId ?? null,
    escolhas: registro?.escolhas && typeof registro.escolhas === "object" ? registro.escolhas : {},
  })).filter((registro) => registro.talentoId);
}

export function personagemConjura(ficha) {
  const classes = [
    { classeId: ficha?.classeId, subclasseId: ficha?.subclasseId },
    ...(ficha?.classesSecundarias ?? []),
  ];
  return classes.some((item) => tipoConjurador(item.classeId, item.subclasseId)) ||
    (ficha?.magias ?? []).length > 0;
}

export function verificarPreRequisitoTalento(ficha, talento, atributos = ficha?.atributos ?? {}) {
  const requisito = talento?.preRequisito;
  if (!requisito) return { atendido: true, texto: null };
  if (requisito.conjurador && !personagemConjura(ficha)) {
    return { atendido: false, texto: "Requer capacidade de conjurar pelo menos uma magia." };
  }
  if (requisito.atributo && Number(atributos[requisito.atributo]) < requisito.valorMinimo) {
    return { atendido: false, texto: `Requer ${requisito.atributo} ${requisito.valorMinimo} ou maior.` };
  }
  if (requisito.atributoQualquer && !requisito.atributoQualquer.some(
    (atributo) => Number(atributos[atributo]) >= requisito.valorMinimo
  )) {
    return { atendido: false, texto: `Requer ${requisito.atributoQualquer.join(" ou ")} ${requisito.valorMinimo} ou maior.` };
  }
  if (requisito.proficienciaArmadura && !(ficha?.proficienciasArmaduras ?? []).includes(requisito.proficienciaArmadura)) {
    return { atendido: false, texto: `Requer proficiência em armaduras ${requisito.proficienciaArmadura}.` };
  }
  return { atendido: true, texto: null };
}

export function talentoDisponivel(ficha, talento, atributos = ficha?.atributos ?? {}) {
  const requisito = verificarPreRequisitoTalento(ficha, talento, atributos);
  if (!requisito.atendido) return requisito;
  const jaPossui = registrosTalentos(ficha).some((registro) => registro.talentoId === talento.id) ||
    (ficha?.habilidades ?? []).some((habilidade) => habilidade.tipo === "talento" && habilidade.origemId === talento.id);
  if (!talento.repetivel && jaPossui) {
    return { atendido: false, texto: "Este talento já foi escolhido." };
  }
  return requisito;
}

export function opcoesEscolhaTalento(escolha) {
  if (escolha?.opcoesDinamicas === "idiomas") {
    return IDIOMAS.filter((item) => item.tipo !== "secreto").map((item) => ({ id: item.id, nome: item.nome }));
  }
  if (escolha?.opcoesDinamicas === "armas") {
    return ARMAS.map((item) => ({ id: item.id, nome: item.nome }));
  }
  if (escolha?.opcoesDinamicas === "pericias-ou-ferramentas") {
    return [
      ...PERICIAS.map((item) => ({ id: `pericia:${item.chave}`, nome: `Perícia: ${item.label}` })),
      ...FERRAMENTAS.map((item) => ({ id: `ferramenta:${item.id}`, nome: `Ferramenta: ${item.nome}` })),
    ];
  }
  return escolha?.opcoes ?? [];
}

export function escolhasTalentoValidas(talento, escolhas = {}) {
  for (const regra of talento?.escolhas ?? []) {
    const valores = Array.isArray(escolhas[regra.id])
      ? escolhas[regra.id].map((valor) => String(valor).trim()).filter(Boolean)
      : [];
    if (new Set(valores).size !== Number(regra.quantidade)) return false;
    if (regra.tipo !== "texto") {
      const permitidas = new Set(opcoesEscolhaTalento(regra).map((item) => item.id));
      if (valores.some((valor) => !permitidas.has(valor))) return false;
    }
  }
  return true;
}

export function aplicarIncrementoTalento(atributos, talento, escolhas = {}) {
  const proximos = { ...atributos };
  if (talento?.incrementoAtributo) {
    const { atributo, valor } = talento.incrementoAtributo;
    proximos[atributo] = Math.min(20, Number(proximos[atributo] ?? 0) + Number(valor));
  }
  for (const regra of talento?.escolhas ?? []) {
    if (!regra.incrementoAtributo) continue;
    const atributo = escolhas[regra.id]?.[0];
    if (atributo) proximos[atributo] = Math.min(20, Number(proximos[atributo] ?? 0) + Number(regra.incrementoAtributo));
  }
  return proximos;
}

export function pendenciasTalentos(ficha, atributos = ficha?.atributos ?? {}) {
  const pendencias = [];
  const repeticoesElementais = new Set();
  for (const registro of registrosTalentos(ficha)) {
    const talento = obterTalento(registro.talentoId);
    if (!talento) {
      pendencias.push(`Talento de ${registro.origemAsi}: opção desconhecida.`);
      continue;
    }
    const requisito = verificarPreRequisitoTalento(ficha, talento, atributos);
    if (!requisito.atendido) pendencias.push(`${talento.nome}: ${requisito.texto}`);
    if (!escolhasTalentoValidas(talento, registro.escolhas)) {
      pendencias.push(`${talento.nome}: complete as escolhas obrigatórias.`);
    }
    if (talento.id === "adepto-elemental") {
      const tipo = registro.escolhas?.["tipo-dano"]?.[0];
      if (tipo && repeticoesElementais.has(tipo)) pendencias.push("Adepto Elemental: escolha um tipo de dano diferente em cada aquisição.");
      if (tipo) repeticoesElementais.add(tipo);
    }
  }
  for (const habilidade of ficha?.habilidades ?? []) {
    if (habilidade.tipo === "talento" && habilidade.origemId && !obterTalento(habilidade.origemId)) {
      pendencias.push(`${habilidade.nome || "Talento"}: entrada não reconhecida no catálogo atual.`);
    }
  }
  return pendencias;
}

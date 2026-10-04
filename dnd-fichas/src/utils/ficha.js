import { criarEspacosMagiaVazios } from "./magia";
import { normalizarPoolsDadosVida, totalDadosVidaUsados } from "./dadosVida";
import { reconciliarProficienciasCriacao } from "./proficienciasCriacao";
import { normalizarNiveisFicha } from "./niveis";
import { normalizarInventario } from "./itensMagicos";
import { concentracaoTerminaPorStatus, normalizarCondicoes } from "./efeitos";
import { normalizarMoedas } from "./moedas";

export function criarFichaVazia(nome) {
  return {
    versaoFicha: 8,
    id: crypto.randomUUID(),
    nome: nome?.trim() || "Sem nome",
    criadoEm: Date.now(),
    notas: "",
    jogador: "",
    aparencia: "",
    personalidade: "",
    historico: "",
    objetivo: "",
    racaId: null,
    subracaId: null,
    classeId: null,
    antecedenteId: null,
    nivel: 1,
    atributos: {
      forca: 10,
      destreza: 10,
      constituicao: 10,
      inteligencia: 10,
      sabedoria: 10,
      carisma: 10,
    },
    metodoAtributos: "manual",
    pericias: {},
    escolhasCriacao: {},
    origensProficiencias: {},
    estadoFicha: "rascunho", // "rascunho" | "pronta"; a validade é sempre derivada.
    trocasMagiasAplicadas: {},
    inventario: [],
    moedas: {
      cobre: 0,
      prata: 0,
      electro: 0,
      ouro: 0,
      platina: 0,
    },
    status: {
      pvAtual: 10,
      pvMax: 10,
      pvTemp: 0,               // NOVO
      ca: 10,
      iniciativa: 0,
      deslocamento: 9,
      testesMorteSucessos: 0,  // NOVO
      testesMorteFalhas: 0,    // NOVO
    },
    pvPorNivel: {},
    origemClassePvPorNivel: {},
    progressao: {
      modo: "marco", // "marco" | "xp"
      xpAtual: 0,
    },
    recursos: [],
    subclasseId: null,
    bonusRacialEscolhido: [], // atributos escolhidos livremente (ex: Meio-Elfo)
    escolhasRaciais: {}, // escolhas próprias da raça, como ancestralidade dracônica
    escolhasClasse: {}, // escolhas por classe e nível, preservadas por ID estável
    perfilEscolhasClasse: "me-02b",
    escolhasSubclasse: {}, // escolhas internas da subclasse, preservadas por ID estável
    perfilEscolhasSubclasse: "me-02c",
    periciasDoAntecedente: [], // rastreia quais perícias vieram do antecedente atual
    idiomas: ["comum"],
    proficienciasFerramentas: [], // ids de FERRAMENTAS (data/equipamentos.js) em que é proficiente
    atributoFerramentas: {}, // { [ferramentaId]: chaveDoAtributo } — atributo usado em cada rolagem
    classesSecundarias: [], // [{ classeId, nivel, subclasseId }] — multiclasse
    dadosDeVidaUsados: 0, // legado: mantido como total dos pools
    dadosVidaPorClasse: {},
    proficienciasArmas: [],
    proficienciasArmaduras: [],
    proficienciasEscudos: false,
    proficienciasMulticlasse: {},
    niveisAsiAplicados: [],
    magias: [],
    espacosMagia: criarEspacosMagiaVazios(),
    espacosMagiaPacto: null, // { quantidade, nivel, usados } — Bruxo, sempre separado
    concentracao: null, // { magiaId, nome } | null — magia de concentração ativa agora
    condicoesAtivas: [],
    habilidades: [],
    ataques: [],
  };
}


// Migração conservadora: acrescenta os campos estruturais sem apagar escolhas
// antigas, magias, recursos ou campos personalizados.
export function normalizarFicha(ficha) {
  if (!ficha || typeof ficha !== "object") return ficha;
  const fichaComNiveisValidos = normalizarNiveisFicha(ficha);
  const base = {
    ...fichaComNiveisValidos,
    versaoFicha: Math.max(Number(fichaComNiveisValidos.versaoFicha) || 1, 8),
    subclasseId: fichaComNiveisValidos.subclasseId ?? null,
    subracaId: fichaComNiveisValidos.subracaId ?? null,
    classesSecundarias: Array.isArray(fichaComNiveisValidos.classesSecundarias)
      ? fichaComNiveisValidos.classesSecundarias.map((classe) => ({
          ...classe,
          subclasseId: classe?.subclasseId ?? null,
        }))
      : [],
    proficienciasArmas: Array.isArray(ficha.proficienciasArmas) ? ficha.proficienciasArmas : [],
    proficienciasArmaduras: Array.isArray(ficha.proficienciasArmaduras) ? ficha.proficienciasArmaduras : [],
    proficienciasEscudos: Boolean(ficha.proficienciasEscudos),
    proficienciasMulticlasse:
      ficha.proficienciasMulticlasse && typeof ficha.proficienciasMulticlasse === "object"
        ? ficha.proficienciasMulticlasse
        : {},
    atributos: {
      forca: 10, destreza: 10, constituicao: 10, inteligencia: 10, sabedoria: 10, carisma: 10,
      ...(ficha.atributos && typeof ficha.atributos === "object" ? ficha.atributos : {}),
    },
    pericias: ficha.pericias && typeof ficha.pericias === "object" ? ficha.pericias : {},
    magias: Array.isArray(ficha.magias) ? ficha.magias : [],
    habilidades: Array.isArray(ficha.habilidades) ? ficha.habilidades : [],
    inventario: Array.isArray(ficha.inventario)
      ? normalizarInventario(ficha.inventario)
      : [],
    moedas: normalizarMoedas(ficha.moedas),
    condicoesAtivas: normalizarCondicoes(ficha.condicoesAtivas),
  };
  const dadosVidaPorClasse = normalizarPoolsDadosVida(base);
  const origemClassePvPorNivel = {
    ...(ficha.origemClassePvPorNivel ?? {}),
  };
  // Fichas antigas não guardavam a origem do ganho de PV. Para preservar os
  // valores já salvos, atribuímos essas entradas à classe principal; somente
  // ganhos futuros passam a registrar a classe que realmente subiu.
  for (const nivel of Object.keys(base.pvPorNivel ?? {})) {
    origemClassePvPorNivel[nivel] ??= base.classeId ?? null;
  }
  const status = {
    ...base.status,
    pvMax: Math.max(1, Number.isFinite(Number(base.status?.pvMax)) ? Number(base.status.pvMax) : 1),
    pvTemp: Math.max(0, Number.isFinite(Number(base.status?.pvTemp)) ? Number(base.status.pvTemp) : 0),
  };
  status.pvAtual = Math.min(status.pvMax, Math.max(0, Number.isFinite(Number(base.status?.pvAtual)) ? Number(base.status.pvAtual) : status.pvMax));
  const espacosMagia = criarEspacosMagiaVazios();
  for (const nivel of Object.keys(espacosMagia)) {
    const anterior = base.espacosMagia?.[nivel] ?? {};
    const total = Math.max(0, Number.isFinite(Number(anterior.total)) ? Number(anterior.total) : 0);
    espacosMagia[nivel] = { total, usados: Math.min(total, Math.max(0, Number.isFinite(Number(anterior.usados)) ? Number(anterior.usados) : 0)) };
  }
  const pactoQuantidade = Math.max(0, Number.isFinite(Number(base.espacosMagiaPacto?.quantidade)) ? Number(base.espacosMagiaPacto.quantidade) : 0);
  const espacosMagiaPacto = base.espacosMagiaPacto ? {
    ...base.espacosMagiaPacto,
    quantidade: pactoQuantidade,
    nivel: Math.max(0, Math.min(9, Number.isFinite(Number(base.espacosMagiaPacto.nivel)) ? Number(base.espacosMagiaPacto.nivel) : 0)),
    usados: Math.min(pactoQuantidade, Math.max(0, Number.isFinite(Number(base.espacosMagiaPacto.usados)) ? Number(base.espacosMagiaPacto.usados) : 0)),
  } : null;
  const recursos = Array.isArray(base.recursos) ? base.recursos.map((recurso) => {
    const usosMax = Math.max(0, Number.isFinite(Number(recurso?.usosMax)) ? Number(recurso.usosMax) : 0);
    return { ...recurso, usosMax, usosGastos: Math.min(usosMax, Math.max(0, Number.isFinite(Number(recurso?.usosGastos)) ? Number(recurso.usosGastos) : 0)) };
  }) : [];
  const normalizada = {
    ...base,
    status,
    concentracao: concentracaoTerminaPorStatus(status) ? null : base.concentracao,
    espacosMagia,
    espacosMagiaPacto,
    recursos,
    estadoFicha: base.estadoFicha === "pronta" ? "pronta" : "rascunho",
    escolhasCriacao: base.escolhasCriacao && typeof base.escolhasCriacao === "object" ? base.escolhasCriacao : {},
    escolhasRaciais: base.escolhasRaciais && typeof base.escolhasRaciais === "object" ? base.escolhasRaciais : {},
    escolhasClasse: base.escolhasClasse && typeof base.escolhasClasse === "object" ? base.escolhasClasse : {},
    perfilEscolhasClasse: base.perfilEscolhasClasse ?? null,
    escolhasSubclasse: base.escolhasSubclasse && typeof base.escolhasSubclasse === "object" ? base.escolhasSubclasse : {},
    perfilEscolhasSubclasse: base.perfilEscolhasSubclasse ?? null,
    origensProficiencias: base.origensProficiencias && typeof base.origensProficiencias === "object" ? base.origensProficiencias : {},
    trocasMagiasAplicadas: base.trocasMagiasAplicadas && typeof base.trocasMagiasAplicadas === "object" ? base.trocasMagiasAplicadas : {},
    origemClassePvPorNivel,
    dadosVidaPorClasse,
    dadosDeVidaUsados: totalDadosVidaUsados(dadosVidaPorClasse),
  };
  return reconciliarProficienciasCriacao(normalizada);
}

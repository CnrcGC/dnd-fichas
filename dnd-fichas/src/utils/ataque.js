import { formatarModificador } from "./dnd";
import { obterItemCatalogo } from "../data/catalogoItens";
import { itemMagicoAtivo } from "./itensMagicos";

// RULEBOOK FACT: Livro do Jogador (2014), p. 148,
// "Proficiência em Arma" e "Propriedades das Armas — Acuidade".
const ALIASES_PROFICIENCIA_ARMA = Object.freeze({
  bordao: ["bordoes"],
  maca: ["macas"],
  lanca: ["lancas"],
  "besta-leve": ["bestas-leves"],
  "besta-de-mao": ["bestas-de-mao"],
  "espada-longa": ["espadas-longas"],
  "espada-curta": ["espadas-curtas"],
});

export function atributosElegiveisParaArma(arma) {
  if (arma?.propriedades?.includes("acuidade")) return ["forca", "destreza"];
  return arma?.tipo === "distancia" ? ["destreza"] : ["forca"];
}

export function armaEhProficiente(arma, proficienciasArmas = []) {
  if (!arma) return false;
  const proficiencias = new Set(proficienciasArmas);
  const categoria = arma.categoria === "marcial" ? "marciais" : arma.categoria;
  const idsEspecificos = [arma.id, `${arma.id}s`, ...(ALIASES_PROFICIENCIA_ARMA[arma.id] ?? [])];
  return proficiencias.has(categoria) || idsEspecificos.some((id) => proficiencias.has(id));
}

function escolherAtributoAtaque(arma, override, modificadoresAtributos) {
  const elegiveis = atributosElegiveisParaArma(arma);
  if (override && override !== "auto" && elegiveis.includes(override)) return override;
  return elegiveis.reduce((melhor, atributo) =>
    (modificadoresAtributos?.[atributo] ?? 0) > (modificadoresAtributos?.[melhor] ?? 0)
      ? atributo
      : melhor
  );
}

export function criarAtaqueApartirDeItemEquipado(
  itemInventario,
  { modificadoresAtributos = {}, proficienciasArmas = [] } = {},
) {
  const catalogo = obterItemCatalogo(itemInventario.origemId);
  const arma = catalogo?.original;
  if (!arma) return null;

  const override = itemInventario.atributoAtaque;
  const atributo = escolherAtributoAtaque(arma, override, modificadoresAtributos);

  const bonusMagico = itemMagicoAtivo(itemInventario) ? itemInventario.bonusMagico ?? 0 : 0;

  return {
    id: itemInventario.id,
    nome: itemInventario.nome || arma.nome,
    atributo,
    dano: arma.dano,
    tipoDano: arma.tipoDano ?? "",
    bonusManual: 0,
    bonusMagico,
    proficiente: armaEhProficiente(arma, proficienciasArmas),
    origemId: arma.id,
  };
}

export function criarAtaqueVazio() {
  return {
    id: crypto.randomUUID(),
    nome: "",
    atributo: "manual",
    dano: "",
    tipoDano: "",
    bonusManual: 0,
    proficiente: true,
    origemId: null,
  };
}

export function calcularBonusAcerto(ataque, modificadoresAtributos, bonusProficiencia) {
  if (ataque.atributo === "manual") return ataque.bonusManual ?? 0;
  return (
    (modificadoresAtributos[ataque.atributo] ?? 0) +
    (ataque.proficiente !== false ? bonusProficiencia : 0) +
    (ataque.bonusMagico ?? 0)
  );
}

export function formatarDano(ataque, modificadoresAtributos) {
  if (!ataque.dano) return "—";
  if (ataque.atributo === "manual") {
    return `${ataque.dano}${ataque.tipoDano ? ` ${ataque.tipoDano}` : ""}`;
  }
  const mod =
    (modificadoresAtributos[ataque.atributo] ?? 0) + (ataque.bonusMagico ?? 0);
  const sufixoMod = mod !== 0 ? formatarModificador(mod) : "";
  return `${ataque.dano}${sufixoMod}${ataque.tipoDano ? ` ${ataque.tipoDano}` : ""}`;
}

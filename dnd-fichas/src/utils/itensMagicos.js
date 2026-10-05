import { obterItemMagico } from "../data/itensMagicos";

export const LIMITE_SINTONIZACAO = 3;

const CAMPOS_CATALOGO = [
  "raridade",
  "bonusMagico",
  "requerEquipado",
  "requerSintonizacao",
  "efeitos",
  "regras",
];

const CAMPOS_BACKUP_CATALOGO = [
  ...CAMPOS_CATALOGO,
  "sintonizado",
  "cargasMaximas",
  "cargasAtuais",
];

function dadosAtuaisCatalogo(catalogo) {
  return {
    magico: true,
    raridade: catalogo.raridade,
    bonusMagico: catalogo.bonusMagico ?? 0,
    requerEquipado: Boolean(catalogo.requerEquipado),
    requerSintonizacao: Boolean(catalogo.requerSintonizacao),
    efeitos: structuredClone(catalogo.efeitos ?? []),
    regras: [...(catalogo.regras ?? [])],
  };
}

function valoresDiferentes(a, b) {
  return JSON.stringify(a) !== JSON.stringify(b);
}

function backupDadosCatalogo(item) {
  return Object.fromEntries(
    CAMPOS_BACKUP_CATALOGO
      .filter((campo) => Object.hasOwn(item, campo))
      .map((campo) => [campo, structuredClone(item[campo])])
  );
}

export function itemPossuiCargas(item) {
  return (
    item?.cargasMaximas !== null &&
    item?.cargasMaximas !== undefined &&
    item?.cargasMaximas !== "" &&
    Number.isFinite(Number(item.cargasMaximas))
  );
}

export function itemMagicoAtivo(item) {
  if (!item?.magico) return false;
  if (item.sintonizacaoExcedente) return false;
  if (item.requerEquipado && !item.equipado) return false;
  if (item.requerSintonizacao && !item.sintonizado) return false;
  return true;
}

export function contarItensSintonizados(inventario) {
  return (inventario ?? []).filter((item) => item?.sintonizado).length;
}

export function alterarSintonizacao(inventario, itemId, sintonizado) {
  const itens = inventario ?? [];
  const item = itens.find((registro) => registro.id === itemId);
  if (!item?.requerSintonizacao) {
    return { inventario: itens, erro: "Este item não requer sintonização." };
  }
  if (sintonizado && !item.sintonizado && contarItensSintonizados(itens) >= LIMITE_SINTONIZACAO) {
    return { inventario: itens, erro: `O limite de ${LIMITE_SINTONIZACAO} itens sintonizados foi atingido.` };
  }
  return {
    inventario: itens.map((registro) =>
      registro.id === itemId
        ? { ...registro, sintonizado: Boolean(sintonizado), sintonizacaoExcedente: false }
        : registro
    ),
    erro: null,
  };
}

export function gastarCargasItem(inventario, itemId, quantidade = 1) {
  const itens = inventario ?? [];
  const item = itens.find((registro) => registro.id === itemId);
  const gasto = Math.max(1, Math.floor(Number(quantidade) || 1));
  if (!itemPossuiCargas(item)) {
    return { inventario: itens, erro: "Este item não possui cargas." };
  }
  if ((item.cargasAtuais ?? 0) < gasto) {
    return { inventario: itens, erro: "O item não possui cargas suficientes." };
  }
  return {
    inventario: itens.map((registro) =>
      registro.id === itemId
        ? { ...registro, cargasAtuais: Math.max(0, Number(registro.cargasAtuais) - gasto) }
        : registro
    ),
    erro: null,
  };
}

export function recuperarCargasItem(inventario, itemId, quantidade) {
  const itens = inventario ?? [];
  const item = itens.find((registro) => registro.id === itemId);
  if (!itemPossuiCargas(item)) {
    return { inventario: itens, recuperadas: 0, erro: "Este item não possui cargas." };
  }
  const maximo = Math.max(0, Number(item.cargasMaximas));
  const atuais = Math.min(maximo, Math.max(0, Number(item.cargasAtuais) || 0));
  const novas = Math.min(maximo, atuais + Math.max(0, Math.floor(Number(quantidade) || 0)));
  return {
    inventario: itens.map((registro) =>
      registro.id === itemId ? { ...registro, cargasAtuais: novas } : registro
    ),
    recuperadas: novas - atuais,
    erro: null,
  };
}

export function somarEfeitoItens(inventario, tipo) {
  return (inventario ?? [])
    .filter(itemMagicoAtivo)
    .flatMap((item) => item.efeitos ?? [])
    .filter((efeito) => efeito?.tipo === tipo)
    .reduce((total, efeito) => total + (Number(efeito.valor) || 0), 0);
}

export function normalizarItemInventario(item) {
  if (!item || typeof item !== "object") return item;
  const catalogo = obterItemMagico(item.itemMagicoId);
  let atualizado = item;
  if (catalogo && !item.preferirDadosCatalogoAnteriores) {
    const dadosCatalogo = dadosAtuaisCatalogo(catalogo);
    const camposAlterados = CAMPOS_CATALOGO.filter(
      (campo) => Object.hasOwn(item, campo) && valoresDiferentes(item[campo], dadosCatalogo[campo])
    );
    atualizado = { ...item, ...dadosCatalogo };
    if (camposAlterados.length > 0 && !item.dadosCatalogoAnteriores) {
      atualizado.dadosCatalogoAnteriores = backupDadosCatalogo(item);
      atualizado.avisoCatalogo = `O catálogo atualizou: ${camposAlterados.join(", ")}. A versão anterior foi preservada.`;
    }
  }
  const maximoInformado = Number(atualizado.cargasMaximas);
  const possuiCargas = itemPossuiCargas(atualizado);
  const cargasMaximas = possuiCargas ? Math.max(0, Math.floor(maximoInformado)) : null;
  const cargasAtuais = possuiCargas
    ? Math.min(cargasMaximas, Math.max(0, Math.floor(Number(item.cargasAtuais) || 0)))
    : null;
  return {
    ...atualizado,
    sintonizado: atualizado.requerSintonizacao ? Boolean(atualizado.sintonizado) : false,
    ...(possuiCargas ? { cargasMaximas, cargasAtuais } : {}),
  };
}

export function normalizarInventario(inventario) {
  let sintonizados = 0;
  return (inventario ?? []).map(normalizarItemInventario).filter(Boolean).map((item) => {
    if (!item.sintonizado) {
  const semExcedente = { ...item };
  delete semExcedente.sintonizacaoExcedente;
  return semExcedente;
}
    sintonizados += 1;
    return { ...item, sintonizacaoExcedente: sintonizados > LIMITE_SINTONIZACAO };
  });
}

export function restaurarDadosCatalogoAnteriores(inventario, itemId) {
  const item = (inventario ?? []).find((registro) => registro.id === itemId);
  if (!item?.dadosCatalogoAnteriores) {
    return { inventario: inventario ?? [], erro: "Este item não possui uma versão anterior preservada." };
  }
  return {
    inventario: (inventario ?? []).map((registro) =>
      registro.id === itemId
        ? {
            ...registro,
            ...structuredClone(registro.dadosCatalogoAnteriores),
            preferirDadosCatalogoAnteriores: true,
          }
        : registro
    ),
    erro: null,
  };
}

export function usarDadosCatalogoAtuais(inventario, itemId) {
  const item = (inventario ?? []).find((registro) => registro.id === itemId);
  const catalogo = obterItemMagico(item?.itemMagicoId);
  if (!item || !catalogo) {
    return { inventario: inventario ?? [], erro: "A versão atual deste item não está no catálogo." };
  }
  return {
    inventario: (inventario ?? []).map((registro) =>
      registro.id === itemId
        ? { ...registro, ...dadosAtuaisCatalogo(catalogo), preferirDadosCatalogoAnteriores: false }
        : registro
    ),
    erro: null,
  };
}

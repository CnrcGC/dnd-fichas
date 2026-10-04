// RULEBOOK FACT: Livro do Jogador (2014), p. 178, "Erguendo e Carregando".
export const MULTIPLICADOR_CAPACIDADE_CARGA = 7.5;
export const MULTIPLICADOR_EMPURRAR_ARRASTAR_ERGUER = 15;
export const MULTIPLICADORES_TAMANHO_CARGA = Object.freeze({
  miudo: 0.5,
  pequeno: 1,
  medio: 1,
  grande: 2,
  enorme: 4,
  colossal: 8,
});

function normalizarForca(forcaTotal) {
  const forca = Number(forcaTotal);
  return Number.isFinite(forca) && forca > 0 ? forca : 0;
}

export function multiplicadorCargaPorTamanho(tamanho = "medio") {
  return MULTIPLICADORES_TAMANHO_CARGA[tamanho] ?? MULTIPLICADORES_TAMANHO_CARGA.medio;
}

export function calcularCapacidadeCarga(forcaTotal, tamanho = "medio") {
  return normalizarForca(forcaTotal) * MULTIPLICADOR_CAPACIDADE_CARGA * multiplicadorCargaPorTamanho(tamanho);
}

export function calcularLimiteEmpurrarArrastarErguer(forcaTotal, tamanho = "medio") {
  return normalizarForca(forcaTotal) * MULTIPLICADOR_EMPURRAR_ARRASTAR_ERGUER * multiplicadorCargaPorTamanho(tamanho);
}

export function calcularPesoInventario(inventario) {
  return (inventario ?? []).reduce((total, item) => {
    const quantidade = Math.max(0, Number(item?.quantidade) || 0);
    const peso = Math.max(0, Number(item?.peso) || 0);
    return total + quantidade * peso;
  }, 0);
}

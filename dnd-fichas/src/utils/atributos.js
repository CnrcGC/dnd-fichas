import { rolarDado } from "./dados";

export function limitarAtributo(valor, bonus = 0, anterior = 10) {
  const numero = Number(valor);
  if (!Number.isFinite(numero)) return anterior;
  return Math.min(30 - bonus, Math.max(1, Math.trunc(numero)));
}

export function rolarAtributos(rolar = rolarDado) {
  return Array.from({ length: 6 }, () => {
    const dados = Array.from({ length: 4 }, () => rolar(6));
    const descartado = dados.indexOf(Math.min(...dados));
    return { dados, descartado, total: dados.reduce((soma, dado, indice) => soma + (indice === descartado ? 0 : dado), 0) };
  });
}

// Distribuir por índice mantém resultados repetidos como rolagens distintas.
export function trocarDistribuicao(distribuicao, posicao, resultado) {
  const proxima = [...distribuicao];
  const anterior = proxima.indexOf(resultado);
  if (anterior < 0 || posicao < 0 || posicao >= proxima.length) return proxima;
  [proxima[posicao], proxima[anterior]] = [proxima[anterior], proxima[posicao]];
  return proxima;
}

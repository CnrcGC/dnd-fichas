// Ajuda o descanso curto/longo: restaurar espaços de magia e calcular
// quantos dados de vida o personagem recupera num descanso longo.

import {
  restaurarDadosVidaLongo,
  totalDadosVidaUsados,
} from "./dadosVida";
import { calcularNivelTotal } from "./niveis";
import { restaurarRecursos } from "./recurso";
import { estadoTestesMorte } from "./status";

export function restaurarTodosEspacos(espacosMagia) {
  const resultado = {};
  for (const [nivel, espaco] of Object.entries(espacosMagia)) {
    resultado[nivel] = { ...espaco, usados: 0 };
  }
  return resultado;
}

export function calcularDadosDeVidaRecuperados(nivelPersonagem) {
  return Math.max(1, Math.floor(nivelPersonagem / 2));
}

function restaurarMagiaPacto(espacosMagiaPacto) {
  return espacosMagiaPacto
    ? { ...espacosMagiaPacto, usados: 0 }
    : null;
}

export function aplicarDescansoCurto(ficha) {
  return {
    recursos: restaurarRecursos(ficha.recursos ?? [], "curto"),
    espacosMagiaPacto: restaurarMagiaPacto(ficha.espacosMagiaPacto),
  };
}

// RULEBOOK FACT: Livro do Jogador (2014), p. 188, "Descanso Longo".
export function podeBeneficiarDescansoLongo(status = {}) {
  return Number(status.pvAtual) >= 1 && !estadoTestesMorte(status).morto;
}

export function aplicarDescansoLongo(ficha, { prioridadeDadosVida = "maiores" } = {}) {
  if (!podeBeneficiarDescansoLongo(ficha.status)) return {};
  const dadosVidaPorClasse = restaurarDadosVidaLongo(
    ficha.dadosVidaPorClasse,
    calcularNivelTotal(ficha),
    prioridadeDadosVida
  );
  return {
    status: {
      ...ficha.status,
      pvAtual: ficha.status.pvMax,
      pvTemp: 0,
      testesMorteSucessos: 0,
      testesMorteFalhas: 0,
    },
    dadosVidaPorClasse,
    dadosDeVidaUsados: totalDadosVidaUsados(dadosVidaPorClasse),
    espacosMagia: restaurarTodosEspacos(ficha.espacosMagia ?? {}),
    espacosMagiaPacto: restaurarMagiaPacto(ficha.espacosMagiaPacto),
    recursos: restaurarRecursos(ficha.recursos ?? [], "longo"),
    concentracao: null,
  };
}

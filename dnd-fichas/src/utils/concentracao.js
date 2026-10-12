// CD do teste de concentração: 10 ou metade do dano recebido, o que for
// maior (regra oficial do 5e — Livro do Jogador, cap. 10).
export function calcularCdConcentracao(danoRecebido) {
  return Math.max(10, Math.floor(danoRecebido / 2));
}

// Basic Rules 2014, Spellcasting/Concentration: incapacidade ou morte encerra
// concentração. Os nomes abaixo são condições explícitas; texto livre não é
// interpretado como uma regra diferente.
export function podeManterConcentracao(ficha) {
  if (Number(ficha.status?.pvAtual) <= 0) return false;
  return !(ficha.condicoesAtivas ?? []).some((condicao) => {
    const nome = String(condicao.nome ?? "").normalize("NFD").replace(/\p{M}/gu, "").trim().toLowerCase();
    return /^(incapacitad[oa]|inconsciente|paralisad[oa]|petrificad[oa]|atordoad[oa])\b/.test(nome);
  });
}

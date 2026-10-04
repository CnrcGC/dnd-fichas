import { calcularCdConcentracao } from "./concentracao";
import { estadoTestesMorte } from "./status";

export function avisoConcentracaoPorDano(concentracao, danoRecebido) {
  return concentracao && Number(danoRecebido) > 0
    ? { cd: calcularCdConcentracao(danoRecebido) }
    : null;
}

// RULEBOOK FACT: Livro do Jogador (2014), p. 205, "Concentração".
export function concentracaoTerminaPorStatus(status = {}) {
  return Number(status.pvAtual) <= 0 || estadoTestesMorte(status).morto;
}

// RULEBOOK FACT: Livro do Jogador (2014), p. 199, "Cura",
// "Morte Instantânea" e "Sofrendo Dano com 0 Pontos de Vida".
export function aplicarEfeitoPv(statusAtual, tipo, valor, { critico = false } = {}) {
  const status = { ...statusAtual };
  const quantidade = Math.max(0, Math.floor(Number(valor) || 0));
  const pvMax = Math.max(1, Number(status.pvMax) || 1);
  const pvAtual = Math.min(pvMax, Math.max(0, Number(status.pvAtual) || 0));
  const pvTemp = Math.max(0, Number(status.pvTemp) || 0);
  const mortoAntes = estadoTestesMorte(status).morto;

  if (tipo === "cura") {
    if (mortoAntes) {
      return {
        status,
        danoRecebido: 0,
        valorAplicado: 0,
        erro: "Uma criatura morta não recupera PV sem um efeito que restaure sua vida.",
      };
    }
    status.pvAtual = Math.min(pvMax, pvAtual + quantidade);
    if (status.pvAtual > 0) {
      status.testesMorteSucessos = 0;
      status.testesMorteFalhas = 0;
    }
    return { status, danoRecebido: 0, valorAplicado: status.pvAtual - pvAtual, erro: null };
  }

  const absorvido = Math.min(pvTemp, quantidade);
  const danoAposTemporarios = Math.max(0, quantidade - absorvido);
  const danoNosPv = Math.min(pvAtual, danoAposTemporarios);
  const excesso = Math.max(0, danoAposTemporarios - danoNosPv);
  status.pvTemp = pvTemp - absorvido;
  status.pvAtual = pvAtual - danoNosPv;
  let morteInstantanea = false;

  if (quantidade > 0 && !mortoAntes && pvAtual === 0) {
    status.testesMorteSucessos = 0;
    if (quantidade >= pvMax) {
      status.testesMorteFalhas = 3;
      morteInstantanea = true;
    } else {
      status.testesMorteFalhas = Math.min(
        3,
        Math.max(0, Number(status.testesMorteFalhas) || 0) + (critico ? 2 : 1)
      );
    }
  } else if (!mortoAntes && pvAtual > 0 && status.pvAtual === 0 && excesso >= pvMax) {
    status.testesMorteSucessos = 0;
    status.testesMorteFalhas = 3;
    morteInstantanea = true;
  }

  return {
    status,
    danoRecebido: quantidade,
    valorAplicado: absorvido + danoNosPv,
    morteInstantanea,
    erro: null,
  };
}

export function duracaoEmRodadas(duracao) {
  const texto = String(duracao ?? "").toLocaleLowerCase();
  const match = texto.match(/(\d+)\s*(rodada|minuto|hora|dia)/);
  if (!match) return texto.includes("instant") ? 1 : null;
  const quantidade = Number(match[1]);
  if (match[2] === "rodada") return quantidade;
  if (match[2] === "minuto") return quantidade * 10;
  if (match[2] === "hora") return quantidade * 600;
  return quantidade * 14400;
}

export function criarCondicaoAtiva(
  { nome, fonte, fonteId = null, duracao = "" },
  criarId = () => crypto.randomUUID()
) {
  return {
    id: criarId(),
    nome: String(nome ?? "").trim(),
    fonte: String(fonte ?? "").trim(),
    fonteId,
    duracao,
    rodadasRestantes: duracaoEmRodadas(duracao),
  };
}

export function adicionarCondicao(condicoes, novaCondicao) {
  const atuais = condicoes ?? [];
  const chave = `${novaCondicao.fonteId ?? novaCondicao.fonte}:${novaCondicao.nome}`;
  return [
    ...atuais.filter(
      (condicao) => `${condicao.fonteId ?? condicao.fonte}:${condicao.nome}` !== chave
    ),
    novaCondicao,
  ];
}

export function avancarCondicao(condicoes, condicaoId) {
  return (condicoes ?? []).flatMap((condicao) => {
    if (condicao.id !== condicaoId || condicao.rodadasRestantes === null) return [condicao];
    const restante = Math.max(0, Number(condicao.rodadasRestantes) - 1);
    return restante > 0 ? [{ ...condicao, rodadasRestantes: restante }] : [];
  });
}

export function normalizarCondicoes(condicoes) {
  return (Array.isArray(condicoes) ? condicoes : []).flatMap((condicao) => {
    if (!condicao || typeof condicao !== "object" || !String(condicao.nome ?? "").trim()) return [];
    const restanteOriginal = condicao.rodadasRestantes === undefined
      ? duracaoEmRodadas(condicao.duracao)
      : condicao.rodadasRestantes;
    const restante = restanteOriginal === null
      ? null
      : Math.max(0, Math.floor(Number(restanteOriginal) || 0));
    if (restante === 0) return [];
    return [{
      ...condicao,
      id: condicao.id ?? crypto.randomUUID(),
      nome: String(condicao.nome).trim(),
      fonte: String(condicao.fonte ?? "Manual").trim(),
      rodadasRestantes: restante,
    }];
  });
}

import { normalizarFicha } from "./ficha";

const CHAVE_ARMAZENAMENTO = "pilares-de-atlas:fichas";

function armazenamentoPadrao() {
  return typeof localStorage === "undefined" ? null : localStorage;
}

function motivoFalhaPersistencia(erro) {
  const nome = String(erro?.name ?? "");
  const codigo = Number(erro?.code);
  return nome === "QuotaExceededError" || nome === "NS_ERROR_DOM_QUOTA_REACHED" ||
    codigo === 22 || codigo === 1014
    ? "quota"
    : "indisponivel";
}

export function carregarFichas(armazenamento = armazenamentoPadrao()) {
  try {
    const bruto = armazenamento?.getItem(CHAVE_ARMAZENAMENTO);
    if (!bruto) return null;
    const fichas = JSON.parse(bruto);
    return Array.isArray(fichas) ? fichas.map(normalizarFicha) : null;
  } catch {
    // localStorage indisponível (modo privado, etc.) ou JSON corrompido —
    // segue sem persistência em vez de quebrar a aplicação.
    return null;
  }
}

export function salvarFichas(fichas, armazenamento = armazenamentoPadrao()) {
  try {
    if (!armazenamento || typeof armazenamento.setItem !== "function") {
      throw new Error("Armazenamento local indisponível");
    }
    armazenamento.setItem(CHAVE_ARMAZENAMENTO, JSON.stringify(fichas));
    return { ok: true, erro: null };
  } catch (erro) {
    const motivo = motivoFalhaPersistencia(erro);
    return {
      ok: false,
      erro: {
        motivo,
        mensagem: motivo === "quota"
          ? "O espaço de armazenamento deste navegador está cheio."
          : "O armazenamento local deste navegador está indisponível.",
      },
    };
  }
}

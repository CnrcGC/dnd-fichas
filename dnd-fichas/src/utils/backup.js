// Exportar: baixa a ficha inteira como um arquivo .json.
// Importar: lê um arquivo .json de volta e devolve o objeto pra virar
// uma ficha nova (uso pensado como cópia de segurança, não sincronização).

import { normalizarFicha } from "./ficha";

function pareceFichaDnd(dados) {
  if (!dados || typeof dados !== "object" || Array.isArray(dados)) {
    return false;
  }

  const possuiIdentidade =
    (typeof dados.id === "string" && dados.id.trim().length > 0) ||
    (typeof dados.nome === "string" && dados.nome.trim().length > 0);

  const possuiEstruturaDnd =
    Object.hasOwn(dados, "versaoFicha") ||
    Object.hasOwn(dados, "classeId") ||
    Object.hasOwn(dados, "nivel") ||
    (dados.atributos &&
      typeof dados.atributos === "object" &&
      !Array.isArray(dados.atributos)) ||
    (dados.status &&
      typeof dados.status === "object" &&
      !Array.isArray(dados.status)) ||
    Array.isArray(dados.inventario) ||
    Array.isArray(dados.habilidades) ||
    Array.isArray(dados.magias);

  return possuiIdentidade && possuiEstruturaDnd;
}

export function serializarFicha(ficha) {
  return JSON.stringify(ficha, null, 2);
}

export function importarFichaDeJson(conteudo) {
  const dados = JSON.parse(String(conteudo ?? ""));

  if (!pareceFichaDnd(dados)) {
    throw new Error("Arquivo inválido");
  }

  return normalizarFicha(dados);
}

export function exportarFicha(ficha) {
  const conteudo = serializarFicha(ficha, null, 2);
  const blob = new Blob([conteudo], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const nomeArquivo = `ficha-${(ficha.nome || "sem-nome")
    .toLowerCase()
    .replace(/\s+/g, "-")}.json`;

  const link = document.createElement("a");
  link.href = url;
  link.download = nomeArquivo;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function lerArquivoFicha(arquivo) {
  return new Promise((resolve, reject) => {
    const leitor = new FileReader();

    leitor.onload = () => {
      try {
        resolve(importarFichaDeJson(leitor.result));
      } catch {
        reject(new Error("Arquivo inválido"));
      }
    };

    leitor.onerror = () =>
      reject(new Error("Não foi possível ler o arquivo"));

    leitor.readAsText(arquivo);
  });
}
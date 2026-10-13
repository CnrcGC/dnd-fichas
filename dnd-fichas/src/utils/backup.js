// Exportar: baixa a ficha inteira como um arquivo .json.
// Importar: lê um arquivo .json de volta e devolve o objeto pra virar
// uma ficha nova (uso pensado como cópia de segurança, não sincronização).

import { normalizarFicha } from "./ficha";
import { DND5E_SCHEMA_VERSION } from "../systems/dnd5e/engine";

export function serializarFicha(ficha) {
  return JSON.stringify(ficha, null, 2);
}

export function importarFichaDeJson(conteudo) {
  const dados = JSON.parse(String(conteudo ?? ""));
  if (!dados || typeof dados !== "object" || Array.isArray(dados)) {
    throw new Error("Arquivo inválido");
  }
  if (dados.systemId && dados.systemId !== "dnd5e") {
    throw new Error("Este arquivo pertence a outro sistema. Importe uma ficha D&D 5e.");
  }
  if (Number(dados.versaoFicha) > DND5E_SCHEMA_VERSION) {
    throw new Error("Esta ficha foi criada em uma versão mais recente. Guarde o arquivo original e use uma versão compatível do aplicativo.");
  }
  if (typeof dados.nome !== "string" || !dados.nome.trim()) {
    throw new Error("O arquivo não contém o nome de uma ficha. Escolha um JSON exportado pelo D&D Fichas.");
  }
  return normalizarFicha(dados);
}

export function exportarFicha(ficha) {
  const conteudo = serializarFicha(ficha);
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
      } catch (error) {
        reject(error);
      }
    };
    leitor.onerror = () => reject(new Error("Não foi possível ler o arquivo"));
    leitor.readAsText(arquivo);
  });
}

export function criarHabilidadeVazia() {
  return {
    id: crypto.randomUUID(),
    nome: "",
    tipo: "personalizada",
    nivel: null,
    origemId: null,
    descricao: "",
  };
}

export function habilidadeClasseDisponivel(ficha, item) {
  const classe = [{ classeId: ficha?.classeId, nivel: ficha?.nivel }, ...(ficha?.classesSecundarias ?? [])]
    .find((entrada) => entrada.classeId === item.classeId);
  const atendido = Boolean(classe && Number(classe.nivel) >= Number(item.nivel));
  return { atendido, texto: `Requer nível ${item.nivel} nesta classe.` };
}

export function retratoLocalValido(valor) {
  return typeof valor === "string" && valor.length <= 400000 && /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(valor);
}

export async function prepararRetrato(arquivo) {
  if (!["image/png", "image/jpeg", "image/webp"].includes(arquivo.type)) {
    throw new Error("Escolha uma imagem PNG, JPEG ou WebP.");
  }
  if (arquivo.size > 5 * 1024 * 1024) throw new Error("A imagem deve ter até 5 MB. Escolha uma versão menor.");
  const url = URL.createObjectURL(arquivo);
  try {
    const imagem = new Image();
    imagem.src = url;
    await imagem.decode();
    const escala = Math.min(1, 512 / Math.max(imagem.naturalWidth, imagem.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(imagem.naturalWidth * escala));
    canvas.height = Math.max(1, Math.round(imagem.naturalHeight * escala));
    const contexto = canvas.getContext("2d");
    contexto.fillStyle = "#ffffff";
    contexto.fillRect(0, 0, canvas.width, canvas.height);
    contexto.drawImage(imagem, 0, 0, canvas.width, canvas.height);
    const retrato = canvas.toDataURL("image/jpeg", 0.8);
    if (!retratoLocalValido(retrato)) throw new Error("Não foi possível preparar a imagem. Escolha uma versão menor.");
    return retrato;
  } catch (erro) {
    if (erro.name === "EncodingError") throw new Error("Não foi possível abrir a imagem. Escolha outro arquivo PNG, JPEG ou WebP.", { cause: erro });
    throw erro;
  } finally {
    URL.revokeObjectURL(url);
  }
}

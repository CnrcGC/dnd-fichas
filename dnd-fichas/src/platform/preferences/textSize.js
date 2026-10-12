export const TEXT_SIZE_STORAGE_KEY = "rpg-platform:text-size";
export const TEXT_SIZES = Object.freeze(["normal", "large", "extra-large"]);

export function readTextSize({ root = document.documentElement, storage = localStorage } = {}) {
  try {
    const stored = storage.getItem(TEXT_SIZE_STORAGE_KEY);
    if (TEXT_SIZES.includes(stored)) return stored;
  } catch { /* Preferências bloqueadas não impedem o uso da aplicação. */ }
  return TEXT_SIZES.includes(root.dataset.textSize) ? root.dataset.textSize : "normal";
}

export function applyTextSize(size, { root = document.documentElement, storage = localStorage } = {}) {
  if (!TEXT_SIZES.includes(size)) throw new TypeError(`Tamanho de texto inválido: ${size}.`);
  root.dataset.textSize = size;
  try { storage.setItem(TEXT_SIZE_STORAGE_KEY, size); }
  catch { /* A ampliação continua disponível nesta sessão. */ }
  return size;
}

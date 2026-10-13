export const TEXT_SIZE_STORAGE_KEY = "rpg-platform:text-size";
export const TEXT_SIZES = Object.freeze(["normal", "large", "extra-large"]);
export const TEXT_SCALE_STORAGE_KEY = "rpg-platform:text-scale";
const PIXELS = { normal: 16, large: 20, "extra-large": 24 };

export function readTextScale(options = {}) {
  const { root = document.documentElement, storage = localStorage } = options;
  let pixels;
  try { pixels = Number(storage.getItem(TEXT_SCALE_STORAGE_KEY)); } catch { /* Session preference remains available. */ }
  if (Number.isInteger(pixels) && pixels >= 16 && pixels <= 28) return pixels;
  const sessionPixels = Number(root.dataset.textPixels);
  if (Number.isInteger(sessionPixels) && sessionPixels >= 16 && sessionPixels <= 28) return sessionPixels;
  return PIXELS[readTextSize({ root, storage })];
}

export function applyTextScale(pixels, { root = document.documentElement, storage = localStorage } = {}) {
  if (!Number.isInteger(pixels) || pixels < 16 || pixels > 28) throw new TypeError("Tamanho de texto inválido.");
  const size = Object.keys(PIXELS).find((key) => PIXELS[key] === pixels) ?? "custom";
  root.dataset.textPixels = String(pixels);
  root.dataset.textSize = size;
  root.style?.setProperty("--user-text-scale", `${pixels / 16 * 100}%`);
  try {
    storage.setItem(TEXT_SCALE_STORAGE_KEY, String(pixels));
    storage.setItem(TEXT_SIZE_STORAGE_KEY, size);
  } catch { /* The adjustment still works when storage is blocked. */ }
  return pixels;
}

export function readTextSize({ root = document.documentElement, storage = localStorage } = {}) {
  try {
    const stored = storage.getItem(TEXT_SIZE_STORAGE_KEY);
    if (TEXT_SIZES.includes(stored)) return stored;
  } catch { /* Preferências bloqueadas não impedem o uso da aplicação. */ }
  return TEXT_SIZES.includes(root.dataset.textSize) ? root.dataset.textSize : "normal";
}

export function applyTextSize(size, { root = document.documentElement, storage = localStorage } = {}) {
  if (!TEXT_SIZES.includes(size)) throw new TypeError(`Tamanho de texto inválido: ${size}.`);
  applyTextScale(PIXELS[size], { root, storage });
  return size;
}

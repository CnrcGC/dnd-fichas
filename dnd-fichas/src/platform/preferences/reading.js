export const READING_STORAGE_KEY = "rpg-platform:reading-preferences";
export const DEFAULT_READING = Object.freeze({ spacing: false, highContrast: false, underlineLinks: false, lightBrightness: 100 });

export function normalizeReading(value) {
  const input = value && typeof value === "object" ? value : {};
  return {
    spacing: input.spacing === true,
    highContrast: input.highContrast === true,
    underlineLinks: input.underlineLinks === true,
    lightBrightness: typeof input.lightBrightness === "number" && Number.isFinite(input.lightBrightness)
      ? Math.max(80, Math.min(100, Math.round(input.lightBrightness))) : 100,
  };
}

export function readReading({ root = document.documentElement, storage = localStorage } = {}) {
  try {
    const saved = storage.getItem(READING_STORAGE_KEY);
    if (saved) return normalizeReading(JSON.parse(saved));
  } catch { /* Invalid or blocked preferences do not prevent reading. */ }
  return normalizeReading({
    spacing: root.dataset.readingSpacing === "true",
    highContrast: root.dataset.highContrast === "true",
    underlineLinks: root.dataset.underlineLinks === "true",
    lightBrightness: Number(root.dataset.lightBrightness ?? 100),
  });
}

export function applyReading(value, { root = document.documentElement, storage = localStorage } = {}) {
  const preference = normalizeReading(value);
  root.dataset.readingSpacing = String(preference.spacing);
  root.dataset.highContrast = String(preference.highContrast);
  root.dataset.underlineLinks = String(preference.underlineLinks);
  root.dataset.lightBrightness = String(preference.lightBrightness);
  root.dataset.lightDimmed = String(preference.lightBrightness < 100);
  root.style?.setProperty("--light-brightness", `${preference.lightBrightness}%`);
  try { storage.setItem(READING_STORAGE_KEY, JSON.stringify(preference)); }
  catch { /* Changes remain usable in this session. */ }
  return preference;
}

export const THEME_STORAGE_KEY = "rpg-platform:theme";
export const THEMES = Object.freeze(["system", "light", "dark"]);

export function applyTheme(theme, { root = document.documentElement, storage = localStorage } = {}) {
  if (!THEMES.includes(theme)) throw new TypeError(`Tema inválido: ${theme}.`);
  if (theme === "system") {
    delete root.dataset.theme;
  } else {
    root.dataset.theme = theme;
  }
  try {
    if (theme === "system") storage.removeItem(THEME_STORAGE_KEY);
    else storage.setItem(THEME_STORAGE_KEY, theme);
  } catch { /* Theme remains available in this session when storage is blocked. */ }
  return theme;
}

export function readTheme({ root = document.documentElement, storage = localStorage } = {}) {
  let stored;
  try { stored = storage.getItem(THEME_STORAGE_KEY); }
  catch { /* Restore the session value below. */ }
  if (stored === "light" || stored === "dark") return stored;
  return root.dataset.theme === "light" || root.dataset.theme === "dark" ? root.dataset.theme : "system";
}


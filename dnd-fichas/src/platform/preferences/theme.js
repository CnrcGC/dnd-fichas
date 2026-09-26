export const THEME_STORAGE_KEY = "rpg-platform:theme";
export const THEMES = Object.freeze(["system", "light", "dark"]);

export function applyTheme(theme, { root = document.documentElement, storage = localStorage } = {}) {
  if (!THEMES.includes(theme)) throw new TypeError(`Tema inválido: ${theme}.`);
  if (theme === "system") {
    delete root.dataset.theme;
    storage.removeItem(THEME_STORAGE_KEY);
  } else {
    root.dataset.theme = theme;
    storage.setItem(THEME_STORAGE_KEY, theme);
  }
  return theme;
}

export function readTheme({ root = document.documentElement, storage = localStorage } = {}) {
  const stored = storage.getItem(THEME_STORAGE_KEY);
  if (stored === "light" || stored === "dark") return stored;
  return root.dataset.theme === "light" || root.dataset.theme === "dark" ? root.dataset.theme : "system";
}


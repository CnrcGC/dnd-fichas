import { useEffect, useState } from "react";
import { applyTheme, readTheme } from "../../platform/preferences/theme";
import Icon from "../icons/Icon";

export default function ThemeControl({ compact = false }) {
  const [theme, setTheme] = useState(() => readTheme());
  const [systemDark, setSystemDark] = useState(() => window.matchMedia("(prefers-color-scheme: dark)").matches);
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const update = () => setSystemDark(media.matches);
    const preferenceChanged = () => setTheme(readTheme());
    media.addEventListener("change", update);
    window.addEventListener("theme-preference-change", preferenceChanged);
    return () => {
      media.removeEventListener("change", update);
      window.removeEventListener("theme-preference-change", preferenceChanged);
    };
  }, []);
  const dark = theme === "dark" || (theme === "system" && systemDark);
  if (compact) return (
    <button className="grimoire-icon-button theme-toggle" type="button"
      aria-label={dark ? "Ativar tema claro" : "Ativar tema escuro"}
      title={dark ? "Ativar tema claro" : "Ativar tema escuro"}
      onClick={() => setTheme(applyTheme(dark ? "light" : "dark"))}>
      <Icon name={dark ? "rest" : "sun"} size={22} />
    </button>
  );
  return (
    <label className="theme-control">
      <span className="visually-hidden">Tema</span>
      <select value={theme} onChange={(event) => setTheme(applyTheme(event.target.value))} aria-label="Tema da interface">
        <option value="system">Tema do sistema</option>
        <option value="light">Tema claro</option>
        <option value="dark">Tema escuro</option>
      </select>
    </label>
  );
}


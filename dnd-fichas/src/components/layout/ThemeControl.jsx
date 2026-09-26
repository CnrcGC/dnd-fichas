import { useState } from "react";
import { applyTheme, readTheme } from "../../platform/preferences/theme";

export default function ThemeControl() {
  const [theme, setTheme] = useState(() => readTheme());
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


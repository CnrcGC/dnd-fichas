import { useState } from "react";
import { applyTextSize, readTextSize } from "../../platform/preferences/textSize";

export default function TextSizeControl() {
  const [size, setSize] = useState(() => readTextSize());
  return (
    <label className="theme-control">
      <span className="visually-hidden">Tamanho do texto</span>
      <select aria-label="Tamanho do texto" value={size} onChange={(event) => setSize(applyTextSize(event.target.value))}>
        <option value="normal">Texto normal</option>
        <option value="large">Texto grande</option>
        <option value="extra-large">Texto muito grande</option>
      </select>
    </label>
  );
}

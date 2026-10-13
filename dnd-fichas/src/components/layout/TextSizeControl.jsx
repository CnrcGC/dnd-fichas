import { useState } from "react";
import { applyTextSize, readTextSize, applyTextScale, readTextScale } from "../../platform/preferences/textSize";

export default function TextSizeControl({ describedBy, slider = false, id }) {
  const [size, setSize] = useState(() => readTextSize());
  const [pixels, setPixels] = useState(() => readTextScale());
  if (slider) return (
    <div className="preferences-range">
      <input id={id} type="range" min="16" max="28" step="1" value={pixels}
        aria-label="Tamanho do texto" aria-describedby={describedBy} aria-valuetext={`${pixels} pixels de base, ${pixels / 16 * 100}%`}
        onChange={(event) => setPixels(applyTextScale(Number(event.target.value)))} />
      <output aria-hidden="true">{pixels}px{pixels === 16 ? " · padrão" : ""}</output>
    </div>
  );
  const custom = ![16, 20, 24].includes(pixels);
  return (
    <label className="theme-control">
      <span className="visually-hidden">Tamanho do texto</span>
      <select aria-label="Tamanho do texto" aria-describedby={describedBy} value={custom ? "custom" : size} onChange={(event) => {
        setSize(applyTextSize(event.target.value));
        setPixels(readTextScale());
      }}>
        {custom && <option value="custom" disabled>Texto personalizado ({pixels}px)</option>}
        <option value="normal">Texto normal</option>
        <option value="large">Texto grande</option>
        <option value="extra-large">Texto muito grande</option>
      </select>
    </label>
  );
}

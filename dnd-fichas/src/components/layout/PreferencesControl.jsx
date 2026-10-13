import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Icon from "../icons/Icon";
import TextSizeControl from "./TextSizeControl";
import { useModalA11y } from "../../hooks/useModalA11y";
import { applyTheme } from "../../platform/preferences/theme";
import { applyTextScale } from "../../platform/preferences/textSize";
import { applyReading, readReading, DEFAULT_READING } from "../../platform/preferences/reading";
import "./PreferencesControl.css";

export default function PreferencesControl() {
  const [open, setOpen] = useState(false);
  const [reading, setReading] = useState(() => readReading());
  const [textControlKey, setTextControlKey] = useState(0);
  const updateReading = (patch) => setReading(applyReading({ ...reading, ...patch }));
  const triggerRef = useRef(null);
  const headerRef = useRef(null);
  const dialogRef = useModalA11y(open, () => setOpen(false), triggerRef);
  useEffect(() => {
    if (!open) return undefined;
    const dialog = dialogRef.current;
    const header = headerRef.current;
    const update = () => {
      dialog.style.setProperty("--preferences-header-height", `${header.getBoundingClientRect().height + 8}px`);
      const focused = document.activeElement;
      if (dialog.querySelector(".preferences-body").contains(focused) && focused.getBoundingClientRect().top < header.getBoundingClientRect().bottom) {
        focused.scrollIntoView({ block: "nearest", behavior: "instant" });
      }
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(header);
    return () => observer.disconnect();
  }, [open, dialogRef]);
  return <>
    <button ref={triggerRef} className="grimoire-icon-button" type="button"
      aria-label="Configurações de acessibilidade" title="Configurações de acessibilidade"
      aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen(true)}>
      <Icon name="settings" size={22} />
    </button>
    {open && createPortal(
      <div className="preferences-backdrop" onClick={(event) => {
        if (event.target === event.currentTarget) setOpen(false);
      }}>
        <section className="preferences-dialog" role="dialog" aria-modal="true" tabIndex={-1}
          aria-labelledby="preferences-title" aria-describedby="preferences-description" ref={dialogRef}>
          <header className="preferences-header" ref={headerRef}>
            <h2 id="preferences-title">Acessibilidade e aparência</h2>
            <button type="button" className="grimoire-icon-button" aria-label="Fechar configurações" onClick={() => setOpen(false)}>
              <Icon name="remove" size={22} />
            </button>
          </header>
          <div className="preferences-body">
            <p id="preferences-description">Ajustes para ler e usar seu grimório. Suas escolhas ficam salvas neste navegador.</p>
            <div className="preferences-row">
              <div><h3><label htmlFor="preference-text-size">Tamanho do texto</label></h3><p id="text-size-help">Amplie o texto de todas as telas. O zoom do navegador também continua disponível.</p></div>
              <TextSizeControl key={textControlKey} id="preference-text-size" slider describedBy="text-size-help" />
            </div>
            {[
              ["spacing", "Espaçamento de leitura", "Aumenta a distância entre linhas, letras e palavras para facilitar a leitura."],
              ["highContrast", "Alto contraste", "Reforça textos, bordas e estados dos controles nos temas claro e escuro."],
              ["underlineLinks", "Sublinhar todos os links", "Deixa os links identificáveis pelo sublinhado, além da cor."],
            ].map(([key, title, description]) => (
              <div className="preferences-row" key={key}>
                <div><h3><label htmlFor={`preference-${key}`}>{title}</label></h3><p id={`preference-${key}-help`}>{description}</p></div>
                <input id={`preference-${key}`} className="preferences-switch" type="checkbox" role="switch" checked={reading[key]}
                  aria-describedby={`preference-${key}-help`}
                  onChange={(event) => updateReading({ [key]: event.target.checked })} />
              </div>
            ))}
            <div className="preferences-row">
              <div><h3><label htmlFor="preference-brightness">Brilho do tema claro</label></h3><p id="light-brightness-help">Suaviza a luminosidade do papel entre 80% e 100%. Só afeta o tema claro.</p></div>
              <div className="preferences-range">
                <input id="preference-brightness" type="range" min="80" max="100" step="1" value={reading.lightBrightness}
                  aria-label="Brilho do tema claro" aria-describedby="light-brightness-help" aria-valuetext={`${reading.lightBrightness}%`}
                  onChange={(event) => updateReading({ lightBrightness: Number(event.target.value) })} />
                <output aria-hidden="true">{reading.lightBrightness}%{reading.lightBrightness === 100 ? " · padrão" : ""}</output>
              </div>
            </div>
            <div className="preferences-reset">
              <button type="button" className="preferences-system-theme" onClick={() => {
                setReading(applyReading(DEFAULT_READING));
                applyTextScale(16);
                applyTheme("system");
                window.dispatchEvent(new Event("theme-preference-change"));
                setTextControlKey((key) => key + 1);
              }}>Voltar ao padrão</button>
            </div>
            <div className="preferences-row">
              <div><h3>Tema da interface</h3><p>Use o botão de sol ou lua no cabeçalho para alternar entre claro e escuro.</p></div>
              <button type="button" className="preferences-system-theme" onClick={() => {
                applyTheme("system");
                window.dispatchEvent(new Event("theme-preference-change"));
              }}>Usar tema do sistema</button>
            </div>
            <p className="preferences-note">As animações respeitam a preferência de redução de movimento do seu sistema.</p>
          </div>
        </section>
      </div>, document.body
    )}
  </>;
}

import { useId, useRef, useState } from "react";
import { prepararRetrato, retratoLocalValido } from "../../utils/retrato";
import Icon from "../icons/Icon";
import "./RetratoPersonagem.css";

export default function RetratoPersonagem({ valor, nome, onChange, onProcessando }) {
  const id = useId();
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [aviso, setAviso] = useState("");
  const inputRef = useRef(null);
  const botaoRef = useRef(null);
  const temRetrato = retratoLocalValido(valor);
  async function carregar(evento) {
    const arquivo = evento.target.files?.[0];
    if (!arquivo) return;
    setErro(""); setAviso(""); setCarregando(true);
    onProcessando?.(true);
    try {
      onChange(await prepararRetrato(arquivo));
      setAviso("Imagem adicionada à ficha.");
    } catch (error) { setErro(error.message); }
    finally { setCarregando(false); onProcessando?.(false); if (inputRef.current) inputRef.current.value = ""; }
  }
  return <div className="personagem-retrato">
    <input ref={inputRef} id={id} className="visually-hidden" tabIndex={-1} type="file" accept="image/png,image/jpeg,image/webp" aria-label="Imagem do personagem" disabled={carregando} onChange={carregar} aria-describedby={`${id}-ajuda${erro ? ` ${id}-erro` : ""}`} aria-invalid={erro ? "true" : undefined} />
    <div className="personagem-retrato-quadro">
      <button ref={botaoRef} type="button" className="personagem-retrato-escolher" disabled={carregando} onClick={() => inputRef.current?.click()}
        aria-label={temRetrato ? "Alterar imagem do personagem" : "Adicionar imagem do personagem"}
        aria-describedby={`${id}-ajuda${erro ? ` ${id}-erro` : ""}`} aria-busy={carregando || undefined}>
        {temRetrato ? <img src={valor} alt={`Retrato de ${nome || "personagem"}`} width="144" height="144" /> : <span>Imagem</span>}
      </button>
      {valor && <button className="personagem-retrato-remover" type="button" aria-label="Remover imagem" title="Remover imagem" disabled={carregando} onClick={() => { onChange(""); setErro(""); setAviso("Imagem removida da ficha."); botaoRef.current?.focus(); }}><Icon name="remove" size={16} /></button>}
    </div>
    <p id={`${id}-ajuda`} className="personagem-retrato-ajuda">PNG, JPEG ou WebP · até 5 MB.</p>
    <p role="status">{carregando ? "Preparando imagem…" : aviso}</p>
    {erro && <p id={`${id}-erro`} role="alert">{erro}</p>}
  </div>;
}

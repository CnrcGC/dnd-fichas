import { useFichas } from "../../context/useFichas";
import "./AvisoPersistencia.css";
import Icon from "../icons/Icon";

export default function AvisoPersistencia() {
  const {
    falhaPersistencia,
    tentarSalvarNovamente,
    dispensarFalhaPersistencia,
    estadoSalvamento,
    avisoDispensado,
    hidratacao,
  } = useFichas();

  const textoEstado = estadoSalvamento === "salvando" ? "Salvando alterações…" : estadoSalvamento === "salvo" ? "Alterações salvas neste dispositivo." : estadoSalvamento === "falhou" ? "Há alterações não salvas." : "";

  return (
    <>
    <p className="persistencia-status" role="status" aria-live="polite" aria-atomic="true">{textoEstado}</p>
    {falhaPersistencia && !avisoDispensado && (
    <div className="aviso-persistencia" role="alert" aria-live="assertive">
      <div className="aviso-persistencia-texto">
        <strong>{hidratacao === "pronto" ? "Suas alterações não foram salvas." : "Não foi possível carregar suas fichas."}</strong>
        <span>
          {falhaPersistencia.mensagem} {hidratacao === "pronto" ? "Mantenha esta página aberta e exporte sua ficha como backup para não perder os dados." : "Os registros existentes não foram alterados. Tente novamente para abrir suas fichas."}
        </span>
      </div>
      <div className="aviso-persistencia-acoes">
        <button type="button" onClick={tentarSalvarNovamente} disabled={estadoSalvamento === "salvando" || hidratacao === "carregando"}>
          Tentar novamente
        </button>
        <button
          type="button"
          className="aviso-persistencia-dispensar"
          onClick={dispensarFalhaPersistencia}
          aria-label="Dispensar aviso de falha ao salvar"
        >
          <Icon name="remove" />
        </button>
      </div>
    </div>)}
    </>
  );
}

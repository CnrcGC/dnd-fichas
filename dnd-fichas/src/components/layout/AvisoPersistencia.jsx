import { useFichas } from "../../context/useFichas";
import "./AvisoPersistencia.css";
import Icon from "../icons/Icon";

export default function AvisoPersistencia() {
  const {
    falhaPersistencia,
    mensagemPersistencia,
    tentarSalvarNovamente,
    dispensarFalhaPersistencia,
  } = useFichas();

  return (
    <>
      <p
        className="visually-hidden"
        role="status"
        aria-live="polite"
        aria-atomic="true"
        data-persistence-status
      >
        {mensagemPersistencia}
      </p>
      {falhaPersistencia && (
        <div className="aviso-persistencia" role="alert" aria-live="assertive">
          <div className="aviso-persistencia-texto">
            <strong>Suas alterações não foram salvas.</strong>
            <span>
              {falhaPersistencia.mensagem} Mantenha esta página aberta e exporte sua
              ficha como backup para não perder os dados.
            </span>
          </div>
          <div className="aviso-persistencia-acoes">
            <button type="button" onClick={tentarSalvarNovamente}>
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
        </div>
      )}
    </>
  );
}

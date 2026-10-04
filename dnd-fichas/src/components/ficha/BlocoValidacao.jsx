import { useMemo } from "react";
import { validarFicha } from "../../utils/validacaoFicha";
import "./BlocoValidacao.css";

const CATEGORIAS = [
  { id: "erro", titulo: "Erros bloqueantes" },
  { id: "pendencia", titulo: "Escolhas pendentes" },
  { id: "aviso", titulo: "Avisos" },
];

const ROTULOS_SECAO = {
  identidade: "Identidade e níveis",
  combate: "Combate",
  habilidades: "Habilidades",
  pericias: "Perícias e proficiências",
  magias: "Magias",
  inventario: "Inventário",
  notas: "Notas",
};

export default function BlocoValidacao({
  ficha,
  atributosTotais,
  onMarcarPronta,
  onIrParaSecao,
}) {
  const resultado = useMemo(
    () => validarFicha(ficha, atributosTotais),
    [ficha, atributosTotais]
  );
  const prontaConfirmada = ficha.estadoFicha === "pronta" && resultado.pronta;

  return (
    <section className={prontaConfirmada ? "validacao-ficha is-pronta" : "validacao-ficha"}>
      <div className="validacao-cabecalho">
        <h3 className="bloco-titulo">Prontidão para a mesa</h3>
        <span
          className="validacao-status"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {prontaConfirmada ? "Ficha pronta" : resultado.pronta ? "Pode confirmar" : "Rascunho"}
        </span>
      </div>

      <p className="validacao-texto">
        {prontaConfirmada
          ? "A ficha foi confirmada e continua consistente."
          : resultado.pronta
            ? "Todas as escolhas obrigatórias estão completas. Avisos não impedem a confirmação."
            : "Você pode continuar salvando e editando este rascunho enquanto corrige os itens abaixo."}
      </p>

      {CATEGORIAS.map(({ id, titulo }) => {
        const itens = resultado.itens.filter((item) => item.categoria === id);
        if (itens.length === 0) return null;
        return (
          <div key={id} className={`validacao-grupo validacao-grupo--${id}`}>
            <p className="validacao-aviso-titulo">{titulo} ({itens.length})</p>
            <ul className="validacao-lista">
              {itens.map((item, indice) => (
                <li key={`${item.mensagem}-${indice}`}>
                  <span>{item.mensagem}</span>
                  <button
                    type="button"
                    className="validacao-ir"
                    onClick={() => onIrParaSecao?.(item.secao)}
                  >
                    Ir para {ROTULOS_SECAO[item.secao] ?? "a área"}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        );
      })}

      <button
        type="button"
        className="validacao-confirmar"
        disabled={!resultado.pronta || prontaConfirmada}
        onClick={() => onMarcarPronta?.()}
      >
        {prontaConfirmada ? "Ficha confirmada para a mesa" : "Marcar ficha como pronta"}
      </button>

      {!resultado.pronta && (
        <p className="validacao-texto">
          Erros e escolhas pendentes impedem a confirmação; avisos não impedem.
        </p>
      )}
    </section>
  );
}

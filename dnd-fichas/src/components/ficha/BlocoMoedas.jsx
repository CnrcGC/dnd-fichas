import "./BlocoMoedas.css";

const TIPOS_MOEDA = [
  { chave: "cobre", label: "PC", nomeCompleto: "Cobre" },
  { chave: "prata", label: "PP", nomeCompleto: "Prata" },
  { chave: "electro", label: "PE", nomeCompleto: "Electro" },
  { chave: "ouro", label: "PO", nomeCompleto: "Ouro" },
  { chave: "platina", label: "PL", nomeCompleto: "Platina" },
];

export default function BlocoMoedas({ moedas, onChangeMoedas }) {
  function handleChange(chave, evento) {
    const novoValor = Number(evento.target.value);
    onChangeMoedas(chave, Number.isNaN(novoValor) ? 0 : novoValor);
  }

  return (
    <section>
      <h2 className="bloco-titulo">Moedas</h2>
      <div className="moedas-grid">
        {TIPOS_MOEDA.map((tipo) => (
          <label
            key={tipo.chave}
            className="moeda-campo"
            title={tipo.nomeCompleto}
          >
            <span className="moeda-label">{tipo.label}</span>
            <input
              type="number"
              min="0"
              value={moedas[tipo.chave]}
              onChange={(evento) => handleChange(tipo.chave, evento)}
            />
          </label>
        ))}
      </div>
    </section>
  );
}

import { useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useFichas } from "../context/useFichas";
import { obterClasse } from "../data/classes";
import Icon from "../components/icons/Icon";
import { calcularNivelTotal } from "../utils/niveis";
import { exportarFicha, lerArquivoFicha } from "../utils/backup";
import "./Home.css";

export default function Home() {
  const { fichas, removerFicha, criarFicha } = useFichas();
  const [busca, setBusca] = useState("");
  const navigate = useNavigate();
  const inputArquivoRef = useRef(null);

  function handleClickImportar() {
    inputArquivoRef.current?.click();
  }

  async function handleArquivoSelecionado(evento) {
    const arquivo = evento.target.files[0];
    evento.target.value = ""; // permite escolher o mesmo arquivo de novo depois

    if (!arquivo) return;

    try {
      const dados = await lerArquivoFicha(arquivo);
      delete dados.id;
      const novaFicha = criarFicha(dados.nome, dados);
      if (novaFicha.normalizacaoNiveis?.ajustado) {
        window.alert(
          "A ficha foi importada, mas os níveis foram ajustados para respeitar o total máximo de 20. Confira as classes antes de usar."
        );
      }
      navigate(`/ficha/${novaFicha.id}`);
    } catch {
      window.alert(
        "Não foi possível importar esse arquivo. Confirma que é um .json exportado daqui."
      );
    }
  }

  const fichasFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return fichas;
    return fichas.filter((ficha) => ficha.nome.toLowerCase().includes(termo));
  }, [fichas, busca]);

  function handleRemover(ficha) {
    if (window.confirm(`Excluir a ficha de ${ficha.nome}?`)) {
      removerFicha(ficha.id);
    }
  }

  return (
    <div>
      <div className="home-marca">
        <img src="/logo-dd-fichas.png" alt="D&D Fichas" className="home-logo" />
      </div>
            <div className="home-cabecalho">
            <h1 className="home-titulo">Personagens D&D: {fichas.length}</h1>
            <div className="home-cabecalho-acoes">
              <button
                type="button"
                className="home-importar"
                onClick={handleClickImportar}
              >
                Importar ficha
              </button>
              <input
                type="file"
                accept="application/json"
                ref={inputArquivoRef}
                onChange={handleArquivoSelecionado}
                className="home-input-arquivo-escondido"
              />
              <Link to="/characters/new" className="home-nova-ficha">
                + Novo personagem
              </Link>
            </div>
          </div>

      <input
        type="text"
        className="home-busca"
        aria-label="Buscar ficha"
        placeholder="Buscar ficha..."
        value={busca}
        onChange={(evento) => setBusca(evento.target.value)}
      />

      {fichas.length === 0 ? (
        <p className="home-vazio">
          Você ainda não tem nenhuma ficha. <Link to="/characters/new">Crie a primeira</Link>.
        </p>
      ) : fichasFiltradas.length === 0 ? (
        <p className="home-vazio">Nenhuma ficha encontrada para "{busca}".</p>
      ) : (
        <div className="home-grid">
          {fichasFiltradas.map((ficha) => {
            const classe = obterClasse(ficha.classeId);
            return (
              <div key={ficha.id} className="ficha-card">
                                <button
                  type="button"
                  className="ficha-card-exportar"
                  onClick={() => exportarFicha(ficha)}
                  aria-label={`Exportar ${ficha.nome}`}
                  title="Exportar como backup (.json)"
                >
                  <Icon name="export" />
                </button>
                <button
                  type="button"
                  className="ficha-card-remover"
                  onClick={() => handleRemover(ficha)}
                  aria-label={`Excluir ${ficha.nome}`}
                  title="Excluir ficha"
                >
                  <Icon name="remove" />
                </button>
                <div className="ficha-card-corpo">
                  <span className="ficha-card-nome">{ficha.nome}</span>
                  <span className="ficha-card-classe">
                    {classe ? classe.nome : "Sem classe"} · Nível {calcularNivelTotal(ficha)}
                  </span>
                  <span className="ficha-card-data">
                    {ficha.criadoEm
                      ? `Criada em ${new Date(ficha.criadoEm).toLocaleDateString("pt-BR")}`
                      : "Ficha antiga"}
                  </span>
                </div>
                <Link to={`/ficha/${ficha.id}`} className="ficha-card-acessar">
                  Acessar ficha
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useFichas } from "../context/useFichas";
import { obterClasse } from "../data/classes";
import Icon from "../components/icons/Icon";
import { calcularNivelTotal } from "../utils/niveis";
import { exportarFicha, lerArquivoFicha } from "../utils/backup";
import "./Home.css";

export default function Home() {
  const { fichas, fichasExcluidas, removerFicha, restaurarFicha, criarFicha } = useFichas();
  const [busca, setBusca] = useState("");
  const [erroImportacao, setErroImportacao] = useState("");
  const navigate = useNavigate();
  const inputArquivoRef = useRef(null);
  const erroImportacaoRef = useRef(null);

  useEffect(() => {
    if (erroImportacao) erroImportacaoRef.current?.focus();
  }, [erroImportacao]);

  function handleClickImportar() {
    inputArquivoRef.current?.click();
  }

  async function handleArquivoSelecionado(evento) {
    const arquivo = evento.target.files[0];
    evento.target.value = ""; // permite escolher o mesmo arquivo de novo depois

    if (!arquivo) return;
    setErroImportacao("");

    try {
      const dados = await lerArquivoFicha(arquivo);
      delete dados.id;
      const novaFicha = criarFicha(dados.nome, dados);
      if (novaFicha.normalizacaoNiveis?.ajustado) {
        window.alert(
          "A ficha foi importada, mas os níveis foram ajustados para respeitar o total máximo de 20. Confira as classes antes de usar."
        );
      }
      navigate(`/dnd5e/characters/${encodeURIComponent(novaFicha.id)}`);
    } catch {
      setErroImportacao(
        "Não foi possível importar esse arquivo. Confirme que é um arquivo JSON exportado pelo aplicativo e tente novamente."
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
                aria-label="Selecionar arquivo JSON para importar"
                ref={inputArquivoRef}
                onChange={handleArquivoSelecionado}
                className="home-input-arquivo-escondido"
              />
              <Link to="/dnd5e/characters/new" className="home-nova-ficha">
                + Novo personagem
              </Link>
            </div>
          </div>

      {erroImportacao && (
        <p
          className="home-importacao-erro state-danger"
          role="alert"
          tabIndex={-1}
          ref={erroImportacaoRef}
        >
          {erroImportacao}
        </p>
      )}

      <input
        type="text"
        className="home-busca"
        aria-label="Buscar ficha"
        placeholder="Buscar ficha..."
        value={busca}
        onChange={(evento) => setBusca(evento.target.value)}
      />
      <p className="visually-hidden" role="status" aria-live="polite" aria-atomic="true">
        {fichasFiltradas.length} {fichasFiltradas.length === 1 ? "ficha encontrada" : "fichas encontradas"}.
      </p>

      {fichas.length === 0 ? (
        <p className="home-vazio">
          Você ainda não tem nenhuma ficha. <Link to="/dnd5e/characters/new">Crie a primeira</Link>.
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
                <Link to={`/dnd5e/characters/${encodeURIComponent(ficha.id)}`} className="ficha-card-acessar">
                  Acessar ficha
                </Link>
              </div>
            );
          })}
        </div>
      )}

      {fichasExcluidas.length > 0 && (
        <section className="home-lixeira" aria-labelledby="home-lixeira-titulo">
          <h2 id="home-lixeira-titulo">Lixeira</h2>
          <p>As fichas excluídas continuam salvas neste dispositivo e podem ser restauradas.</p>
          <ul>
            {fichasExcluidas.map((ficha) => (
              <li key={ficha.id}>
                <span>{ficha.nome}</span>
                <button type="button" onClick={() => restaurarFicha(ficha.id)}>
                  Restaurar
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

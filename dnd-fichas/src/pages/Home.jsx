import { useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useFichas } from "../context/useFichas";
import { obterClasse } from "../data/classes";
import Icon from "../components/icons/Icon";
import { calcularNivelTotal } from "../utils/niveis";
import { exportarFicha, lerArquivoFicha } from "../utils/backup";
import "./Home.css";

export default function Home() {
  const { fichas, fichasExcluidas, fichasProtegidas, removerFicha, restaurarFicha, criarFicha } = useFichas();
  const [busca, setBusca] = useState("");
  const [erroImportacao, setErroImportacao] = useState("");
  const navigate = useNavigate();
  const inputArquivoRef = useRef(null);

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
    } catch (error) {
      setErroImportacao(`Não foi possível importar: ${error instanceof SyntaxError ? "JSON inválido. Escolha um arquivo .json exportado pelo D&D Fichas." : error.message}`);
    }
  }

  const fichasFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return fichas;
    return fichas.filter((ficha) => ficha.nome.toLowerCase().includes(termo));
  }, [fichas, busca]);

  function handleRemover(ficha) {
    if (window.confirm(`Mover a ficha de ${ficha.nome} para a lixeira? Você poderá restaurá-la depois.`)) {
      removerFicha(ficha.id);
    }
  }

  return (
    <div>
      <div className="home-marca">
        <img src={`${import.meta.env.BASE_URL}logo-dd-fichas.png`} alt="D&D Fichas" className="home-logo" />
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
                aria-label="Arquivo JSON da ficha"
                aria-describedby={erroImportacao ? "home-erro-importacao" : undefined}
              />
              <Link to="/dnd5e/characters/new" className="home-nova-ficha">
                + Novo personagem
              </Link>
            </div>
          </div>
      {erroImportacao && <p id="home-erro-importacao" role="alert">{erroImportacao}</p>}

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
                <Link to={`/dnd5e/characters/${encodeURIComponent(ficha.id)}`} className="ficha-card-acessar" aria-label={`Acessar ficha de ${ficha.nome}`}>
                  Acessar ficha
                </Link>
              </div>
            );
          })}
        </div>
      )}

      {fichasProtegidas.length > 0 && (
        <section aria-labelledby="home-protegidas-titulo">
          <h2 id="home-protegidas-titulo">Registros preservados</h2>
          <p>Estas fichas precisam de uma versão compatível ou de recuperação. Seus dados originais não foram alterados.</p>
          <ul>{fichasProtegidas.map((ficha) => <li key={ficha.id}><Link to={`/characters/${encodeURIComponent(ficha.id)}`}>{ficha.nome} — verificar registro</Link></li>)}</ul>
        </section>
      )}
      {fichasExcluidas.length > 0 && (
        <section className="home-lixeira" aria-labelledby="home-lixeira-titulo">
          <h2 id="home-lixeira-titulo">Lixeira</h2>
          <p>As fichas excluídas continuam salvas neste dispositivo e podem ser restauradas.</p>
          <ul>
            {fichasExcluidas.map((ficha) => (
              <li key={ficha.id}>
                <span>{ficha.nome}</span>
                <button type="button" onClick={() => restaurarFicha(ficha.id)} aria-label={`Restaurar ${ficha.nome}`}>
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

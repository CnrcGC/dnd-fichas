import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useFichas } from "../context/useFichas";
import { obterClasse } from "../data/classes";
import Icon from "../components/icons/Icon";
import { calcularNivelTotal } from "../utils/niveis";
import { exportarFicha, lerArquivoFicha } from "../utils/backup";
import { retratoLocalValido } from "../utils/retrato";
import "./Home.css";

export default function Home() {
  const { fichas, fichasExcluidas, fichasProtegidas, removerFicha, restaurarFicha, excluirFichaPermanentemente, criarFicha } = useFichas();
  const [busca, setBusca] = useState("");
  const [erroImportacao, setErroImportacao] = useState("");
  const [exclusaoEmCurso, setExclusaoEmCurso] = useState(null);
  const [erroLixeira, setErroLixeira] = useState("");
  const [avisoLixeira, setAvisoLixeira] = useState("");
  const tituloRef = useRef(null);
  const tituloLixeiraRef = useRef(null);
  const erroLixeiraRef = useRef(null);
  useEffect(() => { if (erroLixeira) erroLixeiraRef.current?.focus(); }, [erroLixeira]);
  const navigate = useNavigate();
  const inputArquivoRef = useRef(null);
  const erroImportacaoRef = useRef(null);
  useEffect(() => { if (erroImportacao) erroImportacaoRef.current?.focus(); }, [erroImportacao]);

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

  async function handleExcluirPermanentemente(ficha) {
    if (exclusaoEmCurso || !window.confirm(`Excluir permanentemente a ficha de ${ficha.nome}?\n\nEla sairá da lixeira e não poderá ser restaurada por ela. Esta ação não pode ser desfeita. Arquivos JSON exportados não serão apagados.`)) return;
    setExclusaoEmCurso(ficha.id);
    setErroLixeira("");
    setAvisoLixeira("");
    try {
      await excluirFichaPermanentemente(ficha.id);
      setAvisoLixeira(`A ficha de ${ficha.nome} foi excluída permanentemente deste navegador.`);
      requestAnimationFrame(() => (tituloLixeiraRef.current ?? tituloRef.current)?.focus());
    } catch {
      setErroLixeira(`Não foi possível excluir a ficha de ${ficha.nome}. Ela permanece na lixeira. Tente novamente; se outra aba a alterou, recarregue a biblioteca.`);
    } finally { setExclusaoEmCurso(null); }
  }

  return (
    <div className="home-grimoire">
      <div className="home-cabecalho grimoire-pagina">
        <div className="home-abertura">
          <p className="home-sobretitulo">Biblioteca de aventuras</p>
          <h1 className="home-titulo" ref={tituloRef} tabIndex={-1}>Seus personagens</h1>
          <p className="home-subtitulo">Um lugar para suas próximas aventuras.</p>
        </div>
        <div className="home-selo" aria-hidden="true">
          <Icon name="book" size={64} />
          <span>D&D 5e</span>
        </div>
      </div>

      <div className="home-ferramentas">
        <label className="home-busca-label">
          <span>Buscar ficha</span>
          <input
            type="search"
            className="home-busca grimoire-campo"
            aria-label="Buscar ficha"
            placeholder="Nome do personagem"
            value={busca}
            onChange={(evento) => setBusca(evento.target.value)}
          />
        </label>
        <div className="home-cabecalho-acoes">
          <button type="button" className="home-importar" onClick={handleClickImportar}>
            <Icon name="import" />
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
      {erroImportacao && <p className="home-erro grimoire-aviso" id="home-erro-importacao" role="alert" ref={erroImportacaoRef} tabIndex={-1}>{erroImportacao}</p>}
      {erroLixeira && <p className="home-erro grimoire-aviso" role="alert" ref={erroLixeiraRef} tabIndex={-1}>{erroLixeira}</p>}
      <p className="visually-hidden" role="status" aria-live="polite" aria-atomic="true">{avisoLixeira}</p>

      <div className="home-colecao-cabecalho">
        <h2 className="home-colecao-titulo">Sua coleção</h2>
        <p className="home-contagem">{fichas.length} {fichas.length === 1 ? "personagem" : "personagens"}</p>
      </div>

      {fichas.length === 0 ? (
        <section className="home-vazio grimoire-pagina" aria-labelledby="home-vazio-titulo">
          <span className="home-vazio-simbolo"><Icon name="book" size={40} /></span>
          <h3 id="home-vazio-titulo">Sua próxima aventura começa aqui</h3>
          <p>Você ainda não tem nenhuma ficha.</p>
          <p>Crie seu primeiro personagem ou importe uma ficha.</p>
          <Link className="home-vazio-criar" to="/dnd5e/characters/new">Crie a primeira <Icon name="chevron" /></Link>
        </section>
      ) : fichasFiltradas.length === 0 ? (
        <p className="home-sem-resultados grimoire-pagina">Nenhuma ficha encontrada para "{busca}".</p>
      ) : (
        <div className="home-grid">
          {fichasFiltradas.map((ficha) => {
            const classe = obterClasse(ficha.classeId);
            return (
              <article key={ficha.id} className="ficha-card grimoire-capa">
                <div className="ficha-card-cabecalho">
                  <span className="ficha-card-nivel">Nível {calcularNivelTotal(ficha)}</span>
                  <div className="ficha-card-acoes">
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
                      title="Mover para a lixeira"
                    >
                      <Icon name="remove" />
                    </button>
                  </div>
                </div>
                <div className="ficha-card-corpo">
                  {retratoLocalValido(ficha.retrato) ? <img className="ficha-card-retrato" src={ficha.retrato} alt={`Retrato de ${ficha.nome || "personagem"}`} width="160" height="160" loading="lazy" decoding="async" /> : <span className="ficha-card-simbolo">
                    <Icon name={["mago", "feiticeiro", "bruxo"].includes(ficha.classeId) ? "spell" : ["guerreiro", "paladino", "clerigo"].includes(ficha.classeId) ? "shield" : "book"} size={32} />
                  </span>}
                  <h3 className="ficha-card-nome">{ficha.nome}</h3>
                  <span className="ficha-card-classe">
                    {classe ? classe.nome : "Sem classe"}
                  </span>
                  <span className="ficha-card-data">
                    {ficha.criadoEm
                      ? `Criada em ${new Date(ficha.criadoEm).toLocaleDateString("pt-BR")}`
                      : "Ficha antiga"}
                  </span>
                </div>
                <Link to={`/dnd5e/characters/${encodeURIComponent(ficha.id)}`} className="ficha-card-acessar" aria-label={`Acessar ficha de ${ficha.nome}`}>
                  Acessar ficha
                  <Icon name="chevron" />
                </Link>
              </article>
            );
          })}
        </div>
      )}

      {fichasProtegidas.length > 0 && (
        <section className="home-protegidas grimoire-aviso" aria-labelledby="home-protegidas-titulo">
          <h2 id="home-protegidas-titulo">Registros preservados</h2>
          <p>Estas fichas precisam de uma versão compatível ou de recuperação. Seus dados originais não foram alterados.</p>
          <ul>{fichasProtegidas.map((ficha) => <li key={ficha.id}><Link to={`/characters/${encodeURIComponent(ficha.id)}`}>{ficha.nome} — verificar registro</Link></li>)}</ul>
        </section>
      )}
      {fichasExcluidas.length > 0 && (
        <section className="home-lixeira grimoire-pagina" aria-labelledby="home-lixeira-titulo">
          <h2 id="home-lixeira-titulo" ref={tituloLixeiraRef} tabIndex={-1}>Lixeira</h2>
          <p>As fichas excluídas continuam salvas neste dispositivo e podem ser restauradas.</p>
          <ul>
            {fichasExcluidas.map((ficha) => (
              <li key={ficha.id}>
                <span>{ficha.nome}</span>
                <div className="home-lixeira-acoes">
                <button type="button" disabled={Boolean(exclusaoEmCurso)} onClick={() => restaurarFicha(ficha.id)} aria-label={`Restaurar ${ficha.nome}`}>
                  Restaurar
                </button>
                <button type="button" className="home-lixeira-excluir" disabled={Boolean(exclusaoEmCurso)} onClick={() => handleExcluirPermanentemente(ficha)} aria-label={`Excluir permanentemente ${ficha.nome}`}>
                  {exclusaoEmCurso === ficha.id ? "Excluindo…" : "Excluir permanentemente"}
                </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

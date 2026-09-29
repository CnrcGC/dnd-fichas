import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { pilaresCharacterStore } from "./characterStore";
import PilaresSchoolIdentity from "./PilaresSchoolIdentity";
import "./PilaresLibrary.css";

const initialState = { status: "loading", characters: [], deleted: [], error: null };

async function readLibrary() {
  await pilaresCharacterStore.initialize();
  const [characters, deleted] = await Promise.all([
    pilaresCharacterStore.list(),
    pilaresCharacterStore.listDeleted(),
  ]);
  return { characters, deleted };
}

export default function PilaresLibrary() {
  const [state, setState] = useState(initialState);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setState((current) => ({ ...current, status: "loading", error: null }));
    try {
      const { characters, deleted } = await readLibrary();
      setState({ status: "ready", characters, deleted, error: null });
    } catch (error) {
      setState({ status: "error", characters: [], deleted: [], error });
    }
  }, []);

  useEffect(() => {
    let active = true;
    readLibrary()
      .then(({ characters, deleted }) => active && setState({ status: "ready", characters, deleted, error: null }))
      .catch((error) => active && setState({ status: "error", characters: [], deleted: [], error }));
    return () => { active = false; };
  }, []);

  async function moveToTrash(character) {
    if (!window.confirm(`Mover a ficha de ${character.displayName} para a lixeira?`)) return;
    try {
      await pilaresCharacterStore.remove(character.id);
      setMessage(`${character.displayName} foi movido para a lixeira.`);
      await load();
    } catch (error) {
      setMessage(`Não foi possível excluir a ficha: ${error.message}`);
    }
  }

  async function restore(character) {
    try {
      await pilaresCharacterStore.restore(character.id);
      setMessage(`${character.displayName} foi restaurado.`);
      await load();
    } catch (error) {
      setMessage(`Não foi possível restaurar a ficha: ${error.message}`);
    }
  }

  return (
    <section className="pilares-library" aria-labelledby="pilares-library-title">
      <header className="pilares-library__header">
        <div>
          <p className="pilares-library__eyebrow">Pilares de Atlas</p>
          <h1 id="pilares-library-title">Personagens de Pilares de Atlas</h1>
        </div>
        <span className="pilares-library__count" aria-label={`${state.characters.length} personagens`}>
          {state.characters.length}
        </span>
        <Link className="pilares-library__create" to="/yusong/characters/new">Novo personagem</Link>
      </header>

      {message && <p className="pilares-library__message" role="status">{message}</p>}

      {state.status === "loading" && (
        <p className="pilares-library__state" role="status">Carregando personagens salvos neste dispositivo…</p>
      )}

      {state.status === "error" && (
        <div className="pilares-library__error" role="alert">
          <h2>Não foi possível abrir a biblioteca</h2>
          <p>{state.error?.message ?? "A persistência local falhou. Seus dados legados não foram apagados."}</p>
          <button type="button" onClick={load}>Tentar novamente</button>
        </div>
      )}

      {state.status === "ready" && state.characters.length === 0 && (
        <div className="pilares-library__empty">
          <h2>Nenhum personagem salvo</h2>
          <p><Link to="/yusong/characters/new">Crie o primeiro personagem</Link> para começar.</p>
        </div>
      )}

      {state.status === "ready" && state.characters.length > 0 && (
        <ul className="pilares-library__grid" aria-label="Personagens salvos">
          {state.characters.map((character) => (
            <li className="pilares-library__card pilares-school-theme" data-school={character.school || "custom"} key={character.id}>
              <div className="pilares-library__card-heading">
                <h2>{character.displayName}</h2>
                {character.wasLegacyActive && <span className="pilares-library__active">Último ativo</span>}
              </div>
              <p className="pilares-library__level">Nível {character.level}</p>
              <PilaresSchoolIdentity schoolId={character.school} compact />
              <div className="pilares-library__actions">
                <Link to={`/yusong/characters/${encodeURIComponent(character.id)}`}>Abrir ficha</Link>
                <button type="button" onClick={() => moveToTrash(character)}>Mover para lixeira</button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {state.status === "ready" && state.deleted.length > 0 && (
        <section className="pilares-library__trash" aria-labelledby="pilares-trash-title">
          <h2 id="pilares-trash-title">Lixeira</h2>
          <p>As fichas continuam salvas neste dispositivo e podem ser restauradas.</p>
          <ul>
            {state.deleted.map((character) => (
              <li key={character.id}>
                <span>{character.displayName}</span>
                <button type="button" onClick={() => restore(character)}>Restaurar</button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </section>
  );
}

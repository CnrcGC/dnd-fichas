import { useEffect, useRef, useState } from "react";
import { criarFichaVazia, normalizarFicha } from "../utils/ficha";
import { sincronizarFichaComSubclasses } from "../utils/subclassesFicha";
import { reconciliarEstadoProntidao } from "../utils/validacaoFicha";
import { obterRaca } from "../data/racas";
import { FichasContext } from "./fichasContext";
import { createDnd5eCharacterStore } from "../systems/dnd5e/characterStore";

function falhaDoRepositorio(error) {
  const quota = error?.name === "QuotaExceededError";
  return {
    motivo: quota ? "quota" : "indisponivel",
    mensagem: quota ? "O espaço de armazenamento deste navegador está cheio." : "Não foi possível confirmar a gravação no armazenamento deste navegador.",
    codigo: error?.code ?? "durable-storage-failed",
  };
}

export function FichasProvider({ children, characterStore: injectedStore = null }) {
  const [characterStore] = useState(() => injectedStore ?? createDnd5eCharacterStore());
  const operacaoRef = useRef(0);
  const alteracoesPendentesRef = useRef(false);
  const sincronizarFicha = (ficha) => {
    const normalizada = sincronizarFichaComSubclasses(normalizarFicha(ficha));
    const raca = obterRaca(normalizada.racaId, normalizada.subracaId);
    const bonus = { ...(raca?.bonusAtributos ?? {}) };
    for (const atributo of normalizada.bonusRacialEscolhido ?? []) {
      if (atributo) bonus[atributo] = (bonus[atributo] ?? 0) + 1;
    }
    const atributosTotais = Object.fromEntries(Object.entries(normalizada.atributos ?? {}).map(([chave, valor]) => [chave, Number(valor) + (bonus[chave] ?? 0)]));
    return reconciliarEstadoProntidao(normalizada, atributosTotais);
  };

  const [fichas, setFichas] = useState([]);
  const fichasRef = useRef([]);
  const [fichasExcluidas, setFichasExcluidas] = useState([]);
  const [fichasProtegidas, setFichasProtegidas] = useState([]);
  const [hidratacao, setHidratacao] = useState("carregando");
  const [tentativaHidratacao, setTentativaHidratacao] = useState(0);
  const [estadoSalvamento, setEstadoSalvamento] = useState("inicial");
  const [falhaPersistencia, setFalhaPersistencia] = useState(null);
  const [avisoDispensado, setAvisoDispensado] = useState(false);

  useEffect(() => {
    let active = true;
    characterStore.initialize()
      .then(async (fichasDuraveis) => {
        const [excluidas, protegidas] = await Promise.all([characterStore.listDeleted(), characterStore.listProtected?.() ?? []]);
        if (!active) return;
        const sincronizadas = fichasDuraveis.map(sincronizarFicha);
        fichasRef.current = sincronizadas;
        setFichas(sincronizadas);
        setFichasExcluidas(excluidas);
        setFichasProtegidas(protegidas);
        setFalhaPersistencia(null);
        setHidratacao("pronto");
      })
      .catch((error) => {
        if (active) {
          setHidratacao("falhou");
          setFalhaPersistencia({ ...falhaDoRepositorio(error), ocorridoEm: Date.now() });
        }
      });
    return () => { active = false; };
  }, [characterStore, tentativaHidratacao]);

  useEffect(() => {
    function protegerAlteracoes(event) {
      if (!alteracoesPendentesRef.current) return;
      event.preventDefault();
      event.returnValue = "";
    }
    window.addEventListener("beforeunload", protegerAlteracoes);
    return () => window.removeEventListener("beforeunload", protegerAlteracoes);
  }, []);

  function registrarResultadoPersistencia(resultado, { depoisSalvar, aoFalhar } = {}) {
    const operacao = ++operacaoRef.current;
    alteracoesPendentesRef.current = true;
    setEstadoSalvamento("salvando");
    setAvisoDispensado(false);
    const confirmado = resultado.ok ? (resultado.durable ?? Promise.resolve()) : Promise.reject(resultado.erro);
    return confirmado.then(async () => {
      await depoisSalvar?.();
      if (operacao !== operacaoRef.current) return true;
      alteracoesPendentesRef.current = false;
      setFalhaPersistencia(null);
      setEstadoSalvamento("salvo");
      return true;
    }).catch((error) => {
      aoFalhar?.();
      if (operacao === operacaoRef.current) {
        setEstadoSalvamento("falhou");
        setFalhaPersistencia({ ...falhaDoRepositorio(error), ocorridoEm: Date.now() });
      }
      return false;
    });
  }

  function substituirFichas(proximasFichas) {
    if (hidratacao !== "pronto") throw new Error("Aguarde o carregamento das fichas antes de editar.");
    fichasRef.current = proximasFichas;
    setFichas(proximasFichas);
    const resultado = characterStore.save(proximasFichas);
    registrarResultadoPersistencia(resultado);
  }

  function tentarSalvarNovamente() {
    if (hidratacao !== "pronto") {
      setHidratacao("carregando");
      setTentativaHidratacao((atual) => atual + 1);
      return;
    }
    const resultado = characterStore.save(fichasRef.current);
    return registrarResultadoPersistencia(resultado);
  }

  function dispensarFalhaPersistencia() {
    setAvisoDispensado(true);
  }

  function criarFicha(nome, overrides = {}) {
    const novaFicha = sincronizarFicha({ ...criarFichaVazia(nome), ...overrides });
    substituirFichas([...fichasRef.current, novaFicha]);
    return novaFicha;
  }

  function atualizarFicha(id, atualizador) {
    substituirFichas(
      fichasRef.current.map((ficha) =>
        ficha.id === id
          ? sincronizarFicha({ ...ficha, ...atualizador(ficha) })
          : ficha
      )
    );
  }

  function removerFicha(id) {
    if (hidratacao !== "pronto") return;
    const removida = fichasRef.current.find((ficha) => ficha.id === id);
    const proximas = fichasRef.current.filter((ficha) => ficha.id !== id);
    fichasRef.current = proximas;
    setFichas(proximas);
    const resultado = characterStore.remove(id);
    if (removida) setFichasExcluidas((atuais) => [{ id, nome: removida.nome, deletedAt: new Date().toISOString() }, ...atuais.filter((ficha) => ficha.id !== id)]);
    registrarResultadoPersistencia(resultado, { aoFalhar: () => {
      if (removida) {
        fichasRef.current = [...fichasRef.current, removida];
        setFichas(fichasRef.current);
        setFichasExcluidas((atuais) => atuais.filter((ficha) => ficha.id !== id));
      }
    } });
  }

  function restaurarFicha(id) {
    if (hidratacao !== "pronto") return;
    const resultado = characterStore.restore(id);
    registrarResultadoPersistencia(resultado, { depoisSalvar: async () => {
        const [duraveis, excluidas] = await Promise.all([characterStore.listDurable(), characterStore.listDeleted()]);
        const restaurada = duraveis.find((ficha) => ficha.id === id);
        if (restaurada && !fichasRef.current.some((ficha) => ficha.id === id)) {
          fichasRef.current = [...fichasRef.current, sincronizarFicha(restaurada)];
          setFichas(fichasRef.current);
        }
        setFichasExcluidas(excluidas);
    } });
  }

  function obterFicha(id) {
    return fichas.find((ficha) => ficha.id === id);
  }

  const valor = {
    fichas,
    criarFicha,
    atualizarFicha,
    removerFicha,
    restaurarFicha,
    fichasExcluidas,
    fichasProtegidas,
    hidratacao,
    estadoSalvamento,
    avisoDispensado,
    obterFicha,
    falhaPersistencia,
    tentarSalvarNovamente,
    dispensarFalhaPersistencia,
  };

  return (
    <FichasContext.Provider value={valor}>{children}</FichasContext.Provider>
  );
}

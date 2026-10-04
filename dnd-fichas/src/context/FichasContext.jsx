import { useEffect, useRef, useState } from "react";
import { criarFichaVazia, normalizarFicha } from "../utils/ficha";
import { sincronizarFichaComSubclasses } from "../utils/subclassesFicha";
import { reconciliarEstadoProntidao } from "../utils/validacaoFicha";
import { obterBonusRaciais } from "../data/racas";
import { FichasContext } from "./fichasContext";
import { createDnd5eCharacterStore } from "../systems/dnd5e/characterStore";

function falhaDoRepositorio(error) {
  return {
    motivo: "indisponivel",
    mensagem: "O armazenamento durável deste navegador está indisponível.",
    codigo: error?.code ?? "durable-storage-failed",
  };
}

export function FichasProvider({ children, characterStore: injectedStore = null }) {
  const [characterStore] = useState(() => injectedStore ?? createDnd5eCharacterStore());
  const modificadoAntesHidratacaoRef = useRef(false);
  const sincronizarFicha = (ficha) => {
    const normalizada = sincronizarFichaComSubclasses(normalizarFicha(ficha));
    const bonus = obterBonusRaciais(
      normalizada.racaId,
      normalizada.subracaId,
      normalizada.bonusRacialEscolhido
    );
    const atributosTotais = Object.fromEntries(Object.entries(normalizada.atributos ?? {}).map(([chave, valor]) => [chave, Number(valor) + (bonus[chave] ?? 0)]));
    return reconciliarEstadoProntidao(normalizada, atributosTotais);
  };

  const [estadoInicial] = useState(() => {
    const fichasCarregadas = characterStore.load().map(sincronizarFicha);
    return {
      fichas: fichasCarregadas,
      falhaPersistencia: null,
    };
  });
  const [fichas, setFichas] = useState(estadoInicial.fichas);
  const fichasRef = useRef(estadoInicial.fichas);
  const [fichasExcluidas, setFichasExcluidas] = useState([]);
  const [falhaPersistencia, setFalhaPersistencia] = useState(
    estadoInicial.falhaPersistencia
  );
  const [mensagemPersistencia, setMensagemPersistencia] = useState("");
  const operacaoPersistenciaRef = useRef(0);
  const confirmacaoPersistenciaRef = useRef(null);

  useEffect(() => () => clearTimeout(confirmacaoPersistenciaRef.current), []);

  function iniciarFeedbackPersistencia() {
    operacaoPersistenciaRef.current += 1;
    clearTimeout(confirmacaoPersistenciaRef.current);
    setMensagemPersistencia("");
    return operacaoPersistenciaRef.current;
  }

  function confirmarPersistencia(operacao) {
    if (operacao !== operacaoPersistenciaRef.current) return;
    clearTimeout(confirmacaoPersistenciaRef.current);
    confirmacaoPersistenciaRef.current = setTimeout(() => {
      if (operacao === operacaoPersistenciaRef.current) {
        setMensagemPersistencia("Alterações salvas neste dispositivo.");
      }
    }, 800);
  }

  function concluirPersistencia(operacao) {
    if (operacao !== operacaoPersistenciaRef.current) return;
    setFalhaPersistencia(null);
    confirmarPersistencia(operacao);
  }

  function registrarFalhaPersistencia(error, operacao) {
    if (operacao !== operacaoPersistenciaRef.current) return;
    clearTimeout(confirmacaoPersistenciaRef.current);
    setMensagemPersistencia("");
    setFalhaPersistencia({ ...falhaDoRepositorio(error), ocorridoEm: Date.now() });
  }

  useEffect(() => {
    let active = true;
    characterStore.initialize()
      .then(async (fichasDuraveis) => {
        if (!active) return;
        if (!modificadoAntesHidratacaoRef.current) {
          const sincronizadas = fichasDuraveis.map(sincronizarFicha);
          fichasRef.current = sincronizadas;
          setFichas(sincronizadas);
        }
        setFichasExcluidas(await characterStore.listDeleted());
      })
      .catch((error) => {
        if (active) setFalhaPersistencia({ ...falhaDoRepositorio(error), ocorridoEm: Date.now() });
      });
    return () => { active = false; };
  }, [characterStore]);

  function registrarResultadoPersistencia(resultado) {
    if (resultado.ok) {
      if (!resultado.durable) setFalhaPersistencia(null);
      return true;
    }
    setFalhaPersistencia({
      ...resultado.erro,
      ocorridoEm: Date.now(),
    });
    return false;
  }

  function substituirFichas(proximasFichas) {
    modificadoAntesHidratacaoRef.current = true;
    fichasRef.current = proximasFichas;
    setFichas(proximasFichas);
    const operacao = iniciarFeedbackPersistencia();
    const resultado = characterStore.save(proximasFichas);
    registrarResultadoPersistencia(resultado);
    resultado.durable?.then(
      () => concluirPersistencia(operacao),
      (error) => registrarFalhaPersistencia(error, operacao),
    );
    if (resultado.ok && !resultado.durable) confirmarPersistencia(operacao);
  }

  function tentarSalvarNovamente() {
    const operacao = iniciarFeedbackPersistencia();
    const resultado = characterStore.save(fichasRef.current);
    const registrado = registrarResultadoPersistencia(resultado);
    resultado.durable?.then(
      () => concluirPersistencia(operacao),
      (error) => registrarFalhaPersistencia(error, operacao),
    );
    if (resultado.ok && !resultado.durable) confirmarPersistencia(operacao);
    return registrado;
  }

  function dispensarFalhaPersistencia() {
    setFalhaPersistencia(null);
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
    modificadoAntesHidratacaoRef.current = true;
    const removida = fichasRef.current.find((ficha) => ficha.id === id);
    const proximas = fichasRef.current.filter((ficha) => ficha.id !== id);
    fichasRef.current = proximas;
    setFichas(proximas);
    const operacao = iniciarFeedbackPersistencia();
    const resultado = characterStore.remove(id);
    registrarResultadoPersistencia(resultado);
    if (removida) setFichasExcluidas((atuais) => [{ id, nome: removida.nome, deletedAt: new Date().toISOString() }, ...atuais.filter((ficha) => ficha.id !== id)]);
    resultado.durable?.then(
      () => concluirPersistencia(operacao),
      (error) => {
        if (removida) {
          fichasRef.current = [...fichasRef.current, removida];
          setFichas(fichasRef.current);
          setFichasExcluidas((atuais) => atuais.filter((ficha) => ficha.id !== id));
        }
        registrarFalhaPersistencia(error, operacao);
      },
    );
    if (resultado.ok && !resultado.durable) concluirPersistencia(operacao);
  }

  function restaurarFicha(id) {
    const operacao = iniciarFeedbackPersistencia();
    const resultado = characterStore.restore(id);
    registrarResultadoPersistencia(resultado);
    resultado.durable
      ?.then(async () => {
        const [duraveis, excluidas] = await Promise.all([characterStore.listDurable(), characterStore.listDeleted()]);
        const sincronizadas = duraveis.map(sincronizarFicha);
        fichasRef.current = sincronizadas;
        setFichas(sincronizadas);
        setFichasExcluidas(excluidas);
        concluirPersistencia(operacao);
      })
      .catch((error) => registrarFalhaPersistencia(error, operacao));
    if (resultado.ok && !resultado.durable) concluirPersistencia(operacao);
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
    obterFicha,
    falhaPersistencia,
    mensagemPersistencia,
    tentarSalvarNovamente,
    dispensarFalhaPersistencia,
  };

  return (
    <FichasContext.Provider value={valor}>{children}</FichasContext.Provider>
  );
}

import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useFichas } from "../context/useFichas";
import { obterRaca } from "../data/racas";
import { obterClasse } from "../data/classes";
import {
  sincronizarFichaComSubclasses,
  subclasseCompativel,
} from "../utils/subclassesFicha";
import { obterHabilidadeClasse } from "../data/habilidadesClasses";
import { calcularBonusProficiencia, calcularModificadoresAtributos } from "../utils/dnd";
import { criarEspacosMagiaVazios } from "../utils/magia";
import { calcularCaEquipada } from "../utils/equipamento";
import { somarEfeitoItens } from "../utils/itensMagicos";
import { atualizarStatus } from "../utils/status";
import { atualizarMoeda } from "../utils/moedas";
import {
  adicionarCondicao,
  aplicarEfeitoPv,
  avisoConcentracaoPorDano,
  avancarCondicao,
  criarCondicaoAtiva,
} from "../utils/efeitos";
import {
  tipoConjurador,
  obterEspacosCombinadosMulticlasse,
  mesclarEspacosNoAtual,
  mesclarEspacosPacto,
} from "../utils/conjuracao";
import { recalcularPv } from "../utils/progressao";
import {
  aplicarDescansoCurto,
  aplicarDescansoLongo,
} from "../utils/descanso";
import {
  gastarDadoVida,
  totalDadosVidaUsados,
} from "../utils/dadosVida";
import {
  concederProficienciasMulticlasse,
  escolherPericiaMulticlasse,
  pendenciasProficienciasMulticlasse,
} from "../utils/proficienciasMulticlasse";
import { atendePreRequisitoMulticlasse } from "../data/proficienciasMulticlasse";
import { xpParaNivel } from "../utils/xp";
import {
  calcularNivelTotal,
  NIVEL_MAXIMO_PERSONAGEM,
  normalizarNivel,
} from "../utils/niveis";
import {
  criarRecursoDoCatalogo,
  listarSugestoesRecursos,
  sincronizarRecursosCatalogo,
} from "../utils/recurso";
import { reconciliarProficienciasCriacao } from "../utils/proficienciasCriacao";
import { RECURSOS_RASTREAVEIS } from "../data/recursosRastreaveis";
import BlocoRacaClasse from "../components/ficha/BlocoRacaClasse";
import BlocoAtributos from "../components/ficha/BlocoAtributos";
import BlocoStatus from "../components/ficha/BlocoStatus";
import BlocoAtaques from "../components/ficha/BlocoAtaques";
import BlocoSalvaguardas from "../components/ficha/BlocoSalvaguardas";
import BlocoPericias from "../components/ficha/BlocoPericias";
import BlocoProficiencias from "../components/ficha/BlocoProficiencias"; // NOVO
import BlocoInventario from "../components/ficha/BlocoInventario";
import BlocoMoedas from "../components/ficha/BlocoMoedas";
import BlocoMagias from "../components/ficha/BlocoMagias";
import BlocoHabilidades from "../components/ficha/BlocoHabilidades";
import ModalLevelUp from "../components/modal/ModalLevelUp";
import BlocoDescanso from "../components/ficha/BlocoDescanso";
import BlocoRecursos from "../components/ficha/BlocoRecursos";
import BlocoProgressao from "../components/ficha/BlocoProgressao"; // NOVO
import BlocoValidacao from "../components/ficha/BlocoValidacao";
import FichaImpressao from "../components/ficha/FichaImpressao";
import "./Ficha.css";
import Icon from "../components/icons/Icon";

const ABAS = [
  { chave: "combate", label: "Combate" },
  { chave: "habilidades", label: "Habilidades" },
  { chave: "pericias", label: "Perícias" },
  { chave: "magias", label: "Magias" },
  { chave: "inventario", label: "Inventário" },
  { chave: "notas", label: "Notas" },
];

function calcularBonusRacialFicha(ficha) {
  const bonus = { ...(obterRaca(ficha?.racaId)?.bonusAtributos ?? {}) };
  for (const chave of ficha?.bonusRacialEscolhido ?? []) {
    if (chave) bonus[chave] = (bonus[chave] ?? 0) + 1;
  }
  return bonus;
}

function contextoRecursos(ficha, modificadores) {
  const nivelTotal = calcularNivelTotal(ficha);
  const atributos = { ...(ficha.atributos ?? {}) };
  for (const [chave, bonus] of Object.entries(calcularBonusRacialFicha(ficha))) {
    atributos[chave] = (atributos[chave] ?? 0) + bonus;
  }
  return {
    nivelTotal,
    bonusProficiencia: calcularBonusProficiencia(nivelTotal),
    modificadores,
    atributos,
  };
}

function sincronizarRecursosDaFicha(ficha, modificadores) {
  return sincronizarRecursosCatalogo(
    ficha.recursos ?? [],
    RECURSOS_RASTREAVEIS,
    ficha,
    contextoRecursos(ficha, modificadores)
  );
}

export default function Ficha() {
  const { id } = useParams();
  const { obterFicha, atualizarFicha } = useFichas();
  const ficha = obterFicha(id);
  const [abaAtiva, setAbaAtiva] = useState("combate");
  const [modalLevelUpAberto, setModalLevelUpAberto] = useState(false);
  const [avisoConcentracao, setAvisoConcentracao] = useState(null); // { cd } | null   NOVO

  const bonusRacial = calcularBonusRacialFicha(ficha);
  const modificadoresAtributos = ficha
    ? calcularModificadoresAtributos(ficha.atributos, bonusRacial)
    : null;
  const caCalculada = ficha
    ? calcularCaEquipada(
        ficha.inventario ?? [],
        modificadoresAtributos,
        ficha.classeId
      )
    : null;
  const bonusSalvaguardasItens = ficha
    ? somarEfeitoItens(ficha.inventario, "bonus-salvaguardas")
    : 0;

  useEffect(() => {
    if (!ficha || caCalculada === null || ficha.status.ca === caCalculada) return;
    atualizarFicha(id, (fichaAtual) => ({
      status: { ...fichaAtual.status, ca: caCalculada },
    }));
  }, [caCalculada, ficha, id, atualizarFicha]);

  if (!ficha) {
    return (
      <div>
        <h1>Ficha não encontrada</h1>
        <p>
          Essa ficha não existe ou foi removida. <Link to="/nova">Crie uma nova</Link>.
        </p>
      </div>
    );
  }

  const classe = obterClasse(ficha.classeId);
  function calcularAtualizacoesEspacosMagia(fichaHipotetica) {
    const classesComNiveis = [
      {
        classeId: fichaHipotetica.classeId,
        nivel: fichaHipotetica.nivel ?? 1,
        subclasseId: fichaHipotetica.subclasseId,
      },
      ...(fichaHipotetica.classesSecundarias ?? []).map((c) => ({
        classeId: c.classeId,
        nivel: c.nivel ?? 1,
        subclasseId: c.subclasseId,
      })),
    ].filter((c) => c.classeId);

    const { espacosRegulares, espacosPacto } =
      obterEspacosCombinadosMulticlasse(classesComNiveis);

    return {
      espacosMagia: mesclarEspacosNoAtual(
        espacosRegulares ? fichaHipotetica.espacosMagia : {},
        espacosRegulares ?? {}
      ),
      espacosMagiaPacto: mesclarEspacosPacto(
        fichaHipotetica.espacosMagiaPacto,
        espacosPacto
      ),
    };
  }
  const forcaTotal = ficha.atributos.forca + (bonusRacial.forca ?? 0);
  const nivelTotal = calcularNivelTotal(ficha);
  const nivelSecundarioTotal = (ficha.classesSecundarias ?? []).reduce(
    (soma, classeSecundaria) =>
      soma + (classeSecundaria.classeId ? normalizarNivel(classeSecundaria.nivel) : 0),
    0
  );
  const nivelMaximoPrincipal = Math.max(
    1,
    NIVEL_MAXIMO_PERSONAGEM - nivelSecundarioTotal
  );
  const bonusProficiencia = calcularBonusProficiencia(nivelTotal);

  const modoProgressao = ficha.progressao?.modo ?? "marco";
const xpAtualPersonagem = ficha.progressao?.xpAtual ?? 0;
const xpNecessariaProximoNivel = xpParaNivel(nivelTotal + 1);
  const podeSubirPorXp =
    nivelTotal < NIVEL_MAXIMO_PERSONAGEM &&
    (modoProgressao !== "xp" || xpAtualPersonagem >= xpNecessariaProximoNivel);

  const atributosTotais = { ...ficha.atributos };
for (const chave of Object.keys(bonusRacial)) {
  atributosTotais[chave] = (atributosTotais[chave] ?? 0) + bonusRacial[chave];
}

const ehConjurador =
  Boolean(tipoConjurador(ficha.classeId, ficha.subclasseId)) ||
  (ficha.classesSecundarias ?? []).some((c) =>
    Boolean(tipoConjurador(c.classeId, c.subclasseId))
  );
  const percepcaoPassiva =
    10 +
    modificadoresAtributos.sabedoria +
    (ficha.pericias?.percepcao ? bonusProficiencia : 0);
  const investigacaoPassiva =
    10 +
    modificadoresAtributos.inteligencia +
    (ficha.pericias?.investigacao ? bonusProficiencia : 0);

  function handleChangeAtributo(chave, novoValor) {
    atualizarFicha(id, (fichaAtual) => {
      const atributos = { ...fichaAtual.atributos, [chave]: novoValor };
      const modificadores = calcularModificadoresAtributos(atributos, bonusRacial);
      const fichaComAtributos = { ...fichaAtual, atributos };
      return {
        atributos,
        recursos: sincronizarRecursosDaFicha(fichaComAtributos, modificadores),
      };
    });
  }

  function handleChangeProgressaoModo(novoModo) {
  atualizarFicha(id, (ficha) => ({
    progressao: { ...ficha.progressao, modo: novoModo },
  }));
}

function handleChangeProgressaoXp(novoXp) {
  atualizarFicha(id, (ficha) => ({
    progressao: { ...ficha.progressao, xpAtual: novoXp },
  }));
}

function handleIniciarConcentracao(magia) {
  atualizarFicha(id, () => ({
    concentracao: { magiaId: magia.id, nome: magia.nome },
  }));
  setAvisoConcentracao(null);
}

function handlePararConcentracao() {
  atualizarFicha(id, () => ({ concentracao: null }));
}

function handleFecharAvisoConcentracao() {
  setAvisoConcentracao(null);
}

function avisarTesteConcentracao(danoRecebido) {
  const aviso = avisoConcentracaoPorDano(ficha.concentracao, danoRecebido);
  if (aviso) setAvisoConcentracao(aviso);
}

  function handleChangeStatus(chave, novoValor) {
  if (chave === "pvAtual" && ficha.concentracao) {
    const statusAtualizado = atualizarStatus(ficha.status, chave, novoValor);
    const danoRecebido = (ficha.status.pvAtual ?? 0) - statusAtualizado.pvAtual;
    avisarTesteConcentracao(danoRecebido);
  }

  atualizarFicha(id, (fichaAtual) => ({
    status: atualizarStatus(fichaAtual.status, chave, novoValor),
  }));
  }

  function handleChangeRecursos(novosRecursos) {
  atualizarFicha(id, () => ({ recursos: novosRecursos }));
}

const sugestoesRecursos = listarSugestoesRecursos(
  RECURSOS_RASTREAVEIS,
  ficha,
  contextoRecursos(ficha, modificadoresAtributos)
);

function handleAdicionarSugestaoRecurso(sugestao) {
  atualizarFicha(id, (fichaAtual) => ({
    recursos: [
      ...(fichaAtual.recursos ?? []),
      criarRecursoDoCatalogo(
        sugestao,
        fichaAtual,
        contextoRecursos(fichaAtual, modificadoresAtributos)
      ),
    ],
  }));
}

  function handleGastarDadoDeVida(classeId, cura) {
  atualizarFicha(id, (fichaAtual) => {
    const dadosVidaPorClasse = gastarDadoVida(fichaAtual.dadosVidaPorClasse, classeId);
    return {
      status: {
        ...fichaAtual.status,
        pvAtual: Math.min(fichaAtual.status.pvMax, fichaAtual.status.pvAtual + cura),
      },
      dadosVidaPorClasse,
      dadosDeVidaUsados: totalDadosVidaUsados(dadosVidaPorClasse),
    };
  });
}

function handleRestaurarEspacosMagia() {
  atualizarFicha(id, (fichaAtual) => ({
    espacosMagiaPacto: fichaAtual.espacosMagiaPacto
      ? { ...fichaAtual.espacosMagiaPacto, usados: 0 }
      : null,
  }));
}

function handleDescansoLongo() {
  atualizarFicha(id, aplicarDescansoLongo);
}

function handleDescansoCurto() {
  atualizarFicha(id, aplicarDescansoCurto);
}


function handleChangeRaca(novoRacaId) {
  atualizarFicha(id, (fichaAtual) => {
    const fichaComRaca = reconciliarProficienciasCriacao({
      ...fichaAtual, racaId: novoRacaId, bonusRacialEscolhido: [],
      escolhasCriacao: { ...(fichaAtual.escolhasCriacao ?? {}), idiomasRaca: [], periciasRaca: [], ferramentasRaca: [], ferramentasSubstitutas: [] },
    });
    const modificadores = calcularModificadoresAtributos(
      fichaComRaca.atributos,
      calcularBonusRacialFicha(fichaComRaca)
    );
    return {
      ...fichaComRaca,
      recursos: sincronizarRecursosDaFicha(fichaComRaca, modificadores),
    };
  });
}

  function handleChangeAntecedente(novoAntecedenteId) {
  atualizarFicha(id, (fichaAtual) => reconciliarProficienciasCriacao({
    ...fichaAtual, antecedenteId: novoAntecedenteId,
    escolhasCriacao: { ...(fichaAtual.escolhasCriacao ?? {}), idiomasAntecedente: [], ferramentasAntecedente: [], ferramentasSubstitutas: [] },
  }));
}

  function handleChangeClasse(novoClasseId) {
  atualizarFicha(id, (fichaAtual) => {
            const classeAntigaId = fichaAtual.classeId;
    const atualizacoes = {
      classeId: novoClasseId,
      subclasseId: null,
      habilidades: (fichaAtual.habilidades ?? []).filter((h) => {
        if (h.tipo === "subclasse") return false;
        if (
          h.tipo === "classe" &&
          obterHabilidadeClasse(h.origemId)?.classeId === classeAntigaId
        ) {
          return false;
        }
        return true;
      }),
      recursos: (fichaAtual.recursos ?? []).filter(
        (r) => r.origemClasseId !== classeAntigaId
      ),
      magias: fichaAtual.magias ?? [],
      escolhasCriacao: { ...(fichaAtual.escolhasCriacao ?? {}), periciasClasse: [], ferramentasClasse: [], ferramentasSubstitutas: [] },
    };
    const novaClasse = obterClasse(novoClasseId);

                Object.assign(
      atualizacoes,
      calcularAtualizacoesEspacosMagia({
        ...fichaAtual,
        classeId: novoClasseId,
        subclasseId: null,
      })
    );

      if (novaClasse) {
        const modCon = modificadoresAtributos.constituicao;
        // Trocar a classe principal não deve apagar nem recalcular os PV que
        // já foram escolhidos. Isso é especialmente importante quando a
        // ficha já tem níveis de outras classes.
        const fichaComClasseAlterada = { ...fichaAtual, classeId: novoClasseId };
        const { pvPorNivel, origemClassePvPorNivel, status } = recalcularPv(
          fichaComClasseAlterada,
          novaClasse,
          modCon,
          calcularNivelTotal(fichaComClasseAlterada)
        );
        atualizacoes.pvPorNivel = pvPorNivel;
        atualizacoes.origemClassePvPorNivel = origemClassePvPorNivel;
        atualizacoes.status = status;
      }

      const fichaSincronizada = sincronizarFichaComSubclasses({
        ...fichaAtual,
        ...atualizacoes,
      });
      return {
        ...atualizacoes,
        recursos: sincronizarRecursosDaFicha(fichaSincronizada, modificadoresAtributos),
        habilidades: fichaSincronizada.habilidades,
        magias: fichaSincronizada.magias,
      };
    });
  }

  function handleChangeNivel(novoNivel) {
    atualizarFicha(id, (fichaAtual) => {
      const totalSecundario = (fichaAtual.classesSecundarias ?? []).reduce(
        (soma, classeSecundaria) =>
          soma + (classeSecundaria.classeId ? normalizarNivel(classeSecundaria.nivel) : 0),
        0
      );
      const limite = Math.max(1, NIVEL_MAXIMO_PERSONAGEM - totalSecundario);
      const nivelAjustado = Math.min(normalizarNivel(novoNivel), limite);
      const atualizacoes = { nivel: nivelAjustado };

      if (classe) {
        const modCon = modificadoresAtributos.constituicao;
        const nivelTotalNovo = calcularNivelTotal({
          ...fichaAtual,
          nivel: nivelAjustado,
        });
        const { pvPorNivel, origemClassePvPorNivel, status } = recalcularPv(
          fichaAtual,
          classe,
          modCon,
          nivelTotalNovo
        );
        atualizacoes.pvPorNivel = pvPorNivel;
        atualizacoes.origemClassePvPorNivel = origemClassePvPorNivel;
        atualizacoes.status = status;
      }

            Object.assign(
        atualizacoes,
          calcularAtualizacoesEspacosMagia({ ...fichaAtual, nivel: nivelAjustado })
      );

      const fichaSincronizada = sincronizarFichaComSubclasses({
        ...fichaAtual,
        ...atualizacoes,
      });
      return {
        ...atualizacoes,
        recursos: sincronizarRecursosDaFicha(fichaSincronizada, modificadoresAtributos),
        habilidades: fichaSincronizada.habilidades,
        magias: fichaSincronizada.magias,
      };
    });
  }

  function handleChangeSubclasse(novaSubclasseId) {
    atualizarFicha(id, (fichaAtual) => {
      if (!subclasseCompativel(fichaAtual.classeId, novaSubclasseId, fichaAtual.nivel)) return {};
      const fichaSincronizada = sincronizarFichaComSubclasses({
        ...fichaAtual,
        subclasseId: novaSubclasseId,
        recursos: (fichaAtual.recursos ?? []).filter(
          (recurso) =>
            !recurso.origemSubclasseId ||
            recurso.origemClasseId !== fichaAtual.classeId
        ),
      });
      return {
        subclasseId: novaSubclasseId,
        recursos: sincronizarRecursosDaFicha(fichaSincronizada, modificadoresAtributos),
        habilidades: fichaSincronizada.habilidades,
        magias: fichaSincronizada.magias,
        ...calcularAtualizacoesEspacosMagia({
          ...fichaAtual,
          subclasseId: novaSubclasseId,
        }),
      };
    });
  }

function handleChangeBonusRacialEscolhido(indice, valor) {
  atualizarFicha(id, (fichaAtual) => {
    const atual = [...(fichaAtual.bonusRacialEscolhido ?? [])];
    atual[indice] = valor;
    const fichaComBonus = { ...fichaAtual, bonusRacialEscolhido: atual };
    const modificadores = calcularModificadoresAtributos(
      fichaComBonus.atributos,
      calcularBonusRacialFicha(fichaComBonus)
    );
    return {
      bonusRacialEscolhido: atual,
      recursos: sincronizarRecursosDaFicha(fichaComBonus, modificadores),
    };
  });
}

  function handleAdicionarClasseSecundaria() {
  atualizarFicha(id, (fichaAtual) => {
    if (calcularNivelTotal(fichaAtual) >= NIVEL_MAXIMO_PERSONAGEM) return {};
    return {
      classesSecundarias: [
        ...(fichaAtual.classesSecundarias ?? []),
        { classeId: null, nivel: 1, subclasseId: null },
      ],
    };
  });
}

function handleAlterarClasseSecundaria(indice, campo, valor) {
  atualizarFicha(id, (fichaAtual) => {
    const novasClasses = [...(fichaAtual.classesSecundarias ?? [])];
    if (!novasClasses[indice]) return {};

    let valorAjustado = valor;
    if (
      campo === "nivel" &&
      novasClasses[indice].classeId &&
      pendenciasProficienciasMulticlasse(fichaAtual, novasClasses[indice].classeId).length > 0
    ) return {};
    if (campo === "nivel") {
      const niveisDasOutrasClasses = novasClasses.reduce(
        (soma, classeSecundaria, indiceClasse) =>
          indiceClasse === indice
            ? soma
            : soma + (classeSecundaria.classeId ? normalizarNivel(classeSecundaria.nivel) : 0),
        normalizarNivel(fichaAtual.nivel)
      );
      const limite = Math.max(1, NIVEL_MAXIMO_PERSONAGEM - niveisDasOutrasClasses);
      valorAjustado = Math.min(normalizarNivel(valor), limite);
    }

    if (campo === "classeId") {
      valorAjustado = valor || null;
      if (
        valorAjustado &&
        (!atendePreRequisitoMulticlasse(valorAjustado, atributosTotais) ||
          fichaAtual.classeId === valorAjustado ||
          novasClasses.some(
            (classeSecundaria, indiceClasse) =>
              indiceClasse !== indice && classeSecundaria.classeId === valorAjustado
          ))
      ) return {};
      novasClasses[indice] = {
        ...novasClasses[indice],
        classeId: valorAjustado,
        subclasseId: null,
      };
    } else if (campo === "subclasseId") {
      const classeAtual = novasClasses[indice];
      if (!subclasseCompativel(classeAtual.classeId, valor || null, classeAtual.nivel)) {
        return {};
      }
      novasClasses[indice] = { ...classeAtual, subclasseId: valor || null };
    } else {
      novasClasses[indice] = {
        ...novasClasses[indice],
        [campo]: valorAjustado,
      };
    }

    const fichaComClasses = {
      ...fichaAtual,
      classesSecundarias: novasClasses,
    };
    const nivelTotalAnterior = calcularNivelTotal(fichaAtual);
    const nivelTotalNovo = calcularNivelTotal(fichaComClasses);
    let atualizacoesPv = {};
    if (nivelTotalNovo !== nivelTotalAnterior) {
      const classeQueMudou = obterClasse(novasClasses[indice]?.classeId);
      const resultadoPv = recalcularPv(
        fichaAtual,
        nivelTotalNovo > nivelTotalAnterior ? classeQueMudou : null,
        modificadoresAtributos.constituicao,
        nivelTotalNovo
      );
      atualizacoesPv = {
        pvPorNivel: resultadoPv.pvPorNivel,
        origemClassePvPorNivel: resultadoPv.origemClassePvPorNivel,
        status: resultadoPv.status,
      };
    }
    const atualizacoesProf =
      campo === "classeId" && valorAjustado
        ? concederProficienciasMulticlasse(fichaAtual, valorAjustado)
        : {};
    const fichaComProficiencias = { ...fichaComClasses, ...atualizacoesProf };
    const fichaSincronizada = sincronizarFichaComSubclasses(fichaComProficiencias);
    return {
      classesSecundarias: novasClasses,
      ...atualizacoesPv,
      ...atualizacoesProf,
      recursos: sincronizarRecursosDaFicha(fichaSincronizada, modificadoresAtributos),
      habilidades: fichaSincronizada.habilidades,
      magias: fichaSincronizada.magias,
      ...calcularAtualizacoesEspacosMagia({
        ...fichaAtual,
        classesSecundarias: novasClasses,
      }),
    };
  });
}

function handleEscolherPericiaMulticlasse(indice, periciaId) {
  atualizarFicha(id, (fichaAtual) => {
    const classeId = fichaAtual.classesSecundarias?.[indice]?.classeId;
    return classeId ? escolherPericiaMulticlasse(fichaAtual, classeId, periciaId) : {};
  });
}

function handleRemoverClasseSecundaria(indice) {
  atualizarFicha(id, (fichaAtual) => {
    const novasClasses = (fichaAtual.classesSecundarias ?? []).filter(
      (_, i) => i !== indice
    );
    const fichaSincronizada = sincronizarFichaComSubclasses({
      ...fichaAtual,
      classesSecundarias: novasClasses,
    });
    const resultadoPv = recalcularPv(
      fichaAtual,
      null,
      modificadoresAtributos.constituicao,
      calcularNivelTotal({ ...fichaAtual, classesSecundarias: novasClasses })
    );
    return {
      classesSecundarias: novasClasses,
      pvPorNivel: resultadoPv.pvPorNivel,
      origemClassePvPorNivel: resultadoPv.origemClassePvPorNivel,
      status: resultadoPv.status,
      recursos: sincronizarRecursosDaFicha(fichaSincronizada, modificadoresAtributos),
      habilidades: fichaSincronizada.habilidades,
      magias: fichaSincronizada.magias,
      ...calcularAtualizacoesEspacosMagia({
        ...fichaAtual,
        classesSecundarias: novasClasses,
      }),
    };
  });
}

  function handleTogglePericia(chave) {
    atualizarFicha(id, (fichaAtual) => {
      const origens = structuredClone(fichaAtual.origensProficiencias ?? {});
      origens.pericias ??= {}; origens.pericias[chave] ??= [];
      origens.pericias[chave] = fichaAtual.pericias?.[chave]
        ? origens.pericias[chave].filter((origem) => !origem.startsWith("manual:"))
        : [...new Set([...origens.pericias[chave], "manual:pericia"])];
      return reconciliarProficienciasCriacao({ ...fichaAtual, origensProficiencias: origens });
    });
  }

function handleToggleIdioma(idiomaId) {
  atualizarFicha(id, (fichaAtual) => {
    const origens = structuredClone(fichaAtual.origensProficiencias ?? {});
    origens.idiomas ??= {}; origens.idiomas[idiomaId] ??= [];
    origens.idiomas[idiomaId] = (fichaAtual.idiomas ?? []).includes(idiomaId)
      ? origens.idiomas[idiomaId].filter((origem) => !origem.startsWith("manual:"))
      : [...new Set([...origens.idiomas[idiomaId], "manual:idioma"])];
    return reconciliarProficienciasCriacao({ ...fichaAtual, origensProficiencias: origens });
  });
}

function handleToggleFerramenta(ferramentaId) {
  atualizarFicha(id, (fichaAtual) => {
    const origens = structuredClone(fichaAtual.origensProficiencias ?? {});
    origens.ferramentas ??= {}; origens.ferramentas[ferramentaId] ??= [];
    origens.ferramentas[ferramentaId] = (fichaAtual.proficienciasFerramentas ?? []).includes(ferramentaId)
      ? origens.ferramentas[ferramentaId].filter((origem) => !origem.startsWith("manual:"))
      : [...new Set([...origens.ferramentas[ferramentaId], "manual:ferramenta"])];
    return reconciliarProficienciasCriacao({ ...fichaAtual, origensProficiencias: origens });
  });
}

function handleChangeAtributoFerramenta(ferramentaId, atributoChave) {
  atualizarFicha(id, (ficha) => ({
    atributoFerramentas: { ...ficha.atributoFerramentas, [ferramentaId]: atributoChave },
  }));
}

  function handleChangeInventario(novoInventario) {
    atualizarFicha(id, (fichaAtual) => {
      const fichaComInventario = { ...fichaAtual, inventario: novoInventario };
      return {
        inventario: novoInventario,
        recursos: sincronizarRecursosDaFicha(fichaComInventario, modificadoresAtributos),
      };
    });
  }

  function handleChangeMoedas(chave, novoValor) {
    atualizarFicha(id, (fichaAtual) => ({
      moedas: atualizarMoeda(fichaAtual.moedas, chave, novoValor),
    }));
  }

  function handleChangeMagias(novasMagias) {
    atualizarFicha(id, (fichaAtual) => ({
      magias: sincronizarFichaComSubclasses({ ...fichaAtual, magias: novasMagias }).magias,
    }));
  }

  function handleChangeHabilidades(novasHabilidades) {
    atualizarFicha(id, (fichaAtual) => {
      const fichaSincronizada = sincronizarFichaComSubclasses({
        ...fichaAtual,
        habilidades: novasHabilidades,
      });
      return {
        habilidades: fichaSincronizada.habilidades,
        recursos: sincronizarRecursosDaFicha(fichaSincronizada, modificadoresAtributos),
      };
    });
  }

  function handleChangeAtaques(novosAtaques) {
    atualizarFicha(id, () => ({ ataques: novosAtaques }));
  }

  function handleChangeEspacoMagia(nivel, campo, novoValor) {
    atualizarFicha(id, (ficha) => ({
      espacosMagia: {
        ...ficha.espacosMagia,
        [nivel]: { ...ficha.espacosMagia[nivel], [campo]: novoValor },
      },
    }));
  }

  function handleChangeEspacoPacto(novoValor) {
  atualizarFicha(id, (fichaAtual) => ({
    espacosMagiaPacto: { ...fichaAtual.espacosMagiaPacto, usados: novoValor },
  }));
}

  function handleChangeNome(evento) {
    const valor = evento.target.value;
    atualizarFicha(id, () => ({ nome: valor || "Sem nome" }));
  }

  function handleChangeCampoTexto(campo, valor) {
    atualizarFicha(id, () => ({ [campo]: valor }));
  }

  function handleConcluirLevelUp(alteracoes) {
  atualizarFicha(id, (fichaAtual) => {
    const fichaHipotetica = { ...fichaAtual, ...alteracoes };
    if (calcularNivelTotal(fichaHipotetica) > NIVEL_MAXIMO_PERSONAGEM) {
      return {};
    }
    const fichaSincronizada = sincronizarFichaComSubclasses(fichaHipotetica);
    const modificadores = calcularModificadoresAtributos(
      fichaSincronizada.atributos,
      calcularBonusRacialFicha(fichaSincronizada)
    );
    return {
      ...alteracoes,
      recursos: sincronizarRecursosDaFicha(fichaSincronizada, modificadores),
      habilidades: fichaSincronizada.habilidades,
      magias: fichaSincronizada.magias,
      ...calcularAtualizacoesEspacosMagia(fichaHipotetica),
    };
  });
}

  function handleIrParaSecaoValidacao(secao) {
    if (secao !== "identidade") setAbaAtiva(secao);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document.getElementById(`ficha-secao-${secao}`)?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
    });
  }

  function handleAplicarEfeitoPv(tipo, valor) {
    const resultado = aplicarEfeitoPv(ficha.status, tipo, valor);
    avisarTesteConcentracao(resultado.danoRecebido);
    atualizarFicha(id, () => ({ status: resultado.status }));
  }

  function handleAplicarCondicao(dadosCondicao) {
    const condicao = criarCondicaoAtiva(dadosCondicao);
    atualizarFicha(id, (fichaAtual) => ({
      condicoesAtivas: adicionarCondicao(fichaAtual.condicoesAtivas, condicao),
    }));
  }

  function handleAvancarCondicao(condicaoId) {
    atualizarFicha(id, (fichaAtual) => ({
      condicoesAtivas: avancarCondicao(fichaAtual.condicoesAtivas, condicaoId),
    }));
  }

  function handleRemoverCondicao(condicaoId) {
    atualizarFicha(id, (fichaAtual) => ({
      condicoesAtivas: (fichaAtual.condicoesAtivas ?? []).filter(
        (condicao) => condicao.id !== condicaoId
      ),
    }));
  }

  function handleImprimirFicha() {
    const tituloAnterior = document.title;
    document.title = `${ficha.nome || "Personagem"} - D&D Fichas`;
    window.addEventListener("afterprint", () => {
      document.title = tituloAnterior;
    }, { once: true });
    window.print();
  }

  function handleTabKeyDown(event) {
    const currentIndex = ABAS.findIndex((aba) => aba.chave === abaAtiva);
    let nextIndex = null;
    if (event.key === "ArrowRight") nextIndex = (currentIndex + 1) % ABAS.length;
    if (event.key === "ArrowLeft") nextIndex = (currentIndex - 1 + ABAS.length) % ABAS.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = ABAS.length - 1;
    if (nextIndex === null) return;
    event.preventDefault();
    const next = ABAS[nextIndex];
    setAbaAtiva(next.chave);
    requestAnimationFrame(() => document.getElementById(`ficha-aba-${next.chave}`)?.focus());
  }

  return (
    <>
      <h1>Ficha de {ficha.nome || "personagem sem nome"}</h1>
      <button type="button" className="ficha-imprimir-botao" onClick={handleImprimirFicha}>
        Imprimir / Salvar em PDF
      </button>
      <div className="ficha-shell">
      <aside id="ficha-secao-identidade" className="ficha-coluna-fixa">
        <input
          type="text"
          className="ficha-nome-input"
          value={ficha.nome}
          onChange={handleChangeNome}
          aria-label="Editar nome do personagem"
        />

       <BlocoRacaClasse
  racaId={ficha.racaId}
  classeId={ficha.classeId}
  antecedenteId={ficha.antecedenteId}
  nivel={ficha.nivel ?? 1}
  nivelTotal={nivelTotal}
  nivelMaximoPrincipal={nivelMaximoPrincipal}
  subclasseId={ficha.subclasseId}
  classesSecundarias={ficha.classesSecundarias ?? []}
  atributosTotais={atributosTotais}
  pericias={ficha.pericias ?? {}}
  proficienciasMulticlasse={ficha.proficienciasMulticlasse ?? {}}
  bonusRacialEscolhido={ficha.bonusRacialEscolhido ?? []}
  onChangeRaca={handleChangeRaca}
  onChangeClasse={handleChangeClasse}
  onChangeAntecedente={handleChangeAntecedente}
  onChangeNivel={handleChangeNivel}
  onChangeSubclasse={handleChangeSubclasse}
  onAdicionarClasseSecundaria={handleAdicionarClasseSecundaria}
  onAlterarClasseSecundaria={handleAlterarClasseSecundaria}
  onRemoverClasseSecundaria={handleRemoverClasseSecundaria}
  onEscolherPericiaMulticlasse={handleEscolherPericiaMulticlasse}
  onChangeBonusRacialEscolhido={handleChangeBonusRacialEscolhido}
  escolhasCriacao={ficha.escolhasCriacao ?? {}}
  onChangeEscolhasCriacao={(chave, valores) => atualizarFicha(id, (fichaAtual) => reconciliarProficienciasCriacao({ ...fichaAtual, escolhasCriacao: { ...(fichaAtual.escolhasCriacao ?? {}), [chave]: valores } }))}
/>

<BlocoProgressao
  progressao={ficha.progressao ?? { modo: "marco", xpAtual: 0 }}
  nivelTotal={nivelTotal}
  onChangeModo={handleChangeProgressaoModo}
  onChangeXp={handleChangeProgressaoXp}
/>

<BlocoValidacao
  ficha={ficha}
  atributosTotais={atributosTotais}
  onMarcarPronta={() => atualizarFicha(id, () => ({ estadoFicha: "pronta" }))}
  onIrParaSecao={handleIrParaSecaoValidacao}
/>

<button
  type="button"
  className="ficha-levelup-botao"
  onClick={() => setModalLevelUpAberto(true)}
  disabled={!classe || !podeSubirPorXp}
  title={
    !classe
      ? "Escolha uma classe primeiro"
      : !podeSubirPorXp
       ? nivelTotal >= NIVEL_MAXIMO_PERSONAGEM
         ? "O personagem já atingiu o nível máximo (20)"
         : `Faltam ${xpNecessariaProximoNivel - xpAtualPersonagem} XP para o próximo nível`
      : undefined
  }
>
          <Icon name="levelUp" /> Subir de Nível
</button>


        <ModalLevelUp
          key={`${ficha.id}-${modalLevelUpAberto ? nivelTotal : "fechado"}`}
          aberto={modalLevelUpAberto}
          onFechar={() => setModalLevelUpAberto(false)}
          ficha={ficha}
          classe={classe}
          modificadoresAtributos={modificadoresAtributos}
          onConcluir={handleConcluirLevelUp}
        />

        <div className="ficha-stats-rapidas">
          <div className="ficha-stat-rapida">
            <span className="ficha-stat-label">Vida</span>
            <span className="ficha-stat-valor">
              {ficha.status.pvAtual}/{ficha.status.pvMax}
            </span>
          </div>
          <div className="ficha-stat-rapida">
            <span className="ficha-stat-label">Defesa</span>
            <span className="ficha-stat-valor">{ficha.status.ca}</span>
          </div>
        </div>

        <BlocoAtributos
          atributos={ficha.atributos}
          bonusRacial={bonusRacial}
          onChangeAtributo={handleChangeAtributo}
        />
      </aside>

      <div className="ficha-coluna-principal">
        <nav className="ficha-abas" role="tablist" aria-label="Seções da ficha">
          {ABAS.map((aba) => (
            <button
              key={aba.chave}
              type="button"
              role="tab"
              id={`ficha-aba-${aba.chave}`}
              aria-selected={abaAtiva === aba.chave}
              aria-controls={`ficha-secao-${aba.chave}`}
              tabIndex={abaAtiva === aba.chave ? 0 : -1}
              onKeyDown={handleTabKeyDown}
              className={
                abaAtiva === aba.chave ? "ficha-aba is-ativa" : "ficha-aba"
              }
              onClick={() => setAbaAtiva(aba.chave)}
            >
              {aba.label}
            </button>
          ))}
        </nav>

        <div id={`ficha-secao-${abaAtiva}`} className="ficha-conteudo-aba" role="tabpanel" aria-labelledby={`ficha-aba-${abaAtiva}`}>
          {abaAtiva === "combate" && (
            <>
              <BlocoStatus
                status={ficha.status}
                onChangeStatus={handleChangeStatus}
                modDestreza={modificadoresAtributos.destreza}
                modConstituicao={modificadoresAtributos.constituicao}
                percepcaoPassiva={percepcaoPassiva}
                investigacaoPassiva={investigacaoPassiva}
                concentracao={ficha.concentracao}
                avisoConcentracao={avisoConcentracao}
                onPararConcentracao={handlePararConcentracao}
                onFecharAvisoConcentracao={handleFecharAvisoConcentracao}
                condicoesAtivas={ficha.condicoesAtivas ?? []}
                onAvancarCondicao={handleAvancarCondicao}
                onRemoverCondicao={handleRemoverCondicao}
              />
              <BlocoAtaques
                modificadoresAtributos={modificadoresAtributos}
                bonusProficiencia={bonusProficiencia}
                inventario={ficha.inventario ?? []}
                ataques={ficha.ataques ?? []}
                onChangeAtaques={handleChangeAtaques}
              />
              <BlocoDescanso
                classe={classe}
                classesSecundarias={ficha.classesSecundarias ?? []}
                modConstituicao={modificadoresAtributos.constituicao}
                status={ficha.status}
                dadosVidaPorClasse={ficha.dadosVidaPorClasse ?? {}}
                onGastarDadoDeVida={handleGastarDadoDeVida}
                onRestaurarEspacosMagia={handleRestaurarEspacosMagia}
                onDescansoLongo={handleDescansoLongo}
                onDescansoCurto={handleDescansoCurto}
              />
              <BlocoSalvaguardas
                modificadoresAtributos={modificadoresAtributos}
                salvaguardasProficientes={ficha.salvaguardasProficientes ?? classe?.salvaguardasProficientes}
                bonusProficiencia={bonusProficiencia}
                bonusItens={bonusSalvaguardasItens}
              />
            </>
          )}

                    {abaAtiva === "habilidades" && (
            <>
              <BlocoHabilidades
                classeId={ficha.classeId}
                classeNome={classe?.nome}
                habilidades={ficha.habilidades ?? []}
                onChangeHabilidades={handleChangeHabilidades}
                atributosTotais={atributosTotais}
                ehConjurador={ehConjurador}
              />
              <BlocoRecursos
  recursos={ficha.recursos ?? []}
  onChangeRecursos={handleChangeRecursos}
  sugestoes={sugestoesRecursos}
  onAdicionarSugestao={handleAdicionarSugestaoRecurso}
/>
            </>
          )}

          {abaAtiva === "pericias" && (
  <>
    <BlocoPericias
      modificadoresAtributos={modificadoresAtributos}
      pericias={ficha.pericias ?? {}}
      bonusProficiencia={bonusProficiencia}
      onTogglePericia={handleTogglePericia}
    />
    <BlocoProficiencias
      idiomas={ficha.idiomas ?? ["comum"]}
      onToggleIdioma={handleToggleIdioma}
      proficienciasFerramentas={ficha.proficienciasFerramentas ?? []}
      proficienciasArmas={ficha.proficienciasArmas ?? []}
      proficienciasArmaduras={ficha.proficienciasArmaduras ?? []}
      proficienciasEscudos={ficha.proficienciasEscudos ?? false}
      onToggleFerramenta={handleToggleFerramenta}
      atributoFerramentas={ficha.atributoFerramentas ?? {}}
      onChangeAtributoFerramenta={handleChangeAtributoFerramenta}
      modificadoresAtributos={modificadoresAtributos}
      bonusProficiencia={bonusProficiencia}
      origensProficiencias={ficha.origensProficiencias ?? {}}
    />
  </>
)}

          {abaAtiva === "magias" && (
            <BlocoMagias
              ficha={ficha}
              modificadoresAtributos={modificadoresAtributos}
              bonusProficiencia={bonusProficiencia}
              espacosMagia={ficha.espacosMagia ?? criarEspacosMagiaVazios()}
              onChangeEspacoMagia={handleChangeEspacoMagia}
              espacosMagiaPacto={ficha.espacosMagiaPacto}
              onChangeEspacoPacto={handleChangeEspacoPacto}
              magias={ficha.magias ?? []}
              onChangeMagias={handleChangeMagias}   
              concentracaoAtual={ficha.concentracao}
              onIniciarConcentracao={handleIniciarConcentracao}
              onPararConcentracao={handlePararConcentracao}
              onAplicarEfeitoPv={handleAplicarEfeitoPv}
              onAplicarCondicao={handleAplicarCondicao}
            />
          )}

          {abaAtiva === "inventario" && (
            <>
              <BlocoInventario
                inventario={ficha.inventario ?? []}
                onChangeInventario={handleChangeInventario}
                forcaTotal={forcaTotal}
                onAplicarEfeitoPv={handleAplicarEfeitoPv}
              />
              <BlocoMoedas moedas={ficha.moedas ?? {}} onChangeMoedas={handleChangeMoedas} />
            </>
          )}

          {abaAtiva === "notas" && (
            <>
              <section>
                <h3 className="bloco-titulo">Personagem</h3>
                <label className="ficha-campo-texto">
                  <span className="ficha-campo-texto-label">Jogador</span>
                  <input
                    type="text"
                    placeholder="Seu nome"
                    value={ficha.jogador ?? ""}
                    onChange={(evento) =>
                      handleChangeCampoTexto("jogador", evento.target.value)
                    }
                  />
                </label>
                <label className="ficha-campo-texto">
                  <span className="ficha-campo-texto-label">Aparência</span>
                  <textarea
                    className="ficha-notas-textarea ficha-notas-textarea--curta"
                    placeholder="Idade, altura, jeito de se vestir, marcas..."
                    value={ficha.aparencia ?? ""}
                    onChange={(evento) =>
                      handleChangeCampoTexto("aparencia", evento.target.value)
                    }
                  />
                </label>
                <label className="ficha-campo-texto">
                  <span className="ficha-campo-texto-label">Personalidade</span>
                  <textarea
                    className="ficha-notas-textarea ficha-notas-textarea--curta"
                    placeholder="Traços marcantes, opiniões, ideais..."
                    value={ficha.personalidade ?? ""}
                    onChange={(evento) =>
                      handleChangeCampoTexto("personalidade", evento.target.value)
                    }
                  />
                </label>
                <label className="ficha-campo-texto">
                  <span className="ficha-campo-texto-label">Histórico</span>
                  <textarea
                    className="ficha-notas-textarea ficha-notas-textarea--curta"
                    placeholder="Infância, família, como entrou nessa vida..."
                    value={ficha.historico ?? ""}
                    onChange={(evento) =>
                      handleChangeCampoTexto("historico", evento.target.value)
                    }
                  />
                </label>
                <label className="ficha-campo-texto">
                  <span className="ficha-campo-texto-label">Objetivo</span>
                  <textarea
                    className="ficha-notas-textarea ficha-notas-textarea--curta"
                    placeholder="O que motiva esse personagem a aventurar-se?"
                    value={ficha.objetivo ?? ""}
                    onChange={(evento) =>
                      handleChangeCampoTexto("objetivo", evento.target.value)
                    }
                  />
                </label>
              </section>

              <section>
                <h3 className="bloco-titulo">Anotações livres</h3>
                <textarea
                  className="ficha-notas-textarea"
                  placeholder="Qualquer outra coisa: contatos, pistas, itens especiais..."
                  value={ficha.notas ?? ""}
                  onChange={(evento) =>
                    handleChangeCampoTexto("notas", evento.target.value)
                  }
                />
              </section>
            </>
          )}
        </div>
      </div>
      </div>
      <FichaImpressao
        ficha={ficha}
        atributosTotais={atributosTotais}
        modificadoresAtributos={modificadoresAtributos}
        bonusProficiencia={bonusProficiencia}
        nivelTotal={nivelTotal}
        percepcaoPassiva={percepcaoPassiva}
        investigacaoPassiva={investigacaoPassiva}
      />
    </>
  );
}

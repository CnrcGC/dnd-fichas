import { CLASSES } from "../data/classes";
import { obterNivelEscolhaSubclasse, obterSubclasse } from "../data/subclasses";
import { obterHabilidadesPorSubclasse } from "../data/habilidadesSubclasses";
import { TALENTOS } from "../data/talentos";
import { tipoConjurador } from "./conjuracao";
import {
  classesQueAcessamNivel,
  magiaPermitidaParaClasse,
  contarMagiasDeQualquerEscola,
  limiteMagiasDeQualquerEscola,
} from "./acessoMagias";
import {
  obterExcecaoMagia,
  obterMagiasSemprePreparadas,
} from "../data/magiasExcecoesSubclasse";
import { limitesMagiasDaClasse } from "../data/limitesMagias";
import { subclasseCompativel } from "./subclassesFicha";
import { classesComDadosVida } from "./dadosVida";
import { pendenciasProficienciasMulticlasse } from "./proficienciasMulticlasse";
import { obterRegraMulticlasse } from "../data/proficienciasMulticlasse";
import { escolhasObrigatoriasCriacao } from "./proficienciasCriacao";
import { obterRaca, obterSubraca, subracaValidaParaRaca } from "../data/racas";
import { obterAntecedente } from "../data/antecedentes";
import {
  validarOrigemEspecial,
  encontrarMagiaCatalogo,
  limiteSegredosMagicosAdicionais,
} from "./regrasMagias";
import { NIVEL_MAXIMO_PERSONAGEM } from "./niveis";
import { contarItensSintonizados, LIMITE_SINTONIZACAO } from "./itensMagicos";
import { pendenciasEscolhasClasses } from "./escolhasClasses";
import { pendenciasEscolhasSubclasses } from "./escolhasSubclasses";

const PRE_REQUISITOS_MULTICLASSE = {
  barbaro: {
    descricao: "Força 13+",
    atende: (atributos) => atributos.forca >= 13,
  },
  bardo: {
    descricao: "Carisma 13+",
    atende: (atributos) => atributos.carisma >= 13,
  },
  bruxo: {
    descricao: "Carisma 13+",
    atende: (atributos) => atributos.carisma >= 13,
  },
  clerigo: {
    descricao: "Sabedoria 13+",
    atende: (atributos) => atributos.sabedoria >= 13,
  },
  druida: {
    descricao: "Sabedoria 13+",
    atende: (atributos) => atributos.sabedoria >= 13,
  },
  feiticeiro: {
    descricao: "Carisma 13+",
    atende: (atributos) => atributos.carisma >= 13,
  },
  guerreiro: {
    descricao: "Força 13+ ou Destreza 13+",
    atende: (atributos) => atributos.forca >= 13 || atributos.destreza >= 13,
  },
  ladino: {
    descricao: "Destreza 13+",
    atende: (atributos) => atributos.destreza >= 13,
  },
  mago: {
    descricao: "Inteligência 13+",
    atende: (atributos) => atributos.inteligencia >= 13,
  },
  monge: {
    descricao: "Destreza 13+ e Sabedoria 13+",
    atende: (atributos) => atributos.destreza >= 13 && atributos.sabedoria >= 13,
  },
  paladino: {
    descricao: "Força 13+ e Carisma 13+",
    atende: (atributos) => atributos.forca >= 13 && atributos.carisma >= 13,
  },
  patrulheiro: {
    descricao: "Destreza 13+ e Sabedoria 13+",
    atende: (atributos) => atributos.destreza >= 13 && atributos.sabedoria >= 13,
  },
};

function adicionar(lista, mensagem) {
  if (!lista.includes(mensagem)) lista.push(mensagem);
}

function numeroInteiroNoIntervalo(valor, minimo, maximo) {
  return Number.isInteger(Number(valor)) && Number(valor) >= minimo && Number(valor) <= maximo;
}

function nomeClasse(classeId) {
  return CLASSES.find((classe) => classe.id === classeId)?.nome ?? classeId;
}

function nivelMaximoDeEspaco(ficha) {
  const nivelRegular = Math.max(
    0,
    ...Object.entries(ficha.espacosMagia ?? [])
      .filter(([, espaco]) => Number(espaco?.total) > 0)
      .map(([nivel]) => Number(nivel))
  );
  const nivelPacto = Number(ficha.espacosMagiaPacto?.quantidade) > 0
    ? Number(ficha.espacosMagiaPacto?.nivel) || 0
    : 0;
  return Math.max(nivelRegular, nivelPacto);
}

export function validarFicha(ficha, atributosTotais) {
  const erros = [];
  const pendencias = [];
  const avisos = [];
  const atributos = atributosTotais ?? {};
  const classesSecundarias = ficha.classesSecundarias ?? [];

  if (ficha.normalizacaoNiveis?.ajustado) {
    adicionar(
      avisos,
      "Migração: níveis inválidos ou acima do total 20 foram ajustados automaticamente; confira as classes."
    );
  }

  if (!ficha.nome?.trim() || ficha.nome === "Sem nome") adicionar(pendencias, "Identidade: informe o nome do personagem.");
  if (!ficha.racaId) adicionar(pendencias, "Identidade: escolha uma raça.");
  else if (!obterRaca(ficha.racaId)) adicionar(erros, "Identidade: raça desconhecida.");
  if (!ficha.classeId) adicionar(pendencias, "Identidade: escolha uma classe principal.");
  if (!ficha.antecedenteId) adicionar(pendencias, "Identidade: escolha um antecedente.");
  else if (!obterAntecedente(ficha.antecedenteId)) adicionar(erros, "Identidade: antecedente desconhecido.");
  for (const pendencia of escolhasObrigatoriasCriacao(ficha)) adicionar(pendencias, pendencia.mensagem);
  const escolhasClassePendentes = pendenciasEscolhasClasses(ficha);
  if (ficha.perfilEscolhasClasse === "me-02b") {
    for (const pendencia of escolhasClassePendentes) adicionar(pendencias, pendencia);
  } else if (escolhasClassePendentes.length) {
    adicionar(avisos, "Classes: ficha anterior ao perfil ME-02B; confira as escolhas de classe dos níveis 1–5.");
  }
  const escolhasSubclassePendentes = pendenciasEscolhasSubclasses(ficha);
  if (ficha.perfilEscolhasSubclasse === "me-02c") {
    for (const pendencia of escolhasSubclassePendentes) adicionar(pendencias, pendencia);
  } else if (escolhasSubclassePendentes.length) {
    adicionar(avisos, "Subclasses: ficha anterior ao perfil ME-02C; confira as escolhas de subclasse até o nível 10.");
  }
  const atributosBase = Object.values(ficha.atributos ?? {}).map(Number);
  if (ficha.metodoAtributos === "arranjo-padrao") {
    const esperado = [15, 14, 13, 12, 10, 8].sort((a, b) => a - b).join(",");
    if (atributosBase.sort((a, b) => a - b).join(",") !== esperado) adicionar(erros, "Atributos: o arranjo padrão deve usar 15, 14, 13, 12, 10 e 8 uma vez cada.");
  }
  const racaAtual = obterRaca(ficha.racaId);
  if (racaAtual?.requerSubraca && !ficha.subracaId) {
    adicionar(pendencias, "Raça: escolha uma sub-raça.");
  } else if (ficha.subracaId && !obterSubraca(ficha.subracaId)) {
    adicionar(erros, "Raça: sub-raça desconhecida.");
  } else if (ficha.subracaId && !subracaValidaParaRaca(ficha.racaId, ficha.subracaId)) {
    adicionar(erros, "Raça: a sub-raça escolhida pertence a outra raça.");
  }
  if (racaAtual?.ancestralidadesDraconicas?.length) {
    const ancestralidadeId = ficha.escolhasRaciais?.ancestralidadeDraconicaId;
    if (!ancestralidadeId) adicionar(pendencias, "Raça: escolha a ancestralidade dracônica.");
    else if (!racaAtual.ancestralidadesDraconicas.some((item) => item.id === ancestralidadeId)) {
      adicionar(erros, "Raça: ancestralidade dracônica desconhecida.");
    }
  }
  if (racaAtual?.atributosEscolhaLivre) {
    const escolhidos = (ficha.bonusRacialEscolhido ?? []).filter(Boolean);
    if (new Set(escolhidos).size !== escolhidos.length || escolhidos.length !== racaAtual.atributosEscolhaLivre) adicionar(pendencias, `Raça: escolha ${racaAtual.atributosEscolhaLivre} atributos raciais diferentes.`);
    if (escolhidos.some((atributo) => racaAtual.bonusAtributos?.[atributo])) adicionar(erros, "Raça: o bônus racial livre não pode repetir um atributo já aumentado pela raça.");
  }

  for (const [atributo, valor] of Object.entries(atributos)) {
    if (!numeroInteiroNoIntervalo(valor, 1, 30)) {
      adicionar(erros, `${atributo}: informe um valor inteiro entre 1 e 30.`);
    } else if (valor > 20) {
      adicionar(
        avisos,
        `${atributo} está acima de 20; confirme uma característica que aumente o máximo desse atributo.`
      );
    }
  }

  const classesComNivel = [
    {
      classeId: ficha.classeId,
      nivel: ficha.nivel,
      subclasseId: ficha.subclasseId,
      rotulo: "classe principal",
    },
    ...classesSecundarias.map((classe, indice) => ({
      ...classe,
      rotulo: `classe secundária ${indice + 1}`,
    })),
  ];
  const classesVistas = new Set();
  let nivelTotal = 0;

  for (const classe of classesComNivel) {
    if (!classe.classeId) {
      if (classe.rotulo !== "classe principal") {
        adicionar(erros, `${classe.rotulo}: escolha uma classe ou remova esta linha.`);
      }
      continue;
    }

    if (!CLASSES.some((item) => item.id === classe.classeId)) {
      adicionar(erros, `${classe.rotulo}: classe desconhecida.`);
    }
    if (classesVistas.has(classe.classeId)) {
      adicionar(erros, `A classe ${nomeClasse(classe.classeId)} foi incluída mais de uma vez.`);
    }
    classesVistas.add(classe.classeId);

    if (!numeroInteiroNoIntervalo(classe.nivel, 1, NIVEL_MAXIMO_PERSONAGEM)) {
      adicionar(
        erros,
        `${nomeClasse(classe.classeId)}: o nível deve ser um inteiro de 1 a ${NIVEL_MAXIMO_PERSONAGEM}.`
      );
      continue;
    }
    nivelTotal += Number(classe.nivel);
  }

  if (nivelTotal > NIVEL_MAXIMO_PERSONAGEM) {
    adicionar(erros, `O nível total é ${nivelTotal}; o máximo permitido é ${NIVEL_MAXIMO_PERSONAGEM}.`);
  }

  for (const classe of classesComNivel) {
    if (!classe.classeId || !Number.isInteger(Number(classe.nivel))) continue;
    const nivelEscolha = obterNivelEscolhaSubclasse(classe.classeId);
    const subclasse = obterSubclasse(classe.subclasseId);
    if (classe.subclasseId && !subclasse) {
      adicionar(erros, `${nomeClasse(classe.classeId)}: subclasse desconhecida.`);
    } else if (classe.subclasseId && subclasse.classeId !== classe.classeId) {
      adicionar(erros, `${nomeClasse(classe.classeId)}: a subclasse escolhida pertence a outra classe.`);
    } else if (classe.subclasseId && Number(classe.nivel) < subclasse.nivel) {
      adicionar(erros, `${nomeClasse(classe.classeId)}: ${subclasse.nome} exige nível ${subclasse.nivel} nesta classe.`);
    } else if (!classe.subclasseId && Number(classe.nivel) >= nivelEscolha) {
      adicionar(pendencias, `${nomeClasse(classe.classeId)}: escolha uma subclasse (disponível no nível ${nivelEscolha}).`);
    }

    if (!subclasseCompativel(classe.classeId, classe.subclasseId, classe.nivel)) continue;
    const esperadas = obterHabilidadesPorSubclasse(classe.subclasseId).filter(
      (habilidade) => habilidade.nivel <= Number(classe.nivel)
    );
    for (const habilidade of esperadas) {
      const automaticas = (ficha.habilidades ?? []).filter(
        (item) =>
          item.origemId === habilidade.id &&
          item.origemSubclasseId === classe.subclasseId &&
          item.origemClasseId === classe.classeId
      );
      if (automaticas.length === 0) {
        adicionar(avisos, `${nomeClasse(classe.classeId)}: habilidade automática de subclasse ausente: ${habilidade.nome}.`);
      } else if (automaticas.length > 1) {
        adicionar(avisos, `${nomeClasse(classe.classeId)}: habilidade automática de subclasse duplicada: ${habilidade.nome}.`);
      }
    }
  }

  const temMulticlasse = classesSecundarias.some((classe) => classe.classeId);
  if (temMulticlasse && ficha.classeId) {
    for (const classe of classesComNivel.filter((item) => item.classeId)) {
      const requisito = PRE_REQUISITOS_MULTICLASSE[classe.classeId];
      if (requisito && !requisito.atende(atributos)) {
        adicionar(
          erros,
          `Multiclasse em ${nomeClasse(classe.classeId)} requer ${requisito.descricao}.`
        );
      }
    }
  }

  for (const classe of classesSecundarias.filter((item) => item.classeId)) {
    const registro = ficha.proficienciasMulticlasse?.[classe.classeId];
    const regra = obterRegraMulticlasse(classe.classeId);
    if (!registro && regra && Object.keys(regra).length > 0) {
      adicionar(pendencias, `${nomeClasse(classe.classeId)}: proficiências de entrada em multiclasse ainda não foram registradas.`);
      continue;
    }
    for (const pendencia of pendenciasProficienciasMulticlasse(ficha, classe.classeId)) {
      adicionar(pendencias, `${nomeClasse(classe.classeId)}: ${pendencia}`);
    }
    if (registro?.pericias && new Set(registro.pericias).size !== registro.pericias.length) {
      adicionar(avisos, `${nomeClasse(classe.classeId)}: há perícia de multiclasse duplicada.`);
    }
    for (const periciaId of registro?.pericias ?? []) {
      if (!ficha.pericias?.[periciaId]) {
        adicionar(avisos, `${nomeClasse(classe.classeId)}: a perícia de multiclasse escolhida não está marcada na ficha.`);
      }
    }
  }

  for (const [tipo, itens] of [
    ["armas", ficha.proficienciasArmas],
    ["armaduras", ficha.proficienciasArmaduras],
    ["ferramentas", ficha.proficienciasFerramentas],
  ]) {
    if (Array.isArray(itens) && new Set(itens).size !== itens.length) {
      adicionar(avisos, `Há proficiências de ${tipo} duplicadas.`);
    }
  }

  const poolsEsperados = classesComDadosVida(ficha);
  const pools = ficha.dadosVidaPorClasse;
  if (!pools || typeof pools !== "object") {
    adicionar(erros, "Pools de dados de vida ausentes; recarregue a ficha para migrar os dados antigos.");
  } else {
    for (const classe of poolsEsperados) {
      const pool = pools[classe.classeId];
      if (!pool) {
        adicionar(erros, `${classe.nome}: pool de dados de vida ausente.`);
        continue;
      }
      if (Number(pool.dadoVida) !== classe.dadoVida) {
        adicionar(erros, `${classe.nome}: o pool deve usar d${classe.dadoVida}.`);
      }
      if (Number(pool.maximo) !== classe.maximo) {
        adicionar(erros, `${classe.nome}: o máximo de dados de vida deve ser ${classe.maximo}.`);
      }
      if (Number(pool.usados) < 0 || Number(pool.usados) > Number(pool.maximo)) {
        adicionar(erros, `${classe.nome}: dados de vida gastos devem ficar entre 0 e o máximo.`);
      }
    }
    for (const classeId of Object.keys(pools)) {
      if (!poolsEsperados.some((classe) => classe.classeId === classeId)) {
        adicionar(avisos, `Pool de dados de vida associado a classe ausente: ${classeId}.`);
      }
    }
  }

  const classesAtuais = new Set(classesComNivel.map((classe) => classe.classeId).filter(Boolean));
  for (let nivel = 1; nivel <= nivelTotal; nivel += 1) {
    const ganho = Number(ficha.pvPorNivel?.[nivel]);
    const classeOrigemId = ficha.origemClassePvPorNivel?.[nivel];
    if (!Number.isFinite(ganho) || ganho < 1) {
      adicionar(erros, `PV do nível ${nivel}: ganho ausente ou inválido.`);
    }
    if (!classeOrigemId) {
      adicionar(erros, `PV do nível ${nivel}: classe de origem ausente.`);
    } else if (!CLASSES.some((classe) => classe.id === classeOrigemId)) {
      adicionar(erros, `PV do nível ${nivel}: classe de origem inválida.`);
    } else if (!classesAtuais.has(classeOrigemId)) {
      adicionar(erros, `PV do nível ${nivel}: a classe de origem não está mais na ficha.`);
    }
  }

  for (const [nivel, espaco] of Object.entries(ficha.espacosMagia ?? {})) {
    const usados = Number(espaco?.usados);
    const total = Number(espaco?.total);
    if (!Number.isFinite(usados) || !Number.isFinite(total) || usados < 0 || total < 0 || usados > total) {
      adicionar(erros, `Espaços de magia de nível ${nivel}: usos devem ficar entre 0 e o total.`);
    }
  }

  const espacoPacto = ficha.espacosMagiaPacto;
  if (espacoPacto) {
    const usados = Number(espacoPacto.usados);
    const quantidade = Number(espacoPacto.quantidade);
    if (!Number.isFinite(usados) || !Number.isFinite(quantidade) || usados < 0 || quantidade < 0 || usados > quantidade) {
      adicionar(erros, "Espaços de Magia de Pacto: usos devem ficar entre 0 e o total.");
    }
  }

  const nivelMaximoEspaco = nivelMaximoDeEspaco(ficha);
  const contagemMagias = {};
  const possuiClasseConjuradora = classesComNivel.some(
    (classe) => Boolean(tipoConjurador(classe.classeId, classe.subclasseId))
  );
  if ((ficha.magias ?? []).length > 0 && !possuiClasseConjuradora) {
    adicionar(
      avisos,
      "A ficha tem magias, mas não possui uma classe conjuradora; confirme se elas vêm de talento, item ou outra regra."
    );
  }
  const magiasVistas = new Set();
  for (const magia of ficha.magias ?? []) {
    const chaveDuplicacao = `${magia.origemId ?? magia.nome?.trim().toLocaleLowerCase() ?? "sem-id"}|${magia.classeId ?? magia.origemEspecial?.classeId ?? "sem-classe"}|${magia.origemEspecial?.tipo ?? "classe"}|${magia.origemEspecial?.fonteId ?? ""}`;
    if (magiasVistas.has(chaveDuplicacao) && magia.origemEspecial?.tipo !== "item") adicionar(erros, `${magia.nome || "Magia"}: duplicação ilegítima para a mesma origem.`);
    magiasVistas.add(chaveDuplicacao);
    const especial = validarOrigemEspecial(ficha, magia);
    if (especial) {
      adicionar(especial.categoria === "erro" ? erros : especial.categoria === "pendencia" ? pendencias : avisos, especial.mensagem);
    }
    if (magia.origemEspecial?.tipo === "segredos-magicos") {
      const classeSegredo = magia.origemEspecial.classeId;
      contagemMagias[classeSegredo] ??= { truques: 0, conhecidas: 0, preparadas: 0, arcanos: {}, segredosMagicos: 0 };
      contagemMagias[classeSegredo].conhecidas += 1;
      contagemMagias[classeSegredo].segredosMagicos += 1;
    }
    if (magia.origemEspecial || magia.classeId === "especial") continue;
    const catalogo = encontrarMagiaCatalogo(magia);
    const classesAcessiveis = classesQueAcessamNivel(ficha, Number(magia.nivel));
    const classesValidas = catalogo
  ? classesAcessiveis.filter(({ classeId: id }) =>
      magiaPermitidaParaClasse(ficha, catalogo, id)
    )
  : [];

const classeId =
  magia.classeId ||
  (classesValidas.length === 1 ? classesValidas[0].classeId : null);

const excecao =
  catalogo && classeId && classeId !== "especial"
    ? obterExcecaoMagia(ficha, catalogo.id, classeId)
    : null;
    if (!numeroInteiroNoIntervalo(magia.nivel, 0, 9)) {
      adicionar(erros, `${magia.nome || "Magia sem nome"}: informe um nível de magia entre 0 e 9.`);
      continue;
    }
    if (classeId === "especial") {
      if (!magia.fonteEspecial?.trim()) {
        adicionar(
          pendencias,
          `${magia.nome || "Magia sem nome"}: informe qual talento, item ou regra concede esta magia.`
        );
      }
      if (catalogo && Number(magia.nivel) !== catalogo.nivel) {
        adicionar(
          avisos,
          `${magia.nome}: o nível informado difere do catálogo (${catalogo.nivel}).`
        );
      }
      continue;
    }
    if (catalogo && Number(magia.nivel) !== catalogo.nivel) {
      adicionar(avisos, `${magia.nome}: o nível informado difere do catálogo (${catalogo.nivel}).`);
    }
    if (classeId && !classesComNivel.some((item) => item.classeId === classeId)) {
      adicionar(avisos, `${magia.nome}: a classe de origem não está mais na ficha.`);
    } else if (catalogo && classeId && !magiaPermitidaParaClasse(ficha, catalogo, classeId)) {
      adicionar(avisos, `${magia.nome} não pertence à lista de ${nomeClasse(classeId)}; confirme subclasse, Segredos Mágicos ou outra exceção.`);
    } else if (catalogo && !classeId && !classesAcessiveis.some(({ classeId: id }) => magiaPermitidaParaClasse(ficha, catalogo, id))) {
      adicionar(avisos, `${magia.nome} não pertence à lista acessível de nenhuma classe da ficha; confirme subclasse, talento ou outra exceção.`);
    } else if (catalogo && !classeId && classesAcessiveis.length > 1) {
      adicionar(avisos, `${magia.nome}: defina a classe de origem para validar a multiclasse.`);
    }
    const origemAcessivel = classeId
      ? classesAcessiveis.some((item) => item.classeId === classeId)
      : classesAcessiveis.length > 0;
    if (!origemAcessivel) {
      adicionar(
        avisos,
        `${magia.nome || "Magia sem nome"} (nível ${magia.nivel}) não é acessível pelo nível atual da classe de origem; confirme talento, item ou outra regra.`
      );
    } else if (magia.nivel > 0 && magia.nivel > nivelMaximoEspaco && !(classeId === "bruxo" && magia.nivel >= 6)) {
      adicionar(
        avisos,
        `${magia.nome || "Magia sem nome"} é de nível ${magia.nivel}, mas não há espaço disponível desse nível ou maior.`
      );
    }
    if (classeId && classesComNivel.some((item) => item.classeId === classeId)) {
      contagemMagias[classeId] ??= { truques: 0, conhecidas: 0, preparadas: 0, arcanos: {}, segredosMagicos: 0 };
      if (Number(magia.nivel) === 0 && excecao?.tipo !== "concedida") {
        contagemMagias[classeId].truques += 1;
      }
      else if (classeId === "bruxo" && Number(magia.nivel) >= 6) {
        contagemMagias[classeId].arcanos[magia.nivel] = (contagemMagias[classeId].arcanos[magia.nivel] ?? 0) + 1;
      }
      else {
        contagemMagias[classeId].conhecidas += 1;
        if (magia.preparada && excecao?.tipo !== "sempre-preparada") {
          contagemMagias[classeId].preparadas += 1;
        }
      }
    }
  }

  for (const magiaObrigatoria of obterMagiasSemprePreparadas(ficha)) {
    const encontrada = (ficha.magias ?? []).some(
      (magia) =>
        magia.origemId === magiaObrigatoria.magiaId &&
        magia.classeId === magiaObrigatoria.classeId
    );
    if (!encontrada) {
      adicionar(
        avisos,
        `${nomeClasse(magiaObrigatoria.classeId)}: magia sempre preparada da subclasse ausente.`
      );
    }
  }

  for (const classe of classesComNivel) {
    const limites = limitesMagiasDaClasse(
      classe.classeId,
      classe.nivel,
      atributos,
      classe.subclasseId
    );
    const contagem = contagemMagias[classe.classeId];
    if (tipoConjurador(classe.classeId, classe.subclasseId) === "terco") {
      const foraDaEscola = contarMagiasDeQualquerEscola(ficha, classe.classeId);
      const limiteLivre = limiteMagiasDeQualquerEscola(classe.nivel);
      if (foraDaEscola > limiteLivre) {
        adicionar(
          avisos,
          `${nomeClasse(classe.classeId)}: ${foraDaEscola} magias de outras escolas; limite no nível ${classe.nivel}: ${limiteLivre}.`
        );
      }
      if (classe.subclasseId === "trapaceiro-arcano" && Number(classe.nivel) >= 3 &&
          !(ficha.magias ?? []).some((magia) =>
            magia.classeId === "ladino" &&
            (magia.origemId === "maos-magicas" || magia.nome?.trim().toLowerCase() === "mãos mágicas")
          )) {
        adicionar(avisos, "Trapaceiro Arcano: adicione o truque Mãos Mágicas da lista de Mago.");
      }
    }
    if (!limites || !contagem) continue;
    const nome = nomeClasse(classe.classeId);
    if (contagem.truques > limites.truques) {
      adicionar(avisos, `${nome}: ${contagem.truques} truques cadastrados; limite básico no nível ${classe.nivel}: ${limites.truques}.`);
    }
    const segredosAdicionais = Math.min(
      contagem.segredosMagicos ?? 0,
      limiteSegredosMagicosAdicionais(ficha, classe.classeId)
    );
    const conhecidasNoLimite = contagem.conhecidas - segredosAdicionais;
    if (limites.conhecidas !== null && conhecidasNoLimite > limites.conhecidas) {
      adicionar(avisos, `${nome}: ${conhecidasNoLimite} magias conhecidas contam para o limite; máximo básico no nível ${classe.nivel}: ${limites.conhecidas}.`);
    }
    if (limites.preparadas !== null && contagem.preparadas > limites.preparadas) {
      adicionar(avisos, `${nome}: ${contagem.preparadas} magias preparadas; limite básico no nível ${classe.nivel}: ${limites.preparadas} (magias de domínio, círculo ou juramento podem ser extras).`);
    }
    for (const [nivel, quantidade] of Object.entries(contagem.arcanos)) {
      if (quantidade > 1) adicionar(avisos, `${nome}: Arcano Místico permite apenas uma magia do ${nivel}º círculo.`);
    }
  }

  for (const habilidade of ficha.habilidades ?? []) {
    if (habilidade.tipo !== "talento") continue;
    const talento = TALENTOS.find((item) => item.id === habilidade.origemId);
    const requisito = talento?.preRequisito;
    if (requisito?.atributo && atributos[requisito.atributo] < requisito.valorMinimo) {
      adicionar(
        avisos,
        `${talento.nome} requer ${requisito.atributo} ${requisito.valorMinimo}+; a ficha tem ${atributos[requisito.atributo] ?? 0}.`
      );
    }
    if (requisito?.conjurador && !possuiClasseConjuradora) {
      adicionar(avisos, `${talento.nome} requer que o personagem seja conjurador.`);
    }
  }

  const status = ficha.status ?? {};
  if (!Number.isFinite(Number(status.pvMax)) || Number(status.pvMax) < 1) adicionar(erros, "PV máximo deve ser pelo menos 1.");
  if (!Number.isFinite(Number(status.pvAtual)) || Number(status.pvAtual) < 0 || Number(status.pvAtual) > Number(status.pvMax)) {
    adicionar(erros, "PV atual não pode ser maior que o PV máximo.");
  }
  if (!Number.isFinite(Number(status.pvTemp)) || Number(status.pvTemp) < 0) adicionar(erros, "PV temporário não pode ser negativo.");

  const itensSintonizados = contarItensSintonizados(ficha.inventario);
  if (itensSintonizados > LIMITE_SINTONIZACAO) {
    adicionar(
      avisos,
      `Inventário: ${itensSintonizados} itens estão marcados como sintonizados; apenas ${LIMITE_SINTONIZACAO} podem ficar ativos.`
    );
  }
  for (const item of ficha.inventario ?? []) {
    if (item.dadosCatalogoAnteriores) {
      adicionar(
        avisos,
        `Inventário: ${item.nome || "item sem nome"} possui uma versão anterior do catálogo disponível para recuperação.`
      );
    }
  }

  for (const recurso of ficha.recursos ?? []) {
    if (!Number.isFinite(Number(recurso.usosGastos)) || !Number.isFinite(Number(recurso.usosMax)) || Number(recurso.usosGastos) < 0 || Number(recurso.usosGastos) > Number(recurso.usosMax)) {
      adicionar(erros, `${recurso.nome || "Recurso sem nome"}: usos gastos devem ficar entre 0 e o máximo.`);
    }
  }

  const itens = (categoria, lista) => lista.map((mensagem) => ({ categoria, mensagem, secao: secaoDaMensagem(mensagem) }));
  return {
    erros,
    pendencias,
    avisos,
    itens: [...itens("erro", erros), ...itens("pendencia", pendencias), ...itens("aviso", avisos)],
    pronta: erros.length === 0 && pendencias.length === 0,
    estado: erros.length === 0 && pendencias.length === 0 ? "valida" : "bloqueada",
  };
}

export function secaoDaMensagem(mensagem) {
  const texto = mensagem.toLocaleLowerCase();
  if (texto.includes("magia") || texto.includes("arcano") || texto.includes("segredo")) return "magias";
  if (texto.includes("perícia") || texto.includes("idioma") || texto.includes("ferramenta") || texto.includes("proficiência")) return "pericias";
  if (texto.includes("talento") || texto.includes("habilidade")) return "habilidades";
  if (texto.includes("item") || texto.includes("inventário")) return "inventario";
  if (texto.includes("pv") || texto.includes("vida") || texto.includes("recurso") || texto.includes("espaço")) return "combate";
  return "identidade";
}

export function reconciliarEstadoProntidao(ficha, atributosTotais) {
  if (ficha?.estadoFicha !== "pronta") return ficha;
  return validarFicha(ficha, atributosTotais).pronta
    ? ficha
    : { ...ficha, estadoFicha: "rascunho" };
}
